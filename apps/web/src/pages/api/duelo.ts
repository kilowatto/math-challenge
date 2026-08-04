/**
 * `/api/duelo` — retar a un par de la propia liga. F7 #244, D-018, D-081.
 *
 * ─── Un verbo, y por qué solo uno ───────────────────────────────────────────
 *
 *   · **`?accion=retar`** — crea el `league_duel` con su set congelado, con
 *     TODOS los portones en la creación (`puedeRetar()` vía
 *     `lib/duelo-superficie.ts`, que es donde el auditor `duelo-elegibilidad`
 *     exige que vivan).
 *
 * Jugar la mitad NO es un verbo de esta ruta: el duelo es el MISMO reto de
 * siempre contra el `item_set` congelado, y se juega en `/api/jugar` con
 * `duelo` en el cuerpo — duplicar el bucle aquí sería la segunda copia que se
 * queda sin los arreglos de la primera.
 *
 * ─── Quién entra ─────────────────────────────────────────────────────────────
 *
 * Un niño con sesión `mc_k` o un adulto con `mc_s`, como en `/api/jugar`. La
 * elegibilidad fina —banda, edad, opt-in, tope— la decide el motor en cada
 * llamada, nunca el cliente.
 *
 * ─── Formulario de verdad, respuesta de verdad ──────────────────────────────
 *
 * El botón «Retar» de la pantalla de liga es un `<form method="post">` sin
 * JavaScript (un aparato de gama baja tiene que poder retar aunque el script
 * no cargue, `mc-47` §5), así que la respuesta es 303 de vuelta a la pantalla
 * de liga — `respuesta-de-formulario.ts` documenta el bug que nace de
 * contestar JSON a un formulario.
 *
 * Y el fallo es silencioso a propósito: si el reto no se crea —el rival no
 * tiene el opt-in, ya son tres pendientes, la edad no llega— se vuelve a la
 * misma pantalla sin mensaje. El motivo es una clave interna; enseñar «este
 * niño no acepta duelos» sería un mensaje sobre OTRO niño, y esa es la clase
 * de cosa que D-081 cierra.
 *
 * ─── El nombre del archivo no lleva «liga», como `optin-hijo.ts` ────────────
 *
 * `audits/liga-ascenso-determinista.mjs` prohíbe `Date.now(` en todo archivo
 * cuya ruta diga «liga»; esta ruta es transporte y necesita el reloj del
 * servidor. La lógica de liga vive en `lib/duelo-superficie.ts`, que recibe
 * `ahora` por parámetro.
 */
import type { APIRoute } from "astro";
import {
  COOKIE_ADULTO,
  COOKIE_NINO,
  leerCookies,
  leerSesionAdulto,
  leerSesionNino,
  nuevoToken,
} from "../../lib/sesiones.ts";
import { retarADuelo, ITEMS_POR_DUELO } from "../../lib/duelo-superficie.ts";
import { bancoPrimariaD1 } from "../../lib/banco-primaria.ts";

export const prerender = false;

interface Env {
  DB?: D1Database;
  SESSION_KV?: KVNamespace;
  INGEST?: { catalogoAdaptativo(): Promise<Array<{ id: string }>> };
}

// La misma lista que `i18n/index.ts`, escrita aquí como hace `optin-hijo.ts`:
// importar `isLocale` arrastraría los siete JSON de mensajes.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const redirigir = (destino: string) =>
  new Response(null, { status: 303, headers: { location: destino } });

/**
 * A dónde vuelve el formulario. Solo se acepta una ruta de liga del propio
 * sitio; cualquier otra cosa cae a la pantalla de liga de quien llamó — un
 * `volver` libre sería un redirect abierto.
 */
function destinoDe(volver: string | null, locale: string, esAdulto: boolean): string {
  if (volver !== null && /^\/(en|es-MX|es-ES|fr-FR|pt-BR|pt-PT|de-DE)\/app\/liga\//.test(volver)) {
    return volver;
  }
  return esAdulto ? `/${locale}/app/liga/` : `/${locale}/app/liga/jugador/`;
}

export const POST: APIRoute = async ({ request, locals, url }) => {
  const env = (locals as { runtime?: { env: Env } }).runtime?.env;

  // El cuerpo: formulario o JSON, como el resto de endpoints de la casa.
  let rival: string | null = null;
  let volver: string | null = null;
  let locale = "en";
  const tipo = request.headers.get("content-type") ?? "";
  try {
    if (tipo.includes("application/x-www-form-urlencoded") || tipo.includes("multipart/form-data")) {
      const datos = await request.formData();
      rival = typeof datos.get("rival") === "string" ? String(datos.get("rival")) : null;
      volver = typeof datos.get("volver") === "string" ? String(datos.get("volver")) : null;
      const l = datos.get("locale");
      if (typeof l === "string" && LOCALES.includes(l)) locale = l;
    } else {
      const datos = (await request.json()) as Record<string, unknown>;
      if (typeof datos.rival === "string") rival = datos.rival;
      if (typeof datos.volver === "string") volver = datos.volver;
      if (typeof datos.locale === "string" && LOCALES.includes(datos.locale)) locale = datos.locale;
    }
  } catch {
    rival = null;
  }

  const cookies = leerCookies(request.headers.get("cookie"));
  let quien: { id: string; esAdulto: boolean } | null = null;
  if (env?.SESSION_KV) {
    const nino = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
    if (nino) quien = { id: nino.childProfileId, esAdulto: false };
    if (!quien) {
      const adulto = await leerSesionAdulto(env.SESSION_KV, cookies[COOKIE_ADULTO]);
      if (adulto) quien = { id: adulto.userId, esAdulto: true };
    }
  }
  // Sin sesión no hay ni redirect útil: a la puerta de entrada.
  if (!quien) return redirigir(`/${locale}/entrar/`);
  if (!env?.DB) return redirigir(destinoDe(volver, locale, quien.esAdulto));

  const accion = url.searchParams.get("accion");
  if (accion !== "retar" || rival === null) {
    return redirigir(destinoDe(volver, locale, quien.esAdulto));
  }

  /**
   * Los ítems del set: el banco de primaria en D1 (D-072), con el respaldo de
   * la ingesta si este ambiente todavía no lo tiene sembrado — nunca se le
   * niega el juego a nadie por infraestructura. `catalogoAdaptativo` lee solo
   * columnas, así que el catálogo de mensajes va vacío: los textos hacen
   * falta al PRESENTAR, no al elegir ids.
   */
  let ids: string[] = [];
  try {
    ids = (await bancoPrimariaD1(env.DB, {}).catalogoAdaptativo()).map((e) => e.id);
    if (ids.length < ITEMS_POR_DUELO && env.INGEST) {
      ids = (await env.INGEST.catalogoAdaptativo()).map((e) => e.id);
    }
  } catch {
    ids = [];
  }

  // El resultado no se lee: creado o no, se vuelve a la misma pantalla, y el
  // duelo —si se creó— está ahí esperando su turno. Ver el encabezado.
  await retarADuelo(env, quien, rival, ids, `ld:${nuevoToken()}`, Date.now());

  return redirigir(destinoDe(volver, locale, quien.esAdulto));
};
