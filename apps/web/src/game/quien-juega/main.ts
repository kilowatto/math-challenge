/**
 * main.ts (¿Quién juega?) — el punto de montaje de la puerta del niño.
 *
 * ─── Ya NO construye Phaser ────────────────────────────────────────────────
 *
 * Este archivo tenía su propio `new Phaser.Game(...)`, separado del de Modo
 * Historia, porque vivían en páginas distintas que nunca corrían a la vez
 * (D-192). Esa era la justificación, y dejó de valer: con dos instancias,
 * entrar al mapa tras el PIN destruía una sesión entera de Phaser y construía
 * otra, tirando todo lo precargado justo en la transición más frecuente del
 * producto.
 *
 * Una sola SPA, una sola instancia (decisión del dueño). Se construye en
 * `game/juego.ts::crearJuego()`; esto solo dice con qué pantalla abre.
 *
 * Abre por `CargaGlobalScene` y no por `QuienJuegaScene`: D-200 precarga el
 * catálogo entero antes de que el niño vea nada, y arranca la rejilla ella
 * misma al terminar.
 */
import Phaser from "phaser";
import { crearJuego } from "../juego";
import type { DatosQuienJuega } from "./QuienJuegaScene";

export function arrancarQuienJuega(contenedorId: string, datos: DatosQuienJuega): Phaser.Game {
  return crearJuego(contenedorId, { escena: "CargaGlobalScene", datos });
}
