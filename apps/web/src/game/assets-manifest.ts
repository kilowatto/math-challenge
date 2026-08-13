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
import { CATALOGO } from "../../../../packages/motor/src/pin-imagenes";
import { CLAVES_ATREZO_PIN, clavePinDibujo, urlPinDibujo } from "./pin-dibujos";

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

  // ─── PIN screen (D-201) ─────────────────────────────────────────────────
  //
  // Derived from CATALOGO instead of listed by hand: the engine decides which
  // 24 drawings exist, and a 25th added there would otherwise ship without art
  // and leave an empty cell in some child's grid (the shuffle is per-child, so
  // it would break for SOME profiles only). audits/pin-arte-completo.mjs ties
  // the two lists.
  ...CATALOGO.map((id) => ({ clave: clavePinDibujo(id), url: urlPinDibujo(id) })),
  { clave: "pin-imagenes-fondo", url: "/juego/pin-imagenes-fondo.webp" },
  // Background for the KINDER image-grid PIN — its own scene, distinct from
  // the numeric keypad's gate (pin-numerico-fondo). Generated for the HTML
  // version and unused since; PinScene now picks it per branch.
  // Wooden props for both PIN branches — sign, tile, hanging frame and the ten
  // carved digits in their normal and pressed states (D-197.1). Reused as-is by
  // PinScene; nothing here was regenerated for Phaser.
  ...CLAVES_ATREZO_PIN.map((clave) => ({ clave, url: `/juego/${clave}.webp` })),
];

/** Lo que `PreloadScene.ts` necesita — Modo Historia (mapa Y reto, D-200: `GameplayScene` no carga nada propio, reusa este mismo cargador). */
export const IMAGENES_MODO_HISTORIA: Activo[] = [
  { clave: "fondo-primaria-1", url: "/juego/fondo-primaria-1.webp" },
  // `RetosScene` (D-201, migración de `kids/retos.astro`) es la primera
  // escena de Modo Historia que usa `FlechaAtras` — hasta hoy esa imagen
  // solo vivía en `IMAGENES_QUIEN_JUEGA`. En la SPA fusionada (D-200/D-201)
  // ya estaba cargada de todos modos, pero `PreloadScene` (la entrada FRÍA
  // a `/mapa/`, sin pasar por la rejilla) no la traía — encontrado
  // probando `RetosScene` en un simulador real, no leyendo el código.
  { clave: "flecha-madera", url: "/juego/flecha-madera.webp" },
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

  // ─── Costa bioma — vegetation only, background still pending ───────────
  //
  // There is no `fondo-costa-1` entry here. A file with that name landed in
  // #534 alongside these props, but it never passed review — see
  // `apps/web/src/game/data/story.ts:129`: Recraft let people, houses,
  // sailboats or a lighthouse slip in three times despite explicit
  // exclusions, and the comment there says on purpose not to force a
  // background that failed review. The stray file was deleted 2026-08-12;
  // these three props stay, ready for whichever background eventually
  // passes.
  { clave: "palmera", url: "/juego/palmera.webp" },
  // Vegetation prop for Costa — a single palm tree, cutout with alpha,
  // decoration layer (VegetationLayerConfig).
  { clave: "roca-costa", url: "/juego/roca-costa.webp" },
  // Vegetation prop for Costa — a smooth beach rock, decoration layer.
  { clave: "concha", url: "/juego/concha.webp" },
  // Vegetation prop for Costa — a seashell, decoration layer.

  // ─── Stepping-stone material, per bioma ─────────────────────────────────
  { clave: "roca-arenisca-tronco", url: "/juego/roca-arenisca-tronco.webp" },
  // Stepping-stone material for the Desierto path — replaces wood
  // tronco-a/tronco-b, which looks out of place on sand. Clean top surface,
  // Phaser paints the sequence number on top, never baked in.
  { clave: "bloque-nieve-tronco", url: "/juego/bloque-nieve-tronco.webp" },
  // Stepping-stone material for the Nieve path — frost-covered stone, same
  // convention as roca-arenisca-tronco.

  // ─── World-object mechanics, per bioma ──────────────────────────────────
  //
  // Seven pieces × four biomas. Desierto's burbuja/burbuja-pop are already
  // listed above (the tap-to-pop pilot); everything else lands here.
  //
  // Each row is the SAME interaction wearing a different bioma skin, so a
  // skill assigned a mechanic works in any chapter without new code — that is
  // the whole point of keeping content free of a bioma dimension
  // (packages/motor/src/mapa.ts, #231).
  { clave: "burbuja-sabana", url: "/juego/burbuja-sabana.webp" },
  { clave: "burbuja-nieve", url: "/juego/burbuja-nieve.webp" },
  { clave: "burbuja-costa", url: "/juego/burbuja-costa.webp" },
  // Tap-to-pop mechanic, resting state — reusable for any kinder skill
  // assigned this mechanic (K01, K02, K03, K11, K12). Bioma skin of the same
  // interaction as burbuja-desierto.
  { clave: "burbuja-pop-sabana", url: "/juego/burbuja-pop-sabana.webp" },
  { clave: "burbuja-pop-nieve", url: "/juego/burbuja-pop-nieve.webp" },
  { clave: "burbuja-pop-costa", url: "/juego/burbuja-pop-costa.webp" },
  // Tap-to-pop mechanic, popped state — plays right after the matching
  // burbuja-* above is tapped correctly.
  { clave: "ficha-conteo-sabana", url: "/juego/ficha-conteo-sabana.webp" },
  { clave: "ficha-conteo-desierto", url: "/juego/ficha-conteo-desierto.webp" },
  { clave: "ficha-conteo-nieve", url: "/juego/ficha-conteo-nieve.webp" },
  { clave: "ficha-conteo-costa", url: "/juego/ficha-conteo-costa.webp" },
  // Tap-in-sequence mechanic (K03, K06) — a small token that appears with each
  // tap, one per counted item.
  { clave: "objeto-saltarin-sabana", url: "/juego/objeto-saltarin-sabana.webp" },
  { clave: "objeto-saltarin-desierto", url: "/juego/objeto-saltarin-desierto.webp" },
  { clave: "objeto-saltarin-nieve", url: "/juego/objeto-saltarin-nieve.webp" },
  { clave: "objeto-saltarin-costa", url: "/juego/objeto-saltarin-costa.webp" },
  // Tap origin→destination mechanic — the object that visually jumps between
  // ZonaDestino markers (K05, K09, K10, K12).
  { clave: "indicador-movil-sabana", url: "/juego/indicador-movil-sabana.webp" },
  { clave: "indicador-movil-desierto", url: "/juego/indicador-movil-desierto.webp" },
  { clave: "indicador-movil-nieve", url: "/juego/indicador-movil-nieve.webp" },
  { clave: "indicador-movil-costa", url: "/juego/indicador-movil-costa.webp" },
  // Swipe-with-snap mechanic (K08, K14) — the slider knob/bead that moves
  // along RielCarril (code-drawn track, apps/web/src/game/objects/RielCarril.ts).
  { clave: "canasta-clasificar-sabana", url: "/juego/canasta-clasificar-sabana.webp" },
  { clave: "canasta-clasificar-desierto", url: "/juego/canasta-clasificar-desierto.webp" },
  { clave: "canasta-clasificar-nieve", url: "/juego/canasta-clasificar-nieve.webp" },
  { clave: "canasta-clasificar-costa", url: "/juego/canasta-clasificar-costa.webp" },
  // Tap-to-sort mechanic, container A (K07, K13) — one of two visually
  // distinct containers a child sorts items into.
  { clave: "canasta-b-sabana", url: "/juego/canasta-b-sabana.webp" },
  { clave: "canasta-b-desierto", url: "/juego/canasta-b-desierto.webp" },
  { clave: "canasta-b-nieve", url: "/juego/canasta-b-nieve.webp" },
  { clave: "canasta-b-costa", url: "/juego/canasta-b-costa.webp" },
  // Tap-to-sort mechanic, container B — the second, visually distinct
  // container (a bowl, not a basket).
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

  // ─── Interaction-texture SFX (19) ───────────────────────────────────────
  //
  // The sound of HOW something was touched, not of whether it was right. The
  // five event SFX (sfx-toque/acierto/error/panel-abre/panel-cierra) are a
  // different layer and stay exactly as they are — these never replace them.
  { clave: "sfx-elegir", url: "/juego/sfx-elegir.mp3" },
  // Interaction-texture SFX for the toca_la_respuesta format — a decisive
  // selection click, distinct from the generic sfx-toque.
  { clave: "sfx-contar-toque", url: "/juego/sfx-contar-toque.mp3" },
  // Interaction-texture SFX for toca_para_contar — a soft counting tap, meant
  // to repeat quickly in a row.
  { clave: "sfx-destello", url: "/juego/sfx-destello.mp3" },
  // Interaction-texture SFX for flash — a quick shimmer when the dot flash
  // appears.
  { clave: "sfx-casilla", url: "/juego/sfx-casilla.mp3" },
  // Interaction-texture SFX for arma_el_numero — filling a ten-frame cell.
  { clave: "sfx-descartar", url: "/juego/sfx-descartar.mp3" },
  // Interaction-texture SFX for cual_sobra — setting aside the odd-one-out,
  // neutral tone.
  { clave: "sfx-ficha-conteo", url: "/juego/sfx-ficha-conteo.mp3" },
  // Interaction-texture SFX for the tap-in-sequence mechanic — a token/bead drop.
  { clave: "sfx-burbuja-pop", url: "/juego/sfx-burbuja-pop.mp3" },
  // Interaction-texture SFX for tap-to-pop — a bubble pop.
  { clave: "sfx-salto", url: "/juego/sfx-salto.mp3" },
  // Interaction-texture SFX for tap origin→destination — a short hop/bounce.
  { clave: "sfx-snap", url: "/juego/sfx-snap.mp3" },
  // Interaction-texture SFX for swipe-with-snap — the slider locking into a notch.
  { clave: "sfx-comparar", url: "/juego/sfx-comparar.mp3" },
  // Interaction-texture SFX for comparar-y-tocar — the comparison frame appearing.
  { clave: "sfx-clasificar", url: "/juego/sfx-clasificar.mp3" },
  // Interaction-texture SFX for tap-to-sort — dropping an item into a container.
  { clave: "sfx-voltear", url: "/juego/sfx-voltear.mp3" },
  // Interaction-texture SFX for match-tap-de-pares — a card flip.
  { clave: "sfx-pulso", url: "/juego/sfx-pulso.mp3" },
  // Interaction-texture SFX for tap-to-beat — one rhythmic pulse.
  { clave: "sfx-progreso", url: "/juego/sfx-progreso.mp3" },
  // Interaction-texture SFX for tap-hasta-objetivo — one tick of the gauge filling.
  { clave: "sfx-trazo", url: "/juego/sfx-trazo.mp3" },
  // Interaction-texture SFX for trazado guiado — a gliding whoosh while tracing.
  { clave: "sfx-pista", url: "/juego/sfx-pista.mp3" },
  // Interaction-texture SFX for the optional hint — a gentle chime when a hint
  // appears.
  { clave: "sfx-fusion", url: "/juego/sfx-fusion.mp3" },
  // Interaction-texture SFX for tap-para-fusionar — two values combining.
  { clave: "sfx-incremento", url: "/juego/sfx-incremento.mp3" },
  // Interaction-texture SFX for the two-point positional-value mechanic — a
  // double tick, second pitch higher.
  { clave: "sfx-blanco", url: "/juego/sfx-blanco.mp3" },
  // Interaction-texture SFX for tap-a-blanco-en-movimiento — a lock-on catch sound.

  // ─── Background music, per bioma (8) ────────────────────────────────────
  //
  // Background music for the {bioma} chapter — "calma" plays on map/menu,
  // "energia" plays while solving a challenge. NOTE: MusicManager.reproducir()
  // needs a bioma param, not just a mood, to pick the right pair — until it
  // has one, the universal musica-calma/musica-energia below are still what
  // actually plays, and these eight are loaded but unused.
  { clave: "musica-sabana-calma", url: "/juego/musica-sabana-calma.mp3" },
  { clave: "musica-sabana-energia", url: "/juego/musica-sabana-energia.mp3" },
  { clave: "musica-desierto-calma", url: "/juego/musica-desierto-calma.mp3" },
  { clave: "musica-desierto-energia", url: "/juego/musica-desierto-energia.mp3" },
  { clave: "musica-nieve-calma", url: "/juego/musica-nieve-calma.mp3" },
  { clave: "musica-nieve-energia", url: "/juego/musica-nieve-energia.mp3" },
  { clave: "musica-costa-calma", url: "/juego/musica-costa-calma.mp3" },
  { clave: "musica-costa-energia", url: "/juego/musica-costa-energia.mp3" },
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
