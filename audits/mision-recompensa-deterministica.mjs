#!/usr/bin/env node
// Auditor determinista — una misión se gana, no se compra y no se sortea
//
// Hace cumplir: líneas rojas #4 y #5, D-014, #211, #216, #219, #225, mc-17
// (implicación de diseño 3), mc-43 (hallazgo 5).
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-014 pone «misiones diarias» en la columna del SÍ y «recompensas aleatorias
// de pago» en la del NO. La letra de esa prohibición tiene una rendija —dice *de
// pago*— y este subsistema la cierra por escrito:
//
//   · `mc-17` (implicación de diseño 3) y `mc-43` (hallazgo 5) son explícitos en
//     que el mecanismo dañino —el refuerzo de razón variable— **no necesita
//     dinero para funcionar sobre un niño**. Bélgica y Países Bajos declararon
//     juego ilegal a la versión pagada de las cajas de botín en 2018; lo que
//     declararon ilegal fue que fueran aleatorias, no que fueran de pago.
//   · Y la línea roja #4 cierra la otra mitad: **nunca se cobra por dejar que un
//     niño practique**, así que ninguna misión puede estar detrás de un pago.
//
// Las dos se rompen igual: sin mala intención y en una línea. El precio llega
// como una columna «por si acaso» en la migración; el azar llega como un
// desempate «que da igual» entre dos tipos igual de elegibles, o como una
// «sorpresa» de producto que suma entre 10 y 30 XP en vez de 20.
//
// ─── Cómo comprueba, y por qué de tres formas ─────────────────────────────
//
// D-070: una comprobación que el código vigilado satisface por construcción es
// decorativa. Por eso hay tres ejes independientes.
//
//   · ESTÁTICO — lee los archivos del camino de misión: fuentes de entropía,
//     lecturas del reloj, vocabulario de precio, metáforas de cofre.
//   · ESQUEMA — cruza los diez tipos del catálogo del MÓDULO contra el `CHECK`
//     de la migración. Que sean dos fuentes independientes es el punto: si el
//     SQL admite un tipo que el módulo no conoce, existiría en la base una
//     misión que nadie puede completar y que nadie sabe que no puede
//     completarse.
//   · DINÁMICO — **ejecuta** el motor. La misma tupla `(perfil, día, banda,
//     resúmenes)` 64 veces, y el XP de cada misión contra la tabla publicada de
//     `xp.ts`. Un `Math.random()` detrás de un `eval`, un `Set` iterado por
//     orden de inserción o un desempate por `Date.now()` no se ven en un grep y
//     sí se ven aquí.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Los archivos `*.prueba.mjs` quedan FUERA del escaneo de vocabulario, a
//    propósito: una prueba que comprueba que no hay precios tiene que poder
//    escribir la palabra «precio». Un `Math.random` dentro de una prueba no lo
//    caza este auditor — lo caza el eje dinámico, que ejecuta el módulo real.
//  · Si 15 XP es un buen número para `volumen`. No lo es ni deja de serlo: no
//    hay datos de producción, y la tabla lleva escrito su `[criterio propio]`.
//  · Si una pantalla anuncia una misión con lenguaje de escasez o de urgencia.
//    Eso es léxico y le toca a la flota adversarial.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";
import {
  TIPOS_DE_MISION,
  CATALOGO,
  CLAVE_XP_DIA_COMPLETO,
  BONO_DIA_COMPLETO,
  claveDeXp,
  elegirMisionesDelDia,
  cierreDelDia,
} from "../packages/motor/src/misiones.ts";
import { XP_POR_TIPO, xpDeTipo } from "../packages/motor/src/xp.ts";

const MODULO = "packages/motor/src/misiones.ts";

const AZAR = /(Math\s*\.\s*random|crypto\s*\.\s*getRandomValues|getRandomValues\s*\(|Math\s*\.\s*floor\s*\(\s*Math)/;
// El reloj es entropía con otro nombre: dos llamadas el mismo día darían dos
// menús distintos, y «reproducible desde (perfil, día)» sería una frase bonita.
const RELOJ = /(Date\s*\.\s*now|performance\s*\.\s*now|new\s+Date\s*\(\s*\)|Date\s*\.\s*UTC)/;
const PRECIO = palabra(
  "price", "precio", "cost", "costo", "coste", "moneda", "currency",
  "gems", "gemas", "lingots", "coins", "monedas", "amount_cents", "sku",
  "suscripcion", "subscription", "paywall", "de_pago",
);
const AZAR_EN_ESQUEMA = palabra(
  "probabilidad", "probability", "rarity", "rareza", "chance", "drop_rate",
  "weight_random", "roll", "tirada",
);
// La metáfora, aunque el contenido sea conocido de antemano. Un cofre que se
// abre sugiere sorpresa, y `mc-17` §7 documenta que el radio de la historia
// regulatoria alcanza a lo gratuito cuando usa la sorpresa para enganchar.
const COFRE = palabra("cofre", "chest", "loot", "lootbox", "gacha", "mystery", "misterio", "ruleta", "spin");

const TABLA_MISION = /\bmission_daily_summary\b|\bmission_[a-z_]+\b/;

const problemas = [];
const notas = [];
let revisados = 0;

if (!existe(MODULO)) {
  problemas.push(
    `${MODULO} no existe. Este auditor importa el módulo para ejecutarlo, así que sin él no ` +
      "comprueba nada — y «no comprobé» nunca puede leerse como «está bien».",
  );
}

// ─── 1. El camino de misión: sin azar, sin reloj, sin precio, sin cofre ──────

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/).filter((f) => /^(apps|packages|workers)\//.test(f));

for (const archivo of fuentes) {
  const crudo = leer(archivo) ?? "";
  revisados++;
  // Una prueba que comprueba que no hay precios tiene que poder escribir la
  // palabra «precio». Ver la nota de LO QUE NO PUEDE VER.
  if (/\.prueba\./.test(archivo)) continue;
  const texto = sinComentarios(crudo);

  const enElCamino =
    archivo === MODULO ||
    /(^|\/)mision[a-z-]*\.(ts|tsx|js|mjs)$/i.test(archivo) ||
    TABLA_MISION.test(texto) ||
    /\belegirMisionesDelDia\b|\bavanzarMision\b|\bcierreDelDia\b/.test(texto);

  if (!enElCamino) continue;

  const lineas = texto.split("\n");
  const donde = (re) => lineas.findIndex((l) => re.test(l)) + 1;

  if (AZAR.test(texto)) {
    problemas.push(
      `${archivo}:${donde(AZAR)}: hay azar en el camino que otorga una misión. Línea roja #5 y ` +
        "#216: la selección tiene que ser reproducible desde `(perfil, día)`, y la recompensa " +
        "fija y publicada. `mc-17` (implicación 3) y `mc-43` (hallazgo 5): el refuerzo de razón " +
        "variable no necesita dinero para dañar a un niño.",
    );
  }

  if (RELOJ.test(texto)) {
    problemas.push(
      `${archivo}:${donde(RELOJ)}: el camino de misión lee el reloj. El día LOCAL del hogar lo ` +
        "calcula `racha.ts::diaEfectivo()`, que es la única puerta entre un instante y un día, y " +
        "llega ya calculado. Un reloj aquí es entropía con otro nombre: dos llamadas el mismo día " +
        "darían dos menús distintos.",
    );
  }

  if (PRECIO.test(texto)) {
    problemas.push(
      `${archivo}:${donde(PRECIO)}: aparece vocabulario de precio, moneda o suscripción en el ` +
        "camino de una misión. Línea roja #4: nunca se cobra por dejar que un niño practique, " +
        "así que ninguna misión puede estar detrás de un pago.",
    );
  }

  if (COFRE.test(texto)) {
    problemas.push(
      `${archivo}:${donde(COFRE)}: metáfora de cofre, caja o sorpresa en el camino de una misión. ` +
        "Aunque el contenido sea conocido de antemano, un cofre que se abre sugiere sorpresa, y " +
        "`mc-17` §7 documenta que el radio de las cajas de botín alcanza a lo gratuito cuando usa " +
        "la aleatorización para enganchar. El bono de cierre se muestra como una suma directa.",
    );
  }
}

// ─── 2. El esquema: ni precio, ni azar, y los diez tipos que el módulo conoce ─

const sql = archivos(/\.sql$/);
let tiposEnEsquema = null;

for (const archivo of sql) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (!TABLA_MISION.test(texto)) continue;

  for (const bloque of texto.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)\s*\(([\s\S]*?)\n\s*\)\s*;/gi,
  )) {
    const [, tabla, cuerpo] = bloque;
    if (!TABLA_MISION.test(tabla)) continue;

    for (const renglon of cuerpo.split("\n")) {
      const col = renglon.trim().split(/\s+/)[0]?.replace(/[",`]/g, "") ?? "";
      if (!col || /^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)$/i.test(col)) continue;
      if (PRECIO.test(col)) {
        problemas.push(
          `${archivo}: la tabla \`${tabla}\` tiene la columna \`${col}\`, que nombra un precio o ` +
            "una moneda. Línea roja #4: nunca se cobra por dejar que un niño practique. Una " +
            "columna de precio que hoy nadie cobra es el hueco ya hecho para el día que alguien " +
            "quiera cobrar.",
        );
      }
      if (AZAR_EN_ESQUEMA.test(col)) {
        problemas.push(
          `${archivo}: la tabla \`${tabla}\` tiene la columna \`${col}\`, que nombra una ` +
            "probabilidad, una rareza o una tirada. Línea roja #5: cero azar en el otorgamiento.",
        );
      }
    }

    // El CHECK de `mission_type` contra el catálogo cerrado del módulo. Dos
    // fuentes independientes, que es lo que D-070 pide.
    const check = cuerpo.match(/mission_type[\s\S]*?IN\s*\(([\s\S]*?)\)/i);
    if (check) {
      tiposEnEsquema = check[1]
        .split(",")
        .map((v) => v.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
  }
}

if (tiposEnEsquema === null) {
  notas.push(
    "todavía no hay ninguna tabla de misión con `CHECK (mission_type IN (...))` en las " +
      "migraciones: el cruce módulo↔esquema está listo y hoy no tiene qué mirar",
  );
} else {
  for (const t of tiposEnEsquema) {
    if (!TIPOS_DE_MISION.includes(t)) {
      problemas.push(
        `el esquema acepta \`mission_type = '${t}'\`, que no está en el catálogo cerrado de ` +
          `${MODULO} (${TIPOS_DE_MISION.join(", ")}). Una fila con ese valor existiría en la base ` +
          "y el motor no sabría completarla: una misión que nadie puede cumplir y que nadie sabe " +
          "que no puede cumplirse.",
      );
    }
  }
  for (const t of TIPOS_DE_MISION) {
    if (!tiposEnEsquema.includes(t)) {
      problemas.push(
        `el catálogo declara el tipo \`${t}\` y el esquema no lo acepta. El motor lo asignaría y ` +
          "la escritura reventaría contra el CHECK, con el niño mirando una misión que su " +
          "progreso no puede guardar.",
      );
    }
  }
  notas.push(`esquema ↔ módulo: los ${TIPOS_DE_MISION.length} tipos coinciden en las dos fuentes`);
}

// ─── 3. Se EJECUTA: misma entrada, misma salida, y el XP de la tabla ─────────

if (existe(MODULO)) {
  const F4 = [
    null,
    { habilidadesEnRepaso: [], habilidadesCercaDeDominio: [], habilidadesDominadas: [] },
    { habilidadesEnRepaso: ["K01"], habilidadesCercaDeDominio: ["K02"], habilidadesDominadas: ["K03"] },
  ];
  const LIGAS = [
    { enLiga: false, dueloOptIn: false, metaColectivaHoy: null },
    { enLiga: true, dueloOptIn: true, metaColectivaHoy: { objetivo: 100, llevan: 10 } },
  ];
  const PERFILES = ["p-01", "p-02", "p-03", "adulto-7d1"];
  const DIAS = ["2026-08-02", "2026-08-03", "2026-12-31"];
  const BANDAS = ["PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"];

  let ejecuciones = 0;
  let variaciones = 0;

  for (const perfil of PERFILES) {
    for (const dia of DIAS) {
      for (const banda of BANDAS) {
        for (const f4 of F4) {
          for (const liga of LIGAS) {
            const esperado = JSON.stringify(elegirMisionesDelDia(perfil, dia, banda, f4, liga));
            ejecuciones++;
            for (let v = 0; v < 64; v++) {
              const salida = JSON.stringify(elegirMisionesDelDia(perfil, dia, banda, f4, liga));
              if (salida !== esperado) {
                variaciones++;
                if (variaciones <= 2) {
                  problemas.push(
                    `${MODULO}: la selección NO es determinista. Con (${perfil}, ${dia}, ${banda}) ` +
                      `devolvió ${salida} en vez de ${esperado}. #216: misma tupla de entrada, ` +
                      "misma salida, siempre — si no, no se puede contestar «¿por qué le tocó " +
                      "esta misión a mi hijo?».",
                  );
                }
                break;
              }
            }

            // El XP de cada misión sale de la tabla publicada, no de una tirada.
            for (const m of JSON.parse(esperado)) {
              const publicado = xpDeTipo(claveDeXp(m.tipo));
              if (m.xp !== publicado) {
                problemas.push(
                  `${MODULO}: la misión \`${m.tipo}\` vale ${m.xp} XP y la tabla publicada de ` +
                    `xp.ts dice ${publicado}. Línea roja #5: el jugador tiene que poder saber de ` +
                    "antemano cuánto vale cada cosa, y una tabla que no coincide con lo que el " +
                    "motor da es una caja sorpresa con otro nombre.",
                );
              }
            }
          }
        }
      }
    }
  }

  // El catálogo entero contra la tabla publicada, en las dos direcciones.
  for (const d of CATALOGO) {
    const clave = claveDeXp(d.tipo);
    if (typeof XP_POR_TIPO[clave] !== "number") {
      problemas.push(
        `${MODULO}: el tipo \`${d.tipo}\` no tiene clave \`${clave}\` en la tabla publicada de ` +
          "`xp.ts`. Un tipo sin precio publicado es un premio que nadie puede saber de antemano.",
      );
    } else if (d.xp !== XP_POR_TIPO[clave]) {
      problemas.push(
        `${MODULO}: el catálogo dice ${d.xp} XP para \`${d.tipo}\` y la tabla publicada dice ` +
          `${XP_POR_TIPO[clave]}. Dos copias del mismo número es cómo la pantalla acaba ` +
          "prometiendo un premio que el motor no da (#219).",
      );
    }
  }
  for (const clave of Object.keys(XP_POR_TIPO)) {
    if (!clave.startsWith("mision_")) continue;
    if (clave === CLAVE_XP_DIA_COMPLETO || clave === "mision_semanal") continue;
    const tipo = clave.slice("mision_".length);
    if (!TIPOS_DE_MISION.includes(tipo)) {
      problemas.push(
        `xp.ts publica \`${clave}\` y el catálogo de ${MODULO} no tiene el tipo \`${tipo}\`. Un ` +
          "precio publicado para algo que no se puede jugar es una promesa sin producto detrás.",
      );
    }
  }

  // El bono de cierre: fijo, y solo con el día entero.
  const plan = elegirMisionesDelDia("p-01", "2026-08-02", "PRIMARIA", F4[2], LIGAS[1]);
  const tipos = plan.map((m) => m.tipo);
  const completo = cierreDelDia(plan, tipos);
  const suma = plan.reduce((s, m) => s + m.xp, 0);
  if (completo.xp !== suma + BONO_DIA_COMPLETO) {
    problemas.push(
      `${MODULO}: el cierre del día dio ${completo.xp} XP y la suma publicada más el bono es ` +
        `${suma + BONO_DIA_COMPLETO}. El bono es fijo (#219) y se muestra como una suma directa.`,
    );
  }
  if (cierreDelDia(plan, tipos.slice(0, 1)).diaCompleto !== false) {
    problemas.push(`${MODULO}: una sola misión completada se contó como día completo.`);
  }

  notas.push(`ejecutado: ${ejecuciones} tuplas × 64 repeticiones, salida idéntica las 64 veces`);
  notas.push(
    `tabla publicada: ${TIPOS_DE_MISION.map((t) => `${t}=${xpDeTipo(claveDeXp(t))}`).join(", ")}, ` +
      `bono del día=${BONO_DIA_COMPLETO}`,
  );
}

informar({
  nombre: "mision-recompensa-deterministica",
  problemas,
  notas,
  cita: "líneas rojas #4 y #5, D-014, #211, #216, #219, mc-17 impl. 3, mc-43 hallazgo 5",
  revisados,
  resumen: `${revisados} archivo(s) de producto y esquema, y el motor ejecutado`,
  porQueBloquea:
    "una misión con precio es la barrera de pago que la línea roja #4 prohíbe —nunca se cobra " +
    "por dejar que un niño practique— y una recompensa sorteada es la caja de botín que Bélgica " +
    "y Países Bajos declararon juego ilegal, aunque sea gratis: lo ilegal fue que fuera " +
    "aleatoria, no que fuera de pago (mc-17, mc-43).",
  noComprueba: [
    "los archivos `*.prueba.mjs`, que quedan fuera del escaneo de vocabulario a propósito: una " +
      "prueba que comprueba que no hay precios tiene que poder escribir la palabra «precio».",
    "si 15 XP es un buen número para `volumen`. No hay datos de producción y la tabla lleva " +
      "escrito su `[criterio propio]`; eso se recalibra midiendo, no auditando.",
    "si una pantalla anuncia una misión con lenguaje de escasez. Eso es léxico y le toca a la " +
      "flota adversarial.",
  ],
});
