#!/usr/bin/env node
// Casos del camino de la pantalla del padre — F8 #269.
//
//     node --experimental-strip-types apps/web/src/lib/padre-limite.prueba.mjs
//
// Por qué existen. Un SQL mal escrito no da error: da un padre mirando el
// límite del hijo de OTRO padre, o un límite de 600 minutos guardado con una
// petición directa que se saltó la interfaz. Ninguno de los dos se ve leyendo
// el código; se ve ejecutando la ruta de verdad — el handler `POST`/`GET` de
// `pages/api/padre-limite.ts`, con una sesión falsa en un KV de mentira y D1
// sobre `node:sqlite`.
//
// ─── La segunda fuente, escrita a mano (D-070) ──────────────────────────────
//
// La tabla de abajo NO se importa del motor: se copió a mano de D-016
// (`docs/decisions.md`). Si el test leyera `LIMITES_POR_BANDA` para decidir
// qué esperar, aprobaría su propia violación — un auditor que juzga con la
// misma función que el código usa para decidir no puede fallar nunca. Aquí,
// quien cambie la tabla del motor rompe estos casos, y eso es lo que se quiere.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { hijoDelPadre, estadoDelLimite, guardarLimite } from "./padre-limite.ts";
import { POST, GET } from "../pages/api/padre-limite.ts";

// D-016, renglón por renglón, a mano. NO importada.
const TABLA_A_MANO = {
  KINDER: { default: 20, min: 10, max: 45 },
  PRIMARIA: { default: 30, min: 15, max: 60 },
  SECUNDARIA: { default: 45, min: 15, max: 90 },
};

const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  theme_band TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),
  created_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE screen_time_settings (
  child_profile_id  TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  daily_minutes     INTEGER NOT NULL,
  break_every_min   INTEGER NOT NULL,
  bedtime_cutoff_min INTEGER NOT NULL,
  bedtime_local     TEXT CHECK (bedtime_local IS NULL OR bedtime_local GLOB '[0-2][0-9]:[0-5][0-9]'),
  updated_at        INTEGER NOT NULL,
  updated_by        TEXT NOT NULL
);
CREATE TABLE screen_time_daily_usage (
  child_profile_id    TEXT NOT NULL,
  local_date          TEXT NOT NULL,
  minutes_used        INTEGER NOT NULL DEFAULT 0,
  minutes_since_break INTEGER NOT NULL DEFAULT 0,
  warned_at           INTEGER,
  ended_reason        TEXT,
  updated_at          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (child_profile_id, local_date)
);
CREATE TABLE consent_type_catalog (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  current_version TEXT NOT NULL DEFAULT 'v1'
);
INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at)
  VALUES ('SCREEN_TIME', 'Guardar el límite de pantalla que el adulto configura', 'CONTRACT', 0, 0);
CREATE TABLE child_consents (
  child_profile_id TEXT NOT NULL,
  consent_code     TEXT NOT NULL,
  granted_by       TEXT NOT NULL,
  granted_at       INTEGER NOT NULL,
  revoked_at       INTEGER,
  consent_version  TEXT,
  PRIMARY KEY (child_profile_id, consent_code)
);
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que push-hogares). */
function adaptar(db) {
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          return { results: db.prepare(sql).all(...args) };
        },
        async first() {
          return db.prepare(sql).get(...args) ?? null;
        },
        async run() {
          return db.prepare(sql).run(...args);
        },
      };
      return bound;
    },
    async batch(sentencias) {
      // D1 corre el batch en una transacción implícita; aquí basta con
      // ejecutarlas en orden — la prueba de «o están los dos o no está
      // ninguno» la da el propio SQL, no el adaptador.
      for (const s of sentencias) await s.run();
    },
  };
}

/** Base en memoria con dos padres y un hijo de cada uno. */
function baseSembrada() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre1', 'America/Mexico_City')").run();
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('padre2', 'Europe/Madrid')").run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('k1', 'padre1', 'Conejo', 'KINDER')",
  ).run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('p1', 'padre1', 'Lince', 'PRIMARIA')",
  ).run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('aj1', 'padre2', 'Ajeno', 'KINDER')",
  ).run();
  // Un perfil YA borrado, sembrado así desde el INSERT — no con un UPDATE de
  // `deleted_at` a propósito: `audits/borrado-alcanza-al-modelo.mjs` vigila
  // toda escritura de `deleted_at` que no llame a `olvidarModelo()`, y esa
  // regla es para rutas de producto, no para una fixture. El caso de abajo
  // prueba lo mismo de las dos formas: que `deleted_at IS NULL` filtra.
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band, deleted_at) " +
      "VALUES ('kb', 'padre1', 'Borrado', 'KINDER', 1)",
  ).run();
  return { raw, db: adaptar(raw) };
}

/** Una sesión de adulto falsa en un KV de mentira (mismo contrato que sesiones.ts). */
const TOKEN = "a".repeat(43); // FORMA_TOKEN: 43 caracteres base64url

function entorno(db, userId) {
  const sesion = userId === null ? null : { userId, creadaEn: 0, intent: "PADRE" };
  const kv = {
    async get(llave) {
      return llave === `s:${TOKEN}` && sesion ? JSON.stringify(sesion) : null;
    },
  };
  return { runtime: { env: { DB: db, SESSION_KV: kv } } };
}

function peticionPost(cuerpo, { formulario = false, conSesion = true } = {}) {
  const cabeceras = {};
  if (conSesion) cabeceras.cookie = `mc_s=${TOKEN}`;
  let cuerpoFinal;
  if (formulario) {
    cabeceras["content-type"] = "application/x-www-form-urlencoded";
    cuerpoFinal = new URLSearchParams(cuerpo).toString();
  } else {
    cabeceras["content-type"] = "application/json";
    cuerpoFinal = JSON.stringify(cuerpo);
  }
  return new Request("https://math.kilowatto.com/api/padre-limite", {
    method: "POST",
    headers: cabeceras,
    body: cuerpoFinal,
  });
}

function peticionGet(query, { conSesion = true } = {}) {
  const cabeceras = {};
  if (conSesion) cabeceras.cookie = `mc_s=${TOKEN}`;
  return new Request(`https://math.kilowatto.com/api/padre-limite?${query}`, {
    headers: cabeceras,
  });
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
const AHORA = 1_800_000_000;

console.log("\npadre-limite — la pantalla del padre (F8 #269)\n");

// ─── Autorización (línea roja #2) ────────────────────────────────────────────

await caso("hijoDelPadre: el dueño recibe su perfil; OTRO padre recibe null", async () => {
  const { db } = baseSembrada();
  const propio = await hijoDelPadre(db, "padre1", "k1");
  igual(propio?.alias, "Conejo", "el dueño ve a su hijo");
  const ajeno = await hijoDelPadre(db, "padre1", "aj1");
  igual(ajeno, null, "el hijo de otro padre no existe para esta sesión");
});

await caso("hijoDelPadre: un perfil borrado recibe null, no una ficha zombi", async () => {
  const { db } = baseSembrada();
  // 'kb' se sembró ya borrado (ver baseSembrada): probar el filtro de
  // `deleted_at IS NULL` no exige simular el borrado.
  igual(await hijoDelPadre(db, "padre1", "kb"), null, "borrado");
});

await caso("POST: otro padre recibe 404, y nada se escribe en la base", async () => {
  const { raw, db } = baseSembrada();
  const res = await POST({
    request: peticionPost({ hijo: "aj1", daily_minutes: 20, locale: "es-MX" }),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 404, "estado");
  const filas = raw.prepare("SELECT COUNT(*) AS n FROM screen_time_settings").get();
  igual(filas.n, 0, "no se escribió nada");
});

// ─── La validación del servidor, sin confiar en la UI ────────────────────────

await caso("guardarLimite: 8 minutos en KINDER se RECHAZA citando el rango (10-45, a mano)", async () => {
  const { db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 8, corteNocturno: false, bedtimeLocal: "", ahora: AHORA,
  });
  igual(r.ok, false, "rechazado");
  igual(r.motivo, `minutos_fuera_de_rango:${TABLA_A_MANO.KINDER.min}-${TABLA_A_MANO.KINDER.max}`, "motivo con rango");
});

await caso("guardarLimite: las orillas del rango KINDER pasan (10 y 45), 9 y 46 no", async () => {
  const { db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const pedir = (m) =>
    guardarLimite(db, { hijo, parentUserId: "padre1", dailyMinutes: m, corteNocturno: false, bedtimeLocal: "", ahora: AHORA });
  igual((await pedir(TABLA_A_MANO.KINDER.min)).ok, true, "el piso pasa");
  igual((await pedir(TABLA_A_MANO.KINDER.max)).ok, true, "el techo pasa");
  igual((await pedir(TABLA_A_MANO.KINDER.min - 1)).ok, false, "uno menos no");
  igual((await pedir(TABLA_A_MANO.KINDER.max + 1)).ok, false, "uno más no");
});

await caso("guardarLimite: 25 minutos en PRIMARIA SÍ es válido (rango 15-60, a mano)", async () => {
  const { db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "p1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 25, corteNocturno: false, bedtimeLocal: "", ahora: AHORA,
  });
  igual(r.ok, true, "aceptado");
});

await caso("guardarLimite: 22.5 se rechaza — la columna es INTEGER y 22.5 se guardaría como 22", async () => {
  const { db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "p1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 22.5, corteNocturno: false, bedtimeLocal: "", ahora: AHORA,
  });
  igual(r.ok, false, "no entero");
});

await caso("POST con fetch y JSON: el rango se revalida aunque la UI no se haya tocado", async () => {
  const { db } = baseSembrada();
  const res = await POST({
    request: peticionPost({ hijo: "k1", daily_minutes: 600, locale: "es-MX" }),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 400, "estado");
  const cuerpo = await res.json();
  igual(cuerpo.ok, false, "ok");
  igual(
    cuerpo.motivo,
    `minutos_fuera_de_rango:${TABLA_A_MANO.KINDER.min}-${TABLA_A_MANO.KINDER.max}`,
    "el motivo cita el rango",
  );
});

// ─── bedtime_local: NULL por defecto, y nunca se enciende por la puerta de atrás

await caso("sin fila previa: el estado es el default de la banda y bedtime_local nace NULL", async () => {
  const { db } = baseSembrada();
  const estado = await estadoDelLimite(db, "k1", "KINDER", DIA);
  igual(estado.tieneFila, false, "sin fila");
  igual(estado.config.daily_minutes, TABLA_A_MANO.KINDER.default, "default KINDER a mano");
  igual(estado.config.bedtime_local, null, "el corte nocturno nace apagado");
  igual(estado.minutosUsados, 0, "sin uso todavía");
});

await caso("guardar con el interruptor apagado guarda NULL, aunque el cuerpo traiga una hora sucia", async () => {
  const { raw, db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 30, corteNocturno: false, bedtimeLocal: "20:30", ahora: AHORA,
  });
  igual(r.ok, true, "guardado");
  const fila = raw.prepare("SELECT bedtime_local FROM screen_time_settings WHERE child_profile_id = 'k1'").get();
  igual(fila.bedtime_local, null, "la hora sucia no encendió el corte");
});

await caso("guardar con interruptor encendido guarda la hora; apagarla después la devuelve a NULL", async () => {
  const { raw, db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const encendido = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 30, corteNocturno: true, bedtimeLocal: "20:30", ahora: AHORA,
  });
  igual(encendido.ok, true, "encendido guardado");
  igual(
    raw.prepare("SELECT bedtime_local FROM screen_time_settings WHERE child_profile_id = 'k1'").get().bedtime_local,
    "20:30",
    "la hora quedó",
  );
  const apagado = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 30, corteNocturno: false, bedtimeLocal: "", ahora: AHORA + 60,
  });
  igual(apagado.ok, true, "apagado guardado");
  igual(
    raw.prepare("SELECT bedtime_local FROM screen_time_settings WHERE child_profile_id = 'k1'").get().bedtime_local,
    null,
    "vuelve a NULL, no a medianoche",
  );
});

await caso("una hora mal formada ('25:00') se rechaza antes de tocar la base", async () => {
  const { raw, db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 30, corteNocturno: true, bedtimeLocal: "25:00", ahora: AHORA,
  });
  igual(r.ok, false, "rechazada");
  igual(r.motivo, "hora_mal_formada", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM screen_time_settings").get().n, 0, "no se escribió nada");
});

// ─── El upsert y el consentimiento (D-051, §5.4-5.5 del plan) ────────────────

await caso("el primer guardado CREA la fila con updated_by = padre, sin exigir fila previa", async () => {
  const { raw, db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const r = await guardarLimite(db, {
    hijo, parentUserId: "padre1", dailyMinutes: 15, corteNocturno: false, bedtimeLocal: "", ahora: AHORA,
  });
  igual(r.ok, true, "guardado");
  const fila = raw.prepare("SELECT daily_minutes, updated_by FROM screen_time_settings WHERE child_profile_id = 'k1'").get();
  igual(fila.daily_minutes, 15, "minutos");
  igual(fila.updated_by, "padre1", "quién lo escribió");
});

await caso("cada guardado escribe child_consents SCREEN_TIME, una sola vez (INSERT OR IGNORE)", async () => {
  const { raw, db } = baseSembrada();
  const hijo = await hijoDelPadre(db, "padre1", "k1");
  const pedir = (ahora) =>
    guardarLimite(db, { hijo, parentUserId: "padre1", dailyMinutes: 20, corteNocturno: false, bedtimeLocal: "", ahora });
  await pedir(AHORA);
  await pedir(AHORA + 60);
  const filas = raw.prepare(
    "SELECT granted_by, granted_at FROM child_consents WHERE child_profile_id = 'k1' AND consent_code = 'SCREEN_TIME'",
  ).all();
  igual(filas.length, 1, "una fila, no dos");
  igual(filas[0].granted_by, "padre1", "quién consintió");
  igual(filas[0].granted_at, AHORA, "el PRIMER granted_at es el que vale");
});

// ─── El camino de la ruta, de punta a punta ──────────────────────────────────

await caso("POST de formulario válido: 303 de vuelta a la pantalla del niño, con ?guardado=1", async () => {
  const { db } = baseSembrada();
  const res = await POST({
    request: peticionPost(
      { hijo: "k1", daily_minutes: "20", locale: "es-MX", bedtime_local: "" },
      { formulario: true },
    ),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 303, "estado");
  igual(res.headers.get("location"), "/es-MX/app/parent/screen-time/k1?guardado=1", "destino");
});

await caso("POST de formulario fuera de rango: 303 de vuelta con e=minutos_fuera_de_rango (raíz, sin sufijo)", async () => {
  const { db } = baseSembrada();
  const res = await POST({
    request: peticionPost({ hijo: "k1", daily_minutes: "600", locale: "es-MX" }, { formulario: true }),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 303, "estado");
  igual(
    res.headers.get("location"),
    "/es-MX/app/parent/screen-time/k1?e=minutos_fuera_de_rango",
    "destino con la clave",
  );
});

await caso("POST sin sesión: 401, y la base intacta", async () => {
  const { raw, db } = baseSembrada();
  const res = await POST({
    request: peticionPost({ hijo: "k1", daily_minutes: 20, locale: "es-MX" }, { conSesion: false }),
    locals: entorno(db, null),
  });
  igual(res.status, 401, "estado");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM screen_time_settings").get().n, 0, "no se escribió nada");
});

await caso("GET: el dueño lee «7 de 20» ya formateado; sin fila de uso, 0", async () => {
  const { raw, db } = baseSembrada();
  raw.prepare(
    "INSERT INTO screen_time_daily_usage (child_profile_id, local_date, minutes_used) VALUES ('k1', ?, 7)",
  ).run(new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" }));
  const res = await GET({
    request: peticionGet("hijo=k1&locale=es-MX"),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 200, "estado");
  const cuerpo = await res.json();
  igual(cuerpo.ok, true, "ok");
  igual(cuerpo.jugados, "7", "los minutos de hoy");
  igual(cuerpo.limite, String(TABLA_A_MANO.KINDER.default), "el default de la banda, sin fila");
});

await caso("GET: otro padre recibe el mismo 404 que si no existiera", async () => {
  const { db } = baseSembrada();
  const res = await GET({
    request: peticionGet("hijo=aj1&locale=es-MX"),
    locals: entorno(db, "padre1"),
  });
  igual(res.status, 404, "estado");
});

await caso("GET sin sesión: 401", async () => {
  const { db } = baseSembrada();
  const res = await GET({
    request: peticionGet("hijo=k1&locale=es-MX", { conSesion: false }),
    locals: entorno(db, null),
  });
  igual(res.status, 401, "estado");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
