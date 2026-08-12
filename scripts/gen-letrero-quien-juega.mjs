#!/usr/bin/env node
// gen-letrero-quien-juega.mjs — el letrero de "¿Quién juega?" tallado en
// madera de verdad, un archivo por locale (D-199, ronda 5).
//
// El dueño vio el letrero con el texto PINTADO por Phaser (el patrón de
// siempre: una imagen en blanco que sirve a los 7 locales sin regenerarse)
// y pidió que el texto estuviera TALLADO EN LA MADERA de verdad, con efecto
// de viento. El viento ya se resolvió con un tween (`MenuScene.ts`); esto
// es la parte de arte.
//
// Riesgo conocido y MEDIDO, no supuesto: una prueba en español antes de
// generar los 7 dio el título grande perfecto ("¿Quién juega?") y el
// subtítulo con un error de ortografía ("dibuijo" en vez de "dibujo") — el
// dueño vio esa prueba y pidió seguir de todas formas con las dos líneas,
// sabiendo que cada una necesita revisión humana de ortografía (D-080) en
// vez de darse por buena a la primera.
//
// es-MX y es-ES comparten el MISMO texto exacto ("¿Quién juega?"/"Toca tu
// dibujo.") — se genera UNA imagen y los dos locales la referencian, en vez
// de pagar y revisar dos imágenes idénticas.
//
// Uso: node scripts/gen-letrero-quien-juega.mjs           genera lo que falte
//      node scripts/gen-letrero-quien-juega.mjs --solo de-DE
//      node scripts/gen-letrero-quien-juega.mjs --forzar

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.GOOGLE_AI_API_KEY;
const MODELO = "gemini-2.5-flash-image";
const REFERENCIA = join(RAW, "letrero-madera-alfa.png");

// clave de archivo → [título grande, subtítulo chico] — texto EXACTO de
// `i18n/*.json::kidsTitle/kidsPick`, copiado a mano para que una futura
// traducción distinta se note como diff en este archivo, no se pierda.
const LETREROS = [
  ["letrero-quien-juega-en", "Who is playing?", "Tap your picture."],
  ["letrero-quien-juega-es", "¿Quién juega?", "Toca tu dibujo."], // es-MX y es-ES
  ["letrero-quien-juega-fr-FR", "Qui joue ?", "Touche ton dessin."],
  ["letrero-quien-juega-pt-BR", "Quem vai jogar?", "Toque no seu desenho."],
  ["letrero-quien-juega-pt-PT", "Quem vai jogar?", "Toca no teu desenho."],
  ["letrero-quien-juega-de-DE", "Wer spielt?", "Tippe auf dein Bild."],
];

function prompt(titulo, subtitulo) {
  return (
    `Using this exact wooden hanging sign as a strict visual reference (same wood grain, same color, same shape, same ropes): ` +
    `deeply carve and engrave the text "${titulo}" in large bold letters into the top half of the wooden plank, ` +
    `and carve the smaller text "${subtitulo}" below it in the bottom half, both carved DEEPLY into the wood surface with visible ` +
    `shadow inside the grooves of each letter. Spell each word EXACTLY as written above, letter by letter, double-check the ` +
    `spelling before drawing — do not add, remove, or swap any letter. Legible, natural wood grain around the letters, no flat ` +
    `painted text, no sticker, no decal — the letters must look physically carved into the wood. ` +
    `Isolated on a plain flat solid white background filling the entire frame — no grass, no ground, no plants, no leaves, ` +
    `no dirt, no scenery, no shadow cast on any surface, nothing else in the frame except the sign and its two ropes, no watermark.`
  );
}

async function generar(texto, refB64) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llave()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: texto }, { inline_data: { mime_type: "image/png", data: refB64 } }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
      signal: AbortSignal.timeout(180_000),
    },
  );
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  const b64 = parte?.inlineData?.data;
  if (!b64) throw new Error(`respuesta sin imagen: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

function convertir(clave) {
  const crudo = join(RAW, `${clave}.png`);
  const png = join(RAW, `${clave}-alfa.png`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", "colorkey=0xFFFFFF:0.15:0.08", png]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", join(OUT, `${clave}.webp`)]);
}

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}
if (!existsSync(REFERENCIA)) {
  console.error(`error: no existe ${REFERENCIA} — hace falta el letrero en blanco ya aprobado como referencia.`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");
const refB64 = readFileSync(REFERENCIA).toString("base64");

let hechos = 0;
for (const [clave, titulo, subtitulo] of LETREROS) {
  if (solo && !clave.includes(solo)) continue;
  if (existsSync(join(OUT, `${clave}.webp`)) && !forzar) {
    console.log(`· ${clave} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${clave} — generando ("${titulo}" / "${subtitulo}")\n`);
  try {
    const img = await generar(prompt(titulo, subtitulo), refB64);
    writeFileSync(join(RAW, `${clave}.png`), img);
    convertir(clave);
    hechos++;
    console.log(`✓ ${clave} — WebP con alfa en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${clave} — ${err.message}`);
  }
}

console.log(`\n${hechos} letrero(s) generado(s). REVISIÓN DE ORTOGRAFÍA obligatoria antes de commitear (D-080) — el título grande suele salir bien, el subtítulo es donde se vio el error en la prueba.`);
