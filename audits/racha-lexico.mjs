#!/usr/bin/env node
// Auditor determinista — la racha no habla de pérdida, ni de prisa, ni de nadie más
//
// Hace cumplir: D-014 («notificaciones con culpa», extendido a todo copy de
// racha), línea roja #6, D-022, #206, #210.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// `mc-17` §83, en su tabla de líneas rojas, no describe un riesgo abstracto:
// describe la copy que hay que escribir y la que no.
//
//   «Streak framed as a personal-best counter with no penalty language;
//    missing a day simply doesn't advance the counter, no shame copy»
//
// Y nombra las dos categorías que lo rompen, las dos con nombre propio en el
// informe de la FTC de 2022: **confirm-shaming** («no pierdas tu racha») y la
// **urgencia fabricada** («te quedan 3 horas»). `mc-16` documenta el producto
// donde las dos viven: el búho pasivo-agresivo es un algoritmo bandit entrenado
// sobre ~200 millones de recordatorios, y su tono se eligió porque mide mejor.
//
// La tercera categoría, comparación, sale del mismo sitio que ya prohíbe F6 para
// Larry: retroalimentación normativa (Kluger & DeNisi, 607 tamaños de efecto,
// más de un tercio de las intervenciones EMPEORÓ el desempeño).
//
// ─── Por qué el léxico se autora por locale y no se traduce ───────────────
//
// Mismo criterio que `audits/lib/lexico-verguenza/` de F6, por la misma razón
// medida allí: **lo que se prohíbe es una construcción, y las construcciones no
// se traducen.** Una lista global traducida marca texto ya aprobado — en alemán
// «vorbei» aparece en frases perfectamente neutras, y lo que hay que cazar es
// «deine Serie ist vorbei».
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Una construcción que no está en la lista. «Solo te quedan unas horas de tu
//    mejor marca» es urgencia pura y no contiene ninguna. Es un cable trampa, no
//    un juez: el hueco lo cubren la revisión humana por locale (D-022) y la
//    flota adversarial.
//  · El COLOR. Un número en rojo de alarma es lenguaje de pérdida sin una sola
//    palabra, y eso se ve mirando la pantalla. Lo que sí se comprueba aquí es
//    que el componente no traiga una clase de alarma ni un ícono de fuego.
//  · Un push. Todavía no hay ruta de envío; cuando la haya, sus textos caen
//    dentro de este mismo escaneo sin tocar el auditor, porque lo que se escanea
//    es el directorio de textos de racha, no una pantalla concreta.

import { readFileSync, existsSync } from "node:fs";
import { informar, RAIZ, archivos, leer, sinComentarios, conFronteraUnicode } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR_LEXICO = "audits/lib/racha-lexico";

/**
 * Los directorios de texto que este auditor vigila.
 *
 * `liga` entra por **D-081 condición 3**: «sin lenguaje de pérdida en ninguna
 * banda — es la misma regla que la racha (D-014) y le toca a `racha-lexico`
 * extendido, no a la buena voluntad de quien escriba el texto».
 *
 * El mismo léxico sirve para los dos, y no por ahorro: las tres categorías que
 * ya están —pérdida, urgencia, comparación— son exactamente las tres formas en
 * que una liga se estropea. La comparación, además, es el riesgo PROPIO de la
 * liga: «vas atrás», «te van ganando» son retroalimentación normativa, y
 * Kluger & DeNisi midieron que más de un tercio de esas intervenciones empeoró
 * el desempeño.
 */
const DIRS_TEXTOS = [
  ["apps/web/src/i18n/racha", "racha"],
  ["apps/web/src/i18n/liga", "liga y duelo"],
  // F7 #207: las plantillas del recordatorio push al padre. El criterio de
  // aceptación #4 del issue pide que este auditor las escanee también — el
  // destinatario es un adulto, pero la regla que se protege es la misma:
  // «nunca con culpa», y el léxico de pérdida/urgencia/comparación es la
  // forma escrita de esa regla.
  ["apps/web/src/i18n/push", "recordatorio push al padre"],
  // F7 · Misiones diarias (#222, línea roja #7): las mismas tres categorías —
  // pérdida, urgencia, comparación — son exactamente las formas en que una
  // misión se estropea. Un «te quedan dos horas para tu misión» es urgencia
  // fabricada aunque no diga la palabra «racha».
  ["apps/web/src/i18n/misiones", "misiones"],
  // F7 · Pausa familiar (#204, mc-19 rec. #8): la pausa es un derecho de la
  // familia, no una confesión. El destinatario es el padre, pero la regla es
  // la misma de siempre: ni pérdida, ni urgencia, ni comparación — un «no
  // dejes que se rompa del todo» junto al botón de reparar es confirm-shaming
  // con buenas palabras.
  ["apps/web/src/i18n/pausa", "pausa familiar"],
  // F8 · Reportes por correo (#290/#291): el destinatario es el padre y el
  // contenido nombra hijos. Las tres categorías son las mismas que caza el
  // resto del escaneo: un «no pierdas el ritmo» es confirm-shaming aunque lo
  // lea un adulto, y un «tu hijo va detrás» es la comparación que D-025 y
  // mc-18 prohíben por nombre en este subsistema.
  ["apps/web/src/i18n/reportes", "reportes por correo al padre"],
];

const CATEGORIAS = ["perdida", "urgencia", "comparacion"];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. Las listas. Un locale sin lista es un locale sin vigilancia ─────────

const lexico = {};
for (const loc of LOCALES) {
  const ruta = `${RAIZ}${DIR_LEXICO}/${loc}.json`;
  if (!existsSync(ruta)) {
    problemas.push(
      `falta ${DIR_LEXICO}/${loc}.json. Un locale sin lista pasa en verde sin que nadie lo ` +
        "mire, que es peor que bloquear (D-022).",
    );
    continue;
  }
  let datos;
  try {
    datos = JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    problemas.push(`${DIR_LEXICO}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
    continue;
  }
  revisados++;
  const presentes = new Set((datos.construcciones ?? []).map((c) => c.categoria));
  for (const cat of CATEGORIAS) {
    if (!presentes.has(cat)) {
      problemas.push(
        `${DIR_LEXICO}/${loc}.json no cubre la categoría "${cat}". #206 pide las tres mínimas: ` +
          `${CATEGORIAS.join(", ")}.`,
      );
    }
  }
  // `patronUnicode` y NO `new RegExp(c.patron, "iu")`. La diferencia no es de
  // estilo: `\b` de JavaScript solo conoce ASCII, así que
  //
  //     /\bse acab[oó]\b/iu.test("Se acabó la racha")   →  false
  //
  // y las dos formas naturales de decirlo en español pasaban de largo mientras
  // el auditor informaba verde. Lo encontró otro agente el 2026-08-03. Se
  // arregla al COMPILAR, en un solo sitio, en vez de reescribir los `\b` a mano
  // en siete archivos de léxico — siete oportunidades de equivocarse.
  lexico[loc] = (datos.construcciones ?? []).map((c) => ({
    ...c,
    // `conFronteraUnicode` y no `new RegExp(c.patron, "iu")` a secas: `\\b` de
    // JavaScript solo conoce ASCII, así que «Se acabó la racha» y «Se rompió la
    // racha» —las dos formas más naturales de decirlo en español— pasaban de
    // largo, y solo se cazaban las variantes sin acento, que nadie escribe. Se
    // midió construyendo el auditor del límite de pantalla (F8). Ver la
    // explicación completa en `lib/repo.mjs`.
    re: new RegExp(conFronteraUnicode(c.patron), "iu"),
  }));
}

// ─── 1b. La autocomprobación: ¿el léxico caza lo que dice cazar? ────────────
//
// D-070: ninguna comprobación de un auditor puede ser cierta por construcción.
// Un léxico compilado con el `\b` equivocado pasa TODOS los textos y se ve
// idéntico a un léxico que funciona — la única diferencia visible es que nunca
// bloquea, y eso no se nota hasta que alguien planta una violación a propósito.
//
// Cada control lleva acento a propósito, que es justo donde estaba el fallo.
const CONTROLES = {
  "es-MX": ["Se acabó tu racha", "perdida"],
  "es-ES": ["Se acabó tu racha", "perdida"],
  "fr-FR": ["Ta série est terminée", "perdida"],
  "pt-BR": ["Sua sequência acabou", "perdida"],
  "pt-PT": ["A tua sequência acabou", "perdida"],
  "de-DE": ["Deine Serie ist vorbei", "perdida"],
  en: ["You lost your streak", "perdida"],
};

for (const [loc, [frase, categoria]] of Object.entries(CONTROLES)) {
  const lista = lexico[loc];
  if (!lista) continue;
  const caza = lista.some((c) => c.categoria === categoria && c.re.test(frase));
  if (!caza) {
    problemas.push(
      `${DIR_LEXICO}/${loc}.json NO caza su propio control negativo: «${frase}». Un léxico que ` +
        "no bloquea la construcción más obvia de su categoría está fallando ABIERTO, y se ve " +
        "idéntico a uno que funciona. Casi siempre es la frontera de palabra: `\\b` de " +
        "JavaScript solo conoce ASCII, así que `\\bse acab[oó]\\b` no encuentra «Se acabó».",
    );
  }
}

// ─── 2. Los textos de racha, locale por locale ──────────────────────────────

let cadenas = 0;
for (const [DIR_TEXTOS, que] of DIRS_TEXTOS) {
  for (const loc of LOCALES) {
    const ruta = `${RAIZ}${DIR_TEXTOS}/${loc}.json`;
    if (!existsSync(ruta)) {
      problemas.push(
        `falta ${DIR_TEXTOS}/${loc}.json — el locale ${loc} no tiene textos de ${que} (D-022). ` +
          "Los siete locales se autoran, no se traducen.",
      );
      continue;
    }
    let textos;
    try {
      textos = JSON.parse(readFileSync(ruta, "utf8"));
    } catch (e) {
      problemas.push(`${DIR_TEXTOS}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
      continue;
    }
    revisados++;

    const lista = lexico[loc];
    if (!lista) continue;

    for (const [clave, valor] of Object.entries(textos)) {
      for (const cadena of Array.isArray(valor) ? valor : [valor]) {
        if (typeof cadena !== "string") continue;
        cadenas++;
        for (const c of lista) {
          if (!c.re.test(cadena)) continue;
          problemas.push(
            `${DIR_TEXTOS}/${loc}.json · ${clave}: léxico de ${c.categoria} — "${cadena}". ` +
              `${c.porque}. mc-17 §83: se enmarca como contador de mejor marca personal, sin ` +
              "lenguaje de penalización; un día saltado sencillamente no avanza el contador. " +
              "Y D-081 condición 3 lo extiende a la liga: sin lenguaje de pérdida en ninguna banda.",
          );
        }
      }
    }
  }
}

// ─── 3. La pantalla: ni alarma, ni fuego, ni cuenta regresiva ───────────────
//
// El color y el ícono son lenguaje de pérdida sin una sola palabra, así que la
// lista de arriba no puede verlos. Esto sí.

const ALARMA = /(--color-(?:error|danger|alarma|peligro)|\bcolor:\s*red\b|#(?:ff0000|f00)\b|\banimation:[^;]*parpade|blink)/i;
const FUEGO = /(🔥|\bfuego\b|\bflame\b|\bfire\b|\bstreak-?flame\b|\bllama-?apagad)/i;
const REGRESIVA = /\b(?:setInterval|countdown|cuentaRegresiva|tiempoRestante|msRestantes)\b/;

for (const archivo of archivos(/\.(astro|ts|tsx|css)$/).filter((f) =>
  /^apps\/web\/src\/(components|layouts|pages|styles)\/.*(rach|liga|duelo)/i.test(f),
)) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (ALARMA.test(texto)) {
    problemas.push(
      `${archivo}: color de alarma atado al número de racha. #206: nada de rojo ni de ámbar ` +
        "parpadeante — un color de alarma es lenguaje de pérdida sin una sola palabra.",
    );
  }
  if (FUEGO.test(texto)) {
    problemas.push(
      `${archivo}: iconografía de fuego en la racha. #206 la prohíbe por nombre: se usa el ícono ` +
        "de marca, no la iconografía que la propia investigación (mc-16) liga a la aversión a la " +
        "pérdida — un fuego que se apaga es una amenaza dibujada.",
    );
  }
  if (REGRESIVA.test(texto)) {
    problemas.push(
      `${archivo}: hay una cuenta regresiva en una superficie de racha. #206 y mc-17: la urgencia ` +
        "fabricada es una categoría nombrada por la FTC, y aquí el destinatario es un niño.",
    );
  }
}

// ─── 4. max_streak se muestra SIEMPRE junto a current_streak (#206) ─────────

const componentes = archivos(/\.astro$/).filter((f) =>
  /^apps\/web\/src\/components\/.*rach/i.test(f),
);
for (const archivo of componentes) {
  const texto = leer(archivo) ?? "";
  const muestraActual = /current_?[Ss]treak|rachaActual/.test(texto);
  const muestraMejor = /max_?[Ss]treak|rachaMaxima|mejor/.test(texto);
  if (muestraActual && !muestraMejor) {
    problemas.push(
      `${archivo}: muestra la racha actual sin la mejor marca. #206 y mc-17 §83: \`max_streak\` ` +
        "se muestra SIEMPRE junto al actual, nunca solo — es lo que convierte una cuenta " +
        "regresiva en un contador de mejor marca personal.",
    );
  }
  // Y el número pasa por `formatear()`, no por una interpolación cruda: a
  // partir de cuatro cifras el separador de millares cambia entre de-DE y
  // fr-FR (mc-34).
  if (muestraActual && !/formatear\s*\(/.test(texto)) {
    problemas.push(
      `${archivo}: pinta un número de racha sin \`formatear()\` de \`numeros.ts\`. D-022 y ` +
        "mc-34: el separador de millares no es el mismo en de-DE que en fr-FR, y una racha de " +
        "cuatro cifras es alcanzable.",
    );
  }
}

notas.push(
  `${cadenas} cadena(s) revisadas en ${LOCALES.length} locales · ` +
    `directorios: ${DIRS_TEXTOS.map(([, q]) => q).join(", ")} (D-081 condición 3)`,
);
notas.push(
  `${Object.keys(CONTROLES).length} control(es) negativo(s) con acento: cada léxico caza su ` +
    "propia construcción — con `\\b` ASCII, es-MX y es-ES se les escapaba «Se acabó tu racha»",
);
notas.push(`categorías: ${CATEGORIAS.join(", ")} — autoradas por locale, nunca traducidas`);
notas.push(`${componentes.length} componente(s) de racha: mejor marca presente y formatear() en uso`);
notas.push("mc-17 §83: contador de mejor marca personal, sin lenguaje de penalización");

informar({
  nombre: "racha-lexico",
  problemas,
  notas,
  cita: "D-014, línea roja #6, D-022, D-081 condición 3, #206, #210, mc-17 §83, mc-16",
  revisados,
  resumen: `${revisados} archivo(s) de léxico, textos y pantalla de racha, liga y duelo`,
  porQueBloquea:
    "«no pierdas tu racha» es confirm-shaming y «te quedan 3 horas» es urgencia fabricada — " +
    "las dos son categorías que la FTC nombra en su informe de 2022, y aquí el destinatario " +
    "tiene entre 4 y 17 años.",
  noComprueba: [
    "una construcción que no esté en la lista. Es un cable trampa, no un juez: el hueco lo " +
      "cubren la revisión humana por locale (D-022) y la flota adversarial.",
    "cómo se ve la pantalla de verdad. Se comprueban clases y tokens, no píxeles.",
  ],
});
