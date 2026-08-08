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
];

export const capituloPorId = (id: string): WorldChapter | null =>
  CAPITULOS.find((c) => c.id === id) ?? null;
