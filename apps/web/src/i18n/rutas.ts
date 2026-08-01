// Segmentos de URL por locale (D-049).
//
// Por qué existe. Hasta hoy las siete variantes de una página compartían la
// misma ruta en español —`/de-DE/investigacion/`— y el `hreflang` era trivial
// porque solo cambiaba el prefijo. D-049 lo cambió: el segmento va en el idioma
// del locale, porque una URL en español bajo `/de-DE/` le dice a un lector
// alemán que la página no es para él.
//
// Este archivo es la ÚNICA fuente de esos segmentos. Si alguien escribe
// `investigacion` a mano en una plantilla, el `hreflang` deja de cerrar el ciclo
// y Google ignora el grupo de idiomas entero (mc-48 §3) — un fallo que no rompe
// ninguna página y que nadie nota mirando el sitio.
//
// DOS REGLAS que no son estéticas:
//
//  1. **Sin diacríticos.** `pt-PT` es `investigacao`, no `investigação`. Un
//     carácter no-ASCII en una ruta se porcentualiza a `investiga%C3%A7%C3%A3o`,
//     y una URL porcentualizada es peor de leer, de compartir y de citar. Misma
//     razón por la que `audits/adversarial/sarif.mjs` codifica rutas.
//  2. **Los slugs de documento NO se traducen.** `mc-05-spacing-retrieval-…` es
//     el mismo en los siete. El identificador `mc-NN` es citable y estable
//     (D-033); traducirlo rompe la única forma de encontrar el mismo documento
//     en otro idioma.

import { LOCALES, type Locale } from "./index";
import { SEGMENTOS as TABLA } from "./rutas-tabla.mjs";

/** Las secciones del sitio que tienen ruta propia. */
export type Seccion = "investigacion" | "arquitectura" | "codigo-abierto" | "niveles" | "origen";

/**
 * El segmento de cada sección en cada locale.
 *
 * **Los datos viven en `rutas-tabla.mjs`**, no aquí. `astro.config.mjs` los
 * necesita para generar las 301 y corre en Node antes de que exista un pipeline
 * de TypeScript; escribir la tabla dos veces la desincronizaría en el primer
 * cambio, y el síntoma sería una redirección hacia un 404.
 *
 * `es-MX` y `es-ES` conservan el segmento español, así que sus URLs no cambian
 * y no necesitan redirección. Los otros cinco sí.
 */
export const SEGMENTOS = TABLA as Record<Locale, Record<Seccion, string>>;

/** El segmento de una sección en un locale. */
export function segmento(locale: Locale, seccion: Seccion): string {
  return SEGMENTOS[locale][seccion];
}

/**
 * La ruta absoluta de una sección, con barra final.
 *
 *   ruta("de-DE", "investigacion")            → "/de-DE/forschung/"
 *   ruta("de-DE", "investigacion", "mc-05-x") → "/de-DE/forschung/mc-05-x/"
 */
export function ruta(locale: Locale, seccion: Seccion, slug?: string): string {
  const base = `/${locale}/${segmento(locale, seccion)}/`;
  return slug ? `${base}${slug}/` : base;
}

/**
 * Todas las variantes de una sección, para el `hreflang`.
 *
 * Es la razón entera de este archivo: con segmentos distintos por locale, el
 * ciclo recíproco ya no se puede armar cambiando el prefijo de la URL actual.
 */
export function alternativas(seccion: Seccion, slug?: string): Array<{ locale: Locale; href: string }> {
  return LOCALES.map((locale) => ({ locale, href: ruta(locale, seccion, slug) }));
}

/**
 * La ruta anterior a D-049, para generar las redirecciones 301.
 *
 * Devuelve `null` cuando el segmento no cambió (es-MX, es-ES) — redirigir una
 * URL a sí misma es un bucle, y los servidores lo tratan como error.
 */
export function rutaAnterior(locale: Locale, seccion: Seccion, slug?: string): string | null {
  if (segmento(locale, seccion) === seccion) return null;
  const base = `/${locale}/${seccion}/`;
  return slug ? `${base}${slug}/` : base;
}

/** Invierte la tabla: de un segmento visto en una URL a su sección canónica. */
export function seccionDe(locale: Locale, seg: string): Seccion | null {
  const tabla = SEGMENTOS[locale];
  for (const clave of Object.keys(tabla) as Seccion[]) {
    if (tabla[clave] === seg) return clave;
  }
  return null;
}
