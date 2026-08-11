/**
 * main.ts (QuienJuegaScene) — el ÚNICO lugar donde se construye
 * `new Phaser.Game(...)` para la pantalla "¿Quién juega?" (D-192).
 *
 * Es una instancia de Phaser SEPARADA de la de Modo Historia
 * (`game/main.ts::iniciarHistoria`) — viven en páginas distintas
 * (`kids/index.astro` vs. `kids/mapa.astro`) y nunca corren a la vez. El
 * comentario de `game/main.ts` decía "el único lugar del REPO" y eso dejó de
 * ser cierto al añadir esta pantalla; se corrigió ahí para decir "el único
 * lugar PARA MODO HISTORIA", que es lo que de verdad hacía falta que fuera
 * verdad.
 */
import Phaser from "phaser";
import { QuienJuegaScene, type DatosQuienJuega } from "./QuienJuegaScene";
import { PinScene } from "./PinScene";

/**
 * `scene: []` a propósito: si `QuienJuegaScene` fuera parte del arreglo de
 * escenas del config, Phaser la auto-arranca SIN datos en cuanto el juego
 * existe, y `init()` recibiría `undefined` — un `create()` que revienta
 * leyendo `this.datos.rotulos`. `game.scene.add(clave, Clase, true, datos)`
 * registra Y arranca en el mismo paso, con los datos ya puestos.
 */
export function arrancarQuienJuega(contenedorId: string, datos: DatosQuienJuega): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: contenedorId,
    backgroundColor: "#FFFFFF",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    render: { antialias: true, pixelArt: false },
    scene: [],
  });
  game.scene.add("QuienJuegaScene", QuienJuegaScene, true, datos);
  // Registrada pero NO arrancada (`false`): la lanza `QuienJuegaScene` al
  // tocar una cara, con el `childId` puesto. En el arreglo `scene:` del config
  // Phaser la auto-arrancaría sin datos y `init()` recibiría `undefined`.
  game.scene.add("PinScene", PinScene, false);
  return game;
}
