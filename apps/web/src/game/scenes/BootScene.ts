/**
 * BootScene — genera las texturas que TODAVÍA son procedurales (D-184, D-186).
 *
 * El fondo y la vegetación de Modo Historia dejaron de generarse aquí: son
 * ilustraciones reales de Recraft, cargadas por `PreloadScene`
 * (`scripts/gen-mapa-historia.mjs`). Lo que queda en este archivo —hoy,
 * `avatar-marca`— es lo que aún no tiene arte final: dibujado una sola vez
 * con `Phaser.GameObjects.Graphics` + `generateTexture()`. El resto de las
 * escenas piden la clave (`"avatar-marca"`) sin saber si detrás hay un
 * dibujo generado o un PNG cargado — por eso el reemplazo de arriba no tocó
 * ni `MapScene.ts` ni `data/story.ts`, solo esta escena y `PreloadScene.ts`.
 *
 * Corre una sola vez por `Phaser.Game` (no por escena reabierta): Phaser no
 * regenera una textura cuya clave ya existe en la caché.
 */
import Phaser from "phaser";

function asegurarTextura(scene: Phaser.Scene, clave: string, dibujar: (g: Phaser.GameObjects.Graphics) => { w: number; h: number }) {
  if (scene.textures.exists(clave)) return;
  const g = scene.add.graphics();
  const { w, h } = dibujar(g);
  g.generateTexture(clave, w, h);
  g.destroy();
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    asegurarTextura(this, "avatar-marca", (g) => {
      const w = 40;
      const h = 40;
      g.fillStyle(0xf36b1c, 1);
      g.fillCircle(w / 2, h / 2, 16);
      g.lineStyle(3, 0xffffff, 1);
      g.strokeCircle(w / 2, h / 2, 16);
      return { w, h };
    });

    this.scene.start("PreloadScene");
  }
}
