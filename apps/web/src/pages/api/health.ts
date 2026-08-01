import type { APIRoute } from "astro";

/**
 * Salud de la plataforma. Existe para que "esqueleto de RPC nativo entre
 * Workers" de F0 sea comprobable y no una afirmación.
 *
 * Recorre el camino completo: math-challenge-web llama por service binding a
 * math-challenge-ingest, que a su vez consulta D1. Si esto responde, las tres
 * piezas están vivas y conectadas.
 *
 * `prerender = false` porque necesita el runtime: una página estática no tiene
 * bindings.
 */
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env;
  const started = Date.now();

  const report: Record<string, unknown> = {
    worker: "math-challenge-web",
    checkedAt: new Date().toISOString(),
  };

  // RPC nativo hacia math-challenge-ingest. Sin gRPC: Workers no puede hacer
  // llamadas gRPC salientes y el navegador no lo habla (D-030, mc-47 §1).
  // Esta llamada normalmente ni siquiera cruza una red.
  try {
    const pong = await env.INGEST.ping();
    const tables = await env.INGEST.schemaTableCount();
    report.ingest = { ok: true, ...pong, d1Tables: tables };
  } catch (err) {
    report.ingest = { ok: false, error: String(err) };
  }

  // D1 directo desde web, para distinguir "falla el binding" de "falla el RPC".
  try {
    const row = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    report.d1 = { ok: row?.ok === 1 };
  } catch (err) {
    report.d1 = { ok: false, error: String(err) };
  }

  report.elapsedMs = Date.now() - started;

  const healthy =
    (report.ingest as any)?.ok === true && (report.d1 as any)?.ok === true;

  return new Response(JSON.stringify(report, null, 2), {
    status: healthy ? 200 : 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Nunca cachear un chequeo de salud: un 200 viejo servido desde caché
      // durante una caída es peor que no tener chequeo.
      "cache-control": "no-store",
    },
  });
};
