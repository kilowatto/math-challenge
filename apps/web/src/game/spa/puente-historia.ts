/**
 * puente-historia.ts — arranca Modo Historia DENTRO de la sesión de Phaser
 * que ya está corriendo (D-200.1, fase 2), sin crear un `Phaser.Game`
 * nuevo ni recargar la página.
 *
 * `game/main.ts::iniciarHistoria()` sigue existiendo intacto — lo sigue
 * usando `mapa.astro` cuando alguien entra DIRECTO a esa URL (enlace,
 * refresco, JavaScript deshabilitado: D-012 exige que esa página funcione
 * sola). Esta función hace lo mismo que esa, MENOS crear el `Phaser.Game`
 * (ya existe) y MENOS `BootScene`/`PreloadScene` (`CargaGlobalScene` ya
 * precargó la unión completa de `assets-manifest.ts`, y la única textura
 * procedural de `BootScene` se genera aquí mismo).
 *
 * Registrar escenas en un `Phaser.Game` que ya está corriendo es una
 * operación normal de Phaser (`scene.add(clave, Clase, autoStart)` no
 * exige que el juego se acabe de crear) — nunca se tocan `MenuScene`,
 * `MapScene`, `ChallengeScene`, `DialogueScene` ni `GameplayScene`: son las
 * MISMAS clases que usa la página independiente, reusadas tal cual.
 */
import type Phaser from "phaser";
import { MenuScene } from "../scenes/MenuScene";
import { MapScene } from "../scenes/MapScene";
import { ChallengeScene } from "../scenes/ChallengeScene";
import { DialogueScene } from "../scenes/DialogueScene";
import { GameplayScene } from "../scenes/GameplayScene";
import { ProgressManager, type DatosDeArranque } from "../managers/ProgressManager";

const ESCENAS_HISTORIA: ReadonlyArray<[string, new (...args: any[]) => Phaser.Scene]> = [
  ["MenuScene", MenuScene],
  ["MapScene", MapScene],
  ["ChallengeScene", ChallengeScene],
  ["DialogueScene", DialogueScene],
  ["GameplayScene", GameplayScene],
];

/** La misma textura procedural de `BootScene.ts` — duplicada a propósito: esa escena sigue viva para la carga independiente de `/mapa/`, y esta función nunca la arranca (no hace falta un segundo salto de escena solo para una textura). */
function asegurarAvatarMarca(scene: Phaser.Scene): void {
  const clave = "avatar-marca";
  if (scene.textures.exists(clave)) return;
  const g = scene.add.graphics();
  g.fillStyle(0xf36b1c, 1);
  g.fillCircle(20, 20, 16);
  g.lineStyle(3, 0xffffff, 1);
  g.strokeCircle(20, 20, 16);
  g.generateTexture(clave, 40, 40);
  g.destroy();
}

/**
 * Arranca Modo Historia sobre `game` — llamado cuando el PIN se resuelve
 * bien dentro de la misma sesión (`puente-pin.ts`). `escenaActual` es la
 * que hay que detener (`QuienJuegaScene`, o `GameplayScene` si viene de
 * "salir del reto", D-200.1 fase 3).
 */
export function arrancarHistoriaEnSesion(
  game: Phaser.Game,
  escenaActual: Phaser.Scene,
  datos: DatosDeArranque,
): string {
  for (const [clave, Clase] of ESCENAS_HISTORIA) {
    if (!game.scene.getScene(clave)) game.scene.add(clave, Clase, false);
  }
  asegurarAvatarMarca(escenaActual);

  // Un `ProgressManager` nuevo por cada entrada al mapa — la sesión trae
  // datos frescos del servidor (pericia real, D-183), nunca el árbol de la
  // visita anterior si el niño salió y volvió a entrar por PIN otra vez.
  const progressManager = new ProgressManager(game.registry, datos);
  game.registry.set("progressManager", progressManager);

  // `musicManager`/`sfxManager` YA existen (los puso `arrancarQuienJuega`
  // sobre el `game.sound` de ESTE `Phaser.Game`) — Modo Historia los lee
  // con las mismas claves de registro, así que la música que ya sonaba en
  // "¿quién juega?" sigue sin cortarse, en vez de reiniciar.

  escenaActual.scene.stop();
  const claveEscena = progressManager.modo === "camino" ? "MenuScene" : "MapScene";
  if (claveEscena === "MenuScene") game.scene.start("MenuScene");
  else game.scene.start("MapScene", { chapterId: progressManager.chapterId });
  return claveEscena;
}
