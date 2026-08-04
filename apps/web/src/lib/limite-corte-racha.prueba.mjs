#!/usr/bin/env node
// El motivo del corte llega a la racha — F8 #404, la frontera de D-091.
//
//     node --experimental-strip-types apps/web/src/lib/limite-corte-racha.prueba.mjs
//
// Qué defiende. `limite-pantalla.prueba.mjs` ya ejecuta `diaCumplidoPorCorte`
// contra `registrarDia` en el motor puro. Lo que un módulo puro NO puede
// probar es el cable: que cuando `/api/jugar` ve un `CERRAR`, la llamada que
// nombra `LIMITE_DE_PANTALLA_CORTO_LA_SESION` existe, escribe en D1 de verdad
// cuando el día no estaba contado, y no escribe nada cuando ya lo estaba. Un
// fallo aquí no da error — da la omisión silenciosa que
// `audits/limite-no-rompe-el-dia.mjs` declara como su punto ciego: nadie
// reinicia la racha, sencillamente nadie la registra, y el día del niño no
// ocurrió.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { registrarItem, registrarDiaPorLimite } from "./progreso.ts";

// El esquema mínimo, con las MISMAS restricciones que las migraciones de
// verdad (0007, 0008): el CHECK polimórfico de `child_streak` (niño XOR
// adulto) y los índices únicos parciales que arbitran el `ON CONFLICT`.
const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  theme_band TEXT NOT NULL
);
CREATE TABLE child_streak (
  id TEXT PRIMARY KEY,
  child_profile_id TEXT,
  user_id TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_local_date TEXT,
  shields_available INTEGER NOT NULL DEFAULT 0,
  shields_earned_total INTEGER NOT NULL DEFAULT 0,
  shields_earned_this_streak INTEGER NOT NULL DEFAULT 0,
  pause_until_local_date TEXT,
  pause_uses_this_year INTEGER NOT NULL DEFAULT 0,
  pause_year INTEGER,
  days_played_total INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_child_streak_perfil ON child_streak (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_child_streak_usuario ON child_streak (user_id)
  WHERE user_id IS NOT NULL;
CREATE TABLE xp_totals (
  id TEXT PRIMARY KEY,
  child_profile_id TEXT,
  user_id TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  CHECK ((child_profile_id IS NOT NULL) <> (user_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_xp_perfil ON xp_totals (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_xp_usuario ON xp_totals (user_id)
  WHERE user_id IS NOT NULL;
`;

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que pausa.prueba). */
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
        async batch(stmts) {
          for (const s of stmts) await s.run();
        },
      };
      return bound;
    },
    async batch(stmts) {
      for (const s of stmts) await s.run();
    },
  };
}

const ZONA = "UTC";
const AHORA = Date.UTC(2026, 7, 3, 18, 0, 0); // 2026-08-03 en UTC
const HOY = "2026-08-03";

function base() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('u1', 'UTC')").run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, theme_band) VALUES ('k1', 'u1', 'KINDER')",
  ).run();
  return { raw, env: { DB: adaptar(raw) } };
}

const NINO = { id: "k1", esAdulto: false };
const ADULTO = { id: "u1", esAdulto: true };

function rachaDe(raw, columna, id) {
  return raw.prepare(`SELECT * FROM child_streak WHERE ${columna} = ?`).get(id);
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

console.log("\nlimite-corte-racha — el motivo del corte llega a registrarDia (#404, D-091)\n");

await caso("el corte con el día SIN contar registra el día, igual que un reto completado (línea roja #6)", async () => {
  const { raw, env } = base();
  await registrarDiaPorLimite(env, NINO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
  const fila = rachaDe(raw, "child_profile_id", "k1");
  verdad(fila, "la fila de racha existe tras el corte");
  igual(fila.last_completed_local_date, HOY, "el día quedó cumplido");
  igual(fila.current_streak, 1, "la racha arrancó");
  igual(fila.days_played_total, 1, "un día jugado");
});

await caso("los dos motivos de cierre producen el MISMO estado (D-014)", async () => {
  const a = base();
  await registrarDiaPorLimite(a.env, NINO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
  const b = base();
  await registrarDiaPorLimite(b.env, NINO, { motivo: "BEDTIME", ahora: AHORA, zona: ZONA });
  const fa = rachaDe(a.raw, "child_profile_id", "k1");
  const fb = rachaDe(b.raw, "child_profile_id", "k1");
  delete fa.id; delete fb.id; delete fa.updated_at; delete fb.updated_at;
  igual(JSON.stringify(fa), JSON.stringify(fb), "DAILY_LIMIT y BEDTIME dan estados distintos");
});

await caso("con el día ya contado por el ítem (D-091), el corte no escribe nada — el motivo fluye sin tocar el estado", async () => {
  const { raw, env } = base();
  // El ítem contestado minutos antes, exactamente como hace `/api/jugar`.
  const antes = await registrarItem(env, NINO, {
    nivel: 3,
    acc: 1,
    motivo: { tipo: "RETO_COMPLETADO" },
    ahora: AHORA - 60_000,
    zona: ZONA,
  });
  const filaAntes = rachaDe(raw, "child_profile_id", "k1");
  await registrarDiaPorLimite(env, NINO, { motivo: "BEDTIME", ahora: AHORA, zona: ZONA });
  const filaDespues = rachaDe(raw, "child_profile_id", "k1");
  igual(filaDespues.current_streak, filaAntes.current_streak, "la racha no se movió");
  igual(filaDespues.days_played_total, filaAntes.days_played_total, "el día no se contó dos veces");
  igual(filaDespues.updated_at, filaAntes.updated_at, "no hubo segunda escritura");
  verdad(antes !== null, "el ítem sí contó");
});

await caso("el corte NO suma XP: el ítem ya lo sumó, esto es el cierre del día", async () => {
  const { raw, env } = base();
  await registrarDiaPorLimite(env, NINO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
  const xp = raw.prepare("SELECT COUNT(*) AS n FROM xp_totals").get().n;
  igual(xp, 0, "el corte creó una fila de XP");
});

await caso("la llave polimórfica se respeta: un adulto escribe por user_id y el CHECK lo admite", async () => {
  // `/api/jugar` nunca la llama para un adulto (D-016: el adulto no tiene
  // límite), pero la función comparte el contrato polimórfico de
  // `registrarItem` y la otra llave tiene que funcionar igual.
  const { raw, env } = base();
  await registrarDiaPorLimite(env, ADULTO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
  const fila = rachaDe(raw, "user_id", "u1");
  verdad(fila, "la fila del adulto existe");
  igual(fila.child_profile_id, null, "la otra columna quedó NULL, como manda el CHECK");
});

await caso("la base rota no rompe la despedida: falla en silencio, como registrarItem", async () => {
  const rota = {
    prepare() {
      throw new Error("D1 no disponible");
    },
  };
  await registrarDiaPorLimite({ DB: rota }, NINO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
  await registrarDiaPorLimite({ DB: undefined }, NINO, { motivo: "DAILY_LIMIT", ahora: AHORA, zona: ZONA });
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} caso(s) fallaron.`);
  process.exit(1);
}
console.log(`✓ ${corridos} casos del motivo del corte en la racha\n`);
