/**
 * El motor de ligas. Uno solo, puro, y sin permiso para quitar nada.
 *
 * #237, #238, #241, #243 · D-003, D-010, D-025, D-040, D-056, D-081.
 *
 * Mismo contrato que `puntuacion.ts` y `racha.ts`: entran estados, sale un
 * estado, y no se toca la red, ni el reloj, ni la base. Aquí «no se toca el
 * reloj» tiene consecuencia propia — el cierre semanal de una liga tiene que
 * poder re-ejecutarse y dar exactamente lo mismo, o un Workflow que reintenta
 * (que es como #241 pide que corra) produciría un ascenso distinto en el
 * segundo intento.
 *
 * ─── La condición 1 de D-081, que es la que gobierna este archivo ──────────
 *
 * **La liga nunca puede quitar nada.** Descender no borra XP, no quita escudos,
 * no toca la racha y no cambia el mapa. Ningún resultado social modifica un
 * contador de aprendizaje.
 *
 * La forma en que se garantiza importa más que la promesa: este módulo **no
 * importa `xp.ts`, ni `racha.ts`, ni `cosmeticos.ts`**, y ninguno de sus tipos
 * tiene un campo donde quepa un total de XP, una racha o un escudo. No hay una
 * rama que decida no tocarlos — no hay nada que tocar.
 * `audits/liga-no-quita.mjs` sigue el grafo y bloquea el commit que abra la
 * primera puerta.
 *
 * ─── La objeción del dueño está en D-081 y no se borra ─────────────────────
 *
 * `mc-10` mide que la presión de rendimiento **empeora el desempeño en
 * matemáticas**, y nadie ha visto todavía a un niño real usar una liga en este
 * producto. El dueño decidió salir con la escalera completa sabiéndolo. Este
 * archivo implementa esa decisión; no la defiende.
 *
 * ─── Sin lenguaje de pérdida (condición 3 de D-081) ────────────────────────
 *
 * `Resultado` se llama `SUBE` / `SE_QUEDA` / `BAJA` y son nombres internos, no
 * texto de pantalla. Este módulo **no produce ni una cadena que un niño lea**:
 * los textos viven en `apps/web/src/i18n/liga/` y los vigila
 * `audits/racha-lexico.mjs`, extendido a liga por D-081.
 */

import { NIVELES_POR_BANDA, type Banda } from "./puntuacion.ts";

// ─── Las dos particiones ─────────────────────────────────────────────────────

/**
 * Las seis bandas de D-010, **derivadas y no copiadas**.
 *
 * Escribirlas aquí como literal habría sido una segunda tabla de bandas, que es
 * exactamente lo que `audits/tabla-bandas.mjs` existe para impedir: «dos copias
 * divergen, y el síntoma no es un error, es un niño colocado en N4 por el
 * servidor al que la interfaz le enseña Nivel 3».
 *
 * El CHECK de `league_cohort.banda` en la migración 0011 es el tercer sitio
 * donde estas seis aparecen, y ése no puede derivarse —es SQL—, así que el
 * auditor lo cruza contra la tabla de la decisión.
 */
export const BANDAS_DE_LIGA: readonly Banda[] = Object.keys(NIVELES_POR_BANDA) as Banda[];

/**
 * Niño o adulto. **Nunca los dos en la misma cohorte.**
 *
 * Esta partición no sale de ninguna decisión previa: salió de la crítica
 * adversarial del diseño de F7. Un adulto de banda SECUNDARIA y un niño de
 * banda SECUNDARIA comparten fórmula de puntuación (D-010) y no tienen por qué
 * compartir lista — mezclarlos pondría a un adulto y a un menor en la misma
 * superficie social, que es la categoría entera que D-027 eliminó.
 */
export type TipoParticipante = "child" | "adult";

// ─── Las constantes del ciclo (D-056, #241) ──────────────────────────────────

/** El tamaño de referencia de una liga. D-003: «ligas de ~30». */
export const TAMANIO_OBJETIVO = 30;

/**
 * Cuántos ascienden y cuántos descienden en una liga completa.
 *
 * D-056 adoptó las cifras reales de Duolingo —7 de 30 (23.3%) suben, 5 de 30
 * (16.7%) bajan— en vez del «10% inferior» sin cifra de ascenso que traía
 * `master-plan.md` §6 y que nunca se verificó contra el producto que cita como
 * modelo. `mc-18` recomienda algo más conservador (15-20% / 10%) y esa objeción
 * queda escrita en la propia decisión.
 */
export const SUBEN_DE_30 = 7;
export const BAJAN_DE_30 = 5;

/** Bajo este número de ACTIVOS la cohorte se congela: no sube ni baja nadie. */
export const MINIMO_ACTIVOS = 5;

/** Desde este escalón no se asciende. Se desciende con normalidad (#241). */
export const ESCALON_TOPE = 10;

/** El primer escalón. Desde aquí no se desciende: no hay dónde. */
export const ESCALON_MINIMO = 1;

/** Semanas seguidas sin actividad tras las que la membresía se archiva (#241). */
export const SEMANAS_PARA_ARCHIVAR = 8;

// ─── La cohorte ──────────────────────────────────────────────────────────────

export interface Cohorte {
  readonly id: string;
  readonly banda: Banda;
  readonly tipo_participante: TipoParticipante;
  readonly escalon: number;
  /** `YYYY-MM-DD` del lunes, en UTC. Una cohorte cierra a la vez para todos. */
  readonly week_start: string;
  readonly member_count: number;
}

/**
 * Una membresía, con los mismos nombres que las columnas de `league_membership`.
 *
 * Los nombres son los de D1 por la misma razón que `EstadoRacha` usa los suyos:
 * `audits/liga-no-quita.mjs` vigila el grafo de lo que toca estas columnas, y
 * una capa de traducción entre `points_this_week` y `puntosDeLaSemana` sería
 * exactamente el punto donde el auditor deja de ver.
 *
 * **Lo que no tiene:** ni `total_xp`, ni `current_streak`, ni
 * `shields_available`, ni nada del mapa. Condición 1 de D-081: no hay dónde
 * escribir un contador de aprendizaje, así que ningún resultado social puede
 * modificarlo.
 */
export interface Membresia {
  readonly id: string;
  readonly child_profile_id: string | null;
  readonly user_id: string | null;
  readonly points_this_week: number;
  /** Días de la semana con al menos un reto. 0 = inactivo esta semana. */
  readonly active_days: number;
  /** Epoch ms. Solo se usa como desempate determinista. */
  readonly joined_at: number;
}

/** Qué le pasa a una membresía al cerrar la semana. Nombres internos. */
export type Resultado = "SUBE" | "SE_QUEDA" | "BAJA";

export interface ResultadoDeCiclo {
  readonly membership_id: string;
  readonly final_rank: number;
  readonly outcome: Resultado;
  /** El escalón de la semana siguiente. Nunca menor que `ESCALON_MINIMO`. */
  readonly escalon_siguiente: number;
}

// ─── La llave de una cohorte ─────────────────────────────────────────────────

/**
 * La llave que decide con quién compite alguien.
 *
 * Lleva las **cuatro** dimensiones y no tres: banda, tipo de participante, escalón
 * y semana. Quitar cualquiera de las cuatro fusiona dos poblaciones que no
 * deben verse, y la que se olvida siempre es el tipo de participante porque no
 * está en ninguna decisión previa.
 */
export function claveDeCohorte(
  banda: Banda,
  tipo: TipoParticipante,
  escalon: number,
  weekStart: string,
): string {
  if (!BANDAS_DE_LIGA.includes(banda)) {
    throw new RangeError(`banda desconocida: ${banda}. Las seis de D-010, ni una más.`);
  }
  if (tipo !== "child" && tipo !== "adult") {
    throw new RangeError(
      `tipo de participante desconocido: ${tipo}. Una cohorte es de niños o de adultos, ` +
        "nunca de los dos.",
    );
  }
  if (!Number.isInteger(escalon) || escalon < ESCALON_MINIMO || escalon > ESCALON_TOPE) {
    throw new RangeError(`escalón fuera de la escalera: ${escalon} (${ESCALON_MINIMO}..${ESCALON_TOPE})`);
  }
  return `${banda}|${tipo}|e${escalon}|${weekStart}`;
}

/**
 * ¿Puede esta membresía entrar en esta cohorte?
 *
 * Devuelve el motivo cuando no, en vez de un booleano: quien llame tiene que
 * poder escribir en el registro POR QUÉ abrió una cohorte nueva, o la
 * fragmentación de ligas se vuelve inexplicable a las tres semanas.
 */
export function cabeEn(
  cohorte: Cohorte,
  banda: Banda,
  tipo: TipoParticipante,
  weekStart: string,
): { cabe: true } | { cabe: false; motivo: string } {
  if (cohorte.banda !== banda) {
    return { cabe: false, motivo: `banda distinta (${cohorte.banda} ≠ ${banda})` };
  }
  if (cohorte.tipo_participante !== tipo) {
    return {
      cabe: false,
      motivo: `tipo de participante distinto (${cohorte.tipo_participante} ≠ ${tipo})`,
    };
  }
  if (cohorte.week_start !== weekStart) {
    return { cabe: false, motivo: `otra semana (${cohorte.week_start} ≠ ${weekStart})` };
  }
  if (cohorte.member_count >= TAMANIO_OBJETIVO) {
    return { cabe: false, motivo: `llena (${cohorte.member_count}/${TAMANIO_OBJETIVO})` };
  }
  return { cabe: true };
}

/**
 * Dónde entra un participante nuevo. **Nunca devuelve «espera».**
 *
 * Bin-packing continuo: se elige la cohorte abierta más llena que todavía tenga
 * cupo —para que las ligas tiendan a completarse en vez de quedar todas a
 * medias— y, si no hay ninguna, se pide una nueva. Una cohorte de un solo
 * miembro es un estado válido y transitorio; una sala de espera no lo es:
 * significaría que un niño abre la app y no puede jugar porque todavía no hay
 * suficientes niños como él, que es el modo de falla clásico del emparejamiento
 * y el que más rápido vacía un producto nuevo.
 *
 * Determinista con el mismo desempate que el resto del archivo: a igual
 * ocupación, gana el `id` menor. Sin eso, dos peticiones simultáneas podrían
 * elegir cohortes distintas y las dos serían «correctas».
 */
export function elegirCohorte(
  candidatas: readonly Cohorte[],
  banda: Banda,
  tipo: TipoParticipante,
  weekStart: string,
): { cohorte: Cohorte } | { cohorte: null; motivo: "abrir_nueva" } {
  const posibles = candidatas
    .filter((c) => cabeEn(c, banda, tipo, weekStart).cabe)
    .sort((a, b) => b.member_count - a.member_count || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return posibles.length > 0 ? { cohorte: posibles[0] } : { cohorte: null, motivo: "abrir_nueva" };
}

// ─── La semana ───────────────────────────────────────────────────────────────

/**
 * El lunes de la semana de un instante, en UTC, como `YYYY-MM-DD`.
 *
 * UTC y no el día local del hogar, a diferencia de la racha. No es una
 * inconsistencia: la racha mide si ESTA familia practicó hoy, y para eso el día
 * tiene que ser el suyo; una cohorte junta a familias de varias zonas y tiene
 * que cerrar a la vez para todas, o el último en cerrar juega con la tabla ya
 * publicada.
 */
export function semanaDe(instanteUTC: number): { week_start: string; week_end: string } {
  if (!Number.isFinite(instanteUTC)) {
    throw new RangeError(`instante no finito: ${instanteUTC}`);
  }
  const d = new Date(instanteUTC);
  // `getUTCDay()` da 0 el domingo. La semana empieza el lunes, así que el
  // domingo retrocede 6 días y no 0 — el error clásico de esta función.
  const desplazamiento = (d.getUTCDay() + 6) % 7;
  const lunes = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
    desplazamiento * 86_400_000;
  return { week_start: iso(lunes), week_end: iso(lunes + 6 * 86_400_000) };
}

function iso(t: number): string {
  const d = new Date(t);
  const a = String(d.getUTCFullYear()).padStart(4, "0");
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${a}-${m}-${dd}`;
}

// ─── El ciclo semanal (#241, D-056) ──────────────────────────────────────────

/**
 * Cuántos suben y cuántos bajan en una cohorte, según sus ACTIVOS.
 *
 * La escalera de #241, con la cifra de D-056 escalada al tamaño real:
 *
 *   · menos de 5 activos → congelada, 0 y 0
 *   · 5 a 9             → 1 sube, 1 baja
 *   · 10 a 29           → `round(n × 7/30)` y `round(n × 5/30)`, mínimo 1
 *   · 30                → 7 y 5, que son las cifras verificadas de Duolingo
 *
 * `n` es el número de **activos**, no el de miembros. Un inactivo no ocupa cupo
 * de descenso: ver `cerrarCiclo`.
 */
export function cupos(activos: number): { suben: number; bajan: number } {
  if (!Number.isInteger(activos) || activos < 0) {
    throw new RangeError(`número de activos inválido: ${activos}`);
  }
  if (activos < MINIMO_ACTIVOS) return { suben: 0, bajan: 0 };
  if (activos < 10) return { suben: 1, bajan: 1 };

  const suben = Math.max(1, Math.round((activos * SUBEN_DE_30) / TAMANIO_OBJETIVO));
  const bajan = Math.max(1, Math.round((activos * BAJAN_DE_30) / TAMANIO_OBJETIVO));

  // Con cohortes pequeñas los dos cupos podrían solaparse y alguien saldría a la
  // vez en la zona de ascenso y en la de descenso. Se recorta el descenso, no el
  // ascenso: recortar el ascenso castigaría a quien ganó por un problema de
  // aforo, y eso es quitarle algo a alguien por una razón que no es suya.
  const solapan = suben + bajan > activos;
  return { suben, bajan: solapan ? Math.max(0, activos - suben) : bajan };
}

/**
 * Ordena una tabla de liga. **Determinista hasta el último desempate.**
 *
 * Puntos primero (D-025: el tablero ordena por puntos, nunca por θ), después
 * días activos, después quién llegó antes, y al final el `id`. Los cuatro hacen
 * falta: sin el último, dos miembros con todo igual quedarían en el orden que
 * traiga el `SELECT`, y ese orden no está garantizado en SQLite. El síntoma
 * sería un ascenso que cambia entre dos corridas del mismo Workflow, que es
 * justo lo que un reintento idempotente no puede permitirse.
 *
 * No hay `Math.random()` en ninguna parte de este archivo, y no puede haberlo:
 * `audits/liga-ascenso-determinista.mjs` bloquea el commit.
 */
export function ordenar(miembros: readonly Membresia[]): Membresia[] {
  return [...miembros].sort(
    (a, b) =>
      b.points_this_week - a.points_this_week ||
      b.active_days - a.active_days ||
      a.joined_at - b.joined_at ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

/** ¿Practicó esta semana? Es lo único que decide si entra al reparto de cupos. */
export function estaActivo(m: Membresia): boolean {
  return m.active_days > 0;
}

/**
 * Cierra una cohorte y reparte ascensos y descensos.
 *
 * ─── El descenso solo alcanza a los ACTIVOS, y por qué eso es D-014 ────────
 *
 * Un miembro con `active_days === 0` no cuenta para el cupo de descenso y no
 * desciende, aunque esté en el fondo de la tabla cruda. #241 lo pide y la razón
 * es la extensión razonada de D-014 que el propio issue marca como tal: la
 * semana en que una familia respeta el límite de pantalla, o declara una pausa,
 * o sencillamente no juega, la liga no puede cobrársela. D-014 lo dice para la
 * racha con estas palabras —«si el límite de pantalla corta la sesión, la racha
 * del día se da por cumplida»— y aquí se aplica la misma idea: **no jugar no es
 * perder.**
 *
 * El precio, dicho de frente: una cohorte donde casi nadie juega apenas mueve a
 * nadie, y sus dos o tres activos se quedan compitiendo entre ellos. Es
 * preferible a la alternativa, que es hacer descender a un niño por una semana
 * en la que su padre decidió apagar la pantalla.
 *
 * ─── Idempotente ──────────────────────────────────────────────────────────
 *
 * Misma entrada, misma salida, siempre: sin reloj, sin azar, y con el orden
 * totalmente determinado. Un Workflow que reintenta a medias vuelve a calcular
 * exactamente lo mismo, que es lo que #241 pide con «reintentos idempotentes».
 */
export function cerrarCiclo(escalon: number, miembros: readonly Membresia[]): ResultadoDeCiclo[] {
  if (!Number.isInteger(escalon) || escalon < ESCALON_MINIMO || escalon > ESCALON_TOPE) {
    throw new RangeError(`escalón fuera de la escalera: ${escalon}`);
  }

  const tabla = ordenar(miembros);
  const activos = tabla.filter(estaActivo);
  const { suben, bajan } = cupos(activos.length);

  // Desde el escalón tope no se asciende (#241). Se desciende con normalidad: el
  // tope es un techo, no un refugio.
  const subenDeVerdad = escalon >= ESCALON_TOPE ? 0 : suben;
  // Y desde el primer escalón no se desciende, porque no hay dónde.
  const bajanDeVerdad = escalon <= ESCALON_MINIMO ? 0 : bajan;

  const suben_ids = new Set(activos.slice(0, subenDeVerdad).map((m) => m.id));
  const bajan_ids = new Set(
    bajanDeVerdad > 0 ? activos.slice(activos.length - bajanDeVerdad).map((m) => m.id) : [],
  );

  return tabla.map((m, i) => {
    const outcome: Resultado = suben_ids.has(m.id)
      ? "SUBE"
      : bajan_ids.has(m.id)
        ? "BAJA"
        : "SE_QUEDA";
    return {
      membership_id: m.id,
      final_rank: i + 1,
      outcome,
      escalon_siguiente:
        outcome === "SUBE"
          ? Math.min(ESCALON_TOPE, escalon + 1)
          : outcome === "BAJA"
            ? Math.max(ESCALON_MINIMO, escalon - 1)
            : escalon,
    };
  });
}

// ─── La escalera de visibilidad (D-081, #243) ────────────────────────────────

/**
 * Qué ve un participante de su propia posición, según su banda.
 *
 * D-081, que resuelve el pendiente explícito de D-003 («leer mc-10 antes de
 * fijar el default»):
 *
 *   · **KINDER** — opt-in del padre, default apagado, y si se activa la
 *     posición se muestra **en tercios**: nunca el número exacto y nunca «el
 *     último». `mc-10` mide que la presión de rendimiento empeora el desempeño
 *     en matemáticas, y `mc-18` implicación 7 recomienda no exponer el fondo de
 *     la tabla a los más chicos.
 *   · **PRIMARIA en adelante** — default encendido, posición numérica.
 *
 * El tercio se calcula **en el servidor** y el número exacto no viaja. Ocultarlo
 * en el cliente después de haberlo recibido no es ocultarlo: está en la
 * respuesta, en las herramientas del navegador y en cualquier registro de red.
 */
export type Tercio = "top" | "mid" | "bottom";

export type PosicionVisible =
  | { readonly forma: "tercio"; readonly tercio: Tercio }
  | { readonly forma: "exacta"; readonly rank: number };

export function posicionVisible(banda: Banda, rank: number, total: number): PosicionVisible {
  if (!Number.isInteger(rank) || rank < 1) throw new RangeError(`rango inválido: ${rank}`);
  if (!Number.isInteger(total) || total < rank) {
    throw new RangeError(`total inválido: ${total} para un rango ${rank}`);
  }
  if (banda !== "KINDER") return { forma: "exacta", rank };

  // Tercios por posición relativa. Con cohortes pequeñas el redondeo importa:
  // con 4 miembros, el 4º tiene que caer en `bottom` y el 1º en `top`, y una
  // división ingenua mete a todos en `top`.
  const proporcion = (rank - 1) / Math.max(1, total);
  const tercio: Tercio = proporcion < 1 / 3 ? "top" : proporcion < 2 / 3 ? "mid" : "bottom";
  return { forma: "tercio", tercio };
}

/**
 * Lo único que un participante puede ver de OTRO.
 *
 * §6.1 del diseño de F7 autoriza avatar, alias, puntos y posición. **La racha
 * no está**, y esa ausencia es deliberada: #242 la listaba y #243 la prohíbe
 * («nunca se muestra racha, puntaje histórico total, ni pertenencia a otros
 * grupos entre pares de liga»). Los dos issues se contradicen; manda el
 * restrictivo, porque una racha es un patrón de presencia diaria de un menor y
 * `mc-25` recital 26 recuerda que un alias con mapeo sigue siendo dato
 * personal. La contradicción está anotada en `docs/dudas.md` para que el dueño
 * la resuelva a propósito y no por omisión.
 *
 * Nunca se rellena desde una fila cruda con `...fila`: los campos se copian uno
 * a uno, para que añadir una columna a `league_membership` no publique nada por
 * accidente.
 */
export interface VistaDePar {
  readonly alias: string;
  readonly avatar_parts: string;
  readonly points_this_week: number;
  readonly posicion: PosicionVisible;
}

/**
 * Proyecta a un par para que otro lo vea. **Es la única puerta de salida.**
 *
 * Recibe el alias ya generado (`packages/motor/src/alias.ts`) y no un nombre:
 * este módulo no tiene forma de recibir un nombre real, porque no hay parámetro
 * donde meterlo. `audits/alias-nunca-nombre.mjs` bloquea el commit que lo
 * agregue.
 */
export function verPar(
  entrada: {
    alias: string;
    avatar_parts: string;
    points_this_week: number;
  },
  banda: Banda,
  rank: number,
  total: number,
): VistaDePar {
  return {
    alias: entrada.alias,
    avatar_parts: entrada.avatar_parts,
    points_this_week: entrada.points_this_week,
    posicion: posicionVisible(banda, rank, total),
  };
}

// ─── El opt-in (D-040, D-081, #243) ──────────────────────────────────────────

/**
 * ¿Este participante aparece en una liga?
 *
 * KINDER exige consentimiento explícito del padre; de PRIMARIA en adelante el
 * default es encendido. Para un adulto aprendiz siempre es sí — consiente por
 * sí mismo.
 *
 * `consentimientoVigente` es una fila de `child_consents` con
 * `consent_code = 'LEAGUE'` y `revoked_at IS NULL`. La **ausencia** de fila es
 * el apagado, que es el mecanismo que D-040 exige: no se inserta nada al crear
 * el perfil.
 */
export function participaEnLiga(
  banda: Banda,
  tipo: TipoParticipante,
  consentimientoVigente: boolean,
): boolean {
  if (tipo === "adult") return true;
  if (banda === "KINDER") return consentimientoVigente;
  return true;
}
