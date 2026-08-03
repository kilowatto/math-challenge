#!/usr/bin/env node
// Casos de la capa de datos del recordatorio push — #207, D-128.
//
//     node --experimental-strip-types apps/web/src/lib/push-hogares.prueba.mjs
//
// Por qué existen. La regla «un KINDER completó su meta si JUGÓ hoy» vive en
// SQL, y un SQL mal escrito no da error: da un padre que recibe un push todos
// los días aunque su hija haya jugado (la meta que nunca completa, D-104), o
// peor — un niño de PRIMARIA que «completa» su meta de misiones por el solo
// hecho de haber jugado, y el recordatorio que no llega cuando debía.
// Ninguna de las dos se ve leyendo la consulta; se ve ejecutándola.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { conteosDelHogar, pendientesDelHogar } from "./push-hogares.ts";

const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, is_learner INTEGER NOT NULL DEFAULT 0);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  theme_band TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE mission_daily_summary (
  child_profile_id TEXT,
  user_id TEXT,
  local_date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE child_streak (
  child_profile_id TEXT,
  user_id TEXT,
  last_completed_local_date TEXT
);
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que ciclo-liga). */
function adaptar(db) {
  // node:sqlite no admite un parámetro numerado REUSADO (`?1` dos veces) con
  // binding posicional — D1 sí. Se expande: cada `?N` se reemplaza por `?` y
  // el argumento se duplica en su posición. Solo vive en la prueba.
  const expandir = (sql, args) => {
    const salida = [];
    const nuevo = sql.replace(/\?(\d+)/g, (_, n) => {
      salida.push(args[Number(n) - 1]);
      return "?";
    });
    return [nuevo, salida];
  };
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          const [nuevo, salida] = expandir(sql, args);
          return { results: db.prepare(nuevo).all(...salida) };
        },
        async first() {
          const [nuevo, salida] = expandir(sql, args);
          return db.prepare(nuevo).get(...salida) ?? null;
        },
        async run() {
          const [nuevo, salida] = expandir(sql, args);
          return db.prepare(nuevo).run(...salida);
        },
      };
      return bound;
    },
  };
}

/** Base en memoria con el padre sembrado; devuelve el crudo (semillas) y el adaptado (prueba). */
function baseCompleta() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, is_learner) VALUES ('u1', 0)").run();
  return { raw, db: adaptar(raw) };
}

function hijo(dbRaw, id, banda, alias) {
  dbRaw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, created_at) VALUES (?, 'u1', ?, ?, 0)",
  ).run(id, alias, banda);
}

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

const DIA = "2026-08-03";
const AYER = "2026-08-02";

console.log("\npush-hogares — la meta por banda (D-128)\n");

await caso("KINDER que jugó hoy cuenta como completado, aunque no tenga fila de misión (D-104)", async () => {
  const { raw, db } = baseCompleta();
  hijo(raw, "k1", "KINDER", "Conejo");
  raw.prepare("INSERT INTO child_streak (child_profile_id, last_completed_local_date) VALUES ('k1', ?)").run(DIA);
  const c = await conteosDelHogar(db, "u1", DIA);
  igual(c.aprendices, 1, "aprendices");
  igual(c.completados, 1, "completados");
});

await caso("KINDER que NO jugó hoy queda pendiente (una racha de ayer no es haber jugado hoy)", async () => {
  const { raw, db } = baseCompleta();
  hijo(raw, "k1", "KINDER", "Conejo");
  raw.prepare("INSERT INTO child_streak (child_profile_id, last_completed_local_date) VALUES ('k1', ?)").run(AYER);
  const c = await conteosDelHogar(db, "u1", DIA);
  igual(c.completados, 0, "completados");
  const p = await pendientesDelHogar(db, "u1", DIA, false);
  igual(p.aliases.length, 1, "pendientes");
  igual(p.aliases[0], "Conejo", "el pendiente es el kinder");
});

await caso("PRIMARIA con racha de hoy pero SIN misión completada NO cuenta: la racha no es la meta de esa banda", async () => {
  const { raw, db } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA", "Lince");
  raw.prepare("INSERT INTO child_streak (child_profile_id, last_completed_local_date) VALUES ('p1', ?)").run(DIA);
  const c = await conteosDelHogar(db, "u1", DIA);
  igual(c.completados, 0, "completados");
});

await caso("PRIMARIA con misión completada hoy cuenta (la regla de siempre, intacta)", async () => {
  const { raw, db } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA", "Lince");
  raw.prepare(
    "INSERT INTO mission_daily_summary (child_profile_id, local_date, completed) VALUES ('p1', ?, 1)",
  ).run(DIA);
  const c = await conteosDelHogar(db, "u1", DIA);
  igual(c.completados, 1, "completados");
});

await caso("hogar mixto: kinder que jugó + primaria sin misión → el pendiente es el primaria, no los dos", async () => {
  const { raw, db } = baseCompleta();
  hijo(raw, "k1", "KINDER", "Conejo");
  hijo(raw, "p1", "PRIMARIA", "Lince");
  raw.prepare("INSERT INTO child_streak (child_profile_id, last_completed_local_date) VALUES ('k1', ?)").run(DIA);
  const c = await conteosDelHogar(db, "u1", DIA);
  igual(c.aprendices, 2, "aprendices");
  igual(c.completados, 1, "completados");
  const p = await pendientesDelHogar(db, "u1", DIA, false);
  igual(p.aliases.length, 1, "pendientes");
  igual(p.aliases[0], "Lince", "el pendiente es el de primaria");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
