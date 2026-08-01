/**
 * El motor de puntuación. Uno solo (D-010, D-024).
 *
 * Es un módulo PURO a propósito: entra un intento, sale un puntaje, y no toca la
 * red, ni el reloj, ni la base. Tres razones, y ninguna es estética.
 *
 *  1. **Se puede probar sin infraestructura.** La fórmula de D-010 es aritmética
 *     con un signo que decide si sumas o restas; equivocarlo no rompe nada, solo
 *     produce un tablero injusto. Eso solo se atrapa con casos.
 *  2. **No puede leer el reloj, así que no puede confiar en el del cliente.** La
 *     única forma de que este módulo sepa cuánto tardó alguien es que se lo
 *     pasen ya medido. Quien lo llame decide de dónde sale ese número, y el
 *     servidor lo mide con dos sellos suyos.
 *  3. **Hay UN lugar donde vive la fórmula.** `audits/motor-puntuacion.mjs`
 *     bloquea el commit si aparece un segundo. Dos motores dan dos números para
 *     el mismo intento, y el tablero de D-025 los compara creyendo que son lo
 *     mismo.
 */

/** Las seis bandas de D-017. `KINDER` no es una banda más: tiene su propia regla. */
export type Banda = "KINDER" | "PRIMARIA" | "SECUNDARIA" | "SERIO" | "JR" | "PRO";

/**
 * Los parámetros por banda, tal como los fija la tabla de D-010.
 *
 * `d` es el tiempo permitido en segundos y `a` el peso de la velocidad. KINDER
 * no aparece: no es que tenga `a = 0`, es que la fórmula no se le aplica.
 *
 * Por qué eso importa y no es un detalle de tipos: D-010 declaraba originalmente
 * "una sola fórmula para las seis bandas" con `a = 0` en kinder. Pero
 * `a · (d − RT) · (2·acc − 1)` con `a = 0` da **cero para toda respuesta**,
 * correcta o incorrecta. No era que kinder puntuara sin cronometrar: es que
 * kinder no puntuaba. D-024 lo corrigió, y dejar a KINDER fuera de este objeto
 * hace que el error no se pueda volver a escribir — no hay parámetros que
 * pasarle.
 */
export const PARAMETROS: Record<Exclude<Banda, "KINDER">, { d: number; a: number }> = {
  PRIMARIA:   { d: 60, a: 0.3 },
  SECUNDARIA: { d: 45, a: 0.5 },
  SERIO:      { d: 40, a: 0.6 },
  JR:         { d: 30, a: 0.8 },
  PRO:        { d: 20, a: 1.0 },
};

/**
 * El valor de un ítem por su nivel: `10 × 1.6^(nivel−1)` (D-010).
 *
 * Crece exponencialmente a propósito. Un ítem de nivel 8 vale ~268 puntos,
 * comparable a treinta sumas de nivel 1 — así ninguna estrategia domina el
 * tablero, ni la de moler ejercicios fáciles ni la de intentar solo los difíciles
 * (mc-13, mc-18).
 */
export function valorDelItem(nivel: number): number {
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > 10) {
    throw new RangeError(`nivel fuera de la escalera de D-017: ${nivel} (se esperaba 1..10)`);
  }
  return 10 * Math.pow(1.6, nivel - 1);
}

export interface Intento {
  banda: Banda;
  /** 1 a 10, la escalera de D-017. */
  nivel: number;
  /** 1 o 0. Nunca un parcial: D-048 hace que varias respuestas valgan 1, no 0.5. */
  acc: 0 | 1;
  /**
   * Milisegundos entre que el servidor sirvió el ítem y recibió la respuesta.
   *
   * **Opcional, y su ausencia es el contrato con kinder.** Para KINDER esta
   * propiedad no debe venir: si viene, se lanza. No es paranoia — es la única
   * forma de que "el puntaje de kinder no ve el tiempo" sea comprobable en vez
   * de ser una promesa en un comentario (D-024, D-045).
   */
  rtMs?: number;
}

export interface Veredicto {
  puntos: number;
  /** La regla aplicada, para que el registro diga por qué salió ese número. */
  regla: "kinder-precision" | "hshs";
  /** Los ingredientes, para poder recalcular a mano sin adivinar. */
  detalle: { valor: number; acc: 0 | 1; d?: number; a?: number; rtSeg?: number };
}

/**
 * Califica un intento.
 *
 * De primaria a Pro:  `score = a · (d − RT) · (2·acc − 1)`   (D-010)
 * En kinder:          `score = valor_del_ítem · acc`          (D-024)
 *
 * El `(2·acc − 1)` es lo que hace que la fórmula no necesite reglas aparte
 * contra el adivinar: vale −1 al fallar, así que **fallar rápido resta más que
 * fallar lento**. El castigo está en la aritmética, no en una excepción que
 * alguien pueda olvidar de portar.
 */
export function calificar(intento: Intento): Veredicto {
  const { banda, nivel, acc } = intento;

  if (acc !== 0 && acc !== 1) {
    throw new TypeError(`acc es 1 o 0, nunca un parcial: recibido ${acc} (D-010, D-048)`);
  }

  const valor = valorDelItem(nivel);

  if (banda === "KINDER") {
    // La firma lo permite, así que hay que rechazarlo aquí. Un `rtMs` que llega
    // a kinder y se ignora en silencio es indistinguible de uno que se usa: el
    // día que alguien "optimice" esta función, lo usaría.
    if (intento.rtMs !== undefined) {
      throw new TypeError(
        "el puntaje de kinder no recibe tiempo (D-024, D-045). Medirlo está permitido " +
          "y guardarlo también; lo que no puede es llegar hasta aquí.",
      );
    }
    return {
      puntos: valor * acc,
      regla: "kinder-precision",
      detalle: { valor, acc },
    };
  }

  const { d, a } = PARAMETROS[banda];

  if (intento.rtMs === undefined) {
    throw new TypeError(
      `la banda ${banda} puntúa con tiempo y no llegó rtMs. El servidor lo mide con dos ` +
        "sellos suyos; si falta, no se inventa un valor por omisión — se falla.",
    );
  }
  if (!Number.isFinite(intento.rtMs) || intento.rtMs < 0) {
    throw new RangeError(`rtMs inválido: ${intento.rtMs}`);
  }

  // El tiempo se acota a `d`. Sin este tope, tardar más que el permitido invierte
  // el signo: `(d − RT)` se vuelve negativo y una respuesta CORRECTA restaría
  // puntos. Un niño que contesta bien después de pensarlo mucho no puede acabar
  // con menos puntos que si no hubiera contestado.
  const rtSeg = Math.min(intento.rtMs / 1000, d);

  const puntos = a * (d - rtSeg) * (2 * acc - 1);

  return {
    puntos,
    regla: "hshs",
    detalle: { valor, acc, d, a, rtSeg },
  };
}

/**
 * El piso de tiempo de respuesta: por debajo de esto, nadie leyó el problema.
 *
 * **Es solo bitácora, jamás castigo ni mensaje al niño** (`mc-29` impl. 3, y la
 * línea roja de no avergonzar). Devuelve una marca para el registro; quien la
 * reciba puede investigar patrones, no puede restar puntos ni decirle nada al
 * alumno. Un niño rápido de verdad existe, y acusarlo es peor que dejar pasar a
 * un tramposo.
 */
export const PISO_MS = 300;

export function pareceImposible(rtMs: number | undefined): boolean {
  return rtMs !== undefined && rtMs < PISO_MS;
}
