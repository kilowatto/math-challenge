/**
 * `/api/liga-optin` — el padre activa o apaga la liga de un hijo. F7 #243,
 * D-040, D-081.
 *
 * ─── Qué es esto ────────────────────────────────────────────────────────────
 *
 * El consentimiento `LEAGUE` vive en `child_consents`: la ausencia de fila es
 * el default (apagado en la banda más chica, encendido de PRIMARIA en
 * adelante), y una fila revocada es un «no» explícito que manda sobre el
 * default en cualquier banda. Este endpoint es la única puerta que escribe ese
 * consentimiento:
 *
 *   · `accion=activar` → `otorgarLiga()`: inserta la fila, o la reactiva si
 *     estaba revocada (la llave es compuesta; nunca hay dos).
 *   · `accion=revocar` → `revocarLiga()`: revoca —`revoked_at`, jamás
 *     `DELETE`— y primero saca al perfil de la tabla viva del Durable Object,
 *     porque `olvidarEnLiga` no falla abierto y el orden importa.
 *
 * La lógica vive en `lib/liga-membresia.ts`; aquí hay sesión, autorización y
 * respuesta, y nada más — el mismo contrato que `api/padre-limite.ts`.
 *
 * ─── Quién entra, y quién no ────────────────────────────────────────────────
 *
 * Exige `mc_s` y verifica que el perfil cuelga de ESTA cuenta (`perfilPropio`,
 * línea roja #2: el niño es una fila dentro de la cuenta del padre). Un
 * `hijo` que no existe o es de otra cuenta produce el mismo 404: quien prueba
 * ids ajenos no aprende cuáles existen.
 *
 * ─── Formulario de verdad, respuesta de verdad ──────────────────────────────
 *
 * El interruptor de la casa es un `<form method="post">` sin JavaScript (un
 * aparato de gama baja tiene que poder apagar la liga aunque el script no
 * cargue, `mc-47` §5), así que la respuesta es 303 de vuelta a la vista de
 * hijos — `respuesta-de-formulario.ts` documenta el bug que nace de contestar
 * JSON a un formulario.
 *
 * ─── Por qué las importaciones llevan `.ts` explícita ────────────────────────
 *
 * La prueba del módulo corre con `node --experimental-strip-types`, que no
 * resuelve rutas sin extensión. Misma convención que `api/padre-limite.ts`.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario.ts";
import { perfilPropio } from "../../lib/progreso.ts";
import { otorgarLiga, revocarLiga } from "../../lib/liga-membresia.ts";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV?: KVNamespace;
  LEAGUE_DO?: DurableObjectNamespace;
}

// La misma lista que `i18n/index.ts`, escrita aquí como hace `padre-limite.ts`:
// importar `isLocale` arrastraría los siete JSON de mensajes.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;
  const volverA = (locale: string) => `/${locale}/app/?vista=hijos`;

  // El cuerpo: formulario o JSON, como el resto de endpoints de la casa.
  let hijo: string | null = null;
  let accion: string | null = null;
  let locale = "en";
  const tipo = request.headers.get("content-type") ?? "";
  try {
    if (tipo.includes("application/x-www-form-urlencoded") || tipo.includes("multipart/form-data")) {
      const datos = await request.formData();
      hijo = typeof datos.get("hijo") === "string" ? String(datos.get("hijo")) : null;
      accion = typeof datos.get("accion") === "string" ? String(datos.get("accion")) : null;
      const l = datos.get("locale");
      if (typeof l === "string" && LOCALES.includes(l)) locale = l;
    } else {
      const datos = (await request.json()) as Record<string, unknown>;
      if (typeof datos.hijo === "string") hijo = datos.hijo;
      if (typeof datos.accion === "string") accion = datos.accion;
      if (typeof datos.locale === "string" && LOCALES.includes(datos.locale)) locale = datos.locale;
    }
  } catch {
    return terminarMal(request, volverA(locale), "forma_invalida");
  }

  if (!env?.SESSION_KV || !env.DB) return terminarMal(request, volverA(locale), "reintenta", 503);

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return terminarMal(request, volverA(locale), "sin_sesion", 401);

  if (!hijo || (accion !== "activar" && accion !== "revocar")) {
    return terminarMal(request, volverA(locale), "forma_invalida");
  }

  // La autorización entera es esta consulta: el perfil cuelga de ESTA cuenta o
  // no existe. El mismo 404 para los dos casos, como en `padre-limite`.
  const propio = await perfilPropio(env, hijo, sesion.userId);
  if (!propio) return terminarMal(request, volverA(locale), "sin_permiso", 404);

  if (accion === "activar") {
    const ok = await otorgarLiga(env, hijo, sesion.userId, Date.now());
    if (!ok) return terminarMal(request, volverA(locale), "reintenta", 500);
  } else {
    const r = await revocarLiga(env, hijo, sesion.userId, Date.now());
    // `no_se_pudo_olvidar`: el objeto no confirmó la salida de la tabla viva y
    // D1 no se tocó. El padre reintenta; no queda nada a medias.
    if (!r.ok) return terminarMal(request, volverA(locale), "reintenta", 500);
  }

  return terminarBien(request, volverA(locale));
};
