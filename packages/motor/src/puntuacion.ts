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
export const NIVEL_MAXIMO = 12;

export function valorDelItem(nivel: number): number {
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > NIVEL_MAXIMO) {
    throw new RangeError(
      `nivel fuera de la escalera de D-017: ${nivel} (se esperaba 1..${NIVEL_MAXIMO})`,
    );
  }
  return 10 * Math.pow(1.6, nivel - 1);
}

/**
 * Qué niveles cubre cada banda, según D-017.
 *
 * **Los rangos se traslapan a propósito**: un niño de 7 años puede estar en N3
 * igual que uno de 6. La banda es el TEMA VISUAL, el nivel es la dificultad, y
 * D-017 los mueve por separado para que las fracciones —que se introducen entre
 * los 6 y los 9 años según el país (`mc-15`)— no obliguen a llamar «tercero de
 * primaria» a un nivel.
 *
 * `audits/tabla-bandas.mjs` cruza esta constante contra la tabla de D-010 y la de
 * D-017 en `docs/decisions.md`, con el mismo patrón que `citas.mjs`: la fuente es
 * el documento, y el código tiene que coincidir. Existe porque esa tabla YA se
 * desincronizó una vez — un niño de 7 años caía en dos bandas distintas según
 * qué documento se leyera.
 */
export const NIVELES_POR_BANDA: Record<Banda, { min: number; max: number }> = {
  KINDER:     { min: 1,  max: 3 },
  PRIMARIA:   { min: 3,  max: 6 },
  SECUNDARIA: { min: 6,  max: 8 },
  SERIO:      { min: 8,  max: 10 },
  JR:         { min: 11, max: 12 },
  PRO:        { min: 11, max: 12 },
};

/**
 * Un intento. **Son dos tipos, no uno con un campo opcional.**
 *
 * Esa es la parte importante y no es preferencia de estilo. Con
 * `rtMs?: number` en un solo tipo, escribir
 *
 *     calificar({ banda: "KINDER", nivel: 1, acc: 1, rtMs: 5000 })
 *
 * compila perfectamente y falla en tiempo de ejecución — o peor, no falla:
 * alguien "optimiza" la función un martes, quita la guarda porque parece
 * defensiva, y el tiempo entra al puntaje de kinder sin que ninguna prueba de
 * tipos se entere.
 *
 * Con la unión, esa línea **no compila**: `IntentoKinder` no tiene `rtMs`. La
 * regla de D-024 y D-045 deja de depender de que alguien recuerde por qué había
 * un `throw` ahí.
 */
export interface IntentoKinder {
  banda: "KINDER";
  /** 1 a 12, la escalera de D-017. Kinder vive en N1–N3. */
  nivel: number;
  /** 1 o 0. Nunca un parcial: D-048 hace que varias respuestas valgan 1, no 0.5. */
  acc: 0 | 1;
}

export interface IntentoCronometrado {
  banda: Exclude<Banda, "KINDER">;
  nivel: number;
  acc: 0 | 1;
  /** Milisegundos entre que el servidor sirvió el ítem y recibió la respuesta. */
  rtMs: number;
}

export type Intento = IntentoKinder | IntentoCronometrado;

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
  const { nivel, acc } = intento;

  if (acc !== 0 && acc !== 1) {
    throw new TypeError(`acc es 1 o 0, nunca un parcial: recibido ${acc} (D-010, D-048)`);
  }

  const valor = valorDelItem(nivel);

  if (intento.banda === "KINDER") {
    // La unión ya impide escribirlo en TypeScript. Esta guarda es para quien
    // llegue desde JavaScript sin tipos —un worker, una prueba, un JSON de la
    // cola offline— porque ahí el compilador no está mirando.
    if ("rtMs" in intento) {
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

  const { d, a } = PARAMETROS[intento.banda];

  if (intento.rtMs === undefined) {
    throw new TypeError(
      `la banda ${intento.banda} puntúa con tiempo y no llegó rtMs. El servidor lo mide con ` +
        "dos sellos suyos; si falta, no se inventa un valor por omisión — se falla.",
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

  // ── El peso por dificultad, que faltaba (bug #189) ────────────────────────
  //
  // `valor` se calculaba y **solo llegaba a `detalle` como metadato**: nunca
  // multiplicaba. El resultado es que un ítem de nivel 12 valía exactamente lo
  // mismo que uno de nivel 1, y por tanto **moler nivel 1 era estrictamente
  // dominante** — más ítems por minuto, mismos puntos por ítem.
  //
  // D-010 lo prohíbe con esas palabras: «Un problema de nivel 8 vale ~268
  // puntos, comparable a 30 sumas de nivel 1. **Ninguna estrategia domina el
  // tablero.**» Y la proporción confirma la lectura: `1.6^7 = 26.8`, que es
  // exactamente ese «comparable a 30».
  //
  // Se normaliza contra el nivel 1 en vez de multiplicar por `valor` a secas.
  // D-010 fija la PROPORCIÓN y no dice nada de la escala absoluta; con `valor`
  // crudo, un acierto rápido de nivel 8 daría ~4,000 puntos contra los ~15 de
  // hoy, o sea un cambio de escala de 268× que nadie decidió. Normalizado, la
  // proporción es la que D-010 pide y la escala de HSHS se queda donde estaba.
  //
  // KINDER no cambia: ahí `valor * acc` ya usaba el peso, y sus ítems viven en
  // los niveles 1-3 (D-017), así que la escala nunca se disparó.
  const pesoDificultad = valor / valorDelItem(1);

  const puntos = pesoDificultad * a * (d - rtSeg) * (2 * acc - 1);

  return {
    puntos,
    regla: "hshs",
    detalle: { valor, acc, d, a, rtSeg, pesoDificultad },
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
