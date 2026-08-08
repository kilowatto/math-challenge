/**
 * LevelNode — el medallón de una habilidad sobre el camino (D-184, §2.2).
 *
 * ─── Los tres estados vienen de `pericia`, no de un booleano "unlocked" ────
 *
 * `NodoDelArbol` (F7 #233) no tiene bloqueo: a diferencia del sendero de
 * KINDER, el árbol de PRIMARIA/SECUNDARIA no candada nada — `periciaDe()`
 * INFORMA, no impide (guía de estilo § mapa: "nada se tacha y nada
 * regresa"). Por eso este componente siempre es interactivo; lo único que
 * cambia con la pericia es el color y si pulsa.
 *
 *   · "asomando"  (relleno < 0.2) — apenas empezado, tenue.
 *   · "en_camino" (0.2-0.6)       — en progreso, PULSA para dirigir atención
 *                                   (mismo patrón que Duolingo/Angry Birds:
 *                                   el siguiente paso natural se anima).
 *   · "dominada"  (> 0.6)         — brillante, sin pulso — ya no compite por
 *                                   atención con lo que sigue en progreso.
 *
 * Nunca se pinta un número de nivel ni una cifra de `relleno` (D-017,
 * D-183): el relleno solo maneja una barra visual, jamás un texto.
 *
 * Emite `"nodo-tocado"` en el EventEmitter de la ESCENA (no un callback ni
 * una variable global) con la habilidad tocada — `MapScene` escucha y decide
 * qué hacer, tal como pide la arquitectura de la tarea.
 */
import Phaser from "phaser";
import type { NodoDelArbol } from "../../../../../packages/motor/src/mapa.ts";

// Paleta Ignia (docs/guia-de-estilo.md, audits/brand-image.mjs) — sin verde:
// gris-400 para "apenas empezado", naranja-claro para "en progreso" (el mismo
// tono que ya pulsa en los botones de nivel), azul-ignia para "dominada" en
// vez de un verde de "correcto" que no existe en la marca.
const COLOR_POR_PERICIA: Record<NodoDelArbol["pericia"], number> = {
  asomando: 0xa4a6a8,
  en_camino: 0xf8a337,
  dominada: 0x0b6ab0,
};

export class LevelNode extends Phaser.GameObjects.Container {
  readonly habilidad: string;
  private readonly circulo: Phaser.GameObjects.Arc;
  private pulso: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, nodo: NodoDelArbol) {
    super(scene, x, y);
    scene.add.existing(this);
    this.habilidad = nodo.habilidad;

    const radio = 44; // 88px de diámetro — el mismo blanco táctil que el resto del producto.
    this.circulo = scene.add.circle(0, 0, radio, COLOR_POR_PERICIA[nodo.pericia]);
    this.circulo.setStrokeStyle(4, 0xffffff);
    this.add(this.circulo);

    // Barra de relleno, nunca una cifra: un arco parcial sobre el círculo.
    if (nodo.relleno > 0) {
      const arco = scene.add.graphics();
      arco.lineStyle(6, 0xffffff, 0.9);
      arco.beginPath();
      arco.arc(0, 0, radio + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * nodo.relleno, false);
      arco.strokePath();
      this.add(arco);
    }

    if (nodo.rotulo) {
      const etiqueta = scene.add
        .text(0, radio + 16, nodo.rotulo, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 110 },
        })
        .setOrigin(0.5, 0);
      this.add(etiqueta);
    }

    this.setSize(radio * 2, radio * 2);
    this.setInteractive(new Phaser.Geom.Circle(0, 0, radio), Phaser.Geom.Circle.Contains);
    this.input.cursor = "pointer";

    if (nodo.pericia === "en_camino") this.iniciarPulso();

    this.on(Phaser.Input.Events.POINTER_DOWN, this.onTocado, this);
  }

  private iniciarPulso(): void {
    this.pulso = this.scene.tweens.add({
      targets: this,
      scale: 1.08,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: "Sine.easeInOut",
    });
  }

  private onTocado(): void {
    // Se pausa el pulso durante el squash: dos tweens escribiendo la misma
    // escala a la vez se ven como un tirón, no como dos animaciones.
    this.pulso?.pause();
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 80,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => this.pulso?.resume(),
    });
    this.scene.events.emit("nodo-tocado", this.habilidad);
  }
}
