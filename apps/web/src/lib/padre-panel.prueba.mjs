#!/usr/bin/env node
// Casos de la capa de datos del panel del padre — F8 #279-#285.
//
//     node --experimental-strip-types apps/web/src/lib/padre-panel.prueba.mjs
//
// Por qué existen. El panel junta OCHO tablas de dueños distintos en una
// sola pantalla, y cada consulta mal escrita no da error: da una sección con
// los datos de otra semana, una posición de liga leída sin consentimiento,
// o una tendencia que cuenta días de hace un año. Ninguno se ve leyendo el
// código; se ve ejecutando la lectura de verdad contra `node:sqlite`.
//
// La autorización (`hijoDelPadre`) ya tiene sus casos en
// `padre-limite.prueba.mjs`; aquí el hijo llega ya verificado, y lo que se
// prueba es lo que esta capa añade: la composición de las ocho lecturas y la
// puerta de consentimiento de la liga (D-040).
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { leerDatosDelPanel } from "./padre-panel.ts";
import { componerDiagnostico } from "../../../../packages/motor/src/diagnostico.ts";

const HOY = "2026-08-04";

const ESQUEMA = `
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY, parent_user_id TEXT NOT NULL, alias TEXT NOT NULL,
  theme_band TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER
);
CREATE TABLE skill_state (
  child_profile_id TEXT NOT NULL, skill_id TEXT NOT NULL,
  streak_correct INTEGER NOT NULL DEFAULT 0,
  provisional_at INTEGER, mastered_at INTEGER,
  stability REAL, difficulty REAL, due_at INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_profile_id, skill_id)
);
CREATE TABLE child_streak (
  id TEXT PRIMARY KEY, child_profile_id TEXT, user_id TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0, max_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_local_date TEXT, shields_available INTEGER NOT NULL DEFAULT 0,
  shields_earned_total INTEGER NOT NULL DEFAULT 0,
  pause_until_local_date TEXT, pause_uses_this_year INTEGER NOT NULL DEFAULT 0,
  pause_year INTEGER, updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE xp_totals (
  child_profile_id TEXT, user_id TEXT, total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE score_totals (
  child_profile_id TEXT NOT NULL, period TEXT NOT NULL, theme_band TEXT NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (child_profile_id, period)
);
CREATE TABLE child_consents (
  child_profile_id TEXT NOT NULL, consent_code TEXT NOT NULL,
  granted_by TEXT NOT NULL, granted_at INTEGER NOT NULL,
  revoked_at INTEGER, consent_version TEXT,
  PRIMARY KEY (child_profile_id, consent_code)
);
CREATE TABLE league_cohort (
  id TEXT PRIMARY KEY, banda TEXT NOT NULL, tipo_participante TEXT NOT NULL,
  escalon INTEGER NOT NULL, week_start TEXT NOT NULL, week_end TEXT NOT NULL,
  status TEXT NOT NULL, member_count INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE league_membership (
  id TEXT PRIMARY KEY, cohort_id TEXT NOT NULL,
  child_profile_id TEXT, user_id TEXT,
  points_this_week INTEGER NOT NULL DEFAULT 0, active_days INTEGER NOT NULL DEFAULT 0,
  joined_at INTEGER NOT NULL, final_rank INTEGER, outcome TEXT
);
CREATE TABLE child_diagnostic_notes (
  id TEXT PRIMARY KEY, child_profile_id TEXT NOT NULL,
  cause_code TEXT NOT NULL CHECK (cause_code IN ('HABILIDAD_PAUSADA_LATERAL','PATRON_INUSUAL_PARA_EDAD')),
  skill_id TEXT, created_at INTEGER NOT NULL, seen_at INTEGER
);
CREATE TABLE screen_time_settings (
  child_profile_id TEXT PRIMARY KEY, daily_minutes INTEGER NOT NULL,
  break_every_min INTEGER NOT NULL, bedtime_cutoff_min INTEGER NOT NULL,
  bedtime_local TEXT, updated_at INTEGER NOT NULL DEFAULT 0, updated_by TEXT NOT NULL DEFAULT 'u1'
);
CREATE TABLE screen_time_daily_usage (
  child_profile_id TEXT NOT NULL, local_date TEXT NOT NULL,
  minutes_used INTEGER NOT NULL DEFAULT 0, minutes_since_break INTEGER NOT NULL DEFAULT 0,
  warned_at INTEGER, ended_reason TEXT, updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (child_profile_id, local_date)
);
CREATE TABLE cosmetic_catalog (
  id TEXT PRIMARY KEY, categoria TEXT NOT NULL, banda_minima TEXT NOT NULL,
  es_inicial INTEGER NOT NULL DEFAULT 0, nombre_clave TEXT NOT NULL,
  condicion_clave TEXT, arte_avif_url TEXT, arte_webp_url TEXT, arte_silueta_url TEXT,
  created_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE child_cosmetics_unlocked (
  child_profile_id TEXT NOT NULL, cosmetic_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL, evento_causa TEXT NOT NULL DEFAULT 'prueba',
  PRIMARY KEY (child_profile_id, cosmetic_id)
);
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que padre-limite). */
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
    async batch(lista) {
      for (const b of lista) await b.run();
      return [];
    },
  };
}

let fallos = 0;
let corridos = 0;

function caso(nombre, fn) {
  corridos++;
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`  ✓ ${nombre}`))
    .catch((err) => {
      fallos++;
      console.error(`  ✗ ${nombre}`);
      console.error(`    ${String(err).slice(0, 300)}`);
    });
}

function eq(real, esperado, que) {
  const a = JSON.stringify(real);
  const b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${que}: esperaba ${b}, recibió ${a}`);
}

/** Una base con el hijo `h1` del padre `u1`, poblada a mano. */
function basePoblada() {
  const db = new DatabaseSync(":memory:");
  db.exec(ESQUEMA);
  db.exec(`
    INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES
      ('h1', 'u1', 'Zorrito', 'KINDER'),
      ('h2', 'u9', 'Ajeno', 'KINDER');
    INSERT INTO skill_state (child_profile_id, skill_id, attempts, provisional_at, mastered_at, updated_at) VALUES
      ('h1', 'K03', 6, 100, 200, 200),
      ('h1', 'K01', 2, NULL, NULL, 150);
    INSERT INTO child_streak (id, child_profile_id, current_streak, max_streak, shields_available, pause_until_local_date)
      VALUES ('s1', 'h1', 4, 9, 2, NULL);
    INSERT INTO xp_totals (child_profile_id, total_xp) VALUES ('h1', 120);
    INSERT INTO score_totals (child_profile_id, period, theme_band, total_score) VALUES
      ('h1', 'all_time', 'KINDER', 340);
    INSERT INTO league_cohort (id, banda, tipo_participante, escalon, week_start, week_end, status) VALUES
      ('c1', 'KINDER', 'child', 1, '2026-08-03', '2026-08-09', 'OPEN');
    INSERT INTO league_membership (id, cohort_id, child_profile_id, points_this_week, active_days, joined_at) VALUES
      ('m-propio', 'c1', 'h1', 50, 3, 10),
      ('m-otro', 'c1', 'h2', 50, 5, 20);
    INSERT INTO child_diagnostic_notes (id, child_profile_id, cause_code, skill_id, created_at, seen_at) VALUES
      ('n1', 'h1', 'HABILIDAD_PAUSADA_LATERAL', 'K03', 100, NULL),
      ('n2', 'h1', 'PATRON_INUSUAL_PARA_EDAD', NULL, 300, NULL);
    INSERT INTO screen_time_settings (child_profile_id, daily_minutes, break_every_min, bedtime_cutoff_min)
      VALUES ('h1', 20, 15, 60);
    INSERT INTO screen_time_daily_usage (child_profile_id, local_date, minutes_used, ended_reason) VALUES
      ('h1', '2026-08-04', 12, 'DAILY_LIMIT'),
      ('h1', '2026-08-01', 15, NULL),
      ('h1', '2026-05-01', 99, NULL);
    INSERT INTO cosmetic_catalog (id, categoria, banda_minima, es_inicial, nombre_clave, condicion_clave, arte_silueta_url, created_at) VALUES
      ('cos-a', 'avatar_pieza', 'KINDER', 1, 'cosmetico.a.nombre', NULL, NULL, 1),
      ('cos-b', 'avatar_pieza', 'KINDER', 0, 'cosmetico.b.nombre', 'cosmetico.b.condicion', '/cos-b.avif', 2),
      ('cos-c', 'marco_perfil', 'PRIMARIA', 0, 'cosmetico.c.nombre', 'cosmetico.c.condicion', '/cos-c.avif', 3);
    INSERT INTO child_cosmetics_unlocked (child_profile_id, cosmetic_id, unlocked_at) VALUES
      ('h1', 'cos-b', 555);
  `);
  return db;
}

const HIJO = { id: "h1", alias: "Zorrito", theme_band: "KINDER" };

await caso("las ocho lecturas componen el diagnóstico esperado, a mano", async () => {
  const db = basePoblada();
  const datos = await leerDatosDelPanel(adaptar(db), HIJO, HOY);
  const d = componerDiagnostico(datos.filas);

  // Liga: propio 50 puntos/3 días, otro 50 puntos/5 días → propio es 2º de 2.
  // PERO sin consentimiento LEADERBOARD aquí (fixture base) tiene que ser null.
  eq(d.liga, null, "sin consentimiento no hay sección (D-040)");

  db.exec(
    "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at) " +
      "VALUES ('h1', 'LEADERBOARD', 'u1', 50)",
  );
  const datos2 = await leerDatosDelPanel(adaptar(db), HIJO, HOY);
  const d2 = componerDiagnostico(datos2.filas);
  eq(d2.liga, { posicion: 2, total: 2, puntosSemana: 50 }, "posición derivada, no reordenada a mano");

  eq(d2.xp, { total: 120, rango: 2 }, "rango por rangoDeXp (umbral del 2: 100)");
  eq(d2.racha.actual, 4, "racha leída tal cual");
  eq(d2.sinDatosDeHabilidades, false, "hay dos filas de skill_state");
  eq(d2.dominio[0].habilidad, "K03", "la dominada primero");
  eq(d2.dominio[1].habilidad, "K01", "la practicando después");
  eq(d2.dominio.length, 14, "las 14 de kinder");

  eq(d2.notas.length, 2, "las dos notas");
  eq(d2.notas[0].causa, "PATRON_INUSUAL_PARA_EDAD", "más reciente primero");
  eq(d2.notas[1].habilidad, "K03", "la de habilidad con su skill_id");

  eq(d2.pantalla.hoyMinutos, 12, "minutos de hoy");
  eq(d2.pantalla.terminoPorLimiteHoy, true, "el corte de hoy visible");
  eq(d2.pantalla.tendencia.length, 8, "ocho semanas");
  eq(d2.pantalla.tendencia[7].estado, "por_limite", "semana actual cortada");
  // La fila del 2026-05-01 está fuera de la ventana de 56 días: no se cuenta.
  const totalMinutos = d2.pantalla.tendencia.reduce((s, x) => s + x.minutos, 0);
  eq(totalMinutos, 27, "solo los 56 días recientes (12+15, no los 99 viejos)");

  eq(d2.cosmeticos.length, 2, "solo los de su banda (cos-c es PRIMARIA)");
  eq(d2.cosmeticos[0].desbloqueado, true, "la inicial la trae puesta");
  eq(d2.cosmeticos[1].desbloqueado, true, "cos-b tiene fila de desbloqueo");
  eq(d2.cosmeticos[1].condicionClave, "cosmetico.b.condicion", "la clave, no la fórmula");

  eq(datos2.limite.tieneFila, true, "configuración del límite leída de #269");
  eq(datos2.limite.config.daily_minutes, 20, "el tope configurado");
});

await caso("consentimiento revocado: la liga vuelve a desaparecer", async () => {
  const db = basePoblada();
  db.exec(
    "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, revoked_at) " +
      "VALUES ('h1', 'LEADERBOARD', 'u1', 50, 60)",
  );
  const datos = await leerDatosDelPanel(adaptar(db), HIJO, HOY);
  eq(componerDiagnostico(datos.filas).liga, null, "revocado = sin sección");
});

await caso("perfil nuevo: sin filas en ninguna tabla, todo degrada a primer uso", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(ESQUEMA);
  db.exec("INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('h9', 'u1', 'Nuevo', 'KINDER')");
  const datos = await leerDatosDelPanel(
    adaptar(db),
    { id: "h9", alias: "Nuevo", theme_band: "KINDER" },
    HOY,
  );
  const d = componerDiagnostico(datos.filas);
  eq(d.sinDatosDeHabilidades, true, "#285: bienvenida, no lista acusatoria");
  eq(d.xp, { total: 0, rango: 1 }, "sin XP: rango 1");
  eq(d.racha.actual, 0, "sin racha");
  eq(d.liga, null, "sin liga");
  eq(d.notas.length, 0, "sin notas");
  eq(d.pantalla.hoyMinutos, 0, "sin minutos");
  eq(d.cosmeticos.length, 0, "sin catálogo visible no se inventa nada");
  eq(datos.limite.tieneFila, false, "sin fila de configuración (D-139)");
});

console.log(`\n${corridos} casos, ${fallos} fallos`);
if (fallos > 0) process.exit(1);
