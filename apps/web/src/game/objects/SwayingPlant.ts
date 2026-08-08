/**
 * SwayingPlant — una planta/arbusto que se mece con el viento (D-184, §2.3).
 *
 * Tres reglas, medidas en el propio encargo, y las tres importan:
 *
 *  1. **Pivote en la base** (`setOrigin(0.5, 1)`), nunca en el centro. Rotar
 *     desde el centro hace que la planta "flote"; desde la base, se "dobla"
 *     como un tallo real.
 *  2. **Desincronización obligatoria.** Ángulo base, amplitud, duración y
 *     retraso inicial son aleatorios por instancia (`Phaser.Math.Between`/
 *     `FloatBetween`). Si todas se mecen igual y a la vez, se lee como un
 *     bug, no como viento.
 *  3. **`Sine.easeInOut`**, y un rango de 2-5°. Es la curva que da la
 *     desaceleración en los extremos de una rama real; más de ~8° se lee como
 *     una sacudida, no como brisa.
 *
 * `respetaMovimientoReducido`: si el sistema operativo pide menos movimiento
 * (`prefers-reduced-motion`), la planta se queda quieta — el resto del sitio
 * ya respeta esa preferencia (ver `reto.css`), y esta pieza no iba a ser la
 * excepción.
 */
import Phaser from "phaser";

export interface OpcionesDeSway {
  anguloBase?: [number, number];
  amplitud?: [number, number];
  duracionMs?: [number, number];
  retrasoMaxMs?: number;
}

const DEFAULTS: Required<OpcionesDeSway> = {
  anguloBase: [-2, 2],
  amplitud: [2.5, 4.5],
  duracionMs: [1800, 2600],
  retrasoMaxMs: 1000,
};

export class SwayingPlant extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    opciones: OpcionesDeSway = {},
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    // Pivote en la base del tallo — ver la regla 1 del encabezado.
    this.setOrigin(0.5, 1);

    const reducido =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!reducido) this.iniciarSway({ ...DEFAULTS, ...opciones });
  }

  private iniciarSway(o: Required<OpcionesDeSway>): void {
    const base = Phaser.Math.FloatBetween(o.anguloBase[0], o.anguloBase[1]);
    const amplitud = Phaser.Math.FloatBetween(o.amplitud[0], o.amplitud[1]);
    const duracion = Phaser.Math.Between(o.duracionMs[0], o.duracionMs[1]);
    const retraso = Phaser.Math.Between(0, o.retrasoMaxMs);

    this.scene.tweens.add({
      targets: this,
      angle: { from: base - amplitud, to: base + amplitud },
      duration: duracion,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: retraso,
    });
  }
}
