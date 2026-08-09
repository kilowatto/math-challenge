/**
 * LevelNode — el medallón de una habilidad sobre el camino (D-184, §2.2;
 * D-190).
 *
 * ─── Dos modos de dibujo, para dos formas de mapa (D-190) ──────────────────
 *
 * `NodoDelArbol` ahora trae `secuencia`/`bloqueado` (D-190) para TODAS las
 * bandas, porque `construirArbol()` los calcula siempre — pero solo KINDER y
 * PRIMARIA los MUESTRAN. SECUNDARIA se queda con el árbol de D-184, donde
 * `periciaDe()` INFORMA y nunca impide (guía de estilo § mapa: "nada se
 * tacha y nada regresa"). Por eso el modo de dibujo lo decide quien
 * construye el nodo (`MapScene`, según `formaDeMapa()` de la banda real),
 * nunca este archivo adivinándolo del dato:
 *
 *   · `modo: "arbol"`  (SECUNDARIA) — el círculo de siempre, sin número, sin
 *                       candado, siempre interactivo. Comportamiento sin
 *                       cambios desde D-184.
 *   · `modo: "camino"` (KINDER, PRIMARIA) — el prop de tronco (arte real,
 *                       D-190), con el número de `secuencia` pintado por
 *                       Phaser (nunca horneado en la imagen) y un candado
 *                       superpuesto si `bloqueado`. Deja de ser interactivo
 *                       mientras esté bloqueado — es la única banda de
 *                       "arbol" donde bloquear alguna vez tuvo sentido.
 *
 *   · "asomando"  (relleno < 0.2) — apenas empezado, tenue.
 *   · "en_camino" (0.2-0.6)       — en progreso, PULSA para dirigir atención
 *                                   (mismo patrón que Duolingo/Angry Birds:
 *                                   el siguiente paso natural se anima).
 *   · "dominada"  (> 0.6)         — brillante, sin pulso — ya no compite por
 *                                   atención con lo que sigue en progreso.
 *
 * Nunca se pinta un número de NIVEL ni una cifra de `relleno` (D-017,
 * D-183): el relleno solo maneja una barra visual, jamás un texto. El único
 * número que este archivo puede llegar a pintar es `secuencia` (D-190), y
 * solo en modo "camino".
 *
 * Emite `"nodo-tocado"` en el EventEmitter de la ESCENA (no un callback ni
 * una variable global) con la habilidad tocada — `MapScene` escucha y decide
 * qué hacer, tal como pide la arquitectura de la tarea. Un nodo bloqueado
 * (modo "camino") nunca emite: no tiene input activo.
 */
import Phaser from "phaser";
import type { NodoDelArbol } from "../../../../../packages/motor/src/mapa.ts";

export type ModoDeNodo = "arbol" | "camino";

// Paleta Ignia (docs/guia-de-estilo.md, audits/brand-image.mjs) — sin verde:
// gris-400 para "apenas empezado", naranja-claro para "en progreso" (el mismo
// tono que ya pulsa en los botones de nivel), azul-ignia para "dominada" en
// vez de un verde de "correcto" que no existe en la marca.
const COLOR_POR_PERICIA: Record<NodoDelArbol["pericia"], number> = {
  asomando: 0xa4a6a8,
  en_camino: 0xf8a337,
  dominada: 0x0b6ab0,
};

/** Dos variantes de tronco (D-190) para que el camino no se repita cada 40px. */
const TRONCOS = ["tronco-a", "tronco-b"] as const;

export class LevelNode extends Phaser.GameObjects.Container {
  readonly habilidad: string;
  private readonly bloqueado: boolean;
  private pulso: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, nodo: NodoDelArbol, modo: ModoDeNodo = "arbol") {
    super(scene, x, y);
    scene.add.existing(this);
    this.habilidad = nodo.habilidad;
    this.bloqueado = modo === "camino" && nodo.bloqueado;

    const radio = 44; // 88px de diámetro — el mismo blanco táctil que el resto del producto.

    // El toque vive en la FORMA (círculo o tronco, un hijo real), no en el
    // Container que la envuelve: en un simulador de verdad, un Container
    // interactivo directamente —con hitArea explícita o con el patrón por
    // defecto de la propia guía de Phaser 4— no respondió a un toque real,
    // aunque se veía perfecto en pantalla (encontrado probando la misma falla
    // en `BotonSonido.ts`, ver ese archivo). Un hijo interactivo sortea lo
    // que sea que esté fallando en el hit-test de Container.
    const zonaInteractiva =
      modo === "camino" ? this.dibujarTronco(scene, nodo, radio) : this.dibujarCirculo(scene, nodo, radio);

    if (nodo.rotulo && modo === "arbol") {
      // El rótulo de habilidad es propio del árbol (SECUNDARIA); el camino
      // (KINDER/PRIMARIA) no nombra la habilidad por nodo — D-019 sigue
      // aplicando a KINDER, y PRIMARIA sigue el mismo mapa visual que KINDER.
      const etiqueta = scene.add
        .text(0, radio + 16, nodo.rotulo, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: 110 },
        })
        .setOrigin(0.5, 0);
      this.add(etiqueta);
    }

    this.setSize(radio * 2, radio * 2);
    // Sin `setInteractive()` cuando está bloqueado: un tronco bloqueado no
    // responde a toques, ni siquiera con un manejador que no haga nada — es
    // el estado real de "todavía no", no una decoración.
    //
    // `setInteractive()` SIN forma explícita, nunca `setInteractive(new
    // Phaser.Geom.Circle(...), Circle.Contains)` — bug real, encontrado
    // probando en un simulador de verdad con un overlay de depuración
    // (`this.input.hitTestPointer()` devolvía CERO objetos incluso con el
    // toque exactamente centrado, `d=0`, sobre la zona). Una forma de
    // `hitArea` explícita no registraba el toque en esta build de Phaser
    // 4.2.1; el hitArea AUTOGENERADO (un rectángulo del tamaño nativo del
    // objeto — `radio*2`, ya sea el `Circle` de `dibujarCirculo` o el
    // `Zone` de `dibujarTronco`) sí responde, y es el mismo patrón que
    // `BotonSonido.ts` ya tenía confirmado funcionando en el mismo
    // simulador.
    if (!this.bloqueado) {
      zonaInteractiva.setInteractive({ useHandCursor: true });
      if (nodo.pericia === "en_camino") this.iniciarPulso();
      zonaInteractiva.on(Phaser.Input.Events.POINTER_DOWN, this.onTocado, this);
    }
  }

  private dibujarCirculo(scene: Phaser.Scene, nodo: NodoDelArbol, radio: number): Phaser.GameObjects.Arc {
    const circulo = scene.add.circle(0, 0, radio, COLOR_POR_PERICIA[nodo.pericia]);
    circulo.setStrokeStyle(4, 0xffffff);
    this.add(circulo);

    // Barra de relleno, nunca una cifra: un arco parcial sobre el círculo.
    if (nodo.relleno > 0) {
      const arco = scene.add.graphics();
      arco.lineStyle(6, 0xffffff, 0.9);
      arco.beginPath();
      arco.arc(0, 0, radio + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * nodo.relleno, false);
      arco.strokePath();
      this.add(arco);
    }

    return circulo;
  }

  /**
   * El tronco (D-190): arte real de Recraft, alternado por `secuencia` para
   * variar sin depender de un dato inventado, con el número pintado ENCIMA
   * por Phaser (nunca horneado en la textura, mismo motivo que el letrero de
   * `GameplayScene`: un solo asset sirve a los siete locales). Bloqueado
   * atenúa el tronco y superpone el candado; nunca lo hace desaparecer —
   * "nada se tacha y nada regresa" también vale para lo que aún no se pisa.
   *
   * La zona de toque es una `Zone` invisible propia, NUNCA la imagen del
   * tronco — bug real, encontrado probando en un simulador de verdad:
   * `setDisplaySize()` ESCALA la imagen desde el tamaño nativo de su
   * textura, pero un `hitArea` de forma (`Circle(0,0,radio)`) se mide en el
   * espacio LOCAL SIN ESCALAR del objeto — con una textura nativa más
   * grande que `radio*2`, esa área de toque terminaba cubriendo un puñado
   * de píxeles reales en el centro del tronco, no el círculo completo que
   * se ve en pantalla. Una `Zone` declarada directamente a tamaño `radio*2`
   * no tiene ese problema (su tamaño es el que se le da, sin textura de
   * por medio) — mismo motivo por el que el círculo de modo "arbol"
   * (`scene.add.circle(0,0,radio)`, una forma nativa, no una imagen escalada)
   * nunca tuvo este bug.
   */
  private dibujarTronco(scene: Phaser.Scene, nodo: NodoDelArbol, radio: number): Phaser.GameObjects.Zone {
    const clave = TRONCOS[nodo.secuencia % TRONCOS.length];
    const tronco = scene.add.image(0, 0, clave).setDisplaySize(radio * 2, radio * 2);
    if (this.bloqueado) tronco.setAlpha(0.55);
    this.add(tronco);

    if (!this.bloqueado && nodo.relleno > 0) {
      const arco = scene.add.graphics();
      arco.lineStyle(6, 0xffffff, 0.9);
      arco.beginPath();
      arco.arc(0, 0, radio + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * nodo.relleno, false);
      arco.strokePath();
      this.add(arco);
    }

    const numero = scene.add
      .text(0, 0, String(nodo.secuencia), {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        fontStyle: "700",
        color: this.bloqueado ? "#727476" : "#434547", // gris-600 / gris-900 (paleta Ignia)
      })
      .setOrigin(0.5, 0.5);
    this.add(numero);

    if (this.bloqueado) {
      const candado = scene.add.image(radio * 0.6, radio * 0.6, "candado").setDisplaySize(32, 36);
      this.add(candado);
    }

    const zona = scene.add.zone(0, 0, radio * 2, radio * 2);
    this.add(zona);
    return zona;
  }

  private iniciarPulso(): void {
    this.pulso = this.scene.tweens.add({
      targets: this,
      scale: 1.08,
      yoyo: true,
      repeat: -1,
      duration: 700,
      ease: "Sine.easeInOut",
    });
  }

  private onTocado(): void {
    // Se pausa el pulso durante el squash: dos tweens escribiendo la misma
    // escala a la vez se ven como un tirón, no como dos animaciones.
    this.pulso?.pause();
    this.setScale(1);
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 80,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => this.pulso?.resume(),
    });
    this.scene.events.emit("nodo-tocado", this.habilidad);
  }
}
