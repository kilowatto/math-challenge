/**
 * La explicación pregenerada. **El punto 1 de D-004**, que es el que se usa el
 * 95% de las veces: rápido, barato, sin alucinaciones, y funciona offline.
 *
 * ─── Qué hace, en una línea ────────────────────────────────────────────────
 *
 * Recibe **un veredicto ya calculado** y el diccionario del locale, y devuelve
 * las frases que se pintan. No hay red, no hay modelo, no hay estado, y no hay
 * una sola operación aritmética en todo el archivo.
 *
 * ─── La línea roja #7, hecha forma del código ──────────────────────────────
 *
 * *«Larry nunca avergüenza a un niño por equivocarse, y nunca calcula: recibe el
 * veredicto ya calculado y solo lo explica.»*
 *
 * El precedente con archivo y línea es `src/larry/contador/explain.ts:67-75` en
 * IOS (`mc-37`): *«Every number MUST appear verbatim in the provided JSON. Never
 * compute, convert, round, or invent a figure»*, a temperatura 0. Aquí ni
 * siquiera hay modelo al que pedírselo — pero la regla es la misma y se hace
 * cumplir de una manera más fuerte que un prompt: **este módulo no puede
 * calcular porque nunca recibe con qué**.
 *
 * `SobreParaLarry` es una **lista blanca escrita a mano**, no un tipo derivado
 * del ítem. Con un `Omit<Item, …>` un campo nuevo en `Item` viaja solo, y el día
 * que alguien agregue `item.pista` llega hasta aquí sin que nadie lo decida.
 * `sellarSobre()` copia campo por campo por la misma razón: un objeto que crece
 * en el Worker de ingesta no se cuela por un `...spread`.
 *
 * Lo que **jamás** entra al sobre, y por qué cada uno (los cuatro primeros
 * hacen la aritmética literalmente imposible):
 *
 *  · `enunciado.vars` — son los operandos. Sin operandos no hay nada que operar.
 *  · `respuesta.valor` — revelaría la respuesta con el intento todavía abierto
 *    («telling@k», `mc-11` §8). Si no se tiene, no se puede soltar.
 *  · `eleccion` — la `causa` ya nombra el error; el número que tocó el niño es
 *    un número más que se podría operar.
 *  · `errores[]` completo — nombraría errores que el niño no cometió. `mc-11` §5
 *    (Shute): el exceso de elaboración satura y perjudica.
 *  · `rtMs`, puntos, racha, liga, posición — cruzan dos líneas rojas a la vez.
 *    Con el tiempo, Larry acaba diciendo «tardaste un poco», que es el cronómetro
 *    por la puerta de atrás (D-024/D-045). Con puntos o comparación, el feedback
 *    se mueve al nivel «yo», que es el tercio de intervenciones que Kluger &
 *    DeNisi (607 tamaños de efecto) midió **empeorando** el desempeño.
 *  · `childProfileId` — línea roja #2 y D-037.
 *  · La **etiqueta** de la habilidad: viaja la CLAVE (`"K10"`), nunca el valor
 *    del diccionario — `HABILIDADES_KINDER.K10` es literalmente «descomponer
 *    (5 = 2+3)», o sea tres operandos y una igualdad servidos en bandeja.
 *
 * `audits/larry-nunca-calcula.mjs` hace cumplir las tres mitades: que la lista
 * blanca no crezca, que este archivo no nombre `Item`, y que no aparezca ni una
 * operación aritmética en ningún camino de explicación.
 *
 * ─── Ninguna clave cruda llega a una pantalla ──────────────────────────────
 *
 * Toda cadena sale del diccionario del locale. Si una clave falta, **no se
 * imprime la clave**: se cae al texto genérico ya autorado. Es la lección de
 * #349, donde un niño de cuatro años vio tres botones que decían `casilla3`,
 * `casilla0` y `casilla1` porque el único rótulo posible era el identificador.
 */

import type { Locale } from "./convenciones.ts";

/**
 * Los campos que Larry puede recibir. **Once, contados, y esta lista es la
 * frontera.**
 *
 * Está exportada porque `audits/larry-nunca-calcula.mjs` la lee: un campo nuevo
 * aquí es una decisión que se toma a la vista, no un `spread` que la toma sola.
 */
export const CAMPOS_DEL_SOBRE = [
  "acc",
  "causa",
  "razonAlterna",
  "inesperada",
  "habilidad",
  "materia",
  "pasos",
] as const;

/**
 * Un juicio POR PASO, **emitido por el motor** (D-074).
 *
 * La regla operativa de D-074, que es la que impide que esto se erosione: *«si
 * un dictamen puede cambiar la calificación, lo emite el motor. Si solo cambia
 * las palabras, lo emite Larry.»* Este tipo es el motor hablando; Larry solo
 * elige las palabras con las que se lee.
 */
export interface PasoJuzgado {
  /**
   * CLAVE de mensaje que NOMBRA el paso. Nunca una frase.
   *
   * «la columna de las unidades» se autora en los siete locales, igual que todo
   * lo demás. Escribirla aquí pondría texto de interfaz dentro del veredicto.
   */
  clave: string;
  /**
   * Lo que el motor dictaminó.
   *
   * **`null` no es «no sé todavía»: es «el motor NO PUEDE juzgar este paso»**, y
   * es el caso que D-074 §3 nombra. En una suma con reagrupación se puede
   * verificar por columna; en una integral doble, «paso» no tiene definición
   * mecánica. Donde el motor no puede, **Larry describe y no dictamina**.
   */
  juicio: "bien" | "mal" | null;
  /** La causa nombrada del paso. Solo tiene sentido con `juicio === "mal"`. */
  causa?: string | null;
}

/**
 * Qué se puede decir del procedimiento en cada materia (D-074).
 *
 * **El disparador es la MATERIA, no la banda.** Es la enmienda que el dueño hizo
 * el mismo día que tomó D-074: le pregunté «¿desde qué banda?» y contestó que no
 * es una pregunta de banda — aplica donde las matemáticas tienen procedimiento
 * que explicar, topología, cálculo avanzado, la hipótesis de Riemann. Un adulto
 * haciendo aritmética no lo necesita; un adolescente haciendo una demostración
 * sí. Encaja con D-066, que ya separa lo que es del ÍTEM de lo que es del PERFIL.
 */
export type ModoDeProcedimiento =
  /** No hay procedimiento que explicar. Contar patos no tiene pasos. */
  | "no_aplica"
  /**
   * El motor puede verificar cada paso de forma determinista y del lado del
   * servidor. Larry dice lo que el motor dictaminó, ni una palabra más.
   */
  | "juzgable"
  /**
   * Hay procedimiento, y el motor **no** puede juzgarlo mecánicamente. Larry
   * nombra los pasos y **no se pronuncia sobre ninguno**.
   *
   * Es la misma frontera que D-035 pone para la banda Pro: *«una explicación de
   * cálculo tensorial incorrecta enseña error»*. Aquí el error no lo enseñaría
   * un modelo alucinando — lo enseñaría este módulo repitiendo un dictamen que
   * el motor no tenía derecho a emitir.
   */
  | "describible";

/**
 * La tabla. Una materia que no esté aquí cae en `no_aplica`, y ese default es a
 * propósito: **la respuesta por defecto a pronunciarse sobre un procedimiento es
 * no**.
 */
export const PROCEDIMIENTO_POR_MATERIA: Record<string, ModoDeProcedimiento> = {
  // Kinder y aritmética suelta: el resultado ES el procedimiento.
  conteo: "no_aplica",
  subitizar: "no_aplica",
  comparacion: "no_aplica",
  aritmetica: "no_aplica",

  // Donde «paso» tiene definición mecánica y el motor la puede verificar.
  reagrupacion: "juzgable",
  division_larga: "juzgable",
  fracciones: "juzgable",
  ecuaciones_lineales: "juzgable",
  sistemas_lineales: "juzgable",
  factorizacion: "juzgable",
  derivadas: "juzgable",

  // Donde hay procedimiento y «paso» NO tiene definición mecánica.
  // Los tres primeros son literalmente los que el dueño nombró en D-074.
  topologia: "describible",
  calculo_avanzado: "describible",
  hipotesis_de_riemann: "describible",
  integrales_multiples: "describible",
  analisis_real: "describible",
  demostracion: "describible",
};

/**
 * Todo lo que Larry recibe. **Nada más que esto.**
 *
 * No hereda de `Item` ni de `VeredictoDeItem` a propósito: son tipos que crecen,
 * y este no debe crecer sin que alguien lo escriba a mano.
 */
export interface SobreParaLarry {
  /** El veredicto, ya calculado. Larry no lo revisa: lo explica. */
  acc: 0 | 1;
  /** La causa nombrada del error. CLAVE de mensaje, jamás una frase. */
  causa: string | null;
  /** D-048: por qué una respuesta alterna también valió. CLAVE de mensaje. */
  razonAlterna: string | null;
  /** Ni la correcta ni un error previsto. */
  inesperada: boolean;
  /** La CLAVE de la habilidad (`"K10"`), nunca su etiqueta. */
  habilidad: string;
  /** De qué materia es el ítem. Decide qué se puede decir del proceso (D-074). */
  materia?: string;
  /** Los juicios por paso, ya emitidos por el motor (D-074). */
  pasos?: PasoJuzgado[];
}

/** Un paso, ya convertido en la frase que se lee. */
export interface PasoExplicado {
  texto: string;
  /**
   * `true` si la frase afirma algo sobre la corrección del paso.
   *
   * Existe para que se pueda **comprobar** la frontera de D-074 §3 en vez de
   * confiar en ella: la prueba exige que en una materia `describible` esto sea
   * `false` en todos los pasos, venga lo que venga en el veredicto.
   */
  dictamina: boolean;
}

/** Lo que se pinta. Dos frases, y los pasos cuando la materia los admite. */
export interface Explicacion {
  /** Qué pasó. La primera frase. */
  titulo: string;
  /**
   * El siguiente paso. La segunda frase, y **nunca vacía en un fallo**.
   *
   * Shute (`mc-11` §5): un marcador desnudo —«mal», «incorrecto»— es de los
   * tipos de retroalimentación más pobres que se han medido. `audits/retro-completa.mjs`
   * ya exige que toda clave `error.*` sean exactamente dos frases; esto es esa
   * misma regla del lado del que las junta.
   */
  siguiente: string;
  /** De dónde salió el texto. Para telemetría de curaduría y para los auditores. */
  origen: "acierto" | "alterna" | "causa" | "inesperada";
  /** Los pasos, ya en palabras. Vacío cuando la materia no admite proceso. */
  pasos: PasoExplicado[];
  /**
   * `true` si algún paso se describió **sin** dictaminar (D-074 §3).
   *
   * No es adorno: es lo que permite que el panel del padre y la curaduría sepan
   * que hubo procedimiento que nadie juzgó, en vez de que esa ausencia se vea
   * igual que «todo bien».
   */
  describeSinDictaminar: boolean;
}

/** El diccionario de un locale, tal como vive en `apps/web/src/i18n/reto/*.json`. */
export type Mensajes = Record<string, unknown>;

/**
 * Los respaldos, en el único idioma que este paquete puede tener escrito.
 *
 * **No son traducción y no pretenden serlo.** Son la red para que una clave que
 * falte nunca acabe pintada como clave — el fallo de #349. `retro-completa.mjs`
 * es quien impide que se lleguen a usar: bloquea el commit si una causa del
 * banco no tiene texto en los siete locales.
 */
const RESPALDO = {
  acierto: "That's it.",
  titulo: "Not that one.",
  siguiente: "Try again, no rush.",
} as const;

/** Lee una cadena del diccionario, o `null`. Nunca devuelve la clave. */
function cadena(mensajes: Mensajes, clave: string): string | null {
  const v = mensajes[clave];
  if (typeof v === "string" && v.trim() !== "") return v;
  return null;
}

/**
 * Lee un par «qué pasó / siguiente paso», o `null`.
 *
 * Exige exactamente dos frases porque es el contrato que `retro-completa.mjs` ya
 * hace cumplir sobre los archivos. Un arreglo de una sola frase aquí sería un
 * marcador desnudo con otra forma.
 */
function par(mensajes: Mensajes, clave: string): [string, string] | null {
  const v = mensajes[clave];
  if (!Array.isArray(v) || v.length !== 2) return null;
  const [a, b] = v;
  if (typeof a !== "string" || typeof b !== "string") return null;
  if (a.trim() === "" || b.trim() === "") return null;
  return [a, b];
}

/** Mete el nombre del paso en la plantilla. Sustitución de texto, nada más. */
function conPaso(plantilla: string, nombre: string): string {
  return plantilla.split("{paso}").join(nombre);
}

/**
 * Copia **solo** los campos de la lista blanca.
 *
 * Toma un objeto cualquiera a propósito: lo que llega del Worker de ingesta es
 * un veredicto que puede crecer, y un `...bruto` haría que ese crecimiento
 * viajara hasta el prompt sin que nadie lo decidiera. Aquí no crece nada que no
 * esté escrito en `CAMPOS_DEL_SOBRE`.
 *
 * Y hay una consecuencia que conviene decir en voz alta: **este es el único
 * lugar donde algo entra al sobre**, así que es el único sitio donde hay que
 * mirar para saber qué sabe Larry.
 */
export function sellarSobre(bruto: Record<string, unknown>): SobreParaLarry {
  const pasos = Array.isArray(bruto.pasos)
    ? (bruto.pasos as unknown[]).flatMap((p): PasoJuzgado[] => {
        if (typeof p !== "object" || p === null) return [];
        const crudo = p as Record<string, unknown>;
        if (typeof crudo.clave !== "string" || crudo.clave.trim() === "") return [];
        const juicio =
          crudo.juicio === "bien" || crudo.juicio === "mal" ? crudo.juicio : null;
        return [
          {
            clave: crudo.clave,
            juicio,
            causa: typeof crudo.causa === "string" ? crudo.causa : null,
          },
        ];
      })
    : undefined;

  return {
    acc: bruto.acc === 1 ? 1 : 0,
    causa: typeof bruto.causa === "string" ? bruto.causa : null,
    razonAlterna: typeof bruto.razonAlterna === "string" ? bruto.razonAlterna : null,
    inesperada: bruto.inesperada === true,
    habilidad: typeof bruto.habilidad === "string" ? bruto.habilidad : "",
    materia: typeof bruto.materia === "string" ? bruto.materia : undefined,
    pasos,
  };
}

/**
 * Qué se puede decir del procedimiento de esta materia (D-074).
 *
 * Una materia desconocida —o ausente— cae en `no_aplica`. El default silencioso
 * es el prudente: no pronunciarse.
 */
export function modoDeProcedimiento(materia: string | undefined): ModoDeProcedimiento {
  if (!materia) return "no_aplica";
  return PROCEDIMIENTO_POR_MATERIA[materia] ?? "no_aplica";
}

/**
 * Compone la explicación. **Pura**: mismas entradas, mismas salidas, sin red,
 * sin modelo, sin reloj y sin estado.
 *
 * Que sea pura es lo que hace verdadero el criterio #137 —«funciona offline y
 * sin modelo»—: no hay nada que apagar. Se ejecuta igual en el Worker que en un
 * teléfono sin señal.
 */
export function componerExplicacion(sobre: SobreParaLarry, mensajes: Mensajes): Explicacion {
  const pasos = explicarPasos(sobre, mensajes);
  const describeSinDictaminar = pasos.some((p) => !p.dictamina);

  // ── Acertó ───────────────────────────────────────────────────────────────
  //
  // El texto de acierto es **confirmación, no elogio**, y no cambia con la
  // dificultad. Mueller & Dweck (`mc-11` §6): tras un fracaso posterior, el 92%
  // de quienes fueron elogiados por su esfuerzo eligió el problema más difícil,
  // contra el 33% de quienes fueron elogiados por su inteligencia. El afecto lo
  // cargan la animación y el sonido, que no pueden avergonzar a nadie.
  if (sobre.acc === 1) {
    const alterna = sobre.razonAlterna ? par(mensajes, sobre.razonAlterna) : null;
    if (alterna) {
      return {
        titulo: alterna[0],
        siguiente: alterna[1],
        origen: "alterna",
        pasos,
        describeSinDictaminar,
      };
    }
    // Una razón alterna sin texto autorado cae aquí, y cae en `acierto` a
    // propósito: `origen` dice de dónde salió la CADENA que se pintó, no qué
    // camino se intentó. Un `origen: "alterna"` sobre el texto genérico haría
    // que la curaduría contara razones alternas que nadie llegó a leer.
    return {
      titulo: cadena(mensajes, "acierto") ?? RESPALDO.acierto,
      siguiente: "",
      origen: "acierto",
      pasos,
      describeSinDictaminar,
    };
  }

  // ── Falló, y el autor previó ESE error ───────────────────────────────────
  //
  // Aquí está el valor entero de esta fase. La causa existe en el banco desde el
  // primer día —es regla de CLAUDE.md § Contenido— y hasta hoy la pantalla la
  // tiraba: quien fallaba leía «Esta vez no. Vamos a intentarlo otra vez.», que
  // es un marcador desnudo con buenos modales.
  const texto = sobre.causa ? par(mensajes, sobre.causa) : null;
  if (texto) {
    return {
      titulo: texto[0],
      siguiente: texto[1],
      origen: "causa",
      pasos,
      describeSinDictaminar,
    };
  }

  // ── Falló de una forma que nadie anticipó ────────────────────────────────
  //
  // No hay causa, así que no hay nada que explicar sin inventarlo. Y clasificar
  // el error no previsto queda descartado por construcción: para saber que el 12
  // salió de multiplicar 3 por 4 hay que multiplicar 3 por 4, y ese sería el
  // único camino por el que los operandos tendrían que entrar al sobre. La
  // excepción se comería la regla.
  //
  // **No es un caso raro en kinder**: 46 de los 185 ítems del banco tienen un
  // solo error nombrado, así que un niño que toca tres veces donde el ítem
  // esperaba una o dos cae aquí con un gesto perfectamente normal.
  const generico = par(mensajes, "inesperada");
  return {
    titulo: generico ? generico[0] : RESPALDO.titulo,
    siguiente: generico ? generico[1] : RESPALDO.siguiente,
    origen: "inesperada",
    pasos,
    describeSinDictaminar,
  };
}

/**
 * Los pasos, en palabras (D-074).
 *
 * Las tres reglas, y la tercera es la que el dueño decidió hoy:
 *
 *  1. `no_aplica` → **ni un paso**. Contar patos no tiene procedimiento, y
 *     fabricarle uno es re-enseñanza larga de material ya dominado, que `mc-11`
 *     §87 lista entre las formas contraproducentes de retroalimentación.
 *  2. `juzgable` → se dice lo que el motor dictaminó. Ni una palabra más.
 *  3. `describible` → **se describe y no se dictamina**, y el juicio que venga en
 *     el veredicto **se descarta aquí**. No es desconfianza del motor: es que si
 *     el motor emitió un dictamen sobre una materia donde «paso» no tiene
 *     definición mecánica, el dictamen está mal fundado, y repetirlo con la voz
 *     de Larry lo convierte en «tu procedimiento está mal» dicho a alguien que
 *     lo tenía bien. Es exactamente el riesgo que D-074 escribió.
 */
function explicarPasos(sobre: SobreParaLarry, mensajes: Mensajes): PasoExplicado[] {
  const modo = modoDeProcedimiento(sobre.materia);
  if (modo === "no_aplica") return [];
  if (!sobre.pasos || sobre.pasos.length === 0) return [];

  const plantillaBien = cadena(mensajes, "paso.bien");
  const plantillaMal = cadena(mensajes, "paso.mal");
  const plantillaSinJuicio = cadena(mensajes, "paso.sin_juicio");

  return sobre.pasos.flatMap((paso): PasoExplicado[] => {
    // El nombre del paso se autora por locale. Sin él no se pinta nada: pintar
    // `col.unidades` es el fallo de #349 otra vez, en otra pantalla.
    const nombre = cadena(mensajes, paso.clave);
    if (!nombre) return [];

    // Regla 3. El dictamen se descarta ANTES de mirarlo.
    if (modo === "describible") {
      if (!plantillaSinJuicio) return [];
      return [{ texto: conPaso(plantillaSinJuicio, nombre), dictamina: false }];
    }

    if (paso.juicio === "bien" && plantillaBien) {
      return [{ texto: conPaso(plantillaBien, nombre), dictamina: true }];
    }
    if (paso.juicio === "mal" && plantillaMal) {
      // La causa del paso, si la hay y si está autorada, es el «siguiente paso»
      // de ese renglón. Sin ella queda el nombre del paso y nada más — que es
      // pobre, pero es honesto.
      const detalle = paso.causa ? par(mensajes, paso.causa) : null;
      const base = conPaso(plantillaMal, nombre);
      return [{ texto: detalle ? `${base} ${detalle[1]}` : base, dictamina: true }];
    }
    // `juicio === null` dentro de una materia juzgable: el motor tuvo la
    // oportunidad y no pudo. Se describe, igual que en `describible`.
    if (!plantillaSinJuicio) return [];
    return [{ texto: conPaso(plantillaSinJuicio, nombre), dictamina: false }];
  });
}

/**
 * Azúcar para quien ya tiene el diccionario de los siete locales a mano.
 *
 * El `Locale` solo sirve para elegir el diccionario: **no entra en la
 * composición**. `mc-37` impl. 4 lo dice para el camino en vivo y vale igual
 * aquí — el locale se pasa como parámetro, jamás se infiere del texto.
 */
export function explicarEnLocale(
  sobre: SobreParaLarry,
  locale: Locale,
  catalogos: Record<string, Mensajes>,
): Explicacion {
  return componerExplicacion(sobre, catalogos[locale] ?? catalogos.en ?? {});
}
