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
