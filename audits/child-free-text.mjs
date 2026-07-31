#!/usr/bin/env node
// Auditor determinista 02 — ningún niño escribe texto libre
//
// Hace cumplir: CLAUDE.md línea roja #3 — "Ningún niño escribe texto libre, en
// ninguna superficie del producto." Y D-013, D-003, mc-43.
//
// Por qué existe, y por qué es determinista y no de criterio: Roblox invierte
// en 1,600 moderadores más filtrado por IA y el contenido inapropiado sigue
// reapareciendo (mc-46 §4). A nuestra escala, la única garantía es que el campo
// no exista. Este auditor busca el campo, no el contenido.
//
// Alcance: el esquema de D1. Un campo de texto escribible por un niño no debe
// existir en las tablas de niño. Cuando haya interfaz (F2+), este auditor crece
// para buscar <input type=text> y <textarea> en las rutas de niño.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = "migrations";

// Tablas donde un niño es el sujeto. Un campo de texto libre aquí es la
// violación: lo que el niño elige (alias, avatar) se elige de un conjunto
// acotado y se guarda como referencia, no como prosa.
const CHILD_TABLES = ["child_profiles", "child_image_pin", "skill_state"];

// Columnas de texto permitidas en esas tablas, con su razón. Todo lo demás que
// sea TEXT y no esté aquí se reporta.
const ALLOWED = {
  id: "identificador",
  parent_user_id: "referencia",
  child_profile_id: "referencia",
  skill_id: "referencia",
  updated_by: "referencia",
  alias: "GENERADO por el sistema, elegido entre opciones — nunca escrito (D-003)",
  alias_locale: "enum de 7 locales",
  locale: "enum de 7 locales",
  theme_band: "enum de 3 bandas",
  avatar_parts: "JSON de índices al catálogo de piezas — nunca texto del niño",
  pin_hash: "hash",
  period: "enum",
};

const problems = [];
let checkedTables = 0;

const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS, file), "utf8");

  for (const table of CHILD_TABLES) {
    const re = new RegExp(`CREATE\\s+TABLE\\s+${table}\\s*\\(([\\s\\S]*?)\\n\\);`, "i");
    const match = sql.match(re);
    if (!match) continue;
    checkedTables++;

    for (const rawLine of match[1].split("\n")) {
      const line = rawLine.replace(/--.*$/, "").trim();
      if (!line || /^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line)) continue;

      const col = line.match(/^([a-z_][a-z0-9_]*)\s+(TEXT|VARCHAR)/i);
      if (!col) continue;

      const name = col[1];
      if (name in ALLOWED) continue;

      // Un CHECK ... IN (...) en la misma línea acota el dominio: no es libre.
      if (/CHECK\s*\(/i.test(line)) continue;

      problems.push(`${file} · ${table}.${name} es TEXT sin dominio acotado`);
    }
  }
}

if (problems.length > 0) {
  console.error("✗ auditor child-free-text — posible campo de texto libre en tabla de niño\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: CLAUDE.md línea roja #3, D-013, D-003`);
  console.error(`  Por qué: Roblox tiene 1,600 moderadores y no le alcanza (mc-46 §4).`);
  console.error(`  A nuestra escala la única garantía es que el campo no exista.`);
  console.error(`\n  Si el campo es legítimo, agrégalo a ALLOWED en este archivo`);
  console.error(`  CON SU RAZÓN — esa es la anulación por escrito que pide D-032.`);
  process.exit(1);
}

console.log(`✓ child-free-text — ${checkedTables} tabla(s) de niño sin texto libre`);
