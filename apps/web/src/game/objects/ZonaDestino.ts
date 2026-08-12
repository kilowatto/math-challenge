/**
 * ZonaDestino — el aro de aterrizaje para la mecánica "tap origen→destino"
 * (plan de mundo multi-bioma, docs/planes/2026-08-09-mundo-kinder-multi-bioma.md).
 *
 * Dibujado con `Phaser.GameObjects.Graphics`, no con arte de Recraft: es
 * interfaz de interacción abstracta (un aro vacío no es un objeto del mundo),
 * y Recraft insiste en convertirlo en un objeto real (espejo, aro de luz)
 * sin importar el prompt — ver [[feedback_recraft-overfitting-fixes]] punto 7.
 * Por eso tampoco cambia de color/forma por bioma: es UI, no ambientación.
 *
 * Mismo truco de halo blanco que `BotonSonido.ts`/`BotonEngrane.ts` para que
 * se lea sobre cualquier fondo ilustrado sin necesitar una placa detrás.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c; // naranja Ignia — el color de Larry
const HALO = 0xffffff;

export class ZonaDestino extends Phaser.GameObjects.Container {
  private radio: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radio = 60) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radio = radio;

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();
    this.setSize(radio * 2, radio * 2);
  }

  private dibujar(): void {
    const g = this.glifo;
    g.clear();
    g.lineStyle(10, HALO, 0.9);
    g.strokeCircle(0, 0, this.radio);
    g.lineStyle(5, NARANJA, 1);
    g.strokeCircle(0, 0, this.radio);
  }

  /** El pulso suave que invita a soltar aquí — se dispara al aparecer la zona. */
  pulsar(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
