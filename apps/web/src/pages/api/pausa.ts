/**
 * `POST /api/pausa` — el padre declara una pausa familiar (#204).
 *
 * ─── Quién puede llamar, y por qué es la primera comprobación ──────────────
 *
 * La sesión `mc_s` es del ADULTO. Con `hijo` en el cuerpo, la pausa es para la
 * racha de ese perfil y `declararPausaFamiliar` exige que el perfil cuelgue de
 * la cuenta (`parent_user_id`) — el mismo patrón de autorización que F8 aplica
 * a `screen_time_settings`: nadie toca la racha de un niño que no es suyo.
 * Sin `hijo`, es el propio adulto aprendiz (SERIO/JR/PRO, D-034) quien se
 * autodeclara: mismo mecanismo, mismo tope, sin aprobación de un tercero.
 *
 * ─── Lo que este endpoint NO acepta ────────────────────────────────────────
 *
 *  · Ningún texto libre. El cuerpo lleva dos fechas, un identificador y el
 *    locale. La categoría de #204 («viaje», «enfermedad», «otro») NO se pide:
 *    `child_streak` no tiene columna para ella — la 0007 la dejó fuera a
 *    propósito— y recolectar lo que no se puede guardar es recolectar de más
 *    (D-013). Ver la nota en `lib/progreso.ts` § Pausa familiar.
 *  · Ninguna zona horaria ni fecha de «hoy»: el día efectivo lo calcula el
 *    servidor desde `users.timezone`, nunca del aparato (`mc-25`).
 *
 * ─── La validación vive en el motor ────────────────────────────────────────
 *
 * Los límites (21 días, 4 por año calendario, reparación hasta 5 días atrás)
 * los aplica `declararPausa()` de `packages/motor/src/racha.ts` y aquí no se
 * repite ni uno: una segunda copia del tope es cómo la pantalla y el motor
 * acaban discrepando. Lo que sí vive aquí es la idempotencia del transporte —
 * el motor es puro y cada llamada gasta un uso; el cable (`lib/progreso.ts`)
 * absorbe el reenvío del mismo formulario.
 *
 * ─── Formulario de verdad, no solo fetch ───────────────────────────────────
 *
 * La pantalla lo envía con un `<form method="post">` sin JavaScript (`mc-33`:
 * el script falla más de lo que nadie cree en el dispositivo de referencia).
 * Errores y éxito vuelven a la página con `terminarMal`/`terminarBien`; el
 * motivo viaja como clave cerrada en la URL, nunca como texto (ver
 * `lib/respuesta-de-formulario.ts`).
 */
import type { APIRoute } from "astro";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { declararPausaFamiliar } from "../../lib/progreso";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/** La página de la pausa, conservando el contexto del hijo si lo hay. */
function destino(locale: string, hijo: string, extra = "") {
  const parametros = [hijo ? `hijo=${encodeURIComponent(hijo)}` : "", extra]
    .filter(Boolean)
    .join("&");
  return `/${locale}/app/pausa/${parametros ? `?${parametros}` : ""}`;
}

export const POST: APIRoute = async ({ request, locals }) => {
  // `en` mientras no se sepa el locale real, como en `/api/perfil-nuevo`.
  let locale = "en";
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return terminarMal(request, destino(locale, ""), "sin_bindings", 503);

  // Declarar una pausa es una escritura, y `early data` es replicable (RFC 8470).
  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, destino(locale, ""), "reintenta", 425);
  }

  // ── Tiene que haber un adulto con sesión ─────────────────────────────────
  // La pausa la declara el padre, nunca el niño (#204, textual). Sin `mc_s` no
  // hay camino, igual que en `/api/perfil-nuevo`.
  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, destino(locale, ""), "sin_sesion", 401);

  let hijo = "", desde = "", hasta = "";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      hijo = String(j.hijo ?? "");
      desde = String(j.desde ?? "");
      hasta = String(j.hasta ?? "");
      locale = String(j.locale ?? "");
    } else {
      const f = await request.formData();
      hijo = String(f.get("hijo") ?? "");
      desde = String(f.get("desde") ?? "");
      hasta = String(f.get("hasta") ?? "");
      locale = String(f.get("locale") ?? "");
    }
  } catch {
    return terminarMal(request, destino(locale, ""), "cuerpo_ilegible");
  }

  if (!LOCALES.includes(locale)) return terminarMal(request, destino("en", hijo), "locale_invalido");

  const resultado = await declararPausaFamiliar(env, sesion.userId, {
    hijoId: hijo === "" ? null : hijo,
    desde,
    hasta,
    ahora: Date.now(),
  });

  if (resultado.ok === false) {
    // `sin_permiso` es 403: no es una petición mal formada, es una puerta
    // cerrada. Lo demás es 422 — la petición se entendió y el motor la rechazó
    // con un motivo que el padre puede leer en su idioma.
    const estado = resultado.motivo === "sin_permiso" ? 403 : resultado.motivo === "error_interno" ? 500 : 422;
    return terminarMal(request, destino(locale, hijo), resultado.motivo, estado);
  }

  return terminarBien(request, destino(locale, hijo, "declarada=1"));
};
