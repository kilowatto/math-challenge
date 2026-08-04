/**
 * El cable del DUELO: retar, jugar la mitad propia, resolver y mostrar.
 *
 * F7 · #244 · D-018, D-053, D-081 · `mc-17`, `mc-19`.
 *
 * ─── Qué vive aquí y qué no ─────────────────────────────────────────────────
 *
 * El motor (`packages/motor/src/duelo.ts`) es puro y decide: los tres portones
 * (`puedeRetar`), el set congelado (`crearDuelo`), la ventana de 48 h
 * (`haExpirado`), el desenlace (`resolver`) y la proyección de qué se puede
 * enseñar (`verDuelo`). El esquema (`league_duel`, migración 0012) ya está
 * desplegado. Este módulo es el cable entre los dos y las rutas:
 *
 *   · **Retar** (`retarADuelo`): TODOS los portones, en la creación — banda no
 *     KINDER, edad ≥ 8 desde `birth_year` (D-053), opt-in `DUEL` vigente en
 *     `child_consents`, tope de 3 salientes pendientes — comprobados con
 *     `puedeRetar()` para el retador Y para el retado, porque un opt-in que
 *     solo se exige a quien envía no protege a quien recibe.
 *   · **Jugar la mitad** (`servirItemDeDuelo`, `validarTurnoDeDuelo`,
 *     `anotarPuntoDeDuelo`): sirve el `item_set` congelado EN ORDEN — el mismo
 *     para los dos, que es de donde viene la equidad— y acumula los puntos que
 *     la ingesta ya calculó con la fórmula de D-010. Ninguna fórmula nueva.
 *   · **Resolver**: cuando los dos terminaron, `resolver()` del motor — por
 *     puntos del set compartido, jamás por quién acabó antes— y se escribe
 *     `winner_membership_id`, que es un gancho sin recompensa (#244).
 *   · **El panel** (`cargarPanelDeDuelo`): lo que la pantalla enseña, con la
 *     expiración perezosa que el motor deja al lector.
 *
 * ─── Dónde vive el progreso a medias, y por qué ahí ─────────────────────────
 *
 * Un duelo son seis ítems que se pueden jugar en dos sentadas. El esquema
 * tiene UNA columna de puntos por lado y ninguna de progreso, y las
 * migraciones no son de este frente. La salida que NO se tomó: acumular
 * puntos parciales en `challenger_points` — entonces «columna no nula» ya no
 * distingue «terminó» de «lleva dos», y `resolver()` no puede saber cuándo
 * los dos acabaron. Así que el invariante es:
 *
 *     columna de puntos NO nula  ⇔  ese lado TERMINÓ el set
 *
 * y el progreso parcial (puntos acumulados e ítems ya servidos) vive en
 * `SESSION_KV` bajo `duelo:<id>:<membershipId>`, con TTL igual a lo que le
 * queda a la ventana. Es el mismo almacén de siempre para estado efímero con
 * caducidad, no una infraestructura nueva; la verdad duradera —la fila del
 * duelo— sigue siendo D1. Si KV pierde la entrada, el jugador vuelve a
 * empezar el set: sus puntos de liga ya sumados no se tocan (son puntos
 * normales de práctica) y su marcador del duelo arranca de cero. Se acepta:
 * es el fallo abierto de siempre — nunca se le niega el juego a nadie por un
 * contador.
 *
 * ─── Las tres cosas que este cable NO hace, heredadas del motor ─────────────
 *
 *  1. **Sin chat ni texto libre** (línea roja #3): no hay campo donde un niño
 *     escriba nada; el único texto que se guarda es `item_set`, que lo escribe
 *     el servidor.
 *  2. **Sin presencia** (D-081 condición 2): nada aquí registra ni revela si
 *     el otro está conectado, cuándo jugó, ni si «está jugando ahora». Que el
 *     otro haya terminado se revela solo cuando el duelo queda JUGADO — antes,
 *     `verDuelo()` devuelve los puntos en `null` para los dos lados.
 *  3. **Sin prisa ni pérdida** (D-081 condición 3, `mc-17`, `mc-19`): la
 *     ventana existe para que el duelo caduque solo, no para contar hacia
 *     atrás delante de nadie; y un duelo expirado DESAPARECE del panel —
 *     rechazar es silencioso (#244), así que no hay texto de expiración en
 *     ningún locale, a propósito.
 *
 * ─── Los puntos del duelo son puntos NORMALES ────────────────────────────────
 *
 * Cada ítem del duelo pasa por `/api/jugar` como cualquier otro: modelo,
 * telemetría, racha, XP y la suma a `points_this_week` por el cable existente
 * (`sumarPuntosDeLiga`). Este módulo solo acumula el marcador del set en la
 * fila del duelo. DUELO no es un sistema de puntuación paralelo (#237).
 *
 * ─── La expiración perezosa ESCRIBE, y es la excepción dicha ────────────────
 *
 * Las pantallas de liga no escriben. Aquí el lector actualiza
 * `status='EXPIRADO'` cuando `expires_at` ya pasó — porque el tope de tres
 * salientes cuenta filas PENDIENTES, y sin el barrido un duelo muerto
 * bloquearía retos nuevos para siempre. Es una escritura conserje,
 * idempotente, que no decide nada sobre nadie: el motor ya dijo
 * `haExpirado()`.
 *
 * El reloj lo mide quien llama (`ahora`), como en todo el F7 de este repo.
 */

import {
  crearDuelo,
  haExpirado,
  puedeRetar,
  resolver,
  verDuelo,
  type Duelo,
  type MotivoDeRechazo,
} from "../../../../packages/motor/src/duelo.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";
import { semanaDe } from "../../../../packages/motor/src/liga.ts";
import {
  asegurarMembresia,
  estadoDeParticipacion,
  type BaseDeDatos,
  type JugadorDeLiga,
} from "./liga-membresia.ts";

// ─── Constantes de la superficie ─────────────────────────────────────────────

/**
 * Cuántos ítems tiene un duelo. D-018 fija los retos entre 6 y 10; el duelo
 * toma el piso — es un reto más del día, no una maratón, y los dos tienen que
 * poder terminarlo dentro de la ventana sin prisa.
 *
 * Vive aquí y no en el motor a propósito: el motor congela el set que recibe
 * y no opina sobre su largo; el largo es una decisión de la superficie.
 */
export const ITEMS_POR_DUELO = 6;

/** La forma mínima de KV que hace falta. Estructural, para probar con un Map. */
export interface KvMinimo {
  get(llave: string): Promise<string | null>;
  put(llave: string, valor: string, opciones?: { expirationTtl?: number }): Promise<void>;
  delete(llave: string): Promise<void>;
}

export interface EnvDuelo {
  DB?: BaseDeDatos;
  SESSION_KV?: KvMinimo;
}

// ─── La fila de D1 ───────────────────────────────────────────────────────────

interface FilaDuelo {
  id: string;
  cohort_id: string;
  challenger_membership_id: string;
  challenged_membership_id: string;
  item_set: string;
  created_at: number;
  expires_at: number;
  challenger_points: number | null;
  challenged_points: number | null;
  winner_membership_id: string | null;
  status: "PENDIENTE" | "JUGADO" | "EXPIRADO";
}

/** De la fila al `Duelo` del motor. Los campos se copian uno a uno. */
function comoMotor(f: FilaDuelo): Duelo {
  return {
    id: f.id,
    cohort_id: f.cohort_id,
    challenger_membership_id: f.challenger_membership_id,
    challenged_membership_id: f.challenged_membership_id,
    item_set: JSON.parse(f.item_set) as string[],
    created_at: f.created_at,
    expires_at: f.expires_at,
  };
}

/**
 * El barrido conserje: PENDIENTE con la ventana cerrada pasa a EXPIRADO.
 * Idempotente. Sin él, el tope de tres salientes contaría duelos muertos
 * para siempre — el índice `idx_duel_salientes` es sobre `status='PENDIENTE'`.
 */
async function barrerExpirados(db: BaseDeDatos, ahora: number): Promise<void> {
  await db
    .prepare("UPDATE league_duel SET status = 'EXPIRADO' WHERE status = 'PENDIENTE' AND expires_at <= ?")
    .bind(ahora)
    .run();
}

// ─── Quién puede: los datos de los portones ──────────────────────────────────

interface DatosDePorton {
  birth_year: number | null;
  opt_in: boolean;
}

/**
 * El `birth_year` y el opt-in `DUEL` de un participante de liga.
 *
 * Un adulto consiente por sí mismo (#244: «default encendido en `user`
 * adulto») y no tiene `birth_year` — D-053 solo se lo pide al niño. Un niño
 * necesita la fila `DUEL` vigente en `child_consents`: la AUSENCIA de fila es
 * el default apagado (D-040), y una revocada es un «no».
 */
async function portonDe(
  db: BaseDeDatos,
  participante: { child_profile_id: string | null; user_id: string | null },
): Promise<DatosDePorton | null> {
  if (participante.user_id !== null) return { birth_year: null, opt_in: true };
  if (participante.child_profile_id === null) return null;

  const perfil = await db
    .prepare("SELECT birth_year FROM child_profiles WHERE id = ? AND deleted_at IS NULL")
    .bind(participante.child_profile_id)
    .first<{ birth_year: number }>();
  if (!perfil) return null;

  const consentimiento = await db
    .prepare(
      "SELECT 1 AS vivo FROM child_consents " +
        "WHERE child_profile_id = ? AND consent_code = 'DUEL' AND revoked_at IS NULL LIMIT 1",
    )
    .bind(participante.child_profile_id)
    .first<{ vivo: number }>();

  return { birth_year: perfil.birth_year, opt_in: consentimiento !== null };
}

// ─── Retar ───────────────────────────────────────────────────────────────────

export type MotivoDeNoReto =
  | MotivoDeRechazo
  | "sin_liga"
  | "rival_inexistente"
  | "rival_fuera_de_liga"
  | "uno_mismo"
  | "banco_vacio"
  | "error_interno";

export type ResultadoDeReto =
  | { readonly ok: true; readonly duelo_id: string }
  | { readonly ok: false; readonly motivo: MotivoDeNoReto };

/**
 * FNV-1a de 32 bits. **Tercera copia deliberada**: las otras dos viven en
 * `liga-membresia.ts` y en `pages/[locale]/app/kids/index.astro` (una página
 * `.astro`, que no se puede importar). Misma razón de siempre: no protege
 * nada, solo reparte, y tiene que ser estable para siempre.
 */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Elige `cuantos` ítems distintos del banco, determinista respecto a la
 * semilla. Caminata por pasos desde un inicio derivado del id del duelo; si
 * el paso y el tamaño comparten factor y la caminata no alcanza, se completa
 * en orden — el set jamás sale corto ni con repetidos (`crearDuelo` rechaza
 * las dos cosas).
 *
 * Sin `Math.random`: no porque elegir ítems fuera un premio (D-014 va de
 * recompensas), sino porque el mismo duelo rehecho con la misma semilla debe
 * dar el mismo set si esta función se reejecuta — por ejemplo al depurar un
 * reclamo de un padre.
 */
export function elegirSet(banco: readonly string[], cuantos: number, semilla: string): string[] {
  const n = banco.length;
  if (n < cuantos) return [];
  const h = hash32(semilla);
  const inicio = h % n;
  const paso = 1 + ((h >>> 8) % (n - 1));
  const elegidos: string[] = [];
  const vistos = new Set<number>();
  for (let k = 0; k < n && elegidos.length < cuantos; k++) {
    const i = (inicio + k * paso) % n;
    if (vistos.has(i)) continue;
    vistos.add(i);
    elegidos.push(banco[i]);
  }
  for (let i = 0; elegidos.length < cuantos && i < n; i++) {
    if (!vistos.has(i)) {
      vistos.add(i);
      elegidos.push(banco[i]);
    }
  }
  return elegidos;
}

/**
 * Crea un duelo contra un par de la PROPIA liga. Todos los portones pasan por
 * `puedeRetar()` del motor, aquí y en ningún otro sitio — la nota del motor
 * dice por qué: la regla no se rompe borrándola, se rompe cuando una segunda
 * ruta crea el duelo sin pasar por ella.
 *
 * @param idsDelBanco los `itemId` disponibles, decididos por la ruta (banco de
 *   primaria en D1, con respaldo de la ingesta). Este módulo no sabe de bancos.
 * @param ahora el instante, medido por quien llama.
 */
export async function retarADuelo(
  env: EnvDuelo,
  quien: JugadorDeLiga,
  rivalMembershipId: string,
  idsDelBanco: readonly string[],
  dueloId: string,
  ahora: number,
): Promise<ResultadoDeReto> {
  if (!env.DB) return { ok: false, motivo: "error_interno" };
  const db = env.DB;
  try {
    await barrerExpirados(db, ahora);

    // ── Yo: participo, tengo membresía esta semana y paso los portones. ──────
    const participacion = await estadoDeParticipacion(env, quien);
    if (!participacion) return { ok: false, motivo: "sin_liga" };
    const mia = await asegurarMembresia(env, quien, ahora);
    if (!mia) return { ok: false, motivo: "sin_liga" };

    const miPorton = await portonDe(db, {
      child_profile_id: quien.esAdulto ? null : quien.id,
      user_id: quien.esAdulto ? quien.id : null,
    });
    if (!miPorton) return { ok: false, motivo: "sin_liga" };

    const { n: pendientes } = (await db
      .prepare(
        "SELECT COUNT(*) AS n FROM league_duel " +
          "WHERE challenger_membership_id = ? AND status = 'PENDIENTE'",
      )
      .bind(mia.membershipId)
      .first<{ n: number }>()) ?? { n: 0 };

    const anio = new Date(ahora).getUTCFullYear();
    const miElegibilidad = puedeRetar(
      {
        banda: participacion.banda,
        birth_year: miPorton.birth_year,
        opt_in: miPorton.opt_in,
        pendientes_salientes: pendientes,
      },
      anio,
    );
    if (!miElegibilidad.puede) return { ok: false, motivo: miElegibilidad.motivo };

    // ── El rival: misma cohorte (la propia liga, nunca fuera — D-018) y los ──
    // mismos portones. Su tope de salientes no se mide: el tope es anti-acoso
    // del que ENVÍA, y aquí el rival no envía nada.
    const rival = await db
      .prepare(
        "SELECT id, cohort_id, child_profile_id, user_id FROM league_membership WHERE id = ?",
      )
      .bind(rivalMembershipId)
      .first<{
        id: string;
        cohort_id: string;
        child_profile_id: string | null;
        user_id: string | null;
      }>();
    if (!rival) return { ok: false, motivo: "rival_inexistente" };
    if (rival.id === mia.membershipId) return { ok: false, motivo: "uno_mismo" };
    if (rival.cohort_id !== mia.cohortId) return { ok: false, motivo: "rival_fuera_de_liga" };

    const portonRival = await portonDe(db, rival);
    if (!portonRival) return { ok: false, motivo: "rival_inexistente" };
    const rivalElegibilidad = puedeRetar(
      {
        banda: participacion.banda, // la cohorte es de UNA banda: la mía es la suya
        birth_year: portonRival.birth_year,
        opt_in: portonRival.opt_in,
        pendientes_salientes: 0,
      },
      anio,
    );
    if (!rivalElegibilidad.puede) return { ok: false, motivo: rivalElegibilidad.motivo };

    // ── El set congelado, el mismo para los dos. ─────────────────────────────
    const set = elegirSet(idsDelBanco, ITEMS_POR_DUELO, dueloId);
    if (set.length < ITEMS_POR_DUELO) return { ok: false, motivo: "banco_vacio" };

    const duelo = crearDuelo({
      id: dueloId,
      cohort_id: mia.cohortId,
      challenger_membership_id: mia.membershipId,
      challenged_membership_id: rival.id,
      item_set: set,
      ahora,
    });

    await db
      .prepare(
        "INSERT INTO league_duel " +
          "(id, cohort_id, challenger_membership_id, challenged_membership_id, item_set, " +
          "created_at, expires_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE')",
      )
      .bind(
        duelo.id,
        duelo.cohort_id,
        duelo.challenger_membership_id,
        duelo.challenged_membership_id,
        JSON.stringify(duelo.item_set),
        duelo.created_at,
        duelo.expires_at,
      )
      .run();

    return { ok: true, duelo_id: duelo.id };
  } catch {
    return { ok: false, motivo: "error_interno" };
  }
}

// ─── Jugar la mitad ──────────────────────────────────────────────────────────

/** El progreso a medias, en KV. Ver el encabezado: la verdad duradera es D1. */
interface ProgresoDeDuelo {
  puntos: number;
  vistos: string[];
}

const llaveDeProgreso = (dueloId: string, membershipId: string) =>
  `duelo:${dueloId}:${membershipId}`;

async function leerProgreso(
  kv: KvMinimo | undefined,
  dueloId: string,
  membershipId: string,
): Promise<ProgresoDeDuelo> {
  if (!kv) return { puntos: 0, vistos: [] };
  try {
    const crudo = await kv.get(llaveDeProgreso(dueloId, membershipId));
    if (!crudo) return { puntos: 0, vistos: [] };
    const p = JSON.parse(crudo) as ProgresoDeDuelo;
    if (!Array.isArray(p.vistos) || typeof p.puntos !== "number") return { puntos: 0, vistos: [] };
    return p;
  } catch {
    // KV caído no es un duelo perdido: se reinicia el set, nunca el juego.
    return { puntos: 0, vistos: [] };
  }
}

interface LadoEnDuelo {
  fila: FilaDuelo;
  duelo: Duelo;
  membershipId: string;
  soyChallenger: boolean;
}

/**
 * La fila del duelo y mi lado en ella, o el motivo por el que no hay lado.
 *
 * La membresía se busca por participante DENTRO de la cohorte del duelo, así
 * que un `dueloId` de otra liga o de otra semana no tiene lado para quien
 * pide — y un id inventado tampoco. Es la autorización entera de jugar: no
 * hay «duelo público» que mirar.
 */
async function ladoDe(
  db: BaseDeDatos,
  quien: JugadorDeLiga,
  dueloId: string,
): Promise<LadoEnDuelo | null> {
  const fila = await db
    .prepare("SELECT * FROM league_duel WHERE id = ?")
    .bind(dueloId)
    .first<FilaDuelo>();
  if (!fila) return null;

  const columna = quien.esAdulto ? "user_id" : "child_profile_id";
  const membresia = await db
    .prepare(`SELECT id FROM league_membership WHERE cohort_id = ? AND ${columna} = ?`)
    .bind(fila.cohort_id, quien.id)
    .first<{ id: string }>();
  if (!membresia) return null;
  if (membresia.id !== fila.challenger_membership_id && membresia.id !== fila.challenged_membership_id) {
    return null;
  }
  return {
    fila,
    duelo: comoMotor(fila),
    membershipId: membresia.id,
    soyChallenger: membresia.id === fila.challenger_membership_id,
  };
}

/** ¿Mi lado ya terminó el set? El invariante del encabezado: columna no nula. */
function miColumna(lado: LadoEnDuelo): number | null {
  return lado.soyChallenger ? lado.fila.challenger_points : lado.fila.challenged_points;
}

export type RespuestaDeServirDuelo =
  | { readonly estado: "item"; readonly item: unknown; readonly hechos: number; readonly total: number }
  | { readonly estado: "fin" }
  | { readonly estado: "error"; readonly motivo: string };

/**
 * Sirve el siguiente ítem del set congelado. EN ORDEN y sin repetir: el
 * progreso de KV dice cuántos van, y el set congelado dice cuál sigue — el
 * cliente no elige nada, igual que en el reto normal.
 *
 * `fin` no es un error: es el set terminado, el duelo ya resuelto, o la
 * ventana cerrada. La pantalla vuelve a la liga, que es donde el resultado
 * vive.
 */
export async function servirItemDeDuelo(
  env: EnvDuelo,
  quien: JugadorDeLiga,
  dueloId: string,
  locale: string,
  presentar: (itemId: string, locale: string) => Promise<unknown | null>,
  ahora: number,
): Promise<RespuestaDeServirDuelo> {
  if (!env.DB) return { estado: "error", motivo: "sin_bindings" };
  try {
    const lado = await ladoDe(env.DB, quien, dueloId);
    if (!lado) return { estado: "fin" };
    if (lado.fila.status !== "PENDIENTE") return { estado: "fin" };
    if (haExpirado(lado.duelo, ahora)) {
      await env.DB.prepare("UPDATE league_duel SET status = 'EXPIRADO' WHERE id = ? AND status = 'PENDIENTE'")
        .bind(dueloId)
        .run();
      return { estado: "fin" };
    }
    if (miColumna(lado) !== null) return { estado: "fin" };

    const progreso = await leerProgreso(env.SESSION_KV, dueloId, lado.membershipId);
    const vistos = new Set(progreso.vistos);
    const siguiente = lado.duelo.item_set.find((id) => !vistos.has(id));
    if (!siguiente) return { estado: "fin" };

    const item = await presentar(siguiente, locale);
    if (!item) return { estado: "error", motivo: "item_desconocido" };
    return { estado: "item", item, hechos: vistos.size, total: lado.duelo.item_set.length };
  } catch {
    return { estado: "error", motivo: "error_interno" };
  }
}

/**
 * ¿Este `itemId` es el que toca contestar ahora en este duelo?
 *
 * La comprobación va ANTES de calificar: un ítem fuera de orden no se califica
 * ni entra al modelo — si no es el del set, no es del duelo, y el reto normal
 * ya tiene su propio camino para servirlo.
 */
export async function validarTurnoDeDuelo(
  env: EnvDuelo,
  quien: JugadorDeLiga,
  dueloId: string,
  itemId: string,
  ahora: number,
): Promise<{ ok: true } | { ok: false; motivo: "duelo_cerrado" | "item_fuera_de_orden" }> {
  if (!env.DB) return { ok: false, motivo: "duelo_cerrado" };
  try {
    const lado = await ladoDe(env.DB, quien, dueloId);
    if (!lado) return { ok: false, motivo: "duelo_cerrado" };
    if (lado.fila.status !== "PENDIENTE") return { ok: false, motivo: "duelo_cerrado" };
    if (haExpirado(lado.duelo, ahora)) return { ok: false, motivo: "duelo_cerrado" };
    if (miColumna(lado) !== null) return { ok: false, motivo: "duelo_cerrado" };

    const progreso = await leerProgreso(env.SESSION_KV, dueloId, lado.membershipId);
    const vistos = new Set(progreso.vistos);
    const esperado = lado.duelo.item_set.find((id) => !vistos.has(id));
    if (!esperado || esperado !== itemId) return { ok: false, motivo: "item_fuera_de_orden" };
    return { ok: true };
  } catch {
    return { ok: false, motivo: "duelo_cerrado" };
  }
}

export type AvanceDeDuelo =
  | { readonly ok: true; readonly hechos: number; readonly total: number; readonly terminado: boolean }
  | { readonly ok: false; readonly motivo: string };

/**
 * Anota los puntos de un ítem del duelo YA calificado. Los puntos llegan
 * calculados por la ingesta con la fórmula de D-010 — aquí solo se suman.
 *
 * Al terminar el set se escribe la columna del lado (una sola vez: el UPDATE
 * exige que siga nula), y si el otro lado ya terminó, `resolver()` decide por
 * puntos del set compartido — nunca por quién acabó antes (#244)— y el duelo
 * queda JUGADO con su `winner_membership_id`, empate incluido (`null`).
 *
 * `puntos` puede ser negativo — la fórmula resta al fallar rápido — y aquí NO
 * se acota a cero: el marcador del duelo es una comparación entre los dos,
 * no un contador de pantalla. El acotado a 0 es para la tabla de la liga
 * (D-081 cond. 3) y ya lo hace `sumarEnLiga` por su propio camino.
 */
export async function anotarPuntoDeDuelo(
  env: EnvDuelo,
  quien: JugadorDeLiga,
  dueloId: string,
  itemId: string,
  puntos: number,
  ahora: number,
): Promise<AvanceDeDuelo> {
  if (!env.DB) return { ok: false, motivo: "sin_bindings" };
  const db = env.DB;
  try {
    const lado = await ladoDe(db, quien, dueloId);
    if (!lado) return { ok: false, motivo: "duelo_cerrado" };
    if (lado.fila.status !== "PENDIENTE") return { ok: false, motivo: "duelo_cerrado" };
    if (haExpirado(lado.duelo, ahora)) return { ok: false, motivo: "duelo_cerrado" };

    const total = lado.duelo.item_set.length;
    const columna = lado.soyChallenger ? "challenger_points" : "challenged_points";

    // Reintento de una llamada ya completada: la columna escrita es la marca,
    // y no se escribe dos veces. Se reporta terminado y nada cambia.
    if (miColumna(lado) !== null) return { ok: true, hechos: total, total, terminado: true };

    const progreso = await leerProgreso(env.SESSION_KV, dueloId, lado.membershipId);
    const vistos = new Set(progreso.vistos);
    const esperado = lado.duelo.item_set.find((id) => !vistos.has(id));
    if (!esperado || esperado !== itemId) return { ok: false, motivo: "item_fuera_de_orden" };

    const suma = progreso.puntos + puntos;
    const hechos = vistos.size + 1;

    if (hechos < total) {
      // A medias: el progreso vive en KV con el TTL de lo que queda de ventana.
      if (env.SESSION_KV) {
        const restanteS = Math.max(60, Math.floor((lado.fila.expires_at - ahora) / 1000));
        await env.SESSION_KV.put(
          llaveDeProgreso(dueloId, lado.membershipId),
          JSON.stringify({ puntos: suma, vistos: [...vistos, itemId] } satisfies ProgresoDeDuelo),
          { expirationTtl: restanteS },
        );
      }
      return { ok: true, hechos, total, terminado: false };
    }

    // Set terminado: la columna se escribe UNA vez (el invariante del
    // encabezado) y el progreso de KV ya no hace falta.
    await db
      .prepare(`UPDATE league_duel SET ${columna} = ? WHERE id = ? AND ${columna} IS NULL`)
      .bind(suma, dueloId)
      .run();
    if (env.SESSION_KV) {
      try {
        await env.SESSION_KV.delete(llaveDeProgreso(dueloId, lado.membershipId));
      } catch {
        /* la llave caduca sola; el borrado es cortesía */
      }
    }

    // ¿Los dos terminaron? Se re-lee la fila: el otro lado pudo escribir su
    // columna en otra petición hace un segundo.
    const fresca = await db.prepare("SELECT * FROM league_duel WHERE id = ?").bind(dueloId).first<FilaDuelo>();
    if (fresca && fresca.status === "PENDIENTE" &&
        fresca.challenger_points !== null && fresca.challenged_points !== null) {
      const desenlace = resolver(
        comoMotor(fresca),
        { challenger: fresca.challenger_points, challenged: fresca.challenged_points },
        ahora,
      );
      if (desenlace.estado === "JUGADO") {
        await db
          .prepare(
            "UPDATE league_duel SET status = 'JUGADO', winner_membership_id = ? " +
              "WHERE id = ? AND status = 'PENDIENTE'",
          )
          .bind(desenlace.winner_membership_id, dueloId)
          .run();
      }
    }

    return { ok: true, hechos, total, terminado: true };
  } catch {
    return { ok: false, motivo: "error_interno" };
  }
}

// ─── El panel ────────────────────────────────────────────────────────────────

export interface FilaDePanel {
  readonly duelo_id: string;
  readonly alias_del_otro: string;
  /** `te_toca`: mi mitad sin jugar. `esperando`: la mía jugada. `terminado`. */
  readonly estado: "te_toca" | "esperando" | "terminado";
  /** Yo creé el reto. Lo usa la pantalla para elegir el texto. */
  readonly yo_rete: boolean;
  /** Solo cuando terminó; antes es `null` para los dos lados (motor, `verDuelo`). */
  readonly mis_puntos: number | null;
  readonly puntos_del_otro: number | null;
  readonly empate: boolean;
}

export interface ParRetable {
  readonly membership_id: string;
  readonly alias: string;
}

export type PanelDeDuelo =
  | { readonly estado: "sin_duelo" }
  | {
      readonly estado: "ok";
      readonly duelos: readonly FilaDePanel[];
      readonly pares: readonly ParRetable[];
    };

/** El alias público de una membresía: el del perfil de niño o el de la cuenta. */
async function aliasDeMembresia(
  db: BaseDeDatos,
  m: { child_profile_id: string | null; user_id: string | null },
): Promise<string | null> {
  if (m.child_profile_id !== null) {
    const p = await db
      .prepare("SELECT alias FROM child_profiles WHERE id = ? AND deleted_at IS NULL")
      .bind(m.child_profile_id)
      .first<{ alias: string }>();
    return p?.alias ?? null;
  }
  if (m.user_id !== null) {
    const u = await db
      .prepare("SELECT alias FROM users WHERE id = ? AND deleted_at IS NULL")
      .bind(m.user_id)
      .first<{ alias: string | null }>();
    return u?.alias ?? null;
  }
  return null;
}

/**
 * Lo que la pantalla de la liga enseña del duelo. Lee, con la única escritura
 * conserje de la expiración (ver el encabezado).
 *
 * Un duelo EXPIRADO no aparece NUNCA: rechazar es silencioso (#244), así que
 * no existe texto de expiración que mostrar. Los puntos solo viajan cuando el
 * duelo quedó JUGADO — antes, `verDuelo()` los devuelve en `null` para los
 * dos lados, porque saber que el otro ya terminó es media presencia.
 */
export async function cargarPanelDeDuelo(
  env: EnvDuelo,
  quien: JugadorDeLiga,
  ahora: number,
): Promise<PanelDeDuelo> {
  if (!env.DB) return { estado: "sin_duelo" };
  const db = env.DB;
  try {
    const participacion = await estadoDeParticipacion(env, quien);
    if (!participacion || participacion.banda === "KINDER") return { estado: "sin_duelo" };

    const miPorton = await portonDe(db, {
      child_profile_id: quien.esAdulto ? null : quien.id,
      user_id: quien.esAdulto ? quien.id : null,
    });
    if (!miPorton || !miPorton.opt_in) return { estado: "sin_duelo" };

    // La membresía de ESTA semana, SOLO leída: una pantalla no crea
    // membresías (esa regla es de `cargarTablaDe` y vale igual aquí).
    const columna = quien.esAdulto ? "user_id" : "child_profile_id";
    const { week_start } = semanaDe(ahora);
    const vigente = await db
      .prepare(
        `SELECT m.id, m.cohort_id FROM league_membership m
         JOIN league_cohort c ON c.id = m.cohort_id
         WHERE m.${columna} = ? AND c.week_start = ?
         ORDER BY c.escalon DESC, m.id
         LIMIT 1`,
      )
      .bind(quien.id, week_start)
      .first<{ id: string; cohort_id: string }>();
    if (!vigente) return { estado: "sin_duelo" };

    await barrerExpirados(db, ahora);

    // ── Mis duelos vivos. EXPIRADO no se selecciona: desaparece, a propósito. ─
    const filas = (
      await db
        .prepare(
          "SELECT * FROM league_duel " +
            "WHERE (challenger_membership_id = ? OR challenged_membership_id = ?) " +
            "AND status IN ('PENDIENTE','JUGADO') ORDER BY created_at DESC LIMIT 12",
        )
        .bind(vigente.id, vigente.id)
        .all<FilaDuelo>()
    ).results;

    const duelos: FilaDePanel[] = [];
    for (const f of filas) {
      const soyChallenger = f.challenger_membership_id === vigente.id;
      const otraId = soyChallenger ? f.challenged_membership_id : f.challenger_membership_id;
      const otra = await db
        .prepare("SELECT child_profile_id, user_id FROM league_membership WHERE id = ?")
        .bind(otraId)
        .first<{ child_profile_id: string | null; user_id: string | null }>();
      const aliasDelOtro = (otra && (await aliasDeMembresia(db, otra))) ?? "?";

      const desenlace = resolver(
        comoMotor(f),
        { challenger: f.challenger_points, challenged: f.challenged_points },
        ahora,
      );
      // La proyección del motor: los puntos solo existen cuando terminó.
      const vista = verDuelo(
        comoMotor(f),
        aliasDelOtro,
        {
          mios: soyChallenger ? f.challenger_points : f.challenged_points,
          del_otro: soyChallenger ? f.challenged_points : f.challenger_points,
        },
        desenlace,
      );

      const misPuntosCrudos = soyChallenger ? f.challenger_points : f.challenged_points;
      duelos.push({
        duelo_id: vista.duelo_id,
        alias_del_otro: vista.alias_del_otro,
        estado:
          desenlace.estado === "JUGADO" ? "terminado" : misPuntosCrudos === null ? "te_toca" : "esperando",
        yo_rete: soyChallenger,
        mis_puntos: vista.mis_puntos,
        puntos_del_otro: vista.puntos_del_otro,
        empate: desenlace.estado === "JUGADO" && desenlace.winner_membership_id === null,
      });
    }

    // ── A quién puedo retar: los pares de mi cohorte que TAMBIÉN pasan los ────
    // portones. La lista se calcula en el servidor; el niño no ve a quien no
    // puede recibir un reto, y el motivo no se enseña — no es asunto suyo.
    const pares = await paresRetables(db, vigente, quien, participacion.banda, miPorton, ahora);

    return { estado: "ok", duelos, pares };
  } catch {
    return { estado: "sin_duelo" };
  }
}

async function paresRetables(
  db: BaseDeDatos,
  vigente: { id: string; cohort_id: string },
  quien: JugadorDeLiga,
  banda: Banda,
  miPorton: DatosDePorton,
  ahora: number,
): Promise<ParRetable[]> {
  const { n: pendientes } = (await db
    .prepare(
      "SELECT COUNT(*) AS n FROM league_duel " +
        "WHERE challenger_membership_id = ? AND status = 'PENDIENTE'",
    )
    .bind(vigente.id)
    .first<{ n: number }>()) ?? { n: 0 };

  const anio = new Date(ahora).getUTCFullYear();
  const yo = puedeRetar(
    {
      banda,
      birth_year: miPorton.birth_year,
      opt_in: miPorton.opt_in,
      pendientes_salientes: pendientes,
    },
    anio,
  );
  if (!yo.puede) return [];

  const miembros = (
    await db
      .prepare(
        "SELECT id, child_profile_id, user_id FROM league_membership " +
          "WHERE cohort_id = ? AND id <> ? AND (outcome IS NULL OR outcome <> 'ARCHIVADA')",
      )
      .bind(vigente.cohort_id, vigente.id)
      .all<{ id: string; child_profile_id: string | null; user_id: string | null }>()
  ).results;

  const pares: ParRetable[] = [];
  for (const m of miembros) {
    const porton = await portonDe(db, m);
    if (!porton) continue;
    const elegible = puedeRetar(
      { banda, birth_year: porton.birth_year, opt_in: porton.opt_in, pendientes_salientes: 0 },
      anio,
    );
    if (!elegible.puede) continue;
    const alias = await aliasDeMembresia(db, m);
    if (alias === null) continue;
    pares.push({ membership_id: m.id, alias });
  }
  return pares;
}
