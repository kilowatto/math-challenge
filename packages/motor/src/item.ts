/**
 * El ítem: estructura, jamás texto ya formado.
 *
 * Es la regla de CLAUDE.md § Contenido y del plan maestro §9, y no es una
 * preferencia de esquema. Un ítem guardado como `"¿Cuántos patos hay? 3 + 4"`
 * está atado a un idioma, a una notación decimal y a un contexto; guardado como
 * estructura, el mismo ítem se sirve en los siete locales, con el separador
 * decimal de cada uno (`mc-34`) y con el contexto que el reto elija.
 *
 * **`errores` es lo que hace útil a Larry.** Sin ese arreglo, el sistema sabe
 * que el niño falló. Con él sabe QUÉ hizo — multiplicó en vez de sumar, restó al
 * revés, contó el primero dos veces — y Larry puede explicar el error concreto
 * en vez de decir «inténtalo otra vez». La línea roja #7 dice que Larry nunca
 * avergüenza y **nunca calcula**: recibe el veredicto ya resuelto y solo lo
 * explica. Este archivo produce ese veredicto.
 */

import type { Locale } from "./convenciones.ts";

/** Los cinco formatos de kinder, todos de tocar (plan §9). */
export type Formato =
  | "toca_la_respuesta"
  | "toca_para_contar"
  | "flash"
  | "arma_el_numero"
  | "cual_sobra";

/**
 * Un error con causa nombrada.
 *
 * `causa` es una CLAVE de mensaje, no una frase. Traducirla aquí pondría texto
 * de interfaz en el banco de ítems, que es el segundo lugar donde una cadena
 * puede quedarse vieja.
 */
export interface ErrorNombrado {
  valor: number | string;
  causa: string;
}

/**
 * El enunciado, como clave y variables. Nunca como texto.
 *
 * `vars` alimenta la plantilla del locale. Un `3` aquí se escribe `3` en los
 * siete; un `3.5` se escribe `3,5` en cinco de ellos y `3.5` en dos, y eso lo
 * resuelve `numeros.ts` al pintar, no el banco.
 */
export interface Enunciado {
  clave: string;
  vars: Record<string, number | string>;
}

export interface Item {
  id: string;
  /** La habilidad de la escalera: K01…K14 en kinder (plan §9). */
  habilidad: string;
  /** 1 a 12, la escalera de D-017. */
  nivel: number;
  formato: Formato;
  enunciado: Enunciado;
  /**
   * La respuesta correcta. `tol` es la tolerancia numérica: 0 en kinder, donde
   * todo es conteo exacto.
   */
  respuesta: { valor: number | string; tol: number };
  /**
   * **Obligatorio y no vacío.** Un ítem sin errores con causa nombrada es un
   * ítem que solo sabe decir «mal», y `audits/` bloquea por eso.
   */
  errores: ErrorNombrado[];
  /**
   * Respuestas ADICIONALES que también valen 1 (D-048).
   *
   * Existe por «cuál sobra»: «sobra el 8 porque es par» y «sobra el 9 porque no
   * está en la tabla del 2» son las dos buen razonamiento. Un motor que compare
   * contra una sola respuesta enseña a adivinar lo que el autor pensaba.
   */
  tambienCorrectas?: Array<{ valor: number | string; razon: string }>;
  /**
   * El propósito del reto y su apertura (`mc-36`).
   *
   * `proposito` dice qué se aprende; `contexto` es la situación. Un ítem sin los
   * dos es cálculo pelón, que es lo que `mc-36` documenta que no engancha ni
   * enseña transferencia.
   */
  proposito: string;
  contexto?: string;
  /**
   * El eje de variación respecto al ítem anterior de su serie (`mc-02`).
   *
   * La enseñanza con variación china cambia **una** cosa a la vez y a propósito.
   * `null` solo se acepta en el primero de una serie.
   */
  variacion: string | null;
}

/** Lo que el servidor devuelve tras calificar. Larry recibe esto, no calcula. */
export interface VeredictoDeItem {
  acc: 0 | 1;
  /** La causa nombrada, si la respuesta coincide con un error conocido. */
  causa: string | null;
  /** La razón por la que una respuesta alterna también vale (D-048). */
  razonAlterna: string | null;
  /** `true` si la respuesta no es la correcta NI un error previsto. */
  inesperada: boolean;
}

/**
 * Califica una respuesta contra el ítem, nombrando la causa.
 *
 * Tres resultados posibles y los tres importan:
 *
 *  · **Correcta** — la esperada, o una de las `tambienCorrectas` de D-048.
 *  · **Error previsto** — coincide con una entrada de `errores`, y se devuelve
 *    su causa para que Larry explique ESE error.
 *  · **Inesperada** — falló de una forma que el autor no anticipó. Se marca, y
 *    esa marca es material de curaduría: un ítem con muchas respuestas
 *    inesperadas tiene un `errores` incompleto (`mc-40` documenta que los
 *    modelos son malos anticipando errores reales, y esta es la señal que lo
 *    detecta en producción).
 *
 * **Nunca lanza por una respuesta rara.** Un niño puede tocar cualquier cosa;
 * el motor no se cae por eso.
 */
export function calificarRespuesta(item: Item, eleccion: number | string): VeredictoDeItem {
  const igual = (a: number | string, b: number | string) => {
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= item.respuesta.tol;
    return String(a) === String(b);
  };

  if (igual(eleccion, item.respuesta.valor)) {
    return { acc: 1, causa: null, razonAlterna: null, inesperada: false };
  }

  // D-048: toda elección autorada vale acierto.
  const alterna = item.tambienCorrectas?.find((c) => igual(eleccion, c.valor));
  if (alterna) {
    return { acc: 1, causa: null, razonAlterna: alterna.razon, inesperada: false };
  }

  const previsto = item.errores.find((e) => igual(eleccion, e.valor));
  if (previsto) {
    return { acc: 0, causa: previsto.causa, razonAlterna: null, inesperada: false };
  }

  return { acc: 0, causa: null, razonAlterna: null, inesperada: true };
}

/**
 * Comprueba que un ítem esté bien formado antes de entrar al banco.
 *
 * Devuelve la lista de problemas; vacía significa válido. Se usa desde el
 * auditor y desde cualquier guion de importación — un ítem mal formado que entra
 * al banco se descubre cuando un niño lo ve.
 */
export function validarItem(item: Item): string[] {
  const p: string[] = [];

  if (!Number.isInteger(item.nivel) || item.nivel < 1 || item.nivel > 12) {
    p.push(`nivel ${item.nivel} fuera de la escalera 1..12 de D-017`);
  }

  if (!item.errores || item.errores.length === 0) {
    p.push(
      "sin `errores` con causa nombrada. Un ítem así solo sabe decir «mal», y entonces " +
        "Larry no puede explicar nada (CLAUDE.md § Contenido, línea roja #7).",
    );
  }
  for (const e of item.errores ?? []) {
    if (!e.causa || e.causa.trim() === "") p.push(`un error sin causa nombrada (valor ${e.valor})`);
    if (String(e.valor) === String(item.respuesta.valor)) {
      p.push(`el error ${e.valor} es igual a la respuesta correcta`);
    }
  }

  // El enunciado es estructura, no texto. Una `clave` con espacios es una frase
  // disfrazada de clave, y es exactamente como se cuela el texto ya formado.
  if (!item.enunciado?.clave || /\s/.test(item.enunciado.clave)) {
    p.push(
      `enunciado.clave "${item.enunciado?.clave}" no parece una clave de mensaje. El ítem se ` +
        "guarda como estructura, jamás como texto ya formado (plan §9).",
    );
  }

  if (!item.proposito || item.proposito.trim() === "") {
    p.push("sin `proposito`: es cálculo pelón, y mc-36 documenta que eso no enseña transferencia");
  }

  for (const c of item.tambienCorrectas ?? []) {
    if (!c.razon || c.razon.trim() === "") {
      p.push(`una respuesta alterna sin razón escrita (valor ${c.valor}) — D-048 exige la razón`);
    }
  }

  return p;
}

/**
 * ¿El enunciado tiene plantilla en todos los locales?
 *
 * No comprueba que la traducción sea buena — comprueba que exista. Un ítem cuya
 * clave falta en `de-DE` se sirve en alemán con la cadena cruda o con un hueco,
 * y eso solo se ve mirando esa pantalla en ese idioma.
 */
export function localesQueFaltan(
  item: Item,
  mensajes: Record<Locale, Record<string, unknown>>,
): Locale[] {
  return (Object.keys(mensajes) as Locale[]).filter((l) => !(item.enunciado.clave in mensajes[l]));
}
