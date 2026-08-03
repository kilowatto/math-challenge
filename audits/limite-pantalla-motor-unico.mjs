#!/usr/bin/env node
// Auditor determinista — una sola tabla de límite de pantalla, la de D-016
//
// Hace cumplir: D-016 (tabla completa por edad), D-053, #266, #267.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// Mismo patrón y misma razón que `audits/tabla-bandas.mjs`, que ya lo escribió
// mejor de lo que se puede volver a escribir: *«el síntoma cuando divergen no es
// un error: es un niño colocado en N4 por el servidor al que la interfaz le
// enseña Nivel 3»*. Aquí es un niño al que el servidor le corta a los 20 minutos
// mientras el control deslizante de su padre le prometió 45.
//
// La tabla de D-016 tiene cinco números por banda y **tres consumidores
// naturales**: el motor, la pantalla del padre (para pintar el rango), y la
// ruta que guarda (para revalidar). Tres copias, tres verdades, y la que se
// aplique depende de por dónde entró el valor.
//
// ─── Cómo comprueba, y por qué de tres formas ─────────────────────────────
//
// D-070: una comprobación que mira el mismo sitio que produce el valor es
// decorativa. Aquí hay tres ejes con fuentes distintas.
//
//   · EL DOCUMENTO — lee la tabla de markdown de D-016 en `docs/decisions.md`
//     y la cruza número por número contra `LIMITES_POR_BANDA`. La banda de cada
//     renglón NO se escribe aquí: sale de la edad del propio renglón pasada por
//     `bandas.ts::temaPorEdad`, así que si mañana la escalera de edades se mueve
//     (D-017), este auditor se mueve con ella en vez de quedarse mintiendo.
//   · LA SEGUNDA DECLARACIÓN — busca en todo el código de producto otra tabla
//     de estos cinco valores. Una sola declaración es la regla; dos son la
//     divergencia esperando fecha.
//   · EL ESQUEMA — `screen_time_settings` no puede traer `DEFAULT` en sus
//     columnas de minutos. La migración 0002 lo dice en su propio comentario
//     («los defaults por edad los pone la aplicación, no el esquema») y la razón
//     es que un `DEFAULT 30` en SQL es un cuarto sitio donde vive la tabla, en
//     un lenguaje donde nadie la va a buscar.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si los minutos de D-016 son pedagógicamente correctos. **No lo son en el
//    sentido de «demostrados»**, y D-016 lo dice de sí misma: solo el tope de
//    60 min para 2-4 años viene de fuente primaria (OMS), y esa franja está por
//    debajo del producto. Todo lo demás es criterio propio. Ver `mc-26`.
//  · Si la pantalla del padre respeta el rango que pide. Eso lo cierra que
//    `minutosDiariosPermitidos` sea la única función que decide, y eso es lo que
//    el eje de la segunda declaración vigila.

import { archivos, leer, informar, SOLO_PRODUCTO, sqlSinComentarios } from "./lib/repo.mjs";
import { LIMITES_POR_BANDA, AVISO_MINUTOS_ANTES, diaEfectivo } from "../packages/motor/src/limite-pantalla.ts";
import { temaPorEdad } from "../packages/motor/src/bandas.ts";
import { diaEfectivo as diaEfectivoDeRacha } from "../packages/motor/src/racha.ts";

const MOTOR = "packages/motor/src/limite-pantalla.ts";

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. El documento manda ───────────────────────────────────────────────────

/**
 * Lee la tabla de D-016: edad → los cinco números.
 *
 * El renglón del adulto («sin límite», con guiones largos en las columnas) se
 * salta solo, porque su primera celda no es un rango de edades numérico. Esa
 * ausencia ES la decisión: sin límite no es una fila de valores infinitos.
 */
function limitesDeD016(texto) {
  const desde = texto.indexOf("## D-016");
  if (desde === -1) return null;
  const hasta = texto.indexOf("## D-017", desde);
  const seccion = texto.slice(desde, hasta === -1 ? undefined : hasta);

  const filas = [];
  const RENGLON =
    /^\|\s*(\d+)\s*-\s*(\d+)\s*\|\s*(\d+)\s*min\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*c\/\s*(\d+)\s*min\s*\|\s*([^|]+?)\s*\|/gm;

  for (const m of seccion.matchAll(RENGLON)) {
    const [, edadMin, , defaultMin, minMin, maxMin, descansoCadaMin, nocturno] = m;
    // «1 h antes de dormir» y «30 min antes» son la misma columna escrita de dos
    // formas. Se normaliza a minutos aquí y no en el motor: el motor guarda
    // números, el documento habla como habla un padre.
    let corte = null;
    const enHoras = /(\d+)\s*h\b/.exec(nocturno);
    const enMinutos = /(\d+)\s*min\b/.exec(nocturno);
    if (enHoras) corte = Number(enHoras[1]) * 60;
    else if (enMinutos) corte = Number(enMinutos[1]);

    filas.push({
      edadMin: Number(edadMin),
      esperado: {
        defaultMin: Number(defaultMin),
        minMin: Number(minMin),
        maxMin: Number(maxMin),
        descansoCadaMin: Number(descansoCadaMin),
        corteNocturnoMinAntes: corte,
      },
      textoNocturno: nocturno,
    });
  }
  return filas;
}

const decisiones = leer("docs/decisions.md") ?? "";
const filas = limitesDeD016(decisiones);
revisados++;

if (filas === null || filas.length === 0) {
  problemas.push(
    "no pude leer la tabla de D-016 en docs/decisions.md. Un auditor que no encuentra su " +
      "fuente aprueba siempre, así que esto es un fallo y no un pase.",
  );
} else {
  const bandasVistas = new Set();
  for (const fila of filas) {
    const banda = temaPorEdad(fila.edadMin);
    bandasVistas.add(banda);
    const codigo = LIMITES_POR_BANDA[banda];
    if (!codigo) {
      problemas.push(
        `D-016 declara un límite para la edad ${fila.edadMin} (banda ${banda}) y ` +
          "`LIMITES_POR_BANDA` no tiene esa fila. Manda el documento.",
      );
      continue;
    }
    if (fila.esperado.corteNocturnoMinAntes === null) {
      problemas.push(
        `D-016, banda ${banda}: no pude leer los minutos del corte nocturno en «${fila.textoNocturno}». ` +
          "Si la redacción cambió, este auditor deja de cruzar esa columna en silencio.",
      );
      continue;
    }
    for (const [clave, valor] of Object.entries(fila.esperado)) {
      if (codigo[clave] !== valor) {
        problemas.push(
          `${banda}.${clave}: el código dice ${codigo[clave]} y D-016 dice ${valor}. ` +
            "Manda el documento. Este auditor no decide cuál tiene razón — dice que difieren " +
            "y para el commit, que es lo único honesto que puede hacer un programa aquí. " +
            "El síntoma de la divergencia no es un error: es un niño al que el servidor corta " +
            "a los 20 minutos mientras el control de su padre prometía 45.",
        );
      }
    }
  }

  for (const banda of Object.keys(LIMITES_POR_BANDA)) {
    if (!bandasVistas.has(banda)) {
      problemas.push(
        `\`LIMITES_POR_BANDA\` tiene la banda ${banda} y D-016 no le da ningún renglón. ` +
          "Una fila inventada es una tabla con dos autores.",
      );
    }
  }

  notas.push(`cruzadas contra D-016: ${filas.length} filas × 5 columnas`);
}

// D-016 escribe el aviso en prosa, no en la tabla, y sin columna por banda.
if (!/aviso a los 5 minutos/i.test(decisiones.slice(decisiones.indexOf("## D-016"), decisiones.indexOf("## D-017")))) {
  problemas.push(
    "D-016 ya no dice «aviso a los 5 minutos» con esas palabras. `AVISO_MINUTOS_ANTES` = " +
      `${AVISO_MINUTOS_ANTES} se quedó sin fuente, y una constante sin fuente es criterio propio ` +
      "sin marcar.",
  );
}

// ─── 2. Una sola declaración, y un solo calendario ───────────────────────────

/** Una segunda tabla de límites, escrita con cualquiera de sus nombres. */
const DECLARA_LIMITES =
  /(?<![A-Za-z0-9])(LIMITES?_POR_BANDA|SCREEN_?TIME_?LIMITS?|LIMITES?_?DE_?PANTALLA|MINUTOS_?POR_?BANDA)\w*\s*(?::[^=]*)?=\s*[[{]/;

/** Los nombres de las cinco columnas. Dos de ellos juntos ya son la tabla copiada. */
const COLUMNAS = /(defaultMin|minMin|maxMin|descansoCadaMin|corteNocturnoMinAntes)/g;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/).filter((f) => SOLO_PRODUCTO.test(f));
const declaradores = [];

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  revisados++;
  if (archivo === MOTOR) continue;

  if (DECLARA_LIMITES.test(texto)) declaradores.push(archivo);

  const columnas = new Set((texto.match(COLUMNAS) ?? []));
  if (columnas.size >= 3 && !texto.includes("limite-pantalla.ts")) {
    problemas.push(
      `${archivo}: nombra ${columnas.size} de las cinco columnas de D-016 (${[...columnas].join(", ")}) ` +
        `y no importa de \`${MOTOR}\`. Si es una copia de la tabla, divergirá; si es un consumidor, ` +
        "tiene que importar `LIMITES_POR_BANDA` y no volver a escribirla.",
    );
  }
}

if (declaradores.length > 0) {
  problemas.push(
    `${declaradores.length} archivo(s) declaran una segunda tabla de límite de pantalla ` +
      `(${declaradores.join(", ")}). D-016 describe UNA, y vive en ${MOTOR}.`,
  );
}

// Un segundo `diaEfectivo` sería un segundo calendario: el límite y la racha
// dejarían de estar de acuerdo sobre qué día es hoy, y el corte podría cerrar
// un día que la racha todavía cree que es el anterior.
revisados++;
if (diaEfectivo !== diaEfectivoDeRacha) {
  problemas.push(
    `${MOTOR} reexporta un \`diaEfectivo\` que NO es el de racha.ts. Dos calendarios distintos ` +
      "para el mismo hogar: el corte cerraría un día que la racha todavía cree que es el anterior, " +
      "y eso es exactamente lo que la línea roja #6 no puede permitirse.",
  );
}

// ─── 3. El esquema no guarda la tabla ────────────────────────────────────────

const MINUTOS_DE_CONFIG = /(daily_minutes|break_every_min|bedtime_cutoff_min)[^,\n]*\bDEFAULT\b/i;

for (const archivo of archivos(/\.sql$/).filter((f) => f.startsWith("migrations/"))) {
  const sql = sqlSinComentarios(leer(archivo) ?? "");
  revisados++;
  if (MINUTOS_DE_CONFIG.test(sql)) {
    problemas.push(
      `${archivo}: una columna de minutos de \`screen_time_settings\` trae DEFAULT. ` +
        "La migración 0002 lo dice en su propio comentario: «los defaults por edad los pone la " +
        "aplicación, no el esquema», porque la tabla de D-016 es criterio nuestro y no ciencia. " +
        "Un DEFAULT aquí es un cuarto sitio donde vive esa tabla, en un lenguaje donde nadie la busca.",
    );
  }
}

notas.push(declaradores.length === 0 ? `una sola tabla de límites: ${MOTOR}` : "");
notas.push("un solo calendario: `diaEfectivo` vive en tiempo-local.ts (#268) y racha.ts y limite-pantalla.ts lo reexportan, no se copia");
notas.push("D-016 sobre sí misma: solo el tope de 60 min a 2-4 años es de fuente primaria; el resto es criterio propio");

informar({
  nombre: "limite-pantalla-motor-unico",
  problemas,
  notas: notas.filter(Boolean),
  cita: "D-016, D-017, #266, #267, mc-26",
  revisados,
  resumen: `${revisados} archivo(s) de producto, esquema y la tabla de D-016`,
  porQueBloquea:
    "dos tablas de límite divergentes no producen un error: producen un niño al que el " +
    "servidor corta a los 20 minutos mientras el control de su padre prometía 45.",
  noComprueba: [
    "si los minutos de D-016 son los correctos. No están demostrados y la propia decisión lo " +
      "dice: de los 5 años en adelante ninguna autoridad publica una cifra (mc-26).",
    "si la pantalla del padre respeta el rango. Eso lo cierra que `minutosDiariosPermitidos` sea " +
      "la única función que decide, que es lo que vigila el eje de la segunda declaración.",
  ],
});
