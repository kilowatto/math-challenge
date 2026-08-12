/**
 * LoaderScene — la pantalla de carga, con 100 cuadros que caen (D-201).
 *
 * ─── Qué reemplaza ─────────────────────────────────────────────────────────
 *
 * A `CargaGlobalScene` (D-200), que precargaba una lista fija con una barra
 * naranja. Lo que aquella no podía hacer, y esta sí:
 *
 *  · **Bajar solo lo que cambió.** Aquella comparaba UN hash global: tocar un
 *    archivo invalidaba el catálogo entero y el niño repagaba 13.15 MB en 4G
 *    lento. Ésta compara hash por archivo (`planDeCarga`).
 *  · **Un progreso que no miente.** Aquella contaba archivos; un fondo de
 *    300 KB y un icono de 8 KB valían lo mismo, así que la barra saltaba al
 *    principio y se atascaba al final. Ésta pondera por bytes.
 *  · **Decir qué está cargando.** El nombre del asset, en el HUD.
 *
 * ─── Por qué 100 cuadros y no una barra ────────────────────────────────────
 *
 * Uno por cada 1%. Una barra dice cuánto falta; cien objetos cayendo y
 * apilándose dicen lo mismo y además **se ven como un videojuego**, que es la
 * vara del proyecto desde el primer fotograma y no un pulido posterior.
 *
 * ─── La física va EN ESTA ESCENA, nunca en el config global ────────────────
 *
 * Se intentó `physics: { default: "matter" }` en `game/juego.ts`, adelantando
 * lo que este loader necesitaba. En el simulador apareció un cuadro negro con
 * diagonal verde flotando junto a Larry —el wireframe de depuración de
 * Matter— en una pantalla sin física, y `debug: false` **no lo suprimió**.
 * Declarándola por escena, el motor solo existe donde hay cuerpos que simular.
 */
import Phaser from "phaser";
import type { DatosQuienJuega } from "./QuienJuegaScene";
import { TODAS_LAS_IMAGENES } from "../assets-manifest";

const TOTAL_CUADROS = 100;
/** Fracción del alto de pantalla que puede ocupar la pila. */
const FACTOR_LLENADO = 0.55;
const LADO_MAX = 42;
const LADO_MIN = 14;

/**
 * Traza de diagnóstico, apagada salvo que se pida.
 *
 * Se enciende en `/dev/loader/` o con `?traza=1`. Existe porque este loader se
 * depuró cuatro despliegues a ciegas —en el simulador no hay consola— y el
 * único síntoma era un 0% que no se movía. Un `console.log` que solo habla
 * cuando alguien lo pide no cuesta nada en producción y ahorra esa clase de
 * sesión entera.
 */
const TRAZA =
  typeof location !== "undefined" &&
  (location.pathname.startsWith("/dev/") || location.search.includes("traza=1"));
const traza = (etapa: string, extra?: unknown) => {
  // eslint-disable-next-line no-console
  if (TRAZA) console.log(`[LoaderScene] ${etapa}`, extra ?? "");
};

const NARANJA = 0xf36b1c;
/**
 * El verde de la excepción D-186 —vegetación de Modo Historia—, no un verde
 * nuevo para esta pantalla. `audits/brand-image.mjs` conoce éste; un hex
 * inventado suma una violación de paleta por cada pantalla que se dibuje.
 */
const VERDE_FOLLAJE = "#5B8C3A";
export class LoaderScene extends Phaser.Scene {
  private datos!: DatosQuienJuega;

  private progresoReal = 0;
  private progresoVisible = 0;
  private caidos = 0;
  private lado = 24;
  private cuerpos: Phaser.Physics.Matter.Image[] = [];
  /** Suelo y paredes. Se rehacen al cambiar el tamaño; ver `reacomodar()`. */
  private bordes: MatterJS.BodyType[] = [];

  private textoPct!: Phaser.GameObjects.Text;
  /** El signo `%`, aparte del número: `reacomodar()` lo reubica al crecer el número. */
  private textoPorcentaje!: Phaser.GameObjects.Text;
  private textoAsset!: Phaser.GameObjects.Text;
  private barra!: Phaser.GameObjects.Graphics;
  private techoY = 0;
  /** El último tamaño con el que se dispuso el HUD. Ver `update()`. */
  private ultimoAncho = 0;
  private ultimoAlto = 0;
  private inclinacionObjetivo = 0;

  private version = "";
  private ultimoLabel = "";

  constructor() {
    // La física, declarada por escena. Ver el encabezado: en el config global
    // pintaba su wireframe encima de pantallas que no usan física.
    super({
      key: "LoaderScene",
      physics: { matter: { gravity: { x: 0, y: 1.1 }, debug: false } },
    });
  }

  init(datos: DatosQuienJuega): void {
    this.datos = datos;
    this.progresoReal = 0;
    this.progresoVisible = 0;
    this.caidos = 0;
    this.cuerpos = [];
    this.bordes = [];
    this.ultimoAncho = 0;
    this.ultimoAlto = 0;
    this.ultimoLabel = "";
  }

  create(): void {
    traza("create", this.medidas());
    // Verde-follaje (D-186), nunca un blanco de formulario: es lo que se ve
    // el primer fotograma, antes de que exista una sola imagen.
    this.cameras.main.setBackgroundColor(VERDE_FOLLAJE);

    this.lado = this.ladoDeCuadro();
    this.hornearCuadro();
    this.construirHud();
    this.construirMundo();
    this.construirBotonInclinacion();
    this.escucharLaCarga();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.reacomodar, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      this.scale.off(Phaser.Scale.Events.RESIZE, this.reacomodar, this),
    );
  }

  /**
   * El tamaño de la pantalla, con suelo — nunca cero.
   *
   * `this.scale.width` vale **0** cuando Phaser midió al padre antes de que el
   * navegador hiciera el layout, y esta escena es la primera del juego, así que
   * le toca esa carrera más que a ninguna. Con cero, el HUD se construía con
   * `fontSize: "0px"` (texto invisible), el sello de versión se colocaba en
   * (-12, -10) —fuera de cuadro— y el suelo de la física caía en x=0. Se veía
   * como «el loader no pinta nada», que es un síntoma que no apunta a su causa
   * por ningún lado.
   *
   * Se corrige por partida doble: aquí, cayendo al viewport real; y en
   * `reacomodar()`, rehaciendo la disposición cuando el tamaño de verdad llega.
   */
  private medidas(): { width: number; height: number } {
    const w = this.scale.width || window.innerWidth || 360;
    const h = this.scale.height || window.innerHeight || 640;
    return { width: Math.max(240, w), height: Math.max(320, h) };
  }

  /**
   * Rehace la disposición cuando cambia el tamaño.
   *
   * Pasa de verdad en tres momentos: el niño gira el teléfono, el teclado del
   * sistema aparece y desaparece, y —el que costó encontrar— el primer fotograma
   * en el que el navegador por fin midió la página. Los cuadros ya caídos se
   * quedan donde están: reposicionarlos a mitad de la simulación se ve como un
   * salto, y el loader dura segundos.
   */
  private reacomodar(): void {
    const { width, height } = this.medidas();

    this.textoPct.setFontSize(Math.round(width * 0.15));
    this.textoPorcentaje.setFontSize(Math.round(width * 0.05));
    this.textoPorcentaje.setPosition(this.textoPct.x + this.textoPct.width + 4, 26);
    this.textoAsset.setPosition(24, this.textoPct.y + this.textoPct.height + 22);
    this.selloVersion.setPosition(width - 12, height - 10);
    this.techoY = this.textoAsset.y + this.textoAsset.height + 46;

    // Las paredes y el suelo se rehacen: son estáticos, y dejarlos donde
    // estaban con la pantalla ya cambiada deja caer los cuadros al vacío.
    for (const cuerpo of this.bordes) this.matter.world.remove(cuerpo);
    this.bordes = [];
    this.construirMundo();
  }

  /**
   * La descarga vive en `CargaAssetsScene`, y esta escena solo la escucha.
   *
   * El porqué de la separación está entero en el encabezado de esa escena, y
   * se resume en una línea: **Phaser no corre `update()` ni la física mientras
   * la escena está en `LOADING`**, así que una escena que carga no puede
   * animar. Ésta no tiene `preload()`, entra en `RUNNING` en el primer
   * fotograma y los cuadros caen desde el 0%.
   *
   * Se suscribe ANTES de lanzarla. Al revés se pierden los primeros eventos:
   * el manifiesto es un JSON pequeño y suele llegar dentro del mismo
   * fotograma en que arranca.
   */
  private escucharLaCarga(): void {
    const carga = this.scene.get("CargaAssetsScene");

    carga.events.on("version", (v: string) => {
      this.version = v;
      this.selloVersion.setText(v || "sin manifiesto");
    });
    carga.events.on("progreso", (v: number) => {
      this.progresoReal = Math.max(this.progresoReal, v);
    });
    carga.events.on("asset", (label: string) => {
      this.ultimoLabel = label;
    });
    carga.events.on("listo", () => {
      traza("carga lista");
      this.progresoReal = 1;
    });
    // Un catálogo vacío o ilegible no encierra al niño en el loader: los 100
    // cuadros caen igual y se entra con lo que haya.
    carga.events.on("sin-manifiesto", () => {
      traza("sin manifiesto - se entra igual");
      this.progresoReal = 1;
    });

    // Al salir, la otra escena se detiene y sus listeners se sueltan: si no,
    // una segunda visita acumula suscripciones sobre una escena ya muerta.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      carga.events.removeAllListeners();
      this.scene.stop("CargaAssetsScene");
    });

    this.scene.launch("CargaAssetsScene");
  }

  // ─── El HUD ──────────────────────────────────────────────────────────────

  private construirHud(): void {
    const { width } = this.medidas();

    this.textoPct = this.add
      .text(24, 18, "0", {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: `${Math.round(width * 0.15)}px`,
        fontStyle: "700",
        color: "#FFFFFF",
      })
      .setDepth(20);

    this.textoPorcentaje = this.add
      .text(this.textoPct.x + this.textoPct.width + 4, 26, "%", {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: `${Math.round(width * 0.05)}px`,
        fontStyle: "700",
        color: "#F8A337",
      })
      .setDepth(20);

    this.barra = this.add.graphics().setDepth(20);

    this.textoAsset = this.add
      .text(24, this.textoPct.y + this.textoPct.height + 22, "", {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "13px",
        color: "#FFFFFF",
      })
      .setDepth(20);

    this.construirSelloDeVersion();
    this.selloVersion.setText(this.version || "sin manifiesto");

    // El techo invisible: los cuadros nacen y rebotan POR DEBAJO del HUD, así
    // que ni la física ni la inclinación pueden llegar a tapar el porcentaje.
    // Se calcula del alto real del HUD, no de una constante — el `%` escala
    // con el ancho de pantalla.
    this.techoY = this.textoAsset.y + this.textoAsset.height + 46;
  }

  /**
   * La versión, en una esquina — pedido del dueño: «sutil pero legible, para
   * saber fácil qué versión estamos».
   *
   * Es el `version` del manifiesto: un hash de 16 caracteres derivado del
   * contenido de TODOS los assets. Cambia solo si cambió algún archivo, así
   * que dos dispositivos que muestren el mismo sello tienen exactamente el
   * mismo catálogo — que es la pregunta que uno se hace de verdad al mirar
   * una versión, mucho más útil que una fecha o un número que alguien sube a
   * mano.
   *
   * Empieza vacío porque el manifiesto llega por red; se rellena en `cargar()`.
   */
  private selloVersion!: Phaser.GameObjects.Text;

  private construirSelloDeVersion(): void {
    const { width, height } = this.medidas();
    this.selloVersion = this.add
      .text(width - 12, height - 10, "", {
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "10px",
        color: "#FFFFFF",
      })
      .setOrigin(1, 1)
      .setAlpha(0.45)
      .setDepth(20);
  }

  // ─── El mundo físico ─────────────────────────────────────────────────────

  /**
   * El lado de cada cuadro, para que los 100 quepan en cualquier pantalla.
   *
   * Del área disponible, no de un tamaño fijo: `sqrt(área / 100)` da el lado
   * teórico, y después se comprueba de verdad cuántas columnas y filas salen.
   * Funciona igual en vertical y en horizontal porque lee el tamaño real del
   * canvas en vez de suponerlo.
   */
  private ladoDeCuadro(): number {
    const { width, height } = this.medidas();
    let lado = Math.sqrt((width * height * FACTOR_LLENADO) / TOTAL_CUADROS);
    for (let i = 0; i < 5; i++) {
      const columnas = Math.max(1, Math.floor(width / lado));
      const filas = Math.ceil(TOTAL_CUADROS / columnas);
      if (filas * lado <= height * FACTOR_LLENADO) break;
      lado *= 0.92;
    }
    return Phaser.Math.Clamp(lado, LADO_MIN, LADO_MAX);
  }

  private construirMundo(): void {
    const { width, height } = this.medidas();
    // Suelo y paredes: sin ellos los cuadros se salen por abajo y por los
    // lados al rebotar. Se guardan porque `reacomodar()` los rehace.
    this.bordes = [
      this.matter.add.rectangle(width / 2, height + 10, width * 2, 20, { isStatic: true }),
      this.matter.add.rectangle(-10, height / 2, 20, height * 4, { isStatic: true }),
      this.matter.add.rectangle(width + 10, height / 2, 20, height * 4, { isStatic: true }),
    ];
  }

  /**
   * El cuadro naranja de marca, dibujado a mano y horneado en una textura.
   *
   * Es lo que cae mientras todavía no ha bajado ni un avatar — o sea, los
   * primeros segundos de la primera visita, que es justo cuando el niño está
   * mirando. La primera versión usaba `__DEFAULT` con `setTint`, y **no se veía
   * nada**: `__DEFAULT` es una textura TRANSPARENTE en Phaser (la del cuadro
   * magenta es `__MISSING`), así que teñirla no pinta un solo pixel. El
   * síntoma era un loader que contaba bien y no mostraba ni un cuadro hasta
   * pasado el 30%, cuando por fin había avatares que usar.
   *
   * Dibujado con `Graphics` y no generado con Recraft, según D-201: una forma
   * abstracta sin referente real es de las 12 excepciones — pedirle a Recraft
   * «un cuadrado naranja» devuelve un objeto del mundo.
   */
  private static readonly CUADRO = "mc-loader-cuadro";

  private hornearCuadro(): void {
    if (this.textures.exists(LoaderScene.CUADRO)) return;
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(NARANJA, 1).fillRoundedRect(0, 0, 64, 64, 12);
    g.lineStyle(3, 0xffffff, 0.35).strokeRoundedRect(1.5, 1.5, 61, 61, 11);
    g.generateTexture(LoaderScene.CUADRO, 64, 64);
    g.destroy();
  }

  /**
   * Con qué textura cae cada cuadro.
   *
   * El ícono de la app y los 16 avatares-animal, mezclados — pedido del dueño.
   * Si ninguno cargó todavía, cae el cuadro naranja de marca.
   */
  private texturaDeCuadro(indice: number): string {
    const candidatas = ["icono-app", ...this.texturasDeAvatar()];
    const disponibles = candidatas.filter((c) => this.textures.exists(c));
    if (disponibles.length === 0) return LoaderScene.CUADRO;
    return disponibles[indice % disponibles.length];
  }

  private texturasDeAvatar(): string[] {
    return TODAS_LAS_IMAGENES.filter((a) => a.url.startsWith("/avatares/")).map((a) => a.clave);
  }

  private soltarCuadro(indice: number): void {
    const { width } = this.medidas();
    const mitad = this.lado / 2;
    const x = Phaser.Math.Between(mitad, width - mitad);
    // Nacen POR DEBAJO del techo del HUD: así el techo nunca bloquea la
    // entrada de cuadros nuevos, solo impide que suban a taparlo.
    const y = this.techoY + Phaser.Math.Between(20, 140);

    // Rebote variable: la mayoría rebota poco, alguno mucho. Un valor fijo
    // hace que los 100 caigan igual y se vea mecánico.
    const restitucion = Phaser.Math.FloatBetween(0.05, 0.8);
    const cuerpo = this.matter.add.image(x, y, this.texturaDeCuadro(indice), undefined, {
      restitution: restitucion,
      friction: 0.3,
      frictionAir: 0.001,
    });

    cuerpo.setDisplaySize(this.lado, this.lado);
    cuerpo.setAngle(Phaser.Math.Between(0, 360));

    this.cuerpos.push(cuerpo);
    this.caidos++;
  }

  /**
   * Solo se sale cuando los 100 cuadros cayeron **y** la carga terminó.
   *
   * Las dos condiciones, no una: si bastara con la carga, en una segunda
   * visita —todo cacheado— la pantalla parpadearía sin que se viera un solo
   * cuadro; y si bastaran los cuadros, se entraría con assets a medias.
   */
  update(): void {
    // El % visual persigue al real. Sin esto, un progreso que llega a saltos
    // —y llega a saltos: los archivos completan cuando completan— se ve como
    // un número que pega tirones.
    this.progresoVisible = Phaser.Math.Linear(this.progresoVisible, this.progresoReal, 0.06);

    // El tamaño puede llegar tarde y SIN evento: el `RESIZE` de Phaser cuelga
    // del `resize` del navegador, que no se dispara cuando lo que cambió fue
    // el layout del propio contenedor. Comparar dos números por fotograma es
    // más barato que un ResizeObserver y cubre el caso que de verdad se vio:
    // el HUD y el suelo construidos contra una pantalla de 0 px.
    const { width, height } = this.medidas();
    if (width !== this.ultimoAncho || height !== this.ultimoAlto) {
      this.ultimoAncho = width;
      this.ultimoAlto = height;
      this.reacomodar();
    }

    const pct = Math.floor(this.progresoVisible * 100);
    this.textoPct.setText(String(pct));
    // El `%` va pegado al número, y el número CRECE: de una cifra a dos, y de
    // dos a tres. Colocarlo una sola vez al construir el HUD lo dejaba encima
    // del número en cuanto pasaba de 9%.
    this.textoPorcentaje.setX(this.textoPct.x + this.textoPct.width + 4);

    while (this.caidos < pct && this.caidos < TOTAL_CUADROS) this.soltarCuadro(this.caidos);

    if (this.ultimoLabel) this.textoAsset.setText(this.ultimoLabel);
    this.pintarBarra();
    this.aplicarInclinacion();

    if (this.caidos >= TOTAL_CUADROS && this.progresoReal >= 1 && this.progresoVisible > 0.995) {
      traza("terminado -> QuienJuegaScene");
      this.scene.start("QuienJuegaScene", this.datos);
    }
  }

  private pintarBarra(): void {
    const { width } = this.medidas();
    const ancho = Math.min(320, width * 0.6);
    const x = 24;
    const y = this.textoAsset.y - 14;
    this.barra.clear();
    this.barra.fillStyle(0xffffff, 0.12).fillRoundedRect(x, y, ancho, 3, 2);
    this.barra.fillStyle(NARANJA, 1).fillRoundedRect(x, y, ancho * this.progresoVisible, 3, 2);
  }

  /**
   * La inclinación mueve la gravedad de lado, suave.
   *
   * Tope de ±0.35 contra 1.1 de gravedad vertical: los cuadros se recuestan,
   * no salen disparados. El permiso se pide con un botón explícito porque iOS
   * exige un gesto humano — y un loader corre justo cuando el niño todavía no
   * ha tocado nada, así que aquí no se puede colgar del primer toque como hace
   * `QuienJuegaScene`.
   */
  /**
   * El botón de inclinación, y por qué es un botón.
   *
   * `QuienJuegaScene` cuelga el permiso del PRIMER TOQUE de la pantalla
   * (`input.once(POINTER_DOWN)`), porque para entonces ya hay una escena
   * pintada con la que el niño va a interactuar de todos modos. Aquí no sirve:
   * un loader corre justo cuando todavía no ha tocado nada, y iOS 13+ exige un
   * gesto humano explícito antes de `requestPermission`.
   *
   * Así que se ofrece, no se roba. Si lo deniegan o el navegador no lo
   * soporta, los cuadros caen rectos y no pasa nada — el loader nunca depende
   * de esto para terminar.
   */
  private construirBotonInclinacion(): void {
    type ConPermiso = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const Clase =
      typeof DeviceOrientationEvent === "undefined" ? null : (DeviceOrientationEvent as ConPermiso);
    if (!Clase) return; // navegador sin soporte — caen rectos, sin romper nada

    const manejar = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      // 0.35 contra 1.1 de gravedad vertical: se recuestan, no salen
      // disparados. `gamma` va de -90 a 90; se normaliza sobre 45 para que un
      // giro cómodo de muñeca ya llegue al tope.
      this.inclinacionObjetivo = Phaser.Math.Clamp(e.gamma / 45, -1, 1) * 0.35;
    };

    const suscribir = () => window.addEventListener("deviceorientation", manejar);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () =>
      window.removeEventListener("deviceorientation", manejar),
    );

    // Android/escritorio: sin permiso explícito, se suscribe y ya.
    if (typeof Clase.requestPermission !== "function") {
      suscribir();
      return;
    }

    const { width, height } = this.medidas();
    const caja = this.add.container(width / 2, height - 34).setDepth(30);
    const fondo = this.add.graphics();
    fondo.fillStyle(0xffffff, 0.1).fillRoundedRect(-92, -16, 184, 32, 16);
    fondo.lineStyle(1, 0xffffff, 0.18).strokeRoundedRect(-92, -16, 184, 32, 16);
    const texto = this.add
      .text(0, 0, "Activar inclinacion", {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "13px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5);
    const zona = this.add.zone(0, 0, 184, 32).setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => {
      Clase.requestPermission?.()
        .then((estado) => {
          if (estado === "granted") suscribir();
        })
        .catch(() => {
          /* denegado - caen rectos, a proposito */
        })
        .finally(() => caja.destroy());
    });
    caja.add([fondo, texto, zona]);
  }

  private aplicarInclinacion(): void {
    const g = this.matter.world.localWorld.gravity;
    g.x = Phaser.Math.Linear(g.x, this.inclinacionObjetivo, 0.08);
  }
}
