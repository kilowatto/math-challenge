#!/usr/bin/env node
// Auditor determinista — integridad del corpus traducido
//
// Hace cumplir: D-033 (el sitio abierto publica la investigación completa),
// D-022 (siete locales, no cinco idiomas) y mc-34 (la notación matemática
// cambia por locale, no por idioma).
//
// Por qué existe, y por qué es la mitad que importa de la vía de traducción:
// el corpus de `docs/research/` es lo único que hace citable al sitio (D-033,
// mc-48). Su valor entero descansa en que las cifras sean las de la fuente. Una
// traducción que convierte un 43% en un 34%, o que pierde una marca
// `[unverified]`, no degrada el texto: **fabrica una cita falsa con nuestro
// nombre encima**. Perder un `[unverified]` es peor que perder una frase,
// porque convierte una advertencia declarada en una afirmación.
//
// Qué comprueba, entre cada original y cada traducción:
//
//   1. NÚMEROS      — el multiconjunto de valores numéricos es idéntico, con
//                     lectura sensible al locale (40,000 en → 40.000 de-DE →
//                     40 000 fr-FR es el MISMO número).
//   2. ENLACES      — toda URL y todo destino de enlace sobrevive sin cambiar.
//   3. [unverified] — misma cuenta exacta. No se pierde ni se inventa.
//   4. IDS          — mc-NN, D-0NN y LR-N sobreviven, con la misma cuenta.
//   5. LITERALES    — versiones de estándar (WCAG 2.2), fechas ISO, arXiv, DOI,
//                     referencias §, nombres de modelo y bloques de código
//                     sobreviven **verbatim**: no son números, son nombres.
//   6. CONVENCIÓN   — el separador decimal y de millares es el del locale
//                     destino (mc-34): México punto, el resto del mundo hispano
//                     coma, francés coma con espacio de millares.
//
// FALLA CERRADO. Si no encuentra ni una traducción que comprobar, sale con 1.
// Un escáner que no ve nada aprueba siempre, y este repositorio ya tuvo ese bug.
//
// Uso:
//   node audits/corpus-integridad.mjs                  todo lo que exista
//   node audits/corpus-integridad.mjs --locale de-DE   solo un locale
//   node audits/corpus-integridad.mjs --detalle        lista cada diferencia
//   node audits/corpus-integridad.mjs --max 40         tope de líneas por fallo

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";

// --------------------------------------------------------------- constantes

const RAIZ_CORPUS = "docs/research";

/** Los siete locales de D-022. `en` es el origen; los otros seis son destino. */
export const LOCALE_ORIGEN = "en";
export const LOCALES_DESTINO = ["es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/**
 * Convenciones numéricas por locale.
 *
 * Espejo deliberado de `MATH_CONVENTIONS` en `apps/web/src/i18n/index.ts`, que
 * es TypeScript y no se puede importar desde un auditor de Node sin compilar.
 * La fuente de ambos es mc-34 §1: México es el único país hispano con punto
 * decimal; el BIPM recomienda desde 1948 espacios finos para agrupar millares,
 * que es lo que usa fr-FR.
 *
 * Si estas dos tablas se separan, el auditor `locales-complete` no lo nota —
 * es una limitación conocida y está dicha en el informe de esta tarea.
 */
export const CONVENCIONES = {
  "en": { decimal: ".", grouping: ",", idioma: "inglés" },
  "es-MX": { decimal: ".", grouping: ",", idioma: "español de México" },
  "es-ES": { decimal: ",", grouping: ".", idioma: "español de España" },
  "fr-FR": { decimal: ",", grouping: " ", idioma: "francés de Francia" },
  "pt-BR": { decimal: ",", grouping: ".", idioma: "portugués de Brasil" },
  "pt-PT": { decimal: ",", grouping: ".", idioma: "portugués de Portugal" },
  "de-DE": { decimal: ",", grouping: ".", idioma: "alemán de Alemania" },
};

/**
 * Nombres propios que llevan número y NO son cantidades.
 *
 * La lista no se inventó: sale de mirar todos los `\d+\.\d+` del corpus con
 *
 *   grep -ohE '.{20}[0-9]+\.[0-9]+.{8}' docs/research/*.md | sort | uniq -c
 *
 * y separar los que son cifras (0.49, 23.1%, $19.95) de los que son nombres de
 * versión o de norma (WCAG 2.2, iOS 17.4, QTI 3.0, §312.12, arXiv:2508.09932).
 * "WCAG 2.2" en alemán se escribe "WCAG 2.2", no "WCAG 2,2": convertirle el
 * separador sería el error contrario, y por eso estos van por la vía de
 * "sobrevive verbatim" y no por la de "es un número".
 */
// Ojo con el orden: la alternancia de JavaScript es ordenada, así que las
// variantes largas van antes que sus prefijos ("Node.js" antes que "Node",
// "ECMAScript" antes que "ECMA"). Al revés, "Node.js 22" no casaría y el 22
// caería en la comparación numérica como si fuera una cantidad.
const NOMBRES_CON_VERSION =
  "WCAG|ECMAScript|ECMA|ISO|IEEE|Unicode|HTTPS|HTTP|QUIC|TLS|SSL|QTI|SCORM|xAPI|LTI|" +
  "iPadOS|iOS|macOS|watchOS|tvOS|Safari|Chromium|Chrome|Firefox|Edge|Android|Windows|" +
  "Node\\.js|Node|Astro|Vite|React|Vue|Svelte|TypeScript|Python|PHP|Java|Rust|" +
  "OpenSSL|SQLite|Postgres|MySQL|Redis|AGPL|LGPL|GPL|MIT|BSD|Apache|" +
  "GPT|Claude|Haiku|Sonnet|Opus|Kimi|Llama|Mistral|Qwen|Gemini|" +
  "SC|v";

// --------------------------------------------------------------- extracción

// Lo que se lleva cada pasada deja un espacio en su lugar. Tiene que ser un
// espacio y no una cadena vacía: si no, dos tokens vecinos se pegan y producen
// un número que no existía en ninguno de los dos.
const CENTINELA = " ";

/**
 * Construye el reconocedor de números para una convención.
 *
 * El espacio solo cuenta como separador de millares donde la convención lo dice
 * (fr-FR), y solo ante un grupo de exactamente tres dígitos — si no, "5 minutos"
 * y "en 2026 3 niños" se leerían como un número solo.
 *
 * El lookbehind `(?<![\p{L}\d.,§])` evita tres falsos positivos reales de este
 * corpus: el "6" de `kimi-k2.6`, el "2" de `k2`, y el "2" de `§4.2`.
 */
function regexNumeros(conv) {
  const sep = conv.grouping === " "
    ? "(?:[.,]\\d+|[\\u0020\\u00a0\\u202f\\u2009]\\d{3}(?!\\d))"
    : "(?:[.,]\\d+)";
  return new RegExp(`(?<![\\p{L}\\d.,§])\\d+${sep}*`, "gu");
}

/**
 * Lee un número escrito bajo una convención y lo lleva a forma canónica.
 *
 * Devuelve `null` cuando el token NO es un número válido en esa convención —
 * que es exactamente la señal de "el traductor no convirtió el separador".
 * `0.49` bajo de-DE no es un decimal alemán y tampoco es un agrupamiento
 * válido (49 no tiene tres dígitos), así que devuelve `null` y se reporta.
 *
 * No se normalizan ceros a la derecha: mc-13 discute literalmente "0.300 vs
 * 0.49", donde los ceros son el argumento. Recortarlos borraría el hallazgo.
 */
export function canonizar(crudo, conv) {
  const t = crudo.replace(/[\u00a0\u202f\u2009]/g, " ").trim();
  const partes = t.split(conv.decimal);
  if (partes.length > 2) return null;
  const frac = partes.length === 2 ? partes[1] : "";
  if (partes.length === 2 && !/^\d+$/.test(frac)) return null;

  const ent = partes[0];
  let digitos;
  if (conv.grouping !== conv.decimal && ent.includes(conv.grouping)) {
    const grupos = ent.split(conv.grouping);
    if (!/^\d{1,3}$/.test(grupos[0])) return null;
    if (!grupos.slice(1).every((g) => /^\d{3}$/.test(g))) return null;
    digitos = grupos.join("");
  } else {
    if (!/^\d+$/.test(ent)) return null;
    digitos = ent;
  }
  return frac ? `${digitos}.${frac}` : digitos;
}

/**
 * Extrae los invariantes de un texto Markdown bajo una convención de locale.
 *
 * El orden de las pasadas importa: lo más específico primero. Cada pasada
 * sustituye lo que se lleva por un centinela, para que la siguiente no vuelva a
 * verlo — un DOI contiene un `\d+\.\d+` que no es un decimal.
 */
export function extraer(textoCrudo, locale) {
  const conv = CONVENCIONES[locale];
  if (!conv) throw new Error(`locale desconocido: ${locale}`);

  // Los comentarios HTML son metadatos del traductor (origen, sha, modelo).
  // No son contenido, y su sha256 está lleno de dígitos que no son cifras.
  //
  // El guion no separable (U+2011) se normaliza a guion ASCII. Medido en la
  // primera corrida real: gpt-oss-120b escribió `GPT‑4o` con U+2011 donde el
  // original tenía `GPT-4o`, y sin esta línea el "4" se caía del literal y
  // entraba a la comparación numérica como un número inventado. Es un cambio
  // tipográfico, no de contenido, y tratarlo como defecto es ruido.
  const crudo = textoCrudo
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/[‐‑]/g, "-");

  const marcas = (crudo.match(/\[unverified\]/gi) ?? []).length;

  // Los ids se cuentan sobre el texto entero y SIN consumirlo: en este corpus
  // casi siempre vienen entre acentos graves (`mc-40`), y si se contaran
  // después de sacar el código no se contaría casi ninguno.
  const RE_IDS = /\b(?:mc-\d{1,2}|D-\d{3}|LR-\d{1,2})\b/g;
  const ids = [...crudo.matchAll(RE_IDS)].map((m) => m[0]);

  let t = crudo;

  const codigo = [];
  t = t.replace(/```[\s\S]*?```/g, (m) => (codigo.push(m.trim()), CENTINELA));
  t = t.replace(/`[^`\n]+`/g, (m) => (codigo.push(m), CENTINELA));

  // Destino de enlaces e imágenes de Markdown, y URLs sueltas.
  const enlaces = [];
  t = t.replace(/\]\(\s*(<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\s*\)/g, (_m, d) => {
    enlaces.push(d.replace(/^<|>$/g, ""));
    return "]" + CENTINELA;
  });
  t = t.replace(/(?:https?:\/\/|www\.)[^\s)>\]"'`,]+/g, (m) => {
    enlaces.push(m.replace(/[.;:]+$/, ""));
    return CENTINELA;
  });

  // Aquí sí se consumen: sin esto, el "34" de `mc-34` entraría a la
  // comparación numérica como si fuera una cantidad.
  t = t.replace(RE_IDS, CENTINELA);

  // Nombres que llevan número: versiones, normas, fechas, identificadores.
  //
  // El literal se guarda con sus espacios normalizados a uno solo y ASCII. El
  // alemán junta la norma con su versión con espacio fino no separable
  // (U+202F): `WCAG 2.2` sigue siendo `WCAG 2.2`, y exigir el mismo BYTE de
  // espacio convertiría buena tipografía alemana en catorce hallazgos falsos —
  // medido, fue exactamente eso en la primera corrida de mc-48.
  const literales = [];
  const tomaLiteral = (re) => {
    t = t.replace(re, (m) => (literales.push(m.trim().replace(/\s+/g, " ")), CENTINELA));
  };
  tomaLiteral(/@cf\/[\w.\/-]+/g);
  tomaLiteral(/\b(?:kimi|gpt-oss|claude|llama|mistral|qwen)[\w.\/-]*\d[\w.\/-]*/gi);
  tomaLiteral(/\barXiv:?\s*\d{4}\.\d{4,5}(?:v\d+)?/gi);
  tomaLiteral(/\b10\.\d{4,9}\/[^\s)\]]+/g);
  tomaLiteral(/\b\d{4}-\d{2}-\d{2}\b/g);
  tomaLiteral(/§\s?\d+(?:\.\d+)*/g);
  tomaLiteral(/\b\d+\.\d+\.\d+(?:\.\d+)*\b/g);
  tomaLiteral(new RegExp(`\\b(?:${NOMBRES_CON_VERSION})[\\s/-]{0,2}v?\\d+(?:\\.\\d+)*\\+?`, "g"));
  tomaLiteral(/\b\d+\.\d+\s+A{1,3}\b/g);

  const numeros = [];
  for (const m of t.matchAll(regexNumeros(conv))) {
    numeros.push({ crudo: m[0], canon: canonizar(m[0], conv) });
  }

  return { locale, marcas, codigo, enlaces, ids, literales, numeros };
}

// --------------------------------------------------------------- comparación

function multiconjunto(lista) {
  const m = new Map();
  for (const x of lista) m.set(x, (m.get(x) ?? 0) + 1);
  return m;
}

/** Diferencia de multiconjuntos: qué falta en B y qué sobra en B respecto de A. */
function diferencia(a, b) {
  const A = multiconjunto(a), B = multiconjunto(b);
  const faltan = [], sobran = [];
  for (const [k, n] of A) {
    const d = n - (B.get(k) ?? 0);
    for (let i = 0; i < d; i++) faltan.push(k);
  }
  for (const [k, n] of B) {
    const d = n - (A.get(k) ?? 0);
    for (let i = 0; i < d; i++) sobran.push(k);
  }
  return { faltan, sobran };
}

/**
 * Compara un original con su traducción y devuelve una lista de fallos.
 *
 * Cada fallo trae `{ prueba, detalle, ejemplos }`. Lista vacía = íntegro.
 * Es la misma función que usa `scripts/traducir-corpus.mjs` para verificarse a
 * sí mismo trozo por trozo — a propósito: el traductor se revisa con la misma
 * vara con la que después lo van a juzgar, pero **quien bloquea es este
 * archivo**, leyendo del disco, sin confiar en lo que el traductor diga.
 */
export function comparar(origen, traduccion) {
  const fallos = [];

  // 1. Números
  const numsO = origen.numeros.filter((n) => n.canon !== null).map((n) => n.canon);
  const malOrigen = origen.numeros.filter((n) => n.canon === null);
  const numsT = traduccion.numeros.filter((n) => n.canon !== null).map((n) => n.canon);
  const { faltan, sobran } = diferencia(numsO, numsT);
  if (faltan.length || sobran.length) {
    fallos.push({
      prueba: "números",
      detalle: `${faltan.length} valor(es) del original no aparecen en la traducción, ${sobran.length} aparecen de más`,
      ejemplos: [
        ...faltan.map((v) => `perdido: ${v}`),
        ...sobran.map((v) => `inventado: ${v}`),
      ],
    });
  }

  // 6. Convención decimal del locale destino (mc-34)
  const conv = CONVENCIONES[traduccion.locale];
  const malFormados = traduccion.numeros.filter((n) => n.canon === null);
  if (malFormados.length) {
    fallos.push({
      prueba: "convención decimal",
      detalle:
        `${malFormados.length} número(s) no están escritos con la convención de ` +
        `${traduccion.locale} (decimal "${conv.decimal}", millares "${conv.grouping === " " ? "espacio" : conv.grouping}")`,
      ejemplos: malFormados.map((n) => `«${n.crudo}»`),
    });
  }

  // 2. Enlaces
  const dEnlaces = diferencia(origen.enlaces, traduccion.enlaces);
  if (dEnlaces.faltan.length) {
    fallos.push({
      prueba: "enlaces",
      detalle: `${dEnlaces.faltan.length} URL o destino de enlace del original no sobrevivió`,
      ejemplos: dEnlaces.faltan.map((u) => `perdido: ${u}`),
    });
  }

  // 3. [unverified]
  if (origen.marcas !== traduccion.marcas) {
    fallos.push({
      prueba: "[unverified]",
      detalle: `el original tiene ${origen.marcas} marca(s) y la traducción ${traduccion.marcas}`,
      ejemplos: [
        traduccion.marcas < origen.marcas
          ? "perder una marca convierte una advertencia declarada en una afirmación"
          : "inventar una marca marca como dudoso algo que la fuente sí verificó",
      ],
    });
  }

  // 4. Ids citados
  const dIds = diferencia(origen.ids, traduccion.ids);
  if (dIds.faltan.length || dIds.sobran.length) {
    fallos.push({
      prueba: "ids citados",
      detalle: `${dIds.faltan.length} id(s) perdidos, ${dIds.sobran.length} inventados`,
      ejemplos: [
        ...dIds.faltan.map((i) => `perdido: ${i}`),
        ...dIds.sobran.map((i) => `inventado: ${i}`),
      ],
    });
  }

  // 5. Literales verbatim: versiones, normas, fechas, código
  const dLit = diferencia(origen.literales, traduccion.literales);
  if (dLit.faltan.length || dLit.sobran.length) {
    fallos.push({
      prueba: "nombres con número",
      detalle: `${dLit.faltan.length} literal(es) perdidos, ${dLit.sobran.length} alterados o inventados`,
      ejemplos: [
        ...dLit.faltan.map((v) => `perdido: ${v}`),
        ...dLit.sobran.map((v) => `alterado: ${v}`),
      ],
    });
  }
  const dCod = diferencia(origen.codigo, traduccion.codigo);
  if (dCod.faltan.length || dCod.sobran.length) {
    fallos.push({
      prueba: "código y fórmulas",
      detalle: `${dCod.faltan.length} fragmento(s) de código del original no sobrevivieron intactos`,
      ejemplos: [
        ...dCod.faltan.map((v) => `perdido: ${v.slice(0, 90).replace(/\n/g, "⏎")}`),
        ...dCod.sobran.map((v) => `alterado: ${v.slice(0, 90).replace(/\n/g, "⏎")}`),
      ],
    });
  }

  // Se reporta al final y solo como nota: un número mal formado en el ORIGEN
  // no es culpa de la traducción, pero deja al auditor parcialmente ciego.
  if (malOrigen.length) {
    fallos.push({
      prueba: "aviso: original",
      aviso: true,
      detalle: `${malOrigen.length} token(s) del original no se pudieron leer como número en ${origen.locale}; quedaron fuera de la comparación`,
      ejemplos: malOrigen.map((n) => `«${n.crudo}»`),
    });
  }

  return fallos;
}

// --------------------------------------------------------------------- CLI

function pares(locale) {
  const dir = join(RAIZ_CORPUS, locale);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({
      nombre: f,
      origen: join(RAIZ_CORPUS, f),
      traduccion: join(dir, f),
    }));
}

function main(argv) {
  const tiene = (f) => argv.includes(f);
  const valorDe = (f) => {
    const i = argv.indexOf(f);
    return i === -1 ? null : argv[i + 1];
  };
  // El locale se acepta suelto (`corpus-integridad.mjs de-DE`) o con bandera
  // (`--locale de-DE`). Las dos formas están documentadas en sitios distintos y
  // rechazar una de ellas solo produce un "no encontró nada" que parece un bug
  // del corpus y es un bug del parseo de argumentos.
  const suelto = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--locale" && argv[i - 1] !== "--max");
  const soloLocale = valorDe("--locale") ?? suelto ?? null;
  const detalle = tiene("--detalle");
  const maxEjemplos = Number(valorDe("--max") ?? (detalle ? 1000 : 6));

  const locales = soloLocale ? [soloLocale] : LOCALES_DESTINO;
  for (const l of locales) {
    if (!LOCALES_DESTINO.includes(l)) {
      console.error(`✗ corpus-integridad: "${l}" no es un locale destino. Son: ${LOCALES_DESTINO.join(", ")} (D-022)`);
      process.exit(1);
    }
  }

  if (!existsSync(RAIZ_CORPUS)) {
    console.error(`✗ corpus-integridad: no existe ${RAIZ_CORPUS}/`);
    process.exit(1);
  }

  console.log("Integridad del corpus traducido — D-033, D-022, mc-34\n");

  let revisados = 0, conFallo = 0, sinOrigen = 0;
  const problemas = [];

  for (const locale of locales) {
    const lista = pares(locale);
    if (lista.length === 0) continue;
    console.log(`── ${locale} · ${lista.length} documento(s)`);

    for (const p of lista) {
      if (!existsSync(p.origen)) {
        sinOrigen++;
        problemas.push({ locale, nombre: p.nombre, fallos: [{ prueba: "huérfano", detalle: `no existe el original ${p.origen}`, ejemplos: [] }] });
        console.log(`   ✗ ${p.nombre} — sin original`);
        continue;
      }
      const origen = extraer(readFileSync(p.origen, "utf8"), LOCALE_ORIGEN);
      const trad = extraer(readFileSync(p.traduccion, "utf8"), locale);
      const fallos = comparar(origen, trad);
      const duros = fallos.filter((f) => !f.aviso);
      revisados++;

      const censo = `${origen.numeros.length} nº · ${origen.enlaces.length} enlaces · ${origen.marcas} [unverified] · ${origen.ids.length} ids`;
      if (duros.length === 0) {
        console.log(`   ✓ ${p.nombre.padEnd(52)} ${censo}`);
        for (const f of fallos) console.log(`     · ${f.detalle}`);
      } else {
        conFallo++;
        console.log(`   ✗ ${p.nombre.padEnd(52)} ${censo}`);
        problemas.push({ locale, nombre: p.nombre, fallos });
      }
    }
    console.log("");
  }

  // ---------------------------------------------------------- falla cerrado
  if (revisados === 0 && sinOrigen === 0) {
    console.error("✗ corpus-integridad: NO ENCONTRÓ NI UNA TRADUCCIÓN QUE COMPROBAR.\n");
    console.error(`  Buscó en: ${locales.map((l) => `${RAIZ_CORPUS}/${l}/*.md`).join(", ")}`);
    console.error("");
    console.error("  Esto es un fallo, no un aprobado. Un escáner que no ve nada aprueba");
    console.error("  siempre, y ese bug ya vivió en este repositorio: un auditor verde");
    console.error("  sobre cero archivos es indistinguible de un auditor verde sobre un");
    console.error("  corpus íntegro, y solo uno de los dos es cierto.");
    console.error("");
    console.error("  Genera al menos una traducción:");
    console.error("    node scripts/traducir-corpus.mjs es-MX --limite 1");
    process.exit(1);
  }

  if (problemas.length > 0) {
    console.error("✗ auditor corpus-integridad\n");
    for (const pr of problemas) {
      console.error(`  ${pr.locale}/${pr.nombre}`);
      for (const f of pr.fallos) {
        console.error(`    ${f.aviso ? "·" : "✗"} ${f.prueba}: ${f.detalle}`);
        for (const e of f.ejemplos.slice(0, maxEjemplos)) console.error(`        ${e}`);
        if (f.ejemplos.length > maxEjemplos) {
          console.error(`        … y ${f.ejemplos.length - maxEjemplos} más (--detalle los muestra todos)`);
        }
      }
      console.error("");
    }
    console.error("  Hace cumplir: D-033, D-022, mc-34");
    console.error("  Por qué bloquea: el corpus es lo único que hace citable al sitio");
    console.error("  (D-033, mc-48). Una cifra mal trasladada no degrada el texto —");
    console.error("  fabrica una cita falsa con nuestro nombre encima. Y perder un");
    console.error("  [unverified] convierte una advertencia declarada en una afirmación.");
    process.exit(1);
  }

  console.log(`✓ corpus-integridad — ${revisados} traducción(es) íntegra(s) en ${locales.filter((l) => pares(l).length).length} locale(s)`);
  const faltantes = LOCALES_DESTINO.filter((l) => pares(l).length === 0);
  if (faltantes.length) {
    console.log(`  · sin traducir todavía: ${faltantes.join(", ")} (D-022 pide los 7 locales)`);
  }
}

// Solo corre como CLI. Importado, es la biblioteca que usa el traductor.
if (process.argv[1] && basename(process.argv[1]) === basename(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2));
}
