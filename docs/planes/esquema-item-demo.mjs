#!/usr/bin/env node
// Demostración ejecutable del esquema de ítem propuesto en docs/planes/esquema-item.md
//
//   node docs/planes/esquema-item-demo.mjs
//
// Qué prueba, y por qué existe este archivo en vez de una tabla pegada a mano:
//
//   1. Que el esquema (esquema-item.schema.json) es un JSON Schema válido y que
//      los ejemplos lo cumplen — con ajv, que ya es dependencia del repo.
//   2. Que un ítem de kinder guardado como ESTRUCTURA se renderiza en los siete
//      locales sin tener texto adentro.
//   3. Que MATH_CONVENTIONS (apps/web/src/i18n/index.ts) alcanza para renderizar,
//      y dónde NO coincide con Intl/CLDR — que es un hallazgo, no un adorno.
//
// Este archivo NO es código de producción. Es la prueba de que el esquema
// aguanta, para que una persona la pueda re-ejecutar en vez de creerme.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..", "..");
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

// ---------------------------------------------------------------------------
// 1. MATH_CONVENTIONS, leído del archivo real y no copiado
// ---------------------------------------------------------------------------
// index.ts importa JSON sin atributo de importación, así que Node no lo puede
// importar directo (probado: "needs an import attribute of type: json"). Se
// extrae el literal del objeto para no crear una segunda fuente de verdad.
// Que haga falta este truco es, en sí, un argumento del plan: MATH_CONVENTIONS
// debería vivir en su propio módulo sin dependencias.
function leerConvenciones() {
  const src = readFileSync(join(RAIZ, "apps/web/src/i18n/index.ts"), "utf8");
  const inicio = src.indexOf("export const MATH_CONVENTIONS");
  if (inicio < 0) throw new Error("MATH_CONVENTIONS no está en apps/web/src/i18n/index.ts");
  const abre = src.indexOf("= {", inicio);
  const cierra = src.indexOf("\n};", abre);
  const cuerpo = src.slice(abre + 2, cierra + 2);
  return new Function(`return ${cuerpo}`)();
}

const CONV = leerConvenciones();

// ---------------------------------------------------------------------------
// 2. Paquetes de frases — autorados por locale, NO traducidos
// ---------------------------------------------------------------------------
// Esto representa content/frases/<locale>.json. Es lo único que lleva texto, y
// lo escribe un adulto autor nativo (D-022: son siete autores, no cinco).
//
// La palabra-número está aquí y no se calcula: "dezesseis" (BR) y "dezasseis"
// (PT) son la prueba de que pt no es un locale (mc-34, matriz de notación).
const FRASES = {
  "en":    { "k04.toca_el_numero": "Tap the number {palabra}.", "k04.palabra.17": "seventeen",
             "k04.err.unidad": "You tapped {mal}. Listen again: seven-TEEN — it ends in seven, but it is ten and seven.",
             "k04.err.inversion": "You tapped {mal}. The digits are swapped: {bien} is one ten and seven ones.",
             "k04.err.decena": "You tapped {mal}. That is only the ten. {bien} is the ten plus seven more.",
             "n09.divide": "What is {expr}?",
             "n09.err.separador": "You wrote {mal}. The decimal marker is not a thousands marker.",
             "n09.err.mitad": "You wrote {mal} — that is half. Dividing by 8 is not halving." },
  "es-MX": { "k04.toca_el_numero": "Toca el número {palabra}.", "k04.palabra.17": "diecisiete",
             "k04.err.unidad": "Tocaste el {mal}. Escucha otra vez: dieci-SIETE — termina en siete, pero es diez y siete.",
             "k04.err.inversion": "Tocaste el {mal}. Los dígitos están al revés: {bien} es una decena y siete unidades.",
             "k04.err.decena": "Tocaste el {mal}. Ese es nada más el diez. {bien} es el diez y siete más.",
             "n09.divide": "¿Cuánto es {expr}?",
             "n09.err.separador": "Escribiste {mal}. El punto decimal no es el separador de millares.",
             "n09.err.mitad": "Escribiste {mal} — eso es la mitad. Dividir entre 8 no es partir a la mitad." },
  "es-ES": { "k04.toca_el_numero": "Toca el número {palabra}.", "k04.palabra.17": "diecisiete",
             "k04.err.unidad": "Has tocado el {mal}. Escucha otra vez: dieci-SIETE — acaba en siete, pero es diez y siete.",
             "k04.err.inversion": "Has tocado el {mal}. Las cifras están al revés: {bien} es una decena y siete unidades.",
             "k04.err.decena": "Has tocado el {mal}. Ese es solo el diez. {bien} es el diez y siete más.",
             "n09.divide": "¿Cuánto es {expr}?",
             "n09.err.separador": "Has escrito {mal}. La coma decimal no es el separador de millares.",
             "n09.err.mitad": "Has escrito {mal} — eso es la mitad. Dividir entre 8 no es partir por la mitad." },
  "fr-FR": { "k04.toca_el_numero": "Touche le nombre {palabra}.", "k04.palabra.17": "dix-sept",
             "k04.err.unidad": "Tu as touché {mal}. Écoute encore : dix-SEPT — c'est dix et sept.",
             "k04.err.inversion": "Tu as touché {mal}. Les chiffres sont inversés : {bien}, c'est une dizaine et sept unités.",
             "k04.err.decena": "Tu as touché {mal}. Ça, c'est seulement dix. {bien}, c'est dix et sept de plus.",
             "n09.divide": "Combien font {expr} ?",
             "n09.err.separador": "Tu as écrit {mal}. La virgule décimale n'est pas le séparateur de milliers.",
             "n09.err.mitad": "Tu as écrit {mal} — c'est la moitié. Diviser par 8, ce n'est pas couper en deux." },
  "pt-BR": { "k04.toca_el_numero": "Toque no número {palabra}.", "k04.palabra.17": "dezessete",
             "k04.err.unidad": "Você tocou no {mal}. Escute de novo: deze-SSETE — termina em sete, mas é dez e sete.",
             "k04.err.inversion": "Você tocou no {mal}. Os algarismos estão trocados: {bien} é uma dezena e sete unidades.",
             "k04.err.decena": "Você tocou no {mal}. Esse é só o dez. {bien} é o dez e mais sete.",
             "n09.divide": "Quanto é {expr}?",
             "n09.err.separador": "Você escreveu {mal}. A vírgula decimal não é o separador de milhares.",
             "n09.err.mitad": "Você escreveu {mal} — isso é a metade. Dividir por 8 não é partir ao meio." },
  "pt-PT": { "k04.toca_el_numero": "Toca no número {palabra}.", "k04.palabra.17": "dezassete",
             "k04.err.unidad": "Tocaste no {mal}. Ouve outra vez: deza-SSETE — acaba em sete, mas é dez e sete.",
             "k04.err.inversion": "Tocaste no {mal}. Os algarismos estão trocados: {bien} é uma dezena e sete unidades.",
             "k04.err.decena": "Tocaste no {mal}. Esse é só o dez. {bien} é o dez e mais sete.",
             "n09.divide": "Quanto é {expr}?",
             "n09.err.separador": "Escreveste {mal}. A vírgula decimal não é o separador de milhares.",
             "n09.err.mitad": "Escreveste {mal} — isso é metade. Dividir por 8 não é partir ao meio." },
  "de-DE": { "k04.toca_el_numero": "Tippe auf die Zahl {palabra}.", "k04.palabra.17": "siebzehn",
             "k04.err.unidad": "Du hast auf die {mal} getippt. Hör noch einmal: SIEB-zehn — es endet auf sieben, aber es ist zehn und sieben.",
             "k04.err.inversion": "Du hast auf die {mal} getippt. Du hast gehört „siebzehn“ und zuerst die Sieben geschrieben. {bien}: erst die Zehn, dann die Sieben.",
             "k04.err.decena": "Du hast auf die {mal} getippt. Das ist nur die Zehn. {bien} ist zehn und sieben mehr.",
             "n09.divide": "Wie viel ist {expr}?",
             "n09.err.separador": "Du hast {mal} geschrieben. Das Dezimalkomma ist nicht das Tausendertrennzeichen.",
             "n09.err.mitad": "Du hast {mal} geschrieben — das ist die Hälfte. Durch 8 teilen ist nicht halbieren." },
};

// ---------------------------------------------------------------------------
// 3. Los ejemplos
// ---------------------------------------------------------------------------
// A · Familia K04-numeral-17: SIETE ítems, uno por locale (autoria: por_locale).
//     Comparten estructura y respuesta; NO comparten catálogo de errores.
function itemK04(locale) {
  const errores = [
    { causa: "elige_la_unidad", valor: 7, explicacion: "k04.err.unidad", remedia: "K04",
      evidencia: "mc-34 §7 — la palabra compuesta contiene la unidad en los siete locales" },
    { causa: "elige_la_decena", valor: 10, explicacion: "k04.err.decena", remedia: "K04",
      evidencia: "mc-06 §6 — el marco de diez todavía no está automatizado" },
  ];
  // El error de inversión decena-unidad es del alemán: "siebzehn" se dice
  // sieben-zehn y el niño escribe 71. mc-34 §7 documenta la propiedad de
  // inversión; la literatura de errores de transcodificación está marcada
  // [unverified] en esa misma investigación, y aquí se hereda esa marca.
  if (locale === "de-DE") {
    errores.splice(1, 0, {
      causa: "inversion_decena_unidad", valor: 71, explicacion: "k04.err.inversion",
      remedia: "K04", locales: ["de-DE"],
      evidencia: "mc-34 §7 [unverified] — inversión de unidades y decenas en alemán",
    });
  }
  return {
    tipo_doc: "item",
    id: `K04-numeral-17-${locale}`,
    familia: "K04-numeral-17",
    version: 1,
    estado: "borrador",
    habilidad: "K04",
    nivel: 2,
    dificultad_experta: 34,
    proposito: "concepto",
    formato: "toca_la_respuesta",
    qti: "choiceInteraction",
    autoria: "por_locale",
    locale,
    origen: "plantilla",
    modelo: "K04-palabra-a-numeral",
    cuerpo: {
      consigna: { clave: "k04.toca_el_numero", vars: { n: 17 } },
      escena: { t: "num", v: 17 },
      opciones: [{ t: "num", v: 17 }, { t: "num", v: 71 }, { t: "num", v: 7 }, { t: "num", v: 10 }],
      audio_obligatorio: true,
    },
    respuesta: { tipo: "opcion", valor: 17, tol: 0 },
    errores,
    medios: [
      { rol: "audio_consigna", clave: `audio/k04/${locale}/toca_el_numero_17.opus`, formato: "opus", bytes: 9400 },
    ],
    autoria_meta: { autor: `autor:${locale}`, revisor: null ?? undefined, creado: "2026-07-31", revisado: null },
  };
}

// B · Un ítem de la franja adulta: UNA autoría, SIETE renders (D-034).
const ITEM_N09 = {
  tipo_doc: "item",
  id: "S104-divide-12345-6",
  familia: "S104-divide-12345-6",
  version: 1,
  estado: "borrador",
  habilidad: "S104",
  nivel: 9,
  dificultad_experta: 61,
  proposito: "fluidez",
  formato: "entrada_numerica",
  qti: "textEntryInteraction",
  autoria: "universal",
  origen: "plantilla",
  cuerpo: {
    consigna: { clave: "n09.divide" },
    escena: { t: "op", op: "DIVIDE", args: [{ t: "num", v: 12345.6, decimales: 1 }, { t: "num", v: 8 }] },
    audio_obligatorio: false,
  },
  respuesta: { tipo: "numero", valor: 1543.2, tol: 0 },
  errores: [
    { causa: "punto_por_coma", valor: "15432", explicacion: "n09.err.separador",
      evidencia: "mc-34 §1 — México es el único país hispano con punto decimal" },
    { causa: "divide_por_la_mitad", valor: 6172.8, explicacion: "n09.err.mitad", remedia: "N9" },
  ],
};

// C · Un reto que es una SERIE CURADA (D-018) y otro que es una RECETA (D-034).
const RETO_SERIE = {
  tipo_doc: "reto",
  id: "K04-serie-decenas-01",
  tipo: "PRACTICA",
  banda: "KINDER",
  locale: "de-DE",
  estado: "borrador",
  composicion: {
    modo: "serie",
    items: ["K04-numeral-13-de-DE", "K04-numeral-17-de-DE", "K04-numeral-19-de-DE", "K04-numeral-71-de-DE"],
    variacion: {
      varia: "la unidad dentro de la palabra compuesta (13, 17, 19) y después el orden escrito (17 contra 71)",
      constante: "el formato, las cuatro opciones y la decena",
      por_que: "mc-02 — la variación es la que enseña; el cuarto ítem contrasta 17 con 71 justo después de haber fijado 17",
    },
  },
};

const RETO_RECETA = {
  tipo_doc: "reto",
  id: "S104-receta-fluidez-decimales",
  tipo: "FLUIDEZ",
  banda: "SERIO",
  estado: "borrador",
  composicion: {
    modo: "receta",
    n: 20,
    filtros: { habilidades: ["S104", "S105"], nivel: [8, 10], proposito: ["fluidez"] },
    restricciones: ["sin_repetir_modelo", "max_dos_por_causa", "intercalar_habilidades"],
    variacion: {
      varia: "el divisor y la posición del decimal",
      constante: "el número de cifras del dividendo",
      por_que: "mc-05 — intercalar duele en la sesión y duplica el desempeño al día siguiente",
    },
  },
};

// ---------------------------------------------------------------------------
// 4. Validación con ajv
// ---------------------------------------------------------------------------
const esquema = JSON.parse(readFileSync(join(AQUI, "esquema-item.schema.json"), "utf8"));
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);
const valida = ajv.compile(esquema);

const docs = [...LOCALES.map(itemK04), ITEM_N09, RETO_SERIE, RETO_RECETA];
let fallos = 0;

console.log("── 1. Validación de esquema (ajv, draft-07) ──\n");
for (const doc of docs) {
  const ok = valida(doc);
  if (!ok) {
    fallos++;
    console.log(`  ✗ ${doc.id}`);
    for (const e of valida.errors.slice(0, 4)) console.log(`      ${e.instancePath} ${e.message}`);
  } else {
    console.log(`  ✓ ${doc.id}`);
  }
}

// Control positivo: un documento que DEBE fallar. Un validador que nunca se vio
// rechazar nada no prueba nada (CLAUDE.md § Git, regla 3).
const CONTROLES = [
  ["ítem sin errores catalogados", { ...itemK04("en"), errores: [] }],
  ["ítem con campo de justificación libre", { ...itemK04("en"), justificacion_libre: "por qué" }],
  ["ítem 'universal' con locale", { ...ITEM_N09, locale: "de-DE" }],
  ["reto de KINDER en modo DUELO", { ...RETO_SERIE, tipo: "DUELO" }],
  ["serie sin declarar qué varía", {
    ...RETO_SERIE,
    composicion: { modo: "serie", items: ["K04-numeral-17-de-DE"] },
  }],
];
console.log("\n── 2. Controles positivos: lo que el esquema DEBE rechazar ──\n");
for (const [nombre, doc] of CONTROLES) {
  const ok = valida(doc);
  console.log(`  ${ok ? "✗ NO lo rechazó" : "✓ rechazado"} — ${nombre}`);
  if (ok) fallos++;
}

// ---------------------------------------------------------------------------
// 5. El renderizador — la única capa donde existe texto y notación
// ---------------------------------------------------------------------------
function frase(locale, clave, vars = {}) {
  const txt = FRASES[locale]?.[clave];
  if (txt === undefined) throw new Error(`falta la frase ${clave} en ${locale}`);
  return txt.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

function numero(locale, v, decimales) {
  const c = CONV[locale];
  const partes = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimales ?? 0,
    maximumFractionDigits: decimales ?? 3,
    useGrouping: true,
  }).formatToParts(v);
  // Se agrupa y se separa según MATH_CONVENTIONS (la tabla del producto), no
  // según CLDR: la tabla es la que el dueño revisó y la que audita el repo.
  return partes
    .map((p) => (p.type === "group" ? c.grouping : p.type === "decimal" ? c.decimal : p.value))
    .join("");
}

function expresion(locale, nodo) {
  const c = CONV[locale];
  switch (nodo.t) {
    case "num": return numero(locale, nodo.v, nodo.decimales);
    case "incognita": return "?";
    case "coleccion": return `[${nodo.n} × ${nodo.objeto ?? "objeto"}]`;
    case "op": {
      const s = { SUMA: "+", RESTA: "−", MULTIPLICA: c.multiplication, DIVIDE: c.division, IGUAL: "=", MENOR: "<", MAYOR: ">" }[nodo.op];
      return nodo.args.map((a) => expresion(locale, a)).join(` ${s} `);
    }
    default: return "?";
  }
}

function render(item, locale) {
  const loc = item.autoria === "por_locale" ? item.locale : locale;
  const vars = { ...(item.cuerpo.consigna.vars ?? {}) };
  if (vars.n !== undefined && FRASES[loc][`k04.palabra.${vars.n}`]) {
    vars.palabra = frase(loc, `k04.palabra.${vars.n}`);
  }
  vars.expr = expresion(loc, item.cuerpo.escena);
  return {
    consigna: frase(loc, item.cuerpo.consigna.clave, vars),
    opciones: (item.cuerpo.opciones ?? []).map((o) => expresion(loc, o)),
    errores: item.errores.map((e) => ({
      causa: e.causa,
      dice: frase(loc, e.explicacion, { mal: e.valor, bien: item.respuesta.valor }),
    })),
  };
}

console.log("\n── 3. Un ítem de kinder en los siete locales ──");
console.log("     familia K04-numeral-17 · autoria: por_locale · SIETE ítems hermanos\n");
for (const locale of LOCALES) {
  const item = itemK04(locale);
  const r = render(item, locale);
  console.log(`  ${locale.padEnd(6)} consigna : ${r.consigna}`);
  console.log(`  ${" ".repeat(6)} opciones : ${r.opciones.join("  ")}`);
  console.log(`  ${" ".repeat(6)} errores  : ${item.errores.map((e) => e.causa).join(", ")}`);
  console.log(`  ${" ".repeat(6)} audio    : ${item.medios[0].clave}`);
  console.log(`  ${" ".repeat(6)} Larry si toca 7 : ${r.errores.find((e) => e.causa === "elige_la_unidad").dice}`);
  console.log();
}

console.log("── 4. Un ítem adulto: UNA autoría, SIETE renders (D-034) ──\n");
for (const locale of LOCALES) {
  const r = render(ITEM_N09, locale);
  console.log(`  ${locale.padEnd(6)} ${r.consigna}`);
}

console.log("\n── 5. MATH_CONVENTIONS contra CLDR/Intl ──");
console.log("     Donde no coinciden, alguien tiene que decidir cuál manda.\n");
for (const locale of LOCALES) {
  const nuestro = numero(locale, 12345.6, 1);
  const cldr = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(12345.6);
  const igual = nuestro === cldr;
  const cp = (s) => [...s].map((ch) => (ch.charCodeAt(0) > 127 ? `U+${ch.charCodeAt(0).toString(16).toUpperCase()}` : ch)).join("");
  console.log(`  ${igual ? "=" : "≠"} ${locale.padEnd(6)} tabla: ${cp(nuestro).padEnd(12)} CLDR: ${cp(cldr)}`);
}

console.log(`\n${fallos === 0 ? "✓" : "✗"} ${fallos} fallo(s)`);
process.exit(fallos === 0 ? 0 : 1);
