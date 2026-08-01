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
  generar({ a, b }, variacion) {
    return {
      id: id("K11", { a, b }),
      habilidad: "K11",
      nivel: 2,
      formato: "toca_la_respuesta",
      enunciado: { clave: "k.suma.patos", vars: { a, b } },
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
    for (const a of rango(1, 5)) {
      for (const b of rango(1, 5)) {
        if (a + b > 10) continue;
        out.push({
          params: { a, b },
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
  generar({ a, b }, variacion) {
    return {
      id: id("K12", { a, b }),
      habilidad: "K12",
      nivel: 2,
      formato: "toca_la_respuesta",
      enunciado: { clave: "k.resta.patos", vars: { a, b } },
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
        out.push({
          params: { a, b },
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
  generar({ n }, variacion) {
    return {
      id: id(habilidad, { n }),
      habilidad,
      nivel,
      formato: "toca_para_contar",
      enunciado: { clave: "k.contar.patos", vars: { n } },
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
    return rango(desde, tope).map((n) => ({
      params: { n },
      variacion: {
        varia: `${n} objetos que contar`,
        constante: "se toca cada uno una vez y el último dice cuántos hay",
        por_que: "cambiar la cantidad sin cambiar el gesto enseña la cardinalidad",
      },
    }));
  },
});

export const K03 = contar("K03", 10, 1);
export const K04 = contar("K04", 20, 2);

// ---------------------------------------------------------------------------
// K01 / K02 — subitizar (flash)
// ---------------------------------------------------------------------------
const subitizar = (habilidad: "K01" | "K02", desde: number, hasta: number): Plantilla => ({
  habilidad,
  formato: "flash",
  nivel: 1,
  proposito: "clasificar",
  generar({ n }, variacion) {
    return {
      id: id(habilidad, { n }),
      habilidad,
      nivel: 1,
      formato: "flash",
      enunciado: { clave: "k.flash.puntos", vars: { n } },
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
    return rango(desde, hasta).map((n) => ({
      params: { n },
      variacion: {
        varia: `${n} puntos`,
        constante: "la exposición es la misma y no da tiempo a contar",
        por_que: "subir la cantidad sin dar tiempo marca dónde acaba el subitizar",
      },
    }));
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
  formato: "cual_sobra",
  nivel: 1,
  proposito: "clasificar",
  generar({ a, b }, variacion) {
    const mayor = Math.max(a, b);
    return {
      id: id("K07", { a, b }),
      habilidad: "K07",
      nivel: 1,
      formato: "cual_sobra",
      enunciado: { clave: "k.comparar.grupos", vars: { a, b } },
      respuesta: { valor: mayor, tol: 0 },
      errores: [{ valor: Math.min(a, b), causa: "error.eligio_el_menor" }],
      proposito: "clasificar",
      variacion,
    };
  },
  parametros() {
    const out: Array<{ params: Record<string, number>; variacion: string }> = [];
    for (const a of rango(1, 9)) {
      for (const b of rango(a + 1, 10)) {
        out.push({
          params: { a, b },
          variacion: {
            varia: `la diferencia entre los grupos es ${b - a}`,
            constante: "los dos grupos se ven completos a la vez",
            por_que: "acercar los tamaños obliga a comparar en vez de mirar cuál se ve más largo",
          },
        });
      }
    }
    return out;
  },
};

/** Las plantillas que hoy generan. Las otras siete esperan curaduría humana. */
export const PLANTILLAS: Plantilla[] = [K01, K02, K03, K04, K07, K10, K11, K12];

/** Habilidades sin plantilla todavía, dichas en voz alta y no escondidas. */
export const SIN_PLANTILLA: HabilidadKinder[] = ["K05", "K06", "K08", "K09", "K13", "K14"];

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
