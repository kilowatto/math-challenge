/**
 * El diagnóstico del panel del padre — COMPOSICIÓN de lectura, no cálculo (#279).
 *
 * Módulo PURO, mismo contrato que `puntuacion.ts`, `sesion.ts`, `racha.ts` y
 * `mapa.ts`: recibe filas ya leídas de D1 y las compone en un
 * `DiagnosticoDeHijo`, sin tocar la red, ni la base, ni el reloj — el día de
 * «hoy» llega como parámetro, calculado por el llamador con `users.timezone`
 * del padre (la misma regla que la racha y el límite de pantalla).
 *
 * ─── Lo que este módulo NO hace, y es la mitad del issue ─────────────────────
 *
 *  · **No recalcula maestría.** `estadoDominio()` lee las columnas que F4
 *    escribe (`attempts`, `provisional_at`, `mastered_at` — la maestría en dos
 *    etapas de mc-05/D-018, esquema 0002) y las traduce a cuatro nombres. No
 *    corre BKT, ni Elo, ni un corte propio sobre `skill_state`: eso sería una
 *    segunda fuente de maestría, y dos fuentes divergen en silencio (mc-13
 *    impl. #10: el panel es «a different surface from real-time selection»).
 *  · **No reimplementa la curva de Rango.** `xp.rango` sale de `rangoDeXp()`
 *    (F7), nunca de una fórmula copiada — y `rango` jamás se guarda como
 *    columna (0007 lo prohíbe a propósito).
 *  · **No reordena la liga a mano.** La posición sale de `ordenar()` de
 *    `liga.ts` (F7), la misma función que ordena la cohorte de verdad.
 *  · **No mantiene una lista propia de habilidades.** Las de KINDER son
 *    `HABILIDADES_KINDER` (F6); el resto de bandas todavía no tiene catálogo
 *    de habilidades en el producto, y el panel muestra solo lo que tenga fila
 *    en `skill_state` — nunca una lista inventada.
 *  · **No habla.** Ni un solo texto de cara al usuario: las etiquetas son
 *    claves que resuelve la plantilla con `i18n/padre/` (misma regla que
 *    `cosmeticos.ts`).
 *
 * ─── Los cuatro estados, nunca un número (#280, D-017, D-020) ────────────────
 *
 * `sin_empezar → practicando → provisional → dominado` son literalmente las
 * cuatro etapas que `skill_state` ya modela (`f8-padres.md` §3.2): no son una
 * escala inventada para el panel. Ningún estado es un fracaso, ninguno es un
 * porcentaje y ninguno es una nota escolar — `mc-15` documenta ocho sistemas
 * de grado incompatibles y `mc-10` mide qué le hace la presión de rendimiento
 * a las matemáticas.
 */

import { rangoDeXp } from "./xp.ts";
import { ordenar, type Membresia } from "./liga.ts";
import { HABILIDADES_KINDER } from "./banco-kinder.ts";
import { diasEntre, sumarDias } from "./racha.ts";
import type { DiaLocal } from "./tiempo-local.ts";
import type { TemaVisual } from "./bandas.ts";

/* ────────────────────────────────────────────────────────────────────────────
 * Dominio por habilidad — cuatro estados, derivados, nunca recalculados
 * ──────────────────────────────────────────────────────────────────────────*/

/** Los cuatro estados de #280. Nombres, nunca números — mismo criterio que `Pericia`. */
export type EstadoDominio = "sin_empezar" | "practicando" | "provisional" | "dominado";

/** La clave i18n de cada estado. El texto vive en `i18n/padre/`, no aquí. */
export const CLAVE_DE_ESTADO: Readonly<Record<EstadoDominio, string>> = Object.freeze({
  sin_empezar: "padre.panel.estado.sin_empezar",
  practicando: "padre.panel.estado.practicando",
  provisional: "padre.panel.estado.provisional",
  dominado: "padre.panel.estado.dominado",
});

/** Las columnas de `skill_state` (0002) de las que se lee el estado. Nada más. */
export interface FilaSkillState {
  readonly attempts: number;
  readonly provisional_at: number | null;
  readonly mastered_at: number | null;
  readonly updated_at: number;
}

/**
 * De una fila de `skill_state` a su estado, leyendo lo que F4 ya escribió.
 *
 * El orden de las preguntas importa: `mastered_at` manda sobre
 * `provisional_at` porque la maestría en dos etapas (mc-05, D-018) dice que lo
 * provisional se CONFIRMA en el repaso espaciado — una fila con las dos fechas
 * está dominada, no a medias. Sin fila, o con fila y cero intentos, la
 * habilidad no se ha tocado: `sin_empezar`, que no es un reproche — es donde
 * empiezan todas.
 */
export function estadoDominio(fila?: FilaSkillState | null): EstadoDominio {
  if (!fila || fila.attempts === 0) return "sin_empezar";
  if (fila.mastered_at != null) return "dominado";
  if (fila.provisional_at != null) return "provisional";
  return "practicando";
}

/** Una entrada de la lista de dominio, ya ordenable y sin números de nivel. */
export interface EntradaDeDominio {
  /** El `skill_id` real (`K07`). La plantilla lo traduce a etiqueta por locale. */
  readonly habilidad: string;
  readonly estado: EstadoDominio;
  /** Sello de la última escritura de F4; 0 en una habilidad sin fila. */
  readonly actualizadoEn: number;
}

/** Qué habilidades existen para una banda. `null` = sin catálogo todavía. */
export function habilidadesDeLaBanda(banda: TemaVisual): readonly string[] | null {
  // KINDER es la única banda con catálogo de habilidades en el producto (F6).
  // El resto no se inventa: el panel muestra solo lo que tenga fila en
  // `skill_state`, y `sinDatosDeHabilidades` cubre el primer uso (#285).
  return banda === "KINDER" ? Object.keys(HABILIDADES_KINDER) : null;
}

/** El rango de cada estado para ordenar: lo más avanzado primero (#280). */
const RANGO_DE_ESTADO: Readonly<Record<EstadoDominio, number>> = Object.freeze({
  dominado: 3,
  provisional: 2,
  practicando: 1,
  sin_empezar: 0,
});

/**
 * La lista de dominio del panel.
 *
 * Orden: lo más avanzado/reciente PRIMERO, nunca empezando por lo que falta —
 * una lista que abre con catorce «sin_empezar» es un inventario de lo que el
 * niño no ha hecho, el mismo principio que F7 aplicó al resumen de misiones
 * («lista solo lo logrado») y que `mapa.ts` aplica a su tablero. El desempate
 * final por `habilidad` hace la salida determinista: dos consultas con las
 * mismas filas en otro orden dan la misma lista.
 */
export function componerDominio(
  banda: TemaVisual,
  estados: Readonly<Record<string, FilaSkillState>>,
): readonly EntradaDeDominio[] {
  const catalogo = habilidadesDeLaBanda(banda);
  const ids = catalogo ?? Object.keys(estados);
  return ids
    .map((habilidad) => {
      const fila = estados[habilidad];
      return {
        habilidad,
        estado: estadoDominio(fila),
        actualizadoEn: fila?.updated_at ?? 0,
      };
    })
    .sort(
      (a, b) =>
        RANGO_DE_ESTADO[b.estado] - RANGO_DE_ESTADO[a.estado] ||
        b.actualizadoEn - a.actualizadoEn ||
        (a.habilidad < b.habilidad ? -1 : a.habilidad > b.habilidad ? 1 : 0),
    );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Notas del sistema (#283) — las dos causas cerradas de la 0018
 * ──────────────────────────────────────────────────────────────────────────*/

/** El enum cerrado de `child_diagnostic_notes.cause_code` (migración 0018). */
export const CAUSAS_DE_NOTA = ["HABILIDAD_PAUSADA_LATERAL", "PATRON_INUSUAL_PARA_EDAD"] as const;
export type CausaDeNota = (typeof CAUSAS_DE_NOTA)[number];

export function esCausaDeNota(valor: string): valor is CausaDeNota {
  return (CAUSAS_DE_NOTA as readonly string[]).includes(valor);
}

/** La clave i18n de la plantilla de cada causa. El texto es de Larry (#283). */
export function claveDeNota(causa: CausaDeNota): string {
  return `padre.nota.${causa}`;
}

export interface FilaNota {
  readonly id: string;
  readonly cause_code: string;
  readonly skill_id: string | null;
  readonly created_at: number;
  readonly seen_at: number | null;
}

export interface NotaDeDiagnostico {
  readonly causa: CausaDeNota;
  readonly habilidad: string | null;
  readonly creadaEn: number;
  readonly vistaEn: number | null;
}

/**
 * Las notas, más reciente primero. Una fila con una causa que el motor no
 * conoce —escrita por otra vía, contra el CHECK— se DESCARTA en vez de
 * mostrar su clave cruda al padre (la trampa de #349, una pantalla que
 * imprime identificadores). El CHECK de la 0018 hace esto imposible por la
 * vía normal; esto es la segunda cerradura.
 */
export function componerNotas(filas: readonly FilaNota[]): readonly NotaDeDiagnostico[] {
  return filas
    .filter((f) => esCausaDeNota(f.cause_code))
    .map((f) => ({
      causa: f.cause_code as CausaDeNota,
      habilidad: f.skill_id,
      creadaEn: f.created_at,
      vistaEn: f.seen_at,
    }))
    .sort((a, b) => b.creadaEn - a.creadaEn);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Pantalla — la tendencia de 8 semanas (#282), agregada, nunca recalculada
 * ──────────────────────────────────────────────────────────────────────────*/

/** Las tres formas de una semana. Se leen en escala de grises (WCAG 1.4.1). */
export type EstadoDeSemana = "sin_uso" | "completa" | "por_limite";

export interface SemanaDePantalla {
  /** El primer día local de la semana (el más viejo del tramo de 7). */
  readonly desde: DiaLocal;
  readonly minutos: number;
  readonly estado: EstadoDeSemana;
}

export interface FilaDeUso {
  readonly local_date: DiaLocal;
  readonly minutes_used: number;
  readonly ended_reason: string | null;
}

/** Cuántas semanas ve el panel. Decisión de diseño de `f8-padres.md` §6. */
export const SEMANAS_DE_TENDENCIA = 8;

/**
 * Las últimas 8 semanas de pantalla, agregadas por tramo de 7 días hacia
 * atrás desde `diaHoy` — siempre las 8 más recientes, sin filtro de rango
 * (#282: no hay dato más fino al que hacer zoom, y no hay librería de
 * gráficas).
 *
 * Los tres estados se distinguen por ESTRUCTURA, no por color: «sin_uso» es
 * una semana sin minutos; «por_limite» es una semana donde al menos un día
 * terminó por un corte que el propio padre configuró (`DAILY_LIMIT` o
 * `BEDTIME` — los dos son suyos, y ninguno es una falla del niño: la racha de
 * ese día cuenta igual, línea roja #6 hecha visible por #282); «completa» es
 * jugó y no lo cortó nada.
 */
export function tendenciaDe8Semanas(
  dias: readonly FilaDeUso[],
  diaHoy: DiaLocal,
): readonly SemanaDePantalla[] {
  const semanas: SemanaDePantalla[] = [];
  for (let s = SEMANAS_DE_TENDENCIA - 1; s >= 0; s--) {
    const hasta = sumarDias(diaHoy, -7 * s);
    const desde = sumarDias(hasta, -6);
    let minutos = 0;
    let cortada = false;
    for (const d of dias) {
      const distancia = diasEntre(d.local_date, diaHoy);
      if (distancia < 7 * s || distancia > 7 * s + 6) continue;
      minutos += d.minutes_used;
      if (d.ended_reason !== null) cortada = true;
    }
    semanas.push({
      desde,
      minutos,
      estado: minutos === 0 ? "sin_uso" : cortada ? "por_limite" : "completa",
    });
  }
  return semanas;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Cosméticos — el roadmap del padre (#284), leído, nunca duplicado
 * ──────────────────────────────────────────────────────────────────────────*/

export interface FilaDeCosmetico {
  readonly cosmetic_id: string;
  /** Clave i18n de la condición, para el padre. NULL en piezas iniciales. */
  readonly condicion_clave: string | null;
  readonly arte_silueta_url: string | null;
  readonly es_inicial: 0 | 1;
  readonly unlocked_at: number | null;
}

export interface EntradaDeRoadmap {
  readonly cosmeticoId: string;
  readonly condicionClave: string | null;
  readonly siluetaUrl: string | null;
  readonly desbloqueado: boolean;
}

/**
 * El roadmap tal cual sale del catálogo de F7 (0015), sin duplicar reglas:
 * `desbloqueado` es la pieza inicial (la trae puesta todo perfil) o la fila de
 * `child_cosmetics_unlocked`. La condición viaja como CLAVE i18n — la fórmula
 * cruda (`skill_state.mastered_at IS NOT NULL`) no es texto de cara al padre
 * (#284), y el texto autorado ya vive en `i18n/cosmeticos/`.
 */
export function componerRoadmap(filas: readonly FilaDeCosmetico[]): readonly EntradaDeRoadmap[] {
  return filas.map((f) => ({
    cosmeticoId: f.cosmetic_id,
    condicionClave: f.condicion_clave,
    siluetaUrl: f.arte_silueta_url,
    desbloqueado: f.es_inicial === 1 || f.unlocked_at !== null,
  }));
}

/* ────────────────────────────────────────────────────────────────────────────
 * La composición entera
 * ──────────────────────────────────────────────────────────────────────────*/

/** `child_streak` tal cual la escribe F7 (0007/0008/0013). El panel no recalcula. */
export interface FilaRacha {
  readonly current_streak: number;
  readonly max_streak: number;
  readonly shields_available: number;
  readonly pause_until_local_date: string | null;
}

/** `score_totals` (0002): puntos del tablero global. NO son XP (D-055). */
export interface FilaPuntos {
  readonly period: string;
  readonly theme_band: string;
  readonly total_score: number;
}

/** Lo que la ruta leyó de D1. Cada campo es la fila cruda de su dueño. */
export interface FilasCrudasDeD1 {
  readonly hijoId: string;
  readonly banda: TemaVisual;
  /** `skill_id` → fila de `skill_state`. Vacío = perfil sin tocar (F4 futuro). */
  readonly estados: Readonly<Record<string, FilaSkillState>>;
  readonly racha: FilaRacha | null;
  /** `xp_totals.total_xp`, o `null` si el niño nunca sumó. */
  readonly xpTotal: number | null;
  readonly puntos: readonly FilaPuntos[];
  /**
   * La cohorte de la membresía vigente del niño y el id de SU membresía, o
   * `null` cuando no hay consentimiento `LEADERBOARD` vigente (D-040) o no
   * hay membresía: la sección desaparece, nunca muestra un ranking inferido.
   */
  readonly liga: { readonly miembros: readonly Membresia[]; readonly membresiaPropiaId: string } | null;
  readonly notas: readonly FilaNota[];
  readonly pantalla: {
    readonly hoyMinutos: number;
    readonly terminoPorLimiteHoy: boolean;
    readonly dias: readonly FilaDeUso[];
  };
  readonly cosmeticos: readonly FilaDeCosmetico[];
  /** El día local del hogar. Lo decide el llamador, nunca este módulo. */
  readonly diaHoy: DiaLocal;
}

export interface DiagnosticoDeHijo {
  readonly hijoId: string;
  /**
   * `true` cuando el niño no tiene NI UNA fila en `skill_state`: el panel
   * muestra el estado de primer uso («apenas empezando»), no una lista de
   * catorce «sin_empezar» que se lee como acusación (#285).
   */
  readonly sinDatosDeHabilidades: boolean;
  readonly dominio: readonly EntradaDeDominio[];
  readonly racha: {
    readonly actual: number;
    readonly maxima: number;
    readonly escudosDisponibles: number;
    readonly pausaHasta: string | null;
  };
  readonly xp: { readonly total: number; readonly rango: number };
  readonly puntos: readonly FilaPuntos[];
  /** `null` = sin consentimiento LEADERBOARD o sin membresía. Se omite la sección. */
  readonly liga: {
    readonly posicion: number;
    readonly total: number;
    readonly puntosSemana: number;
  } | null;
  readonly notas: readonly NotaDeDiagnostico[];
  readonly pantalla: {
    readonly hoyMinutos: number;
    readonly terminoPorLimiteHoy: boolean;
    readonly tendencia: readonly SemanaDePantalla[];
  };
  readonly cosmeticos: readonly EntradaDeRoadmap[];
}

/**
 * Compone el diagnóstico. Pura: mismas filas, mismo diagnóstico.
 *
 * Lo único «calculado» aquí es lo que los dueños de cada número ya delegaron
 * en funciones públicas: `rangoDeXp()` (F7) y `ordenar()` (F7). Si la
 * membresía propia no está entre los miembros leídos —un dato roto, no un
 * caso de uso— la sección de liga se omite igual que si no hubiera
 * consentimiento: el panel nunca muestra una posición que no pudo derivar.
 */
export function componerDiagnostico(filas: FilasCrudasDeD1): DiagnosticoDeHijo {
  let liga: DiagnosticoDeHijo["liga"] = null;
  if (filas.liga !== null) {
    const ordenadas = ordenar(filas.liga.miembros);
    const indice = ordenadas.findIndex((m) => m.id === filas.liga!.membresiaPropiaId);
    if (indice >= 0) {
      liga = {
        posicion: indice + 1,
        total: ordenadas.length,
        puntosSemana: ordenadas[indice].points_this_week,
      };
    }
  }

  return {
    hijoId: filas.hijoId,
    sinDatosDeHabilidades: Object.keys(filas.estados).length === 0,
    dominio: componerDominio(filas.banda, filas.estados),
    racha: {
      actual: filas.racha?.current_streak ?? 0,
      maxima: filas.racha?.max_streak ?? 0,
      escudosDisponibles: filas.racha?.shields_available ?? 0,
      pausaHasta: filas.racha?.pause_until_local_date ?? null,
    },
    xp: { total: filas.xpTotal ?? 0, rango: rangoDeXp(filas.xpTotal ?? 0) },
    puntos: filas.puntos,
    liga,
    notas: componerNotas(filas.notas),
    pantalla: {
      hoyMinutos: filas.pantalla.hoyMinutos,
      terminoPorLimiteHoy: filas.pantalla.terminoPorLimiteHoy,
      tendencia: tendenciaDe8Semanas(filas.pantalla.dias, filas.diaHoy),
    },
    cosmeticos: componerRoadmap(filas.cosmeticos),
  };
}
