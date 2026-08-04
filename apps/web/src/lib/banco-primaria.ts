/**
 * El banco de PRIMARIA, leído de D1 (D-072, F5c #356).
 *
 * ─── Por qué existe un segundo origen de ítems ─────────────────────────────
 *
 * Hasta F5c había UNO: el Worker de ingesta, que sirve el banco de kinder
 * generado desde `banco-kinder.ts`. D-072 decidió que el banco de primaria
 * vive en D1 (`item_bank`, migración 0016) para que un ítem se corrija sin
 * desplegar — y la ingesta quedó fuera del alcance de esta fase, así que la
 * lectura de D1 vive aquí, en el Worker web, que ya tiene el binding `DB`.
 *
 * Es el híbrido consciente que la propia D-072 nombra: KINDER desde código,
 * PRIMARIA desde D1. La deuda se cierra migrando KINDER después, no dejando
 * que la excepción se vuelva regla.
 *
 * ─── La forma del objeto, y por qué ────────────────────────────────────────
 *
 * Devuelve los mismos tres métodos que `/api/jugar` espera del binding
 * `INGEST` (`catalogoAdaptativo`, `presentarItem`, `calificarContraBanco`),
 * para que el endpoint elija origen UNA vez por petición y el resto del
 * camino — selección adaptativa, rotación, modelo, telemetría — no sepa ni
 * le importe de dónde salió el ítem. Duplicar el endpoint habría duplicado
 * todo eso, y la segunda copia se queda sin los arreglos de la primera.
 *
 * La composición del enunciado y el barajado NO se reimplementan aquí: viven
 * en `packages/motor/src/presentar.ts`, el módulo puro extraído para los dos
 * orígenes. Dos copias de esa lógica son cómo `casilla3` acabó en un botón
 * (#349).
 *
 * ─── Qué pasa cuando una fila está mal ─────────────────────────────────────
 *
 * `item_bank` se puede editar a mano — es la razón de ser de D-072 — y una
 * fila mal editada no debe llegar a una pantalla. Cada ítem se valida con
 * `validarItem` AL LEERLO (uno por petición, costo despreciable): si no pasa,
 * se comporta como si no existiera y `/api/jugar` cae al banco de kinder.
 * La garantía de fondo es el auditor `banco-primaria-i18n.mjs`, que valida la
 * siembra entera en cada commit; esto es la red, no la red de pesca.
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
// La lista de locales sale del motor y no de `~/i18n`: el índice de i18n
// importa JSON con sintaxis de Vite y este módulo también lo ejecuta Node
// (su prueba corre con `--experimental-strip-types`, sin bundler).
import { LOCALES, type Locale } from "../../../../packages/motor/src/convenciones.ts";

const localeSeguro = (locale: string): Locale =>
  (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : "en";

/** Una fila del catálogo: lo que el selector adaptativo necesita, y nada más. */
export interface EntradaCatalogo {
  id: string;
  habilidad: string;
  nivel: number;
  dificultad: number;
  /**
   * El techo de servicio (Kalyuga, #354): presente solo en los modelos que se
   * apagan por nivel. `undefined` en el resto y en todo el banco de kinder.
   */
  hastaNivel?: number;
}

export interface OrigenPrimaria {
  catalogoAdaptativo(): Promise<EntradaCatalogo[]>;
  presentarItem(itemId: string, locale: string): Promise<ItemPresentado | null>;
  calificarContraBanco(
    itemId: string,
    eleccion: number | string,
  ): Promise<(VeredictoDeItem & { nivel: number; habilidad: string; banda: "PRIMARIA" }) | null>;
}

export function bancoPrimariaD1(
  db: D1Database,
  mensajes: Record<string, Record<string, unknown>>,
): OrigenPrimaria {
  /**
   * Lee y valida UN ítem. `null` si no existe, si el JSON no parsea o si no
   * pasa `validarItem` — los tres casos significan lo mismo para quien juega:
   * «ese ítem no está», y el endpoint decide su respaldo.
   */
  async function leerItem(itemId: string): Promise<Item | null> {
    const fila = await db
      .prepare("SELECT item_json FROM item_bank WHERE id = ? AND banda = 'PRIMARIA'")
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
     * El catálogo del selector, desde columnas — sin tocar `item_json`. Las
     * ~2 000 filas viajan como 5 números y 2 cadenas cada una, no como el
     * ítem entero: traer el JSON para esto multiplicaría el costo de cada
     * «qué toca» por el tamaño del banco.
     */
    async catalogoAdaptativo() {
      const { results } = await db
        .prepare(
          "SELECT id, habilidad, nivel, dificultad, hasta_nivel AS hastaNivel " +
            "FROM item_bank WHERE banda = 'PRIMARIA'",
        )
        .all<EntradaCatalogo>();
      return results.map((f) => ({
        ...f,
        hastaNivel: f.hastaNivel ?? undefined,
      }));
    },

    async presentarItem(itemId, locale) {
      const item = await leerItem(itemId);
      if (!item) return null;
      const loc = localeSeguro(locale);
      return presentarItemEstructura(item, loc, mensajes[loc] ?? {});
    },

    /**
     * Califica contra el ítem guardado, nombrando la causa. Devuelve `null`
     * (no lanza) cuando el ítem no está: el endpoint cae entonces al banco de
     * kinder, que es de donde pudo haber salido el ítem si la siembra de este
     * ambiente aún no corre.
     */
    async calificarContraBanco(itemId, eleccion) {
      const item = await leerItem(itemId);
      if (!item) return null;
      return {
        ...calificarRespuesta(item, eleccion),
        nivel: item.nivel,
        habilidad: item.habilidad,
        banda: "PRIMARIA",
      };
    },
  };
}
