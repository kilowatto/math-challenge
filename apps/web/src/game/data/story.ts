/**
 * Modo Historia — los datos de CAPÍTULO (D-184).
 *
 * ─── Lo que este archivo NO contiene, a propósito ───────────────────────────
 *
 * Ningún nodo de nivel. `packages/motor/src/mapa.ts::construirArbol()` ya
 * decide qué habilidades existen y en qué grupo caen, a partir del progreso
 * REAL del niño (F4) — inventar aquí una lista paralela de nodos con
 * `starsEarned`/`unlocked` propios sería exactamente la segunda fuente de
 * verdad que el encabezado de `mapa.ts` prohíbe (#231): dos copias del
 * progreso no divergen con un error, divergen en silencio.
 *
 * Lo que SÍ vive aquí es lo que un `WorldChapter` es de verdad: la piel
 * visual — el camino, dónde crece la vegetación, qué música suena — que no
 * cambia según quién juegue. `MapScene` combina esto con el árbol real en
 * tiempo de ejecución (ver `distribuirNodos()` en `MapScene.ts`).
 *
 * ─── De dónde salen las claves de arte (D-186) ──────────────────────────────
 *
 * `backgroundKey` y las claves de `VegetationLayerConfig` son CLAVES, no
 * rutas: `PreloadScene` las carga desde `apps/web/public/juego/*.webp`
 * (ilustraciones de Recraft, `scripts/gen-mapa-historia.mjs`). Este archivo
 * no sabe ni le importa si detrás de una clave hay un PNG cargado o —como
 * `"avatar-marca"`, todavía— un dibujo procedural de `BootScene`: cambiar
 * de uno a otro nunca toca `story.ts` ni `MapScene.ts`.
 */

export type PerformanceTier = "cerca" | "lejos";

export interface VegetationLayerConfig {
  /** Clave de textura procedural (generada en BootScene). */
  key: string;
  count: number;
  depth: number;
  xRange: readonly [number, number];
  yRange: readonly [number, number];
  scaleRange: readonly [number, number];
  /**
   * "cerca" = Tween completo por instancia. "lejos" = seno calculado a mano en
   * `update()`, más barato en un Android de gama baja con muchos elementos
   * (ver el encabezado de `VegetationManager.ts`).
   */
  tier: PerformanceTier;
}

export interface WorldChapter {
  id: string;
  /** Ya resuelto por el locale de la página — igual que `rotulos` en Pantalla.astro. */
  name: string;
  backgroundKey: string;
  /** Puntos de control del camino. `MapScene` construye el spline desde aquí. */
  pathData: readonly { x: number; y: number }[];
  vegetationLayers: readonly VegetationLayerConfig[];
  /** `null` = sin música autorada todavía. Nunca se inventa un archivo. */
  musicKey: string | null;
  worldWidth: number;
  worldHeight: number;
}

/**
 * El primer capítulo: PRIMARIA, sobre las cuatro habilidades reales del banco
 * (P01-P04, F5c). El nombre y el fondo son un placeholder de lanzamiento, no
 * una decisión de arte — cámbialo desde aquí, nunca desde `MapScene.ts`
 * (ver `README-modo-historia.md`).
 */
export const CAPITULOS: readonly WorldChapter[] = [
  {
    id: "primaria-1",
    name: "El río de los números",
    backgroundKey: "fondo-primaria-1",
    // 1000, no 720 (D-187): con arte real, `worldWidth` deja de ser solo el
    // ancho del camino — es también el ancho del fondo ilustrado. `.mapa-kids`
    // permite hasta 60rem (960px) de contenedor; 720 dejaba una franja del
    // color de espera visible a los lados en pantallas anchas. El camino se
    // corrió +140 en X para seguir centrado.
    worldWidth: 1000,
    worldHeight: 2400,
    pathData: [
      { x: 500, y: 2320 },
      { x: 340, y: 2000 },
      { x: 660, y: 1700 },
      { x: 400, y: 1380 },
      { x: 640, y: 1060 },
      { x: 360, y: 760 },
      { x: 560, y: 420 },
      { x: 500, y: 120 },
    ],
    vegetationLayers: [
      {
        key: "arbusto-a",
        count: 12,
        depth: 3,
        xRange: [40, 960],
        yRange: [100, 2350],
        scaleRange: [0.8, 1.2],
        tier: "cerca",
      },
      {
        key: "arbusto-b",
        count: 10,
        depth: 3,
        xRange: [40, 960],
        yRange: [100, 2350],
        scaleRange: [0.6, 0.9],
        tier: "cerca",
      },
      {
        key: "helecho-a",
        count: 16,
        depth: 6,
        xRange: [20, 980],
        yRange: [100, 2350],
        scaleRange: [0.5, 0.8],
        tier: "lejos",
      },
    ],
    musicKey: null,
  },
  /**
   * D-190: el "Mundo Kinder" multi-bioma del video de referencia. Estos dos
   * capítulos existen y cargan su arte real (`scripts/gen-mapa-historia.mjs`)
   * pero TODAVÍA no son alcanzables desde el juego — nada llama a
   * `MapScene` con `chapterId: "desierto-1"` ni `"nieve-1"` hasta que exista
   * el enlace entre capítulos (`MenuScene`/selector de mundo, fase
   * posterior). Se agregan aquí primero, y se precargan en
   * `PreloadScene.ts`, para que el arte quede revisado y listo sin bloquear
   * su propia fase en la del enlace de navegación.
   *
   * Falta un tercer capítulo de costa/océano: el fondo se intentó tres veces
   * con Recraft y las tres veces coló gente, casas, veleros o un faro pese a
   * las exclusiones explícitas — más terco que bosque/desierto/nieve. Queda
   * pendiente para una sesión de generación aparte, no se fuerza un fondo
   * que no pasó revisión.
   */
  {
    id: "desierto-1",
    name: "Las dunas de arena",
    backgroundKey: "fondo-desierto-1",
    worldWidth: 1000,
    worldHeight: 2400,
    /**
     * Mundo Kinder multi-bioma (#34, plan §4.2): el sendero de arena que
     * YA está dibujado en `fondo-desierto-1.webp` — no un río heredado de
     * `primaria-1` (era literalmente el mismo arreglo de puntos, nunca
     * rediseñado). Trazado leyendo el archivo real: 15 puntos de control
     * siguiendo el camino claro y arenoso de la ilustración (una curva en
     * "S" entre las palmeras de abajo y las dunas lejanas), con los
     * últimos 2 puntos extendidos sobre la cresta de la duna más lejana
     * —donde el camino se difumina en la ilustración— para llegar cerca
     * de la cima del mundo, igual que `primaria-1`.
     *
     * Conversión: la imagen nativa es 800×1600px; `worldWidth`/`worldHeight`
     * (1000×2400) la estiran con factores DISTINTOS en x (×1.25) e y
     * (×1.5) — `MapScene.ts` usa `setDisplaySize()`, que no conserva el
     * aspecto. Cada punto de abajo es su coordenada nativa multiplicada
     * por esos factores, verificado dibujando los puntos SOBRE la imagen
     * real antes de darlos por buenos (nunca a ciegas).
     */
    pathData: [
      { x: 425, y: 2325 },
      { x: 500, y: 2205 },
      { x: 600, y: 2100 },
      { x: 750, y: 1950 },
      { x: 694, y: 1800 },
      { x: 525, y: 1650 },
      { x: 425, y: 1500 },
      { x: 488, y: 1275 },
      { x: 600, y: 1125 },
      { x: 700, y: 1020 },
      { x: 575, y: 870 },
      { x: 500, y: 705 },
      { x: 413, y: 570 },
      { x: 350, y: 375 },
      { x: 400, y: 150 },
    ],
    vegetationLayers: [
      {
        key: "cactus-b",
        count: 10,
        depth: 3,
        xRange: [40, 960],
        yRange: [100, 2350],
        scaleRange: [0.7, 1.1],
        tier: "cerca",
      },
      {
        key: "roca-desierto",
        count: 14,
        depth: 4,
        xRange: [20, 980],
        yRange: [100, 2350],
        scaleRange: [0.6, 1],
        tier: "lejos",
      },
    ],
    musicKey: null,
  },
  {
    id: "nieve-1",
    name: "Las montañas nevadas",
    backgroundKey: "fondo-nieve-1",
    worldWidth: 1000,
    worldHeight: 2400,
    pathData: [
      { x: 500, y: 2320 },
      { x: 340, y: 2000 },
      { x: 660, y: 1700 },
      { x: 400, y: 1380 },
      { x: 640, y: 1060 },
      { x: 360, y: 760 },
      { x: 560, y: 420 },
      { x: 500, y: 120 },
    ],
    vegetationLayers: [
      {
        key: "pino-nevado",
        count: 12,
        depth: 3,
        xRange: [40, 960],
        yRange: [100, 2350],
        scaleRange: [0.8, 1.2],
        tier: "cerca",
      },
      {
        key: "roca-nieve",
        count: 8,
        depth: 4,
        xRange: [20, 980],
        yRange: [100, 2350],
        scaleRange: [0.6, 1],
        tier: "lejos",
      },
      {
        key: "cristal-hielo",
        count: 10,
        depth: 6,
        xRange: [20, 980],
        yRange: [100, 2350],
        scaleRange: [0.5, 0.8],
        tier: "lejos",
      },
    ],
    musicKey: null,
  },
];

export const capituloPorId = (id: string): WorldChapter | null =>
  CAPITULOS.find((c) => c.id === id) ?? null;
