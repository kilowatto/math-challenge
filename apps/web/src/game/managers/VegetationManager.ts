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

  /**
   * Construye TODAS las capas de una vez. No llamar desde `update()`.
   *
   * `path` ancla la vegetación al CORREDOR del camino en vez de esparcirla
   * uniforme por todo `xRange` — bug real, visto en el mapa desplegado: un
   * `x` puramente aleatorio entre 40 y 960 pone árboles sobre zonas que la
   * ilustración de fondo pinta como cielo/monte lejano en ese punto de
   * altura, y se leen como "islas flotantes" en vez de vegetación del
   * terreno. Buscar el punto del camino más cercano en Y y centrar el
   * rango horizontal ahí (recortado a `xRange`) mantiene la vegetación
   * cerca de por dónde de verdad pasa el sendero, que es la franja que la
   * ilustración sí pinta como suelo.
   */
  crearCapas(layers: readonly VegetationLayerConfig[], path?: Phaser.Curves.Path): void {
    const puntosDelCamino = path?.getPoints(80) ?? [];
    for (const layer of layers) {
      for (let i = 0; i < layer.count; i++) {
        const y = Phaser.Math.Between(layer.yRange[0], layer.yRange[1]);
        const xCentro = this.xDelCaminoEn(puntosDelCamino, y) ?? (layer.xRange[0] + layer.xRange[1]) / 2;
        const x = Phaser.Math.Clamp(
          xCentro + Phaser.Math.Between(-280, 280),
          layer.xRange[0],
          layer.xRange[1],
        );
        // Perspectiva atmosférica: más arriba en el mundo (Y menor) es más
        // lejos en esta ilustración (el camino sube hacia el fondo) — un
        // objeto a tamaño completo ahí también rompe la ilusión de distancia.
        const profundidad = Phaser.Math.Clamp(y / (layer.yRange[1] || 1), 0.55, 1);
        const escala = Phaser.Math.FloatBetween(layer.scaleRange[0], layer.scaleRange[1]) * profundidad;

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

  /** El punto muestreado del camino más cercano a esa altura Y — `null` si no hay camino que seguir. */
  private xDelCaminoEn(puntos: readonly Phaser.Math.Vector2[], y: number): number | null {
    if (puntos.length === 0) return null;
    let mejor = puntos[0];
    let mejorDistancia = Math.abs(mejor.y - y);
    for (const p of puntos) {
      const distancia = Math.abs(p.y - y);
      if (distancia < mejorDistancia) {
        mejor = p;
        mejorDistancia = distancia;
      }
    }
    return mejor.x;
  }

  /** Llamar una vez por frame desde `MapScene.update(time)`. Barato: un seno por planta lejana. */
  update(time: number): void {
    for (const p of this.lejanas) {
      p.sprite.angle = p.anguloBase + Math.sin(time * p.frecuencia + p.fase) * p.amplitud;
    }
  }
}
