#!/usr/bin/env node
// Auditor determinista 01 — prefijo de objetos de Cloudflare
//
// Hace cumplir: CLAUDE.md § Cloudflare — "Todo objeto lleva prefijo
// `math-challenge-`. Sin excepción, ni en pruebas (ahí se sufija:
// math-challenge-db-dev)."
//
// Por qué existe: un recurso creado sin prefijo es indistinguible de los de IOS
// y de IMP en el dashboard, porque las tres cosas comparten la misma cuenta de
// Cloudflare (D-001, D-023). El prefijo es lo único que las separa visualmente.
//
// Regla de D-032: este auditor cita la decisión que hace cumplir, y bloquea.

import { readFileSync } from "node:fs";

const CONFIG = "wrangler.jsonc";
const PREFIX = "math-challenge-";

// Campos de wrangler.jsonc que nombran un objeto real en la cuenta.
const NAMED_FIELDS = [
  ["name", (c) => [c.name]],
  ["d1_databases[].database_name", (c) => (c.d1_databases ?? []).map((d) => d.database_name)],
  ["analytics_engine_datasets[].dataset", (c) => (c.analytics_engine_datasets ?? []).map((d) => d.dataset)],
  ["queues.producers[].queue", (c) => (c.queues?.producers ?? []).map((q) => q.queue)],
  ["queues.consumers[].queue", (c) => (c.queues?.consumers ?? []).map((q) => q.queue)],
  ["r2_buckets[].bucket_name", (c) => (c.r2_buckets ?? []).map((b) => b.bucket_name)],
  ["vectorize[].index_name", (c) => (c.vectorize ?? []).map((v) => v.index_name)],
  ["workflows[].name", (c) => (c.workflows ?? []).map((w) => w.name)],
];

// jsonc -> json. Suficiente para nuestro archivo: quita // y /* */ fuera de
// cadenas, y comas colgantes.
function stripJsonc(src) {
  let out = "";
  let inStr = false, inLine = false, inBlock = false, esc = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inLine) { if (c === "\n") { inLine = false; out += c; } continue; }
    if (inBlock) { if (c === "*" && n === "/") { inBlock = false; i++; } continue; }
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; out += c; continue; }
    if (c === "/" && n === "/") { inLine = true; i++; continue; }
    if (c === "/" && n === "*") { inBlock = true; i++; continue; }
    out += c;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

// El inventario canónico de nombres vive en infrastructure.md, no en
// wrangler.jsonc — porque hay objetos cuyo NOMBRE nunca aparece en la config:
// un KV namespace solo declara `binding` e `id`, y su título vive únicamente en
// Cloudflare. Sin este cruce, el auditor era ciego a exactamente esos.
const INVENTORY = "docs/infrastructure.md";

function inventoryNames() {
  const names = [];
  try {
    for (const line of readFileSync(INVENTORY, "utf8").split("\n")) {
      // Renglones de la tabla de inventario: | `nombre` | tipo | ...
      const m = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/i);
      if (m) names.push(m[1]);
    }
  } catch {
    return null;
  }
  return names;
}

// Bindings declarados en el inventario, última columna: | ... | `BINDING` |
// Wrangler propone bindings derivados del nombre del objeto
// (math_challenge_session_kv) cuando lo crea desde la CLI, y los escribe solo
// en la config. Si nadie los corrige, la config y el inventario se separan en
// silencio — que es lo que este cruce impide.
function inventoryBindings() {
  const bindings = new Set();
  try {
    for (const line of readFileSync(INVENTORY, "utf8").split("\n")) {
      if (!/^\|\s*`math-challenge-/.test(line)) continue;
      const cols = line.split("|");
      const last = cols[cols.length - 2]?.trim() ?? "";
      const m = last.match(/^`([A-Z][A-Z0-9_]*)`$/);
      if (m) bindings.add(m[1]);
    }
  } catch {
    return null;
  }
  return bindings;
}

const problems = [];
let config;

try {
  config = JSON.parse(stripJsonc(readFileSync(CONFIG, "utf8")));
} catch (err) {
  console.error(`✗ no se pudo leer ${CONFIG}: ${err.message}`);
  process.exit(1);
}

let checked = 0;
for (const [label, extract] of NAMED_FIELDS) {
  for (const value of extract(config).filter(Boolean)) {
    checked++;
    if (!value.startsWith(PREFIX)) {
      problems.push(`${label}: "${value}" no empieza con "${PREFIX}"`);
    }
  }
}

// Cruce con el inventario: todo objeto listado en infrastructure.md lleva
// prefijo, aunque su nombre nunca llegue a wrangler.jsonc.
const inventory = inventoryNames();
if (inventory === null) {
  problems.push(`no se pudo leer ${INVENTORY} — es el inventario canónico de nombres`);
} else {
  for (const name of inventory) {
    checked++;
    if (!name.startsWith(PREFIX)) {
      problems.push(`${INVENTORY}: "${name}" no empieza con "${PREFIX}"`);
    }
  }
}

// Cruce de bindings: los de wrangler.jsonc deben existir en el inventario.
// `ASSETS` es del runtime de Static Assets, no un objeto de la cuenta.
const RUNTIME_BINDINGS = new Set(["ASSETS"]);
const declared = inventoryBindings();

if (declared === null) {
  problems.push(`no se pudieron leer los bindings de ${INVENTORY}`);
} else {
  const inConfig = [
    ...(config.d1_databases ?? []),
    ...(config.kv_namespaces ?? []),
    ...(config.r2_buckets ?? []),
    ...(config.analytics_engine_datasets ?? []),
    ...(config.queues?.producers ?? []),
    ...(config.vectorize ?? []),
  ].map((b) => b.binding).filter(Boolean);

  for (const b of inConfig) {
    checked++;
    if (RUNTIME_BINDINGS.has(b)) continue;
    if (!declared.has(b)) {
      problems.push(
        `wrangler.jsonc: binding "${b}" no está en el inventario de ${INVENTORY}` +
        (/^math_challenge_/.test(b) ? " — parece el binding que wrangler propone al crear; usa el documentado" : ""),
      );
    }
  }
}

if (problems.length > 0) {
  console.error("✗ auditor cf-prefix — objetos de Cloudflare sin prefijo\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: CLAUDE.md § Cloudflare`);
  console.error(`  Por qué: IOS, IMP y Math Challenge comparten cuenta (D-023);`);
  console.error(`  el prefijo es lo único que los separa en el dashboard.`);
  console.error(`\n  Para anular este auditor hay que escribir por qué (D-032).`);
  process.exit(1);
}

console.log(`✓ cf-prefix — ${checked} objeto(s) con prefijo correcto`);
