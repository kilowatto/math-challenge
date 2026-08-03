/**
 * El catálogo de bloques de LOCALE de Larry — los siete, cableados una vez.
 *
 * F6 #134. La estructura y la validación viven en `packages/tutor/`; aquí solo
 * se cablean los archivos, porque `packages/` no puede depender de `apps/` y
 * los JSON se importan con la sintaxis de Vite, que Node en ESM no acepta sin
 * atributo de tipo. Es la misma frontera por la que `MATH_CONVENTIONS` vive en
 * el motor y se reexporta desde `i18n/index.ts`.
 *
 * **Añadir el octavo locale es añadir un archivo y una línea aquí.** No se toca
 * el CANON, no se tocan los cinco bloques de banda, y no se edita el archivo de
 * ningún otro locale. Ese es el criterio de #134 hecho estructura.
 */

import type { BloqueLocale } from "../../../../../packages/tutor/src/catalogo.ts";
import type { Locale } from "../index.ts";

import en from "./en.json";
import esMX from "./es-MX.json";
import esES from "./es-ES.json";
import frFR from "./fr-FR.json";
import ptBR from "./pt-BR.json";
import ptPT from "./pt-PT.json";
import deDE from "./de-DE.json";

export const BLOQUES_LARRY: Record<Locale, BloqueLocale> = {
  "en": en as BloqueLocale,
  "es-MX": esMX as BloqueLocale,
  "es-ES": esES as BloqueLocale,
  "fr-FR": frFR as BloqueLocale,
  "pt-BR": ptBR as BloqueLocale,
  "pt-PT": ptPT as BloqueLocale,
  "de-DE": deDE as BloqueLocale,
};

/** El bloque de un locale. Lanza si falta: ver `componerPrefijo`. */
export function bloqueLarry(locale: Locale): BloqueLocale {
  const bloque = BLOQUES_LARRY[locale];
  if (!bloque) {
    throw new Error(
      `sin bloque de Larry para "${locale}". Un prompt sin capa de locale responde en el ` +
        "idioma del CANON, que no es el del lector (D-022, #134).",
    );
  }
  return bloque;
}
