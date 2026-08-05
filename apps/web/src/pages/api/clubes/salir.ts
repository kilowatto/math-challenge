import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { salirClub } from "../../../lib/club-adulto.ts";
import { rutaCasa, rutaClub, rutaClubes } from "../../../lib/rutas-app.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return terminarMal(request, rutaClubes("en"), "sin_bindings", 503);
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, rutaCasa("en"), "sin_sesion", 401);
  const form = await request.formData();
  const clubId = String(form.get("club_id") ?? "");
  const locale = String(form.get("locale") ?? "en");
  const ok = await salirClub(env.DB, sesion.userId, clubId, Math.floor(Date.now() / 1000));
  if (!ok) return terminarMal(request, rutaClub(locale, clubId), "sin_membresia");
  return terminarBien(request, rutaClubes(locale), [], { ok: true });
};
