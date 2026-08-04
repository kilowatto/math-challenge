/**
 * El módulo AUTORIZADO de la aprobación del padre (F9 · #382, D-011, D-096 del
 * reparto del orquestador).
 *
 * ─── Por qué este archivo existe como módulo único ───────────────────────────
 *
 * El código de unión produce una SOLICUD, nunca una entrada: quien convierte
 * la intención en membresía tiene que ser el padre de ESE niño, viendo antes
 * la identidad del dueño, y la fila tiene que quedar firmada (`decided_by` =
 * la sesión que decidió). **La membresía ES el consentimiento** (D-096): esta
 * fila es la prueba de que ESTE padre aprobó la entrada de ESTE niño a ESTE
 * grupo.
 *
 * Por eso la escritura vive en UN sitio. `audits/grupo-aprobacion-padre.mjs`
 * tiene el nombre de este archivo escrito a mano en su lista blanca desde
 * antes de que existiera, y bloquea cualquier otra escritura de `approved`
 * sobre `child_group_membership` — incluida la segunda ruta que alguien añada
 * dentro de seis meses «solo para importar», que es como este control se
 * rompe siempre.
 *
 * Las tres condiciones que el auditor busca en este módulo, y que la prueba
 * (`padre-grupo.prueba.mjs`) ejercita contra `node:sqlite` con las
 * migraciones REALES:
 *
 *  1. **pending** — toda decisión nace de una solicitud: la fila se crea en
 *     `pending` si el padre aplaza, y una aprobación directa es la decisión
 *     de una solicitud que se crea y se decide en el mismo acto. Aprobar lo
 *     que no se pidió sería inventar una entrada.
 *  2. **parent_user_id** — el perfil del niño tiene que pertenecer a la
 *     cuenta de la sesión: nadie aprueba al hijo de otro (línea roja #2).
 *     El `null` no distingue «no existe» de «no es tuyo», como `hijoDelPadre`.
 *  3. **decided_by** — la fila firma QUIÉN decidió y cuándo. Un `pending`
 *     lleva los dos en NULL: todavía no es una decisión, es una solicitud
 *     aplazada.
 *
 * ─── Ver la tarjeta no escribe nada ──────────────────────────────────────────
 *
 * `grupoPorCodigo` y `tarjetaParaPadre` son LECTURA. Cerrar la pantalla sin
 * decidir no crea fila: si se registrara la intención, un vistazo bloquearía
 * la re-solicitud (`idx_cgm_viva`) y llenaría la bitácora de filas que no son
 * ninguna decisión (F9 §5.2 paso 5).
 *
 * ─── Lo que este módulo NO hace ──────────────────────────────────────────────
 *
 *  · **No avisa al dueño de un rechazo.** El niño rechazado simplemente no
 *    aparece nunca: un rechazo con aviso es un mensaje sobre una familia
 *    específica (issue #382, criterio explícito).
 *  · **No activa el ranking por el niño.** `leaderboard_opt_in` lo escribe el
 *    PADRE al aprobar (D-087/D-101 del reparto); ningún endpoint del dueño lo
 *    toca.
 *  · **No tiene chat ni texto libre.** El único texto que entra por esta
 *    superficie es el código de seis caracteres, en la cuenta del adulto
 *    (línea roja #3).
 */

import {
  codigoDeUnionEsValido,
  normalizarCodigoDeUnion,
  type OrigenDeGrupo,
} from "../../../../packages/motor/src/grupo.ts";
import { assertCanOwnChildGroup, insigniaPara } from "./owner-proof.ts";
import type { FilaDeIdentidad } from "./owner-proof.ts";

// ---------------------------------------------------------------------------
// La búsqueda por código — lectura, nunca escritura
// ---------------------------------------------------------------------------

/** Lo que un código activo revela: el grupo existe y quién es su dueño. */
export interface GrupoPorCodigo {
  readonly id: string;
  readonly origen_tipo: OrigenDeGrupo;
  readonly owner_user_id: string;
}

/**
 * Busca el grupo de un código de unión.
 *
 * El mismo `null` para «código desconocido» y para «código apagado»
 * (`disabled_at`): distinguirlos le diría a quien prueba códigos ajenos
 * cuáles existen (F9 §5.2 paso 3). La forma del código se valida ANTES de ir
 * a la base con la función del motor — un `HOLA!!` no cuesta una consulta.
 */
export async function grupoPorCodigo(
  db: D1Database,
  entrada: string,
): Promise<GrupoPorCodigo | null> {
  const codigo = normalizarCodigoDeUnion(entrada);
  if (!codigoDeUnionEsValido(codigo)) return null;
  const fila = await db
    .prepare(
      "SELECT id, origen_tipo, owner_user_id FROM child_group " +
        "WHERE join_code = ? AND disabled_at IS NULL",
    )
    .bind(codigo)
    .first<GrupoPorCodigo>();
  return fila ?? null;
}

// ---------------------------------------------------------------------------
// La tarjeta de identidad del dueño (issue #382) — lectura
// ---------------------------------------------------------------------------

/**
 * Lo que el padre ve ANTES de decidir. Lee UN solo campo de confianza —
 * `group_owner_identity.assurance`— y nunca consulta `school`/`school_teacher`
 * para calcular la insignia (corrección del 2026-08-03 de la issue #382: la
 * tarjeta no necesita saber que esas tablas existen). El nombre de la escuela
 * solo se muestra como parte del TIPO del grupo («salón de X»), como texto
 * declarado que es.
 */
export interface TarjetaDelDuenio {
  readonly origen_tipo: OrigenDeGrupo;
  /** El nombre declarado de la escuela afiliada, o null. */
  readonly escuela: string | null;
  /** Lo que el dueño escribió sobre sí mismo. Puede ser null si nunca declaró. */
  readonly declaracion: string | null;
  /** La insignia, derivada de `assurance` por `owner-proof.insigniaPara`. */
  readonly insignia: "sin_verificar" | "dominio_escolar" | "revisado" | "escuela_verificada";
}

/**
 * Arma la tarjeta. Si el dueño no tiene fila de identidad (un grupo creado
 * antes de que el gate exigiera declarar), la insignia es `sin_verificar` y
 * la declaración es null: la tarjeta dice la verdad — no hay nada comprobado
 * que mostrar.
 */
export async function tarjetaParaPadre(
  db: D1Database,
  groupId: string,
): Promise<TarjetaDelDuenio | null> {
  const fila = await db
    .prepare(
      "SELECT g.origen_tipo, s.name AS escuela, " +
        "o.user_id AS o_user_id, o.assurance AS o_assurance, o.declared_context AS o_contexto " +
        "FROM child_group g " +
        "LEFT JOIN school s ON s.id = g.school_id " +
        "LEFT JOIN group_owner_identity o ON o.user_id = g.owner_user_id " +
        "WHERE g.id = ?",
    )
    .bind(groupId)
    .first<{
      origen_tipo: OrigenDeGrupo;
      escuela: string | null;
      o_user_id: string | null;
      o_assurance: string | null;
      o_contexto: string | null;
    }>();
  if (!fila) return null;

  const identidad: FilaDeIdentidad | null =
    fila.o_user_id !== null && fila.o_assurance !== null
      ? {
          user_id: fila.o_user_id,
          assurance: fila.o_assurance,
          declared_context: fila.o_contexto,
        }
      : null;
  const proof = assertCanOwnChildGroup(identidad);

  return {
    origen_tipo: fila.origen_tipo,
    escuela: fila.escuela,
    declaracion: fila.o_contexto,
    insignia: proof ? insigniaPara(proof) : "sin_verificar",
  };
}

// ---------------------------------------------------------------------------
// Los hijos que se pueden ofrecer — lectura
// ---------------------------------------------------------------------------

export interface HijoParaUnir {
  readonly id: string;
  readonly alias: string;
}

/**
 * Los perfiles de ESTA cuenta que todavía no tienen solicitud viva en el
 * grupo. Un perfil con membresía `pending` o `approved` no se ofrece
 * (`idx_cgm_viva` lo impediría al escribir; no ofrecerlo es no mentir en la
 * pantalla). Solo alias: es lo que la tarjeta necesita para que el padre
 * reconozca a su hijo.
 */
export async function hijosParaUnir(
  db: D1Database,
  parentUserId: string,
  groupId: string,
): Promise<HijoParaUnir[]> {
  const r = await db
    .prepare(
      "SELECT id, alias FROM child_profiles " +
        "WHERE parent_user_id = ? AND deleted_at IS NULL " +
        "AND id NOT IN (" +
        "SELECT child_profile_id FROM child_group_membership " +
        "WHERE child_group_id = ? AND status IN ('pending', 'approved')" +
        ") ORDER BY created_at ASC",
    )
    .bind(parentUserId, groupId)
    .all<HijoParaUnir>();
  return r.results ?? [];
}

// ---------------------------------------------------------------------------
// La decisión — la ÚNICA escritura de aprobación del producto
// ---------------------------------------------------------------------------

/** Las tres salidas explícitas de la tarjeta (F9 §5.2 paso 4). */
export type DecisionDeEntrada = "approved" | "rejected" | "pending";

export interface PedidoDeDecision {
  /** La sesión que decide. Es `decided_by` si la decisión no es aplazar. */
  readonly parentUserId: string;
  /** El perfil que entra. Se comprueba `parent_user_id` en la base. */
  readonly childId: string;
  /** El grupo, ya encontrado por `grupoPorCodigo` (código activo). */
  readonly groupId: string;
  readonly decision: DecisionDeEntrada;
  /** El toggle de ranking (D-087/D-101). Solo se mira si `decision` es aprobar. */
  readonly optIn: boolean;
  /** Sello del servidor, en segundos UNIX. */
  readonly ahora: number;
}

export type ResultadoDeDecision =
  | { readonly ok: true }
  | { readonly ok: false; readonly motivo: string };

/**
 * Escribe la decisión del padre: UNA fila de `child_group_membership`, que es
 * a la vez la bitácora y el consentimiento (D-096).
 *
 *  · **Aprobar** → la membresía nace `approved` con `decided_at` y
 *    `decided_by` = el padre de la sesión, y el `leaderboard_opt_in` del
 *    toggle. Si el grupo está lleno, el trigger de cupo de la 0017 aborta el
 *    INSERT — el tope no depende de que esta función recuerde contar.
 *  · **Rechazar** → nace `rejected`, también firmada: un rechazo no
 *    registrado es indistinguible de un código que nunca se usó (F9 §5.2).
 *  · **Decidir después** → nace `pending` con `decided_at`/`decided_by` en
 *    NULL: es una solicitud aplazada, no una decisión. (La expiración de 30
 *    días de D-100 del reparto no existe en la 0017 real — queda anotado en
 *    el PR de esta superficie; la membresía pendiente no expira hoy.)
 *
 * La doble defensa contra la solicitud duplicada: se comprueba antes Y el
 * índice único parcial `idx_cgm_viva` aborta la carrera. El motivo es el
 * mismo en los dos caminos — quien la provoca no aprende nada nuevo.
 */
export async function decidirEntrada(
  db: D1Database,
  pedido: PedidoDeDecision,
): Promise<ResultadoDeDecision> {
  // Condición 2: el perfil tiene que ser de la cuenta de la sesión (línea
  // roja #2). `null` no distingue «no existe» de «no es tuyo», y la ruta
  // responde igual a los dos.
  const hijo = await db
    .prepare(
      "SELECT id FROM child_profiles " +
        "WHERE id = ? AND parent_user_id = ? AND deleted_at IS NULL",
    )
    .bind(pedido.childId, pedido.parentUserId)
    .first<{ id: string }>();
  if (!hijo) return { ok: false, motivo: "perfil_desconocido" };

  // El grupo tiene que seguir activo en el momento de escribir: el código se
  // pudo apagar entre la tarjeta y el botón.
  const grupo = await db
    .prepare("SELECT id FROM child_group WHERE id = ? AND disabled_at IS NULL")
    .bind(pedido.groupId)
    .first<{ id: string }>();
  if (!grupo) return { ok: false, motivo: "codigo_inactivo" };

  // Una solicitud viva por niño y grupo (el índice único parcial es la
  // segunda defensa, contra la carrera de dos clics).
  const viva = await db
    .prepare(
      "SELECT id FROM child_group_membership " +
        "WHERE child_group_id = ? AND child_profile_id = ? AND status IN ('pending', 'approved')",
    )
    .bind(pedido.groupId, pedido.childId)
    .first<{ id: string }>();
  if (viva) return { ok: false, motivo: "solicitud_viva" };

  // Condición 1 y 3: toda aprobación es la decisión de una solicitud, y la
  // fila firma quién decidió. El `pending` es la única salida sin firma:
  // todavía no es una decisión.
  const decidida = pedido.decision !== "pending";
  try {
    await db
      .prepare(
        "INSERT INTO child_group_membership (" +
          "id, child_group_id, child_profile_id, status, requested_at, " +
          "decided_at, decided_by, leaderboard_opt_in" +
          ") VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(
        crypto.randomUUID(),
        pedido.groupId,
        pedido.childId,
        pedido.decision,
        pedido.ahora,
        decidida ? pedido.ahora : null,
        decidida ? pedido.parentUserId : null,
        pedido.decision === "approved" && pedido.optIn ? 1 : 0,
      )
      .run();
  } catch (err) {
    const texto = String(err);
    if (texto.includes("lleno")) return { ok: false, motivo: "grupo_lleno" };
    if (texto.includes("UNIQUE")) return { ok: false, motivo: "solicitud_viva" };
    throw err;
  }
  return { ok: true };
}
