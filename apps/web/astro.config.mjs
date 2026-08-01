// @ts-check
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { redirecciones } from "./src/i18n/rutas-tabla.mjs";

/**
 * Escribe `dist/_redirects` con las 301 desde las URLs anteriores a D-049.
 *
 * Va aquí y no en `public/` porque un archivo en `public/` es una copia: se
 * escribe a mano una vez y se queda viejo la siguiente vez que alguien toque la
 * tabla de segmentos. Generarlo en cada build lo hace imposible de olvidar.
 *
 * `_redirects` es el formato de Cloudflare para redirecciones de assets, así
 * que estas son 301 de verdad —el navegador y el rastreador ven el código de
 * estado— y no un `<meta refresh>`, que Google trata como una señal débil.
 */
function redireccionesD049() {
  return {
    name: "mc-redirecciones-d049",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const lineas = redirecciones();
        const cabecera = [
          "# Generado por astro.config.mjs desde src/i18n/rutas-tabla.mjs (D-049).",
          "# NO editar a mano: se reescribe en cada build.",
          "#",
          "# Antes de D-049 los siete locales compartían el segmento español.",
          "# Estas URLs se publicaron y están en el sitemap; siguen resolviendo.",
          "",
        ];
        writeFileSync(
          fileURLToPath(new URL("_redirects", dir)),
          cabecera.concat(lineas).join("\n") + "\n",
          "utf8",
        );
        logger.info(`_redirects — ${lineas.length} redirección(es) 301 desde las URLs previas a D-049`);
      },
    },
  };
}

// Los siete locales (D-022). No cinco idiomas: es-MX y es-ES no comparten
// separador decimal, pt-BR y pt-PT no comparten escala numérica (mc-34).
// El auditor audits/locales-complete.mjs verifica que esta lista y la de
// wrangler.jsonc no se separen.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export default defineConfig({
  site: "https://math.kilowatto.com",
  adapter: cloudflare({ imageService: "compile" }),
  integrations: [redireccionesD049()],

  // D-033: mismo host, sitio en la raíz y app en rutas autenticadas, para que
  // la autoridad de dominio se concentre en un lugar (mc-48).
  output: "static",

  i18n: {
    defaultLocale: "en",
    locales: LOCALES,
    routing: {
      // `en` también lleva prefijo. Sin esto, la raíz sirve inglés sin ruta
      // propia y el hreflang recíproco de S0 no puede cerrar el ciclo.
      prefixDefaultLocale: true,
      // `false` a propósito. Con `true`, Astro genera su PROPIO stub en `/`
      // —`<meta http-equiv="refresh" content="2;url=/en/">`— que pisa a
      // `src/pages/index.astro` y es violación CRÍTICA de WCAG 2.2.1: un
      // refresco retardado le quita la página de debajo a quien lee despacio.
      // Encima el stub de Astro no lleva `lang`, así que falla también 3.1.1.
      //
      // Con `false`, la raíz la sirve nuestra página, que elige el locale del
      // navegador con `location.replace` y deja un enlace visible para quien no
      // tiene JavaScript.
      redirectToDefaultLocale: false,
    },
  },

  build: {
    // "directory" produce /en/index.html, que sirve en /en/ — la misma URL que
    // declaran el canonical y los hreflang del layout.
    //
    // Con "file" generaba /en.html: el navegador llegaba igual, pero el
    // canonical apuntaba a una URL distinta del archivo, y el ciclo de hreflang
    // no cerraba. Ese es exactamente el fallo que hace que Google ignore el
    // grupo de idiomas completo (mc-48 §3).
    format: "directory",
  },

  vite: {
    build: {
      // El presupuesto de bundle lo hace cumplir audits/bundle-budget.mjs.
      // Este aviso es la señal temprana, antes de que el auditor bloquee.
      chunkSizeWarningLimit: 150,
    },
  },
});
