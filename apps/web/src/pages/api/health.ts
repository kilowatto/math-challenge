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

export const GET: APIRoute = async ({ locals, request }) => {
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

  // La sesión de reto, contra el Durable Object REAL. Solo si se pide con
  // ?sesion=1: es una escritura, y un chequeo de salud que escribe en cada
  // sondeo de monitoreo crearía una sesión por minuto para siempre.
  if (new URL(request.url).searchParams.get("sesion") === "1") {
    try {
      report.sesion = await env.INGEST.pruebaDeHumoSesion(String(Date.now()));
    } catch (err) {
      report.sesion = { ok: false, error: String(err) };
    }
  }

  // El motor de reto de punta a punta, por RPC web→ingest. Solo con ?motor=1:
  // califica de verdad contra el banco, así que es la evidencia que el criterio
  // #34 de F3 pide — la llamada corriendo, no la afirmación de que corre.
  if (new URL(request.url).searchParams.get("motor") === "1") {
    try {
      const banco = await env.INGEST.tamanoDelBanco();
      // k11-3-4 es "3 + 4" con la plantilla K11. 7 acierta; 12 es multiplicar.
      const bien = await env.INGEST.calificarContraBanco("k11-3-4", 7);
      const mal = await env.INGEST.calificarContraBanco("k11-3-4", 12);
      const raro = await env.INGEST.calificarContraBanco("k11-3-4", 99);
      // `recordAttempt` de verdad, que es lo que el criterio #34 nombra. Banda
      // de adulto y skillId vacío para no meter nada falso en las métricas ni
      // tocar ninguna superficie de niño.
      const registrado = await env.INGEST.recordAttempt({
        childProfileId: "", itemId: "humo", skillId: "", correct: bien.acc,
        level: bien.nivel, responseTimeMs: 2000, themeBand: "SERIO", locale: "en",
      });
      // El rollup a D1 NO se prueba aquí, y la razón es buena: `score_totals`
      // tiene FOREIGN KEY a `child_profiles(id)`, así que un niño de humo es
      // rechazado por la base — `D1_ERROR: FOREIGN KEY constraint failed`.
      // Esa restricción es correcta y se queda. El rollup se verifica con sus
      // 10 casos unitarios y se probará de punta a punta cuando F2 cree el
      // primer perfil real.
      report.motor = {
        banco,
        acierto: { acc: bien.acc, causa: bien.causa },
        errorConCausa: { acc: mal.acc, causa: mal.causa },
        inesperada: { acc: raro.acc, inesperada: raro.inesperada },
        recordAttempt: { puntos: registrado.puntos, regla: registrado.regla, imposible: registrado.imposible },
      };
    } catch (err) {
      report.motor = { ok: false, error: String(err) };
    }
  }

  // D1 directo desde web, para distinguir "falla el binding" de "falla el RPC".
  try {
    const row = await (env.DB as D1Database).prepare("SELECT 1 AS ok").first<{ ok: number }>();
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
