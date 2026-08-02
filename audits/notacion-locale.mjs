#!/usr/bin/env node
// Auditor determinista — la notación matemática es del locale, no del idioma
//
// Hace cumplir: D-022, `mc-34`, CLAUDE.md § Idiomas.
//
// Por qué existe. CLAUDE.md lo dice sin rodeos: *"el contenido matemático no se
// traduce, se autora"*. Y el ejemplo que descoloca a todo el mundo la primera
// vez está ahí mismo: **México usa punto decimal y el resto del mundo hispano
// usa coma**. `es` no es un idioma para este producto; es dos locales que
// escriben los números distinto.
//
// La forma en que esto se rompe es siempre la misma y siempre parece razonable:
// alguien escribe un formateador que hace `.replace('.', ',')` "para español", o
// llama a `toLocaleString('es')` sin región, o guarda una constante `DECIMAL =
// ','`. Los tres producen números matemáticamente equivocados en México, en un
// producto de matemáticas, sin romper ninguna prueba.
//
// La tabla correcta ya existe: `MATH_CONVENTIONS` en `apps/web/src/i18n/index.ts`,
// con las siete filas y su fuente. Este auditor exige que se use ESA y no otra.
//
// LO QUE NO PUEDE COMPROBAR: que el contenido de un ítem esté bien autorado. Que
// un problema de división use `:` en alemán y `÷` en inglés es cosa del banco de
// ítems y de la revisión humana que exige CLAUDE.md § Contenido.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro|svelte|vue)$/).filter((f) => SOLO_PRODUCTO.test(f));

/** El archivo que TIENE derecho a declarar las convenciones. */
// La tabla se mudó a packages/motor cuando el motor la necesitó: packages/ no
// puede depender de apps/. i18n la reexporta, así que los dos son legítimos.
const FUENTE_DE_VERDAD = "packages/motor/src/convenciones.ts";
const REEXPORTA = "apps/web/src/i18n/index.ts";

const problemas = [];
const notas = [];
let usanLaTabla = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const lineas = texto.split("\n");
  const esLaFuente = archivo === FUENTE_DE_VERDAD || archivo === REEXPORTA;

  if (/MATH_CONVENTIONS/.test(texto) && !esLaFuente) usanLaTabla++;

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    // 1. Un locale de idioma sin región. `es` no dice si el decimal es punto o
    //    coma, y las dos respuestas existen en producción.
    const sinRegion = linea.match(/toLocale(?:String|DateString|TimeString)\s*\(\s*["'`](es|pt|en|fr|de)["'`]/);
    if (sinRegion) {
      problemas.push(
        `${archivo}:${i + 1}: \`toLocaleString("${sinRegion[1]}")\` sin región. ` +
          `"${sinRegion[1]}" no dice si el decimal es punto o coma — México usa PUNTO y España COMA ` +
          "(mc-34 §1). D-022: siete locales, no cinco idiomas.",
      );
      continue;
    }
    const intlSinRegion = linea.match(/new\s+Intl\.\w+\s*\(\s*["'`](es|pt|en|fr|de)["'`]/);
    if (intlSinRegion) {
      problemas.push(
        `${archivo}:${i + 1}: \`Intl\` con "${intlSinRegion[1]}" sin región. Mismo problema: ` +
          "es-MX y es-ES no comparten separador decimal, pt-BR y pt-PT no comparten escala (mc-34).",
      );
      continue;
    }

    // 2. Sustituir el separador a mano.
    if (/\.replace\s*\(\s*["'`]\.["'`]\s*,\s*["'`],["'`]\s*\)/.test(linea) ||
        /\.replace\s*\(\s*\/\\\.\/g?\s*,\s*["'`],["'`]\s*\)/.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: convierte el punto decimal en coma a mano — ` +
          `\`${linea.trim().slice(0, 70)}\`. Eso rompe es-MX y en, que usan PUNTO. ` +
          "Usa MATH_CONVENTIONS de i18n/index.ts, que tiene las siete filas y su fuente (mc-34).",
      );
      continue;
    }

    // 3. Declarar la convención en otro sitio que no sea la tabla.
    if (!esLaFuente) {
      const constante = linea.match(/\b(DECIMAL|SEPARADOR|SEPARATOR|GROUPING|MILLARES|THOUSANDS)\w*\s*[:=]\s*["'`][.,\s]["'`]/);
      if (constante) {
        problemas.push(
          `${archivo}:${i + 1}: declara un separador fuera de MATH_CONVENTIONS — ` +
            `\`${linea.trim().slice(0, 70)}\`. Una segunda tabla de convenciones se desincroniza ` +
            "en el primer cambio, y el síntoma es un número mal escrito en un producto de matemáticas.",
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. El texto ya autorado, no solo el código que formatea.
//
// Los tres bloques de arriba vigilan CÓDIGO: quién declara una convención y
// quién la aplica mal. No vigilaban nada de lo que un humano escribe a mano en
// `src/i18n/*.json`, y ahí es donde estaban los dos bugs reales (#321, #322):
//
//   pt-PT  «157 000 palavras»  — agrupaba con espacio, y su fila dice punto
//   fr-FR  «157 000 mots»      — agrupaba con espacio NORMAL, partible en dos
//                                líneas; su fila pide el fino insecable
//
// Ninguno rompía una prueba, ninguno rompía el build, y el gate entero estaba
// verde. La cadena la escribe una persona; la tabla la lee una máquina; nadie
// las comparaba.
//
// La tabla se lee del archivo, no se copia aquí. Una segunda copia se
// desincroniza en el primer cambio — que es literalmente el bug que este
// auditor existe para cazar.
// ---------------------------------------------------------------------------

const LOCALES_JSON = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const tablaTexto = leer(FUENTE_DE_VERDAD) ?? "";
/** @type {Record<string,string>} */
const AGRUPADOR = {};
for (const locale of LOCALES_JSON) {
  const m = tablaTexto.match(new RegExp(`"${locale}":\\s*\\{[^}]*grouping:\\s*"((?:\\\\u[0-9a-fA-F]{4})|[^"])"`));
  if (m) AGRUPADOR[locale] = m[1].startsWith("\\u") ? String.fromCodePoint(parseInt(m[1].slice(2), 16)) : m[1];
}
if (Object.keys(AGRUPADOR).length !== LOCALES_JSON.length) {
  problemas.push(
    `no se pudo leer \`grouping\` de los 7 locales en ${FUENTE_DE_VERDAD} ` +
      `(se leyeron ${Object.keys(AGRUPADOR).length}). El auditor falla CERRADO a propósito: ` +
      "sin la tabla no puede comprobar nada y quedarse callado sería fallar abierto.",
  );
}

// Escritos con escape y no literales a propósito: un U+202F literal dentro de
// este archivo sería indistinguible de un espacio normal, y el auditor que
// vigila espacios invisibles se rompería justo de la forma que no se ve.
const NBSP = "\u00a0";
const FINE = "\u202f";
const nombreDe = (c) =>
  c === FINE ? "espacio fino insecable (U+202F)"
  : c === NBSP ? "espacio insecable (U+00A0)"
  : c === " " ? "espacio normal (U+0020)"
  : `\`${c}\``;

/** Todo grupo de millares que aparece en un texto, con el separador que usa. */
const MILLARES = /(\d+)([.,\u0020\u00a0\u202f])(\d{3})(?!\d)/g;

const jsons = archivos(/^apps\/web\/src\/i18n\/.*\.json$/);
let cadenasRevisadas = 0;

for (const archivo of jsons) {
  let datos;
  try {
    datos = JSON.parse(leer(archivo) ?? "{}");
  } catch {
    problemas.push(`${archivo}: no es JSON válido`);
    continue;
  }

  // El locale de una cadena viene del nombre del archivo (`fr-FR.json`) o de la
  // clave bajo la que cuelga (`paginas/niveles.json` → `{ "fr-FR": {…} }`).
  const porNombre = LOCALES_JSON.find((l) => archivo.endsWith(`/${l}.json`)) ?? null;

  const recorrer = (nodo, locale, ruta) => {
    for (const [clave, valor] of Object.entries(nodo)) {
      if (clave.startsWith("_")) continue; // `_nota`: documentación, no producto
      const loc = LOCALES_JSON.includes(clave) ? clave : locale;
      if (valor && typeof valor === "object") {
        recorrer(valor, loc, `${ruta}.${clave}`);
        continue;
      }
      if (typeof valor !== "string" || !loc) continue;
      cadenasRevisadas++;

      for (const m of valor.matchAll(MILLARES)) {
        const esperado = AGRUPADOR[loc];
        if (!esperado || m[2] === esperado) continue;
        problemas.push(
          `${archivo} ${ruta}.${clave} [${loc}]: «${m[1]}${m[2]}${m[3]}» agrupa con ` +
            `${nombreDe(m[2])} y la fila de ${loc} en MATH_CONVENTIONS dice ${nombreDe(esperado)}. ` +
            "Un número mal agrupado se lee como otro número (mc-34).",
        );
      }

      if (loc !== "fr-FR") continue;

      // Tipografía francesa. No es cosmética: el espacio insecable existe para
      // que la línea no se parta entre la palabra y su signo, y el apóstrofo
      // recto es la marca de un texto traducido a máquina y no autorado.
      if (valor.includes("'")) {
        problemas.push(
          `${archivo} ${ruta}.${clave} [fr-FR]: apóstrofo recto \`'\`. ` +
            "El francés usa el tipográfico ’ — el propio sitio ya lo hace bien en otras cadenas.",
        );
      }
      const flojo = valor.match(/ [:;!?]/);
      if (flojo) {
        problemas.push(
          `${archivo} ${ruta}.${clave} [fr-FR]: espacio NORMAL antes de \`${flojo[0].trim()}\`. ` +
            "El francés pide insecable (U+00A0 antes de `:`, U+202F antes de `; ! ?`); " +
            "con el normal el signo puede caer solo al principio de la línea siguiente.",
        );
      }
    }
  };

  recorrer(datos, porNombre, archivo.split("/").pop().replace(".json", ""));
}

notas.push(`${jsons.length} archivo(s) de texto autorado, ${cadenasRevisadas} cadena(s) con locale conocido`);

notas.push(
  usanLaTabla > 0
    ? `${usanLaTabla} archivo(s) consumen MATH_CONVENTIONS`
    : "todavía nadie consume MATH_CONVENTIONS; existe desde F0 para que nadie escriba otra",
);
notas.push(`la tabla vive en ${FUENTE_DE_VERDAD}, con las siete filas y su fuente (mc-34)`);

informar({
  nombre: "notacion-locale",
  problemas,
  notas,
  cita: "D-022, mc-34, CLAUDE.md § Idiomas",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "un separador decimal equivocado produce un número matemáticamente falso en un " +
    "producto de matemáticas, sin romper ninguna prueba. México es la excepción del " +
    "mundo hispano: punto decimal, como el inglés (mc-34 §1).",
  noComprueba: [
    "que el contenido de un ítem esté bien autorado — eso es revisión humana " +
      "(CLAUDE.md § Contenido).",
  ],
});
