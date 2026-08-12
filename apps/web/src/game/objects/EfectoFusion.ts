/**
 * EfectoFusion — el efecto de combinar de "tap-para-fusionar" (K10, K11;
 * plan de mundo multi-bioma). Interfaz abstracta — se dibuja en código y no
 * cambia por bioma.
 *
 * A diferencia de los demás objetos de esta carpeta, no es un elemento
 * persistente en pantalla: es un efecto de un solo disparo (dos formas que
 * se acercan, se funden, sueltan un destello) que se reproduce en el punto
 * de destino cuando el niño toca dos valores para combinarlos, y se
 * autodestruye al terminar.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;

export class EfectoFusion {
  /** Reproduce el efecto en `(x, y)` de `scene` y se destruye solo. `alTerminar` es opcional. */
  static reproducir(scene: Phaser.Scene, x: number, y: number, alTerminar?: () => void): void {
    const g = scene.add.graphics({ x, y });

    const a = { dx: -22, dy: 0 };
    const b = { dx: 22, dy: 0 };

    const dibujar = () => {
      g.clear();
      g.fillStyle(HALO, 0.85);
      g.fillCircle(a.dx, a.dy, 16);
      g.fillCircle(b.dx, b.dy, 16);
      g.fillStyle(NARANJA, 1);
      g.fillCircle(a.dx, a.dy, 12);
      g.fillCircle(b.dx, b.dy, 12);
    };
    dibujar();

    scene.tweens.add({
      targets: [a, b],
      dx: 0,
      duration: 260,
      ease: "Sine.easeIn",
      onUpdate: dibujar,
      onComplete: () => {
        // El destello final: un círculo que crece y se desvanece.
        const destello = scene.add.graphics({ x, y });
        destello.fillStyle(NARANJA, 1);
        destello.fillCircle(0, 0, 14);
        scene.tweens.add({
          targets: destello,
          scaleX: 2.2,
          scaleY: 2.2,
          alpha: 0,
          duration: 260,
          ease: "Sine.easeOut",
          onComplete: () => {
            g.destroy();
            destello.destroy();
            alTerminar?.();
          },
        });
      },
    });
  }
}
