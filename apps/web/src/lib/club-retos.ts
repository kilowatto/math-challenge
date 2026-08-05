import type { Item } from "../../../../packages/motor/src/item.ts";
export { puntuarRespuestas, type RespuestaClub } from "../../../../packages/motor/src/club-puntuacion.ts";


export function itemsDelReto(itemSet: string, banco: Item[]): Item[] {
  let ids: unknown;
  try { ids = JSON.parse(itemSet); } catch { return []; }
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) return [];
  const byId = new Map(banco.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id as string)).filter((item): item is Item => item !== undefined);
}
