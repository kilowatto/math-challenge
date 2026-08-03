/**
 * El contrato del bloque de LOCALE: siete campos obligatorios, siete archivos.
 *
 * F6 #134, `docs/planes/f6-larry-profe.md` §3.2 y §3.5, D-022, `mc-34`, `mc-37`.
 *
 * ─── Qué hace que añadir un locale no sea duplicar todo ────────────────────
 *
 * Añadir el octavo locale es: escribir **un** archivo JSON con estos siete
 * campos, y añadir su fila a `MATH_CONVENTIONS`. Nada más. No se toca el CANON,
 * no se tocan los cinco bloques de banda, y no se edita ningún archivo de otro
 * locale. Esa es la prueba de que el patrón «cada línea escrita dos veces»
 * quedó fuera: en aquel patrón, añadir un idioma era editar cada línea del
 * prompt.
 *
 * ─── Por qué el texto se AUTORA y no se traduce ────────────────────────────
 *
 * CLAUDE.md § Idiomas lo dice del contenido matemático y aquí aplica igual: en
 * alemán el veintiuno es una palabra invertida y en francés el noventa son tres
 * palabras. Un bloque de locale traducido del inglés le enseña al modelo a
 * hablar del número como si el número se dijera igual en todas partes.
 *
 * Y no es hipótesis en portugués: los mensajes ya autorados en `pt-BR.json` y
 * `pt-PT.json` difieren en casi todos por persona verbal y clítico, no por
 * ortografía. Un bloque `pt` con dos variantes cortas encima produciría un
 * prompt que se contradice a sí mismo en cada oración de ejemplo.
 *
 * ─── Lo que este archivo NO define ─────────────────────────────────────────
 *
 * El mensaje de usuario. El sobre que le llega a Larry con el veredicto ya
 * calculado es de #132, y vive fuera de este paquete. Aquí solo se compone el
 * PREFIJO de sistema.
 */

import { LOCALES, type Locale } from "../../motor/src/convenciones.ts";

/**
 * Un ejemplo autorado. Dos campos y ninguno opcional.
 *
 * `situacion` describe en una línea qué llegó (en el idioma del locale, para
 * que el ejemplo se lea entero como una pieza y no como una plantilla); `larry`
 * es exactamente lo que Larry diría. Su verdad de referencia son los mensajes
 * ya autorados en `apps/web/src/i18n/reto/*.json`, que ya pasaron por criterio
 * nativo y ya están en el producto: eso hace que Larry en vivo suene como Larry
 * pregenerado, que es el requisito real — el niño no sabe cuál de los dos
 * caminos le respondió.
 */
export interface EjemploAutorado {
  situacion: string;
  larry: string;
}

/** Los siete campos. Ninguno opcional, ninguno con valor por defecto. */
export interface BloqueLocale {
  /** El nombre del idioma en el propio idioma. El CANON no puede nombrarlo. */
  idiomaNombre: string;
  /** El compromiso de idioma, escrito EN ese idioma. */
  compromisoDeIdioma: string;
  /** Trato, persona verbal, clíticos, registro. Lo que separa pt-BR de pt-PT. */
  registro: string;
  /** Los riesgos de palabra-número de esta lengua, dichos como riesgo. */
  palabrasNumero: string;
  /** Lo que avergüenza EN ESTA LENGUA. No es la traducción de la lista inglesa. */
  nuncaDigas: string[];
  /** Tres, autorados, no compartidos con ningún otro locale. */
  ejemplos: EjemploAutorado[];
  /** Cómo se cierra un turno en esta lengua sin sonar a despedida de folleto. */
  cierre: string;
}

/** Los campos, como datos, para que la validación no los vuelva a teclear. */
export const CAMPOS_OBLIGATORIOS = [
  "idiomaNombre",
  "compromisoDeIdioma",
  "registro",
  "palabrasNumero",
  "nuncaDigas",
  "ejemplos",
  "cierre",
] as const;

/** Cuántos ejemplos. Ni dos ni cuatro: la cifra está en el plan §3.6. */
export const EJEMPLOS_POR_LOCALE = 3;

/**
 * Los pares que comparten idioma y NO comparten contenido.
 *
 * Es la comprobación que convierte D-022 en algo mecánico: si los ejemplos de
 * `es-MX` y los de `es-ES` fueran idénticos, alguien copió el archivo, y el
 * producto tendría seis autores y una copia.
 */
export const PARES_QUE_NO_SE_COMPARTEN: ReadonlyArray<readonly [Locale, Locale]> = [
  ["es-MX", "es-ES"],
  ["pt-BR", "pt-PT"],
];

export type CatalogoLocales = Partial<Record<Locale, unknown>>;

/**
 * Valida el catálogo entero. Devuelve los problemas; vacío es verde.
 *
 * Falla CERRADO: un catálogo que no se puede leer es un problema, no un
 * silencio. La razón está en el propio repo — de ocho auditores que esperaban
 * su fase, seis fallaban abiertos sin que nadie lo supiera.
 */
export function validarCatalogo(catalogo: CatalogoLocales): string[] {
  const problemas: string[] = [];

  for (const locale of LOCALES) {
    if (!(locale in catalogo)) {
      problemas.push(
        `falta el bloque de locale \`${locale}\`. D-022: son siete locales, no cinco idiomas — ` +
          "un locale sin bloque es un niño al que Larry le habla en el idioma de otro.",
      );
    }
  }

  for (const clave of Object.keys(catalogo)) {
    if (!(LOCALES as readonly string[]).includes(clave)) {
      problemas.push(
        `\`${clave}\` no es uno de los siete locales. Un bloque suelto se compone igual que ` +
          "cualquier otro y nadie lo revisa, porque no está en ninguna lista.",
      );
    }
  }

  for (const [locale, bloque] of Object.entries(catalogo)) {
    if (!bloque || typeof bloque !== "object") {
      problemas.push(`${locale}: el bloque no es un objeto`);
      continue;
    }
    const b = bloque as Record<string, unknown>;

    for (const campo of CAMPOS_OBLIGATORIOS) {
      if (!(campo in b)) {
        problemas.push(`${locale}: falta el campo obligatorio \`${campo}\``);
        continue;
      }
      const valor = b[campo];
      if (typeof valor === "string" && valor.trim() === "") {
        problemas.push(`${locale}: \`${campo}\` está vacío`);
      }
    }

    if (Array.isArray(b.nuncaDigas)) {
      if (b.nuncaDigas.length === 0) {
        problemas.push(
          `${locale}: \`nuncaDigas\` está vacío. Lo que avergüenza en una lengua no es la ` +
            "traducción de lo que avergüenza en otra (línea roja #7).",
        );
      }
    } else if ("nuncaDigas" in b) {
      problemas.push(`${locale}: \`nuncaDigas\` tiene que ser un arreglo`);
    }

    if (Array.isArray(b.ejemplos)) {
      if (b.ejemplos.length !== EJEMPLOS_POR_LOCALE) {
        problemas.push(
          `${locale}: ${b.ejemplos.length} ejemplo(s), y el contrato pide ${EJEMPLOS_POR_LOCALE}.`,
        );
      }
      for (const [i, ej] of b.ejemplos.entries()) {
        const e = ej as Record<string, unknown>;
        if (!e || typeof e.situacion !== "string" || typeof e.larry !== "string") {
          problemas.push(`${locale}: el ejemplo ${i + 1} no tiene \`situacion\` y \`larry\``);
          continue;
        }
        if (e.situacion.trim() === "" || e.larry.trim() === "") {
          problemas.push(`${locale}: el ejemplo ${i + 1} tiene un campo vacío`);
        }
      }
    } else if ("ejemplos" in b) {
      problemas.push(`${locale}: \`ejemplos\` tiene que ser un arreglo`);
    }
  }

  // --- Los pares que comparten idioma no comparten texto --------------------
  for (const [a, z] of PARES_QUE_NO_SE_COMPARTEN) {
    const ba = catalogo[a] as BloqueLocale | undefined;
    const bz = catalogo[z] as BloqueLocale | undefined;
    if (!ba || !bz || !Array.isArray(ba.ejemplos) || !Array.isArray(bz.ejemplos)) continue;

    const iguales = ba.ejemplos
      .map((e) => e.larry)
      .filter((frase) => bz.ejemplos.some((o) => o.larry === frase));

    if (iguales.length > 0) {
      problemas.push(
        `${a} y ${z} comparten ${iguales.length} frase(s) de ejemplo idénticas — p. ej. ` +
          `«${iguales[0].slice(0, 50)}». Comparten idioma y NO comparten contenido (D-022): ` +
          "lo que los separa es la persona verbal y el clítico, que es el 100% de lo que hace " +
          "un tutor. Una frase idéntica en los dos significa que se copió un archivo.",
      );
    }

    if (ba.registro === bz.registro) {
      problemas.push(
        `${a} y ${z} declaran el MISMO registro. Si de verdad fuera el mismo, serían un ` +
          "locale y no dos — y `MATH_CONVENTIONS` ya dice que no lo son.",
      );
    }
  }

  return problemas;
}
