import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../../lib/sesiones.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const session = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!session) return json({ ok: false, motivo: "solo_adultos" }, 403);
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const stakeId = typeof body.stakeId === "string" ? body.stakeId : "";
  const stake = await env.DB.prepare("SELECT s.id FROM club_stake s JOIN club_challenge c ON c.id = s.challenge_id JOIN adult_club_membership m ON m.adult_club_id = c.adult_club_id AND m.user_id = ? AND m.left_at IS NULL WHERE s.id = ? AND s.moderacion = 'aprobada'").bind(session.userId, stakeId).first<{ id: string }>();
  if (!stake) return json({ ok: false, motivo: "prenda_desconocida" }, 404);
  await env.DB.prepare("INSERT OR IGNORE INTO club_stake_acceptance (stake_id, user_id, accepted_at) VALUES (?, ?, ?)").bind(stake.id, session.userId, Math.floor(Date.now() / 1000)).run();
  return json({ ok: true, stakeId: stake.id });
};
