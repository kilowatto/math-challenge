/**
 * assets-manifest.ts — la lista única de TODO lo que carga Phaser en la app
 * de niño (D-200).
 *
 * ─── Por qué existe ──────────────────────────────────────────────────────
 *
 * Hasta hoy, `QuienJuegaScene.preload()` y `PreloadScene.preload()` (Modo
 * Historia) cada una tenía su PROPIA lista de imágenes/audio, escrita a
 * mano. Son dos `Phaser.Game` separados (páginas distintas, D-192) que
 * comparten algunos archivos (`letrero-madera`, `fondo-primaria-1`,
 * `musica-calma`) — el dueño notó en vivo que el "loader" aparecía tarde,
 * al entrar al mapa, en vez de temprano, al entrar a "¿quién juega?": la
 * causa real es que cada página descubre SUS PROPIOS archivos nuevos en
 * el momento en que los necesita, nunca antes.
 *
 * `CargaGlobalScene.ts` usa esta lista completa (`TODAS_LAS_IMAGENES` +
 * `TODOS_LOS_AUDIOS`) para precargar TODO de una sola vez, la primera vez
 * que el niño toca la app — así, cuando llega al mapa minutos después, el
 * service worker (`public/sw.js`, estrategia "Estático" ya existente, sin
 * cambios) ya tiene esos archivos en caché y los sirve al instante.
 *
 * Este archivo es la única fuente de verdad: `QuienJuegaScene.preload()` y
 * `PreloadScene.preload()` importan de aquí en vez de repetir rutas a
 * mano, para que un archivo nuevo agregado a una escena JAMÁS quede fuera
 * del precargador global por descuido.
 */
import { LARRY_FOTO_CLAVES } from "./objects/LarryFotorrealista";
import { TODOS_LOS_ANIMALES, claveDeAnimal } from "../lib/avatares-animal";

export interface Activo {
  clave: string;
  url: string;
}

/**
 * D-199, ronda 5: el letrero de "¿Quién juega?" tallado por locale — ver
 * `scripts/gen-letrero-quien-juega.mjs`. es-MX/es-ES comparten un archivo.
 */
const CLAVES_LETRERO_LOCALE = [
  "letrero-quien-juega-en",
  "letrero-quien-juega-es",
  "letrero-quien-juega-fr-FR",
  "letrero-quien-juega-pt-BR",
  "letrero-quien-juega-pt-PT",
  "letrero-quien-juega-de-DE",
];

const CANTIDAD_VARIANTES_ENGRANE = 5;

/** Lo que `QuienJuegaScene.ts` necesita — ver su `preload()`. */
export const IMAGENES_QUIEN_JUEGA: Activo[] = [
  { clave: "fondo-primaria-1", url: "/juego/fondo-primaria-1.webp" },
  { clave: "letrero-madera", url: "/juego/letrero-madera.webp" },
  ...CLAVES_LETRERO_LOCALE.map((clave) => ({ clave, url: `/juego/${clave}.webp` })),
  { clave: "flecha-madera", url: "/juego/flecha-madera.webp" },
  ...Array.from({ length: CANTIDAD_VARIANTES_ENGRANE }, (_, i) => ({
    clave: `engrane-madera-${i + 1}`,
    url: `/juego/engrane-madera-${i + 1}.webp`,
  })),
  ...LARRY_FOTO_CLAVES.map((clave) => ({ clave, url: `/mapa/${clave}.webp` })),
  ...TODOS_LOS_ANIMALES.map((id) => {
    const clave = claveDeAnimal(id);
    return { clave, url: `/avatares/${clave}.webp` };
  }),
];

/** Lo que `PreloadScene.ts` necesita — Modo Historia (mapa Y reto, D-200: `GameplayScene` no carga nada propio, reusa este mismo cargador). */
export const IMAGENES_MODO_HISTORIA: Activo[] = [
  { clave: "fondo-primaria-1", url: "/juego/fondo-primaria-1.webp" },
  { clave: "arbusto-a", url: "/juego/arbusto-a.webp" },
  { clave: "arbusto-b", url: "/juego/arbusto-b.webp" },
  { clave: "helecho-a", url: "/juego/helecho-a.webp" },
  { clave: "letrero-madera", url: "/juego/letrero-madera.webp" },
  { clave: "tronco-a", url: "/juego/tronco-a.webp" },
  { clave: "tronco-b", url: "/juego/tronco-b.webp" },
  { clave: "candado", url: "/juego/candado.webp" },
  { clave: "fondo-desierto-1", url: "/juego/fondo-desierto-1.webp" },
  { clave: "cactus-b", url: "/juego/cactus-b.webp" },
  { clave: "roca-desierto", url: "/juego/roca-desierto.webp" },
  // Mundo Kinder multi-bioma (#34): el piloto de "toca_para_reventar"
  // (tap-to-pop, GameplayScene.ts) — solo las de Desierto, el único bioma
  // real hoy. Las de los otros 3 biomas se agregan cuando ellos existan.
  { clave: "burbuja-desierto", url: "/juego/burbuja-desierto.webp" },
  { clave: "burbuja-pop-desierto", url: "/juego/burbuja-pop-desierto.webp" },
  { clave: "fondo-nieve-1", url: "/juego/fondo-nieve-1.webp" },
  { clave: "pino-nevado", url: "/juego/pino-nevado.webp" },
  { clave: "roca-nieve", url: "/juego/roca-nieve.webp" },
  { clave: "cristal-hielo", url: "/juego/cristal-hielo.webp" },
  { clave: "larry_camina_1", url: "/mapa/larry_camina_1.webp" },
  { clave: "larry_camina_2", url: "/mapa/larry_camina_2.webp" },
  { clave: "larry_camina_3", url: "/mapa/larry_camina_3.webp" },
  { clave: "larry_camina_4", url: "/mapa/larry_camina_4.webp" },
  { clave: "larry_festejo", url: "/mapa/larry_festejo.webp" },
  { clave: "larry_menu_aplaude", url: "/mapa/larry_menu_aplaude.webp" },
  { clave: "larry_idle_1", url: "/mapa/larry_idle_1.webp" },
  { clave: "larry_idle_2", url: "/mapa/larry_idle_2.webp" },
];

/**
 * Audio de "¿Quién juega?" — solo lo que ESTA pantalla puede llegar a
 * reproducir. `musica-energia`/`sfx-acierto`/`sfx-error` son del RETO
 * (Modo Historia) y pesan ~700 KB la pista de música — cargarlos aquí
 * sería bajar peso que esta pantalla nunca usa (mc-47 §5).
 */
export const AUDIOS_QUIEN_JUEGA: Activo[] = [
  { clave: "musica-calma", url: "/juego/musica-calma.mp3" },
  { clave: "sfx-toque", url: "/juego/sfx-toque.mp3" },
  { clave: "sfx-panel-abre", url: "/juego/sfx-panel-abre.mp3" },
  { clave: "sfx-panel-cierra", url: "/juego/sfx-panel-cierra.mp3" },
];

/** Audio de Modo Historia (mapa + reto) — ver `PreloadScene.ts`. */
export const AUDIOS_MODO_HISTORIA: Activo[] = [
  { clave: "musica-calma", url: "/juego/musica-calma.mp3" },
  { clave: "musica-energia", url: "/juego/musica-energia.mp3" },
  { clave: "sfx-toque", url: "/juego/sfx-toque.mp3" },
  { clave: "sfx-acierto", url: "/juego/sfx-acierto.mp3" },
  { clave: "sfx-error", url: "/juego/sfx-error.mp3" },
];

function dedupeAudios(lista: Activo[]): Activo[] {
  const vistos = new Map<string, Activo>();
  for (const activo of lista) vistos.set(activo.clave, activo);
  return [...vistos.values()];
}

/** La unión completa de audio — lo que `CargaGlobalScene` precarga de una sola vez. */
export const TODOS_LOS_AUDIOS: Activo[] = dedupeAudios([...AUDIOS_QUIEN_JUEGA, ...AUDIOS_MODO_HISTORIA]);

function dedupePorClave(lista: Activo[]): Activo[] {
  const vistos = new Map<string, Activo>();
  for (const activo of lista) vistos.set(activo.clave, activo);
  return [...vistos.values()];
}

/** La unión completa — lo que `CargaGlobalScene` precarga de una sola vez. */
export const TODAS_LAS_IMAGENES: Activo[] = dedupePorClave([...IMAGENES_QUIEN_JUEGA, ...IMAGENES_MODO_HISTORIA]);
