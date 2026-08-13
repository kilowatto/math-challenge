/**
 * `GET /api/historia-datos` — lo que Modo Historia necesita para arrancar,
 * sin cargar otra página.
 *
 * ─── Por qué existe ────────────────────────────────────────────────────────
 *
 * Hasta ahora, entrar al mapa tras el PIN era una **navegación de página**:
 * `window.location.href` → el navegador tira la sesión de Phaser entera, carga
 * `kids/mapa.astro`, y se construye otra desde cero. Todo lo precargado se
 * perdía justo en la transición más frecuente del producto.
 *
 * Con una sola instancia de Phaser (`game/juego.ts`), esa navegación pasa a
 * ser un `scene.start("MenuScene", datos)`. Este endpoint es de dónde salen
 * esos datos: exactamente lo que `kids/mapa.astro` serializa hoy en
 * `#historia-datos`, servido como JSON.
 *
 * ─── Por qué un endpoint y no leer la isla de la otra página ───────────────
 *
 * La alternativa —pedir `kids/mapa.astro` con `fetch` y extraer su
 * `<script type="application/json">`— existe y funciona; es lo que hace
 * `game/spa/enrutador.ts` en la rama de la sesión paralela. Aquí se elige el
 * endpoint por tres razones concretas:
 *
 *  1. **No arrastra el HTML entero** de una página que nadie va a pintar.
 *  2. **No depende de la forma del marcado.** Un `id` renombrado en el
 *     componente rompe la extracción sin que nada falle al compilar.
 *  3. Es el patrón que ya funcionó en las fases del PIN (`/api/pin-datos`), y
 *     comparte con él la puerta de autorización de `lib/pin-acceso.ts`.
 *
 * ─── La autorización es la sesión del NIÑO, no la del hogar ────────────────
 *
 * A diferencia de los tres endpoints de PIN —que se autentican solo con el
 * dispositivo (`mc_h`), porque su trabajo es dejar entrar a alguien que aún
 * no ha entrado— aquí el niño YA está dentro: hay `mc_k`. Se exige esa cookie
 * y punto, igual que `kids/mapa.astro`, que redirige a la rejilla sin ella.
 */
import type { APIRoute } from "astro";
import { CABECERAS_PRIVADAS, json, localeSeguro } from "../../lib/pin-acceso.ts";
import { COOKIE_NINO, leerCookies, leerSesionNino } from "../../lib/sesiones.ts";
import { entradasDelArbol } from "../../lib/mapa-primaria.ts";
import { leerModelo } from "../../lib/aprendiz.ts";
import { construirArbol } from "../../../../../packages/motor/src/mapa.ts";
import enReto from "../../i18n/reto/en.json" with { type: "json" };
import esMXReto from "../../i18n/reto/es-MX.json" with { type: "json" };
import esESReto from "../../i18n/reto/es-ES.json" with { type: "json" };
import frFRReto from "../../i18n/reto/fr-FR.json" with { type: "json" };
import ptBRReto from "../../i18n/reto/pt-BR.json" with { type: "json" };
import ptPTReto from "../../i18n/reto/pt-PT.json" with { type: "json" };
import deDEReto from "../../i18n/reto/de-DE.json" with { type: "json" };
import en from "../../i18n/en.json" with { type: "json" };
import esMX from "../../i18n/es-MX.json" with { type: "json" };
import esES from "../../i18n/es-ES.json" with { type: "json" };
import frFR from "../../i18n/fr-FR.json" with { type: "json" };
import ptBR from "../../i18n/pt-BR.json" with { type: "json" };
import ptPT from "../../i18n/pt-PT.json" with { type: "json" };
import deDE from "../../i18n/de-DE.json" with { type: "json" };

export const prerender = false;

const CATALOGOS_RETO: Record<string, Record<string, unknown>> = {
  en: enReto, "es-MX": esMXReto, "es-ES": esESReto, "fr-FR": frFRReto,
  "pt-BR": ptBRReto, "pt-PT": ptPTReto, "de-DE": deDEReto,
};
const CATALOGOS: Record<string, Record<string, string>> = {
  en, "es-MX": esMX, "es-ES": esES, "fr-FR": frFR,
  "pt-BR": ptBR, "pt-PT": ptPT, "de-DE": deDE,
};

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  LEARNER_DO?: unknown;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env | undefined;
  if (!env?.DB || !env?.SESSION_KV) return json({ error: "sin_bindings" }, 503);

  const cookies = leerCookies(request.headers.get("cookie"));
  let nino = null;
  try {
    nino = await leerSesionNino(env.SESSION_KV, cookies[COOKIE_NINO]);
  } catch {
    nino = null;
  }
  // Sin sesión de niño no hay mapa que enseñar. Misma salida que
  // `kids/mapa.astro`, en JSON: la escena vuelve a la rejilla.
  if (!nino) return json({ error: "sin_sesion" }, 403);

  /**
   * La banda REAL, leída una vez. `null` o fallo de lectura cae a KINDER: ante
   * cualquier duda gana la banda más protegida, nunca al revés — el mismo
   * criterio que `kids/mapa.astro`.
   */
  let banda: string | null = null;
  let locale = "en";
  try {
    const fila = await env.DB.prepare(
      "SELECT theme_band, locale FROM child_profiles WHERE id = ? AND deleted_at IS NULL",
    )
      .bind(nino.childProfileId)
      .first<{ theme_band: string; locale: string }>();
    banda = fila?.theme_band ?? null;
    locale = localeSeguro(fila?.locale);
  } catch {
    banda = null;
  }

  const esPrimariaOMas = banda === "PRIMARIA" || banda === "SECUNDARIA";
  // Modo Historia en Phaser es de PRIMARIA en adelante (D-184). KINDER sigue
  // con la Sabana de siempre, que es otra pantalla y otro camino.
  if (!esPrimariaOMas) return json({ error: "sin_historia", banda }, 409);

  // `leerModelo` falla ABIERTO —devuelve `[]`— y aquí eso significa un mapa
  // entero por visitar, que es honesto: si no se pudo leer el progreso, no se
  // puede enseñar. El juego nunca se niega por esto.
  const resumen = await leerModelo(env.LEARNER_DO as never, nino.childProfileId);

  const catalogoReto = CATALOGOS_RETO[locale] ?? enReto;
  const habilidades: Record<string, string> = {};
  for (const clave of Object.keys(catalogoReto)) {
    if (clave.startsWith("habilidad.") && typeof catalogoReto[clave] === "string") {
      habilidades[clave.slice("habilidad.".length)] = catalogoReto[clave] as string;
    }
  }
  const arbol = construirArbol(entradasDelArbol(resumen, habilidades));

  const t = (clave: string, respaldo: string) =>
    typeof catalogoReto[clave] === "string" ? (catalogoReto[clave] as string) : respaldo;
  const m = CATALOGOS[locale] ?? en;
  const s = (clave: string) => m[clave] ?? en[clave] ?? "";

  return new Response(
    JSON.stringify({
      ok: true,
      arbol,
      // D-190: "camino" (tronco + secuencia + candado) para KINDER/PRIMARIA,
      // "arbol" para SECUNDARIA. Lo decide la banda REAL, nunca la escena
      // adivinándolo de otro dato.
      modo: banda === "SECUNDARIA" ? "arbol" : "camino",
      locale,
      puedeElegirNivel: esPrimariaOMas,
      rotulos: {
        eligeNivel: s("practicarEligeNivel"),
        nivelFacil: s("practicarNivelFacil"),
        nivelMedio: s("practicarNivelMedio"),
        nivelDificil: s("practicarNivelDificil"),
        jugar: s("historiaJugar"),
        menuHistoria: s("menuHistoria"),
        menuRetos: s("menuRetos"),
        retosTitulo: s("kidsRetosTitle"),
        retosCuerpo: s("kidsRetosBody"),
      },
      rotulosReto: {
        bien: t("juego.bien", "That's it!"),
        otra: t("juego.otra", "Not this time. Have another go."),
        siguiente: t("juego.siguiente", "Next"),
        salir: t("juego.salir", "Done for now"),
        cargando: t("juego.cargando", "Here it comes…"),
        mirar: t("juego.mirar", "Look!"),
        confirmar: t("juego.confirmar", "Ready!"),
        reintentar: t("juego.reintentar", "Try it again"),
        elige: t("juego.elige", "Tap one, then Ready."),
        escuchar: t("juego.escuchar", "Listen"),
        vozActivada: t("juego.vozActivada", "Voice on"),
        vozDesactivada: t("juego.vozDesactivada", "Voice off"),
        sinVoz: t("juego.sinVoz", "This device has no voice installed for this language, so Larry can’t read out loud here."),
        pendiente: t("juego.pendiente", "Saved on this device; it will be checked when you reconnect."),
      },
    }),
    { status: 200, headers: CABECERAS_PRIVADAS },
  );
};
