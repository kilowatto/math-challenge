#!/usr/bin/env node
// Casos del cierre semanal de ligas — #241, D-014, D-056, D-081.
//
//     node --experimental-strip-types apps/ingest/src/ciclo-liga.prueba.mjs
//
// Por qué existen. El motor puro (`liga.prueba.mjs`) prueba el REPARTO; esto
// prueba el CIERRE contra una base de verdad (`node:sqlite`, que es SQLite
// real): que las escrituras colocan a cada miembro donde el reparto dijo, que
// cerrar dos veces la misma semana no mueve a nadie dos veces, y que la octava
// semana seguida sin jugar archiva en silencio. Un cierre que solo se probó
// contra un simulacro de SQL no se probó.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { cerrarCohorte, cohortesVencidas } from "./ciclo-liga.ts";
import { SEMANAS_PARA_ARCHIVAR, ESCALON_TOPE } from "../../../packages/motor/src/liga.ts";

let fallos = 0;
let corridos = 0;

async function caso(nombre, fn) {
  corridos++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const igual = (a, b, msg) => {
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
};

// --- La base: SQLite real en memoria, con el esquema de la migración 0012 ---

const ESQUEMA = `
CREATE TABLE league_cohort (
  id                TEXT PRIMARY KEY,
  banda             TEXT NOT NULL
                    CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','JR','PRO')),
  tipo_participante TEXT NOT NULL CHECK (tipo_participante IN ('child','adult')),
  escalon           INTEGER NOT NULL CHECK (escalon BETWEEN 1 AND 10),
  week_start        TEXT NOT NULL,
  week_end          TEXT NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('OPEN','CLOSED')),
  member_count      INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  created_at        INTEGER NOT NULL
);
CREATE TABLE league_membership (
  id               TEXT PRIMARY KEY,
  cohort_id        TEXT NOT NULL REFERENCES league_cohort(id) ON DELETE CASCADE,
  child_profile_id TEXT,
  user_id          TEXT,
  points_this_week INTEGER NOT NULL DEFAULT 0,
  active_days      INTEGER NOT NULL DEFAULT 0 CHECK (active_days BETWEEN 0 AND 7),
  joined_at        INTEGER NOT NULL,
  final_rank       INTEGER,
  outcome          TEXT CHECK (outcome IN ('SUBE','SE_QUEDA','BAJA','ARCHIVADA')),
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);
`;

function crearBase() {
  const db = new DatabaseSync(":memory:");
  db.exec(ESQUEMA);
  return db;
}

/**
 * El adaptador D1 sobre `node:sqlite`. La forma mínima que `ciclo-liga.ts`
 * declara (`BaseDeDatos`), y con el `batch` envuelto en una transacción, como
 * D1 lo ejecuta: atómico.
 */
function adaptar(db) {
  return {
    prepare(sql) {
      const stmt = db.prepare(sql);
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          return { results: stmt.all(...args) };
        },
        async first() {
          return stmt.get(...args) ?? null;
        },
        async run() {
          return stmt.run(...args);
        },
      };
      return bound;
    },
    async batch(sentencias) {
      db.exec("BEGIN");
      try {
        for (const s of sentencias) await s.run();
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
}

// --- Datos de apoyo ----------------------------------------------------------

function finDe(weekStart) {
  const [a, m, d] = weekStart.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d) + 6 * 86_400_000).toISOString().slice(0, 10);
}

function insertarCohorte(db, id, { escalon = 5, week = "2026-08-03", status = "OPEN", miembros = 0 } = {}) {
  db.prepare(
    "INSERT INTO league_cohort " +
      "(id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
      "VALUES (?, 'PRIMARIA', 'child', ?, ?, ?, ?, ?, 1754208000000)",
  ).run(id, escalon, week, finDe(week), status, miembros);
}

function insertarMembresia(db, id, cohortId, childId, puntos, dias, joined = 1000) {
  db.prepare(
    "INSERT INTO league_membership " +
      "(id, cohort_id, child_profile_id, user_id, points_this_week, active_days, joined_at) " +
      "VALUES (?, ?, ?, NULL, ?, ?, ?)",
  ).run(id, cohortId, childId, puntos, dias, joined);
}

const membresiaDe = (db, id) => db.prepare("SELECT * FROM league_membership WHERE id = ?").get(id);
const cohorteDe = (db, id) => db.prepare("SELECT * FROM league_cohort WHERE id = ?").get(id);
const contar = (db, sql, ...args) => db.prepare(sql).get(...args).n;

const SEMANA = "2026-08-03";
const SIGUIENTE = "2026-08-10";

/**
 * La cohorte del caso que #241 nombra: diez miembros, siete activos con puntos
 * decrecientes y tres inactivos en el fondo de la tabla cruda.
 */
function poblarDiez(db, cohortId) {
  for (let i = 0; i < 7; i++) insertarMembresia(db, `a${i}`, cohortId, `c-a${i}`, 1000 - i * 10, 3, 1000 + i);
  for (let i = 0; i < 3; i++) insertarMembresia(db, `z${i}`, cohortId, `c-z${i}`, 0, 0, 2000 + i);
}

console.log("\n== cierre semanal de ligas (#241) ==\n");

// --- El reparto escrito en la base -------------------------------------------

await caso("cohorte de 10 con 3 inactivos al fondo: el descenso recae sobre el activo peor ubicado", async () => {
  const db = crearBase();
  insertarCohorte(db, "c1", { escalon: 5 });
  poblarDiez(db, "c1");

  const r = await cerrarCohorte(adaptar(db), "c1");

  igual(r.suben, 1, "un ascenso con 7 activos");
  igual(r.bajan, 1, "un descenso con 7 activos");
  igual(r.archivadas, 0, "nadie cumple ocho semanas");
  igual(membresiaDe(db, "a0").outcome, "SUBE", "el primero asciende");
  igual(membresiaDe(db, "a0").final_rank, 1, "final_rank del primero");
  igual(membresiaDe(db, "a6").outcome, "BAJA", "el ACTIVO peor ubicado desciende");
  for (const z of ["z0", "z1", "z2"]) {
    igual(membresiaDe(db, z).outcome, "SE_QUEDA", `el inactivo ${z} no desciende (D-014)`);
  }
  igual(cohorteDe(db, "c1").status, "CLOSED", "la cohorte vieja queda cerrada");

  // Y cada uno aterrizó en una cohorte de la semana siguiente, de su escalón,
  // con los puntos a cero.
  const a0 = db
    .prepare(
      "SELECT m.*, c.escalon, c.week_start FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
        "WHERE m.child_profile_id = 'c-a0' AND c.week_start = ?",
    )
    .get(SIGUIENTE);
  igual(a0.escalon, 6, "el que subió aterriza un escalón arriba");
  igual(a0.points_this_week, 0, "los puntos se reinician cada semana");
  const a6 = db
    .prepare(
      "SELECT c.escalon FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
        "WHERE m.child_profile_id = 'c-a6' AND c.week_start = ?",
    )
    .get(SIGUIENTE);
  igual(a6.escalon, 4, "el que bajó aterriza un escalón abajo");
  const z0 = db
    .prepare(
      "SELECT c.escalon FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
        "WHERE m.child_profile_id = 'c-z0' AND c.week_start = ?",
    )
    .get(SIGUIENTE);
  igual(z0.escalon, 5, "el inactivo se congela en su escalón, no desciende");
});

await caso("cerrar dos veces la misma semana no mueve a nadie dos veces", async () => {
  const db = crearBase();
  insertarCohorte(db, "c1", { escalon: 5 });
  poblarDiez(db, "c1");
  const d1 = adaptar(db);

  await cerrarCohorte(d1, "c1");
  const membresiasTrasUno = contar(db, "SELECT COUNT(*) AS n FROM league_membership");
  const cohortesTrasUno = contar(db, "SELECT COUNT(*) AS n FROM league_cohort");

  const segunda = await cerrarCohorte(d1, "c1");
  igual(segunda.yaEstabaCerrada, true, "la segunda corrida reporta que ya estaba cerrada");
  igual(contar(db, "SELECT COUNT(*) AS n FROM league_membership"), membresiasTrasUno, "ni una membresía de más");
  igual(contar(db, "SELECT COUNT(*) AS n FROM league_cohort"), cohortesTrasUno, "ni una cohorte de más");

  // Nadie tiene dos membresías en la semana siguiente.
  const dobles = contar(
    db,
    "SELECT COUNT(*) AS n FROM (SELECT child_profile_id FROM league_membership m " +
      "JOIN league_cohort c ON c.id = m.cohort_id WHERE c.week_start = ? GROUP BY child_profile_id HAVING COUNT(*) > 1)",
    SIGUIENTE,
  );
  igual(dobles, 0, "nadie ascendió (ni se movió) dos veces");
});

await caso("con menos de 5 activos la cohorte se congela: nadie sube ni baja de escalón", async () => {
  const db = crearBase();
  insertarCohorte(db, "c1", { escalon: 3 });
  for (let i = 0; i < 4; i++) insertarMembresia(db, `a${i}`, "c1", `c-a${i}`, 500 - i * 10, 2, 1000 + i);
  for (let i = 0; i < 4; i++) insertarMembresia(db, `z${i}`, "c1", `c-z${i}`, 0, 0, 2000 + i);

  const r = await cerrarCohorte(adaptar(db), "c1");
  igual(r.suben, 0, "congelada: sin ascensos");
  igual(r.bajan, 0, "congelada: sin descensos");
  igual(r.colocadas, 8, "los ocho siguen la semana que viene");
  const escalones = db
    .prepare(
      "SELECT DISTINCT c.escalon AS e FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
        "WHERE c.week_start = ?",
    )
    .all(SIGUIENTE);
  igual(escalones.length, 1, "todos en el mismo escalón");
  igual(escalones[0].e, 3, "el mismo escalón del que venían");
});

await caso("la octava semana seguida sin jugar archiva EN SILENCIO; la séptima no", async () => {
  const db = crearBase();
  // A lleva 7 semanas previas sin jugar; ésta es la octava. B lleva 6; ésta es
  // la séptima. Las semanas previas viven en sus propias cohortes cerradas.
  const previas = ["2026-06-15", "2026-06-22", "2026-06-29", "2026-07-06", "2026-07-13", "2026-07-20", "2026-07-27"];
  for (let w = 0; w < previas.length; w++) {
    insertarCohorte(db, `prev-${w}`, { week: previas[w], status: "CLOSED" });
    insertarMembresia(db, `prev-a-${w}`, `prev-${w}`, "c-A", 0, 0, 500);
    if (w > 0) insertarMembresia(db, `prev-b-${w}`, `prev-${w}`, "c-B", 0, 0, 600);
  }
  insertarCohorte(db, "c1", { escalon: 5 });
  // Seis activos para que el reparto se mueva (1 sube, 1 baja).
  for (let i = 0; i < 6; i++) insertarMembresia(db, `a${i}`, "c1", `c-a${i}`, 800 - i * 10, 4, 1000 + i);
  insertarMembresia(db, "actual-A", "c1", "c-A", 0, 0, 500);
  insertarMembresia(db, "actual-B", "c1", "c-B", 0, 0, 600);

  const r = await cerrarCohorte(adaptar(db), "c1");
  igual(SEMANAS_PARA_ARCHIVAR, 8, "el umbral del plan §4.3");
  igual(r.archivadas, 1, "solo A cumple las ocho semanas");
  igual(membresiaDe(db, "actual-A").outcome, "ARCHIVADA", "A se archiva");
  igual(membresiaDe(db, "actual-B").outcome, "SE_QUEDA", "B todavía no: son siete, no ocho");

  const aEnSiguiente = contar(
    db,
    "SELECT COUNT(*) AS n FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
      "WHERE m.child_profile_id = 'c-A' AND c.week_start = ?",
    SIGUIENTE,
  );
  igual(aEnSiguiente, 0, "el archivado NO tiene membresía la semana que viene");
  const bEnSiguiente = contar(
    db,
    "SELECT COUNT(*) AS n FROM league_membership m JOIN league_cohort c ON c.id = m.cohort_id " +
      "WHERE m.child_profile_id = 'c-B' AND c.week_start = ?",
    SIGUIENTE,
  );
  igual(bEnSiguiente, 1, "B sí sigue: todavía no son ocho");
});

await caso("la cohorte destino llena desborda a una nueva, y member_count se recalcula", async () => {
  const db = crearBase();
  // La semana que viene ya tiene una cohorte del escalón 5 con 28 miembros.
  insertarCohorte(db, "existente", { escalon: 5, week: SIGUIENTE, miembros: 28 });
  for (let i = 0; i < 28; i++) insertarMembresia(db, `pre-${i}`, "existente", `c-pre${i}`, 0, 1, 100 + i);

  insertarCohorte(db, "c1", { escalon: 5 });
  for (let i = 0; i < 6; i++) insertarMembresia(db, `a${i}`, "c1", `c-a${i}`, 900 - i * 10, 5, 1000 + i);

  const r = await cerrarCohorte(adaptar(db), "c1");
  // 6 activos: 1 sube (e6), 1 baja (e4), 4 se quedan (e5). De los 4, caben 2 en
  // la existente (28+2=30) y 2 desbordan a una cohorte nueva.
  igual(r.colocadas, 6, "los seis colocados");
  igual(cohorteDe(db, "existente").member_count, 30, "la existente se llenó hasta 30");
  const nueva = cohorteDe(db, `lc:PRIMARIA|child|e5|${SIGUIENTE}`);
  igual(nueva.member_count, 2, "el desborde abrió una cohorte nueva con 2");
  igual(r.cohortesNuevas.includes(`lc:PRIMARIA|child|e5|${SIGUIENTE}`), true, "id determinista de la nueva");
});

await caso("desde el escalón tope nadie asciende, y sí se desciende", async () => {
  const db = crearBase();
  insertarCohorte(db, "c1", { escalon: ESCALON_TOPE });
  for (let i = 0; i < 10; i++) insertarMembresia(db, `a${i}`, "c1", `c-a${i}`, 700 - i * 10, 3, 1000 + i);

  const r = await cerrarCohorte(adaptar(db), "c1");
  igual(r.suben, 0, "el tope es un techo");
  igual(r.bajan, 2, "round(10 × 5/30) descensos");
  const porEncima = contar(db, "SELECT COUNT(*) AS n FROM league_cohort WHERE escalon > ?", ESCALON_TOPE);
  igual(porEncima, 0, "nadie aterrizó por encima del tope");
});

await caso("cohortesVencidas lista solo las abiertas de semanas ya terminadas", async () => {
  const db = crearBase();
  insertarCohorte(db, "vieja-abierta", { week: "2026-07-27" });
  insertarCohorte(db, "actual-abierta", { week: SEMANA });
  insertarCohorte(db, "vieja-cerrada", { week: "2026-07-20", status: "CLOSED" });

  // Miércoles de la semana actual: solo la de la semana pasada y abierta vence.
  const vencidas = await cohortesVencidas(adaptar(db), Date.UTC(2026, 7, 5));
  igual(vencidas.join(","), "vieja-abierta", "solo la abierta de la semana pasada");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
