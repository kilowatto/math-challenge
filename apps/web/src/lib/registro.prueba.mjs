#!/usr/bin/env node
// Casos del alta de cuenta — F2 #390, D-082.
//
//     node --experimental-strip-types --no-warnings apps/web/src/lib/registro.prueba.mjs
//
// Por qué existen. D-082 fijó el destino y #390 lo ejecuta: **toda cuenta nace
// con `is_learner = 1`, sin excepción**, y `signup_intent` deja de condicionar
// el INSERT y el aterrizaje — es dato de embudo (qué CTA trajo a la persona),
// opcional, y de lista cerrada cuando viene. Antes de #390 un alta por la
// puerta de padre nacía con `is_learner = 0`: una bifurcación que la decisión
// elimina.
//
// Se prueba el núcleo de verdad (`lib/registro-nucleo.ts`, el que la ruta
// llama) contra `node:sqlite` con las restricciones CHECK reales de las
// migraciones 0001 y 0003 — incluida la de `signup_intent`, para demostrar que
// NULL la cruza. Lo que NO se prueba aquí: Turnstile, el limitador y la capa
// HTTP, que son de la ruta y no deciden qué se escribe.

import { DatabaseSync } from "node:sqlite";
import { intentDeFormulario, registrarCuentaNueva } from "./registro-nucleo.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

/** El adaptador D1 mínimo sobre node:sqlite (el patrón de padre-limite). */
function adaptar(db) {
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) { args = a; return bound; },
        async all() { return { results: db.prepare(sql).all(...args) }; },
        async first() { return db.prepare(sql).get(...args) ?? null; },
        async run() { return db.prepare(sql).run(...args); },
      };
      return bound;
    },
    async batch(sentencias) { for (const s of sentencias) await s.run(); },
  };
}

/** Las tablas que el alta toca, con los CHECK de las migraciones 0001/0003. */
function baseNueva() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
      locale TEXT NOT NULL DEFAULT 'en'
        CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),
      is_learner INTEGER NOT NULL DEFAULT 0 CHECK (is_learner IN (0, 1)),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      country TEXT,
      timezone TEXT,
      data_region TEXT NOT NULL DEFAULT 'GLOBAL' CHECK (data_region IN ('GLOBAL', 'EU')),
      signup_intent TEXT CHECK (signup_intent IN ('PADRE', 'MAESTRO', 'ADULTO_APRENDE'))
    );
    CREATE TABLE user_password (
      user_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  return adaptar(raw);
}

const kvFalso = () => {
  const m = new Map();
  return {
    async put(k, v) { m.set(k, v); },
    async get(k) { return m.get(k) ?? null; },
    async delete(k) { m.delete(k); },
  };
};

let n = 0;
async function alta(intent) {
  const db = baseNueva();
  const correo = `alguien${++n}@example.com`;
  const intentNorm = intentDeFormulario(intent);
  if (!intentNorm.ok) return { db, correo, estado: "rechazada" };
  const r = await registrarCuentaNueva(
    { DB: db, SESSION_KV: kvFalso() },
    { correo, clave: "una-clave-larga", locale: "es-MX", intent: intentNorm.intent, pais: "MX", zona: "America/Mexico_City" },
  );
  return { db, correo, ...r };
}

const filaDe = (db, correo) =>
  db.prepare("SELECT is_learner, signup_intent FROM users WHERE email = ?").bind(correo).first();

console.log("registro — D-082: toda cuenta nace en modo solo (#390)\n");

// ── El INSERT lleva is_learner = 1 venga por la puerta que venga ────────────
for (const intent of ["PADRE", "MAESTRO", "ADULTO_APRENDE"]) {
  const { db, correo, estado, cookies } = await alta(intent);
  const fila = await filaDe(db, correo);
  ok(estado === "creada" && cookies.length > 0, `${intent}: el alta se completa y abre sesión`);
  ok(fila?.is_learner === 1, `${intent}: is_learner = 1 en el INSERT`);
  ok(fila?.signup_intent === intent, `${intent}: signup_intent se conserva como dato de embudo`);
}

// ── Sin intent ninguno: el alta es igual de válida y nace igual ─────────────
// Es el criterio del issue: registrar SIN pasar ningún `as=` y confirmar el
// valor. La puerta ya no es una elección, así que la telemetría no se exige.
{
  const { db, correo, estado } = await alta("");
  const fila = await filaDe(db, correo);
  ok(estado === "creada", "sin intent: el alta no se rechaza");
  ok(fila?.is_learner === 1, "sin intent: is_learner = 1 igualmente");
  ok(fila && fila.signup_intent === null, "sin intent: signup_intent queda NULL (el CHECK lo admite)");
}

// ── Un intent inventado no crea cuentas con valores fuera de la lista ────────
{
  const { db, correo, estado } = await alta("INVENTADO");
  const fila = await filaDe(db, correo);
  ok(estado === "rechazada", "intent inventado: el alta se rechaza");
  ok(fila === null, "intent inventado: no se escribió ninguna fila");
}

// ── Correo repetido: misma forma de respuesta, ninguna escritura ─────────────
{
  const db = baseNueva();
  const correo = `repetido@example.com`;
  const datos = { correo, clave: "una-clave-larga", locale: "en", intent: null, pais: null, zona: null };
  const primera = await registrarCuentaNueva({ DB: db, SESSION_KV: kvFalso() }, datos);
  const segunda = await registrarCuentaNueva({ DB: db, SESSION_KV: kvFalso() }, datos);
  const cuantas = await db.prepare("SELECT COUNT(*) AS n FROM users WHERE email = ?").bind(correo).first();
  ok(primera.estado === "creada" && segunda.estado === "duplicado", "el correo repetido se reconoce");
  ok(cuantas?.n === 1, "el correo repetido no escribe una segunda fila");
}

console.log(fallos === 0 ? "\nOK — todos los casos pasan" : `\n${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
