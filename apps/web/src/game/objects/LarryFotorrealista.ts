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
 *
 * ─── D-196.1 (2026-08-09) — más fluidez, y la silla ya no sale de la nada ──
 *
 * El dueño vio la primera versión en vivo y señaló dos cosas reales: los
 * ciclos de movimiento (caminar, bailar, ejercicio) se veían a saltos con
 * tan pocos cuadros, y la silla de "leer" aparecía de golpe en la mano de
 * Larry sin haber existido antes en la escena ("se lleva una silla que
 * nunca trajo"). Caminata/baile pasan a 8 cuadros, ejercicio a 4 poses
 * únicas (antes 2 poses repetidas), saluda a 3, arrastra a 4 — ver
 * `scripts/gen-larry-fotorrealista.mjs` para el detalle de cada cuadro
 * nuevo. La silla se separó en un prop estático (`this.silla`, más abajo)
 * que vive siempre junto a Larry, visible en cualquier comportamiento, y
 * solo se oculta durante la ventana en la que él la arrastra fuera de
 * cuadro — así la silla que se lleva es la misma que ya se veía ahí.
 */
import Phaser from "phaser";

/**
 * Las 35 claves de cuadros + 1 prop de silla — `QuienJuegaScene.preload()`
 * las carga desde aquí, una sola fuente de verdad. D-196.1 (2026-08-09):
 * caminata/baile pasan a 8 cuadros, ejercicio a 4 poses únicas, saluda a 3 y
 * arrastra a 4 — el dueño vio la versión de 2-4 cuadros por comportamiento y
 * la señaló como "sin fluidez". `larry_foto_silla` es nuevo: un prop suelto,
 * nunca un cuadro de Larry.
 */
export const LARRY_FOTO_CLAVES: readonly string[] = [
  "larry_foto_idle_1",
  "larry_foto_idle_2",
  "larry_foto_camina_1",
  "larry_foto_camina_2",
  "larry_foto_camina_3",
  "larry_foto_camina_4",
  "larry_foto_camina_5",
  "larry_foto_camina_6",
  "larry_foto_camina_7",
  "larry_foto_camina_8",
  "larry_foto_baila_1",
  "larry_foto_baila_2",
  "larry_foto_baila_3",
  "larry_foto_baila_4",
  "larry_foto_baila_5",
  "larry_foto_baila_6",
  "larry_foto_baila_7",
  "larry_foto_baila_8",
  "larry_foto_saluda_1",
  "larry_foto_saluda_2",
  "larry_foto_saluda_3",
  "larry_foto_aburrido_1",
  "larry_foto_aburrido_2",
  "larry_foto_ejercicio_1",
  "larry_foto_ejercicio_2",
  "larry_foto_ejercicio_5",
  "larry_foto_ejercicio_6",
  "larry_foto_arrastra_1",
  "larry_foto_arrastra_2",
  "larry_foto_arrastra_3",
  "larry_foto_arrastra_4",
  "larry_foto_medita_1",
  "larry_foto_medita_2",
  "larry_foto_riega_1",
  "larry_foto_riega_2",
  "larry_foto_silla",
];

/** El prop de silla (D-196.1) — nunca un cuadro de Larry, se carga aparte. */
const CLAVE_SILLA = "larry_foto_silla";

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
  /**
   * La silla — prop suelto, no un cuadro de Larry (D-196.1). Vive siempre en
   * su lugar junto a Larry, visible en TODOS los comportamientos salvo
   * mientras él está fuera de cuadro leyendo — así la silla que se lleva es
   * una que YA estaba ahí, nunca una que aparece de la nada en su mano
   * ("se lleva una silla que nunca trajo", el señalamiento del dueño).
   */
  private silla: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "larry_foto_idle_1");
    this.xBase = x;
    this.yBase = y;
    scene.add.existing(this);
    this.setDisplaySize(ANCHO_DISPLAY, ANCHO_DISPLAY);

    this.silla = scene.add.image(x - ANCHO_DISPLAY * 0.42, y + ANCHO_DISPLAY * 0.24, CLAVE_SILLA);
    this.silla.setDisplaySize(ANCHO_DISPLAY * 0.4, ANCHO_DISPLAY * 0.4);
    this.silla.setDepth(this.depth);

    this.registrarAnimaciones();
    this.play("larry-idle");
    this.programarSiguienteComportamiento();

    // Si la escena se destruye (cambio de tamaño, D-041 RESIZE reinicia la
    // escena) no debe seguir programando comportamientos sobre un sprite
    // que ya no existe.
    this.on(Phaser.GameObjects.Events.DESTROY, () => {
      this.activo = false;
      this.silla.destroy();
    });
  }

  /** Mismo `setDepth` para Larry y su silla — se llama desde fuera (`QuienJuegaScene`) después de construir. */
  override setDepth(value: number): this {
    super.setDepth(value);
    if (this.silla) this.silla.setDepth(value);
    return this;
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

    // D-196.1: caminata y baile a 8 cuadros (4 originales + 4 de transición,
    // intercalados); el frameRate se duplicó junto con los cuadros para que
    // la duración del ciclo se mantenga — el doble de resolución temporal,
    // no el doble de velocidad.
    crear("larry-idle", ["idle_1", "idle_2"], 0.6, -1);
    crear(
      "larry-camina",
      ["camina_1", "camina_5", "camina_2", "camina_6", "camina_3", "camina_7", "camina_4", "camina_8"],
      12,
      -1,
    );
    crear(
      "larry-baila",
      ["baila_1", "baila_5", "baila_2", "baila_6", "baila_3", "baila_7", "baila_4", "baila_8"],
      6,
      -1,
    );
    crear("larry-saluda", ["saluda_1", "saluda_2", "saluda_3", "saluda_2", "saluda_3"], 3, 0);
    crear("larry-aburrido", ["aburrido_1", "aburrido_2"], 0.7, -1);
    // `ejercicio_1`/`ejercicio_2` ya eran las poses cerrado/abierto; antes
    // 3/4 las repetían casi igual (2 poses reales alternando). `_5`/`_6` son
    // las transiciones intermedias reales — 4 poses distintas en el loop.
    crear("larry-ejercicio", ["ejercicio_1", "ejercicio_5", "ejercicio_2", "ejercicio_6"], 3, -1);
    crear(
      "larry-arrastra",
      ["arrastra_1", "arrastra_3", "arrastra_2", "arrastra_4"],
      8,
      -1,
    );
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
    // La silla que se lleva es la que YA estaba ahí (D-196.1) — se oculta en
    // el instante en que empieza a arrastrarla, nunca antes (mientras está
    // de pie/bailando/etc. la silla sigue en su lugar, visible).
    this.silla.setVisible(false);
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
    // Regresó la silla a su lugar fuera de cuadro (el dueño lo pidió así
    // desde el principio) — reaparece en su sitio justo cuando Larry vuelve
    // a entrar caminando, ya sin ella en las manos.
    this.silla.setVisible(true);
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
