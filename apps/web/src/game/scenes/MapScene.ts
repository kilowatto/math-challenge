/**
 * MapScene — el mapa navegable de Modo Historia (D-184, §2).
 *
 * ─── Cómo se posicionan los nodos: dato real, camino matemático ─────────────
 *
 * El camino sale de `WorldChapter.pathData` (puntos de control, nunca
 * píxeles por nodo) armado como `Phaser.Curves.Path` con un
 * `Phaser.Curves.Spline`. Los NODOS no salen de `story.ts` — salen de
 * `ProgressManager.grupos`, el árbol real que ya calculó el servidor
 * (`construirArbol()`, D-152/#233). Este archivo solo decide EN QUÉ PUNTO
 * del camino cae cada grupo (`distribuirNodos()`); nunca inventa progreso.
 *
 * ─── Comunicación entre escenas ─────────────────────────────────────────────
 *
 * Ningún estado global suelto: los nodos emiten `"nodo-tocado"` en
 * `this.events` (el EventEmitter de ESTA escena) y `ChallengeScene` se lanza
 * con los datos ya resueltos como argumento de `scene.launch()` — el patrón
 * que pide la arquitectura de la tarea.
 */
import Phaser from "phaser";
import { capituloPorId, type WorldChapter } from "../data/story";
import { VegetationManager } from "../managers/VegetationManager";
import { LevelNode } from "../objects/LevelNode";
import { LarryAvatar } from "../objects/LarryAvatar";
import { BotonSonido } from "../objects/BotonSonido";
import { BotonMusica } from "../objects/BotonMusica";
import { ProgressManager } from "../managers/ProgressManager";
import { MusicManager } from "../managers/MusicManager";
import type { NodoDelArbol } from "../../../../../packages/motor/src/mapa.ts";

interface NodoPosicionado {
  nodo: NodoDelArbol;
  x: number;
  y: number;
}

export class MapScene extends Phaser.Scene {
  private path!: Phaser.Curves.Path;
  private vegetacion!: VegetationManager;
  private avatar!: Phaser.GameObjects.Sprite;
  private arrastrando = false;
  private ultimoPuntero = { x: 0, y: 0 };

  constructor() {
    super("MapScene");
  }

  create(data: { chapterId: string }): void {
    const capitulo = capituloPorId(data.chapterId);
    if (!capitulo) {
      // Sin capítulo válido no hay nada que dibujar — se avisa por consola y
      // se detiene ahí; una pantalla en blanco es mejor que una excepción sin
      // captura en un dispositivo de un niño.
      console.error(`[historia] capítulo desconocido: ${data.chapterId}`);
      return;
    }

    // verde-follaje (D-186): el color de espera antes de que la imagen real
    // termine de decodificar — nunca un verde inventado.
    this.cameras.main.setBackgroundColor(0x5b8c3a);
    /*
     * UNA escena ilustrada, estirada al tamaño del mundo — no un mosaico
     * (D-186, ver el encabezado de `scripts/gen-mapa-historia.mjs`). El
     * primer intento repetía una textura pequeña con `tileSprite`; Recraft
     * nunca entregó una textura neutra de verdad —siempre quiso pintar una
     * escena completa—, así que el mundo entero usa esa escena una sola vez.
     * `setDisplaySize` estira la imagen al `worldWidth`/`worldHeight` reales
     * en vez de recortarla — la proporción del archivo (1024x2048, el
     * tamaño soportado por Recraft más cercano) no tiene que calzar exacto.
     */
    this.add
      .image(0, 0, capitulo.backgroundKey)
      .setOrigin(0, 0)
      .setDisplaySize(capitulo.worldWidth, capitulo.worldHeight)
      .setDepth(0);

    this.path = this.construirPath(capitulo);
    this.dibujarCamino();

    this.vegetacion = new VegetationManager(this);
    this.vegetacion.crearCapas(capitulo.vegetationLayers, this.path);

    const progreso = this.registry.get("progressManager") as ProgressManager;
    const posiciones = this.distribuirNodos(progreso);
    for (const { nodo, x, y } of posiciones) {
      const levelNode = new LevelNode(this, x, y, nodo, progreso.modo);
      levelNode.setDepth(5);
    }

    // El avatar se posa en el último nodo tocado — el "estás aquí" del mapa.
    // D-190: Larry real (ciclo de caminata antropomorfo) en vez del círculo
    // procedural `"avatar-marca"` — por ahora solo reemplaza el sprite
    // estático; caminar la curva al completar un nodo es trabajo de una fase
    // posterior (necesita detectar la transición de progreso entre visitas).
    const ultimo = posiciones.at(-1);
    const puntoInicial = ultimo ?? { x: this.path.getPoint(0).x, y: this.path.getPoint(0).y };
    this.avatar = new LarryAvatar(this, puntoInicial.x, puntoInicial.y - 70).setDepth(7);

    this.cameras.main.setBounds(0, 0, capitulo.worldWidth, capitulo.worldHeight);
    this.cameras.main.centerOn(puntoInicial.x, puntoInicial.y);

    this.configurarArrastre(capitulo);

    this.events.on("nodo-tocado", this.onNodoTocado, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("nodo-tocado", this.onNodoTocado, this);
    });

    // `pause()` congela también los Tweens de esta escena (las plantas dejan
    // de mecerse mientras el panel está abierto) — elegido a propósito sobre
    // "dejarlo vivo detrás": la sección 3.1 ofrece las dos opciones y en un
    // Android de gama baja (mc-47) ahorrar ese CPU pesa más que la
    // continuidad visual. El mapa SIGUE VISIBLE (no es un fade a negro), solo
    // congelado. Documentado en README-modo-historia.md como decisión, no
    // como olvido.
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.scene.setVisible(true));

    // D-190: el ícono de bocina, fijo en pantalla (setScrollFactor(0) — el
    // mapa se arrastra debajo, el botón no). Mismo control que MenuScene.
    // Arriba a la IZQUIERDA — la derecha es del botón ✕ de salida (D-189,
    // `.mapa-historia-completa__salida`, 88px, z-index 10): un bug real,
    // encontrado probando en un simulador real, los tenía superpuestos.
    new BotonSonido(this, 44, 44).setDepth(10).setScrollFactor(0);
    // D-198: control de música, mismo criterio de ubicación que MenuScene.
    new BotonMusica(this, 108, 44).setDepth(10).setScrollFactor(0);

    // "calma" — el mapa es explorar, no resolver (D-198). Idempotente: si se
    // vuelve de MenuScene ya sonando "calma", no reinicia el loop.
    (this.registry.get("musicManager") as MusicManager).reproducir("calma");
  }

  update(time: number): void {
    this.vegetacion?.update(time);
  }

  private construirPath(capitulo: WorldChapter): Phaser.Curves.Path {
    const puntos = capitulo.pathData.map((p) => new Phaser.Math.Vector2(p.x, p.y));
    const path = new Phaser.Curves.Path(puntos[0].x, puntos[0].y);
    path.add(new Phaser.Curves.Spline(puntos));
    return path;
  }

  private dibujarCamino(): void {
    const g = this.add.graphics();
    g.setDepth(1);
    g.lineStyle(28, 0xd8b98a, 1);
    const puntos = this.path.getPoints(120);
    g.beginPath();
    g.moveTo(puntos[0].x, puntos[0].y);
    for (const p of puntos.slice(1)) g.lineTo(p.x, p.y);
    g.strokePath();
  }

  /**
   * Cada NODO (no cada grupo) ocupa su propio punto a lo largo del camino,
   * en el mismo orden que su `secuencia` — es lo que hace que el tronco 7 se
   * vea después del 6 SOBRE la curva, en vez de al lado.
   *
   * Bug real, encontrado mirando el mapa desplegado (no en el código): la
   * versión anterior ubicaba el grupo entero en UN solo punto del camino
   * (`grupo.orden/N`) y solo separaba sus nodos con un empujón perpendicular
   * de 70px — menos que el diámetro de un tronco (88px). Con un grupo de 2+
   * nodos (el caso normal: varias habilidades comparten nivel), los troncos
   * quedaban encimados y lejos de la curva dibujada, en vez de sucederse
   * sobre ella. Un pequeño zigzag perpendicular (alternando lado, no
   * apilando) es la única variación lateral que queda — el avance real
   * siempre es a lo largo de la curva.
   */
  private distribuirNodos(progreso: ProgressManager): NodoPosicionado[] {
    const nodos = progreso.grupos.flatMap((g) => g.nodos);
    if (nodos.length === 0) return [];

    const ZIGZAG = 34; // px — menor que el radio del tronco (44px): nunca cruza al carril de al lado.

    return nodos.map((nodo, i) => {
      const t = Phaser.Math.Clamp((i + 0.5) / nodos.length, 0.02, 0.98);
      const centro = this.path.getPoint(t);
      const tangente = this.path.getTangent(t);
      const normal = new Phaser.Math.Vector2(-tangente.y, tangente.x).normalize();
      const lado = i % 2 === 0 ? 1 : -1;
      return {
        nodo,
        x: centro.x + normal.x * ZIGZAG * lado,
        y: centro.y + normal.y * ZIGZAG * lado,
      };
    });
  }

  private configurarArrastre(capitulo: WorldChapter): void {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.arrastrando = true;
      this.ultimoPuntero = { x: p.x, y: p.y };
    });
    this.input.on("pointerup", () => {
      this.arrastrando = false;
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!this.arrastrando || !p.isDown) return;
      const cam = this.cameras.main;
      cam.scrollX -= (p.x - this.ultimoPuntero.x) / cam.zoom;
      cam.scrollY -= (p.y - this.ultimoPuntero.y) / cam.zoom;
      this.ultimoPuntero = { x: p.x, y: p.y };
    });
  }

  private onNodoTocado(habilidad: string): void {
    const progreso = this.registry.get("progressManager") as ProgressManager;
    const nodo = progreso.buscarNodo(habilidad);
    if (!nodo) return;

    // Coordenadas de PANTALLA del nodo, para que ChallengeScene "crezca"
    // desde ahí y no con un fade genérico (criterio de aceptación).
    const posiciones = this.distribuirNodos(progreso);
    const posicion = posiciones.find((p) => p.nodo.habilidad === habilidad);
    const cam = this.cameras.main;
    const pantallaX = posicion ? (posicion.x - cam.scrollX) * cam.zoom : cam.width / 2;
    const pantallaY = posicion ? (posicion.y - cam.scrollY) * cam.zoom : cam.height / 2;

    this.scene.pause();
    this.scene.launch("ChallengeScene", {
      habilidad,
      origenX: pantallaX,
      origenY: pantallaY,
    });
  }
}
