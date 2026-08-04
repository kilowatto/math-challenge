/**
 * `/api/grupos/decidir` — la decisión del padre sobre la entrada de su hijo
 * (F9 · #382, D-011, D-096 del reparto).
 *
 * El formulario de la tarjeta de identidad llega aquí con una de las tres
 * salidas explícitas (`approved` / `rejected` / `pending`). La escritura vive
 * en `padre-grupo.ts` — el ÚNICO módulo autorizado (`grupo-aprobacion-padre`
 * vigila que ninguna otra ruta escriba una aprobación) — con sus tres
 * condiciones: el perfil es de la cuenta de la sesión, el grupo sigue activo,
 * y la fila queda firmada con `decided_by` cuando la decisión no es aplazar.
 *
 * Esta ruta NO contiene SQL: la trae y la lleva, nada más. Así no hay dos
 * copias de la regla que un día se ablanden distinto.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../../lib/respuesta-de-formulario.ts";
import { f9Habilitado } from "../../../lib/grupo-flag.ts";
import { decidirEntrada, grupoPorCodigo } from "../../../lib/padre-grupo.ts";
import type { DecisionDeEntrada } from "../../../lib/padre-grupo.ts";

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
    return terminarMal(request, `/${locale}/app/grupos/unirse/`, "sin_bindings", 503);
  }

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, `/${locale}/app/grupos/unirse/`, "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, `/${locale}/app/`, "sin_sesion", 401);

  let codigo = "";
  let childId = "";
  let decision = "";
  let optIn = false;
  try {
    const f = await request.formData();
    codigo = String(f.get("codigo") ?? "");
    childId = String(f.get("hijo") ?? "");
    decision = String(f.get("decision") ?? "");
    // El checkbox solo viaja marcado: ausente = apagado = el default de D-087.
    optIn = f.get("opt_in") !== null;
    locale = String(f.get("locale") ?? "");
  } catch {
    return terminarMal(request, `/${locale}/app/grupos/unirse/`, "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const volverA = `/${locale}/app/grupos/unirse/`;

  if (!(await f9Habilitado(env.CONFIG_KV, locale))) {
    return terminarMal(request, volverA, "apagado", 404);
  }

  if (decision !== "approved" && decision !== "rejected" && decision !== "pending") {
    return terminarMal(request, volverA, "decision_invalida");
  }

  // El grupo se busca de nuevo por el código: entre la tarjeta y el botón el
  // código pudo apagarse, y decidir sobre un grupo apagado es decidir sobre
  // algo que el dueño ya cerró.
  const grupo = await grupoPorCodigo(env.DB, codigo);
  if (!grupo) return terminarMal(request, volverA, "codigo_inactivo");

  const resultado = await decidirEntrada(env.DB, {
    parentUserId: sesion.userId,
    childId,
    groupId: grupo.id,
    decision: decision as DecisionDeEntrada,
    optIn,
    ahora: Math.floor(Date.now() / 1000),
  });

  if (!resultado.ok) return terminarMal(request, volverA, resultado.motivo);

  const hecho =
    decision === "approved" ? "aprobada" : decision === "rejected" ? "rechazada" : "pendiente";
  return terminarBien(request, `${volverA}?hecho=${hecho}`, [], { ok: true });
};
