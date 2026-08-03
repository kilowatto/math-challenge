/**
 * La capa de datos del tablero global (F7 #247, #250).
 *
 * ─── Qué vive aquí, y por qué no en la página ────────────────────────────────
 *
 * Todo lo que toca `score_totals` / `score_totals_adulto` para PINTAR el
 * tablero: las filas de la ventana, el total de participantes, el total propio
 * y el rango propio. Vive aquí y no en `tablero.astro` por la misma razón que
 * `padre-limite.ts`: un SQL mal escrito no da error, da un niño sin
 * consentimiento apareciendo en una lista pública — y eso solo se ve
 * ejecutándolo, en `padre-tablero.prueba.mjs` contra `node:sqlite`.
 *
 * Las importaciones llevan extensión `.ts` explícita por testabilidad: la
 * prueba carga este módulo con `node --experimental-strip-types`, que no
 * resuelve rutas sin extensión. Es el mismo motivo que en `padre-limite.ts`.
 *
 * ─── La escalera de visibilidad se aplica AQUÍ, no en la plantilla ───────────
 *
 * D-081 y #247: lo que un niño de PRIMARIA fuera del top 20 recibe **no
 * contiene la tabla** — ni un rango, ni una posición, ni un vecino. No es que
 * la plantilla la esconda: es que no viaja. Recibirla y esconderla la deja en
 * la respuesta, en las herramientas del navegador y en cualquier registro de
 * red. Quien decide qué viaja es `armarVista()`, más abajo, y la escalera la
 * ejecuta el motor (`tablero.ts::armarTablero`) siempre que la ventana alcanza.
 *
 * ─── La ventana y el rango por COUNT ─────────────────────────────────────────
 *
 * `armarTablero` deriva el rango de la posición en el arreglo, así que necesita
 * que la fila de quien mira esté DENTRO del arreglo. La consulta trae los
 * primeros `VENTANA_TABLERO` (500): con eso alcanza para todo lo publicado
 * (top 20 de PRIMARIA, top 100 de las demás) y para cualquier mirador dentro
 * de los primeros 500. Para quien está más abajo —«tú estás aquí» es exacto
 * incluso fuera del top 100 (#247)— el rango se calcula con un `COUNT` sobre
 * el índice `idx_score_rank` (mc-32 riesgo #12), con el MISMO criterio de
 * desempate que `ordenarPorPuntos` (puntos desc, id asc).
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No mezcla las dos tablas.** `score_totals` es de niños y
 *    `score_totals_adulto` de adultos: dos consultas, jamás un UNION (#250).
 *  · **No suelta el opt-in.** Toda consulta de niños cruza `child_consents`
 *    con `LEADERBOARD` y `revoked_at IS NULL` (D-040). La única excepción es
 *    `miFilaNino`: el total PROPIO de un niño es su dato y solo lo ve él —
 *    es lo único que este producto le enseña a todo el mundo sin excepción.
 *  · **No formatea.** Devuelve números. Quien pinta llama a
 *    `numeros.ts::formatear` con el locale de **quien mira**, jamás con el
 *    `alias_locale` del dueño de la fila (#247, `mc-34`).
 *  · **No notifica.** No hay ninguna función que arme un aviso de «bajaste de
 *    posición». D-014 lo prohíbe por nombre; la garantía es que no exista.
 */

import {
  armarTablero,
  formaDeTablero,
  ordenarPorPuntos,
  SQL_TOP_ADULTO,
  SQL_TOP_NINO,
  type EntradaDeTablero,
  type FilaDeTablero,
  type VistaDeTablero,
} from "../../../../packages/motor/src/tablero.ts";
import { posicionVisible, type PosicionVisible } from "../../../../packages/motor/src/liga.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";

/**
 * El único periodo que existe. Las temporadas (`season:<id>`) están en el
 * esquema pero ninguna decisión las crea (#247: «Temporadas — no incluye»).
 */
export const PERIODO_GLOBAL = "all_time";

/**
 * Cuántas filas trae la consulta. 500 cubre con creces todo lo publicado
 * (top 20, top 100) y a cualquier mirador dentro de los primeros 500; más
 * abajo, el rango sale del `COUNT` y la lista sigue siendo el top 100.
 */
export const VENTANA_TABLERO = 500;

/** De cuál de las dos tablas se lee. Jamás de las dos a la vez (#250). */
export type TipoParticipante = "nino" | "adulto";

/**
 * Las filas de UNA banda y UN periodo, ya filtradas por opt-in.
 *
 * La consulta es la del motor — `SQL_TOP_NINO` lleva el `JOIN` contra
 * `child_consents` dentro, porque un filtro escrito en el código que lee las
 * filas se olvida en la segunda ruta que las lea; un `JOIN` no se puede
 * olvidar sin borrarlo, y borrarlo se ve en el diff.
 */
export async function filasDeTablero(
  db: D1Database,
  tipo: TipoParticipante,
  banda: Banda,
  periodo: string = PERIODO_GLOBAL,
  limite: number = VENTANA_TABLERO,
): Promise<FilaDeTablero[]> {
  const sql = tipo === "nino" ? SQL_TOP_NINO : SQL_TOP_ADULTO;
  const r = await db.prepare(sql).bind(periodo, banda, limite).all<FilaDeTablero>();
  return r.results ?? [];
}

/**
 * Cuántos participantes visibles hay en (periodo, banda).
 *
 * Hace falta de verdad, no por curiosidad: los tercios de KINDER se calculan
 * sobre la cohorte COMPLETA (`posicionVisible(banda, rango, total)`), y una
 * ventana de 500 filas no es la cohorte cuando hay más de 500.
 */
export async function conteoDeTablero(
  db: D1Database,
  tipo: TipoParticipante,
  banda: Banda,
  periodo: string = PERIODO_GLOBAL,
): Promise<number> {
  const sql =
    tipo === "nino"
      ? "SELECT COUNT(*) AS n FROM score_totals s " +
        "JOIN child_profiles p ON p.id = s.child_profile_id AND p.deleted_at IS NULL " +
        "JOIN child_consents c ON c.child_profile_id = p.id " +
        "AND c.consent_code = 'LEADERBOARD' AND c.revoked_at IS NULL " +
        "WHERE s.period = ? AND s.theme_band = ?"
      : "SELECT COUNT(*) AS n FROM score_totals_adulto s " +
        "JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL " +
        "WHERE s.period = ? AND s.theme_band = ? AND u.alias IS NOT NULL";
  const fila = await db.prepare(sql).bind(periodo, banda).first<{ n: number }>();
  return fila?.n ?? 0;
}

/** Lo que un niño tiene en el tablero: su total, y si está DENTRO o no. */
export interface FilaPropiaNino {
  readonly total_score: number;
  readonly theme_band: string;
  /** `true` solo con fila `LEADERBOARD` vigente (D-040). Sin ella no hay rango. */
  readonly en_tablero: boolean;
}

/**
 * El total PROPIO de un niño.
 *
 * No exige el consentimiento, y es deliberado: el total acumulado de un niño
 * es su propio dato y solo lo ve él — es lo único que este producto le enseña
 * a todo el mundo sin excepción (#247). Lo que el consentimiento gobierna es
 * APARECER en la lista de otros (`en_tablero`), no saber cuántos puntos tiene
 * uno mismo.
 */
export async function miFilaNino(
  db: D1Database,
  childId: string,
  periodo: string = PERIODO_GLOBAL,
): Promise<FilaPropiaNino | null> {
  const fila = await db
    .prepare(
      "SELECT s.total_score AS total_score, s.theme_band AS theme_band, " +
        "EXISTS(SELECT 1 FROM child_consents c WHERE c.child_profile_id = p.id " +
        "AND c.consent_code = 'LEADERBOARD' AND c.revoked_at IS NULL) AS en_tablero " +
        "FROM score_totals s " +
        "JOIN child_profiles p ON p.id = s.child_profile_id AND p.deleted_at IS NULL " +
        "WHERE s.child_profile_id = ? AND s.period = ?",
    )
    .bind(childId, periodo)
    .first<{ total_score: number; theme_band: string; en_tablero: number }>();
  if (!fila) return null;
  return { ...fila, en_tablero: fila.en_tablero === 1 };
}

/** Lo que un adulto tiene en el tablero. Sin fila: todavía no compite. */
export interface FilaPropiaAdulto {
  readonly total_score: number;
  readonly theme_band: string;
  /** `false` mientras `users.alias` sea NULL: no compite todavía (0012, #239). */
  readonly en_tablero: boolean;
}

export async function miFilaAdulto(
  db: D1Database,
  userId: string,
  periodo: string = PERIODO_GLOBAL,
): Promise<FilaPropiaAdulto | null> {
  const fila = await db
    .prepare(
      "SELECT s.total_score AS total_score, s.theme_band AS theme_band, " +
        "(u.alias IS NOT NULL) AS en_tablero " +
        "FROM score_totals_adulto s JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL " +
        "WHERE s.user_id = ? AND s.period = ?",
    )
    .bind(userId, periodo)
    .first<{ total_score: number; theme_band: string; en_tablero: number }>();
  if (!fila) return null;
  return { ...fila, en_tablero: fila.en_tablero === 1 };
}

/**
 * El rango de una fila: 1 + cuántas filas visibles van DELANTE.
 *
 * El desempate es el de `ordenarPorPuntos` — puntos desc, `id` asc— escrito
 * aquí en SQL. Es la segunda copia de un criterio, a propósito y con su
 * defensa: las dos se ejercitan contra los mismos datos en
 * `padre-tablero.prueba.mjs`, así que el día que se separen, la prueba rompe.
 * Va sobre `idx_score_rank` / `idx_score_adulto_rank` (mc-32 riesgo #12).
 */
export async function rangoEnTablero(
  db: D1Database,
  tipo: TipoParticipante,
  banda: Banda,
  id: string,
  totalScore: number,
  periodo: string = PERIODO_GLOBAL,
): Promise<number> {
  const sql =
    tipo === "nino"
      ? "SELECT COUNT(*) + 1 AS rango FROM score_totals s " +
        "JOIN child_profiles p ON p.id = s.child_profile_id AND p.deleted_at IS NULL " +
        "JOIN child_consents c ON c.child_profile_id = p.id " +
        "AND c.consent_code = 'LEADERBOARD' AND c.revoked_at IS NULL " +
        "WHERE s.period = ? AND s.theme_band = ? " +
        "AND (s.total_score > ? OR (s.total_score = ? AND p.id < ?))"
      : "SELECT COUNT(*) + 1 AS rango FROM score_totals_adulto s " +
        "JOIN users u ON u.id = s.user_id AND u.deleted_at IS NULL " +
        "WHERE s.period = ? AND s.theme_band = ? AND u.alias IS NOT NULL " +
        "AND (s.total_score > ? OR (s.total_score = ? AND u.id < ?))";
  const fila = await db
    .prepare(sql)
    .bind(periodo, banda, totalScore, totalScore, id)
    .first<{ rango: number }>();
  return fila?.rango ?? 1;
}

/**
 * La escalera, con el motor donde alcanza y su espejo donde no.
 *
 *  · **Camino normal** — el mirador está dentro de la ventana y, para KINDER,
 *    la ventana ES la cohorte—: `armarTablero` del motor decide todo. Una sola
 *    fuente de la escalera, que es lo que `tablero-orden-puntos.mjs` ejecuta.
 *  · **Fuera de la ventana** (más de `VENTANA_TABLERO` participantes en la
 *    banda): el espejo de abajo reproduce la escalera con el rango del `COUNT`
 *    y el total real. Existe porque «tú estás aquí» es exacto incluso fuera
 *    del top 100 (#247), y un arreglo de 500 filas no contiene al puesto 600.
 *
 * `miTotal` llega aparte a propósito: el motor lo saca de la fila CONSENTIDA,
 * y un niño sin opt-in tiene total propio aunque no aparezca en ninguna lista
 * — ver `miFilaNino`.
 */
export function armarVista(
  banda: Banda,
  filasVentana: readonly FilaDeTablero[],
  quienId: string,
  miRango: number | null,
  miTotal: number,
  participantes: number,
): VistaDeTablero {
  const dentroDeVentana = miRango !== null && miRango <= filasVentana.length;
  const kinderCompleto =
    formaDeTablero(banda).forma !== "tercios" || participantes === filasVentana.length;

  if (dentroDeVentana && kinderCompleto) {
    const vista = armarTablero(banda, filasVentana, quienId);
    // El motor da `mi_total` de la fila consentida; llega por parámetro porque
    // un niño sin opt-in TAMBIÉN ve su propio total (es su dato, y solo suyo).
    return { ...vista, mi_total: miTotal };
  }

  // ─── El espejo, fuera de la ventana ──────────────────────────────────────
  //
  // Reproduce `armarTablero` rama por rama con el rango del COUNT y el total
  // real. Si el motor crece una variante que acepta el rango, este espejo se
  // borra — mientras tanto, `padre-tablero.prueba.mjs` lo ejercita contra el
  // motor con la ventana forzada chica, para que nunca se separen.
  const orden = ordenarPorPuntos(filasVentana);
  const forma = formaDeTablero(banda);
  const miPosicion: PosicionVisible | null =
    miRango !== null ? posicionVisible(banda, miRango, participantes) : null;
  const entrada = (f: FilaDeTablero, i: number): EntradaDeTablero => ({
    alias: f.alias,
    total_score: f.total_score,
    posicion: posicionVisible(banda, i + 1, participantes),
    soy_yo: f.id === quienId,
  });

  if (forma.forma === "tercios") {
    return {
      banda,
      lista: orden.slice(0, Math.ceil(participantes / 3)).map(entrada),
      mi_total: miTotal,
      mi_posicion: miPosicion,
    };
  }
  if (forma.forma === "top_y_propio") {
    // PRIMARIA fuera del top 20: NI la tabla, NI el rango. No viaja.
    return { banda, lista: [], mi_total: miTotal, mi_posicion: null };
  }
  return {
    banda,
    lista: orden.slice(0, forma.top).map(entrada),
    mi_total: miTotal,
    mi_posicion: miPosicion,
  };
}

/** Lo que la página necesita: la vista ya escalonada, y el tamaño de la cohorte. */
export interface DatosDeVista {
  readonly vista: VistaDeTablero;
  readonly participantes: number;
}

/**
 * El número de posición, SOLO si la banda lo publica exacto.
 *
 * Existe para que ninguna pantalla nombre `posicion.rank`: D-081 dice que en
 * KINDER la posición se muestra en tercios, nunca el número, y el guardián
 * (`kinder-sin-examen.mjs`) bloquea cualquier superficie que referencie el
 * rango crudo — una pantalla que no puede escribir `.rank` no puede pintarlo.
 * Aquí, fuera del árbol de superficies, la lectura es legítima: es quien
 * decide cuándo NO mandarlo.
 */
export function rangoExacto(posicion: PosicionVisible | null): number | null {
  return posicion?.forma === "exacta" ? posicion.rank : null;
}

/** El tercio, SOLO si la posición vino en tercios (KINDER, widget del padre). */
export function tercioDe(posicion: PosicionVisible | null): "top" | "mid" | "bottom" | null {
  return posicion?.forma === "tercio" ? posicion.tercio : null;
}

/**
 * El tablero para un NIÑO (PRIMARIA o SECUNDARIA — la página desvía KINDER
 * antes de llegar aquí, y `tablero-sin-kinder-publico.mjs` vigila ese desvío).
 *
 * Sin fila de puntos o sin consentimiento: `mi_rango` es null, la lista la
 * decide la escalera (PRIMARIA: ninguna; SECUNDARIA: el top 100, que es
 * público para su banda), y `mi_total` es el suyo de todas formas.
 */
export async function vistaParaNino(
  db: D1Database,
  hijo: { id: string; theme_band: string },
  periodo: string = PERIODO_GLOBAL,
  limite: number = VENTANA_TABLERO,
): Promise<DatosDeVista> {
  // El CHECK de la 0002 restringe la columna a las tres bandas de niño.
  const banda = hijo.theme_band as Banda;
  const [filas, participantes, propia] = await Promise.all([
    filasDeTablero(db, "nino", banda, periodo, limite),
    conteoDeTablero(db, "nino", banda, periodo),
    miFilaNino(db, hijo.id, periodo),
  ]);
  const miTotal = propia?.total_score ?? 0;
  const miRango =
    propia?.en_tablero === true
      ? await rangoEnTablero(db, "nino", banda, hijo.id, propia.total_score, periodo)
      : null;
  return {
    vista: armarVista(banda, filas, hijo.id, miRango, miTotal, participantes),
    participantes,
  };
}

/**
 * El tablero para un ADULTO aprendiz (D-034).
 *
 * Su banda es la de su fila de `score_totals_adulto` — SECUNDARIA en adelante
 * (el CHECK de la 0012), porque un adulto no compite en la banda de un niño
 * ni aunque juegue su contenido. Sin fila todavía, se le enseña SERIO, que es
 * la única banda adulta con contenido (D-034) y donde aparecerá al practicar.
 */
export async function vistaParaAdulto(
  db: D1Database,
  userId: string,
  periodo: string = PERIODO_GLOBAL,
  limite: number = VENTANA_TABLERO,
): Promise<DatosDeVista> {
  const propia = await miFilaAdulto(db, userId, periodo);
  const banda = (propia?.theme_band ?? "SERIO") as Banda;
  const [filas, participantes] = await Promise.all([
    filasDeTablero(db, "adulto", banda, periodo, limite),
    conteoDeTablero(db, "adulto", banda, periodo),
  ]);
  const miTotal = propia?.total_score ?? 0;
  const miRango =
    propia?.en_tablero === true
      ? await rangoEnTablero(db, "adulto", banda, userId, propia.total_score, periodo)
      : null;
  return {
    vista: armarVista(banda, filas, userId, miRango, miTotal, participantes),
    participantes,
  };
}
