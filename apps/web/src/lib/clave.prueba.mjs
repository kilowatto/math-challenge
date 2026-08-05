#!/usr/bin/env node
// Casos del cambio de contraseña estando dentro — F2 #313.
//
//     node --experimental-strip-types --no-warnings apps/web/src/lib/clave.prueba.mjs
//
// Por qué existen. El endpoint `/api/clave` existía antes de esta issue, pero
// su propio encabezado admitía el hueco: al cambiar la contraseña solo se
// rotaba la sesión ACTUAL, y **las demás sesiones del adulto seguían vivas
// hasta 30 días**. Cambiar la clave porque sospechas que alguien entró no
// sirve de nada si la sesión de ese alguien sigue abierta — y es exactamente
// lo que la issue exige: «cambiar la contraseña cierra las otras sesiones».
//
// Se prueba el endpoint de verdad (`pages/api/clave.ts`) con KV de mentira y
// D1 sobre `node:sqlite`: el hash se calcula de verdad (passwords.ts) y la
// tabla `user_password` es real, así que la actualización queda comprobada, no
// simulada.

import { DatabaseSync } from "node:sqlite";
import { POST } from "../pages/api/clave.ts";
import { hashear, verificar } from "./passwords.ts";
import { abrirSesionAdulto, leerSesionAdulto, leerCookies, COOKIE_ADULTO } from "./sesiones.ts";

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

const kvFalso = () => {
  const m = new Map();
  return {
    m,
    async put(k, v, o) { m.set(k, { v, ttl: o?.expirationTtl }); },
    async get(k) { return m.has(k) ? m.get(k).v : null; },
    async delete(k) { m.delete(k); },
  };
};

const USUARIO = "user-1";
const CLAVE_VIEJA = "la-clave-de-antes";
const CLAVE_NUEVA = "la-clave-de-ahora";

/** Un adulto con contraseña y DOS sesiones abiertas: este aparato y otro. */
async function escenario() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(`
    CREATE TABLE user_password (
      user_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
  const ahora = Math.floor(Date.now() / 1000);
  raw.prepare("INSERT INTO user_password VALUES (?, ?, ?, ?)")
    .run(USUARIO, await hashear(CLAVE_VIEJA), ahora - 5000, ahora - 5000);

  const kv = kvFalso();
  // La sesión de ESTE aparato y la de OTRO, abierta hace una hora.
  const actual = await abrirSesionAdulto(kv, { userId: USUARIO, creadaEn: ahora - 60, intent: null });
  const otra = await abrirSesionAdulto(kv, { userId: USUARIO, creadaEn: ahora - 3600, intent: null });
  return { db: adaptar(raw), raw, kv, ahora, tokenActual: actual.token, tokenOtra: otra.token };
}

function peticion(token, cuerpo) {
  return new Request("https://test/api/clave", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `${COOKIE_ADULTO}=${token}`,
      "cf-connecting-ip": "203.0.113.20",
    },
    body: JSON.stringify(cuerpo),
  });
}

const llamar = (env, token, cuerpo) =>
  POST({ request: peticion(token, cuerpo), locals: { runtime: { env } } });

console.log("clave — cambiar la contraseña cierra las demás sesiones (#313)\n");

// ── Sin sesión no hay cambio ─────────────────────────────────────────────────
{
  const { db, kv } = await escenario();
  const r = await llamar({ DB: db, SESSION_KV: kv }, "token-que-no-existe-0000000000000000000000000", { actual: CLAVE_VIEJA, nueva: CLAVE_NUEVA });
  ok(r.status === 401, "sin sesión: 401");
}

// ── La sesión no basta: se exige la contraseña ACTUAL ───────────────────────
{
  const { db, kv, tokenActual, tokenOtra } = await escenario();
  const r = await llamar({ DB: db, SESSION_KV: kv }, tokenActual, { actual: "no-es-esa", nueva: CLAVE_NUEVA });
  ok(r.status === 403, "actual incorrecta: 403");
  ok((await leerSesionAdulto(kv, tokenActual)) !== null, "actual incorrecta: la sesión actual sigue viva");
  ok((await leerSesionAdulto(kv, tokenOtra)) !== null, "actual incorrecta: la otra sesión sigue viva");
}

// ── La misma de antes no es un cambio ────────────────────────────────────────
{
  const { db, kv, tokenActual } = await escenario();
  const r = await llamar({ DB: db, SESSION_KV: kv }, tokenActual, { actual: CLAVE_VIEJA, nueva: CLAVE_VIEJA });
  ok(r.status === 400, "nueva igual a la actual: 400");
}

// ── El caso que importa: las OTRAS sesiones mueren ──────────────────────────
{
  const { db, kv, tokenActual, tokenOtra } = await escenario();
  const r = await llamar({ DB: db, SESSION_KV: kv }, tokenActual, { actual: CLAVE_VIEJA, nueva: CLAVE_NUEVA });
  ok(r.status === 200, "el cambio responde 200");

  const nuevasCookies = r.headers.getSetCookie();
  ok(nuevasCookies.some((c) => c.startsWith(`${COOKIE_ADULTO}=`) && !c.includes("Max-Age=0")),
    "se emite una sesión nueva para este aparato");

  ok((await leerSesionAdulto(kv, tokenOtra)) === null,
    "la sesión del OTRO aparato queda invalidada");
  ok((await leerSesionAdulto(kv, tokenActual)) === null,
    "el token viejo de ESTE aparato queda invalidado");

  // La sesión nueva sí abre: quien cambia la clave sigue dentro. Ojo: la
  // respuesta trae DOS cookies `mc_s` — el borrado del token viejo
  // (`Max-Age=0`) y la nueva— y hay que quedarse con la que tiene token.
  const cookieNueva = nuevasCookies.find((c) => new RegExp(`^${COOKIE_ADULTO}=[A-Za-z0-9_-]{43}`).test(c));
  const tokenNuevo = leerCookies(cookieNueva.split(";")[0])[COOKIE_ADULTO];
  const sesionNueva = await leerSesionAdulto(kv, tokenNuevo);
  ok(sesionNueva?.userId === USUARIO, "la sesión nueva abre y es del mismo adulto");

  // Y la contraseña que cambió, cambió de verdad.
  const fila = await db.prepare("SELECT password_hash FROM user_password WHERE user_id = ?").bind(USUARIO).first();
  ok((await verificar(CLAVE_NUEVA, fila.password_hash)).ok, "la contraseña nueva entra");
  ok(!(await verificar(CLAVE_VIEJA, fila.password_hash)).ok, "la contraseña vieja ya no entra");
}

// ── El limitador cubre el endpoint ──────────────────────────────────────────
{
  const { db, kv, tokenActual } = await escenario();
  // Un Durable Object de mentira que dice «basta»: el endpoint tiene que
  // respetarlo — sin límite, probar la contraseña actual es gratis infinitas
  // veces, y la contraseña actual es exactamente lo que aquí se adivina.
  const agotado = {
    idFromName: (n) => n,
    get: () => ({ fetch: async () => Response.json({ permitido: false, restantes: 0, esperaS: 42 }) }),
  };
  const r = await llamar({ DB: db, SESSION_KV: kv, RATE_LIMITER: agotado }, tokenActual, { actual: CLAVE_VIEJA, nueva: CLAVE_NUEVA });
  ok(r.status === 429, "con el cupo agotado: 429");
  ok((await leerSesionAdulto(kv, tokenActual)) !== null, "con el cupo agotado no se tocó nada");
}

console.log(fallos === 0 ? "\nOK — todos los casos pasan" : `\n${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
