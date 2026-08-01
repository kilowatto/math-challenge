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
import { execFileSync } from "node:child_process";
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
    // Dos formas de que aparezca una columna, y durante mucho tiempo solo se
    // miraba una. Una columna metida con `ALTER TABLE child_profiles ADD COLUMN
    // nota TEXT` era **invisible** para este auditor: pasaba en verde con texto
    // libre en una tabla de niño, que es la línea roja #3. Lo levantó un agente
    // detallando F2, y F2 es justo la primera fase con una tercera migración
    // tocando tablas de niño — el hueco dejaba de ser teórico esta semana.
    const bloques = [];

    const creado = sql.match(new RegExp(`CREATE\\s+TABLE\\s+${table}\\s*\\(([\\s\\S]*?)\\n\\);`, "i"));
    if (creado) bloques.push(creado[1]);

    // Cada ALTER es una línea suelta, no un bloque entre paréntesis.
    for (const m of sql.matchAll(
      new RegExp(`ALTER\\s+TABLE\\s+${table}\\s+ADD\\s+(?:COLUMN\\s+)?([^;]+);`, "gi"),
    )) {
      bloques.push(m[1]);
    }

    if (bloques.length === 0) continue;
    checkedTables++;

    for (const rawLine of bloques.join("\n").split("\n")) {
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


// ---------------------------------------------------------------------------
// El árbol de niño: ninguna superficie donde un niño pueda escribir
// ---------------------------------------------------------------------------
//
// La otra mitad de la línea roja #3, y la que se rompe primero. El esquema lo
// vigila alguien desde F0; la INTERFAZ es donde aparece el `<input>` que alguien
// puso «solo para probar» y se quedó.
//
// Se mira `app/kids/**`, `components/kids/**` y `KidShell.astro`, que es donde
// D-012 dice que vive lo que un niño toca. Falla ante:
//
//   · cualquier `<input>` que no sea `hidden` — un `type="number"` también es
//     escribir, y un `type="search"` es escribir con otro nombre
//   · cualquier `<textarea>`
//   · cualquier `contenteditable`
//
// Por qué `hidden` sí: un token CSRF o un id de sesión en un campo oculto no es
// una superficie de escritura, es fontanería del formulario.

const RUTAS_DE_NINO = [
  /(^|\/)app\/kids\//,
  /(^|\/)components\/kids\//,
  /KidShell\.astro$/,
];

const archivosDeNino = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  // Rutas relativas, como el resto de este auditor: corre desde la raíz.
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
)
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => /\.(astro|tsx|jsx|svelte|vue|html)$/.test(f))
  .filter((f) => !/^(node_modules|dist|\.astro)/.test(f))
  .filter((f) => RUTAS_DE_NINO.some((re) => re.test(f)));

for (const archivo of archivosDeNino) {
  let texto;
  try {
    texto = readFileSync(archivo, "utf8");
  } catch {
    continue;
  }
  const lineas = texto.split("\n");

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i];

    for (const m of l.matchAll(/<input\b([^>]*)>/gi)) {
      const attrs = m[1];
      if (/type\s*=\s*["'`]?hidden/i.test(attrs)) continue;
      const tipo = attrs.match(/type\s*=\s*["'`]?([\w-]+)/i)?.[1] ?? "text";
      problems.push(
        `${archivo}:${i + 1} · <input type="${tipo}"> en una superficie de niño. ` +
          "Línea roja #3: ningún niño escribe texto libre, en ninguna superficie. " +
          "Un `number` también es escribir, y un `search` es escribir con otro nombre.",
      );
    }

    if (/<textarea\b/i.test(l)) {
      problems.push(`${archivo}:${i + 1} · <textarea> en una superficie de niño (línea roja #3)`);
    }
    if (/contenteditable/i.test(l)) {
      problems.push(`${archivo}:${i + 1} · contenteditable en una superficie de niño (línea roja #3)`);
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

console.log(
  `✓ child-free-text — ${checkedTables} tabla(s) de niño sin texto libre · ` +
    `${archivosDeNino.length} superficie(s) de niño sin dónde escribir`,
);
if (archivosDeNino.length === 0) {
  console.log("  · todavía no hay árbol app/kids/; el auditor está listo para el primero (F2)");
}
