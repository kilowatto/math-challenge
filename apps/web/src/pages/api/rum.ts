import type { APIRoute } from "astro";

/**
 * Recolección de Core Web Vitals de campo (D-037).
 *
 * **Sin beacon de terceros.** Cloudflare Web Analytics habría sido el camino
 * corto, pero mete una petición a `cloudflareinsights.com` y F0 se cerró con
 * *cero peticiones a terceros* verificado en vivo. Medimos nosotros: un script
 * de ~600 bytes en línea usa `PerformanceObserver` —la misma API de la que sale
 * el dato de Chrome— y lo manda aquí. El dato nunca sale de nuestra
 * infraestructura, y quién se mide lo decidimos nosotros, no un proveedor.
 *
 * **Va a Analytics Engine, no a D1** (`mc-32` riesgo #1): es telemetría de alto
 * volumen y alta cardinalidad, y D1 topa en 10 GB.
 *
 * Lo que este endpoint NO acepta, y es la mitad del diseño:
 *   · Nada que identifique a una persona. Ni id, ni sesión, ni IP, ni
 *     user-agent completo. Se guarda la banda y el locale, y nada más.
 *   · **Nada desde una superficie de niño.** El cliente ni siquiera carga el
 *     script ahí, y aquí se rechaza otra vez por si alguien llama a mano —
 *     fallar cerrado en los dos extremos, porque el barato es perder una
 *     medición y el caro es instrumentar a un menor (línea roja #2).
 */
export const prerender = false;

/** Umbrales de D-030. Se evalúan a p75, que es como los evalúa Google. */
const METRICAS = new Set(["LCP", "CLS", "INP", "TTFB", "FCP"]);

/** Bandas que jamás se miden en campo (D-037). */
const BANDAS_DE_NINO = new Set(["KINDER", "PRIMARIA"]);

const BANDAS = new Set(["SECUNDARIA", "SERIO", "JR", "PRO", "PUBLICO"]);

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env;

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { metrica, valor, banda, locale } = (cuerpo ?? {}) as Record<string, unknown>;

  // Fallar cerrado en el servidor también. El cliente ya no carga el script en
  // superficies de niño; esto cubre la llamada a mano y el error de despliegue.
  if (typeof banda !== "string" || BANDAS_DE_NINO.has(banda) || !BANDAS.has(banda)) {
    return new Response(null, { status: 204 });
  }
  if (typeof metrica !== "string" || !METRICAS.has(metrica)) {
    return new Response(null, { status: 204 });
  }
  if (typeof valor !== "number" || !Number.isFinite(valor) || valor < 0 || valor > 600_000) {
    return new Response(null, { status: 204 });
  }

  try {
    env?.VITALS_AE?.writeDataPoint({
      // Sin nada que identifique a nadie: métrica, banda, locale y país.
      // El país lo pone Cloudflare y es de grano grueso; sirve para saber si el
      // problema es de red o de dispositivo, que es la pregunta de mc-47.
      blobs: [
        metrica,
        banda,
        typeof locale === "string" && locale.length <= 8 ? locale : "?",
        (request as any).cf?.country ?? "?",
      ],
      doubles: [valor],
      // El índice acota la cardinalidad: por métrica, no por usuario.
      indexes: [metrica],
    });
  } catch {
    // La telemetría nunca rompe una página. Si falla, se pierde el dato.
  }

  return new Response(null, { status: 204 });
};
