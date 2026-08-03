/**
 * EL LÉXICO DE VERGÜENZA — una sola lista por locale, leída por los dos caminos.
 *
 * F6 #133 y #136, `docs/planes/f6-larry-profe.md` §2.4.
 *
 * ═══ Por qué se movió aquí desde `audits/` ════════════════════════════════
 *
 * Las siete listas nacieron en `audits/lib/lexico-verguenza/` porque su único
 * lector era `audits/larry-nunca-averguenza.mjs`, que juzga el texto
 * **pregenerado**. Con el camino en vivo hay un segundo lector, y ése corre
 * **dentro del Worker**: la compuerta léxica de `en-vivo.ts` tiene que juzgar lo
 * que el modelo acaba de decir, antes de que lo lea nadie.
 *
 * Se movieron en vez de copiarse. Una segunda lista se desincroniza en el primer
 * cambio, y el síntoma sería la peor versión posible del problema: una
 * construcción prohibida que el auditor caza en el texto revisado y **deja pasar
 * en el texto generado**, que es justo el que nadie leyó antes de publicarlo.
 * Los JSON no se tocaron al mover — es un `git mv`, no una reescritura.
 *
 * El auditor sigue siendo su otro lector y ahora apunta aquí. Que el producto sea
 * dueño de la lista y el auditor la lea, y no al revés, es también la dirección
 * correcta de la dependencia: un Worker no debe empaquetar `audits/`.
 *
 * ═══ Este módulo no importa ningún JSON ═══════════════════════════════════
 *
 * Recibe los documentos ya leídos, igual que `validarCatalogo` recibe el
 * catálogo de bloques de locale. La razón está escrita en
 * `prefijo.prueba.mjs:7`: los JSON de `apps/web` se importan con la sintaxis de
 * Vite, que Node en ESM no acepta sin atributo de tipo. Manteniendo la lectura
 * fuera, el mismo módulo lo usan el Worker (que importa con Vite) y las pruebas
 * (que leen del disco) sin dos caminos que puedan divergir.
 *
 * ═══ Lo que estas listas SON y lo que no ══════════════════════════════════
 *
 * Son un **cable trampa, no un juez**. «No todos nacemos para los números» es
 * atribución de rasgo fijo pura y no contiene ni una palabra de ninguna lista, en
 * ningún idioma. Ese hueco lo cubren la revisión humana por locale (D-022) y la
 * carta adversarial `anti-humillacion`, que corre a mano y cuesta dinero.
 *
 * Y lo que se prohíbe es una **construcción**, no una palabra: `es-ES` sirve
 * «Inténtalo otra vez, sin prisa» y `de-DE` «Versuch es noch einmal, in Ruhe».
 * Prohibir «otra vez» marcaría las dos, mientras que «otra vez te equivocaste»,
 * que sí humilla, es la misma palabra en otra construcción. Las construcciones no
 * se traducen — por eso son siete archivos y no una lista traducida siete veces.
 */

import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";
import type { ConstruccionProhibida } from "./en-vivo.ts";

/** La forma de un archivo de `packages/tutor/src/lexico/<locale>.json`. */
export interface ArchivoDeLexico {
  locale: string;
  construcciones: Array<{ categoria: string; patron: string; porque: string }>;
}

/** El directorio, para que ni el auditor ni las pruebas vuelvan a teclear la ruta. */
export const DIRECTORIO_LEXICO = "packages/tutor/src/lexico";

/**
 * Compila las construcciones de un documento.
 *
 * `iu` — insensible a mayúsculas y con semántica Unicode, exactamente las mismas
 * banderas que el auditor. Si las dos compilaciones divergieran, el mismo texto
 * se juzgaría distinto en el commit y en producción, que es la clase de
 * diferencia que nadie encuentra leyendo.
 *
 * Un patrón que no compila **se descarta y se cuenta como problema**, no se
 * ignora: `validarLexico` lo devuelve. Tragarlo dejaría una construcción
 * silenciosamente sin vigilar.
 */
export function compilarLexico(doc: unknown): ConstruccionProhibida[] {
  const d = doc as ArchivoDeLexico | null;
  if (!d || !Array.isArray(d.construcciones)) return [];
  const salida: ConstruccionProhibida[] = [];
  for (const c of d.construcciones) {
    try {
      salida.push({ categoria: c.categoria, porque: c.porque, re: new RegExp(c.patron, "iu") });
    } catch {
      // Lo reporta `validarLexico`. Aquí no se lanza porque una excepción en el
      // camino de la compuerta dejaría sin explicación a quien la pidió.
    }
  }
  return salida;
}

/**
 * Compila los siete. Devuelve un mapa completo, con `[]` donde falte.
 *
 * El vacío **no es un permiso**: el llamador tiene que tratar «sin
 * construcciones» como «no se puede juzgar» y no servir la salida del modelo.
 * Que un locale llegue a producción sin lista lo impide `larry-nunca-averguenza`
 * mucho antes, bloqueando el commit.
 */
export function compilarCatalogo(catalogo: Partial<Record<Locale, unknown>>): Record<Locale, ConstruccionProhibida[]> {
  const salida = {} as Record<Locale, ConstruccionProhibida[]>;
  for (const locale of LOCALES) salida[locale] = compilarLexico(catalogo[locale]);
  return salida;
}

/**
 * Valida el catálogo entero. Devuelve los problemas; vacío es verde.
 *
 * Falla CERRADO, como `validarCatalogo`: un léxico que no se puede leer es un
 * problema, no un silencio. De ocho auditores que esperaban su fase, seis
 * fallaban abiertos sin que nadie lo supiera (D-032), y ése es exactamente el
 * fallo que una lista vacía reproduce — vigilando nada, en verde.
 */
export function validarLexico(catalogo: Partial<Record<Locale, unknown>>): string[] {
  const problemas: string[] = [];

  for (const locale of LOCALES) {
    const doc = catalogo[locale] as ArchivoDeLexico | undefined;
    if (!doc) {
      problemas.push(
        `falta ${DIRECTORIO_LEXICO}/${locale}.json. Sin lista, ese locale no está vigilado — ni en el ` +
          "texto pregenerado ni en la compuerta del camino en vivo. Y una lista global traducida no " +
          "sirve: lo que se prohíbe es una construcción, y las construcciones no se traducen.",
      );
      continue;
    }
    if (!Array.isArray(doc.construcciones) || doc.construcciones.length === 0) {
      problemas.push(`${locale}: el léxico no tiene ninguna construcción — es una lista vacía vigilando`);
      continue;
    }
    for (const [i, c] of doc.construcciones.entries()) {
      if (typeof c?.patron !== "string" || typeof c?.categoria !== "string" || typeof c?.porque !== "string") {
        problemas.push(`${locale}: la construcción ${i + 1} no tiene \`categoria\`, \`patron\` y \`porque\``);
        continue;
      }
      try {
        new RegExp(c.patron, "iu");
      } catch (e) {
        problemas.push(`${locale}: la construcción ${i + 1} no compila como expresión regular: ${String(e).slice(0, 60)}`);
      }
    }
  }

  return problemas;
}
