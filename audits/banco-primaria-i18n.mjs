#!/usr/bin/env node
// Auditor determinista — el banco de PRIMARIA no sirve nada que no esté en i18n
//
// Hace cumplir: #358, #349, mc-36, D-022, D-070, línea roja #7, #354.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `retro-completa.mjs` comprueba que toda CAUSA del banco de kinder tenga texto
// en los siete locales; hasta F5c nada comprobaba lo mismo de las **opciones de
// respuesta** ni del banco de primaria. #349 es el fallo que este auditor
// habría cazado el día que se escribió: un niño recibió `casilla3` como botón
// porque el único rótulo posible era el identificador.
//
// La regla (#358, textual): **todo texto de cara al usuario sale del catálogo
// de mensajes.** Cualquier cadena que no esté en `src/i18n/` y llegue a un
// botón es un identificador que se escapó.
//
// ─── Las dos fuentes de D-070 ──────────────────────────────────────────────
//
// Nada aquí compara el banco consigo mismo. Cada comprobación cruza dos
// archivos que escriben personas distintas en momentos distintos:
//
//   1. **Todo ítem de la siembra pasa `validarItem`.** La regla vive en
//      `item.ts`; la producción, en `banco-primaria.ts`. (Fuentes: banco × item.ts.)
//   2. **Todo enunciado tiene plantilla en los 7 locales.** El ítem guarda la
//      CLAVE; el texto se autora en `i18n/reto/`. Una clave que falta se sirve
//      cruda — y solo en ese idioma, así que funciona en las pruebas de quien
//      la escribió. (Fuentes: banco × catálogos.)
//   3. **Toda causa tiene sus DOS frases en los 7 locales.** mc-11: nombrar el
//      error Y dar el siguiente paso; un marcador desnudo empeora el desempeño
//      (Kluger & DeNisi). (Fuentes: banco × catálogos.)
//   4. **Ninguna opción se presenta como su identificador.** Toda opción de
//      cadena trae `dibujos[valor]` con glifo y una clave de nombre accesible
//      que existe en los 7 locales. Es #349, generalizado al banco de D1.
//      (Fuentes: banco × catálogos.)
//   5. **Las claves de primaria están completas en los 7 catálogos.** Alguien
//      edita seis locales y se le pasa el séptimo; la clave sigue y el hueco
//      solo se ve en ese idioma. (Fuentes: catálogo × catálogo.)
//   6. **El cable del apagado por nivel sigue conectado (#354, Kalyuga).** El
//      ejemplo resuelto se apaga por nivel solo si TRES piezas siguen
//      hablándose: la plantilla declara el techo (`TECHO_POR_HABILIDAD`), el
//      guion de siembra lo escribe en `hasta_nivel`, y `/api/jugar` filtra con
//      él. Renombrar o quitar una no rompe nada visible: el modelo se sirve
//      para siempre, y el andamiaje que enseña al principiante estorba al que
//      ya sabe. (Fuentes: banco × guion × endpoint × migración.)
//
// LO QUE NO PUEDE COMPROBAR: que el texto sea bueno, ni que el ítem enseñe
// (eso lo juzga una persona — mc-40), ni lo que llegue a D1 por una edición
// manual posterior a la siembra (eso lo atrapa `validarItem` al leer, en vivo).

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { leer, informar, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];

// --- 0. Las piezas. Fallar CERRADO si falta cualquiera -----------------------
const bancoMod = await import(`${RAIZ}packages/motor/src/banco-primaria.ts`).catch(() => null);
const itemMod = await import(`${RAIZ}packages/motor/src/item.ts`).catch(() => null);
if (!bancoMod || !itemMod) {
  problemas.push("no pude importar el banco de primaria o item.ts para cruzarlos");
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

const banco = bancoMod ? bancoMod.generarBancoPrimaria() : [];
if (bancoMod && banco.length === 0) {
  problemas.push("el banco de primaria generó 0 ítems: un auditor sobre un banco vacío aprueba siempre");
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

// --- 2/3/4. Claves del banco contra los 7 catálogos ---------------------------
const causas = new Set();
const enunciados = new Set();
const dibujoClaves = new Set();

for (const item of banco) {
  enunciados.add(item.enunciado.clave);
  for (const e of item.errores ?? []) causas.add(e.causa);
  for (const c of item.tambienCorrectas ?? []) causas.add(c.razon);

  // 4. La regla de #349, generalizada: toda opción de cadena trae dibujo con
  // glifo y una clave que existe en los 7 locales.
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
          "Servida así, el botón mostraría el identificador crudo — es #349 (`casilla3`) en el banco de primaria.",
      );
      continue;
    }
    dibujoClaves.add(dib.clave);
  }
}

for (const clave of [...enunciados].sort()) {
  const faltan = LOCALES.filter((l) => catalogos[l] && typeof catalogos[l][clave] !== "string");
  if (faltan.length > 0) {
    problemas.push(
      `el enunciado \`${clave}\` no tiene plantilla en ${faltan.join(", ")}. Se serviría la clave ` +
        "cruda o un hueco — y solo en ese idioma (D-022, #358).",
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

for (const clave of [...dibujoClaves].sort()) {
  const faltan = LOCALES.filter((l) => catalogos[l] && typeof catalogos[l][clave] !== "string");
  if (faltan.length > 0) {
    problemas.push(
      `el nombre accesible \`${clave}\` no existe en ${faltan.join(", ")}: el lector de pantalla ` +
        "anunciaría la clave cruda (D-022, #349).",
    );
  }
}

// --- 5. Paridad de las claves de primaria entre catálogos ----------------------
const esDePrimaria = (k) => k.startsWith("p.") || k.startsWith("error.p.") || k.startsWith("habilidad.P");
const conjuntos = new Map();
for (const loc of LOCALES) {
  if (!catalogos[loc]) continue;
  conjuntos.set(loc, new Set(Object.keys(catalogos[loc]).filter(esDePrimaria)));
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

// --- 6. El cable del apagado por nivel (#354) -----------------------------------
//
// Tres piezas escritas en sitios distintos: la declaración (banco), la siembra
// (guion) y el filtro (endpoint). Si una se desconecta, el ejemplo resuelto se
// sirve para siempre y nada visible se rompe.
const guion = leer("scripts/sembrar-banco-primaria.mjs");
if (!guion) {
  problemas.push("falta scripts/sembrar-banco-primaria.mjs: la siembra de D1 no tiene origen");
} else {
  // La comprobación EJECUTA el guion y mira el SQL que emite: comprobar que el
  // texto del guion menciona el techo no vale — un import sin uso, o una
  // consulta movida al resumen, cumple la cadena y no escribe nada. Lo cazó el
  // propio arnés de controles negativos, dos veces seguidas.
  let sql = null;
  try {
    execFileSync("node", [
      "--experimental-strip-types", "--no-warnings",
      "scripts/sembrar-banco-primaria.mjs", "--salida", "/tmp/f5c-auditor-siembra.sql",
    ], { cwd: RAIZ, stdio: ["ignore", "ignore", "ignore"] });
    // `readFileSync` directo: `leer()` de lib/repo es relativo AL REPO y /tmp no.
    sql = readFileSync("/tmp/f5c-auditor-siembra.sql", "utf8");
  } catch {
    sql = null;
  }
  if (!sql) {
    problemas.push("el guion de siembra no corrió o no dejó SQL: sin siembra no hay banco en D1");
  } else {
    const filas = [...sql.matchAll(/INSERT OR IGNORE INTO item_bank [^\n]*'([A-Z0-9]+)', (\d+), (NULL|\d+),/g)];
    if (filas.length === 0) {
      problemas.push("el SQL de la siembra no tiene ninguna fila de item_bank que este auditor entienda");
    }
    const malTecho = filas.filter(([, hab, , hasta]) =>
      (hab === "P03" && hasta !== "4") || (hab !== "P03" && hasta !== "NULL"));
    if (malTecho.length > 0) {
      problemas.push(
        `${malTecho.length} fila(s) de la siembra con el techo mal escrito (la primera: ${malTecho[0][0].slice(0, 90)}…). ` +
          "P03 debe llegar a D1 con hasta_nivel = 4 y las demás con NULL: si el techo no llega a la " +
          "tabla, el ejemplo resuelto se sirve para siempre (Kalyuga, #354).",
      );
    }
    notas.push(`siembra ejecutada: ${filas.length} filas, techo comprobado fila a fila`);
  }
}

const endpoint = leer("apps/web/src/pages/api/jugar.ts");
if (!endpoint) {
  problemas.push("falta apps/web/src/pages/api/jugar.ts");
} else if (!endpoint.includes("hastaNivel")) {
  problemas.push(
    "/api/jugar ya no filtra por `hastaNivel`: el techo llegaría a D1 y nadie lo aplicaría. " +
      "La reversión de la pericia (Kalyuga, #354) no es opcional.",
  );
}

const migracion = leer("migrations/0016_banco_items_primaria.sql");
if (!migracion) {
  problemas.push("falta migrations/0016_banco_items_primaria.sql");
} else if (!migracion.includes("hasta_nivel")) {
  problemas.push("la migración 0016 no tiene la columna `hasta_nivel` que el techo necesita (#354)");
}

if (bancoMod) {
  const techos = bancoMod.TECHO_POR_HABILIDAD ?? {};
  for (const [h, techo] of Object.entries(techos)) {
    if (!(h in (bancoMod.HABILIDADES_PRIMARIA ?? {}))) {
      problemas.push(`TECHO_POR_HABILIDAD declara ${h}, que no es una habilidad de primaria`);
    }
    if (!Number.isInteger(techo) || techo < 1 || techo > 12) {
      problemas.push(`TECHO_POR_HABILIDAD.${h} = ${techo}: fuera de la escalera 1..12 de D-017`);
    }
  }
  notas.push(`techo declarado: ${Object.entries(techos).map(([h, t]) => `${h}→N${t}`).join(", ") || "ninguno"}`);
}

notas.push(`${enunciados.size} enunciados, ${causas.size} causas, ${dibujoClaves.size} nombres accesibles × ${LOCALES.length} locales`);

informar({
  nombre: "banco-primaria-i18n",
  problemas,
  notas,
  cita: "#358, #349, #354, mc-36, mc-11, D-022, D-070",
  revisados: banco.length + Object.keys(catalogos).length,
  resumen: `${banco.length} ítems de primaria cruzados con los 7 catálogos y el cable del techo`,
  porQueBloquea:
    "una opción que llega a pantalla como su identificador es peor que un ítem menos: " +
    "quien juega no puede decir que la pantalla está incompleta, toca al azar, y el motor " +
    "registra como fallo algo que nunca fue una pregunta (#349).",
  noComprueba: [
    "que el texto esté bien escrito — «hay texto» no es el criterio; la calidad la juzga una persona (mc-40)",
    "las filas de D1 editadas a mano después de la siembra — eso lo atrapa `validarItem` al leer, en vivo",
    "el banco de kinder — tiene sus propios auditores (retro-completa, opciones-contestables)",
  ],
});
