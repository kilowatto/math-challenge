#!/usr/bin/env node
// Casos del cable de la liga — F7 #237, #242, #243 · D-040, D-081, D-106.
//
//     node --experimental-strip-types apps/web/src/lib/liga-membresia.prueba.mjs
//
// Por qué existen. El alta de una liga es SQL sobre cuatro tablas y un Durable
// Object, y un SQL mal escrito aquí no da error: da un niño de KINDER en una
// liga sin que su padre lo activara (D-081, default apagado), un adulto y un
// menor en la misma cohorte (D-027), un participante 31 sin cohorte jamás, o un
// cierre semanal que lee ceros porque nadie escribió el espejo de D1. Nada de
// eso se ve leyendo el código; se ve ejecutándolo.
//
// Las expectativas están escritas A MANO (D-070): la prueba no importa las
// constantes del módulo para comprobarlo — si lo hiciera, aprobaría su propia
// violación.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import {
  asegurarMembresia,
  avatarParaDifundir,
  cargarTablaDe,
  estadoDeParticipacion,
  otorgarLiga,
  revocarLiga,
  sumarPuntosDeLiga,
} from "./liga-membresia.ts";

// El esquema real de las cinco tablas que toca el módulo (0001, 0002, 0003,
// 0004, 0012), con sus CHECK y su llave compuesta. Recortado a las columnas
// que el cable usa, sin tocar una sola restricción de las que quedan.
const ESQUEMA = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en'
    CHECK (locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),
  is_learner INTEGER NOT NULL DEFAULT 0,
  alias TEXT,
  alias_locale TEXT
    CHECK (alias_locale IN ('en','es-MX','es-ES','fr-FR','pt-BR','pt-PT','de-DE')),
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  alias_locale TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  birth_month INTEGER NOT NULL,
  theme_band TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA')),
  avatar_parts TEXT NOT NULL DEFAULT '{}',
  locale TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE consent_type_catalog (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT 0,
  current_version TEXT NOT NULL DEFAULT 'v1'
);
CREATE TABLE child_consents (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  consent_code TEXT NOT NULL,
  granted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_at INTEGER NOT NULL,
  revoked_at INTEGER,
  consent_version TEXT,
  PRIMARY KEY (child_profile_id, consent_code)
);
CREATE TABLE league_cohort (
  id TEXT PRIMARY KEY,
  banda TEXT NOT NULL
    CHECK (banda IN ('KINDER','PRIMARIA','SECUNDARIA','SERIO','JR','PRO')),
  tipo_participante TEXT NOT NULL CHECK (tipo_participante IN ('child','adult')),
  escalon INTEGER NOT NULL CHECK (escalon BETWEEN 1 AND 10),
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN','CLOSED')),
  member_count INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  created_at INTEGER NOT NULL
);
CREATE TABLE league_membership (
  id TEXT PRIMARY KEY,
  cohort_id TEXT NOT NULL REFERENCES league_cohort(id) ON DELETE CASCADE,
  child_profile_id TEXT REFERENCES child_profiles(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  points_this_week INTEGER NOT NULL DEFAULT 0,
  active_days INTEGER NOT NULL DEFAULT 0 CHECK (active_days BETWEEN 0 AND 7),
  joined_at INTEGER NOT NULL,
  final_rank INTEGER,
  outcome TEXT CHECK (outcome IN ('SUBE','SE_QUEDA','BAJA','ARCHIVADA')),
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_league_member_perfil
  ON league_membership (cohort_id, child_profile_id) WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_league_member_usuario
  ON league_membership (cohort_id, user_id) WHERE user_id IS NOT NULL;
INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at, current_version)
  VALUES ('LEAGUE', 'Participar en una liga de ~30 pares, con un alias generado', 'CONSENT', 0, 0, 'v1');
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
  };
}

/**
 * Un LEAGUE_DO de mentira que GRABA las llamadas. El DO de verdad no corre en
 * node; lo que la prueba comprueba es qué se le mandó y con qué carga, que es
// la parte que este módulo sí controla.
 */
function nsDeMentira({ falla = false, tablas = {} } = {}) {
  const llamadas = [];
  const ns = {
    idFromName: (nombre) => ({ nombre }),
    get: (id) => ({
      fetch: async (url, init) => {
        llamadas.push({
          cohorte: id.nombre,
          ruta: String(url),
          cuerpo: init?.body ? JSON.parse(init.body) : null,
        });
        if (falla) return new Response("caído", { status: 500 });
        const ruta = String(url);
        if (ruta.endsWith("/tabla")) return Response.json(tablas[id.nombre] ?? []);
        return Response.json({ ok: true, nuevo: true });
      },
    }),
  };
  return { llamadas, ns };
}

/** Base sembrada con un padre; devuelve el crudo (semillas) y el env (prueba). */
function baseCompleta(ns) {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, email, locale) VALUES ('u1', 'p@x.com', 'es-MX')").run();
  return { raw, env: { DB: adaptar(raw), LEAGUE_DO: ns } };
}

function hijo(raw, id, banda, alias = "Nutria") {
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, birth_month, theme_band, locale) " +
      "VALUES (?, 'u1', ?, 'es-MX', 2021, 3, ?, 'es-MX')",
  ).run(id, alias, banda);
}

function consentir(raw, hijoId, revocada = false) {
  raw.prepare(
    "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, revoked_at, consent_version) " +
      "VALUES (?, 'LEAGUE', 'u1', 100, ?, 'v1')",
  ).run(hijoId, revocada ? 200 : null);
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
const verdad = (v, msg) => {
  if (!v) throw new Error(msg ?? "se esperaba verdadero");
};

// Miércoles 2026-08-05 12:00 UTC → la semana de liga empieza el lunes 2026-08-03.
const AHORA = Date.UTC(2026, 7, 5, 12, 0, 0);
const SEMANA = "2026-08-03";
const SEMANA_PASADA = "2026-07-27";

console.log("\nliga-membresia — alta, cable de puntos y baja (D-081, D-106)\n");

await caso("KINDER sin consentimiento del padre NO entra: el default apagado es la ausencia de fila (D-081)", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "k1", "KINDER");
  const m = await asegurarMembresia(env, { id: "k1", esAdulto: false }, AHORA);
  igual(m, null, "membresía");
  const n = raw.prepare("SELECT COUNT(*) AS n FROM league_membership").get().n;
  igual(n, 0, "filas de membresía");
});

await caso("KINDER con consentimiento vigente entra: cohorte de 1 si hace falta, sin sala de espera", async () => {
  const { llamadas, ns } = nsDeMentira();
  const { raw, env } = baseCompleta(ns);
  hijo(raw, "k1", "KINDER");
  consentir(raw, "k1");
  const m = await asegurarMembresia(env, { id: "k1", esAdulto: false }, AHORA);
  verdad(m, "debería entrar");
  igual(m.cohortId, `lc:KINDER|child|e1|${SEMANA}`, "cohorte");
  igual(m.membershipId, `lm:lc:KINDER|child|e1|${SEMANA}:child:k1`, "membresía");
  igual(m.banda, "KINDER", "banda");
  const c = raw.prepare("SELECT * FROM league_cohort WHERE id = ?").get(m.cohortId);
  igual(c.member_count, 1, "member_count");
  igual(c.week_end, "2026-08-09", "week_end");
  igual(c.status, "OPEN", "status");
  // El DO recibió la cabecera y el alta, con el alias y nunca un nombre.
  const abrir = llamadas.find((l) => l.ruta.endsWith("/abrir"));
  const unir = llamadas.find((l) => l.ruta.endsWith("/unir"));
  verdad(abrir, "el DO recibió /abrir");
  igual(abrir.cuerpo.banda, "KINDER", "cabecera banda");
  igual(abrir.cuerpo.week_start, SEMANA, "cabecera semana");
  verdad(unir, "el DO recibió /unir");
  igual(unir.cuerpo.alias, "Nutria", "el alias del perfil viaja al DO");
  igual(unir.cuerpo.membership_id, m.membershipId, "membership_id al DO");
});

await caso("PRIMARIA entra sin fila de consentimiento: el default es encendido (D-081)", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  verdad(m, "debería entrar con el default");
  igual(m.cohortId, `lc:PRIMARIA|child|e1|${SEMANA}`, "cohorte");
});

await caso("una fila REVOCADA apaga también el default encendido de PRIMARIA", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  consentir(raw, "p1", true);
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  igual(m, null, "membresía tras revocar");
  const p = await estadoDeParticipacion(env, { id: "p1", esAdulto: false });
  igual(p, null, "participación tras revocar");
});

await caso("re-otorgar tras revocar reactiva la misma fila (la llave es compuesta, no se duplica)", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  consentir(raw, "p1", true);
  igual(await otorgarLiga(env, "p1", "u1", AHORA), true, "otorgar");
  const fila = raw.prepare("SELECT * FROM child_consents WHERE child_profile_id = 'p1' AND consent_code = 'LEAGUE'").get();
  igual(fila.revoked_at, null, "revoked_at limpio");
  igual(fila.granted_at, AHORA, "granted_at nuevo");
  const n = raw.prepare("SELECT COUNT(*) AS n FROM child_consents WHERE child_profile_id = 'p1'").get().n;
  igual(n, 1, "una sola fila");
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  verdad(m, "vuelve a entrar");
});

await caso("el bin-packing junta: el segundo niño de la semana cae en la cohorte abierta", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  hijo(raw, "p2", "PRIMARIA", "Garza");
  const m1 = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  const m2 = await asegurarMembresia(env, { id: "p2", esAdulto: false }, AHORA);
  igual(m2.cohortId, m1.cohortId, "misma cohorte");
  const c = raw.prepare("SELECT member_count FROM league_cohort WHERE id = ?").get(m1.cohortId);
  igual(c.member_count, 2, "member_count");
  const n = raw.prepare("SELECT COUNT(*) AS n FROM league_cohort").get().n;
  igual(n, 1, "una sola cohorte");
});

await caso("la cohorte llena no deja fuera a nadie: el 31 abre la siguiente con sufijo", async () => {
  const { raw, env } = baseCompleta();
  const base = `lc:PRIMARIA|child|e1|${SEMANA}`;
  raw.prepare(
    "INSERT INTO league_cohort (id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
      "VALUES (?, 'PRIMARIA', 'child', 1, ?, '2026-08-09', 'OPEN', 30, 0)",
  ).run(base, SEMANA);
  hijo(raw, "p31", "PRIMARIA");
  const m = await asegurarMembresia(env, { id: "p31", esAdulto: false }, AHORA);
  verdad(m, "el 31 entra");
  igual(m.cohortId, `${base}#2`, "cohorte con sufijo");
  const c = raw.prepare("SELECT member_count FROM league_cohort WHERE id = ?").get(`${base}#2`);
  igual(c.member_count, 1, "member_count de la nueva");
});

await caso("el alta es idempotente: el segundo ítem de la semana reusa la membresía y no dobla el censo", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  const m1 = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  const m2 = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA + 60_000);
  igual(m2.membershipId, m1.membershipId, "misma membresía");
  const n = raw.prepare("SELECT COUNT(*) AS n FROM league_membership").get().n;
  igual(n, 1, "una fila");
  const c = raw.prepare("SELECT member_count FROM league_cohort WHERE id = ?").get(m1.cohortId);
  igual(c.member_count, 1, "censo sin doblar");
});

await caso("niño y adulto NUNCA comparten cohorte, aunque jueguen lo mismo la misma semana", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "k1", "KINDER");
  consentir(raw, "k1");
  raw.prepare("INSERT INTO users (id, email, locale, is_learner) VALUES ('u2', 'a@x.com', 'es-MX', 1)").run();
  const mn = await asegurarMembresia(env, { id: "k1", esAdulto: false }, AHORA);
  const ma = await asegurarMembresia(env, { id: "u2", esAdulto: true }, AHORA);
  verdad(mn.cohortId !== ma.cohortId, "cohortes distintas");
  igual(ma.cohortId, `lc:SERIO|adult|e1|${SEMANA}`, "cohorte del adulto");
  const tipos = raw.prepare("SELECT DISTINCT tipo_participante FROM league_cohort").all().map((r) => r.tipo_participante).sort();
  igual(tipos.join(","), "adult,child", "una cohorte por tipo");
});

await caso("el adulto aprendiz gana alias en el alta: generador del motor, locale de su cuenta (#239)", async () => {
  const { raw, env } = baseCompleta();
  raw.prepare("INSERT INTO users (id, email, locale, is_learner) VALUES ('u2', 'a@x.com', 'de-DE', 1)").run();
  const m = await asegurarMembresia(env, { id: "u2", esAdulto: true }, AHORA);
  verdad(m, "entra");
  const u = raw.prepare("SELECT alias, alias_locale FROM users WHERE id = 'u2'").get();
  verdad(typeof u.alias === "string" && u.alias.length > 0, "alias escrito");
  verdad(/^[A-Za-z]+\d{4}$/.test(u.alias), `el alias lleva el sufijo aleatorio de 4 dígitos: ${u.alias}`);
  igual(u.alias_locale, "de-DE", "alias_locale de la cuenta");
  // Segunda vez: NO se regenera (un alias que cambia es una identidad que se pierde).
  const antes = u.alias;
  await asegurarMembresia(env, { id: "u2", esAdulto: true }, AHORA + 60_000);
  const despues = raw.prepare("SELECT alias FROM users WHERE id = 'u2'").get().alias;
  igual(despues, antes, "el alias no se regenera");
});

await caso("el cable suma en las DOS copias: DO para la tabla viva, D1 para el cierre semanal", async () => {
  const { llamadas, ns } = nsDeMentira();
  const { raw, env } = baseCompleta(ns);
  hijo(raw, "p1", "PRIMARIA");
  const ok = await sumarPuntosDeLiga(env, { id: "p1", esAdulto: false }, {
    puntos: 25.6,
    diaLocal: "2026-08-05",
    diaNuevo: true,
    racha: 3,
    ahora: AHORA,
  });
  igual(ok, true, "el DO respondió");
  const sumar = llamadas.find((l) => l.ruta.endsWith("/sumar"));
  verdad(sumar, "el DO recibió /sumar");
  igual(sumar.cuerpo.puntos, 25.6, "puntos al DO");
  igual(sumar.cuerpo.dia_local, "2026-08-05", "día local al DO");
  igual(sumar.cuerpo.racha, 3, "racha difundida de solo lectura (D-106)");
  const fila = raw.prepare("SELECT * FROM league_membership").get();
  igual(fila.points_this_week, 25.6, "espejo D1: puntos");
  igual(fila.active_days, 1, "espejo D1: primer día activo");
});

await caso("active_days solo sube con el primer ítem del día (diaNuevo), con tope de 7", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  const entrada = { puntos: 10, diaLocal: "2026-08-05", diaNuevo: true, racha: 1, ahora: AHORA };
  await sumarPuntosDeLiga(env, { id: "p1", esAdulto: false }, entrada);
  await sumarPuntosDeLiga(env, { id: "p1", esAdulto: false }, { ...entrada, diaNuevo: false });
  let fila = raw.prepare("SELECT * FROM league_membership").get();
  igual(fila.points_this_week, 20, "los puntos sí se suman los dos");
  igual(fila.active_days, 1, "el día NO se cuenta dos veces");
  for (let i = 0; i < 10; i++) {
    await sumarPuntosDeLiga(env, { id: "p1", esAdulto: false }, { ...entrada, puntos: 0 });
  }
  fila = raw.prepare("SELECT * FROM league_membership").get();
  igual(fila.active_days, 7, "tope de 7 días");
});

await caso("los puntos negativos se acotan a 0: un total negativo sería lenguaje de pérdida con número (D-081)", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  await sumarPuntosDeLiga(env, { id: "p1", esAdulto: false }, {
    puntos: -40, diaLocal: "2026-08-05", diaNuevo: true, racha: 1, ahora: AHORA,
  });
  const fila = raw.prepare("SELECT * FROM league_membership").get();
  igual(fila.points_this_week, 0, "acotado a 0");
});

await caso("la baja revoca y NO borra, y saca al perfil de la tabla viva ANTES de tocar D1", async () => {
  const { llamadas, ns } = nsDeMentira();
  const { raw, env } = baseCompleta(ns);
  hijo(raw, "p1", "PRIMARIA");
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  const r = await revocarLiga(env, "p1", "u1", AHORA + 60_000);
  igual(r.ok, true, "baja");
  const olvidar = llamadas.find((l) => l.ruta.includes("/olvidar"));
  verdad(olvidar, "el DO recibió /olvidar");
  verdad(olvidar.ruta.includes(encodeURIComponent(m.membershipId)), "con el membership_id");
  // La fila de D1 SIGUE AHÍ (la membresía es historial; lo que se revoca es el consentimiento).
  const membresia = raw.prepare("SELECT COUNT(*) AS n FROM league_membership").get().n;
  igual(membresia, 1, "la membresía no se borra");
  const cons = raw.prepare("SELECT * FROM child_consents WHERE child_profile_id = 'p1'").get();
  verdad(cons.revoked_at !== null, "consentimiento revocado");
  // Y desde la revocación, el alta ya no lo deja entrar.
  const deNuevo = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA + 120_000);
  igual(deNuevo, null, "revocado no vuelve a entrar");
});

await caso("la baja con el DO caído NO toca D1: olvidarEnLiga no falla abierto y el orden importa", async () => {
  const { ns } = nsDeMentira({ falla: true });
  const { raw, env } = baseCompleta(ns);
  hijo(raw, "p1", "PRIMARIA");
  // El alta se hace con el DO sano; la baja, con el DO caído.
  await asegurarMembresia({ DB: env.DB }, { id: "p1", esAdulto: false }, AHORA);
  const r = await revocarLiga(env, "p1", "u1", AHORA + 60_000);
  igual(r.ok, false, "la baja falla");
  igual(r.motivo, "no_se_pudo_olvidar", "motivo");
  const cons = raw.prepare("SELECT COUNT(*) AS n FROM child_consents WHERE child_profile_id = 'p1'").get().n;
  igual(cons, 0, "D1 intacto: ni revocada ni insertada");
});

await caso("apagar el default encendido por primera vez deja constancia: fila insertada ya revocada", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  const r = await revocarLiga(env, "p1", "u1", AHORA);
  igual(r.ok, true, "baja sin membresía vigente");
  const cons = raw.prepare("SELECT * FROM child_consents WHERE child_profile_id = 'p1' AND consent_code = 'LEAGUE'").get();
  verdad(cons, "la fila existe");
  igual(cons.revoked_at, AHORA, "revocada desde que nace");
  igual(cons.granted_by, "u1", "quién decidió");
  igual(cons.consent_version, "v1", "versión del texto");
});

await caso("la ventana del lunes: con la cohorte previa aún OPEN (cierre pendiente) NO se crea nada", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  raw.prepare(
    "INSERT INTO league_cohort (id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
      "VALUES ('lc:PRIMARIA|child|e1|2026-07-27', 'PRIMARIA', 'child', 1, ?, '2026-08-02', 'OPEN', 1, 0)",
  ).run(SEMANA_PASADA);
  raw.prepare(
    "INSERT INTO league_membership (id, cohort_id, child_profile_id, joined_at) " +
      "VALUES ('lm:lc:PRIMARIA|child|e1|2026-07-27:child:p1', 'lc:PRIMARIA|child|e1|2026-07-27', 'p1', 0)",
  ).run();
  // Lunes 00:05 UTC de la semana nueva: la previa venció pero el cierre no ha corrido.
  const lunesMadrugada = Date.UTC(2026, 7, 3, 0, 5, 0);
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, lunesMadrugada);
  igual(m, null, "no se crea nada en la ventana");
  const n = raw.prepare("SELECT COUNT(*) AS n FROM league_cohort WHERE week_start = ?").get(SEMANA).n;
  igual(n, 0, "sin cohorte nueva duplicada");
});

await caso("el que vuelve tras el archivado entra a la semana en curso en su último escalón", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA");
  raw.prepare(
    "INSERT INTO league_cohort (id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
      "VALUES ('lc:PRIMARIA|child|e3|2026-07-20', 'PRIMARIA', 'child', 3, '2026-07-20', '2026-07-26', 'CLOSED', 1, 0)",
  ).run();
  raw.prepare(
    "INSERT INTO league_membership (id, cohort_id, child_profile_id, joined_at, outcome) " +
      "VALUES ('lm:vieja:child:p1', 'lc:PRIMARIA|child|e3|2026-07-20', 'p1', 0, 'ARCHIVADA')",
  ).run();
  const m = await asegurarMembresia(env, { id: "p1", esAdulto: false }, AHORA);
  verdad(m, "vuelve a entrar");
  igual(m.cohortId, `lc:PRIMARIA|child|e3|${SEMANA}`, "mismo escalón, semana nueva");
});

await caso("la pantalla: sin membresía es sin_liga; con objeto mudo, sin_datos; con tabla, ok con el alias propio", async () => {
  const { raw, env } = baseCompleta();
  hijo(raw, "p1", "PRIMARIA", "Garza");
  const sin = await cargarTablaDe(env, { id: "p1", esAdulto: false }, AHORA);
  igual(sin.estado, "sin_liga", "sin membresía");

  await asegurarMembresia({ DB: env.DB }, { id: "p1", esAdulto: false }, AHORA);
  const muda = await cargarTablaDe(env, { id: "p1", esAdulto: false }, AHORA);
  igual(muda.estado, "sin_datos", "membresía sin objeto que responda");

  const cohorte = `lc:PRIMARIA|child|e1|${SEMANA}`;
  const { ns } = nsDeMentira({
    tablas: {
      [cohorte]: [
        { alias: "Garza", avatar_parts: '{"cara":2,"color":1}', points_this_week: 40, current_streak: 3, posicion: { forma: "exacta", rank: 1 } },
        { alias: "Lince", avatar_parts: '{"cara":0,"color":0}', points_this_week: 12, current_streak: 1, posicion: { forma: "exacta", rank: 2 } },
      ],
    },
  });
  const ok = await cargarTablaDe({ DB: env.DB, LEAGUE_DO: ns }, { id: "p1", esAdulto: false }, AHORA);
  igual(ok.estado, "ok", "con tabla");
  igual(ok.filas.length, 2, "dos filas");
  igual(ok.aliasPropio, "Garza", "el alias propio para marcar la fila");
});

await caso("el avatar difundido: piezas válidas pasan; piezas rotas caen al derivado estable del id", async () => {
  const conPiezas = JSON.parse(avatarParaDifundir("x", '{"cara":2,"color":5}'));
  igual(conPiezas.cara, 2, "cara guardada");
  igual(conPiezas.color, 5, "color guardado");
  const roto1 = avatarParaDifundir("participante-1", "no es json");
  const roto2 = avatarParaDifundir("participante-1", "no es json");
  igual(roto1, roto2, "el derivado es estable");
  const fuera = JSON.parse(avatarParaDifundir("x", '{"cara":NaN}'.replace("NaN", "9"),));
  verdad(fuera.cara >= 0 && fuera.cara < 6, "cara dentro del catálogo");
});

console.log(`\n${corridos - fallos}/${corridos} casos en verde`);
if (fallos > 0) {
  console.error(`\n✗ ${fallos} caso(s) fallaron`);
  process.exit(1);
}
