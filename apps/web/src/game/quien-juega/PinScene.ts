/**
 * PinScene — el PIN del niño, como ESCENA de Phaser (D-201).
 *
 * ─── Qué reemplaza, y por qué no se reusó ──────────────────────────────────
 *
 * `kids/pin.astro` (1346 líneas de HTML servido) más `game/spa/puente-pin.ts`,
 * que extraía su `<main>` y lo transplantaba a un `<div>` sobre el canvas.
 * D-200.1 eligió ese atajo a propósito —"no se reescribe como Phaser: se REUSA
 * tal cual"— y costó una sesión entera de defectos en cadena: overlay
 * transparente que dejaba ver el canvas de debajo, el CSS que nunca llegaba
 * porque Astro emite ese `<style>` como `<link>`, y franjas blancas de 41 pt
 * sin causa raíz. Un `<canvas>` llena el viewport por definición.
 *
 * ─── Una escena, cuatro modos ──────────────────────────────────────────────
 *
 *   entrar     el niño verifica el PIN que ya tiene
 *   elegir     lo fija por PRIMERA vez (la pantalla que nunca existió)
 *   confirmar  lo repite, para que tres toques accidentales no lo fijen
 *   cambiar    el adulto lo recambia desde el engrane
 *
 * Cuatro modos y no cuatro escenas: la rejilla, los pasos y el botón de borrar
 * son idénticos en los cuatro, y lo único que cambia es el texto del letrero y
 * a qué endpoint va el toque final. Es el patrón que `PerfilAjustesScene` ya
 * usa con sus dos modos — `redibujar()` vacía y repinta.
 *
 * ─── Dos ramas, un solo layout ─────────────────────────────────────────────
 *
 * KINDER toca 3 de 9 dibujos; PRIMARIA/SECUNDARIA teclean 4 de 10 dígitos
 * (D-197 §2). Las dos usan las MISMAS casillas de madera y el mismo piso de
 * 88 px — el usuario más pequeño fija el tamaño, y a un adolescente un blanco
 * grande no le cuesta nada (`mc-20`: 23.7 mm es lo que necesita un niño de
 * cuatro años para acertar el 90% de las veces).
 */
import Phaser from "phaser";
import { BotonSonido } from "../objects/BotonSonido";
import { FlechaAtras } from "../objects/FlechaAtras";
import { clavePinDibujo } from "../pin-dibujos";
import { entrarAHistoria } from "../entrar-historia";

/** Lo que `pin-datos` devuelve. Nada de esto se calcula en el cliente. */
export interface DatosDelPin {
  tipo: "imagenes" | "numerico";
  dibujos: string[];
  alias: string;
  avatarUrl: string | null;
  yaTienePin: boolean;
  destino: string;
  rotulos: {
    titulo: string;
    ayuda: string;
    reintenta: string;
    tituloElegir: string;
    ayudaElegir: string;
    tituloConfirmar: string;
    ayudaConfirmar: string;
    noCoincide: string;
    borrar: string;
    progreso: string;
    rejilla: string;
    dibujos: Record<string, string>;
  };
}

export type ModoPin = "entrar" | "elegir" | "confirmar" | "cambiar";

export interface ArranquePin {
  childId: string;
  /** Si no se dice, lo decide `yaTienePin`: con PIN se entra, sin PIN se elige. */
  modo?: ModoPin;
  /** Se llama con el destino cuando el niño entra de verdad. */
  alEntrar?: (destino: string) => void;
}

const TECLADO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

/** El piso de `mc-20`, en píxeles de mundo. No baja de aquí en ninguna rama. */
const CASILLA = 88;
const HUECO = 12;

export class PinScene extends Phaser.Scene {
  private arranque!: ArranquePin;
  private datos: DatosDelPin | null = null;
  private modo: ModoPin = "entrar";
  /** Lo que el niño lleva tocado: posiciones (0-8) o dígitos (0-9). */
  private tocados: number[] = [];
  /** En modo «confirmar», lo que eligió en la primera vuelta. */
  private primeraVuelta: number[] = [];
  private ocupado = false;

  private capa!: Phaser.GameObjects.Container;
  private mensaje: Phaser.GameObjects.Text | null = null;
  private temporizadorResize: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super("PinScene");
  }

  init(arranque: ArranquePin): void {
    this.arranque = arranque;
    this.datos = null;
    this.tocados = [];
    this.primeraVuelta = [];
    this.ocupado = false;
  }

  create(): void {
    this.capa = this.add.container(0, 0);
    this.pintarFondo();

    // El ScaleManager es GLOBAL y sobrevive a `scene.restart()`: sin el
    // `off` en SHUTDOWN se acumula un listener por cada reinicio, y a los
    // pocos giros de pantalla la escena se reinicia varias veces por evento
    // (mismo hallazgo que `QuienJuegaScene` documenta).
    const alRedimensionar = () => {
      this.temporizadorResize?.remove();
      this.temporizadorResize = this.time.delayedCall(300, () => this.scene.restart(this.arranque));
    };
    this.scale.on(Phaser.Scale.Events.RESIZE, alRedimensionar);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, alRedimensionar);
      this.temporizadorResize?.remove();
    });

    void this.cargarDatos();
  }

  /**
   * El fondo va SIEMPRE, antes de que lleguen los datos.
   *
   * Nunca una pantalla en blanco esperando al `fetch`: la vara del proyecto es
   * un videojuego desde el primer fotograma, y un blanco de medio segundo en
   * 4G lento es exactamente lo que se ve como "una web".
   */
  private pintarFondo(): void {
    const { width, height } = this.scale;
    if (this.textures.exists("pin-numerico-fondo")) {
      const fondo = this.add.image(width / 2, height / 2, "pin-numerico-fondo");
      const escala = Math.max(width / fondo.width, height / fondo.height);
      fondo.setScale(escala).setDepth(-10);
      this.capa.add(fondo);
    } else {
      // verde-follaje (D-186), nunca un blanco de formulario.
      this.cameras.main.setBackgroundColor("#2E6B3E");
    }
  }

  private async cargarDatos(): Promise<void> {
    try {
      const res = await fetch(`/api/pin-datos?p=${encodeURIComponent(this.arranque.childId)}`, {
        credentials: "same-origin",
      });
      if (!res.ok) return this.salir();
      const datos = (await res.json()) as DatosDelPin;
      this.datos = datos;
      // Sin modo explícito, lo decide el servidor: un perfil sin PIN va a
      // elegirlo, nunca a una rejilla que no puede acertar.
      this.modo = this.arranque.modo ?? (datos.yaTienePin ? "entrar" : "elegir");
      this.redibujar();
    } catch {
      // Sin red no hay rejilla posible y una inventada sería peor que un
      // error: el niño tocaría sus tres dibujos y no entraría nunca.
      this.salir();
    }
  }

  /** De vuelta a la rejilla de caras, sin ruido. */
  private salir(): void {
    this.scene.stop();
    this.scene.wake("QuienJuegaScene");
  }

  // ─── Pintado ─────────────────────────────────────────────────────────────

  private redibujar(): void {
    if (!this.datos) return;
    this.capa.removeAll(true);
    this.pintarFondo();

    const { width, height } = this.scale;
    const r = this.datos.rotulos;

    const titulo =
      this.modo === "elegir" ? r.tituloElegir : this.modo === "confirmar" ? r.tituloConfirmar : r.titulo;
    const ayuda =
      this.modo === "elegir" ? r.ayudaElegir : this.modo === "confirmar" ? r.ayudaConfirmar : r.ayuda;

    const yTrasLetrero = this.pintarLetrero(titulo);
    const yTrasRejilla = this.pintarRejilla(yTrasLetrero);
    const yTrasPasos = this.pintarPasos(yTrasRejilla + 26);
    const yTrasAyuda = this.pintarAyuda(ayuda, yTrasPasos + 14);
    this.pintarBorrar(Math.max(yTrasAyuda + 20, height - 52));

    // Chrome compartido, en las mismas posiciones que el resto de escenas.
    this.capa.add(new FlechaAtras(this, 44, 44, () => this.salir()).setDepth(10));
    this.capa.add(new BotonSonido(this, 44, height - 44).setDepth(10));
  }

  /**
   * El letrero de madera con el alias y el título.
   *
   * El texto se pinta ENCIMA con Phaser, nunca horneado en la imagen: son
   * siete locales y un alias distinto por niño (D-197.1 lo fija por escrito).
   * El tratamiento «tallado» —marrón oscuro con halo claro— es el mismo que ya
   * usa `QuienJuegaScene` sobre madera.
   */
  private pintarLetrero(titulo: string): number {
    const { width } = this.scale;
    const cx = width / 2;
    // 90 px reservados a la izquierda para que el letrero no se meta debajo
    // de la flecha de regreso.
    const ancho = Math.min(360, width - 90 - 20);

    let tablaCentroY = 104;
    let tablaAncho = ancho * 0.7;
    if (this.textures.exists("pin-numerico-letrero")) {
      const letrero = this.add.image(cx, 96, "pin-numerico-letrero");
      const alto = ancho * (letrero.height / letrero.width);
      letrero.setDisplaySize(ancho, alto);
      this.capa.add(letrero);
      // La imagen es 900×420 y la TABLA —lo único sobre lo que se puede
      // escribir— ocupa de ~46% a ~88% de su altura y de ~10% a ~90% de su
      // ancho. Medido a mano sobre la imagen, igual que en la versión HTML.
      //
      // La primera versión ponía el texto en coordenadas fijas (y=92 y y=116)
      // y en el simulador el alias salía flotando SOBRE LAS CUERDAS, encima de
      // la madera. Las posiciones se derivan del letrero real, no se adivinan.
      const arriba = 96 - alto / 2;
      tablaCentroY = arriba + alto * 0.67;
      tablaAncho = ancho * 0.8;
    }

    // El alias puede ser larguísimo y NUNCA tiene un espacio
    // (`FrailecilloRadiante1427`), así que `wordWrap` no lo parte: se encoge
    // la fuente hasta que quepa. Mismo problema y misma solución que
    // `QuienJuegaScene.ajustarAlAncho()`.
    const alias = this.add
      .text(cx, tablaCentroY - 16, this.datos!.alias, {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
        color: "#3E2712",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#F3E4C8", 5);
    this.encogerHasta(alias, tablaAncho, 9);

    const t = this.add
      .text(cx, tablaCentroY + 8, titulo, {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "18px",
        fontStyle: "600",
        color: "#3E2712",
        align: "center",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#F3E4C8", 5);
    this.encogerHasta(t, tablaAncho, 12);

    this.capa.add(alias);
    this.capa.add(t);
    // Dónde termina el letrero, para que lo de abajo no tenga que adivinarlo.
    return this.textures.exists("pin-numerico-letrero")
      ? 96 + (ancho * (this.textures.get("pin-numerico-letrero").getSourceImage().height / this.textures.get("pin-numerico-letrero").getSourceImage().width)) / 2
      : 150;
  }

  /** Encoge la fuente hasta que el texto quepa. Nunca deja que se desborde. */
  private encogerHasta(texto: Phaser.GameObjects.Text, anchoMax: number, minimo: number): void {
    let tam = Number(String(texto.style.fontSize).replace("px", ""));
    while (texto.width > anchoMax && tam > minimo) {
      tam -= 1;
      texto.setFontSize(tam);
    }
  }

  /**
   * La ayuda para el ADULTO que acompaña.
   *
   * Va sobre un fondo de pergamino y no suelta sobre la ilustración: en el
   * simulador, en gris sobre la hierba dorada del portón, era ilegible — y
   * además caía ENCIMA del botón de empezar de nuevo, porque estaba anclada a
   * una coordenada fija que no contaba con que el texto ocupa dos líneas.
   *
   * En pantallas muy bajas desaparece del todo: es la única pieza que es apoyo
   * puro y nunca necesaria para entrar (`mc-20`), así que es la primera que
   * cede espacio — la misma decisión que ya tomó la versión HTML.
   */
  private pintarAyuda(ayuda: string, y: number): number {
    const { width, height } = this.scale;
    // 120px = las dos líneas de la ayuda más el botón de empezar de nuevo. Sin
    // ese hueco no se pinta: `mc-20` dice que este texto es apoyo y nunca
    // requisito para entrar, así que es lo primero que cede espacio.
    if (height - y < 120) return y;
    const apoyo = this.add
      .text(width / 2, y, ayuda, {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "12px",
        color: "#3E2712",
        align: "center",
        backgroundColor: "#F3E4C8",
        padding: { x: 10, y: 6 },
        wordWrap: { width: Math.min(360, width - 60) },
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.92);
    this.capa.add(apoyo);
    return y + apoyo.height;
  }

  private get columnas(): number {
    return 3;
  }

  private get valores(): number[] {
    // Imágenes: 9 posiciones, en el orden barajado que mandó el servidor.
    // Numérico: el orden ESTÁNDAR de teléfono, sin barajar (D-197 §2) — un
    // dígito sí tiene un orden universal que un niño ya conoce, y cambiárselo
    // lo haría más difícil sin ganar seguridad real.
    return this.datos!.tipo === "numerico" ? [...TECLADO] : this.datos!.dibujos.map((_, i) => i);
  }

  private pintarRejilla(yDesde: number): number {
    const { width, height } = this.scale;
    const vals = this.valores;
    const filas = Math.ceil(vals.length / this.columnas);
    const alto = filas * CASILLA + (filas - 1) * HUECO;
    const anchoTotal = this.columnas * CASILLA + (this.columnas - 1) * HUECO;
    const x0 = (width - anchoTotal) / 2 + CASILLA / 2;
    // Debajo del letrero, con un respiro — pero centrada en el hueco que queda
    // si sobra sitio, para que en una tableta no se apelotone arriba. Las 4
    // filas del teclado numérico ya llenan casi todo en un teléfono.
    const disponible = height - yDesde - 190;
    const y0 = yDesde + Math.max(16, (disponible - alto) / 2) + CASILLA / 2;

    vals.forEach((valor, i) => {
      const col = i % this.columnas;
      const fila = Math.floor(i / this.columnas);
      let x = x0 + col * (CASILLA + HUECO);
      const y = y0 + fila * (CASILLA + HUECO);
      // El "0" queda solo en su fila: se centra en vez de quedar a la
      // izquierda, como en cualquier teclado de teléfono.
      if (i === vals.length - 1 && vals.length % this.columnas === 1) x = width / 2;
      this.pintarCasilla(valor, i, x, y);
    });
    return y0 - CASILLA / 2 + alto;
  }

  private pintarCasilla(valor: number, indice: number, x: number, y: number): void {
    const elegida = this.tocados.includes(valor);
    const caja = this.add.container(x, y);

    // La tabla de madera. Si faltara la textura, un rectángulo con el color de
    // la madera — nunca un hueco, que en esta pantalla significa un niño que
    // no puede entrar.
    if (this.textures.exists("pin-numerico-boton")) {
      const tabla = this.add.image(0, 0, "pin-numerico-boton");
      tabla.setDisplaySize(CASILLA, CASILLA);
      caja.add(tabla);
    } else {
      const g = this.add.graphics();
      g.fillStyle(0x8a5a2b, 1).fillRoundedRect(-CASILLA / 2, -CASILLA / 2, CASILLA, CASILLA, 12);
      caja.add(g);
    }

    if (this.datos!.tipo === "numerico") {
      const clave = `pin-numerico-digito-${valor}${elegida ? "-presionado" : ""}`;
      if (this.textures.exists(clave)) {
        const d = this.add.image(0, 0, clave);
        d.setDisplaySize(CASILLA, CASILLA);
        caja.add(d);
      } else {
        const t = this.add
          .text(0, 0, String(valor), {
            fontFamily: "Raleway, system-ui, sans-serif",
            fontSize: "34px",
            fontStyle: "700",
            color: "#3E2712",
          })
          .setOrigin(0.5);
        caja.add(t);
      }
    } else {
      const id = this.datos!.dibujos[indice];
      const clave = clavePinDibujo(id);
      if (this.textures.exists(clave)) {
        const img = this.add.image(0, 0, clave);
        // 72 de 88: deja un marco de madera visible alrededor del dibujo.
        img.setDisplaySize(72, 72);
        caja.add(img);
      }
    }

    // Elegida: anillo naranja por dentro. Refuerza el estado SIN depender solo
    // del color de la tabla — ~8% de los niños varones tiene deficiencia de
    // visión del color (`mc-38`).
    if (elegida) {
      const anillo = this.add.graphics();
      anillo
        .lineStyle(4, 0xf36b1c, 1)
        .strokeRoundedRect(-CASILLA / 2 + 2, -CASILLA / 2 + 2, CASILLA - 4, CASILLA - 4, 10);
      caja.add(anillo);
    }

    // El toque vive en un `Zone` HIJO con hitArea autogenerada. Nunca
    // `setInteractive(new Phaser.Geom.Rectangle(...))` ni el Container
    // directamente: una hitArea explícita NO registra el toque en esta build,
    // hallazgo documentado en cinco archivos de este repo.
    const zona = this.add.zone(0, 0, CASILLA, CASILLA);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => this.tocar(valor, caja));
    caja.add(zona);

    this.capa.add(caja);
  }

  /**
   * Cuántos toques llevas — sin números y sin texto.
   *
   * Cambia la FORMA además del color (anillo hueco → círculo lleno) por la
   * misma razón que el anillo de arriba: un indicador que solo cambia de color
   * no existe para quien no distingue ese color.
   */
  private pintarPasos(y: number): number {
    const { width } = this.scale;
    const total = this.largoPin;
    const g = this.add.graphics();
    const paso = 30;
    const x0 = width / 2 - ((total - 1) * paso) / 2;
    for (let i = 0; i < total; i++) {
      const x = x0 + i * paso;
      g.fillStyle(0xf3e4c8, 0.9).fillCircle(x, y, 12);
      if (i < this.tocados.length) {
        g.fillStyle(0xf36b1c, 1).fillCircle(x, y, 9);
      } else {
        g.lineStyle(3, 0x3e2712, 0.85).strokeCircle(x, y, 9);
      }
    }
    this.capa.add(g);
    return y + 12;
  }

  /**
   * Volver a empezar. SIEMPRE presente, también con cero toques: un botón que
   * aparece y desaparece mueve lo que hay debajo, y un niño que ya apuntó el
   * dedo falla el toque.
   */
  private pintarBorrar(y: number): void {
    const { width } = this.scale;
    const caja = this.add.container(width / 2, y);
    if (this.textures.exists("pin-numerico-boton")) {
      const t = this.add.image(0, 0, "pin-numerico-boton");
      t.setDisplaySize(180, 46);
      caja.add(t);
    }
    const texto = this.add
      .text(0, 0, this.datos!.rotulos.borrar, {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "15px",
        fontStyle: "600",
        color: "#3E2712",
      })
      .setOrigin(0.5)
      .setShadow(0, 0, "#F3E4C8", 4);
    caja.add(texto);

    const zona = this.add.zone(0, 0, 180, 46);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.ocupado) return;
      this.tocados = [];
      this.redibujar();
    });
    caja.add(zona);
    this.capa.add(caja);
  }

  private get largoPin(): number {
    return this.datos!.tipo === "numerico" ? 4 : 3;
  }

  // ─── Interacción ─────────────────────────────────────────────────────────

  private tocar(valor: number, caja: Phaser.GameObjects.Container): void {
    if (this.ocupado || this.tocados.length >= this.largoPin) return;

    // Un PIN de imágenes exige posiciones DISTINTAS: tocar la misma casilla
    // tres veces es lo que hace un niño que no entendió, y aceptarlo reduciría
    // el espacio de 504 a 9 sin que nadie lo notara. Un PIN numérico SÍ admite
    // repetidos, como cualquier PIN de teléfono.
    if (this.datos!.tipo !== "numerico" && this.tocados.includes(valor)) return;

    this.tweens.killTweensOf(caja);
    caja.setScale(1);
    this.tweens.add({ targets: caja, scaleX: 0.9, scaleY: 0.9, duration: 80, yoyo: true, ease: "Sine.easeInOut" });

    this.tocados.push(valor);
    this.redibujar();

    if (this.tocados.length >= this.largoPin) {
      // Un respiro para que el niño vea completarse el último paso antes de
      // que la pantalla cambie debajo de su dedo.
      this.time.delayedCall(260, () => void this.completar());
    }
  }

  private async completar(): Promise<void> {
    if (this.ocupado) return;
    this.ocupado = true;
    const intento = [...this.tocados];

    try {
      if (this.modo === "elegir") {
        // Todavía no se manda nada: primero hay que repetirlo. Tres toques
        // accidentales no pueden fijar un PIN que el niño no recuerda —
        // quedaría fuera de su propio perfil hasta que un adulto lo recambie.
        this.primeraVuelta = intento;
        this.tocados = [];
        this.modo = "confirmar";
        this.ocupado = false;
        this.redibujar();
        return;
      }

      if (this.modo === "confirmar") {
        if (!this.mismos(intento, this.primeraVuelta)) {
          // Sin regañar, sin contador, sin castigo (línea roja #7): se vuelve
          // a elegir desde cero.
          this.primeraVuelta = [];
          this.tocados = [];
          this.modo = "elegir";
          this.ocupado = false;
          this.redibujar();
          this.avisar(this.datos!.rotulos.noCoincide);
          return;
        }
        await this.enviar("/api/pin-elegir", intento);
        return;
      }

      // «entrar» y «cambiar» comparten la verificación; lo que cambia es a
      // dónde va el resultado.
      await this.enviar("/api/pin-entrar", intento);
    } finally {
      if (this.modo !== "confirmar") this.ocupado = false;
    }
  }

  private mismos(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  private async enviar(ruta: string, intento: number[]): Promise<void> {
    const cuerpo =
      this.datos!.tipo === "numerico"
        ? { childId: this.arranque.childId, digitos: intento }
        : { childId: this.arranque.childId, posiciones: intento };
    try {
      const res = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(cuerpo),
      });
      const r = (await res.json().catch(() => ({ ok: false }))) as {
        ok?: boolean;
        error?: string;
        destino?: string;
      };

      if (r.ok) {
        const destino = r.destino ?? this.datos!.destino;
        // El PIN acertado ya NO navega (D-201): la sesión de Phaser sigue
        // viva y Modo Historia arranca dentro de ella. `true` porque ésta es
        // la PRIMERA salida de la rejilla — la única que empuja historial, para
        // que un toque de «atrás» vuelva a las caras (D-200.3).
        if (this.arranque.alEntrar) this.arranque.alEntrar(destino);
        else await entrarAHistoria(this, destino);
        return;
      }

      // Un perfil que perdió su PIN entre la carga y el envío (el adulto lo
      // borró desde otro dispositivo): se pasa a elegir, no se deja colgado.
      if (r.error === "sin_pin") {
        this.modo = "elegir";
        this.tocados = [];
        this.ocupado = false;
        this.redibujar();
        return;
      }

      this.tocados = [];
      this.ocupado = false;
      this.redibujar();
      this.avisar(this.datos!.rotulos.reintenta);
    } catch {
      this.tocados = [];
      this.ocupado = false;
      this.redibujar();
      this.avisar(this.datos!.rotulos.reintenta);
    }
  }

  /**
   * El aviso de "esos no eran".
   *
   * Sin rojo de error, sin cruz, sin contador de intentos: no es un fallo de
   * matemáticas, es un toque que no era (línea roja #7). Se va solo — nunca un
   * modal que haya que cerrar.
   */
  private avisar(texto: string): void {
    const { width, height } = this.scale;
    this.mensaje?.destroy();
    this.mensaje = this.add
      .text(width / 2, height - 240, texto, {
        fontFamily: "Raleway, system-ui, sans-serif",
        fontSize: "15px",
        color: "#3E2712",
        align: "center",
        backgroundColor: "#F3E4C8",
        padding: { x: 12, y: 8 },
        wordWrap: { width: Math.min(420, width - 48) },
      })
      .setOrigin(0.5, 0)
      .setDepth(50);
    this.time.delayedCall(3200, () => {
      this.mensaje?.destroy();
      this.mensaje = null;
    });
  }
}
