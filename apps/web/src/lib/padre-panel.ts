/**
 * La capa de datos del panel del padre con diagnóstico (F8 #279-#285).
 *
 * ─── Qué vive aquí, y por qué no en la ruta ─────────────────────────────────
 *
 * Las lecturas de `/[locale]/app/parent/panel/*`: ocho consultas a las tablas
 * que F2/F4/F7/F8-límite ya son dueñas de producir, compuestas en el
 * `FilasCrudasDeD1` que `componerDiagnostico()` del motor espera. Viven aquí
 * y no en la página por la misma razón que `padre-limite.ts`: un SQL mal
 * escrito no da error, da un padre mirando datos del niño equivocado — y eso
 * solo se ve ejecutándolo, en `padre-panel.prueba.mjs` contra `node:sqlite`.
 *
 * Todas las importaciones llevan extensión `.ts` explícita por testabilidad
 * (la prueba carga este módulo con `node --experimental-strip-types`), el
 * mismo motivo de siempre.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No calcula nada.** Cada consulta lee la fila tal cual la escribió su
 *    dueño; la composición es de `packages/motor/src/diagnostico.ts`. Si aquí
 *    apareciera una fórmula —un rango despejado, una posición ordenada a
 *    mano— sería la segunda fuente de verdad que #279 prohíbe.
 *  · **No escribe.** Ni `seen_at` (las notas no tienen escritores todavía:
 *    marcar como vista una nota que no puede existir es código sin llamador),
 *    ni configuración del límite (eso es #269, ya cerrado — el panel ENLAZA
 *    a esa pantalla, no la duplica, #282).
 *  · **No autoriza.** Eso es `hijoDelPadre()` de `padre-limite.ts`, que la
 *    página llama ANTES: aquí todo llega ya verificado como de ESTE padre.
 *  · **No toca Analytics Engine.** El panel solo lee D1 (mc-32 riesgo #1,
 *    D-013); `audits/panel-sin-detalle-de-intento.mjs` lo hace cumplir.
 */

import {
  estadoDelLimite,
  type EstadoDelLimite,
  type HijoDelPadre,
} from "./padre-limite.ts";
import type {
  FilaDeCosmetico,
  FilaDeUso,
  FilaNota,
  FilaPuntos,
  FilaRacha,
  FilaSkillState,
  FilasCrudasDeD1,
} from "../../../../packages/motor/src/diagnostico.ts";
import type { Membresia } from "../../../../packages/motor/src/liga.ts";
import { sumarDias } from "../../../../packages/motor/src/racha.ts";
import { tieneLimite, type BandaConLimite } from "../../../../packages/motor/src/limite-pantalla.ts";
import type { DiaLocal } from "../../../../packages/motor/src/tiempo-local.ts";
import type { TemaVisual } from "../../../../packages/motor/src/bandas.ts";

/** Cuántas notas ve el padre de una vez. El historial completo queda en D1. */
const TOPE_NOTAS = 50;

/** La ventana de la tendencia: 8 semanas de 7 días, terminando hoy (#282). */
const DIAS_DE_TENDENCIA = 56;

/** Lo que la página monta: las filas crudas para el motor + el estado del límite. */
export interface DatosDelPanel {
  readonly filas: FilasCrudasDeD1;
  /** La configuración vigente del límite y los minutos de hoy (#269, reusado). */
  readonly limite: EstadoDelLimite;
}

/**
 * Lee todo lo que el panel muestra de UN hijo, ya verificado como de ESTE
 * padre. Ocho lecturas en dos tandas: primero las que no dependen de nada, y
 * la cohorte de liga después de saber si hay membresía vigente — la única
 * lectura condicional, porque ordenar una cohorte a la que el niño ni
 * pertenece sería leer datos de otros niños sin motivo (D-013, minimización).
 *
 * La sección de liga es `null` en dos casos que el panel no distingue a
 * propósito: sin consentimiento `LEADERBOARD` vigente (D-040 — nunca se
 * infiere un ranking sin opt-in) o sin membresía. Los dos terminan en la
 * sección omitida, nunca en un estado vacío que insinúe fracaso (#281).
 */
export async function leerDatosDelPanel(
  db: D1Database,
  hijo: HijoDelPadre,
  diaLocal: DiaLocal,
): Promise<DatosDelPanel> {
  const banda = hijo.theme_band as TemaVisual;
  const desdeTendencia = sumarDias(diaLocal, -(DIAS_DE_TENDENCIA - 1));

  const [estados, racha, xp, puntos, consentimientoLiga, membresia, notas, uso, cosmeticos] =
    await Promise.all([
      db
        .prepare(
          "SELECT skill_id, attempts, provisional_at, mastered_at, updated_at " +
            "FROM skill_state WHERE child_profile_id = ?",
        )
        .bind(hijo.id)
        .all<FilaSkillState & { skill_id: string }>(),
      db
        .prepare(
          "SELECT current_streak, max_streak, shields_available, pause_until_local_date " +
            "FROM child_streak WHERE child_profile_id = ?",
        )
        .bind(hijo.id)
        .first<FilaRacha>(),
      db
        .prepare("SELECT total_xp FROM xp_totals WHERE child_profile_id = ?")
        .bind(hijo.id)
        .first<{ total_xp: number }>(),
      db
        .prepare(
          "SELECT period, theme_band, total_score FROM score_totals WHERE child_profile_id = ?",
        )
        .bind(hijo.id)
        .all<FilaPuntos>(),
      db
        .prepare(
          "SELECT 1 AS ok FROM child_consents " +
            "WHERE child_profile_id = ? AND consent_code = 'LEADERBOARD' AND revoked_at IS NULL",
        )
        .bind(hijo.id)
        .first<{ ok: number }>(),
      db
        .prepare(
          "SELECT m.id, m.cohort_id FROM league_membership m " +
            "JOIN league_cohort c ON c.id = m.cohort_id " +
            "WHERE m.child_profile_id = ? " +
            "ORDER BY c.week_start DESC, m.joined_at DESC LIMIT 1",
        )
        .bind(hijo.id)
        .first<{ id: string; cohort_id: string }>(),
      db
        .prepare(
          "SELECT id, cause_code, skill_id, created_at, seen_at " +
            "FROM child_diagnostic_notes WHERE child_profile_id = ? " +
            "ORDER BY created_at DESC LIMIT ?",
        )
        .bind(hijo.id, TOPE_NOTAS)
        .all<FilaNota>(),
      db
        .prepare(
          "SELECT local_date, minutes_used, ended_reason FROM screen_time_daily_usage " +
            "WHERE child_profile_id = ? AND local_date >= ? ORDER BY local_date",
        )
        .bind(hijo.id, desdeTendencia)
        .all<FilaDeUso>(),
      // El roadmap de la banda del niño (0015): catálogo con su regla de
      // condición y, si existe, la fila de desbloqueo de ESTE niño. La
      // condición viaja como clave i18n — nunca la fórmula (#284).
      db
        .prepare(
          "SELECT c.id AS cosmetic_id, c.nombre_clave, c.condicion_clave, " +
            "c.arte_avif_url, c.arte_webp_url, c.arte_silueta_url, c.es_inicial, " +
            "u.unlocked_at FROM cosmetic_catalog c " +
            "LEFT JOIN child_cosmetics_unlocked u " +
            "ON u.cosmetic_id = c.id AND u.child_profile_id = ? " +
            "WHERE c.banda_minima = ? ORDER BY c.created_at, c.id",
        )
        .bind(hijo.id, banda)
        .all<FilaDeCosmetico>(),
    ]);

  // La liga solo se lee si hay consentimiento Y membresía vigentes (D-040).
  let liga: FilasCrudasDeD1["liga"] = null;
  if (consentimientoLiga !== null && membresia !== null) {
    const miembros = await db
      .prepare(
        "SELECT id, child_profile_id, user_id, points_this_week, active_days, joined_at " +
          "FROM league_membership WHERE cohort_id = ?",
      )
      .bind(membresia.cohort_id)
      .all<Membresia>();
    liga = { miembros: miembros.results ?? [], membresiaPropiaId: membresia.id };
  }

  // El estado del límite se lee con la MISMA función de #269 — el panel no
  // tiene su propia versión de «configuración vigente + minutos de hoy». El
  // CHECK de la 0002 restringe theme_band a las tres bandas de niño, y las
  // tres tienen límite; el guard es por el dato roto, no por el caso de uso.
  const limite = tieneLimite(banda)
    ? await estadoDelLimite(db, hijo.id, banda as BandaConLimite, diaLocal)
    : null;
  const usoDeHoy = (uso.results ?? []).find((d) => d.local_date === diaLocal);

  const mapaDeEstados: Record<string, FilaSkillState> = {};
  for (const fila of estados.results ?? []) {
    const { skill_id, ...resto } = fila;
    mapaDeEstados[skill_id] = resto;
  }

  return {
    filas: {
      hijoId: hijo.id,
      banda,
      estados: mapaDeEstados,
      racha: racha ?? null,
      xpTotal: xp?.total_xp ?? null,
      puntos: puntos.results ?? [],
      liga,
      notas: notas.results ?? [],
      pantalla: {
        hoyMinutos: limite?.minutosUsados ?? usoDeHoy?.minutes_used ?? 0,
        terminoPorLimiteHoy: usoDeHoy?.ended_reason != null,
        dias: uso.results ?? [],
      },
      cosmeticos: cosmeticos.results ?? [],
      diaHoy: diaLocal,
    },
    // Sin límite posible es un dato roto en una banda de niño; la página lo
    // trata como «sin configurar», nunca como un error 500 delante del padre.
    limite: limite ?? {
      config: { daily_minutes: 0, break_every_min: 0, bedtime_cutoff_min: 0, bedtime_local: null },
      tieneFila: false,
      minutosUsados: usoDeHoy?.minutes_used ?? 0,
    },
  };
}
