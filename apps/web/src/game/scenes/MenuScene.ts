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
import { BotonSonido } from "../objects/BotonSonido";
import { BotonMusica } from "../objects/BotonMusica";
import { MusicManager } from "../managers/MusicManager";
import { SfxManager } from "../managers/SfxManager";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create(): void {
    const { width, height } = this.scale;
    const progreso = this.registry.get("progressManager") as ProgressManager;

    // Mismo fondo que el capítulo real de este niño — Mundo Kinder
    // multi-bioma: antes era el literal "primaria-1", que solo servía
    // porque un único capítulo existía. `progreso.chapterId` lo decide
    // `kids/mapa.astro` server-side (banda real + bioma activo).
    const capitulo = capituloPorId(progreso.chapterId);
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
    this.registrarVientoEnLetrero(letrero);

    const larry = this.add.image(width / 2, letrero.y - letrero.displayHeight / 2 - 60, "larry_menu_aplaude").setDepth(2);
    larry.setDisplaySize(140, 140);
    this.registrarIdle(larry);

    this.construirBoton(width / 2, letrero.y - 34, progreso.rotulos.menuHistoria, () => this.irAModoHistoria());
    this.construirBoton(width / 2, letrero.y + 34, progreso.rotulos.menuRetos, () => this.irARetos(progreso));

    // El ícono de bocina (D-190): control de experiencia, no de cuenta — es
    // lo único del lado adulto que SÍ le corresponde al niño (D-065 sigue
    // intacto para todo lo demás: ajustes, club, escuela, siguen del otro lado).
    // Arriba a la IZQUIERDA, a propósito: el botón ✕ de salida de pantalla
    // completa (D-189, `.mapa-historia-completa__salida`) ya es dueño de la
    // esquina superior derecha — un bug real, encontrado probando en un
    // simulador real, los tenía superpuestos ahí.
    new BotonSonido(this, 44, 44).setDepth(5);
    // D-198: control de música, separado del de voz — mismo criterio de
    // ubicación, 64px a la derecha del de sonido (56px de diámetro + margen).
    new BotonMusica(this, 108, 44).setDepth(5);

    // "calma" — explorar el mapa/menú, nunca resolver. Idempotente: si ya
    // sonaba "calma" (se volvió del reto), no reinicia el loop.
    (this.registry.get("musicManager") as MusicManager).reproducir("calma");
  }

  /**
   * "Que tenga efecto de aire que se mueva un poco porque sopla el aire"
   * (D-199, ronda 5) — el letrero cuelga de dos cuerdas, así que se mece
   * como un péndulo alrededor de ARRIBA, no de su centro. Cambiar el
   * origen a (0.5, 0) mueve el punto de anclaje del giro sin mover la
   * imagen (se reposiciona en el mismo paso para que el letrero se quede
   * exactamente donde ya estaba). Amplitud chica (±1.8°) y lenta (3.2s):
   * es madera pesada, no una hoja — mismo respeto por
   * `prefers-reduced-motion` que `SwayingPlant.ts` ya aplica a la
   * vegetación.
   */
  private registrarVientoEnLetrero(letrero: Phaser.GameObjects.Image): void {
    const reducido =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;

    const centroY = letrero.y;
    letrero.setOrigin(0.5, 0);
    letrero.y = centroY - letrero.displayHeight / 2;

    this.tweens.add({
      targets: letrero,
      angle: { from: -1.8, to: 1.8 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
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
      (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
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
    const progreso = this.registry.get("progressManager") as ProgressManager;
    this.scene.start("MapScene", { chapterId: progreso.chapterId });
  }

  private irARetos(progreso: ProgressManager): void {
    // Navegación real de página, no otra escena — Retos ya vive en
    // `/app/kids/jugar/` (mismo patrón de salida que `volverAlMapa()` en
    // GameplayScene.ts).
    const destino = progreso.rutaRetos;
    if (destino) window.location.href = destino;
  }
}
