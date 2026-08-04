#!/usr/bin/env node
// Casos del roster de solo lectura del dueño de un grupo — F7 #208.
//
//     node --experimental-strip-types apps/web/src/lib/grupo-roster.prueba.mjs
//
// Por qué existen. Lo que el dueño de un salón o de un club de papás sabe de
// cada niño es la superficie de mayor exposición del producto (mc-46 §6: un
// adulto sin verificar mirando datos de menores), y ninguna de las cuatro
// formas de pasarse da un error visible:
//
//   1. Una columna de más en el SELECT — `max_streak`, un escudo, una pausa—
//      que viaja en silencio porque «ya estaba en la fila» (#208: de
//      `child_streak` sale EXACTAMENTE `current_streak`).
//   2. Un niño removido que SIGUE exponiendo su racha porque el filtro de
//      `status` se olvidó — la revocación que no corta es la revocación que
//      no existe (el patrón de `household_devices.revoked_at`).
//   3. Un ORDER BY por racha — D-025: la racha no ordena ningún tablero, y
//      esta vía es informativa.
//   4. Un adulto leyendo el roster de un grupo AJENO — `null` tiene que
//      cubrir «no existe» y «no es tuyo» sin distinguirlos.
//
// Aplica las migraciones REALES a una base en memoria (como
// `grupo-esquema.prueba.mjs`), no una copia a mano del esquema: una copia
// podría quedar vieja y la prueba seguiría en verde sobre un esquema que ya
// no existe (D-070).
//
// ─── La segunda fuente, escrita a mano (D-070) ──────────────────────────────
//
// La lista cerrada de lo que una fila del roster puede llevar —alias, puntos,
// current_streak— está reescrita A MANO aquí abajo desde #208 y D-044, NO
// derivada del tipo `FilaDeRoster` del módulo: si la prueba leyera las llaves
// del módulo para decidir qué esperar, aprobaría su propia violación — un
// auditor que juzga con la misma lista que el código usa para decidir no
// puede fallar nunca.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { grupoDelDuenio, rosterDelGrupo } from "./grupo-roster.ts";
import { olvidarModelo } from "./aprendiz.ts";

const MIGRACIONES = new URL("../../../../migrations", import.meta.url).pathname;

// #208 y D-044, renglón por renglón, a mano. NO derivados del módulo.
const LLAVES_CERRADAS = ["alias", "current_streak", "puntos"]; // ordenadas

/** El adaptador D1 mínimo sobre node:sqlite (el mismo patrón que padre-limite). */
function adaptar(raw) {
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) {
          args = a;
          return bound;
        },
        async all() {
          return { results: raw.prepare(sql).all(...args) };
        },
        async first() {
          return raw.prepare(sql).get(...args) ?? null;
        },
        async run() {
          return raw.prepare(sql).run(...args);
        },
      };
      return bound;
    },
    async batch(sentencias) {
      for (const s of sentencias) await s.run();
    },
  };
}

function baseSembrada() {
  const raw = new DatabaseSync(":memory:");
  raw.exec("PRAGMA foreign_keys = ON");
  for (const f of readdirSync(MIGRACIONES).filter((f) => f.endsWith(".sql")).sort()) {
    raw.exec(readFileSync(join(MIGRACIONES, f), "utf8"));
  }
  return { raw, db: adaptar(raw) };
}

const ins = (raw, sql, ...args) => raw.prepare(sql).run(...args);

function sembrarReparto(raw) {
  for (const [id, email] of [["owner", "o@x.c"], ["otro", "x@x.c"], ["padre", "p@x.c"]]) {
    ins(raw, "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, 1, 1)", id, email);
  }
  ins(raw, "INSERT INTO group_owner_identity (user_id) VALUES ('owner')");
  ins(raw, "INSERT INTO group_owner_identity (user_id) VALUES ('otro')");

  // Los alias están elegidos para que el orden alfabético NO coincida con el
  // orden por racha NI con el orden por puntos: si la consulta ordenara por
  // cualquiera de los dos, «Alamo» no saldría primero — D-025 a mano.
  //
  //   h1 «Alamo»  — racha  5, puntos 100, aprobado CON opt-in
  //   h2 «Zafiro» — racha 12, puntos 900, aprobado SIN opt-in (D-027: el
  //                 dueño lo ve igual; el opt-in gobierna el RANKING, no el
  //                 roster)
  //   h3 «Pendiente» — solicitud pendiente: no expone nada todavía
  //   h5 «Rechazado» — rechazado: no expone nada
  const hijos = [
    ["h1", "Alamo", 5, 100],
    ["h2", "Zafiro", 12, 900],
    ["h3", "Pendiente", 3, 50],
    ["h5", "Rechazado", 8, 70],
  ];
  for (const [id, alias, racha, puntos] of hijos) {
    ins(
      raw,
      "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at) " +
        "VALUES (?, 'padre', ?, 'en', 2018, 'PRIMARIA', '{}', 'en', 1, 1)",
      id,
      alias,
    );
    ins(
      raw,
      "INSERT INTO child_streak (id, child_profile_id, current_streak, max_streak, shields_available, shields_earned_total, pause_until_local_date, pause_uses_this_year, pause_year, updated_at) " +
        "VALUES (?, ?, ?, ?, 2, 4, '2026-08-20', 1, 2026, 1)",
      `st_${id}`,
      id,
      racha,
      racha + 4,
    );
    ins(
      raw,
      "INSERT INTO score_totals (child_profile_id, period, theme_band, total_score, updated_at) VALUES (?, 'all_time', 'PRIMARIA', ?, 1)",
      id,
      puntos,
    );
  }

  ins(
    raw,
    "INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g1', 'owner', 'salon', 'ABC234', 30, 1)",
  );
  ins(
    raw,
    "INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g2', 'owner', 'club_papas', 'ABC235', 12, 1)",
  );
  ins(
    raw,
    "INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g3', 'otro', 'salon', 'ABC236', 30, 1)",
  );

  const membresias = [
    ["m1", "g1", "h1", "approved", 1],
    ["m2", "g1", "h2", "approved", 0],
    ["m3", "g1", "h3", "pending", 0],
    ["m5", "g1", "h5", "rejected", 0],
  ];
  for (const [id, grupo, hijo, status, optIn] of membresias) {
    ins(
      raw,
      "INSERT INTO child_group_membership (id, child_group_id, child_profile_id, status, requested_at, decided_at, decided_by, leaderboard_opt_in) " +
        "VALUES (?, ?, ?, ?, 1, 2, 'padre', ?)",
      id,
      grupo,
      hijo,
      status,
      optIn,
    );
  }
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
const afirma = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

console.log("\ngrupo-roster — la racha de solo lectura para salones y clubs (F7 #208)\n");

// ─── La lista cerrada: alias, puntos y current_streak. Nada más ─────────────

await caso("cada fila lleva EXACTAMENTE alias, puntos y current_streak (lista a mano, D-070)", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const filas = await rosterDelGrupo(db, "owner", "g1");
  afirma(filas.length > 0, "el roster no puede estar vacío en este caso");
  for (const f of filas) {
    const llaves = Object.keys(f).sort();
    igual(JSON.stringify(llaves), JSON.stringify(LLAVES_CERRADAS), `llaves de la fila de ${f.alias}`);
  }
});

await caso("max_streak, escudos y pausas NO viajan — aunque la base los tiene sembrados", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const filas = await rosterDelGrupo(db, "owner", "g1");
  const json = JSON.stringify(filas);
  // Los valores sembrados son reconocibles a propósito: max = racha+4,
  // escudos 2/4, pausa '2026-08-20'. Si alguno aparece en la respuesta, la
  // columna viajó.
  for (const prohibido of ["max_streak", "shields", "pause", "2026-08-20"]) {
    afirma(!json.includes(prohibido), `la respuesta contiene «${prohibido}» — una columna de presencia del niño viajó al grupo`);
  }
});

await caso("los valores son los de SU fila: alias, puntos del periodo global y la racha en curso", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const filas = await rosterDelGrupo(db, "owner", "g1");
  igual(filas.length, 2, "dos aprobados, ni pendientes ni rechazados");
  const alamo = filas.find((f) => f.alias === "Alamo");
  const zafiro = filas.find((f) => f.alias === "Zafiro");
  igual(alamo.puntos, 100, "puntos de Alamo");
  igual(alamo.current_streak, 5, "racha de Alamo — la EN CURSO, no la mejor (9)");
  igual(zafiro.puntos, 900, "puntos de Zafiro");
  igual(zafiro.current_streak, 12, "racha de Zafiro");
});

await caso("el orden es por alias — NUNCA por racha ni por puntos (D-025)", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const filas = await rosterDelGrupo(db, "owner", "g1");
  // «Alamo» (racha 5, puntos 100) va antes que «Zafiro» (racha 12, puntos
  // 900). Si la consulta ordenara por racha o por puntos, Zafiro saldría
  // primero — la siembra está hecha para que los tres criterios difieran.
  igual(filas[0].alias, "Alamo", "primera fila");
  igual(filas[1].alias, "Zafiro", "segunda fila");
});

await caso("el miembro aprobado SIN opt-in de ranking SÍ está en el roster del dueño (D-027)", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const filas = await rosterDelGrupo(db, "owner", "g1");
  // Zafiro tiene leaderboard_opt_in = 0: no aparece en ninguna vista ordenada
  // por posición, pero el roster del dueño —alias, racha y puntos— sí lo ve.
  afirma(filas.some((f) => f.alias === "Zafiro"), "el sin opt-in desapareció del roster");
});

// ─── La revocación corta de inmediato (el caso explícito de #208) ───────────

await caso("remover la membresía deja de exponer la racha al grupo EN LA PRIMERA lectura posterior", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  // Zafiro pasa de aprobado a removido — la fila NO se borra (bitácora 0017).
  igual((await rosterDelGrupo(db, "owner", "g1")).length, 2, "antes de remover");
  ins(
    raw,
    "UPDATE child_group_membership SET status = 'removed', decided_at = 5, decided_by = 'padre' WHERE id = 'm2'",
  );
  const filas = await rosterDelGrupo(db, "owner", "g1");
  igual(filas.length, 1, "después de remover");
  afirma(!filas.some((f) => f.alias === "Zafiro"), "el removido sigue exponiendo su racha");
  // Y la bitácora conserva la fila: el corte es de VISIBILIDAD, no de historial.
  igual(
    raw.prepare("SELECT status s FROM child_group_membership WHERE id = 'm2'").get().s,
    "removed",
    "la fila sigue ahí, marcada",
  );
});

// ─── La autorización: null sin distinguir «no existe» de «no es tuyo» ───────

await caso("otro adulto NO lee el roster: null, y sin oráculo de cuáles grupos existen", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  igual(await rosterDelGrupo(db, "otro", "g1"), null, "el grupo es de owner");
  igual(await rosterDelGrupo(db, "owner", "g-inexistente"), null, "el grupo no existe");
  igual(await grupoDelDuenio(db, "otro", "g1"), null, "mismo null para los dos mundos");
});

await caso("el dueño de g3 no ve a los hijos de g1 aunque sean los mismos perfiles", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  // g3 es de «otro» y no tiene miembros: su roster es una lista VACÍA (es
  // suyo y no tiene a nadie), no null — null es solo para «no es tuyo».
  const filas = await rosterDelGrupo(db, "otro", "g3");
  igual(Array.isArray(filas), true, "lista, no null");
  igual(filas.length, 0, "vacía");
});

// ─── El club de papás es la misma superficie (origen_tipo no relaja nada) ───

await caso("el club de papás expone la MISMA lista cerrada — ni una columna más por ser club", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  ins(
    raw,
    "INSERT INTO child_group_membership (id, child_group_id, child_profile_id, status, requested_at, decided_at, decided_by) " +
      "VALUES ('m9', 'g2', 'h5', 'approved', 1, 2, 'padre')",
  );
  const filas = await rosterDelGrupo(db, "owner", "g2");
  igual(filas.length, 1, "un miembro aprobado en el club");
  igual(filas[0].alias, "Rechazado", "su alias — en g1 fue rechazado, en g2 aprobó su padre");
  igual(filas[0].current_streak, 8, "su racha en curso");
  const llaves = Object.keys(filas[0]).sort();
  igual(JSON.stringify(llaves), JSON.stringify(LLAVES_CERRADAS), "la lista cerrada también en el club");
});

await caso("grupoDelDuenio devuelve el origen — para que la pantalla sepa qué está mostrando", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  const salon = await grupoDelDuenio(db, "owner", "g1");
  const club = await grupoDelDuenio(db, "owner", "g2");
  igual(salon.origen_tipo, "salon", "origen del salón");
  igual(club.origen_tipo, "club_papas", "origen del club");
});

// ─── Los bordes: sin fila de racha y perfil borrado ──────────────────────────

await caso("aprobado sin fila en child_streak: racha 0, no NULL ni fila perdida", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  ins(
    raw,
    "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at) " +
      "VALUES ('h6', 'padre', 'Nuevo', 'en', 2018, 'PRIMARIA', '{}', 'en', 1, 1)",
  );
  ins(
    raw,
    "INSERT INTO child_group_membership (id, child_group_id, child_profile_id, status, requested_at, decided_at, decided_by) " +
      "VALUES ('m6', 'g1', 'h6', 'approved', 1, 2, 'padre')",
  );
  const filas = await rosterDelGrupo(db, "owner", "g1");
  const nuevo = filas.find((f) => f.alias === "Nuevo");
  afirma(nuevo !== undefined, "el aprobado sin racha todavía tiene que salir");
  igual(nuevo.current_streak, 0, "todavía no tiene racha — es 0, no NULL");
  igual(nuevo.puntos, 0, "tampoco ha sumado — es 0, no NULL");
});

await caso("un perfil con deleted_at desaparece del roster (mc-25: el borrado alcanza)", async () => {
  const { raw, db } = baseSembrada();
  sembrarReparto(raw);
  // El orden real del borrado (F4 #104): PRIMERO el modelo del niño en su
  // Durable Object, DESPUÉS la marca en D1 — `borrado-alcanza-al-modelo.mjs`
  // exige la llamada en cualquier archivo que escriba `deleted_at`, y tiene
  // razón también en una prueba. Con binding `undefined` no hay nada que
  // borrar y devuelve true, el camino documentado de la función.
  const modeloOlvidado = await olvidarModelo(undefined, "h1");
  afirma(modeloOlvidado === true, "olvidarModelo sin binding confirma: no hay nada que borrar");
  ins(raw, "UPDATE child_profiles SET deleted_at = 9 WHERE id = 'h1'");
  const filas = await rosterDelGrupo(db, "owner", "g1");
  afirma(!filas.some((f) => f.alias === "Alamo"), "el perfil borrado sigue en el roster");
});

if (fallos > 0) {
  console.error(`\n✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`\n✓ ${corridos} casos`);
