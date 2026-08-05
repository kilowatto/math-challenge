import {
  calificarRespuesta,
  validarItem,
  type Item,
  type VeredictoDeItem,
} from "../../../../packages/motor/src/item.ts";
import { presentarItemEstructura, type ItemPresentado } from "../../../../packages/motor/src/presentar.ts";
import { LOCALES, type Locale } from "../../../../packages/motor/src/convenciones.ts";

const BANDA_POR_NIVEL: Record<number, "SECUNDARIA" | "PRO"> = {
  7: "SECUNDARIA",
  11: "PRO",
  12: "PRO",
};

const localeSeguro = (locale: string): Locale =>
  (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";

export interface EntradaCierre {
  id: string;
  habilidad: string;
  nivel: number;
  dificultad: number;
}

export function bancoCierreD1(
  db: D1Database,
  mensajes: Record<string, Record<string, unknown>>,
) {
  async function leer(itemId: string): Promise<Item | null> {
    const fila = await db
      .prepare("SELECT item_json, banda FROM item_bank WHERE id = ?")
      .bind(itemId)
      .first<{ item_json: string; banda: string }>();
    if (!fila || (fila.banda !== "SECUNDARIA" && fila.banda !== "PRO")) return null;
    let item: Item;
    try {
      item = JSON.parse(fila.item_json) as Item;
    } catch {
      return null;
    }
    return validarItem(item).length === 0 && BANDA_POR_NIVEL[item.nivel] === fila.banda ? item : null;
  }

  return {
    async catalogo(): Promise<EntradaCierre[]> {
      const { results } = await db
        .prepare(
          "SELECT id, habilidad, nivel, dificultad FROM item_bank " +
            "WHERE banda IN ('SECUNDARIA', 'PRO') AND habilidad LIKE 'CIERRE_N%'",
        )
        .all<EntradaCierre>();
      return results.filter((item) => BANDA_POR_NIVEL[item.nivel] !== undefined);
    },
    async presentarItem(itemId: string, locale: string): Promise<ItemPresentado | null> {
      const item = await leer(itemId);
      if (!item) return null;
      const loc = localeSeguro(locale);
      return presentarItemEstructura(item, loc, mensajes[loc] ?? {});
    },
    async calificarContraBanco(
      itemId: string,
      eleccion: number | string,
    ): Promise<(VeredictoDeItem & { nivel: number; habilidad: string; banda: "SECUNDARIA" | "PRO" }) | null> {
      const item = await leer(itemId);
      if (!item) return null;
      return {
        ...calificarRespuesta(item, eleccion),
        nivel: item.nivel,
        habilidad: item.habilidad,
        banda: BANDA_POR_NIVEL[item.nivel],
      };
    },
  };
}
