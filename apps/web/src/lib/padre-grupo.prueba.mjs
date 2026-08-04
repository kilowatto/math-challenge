#!/usr/bin/env node
// Casos del flujo de grupos: identidad del dueño, creación con topes, escuela
// con sus dos caminos, y la decisión del padre — F9 · #381, #382, #383.
//
//     node --experimental-strip-types apps/web/src/lib/padre-grupo.prueba.mjs
//
// Por qué existen. Esta superficie es donde un adulto sin verificar queda a
// cargo de datos de menores ajenos, y ninguna de sus formas de romperse da un
// error visible:
//
//   1. Una aprobación sin las tres condiciones (membresía pedida, niño de la
//      cuenta, firma de quién decidió) — un niño dentro de un grupo que su
//      padre nunca vio (D-011).
//   2. Un salón afiliado creado contra una escuela no verificada, o por un
//      maestro ya revocado — la insignia mintiendo (D-086).
//   3. Un `assurance = 'school_verified'` escrito a mano por la ruta en vez de
//      por los triggers de la 0017 — la regla de UN solo escritor.
//   4. Los topes declarados y no exigidos (el «niño #31» de la issue #380).
//   5. La vista ordenada incluyendo a un niño cuyo padre no activó el ranking
//      (D-087).
//
// Aplica las migraciones REALES a una base en memoria (como
// `grupo-roster.prueba.mjs`), no una copia a mano del esquema: una copia
// podría quedar vieja y la prueba seguiría en verde sobre un esquema que ya
// no existe (D-070). Los triggers de la 0017 (cupo, assurance) se ejercitan
// DE VERDAD — son la mitad del contrato.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { declararIdentidad, identidadDe, crearGrupo, resetearCodigo, cambiarCodigoActivo } from "./grupo-duenio.ts";
import { grupoPorCodigo, tarjetaParaPadre, hijosParaUnir, decidirEntrada } from "./padre-grupo.ts";
import { registrarEscuela } from "./grupo-escuela.ts";
import { tablaOrdenadaDelGrupo, posicionComoTexto } from "./grupo-tabla.ts";
import { assertCanOwnChildGroup, insigniaPara } from "./owner-proof.ts";
import { ALFABETO_CODIGO } from "../../../../packages/motor/src/grupo.ts";

const MIGRACIONES = new URL("../../../../migrations", import.meta.url).pathname;

/** El adaptador D1 mínimo sobre node:sqlite, con la forma de D1 (`meta.changes`). */
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
          const info = raw.prepare(sql).run(...args);
          return { success: true, meta: { changes: info.changes } };
        },
      };
      return bound;
    },
    async batch(sentencias) {
      const resultados = [];
      for (const s of sentencias) resultados.push(await s.run());
      return resultados;
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
const DIA = 86400;
const T0 = 1_800_000_000;

/** Tres adultos: el dueño del grupo, el padre de los niños, y un tercero. */
function sembrarGente(raw) {
  for (const [id, email] of [
    ["owner", "owner@x.c"],
    ["padre", "padre@x.c"],
    ["otro", "otro@x.c"],
    ["mae", "profe@escuela.edu.mx"],
  ]) {
    ins(raw, "INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, 1, 1)", id, email);
  }
  ins(raw, "INSERT INTO group_owner_identity (user_id) VALUES ('owner')");
  ins(raw, "INSERT INTO group_owner_identity (user_id) VALUES ('mae')");
}

/** Un niño de PRIMARIA de la cuenta dada, con puntos y racha sembrados. */
function sembrarHijo(raw, id, padre, alias, puntos = 0, racha = 0, banda = "PRIMARIA") {
  ins(
    raw,
    "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at) " +
      "VALUES (?, ?, ?, 'en', 2016, ?, '{}', 'en', 1, 1)",
    id,
    padre,
    alias,
    banda,
  );
  ins(
    raw,
    "INSERT INTO score_totals (child_profile_id, period, theme_band, total_score, updated_at) VALUES (?, 'all_time', ?, ?, 1)",
    id,
    banda,
    puntos,
  );
  ins(
    raw,
    "INSERT INTO child_streak (id, child_profile_id, current_streak, max_streak, updated_at) VALUES (?, ?, ?, ?, 1)",
    `st_${id}`,
    id,
    racha,
    racha,
  );
}

/** `azar` fijo: el código sale determinista (`222222` con 0). */
const azarCero = () => 0;

/** `azar` creciente: códigos distintos en cada llamada (para crear varios). */
const azarSerie = () => {
  let n = 0;
  return () => {
    n = (n + 1) % 1000;
    return n / 1000 + (n % 7) * 0.0001;
  };
};

/** La identidad declarada y el proof del dueño, por el camino real. */
async function proofDe(db, userId) {
  const fila = await identidadDe(db, userId);
  const proof = assertCanOwnChildGroup(fila);
  if (!proof) throw new Error(`sin proof para ${userId}`);
  return proof;
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

console.log("\npadre-grupo — la superficie de grupos contra las migraciones REALES (F9 · #381-#383)\n");

// ─── La identidad declarada y el gate ────────────────────────────────────────

await caso("declararIdentidad escribe 'declared' y assertCanOwnChildGroup fabrica el proof", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  await declararIdentidad(db, "padre", "papá de dos, club de la colonia");
  const fila = await identidadDe(db, "padre");
  igual(fila?.assurance, "declared", "assurance al declarar");
  igual(fila?.declared_context, "papá de dos, club de la colonia", "contexto");
  const proof = assertCanOwnChildGroup(fila);
  afirma(proof !== null, "el proof no se fabricó con la fila declarada");
  igual(insigniaPara(proof), "sin_verificar", "la insignia de declared");
});

await caso("sin fila de identidad no hay proof — el gate no se salta", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const fila = await identidadDe(db, "padre");
  igual(fila, null, "sin fila");
  igual(assertCanOwnChildGroup(null), null, "el gate rechaza sin fila");
});

// ─── Crear grupo: topes y código ─────────────────────────────────────────────

await caso("crearGrupo crea el salón con código válido del alfabeto sin ambiguos", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const proof = await proofDe(db, "owner");
  const r = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);
  afirma(r.ok, `la creación falló: ${r.motivo}`);
  igual(r.codigo, ALFABETO_CODIGO[0].repeat(6), "el código determinista");
  const fila = raw.prepare("SELECT origen_tipo, school_id, max_size FROM child_group WHERE id = ?").get(r.id);
  igual(fila.origen_tipo, "salon", "origen");
  igual(fila.school_id, null, "sin escuela");
});

await caso("un club de papás con el tope del salón se rechaza, no se recorta", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const proof = await proofDe(db, "owner");
  const r = await crearGrupo(db, proof, { origen: "club_papas", maxSize: 35, schoolId: null, ahora: T0 }, azarCero);
  igual(r.ok, false, "un club de 35 no puede crearse");
  igual(r.motivo, "tamano_invalido", "motivo");
});

await caso("el tope de uno por día y el de cinco por cuenta se exigen, no se declaran", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const proof = await proofDe(db, "owner");
  const azar = azarSerie();
  const primero = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azar);
  afirma(primero.ok, "el primero del día falló");
  const mismoDia = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 + 60 }, azar);
  igual(mismoDia.motivo, "uno_por_dia", "el segundo del mismo día");
  // La ventana es rodante de 24 h (`created_at >= ahora - 86400`): el grupo
  // anterior se creó dentro de la ventana si `ahora` es exactamente +1 día.
  for (let d = 1; d <= 4; d++) {
    const r = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 + d * DIA + d }, azar);
    afirma(r.ok, `el grupo ${d + 1} de la cuenta falló: ${r.motivo}`);
  }
  const sexto = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 + 5 * DIA + 5 }, azar);
  igual(sexto.motivo, "tope_grupos", "el sexto grupo de la cuenta");
});

// ─── El salón afiliado: solo con escuela verificada y maestro activo ─────────

await caso("afiliado: escuela pendiente → no; verificada + maestro → sí; revocado → no, de inmediato", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  ins(raw, "INSERT INTO school (id, name, country, locale, created_at) VALUES ('s1', 'Escuela Benito Juárez', 'MX', 'es-MX', 1)");
  ins(raw, "INSERT INTO school_teacher (school_id, user_id, invited_at) VALUES ('s1', 'owner', 1)");
  const proof = await proofDe(db, "owner");

  const pendiente = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: "s1", ahora: T0 }, azarCero);
  igual(pendiente.motivo, "escuela_no_verificada", "escuela pendiente");

  // El camino del runbook: verificar la escuela es un UPDATE — el trigger
  // `trg_school_verificada` eleva el assurance del maestro EN LA MISMA
  // transacción (corrección de D-086).
  raw.prepare("UPDATE school SET verification_status = 'verified', verified_at = 2 WHERE id = 's1'").run();
  igual(
    raw.prepare("SELECT assurance FROM group_owner_identity WHERE user_id = 'owner'").get().assurance,
    "school_verified",
    "el trigger escribió el assurance al verificar",
  );

  const afiliado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: "s1", ahora: T0 + DIA }, azarCero);
  afirma(afiliado.ok, `con escuela verificada falló: ${afiliado.motivo}`);
  igual(
    raw.prepare("SELECT school_id FROM child_group WHERE id = ?").get(afiliado.id).school_id,
    "s1",
    "el salón quedó afiliado",
  );

  // Revocar al maestro corta la capacidad de crear salones afiliados EN EL
  // ACTO (issue #381) — y el trigger baja su assurance en la misma sentencia.
  raw.prepare("UPDATE school_teacher SET revoked_at = 3 WHERE school_id = 's1' AND user_id = 'owner'").run();
  igual(
    raw.prepare("SELECT assurance FROM group_owner_identity WHERE user_id = 'owner'").get().assurance,
    "declared",
    "el trigger bajó el assurance al revocar",
  );
  const revocado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: "s1", ahora: T0 + 2 * DIA + 2 }, azarCero);
  igual(revocado.motivo, "escuela_no_verificada", "maestro revocado");
});

// ─── La escuela: atajo de dominio y revisión humana ──────────────────────────

await caso("atajo de dominio: escuela verificada y maestro de alta, con el assurance VÍA TRIGGER", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const kv = { get: async (k) => (k === "f9_dominios_escuela" ? JSON.stringify(["escuela.edu.mx"]) : null) };
  const r = await registrarEscuela(db, undefined, kv, {
    userId: "mae",
    email: "profe@escuela.edu.mx",
    nombre: "Escuela Modelo",
    pais: "MX",
    locale: "es-MX",
    documento: null,
    ahora: T0,
  });
  igual(r.ok && r.via, "dominio", "el camino fue el atajo");
  const escuela = raw.prepare("SELECT verification_status, verification_method, verified_by FROM school WHERE name = 'Escuela Modelo'").get();
  igual(escuela.verification_status, "verified", "estado");
  igual(escuela.verification_method, "domain_shortcut", "método");
  igual(escuela.verified_by, "auto", "revisor del atajo");
  igual(
    raw.prepare("SELECT assurance FROM group_owner_identity WHERE user_id = 'mae'").get().assurance,
    "school_verified",
    "el trigger trg_school_teacher_alta escribió el assurance — la ruta no lo tocó",
  );
});

await caso("revisión humana: documento a R2, escuela pendiente, assurance intacto", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  let capturado = null;
  const r2 = { put: async (key, stream, opts) => { capturado = { key, opts }; } };
  const kv = { get: async () => null };
  const doc = new File([new Uint8Array(2048)], "constancia.pdf", { type: "application/pdf" });
  const r = await registrarEscuela(db, r2, kv, {
    userId: "mae",
    email: "profe@escuela.edu.mx",
    nombre: "Escuela Revisada",
    pais: "MX",
    locale: "es-MX",
    documento: doc,
    ahora: T0,
  });
  igual(r.ok && r.via, "documento", "el camino fue la revisión");
  const escuela = raw.prepare("SELECT id, verification_status FROM school WHERE name = 'Escuela Revisada'").get();
  igual(escuela.verification_status, "pending", "pendiente de revisión humana");
  igual(capturado?.key, `escuela/${escuela.id}/documento`, "la llave R2 deriva del id");
  igual(capturado?.opts?.customMetadata?.registrante, "mae", "el registrante viaja en metadatos");
  igual(
    raw.prepare("SELECT assurance FROM group_owner_identity WHERE user_id = 'mae'").get().assurance,
    "declared",
    "una escuela pendiente NO eleva a nadie",
  );
});

await caso("sin dominio reconocido el documento es obligatorio, y solo AVIF/PDF", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const kv = { get: async () => null };
  const r2 = { put: async () => {} };
  const sinDoc = await registrarEscuela(db, r2, kv, {
    userId: "mae", email: "profe@escuela.edu.mx", nombre: "Escuela X", pais: "MX", locale: "es-MX",
    documento: null, ahora: T0,
  });
  igual(sinDoc.motivo, "documento_faltante", "sin documento no hay revisión");
  const malTipo = await registrarEscuela(db, r2, kv, {
    userId: "mae", email: "profe@escuela.edu.mx", nombre: "Escuela X", pais: "MX", locale: "es-MX",
    documento: new File([new Uint8Array(8)], "notas.txt", { type: "text/plain" }), ahora: T0,
  });
  igual(malTipo.motivo, "tipo_documento", "solo AVIF/PDF");
});

// ─── El código y la tarjeta: ver no escribe nada ─────────────────────────────

await caso("el código apagado y el desconocido dan el mismo null, y ver la tarjeta no escribe", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);
  const codigo = creado.codigo;

  igual((await grupoPorCodigo(db, codigo.toLowerCase()))?.id, creado.id, "minúsculas se normalizan");
  igual(await grupoPorCodigo(db, "HOLA!!"), null, "forma inválida sin ir a la base");
  igual(await grupoPorCodigo(db, "ZZZ999"), null, "código desconocido");

  const tarjeta = await tarjetaParaPadre(db, creado.id);
  igual(tarjeta?.insignia, "sin_verificar", "insignia de la tarjeta");
  igual(
    raw.prepare("SELECT COUNT(*) AS n FROM child_group_membership").get().n,
    0,
    "ver la tarjeta no escribió ninguna fila",
  );

  const apagado = await cambiarCodigoActivo(db, "owner", creado.id, false, T0 + 1);
  afirma(apagado.ok, "no se pudo desactivar");
  igual(await grupoPorCodigo(db, codigo), null, "apagado es el mismo null que desconocido");

  const nuevo = await resetearCodigo(db, "owner", creado.id, () => 0.5);
  afirma(nuevo.ok && nuevo.codigo !== codigo, "el reset no cambió el código");
  const activado = await cambiarCodigoActivo(db, "owner", creado.id, true, T0 + 2);
  afirma(activado.ok, "no se pudo reactivar");
  igual((await grupoPorCodigo(db, nuevo.codigo))?.id, creado.id, "el código nuevo abre el grupo");
  const ajeno = await resetearCodigo(db, "otro", creado.id, () => 0.5);
  igual(ajeno.ok, false, "un ajeno no resetea");
  igual(ajeno.ok ? "" : ajeno.motivo, "grupo_desconocido", "motivo del ajeno");
});

// ─── La decisión del padre: las tres condiciones, en la base ─────────────────

await caso("aprobar firma decided_by/decided_at y el opt-in lo escribe el padre", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "padre", "Alamo", 100, 5);
  sembrarHijo(raw, "h2", "padre", "Zafiro", 900, 12);
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);

  igual((await hijosParaUnir(db, "padre", creado.id)).length, 2, "los dos hijos se ofrecen");

  const r = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "approved", optIn: true, ahora: T0 + 10,
  });
  afirma(r.ok, `la aprobación falló: ${r.motivo}`);
  const fila = raw.prepare("SELECT status, decided_by, decided_at, leaderboard_opt_in FROM child_group_membership WHERE child_profile_id = 'h1'").get();
  igual(fila.status, "approved", "estado");
  igual(fila.decided_by, "padre", "la fila firma QUIÉN decidió (la membresía ES el consentimiento)");
  afirma(fila.decided_at === T0 + 10, "decided_at es el sello del servidor");
  igual(fila.leaderboard_opt_in, 1, "el toggle del padre quedó escrito");

  const ofrecidos = (await hijosParaUnir(db, "padre", creado.id)).map((h) => h.id);
  igual(ofrecidos.length, 1, "el aprobado ya no se ofrece");
  igual(ofrecidos[0], "h2", "queda el otro");
});

await caso("nadie aprueba al hijo de otro — y el null no distingue inexistente de ajeno", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "otro", "Alamo");
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);

  const ajeno = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0,
  });
  igual(ajeno.motivo, "perfil_desconocido", "el hijo de otro");
  const inexistente = await decidirEntrada(db, {
    parentUserId: "padre", childId: "fantasma", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0,
  });
  igual(inexistente.motivo, "perfil_desconocido", "el inexistente — mismo motivo, sin oráculo");
});

await caso("pending no es una decisión (sin firma), rejected sí la es, y no hay dos solicitudes vivas", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "padre", "Alamo");
  sembrarHijo(raw, "h2", "padre", "Zafiro");
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);

  const aplazada = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "pending", optIn: false, ahora: T0,
  });
  afirma(aplazada.ok, "el pending no se escribió");
  const pendiente = raw.prepare("SELECT status, decided_by, decided_at FROM child_group_membership WHERE child_profile_id = 'h1'").get();
  igual(pendiente.status, "pending", "estado");
  igual(pendiente.decided_by, null, "un pending no firma: todavía no es una decisión");
  igual(pendiente.decided_at, null, "sin fecha de decisión");

  const duplicada = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0 + 1,
  });
  igual(duplicada.motivo, "solicitud_viva", "la segunda solicitud viva se rechaza");

  const rechazada = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h2", groupId: creado.id,
    decision: "rejected", optIn: false, ahora: T0 + 2,
  });
  afirma(rechazada.ok, "el rechazo no se escribió");
  const rechazo = raw.prepare("SELECT status, decided_by FROM child_group_membership WHERE child_profile_id = 'h2'").get();
  igual(rechazo.status, "rejected", "estado");
  igual(rechazo.decided_by, "padre", "el rechazo también es una decisión firmada");
});

await caso("el cupo lo hace cumplir el TRIGGER: el niño que pasa del max_size no entra", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "padre", "Alamo");
  sembrarHijo(raw, "h2", "padre", "Zafiro");
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 1, schoolId: null, ahora: T0 }, azarCero);

  const primero = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0,
  });
  afirma(primero.ok, "el primero no entró");
  const segundo = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h2", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0 + 1,
  });
  igual(segundo.motivo, "grupo_lleno", "el trigger de cupo abortó al segundo");
});

await caso("decidir sobre un grupo apagado es codigo_inactivo, no una entrada", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "padre", "Alamo");
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);
  await cambiarCodigoActivo(db, "owner", creado.id, false, T0 + 1);
  const r = await decidirEntrada(db, {
    parentUserId: "padre", childId: "h1", groupId: creado.id,
    decision: "approved", optIn: false, ahora: T0 + 2,
  });
  igual(r.motivo, "codigo_inactivo", "apagado entre la tarjeta y el botón");
});

// ─── La vista ordenada: solo opt-in, y la posición como texto ────────────────

await caso("la tabla ordenada excluye al niño sin opt-in aunque tenga más puntos (D-087)", async () => {
  const { raw, db } = baseSembrada();
  sembrarGente(raw);
  sembrarHijo(raw, "h1", "padre", "Alamo", 100, 5);
  sembrarHijo(raw, "h2", "padre", "Zafiro", 900, 12);
  const proof = await proofDe(db, "owner");
  const creado = await crearGrupo(db, proof, { origen: "salon", maxSize: 30, schoolId: null, ahora: T0 }, azarCero);
  await decidirEntrada(db, { parentUserId: "padre", childId: "h1", groupId: creado.id, decision: "approved", optIn: true, ahora: T0 });
  await decidirEntrada(db, { parentUserId: "padre", childId: "h2", groupId: creado.id, decision: "approved", optIn: false, ahora: T0 + 1 });

  const tabla = await tablaOrdenadaDelGrupo(db, "owner", creado.id);
  igual(tabla?.length, 1, "solo el opt-in aparece ordenado");
  igual(tabla[0].alias, "Alamo", "el de menos puntos, pero con opt-in");
  igual(tabla[0].posicion.forma, "exacta", "PRIMARIA ve número exacto");
  igual(tabla[0].posicion.rank, 1, "primero");
  afirma(!("banda" in tabla[0]), "la banda NO sale en la proyección");

  igual(await tablaOrdenadaDelGrupo(db, "otro", creado.id), null, "un ajeno no la lee");
  igual(
    posicionComoTexto(tabla[0].posicion, (n) => String(n), {}),
    "1",
    "la posición exacta como texto",
  );
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron.`);
  process.exit(1);
}
console.log(`✓ ${corridos} casos`);
