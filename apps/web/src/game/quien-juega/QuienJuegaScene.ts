/**
 * QuienJuegaScene — "¿Quién juega?" en Phaser (D-190/D-192).
 *
 * ─── Por qué esto existe encima de una pantalla que ya funcionaba ──────────
 *
 * `kids/index.astro` es HTML puro a propósito (cero JavaScript, D-012,
 * mc-33) y SIGUE SIÉNDOLO — esta escena es una MEJORA PROGRESIVA, nunca un
 * reemplazo. El HTML de esa página es el contenido real y el que responde
 * primero; esta escena solo se monta si Phaser cargó bien, y en ese caso
 * oculta visualmente la rejilla de HTML (`entrada.ts` decide eso, no esta
 * clase). Un dispositivo lento o sin JS ve exactamente la pantalla de
 * siempre — nunca una pantalla en blanco. D-192 documenta esta reversa
 * puntual de "cero JavaScript" para esta pantalla, con la evidencia de
 * mc-33 anotada y no borrada.
 *
 * ─── Las caras son las MISMAS que ya dibuja el HTML, solo con otro pincel ──
 *
 * Seis formas × seis colores, el mismo criterio de `kids/index.astro`
 * (`caraDe()`/`indice()`): la forma manda porque sobrevive al daltonismo
 * (WCAG 2.2 §1.4.1), y los pares ya vienen resueltos por el servidor — esta
 * escena NUNCA recalcula forma/color, solo los recibe y los pinta con
 * `Graphics` en vez de SVG. Los colores son los mismos seis tokens de
 * `docs/guia-de-estilo.md` (`tokens.css`), copiados aquí a hex porque Phaser
 * no puede leer una variable CSS — ver `PALETA` más abajo.
 *
 * ─── Rango/XP vs. habilidad actual, nunca las dos reglas mezcladas ─────────
 *
 * Cada tarjeta trae SU PROPIO `dato` ya resuelto por el servidor
 * (`lib/quien-juega-datos.ts::datoDeTarjeta()`) — esta escena no decide
 * bandas ni calcula nada, solo pinta el tipo que le llega:
 *
 *   · `"rango"`  → SECUNDARIA/SERIO/PRO y el adulto: "Rango N · NNN XP".
 *   · `"habilidad"` → PRIMARIA: el rótulo en palabras ("Sumas básicas").
 *   · `"ninguno"` → KINDER, o sin datos todavía: nada, ni una línea vacía.
 *
 * ─── El toque, con la lección de esta sesión ya aplicada ───────────────────
 *
 * La zona de toque es un `Zone` HIJO del Container, con `setInteractive()`
 * SIN forma explícita — nunca `setInteractive(new Phaser.Geom.Circle(...),
 * Circle.Contains)`. Se probó en un simulador real, en esta misma sesión,
 * que una forma explícita de `hitArea` no registra el toque en esta build de
 * Phaser 4.2.1 aunque el toque caiga exactamente en el centro (`LevelNode.ts`
 * y `BotonSonido.ts` documentan el mismo hallazgo). El hit area AUTOGENERADO
 * (rectángulo del tamaño nativo del `Zone`) sí responde.
 */
import Phaser from "phaser";
import { BotonSonido } from "../objects/BotonSonido";
import { FlechaAtras } from "../objects/FlechaAtras";
import { LarryFotorrealista, LARRY_FOTO_CLAVES } from "../objects/LarryFotorrealista";
import { TODOS_LOS_ANIMALES, claveDeAnimal, type AnimalId } from "../../lib/avatares-animal";
import { CLAVES_ATREZO_PIN, clavePinDibujo, urlPinDibujo } from "../pin-dibujos";
import { CATALOGO } from "../../../../../packages/motor/src/pin-imagenes";

/** Los mismos seis tokens de `docs/guia-de-estilo.md`, copiados a hex — Phaser no lee `var(--…)`. */
const PALETA: ReadonlyArray<{ relleno: number; tinta: number }> = [
  { relleno: 0xf36b1c, tinta: 0x000000 }, // c0 — naranja
  { relleno: 0x0b6ab0, tinta: 0xffffff }, // c1 — azul
  { relleno: 0xf8a337, tinta: 0x000000 }, // c2 — naranja-claro
  { relleno: 0xce4912, tinta: 0xffffff }, // c3 — naranja-oscuro
  { relleno: 0xa4a6a8, tinta: 0x000000 }, // c4 — gris-400
  { relleno: 0x434547, tinta: 0xffffff }, // c5 — gris-900
] as const;

export type DatoDeTarjeta =
  | { tipo: "rango"; rango: number; xp: number }
  | { tipo: "habilidad"; rotulo: string }
  | { tipo: "ninguno" };

export interface TarjetaPerfil {
  id: string;
  alias: string;
  forma: number;
  color: number;
  /** El animal ya elegido (D-194), o `null` si el perfil no ha elegido ninguno — la cara procedural sigue siendo el respaldo, nunca una tarjeta vacía. */
  animal: AnimalId | null;
  esAdulto: boolean;
  dato: DatoDeTarjeta;
  href: string;
  /** En qué idioma hace sus retos ESTE perfil — el dueño pidió mostrarlo por tarjeta (D-194, segunda ronda). Uno de `LOCALES` (`i18n/index.ts`). */
  locale: string;
}

/**
 * Bandera por locale — pictográfica a propósito: KINDER no lee (D-019), y una
 * bandera identifica el PAÍS/dialecto tan bien como el texto ("es-MX" vs.
 * "es-ES" son dialectos distintos, no solo "español" — la misma distinción
 * que ya hace `packages/motor/src/alias.ts` con sus siete listas separadas).
 */
const BANDERA_POR_LOCALE: Readonly<Record<string, string>> = Object.freeze({
  en: "🇺🇸",
  "es-MX": "🇲🇽",
  "es-ES": "🇪🇸",
  "fr-FR": "🇫🇷",
  "pt-BR": "🇧🇷",
  "pt-PT": "🇵🇹",
  "de-DE": "🇩🇪",
});

export interface RotulosQuienJuega {
  titulo: string;
  pista: string;
  jugarComo: string;
  rango: string;
}

export interface DatosQuienJuega {
  tarjetas: TarjetaPerfil[];
  rotulos: RotulosQuienJuega;
}

const RADIO = 56; // 112px de diámetro — por encima del piso de 88px de KINDER (mc-20), con margen para el anillo del adulto.

export class QuienJuegaScene extends Phaser.Scene {
  private datos!: DatosQuienJuega;

  constructor() {
    super("QuienJuegaScene");
  }

  init(datos: DatosQuienJuega): void {
    this.datos = datos;
  }

  /**
   * Reusa arte YA aprobado de Modo Historia (D-080/D-184/D-190) — nada
   * nuevo que generar ni revisar. El aviso del dueño ("se ve fatal, sin
   * fondo, sin Larry, sin sonido") fue sobre el ACABADO de la pantalla, no
   * sobre las caras de los perfiles — eso sigue siendo trabajo de arte
   * aparte (avatares bespoke, D-193), pero el fondo/Larry/ícono de sonido
   * no tenían por qué esperar a esa ronda.
   */
  preload(): void {
    this.load.image("fondo-primaria-1", "/juego/fondo-primaria-1.webp");
    // Props de madera (D-194, segunda ronda): reemplazan los fondos blancos
    // procedurales del título y de la flecha de regreso.
    this.load.image("letrero-madera", "/juego/letrero-madera.webp");
    this.load.image("flecha-madera", "/juego/flecha-madera.webp");
    // Los 24 cuadros de Larry fotorrealista (D-196) — reposo, caminata, y
    // siete comportamientos. Ver `LarryFotorrealista.ts`.
    for (const clave of LARRY_FOTO_CLAVES) {
      this.load.image(clave, `/mapa/${clave}.webp`);
    }
    // Los 16 avatares-animal (D-194): se cargan todos, sin importar cuáles
    // elija esta casa — son 16 imágenes de 512px, más barato que una consulta
    // adicional para saber cuáles hacen falta, y `Phaser.Loader` de todas
    // formas pide una URL fija por textura (mismo motivo que `gen-larry.mjs`
    // documenta para las piezas de LarryAvatar).
    for (const id of TODOS_LOS_ANIMALES) {
      this.load.image(claveDeAnimal(id), `/avatares/${claveDeAnimal(id)}.webp`);
    }
    // El atrezo de madera del PIN (D-197.1) y los 24 dibujos (D-201) — se
    // cargan AQUÍ, con todo lo demás, no dentro de `PinScene`.
    //
    // La primera versión los cargaba en caliente al abrir el PIN, razonando
    // que cada niño solo ve nueve de los veinticuatro. Está mal por tres
    // motivos, y el dueño lo señaló antes de que llegara a producción:
    //
    //  1. **La rejilla se baraja POR NIÑO.** En una tablet compartida —el caso
    //     central de D-012— dos o tres hermanos ven entre todos casi los 24,
    //     así que el ahorro se evapora justo donde se suponía que contaba.
    //  2. **El PIN es la SEGUNDA pantalla**, que es exactamente donde D-200 y
    //     D-200.1 pusieron el precargador para que no hubiera huecos. Cargar
    //     en caliente reintroduce el hueco en la transición más visible del
    //     recorrido, y obliga a un spinner y a un estado de error propios.
    //  3. **Pesan 552 KB**, la mitad que los 38 cuadros de Larry que ya se
    //     cargan aquí sin discusión (972 KB).
    for (const clave of CLAVES_ATREZO_PIN) {
      this.load.image(clave, `/juego/${clave}.webp`);
    }
    for (const id of CATALOGO) {
      this.load.image(clavePinDibujo(id), urlPinDibujo(id));
    }
  }

  /**
   * Alto fijo de la cabecera (título + pista), en px — no una fracción de
   * `height`. Con `height*0.1` la cabecera se movía con el alto real del
   * viewport (D-041: un iPhone no mide lo mismo que un iPad) y en un
   * teléfono terminaba tan cerca de la rejilla que la pista se montaba
   * sobre la primera fila de caras — visto en un simulador real, no en el
   * código. Con el letrero de madera (D-194, segunda ronda) el alto real
   * varía con el ancho de pantalla (hasta ~165px en tableta/escritorio,
   * donde el letrero llega a su ancho máximo de 360px) — este número cubre
   * ese caso con margen, no el de un teléfono angosto.
   */
  private static readonly ALTO_CABECERA = 180;

  create(): void {
    const { width, height } = this.scale;
    // verde-follaje (D-186): el color de espera antes de que la imagen real
    // termine de decodificar — nunca un blanco de formulario.
    this.cameras.main.setBackgroundColor(0x5b8c3a);

    const fondo = this.add
      .image(width / 2, height / 2, "fondo-primaria-1")
      .setDisplaySize(width, height)
      .setDepth(0);

    // El letrero de madera del título (D-194, segunda ronda) — reemplaza el
    // panel blanco: "demasiados fondos blancos flotando" fue la crítica
    // exacta del dueño viendo esta pantalla. Mismo prop que ya usa
    // `MenuScene` para "Modo Historia/Retos" (`letrero-madera`,
    // `gen-mapa-historia.mjs`) — el texto se PINTA encima con Phaser, nunca
    // horneado en la imagen (D-019: la Sábana no habla en texto fijo, y de
    // todas formas hace falta en los siete locales).
    //
    // El letrero NO se centra en el ancho completo: la flecha de regreso
    // vive en la esquina superior izquierda y en un teléfono angosto un
    // letrero centrado la tapaba — visto en un simulador real. `zonaIcono`
    // reserva ese espacio y el letrero se centra en lo que queda.
    const zonaIcono = 90;
    const anchoLetrero = Math.min(360, width - zonaIcono - 20);

    const letrero = this.add.image(0, 0, "letrero-madera").setDepth(1);
    const escalaLetrero = anchoLetrero / letrero.width;
    letrero.setScale(escalaLetrero);
    letrero.setPosition(zonaIcono + anchoLetrero / 2 + 10, letrero.displayHeight / 2 - 6);
    const centroPanel = letrero.x;

    this.add
      .text(centroPanel, letrero.y - 20, this.datos.rotulos.titulo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        fontStyle: "700",
        color: "#3E2712", // marrón oscuro — legible sobre la veta clara de la madera
        stroke: "#F3E4C8",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    this.add
      .text(centroPanel, letrero.y + 12, this.datos.rotulos.pista, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#3E2712",
        stroke: "#F3E4C8",
        strokeThickness: 2,
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    // Larry fotorrealista (D-196) — SUELTO sobre la escena, nunca dentro de
    // una tarjeta/panel (el dueño lo confirmó viendo D-195: "eso está
    // perfecto"). Reemplaza la imagen estática con tweens de antes: siete
    // comportamientos reales, al azar, con cuadros de verdad — ver
    // `LarryFotorrealista.ts`.
    new LarryFotorrealista(this, width - 90, height - 90).setDepth(3);
    this.activarParallax(fondo);

    this.dibujarRejilla(width, height);

    // La flecha de regreso vive arriba a la izquierda (D-194, segunda ronda).
    new FlechaAtras(this, 44, 44).setDepth(10).setScrollFactor(0);
    // El ícono de sonido (D-190) se movió abajo a la izquierda — el dueño
    // pidió que dejara de compartir esquina con la flecha nueva, y sin
    // círculo blanco detrás (ver `BotonSonido.ts`).
    new BotonSonido(this, 44, height - 44).setDepth(10).setScrollFactor(0);

    // Reinicio de la escena, con RESIZE debounced (D-196.1). El Scale
    // Manager puede emitir varios eventos RESIZE seguidos mientras el
    // viewport se asienta (la barra de direcciones de un navegador móvil
    // colapsando, por ejemplo) — reiniciar la escena en CADA uno corta
    // cualquier tween/timer en curso a medio camino. El dueño lo vio en
    // vivo: Larry "camina pero no se mueve" — el tween de salida de "leer"
    // se reiniciaba una y otra vez antes de completar el recorrido, así que
    // nunca llegaba a salir de cuadro. Se espera a que los eventos dejen de
    // llegar 300ms antes de reiniciar de verdad.
    this.scale.on(Phaser.Scale.Events.RESIZE, () => {
      this.eventoRedimension?.remove();
      this.eventoRedimension = this.time.delayedCall(300, () => this.scene.restart(this.datos));
    });
  }

  private eventoRedimension: Phaser.Time.TimerEvent | null = null;

  /**
   * Parallax 2.5D (D-196) — capas planas que se desplazan distinto según la
   * inclinación del aparato, el mismo truco de las fotos de perfil
   * "espacial" de iOS. NO es volumen 3D real: el dueño confirmó explícito
   * que esto alcanza y que no hace falta un motor 3D nuevo.
   *
   * `gyroscope`/`accelerometer` se abrieron en `cabeceras-seguridad.ts`
   * para esto — nunca cámara ni micrófono (línea roja #1 intacta). En
   * iOS 13+ el navegador exige un gesto humano antes del permiso
   * (`DeviceOrientationEvent.requestPermission`) — se pide en el primer
   * toque de esta pantalla, nunca con un diálogo que bloquee el flujo, y si
   * se niega o el navegador no lo soporta, la pantalla se queda plana sin
   * romper nada.
   */
  private activarParallax(fondo: Phaser.GameObjects.Image): void {
    // Solo la capa de fondo se desplaza — Larry y las tarjetas se quedan
    // quietos. `LarryFotorrealista` ya mueve su propio `x`/`y` con tweens
    // (caminar fuera de cuadro y volver); sumarle un offset de parallax ahí
    // pelearía contra esos tweens por la misma propiedad. El fondo moviéndose
    // solo ya da la sensación de profundidad — el mismo principio que una
    // foto "espacial" de iOS, sin tocar la propia foto del sujeto.
    const fondoBaseX = fondo.x;
    const fondoBaseY = fondo.y;

    const manejar = (evento: DeviceOrientationEvent): void => {
      // `gamma`: inclinación izquierda/derecha (-90..90). `beta`: adelante/
      // atrás (-180..180). Se acotan y se suavizan con lerp para que no
      // tiemble con el ruido normal del sensor.
      const gamma = Phaser.Math.Clamp(evento.gamma ?? 0, -35, 35);
      const beta = Phaser.Math.Clamp((evento.beta ?? 0) - 35, -35, 35); // ~35° es "de pie mirando de frente"

      const dx = (gamma / 35) * 10;
      const dy = (beta / 35) * 6;
      fondo.x = Phaser.Math.Linear(fondo.x, fondoBaseX + dx, 0.08);
      fondo.y = Phaser.Math.Linear(fondo.y, fondoBaseY + dy, 0.08);
    };

    type ConPermiso = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const ClaseEvento = typeof DeviceOrientationEvent === "undefined" ? null : (DeviceOrientationEvent as ConPermiso);

    if (!ClaseEvento) return; // navegador sin soporte — pantalla plana, sin romper nada.

    if (typeof ClaseEvento.requestPermission === "function") {
      // iOS 13+: el permiso exige un gesto humano. Se pide en el primer
      // toque de ESTA pantalla — nunca antes, nunca un diálogo propio.
      const pedirEnPrimerToque = () => {
        ClaseEvento.requestPermission?.()
          .then((estado) => {
            if (estado === "granted") window.addEventListener("deviceorientation", manejar);
          })
          .catch(() => {
            /* denegado o no disponible — se queda plano, a propósito, sin romper nada */
          });
      };
      this.input.once(Phaser.Input.Events.POINTER_DOWN, pedirEnPrimerToque);
    } else {
      // Android/desktop: no hace falta permiso explícito.
      window.addEventListener("deviceorientation", manejar);
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener("deviceorientation", manejar);
    });
  }

  /**
   * Columnas por ancho — el mismo umbral que ya usa el resto de Modo
   * Historia para distinguir teléfono de tableta/escritorio (D-041).
   */
  private columnasPara(width: number): number {
    if (width >= 960) return 4;
    if (width >= 620) return 3;
    return 2;
  }

  /**
   * El ancho del alias/dato dentro del panel — MENOR que el panel mismo
   * (`RADIO*2+28`), a propósito. Con 12px de margen por lado, ninguna línea
   * envuelta puede tocar la esquina redondeada.
   */
  private static readonly ANCHO_TEXTO = RADIO * 2 + 28 - 24;

  /**
   * El alias (`FrailecilloRadiante1427`, `generarAlias()` en
   * `packages/motor/src/alias.ts`) NUNCA tiene un espacio — es un
   * adjetivo+sustantivo+sufijo pegados, a propósito, para que no se lea
   * como dos palabras sueltas. `wordWrap` de Phaser (como el de CSS) solo
   * envuelve en un espacio: contra un alias real, o contra la traducción
   * larga de "Ir al área de los grandes" ya vista en un dispositivo real,
   * NO hacía nada — la línea entera se salía del panel sin envolver ni un
   * carácter. Visto en un dispositivo real y reproducido en local con un
   * alias largo antes de este método: sin él, el texto ignora por completo
   * el ancho de la caja.
   *
   * Primero se encoge la fuente hasta el mínimo legible; si ni así cabe
   * (un alias realmente largo, o una traducción sin ningún espacio), se
   * trunca con «…» — el patrón estándar para una etiqueta de una sola
   * línea que no puede crecer más (mismo criterio que Carbon/PatternFly:
   * envolver primero, truncar solo si ya no cabe).
   */
  private ajustarAlAncho(texto: Phaser.GameObjects.Text, anchoMax: number, tamMinimo: number): void {
    let tam = parseInt(String(texto.style.fontSize), 10) || tamMinimo;
    while (texto.width > anchoMax && tam > tamMinimo) {
      tam -= 1;
      texto.setFontSize(tam);
    }
    if (texto.width <= anchoMax) return;
    let cadena = texto.text;
    while (cadena.length > 1) {
      cadena = cadena.slice(0, -1);
      texto.setText(`${cadena}…`);
      if (texto.width <= anchoMax) break;
    }
  }

  /**
   * Cuánto ocupa el alias (+ el dato, si lo hay) de ESTA tarjeta, ya
   * envuelto/encogido/truncado al ancho real. Crea los `Text` solo para
   * medir y los destruye de inmediato — nunca llegan a un frame renderizado.
   */
  private medirAltoContenido(tarjeta: TarjetaPerfil): number {
    const alias = this.add.text(0, 0, tarjeta.alias, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "15px",
      fontStyle: "600",
      align: "center",
      wordWrap: { width: QuienJuegaScene.ANCHO_TEXTO, useAdvancedWrap: true },
    });
    this.ajustarAlAncho(alias, QuienJuegaScene.ANCHO_TEXTO, 11);
    let alto = alias.height;
    alias.destroy();

    const textoDato = this.textoDeDato(tarjeta.dato);
    if (textoDato) {
      const linea = this.add.text(0, 0, textoDato, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        align: "center",
        wordWrap: { width: QuienJuegaScene.ANCHO_TEXTO, useAdvancedWrap: true },
      });
      this.ajustarAlAncho(linea, QuienJuegaScene.ANCHO_TEXTO, 10);
      alto += 6 + linea.height;
      linea.destroy();
    }
    return alto;
  }

  private dibujarRejilla(width: number, height: number): void {
    const columnas = this.columnasPara(width);
    const paso = Math.min((width - 80) / columnas, 220);
    const inicioY = QuienJuegaScene.ALTO_CABECERA + RADIO;
    const total = this.datos.tarjetas.length;
    const filas = Math.ceil(total / columnas);
    const anchoUsado = paso * columnas;
    const inicioX = (width - anchoUsado) / 2 + paso / 2;

    // El panel mide igual en TODAS las tarjetas — una rejilla de cajas
    // dispares se ve rota — así que primero se mide la más alta de todas
    // (el alias/habilidad más largo, en el idioma más largo) y esa medida
    // gobierna el panel de cada tarjeta y el paso entre filas.
    const altoContenidoMax = Math.max(0, ...this.datos.tarjetas.map((t) => this.medirAltoContenido(t)));
    // panelTop = -RADIO-14; el alias empieza en RADIO+16; el panel debe llegar
    // 14px más abajo del contenido más alto: (RADIO+16+altoContenidoMax+14) - (-RADIO-14) = 2·RADIO+44+altoContenidoMax.
    const altoPanel = RADIO * 2 + 44 + altoContenidoMax;
    const altoFila = altoPanel + 26; // separación visible entre filas

    this.datos.tarjetas.forEach((tarjeta, i) => {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const x = inicioX + col * paso;
      const y = inicioY + fila * altoFila;
      this.dibujarTarjeta(tarjeta, x, y, i, altoPanel);
    });

    // Alto mínimo del mundo — si hay más filas de las que caben, la cámara
    // no recorta la última: mismo criterio de "nada se corta" que el resto
    // del producto.
    const altoNecesario = inicioY + filas * altoFila + 60;
    if (altoNecesario > height) {
      this.cameras.main.setBounds(0, 0, width, altoNecesario);
      this.input.on("wheel", (_p: unknown, _go: unknown, _dx: number, dy: number) => {
        this.cameras.main.scrollY = Phaser.Math.Clamp(
          this.cameras.main.scrollY + dy,
          0,
          altoNecesario - height,
        );
      });
    }
  }

  private dibujarTarjeta(tarjeta: TarjetaPerfil, x: number, y: number, indice: number, altoPanel: number): void {
    const contenedor = this.add.container(x, y);
    const paleta = PALETA[tarjeta.color % PALETA.length];

    // Un panel claro detrás de toda la tarjeta — el fondo ilustrado es
    // demasiado ocupado para que el alias/dato se lean encima sin uno,
    // mismo motivo que el panel del título. La ALTURA la decide
    // `dibujarRejilla` (mide el contenido más largo de la rejilla entera),
    // no un número fijo — así ninguna traducción larga vuelve a salirse.
    //
    // Tono cálido de pergamino, no blanco de formulario, con un borde
    // marrón — el dueño pidió menos "cajas blancas sin chiste" y seis
    // intentos de generar una placa de madera de verdad (Recraft) devolvieron
    // un retrato tallado en vez de una textura vacía (ver el comentario en
    // `gen-mapa-historia.mjs`). Esto es el respaldo en Phaser puro mientras
    // ese arte no exista.
    const panel = this.add.graphics();
    panel.fillStyle(0xf3e4c8, 0.88); // crema-pergamino
    panel.fillRoundedRect(-RADIO - 14, -RADIO - 14, RADIO * 2 + 28, altoPanel, 18);
    panel.lineStyle(3, 0x8a5a2b, 0.8); // marrón madera
    panel.strokeRoundedRect(-RADIO - 14, -RADIO - 14, RADIO * 2 + 28, altoPanel, 18);
    contenedor.add(panel);

    // Respira, no está congelada — desincronizada por índice (mismo
    // principio que `SwayingPlant`: todas meciéndose igual se lee como un
    // bug, no como algo vivo).
    this.tweens.add({
      targets: contenedor,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1400 + (indice % 3) * 220,
      delay: (indice % 4) * 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    if (tarjeta.esAdulto) {
      // El adulto es visualmente distinto a propósito — nunca "otro niño más
      // en la fila" (docs/decisions.md, la pregunta que fijó esto).
      const anillo = this.add.circle(0, 0, RADIO + 8, 0x000000, 0);
      anillo.setStrokeStyle(4, 0x434547);
      contenedor.add(anillo);
    }

    // La bandera del idioma en el que este perfil hace sus retos — una
    // insignia CHICA sobre el borde del avatar (22px, no un panel), lo
    // bastante pequeña para no contar como una de las "cajas blancas sin
    // chiste" que el dueño pidió quitar — esas eran paneles de toda la
    // tarjeta, no una insignia del tamaño de una moneda. El círculo de
    // respaldo también ayuda a que la bandera se lea si la fuente de
    // emoji del dispositivo no compone bien el par de indicadores
    // regionales (visto en este navegador de prueba: sin el círculo, el
    // glifo salía parcial). Pictográfica a propósito — sirve igual en KINDER.
    const bandera = BANDERA_POR_LOCALE[tarjeta.locale];
    if (bandera) {
      const xIns = RADIO * 0.7;
      const yIns = RADIO * 0.7;
      const insignia = this.add.circle(xIns, yIns, 13, 0xf3e4c8, 1);
      insignia.setStrokeStyle(2, 0x8a5a2b, 0.8);
      contenedor.add(insignia);
      const textoBandera = this.add
        .text(xIns, yIns, bandera, {
          fontSize: "16px",
        })
        .setOrigin(0.5, 0.5);
      contenedor.add(textoBandera);
    }

    if (tarjeta.animal && this.textures.exists(claveDeAnimal(tarjeta.animal))) {
      // D-194: el animal elegido reemplaza la cara procedural. El recorte es
      // un `Phaser.Geom.Circle` usado SOLO como máscara de dibujo (createGeometryMask)
      // — no como `hitArea` de un objeto interactivo, que es el hallazgo de
      // esta sesión documentado en el encabezado y en `LevelNode.ts`/`BotonSonido.ts`:
      // un hitArea de forma explícita no registra el toque en esta build de
      // Phaser, pero SÍ funciona como máscara de recorte visual, que es un uso
      // completamente distinto del sistema de input.
      const avatar = this.add.image(0, 0, claveDeAnimal(tarjeta.animal));
      avatar.setDisplaySize(RADIO * 2, RADIO * 2);
      const formaRecorte = this.add.circle(x, y, RADIO).setVisible(false);
      avatar.setMask(formaRecorte.createGeometryMask());
      contenedor.add(avatar);

      const borde = this.add.circle(0, 0, RADIO, 0x000000, 0);
      borde.setStrokeStyle(4, paleta.tinta, 0.9);
      contenedor.add(borde);
    } else {
      const circulo = this.add.circle(0, 0, RADIO, paleta.relleno);
      circulo.setStrokeStyle(4, paleta.tinta, 0.9);
      contenedor.add(circulo);

      this.dibujarAccesorio(contenedor, tarjeta.forma, paleta.tinta);

      const ojoIzq = this.add.circle(-RADIO * 0.32, -RADIO * 0.05, RADIO * 0.09, paleta.tinta);
      const ojoDer = this.add.circle(RADIO * 0.32, -RADIO * 0.05, RADIO * 0.09, paleta.tinta);
      contenedor.add(ojoIzq);
      contenedor.add(ojoDer);

      const boca = this.add.graphics();
      boca.lineStyle(3, paleta.tinta, 0.9);
      boca.beginPath();
      boca.arc(0, RADIO * 0.1, RADIO * 0.3, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160));
      boca.strokePath();
      contenedor.add(boca);
    }

    const alias = this.add
      .text(0, RADIO + 16, tarjeta.alias, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "600",
        color: "#434547",
        align: "center",
        wordWrap: { width: QuienJuegaScene.ANCHO_TEXTO, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);
    this.ajustarAlAncho(alias, QuienJuegaScene.ANCHO_TEXTO, 11);
    contenedor.add(alias);

    const textoDato = this.textoDeDato(tarjeta.dato);
    if (textoDato) {
      const linea = this.add
        .text(0, RADIO + 16 + alias.height + 6, textoDato, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: tarjeta.esAdulto ? "#0B6AB0" : "#F36B1C",
          align: "center",
          wordWrap: { width: QuienJuegaScene.ANCHO_TEXTO, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
      this.ajustarAlAncho(linea, QuienJuegaScene.ANCHO_TEXTO, 10);
      contenedor.add(linea);
    }

    // La zona de toque: un `Zone` hijo, hitArea AUTOGENERADO (ver encabezado).
    const zona = this.add.zone(0, 0, RADIO * 2, RADIO * 2);
    contenedor.add(zona);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => this.onTocado(tarjeta, contenedor));
  }

  private textoDeDato(dato: DatoDeTarjeta): string | null {
    if (dato.tipo === "habilidad") return dato.rotulo;
    if (dato.tipo === "rango") return `${this.datos.rotulos.rango} ${dato.rango} · ${dato.xp} XP`;
    return null;
  }

  /**
   * Las seis siluetas de `kids/index.astro`, redibujadas con `Graphics` —
   * misma idea (orejas/antena/hoja encima de la cabeza), nunca el mismo
   * trazado SVG exacto: el medio cambió, la SEÑAL (silueta distinta por
   * forma) no.
   */
  private dibujarAccesorio(contenedor: Phaser.GameObjects.Container, forma: number, tinta: number): void {
    const g = this.add.graphics();
    g.fillStyle(tinta, 1);
    const r = RADIO;
    switch (forma % 6) {
      case 1: // orejas triangulares
        g.fillTriangle(-r * 0.7, -r * 0.5, -r * 0.25, -r * 1.05, -r * 0.05, -r * 0.55);
        g.fillTriangle(r * 0.7, -r * 0.5, r * 0.25, -r * 1.05, r * 0.05, -r * 0.55);
        break;
      case 2: // orejas redondas
        g.fillEllipse(-r * 0.55, -r * 0.75, r * 0.4, r * 0.75);
        g.fillEllipse(r * 0.55, -r * 0.75, r * 0.4, r * 0.75);
        break;
      case 3: // orejas circulares
        g.fillCircle(-r * 0.65, -r * 0.68, r * 0.28);
        g.fillCircle(r * 0.65, -r * 0.68, r * 0.28);
        break;
      case 4: // antena
        g.fillRoundedRect(-r * 0.07, -r * 1.15, r * 0.14, r * 0.5, r * 0.07);
        g.fillCircle(0, -r * 1.2, r * 0.17);
        break;
      case 5: // hoja/pétalo
        g.beginPath();
        g.moveTo(0, -r * 0.5);
        g.lineTo(-r * 0.35, -r * 1.15);
        g.lineTo(0, -r * 1.4);
        g.lineTo(r * 0.35, -r * 1.15);
        g.closePath();
        g.fillPath();
        break;
      default: // 0 — sin accesorio, la cara sola ya es una silueta distinta a las otras cinco
        break;
    }
    contenedor.add(g);
  }

  private onTocado(tarjeta: TarjetaPerfil, contenedor: Phaser.GameObjects.Container): void {
    // Para la respiración antes del squash — dos tweens escribiendo la misma
    // escala a la vez se ve como un tirón, no como dos animaciones.
    this.tweens.killTweensOf(contenedor);
    contenedor.setScale(1);
    this.tweens.add({
      targets: contenedor,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 80,
      yoyo: true,
      ease: "Sine.easeInOut",
      onComplete: () => {
        window.location.href = tarjeta.href;
      },
    });
  }
}
