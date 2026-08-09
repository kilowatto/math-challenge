/**
 * LarryFotorrealista — el Larry fotorrealista de "¿Quién juega?" (D-196).
 *
 * Reversa PUNTUAL de D-191 para esta sola pantalla — ver el encabezado de
 * `scripts/gen-larry-fotorrealista.mjs` para la historia completa (por qué
 * fotorrealista aquí y no en `MenuScene`/`MapScene`, por qué Gemini/Nano
 * Banana y no Recraft, por qué "Rhino Athletics" es una marca inventada).
 *
 * ─── Siete comportamientos, al azar, nunca dentro de una tarjeta ───────────
 *
 * El dueño confirmó viendo D-195 que Larry SUELTO sobre la escena (sin caja
 * blanca ni panel) "está perfecto" — este objeto es un `Sprite` normal
 * añadido directo a la escena, nunca envuelto en un `Container` con panel.
 *
 * Después de un reposo aleatorio, elige uno de siete comportamientos:
 * bailar, saludar, aburrirse, hacer ejercicio, leer (con silla), meditar,
 * regar una plantita. Cada uno reproduce su ciclo de cuadros un rato y
 * regresa a reposo — "conectar sin que se note el brinco" se resuelve
 * dejando que el propio ciclo de reposo/comportamiento haga de transición,
 * nunca cortando en seco de un cuadro a otro sin relación.
 *
 * ─── "Se sienta a leer" — simplificado con el dueño ─────────────────────────
 *
 * Camina fuera de cuadro arrastrando una silla (cuadros `arrastra`, mirando
 * a la izquierda), la pantalla queda sin Larry unos segundos —sentarse/leer/
 * pararse pasa FUERA de cuadro, nunca visible, decisión explícita del
 * dueño—, y regresa caminando normal (cuadros `camina`, mirando a la
 * derecha) reusando el ciclo de caminata ya generado.
 */
import Phaser from "phaser";

/** Las 24 claves de textura — `QuienJuegaScene.preload()` las carga desde aquí, una sola fuente de verdad. */
export const LARRY_FOTO_CLAVES: readonly string[] = [
  "larry_foto_idle_1",
  "larry_foto_idle_2",
  "larry_foto_camina_1",
  "larry_foto_camina_2",
  "larry_foto_camina_3",
  "larry_foto_camina_4",
  "larry_foto_baila_1",
  "larry_foto_baila_2",
  "larry_foto_baila_3",
  "larry_foto_baila_4",
  "larry_foto_saluda_1",
  "larry_foto_saluda_2",
  "larry_foto_aburrido_1",
  "larry_foto_aburrido_2",
  "larry_foto_ejercicio_1",
  "larry_foto_ejercicio_2",
  "larry_foto_ejercicio_3",
  "larry_foto_ejercicio_4",
  "larry_foto_arrastra_1",
  "larry_foto_arrastra_2",
  "larry_foto_medita_1",
  "larry_foto_medita_2",
  "larry_foto_riega_1",
  "larry_foto_riega_2",
];

const ANCHO_DISPLAY = 150; // px — más grande que el busto anterior (110), es cuerpo completo.

type NombreComportamiento = "baila" | "saluda" | "aburrido" | "ejercicio" | "medita" | "riega" | "leer";

const COMPORTAMIENTOS: readonly NombreComportamiento[] = [
  "baila",
  "saluda",
  "aburrido",
  "ejercicio",
  "medita",
  "riega",
  "leer",
];

export class LarryFotorrealista extends Phaser.GameObjects.Sprite {
  private xBase: number;
  private yBase: number;
  private activo = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "larry_foto_idle_1");
    this.xBase = x;
    this.yBase = y;
    scene.add.existing(this);
    this.setDisplaySize(ANCHO_DISPLAY, ANCHO_DISPLAY);
    this.registrarAnimaciones();
    this.play("larry-idle");
    this.programarSiguienteComportamiento();

    // Si la escena se destruye (cambio de tamaño, D-041 RESIZE reinicia la
    // escena) no debe seguir programando comportamientos sobre un sprite
    // que ya no existe.
    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.activo = false;
    });
  }

  private registrarAnimaciones(): void {
    const anims = this.scene.anims;
    const crear = (
      key: string,
      sufijos: readonly (string | number)[],
      frameRate: number,
      repeat: number,
    ): void => {
      if (anims.exists(key)) return;
      anims.create({
        key,
        frames: sufijos.map((s) => ({ key: `larry_foto_${s}` })),
        frameRate,
        repeat,
      });
    };

    crear("larry-idle", ["idle_1", "idle_2"], 0.6, -1);
    crear("larry-camina", ["camina_1", "camina_2", "camina_3", "camina_4"], 6, -1);
    crear("larry-baila", ["baila_1", "baila_2", "baila_3", "baila_4"], 3, -1);
    crear("larry-saluda", ["saluda_1", "saluda_2", "saluda_1", "saluda_2"], 2, 2);
    crear("larry-aburrido", ["aburrido_1", "aburrido_2"], 0.7, -1);
    crear("larry-ejercicio", ["ejercicio_1", "ejercicio_2", "ejercicio_3", "ejercicio_4"], 3, -1);
    crear("larry-arrastra", ["arrastra_1", "arrastra_2"], 4, -1);
    crear("larry-medita", ["medita_1", "medita_2"], 0.6, -1);
    crear("larry-riega", ["riega_1", "riega_2", "riega_1", "riega_2"], 1.2, 1);
  }

  /** Entre 7 y 16 segundos de reposo — ni tan seguido que canse, ni tan raro que se sienta muerto. */
  private programarSiguienteComportamiento(): void {
    if (!this.activo) return;
    const espera = Phaser.Math.Between(7000, 16000);
    this.scene.time.delayedCall(espera, () => this.elegirComportamiento());
  }

  /**
   * "leer" pesa la mitad que el resto: saca a Larry de pantalla varios
   * segundos, y eso no puede ser lo más frecuente o la pantalla se siente
   * vacía la mitad del tiempo.
   */
  private elegirComportamiento(): void {
    if (!this.activo) return;
    const bolsa = COMPORTAMIENTOS.flatMap((c) => (c === "leer" ? [c] : [c, c]));
    this.ejecutar(Phaser.Utils.Array.GetRandom(bolsa));
  }

  private volverAIdle(): void {
    if (!this.activo) return;
    this.setFlipX(false);
    this.setPosition(this.xBase, this.yBase);
    this.play("larry-idle");
    this.programarSiguienteComportamiento();
  }

  private ejecutar(comportamiento: NombreComportamiento): void {
    if (comportamiento === "leer") {
      this.ejecutarLeer();
      return;
    }

    const DURACION_MS = 3400;
    this.play(`larry-${comportamiento}`);
    this.scene.time.delayedCall(DURACION_MS, () => this.volverAIdle());
  }

  /**
   * Camina fuera de cuadro arrastrando la silla, desaparece unos segundos
   * (sentarse/leer/pararse pasa FUERA de cuadro — decisión del dueño), y
   * regresa caminando normal.
   */
  private ejecutarLeer(): void {
    const { width } = this.scene.scale;
    const destinoSalida = -ANCHO_DISPLAY; // fuera del borde izquierdo

    this.setFlipX(true); // `arrastra` mira a la izquierda por diseño del cuadro
    this.play("larry-arrastra");
    this.scene.tweens.add({
      targets: this,
      x: destinoSalida,
      duration: Math.max(900, (this.xBase - destinoSalida) * 3),
      ease: "Sine.easeIn",
      onComplete: () => {
        if (!this.activo) return;
        this.setVisible(false);
        const esperaFueraDeCuadro = Phaser.Math.Between(3500, 6000);
        this.scene.time.delayedCall(esperaFueraDeCuadro, () => this.regresarDeLeer(width));
      },
    });
  }

  private regresarDeLeer(width: number): void {
    if (!this.activo) return;
    this.setPosition(-ANCHO_DISPLAY, this.yBase);
    this.setFlipX(false); // `camina` mira a la derecha por diseño del cuadro
    this.setVisible(true);
    this.play("larry-camina");
    void width;
    this.scene.tweens.add({
      targets: this,
      x: this.xBase,
      duration: Math.max(900, (this.xBase + ANCHO_DISPLAY) * 3),
      ease: "Sine.easeOut",
      onComplete: () => this.volverAIdle(),
    });
  }
}
