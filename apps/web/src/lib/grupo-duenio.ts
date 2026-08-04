/**
 * La capa de datos del DUEÑO del grupo (F9 · #381, #383): su identidad
 * declarada, la creación del grupo con sus topes, y el reset/disable del
 * código de unión (D-099/D-113 del reparto del orquestador).
 *
 * ─── Qué vive aquí, y por qué no en la ruta ─────────────────────────────────
 *
 * Las escrituras de `child_group` y de `group_owner_identity`. Viven aquí por
 * la razón de siempre (`padre-limite.ts` lo nombró primero): un SQL mal
 * escrito no da error, da un adulto mirando lo que no es suyo — y eso solo se
 * ve ejecutándolo, en `padre-grupo.prueba.mjs` contra `node:sqlite` con las
 * migraciones REALES.
 *
 * Las importaciones llevan `.ts` explícita por testabilidad: la prueba carga
 * este módulo con `node --experimental-strip-types`, que no resuelve rutas
 * sin extensión.
 *
 * ─── El gate es un tipo, no un `if` (criterio #118) ──────────────────────────
 *
 * `crearGrupo` pide un `OwnerProof` como primer argumento: **no compila sin
 * él**, y la única fábrica de esa marca es `assertCanOwnChildGroup` de
 * `owner-proof.ts`. Esta ruta es el PRIMER llamador real del gate en todo el
 * repo — llevaba sin llamador desde F2 (issue #402, `funcion-sin-llamar.mjs`
 * existe por esa clase de hallazgo).
 *
 * ─── El salón afiliado (D-086) ───────────────────────────────────────────────
 *
 * Un `child_group` con `school_id` solo nace aquí, y aquí solo si la escuela
 * está `verified` Y la fila de `school_teacher` del dueño sigue activa
 * (`revoked_at IS NULL`). La comprobación va EN la misma lectura previa al
 * INSERT, así que revocar a un maestro corta su capacidad de crear salones
 * afiliados en el acto (issue #381, criterio explícito) — no «al día
 * siguiente». `audits/school-verification-required.mjs` tiene este archivo en
 * su lista blanca ESCRITA A MANO; ampliarla es la anulación por escrito de
 * D-032.
 *
 * ─── Lo que este módulo NO hace ──────────────────────────────────────────────
 *
 *  · **No escribe `assurance`.** El valor `school_verified` lo escriben los
 *    triggers de la 0017 cuando la escuela se verifica o el maestro se alta,
 *    jamás una ruta a mano (D-086; el auditor lo vigila). Aquí solo se LEE.
 *  · **No aprueba membresías.** La entrada de un niño la decide SU padre, y
 *    esa escritura vive en UN módulo: `padre-grupo.ts` (D-011, D-096 del
 *    reparto; `grupo-aprobacion-padre.mjs` lo hace cumplir).
 *  · **No borra nada.** Desactivar el código es un `disabled_at`; las filas
 *    quedan, porque la bitácora es la memoria (0017).
 */

import { generarCodigoDeUnion, maxSizeEsValido, GRUPOS_POR_CUENTA } from "../../../../packages/motor/src/grupo.ts";
import type { OrigenDeGrupo } from "../../../../packages/motor/src/grupo.ts";
import type { OwnerProof, FilaDeIdentidad } from "./owner-proof.ts";

// ---------------------------------------------------------------------------
// La identidad declarada del dueño (group_owner_identity)
// ---------------------------------------------------------------------------

/** La fila de identidad del dueño, o `null` si nunca declaró nada. */
export async function identidadDe(
  db: D1Database,
  userId: string,
): Promise<FilaDeIdentidad | null> {
  const fila = await db
    .prepare(
      "SELECT user_id, assurance, declared_context FROM group_owner_identity WHERE user_id = ?",
    )
    .bind(userId)
    .first<FilaDeIdentidad>();
  return fila ?? null;
}

/**
 * Escribe lo que el adulto declara ser. Es el PRIMER escritor de
 * `group_owner_identity` en el producto: la fila nace con `assurance =
 * 'declared'` (el default del CHECK de la 0017) — «lo escribió esta persona y
 * nadie lo comprobó», que es exactamente lo que la insignia le dirá al padre.
 *
 * `contexto` lo escribe un ADULTO sobre sí mismo (nunca un niño, línea roja
 * #3) y se muestra al padre junto a la insignia. Re-declarar actualiza el
 * texto, nunca el assurance: subir de nivel de confianza es cosa de la
 * escuela verificada (triggers) o de la revisión humana, no del formulario.
 */
export async function declararIdentidad(
  db: D1Database,
  userId: string,
  contexto: string,
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO group_owner_identity (user_id, declared_context) VALUES (?, ?) " +
        "ON CONFLICT (user_id) DO UPDATE SET declared_context = excluded.declared_context",
    )
    .bind(userId, contexto.slice(0, 160))
    .run();
}

// ---------------------------------------------------------------------------
// Los grupos del dueño
// ---------------------------------------------------------------------------

/** Lo que la pantalla del dueño lista de cada grupo suyo. */
export interface GrupoPropio {
  readonly id: string;
  readonly origen_tipo: OrigenDeGrupo;
  readonly join_code: string;
  readonly max_size: number;
  readonly disabled_at: number | null;
  /** El nombre de la escuela afiliada, o null (salón sin escuela, club). */
  readonly escuela: string | null;
}

/**
 * Los grupos de ESTE dueño, con el nombre de la escuela cuando la hay.
 *
 * El nombre de la escuela es texto declarado por un adulto (D-086) y se
 * muestra junto a la insignia de assurance — nunca como hecho comprobado por
 * sí mismo.
 */
export async function gruposDelDuenio(
  db: D1Database,
  ownerUserId: string,
): Promise<GrupoPropio[]> {
  const r = await db
    .prepare(
      "SELECT g.id, g.origen_tipo, g.join_code, g.max_size, g.disabled_at, " +
        "s.name AS escuela " +
        "FROM child_group g " +
        "LEFT JOIN school s ON s.id = g.school_id " +
        "WHERE g.owner_user_id = ? " +
        "ORDER BY g.created_at ASC, g.id ASC",
    )
    .bind(ownerUserId)
    .all<GrupoPropio>();
  return r.results ?? [];
}

/** Una escuela verificada donde el dueño sigue siendo maestro activo. */
export interface EscuelaDelMaestro {
  readonly id: string;
  readonly name: string;
}

/**
 * Las escuelas verificadas bajo las que ESTE adulto puede abrir un salón
 * afiliado. Una escuela pendiente o rechazada no aparece; una fila de
 * `school_teacher` revocada tampoco — la revocación corta aquí, en la
 * consulta (issue #381).
 */
export async function escuelasVerificadasDelMaestro(
  db: D1Database,
  userId: string,
): Promise<EscuelaDelMaestro[]> {
  const r = await db
    .prepare(
      "SELECT s.id, s.name FROM school_teacher st " +
        "JOIN school s ON s.id = st.school_id AND s.verification_status = 'verified' " +
        "WHERE st.user_id = ? AND st.revoked_at IS NULL " +
        "ORDER BY s.name ASC",
    )
    .bind(userId)
    .all<EscuelaDelMaestro>();
  return r.results ?? [];
}

// ---------------------------------------------------------------------------
// Crear el grupo — con el gate de tipo y los topes
// ---------------------------------------------------------------------------

export interface PedidoDeGrupo {
  readonly origen: OrigenDeGrupo;
  readonly maxSize: number;
  /** `null` salvo salón afiliado a escuela verificada (D-086). */
  readonly schoolId: string | null;
  /** Sello del servidor, en segundos UNIX. */
  readonly ahora: number;
}

export type ResultadoDeCreacion =
  | { readonly ok: true; readonly id: string; readonly codigo: string }
  | { readonly ok: false; readonly motivo: string };

/** El azar criptográfico del código, inyectable en la prueba. */
const azarReal = () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;

/**
 * Crea un `child_group`. **No compila sin `OwnerProof`** — esa es la decisión
 * entera del criterio #118: la segunda ruta que algún día cree grupos no
 * puede olvidarse de la comprobación, porque no puede escribirse sin ella.
 *
 * Los topes se exigen AQUÍ, no se declaran (D-087/D-100 del reparto, el hueco
 * del «niño #31» que la issue #380 encontró): el cupo por grupo lo hace
 * cumplir el trigger de la 0017 al aprobar; el tope por cuenta y el de uno
 * por día se comprueban antes del INSERT.
 *
 * `schoolId` solo se escribe tras comprobar que la escuela está `verified` Y
 * que el dueño es maestro activo bajo ella — las DOS condiciones en la misma
 * consulta. Un salón sin escuela existe igual, con insignia «sin verificar»
 * (D-086): `schoolId = null` es el camino legítimo de siempre, no un
 * degradado.
 */
export async function crearGrupo(
  db: D1Database,
  proof: OwnerProof,
  pedido: PedidoDeGrupo,
  azar: () => number = azarReal,
): Promise<ResultadoDeCreacion> {
  if (!maxSizeEsValido(pedido.origen, pedido.maxSize)) {
    return { ok: false, motivo: "tamano_invalido" };
  }

  const [conteo, hoy] = await Promise.all([
    db
      .prepare("SELECT COUNT(*) AS n FROM child_group WHERE owner_user_id = ?")
      .bind(proof.userId)
      .first<{ n: number }>(),
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM child_group WHERE owner_user_id = ? AND created_at >= ?",
      )
      .bind(proof.userId, pedido.ahora - 86400)
      .first<{ n: number }>(),
  ]);
  if ((conteo?.n ?? 0) >= GRUPOS_POR_CUENTA) return { ok: false, motivo: "tope_grupos" };
  if ((hoy?.n ?? 0) >= 1) return { ok: false, motivo: "uno_por_dia" };

  if (pedido.schoolId !== null) {
    // Las dos condiciones de D-086 EN la misma consulta: la escuela verificada
    // y la fila de maestro activa. Revocar al maestro (`revoked_at`) hace que
    // esta lectura devuelva null en el acto — la capacidad de crear salones
    // afiliados se corta de inmediato, no en un barrido posterior (issue #381).
    const afiliacion = await db
      .prepare(
        "SELECT s.id FROM school_teacher st " +
          "JOIN school s ON s.id = st.school_id AND s.verification_status = 'verified' " +
          "WHERE st.user_id = ? AND st.school_id = ? AND st.revoked_at IS NULL",
      )
      .bind(proof.userId, pedido.schoolId)
      .first<{ id: string }>();
    if (!afiliacion) return { ok: false, motivo: "escuela_no_verificada" };
  }

  // El código choca con el UNIQUE de la 0017 una entre ~mil millones de veces;
  // aun así se reintenta, porque un UNIQUE que aborta es un 500 delante de un
  // adulto si nadie lo espera.
  for (let intento = 0; intento < 5; intento++) {
    const id = crypto.randomUUID();
    const codigo = generarCodigoDeUnion(azar);
    try {
      await db
        .prepare(
          "INSERT INTO child_group (" +
            "id, owner_user_id, origen_tipo, school_id, join_code, max_size, created_at" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(
          id,
          proof.userId,
          pedido.origen,
          pedido.schoolId,
          codigo,
          pedido.maxSize,
          pedido.ahora,
        )
        .run();
      return { ok: true, id, codigo };
    } catch (err) {
      if (!String(err).includes("UNIQUE")) throw err;
    }
  }
  return { ok: false, motivo: "codigo_agotado" };
}

// ---------------------------------------------------------------------------
// Reset y disable del código (D-113 del reparto)
// ---------------------------------------------------------------------------

export type ResultadoDeCodigo =
  | { readonly ok: true; readonly codigo?: string }
  | { readonly ok: false; readonly motivo: string };

/**
 * Genera un código nuevo para el grupo de ESTE dueño. El viejo muere en el
 * acto (es la misma columna); las membresías `approved` no se tocan (0017).
 * `null`/ajeno se niega con el mismo motivo, como `grupoDelDuenio`.
 */
export async function resetearCodigo(
  db: D1Database,
  ownerUserId: string,
  groupId: string,
  azar: () => number = azarReal,
): Promise<ResultadoDeCodigo> {
  const propio = await db
    .prepare("SELECT id FROM child_group WHERE id = ? AND owner_user_id = ?")
    .bind(groupId, ownerUserId)
    .first<{ id: string }>();
  if (!propio) return { ok: false, motivo: "grupo_desconocido" };

  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigoDeUnion(azar);
    try {
      await db
        .prepare("UPDATE child_group SET join_code = ? WHERE id = ?")
        .bind(codigo, groupId)
        .run();
      return { ok: true, codigo };
    } catch (err) {
      if (!String(err).includes("UNIQUE")) throw err;
    }
  }
  return { ok: false, motivo: "codigo_agotado" };
}

/**
 * Apaga o enciende el código del grupo de ESTE dueño (`disabled_at`). Un
 * grupo deshabilitado no admite solicitudes nuevas; las membresías aprobadas
 * no se tocan. No hay borrado: la fila queda, la bitácora es la memoria.
 */
export async function cambiarCodigoActivo(
  db: D1Database,
  ownerUserId: string,
  groupId: string,
  activar: boolean,
  ahora: number,
): Promise<ResultadoDeCodigo> {
  const r = await db
    .prepare(
      "UPDATE child_group SET disabled_at = ? WHERE id = ? AND owner_user_id = ?",
    )
    .bind(activar ? null : ahora, groupId, ownerUserId)
    .run();
  if ((r.meta?.changes ?? 0) === 0) return { ok: false, motivo: "grupo_desconocido" };
  return { ok: true };
}
