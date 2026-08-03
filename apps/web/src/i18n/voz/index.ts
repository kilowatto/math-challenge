/**
 * El catálogo hablado de los siete locales.
 *
 * F6 #135. **Aquí solo vive lo que ninguna función puede componer**: el nombre
 * hablado de cada número del rango que el banco produce. Los rótulos, los
 * enunciados y la retroalimentación NO se copian aquí — viven una sola vez en
 * `i18n/reto/*.json` y se pronuncian desde ahí. Una segunda copia del texto es
 * el segundo sitio donde una cadena se queda vieja, y la que se queda vieja es
 * siempre la que nadie lee porque suena en vez de verse.
 *
 * Por qué los números sí: en alemán el veintiuno es «einundzwanzig», una sola
 * palabra con las unidades delante, y en francés el noventa son tres. Pegar
 * decenas y unidades produce palabras que no existen, y las produce sin fallar.
 */

import type { Locale } from "../index.ts";

import en from "./en.json";
import esMX from "./es-MX.json";
import esES from "./es-ES.json";
import frFR from "./fr-FR.json";
import ptBR from "./pt-BR.json";
import ptPT from "./pt-PT.json";
import deDE from "./de-DE.json";

export interface CatalogoHablado {
  numeros: Record<string, string>;
}

export const VOZ: Record<Locale, CatalogoHablado> = {
  "en": en as CatalogoHablado,
  "es-MX": esMX as CatalogoHablado,
  "es-ES": esES as CatalogoHablado,
  "fr-FR": frFR as CatalogoHablado,
  "pt-BR": ptBR as CatalogoHablado,
  "pt-PT": ptPT as CatalogoHablado,
  "de-DE": deDE as CatalogoHablado,
};

/** Los números hablados de un locale, o `undefined` si el locale no existe. */
export function numerosHablados(locale: Locale): Record<string, string> | undefined {
  return VOZ[locale]?.numeros;
}
