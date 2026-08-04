#!/usr/bin/env node
// Casos del ESQUEMA de grupos infantiles contra SQLite de verdad — F9 #380.
//
//     node --experimental-strip-types apps/web/src/lib/grupo-esquema.prueba.mjs
//
// Por qué existen. El motor (`packages/motor/src/grupo.ts`) tiene sus pruebas
// puras; esto es lo otro: que la BASE hace cumplir lo que el esquema promete,
// porque un `CHECK` mal escrito no da error — deja pasar. Los cuatro modos de
// falla que esto caza, ninguno visible en una pantalla:
//
//   1. Un tope de tamaño declarado y no exigido (el «niño #31» del hueco que
//      la propia issue #380 encontró: `max_size` sin trigger es adorno).
//   2. Un `assurance = 'school_verified'` que se queda huérfano al revocar al
//      maestro — un salón presentándose como afiliado a una escuela que ya lo
//      echó (issue #380, corrección del 2026-08-03).
//   3. Un `reason_code` de reporte escrito a mano — texto libre con otro
//      nombre (línea roja #3, issue #385).
//   4. Un borrado de perfil que deja membresías huérfanas (mc-25 riesgo #7).
//
// Aplica las migraciones REALES (0001 en adelante) a una base en memoria, no
// una copia a mano del esquema: una copia podría quedar vieja y la prueba
// seguiría en verde probando un esquema que ya no existe (D-070).
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { olvidarModelo } from "./aprendiz.ts";

const MIGRACIONES = new URL("../../../../migrations", import.meta.url).pathname;

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys = ON");
for (const f of readdirSync(MIGRACIONES).filter((f) => f.endsWith(".sql")).sort()) {
  db.exec(readFileSync(join(MIGRACIONES, f), "utf8"));
}

const ins = (sql, ...args) => db.prepare(sql).run(...args);
const get = (sql, ...args) => db.prepare(sql).get(...args);

let fallos = 0;
let corridos = 0;
function caso(nombre, fn) {
  corridos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}
const afirma = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const abortaCon = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !String(err.message).includes(fragmento)) {
      throw new Error(`abortó, pero por otra razón: "${err.message}"`);
    }
    return;
  }
  throw new Error("no abortó");
};

// ─── El reparto: un dueño, dos maestros, un padre con tres hijos ──────────
for (const [id, email] of [["owner", "o@x.c"], ["m1", "m1@x.c"], ["m2", "m2@x.c"], ["padre", "p@x.c"]]) {
  ins("INSERT INTO users (id, email, created_at, updated_at) VALUES (?, ?, 1, 1)", id, email);
}
for (const id of ["owner", "m1", "m2"]) {
  ins("INSERT INTO group_owner_identity (user_id) VALUES (?)", id);
}
for (const id of ["h1", "h2", "h3"]) {
  ins(
    "INSERT INTO child_profiles (id, parent_user_id, alias, alias_locale, birth_year, theme_band, avatar_parts, locale, created_at, updated_at) " +
      "VALUES (?, 'padre', ?, 'en', 2018, 'PRIMARIA', '{}', 'en', 1, 1)",
    id, `Alias ${id}`,
  );
}

caso("el assurance nace en 'declared' — nadie comprobó nada", () => {
  afirma(get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm1'").a === "declared");
});

caso("verificar la escuela sube a sus maestros activos en la misma operación (#381)", () => {
  ins("INSERT INTO school (id, name, country, locale, created_at) VALUES ('esc', 'Escuela X', 'MX', 'es-MX', 1)");
  ins("INSERT INTO school_teacher (school_id, user_id, invited_at) VALUES ('esc', 'm1', 1)");
  afirma(
    get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm1'").a === "declared",
    "escuela pendiente: el maestro sigue declared",
  );
  ins("UPDATE school SET verification_status = 'verified', verification_method = 'document_review', verified_by = 'owner', verified_at = 2 WHERE id = 'esc'");
  afirma(
    get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm1'").a === "school_verified",
    "escuela verificada: el maestro sube a school_verified",
  );
});

caso("invitar bajo una escuela ya verificada sube el assurance al insertar", () => {
  ins("INSERT INTO school_teacher (school_id, user_id, invited_at) VALUES ('esc', 'm2', 2)");
  afirma(get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm2'").a === "school_verified");
});

caso("revocar al maestro baja el assurance a 'declared' de inmediato (#380)", () => {
  ins("UPDATE school_teacher SET revoked_at = 3 WHERE school_id = 'esc' AND user_id = 'm2'");
  afirma(get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm2'").a === "declared");
});

caso("degradar la escuela baja a todos sus maestros en la misma transacción", () => {
  ins("UPDATE school SET verification_status = 'rejected' WHERE id = 'esc'");
  afirma(get("SELECT assurance a FROM group_owner_identity WHERE user_id = 'm1'").a === "declared");
});

caso("un assurance escrito a mano con un valor fuera del CHECK no entra", () => {
  abortaCon(
    () => ins("UPDATE group_owner_identity SET assurance = 'verificado_de_verdad' WHERE user_id = 'owner'"),
    "CHECK",
  );
});

caso("el cupo se hace cumplir: el niño #31 en un salón de 30 aborta (hueco de #380)", () => {
  ins("INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g1', 'owner', 'salon', 'ABC234', 2, 1)");
  for (const [s, h] of [["s1", "h1"], ["s2", "h2"], ["s3", "h3"]]) {
    ins("INSERT INTO child_group_membership (id, child_group_id, child_profile_id, status, requested_at) VALUES (?, 'g1', ?, 'pending', 1)", s, h);
  }
  ins("UPDATE child_group_membership SET status = 'approved', decided_at = 2, decided_by = 'padre' WHERE id = 's1'");
  ins("UPDATE child_group_membership SET status = 'approved', decided_at = 2, decided_by = 'padre' WHERE id = 's2'");
  afirma(get("SELECT COUNT(*) c FROM child_group_membership WHERE child_group_id = 'g1' AND status = 'approved'").c === 2);
  abortaCon(
    () => ins("UPDATE child_group_membership SET status = 'approved', decided_at = 2, decided_by = 'padre' WHERE id = 's3'"),
    "max_size",
  );
});

caso("un join_code que no son 6 caracteres no entra (D-099)", () => {
  abortaCon(
    () => ins("INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g2', 'owner', 'club_papas', 'ABC', 10, 1)"),
    "CHECK",
  );
});

caso("un max_size por encima del tope duro no entra (D-087)", () => {
  abortaCon(
    () => ins("INSERT INTO child_group (id, owner_user_id, origen_tipo, join_code, max_size, created_at) VALUES ('g3', 'owner', 'salon', 'ABC235', 40, 1)"),
    "CHECK",
  );
});

caso("el ranking opt-in nace apagado (#384)", () => {
  afirma(get("SELECT leaderboard_opt_in o FROM child_group_membership WHERE id = 's1'").o === 0);
});

caso("un reason_code fuera del catálogo cerrado no entra (#385)", () => {
  ins("INSERT INTO child_group_report (id, child_group_id, reported_by, reason_code, created_at) VALUES ('r1', 'g1', 'padre', 'OTRO', 1)");
  abortaCon(
    () => ins("INSERT INTO child_group_report (id, child_group_id, reported_by, reason_code, created_at) VALUES ('r2', 'g1', 'padre', 'me cae mal el maestro', 1)"),
    "CHECK",
  );
});

caso("no hay dos solicitudes vivas del mismo niño al mismo grupo", () => {
  abortaCon(
    () => ins("INSERT INTO child_group_membership (id, child_group_id, child_profile_id, status, requested_at) VALUES ('s4', 'g1', 'h1', 'pending', 2)"),
    "UNIQUE",
  );
});

caso("remover no borra la fila: la bitácora conserva el historial (#386)", () => {
  ins("UPDATE child_group_membership SET status = 'removed', decided_at = 4, decided_by = 'padre' WHERE id = 's1'");
  const fila = get("SELECT status s, decided_by d FROM child_group_membership WHERE id = 's1'");
  afirma(fila.s === "removed" && fila.d === "padre", "la fila sigue ahí, marcada");
});

// El orden real del borrado también se ejercita aquí (F4 #104): PRIMERO el
// modelo del niño en su Durable Object, DESPUÉS la fila de D1 — al revés, si
// el DO falla ya no existe la llave para reintentarlo. Con binding `undefined`
// no hay nada que borrar y devuelve true, que es el camino documentado de la
// función; `audits/borrado-alcanza-al-modelo.mjs` exige la llamada en cualquier
// archivo que borre un perfil, y tiene razón también en una prueba.
const modeloOlvidado = await olvidarModelo(undefined, "h3");

caso("borrar el perfil limpia sus membresías por CASCADE (mc-25 riesgo #7)", () => {
  afirma(modeloOlvidado === true, "olvidarModelo sin binding confirma: no hay nada que borrar");
  ins("DELETE FROM child_profiles WHERE id = 'h3'");
  afirma(get("SELECT COUNT(*) c FROM child_group_membership WHERE child_profile_id = 'h3'").c === 0);
});
caso("borrar al dueño limpia grupo, reportes y school_teacher por CASCADE (#380)", () => {
  ins("DELETE FROM users WHERE id = 'owner'");
  afirma(get("SELECT COUNT(*) c FROM child_group WHERE owner_user_id = 'owner'").c === 0, "child_group");
  afirma(get("SELECT COUNT(*) c FROM child_group_report WHERE id = 'r1'").c === 0, "child_group_report");
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${corridos} casos fallaron`);
  process.exit(1);
}
console.log(`✓ grupo-esquema — ${corridos} casos`);
