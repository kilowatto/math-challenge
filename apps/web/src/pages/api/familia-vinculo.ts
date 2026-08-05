import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../lib/sesiones";
import { codigoInvitacion } from "../../lib/familia";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);
  const session = await leerSesionAdulto(env.SESSION_KV, leerCookies(request.headers.get("cookie"))[COOKIE_ADULTO]);
  if (!session) return json({ error: "sin_sesion" }, 401);
  const accion = url.searchParams.get("accion");
  const now = Math.floor(Date.now() / 1000);
  if (accion === "crear") {
    const existente = await env.DB.prepare("SELECT invite_code FROM household_link WHERE inviter_user_id = ? AND revoked_at IS NULL").bind(session.userId).first() as { invite_code: string } | null;
    if (existente) return json({ codigo: existente.invite_code });
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    const codigo = codigoInvitacion(bytes);
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO household_link (id, inviter_user_id, invite_code, created_at) VALUES (?, ?, ?, ?)")
      .bind(id, session.userId, codigo, now).run();
    return json({ codigo }, 201);
  }
  if (accion === "unirse") {
    let body: { codigo?: unknown };
    try { body = await request.json(); } catch { return json({ error: "cuerpo_ilegible" }, 400); }
    const codigo = typeof body.codigo === "string" ? body.codigo.trim().toUpperCase() : "";
    const invite = await env.DB.prepare("SELECT id, inviter_user_id FROM household_link WHERE invite_code = ? AND revoked_at IS NULL")
      .bind(codigo).first() as { id: string; inviter_user_id: string } | null;
    if (!invite || invite.inviter_user_id === session.userId) return json({ error: "codigo_invalido" }, 404);
    const actual = await env.DB.prepare("SELECT id FROM household_link WHERE user_id = ? AND revoked_at IS NULL").bind(session.userId).first();
    if (actual) return json({ error: "hogar_ya_vinculado" }, 409);
    await env.DB.prepare("UPDATE household_link SET user_id = ?, accepted_at = ? WHERE id = ? AND user_id IS NULL")
      .bind(session.userId, now, invite.id).run();
    return json({ ok: true });
  }
  if (accion === "revocar") {
    await env.DB.prepare("UPDATE household_link SET revoked_at = ? WHERE inviter_user_id = ? AND revoked_at IS NULL").bind(now, session.userId).run();
    return json({ ok: true });
  }
  return json({ error: "accion_desconocida" }, 400);
};

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
