import type { APIRoute } from "astro";
import { COOKIE_ADULTO, COOKIE_NINO, leerCookies, leerSesionAdulto, leerSesionNino } from "../../../../lib/sesiones.ts";
import { rutaClub } from "../../../../lib/rutas-app.ts";

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
  let esFormulario = false;
  try {
    esFormulario = (request.headers.get("content-type") ?? "").includes("form");
    if (esFormulario) {
      const form = await request.formData();
      body = { stakeId: form.get("stakeId"), locale: form.get("locale") };
    } else body = (await request.json()) as Record<string, unknown>;
  } catch { return json({ ok: false, motivo: "cuerpo_ilegible" }, 400); }
  const stakeId = typeof body.stakeId === "string" ? body.stakeId : "";
  const participant = adulto ? { column: "m.user_id", id: adulto.userId } : { column: "m.child_profile_id", id: nino!.childProfileId };
  const row = await env.DB.prepare(`SELECT l.id, c.adult_club_id FROM stake_moderation_log l JOIN club_stake s ON s.id = l.stake_id JOIN club_challenge c ON c.id = s.challenge_id JOIN adult_club_membership m ON m.adult_club_id = c.adult_club_id AND ${participant.column} = ? AND m.left_at IS NULL WHERE s.id = ? AND s.moderacion = 'rechazada' AND l.appealed_at IS NULL`).bind(participant.id, stakeId).first<{ id: string; adult_club_id: string }>();
  if (!row) return json({ ok: false, motivo: "apelacion_no_disponible" }, 404);
  await env.DB.prepare("UPDATE stake_moderation_log SET appealed_at = ? WHERE id = ? AND appealed_at IS NULL").bind(Math.floor(Date.now() / 1000), row.id).run();
  if (esFormulario) return Response.redirect(rutaClub(typeof body.locale === "string" ? body.locale : "en", row.adult_club_id), 303);
  return json({ ok: true, appealed: true });
};
