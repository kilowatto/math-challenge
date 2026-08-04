#!/usr/bin/env node
// gen-mapa.mjs — el arte de los 14 lugares de la Sabana (D-019, D-152)
//
// Por qué existe: el mapa enrutado (D-152) presenta cada lugar con su imagen,
// estilo mapa de niveles de Angry Birds. Las piezas se generan en Recraft, la
// herramienta oficial (CLAUDE.md § Imágenes), y se publican en AVIF con
// respaldo WebP (mc-47 §5: Android de gama baja). La Sabana no habla (D-019):
// el arte se autora UNA vez y sirve a los siete locales — por eso los prompts
// prohíben texto, letras y números, y por eso los nombres de archivo son los
// ids del banco (K01…K14), que no se traducen.
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Un lugar ya generado no se regenera — el .avif existente
// se salta, igual que la idempotencia de gen-cosmeticos.mjs.
//
// Uso:   node scripts/gen-mapa.mjs              genera lo que falte
//        node scripts/gen-mapa.mjs --solo K07   solo ids que casen
//        node scripts/gen-mapa.mjs --forzar     regenera aunque exista
//
// Al terminar reescribe apps/web/src/components/mapa/arte-lugares.json con los
// lugares que TIENEN imagen: el componente pinta el arte donde existe y deja
// el círculo de siempre donde no — un hueco que se ve es un hueco que se llena.
//
// Después de generar, MIRA cada imagen antes de commitearla: que el lugar es
// lo que dice ser. Eso no lo hace este script; lo haces tú.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/mapa");
const RAW = join(RAIZ, ".arte-crudo"); // WebP de 1024 de Recraft; no se commitea
const MANIFIESTO = join(RAIZ, "apps/web/src/components/mapa/arte-lugares.json");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── Los lugares: id del banco → prompt ─────────────────────────────────────
//
// Un lugar por habilidad de kinder (D-019), inspirado en lo que la habilidad
// hace. Las prohibiciones salen de la primera corrida de cosméticos: los
// colores de Ignia DESCRITOS y no nombrados como «brand palette» (esa frase
// disparaba un muestrario de color), sin texto, sin números, sin logotipos.
// Y una más, propia de este mapa: **sin rinocerontes**. Larry es un rinoceronte
// y su continuidad la mantiene el dueño — un rinoceronte generado aquí sería
// un segundo Larry, y dos Larrys parecidos son peores que uno.
//
// Primera corrida, medida: 11 de 14 salieron mal. «Savanna» jala rinocerontes
// y elefantes aunque el prompt diga «no rhinos», y las escenas con patos o
// sombreros jalaron CARAS y NÚMEROS flotando («2», «3») — justo lo que la
// Sabana no puede mostrar (D-019: no habla). Por eso la prohibición es ahora
// por omisión —ningún animal salvo el nombrado, ningún número en ninguna
// forma— y cada prompt nombra lo único vivo que puede salir.
// Segunda corrida, medida: 6 de las 11 regeneradas seguían mal. La palabra
// «savanna» es el imán —jala megafauna aunque la prohibición la nombre— y el
// encuadre «cuántos hay» («unos se van, otros se quedan») jala insignias con
// NÚMEROS de interfaz de juego. Tercera vuelta: fuera «savanna» del estilo,
// prohibidos los elementos de interfaz, y cada prompt difícil describe la
// escena sin vocabulario de conteo.
// Cuarta vuelta, medida: «children's math app» en el estilo era el gatillo de
// las insignias con números — el modelo «ayuda» poniendo interfaz de matemáticas
// en la escena. El estilo pasa a «children's picture book»: la app ya no se
// nombra, y las escenas de pájaros y de piedras dejan de describirse con
// vocabulario de conteo, que es la otra mitad del gatillo.
const ESTILO =
  "cute flat vector cartoon landscape illustration for a children's picture book, " +
  "golden grassland scenery with flat-top acacia trees, drawn in warm orange (#F36B1C) " +
  "with blue (#0B6AB0) accents, " +
  "simple uncluttered composition that reads well inside a small circle, " +
  "no people, no characters, no faces, " +
  "no animals of any kind except the ones explicitly named in the scene, " +
  "absolutely no rhinoceros, no elephants, no giraffes, no lions, no zebras, no hippos, " +
  "no text, no numbers, no digits anywhere, no counting badges, no coins, no letters, " +
  "no game interface elements, no buttons, no badges, no question marks, no speech bubbles, " +
  "no logos, no watermarks, no signatures, no color swatches, no color palette samples";

const SIN_ANIMALES = "pure landscape scenery, empty of wildlife, no animals at all, no birds";

const LUGARES = [
  ["K01", `a small round pond with three lily pads and tall papyrus reeds on golden grassland, ${SIN_ANIMALES}`],
  ["K02", `a flat-top acacia tree with a woven beehive hanging from a branch, golden grassland, ${SIN_ANIMALES}`],
  ["K03", "a small round pond on golden grassland with a row of small yellow ducklings swimming, the only living creatures are the ducklings, no mammals anywhere, no other birds"],
  ["K04", `a long trail of round stepping stones crossing a shallow stream, golden grassland, ${SIN_ANIMALES}`],
  ["K05", `a rustic wooden fence with small colorful empty hats resting on its posts, dirt path on golden grassland, ${SIN_ANIMALES}, the hats are empty, nothing wears them`],
  ["K06", `a grassy lookout hill with a winding dirt path to the top at golden hour, ${SIN_ANIMALES}`],
  ["K07", `two piles of mangoes, one clearly bigger, on a woven blanket in a grassy clearing, ${SIN_ANIMALES}`],
  ["K08", `a straight dusty path with evenly spaced round white stones, golden grassland, ${SIN_ANIMALES}`],
  ["K09", `an empty square wooden planter box divided into ten equal square sections arranged in two rows of five, small green sprouts in the soil, on golden grassland, ${SIN_ANIMALES}`],
  ["K10", `a dirt path forking into two trails around a big baobab tree, golden grassland, ${SIN_ANIMALES}`],
  ["K11", "two small groups of small yellow ducklings walking toward the same pond from two sides, the only living creatures are the ducklings, no mammals anywhere, no other birds"],
  ["K12", "small plain birds flying in a wide sky above a flat-top acacia tree, golden grassland below, the only living creatures are the small birds, no mammals anywhere"],
  ["K13", `a small group of smooth plain rocks resting on golden sand — one round, one square, one triangular, one rectangular — plain unmarked stones without any carvings or symbols, ${SIN_ANIMALES}`],
  ["K14", `a winding trail of alternating orange and blue wildflowers, golden meadow, ${SIN_ANIMALES}`],
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

async function generar(id, prompt) {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${prompt}, ${ESTILO}`,
      style: "digital_illustration",
      size: "1024x1024",
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

function convertir(id) {
  const crudo = join(RAW, `mapa-${id}.webp`);
  const avif = join(OUT, `${id}.avif`);
  const webp = join(OUT, `${id}.webp`);
  // 512 px: el lugar se pinta dentro de un círculo de 88 px, en Android de
  // gama baja (mc-47 §5). Fondo aplanado: la escena llena el círculo.
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "scale=512:512",
    "-frames:v", "1", "-c:v", "libsvtav1", "-crf", "34", "-pix_fmt", "yuv420p",
    avif,
  ]);
  execFileSync("cwebp", ["-q", "85", "-resize", "512", "512", crudo, "-o", webp]);
}

/**
 * El manifiesto se reescribe SIEMPRE al final, desde lo que hay en disco:
 * así refleja lo que de verdad se sirve aunque una corrida se interrumpa a
 * medias — y un archivo borrado a mano deja de anunciarse solo.
 */
function escribirManifiesto() {
  const conArte = {};
  for (const [id] of LUGARES) {
    if (existsSync(join(OUT, `${id}.avif`)) && existsSync(join(OUT, `${id}.webp`))) {
      conArte[id] = true;
    }
  }
  writeFileSync(MANIFIESTO, JSON.stringify(conArte, null, 2) + "\n");
  return Object.keys(conArte).length;
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt] of LUGARES) {
  if (solo && !id.includes(solo)) continue;
  const avif = join(OUT, `${id}.avif`);
  if (existsSync(avif) && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando`);
  const img = await generar(id, prompt);
  writeFileSync(join(RAW, `mapa-${id}.webp`), img);
  convertir(id);
  hechas++;
  console.log(`\r✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, AVIF+WebP en ${OUT}`);
}

const total = escribirManifiesto();
console.log(`\n${hechas} pieza(s) nueva(s); ${total} de ${LUGARES.length} lugares con arte en el manifiesto.`);
console.log("MIRA cada una antes de commitearla: que el lugar es lo que dice ser (D-152).");
