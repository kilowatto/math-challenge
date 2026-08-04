/**
 * El banco de la franja adulta (SERIO), leído de D1 (D-034, D-072, F5b #159–#167).
 *
 * ─── Por qué existe un TERCER origen de ítems ──────────────────────────────
 *
 * La ingesta sirve KINDER desde código; `banco-primaria.ts` sirve PRIMARIA
 * desde `item_bank`. La franja adulta vive en la MISMA tabla con
 * `banda = 'SERIO'` (D-034: la franja se siembra, no se migra — la 0016 ya
 * admite la banda en su CHECK) y se lee aquí, con la misma forma de objeto
 * que los otros dos orígenes para que `/api/jugar` elija origen UNA vez por
 * petición y el resto del camino — selección adaptativa, rotación, modelo,
 * telemetría — no sepa ni le importe de dónde salió el ítem (#164: la franja
 * usa el motor de F4, no se le escribe uno «para adultos»).
 *
 * ─── El respaldo, en cadena y a propósito ──────────────────────────────────
 *
 * `item_bank` se siembra por ambiente. Un adulto que entra en un ambiente
 * donde la siembra SERIO no corrió todavía no puede quedarse sin juego (línea
 * roja #4 en espíritu), así que el catálogo cae a PRIMARIA si SERIO está
 * vacío, y si los dos están vacíos `/api/jugar` cae a kinder como hasta hoy.
 * Al calificar se prueba SERIO y después PRIMARIA, porque el ítem pudo salir
 * del respaldo. El orden es declaración, no casualidad: el banco de la franja
 * manda donde existe.
 *
 * ─── Qué pasa cuando una fila está mal ─────────────────────────────────────
 *
 * Igual que en primaria: `item_bank` se puede editar a mano (D-072) y cada
 * ítem se valida con `validarItem` AL LEERLO. Si no pasa, se comporta como si
 * no existiera y se cae al siguiente eslabón de la cadena.
 */
import {
  calificarRespuesta,
  validarItem,
  type Item,
  type VeredictoDeItem,
} from "../../../../packages/motor/src/item.ts";
import {
  presentarItemEstructura,
  type ItemPresentado,
} from "../../../../packages/motor/src/presentar.ts";
// La lista de locales sale del motor y no de `~/i18n`, por la misma razón que
// en `banco-primaria.ts`: este módulo también lo ejecuta Node sin bundler.
import { LOCALES, type Locale } from "../../../../packages/motor/src/convenciones.ts";
import { bancoPrimariaD1, type EntradaCatalogo } from "./banco-primaria.ts";

const localeSeguro = (locale: string): Locale =>
  (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";

export interface OrigenAdulto {
  catalogoAdaptativo(): Promise<EntradaCatalogo[]>;
  presentarItem(itemId: string, locale: string): Promise<ItemPresentado | null>;
  calificarContraBanco(
    itemId: string,
    eleccion: number | string,
  ): Promise<(VeredictoDeItem & { nivel: number; habilidad: string; banda: "SERIO" | "PRIMARIA" }) | null>;
}

export function bancoAdultoD1(
  db: D1Database,
  mensajes: Record<string, Record<string, unknown>>,
): OrigenAdulto {
  const respaldo = bancoPrimariaD1(db, mensajes);

  /**
   * Lee y valida UN ítem de la franja. `null` si no existe, si el JSON no
   * parsea o si no pasa `validarItem` — los tres casos significan lo mismo
   * para quien juega: «ese ítem no está en la franja», y se cae al respaldo.
   */
  async function leerItemSerio(itemId: string): Promise<Item | null> {
    const fila = await db
      .prepare("SELECT item_json FROM item_bank WHERE id = ? AND banda = 'SERIO'")
      .bind(itemId)
      .first<{ item_json: string }>();
    if (!fila) return null;
    let item: Item;
    try {
      item = JSON.parse(fila.item_json) as Item;
    } catch {
      return null;
    }
    return validarItem(item).length === 0 ? item : null;
  }

  return {
    /**
     * El catálogo del selector, desde columnas — sin tocar `item_json`. Si la
     * franja de este ambiente está vacía, cae a PRIMARIA: un ítem por debajo
     * del nivel es infinitamente mejor que ningún ítem.
     */
    async catalogoAdaptativo() {
      const { results } = await db
        .prepare(
          "SELECT id, habilidad, nivel, dificultad, hasta_nivel AS hastaNivel " +
            "FROM item_bank WHERE banda = 'SERIO'",
        )
        .all<EntradaCatalogo>();
      if (results.length > 0) {
        return results.map((f) => ({ ...f, hastaNivel: f.hastaNivel ?? undefined }));
      }
      return respaldo.catalogoAdaptativo();
    },

    async presentarItem(itemId, locale) {
      const item = await leerItemSerio(itemId);
      if (!item) return respaldo.presentarItem(itemId, locale);
      const loc = localeSeguro(locale);
      return presentarItemEstructura(item, loc, mensajes[loc] ?? {});
    },

    /**
     * Califica contra el ítem guardado, nombrando la causa. Devuelve `null`
     * (no lanza) cuando el ítem no está ni en la franja ni en primaria: el
     * endpoint cae entonces al banco de kinder, que es de donde pudo haber
     * salido el ítem si las dos siembras de este ambiente aún no corren.
     */
    async calificarContraBanco(itemId, eleccion) {
      const item = await leerItemSerio(itemId);
      if (!item) return respaldo.calificarContraBanco(itemId, eleccion);
      return {
        ...calificarRespuesta(item, eleccion),
        nivel: item.nivel,
        habilidad: item.habilidad,
        banda: "SERIO",
      };
    },
  };
}
