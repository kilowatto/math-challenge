#!/usr/bin/env node
// gen-pin-imagenes-fondo.mjs — fondo fotorrealista de la rejilla de imágenes
// del PIN de KINDER (`kids/pin.astro`, rama `data-pin-tipo="imagenes"`).
//
// D-197.1 (2026-08-09) le dio al teclado NUMÉRICO un fondo fotorrealista y
// botones de madera tallada, y dejó la rejilla de imágenes de KINDER sin
// tocar ("ya estaba probada y aprobada"). El dueño, viéndola en vivo un día
// después (2026-08-10), la señaló igual que la primera versión del
// numérico: fondo blanco plano, botones de color sólido sin ningún
// tratamiento — "no tiene nada de la calidad, no es parte de la guía
// gráfica". Este script es la Ronda 1 de esa misma corrección para la
// rejilla de imágenes: un fondo nuevo, propio de esta pantalla.
//
// La textura de botón se REUSA de `pin-numerico-boton.webp` (ya generada y
// aprobada) — mismo tono de madera en las dos pantallas de PIN es MÁS
// coherente que inventar una segunda madera, y evita generar+revisar una
// pieza que ya existe.

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

const PIEZAS = [
  [
    "pin-imagenes-fondo",
    "A warm, photorealistic outdoor scene in portrait orientation: a sunny " +
      "children's meadow with soft green grass, scattered wildflowers, a " +
      "few friendly rounded haystacks in the far background, gentle " +
      "morning light, warm and inviting mood, shallow depth of field, no " +
      "people, no animals, no text, no logos, no watermark, professional " +
      "photography style, vertical 1:2 aspect ratio.",
    { alfa: false, ancho: 800, alto: 1600 },
  ],
];

async function generar(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llave()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
      signal: AbortSignal.timeout(180_000),
    },
  );
  if (!res.ok) {
    throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  const b64 = parte?.inlineData?.data;
  if (!b64) throw new Error(`respuesta sin imagen: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

function convertir(id, { ancho, alto }) {
  const crudo = join(RAW, `${id}.png`);
  const png = join(RAW, `${id}-recortado.png`);
  const webp = join(OUT, `${id}.webp`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", `scale=${ancho}:${alto}`, png]);
  // Mismo criterio que gen-pin-numerico-fondo.mjs: 75 en un fondo grande con
  // desenfoque de profundidad da la mitad del peso, visualmente idéntico
  // (mc-47 §4, presupuesto de audits/bundle-budget.mjs).
  const calidad = ancho * alto > 200_000 ? 75 : 88;
  execFileSync("cwebp", ["-q", String(calidad), png, "-o", webp]);
}

const args = process.argv.slice(2);
const forzar = args.includes("--forzar");

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt, opciones] of PIEZAS) {
  const yaExiste = existsSync(join(OUT, `${id}.webp`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando\n`);
  try {
    const img = await generar(prompt);
    writeFileSync(join(RAW, `${id}.png`), img);
    convertir(id, opciones);
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) generada(s). Revisión humana pendiente antes de commitear (D-080).`);
