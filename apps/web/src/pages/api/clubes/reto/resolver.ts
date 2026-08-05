import type { APIRoute } from "astro";
import { COOKIE_ADULTO, COOKIE_NINO, leerCookies, leerSesionAdulto, leerSesionNino } from "../../../../lib/sesiones.ts";
import { itemsDelReto, puntuarRespuestas, type RespuestaClub } from "../../../../lib/club-retos.ts";
import { generarBancoAdulto } from "../../../../../../../packages/motor/src/banco-adulto.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  const nino = adulto ? null : await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  if (!adulto && !nino) return json({ ok: false, motivo: "sin_sesion" }, 401);
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const respuestas = Array.isArray(body.respuestas) ? body.respuestas : [];
  if (!challengeId || respuestas.length > 20 || respuestas.some((answer) => !answer || typeof answer !== "object" || typeof (answer as Record<string, unknown>).itemId !== "string")) return json({ ok: false, motivo: "entrada_invalida" }, 400);
  const parsed = respuestas.map((answer) => ({ itemId: String((answer as Record<string, unknown>).itemId), eleccion: (answer as Record<string, unknown>).eleccion as number | string } satisfies RespuestaClub));
  if (parsed.some((answer) => typeof answer.eleccion !== "string" && typeof answer.eleccion !== "number")) return json({ ok: false, motivo: "entrada_invalida" }, 400);
  const participant = adulto ? { column: "m.user_id", id: adulto.userId } : { column: "m.child_profile_id", id: nino!.childProfileId };
  const challenge = await env.DB.prepare(`SELECT c.item_set, c.starts_at, c.expires_at, c.status, m.id AS membership_id FROM club_challenge c JOIN adult_club_membership m ON m.adult_club_id = c.adult_club_id AND ${participant.column} = ? AND m.left_at IS NULL WHERE c.id = ?`).bind(participant.id, challengeId).first<{ item_set: string; starts_at: number; expires_at: number; status: string; membership_id: string }>();
  if (!challenge) return json({ ok: false, motivo: "reto_desconocido" }, 404);
  const now = Math.floor(Date.now() / 1000);
  if (challenge.status !== "open" || now < challenge.starts_at || now >= challenge.expires_at) return json({ ok: false, motivo: "reto_cerrado" }, 410);
  const existing = await env.DB.prepare("SELECT completed_at FROM club_challenge_result WHERE challenge_id = ? AND membership_id = ?").bind(challengeId, challenge.membership_id).first<{ completed_at: number | null }>();
  if (existing?.completed_at !== null && existing?.completed_at !== undefined) return json({ ok: false, motivo: "reto_ya_resuelto" }, 409);
  const score = puntuarRespuestas(itemsDelReto(challenge.item_set, generarBancoAdulto()), parsed);
  if (!score) return json({ ok: false, motivo: "set_incompleto" }, 400);
  await env.DB.prepare("INSERT INTO club_challenge_result (challenge_id, membership_id, points, completed_at) VALUES (?, ?, ?, ?)").bind(challengeId, challenge.membership_id, score.puntos, now).run();
  return json({ ok: true, puntos: score.puntos, correctas: score.correctas });
};
