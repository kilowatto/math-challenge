/**
 * La membresía de liga: quién entra, cuándo, y cómo le llegan los puntos.
 *
 * F7 · #237, #242, #243 · D-003, D-040, D-081, D-106.
 *
 * ─── Qué vive aquí y qué no ─────────────────────────────────────────────────
 *
 * Los motores (`packages/motor/src/liga.ts`), el esquema (`migrations/0012`) y el
 * Durable Object (`lib/liga-do.ts`) ya existen y están desplegados; nadie los
 * llamaba. Este módulo es el cable:
 *
 *   · **El alta** (`asegurarMembresia`): el primer ítem que cuenta de la semana
 *     coloca al participante en una cohorte — `elegirCohorte()`, sin sala de
 *     espera: cohorte de 1 si hace falta (plan §3.2). Nunca se le niega la liga
 *     a nadie por falta de gente.
 *   · **El cable de puntos** (`sumarPuntosDeLiga`): cada ítem que cuenta suma
 *     sus puntos —ya calculados por `calificar()` en el Worker de ingesta (F3)—
 *     al DO (la tabla viva) y a D1 (la verdad que lee el cierre semanal).
 *     **Falla abierto**: la liga nunca interrumpe el juego.
 *   · **La baja** (`revocarLiga`): revoca —`revoked_at`, jamás `DELETE`— y saca
 *     al participante de la tabla viva ANTES de tocar D1, porque
 *     `olvidarEnLiga` no falla abierto.
 *   · **La lectura** (`cargarTablaDe`): lo que la pantalla necesita, sin
 *     escribir nada.
 *
 * ─── Las tres condiciones de D-081, aplicadas aquí ──────────────────────────
 *
 *  1. **La liga no quita nada.** Este archivo no escribe ningún contador de
 *     aprendizaje: toca `league_cohort`, `league_membership`, `child_consents`
 *     y `users.alias`, y nada más. `audits/liga-no-quita.mjs` sigue el grafo.
 *     La racha que se difunde llega ya calculada como parámetro (`racha`),
 *     de solo lectura — D-106.
 *  2. **Sin presencia.** Nada aquí registra quién está conectado; la pantalla
 *     no abre el WebSocket del DO aunque existe (ver la página).
 *  3. **Sin lenguaje de pérdida.** Este módulo no produce ni una cadena que un
 *     niño lea; los textos viven en `i18n/liga/` y los vigila `racha-lexico`.
 *
 * ─── Consentimiento: la revocación manda sobre el default ────────────────────
 *
 * `participaEnLiga()` del motor fija el default por banda (opt-in del padre en
 * la banda más chica, encendido de PRIMARIA en adelante, siempre sí para un
 * adulto). Pero el default encendido necesita una forma de apagarse, y
 * `child_consents` tiene UNA fila por (perfil, código): **una fila revocada es
 * un «no» explícito y gana siempre**, en cualquier banda. La regla completa:
 *
 *     revocada  → no participa, aunque el default de su banda sea encendido
 *     sin fila  → manda el default del motor
 *     vigente   → participa
 *
 * La baja de un perfil cuyo default es encendido se registra insertando la fila
 * ya revocada: `granted_at`/`granted_by` dicen quién y cuándo se tomó la
 * decisión, que es exactamente lo que #243 pide poder responder.
 *
 * ─── La ventana de los diez minutos del lunes, dicha de frente ───────────────
 *
 * El cierre semanal (Workflow desplegado, #241) corre el lunes 00:10 UTC y es
 * quien coloca a los que VUELVEN en la cohorte de la semana nueva, con su
 * escalón ya ajustado por el resultado. Entre las 00:00 y las 00:10 un jugador
 * que vuelve todavía no tiene membresía de la semana en curso. Si este módulo
 * lo colocara por su cuenta —a su último escalón, sin saber el resultado— el
 * cierre lo colocaría diez minutos después en OTRO escalón y quedarían dos
 * membresías de la misma semana, cada una replicada por cada cierre posterior
 * durante ocho semanas.
 *
 * Por eso la regla de creación es: **se crea membresía solo si no hay NINGUNA
 * previa, o si la cohorte más reciente ya está CLOSED** (que es la marca de
 * que el cierre ya corrió y decidió no colocar —ocho semanas sin actividad,
 * archivado silencioso—). En la ventana de los diez minutos no se crea nada:
 * los puntos de ese rato no se suman a la liga (fallo abierto, se pierde la
 * posición y nunca el juego), y a las 00:10 el cierre coloca como siempre.
 *
 * ─── Lo que este módulo NO hace ─────────────────────────────────────────────
 *
 *  · **No edita `liga-do.ts`.** Los helpers `/abrir` y `/unir` del DO se llaman
 *    aquí con un fetch propio de diez líneas porque `liga-do.ts` (territorio de
 *    otro frente) solo exporta `sumarEnLiga`/`leerTablaDeLiga`/`olvidarEnLiga`.
 *    Queda propuesto en el PR: esas dos funciones viven mejor allá.
 *  · **El duelo no es de este módulo.** Ni su elegibilidad ni su pantalla.
 */

import {
  ESCALON_MINIMO,
  claveDeCohorte,
  elegirCohorte,
  participaEnLiga,
  semanaDe,
  type Cohorte,
  type TipoParticipante,
} from "../../../../packages/motor/src/liga.ts";
import type { Banda } from "../../../../packages/motor/src/puntuacion.ts";
import { generarAlias } from "../../../../packages/motor/src/alias.ts";
import {
  leerTablaDeLiga,
  olvidarEnLiga,
  sumarEnLiga,
  type FilaDifundida,
} from "./liga-do.ts";
import { olvidarEnSalon, sumarEnGrupo, unirEnSalon } from "./classroom-do.ts";

// ─── La base, estructural (mismo patrón que ciclo-liga.ts) ───────────────────
//
// Se pide la forma mínima y no `D1Database`: es lo que permite que la prueba
// corra contra `node:sqlite` con un adaptador chico, ejecutando el SQL de
// verdad en vez de contra un simulacro.

export interface Sentencia {
  bind(...valores: unknown[]): Sentencia;
  all<T>(): Promise<{ results: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface BaseDeDatos {
  prepare(sql: string): Sentencia;
}

export interface EnvLiga {
  DB?: BaseDeDatos;
  LEAGUE_DO?: DurableObjectNamespace;
  CLASSROOM_DO?: DurableObjectNamespace;
}

/** Quién juega: la misma distinción polimórfica de `progreso.ts` (0007/0012). */
export interface JugadorDeLiga {
  readonly id: string;
  readonly esAdulto: boolean;
}

// ─── La participación ────────────────────────────────────────────────────────

interface FilaPerfilNino {
  theme_band: Banda;
  alias: string;
  avatar_parts: string;
  locale: string;
}

interface FilaUsuario {
  alias: string | null;
  locale: string;
}

export interface Participacion {
  readonly tipo: TipoParticipante;
  readonly banda: Banda;
  /** `null` solo en un caso: adulto sin alias todavía (se genera en el alta). */
  readonly alias: string | null;
  /** JSON de piezas listo para difundir (ver `avatarParaDifundir`). */
  readonly avatarParts: string;
  /** El locale de la cuenta o del perfil: lo pide el generador de alias. */
  readonly locale: string;
}

/**
 * ¿Este jugador aparece en una liga, y con qué velo?
 *
 * Devuelve `null` cuando no participa: perfil borrado, consentimiento
 * revocado, o banda de opt-in sin el consentimiento del padre. La regla
 * completa está en el encabezado: la revocación manda sobre el default.
 *
 * Lee y no escribe: lo usa la pantalla, que no puede tener efectos.
 */
export async function estadoDeParticipacion(
  env: EnvLiga,
  quien: JugadorDeLiga,
): Promise<Participacion | null> {
  if (!env.DB) return null;
  try {
    if (quien.esAdulto) {
      // El adulto consiente por sí mismo (D-081): siempre participa. Su banda
      // es SERIO — el mismo criterio de `app/mapa.astro`: D-017 lo ubica de 18
      // en adelante y `users` no tiene columna de banda.
      // `COALESCE(username, alias)` (D-197): el `@usuario` público reemplaza
      // el alias generado cuando el adulto lo fijó — mismo criterio que
      // `packages/motor/src/tablero.ts::SQL_TOP_ADULTO`. Se re-lee en cada
      // ítem (`asegurarMembresia` llama esta función y difunde el resultado
      // al DO de la liga), así que un cambio de `@usuario` llega a la liga en
      // el siguiente ítem que este adulto resuelva — el mismo cauce por el
      // que ya viajaba cualquier cambio de alias, sin mecanismo nuevo.
      const u = await env.DB.prepare(
        "SELECT COALESCE(username, alias) AS alias, locale FROM users WHERE id = ? AND deleted_at IS NULL",
      )
        .bind(quien.id)
        .first<FilaUsuario>();
      if (!u) return null;
      return {
        tipo: "adult",
        banda: "SERIO",
        alias: u.alias,
        avatarParts: avatarParaDifundir(quien.id, "{}"),
        locale: u.locale,
      };
    }

    const p = await env.DB.prepare(
      "SELECT theme_band, alias, avatar_parts, locale FROM child_profiles " +
        "WHERE id = ? AND deleted_at IS NULL",
    )
      .bind(quien.id)
      .first<FilaPerfilNino>();
    if (!p) return null;

    const consentimiento = await env.DB.prepare(
      "SELECT revoked_at FROM child_consents " +
        "WHERE child_profile_id = ? AND consent_code = 'LEAGUE'",
    )
      .bind(quien.id)
      .first<{ revoked_at: number | null }>();

    // Una fila revocada es un «no» explícito y manda sobre el default de la
    // banda — es lo que hace posible apagar la liga donde el default es
    // encendido, y es la forma que D-040 fija: revocar, nunca borrar.
    if (consentimiento && consentimiento.revoked_at !== null) return null;

    const vigente = consentimiento !== null && consentimiento.revoked_at === null;
    if (!participaEnLiga(p.theme_band, "child", vigente)) return null;

    return {
      tipo: "child",
      banda: p.theme_band,
      alias: p.alias,
      avatarParts: avatarParaDifundir(quien.id, p.avatar_parts),
      locale: p.locale,
    };
  } catch {
    // Una base que no responde no es un permiso ni una negativa: es «no se
    // sabe», y la liga se salta este ítem. El juego nunca se entera.
    return null;
  }
}

// ─── El avatar que se difunde ────────────────────────────────────────────────

/**
 * FNV-1a de 32 bits. **Segunda copia deliberada** de la de
 * `pages/[locale]/app/kids/index.astro`: aquella vive en una página `.astro`,
 * que no se puede importar. Misma función, mismo comentario de por qué: no
 * protege nada, solo reparte, y tiene que ser estable para siempre porque una
 * cara que cambia es un jugador que ya no se encuentra.
 */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Índice válido de catálogo, o el derivado. Misma regla que `kids/index.astro`. */
function indiceDe(valor: unknown, modulo: number, derivado: number): number {
  if (typeof valor !== "number" || !Number.isInteger(valor) || valor < 0) return derivado;
  return valor % modulo;
}

/**
 * El `avatar_parts` que viaja al DO.
 *
 * Si el perfil ya tiene piezas válidas (el catálogo de avatares de D-028), se
 * difunden esas. Si no —hoy nadie las tiene— se derivan del id del
 * participante con el mismo reparto que la rejilla de caras: misma entrada,
 * misma cara, para siempre, y sin guardar nada nuevo. Un adulto no tiene
 * `avatar_parts` en absoluto: siempre cae en el derivado.
 */
export function avatarParaDifundir(participanteId: string, avatarPartsCrudo: string): string {
  let elegido: { cara?: unknown; color?: unknown } = {};
  try {
    elegido = JSON.parse(avatarPartsCrudo || "{}");
  } catch {
    elegido = {};
  }
  const h = hash32(participanteId);
  return JSON.stringify({
    cara: indiceDe(elegido.cara, 6, h % 6),
    color: indiceDe(elegido.color, 6, Math.floor(h / 6) % 6),
  });
}

// ─── El alias del adulto aprendiz (#239) ─────────────────────────────────────

/**
 * Genera y escribe `users.alias` si todavía no tiene. Devuelve el alias vigente.
 *
 * ─── Por qué AQUÍ y no al crear la cuenta ────────────────────────────────────
 *
 * La migración 0012 lo dejó NULL a propósito: «se genera al primer
 * `is_learner = 1`, no al registrarse: generarlo para quien nunca practica
 * sería reservar un nombre público para alguien que nunca aparece en ninguna
 * lista». El alta en la liga ES ese primer momento en que el adulto compite —
 * antes de esto nadie leía `users.alias`, así que escribirlo en el registro
 * habría sido exactamente la reserva prematura que la migración evitó.
 *
 * El generador es `generarAlias()` del motor, con sus siete listas autoradas y
 * su lista de bloqueo sobre la cadena combinada. Nunca a mano.
 *
 * El `UPDATE … WHERE alias IS NULL` hace segura la carrera entre dos peticiones
 * simultáneas: una gana, la otra re-lee el ganador. Dos alias distintos para la
 * misma cuenta serían dos identidades públicas para una sola persona.
 */
async function aliasDeAdulto(env: EnvLiga, userId: string, locale: string): Promise<string | null> {
  const db = env.DB!;
  const previo = await db
    .prepare("SELECT alias FROM users WHERE id = ?")
    .bind(userId)
    .first<{ alias: string | null }>();
  if (previo?.alias) return previo.alias;

  const generado = generarAlias(locale as Parameters<typeof generarAlias>[0]);
  await db
    .prepare("UPDATE users SET alias = ?, alias_locale = ? WHERE id = ? AND alias IS NULL")
    .bind(generado.alias, generado.locale, userId)
    .run();

  const despues = await db
    .prepare("SELECT alias FROM users WHERE id = ?")
    .bind(userId)
    .first<{ alias: string | null }>();
  return despues?.alias ?? null;
}

// ─── El DO: /abrir y /unir ───────────────────────────────────────────────────

/**
 * Abre la cabecera de la cohorte en su objeto. Idempotente (un `put`), así que
 * se manda en cada alta sin mirar si ya estaba: la cabecera lleva la banda, y
 * sin ella la proyección de posición no sabe si toca tercio o número.
 */
async function abrirEnDo(
  ns: DurableObjectNamespace | undefined,
  cohortId: string,
  cabecera: { banda: Banda; tipo_participante: TipoParticipante; escalon: number; week_start: string },
): Promise<void> {
  if (!ns) return;
  try {
    await ns.get(ns.idFromName(cohortId)).fetch("https://liga/abrir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cabecera),
    });
  } catch {
    /* el DO se rehace en la próxima suma; la verdad está en D1 */
  }
}

/**
 * Registra al miembro en la tabla viva. Idempotente en el DO (`nuevo: false`
 * si ya estaba), así que también sirve de auto-reparación: una membresía de D1
 * cuyo objeto se perdió vuelve a aparecer en el siguiente ítem que cuente.
 */
async function unirEnDo(
  ns: DurableObjectNamespace | undefined,
  cohortId: string,
  fila: { membership_id: string; alias: string; avatar_parts: string; joined_at: number },
): Promise<void> {
  if (!ns) return;
  try {
    await ns.get(ns.idFromName(cohortId)).fetch("https://liga/unir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(fila),
    });
  } catch {
    /* falla abierto: la tabla viva se pone al día en el próximo ítem */
  }
}

// ─── El alta ─────────────────────────────────────────────────────────────────

export interface MembresiaVigente {
  readonly membershipId: string;
  readonly cohortId: string;
  readonly banda: Banda;
  readonly tipo: TipoParticipante;
}

interface FilaMembresiaDeSemana {
  id: string;
  cohort_id: string;
}

interface FilaCohorte {
  id: string;
  banda: Banda;
  tipo_participante: TipoParticipante;
  escalon: number;
  week_start: string;
  member_count: number;
}

/** La llave estable de un participante: la misma forma que usa el cierre. */
function llaveDeParticipante(quien: JugadorDeLiga): string {
  return quien.esAdulto ? `user:${quien.id}` : `child:${quien.id}`;
}

/**
 * La membresía de ESTA semana, creándola si hace falta. Nunca devuelve «espera».
 *
 * Devuelve `null` —sin escribir nada— cuando el jugador no participa
 * (consentimiento), cuando no hay base, o en la ventana de los diez minutos del
 * lunes (ver el encabezado). Quien llame trata el `null` como «la liga se
 * salta este ítem», nunca como un error.
 *
 * @param ahora el instante, medido por quien llama. Este módulo no lee relojes.
 */
export async function asegurarMembresia(
  env: EnvLiga,
  quien: JugadorDeLiga,
  ahora: number,
): Promise<MembresiaVigente | null> {
  if (!env.DB) return null;
  try {
    const participacion = await estadoDeParticipacion(env, quien);
    if (!participacion) return null;

    const { week_start } = semanaDe(ahora);
    const columna = quien.esAdulto ? "user_id" : "child_profile_id";

    // ── Ya colocado esta semana: se reusa. ──────────────────────────────────
    // Si hubiera dos (la ventana del lunes, ver el encabezado), gana la de
    // mayor escalón: es la que escribió el cierre con el resultado ya aplicado.
    const vigente = await env.DB.prepare(
      `SELECT m.id, m.cohort_id FROM league_membership m
       JOIN league_cohort c ON c.id = m.cohort_id
       WHERE m.${columna} = ? AND c.week_start = ?
       ORDER BY c.escalon DESC, m.id
       LIMIT 1`,
    )
      .bind(quien.id, week_start)
      .first<FilaMembresiaDeSemana>();

    if (vigente) {
      // Auto-reparación del estado vivo: si el objeto perdió la fila, este
      // ítem la vuelve a poner. `unir` es idempotente por construcción.
      if (participacion.alias !== null) {
        await unirEnDo(env.LEAGUE_DO, vigente.cohort_id, {
          membership_id: vigente.id,
          alias: participacion.alias,
          avatar_parts: participacion.avatarParts,
          joined_at: ahora,
        });
      }
      return {
        membershipId: vigente.id,
        cohortId: vigente.cohort_id,
        banda: participacion.banda,
        tipo: participacion.tipo,
      };
    }

    // ── La regla de creación (encabezado): sin previa, o con el cierre ya ───
    // corrido sobre su última cohorte. Una OPEN de semana pasada es la ventana
    // de los diez minutos: el cierre lo coloca en nada, con el escalón fino.
    const ultima = await env.DB.prepare(
      `SELECT c.escalon, c.status FROM league_membership m
       JOIN league_cohort c ON c.id = m.cohort_id
       WHERE m.${columna} = ?
       ORDER BY c.week_start DESC
       LIMIT 1`,
    )
      .bind(quien.id)
      .first<{ escalon: number; status: "OPEN" | "CLOSED" }>();
    if (ultima && ultima.status === "OPEN") return null;

    const escalon = ultima?.escalon ?? ESCALON_MINIMO;

    // Un adulto que compite por primera vez puede no tener alias todavía: se
    // genera aquí, con el generador del motor (ver `aliasDeAdulto`).
    const alias = quien.esAdulto
      ? await aliasDeAdulto(env, quien.id, participacion.locale)
      : participacion.alias;
    if (alias === null) return null;

    // ── La cohorte: la abierta más llena con cupo, o una nueva de 1. ────────
    //
    // Si no hay cupo en ninguna, se abre una con id determinista —`lc:` + la
    // llave del motor, con el sufijo `#N` del cierre cuando la base ya existe—
    // y OR IGNORE: dos altas simultáneas escriben la misma fila una vez, no
    // revientan ni duplican. Tras crear, se re-lee y se re-elige: si el IGNORE
    // mordió (la creó otro), la candidata ya está en la lista y el bin-packing
    // decide con datos reales. Sin el sufijo, el participante 31 de la semana
    // no encontraría cohorte nunca: la base existe, pero llena.
    const idBase = `lc:${claveDeCohorte(participacion.banda, participacion.tipo, escalon, week_start)}`;
    let elegida = elegirCohorte(
      await candidatasDe(env, participacion, escalon, week_start),
      participacion.banda,
      participacion.tipo,
      week_start,
    );
    for (let intento = 0; !elegida.cohorte && intento < 4; intento++) {
      const { n } = (await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM league_cohort WHERE id = ? OR id LIKE ?",
      )
        .bind(idBase, `${idBase}#%`)
        .first<{ n: number }>()) ?? { n: 0 };
      const id = n === 0 ? idBase : `${idBase}#${n + 1}`;
      await env.DB.prepare(
        "INSERT OR IGNORE INTO league_cohort " +
          "(id, banda, tipo_participante, escalon, week_start, week_end, status, member_count, created_at) " +
          "VALUES (?, ?, ?, ?, ?, ?, 'OPEN', 0, ?)",
      )
        .bind(id, participacion.banda, participacion.tipo, escalon, week_start, sumarDias(week_start, 6), ahora)
        .run();
      elegida = elegirCohorte(
        await candidatasDe(env, participacion, escalon, week_start),
        participacion.banda,
        participacion.tipo,
        week_start,
      );
    }
    if (!elegida.cohorte) return null;

    const cohortId = elegida.cohorte.id;
    const membershipId = `lm:${cohortId}:${llaveDeParticipante(quien)}`;
    await env.DB.prepare(
      "INSERT OR IGNORE INTO league_membership " +
        "(id, cohort_id, child_profile_id, user_id, points_this_week, active_days, joined_at) " +
        "VALUES (?, ?, ?, ?, 0, 0, ?)",
    )
      .bind(membershipId, cohortId, quien.esAdulto ? null : quien.id, quien.esAdulto ? quien.id : null, ahora)
      .run();

    // El censo se recalcula desde la verdad, nunca se incrementa: un
    // incremento se desdobla en una carrera, un recálculo no (regla del cierre).
    await env.DB.prepare(
      "UPDATE league_cohort SET member_count = (" +
        "SELECT COUNT(*) FROM league_membership lm " +
        "WHERE lm.cohort_id = league_cohort.id AND (lm.outcome IS NULL OR lm.outcome <> 'ARCHIVADA')" +
        ") WHERE id = ?",
    )
      .bind(cohortId)
      .run();

    // La fila ganadora, por si el IGNORE mordió (la creó otra petición a la vez).
    const ganadora = await env.DB.prepare("SELECT id, cohort_id FROM league_membership WHERE id = ?")
      .bind(membershipId)
      .first<FilaMembresiaDeSemana>();
    if (!ganadora) return null;

    await abrirEnDo(env.LEAGUE_DO, ganadora.cohort_id, {
      banda: participacion.banda,
      tipo_participante: participacion.tipo,
      escalon,
      week_start,
    });
    await unirEnDo(env.LEAGUE_DO, ganadora.cohort_id, {
      membership_id: ganadora.id,
      alias,
      avatar_parts: participacion.avatarParts,
      joined_at: ahora,
    });

    return {
      membershipId: ganadora.id,
      cohortId: ganadora.cohort_id,
      banda: participacion.banda,
      tipo: participacion.tipo,
    };
  } catch {
    // Falla abierto: un niño que ya contestó no ve nunca un error por la liga.
    return null;
  }
}

async function candidatasDe(
  env: EnvLiga,
  p: Participacion,
  escalon: number,
  weekStart: string,
): Promise<Cohorte[]> {
  const r = await env.DB!.prepare(
    "SELECT id, banda, tipo_participante, escalon, week_start, member_count " +
      "FROM league_cohort " +
      "WHERE banda = ? AND tipo_participante = ? AND escalon = ? AND week_start = ? AND status = 'OPEN'",
  )
    .bind(p.banda, p.tipo, escalon, weekStart)
    .all<FilaCohorte>();
  return r.results.map((f) => ({
    id: f.id,
    banda: f.banda,
    tipo_participante: f.tipo_participante,
    escalon: f.escalon,
    week_start: f.week_start,
    member_count: f.member_count,
  }));
}

/** `YYYY-MM-DD` + N días. La misma helper del cierre; la semana es dato. */
function sumarDias(fecha: string, dias: number): string {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d) + dias * 86_400_000).toISOString().slice(0, 10);
}

// ─── El cable de puntos ──────────────────────────────────────────────────────

/**
 * Suma a la liga los puntos de un ítem que CUENTA. **Falla abierto**, igual que
 * `sumarEnLiga`: si algo no responde, lo que se pierde es la posición de la
 * semana — nunca el juego, nunca la racha, nunca el XP.
 *
 * Escribe las DOS copias, y las dos hacen falta:
 *
 *  · el **DO** es la tabla viva que la pantalla lee (con la racha de solo
 *    lectura que D-106 autoriza a difundir);
 *  · **D1** es la verdad que el cierre semanal lee (`apps/ingest/ciclo-liga.ts`
 *    cierra con `points_this_week` y `active_days` de `league_membership`; sin
 *    este espejo, el cierre —que ya está desplegado— leería ceros para
 *    siempre y ninguna liga ascendería a nadie).
 *
 * `puntos` puede ser negativo —la fórmula de D-010 resta al fallar rápido— y
 * por eso el acumulado se acota a 0 por abajo en las dos copias: un total
 * negativo sería lenguaje de pérdida escrito con un número (D-081 cond. 3).
 *
 * @param diaNuevo true si este ítem fue el primero del día local del hogar.
 *   Es lo que cuenta `active_days` sin contar dos veces el mismo día, y lo
 *   decide quien registra el día de verdad (`progreso.ts`, D-091).
 */
export async function sumarPuntosDeLiga(
  env: EnvLiga,
  quien: JugadorDeLiga,
  entrada: { puntos: number; diaLocal: string; diaNuevo: boolean; racha: number; ahora: number },
): Promise<boolean> {
  if (!env.DB) return false;
  try {
    const m = await asegurarMembresia(env, quien, entrada.ahora);
    if (!m) return false;

    const enVivo = await sumarEnLiga(env.LEAGUE_DO, m.cohortId, {
      membership_id: m.membershipId,
      puntos: entrada.puntos,
      dia_local: entrada.diaLocal,
      racha: entrada.racha,
    });

    await env.DB.prepare(
      "UPDATE league_membership SET " +
        "points_this_week = MAX(0, points_this_week + ?), " +
        "active_days = MIN(7, active_days + ?) " +
        "WHERE id = ?",
    )
      .bind(entrada.puntos, entrada.diaNuevo ? 1 : 0, m.membershipId)
      .run();

    await sumarPuntosEnGrupos(env, quien, entrada);

    return enVivo;
  } catch {
    return false;
  }
}

interface FilaGrupoVisible {
  membership_id: string;
  child_group_id: string;
  leaderboard_opt_in: 0 | 1;
  alias: string;
  avatar_parts: string;
  theme_band: Banda;
  joined_at: number;
}

/** Replica el cierre calificado en cada grupo aprobado del niño, en modo abierto. */
export async function sumarPuntosEnGrupos(
  env: EnvLiga,
  quien: JugadorDeLiga,
  entrada: { puntos: number; racha: number; ahora: number },
): Promise<void> {
  if (quien.esAdulto || !env.DB || !env.CLASSROOM_DO) return;
  try {
    const filas = await env.DB.prepare(
      "SELECT m.id AS membership_id, m.child_group_id, m.leaderboard_opt_in, " +
        "p.alias, p.avatar_parts, p.theme_band, COALESCE(m.decided_at, m.requested_at) AS joined_at " +
        "FROM child_group_membership m " +
        "JOIN child_profiles p ON p.id = m.child_profile_id " +
        "WHERE m.child_profile_id = ? AND m.status = ? AND p.deleted_at IS NULL",
    )
      .bind(quien.id, "approved")
      .all<FilaGrupoVisible>();

    await Promise.all((filas.results ?? []).map(async (fila) => {
      if (fila.leaderboard_opt_in !== 1) {
        await olvidarEnSalon(env.CLASSROOM_DO, fila.child_group_id, fila.membership_id);
        return;
      }
      const unido = await unirEnSalon(env.CLASSROOM_DO, fila.child_group_id, {
        membership_id: fila.membership_id,
        alias: fila.alias,
        avatar_parts: fila.avatar_parts,
        banda: fila.theme_band,
        opt_in: 1,
        joined_at: fila.joined_at,
      });
      if (unido) {
        await sumarEnGrupo(env.CLASSROOM_DO, fila.child_group_id, {
          membership_id: fila.membership_id,
          puntos: entrada.puntos,
          racha: entrada.racha,
        });
      }
    }));
  } catch {
    // El grupo es una vista social: perder una actualización no interrumpe el reto.
  }
}

// ─── La lectura para la pantalla ─────────────────────────────────────────────

export type TablaDeLiga =
  | { readonly estado: "sin_liga" }
  | {
      /** Membresía vigente pero el objeto no respondió: degrada, no revienta. */
      readonly estado: "sin_datos";
      readonly banda: Banda;
    }
  | {
      readonly estado: "ok";
      readonly banda: Banda;
      readonly filas: FilaDifundida[];
      /** Para marcar la propia fila; `null` si no se pudo saber. */
      readonly aliasPropio: string | null;
    };

/**
 * Lo que la pantalla pinta. **No escribe nada**: una pantalla que crea
 * membresías al abrirse llenaría las ligas de filas de gente que solo miró.
 *
 * La tabla sale del DO —es la única copia que lleva la racha difundida de
 * D-106— y la posición ya viene proyectada del servidor (tercio o número, según
 * la banda de la cohorte): el número exacto de una cohorte de opt-in infantil
 * no viaja nunca al navegador (D-081).
 */
export async function cargarTablaDe(env: EnvLiga, quien: JugadorDeLiga, ahora: number): Promise<TablaDeLiga> {
  if (!env.DB) return { estado: "sin_liga" };
  try {
    const participacion = await estadoDeParticipacion(env, quien);
    if (!participacion) return { estado: "sin_liga" };

    const { week_start } = semanaDe(ahora);
    const columna = quien.esAdulto ? "user_id" : "child_profile_id";
    const vigente = await env.DB.prepare(
      `SELECT m.id, m.cohort_id FROM league_membership m
       JOIN league_cohort c ON c.id = m.cohort_id
       WHERE m.${columna} = ? AND c.week_start = ?
       ORDER BY c.escalon DESC, m.id
       LIMIT 1`,
    )
      .bind(quien.id, week_start)
      .first<FilaMembresiaDeSemana>();
    if (!vigente) return { estado: "sin_liga" };

    const filas = await leerTablaDeLiga(env.LEAGUE_DO, vigente.cohort_id);
    if (filas.length === 0) return { estado: "sin_datos", banda: participacion.banda };

    return {
      estado: "ok",
      banda: participacion.banda,
      filas,
      aliasPropio: participacion.alias,
    };
  } catch {
    return { estado: "sin_liga" };
  }
}

// ─── El opt-in y la baja (D-040, D-081, #243) ────────────────────────────────

/**
 * El padre activa la liga de un perfil. La propiedad ya la verificó la ruta
 * (`perfilPropio`): aquí solo se escribe, con la traza que #243 pide —quién,
 * cuándo, y la versión del texto vigente.
 *
 * `INSERT OR IGNORE` porque re-activar lo que ya está activo no es re-consentir:
 * la primera fila, con su `granted_at`, es la que vale. Si la fila existe y
 * está revocada, se reactiva con fecha nueva: ES un consentimiento nuevo.
 */
export async function otorgarLiga(
  env: EnvLiga,
  childProfileId: string,
  parentUserId: string,
  ahora: number,
): Promise<boolean> {
  if (!env.DB) return false;
  try {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO child_consents " +
        "(child_profile_id, consent_code, granted_by, granted_at, consent_version) " +
        "VALUES (?, 'LEAGUE', ?, ?, " +
        "(SELECT current_version FROM consent_type_catalog WHERE code = 'LEAGUE'))",
    )
      .bind(childProfileId, parentUserId, ahora)
      .run();
    await env.DB.prepare(
      "UPDATE child_consents SET revoked_at = NULL, granted_by = ?, granted_at = ?, " +
        "consent_version = (SELECT current_version FROM consent_type_catalog WHERE code = 'LEAGUE') " +
        "WHERE child_profile_id = ? AND consent_code = 'LEAGUE' AND revoked_at IS NOT NULL",
    )
      .bind(parentUserId, ahora, childProfileId)
      .run();
    return true;
  } catch {
    return false;
  }
}

/**
 * El padre quita a un perfil de la liga. **Revoca, no borra** (D-040).
 *
 * El orden es el contrato de `olvidarEnLiga`, que no falla abierto: primero se
 * saca al perfil de la tabla viva de esta semana, y SOLO si eso respondió se
 * toca D1. Al revés, un fallo del objeto dejaría al niño visible en una liga
 * de la que su padre acaba de bajarlo.
 *
 * Sin fila previa —el default encendido que se apaga por primera vez— la fila
 * se inserta ya revocada: queda constancia de quién decidió y cuándo, que es
 * lo que distingue «nunca se preguntó» de «se dijo que no».
 */
export async function revocarLiga(
  env: EnvLiga,
  childProfileId: string,
  parentUserId: string,
  ahora: number,
): Promise<{ ok: true } | { ok: false; motivo: string }> {
  if (!env.DB) return { ok: false, motivo: "sin_bindings" };
  try {
    const { week_start } = semanaDe(ahora);
    const vigente = await env.DB.prepare(
      `SELECT m.id, m.cohort_id FROM league_membership m
       JOIN league_cohort c ON c.id = m.cohort_id
       WHERE m.child_profile_id = ? AND c.week_start = ?
       LIMIT 1`,
    )
      .bind(childProfileId, week_start)
      .first<FilaMembresiaDeSemana>();

    if (vigente) {
      const olvidado = await olvidarEnLiga(env.LEAGUE_DO, vigente.cohort_id, vigente.id);
      if (!olvidado) return { ok: false, motivo: "no_se_pudo_olvidar" };
    }

    const previa = await env.DB.prepare(
      "SELECT revoked_at FROM child_consents WHERE child_profile_id = ? AND consent_code = 'LEAGUE'",
    )
      .bind(childProfileId)
      .first<{ revoked_at: number | null }>();

    if (previa) {
      await env.DB.prepare(
        "UPDATE child_consents SET revoked_at = ? WHERE child_profile_id = ? AND consent_code = 'LEAGUE'",
      )
        .bind(ahora, childProfileId)
        .run();
    } else {
      await env.DB.prepare(
        "INSERT INTO child_consents (child_profile_id, consent_code, granted_by, granted_at, revoked_at, consent_version) " +
          "VALUES (?, 'LEAGUE', ?, ?, ?, " +
          "(SELECT current_version FROM consent_type_catalog WHERE code = 'LEAGUE'))",
      )
        .bind(childProfileId, parentUserId, ahora, ahora)
        .run();
    }
    return { ok: true };
  } catch {
    return { ok: false, motivo: "error_interno" };
  }
}
