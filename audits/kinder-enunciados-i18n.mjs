#!/usr/bin/env node
// Auditor determinista — todo enunciado que el banco nombra existe en los 7 locales
//
// Hace cumplir: D-022 (siete locales), #349 (una clave cruda servida como
// texto), línea roja #3 (un niño no lee — y menos una clave de código).
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// El banco de kinder guarda el enunciado como `{ clave, vars }`, jamás como
// texto (CLAUDE.md § Contenido), y `presentarItem` lo resuelve contra
// `i18n/reto/<locale>.json` en el momento de servir. Si la clave no está en el
// locale del niño, la plantilla no es una cadena y la pantalla muestra **la
// clave cruda**: «k.recta.salta_2» delante de alguien de cuatro años. Es #349
// otra vez — `casilla3` como botón — pero en el enunciado.
//
// Y hay un segundo fallo, más fino: la clave existe pero la plantilla pide una
// variable que el ítem no trae (`{antes}` sin `antes` en `vars`). Entonces el
// reemplazo deja `{antes}` literal dentro de la frase, y la pregunta sale con
// un agujero de código en medio.
//
// Ningún auditor miraba esto: `retro-completa` vigila las CAUSAS (error.*),
// `opciones-contestables` vigila los DIBUJOS (dibujos[].clave), y los
// enunciados quedaban en tierra de nadie. Apareció al añadir 25 claves nuevas
// en siete archivos a mano: el olvido de una no lo veía nadie.
//
// ─── Fallar CERRADO ────────────────────────────────────────────────────────
//
// Si el banco o un catálogo no se pueden leer, esto sale con 1. «No encontré
// nada» y «está todo bien» no son lo mismo (D-070).

import { leer, informar } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];

// ── El banco: qué claves y qué variables produce de verdad ─────────────────
let banco;
try {
  const mod = await import("../packages/motor/src/banco-kinder.ts");
  banco = mod.generarBanco();
} catch (err) {
  console.error("✗ kinder-enunciados-i18n — no pude importar el banco de kinder.");
  console.error(`  ${String(err).slice(0, 200)}`);
  console.error("  Un auditor que deja de entender su fuente no pasa en verde: bloquea,");
  console.error("  porque «no encontré nada» y «está todo bien» no son lo mismo (D-070).");
  process.exit(1);
}

// ── Los catálogos ───────────────────────────────────────────────────────────
const catalogos = new Map();
for (const l of LOCALES) {
  const crudo = leer(`${DIR}/${l}.json`);
  if (!crudo) {
    console.error(`✗ kinder-enunciados-i18n — no pude leer ${DIR}/${l}.json.`);
    console.error("  El enunciado del niño sale de ahí; sin los siete no puedo decir si existe");
    console.error("  en el idioma del niño que no habla el idioma de quien escribió el ítem (D-022).");
    process.exit(1);
  }
  try {
    catalogos.set(l, JSON.parse(crudo));
  } catch {
    /* un JSON roto lo caza `locales-complete`, no éste */
  }
}

// ── 1. Toda clave del banco existe en los siete locales ─────────────────────
const faltantes = new Map(); // clave → locales donde falta
const claves = [...new Set(banco.map((i) => i.enunciado.clave))];
for (const clave of claves) {
  for (const [l, cat] of catalogos) {
    if (cat && typeof cat[clave] !== "string") {
      if (!faltantes.has(clave)) faltantes.set(clave, []);
      faltantes.get(clave).push(l);
    }
  }
}

for (const [clave, locales] of [...faltantes].sort()) {
  problemas.push(
    `\`${clave}\` no tiene texto en ${locales.join(", ")}. \`presentarItem\` sirve entonces la ` +
      "clave cruda como enunciado — «k.recta.salta_2» delante de un niño de cuatro años que no " +
      "lee, y solo en ese idioma, así que funciona en las pruebas de quien lo escribió (D-022, #349).",
  );
}

// ── 2. Toda variable que la plantilla pide, el ítem la trae ─────────────────
//
// El reemplazo de `presentarItem` deja `{variable}` literal cuando el ítem no
// la trae: la frase sale con un agujero de código en medio. Se mira en los
// SIETE locales y no solo en uno, porque las plantillas se autoran por idioma
// (mc-34) y nada obliga a que pidan las mismas variables.
const sinVariable = new Map(); // clave · locale → variables que faltan
for (const item of banco) {
  const vars = item.enunciado.vars ?? {};
  for (const [l, cat] of catalogos) {
    const plantilla = cat?.[item.enunciado.clave];
    if (typeof plantilla !== "string") continue;
    for (const m of plantilla.matchAll(/\{(\w+)\}/g)) {
      if (vars[m[1]] === undefined) {
        const k = `${item.enunciado.clave} · ${l}`;
        if (!sinVariable.has(k)) sinVariable.set(k, new Set());
        sinVariable.get(k).add(m[1]);
      }
    }
  }
}

for (const [donde, variables] of [...sinVariable].sort()) {
  problemas.push(
    `\`${donde}\` pide ${[...variables].map((v) => `{${v}}`).join(", ")} y el ítem no la(s) trae ` +
      "en `vars`: la frase sale con el hueco de código literal dentro. La plantilla del locale " +
      "y las variables del banco las escriben personas distintas, y dos listas se separan (#347).",
  );
}

notas.push(`${banco.length} ítem(s), ${claves.length} clave(s) de enunciado cruzadas con los 7 locales`);

informar({
  nombre: "kinder-enunciados-i18n",
  problemas,
  notas,
  cita: "D-022, #349, #347, línea roja #3, mc-34",
  revisados: banco.length,
  resumen: `${claves.length} clave(s) de enunciado con texto y variables completas en los 7 locales`,
  porQueBloquea:
    "un enunciado servido como clave cruda, o con un `{hueco}` de código dentro, le pide leer " +
    "código a quien no sabe leer — y falla solo en el idioma que no habla quien escribió el ítem.",
  noComprueba: [
    "que el texto esté BIEN autorado — que exista y tenga sus variables es lo que se mira " +
      "(la autoría por idioma la revisa una persona, mc-34)",
    "las causas de error — eso es retro-completa",
    "los nombres accesibles de las opciones dibujadas — eso es opciones-contestables",
    "el banco de primaria en adelante — éste cubre solo kinder",
  ],
});
