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

/**
 * Los formatos de kinder, todos de tocar — nunca arrastrar, doble-toque ni
 * sacudir el dispositivo (`mc-20`: los tres gestos que más fallan a los
 * 4-6 años). Los cinco primeros son el banco original (plan §9); los trece
 * siguientes son Mundo Kinder multi-bioma
 * (`docs/planes/2026-08-09-mundo-kinder-multi-bioma.md` §2-3): cada
 * habilidad conserva su formato original y gana dos de estos nuevos, mismo
 * contenido numérico con un gesto distinto (`mc-02`, enseñanza con
 * variación china). El gesto #16 del plan (tap-and-hold) NO está aquí a
 * propósito: es solo pista opcional, nunca un formato calificado.
 */
export type Formato =
  | "toca_la_respuesta"
  | "toca_para_contar"
  | "flash"
  | "arma_el_numero"
  | "cual_sobra"
  | "tap_secuencia"
  | "toca_para_reventar"
  | "toca_origen_destino"
  | "desliza_con_tope"
  | "compara_y_toca"
  | "toca_para_clasificar"
  | "empareja_tocando"
  | "toca_el_ritmo"
  | "toca_hasta_el_objetivo"
  | "traza_el_camino"
  | "toca_para_fusionar"
  | "toca_para_incrementar"
  | "toca_el_blanco_movil";

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

/**
 * Cómo se DIBUJA una opción que no es un número.
 *
 * ─── Por qué esto existe, con la fecha ─────────────────────────────────────
 *
 * El 2026-08-02 el dueño jugó «¿Cuál no va con los demás?» en su teléfono y la
 * pantalla le ofreció tres botones que decían `casilla3`, `casilla0` y
 * `casilla1` (#349). No era un fallo de traducción: eran los identificadores
 * internos de las posiciones, servidos como texto de botón a alguien de cuatro
 * a seis años que **no sabe leer**.
 *
 * La causa no estaba en la pantalla. Estaba aquí: un ítem podía tener una
 * respuesta con valor de cadena y **ninguna manera de decir cómo se ve**. Quien
 * pintara ese ítem no tenía más remedio que imprimir el valor, y el valor es un
 * identificador.
 *
 * `dibujos` cierra ese hueco: **si la opción no es un número, el ítem tiene que
 * decir qué se dibuja y cómo se llama**. `validarItem` lo exige, así que un ítem
 * con opciones-identificador ya no entra al banco.
 *
 * La regla de fondo, que vale más allá de kinder: **la opción es la cosa, no su
 * identificador.** En «cuál sobra» lo que se toca es la figura; en «de qué lado
 * hay más» lo que se toca es el montón.
 */
export interface OpcionDibujada {
  /**
   * CLAVE de mensaje para el nombre accesible. Nunca una frase.
   *
   * No es el rótulo visible del botón —quien juega ve la figura, no la
   * palabra— pero un lector de pantalla necesita decir algo, y «botón» cuatro
   * veces seguidas no es decir algo.
   */
  clave: string;
  /** El glifo que se dibuja. Se repite `cuantos` veces. */
  glifo: string;
  /** Cuántas veces se repite el glifo. Por omisión 1. */
  cuantos?: number;
  /**
   * Se dibuja más grande que las demás.
   *
   * En K13 el tamaño no es adorno: es la segunda respuesta defendible de D-048
   * —«sobra ésa porque es la más grande»— y si no se dibuja, esa respuesta no
   * se puede dar.
   */
  grande?: boolean;
}

export interface Item {
  id: string;
  rama?: string;
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
   * Cómo se dibuja cada opción, indexado por su valor **como cadena**.
   *
   * Obligatorio para toda opción cuyo valor no sea un número: ver
   * `OpcionDibujada` y la comprobación de `validarItem`.
   */
  dibujos?: Record<string, OpcionDibujada>;
  /**
   * El propósito, y son **los cinco de Swan** (`mc-36`), no texto libre.
   *
   * Un enum y no una cadena porque «cálculo pelón» no es un propósito que
   * alguien escriba: es lo que queda cuando el campo admite cualquier cosa y
   * alguien pone «practicar sumas». Con cinco opciones cerradas, elegir obliga a
   * decidir qué clase de tarea es, que es justo lo que `mc-36` pide.
   */
  proposito: Proposito;
  contexto?: string;
  /**
   * La variación respecto al ítem anterior, como ESTRUCTURA (`mc-02`).
   *
   * Tres campos y los tres obligatorios: qué **varía**, qué se mantiene
   * **constante**, y **por qué**. La enseñanza con variación china cambia una
   * cosa a la vez a propósito, y el `por_que` es lo que distingue una variación
   * decidida de dos ítems que casualmente se parecen.
   *
   * **La tercera opción no se puede expresar.** «Toma N ítems al azar del nivel»
   * no cabe en este esquema: no hay dónde escribir qué varía si nadie lo
   * decidió. Esa imposibilidad es el punto — un campo opcional se rellena con
   * `"aleatorio"` y el problema vuelve.
   */
  variacion: Variacion | null;
}

/**
 * Los cinco tipos de tarea de Malcolm Swan (`mc-36`).
 *
 * No son etiquetas: cada uno produce una actividad distinta. Un banco entero de
 * `calcular` es exactamente el «cálculo pelón» que la investigación dice que no
 * enseña transferencia.
 */
export type Proposito =
  /** Clasificar objetos matemáticos: ¿qué tienen en común, cuál sobra? */
  | "clasificar"
  /** Interpretar representaciones múltiples: el mismo 7 como puntos, marco y número. */
  | "interpretar"
  /** Evaluar afirmaciones: ¿es cierto que sumar siempre da más? */
  | "evaluar"
  /** Crear problemas: inventa uno que dé 7. */
  | "crear"
  /** Analizar razonamientos: ¿por qué contó mal? */
  | "analizar";

export const PROPOSITOS: Proposito[] = ["clasificar", "interpretar", "evaluar", "crear", "analizar"];

export interface Variacion {
  /** Qué cambia respecto al ítem anterior. */
  varia: string;
  /** Qué se mantiene igual — la mitad que casi siempre se olvida. */
  constante: string;
  /** Por qué ESE cambio enseña algo. Sin esto, es azar con nombre. */
  por_que: string;
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

  // La respuesta. Sin ella no hay nada que calificar — y las comprobaciones de
  // abajo no pueden ni comparar. El `?.` es deliberado: esta función se ejecuta
  // sobre filas de `item_bank`, que D-072 permite editar a mano, y su contrato
  // es devolver problemas, NUNCA lanzar sobre entrada rota.
  if (item.respuesta == null || item.respuesta.valor === undefined || item.respuesta.valor === null) {
    p.push("sin `respuesta.valor`. Un ítem sin respuesta no se puede calificar (plan §9).");
  }

  if (!item.errores || item.errores.length === 0) {
    p.push(
      "sin `errores` con causa nombrada. Un ítem así solo sabe decir «mal», y entonces " +
        "Larry no puede explicar nada (CLAUDE.md § Contenido, línea roja #7).",
    );
  }
  for (const e of item.errores ?? []) {
    if (!e.causa || e.causa.trim() === "") p.push(`un error sin causa nombrada (valor ${e.valor})`);
    if (item.respuesta != null && String(e.valor) === String(item.respuesta.valor)) {
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

  if (!PROPOSITOS.includes(item.proposito)) {
    p.push(
      `propósito "${item.proposito}" no es uno de los cinco de Swan ` +
        `(${PROPOSITOS.join(", ")}). mc-36: sin uno de esos, es cálculo pelón.`,
    );
  }

  // La variación, como estructura y con sus tres campos.
  //
  // `!= null` a propósito: `undefined` también cuenta como ausente. Con
  // `!== null`, un ítem mal formado venido de fuera —una fila de `item_bank`
  // editada a mano, que D-072 permite— reventaba esta función con un
  // TypeError en vez de devolver la lista de problemas, y un validador que
  // lanza sobre entrada rota falla justo donde más se le necesita.
  if (item.variacion != null) {
    for (const campo of ["varia", "constante", "por_que"] as const) {
      if (!item.variacion[campo] || String(item.variacion[campo]).trim() === "") {
        p.push(
          `variacion.${campo} vacío. mc-02 exige los tres: qué varía, qué se mantiene ` +
            "constante y por qué. Sin el `por_que`, es azar con nombre.",
        );
      }
    }
  }

  for (const c of item.tambienCorrectas ?? []) {
    if (!c.razon || c.razon.trim() === "") {
      p.push(`una respuesta alterna sin razón escrita (valor ${c.valor}) — D-048 exige la razón`);
    }
  }

  // ── Ninguna opción se presenta como su identificador (#349) ───────────────
  //
  // Un valor numérico se escribe con la convención del locale y se lee: un `7`
  // es un 7 en los siete. Un valor de CADENA no: `casilla3` es la clave interna
  // de una posición, y servida como rótulo de botón le pide leer —y descifrar—
  // a quien no sabe leer.
  //
  // Por eso la regla no es «no uses cadenas»: las cadenas son la forma correcta
  // de decir «se toca la tercera figura». La regla es que el ítem diga **qué se
  // dibuja** en su lugar. Sin `dibujos`, el único rótulo posible es el
  // identificador, y eso ya pasó en producción.
  for (const v of opcionesDeItem(item)) {
    if (typeof v === "number") continue;
    const dib = item.dibujos?.[String(v)];
    if (!dib || !dib.glifo || !dib.clave) {
      p.push(
        `la opción "${v}" no es un número y no tiene \`dibujos["${v}"]\` con glifo y clave. ` +
          "Una opción de cadena sin dibujo solo se puede pintar como su identificador, y eso " +
          "es lo que le sirvió `casilla3` a un niño de cuatro años (#349). La opción es la " +
          "COSA, no su clave.",
      );
      continue;
    }
    if (/\s/.test(dib.clave)) {
      p.push(
        `dibujos["${v}"].clave = "${dib.clave}" no parece una clave de mensaje. El nombre ` +
          "accesible se autora en los siete locales, no se escribe aquí (D-022).",
      );
    }
  }

  return p;
}

/**
 * Todos los valores que pueden acabar siendo un botón: la correcta, las
 * alternas de D-048 y los distractores con causa.
 *
 * Existe como función y no en línea porque `presentarItem` arma exactamente
 * esta misma lista, y dos listas se separan. Que la validación mire justo lo
 * que la pantalla va a pintar es la mitad de que la validación sirva.
 */
export function opcionesDeItem(item: Item): Array<number | string> {
  return [
    // `?.`: también se la llama desde `validarItem` sobre ítems rotos, y ahí
    // su trabajo es ayudar a LISTAR el problema, no reventar con otro.
    ...(item.respuesta != null ? [item.respuesta.valor] : []),
    ...(item.errores ?? []).map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((c) => c.valor),
  ];
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
