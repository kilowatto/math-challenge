/**
 * `POST /api/pin-desbloquear` — el adulto desbloquea el PIN de su hijo sin
 * esperar (D-202, consecuencia del límite de intentos).
 *
 * ─── Por qué existe ─────────────────────────────────────────────────────────
 *
 * `lib/pin-intentos.ts` documenta el diseño completo del límite; esta es la
 * mitad que le corresponde al adulto. El bloqueo se resuelve solo en 30
 * segundos — nadie TIENE que llamar a este endpoint para que el niño vuelva
 * a jugar— pero si el adulto está mirando (viene de tocar cinco veces sin
 * éxito, o le preguntó al niño y confirmó que sí es él) no tiene por qué
 * esperar los 30 segundos que existen para frenar a un desconocido, no a él.
 *
 * ─── La autorización, igual que `/api/pausa` ───────────────────────────────
 *
 * `SQL_PERFIL_PROPIO`: el perfil solo se toca si cuelga de la cuenta del
 * adulto con sesión (`parent_user_id`). La línea roja #2 hace al niño una
 * fila dentro de la cuenta del padre, así que «puede desbloquear» y «es su
 * padre» son la misma pregunta — el mismo patrón que `lib/progreso.ts`
 * aplica a la pausa familiar y que F8 aplica a `screen_time_settings`.
 *
 * ─── Formulario de verdad, no solo fetch ───────────────────────────────────
 *
 * Mismo motivo que `/api/pausa`: un `<form method="post">` sin JavaScript
 * (mc-33), con `terminarBien`/`terminarMal` decidiendo 303-y-redirección o
 * JSON según quién preguntó.
 */
import type { APIRoute } from "astro";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario";
import { leerSesionAdulto, COOKIE_ADULTO, leerCookies } from "../../lib/sesiones";
import { limpiarFallos } from "../../lib/pin-intentos";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

function destino(locale: string) {
  return `/${LOCALES.includes(locale) ? locale : "en"}/app/`;
}

const SQL_PERFIL_PROPIO = `
SELECT id FROM child_profiles
WHERE id = ? AND parent_user_id = ? AND deleted_at IS NULL
`.trim();

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return terminarMal(request, destino("en"), "sin_bindings", 503);

  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, destino("en"), "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, destino("en"), "sin_sesion", 401);

  let hijo = "", locale = "en";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      hijo = String(j.hijo ?? "");
      locale = String(j.locale ?? "en");
    } else {
      const f = await request.formData();
      hijo = String(f.get("hijo") ?? "");
      locale = String(f.get("locale") ?? "en");
    }
  } catch {
    return terminarMal(request, destino(locale), "cuerpo_ilegible");
  }

  if (!hijo) return terminarMal(request, destino(locale), "sin_hijo");

  const fila = await env.DB.prepare(SQL_PERFIL_PROPIO).bind(hijo, sesion.userId).first<{ id: string }>();
  if (!fila) return terminarMal(request, destino(locale), "no_es_tuyo", 403);

  await limpiarFallos(env.SESSION_KV, hijo);

  return terminarBien(request, destino(locale));
};
