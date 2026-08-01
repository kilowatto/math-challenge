/**
 * La cola sin conexión y el modo avión (D-047).
 *
 * Dos reglas que parecen detalles y son la decisión entera:
 *
 *  1. **La cola sincroniza RESPUESTAS, nunca puntajes.** Sin servidor no hay
 *     reloj confiable (`mc-33` impl. 7), así que un puntaje calculado en el
 *     avión no se puede verificar. Al reconectar, el servidor **recalcula**: la
 *     cola le dice qué eligió el niño y cuándo lo eligió según SU reloj, y el
 *     servidor decide qué vale.
 *  2. **Un intento offline en banda cronometrada puntúa solo por precisión y no
 *     cuenta para el tablero.** Nadie pierde el trabajo hecho en el metro, y un
 *     puntaje no verificable nunca compite contra uno verificado (D-047, D-025).
 *
 * **Modo avión** (enmienda de D-047, 2026-08-01): se descargan el nivel actual
 * **y el siguiente**. El caso que importa es precisamente el que un solo nivel
 * no cubre — el niño avanza durante el vuelo y se queda sin contenido a diez mil
 * metros, donde nadie puede arreglarlo.
 */

import type { Banda } from "./puntuacion.ts";
import { calificar, type Veredicto } from "./puntuacion.ts";

/**
 * Lo que la cola guarda de un intento hecho sin conexión.
 *
 * **No hay campo de puntaje, y esa ausencia es el contrato.** `audits/puntaje-servidor.mjs`
 * puede afirmar que ningún esquema de petición acepta `score` porque no hay
 * dónde ponerlo.
 */
export interface IntentoEnCola {
  sesionId: string;
  orden: number;
  itemId: string;
  nivel: number;
  banda: Banda;
  eleccion: number | string;
  /**
   * Milisegundos que el DISPOSITIVO midió. Se manda para diagnóstico, y el
   * servidor **no lo usa para puntuar**: `sincronizar` lo ignora a propósito.
   */
  rtLocalMs: number;
  /** Reloj del dispositivo al contestar. Sirve para ordenar, no para puntuar. */
  contestadoEn: number;
}

export interface ResultadoSincronizado {
  sesionId: string;
  orden: number;
  veredicto: Veredicto;
  /** Siempre `true` para lo que viene de la cola (D-047, D-025). */
  fueraDelTablero: boolean;
  /** `true` si la banda cronometra y aquí se puntuó solo por precisión. */
  soloPrecision: boolean;
}

/**
 * Recalcula en el servidor lo que llega de la cola.
 *
 * `esCorrecta` la resuelve quien llama, contra el banco de ítems. Lo que este
 * módulo garantiza es que **el tiempo local no entra en el puntaje**.
 *
 * Cómo se puntúa, y por qué así:
 *
 *  · **KINDER** — igual que en línea. Su regla ya es solo precisión (D-024), así
 *    que un intento offline de kinder vale exactamente lo mismo. No hay nada que
 *    degradar.
 *  · **Las demás bandas** — se puntúa como si el tiempo de respuesta hubiera
 *    sido el permitido completo (`rtMs = d`), lo que anula el término de
 *    velocidad y deja `a · 0 · (2·acc − 1) = 0`… y ahí está el problema: daría
 *    cero para todo. Así que se usa el valor del ítem por precisión, como
 *    kinder, y se marca `soloPrecision`.
 */
export function sincronizar(
  intento: IntentoEnCola,
  esCorrecta: (eleccion: number | string) => boolean,
): ResultadoSincronizado {
  const acc: 0 | 1 = esCorrecta(intento.eleccion) ? 1 : 0;

  // El tiempo local NUNCA se pasa al motor. Está en el tipo para diagnóstico y
  // se queda ahí: `intento.rtLocalMs` no aparece en ninguna línea de abajo.
  const veredicto = calificar({ banda: "KINDER", nivel: intento.nivel, acc });

  return {
    sesionId: intento.sesionId,
    orden: intento.orden,
    veredicto,
    fueraDelTablero: true,
    soloPrecision: intento.banda !== "KINDER",
  };
}

/**
 * Quita de la cola lo que ya se sincronizó.
 *
 * La llave es `(sesionId, orden)`, la misma que usa el Durable Object. Una cola
 * que reenvía lo ya sincronizado no rompe nada gracias a esa idempotencia, pero
 * gasta batería y datos del móvil de alguien que ya pagó por ellos.
 */
export function podar(
  cola: IntentoEnCola[],
  yaSincronizados: Set<string>,
): IntentoEnCola[] {
  return cola.filter((i) => !yaSincronizados.has(`${i.sesionId}·${i.orden}`));
}

export const llave = (i: Pick<IntentoEnCola, "sesionId" | "orden">) => `${i.sesionId}·${i.orden}`;

// ---------------------------------------------------------------------------
// Modo avión
// ---------------------------------------------------------------------------

export interface PaqueteDeVuelo {
  niveles: number[];
  itemIds: string[];
  audioIds: string[];
  /** Bytes estimados, para poder decírselo al padre ANTES de descargar. */
  bytes: number;
}

/** Tope de audio en la primera instalación (`mc-42`). El vuelo va aparte y se suma. */
export const TOPE_AUDIO_BYTES = 5 * 1024 * 1024;

/**
 * Arma el paquete de vuelo: **el nivel actual y el siguiente** (D-047 enmendada).
 *
 * Si el audio de los dos niveles no cabe en el presupuesto, se baja el audio del
 * nivel siguiente y **se conserva su contenido**: un niño que avanza en el vuelo
 * prefiere seguir jugando sin voz a quedarse sin retos. Lo que nunca se recorta
 * son los ítems del nivel en el que va.
 */
export function armarPaqueteDeVuelo(
  nivelActual: number,
  catalogo: {
    itemsPorNivel: Record<number, string[]>;
    audioPorNivel: Record<number, string[]>;
    bytesPorItem: number;
    bytesPorAudio: number;
  },
  topeAudio = TOPE_AUDIO_BYTES,
): PaqueteDeVuelo {
  const siguiente = Math.min(nivelActual + 1, 12);
  const niveles = siguiente === nivelActual ? [nivelActual] : [nivelActual, siguiente];

  const itemIds = niveles.flatMap((n) => catalogo.itemsPorNivel[n] ?? []);

  const audioActual = catalogo.audioPorNivel[nivelActual] ?? [];
  const audioSiguiente = niveles.length > 1 ? (catalogo.audioPorNivel[siguiente] ?? []) : [];

  // El audio se comparte entre niveles siempre que se pueda: un `Set` porque el
  // mismo clip de "muy bien" sirve en los dos.
  let audioIds = [...new Set([...audioActual, ...audioSiguiente])];
  if (audioIds.length * catalogo.bytesPorAudio > topeAudio) {
    // No cabe: se conserva el contenido de los dos niveles y se recorta el audio
    // del siguiente, nunca los ítems.
    audioIds = [...new Set(audioActual)];
  }

  return {
    niveles,
    itemIds,
    audioIds,
    bytes: itemIds.length * catalogo.bytesPorItem + audioIds.length * catalogo.bytesPorAudio,
  };
}
