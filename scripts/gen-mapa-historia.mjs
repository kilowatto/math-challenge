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
const FONDO = {
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
};

// ─── La vegetación: piezas aisladas, blanco puro para recortar alfa ─────────
//
// Segundo intento (ver historial): magenta + "cute cartoon illustration" dio
// arbustos con CARA sobre un fondo rosa/malva que el recorte por color no
// pudo tocar. Blanco puro + marco "botanical clipart, plant only, not a
// character, not alive" en vez de "cute children's book character" — la
// palabra "cute"/"picture book" en un objeto pequeño parece ser el gatillo de
// la antropomorfización, igual que "children's math app" lo era para las
// insignias numéricas en gen-mapa.mjs.
const BLANCO = "isolated on a pure flat solid white (#FFFFFF) background, nothing else in the frame, no shadow, no ground, no gradient background";
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

if (!solo || FONDO.clave.includes(solo)) {
  const destino = join(OUT, `${FONDO.clave}.webp`);
  if (existsSync(destino) && !forzar) {
    console.log(`· ${FONDO.clave} — ya existe, se salta (--forzar para regenerar)`);
  } else {
    process.stdout.write(`… ${FONDO.clave} — generando`);
    const img = await generar(FONDO.prompt);
    writeFileSync(join(RAW, `${FONDO.clave}.webp`), img);
    convertirFondo(FONDO.clave, FONDO.ancho, FONDO.alto);
    hechas++;
    console.log(`\r✓ ${FONDO.clave} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
  }
}

for (const [clave, prompt, w, h] of [...VEGETACION, ...PROPS]) {
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
