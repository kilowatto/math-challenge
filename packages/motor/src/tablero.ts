/**
 * El tablero global. Ordena por PUNTOS, nunca por θ.
 *
 * #247, #250 · D-003, D-010, D-025, D-040 · `mc-18`, `mc-10`, `mc-25`.
 *
 * ─── D-025 se tomó contra la investigación, y conviene recordarlo aquí ─────
 *
 * `mc-18` recomienda ordenar por θ (la habilidad latente de TRI) y advierte que
 * sumar puntos premia a quien resuelve muchos ejercicios fáciles rápido. D-025
 * eligió puntos de todas formas, con tres razones escritas —θ no existe en v1
 * porque exige un banco calibrado con 200-400 respuestas por ítem; un niño de 8
 * años no puede leer un rating; el escalado `1.6^(nivel−1)` mitiga el sesgo— y
 * con su límite dicho de frente: **mitiga, no elimina**. Con tiempo infinito el
 * volumen le sigue ganando a la dificultad.
 *
 * La condición de revisión también está escrita: cuando el banco tenga ≥200
 * respuestas por ítem en las bandas activas, se reevalúa migrar a θ. Ese
 * disparador **no se construye aquí** — necesita datos de Analytics Engine, que
 * ningún módulo puro puede leer.
 *
 * ─── La escalera de visibilidad ────────────────────────────────────────────
 *
 * Un tablero no es una lista: es una lista **para alguien**, y lo que ese
 * alguien ve depende de su banda (#247, D-081).
 *
 *   · **KINDER** — el tablero existe solo como widget del panel del padre.
 *     Nunca se renderiza dentro de `/app/kids/**`, y eso lo hace cumplir
 *     `audits/tablero-orden-puntos.mjs`, no la buena voluntad de quien escriba
 *     la página. La posición se da en tercios (`liga.ts::posicionVisible`).
 *   · **PRIMARIA** — fuera del top 20 de su (periodo, banda) ve **solo su
 *     propio total acumulado**: ni rango, ni posición, ni vecinos. `mc-10` mide
 *     que la presión de rendimiento empeora el desempeño en matemáticas, y a
 *     esa edad saber que se es el 4.812º no informa de nada.
 *   · **SECUNDARIA, SERIO, JR y PRO** — posición numérica exacta, con «tú estás
 *     aquí» incluso fuera del top 100.
 *
 * ─── Lo que este módulo no hace ────────────────────────────────────────────
 *
 *  · **No formatea.** Devuelve números. Quien pinta llama a
 *    `numeros.ts::formatear` con el locale de **quien mira**, jamás con el
 *    `alias_locale` del dueño de la fila (#247, `mc-34`).
 *  · **No notifica.** No hay ninguna función que arme un aviso de «bajaste de
 *    posición» o «te alcanzaron». D-014 lo prohíbe por nombre en su fila
 *    «notificaciones con culpa», y la forma de garantizarlo es que la función
 *    no exista.
 *  · **No borra.** Apagar el tablero **revoca** el consentimiento
 *    (`child_consents.revoked_at`); no toca `score_totals`. El borrado de
 *    verdad tiene su propio runbook, que cubre cinco sistemas
 *    (`audits/borrado-cuatro-sistemas.mjs`).
 *  · **No mezcla las dos tablas.** `score_totals` es de niños y
 *    `score_totals_adulto` de adultos: dos consultas, jamás un UNION que
 *    produzca una fila donde no se sepa cuál de los dos es.
 */

import type { Banda } from "./puntuacion.ts";
import { posicionVisible, type PosicionVisible } from "./liga.ts";

/** Cuántos ve PRIMARIA de su tablero. Fuera de ahí, solo su propio total. */
export const TOP_PRIMARIA = 20;

/** El largo de la lista publicada para las bandas con posición exacta. */
export const TOP_TABLERO = 100;

/**
 * Una fila del tablero, ya proyectada: alias, no nombre.
 *
 * `alias` viene de `packages/motor/src/alias.ts` para los dos tipos de
 * participante — `child_profiles.alias` desde la migración 0002 y `users.alias`
 * desde la 0011. No hay ninguna ruta por la que un nombre real llegue hasta
 * aquí, porque esta estructura no tiene dónde ponerlo.
 */
export interface FilaDeTablero {
  readonly alias: string;
  readonly total_score: number;
  /** Desempate estable. Nunca se muestra. */
  readonly id: string;
}

export interface EntradaDeTablero {
  readonly alias: string;
  readonly total_score: number;
  readonly posicion: PosicionVisible;
  /** `true` solo en la fila de quien mira. Es el «tú estás aquí» de #247. */
  readonly soy_yo: boolean;
}

/**
 * Ordena por puntos. Determinista hasta el último desempate.
 *
 * `total_score` desc y después `id` asc. El `id` hace falta: SQLite no
 * garantiza el orden de las filas empatadas, y sin él dos corridas del mismo
 * Workflow publicarían tableros distintos con los mismos datos.
 *
 * **No hay ningún criterio de velocidad**, ni como desempate. D-025 ordena por
 * puntos; el tiempo ya está dentro de la fórmula de D-010 y volver a meterlo
 * aquí lo contaría dos veces.
 */
export function ordenarPorPuntos(filas: readonly FilaDeTablero[]): FilaDeTablero[] {
  return [...filas].sort(
    (a, b) => b.total_score - a.total_score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

/** Qué forma tiene el tablero para esta banda. */
export type FormaDeTablero =
  | { readonly forma: "tercios" }
  | { readonly forma: "top_y_propio"; readonly top: number }
  | { readonly forma: "exacta"; readonly top: number };

export function formaDeTablero(banda: Banda): FormaDeTablero {
  if (banda === "KINDER") return { forma: "tercios" };
  if (banda === "PRIMARIA") return { forma: "top_y_propio", top: TOP_PRIMARIA };
  return { forma: "exacta", top: TOP_TABLERO };
}

/**
 * Lo que se le manda a quien mira.
 *
 * `lista` puede venir vacía —PRIMARIA fuera del top 20— y eso no es un error:
 * es el caso normal para la mayoría. `mi_total` viene siempre, porque el propio
 * total acumulado es lo único que este producto le enseña a todo el mundo sin
 * excepción.
 */
export interface VistaDeTablero {
  readonly banda: Banda;
  readonly lista: readonly EntradaDeTablero[];
  readonly mi_total: number;
  /** `null` cuando la banda no publica posición para quien mira. */
  readonly mi_posicion: PosicionVisible | null;
}

/**
 * Arma el tablero para una persona concreta.
 *
 * @param filas   las filas de UNA banda y UN periodo, ya filtradas por opt-in
 * @param quienId el `id` de quien mira, para el «tú estás aquí»
 *
 * Las filas llegan filtradas por consentimiento y este módulo **no lo
 * comprueba**, a propósito: filtrar aquí daría dos sitios donde se decide quién
 * aparece, y el día que alguien llame a la función sin filtrar antes, el
 * segundo filtro parecería suficiente. El filtro vive en la consulta —
 * `SQL_TOP_NINO` lo lleva escrito— y `audits/tablero-orden-puntos.mjs` bloquea
 * cualquier consulta a `score_totals` que no una contra `child_consents`.
 */
export function armarTablero(
  banda: Banda,
  filas: readonly FilaDeTablero[],
  quienId: string,
): VistaDeTablero {
  const orden = ordenarPorPuntos(filas);
  const total = orden.length;
  const indice = orden.findIndex((f) => f.id === quienId);
  const miFila = indice >= 0 ? orden[indice] : null;
  const miRango = indice >= 0 ? indice + 1 : null;
  const forma = formaDeTablero(banda);

  const entrada = (f: FilaDeTablero, i: number): EntradaDeTablero => ({
    alias: f.alias,
    total_score: f.total_score,
    posicion: posicionVisible(banda, i + 1, total),
    soy_yo: f.id === quienId,
  });

  if (forma.forma === "tercios") {
    // KINDER: ni la lista lleva números de posición ni se publica un fondo de
    // tabla. Se manda el top en tercios, que es lo que #243 autoriza, y jamás
    // el «último lugar» — `mc-18` implicación 7.
    const visibles = orden.slice(0, Math.ceil(total / 3)).map(entrada);
    return {
      banda,
      lista: visibles,
      mi_total: miFila?.total_score ?? 0,
      mi_posicion: miRango !== null ? posicionVisible(banda, miRango, total) : null,
    };
  }

  if (forma.forma === "top_y_propio") {
    const dentro = miRango !== null && miRango <= forma.top;
    return {
      banda,
      lista: dentro ? orden.slice(0, forma.top).map(entrada) : [],
      mi_total: miFila?.total_score ?? 0,
      // Fuera del top 20, PRIMARIA no recibe NI SU PROPIO rango. No es que se
      // oculte al pintar: no viaja. Recibirlo y esconderlo lo deja en la
      // respuesta, en las herramientas del navegador y en cualquier registro.
      mi_posicion: dentro && miRango !== null ? posicionVisible(banda, miRango, total) : null,
    };
  }

  return {
    banda,
    lista: orden.slice(0, forma.top).map(entrada),
    mi_total: miFila?.total_score ?? 0,
    // «Tú estás aquí» incluso fuera del top 100 (#247).
    mi_posicion: miRango !== null ? posicionVisible(banda, miRango, total) : null,
  };
}

// ─── Las dos consultas, que no se unen nunca ─────────────────────────────────

/**
 * El tablero de niños. Lleva el opt-in dentro de la consulta (D-040).
 *
 * El `JOIN` contra `child_consents` no es una comodidad: es el único sitio
 * donde el opt-in se puede hacer cumplir de verdad. Un filtro en el código que
 * lee las filas se olvida en la segunda ruta que las lea; un `JOIN` en la
 * consulta no se puede olvidar sin borrarlo, y borrarlo se ve en el diff.
 */
export const SQL_TOP_NINO = `
SELECT p.alias AS alias, s.total_score AS total_score, p.id AS id
FROM score_totals s
JOIN child_profiles p ON p.id = s.child_profile_id AND p.deleted_at IS NULL
JOIN child_consents c
  ON c.child_profile_id = p.id
 AND c.consent_code = 'LEADERBOARD'
 AND c.revoked_at IS NULL
WHERE s.period = ? AND s.theme_band = ?
ORDER BY s.total_score DESC, p.id ASC
LIMIT ?
`.trim();

/**
 * El tablero de adultos. Otra tabla, otra consulta.
 *
 * **Jamás un UNION con la de arriba.** Con una consulta unida, una fila del
 * resultado no sabe si es de un niño o de un adulto, y la primera pantalla que
 * se escriba sobre ese resultado los pondrá en la misma lista sin que nadie lo
 * decida. Es el mismo criterio de D-027, y `audits/tablero-orden-puntos.mjs`
 * bloquea el UNION por nombre.
 *
 * El adulto no pasa por `child_consents`: consiente por sí mismo al activar
 * `is_learner`, que es también cuando se le genera el alias (#239).
 *
 * **`COALESCE(u.username, u.alias)` — reversa puntual de D-003 (D-197).**
 * Hasta D-197 esta columna era siempre el alias generado; el dueño decidió
 * que el `@usuario` público (texto que el adulto mismo escribe, D-197 §1)
 * se muestre en su lugar cuando existe, y solo entonces — mientras no lo
 * haya fijado, sigue viendo el alias anónimo de siempre. El campo del
 * resultado se sigue llamando `alias` a propósito: no hay una segunda ruta
 * de "nombre real" en esta consulta, solo un valor distinto según qué haya
 * elegido el adulto. **`SQL_TOP_NINO` NO tiene un cambio equivalente ni lo
 * tendrá nunca** — el niño no gana esta columna bajo ninguna circunstancia
 * (D-013, línea roja #2, línea roja #3).
 */
export const SQL_TOP_ADULTO = `
SELECT COALESCE(u.username, u.alias) AS alias, s.total_score AS total_score, u.id AS id
FROM score_totals_adulto s
JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL
WHERE s.period = ? AND s.theme_band = ? AND u.alias IS NOT NULL
ORDER BY s.total_score DESC, u.id ASC
LIMIT ?
`.trim();
