/**
 * El estado del hogar para el recordatorio — la capa de DATOS de la decisión.
 *
 * ─── Por qué este archivo existe separado del envío ────────────────────────
 *
 * El criterio de aceptación #1 del issue #207 es que ninguna ruta de ENVÍO de
 * push tome `childProfileId` como destinatario. Decidir, en cambio, exige
 * saber si los hijos del hogar completaron su meta — y eso se consulta sobre
 * `child_profiles` y `mission_daily_summary`. La separación es la defensa:
 *
 *   · ESTE archivo lee datos de niños y devuelve CONTEOS. Nada más sale de
 *     aquí: ni un id, ni un alias, ni una fila.
 *   · `push-envio.ts` resuelve destinatarios (`user_id` → endpoints) y envía.
 *     No contiene la cadena `child_profile_id` ni puede contenerla:
 *     `audits/recordatorio-sin-culpa.mjs` lo bloquea de forma estática.
 *
 * «Meta completada» hoy significa, por banda (D-160, 2026-08-03):
 *
 *   · PRIMARIA en adelante — `mission_daily_summary.completed = 1` en el día
 *     LOCAL del hogar.
 *   · KINDER — **haber jugado hoy**, es decir `child_streak
 *     .last_completed_local_date` = el día local. KINDER no escribe fila de
 *     misión (D-104: su «misión» es el reto HISTORIA del día, una etiqueta),
 *     así que leer misiones era leer «nunca completada» y el recordatorio
 *     habría sonado a diario en hogares de kinder. El dueño lo decidió hoy:
 *     para esa banda la meta ES haber jugado, que es exactamente lo que la
 *     racha ya mide (D-091).
 */

export interface ConteosDelHogar {
  /** Hijos vivos de la cuenta + el propio adulto si aprende (`is_learner`). */
  aprendices: number;
  /** Cuántos tienen al menos una misión con `completed = 1` hoy. */
  completados: number;
}

/**
 * Cuenta aprendices y completados del hogar en el día local dado.
 *
 * Una sola consulta con subconsultas de conteo: lo que viaja al decisor son
 * dos enteros, nunca una lista. El `COUNT(DISTINCT …)` es porque un aprendiz
 * con las TRES misiones completadas sigue siendo UN aprendiz completado —
 * contar filas inflaría el número y un hogar con un hijo muy cumplidor se
 * vería como tres.
 */
export async function conteosDelHogar(
  db: D1Database,
  userId: string,
  diaLocal: string,
): Promise<ConteosDelHogar> {
  const fila = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM child_profiles
           WHERE parent_user_id = ?1 AND deleted_at IS NULL)
       + (SELECT is_learner FROM users WHERE id = ?1)
           AS aprendices,
         (SELECT COUNT(DISTINCT cp.id) FROM child_profiles cp
           WHERE cp.parent_user_id = ?1 AND cp.deleted_at IS NULL
             AND (
               EXISTS (SELECT 1 FROM mission_daily_summary m
                        WHERE m.child_profile_id = cp.id AND m.local_date = ?2 AND m.completed = 1)
               OR (cp.theme_band = 'KINDER' AND EXISTS (
                     SELECT 1 FROM child_streak s
                      WHERE s.child_profile_id = cp.id AND s.last_completed_local_date = ?2))
             ))
       + (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM mission_daily_summary
           WHERE user_id = ?1 AND local_date = ?2 AND completed = 1)
           AS completados`,
    )
    .bind(userId, diaLocal)
    .first<{ aprendices: number; completados: number }>();

  return {
    aprendices: fila?.aprendices ?? 0,
    completados: fila?.completados ?? 0,
  };
}

export interface PendientesDelHogar {
  /** Los alias de los hijos con la meta SIN completar hoy, en orden de alta. */
  aliases: string[];
  /** El adulto aprendiz (SERIO/JR/PRO) tampoco completó la suya. */
  adultoPendiente: boolean;
}

/**
 * Quién falta por completar hoy — para componer el copy del recordatorio.
 *
 * Sale el ALIAS y nada más: es la forma pública del niño (D-003), la única que
 * un texto puede nombrar, y es lo que `/api/push-mensaje.ts` interpola en la
 * plantilla singular. Ningún identificador cruza esta frontera.
 */
export async function pendientesDelHogar(
  db: D1Database,
  userId: string,
  diaLocal: string,
  esAprendiz: boolean,
): Promise<PendientesDelHogar> {
  const pendientes = await db
    .prepare(
      `SELECT cp.alias FROM child_profiles cp
        WHERE cp.parent_user_id = ?1 AND cp.deleted_at IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM mission_daily_summary m
             WHERE m.child_profile_id = cp.id AND m.local_date = ?2 AND m.completed = 1
          )
          AND NOT (
            cp.theme_band = 'KINDER' AND EXISTS (
              SELECT 1 FROM child_streak s
               WHERE s.child_profile_id = cp.id AND s.last_completed_local_date = ?2
            )
          )
        ORDER BY cp.created_at`,
    )
    .bind(userId, diaLocal)
    .all<{ alias: string }>();

  const adultoPendiente =
    esAprendiz &&
    !(await db
      .prepare(
        "SELECT 1 AS x FROM mission_daily_summary WHERE user_id = ?1 AND local_date = ?2 AND completed = 1 LIMIT 1",
      )
      .bind(userId, diaLocal)
      .first());

  return {
    aliases: (pendientes.results ?? []).map((f) => f.alias),
    adultoPendiente,
  };
}
