/**
 * El mapa de progreso — una CAPA DE LECTURA, no una fuente de verdad (#231).
 *
 * Módulo PURO, mismo contrato que `puntuacion.ts`, `historia.ts` y
 * `cosmeticos.ts`: recibe estado ya calculado por quien lo posee, devuelve la
 * forma que hay que pintar. No toca la red, ni el reloj, ni la base.
 *
 * ─── Lo que más importa de este archivo: NO tiene tabla ────────────────────
 *
 * El criterio de #231 es literal: *«El código del mapa no escribe ningún campo
 * de "progreso por habilidad" en una tabla propia de F7 — solo lee de F4/F3»*.
 * La razón no es de estilo. Un mapa con su propia copia del progreso es una
 * segunda fuente de verdad, y dos fuentes de verdad no divergen con un error:
 * divergen en silencio, y el síntoma es un padre que ve «dominado» en el mapa
 * y al niño fallando la misma habilidad en el reto.
 *
 * De dónde sale cada cosa, y de quién es:
 *
 *   · `skill_state`      → F4, por `(child_profile_id, habilidad)`, en [0,1].
 *                          **[contrato asumido]** — ver `EntradaDeHabilidad`.
 *   · `EstadoHistoria`   → F3, `historia.ts`, ya existe.
 *   · `total_xp`         → subsistema de XP (D-055), `xp_totals`.
 *   · `current_streak`   → subsistema de racha (D-016/D-079), `child_streak`.
 *
 * Este archivo no calcula ninguno de los cuatro. Los compone.
 *
 * ─── Las tres formas son tres PRODUCTOS, no un skin ────────────────────────
 *
 * `mc-43` §8 no dice «pinta el progreso»; dice qué forma toma en cada edad, y
 * las tres son incompatibles a propósito:
 *
 *   KINDER              → un camino físico con el compañero avanzando, **sin
 *                         un solo número**. El usuario no lee (D-019).
 *   PRIMARIA/SECUNDARIA → un árbol de habilidades por temas nombrados, **sin
 *                         aristas de prerrequisito** — el campo no existe en
 *                         `skills` (F5 §4.8 bloqueo 10), y dibujar una flecha
 *                         que el esquema no puede respaldar es prometer una
 *                         funcionalidad sin dato detrás.
 *   SERIO/JR/PRO        → cifras planas de dominio. Un adulto que aprende no
 *                         quiere una mascota saludándolo (`mc-23`).
 *
 * ─── El número de nivel no sale de aquí. Por construcción ──────────────────
 *
 * D-017 y el criterio #100: **el número de nivel no se enseña a nadie.**
 * `mc-10` mide que la presión de rendimiento empeora el desempeño en
 * matemáticas, y «Nivel 3» es esa presión en dos sílabas.
 *
 * `construirArbol()` recibe el nivel de cada habilidad porque lo necesita para
 * agrupar, y **no lo devuelve**: el grupo sale con un `orden` correlativo
 * (1, 2, 3…) que sirve para ordenar y no significa nada. Así, ninguna plantilla
 * puede imprimir el número de nivel aunque quiera — no lo tiene.
 *
 * `audits/mapa-sin-numero-de-nivel.mjs` lo hace cumplir por dos vías
 * independientes (D-070): mira los tipos por dentro, y EJECUTA el módulo para
 * comprobar que ningún objeto devuelto lleva el nivel de entrada.
 *
 * ─── Lo que este módulo NO hace ────────────────────────────────────────────
 *
 *  · No escribe. Ninguna función de aquí acepta una conexión, un `env` ni un
 *    SQL, y no hay una sola cadena `INSERT`/`UPDATE`/`CREATE TABLE`.
 *  · No calcula pericia con cortes propios: llama a `ejemploSegunPericia()` de
 *    `serie.ts`. Ver `periciaDe()`.
 *  · No habla. Aquí no vive un solo texto de cara al usuario: las etiquetas son
 *    claves i18n que resuelve la plantilla (misma regla que `cosmeticos.ts`).
 *  · No sabe de misiones (F7/C) ni de ligas (F7/D). El tablero deja el hueco
 *    tipado y vacío en vez de inventar su contenido.
 */

import { ejemploSegunPericia } from "./serie.ts";
import type { TemaVisual } from "./bandas.ts";

/* ────────────────────────────────────────────────────────────────────────────
 * La forma del mapa
 * ──────────────────────────────────────────────────────────────────────────*/

/** Las tres formas de `mc-43` §8. No hay una cuarta y no hay una genérica. */
export type FormaDeMapa = "sendero" | "arbol" | "tablero";

/**
 * Tema visual → forma del mapa.
 *
 * `TemaVisual` excluye `JR` a propósito (ver `bandas.ts`): JR y PRO comparten
 * pantalla, así que comparten forma. Es un `Record` completo y no un `switch`
 * con `default` para que añadir un tema visual a D-017 rompa la compilación
 * aquí en vez de caer callado en «tablero».
 */
export const FORMA_POR_TEMA: Readonly<Record<TemaVisual, FormaDeMapa>> = Object.freeze({
  KINDER: "sendero",
  PRIMARIA: "arbol",
  SECUNDARIA: "arbol",
  SERIO: "tablero",
  PRO: "tablero",
});

export function formaDeMapa(tema: TemaVisual): FormaDeMapa {
  return FORMA_POR_TEMA[tema];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Pericia — los cortes son los de `serie.ts`, no unos nuevos
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * Los tres estados de una habilidad. Nombres, nunca números.
 *
 * El criterio de #231 pide que se reusen «literalmente» los cortes 0.2/0.6/1.0
 * de `ejemploSegunPericia()` y que no se redefinan con otro corte. La forma más
 * literal de reusarlos no es copiarlos: es **llamar a la función**. Por eso
 * `periciaDe()` no contiene ni un `0.2` ni un `0.6`, y por eso el día que
 * `serie.ts` mueva un corte el mapa se mueve con él sin que nadie se acuerde.
 *
 * `dominada` es el tramo por encima de 0.6 y llega hasta 1.0, que es el techo
 * de `skill_state` — no un cuarto corte. Se dice porque el issue nombra tres
 * números y aquí solo hay tres tramos.
 */
export type Pericia = "asomando" | "en_camino" | "dominada";

/** La clave i18n de cada pericia. El texto vive en los siete locales, no aquí. */
export const CLAVE_DE_PERICIA: Readonly<Record<Pericia, string>> = Object.freeze({
  asomando: "mapaPericiaAsomando",
  en_camino: "mapaPericiaEnCamino",
  dominada: "mapaPericiaDominada",
});

/**
 * De `skill_state` a pericia, pasando por `serie.ts`.
 *
 * `ejemploSegunPericia()` devuelve cuánto ejemplo trabajado hace falta: 1 (todo)
 * abajo del primer corte, 0.5 en medio, 0 arriba. Es exactamente la partición
 * que el mapa necesita, leída al revés: quien necesita el ejemplo entero es
 * quien apenas asoma.
 */
export function periciaDe(skillState: number): Pericia {
  const ejemplo = ejemploSegunPericia(skillState);
  if (ejemplo === 1) return "asomando";
  if (ejemplo === 0.5) return "en_camino";
  return "dominada";
}

/**
 * Lo que F4 tiene que exponer para que el mapa exista. **[contrato asumido]**
 *
 * F4 (`math-challenge-learner-do`) todavía no tiene código. El criterio de #231
 * pide que quede escrito qué interfaz se está asumiendo, para que quien la
 * construya sepa qué firmar — y que si no existe, el mapa se arme contra un
 * stub declarado y **nunca contra datos inventados que parezcan reales**.
 *
 * El método asumido es:
 *
 *     estadoDeHabilidades(perfilId: string): Promise<EntradaDeHabilidad[]>
 *
 * con `skillState` en `[0,1]` — el mismo número que `armarSerie()` ya consume
 * como `pericia`, no otro. `nivel` sale de la tabla `skills` (F5) y **solo se
 * usa para agrupar**: no viaja al modelo de vista.
 */
export interface EntradaDeHabilidad {
  /** El `skill_id` real, p. ej. `K07`. Nunca un texto de cara al usuario. */
  readonly habilidad: string;
  /** N1…N12 de D-017. Se usa para agrupar y **no se devuelve**. */
  readonly nivel: number;
  /** `skill_state` de F4, en `[0,1]`. */
  readonly skillState: number;
  /**
   * Cómo se llama el tema en la pantalla, ya resuelto por quien tiene el
   * catálogo. `null` mientras no exista contenido para esa habilidad — el
   * componente pinta el identificador solo si es `null`, y eso se ve.
   */
  readonly rotulo: string | null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * KINDER — el sendero de la Sabana (#232)
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * Un lugar de la Sabana, y en qué punto está.
 *
 * **Sin un solo campo numérico**, y eso es el criterio de #232, no una
 * casualidad: si el modelo de vista no tiene un porcentaje, ninguna plantilla
 * puede pintarlo por descuido. El niño de cuatro años no lee (D-019).
 */
export interface LugarDelSendero {
  /** El id del lugar, uno por habilidad de kinder (D-019). */
  readonly lugar: string;
  readonly estado: "por_visitar" | "en_curso" | "terminado";
  /** Dónde está el compañero. Exactamente uno del sendero lo tiene en `true`. */
  readonly aqui: boolean;
}

export interface Sendero {
  readonly forma: "sendero";
  readonly lugares: readonly LugarDelSendero[];
}

/**
 * Arma el sendero a partir de `EstadoHistoria` (F3), que ya existe.
 *
 * @param orden    los lugares de la Sabana en el orden en que se recorren. Los
 *                 14 son presupuesto de D-019/F5; F7 no autora ni uno.
 * @param fases    `lugar → fase` de `EstadoHistoria`. Un lugar ausente es un
 *                 lugar al que el niño no ha llegado, que es distinto de uno
 *                 empezado — y por eso no se rellena con un valor por defecto.
 *
 * El compañero se planta en el primer lugar sin terminar. Si están todos
 * terminados se queda en el último: no existe un estado «fuera del mapa».
 */
export function construirSendero(
  orden: readonly string[],
  fases: Readonly<Record<string, string>>,
): Sendero {
  let plantado = false;
  const lugares: LugarDelSendero[] = [];

  for (let i = 0; i < orden.length; i++) {
    const lugar = orden[i];
    const fase = fases[lugar];
    const estado =
      fase === "terminado" ? "terminado" : fase === undefined ? "por_visitar" : "en_curso";

    const aqui = !plantado && estado !== "terminado";
    if (aqui) plantado = true;

    lugares.push({ lugar, estado, aqui });
  }

  // Todo terminado: el compañero se queda en el último lugar, no en ninguno.
  if (!plantado && lugares.length > 0) {
    const ultimo = lugares.length - 1;
    lugares[ultimo] = { ...lugares[ultimo], aqui: true };
  }

  return { forma: "sendero", lugares };
}

/* ────────────────────────────────────────────────────────────────────────────
 * PRIMARIA / SECUNDARIA — el árbol sin aristas (#233)
 * ──────────────────────────────────────────────────────────────────────────*/

export interface NodoDelArbol {
  readonly habilidad: string;
  readonly rotulo: string | null;
  readonly pericia: Pericia;
  /** `skill_state` tal cual, para el relleno de la barra. Nunca es un nivel. */
  readonly relleno: number;
}

/**
 * Un grupo del árbol.
 *
 * `orden` es 1, 2, 3… **correlativo dentro de este árbol**, y no es el número de
 * nivel: si un alumno solo tiene habilidades de N5 y N7, sus grupos son 1 y 2.
 * Es lo que hace que D-017 se cumpla por construcción y no por disciplina.
 */
export interface GrupoDelArbol {
  readonly orden: number;
  readonly nodos: readonly NodoDelArbol[];
}

/**
 * Una arista de prerrequisito. **Hoy no existe ninguna, y es a propósito.**
 *
 * El tipo está declarado y el árbol lleva el arreglo vacío para cumplir el
 * cuarto criterio de #233: «cuando el campo de prerrequisito exista, el
 * componente puede ganar aristas sin rediseño». El hueco está hecho; el dato,
 * no — `skills` no tiene la columna (F5 §4.8 bloqueo 10).
 */
export interface Arista {
  readonly desde: string;
  readonly hasta: string;
}

export interface Arbol {
  readonly forma: "arbol";
  readonly grupos: readonly GrupoDelArbol[];
  /**
   * Siempre vacío en el MVP. `construirArbol()` no lo recibe ni lo puede
   * poblar: no hay ningún parámetro del que pudiera salir.
   */
  readonly aristas: readonly Arista[];
}

/**
 * Agrupa por nivel y **tira el nivel**.
 *
 * El orden dentro del grupo es alfabético por `habilidad`, no el de entrada:
 * dos consultas que devuelvan las mismas filas en otro orden tienen que dar el
 * mismo árbol. Es la misma garantía que `cosmeticosQueDesbloquea()` da y por la
 * misma razón — un mapa que se reordena solo se lee como un mapa roto.
 */
export function construirArbol(entradas: readonly EntradaDeHabilidad[]): Arbol {
  const porNivel = new Map<number, EntradaDeHabilidad[]>();
  for (const e of entradas) {
    const cubo = porNivel.get(e.nivel);
    if (cubo) cubo.push(e);
    else porNivel.set(e.nivel, [e]);
  }

  const niveles = [...porNivel.keys()].sort((a, b) => a - b);
  const grupos: GrupoDelArbol[] = niveles.map((nivel, i) => ({
    // `i + 1`, no `nivel`. Aquí es donde el número de nivel deja de existir.
    orden: i + 1,
    nodos: [...(porNivel.get(nivel) ?? [])]
      .sort((a, b) => (a.habilidad < b.habilidad ? -1 : a.habilidad > b.habilidad ? 1 : 0))
      .map((e) => ({
        habilidad: e.habilidad,
        rotulo: e.rotulo,
        pericia: periciaDe(e.skillState),
        relleno: e.skillState,
      })),
  }));

  return { forma: "arbol", grupos, aristas: [] };
}

/* ────────────────────────────────────────────────────────────────────────────
 * SERIO / JR / PRO — el tablero de cifras (#234)
 * ──────────────────────────────────────────────────────────────────────────*/

export interface FilaDelTablero {
  readonly habilidad: string;
  readonly rotulo: string | null;
  readonly pericia: Pericia;
  readonly relleno: number;
}

export interface Tablero {
  readonly forma: "tablero";
  readonly filas: readonly FilaDelTablero[];
  /** `xp_totals.total_xp`, tal cual. El mapa no lo calcula (D-055). */
  readonly xp: number;
  /** `child_streak.current_streak`, tal cual. El mapa no lo calcula (D-079). */
  readonly rachaDias: number;
}

/**
 * El tablero adulto: cifras planas, sin mapa espacial.
 *
 * Las filas van ordenadas por `habilidad` por lo mismo que el árbol. **No van
 * ordenadas por dominio**: una lista que pone al final lo que peor se te da es
 * un ranking de tus fracasos, y `mc-10` mide qué le hace la presión de
 * rendimiento a las matemáticas.
 *
 * Lo que NO trae, y no es un olvido: la misión activa (F7/C) y la posición de
 * liga (F7/D). Los dos subsistemas se están construyendo en paralelo y tienen
 * dueño; inventar aquí su forma sería la contradicción que la crítica cruzada
 * de F7 §0 ya cazó una vez.
 */
export function construirTablero(
  entradas: readonly EntradaDeHabilidad[],
  totales: { readonly xp: number; readonly rachaDias: number },
): Tablero {
  const filas = [...entradas]
    .sort((a, b) => (a.habilidad < b.habilidad ? -1 : a.habilidad > b.habilidad ? 1 : 0))
    .map((e) => ({
      habilidad: e.habilidad,
      rotulo: e.rotulo,
      pericia: periciaDe(e.skillState),
      relleno: e.skillState,
    }));

  return { forma: "tablero", filas, xp: totales.xp, rachaDias: totales.rachaDias };
}

/* ────────────────────────────────────────────────────────────────────────────
 * El stub declarado — para que nadie confunda «no hay datos» con «vas en cero»
 * ──────────────────────────────────────────────────────────────────────────*/

/**
 * `true` mientras F4 no exponga `estadoDeHabilidades()`.
 *
 * El tercer criterio de #231 lo pide con nombre: si F4 aún no expone el método,
 * el mapa se construye «contra un stub documentado como tal, **nunca contra
 * datos inventados que parezcan reales**». Esta constante es ese documento en
 * forma ejecutable: la pantalla la lee y dice «todavía no estoy midiendo esto»
 * en vez de pintar catorce barras en cero, que un padre lee como «mi hijo no ha
 * aprendido nada».
 *
 * El día que F4 aterrice, esto pasa a `false` y la pantalla no cambia de forma:
 * cambia de contenido.
 */
export const HABILIDADES_SIN_FUENTE = true;

/** El nombre del método asumido, escrito una vez para que F4 lo pueda buscar. */
export const CONTRATO_ASUMIDO_F4 = "estadoDeHabilidades(perfilId) → EntradaDeHabilidad[]";
