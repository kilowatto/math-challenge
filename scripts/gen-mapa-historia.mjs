#!/usr/bin/env node
// gen-mapa-historia.mjs — el arte ilustrado de Modo Historia (D-184, D-186)
//
// Por qué existe: BootScene.ts generaba el fondo y la vegetación del mapa de
// PRIMARIA/SECUNDARIA con Phaser.GameObjects.Graphics — formas planas, no
// ilustración. El dueño vio el resultado, dijo que no se parecía remotamente
// a un mapa (referencia: mapas estilo Angry Birds/Toon Blast), y pidió arte
// real de Recraft, la herramienta oficial (CLAUDE.md § Imágenes).
//
// Mismo patrón que gen-mapa.mjs (la Sabana de KINDER), con dos diferencias:
//
//  1. Estas piezas se sirven a Phaser (`PreloadScene.load.image()`), no a un
//     <img>/<picture> de Astro — por eso se genera y se carga SOLO WebP, no
//     el par AVIF+WebP de siempre. El navegador negocia el formato en un
//     <picture>; un `Phaser.Loader` pide UNA url fija y no tiene ese
//     mecanismo. WebP es el piso de compatibilidad más amplio para el
//     dispositivo de referencia (`mc-47` §5); AVIF puede sumarse el día que
//     alguien escriba la detección de soporte en el cliente.
//  2. La vegetación necesita transparencia. Recraft (estilo
//     "digital_illustration") no expone un parámetro de fondo transparente
//     confiable, así que el prompt pide un fondo de un solo color IMPOSIBLE
//     de confundir con la escena (magenta puro, #FF00FF — no es un color de
//     ninguna planta) y `ffmpeg colorkey` lo convierte a alfa después. El
//     fondo del mapa, en cambio, se queda opaco a propósito: es una textura
//     que se repite en mosaico (`tileSprite`), y un mosaico transparente no
//     tiene sentido.
//
// El verde de estas piezas es la EXCEPCIÓN DE MARCA D-186
// (`docs/guia-de-estilo.md`, `audits/brand-image.mjs`): nunca se usa fuera
// de esta arte, nunca en un botón/texto/ícono de interfaz.
//
// Uso:   node scripts/gen-mapa-historia.mjs              genera lo que falte
//        node scripts/gen-mapa-historia.mjs --solo fondo solo claves que casen
//        node scripts/gen-mapa-historia.mjs --forzar     regenera aunque exista
//
// Después de generar, MIRA cada imagen antes de commitearla — el mismo aviso
// que gen-mapa.mjs hace, y por la misma razón: eso no lo hace este script.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo"); // WebP de Recraft; no se commitea

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── El fondo: UNA escena grande por capítulo, no una textura en mosaico ─────
//
// Primer intento (mosaico, ver git history de esta línea): Recraft ignoró
// "seamless tileable texture" y devolvió una escena narrativa completa con
// niños y una casa — el mismo comportamiento que ya documentó gen-mapa.mjs
// la primera vez que se le pidió "sin personajes". El dueño vio el resultado
// y pidió lo que en realidad mandó de referencia: una escena grande, pintada,
// del alto del mundo — no un mosaico.
//
// Sin camino, sin nodos: `MapScene` dibuja su propio sendero
// (`Phaser.Curves.Path` + `lineStyle`) exactamente sobre la posición real de
// cada nodo (el progreso real del niño, nunca inventado) — un camino pintado
// en el fondo casi nunca coincidiría con esos píxeles, y quedaría un segundo
// camino que no lleva a ningún nodo. El fondo es terreno puro: colinas,
// cielo, vegetación de lejos — la escena, sin la ruta.
//
// `1024x2048` (1:2) es el tamaño soportado por Recraft más cercano al
// `worldWidth:worldHeight` real (720:2400 ≈ 1:3.33, ver `data/story.ts`) —
// Phaser estira el sprite al tamaño del mundo, así que la proporción exacta
// del archivo importa menos que tener suficiente detalle vertical.
// D-190: el "Mundo Kinder" del video de referencia es multi-bioma, no una
// sola escena — `fondo-primaria-1` (bosque/colinas) sigue siendo el primer
// capítulo; estos tres se suman para desierto/nieve/costa, MISMA regla de
// "escena sin camino ni personajes" que ya se peleó y ganó con el bosque.
const FONDOS = [
  {
    clave: "fondo-primaria-1",
    size: "1024x2048",
    prompt:
      "wide vertical panorama of empty rolling green hills for a children's picture book game map, " +
      "soft grassy terrain in green (#5B8C3A) with lighter green highlights (#8FC461), " +
      "distant clusters of trees and bushes near the edges, small clouds in a pale sky at the very top, " +
      "gentle top-down/isometric game map perspective, completely empty open meadow in the center for game pieces to sit on, " +
      "the hills are bare and untouched by any trail or structure, pure untouched grassland, " +
      "no dirt path of any kind, no paved path, no road, no trail, no track, no walkway, no stepping stones, " +
      "no water, no river, no pond, no buildings, no houses, no huts, no cabins, no roofs, no fences, no farms, " +
      "no characters, no people, no faces, no animals, no creatures, no sheep, no birds, no livestock, " +
      "no text, no numbers, no digits, no letters, no signs, no logos, no watermarks, no signatures",
  },
  {
    clave: "fondo-desierto-1",
    size: "1024x2048",
    prompt:
      "flat cartoon illustration for a children's picture book game map, not photorealistic, " +
      "no dramatic lighting, no cinematic shot, simple flat shapes and flat colors, " +
      "wide vertical panorama of empty smooth sandy hills, " +
      "warm sandy terrain in tan and orange tones (#D9A066 base, #E8C48A highlights) with soft rounded shapes, " +
      "a few small simple cloud shapes in a warm pale flat-colored sky at the very top, " +
      "gentle top-down/isometric game map perspective like a mobile game level map, " +
      "completely empty open sand in the center for game pieces to sit on, bare untouched sand, " +
      "no dirt path, no paved path, no road, no trail, no track, no walkway, no stepping stones, " +
      "no water, no oasis, no buildings, no huts, no tents, no ruins, no pyramids, no cliffs, no canyons, no mesas, " +
      "no characters, no people, no faces, no animals, no camels, no birds, no snakes, " +
      "no text, no numbers, no letters, no signs, no logos, no watermarks, no signatures",
  },
  {
    clave: "fondo-nieve-1",
    size: "1024x2048",
    prompt:
      "wide vertical panorama of empty snowy mountains for a children's picture book game map, " +
      "soft white snow terrain with pale blue-white shading and gentle sparkle, " +
      "distant snow-capped peaks and pine tree clusters near the edges, a pale winter sky at the very top, " +
      "gentle top-down/isometric game map perspective, completely empty open snowfield in the center for game pieces to sit on, " +
      "the snow is bare and untouched by any trail or structure, pure untouched snowfield, " +
      "no dirt path of any kind, no paved path, no road, no trail, no track, no walkway, no stepping stones, no footprints, " +
      "no water, no frozen lake, no buildings, no houses, no cabins, no igloos, no roofs, no fences, " +
      "no characters, no people, no faces, no animals, no creatures, no penguins, no birds, no polar bears, " +
      "no text, no numbers, no digits, no letters, no signs, no logos, no watermarks, no signatures",
  },
  {
    clave: "fondo-costa-1",
    size: "1024x2048",
    prompt:
      "wide vertical panorama of empty grassy hills next to the ocean for a children's picture book game map, " +
      "soft green terrain (#5B8C3A base, #8FC461 highlights) on one side, calm flat turquoise water on the other, " +
      "a pale sky with a few simple clouds at the very top, " +
      "gentle top-down/isometric game map perspective, completely empty open grassy patch in the center for game pieces to sit on, " +
      "one continuous unbroken grassy surface from edge to edge, seamless untouched turf with no worn ground of any kind, not even a faint line, " +
      "the hills are bare and untouched by any trail or structure, pure untouched grassland, " +
      "no dirt path of any kind, no paved path, no road, no trail, no track, no walkway, no stepping stones, no bridge, " +
      "no boats, no ships, no docks, no sails, " +
      "no buildings, no houses, no huts, no lighthouse, no fences, no village, " +
      "no characters, no people, no faces, no animals, no birds, no crabs, " +
      "no text, no numbers, no letters, no logos, no watermarks, no signatures",
  },
];

// ─── La vegetación: piezas aisladas, blanco puro para recortar alfa ─────────
//
// Segundo intento (ver historial): magenta + "cute cartoon illustration" dio
// arbustos con CARA sobre un fondo rosa/malva que el recorte por color no
// pudo tocar. Blanco puro + marco "botanical clipart, plant only, not a
// character, not alive" en vez de "cute children's book character" — la
// palabra "cute"/"picture book" en un objeto pequeño parece ser el gatillo de
// la antropomorfización, igual que "children's math app" lo era para las
// insignias numéricas en gen-mapa.mjs.
const BLANCO = "isolated on a pure flat solid white (#FFFFFF) background, nothing else in the frame, no shadow, no ground, no gradient background, no scenery, no landscape, no background scene, no other objects, no second item, no extra plants, no additional elements";
const ESTILO_VEGETACION =
  "simple flat vector botanical clipart, plant illustration only, not a character, not alive, no personality, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "green tones (#5B8C3A base, #8FC461 highlights) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";

const VEGETACION = [
  ["arbusto-a", `a single rounded leafy bush plant, ${BLANCO}, ${ESTILO_VEGETACION}`, 220, 240],
  ["arbusto-b", `a single small round shrub plant, ${BLANCO}, ${ESTILO_VEGETACION}`, 180, 200],
  ["helecho-a", `a single tall clump of grass blades, ${BLANCO}, ${ESTILO_VEGETACION}`, 140, 220],
];

// Mismo marco "clipart, plant/rock only, not alive" que ya funcionó para el
// bosque — solo cambian los tonos por bioma (D-190).
const ESTILO_DESIERTO =
  "simple flat vector clipart illustration, object only, not a character, not alive, no personality, " +
  "side view game asset, clean simple shape that reads well at small size, growing directly out of the ground with no pot, " +
  "warm sand and terracotta tones (#D9A066 base, #E8C48A highlights) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, " +
  "no animals, no creatures, no camel, no lizard, no snake, no bird, no pot, no planter, no vase, no container, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
// `cactus-a` (saguaro alto) se intentó tres veces y las tres Recraft coló
// una mini-escena de fondo (montañas, cactus chicos) pese al recorte "extreme
// close-up" — se deja fuera en vez de seguir gastando llamadas; dos piezas de
// vegetación alcanzan igual que en el bosque original (D-190).
const VEGETACION_DESIERTO = [
  ["cactus-b", `extreme close-up crop of a small round barrel cactus plant filling the entire frame, ${BLANCO}, ${ESTILO_DESIERTO}`, 160, 160],
  ["roca-desierto", `extreme close-up crop of a smooth rounded stone filling the entire frame, ${BLANCO}, ${ESTILO_DESIERTO}`, 200, 150],
];

const ESTILO_NIEVE =
  "simple flat vector clipart illustration, object only, smooth solid-color surface with completely plain unmarked texture, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "cool white and pale blue tones (#EAF3F7 base, #BFDCE8 highlights), a little snow cap allowed " +
  "no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
const VEGETACION_NIEVE = [
  ["pino-nevado", `extreme close-up crop of a snow-covered pine tree filling the entire frame, ${BLANCO}, ${ESTILO_NIEVE}`, 200, 260],
  ["roca-nieve", `extreme close-up crop of an angular frost-covered mineral formation filling the entire frame, geological crystal shape, ${BLANCO}, ${ESTILO_NIEVE}`, 200, 160],
  ["cristal-hielo", `a single small ice crystal cluster, ${BLANCO}, ${ESTILO_NIEVE}`, 140, 180],
];

const ESTILO_COSTA =
  "simple flat vector clipart illustration, object only, not a character, not alive, no personality, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "tropical green and sandy tones (#5B8C3A base, #E8D9A8 highlights) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
const VEGETACION_COSTA = [
  ["palmera", `a single tropical palm tree, ${BLANCO}, ${ESTILO_COSTA}`, 200, 280],
  ["roca-costa", `extreme close-up crop of a smooth rounded beach stone filling the entire frame, plain unmarked stone surface, geological mineral object, not a creature, isolated single object, no scene, no other objects, ${BLANCO}, ${ESTILO_COSTA}`, 200, 150],
  ["concha", `a single seashell, ${BLANCO}, ${ESTILO_COSTA}`, 140, 120],
];

// ─── Material del tronco por bioma (plan de mundo multi-bioma, 2026-08-09) ──
//
// `tronco-a`/`tronco-b` (madera) solo tienen sentido donde hay árboles —
// Sabana y Costa (madera de deriva, mismo material visual). Un tronco de
// madera sobre dunas o nieve es exactamente el "flotando, no coherente con
// el terreno" que el dueño señaló: Desierto y Nieve necesitan su propio
// material de apoyo, mismo lenguaje visual que `tronco-a`/`tronco-b`
// (superficie superior limpia para que Phaser pinte `secuencia` encima,
// nunca horneado en la imagen — D-190) pero con el material del terreno.
const TRONCOS_BIOMA = [
  [
    "roca-arenisca-tronco",
    `a single round flat stepping stone made of sandstone viewed from a slight top-down angle, ` +
      `smooth flat sandy-orange stone surface with subtle rock striations, rounded weathered edges, ` +
      `empty clean flat top surface with no carving, no engraving, no picture, no scene, ` +
      `warm sandstone tan and terracotta tones (#D9A066 base, #E8C48A highlights), ${BLANCO}, ` +
      `simple flat vector game asset illustration, clean shape that reads well at small size, ` +
      `no people, no characters, no faces, no eyes, no animals, no text, no numbers, no letters, ` +
      `no logos, no watermarks, no signatures`,
    200,
    200,
  ],
  // "bloque-nieve-tronco" — PENDIENTE DE REVISIÓN HUMANA DEL PROMPT (2026-08-10).
  // Tres intentos, tres fallos distintos, y no se genera un cuarto (límite de
  // 2 reintentos de esta sesión):
  //   1. Prompt original (sin "extreme close-up crop"): coló un excursionista
  //      diminuto con bastones sobre el bloque — una persona, prohibido.
  //   2. + "extreme close-up crop... filling the entire frame" (la misma
  //      corrección que sí funcionó para roca-costa/roca-desierto): en vez de
  //      aislar el objeto, "compacted snow and ice" + el encuadre cerrado
  //      hicieron que Recraft devolviera FOTOGRAFÍA realista de un ventisquero
  //      completo — nunca ilustración plana, y sin fondo blanco que recortar.
  //   3. + "not photorealistic, flat cartoon illustration style" + anti-gente:
  //      volvió a la ilustración plana pero coló sombra azul, pasto en la
  //      base y marcas parecidas a huellas de animal sobre la superficie —
  //      otra vez una escena, no un ícono aislado.
  // La palabra "snow" parece jalar fuerte hacia fotografía de paisaje de
  // invierno sin importar el resto del prompt — el mismo tipo de sobre-ajuste
  // que ya documentó [[feedback_recraft-overfitting-fixes]] punto 9. Arreglo
  // real (2026-08-10): evitar la palabra "snow" por completo, igual que ya
  // resuelve `roca-nieve` dos líneas arriba ("frost-covered mineral
  // formation", nunca "snow") — mismo patrón, superficie plana en vez de
  // formación angular.
  [
    "bloque-nieve-tronco",
    `extreme close-up crop of exactly ONE single flat rounded frost-covered stepping stone filling the ` +
      `entire frame, only one stone and nothing else, smooth pale ice-glazed mineral surface, geological ` +
      `object, not a creature, empty clean flat top with no carving, no picture, no scene, ` +
      `no path, no row of stones, no additional stones, no other objects, ${BLANCO}, ${ESTILO_NIEVE}`,
    200,
    200,
  ],
];

// ─── El letrero del reto: un prop, no un ser vivo — mucho más seguro que la
// vegetación (nada que antropomorfizar). El texto lo pinta Phaser encima
// (`GameplayScene.ts`), nunca horneado en la imagen: el mismo letrero sirve a
// los siete locales (D-022) sin generarse siete veces.
const ESTILO_PROP =
  "simple flat vector game asset illustration, clean shape that reads well at small size, " +
  "warm wood tones (browns and tans), rope or vine details allowed, " +
  "no people, no characters, no faces, no eyes, no animals, no text, no numbers, no letters, " +
  "no logos, no watermarks, no signatures";

const PROPS = [
  ["letrero-madera", `an empty wooden signboard hanging from two ropes, blank rustic wood plank sign with no writing on it, ${BLANCO}, ${ESTILO_PROP}`, 480, 220],
  // El rediseño de Modo Historia (D-190): cada nodo del camino es un tronco de
  // madera visto desde arriba/ligero ángulo isométrico, con espacio limpio en
  // el centro para que Phaser pinte el número de SECUENCIA encima (nunca
  // horneado en la imagen, mismo motivo que el letrero) — dos variantes para
  // que el camino no se vea repetitivo cada 40px.
  ["tronco-a", `a single round tree stump viewed from a slight top-down angle, flat circular wood surface with visible tree rings, dark bark on the sides, empty clean top surface, ${BLANCO}, ${ESTILO_PROP}`, 200, 200],
  ["tronco-b", `a single round tree stump viewed from a slight top-down angle, flat circular wood surface with visible tree rings, slightly different size and bark texture from a matching stump, empty clean top surface, ${BLANCO}, ${ESTILO_PROP}`, 180, 180],
  // El candado: ícono pequeño y neutro para el estado "bloqueado" del tronco
  // (D-190) — gris, sin madera, se superpone al tronco cuando el niño no ha
  // llegado ahí todavía.
  ["candado", `a single simple padlock icon, closed shackle, flat vector game icon style, solid gray color (#A4A6A8) with darker gray shading, ${BLANCO}, simple flat vector game asset illustration, clean shape that reads well at small size, no people, no characters, no faces, no eyes, no animals, no text, no numbers, no letters, no logos, no watermarks, no signatures`, 120, 140],
  // La flecha de "regresar" de `QuienJuegaScene` (D-194): el dueño pidió que
  // dejara de ser un círculo procedural y fuera un prop de madera, mismo
  // lenguaje visual que el letrero/los troncos — nunca un ícono UI genérico
  // flotando sobre la escena ilustrada.
  ["flecha-madera", `a flat vector game icon of a chevron arrow button, the icon is shaped like a thick left-pointing arrow, filled with a warm brown wood grain texture pattern, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 130, 90],
  // El engrane de ajustes de "¿Quién juega?" (D-199, corrección tras verlo
  // en vivo): el dueño vio la primera versión —un engrane gris, dibujado a
  // mano con `Phaser.Graphics`, idéntico en cada tarjeta— y pidió madera,
  // como el resto de los props de esta pantalla, y 4-5 variantes para que
  // no se vea repetido de tarjeta a tarjeta (mismo criterio que
  // `tronco-a`/`tronco-b`). Cinco engranes, cada uno con un número de
  // dientes y un tono de madera distinto — la MISMA familia visual, nunca
  // cinco estilos que no combinen entre sí.
  ["engrane-madera-1", `a flat vector game icon of a mechanical gear/cog wheel with 6 teeth, filled with a warm light honey-brown wood grain texture pattern, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 110, 110],
  ["engrane-madera-2", `a flat vector game icon of a mechanical gear/cog wheel with 8 teeth, filled with a plain warm medium brown wood grain texture pattern only — no carving, no engraving, no picture, no scene, no landscape, no medallion, just flat wood grain, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 110, 110],
  ["engrane-madera-3", `a flat vector game icon of a mechanical gear/cog wheel with 5 teeth, filled with a darker walnut-brown wood grain texture pattern, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 110, 110],
  ["engrane-madera-4", `a flat vector game icon of a mechanical gear/cog wheel with 7 teeth, filled with a warm reddish-brown wood grain texture pattern with a visible wood knot, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 110, 110],
  ["engrane-madera-5", `a flat vector game icon of a mechanical gear/cog wheel with 10 small teeth, filled with a pale tan wood grain texture pattern, simple UI button icon design, ${BLANCO}, ${ESTILO_PROP}`, 110, 110],
  // Intentado y ABANDONADO (D-194, tercera ronda): una placa de madera para
  // el fondo de cada tarjeta de "¿Quién juega?", pidiendo desde "ícono de UI"
  // hasta "textura de swatch" hasta "patrón sin costura" — las SEIS rondas,
  // sin importar el encuadre, devolvieron un retrato grabado de un hombre
  // con barba (una plaqueta de Lincoln tallada en madera, un producto real
  // de artesanía muy sobrerrepresentado en el dataset, aparentemente). No
  // vale la pena una séptima ronda — el panel de la tarjeta se quedó en
  // Phaser puro (color cálido + borde, `QuienJuegaScene.ts`), no en Recraft.
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

async function generar(prompt, size = "1024x1024") {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      style: "digital_illustration",
      size,
      n: 1,
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    throw new Error(`Recraft respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = await res.json();
  const url = json.data?.[0]?.url;
  if (!url) throw new Error(`respuesta sin url: ${JSON.stringify(json).slice(0, 200)}`);
  const img = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!img.ok) throw new Error(`la descarga respondió ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

function convertirFondo(clave) {
  const crudo = join(RAW, `${clave}.webp`);
  const webp = join(OUT, `${clave}.webp`);
  // 800×1600 y calidad 75: por debajo del presupuesto de imagen de
  // `audits/bundle-budget.mjs` (120 KB) — 1024x2048 a calidad 82 pesaba
  // 165 KB. `MapScene` igual lo estira al tamaño real del mundo
  // (`worldWidth`/`worldHeight`), así que la resolución nativa exacta no
  // importa mientras se vea bien estirada.
  execFileSync("cwebp", ["-q", "75", "-resize", "800", "1600", crudo, "-o", webp]);
}

/** Blanco → alfa, y recorte al tamaño final que usa `story.ts`. */
function convertirVegetacion(clave, w, h) {
  const crudo = join(RAW, `${clave}.webp`);
  const png = join(RAW, `${clave}-alfa.png`);
  const webp = join(OUT, `${clave}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", `colorkey=0xFFFFFF:0.18:0.10,scale=${w}:${h}`,
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;

for (const fondo of FONDOS) {
  if (solo && !fondo.clave.includes(solo)) continue;
  const destino = join(OUT, `${fondo.clave}.webp`);
  if (existsSync(destino) && !forzar) {
    console.log(`· ${fondo.clave} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${fondo.clave} — generando`);
  const img = await generar(fondo.prompt, fondo.size);
  writeFileSync(join(RAW, `${fondo.clave}.webp`), img);
  convertirFondo(fondo.clave);
  hechas++;
  console.log(`\r✓ ${fondo.clave} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
}

for (const [clave, prompt, w, h] of [
  ...VEGETACION, ...VEGETACION_DESIERTO, ...VEGETACION_NIEVE, ...VEGETACION_COSTA, ...PROPS,
  ...TRONCOS_BIOMA,
]) {
  if (solo && !clave.includes(solo)) continue;
  const destino = join(OUT, `${clave}.webp`);
  if (existsSync(destino) && !forzar) {
    console.log(`· ${clave} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${clave} — generando`);
  const img = await generar(prompt);
  writeFileSync(join(RAW, `${clave}.webp`), img);
  convertirVegetacion(clave, w, h);
  hechas++;
  console.log(`\r✓ ${clave} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP con alfa en ${OUT}`);
}

console.log(`\n${hechas} pieza(s) nueva(s) en ${OUT}.`);
console.log("MIRA cada una antes de commitearla — sobre todo la vegetación: un mal recorte de blanco deja un halo visible.");
