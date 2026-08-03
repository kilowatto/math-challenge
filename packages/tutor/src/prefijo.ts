/**
 * El compositor: CANON → LOCALE → BANDA. Una función, treinta y cinco prefijos.
 *
 * F6 #134, `docs/planes/f6-larry-profe.md` §3.1 y §3.7.
 *
 * ─── El orden no es estético ───────────────────────────────────────────────
 *
 * Va de menos volátil a más volátil, porque la caché de prefijo casa por
 * prefijo literal de tokens. Con este orden, editar un bloque de banda invalida
 * cinco cachés; con el orden intuitivo —locale primero, «porque es lo que
 * define la voz»— editar cualquier cosa volátil invalidaría todo lo que va
 * detrás.
 *
 * ─── La llave de caché nunca lleva al niño ─────────────────────────────────
 *
 * `larry|<locale>|<banda>`. Catorce llaves en el MVP (siete locales × KINDER y
 * PRIMARIA), treinta y cinco en la escalera completa. **Jamás por perfil del
 * niño:** cada niño pagaría el prefijo frío en su primera explicación —el peor
 * momento posible— y además metería el identificador de un menor en una
 * cabecera HTTP hacia un proveedor de inferencia (línea roja #2, D-037).
 *
 * ─── Qué NO compone esta función ───────────────────────────────────────────
 *
 * El mensaje de usuario. El sobre con el veredicto ya calculado es de #132 y
 * vive fuera de este paquete; aquí se produce el prefijo de sistema y nada más.
 * Y esta función no llama a ningún modelo: no importa ningún cliente de
 * inferencia y no debe hacerlo nunca. Componer y llamar son dos trabajos, y el
 * que se puede probar sin gastar dinero es este.
 */

import { CANON } from "./canon.ts";
import { BLOQUE_BANDA, ORDEN_TEMAS, bandaDePrompt, type TemaVisual } from "./banda.ts";
import { fichaDeNotacion } from "./notacion.ts";
import type { BloqueLocale } from "./catalogo.ts";
import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";
import type { Banda } from "../../motor/src/puntuacion.ts";

/**
 * Las bandas del MVP: los dos peldaños de abajo de la escalera.
 *
 * Se **derivan** de `ORDEN_TEMAS` en vez de escribirse como lista propia, y no
 * es cosmética: `audits/tabla-bandas.mjs` bloqueó la primera versión de este
 * archivo por declarar `["KINDER", "PRIMARIA"]` a mano, y tenía razón. Dos
 * tablas de bandas divergentes no producen un error — producen un niño colocado
 * en un sitio por el servidor al que la interfaz le enseña otro.
 *
 * Kinder está aplazada por D-073, no cancelada: sigue siendo un peldaño y sigue
 * necesitando su prefijo.
 */
export const BANDAS_DEL_MVP: TemaVisual[] = ORDEN_TEMAS.slice(0, 2);

export interface PrefijoCompuesto {
  /** El texto entero, listo para ir como mensaje de sistema. */
  texto: string;
  /** `larry|<locale>|<banda>`. Sin nada del niño dentro. */
  llave: string;
  /** Las tres capas por separado, para poder hashearlas y auditarlas sueltas. */
  capas: { canon: string; locale: string; banda: string };
}

/**
 * Compone el bloque de locale a partir del texto autorado más la ficha
 * generada.
 *
 * La ficha va **al final** del bloque: es la parte que cambia cuando cambia
 * `MATH_CONVENTIONS`, y el texto autorado por una persona es lo que casi nunca
 * cambia. Mismo criterio que el orden de las capas, un nivel más abajo.
 */
export function componerBloqueLocale(locale: Locale, bloque: BloqueLocale): string {
  const nunca = bloque.nuncaDigas.map((linea) => `- ${linea}`).join("\n");
  const ejemplos = bloque.ejemplos
    .map((e, i) => `${i + 1}. ${e.situacion}\n   → ${e.larry}`)
    .join("\n");

  return [
    `LANGUAGE — ${bloque.idiomaNombre}`,
    bloque.compromisoDeIdioma,
    "",
    "REGISTER",
    bloque.registro,
    "",
    "NUMBER WORDS IN THIS LANGUAGE",
    bloque.palabrasNumero,
    "",
    "NEVER, IN THIS LANGUAGE",
    nunca,
    "",
    "HOW A TURN ENDS",
    bloque.cierre,
    "",
    "WORKED EXAMPLES, WRITTEN BY A NATIVE AUTHOR FOR THIS LOCALE",
    ejemplos,
    "",
    fichaDeNotacion(locale),
  ].join("\n");
}

/**
 * El prefijo entero.
 *
 * Lanza si el bloque de locale falta. Es a propósito: seguir con dos capas de
 * tres produciría un prompt sin compromiso de idioma, y un modelo sin
 * compromiso de idioma responde en el idioma del CANON — que es inglés, a un
 * niño alemán de seis años que no lee.
 */
export function componerPrefijo(opciones: {
  locale: Locale;
  banda: Banda | TemaVisual;
  bloque: BloqueLocale;
}): PrefijoCompuesto {
  const { locale, bloque } = opciones;
  const tema = bandaDePrompt(opciones.banda as Banda);

  if (!(LOCALES as readonly string[]).includes(locale)) {
    throw new Error(`locale desconocido: "${locale}" (D-022: son siete, y están en LOCALES)`);
  }
  const bloqueBanda = BLOQUE_BANDA[tema];
  if (!bloqueBanda) throw new Error(`sin bloque de banda para "${tema}"`);

  const capaLocale = componerBloqueLocale(locale, bloque);

  return {
    texto: [CANON, capaLocale, bloqueBanda].join("\n\n---\n\n"),
    llave: llaveDePrefijo(locale, tema),
    capas: { canon: CANON, locale: capaLocale, banda: bloqueBanda },
  };
}

/** `larry|<locale>|<banda>`, y nada más. */
export function llaveDePrefijo(locale: Locale, tema: TemaVisual): string {
  return `larry|${locale}|${tema}`;
}

/**
 * Las llaves que existen. Treinta y cinco en la escalera completa; catorce si se
 * pide solo el MVP.
 */
export function llavesDePrefijo(soloMvp = false): string[] {
  const bandas = soloMvp ? BANDAS_DEL_MVP : ORDEN_TEMAS;
  return LOCALES.flatMap((locale) => bandas.map((tema) => llaveDePrefijo(locale, tema)));
}

/**
 * Hash determinista de un prefijo — FNV-1a de 32 bits.
 *
 * Para qué: un PR que toca `de-DE` debe mover **exactamente** las llaves de
 * `de-DE` y ninguna otra; uno que toca el CANON las mueve todas. El hash
 * **detecta; no convoca a nadie** — que un cambio al CANON lo revisen los siete
 * autores es una regla social y va en el PR, no en una función.
 *
 * FNV-1a y no una función criptográfica porque esto no protege de un
 * adversario: distingue «cambió» de «no cambió» en texto que un humano escribió,
 * corre en el Worker sin dependencias y cabe en diez líneas.
 */
export function hashDePrefijo(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}
