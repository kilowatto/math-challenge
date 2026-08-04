/**
 * La preferencia del padre sobre sus reportes (F8 #290): la fila de
 * `parent_report_settings`, su creación perezosa y la baja de un toque.
 *
 * ─── Por qué la fila se crea TARDE y no en el registro ─────────────────────
 *
 * La cadencia por defecto es WEEKLY a las 8 (decisión del dueño, 2026-08-02,
 * activada en silencio — sin sexta marca contextual). La ausencia de fila ya
 * significa eso, así que la fila solo se escribe cuando hace falta un dato
 * que los defaults no tienen: el `unsubscribe_token` del primer correo, o un
 * cambio explícito del padre.
 *
 * ─── La baja es permanente y no se re-pregunta (D-026) ─────────────────────
 *
 * `bajaPorToken` pone `cadence='OFF'` y sella `unsubscribed_at` en UNA
 * escritura. Ninguna función de este archivo limpia `unsubscribed_at` — la
 * reactivación es cambiar la cadencia desde la pantalla de preferencias, con
 * sesión, por voluntad propia; el sello queda como registro de que la baja
 * ocurrió. Re-preguntar lo descartado es nagging (mc-17, FTC 2022).
 */

import { nuevoToken } from "./sesiones";

export interface FilaSettings {
  user_id: string;
  cadence: "WEEKLY" | "MONTHLY" | "OFF";
  send_hour_local: number;
  last_sent_at: number | null;
  unsubscribe_token: string;
  unsubscribed_at: number | null;
}

/**
 * Lee la fila, creándola si no existe. El token se genera aquí y solo aquí:
 * `nuevoToken()` es `crypto.getRandomValues` (el estándar de `mc_h`/`mc_s`,
 * D-052) — nunca derivado de `user_id` ni de nada predecible (#287).
 */
export async function asegurarSettings(DB: D1Database, userId: string): Promise<FilaSettings> {
  const ahora = Date.now();
  await DB.prepare(
    `INSERT INTO parent_report_settings (user_id, unsubscribe_token, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO NOTHING`,
  )
    .bind(userId, nuevoToken(), ahora)
    .run();
  const fila = await DB.prepare(
    `SELECT user_id, cadence, send_hour_local, last_sent_at, unsubscribe_token, unsubscribed_at
       FROM parent_report_settings WHERE user_id = ?`,
  )
    .bind(userId)
    .first<FilaSettings>();
  if (!fila) throw new Error(`parent_report_settings ilegible tras el upsert: ${userId}`);
  return fila;
}

/** La preferencia tal como la ve la pantalla, con defaults si no hay fila. */
export async function leerPreferencia(
  DB: D1Database,
  userId: string,
): Promise<{ cadence: "WEEKLY" | "MONTHLY" | "OFF"; send_hour_local: number }> {
  const fila = await DB.prepare(
    "SELECT cadence, send_hour_local FROM parent_report_settings WHERE user_id = ?",
  )
    .bind(userId)
    .first<{ cadence: "WEEKLY" | "MONTHLY" | "OFF"; send_hour_local: number }>();
  // Sin fila: los defaults del dueño. NO se crea la fila aquí — leer no debe
  // escribir, y el token solo se genera cuando hace falta (envío o cambio).
  return fila ?? { cadence: "WEEKLY", send_hour_local: 8 };
}

/**
 * Cambia la cadencia desde la pantalla de preferencias (con sesión). Es la
 * ÚNICA vía de reactivación tras una baja, y es deliberado que pase por aquí:
 * una acción explícita del padre dentro de la app, nunca un efecto lateral de
 * abrir un correo ni de volver a entrar al sitio.
 */
export async function cambiarCadencia(
  DB: D1Database,
  userId: string,
  cadence: "WEEKLY" | "MONTHLY" | "OFF",
): Promise<void> {
  if (cadence !== "WEEKLY" && cadence !== "MONTHLY" && cadence !== "OFF") {
    throw new RangeError(`cadencia desconocida: ${JSON.stringify(cadence)}`);
  }
  await asegurarSettings(DB, userId);
  await DB.prepare(
    `UPDATE parent_report_settings SET cadence = ?, updated_at = ? WHERE user_id = ?`,
  )
    .bind(cadence, Date.now(), userId)
    .run();
}

export type ResultadoBaja = "apagada" | "token_desconocido";

/**
 * La baja de un toque (#290). El token en la URL basta — sin sesión, sin
 * pantalla intermedia, sin «¿seguro?», sin oferta de reducir la frecuencia
 * (ese patrón concreto es lo que la carta `patrones-oscuros` caza, D-014).
 *
 * Idempotente a propósito: un cliente de correo que precargue el enlace dos
 * veces obtiene el mismo estado, no un error.
 */
export async function bajaPorToken(DB: D1Database, token: string): Promise<ResultadoBaja> {
  const ahora = Date.now();
  const resultado = await DB.prepare(
    `UPDATE parent_report_settings
        SET cadence = 'OFF', unsubscribed_at = COALESCE(unsubscribed_at, ?), updated_at = ?
      WHERE unsubscribe_token = ?`,
  )
    .bind(ahora, ahora, token)
    .run();
  return (resultado.meta.changes ?? 0) > 0 ? "apagada" : "token_desconocido";
}

/** El locale del dueño de un token de baja — para responder en su idioma. */
export async function localeDelToken(DB: D1Database, token: string): Promise<string | null> {
  const fila = await DB.prepare(
    `SELECT u.locale FROM parent_report_settings s
       JOIN users u ON u.id = s.user_id
      WHERE s.unsubscribe_token = ?`,
  )
    .bind(token)
    .first<{ locale: string }>();
  return fila?.locale ?? null;
}
