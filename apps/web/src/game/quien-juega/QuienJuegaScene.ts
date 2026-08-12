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
import { BotonMusica } from "../objects/BotonMusica";
import { MusicManager } from "../managers/MusicManager";
import { SfxManager } from "../managers/SfxManager";
import { FlechaAtras } from "../objects/FlechaAtras";
import { LarryFotorrealista } from "../objects/LarryFotorrealista";
import { claveDeAnimal, type AnimalId } from "../../lib/avatares-animal";
import { BotonEngrane, VARIANTES_ENGRANE, RADIO_ENGRANE } from "../objects/BotonEngrane";
import { IMAGENES_QUIEN_JUEGA, AUDIOS_QUIEN_JUEGA } from "../assets-manifest";
import { empujarHistorial } from "../spa/enrutador";
import type { ArranquePin } from "./PinScene";
import { fijarFase } from "../spa/estado";
import { rutaCasa } from "../../lib/rutas-app";

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
  /**
   * D-198, ronda 3 (ajustes de perfil): la banda actual del NIÑO —
   * `child_profiles.theme_band`, uno de "KINDER"|"PRIMARIA"|"SECUNDARIA".
   * `undefined` en la tarjeta del adulto (no aplica). Se manda ya resuelta
   * por el servidor, igual que el resto de la tarjeta — esta escena nunca
   * deriva una banda a partir de la edad.
   */
  themeBand?: string;
}

/**
 * Bandera por locale — pictográfica a propósito: KINDER no lee (D-019), y una
 * bandera identifica el PAÍS/dialecto tan bien como el texto ("es-MX" vs.
 * "es-ES" son dialectos distintos, no solo "español" — la misma distinción
 * que ya hace `packages/motor/src/alias.ts` con sus siete listas separadas).
 */
/**
 * D-199, ronda 5: qué imagen de letrero tallado corresponde a cada locale
 * de PÁGINA (`DatosQuienJuega.locale`) — `es-MX`/`es-ES` comparten UNA
 * imagen porque el texto es idéntico en los dos (ver el comentario de
 * `scripts/gen-letrero-quien-juega.mjs`).
 */
const LETRERO_POR_LOCALE: Readonly<Record<string, string>> = Object.freeze({
  en: "letrero-quien-juega-en",
  "es-MX": "letrero-quien-juega-es",
  "es-ES": "letrero-quien-juega-es",
  "fr-FR": "letrero-quien-juega-fr-FR",
  "pt-BR": "letrero-quien-juega-pt-BR",
  "pt-PT": "letrero-quien-juega-pt-PT",
  "de-DE": "letrero-quien-juega-de-DE",
});

export const BANDERA_POR_LOCALE: Readonly<Record<string, string>> = Object.freeze({
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
  /** D-200: los dos rótulos de `CargaGlobalScene` — "Cargando imágenes…"/"Cargando sonidos…" en el locale de la página. */
  carga: {
    imagenes: string;
    sonidos: string;
  };
  /**
   * D-198, ronda 3: los rótulos del panel de ajustes (engrane por tarjeta de
   * niño). Todos YA RESUELTOS por el servidor en el locale de la página —
   * mismo criterio que el resto de `RotulosQuienJuega`, nunca una clave de
   * i18n importada dentro de una escena de Phaser.
   */
  ajustes: {
    titulo: string;
    idioma: string;
    comoSeVe: string;
    kinder: string;
    primaria: string;
    secundaria: string;
    fueraDeMargen: string;
    alias: string;
    otroAlias: string;
    pin: string;
    peligro: string;
    borrar: string;
    /** Con `{alias}` a reemplazar — mismo patrón que `profileThemeLevels`. */
    confirmarBorrar: string;
    siBorrar: string;
    cancelar: string;
    errorGenerico: string;
    /** D-199, ronda 2: "un botón de salvar o guardar" — cierra el panel. */
    guardar: string;
  };
}

export interface DatosQuienJuega {
  tarjetas: TarjetaPerfil[];
  rotulos: RotulosQuienJuega;
  /**
   * D-198, ronda 3: el locale de ESTA PÁGINA (el segmento de la URL,
   * `Astro.params.locale`) — distinto del `locale` de cada tarjeta (en qué
   * idioma ese perfil hace sus retos). Hace falta para construir
   * `ruta(locale, "entrar")` si una llamada del panel de ajustes devuelve
   * `401 sin_sesion` a mitad de la visita.
   */
  locale: string;
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
  /**
   * D-200: la lista de archivos vive en `assets-manifest.ts`, no aquí — es
   * la misma fuente que usa `CargaGlobalScene` para precargar TODO (esta
   * pantalla + Modo Historia) desde el primer toque. Si `CargaGlobalScene`
   * ya corrió, Phaser ve las claves ya en caché y no vuelve a pedirlas
   * (`Loader` las salta) — este `preload()` sigue existiendo para que la
   * escena funcione sola si alguna vez se arranca sin pasar por la global.
   */
  preload(): void {
    for (const { clave, url } of IMAGENES_QUIEN_JUEGA) this.load.image(clave, url);
    for (const { clave, url } of AUDIOS_QUIEN_JUEGA) this.load.audio(clave, url);
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

    // Cover-fit, no estiramiento en dos ejes (mismo defecto que D-186
    // revisited en MapScene/MenuScene — esta escena se había quedado con el
    // `setDisplaySize` viejo pese a ser la puerta de entrada, vista en TODO
    // dispositivo).
    const fondo = this.add.image(width / 2, height / 2, "fondo-primaria-1").setDepth(0);
    const escalaFondo = Math.max(width / fondo.width, height / fondo.height);
    fondo.setScale(escalaFondo);

    // El letrero de madera del título (D-194, segunda ronda; TALLADO de
    // verdad desde D-199 ronda 5) — reemplaza el panel blanco: "demasiados
    // fondos blancos flotando" fue la crítica exacta del dueño viendo esta
    // pantalla. Primero el texto se pintaba con Phaser ENCIMA de una imagen
    // en blanco (mismo criterio que `MenuScene`); el dueño lo vio en vivo y
    // pidió el texto tallado de verdad en la madera, con efecto de viento —
    // "que no vuelen las letras, que se vean esculpidas". Una imagen por
    // locale (`scripts/gen-letrero-quien-juega.mjs`, revisada letra por
    // letra antes de commitear, D-080) en vez de texto de Phaser encima.
    // Si por lo que sea la imagen del locale no cargó, cae a `letrero-
    // madera` CON el texto pintado — nunca un letrero en blanco y mudo.
    //
    // El letrero NO se centra en el ancho completo: la flecha de regreso
    // vive en la esquina superior izquierda y en un teléfono angosto un
    // letrero centrado la tapaba — visto en un simulador real. `zonaIcono`
    // reserva ese espacio y el letrero se centra en lo que queda.
    const zonaIcono = 90;
    const anchoLetrero = Math.min(360, width - zonaIcono - 20);

    const claveLetrero = LETRERO_POR_LOCALE[this.datos.locale];
    const letreroTallado = claveLetrero && this.textures.exists(claveLetrero);
    const letrero = this.add.image(0, 0, letreroTallado ? claveLetrero : "letrero-madera").setDepth(1);
    const escalaLetrero = anchoLetrero / letrero.width;
    letrero.setScale(escalaLetrero);
    letrero.setPosition(zonaIcono + anchoLetrero / 2 + 10, letrero.displayHeight / 2 - 6);
    const centroPanel = letrero.x;

    if (!letreroTallado) {
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
    }

    this.registrarVientoEnLetrero(letrero);

    // Larry fotorrealista (D-196) — SUELTO sobre la escena, nunca dentro de
    // una tarjeta/panel (el dueño lo confirmó viendo D-195: "eso está
    // perfecto"). Reemplaza la imagen estática con tweens de antes: siete
    // comportamientos reales, al azar, con cuadros de verdad — ver
    // `LarryFotorrealista.ts`.
    new LarryFotorrealista(this, width - 90, height - 90).setDepth(3);
    this.activarParallax(fondo);

    this.dibujarRejilla(width, height);

    /**
     * La flecha de regreso vive arriba a la izquierda (D-194, segunda ronda),
     * y desde aquí **sale del SPA**, a la casa del adulto.
     *
     * Antes no pasaba nada al tocarla: se dejaba el destino por omisión de
     * `FlechaAtras`, que es `history.back()`. Eso funcionaba cuando cada
     * pantalla era un documento, pero `/app/kids/` es la PUERTA del SPA —
     * normalmente la primera entrada del historial de la pestaña— y ahí
     * «atrás» no tiene a dónde ir, así que el toque se comía sin efecto. Lo
     * encontró el dueño probando en el dispositivo.
     *
     * Un destino explícito y no el historial: esta es la única escena de la
     * que salir significa *abandonar la sesión de Phaser*, y a dónde se va no
     * es una pregunta que el historial pueda contestar mejor que nosotros.
     * `rutaCasa` es la casa del adulto (#311) — no `/app/perfil/`, que se ha
     * corregido más de diez veces.
     */
    new FlechaAtras(this, 44, 44, () => {
      window.location.href = rutaCasa(this.datos.locale);
    })
      .setDepth(10)
      .setScrollFactor(0);
    // El ícono de sonido (D-190) se movió abajo a la izquierda — el dueño
    // pidió que dejara de compartir esquina con la flecha nueva, y sin
    // círculo blanco detrás (ver `BotonSonido.ts`).
    new BotonSonido(this, 44, height - 44).setDepth(10).setScrollFactor(0);
    // D-198, ronda 2: control de música, mismo criterio de ubicación que el
    // resto de las pantallas — 64px a la derecha del de voz.
    new BotonMusica(this, 108, height - 44).setDepth(10).setScrollFactor(0);
    // "calma" — es una pantalla de elegir, no de resolver.
    (this.registry.get("musicManager") as MusicManager).reproducir("calma");

    // Reinicio de la escena, con RESIZE debounced (D-196.1). El Scale
    // Manager puede emitir varios eventos RESIZE seguidos mientras el
    // viewport se asienta (la barra de direcciones de un navegador móvil
    // colapsando, por ejemplo) — reiniciar la escena en CADA uno corta
    // cualquier tween/timer en curso a medio camino. El dueño lo vio en
    // vivo: Larry "camina pero no se mueve" — el tween de salida de "leer"
    // se reiniciaba una y otra vez antes de completar el recorrido, así que
    // nunca llegaba a salir de cuadro. Se espera a que los eventos dejen de
    // llegar 300ms antes de reiniciar de verdad.
    //
    // **`this.scale` es el ScaleManager GLOBAL, no de esta escena** — sobrevive
    // a `scene.restart()`. La primera versión de este código nunca quitaba el
    // listener, así que cada reinicio agregaba uno más: al segundo giro de
    // pantalla ya había dos (o más) reinicios disparándose en cascada, cada
    // uno leyendo `this.scale.width/height` en un instante distinto de la
    // transición — la escena quedaba armada con el tamaño de un giro que ya
    // no era el actual (encontrado en vivo: "si roto el teléfono o lo
    // regreso, se queda así", una tarjeta enorme y descuadrada). `.off()` en
    // el SHUTDOWN, mismo patrón que el listener de `deviceorientation` de
    // `activarParallax()` un poco más abajo, asegura que solo exista un
    // listener vivo a la vez, sin importar cuántas veces se haya reiniciado.
    const alRedimensionar = () => {
      this.eventoRedimension?.remove();
      this.eventoRedimension = this.time.delayedCall(300, () => this.scene.restart(this.datos));
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, alRedimensionar);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, alRedimensionar);
      this.eventoRedimension?.remove();
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
  /**
   * "Que tenga efecto de aire que se mueva un poco porque sopla el aire"
   * (D-199, ronda 5) — mismo patrón que `MenuScene.registrarVientoEnLetrero`,
   * adaptado: ESTE letrero no se centra en `width/2` (vive corrido a la
   * derecha de `zonaIcono`, ver `create()`), así que el pivote de arriba se
   * calcula a partir de la propia posición del letrero, nunca del centro de
   * pantalla. Cuelga de dos cuerdas → se mece como un péndulo desde ARRIBA,
   * no desde su centro; cambiar el origen a (0.5, 0) mueve el punto de giro
   * sin mover la imagen (se reposiciona `y` en el mismo paso). Amplitud
   * chica (±1.8°) y lenta (3.2s) — es madera pesada, no una hoja — y respeta
   * `prefers-reduced-motion` igual que `SwayingPlant.ts`.
   */
  private registrarVientoEnLetrero(letrero: Phaser.GameObjects.Image): void {
    const reducido =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducido) return;

    const centroY = letrero.y;
    letrero.setOrigin(0.5, 0);
    letrero.y = centroY - letrero.displayHeight / 2;

    this.tweens.add({
      targets: letrero,
      angle: { from: -1.8, to: 1.8 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

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
    //
    // D-199.3: el dueño preguntó qué pasa con 8 hijos más el adulto (9
    // tarjetas) — y la respuesta real, encontrada leyendo el código y no
    // adivinada, era un bug: este bloque SÍ calculaba el mundo más alto que
    // la pantalla, pero el único scroll que conectaba era la RUEDA del
    // mouse (`"wheel"`). Un iPhone no tiene rueda — con más de ~4 hijos las
    // tarjetas de abajo habrían quedado completamente inalcanzables por
    // toque. Se agrega arrastre vertical, mismo patrón que
    // `MapScene::configurarArrastre` (pointerdown/pointermove/pointerup
    // globales, sin estorbar el toque de una tarjeta: un toque corto sin
    // arrastre real sigue disparando `onTocado` normal).
    const altoNecesario = inicioY + filas * altoFila + 60;
    if (altoNecesario > height) {
      this.cameras.main.setBounds(0, 0, width, altoNecesario);
      const limiteScroll = altoNecesario - height;

      this.input.on("wheel", (_p: unknown, _go: unknown, _dx: number, dy: number) => {
        this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY + dy, 0, limiteScroll);
      });

      let arrastrando = false;
      let ultimoY = 0;
      this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
        arrastrando = true;
        ultimoY = p.y;
      });
      this.input.on(Phaser.Input.Events.POINTER_UP, () => {
        arrastrando = false;
      });
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
        if (!arrastrando || !p.isDown) return;
        this.cameras.main.scrollY = Phaser.Math.Clamp(
          this.cameras.main.scrollY - (p.y - ultimoY),
          0,
          limiteScroll,
        );
        ultimoY = p.y;
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

    // D-198, ronda 3 (corregido dos veces en D-199.3): el engrane de
    // ajustes — SOLO en tarjetas de niño (el nombre/usuario del adulto es
    // trabajo de 55.11). El dueño lo vio en vivo asomándose fuera de la
    // esquina redondeada del panel. El primer arreglo (centrar el engrane
    // exacto en el arco de la esquina, mismo radio que el arco) lo dejaba
    // TANGENTE al borde — sin superponerse, pero también sin aire, tocando
    // el límite exacto. Este deja un margen real de 4px hacia adentro,
    // además de un engrane más chico (18→15, ver `BotonEngrane.ts`).
    if (!tarjeta.esAdulto) {
      const MARGEN_ESQUINA = 4;
      const xEngrane = RADIO + 14 - RADIO_ENGRANE - MARGEN_ESQUINA;
      // Variante 1-5 por índice de tarjeta — mismo criterio que
      // `formasUsadas`/`coloresUsados` en `kids/index.astro`: determinista,
      // no aleatorio en cada render, para que dos hermanos no se vean con el
      // MISMO engrane por casualidad en la mayoría de los casos.
      const variante = (indice % VARIANTES_ENGRANE) + 1;
      const engrane = new BotonEngrane(this, xEngrane, -xEngrane, variante, () => this.abrirAjustes(tarjeta, x, y));
      contenedor.add(engrane);
    }
  }

  /**
   * `origenX/origenY` son la posición REAL de la tarjeta tocada (mismo
   * patrón que `ChallengeScene::origen` con los nodos del mapa) — D-199,
   * ronda 2: el dueño pidió que el panel "se vuelta la tarjeta y crezca
   * animadamente", no que aparezca centrado de la nada. El sonido de abrir
   * lo dispara `PerfilAjustesScene` cuando de verdad empieza su animación,
   * no aquí — un solo sonido por apertura, no dos pisándose.
   */
  private abrirAjustes(tarjeta: TarjetaPerfil, origenX: number, origenY: number): void {
    this.scene.pause();
    this.scene.launch("PerfilAjustesScene", {
      tarjeta,
      rotulos: this.datos.rotulos.ajustes,
      locale: this.datos.locale,
      origenX,
      origenY,
    });
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
    (this.registry.get("sfxManager") as SfxManager).reproducir("toque");
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
        // D-200.1, fase 1: la tarjeta del adulto sigue siendo una
        // navegación real (fuera de alcance, /practicar/ es DOM puro a
        // propósito). La de un hijo intenta mostrarse sin recargar; si
        // `enrutador.irA` falla por lo que sea (sin red, HTML inesperado),
        // cae a la navegación real de siempre — nunca un estado roto.
        if (tarjeta.esAdulto) {
          window.location.href = tarjeta.href;
          return;
        }
        // El PIN es una ESCENA (D-201), no un transplante de HTML.
        //
        // Antes esto llamaba a `mostrarPin()`, que pedía `kids/pin.astro` con
        // `fetch`, extraía su `<main>` y lo metía en un `<div>` sobre el
        // canvas. Ese atajo —declarado a propósito en D-200.1— costó una
        // sesión entera de defectos en cadena: overlay transparente que
        // dejaba ver estas caras a través del PIN, el CSS que nunca llegaba
        // porque Astro lo emite como `<link>`, y franjas blancas de 41 pt que
        // no se reprodujeron en Chrome y quedaron sin causa raíz.
        //
        // `sleep` y no `pause`: una escena pausada deja de actualizarse pero
        // SIGUE renderizando, así que estas caras se verían por debajo.
        this.scene.sleep();
        this.scene.launch("PinScene", {
          childId: tarjeta.id,
        } satisfies ArranquePin);
        fijarFase("pin");
        empujarHistorial(tarjeta.href);
      },
    });
  }
}
