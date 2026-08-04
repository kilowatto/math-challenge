/**
 * `/api/padre-tablero` — activar y desactivar el tablero de un hijo (F7 #247).
 *
 * ─── POST: el interruptor del opt-in (D-040, D-051) ──────────────────────────
 *
 * El formulario de `/[locale]/app/parent/tablero/[childId]` llega aquí con
 * `accion=activar|desactivar`. La escritura es el gobierno único de D-051 —
 * alta = INSERT con `granted_by`, baja = `revoked_at`, NUNCA DELETE— y vive en
 * `lib/padre-tablero.ts`; aquí solo se decide QUIÉN puede pedirla.
 *
 * Cualquier otra acción se rechaza con un motivo de conjunto cerrado: el
 * interruptor tiene dos posiciones y no hay tercera vía por la que una
 * petición inventada pueda escribir otra cosa.
 *
 * ─── Quién entra, y quién no ─────────────────────────────────────────────────
 *
 * Exige `mc_s` y verifica que el `childId` pertenece al `parent_user_id` de la
 * sesión (línea roja #2: el padre ve a SUS hijos). Un `childId` que no existe
 * o es de otra cuenta produce el mismo 404 — quien prueba ids ajenos no
 * aprende cuáles existen. Es el mismo patrón que `/api/padre-limite`.
 *
 * ─── Por qué las importaciones llevan `.ts` explícita ────────────────────────
 *
 * `padre-tablero.prueba.mjs` carga ESTE módulo con `node
 * --experimental-strip-types` para probar el camino de la ruta de verdad
 * (sesión falsa en KV de mentira, D1 sobre `node:sqlite`), y ese loader no
 * resuelve rutas sin extensión. Es el mismo motivo que en `padre-limite.ts`.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario.ts";
import { rutaCasa, rutaTableroHijo } from "../../lib/rutas-app.ts";
import { hijoDelPadre } from "../../lib/padre-limite.ts";
import { activarTablero, desactivarTablero } from "../../lib/padre-tablero.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

// La misma lista que `i18n/index.ts`, escrita aquí como hace `padre-limite.ts`:
// importar `isLocale` arrastraría los siete JSON de mensajes, y la prueba de
// esta ruta corre con `node --experimental-strip-types`, que no carga JSON sin
// atributos de importación.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // El estado del consentimiento depende de la sesión: jamás se cachea.
      "cache-control": "no-store, private",
    },
  });

/**
 * `childId` inexistente o ajeno: el mismo 404 para los dos. Un 403
 * distinguiría «existe pero no es tuyo» de «no existe», y esa distinción es
 * información sobre las cuentas de otras familias.
 */
const noEncontrado = () => json({ ok: false, motivo: "perfil_desconocido" }, 404);

export const POST: APIRoute = async ({ request, locals }) => {
  // `en` mientras no se sepa el locale real, igual que en `padre-limite.ts`:
  // las primeras comprobaciones fallan antes de leer el cuerpo.
  let locale = "en";
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);

  // Escribir un consentimiento es una escritura, y `early data` es replicable
  // (RFC 8470): sin esto, reenviar los bytes del 0-RTT activaría el tablero.
  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, rutaCasa(locale), "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) {
    return terminarMal(request, rutaCasa(locale), "sin_sesion", 401);
  }

  let childId = "";
  let accion = "";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      childId = String(j.hijo ?? "");
      accion = String(j.accion ?? "");
      locale = String(j.locale ?? "");
    } else {
      const f = await request.formData();
      childId = String(f.get("hijo") ?? "");
      accion = String(f.get("accion") ?? "");
      locale = String(f.get("locale") ?? "");
    }
  } catch {
    return terminarMal(request, rutaCasa(locale), "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const hijo = await hijoDelPadre(env.DB, sesion.userId, childId);
  if (!hijo) return noEncontrado();

  const volverA = rutaTableroHijo(locale, hijo.id);
  // El conjunto cerrado. Un `accion=borrar` inventado no encuentra aquí ninguna
  // función que borre — borrar no existe (D-051: se revoca, jamás se elimina).
  const pedido = { hijo, parentUserId: sesion.userId, ahora: Math.floor(Date.now() / 1000) };
  if (accion === "activar") await activarTablero(env.DB, pedido);
  else if (accion === "desactivar") await desactivarTablero(env.DB, pedido);
  else return terminarMal(request, volverA, "accion_desconocida");

  // `?guardado=1` para que la pantalla confirme. 303 si vino de un formulario,
  // JSON si vino de `fetch` — ver `lib/respuesta-de-formulario.ts`.
  return terminarBien(request, `${volverA}?guardado=1`, [], { ok: true });
};
