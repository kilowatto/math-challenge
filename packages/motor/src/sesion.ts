/**
 * La sesión de reto. Es del servidor, y por eso vive en un Durable Object.
 *
 * Tres propiedades que el criterio de F3 pide por separado y que en realidad son
 * la misma cosa vista desde tres lados:
 *
 *  1. **El servidor cronometra con dos sellos suyos** (#32). El reloj del ítem
 *     servido y el de la respuesta recibida los pone este objeto. El cliente
 *     nunca manda un tiempo; si lo mandara, no habría dónde ponerlo.
 *  2. **Es idempotente por `(sesión, orden)`** (#33). Reenviar la misma
 *     respuesta no vuelve a puntuar. Sin esto, una conexión mala en un metro
 *     —que es el escenario de D-047— multiplica los puntos por el número de
 *     reintentos.
 *  3. **Expone un punto seguro de corte** (#33, D-016). El límite de pantalla
 *     nunca corta a media respuesta: pregunta si es buen momento, y este objeto
 *     sabe si hay un ítem servido esperando contestación.
 *
 * Por qué un Durable Object y no una fila. Un DO es de un solo hilo, así que dos
 * envíos simultáneos de la misma respuesta se serializan sin transacción. Eso es
 * exactamente lo que hace falta para que la idempotencia no dependa de una
 * carrera. **Uno por sesión** — `mc-32` y `audits/do-por-entidad.mjs`: un DO
 * global pondría todos los retos del producto detrás de una cola.
 */

import { calificar, type Banda, type Veredicto } from "./puntuacion.ts";

/** Lo que el servidor recuerda de un ítem mientras espera la respuesta. */
export interface ItemServido {
  orden: number;
  itemId: string;
  nivel: number;
  /** `performance.now()` del servidor al servirlo. El primero de los dos sellos. */
  servidoEn: number;
}

export interface Respuesta {
  /** Con qué ítem de la serie se corresponde. Es la mitad de la llave de idempotencia. */
  orden: number;
  /**
   * Lo que el niño eligió. **No es un puntaje ni un tiempo**: es la elección.
   *
   * `audits/puntaje-servidor.mjs` falla si un esquema de petición acepta
   * `score`, `rt` o `tiempo` — y esta interfaz es la razón por la que puede: no
   * hay dónde ponerlos.
   */
  eleccion: string;
}

export interface ResultadoDeRespuesta {
  veredicto: Veredicto;
  /** `true` si esta respuesta ya se había recibido y NO se volvió a puntuar. */
  repetida: boolean;
  /** Milisegundos entre los dos sellos del servidor. */
  rtMs: number;
}

/**
 * El estado de una sesión. Se guarda en el almacenamiento del DO.
 *
 * No lleva el identificador del niño. El DO ya es por sesión, y la sesión ya
 * pertenece a alguien: repetir aquí el perfil sería una copia más del dato que
 * D-020 y `mc-25` piden minimizar.
 */
export interface EstadoSesion {
  banda: Banda;
  /** Los ítems ya servidos y aún sin contestar, por orden. */
  pendiente: ItemServido | null;
  /** Las respuestas ya puntuadas, por orden. La llave de idempotencia. */
  puntuadas: Map<number, ResultadoDeRespuesta>;
  puntosTotales: number;
}

export function estadoInicial(banda: Banda): EstadoSesion {
  return { banda, pendiente: null, puntuadas: new Map(), puntosTotales: 0 };
}

/**
 * Sirve un ítem y pone el primer sello.
 *
 * Rechaza servir un segundo ítem con uno pendiente: serían dos relojes corriendo
 * a la vez y el segundo se contaría desde el sello del primero. En kinder daría
 * igual —no se cronometra— pero la regla se aplica a las seis bandas para que no
 * dependa de la banda.
 */
export function servir(
  estado: EstadoSesion,
  item: { orden: number; itemId: string; nivel: number },
  ahora: number,
): EstadoSesion {
  if (estado.pendiente !== null) {
    throw new Error(
      `ya hay un ítem servido sin contestar (orden ${estado.pendiente.orden}). Servir otro ` +
        "dejaría dos relojes corriendo y el segundo se mediría desde el sello del primero.",
    );
  }
  if (estado.puntuadas.has(item.orden)) {
    throw new Error(`el orden ${item.orden} ya se contestó; una serie no repite posiciones`);
  }
  return { ...estado, pendiente: { ...item, servidoEn: ahora } };
}

/**
 * Recibe una respuesta, pone el segundo sello, y califica.
 *
 * **Idempotente por `(sesión, orden)`.** La sesión es este objeto; el orden llega
 * en la respuesta. Si ese orden ya se puntuó, devuelve el mismo veredicto con
 * `repetida: true` y no toca el total. Dos envíos idénticos, un solo punto.
 */
export function responder(
  estado: EstadoSesion,
  respuesta: Respuesta,
  esCorrecta: (eleccion: string) => boolean,
  ahora: number,
): { estado: EstadoSesion; resultado: ResultadoDeRespuesta } {
  const yaPuntuada = estado.puntuadas.get(respuesta.orden);
  if (yaPuntuada) {
    // El camino de la reconexión: el cliente reintentó porque no vio la
    // confirmación, no porque quiera puntos de más. Se le devuelve lo mismo.
    return { estado, resultado: { ...yaPuntuada, repetida: true } };
  }

  const pendiente = estado.pendiente;
  if (!pendiente || pendiente.orden !== respuesta.orden) {
    throw new Error(
      `llegó una respuesta para el orden ${respuesta.orden} y ` +
        (pendiente ? `el ítem servido es el ${pendiente.orden}` : "no hay ítem servido") +
        ". El servidor no puntúa lo que no sirvió.",
    );
  }

  // Los dos sellos, los dos del servidor. El cliente no participa en esta resta.
  const rtMs = Math.max(0, ahora - pendiente.servidoEn);
  const acc: 0 | 1 = esCorrecta(respuesta.eleccion) ? 1 : 0;

  const veredicto =
    estado.banda === "KINDER"
      ? calificar({ banda: "KINDER", nivel: pendiente.nivel, acc })
      : calificar({ banda: estado.banda, nivel: pendiente.nivel, acc, rtMs });

  const resultado: ResultadoDeRespuesta = { veredicto, repetida: false, rtMs };

  const puntuadas = new Map(estado.puntuadas);
  puntuadas.set(respuesta.orden, resultado);

  return {
    estado: {
      ...estado,
      pendiente: null,
      puntuadas,
      puntosTotales: estado.puntosTotales + veredicto.puntos,
    },
    resultado,
  };
}

/**
 * ¿Es buen momento para cortar? (D-016, criterio #33)
 *
 * El límite de pantalla **nunca corta a media respuesta**. No es amabilidad: un
 * corte con un problema en la pantalla y el reloj corriendo convierte el límite
 * —que existe para proteger al niño— en un castigo por haber tardado en pensar.
 *
 * Devuelve `true` solo si no hay nada servido esperando. F8 pregunta, no impone.
 */
export function puntoSeguroDeCorte(estado: EstadoSesion): boolean {
  return estado.pendiente === null;
}

/** Cuántas respuestas van puntuadas. Para que el corte sepa dónde se quedó. */
export function progreso(estado: EstadoSesion): { contestadas: number; puntos: number } {
  return { contestadas: estado.puntuadas.size, puntos: estado.puntosTotales };
}
