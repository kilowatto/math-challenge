/**
 * PerfilAjustesScene — el panel que abre el engrane de una tarjeta de niño
 * (D-198, ronda 3 — 55.10).
 *
 * ─── Alcance de ESTA pantalla, y lo que queda para 55.11 ───────────────────
 *
 * Cinco acciones, las cinco de toque puro (idioma, banda, avatar, otro
 * alias, borrar) — ninguna pide texto libre, así que las cinco viven aquí
 * mismo, en Phaser, sin salir de la pantalla. **"Cambiar PIN" navega a una
 * página aparte** (`/app/kids/perfil-pin/`) a propósito: la rejilla de 9
 * imágenes de KINDER se deriva del secreto del servidor
 * (`pin-imagenes.ts::rejillaDe`), igual que la pantalla de verificación —
 * reconstruir ese cálculo en el cliente sería duplicar una pieza de
 * seguridad, no ahorrar una pantalla. **El nombre/usuario del ADULTO no
 * está en este panel** — su propio engrane y su propio texto libre son
 * trabajo de 55.11, junto con el asistente de crear-perfil (ninguno de los
 * dos existe todavía).
 *
 * ─── Por qué una llamada puede terminar en una navegación de página entera ──
 *
 * Los 6 endpoints de D-197 exigen `leerSesionAdulto` — una cookie de 30
 * días (`VIDA_ADULTO_S`), MÁS CORTA que la del dispositivo de la casa (400
 * días, `VIDA_HOGAR_S`). Un tablet de uso diario puede llegar aquí con la
 * sesión del adulto ya vencida y el dispositivo igual de confiable — el
 * mismo caso que CUALQUIER página adulta de este sitio ya resuelve
 * redirigiendo a `ruta(locale, "entrar")+"?cambiar=1"` (ver
 * `[locale]/app/perfil.astro` y una docena más). Este panel hace lo mismo
 * ante un `401 sin_sesion`, en vez de inventar un mensaje de reautenticación
 * dentro del lienzo.
 */
import Phaser from "phaser";
import { BANDERA_POR_LOCALE, type TarjetaPerfil, type RotulosQuienJuega } from "./QuienJuegaScene";
import { rosterPara, claveDeAnimal, type AnimalId } from "../../lib/avatares-animal";
import type { TemaVisual } from "../../lib/quien-juega-datos";
import { LOCALES, type Locale } from "../../i18n/index";
import { ruta } from "../../i18n/rutas";
import { rutaPerfilPin } from "../../lib/rutas-app";
import type { SfxManager } from "../managers/SfxManager";

type RotulosAjustes = RotulosQuienJuega["ajustes"];

export interface DatosAjustes {
  tarjeta: TarjetaPerfil;
  rotulos: RotulosAjustes;
  /** El locale de la PÁGINA (URL) — para el redirect de sesión vencida. */
  locale: string;
  /** Posición real de la tarjeta tocada — de dónde "crece" el panel (D-199, ronda 2). */
  origenX: number;
  origenY: number;
}

const COLOR_PERGAMINO = 0xf3e4c8;
const COLOR_MADERA = 0x8a5a2b;
const COLOR_NARANJA = 0xf36b1c;
const COLOR_PELIGRO = 0xce4912;
const COLOR_GRIS_400 = 0xa4a6a8;

export class PerfilAjustesScene extends Phaser.Scene {
  private tarjeta!: TarjetaPerfil;
  private rotulos!: RotulosAjustes;
  private locale!: string;
  private origen!: { x: number; y: number };
  private bandaActual!: TemaVisual;
  private avatarActual: AnimalId | null = null;
  private aliasActual = "";
  private huboCambios = false;
  private modo: "ajustes" | "confirmarBorrar" = "ajustes";
  private panel!: Phaser.GameObjects.Container;
  private fondo!: Phaser.GameObjects.Rectangle;
  private ocupado = false;

  constructor() {
    super("PerfilAjustesScene");
  }

  init(datos: DatosAjustes): void {
    this.tarjeta = datos.tarjeta;
    this.rotulos = datos.rotulos;
    this.locale = datos.locale;
    this.origen = { x: datos.origenX, y: datos.origenY };
    this.bandaActual = (datos.tarjeta.themeBand as TemaVisual) || "KINDER";
    this.avatarActual = datos.tarjeta.animal;
    this.aliasActual = datos.tarjeta.alias;
    this.huboCambios = false;
    this.modo = "ajustes";
  }

  /**
   * "Que se vuelta la tarjeta y crezca animadamente. Como un vídeo juego"
   * (D-199, ronda 2) — corregido en D-199.3: la primera versión hacía esto
   * en DOS tweens separados, con un `setPosition()` instantáneo entre uno y
   * otro (adelgazar en el sitio → SALTAR al centro → crecer). El dueño lo
   * vio en vivo: "brinca la modal al centro sin estar conectada la
   * animación" — un salto de posición sin interpolar es EXACTAMENTE eso,
   * sin importar cuán delgado esté el panel en ese instante.
   *
   * Ahora es UN solo tween: posición y escala se mueven juntas, siempre
   * interpoladas, del punto de la tarjeta al centro — nunca un
   * `setPosition()` suelto a mitad de la animación. El aire de "volteo" no
   * viene de una segunda fase sino de arrancar `scaleX` más chico que
   * `scaleY` (más angosto que bajo) y que ambos lleguen a 1 al mismo
   * tiempo — se ve "desdoblar", no solo crecer, sin ningún salto.
   */
  create(): void {
    const { width, height } = this.scale;

    this.fondo = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0, 0)
      .setInteractive();
    this.fondo.on("pointerdown", () => this.cerrar());
    this.tweens.add({ targets: this.fondo, alpha: 0.6, duration: 200 });

    this.panel = this.add.container(this.origen.x, this.origen.y);
    this.panel.setScale(0.08, 0.3);
    this.redibujar();

    (this.registry.get("sfxManager") as SfxManager | undefined)?.reproducir("panel-abre");

    this.tweens.add({
      targets: this.panel,
      x: width / 2,
      y: height / 2,
      scaleX: 1,
      scaleY: 1,
      duration: 380,
      ease: "Back.easeOut",
    });
  }

  private sfx(): void {
    (this.registry.get("sfxManager") as SfxManager | undefined)?.reproducir("toque");
  }

  private redibujar(): void {
    this.panel.removeAll(true);
    if (this.modo === "confirmarBorrar") this.dibujarConfirmarBorrar();
    else this.dibujarAjustes();
  }

  // ─── El panel principal ────────────────────────────────────────────────

  private dibujarAjustes(): void {
    // "Un poco más grande" (D-199, ronda 2) — de 320×500 a 356×560.
    const ancho = 356;
    const alto = 560;

    const tarjeta = this.add.graphics();
    tarjeta.fillStyle(COLOR_PERGAMINO, 0.97);
    tarjeta.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 16);
    tarjeta.lineStyle(3, COLOR_MADERA, 0.8);
    tarjeta.strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 16);
    this.panel.add(tarjeta);

    const cerrar = this.add
      .text(ancho / 2 - 22, -alto / 2 + 20, "✕", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "20px",
        color: "#727476",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });
    cerrar.on(Phaser.Input.Events.POINTER_DOWN, () => this.cerrar());
    this.panel.add(cerrar);

    // El botón de borrar (D-199, ronda 2: "más pequeño, solo un bote de
    // basura") — un ícono chico en el encabezado, no una fila entera más
    // abajo. Sigue exigiendo el MISMO paso de confirmación de siempre; lo
    // que cambió es el tamaño del gatillo, nunca la seguridad detrás.
    this.dibujarIconoBasura(ancho / 2 - 56, -alto / 2 + 20);

    const alias = this.add
      .text(-ancho / 2 + 20, -alto / 2 + 16, this.aliasActual, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "19px",
        fontStyle: "700",
        color: "#434547",
      })
      .setOrigin(0, 0);
    this.panel.add(alias);

    const subtitulo = this.add
      .text(-ancho / 2 + 20, -alto / 2 + 41, this.rotulos.titulo, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#727476",
      })
      .setOrigin(0, 0);
    this.panel.add(subtitulo);

    let y = -alto / 2 + 78;
    y = this.seccionIdioma(ancho, y);
    y = this.seccionBanda(ancho, y);
    y = this.seccionAvatar(y);
    y = this.seccionAlias(ancho, y);
    y = this.seccionPin(ancho, y);
    this.seccionGuardar(ancho, y);
  }

  /** El ícono chico de "borrar" del encabezado — ver `dibujarAjustes()`. */
  private dibujarIconoBasura(x: number, y: number): void {
    const radio = 16;
    const zona = this.add.zone(x, y, radio * 2, radio * 2);
    zona.setInteractive({ useHandCursor: true });
    zona.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.sfx();
      this.modo = "confirmarBorrar";
      this.redibujar();
    });
    this.panel.add(zona);

    const g = this.add.graphics();
    g.setPosition(x, y);
    // El bote: un trapecio (cuerpo), una tapa, y una asa — todo en el mismo
    // tono de "peligro" que ya usaba el botón completo, para que la
    // asociación con "borrar" no dependa de una palabra.
    g.lineStyle(2, COLOR_PELIGRO, 1);
    g.beginPath();
    g.moveTo(-6, -6);
    g.lineTo(-5, 8);
    g.lineTo(5, 8);
    g.lineTo(6, -6);
    g.closePath();
    g.strokePath();
    g.beginPath();
    g.moveTo(-9, -6);
    g.lineTo(9, -6);
    g.strokePath();
    g.beginPath();
    g.moveTo(-3, -6);
    g.lineTo(-2, -9);
    g.lineTo(2, -9);
    g.lineTo(3, -6);
    g.strokePath();
    g.beginPath();
    g.moveTo(-3, -2);
    g.lineTo(-2.5, 4);
    g.moveTo(0, -2);
    g.lineTo(0, 4);
    g.moveTo(3, -2);
    g.lineTo(2.5, 4);
    g.strokePath();
    this.panel.add(g);
  }

  private legend(ancho: number, y: number, texto: string): number {
    const t = this.add
      .text(-ancho / 2 + 20, y, texto, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        fontStyle: "600",
        color: "#8A5A2B",
      })
      .setOrigin(0, 0);
    this.panel.add(t);
    return y + 20;
  }

  private seccionIdioma(ancho: number, yInicio: number): number {
    const y = this.legend(ancho, yInicio, this.rotulos.idioma);
    const anchoFila = LOCALES.length * 34;
    let x = -anchoFila / 2 + 17;
    for (const locale of LOCALES) {
      const activo = locale === this.tarjeta.locale;
      const circulo = this.add.circle(x, y + 14, 16, activo ? COLOR_NARANJA : 0xffffff, 1);
      circulo.setStrokeStyle(2, activo ? COLOR_NARANJA : COLOR_GRIS_400, 1);
      circulo.setInteractive({ useHandCursor: true });
      const bandera = BANDERA_POR_LOCALE[locale] ?? "";
      const texto = this.add.text(x, y + 14, bandera, { fontSize: "15px" }).setOrigin(0.5, 0.5);
      circulo.on(Phaser.Input.Events.POINTER_DOWN, () => this.cambiarIdioma(locale));
      this.panel.add(circulo);
      this.panel.add(texto);
      x += 34;
    }
    return y + 40;
  }

  private seccionBanda(ancho: number, yInicio: number): number {
    const y = this.legend(ancho, yInicio, this.rotulos.comoSeVe);
    const opciones: Array<{ valor: TemaVisual; texto: string }> = [
      { valor: "KINDER", texto: this.rotulos.kinder },
      { valor: "PRIMARIA", texto: this.rotulos.primaria },
      { valor: "SECUNDARIA", texto: this.rotulos.secundaria },
    ];
    const anchoBoton = 92;
    const espacio = 8;
    let x = -((anchoBoton + espacio) * (opciones.length - 1)) / 2;
    for (const op of opciones) {
      const activo = op.valor === this.bandaActual;
      const boton = this.add
        .rectangle(x, y + 17, anchoBoton, 34, activo ? 0xfdedd7 : 0xffffff, 1)
        .setStrokeStyle(2, activo ? COLOR_NARANJA : COLOR_GRIS_400)
        .setInteractive({ useHandCursor: true });
      const texto = this.add
        .text(x, y + 17, op.texto, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#434547",
          align: "center",
          wordWrap: { width: anchoBoton - 10 },
        })
        .setOrigin(0.5, 0.5);
      boton.on(Phaser.Input.Events.POINTER_DOWN, () => this.cambiarBanda(op.valor));
      this.panel.add(boton);
      this.panel.add(texto);
      x += anchoBoton + espacio;
    }
    return y + 46;
  }

  private seccionAvatar(yInicio: number): number {
    // Sin leyenda propia a propósito: la rejilla de retratos es autoexplicativa
    // (mismo criterio que la rejilla de `kids/index.astro`, que tampoco lleva
    // un rótulo "elige tu avatar" encima) — no hace falta una clave nueva de
    // i18n solo para un título que el contenido ya dice por sí mismo.
    const y = yInicio + 4;
    const roster = rosterPara(this.bandaActual);
    const columnas = 4;
    const celda = 52;
    const filas = Math.ceil(roster.length / columnas);
    const anchoGrid = columnas * celda;
    const inicioX = -anchoGrid / 2 + celda / 2;
    roster.forEach((id, i) => {
      const col = i % columnas;
      const fila = Math.floor(i / columnas);
      const x = inicioX + col * celda;
      const yPos = y + fila * celda + celda / 2 - 6;
      const activo = id === this.avatarActual;
      const clave = claveDeAnimal(id);
      const marco = this.add.circle(x, yPos, 22, activo ? COLOR_NARANJA : 0xffffff, 1);
      marco.setStrokeStyle(activo ? 3 : 1, activo ? COLOR_NARANJA : COLOR_GRIS_400);
      marco.setInteractive({ useHandCursor: true });
      marco.on(Phaser.Input.Events.POINTER_DOWN, () => this.cambiarAvatar(id));
      this.panel.add(marco);
      if (this.textures.exists(clave)) {
        const img = this.add.image(x, yPos, clave).setDisplaySize(36, 36);
        const recorte = this.add.circle(x, yPos, 18).setVisible(false);
        img.setMask(recorte.createGeometryMask());
        this.panel.add(img);
      }
    });
    return y + filas * celda + 14;
  }

  private seccionAlias(ancho: number, yInicio: number): number {
    const y = this.legend(ancho, yInicio, this.rotulos.alias);
    const texto = this.add
      .text(-ancho / 2 + 20, y, this.aliasActual, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        color: "#434547",
      })
      .setOrigin(0, 0.5);
    this.panel.add(texto);

    const boton = this.add
      .rectangle(ancho / 2 - 54, y, 88, 30, 0xffffff, 1)
      .setStrokeStyle(2, COLOR_GRIS_400)
      .setInteractive({ useHandCursor: true });
    const botonTexto = this.add
      .text(ancho / 2 - 54, y, this.rotulos.otroAlias, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "12px",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5);
    boton.on(Phaser.Input.Events.POINTER_DOWN, () => this.otroAlias());
    this.panel.add(boton);
    this.panel.add(botonTexto);
    return y + 38;
  }

  private seccionPin(ancho: number, yInicio: number): number {
    const boton = this.add
      .rectangle(0, yInicio + 18, ancho - 40, 40, 0xffffff, 1)
      .setStrokeStyle(2, COLOR_GRIS_400)
      .setInteractive({ useHandCursor: true });
    const texto = this.add
      .text(0, yInicio + 18, this.rotulos.pin, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5);
    boton.on(Phaser.Input.Events.POINTER_DOWN, () => this.irACambiarPin());
    this.panel.add(boton);
    this.panel.add(texto);
    return yInicio + 50;
  }

  /** D-199, ronda 2: "un botón de salvar o guardar" — la vía principal de cerrar el panel. */
  private seccionGuardar(ancho: number, yInicio: number): number {
    const y = yInicio + 22;
    const boton = this.add
      .rectangle(0, y, ancho - 40, 48, COLOR_NARANJA, 1)
      .setInteractive({ useHandCursor: true });
    const texto = this.add
      .text(0, y, this.rotulos.guardar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "700",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);
    boton.on(Phaser.Input.Events.POINTER_DOWN, () => this.cerrar());
    this.panel.add(boton);
    this.panel.add(texto);
    return y + 48;
  }

  // ─── El sub-panel de confirmación de borrado ────────────────────────────

  private dibujarConfirmarBorrar(): void {
    const ancho = 300;
    const alto = 260;

    const tarjeta = this.add.graphics();
    tarjeta.fillStyle(0xffffff, 1);
    tarjeta.fillRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 16);
    tarjeta.lineStyle(3, COLOR_PELIGRO, 0.8);
    tarjeta.strokeRoundedRect(-ancho / 2, -alto / 2, ancho, alto, 16);
    this.panel.add(tarjeta);

    const titulo = this.add
      .text(0, -alto / 2 + 30, this.rotulos.peligro, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "17px",
        fontStyle: "700",
        color: "#CE4912",
        align: "center",
      })
      .setOrigin(0.5, 0.5);
    this.panel.add(titulo);

    const cuerpo = this.add
      .text(0, -alto / 2 + 66, this.rotulos.confirmarBorrar.replace("{alias}", this.aliasActual), {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#434547",
        align: "center",
        wordWrap: { width: ancho - 40, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);
    this.panel.add(cuerpo);

    const yBotones = alto / 2 - 60;
    const siBoton = this.add
      .rectangle(0, yBotones, ancho - 40, 42, COLOR_PELIGRO, 1)
      .setInteractive({ useHandCursor: true });
    const siTexto = this.add
      .text(0, yBotones, this.rotulos.siBorrar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "14px",
        fontStyle: "600",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);
    siBoton.on(Phaser.Input.Events.POINTER_DOWN, () => this.confirmarBorrar());
    this.panel.add(siBoton);
    this.panel.add(siTexto);

    const cancelarBoton = this.add
      .rectangle(0, yBotones + 50, ancho - 40, 36, 0xffffff, 1)
      .setStrokeStyle(2, COLOR_GRIS_400)
      .setInteractive({ useHandCursor: true });
    const cancelarTexto = this.add
      .text(0, yBotones + 50, this.rotulos.cancelar, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#434547",
      })
      .setOrigin(0.5, 0.5);
    cancelarBoton.on(Phaser.Input.Events.POINTER_DOWN, () => {
      this.sfx();
      this.modo = "ajustes";
      this.redibujar();
    });
    this.panel.add(cancelarBoton);
    this.panel.add(cancelarTexto);
  }

  // ─── Las llamadas ────────────────────────────────────────────────────────

  /**
   * `401 sin_sesion` no se muestra dentro del lienzo: navega de verdad a
   * `entrar`, igual que cualquier página adulta de este sitio ante una
   * sesión vencida — ver el encabezado del archivo.
   */
  private async llamar(url: string, body: Record<string, unknown>): Promise<any> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      window.location.href = `${ruta(this.locale as Locale, "entrar")}?cambiar=1`;
      return new Promise(() => {}); // la navegación ya viene en camino — no hay nada más que resolver aquí.
    }
    return res.json().catch(() => ({ ok: false, error: "respuesta_ilegible" }));
  }

  private async ejecutar(accion: () => Promise<any>, alExito: (r: any) => void): Promise<void> {
    if (this.ocupado) return;
    this.ocupado = true;
    this.sfx();
    try {
      const r = await accion();
      if (r.ok) {
        this.huboCambios = true;
        alExito(r);
        this.redibujar();
      } else {
        this.mostrarError(r.error === "banda_fuera_de_margen" ? this.rotulos.fueraDeMargen : this.rotulos.errorGenerico);
      }
    } catch {
      this.mostrarError(this.rotulos.errorGenerico);
    } finally {
      this.ocupado = false;
    }
  }

  private mostrarError(texto: string): void {
    const { width, height } = this.scale;
    const aviso = this.add
      .text(width / 2, height - 40, texto, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#ffffff",
        backgroundColor: "#CE4912",
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(50);
    this.time.delayedCall(2600, () => aviso.destroy());
  }

  private cambiarIdioma(locale: string): void {
    if (locale === this.tarjeta.locale) return;
    this.ejecutar(
      () => this.llamar("/api/perfil-idioma", { childId: this.tarjeta.id, locale }),
      (r) => {
        this.tarjeta = { ...this.tarjeta, locale, alias: r.alias };
        this.aliasActual = r.alias;
      },
    );
  }

  private cambiarBanda(banda: TemaVisual): void {
    if (banda === this.bandaActual) return;
    this.ejecutar(
      () => this.llamar("/api/perfil-nivel", { childId: this.tarjeta.id, banda }),
      () => {
        this.bandaActual = banda;
      },
    );
  }

  private cambiarAvatar(animal: AnimalId): void {
    if (animal === this.avatarActual) return;
    this.ejecutar(
      () => this.llamar("/api/perfil-avatar", { childId: this.tarjeta.id, animal }),
      () => {
        this.avatarActual = animal;
      },
    );
  }

  private otroAlias(): void {
    this.ejecutar(
      () => this.llamar("/api/perfil-alias", { childId: this.tarjeta.id }),
      (r) => {
        this.aliasActual = r.alias;
      },
    );
  }

  private irACambiarPin(): void {
    this.sfx();
    window.location.href = rutaPerfilPin(this.locale, this.tarjeta.id);
  }

  private confirmarBorrar(): void {
    this.ejecutar(
      () => this.llamar("/api/perfil-borrar", { childId: this.tarjeta.id }),
      () => {
        window.location.reload();
      },
    );
  }

  /** El mismo movimiento de `create()`, al revés — UN tween, sin salto. Ver el comentario ahí. */
  private cerrar(): void {
    (this.registry.get("sfxManager") as SfxManager | undefined)?.reproducir("panel-cierra");
    this.tweens.add({ targets: this.fondo, alpha: 0, duration: 280 });
    this.tweens.add({
      targets: this.panel,
      x: this.origen.x,
      y: this.origen.y,
      scaleX: 0.08,
      scaleY: 0.3,
      duration: 280,
      ease: "Sine.easeIn",
      onComplete: () => {
        this.scene.stop();
        this.scene.resume("QuienJuegaScene");
        if (this.huboCambios) window.location.reload();
      },
    });
  }
}
