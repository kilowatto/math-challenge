/**
 * BotonEngrane — el ícono que abre los ajustes de un perfil (D-198, ronda 3;
 * madera y variantes, D-199).
 *
 * Mismo esqueleto que `BotonSonido.ts`/`BotonMusica.ts` (Zone hija con
 * hitArea autogenerado), pero SIN estado propio: no alterna nada ni lee
 * ninguna preferencia — solo dispara `onTocar()`, que quien lo construye
 * decide qué hace (en `QuienJuegaScene`, abrir `PerfilAjustesScene` para ESE
 * perfil).
 *
 * ─── Madera, no Graphics gris (D-199) ──────────────────────────────────────
 *
 * La primera versión dibujaba el engrane a mano con `Phaser.GameObjects.
 * Graphics` — gris, plano, idéntico en cada tarjeta. El dueño lo vio en vivo
 * y pidió madera, como el resto de los props de esta pantalla
 * (`letrero-madera`, `flecha-madera`, `tronco-a/b`), y 4-5 variantes para que
 * no se repita de tarjeta en tarjeta. `scripts/gen-mapa-historia.mjs` genera
 * `engrane-madera-1` a `-5` con Recraft, mismo patrón de prop aislado sobre
 * blanco + `ffmpeg colorkey` que ya usan esos otros props.
 *
 * `variante` es 1-5, elegida por quien llama (`QuienJuegaScene` la deriva del
 * índice de la tarjeta, mismo criterio que ya usa para no repetir forma/color
 * — D-194) — este archivo no decide cuál, solo la pinta. Si la textura no
 * cargó (offline, red lenta), cae al glifo de `Graphics` de siempre: un
 * engrane sin madera es mejor que un botón invisible.
 */
import Phaser from "phaser";

// D-199.3: se achicó de 18 a 15 para dejarle más aire al margen dentro de
// la esquina redondeada del panel — exportado para que `QuienJuegaScene`
// calcule la posición contra el MISMO número, nunca un radio copiado a mano.
export const RADIO_ENGRANE = 15;
const RADIO = RADIO_ENGRANE;
export const VARIANTES_ENGRANE = 5;

export class BotonEngrane extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, variante: number, onTocar: () => void) {
    super(scene, x, y);
    scene.add.existing(this);

    const zona = scene.add.zone(0, 0, RADIO * 2, RADIO * 2);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 80,
        yoyo: true,
        ease: "Sine.easeInOut",
      });
      onTocar();
    });
    this.add(zona);

    const clave = `engrane-madera-${((variante - 1) % VARIANTES_ENGRANE) + 1}`;
    if (scene.textures.exists(clave)) {
      const imagen = scene.add.image(0, 0, clave).setDisplaySize(RADIO * 2, RADIO * 2);
      this.add(imagen);
    } else {
      this.dibujarRespaldo(scene);
    }

    this.setSize(RADIO * 2, RADIO * 2);
  }

  /** Sin la textura de madera cargada — el mismo glifo procedural de antes de D-199. */
  private dibujarRespaldo(scene: Phaser.Scene): void {
    const color = 0x434547; // gris-900 (paleta Ignia)
    const g = scene.add.graphics();
    g.fillStyle(0xf3e4c8, 0.95);
    g.fillCircle(0, 0, RADIO);
    g.lineStyle(2, 0x8a5a2b, 0.8);
    g.strokeCircle(0, 0, RADIO);

    const radioInterno = RADIO * 0.4;
    const radioExterno = RADIO * 0.62;
    const dientes = 6;
    g.fillStyle(color, 1);
    for (let i = 0; i < dientes; i++) {
      const angulo = (Math.PI * 2 * i) / dientes;
      const ancho = 0.28;
      g.beginPath();
      g.arc(0, 0, radioExterno, angulo - ancho / 2, angulo + ancho / 2);
      g.arc(0, 0, radioInterno, angulo + ancho / 2, angulo - ancho / 2, true);
      g.closePath();
      g.fillPath();
    }
    g.fillCircle(0, 0, radioInterno);
    g.fillStyle(0xf3e4c8, 1);
    g.fillCircle(0, 0, radioInterno * 0.45);
    this.add(g);
  }
}
