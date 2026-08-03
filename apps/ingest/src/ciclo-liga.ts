/**
 * `math-challenge-league-cycle-workflow` — el cierre semanal de las ligas.
 *
 * F7 · #241 · D-014, D-025, D-056, D-081.
 *
 * ─── Qué hace, una vez por semana ───────────────────────────────────────────
 *
 * El cron de `apps/ingest/wrangler.jsonc` (lunes 00:10 UTC) crea UNA instancia
 * de este Workflow con id derivado del instante programado. La instancia:
 *
 *   1. lista las `league_cohort` abiertas cuya semana ya terminó;
 *   2. cierra cada una en un paso propio con reintentos: reparte ascensos y
 *      descensos con `cerrarCiclo()` del motor (la escalera de #241, las cifras
 *      de D-056, el descenso SOLO sobre activos), escribe `final_rank` y
 *      `outcome`, coloca a cada miembro en una cohorte de la semana siguiente
 *      con los puntos a cero, y marca la vieja como CLOSED;
 *   3. archiva EN SILENCIO la membresía que cumple ocho semanas seguidas sin
 *      actividad (`SEMANAS_PARA_ARCHIVAR`, `[criterio propio]` del plan §4.3):
 *      `outcome = 'ARCHIVADA'` y no se crea membresía nueva. Sin notificación
 *      a nadie — no es punitivo porque nadie lo ve.
 *
 * ─── Por qué Workflow y no un cron desnudo (#241, criterio literal) ─────────
 *
 * Cerrar una cohorte son ~70 escrituras por cohorte y puede haber decenas de
 * cohortes. Un cron desnudo que muere a la mitad deja cohortes a medio cerrar
 * sin forma de retomar. Aquí cada cohorte es un `step.do` con reintentos: el
 * runtime memoiza los pasos completados y solo reejecuta el que falló.
 *
 * ─── Idempotencia, en tres capas y no por confianza ─────────────────────────
 *
 *   1. **El cierre entero de una cohorte es UN `db.batch()`**, que D1 ejecuta
 *      de forma atómica: o commit completo o nada. No existe el estado «media
 *      cohorte cerrada».
 *   2. **Guardia de entrada**: si la cohorte ya no está OPEN, el paso devuelve
 *      `yaEstabaCerrada` y no escribe nada. Un disparo manual sobre una semana
 *      ya cerrada es un no-op.
 *   3. **Ids deterministas + `INSERT OR IGNORE`**: la membresía nueva es
 *      `lm:<cohorteDestino>:<participante>` y la cohorte creada por el cierre
 *      es `lc:<banda>|<tipo>|e<escalon>|<semana>`. La guardia de la capa 2
 *      cubre las reejecuciones en serie; ésta cubre DOS INSTANCIAS
 *      CONCURRENTES (el cron y un disparo manual que se solapan): las dos leen
 *      OPEN antes de que ninguna commité, y la segunda encuentra sus propios
 *      ids ya escritos y los ignora en vez de reventar por llave duplicada o,
 *      peor, de colocar a alguien dos veces con otro id.
 *
 * El reparto en sí es puro y determinista (`cerrarCiclo`, sin reloj ni azar);
 * por eso una reejecución recalcula EXACTAMENTE lo mismo. Este archivo no usa
 * `Date.now()` ni azar en ninguna parte: los `created_at` de las cohortes
 * nuevas salen de la fecha de la semana, y el `joined_at` de la membresía
 * nueva conserva el original (determinista, y el desempate premia la
 * antigüedad). `audits/liga-ascenso-determinista.mjs` vigila las dos cosas.
 *
 * ─── Las condiciones de D-081, aplicadas aquí ───────────────────────────────
 *
 *   1. **La liga no quita nada**: este módulo escribe `league_cohort` y
 *      `league_membership`, y ninguna tabla más. No hay XP, racha, escudos ni
 *      mapa al alcance — `audits/liga-no-quita.mjs` sigue el grafo.
 *   2. **Sin presencia**: nada aquí registra quién está conectado.
 *   3. **Sin lenguaje de pérdida**: los outcomes son nombres internos
 *      (SUBE/SE_QUEDA/BAJA/ARCHIVADA), no texto de pantalla, y el archivado no
 *      se le comunica a nadie.
 */

import {
  SEMANAS_PARA_ARCHIVAR,
  cerrarCiclo,
  elegirCohorte,
  semanaDe,
  type Cohorte,
  type Membresia,
  type Resultado,
  type TipoParticipante,
} from "../../../packages/motor/src/liga.ts";
import type { Banda } from "../../../packages/motor/src/puntuacion.ts";

// ─── La base, estructural ────────────────────────────────────────────────────
//
// El módulo no pide `D1Database` sino la forma mínima que usa. Es lo que
// permite que la prueba lo ejecute contra `node:sqlite` con un adaptador de
// sesenta líneas, en vez de contra una base falsa que no corre el SQL de
// verdad — un cierre que solo se probó contra un simulacro de SQL no se probó.

export interface Sentencia {
  bind(...valores: unknown[]): Sentencia;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface BaseDeDatos {
  prepare(sql: string): Sentencia;
  /** Atómico en D1, y el cierre depende de que lo sea. */
  batch(sentencias: Sentencia[]): Promise<unknown>;
}

export interface EnvCicloLiga {
  DB: D1Database;
}

// ─── Filas tal como las devuelve D1 ──────────────────────────────────────────

interface FilaCohorte {
  id: string;
  banda: Banda;
  tipo_participante: TipoParticipante;
  escalon: number;
  week_start: string;
  week_end: string;
  status: "OPEN" | "CLOSED";
  member_count: number;
}

interface FilaMembresia {
  id: string;
  child_profile_id: string | null;
  user_id: string | null;
  points_this_week: number;
  active_days: number;
  joined_at: number;
}

/** La candidata local del bin-packing: la misma forma de `Cohorte`, mutable. */
type Candidata = { -readonly [K in keyof Cohorte]: Cohorte[K] };

export interface ResumenCierre {
  cohorte: string;
  /** true si se encontró ya cerrada: la reejecución no escribió nada. */
  yaEstabaCerrada: boolean;
  miembros: number;
  suben: number;
  bajan: number;
  archivadas: number;
  colocadas: number;
  cohortesNuevas: string[];
}

/** La llave estable de un participante: una de las dos FK, nunca las dos. */
function llaveDeParticipante(m: FilaMembresia): string {
  return m.child_profile_id !== null ? `child:${m.child_profile_id}` : `user:${m.user_id}`;
}

/** `YYYY-MM-DD` + N días, sin reloj: la semana siguiente es dato, no instante. */
function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d) + dias * 86_400_000).toISOString().slice(0, 10);
}

/** Epoch ms del lunes de esa semana, 00:00 UTC. Determinista a propósito. */
function epochDe(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

// ─── Paso 1: qué cohortes toca cerrar ────────────────────────────────────────

/**
 * Las cohortes abiertas de semanas ya terminadas.
 *
 * La semana de liga es UTC y empieza en lunes (`semanaDe`); una cohorte vence
 * cuando su `week_start` quedó estrictamente antes del lunes en curso. El
 * instante entra por parámetro — el Workflow lo recibe del cron— y el orden es
 * estable para que los nombres de paso sean reproducibles entre reintentos.
 */
export async function cohortesVencidas(db: BaseDeDatos, instanteUTC: number): Promise<string[]> {
  const { week_start } = semanaDe(instanteUTC);
  const r = await db
    .prepare(
      "SELECT id FROM league_cohort WHERE status = 'OPEN' AND week_start < ? ORDER BY week_start, id",
    )
    .bind(week_start)
    .all<{ id: string }>();
  return r.results.map((f) => f.id);
}

// ─── El archivado silencioso (#241, plan §4.3) ───────────────────────────────

/**
 * Cuántas semanas SEGUIDAS lleva sin jugar este participante, contando ésta.
 *
 * Lee hasta ocho membresías hacia atrás (las del mismo niño o del mismo
 * adulto, nunca una mezcla) y cuenta los ceros consecutivos desde la más
 * reciente. Ocho seguidas es el criterio propio del plan §4.3, marcado como
 * tal ahí y aquí: no viene de evidencia, viene de que un censo de cohorte no
 * puede llenarse de fantasmas. El archivado no se anuncia a nadie.
 */
async function semanasInactivasSeguidas(db: BaseDeDatos, m: FilaMembresia): Promise<number> {
  const columna = m.child_profile_id !== null ? "child_profile_id" : "user_id";
  const valor = m.child_profile_id ?? m.user_id;
  const r = await db
    .prepare(
      `SELECT m.active_days FROM league_membership m
       JOIN league_cohort c ON c.id = m.cohort_id
       WHERE m.${columna} = ?
       ORDER BY c.week_start DESC
       LIMIT ${SEMANAS_PARA_ARCHIVAR}`,
    )
    .bind(valor)
    .all<{ active_days: number }>();

  if (r.results.length < SEMANAS_PARA_ARCHIVAR) return 0;
  let seguidas = 0;
  for (const f of r.results) {
    if (f.active_days > 0) break;
    seguidas++;
  }
  return seguidas;
}

// ─── Paso 2: cerrar una cohorte ──────────────────────────────────────────────

/**
 * Cierra UNA cohorte. Atómico e idempotente — ver el encabezado.
 *
 * El orden de las decisiones:
 *
 *   1. Guardia: si ya no está OPEN, no hay nada que hacer.
 *   2. `cerrarCiclo()` reparte SUBE/SE_QUEDA/BAJA — puro, sin reloj ni azar.
 *   3. El archivado PISA el resultado del reparto: un inactivo nunca desciende
 *      (SE_QUEDA, siempre), pero a la octava semana seguida sin jugar su
 *      outcome es ARCHIVADA y no se le crea membresía nueva. Es housekeeping,
 *      no descenso: nadie lo ve.
 *   4. Cada no-archivado se coloca en una cohorte de la semana siguiente de su
 *      `escalon_siguiente`, con el mismo bin-packing de la formación
 *      (`elegirCohorte`): la abierta más llena con cupo, y si no hay, se abre
 *      una. Los puntos arrancan en cero, igual que Duolingo (plan §4.4).
 *   5. `member_count` de las cohortes destino se RECALCULA desde la verdad
 *      (un COUNT), no se incrementa: un incremento se desdobla en un reintento,
 *      un recálculo no.
 *   6. La vieja queda CLOSED. No se borra: es el historial (plan §4.4).
 */
export async function cerrarCohorte(db: BaseDeDatos, cohortId: string): Promise<ResumenCierre> {
  const cohorte = await db
    .prepare(
      "SELECT id, banda, tipo_participante, escalon, week_start, week_end, status, member_count " +
        "FROM league_cohort WHERE id = ?",
    )
    .bind(cohortId)
    .first<FilaCohorte>();
  if (!cohorte) throw new Error(`cohorte desconocida: ${cohortId}`);

  if (cohorte.status !== "OPEN") {
    return {
      cohorte: cohortId,
      yaEstabaCerrada: true,
      miembros: 0,
      suben: 0,
      bajan: 0,
      archivadas: 0,
      colocadas: 0,
      cohortesNuevas: [],
    };
  }

  const filas = await db
    .prepare(
      "SELECT id, child_profile_id, user_id, points_this_week, active_days, joined_at " +
        "FROM league_membership WHERE cohort_id = ?",
    )
    .bind(cohortId)
    .all<FilaMembresia>();
  const miembros = filas.results;

  const comoMotor: Membresia[] = miembros.map((f) => ({
    id: f.id,
    child_profile_id: f.child_profile_id,
    user_id: f.user_id,
    points_this_week: f.points_this_week,
    active_days: f.active_days,
    joined_at: f.joined_at,
  }));
  const resultados = cerrarCiclo(cohorte.escalon, comoMotor);
  const porId = new Map(miembros.map((f) => [f.id, f]));

  // El archivado: solo un inactivo de ESTA semana puede completar las ocho.
  const archivadas = new Set<string>();
  for (const m of miembros) {
    if (m.active_days > 0) continue;
    if ((await semanasInactivasSeguidas(db, m)) >= SEMANAS_PARA_ARCHIVAR) {
      archivadas.add(m.id);
    }
  }

  const semanaSiguiente = sumarDias(cohorte.week_start, 7);
  const escrituras: Sentencia[] = [];
  const cohortesNuevas: string[] = [];
  // Las candidatas de cada escalón destino, leídas una vez y mantenidas al día
  // en memoria conforme se asigna. El `member_count` local es lo que alimenta
  // el bin-packing; el definitivo se recalcula con un COUNT al final.
  const candidatasPorEscalon = new Map<number, Candidata[]>();
  const tocadas = new Set<string>();

  async function candidatas(escalon: number): Promise<Candidata[]> {
    const previas = candidatasPorEscalon.get(escalon);
    if (previas) return previas;
    const r = await db
      .prepare(
        "SELECT id, banda, tipo_participante, escalon, week_start, member_count " +
          "FROM league_cohort " +
          "WHERE banda = ? AND tipo_participante = ? AND escalon = ? AND week_start = ? " +
          "AND status = 'OPEN'",
      )
      .bind(cohorte!.banda, cohorte!.tipo_participante, escalon, semanaSiguiente)
      .all<FilaCohorte>();
    const lista: Candidata[] = r.results.map((f) => ({
      id: f.id,
      banda: f.banda,
      tipo_participante: f.tipo_participante,
      escalon: f.escalon,
      week_start: f.week_start,
      member_count: f.member_count,
    }));
    candidatasPorEscalon.set(escalon, lista);
    return lista;
  }

  /** Id determinista de la cohorte que este cierre abre: la primera sin sufijo. */
  function idDeCohorteNueva(escalon: number, ordinal: number): string {
    const base = `lc:${cohorte!.banda}|${cohorte!.tipo_participante}|e${escalon}|${semanaSiguiente}`;
    return ordinal === 1 ? base : `${base}#${ordinal}`;
  }

  let suben = 0;
  let bajan = 0;
  let colocadas = 0;

  // Se recorre en orden de tabla (el orden de `cerrarCiclo`), así la asignación
  // es determinista y una reejecución construye las mismas sentencias.
  for (const r of resultados) {
    const m = porId.get(r.membership_id)!;
    const outcome: Resultado | "ARCHIVADA" = archivadas.has(m.id) ? "ARCHIVADA" : r.outcome;

    escrituras.push(
      db
        .prepare("UPDATE league_membership SET final_rank = ?, outcome = ? WHERE id = ?")
        .bind(r.final_rank, outcome, m.id),
    );

    if (outcome === "SUBE") suben++;
    if (outcome === "BAJA") bajan++;
    if (outcome === "ARCHIVADA") continue;

    // Colocar en la semana siguiente: la más llena con cupo, o una nueva.
    const cands = await candidatas(r.escalon_siguiente);
    const elegida = elegirCohorte(cands, cohorte.banda, cohorte.tipo_participante, semanaSiguiente);

    let destino: Candidata;
    if (elegida.cohorte) {
      // Es una de las `Candidata` de la lista local; el motor la devuelve con
      // el tipo `Cohorte` (de solo lectura) porque él no la muta — nosotros sí:
      // el conteo local es lo que alimenta el bin-packing de esta corrida.
      destino = elegida.cohorte as Candidata;
    } else {
      // No hay cupo en ninguna abierta: se abre una. El ordinal es el número de
      // cohortes que esta corrida ya abrió para este escalón — determinista.
      const ordinal = cohortesNuevas.filter((id) => id.includes(`|e${r.escalon_siguiente}|`)).length + 1;
      const nueva: Candidata = {
        id: idDeCohorteNueva(r.escalon_siguiente, ordinal),
        banda: cohorte.banda,
        tipo_participante: cohorte.tipo_participante,
        escalon: r.escalon_siguiente,
        week_start: semanaSiguiente,
        member_count: 0,
      };
      cohortesNuevas.push(nueva.id);
      cands.push(nueva);
      escrituras.push(
        db
          .prepare(
            "INSERT OR IGNORE INTO league_cohort " +
              "(id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
              "VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 0, ?)",
          )
          .bind(
            nueva.id,
            nueva.banda,
            nueva.tipo_participante,
            nueva.escalon,
            nueva.week_start,
            sumarDias(nueva.week_start, 6),
            epochDe(nueva.week_start),
          ),
      );
      destino = nueva;
    }

    escrituras.push(
      db
        .prepare(
          "INSERT OR IGNORE INTO league_membership " +
            "(id, cohort_id, child_profile_id, user_id, points_this_week, active_days, joined_at) " +
            "VALUES (?, ?, ?, ?, 0, 0, ?)",
        )
        .bind(`lm:${destino.id}:${llaveDeParticipante(m)}`, destino.id, m.child_profile_id, m.user_id, m.joined_at),
    );
    // El bin-packing local ve la asignación aunque el INSERT se ignore después:
    // en una reejecución las ya colocadas vuelven a elegir la misma destino.
    destino.member_count++;
    tocadas.add(destino.id);
    colocadas++;
  }

  // member_count se recalcula desde la verdad, no se incrementa. Las archivadas
  // no cuentan: el censo de una cohorte no puede llenarse de fantasmas (§4.3).
  for (const id of tocadas) {
    escrituras.push(
      db
        .prepare(
          "UPDATE league_cohort SET member_count = (" +
            "SELECT COUNT(*) FROM league_membership lm " +
            "WHERE lm.cohort_id = league_cohort.id AND (lm.outcome IS NULL OR lm.outcome <> 'ARCHIVADA')" +
            ") WHERE id = ?",
        )
        .bind(id),
    );
  }

  escrituras.push(
    db.prepare("UPDATE league_cohort SET status = 'CLOSED' WHERE id = ? AND status = 'OPEN'").bind(cohortId),
  );

  // UN batch: el cierre entero commita o no commita. No existe la cohorte a
  // medio cerrar.
  await db.batch(escrituras);

  return {
    cohorte: cohortId,
    yaEstabaCerrada: false,
    miembros: miembros.length,
    suben,
    bajan,
    archivadas: archivadas.size,
    colocadas,
    cohortesNuevas,
  };
}
