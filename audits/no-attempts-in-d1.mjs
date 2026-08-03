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

// ---------------------------------------------------------------------------
// Los Durable Objects (F7 #242)
// ---------------------------------------------------------------------------
//
// La regla de `mc-32` riesgo #1 no era solo de D1, y este auditor no lo veía. Un
// Durable Object es un sitio comodísimo para ir dejando «solo un campito más»
// —el `itemId` para depurar, el tiempo de respuesta para afinar— y al cabo de un
// año es un expediente por menor con historial de teclas. La diferencia con D1
// es que el DO no topa en 10 GB, así que nada avisa: crece y nadie lo nota.
//
// Lo que se guarda en un DO es **estado derivado**: estimaciones, contadores,
// fechas, totales. El intento crudo va a `math-challenge-attempts-ae` y a ningún
// otro sitio. Se mira el código sin comentarios, para que un DO pueda explicar
// por qué NO guarda el intento crudo sin que explicarlo cuente como guardarlo.

const CRUDO = [
  ["item_?id", "el identificador del ítem servido"],
  ["enunciado", "el texto del problema"],
  ["keystroke", "el flujo de teclas — mc-30 y línea roja #8"],
  ["pulsacion", "el flujo de teclas — mc-30 y línea roja #8"],
  ["borrados", "cuántas veces se corrigió — línea roja #8"],
  ["rt_?ms", "el tiempo de respuesta crudo"],
  ["tiempo_?de_?respuesta", "el tiempo de respuesta crudo"],
  ["response_?time", "el tiempo de respuesta crudo"],
];

const { archivos, leer, sinComentarios, palabra, SOLO_PRODUCTO } = await import("./lib/repo.mjs");

const clasesDO = archivos(/\.(ts|tsx|js|mjs)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => /DurableObjectState/.test(leer(f) ?? ""));

for (const archivo of clasesDO) {
  const texto = sinComentarios(leer(archivo) ?? "");
  for (const [campo, que] of CRUDO) {
    if (palabra(campo).test(texto)) {
      problems.push(
        `${archivo}: un Durable Object guarda \`${campo.replace("_?", "_")}\` — ${que}. ` +
          "mc-32 riesgo #1: un DO guarda estado DERIVADO (estimaciones, contadores, totales), " +
          "jamás el intento crudo, que va a math-challenge-attempts-ae. Y a diferencia de D1, " +
          "un DO no topa en 10 GB: crece sin que nada avise.",
      );
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

if (clasesDO.length === 0) {
  console.error("✗ no-attempts-in-d1 — 0 clases de Durable Object revisadas.");
  console.error("  Hay al menos tres declaradas en wrangler.jsonc; si el escáner no las ve,");
  console.error("  aprueba siempre y eso es un fallo, no un pase.");
  process.exit(1);
}

console.log(
  `✓ no-attempts-in-d1 — ${tables.length} tabla(s) y ${clasesDO.length} Durable Object(s), ` +
    "ninguno por intento",
);
