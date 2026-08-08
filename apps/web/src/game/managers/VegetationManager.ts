/**
 * VegetationManager — crea y administra toda la vegetación de un mundo
 * (D-184, §2.3).
 *
 * Dos niveles de costo, elegidos por `VegetationLayerConfig.tier`:
 *
 *   · **"cerca"** — una `SwayingPlant` por instancia, con su propio Tween.
 *     Los Tweens de Phaser son baratos por sí solos; el límite real es
 *     cuántos objetos hay en pantalla, no el mecanismo de animación.
 *   · **"lejos"** — sin Tween. El ángulo se calcula a mano en `update()` con
 *     un seno por objeto (`Math.sin(tiempo * frecuencia + fase)`), que es más
 *     barato que N Tweens cuando N es grande y el objeto es pequeño y
 *     distante — el caso de un Android de gama baja con 20-30 elementos
 *     simultáneos (criterio de aceptación de la tarea).
 *
 * Todos los Tweens/objetos se crean UNA VEZ al construir la escena — nunca
 * dentro del bucle de `update()` — que es la única forma de que esto siga
 * siendo barato con muchos elementos.
 */
import Phaser from "phaser";
import { SwayingPlant } from "../objects/SwayingPlant";
import type { VegetationLayerConfig } from "../data/story";

interface PlantaLejana {
  sprite: Phaser.GameObjects.Sprite;
  anguloBase: number;
  amplitud: number;
  frecuencia: number;
  fase: number;
}

export class VegetationManager {
  private readonly scene: Phaser.Scene;
  private readonly lejanas: PlantaLejana[] = [];
  private reducido = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.reducido =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }

  /** Construye TODAS las capas de una vez. No llamar desde `update()`. */
  crearCapas(layers: readonly VegetationLayerConfig[]): void {
    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(layer.xRange[0], layer.xRange[1]);
        const y = Phaser.Math.Between(layer.yRange[0], layer.yRange[1]);
        const escala = Phaser.Math.FloatBetween(layer.scaleRange[0], layer.scaleRange[1]);

        if (layer.tier === "cerca") {
          const planta = new SwayingPlant(this.scene, x, y, layer.key);
          planta.setScale(escala);
          planta.setDepth(layer.depth);
        } else {
          const sprite = this.scene.add.sprite(x, y, layer.key);
          sprite.setOrigin(0.5, 1);
          sprite.setScale(escala);
          sprite.setDepth(layer.depth);
          if (!this.reducido) {
            this.lejanas.push({
              sprite,
              anguloBase: Phaser.Math.FloatBetween(-2, 2),
              amplitud: Phaser.Math.FloatBetween(2, 3.5),
              // Periodo de ~1.8-2.6s, expresado como frecuencia angular.
              frecuencia: (Math.PI * 2) / Phaser.Math.Between(1800, 2600),
              fase: Phaser.Math.FloatBetween(0, Math.PI * 2),
            });
          }
        }
      }
    }
  }

  /** Llamar una vez por frame desde `MapScene.update(time)`. Barato: un seno por planta lejana. */
  update(time: number): void {
    for (const p of this.lejanas) {
      p.sprite.angle = p.anguloBase + Math.sin(time * p.frecuencia + p.fase) * p.amplitud;
    }
  }
}
