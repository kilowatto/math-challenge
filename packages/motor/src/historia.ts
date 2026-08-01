/**
 * El reto HISTORIA: una máquina de tres fases que **no deja saltarse la síntesis**.
 *
 * Es la lección japonesa de resolución estructurada de problemas (`mc-01`), y las
 * tres fases no son decoración:
 *
 *  1. **Exploración** — el niño se encuentra el problema **antes** de que nadie
 *     le enseñe un método, e inventa el suyo. Es lo contrario de la secuencia de
 *     EE. UU. y Alemania, donde el profesor enseña primero y luego se practica.
 *     El estudio de vídeo de TIMSS midió la diferencia: Japón dedica el 44% del
 *     tiempo a inventar soluciones nuevas contra el 90-96% de práctica de
 *     procedimientos rutinarios de los otros dos.
 *  2. **Práctica** — la serie, con su intercalado y su variación.
 *  3. **Síntesis** (*matome*, precedida de *neriage*) — se comparan los métodos
 *     que salieron y se **nombra la idea matemática** que la lección enseñaba.
 *
 * **Y la tercera es la que este archivo existe para proteger.** `mc-01` §2 la
 * señala como donde la lección consolida lo aprendido, y el criterio #48 de F3
 * dice, con todas sus letras, que es **la fase más fácil de recortar al
 * implementarla**: es la menos vistosa, la que no tiene interacción llamativa, y
 * la primera que se cae cuando hay prisa o cuando el niño quiere seguir jugando.
 *
 * Así que no se puede saltar. No es una advertencia en un comentario: `avanzar`
 * lanza si se intenta ir de práctica a terminado, y no existe ninguna transición
 * que lo permita.
 */

export type Fase = "exploracion" | "practica" | "sintesis" | "terminado";

/** El orden es el de la lección, y no hay atajos. */
export const ORDEN: Fase[] = ["exploracion", "practica", "sintesis", "terminado"];

export interface EstadoHistoria {
  fase: Fase;
  /** El lugar de la Sabana, uno por habilidad de kinder (D-019). */
  lugar: string;
  /**
   * Los métodos que salieron en la exploración.
   *
   * **No es texto libre del niño** (línea roja #3): son identificadores de
   * métodos que el ítem tiene autorados, elegidos tocando. «Conté con los
   * dedos» es una opción del autor, no algo que el niño escriba.
   */
  metodosVistos: string[];
  /** La idea que la síntesis nombró. `null` mientras no se haya llegado. */
  ideaNombrada: string | null;
}

export function iniciarHistoria(lugar: string): EstadoHistoria {
  return { fase: "exploracion", lugar, metodosVistos: [], ideaNombrada: null };
}

/**
 * Avanza a la siguiente fase. **Solo a la siguiente.**
 *
 * Rechaza cualquier salto, y rechaza en particular el que importa: de práctica a
 * terminado. Si alguien necesita esa transición algún día, tendrá que borrar
 * esta comprobación y explicar por qué en el commit — que es exactamente el
 * trámite que una fase fácil de recortar necesita.
 */
export function avanzar(estado: EstadoHistoria, aFase: Fase): EstadoHistoria {
  const desde = ORDEN.indexOf(estado.fase);
  const hacia = ORDEN.indexOf(aFase);

  if (hacia === -1) throw new Error(`fase desconocida: ${aFase}`);
  if (hacia <= desde) {
    throw new Error(`no se puede volver de ${estado.fase} a ${aFase}: la historia va hacia adelante`);
  }
  if (hacia !== desde + 1) {
    const saltadas = ORDEN.slice(desde + 1, hacia);
    throw new Error(
      `de ${estado.fase} a ${aFase} se salta ${saltadas.join(", ")}. ` +
        (saltadas.includes("sintesis")
          ? "La síntesis (matome) es donde la lección consolida lo aprendido (mc-01 §2), y es " +
            "la fase más fácil de recortar: la menos vistosa y la primera que se cae con prisa."
          : "La historia pasa por sus tres fases."),
    );
  }

  // No se sale de la síntesis sin haber nombrado la idea. Llegar a la fase y
  // pasar de largo sería saltársela con más pasos.
  if (estado.fase === "sintesis" && !estado.ideaNombrada) {
    throw new Error(
      "no se puede terminar la síntesis sin nombrar la idea. Comparar métodos y no decir qué " +
        "se aprendió es hacer la fase sin hacerla (mc-01 §2, neriage → matome).",
    );
  }

  return { ...estado, fase: aFase };
}

/**
 * Registra un método que salió en la exploración.
 *
 * `metodoId` es un identificador autorado en el ítem, **nunca texto del niño**
 * (línea roja #3). Los métodos repetidos no se duplican: comparar dos veces el
 * mismo no compara nada.
 */
export function registrarMetodo(estado: EstadoHistoria, metodoId: string): EstadoHistoria {
  if (estado.fase !== "exploracion") {
    throw new Error(`los métodos se recogen en la exploración, no en ${estado.fase}`);
  }
  if (!metodoId || /\s/.test(metodoId)) {
    throw new Error(
      `"${metodoId}" no parece un id de método autorado. Un método con espacios es texto libre ` +
        "disfrazado, y la línea roja #3 dice que ningún niño escribe texto.",
    );
  }
  if (estado.metodosVistos.includes(metodoId)) return estado;
  return { ...estado, metodosVistos: [...estado.metodosVistos, metodoId] };
}

/**
 * Nombra la idea en la síntesis. Es el *matome*.
 *
 * `ideaId` también es autorada: la lección sabe de antemano qué idea enseña, y
 * la síntesis consiste en que el niño la reconozca entre las que se le ofrecen,
 * no en que la redacte.
 */
export function nombrarIdea(estado: EstadoHistoria, ideaId: string): EstadoHistoria {
  if (estado.fase !== "sintesis") {
    throw new Error(`la idea se nombra en la síntesis, no en ${estado.fase}`);
  }
  if (!ideaId || /\s/.test(ideaId)) {
    throw new Error(`"${ideaId}" no parece un id de idea autorada (línea roja #3)`);
  }
  return { ...estado, ideaNombrada: ideaId };
}

/**
 * ¿Puede la síntesis comparar algo?
 *
 * Con un solo método no hay *neriage*: comparar exige al menos dos. Devuelve
 * `false` para que la pantalla ofrezca los métodos autorados que el niño no
 * encontró, en vez de saltarse la fase por falta de material.
 */
export function haySuficientesMetodos(estado: EstadoHistoria): boolean {
  return estado.metodosVistos.length >= 2;
}

/** La historia terminó de verdad: pasó por las tres y nombró la idea. */
export function completa(estado: EstadoHistoria): boolean {
  return estado.fase === "terminado" && estado.ideaNombrada !== null;
}
