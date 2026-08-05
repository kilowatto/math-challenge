import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { solicitarAdolescente, unirseAdulto } from "../../../lib/club-adulto.ts";

export const prerender = false;
interface Env { DB: D1Database; SESSION_KV: KVNamespace }

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env.SESSION_KV) return terminarMal(request, "/app/clubes/unirse/", "sin_bindings", 503);
  if (request.headers.get("early-data") === "1") return terminarMal(request, "/app/clubes/unirse/", "reintenta", 425);
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, "/app/", "sin_sesion", 401);
  let codigo = "";
  let childId = "";
  let locale = "en";
  try {
    const form = await request.formData();
    codigo = String(form.get("codigo") ?? "").trim().toUpperCase();
    childId = String(form.get("child_id") ?? "").trim();
    locale = String(form.get("locale") ?? "en");
  } catch {
    return terminarMal(request, "/app/clubes/unirse/", "cuerpo_ilegible");
  }
  if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(codigo)) return terminarMal(request, `/${locale}/app/clubes/unirse/`, "codigo_invalido");
  const result = childId
    ? await solicitarAdolescente(env.DB, sesion.userId, childId, codigo, Math.floor(Date.now() / 1000))
    : await unirseAdulto(env.DB, sesion.userId, codigo, Math.floor(Date.now() / 1000));
  if (!result.ok) return terminarMal(request, `/${locale}/app/clubes/unirse/`, result.motivo);
  return terminarBien(request, `/${locale}/app/clubes/${result.id}/?unido=1`, [], { ok: true, id: result.id });
};
