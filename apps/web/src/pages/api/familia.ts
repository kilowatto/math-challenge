import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../lib/sesiones";
import { hogarIds, REACCIONES_FAMILIA } from "../../lib/familia";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const session = await sesion(env, request);
  if (!session) return json({ error: "sin_sesion" }, 401);
  if (!env?.DB) return json({ error: "sin_base" }, 503);
  const links = (await env.DB.prepare("SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)").bind(session.userId, session.userId).all()).results as Array<{ inviter_user_id: string; user_id: string }>;
  const ids = hogarIds(links, session.userId);
  const marks = ids.map(() => "?").join(",");
  const children = (await env.DB.prepare(`SELECT id, alias, theme_band FROM child_profiles WHERE deleted_at IS NULL AND parent_user_id IN (${marks}) ORDER BY alias`).bind(...ids).all()).results;
  const adults = (await env.DB.prepare(`SELECT id, alias, alias_locale, is_learner FROM users WHERE deleted_at IS NULL AND id IN (${marks}) AND is_learner = 1 ORDER BY alias`).bind(...ids).all()).results;
  const pending = (await env.DB.prepare("SELECT invite_code, created_at FROM household_link WHERE inviter_user_id = ? AND user_id IS NULL AND revoked_at IS NULL").bind(session.userId).first());
  return json({ children, adults, pending });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const session = await sesion(env, request);
  if (!session) return json({ error: "sin_sesion" }, 401);
  if (!env?.DB) return json({ error: "sin_base" }, 503);
  let body: { targetKind?: unknown; targetId?: unknown; reaction?: unknown };
  try { body = await request.json(); } catch { return json({ error: "cuerpo_ilegible" }, 400); }
  if (body.targetKind !== "adult" && body.targetKind !== "child") return json({ error: "destino_invalido" }, 400);
  if (typeof body.targetId !== "string" || !REACCIONES_FAMILIA.includes(body.reaction as any)) return json({ error: "porra_invalida" }, 400);
  const links = (await env.DB.prepare("SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)").bind(session.userId, session.userId).all()).results as Array<{ inviter_user_id: string; user_id: string }>;
  const ids = hogarIds(links, session.userId);
  const target = body.targetKind === "adult"
    ? await env.DB.prepare(`SELECT id FROM users WHERE id = ? AND id IN (${ids.map(() => "?").join(",")})`).bind(body.targetId, ...ids).first()
    : await env.DB.prepare(`SELECT id FROM child_profiles WHERE id = ? AND parent_user_id IN (${ids.map(() => "?").join(",")}) AND deleted_at IS NULL`).bind(body.targetId, ...ids).first();
  if (!target) return json({ error: "destino_fuera_del_hogar" }, 403);
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const columnas = body.targetKind === "adult"
    ? "id, from_user_id, to_user_id, reaction, created_at"
    : "id, from_user_id, to_child_profile_id, reaction, created_at";
  const valores = body.targetKind === "adult"
    ? [id, session.userId, body.targetId, body.reaction, now]
    : [id, session.userId, body.targetId, body.reaction, now];
  await env.DB.prepare(`INSERT INTO family_cheer (${columnas}) VALUES (?, ?, ?, ?, ?)`).bind(...valores).run();
  return json({ ok: true }, 201);
};

async function sesion(env: any, request: Request) {
  if (!env?.SESSION_KV) return null;
  return leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
}

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
