/**
 * Los textos del tablero global (F7 #247), por locale, en un solo sitio.
 *
 * Mismo patrón que `components/parent/textos.ts`: las pantallas reciben datos
 * crudos (puntos, posiciones) y el copy vive en `i18n/tablero/*.json` — viaja
 * la clave, nunca el valor (D-022, mc-34). Los siete archivos se importan aquí
 * y no en cada página por la razón de siempre: dos copias de la misma tabla es
 * cómo una se queda sin el arreglo de la otra.
 *
 * Los textos están AUTORADOS por locale, no traducidos: `pt-BR` dice «você» y
 * `pt-PT` dice «tu», y la superficie del padre alemana habla de «Sie» mientras
 * la del niño habla de «du». Ningún número se escribe a mano en ellos: todo lo
 * numérico llega como marcador (`{puntos}`, `{posicion}`) y lo resuelve
 * `formatear()` de `packages/motor/src/numeros.ts` con el locale de QUIEN
 * MIRA, jamás el `alias_locale` del dueño de la fila (#247).
 */
import en from "../../i18n/tablero/en.json";
import esMX from "../../i18n/tablero/es-MX.json";
import esES from "../../i18n/tablero/es-ES.json";
import frFR from "../../i18n/tablero/fr-FR.json";
import ptBR from "../../i18n/tablero/pt-BR.json";
import ptPT from "../../i18n/tablero/pt-PT.json";
import deDE from "../../i18n/tablero/de-DE.json";

export const TEXTOS_TABLERO: Record<string, Record<string, string>> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/**
 * Rellena los marcadores de una plantilla de locale (`{puntos}`, `{alias}`…).
 * Los valores llegan YA formateados por `formatear()`: esta función no sabe de
 * números y no tiene que saber — compone texto, que es lo suyo.
 *
 * Es la misma función que `components/parent/textos.ts::rellenarPadre`,
 * copiada a propósito y no importada: son ocho líneas, y cruzar una
 * dependencia entre dos subsistemas para ahorrarlas es cómo un cambio del
 * panel del límite acaba rompiendo el tablero.
 */
export function rellenarTablero(plantilla: string, valores: Record<string, string>): string {
  let salida = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    salida = salida.replaceAll(`{${clave}}`, valor);
  }
  return salida;
}
