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

import type { Item, Variacion } from "./item.ts";

export interface PasoDeSerie {
  item: Item;
  /**
   * Cuánto ejemplo se muestra, de 1 a 0 (`mc-04` §3).
   *
   * **Se desvanece con la pericia, y eso NO es un detalle de presentación.** El
   * efecto del ejemplo trabajado **se invierte** cuando el alumno ya sabe: a un
   * experto, mirar la solución le estorba en vez de ayudarle, porque tiene que
   * mapear el método ajeno sobre el suyo. Un ejemplo que no se desvanece deja de
   * enseñar y empieza a molestar.
   *
   *   1.0  la solución entera, sin pedir respuesta
   *   0.5  los primeros pasos resueltos, el último lo hace el alumno
   *   0.0  sin ejemplo: práctica
   */
  ejemplo: number;
  /** `true` mientras haya algo de ejemplo. Comodidad para la pantalla. */
  ejemploTrabajado: boolean;
  /** Qué cambió respecto al paso anterior. `null` solo en el primero. */
  variacion: Variacion | null;
}

/**
 * Cuánto ejemplo toca, según lo que el perfil ya sabe de esa habilidad.
 *
 * `skillState` va de 0 (nunca la ha tocado) a 1 (la domina). Los cortes no son
 * finos a propósito: tres escalones se pueden explicar a un maestro y un
 * gradiente continuo no.
 */
export function ejemploSegunPericia(skillState: number): number {
  if (skillState <= 0.2) return 1;
  if (skillState <= 0.6) return 0.5;
  return 0;
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
  /**
   * Lo que el perfil sabe de cada habilidad, de 0 a 1. Una habilidad ausente
   * vale 0: nunca la ha tocado, así que abre con el ejemplo completo.
   */
  pericia: Record<string, number> | Set<string> = {},
): Serie {
  // Un `Set` de habilidades vistas sigue funcionando: se lee como pericia 1.
  const skill = (h: string): number =>
    pericia instanceof Set ? (pericia.has(h) ? 1 : 0) : (pericia[h] ?? 0);
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
  /** El formato del último ítem servido y cuántos seguidos lleva. */
  let ultimoFormato: string | null = null;
  let seguidosFormato = 0;

  while (pendientes.size > 0) {
    // La habilidad con más ítems pendientes, saltándose la última si ya se
    // usó MAX_SEGUIDOS veces seguidas. Si no hay alternativa, se permite —
    // mejor un tercero seguido que dejar ítems fuera de la serie.
    const candidatas = [...pendientes.keys()].filter(
      (h) => !(h === ultima && seguidos >= MAX_SEGUIDOS) || pendientes.size === 1,
    );
    const porTamano = (a: string, b: string) =>
      (pendientes.get(b)!.length - pendientes.get(a)!.length) || a.localeCompare(b);

    // ─── También se alterna el FORMATO, no solo la habilidad ────────────────
    //
    // Alternar habilidades bastaba mientras el banco tenía nueve, porque los
    // formatos venían repartidos. Con las catorce de F5, **nueve usan
    // `toca_la_respuesta`** —el 65% de los ítems— así que dos habilidades
    // distintas seguidas son casi siempre el mismo gesto, y `validarSerie` lo
    // detectó: tres seguidos del mismo formato en el paso 5.
    //
    // Que dos ítems se sientan iguales es exactamente lo que `mc-05` llama
    // bloque, aunque el tema cambie. Se prefiere una habilidad cuyo siguiente
    // ítem tenga OTRO formato; si no hay ninguna, se sigue por tamaño — mejor
    // repetir formato que dejar ítems fuera de la serie.
    // ─── El formato se PACEA, no se alterna a la fuerza ────────────────────
    //
    // Forzar «siempre distinto del anterior» parece lo estricto y produce el
    // resultado peor. Con las catorce habilidades de F5 el reparto es
    // `toca_la_respuesta` 35 contra 31 de todo lo demás en una sesión típica:
    // alternando uno a uno, los escasos se acaban a mitad de serie y la cola
    // queda `RRRR`. Medido: racha de 4 en el paso 66 de 66.
    //
    // La regla que sí funciona es la de siempre en este tipo de problema:
    // **prohibir el trío, permitir el par, y elegir siempre el formato al que
    // más le queda.** Así el abundante gasta sus dobles repartidos y los
    // escasos duran hasta el final. Es lo mismo que hace `ordenDeSesion()` en el
    // programador, con la diferencia de que aquí el eje es el formato.
    const restanPorFormato = new Map<string, number>();
    for (const cola of pendientes.values()) {
      for (const it of cola) restanPorFormato.set(it.formato, (restanPorFormato.get(it.formato) ?? 0) + 1);
    }
    const abundancia = (h: string) => restanPorFormato.get(pendientes.get(h)![0].formato) ?? 0;

    // Solo se prohíbe el formato anterior cuando ya lleva MAX_SEGUIDOS seguidos.
    const sinTrio = seguidosFormato >= MAX_SEGUIDOS
      ? candidatas.filter((h) => pendientes.get(h)![0].formato !== ultimoFormato)
      : candidatas;

    const elegida = (sinTrio.length > 0 ? sinTrio : candidatas).sort(
      (a, b) => (abundancia(b) - abundancia(a)) || porTamano(a, b),
    )[0];

    const cola = pendientes.get(elegida)!;
    const item = cola.shift()!;
    if (cola.length === 0) pendientes.delete(elegida);

    if (!habilidades.includes(elegida)) habilidades.push(elegida);

    // mc-04: el ejemplo aparece la primera vez que se toca la habilidad EN ESTA
    // serie, y su cantidad depende de la pericia. A quien ya domina no se le
    // muestra nada, porque el efecto se invierte con la pericia (mc-04 §3).
    const primeraVezAqui = !conEjemplo.has(elegida);
    const cuanto = primeraVezAqui ? ejemploSegunPericia(skill(elegida)) : 0;
    if (primeraVezAqui) conEjemplo.add(elegida);

    pasos.push({
      item,
      ejemplo: cuanto,
      ejemploTrabajado: cuanto > 0,
      variacion: pasos.length === 0 ? null : item.variacion,
    });

    seguidos = elegida === ultima ? seguidos + 1 : 1;
    ultima = elegida;
    seguidosFormato = item.formato === ultimoFormato ? seguidosFormato + 1 : 1;
    ultimoFormato = item.formato;
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

  // 1. Intercalado por habilidad Y por formato (mc-05, criterio #44).
  //
  // El criterio dice «ni de la misma habilidad ni del mismo modelo». Son dos
  // bloques distintos: cinco sumas seguidas bloquean el tema, y cinco «toca la
  // respuesta» seguidos bloquean la ESTRATEGIA aunque los temas varíen — el
  // niño deja de elegir cómo resolver y solo elige qué tocar.
  for (const eje of ["habilidad", "formato"] as const) {
    // Para la habilidad se mira `serie.habilidades`, que dice qué había
    // DISPONIBLE; para el formato, cuántos distintos aparecen. La diferencia
    // importa: una serie de cuatro ítems todos de K01 con K03 disponible es un
    // bloque evitable, y contar solo lo que aparece la daría por buena — que es
    // exactamente lo que hizo esta comprobación en su primera versión.
    const disponibles = eje === "habilidad"
      ? serie.habilidades.length
      : new Set(serie.pasos.map((x) => x.item.formato)).size;
    if (disponibles < 2) continue;
    let seguidos = 1;
    for (let i = 1; i < serie.pasos.length; i++) {
      seguidos = serie.pasos[i].item[eje] === serie.pasos[i - 1].item[eje] ? seguidos + 1 : 1;
      if (seguidos > MAX_SEGUIDOS) {
        p.push(
          `${seguidos} ítems seguidos con ${eje} "${serie.pasos[i].item[eje]}" (paso ${i + 1}). ` +
            `mc-05: el bloque da fluidez que se evapora. El tope es ${MAX_SEGUIDOS} mientras ` +
            `haya más de un ${eje} disponible.`,
        );
        break;
      }
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
    .filter(({ x, i }) =>
      i > 0 && !x.ejemploTrabajado &&
      (!x.variacion || !x.variacion.varia || !x.variacion.constante || !x.variacion.por_que));
  if (sinVariacion.length > 0) {
    p.push(
      `${sinVariacion.length} paso(s) sin eje de variación declarado (el primero, el ` +
        `${sinVariacion[0].i + 1}). mc-02: la variación se decide, no se sortea — un orden ` +
        "aleatorio es ruido que a veces parece variación.",
    );
  }

  // 4. Propósito (mc-36)
  const sinProposito = serie.pasos.filter((x) => !x.item.proposito);
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
