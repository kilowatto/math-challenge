/**
 * ProgressManager — envuelve `game.registry`, nunca es una fuente de verdad.
 *
 * ─── Por qué NO es un singleton con `localStorage` (D-184) ──────────────────
 *
 * La especificación original de Modo Historia pedía un singleton que guardara
 * progreso en `localStorage`/IndexedDB. Este producto YA tiene una fuente de
 * verdad para el progreso — D1 y los Durable Objects de F4 (`skill_state` vía
 * `Aprendiz`) — leída del lado del servidor exactamente como hace
 * `kids/mapa.astro` hoy para KINDER. Un segundo almacén en el cliente sería la
 * misma segunda-fuente-de-verdad que el encabezado de
 * `packages/motor/src/mapa.ts` prohíbe para el propio módulo del mapa (#231):
 * un padre vería «dominado» en el mapa de Phaser y al niño fallando la misma
 * habilidad en el reto, sin que nada avisara la divergencia.
 *
 * Este archivo, entonces, es deliberadamente delgado: recibe el árbol YA
 * calculado por el servidor (`entradasDelArbol()` + `construirArbol()`, leídos
 * en `kids/mapa.astro`) y lo expone al resto de las escenas vía
 * `game.registry`, que es el mecanismo de Phaser para eventos/datos
 * compartidos entre escenas sin variables globales sueltas — el requisito
 * explícito de la tarea.
 *
 * Lo único efímero que SÍ vive aquí, y nunca se persiste entre sesiones: el
 * nivel cualitativo elegido en `ChallengeScene` (D-183) para la ronda que se
 * está por jugar. Se manda al servidor en la URL de salida
 * (`destinoDeNodo()`) y desaparece — igual que hoy en `/app/practicar/`, que
 * tampoco recuerda el nivel de una sesión a la siguiente.
 */
import type Phaser from "phaser";
import type { Arbol, GrupoDelArbol, NodoDelArbol } from "../../../../../packages/motor/src/mapa.ts";
import type { RotulosDeReto } from "../reto/RetoController";
import type { ModoDeNodo } from "../objects/LevelNode";

export const REGISTRY_ARBOL = "historia:arbol";
export const REGISTRY_MODO = "historia:modo";
export const REGISTRY_LOCALE = "historia:locale";
export const REGISTRY_NIVEL_ELEGIDO = "historia:nivelElegido";
/** ¿Esta persona puede elegir nivel? Ya decidido por el SERVIDOR (D-183). */
export const REGISTRY_PUEDE_ELEGIR_NIVEL = "historia:puedeElegirNivel";
export const REGISTRY_ROTULOS = "historia:rotulos";
export const REGISTRY_ROTULOS_RETO = "historia:rotulosReto";
export const REGISTRY_ETIQUETA_VOZ = "historia:etiquetaVoz";
export const REGISTRY_SALIR_A = "historia:salirA";
export const REGISTRY_RUTA_RETOS = "historia:rutaRetos";

/**
 * Los textos, YA RESUELTOS por el locale de la página — mismo patrón que
 * `rotulos` en `Pantalla.astro`. Ninguna escena de Phaser importa JSON de
 * i18n ni escribe un string en español a mano: D-022 exige los siete
 * locales, y una cadena fija en una escena es exactamente el bug que
 * `audits/locales-complete.mjs` no puede ver (no es un archivo `.astro` ni
 * `.json`).
 */
export interface RotulosDeHistoria {
  eligeNivel: string;
  nivelFacil: string;
  nivelMedio: string;
  nivelDificil: string;
  jugar: string;
  /** D-190: los dos botones de MenuScene — solo se pintan en modo "camino". */
  menuHistoria: string;
  menuRetos: string;
}

export interface DatosDeArranque {
  arbol: Arbol;
  /**
   * D-190: qué dibuja `LevelNode` — "camino" (tronco+secuencia+candado, para
   * KINDER/PRIMARIA) o "arbol" (el círculo de siempre, sin número ni
   * candado, para SECUNDARIA). Lo decide la página server-side a partir de
   * la banda REAL (D1) — nunca esta escena adivinándolo de otro dato.
   */
  modo: ModoDeNodo;
  locale: string;
  puedeElegirNivel: boolean;
  rotulos: RotulosDeHistoria;
  /** Los mismos rótulos que ya usa `Pantalla.astro` para el reto (juego.*). */
  rotulosReto: RotulosDeReto;
  /** BCP-47 ya resuelto por `ETIQUETA_DE_VOZ` (D-078) — nunca calculado aquí. */
  etiquetaVoz: string;
  /** A dónde vuelve un `401` de sesión caducada — nunca un formulario (línea roja #2). */
  salirA: string;
  /** D-190: a dónde lleva el botón "Retos" de MenuScene. `undefined` en modo "arbol". */
  rutaRetos?: string;
}

export class ProgressManager {
  private readonly registry: Phaser.Data.DataManager;

  constructor(registry: Phaser.Data.DataManager, datos: DatosDeArranque) {
    this.registry = registry;
    this.registry.set(REGISTRY_ARBOL, datos.arbol);
    this.registry.set(REGISTRY_MODO, datos.modo);
    this.registry.set(REGISTRY_LOCALE, datos.locale);
    this.registry.set(REGISTRY_PUEDE_ELEGIR_NIVEL, datos.puedeElegirNivel);
    this.registry.set(REGISTRY_NIVEL_ELEGIDO, null);
    this.registry.set(REGISTRY_ROTULOS, datos.rotulos);
    this.registry.set(REGISTRY_ROTULOS_RETO, datos.rotulosReto);
    this.registry.set(REGISTRY_ETIQUETA_VOZ, datos.etiquetaVoz);
    this.registry.set(REGISTRY_SALIR_A, datos.salirA);
    this.registry.set(REGISTRY_RUTA_RETOS, datos.rutaRetos ?? null);
  }

  get grupos(): readonly GrupoDelArbol[] {
    return (this.registry.get(REGISTRY_ARBOL) as Arbol).grupos;
  }

  /** D-190: "camino" (KINDER/PRIMARIA) o "arbol" (SECUNDARIA). Ver LevelNode.ts. */
  get modo(): ModoDeNodo {
    return this.registry.get(REGISTRY_MODO) as ModoDeNodo;
  }

  get locale(): string {
    return this.registry.get(REGISTRY_LOCALE) as string;
  }

  get puedeElegirNivel(): boolean {
    return Boolean(this.registry.get(REGISTRY_PUEDE_ELEGIR_NIVEL));
  }

  get rotulos(): RotulosDeHistoria {
    return this.registry.get(REGISTRY_ROTULOS) as RotulosDeHistoria;
  }

  get rotulosReto(): RotulosDeReto {
    return this.registry.get(REGISTRY_ROTULOS_RETO) as RotulosDeReto;
  }

  get etiquetaVoz(): string {
    return this.registry.get(REGISTRY_ETIQUETA_VOZ) as string;
  }

  get salirA(): string {
    return this.registry.get(REGISTRY_SALIR_A) as string;
  }

  get rutaRetos(): string | null {
    return this.registry.get(REGISTRY_RUTA_RETOS) as string | null;
  }

  buscarNodo(habilidad: string): NodoDelArbol | null {
    for (const grupo of this.grupos) {
      const nodo = grupo.nodos.find((n) => n.habilidad === habilidad);
      if (nodo) return nodo;
    }
    return null;
  }

  elegirNivel(nivel: "facil" | "medio" | "dificil" | null): void {
    this.registry.set(REGISTRY_NIVEL_ELEGIDO, nivel);
  }

  get nivelElegido(): "facil" | "medio" | "dificil" | null {
    return this.registry.get(REGISTRY_NIVEL_ELEGIDO) as "facil" | "medio" | "dificil" | null;
  }
}
