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

import type { Item, Formato, Proposito, Variacion } from "./item.ts";

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
      enunciado: { clave: ctx === 0 ? "k.suma.patos" : "k.suma.estrellas", vars: { a, b } },
      respuesta: { valor: a + b, tol: 0 },
      // Los distractores se CALCULAN. Un error escrito a mano puede acabar
      // siendo la respuesta correcta de otro ítem de la misma plantilla.
      errores: [
        { valor: a * b, causa: "error.multiplico" },
        { valor: Math.abs(a - b), causa: "error.resto" },
        { valor: a + b + 1, causa: "error.conto_el_primero_dos_veces" },
      ].filter((e) => e.valor !== a + b),
      proposito: "interpretar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: string }> = [];
    // El rango va hasta 10 y NO se corta en 5: `1+7` y `7+1` son el mismo
    // resultado y **no la misma tarea** — la estrategia de contar desde el mayor
    // solo se ve cuando el mayor cambia de lado. Con `a,b ≤ 5` esa asimetría no
    // aparecía nunca, y eran 25 sumas para toda la habilidad.
    for (const a of rango(0, 9)) {
      for (const b of rango(1, 9)) {
        if (a + b > 10) continue;
        for (const ctx of [0, 1]) out.push({
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
      enunciado: { clave: ctx === 0 ? "k.resta.patos" : "k.resta.estrellas", vars: { a, b } },
      respuesta: { valor: a - b, tol: 0 },
      errores: [
        { valor: a + b, causa: "error.sumo" },
        { valor: b - a, causa: "error.resto_al_reves" },
        { valor: a - b - 1, causa: "error.conto_el_que_quita" },
      ].filter((e) => e.valor !== a - b),
      proposito: "interpretar",
      contexto: "los patos que se van volando",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: string }> = [];
    for (const a of rango(2, 10)) {
      for (const b of rango(1, a - 1)) {
        for (const ctx of [0, 1]) out.push({
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
const contar = (habilidad: "K03" | "K04", tope: number, nivel: number): Plantilla => ({
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
      enunciado: { clave: COSAS_CONTAR[cosa] ?? "k.contar.patos", vars: { n } },
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
      for (let cosa = 0; cosa < COSAS_CONTAR.length; cosa++) {
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

/** Los tres objetos que se cuentan. Cada uno con su clave, por el género y el artículo. */
const COSAS_CONTAR = ["k.contar.patos", "k.contar.estrellas", "k.contar.piedras"] as const;

export const K03 = contar("K03", 10, 1);
export const K04 = contar("K04", 20, 2);

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

/** Los tres objetos del destello. El enunciado los nombra, así que cada uno tiene clave propia. */
const COSAS_FLASH = [
  ["k.flash.puntos", 0],
  ["k.flash.estrellas", 1],
  ["k.flash.patos", 2],
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
      enunciado: { clave, vars: { n, disposicion: disp } },
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
      errores: [
        { valor: total, causa: "error.puso_el_total" },
        { valor: parte, causa: "error.repitio_la_parte" },
        { valor: total + parte, causa: "error.sumo_en_vez_de_completar" },
      ].filter((e) => e.valor !== total - parte),
      proposito: "crear",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: string }> = [];
    for (const total of rango(3, 10)) {
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
      enunciado: { clave: "k.comparar.grupos", vars: { izq, der } },
      respuesta: { valor: ladoCorrecto, tol: 0 },
      errores: [
        { valor: ladoCorrecto === "izq" ? "der" : "izq", causa: "error.eligio_el_menor" },
      ],
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
  generar({ familia, intruso, grande }, variacion) {
    const f = FORMAS[familia];
    const i = FORMAS[intruso];
    // `grande` marca cuál de las cuatro casillas se dibuja más grande. Cuando
    // cae sobre una de la familia, esa casilla es una segunda respuesta
    // defendible: sobra por tamaño en vez de por forma.
    const laGrandeEsDeLaFamilia = grande !== 3;
    return {
      id: id("K13", { familia, intruso, grande }),
      habilidad: "K13",
      nivel: 1,
      formato: "cual_sobra",
      enunciado: { clave: "k.formas.cual_sobra", vars: { familia, intruso, grande } },
      // El intruso está siempre en la casilla 3; `grande` decide qué casilla se
      // dibuja mayor, así que la posición del intruso no predice nada por sí
      // sola — lo que predice es la FORMA, que es lo que se quiere enseñar.
      respuesta: { valor: "casilla3", tol: 0 },
      tambienCorrectas: laGrandeEsDeLaFamilia
        ? [{ valor: `casilla${grande}`, razon: "razon.sobra_por_tamano" }]
        : undefined,
      errores: [
        { valor: "casilla0", causa: "error.eligio_al_azar" },
        { valor: "casilla1", causa: "error.eligio_al_azar" },
      ].filter((e) => e.valor !== `casilla${grande}` || !laGrandeEsDeLaFamilia),
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
        for (let grande = 0; grande < 4; grande++) {
          out.push({
            params: { familia, intruso, grande },
            variacion: {
              varia:
                grande === 3
                  ? "el intruso es además el más grande"
                  : `la casilla ${grande} se dibuja más grande y es de la familia`,
              constante: `tres ${FORMAS[familia]}s y un ${FORMAS[intruso]}`,
              por_que:
                "separar el tamaño de la forma enseña que la categoría no es lo que más salta " +
                "a la vista, y da una segunda respuesta defendible (D-048)",
            },
          });
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
      enunciado: { clave: "k.unoauno.gorros", vars: { patos, gorros } },
      respuesta: { valor: sobran, tol: 0 },
      errores: [
        { valor: patos + gorros, causa: "error.conto_los_dos_grupos" },
        { valor: patos, causa: "error.puso_el_total" },
        { valor: gorros, causa: "error.repitio_la_parte" },
      ].filter((e) => e.valor !== sobran),
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
      enunciado: { clave: "k.cardinalidad.ultimo", vars: { n, cosa } },
      respuesta: { valor: n, tol: 0 },
      errores: [
        // Un número intermedio de la propia cuenta, no uno cualquiera.
        { valor: Math.max(1, n - 2), causa: "error.dijo_otro_numero_de_la_cuenta" },
        { valor: n - 1, causa: "error.se_salto_uno" },
        { valor: n + 1, causa: "error.conto_uno_dos_veces" },
      ].filter((e) => e.valor !== n && e.valor > 0),
      proposito: "interpretar",
      contexto: "los patos del lago de Larry",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const n of rango(2, 12)) for (const cosa of [0, 1, 2]) out.push({
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
export const K08: Plantilla = {
  habilidad: "K08",
  formato: "toca_la_respuesta",
  nivel: 2,
  proposito: "interpretar",
  generar({ antes, modo }, variacion) {
    const falta = antes + 1;
    return {
      id: id("K08", { antes, modo }),
      habilidad: "K08",
      nivel: 2,
      formato: "toca_la_respuesta",
      // Tres preguntas sobre la misma recta: qué va después, qué va antes y qué
      // va en medio. La tercera es la que de verdad exige leer la recta y no
      // recitar la secuencia hacia adelante.
      enunciado:
        modo === 0
          ? { clave: "k.recta.hueco", vars: { antes } }
          : modo === 1
            ? { clave: "k.recta.antes", vars: { despues: antes + 2 } }
            : { clave: "k.recta.entre", vars: { antes, despues: antes + 2 } },
      respuesta: { valor: falta, tol: 0 },
      errores: [
        { valor: antes, causa: "error.repitio_la_parte" },
        { valor: falta + 1, causa: "error.se_salto_uno" },
        { valor: 1, causa: "error.conto_desde_uno" },
      ].filter((e) => e.valor !== falta),
      proposito: "interpretar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const antes of rango(0, 8)) for (const modo of [0, 1, 2]) out.push({
      params: { antes, modo },
      variacion: {
        varia: `el hueco está ${modo === 0 ? "después del" : modo === 1 ? "antes del" : "entre el"} ${antes}`,
        constante: "la recta va del 0 al 10 y se lee de izquierda a derecha",
        por_que:
          "preguntar «qué va antes» y «qué va en medio», y no solo «qué sigue», es lo que " +
          "distingue leer la recta de recitar la secuencia hacia adelante",
      },
    });
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
    return {
      id: id("K09", { llenas, pregunta }),
      habilidad: "K09",
      nivel: 2,
      formato: "arma_el_numero",
      // Las dos preguntas del marco. «Cuántas hay» parece más fácil y no lo es:
      // el marco se lee de vista —una fila y dos más— y esa lectura es lo que
      // enseña el diez como referencia.
      enunciado: pregunta === 0
        ? { clave: "k.marco.faltan", vars: { llenas } }
        : { clave: "k.marco.llenas", vars: { llenas } },
      respuesta: { valor: pregunta === 0 ? faltan : llenas, tol: 0 },
      errores: (pregunta === 0
        ? [
            { valor: 10, causa: "error.puso_el_total" },
            { valor: llenas, causa: "error.repitio_la_parte" },
            { valor: 10 + llenas, causa: "error.sumo_en_vez_de_completar" },
          ]
        : [
            { valor: faltan, causa: "error.repitio_la_parte" },
            { valor: 10, causa: "error.puso_el_total" },
            { valor: llenas + 1, causa: "error.conto_uno_dos_veces" },
          ]
      ).filter((e) => e.valor !== (pregunta === 0 ? faltan : llenas)),
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
export const K14: Plantilla = {
  habilidad: "K14",
  formato: "toca_la_respuesta",
  nivel: 1,
  proposito: "analizar",
  generar({ largo, primero, ciclo }, variacion) {
    // Con `largo` elementos ya puestos, el siguiente es el que ocupa la
    // posición `largo` (contando desde 0) en la alternancia.
    // `ciclo` es 2 para AB y 3 para ABC. La regla no cambia —se repite un
    // grupo— y el salto de dos a tres elementos es lo que separa «veo que se
    // alternan» de «veo que hay un grupo que vuelve», que es lo que un patrón
    // es de verdad.
    const sigue = (primero + largo) % ciclo;
    return {
      id: id("K14", { largo, primero, ciclo }),
      habilidad: "K14",
      nivel: 1,
      formato: "toca_la_respuesta",
      enunciado: {
        clave: ciclo === 2 ? "k.patron.sigue" : "k.patron.sigue_tres",
        vars: { largo, primero, ciclo },
      },
      respuesta: { valor: sigue, tol: 0 },
      errores: [
        { valor: (sigue + ciclo - 1) % ciclo, causa: "error.repitio_el_ultimo" },
        { valor: (sigue + 1) % ciclo, causa: "error.siguio_el_patron_al_reves" },
      ].filter((e) => e.valor !== sigue),
      proposito: "analizar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: Variacion }> = [];
    for (const ciclo of [2, 3]) {
      for (const largo of rango(3, 11)) {
        for (const primero of rango(0, ciclo - 1)) out.push({
          params: { largo, primero, ciclo },
          variacion: {
            varia: `${ciclo === 2 ? "AB" : "ABC"}, ${largo} antes del hueco, empieza por el ${primero + 1}`,
            constante: "la regla es siempre repetir un grupo",
            por_que: "alternar cuál empieza es lo que impide acertar tocando siempre el mismo dibujo",
          },
        });
      }
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
 */
export function generarBanco(): Item[] {
  return PLANTILLAS.flatMap((p) =>
    p.parametros().map(({ params, variacion }) => p.generar(params, variacion)),
  );
}
