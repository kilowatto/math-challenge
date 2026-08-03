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
 * «Meta completada» hoy significa `mission_daily_summary.completed = 1` en el
 * día LOCAL del hogar (D-104: KINDER no escribe fila, así que para un hogar
 * de solo kinder la meta cuenta como nunca completada — declarado en el PR,
 * no escondido en el código).
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
         (SELECT COUNT(DISTINCT m.child_profile_id) FROM mission_daily_summary m
           JOIN child_profiles cp ON cp.id = m.child_profile_id
           WHERE cp.parent_user_id = ?1 AND cp.deleted_at IS NULL
             AND m.local_date = ?2 AND m.completed = 1)
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
