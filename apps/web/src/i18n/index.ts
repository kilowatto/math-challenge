// Los siete locales del producto (D-022, mc-34).
//
// No son cinco idiomas: es-MX y es-ES no comparten separador decimal, pt-BR y
// pt-PT no comparten escala numérica. Tratarlos como uno produce contenido
// matemáticamente incorrecto sin que nadie lo note.
//
// audits/locales-complete.mjs verifica que esta lista, la de wrangler.jsonc y
// los archivos de mensajes no se separen.

import en from "./en.json";
import esMX from "./es-MX.json";
import esES from "./es-ES.json";
import frFR from "./fr-FR.json";
import ptBR from "./pt-BR.json";
import ptPT from "./pt-PT.json";
import deDE from "./de-DE.json";

export const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

const MESSAGES: Record<Locale, typeof en> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

export function isLocale(value: string | undefined): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function t(locale: Locale) {
  return MESSAGES[locale];
}

/**
 * Convenciones matemáticas por locale.
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
  grouping: "," | "." | " ";
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
  "fr-FR": { decimal: ",", grouping: " ", listSeparator: ";", division: ":", multiplication: "×", scale: "larga", longDivision: "potencia" },
  // Brasil es la excepción del portugués: escala corta, y división a la europea.
  "pt-BR": { decimal: ",", grouping: ".", listSeparator: ";", division: "÷", multiplication: "×", scale: "corta", longDivision: "potencia" },
  "pt-PT": { decimal: ",", grouping: ".", listSeparator: ";", division: ":", multiplication: "×", scale: "larga", longDivision: "potencia" },
  // Alemania usa punto medio para multiplicar: × se confunde con la variable x.
  "de-DE": { decimal: ",", grouping: ".", listSeparator: ";", division: ":", multiplication: "·", scale: "larga", longDivision: "ecuacion" },
};
