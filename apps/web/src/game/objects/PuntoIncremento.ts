/**
 * PuntoIncremento — los dos puntos fijos de "tap incremental en dos puntos"
 * (K09, valor posicional adaptado; plan de mundo multi-bioma). Interfaz
 * abstracta — se dibuja en código y no cambia por bioma.
 *
 * Dos círculos de tamaño distinto: el chico suma una unidad al tocarlo, el
 * grande suma una fila/grupo completo. El tamaño relativo ES la seña visual
 * de "uno vs. un grupo" — no un número ni una etiqueta, que se hornearía.
 */
import Phaser from "phaser";

const NARANJA = 0xf36b1c;
const AZUL = 0x0b6ab0; // azul Ignia — el segundo color de marca, para distinguir del punto "chico"
const HALO = 0xffffff;

export class PuntoIncremento extends Phaser.GameObjects.Container {
  private radioChico: number;
  private radioGrande: number;
  private separacion: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    onUnidad: () => void,
    onGrupo: () => void,
    radioChico = 24,
    radioGrande = 40,
  ) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radioChico = radioChico;
    this.radioGrande = radioGrande;
    this.separacion = radioChico + radioGrande + 20;

    const glifo = scene.add.graphics();
    this.add(glifo);
    this.dibujar(glifo);

    const zonaChica = scene.add.zone(-this.separacion / 2, 0, radioChico * 2.2, radioChico * 2.2);
    zonaChica.setInteractive({ useHandCursor: true });
    zonaChica.on(Phaser.Input.Events.POINTER_DOWN, onUnidad);
    this.add(zonaChica);

    const zonaGrande = scene.add.zone(this.separacion / 2, 0, radioGrande * 2.2, radioGrande * 2.2);
    zonaGrande.setInteractive({ useHandCursor: true });
    zonaGrande.on(Phaser.Input.Events.POINTER_DOWN, onGrupo);
    this.add(zonaGrande);

    this.setSize(this.separacion + radioGrande * 2, radioGrande * 2.2);
  }

  private dibujar(g: Phaser.GameObjects.Graphics): void {
    const cx = this.separacion / 2;
    g.fillStyle(HALO, 0.9);
    g.fillCircle(-cx, 0, this.radioChico + 4);
    g.fillCircle(cx, 0, this.radioGrande + 4);
    g.fillStyle(NARANJA, 1);
    g.fillCircle(-cx, 0, this.radioChico);
    g.fillStyle(AZUL, 1);
    g.fillCircle(cx, 0, this.radioGrande);
  }

  /** Un "tick" visual al tocar — el punto se comprime y regresa. */
  destellarChico(): void {
    this.destellar(-this.separacion / 2);
  }
  destellarGrande(): void {
    this.destellar(this.separacion / 2);
  }
  private destellar(cx: number): void {
    const anillo = this.scene.add.graphics({ x: cx, y: 0 });
    anillo.lineStyle(4, NARANJA, 0.9);
    anillo.strokeCircle(0, 0, this.radioChico);
    this.add(anillo);
    this.scene.tweens.add({
      targets: anillo,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 300,
      onComplete: () => anillo.destroy(),
    });
  }
}
