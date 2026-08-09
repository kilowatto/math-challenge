/**
 * BotonSonido — el ícono de bocina que el niño puede tocar (D-190).
 *
 * `packages/tutor/src/voz.ts::CapacidadesDeVoz.silenciado` ya documentaba
 * este botón antes de que existiera: "el interruptor del padre, o el ícono
 * de bocina que el niño puede tocar". Este archivo es esa segunda mitad —
 * lee/escribe la MISMA preferencia que `RetoController.alternarVoz()` ya
 * persistía (`apps/web/src/lib/preferencia-voz.ts`, extraído de ahí para
 * que la clave de localStorage no viva en dos archivos.
 *
 * Dibujado con `Phaser.GameObjects.Graphics` — no es arte de Recraft
 * (D-080 solo pide petición humana para el CANON de Larry; un ícono
 * utilitario de bocina no es personaje). Dos estados: bocina con ondas
 * (activado) o con una X (silenciado) — nunca un texto, para que sirva
 * igual en los siete locales sin siete versiones.
 */
import Phaser from "phaser";
import { leerVozActivada, escribirVozActivada } from "../../lib/preferencia-voz";

const RADIO = 28; // 56px de diámetro — el mismo tamaño que los botones del menú.

export class BotonSonido extends Phaser.GameObjects.Container {
  private activado: boolean;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.activado = leerVozActivada();

    // El toque vive en el CÍRCULO (un hijo real, no en el Container que lo
    // envuelve): en un simulador de verdad, un `Container` hecho interactivo
    // directamente —con forma explícita o con el patrón por defecto de la
    // propia guía de Phaser 4— no respondió a un toque real, aunque se veía
    // perfecto en pantalla. Un hijo interactivo (Circle real, mismo patrón
    // que ya usan los botones "Historia"/"Retos" de MenuScene, que sí
    // responden) sortea lo que sea que esté fallando en el hit-test de
    // Container. Encontrado probando en un simulador de iOS real — nunca en
    // el navegador de escritorio, que no lo mostró.
    const fondo = scene.add.circle(0, 0, RADIO, 0xffffff, 1).setStrokeStyle(3, 0xa4a6a8); // gris-400
    fondo.setInteractive({ useHandCursor: true });
    fondo.on(Phaser.Input.Events.POINTER_DOWN, this.alternar, this);
    this.add(fondo);

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();

    this.setSize(RADIO * 2, RADIO * 2);
  }

  private dibujar(): void {
    const g = this.glifo;
    g.clear();
    const color = 0x434547; // gris-900 (paleta Ignia)
    g.fillStyle(color, 1);
    g.lineStyle(3, color, 1);

    // El cuerpo de la bocina: un trapecio + un rectángulo, igual en los dos estados.
    g.beginPath();
    g.moveTo(-14, -6);
    g.lineTo(-6, -6);
    g.lineTo(4, -14);
    g.lineTo(4, 14);
    g.lineTo(-6, 6);
    g.lineTo(-14, 6);
    g.closePath();
    g.fillPath();

    if (this.activado) {
      // Dos ondas de sonido.
      g.lineStyle(2.5, color, 1);
      g.beginPath();
      g.arc(4, 0, 8, -0.6, 0.6, false);
      g.strokePath();
      g.beginPath();
      g.arc(4, 0, 13, -0.7, 0.7, false);
      g.strokePath();
    } else {
      // Una X — silenciado.
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.moveTo(10, -8);
      g.lineTo(20, 8);
      g.moveTo(20, -8);
      g.lineTo(10, 8);
      g.strokePath();
    }
  }

  private alternar(): void {
    this.activado = !this.activado;
    escribirVozActivada(this.activado);
    this.dibujar();
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.88,
      scaleY: 0.88,
      duration: 80,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}
