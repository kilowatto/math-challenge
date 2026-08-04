/**
 * La capa de datos de la pantalla del padre (F8 #269).
 *
 * ─── Qué vive aquí, y por qué no en la ruta ─────────────────────────────────
 *
 * Las tres operaciones de `/[locale]/app/parent/screen-time/[childId]` y de
 * `/api/padre-limite`: demostrar que el niño es de ESTE padre, leer el estado
 * del límite (configuración vigente + minutos de hoy), y guardar la
 * configuración. Viven aquí y no en la página ni en el endpoint por la misma
 * razón que `push-hogares.ts`: un SQL mal escrito no da error, da un padre
 * mirando al hijo de otro — y eso solo se ve ejecutándolo, en
 * `padre-limite.prueba.mjs` contra `node:sqlite`.
 *
 * Todas las importaciones llevan extensión `.ts` explícita por testabilidad:
 * la prueba carga este módulo con `node --experimental-strip-types`, que no
 * resuelve rutas sin extensión. Es el mismo motivo por el que `apps/ingest`
 * y `packages/motor` las llevan siempre.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No decide el rango.** Eso es `minutosDiariosPermitidos()` del motor, la
 *    ÚNICA función que sabe si un valor es válido para una banda (D-016). Si
 *    aquí hubiera una segunda copia de `[minMin, maxMin]`, la interfaz podría
 *    ofrecer un valor que el servidor rechaza — que es exactamente el fallo
 *    que una sola función cierra.
 *  · **No lee el reloj del dispositivo.** El día de hoy llega como parámetro
 *    (`diaLocal`), calculado con `users.timezone` del padre — la misma regla
 *    que la racha y que la migración 0011.
 *  · **No escribe el uso.** Los minutos jugados los escribe `SQL_UPSERT_USO`
 *    del motor desde la superficie del reto (#267); aquí solo se LEEN, para el
 *    «hoy jugó X de Y minutos» de `mc-26` implicación #11.
 *  · **No acepta ninguna bandera de plan o pago.** El límite no se levanta
 *    pagando (línea roja #4, D-057): no hay parámetro donde ponerla.
 */

import {
  LIMITES_POR_BANDA,
  configuracionPorDefecto,
  configuracionVigente,
  minutosDiariosPermitidos,
  minutosDelDia,
  tieneLimite,
  type BandaConLimite,
  type ConfiguracionDeLimite,
  type HoraLocal,
} from "../../../../packages/motor/src/limite-pantalla.ts";
import type { DiaLocal } from "../../../../packages/motor/src/tiempo-local.ts";
import type { TemaVisual } from "../../../../packages/motor/src/bandas.ts";

/** Lo que la pantalla necesita saber del niño: que es de este padre, y su banda. */
export interface HijoDelPadre {
  readonly id: string;
  readonly alias: string;
  readonly theme_band: string;
}

/**
 * ¿Es `childId` un perfil vivo de ESTE padre?
 *
 * Es la única comprobación de propiedad de esta superficie, y es de línea roja
 * #2: el padre ve a SUS hijos, nunca a los de otra cuenta. Un `null` aquí no
 * distingue «no existe» de «no es tuyo» a propósito — quien prueba ids ajenos
 * no aprende cuáles existen. La página y el endpoint responden 404 a los dos.
 *
 * `deleted_at IS NULL` usa el índice parcial `idx_child_parent` de la 0002: un
 * perfil borrado no es un error, es un niño que ya no está en la cuenta.
 */
export async function hijoDelPadre(
  db: D1Database,
  parentUserId: string,
  childId: string,
): Promise<HijoDelPadre | null> {
  const fila = await db
    .prepare(
      "SELECT id, alias, theme_band FROM child_profiles " +
        "WHERE id = ? AND parent_user_id = ? AND deleted_at IS NULL",
    )
    .bind(childId, parentUserId)
    .first<{ id: string; alias: string; theme_band: string }>();
  return fila ?? null;
}

/** La fila de `screen_time_settings`, o `null` si el padre nunca guardó. */
async function leerFilaConfig(
  db: D1Database,
  childId: string,
): Promise<ConfiguracionDeLimite | null> {
  const fila = await db
    .prepare(
      "SELECT daily_minutes, break_every_min, bedtime_cutoff_min, bedtime_local " +
        "FROM screen_time_settings WHERE child_profile_id = ?",
    )
    .bind(childId)
    .first<{
      daily_minutes: number;
      break_every_min: number;
      bedtime_cutoff_min: number;
      bedtime_local: HoraLocal | null;
    }>();
  return fila ?? null;
}

/** Lo que el padre ve al abrir la pantalla, y lo que el refresco de ~30 s relee. */
export interface EstadoDelLimite {
  /** La configuración que DE VERDAD se aplica, con o sin fila (el motor decide). */
  readonly config: ConfiguracionDeLimite;
  /** `false` cuando el padre nunca guardó: la pantalla muestra el default de la banda. */
  readonly tieneFila: boolean;
  /** Minutos jugados hoy (día local del hogar), 0 si todavía no hay fila. */
  readonly minutosUsados: number;
}

/**
 * La configuración vigente y los minutos de hoy.
 *
 * Sin fila en `screen_time_settings` —que hoy son todos los perfiles, porque el
 * paso de onboarding de F2 nunca se construyó— **no hay límite vigente (D-139,
 * 2026-08-03)**: la protección empieza cuando el padre guarda aquí por primera
 * vez. Lo que esta función devuelve en ese caso es el default de la banda como
 * OFERTA —lo que el control de la pantalla precarga y lo que quedaría si el
 * padre guarda sin tocar nada—, no como límite activo; `tieneFila: false` es
 * lo que distingue los dos mundos. Y `bedtime_local` nace en `null`: el corte
 * nocturno no se enciende solo, porque adivinar una hora de dormir sería un
 * dato que el producto no tiene (D-053).
 */
export async function estadoDelLimite(
  db: D1Database,
  childId: string,
  banda: BandaConLimite,
  diaLocal: DiaLocal,
): Promise<EstadoDelLimite> {
  const [fila, uso] = await Promise.all([
    leerFilaConfig(db, childId),
    db
      .prepare(
        "SELECT minutes_used FROM screen_time_daily_usage " +
          "WHERE child_profile_id = ? AND local_date = ?",
      )
      .bind(childId, diaLocal)
      .first<{ minutes_used: number }>(),
  ]);
  return {
    // D-139: sin fila, `configuracionVigente` es `null` («sin límite»). La
    // pantalla muestra entonces el default de la banda como punto de partida
    // de la OFERTA — ver el encabezado de esta función.
    config: configuracionVigente(banda, fila) ?? configuracionPorDefecto(banda),
    tieneFila: fila !== null,
    minutosUsados: uso?.minutes_used ?? 0,
  };
}

/** Lo que contesta un intento de guardado. */
export type ResultadoGuardado =
  | { readonly ok: true }
  | { readonly ok: false; readonly motivo: string };

export interface PedidoDeGuardado {
  /** El perfil, ya verificado como de ESTE padre por `hijoDelPadre`. */
  readonly hijo: HijoDelPadre;
  readonly parentUserId: string;
  /** Los minutos diarios pedidos. Llega crudo: aquí se valida. */
  readonly dailyMinutes: number;
  /** ¿El interruptor del corte nocturno va encendido? */
  readonly corteNocturno: boolean;
  /** La hora de dormir. Solo se mira si `corteNocturno` es `true`. */
  readonly bedtimeLocal: string;
  /** Sello del servidor, en segundos UNIX. */
  readonly ahora: number;
}

/**
 * El upsert del límite. **Con o sin fila previa** (§5.5 del plan): el primer
 * guardado del padre la crea con `updated_by = parent_user_id`.
 *
 * La validación corre ANTES de tocar la base y es la del motor, no una copia:
 *
 *  · `dailyMinutes` pasa por `minutosDiariosPermitidos()` — el cliente ya
 *    limita con `min`/`max`/`step`, y aquí no se confía en el cliente. El
 *    motivo cita el rango (`minutos_fuera_de_rango:10-45`) para que la
 *    bitácora diga contra qué regla se chocó; la interfaz lo sabe sola.
 *  · `bedtimeLocal` pasa por `minutosDelDia()` del motor, que lanza sobre
 *    cualquier cosa que no sea `HH:MM` de 00:00 a 23:59. Es más estricto que
 *    el GLOB de la 0003 (que deja pasar `29:99`), y es la misma forma que el
 *    motor espera al calcular la ventana nocturna.
 *
 * `break_every_min` y `bedtime_cutoff_min` se escriben SIEMPRE con el valor
 * fijo de la banda (§5.2: no se exponen en esta pasada, y D-016 no publica
 * rango para ninguna de las dos).
 *
 * Cada guardado registra el consentimiento `SCREEN_TIME` en `child_consents`
 * (D-051, §5.4 del plan): la fila del catálogo existe desde la 0003 y nadie la
 * escribía, porque `setup/screen-time` de F2 nunca se construyó.
 * `INSERT OR IGNORE` porque re-guardar no es re-consentir: la primera fila,
 * con su `granted_at`, es la que vale.
 */
export async function guardarLimite(
  db: D1Database,
  pedido: PedidoDeGuardado,
): Promise<ResultadoGuardado> {
  // La columna es `TEXT` y el CHECK de la 0002 la restringe a las tres bandas
  // de niño; el casteo a `TemaVisual` registra ese hecho para el guardián de
  // tipos. La comprobación real es la de abajo: llegar a `banda_sin_limite`
  // sería un dato roto, no un usuario raro.
  const bandaRaw = pedido.hijo.theme_band as TemaVisual;
  if (!tieneLimite(bandaRaw)) {
    return { ok: false, motivo: "banda_sin_limite" };
  }
  const banda = bandaRaw;

  if (!minutosDiariosPermitidos(banda, pedido.dailyMinutes)) {
    const limite = LIMITES_POR_BANDA[banda];
    return {
      ok: false,
      motivo: `minutos_fuera_de_rango:${limite.minMin}-${limite.maxMin}`,
    };
  }

  // Interruptor apagado = `bedtime_local = NULL`, el estado que la 0003
  // distingue explícitamente de medianoche. Si el interruptor va apagado, lo
  // que viaje en `bedtimeLocal` se DESCARTA: un `<input type="time">` sucio no
  // puede encender el corte por la puerta de atrás.
  let bedtime: HoraLocal | null = null;
  if (pedido.corteNocturno) {
    try {
      minutosDelDia(pedido.bedtimeLocal);
      bedtime = pedido.bedtimeLocal;
    } catch {
      return { ok: false, motivo: "hora_mal_formada" };
    }
  }

  const limite = LIMITES_POR_BANDA[banda];
  await db.batch([
    db
      .prepare(
        "INSERT INTO screen_time_settings (" +
          "child_profile_id, daily_minutes, break_every_min, bedtime_cutoff_min, " +
          "bedtime_local, updated_at, updated_by" +
          ") VALUES (?, ?, ?, ?, ?, ?, ?) " +
          "ON CONFLICT (child_profile_id) DO UPDATE SET " +
          "daily_minutes = excluded.daily_minutes, " +
          "break_every_min = excluded.break_every_min, " +
          "bedtime_cutoff_min = excluded.bedtime_cutoff_min, " +
          "bedtime_local = excluded.bedtime_local, " +
          "updated_at = excluded.updated_at, " +
          "updated_by = excluded.updated_by",
      )
      .bind(
        pedido.hijo.id,
        pedido.dailyMinutes,
        limite.descansoCadaMin,
        limite.corteNocturnoMinAntes,
        bedtime,
        pedido.ahora,
        pedido.parentUserId,
      ),
    // El consentimiento, en el MISMO batch: o están los dos o no está ninguno.
    db
      .prepare(
        "INSERT OR IGNORE INTO child_consents " +
          "(child_profile_id, consent_code, granted_by, granted_at, consent_version) " +
          "VALUES (?, 'SCREEN_TIME', ?, ?, " +
          "(SELECT current_version FROM consent_type_catalog WHERE code = 'SCREEN_TIME'))",
      )
      .bind(pedido.hijo.id, pedido.parentUserId, pedido.ahora),
  ]);
  return { ok: true };
}
