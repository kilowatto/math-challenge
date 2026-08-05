import { calificarRespuesta, type Item } from "../../../../packages/motor/src/item.ts";
import { calificar } from "../../../../packages/motor/src/puntuacion.ts";

export interface RespuestaClub { itemId: string; eleccion: number | string }

export function itemsDelReto(itemSet: string, banco: Item[]): Item[] {
  let ids: unknown;
  try { ids = JSON.parse(itemSet); } catch { return []; }
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return [];
  const byId = new Map(banco.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id as string)).filter((item): item is Item => item !== undefined);
}

export function puntuarRespuestas(items: Item[], respuestas: RespuestaClub[]): { puntos: number; correctas: number } | null {
  if (items.length === 0 || respuestas.length !== items.length) return null;
  const expected = new Set(items.map((item) => item.id));
  const received = new Set(respuestas.map((answer) => answer.itemId));
  if (received.size !== expected.size || [...expected].some((id) => !received.has(id))) return null;
  let puntos = 0;
  let correctas = 0;
  for (const respuesta of respuestas) {
    const item = items.find((candidate) => candidate.id === respuesta.itemId);
    if (!item) return null;
    const veredicto = calificarRespuesta(item, respuesta.eleccion);
    const score = calificar({ banda: "SERIO", nivel: item.nivel, acc: veredicto.acc, rtMs: 10_000 });
    puntos += score.puntos;
    correctas += veredicto.acc;
  }
  return { puntos: Math.round(puntos), correctas };
}
