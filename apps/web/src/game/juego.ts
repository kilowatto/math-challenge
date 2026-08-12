/**
 * juego.ts — el ÚNICO lugar de todo el producto donde se construye
 * `new Phaser.Game(...)`.
 *
 * ─── Por qué existe, y qué reemplaza ───────────────────────────────────────
 *
 * Había DOS instancias de Phaser, en dos páginas distintas:
 *
 *   · `game/quien-juega/main.ts::arrancarQuienJuega()` — la rejilla de caras
 *     y el PIN, montada por `kids/index.astro`.
 *   · `game/main.ts::iniciarHistoria()` — el mapa y el reto, montada por
 *     `kids/mapa.astro`.
 *
 * Cada una era «la única de SU pantalla», y el encabezado de `game/main.ts`
 * decía con todas las letras que «uno solo en todo el producto» era una regla
 * que **nunca estuvo escrita**. Ahora lo está: el dueño la fijó al revisar el
 * loader — *«solo debe haber una SPA y una sola Phaser»*.
 *
 * ─── Qué cambia de verdad, más allá de contar instancias ───────────────────
 *
 * Con dos instancias, entrar al mapa tras el PIN era una **navegación de
 * página**: se destruía una sesión de Phaser entera, el navegador cargaba otro
 * documento, y se construía otra desde cero. Todo lo precargado se tiraba.
 * Eso es lo que hace imposible un loader que valga la pena —precargar 5 MB
 * para que la primera transición los descarte— y es la razón real de esta
 * fusión, no la estética de tener un solo archivo.
 *
 * ─── Las escenas se REGISTRAN, no se arrancan ──────────────────────────────
 *
 * `scene: []` en el config, y `game.scene.add(clave, Clase, false)` para cada
 * una. Meterlas en el arreglo `scene:` haría que Phaser auto-arranque la
 * primera **sin datos**, y `init()` recibiría `undefined` — un `create()` que
 * revienta leyendo `this.datos.rotulos`. Ya estaba documentado en
 * `quien-juega/main.ts` y se conserva porque el motivo no ha cambiado.
 *
 * Quién arranca qué lo decide `arranque`, que trae la escena Y sus datos.
 */
import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { MapScene } from "./scenes/MapScene";
import { ChallengeScene } from "./scenes/ChallengeScene";
import { DialogueScene } from "./scenes/DialogueScene";
import { GameplayScene } from "./scenes/GameplayScene";
import { QuienJuegaScene, type DatosQuienJuega } from "./quien-juega/QuienJuegaScene";
import { PinScene } from "./quien-juega/PinScene";
import { PerfilAjustesScene } from "./quien-juega/PerfilAjustesScene";
import { LoaderScene } from "./quien-juega/LoaderScene";
import { CargaAssetsScene } from "./quien-juega/CargaAssetsScene";
import { ProgressManager, type DatosDeArranque } from "./managers/ProgressManager";
import { MusicManager } from "./managers/MusicManager";
import { SfxManager } from "./managers/SfxManager";

/**
 * Todas las escenas del producto, con su clave.
 *
 * El orden no importa —ninguna arranca al registrarse— pero se agrupan por
 * pantalla para que se lea de un vistazo qué hay.
 */
const ESCENAS: ReadonlyArray<[string, new (...args: never[]) => Phaser.Scene]> = [
  // La puerta: el loader, la rejilla de caras, el PIN y los ajustes.
  ["LoaderScene", LoaderScene],
  // No se arranca nunca a mano: la lanza `LoaderScene`, que es quien pinta.
  // Ver el encabezado de `CargaAssetsScene` para por qué son dos.
  ["CargaAssetsScene", CargaAssetsScene],
  ["QuienJuegaScene", QuienJuegaScene],
  ["PinScene", PinScene],
  ["PerfilAjustesScene", PerfilAjustesScene],
  // Modo Historia: arranque, mapa, reto.
  ["BootScene", BootScene],
  ["PreloadScene", PreloadScene],
  ["MenuScene", MenuScene],
  ["MapScene", MapScene],
  ["ChallengeScene", ChallengeScene],
  ["DialogueScene", DialogueScene],
  ["GameplayScene", GameplayScene],
];

/**
 * Con qué pantalla abre esta sesión.
 *
 * `LoaderScene` es la puerta del niño: baja lo que falte del catálogo antes de
 * que vea nada, y arranca `QuienJuegaScene` ella misma al terminar.
 */
export type Arranque =
  | { escena: "LoaderScene"; datos: DatosQuienJuega }
  | { escena: "BootScene"; datos: DatosDeArranque };

/**
 * Config reconciliado de las dos instancias que había.
 *
 * `backgroundColor` era `#FFFFFF` en «¿quién juega?» y `#F7F7F8` en historia.
 * Gana el segundo —superficie-clara de la paleta Ignia— porque es el que
 * eligió D-184 a propósito: se ve un instante antes de que la escena pinte su
 * fondo real, y un blanco puro ahí es exactamente el destello de formulario
 * que la guía de estilo proscribe.
 *
 * `physics.default: "matter"` lo va a necesitar el loader (los 100 cuadros que
 * caen). **No añade peso**: el vendor de Phaser que ya viaja en el bundle
 * incluye el motor Matter completo —`dist/phaser.esm.js` es un bundle de
 * webpack, no es tree-shakeable— así que hoy se paga sin usarse. Activarlo es
 * una bandera, no un import nuevo.
 */
export function crearJuego(contenedorId: string, arranque: Arranque): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: contenedorId,
    backgroundColor: "#F7F7F8",
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    // WebGL con `pixelArt` en false: el arte es ilustración, no píxeles —
    // `mc-47` §5 (Android de gama baja) es la razón de mantener el renderer lo
    // más simple posible.
    render: { antialias: true, pixelArt: false },
    // SIN `physics` — se probó activar Matter aquí, adelantándose al loader, y
    // en el simulador apareció un cuadro negro con diagonal verde flotando
    // junto a Larry: el wireframe de depuración de Matter, en una pantalla que
    // no usa física. `debug: false` NO lo quitó (Phaser 4 no lo respeta en esa
    // posición del config), así que el motor se enciende cuando de verdad haya
    // un cuerpo que simular — en la escena del loader, y con su config propia,
    // no en el config global de todo el producto.
    scene: [],
  });

  for (const [clave, Clase] of ESCENAS) {
    game.scene.add(clave, Clase, false);
  }

  // Música y efectos (D-198). Con DOS instancias de Phaser había que
  // registrar una pareja de managers en cada una, sobre su propio
  // `game.sound` — y los dos `main.ts` lo documentaban como un mal necesario.
  // Con una sola instancia hay una sola pareja, que es lo que siempre se
  // quiso: la música no se corta al pasar de la rejilla al mapa porque nunca
  // cambia de `Phaser.Game`.
  game.registry.set("musicManager", new MusicManager(game.sound));
  game.registry.set("sfxManager", new SfxManager(game.sound));

  // El registro se siembra ANTES de que corra ninguna escena: el constructor
  // de `Phaser.Game` ya deja `game.registry` listo, y las escenas no arrancan
  // hasta el siguiente tick.
  if (arranque.escena === "BootScene") {
    game.registry.set("progressManager", new ProgressManager(game.registry, arranque.datos));
  }

  game.scene.start(arranque.escena, arranque.datos);
  return game;
}

/**
 * Siembra el `ProgressManager` de una sesión que ya está corriendo.
 *
 * Es lo que permite entrar a Modo Historia **sin recargar la página**: la
 * sesión nació en «¿quién juega?», así que no había datos de historia cuando
 * se construyó. `PinScene` los pide a `/api/historia-datos` y llama aquí antes
 * de arrancar `MenuScene`.
 *
 * Se crea uno NUEVO por cada entrada, nunca se reusa el anterior: el árbol
 * trae la pericia recalculada por el servidor, y quedarse con el de la visita
 * previa sería la segunda fuente de verdad que `packages/motor/src/mapa.ts`
 * (#231) prohíbe — un padre vería «dominado» en el mapa y al niño fallando la
 * misma habilidad en el reto, sin que nada avisara.
 */
export function sembrarHistoria(game: Phaser.Game, datos: DatosDeArranque): void {
  game.registry.set("progressManager", new ProgressManager(game.registry, datos));
}
