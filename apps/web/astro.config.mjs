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
    // Un archivo por ruta en vez de directorio/index.html: menos redirecciones,
    // que en 4G lento cuestan un viaje redondo completo (mc-47 §3).
    format: "file",
  },

  vite: {
    build: {
      // El presupuesto de bundle lo hace cumplir audits/bundle-budget.mjs.
      // Este aviso es la señal temprana, antes de que el auditor bloquee.
      chunkSizeWarningLimit: 150,
    },
  },
});
