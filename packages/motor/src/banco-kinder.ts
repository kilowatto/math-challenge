/**
 * El banco de ítems de kinder, generado desde plantillas paramétricas.
 *
 * `mc-40` reparte el origen de los ítems así: ~40% plantillas paramétricas, ~29%
 * redactados con IA y revisados por humano, ~31% escritos a mano. Este archivo es
 * el 40%: **contar patos del 1 al 20 es UNA plantilla, no veinte ítems**, y esa
 * distinción es lo que hace que el banco se pueda revisar. Nadie revisa 400
 * ítems; cualquiera revisa 14 plantillas.
 *
 * Lo que una plantilla aporta y una lista de ítems no:
 *
 *  · **Los errores con causa nombrada se derivan del parámetro.** Si `a=3, b=4`,
 *    el error «multiplicó» es 12 y el error «restó» es 1 — calculados, no
 *    escritos uno por uno, así que no puede haber un ítem con el distractor de
 *    otro.
 *  · **El eje de variación es explícito** (`mc-02`), porque la plantilla sabe
 *    qué parámetro cambió respecto al anterior.
 *
 * LO QUE ESTE ARCHIVO NO ES: el banco completo. Son 14 habilidades con plantillas
 * para las que se dejan generar; las que dependen de arte o de juicio pedagógico
 * —formas, patrones, el marco de diez— llevan plantilla mínima y esperan
 * curaduría humana. `mc-40` es explícito: los modelos escriben distractores
 * matemáticamente válidos y son malos anticipando los errores que los alumnos
 * reales cometen, así que **todo esto pasa por revisión humana antes de F5**.
 */

import type { Item, Formato, Proposito, Variacion, OpcionDibujada } from "./item.ts";
import { validarItem } from "./item.ts";

/**
 * ─── Los glifos viajan con el ítem, y por qué eso no es un detalle ─────────
 *
 * Hasta el 2026-08-02 la pantalla dibujaba **un pato, siempre**: el literal
 * `"🦆"` estaba escrito en cinco sitios de `Pantalla.astro`. Como el banco
 * elige entre patos, estrellas y piedras, **dos de cada tres ítems de contar
 * pedían una cosa y enseñaban otra** (#347): «Toca cada piedrita para
 * contarlas» sobre una fila de patos.
 *
 * Para quien está aprendiendo la correspondencia uno a uno a los cuatro años,
 * eso no es un desajuste estético: es la tarea rota. Contar exige saber qué se
 * cuenta.
 *
 * Y había un segundo caso, peor porque era silencioso: la pantalla tenía su
 * propia lista de figuras `["●","▲","■","★"]` mientras el banco tenía
 * `["circulo","cuadrado","triangulo","rectangulo"]`. **Distinto orden.** Un
 * ítem autorado como «tres cuadrados y un triángulo» se dibujaba con las dos
 * figuras cambiadas, y ninguna prueba podía verlo porque las dos listas eran
 * correctas por separado.
 *
 * Dos listas del mismo hecho siempre se separan. La única forma de que no pase
 * es que haya una, y que viaje con el ítem.
 */
const GLIFO_DE_FORMA: Record<string, string> = {
  circulo: "●",
  cuadrado: "■",
  triangulo: "▲",
  rectangulo: "▬",
};

/** Los objetos que se cuentan, en el mismo orden que `COSAS_CONTAR`. */
const GLIFOS_CONTAR = ["🦆", "⭐", "🪨", "🐸", "🦋", "🌼", "🐟", "🐰", "🍎"] as const;

/**
 * Los objetos del destello, en el mismo orden que `COSAS_FLASH`.
 *
 * El primero es cadena vacía a propósito: «puntos» se dibuja con el círculo de
 * la hoja de estilo, que es una forma geométrica y no un emoji. Un emoji de
 * círculo cambia de aspecto en cada plataforma, y subitizar depende de que los
 * puntos se vean iguales entre sí.
 */
const GLIFOS_FLASH = ["", "⭐", "🦆", "🦋"] as const;

/** Las 14 habilidades de kinder (plan §9). */
export const HABILIDADES_KINDER = {
  K01: "subitizar 1-3",
  K02: "subitizar 4-6",
  K03: "contar 1-10",
  K04: "contar 1-20",
  K05: "uno a uno",
  K06: "cardinalidad",
  K07: "comparar más/menos",
  K08: "recta numérica 0-10",
  K09: "marco de diez",
  K10: "descomponer (5 = 2+3)",
  K11: "sumar contando",
  K12: "restar quitando",
  K13: "formas básicas",
  K14: "patrones AB",
} as const;

export type HabilidadKinder = keyof typeof HABILIDADES_KINDER;

/** Una plantilla: parámetros dentro, ítem fuera. */
export interface Plantilla {
  habilidad: HabilidadKinder;
  formato: Formato;
  nivel: number;
  proposito: Proposito;
  /** Genera un ítem concreto a partir de sus parámetros. */
  generar(params: Record<string, number>, variacion: Variacion | null): Item;
  /** Los juegos de parámetros que esta plantilla admite. */
  parametros(): Array<{ params: Record<string, number>; variacion: Variacion }>;
}

const id = (h: string, p: Record<string, number>) =>
  `${h.toLowerCase()}-${Object.values(p).join("-")}`;

/** Rango inclusivo. */
const rango = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/**
 * Quita las entradas de `errores` cuyo valor ya salió: la PRIMERA gana.
 *
 * `calificarRespuesta` hace `.find()` y devuelve la primera causa que coincide,
 * así que dos causas con el mismo valor significan dos cosas malas a la vez: la
 * segunda es código muerto que nadie ve, y Larry puede explicar con seguridad
 * un error que el niño no cometió (línea roja #7). El plan de F5 §4.1 lo midió
 * en el diseño —39 ítems de K11— y al escribir su auditor apareció vivo en el
 * banco: K05 con `patos = gorros`, K06 con n=2, K08 con `antes = 1`, K09 con
 * `llenas = 9` y K14 con núcleo AB, donde los dos errores son la misma figura.
 *
 * `validarItem` no lo puede ver: compara cada error contra la respuesta, nunca
 * contra los otros errores. Por eso existe esta función y su auditor.
 */
const sinColision = <T extends number | string>(errores: Array<{ valor: T; causa: string }>) =>
  errores.filter((e, i, arr) => arr.findIndex((x) => String(x.valor) === String(e.valor)) === i);

// ---------------------------------------------------------------------------
// K11 — sumar contando
// ---------------------------------------------------------------------------
export const K11: Plantilla = {
  habilidad: "K11",
  formato: "toca_la_respuesta",
  nivel: 2,
  proposito: "interpretar",
  generar({ a, b, ctx }, variacion) {
    return {
      id: id("K11", { a, b, ctx }),
      habilidad: "K11",
      nivel: 2,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: ctx === 0 ? "k.suma.patos" : ctx === 1 ? "k.suma.estrellas" : "k.suma.piedras",
        vars: { a, b },
      },
      respuesta: { valor: a + b, tol: 0 },
      // Los distractores se CALCULAN. Un error escrito a mano puede acabar
      // siendo la respuesta correcta de otro ítem de la misma plantilla.
      //
      // Las dos causas que quedan son las que la investigación sostiene
      // (plan F5 §3.2, mc-06 §2 — Gelman y Gallistel): saltarse uno al contar
      // todos, y contar uno dos veces.
      //
      // Las tres que se borraron, y por qué (plan F5 §3.4j, medido sobre el
      // banco en producción):
      //
      //  · `error.multiplico` — un niño de kinder no ha visto una
      //    multiplicación, y en 9 de 25 ítems a×b valía lo mismo que contar
      //    un solo grupo: Larry decía «multiplicaste» a quien solo había
      //    contado un montón.
      //  · `error.resto` — en 4 ítems más pasaba lo mismo con |a−b|. Entre
      //    las dos causas, el 44% de la habilidad quedaba mal etiquetada.
      //  · `error.conto_el_primero_dos_veces` — la clave y el valor no
      //    coincidían: a+b+1 no es «contó el primero dos veces».
      errores: sinColision([
        { valor: a + b - 1, causa: "error.se_salto_uno" },
        { valor: a + b + 1, causa: "error.conto_uno_dos_veces" },
      ]).filter((e) => e.valor !== a + b && e.valor >= 1),
      proposito: "interpretar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // El rango va hasta 10 y NO se corta en 5: `1+7` y `7+1` son el mismo
    // resultado y **no la misma tarea** — la estrategia de contar desde el mayor
    // solo se ve cuando el mayor cambia de lado. Con `a,b ≤ 5` esa asimetría no
    // aparecía nunca, y eran 25 sumas para toda la habilidad.
    for (const a of rango(0, 9)) {
      for (const b of rango(1, 9)) {
        if (a + b > 10) continue;
        // Tres objetos: la suma es la misma tarea con patos, estrellas o
        // piedritas, y que el objeto no cambie la operación es justo lo que un
        // niño de cinco todavía no da por hecho.
        for (const ctx of [0, 1, 2]) out.push({
          params: { a, b, ctx },
          variacion: {
            varia: `el sumando mayor pasa a ${Math.max(a, b)}`,
            constante: "sumar contando desde el mayor",
            por_que: "cambiar solo el mayor deja ver que la estrategia no cambia con el número",
          },
        });
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K12 — restar quitando
// ---------------------------------------------------------------------------
export const K12: Plantilla = {
  habilidad: "K12",
  formato: "toca_la_respuesta",
  nivel: 2,
  proposito: "interpretar",
  generar({ a, b, ctx }, variacion) {
    return {
      id: id("K12", { a, b, ctx }),
      habilidad: "K12",
      nivel: 2,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: ctx === 0 ? "k.resta.patos" : ctx === 1 ? "k.resta.estrellas" : "k.resta.piedras",
        vars: { a, b },
      },
      respuesta: { valor: a - b, tol: 0 },
      // `error.resto_al_reves` se borró (plan F5 §3.4j y el rezagado §7 del
      // 2026-08-02): como `parametros()` recorre b < a siempre, b−a era
      // NEGATIVO en el 100% de los ítems —45 de 45— y un número negativo no
      // es algo que un niño de cuatro años pueda tocar. Sobrevivió a la ronda
      // de #345–#361 porque b−a ES un número, y los auditores de entonces
      // buscaban cadenas.
      //
      // En su lugar entra `error.se_salto_uno`, de la familia con fuente
      // (mc-06 §2): quien se salta uno de los que se van quita uno de menos,
      // y queda uno de más.
      errores: sinColision([
        { valor: a + b, causa: "error.sumo" },
        { valor: a - b - 1, causa: "error.conto_el_que_quita" },
        { valor: a - b + 1, causa: "error.se_salto_uno" },
      ]).filter((e) => e.valor !== a - b && e.valor >= 0),
      proposito: "interpretar",
      contexto: "los patos que se van volando",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const a of rango(2, 10)) {
      for (const b of rango(1, a - 1)) {
        for (const ctx of [0, 1, 2]) out.push({
          params: { a, b, ctx },
          variacion: {
            varia: `se quitan ${b}`,
            constante: "el conjunto de partida se ve entero antes de quitar",
            por_que: "variar cuántos se quitan sin cambiar el total separa quitar de contar",
          },
        });
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K03 / K04 — contar
// ---------------------------------------------------------------------------
const contar = (habilidad: "K03" | "K04", tope: number, nivel: number, nCosas: number): Plantilla => ({
  habilidad,
  formato: "toca_para_contar",
  nivel,
  proposito: "interpretar",
  generar({ n, cosa }, variacion) {
    return {
      id: id(habilidad, { n, cosa }),
      habilidad,
      nivel,
      formato: "toca_para_contar",
      // `glifo` va en las variables del enunciado y no en un campo aparte
      // porque es exactamente eso: la cosa que el enunciado nombra. La
      // plantilla del locale no lo usa, y la pantalla sí — igual que
      // `disposicion` en el destello (#347).
      enunciado: {
        clave: COSAS_CONTAR[cosa] ?? "k.contar.patos",
        vars: { n, glifo: GLIFOS_CONTAR[cosa] ?? GLIFOS_CONTAR[0] },
      },
      respuesta: { valor: n, tol: 0 },
      errores: [
        { valor: n - 1, causa: "error.se_salto_uno" },
        { valor: n + 1, causa: "error.conto_uno_dos_veces" },
      ],
      proposito: "interpretar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const desde = habilidad === "K03" ? 1 : 11;
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const n of rango(desde, tope)) {
      for (let cosa = 0; cosa < nCosas; cosa++) {
        out.push({
          params: { n, cosa },
          variacion: {
            varia: `${n} objetos que contar`,
            constante: "se toca cada uno una vez y el último dice cuántos hay",
            por_que:
              "cambiar el objeto sin cambiar el gesto enseña que contar es la misma acción " +
              "para patos, estrellas o piedras — que es justo lo que un niño de cuatro todavía no da por hecho",
          },
        });
      }
    }
    return out;
  },
});

/**
 * Los nueve objetos que se cuentan. Cada uno con su clave, por el género y el
 * artículo — «contarlos» y «contarlas» no se intercambian, y el conteo se
 * autora por idioma (mc-34), no se traduce.
 *
 * El eje es el del comentario de `parametros`: contar es la misma acción para
 * cualquier objeto, y que un niño de cuatro lo descubra exige variar el objeto
 * sin variar el gesto. Con tres objetos la habilidad se agotaba en 30 ítems
 * (#146 pide 86); con nueve, cada cantidad del 1 al 10 se cuenta sobre nueve
 * escenas distintas.
 */
const COSAS_CONTAR = [
  "k.contar.patos",
  "k.contar.estrellas",
  "k.contar.piedras",
  "k.contar.ranas",
  "k.contar.mariposas",
  "k.contar.flores",
  "k.contar.peces",
  "k.contar.conejos",
  "k.contar.manzanas",
] as const;

// K03 usa los nueve objetos (10 cantidades × 9 = 90 ≥ 86 de #146). K04 se
// queda en cinco: contar del 11 al 20 ya es la tarea larga, y 10 × 5 = 50
// cubre los 41 de #147 sin inflar el inventario (plan F5 §1.2).
export const K03 = contar("K03", 10, 1, 9);
export const K04 = contar("K04", 20, 2, 5);

// ---------------------------------------------------------------------------
// K01 / K02 — subitizar (flash)
// ---------------------------------------------------------------------------
/**
 * Las disposiciones del destello. **No son decoración: son el eje del subitizar.**
 *
 * Reconocer cuatro puntos en patrón de dado es casi instantáneo; los mismos
 * cuatro dispersos obligan a contar. Un banco que solo enseña una disposición
 * mide una sola cosa y además se le acaba enseguida — K01 tenía TRES ítems para
 * toda la habilidad, así que un niño veía el mismo destello tres veces y se
 * acababa.
 *
 * `disposicion` viaja en las variables del enunciado y la pinta el cliente; el
 * texto no cambia, porque la pregunta es la misma.
 */
const DISPOSICIONES = ["dado", "linea", "disperso", "par"] as const;

/** Los cuatro objetos del destello. El enunciado los nombra, así que cada uno tiene clave propia. */
const COSAS_FLASH = [
  ["k.flash.puntos", 0],
  ["k.flash.estrellas", 1],
  ["k.flash.patos", 2],
  ["k.flash.mariposas", 3],
] as const;

const subitizar = (habilidad: "K01" | "K02", desde: number, hasta: number): Plantilla => ({
  habilidad,
  formato: "flash",
  nivel: 1,
  proposito: "clasificar",
  generar({ n, disp, cosa }, variacion) {
    const clave = COSAS_FLASH[cosa]?.[0] ?? "k.flash.puntos";
    return {
      id: id(habilidad, { n, disp, cosa }),
      habilidad,
      nivel: 1,
      formato: "flash",
      // El NOMBRE de la disposición, no su índice: es lo que el cliente pone en
      // `data-disposicion` para elegir la retícula. Un índice ahí obligaría a
      // repetir la lista de nombres en el cliente, y dos listas se separan.
      // `glifo` vacío significa «el punto de la hoja de estilo». Sin este
      // campo, «¿Cuántas estrellas viste?» destellaba puntos y «¿Cuántos
      // patitos viste?» también: dos de cada tres destellos enseñaban algo que
      // el enunciado no nombraba (#347).
      enunciado: {
        clave,
        vars: {
          n,
          disposicion: DISPOSICIONES[disp] ?? "linea",
          glifo: GLIFOS_FLASH[cosa] ?? "",
        },
      },
      respuesta: { valor: n, tol: 0 },
      errores: [
        { valor: n - 1, causa: "error.subestimo" },
        { valor: n + 1, causa: "error.sobreestimo" },
      ].filter((e) => e.valor >= 1),
      proposito: "clasificar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const n of rango(desde, hasta)) {
      for (let disp = 0; disp < DISPOSICIONES.length; disp++) {
        for (let cosa = 0; cosa < COSAS_FLASH.length; cosa++) {
          // El patrón de "par" solo existe para cantidades pares: cuatro puntos
          // en dos parejas es una disposición; tres, no.
          if (DISPOSICIONES[disp] === "par" && n % 2 !== 0) continue;
          out.push({
            params: { n, disp, cosa },
            variacion: {
              varia: `${n} en disposición «${DISPOSICIONES[disp]}»`,
              constante: "la exposición es la misma y no da tiempo a contar",
              por_que:
                "la misma cantidad en otra disposición es lo que separa reconocer de contar — " +
                "el dado se ve, el disperso se cuenta",
            },
          });
        }
      }
    }
    return out;
  },
});

export const K01 = subitizar("K01", 1, 3);
export const K02 = subitizar("K02", 4, 6);

// ---------------------------------------------------------------------------
// K10 — descomponer
// ---------------------------------------------------------------------------
export const K10: Plantilla = {
  habilidad: "K10",
  formato: "arma_el_numero",
  nivel: 2,
  proposito: "crear",
  generar({ total, parte }, variacion) {
    return {
      id: id("K10", { total, parte }),
      habilidad: "K10",
      nivel: 2,
      formato: "arma_el_numero",
      enunciado: { clave: "k.descomponer.marco", vars: { total, parte } },
      respuesta: { valor: total - parte, tol: 0 },
      errores: sinColision([
        { valor: total, causa: "error.puso_el_total" },
        { valor: parte, causa: "error.repitio_la_parte" },
        // `error.sumo_en_vez_de_completar` se borró (plan F5 §3.4j): exigía
        // leer dos numerales y sumarlos, y en N2 no se muestran dos numerales.
      ]).filter((e) => e.valor !== total - parte),
      proposito: "crear",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // El 2 también se descompone (1 y 1). Sin él la habilidad empezaba en 3 y
    // se quedaba en 44 ítems, uno por debajo de #153.
    for (const total of rango(2, 10)) {
      for (const parte of rango(1, total - 1)) {
        out.push({
          params: { total, parte },
          variacion: {
            varia: `la parte que ya está es ${parte}`,
            constante: `el total sigue siendo ${total}`,
            por_que: "el mismo total con partes distintas es lo que enseña que se arma de varias formas",
          },
        });
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K07 — comparar más/menos
// ---------------------------------------------------------------------------
export const K07: Plantilla = {
  habilidad: "K07",
  formato: "toca_la_respuesta",
  nivel: 1,
  proposito: "clasificar",
  generar({ izq, der }, variacion) {
    // La respuesta es QUÉ LADO se toca, no cuántos hay.
    //
    // La primera versión devolvía `Math.max(a, b)` —el conteo— con formato
    // `cual_sobra`, y tenía tres cosas mal a la vez:
    //
    //  1. El formato mentía: «cuál sobra» es descartar el que no pertenece;
    //     esto es «toca el grupo que tiene más», que es otro gesto.
    //  2. La respuesta era un número y lo que el niño toca es un grupo. Un niño
    //     de cuatro años no teclea 8: toca el montón de la izquierda.
    //  3. **Los parámetros generaban `b > a` siempre**, así que en los 45 ítems
    //     el grupo correcto era el segundo. Tocar siempre la derecha acertaba el
    //     100% sin mirar la pantalla. El ítem no medía comparar: medía tocar
    //     a la derecha.
    //
    // Lo cazó la crítica adversarial del plan de F5, no una prueba — porque
    // todas las pruebas que escribí comprobaban que el ítem fuera VÁLIDO, y era
    // perfectamente válido. Solo no enseñaba nada.
    const ladoCorrecto = izq > der ? "izq" : "der";
    return {
      id: id("K07", { izq, der }),
      habilidad: "K07",
      nivel: 1,
      formato: "toca_la_respuesta",
      enunciado: { clave: "k.comparar.grupos", vars: { izq, der, glifo: "🦆" } },
      respuesta: { valor: ladoCorrecto, tol: 0 },
      errores: [
        { valor: ladoCorrecto === "izq" ? "der" : "izq", causa: "error.eligio_el_menor" },
      ],
      // Lo que se toca es **el montón**, no la palabra «izquierda».
      //
      // Sin esto, `presentarItem` no tenía más que el valor para poner en el
      // botón, y el botón decía `izq` — la abreviatura española del código,
      // igual en alemán y en francés. Es el mismo fallo de #349 en otra
      // habilidad, y estaba a la vista desde antes: la respuesta se decidió
      // que fuera un lado y no un número justo para que se tocara el montón.
      dibujos: {
        izq: { clave: "lado.izq", glifo: "🦆", cuantos: izq },
        der: { clave: "lado.der", glifo: "🦆", cuantos: der },
      },
      proposito: "clasificar",
      contexto: "dos montones de patos en el lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // Los DOS órdenes de cada par: el grupo mayor cae a la izquierda tantas
    // veces como a la derecha. Sin esto, la posición predice la respuesta.
    for (const menor of rango(1, 9)) {
      for (const mayor of rango(menor + 1, 10)) {
        for (const [izq, der] of [[mayor, menor], [menor, mayor]] as const) {
          out.push({
            params: { izq, der },
            variacion: {
              varia: `la diferencia entre los montones es ${mayor - menor}` +
                (izq > der ? ", con el mayor a la izquierda" : ", con el mayor a la derecha"),
              constante: "los dos montones se ven completos a la vez, sin contar",
              por_que:
                "acercar los tamaños obliga a comparar en vez de mirar cuál se ve más largo, " +
                "y alternar el lado impide que la posición sustituya a la comparación",
            },
          });
        }
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K13 — formas básicas, en el formato que de verdad es «cuál sobra»
// ---------------------------------------------------------------------------
//
// Este es el formato para el que D-048 existe: **toda elección autorada vale
// acierto**. Con tres círculos y un cuadrado, «sobra el cuadrado porque los
// demás son redondos» es la respuesta que el autor esperaba — pero si uno de los
// círculos es el único grande, «sobra ése porque es el más grande» también es
// buen razonamiento, y un producto que lo marca mal enseña a adivinar qué pensó
// el autor en vez de a clasificar.
//
// Por eso cada ítem lleva su segunda respuesta **con la razón escrita**. Sin la
// razón no entra: `validarItem` la exige.
const FORMAS = ["circulo", "cuadrado", "triangulo", "rectangulo"] as const;

export const K13: Plantilla = {
  habilidad: "K13",
  formato: "cual_sobra",
  nivel: 1,
  proposito: "clasificar",
  generar({ familia, intruso, donde, grande }, variacion) {
    const f = FORMAS[familia];
    const i = FORMAS[intruso];
    // `grande` marca cuál de las cuatro casillas se dibuja más grande. Cuando
    // cae sobre una de la familia, esa casilla es una segunda respuesta
    // defendible: sobra por tamaño en vez de por forma.
    const laGrandeEsDeLaFamilia = grande !== donde;

    // ── Las cuatro casillas se dibujan, y las cuatro se pueden tocar ────────
    //
    // Antes solo TRES llegaban a la pantalla —la correcta y dos distractores—
    // y llegaban como los rótulos `casilla3`, `casilla0` y `casilla1` (#349).
    // Ahora la opción ES la figura: las cuatro casillas son las cuatro
    // opciones, en el orden en que se dibujan, y no hay nada que leer.
    //
    // Que sean cuatro y no tres importa por sí solo. Con el intruso siempre en
    // la casilla 3 y solo tres opciones servidas, la que faltaba **nunca era
    // la buena**: el ítem filtraba su propia respuesta.
    const dibujos: Record<string, OpcionDibujada> = {};
    for (let casilla = 0; casilla < 4; casilla++) {
      const forma = casilla === donde ? i : f;
      dibujos[`casilla${casilla}`] = {
        clave: `forma.${forma}`,
        glifo: GLIFO_DE_FORMA[forma] ?? "●",
        grande: casilla === grande,
      };
    }

    return {
      id: id("K13", { familia, intruso, donde, grande }),
      habilidad: "K13",
      nivel: 1,
      formato: "cual_sobra",
      enunciado: { clave: "k.formas.cual_sobra", vars: { familia, intruso, donde, grande } },
      // ── El intruso NO está siempre al final ───────────────────────────────
      //
      // Estaba: la respuesta era `casilla3` en los 40 ítems de la habilidad, y
      // el comentario de esta línea decía que la posición «no predice nada»
      // porque `grande` variaba. Eso es falso y es exactamente el fallo que ya
      // se cometió una vez en K07 —el montón mayor siempre a la derecha— y que
      // está escrito en su encabezado como advertencia.
      //
      // Nadie lo veía porque las opciones que llegaban a la pantalla eran
      // ilegibles: un defecto tapaba al otro. Al hacer tocables las cuatro
      // figuras, «toca siempre la última» habría acertado el 100% sin mirar.
      respuesta: { valor: `casilla${donde}`, tol: 0 },
      tambienCorrectas: laGrandeEsDeLaFamilia
        ? [{ valor: `casilla${grande}`, razon: "razon.sobra_por_tamano" }]
        : undefined,
      // Las TRES de la familia, no dos. La tercera existía en el dibujo y no
      // en las opciones, así que tocarla salía como «respuesta inesperada» —la
      // señal que `mc-40` reserva para un `errores` incompleto— en un ítem
      // cuyo `errores` estaba completo salvo por esta omisión.
      //
      // La causa es `mismo_aspecto_global` y ya no `eligio_al_azar`. La
      // segunda se borró (plan F5 §3.4j): no es una causa, es la ausencia de
      // causa, y definida como comodín apagaba `inesperada` —la única señal
      // que detecta un catálogo incompleto. La que queda es la única de K13
      // con mecanismo documentado (mc-09 §1, van Hiele nivel 0: a esta edad
      // las formas se reconocen por el aspecto global, no por sus
      // propiedades). Ojo: sigue cubriendo todos los fallos del ítem, así que
      // `inesperada` permanece apagada en K13 hasta que exista el catálogo de
      // casi-formas — eso es trabajo de investigación (mc-49), no del banco.
      errores: [0, 1, 2, 3]
        .filter((casilla) => casilla !== donde)
        .map((casilla) => ({ valor: `casilla${casilla}`, causa: "error.mismo_aspecto_global" }))
        .filter((e) => !(laGrandeEsDeLaFamilia && e.valor === `casilla${grande}`)),
      dibujos,
      proposito: "clasificar",
      contexto: `tres ${f}s y un ${i} en la sabana`,
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (let familia = 0; familia < FORMAS.length; familia++) {
      for (let intruso = 0; intruso < FORMAS.length; intruso++) {
        if (familia === intruso) continue;
        // `rectangulo` no puede ser el intruso de `cuadrado` ni al revés: un
        // cuadrado ES un rectángulo, así que «sobra» sería matemáticamente
        // falso. Lo señaló la crítica adversarial del plan de F5.
        const par = [FORMAS[familia], FORMAS[intruso]];
        if (par.includes("cuadrado") && par.includes("rectangulo")) continue;
        // `donde` es la casilla del intruso, y recorre las cuatro. Sin este
        // bucle la respuesta era `casilla3` en toda la habilidad, y con las
        // cuatro figuras ya tocables eso se acierta sin mirar la pantalla —
        // que es el fallo que K07 ya cometió y dejó escrito.
        for (let donde = 0; donde < 4; donde++) {
          for (let grande = 0; grande < 4; grande++) {
            out.push({
              params: { familia, intruso, donde, grande },
              variacion: {
                varia:
                  grande === donde
                    ? `el intruso está en la casilla ${donde} y es además el más grande`
                    : `el intruso está en la casilla ${donde}, y el más grande es de la familia`,
                constante: `tres ${FORMAS[familia]}s y un ${FORMAS[intruso]}`,
                por_que:
                  "separar el tamaño de la forma enseña que la categoría no es lo que más salta " +
                  "a la vista, y da una segunda respuesta defendible (D-048); mover el intruso " +
                  "impide que la posición sustituya a la clasificación",
              },
            });
          }
        }
      }
    }
    return out;
  },
};

/** Las plantillas que hoy generan. Las otras siete esperan curaduría humana. */
// ---------------------------------------------------------------------------
// K05 — correspondencia uno a uno
// ---------------------------------------------------------------------------
//
// **Uno a uno no es contar.** Es la idea de que a cada pato le toca un gorro, y
// se puede saber quién sobra SIN contar ninguno de los dos grupos — emparejando.
// Por eso el enunciado pregunta cuántos se quedan sin gorro y no cuántos hay:
// preguntar «cuántos» convertiría este ítem en uno de K03.
//
// Los distractores nombran los dos errores reales: sumar los dos grupos (contó
// en vez de emparejar) y responder con el grupo más grande (leyó «cuántos
// patos»).
export const K05: Plantilla = {
  habilidad: "K05",
  formato: "toca_la_respuesta",
  nivel: 1,
  proposito: "analizar",
  generar({ patos, gorros }, variacion) {
    const sobran = patos - gorros;
    return {
      id: id("K05", { patos, gorros }),
      habilidad: "K05",
      nivel: 1,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: "k.unoauno.gorros",
        vars: { patos, gorros, glifo: "🦆", glifoB: "🎩" },
      },
      respuesta: { valor: sobran, tol: 0 },
      // `sinColision` no es decoración: cuando `patos = gorros` (no sobra
      // ninguno), «puso el total» y «repitió la parte» valen lo mismo, y la
      // segunda causa era código muerto (plan F5 §4.1).
      errores: sinColision([
        { valor: patos + gorros, causa: "error.conto_los_dos_grupos" },
        { valor: patos, causa: "error.puso_el_total" },
        { valor: gorros, causa: "error.repitio_la_parte" },
      ]).filter((e) => e.valor !== sobran),
      proposito: "analizar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const patos of rango(2, 8)) {
      for (const gorros of rango(1, patos)) {
        out.push({
          params: { patos, gorros },
          variacion: {
            varia: `sobran ${patos - gorros}`,
            constante: "emparejar uno con uno, sin contar",
            por_que: "incluir el caso en que no sobra ninguno es lo que impide aprender «siempre sobra alguno»",
          },
        });
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K06 — cardinalidad
// ---------------------------------------------------------------------------
//
// **El último número que dices ES cuántos hay.** Suena obvio a un adulto y no lo
// es a los cuatro años: un niño puede contar «uno, dos, tres, cuatro»
// perfectamente y, al preguntarle cuántos hay, volver a contar. Esa es la
// distinción entre recitar la secuencia y entender que el último número resume
// el conjunto.
//
// El distractor que importa es `error.dijo_otro_numero_de_la_cuenta`: un número
// que SÍ salió al contar pero no es el último. Un distractor al azar no habría
// distinguido a quien no entiende la cardinalidad de quien no sabe contar.
/**
 * Los siete objetos sobre los que se pregunta la cardinalidad.
 *
 * La primera clave es la original —pregunta por patitos— y no se renombra:
 * las seis nuevas nacen porque el objeto es el eje de variación de esta
 * habilidad y hasta hoy las tres variantes del ítem decían TODAS «patitos»,
 * aunque el parámetro `cosa` dijera otra cosa. Misma familia de defecto que
 * #347: el parámetro decía una cosa y el texto, otra.
 */
const COSAS_CARDINALIDAD = [
  "k.cardinalidad.ultimo",
  "k.cardinalidad.estrellas",
  "k.cardinalidad.piedras",
  "k.cardinalidad.ranas",
  "k.cardinalidad.mariposas",
  "k.cardinalidad.flores",
  "k.cardinalidad.peces",
] as const;

export const K06: Plantilla = {
  habilidad: "K06",
  formato: "toca_la_respuesta",
  nivel: 1,
  proposito: "interpretar",
  generar({ n, cosa }, variacion) {
    return {
      id: id("K06", { n, cosa }),
      habilidad: "K06",
      nivel: 1,
      formato: "toca_la_respuesta",
      enunciado: { clave: COSAS_CARDINALIDAD[cosa] ?? "k.cardinalidad.ultimo", vars: { n, cosa } },
      respuesta: { valor: n, tol: 0 },
      // Con n=2, «otro número de la cuenta» y «se saltó uno» valen los dos 1:
      // `sinColision` deja la primera, que es la que distingue la habilidad.
      errores: sinColision([
        // Un número intermedio de la propia cuenta, no uno cualquiera.
        { valor: Math.max(1, n - 2), causa: "error.dijo_otro_numero_de_la_cuenta" },
        { valor: n - 1, causa: "error.se_salto_uno" },
        { valor: n + 1, causa: "error.conto_uno_dos_veces" },
      ]).filter((e) => e.valor !== n && e.valor > 0),
      proposito: "interpretar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const n of rango(2, 12)) for (let cosa = 0; cosa < COSAS_CARDINALIDAD.length; cosa++) out.push({
      params: { n, cosa },
      variacion: {
        varia: `la cuenta llega a ${n}`,
        constante: "la pregunta es siempre «entonces cuántos hay»",
        por_que: "cambiar solo el final deja ver si el niño recita o si entiende que el último resume",
      },
    });
    return out;
  },
};

// ---------------------------------------------------------------------------
// K08 — recta numérica 0-10
// ---------------------------------------------------------------------------
//
// La recta es lo que convierte el conteo en **posición**: el 7 no es solo lo que
// sigue del 6, está en un sitio. `error.conto_desde_uno` nombra el error propio
// de esta habilidad — el niño que, en vez de leer la recta, vuelve a contar
// desde el principio.
//
// SIETE preguntas sobre la MISMA escena (la recta del 0 al 10 con un hueco,
// que es lo único que la pantalla sabe dibujar de esta habilidad):
//
//  · modo 0 — qué va en el hueco, nombrando el de antes.
//  · modo 1 — qué va en el hueco, nombrando el de después.
//  · modo 2 — qué va entre dos números.
//  · modo 3 — qué número falta, SIN ancla en el texto: la recta misma es la
//    única pista. Es la forma más pura de leer la recta.
//  · modo 4 — estás en el `a` y saltas `k` hacia adelante: la suma como
//    movimiento, que es lo que la recta aporta sobre la secuencia recitada.
//  · modo 5 — lo mismo hacia atrás. La respuesta puede ser 0 —el borde— y
//    ningún distractor sale de la recta: un negativo aquí es el bug de K12
//    del rezagado §7 con otro uniforme.
//  · modo 6 — cuántos saltos hay del `a` al hueco. La trampa natural es
//    contestar con la POSICIÓN del hueco (`a+d`) en vez de con los saltos
//    (`d`), y por eso ese valor lleva `conto_desde_uno`: usó la recta como
//    etiqueta, no como camino.
//
// La pantalla decide dónde va el hueco con `antes`/`despues` (falta =
// antes+1, o despues−1), así que cada modo deja esas variables puestas aunque
// el enunciado no las nombre — igual que `glifo` en `toca_para_contar`.
export const K08: Plantilla = {
  habilidad: "K08",
  formato: "toca_la_respuesta",
  nivel: 2,
  proposito: "interpretar",
  generar(p, variacion) {
    const { modo, antes, a, k, d } = p;
    let enunciado: { clave: string; vars: Record<string, number | string> };
    let respuesta: number;
    let errores: Array<{ valor: number | string; causa: string }>;

    if (modo <= 2) {
      // Las tres preguntas originales, sobre el hueco en `antes + 1`.
      const falta = antes + 1;
      enunciado =
        modo === 0
          ? { clave: "k.recta.hueco", vars: { antes } }
          : modo === 1
            ? { clave: "k.recta.antes", vars: { despues: antes + 2 } }
            : { clave: "k.recta.entre", vars: { antes, despues: antes + 2 } };
      respuesta = falta;
      // Con `antes = 1`, «repitió la parte» y «contó desde uno» valen los dos
      // 1: `sinColision` deja la primera y la otra no se emite muerta.
      errores = sinColision([
        { valor: antes, causa: "error.repitio_la_parte" },
        { valor: falta + 1, causa: "error.se_salto_uno" },
        { valor: 1, causa: "error.conto_desde_uno" },
      ]).filter((e) => e.valor !== falta && Number(e.valor) >= 0 && Number(e.valor) <= 10);
    } else if (modo === 3) {
      // «Falta un número. ¿Cuál es?» — el hueco ES el parámetro (0..10), y el
      // texto no nombra a ningún vecino: la recta es la única pista.
      enunciado = {
        clave: "k.recta.falta",
        vars: antes === 0 ? { despues: 1 } : { antes: antes - 1 },
      };
      respuesta = antes;
      errores = sinColision([
        { valor: antes - 1, causa: "error.se_salto_uno" },
        { valor: antes + 1, causa: "error.conto_uno_dos_veces" },
        { valor: 1, causa: "error.conto_desde_uno" },
      ]).filter((e) => e.valor !== antes && Number(e.valor) >= 0 && Number(e.valor) <= 10);
    } else if (modo === 4) {
      // Saltos hacia adelante: caes en a+k, y el hueco se dibuja ahí
      // (`despues` − 1 = a + k). Con k=1, «se saltó uno» vale lo mismo que
      // «repitió la parte» — `sinColision` deja la que distingue: no saltó.
      enunciado = { clave: `k.recta.salta_${k}`, vars: { a, k, despues: a + k + 1 } };
      respuesta = a + k;
      errores = sinColision([
        { valor: a, causa: "error.repitio_la_parte" },
        { valor: a + k - 1, causa: "error.se_salto_uno" },
        { valor: a + k + 1, causa: "error.conto_uno_dos_veces" },
      ]).filter((e) => e.valor !== a + k && Number(e.valor) >= 0 && Number(e.valor) <= 10);
    } else if (modo === 5) {
      // Saltos hacia atrás: caes en a−k, que puede ser 0. El filtro de abajo
      // es el que hace imposible POR CONSTRUCCIÓN un distractor negativo —
      // la lección del `b − a` de K12 (rezagados §7).
      enunciado = { clave: `k.recta.regresa_${k}`, vars: { a, k, antes: a - k - 1 } };
      respuesta = a - k;
      errores = sinColision([
        { valor: a, causa: "error.repitio_la_parte" },
        { valor: a - k + 1, causa: "error.se_salto_uno" },
        { valor: a - k - 1, causa: "error.conto_uno_dos_veces" },
      ]).filter((e) => e.valor !== a - k && Number(e.valor) >= 0 && Number(e.valor) <= 10);
    } else {
      // ¿Cuántos saltos del `a` al hueco? La respuesta es `d`, no la posición
      // `a + d` — confundir las dos ES el error que esta pregunta mide.
      enunciado = { clave: "k.recta.saltos", vars: { a, antes: a + d - 1 } };
      respuesta = d;
      errores = sinColision([
        { valor: d - 1, causa: "error.se_salto_uno" },
        { valor: d + 1, causa: "error.conto_uno_dos_veces" },
        { valor: a + d, causa: "error.conto_desde_uno" },
      ]).filter((e) => e.valor !== d && Number(e.valor) >= 0 && Number(e.valor) <= 10);
    }

    return {
      // El id sale de TODOS los parámetros del modo, así que dos modos con el
      // mismo ancla no comparten id (el bloqueo 1 del plan F5: `id()` no
      // lleva nombre de plantilla, así que la forma de los parámetros es la
      // única frontera entre modos).
      id: id("K08", p),
      habilidad: "K08",
      nivel: 2,
      formato: "toca_la_respuesta",
      enunciado,
      respuesta: { valor: respuesta, tol: 0 },
      errores,
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    const empuja = (params: Record<string, number>, variacion: Variacion) =>
      out.push({ params, variacion });

    // Los tres modos originales conservan su forma de parámetros —y por tanto
    // sus ids—; el modo 0 gana el hueco en el 10, que cierra la recta.
    for (const antes of rango(0, 9)) empuja({ antes, modo: 0 }, {
      varia: `el hueco va después del ${antes}`,
      constante: "la recta va del 0 al 10 y se lee de izquierda a derecha",
      por_que: "recorrer el hueco por toda la recta enseña que «el que sigue» depende del sitio, no del número recitado",
    });
    for (const antes of rango(0, 8)) empuja({ antes, modo: 1 }, {
      varia: `el hueco va antes del ${antes + 2}`,
      constante: "la recta va del 0 al 10 y se lee de izquierda a derecha",
      por_que: "preguntar «qué va antes», y no solo «qué sigue», es lo que distingue leer la recta de recitar hacia adelante",
    });
    for (const antes of rango(0, 8)) empuja({ antes, modo: 2 }, {
      varia: `el hueco está entre el ${antes} y el ${antes + 2}`,
      constante: "la recta va del 0 al 10 y se lee de izquierda a derecha",
      por_que: "el hueco en medio exige usar los DOS vecinos: es la lectura de la recta que la secuencia recitada no da",
    });
    // Sin ancla en el texto: la recta misma es la única pista.
    for (const antes of rango(0, 10)) empuja({ antes, modo: 3 }, {
      varia: `falta el ${antes}, sin que el texto nombre a nadie`,
      constante: "la pregunta es siempre «falta un número, ¿cuál es?»",
      por_que: "quitar la ancla del enunciado es lo que convierte la recta de apoyo en la única fuente de la respuesta",
    });
    // Saltos: la suma y la resta como movimiento sobre la recta.
    for (const k of rango(1, 3)) {
      for (const a of rango(0, 10 - k)) empuja({ a, k, modo: 4 }, {
        varia: `desde el ${a}, ${k} salto(s) hacia adelante`,
        constante: "cada salto avanza una casilla de la recta",
        por_que: "saltar sobre la recta es la suma hecha movimiento — y con k de 1 a 3 el salto largo se distingue del «qué sigue»",
      });
      for (const a of rango(k, 10)) empuja({ a, k, modo: 5 }, {
        varia: `desde el ${a}, ${k} salto(s) hacia atrás`,
        constante: "cada salto retrocede una casilla de la recta",
        por_que: "retroceder sobre la recta es la resta hecha movimiento, y caer en el 0 enseña que la recta tiene borde",
      });
    }
    // Contar saltos hasta el hueco: la distancia, no la posición.
    for (const a of rango(0, 9)) {
      for (const d of rango(1, Math.min(5, 10 - a))) empuja({ a, d, modo: 6 }, {
        varia: `del ${a} al hueco hay ${d} salto(s)`,
        constante: "el hueco marca dónde se termina de contar",
        por_que: "contar los pasos y no leer la etiqueta es lo que separa la distancia de la posición — los dos usos de la recta",
      });
    }
    return out;
  },
};

// ---------------------------------------------------------------------------
// K09 — marco de diez
// ---------------------------------------------------------------------------
//
// El marco de diez enseña el 10 como referencia: seis llenas se VEN como «una
// fila y una más», no como seis cosas contadas. Por eso la pregunta es cuántas
// faltan y no cuántas hay.
//
// Es la misma pregunta que K10 —completar hasta un total— y se distingue en que
// **aquí el total es siempre diez**. Esa constancia es el punto: el niño acaba
// sabiendo los pares del diez sin contarlos.
export const K09: Plantilla = {
  habilidad: "K09",
  formato: "arma_el_numero",
  nivel: 2,
  proposito: "crear",
  generar({ llenas, pregunta }, variacion) {
    const faltan = 10 - llenas;
    // Cuatro preguntas sobre el mismo marco. Las dos originales: cuántas
    // faltan y cuántas hay — «cuántas hay» parece más fácil y no lo es: el
    // marco se lee de vista, una fila y dos más, y esa lectura es lo que
    // enseña el diez como referencia. Las dos nuevas son el uno-más y el
    // uno-menos anclados al marco: imaginar la ficha que entra o la que sale
    // sin que el total deje de ser diez.
    const enunciado =
      pregunta === 0
        ? { clave: "k.marco.faltan", vars: { llenas } }
        : pregunta === 1
          ? { clave: "k.marco.llenas", vars: { llenas } }
          : pregunta === 2
            ? { clave: "k.marco.pon_una", vars: { llenas } }
            : { clave: "k.marco.quita_una", vars: { llenas } };
    const respuesta =
      pregunta === 0 ? faltan : pregunta === 1 ? llenas : pregunta === 2 ? llenas + 1 : llenas - 1;
    return {
      id: id("K09", { llenas, pregunta }),
      habilidad: "K09",
      nivel: 2,
      formato: "arma_el_numero",
      enunciado,
      respuesta: { valor: respuesta, tol: 0 },
      // `sinColision` muerde con `llenas = 9` y pregunta «cuántas hay»: «puso
      // el total» y «contó uno dos veces» valen los dos 10. Y con el marco
      // lleno («quita una» con llenas = 10), «repitió la parte» y «puso el
      // total» valen los dos 10.
      errores: sinColision(pregunta === 0
        ? [
            { valor: 10, causa: "error.puso_el_total" },
            { valor: llenas, causa: "error.repitio_la_parte" },
            // `error.sumo_en_vez_de_completar` se borró por la misma razón
            // que en K10 (plan F5 §3.4j): dos numerales que sumar, en N2.
          ]
        : pregunta === 1
          ? [
              { valor: faltan, causa: "error.repitio_la_parte" },
              { valor: 10, causa: "error.puso_el_total" },
              { valor: llenas + 1, causa: "error.conto_uno_dos_veces" },
            ]
          : pregunta === 2
            ? [
                { valor: llenas, causa: "error.repitio_la_parte" },
                { valor: llenas + 2, causa: "error.conto_uno_dos_veces" },
                { valor: 10, causa: "error.puso_el_total" },
              ]
            : [
                { valor: llenas, causa: "error.repitio_la_parte" },
                { valor: llenas - 2, causa: "error.conto_el_que_quita" },
                { valor: 10, causa: "error.puso_el_total" },
              ]
      // Un distractor fuera del marco no se puede tocar: con «pon una» y 9
      // llenas, contar una de más daría 11 — y el marco tiene diez.
      ).filter((e) => e.valor !== respuesta && Number(e.valor) >= 0 && Number(e.valor) <= 10),
      proposito: "crear",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const llenas of rango(1, 9)) for (const pregunta of [0, 1]) out.push({
      params: { llenas, pregunta },
      variacion: {
        varia: `${llenas} llenas, se pregunta ${pregunta === 0 ? "cuántas faltan" : "cuántas hay"}`,
        constante: "el marco siempre es de diez",
        por_que: "el total constante es lo que hace que los pares del diez se aprendan de vista",
      },
    });
    // «Pon una más» arranca en 1 (con 0 llenas el enunciado tendría que decir
    // «ninguna», y eso se autora aparte) y «quita una» llega hasta el marco
    // lleno, que es donde quitar una deja 9 — el par del diez al revés.
    for (const llenas of rango(1, 9)) out.push({
      params: { llenas, pregunta: 2 },
      variacion: {
        varia: `${llenas} llenas y entra una ficha más`,
        constante: "el marco siempre es de diez",
        por_que: "imaginar la ficha que entra sin recontar el marco es el uno-más anclado al diez",
      },
    });
    for (const llenas of rango(1, 10)) out.push({
      params: { llenas, pregunta: 3 },
      variacion: {
        varia: `${llenas} llenas y sale una ficha`,
        constante: "el marco siempre es de diez",
        por_que: "quitar una del marco lleno enseña el nueve como «el diez menos una», no como un conteo nuevo",
      },
    });
    return out;
  },
};

// ---------------------------------------------------------------------------
// K14 — patrones AB
// ---------------------------------------------------------------------------
//
// **Un patrón no es una serie de cosas bonitas: es una regla.** El niño tiene
// que ver que se alternan y decir cuál toca, no adivinar cuál le gusta.
//
// `largo` es cuántos elementos se enseñan antes del hueco, y **la respuesta es 0
// o 1** —cuál de los dos dibujos— y no un conteo. Con `largo` par toca el
// primero; con impar, el segundo. Los dos casos aparecen el mismo número de
// veces a propósito: si el hueco siempre cayera en el mismo, el niño acertaría
// tocando siempre lo mismo sin haber visto ningún patrón. Ese fallo ya ocurrió
// una vez en este banco —en K07, donde el grupo mayor era siempre el segundo— y
// está escrito en su encabezado.
//
// `par` es QUÉ dos figuras se alternan, y es el eje que faltaba: con una sola
// pareja (círculo-cuadrado siempre), «patrón» y «estas dos figuras» se
// confunden — el niño puede acertar todas sin haber visto la regla, solo
// recordando qué se tocó ayer. Con las seis parejas de las cuatro formas, la
// regla tiene que sobrevivir al cambio de piezas, que es lo que un patrón es.
// En ABC la terna se queda fija: ya son tres piezas distintas que seguir.
const PARES_DE_FORMAS: Array<readonly [number, number]> = [];
for (let i = 0; i < FORMAS.length; i++) {
  for (let j = i + 1; j < FORMAS.length; j++) PARES_DE_FORMAS.push([i, j] as const);
}

export const K14: Plantilla = {
  habilidad: "K14",
  formato: "toca_la_respuesta",
  nivel: 1,
  proposito: "analizar",
  generar({ largo, primero, ciclo, par }, variacion) {
    // Con `largo` elementos ya puestos, el siguiente es el que ocupa la
    // posición `largo` (contando desde 0) en la alternancia.
    // `ciclo` es 2 para AB y 3 para ABC. La regla no cambia —se repite un
    // grupo— y el salto de dos a tres elementos es lo que separa «veo que se
    // alternan» de «veo que hay un grupo que vuelve», que es lo que un patrón
    // es de verdad.
    const sigue = (primero + largo) % ciclo;

    // ── La respuesta es la FIGURA, no su índice (#349) ─────────────────────
    //
    // Antes la respuesta era el número `0`, `1` o `2`, y `presentarItem` lo
    // escribía tal cual: una fila de figuras alternándose y debajo tres
    // botones que decían «0», «1», «2». Nada en la pantalla decía qué figura
    // era el 0. Peor que ilegible: **parece contestable** —son números, y todo
    // el resto del banco pregunta números— así que quien juega contesta un
    // conteo a una pregunta que no lo era.
    //
    // Es el mismo defecto de `casilla3` con otra cara, y por eso se arregla
    // igual: la opción es la cosa. `figura0` no se lee nunca; se dibuja.
    const figurasDelCiclo =
      ciclo === 2
        ? (PARES_DE_FORMAS[par] ?? PARES_DE_FORMAS[0]).map((i) => FORMAS[i])
        : FORMAS.slice(0, 3);
    const dibujos: Record<string, OpcionDibujada> = {};
    for (let k = 0; k < ciclo; k++) {
      dibujos[`figura${k}`] = {
        clave: `forma.${figurasDelCiclo[k]}`,
        glifo: GLIFO_DE_FORMA[figurasDelCiclo[k]] ?? "●",
      };
    }

    return {
      id: id("K14", { largo, primero, ciclo, par }),
      habilidad: "K14",
      nivel: 1,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: ciclo === 2 ? "k.patron.sigue" : "k.patron.sigue_tres",
        // `figuras` es el ciclo ya resuelto en glifos, en orden. La pantalla
        // dibujaba la fila con SU propia lista de figuras y en otro orden que
        // el banco; con esto hay una sola lista y es la del ítem.
        vars: {
          largo,
          primero,
          ciclo,
          figuras: figurasDelCiclo.map((n) => GLIFO_DE_FORMA[n] ?? "●").join(""),
        },
      },
      respuesta: { valor: `figura${sigue}`, tol: 0 },
      // Con núcleo AB los dos errores son la MISMA figura —solo hay dos
      // roles, así que «repitió el último» y «siguió el patrón al revés» son
      // un solo valor con dos nombres (plan F5 §4.1). `sinColision` deja uno.
      errores: sinColision([
        { valor: `figura${(sigue + ciclo - 1) % ciclo}`, causa: "error.repitio_el_ultimo" },
        { valor: `figura${(sigue + 1) % ciclo}`, causa: "error.siguio_el_patron_al_reves" },
      ]).filter((e) => e.valor !== `figura${sigue}`),
      dibujos,
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    // AB: las seis parejas de las cuatro formas, cada una con sus dos arranques.
    for (let par = 0; par < PARES_DE_FORMAS.length; par++) {
      for (const largo of rango(3, 11)) {
        for (const primero of [0, 1]) out.push({
          params: { largo, primero, ciclo: 2, par },
          variacion: {
            varia:
              `AB de ${FORMAS[PARES_DE_FORMAS[par][0]]} y ${FORMAS[PARES_DE_FORMAS[par][1]]}, ` +
              `${largo} antes del hueco, empieza por el ${primero + 1}`,
            constante: "la regla es siempre repetir un grupo",
            por_que:
              "cambiar la pareja de figuras es lo que separa ver la regla de recordar qué se tocó " +
              "ayer, y alternar cuál empieza impide acertar tocando siempre el mismo dibujo",
          },
        });
      }
    }
    // ABC: la terna queda fija — ya son tres piezas distintas que seguir.
    for (const largo of rango(3, 11)) {
      for (const primero of rango(0, 2)) out.push({
        params: { largo, primero, ciclo: 3, par: 0 },
        variacion: {
          varia: `ABC, ${largo} antes del hueco, empieza por el ${primero + 1}`,
          constante: "la regla es siempre repetir un grupo",
          por_que: "alternar cuál empieza es lo que impide acertar tocando siempre el mismo dibujo",
        },
      });
    }
    return out;
  },
};

export const PLANTILLAS: Plantilla[] = [
  K01, K02, K03, K04, K05, K06, K07, K08, K09, K10, K11, K12, K13, K14,
];

/** Habilidades sin plantilla todavía, dichas en voz alta y no escondidas. */
/**
 * Las habilidades sin plantilla. **Vacío desde F5**: las catorce están.
 *
 * Se queda como lista y no se borra porque es lo que hace visible el hueco el
 * día que alguien añada una habilidad nueva a `HABILIDADES_KINDER` sin escribir
 * su plantilla — sin esta lista, la habilidad existiría en la tabla y no
 * produciría ni un ítem, en silencio.
 */
export const SIN_PLANTILLA: HabilidadKinder[] = [];

/**
 * Genera el banco entero desde las plantillas.
 *
 * Determinista: los mismos parámetros dan los mismos ítems con los mismos ids,
 * corrida tras corrida. Sin eso, un ítem cambiaría de identidad entre despliegues
 * y el historial de intentos de un niño apuntaría a nada.
 *
 * VALIDA cada ítem antes de devolverlo (issue #366). `validarItem` existía,
 * estaba bien escrita y su comentario prometía que ningún ítem mal formado se
 * sirve — pero su único llamador era su propia prueba, con ítems sintéticos:
 * la garantía no se ejecutaba nunca sobre el banco real. Esta función es la
 * puerta por la que todo ítem sale al mundo (la siembra de `item_bank` y el
 * mapa en memoria de `apps/ingest`), así que la validación vive AQUÍ y no en
 * cada consumidor: un ítem mal formado revienta la construcción del banco
 * entero, en el build y en el arranque de ingest, nunca en la pantalla de un
 * niño.
 */
export function generarBanco(): Item[] {
  const banco = PLANTILLAS.flatMap((p) =>
    p.parametros().map(({ params, variacion }) => p.generar(params, variacion)),
  );
  const malos = banco.flatMap((item) =>
    validarItem(item).map((problema) => `${item.id}: ${problema}`),
  );
  if (malos.length > 0) {
    throw new Error(
      `generarBanco(): ${malos.length} ítem(s) mal formados — el banco NO se construye:\n  · ` +
        malos.join("\n  · "),
    );
  }
  return banco;
}
