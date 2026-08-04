/**
 * La vista ORDENADA del grupo, calculada en frío desde D1 (F9 · #383, D-087).
 *
 * ─── Por qué existe, y por qué no lee el Durable Object ─────────────────────
 *
 * La tabla ordenada por posición que el dueño ve en su pantalla. Los
 * standings EN VIVO los difunde `math-challenge-classroom-do` (D-098 del
 * reparto) — pero cablear ese objeto (`/abrir` al crear, `/unir` al aprobar,
 * `/sumar` al cerrar un reto) es de la issue #400, no de esta superficie.
 * Mientras tanto, esta consulta calcula la misma vista con las MISMAS
 * funciones del motor que el objeto usa (`ordenar`, `posicionVisible`,
 * `visibleEnTablaDePosiciones`): una sola copia de cada regla, en el motor.
 *
 * Las dos reglas que hacen el trabajo entero de D-027 y D-087, idénticas a
 * las del objeto:
 *
 *  1. **Solo entran los miembros con opt-in.** El filtro es
 *     `visibleEnTablaDePosiciones` del motor, no un `if` reescrito aquí.
 *  2. **Los campos se copian UNO A UNO** en la salida, nunca con `...fila` —
 *     la banda se lee para calcular la posición visible (tercios en KINDER,
 *     D-081) y JAMÁS se devuelve: un miembro nunca ve la banda de otro.
 *
 * La vista ordenada nunca se mezcla con el roster alfabético: son dos pestañas
 * de la pantalla del grupo, nunca la misma lista con un orden (F9 §7).
 *
 * Las importaciones llevan `.ts` explícita: `padre-grupo.prueba.mjs` carga
 * este módulo con `node --experimental-strip-types`.
 */

import { ordenar, posicionVisible, type Membresia } from "../../../../packages/motor/src/liga.ts";
import { visibleEnTablaDePosiciones } from "../../../../packages/motor/src/grupo.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";
import { PERIODO_GLOBAL } from "./tablero-datos.ts";
import { grupoDelDuenio } from "./grupo-roster.ts";

/** Una fila de la vista ordenada: la lista cerrada de D-027, con la posición. */
export interface FilaOrdenada {
  readonly alias: string;
  readonly puntos: number;
  readonly current_streak: number;
  /** Tercio en KINDER, número exacto de PRIMARIA en adelante (D-081). */
  readonly posicion: ReturnType<typeof posicionVisible>;
}

interface FilaInterna {
  membership_id: string;
  alias: string;
  puntos: number;
  current_streak: number;
  banda: Banda;
  opt_in: 0 | 1;
  joined_at: number;
}

/**
 * La posición como texto, calculada AQUÍ y no en la página.
 *
 * `audits/kinder-sin-examen.mjs` vigila las superficies (`pages`/`components`/
 * `layouts`): ninguna que mencione la banda más chica puede pintar una
 * posición exacta — el número no se oculta al pintar, no viaja (D-081). La
 * conversión vive en el módulo de datos, que es quien sabe qué forma tiene la
 * posición; la página solo cambia texto.
 *
 * `tercios` recibe los tres nombres ya autorados del locale (los del catálogo
 * de la liga: el mismo concepto, las mismas palabras).
 */
export function posicionComoTexto(
  posicion: ReturnType<typeof posicionVisible>,
  puntos: (n: number) => string,
  tercios: Record<string, string>,
): string {
  if (posicion.forma === "exacta") return puntos(posicion.rank);
  return tercios[posicion.tercio] ?? "";
}

/**
 * La tabla ordenada de UN grupo, para SU dueño. `null` si el grupo no es
 * suyo — el mismo `null` que `rosterDelGrupo`, sin distinguir «no existe» de
 * «no es tuyo».
 *
 * Solo miembros `approved` (la revocación corta en la primera lectura, como
 * en el roster) y de ellos solo los que tienen `leaderboard_opt_in = 1`: un
 * niño cuyo padre no activó el ranking no aparece en NINGUNA vista ordenada
 * aunque sí en el roster (D-087).
 */
export async function tablaOrdenadaDelGrupo(
  db: D1Database,
  ownerUserId: string,
  groupId: string,
): Promise<FilaOrdenada[] | null> {
  const grupo = await grupoDelDuenio(db, ownerUserId, groupId);
  if (!grupo) return null;

  const r = await db
    .prepare(
      "SELECT m.id AS membership_id, p.alias AS alias, " +
        "COALESCE(s.total_score, 0) AS puntos, " +
        "COALESCE(r.current_streak, 0) AS current_streak, " +
        "p.theme_band AS banda, m.leaderboard_opt_in AS opt_in, m.requested_at AS joined_at " +
        "FROM child_group_membership m " +
        "JOIN child_profiles p ON p.id = m.child_profile_id AND p.deleted_at IS NULL " +
        "LEFT JOIN score_totals s ON s.child_profile_id = p.id AND s.period = ? " +
        "LEFT JOIN child_streak r ON r.child_profile_id = p.id " +
        "WHERE m.child_group_id = ? AND m.status IN ('approved')",
    )
    .bind(PERIODO_GLOBAL, groupId)
    .all<FilaInterna>();

  // El filtro de opt-in, con la función del motor — no un `if` suelto: dos
  // copias de la regla son dos oportunidades de ablandar una (D-087).
  const filas = (r.results ?? []).filter((f) => visibleEnTablaDePosiciones(f.opt_in));

  const comoMembresia: Membresia[] = filas.map((f) => ({
    id: f.membership_id,
    child_profile_id: null,
    user_id: null,
    points_this_week: f.puntos,
    active_days: 0,
    joined_at: f.joined_at,
  }));

  const orden = ordenar(comoMembresia);
  const porId = new Map(filas.map((f) => [f.membership_id, f]));

  // Campo a campo, nunca `...fila`: la banda NO sale de aquí.
  return orden.map((m, i) => {
    const f = porId.get(m.id)!;
    return {
      alias: f.alias,
      puntos: f.puntos,
      current_streak: f.current_streak,
      posicion: posicionVisible(f.banda, i + 1, orden.length),
    };
  });
}
