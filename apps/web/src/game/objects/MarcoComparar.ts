/**
 * MarcoComparar — el marco que resalta un grupo para la mecánica
 * "comparar-y-tocar" (plan de mundo multi-bioma).
 *
 * Tres intentos en Recraft, tres objetos reales distintos en vez de una
 * forma abstracta: "spotlight frame" → un espejo de mano con tripié;
 * "glowing ring of light" → un aro de luz de videoconferencia con cable USB.
 * Un óvalo delgado sin más no tiene referente real que Recraft pueda
 * dibujar, así que dibuja UNO cada vez — ver
 * [[feedback_recraft-overfitting-fixes]] punto 7. Se dibuja aquí en su
 * lugar, y no cambia por bioma: es interfaz, no ambientación.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;

export class MarcoComparar extends Phaser.GameObjects.Container {
  private ancho: number;
  private alto: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, ancho = 260, alto = 200) {
    super(scene, x, y);
    scene.add.existing(this);
    this.ancho = ancho;
    this.alto = alto;

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();
    this.setSize(ancho, alto);
  }

  private dibujar(): void {
    const g = this.glifo;
    const rx = this.ancho / 2;
    const ry = this.alto / 2;
    g.clear();
    g.lineStyle(9, HALO, 0.9);
    g.strokeEllipse(0, 0, rx * 2, ry * 2);
    g.lineStyle(4, NARANJA, 1);
    g.strokeEllipse(0, 0, rx * 2, ry * 2);
  }

  /** Aparece con un breve destello — el instante en que se ofrece la comparación. */
  aparecer(): void {
    this.setAlpha(0);
    this.setScale(0.85);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: "Back.out",
    });
  }
}
