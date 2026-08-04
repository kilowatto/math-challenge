#!/usr/bin/env node
// Auditor determinista — la franja adulta (SERIO) no sirve nada que no esté en i18n
//
// Hace cumplir: #162, #166, mc-36, mc-11, D-022, D-034, D-070, línea roja #7.
//
// Es el hermano de `banco-primaria-i18n.mjs` para la franja N8–N10, con el
// mismo principio de las dos fuentes de D-070: nada aquí compara el banco
// consigo mismo; cada comprobación cruza dos archivos escritos en sitios
// distintos:
//
//   1. **Todo ítem de la siembra pasa `validarItem`.** La regla vive en
//      `item.ts`; la producción, en `banco-adulto.ts`. (#166: un adulto
//      también merece que Larry sepa QUÉ error cometió.)
//   2. **Todo enunciado tiene plantilla en los 7 locales.** UNA clave por
//      ítem —nunca siete autorías (#162)— y el texto autorado por locale en
//      `i18n/reto/`.
//   3. **Toda causa tiene sus DOS frases en los 7 locales** (mc-11: nombrar el
//      error Y dar el siguiente paso; el registro es adulto, el respeto es el
//      mismo — línea roja #7).
//   4. **Las claves de la franja están completas en los 7 catálogos.** Alguien
//      edita seis locales y el séptimo queda atrás, en silencio.
//   5. **El cable de la siembra sigue conectado.** El guion se EJECUTA y su
//      SQL se lee fila a fila: banda = 'SERIO' en todas, hasta_nivel NULL en
//      todas (la franja no tiene andamiaje que apagar — no hay reversión de la
//      pericia que aplicar, Kalyuga vía #354), y el nivel dentro de 8..10.
//   6. **El enchufe sigue enchufado.** `/api/jugar` sirve la franja al adulto
//      a través de `bancoAdultoD1`; si ese import se corta, la franja existe
//      entera y nadie la ve — sin error visible.
//
// LO QUE NO PUEDE COMPROBAR: que el texto sea bueno (eso lo juzga una persona
// — mc-40, revisión humana declarada en el PR), ni lo que llegue a D1 por una
// edición manual posterior a la siembra (eso lo atrapa `validarItem` al leer,
// en vivo).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { leer, informar, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];

// --- 0. Las piezas. Fallar CERRADO si falta cualquiera -----------------------
const bancoMod = await import(`${RAIZ}packages/motor/src/banco-adulto.ts`).catch(() => null);
const itemMod = await import(`${RAIZ}packages/motor/src/item.ts`).catch(() => null);
if (!bancoMod || !itemMod) {
  problemas.push("no pude importar el banco de la franja o item.ts para cruzarlos");
}

const catalogos = {};
for (const loc of LOCALES) {
  const crudo = leer(`${DIR}/${loc}.json`);
  if (!crudo) {
    problemas.push(`falta ${DIR}/${loc}.json: el locale ${loc} no tiene textos del reto`);
    continue;
  }
  try {
    catalogos[loc] = JSON.parse(crudo);
  } catch (e) {
    problemas.push(`${DIR}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
  }
}

const banco = bancoMod ? bancoMod.generarBancoAdulto() : [];
if (bancoMod && banco.length === 0) {
  problemas.push("el banco de la franja generó 0 ítems: un auditor sobre un banco vacío aprueba siempre");
}

// --- 1. Toda la siembra pasa validarItem --------------------------------------
if (bancoMod && itemMod) {
  const invalidos = banco.map((i) => ({ i, p: itemMod.validarItem(i) })).filter((x) => x.p.length);
  for (const { i, p } of invalidos.slice(0, 5)) {
    problemas.push(`ítem inválido ${i.id}: ${p.join(" | ")}`);
  }
  if (invalidos.length > 5) problemas.push(`… y ${invalidos.length - 5} ítems inválidos más`);
  notas.push(`${banco.length} ítems × validarItem`);
}

// --- 2/3. Claves del banco contra los 7 catálogos ------------------------------
const causas = new Set();
const enunciados = new Set();

for (const item of banco) {
  enunciados.add(item.enunciado.clave);
  for (const e of item.errores ?? []) causas.add(e.causa);
  for (const c of item.tambienCorrectas ?? []) causas.add(c.razon);
  // La franja no tiene opciones de cadena (toda opción es un número, y el
  // número lo escribe formatear()): si alguna aparece, cae en la regla de
  // #349 como en primaria — tiene que traer su dibujo.
  const opciones = [
    item.respuesta?.valor,
    ...(item.errores ?? []).map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((c) => c.valor),
  ];
  for (const v of opciones) {
    if (typeof v !== "string") continue;
    const dib = item.dibujos?.[v];
    if (!dib?.glifo || !dib?.clave) {
      problemas.push(
        `${item.id}: la opción "${v}" no es un número y no tiene \`dibujos["${v}"]\` con glifo y clave. ` +
          "Servida así, el botón mostraría el identificador crudo — es #349 en la franja adulta.",
      );
    }
  }
}

for (const clave of [...enunciados].sort()) {
  const faltan = LOCALES.filter((l) => catalogos[l] && typeof catalogos[l][clave] !== "string");
  if (faltan.length > 0) {
    problemas.push(
      `el enunciado \`${clave}\` no tiene plantilla en ${faltan.join(", ")}. Se serviría la clave ` +
        "cruda o un hueco — y solo en ese idioma (D-022, #162).",
    );
  }
}

for (const causa of [...causas].sort()) {
  const faltan = LOCALES.filter((l) => {
    if (!catalogos[l]) return true;
    const v = catalogos[l][causa];
    return !Array.isArray(v) || v.length !== 2 || v.some((f) => typeof f !== "string" || f.trim() === "");
  });
  if (faltan.length > 0) {
    problemas.push(
      `la causa \`${causa}\` no tiene sus dos frases (qué pasó + siguiente paso) en ${faltan.join(", ")}. ` +
        "Un marcador desnudo es de los peores tipos de retroalimentación medidos (mc-11, Kluger & DeNisi).",
    );
  }
}

// --- 4. Paridad de las claves de la franja entre catálogos ---------------------
const esDeLaFranja = (k) => k.startsWith("a.") || k.startsWith("error.a.") || k.startsWith("habilidad.A");
const conjuntos = new Map();
for (const loc of LOCALES) {
  if (!catalogos[loc]) continue;
  conjuntos.set(loc, new Set(Object.keys(catalogos[loc]).filter(esDeLaFranja)));
}
const todas = new Set([...conjuntos.values()].flatMap((s) => [...s]));
for (const clave of [...todas].sort()) {
  const faltan = LOCALES.filter((l) => conjuntos.has(l) && !conjuntos.get(l).has(clave));
  if (faltan.length > 0) {
    problemas.push(
      `la clave \`${clave}\` existe en unos locales y falta en ${faltan.join(", ")}. Alguien editó ` +
        "seis catálogos y el séptimo quedó atrás, en silencio (D-022).",
    );
  }
}

// --- 5. El cable de la siembra, EJECUTADO --------------------------------------
//
// Comprobar que el texto del guion menciona la banda no vale — un import sin
// uso cumple la cadena y no escribe nada. Se corre el guion y se lee el SQL.
const guion = leer("scripts/sembrar-banco-adulto.mjs");
if (!guion) {
  problemas.push("falta scripts/sembrar-banco-adulto.mjs: la siembra de la franja no tiene origen");
} else {
  let sql = null;
  try {
    execFileSync("node", [
      "--experimental-strip-types", "--no-warnings",
      "scripts/sembrar-banco-adulto.mjs", "--salida", "/tmp/f5b-auditor-siembra.sql",
    ], { cwd: RAIZ, stdio: ["ignore", "ignore", "ignore"] });
    // `readFileSync` directo: `leer()` de lib/repo es relativo AL REPO y /tmp no.
    sql = readFileSync("/tmp/f5b-auditor-siembra.sql", "utf8");
  } catch {
    sql = null;
  }
  if (!sql) {
    problemas.push("el guion de siembra de la franja no corrió o no dejó SQL: sin siembra no hay franja en D1");
  } else {
    const filas = [...sql.matchAll(/INSERT OR IGNORE INTO item_bank [^\n]*VALUES \('[^']+', '([A-Z]+)', '([A-Z0-9]+)', (\d+), (NULL|\d+),/g)];
    if (filas.length === 0) {
      problemas.push("el SQL de la siembra de la franja no tiene ninguna fila de item_bank que este auditor entienda");
    }
    const malBanda = filas.filter(([, banda]) => banda !== "SERIO");
    if (malBanda.length > 0) {
      problemas.push(
        `${malBanda.length} fila(s) de la siembra de la franja con banda distinta de SERIO. ` +
          "Sembrada con otra banda, la franja existe y `/api/jugar` no la encuentra — sin error visible.",
      );
    }
    const malTecho = filas.filter(([, , , , hasta]) => hasta !== "NULL");
    if (malTecho.length > 0) {
      problemas.push(
        `${malTecho.length} fila(s) de la franja con hasta_nivel distinto de NULL. La franja no tiene ` +
          "andamiaje que apagar por nivel (no hay reversión de la pericia que aplicar, #354): un techo " +
          "aquí es una fila que deja de servirse sola.",
      );
    }
    const malNivel = filas.filter(([, , , nivel]) => Number(nivel) < 8 || Number(nivel) > 10);
    if (malNivel.length > 0) {
      problemas.push(
        `${malNivel.length} fila(s) de la franja fuera de N8–N10 (D-017, D-034): es una franja, no una banda.`,
      );
    }
    notas.push(`siembra ejecutada: ${filas.length} filas, banda y techo comprobados fila a fila`);
  }
}

// --- 6. El enchufe sigue enchufado ----------------------------------------------
const endpoint = leer("apps/web/src/pages/api/jugar.ts");
if (!endpoint) {
  problemas.push("falta apps/web/src/pages/api/jugar.ts");
} else if (!endpoint.includes("bancoAdultoD1")) {
  problemas.push(
    "/api/jugar ya no sirve la franja al adulto (`bancoAdultoD1` no aparece). La franja existiría " +
      "entera en D1 y ningún adulto la vería — sin error visible (#159).",
  );
}
const lib = leer("apps/web/src/lib/banco-adulto.ts");
if (!lib) {
  problemas.push("falta apps/web/src/lib/banco-adulto.ts: el origen SERIO de /api/jugar no existe");
} else if (!lib.includes("'SERIO'")) {
  problemas.push("apps/web/src/lib/banco-adulto.ts ya no lee banda = 'SERIO': el origen apunta a otra franja");
}

notas.push(`${enunciados.size} enunciados, ${causas.size} causas × ${LOCALES.length} locales`);

informar({
  nombre: "banco-adulto-i18n",
  problemas,
  notas,
  cita: "#162, #166, mc-36, mc-11, D-022, D-034, D-070",
  revisados: banco.length + Object.keys(catalogos).length,
  resumen: `${banco.length} ítems de la franja adulta cruzados con los 7 catálogos y el cable de la siembra`,
  porQueBloquea:
    "una clave sin texto muestra la clave cruda, y solo en el idioma que no habla quien " +
    "escribió el código — funciona en sus pruebas y falla para quien juega (mc-11, D-022).",
  noComprueba: [
    "que el texto esté bien escrito — «hay texto» no es el criterio; la calidad la juzga una persona (mc-40)",
    "las filas de D1 editadas a mano después de la siembra — eso lo atrapa `validarItem` al leer, en vivo",
    "la notación por locale — eso lo ejecuta `franja-adulta.mjs` contra la tabla de mc-34 escrita a mano",
  ],
});
