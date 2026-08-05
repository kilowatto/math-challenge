import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { crearClub } from "../../../lib/club-adulto.ts";
import { rutaCasa, rutaClub, rutaClubNuevo } from "../../../lib/rutas-app.ts";

export const prerender = false;

interface Env { DB: D1Database; SESSION_KV: KVNamespace }

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return terminarMal(request, rutaClubNuevo("en"), "sin_bindings", 503);
  if (request.headers.get("early-data") === "1") return terminarMal(request, rutaClubNuevo("en"), "reintenta", 425);
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, rutaCasa("en"), "sin_sesion", 401);
  let nameKey = "";
  let locale = "en";
  try {
    const form = await request.formData();
    nameKey = String(form.get("name_key") ?? "");
    locale = String(form.get("locale") ?? "en");
  } catch {
    return terminarMal(request, rutaClubNuevo(locale), "cuerpo_ilegible");
  }
  const result = await crearClub(env.DB, sesion.userId, nameKey, Math.floor(Date.now() / 1000));
  if (!result.ok) return terminarMal(request, rutaClubNuevo(locale), result.motivo);
  return terminarBien(request, `${rutaClub(locale, result.id)}?creado=1`, [], { ok: true, id: result.id, codigo: result.codigo });
};
