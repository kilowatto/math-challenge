import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { crearRetoClub } from "../../../lib/club-adulto.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return terminarMal(request, "/app/clubes/", "sin_bindings", 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, "/app/", "sin_sesion", 401);
  let clubId = "";
  let nivel = NaN;
  let locale = "en";
  try {
    const form = await request.formData();
    clubId = String(form.get("club_id") ?? "");
    nivel = Number(form.get("nivel"));
    locale = String(form.get("locale") ?? "en");
  } catch {
    return terminarMal(request, "/app/clubes/", "cuerpo_ilegible");
  }
  const result = await crearRetoClub(env.DB, sesion.userId, clubId, nivel, Math.floor(Date.now() / 1000));
  if (!result.ok) return terminarMal(request, `/${locale}/app/clubes/${clubId}/`, result.motivo);
  return terminarBien(request, `/${locale}/app/clubes/${clubId}/?reto=1`, [], { ok: true, id: result.id, expiresAt: result.expiresAt });
};
