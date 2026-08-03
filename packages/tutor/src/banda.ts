/**
 * BANDA — la capa más volátil del prompt, y por eso la última.
 *
 * F6 #134, `docs/planes/f6-larry-profe.md` §3.1-3.2.
 *
 * Techo de vocabulario, longitud de frase, canal, y cuántos pasos son honestos.
 * Nada más. Si aquí aparece una regla de seguridad, está duplicada cinco veces y
 * el día que se corrija va a quedar corregida en cuatro.
 *
 * ─── Por qué el eje BANDA no se puede omitir ───────────────────────────────
 *
 * El criterio de #134 dice «un prompt por locale» y el dueño ya anotó en la
 * propia issue que eso describe **una capa**, no la arquitectura: un
 * implementador que solo lea el título construye siete prompts monolíticos y
 * kinder acaba sonando como Pro. `mc-37` §What must change 4 pide la banda de
 * edad como parámetro explícito del prompt, «no left for the model to infer
 * from tone».
 *
 * ─── Cinco bloques, no seis ────────────────────────────────────────────────
 *
 * `Banda` tiene seis valores y `TemaVisual` cinco: `JR` comparte N11-N12 y
 * pantalla con `PRO` (D-017), así que es un alias de dificultad y no un tema.
 * La tabla se importa de `bandas.ts` en vez de declararse otra vez —
 * `audits/tabla-bandas.mjs` bloqueó exactamente eso una vez, y tenía razón: dos
 * tablas divergentes no producen un error, producen un niño al que el servidor
 * coloca en un sitio y la interfaz le enseña otro.
 *
 * ─── El canal, que es lo que hace distinta a KINDER ────────────────────────
 *
 * En kinder el texto no se lee: se oye (`mc-20` documenta que a los 3-6 la
 * lectura está «not at all» desarrollada, y por eso D-073 fue a primaria
 * primero). Un bloque de kinder que no diga «esto se va a pronunciar» produce
 * frases correctas por escrito e impronunciables en voz alta — paréntesis,
 * incisos, números entre comas.
 */

import { ORDEN_TEMAS, type TemaVisual } from "../../motor/src/bandas.ts";
import type { Banda } from "../../motor/src/puntuacion.ts";

/**
 * `JR` no tiene bloque propio: usa el de `PRO`.
 *
 * Es la misma razón por la que `TemaVisual` lo excluye, y se escribe como
 * función y no como una entrada más de la tabla para que el mapeo esté en un
 * solo sitio.
 */
export function bandaDePrompt(banda: Banda): TemaVisual {
  return banda === "JR" ? "PRO" : banda;
}

/**
 * Los cinco bloques.
 *
 * En inglés, como el CANON y por la misma razón: es capa de instrucción, no de
 * voz. Lo que el niño oye sale del bloque de locale.
 */
export const BLOQUE_BANDA: Record<TemaVisual, string> = {
  KINDER: `AUDIENCE
The learner does not read. Everything you write is going to be spoken aloud to a
child of four to six, and heard once.

- One idea per sentence. Short sentences, in the order things happen.
- Words a four-year-old already uses. No terms from the subject itself.
- Write for the ear: no parentheses, no asides, no lists, nothing that only works
  as marks on a page.
- Two sentences in total. What happened, then what to try. That is the whole turn.
- One step. A second step is a step the child has stopped listening to.
- Never ask the child to hold a quantity in mind while you say something else.`,

  PRIMARIA: `AUDIENCE
The learner reads, and reading aloud is a setting the parent may have switched on.

- Short sentences, plain words. Words from the subject are allowed once the
  learner has met them, and never more than one that is new.
- Three sentences at most: what was done, what went wrong, what to try.
- Up to two steps, and only when the second genuinely follows from the first.
- Concrete before abstract. Something countable beats something named.`,

  SECUNDARIA: `AUDIENCE
The learner reads fluently and notices being talked down to faster than being
taught. Nothing here may read as written for a younger learner.

- Ordinary sentences. Terms from the subject used correctly and without apology.
- Four sentences at most.
- Up to three steps, named as steps.
- No exclamation marks, no cheerleading. Being taken seriously is the tone.`,

  SERIO: `AUDIENCE
An adult studying for their own reasons. They chose to be here and their time is
the scarce thing.

- Direct. The point first, the reasoning after.
- Correct terminology, no glossing.
- Four sentences at most, or a short numbered sequence when the procedure has
  genuine steps.
- No encouragement that an adult did not ask for. Accuracy is the courtesy.`,

  PRO: `AUDIENCE
A specialist. They will spot a hollow explanation immediately, and a wrong one
does more damage here than anywhere else in the product.

- Precise terminology, standard notation, no simplification that costs accuracy.
- Where the input gives a judgement per step, explain each judgement given.
- Where the input gives no judgement for a step, describe it and say nothing
  about whether it holds. Describing is allowed; ruling is not.
- If the input does not support a specific, checkable explanation, produce
  nothing. Here that is the cheap failure and a plausible wrong one is not.`,
};

/** El orden de la escalera, reexportado para que nadie escriba otro. */
export { ORDEN_TEMAS };
export type { TemaVisual };
