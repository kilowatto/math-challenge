/**
 * ContadorVisual — el medidor de "tap-hasta-un-objetivo" (K04; plan de mundo
 * multi-bioma). Interfaz abstracta, no objeto del mundo — se dibuja en
 * código y no cambia por bioma (ver [[feedback_recraft-overfitting-fixes]]
 * punto 7).
 *
 * Un arco de fondo (el recorrido completo) más un arco de progreso que
 * crece con `setValor()` — nunca un número escrito aquí: Phaser/el llamador
 * decide si acompaña con un numeral aparte, este objeto solo es el medidor.
 */
import Phaser from "phaser";

const GRIS = 0x434547;
const HALO = 0xffffff;
const NARANJA = 0xf36b1c;
const INICIO = Phaser.Math.DegToRad(150);
const FIN = Phaser.Math.DegToRad(30);

export class ContadorVisual extends Phaser.GameObjects.Container {
  private radio: number;
  private valor = 0; // 0..1
  private fondo!: Phaser.GameObjects.Graphics;
  private progreso!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radio = 90) {
    super(scene, x, y);
    scene.add.existing(this);
    this.radio = radio;

    this.fondo = scene.add.graphics();
    this.progreso = scene.add.graphics();
    this.add(this.fondo);
    this.add(this.progreso);
    this.dibujarFondo();
    this.dibujarProgreso();
    this.setSize(radio * 2, radio * 1.3);
  }

  private dibujarFondo(): void {
    const g = this.fondo;
    g.clear();
    g.lineStyle(16, HALO, 0.9);
    g.beginPath();
    g.arc(0, 0, this.radio, INICIO, FIN, false);
    g.strokePath();
    g.lineStyle(10, GRIS, 0.35);
    g.beginPath();
    g.arc(0, 0, this.radio, INICIO, FIN, false);
    g.strokePath();
  }

  private dibujarProgreso(): void {
    const g = this.progreso;
    g.clear();
    if (this.valor <= 0) return;
    // El arco crece en sentido horario desde INICIO — mismo sentido que
    // leer un reloj, el más reconocible sin necesitar texto.
    const barrido = (FIN - INICIO + Math.PI * 2) % (Math.PI * 2);
    const finReal = INICIO + barrido * this.valor;
    g.lineStyle(10, NARANJA, 1);
    g.beginPath();
    g.arc(0, 0, this.radio, INICIO, finReal, false);
    g.strokePath();
  }

  /** `v` de 0 a 1 — qué tan cerca está del objetivo. */
  setValor(v: number): void {
    this.valor = Phaser.Math.Clamp(v, 0, 1);
    this.dibujarProgreso();
  }
}
