/**
 * Los textos de la superficie de grupos (F9 · #381-#383, #387), por locale, en
 * un solo sitio.
 *
 * Mismo patrón que `components/parent/textos.ts`: las pantallas reciben datos
 * crudos (puntos, rachas, códigos) y el copy vive en `i18n/grupos/*.json` —
 * viaja la clave, nunca el valor (D-022, mc-34). Los siete archivos se importan
 * aquí y no en cada página por la razón de siempre: dos copias de la misma
 * tabla es cómo una se queda sin el arreglo de la otra.
 *
 * Los textos están AUTORADOS por locale, no traducidos. Y todos son para
 * ADULTOS: la única superficie de niño de F9 (la mención neutra del mapa,
 * D-097 del reparto) es de la issue #399 y no vive en este catálogo.
 */
import en from "../../i18n/grupos/en.json";
import esMX from "../../i18n/grupos/es-MX.json";
import esES from "../../i18n/grupos/es-ES.json";
import frFR from "../../i18n/grupos/fr-FR.json";
import ptBR from "../../i18n/grupos/pt-BR.json";
import ptPT from "../../i18n/grupos/pt-PT.json";
import deDE from "../../i18n/grupos/de-DE.json";

export const TEXTOS_GRUPOS: Record<string, Record<string, string>> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/**
 * Rellena los marcadores de una plantilla de locale (`{max}`, `{escuela}`…).
 * Los valores llegan YA formateados por `formatear()`: esta función no sabe de
 * números y no tiene que saber — compone texto, que es lo suyo. Copiada a
 * propósito de `rellenarPadre` (ocho líneas) y no importada: cruzar una
 * dependencia entre dos subsistemas para ahorrarlas es cómo un cambio del panel
 * acaba rompiendo la pantalla de grupos.
 */
export function rellenarGrupo(plantilla: string, valores: Record<string, string>): string {
  let salida = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    salida = salida.replaceAll(`{${clave}}`, valor);
  }
  return salida;
}
