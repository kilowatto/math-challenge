/**
 * La ficha de notación del bloque de locale — GENERADA, nunca tecleada.
 *
 * F6 #134, `docs/planes/f6-larry-profe.md` §3.4, `mc-34`, D-022.
 *
 * ─── Por qué se genera ─────────────────────────────────────────────────────
 *
 * Porque la alternativa es una segunda tabla de convenciones, y
 * `audits/notacion-locale.mjs` existe precisamente porque una segunda tabla se
 * desincroniza en el primer cambio y el síntoma es un número mal escrito en un
 * producto de matemáticas. La fuente es `MATH_CONVENTIONS`, con sus siete filas
 * y su procedencia; aquí solo se le da forma de renglones.
 *
 * ─── Por qué la ficha es REFUERZO y no el mecanismo ────────────────────────
 *
 * El mecanismo es que los números lleguen al modelo **ya formateados**
 * (`packages/motor/src/numeros.ts`). Larry no puede escribir un decimal con
 * punto en alemán si ese decimal nunca existió en su entrada. Instruirlo en el
 * prompt se queda como refuerzo, nunca como la defensa: una instrucción se puede
 * desobedecer, y D-050 midió 74 de 131 documentos con hallazgos de integridad al
 * traducir, siendo la clase más frecuente exactamente un decimal que no cambió
 * de separador.
 *
 * ─── Por qué la ficha va en inglés dentro de un bloque que no lo está ──────
 *
 * Porque no es voz: es una tabla de símbolos para la máquina que la lee. El
 * compromiso de idioma, el registro y los ejemplos —lo que sí determina cómo
 * suena Larry— están autorados en el idioma del locale, en el mismo bloque, y
 * son lo que el modelo imita. Traducir los rótulos de esta ficha a siete
 * idiomas añadiría siete cadenas que mantener y cero señal.
 */

import { MATH_CONVENTIONS, type Locale } from "../../motor/src/convenciones.ts";

/**
 * Nombre legible de un separador que puede ser invisible.
 *
 * Los tres se comparan con escape y no con el carácter literal, por la misma
 * razón que `convenciones.ts` los escribe así: un U+202F literal es
 * indistinguible de un espacio normal en un editor, y alguien lo sustituye sin
 * darse cuenta — que es el bug #322, ya ocurrido en este repo.
 */
function nombrar(caracter: string): string {
  if (caracter === "\u202f") return "narrow no-break space (U+202F)";
  if (caracter === "\u00a0") return "no-break space (U+00A0)";
  if (caracter === "\u0020") return "space (U+0020)";
  return caracter;
}

/**
 * La ficha, como bloque de texto.
 *
 * No declara ningún separador: los lee de la fila del locale. Esa es la
 * diferencia entre un renderizador y una segunda tabla.
 */
export function fichaDeNotacion(locale: Locale): string {
  const fila = MATH_CONVENTIONS[locale];
  if (!fila) {
    throw new Error(
      `sin fila de MATH_CONVENTIONS para "${locale}". Falla cerrado a propósito: un prompt ` +
        "sin ficha de notación es un prompt que deja la notación al criterio del modelo (mc-34).",
    );
  }

  return [
    "NOTATION IN FORCE FOR THIS READER (generated from the single source of truth;",
    "quantities already arrive written this way, so copy them and never restate them):",
    `- decimal mark: ${nombrar(fila.decimal)}`,
    `- thousands mark: ${nombrar(fila.grouping)}`,
    `- separator between items in a list: ${nombrar(fila.listSeparator)}`,
    `- division sign: ${fila.division}`,
    `- multiplication sign: ${fila.multiplication}`,
    `- numeric scale: ${fila.scale === "corta" ? "short" : "long"}`,
    `- long division is laid out in the ${fila.longDivision} manner`,
  ].join("\n");
}

/**
 * Las siete fichas, para que un auditor pueda comprobar que ninguna se repite
 * donde no debe.
 *
 * `es-MX` y `es-ES` **tienen** que salir distintas: México es el único país
 * hispano con punto decimal. Si estas dos fichas salieran iguales, la tabla
 * estaría rota, no la ficha.
 */
export function todasLasFichas(): Record<Locale, string> {
  const salida = {} as Record<Locale, string>;
  for (const locale of Object.keys(MATH_CONVENTIONS) as Locale[]) {
    salida[locale] = fichaDeNotacion(locale);
  }
  return salida;
}
