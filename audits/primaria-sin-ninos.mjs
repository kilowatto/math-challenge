#!/usr/bin/env node
// Auditor determinista — ni «niños» ni «Kids» en el texto de PRIMARIA
//
// Hace cumplir: #359, mc-21, D-022.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// mc-21 lista, entre los antipatrones medidos de rechazo en la banda 7-11:
// *«the word "Kids" anywhere in PRIMARY-facing copy»*. Un niño de nueve años
// no quiere que le hablen como a un niño chico, y la palabra exacta que le dice
// que este producto no es para él es «niños» — en cualquiera de los siete
// locales.
//
// La verificación del issue es un barrido sobre los 7 locales de las cadenas
// que sirve PRIMARIA, y eso es exactamente lo que esto hace: ni más (no vigila
// el copy de otras bandas) ni menos (cubre enunciados, causas de error,
// razones alternas, nombres accesibles y nombres de habilidad — todo lo que la
// pantalla puede llegar a pintar de un ítem de primaria).
//
// ─── La trampa del `\b` ASCII, otra vez ────────────────────────────────────
//
// `/\bniñ[oa]s?\b/` no existe en JavaScript: `\b` solo conoce ASCII, y un
// léxico de esta familia vive de palabras acentuadas. Se compila todo con
// `patronUnicode()` de `lib/repo.mjs`, que repara las fronteras — es la
// segunda trampa medida de AGENTS.md, y ya dejó un locale entero sin
// protección una vez.
//
// LO QUE NO PUEDE COMPROBAR: el tono. «Esto es muy fácil para ti» infantiliza
// sin usar ninguna palabra de la lista, y eso lo juzga la revisión humana por
// locale (D-022), no un barrido.

import { leer, informar, patronUnicode, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

// Las palabras que llaman «niño» a quien juega, por locale. Construcciones de
// UNA palabra a propósito: el contexto no las salva — son el marcador mismo.
const LEXICO = {
  "en": ["\\bkids?\\b", "\\bchild\\b", "\\bchildren\\b"],
  "es-MX": ["\\bniñ[oa]s?\\b", "\\bnenes?\\b", "\\bchamacos?\\b"],
  "es-ES": ["\\bniñ[oa]s?\\b", "\\bnenes?\\b", "\\bchavales?\\b"],
  "fr-FR": ["\\benfants?\\b", "\\bgosses?\\b", "\\bbambins?\\b"],
  "pt-BR": ["\\bcrianças?\\b", "\\bmenin[oa]s?\\b", "\\bmiúd[oa]s?\\b"],
  "pt-PT": ["\\bcrianças?\\b", "\\bmenin[oa]s?\\b", "\\bmiúd[oa]s?\\b"],
  "de-DE": ["\\bKinder\\b", "\\bKind\\b"],
};

const problemas = [];
const notas = [];

// --- 0. Las piezas. Fallar CERRADO si falta cualquiera -----------------------
const bancoMod = await import(`${RAIZ}packages/motor/src/banco-primaria.ts`).catch(() => null);
if (!bancoMod) problemas.push("no pude importar el banco de primaria para saber qué cadenas sirve");

const catalogos = {};
for (const loc of LOCALES) {
  const crudo = leer(`${DIR}/${loc}.json`);
  if (!crudo) {
    problemas.push(`falta ${DIR}/${loc}.json: sin el catálogo, el locale no está vigilado`);
    continue;
  }
  try {
    catalogos[loc] = JSON.parse(crudo);
  } catch (e) {
    problemas.push(`${DIR}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
  }
}

// --- 1. Las claves que PRIMARIA puede llegar a pintar -------------------------
//
// Salen del banco, no de una lista escrita aquí a mano: una plantilla nueva
// entra al barrido el día que existe, sin que nadie se acuerde de añadirla.
const claves = new Set();
if (bancoMod) {
  for (const item of bancoMod.generarBancoPrimaria()) {
    claves.add(item.enunciado.clave);
    claves.add(`habilidad.${item.habilidad}`);
    for (const e of item.errores ?? []) claves.add(e.causa);
    for (const c of item.tambienCorrectas ?? []) claves.add(c.razon);
    for (const d of Object.values(item.dibujos ?? {})) claves.add(d.clave);
  }
}
if (bancoMod && claves.size === 0) {
  problemas.push("0 claves servidas por primaria: un barrido sobre nada aprueba siempre");
}

// --- 2. El barrido --------------------------------------------------------------
let revisadas = 0;
for (const loc of LOCALES) {
  if (!catalogos[loc]) continue;
  const reglas = (LEXICO[loc] ?? []).map((p) => ({ fuente: p, re: patronUnicode(p) }));
  for (const clave of [...claves].sort()) {
    const valor = catalogos[loc][clave];
    const textos = Array.isArray(valor) ? valor : typeof valor === "string" ? [valor] : [];
    for (const texto of textos) {
      revisadas++;
      for (const { fuente, re } of reglas) {
        const m = texto.match(re);
        if (m) {
          problemas.push(
            `${loc} · \`${clave}\`: «${texto.slice(0, 70)}» contiene «${m[0]}» (${fuente}). ` +
              "mc-21: llamar «niños» a la banda 7-11 es un antipatrón medido de rechazo — " +
              "esta palabra le dice a quien juega que el producto no es para él (#359).",
          );
        }
      }
    }
  }
}

notas.push(`${claves.size} claves servidas por primaria × ${LOCALES.length} locales, ${revisadas} cadena(s) barridas`);

informar({
  nombre: "primaria-sin-ninos",
  problemas,
  notas,
  cita: "#359, mc-21, D-022",
  revisados: revisadas,
  resumen: `barrido de «niños/kids» sobre las ${claves.size} claves que sirve PRIMARIA, en los 7 locales`,
  porQueBloquea:
    "la palabra «Kids» en copy de PRIMARIA es un antipatrón documentado de rechazo en la banda " +
    "7-11 (mc-21): le dice al usuario que el producto no es para él, y en un idioma que no es el de " +
    "quien escribió el código nadie lo ve hasta que lo lee un niño de nueve años.",
  noComprueba: [
    "el tono — infantilizar sin usar ninguna palabra de la lista no lo caza un barrido; eso es revisión humana por locale (D-022)",
    "el copy de otras bandas y superficies — este barrido cubre solo lo que sirve PRIMARIA",
  ],
});
