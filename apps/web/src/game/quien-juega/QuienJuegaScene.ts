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
  esAdulto: boolean;
  dato: DatoDeTarjeta;
  href: string;
}

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
    this.load.image("larry_menu_aplaude", "/mapa/larry_menu_aplaude.webp");
  }

  /**
   * Alto fijo de la cabecera (título + pista), en px — no una fracción de
   * `height`. Con `height*0.1` la cabecera se movía con el alto real del
   * viewport (D-041: un iPhone no mide lo mismo que un iPad) y en un
   * teléfono terminaba tan cerca de la rejilla que la pista se montaba
   * sobre la primera fila de caras — visto en un simulador real, no en el
   * código.
   */
  private static readonly ALTO_CABECERA = 148;

  create(): void {
    const { width, height } = this.scale;
    // verde-follaje (D-186): el color de espera antes de que la imagen real
    // termine de decodificar — nunca un blanco de formulario.
    this.cameras.main.setBackgroundColor(0x5b8c3a);

    this.add
      .image(width / 2, height / 2, "fondo-primaria-1")
      .setDisplaySize(width, height)
      .setDepth(0);

    // Un panel claro detrás del título — el fondo ilustrado es demasiado
    // ocupado para leer texto encima sin uno, mismo motivo por el que
    // `MenuScene` monta su letrero de madera detrás de los botones.
    const panel = this.add.graphics().setDepth(1);
    panel.fillStyle(0xffffff, 0.88);
    panel.fillRoundedRect(width / 2 - 180, 18, 360, 96, 20);

    this.add
      .text(width / 2, 56, this.datos.rotulos.titulo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "28px",
        fontStyle: "700",
        color: "#434547", // gris-900
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    this.add
      .text(width / 2, 94, this.datos.rotulos.pista, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    // Larry, en la esquina, con el mismo rebote de idle que ya usa
    // `MenuScene` — nunca "congelado" en una pantalla que se supone viva.
    const larry = this.add
      .image(width - 60, height - 60, "larry_menu_aplaude")
      .setDisplaySize(110, 110)
      .setDepth(3);
    this.tweens.add({
      targets: larry,
      y: larry.y - 10,
      yoyo: true,
      repeat: -1,
      duration: 1000,
      ease: "Sine.easeInOut",
    });

    this.dibujarRejilla(width, height);

    // El ícono de sonido (D-190): mismo control, mismo lugar, en las tres
    // pantallas de Modo Historia — el niño no debería tener que reencontrarlo.
    new BotonSonido(this, 44, 44).setDepth(10).setScrollFactor(0);

    this.scale.on(Phaser.Scale.Events.RESIZE, ({ width: w, height: h }: { width: number; height: number }) => {
      this.scene.restart(this.datos);
      void w;
      void h;
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

  /** El panel de cada tarjeta mide `RADIO*2+92` de alto — la fila necesita al menos eso para no encimarse. */
  private static readonly ALTO_FILA = RADIO * 2 + 108;

  private dibujarRejilla(width: number, height: number): void {
    const columnas = this.columnasPara(width);
    const paso = Math.min((width - 80) / columnas, 220);
    const inicioY = QuienJuegaScene.ALTO_CABECERA + RADIO;
    const total = this.datos.tarjetas.length;
    const filas = Math.ceil(total / columnas);
    const anchoUsado = paso * columnas;
    const inicioX = (width - anchoUsado) / 2 + paso / 2;

    this.datos.tarjetas.forEach((tarjeta, i) => {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const x = inicioX + col * paso;
      const y = inicioY + fila * QuienJuegaScene.ALTO_FILA;
      this.dibujarTarjeta(tarjeta, x, y, i);
    });

    // Alto mínimo del mundo — si hay más filas de las que caben, la cámara
    // no recorta la última: mismo criterio de "nada se corta" que el resto
    // del producto.
    const altoNecesario = inicioY + filas * QuienJuegaScene.ALTO_FILA + 60;
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

  private dibujarTarjeta(tarjeta: TarjetaPerfil, x: number, y: number, indice: number): void {
    const contenedor = this.add.container(x, y);
    const paleta = PALETA[tarjeta.color % PALETA.length];

    // Un panel claro detrás de toda la tarjeta — el fondo ilustrado es
    // demasiado ocupado para que el alias/dato se lean encima sin uno,
    // mismo motivo que el panel del título.
    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 0.82);
    panel.fillRoundedRect(-RADIO - 14, -RADIO - 14, RADIO * 2 + 28, RADIO * 2 + 92, 18);
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

    const alias = this.add
      .text(0, RADIO + 16, tarjeta.alias, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "600",
        color: "#434547",
        align: "center",
      })
      .setOrigin(0.5, 0);
    contenedor.add(alias);

    const textoDato = this.textoDeDato(tarjeta.dato);
    if (textoDato) {
      const linea = this.add
        .text(0, RADIO + 38, textoDato, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          color: tarjeta.esAdulto ? "#0B6AB0" : "#F36B1C",
          align: "center",
          wordWrap: { width: 150 },
        })
        .setOrigin(0.5, 0);
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
