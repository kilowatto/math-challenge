/**
 * CaminoGuia — la línea punteada de la mecánica "trazado guiado" (K08, K13;
 * plan de mundo multi-bioma).
 *
 * "dashed guide line" en Recraft dio un mapa de ruta con pin de ubicación;
 * "dashes on a screen" dio una pantalla de computadora literal con un
 * avioncito de papel — mismo problema que MarcoComparar, una línea sin más
 * no tiene referente real. Phaser no tiene un trazo punteado nativo en
 * `Graphics`, así que este archivo lo construye a mano: segmentos cortos
 * con huecos iguales sobre los puntos de una curva.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const HALO = 0xffffff;
const LARGO_TRAZO = 10;
const LARGO_HUECO = 8;

export class CaminoGuia extends Phaser.GameObjects.Container {
  private curva: Phaser.Curves.Path;
  private glifo!: Phaser.GameObjects.Graphics;

  /** `puntos` son coordenadas LOCALES relativas a `x,y` — la curva vive en el objeto, no en el mundo. */
  constructor(scene: Phaser.Scene, x: number, y: number, puntos: ReadonlyArray<{ x: number; y: number }>) {
    super(scene, x, y);
    scene.add.existing(this);

    this.curva = new Phaser.Curves.Path(puntos[0].x, puntos[0].y);
    for (let i = 1; i < puntos.length; i++) {
      this.curva.lineTo(puntos[i].x, puntos[i].y);
    }

    this.glifo = scene.add.graphics();
    this.add(this.glifo);
    this.dibujar();
  }

  /** Traza segmentos de `LARGO_TRAZO` con huecos de `LARGO_HUECO`, avanzando por longitud de arco. */
  private dibujarTrazos(color: number, ancho: number, alpha: number): void {
    const g = this.glifo;
    const largoTotal = this.curva.getLength();
    const paso = LARGO_TRAZO + LARGO_HUECO;
    g.lineStyle(ancho, color, alpha);
    for (let d = 0; d < largoTotal; d += paso) {
      const t0 = d / largoTotal;
      const t1 = Math.min(d + LARGO_TRAZO, largoTotal) / largoTotal;
      const p0 = this.curva.getPoint(t0);
      const p1 = this.curva.getPoint(t1);
      g.beginPath();
      g.moveTo(p0.x, p0.y);
      g.lineTo(p1.x, p1.y);
      g.strokePath();
    }
  }

  private dibujar(): void {
    this.glifo.clear();
    this.dibujarTrazos(HALO, 8, 0.9); // halo detrás, más grueso
    this.dibujarTrazos(NARANJA, 4, 1); // trazo real encima
  }

  /** El punto en la curva a una fracción `t` (0-1) — para animar un objeto siguiéndola. */
  puntoEn(t: number): Phaser.Math.Vector2 {
    return this.curva.getPoint(t);
  }
}
