import { calificarRespuesta, type Item } from "./item.ts";
import { calificar } from "./puntuacion.ts";

export interface RespuestaClub { itemId: string; eleccion: number | string }

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
