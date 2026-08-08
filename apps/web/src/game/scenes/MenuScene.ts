/**
 * MenuScene — el letrero de dos modos, con Larry aplaudiendo (D-190).
 *
 * ─── Por qué existe, y a quién le sale ──────────────────────────────────────
 *
 * El video de referencia abre en un menú con dos botones —"Modo Historia" y
 * "Retos"— antes de entrar al mapa. Esta escena es ese menú. Solo se monta
 * cuando `ProgressManager.modo === "camino"` (KINDER/PRIMARIA, D-190):
 * SECUNDARIA sigue exactamente como antes, directo al árbol de
 * `MapScene` — el menú no tiene sentido para una banda que no tiene "modo
 * historia" separado de "retos", solo tiene su árbol de siempre.
 *
 * ─── Los dos botones ─────────────────────────────────────────────────────
 *
 *   · "Modo Historia" → `scene.start("MapScene", ...)`. Sigue en Phaser.
 *   · "Retos"         → navegación real de página a `rutaRetos`
 *                       (`rutaJugar()`, ya existente — el mismo "toca una
 *                       habilidad y practica" que ya sirve `/api/jugar` con
 *                       su propio programador cuando no se le fija una
 *                       habilidad). No es una pantalla nueva: es la puerta
 *                       de entrada nueva a una que ya existe.
 */
import Phaser from "phaser";
import { ProgressManager } from "../managers/ProgressManager";
import { capituloPorId } from "../data/story";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const progreso = this.registry.get("progressManager") as ProgressManager;

    // Mismo fondo que el primer capítulo — MenuScene es la puerta de
    // entrada al mundo, no una pantalla aparte con su propia identidad
    // visual todavía (eso es del selector de mundo, fase posterior).
    const capitulo = capituloPorId("primaria-1");
    if (capitulo) {
      this.add
        .image(width / 2, height / 2, capitulo.backgroundKey)
        .setDisplaySize(width, height)
        .setDepth(0);
    } else {
      this.cameras.main.setBackgroundColor(0x5b8c3a); // verde-follaje (D-186)
    }

    const letrero = this.add.image(width / 2, height * 0.38, "letrero-madera").setDepth(1);
    const escala = Math.min((width * 0.7) / letrero.width, 260 / letrero.height);
    letrero.setScale(escala);

    const larry = this.add.image(width / 2, letrero.y - letrero.displayHeight / 2 - 60, "larry_menu_aplaude").setDepth(2);
    larry.setDisplaySize(140, 140);
    this.registrarIdle(larry);

    this.construirBoton(width / 2, letrero.y - 34, progreso.rotulos.menuHistoria, () => this.irAModoHistoria());
    this.construirBoton(width / 2, letrero.y + 34, progreso.rotulos.menuRetos, () => this.irARetos(progreso));
  }

  /** Un ligero rebote — Larry no se queda "congelado" en el menú. */
  private registrarIdle(larry: Phaser.GameObjects.Image): void {
    this.tweens.add({
      targets: larry,
      y: larry.y - 8,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: "Sine.easeInOut",
    });
  }

  private construirBoton(x: number, y: number, texto: string, onTocar: () => void): void {
    const ancho = 220;
    const alto = 56;
    const boton = this.add
      .rectangle(x, y, ancho, alto, 0xf36b1c, 1) // naranja-ignia
      .setStrokeStyle(3, 0xffffff)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });
    const etiqueta = this.add
      .text(x, y, texto, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        fontStyle: "600",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);

    // Un solo evento — POINTER_DOWN, mismo patrón que LevelNode.ts — en vez
    // de exigir DOWN+UP sobre el mismo objeto, que en algunos entornos de
    // prueba automatizados no llega a dispararse dos veces.
    boton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.tweens.add({
        targets: [boton, etiqueta],
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 80,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
      onTocar();
    });
  }

  private irAModoHistoria(): void {
    this.scene.start("MapScene", { chapterId: "primaria-1" });
  }

  private irARetos(progreso: ProgressManager): void {
    // Navegación real de página, no otra escena — Retos ya vive en
    // `/app/kids/jugar/` (mismo patrón de salida que `volverAlMapa()` en
    // GameplayScene.ts).
    const destino = progreso.rutaRetos;
    if (destino) window.location.href = destino;
  }
}
