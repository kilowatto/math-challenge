/**
 * Las misiones diarias. Uno solo, y determinista (#211, #216, D-014).
 *
 * Es un módulo PURO, con el mismo contrato que `racha.ts`: entra un perfil y un
 * día, sale una decisión, y no toca la red, ni el reloj, ni la base. Aquí «no
 * toca el reloj» tiene dos motivos, y los dos importan:
 *
 *   · Un día es un día LOCAL del hogar, exactamente el mismo que usa la racha.
 *     `racha.ts::diaEfectivo()` es la ÚNICA puerta entre un instante y un día, y
 *     este módulo recibe el día ya calculado. Si pudiera leer `Date.now()`, la
 *     tentación sería comparar en UTC, y una familia en `America/Mexico_City`
 *     que juega a las 19:00 recibiría las misiones del día siguiente durante
 *     media vida del producto.
 *   · La selección tiene que ser **reproducible desde `(perfil, día)`**. Ni
 *     `Math.random()` ni `Date.now()` existen en varios de nuestros entornos de
 *     prueba, y —más importante— sin reproducibilidad no se puede contestar «¿por
 *     qué le tocó esta misión a mi hijo?» sin guardar una semilla aparte.
 *
 * ─── Lo que este módulo garantiza, y de dónde sale ────────────────────────
 *
 *  1. **Cero entropía** (#216). No hay `Math.random`, no hay
 *     `crypto.getRandomValues`, no hay `Date.now`, no hay iteración de un `Set`
 *     cuyo orden dependa de la inserción. `semillaDelDia()` es un FNV-1a de 32
 *     bits sobre `(childProfileId, fechaLocal)`: misma tupla, misma salida,
 *     siempre. `audits/mision-recompensa-deterministica.mjs` lo mide ejecutando
 *     el módulo, no leyéndolo.
 *
 *  2. **La recompensa es fija y publicada** (#219, línea roja #5). Cada tipo
 *     vale lo que dice `XP_POR_TIPO` en `xp.ts`, y esa tabla es la única fuente:
 *     el catálogo de aquí **deriva** su XP con `xpDeTipo()` en vez de escribir el
 *     número otra vez. Dos copias del mismo número es cómo la pantalla acaba
 *     prometiendo un premio que el motor no da.
 *
 *     D-014 prohíbe por su letra la recompensa aleatoria **de pago**. Esta tabla
 *     extiende la prohibición a **cualquier** recompensa, y la razón no es
 *     prudencia: `mc-17` (implicación de diseño 3) y `mc-43` (hallazgo 5) son
 *     explícitos en que el mecanismo dañino —el refuerzo de razón variable— **no
 *     necesita dinero para funcionar sobre un niño**. Bélgica y Países Bajos
 *     declararon juego ilegal a la versión pagada en 2018.
 *
 *  3. **Ningún slot queda vacío y ninguno se repite** (#217). Cinco de los diez
 *     tipos no tienen precondición ninguna, así que siempre hay con qué llenar
 *     tres slots distintos. Una misión que no se puede cumplir es peor que no
 *     tener misión — es el mismo principio que el criterio de F4 «el programador
 *     nunca dice vuelve mañana».
 *
 *  4. **F4 puede no existir** (#228). `resumenF4 === null` no bloquea nada: el
 *     slot adaptativo cae a `volumen` y el día sigue teniendo sus tres misiones.
 *     F7 se despliega antes que F4 y se enciende sola cuando F4 aterrice, sin
 *     tocar este archivo.
 *
 *  5. **El contrato con F4 y con la liga es de SOLO LECTURA** (#214, #215).
 *     `ResumenAdaptativoParaMisiones` y `ResumenDeLigaParaMisiones` son listas
 *     blancas —ni un campo más— y este módulo no importa el árbol de F4 ni el de
 *     ligas. `audits/misiones-sin-do-ajeno.mjs` bloquea el commit que lo haga.
 *     Son dos sobres y no uno por el mismo argumento estructural que D-027 usa
 *     para separar `grupo_infantil` de `club_adulto`: dominios distintos, dueños
 *     distintos, ciclos de vida distintos.
 *
 *  6. **Ninguna misión tiene precio** (línea roja #4). Ninguna función de este
 *     archivo acepta un monto, un SKU, un cupón ni un plan, y no puede haberlo:
 *     nunca se cobra por dejar que un niño practique.
 *
 *  7. **Nada de esto se pinta dentro de un reto activo** (#221). Este módulo no
 *     exporta ni un componente ni una cadena de cara al niño. `mc-42` §3 mide que
 *     el estímulo irrelevante durante la tarea perjudica: el efecto de habla
 *     irrelevante degrada el recuerdo serial aunque no se atienda.
 *
 * ─── KINDER no tiene menú, y eso NO es una omisión ────────────────────────
 *
 * En KINDER «misión diaria» no es una función nueva: es una etiqueta interna
 * sobre lo que ya existe —completar el reto HISTORIA del día en la Sabana
 * (D-019)— puesta ahí solo para que la telemetría del padre pueda contarlo. No
 * hay UI de misión, no hay menú de tres tarjetas, no hay texto nuevo y no hay ni
 * una cadena de audio nueva. Por eso `elegirMisionesDelDia` devuelve una lista
 * VACÍA para KINDER, y `tieneMenuDeMisiones()` existe para que quien llama no
 * tenga que deducirlo de un arreglo vacío.
 *
 * La razón de fondo no es de costo: un niño de 4-6 años no sostiene un menú de
 * opciones, y D-018 ya fijó que su meta diaria es UN reto. Apilar un segundo
 * concepto sobre la misma acción sería inventar complejidad donde D-018 ya
 * decidió simplicidad. Y kinder está **aplazado** (D-073), así que esto es la
 * forma del hueco, no una promesa de pantalla.
 *
 * ─── La advertencia honesta que va con esto ───────────────────────────────
 *
 * `mc-16` es la fuente de la forma de este subsistema, y trae su propio
 * desmentido: la evidencia de Duolingo es fuerte en INGENIERÍA DE ENGANCHE y
 * **débil en aprendizaje** — su propio CEO compara la app con «una elíptica».
 * Sailer & Homner (2020) miden efectos conductuales pequeños (g=0.25), y Hamari
 * et al. (2014) advierten del **efecto novedad**. Una misión diaria no enseña.
 * Existe para que alguien vuelva, que es otra cosa, y ninguna decisión de aquí
 * puede justificarse diciendo «así aprende más».
 */

import type { Banda } from "./puntuacion.ts";
import type { DiaLocal } from "./racha.ts";
import { xpDeTipo } from "./xp.ts";

// ─── Los diez tipos (#212) ───────────────────────────────────────────────────

/**
 * El catálogo cerrado. Diez tipos para PRIMARIA en adelante.
 *
 * Ninguno se solapa con otro en el eje que mide, y dos que suenan parecido son
 * a propósito distintos: **`variedad` mide amplitud de TEMA y `descubre` mide
 * amplitud de MODO**. Es la clase de colisión que la crítica de F5 encontró en
 * `proposito` —dos enums cerrados con el mismo nombre midiendo cosas
 * distintas— y aquí se evita documentándola en vez de suponiéndola.
 *
 * HISTORIA no está: D-034 lo excluye de la franja adulta y ninguna otra banda
 * ≥7 tiene contenido en el MVP. HISTORIA vive solo en KINDER, que no tiene menú.
 */
export const TIPOS_DE_MISION = [
  "volumen",
  "variedad",
  "repaso",
  "dominio",
  "problema",
  "fluidez",
  "precision",
  "descubre",
  "duelo",
  "meta_de_liga",
] as const;

export type TipoMision = (typeof TIPOS_DE_MISION)[number];

/** KINDER nunca entra al catálogo. Ver la cabecera del archivo. */
export type BandaConMenu = Exclude<Banda, "KINDER">;

/**
 * El orden de las bandas, que es el que define «esta banda alcanza a aquélla».
 *
 * KINDER no está, y no es un olvido: no tiene menú de misiones, así que no hay
 * ninguna comparación que hacer con ella.
 */
export const ORDEN_DE_BANDAS: readonly BandaConMenu[] = Object.freeze([
  "PRIMARIA",
  "SECUNDARIA",
  "SERIO",
  "JR",
  "PRO",
]);

// ─── Los dos contratos de solo lectura (#214, #215) ──────────────────────────

/**
 * Lo ÚNICO que F7 puede pedirle a F4. Lista blanca — ni un campo más.
 *
 * Tres arreglos de identificadores de habilidad, y nada más. No viaja el estado
 * interno del modelo adaptativo, no viaja ninguna estimación numérica, y este
 * módulo no puede nombrar la tabla de F4 ni su Durable Object:
 * `audits/misiones-sin-do-ajeno.mjs` lo hace cumplir sobre el grafo de imports,
 * igual que `larry-sin-item` hace con el sobre de Larry.
 *
 * **De solo lectura, y eso es literal:** ninguna función de este archivo
 * devuelve, muta ni escribe nada que aterrice en F4. Una misión reconoce con XP
 * un evento que F4 ya produjo por su cuenta (autocrítica §10.7 del diseño); no
 * lo provoca ni lo modifica.
 *
 * `habilidadesEnRepaso` sale del programador de espaciado, que elige por
 * **vencimiento** (fecha) y no por debilidad — una habilidad bien dominada puede
 * tocar repasarla hoy. Importa decirlo: si eligiera la más débil, `repaso` se
 * leería como «el sistema elige lo que peor haces», que es justo lo que `mc-10`
 * documenta como origen de la evitación.
 */
export interface ResumenAdaptativoParaMisiones {
  /** Lo que el programador de espaciado marcó vencido HOY. */
  readonly habilidadesEnRepaso: readonly string[];
  /** Las que están a un empujón de dominarse. */
  readonly habilidadesCercaDeDominio: readonly string[];
  /** Las ya dominadas — es lo que hace posible un reto de FLUIDEZ (D-018). */
  readonly habilidadesDominadas: readonly string[];
}

/**
 * Lo ÚNICO que F7 puede pedirle al Durable Object de la liga (mc-32: un DO por
 * liga). Lista blanca, igual que el de arriba.
 *
 * `metaColectivaHoy` viaja como agregado y nunca junto a la contribución
 * individual de nadie. D-028 lo dice para las prendas de adultos —«ninguna de
 * las formas tiene casilla de perdedor»— y `mc-46` lo documenta en Strava *Group
 * Goal*: la ausencia de tabla de posiciones **es la función, no una limitación**.
 * Si la liga no llega a la meta, el contador desaparece al día siguiente sin
 * anuncio de que no se logró.
 */
export interface ResumenDeLigaParaMisiones {
  readonly enLiga: boolean;
  /** D-018: DUELO es opt-in, 8+. Sin esto, `duelo` no se evalúa siquiera. */
  readonly dueloOptIn: boolean;
  /** Agregado de la liga entera. Nunca la parte de un niño con nombre. */
  readonly metaColectivaHoy: { readonly objetivo: number; readonly llevan: number } | null;
}

// ─── El catálogo como datos puros (#212) ─────────────────────────────────────

/**
 * Una entrada del catálogo.
 *
 * `xp` NO se escribe aquí: se deriva de `xpDeTipo()`. Ver la garantía 2 de la
 * cabecera — la tabla publicada vive en un solo sitio, `xp.ts`, y este archivo
 * la lee.
 */
export interface DefinicionMision {
  readonly tipo: TipoMision;
  readonly bandaMinima: BandaConMenu;
  /** Cuántas veces hay que hacer la cosa para completarla. `[criterio propio]` */
  readonly meta: number;
  /** Lo que vale, en XP. Fijo, publicado, y derivado de `xp.ts`. */
  readonly xp: number;
  /** Si entra a la rotación de los slots 2 y 3. `volumen` no entra: es la red. */
  readonly enPoolFijo: boolean;
  /** Si hoy se puede cumplir. Pura: no mira el reloj ni la red. */
  readonly elegible: (
    r: ResumenAdaptativoParaMisiones | null,
    l: ResumenDeLigaParaMisiones,
  ) => boolean;
}

/** La clave con la que un tipo aparece en la tabla publicada de `xp.ts`. */
export function claveDeXp(tipo: TipoMision): string {
  return `mision_${tipo}`;
}

/** La clave del bono por completar el día entero. */
export const CLAVE_XP_DIA_COMPLETO = "mision_dia_completo";

const SIEMPRE = () => true;

/**
 * Los diez tipos, con su elegibilidad, su meta y su XP.
 *
 * **Las metas son `[criterio propio, no hay fuente que fije estos números]`** —
 * la misma honestidad que D-016 usa para su tabla de minutos y que `xp.ts` usa
 * para la suya. Lo que sí está sostenido por `mc-16` (implicación de diseño 7)
 * es la FORMA: una meta pequeña y alcanzable en una sesión, para que cualquier
 * sesión terminada se sienta como progreso.
 *
 * Todas son `PRIMARIA` como banda mínima, así que **hoy el filtro de banda no
 * descarta ni un tipo**. Se dice en voz alta en vez de esconderlo (D-070: una
 * comprobación cierta por construcción es decorativa): el campo existe para que
 * el día que un tipo pida SECUNDARIA el filtro ya esté escrito y probado, no
 * para fingir que hoy hace algo.
 */
export const CATALOGO: readonly DefinicionMision[] = Object.freeze([
  // La red bajo todo lo demás: el único tipo sin ninguna precondición, y el
  // único que no entra a la rotación. Sin él, un perfil nuevo —sin liga, sin
  // nada dominado, sin F4— podría quedarse sin misión, que es exactamente lo
  // que #217 prohíbe.
  def("volumen", 3, false, SIEMPRE),
  // Amplitud de TEMA: dos habilidades distintas.
  def("variedad", 2, true, SIEMPRE),
  // Adaptativo. Vencimiento, no debilidad — ver el contrato de F4.
  def("repaso", 1, true, (r) => r !== null && r.habilidadesEnRepaso.length > 0),
  def("dominio", 3, true, (r) => r !== null && r.habilidadesCercaDeDominio.length > 0),
  // Modo PROBLEMA (D-018): un ítem que cuesta pensar, sin reloj.
  def("problema", 1, true, SIEMPRE),
  // Modo FLUIDEZ (D-018): con reloj, y SOLO sobre temas ya dominados. Sin nada
  // dominado no es elegible, y eso no es un bug — es la autocrítica §10.6 del
  // diseño: un niño nuevo cae al pool general como cualquier otro tipo inelegible.
  def("fluidez", 1, true, (r) => r !== null && r.habilidadesDominadas.length > 0),
  def("precision", 1, true, SIEMPRE),
  // Amplitud de MODO, que no es lo mismo que la de tema. Ver `TIPOS_DE_MISION`.
  def("descubre", 1, true, SIEMPRE),
  // DUELO es opt-in y 8+ (D-018). Se exige ADEMÁS estar en una liga, y esto es
  // `[criterio propio]`: el diseño solo pedía `dueloOptIn`, pero un duelo sin
  // liga contra quién no se puede cumplir, y una misión incumplible es peor que
  // no tener misión (#217). Un perfil sin opt-in NUNCA la ve — ni activa ni
  // «bloqueada, actívala para intentarlo» (#218): enseñarla bloqueada sería un
  // empujón hacia una función que D-018 decidió opt-in, y roza el *nagging* que
  // `mc-17` nombra por su nombre.
  def("duelo", 1, true, (_r, l) => l.dueloOptIn === true && l.enLiga === true),
  // Cooperativa y sin perdedor (§8 del diseño). El contador colectivo vive en el
  // DO de la liga; aquí solo se pregunta si el perfil está en una.
  def("meta_de_liga", 1, false, (_r, l) => l.enLiga === true),
]);

function def(
  tipo: TipoMision,
  meta: number,
  enPoolFijo: boolean,
  elegible: DefinicionMision["elegible"],
): DefinicionMision {
  return Object.freeze({
    tipo,
    bandaMinima: "PRIMARIA" as const,
    meta,
    xp: xpDeTipo(claveDeXp(tipo)),
    enPoolFijo,
    elegible,
  });
}

/** La definición de un tipo. Lanza si el tipo no está en el catálogo cerrado. */
export function definicionDe(tipo: TipoMision): DefinicionMision {
  const d = CATALOGO.find((x) => x.tipo === tipo);
  if (!d) {
    throw new RangeError(
      `tipo de misión fuera del catálogo cerrado: "${tipo}" (${TIPOS_DE_MISION.join(", ")}). ` +
        "Nadie agrega un tipo sin tocar este archivo.",
    );
  }
  return d;
}

/**
 * El pool que rota en los slots 2 y 3.
 *
 * `volumen` no está: es la red bajo cualquier fallback, y si entrara a la
 * rotación podría gastarse en el slot 2 y dejar al 3 sin red.
 */
export const POOL_FIJO: readonly TipoMision[] = Object.freeze(
  CATALOGO.filter((d) => d.enPoolFijo).map((d) => d.tipo),
);

/**
 * El orden con el que se rellena un slot que quedó sin dueño.
 *
 * Los cinco tipos sin ninguna precondición. Que sean cinco y las misiones sean
 * tres es lo que hace imposible un slot vacío o repetido para cualquier banda
 * ≥ PRIMARIA.
 */
export const ORDEN_DE_RESPALDO: readonly TipoMision[] = Object.freeze([
  "volumen",
  "variedad",
  "precision",
  "descubre",
  "problema",
]);

/**
 * Cuántas misiones se ofrecen a la vez, de PRIMARIA en adelante.
 *
 * `[criterio propio, la evidencia es débil en las dos direcciones]`. No existe
 * un estudio de HCI con la cifra para «cuántas misiones diarias tolera un niño
 * de 7-11 sin abrumarse». Las dos piezas indirectas que hay:
 *
 *   · Duolingo usa 3 (bronce/plata/oro), corroborado en fuentes secundarias
 *     pero sin post oficial — mismo nivel de confianza que `mc-16` ya le da a
 *     otras cifras suyas.
 *   · Cowan (2010), «The Magical Mystery Four», fija ~4±1 como techo de memoria
 *     de trabajo **adulta**, con los niños de 7-11 todavía **subiendo** hacia ese
 *     techo, no habiéndolo alcanzado.
 *
 * Se elige 3 y queda como pregunta abierta al dueño en `docs/dudas.md`: 2 sería
 * más conservador, 3 es más simple de construir y de explicar y aprovecha el
 * precedente. **Un solo número para todas las bandas**, incluida SERIO — la
 * segunda configuración se agrega el día que el dueño la pida, no antes.
 */
export const MISIONES_POR_DIA = 3;

// ─── La misión que sale, y el día de KINDER ──────────────────────────────────

/** Una misión ya elegida. Sin texto: el copy vive en los archivos de locale. */
export interface Mision {
  readonly tipo: TipoMision;
  /** Fijo y publicado. Nunca varía entre llamadas ni entre sesiones. */
  readonly xp: number;
  readonly meta: number;
}

/**
 * La etiqueta interna de KINDER. **No es una misión con pantalla.**
 *
 * Es el reto HISTORIA de hoy en la Sabana (D-019), que F5/F6 construyen de todas
 * formas, nombrado para que la telemetría del padre pueda contarlo. Vive aquí y
 * no en una tabla para que quede claro que no cuesta ni una cadena de texto.
 */
export const MISION_DE_KINDER = "historia_del_dia";

/** ¿Esta banda ve un menú de misiones? KINDER no, y es la única que no. */
export function tieneMenuDeMisiones(banda: Banda): boolean {
  return banda !== "KINDER";
}

// ─── La semilla: cero entropía (#216) ────────────────────────────────────────

const FORMA_DIA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * La semilla del día, de `(perfil, día)` y de nada más.
 *
 * FNV-1a de 32 bits. No es criptografía y no pretende serlo: lo que hace falta
 * es que varíe entre niños y entre días, y que **misma tupla dé misma salida
 * siempre**, en cualquier runtime y en cualquier orden de ejecución.
 *
 * Por qué un hash y no `Math.random`: no es preferencia de estilo. Un hash es
 * reproducible —se puede depurar «por qué le tocó esta misión a mi hijo» sin
 * guardar una semilla aparte—, no necesita fuente de entropía (que varios de
 * nuestros entornos de prueba no tienen), y hace que la selección sea auditable
 * ejecutándola, que es lo que D-070 pide.
 *
 * `Math.imul` y `>>> 0` no son adorno: sin ellos la multiplicación se hace en
 * coma flotante de 53 bits y el resultado depende de cuántos bits se pierdan,
 * que es la clase de detalle que difiere entre motores.
 */
export function semillaDelDia(childProfileId: string, fechaLocal: DiaLocal): number {
  exigirPerfil(childProfileId);
  exigirDia(fechaLocal);
  const clave = `${childProfileId}|${fechaLocal}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < clave.length; i++) {
    h = (h ^ clave.charCodeAt(i)) >>> 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** La lista rotada `desplazamiento` posiciones. Nueva lista, sin mutar la de entrada. */
export function rotar<T>(lista: readonly T[], desplazamiento: number): T[] {
  if (lista.length === 0) return [];
  const d = ((Math.trunc(desplazamiento) % lista.length) + lista.length) % lista.length;
  return [...lista.slice(d), ...lista.slice(0, d)];
}

function exigirPerfil(childProfileId: string): void {
  if (typeof childProfileId !== "string" || childProfileId.length === 0) {
    throw new RangeError(
      "childProfileId vacío. La semilla sale de (perfil, día): sin perfil, todos los niños " +
        "recibirían las mismas tres misiones el mismo día.",
    );
  }
}

function exigirDia(fechaLocal: DiaLocal): void {
  if (typeof fechaLocal !== "string" || !FORMA_DIA.test(fechaLocal)) {
    throw new RangeError(
      `día local mal formado: ${JSON.stringify(fechaLocal)} (se esperaba YYYY-MM-DD). ` +
        "Lo calcula quien llama con `racha.ts::diaEfectivo()`, que es la única puerta entre " +
        "un instante y un día del hogar.",
    );
  }
}

function alcanzaLaBanda(banda: BandaConMenu, minima: BandaConMenu): boolean {
  const i = ORDEN_DE_BANDAS.indexOf(banda);
  const j = ORDEN_DE_BANDAS.indexOf(minima);
  if (i < 0) {
    throw new RangeError(
      `banda fuera de la escalera de misiones: "${banda}" (${ORDEN_DE_BANDAS.join(", ")}). ` +
        "KINDER no está aquí a propósito: no tiene menú de misiones.",
    );
  }
  return i >= j;
}

function exigirResumenLiga(l: ResumenDeLigaParaMisiones): void {
  if (l === null || typeof l !== "object") {
    throw new RangeError(
      "el resumen de liga es obligatorio (aunque venga con todo en false). A diferencia del " +
        "de F4, la liga siempre puede contestar «no está en ninguna», y un `null` aquí " +
        "escondería la diferencia entre «no está en liga» y «no se preguntó».",
    );
  }
}

// ─── La selección del día (#216, #217, #228) ─────────────────────────────────

/**
 * Las misiones de hoy para este perfil. Pura, determinista, cero entropía.
 *
 * El algoritmo, tal cual, para que se pueda leer sin ejecutarlo:
 *
 *     semilla = FNV1a(childProfileId | fechaLocal)
 *     slot1 = repaso   si F4 marcó algo vencido hoy
 *             dominio  si no, y hay algo cerca de dominarse
 *             volumen  si no                       ← nunca vacío, ni sin F4
 *     slot2 = el primer elegible de rotar(POOL_FIJO, semilla) que no sea slot1
 *     slot3 = meta_de_liga si está en una liga
 *             si no, el primer elegible de rotar(POOL_FIJO, semilla+1) sin repetir
 *     relleno = ORDEN_DE_RESPALDO, en orden, hasta completar MISIONES_POR_DIA
 *
 * **Degradación sin F4 (#228).** `resumenF4 === null` significa «F4 no está
 * desplegado» y no «el niño no tiene nada que repasar». Las dos cosas llevan al
 * mismo sitio a propósito —`volumen`, que siempre se puede cumplir— y ninguna
 * bloquea la asignación. F7 se enciende sola cuando F4 aterrice.
 *
 * **KINDER devuelve una lista vacía**, y eso no es un fallo: ver la cabecera del
 * archivo. Quien llama pregunta con `tieneMenuDeMisiones()` en vez de deducirlo.
 *
 * @param childProfileId el perfil, o el id del adulto aprendiz (D-034). Solo
 *   alimenta la semilla; nada de lo que sale de aquí lo identifica.
 * @param fechaLocal el día LOCAL del hogar, calculado por quien llama con
 *   `racha.ts::diaEfectivo()`. Nunca un instante, nunca UTC crudo.
 * @param resumenF4 `null` si F4 no está desplegado (#228). No se escribe nunca.
 */
export function elegirMisionesDelDia(
  childProfileId: string,
  fechaLocal: DiaLocal,
  banda: Banda,
  resumenF4: ResumenAdaptativoParaMisiones | null,
  resumenLiga: ResumenDeLigaParaMisiones,
): Mision[] {
  exigirPerfil(childProfileId);
  exigirDia(fechaLocal);
  exigirResumenLiga(resumenLiga);

  if (!tieneMenuDeMisiones(banda)) return [];

  const conMenu = banda as BandaConMenu;
  const semilla = semillaDelDia(childProfileId, fechaLocal);

  const sirve = (tipo: TipoMision): boolean => {
    const d = definicionDe(tipo);
    return alcanzaLaBanda(conMenu, d.bandaMinima) && d.elegible(resumenF4, resumenLiga);
  };

  const elegidas: TipoMision[] = [];
  const tomar = (tipo: TipoMision | undefined): void => {
    if (tipo && !elegidas.includes(tipo) && elegidas.length < MISIONES_POR_DIA) elegidas.push(tipo);
  };

  // Slot 1 — el adaptativo. Cae a `volumen` sin F4 y sin nada que repasar.
  tomar(sirve("repaso") ? "repaso" : sirve("dominio") ? "dominio" : "volumen");

  // Slot 2 — la rotación del pool fijo.
  const pool = POOL_FIJO.filter(sirve);
  tomar(rotar(pool, semilla).find((t) => !elegidas.includes(t)));

  // Slot 3 — la liga primero, y si no, la rotación desplazada un lugar más.
  if (sirve("meta_de_liga")) tomar("meta_de_liga");
  if (elegidas.length < MISIONES_POR_DIA) {
    tomar(rotar(pool, semilla + 1).find((t) => !elegidas.includes(t)));
  }

  // Relleno — ningún slot vacío (#217). Los cinco de `ORDEN_DE_RESPALDO` no
  // tienen precondición, así que este bucle siempre termina para cualquier
  // banda ≥ PRIMARIA. El `throw` de abajo es la red bajo la red: si algún día
  // alguien le pone una precondición a uno de los cinco, esto revienta al
  // primer perfil y no en silencio seis meses después.
  for (const tipo of ORDEN_DE_RESPALDO) {
    if (elegidas.length >= MISIONES_POR_DIA) break;
    if (sirve(tipo)) tomar(tipo);
  }

  if (elegidas.length < MISIONES_POR_DIA) {
    throw new RangeError(
      `solo se pudieron elegir ${elegidas.length} de ${MISIONES_POR_DIA} misiones para la banda ` +
        `${banda} (${elegidas.join(", ")}). #217: ningún slot queda vacío, porque una misión que ` +
        "no se puede cumplir es peor que no tener misión — y ninguna misión es peor todavía. " +
        "Si esto se disparó, algún tipo de ORDEN_DE_RESPALDO dejó de ser incondicional.",
    );
  }

  return elegidas.map(aMision);
}

function aMision(tipo: TipoMision): Mision {
  const d = definicionDe(tipo);
  return Object.freeze({ tipo: d.tipo, xp: d.xp, meta: d.meta });
}

// ─── El progreso de una misión, sin una sola fila por intento ────────────────

/**
 * El estado de UNA misión en UN día. Una fila de `mission_daily_summary` (0009).
 *
 * Usa los nombres de columna de D1 y no camelCase, por la misma razón que
 * `EstadoRacha`: `audits/mision-recompensa-deterministica.mjs` vigila lo que
 * toca `xp_awarded`, y una capa de traducción entre los dos nombres sería
 * exactamente el punto donde el auditor deja de ver.
 *
 * **No hay `completed_at`.** Un sello de tiempo obligaría a este módulo a leer
 * el reloj, y el reloj es la puerta que la cabecera cierra. `completed` es 0 o 1;
 * el `updated_at` de la fila lo pone quien escribe, que sí sabe qué hora es.
 */
export interface EstadoDeMision {
  readonly local_date: DiaLocal;
  readonly mission_type: TipoMision;
  readonly target: number;
  readonly progress: number;
  readonly completed: 0 | 1;
  readonly xp_awarded: number;
}

/** El estado con el que nace una misión del día: sin progreso y sin XP. */
export function estadoInicialDeMision(mision: Mision, dia: DiaLocal): EstadoDeMision {
  exigirDia(dia);
  definicionDe(mision.tipo);
  return Object.freeze({
    local_date: dia,
    mission_type: mision.tipo,
    target: mision.meta,
    progress: 0,
    completed: 0 as const,
    xp_awarded: 0,
  });
}

/**
 * Suma progreso a una misión.
 *
 * Idempotente al llegar al final: una misión ya completada devuelve **el mismo
 * objeto**, no una copia igual. Es a propósito, igual que en `registrarDia`:
 * quien llama puede comparar por referencia para saber si hay algo que escribir
 * en D1, y así el reintento de una cola offline no otorga el XP dos veces.
 *
 * El XP se otorga UNA vez, en la transición a completada, y con el valor fijo
 * del catálogo. Nunca un rango, nunca una tirada (línea roja #5).
 */
export function avanzarMision(estado: EstadoDeMision, incremento: number): EstadoDeMision {
  if (!Number.isFinite(incremento) || incremento < 0) {
    throw new RangeError(
      `incremento negativo o no finito: ${incremento}. Una misión no retrocede — línea roja #8: ` +
        "nunca se penaliza borrar ni corregir, y un contador que baja es una penalización.",
    );
  }
  if (estado.completed === 1) return estado;

  const progreso = Math.min(estado.target, estado.progress + incremento);
  const completa = progreso >= estado.target;
  if (progreso === estado.progress && !completa) return estado;

  return Object.freeze({
    ...estado,
    progress: progreso,
    completed: completa ? (1 as const) : (0 as const),
    xp_awarded: completa ? definicionDe(estado.mission_type).xp : estado.xp_awarded,
  });
}

// ─── El cierre del día (#219) ────────────────────────────────────────────────

/** Lo que se le puede enseñar a alguien al terminar el día. Solo lo logrado. */
export interface CierreDelDia {
  /** Solo las completadas, en el orden del plan. **Nunca un «0 de 3».** */
  readonly logradas: readonly TipoMision[];
  /** XP total del día por misiones, bono incluido. Fijo y publicado. */
  readonly xp: number;
  readonly diaCompleto: boolean;
}

/**
 * El bono por completar las tres. Fijo, publicado y **sin metáfora de cofre**.
 *
 * Se muestra como una suma directa. Aunque el contenido sea conocido de
 * antemano, un cofre que se abre sugiere sorpresa, y `mc-17` §7 documenta que el
 * radio de la historia regulatoria de las cajas de botín alcanza a lo cosmético
 * y a lo gratuito cuando usa la sorpresa para enganchar.
 */
export const BONO_DIA_COMPLETO = xpDeTipo(CLAVE_XP_DIA_COMPLETO);

/**
 * El cierre del día: qué se logró y cuánto XP salió de ahí.
 *
 * **Nunca devuelve un denominador.** El resumen lista solo lo logrado, como una
 * lista que crece — jamás una lista con casillas vacías tachadas. Un renglón
 * «0/3 misiones» es un veredicto negativo aunque el copy no lo diga, y `mc-17`
 * §5 nombra el *confirm-shaming* y la urgencia fabricada como categorías de la
 * FTC. Quien quiera pintar un progreso tiene `Mision.meta` y el estado, que son
 * datos; lo que no hay es un «te faltaron dos».
 *
 * El XP que sale de aquí se escribe con `agregarXp()` y `SQL_UPSERT_XP` de
 * `xp.ts` (#219): esta función no toca la base y no conoce `xp_totals`.
 * **Nunca se suma con los puntos del tablero** — son dos monedas y ninguna se
 * cambia por la otra (#225, D-055).
 */
export function cierreDelDia(
  misionesDeHoy: readonly Mision[],
  completadas: readonly TipoMision[],
): CierreDelDia {
  const hechas = new Set(completadas);
  const logradas = misionesDeHoy.filter((m) => hechas.has(m.tipo)).map((m) => m.tipo);
  let xp = 0;
  for (const m of misionesDeHoy) if (hechas.has(m.tipo)) xp += definicionDe(m.tipo).xp;

  const diaCompleto = misionesDeHoy.length > 0 && logradas.length === misionesDeHoy.length;
  if (diaCompleto) xp += BONO_DIA_COMPLETO;

  return Object.freeze({ logradas: Object.freeze(logradas), xp, diaCompleto });
}

// ─── El único SQL que escribe una misión (0009) ──────────────────────────────

/**
 * Una fila por misión y por día. **Jamás una por intento** (`mc-32` riesgo #1).
 *
 * Vive aquí y no en la ruta que lo ejecuta, por la misma razón que
 * `SQL_UPSERT_RACHA` vive en `racha.ts`: para que haya un solo sitio donde estas
 * columnas se escriben, y que ese sitio sea el mismo archivo que las calcula.
 * Dos escritores dan dos progresos para la misma misión, y el que se lea depende
 * del orden.
 *
 * Escribe el estado COMPLETO que devolvió el motor, no un delta: el progreso ya
 * se calculó arriba, y mandar deltas obligaría a recomputarlo dentro del SQL.
 * La idempotencia está en `avanzarMision`, no aquí.
 */
export const SQL_UPSERT_MISION = `
INSERT INTO mission_daily_summary (
  id, child_profile_id, user_id, local_date, mission_type,
  target, progress, completed, xp_awarded, updated_at
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (child_profile_id, local_date, mission_type) WHERE child_profile_id IS NOT NULL DO UPDATE SET
  target     = excluded.target,
  progress   = excluded.progress,
  completed  = excluded.completed,
  xp_awarded = excluded.xp_awarded,
  updated_at = excluded.updated_at
`.trim();
