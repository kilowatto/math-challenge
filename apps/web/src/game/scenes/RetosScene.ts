/**
 * RetosScene — el selector de retos por materia y dificultad, TODAVÍA sin
 * construir. Placeholder, a propósito (D-201, cierre de deuda de
 * `audits/spa-phaser.mjs`).
 *
 * ─── Por qué existe esta escena y no la vieja `kids/retos.astro` ────────────
 *
 * `MenuScene.ts` (D-190) ya tiene un botón "Retos" en el menú de dos modos
 * de Modo Historia — apunta aquí en vez de al reto adaptativo de siempre
 * (`GameplayScene`) porque el dueño pidió, explícito, que "Retos" sea un
 * selector MANUAL por materia y dificultad, una pantalla que no existe
 * todavía — y no el programador adaptativo que ya elige por el niño.
 * Construirlo de a de veras es trabajo aparte, después de que Modo Historia
 * quede terminado; mientras tanto, esta pantalla dice la verdad en vez de
 * fingir con el flujo de siempre.
 *
 * `kids/retos.astro` decía exactamente esto mismo en HTML plano — la migró
 * D-201 ("toda pantalla de niño es una escena de Phaser") igual que el
 * resto: mismo fondo del capítulo activo, mismo Larry del menú, mismo
 * letrero de madera del resto de Modo Historia, en vez de un `<h1>` sobre
 * blanco.
 *
 * Cero telemetría, cero interacción real: solo el título, el cuerpo, y la
 * flecha de regreso — la misma verdad que el placeholder de siempre, con la
 * vara visual del resto del producto.
 */
import Phaser from "phaser";
import { ProgressManager } from "../managers/ProgressManager";
import { capituloPorId } from "../data/story";
import { FlechaAtras } from "../objects/FlechaAtras";

export class RetosScene extends Phaser.Scene {
  constructor() {
    super("RetosScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const progreso = this.registry.get("progressManager") as ProgressManager;

    const capitulo = capituloPorId(progreso.chapterId);
    if (capitulo) {
      const fondo = this.add.image(width / 2, height / 2, capitulo.backgroundKey).setDepth(0);
      const escala = Math.max(width / fondo.width, height / fondo.height);
      fondo.setScale(escala);
    } else {
      this.cameras.main.setBackgroundColor(0x5b8c3a); // verde-follaje (D-186)
    }

    const letrero = this.add.image(width / 2, height * 0.4, "letrero-madera").setDepth(1);
    const escala = Math.min((width * 0.78) / letrero.width, 300 / letrero.height);
    letrero.setScale(escala);

    const anchoTexto = letrero.displayWidth - 48;
    this.add
      .text(width / 2, letrero.y - 22, progreso.rotulos.retosTitulo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        fontStyle: "700",
        color: "#434547",
        align: "center",
        wordWrap: { width: anchoTexto },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);
    this.add
      .text(width / 2, letrero.y + 22, progreso.rotulos.retosCuerpo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#727476",
        align: "center",
        wordWrap: { width: anchoTexto },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    const larry = this.add.image(width / 2, letrero.y - letrero.displayHeight / 2 - 60, "larry_menu_aplaude").setDepth(2);
    larry.setDisplaySize(120, 120);

    new FlechaAtras(this, 16 + 32, 16 + 32, () => this.scene.start("MenuScene")).setDepth(5);
  }
}
