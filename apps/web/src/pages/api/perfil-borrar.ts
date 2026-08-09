/**
 * `POST /api/perfil-borrar` — el adulto borra el perfil de un hijo (D-197).
 *
 * ─── Dos cosas distintas se borran, en momentos distintos ──────────────────
 *
 * (1) El MODELO adaptativo del niño (Durable Object `LEARNER_DO`) se borra
 * AQUÍ MISMO, de inmediato — nunca en 30 días. `audits/borrado-alcanza-al-
 * modelo.mjs` lo exige sin excepción (F4 #104, GDPR art. 17, COPPA §312.6):
 * el pedido de borrado del padre es lo que dispara el derecho de borrado, no
 * la purga eventual de la fila. Primero el DO (`olvidarModelo`), después la
 * fila — al revés, si el DO falla ya no existe la llave para reintentarlo.
 *
 * (2) La FILA de `child_profiles` (alias, avatar, idioma, nivel) sí queda
 * recuperable 30 días vía `deleted_at` — el dueño pidió una papelera para
 * protegerse de un toque accidental (D-197 §3, confirmación simple, sin
 * pedir escribir el alias). **Pero recuperar la fila dentro de esos 30 días
 * NO recupera el progreso de aprendizaje** — ese ya se borró de verdad en el
 * paso (1). Es la misma distinción que ya existe en otros productos entre
 * "recuperar una cuenta" y "recuperar los datos sensibles que ya se
 * erosionaron" — no son la misma promesa.
 *
 * Household-aware: cualquier adulto del mismo hogar (`household_link`,
 * D-096) puede borrar el perfil, no solo quien lo creó — mismo criterio que
 * ya usa `api/familia.ts` para todo lo demás del hogar.
 */
import type { APIRoute } from "astro";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { hogarIds } from "../../lib/familia";
import { olvidarModelo } from "../../lib/aprendiz";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  LEARNER_DO?: DurableObjectNamespace;
}

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const sesion = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!sesion) return json({ error: "sin_sesion" }, 401);

  let body: { childId?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "cuerpo_ilegible" }, 400);
  }
  const childId = String(body.childId ?? "");
  if (!childId) return json({ error: "hijo_invalido" }, 400);

  const links = (
    await env.DB.prepare(
      "SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)",
    )
      .bind(sesion.userId, sesion.userId)
      .all()
  ).results as Array<{ inviter_user_id: string; user_id: string }>;
  const ids = hogarIds(links, sesion.userId);
  const marcadores = ids.map(() => "?").join(",");

  // Confirma que el hijo es de este hogar ANTES de tocar el DO — nunca se
  // borra un modelo que no correspondía a esta petición.
  const hijo = await env.DB.prepare(
    `SELECT id FROM child_profiles WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(childId, ...ids)
    .first();
  if (!hijo) return json({ error: "hijo_fuera_del_hogar" }, 403);

  // Primero el Durable Object, después la fila (F4 #104, GDPR art. 17,
  // COPPA §312.6) — al revés, si el DO falla ya no existe la llave
  // (`child_profile_id`) para volver a intentarlo.
  const modeloOlvidado = await olvidarModelo(env.LEARNER_DO, childId);
  if (!modeloOlvidado) return json({ error: "modelo_no_borrado:reintenta" }, 502);

  const resultado = await env.DB.prepare(
    `UPDATE child_profiles SET deleted_at = ?, updated_at = ? WHERE id = ? AND parent_user_id IN (${marcadores}) AND deleted_at IS NULL`,
  )
    .bind(Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), childId, ...ids)
    .run();

  if ((resultado.meta?.changes ?? 0) !== 1) return json({ error: "hijo_fuera_del_hogar" }, 403);
  return json({ ok: true });
};
