/**
 * main.ts — el punto de montaje de Modo Historia.
 *
 * ─── Ya NO construye Phaser ────────────────────────────────────────────────
 *
 * Este archivo tenía su propio `new Phaser.Game(...)`, y su encabezado
 * explicaba que era «el único de SU pantalla» porque
 * `quien-juega/main.ts` tenía otro para la suya — y decía, con todas las
 * letras, que «uno solo en todo el producto» era una regla que nunca estuvo
 * escrita.
 *
 * Ahora lo está (decisión del dueño al revisar el loader): una sola SPA, una
 * sola instancia. Vive en `game/juego.ts::crearJuego()`, y esto queda como el
 * envoltorio que dice CON QUÉ pantalla abre una sesión montada desde
 * `kids/mapa.astro` — carga directa por enlace o refresco, que D-012 exige que
 * siga funcionando.
 */
import Phaser from "phaser";
import { crearJuego } from "./juego";
import type { DatosDeArranque } from "./managers/ProgressManager";

export function iniciarHistoria(contenedorId: string, datos: DatosDeArranque): Phaser.Game {
  return crearJuego(contenedorId, { escena: "BootScene", datos });
}
