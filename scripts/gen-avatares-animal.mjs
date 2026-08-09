#!/usr/bin/env node
// gen-avatares-animal.mjs — los 16 personajes que el niño o el adulto ELIGEN
// como su avatar, reemplazando la forma procedural de "¿Quién juega?" (D-194,
// reversa D-080).
//
// D-194 reversó D-080 ("el compañero es Larry, no una mascota nueva") porque
// el dueño pidió, tras ver la primera versión de `QuienJuegaScene`, "avatares
// dibujados, diferentes animales de la sabana" — 8 para elegir en banda
// KINDER/PRIMARIA/SECUNDARIA... espera, SECUNDARIA es fotorrealista (ver
// abajo) — y 8 fotorrealistas antropomórficos para SECUNDARIA en adelante
// (el mismo umbral que ya fijó D-191, NO literalmente "el dueño de la
// cuenta").
//
// Esta primera pasada genera solo el PORTRAIT ESTÁTICO (busto, como
// `larry_busto`) — suficiente para elegir y para mostrarse en una tarjeta de
// "¿Quién juega?". Las secuencias reales de animación (caminar, bailar, leer,
// saludar) para el compañero de la Sábana son una fase aparte, todavía sin
// construir (D-194 lo dice explícitamente: no se promete de un tirón).
//
// Ninguna de las 16 especies es rinoceronte (Larry es único) y el roster
// fotorrealista usa especies DISTINTAS al roster ilustrado — pedido explícito
// del dueño, para que un niño y un adulto de la misma casa nunca "elijan el
// mismo animal" con dos acabados distintos en una pantalla que los muestra a
// los dos a la vez.
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Una pieza ya generada no se regenera salvo --forzar.
//
// Uso:   node scripts/gen-avatares-animal.mjs                 genera lo que falte
//        node scripts/gen-avatares-animal.mjs --solo elefante solo ids que casen
//        node scripts/gen-avatares-animal.mjs --forzar        regenera aunque exista
//
// Después de generar, MIRA cada imagen antes de commitearla (D-080 sigue
// exigiendo revisión humana, la reversa cambia QUÉ se revisa, no que se
// revise) — que sea UN animal, la especie pedida, sin texto, sin marca de
// agua, sin insignias ni objetos no pedidos, y que el roster fotorrealista
// de verdad se vea fotorrealista (no una ilustración plana con más sombreado).

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/avatares");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── Estilo ilustrado — mismo lenguaje visual que Larry, D-080 §continuidad ─
const ESTILO_ILUSTRADO =
  "flat cel-shaded vector mascot logo icon design, thick uniform black " +
  "outlines, solid flat color fills, NOT watercolor, NOT painterly, no " +
  "texture, no brush strokes, warm orange (#F36B1C) and blue (#0B6AB0) " +
  "accents, single character only, nothing else: no scenery, no ground, " +
  "no grass, no plants, no props, no text, no logos, no watermark, no " +
  "signature, no badges, no stars";

// Mismo encuadre de busto que `larry_busto`, para que las 16 tarjetas midan
// exactamente igual en el grid de `QuienJuegaScene`.
const ENCUADRE_ILUSTRADO =
  "app icon style, head-and-shoulders close-up, big round head filling " +
  "most of the square frame, upright and straight, facing forward, calm " +
  "friendly expression, isolated on a plain solid white background with " +
  "absolutely nothing else in it, no shape, no gradient behind the character";

const ROSTER_ILUSTRADO = [
  ["avatar_elefante", "a cute friendly gray elephant with big round ears"],
  ["avatar_jirafa", "an extreme close-up of just the FACE of a cute friendly giraffe with small ossicones, cropped so tight that neck and body are not visible at all, only the head fills the entire frame"],
  ["avatar_cebra", "an extreme close-up of just the FACE of a cute friendly zebra with black and white stripes, cropped so tight that neck and body are not visible at all, only the head fills the entire frame"],
  ["avatar_mono", "a cute friendly brown monkey"],
  ["avatar_suricata", "an extreme close-up of just the FACE of a cute friendly meerkat, cropped so tight that neck and body are not visible at all, only the head fills the entire frame"],
  ["avatar_avestruz", "a hand-drawn cartoon illustration, definitely NOT a photograph, of just the FACE of a cute friendly ostrich, cropped so tight that neck and body are not visible at all, only the head fills the entire frame"],
  ["avatar_hipopotamo", "a cute friendly purple-gray hippopotamus"],
  ["avatar_leon", "a flat cartoon icon design of just the FACE of a cute friendly young lion character with a small round mane, drawn like a simple app icon graphic (not a wildlife photo or nature drawing), cropped so tight that body is not visible at all, only the head fills the entire frame, no initials or monogram or cursive mark anywhere"],
];

// ─── Estilo fotorrealista antropomórfico — SECUNDARIA en adelante (D-191) ───
//
// "Fotorrealista" y "antropomórfico" a la vez: cuerpo/postura/expresión de
// persona, textura y luz de fotografía real — no la ilustración plana del
// roster de arriba con más detalle. Especies DISTINTAS a las 8 de arriba.
const ESTILO_FOTORREALISTA =
  "photorealistic professional studio portrait photograph, hyperrealistic " +
  "fur and skin texture, natural studio lighting, shallow depth of field, " +
  "one single character centered on a plain neutral gray seamless backdrop, " +
  "nothing else in the image: no other animals, no people, no scenery, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures, " +
  "no color swatches, no color palette samples, no badges, no jewelry";

const ENCUADRE_FOTORREALISTA =
  "anthropomorphic character with a humanoid upright posture and human-like " +
  "expressive eyes, head-and-shoulders studio portrait framing, facing " +
  "the camera directly, confident calm friendly expression, wearing a " +
  "simple plain solid-color high crew-neck sweater buttoned up to the " +
  "throat so no skin or fur below the chin is visible at all, nothing " +
  "around the neck, no jewelry, no necklace, no chain, no pendant";

const ROSTER_FOTORREALISTA = [
  ["avatar_foto_guepardo", "an anthropomorphic cheetah with distinctive black tear-mark facial markings and spotted fur"],
  ["avatar_foto_bufalo", "an anthropomorphic cape buffalo with large curved horns"],
  ["avatar_foto_cocodrilo", "an anthropomorphic crocodile with textured scaly skin"],
  ["avatar_foto_aguila", "an anthropomorphic bald eagle with sharp feathers and a hooked beak"],
  ["avatar_foto_hiena", "an anthropomorphic spotted hyena"],
  ["avatar_foto_nu", "an anthropomorphic blue wildebeest with curved horns and a short mane"],
  ["avatar_foto_gacela", "an anthropomorphic gazelle with slender ringed horns"],
  ["avatar_foto_chacal", "an anthropomorphic black-backed jackal"],
];

const PIEZAS = [
  ...ROSTER_ILUSTRADO.map(([id, sujeto]) => [id, `${sujeto}, ${ENCUADRE_ILUSTRADO}`, ESTILO_ILUSTRADO, "digital_illustration"]),
  ...ROSTER_FOTORREALISTA.map(([id, sujeto]) => [id, `${sujeto}, ${ENCUADRE_FOTORREALISTA}`, ESTILO_FOTORREALISTA, "realistic_image"]),
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

async function generar(prompt, style) {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      style,
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
  // 512 px: se pinta en un círculo de ~112 px (RADIO=56 en QuienJuegaScene),
  // en Android de gama baja (mc-47 §5).
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
for (const [id, prompt, estilo, style] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.avif`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando\n`);
  try {
    const img = await generar(`${prompt}, ${estilo}`, style);
    writeFileSync(join(RAW, `${id}.webp`), img);
    convertir(id);
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, AVIF+WebP en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) generada(s). Revisión humana pendiente antes de commitear (D-080).`);
