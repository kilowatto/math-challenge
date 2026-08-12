/**
 * CargaGlobalScene — la ÚNICA pantalla de carga de toda la app de niño (D-200).
 *
 * ─── El problema real, visto en vivo ────────────────────────────────────
 *
 * El dueño notó que el "loader" aparecía tarde — al entrar al mapa, tras
 * elegir un perfil — en vez de temprano, al entrar a "¿quién juega?". La
 * causa: `QuienJuegaScene` y `PreloadScene` (Modo Historia) son DOS
 * `Phaser.Game` separados (páginas distintas, D-192), cada uno con su
 * propia lista de assets, y cada uno descubre sus archivos nuevos justo
 * cuando los necesita — nunca antes.
 *
 * Esta escena, agregada como PRIMER paso de `arrancarQuienJuega()`
 * (`main.ts`), precarga TODA la unión (`assets-manifest.ts`: esta pantalla
 * + Modo Historia completo, mapa y reto) desde el primer toque del niño.
 * `public/sw.js` ya cachea cualquier archivo estático que pase por
 * `fetch` (estrategia "Estático", sin cambios en este trabajo) — así que
 * cuando el niño llega al mapa minutos después, esos mismos archivos ya
 * están en caché y `PreloadScene` los sirve al instante, sin red.
 *
 * ─── "Que nunca se vuelva a ver un loader" — el candado de versión ───────
 *
 * Mostrar esta pantalla en CADA visita, aunque sea rápido, sería el defecto
 * contrario: el dueño pidió explícito que una vez cargado, no vuelva a
 * aparecer. `assets-version.json` (escrito en cada build por
 * `astro.config.mjs::activosVersionD200`, un hash real de los BYTES de
 * `public/{juego,mapa,avatares}`) es el candado: si coincide con lo que
 * este dispositivo ya marcó como cargado (`localStorage`), esta escena NI
 * SIQUIERA dibuja su UI — pasa directo a `QuienJuegaScene`. Si un deploy
 * cambió una sola imagen, el hash cambia solo, sin que nadie tenga que
 * acordarse de subir un número a mano — la app "sabe" que hay que volver a
 * bajar todo, que es exactamente lo que el dueño pidió.
 */
import Phaser from "phaser";
import type { DatosQuienJuega } from "./QuienJuegaScene";
import { TODAS_LAS_IMAGENES, TODOS_LOS_AUDIOS } from "../assets-manifest";
import { activosYaPrecargados, marcarActivosPrecargados, cargarLoteConProgreso } from "../carga-assets";

export class CargaGlobalScene extends Phaser.Scene {
  private datos!: DatosQuienJuega;

  constructor() {
    super("CargaGlobalScene");
  }

  init(datos: DatosQuienJuega): void {
    this.datos = datos;
  }

  // Sin `preload()` con imágenes propias a propósito: el chrome de esta
  // pantalla (caja, barra, texto) es `Graphics`/`Text` puro — es la única
  // escena que tiene que poder dibujarse ANTES de que exista una sola
  // imagen en caché.
  async create(): Promise<void> {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(0xffffff);

    if (await activosYaPrecargados()) {
      /**
       * D-200.4 — bug real, encontrado en vivo: "se queda cargando y no
       * suena, y ya no aparece el splash de cargar la lista de jugadores."
       * El candado de versión (D-200) solo dice que los BYTES ya están
       * calientes en el caché del NAVEGADOR — pero esta escena vive en un
       * `Phaser.Game` recién creado, con su propio administrador de
       * texturas/audio TOTALMENTE VACÍO en memoria. `return` aquí sin
       * cargar nada dejaba that trabajo (bajar y decodificar ~30 archivos)
       * corriendo en silencio dentro de `QuienJuegaScene.preload()`, con
       * la pantalla en blanco — nunca se veía nada, y si tardaba, la
       * música tampoco había terminado de decodificarse cuando `create()`
       * intentaba reproducirla. El caché del navegador acelera la RED, no
       * elimina el paso de Phaser. Se sigue cargando igual — rápido,
       * porque ya está en caché — pero nunca en silencio: un spinner
       * mínimo, nunca la pantalla en blanco.
       */
      const spinner = this.dibujarSpinner(width / 2, height / 2);
      await cargarLoteConProgreso(this, TODAS_LAS_IMAGENES, "imagen");
      await cargarLoteConProgreso(this, TODOS_LOS_AUDIOS, "audio");
      spinner.destroy();
      this.scene.start("QuienJuegaScene", this.datos);
      return;
    }

    const centroX = width / 2;
    const centroY = height / 2 + 36;

    const caja = this.add.graphics().setDepth(1);
    caja.fillStyle(0xe6d8bd, 1); // pergamino — excepción D-199.2
    caja.fillRoundedRect(centroX - 120, centroY - 10, 240, 20, 10);

    const barra = this.add.graphics().setDepth(2);
    const dibujarBarra = (valor: number) => {
      barra.clear();
      barra.fillStyle(0xf36b1c, 1); // naranja-ignia
      barra.fillRoundedRect(centroX - 116, centroY - 6, 232 * Phaser.Math.Clamp(valor, 0, 1), 12, 6);
    };
    dibujarBarra(0);

    const etiqueta = this.add
      .text(centroX, centroY - 34, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "600",
        color: "#3E2712", // madera-texto — excepción D-199.2
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    // En orden: imágenes primero, sonidos después — el dueño lo pidió así
    // explícitamente, con el nombre de cada etapa visible en pantalla.
    etiqueta.setText(this.datos.rotulos.carga.imagenes);
    dibujarBarra(0);
    await cargarLoteConProgreso(this, TODAS_LAS_IMAGENES, "imagen", dibujarBarra);
    etiqueta.setText(this.datos.rotulos.carga.sonidos);
    dibujarBarra(0);
    await cargarLoteConProgreso(this, TODOS_LOS_AUDIOS, "audio", dibujarBarra);

    await marcarActivosPrecargados();
    this.scene.start("QuienJuegaScene", this.datos);
  }

  /** Un giro simple — `Graphics` puro, nada de imágenes (ninguna existe todavía). Gira alrededor de su propio origen local, por eso se dibuja en (0,0) y se posiciona aparte. */
  private dibujarSpinner(x: number, y: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    g.lineStyle(4, 0xf36b1c, 1); // naranja-ignia
    g.beginPath();
    g.arc(0, 0, 18, 0, Math.PI * 1.4);
    g.strokePath();
    g.setPosition(x, y);
    this.tweens.add({ targets: g, angle: 360, duration: 900, repeat: -1, ease: "Linear" });
    return g;
  }
}
