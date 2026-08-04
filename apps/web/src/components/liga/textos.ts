/**
 * Los textos de la liga, por locale, en un solo sitio.
 *
 * Mismo patrón que `components/misiones/textos.ts`: el componente recibe datos
 * crudos (números, posiciones) y el copy vive en `i18n/liga/*.json` — autorado
 * por locale, nunca traducido (D-022, mc-34): `es-MX` no es `es-ES` y `pt-BR`
 * no es `pt-PT`. Los siete archivos se importan aquí y no en cada componente
 * por la razón de siempre: dos copias de la misma tabla es cómo una se queda
 * sin el arreglo de la otra.
 *
 * Ningún número se escribe a mano en los textos: todo lo numérico llega como
 * marcador (`{n}`, `{posicion}`) y lo resuelve `formatear()` de
 * `packages/motor/src/numeros.ts`, la única función que sabe que `de-DE` y
 * `fr-FR` no agrupan los millares igual.
 *
 * El léxico lo vigila `audits/racha-lexico.mjs` (D-081 condición 3: sin
 * lenguaje de pérdida en ninguna banda). Por eso aquí no hay «bajaste», «te
 * ganaron» ni cuentas regresivas: hay puntos, días seguidos y tercios.
 */
import en from "../../i18n/liga/en.json";
import esMX from "../../i18n/liga/es-MX.json";
import esES from "../../i18n/liga/es-ES.json";
import frFR from "../../i18n/liga/fr-FR.json";
import ptBR from "../../i18n/liga/pt-BR.json";
import ptPT from "../../i18n/liga/pt-PT.json";
import deDE from "../../i18n/liga/de-DE.json";

export const TEXTOS_LIGA: Record<string, Record<string, string>> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/**
 * Rellena los marcadores de una plantilla de locale (`{n}`, `{posicion}`).
 * Los valores llegan YA formateados: esta función no sabe de números y no
 * tiene que saber — compone texto, que es lo suyo.
 */
export function rellenar(plantilla: string, valores: Record<string, string>): string {
  let salida = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    salida = salida.replaceAll(`{${clave}}`, valor);
  }
  return salida;
}
