/**
 * FlechaAtras — la flecha para salir/regresar, esquina superior izquierda.
 *
 * `QuienJuegaScene` no tenía ninguna forma de volver a la pantalla anterior
 * (encontrado por el dueño probando en un dispositivo real) — quien entra
 * aquí desde el mapa para cambiar de jugador quedaba sin salida más que el
 * botón físico del sistema. `window.history.back()` y no una ruta fija: esta
 * pantalla se llega desde más de un lugar (la puerta del dispositivo, o un
 * enlace "cambiar de jugador" desde el mapa), y el historial del navegador ya
 * sabe cuál es el correcto sin que esta escena tenga que adivinarlo.
 *
 * ─── Prop de madera, no un círculo (D-194, segunda ronda) ──────────────────
 *
 * Primera versión: un círculo blanco con un chevron dibujado. El dueño lo
 * vio y pidió el mismo lenguaje visual que el resto de props de Modo
 * Historia (`letrero-madera`, `tronco-a/b`) — nunca un ícono de UI genérico
 * flotando sobre la escena ilustrada. `flecha-madera` (generada por
 * `gen-mapa-historia.mjs`, D-080 revisada) apunta a la derecha por diseño
 * —el mismo prop sirve para "siguiente" en otra pantalla algún día— y aquí
 * se voltea con `setFlipX(true)` para señalar "atrás".
 *
 * Mismo patrón de toque que el resto: el `Zone` HIJO es interactivo, nunca
 * el Container — un Container interactivo no registra el toque en un
 * simulador real (hallazgo de esta sesión, documentado también en
 * `LevelNode.ts`/`BotonSonido.ts`).
 */
import Phaser from "phaser";

const ANCHO = 64;

export class FlechaAtras extends Phaser.GameObjects.Container {
  /**
   * @param alTocar qué hacer al tocarla. Por omisión `history.back()`, que es
   *   lo correcto cuando la pantalla ES un documento. **Una escena lanzada
   *   sobre otra no lo es**: `PinScene` vive dentro de la misma sesión de
   *   Phaser sin haber empujado ninguna entrada al historial, así que ahí
   *   `history.back()` sacaría al niño del sitio entero en vez de devolverlo a
   *   la rejilla de caras. Por eso el destino se puede pasar desde fuera.
   */
  constructor(scene: Phaser.Scene, x: number, y: number, alTocar?: () => void) {
    super(scene, x, y);
    scene.add.existing(this);

    const imagen = scene.add.image(0, 0, "flecha-madera").setFlipX(true);
    const alto = ANCHO * (imagen.height / imagen.width);
    imagen.setDisplaySize(ANCHO, alto);
    this.add(imagen);

    const zona = scene.add.zone(0, 0, ANCHO, alto);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, alTocar ?? (() => window.history.back()));
    this.add(zona);

    this.setSize(ANCHO, alto);
  }
}
