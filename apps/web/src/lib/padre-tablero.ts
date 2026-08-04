/**
 * El opt-in del tablero, por hijo (F7 #247 · D-040, D-051, D-081).
 *
 * ─── Qué vive aquí ───────────────────────────────────────────────────────────
 *
 * Las tres operaciones de `/[locale]/app/parent/tablero/[childId]` y de
 * `/api/padre-tablero`: leer el estado del consentimiento `LEADERBOARD`,
 * activarlo y desactivarlo. La propiedad del perfil la comprueba
 * `hijoDelPadre()` de `padre-limite.ts` — la ÚNICA función de este subsistema
 * que responde «¿este niño es de ESTE padre?», y no se copia (línea roja #2).
 *
 * ─── El gobierno único (D-051) ───────────────────────────────────────────────
 *
 *  · **Alta = INSERT con `granted_by` y `consent_version`.** Sin fila no hay
 *    tablero: la AUSENCIA de fila es el apagado (D-040), y nadie inserta nada
 *    al crear el perfil.
 *  · **Baja = `revoked_at`. NUNCA DELETE.** La fila es la prueba de que el
 *    padre consintió y de cuándo dejó de consentir; borrarla es la
 *    desaparición de la prueba. Y desactivar **no toca `score_totals`**: los
 *    puntos son del niño, no del tablero — el borrado de verdad tiene su
 *    propio runbook (`audits/borrado-cuatro-sistemas.mjs`), que no es este.
 *  · **Re-activar = UPDATE que registra el NUEVO alta.** Se limpia
 *    `revoked_at` y se reescriben `granted_by`/`granted_at`/`consent_version`:
 *    lo que queda escrito es quién lo volvió a encender y cuándo, no la
 *    primera vez. La llave primaria `(child_profile_id, consent_code)` de la
 *    0003 no admite una segunda fila, así que el historial fino no cabe aquí —
 *    dicho de frente.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No decide quién ve el tablero de KINDER.** Eso es la página del padre y
 *    `tablero-sin-kinder-publico.mjs`. Aquí el consentimiento es igual para
 *    las tres bandas; lo que cambia por banda es la VISIBILIDAD (D-081).
 *  · **No acepta ninguna bandera de plan o pago.** Aparecer en el tablero no
 *    se compra (líneas rojas #4 y #5): no hay parámetro donde ponerla.
 */

import type { HijoDelPadre } from "./padre-limite.ts";

/** El estado del consentimiento `LEADERBOARD` de un perfil. */
export interface ConsentimientoTablero {
  /** `true` solo con fila y `revoked_at IS NULL`. La ausencia de fila es el apagado. */
  readonly vigente: boolean;
  /** `null` cuando nunca existió la fila — el default apagado de D-040. */
  readonly grantedBy: string | null;
  readonly grantedAt: number | null;
  readonly revokedAt: number | null;
}

export async function consentimientoTablero(
  db: D1Database,
  childId: string,
): Promise<ConsentimientoTablero> {
  const fila = await db
    .prepare(
      "SELECT granted_by, granted_at, revoked_at FROM child_consents " +
        "WHERE child_profile_id = ? AND consent_code = 'LEADERBOARD'",
    )
    .bind(childId)
    .first<{ granted_by: string; granted_at: number; revoked_at: number | null }>();
  if (!fila) return { vigente: false, grantedBy: null, grantedAt: null, revokedAt: null };
  return {
    vigente: fila.revoked_at === null,
    grantedBy: fila.granted_by,
    grantedAt: fila.granted_at,
    revokedAt: fila.revoked_at,
  };
}

export interface PedidoDeOptIn {
  /** El perfil, ya verificado como de ESTE padre por `hijoDelPadre`. */
  readonly hijo: HijoDelPadre;
  readonly parentUserId: string;
  /** Sello del servidor, en segundos UNIX. */
  readonly ahora: number;
}

/**
 * Activar. Idempotente: un doble envío no crea nada dos veces ni reescribe el
 * `granted_at` de un consentimiento vigente — la primera fila es la que vale.
 */
export async function activarTablero(
  db: D1Database,
  pedido: PedidoDeOptIn,
): Promise<{ ok: true }> {
  const estado = await consentimientoTablero(db, pedido.hijo.id);
  if (estado.vigente) return { ok: true };

  if (estado.grantedBy === null) {
    // El alta: INSERT con `granted_by` y la versión del texto que el padre
    // aceptó, resuelta del catálogo (D-051). Nunca al crear el perfil (D-040).
    await db
      .prepare(
        "INSERT INTO child_consents " +
          "(child_profile_id, consent_code, granted_by, granted_at, consent_version) " +
          "VALUES (?, 'LEADERBOARD', ?, ?, " +
          "(SELECT current_version FROM consent_type_catalog WHERE code = 'LEADERBOARD'))",
      )
      .bind(pedido.hijo.id, pedido.parentUserId, pedido.ahora)
      .run();
    return { ok: true };
  }

  // La re-activación: no es que la fila vieja «vuelva» — es un ALTA NUEVA con
  // su quién y su cuándo. `revoked_at` se limpia, nunca se borra la fila.
  await db
    .prepare(
      "UPDATE child_consents SET revoked_at = NULL, granted_by = ?, granted_at = ?, " +
        "consent_version = (SELECT current_version FROM consent_type_catalog WHERE code = 'LEADERBOARD') " +
        "WHERE child_profile_id = ? AND consent_code = 'LEADERBOARD' AND revoked_at IS NOT NULL",
    )
    .bind(pedido.parentUserId, pedido.ahora, pedido.hijo.id)
    .run();
  return { ok: true };
}

/**
 * Desactivar = REVOCAR. `revoked_at` y nada más.
 *
 * **NUNCA DELETE** (D-051): la fila es la prueba ante un regulador de que el
 * consentimiento existió y de cuándo terminó. Y **nunca toca `score_totals`**:
 * apagar el tablero saca al niño de las listas, no le quita sus puntos (#247,
 * casilla de cierre). Idempotente: revocar dos veces deja el primer
 * `revoked_at`, que es el que vale.
 */
export async function desactivarTablero(
  db: D1Database,
  pedido: PedidoDeOptIn,
): Promise<{ ok: true }> {
  await db
    .prepare(
      "UPDATE child_consents SET revoked_at = ? " +
        "WHERE child_profile_id = ? AND consent_code = 'LEADERBOARD' AND revoked_at IS NULL",
    )
    .bind(pedido.ahora, pedido.hijo.id)
    .run();
  return { ok: true };
}
