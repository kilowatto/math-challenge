/**
 * IconoPista — el ícono de pista opcional, transversal a cualquier
 * habilidad (plan de mundo multi-bioma). Interfaz abstracta — se dibuja en
 * código y no cambia por bioma.
 *
 * Silueta de foco/lamparita: un círculo (el foco) más una base rectangular
 * angosta (el portalámparas) y unas líneas cortas radiando (el brillo) —
 * nunca un signo de interrogación dibujado como texto, que contaría como
 * letra horneada (D-190: los numerales/letras nunca se hornean).
 *
 * Recordatorio de uso, no de este archivo: la pista es SOLO una ayuda
 * opcional, nunca la respuesta juzgada (voz.ts, sección de tap-and-hold).
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;

export class IconoPista extends Phaser.GameObjects.Container {
  private radio: number;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radio = 32) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radio = radio;

    const zona = scene.add.zone(0, 0, radio * 2.4, radio * 2.6);
    zona.setInteractive({ useHandCursor: true });
    this.add(zona);

    this.glifo = scene.add.graphics();
    this.addAt(this.glifo, 0);
    this.dibujar();
    this.setSize(radio * 2.4, radio * 2.6);
  }

  private dibujar(): void {
    const g = this.glifo;
    const r = this.radio;
    g.clear();

    const foco = () => {
      g.fillCircle(0, -r * 0.15, r * 0.75);
      g.fillRect(-r * 0.28, r * 0.35, r * 0.56, r * 0.35);
    };

    g.fillStyle(HALO, 0.9);
    g.save();
    g.translateCanvas(0, 0);
    foco();
    g.restore();

    g.fillStyle(NARANJA, 1);
    g.fillCircle(0, -r * 0.15, r * 0.62);
    g.fillStyle(0x8a5a2b, 1); // café cálido, mismo tono que BotonEngrane para el "portalámparas"
    g.fillRect(-r * 0.22, r * 0.32, r * 0.44, r * 0.28);

    // El brillo: 4 trazos cortos radiando desde el foco.
    g.lineStyle(4, NARANJA, 0.9);
    for (const angulo of [-2.3, -0.85, 0.85, 2.3]) {
      const x0 = Math.cos(angulo) * r * 0.95;
      const y0 = Math.sin(angulo) * r * 0.95 - r * 0.15;
      const x1 = Math.cos(angulo) * r * 1.35;
      const y1 = Math.sin(angulo) * r * 1.35 - r * 0.15;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.strokePath();
    }
  }

  /** El toque — un guiño rápido, nunca un cambio de tamaño brusco (es ayuda, no un botón principal). */
  ofrecer(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.6, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
