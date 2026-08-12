/**
 * MarcoCarta — la carta boca arriba de "match-tap de pares" (K05, K06;
 * plan de mundo multi-bioma). Hermana de `CartaReverso.ts`; el glifo
 * (dibujo del objeto que se compara) lo pinta quien use este Container
 * ENCIMA, como un hijo más — este archivo solo da el marco blanco y el
 * borde, nunca el contenido (mismo principio que `tronco-a`/`tronco-b`:
 * superficie limpia, nada horneado).
 *
 * Mismo motivo que `CartaReverso.ts` para estar en código y no en Recraft —
 * ver [[feedback_recraft-overfitting-fixes]] punto 8.
 */
import Phaser from "phaser";

const GRIS = 0x434547;
const HALO = 0xffffff;
const NARANJA = 0xf36b1c;

export class MarcoCarta extends Phaser.GameObjects.Container {
  private ancho: number;
  private alto: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, ancho = 180, alto = 260) {
    super(scene, x, y);
    scene.add.existing(this);
    this.ancho = ancho;
    this.alto = alto;

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
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto, r);
    g.lineStyle(3, GRIS, 0.6);
    g.strokeRoundedRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto, r);
  }

  /** Anillo de acierto — el mismo lenguaje visual que el resto del juego (no una X/check de texto). */
  marcarAcierto(): void {
    const g = this.scene.add.graphics();
    g.lineStyle(6, NARANJA, 1);
    g.strokeRoundedRect(-this.ancho / 2, -this.alto / 2, this.ancho, this.alto, 18);
    this.addAt(g, 1);
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 500,
      delay: 200,
      onComplete: () => g.destroy(),
    });
  }
}
