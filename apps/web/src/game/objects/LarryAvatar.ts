/**
 * LarryAvatar — Larry caminando de verdad por la curva del mapa (D-190).
 *
 * Reemplaza el círculo procedural "avatar-marca" (D-184): usa el ciclo de
 * caminata ANTROPOMORFO real (`scripts/gen-larry.mjs`, 4 cuadros — Larry
 * erguido en dos piernas, corrección explícita del dueño sobre el
 * rinoceronte a cuatro patas original) y se mueve interpolando
 * `Phaser.Curves.Path.getPoint(t)` en vez de saltar de nodo en nodo — el
 * residuo que D-184 dejó declarado ("el avance animado del avatar por la
 * curva... queda afuera") se resuelve aquí.
 *
 * Cada cuadro es su propia textura — Recraft no da control por cuadro
 * dentro de una tira (ver el encabezado de `gen-larry.mjs`), así que la
 * animación de Phaser referencia CUATRO claves de textura distintas en vez
 * de recortes de un solo spritesheet. Phaser lo permite igual.
 */
import Phaser from "phaser";

const ANIM_CAMINAR = "larry-caminar";
const ANIM_IDLE = "larry-idle";

export class LarryAvatar extends Phaser.GameObjects.Sprite {
  private caminando = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "larry_idle_1");
    scene.add.existing(this);
    // Las texturas fuente son 512x512 (mismo pipeline que el resto del arte
    // de Larry, mc-47 §5) — sin esto, Phaser las pinta a tamaño nativo, que
    // tapa el mapa entero. 96px de alto: un poco más grande que el tronco
    // (88px de diámetro) para que Larry lea como el personaje, no un ícono más.
    this.setDisplaySize(96, 96);
    this.registrarAnimaciones(scene);
    this.play(ANIM_IDLE);
  }

  private registrarAnimaciones(scene: Phaser.Scene): void {
    if (!scene.anims.exists(ANIM_CAMINAR)) {
      scene.anims.create({
        key: ANIM_CAMINAR,
        frames: ["larry_camina_1", "larry_camina_2", "larry_camina_3", "larry_camina_4"].map((key) => ({
          key,
        })),
        frameRate: 7,
        repeat: -1,
      });
    }
    if (!scene.anims.exists(ANIM_IDLE)) {
      scene.anims.create({
        key: ANIM_IDLE,
        frames: ["larry_idle_1", "larry_idle_2"].map((key) => ({ key })),
        frameRate: 0.5,
        repeat: -1,
      });
    }
  }

  /**
   * Camina la curva de `path` desde `tInicio` hasta `tFin` (0..1) — nunca en
   * línea recta salvo que el propio path lo sea. Voltea el sprite según la
   * dirección de avance. `onLlegar` corre al terminar — normalmente
   * `festejar()` si el nodo de destino se acaba de completar.
   */
  caminarPorCurva(
    path: Phaser.Curves.Path,
    tInicio: number,
    tFin: number,
    duracionMs: number,
    onLlegar?: () => void,
  ): void {
    if (this.caminando) return;
    this.caminando = true;
    this.setFlipX(tFin < tInicio);
    this.play(ANIM_CAMINAR);

    const progreso = { t: tInicio };
    this.scene.tweens.add({
      targets: progreso,
      t: tFin,
      duration: duracionMs,
      ease: "Linear",
      onUpdate: () => {
        const punto = path.getPoint(Phaser.Math.Clamp(progreso.t, 0, 1));
        this.setPosition(punto.x, punto.y);
      },
      onComplete: () => {
        this.caminando = false;
        this.play(ANIM_IDLE);
        onLlegar?.();
      },
    });
  }

  /** La pose de celebración (D-190): festeja y vuelve sola a idle. */
  festejar(duracionMs = 1400): void {
    this.stop();
    this.setTexture("larry_festejo");
    this.scene.time.delayedCall(duracionMs, () => {
      if (!this.caminando) this.play(ANIM_IDLE);
    });
  }

  get estaCaminando(): boolean {
    return this.caminando;
  }
}
