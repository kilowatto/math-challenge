#!/usr/bin/env node
// gen-cosmeticos.mjs — el arte del catálogo v1 de cosméticos de KINDER (#255)
//
// Por qué existe: las 15 piezas con arte del catálogo (8 por habilidad, la de
// bienvenida, las 3 iniciales y los 3 marcos iniciales) se generan en Recraft,
// la herramienta oficial (CLAUDE.md § Imágenes — mantiene la continuidad del
// avatar de Larry, que se generó ahí), y se publican en AVIF con respaldo WebP
// (mc-47 §5: Android de gama baja).
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Un asset ya generado no se regenera — el .avif existente
// se salta, igual que la idempotencia de traducir-corpus.mjs.
//
// Uso:   node scripts/gen-cosmeticos.mjs            genera lo que falte
//        node scripts/gen-cosmeticos.mjs --solo gorra   solo ids que casen
//        node scripts/gen-cosmeticos.mjs --forzar      regenera aunque exista
//
// Después de generar, MIRA cada imagen antes de commitearla: que la pieza es
// lo que dice ser. Eso no lo hace este script; lo haces tú.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/cosmeticos");
const RAW = join(RAIZ, ".arte-crudo"); // WebP de 1024 de Recraft; no se commitea

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── El manifiesto: id del catálogo → prompt ────────────────────────────────
//
// Un prompt por pieza, en inglés (Recraft rinde mejor así), con los colores de
// Ignia DESCRITOS y no nombrados como «brand palette» — esa frase disparaba un
// muestrario de color en la esquina de la mitad de las piezas, y «Ignia» salía
// escrito como marca de agua inventada. Las otras prohibiciones salen de la
// misma primera corrida: sin personaje, sin texto, sin números, sin logotipos.
//
// Segunda lección, medida en la pasada de las 6 piezas que faltaban (K05, K06,
// K08, K09, K13, K14): **las negaciones extra dentro del prompt de la pieza
// jalaban exactamente lo que prohibían**. «No color swatches, no decorative
// dots» produjo TRES muestrarios seguidos en el chaleco, y «no gems, no stars»
// produjo estrellas y gemas en el cinturón. La salida fue la de las 15
// originales: prompt corto y positivo («a small orange explorer vest with many
// little square pockets and blue trim»), dejando TODAS las prohibiciones en
// ESTILO. El conteo exacto tampoco se obedece —el chaleco aceptado tiene ocho
// bolsillos, no diez—: la identidad de la pieza es la prenda, no la cuenta
// (mismo nit declarado que la jardinera de K09 en el mapa).
const ESTILO =
  "cute flat vector cartoon illustration for a children's math app, " +
  "drawn in warm orange (#F36B1C) with blue (#0B6AB0) accents, " +
  "one single isolated object centered on a plain solid white background, " +
  "nothing else in the image: no characters, no text, no numbers, no letters, " +
  "no logos, no watermarks, no signatures, no color swatches, no color palette samples";

const PIEZAS = [
  // Las tres iniciales.
  ["av_sombrero_explorador", "a khaki-and-orange safari explorer hat for a little rhino avatar"],
  ["av_bandana_sabana", "a folded orange neck bandana scarf with a small white sun pattern"],
  ["av_mochila_viajera", "a tiny orange traveler backpack with blue straps"],
  // La de bienvenida (primer intento).
  ["av_flor_bienvenida", "a single orange flame-lily savanna flower with a short stem, worn as an avatar accessory"],
  // Las ocho por habilidad con arte (#255).
  ["av_prismaticos_halcon", "a pair of small orange binoculars with blue lenses, hawk-themed"],
  ["av_lupa_rastreadora", "a wooden-handled magnifying glass with an orange rim"],
  ["av_gorra_pato", "a cute yellow duckling baseball cap with a tiny duck bill on the front"],
  ["av_collar_cuentas", "a necklace of twenty plain colorful counting beads, orange and blue, smooth unmarked beads without any numbers or symbols"],
  ["av_gorra_balanza", "a cap with a small golden balance scale emblem on the front"],
  ["av_pin_rompecabezas", "a single round pin badge with two interlocking puzzle pieces, orange and blue"],
  ["av_estrella_suma", "a smiling orange five-pointed star pin badge"],
  ["av_cometa_viento", "a small orange diamond kite with a blue ribbon tail"],
  // Las seis que quedaban SIN arte (#255, migración 0015: arte NULL porque F5
  // no había cerrado la habilidad; las correcciones de F5 ya están en main).
  // Mismas prohibiciones medidas en la primera corrida, y una más: la medalla
  // y la bufanda nombran números en la HABILIDAD (cardinalidad, recta
  // numérica) pero la pieza no puede llevar NI UN dígito — el collar de
  // cuentas salió con números gibberish en la primera pasada por menos.
  ["av_orejeras_par", "a pair of fluffy orange earmuffs joined by a soft blue headband, exactly two matching round ear covers"],
  ["av_medalla_ultimo", "a single plain round golden medal on a short orange and blue ribbon, worn as an avatar accessory, smooth blank face, isolated on empty white space, nothing surrounding it, no confetti, no stars, no sparkles, no dots"],
  ["av_bufanda_recta", "a cozy knitted orange scarf with a single blue dotted line running along its length, evenly spaced plain dots, no numbers, no numerals, the scarf alone filling the whole frame, no color swatches, no decorative dots, no scattered circles anywhere"],
  ["av_chaleco_bolsillos", "a small orange explorer vest with many little square pockets and blue trim"],
  ["av_cinturon_formas", "an orange belt with a blue buckle, decorated with four plain flat shape studs: a circle, a square, a triangle and a rectangle, like wooden toy blocks"],
  ["av_collar_patron", "a necklace of plain round beads in a strict alternating orange and blue repeating pattern, smooth unmarked beads without any numbers or symbols"],
  // Los tres marcos iniciales: borde circular para la foto de perfil.
  ["marco_acacia", "a circular profile-picture frame border decorated with flat-top acacia tree silhouettes, savanna style, empty white circle in the middle"],
  ["marco_atardecer", "a circular profile-picture frame border with a warm savanna sunset gradient, orange and deep orange, empty white circle in the middle"],
  ["marco_huellas", "a circular profile-picture frame border decorated with a trail of small animal footprints, orange on white, empty white circle in the middle"],
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
  const crudo = join(RAW, `${id}.webp`);
  const avif = join(OUT, `${id}.avif`);
  const webp = join(OUT, `${id}.webp`);
  // 512 px: accesorio de avatar que se muestra chico, en Android de gama baja
  // (mc-47 §5). Fondo blanco aplanado: el prompt ya lo pide, y el AVIF sin
  // alfa es más chico y compatible.
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "scale=512:512",
    "-frames:v", "1", "-c:v", "libsvtav1", "-crf", "34", "-pix_fmt", "yuv420p",
    avif,
  ]);
  execFileSync("cwebp", ["-q", "85", "-resize", "512", "512", crudo, "-o", webp]);
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const avif = join(OUT, `${id}.avif`);
  if (existsSync(avif) && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando`);
  const img = await generar(id, prompt);
  writeFileSync(join(RAW, `${id}.webp`), img);
  convertir(id);
  hechas++;
  console.log(`\r✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, AVIF+WebP en ${OUT}`);
}

console.log(`\n${hechas} pieza(s) nueva(s). MIRA cada una antes de commitearla:`);
console.log(`  que la pieza es lo que dice ser (#255).`);
