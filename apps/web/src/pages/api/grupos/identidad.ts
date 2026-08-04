/**
 * `/api/grupos/identidad` — la declaración de quién dirige el grupo (F9 ·
 * #381/#383, criterio #118).
 *
 * El formulario de `/[locale]/app/grupos/identidad` llega aquí. Escribe
 * `group_owner_identity.declared_context` — el PRIMER escritor de la tabla en
 * el producto — con `assurance = 'declared'` por default del esquema: subir
 * de nivel de confianza es cosa de la escuela verificada (los triggers de la
 * 0017) o de la revisión humana, nunca de este formulario.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { f9Habilitado } from "../../../lib/grupo-flag.ts";
import { declararIdentidad } from "../../../lib/grupo-duenio.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  CONFIG_KV: KVNamespace;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export const POST: APIRoute = async ({ request, locals }) => {
  let locale = "en";
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) {
    return terminarMal(request, `/${locale}/app/grupos/identidad/`, "sin_bindings", 503);
  }

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, `/${locale}/app/grupos/identidad/`, "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, `/${locale}/app/`, "sin_sesion", 401);

  let contexto = "";
  try {
    const f = await request.formData();
    contexto = String(f.get("contexto") ?? "").trim();
    locale = String(f.get("locale") ?? "");
  } catch {
    return terminarMal(request, `/${locale}/app/grupos/identidad/`, "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const volverA = `/${locale}/app/grupos/identidad/`;

  if (!(await f9Habilitado(env.CONFIG_KV, locale))) {
    return terminarMal(request, volverA, "apagado", 404);
  }

  if (contexto.length < 2) return terminarMal(request, volverA, "contexto_corto");

  await declararIdentidad(env.DB, sesion.userId, contexto);
  return terminarBien(request, `/${locale}/app/grupos/nuevo/`, [], { ok: true });
};
