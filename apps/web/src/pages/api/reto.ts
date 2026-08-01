/**
 * La API del reto. El servidor sirve el ítem y califica la respuesta.
 *
 * Es lo que conecta la pantalla con el motor, y la razón por la que existe como
 * endpoint y no como lógica en el cliente está en `audits/puntaje-servidor.mjs`:
 * si la fórmula de D-010 viaja al navegador, cualquiera la lee y sabe qué
 * mandar. El cliente manda **una elección**; el servidor devuelve un veredicto.
 *
 * **Sin telemetría de niño** (D-037, línea roja #2): este endpoint no escribe a
 * ningún beacon, y `recordAttempt` rechaza las bandas de niño del lado del
 * servidor.
 *
 * **Sin texto libre** (línea roja #3): `eleccion` es el valor de una opción que
 * el servidor sirvió, no prosa.
 */
import type { APIRoute } from "astro";

export const prerender = false;

interface Env {
  INGEST: {
    calificarContraBanco(
      itemId: string,
      eleccion: number | string,
    ): Promise<{ acc: 0 | 1; causa: string | null; razonAlterna: string | null; inesperada: boolean; nivel: number; habilidad: string }>;
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env as Env;

  let cuerpo: { itemId?: unknown; eleccion?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "cuerpo ilegible" }, 400);
  }

  const itemId = typeof cuerpo.itemId === "string" ? cuerpo.itemId : null;
  const eleccion = cuerpo.eleccion;

  if (!itemId) return json({ error: "falta itemId" }, 400);
  if (typeof eleccion !== "string" && typeof eleccion !== "number") {
    return json({ error: "eleccion tiene que ser texto o número" }, 400);
  }

  // La elección se acota a algo corto: un niño toca un botón, no escribe un
  // ensayo. Es la línea roja #3 hecha límite de bytes, no solo de intención.
  if (typeof eleccion === "string" && eleccion.length > 32) {
    return json({ error: "eleccion demasiado larga" }, 400);
  }

  try {
    const v = await env.INGEST.calificarContraBanco(itemId, eleccion);
    // Se devuelve el veredicto, NUNCA los puntos: el puntaje de la sesión lo
    // lleva el Durable Object, y mandarlo aquí sería dárselo al cliente.
    return json({
      acc: v.acc,
      causa: v.causa,
      razonAlterna: v.razonAlterna,
      inesperada: v.inesperada,
      habilidad: v.habilidad,
    });
  } catch (err) {
    return json({ error: String(err).slice(0, 120) }, 404);
  }
};

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
