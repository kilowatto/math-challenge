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
 *
 * ─── Las dos extensiones de F7, y por qué NO contradicen D-047 ─────────────
 *
 *  · **#198 — el XP se acredita completo.** D-047 reserva el PUNTAJE porque sin
 *    servidor no hay reloj confiable para `d − RT`. Esa preocupación no aplica
 *    al XP por dos razones escritas en `xp.ts`: el XP **nunca usa `rtMs`** (no
 *    hay reloj que verificar, en ninguna banda) y el XP **no es competitivo**
 *    (no hay «puntaje no verificable compitiendo contra uno verificado», porque
 *    el XP no ordena a nadie). Divergencia deliberada de D-047, no un descuido.
 *  · **#209 — los días de vuelo cuentan para la racha.** Son dos preguntas
 *    distintas: «¿puntaje confiable para competir?» (no — D-047 intacta:
 *    `soloPrecision` y `fueraDelTablero` no cambian) contra «¿el niño practicó
 *    ese día?» (sí, y eso es lo único que la racha mide). La racha no es un
 *    ranking, así que D-025 no aplica, y confiar en el reloj del dispositivo
 *    para el DÍA —que D-047 rechaza para puntuar— es seguro aquí.
 */

import type { Banda } from "./puntuacion.ts";
import { calificar, type Veredicto } from "./puntuacion.ts";
import { xpDeItem } from "./xp.ts";
import { registrarDia, type EstadoRacha } from "./racha.ts";
import { diaEfectivo, type DiaLocal } from "./tiempo-local.ts";

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
  /**
   * Reloj del dispositivo al contestar. Sirve para ordenar y para el día de la
   * racha (#209), no para puntuar.
   */
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
  /**
   * El XP del intento, COMPLETO: `xpDeItem(nivel, acc)` sin descuento ni marca
   * de «no verificado» (#198). Divergencia deliberada de D-047 — ver la
   * cabecera del archivo: el XP no usa `rtMs` (no hay reloj que verificar) y
   * no es competitivo (no hay «puntaje no verificable compitiendo contra uno
   * verificado»). Reusa `nivel` y `acc`, que ya viajan en la cola: ningún
   * campo nuevo, ningún byte nuevo en el paquete de vuelo.
   */
  xp: number;
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
    // #198: XP completo. D-047 reserva el puntaje porque no hay reloj confiable
    // para `d − RT`; el XP no usa `rtMs` en ninguna banda (D-055) y no ordena a
    // nadie contra nadie, así que no hay nada que reservar. `xpDeItem` nunca
    // devuelve un negativo: fallar acredita 0, no −N.
    xp: xpDeItem(intento.nivel, acc),
  };
}

/**
 * Un reto entero de la cola, sincronizado: puntaje recalculado, XP completo y
 * —si el reto se cerró— el día contado para la racha (#198, #209).
 *
 * Un «reto» es un grupo de intentos de la cola con la misma `sesionId`; **quién
 * decide que se cerró es quien llama** (`completo`), porque la cola guarda
 * intentos, no cierres. Los ítems sueltos sin reto cerrado acreditan su XP por
 * ítem (#198) pero NO cuentan un día (#209: la racha mide «¿practicó ese día?»
 * y la unidad de práctica es el reto).
 *
 * El día se deriva del `contestadoEn` MÁS TARDE del grupo — el instante en que
 * el reto se completó según el reloj del dispositivo — convertido con la zona
 * del HOGAR (`users.timezone` del padre), que llega como parámetro: jamás se lee
 * del aparato. D-047 rechaza ese reloj para PUNTUAR y aquí no puntúa: decide
 * qué día de calendario practicó el niño, y la racha no es un ranking (D-025 no
 * aplica). El `motivo` no entra en la aritmética de `registrarDia` — línea roja
 * #6: ninguna rama de este archivo trata distinto un día offline.
 *
 * Si la cola entrega días fuera de orden (el martes después del miércoles),
 * `registrarDia` ya lo resuelve: el día viejo es un no-op (`docs/dudas.md`
 * §22.3). La comparación por referencia de siempre decide si hay algo que
 * escribir: sin reto cerrado, o con el día ya contado, `racha` sale siendo el
 * MISMO objeto que entró.
 *
 * @throws RangeError si `completo` es `true` y el grupo está vacío — un reto
 *   cerrado sin ítems es un error de quien llama, no un día gratis.
 */
export function sincronizarReto(
  intentos: readonly IntentoEnCola[],
  esCorrecta: (intento: IntentoEnCola) => boolean,
  completo: boolean,
  zonaIana: string,
  racha: EstadoRacha,
): {
  /** Un resultado por intento, en el orden en que llegaron. */
  resultados: ResultadoSincronizado[];
  /** La suma del XP de los intentos. Nunca negativo (D-055). */
  xp: number;
  /** La racha tras contar el día del reto, o el MISMO objeto si nada cambió. */
  racha: EstadoRacha;
  /** El día que contó, o `null` si el reto no estaba cerrado. */
  diaContado: DiaLocal | null;
} {
  if (completo && intentos.length === 0) {
    throw new RangeError(
      "reto completo sin intentos: la cola entregó un cierre sin trabajo debajo. " +
        "Eso es un error de quien llama, no un día practicado.",
    );
  }

  const resultados = intentos.map((i) => sincronizar(i, () => esCorrecta(i)));
  let xp = 0;
  for (const r of resultados) xp += r.xp;

  if (!completo) return { resultados, xp, racha, diaContado: null };

  let cerradoEn = intentos[0].contestadoEn;
  for (const i of intentos) if (i.contestadoEn > cerradoEn) cerradoEn = i.contestadoEn;

  const dia = diaEfectivo(cerradoEn, zonaIana);
  return {
    resultados,
    xp,
    racha: registrarDia(racha, dia, { tipo: "RETO_COMPLETADO" }),
    diaContado: dia,
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
