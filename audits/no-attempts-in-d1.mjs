#!/usr/bin/env node
// Auditor determinista 04 — los intentos crudos no van a D1
//
// Hace cumplir: mc-32 riesgo #1 e infrastructure.md — "Los intentos crudos van
// a Analytics Engine, no a D1. D1 topa en 10 GB por base y sería la primera
// pared que golpeamos."
//
// Por qué existe: es el único límite de la arquitectura que se alcanza por un
// error de diseño y no por crecimiento de tráfico. Y cuando se alcanza, la
// migración es dolorosa porque ya hay millones de filas. La mitigación tiene
// que estar desde el primer commit, no retrofiteada — así que se audita desde
// el primer commit.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = "migrations";

// Nombres de tabla que delatan almacenamiento por intento en D1.
const FORBIDDEN = [
  /^attempts?$/i,
  /^raw_attempts?$/i,
  /^responses?$/i,
  /^item_responses?$/i,
  /^events?$/i,
  /^telemetry$/i,
  /^keystrokes?$/i,      // además: mc-30, nunca flujo crudo de teclas
  /^interaction_log$/i,
];

const problems = [];
const tables = [];

for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
  const sql = readFileSync(join(MIGRATIONS, file), "utf8");
  for (const m of sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi)) {
    const name = m[1];
    tables.push(name);
    if (FORBIDDEN.some((re) => re.test(name))) {
      problems.push(`${file}: tabla "${name}" parece almacenamiento por intento`);
    }
  }
}

if (problems.length > 0) {
  console.error("✗ auditor no-attempts-in-d1\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: mc-32 riesgo #1, infrastructure.md`);
  console.error(`  Por qué: D1 topa en 10 GB por base. Es el único límite que se`);
  console.error(`  alcanza por error de diseño y no por crecimiento, y para cuando`);
  console.error(`  se alcanza ya hay millones de filas que migrar.`);
  console.error(`\n  Los intentos van a math-challenge-attempts-ae (Analytics Engine).`);
  console.error(`  D1 guarda rollups (score_totals), no eventos.`);
  process.exit(1);
}

console.log(`✓ no-attempts-in-d1 — ${tables.length} tabla(s), ninguna por intento`);
