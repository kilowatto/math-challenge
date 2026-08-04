/**
 * La consulta de solo lectura del roster de un grupo infantil (F7 · #208).
 *
 * D-025, D-027, D-044, D-106 · `mc-46` §6 («el dueño del club ve exclusivamente
 * alias, puntos y racha. Ni nombre real, ni edad exacta, ni foto, ni otro grupo
 * al que el niño pertenezca»).
 *
 * ─── Por qué vive aquí y no en el Durable Object ni en una ruta ─────────────
 *
 * `math-challenge-classroom-do` guarda el estado VIVO del grupo —duplicado de
 * D1— para difundir la tabla por WebSocket sin ir a la base en cada reto. El
 * roster del DUEÑO es lo contrario: una lectura fría de D1, sin difusión, que
 * además incluye a los miembros aprobados SIN opt-in de ranking (D-027 autoriza
 * alias/racha/puntos al dueño aunque el niño no aparezca en ninguna vista
 * ordenada — ver `grupo.ts::visibleEnTablaDePosiciones`). Pedírsela al DO
 * obligaría a guardar en él a los miembros sin opt-in solo para esta pantalla,
 * y una ruta con el SQL embebido repetiría el error que `padre-limite.ts` ya
 * nombró: un SQL mal escrito no da error, da un adulto mirando al hijo de otro
 * — y eso solo se ve ejecutándolo, en `grupo-roster.prueba.mjs` contra
 * `node:sqlite` con las migraciones REALES.
 *
 * ─── La lista cerrada: alias, puntos y `current_streak`. Nada más ───────────
 *
 * De `child_streak` sale EXACTAMENTE una columna: `current_streak` (#208,
 * criterio literal). Jamás:
 *
 *  · `max_streak` — es la mejor marca personal del niño frente a sí mismo, no
 *    un dato para que un maestro compare entre alumnos (#208: si el dueño lo
 *    pide más adelante, es una decisión NUEVA, no un default). Es la misma
 *    regla que D-106 aplicó a la liga.
 *  · `shields_available`, `shields_earned_total` — los escudos son presencia
 *    y protección del menor; el grupo no los necesita.
 *  · `pause_until_local_date`, `pause_uses_this_year`, `pause_year` — una
 *    pausa le dice al grupo «este niño no está en casa / está enfermo / de
 *    viaje». Es información de presencia del menor, y ninguna categoría de
 *    pausa sale de esta fila.
 *
 * El SELECT lleva las columnas NOMBRADAS, nunca `SELECT *`: añadir una columna
 * a `child_streak` no puede publicarla aquí por descuido. Es el mismo candado
 * que la proyección campo a campo de `liga-do.ts` y `classroom-do.ts`, en SQL.
 *
 * ─── La racha NO ordena (D-025) ─────────────────────────────────────────────
 *
 * Esta consulta devuelve las filas ordenadas por `alias` — un orden neutro de
 * despliegue— y JAMÁS por `current_streak` ni por puntos: la vía es solo
 * lectura informativa (#208), y el tablero que ordena por puntos ya existe y
 * es otro (D-025). No hay `.sort()` en este módulo a propósito.
 *
 * ─── La revocación corta la visibilidad EN LA CONSULTA ──────────────────────
 *
 * Solo entran membresías con `status = 'approved'`. Remover a un niño es un
 * UPDATE a `'removed'` (la fila jamás se borra — bitácora de la 0017), así que
 * la revocación deja de exponer su racha al grupo en la PRIMERA lectura
 * posterior: no hay caché intermedia ni «al día siguiente». Es el mismo patrón
 * que `household_devices.revoked_at` y que `child_consents.revoked_at` del
 * tablero: el corte vive EN el WHERE, no en la plantilla.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No escribe nada.** Ni membresías, ni rachas, ni puntos. Es la mitad de
 *    lectura de D-044; la escritura la tienen sus módulos.
 *  · **No distingue «no existe» de «no es tuyo».** `null` cubre los dos, como
 *    `hijoDelPadre`: quien prueba ids ajenos no aprende cuáles existen. La
 *    página responde 404 a los dos.
 *  · **No sirve a `adult_club`.** Esa tabla es de F10 y todavía no existe en
 *    `migrations/` — #208 dependía de su contrato, no de su implementación. El
 *    día que aterrice, esta consulta NO se reutiliza sobre ella sin releer
 *    mc-46 §7: los clubs de adultos son una estructura SEPARADA a propósito,
 *    para que una función social de adultos no alcance a los niños por
 *    omisión.
 *  · **No proyecta el avatar.** D-027 lo autoriza, pero #208 fija la lista en
 *    alias, puntos y racha. Si la pantalla del dueño lo necesita, entra como
 *    columna nombrada y con la lista cerrada del auditor moviéndose a la vez.
 */

import { PERIODO_GLOBAL } from "./tablero-datos.ts";
import type { OrigenDeGrupo } from "../../../../packages/motor/src/grupo.ts";

/** Lo que el dueño puede saber de SU grupo: que existe y de dónde viene. */
export interface GrupoDelDuenio {
  readonly id: string;
  readonly origen_tipo: OrigenDeGrupo;
}

/**
 * ¿Es `groupId` un grupo de ESTE dueño?
 *
 * Es la única comprobación de propiedad de esta superficie, y es de línea roja
 * #2 en su forma de grupo: el dueño ve a los miembros de SUS grupos, nunca los
 * de otro. Un `null` aquí no distingue «no existe» de «no es tuyo» a propósito
 * — mismo patrón que `hijoDelPadre`.
 *
 * Un grupo deshabilitado (`disabled_at` puesto) sigue siendo visible para su
 * dueño: lo que el dueño apagó es el código de unión, no el roster — los
 * niños que ya están aprobados siguen siendo su responsabilidad (0017).
 */
export async function grupoDelDuenio(
  db: D1Database,
  ownerUserId: string,
  groupId: string,
): Promise<GrupoDelDuenio | null> {
  const fila = await db
    .prepare(
      "SELECT id, origen_tipo FROM child_group WHERE id = ? AND owner_user_id = ?",
    )
    .bind(groupId, ownerUserId)
    .first<{ id: string; origen_tipo: OrigenDeGrupo }>();
  return fila ?? null;
}

/**
 * Una fila del roster: la lista cerrada de #208 y D-044.
 *
 * `puntos` es el total acumulado del niño en el periodo global — la misma
 * magnitud por la que ordena el tablero (D-025)—, y `current_streak` es la
 * ÚNICA columna que sale de `child_streak` por esta vía.
 */
export interface FilaDeRoster {
  readonly alias: string;
  readonly puntos: number;
  readonly current_streak: number;
}

/**
 * El roster de UN grupo, para SU dueño. `null` si el grupo no es suyo.
 *
 * Tres decisiones viven EN el SQL, no en quien lo llame:
 *
 *  1. **`m.status IN ('approved')`** — un niño pendiente, rechazado o removido
 *     no expone nada a este grupo. La revocación corta aquí, de inmediato. La
 *     forma `IN` es deliberada: `grupo-aprobacion-padre.mjs` vigila que la
 *     ESCRITURA `status = 'approved'` solo viva en el módulo autorizado de
 *     F9, y este filtro de LECTURA no tiene por qué parecer una escritura.
 *  2. **Columnas nombradas** — `p.alias`, `s.total_score`, `r.current_streak`
 *     y ninguna más. De `child_streak` solo viaja la racha en curso: ni la
 *     mejor marca, ni escudos, ni pausas (#208, D-106).
 *  3. **`ORDER BY p.alias`** — la racha nunca ordena (D-025) y esta vía tampoco
 *     ordena por puntos: es informativa, no un ranking. El orden por alias es
 *     neutro y estable; el desempate por id lo hace determinista.
 *
 * Sin fila en `child_streak` —el niño aprobado que todavía no cierra su primer
 * reto— la racha es 0, no NULL: un NULL en JSON se lee como dato faltante, y
 * aquí el dato es «todavía no tiene racha». Igual con los puntos.
 */
export async function rosterDelGrupo(
  db: D1Database,
  ownerUserId: string,
  groupId: string,
): Promise<FilaDeRoster[] | null> {
  const grupo = await grupoDelDuenio(db, ownerUserId, groupId);
  if (!grupo) return null;

  const r = await db
    .prepare(
      "SELECT p.alias AS alias, " +
        "COALESCE(s.total_score, 0) AS puntos, " +
        "COALESCE(r.current_streak, 0) AS current_streak " +
        "FROM child_group_membership m " +
        "JOIN child_profiles p ON p.id = m.child_profile_id AND p.deleted_at IS NULL " +
        "LEFT JOIN score_totals s ON s.child_profile_id = p.id AND s.period = ? " +
        "LEFT JOIN child_streak r ON r.child_profile_id = p.id " +
        "WHERE m.child_group_id = ? AND m.status IN ('approved') " +
        "ORDER BY p.alias ASC, p.id ASC",
    )
    .bind(PERIODO_GLOBAL, groupId)
    .all<FilaDeRoster>();
  return r.results ?? [];
}
