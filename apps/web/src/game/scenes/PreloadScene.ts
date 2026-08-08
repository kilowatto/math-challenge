/**
 * PreloadScene — la barra de progreso, y de donde cuelga el arte real (D-184
 * §1.4, D-186).
 *
 * El fondo y la vegetación de Modo Historia ya no son procedurales: son
 * ilustraciones de Recraft (`scripts/gen-mapa-historia.mjs`), servidas como
 * WebP desde `apps/web/public/juego/`. Solo WebP y no el par AVIF+WebP de
 * siempre — un `Phaser.Loader` pide UNA url fija, sin el mecanismo de
 * negociación de formato que sí tiene un `<picture>` de Astro (ver el
 * encabezado del script de generación).
 *
 * `avatar-marca` sigue siendo procedural (`BootScene`): no es parte de este
 * pase de arte.
 *
 * La barra escucha los eventos REALES de `LoaderPlugin` (`progress`/`complete`),
 * nunca un temporizador falso: una barra que avanza sola sin trabajo detrás es
 * la clase de mentira que un dispositivo lento deja en evidencia primero.
 */
import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    const { width, height } = this.scale;
    const caja = this.add.graphics();
    const barra = this.add.graphics();
    const centroX = width / 2;
    const centroY = height / 2;

    caja.fillStyle(0xffffff, 0.15);
    caja.fillRoundedRect(centroX - 110, centroY - 10, 220, 20, 10);

    this.load.on("progress", (valor: number) => {
      barra.clear();
      barra.fillStyle(0xf36b1c, 1);
      barra.fillRoundedRect(centroX - 106, centroY - 6, 212 * valor, 12, 6);
    });

    this.load.on("complete", () => {
      caja.destroy();
      barra.destroy();
    });

    this.load.image("fondo-primaria-1", "/juego/fondo-primaria-1.webp");
    this.load.image("arbusto-a", "/juego/arbusto-a.webp");
    this.load.image("arbusto-b", "/juego/arbusto-b.webp");
    this.load.image("helecho-a", "/juego/helecho-a.webp");
    // El letrero del reto (GameplayScene): no es del mapa, pero se precarga
    // aquí igual — es la ÚNICA cola de carga de Modo Historia.
    this.load.image("letrero-madera", "/juego/letrero-madera.webp");
    // D-190: el tronco+candado del camino de KINDER/PRIMARIA (LevelNode.ts
    // modo "camino") y el ciclo de caminata antropomorfo de Larry
    // (LarryAvatar.ts) — mismo `PreloadScene`, ninguna cola nueva.
    this.load.image("tronco-a", "/juego/tronco-a.webp");
    this.load.image("tronco-b", "/juego/tronco-b.webp");
    this.load.image("candado", "/juego/candado.webp");
    this.load.image("larry_camina_1", "/mapa/larry_camina_1.webp");
    this.load.image("larry_camina_2", "/mapa/larry_camina_2.webp");
    this.load.image("larry_camina_3", "/mapa/larry_camina_3.webp");
    this.load.image("larry_camina_4", "/mapa/larry_camina_4.webp");
    this.load.image("larry_festejo", "/mapa/larry_festejo.webp");
    this.load.image("larry_menu_aplaude", "/mapa/larry_menu_aplaude.webp");
    this.load.image("larry_idle_1", "/mapa/larry_idle_1.webp");
    this.load.image("larry_idle_2", "/mapa/larry_idle_2.webp");
  }

  create(): void {
    this.scene.start("MapScene", { chapterId: "primaria-1" });
  }
}
