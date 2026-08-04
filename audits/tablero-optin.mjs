#!/usr/bin/env node
// Auditor determinista — el opt-in del tablero se ESCRIBE y se CUMPLE
//
// Hace cumplir: **D-040** (opt-in por hijo, la ausencia de fila es el
// apagado), **D-051** (el gobierno único del consentimiento: alta = INSERT con
// `granted_by`, baja = `revoked_at`, NUNCA DELETE), y la casilla de cierre de
// **#247**: ningún perfil de niño aparece en ninguna instantánea del tablero
// sin una fila `LEADERBOARD` vigente.
//
// ─── Qué vigila ──────────────────────────────────────────────────────────────
//
//  1. **Nadie borra.** `DELETE FROM child_consents` y `DELETE FROM
//     score_totals` no pueden aparecer en código de producto: la fila de
//     consentimiento es la prueba ante un regulador, y los puntos son del
//     niño, no del tablero. Desactivar revoca; el borrado de verdad tiene su
//     propio runbook (`borrado-cuatro-sistemas.mjs`), que no vive en `apps/`.
//  2. **El alta registra quién y qué.** Todo INSERT de `LEADERBOARD` lleva
//     `granted_by` y `consent_version` (D-051): una fila sin ellos no
//     demuestra quién consintió ni qué texto aceptó.
//  3. **La re-activación es un alta nueva.** Un `revoked_at = NULL` que no
//     reescribe `granted_by` resucita un consentimiento sin dejar escrito
//     quién lo volvió a encender.
//  4. **El cumplimiento, ejecutado** (no solo leído): la capa de datos REAL,
//     contra `node:sqlite` con una fixture escrita A MANO (D-070) — un niño
//     sin fila y otro revocado no aparecen, y un niño sin opt-in recibe su
//     total propio sin posición.
//
// LO QUE NO PUEDE COMPROBAR: que un despliegue futuro lea el tablero por otra
// ruta que no pase por `lib/tablero-datos.ts`. La defensa contra eso es la
// mitad estática de `tablero-orden-puntos.mjs` (toda consulta a
// `score_totals` cruza `child_consents`), que corre en la misma puerta.

import { DatabaseSync } from "node:sqlite";
import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

// ─── 1. Nadie borra ─────────────────────────────────────────────────────────

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!/child_consents|score_totals/.test(texto)) continue;
  comprobaciones++;
  if (/DELETE\s+FROM\s+child_consents/i.test(texto)) {
    problemas.push(
      `${archivo}: DELETE FROM child_consents. D-051: la baja es \`revoked_at\`, NUNCA un borrado — ` +
        "la fila es la prueba de que el consentimiento existió y de cuándo terminó. " +
        "El borrado de verdad sigue el runbook de `audits/borrado-cuatro-sistemas.mjs`, que no es este.",
    );
  }
  if (/DELETE\s+FROM\s+score_totals/i.test(texto)) {
    problemas.push(
      `${archivo}: DELETE FROM score_totals. #247 (casilla de cierre): desactivar el tablero revoca ` +
        "el consentimiento y NUNCA borra los puntos — son del niño, no del tablero.",
    );
  }
}

// ─── 2 y 3. El gobierno de la escritura ──────────────────────────────────────

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  // Cada sentencia que inserta el consentimiento LEADERBOARD, examinada entera.
  //
  // Acotado a `INSERT ... child_consents` desde el 2026-08-04: el patrón
  // original (`INSERT` + `LEADERBOARD` a menos de 600 caracteres, con /i)
  // también cazaba `INSERT INTO child_group_membership (... leaderboard_opt_in
  // ...)` de F9 — la membresía de un grupo, que ES su propio consentimiento
  // (D-096 del reparto del orquestador: no se duplica en `child_consents`
  // porque dos registros del mismo hecho son dos verdades, D-051). El
  // consentimiento que ESTE auditor gobierna es el del tablero global (D-040,
  // #247) y vive solo en `child_consents`: estrechar el patrón a esa tabla no
  // apaga ningún caso real — el control negativo del arnés degrada un INSERT
  // de `child_consents` y sigue atrapado.
  for (const m of texto.matchAll(/INSERT[\s\S]{0,600}?child_consents[\s\S]{0,600}?LEADERBOARD[\s\S]{0,600}?(?:;|`|"\s*\)|'\s*\))/gi)) {
    comprobaciones++;
    const sentencia = m[0];
    if (!/granted_by/.test(sentencia) || !/consent_version/.test(sentencia)) {
      problemas.push(
        `${archivo}: INSERT del consentimiento LEADERBOARD sin granted_by o consent_version. D-051: ` +
          "el alta registra QUIÉN consintió y QUÉ texto aceptó — una fila sin las dos columnas no " +
          "demuestra nada ante un regulador.",
      );
    }
  }
  // Re-activar sin registrar el alta nueva.
  if (/revoked_at\s*=\s*NULL/.test(texto) && /child_consents/.test(texto)) {
    comprobaciones++;
    for (const m of texto.matchAll(/UPDATE\s+child_consents[\s\S]{0,400}?revoked_at\s*=\s*NULL[\s\S]{0,400}?(?:;|`|"\s*\)|'\s*\))/gi)) {
      if (!/granted_by/.test(m[0])) {
        problemas.push(
          `${archivo}: limpia revoked_at sin reescribir granted_by. Una re-activación es un ALTA ` +
            "NUEVA: tiene que quedar escrito quién volvió a encender el tablero y cuándo.",
        );
      }
    }
  }
}

// ─── 4. El cumplimiento, ejecutado ───────────────────────────────────────────
//
// La fixture se escribe A MANO aquí (segunda fuente, D-070): si el esquema de
// verdad cambiara de forma incompatible, este auditor rompe — y eso es lo que
// se quiere, no un auditor que aprueba su propia violación.

const datos = await import("../apps/web/src/lib/tablero-datos.ts").catch((e) => {
  problemas.push(`no pude importar apps/web/src/lib/tablero-datos.ts: ${String(e).slice(0, 120)}`);
  return null;
});

if (datos) {
  const raw = new DatabaseSync(":memory:");
  raw.exec(`
    CREATE TABLE child_profiles (
      id TEXT PRIMARY KEY, parent_user_id TEXT NOT NULL, alias TEXT NOT NULL,
      theme_band TEXT NOT NULL, deleted_at INTEGER
    );
    CREATE TABLE score_totals (
      child_profile_id TEXT NOT NULL, period TEXT NOT NULL, theme_band TEXT NOT NULL,
      total_score INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (child_profile_id, period)
    );
    CREATE TABLE child_consents (
      child_profile_id TEXT NOT NULL, consent_code TEXT NOT NULL, granted_by TEXT NOT NULL,
      granted_at INTEGER NOT NULL, revoked_at INTEGER, consent_version TEXT,
      PRIMARY KEY (child_profile_id, consent_code)
    );
  `);
  const db = {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) { args = a; return bound; },
        async all() { return { results: raw.prepare(sql).all(...args) }; },
        async first() { return raw.prepare(sql).get(...args) ?? null; },
        async run() { return raw.prepare(sql).run(...args); },
      };
      return bound;
    },
  };

  const siembra = (id, puntos, estado) => {
    raw.prepare(
      "INSERT INTO child_profiles (id, parent_user_id, alias, theme_band) VALUES (?, 'p', ?, 'PRIMARIA')",
    ).run(id, `Alias-${id}`);
    raw.prepare(
      "INSERT INTO score_totals (child_profile_id, period, theme_band, total_score) VALUES (?, 'all_time', 'PRIMARIA', ?)",
    ).run(id, puntos);
    if (estado !== "sin-fila") {
      raw.prepare(
        "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, revoked_at) " +
          "VALUES (?, 'LEADERBOARD', 'p', 1000, ?)",
      ).run(id, estado === "revocado" ? 2000 : null);
    }
  };
  siembra("vigente", 5000, "vigente");
  siembra("sin-fila", 9000, "sin-fila"); // más puntos que nadie, a propósito
  siembra("revocado", 8000, "revocado");

  comprobaciones++;
  const filas = await datos.filasDeTablero(db, "nino", "PRIMARIA");
  const ids = filas.map((f) => f.id);
  if (ids.length !== 1 || ids[0] !== "vigente") {
    problemas.push(
      `la consulta del tablero devolvió [${ids.join(", ")}]: el niño sin fila y el revocado NO ` +
        "pueden aparecer (#247, D-040) — y aparecerían primeros, porque les sembré más puntos.",
    );
  }

  comprobaciones++;
  const { vista } = await datos.vistaParaNino(db, { id: "sin-fila", theme_band: "PRIMARIA" });
  if (vista.mi_posicion !== null || vista.lista.some((e) => e.soy_yo)) {
    problemas.push(
      "un niño sin opt-in recibió posición o se vio en la lista. Sin fila LEADERBOARD vigente no " +
        "hay rango que calcular: la ausencia de fila ES el apagado (D-040).",
    );
  }
  if (vista.mi_total !== 9000) {
    problemas.push(
      `un niño sin opt-in perdió su total propio (${vista.mi_total} ≠ 9000). Su total acumulado es ` +
        "SU dato y solo lo ve él — es lo único que el producto le enseña a todo el mundo (#247).",
    );
  }
  notas.push("fixture a mano: 1 vigente, 1 sin fila (con más puntos que nadie), 1 revocado");
}

notas.push(`${comprobaciones} comprobación(es) sobre la escritura y el cumplimiento del opt-in`);

informar({
  nombre: "tablero-optin",
  problemas,
  notas,
  cita: "D-040, D-051, #247, mc-25",
  revisados: comprobaciones,
  resumen: `${comprobaciones} comprobación(es): nadie borra, el alta registra quién y qué, el opt-in se cumple ejecutándolo`,
  porQueBloquea:
    "un consentimiento borrado es la desaparición de la prueba, y un niño sin opt-in en una lista " +
    "pública es una violación de privacidad de un menor: las dos se rompen con una sola sentencia SQL.",
  noComprueba: [
    "rutas futuras que lean el tablero sin pasar por lib/tablero-datos.ts — la defensa es la mitad " +
      "estática de tablero-orden-puntos.mjs, que corre en la misma puerta.",
  ],
});
