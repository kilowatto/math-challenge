#!/usr/bin/env node
// Casos del Durable Object de misiones diarias y de su cable — #224.
//
//     node --experimental-strip-types apps/web/src/lib/missions-do.prueba.mjs
//
// Las que mandan:
//
//  · **El XP se paga UNA vez** (línea roja #5). Se comprueba repitiendo el
//    avance que completa una misión —el reintento de red— y exigiendo que el
//    segundo pague cero. Se ve fallar si el objeto dejara de comparar por
//    referencia lo que devuelve `avanzarMision()`.
//  · **D1 es rollup, no segundo escritor.** `registrarAvanceDeHoy` escribe en
//    `mission_daily_summary` exactamente lo que el objeto decidió, y sin el
//    binding no escribe NADA — un rollup que el dueño no calculó no existe.
//  · **Borrar borra de verdad.** Tras `/olvidar` el almacenamiento queda en
//    cero, no «marcado como borrado».
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import {
  Misiones,
  avanzarEnMisiones,
  olvidarMisiones,
} from "./missions-do.ts";
import { leerMisionesDeHoy, registrarAvanceDeHoy } from "./misiones-dia.ts";
import {
  BONO_DIA_COMPLETO,
  definicionDe,
  elegirMisionesDelDia,
} from "../../../../packages/motor/src/misiones.ts";
import { diaEfectivo } from "../../../../packages/motor/src/tiempo-local.ts";

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

const NINGUNA_LIGA = { enLiga: false, dueloOptIn: false, metaColectivaHoy: null };

// Un instante fijo al mediodía UTC: el día efectivo no depende de la orilla.
const AHORA = Date.UTC(2026, 7, 3, 12, 0, 0);
const DIA = diaEfectivo(AHORA, "UTC");
const DIA_SIGUIENTE = diaEfectivo(AHORA + 86_400_000, "UTC");

// ─── El almacenamiento y el espacio de nombres falsos ────────────────────────

/** El disco falso del objeto, con la misma forma que el del DO de verdad. */
function almacenamientoFalso() {
  const m = new Map();
  return {
    interno: m,
    async get(k) { return m.get(k); },
    async put(k, v) { m.set(k, structuredClone(v)); },
    async list({ prefix }) {
      return new Map([...m].filter(([k]) => k.startsWith(prefix)));
    },
    async deleteAll() { m.clear(); },
  };
}

/**
 * Un espacio de nombres falso que SI reparte por nombre: cada `idFromName`
 * abre el objeto de ese niño y solo de ese, como el runtime. La clase bajo
 * prueba es la de verdad; lo falso es el enrutado.
 */
function espacioFalso() {
  const objetos = new Map();
  return {
    objetos,
    idFromName: (nombre) => ({ name: nombre }),
    get(id) {
      if (!objetos.has(id.name)) {
        objetos.set(id.name, new Misiones({ id, storage: almacenamientoFalso() }));
      }
      const obj = objetos.get(id.name);
      return { fetch: (url, init) => obj.fetch(new Request(url, init)) };
    },
  };
}

const nuevoObjeto = (perfilId = "n1") => {
  const storage = almacenamientoFalso();
  return { obj: new Misiones({ id: { name: perfilId }, storage }), storage };
};

const peticion = (extra = {}) => ({
  dia: DIA,
  banda: "PRIMARIA",
  resumenLiga: NINGUNA_LIGA,
  habilidad: "K03",
  ...extra,
});

/** La selección del día, calculada con el mismo motor que el objeto usa. */
const seleccionDe = (perfilId, dia, banda = "PRIMARIA") =>
  elegirMisionesDelDia(perfilId, dia, banda, null, NINGUNA_LIGA).map((m) => m.tipo);

// ─── La base de verdad para el cable (patrón node:sqlite de push-hogares) ───

const ESQUEMA = `
CREATE TABLE users (id TEXT PRIMARY KEY, timezone TEXT);
CREATE TABLE child_profiles (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  theme_band TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);
CREATE TABLE mission_daily_summary (
  id TEXT PRIMARY KEY,
  child_profile_id TEXT,
  user_id TEXT,
  local_date TEXT NOT NULL,
  mission_type TEXT NOT NULL,
  target INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_mission_daily_perfil
  ON mission_daily_summary (child_profile_id, local_date, mission_type)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_mission_daily_usuario
  ON mission_daily_summary (user_id, local_date, mission_type)
  WHERE user_id IS NOT NULL;
CREATE TABLE xp_totals (
  child_profile_id TEXT,
  user_id TEXT,
  total_xp INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_xp_totals_perfil ON xp_totals (child_profile_id)
  WHERE child_profile_id IS NOT NULL;
CREATE UNIQUE INDEX idx_xp_totals_usuario ON xp_totals (user_id)
  WHERE user_id IS NOT NULL;
`;

/** El adaptador D1 mínimo sobre node:sqlite, con `batch` (el cable lo usa). */
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
    async batch(stmts) {
      const salida = [];
      for (const s of stmts) salida.push(await s.run());
      return salida;
    },
  };
}

/**
 * El entorno del cable: base en memoria con un niño de PRIMARIA y su padre en
 * UTC, y un espacio de nombres falso. Las tablas de liga y consentimientos no
 * se crean a propósito: `resumenLigaDeHoy` degrada a «no está en liga», que es
 * el caso real de hoy.
 */
function entornoCompleto() {
  const raw = new DatabaseSync(":memory:");
  raw.exec(ESQUEMA);
  raw.prepare("INSERT INTO users (id, timezone) VALUES ('u1', 'UTC')").run();
  raw.prepare(
    "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES ('n1', 'u1', 'Lince', 'PRIMARIA')",
  ).run();
  const ns = espacioFalso();
  return { raw, env: { DB: adaptar(raw), MISSIONS_DO: ns }, ns };
}

const filasMision = (raw, dia = DIA) =>
  raw.prepare("SELECT * FROM mission_daily_summary WHERE local_date = ?").all(dia);
const xpTotal = (raw) =>
  raw.prepare("SELECT total_xp AS t FROM xp_totals WHERE child_profile_id = 'n1'").get()?.t ?? 0;

console.log("\nmissions-do — un Durable Object por niño para las misiones del día (#224)\n");

// ─── El objeto: avanzar, y el XP una sola vez ────────────────────────────────

await caso("el primer ítem siembra el día y volumen sube a 1, sin XP todavía", async () => {
  const { obj } = nuevoObjeto();
  const r = await obj.avanzar(peticion());
  igual(r.cambios.length, 1, "una sola misión cambió");
  igual(r.cambios[0].mission_type, "volumen", "la que cambió es volumen");
  igual(r.cambios[0].progress, 1, "progreso 1");
  igual(r.xpGanado, 0, "sin XP antes de completar");
});

await caso("completar volumen paga el XP del catálogo, y el reintento paga CERO (línea roja #5)", async () => {
  const { obj } = nuevoObjeto();
  await obj.avanzar(peticion());
  await obj.avanzar(peticion());
  const tercera = await obj.avanzar(peticion());
  const xpVolumen = definicionDe("volumen").xp;
  igual(tercera.xpGanado, xpVolumen, "el XP fijo y publicado de volumen");
  igual(tercera.cambios[0].completed, 1, "completada");
  igual(tercera.cambios[0].xp_awarded, xpVolumen, "xp_awarded en el estado");

  // El reintento de red de ese mismo avance: la misión ya está completada, el
  // motor devuelve el mismo objeto y no hay nada que pagar ni que escribir.
  const reintento = await obj.avanzar(peticion());
  igual(reintento.xpGanado, 0, "el reintento no paga");
  igual(reintento.cambios.length, 0, "y no cambia nada");
});

await caso("variedad sube solo con habilidad NUEVA hoy: dos veces la misma cuenta una", async () => {
  // La selección es determinista: se busca un día en el que `variedad` esté en
  // el menú de este perfil (no siempre está — rotan cuatro tipos por dos slots).
  let dia = null;
  for (let i = 0; i < 60; i++) {
    const candidato = diaEfectivo(AHORA + i * 86_400_000, "UTC");
    if (seleccionDe("n1", candidato).includes("variedad")) { dia = candidato; break; }
  }
  if (!dia) throw new Error("ningún día de los 60 tiene variedad en el menú — ¿cambió el catálogo?");

  const { obj } = nuevoObjeto();
  // Primera habilidad nueva: variedad sube a 1 (y no se completa: su meta es 2).
  const r1 = await obj.avanzar(peticion({ dia, habilidad: "K01" }));
  const v1 = r1.cambios.find((c) => c.mission_type === "variedad");
  igual(v1?.progress, 1, "primera habilidad nueva: variedad en 1");
  // La MISMA habilidad otra vez: variedad no se mueve.
  const r2 = await obj.avanzar(peticion({ dia, habilidad: "K01" }));
  igual(r2.cambios.some((c) => c.mission_type === "variedad"), false, "la misma habilidad no suma");
  // Una habilidad distinta: variedad se completa. Es el TERCER ítem del día,
  // así que volumen también se completa en este mismo avance — el XP pagado es
  // la suma de las dos transiciones, cada una una sola vez.
  const r3 = await obj.avanzar(peticion({ dia, habilidad: "K02" }));
  const v3 = r3.cambios.find((c) => c.mission_type === "variedad");
  igual(v3?.completed, 1, "segunda habilidad distinta: completada");
  igual(r3.xpGanado, definicionDe("variedad").xp + definicionDe("volumen").xp,
    "paga el XP de variedad (y el de volumen, que cerró en el mismo ítem)");
});

await caso("el bono del día se paga UNA vez, y el reintento del cierre no lo repite", async () => {
  const { obj, storage } = nuevoObjeto();
  // Se siembra el día a punto de cerrar: dos misiones completadas y volumen a
  // un ítem de la meta. El objeto no reverifica la selección cuando el día ya
  // existe — el estado sembrado es el que avanza.
  const xpVolumen = definicionDe("volumen").xp;
  storage.interno.set("dia", {
    local_date: DIA,
    habilidades: ["K03"],
    misiones: [
      { local_date: DIA, mission_type: "volumen", target: 3, progress: 2, completed: 0, xp_awarded: 0 },
      { local_date: DIA, mission_type: "variedad", target: 2, progress: 2, completed: 1, xp_awarded: 5 },
      { local_date: DIA, mission_type: "precision", target: 1, progress: 1, completed: 1, xp_awarded: 5 },
    ],
  });

  const cierre = await obj.avanzar(peticion());
  igual(cierre.xpGanado, xpVolumen + BONO_DIA_COMPLETO, "XP de volumen + bono del día");

  const reintento = await obj.avanzar(peticion());
  igual(reintento.xpGanado, 0, "el día ya estaba cerrado: el bono no se paga dos veces");
  igual(reintento.cambios.length, 0, "nada cambia");
});

await caso("un día nuevo REEMPLAZA el estado: el objeto guarda hoy, no un historial", async () => {
  const { obj, storage } = nuevoObjeto();
  await obj.avanzar(peticion({ dia: DIA }));
  await obj.avanzar(peticion({ dia: DIA_SIGUIENTE }));
  igual(storage.interno.size, 1, "una sola llave en el almacenamiento");
  igual(storage.interno.get("dia").local_date, DIA_SIGUIENTE, "y es la del día nuevo");
  igual(storage.interno.get("dia").habilidades.length, 1, "las habilidades de ayer no se arrastran");
});

// ─── Nada crudo llega al almacenamiento (mc-32 riesgo #1) ────────────────────
//
// SE VE FALLAR: añade `respuesta: p.respuesta` al objeto que `avanzar()`
// guarda, y la búsqueda de abajo lo encuentra.
await caso("campos de más en la petición NO llegan al almacenamiento", async () => {
  const { obj, storage } = nuevoObjeto();
  await obj.fetch(new Request("https://misiones/avanzar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...peticion(),
      respuestaDelNino: "cuarenta-y-dos",
      enunciado: "¿cuántos elefantes hay?",
      itemId: "item-secreto-123",
    }),
  }));
  const volcado = JSON.stringify([...storage.interno.entries()]);
  for (const prohibido of ["cuarenta-y-dos", "elefantes", "item-secreto", "respuestaDelNino", "enunciado", "itemId"]) {
    igual(volcado.includes(prohibido), false, `«${prohibido}» no está en lo guardado`);
  }
});

// ─── El borrado ──────────────────────────────────────────────────────────────

await caso("/olvidar deja el almacenamiento EN CERO, y empezar de nuevo no resucita nada", async () => {
  const { obj, storage } = nuevoObjeto();
  await obj.avanzar(peticion());
  igual(storage.interno.size, 1, "hay día guardado");

  const r = await obj.fetch(new Request("https://misiones/olvidar"));
  const cuerpo = await r.json();
  igual(cuerpo.ok && cuerpo.borrado === "todo", true, "el objeto dice que borró todo");
  igual(storage.interno.size, 0, "el almacenamiento queda en cero");

  const deNuevo = await obj.avanzar(peticion());
  igual(deNuevo.cambios[0]?.progress, 1, "volver a jugar empieza de cero");
});

await caso("el helper de borrado NO falla abierto, y sin binding no hay nada que borrar", async () => {
  const ns = espacioFalso();
  await avanzarEnMisiones(ns, "n1", peticion());
  igual(ns.objetos.get("n1") !== undefined, true, "el objeto existe");
  igual(await olvidarMisiones(ns, "n1"), true, "el borrado confirma de verdad");
  igual(await olvidarMisiones(undefined, "n1"), true, "sin binding, decir que sí es correcto: no existe");
  // Un espacio cuyo stub muere: el helper tiene que decir false, no true.
  const roto = {
    idFromName: (name) => ({ name }),
    get: () => ({ fetch: () => Promise.resolve(new Response("boom", { status: 500 })) }),
  };
  igual(await olvidarMisiones(roto, "n1"), false, "un borrado que falló dice que falló");
});

await caso("una ruta desconocida NO se atiende en silencio", async () => {
  const { obj } = nuevoObjeto();
  const r = await obj.fetch(new Request("https://misiones/lo-que-sea"));
  igual(r.status, 404, "404");
});

// ─── Uno por niño, comprobado sobre la fuente ────────────────────────────────

await caso("la fuente reparte por child_profile_id: una llamada a idFromName, sin literal", async () => {
  const fuente = await (await import("node:fs/promises")).readFile(
    new URL("./missions-do.ts", import.meta.url), "utf8",
  );
  const sinComentarios = fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  const llamadas = sinComentarios.match(/idFromName\(([^)]*)\)/g) ?? [];
  igual(llamadas.length, 1, "hay UNA sola llamada a idFromName");
  igual(/idFromName\(\s*["'`]/.test(sinComentarios), false,
    "sin literal: un DO global topa en 500-1.000 req/s (mc-32 riesgo #2)");
  igual(/idFromName\(perfilId\)/.test(sinComentarios), true,
    "recibe el id del perfil — un objeto por niño, que es lo que hace que borrar sea deleteAll()");
});

// ─── El cable: el DO es el dueño y D1 es el rollup ───────────────────────────

await caso("un ítem escribe el rollup en D1 con el estado que el objeto decidió", async () => {
  const { raw, env } = entornoCompleto();
  await registrarAvanceDeHoy(env, { id: "n1", esAdulto: false }, { habilidad: "K03", ahora: AHORA });
  const filas = filasMision(raw);
  igual(filas.length, 1, "una fila — solo la misión que cambió");
  igual(filas[0].mission_type, "volumen", "volumen");
  igual(filas[0].progress, 1, "progreso 1");
  igual(filas[0].child_profile_id, "n1", "del niño");
  igual(filas[0].user_id, null, "user_id en NULL (exactamente un dueño, 0009)");
});

await caso("completar volumen escribe xp_totals UNA vez; el reintento no lo mueve", async () => {
  const { raw, env } = entornoCompleto();
  const quien = { id: "n1", esAdulto: false };
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA });
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA + 1000 });
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA + 2000 });
  const xpVolumen = definicionDe("volumen").xp;
  igual(xpTotal(raw), xpVolumen, "el XP del catálogo, en xp_totals");
  const fila = filasMision(raw).find((f) => f.mission_type === "volumen");
  igual(fila.completed, 1, "la fila del rollup queda completada");
  igual(fila.xp_awarded, xpVolumen, "y con el XP otorgado");

  // El reintento de red del mismo cierre: cero XP nuevo, cero filas nuevas.
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA + 3000 });
  igual(xpTotal(raw), xpVolumen, "el reintento no paga dos veces (línea roja #5)");
});

await caso("sin el binding del DO no se escribe NADA: el rollup no se inventa al margen del dueño", async () => {
  const { raw, env } = entornoCompleto();
  delete env.MISSIONS_DO;
  await registrarAvanceDeHoy(env, { id: "n1", esAdulto: false }, { habilidad: "K03", ahora: AHORA });
  igual(filasMision(raw).length, 0, "mission_daily_summary vacía");
  igual(xpTotal(raw), 0, "xp_totals intacto");
});

await caso("KINDER no tiene menú: ni el objeto ni el rollup se tocan (#213)", async () => {
  const { raw, env, ns } = entornoCompleto();
  raw.prepare("UPDATE child_profiles SET theme_band = 'KINDER' WHERE id = 'n1'").run();
  await registrarAvanceDeHoy(env, { id: "n1", esAdulto: false }, { habilidad: "K03", ahora: AHORA });
  igual(filasMision(raw).length, 0, "sin filas");
  igual(ns.objetos.size, 0, "y el objeto del niño ni siquiera se abrió");
});

await caso("el adulto aprendiz (SERIO) escribe con user_id, la otra columna del dueño (D-034)", async () => {
  const { raw, env } = entornoCompleto();
  await registrarAvanceDeHoy(env, { id: "u1", esAdulto: true }, { habilidad: "K03", ahora: AHORA });
  const filas = filasMision(raw);
  if (filas.length < 1) throw new Error("no se escribió ninguna fila");
  for (const f of filas) {
    igual(f.user_id, "u1", `la fila de ${f.mission_type} es del adulto`);
    igual(f.child_profile_id, null, "child_profile_id en NULL");
  }
});

await caso("un día nuevo escribe filas NUEVAS en el rollup y no toca las de ayer", async () => {
  const { raw, env } = entornoCompleto();
  const quien = { id: "n1", esAdulto: false };
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA });
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA + 86_400_000 });
  const ayer = filasMision(raw, DIA);
  igual(ayer.length, 1, "la fila de ayer sigue");
  igual(ayer[0].progress, 1, "y no la tocó el avance de hoy");
  if (filasMision(raw, DIA_SIGUIENTE).length < 1) throw new Error("el día nuevo no escribió su fila");
});

await caso("la pantalla lee el rollup: leerMisionesDeHoy refleja lo que el objeto avanzó", async () => {
  const { env } = entornoCompleto();
  const quien = { id: "n1", esAdulto: false };
  await registrarAvanceDeHoy(env, quien, { habilidad: "K03", ahora: AHORA });
  const datos = await leerMisionesDeHoy(env, quien, "PRIMARIA", AHORA + 5000);
  if (!datos) throw new Error("leerMisionesDeHoy devolvió null con base sana");
  const volumen = datos.entradas.find((e) => e.mision.tipo === "volumen");
  igual(volumen?.estado.progress, 1, "el menú ve el progreso que escribió el rollup");
  igual(datos.entradas.length, seleccionDe("n1", DIA).length, "y el menú completo del día");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
