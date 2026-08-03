/**
 * EL CAMINO EN VIVO — el punto 2 de D-004, enmendado por D-035 a Workers AI.
 *
 * F6 #136, `docs/planes/f6-larry-profe.md` §2.5, §5 y §6.1.
 *
 * ─── Qué es esto y qué NO es ───────────────────────────────────────────────
 *
 * Esto es el camino que se toma **solo** cuando la persona dice «no entendí» o
 * cuando el error no está catalogado. El camino del 95% de las veces sigue
 * siendo `packages/motor/src/explicacion.ts` — pregenerado, revisado por
 * humano, instantáneo, offline y gratis— y **este archivo no lo sustituye
 * nunca**: cuando algo aquí falla, lo que se sirve es aquél, sin aviso, sin
 * pantalla de error y sin hueco.
 *
 * Este módulo es **puro**. No importa ningún cliente de inferencia, no toca la
 * red y no lee ningún reloj. Decide qué se pide y juzga lo que vuelve; quien
 * llama al modelo es el endpoint. Componer y llamar son dos trabajos, y el que
 * se puede probar sin gastar dinero es éste — es la misma frontera que
 * `prefijo.ts` ya declara para el prefijo de sistema.
 *
 * ─── El sobre en vivo NO es un sobre nuevo ─────────────────────────────────
 *
 * `SobreEnVivo` **contiene** el sobre sellado por el motor, no lo copia. Esto
 * no es cosmética: si aquí hubiera una segunda lista blanca escrita a mano, las
 * dos podrían divergir, y la que se desincronizara sería justo la que va al
 * modelo. Con anidamiento hay **una sola puerta** —`sellarSobre()`, en el
 * motor— y este archivo no puede abrir otra: no sabe construir un
 * `SobreParaLarry`.
 *
 * Lo único que este camino añade es `disparador`, y es una unión cerrada de dos
 * valores. Un booleano no habría bastado: hay dos motivos distintos de llamada
 * y el prompt dice cosas distintas para cada uno.
 *
 * ─── La compuerta estructural, más fuerte aquí que en el plan ──────────────
 *
 * El plan §2.5 pide que «todo numeral de la salida esté verbatim en el sobre».
 * En este camino el sobre **no tiene ni un numeral**: lleva claves de mensaje,
 * un booleano y una unión cerrada. Aplicada literalmente, esa regla se convierte
 * en una más fuerte y más fácil de comprobar: **la salida no puede llevar NINGÚN
 * dígito**, porque no hay ninguno del que pudiera ser copia. Cualquier cifra que
 * aparezca la inventó el modelo, y eso es exactamente lo que la línea roja #7
 * prohíbe.
 *
 * ─── El hueco que esta compuerta NO cubre, dicho de frente ─────────────────
 *
 * **Las palabras-número.** «Vier minus eins ist fünf» no lleva un solo dígito y
 * pasa. El plan §3.4 ya lo nombra como hueco conocido y es peor justo donde más
 * cuesta: en alemán el veintiuno es una palabra invertida y en francés el
 * noventa son tres. Cerrarlo pide un léxico de palabras-número **autorado** por
 * los siete locales —contenido, no código, y CLAUDE.md § Contenido exige
 * revisión humana— así que aquí queda declarado y no fingido. Lo que sí lo
 * acota: en las bandas donde el camino en vivo está encendido por defecto la
 * causa ya viene nombrada, y el prompt no da ningún operando con el que
 * construir una cuenta falsa.
 */

import { sellarSobre, type SobreParaLarry } from "../../motor/src/explicacion.ts";
import { MATH_CONVENTIONS, type Locale } from "../../motor/src/convenciones.ts";
import { bandaDePrompt, type TemaVisual } from "./banda.ts";
import type { Banda } from "../../motor/src/puntuacion.ts";

/**
 * Por qué se está llamando al modelo. **Dos valores y ninguno más.**
 *
 * D-015 los nombra los dos: *«API en vivo cuando el niño pide más o comete un
 * error no catalogado»*. Que sea una unión cerrada es lo que impide que mañana
 * alguien meta aquí «tercer intento» — un contador de fallas con otro nombre,
 * que es lo que la pregunta P-4 del plan discute para el sobre pregenerado.
 */
export type Disparador = "no_entendi" | "no_catalogado";

export const DISPARADORES: readonly Disparador[] = ["no_entendi", "no_catalogado"] as const;

/**
 * Lo que viaja al modelo. **El sobre del motor, anidado, más el disparador.**
 *
 * `audits/larry-en-vivo.mjs` comprueba que este tipo tenga exactamente estas dos
 * propiedades: cualquier campo suelto al lado del sobre es un campo que se saltó
 * `sellarSobre()`.
 */
export interface SobreEnVivo {
  /** Sellado por el motor. La MISMA lista blanca, no una copia de ella. */
  sobre: SobreParaLarry;
  /** Por qué se llama. Cerrado a dos valores. */
  disparador: Disparador;
}

/**
 * La única forma de construir un sobre en vivo.
 *
 * Recibe el veredicto crudo —que llega por RPC del Worker de ingesta y puede
 * crecer sin que nadie aquí se entere— y lo pasa por `sellarSobre()`, que copia
 * campo por campo. Un disparador desconocido cae en `no_entendi`, que es el
 * caso que menos supone: pedir otra explicación de lo que ya se explicó.
 */
export function sellarEnVivo(bruto: Record<string, unknown>, disparador: unknown): SobreEnVivo {
  return {
    sobre: sellarSobre(bruto),
    disparador: disparador === "no_catalogado" ? "no_catalogado" : "no_entendi",
  };
}

/* ══════════════════════════════════════════════════════════════════════════
 * 1 · EL RUTEO DE MODELO POR COMPLEJIDAD (D-004 punto 3, D-035)
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Un modelo, con lo único que hace falta saber de él para decidir y para cobrar.
 *
 * Los precios están en **micro-dólares por millón de tokens** (µ$/M) y son
 * enteros a propósito: el medidor de gasto suma miles de veces y un `number` en
 * coma flotante acumula error justo en la dirección que nadie revisa. Salen de
 * D-035, que los verificó contra la cuenta, y no de una página de precios que
 * alguien recuerde.
 */
export interface Modelo {
  /** El identificador de Workers AI, tal cual. */
  id: string;
  /** µ$ por millón de tokens de entrada. */
  entrada: number;
  /** µ$ por millón de tokens de entrada **cacheada**, o `null` si no cachea. */
  cacheada: number | null;
  /** µ$ por millón de tokens de salida. El razonamiento se cobra aquí. */
  salida: number;
}

/**
 * Los dos modelos, con los precios de D-035.
 *
 * `gpt-oss-120b` no publica precio de entrada cacheada (`n/d` en la tabla de
 * D-035), y aquí eso es `null` y no `0`: un `0` haría que el medidor cobrara de
 * menos por algo que no sabe, que es el modo de falla que §5.4 del plan prohíbe.
 */
export const MODELOS = {
  chico: { id: "@cf/openai/gpt-oss-120b", entrada: 350_000, cacheada: null, salida: 750_000 },
  grande: { id: "@cf/moonshotai/kimi-k2.6", entrada: 950_000, cacheada: 160_000, salida: 4_000_000 },
} as const satisfies Record<string, Modelo>;

/**
 * Banda → modelo. **Es el punto 3 de D-004**, con los modelos que D-035 puso en
 * lugar de Haiku/Sonnet/Opus.
 *
 * Se indexa por `TemaVisual` y no por `Banda` por lo mismo que `BLOQUE_BANDA`:
 * `JR` comparte pantalla y dificultad con `PRO` (D-017), así que compartir
 * modelo es coherente y tener una sexta fila sería una tabla que divergiría.
 */
export const MODELO_POR_BANDA: Record<TemaVisual, Modelo> = {
  KINDER: MODELOS.chico,
  PRIMARIA: MODELOS.chico,
  SECUNDARIA: MODELOS.grande,
  SERIO: MODELOS.grande,
  PRO: MODELOS.grande,
};

/**
 * Cuántos tokens de salida se le presupuestan a cada banda.
 *
 * **Este número no es un tope de longitud: es un tope de RAZONAMIENTO.** D-035
 * hallazgo 1 lo midió en este repo: son modelos de razonamiento, el pensamiento
 * viaja en `reasoning_content` y consume el mismo presupuesto que la respuesta,
 * así que con un presupuesto corto **la respuesta llega vacía** con
 * `finish_reason: "length"`. El plan §5.4 nombra los ~500 tokens que dos diseños
 * proponían como «exactamente esa condición».
 *
 * Y hallazgo 3 del mismo D-035: se estimaron 1,200 tokens de salida por auditor
 * y se midieron 7,560, casi todo razonamiento — un error de 6.3×. Estas cifras
 * son por tanto `[estimado]` y **es lo primero que la medición de P-18 tiene que
 * corregir**. Lo que no es estimación es la consecuencia: el medidor de gasto
 * reserva el máximo de la banda ANTES de llamar, así que subir este número sube
 * el costo reservado y baja cuántas llamadas caben en el tope. Los dos números
 * se mueven juntos y eso es lo que impide que uno mienta sobre el otro.
 */
export const TOPE_TOKENS_SALIDA: Record<TemaVisual, number> = {
  KINDER: 1_500,
  PRIMARIA: 1_500,
  SECUNDARIA: 2_500,
  SERIO: 2_500,
  PRO: 4_000,
};

/**
 * Cuántos tokens de entrada se presupuestan como máximo, para poder reservar.
 *
 * El prefijo compuesto (CANON + locale + banda) más el mensaje de usuario. Se
 * mide en `en-vivo.prueba.mjs` contra los prefijos reales para que este número
 * no envejezca en silencio: si un bloque de locale crece por encima de esto, la
 * prueba bloquea y alguien decide, en vez de que el medidor cobre de menos.
 */
export const TOPE_TOKENS_ENTRADA = 3_000;

/** El modelo que le toca a una banda. `JR` usa el de `PRO`, como su bloque. */
export function modeloDe(banda: Banda | TemaVisual): Modelo {
  return MODELO_POR_BANDA[bandaDePrompt(banda as Banda)];
}

/* ══════════════════════════════════════════════════════════════════════════
 * 2 · EL MENSAJE DE USUARIO — claves, nunca cantidades
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * El sobre, escrito como el mensaje de usuario de la llamada.
 *
 * **No lleva un solo número.** Lleva claves de mensaje (`error.se_salto_uno`),
 * la clave de la habilidad (`K10`, nunca su etiqueta «descomponer (5 = 2+3)»), un
 * booleano y el disparador. El modelo no recibe con qué calcular, igual que el
 * camino pregenerado — es el mismo sobre, literalmente.
 *
 * Se escribe como líneas `CAMPO: valor` y no como JSON por una razón práctica:
 * el JSON invita a que alguien meta un objeto anidado nuevo «que no molesta», y
 * un renglón por campo hace que añadir uno se vea en el diff.
 */
export function mensajeDeUsuario(sobre: SobreEnVivo): string {
  const s = sobre.sobre;
  const lineas: string[] = [];

  lineas.push(`VERDICT: ${s.acc === 1 ? "right" : "wrong"}`);
  lineas.push(`NAMED CAUSE: ${s.causa ?? "none"}`);
  lineas.push(`ALTERNATE REASON: ${s.razonAlterna ?? "none"}`);
  lineas.push(`UNANTICIPATED: ${s.inesperada ? "yes" : "no"}`);
  lineas.push(`SKILL KEY: ${s.habilidad}`);
  lineas.push(`SUBJECT: ${s.materia ?? "none"}`);

  const pasos = s.pasos ?? [];
  if (pasos.length > 0) {
    lineas.push("STEPS AS THE ENGINE JUDGED THEM:");
    for (const paso of pasos) {
      const juicio = paso.juicio ?? "no ruling";
      lineas.push(`- ${paso.clave} — ${juicio}${paso.causa ? ` — ${paso.causa}` : ""}`);
    }
  }

  lineas.push(
    sobre.disparador === "no_entendi"
      ? "WHY YOU ARE BEING ASKED: the learner has already been given the written explanation " +
          "for this cause and asked for it another way. Say the same thing differently. Do not " +
          "add anything the verdict does not contain."
      : "WHY YOU ARE BEING ASKED: the answer given was neither right nor any anticipated mistake, " +
          "so there is no named cause. Do not work out what they did — you cannot, and guessing is " +
          "the failure. Re-teach the procedure of the skill and offer another go.",
  );

  return lineas.join("\n");
}

/* ══════════════════════════════════════════════════════════════════════════
 * 3 · LAS COMPUERTAS DE SALIDA — se descarta, nunca se filtra
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Cuántas frases admite cada banda.
 *
 * Sale de `BLOQUE_BANDA`, donde ya está escrito en prosa para el modelo («two
 * sentences in total», «three sentences at most»). Aquí está como número porque
 * una instrucción es una petición y una compuerta es una garantía: el prompt lo
 * pide, esto lo comprueba.
 */
export const TOPE_FRASES: Record<TemaVisual, number> = {
  KINDER: 2,
  PRIMARIA: 3,
  SECUNDARIA: 4,
  SERIO: 4,
  PRO: 6,
};

/** Un descarte, con la compuerta que lo produjo. Es lo que se cuenta. */
export interface Descarte {
  compuerta: "estructural" | "lexica" | "forma";
  porque: string;
}

/** Una construcción prohibida, ya compilada. Viene de `lexico.ts`. */
export interface ConstruccionProhibida {
  categoria: string;
  porque: string;
  re: RegExp;
}

/**
 * Los signos que **solo** pueden ser un operador, en cualquiera de los siete
 * locales.
 *
 * ─── Por qué esta lista no es la de `MATH_CONVENTIONS` ─────────────────────
 *
 * La primera versión de esta compuerta prohibía todos los signos que
 * `MATH_CONVENTIONS` reparte por locale — o sea `÷ × · :`— y **se midió contra
 * los 119 mensajes ya autorados y revisados**. Marcó 359 combinaciones, y la
 * causa era una sola: en `de-DE`, `fr-FR` y `pt-PT` la división se escribe con
 * **dos puntos**, y los dos puntos son puntuación corriente. El texto autorado
 * `«{paso}: dieser Schritt trägt.»` quedaba descartado por llevar un signo de
 * división que nadie escribió.
 *
 * Es exactamente el guardián ruidoso que el plan §3.3 ya había tenido que
 * corregir una vez en el CANON, y que D-032 nombra: *«la gente aprende a rodear
 * en silencio a un guardián que se equivoca»*. Así que la lista se acota a lo
 * que **nunca** es puntuación en ninguno de los siete idiomas.
 *
 * Lo que se pierde al quitar `:` no es nada: una división escrita con dos puntos
 * necesita cantidades a los lados, y la compuerta de dígitos ya no deja pasar
 * ninguna. La misma protección, sin el ruido.
 *
 * El menos es el U+2212 y **no el guion ASCII**, por la misma razón: el guion es
 * puntuación, y prohibirlo marcaría cualquier inciso.
 */
export const SIGNOS_INEQUIVOCOS = ["÷", "×", "·", "⋅", "∶", "=", "+", "−"] as const;

/**
 * Los signos de la tabla que sí se comprueban. Se cruza `MATH_CONVENTIONS` con
 * la lista de arriba en vez de escribir otra: si mañana entra un locale cuyo
 * signo de multiplicación sea `*`, aparece aquí solo, y si su signo es
 * puntuación, no aparece — que es la decisión correcta en los dos casos.
 */
export function operadoresDeCualquierLocale(): string[] {
  const signos = new Set<string>(SIGNOS_INEQUIVOCOS);
  for (const fila of Object.values(MATH_CONVENTIONS)) {
    if ((SIGNOS_INEQUIVOCOS as readonly string[]).includes(fila.division)) signos.add(fila.division);
    if ((SIGNOS_INEQUIVOCOS as readonly string[]).includes(fila.multiplication)) signos.add(fila.multiplication);
  }
  return [...signos];
}

/**
 * Juzga la salida del modelo. Devuelve los descartes; vacío es servible.
 *
 * **Las tres compuertas corren siempre y en este orden**, y ninguna filtra:
 * quien falla, falla entero. Filtrar deja una explicación mutilada cuyas frases
 * restantes referencian la que se quitó, y reparar es una segunda generación con
 * el mismo riesgo. El respaldo no es una versión degradada: es la explicación
 * revisada por humano de la misma causa, y pasa todas las compuertas por
 * construcción.
 *
 * **Cero reintentos, en ninguna compuerta** (plan §2.5, recomendación de P-13).
 * La prohibición ya estaba en el prompt: que la salida la cruce significa que el
 * prompt no sostuvo, y reintentar es pedirle otra vez que hable del niño.
 */
export function juzgarSalida(opciones: {
  texto: string;
  locale: Locale;
  banda: Banda | TemaVisual;
  lexico: ConstruccionProhibida[];
}): Descarte[] {
  const { texto, locale, lexico } = opciones;
  const tema = bandaDePrompt(opciones.banda as Banda);
  const descartes: Descarte[] = [];

  // ── 1 · Estructural ──────────────────────────────────────────────────────
  //
  // Ningún dígito. El sobre no tiene ni uno, así que cualquiera que aparezca lo
  // inventó el modelo — y una cifra inventada en un producto de matemáticas no
  // es un defecto de estilo, es otra respuesta (línea roja #7).
  const digito = texto.match(/\d/);
  if (digito) {
    descartes.push({
      compuerta: "estructural",
      porque:
        `la salida contiene el dígito «${digito[0]}» y el sobre no contiene ninguno. ` +
        "Larry nunca calcula: recibe el veredicto ya resuelto y solo elige palabras (línea roja #7).",
    });
  }

  // Un operador matemático, sea cual sea. La ficha de notación de este locale
  // dice cuál es el suyo, pero la regla aquí es más simple y más segura: en una
  // explicación sin cantidades no hay nada que operar, así que ninguno cabe.
  for (const signo of operadoresDeCualquierLocale()) {
    if (texto.includes(signo)) {
      descartes.push({
        compuerta: "estructural",
        porque:
          `la salida contiene el operador «${signo}». En ${locale} la notación la fija ` +
          "MATH_CONVENTIONS, y una explicación cuyo sobre no lleva cantidades no tiene nada que operar.",
      });
    }
  }

  // ── 2 · Léxica ───────────────────────────────────────────────────────────
  //
  // El MISMO léxico por locale que `audits/larry-nunca-averguenza.mjs` corre
  // sobre el texto pregenerado. No es una segunda lista: es la de
  // `packages/tutor/src/lexico/<locale>.json`, leída por los dos.
  for (const c of lexico) {
    if (c.re.test(texto)) {
      descartes.push({
        compuerta: "lexica",
        porque:
          `cae en la categoría \`${c.categoria}\` del léxico de ${locale}: ${c.porque}. ` +
          "Línea roja #7: Larry nunca avergüenza a un niño por equivocarse.",
      });
    }
  }

  // ── 3 · Forma ────────────────────────────────────────────────────────────
  if (texto.trim() === "") {
    descartes.push({
      compuerta: "forma",
      porque:
        "la salida está vacía. Es el caso que D-035 hallazgo 1 nombra: el razonamiento se comió " +
        "el presupuesto y volvió `finish_reason: \"length\"`. Se sirve la pregenerada.",
    });
  }

  const frases = texto
    .split(/[.!?…]+/u)
    .map((f) => f.trim())
    .filter((f) => f !== "");
  if (frases.length > TOPE_FRASES[tema]) {
    descartes.push({
      compuerta: "forma",
      porque:
        `${frases.length} frases y la banda ${tema} admite ${TOPE_FRASES[tema]}. Shute (\`mc-11\` §5): ` +
        "el exceso de elaboración satura la memoria de trabajo y perjudica. Una explicación más " +
        "larga no es una explicación más amable.",
    });
  }

  return descartes;
}

/* ══════════════════════════════════════════════════════════════════════════
 * 4 · LOS INTERRUPTORES — Pro se queda en pregenerada sin desplegar
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Qué bandas tienen camino en vivo. **Un interruptor, no un despliegue.**
 *
 * D-035 puso una condición a la banda Pro y hay que poder cumplirla sin tocar
 * código: *«antes de que exista, hay tiempo de medir `kimi-k2.6` contra un banco
 * de explicaciones avanzadas revisadas por humano. Si no pasa, la salida no es
 * volver a Claude —es no soltar la banda Pro con explicación en vivo— y dejarla
 * con explicación pregenerada»*. Esta tabla es el valor por defecto; el valor
 * efectivo se lee de `math-challenge-config-kv` en cada petición, así que
 * apagar Pro —o encenderla el día que pase la evaluación— es escribir una
 * llave, no compilar y desplegar.
 *
 * **Los dos apagados por defecto, con su razón:**
 *
 *  · **KINDER** — es la recomendación (a) de la pregunta P-1 del plan, que sigue
 *    abierta. Cuatro de los seis diseños de F6 dicen que kinder no tiene modelo
 *    en vivo nunca. Y hay un argumento que no depende de la respuesta: en kinder
 *    el niño no lee, **escucha**, y una línea generada en vivo no se puede
 *    pregrabar (§4.1: la voz es pregenerada por latencia, por offline y por
 *    revisión). Un texto en vivo en kinder es un texto que nadie va a oír.
 *  · **PRO** — la condición de D-035, todavía sin medir.
 *
 * `JR` no aparece: comparte fila con `PRO`, igual que comparte bloque de prompt.
 */
export const EN_VIVO_POR_DEFECTO: Record<TemaVisual, boolean> = {
  KINDER: false,
  PRIMARIA: true,
  SECUNDARIA: true,
  SERIO: true,
  PRO: false,
};

/** La llave de `CONFIG_KV` donde vive la anulación. Una sola, con todas. */
export const LLAVE_INTERRUPTORES = "larry:en-vivo";

/**
 * Mezcla la tabla por defecto con lo que diga la configuración.
 *
 * Falla hacia **lo que el código dice**, no hacia encendido: una configuración
 * ilegible deja los valores por defecto, y los valores por defecto son los
 * conservadores. Un interruptor que se abre solo cuando su almacén falla es el
 * modo de falla de D-032 —seis auditores fallando abiertos sin que nadie lo
 * supiera— aplicado a un modelo que le habla a un niño.
 */
export function interruptores(crudo: unknown): Record<TemaVisual, boolean> {
  const salida: Record<TemaVisual, boolean> = { ...EN_VIVO_POR_DEFECTO };
  if (!crudo || typeof crudo !== "object") return salida;
  for (const [clave, valor] of Object.entries(crudo as Record<string, unknown>)) {
    if (clave in salida && typeof valor === "boolean") {
      salida[clave as TemaVisual] = valor;
    }
  }
  return salida;
}

/**
 * ¿Se llama al modelo? Cinco condiciones, todas necesarias.
 *
 * Se devuelve el motivo cuando la respuesta es no, y no un booleano pelado:
 * el motivo es lo que se cuenta en telemetría, y sin él «no se llamó» y «se
 * llamó y se descartó» se ven igual — que es exactamente cómo la capa en vivo
 * puede volverse decorativa sin que nadie lo note (plan §7.2).
 */
export function decidirLlamada(opciones: {
  banda: Banda | TemaVisual;
  interruptores: Record<TemaVisual, boolean>;
  /** El peldaño de gasto, ya calculado por `gasto.ts`. */
  peldano: "P0" | "P1" | "P2" | "P3";
  disparador: Disparador;
  /** `false` cuando el interruptor automático por tasa de descarte está abierto. */
  paseDelInterruptorAutomatico: boolean;
  /** Cuántos toques lleva este ítem. El límite estructural del plan §5.5. */
  toquesEnEsteItem: number;
}): { llama: boolean; motivo: string } {
  const tema = bandaDePrompt(opciones.banda as Banda);

  if (!opciones.interruptores[tema]) {
    return { llama: false, motivo: `interruptor:${tema}` };
  }
  if (!opciones.paseDelInterruptorAutomatico) {
    return { llama: false, motivo: "interruptor_automatico" };
  }
  // El limitador que no es un número, sino una regla de esquema: el botón vive
  // colgado de un ítem recién calificado y admite dos toques. Convierte
  // «distinguir curiosidad de abuso» de un problema de heurística en uno de
  // esquema — el patrón que D-027 usó con los clubs y D-028 con las prendas.
  if (opciones.toquesEnEsteItem > TOQUES_POR_ITEM) {
    return { llama: false, motivo: "toques_por_item" };
  }
  // P2 y P3 no llaman. La degradación se mueve hacia contenido humano revisado,
  // nunca hacia un modelo más débil que improvise: eso la hace MÁS segura bajo
  // presión, no menos.
  if (opciones.peldano === "P2" || opciones.peldano === "P3") {
    return { llama: false, motivo: `peldano:${opciones.peldano}` };
  }
  // En P1 solo sobrevive el error no catalogado, que es el único caso donde no
  // hay texto revisado por humano que servir en su lugar.
  if (opciones.peldano === "P1" && opciones.disparador !== "no_catalogado") {
    return { llama: false, motivo: "peldano:P1" };
  }
  return { llama: true, motivo: "en_vivo" };
}

/**
 * Dos toques por ítem, y el botón solo existe colgado de un ítem recién
 * calificado.
 *
 * **Y la cota que esto da NO es la que parecía.** «Dos por ítem» no está acotado
 * por veinticinco ítems al día: D-018 define FLUIDEZ como veinte a treinta ítems
 * seguidos y D-016 da hasta noventa minutos a los doce-diecisiete. Dos retos de
 * fluidez son ciento veinte llamadas elegibles sin nada anómalo. El límite
 * estructural es necesario y **no es suficiente** — el que acota de verdad es el
 * tope de `gasto.ts`.
 */
export const TOQUES_POR_ITEM = 2;
