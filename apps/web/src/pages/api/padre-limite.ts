/**
 * `/api/padre-limite` — leer y guardar el límite de pantalla de un hijo (F8 #269).
 *
 * ─── POST: guardar la configuración ──────────────────────────────────────────
 *
 * El formulario de `/[locale]/app/parent/screen-time/[childId]` llega aquí.
 * La validación es del SERVIDOR con la misma función que limita el HTML
 * (`minutosDiariosPermitidos()` del motor): el `<input type="range"
 * min/max/step>` impide el valor fuera de rango en el navegador, y aquí no se
 * confía en el navegador — una petición directa con 600 minutos se rechaza
 * citando el rango (`minutos_fuera_de_rango:10-45`).
 *
 * Con o sin fila previa en `screen_time_settings`: el primer guardado la crea
 * (upsert, §5.5 del plan), porque `setup/screen-time` de F2 nunca se construyó
 * y ningún perfil real tiene fila. Cada guardado registra el consentimiento
 * `SCREEN_TIME` en `child_consents` (D-051, §5.4), en el mismo batch.
 *
 * ─── GET: los minutos de hoy, para el refresco de ~30 s ─────────────────────
 *
 * `?hijo=<id>&locale=<locale>` → `{ ok, jugados, limite }`, ya formateados con
 * `formatear()` en el locale pedido: el script de la pantalla solo cambia el
 * texto, no formatea números (esa es la regla, y los enteros ≤90 no la hacen
 * menos regla). No es un contador segundo a segundo: la pantalla lo pide al
 * abrirse y cada ~30 s si queda abierta (`mc-26` implicación #11, §5.2).
 *
 * ─── Quién entra, y quién no ─────────────────────────────────────────────────
 *
 * Las dos operaciones exigen `mc_s` y verifican que el `childId` pertenece al
 * `parent_user_id` de la sesión (línea roja #2: el padre ve a SUS hijos). Un
 * `childId` que no existe o es de otra cuenta produce el mismo 404 — quien
 * prueba ids ajenos no aprende cuáles existen. Es el mismo patrón de
 * autorización que el resto de rutas de perfil de niño.
 *
 * ─── Por qué las importaciones llevan `.ts` explícita ────────────────────────
 *
 * `padre-limite.prueba.mjs` carga ESTE módulo con `node
 * --experimental-strip-types` para probar el camino de la ruta de verdad
 * (sesión falsa en KV de mentira, D1 sobre `node:sqlite`), y ese loader no
 * resuelve rutas sin extensión. En el resto de `apps/web` la convención es sin
 * extensión porque solo Vite las carga; aquí pesa más poder probar el endpoint.
 */
import type { APIRoute } from "astro";
import { COOKIE_ADULTO, leerCookies, leerSesionAdulto } from "../../lib/sesiones.ts";
import { terminarBien, terminarMal } from "../../lib/respuesta-de-formulario.ts";
import { rutaCasa, rutaLimiteHijo } from "../../lib/rutas-app.ts";
import { estadoDelLimite, guardarLimite, hijoDelPadre } from "../../lib/padre-limite.ts";
import { zonaDelHogar } from "../../lib/progreso.ts";
import { formatear } from "../../../../../packages/motor/src/numeros.ts";
import { diaEfectivo } from "../../../../../packages/motor/src/tiempo-local.ts";
import { tieneLimite } from "../../../../../packages/motor/src/limite-pantalla.ts";
import type { TemaVisual } from "../../../../../packages/motor/src/bandas.ts";
import type { Locale } from "../../i18n/index.ts";

export const prerender = false;

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

// La misma lista que `i18n/index.ts`, escrita aquí como hace `perfil-nuevo.ts`:
// importar `isLocale` arrastraría los siete JSON de mensajes, y la prueba de
// esta ruta corre con `node --experimental-strip-types`, que no carga JSON sin
// atributos de importación.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Los minutos de hoy y la configuración dependen de la sesión: jamás se
      // cachean, ni aquí ni en ningún intermediario.
      "cache-control": "no-store, private",
    },
  });

/**
 * `childId` inexistente o ajeno: el mismo 404 para los dos, en GET y en POST.
 * Un 403 distinguiría «existe pero no es tuyo» de «no existe», y esa
 * distinción es información sobre las cuentas de otras familias.
 */
const noEncontrado = () => json({ ok: false, motivo: "perfil_desconocido" }, 404);

// ─── GET: «hoy jugó X de Y minutos», ya formateado ───────────────────────────

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) return json({ ok: false, motivo: "sin_sesion" }, 401);

  const params = new URL(request.url).searchParams;
  const childId = params.get("hijo") ?? "";
  const localePedido = params.get("locale") ?? "en";
  const locale = (LOCALES.includes(localePedido) ? localePedido : "en") as Locale;

  const hijo = await hijoDelPadre(env.DB, sesion.userId, childId);
  if (!hijo) return noEncontrado();
  // El CHECK de la 0002 restringe la columna a las tres bandas de niño; la
  // comprobación de verdad es `tieneLimite`, no el casteo.
  const banda = hijo.theme_band as TemaVisual;
  if (!tieneLimite(banda)) return noEncontrado();

  // La zona es la del HOGAR (`users.timezone`), nunca la del aparato desde el
  // que el padre consulta: «hoy» tiene que ser el mismo día que cuenta la
  // racha y el que aplica el límite (migración 0011, línea roja #6).
  const zona = await zonaDelHogar(env, { id: sesion.userId, esAdulto: true });
  const estado = await estadoDelLimite(
    env.DB,
    hijo.id,
    banda,
    diaEfectivo(Date.now(), zona),
  );

  return json({
    ok: true,
    jugados: formatear(estado.minutosUsados, locale),
    limite: formatear(estado.config.daily_minutes, locale),
  });
};

// ─── POST: guardar la configuración ──────────────────────────────────────────

export const POST: APIRoute = async ({ request, locals }) => {
  // `en` mientras no se sepa el locale real, igual que en `perfil-nuevo.ts`:
  // las primeras comprobaciones fallan antes de leer el cuerpo.
  let locale = "en";
  const env = (locals as { runtime?: { env?: Env } }).runtime?.env;
  if (!env?.DB || !env?.SESSION_KV) return json({ ok: false, motivo: "sin_bindings" }, 503);

  // Guardar es una escritura, y `early data` es replicable (RFC 8470): sin
  // esto, reenviar los bytes del 0-RTT reescribiría la configuración.
  if (request.headers.get("early-data") === "1") {
    return terminarMal(request, rutaCasa(locale), "reintenta", 425);
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  const sesion = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
  if (!sesion) {
    // A la casa: ella misma manda a `/entrar/?cambiar=1` cuando no hay sesión,
    // y los segmentos de esa puerta cambian por locale (D-049) — escribirlos
    // aquí sería una segunda copia de la tabla.
    return terminarMal(request, rutaCasa(locale), "sin_sesion", 401);
  }

  let childId = "";
  let minutos = NaN;
  let corteNocturno = false;
  let bedtimeLocal = "";
  try {
    const tipo = request.headers.get("content-type") ?? "";
    if (tipo.includes("application/json")) {
      const j = (await request.json()) as Record<string, unknown>;
      childId = String(j.hijo ?? "");
      minutos = Number(j.daily_minutes);
      corteNocturno = j.corte_nocturno === true || j.corte_nocturno === "on";
      bedtimeLocal = String(j.bedtime_local ?? "");
      locale = String(j.locale ?? "");
    } else {
      const f = await request.formData();
      childId = String(f.get("hijo") ?? "");
      minutos = Number(f.get("daily_minutes"));
      // El checkbox solo viaja si va marcado: ausente = apagado = NULL.
      corteNocturno = f.get("corte_nocturno") !== null;
      bedtimeLocal = String(f.get("bedtime_local") ?? "");
      locale = String(f.get("locale") ?? "");
    }
  } catch {
    return terminarMal(request, rutaCasa(locale), "cuerpo_ilegible");
  }
  if (!LOCALES.includes(locale)) locale = "en";

  const hijo = await hijoDelPadre(env.DB, sesion.userId, childId);
  if (!hijo) return noEncontrado();

  const resultado = await guardarLimite(env.DB, {
    hijo,
    parentUserId: sesion.userId,
    dailyMinutes: minutos,
    corteNocturno,
    bedtimeLocal,
    ahora: Math.floor(Date.now() / 1000),
  });

  const volverA = rutaLimiteHijo(locale, hijo.id);
  if (!resultado.ok) return terminarMal(request, volverA, resultado.motivo);

  // `?guardado=1` para que la pantalla confirme. 303 si vino de un formulario,
  // JSON si vino de `fetch` — ver `lib/respuesta-de-formulario.ts`.
  return terminarBien(request, `${volverA}?guardado=1`, [], { ok: true });
};
