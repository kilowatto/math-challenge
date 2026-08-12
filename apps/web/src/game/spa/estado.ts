/**
 * estado.ts — qué pantalla muestra la sesión de SPA ahora mismo (D-200.1),
 * para que el botón atrás del sistema sepa qué deshacer.
 *
 * Deliberadamente el mínimo: un valor y, cuando aplica, la clave de la
 * escena de Modo Historia que hay que detener para volver. No es un router
 * completo — un `popstate` que salta MÁS de un paso hacia atrás en una
 * sola vez (pulsar atrás dos veces muy rápido) puede no reconstruir el
 * estado intermedio perfectamente; es un caso raro y conocido, anotado
 * aquí a propósito en vez de fingir que está resuelto.
 */
import type Phaser from "phaser";

export type FaseSpa = "rejilla" | "pin" | "historia";

let fase: FaseSpa = "rejilla";
let juego: Phaser.Game | null = null;
let claveEscenaHistoria: string | null = null;

/** Se llama una sola vez, cuando `arrancarQuienJuega` crea el `Phaser.Game`. */
export function registrarJuego(g: Phaser.Game): void {
  juego = g;
}

export function fijarFase(nueva: FaseSpa, claveEscena: string | null = null): void {
  fase = nueva;
  claveEscenaHistoria = nueva === "historia" ? claveEscena : null;
}

export function faseActual(): FaseSpa {
  return fase;
}

/** Detiene la escena de Modo Historia activa, si hay una — para volver a "¿quién juega?" desde el mapa/reto. */
export function detenerEscenaHistoriaActual(): void {
  if (juego && claveEscenaHistoria) juego.scene.stop(claveEscenaHistoria);
}
