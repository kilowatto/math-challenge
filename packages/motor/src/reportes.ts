/**
 * El motor del reporte por correo al padre (F8 #288). Uno solo, y PURO.
 *
 * Mismo contrato que `puntuacion.ts` y `racha.ts` (D-018): entran filas ya
 * leídas de las tablas de estado y un snapshot anterior, sale una estructura
 * de datos. Este módulo NO importa ningún cliente de D1, ni de Email Service,
 * ni una cola, y no lee el reloj — el instante y la zona llegan por parámetro
 * (la puerta instante→día/hora es `tiempo-local.ts`, la misma de la racha y
 * del límite de pantalla: un solo calendario).
 *
 * Y no emite HTML ni texto ya formado: devuelve datos y números crudos. Las
 * plantillas de los 7 locales (issue #291, `apps/web/src/i18n/reportes/`) son
 * las que redactan, y todo número pasa por `formatear()` de `numeros.ts` en
 * el locale del PADRE (mc-34: el separador de millares no es el mismo en
 * de-DE que en fr-FR). Es el principio de siempre: viaja la clave y el dato,
 * nunca la cadena.
 *
 * ─── Lo que este módulo garantiza, y de dónde sale ────────────────────────
 *
 *  1. **El reporte NUNCA compara** (D-025, mc-18, línea roja del diseño §5 de
 *     #286). Ni entre hermanos, ni contra «la media», ni contra la semana
 *     anterior como regla. Cada `SeccionHijo` se construye SOLO con la fila
 *     de ese niño y su propio snapshot: ningún campo de un hijo puede depender
 *     aritméticamente de otro `child_profile_id`. No es una promesa de tono —
 *     es una propiedad estructural del código, y hay una prueba que la mide
 *     (cambiar los números de un hijo no cambia ni un byte de la sección del
 *     otro) y un auditor estático que la vigila
 *     (`audits/reporte-sin-comparacion.mjs`, #292). La comparación implícita
 *     entre hermanos en el mismo correo es el riesgo documentado de este
 *     subsistema: Kluger & DeNisi midieron que más de un tercio de las
 *     retroalimentaciones normativas EMPEORÓ el desempeño.
 *
 *  2. **El orden de `hijos` es alfabético, jamás por desempeño.** Depende solo
 *     de `alias.localeCompare()`. Si el correo ordenara por puntos, el orden
 *     MISMO sería la comparación que el punto 1 prohíbe — una tabla de
 *     posiciones dibujada sin números.
 *
 *  3. **`null` y `0` no se confunden.** Con F7 sin desplegar, `xpTotal` y la
 *     racha llegan ausentes y salen `null`: la plantilla OMITE la sección. Un
 *     `0` afirmaría «no ha ganado XP», que es falso — «no hay dato» y «el
 *     valor es cero» son dos afirmaciones distintas (#288).
 *
 *  4. **`puntosGanados` nunca sale negativo.** Es
 *     `scoreAllTime - snapshot.lastScoreAllTime`, pero `score_totals` se
 *     resetea por temporada: si el acumulado bajó desde el último correo, la
 *     diferencia sería un número confuso para un padre. Se trata como `0` y el
 *     caso queda documentado en una prueba — no se deja pasar.
 *
 *  5. **La pausa familiar se NOMBRA, no se esconde** (decisión del dueño,
 *     2026-08-02, #286 pregunta 3). `enPausaHasta` viaja tal cual y la
 *     plantilla escribe «en pausa hasta [fecha]»: sin la mención, el padre
 *     puede leer una racha que no avanza como una racha rota sin explicación.
 */

import {
  diaEfectivo,
  horaLocal,
  type DiaLocal,
} from "./tiempo-local.ts";
import { diasEntre } from "./racha.ts";

// ─── La entrada: lo que quien llama ya leyó de D1 ───────────────────────────

/**
 * Una fila por hijo, armada por la capa de datos
 * (`apps/web/src/lib/reportes-datos.ts`) desde `score_totals`, `skill_state`,
 * `xp_totals`, `child_streak` y `screen_time_daily_usage`. El motor no sabe
 * de dónde vienen: por eso se puede probar sin base.
 */
export interface FilaHijoParaReporte {
  readonly childProfileId: string;
  /** Alias GENERADO del perfil (D-003). Es lo único del niño que sale de aquí. */
  readonly alias: string;
  /** `score_totals.total_score` del periodo `all_time`. */
  readonly scoreAllTime: number;
  /** `xp_totals.total_xp`, o ausente si F7 no ha desplegado para este perfil. */
  readonly xpTotal?: number | null;
  readonly currentStreak?: number | null;
  readonly maxStreak?: number | null;
  /** `child_streak.pause_until_local_date`, `YYYY-MM-DD` o null. */
  readonly pauseUntilLocalDate?: DiaLocal | null;
  /** `skill_id` con `mastered_at` dentro del periodo. Claves, nunca texto. */
  readonly skillsMasteredInPeriod: readonly string[];
  /** Habilidades con `due_at` vencido al cierre del periodo. Un conteo. */
  readonly skillsDueForReview: number;
  /**
   * Minutos y días activos del periodo, COMPUESTOS desde
   * `screen_time_daily_usage` (suma y conteo de filas del rango de días
   * locales) — el reporte no recalcula consumo, lee el rollup que el límite
   * de pantalla ya escribe (#286: «el reporte COMPONE, no recalcula»).
   * Ausentes → `null`, misma regla que el XP.
   */
  readonly minutosPracticados?: number | null;
  readonly diasActivos?: number | null;
  /** La fila de `child_report_state` tal como quedó tras el último envío. */
  readonly snapshot: {
    readonly lastScoreAllTime: number;
    readonly lastXpTotal: number | null;
  };
}

// ─── La salida: datos, nunca texto ──────────────────────────────────────────

/**
 * La sección de UN hijo. Cada campo se calcula exclusivamente con la
 * `FilaHijoParaReporte` de ese hijo: por construcción no existe camino por el
 * que el número de un hermano entre en la sección de otro.
 */
export interface SeccionHijo {
  readonly childProfileId: string;
  readonly alias: string;
  /** Puntos ganados en el periodo. Nunca negativo (nota 4 de la cabecera). */
  readonly puntosGanados: number;
  /** El acumulado histórico, para contexto del ganado. */
  readonly puntosTotales: number;
  readonly xpGanado: number | null;
  readonly xpTotal: number | null;
  readonly rachaActual: number | null;
  readonly rachaMaxima: number | null;
  /** `YYYY-MM-DD` si hay pausa vigente declarada; la plantilla la nombra. */
  readonly enPausaHasta: DiaLocal | null;
  readonly habilidadesDominadas: readonly string[];
  readonly repasosPendientes: number;
  readonly minutosPracticados: number | null;
  readonly diasActivos: number | null;
}

export interface ReporteHogar {
  readonly parentUserId: string;
  /** Ventana del reporte, en milisegundos desde la época. La fija quien llama. */
  readonly periodo: { readonly desde: number; readonly hasta: number };
  /** Orden: `alias.localeCompare()`, NUNCA por desempeño (nota 2). */
  readonly hijos: readonly SeccionHijo[];
}

/**
 * Construye el resumen del hogar. Pura: mismas entradas, misma salida, sin
 * reloj, sin red, sin base.
 *
 * Los puntos ganados son la diferencia contra el PROPIO snapshot del niño —
 * la única resta que existe en este módulo es de un hijo contra sí mismo en
 * otro instante. Nunca contra otro niño.
 */
export function construirReporteHogar(
  parentUserId: string,
  periodo: { desde: number; hasta: number },
  filas: readonly FilaHijoParaReporte[],
): ReporteHogar {
  const hijos: SeccionHijo[] = filas.map((fila) => {
    const ganados = fila.scoreAllTime - fila.snapshot.lastScoreAllTime;
    const xpGanado =
      fila.xpTotal == null
        ? null
        : Math.max(0, fila.xpTotal - (fila.snapshot.lastXpTotal ?? 0));
    return {
      childProfileId: fila.childProfileId,
      alias: fila.alias,
      // Una temporada reseteada de `score_totals` haría esto negativo; para el
      // padre eso se leería como «perdió puntos», que no es lo que pasó.
      puntosGanados: Math.max(0, ganados),
      puntosTotales: fila.scoreAllTime,
      xpGanado,
      xpTotal: fila.xpTotal ?? null,
      rachaActual: fila.currentStreak ?? null,
      rachaMaxima: fila.maxStreak ?? null,
      enPausaHasta: fila.pauseUntilLocalDate ?? null,
      habilidadesDominadas: [...fila.skillsMasteredInPeriod],
      repasosPendientes: fila.skillsDueForReview,
      minutosPracticados: fila.minutosPracticados ?? null,
      diasActivos: fila.diasActivos ?? null,
    };
  });

  // El orden es el del alias y nada más. `localeCompare` sin locale explícito
  // a propósito: lo único que se pide del orden es que no dependa del
  // desempeño y sea ESTABLE entre ejecuciones — cualquier criterio
  // alfabético consistente sirve, y el del runtime es determinista para un
  // mismo conjunto de alias.
  hijos.sort((a, b) => a.alias.localeCompare(b.alias));

  return { parentUserId, periodo: { ...periodo }, hijos };
}

// ─── La decisión de envío: ¿le toca correo a este hogar, ahora? ─────────────

/** Las tres cadencias posibles. `OFF` es lo que pone la baja de un toque. */
export type CadenciaReporte = "WEEKLY" | "MONTHLY" | "OFF";

/** La cadencia cuando todavía no hay fila en `parent_report_settings`. */
export const CADENCIA_POR_DEFECTO: CadenciaReporte = "WEEKLY";

/** La hora local por defecto (mañana, dentro de la ventana 7..20 de mc-19). */
export const HORA_POR_DEFECTO = 8;

/** La ventana de silencio (mc-19 rec. #13): fuera de 07:00-20:00 no se escribe. */
export const HORA_MINIMA = 7;
export const HORA_MAXIMA = 20;

export interface AjustesEnvioReporte {
  readonly cadencia: CadenciaReporte;
  /** Hora LOCAL del hogar, 7..20 — el CHECK de `parent_report_settings`. */
  readonly horaLocal: number;
  /** Instante UTC del último envío confirmado, o null si nunca se ha enviado. */
  readonly ultimoEnvioUtc: number | null;
}

export interface DecisionEnvioReporte {
  readonly enviar: boolean;
  /** Por qué no, en clave — para el registro del ciclo, no para el padre. */
  readonly motivo:
    | "apagado"
    | "fuera_de_la_hora"
    | "semana_no_cumplida"
    | "mes_ya_enviado"
    | "toca";
}

/**
 * ¿Toca enviarle el reporte a este hogar en este instante?
 *
 * Pura: el instante y la zona llegan por parámetro. La hora se compara en la
 * zona del HOGAR (`users.timezone`) — un disparo fijo en UTC golpearía
 * distinto a cada mercado (#289: el mismo problema que F7 ya resolvió para
 * el corte nocturno con la misma columna).
 *
 * La cadencia se mide en DÍAS LOCALES, no en milisegundos: «semanal» es «al
 * menos 7 días locales desde el último envío» y «mensual» es «no va correo
 * este mes local todavía». Medirlo en instantes arrastraría la hora de envío
 * una hora más tarde cada semana hasta salirse de la ventana.
 */
export function decidirEnvioReporte(
  ajustes: AjustesEnvioReporte,
  ahoraUtc: number,
  zonaIana: string,
): DecisionEnvioReporte {
  if (
    ajustes.cadencia !== "WEEKLY" &&
    ajustes.cadencia !== "MONTHLY" &&
    ajustes.cadencia !== "OFF"
  ) {
    throw new RangeError(`cadencia desconocida: ${JSON.stringify(ajustes.cadencia)}`);
  }
  if (
    !Number.isInteger(ajustes.horaLocal) ||
    ajustes.horaLocal < HORA_MINIMA ||
    ajustes.horaLocal > HORA_MAXIMA
  ) {
    throw new RangeError(
      `hora local fuera de la ventana ${HORA_MINIMA}..${HORA_MAXIMA}: ${ajustes.horaLocal}`,
    );
  }
  if (ajustes.cadencia === "OFF") return { enviar: false, motivo: "apagado" };

  // La hora actual del hogar, `HH:MM` en su zona. El cron corre cada hora en
  // punto, así que basta comparar la hora; el minuto no entra.
  const hora = Number(horaLocal(ahoraUtc, zonaIana).slice(0, 2));
  if (hora !== ajustes.horaLocal) return { enviar: false, motivo: "fuera_de_la_hora" };

  if (ajustes.ultimoEnvioUtc === null) return { enviar: true, motivo: "toca" };

  const hoy = diaEfectivo(ahoraUtc, zonaIana);
  const ultimo = diaEfectivo(ajustes.ultimoEnvioUtc, zonaIana);

  if (ajustes.cadencia === "WEEKLY") {
    return diasEntre(ultimo, hoy) >= 7
      ? { enviar: true, motivo: "toca" }
      : { enviar: false, motivo: "semana_no_cumplida" };
  }

  // MONTHLY: un correo por mes LOCAL del hogar. Se comparan las etiquetas
  // `YYYY-MM` de los dos días — no 30 instantes, que se saldrían de mes en
  // febrero y mandarían dos correos en marzo.
  const mesActual = hoy.slice(0, 7);
  const mesUltimo = ultimo.slice(0, 7);
  return mesActual !== mesUltimo
    ? { enviar: true, motivo: "toca" }
    : { enviar: false, motivo: "mes_ya_enviado" };
}

/** La ventana del reporte según la cadencia, en milisegundos. */
export function ventanaDelPeriodo(cadencia: CadenciaReporte, hastaUtc: number): {
  desde: number;
  hasta: number;
} {
  const dias = cadencia === "MONTHLY" ? 30 : 7;
  return { desde: hastaUtc - dias * 86_400_000, hasta: hastaUtc };
}
