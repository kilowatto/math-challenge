/**
 * `/api/grupos/escuela` — registrar una escuela (F9 · #381, D-086, D-090).
 *
 * El formulario de `/[locale]/app/grupos/escuela` llega aquí como
 * `multipart/form-data` (lleva el documento). La lógica — atajo de dominio o
 * revisión humana, nunca ambigua— vive en `grupo-escuela.ts`: esta ruta lee
 * el correo de la cuenta de la sesión (el dominio del atajo sale de ahí, no
 * del cuerpo — confiar en el correo del formulario sería un atajo que se
 * auto-concede) y delega.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { f9Habilitado } from "../../../lib/grupo-flag.ts";
import { registrarEscuela } from "../../../lib/grupo-escuela.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  CONFIG_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export const POST: APIRoute = async ({ request, locals }) => {
  let locale = "en";
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) {
    return terminarMal(request, `/${locale}/app/grupos/escuela/`, "sin_bindings", 503);
  }

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, `/${locale}/app/grupos/escuela/`, "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, `/${locale}/app/`, "sin_sesion", 401);

  let nombre = "";
  let pais = "";
  let documento: File | null = null;
  try {
    const f = await request.formData();
    nombre = String(f.get("nombre") ?? "");
    pais = String(f.get("pais") ?? "");
    const d = f.get("documento");
    documento = d instanceof File ? d : null;
    locale = String(f.get("locale") ?? "");
  } catch {
    return terminarMal(request, `/${locale}/app/grupos/escuela/`, "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const volverA = `/${locale}/app/grupos/escuela/`;

  if (!(await f9Habilitado(env.CONFIG_KV, locale))) {
    return terminarMal(request, volverA, "apagado", 404);
  }

  // El correo de la sesión, no el del cuerpo: el dominio del atajo lo decide
  // la cuenta, no lo que alguien teclee en una petición.
  const cuenta = await env.DB.prepare("SELECT email FROM users WHERE id = ?")
    .bind(sesion.userId)
    .first<{ email: string }>();
  if (!cuenta) return terminarMal(request, volverA, "sin_sesion", 401);

  const resultado = await registrarEscuela(env.DB, env.MEDIA_BUCKET, env.CONFIG_KV, {
    userId: sesion.userId,
    email: cuenta.email,
    nombre,
    pais,
    locale,
    documento,
    ahora: Math.floor(Date.now() / 1000),
  });

  if (!resultado.ok) return terminarMal(request, volverA, resultado.motivo);
  return terminarBien(request, `${volverA}?hecho=${resultado.via}`, [], { ok: true });
};
