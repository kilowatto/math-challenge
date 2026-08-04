/**
 * `/api/grupos/codigo` — reset y disable del código de unión (F9 · #383,
 * D-113 del reparto).
 *
 * Los dos formularios de la pantalla del grupo llegan aquí: «generar código
 * nuevo» (el viejo muere en el acto; las membresías aprobadas no se tocan) y
 * «desactivar/reactivar» (`disabled_at`). Las dos exigen que el grupo sea de
 * la sesión — `grupo_desconocido` cubre ajeno e inexistente sin distinguir,
 * como `hijoDelPadre`.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { f9Habilitado } from "../../../lib/grupo-flag.ts";
import { cambiarCodigoActivo, resetearCodigo } from "../../../lib/grupo-duenio.ts";

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
    return terminarMal(request, `/${locale}/app/grupos/`, "sin_bindings", 503);
  }

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, `/${locale}/app/grupos/`, "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, `/${locale}/app/`, "sin_sesion", 401);

  let groupId = "";
  let accion = "";
  try {
    const f = await request.formData();
    groupId = String(f.get("grupo") ?? "");
    accion = String(f.get("accion") ?? "");
    locale = String(f.get("locale") ?? "");
  } catch {
    return terminarMal(request, `/${locale}/app/grupos/`, "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const volverA = `/${locale}/app/grupos/${encodeURIComponent(groupId)}/`;

  if (!(await f9Habilitado(env.CONFIG_KV, locale))) {
    return terminarMal(request, volverA, "apagado", 404);
  }

  const ahora = Math.floor(Date.now() / 1000);
  const resultado =
    accion === "reset"
      ? await resetearCodigo(env.DB, sesion.userId, groupId)
      : accion === "desactivar"
        ? await cambiarCodigoActivo(env.DB, sesion.userId, groupId, false, ahora)
        : accion === "activar"
          ? await cambiarCodigoActivo(env.DB, sesion.userId, groupId, true, ahora)
          : { ok: false as const, motivo: "accion_invalida" };

  if (resultado.ok === false) return terminarMal(request, volverA, resultado.motivo);
  return terminarBien(request, volverA, [], { ok: true });
};
