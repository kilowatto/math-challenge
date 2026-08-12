/**
 * CartaReverso — el reverso de la carta de "match-tap de pares" (K05, K06;
 * plan de mundo multi-bioma). Hermana de `MarcoCarta.ts` (la cara boca
 * arriba).
 *
 * Cuatro intentos en Recraft por palabra-gatillo distinta cada vez: "face"
 * se leyó como retrato humano, "tile" como ficha técnica de cerámica con
 * texto inventado, y hasta la forma geométrica pura sin ninguna palabra dio
 * una muestra de pintura/Pantone con texto inventado — ver
 * [[feedback_recraft-overfitting-fixes]] punto 8. Un rectángulo con
 * esquinas redondeadas es trivial de dibujar en código; se dibuja aquí, sin
 * variar por bioma (es interfaz, no ambientación).
 */
import Phaser from "phaser";

const GRIS = 0x434547;
const HALO = 0xffffff;
const NARANJA = 0xf36b1c;

export class CartaReverso extends Phaser.GameObjects.Container {
  private ancho: number;
  private alto: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, ancho = 180, alto = 260) {
    super(scene, x, y);
    scene.add.existing(this);
    this.ancho = ancho;
    this.alto = alto;

    // El toque vive en una `Zone` hija — mismo hallazgo que `LevelNode.ts`
    // documenta: un Container interactivo directo no responde de fiar.
    const zona = scene.add.zone(0, 0, ancho, alto);
    zona.setInteractive({ useHandCursor: true });
    this.add(zona);

    this.glifo = scene.add.graphics();
    this.addAt(this.glifo, 0);
    this.dibujar();
    this.setSize(ancho, alto);
  }

  private dibujar(): void {
    const g = this.glifo;
    const r = 18;
    g.clear();
    g.fillStyle(HALO, 0.9);
    g.fillRoundedRect(-this.ancho / 2 - 3, -this.alto / 2 - 3, this.ancho + 6, this.alto + 6, r + 3);
    g.fillStyle(GRIS, 1);
    g.fillRoundedRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto, r);
    // El borde decorativo simple — nunca un patrón que Recraft pueda leer
    // como logo/sello, solo un doble trazo geométrico.
    g.lineStyle(3, NARANJA, 0.9);
    g.strokeRoundedRect(-this.ancho / 2 + 14, -this.alto / 2 + 14, this.ancho - 28, this.alto - 28, r - 6);
  }

  /** El volteo — mismo eje que una carta real, escala X a 0 y de vuelta. */
  voltear(alTerminar?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 120,
      ease: "Sine.easeIn",
      onComplete: () => alTerminar?.(),
    });
  }
}
