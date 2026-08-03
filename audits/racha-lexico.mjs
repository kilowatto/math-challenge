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
const DIR_TEXTOS = "apps/web/src/i18n/racha";
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

// ─── 2. Los textos de racha, locale por locale ──────────────────────────────

let cadenas = 0;
for (const loc of LOCALES) {
  const ruta = `${RAIZ}${DIR_TEXTOS}/${loc}.json`;
  if (!existsSync(ruta)) {
    problemas.push(
      `falta ${DIR_TEXTOS}/${loc}.json — el locale ${loc} no tiene textos de racha (D-022). ` +
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
            `${c.porque}. mc-17 §83: la racha se enmarca como contador de mejor marca personal, ` +
            "sin lenguaje de penalización; un día saltado sencillamente no avanza el contador.",
        );
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
  /^apps\/web\/src\/(components|layouts|pages|styles)\/.*rach/i.test(f),
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

notas.push(`${cadenas} cadena(s) de racha revisadas en ${LOCALES.length} locales`);
notas.push(`categorías: ${CATEGORIAS.join(", ")} — autoradas por locale, nunca traducidas`);
notas.push(`${componentes.length} componente(s) de racha: mejor marca presente y formatear() en uso`);
notas.push("mc-17 §83: contador de mejor marca personal, sin lenguaje de penalización");

informar({
  nombre: "racha-lexico",
  problemas,
  notas,
  cita: "D-014, línea roja #6, D-022, #206, #210, mc-17 §83, mc-16",
  revisados,
  resumen: `${revisados} archivo(s) de léxico, textos y pantalla de racha`,
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
