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
import { RetosScene } from "./scenes/RetosScene";
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
  ["RetosScene", RetosScene],
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
    /**
     * `NONE`, y el tamaño lo pone `fijarTamanoAlViewport()`. Ver ahí el porqué
     * completo; en corto: con `RESIZE` Phaser **sondea la caja del contenedor**
     * cada pocos cientos de milisegundos y adopta lo que mida. Cuando esa
     * medición salía mal, pisaba el tamaño correcto un instante después de
     * pintar — que es exactamente el síntoma que reportó el dueño: «entras, sale
     * el PIN correcto con el fondo de la puerta, y luego se cambia por el
     * viejo». No era otro PIN: era el mismo, redibujado con 354x834 en vez de
     * 402x874.
     */
    scale: { mode: Phaser.Scale.NONE },
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

  fijarTamanoAlViewport(game);

  game.scene.start(arranque.escena, arranque.datos);
  return game;
}

/**
 * El juego mide contra el VIEWPORT, no contra la caja de su contenedor.
 *
 * `Scale.RESIZE` con `width: "100%"` deja que Phaser calcule el tamaño desde
 * `parent.getBoundingClientRect()`, **y lo recalcula solo, por sondeo, cada
 * pocos cientos de milisegundos**. Eso funciona mientras esa caja sea el
 * viewport, y dejó de funcionar en producción sin que nadie tocara el CSS.
 *
 * Medido en el simulador el 2026-08-11: al entrar al PIN, el primer pintado
 * salía a 402 pt de ancho —correcto, con el portón de madera— y unos cientos
 * de milisegundos después, cuando llegaban los datos y la escena se
 * redibujaba, salía a **354x834**: exactamente la caja de contenido del
 * `<body>` con su padding de 24 pt. El dueño lo describió como «sale el PIN
 * correcto y luego se cambia por el viejo», y esa frase fue la que localizó el
 * defecto: no eran dos pantallas, era la misma medida dos veces, la segunda
 * mal.
 *
 * Perseguir QUÉ medía mal costó tres despliegues y tres hipótesis falsas: el
 * CSS con ámbito que llega tarde (se puso el estilo en línea y siguió), un
 * segundo `<div>` de montaje escondido en el HTML viejo (no existe), y fijar
 * el tamaño dejando `RESIZE` puesto (el sondeo lo volvía a pisar).
 *
 * Así que se le quita la pregunta entera: `Scale.NONE`, sin sondeo y sin
 * medición de contenedor, y el tamaño se fija aquí contra el viewport en cada
 * `resize` y en cada cambio del `visualViewport` —que es el que se mueve
 * cuando Safari esconde o muestra su barra—. Ya no hay ninguna caja intermedia
 * que pueda mentir.
 *
 * `visualViewport` se prefiere cuando existe porque en iOS `innerHeight`
 * incluye el área bajo la barra de herramientas; su `height` es lo que de
 * verdad se ve.
 */
function fijarTamanoAlViewport(game: Phaser.Game): void {
  const aplicar = () => {
    const w = Math.round(visualViewport?.width ?? innerWidth);
    const h = Math.round(visualViewport?.height ?? innerHeight);
    if (w <= 0 || h <= 0) return;
    game.scale.resize(w, h);

    /**
     * El tamaño CSS del `<canvas>`, a mano — y aquí estaba el defecto.
     *
     * `game.scale.resize()` cambia el tamaño LÓGICO del juego; en modo `NONE`
     * no vuelve a escribir el estilo del elemento. El canvas se quedaba con el
     * ancho que le tocó al arrancar y la escena se dibujaba a 402x714 dentro de
     * un elemento de 354 px: todo el contenido encogido y centrado, con el
     * blanco del contenedor asomando a los lados.
     *
     * Se midió en el dispositivo pintando los números en el letrero del PIN
     * —`?traza=1`—, que fue lo único que despejó la duda: el juego decía
     * 402x714 (correcto) mientras la pantalla mostraba 354. Sin ese número, las
     * cuatro hipótesis anteriores eran igual de plausibles y todas falsas.
     */
    const cv = game.canvas;
    if (cv) {
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      cv.style.display = "block";
    }
  };
  aplicar();
  addEventListener("resize", aplicar);
  addEventListener("orientationchange", aplicar);
  visualViewport?.addEventListener("resize", aplicar);
  game.events.once(Phaser.Core.Events.DESTROY, () => {
    removeEventListener("resize", aplicar);
    removeEventListener("orientationchange", aplicar);
    visualViewport?.removeEventListener("resize", aplicar);
  });
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
