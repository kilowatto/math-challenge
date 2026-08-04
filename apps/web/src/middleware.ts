/**
 * Middleware de Astro — el único lugar donde las respuestas del Worker pasan
 * todas por el mismo código (issue #337).
 *
 * ─── Qué hace ──────────────────────────────────────────────────────────────
 *
 * Pone las seis cabeceras de seguridad en TODA respuesta que el Worker genera:
 * `/app/**` (el área privada), `/api/**` (sesión, passkeys, el reto) y las
 * páginas SSR fuera de esos prefijos (`/{locale}/sign-in/`, los 302 de
 * redirección al entrar). `public/_headers` solo alcanza los assets estáticos;
 * sin este middleware, la parte con la sesión y los datos de los menores era
 * exactamente la que quedaba sin CSP ni `Permissions-Policy`.
 *
 * Las páginas prerrenderizadas NO pasan por aquí — las sirve el binding de
 * assets antes de tocar el Worker— y siguen cubiertas por `_headers`. Los dos
 * textos los mantiene iguales `audits/cabeceras-ssr.mjs`.
 *
 * ─── Lo que NO hace ────────────────────────────────────────────────────────
 *
 * No toca `Cache-Control`: cada ruta pone su propio `no-store` a propósito, y
 * sobrescribirlo aquí podría apagarlo en una ruta nueva que olvidara ponerlo…
 * o peor, prenderlo. La regla es la de siempre: cabeceras de seguridad aquí,
 * cabeceras de caché en cada ruta.
 */
import { defineMiddleware } from "astro:middleware";
import { CABECERAS_SEGURIDAD } from "./lib/cabeceras-seguridad";

export const onRequest = defineMiddleware(async (_context, next) => {
  const respuesta = await next();
  for (const [nombre, valor] of Object.entries(CABECERAS_SEGURIDAD)) {
    respuesta.headers.set(nombre, valor);
  }
  return respuesta;
});
