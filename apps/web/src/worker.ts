/**
 * El punto de entrada del Worker. Existe por UNA razón: exportar la clase del
 * Durable Object del limitador de tasa (criterio #113).
 *
 * ─── El contrato del adaptador, que no es el de un Worker normal ───────────
 *
 * Un Durable Object tiene que ser una **exportación con nombre del módulo raíz
 * del Worker** — no puede vivir dentro de una ruta de Astro.
 *
 * Pero el adaptador de Cloudflare **no espera un `export default`**: espera
 * `createExports(manifest, args)` y usa lo que devuelva. Se ve en el archivo que
 * genera:
 *
 *     const _exports = createExports(_manifest, _args);
 *     const __astrojsSsrVirtualEntry = _exports.default;
 *     const RateLimiter = _exports['RateLimiter'];
 *
 * Exportar un `default` deja `createExports` sin definir y el despliegue muere
 * con **`Uncaught TypeError: (void 0) is not a function`** — medido, dos veces,
 * antes de leer el archivo del adaptador.
 *
 * `namedExports` en `astro.config.mjs` es lo que le dice al empaquetado que
 * conserve `RateLimiter`; sin esa lista lo tira por no estar referenciado.
 */
import { App } from "astro/app";
import { handle } from "@astrojs/cloudflare/handler";
import { RateLimiter } from "./lib/ratelimiter";
import { Aprendiz } from "./lib/aprendiz";
import { Liga } from "./lib/liga-do";

export function createExports(manifest: ConstructorParameters<typeof App>[0]) {
  const app = new App(manifest);
  return {
    default: {
      fetch: (request: Request, env: never, context: ExecutionContext) =>
        handle(manifest, app, request, env, context),
    },
    // Las clases de los Durable Objects viajan aquí, junto al manejador. Cada
    // una que se añada tiene que estar TAMBIÉN en `namedExports` de
    // `astro.config.mjs` y en `migrations` de `wrangler.jsonc` — son tres
    // sitios y olvidar cualquiera de los tres rompe el despliegue distinto.
    RateLimiter,
    Aprendiz,
    Liga,
  };
}
