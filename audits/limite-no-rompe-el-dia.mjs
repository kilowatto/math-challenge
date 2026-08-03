#!/usr/bin/env node
// Auditor determinista — cuando el límite corta, el día se da por cumplido
//
// Hace cumplir: línea roja #6, línea roja #1, línea roja #7, D-014, D-016,
// D-024, #202, #271, #272.
//
// ─── Por qué existe, y por qué NO es el mismo que racha-limite-no-rompe ───
//
// `audits/racha-limite-no-rompe.mjs` vigila el extremo de la RACHA: que el
// motivo del corte no entre en la aritmética, y que ninguna ruta reinicie la
// racha cuando el corte fue del límite. Su propio texto declara lo que no
// puede ver:
//
//     «Que la ruta de cierre de sesión llame a `registrarDia` SIEMPRE. Aquí se
//      caza el reinicio explícito, no la omisión silenciosa.»
//
// Este auditor es el otro extremo del mismo cable, el del LÍMITE. La forma en
// que un niño pierde su día no es un `current_streak = 0` que se pueda buscar:
// es un camino de cierre que sencillamente no produce el motivo, y entonces
// nadie llama a la racha. Un `null` de más, y el día no ocurrió.
//
// ─── Los cuatro ejes, y por qué no comparten fuente (D-070) ──────────────
//
//   1. DINÁMICO — **ejecuta** `diaCumplidoPorCorte()` para los dos motivos de
//      cierre y lo mete en `registrarDia()` sobre un barrido de estados de
//      racha. Exige tres cosas: que siempre haya motivo (nunca `null`), que sea
//      el del límite, y que el estado resultante sea IDÉNTICO al de un reto
//      completado. Es la línea roja #6 medida, no descrita.
//   2. EL GRAFO — el motor del límite no puede nombrar ninguna columna de
//      `child_streak` ni llamar a ninguna función que la mueva. No es
//      pedantería de capas: es que un `if` sobre `current_streak` dentro del
//      límite es exactamente la rama que después se escribe mal.
//   3. LA OMISIÓN — cualquier archivo que cierre por límite **y además escriba
//      en D1** tiene que nombrar el motivo de racha. Es el eje que
//      `racha-limite-no-rompe` declara que no puede ver, y el que morderá a
//      quien cablee la ruta de cierre.
//   4. EL CASTIGO — el corte termina la sesión y nada más. Ni cronómetro que
//      bloquee el botón de seguir (#271, D-024, `mc-21`: los cronómetros
//      encendidos por defecto son un antipatrón), ni pantalla completa forzada,
//      ni bloqueo del navegador (línea roja #1, que para un menor no admite
//      excepción). Y el copy de la despedida se pasa por el léxico por locale
//      que F7 ya autoró, porque «ya jugaste demasiado» es la línea roja #7 rota
//      sin una sola palabra técnica.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Una construcción de vergüenza que no esté en el léxico. «Mañana intenta
//    portarte mejor con el tiempo» no contiene ninguna. Es un cable trampa, no
//    un juez: el hueco lo cubren la revisión humana por locale (D-022) y la
//    flota adversarial.
//  · Que la pantalla de despedida se PINTE sin candado. Aquí se mira el texto y
//    el código; el ícono se ve mirando la pantalla.
//  · Si el límite de pantalla está bien puesto. Eso es `limite-pantalla-motor-unico`.
//  · La categoría `urgencia` del léxico de racha, que a propósito NO se aplica
//    aquí — ver la nota junto a `CATEGORIAS_APLICADAS`.

import { readFileSync, existsSync } from "node:fs";
import {
  archivos, leer, informar, sinComentarios, palabra, existe, RAIZ, conFronteraUnicode,
} from "./lib/repo.mjs";
import { diaCumplidoPorCorte } from "../packages/motor/src/limite-pantalla.ts";
import { ESTADO_INICIAL, registrarDia } from "../packages/motor/src/racha.ts";

const MOTOR = "packages/motor/src/limite-pantalla.ts";
const DIR_TEXTOS = "apps/web/src/i18n/limite-pantalla";
const DIR_LEXICO = "audits/lib/racha-lexico";
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const MOTIVO_LIMITE = "LIMITE_DE_PANTALLA_CORTO_LA_SESION";
const CIERRES = ["DAILY_LIMIT", "BEDTIME"];

/**
 * Del léxico de racha se aplican dos categorías de las tres, y la que falta es
 * una decisión escrita, no un olvido.
 *
 * `urgencia` marca «only 5 minutes left» y sus hermanas en los siete locales —
 * y **D-016 exige textualmente un aviso a los 5 minutos**. Aplicarla aquí haría
 * que el auditor bloqueara la decisión que hace cumplir, que es la forma más
 * tonta de que una regla se apague. Y la diferencia no es una excusa: la
 * urgencia que la FTC nombra es la FABRICADA por el producto para que no te
 * vayas; ésta es el aviso de que el límite que puso tu padre está por llegar, y
 * existe para que el corte no sea una sorpresa.
 */
const CATEGORIAS_APLICADAS = ["perdida", "comparacion"];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. Dinámico: el corte SIEMPRE produce un día cumplido ───────────────────

if (!existe(MOTOR)) {
  problemas.push(`${MOTOR} no existe. Este auditor lo ejecuta, así que sin él no comprueba nada.`);
} else {
  revisados++;
  let combinaciones = 0;
  let rotas = 0;

  for (const cierre of CIERRES) {
    const motivo = diaCumplidoPorCorte(cierre);

    if (motivo === null || motivo === undefined) {
      problemas.push(
        `${MOTOR}: \`diaCumplidoPorCorte("${cierre}")\` devolvió ${motivo}. Ése es el camino donde ` +
          "el corte deja al niño SIN SU DÍA: sin motivo, quien cierra la sesión no llama a la " +
          "racha, y el contador amanece en 1 sin que nadie haya escrito un reinicio. D-014, " +
          "textual: «si el límite de pantalla corta la sesión, la racha del día se da por cumplida».",
      );
      continue;
    }
    if (motivo.tipo !== MOTIVO_LIMITE) {
      problemas.push(
        `${MOTOR}: \`diaCumplidoPorCorte("${cierre}")\` devolvió el motivo \`${motivo.tipo}\` y ` +
          `\`racha.ts\` espera \`${MOTIVO_LIMITE}\`. Un motivo que la racha no conoce es un día ` +
          "que no se registra.",
      );
      continue;
    }

    for (const current_streak of [0, 1, 2, 6, 7, 13, 14, 40, 365]) {
      for (const shields_available of [0, 1, 2]) {
        for (const dia of ["2026-08-02", "2026-08-03", "2026-08-05", "2026-08-20"]) {
          combinaciones++;
          const base = {
            ...ESTADO_INICIAL,
            current_streak,
            max_streak: current_streak,
            last_completed_local_date: "2026-08-02",
            shields_available,
            shields_earned_total: shields_available,
          };
          const porLimite = JSON.stringify(registrarDia(base, dia, motivo));
          const porReto = JSON.stringify(registrarDia(base, dia, { tipo: "RETO_COMPLETADO" }));
          if (porLimite !== porReto && rotas++ < 3) {
            problemas.push(
              `${MOTOR}: cortar por ${cierre} NO da el mismo día que terminar el reto. Con racha ` +
                `${current_streak}, ${shields_available} escudo(s) y el día ${dia}: ` +
                `${porLimite} vs ${porReto}. Línea roja #6.`,
            );
          }
        }
      }
    }
  }
  notas.push(`ejecutado: ${combinaciones} estados × ${CIERRES.length} motivos de cierre, todos con día cumplido`);
}

// ─── 2. El grafo: el límite no toca el contador de la racha ─────────────────

/** Las columnas y las funciones que MUEVEN una racha. */
const TOCA_RACHA = palabra(
  "current_streak", "max_streak", "shields_available", "shields_earned_total",
  "shields_earned_this_streak", "pause_until_local_date", "pause_uses_this_year",
  "child_streak", "racha_?actual", "rachaActual", "escudos_?disponibles",
  "registrarDia", "ganarEscudos", "declararPausa", "SQL_UPSERT_RACHA",
);

if (existe(MOTOR)) {
  revisados++;
  const texto = sinComentarios(leer(MOTOR) ?? "");
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    if (!TOCA_RACHA.test(lineas[i])) continue;
    problemas.push(
      `${MOTOR}:${i + 1}: el motor del límite toca el contador de la racha — ` +
        `\`${lineas[i].trim().slice(0, 90)}\`. Este archivo produce un HECHO (el corte) y un ` +
        "MOTIVO; la aritmética de la racha es de `racha.ts` y de nadie más. Una rama sobre la " +
        "racha dentro del límite es exactamente la que después se escribe mal, y el síntoma no " +
        "es un error: es un niño al que se le rompió la racha por respetar su límite de pantalla.",
    );
  }
}

// ─── 3. La omisión: quien cierra y escribe en D1, nombra el motivo ──────────

const CIERRA_POR_LIMITE = /\bcerrarPorLimite\s*\(/;
const ESCRIBE_EN_D1 = /\.\s*prepare\s*\(|\bDB\s*\.\s*(?:prepare|batch|exec)\b/;

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/).filter((f) =>
  /^(apps|packages|workers)\//.test(f),
)) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (!CIERRA_POR_LIMITE.test(texto) || !ESCRIBE_EN_D1.test(texto)) continue;
  if (texto.includes(MOTIVO_LIMITE) || /\bdiaCumplidoPorCorte\b/.test(texto)) continue;

  problemas.push(
    `${archivo}: cierra por el límite de pantalla y escribe en D1, y no nombra ` +
      `\`${MOTIVO_LIMITE}\` ni \`diaCumplidoPorCorte\`. Es la omisión silenciosa que ` +
      "`racha-limite-no-rompe` declara que no puede ver: nadie reinicia la racha, sencillamente " +
      "nadie la registra, y el día del niño no ocurrió. D-014: «la racha del día se da por cumplida».",
  );
}

// ─── 4. El castigo: ni cronómetro, ni pantalla bloqueada, ni vergüenza ──────

/** Un temporizador que convierta el descanso en una espera obligatoria (#271). */
const CRONOMETRO = palabra(
  "setTimeout", "setInterval", "countdown", "cuenta_?regresiva", "segundos_?de_?espera",
  "espera_?obligatoria", "cooldown", "lockout", "tiempo_?de_?espera",
);

/** Secuestrar el aparato de un menor. Línea roja #1, sin excepción. */
const SECUESTRA = palabra(
  "requestFullscreen", "webkitRequestFullScreen", "exitPointerLock", "requestPointerLock",
  "beforeunload", "onbeforeunload", "wakeLock", "screen_?lock", "kiosk",
  "getUserMedia", "MediaDevices", "SpeechRecognition",
);

for (const archivo of [MOTOR, "packages/motor/src/sesion.ts"]) {
  if (!existe(archivo)) continue;
  revisados++;
  const texto = sinComentarios(leer(archivo) ?? "");
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    if (CRONOMETRO.test(lineas[i])) {
      problemas.push(
        `${archivo}:${i + 1}: un temporizador en el camino del límite — ` +
          `\`${lineas[i].trim().slice(0, 80)}\`. #271, textual: «sin bloqueo cronometrado». El ` +
          "descanso se OFRECE con su botón disponible de inmediato; forzar una espera de N " +
          "segundos convierte una pausa saludable en la fricción punitiva que D-016 evita, y " +
          "`mc-21` marca los cronómetros encendidos por defecto como antipatrón. Además, la " +
          "heurística 20-20-20 en la que se apoya el descanso NO está validada por ensayo " +
          "(`mc-26` implicación #6): cobrarle al niño una espera por una heurística sin ensayo " +
          "es cobrarle nuestra incertidumbre.",
      );
    }
    if (SECUESTRA.test(lineas[i])) {
      problemas.push(
        `${archivo}:${i + 1}: el camino del límite secuestra el aparato — ` +
          `\`${lineas[i].trim().slice(0, 80)}\`. Línea roja #1: nunca navegador bloqueado para un ` +
          "menor, en ninguna banda y en ningún nivel. El corte suave de D-016 deja de servir " +
          "ítems y ya; no impide cerrar la pestaña.",
      );
    }
  }
}

// El copy, contra el léxico por locale que F7 ya autoró. Se reusa en vez de
// escribir un octavo léxico: lo que se prohíbe es una CONSTRUCCIÓN, y las
// construcciones no se traducen — pero tampoco hacen falta dos veces.
if (!existsSync(`${RAIZ}${DIR_TEXTOS}`)) {
  problemas.push(
    `${DIR_TEXTOS} no existe. El aviso, el descanso y la despedida se autoran por locale ` +
      "(D-022); sin ese directorio este auditor mira el vacío.",
  );
} else {
  let llavesBase = null;
  for (const loc of LOCALES) {
    const rutaTexto = `${RAIZ}${DIR_TEXTOS}/${loc}.json`;
    if (!existsSync(rutaTexto)) {
      problemas.push(`falta ${DIR_TEXTOS}/${loc}.json. Un locale sin texto cae al de otro idioma (D-022).`);
      continue;
    }
    revisados++;
    let textos;
    try {
      textos = JSON.parse(readFileSync(rutaTexto, "utf8"));
    } catch (e) {
      problemas.push(`${DIR_TEXTOS}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
      continue;
    }

    const llaves = Object.keys(textos).sort();
    if (llavesBase === null) llavesBase = llaves;
    else if (llaves.join("|") !== llavesBase.join("|")) {
      const faltan = llavesBase.filter((k) => !llaves.includes(k));
      const sobran = llaves.filter((k) => !llavesBase.includes(k));
      problemas.push(
        `${DIR_TEXTOS}/${loc}.json no tiene las mismas llaves que en.json` +
          (faltan.length ? ` — faltan: ${faltan.join(", ")}` : "") +
          (sobran.length ? ` — sobran: ${sobran.join(", ")}` : "") +
          ". Una llave ausente se pinta vacía en la pantalla de un niño.",
      );
    }

    // KINDER no lee (mc-20): ninguna cadena de kinder puede llevar cifra.
    for (const [llave, valor] of Object.entries(textos)) {
      if (llave.startsWith("_") || typeof valor !== "string") continue;
      if (/kinder/i.test(llave) && /\d/.test(valor)) {
        problemas.push(
          `${DIR_TEXTOS}/${loc}.json: «${llave}» lleva una cifra — «${valor}». El niño de kinder ` +
            "no lee (mc-20), y un número en su pantalla es además el reloj que D-024 y D-045 " +
            "prohíben en esa banda.",
        );
      }
    }

    // El léxico de vergüenza y comparación, autorado por locale.
    const rutaLexico = `${RAIZ}${DIR_LEXICO}/${loc}.json`;
    if (!existsSync(rutaLexico)) {
      problemas.push(`falta ${DIR_LEXICO}/${loc}.json: sin lista, este locale pasa sin que nadie lo mire.`);
      continue;
    }
    const lexico = JSON.parse(readFileSync(rutaLexico, "utf8")).construcciones ?? [];
    for (const construccion of lexico) {
      if (!CATEGORIAS_APLICADAS.includes(construccion.categoria)) continue;
      // `conFronteraUnicode` porque `\b` de JavaScript solo conoce ASCII: sin
      // esta reparación, «Se acabó la racha» pasa de largo y solo se caza «Se
      // acabo la racha», que nadie escribe. Se descubrió aquí, con el control
      // negativo de este mismo auditor en verde y la violación delante — y el
      // mismo agujero estaba abierto en `racha-lexico`, que ahora lo repara
      // igual. Ver `lib/repo.mjs`.
      const re = new RegExp(conFronteraUnicode(construccion.patron), "iu");
      for (const [llave, valor] of Object.entries(textos)) {
        if (llave.startsWith("_") || typeof valor !== "string") continue;
        if (!re.test(valor)) continue;
        problemas.push(
          `${DIR_TEXTOS}/${loc}.json: «${llave}» usa una construcción de ${construccion.categoria} ` +
            `— «${valor}». ${construccion.porque}. Línea roja #7: Larry nunca avergüenza, y la ` +
            "despedida del límite es justo donde un «ya jugaste demasiado» se cuela sin que nadie " +
            "lo llame así. `mc-26` §7: Orben & Przybylski miden como máximo 0.4% de la varianza de " +
            "bienestar explicada por el tiempo de pantalla — el copy no puede insinuar un daño que " +
            "la evidencia no sostiene.",
        );
      }
    }
  }
  notas.push(`copy revisado en ${LOCALES.length} locales contra el léxico de ${CATEGORIAS_APLICADAS.join(" y ")}`);
}

notas.push("la categoría `urgencia` NO se aplica aquí a propósito: D-016 exige el aviso a los 5 minutos");
notas.push("D-014: «si el límite de pantalla corta la sesión, la racha del día se da por cumplida»");

informar({
  nombre: "limite-no-rompe-el-dia",
  problemas,
  notas,
  cita: "líneas rojas #1, #6 y #7, D-014, D-016, D-024, #202, #271, #272, mc-21, mc-26",
  revisados,
  resumen: `${revisados} archivo(s), y el corte ejecutado a través del motor de racha`,
  porQueBloquea:
    "un día que el límite cerró y que la racha no contó es el defecto que pone al producto en " +
    "contra del padre que puso el límite, y no da ningún error: se descubre semanas después.",
  noComprueba: [
    "una construcción de vergüenza que no esté en el léxico. Es un cable trampa, no un juez: el " +
      "hueco lo cubren la revisión humana por locale (D-022) y la flota adversarial.",
    "que la pantalla de despedida se PINTE sin candado. Aquí se mira el texto y el código.",
    "si el límite en sí está bien puesto — eso es `limite-pantalla-motor-unico`.",
  ],
});
