/**
 * IndicadorPulso — el marcador de pulso de "tap-to-beat" (K02, K14; plan de
 * mundo multi-bioma). Interfaz abstracta, no objeto del mundo — se dibuja
 * en código y no cambia por bioma (ver [[feedback_recraft-overfitting-fixes]]
 * punto 7 y la nota de la mecánica en `gen-mecanicas-historia.mjs`).
 *
 * Tres anillos concéntricos que se expanden y se desvanecen — el pulso
 * visual que acompaña el pulso audible (`sfx-pulso`, D-198 ronda 2).
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;

export class IndicadorPulso extends Phaser.GameObjects.Container {
  private radio: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radio = 40) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radio = radio;

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujarQuieto();
    this.setSize(radio * 2, radio * 2);
  }

  /** El estado en reposo: un solo punto central, sin anillos. */
  private dibujarQuieto(): void {
    const g = this.glifo;
    g.clear();
    g.fillStyle(HALO, 0.9);
    g.fillCircle(0, 0, this.radio * 0.32);
    g.fillStyle(NARANJA, 1);
    g.fillCircle(0, 0, this.radio * 0.26);
  }

  /**
   * Un pulso: dos anillos que se expanden desde el centro y se desvanecen.
   * Se llama una vez por golpe de ritmo — quien orquesta el compás decide
   * el tempo, este objeto solo dibuja UN pulso cada vez que se le pide.
   */
  pulsar(): void {
    for (const factor of [1, 0.6]) {
      const anillo = this.scene.add.graphics();
      anillo.lineStyle(5 * factor, factor === 1 ? HALO : NARANJA, 0.9);
      anillo.strokeCircle(0, 0, this.radio * 0.3);
      this.addAt(anillo, 0);
      this.scene.tweens.add({
        targets: anillo,
        scaleX: 1 / factor,
        scaleY: 1 / factor,
        alpha: 0,
        duration: 420,
        ease: "Sine.easeOut",
        onComplete: () => anillo.destroy(),
      });
    }
  }
}
