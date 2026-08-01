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
 * Convenciones matemáticas por locale — reexportadas.
 *
 * La tabla vive en `packages/motor/src/convenciones.ts` desde que el motor la
 * necesitó: `packages/` no puede depender de `apps/`. Se reexporta aquí para que
 * todo lo que ya la importaba de `~/i18n` siga funcionando, y para que siga
 * habiendo un solo lugar donde está escrita.
 */
export { MATH_CONVENTIONS } from "../../../../packages/motor/src/convenciones.ts";
