/**
 * GameplayScene — el reto real, dibujado en Phaser (D-184, ola 2).
 *
 * Esta escena NO tiene su propia lógica de "qué pasó": todo el estado vive en
 * `RetoController` (renderer-agnostic). Esta escena solo pinta lo que el
 * controlador ya decidió y reenvía los toques — el mismo contrato que
 * `AccessibleReto.ts` cumple del lado del DOM oculto, para que las dos vistas
 * nunca diverjan.
 *
 * ─── `pintarEscena()` — Mundo Kinder multi-bioma (#34) ──────────────────────
 *
 * Hasta hoy Modo Historia solo servía PRIMARIA (`toca_la_respuesta`: texto y
 * botones, sin dibujo), así que esta escena nunca necesitó el `switch` de
 * formatos que `Pantalla.astro` ya tenía. El piloto de Desierto trae a
 * Modo Historia el PRIMER formato de kinder con dibujo (`flash`, K01/K02) más
 * dos mecánicas nuevas (`toca_para_reventar`, `toca_origen_destino`) — de
 * ahí `pintarEscena()`.
 *
 * **La respuesta que se califica sigue siendo, siempre, tocar una de
 * `item.opciones`** — exactamente como en `Pantalla.astro`: el destello, las
 * burbujas y el salto de origen→destino son la ESCENA (práctica/dramatización
 * de la habilidad), nunca un segundo camino de calificar. Es el mismo patrón
 * que ya usa `toca_para_contar` en `Pantalla.astro` (tocar cada objeto es
 * práctica de conteo; la respuesta real se elige de las opciones de abajo).
 * Por eso `AccessibleReto.ts` no necesita cambios: su `onItem()` genérico
 * (opciones numéricas, sin dibujo) sigue siendo un camino real y completo
 * para calificar estos formatos — la gesticulación en canvas es la única
 * pieza que no tiene equivalente accesible todavía (deuda conocida,
 * documentada en `docs/decisions.md`, nunca en silencio).
 */
import Phaser from "phaser";
import {
  RetoController,
  type ItemDeReto,
  type VeredictoDeReto,
  type LimiteDePantalla,
} from "../reto/RetoController";
import { entrarAHistoria } from "../entrar-historia";
import { AccessibleReto } from "../reto/AccessibleReto";
import { ProgressManager, type DatosDeArranque } from "../managers/ProgressManager";
import { MusicManager } from "../managers/MusicManager";
import { SfxManager } from "../managers/SfxManager";
import { irA, extraerIsla, reemplazarHistorial } from "../spa/enrutador";
import { arrancarHistoriaEnSesion } from "../spa/puente-historia";
import { fijarFase } from "../spa/estado";
import { ZonaDestino } from "../objects/ZonaDestino";

const COLOR_TARJETA = 0xffffff;
const COLOR_BORDE = 0x434547; // gris-900
const COLOR_TEXTO = 0x434547; // gris-900
const COLOR_MUTED = 0x727476; // gris-600
const COLOR_OPCION = 0xf7f7f8; // superficie-clara
const COLOR_OPCION_BORDE = 0xa4a6a8; // gris-400
const COLOR_OPCION_ELEGIDA = 0xfdedd7; // naranja-claro 20% sobre blanco
const COLOR_ACENTO = 0xf36b1c; // naranja-ignia
const COLOR_DOMINADA = 0x0b6ab0; // azul-ignia — "correcto", nunca un verde que la marca no tiene

export class GameplayScene extends Phaser.Scene {
  private controller!: RetoController;
  private accesible: AccessibleReto | null = null;
  private desuscribir: Array<() => void> = [];
  private salirA = "";

  private enunciadoTexto!: Phaser.GameObjects.Text;
  private avisoTexto!: Phaser.GameObjects.Text;
  /**
   * Mundo Kinder multi-bioma (#34): la escena de `pintarEscena()` — el
   * destello, las burbujas, el salto de origen→destino. Vive SIEMPRE arriba
   * de `opcionesContenedor` y se limpia con ella en cada ítem nuevo; para
   * `toca_la_respuesta` (PRIMARIA, K05/K12 tal cual) queda vacía, como hoy.
   */
  private escenaContenedor!: Phaser.GameObjects.Container;
  private opcionesContenedor!: Phaser.GameObjects.Container;
  private opcionBotones: Array<{ rect: Phaser.GameObjects.Rectangle; texto: Phaser.GameObjects.Text; valor: number | string }> = [];
  private veredictoContenedor!: Phaser.GameObjects.Container;
  private accionesContenedor!: Phaser.GameObjects.Container;
  private escucharBoton!: Phaser.GameObjects.Rectangle;
  private cortina: Phaser.GameObjects.Container | null = null;
  /**
   * Los dos temporizadores del D-189 — SOLO existen aquí, nunca en
   * `AccessibleReto.ts`. Ver el comentario largo en `onSeleccion()` para el
   * porqué: un temporizador de envío automático es aceptable en el toque
   * (una vía entre varias, nunca la única) pero forzarlo también en la vía
   * de teclado/lector de pantalla violaría WCAG 2.2.1 (Timing Adjustable) —
   * quien todavía está escuchando la opción no puede "tocar rápido" para
   * evitarlo.
   */
  private temporizadorConfirmar: Phaser.Time.TimerEvent | null = null;
  private temporizadorSiguiente: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("GameplayScene");
  }

  create(data: { habilidad: string; nivel: "facil" | "medio" | "dificil" | null }): void {
    const progreso = this.registry.get("progressManager") as ProgressManager;
    const { width } = this.scale;
    this.salirA = progreso.salirA;

    // "energía" — resolver, no explorar (D-198, reversa de `PRESUPUESTO.
    // mientras_resuelve.musica`/`.al_resolver.musica` en voz.ts, que hasta
    // hoy eran `false` en los dos regímenes).
    (this.registry.get("musicManager") as MusicManager).reproducir("energia");

    this.controller = new RetoController({
      locale: progreso.locale,
      habilidad: data.habilidad,
      nivel: data.nivel,
      rotulos: progreso.rotulosReto,
      etiquetaVoz: progreso.etiquetaVoz,
      salirA: progreso.salirA,
      bioma: progreso.bioma,
    });

    const contenedorAccesible = document.getElementById("historia-accesible");
    if (contenedorAccesible) {
      this.accesible = new AccessibleReto(contenedorAccesible, this.controller);
    }

    this.cameras.main.setBackgroundColor(0xf7f7f8);

    // Deja libres los primeros ~90px: ahí vive el letrero colgante
    // (`mostrarLetrero()`, D-187) — sin este hueco, el letrero tapaba el
    // enunciado (se vio en la verificación: el texto existía pero quedaba
    // debajo del letrero, invisible).
    this.avisoTexto = this.add
      .text(width / 2, 92, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#727476",
        align: "center",
        wordWrap: { width: width - 60 },
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.enunciadoTexto = this.add
      .text(width / 2, 112, this.controller.rotulos.cargando, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        fontStyle: "600",
        color: "#434547",
        align: "center",
        wordWrap: { width: width - 60 },
      })
      .setOrigin(0.5, 0)
      .setDepth(2);

    this.escenaContenedor = this.add.container(0, 0).setDepth(2);
    this.opcionesContenedor = this.add.container(0, 0).setDepth(2);
    this.veredictoContenedor = this.add.container(0, 0).setDepth(2);
    this.accionesContenedor = this.add.container(0, 0).setDepth(2);

    this.crearBotonEscuchar();
    this.crearSalida();

    this.suscribir("cargando", () => this.onCargando());
    this.suscribir("item", (item) => this.onItem(item as ItemDeReto));
    this.suscribir("seleccion", (valor) => this.onSeleccion(valor as number | string));
    this.suscribir("veredicto-limpio", () => this.limpiarVeredictoYAcciones());
    this.suscribir("veredicto", (v) => this.onVeredicto(v as VeredictoDeReto));
    this.suscribir("limite", (l) => this.onLimite(l as LimiteDePantalla));
    this.suscribir("despedida", (l) => this.onDespedida(l as LimiteDePantalla & { hechos: number }));

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.limpiar());

    this.mostrarLetrero();
    this.mostrarCuentaRegresiva(() => this.controller.siguiente());
  }

  /**
   * El letrero colgante del reto (D-187): una sola vez, al entrar a
   * `GameplayScene` — no antes de cada ítem, que sería ruido repetido.
   * El texto lo pinta Phaser, nunca la imagen: `letrero-madera.webp` no
   * lleva ninguna palabra horneada, así que sirve a los siete locales sin
   * generarse siete veces (D-022). Reusa `rotulos.mirar` — ya autorado en
   * los siete locales para el mismo momento ("¡Mira!"/"Look!") — en vez de
   * inventar una clave de i18n nueva para un banner decorativo.
   */
  private mostrarLetrero(): void {
    if (!this.textures.exists("letrero-madera")) return;
    const { width } = this.scale;
    const letrero = this.add.image(width / 2, 4, "letrero-madera").setOrigin(0.5, 0).setDepth(3);
    const anchoLetrero = Math.min(190, width - 60);
    letrero.setDisplaySize(anchoLetrero, (anchoLetrero * letrero.height) / letrero.width);
    const texto = this.add
      .text(width / 2, 4 + letrero.displayHeight * 0.42, this.controller.rotulos.mirar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "700",
        color: "#434547", // gris-900 (paleta Ignia) — legible sobre la madera clara
      })
      .setOrigin(0.5, 0.5)
      .setDepth(4);
    this.tweens.add({
      targets: [letrero, texto],
      angle: { from: -2, to: 2 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  /**
   * "3, 2, 1" — una vez por sesión, antes de pedir el primer ítem (D-187).
   * Puramente cosmético: no bloquea nada que un lector de pantalla necesite
   * (`AccessibleReto` ya anuncia `rotulos.cargando` mientras tanto), así que
   * no tiene espejo en la capa accesible — un conteo visual sin información
   * nueva no vale la pena anunciarlo dos veces.
   */
  private mostrarCuentaRegresiva(alTerminar: () => void): void {
    const { width, height } = this.scale;
    const numeros = ["3", "2", "1"];
    let i = 0;
    const siguiente = () => {
      if (i >= numeros.length) {
        alTerminar();
        return;
      }
      const texto = this.add
        .text(width / 2, height / 2, numeros[i], {
          fontFamily: "system-ui, sans-serif",
          fontSize: "96px",
          fontStyle: "800",
          color: "#f36b1c", // naranja-ignia
        })
        .setOrigin(0.5, 0.5)
        .setDepth(20)
        .setScale(0.4)
        .setAlpha(0);
      i++;
      this.tweens.add({
        targets: texto,
        scale: 1,
        alpha: 1,
        duration: 220,
        ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: texto,
            alpha: 0,
            scale: 1.3,
            delay: 380,
            duration: 220,
            onComplete: () => {
              texto.destroy();
              siguiente();
            },
          });
        },
      });
    };
    siguiente();
  }

  /**
   * Estrellas al acertar (D-187) — procedurales, no arte de Recraft: una
   * estrella es una forma simple que no necesita ilustración para leerse
   * bien, y evita gastar otra ronda de generación esta noche. Color
   * naranja-claro (paleta Ignia): nunca el dorado/amarillo del video de
   * referencia, que no existe en la marca.
   */
  private celebrar(): void {
    const { width } = this.scale;
    const y = 340;
    const cx = width / 2;
    for (let n = 0; n < 7; n++) {
      const estrella = this.add.star(cx, y, 5, 6, 14, 0xf8a337, 1).setDepth(15).setScale(0);
      const angulo = (Math.PI * 2 * n) / 7 - Math.PI / 2;
      const distancia = 70 + Math.random() * 30;
      this.tweens.add({
        targets: estrella,
        x: cx + Math.cos(angulo) * distancia,
        y: y + Math.sin(angulo) * distancia,
        scale: { from: 0, to: 1 },
        angle: Phaser.Math.Between(-90, 90),
        duration: 380,
        ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: estrella,
            alpha: 0,
            delay: 260,
            duration: 300,
            onComplete: () => estrella.destroy(),
          });
        },
      });
    }
  }

  private suscribir(evento: Parameters<RetoController["on"]>[0], fn: (payload?: unknown) => void): void {
    this.desuscribir.push(this.controller.on(evento, fn));
  }

  private limpiar(): void {
    this.controller.callar();
    this.desuscribir.forEach((f) => f());
    this.accesible?.destruir();
    this.limpiarTemporizadores();
  }

  private limpiarTemporizadores(): void {
    this.temporizadorConfirmar?.remove();
    this.temporizadorConfirmar = null;
    this.temporizadorSiguiente?.remove();
    this.temporizadorSiguiente = null;
  }

  // --- render ---------------------------------------------------------------

  private onCargando(): void {
    this.enunciadoTexto.setText(this.controller.rotulos.cargando);
    this.escenaContenedor.removeAll(true);
    this.opcionesContenedor.removeAll(true);
    this.opcionBotones = [];
    this.avisoTexto.setText("");
    this.limpiarTemporizadores();
  }

  private onItem(item: ItemDeReto): void {
    this.enunciadoTexto.setText(item.enunciado);
    const hayEscena = this.pintarEscena(item);
    this.pintarOpciones(item, hayEscena);
    this.escucharBoton.setVisible(true);
  }

  /**
   * Mundo Kinder multi-bioma (#34): la dramatización de la habilidad, arriba
   * de las opciones de siempre — ver el encabezado de la clase para por qué
   * esto NUNCA es un segundo camino de calificar. Devuelve si dibujó algo,
   * para que `pintarOpciones()` sepa si tiene que bajar su punto de arranque.
   */
  private pintarEscena(item: ItemDeReto): boolean {
    this.escenaContenedor.removeAll(true);
    switch (item.formato) {
      case "flash":
        this.prepararDestello(item);
        return true;
      case "toca_para_reventar":
        this.pintarBurbujas(item);
        return true;
      case "toca_origen_destino":
        this.pintarOrigenDestino(item);
        return true;
      default:
        return false;
    }
  }

  private pintarOpciones(item: ItemDeReto, hayEscena = false): void {
    this.opcionesContenedor.removeAll(true);
    this.opcionBotones = [];

    const { width } = this.scale;
    const anchoBoton = 130;
    const alto = 64;
    const espacio = 14;
    const porFila = item.opciones.length > 3 ? 2 : item.opciones.length;
    const filas = Math.ceil(item.opciones.length / porFila);
    // Debajo del botón Escuchar (165, ver crearBotonEscuchar) — o debajo de
    // `escenaContenedor` cuando hay dramatización (#34), que vive en la
    // banda 185-230.
    const inicioY = hayEscena ? 275 : 220;

    item.opciones.forEach((op, i) => {
      const fila = Math.floor(i / porFila);
      const col = i % porFila;
      const enEstaFila = Math.min(porFila, item.opciones.length - fila * porFila);
      const inicioX = width / 2 - ((anchoBoton + espacio) * enEstaFila - espacio) / 2 + anchoBoton / 2;
      const x = inicioX + col * (anchoBoton + espacio);
      const y = inicioY + fila * (alto + espacio);

      const rect = this.add
        .rectangle(x, y, anchoBoton, alto, COLOR_OPCION, 1)
        .setStrokeStyle(2, COLOR_OPCION_BORDE)
        .setInteractive({ useHandCursor: true });
      const texto = this.add
        .text(x, y, String(op.texto), {
          fontFamily: "system-ui, sans-serif",
          fontSize: "20px",
          fontStyle: "600",
          color: "#434547",
        })
        .setOrigin(0.5, 0.5);

      rect.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.tweens.add({ targets: [rect, texto], scaleX: 0.94, scaleY: 0.94, duration: 70, yoyo: true });
        this.controller.elegir(op.valor);
      });

      this.opcionesContenedor.add([rect, texto]);
      this.opcionBotones.push({ rect, texto, valor: op.valor });
    });

    void filas;
  }

  /**
   * `flash` (K01/K02, destello) — la PRIMERA vez que Modo Historia sirve un
   * formato con dibujo (#34). Mismo ritmo que `Pantalla.astro::
   * prepararDestello()`: un botón "ver" muestra `n` glifos durante
   * `EXPOSICION_MS`, los oculta, y queda listo para "ver otra vez" —
   * repetible sin límite ni penalización (línea roja #6 no aplica aquí,
   * pero el espíritu es el mismo: mirar de nuevo nunca cuesta nada). La
   * respuesta se sigue dando en los botones de `pintarOpciones()`.
   */
  private static readonly EXPOSICION_MS = 900;

  private prepararDestello(item: ItemDeReto): void {
    const { width } = this.scale;
    const y = 205;
    const vars = item.vars ?? {};
    const n = Number(vars.n ?? 0);
    const glifo = vars.glifo && vars.glifo !== "" ? vars.glifo : null;
    const disposicion = vars.disposicion ?? "linea";
    const posiciones = this.posicionesDestello(disposicion, n, width / 2, y);

    const boton = this.add
      .rectangle(width / 2, y, 150, 36, COLOR_TARJETA, 1)
      .setStrokeStyle(2, COLOR_BORDE)
      .setInteractive({ useHandCursor: true });
    const etiqueta = this.add
      .text(width / 2, y, this.controller.rotulos.verlo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5);

    let visto = false;
    let mostrando = false;
    boton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (mostrando) return;
      mostrando = true;
      const glifos = posiciones.map(([px, py]) =>
        glifo
          ? this.add.text(px, py, glifo, { fontSize: "22px" }).setOrigin(0.5, 0.5)
          : this.add.circle(px, py, 8, 0x434547, 1),
      );
      this.escenaContenedor.add(glifos);
      this.time.delayedCall(GameplayScene.EXPOSICION_MS, () => {
        glifos.forEach((g) => g.destroy());
        mostrando = false;
        if (!visto) {
          visto = true;
          etiqueta.setText(this.controller.rotulos.otraVez);
        }
      });
    });

    this.escenaContenedor.add([boton, etiqueta]);
  }

  /**
   * Las posiciones de los `n` glifos del destello, alrededor de `(cx, cy)`.
   * "disperso" usa desplazamientos FIJOS por índice, nunca `Math.random()`
   * — el mismo criterio que el resto del motor (mc-02): la variación es la
   * disposición en sí, elegida por el banco, no ruido en cada repintado.
   */
  private posicionesDestello(disposicion: string, n: number, cx: number, cy: number): Array<[number, number]> {
    const paso = 24;
    if (n <= 0) return [];
    if (disposicion === "linea") {
      const inicio = cx - (paso * (n - 1)) / 2;
      return Array.from({ length: n }, (_, i) => [inicio + i * paso, cy]);
    }
    if (disposicion === "par") {
      const columnas = Math.ceil(n / 2);
      const inicio = cx - (paso * (columnas - 1)) / 2;
      return Array.from({ length: n }, (_, i) => {
        const col = Math.floor(i / 2);
        const fila = i % 2;
        return [inicio + col * paso, cy - 10 + fila * 20];
      });
    }
    if (disposicion === "dado") {
      const PATRONES: Record<number, Array<[number, number]>> = {
        1: [[0, 0]],
        2: [[-1, -1], [1, 1]],
        3: [[-1, -1], [0, 0], [1, 1]],
        4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
        5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
        6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
      };
      const patron = PATRONES[Math.min(6, Math.max(1, n))];
      return patron.map(([dx, dy]) => [cx + dx * 14, cy + dy * 14]);
    }
    // "disperso"
    const OFFSETS: Array<[number, number]> = [
      [-16, -10], [10, -14], [-6, 6], [18, 4], [2, -2], [-14, 12], [-20, 0], [20, -6],
    ];
    return Array.from({ length: n }, (_, i) => {
      const [dx, dy] = OFFSETS[i % OFFSETS.length];
      return [cx + dx, cy + dy];
    });
  }

  /**
   * `toca_para_reventar` (tap-to-pop, #34) — burbujas decorativas que
   * revientan al tocarlas. Usa el arte bespoke de Desierto
   * (`burbuja-desierto`/`burbuja-pop-desierto`, `assets-manifest.ts`) si ya
   * está cargado; si no (otro bioma, o el asset todavía no llegó), cae a un
   * círculo genérico — degradar, nunca reventar el reto por un asset
   * faltante.
   *
   * La cantidad es decorativa (no se cuenta ni se valida aquí): usa `a`
   * (K12, "de cuántas se parte") o `n` (K01) de `item.vars`, la que exista.
   */
  private pintarBurbujas(item: ItemDeReto): void {
    const { width } = this.scale;
    const y = 205;
    const vars = item.vars ?? {};
    const cantidad = Math.min(10, Math.max(1, Number(vars.a ?? vars.n ?? 3)));
    const espacio = Math.min(38, (width - 80) / Math.max(1, cantidad - 1 || 1));
    const inicioX = width / 2 - (espacio * (cantidad - 1)) / 2;
    const tieneTextura = this.textures.exists("burbuja-desierto");

    for (let i = 0; i < cantidad; i++) {
      const x = inicioX + i * espacio;
      const burbuja: Phaser.GameObjects.Image | Phaser.GameObjects.Arc = tieneTextura
        ? this.add.image(x, y, "burbuja-desierto").setDisplaySize(30, 30)
        : this.add.circle(x, y, 15, 0x8ecae6, 0.85);
      burbuja.setInteractive({ useHandCursor: true });

      let reventada = false;
      burbuja.on(Phaser.Input.Events.POINTER_DOWN, () => {
        if (reventada) return;
        reventada = true;
        (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
        if (tieneTextura && this.textures.exists("burbuja-pop-desierto")) {
          (burbuja as Phaser.GameObjects.Image).setTexture("burbuja-pop-desierto");
        }
        this.tweens.add({
          targets: burbuja,
          alpha: 0,
          scale: 1.3,
          duration: 220,
          onComplete: () => burbuja.destroy(),
        });
      });

      this.escenaContenedor.add(burbuja);
    }
  }

  /**
   * `toca_origen_destino` (#34) — toca el objeto, toca el aro, salta solo:
   * el sustituto de arrastrar que pide `mc-20` para preescolares (nunca
   * arrastre libre). `ZonaDestino` ya la construyó la sesión paralela de
   * este mismo proyecto — se reusa tal cual, sin variar por bioma (es
   * interfaz, no ambientación: ver su propio encabezado).
   *
   * El glifo que salta es el que declaró el ítem (`item.vars.glifo`) — el
   * MISMO principio de #347 (el banco manda qué se dibuja, la escena nunca
   * inventa un emoji). Repetible sin límite: cada toque vuelve a saltar.
   */
  private pintarOrigenDestino(item: ItemDeReto): void {
    const { width } = this.scale;
    const y = 205;
    const glifo = item.vars?.glifo && item.vars.glifo !== "" ? item.vars.glifo : "●";
    const xOrigen = width / 2 - 70;
    const xDestino = width / 2 + 70;

    const destino = new ZonaDestino(this, xDestino, y, 24);
    destino.pulsar();

    const origen = this.add
      .text(xOrigen, y, glifo, { fontSize: "28px" })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    let saltando = false;
    origen.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (saltando) return;
      saltando = true;
      (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
      this.tweens.add({
        targets: origen,
        x: xDestino,
        y,
        scale: 0.6,
        duration: 380,
        ease: "Cubic.easeIn",
        onComplete: () => {
          origen.setPosition(xOrigen, y).setScale(1);
          saltando = false;
        },
      });
    });

    this.escenaContenedor.add([destino, origen]);
  }

  /**
   * D-189: tocar una opción ya no muestra un botón "Listo" — envía sola,
   * tras una breve ventana en la que tocar OTRA opción reemplaza la
   * elección y reinicia la espera. Preserva la línea roja #8 (`mc-30`:
   * corregir antes de que cuente mejora la calificación el 79% de las
   * veces) sin el botón separado que el dueño pidió quitar del camino de
   * toque: la ventana ES el "cambiar de opinión", solo que no necesita un
   * segundo toque para ejercerla — otro toque a tiempo basta.
   *
   * SOLO existe en esta escena. `AccessibleReto.ts` sigue con su botón
   * "Ready" manual y SIN temporizador — ver el campo `temporizadorConfirmar`
   * arriba para el porqué (WCAG 2.2.1, Timing Adjustable).
   */
  private static readonly VENTANA_DE_GRACIA_MS = 900;

  private onSeleccion(valor: number | string): void {
    for (const b of this.opcionBotones) {
      const elegido = b.valor === valor;
      b.rect.setFillStyle(elegido ? COLOR_OPCION_ELEGIDA : COLOR_OPCION);
      b.rect.setStrokeStyle(2, elegido ? COLOR_ACENTO : COLOR_OPCION_BORDE);
    }
    this.temporizadorConfirmar?.remove();
    this.temporizadorConfirmar = this.time.delayedCall(GameplayScene.VENTANA_DE_GRACIA_MS, () => {
      this.temporizadorConfirmar = null;
      this.controller.confirmar();
    });
  }

  private limpiarVeredictoYAcciones(): void {
    this.veredictoContenedor.removeAll(true);
    this.temporizadorSiguiente?.remove();
    this.temporizadorSiguiente = null;
    for (const b of this.opcionBotones) {
      b.rect.setFillStyle(COLOR_OPCION);
      b.rect.setStrokeStyle(2, COLOR_OPCION_BORDE);
    }
  }

  private onVeredicto(v: VeredictoDeReto): void {
    const { width } = this.scale;
    const y = 340;
    const color = v.offline ? COLOR_MUTED : v.correcto ? COLOR_DOMINADA : COLOR_MUTED;

    // Estrellas solo al acertar (D-187) — nunca en una respuesta incorrecta
    // ni pendiente de conexión: línea roja #7, Larry no avergüenza, y
    // tampoco festeja un veredicto que todavía no es definitivo (offline).
    if (v.correcto && !v.offline) this.celebrar();

    // D-198, ronda 2: el mismo criterio de la línea roja #7 en sonido —
    // "acierto" es una campanita alegre; "error" es neutral, nunca un
    // zumbador de castigo. Ninguno de los dos suena offline: el veredicto
    // todavía no es definitivo (mismo motivo que `celebrar()` de arriba).
    if (!v.offline) {
      (this.registry.get("sfxManager") as SfxManager).reproducir(v.correcto ? "acierto" : "error");
    }

    const barra = this.add.rectangle(width / 2 - 150, y, 4, 60, color).setOrigin(0, 0);
    const titulo = this.add
      .text(width / 2 - 130, y, v.titulo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "600",
        color: "#434547",
        wordWrap: { width: width - 200 },
      })
      .setOrigin(0, 0);
    const siguiente = v.siguienteTexto
      ? this.add
          .text(width / 2 - 130, y + 30, v.siguienteTexto, {
            fontFamily: "system-ui, sans-serif",
            fontSize: "14px",
            color: "#727476",
            wordWrap: { width: width - 200 },
          })
          .setOrigin(0, 0)
      : null;

    this.veredictoContenedor.add([barra, titulo]);
    if (siguiente) this.veredictoContenedor.add(siguiente);

    /*
     * D-189: al acertar, se celebra y se avanza sola — sin botón "Siguiente"
     * que tocar, para que el ritmo sea el del video de referencia. Al
     * fallar o quedar pendiente (offline, siempre `correcto: false`) se
     * queda el botón manual: forzar el avance ahí borraría la oportunidad
     * de "reintentar" antes de verla, que es justo lo que la línea roja #8
     * protege.
     */
    if (v.correcto && !v.offline) {
      this.mostrarAcciones([]);
      this.temporizadorSiguiente?.remove();
      this.temporizadorSiguiente = this.time.delayedCall(1800, () => {
        this.temporizadorSiguiente = null;
        this.controller.siguiente();
      });
    } else {
      const acciones: Array<"reintentar" | "siguiente"> = v.ofrecerReintentar
        ? ["reintentar", "siguiente"]
        : ["siguiente"];
      this.mostrarAcciones(acciones);
    }
  }

  private mostrarAcciones(cuales: Array<"reintentar" | "siguiente">): void {
    this.accionesContenedor.removeAll(true);
    const { width } = this.scale;
    const anchoBoton = 150;
    const y = this.scale.height - 60;
    const espacio = 12;
    const inicioX = width / 2 - ((anchoBoton + espacio) * cuales.length - espacio) / 2 + anchoBoton / 2;

    cuales.forEach((cual, i) => {
      const x = inicioX + i * (anchoBoton + espacio);
      const esPrimario = cual === "siguiente";
      const rect = this.add
        .rectangle(x, y, anchoBoton, 52, esPrimario ? COLOR_ACENTO : COLOR_OPCION, 1)
        .setStrokeStyle(esPrimario ? 0 : 2, COLOR_OPCION_BORDE)
        .setInteractive({ useHandCursor: true });
      const texto = this.add
        .text(x, y, this.controller.rotulos[cual], {
          fontFamily: "system-ui, sans-serif",
          fontSize: "16px",
          fontStyle: "600",
          color: esPrimario ? "#ffffff" : "#434547",
        })
        .setOrigin(0.5, 0.5);

      rect.on(Phaser.Input.Events.POINTER_DOWN, () => {
        this.tweens.add({ targets: [rect, texto], scaleX: 0.95, scaleY: 0.95, duration: 70, yoyo: true });
        if (cual === "reintentar") this.controller.reintentar();
        else this.controller.siguiente();
      });

      this.accionesContenedor.add([rect, texto]);
    });
  }

  private crearBotonEscuchar(): void {
    const { width } = this.scale;
    const y = 165; // debajo del enunciado, que ahora empieza en 112 (D-187: hueco del letrero)
    this.escucharBoton = this.add
      .rectangle(width / 2, y, 130, 40, COLOR_TARJETA, 1)
      .setStrokeStyle(2, COLOR_BORDE)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);
    const texto = this.add
      .text(width / 2, y, this.controller.rotulos.escuchar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5);
    this.escucharBoton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.controller.decir(this.controller.actual?.enunciado ?? "", true);
    });
    texto.setInteractive({ useHandCursor: true }).on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.controller.decir(this.controller.actual?.enunciado ?? "", true);
    });
  }

  private crearSalida(): void {
    const { width } = this.scale;
    const salida = this.add
      .text(width - 16, 16, "✕", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#727476",
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    salida.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.controller.callar();
      this.volverAlMapa();
    });
  }

  // --- límite de pantalla (F8) ------------------------------------------------

  private onLimite(l: LimiteDePantalla): void {
    if (l.tipo === "AVISO") {
      this.avisoTexto.setText(l.textos.cuerpo ?? "");
    } else if (l.tipo === "DESCANSO") {
      this.mostrarCortina({
        titulo: l.textos.titulo,
        cuerpo: l.textos.cuerpo,
        nota: l.textos.afuera,
        boton: l.textos.seguir,
        onBoton: () => {
          this.cerrarCortina();
          this.controller.cerrarDescanso();
        },
      });
    }
  }

  private onDespedida(l: LimiteDePantalla & { hechos: number; textos: Record<string, string> }): void {
    const plantilla = l.hechos === 1 ? l.textos.retosUno : l.textos.retosOtros;
    const nota = plantilla && l.hechos > 0 ? plantilla.replace("{n}", String(l.hechos)) : undefined;
    this.opcionesContenedor.removeAll(true);
    this.accionesContenedor.removeAll(true);
    this.veredictoContenedor.removeAll(true);
    this.enunciadoTexto.setText("");
    this.mostrarCortina({
      cuerpo: l.textos.cuerpo,
      nota,
      boton: l.textos.salir || this.controller.rotulos.salir,
      onBoton: () => this.volverAlMapa(),
    });
  }

  /**
   * Vuelve al mapa SIN recargar la página (D-200.1, fase 3) — pero
   * `scene.resume()` sigue prohibido, por la misma razón de siempre: el
   * mapa tiene que mostrar la pericia que el servidor ACABA de recalcular
   * al calificar la última respuesta, nunca la que había antes de jugar
   * (`packages/motor/src/mapa.ts` #231, ninguna segunda fuente de verdad
   * para el árbol). La diferencia con antes no es SI se piden datos
   * frescos del servidor — siempre se piden — sino CÓMO: en vez de una
   * navegación real de página, `enrutador.irA` pide la MISMA URL
   * (`this.salirA`, la de siempre) con `fetch`, y `arrancarHistoriaEnSesion`
   * (D-200.1) arranca `MapScene`/`MenuScene` fresca con esos datos, en la
   * MISMA sesión de Phaser — funciona igual reachado desde la SPA de
   * "¿quién juega?" o desde `/mapa/` cargada directo, porque no le importa
   * cuál `Phaser.Game` sea. Si el `fetch` falla por lo que sea, cae a la
   * navegación real de siempre — nunca un mapa a medias.
   */
  private volverAlMapa(): void {
    // Los datos frescos salen de `/api/historia-datos`, no de pedir
    // `kids/mapa.astro` con `fetch` y extraerle la isla.
    //
    // Las dos vías funcionan; el endpoint gana por dos razones concretas: no
    // arrastra el HTML entero de una página que nadie va a pintar, y no
    // depende de la FORMA del marcado — un `id` renombrado en el componente
    // rompía la extracción sin que nada fallara al compilar.
    //
    // Lo que NO cambia es por qué se piden datos frescos en vez de un
    // `resume()`: mostraría la pericia de ANTES de jugar, no la que el
    // servidor acaba de recalcular al calificar la última respuesta
    // (`packages/motor/src/mapa.ts` #231, ninguna segunda fuente de verdad).
    void entrarAHistoria(this, this.salirA);
  }

  private mostrarCortina(opts: { titulo?: string; cuerpo?: string; nota?: string; boton: string; onBoton: () => void }): void {
    this.cerrarCortina();
    const { width, height } = this.scale;
    const contenedor = this.add.container(0, 0).setDepth(10);
    const fondo = this.add.rectangle(0, 0, width, height, 0x16181a, 0.6).setOrigin(0, 0).setInteractive();
    const anchoTarjeta = Math.min(320, width - 48);
    const tarjeta = this.add
      .rectangle(width / 2, height / 2, anchoTarjeta, 220, 0xffffff, 1)
      .setStrokeStyle(2, COLOR_BORDE);

    const elementos: Phaser.GameObjects.GameObject[] = [fondo, tarjeta];
    let y = height / 2 - 80;

    if (opts.titulo) {
      elementos.push(
        this.add
          .text(width / 2, y, opts.titulo, {
            fontFamily: "system-ui, sans-serif",
            fontSize: "18px",
            fontStyle: "600",
            color: "#434547",
            align: "center",
            wordWrap: { width: anchoTarjeta - 40 },
          })
          .setOrigin(0.5, 0),
      );
      y += 40;
    }
    if (opts.cuerpo) {
      const cuerpoTexto = this.add
        .text(width / 2, y, opts.cuerpo, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
          color: "#434547",
          align: "center",
          wordWrap: { width: anchoTarjeta - 40 },
        })
        .setOrigin(0.5, 0);
      elementos.push(cuerpoTexto);
      y += cuerpoTexto.height + 10;
    }
    if (opts.nota) {
      elementos.push(
        this.add
          .text(width / 2, y, opts.nota, {
            fontFamily: "system-ui, sans-serif",
            fontSize: "13px",
            color: "#727476",
            align: "center",
            wordWrap: { width: anchoTarjeta - 40 },
          })
          .setOrigin(0.5, 0),
      );
      y += 26;
    }

    const boton = this.add
      .rectangle(width / 2, height / 2 + 80, anchoTarjeta - 60, 48, COLOR_ACENTO, 1)
      .setInteractive({ useHandCursor: true });
    const botonTexto = this.add
      .text(width / 2, height / 2 + 80, opts.boton, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "600",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);
    boton.on(Phaser.Input.Events.POINTER_DOWN, opts.onBoton);

    contenedor.add([...elementos, boton, botonTexto]);
    this.cortina = contenedor;
  }

  private cerrarCortina(): void {
    this.cortina?.destroy(true);
    this.cortina = null;
  }
}
