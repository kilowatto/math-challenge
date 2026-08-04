/**
 * Los textos de la pantalla del padre (F8 #269), por locale, en un solo sitio.
 *
 * Mismo patrón que `components/misiones/textos.ts`: la pantalla recibe datos
 * crudos (minutos, horas) y el copy vive en `i18n/padre/*.json` — viaja la
 * clave, nunca el valor (D-022, mc-34). Los siete archivos se importan aquí y
 * no en cada página por la razón de siempre: dos copias de la misma tabla es
 * cómo una se queda sin el arreglo de la otra.
 *
 * Los textos están AUTORADOS por locale, no traducidos: `es-MX` no es `es-ES`
 * (pretérito vs. perfecto: «jugó» / «ha jugado») y `pt-BR` no es `pt-PT`
 * («você pode» / «podes», «salvar» / «guardar», «hora de dormir» / «hora de
 * deitar»). Ningún número se escribe a mano en ellos: todo lo numérico llega
 * como marcador (`{jugados}`, `{limite}`, `{min}`, `{max}`, `{antes}`) y lo
 * resuelve `formatear()` de `packages/motor/src/numeros.ts`.
 *
 * La llave `padre.limite.honestidad` es D-016 hecha copy: los rangos por banda
 * son criterio propio y la pantalla lo dice, porque presentarlos como
 * recomendación médica sería una cita fabricada con evidencia que no existe.
 */
import en from "../../i18n/padre/en.json";
import esMX from "../../i18n/padre/es-MX.json";
import esES from "../../i18n/padre/es-ES.json";
import frFR from "../../i18n/padre/fr-FR.json";
import ptBR from "../../i18n/padre/pt-BR.json";
import ptPT from "../../i18n/padre/pt-PT.json";
import deDE from "../../i18n/padre/de-DE.json";

import cosEn from "../../i18n/cosmeticos/en.json";
import cosEsMX from "../../i18n/cosmeticos/es-MX.json";
import cosEsES from "../../i18n/cosmeticos/es-ES.json";
import cosFrFR from "../../i18n/cosmeticos/fr-FR.json";
import cosPtBR from "../../i18n/cosmeticos/pt-BR.json";
import cosPtPT from "../../i18n/cosmeticos/pt-PT.json";
import cosDeDE from "../../i18n/cosmeticos/de-DE.json";

export const TEXTOS_PADRE: Record<string, Record<string, string>> = {
  "en": en,
  "es-MX": esMX,
  "es-ES": esES,
  "fr-FR": frFR,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  "de-DE": deDE,
};

/**
 * Los nombres y condiciones de los cosméticos (F7 #255), para el roadmap del
 * panel (#284). Son los mismos siete JSON que lee cualquier otra superficie de
 * cosméticos — importados AQUÍ y no en cada página, por la razón de siempre:
 * dos copias de la misma tabla es cómo una se queda sin el arreglo de la otra.
 */
export const TEXTOS_COSMETICO: Record<string, Record<string, string>> = {
  "en": cosEn,
  "es-MX": cosEsMX,
  "es-ES": cosEsES,
  "fr-FR": cosFrFR,
  "pt-BR": cosPtBR,
  "pt-PT": cosPtPT,
  "de-DE": cosDeDE,
};

/**
 * Rellena los marcadores de una plantilla de locale (`{jugados}`, `{alias}`…).
 * Los valores llegan YA formateados por `formatear()`: esta función no sabe de
 * números y no tiene que saber — compone texto, que es lo suyo.
 *
 * Es la misma función que `components/misiones/textos.ts::rellenar`, copiada a
 * propósito y no importada: son ocho líneas, y cruzar una dependencia entre
 * dos subsistemas (misiones y el panel del padre) para ahorrarlas es cómo un
 * cambio de misiones acaba rompiendo la pantalla del límite.
 */
export function rellenarPadre(plantilla: string, valores: Record<string, string>): string {
  let salida = plantilla;
  for (const [clave, valor] of Object.entries(valores)) {
    salida = salida.replaceAll(`{${clave}}`, valor);
  }
  return salida;
}
