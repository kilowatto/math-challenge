/**
 * AccessibleReto — el mismo reto, en DOM real (D-184, ola 2).
 *
 * ─── Por qué existe ──────────────────────────────────────────────────────
 *
 * Un `<canvas>` no le da nada a un lector de pantalla: ningún nodo, ningún
 * `aria-live`, ningún foco de teclado. `GameplayScene` pinta el reto para
 * quien ve y toca; esta clase construye, dentro del mismo contenedor oculto
 * (`.visualmente-oculto`, ya usado en `reto.css`) que monta
 * `HistoriaMount.astro`, el árbol DOM/ARIA que un lector de pantalla o un
 * teclado SÍ pueden operar — el mismo marcado que `Pantalla.astro` usa hoy
 * para el reto en HTML, solo que construido en TypeScript porque aquí no hay
 * plantilla Astro disponible en tiempo de ejecución.
 *
 * Ninguna de las dos vistas posee el estado (ver `RetoController.ts`): esta
 * clase solo escucha los eventos del controlador y llama a sus métodos — los
 * MISMOS métodos que toca `GameplayScene` con el dedo en el canvas. Elegir
 * con Tab+Enter aquí y confirmar produce exactamente la misma llamada a
 * `/api/jugar` que elegir con el dedo allá.
 */
import type { RetoController, ItemDeReto, VeredictoDeReto, LimiteDePantalla } from "./RetoController";

/**
 * `appendChild` en lugar de `Element.append(...nodes)`: `@cloudflare/workers-types`
 * (`tsconfig.json`, para los bindings de D1/KV) declara su PROPIO `Element`
 * global —el de `HTMLRewriter`, con `append(content: string | ReadableStream
 * | Response, options?)`— y TypeScript lo fusiona por nombre con el `Element`
 * del DOM del navegador. El `append` variádico del DOM queda inservible desde
 * cualquier archivo que vea los dos tipos a la vez; `appendChild` no está en
 * la interfaz de HTMLRewriter, así que no choca.
 */
function anexar(padre: HTMLElement, ...hijos: Node[]): void {
  for (const hijo of hijos) padre.appendChild(hijo);
}

/** El mismo patrón de `activarConToque` en `Pantalla.astro`: evita el doble disparo pointerup+click sin perder la síntesis nativa de Safari. */
function activarConToque(elemento: HTMLElement, accion: () => void): void {
  let ultimaActivacion = 0;
  const activar = (evento: Event) => {
    const ahora = Date.now();
    if (ahora - ultimaActivacion < 500) {
      if (evento.type !== "click") evento.preventDefault();
      return;
    }
    ultimaActivacion = ahora;
    accion();
  };
  elemento.addEventListener("pointerup", activar);
  elemento.addEventListener("touchend", activar, { passive: false });
  elemento.addEventListener("click", activar);
}

export class AccessibleReto {
  private readonly contenedor: HTMLElement;
  private readonly controller: RetoController;
  private readonly desuscribir: Array<() => void> = [];

  private enunciado!: HTMLParagraphElement;
  private opciones!: HTMLDivElement;
  private veredicto!: HTMLParagraphElement;
  private veredictoQue!: HTMLSpanElement;
  private veredictoSiguiente!: HTMLSpanElement;
  private confirmarBtn!: HTMLButtonElement;
  private reintentarBtn!: HTMLButtonElement;
  private siguienteBtn!: HTMLButtonElement;
  private escucharBtn!: HTMLButtonElement;
  private vozConmutarBtn!: HTMLButtonElement;
  private salirEnlace!: HTMLAnchorElement;
  private avisoLimite!: HTMLParagraphElement;
  private descanso!: HTMLDivElement;
  private descansoTitulo!: HTMLHeadingElement;
  private descansoCuerpo!: HTMLParagraphElement;
  private descansoAfuera!: HTMLParagraphElement;
  private descansoSeguirBtn!: HTMLButtonElement;
  private despedida!: HTMLDivElement;
  private despedidaCuerpo!: HTMLParagraphElement;
  private despedidaRetos!: HTMLParagraphElement;
  private despedidaSalirEnlace!: HTMLAnchorElement;

  constructor(contenedor: HTMLElement, controller: RetoController) {
    this.contenedor = contenedor;
    this.controller = controller;
    this.construir();
    this.suscribir();
  }

  private construir(): void {
    this.contenedor.replaceChildren();
    const r = this.controller.rotulos;

    this.enunciado = document.createElement("p");
    this.enunciado.setAttribute("aria-live", "polite");
    this.enunciado.textContent = r.cargando;
    anexar(this.contenedor, this.enunciado);

    const accionesVoz = document.createElement("div");
    this.escucharBtn = document.createElement("button");
    this.escucharBtn.type = "button";
    this.escucharBtn.textContent = r.escuchar;
    activarConToque(this.escucharBtn, () => this.controller.decir(this.controller.actual?.enunciado ?? "", true));
    this.vozConmutarBtn = document.createElement("button");
    this.vozConmutarBtn.type = "button";
    this.actualizarVozConmutar();
    activarConToque(this.vozConmutarBtn, () => {
      this.controller.alternarVoz();
      this.actualizarVozConmutar();
    });
    anexar(accionesVoz, this.escucharBtn, this.vozConmutarBtn);
    anexar(this.contenedor, accionesVoz);

    this.opciones = document.createElement("div");
    this.opciones.setAttribute("role", "group");
    anexar(this.contenedor, this.opciones);

    this.veredicto = document.createElement("p");
    this.veredicto.hidden = true;
    this.veredicto.setAttribute("aria-live", "polite");
    this.veredictoQue = document.createElement("span");
    this.veredictoSiguiente = document.createElement("span");
    anexar(this.veredicto, this.veredictoQue, document.createTextNode(" "), this.veredictoSiguiente);
    anexar(this.contenedor, this.veredicto);

    const acciones = document.createElement("div");
    this.confirmarBtn = document.createElement("button");
    this.confirmarBtn.type = "button";
    this.confirmarBtn.textContent = r.confirmar;
    this.confirmarBtn.hidden = true;
    activarConToque(this.confirmarBtn, () => this.controller.confirmar());

    this.reintentarBtn = document.createElement("button");
    this.reintentarBtn.type = "button";
    this.reintentarBtn.textContent = r.reintentar;
    this.reintentarBtn.hidden = true;
    activarConToque(this.reintentarBtn, () => this.controller.reintentar());

    this.siguienteBtn = document.createElement("button");
    this.siguienteBtn.type = "button";
    this.siguienteBtn.textContent = r.siguiente;
    this.siguienteBtn.hidden = true;
    activarConToque(this.siguienteBtn, () => this.controller.siguiente());

    this.salirEnlace = document.createElement("a");
    this.salirEnlace.href = this.controller.salirA;
    this.salirEnlace.textContent = r.salir;

    anexar(acciones, this.confirmarBtn, this.reintentarBtn, this.siguienteBtn, this.salirEnlace);
    anexar(this.contenedor, acciones);

    this.avisoLimite = document.createElement("p");
    this.avisoLimite.setAttribute("role", "status");
    this.avisoLimite.hidden = true;
    anexar(this.contenedor, this.avisoLimite);

    this.descanso = document.createElement("div");
    this.descanso.hidden = true;
    this.descanso.setAttribute("role", "dialog");
    this.descansoTitulo = document.createElement("h2");
    this.descansoCuerpo = document.createElement("p");
    this.descansoAfuera = document.createElement("p");
    this.descansoSeguirBtn = document.createElement("button");
    this.descansoSeguirBtn.type = "button";
    this.descanso.setAttribute("aria-labelledby", this.idPara(this.descansoTitulo, "historia-descanso-titulo"));
    anexar(this.descanso, this.descansoTitulo, this.descansoCuerpo, this.descansoAfuera, this.descansoSeguirBtn);
    anexar(this.contenedor, this.descanso);

    this.despedida = document.createElement("div");
    this.despedida.hidden = true;
    this.despedida.setAttribute("role", "dialog");
    this.despedidaCuerpo = document.createElement("p");
    this.despedida.setAttribute("aria-labelledby", this.idPara(this.despedidaCuerpo, "historia-despedida-cuerpo"));
    this.despedidaRetos = document.createElement("p");
    this.despedidaRetos.hidden = true;
    this.despedidaSalirEnlace = document.createElement("a");
    anexar(this.despedida, this.despedidaCuerpo, this.despedidaRetos, this.despedidaSalirEnlace);
    anexar(this.contenedor, this.despedida);
  }

  private idPara(el: HTMLElement, id: string): string {
    el.id = id;
    return id;
  }

  private actualizarVozConmutar(): void {
    const r = this.controller.rotulos;
    this.vozConmutarBtn.textContent = this.controller.vozActivada ? r.vozActivada : r.vozDesactivada;
    this.vozConmutarBtn.setAttribute("aria-pressed", this.controller.vozActivada ? "true" : "false");
  }

  private on(evento: Parameters<RetoController["on"]>[0], fn: (payload?: unknown) => void): void {
    this.desuscribir.push(this.controller.on(evento, fn));
  }

  private suscribir(): void {
    this.on("cargando", () => this.onCargando());
    this.on("item", (item) => this.onItem(item as ItemDeReto));
    this.on("seleccion", (valor) => this.onSeleccion(valor as number | string));
    this.on("veredicto-limpio", () => this.limpiarVeredicto());
    this.on("veredicto", (v) => this.onVeredicto(v as VeredictoDeReto));
    this.on("limite", (l) => this.onLimite(l as LimiteDePantalla));
    this.on("despedida", (l) => this.onDespedida(l as LimiteDePantalla & { hechos: number }));
  }

  private onCargando(): void {
    this.enunciado.textContent = this.controller.rotulos.cargando;
    this.opciones.replaceChildren();
    this.confirmarBtn.hidden = true;
    this.reintentarBtn.hidden = true;
    this.siguienteBtn.hidden = true;
    this.avisoLimite.hidden = true;
    this.limpiarVeredicto();
  }

  private onItem(item: ItemDeReto): void {
    this.enunciado.textContent = item.enunciado;
    this.opciones.setAttribute("aria-labelledby", this.idPara(this.enunciado, "historia-enunciado"));
    this.opciones.replaceChildren();
    for (const o of item.opciones) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.textContent = o.texto;
      activarConToque(b, () => {
        this.controller.elegir(o.valor);
        for (const otro of this.opciones.querySelectorAll("button")) otro.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-pressed", "true");
      });
      anexar(this.opciones, b);
    }
    this.opciones.querySelector("button")?.focus();
  }

  private onSeleccion(_valor: number | string): void {
    this.confirmarBtn.hidden = false;
  }

  private limpiarVeredicto(): void {
    this.veredicto.hidden = true;
    this.veredictoQue.textContent = "";
    this.veredictoSiguiente.textContent = "";
    this.confirmarBtn.hidden = true;
    this.reintentarBtn.hidden = true;
    this.siguienteBtn.hidden = true;
    for (const b of this.opciones.querySelectorAll("button")) (b as HTMLButtonElement).disabled = false;
  }

  private onVeredicto(v: VeredictoDeReto): void {
    for (const b of this.opciones.querySelectorAll("button")) (b as HTMLButtonElement).disabled = true;
    this.confirmarBtn.hidden = true;
    this.veredictoQue.textContent = v.titulo;
    this.veredictoSiguiente.textContent = v.siguienteTexto;
    this.veredicto.hidden = false;
    if (v.ofrecerReintentar) {
      this.reintentarBtn.hidden = false;
      this.siguienteBtn.hidden = false;
      this.reintentarBtn.focus();
    } else {
      this.siguienteBtn.hidden = false;
      this.siguienteBtn.focus();
    }
  }

  private onLimite(l: LimiteDePantalla): void {
    if (l.tipo === "AVISO") {
      this.avisoLimite.textContent = l.textos.cuerpo ?? "";
      this.avisoLimite.hidden = false;
    } else if (l.tipo === "DESCANSO") {
      this.descansoTitulo.textContent = l.textos.titulo ?? "";
      this.descansoCuerpo.textContent = l.textos.cuerpo ?? "";
      this.descansoAfuera.textContent = l.textos.afuera ?? "";
      this.descansoSeguirBtn.textContent = l.textos.seguir ?? "";
      this.descansoSeguirBtn.onclick = null;
      activarConToque(this.descansoSeguirBtn, () => {
        this.descanso.hidden = true;
        this.controller.cerrarDescanso();
        (this.siguienteBtn.hidden ? this.opciones.querySelector("button") : this.siguienteBtn)?.focus();
      });
      this.descanso.hidden = false;
      this.descansoSeguirBtn.focus();
    }
  }

  private onDespedida(l: LimiteDePantalla & { hechos: number }): void {
    this.opciones.replaceChildren();
    this.confirmarBtn.hidden = true;
    this.reintentarBtn.hidden = true;
    this.siguienteBtn.hidden = true;
    this.enunciado.textContent = "";
    this.despedidaCuerpo.textContent = l.textos.cuerpo ?? "";
    const r = this.controller.rotulos;
    const plantilla = l.hechos === 1 ? l.textos.retosUno : l.textos.retosOtros;
    if (plantilla && l.hechos > 0) {
      this.despedidaRetos.textContent = plantilla.replace("{n}", String(l.hechos));
      this.despedidaRetos.hidden = false;
    } else {
      this.despedidaRetos.hidden = true;
    }
    this.despedidaSalirEnlace.textContent = l.textos.salir || r.salir;
    this.despedidaSalirEnlace.href = this.controller.salirA;
    this.despedida.hidden = false;
    this.despedidaSalirEnlace.focus();
  }

  destruir(): void {
    this.desuscribir.forEach((f) => f());
    this.contenedor.replaceChildren();
  }
}
