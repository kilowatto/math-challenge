/**
 * Los textos de las misiones diarias, por locale, en un solo sitio.
 *
 * Mismo patrón que `components/racha/Racha.astro`: el componente recibe datos
 * crudos (tipos, números) y el copy vive en `i18n/misiones/*.json` — viaja la
 * clave, nunca el valor desde el motor (D-022, mc-34). Los siete archivos se
 * importan aquí y no en cada componente por la razón de siempre: dos copias de
 * la misma tabla es cómo una se queda sin el arreglo de la otra.
 *
 * Los textos están AUTORADOS por locale, no traducidos (#227): `es-MX` no es
 * `es-ES` y `pt-BR` no es `pt-PT`. Y ningún número se escribe a mano en ellos —
 * todo lo numérico llega como marcador (`{n}`, `{meta}`, `{xp}`…) y lo resuelve
 * `formatear()` de `packages/motor/src/numeros.ts`, que es la única función que
 * sabe que `de-DE` y `fr-FR` no agrupan los millares igual.
 */
import en from "../../i18n/misiones/en.json";
import esMX from "../../i18n/misiones/es-MX.json";
import esES from "../../i18n/misiones/es-ES.json";
import frFR from "../../i18n/misiones/fr-FR.json";
import ptBR from "../../i18n/misiones/pt-BR.json";
import ptPT from "../../i18n/misiones/pt-PT.json";
import deDE from "../../i18n/misiones/de-DE.json";

export const TEXTOS_MISIONES: Record<string, Record<string, string>> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/**
 * Rellena los marcadores de una plantilla de locale (`{n}`, `{meta}`, `{xp}`).
 * Los valores llegan YA formateados por `formatear()`: esta función no sabe de
 * números y no tiene que saber — compone texto, que es lo suyo.
 */
export function rellenar(plantilla: string, valores: Record<string, string>): string {
  let salida = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    salida = salida.replaceAll(`{${clave}}`, valor);
  }
  return salida;
}
