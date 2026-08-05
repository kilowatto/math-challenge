import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { rutaClub } from "../../../lib/rutas-app.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const session = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!session) return json({ ok: false, motivo: "sin_sesion" }, 401);
  let body: Record<string, unknown>;
  let esFormulario = false;
  try {
    esFormulario = (request.headers.get("content-type") ?? "").includes("form");
    if (esFormulario) {
      const form = await request.formData();
      body = { clubId: form.get("club_id"), childId: form.get("child_id"), locale: form.get("locale") };
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }
  } catch {
    return json({ ok: false, motivo: "cuerpo_ilegible" }, 400);
  }
  const clubId = typeof body.clubId === "string" ? body.clubId : "";
  const childId = typeof body.childId === "string" ? body.childId : "";
  const locale = typeof body.locale === "string" ? body.locale : "en";
  if (!clubId || !childId) return json({ ok: false, motivo: "entrada_invalida" }, 400);
  const result = await env.DB.prepare(
    "UPDATE adult_club_membership SET left_at = ? WHERE adult_club_id = ? AND child_profile_id = ? AND approved_by = ? AND left_at IS NULL",
  ).bind(Math.floor(Date.now() / 1000), clubId, childId, session.userId).run();
  if ((result.meta?.changes ?? 0) < 1) return json({ ok: false, motivo: "membresia_desconocida" }, 404);
  if (esFormulario) return Response.redirect(rutaClub(locale, clubId), 303);
  return json({ ok: true, redirect: rutaClub(locale, clubId) });
};
