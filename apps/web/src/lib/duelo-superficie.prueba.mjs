#!/usr/bin/env node
// Casos del cable del DUELO — F7 #244 · D-018, D-053, D-081 · mc-17, mc-19.
//
//     node --experimental-strip-types apps/web/src/lib/duelo-superficie.prueba.mjs
//
// Por qué existen. Un duelo es SQL sobre cuatro tablas más KV, y un SQL mal
// escrito aquí no da error: da un niño de KINDER retado sin que su padre lo
// activara, un set distinto para cada jugador (la equidad entera del duelo),
// un ganador decidido por quién terminó antes —que es presencia con otro
// nombre— o los puntos del otro revelados antes de tiempo, que es media
// presencia. Nada de eso se ve leyendo el código; se ve ejecutándolo.
//
// Las expectativas están escritas A MANO (D-070): la prueba no importa las
// constantes del módulo para comprobarlo — si lo hiciera, aprobaría su propia
// violación.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import {
  anotarPuntoDeDuelo,
  cargarPanelDeDuelo,
  retarADuelo,
  servirItemDeDuelo,
  validarTurnoDeDuelo,
} from "./duelo-superficie.ts";
import { asegurarMembresia } from "./liga-membresia.ts";

// El esquema real de las seis tablas que toca el módulo (0001, 0002, 0004,
// 0012), con sus CHECK. Recortado a las columnas que el cable usa, sin tocar
// una sola restricción de las que quedan — `league_duel` va ENTERA.
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
CREATE TABLE league_duel (
  id                       TEXT PRIMARY KEY,
  cohort_id                TEXT NOT NULL REFERENCES league_cohort(id) ON DELETE CASCADE,
  challenger_membership_id TEXT NOT NULL REFERENCES league_membership(id) ON DELETE CASCADE,
  challenged_membership_id TEXT NOT NULL REFERENCES league_membership(id) ON DELETE CASCADE,
  item_set                 TEXT NOT NULL,
  created_at               INTEGER NOT NULL,
  expires_at               INTEGER NOT NULL,
  challenger_points        INTEGER,
  challenged_points        INTEGER,
  winner_membership_id     TEXT REFERENCES league_membership(id),
  status                   TEXT NOT NULL
                           CHECK (status IN ('PENDIENTE','JUGADO','EXPIRADO')),
  CHECK (challenger_membership_id <> challenged_membership_id),
  CHECK (expires_at > created_at)
);
CREATE INDEX idx_duel_salientes
  ON league_duel (challenger_membership_id) WHERE status = 'PENDIENTE';
INSERT INTO consent_type_catalog (code, description, legal_basis, required, created_at, current_version)
  VALUES
  ('LEAGUE', 'Participar en una liga de ~30 pares, con un alias generado', 'CONSENT', 0, 0, 'v1'),
  ('DUEL', 'Enviar y aceptar retos de duelo dentro de su propia liga', 'CONSENT', 0, 0, 'v1');
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que liga-membresia). */
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

/** Un SESSION_KV de mentira sobre un Map, con la forma que el módulo pide. */
function kvFalso() {
  const mapa = new Map();
  return {
    mapa,
    async get(k) {
      return mapa.has(k) ? mapa.get(k) : null;
    },
    async put(k, v) {
      mapa.set(k, v);
    },
    async delete(k) {
      mapa.delete(k);
    },
  };
}

// Miércoles 2026-08-05 12:00 UTC → la semana de liga empieza el lunes 2026-08-03,
// y el año en curso es 2026 (de él sale la edad de los portones).
const AHORA = Date.UTC(2026, 7, 5, 12, 0, 0);
const VENTANA_48H_MS = 48 * 60 * 60 * 1000;

/** Un banco de veinte ítems de mentira. El set del duelo sale de aquí. */
const BANCO = Array.from({ length: 20 }, (_, i) => `it${String(i + 1).padStart(2, "0")}`);

function baseCompleta(kv) {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, email, locale) VALUES ('u1', 'p@x.com', 'es-MX')").run();
  return { raw, env: { DB: adaptar(raw), SESSION_KV: kv } };
}

function hijo(raw, id, banda, birthYear = 2015, alias = "Nutria") {
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, birth_month, theme_band, locale) " +
      "VALUES (?, 'u1', ?, 'es-MX', ?, 3, ?, 'es-MX')",
  ).run(id, alias, birthYear, banda);
}

function consentir(raw, hijoId, codigo, revocada = false) {
  raw.prepare(
    "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, revoked_at, consent_version) " +
      "VALUES (?, ?, 'u1', 100, ?, 'v1')",
  ).run(hijoId, codigo, revocada ? 200 : null);
}

/** Coloca al jugador en la cohorte de la semana y devuelve su membership id. */
async function membresiaDe(env, id, esAdulto = false) {
  const m = await asegurarMembresia(env, { id, esAdulto }, AHORA);
  if (!m) throw new Error(`no se pudo colocar a ${id}`);
  return m.membershipId;
}

/** Semilla estándar: dos niños de PRIMARIA (11 años) con opt-in DUEL, en la misma liga. */
async function dosNinos(kv) {
  const { raw, env } = baseCompleta(kv);
  hijo(raw, "p1", "PRIMARIA", 2015, "Nutria Veloz");
  hijo(raw, "p2", "PRIMARIA", 2015, "Tecolote");
  consentir(raw, "p1", "DUEL");
  consentir(raw, "p2", "DUEL");
  const m1 = await membresiaDe(env, "p1");
  const m2 = await membresiaDe(env, "p2");
  return { raw, env, m1, m2 };
}

const presentarFalso = async (itemId) => ({ id: itemId, enunciado: `ítem ${itemId}` });

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

console.log("\nduelo-superficie — retar, jugar la mitad, resolver y expirar (#244, D-081)\n");

await caso("retar crea la fila con el set CONGELADO: 6 ítems distintos del banco, ventana de 48 h exactas", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:t1", AHORA);
  verdad(r.ok, `debería crear: ${JSON.stringify(r)}`);
  const f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:t1'").get();
  verdad(f, "la fila existe");
  igual(f.challenger_membership_id, m1, "retador");
  igual(f.challenged_membership_id, m2, "retado");
  igual(f.status, "PENDIENTE", "estado");
  igual(f.expires_at - f.created_at, 172800000, "la ventana es de 48 h, ni una más");
  const set = JSON.parse(f.item_set);
  igual(set.length, 6, "seis ítems");
  igual(new Set(set).size, 6, "sin repetidos: el segundo jugador no puede saber una respuesta");
  verdad(set.every((id) => BANCO.includes(id)), "todos salen del banco");
});

await caso("KINDER no duela NUNCA: es la banda entera, no la edad (con opt-in y liga activados)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "k1", "KINDER", 2018);
  hijo(raw, "k2", "KINDER", 2018);
  consentir(raw, "k1", "LEAGUE");
  consentir(raw, "k2", "LEAGUE");
  consentir(raw, "k1", "DUEL");
  consentir(raw, "k2", "DUEL");
  const m2 = await membresiaDe(env, "k2");
  const r = await retarADuelo(env, { id: "k1", esAdulto: false }, m2, BANCO, "ld:k1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "banda_kinder", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM league_duel").get().n, 0, "ninguna fila");
});

await caso("sin opt-in DUEL no se reta: la AUSENCIA de fila es el default apagado (D-040, D-081)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "p1", "PRIMARIA", 2015);
  hijo(raw, "p2", "PRIMARIA", 2015);
  consentir(raw, "p2", "DUEL"); // el retado sí; el retador no
  const m2 = await membresiaDe(env, "p2");
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:s1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "sin_opt_in", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM league_duel").get().n, 0, "ninguna fila");
});

await caso("un opt-in REVOCADO apaga igual que la ausencia: revocar, nunca borrar (D-040)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "p1", "PRIMARIA", 2015);
  hijo(raw, "p2", "PRIMARIA", 2015);
  consentir(raw, "p1", "DUEL", true); // revocada
  consentir(raw, "p2", "DUEL");
  const m2 = await membresiaDe(env, "p2");
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:s2", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "sin_opt_in", "motivo");
});

await caso("7 años no duela aunque juegue PRIMARIA: edad ≥ 8 desde birth_year y nada más (D-053)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "p1", "PRIMARIA", 2019); // 2026 − 2019 = 7
  hijo(raw, "p2", "PRIMARIA", 2015);
  consentir(raw, "p1", "DUEL");
  consentir(raw, "p2", "DUEL");
  const m2 = await membresiaDe(env, "p2");
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:e1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "edad_insuficiente", "motivo");
});

await caso("el RETADO también pasa los portones: un opt-in que solo se exige al que envía no protege a nadie", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "p1", "PRIMARIA", 2015);
  hijo(raw, "p2", "PRIMARIA", 2015);
  consentir(raw, "p1", "DUEL"); // el retador sí; el retado no
  const m2 = await membresiaDe(env, "p2");
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:r1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "sin_opt_in", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM league_duel").get().n, 0, "ninguna fila");
});

await caso("el CUARTO pendiente saliente se rechaza: el tope de 3 es anti-acoso (#244)", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  const cohorte = raw.prepare("SELECT cohort_id FROM league_membership WHERE id = ?").get(m1).cohort_id;
  for (let i = 1; i <= 3; i++) {
    raw.prepare(
      "INSERT INTO league_duel (id, cohort_id, challenger_membership_id, challenged_membership_id, item_set, created_at, expires_at, status) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')",
    ).run(`ld:tope${i}`, cohorte, m1, m2, '["it01"]', AHORA - 1000, AHORA - 1000 + 172800000);
  }
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:tope4", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "tope_de_pendientes", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM league_duel").get().n, 3, "siguen siendo tres");
});

await caso("fuera de la propia liga NO hay duelo: la membresía ajena ni siquiera llega a los portones (D-018)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  hijo(raw, "p1", "PRIMARIA", 2015);
  hijo(raw, "s1", "SECUNDARIA", 2012);
  consentir(raw, "p1", "DUEL");
  consentir(raw, "s1", "DUEL");
  const mAjena = await membresiaDe(env, "s1"); // cohorte de SECUNDARIA
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, mAjena, BANCO, "ld:f1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "rival_fuera_de_liga", "motivo");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM league_duel").get().n, 0, "ninguna fila");
});

await caso("nadie se reta a sí mismo — el primer defecto de una lista de rivales sin filtro", async () => {
  const { env, m1 } = await dosNinos(kvFalso());
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m1, BANCO, "ld:m1", AHORA);
  igual(r.ok, false, "rechazado");
  igual(r.motivo, "uno_mismo", "motivo");
});

await caso("adulto contra adulto: sin birth_year y sin consentimientos — consiente por sí mismo (#244)", async () => {
  const { raw, env } = baseCompleta(kvFalso());
  raw.prepare("INSERT INTO users (id, email, locale, is_learner) VALUES ('u2', 'a@x.com', 'es-MX', 1)").run();
  const m1 = await membresiaDe(env, "u1", true);
  const m2 = await membresiaDe(env, "u2", true);
  const r = await retarADuelo(env, { id: "u1", esAdulto: true }, m2, BANCO, "ld:a1", AHORA);
  verdad(r.ok, `debería crear: ${JSON.stringify(r)}`);
  const f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:a1'").get();
  igual(f.challenger_membership_id, m1, "retador");
  igual(f.challenged_membership_id, m2, "retado");
});

await caso("servir da el set congelado EN ORDEN, y el progreso sobrevive entre llamadas (KV)", async () => {
  const { raw, env, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:v1", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:v1'").get().item_set);

  const primero = await servirItemDeDuelo(env, { id: "p1", esAdulto: false }, "ld:v1", "es-MX", presentarFalso, AHORA);
  igual(primero.estado, "item", "sirve");
  igual(primero.item.id, set[0], "el primero del set");
  igual(primero.hechos, 0, "ninguno hecho");
  igual(primero.total, 6, "seis en total");

  // Dos anotados: el tercero que sirve es el tercero del set, no el primero otra vez.
  await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:v1", set[0], 10, AHORA);
  await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:v1", set[1], 10, AHORA);
  const tercero = await servirItemDeDuelo(env, { id: "p1", esAdulto: false }, "ld:v1", "es-MX", presentarFalso, AHORA);
  igual(tercero.item.id, set[2], "el tercero del set");
  igual(tercero.hechos, 2, "dos hechos");
});

await caso("un ítem fuera de orden no se anota: el turno lo decide el servidor, no el cliente", async () => {
  const { raw, env, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:o1", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:o1'").get().item_set);

  const turno = await validarTurnoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:o1", set[1], AHORA);
  igual(turno.ok, false, "rechazado");
  igual(turno.motivo, "item_fuera_de_orden", "motivo");
  const r = await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:o1", set[1], 10, AHORA);
  igual(r.ok, false, "tampoco anota");
  const f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:o1'").get();
  igual(f.challenger_points, null, "la columna sigue virgen");
});

await caso("flujo completo: los dos juegan el MISMO set y gana el de más puntos — nunca el que acabó antes (#244)", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:c1", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:c1'").get().item_set);

  // p1 (el retador) juega su mitad: 10 puntos por ítem, 60 en total.
  for (let i = 0; i < 6; i++) {
    const turno = await validarTurnoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:c1", set[i], AHORA);
    verdad(turno.ok, `el ítem ${i} es el que toca`);
    const a = await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:c1", set[i], 10, AHORA);
    verdad(a.ok, `anota el ${i}`);
    igual(a.terminado, i === 5, "terminado solo al sexto");
  }
  let f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:c1'").get();
  igual(f.challenger_points, 60, "la columna del retador");
  igual(f.status, "PENDIENTE", "sin resolver: falta el otro");
  igual(f.winner_membership_id, null, "sin ganador todavía");

  // p2 juega la suya — EL MISMO set, en el mismo orden: eso es la equidad.
  const primeroDelOtro = await servirItemDeDuelo(env, { id: "p2", esAdulto: false }, "ld:c1", "es-MX", presentarFalso, AHORA);
  igual(primeroDelOtro.item.id, set[0], "el otro recibe el mismo primer ítem");
  for (let i = 0; i < 6; i++) {
    await anotarPuntoDeDuelo(env, { id: "p2", esAdulto: false }, "ld:c1", set[i], 5, AHORA);
  }
  f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:c1'").get();
  igual(f.challenged_points, 30, "la columna del retado");
  igual(f.status, "JUGADO", "resuelto cuando los dos terminaron");
  igual(f.winner_membership_id, m1, "gana el de más puntos del set compartido");
});

await caso("el empate existe y no se rompe con un desempate inventado ni con azar (D-014)", async () => {
  const { raw, env, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:e2", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:e2'").get().item_set);
  for (let i = 0; i < 6; i++) {
    await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:e2", set[i], 10, AHORA);
    await anotarPuntoDeDuelo(env, { id: "p2", esAdulto: false }, "ld:e2", set[i], 10, AHORA);
  }
  const f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:e2'").get();
  igual(f.status, "JUGADO", "resuelto");
  igual(f.winner_membership_id, null, "empate: ganador NULL, de primera clase");
});

await caso("a las 48 h sin respuesta queda EXPIRADO y SIN ganador: rechazar es silencioso (#244)", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:x1", AHORA);
  // p1 juega su mitad entera; p2 nunca contesta.
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:x1'").get().item_set);
  for (let i = 0; i < 6; i++) {
    await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:x1", set[i], 10, AHORA);
  }
  // Justo en el borde de la ventana: el panel barre y el duelo caduca.
  const panel = await cargarPanelDeDuelo(env, { id: "p1", esAdulto: false }, AHORA + 172800000);
  const f = raw.prepare("SELECT * FROM league_duel WHERE id = 'ld:x1'").get();
  igual(f.status, "EXPIRADO", "caducó solo");
  igual(f.winner_membership_id, null, "sin ganador: el silencio no es un premio para el otro");
  igual(panel.estado, "ok", "panel vivo");
  igual(panel.duelos.length, 0, "y DESAPARECE del panel: no hay texto de expiración");
});

await caso("un duelo expirado libera el tope: el barrido corre ANTES de contar pendientes", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  const cohorte = raw.prepare("SELECT cohort_id FROM league_membership WHERE id = ?").get(m1).cohort_id;
  for (let i = 1; i <= 3; i++) {
    raw.prepare(
      "INSERT INTO league_duel (id, cohort_id, challenger_membership_id, challenged_membership_id, item_set, created_at, expires_at, status) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')",
    ).run(`ld:viejo${i}`, cohorte, m1, m2, '["it01"]', AHORA - 200000000, AHORA - 200000000 + 172800000);
  }
  // Los tres están PENDIENTES pero con la ventana ya cerrada: retar los barre.
  const r = await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:nuevo", AHORA);
  verdad(r.ok, `debería crear tras barrer: ${JSON.stringify(r)}`);
  const n = raw.prepare("SELECT COUNT(*) AS n FROM league_duel WHERE status = 'EXPIRADO'").get().n;
  igual(n, 3, "los tres viejos quedaron EXPIRADOS");
});

await caso("mientras el duelo está pendiente los puntos NO viajan: saber que el otro terminó es media presencia (D-081)", async () => {
  const { raw, env, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:p1", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:p1'").get().item_set);
  for (let i = 0; i < 6; i++) {
    await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:p1", set[i], 10, AHORA);
  }

  // p1 ya terminó. Su panel dice «esperando» y NO le muestra nada del otro.
  const panelP1 = await cargarPanelDeDuelo(env, { id: "p1", esAdulto: false }, AHORA);
  igual(panelP1.estado, "ok", "panel del retador");
  igual(panelP1.duelos.length, 1, "un duelo");
  igual(panelP1.duelos[0].estado, "esperando", "ya jugué mi parte");
  igual(panelP1.duelos[0].mis_puntos, null, "ni los míos se muestran antes de tiempo");
  igual(panelP1.duelos[0].puntos_del_otro, null, "y los del otro menos");

  // El panel de p2 dice «te toca» y TAMPOCO revela que p1 ya terminó.
  const panelP2 = await cargarPanelDeDuelo(env, { id: "p2", esAdulto: false }, AHORA);
  igual(panelP2.duelos[0].estado, "te_toca", "le toca jugar");
  igual(panelP2.duelos[0].yo_rete, false, "no retó él");
  igual(panelP2.duelos[0].mis_puntos, null, "sin puntos");
  igual(panelP2.duelos[0].puntos_del_otro, null, "sin saber que el otro acabó");
});

await caso("terminado, el marcador viaja a los dos lados — y la fila del panel NO tiene campo de ganador (mc-46)", async () => {
  const { raw, env, m2 } = await dosNinos(kvFalso());
  await retarADuelo(env, { id: "p1", esAdulto: false }, m2, BANCO, "ld:g1", AHORA);
  const set = JSON.parse(raw.prepare("SELECT item_set FROM league_duel WHERE id = 'ld:g1'").get().item_set);
  for (let i = 0; i < 6; i++) {
    await anotarPuntoDeDuelo(env, { id: "p1", esAdulto: false }, "ld:g1", set[i], 10, AHORA);
    await anotarPuntoDeDuelo(env, { id: "p2", esAdulto: false }, "ld:g1", set[i], 5, AHORA);
  }
  const panel = await cargarPanelDeDuelo(env, { id: "p2", esAdulto: false }, AHORA);
  const fila = panel.duelos[0];
  igual(fila.estado, "terminado", "terminado");
  igual(fila.mis_puntos, 30, "mis puntos, del lado que mira");
  igual(fila.puntos_del_otro, 60, "los del otro");
  igual(fila.empate, false, "no es empate");
  // La lista cerrada, escrita A MANO (D-070): el resultado es un marcador,
  // nunca una derrota — no hay campo de ganador que la pantalla pueda pintar.
  igual(
    JSON.stringify(Object.keys(fila).sort()),
    JSON.stringify(
      ["alias_del_otro", "duelo_id", "empate", "estado", "mis_puntos", "puntos_del_otro", "yo_rete"].sort(),
    ),
    "las claves del panel son EXACTAMENTE estas: sin ganador, sin presencia, sin fechas",
  );
});

await caso("la lista de retables excluye al que no tiene opt-in y al de 7 años — y no me incluye a mí", async () => {
  const { raw, env, m1, m2 } = await dosNinos(kvFalso());
  hijo(raw, "p3", "PRIMARIA", 2015, "Sin Optin"); // sin DUEL
  hijo(raw, "p4", "PRIMARIA", 2019, "Chiquito"); // 7 años, con DUEL
  consentir(raw, "p4", "DUEL");
  await membresiaDe(env, "p3");
  await membresiaDe(env, "p4");

  const panel = await cargarPanelDeDuelo(env, { id: "p1", esAdulto: false }, AHORA);
  igual(panel.estado, "ok", "panel vivo");
  igual(panel.pares.length, 1, "solo uno es retable");
  igual(panel.pares[0].membership_id, m2, "el de siempre");
  igual(panel.pares[0].alias, "Tecolote", "con su alias y nunca un nombre");
  verdad(m1 !== m2, "sanidad de la semilla");
});

console.log(`\n${corridos - fallos}/${corridos} casos en verde`);
if (fallos > 0) {
  console.error(`✗ ${fallos} caso(s) fallaron`);
  process.exit(1);
}
console.log("✓ duelo-superficie: todos los casos pasaron");
