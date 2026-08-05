import type { APIRoute } from "astro";
import { COOKIE_ADULTO, COOKIE_HOGAR, leerCookies, leerSesionAdulto } from "../../lib/sesiones";
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
  const adults = (await env.DB.prepare(`SELECT id, alias, alias_locale, is_learner FROM users WHERE deleted_at IS NULL AND id IN (${marks}) AND id <> ? AND is_learner = 1 ORDER BY alias`).bind(...ids, session.userId).all()).results;
  const pending = (await env.DB.prepare("SELECT invite_code, created_at FROM household_link WHERE inviter_user_id = ? AND user_id IS NULL AND revoked_at IS NULL").bind(session.userId).first());
  const linkActivo = await env.DB.prepare("SELECT id, inviter_user_id, user_id, accepted_at FROM household_link WHERE revoked_at IS NULL AND user_id IS NOT NULL AND (inviter_user_id = ? OR user_id = ?)").bind(session.userId, session.userId).first();
  const householdDevices = (await env.DB.prepare(`SELECT device_token, owner_user_id, label, approved_at FROM household_devices WHERE owner_user_id IN (${marks}) AND revoked_at IS NULL ORDER BY approved_at DESC`).bind(...ids).all()).results;
  const currentDeviceToken = leerCookies(request.headers.get("cookie"))[COOKIE_HOGAR];
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyAdults = (await env.DB.prepare(`SELECT r.user_id AS id, u.alias, SUM(CAST(r.correct_count AS REAL) / r.item_count) AS precision, COUNT(*) AS attempts FROM family_challenge_result r JOIN family_challenge c ON c.id = r.family_challenge_id JOIN users u ON u.id = r.user_id WHERE c.kind = 'weekly' AND c.created_by_user_id IN (${marks}) AND c.created_at >= ? AND r.user_id IS NOT NULL GROUP BY r.user_id, u.alias ORDER BY precision DESC, u.alias`).bind(...ids, weekStart).all()).results;
  const weeklyChildren = (await env.DB.prepare(`SELECT r.child_profile_id AS id, p.alias, SUM(CAST(r.correct_count AS REAL) / r.item_count) AS precision, COUNT(*) AS attempts FROM family_challenge_result r JOIN family_challenge c ON c.id = r.family_challenge_id JOIN child_profiles p ON p.id = r.child_profile_id WHERE c.kind = 'weekly' AND c.created_by_user_id IN (${marks}) AND c.created_at >= ? AND r.child_profile_id IS NOT NULL AND p.deleted_at IS NULL GROUP BY r.child_profile_id, p.alias ORDER BY precision DESC, p.alias`).bind(...ids, weekStart).all()).results;
  return json({ children, adults, pending, linkActivo, householdDevices, currentDeviceToken, weeklyAdults, weeklyChildren });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const session = await sesion(env, request);
  if (!session) return json({ error: "sin_sesion" }, 401);
  if (!env?.DB) return json({ error: "sin_base" }, 503);
  let body: { action?: unknown; deviceToken?: unknown; targetKind?: unknown; targetId?: unknown; reaction?: unknown };
  try { body = await request.json(); } catch { return json({ error: "cuerpo_ilegible" }, 400); }
  if (body.action === "revocar-dispositivo") {
    if (typeof body.deviceToken !== "string" || body.deviceToken.length < 20) return json({ error: "dispositivo_invalido" }, 400);
    const links = (await env.DB.prepare("SELECT inviter_user_id, user_id FROM household_link WHERE revoked_at IS NULL AND (inviter_user_id = ? OR user_id = ?)").bind(session.userId, session.userId).all()).results as Array<{ inviter_user_id: string; user_id: string }>;
    const ids = hogarIds(links, session.userId);
    const result = await env.DB.prepare(`UPDATE household_devices SET revoked_at = ? WHERE device_token = ? AND owner_user_id IN (${ids.map(() => "?").join(",")}) AND revoked_at IS NULL`).bind(Math.floor(Date.now() / 1000), body.deviceToken, ...ids).run();
    return (result.meta?.changes ?? 0) === 1 ? json({ ok: true }) : json({ error: "dispositivo_fuera_del_hogar" }, 403);
  }
  if (body.targetKind !== "adult" && body.targetKind !== "child") return json({ error: "destino_invalido" }, 400);
  if (typeof body.targetId !== "string" || !REACCIONES_FAMILIA.includes(body.reaction as any)) return json({ error: "porra_invalida" }, 400);
  if (body.targetKind === "adult" && body.targetId === session.userId) return json({ error: "no_eres_destino" }, 400);
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
