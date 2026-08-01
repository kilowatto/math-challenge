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
const FUENTE_DE_VERDAD = "apps/web/src/i18n/index.ts";

const problemas = [];
const notas = [];
let usanLaTabla = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const lineas = texto.split("\n");
  const esLaFuente = archivo === FUENTE_DE_VERDAD;

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

notas.push(
  usanLaTabla > 0
    ? `${usanLaTabla} archivo(s) consumen MATH_CONVENTIONS`
    : "todavía nadie consume MATH_CONVENTIONS; existe desde F0 para que nadie escriba otra",
);
notas.push("la tabla vive en apps/web/src/i18n/index.ts, con las siete filas y su fuente (mc-34)");

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
