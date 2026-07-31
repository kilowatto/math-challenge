// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// Los siete locales (D-022). No cinco idiomas: es-MX y es-ES no comparten
// separador decimal, pt-BR y pt-PT no comparten escala numérica (mc-34).
// El auditor audits/locales-complete.mjs verifica que esta lista y la de
// wrangler.jsonc no se separen.
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

export default defineConfig({
  site: "https://math.kilowatto.com",
  adapter: cloudflare({ imageService: "compile" }),

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
      redirectToDefaultLocale: true,
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
