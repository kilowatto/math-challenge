/**
 * La serie: la unidad de diseño, no la pregunta suelta.
 *
 * CLAUDE.md § Contenido lo dice así, y el plan §9 lo repite: *"La curaduría es
 * el trabajo, no la generación."* Treinta sumas al azar y una serie de treinta
 * ítems no son lo mismo aunque tengan los mismos ítems dentro.
 *
 * Este módulo hace cumplir cuatro cosas que la investigación pide y que un `for`
 * sobre el banco no daría:
 *
 *  1. **Intercalado, no bloque** (`mc-05`). Practicar diez del mismo tipo
 *     seguidos **se siente** mejor y **aprende** peor. El bloque da fluidez que
 *     se evapora; el intercalado obliga a elegir la estrategia, que es la parte
 *     difícil y la que se retiene.
 *  2. **Ejemplo trabajado antes de la práctica** (`mc-04`). La primera vez que
 *     alguien ve una habilidad, resolver desde cero consume toda la memoria de
 *     trabajo en buscar el método en vez de en aprenderlo.
 *  3. **Variación explícita, no azarosa** (`mc-02`). La enseñanza con variación
 *     china cambia **una** cosa a la vez, a propósito. Un orden aleatorio no es
 *     variación: es ruido que a veces parece variación.
 *  4. **Espaciado** (`mc-05`). Una habilidad vista hoy y repasada mañana se
 *     retiene mucho mejor que vista dos veces hoy.
 */

import type { Item } from "./item.ts";

export interface PasoDeSerie {
  item: Item;
  /** `true` si este paso se muestra resuelto, sin pedir respuesta (`mc-04`). */
  ejemploTrabajado: boolean;
  /** Qué cambió respecto al paso anterior. `null` solo en el primero. */
  variacion: string | null;
}

export interface Serie {
  pasos: PasoDeSerie[];
  /** Las habilidades que toca, en orden de primera aparición. */
  habilidades: string[];
}

/** Cuántos ítems seguidos de la misma habilidad se toleran (`mc-05`). */
export const MAX_SEGUIDOS = 2;

/**
 * Arma una serie intercalada a partir de ítems agrupados por habilidad.
 *
 * @param porHabilidad  ítems ya elegidos, agrupados por habilidad
 * @param yaVistas      habilidades que este alumno ya practicó antes; las que no
 *                      estén aquí reciben ejemplo trabajado (`mc-04`)
 *
 * El algoritmo es deliberadamente simple: se rota entre habilidades tomando de
 * la que más ítems le quedan, con el tope de `MAX_SEGUIDOS`. No pretende ser
 * óptimo — pretende ser **explicable**, porque una serie que nadie puede leer
 * tampoco se puede curar, y la curaduría es el trabajo.
 */
export function armarSerie(
  porHabilidad: Record<string, Item[]>,
  yaVistas: Set<string> = new Set(),
): Serie {
  const pendientes = new Map<string, Item[]>();
  for (const [h, items] of Object.entries(porHabilidad)) {
    if (items.length > 0) pendientes.set(h, [...items]);
  }
  if (pendientes.size === 0) {
    throw new Error("no se puede armar una serie sin ítems");
  }

  const pasos: PasoDeSerie[] = [];
  const habilidades: string[] = [];
  const conEjemplo = new Set<string>();
  let ultima: string | null = null;
  let seguidos = 0;

  while (pendientes.size > 0) {
    // La habilidad con más ítems pendientes, saltándose la última si ya se
    // usó MAX_SEGUIDOS veces seguidas. Si no hay alternativa, se permite —
    // mejor un tercero seguido que dejar ítems fuera de la serie.
    const candidatas = [...pendientes.keys()].filter(
      (h) => !(h === ultima && seguidos >= MAX_SEGUIDOS) || pendientes.size === 1,
    );
    const elegida = candidatas.sort(
      (a, b) => (pendientes.get(b)!.length - pendientes.get(a)!.length) || a.localeCompare(b),
    )[0];

    const cola = pendientes.get(elegida)!;
    const item = cola.shift()!;
    if (cola.length === 0) pendientes.delete(elegida);

    if (!habilidades.includes(elegida)) habilidades.push(elegida);

    // mc-04: la PRIMERA vez que aparece una habilidad no vista, se muestra
    // resuelta. Resolver desde cero una habilidad nueva gasta la memoria de
    // trabajo en buscar el método en vez de en aprenderlo.
    const primeraVez = !yaVistas.has(elegida) && !conEjemplo.has(elegida);
    if (primeraVez) conEjemplo.add(elegida);

    pasos.push({
      item,
      ejemploTrabajado: primeraVez,
      variacion: pasos.length === 0 ? null : item.variacion,
    });

    seguidos = elegida === ultima ? seguidos + 1 : 1;
    ultima = elegida;
  }

  return { pasos, habilidades };
}

/**
 * Comprueba que una serie cumpla lo que `mc-05`, `mc-04` y `mc-02` piden.
 *
 * Devuelve los problemas; vacío significa que la serie está bien armada. Se usa
 * desde el auditor y desde la curaduría — una serie mal armada no falla, solo
 * enseña peor, y por eso hace falta que algo la mire.
 */
export function validarSerie(serie: Serie): string[] {
  const p: string[] = [];

  if (serie.pasos.length === 0) {
    p.push("serie vacía");
    return p;
  }

  // 1. Intercalado (mc-05)
  let seguidos = 1;
  for (let i = 1; i < serie.pasos.length; i++) {
    const misma = serie.pasos[i].item.habilidad === serie.pasos[i - 1].item.habilidad;
    seguidos = misma ? seguidos + 1 : 1;
    if (seguidos > MAX_SEGUIDOS && serie.habilidades.length > 1) {
      p.push(
        `${seguidos} ítems seguidos de ${serie.pasos[i].item.habilidad} (paso ${i + 1}). ` +
          `mc-05: el bloque da fluidez que se evapora. El tope es ${MAX_SEGUIDOS} cuando hay ` +
          "más de una habilidad disponible.",
      );
      break;
    }
  }

  // 2. Ejemplo trabajado (mc-04)
  const conEjemplo = new Set(
    serie.pasos.filter((x) => x.ejemploTrabajado).map((x) => x.item.habilidad),
  );
  const primeras = new Map<string, number>();
  serie.pasos.forEach((x, i) => {
    if (!primeras.has(x.item.habilidad)) primeras.set(x.item.habilidad, i);
  });
  for (const [h, i] of primeras) {
    if (conEjemplo.has(h) && !serie.pasos[i].ejemploTrabajado) {
      p.push(`${h}: el ejemplo trabajado no es su primera aparición (mc-04)`);
    }
  }

  // 3. Variación explícita (mc-02)
  const sinVariacion = serie.pasos
    .map((x, i) => ({ x, i }))
    .filter(({ x, i }) => i > 0 && !x.ejemploTrabajado && (x.variacion === null || x.variacion === ""));
  if (sinVariacion.length > 0) {
    p.push(
      `${sinVariacion.length} paso(s) sin eje de variación declarado (el primero, el ` +
        `${sinVariacion[0].i + 1}). mc-02: la variación se decide, no se sortea — un orden ` +
        "aleatorio es ruido que a veces parece variación.",
    );
  }

  // 4. Propósito (mc-36)
  const sinProposito = serie.pasos.filter((x) => !x.item.proposito?.trim());
  if (sinProposito.length > 0) {
    p.push(`${sinProposito.length} ítem(s) sin propósito declarado (mc-36)`);
  }

  return p;
}

/**
 * El intervalo de repaso, en días, según cuántas veces se ha repasado (`mc-05`).
 *
 * Espaciado expansivo: 1, 3, 7, 16, 35 días. Los números salen de la curva de
 * olvido y no de una fórmula bonita — lo que importa es que **crezcan**, porque
 * repasar siempre al mismo intervalo no espacia nada.
 */
export const INTERVALOS_DIAS = [1, 3, 7, 16, 35];

export function proximoRepaso(repasosHechos: number): number {
  return INTERVALOS_DIAS[Math.min(repasosHechos, INTERVALOS_DIAS.length - 1)];
}

/** ¿Toca repasar esta habilidad hoy? */
export function tocaRepasar(
  ultimoRepasoDias: number,
  repasosHechos: number,
): boolean {
  return ultimoRepasoDias >= proximoRepaso(repasosHechos);
}
