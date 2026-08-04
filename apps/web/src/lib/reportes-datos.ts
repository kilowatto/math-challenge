/**
 * La capa de lectura del reporte (F8 #288): arma las `FilaHijoParaReporte`
 * desde las tablas de estado que YA existen y escriben otros subsistemas.
 *
 * ─── El reporte COMPONE, no recalcula ──────────────────────────────────────
 *
 * Nada aquí suma intentos ni estima maestría: los puntos vienen de
 * `score_totals` (F3/F4), el XP de `xp_totals` (F7), la racha y la pausa de
 * `child_streak` (F7), las habilidades de `skill_state` (F4) y los minutos de
 * `screen_time_daily_usage` (F8 · límite de pantalla, #267). Analytics Engine
 * no guarda `childProfileId` (#286, verificado en `apps/ingest/src/index.ts`),
 * así que no hay otra fuente de la que esto pudiera construirse — y no hace
 * falta.
 *
 * Lo único que este archivo añade es el snapshot de `child_report_state`:
 * contra él mide el motor lo ganado en el periodo.
 *
 * ─── Por qué estas consultas NO cruzan `child_consents` ────────────────────
 *
 * tablero-orden-puntos-hogar: score_totals — F8 #286-#288: el reporte por
 * correo lee los perfiles DEL PROPIO HOGAR (`parent_user_id = ?`) para el
 * padre que ya los ve en su panel; el opt-in LEADERBOARD de D-040 gobierna
 * aparecer en listas que otros ven, y este correo no es una lista que otros
 * ven.
 *
 * `audits/tablero-orden-puntos.mjs` exige el cruce a toda consulta de
 * `score_totals`, y tiene razón EN SU TERRITORIO: la instantánea del tablero,
 * donde un perfil aparece ante otros (D-040: sin fila `LEADERBOARD` vigente,
 * ningún niño sale en ninguna lista). Este archivo no es eso: lee los perfiles
 * DEL PROPIO HOGAR (`parent_user_id = ?`) para el correo que va al padre
 * dueño de esos perfiles — la misma visibilidad que el panel del padre, que
 * muestra a sus hijos sin exigir el opt-in del tablero. El consentimiento
 * `LEADERBOARD` gobierna aparecer en una lista que otros ven; el reporte al
 * padre no es una lista que otros ven. Ninguna consulta de aquí devuelve un
 * perfil ajeno al hogar que la pidió: el filtro por `parent_user_id` ES la
 * frontera, y es estructural, no de plantilla.
 *
 * ─── Lo que NO lee ─────────────────────────────────────────────────────────
 *
 * Nada que el padre no vea ya en su panel: alias, puntos, XP, racha,
 * habilidades y minutos. El correo nombra hijos por ALIAS solamente (línea
 * roja #2, mc-25) y ninguna consulta de aquí toca un dato del niño más allá
 * de esa lista.
 */

import type { FilaHijoParaReporte } from "../../../../packages/motor/src/reportes.ts";

interface HijoBase {
  id: string;
  alias: string;
}

/**
 * Las filas de todos los hijos del hogar, listas para `construirReporteHogar`.
 *
 * @param diasLocales el rango de días LOCALES del periodo (`YYYY-MM-DD`,
 *   inclusivos) para componer minutos y días activos desde
 *   `screen_time_daily_usage` — la zona ya la aplicó quien llama.
 */
export async function leerFilasHogar(
  DB: D1Database,
  userId: string,
  periodo: { desde: number; hasta: number },
  diasLocales: { desde: string; hasta: string },
): Promise<FilaHijoParaReporte[]> {
  const hijos = await DB.prepare(
    `SELECT id, alias FROM child_profiles
      WHERE parent_user_id = ? AND deleted_at IS NULL`,
  )
    .bind(userId)
    .all<HijoBase>();

  const filas: FilaHijoParaReporte[] = [];
  for (const hijo of hijos.results ?? []) {
    // Puntos: el acumulado `all_time`. Se suma por si alguna temporada deja
    // más de una fila por banda; la llave es (perfil, periodo) así que hoy es
    // una sola, y el motor recibe UN número.
    const puntos = await DB.prepare(
      `SELECT COALESCE(SUM(total_score), 0) AS total FROM score_totals
        WHERE child_profile_id = ? AND period = 'all_time'`,
    )
      .bind(hijo.id)
      .first<{ total: number }>();

    // XP (F7). Sin fila → ausente → `null` en la salida, nunca 0 (#288).
    const xp = await DB.prepare(
      "SELECT total_xp FROM xp_totals WHERE child_profile_id = ?",
    )
      .bind(hijo.id)
      .first<{ total_xp: number }>();

    // Racha y pausa (F7). Sin fila → ausentes por la misma regla.
    const racha = await DB.prepare(
      `SELECT current_streak, max_streak, pause_until_local_date
         FROM child_streak WHERE child_profile_id = ?`,
    )
      .bind(hijo.id)
      .first<{
        current_streak: number;
        max_streak: number;
        pause_until_local_date: string | null;
      }>();

    // Habilidades dominadas EN el periodo (mastered_at entre desde y hasta).
    const dominadas = await DB.prepare(
      `SELECT skill_id FROM skill_state
        WHERE child_profile_id = ? AND mastered_at IS NOT NULL
          AND mastered_at >= ? AND mastered_at < ?`,
    )
      .bind(hijo.id, periodo.desde, periodo.hasta)
      .all<{ skill_id: string }>();

    // Repaso pendiente AL CIERRE del periodo: un conteo, no una lista.
    const repaso = await DB.prepare(
      `SELECT COUNT(*) AS n FROM skill_state
        WHERE child_profile_id = ? AND due_at IS NOT NULL AND due_at <= ?`,
    )
      .bind(hijo.id, periodo.hasta)
      .first<{ n: number }>();

    // Minutos y días activos del periodo, COMPUESTOS del rollup diario que el
    // límite de pantalla ya escribe (#267). Sin filas en el rango → 0/0, que
    // sí es un dato («no practicó»), no una ausencia.
    const tiempo = await DB.prepare(
      `SELECT COALESCE(SUM(minutes_used), 0) AS minutos, COUNT(*) AS dias
         FROM screen_time_daily_usage
        WHERE child_profile_id = ? AND local_date >= ? AND local_date <= ?`,
    )
      .bind(hijo.id, diasLocales.desde, diasLocales.hasta)
      .first<{ minutos: number; dias: number }>();

    // El snapshot contra el que se mide el periodo. Sin fila (primer correo):
    // ceros — todo lo acumulado cuenta como ganado en el primer reporte.
    const snapshot = await DB.prepare(
      `SELECT last_score_all_time, last_xp_total FROM child_report_state
        WHERE child_profile_id = ?`,
    )
      .bind(hijo.id)
      .first<{ last_score_all_time: number; last_xp_total: number | null }>();

    filas.push({
      childProfileId: hijo.id,
      alias: hijo.alias,
      scoreAllTime: puntos?.total ?? 0,
      xpTotal: xp?.total_xp ?? null,
      currentStreak: racha?.current_streak ?? null,
      maxStreak: racha?.max_streak ?? null,
      pauseUntilLocalDate: racha?.pause_until_local_date ?? null,
      skillsMasteredInPeriod: (dominadas.results ?? []).map((d) => d.skill_id),
      skillsDueForReview: repaso?.n ?? 0,
      minutosPracticados: tiempo?.minutos ?? 0,
      diasActivos: tiempo?.dias ?? 0,
      snapshot: {
        lastScoreAllTime: snapshot?.last_score_all_time ?? 0,
        lastXpTotal: snapshot?.last_xp_total ?? null,
      },
    });
  }

  return filas;
}
