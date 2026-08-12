/**
 * ChallengeScene — el panel que se abre al tocar un nodo (D-184, §3).
 *
 * Todo en Phaser, nada de HTML superpuesto — el requisito explícito de la
 * tarea. "Jugar" no abre una escena de física/catapulta: ESTE producto no es
 * eso. "Jugar" arranca `GameplayScene` (D-184, ola 2) — el reto real,
 * también en Phaser, sobre el MISMO `RetoController` que habla con
 * `/api/jugar`. La primera versión de esta escena navegaba a
 * `/app/kids/jugar/?habilidad=…` (`Pantalla.astro`) para no duplicar esa
 * lógica; el dueño pidió después que el reto en sí también viviera en
 * Phaser, así que `RetoController.ts` es ahora el puerto sin renderer de esa
 * misma lógica — la duplicación que se quería evitar sigue evitada, solo que
 * el código compartido cambió de forma.
 *
 * El selector de nivel (Fácil/Medio/Difícil) solo se pinta si
 * `ProgressManager.puedeElegirNivel` es verdadero — y ese booleano lo decidió
 * el SERVIDOR (`puedeElegirNivel()` en `/api/jugar`, D-183), nunca esta
 * escena. Un niño de KINDER no llega nunca a `ChallengeScene` (esta pantalla
 * es de PRIMARIA/SECUNDARIA en adelante, D-184), pero aunque llegara, el
 * booleano en falso apaga el selector por sí solo.
 */
import Phaser from "phaser";
import { ProgressManager } from "../managers/ProgressManager";
import { SfxManager } from "../managers/SfxManager";

type Nivel = "facil" | "medio" | "dificil";

export class ChallengeScene extends Phaser.Scene {
  private habilidad!: string;
  private panel!: Phaser.GameObjects.Container;
  private fondo!: Phaser.GameObjects.Rectangle;
  private origen = { x: 0, y: 0 };

  constructor() {
    super("ChallengeScene");
  }

  create(data: { habilidad: string; origenX: number; origenY: number }): void {
    this.habilidad = data.habilidad;
    this.origen = { x: data.origenX, y: data.origenY };
    const { width, height } = this.scale;

    this.fondo = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive();
    this.fondo.on("pointerdown", () => this.cerrar());
    this.tweens.add({ targets: this.fondo, alpha: 0.6, duration: 200 });

    this.panel = this.construirPanel();
    this.panel.setPosition(this.origen.x, this.origen.y);
    this.panel.setScale(0.05);
    this.panel.setAlpha(0);

    this.tweens.add({
      targets: this.panel,
      x: width / 2,
      y: height / 2,
      scale: 1,
      alpha: 1,
      duration: 320,
      ease: "Back.easeOut",
    });
  }

  private construirPanel(): Phaser.GameObjects.Container {
    const progreso = this.registry.get("progressManager") as ProgressManager;
    const nodo = progreso.buscarNodo(this.habilidad);
    const contenedor = this.add.container(0, 0);

    const ancho = 320;
    const alto = progreso.puedeElegirNivel ? 380 : 300;

    const tarjeta = this.add.rectangle(0, 0, ancho, alto, 0xffffff, 1).setStrokeStyle(3, 0x434547); // gris-900
    contenedor.add(tarjeta);

    const titulo = this.add
      .text(0, -alto / 2 + 36, nodo?.rotulo ?? this.habilidad, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        fontStyle: "600",
        color: "#434547", // gris-900 (paleta Ignia)
        align: "center",
        wordWrap: { width: ancho - 40 },
      })
      .setOrigin(0.5, 0.5);
    contenedor.add(titulo);

    let cursorY = -alto / 2 + 90;

    if (progreso.puedeElegirNivel) {
      const rotulos = progreso.rotulos;
      const pregunta = this.add
        .text(0, cursorY, rotulos.eligeNivel, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          color: "#727476", // gris-600 (paleta Ignia)
        })
        .setOrigin(0.5, 0.5);
      contenedor.add(pregunta);
      cursorY += 34;

      const niveles: Nivel[] = ["facil", "medio", "dificil"];
      const rotuloDeNivel: Record<Nivel, string> = {
        facil: rotulos.nivelFacil,
        medio: rotulos.nivelMedio,
        dificil: rotulos.nivelDificil,
      };
      const anchoBoton = 86;
      const espacio = 8;
      const inicioX = -((anchoBoton + espacio) * (niveles.length - 1)) / 2;

      const botonesNivel: Phaser.GameObjects.Rectangle[] = [];
      niveles.forEach((nivel, i) => {
        const x = inicioX + i * (anchoBoton + espacio);
        const boton = this.add
          .rectangle(x, cursorY, anchoBoton, 40, 0xf7f7f8, 1) // superficie-clara
          .setStrokeStyle(2, 0xa4a6a8) // gris-400
          .setInteractive({ useHandCursor: true });
        const texto = this.add
          .text(x, cursorY, rotuloDeNivel[nivel], {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#434547", // gris-900 (paleta Ignia)
          })
          .setOrigin(0.5, 0.5);
        boton.on("pointerdown", () => {
          (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
          progreso.elegirNivel(nivel);
          for (const b of botonesNivel) {
            b.setFillStyle(0xf7f7f8); // superficie-clara
            b.setStrokeStyle(2, 0xa4a6a8); // gris-400
          }
          boton.setFillStyle(0xfdedd7); // naranja-claro 20% sobre blanco, misma mezcla que la Sabana
          boton.setStrokeStyle(2, 0xf36b1c); // naranja-ignia
        });
        botonesNivel.push(boton);
        contenedor.add(boton);
        contenedor.add(texto);
      });
      cursorY += 56;
    }

    const jugar = this.add
      .rectangle(0, alto / 2 - 80, ancho - 60, 56, 0xf36b1c, 1)
      .setInteractive({ useHandCursor: true });
    const jugarTexto = this.add
      .text(0, alto / 2 - 80, progreso.rotulos.jugar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "600",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);
    this.tweens.add({
      targets: [jugar, jugarTexto],
      scale: 1.04,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: "Sine.easeInOut",
    });
    jugar.on("pointerdown", () => {
      (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
      jugar.setScale(0.94);
      jugarTexto.setScale(0.94);
    });
    jugar.on("pointerup", () => this.irAlReto(progreso));
    contenedor.add(jugar);
    contenedor.add(jugarTexto);

    const cerrar = this.add
      .text(ancho / 2 - 24, -alto / 2 + 16, "✕", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#727476", // gris-600 (paleta Ignia)
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });
    cerrar.on("pointerdown", () => this.cerrar());
    contenedor.add(cerrar);

    return contenedor;
  }

  private irAlReto(progreso: ProgressManager): void {
    // D-184 ola 2: el reto también vive en Phaser — ver GameplayScene.ts.
    // `MapScene` se queda dormida detrás (no destruida): al salir del reto se
    // reanuda tal cual estaba, sin recargar la página ni perder la cámara.
    this.scene.stop();
    this.scene.stop("MapScene");
    this.scene.start("GameplayScene", { habilidad: this.habilidad, nivel: progreso.nivelElegido });
  }

  private cerrar(): void {
    this.tweens.add({
      targets: this.panel,
      x: this.origen.x,
      y: this.origen.y,
      scale: 0.05,
      alpha: 0,
      duration: 220,
      ease: "Back.easeIn",
    });
    this.tweens.add({
      targets: this.fondo,
      alpha: 0,
      duration: 220,
      onComplete: () => {
        this.scene.stop();
        this.scene.resume("MapScene");
      },
    });
  }
}
