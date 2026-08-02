/**
 * `/sitemap.xml` — la lista completa de páginas públicas, en los 7 locales.
 *
 * ─── Por qué a mano y no `@astrojs/sitemap` ────────────────────────────────
 *
 * La integración oficial recorre lo que Astro emitió en `dist/`, y ahí no hay
 * forma de distinguir una portada de `/en/app/perfil/`: las dos son HTML. Este
 * sitio tiene rutas privadas y una raíz `noindex` que **no deben estar en el
 * sitemap** —un sitemap que promete una URL que redirige a la puerta de entrada
 * es una promesa rota, y Google la trata como error de calidad, no como
 * detalle—. La lista se construye de las mismas tablas que construyen las
 * páginas (`SEGMENTOS`, `loadCorpus`), así que no puede quedarse corta: si
 * mañana alguien añade una sección, aparece aquí sin tocar este archivo.
 *
 * ─── Lo que este archivo NO trae, a propósito ──────────────────────────────
 *
 *  - **Sin `<lastmod>`.** Una fecha inventada es peor que ninguna: Google
 *    aprendió a ignorar el campo justo porque medio internet lo pone al día de
 *    hoy en cada build. El día que exista una fecha real de cambio por página
 *    —no la del build— se añade.
 *  - **Sin `<priority>` ni `<changefreq>`.** Google dejó de leerlos en 2023 y
 *    Bing nunca los usó. Serían ruido que alguien tendría que mantener.
 *  - **Sin `xhtml:link` de alternativas.** El `hreflang` recíproco ya vive en
 *    el `<head>` de cada página y lo verifica `audits/hreflang-recip.mjs`.
 *    Duplicarlo aquí crearía un segundo lugar donde puede desincronizarse, y el
 *    síntoma de esa desincronización es que Google ignora el grupo de idiomas
 *    entero (mc-48 §3) — exactamente lo que el hreflang existe para evitar.
 *
 * ─── Lo que queda fuera y por qué ──────────────────────────────────────────
 *
 *  - `/` — es `<meta name="robots" content="noindex">` y solo redirige.
 *  - `/{locale}/app/**` — detrás de sesión. No se esconde con `Disallow` en
 *    robots.txt (eso publica la ruta); simplemente no se anuncia.
 *  - `/api/**` — no son páginas.
 *
 * Lo comprueba `audits/sitemap-completo.mjs` contra el `dist/` real, que es la
 * única forma de cazar una página construida y no anunciada.
 */
import type { APIRoute } from "astro";
import { LOCALES } from "../i18n";
import { SEGMENTOS, ruta, type Seccion } from "../i18n/rutas";
import { loadCorpus } from "../lib/corpus";

const SITIO = "https://math.kilowatto.com";

export const GET: APIRoute = () => {
  const docs = loadCorpus();
  const rutas: string[] = [];

  for (const locale of LOCALES) {
    rutas.push(`/${locale}/`);
    for (const seccion of Object.keys(SEGMENTOS[locale]) as Seccion[]) {
      rutas.push(ruta(locale, seccion));
    }
    // `reto-demo` no está en `SEGMENTOS` porque su segmento no se localiza
    // todavía (#323 cubre esa deuda). Se lista igual: es una página pública y
    // real, y omitirla del sitemap por una deuda de slugs la escondería.
    rutas.push(`/${locale}/reto-demo/`);
    for (const doc of docs) {
      rutas.push(ruta(locale, "investigacion", doc.slug));
    }
  }

  const cuerpo = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rutas.map((r) => `  <url><loc>${SITIO}${r}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(cuerpo, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
    },
  });
};
