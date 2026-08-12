/**
 * BlancoMovil — el blanco de "tap a blanco en movimiento" (K04, fluidez de
 * numeral; plan de mundo multi-bioma). Interfaz abstracta — se dibuja en
 * código y no cambia por bioma.
 *
 * Un blanco tipo diana (anillos concéntricos) con una estela de movimiento
 * — el numeral que se mueve va DENTRO de este objeto como texto de Phaser,
 * nunca horneado; este archivo solo da el aro y la estela.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;

export class BlancoMovil extends Phaser.GameObjects.Container {
  private radio: number;
  private glifo!: Phaser.GameObjects.Graphics;
  private estela!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radio = 44) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radio = radio;

    this.estela = scene.add.graphics();
    this.glifo = scene.add.graphics();
    this.add(this.estela);
    this.add(this.glifo);
    this.dibujarDiana();
    this.setSize(radio * 2, radio * 2);
  }

  private dibujarDiana(): void {
    const g = this.glifo;
    g.clear();
    g.lineStyle(9, HALO, 0.9);
    g.strokeCircle(0, 0, this.radio);
    g.strokeCircle(0, 0, this.radio * 0.6);
    g.lineStyle(4, NARANJA, 1);
    g.strokeCircle(0, 0, this.radio);
    g.strokeCircle(0, 0, this.radio * 0.6);
    g.fillStyle(NARANJA, 1);
    g.fillCircle(0, 0, this.radio * 0.18);
  }

  /**
   * Dibuja la estela apuntando en la dirección de movimiento — se llama en
   * cada frame de `update()` mientras el blanco se desplaza, con el vector
   * de velocidad actual. `angulo` en radianes.
   */
  actualizarEstela(angulo: number, intensidad = 1): void {
    const e = this.estela;
    e.clear();
    if (intensidad <= 0) return;
    const largo = this.radio * 1.4 * intensidad;
    const dx = Math.cos(angulo) * largo;
    const dy = Math.sin(angulo) * largo;
    e.lineStyle(this.radio * 0.5, NARANJA, 0.25 * intensidad);
    e.beginPath();
    e.moveTo(0, 0);
    e.lineTo(-dx, -dy);
    e.strokePath();
  }

  /** El "lock-on" al acertar — un anillo que se cierra de golpe. */
  marcarAcierto(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 90,
      yoyo: true,
      ease: "Sine.easeOut",
    });
  }
}
