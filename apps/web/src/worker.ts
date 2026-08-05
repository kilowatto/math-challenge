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
import { Salon } from "./lib/classroom-do";
import { Misiones } from "./lib/missions-do";
import { cicloDeRecordatorios, type EntornoPush } from "./lib/push-envio";
import {
  cicloDeReportes,
  consumirColaReportes,
  type EntornoReportes,
  type MensajeReporte,
} from "./lib/reportes-envio";

export function createExports(manifest: ConstructorParameters<typeof App>[0]) {
  const app = new App(manifest);
  return {
    default: {
      fetch: (request: Request, env: never, context: ExecutionContext) =>
        handle(manifest, app, request as unknown as Parameters<typeof handle>[2], env, context),
      /**
       * DOS crones comparten este manejador (`triggers.crons` de
       * `wrangler.jsonc`), y se distinguen por `event.cron`:
       *
       *  · El de CADA 30 MINUTOS — el recordatorio push al padre (F7 #207,
       *    D-105). Vive en ESTE Worker y no en `math-challenge-ingest` —que
       *    ya tiene su `scheduled()` del ciclo de liga— porque el suscribirse,
       *    el copy y la clave pública VAPID son todos de la superficie del
       *    padre, que es este Worker; el remitente necesita las mismas claves
       *    que la ruta `/api/push` ya publica, y duplicar VAPID en dos
       *    Workers es un secreto más que rotar.
       *
       *  · El de CADA HORA EN PUNTO — los reportes por correo (F8 #289). Se
       *    queda en ESTE Worker por las mismas razones que el push: la
       *    preferencia, la baja y el binding `EMAIL` son de esta superficie.
       *    Solo enumera y encola en `math-challenge-reports-queue` — nunca
       *    renderiza ni envía inline, para no arriesgar el presupuesto de CPU
       *    del cron con muchos hogares elegibles a la misma hora.
       *
       * `waitUntil` y no `await`: el evento programado no tiene respuesta que
       * esperar, y sin `waitUntil` el isolate puede morir a medio envío.
       *
       * Sin claves VAPID —o sin cola de reportes— el ciclo correspondiente
       * degrada en silencio (no envía, no rompe): es el estado de hoy, hasta
       * que el orquestador instale el secreto y cree la cola.
       */
      scheduled: (event: ScheduledController, env: EntornoPush & EntornoReportes, context: ExecutionContext) =>
        context.waitUntil(
          event.cron === "0 * * * *"
            ? cicloDeReportes(env, event.scheduledTime).then(() => undefined)
            : cicloDeRecordatorios(env, event.scheduledTime),
        ),
      /**
       * El consumidor de `math-challenge-reports-queue` (F8 #289): lee los
       * datos del hogar, llama `construirReporteHogar()`, renderiza la
       * plantilla del locale del padre y envía con el binding `EMAIL`. La
       * actualización de `last_sent_at` y de `child_report_state` va DESPUÉS
       * del envío confirmado, nunca antes.
       */
      queue: (batch: MessageBatch<MensajeReporte>, env: EntornoReportes) =>
        consumirColaReportes(batch, env),
    },
    // Las clases de los Durable Objects viajan aquí, junto al manejador. Cada
    // una que se añada tiene que estar TAMBIÉN en `namedExports` de
    // `astro.config.mjs` y en `migrations` de `wrangler.jsonc` — son tres
    // sitios y olvidar cualquiera de los tres rompe el despliegue distinto.
    RateLimiter,
    Aprendiz,
    Liga,
    Misiones,
    Salon,
  };
}
