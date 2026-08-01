#!/usr/bin/env node
// Auditor determinista 03 — los siete locales, en todas partes
//
// Hace cumplir: D-022 — cinco idiomas pero SIETE locales. es-MX y es-ES no
// comparten separador decimal; pt-BR y pt-PT no comparten escala numérica.
//
// Por qué existe: el modo de falla no es olvidar un idioma, es tratar "es" o
// "pt" como uno solo. mc-34 lo documenta: México es el único país hispano con
// punto decimal, Portugal usa escala larga y Brasil corta, y la división larga
// se dibuja distinto en México que en Brasil y España. Un fallback de "es"
// produce contenido matemáticamente incorrecto sin que nadie lo note.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const problems = [];
const notes = [];

// 1. wrangler.jsonc declara los siete
const wrangler = readFileSync("wrangler.jsonc", "utf8");
for (const loc of LOCALES) {
  if (!wrangler.includes(loc)) problems.push(`wrangler.jsonc no declara "${loc}"`);
}

// 2. Las migraciones que restringen locale los aceptan todos
const migDir = "migrations";
if (existsSync(migDir)) {
  for (const file of readdirSync(migDir).filter((f) => f.endsWith(".sql"))) {
    const sql = readFileSync(join(migDir, file), "utf8");
    // Cada CHECK que menciona locales debe mencionar los siete.
    const checks = sql.match(/CHECK\s*\(\s*\w*locale\w*\s+IN\s*\(([^)]*)\)/gi) ?? [];
    for (const check of checks) {
      for (const loc of LOCALES) {
        if (!check.includes(`'${loc}'`)) {
          problems.push(`${file}: un CHECK de locale omite "${loc}"`);
        }
      }
    }
    if (checks.length > 0) notes.push(`${file}: ${checks.length} CHECK(s) de locale`);
  }
}

// 3. Si existen archivos de mensajes, los siete deben estar y con las mismas llaves
const msgDir = "apps/web/src/i18n";
if (existsSync(msgDir)) {
  const present = readdirSync(msgDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
  for (const loc of LOCALES) {
    if (!present.includes(loc)) problems.push(`falta ${msgDir}/${loc}.json`);
  }
  if (present.includes("en")) {
    const base = JSON.parse(readFileSync(join(msgDir, "en.json"), "utf8"));
    const baseKeys = Object.keys(base).sort();
    for (const loc of present.filter((l) => l !== "en")) {
      const other = JSON.parse(readFileSync(join(msgDir, `${loc}.json`), "utf8"));
      const missing = baseKeys.filter((k) => !(k in other));
      const extra = Object.keys(other).filter((k) => !baseKeys.includes(k));
      for (const k of missing) problems.push(`${loc}.json: falta la llave "${k}"`);
      for (const k of extra) problems.push(`${loc}.json: llave sobrante "${k}"`);
    }
  }
} else {
  notes.push(`${msgDir} no existe todavía — se revisará cuando exista (F0/F2)`);
}

if (problems.length > 0) {
  console.error("✗ auditor locales-complete\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-022, mc-34`);
  console.error(`  Por qué: el fallo no es olvidar un idioma, es tratar "es" o "pt"`);
  console.error(`  como uno solo. México usa punto decimal y España coma; Portugal`);
  console.error(`  escala larga y Brasil corta. Un fallback produce matemáticas`);
  console.error(`  incorrectas sin que nadie lo note.`);
  process.exit(1);
}

console.log(`✓ locales-complete — los 7 locales presentes`);
for (const n of notes) console.log(`  · ${n}`);
