/**
 * Convenciones matemáticas por locale (D-022, `mc-34`).
 *
 * **Vivía en `apps/web/src/i18n/index.ts` y se mudó aquí**, porque el motor la
 * necesita y `packages/` no puede depender de `apps/`: un módulo de dominio que
 * importa de la aplicación deja de poder probarse sin ella, y la primera prueba
 * que lo intentó reventó — el archivo de i18n importa JSON con la sintaxis de
 * Vite, que Node en ESM no acepta sin atributo de tipo.
 *
 * `apps/web/src/i18n/index.ts` la reexporta, así que nada que ya la consumía
 * tuvo que cambiar de import.
 *
 * Esto es lo que hace que "cinco idiomas" sea falso y "siete locales" verdadero.
 */

export const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * La tabla.
 *
 * Esto es lo que hace que "cinco idiomas" sea falso y "siete locales" verdadero.
 * Todavía no lo consume ninguna pantalla — el motor de reto es F3 — pero vive
 * aquí desde F0 para que nadie escriba un formateador de números asumiendo que
 * "es" es una sola cosa.
 *
 * Fuente: mc-34. Escala corta = billón es 10^9; larga = 10^12.
 */
export const MATH_CONVENTIONS: Record<Locale, {
  decimal: "." | ",";
  // El francés agrupa con espacio, y el espacio tiene que ser INSECABLE. Con un
  // espacio normal el navegador puede partir «157 000» en dos líneas y el
  // lector ve «157» al final de una y «000» al principio de la siguiente — un
  // número roto en un producto de matemáticas. CLDR usa el fino (U+202F) para
  // `fr-FR`. Se escribe con escape `\u202f` a propósito: literal es invisible en
  // un editor y alguien lo sustituye por un espacio normal sin darse cuenta.
  grouping: "," | "." | "\u202f";
  listSeparator: "," | ";";
  division: "÷" | ":";
  multiplication: "×" | "·";
  scale: "corta" | "larga";
  longDivision: "anglo" | "anglo-esparsa" | "potencia" | "ecuacion";
}> = {
  // México es el ÚNICO país hispano con punto decimal (mc-34 §1).
  "es-MX": { decimal: ".", grouping: ",", listSeparator: ",", division: "÷", multiplication: "×", scale: "larga", longDivision: "anglo-esparsa" },
  "es-ES": { decimal: ",", grouping: ".", listSeparator: ";", division: "÷", multiplication: "×", scale: "larga", longDivision: "potencia" },
  "en":    { decimal: ".", grouping: ",", listSeparator: ",", division: "÷", multiplication: "×", scale: "corta", longDivision: "anglo" },
  "fr-FR": { decimal: ",", grouping: "\u202f", listSeparator: ";", division: ":", multiplication: "×", scale: "larga", longDivision: "potencia" },
  // Brasil es la excepción del portugués: escala corta, y división a la europea.
  "pt-BR": { decimal: ",", grouping: ".", listSeparator: ";", division: "÷", multiplication: "×", scale: "corta", longDivision: "potencia" },
  "pt-PT": { decimal: ",", grouping: ".", listSeparator: ";", division: ":", multiplication: "×", scale: "larga", longDivision: "potencia" },
  // Alemania usa punto medio para multiplicar: × se confunde con la variable x.
  "de-DE": { decimal: ",", grouping: ".", listSeparator: ";", division: ":", multiplication: "·", scale: "larga", longDivision: "ecuacion" },
};
