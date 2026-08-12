/**
 * RielCarril — el carril con topes fijos de la mecánica "swipe corto con
 * snap" (K08, K14; plan de mundo multi-bioma).
 *
 * Cuatro intentos en Recraft: vía de ferrocarril literal, comida (queso,
 * pan), plano técnico con acotaciones — un carril con muescas no tiene
 * referente real fuerte, y Recraft le inventa un objeto real distinto cada
 * vez (ver [[feedback_recraft-overfitting-fixes]] punto 8). Se dibuja aquí:
 * una cápsula (rectángulo de esquinas totalmente redondeadas) con círculos
 * pequeños marcando cada parada.
 */
import Phaser from "phaser";

const GRIS = 0x434547; // gris-900 Ignia, mismo tono que BotonSonido/BotonEngrane
const HALO = 0xffffff;
const NARANJA = 0xf36b1c;

export class RielCarril extends Phaser.GameObjects.Container {
  private largo: number;
  private alto: number;
  private paradas: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, largo = 280, alto = 44, paradas = 4) {
    super(scene, x, y);
    scene.add.existing(this);
    this.largo = largo;
    this.alto = alto;
    this.paradas = paradas;

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();
    this.setSize(largo, alto);
  }

  private dibujar(): void {
    const g = this.glifo;
    const r = this.alto / 2;
    const x0 = -this.largo / 2;
    g.clear();

    // El halo detrás, mismo radio que el relleno.
    g.fillStyle(HALO, 0.9);
    g.fillRoundedRect(x0 - 3, -r - 3, this.largo + 6, this.alto + 6, r + 3);

    g.fillStyle(GRIS, 1);
    g.fillRoundedRect(x0, -r, this.largo, this.alto, r);

    // Las paradas, evenly espaciadas dentro del carril.
    for (let i = 0; i < this.paradas; i++) {
      const t = this.paradas === 1 ? 0.5 : i / (this.paradas - 1);
      const px = x0 + r + t * (this.largo - 2 * r);
      g.fillStyle(NARANJA, 1);
      g.fillCircle(px, 0, r * 0.45);
    }
  }

  /** La posición X local de la parada `i` — para ubicar el `IndicadorMovil` encima. */
  posicionDeParada(i: number): number {
    const r = this.alto / 2;
    const x0 = -this.largo / 2;
    const t = this.paradas === 1 ? 0.5 : i / (this.paradas - 1);
    return x0 + r + t * (this.largo - 2 * r);
  }
}
