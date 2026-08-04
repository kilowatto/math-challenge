#!/usr/bin/env node
// Casos del cable del límite de pantalla — F8 #270, #271, #273.
//
//     node --experimental-strip-types apps/web/src/lib/limite-dia.prueba.mjs
//
// Por qué existen. `limite-pantalla.ts` (el motor) tiene sus propias pruebas
// puras; esto es lo otro: el CABLE entre el motor y D1. Un cable mal escrito
// no da error — da un niño que juega tres horas con el límite «puesto» (la
// fila existe y nadie la lee), un aviso que se repite cada vez que se reabre
// la app (`warned_at` que no se escribe), o un corte nocturno registrado como
// `DAILY_LIMIT` que le cuenta al padre una historia falsa sobre la noche de
// su hijo. Ninguno se ve leyendo la consulta; se ve ejecutándola.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { limiteAlServir, limiteAlResponder } from "./limite-dia.ts";

/*
 * El subconjunto del esquema que el cable toca, con las MISMAS restricciones
 * que las migraciones de verdad (0002, 0003, 0011): el GLOB de `local_date` y
 * de `bedtime_local`, el CHECK de `ended_reason`. Si el cable escribe algo que
 * la base de verdad rechazaría, aquí también revienta — que es la idea.
 */
const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  theme_band TEXT NOT NULL CHECK (theme_band IN ('KINDER','PRIMARIA','SECUNDARIA'))
);
CREATE TABLE screen_time_settings (
  child_profile_id TEXT PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  daily_minutes INTEGER NOT NULL,
  break_every_min INTEGER NOT NULL,
  bedtime_cutoff_min INTEGER NOT NULL,
  bedtime_local TEXT CHECK (bedtime_local IS NULL OR bedtime_local GLOB '[0-2][0-9]:[0-5][0-9]'),
  updated_at INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT NOT NULL DEFAULT 'u1'
);
CREATE TABLE screen_time_daily_usage (
  child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  local_date TEXT NOT NULL CHECK (local_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  minutes_used INTEGER NOT NULL DEFAULT 0 CHECK (minutes_used >= 0),
  minutes_since_break INTEGER NOT NULL DEFAULT 0 CHECK (minutes_since_break >= 0),
  warned_at INTEGER,
  ended_reason TEXT CHECK (ended_reason IS NULL OR ended_reason IN ('DAILY_LIMIT','BEDTIME')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_profile_id, local_date)
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
  };
}

const ZONA = "America/Mexico_City"; // UTC-6, sin horario de verano desde 2022.
const MIN = 60_000;

// 12:00 locales del 3 de agosto de 2026 en la Ciudad de México.
const MEDIODIA = Date.UTC(2026, 7, 3, 18, 0, 0);
const DIA = "2026-08-03";

function base() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('u1', ?)").run(ZONA);
  return { raw, db: adaptar(raw) };
}

function hijo(raw, id, banda) {
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, theme_band) VALUES (?, 'u1', ?)",
  ).run(id, banda);
}

function config(raw, id, { daily = 20, descanso = 15, corte = 60, bedtime = null } = {}) {
  raw.prepare(
    "INSERT INTO screen_time_settings (child_profile_id, daily_minutes, break_every_min, bedtime_cutoff_min, bedtime_local) VALUES (?, ?, ?, ?, ?)",
  ).run(id, daily, descanso, corte, bedtime);
}

function sembrarUso(raw, id, { dia = DIA, usados = 0, desdeDescanso = 0, avisado = null, motivo = null, sellado = MEDIODIA } = {}) {
  raw.prepare(
    "INSERT INTO screen_time_daily_usage (child_profile_id, local_date, minutes_used, minutes_since_break, warned_at, ended_reason, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(id, dia, usados, desdeDescanso, avisado, motivo, sellado);
}

function uso(raw, id, dia = DIA) {
  return raw
    .prepare("SELECT * FROM screen_time_daily_usage WHERE child_profile_id = ? AND local_date = ?")
    .get(id, dia);
}

const NINO = (id) => ({ id, esAdulto: false });
const ADULTO = { id: "u1", esAdulto: true };

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

console.log("\nlimite-dia — el cable entre el motor y D1 (#270, #271, #273)\n");

await caso("el primer servir del día crea la fila en cero y deja jugar (el uso se acumula con o sin configuración, D-139)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MEDIODIA, zona: ZONA, locale: "es-MX" });
  igual(r, null, "SEGUIR no produce aviso");
  const fila = uso(raw, "k1");
  verdad(fila, "la fila del día tiene que existir tras el primer servir");
  igual(fila.minutes_used, 0, "minutos al arrancar");
  igual(fila.local_date, DIA, "el día local del hogar");
  igual(fila.updated_at, MEDIODIA, "el sello del checkpoint");
});

await caso("responder cobra los minutos medidos por el servidor, no los que diga el cliente", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MEDIODIA, zona: ZONA, locale: "es-MX" });
  const r = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + 3 * MIN, zona: ZONA, locale: "es-MX" });
  igual(r, null, "a los 3 minutos de 20 se sigue");
  igual(uso(raw, "k1").minutes_used, 3, "tres minutos cobrados");
  igual(uso(raw, "k1").minutes_since_break, 3, "y tres desde el descanso");
});

await caso("un aparato dormido 30 minutos cobra el tope de checkpoint, no los 30", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  sembrarUso(raw, "k1", { usados: 2, desdeDescanso: 2, sellado: MEDIODIA });
  await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + 30 * MIN, zona: ZONA, locale: "es-MX" });
  igual(uso(raw, "k1").minutes_used, 12, "2 + tope de 10, no 2 + 30");
});

await caso("el aviso cae a 5 minutos del tope, sin cifra en KINDER, y `warned_at` queda escrito (#270)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1"); // 20 min, aviso a los 15 — sin fila no habría aviso (D-139)
  sembrarUso(raw, "k1", { usados: 15, desdeDescanso: 4, sellado: MEDIODIA });
  const r = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "AVISO", `esperaba AVISO, obtuve ${JSON.stringify(r)}`);
  verdad(!/\d/.test(r.textos.cuerpo), `KINDER sin cifras (mc-20, D-024): «${r.textos.cuerpo}»`);
  igual(uso(raw, "k1").warned_at, MEDIODIA + MIN, "warned_at se escribió");
});

await caso("el aviso NO se repite si el niño cierra y reabre la app antes del corte (#270)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1");
  sembrarUso(raw, "k1", { usados: 16, desdeDescanso: 4, avisado: MEDIODIA, sellado: MEDIODIA });
  // Reabre la app: entra por el servir…
  const alServir = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MEDIODIA + 2 * MIN, zona: ZONA, locale: "es-MX" });
  igual(alServir, null, "ya avisado hoy: el servir no vuelve a avisar");
  // …y contesta un ítem más: tampoco.
  const alResponder = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + 3 * MIN, zona: ZONA, locale: "es-MX" });
  igual(alResponder, null, "ya avisado hoy: el responder no vuelve a avisar");
});

await caso("el descanso se OFRECE al llegar al de la banda, reinicia su contador y no toca el total (#271)", async () => {
  const { raw, db } = base();
  hijo(raw, "p1", "PRIMARIA");
  config(raw, "p1", { daily: 30, descanso: 20 }); // descanso cada 20
  sembrarUso(raw, "p1", { usados: 20, desdeDescanso: 20, sellado: MEDIODIA });
  const r = await limiteAlResponder({ DB: db }, NINO("p1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "DESCANSO", `esperaba DESCANSO, obtuve ${JSON.stringify(r)}`);
  verdad(r.textos.seguir && r.textos.seguir.length > 0, "el botón de seguir existe desde el primer instante");
  verdad(r.textos.afuera && r.textos.afuera.length > 0, "la sugerencia de actividad al aire libre (mc-26 #7)");
  const fila = uso(raw, "p1");
  igual(fila.minutes_since_break, 0, "el contador del descanso vuelve a 0 al mostrarse");
  igual(fila.minutes_used, 21, "minutes_used NO se toca: el descanso no cuenta ni a favor ni en contra");
});

await caso("al llegar al tope diario el día se cierra con DAILY_LIMIT y el servir siguiente no sirve (#272)", async () => {
  const { raw, db } = base();
  hijo(raw, "p1", "PRIMARIA");
  config(raw, "p1", { daily: 30, descanso: 20 });
  sembrarUso(raw, "p1", { usados: 29, desdeDescanso: 9, avisado: MEDIODIA, sellado: MEDIODIA });
  const r = await limiteAlResponder({ DB: db }, NINO("p1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR" && r.motivo === "DAILY_LIMIT", `esperaba CERRAR/DAILY_LIMIT, obtuve ${JSON.stringify(r)}`);
  igual(uso(raw, "p1").ended_reason, "DAILY_LIMIT", "el motivo escrito en la fila del día");
  verdad(r.textos.retosUno && r.textos.retosOtros, "lector recibe las plantillas del conteo de retos");
  verdad(r.textos.salir, "la despedida tiene su salida");
  // Y la prueba de verdad: pedir otro ítem NO lo sirve.
  const alServir = await limiteAlServir({ DB: db }, NINO("p1"), { ahora: MEDIODIA + 2 * MIN, zona: ZONA, locale: "es-MX" });
  verdad(alServir && alServir.tipo === "CERRAR", "cerrar y reabrir la app no levanta el corte del día");
});

await caso("la despedida de KINDER no lleva conteo de retos ni cifra", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1"); // 20 min
  sembrarUso(raw, "k1", { usados: 20, desdeDescanso: 5, sellado: MEDIODIA });
  const r = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR", `esperaba CERRAR, obtuve ${JSON.stringify(r)}`);
  verdad(!/\d/.test(r.textos.cuerpo), `KINDER sin cifras: «${r.textos.cuerpo}»`);
  igual(r.textos.retosUno, undefined, "KINDER no recibe plantillas de conteo");
});

await caso("el corte nocturno con bedtime NULL no existe, aunque sea de noche (#273)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  // Sin fila de configuración: `bedtime_local` nace NULL y no se enciende solo.
  const NOCHE = Date.UTC(2026, 7, 4, 2, 30, 0); // 20:30 locales: dentro de la ventana SI hubiera bedtime
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: NOCHE, zona: ZONA, locale: "es-MX" });
  igual(r, null, "sin bedtime no hay corte nocturno — no se inventa una hora de dormir");
});

await caso("con bedtime encendido la ventana corta, escribe BEDTIME y despide de noche (#273)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { bedtime: "21:00" }); // KINDER: la ventana abre 60 min antes → 20:00
  const NOCHE = Date.UTC(2026, 7, 4, 2, 30, 0); // 20:30 locales del 3 de agosto
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: NOCHE, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR" && r.motivo === "BEDTIME", `esperaba CERRAR/BEDTIME, obtuve ${JSON.stringify(r)}`);
  igual(uso(raw, "k1").ended_reason, "BEDTIME", "distinto de DAILY_LIMIT — la noche no se cuenta como tope");
  verdad(!/\d/.test(r.textos.cuerpo), `nocturno KINDER sin cifras: «${r.textos.cuerpo}»`);
});

await caso("la ventana nocturna también impide EMPEZAR de madrugada, no solo cortar lo abierto (dudas §23.1)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { bedtime: "21:00" });
  const MADRUGADA = Date.UTC(2026, 7, 4, 7, 0, 0); // 01:00 locales del 4: día nuevo, ventana viva hasta las 05:00
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MADRUGADA, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR" && r.motivo === "BEDTIME", `a la 1 a.m. no se empieza: ${JSON.stringify(r)}`);
});

await caso("pasado el fin de la noche (05:00) se vuelve a jugar, con la ventana que da la vuelta a medianoche", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { bedtime: "21:00" });
  const MANANA = Date.UTC(2026, 7, 4, 12, 0, 0); // 06:00 locales del 4
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MANANA, zona: ZONA, locale: "es-MX" });
  igual(r, null, "a las 06:00 la noche ya terminó");
});

await caso("el mismo instante en otra zona NO está en la ventana: la hora es la del hogar, no la UTC (#273, viaje)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { bedtime: "21:00" });
  const INSTANTE = Date.UTC(2026, 7, 4, 2, 30, 0); // 20:30 en CDMX, 11:30 en Tokio
  const enCasa = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: INSTANTE, zona: ZONA, locale: "es-MX" });
  verdad(enCasa && enCasa.tipo === "CERRAR", "en la zona del hogar es de noche");
  const { raw: raw2, db: db2 } = base();
  hijo(raw2, "k1", "KINDER");
  config(raw2, "k1", { bedtime: "21:00" });
  const deViaje = await limiteAlServir({ DB: db2 }, NINO("k1"), { ahora: INSTANTE, zona: "Asia/Tokyo", locale: "es-MX" });
  igual(deViaje, null, "con el huso desactualizado del viaje la ventana no se calcula — se usa la del hogar");
});

await caso("un daily_minutes del padre fuera de rango se corrige al default de la banda, no se respeta", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { daily: 600 }); // escrito por una vía sin validación
  sembrarUso(raw, "k1", { usados: 25, desdeDescanso: 5, sellado: MEDIODIA }); // 25 > 20 (default), < 600
  const r = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR", "600 no se respeta: con el default de 20 el día ya terminó");
});

await caso("un daily_minutos válido del padre SÍ se respeta (10, el piso de KINDER)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  config(raw, "k1", { daily: 10 });
  sembrarUso(raw, "k1", { usados: 10, desdeDescanso: 5, sellado: MEDIODIA });
  const r = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  verdad(r && r.tipo === "CERRAR" && r.motivo === "DAILY_LIMIT", "el tope que el padre eligió manda");
});

await caso("sin fila de configuración NO hay límite, y los minutos se acumulan igual (D-139)", async () => {
  // D-139 (2026-08-03) SUPERÓ la «protección desde el día uno»: el límite
  // diario protege solo después de que el padre lo configura. Sin fila, ni a
  // 10 veces el default de la banda se corta — y el uso se escribe igual, que
  // es lo que el «hoy jugó X minutos» del padre lee (#269).
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER"); // sin fila en screen_time_settings: hoy, TODOS los perfiles
  sembrarUso(raw, "k1", { usados: 200, desdeDescanso: 200, sellado: MEDIODIA });
  const alResponder = await limiteAlResponder({ DB: db }, NINO("k1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "es-MX" });
  igual(alResponder, null, "sin configuración no hay corte diario, descanso ni aviso");
  const alServir = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MEDIODIA + 2 * MIN, zona: ZONA, locale: "es-MX" });
  igual(alServir, null, "y el servir siguiente sirve normal");
  igual(uso(raw, "k1").minutes_used, 201, "los minutos se acumularon aunque no hubiera límite");
});

await caso("el día de ayer no gotea a hoy: la fila es por (niño, día local)", async () => {
  const { raw, db } = base();
  hijo(raw, "k1", "KINDER");
  sembrarUso(raw, "k1", { dia: "2026-08-02", usados: 20, desdeDescanso: 20, avisado: MEDIODIA, motivo: "DAILY_LIMIT" });
  const r = await limiteAlServir({ DB: db }, NINO("k1"), { ahora: MEDIODIA, zona: ZONA, locale: "es-MX" });
  igual(r, null, "ayer llegó al tope; hoy es otro día");
  igual(uso(raw, "k1", DIA).minutes_used, 0, "hoy empieza en cero");
});

await caso("un adulto que practica no tiene límite y no deja fila escrita (D-016)", async () => {
  const { raw, db } = base();
  const r1 = await limiteAlServir({ DB: db }, ADULTO, { ahora: MEDIODIA, zona: ZONA, locale: "es-MX" });
  const r2 = await limiteAlResponder({ DB: db }, ADULTO, { ahora: MEDIODIA + 90 * MIN, zona: ZONA, locale: "es-MX" });
  igual(r1, null, "el adulto sirve siempre");
  igual(r2, null, "el adulto responde siempre");
  igual(raw.prepare("SELECT COUNT(*) AS n FROM screen_time_daily_usage").get().n, 0, "sin filas de un adulto");
});

await caso("la base rota no niega el juego: falla abierto y devuelve null", async () => {
  const rota = {
    prepare() {
      throw new Error("D1 no disponible");
    },
  };
  const r = await limiteAlResponder({ DB: rota }, NINO("k1"), { ahora: MEDIODIA, zona: ZONA, locale: "es-MX" });
  igual(r, null, "lo que se pierde es la protección de un rato, no el reto");
});

await caso("el copy viaja en el locale de quien juega (de-DE) y cae a `en` con uno desconocido (D-022)", async () => {
  const { raw, db } = base();
  hijo(raw, "s1", "SECUNDARIA");
  config(raw, "s1", { daily: 45, descanso: 25, corte: 30 });
  sembrarUso(raw, "s1", { usados: 45, desdeDescanso: 5, sellado: MEDIODIA });
  const de = await limiteAlResponder({ DB: db }, NINO("s1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "de-DE" });
  verdad(de && de.tipo === "CERRAR", "corte en alemán");
  const { raw: raw2, db: db2 } = base();
  hijo(raw2, "s1", "SECUNDARIA");
  config(raw2, "s1", { daily: 45, descanso: 25, corte: 30 });
  sembrarUso(raw2, "s1", { usados: 45, desdeDescanso: 5, sellado: MEDIODIA });
  const xx = await limiteAlResponder({ DB: db2 }, NINO("s1"), { ahora: MEDIODIA + MIN, zona: ZONA, locale: "xx" });
  igual(xx.textos.cuerpo, "Good work today. See you tomorrow.", "locale desconocido → en");
  verdad(de.textos.cuerpo !== xx.textos.cuerpo, "de-DE no recibe el texto en inglés");
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} caso(s) fallaron.`);
  process.exit(1);
}
console.log(`✓ ${corridos} casos del cable del límite de pantalla\n`);
