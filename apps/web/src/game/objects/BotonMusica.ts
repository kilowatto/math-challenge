/**
 * BotonMusica — el control de MÚSICA, separado del de voz (D-198).
 *
 * Mismo patrón exacto que `BotonSonido.ts` (Zone invisible para el toque,
 * halo blanco grueso detrás del trazo, sin círculo de fondo — D-194) pero
 * lee/escribe `preferencia-musica.ts` en vez de `preferencia-voz.ts`, y
 * dibuja una corchea en vez de una bocina para que los dos controles nunca
 * se confundan al verlos juntos. El dueño pidió "dos controles separados"
 * explícitamente al confirmar el alcance de la música de fondo.
 */
import Phaser from "phaser";
import { leerMusicaActivada, escribirMusicaActivada } from "../../lib/preferencia-musica";
import type { MusicManager } from "../managers/MusicManager";

const RADIO = 28;

export class BotonMusica extends Phaser.GameObjects.Container {
  private activado: boolean;
  private glifo!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);
    this.activado = leerMusicaActivada();

    const zona = scene.add.zone(0, 0, RADIO * 2, RADIO * 2);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, this.alternar, this);
    this.add(zona);

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();

    this.setSize(RADIO * 2, RADIO * 2);
  }

  private dibujar(): void {
    const g = this.glifo;
    g.clear();
    const color = 0x434547; // gris-900 (paleta Ignia)
    const halo = 0xffffff;

    // Una corchea: cabeza ovalada + plumilla — el mismo glifo en los siete
    // locales, sin una sola letra.
    const cuerpo = () => {
      g.beginPath();
      g.arc(-8, 10, 8, 0, Math.PI * 2, false);
      g.closePath();
    };
    const plumilla = () => {
      g.beginPath();
      g.moveTo(0, 10);
      g.lineTo(0, -16);
      g.lineTo(10, -10);
      g.lineTo(0, -4);
      g.closePath();
    };

    g.lineStyle(6, halo, 0.95);
    cuerpo();
    g.strokePath();
    plumilla();
    g.strokePath();
    g.fillStyle(color, 1);
    cuerpo();
    g.fillPath();
    plumilla();
    g.fillPath();
    g.lineStyle(3, color, 1);
    g.beginPath();
    g.moveTo(0, 10);
    g.lineTo(0, -16);
    g.strokePath();

    if (!this.activado) {
      // Una X — silenciada. Mismo trazo que `BotonSonido.ts` usa para su
      // estado apagado, a propósito: es el mismo lenguaje visual.
      g.lineStyle(6, halo, 0.95);
      g.beginPath();
      g.moveTo(14, -8);
      g.lineTo(24, 8);
      g.moveTo(24, -8);
      g.lineTo(14, 8);
      g.strokePath();
      g.lineStyle(3, color, 1);
      g.beginPath();
      g.moveTo(14, -8);
      g.lineTo(24, 8);
      g.moveTo(24, -8);
      g.lineTo(14, 8);
      g.strokePath();
    }
  }

  private alternar(): void {
    this.activado = !this.activado;
    escribirMusicaActivada(this.activado);
    this.dibujar();
    const musica = this.scene.registry.get("musicManager") as MusicManager | undefined;
    musica?.alSincronizarPreferencia();
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
