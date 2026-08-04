#!/usr/bin/env node
// Auditor determinista — toda causa de nota de diagnóstico tiene texto,
// autorado y sin vergüenza, en los siete locales (F8 #283)
//
// Hace cumplir: D-020, D-022, línea roja #7, criterio de aceptación de #283.
//
// Por qué es un auditor PROPIO y no una extensión de `retro-completa.mjs`
// (verificado antes de escribirlo, no asumido): `retro-completa` está
// cableada a un único directorio (`apps/web/src/i18n/reto`) y a una única
// fuente de causas (`banco-kinder.ts::generarBanco().errores`). La fuente de
// ESTAS causas es el CHECK de la migración 0018 y el directorio es
// `i18n/padre/` — estructuralmente distintos. Mismo patrón, otro archivo, que
// es lo que la propia issue manda.
//
// ─── Las tres comprobaciones ────────────────────────────────────────────────
//
//  1. **Toda causa del CHECK tiene plantilla no vacía en los 7 locales.** La
//     fuente de causas se lee de la MIGRACIÓN, a mano — no del motor
//     (`CAUSAS_DE_NOTA`), porque un auditor que juzga con la misma lista que
//     el código usa para decidir no puede fallar nunca (D-070): si alguien
//     añade una causa a la 0018 sin plantilla, esto bloquea aunque el motor
//     esté sincronizado.
//  2. **Ninguna plantilla avergüenza.** El MISMO léxico por locale que juzga
//     lo que Larry le dice al niño (`packages/tutor/src/lexico/`, el de
//     `larry-nunca-averguenza.mjs` — aquí se carga, no se copia: dos listas
//     envejecen distinto). Es la consecuencia de auditoría de la decisión del
//     dueño: las notas se redactan en la voz de Larry (#283), y Larry no
//     humilla ni hablándole al adulto (línea roja #7, D-020).
//  3. **`HABILIDAD_PAUSADA_LATERAL` nombra la habilidad.** `f6-larry-profe.md`
//     §2.3: «el panel del padre sí dice literalmente qué habilidad se pausó y
//     por qué» — una plantilla sin el marcador `{habilidad}` no lo cumple.
//
// LO QUE NO PUEDE COMPROBAR: el sujeto gramatical (que la nota hable del
// patrón y no del niño). Eso no tiene regex honesta — lo cubre la carta
// adversarial `anti-humillacion`, cuya `cita` ya incluye D-017/D-020/mc-15.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { archivos, leer, informar, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR_TEXTOS = "apps/web/src/i18n/padre";
const DIR_LEXICO = "packages/tutor/src/lexico";
const MIGRACION = "migrations/0018_child_diagnostic_notes.sql";

const problemas = [];
let revisados = 0;

// --- 1. Las causas, leídas de la migración (segunda fuente, D-070) ----------
const sql = leer(MIGRACION);
if (sql === null) {
  problemas.push(`no existe ${MIGRACION}: sin la tabla no hay qué verificar — y eso es un fallo, no un visto bueno`);
}

let causas = [];
if (sql !== null) {
  const bloque = sql.match(/CREATE TABLE child_diagnostic_notes \(([\s\S]*?)\n\)/);
  if (!bloque) {
    problemas.push(`${MIGRACION}: no encontré el CREATE TABLE child_diagnostic_notes`);
  } else {
    const check = bloque[1].match(/cause_code\s+TEXT\s+NOT\s+NULL\s+CHECK\s*\(\s*cause_code\s+IN\s*\(([^)]*)\)/);
    if (!check) {
      problemas.push(`${MIGRACION}: el CHECK de cause_code no tiene la forma esperada — si cambió, este auditor tiene que cambiar con ella`);
    } else {
      causas = [...check[1].matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
      if (causas.length === 0) problemas.push(`${MIGRACION}: el CHECK de cause_code no declara ninguna causa`);
    }
  }
}

// --- 2. Los archivos de mensajes: los siete, y cualquiera suelto ------------
const mensajes = {};
const enElDirectorio = existsSync(`${RAIZ}${DIR_TEXTOS}`)
  ? readdirSync(`${RAIZ}${DIR_TEXTOS}`).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""))
  : [];
for (const suelto of enElDirectorio) {
  if (LOCALES.includes(suelto)) continue;
  try {
    mensajes[suelto] = JSON.parse(leer(`${DIR_TEXTOS}/${suelto}.json`) ?? "{}");
  } catch {
    problemas.push(`${DIR_TEXTOS}/${suelto}.json no es JSON válido`);
  }
}
for (const loc of LOCALES) {
  const ruta = `${DIR_TEXTOS}/${loc}.json`;
  if (!existsSync(`${RAIZ}${ruta}`)) {
    problemas.push(`falta ${ruta}: el locale ${loc} no tiene textos del panel (D-022)`);
    continue;
  }
  try {
    mensajes[loc] = JSON.parse(leer(ruta) ?? "{}");
  } catch (err) {
    problemas.push(`${ruta} no es JSON válido: ${String(err).slice(0, 80)}`);
  }
}

// --- 3. El léxico de Larry, cargado (no copiado) ----------------------------
const lexico = {};
if (existsSync(`${RAIZ}${DIR_LEXICO}`)) {
  const presentes = readdirSync(`${RAIZ}${DIR_LEXICO}`).filter((f) => f.endsWith(".json"));
  for (const loc of LOCALES) {
    if (!presentes.includes(`${loc}.json`)) {
      problemas.push(`falta ${DIR_LEXICO}/${loc}.json: ese locale queda sin vigilancia de vergüenza`);
      continue;
    }
    const doc = JSON.parse(readFileSync(`${RAIZ}${DIR_LEXICO}/${loc}.json`, "utf8"));
    lexico[loc] = (doc.construcciones ?? []).map((c) => ({
      categoria: c.categoria,
      re: new RegExp(c.patron, "iu"),
    }));
  }
} else {
  problemas.push(`no existe ${DIR_LEXICO}: sin léxico no hay vigilancia de vergüenza`);
}

// --- 4. Toda causa, en todo locale, con texto y sin vergüenza ---------------
for (const causa of causas) {
  const clave = `padre.nota.${causa}`;
  for (const loc of LOCALES) {
    const m = mensajes[loc];
    if (!m) continue;
    revisados++;
    const texto = m[clave];
    if (typeof texto !== "string" || texto.trim() === "") {
      problemas.push(
        `\`${causa}\` no tiene plantilla en ${loc} (${clave}). Una nota escrita por F4/F6 con esa ` +
          "causa mostraría la clave cruda o un hueco — y solo en ese idioma, que es el modo de " +
          "fallo de D-022: funciona en el idioma de quien lo escribió.",
      );
      continue;
    }
    if (causa === "HABILIDAD_PAUSADA_LATERAL" && !texto.includes("{habilidad}")) {
      problemas.push(
        `${loc}: la plantilla de HABILIDAD_PAUSADA_LATERAL no incluye {habilidad}. f6-larry-profe.md ` +
          "§2.3: el panel dice literalmente QUÉ habilidad se pausó — la honestidad va donde puede procesarse.",
      );
    }
    for (const { categoria, re } of lexico[loc] ?? []) {
      if (re.test(texto)) {
        problemas.push(
          `${loc}: la plantilla de \`${causa}\` cae en el léxico de Larry (${categoria}: ${re.source}). ` +
            "Las notas van en la voz de Larry (#283), y Larry no humilla ni hablándole al adulto " +
            "(línea roja #7, D-020).",
        );
      }
    }
  }
}

informar({
  nombre: "notas-diagnostico-completas",
  problemas,
  revisados,
  cita: "D-020, D-022, LR-7, #283",
  resumen: `toda causa de child_diagnostic_notes tiene plantilla autorada y sin vergüenza en los 7 locales (${causas.length} causas × ${LOCALES.length} locales)`,
  porQueBloquea:
    "D-020 escribió la nota suave como requisito literal, y #283 fijó que va en la voz de Larry: " +
    "una causa sin plantilla es una clave cruda en la cara del padre, y una plantilla humillante " +
    "es una acusación al niño por la puerta del adulto.",
  noComprueba: [
    "el sujeto gramatical de la plantilla (que hable del patrón, no del niño) — eso es la carta adversarial `anti-humillacion`, ya autorizada con D-017/D-020/mc-15.",
  ],
});
