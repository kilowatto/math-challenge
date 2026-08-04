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
//
// La lista creció en F9 (issue #401, deuda declarada por F7/F8): las tablas de
// racha, XP, misiones, liga, compañero, límite de pantalla y las de grupo son
// TODAS tablas de niño en el sentido de la línea roja #3 — guardan datos de un
// menor o de su convivencia con un adulto que no es su padre— y ninguna estaba
// vigilada. El comentario de la migración 0011 que afirmaba que este auditor
// «escanea por forma de columna» y por eso cubría su tabla sin cambios era
// falso: el escaneo es sobre ESTA lista, a mano, y se corrigió en el mismo PR.
const CHILD_TABLES = [
  "child_profiles",
  "child_image_pin",
  "skill_state",
  // F7/F8 (deuda de #401):
  "score_totals",
  "child_streak",
  "xp_totals",
  "mission_daily_summary",
  "league_membership",
  "companion_state",
  "screen_time_daily_usage",
  // F9 (esquema de la 0017):
  "child_group",
  "child_group_membership",
  "child_group_report",
  "school_teacher",
  // F8 (esquema de la 0018, #278): las notas del sistema para el padre. Su
  // `cause_code` es TEXT con CHECK cerrado — pasa por el dominio acotado, no
  // por ALLOWED. El criterio de #278 exige esta entrada con su control
  // negativo visto fallar (caso en `audits/pruebas-auditores.mjs`).
  "child_diagnostic_notes",
];

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
  // F7/F8:
  user_id: "referencia — participante polimórfico (niño O adulto, nunca los dos)",
  cohort_id: "referencia",
  local_date: "día local del hogar, YYYY-MM-DD — la fecha de JUEGO, nunca de nacimiento",
  last_completed_local_date: "día local del último reto — de juego, no de nacimiento",
  pause_until_local_date: "día local hasta donde corre la pausa — de juego, no de nacimiento",
  accessory_ids: "JSON de índices al catálogo de accesorios — nunca texto del niño",
  // F9 (todas referencias o decisiones del padre/adulto, nunca del niño):
  child_group_id: "referencia",
  school_id: "referencia",
  owner_user_id: "referencia",
  reported_by: "referencia",
  reviewed_by: "referencia",
  decided_by: "users.id del padre que decidió — la membresía ES el consentimiento (D-096)",
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

    // Una definición de columna puede ocupar varias líneas (el CHECK en la
    // línea siguiente). Se acumula hasta la coma que la cierra; juzgar línea
    // a línea marcaría como «libre» cualquier columna con CHECK multi-línea —
    // pasó al aterrizar la 0017, cuyos enums largos van en dos líneas.
    let definicion = "";
    const juzgar = (completa) => {
      if (/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)\b/i.test(completa)) return;

      const col = completa.match(/^([a-z_][a-z0-9_]*)\s+(TEXT|VARCHAR)/i);
      if (!col) return;

      const name = col[1];
      if (name in ALLOWED) return;

      // Un CHECK ... IN (...) en la misma definición acota el dominio: no es libre.
      if (/CHECK\s*\(/i.test(completa)) return;

      problems.push(`${file} · ${table}.${name} es TEXT sin dominio acotado`);
    };
    for (const rawLine of bloques.join("\n").split("\n")) {
      const line = rawLine.replace(/--.*$/, "").trim();
      if (!line) continue;
      definicion += (definicion ? " " : "") + line;
      // Los ALTER llegan al bloque SIN su `;` final (el regex los captura hasta
      // antes de él), así que su definición se juzga al quedar como remanente.
      if (!line.endsWith(",") && !line.endsWith(";")) continue;
      const completa = definicion;
      definicion = "";
      juzgar(completa);
    }
    if (definicion) juzgar(definicion);
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
