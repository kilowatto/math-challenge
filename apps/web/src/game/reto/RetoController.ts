/**
 * RetoController — el reto real, sin renderer (D-184, ola 2).
 *
 * ─── Por qué existe esta clase ──────────────────────────────────────────────
 *
 * El dueño pidió el reto TAMBIÉN en Phaser, con alta interactividad — pero
 * también pidió una capa de accesibilidad de verdad, y un `<canvas>` no le
 * puede dar nada a un lector de pantalla. La única forma de tener las dos
 * cosas sin que diverjan es que NINGUNA de las dos posea el estado: este
 * archivo es el puerto fiel de la lógica de `components/reto/Pantalla.astro`
 * (el mismo `pedir()`, el mismo `elegir()`/`confirmar()` de dos pasos de la
 * línea roja #8, la misma cola offline, el mismo orden veredicto-antes-que-
 * límite de D-016) — sin un solo `document.` adentro.
 *
 * `GameplayScene` (canvas) y `AccessibleReto` (DOM oculto) son dos VISTAS del
 * mismo controlador: se suscriben a sus eventos, y cuando alguien contesta —
 * con el dedo en el canvas o con Tab+Enter en el DOM— llaman al MISMO método.
 * Ninguna de las dos guarda su propia copia del ítem actual.
 *
 * ─── Lo que este puerto conserva tal cual, y por qué importa ────────────────
 *
 *  · Elegir no es responder (#348, línea roja #8): `confirmar()` es la única
 *    función que manda algo a la red. Cambiar de opinión antes de eso no dat
 *    ningún dato al servidor porque no existe el dato de cuántas veces se
 *    cambió — igual que hoy.
 *  · El límite de pantalla llega JUNTO al ítem o junto al veredicto, nunca
 *    antes: D-016 exige que el corte caiga en un punto seguro, y el punto
 *    seguro es "ya no hay nada esperando respuesta".
 *  · La cola offline (`lib/cola-offline.ts`) es la MISMA — IndexedDB, nunca
 *    `localStorage`, vaciado por `visibilitychange`/foco — no una copia.
 *  · La voz (`speechSynthesis`, D-078) necesita un gesto humano antes de
 *    sonar (`mc-42` §9): `escuchar()` — llamado desde un tap real, en
 *    cualquiera de las dos vistas — ES ese gesto.
 */
import { encolar, engancharVaciado } from "../../lib/cola-offline";

export interface RotulosDeReto {
  bien: string;
  otra: string;
  siguiente: string;
  salir: string;
  cargando: string;
  mirar: string;
  confirmar: string;
  reintentar: string;
  elige: string;
  escuchar: string;
  vozActivada: string;
  vozDesactivada: string;
  sinVoz: string;
  pendiente: string;
}

export interface OpcionDeReto {
  valor: number | string;
  texto: string;
}

export interface ItemDeReto {
  id: string;
  enunciado: string;
  formato: string;
  opciones: OpcionDeReto[];
}

export interface VeredictoDeReto {
  correcto: boolean;
  titulo: string;
  siguienteTexto: string;
  ofrecerReintentar: boolean;
  offline: boolean;
}

export interface LimiteDePantalla {
  tipo: "AVISO" | "DESCANSO" | "CERRAR";
  textos: Record<string, string>;
  motivo?: string;
}

interface DatosDeArranqueReto {
  locale: string;
  habilidad: string;
  nivel: "facil" | "medio" | "dificil" | null;
  rotulos: RotulosDeReto;
  etiquetaVoz: string;
  salirA: string;
}

type Evento =
  | "cargando"
  | "item"
  | "seleccion"
  | "veredicto-limpio"
  | "veredicto"
  | "limite"
  | "despedida"
  | "descanso-cerrado";

type Escucha = (payload?: unknown) => void;

/** Un EventEmitter mínimo — no hace falta el de Phaser para no acoplar el controlador al motor gráfico. */
class Emisor {
  private escuchas = new Map<Evento, Set<Escucha>>();
  on(evento: Evento, fn: Escucha): () => void {
    if (!this.escuchas.has(evento)) this.escuchas.set(evento, new Set());
    this.escuchas.get(evento)!.add(fn);
    return () => this.escuchas.get(evento)?.delete(fn);
  }
  emit(evento: Evento, payload?: unknown): void {
    this.escuchas.get(evento)?.forEach((fn) => fn(payload));
  }
}

export class RetoController extends Emisor {
  readonly rotulos: RotulosDeReto;
  private readonly locale: string;
  private readonly habilidadFija: string;
  private readonly nivelFijo: string | null;
  private readonly salirDestino: string;

  actual: ItemDeReto | null = null;
  elegido: number | string | null = null;
  private juzgado = false;
  private esReintento = false;
  private mandando = false;
  private terminado = false;
  private ultimoItemId: string | null = null;
  private retoSesionId: string | null = null;
  private ordenActual: number | null = null;
  /** Cuántos ítems se han contestado en esta sesión. Solo para la despedida. */
  private itemsHechos = 0;

  // --- voz --------------------------------------------------------------
  private readonly VOZ_CLAVE = "mc:voz";
  private readonly sintesis = typeof window !== "undefined" ? window.speechSynthesis : null;
  private vozElegida: SpeechSynthesisVoice | null = null;
  private leerSolo = true;
  private desbloqueado = false;
  private readonly etiquetaVoz: string;

  constructor(datos: DatosDeArranqueReto) {
    super();
    this.locale = datos.locale;
    this.habilidadFija = datos.habilidad;
    this.nivelFijo = datos.nivel;
    this.rotulos = datos.rotulos;
    this.etiquetaVoz = datos.etiquetaVoz;
    this.salirDestino = datos.salirA;

    try {
      this.leerSolo = localStorage.getItem(this.VOZ_CLAVE) !== "0";
    } catch {
      // Safari en privado lanza al escribir. Sin memoria, pero con voz.
    }
    if (this.sintesis) {
      this.revisarVoz();
      this.sintesis.addEventListener?.("voiceschanged", () => this.revisarVoz());
    }

    setTimeout(() => {
      engancharVaciado(async (intento) => {
        if (!intento.payload) return false;
        try {
          const r = await fetch(intento.payload.url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: intento.payload.body,
          });
          return r.ok;
        } catch {
          return false;
        }
      });
    }, 0);
  }

  get hayVoz(): boolean {
    return Boolean(this.vozElegida);
  }
  get vozActivada(): boolean {
    return this.leerSolo;
  }
  /**
   * Expuesto porque un `limite` con tipo CERRAR puede llegar desde
   * `confirmar()` (D-016, corte a mitad de sesión) sin pasar por `siguiente()`
   * — a diferencia de "despedida", ese evento no trae `hechos` en el payload,
   * así que quien lo escuche lo lee de aquí para pintar el mismo cierre.
   */
  get hechos(): number {
    return this.itemsHechos;
  }
  /** El `<a href>` real de la salida accesible (`AccessibleReto`) y el destino del 401 — el mismo, nunca dos. */
  get salirA(): string {
    return this.salirDestino;
  }

  private normalizar(s: string): string {
    return String(s || "").replace("_", "-").toLowerCase();
  }

  private revisarVoz(): void {
    if (!this.sintesis || !this.etiquetaVoz) return;
    const voces = this.sintesis.getVoices() ?? [];
    const objetivo = this.normalizar(this.etiquetaVoz);
    this.vozElegida = voces.find((v) => this.normalizar(v.lang) === objetivo) ?? null;
  }

  /** `forzado` es el botón "Escuchar": el gesto humano que D-078/mc-42 §9 exige antes del primer sonido. */
  decir(texto: string, forzado = false): void {
    if (!this.sintesis || !this.vozElegida) return;
    if (!forzado && !this.leerSolo) return;
    if (forzado) this.desbloqueado = true;
    else if (!this.desbloqueado) return;
    const limpio = String(texto || "").trim();
    if (!limpio) return;
    this.sintesis.cancel();
    const frase = new SpeechSynthesisUtterance(limpio);
    frase.voice = this.vozElegida;
    frase.lang = this.vozElegida.lang;
    frase.rate = 0.9;
    try {
      this.sintesis.speak(frase);
    } catch {
      // iOS no deja hablar antes del primer gesto — no es un error que enseñar.
    }
  }

  alternarVoz(): void {
    this.leerSolo = !this.leerSolo;
    try {
      localStorage.setItem(this.VOZ_CLAVE, this.leerSolo ? "1" : "0");
    } catch {
      // Sin memoria, el ajuste dura lo que la pantalla.
    }
    if (!this.leerSolo) this.sintesis?.cancel();
    else if (this.actual) this.decir(this.actual.enunciado, true);
  }

  callar(): void {
    this.sintesis?.cancel();
  }

  // --- la red -------------------------------------------------------------

  private async pedir(accion: string, cuerpo: Record<string, unknown>): Promise<any> {
    const url = `/api/jugar?accion=${accion}`;
    const body = JSON.stringify({
      locale: this.locale,
      retoSesionId: cuerpo.retoSesionId ?? this.retoSesionId,
      ...cuerpo,
    });
    let r: Response;
    try {
      r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body });
    } catch {
      if (
        accion === "responder" &&
        typeof cuerpo.itemId === "string" &&
        Number.isInteger(cuerpo.orden) &&
        typeof (cuerpo.retoSesionId ?? this.retoSesionId) === "string"
      ) {
        try {
          await encolar({
            sesionId: (cuerpo.retoSesionId ?? this.retoSesionId) as string,
            orden: cuerpo.orden as number,
            itemId: cuerpo.itemId,
            eleccion: cuerpo.eleccion as number | string,
            contestadoEn: Date.now(),
            payload: { url, body },
          });
          return { offline: true };
        } catch {
          return null;
        }
      }
      return null;
    }
    if (r.status === 401) {
      window.location.href = this.salirDestino;
      return null;
    }
    return r.ok ? r.json() : null;
  }

  // --- el bucle -------------------------------------------------------------

  async siguiente(): Promise<void> {
    if (this.terminado) return;
    this.elegido = null;
    this.juzgado = false;
    this.esReintento = false;
    this.mandando = false;
    this.emit("veredicto-limpio");
    this.emit("cargando");

    const r = await this.pedir("siguiente", {
      ultimoItemId: this.ultimoItemId,
      habilidad: this.habilidadFija,
      nivel: this.nivelFijo ?? undefined,
    });

    if (r?.corte) {
      this.terminado = true;
      this.emit("despedida", { ...r.corte, hechos: this.itemsHechos });
      return;
    }
    if (!r?.ok) return;

    this.actual = {
      id: r.item.id,
      enunciado: r.item.enunciado,
      formato: r.item.formato,
      // El banco de PRIMARIA es un solo formato, `toca_la_respuesta`, y nunca
      // manda `dibujo` (ver packages/motor/src/banco-primaria.ts) — el texto
      // siempre es el nombre accesible que ya autoró el banco.
      opciones: r.item.opciones.map((o: any) => ({ valor: o.valor, texto: o.texto })),
    };
    this.retoSesionId = r.retoSesionId ?? this.retoSesionId;
    this.ordenActual = r.contexto?.orden ?? null;
    this.decir(this.actual.enunciado);
    this.emit("item", this.actual);
    if (r.limite) this.emit("limite", r.limite as LimiteDePantalla);
  }

  elegir(valor: number | string): void {
    if (this.mandando || this.juzgado || !this.actual) return;
    this.elegido = valor;
    this.emit("veredicto-limpio");
    this.emit("seleccion", valor);
  }

  async confirmar(): Promise<void> {
    if (this.mandando || this.juzgado || this.elegido === null || !this.actual) return;
    this.mandando = true;

    const r = await this.pedir("responder", {
      itemId: this.actual.id,
      eleccion: this.elegido,
      reintento: this.esReintento,
      habilidad: this.habilidadFija,
      retoSesionId: this.retoSesionId,
      orden: this.ordenActual,
    });
    this.mandando = false;

    if (r?.offline) {
      this.juzgado = true;
      const v: VeredictoDeReto = {
        correcto: false,
        titulo: this.rotulos.pendiente,
        siguienteTexto: "",
        ofrecerReintentar: false,
        offline: true,
      };
      this.emit("veredicto", v);
      return;
    }
    if (!r) return; // el fallo de red ya se encoló o se ignoró; no hay nada que pintar de más

    this.juzgado = true;
    this.ultimoItemId = this.actual.id;
    if (r.conto) this.itemsHechos++;

    const exp = r.explicacion || {};
    const titulo = exp.titulo || (r.correcto ? this.rotulos.bien : this.rotulos.otra);
    const v: VeredictoDeReto = {
      correcto: Boolean(r.correcto),
      titulo,
      siguienteTexto: exp.siguiente || "",
      ofrecerReintentar: r.correcto !== true,
      offline: false,
    };
    this.decir([v.titulo, v.siguienteTexto].filter(Boolean).join(" "));
    this.emit("veredicto", v);
    if (r.limite?.tipo === "CERRAR") {
      // Mismo cierre que un corte al servir (D-016): a mitad de sesión, el
      // límite diario también puede caer justo después de calificar una
      // respuesta. Pantalla.astro resuelve los dos casos con la misma
      // función (`mostrarDespedida`); aquí, el mismo evento.
      this.terminado = true;
      this.emit("despedida", { ...r.limite, hechos: this.itemsHechos });
    } else if (r.limite) {
      this.emit("limite", r.limite as LimiteDePantalla);
    }
  }

  /** El segundo intento NO vuelve a contar en el modelo (mc-30, línea roja #8). */
  reintentar(): void {
    if (!this.actual) return;
    this.juzgado = false;
    this.esReintento = true;
    this.elegido = null;
    this.emit("veredicto-limpio");
  }

  cerrarDescanso(): void {
    this.emit("descanso-cerrado");
  }
}
