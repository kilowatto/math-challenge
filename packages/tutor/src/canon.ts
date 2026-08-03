/**
 * CANON — la capa común del prompt de Larry. Una sola, para los siete locales.
 *
 * F6 #134, `docs/planes/f6-larry-profe.md` §3.1-3.2, `mc-37` §What must change 2.
 *
 * ─── Por qué esta capa existe separada ─────────────────────────────────────
 *
 * `mc-37` midió el patrón de IOS —cada línea del prompt escrita dos veces, EN y
 * ES, en una sola cadena— y dijo por qué no escala: multiplica los tokens de
 * prompt por el número de idiomas para contenido que en cada llamada se usa en
 * una sola lengua.
 *
 * Pero la salida tampoco es «siete prompts completos e independientes». Eso
 * duplicaría siete veces el contrato de seguridad que hace cumplir la línea roja
 * #7, y un bug arreglado en seis de siete archivos es el modo de falla que esta
 * separación elimina por construcción.
 *
 * La salida son tres capas, ordenadas **por tasa de cambio** y no por tema:
 *
 *     CANON (1)  →  LOCALE (7)  →  BANDA (5)   ‖   sobre (mensaje de usuario)
 *
 * La caché de prefijo casa por prefijo literal de tokens. Con este orden, editar
 * el bloque de banda invalida solo la cola. Con el orden intuitivo —locale
 * primero, «porque es lo que define la voz»— cualquier cambio en el bloque más
 * volátil invalidaría todo lo que va detrás.
 *
 * ─── Lo que el CANON NO puede contener, y por qué es comprobable ───────────
 *
 * Ninguna cifra de contenido, ningún operador matemático, ningún nombre de
 * idioma, ninguna frase de ejemplo. Si el CANON nombrara un idioma, dejaría de
 * ser común; si llevara un operador, estaría eligiendo notación por los siete
 * locales, y `MATH_CONVENTIONS` dice que esa elección es de cada uno — en
 * alemán la división se escribe con dos puntos y la multiplicación con punto
 * medio, porque la cruz se confunde con la variable.
 *
 * `INVARIANTES_CANON` deja esas reglas escritas como datos para que un auditor
 * las lea de aquí en vez de volver a teclearlas. La regla se corrigió respecto
 * del primer diseño, que prohibía todo dígito: eso marca en rojo el archivo que
 * él mismo describe, porque una lista numerada y una cita a `D-035` llevan
 * dígitos. Lo prohibido es el **numeral usado como cantidad**.
 *
 * ─── El idioma del CANON ───────────────────────────────────────────────────
 *
 * Inglés, y no es un descuido de i18n: es la capa que el niño nunca oye. Lo que
 * el niño oye sale del bloque de locale, escrito en su idioma por un autor
 * nativo. Escribir el contrato de seguridad siete veces sería volver a tener el
 * bug de «arreglado en seis de siete».
 */

/**
 * El contrato, en una cadena.
 *
 * Cambiar este texto mueve los 35 prefijos de la escalera completa a la vez, así
 * que un PR que lo toca es un PR que los siete autores nativos tienen que mirar.
 * Eso es una regla social y hay que escribirla en el PR; ningún auditor la
 * impone. Lo que sí se puede comprobar es que los hashes se movieron todos
 * (`prefijo.ts`, `hashDePrefijo`).
 */
export const CANON = `You are Larry, the orange rhinoceros. Same character as always, teaching maths now.

WHAT YOU RECEIVE
A verdict that has already been decided by the grading engine: whether the answer
was right, and — when it was not — the named cause of the mistake. You also
receive the skill being practised, as a key, never as a label.

WHAT YOU NEVER DO
- You never grade. The verdict arrives decided; you explain it, you do not
  review it. If a dictum could change the mark, the engine emits it. If it only
  changes the words, you emit it.
- You never calculate, convert, round, re-derive or invent a quantity. Every
  quantity you say aloud must have arrived in your input, written exactly as it
  arrived. Numbers reach you already formatted for the reader's country; copy
  them, never rewrite them.
- You never state the right answer when the learner has not reached it. Naming
  what went wrong and what to try next is the whole job.
- You never ask a question that expects typed words back. The learner answers by
  touching, never by writing. A question you ask is a question the learner
  cannot answer, and it reads as being ignored.
- You never listen. Your voice is output only: you speak, the learner never
  speaks to you. There is no microphone anywhere in this product, at any age.
- You never mention time taken, points, streaks, rank, or any other learner.

HOW AN EXPLANATION IS SHAPED
- Say what the learner actually did, described as a piece of thinking. The
  thinking is what went wrong, never the person.
- Name the mistake plainly, once, without dressing it up and without repeating it.
- Give the next thing to try, small enough to do straight away.
- Stop. A longer explanation is not a kinder one.

HOW YOU SPEAK TO SOMEONE WHO GOT IT WRONG
- Describe the thinking, not the person. Nothing that attributes the outcome to
  a fixed trait, in either direction: praising a trait means the trait failed
  the next time something goes wrong.
- No sarcasm, no exasperation, no disappointment, not even softened.
- No comparison with anyone else and no average.
- Mistakes are how maths gets learned, and your manner has to be evidence of
  that rather than a sentence claiming it.

WHEN YOU CANNOT
If the input does not let you say something true and specific, produce nothing.
Silence is handled downstream and is safe. A guess is not.`;

/**
 * Las reglas del CANON, como datos.
 *
 * Escritas aquí y no dentro de un auditor a propósito: un auditor con su propia
 * copia de la regla se desincroniza en el primer cambio, y el síntoma sería un
 * guardián que aprueba un CANON que ya no cumple lo que este archivo promete.
 */
export const INVARIANTES_CANON = {
  /**
   * Ningún numeral usado como CANTIDAD. Un dígito pegado a un operador o a un
   * signo de igualdad es aritmética; un dígito en `D-035`, en `mc-11` o en una
   * lista numerada, no.
   */
  numeralComoCantidad: /\d\s*[+\-*/=<>]\s*\d/,
  /** Los signos que `MATH_CONVENTIONS` reparte por locale. Ninguno cabe aquí. */
  operadoresDeLocale: ["÷", "×", "·", "⋅", "∶"],
  /**
   * Las citas que sí llevan dígitos y sí se permiten. Lista corta y explícita:
   * una lista de excepciones que crece es una regla que se apagó sin decirlo.
   */
  citasPermitidas: /\b(?:D-\d{3}|mc-\d{2})\b/g,
  /** Nombrar un idioma o un locale rompe que la capa sea común. */
  idiomasProhibidos: [
    "english", "spanish", "french", "portuguese", "german",
    "español", "français", "português", "deutsch",
  ],
} as const;

/**
 * Comprueba el CANON contra sus propios invariantes. Devuelve los problemas.
 *
 * Falla CERRADO: si no puede comprobar, lo dice como problema en vez de callar.
 * Vive aquí y no en `audits/` para que la prueba del paquete lo ejerza sin
 * depender de que alguien registre un auditor.
 */
export function revisarCanon(texto: string = CANON): string[] {
  const problemas: string[] = [];

  const sinCitas = texto.replace(INVARIANTES_CANON.citasPermitidas, "");

  const cantidad = sinCitas.match(INVARIANTES_CANON.numeralComoCantidad);
  if (cantidad) {
    problemas.push(
      `el CANON contiene un numeral usado como cantidad («${cantidad[0]}»). ` +
        "La capa común no lleva contenido matemático: eso vive en el sobre, ya formateado " +
        "para el locale del lector (plan F6 §3.4).",
    );
  }

  for (const signo of INVARIANTES_CANON.operadoresDeLocale) {
    if (texto.includes(signo)) {
      problemas.push(
        `el CANON contiene \`${signo}\`, que es un signo REPARTIDO por locale en ` +
          "MATH_CONVENTIONS — en de-DE la división es `:` y la multiplicación `·`. " +
          "Escribirlo en la capa común elige la notación de siete locales de una vez (mc-34).",
      );
    }
  }

  const bajo = texto.toLowerCase();
  for (const idioma of INVARIANTES_CANON.idiomasProhibidos) {
    if (bajo.includes(idioma)) {
      problemas.push(
        `el CANON nombra el idioma «${idioma}». El compromiso de idioma vive en el bloque ` +
          "de locale, escrito EN ese idioma; nombrarlo aquí hace que la capa deje de ser común.",
      );
    }
  }

  if (texto.trim() === "") problemas.push("el CANON está vacío");

  return problemas;
}
