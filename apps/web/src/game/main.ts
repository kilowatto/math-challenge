/**
 * main.ts — el ÚNICO lugar donde se construye `new Phaser.Game(...)` para
 * Modo Historia (D-184).
 *
 * ─── Por qué existe esta función y no un script suelto en la página ────────
 *
 * La tarea pedía explícitamente revisar "dónde se inicializa `new
 * Phaser.Game(...)` actualmente" antes de escribir código, para no crear una
 * segunda instancia por accidente. Se buscó en todo el repo (`grep -r
 * "Phaser"`) y no había ninguna — este es el primer y único punto de montaje.
 * Que sea una función exportada, y no código suelto en el `<script>` de la
 * página, es lo que hace que "solo hay un `new Phaser.Game()`" se pueda
 * verificar con una búsqueda de texto en vez de con disciplina.
 */
import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MapScene } from "./scenes/MapScene";
import { ChallengeScene } from "./scenes/ChallengeScene";
import { DialogueScene } from "./scenes/DialogueScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { ProgressManager, type DatosDeArranque } from "./managers/ProgressManager";

export function iniciarHistoria(contenedorId: string, datos: DatosDeArranque): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: contenedorId,
    backgroundColor: "#F7F7F8", // superficie-clara (paleta Ignia) — se ve un instante antes de que BootScene pinte el fondo real
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    // WebGL con antialias apagado y pixelArt en false: el arte procedural de
    // hoy es de formas planas, no de píxeles — mc-47 §5 (Android de gama
    // baja) es la razón de mantener el renderer lo más simple posible.
    render: { antialias: true, pixelArt: false },
    scene: [BootScene, PreloadScene, MapScene, ChallengeScene, DialogueScene, GameplayScene],
  });

  // El registro se siembra ANTES de que corra la primera escena: el
  // constructor de `Phaser.Game` ya deja `game.registry` listo, y las escenas
  // no arrancan hasta el siguiente tick.
  const progressManager = new ProgressManager(game.registry, datos);
  game.registry.set("progressManager", progressManager);

  return game;
}
