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
import { ProgressManager } from "../managers/ProgressManager";
import { IMAGENES_MODO_HISTORIA, AUDIOS_MODO_HISTORIA } from "../assets-manifest";
import { activosYaPrecargados, cargarLoteConProgreso } from "../carga-assets";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  // Sin `this.load` aquí: D-200 encontró que esta escena dibujaba su barra
  // SIEMPRE, sin importar si `CargaGlobalScene` (quien-juega) ya había
  // precargado todo esto minutos antes — "el loader está cuando entro al
  // mapa" seguía pasando aunque los archivos ya estuvieran calientes en el
  // caché del service worker, porque la barra se dibujaba de todas formas.
  // La carga real (y la UI, si hace falta) se decide en `create()`, después
  // de preguntar si ya se precargó — ver `carga-assets.ts`.
  preload(): void {}

  async create(): Promise<void> {
    const yaPrecargado = await activosYaPrecargados();
    let caja: Phaser.GameObjects.Graphics | undefined;
    let barra: Phaser.GameObjects.Graphics | undefined;

    if (!yaPrecargado) {
      const { width, height } = this.scale;
      const centroX = width / 2;
      const centroY = height / 2;
      caja = this.add.graphics();
      caja.fillStyle(0xffffff, 0.15);
      caja.fillRoundedRect(centroX - 110, centroY - 10, 220, 20, 10);
      barra = this.add.graphics();
      const dibujarBarra = (valor: number) => {
        barra?.clear();
        barra?.fillStyle(0xf36b1c, 1);
        barra?.fillRoundedRect(centroX - 106, centroY - 6, 212 * valor, 12, 6);
      };
      await cargarLoteConProgreso(this, IMAGENES_MODO_HISTORIA, "imagen", dibujarBarra);
      await cargarLoteConProgreso(this, AUDIOS_MODO_HISTORIA, "audio", dibujarBarra);
      caja.destroy();
      barra.destroy();
    } else {
      // Ya se marcó como precargado (`CargaGlobalScene`), pero ESTE
      // `Phaser.Game` (página distinta) todavía no tiene las texturas en su
      // propio caché EN MEMORIA — la petición de red la sirve el service
      // worker casi al instante, pero decodificar y subir cada archivo
      // sigue siendo trabajo real de Phaser. D-200.4: saltar la UI por
      // completo aquí (como hacía `CargaGlobalScene` antes de arreglarse)
      // dejaba ese trabajo corriendo con la pantalla en blanco — un
      // spinner mínimo, nunca nada en silencio.
      const { width, height } = this.scale;
      const spinner = this.add.graphics();
      spinner.lineStyle(4, 0xf36b1c, 1);
      spinner.beginPath();
      spinner.arc(0, 0, 18, 0, Math.PI * 1.4);
      spinner.strokePath();
      spinner.setPosition(width / 2, height / 2);
      this.tweens.add({ targets: spinner, angle: 360, duration: 900, repeat: -1, ease: "Linear" });
      await cargarLoteConProgreso(this, IMAGENES_MODO_HISTORIA, "imagen");
      await cargarLoteConProgreso(this, AUDIOS_MODO_HISTORIA, "audio");
      spinner.destroy();
    }

    // D-190: MenuScene (Larry aplaudiendo, dos botones) solo existe para
    // "camino" (KINDER/PRIMARIA). SECUNDARIA sigue exactamente como antes:
    // directo al árbol, sin menú — no tiene un "modo historia" separado de
    // "retos" que valga la pena elegir.
    const progreso = this.registry.get("progressManager") as ProgressManager;
    if (progreso.modo === "camino") {
      this.scene.start("MenuScene");
    } else {
      // Mundo Kinder multi-bioma: antes literal "primaria-1" — SECUNDARIA
      // no tiene biomas todavía, así que `chapterId` siempre resuelve a
      // "primaria-1" para esta banda, pero ahora es un dato real, no un
      // literal repetido en cuatro archivos.
      this.scene.start("MapScene", { chapterId: progreso.chapterId });
    }
  }
}
