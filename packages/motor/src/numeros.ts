/**
 * Escribir un número en el locale correcto. Uno solo, y este.
 *
 * Hace cumplir D-022, `mc-34` y CLAUDE.md § Idiomas: *"el contenido matemático
 * no se traduce, se autora"*.
 *
 * El dato que descoloca a todo el mundo la primera vez: **México usa PUNTO
 * decimal y el resto del mundo hispano usa coma**. `es` no es un idioma para
 * este producto; son dos locales que escriben los números distinto. Y Brasil usa
 * escala corta —`10⁹` es *bilhão*— mientras Portugal usa larga y dice
 * *mil milhões*. Confundir esos dos cambia un número por mil veces su valor sin
 * tocar un solo dígito.
 *
 * **No usa `Intl.NumberFormat` para el separador**, y eso es deliberado. `Intl`
 * es correcto para es-MX y es-ES, pero el producto necesita además el signo de
 * división y el de multiplicación por locale —Alemania divide con `:` y
 * multiplica con `·` porque `×` se confunde con la variable x— y eso `Intl` no lo
 * da. Tener dos fuentes, una para el separador y otra para los signos, es
 * exactamente cómo se desincronizan. La tabla de `MATH_CONVENTIONS` las tiene
 * todas, con su fuente.
 *
 * LO QUE ESTE MÓDULO NO HACE: autorar el contenido. Que un problema de división
 * larga se PRESENTE distinto en Alemania —`ecuacion` en la tabla— es diseño de
 * ítem y revisión humana, no formato de cadena.
 */

import { MATH_CONVENTIONS, type Locale } from "./convenciones.ts";

export { MATH_CONVENTIONS };

/**
 * Escribe un número con el decimal y los millares del locale.
 *
 * `decimales` es explícito a propósito. Con `undefined`, `toLocaleString`
 * decide, y "decide" significa que 0.5 y 0.50 salen distinto según el navegador
 * — en un producto de matemáticas eso es una respuesta distinta.
 */
export function formatear(n: number, locale: Locale, decimales?: number): string {
  if (!Number.isFinite(n)) {
    throw new RangeError(`no se puede formatear ${n} en ${locale}`);
  }
  const c = MATH_CONVENTIONS[locale];

  const fijo = decimales === undefined ? String(n) : n.toFixed(decimales);
  const negativo = fijo.startsWith("-");
  const [entera, fraccion] = (negativo ? fijo.slice(1) : fijo).split(".");

  // Los millares se agrupan de tres en tres desde la derecha. En francés el
  // separador es un espacio fino insecable (U+202F), no un espacio normal: uno
  // normal permite que la línea se rompa en medio de un número.
  const agrupada = entera.replace(/\B(?=(\d{3})+(?!\d))/g, c.grouping === " " ? " " : c.grouping);

  const salida = fraccion === undefined ? agrupada : `${agrupada}${c.decimal}${fraccion}`;
  return negativo ? `-${salida}` : salida;
}

/**
 * El signo de una operación en el locale.
 *
 * Alemania multiplica con el punto medio `·` y divide con `:`. No es una
 * preferencia tipográfica: en un aula alemana el `×` se lee como la variable x,
 * y un ítem de álgebra escrito con `×` es ambiguo (`mc-34`).
 */
export function signo(op: "multiplicacion" | "division", locale: Locale): string {
  const c = MATH_CONVENTIONS[locale];
  return op === "multiplicacion" ? c.multiplication : c.division;
}

/** El separador de una lista de números en el locale. */
export function separadorDeLista(locale: Locale): string {
  // Donde el decimal es coma, la coma no puede separar elementos: «1,5, 2,5» es
  // ilegible y ambiguo. Por eso esos locales usan punto y coma.
  return MATH_CONVENTIONS[locale].listSeparator;
}

/** Escribe una lista de números con el separador correcto del locale. */
export function formatearLista(ns: number[], locale: Locale, decimales?: number): string {
  const sep = separadorDeLista(locale);
  return ns.map((n) => formatear(n, locale, decimales)).join(`${sep} `);
}

/**
 * Escribe una operación completa, con sus signos y sus números.
 *
 *   operacion(127, "division", 4, "de-DE")  →  "127 : 4"
 *   operacion(127, "division", 4, "en")     →  "127 ÷ 4"
 */
export function operacion(
  a: number,
  op: "multiplicacion" | "division",
  b: number,
  locale: Locale,
  decimales?: number,
): string {
  return `${formatear(a, locale, decimales)} ${signo(op, locale)} ${formatear(b, locale, decimales)}`;
}

/**
 * Cómo se llama `10^exponente` en el locale, según su escala.
 *
 * Escala corta (en, pt-BR): `10⁹` es *billion* / *bilhão*.
 * Escala larga (es, fr, pt-PT, de): `10⁹` es *mil millones* / *mil milhões*.
 *
 * Devuelve la CLAVE del mensaje, no el texto: traducir aquí sería un segundo
 * lugar donde vive una cadena de interfaz. Lo que este módulo aporta es saber
 * **cuál** clave corresponde, que es lo que depende de la escala.
 */
export function claveDeMagnitud(exponente: 9 | 12, locale: Locale): string {
  const escala = MATH_CONVENTIONS[locale].scale;
  if (exponente === 9) return escala === "corta" ? "magnitud.billion" : "magnitud.milMillones";
  return escala === "corta" ? "magnitud.trillion" : "magnitud.billon";
}
