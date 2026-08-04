/**
 * ¿Necesita esta página el subconjunto latin-ext de Raleway?
 *
 * De dónde sale la pregunta (#327). Las dos @font-face de `styles/fonts.css`
 * parten Raleway en latin y latin-ext por `unicode-range`, y `Base.astro`
 * precarga SOLO latin: cubre el cuerpo de los siete locales (ñ, ç, ã, ü y €
 * viven en U+0000-00FF o en los extras del rango latin). latin-ext se
 * descubre tarde —cuando el render encuentra un glifo fuera de ese rango—
 * y ese descubrimiento tardío fue el diferencial medido entre la portada
 * (LCP 2.28s en producción) y un artículo largo del corpus (2.88s): el h1 de
 * mc-01 dice «Banshō», y la ō (U+014D) no está en latin. Con
 * `font-display: swap` el texto pinta con la fuente de respaldo y se repinta
 * cuando llega la fuente; el repaint re-emite la entrada de LCP, así que el
 * LCP de esas páginas queda fechado a la llegada de latin-ext, un viaje
 * redondo más en 4G lento (mc-47 §4).
 *
 * La salida no es precargar latin-ext en todas partes: son 27 KB que la
 * inmensa mayoría de las páginas jamás usa, y regalar ese peso a la portada
 * para arreglar un puñado de páginas del corpus es cambiar un problema por
 * otro. Se precarga solo en la página que de verdad contiene un glifo del
 * rango, que es lo que esta función decide en el build.
 *
 * EL RANGO ES UNA COPIA DEL `unicode-range` DE `fonts.css`, no una
 * aproximación. Si allí cambia, cambia aquí — la divergencia no rompe nada
 * visible: deja de precargarse una fuente que la página sí usa (regresa el
 * LCP tardío) o se precarga una que no usa (27 KB regalados). Las dos
 * silenciosas. En particular U+20AC (€) NO está: lo cubre el rango latin, y
 * por eso mc-17/mc-38/mc-41, que solo tienen €, no deben precargar nada.
 */
// U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
// U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF,
// U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF
const RANGO_LATIN_EXT =
  /[\u0100-\u02BA\u02BD-\u02C5\u02C7-\u02CC\u02CE-\u02D7\u02DD-\u02FF\u0304\u0308\u0329\u1D00-\u1DBF\u1E00-\u1E9F\u1EF2-\u1EFF\u2020\u20A0-\u20AB\u20AD-\u20C0\u2113\u2C60-\u2C7F\uA720-\uA7FF]/;

export function necesitaLatinExt(texto: string): boolean {
  return RANGO_LATIN_EXT.test(texto);
}
