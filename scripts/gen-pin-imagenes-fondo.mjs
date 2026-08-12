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

/**
 * Se RECORTA el relleno antes de escalar, y esto no es un detalle.
 *
 * Gemini **ignora la proporción que se le pide**. Para el 1:2 de esta pantalla
 * devolvió la foto dentro de un lienzo con franjas BLANCAS a los lados, y el
 * `scale` de la primera versión las conservó: el archivo medía 800x1600
 * —correcto— con la foto en 639 px centrados y 80 px de blanco a cada lado.
 *
 * En el teléfono eso se veía como una pantalla de PIN encogida con bandas
 * blancas, y costó una sesión entera de diagnóstico contra Phaser, que dibujaba
 * la imagen cubriendo la pantalla exacta. El blanco lo ponía el PNG.
 * `audits/fondos-sin-bandas.mjs` lo bloquea desde entonces.
 *
 * La detección va en Node y no con `cropdetect` de ffmpeg: ese filtro no emite
 * nada para una imagen suelta —probado— y además busca bordes NEGROS, que es lo
 * contrario del caso. Aquí se leen los píxeles y se recorta lo que sea blanco o
 * negro plano, igual que `audits/fondos-sin-bandas.mjs`.
 */
function recorte(crudo) {
  const { width, height } = tamanoPng(crudo);
  const rgb = execFileSync("ffmpeg", ["-v", "error", "-i", crudo, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], {
    maxBuffer: 512 * 1024 * 1024,
    encoding: "buffer",
  });
  const px = (x, y) => {
    const i = (y * width + x) * 3;
    return [rgb[i], rgb[i + 1], rgb[i + 2]];
  };
  const relleno = (c) =>
    (c[0] >= 245 && c[1] >= 245 && c[2] >= 245) || (c[0] <= 12 && c[1] <= 12 && c[2] <= 12);
  /**
   * Cuatro píxeles más por cada lado, y hacen falta.
   *
   * El primer recorte se quedó justo en el último píxel puro y **dejó rayas
   * blancas finas** en el teléfono: entre la banda y la foto hay un halo de
   * píxeles casi blancos (250,253,221 medido) que toda compresión con pérdida
   * deja en un borde duro. Con umbral 245 el halo no cuenta como relleno y se
   * queda dentro; a 2 px de blanco en un borde el ojo los ve igual.
   *
   * Lo cazó el dueño en su iPhone: «tiene unas rayas muy pequeñas». Cuatro
   * píxeles de una foto de fondo no se echan de menos; dos de blanco sí.
   */
  const MARGEN = 4;
  const columnaRelleno = (x) => {
    for (let y = 40; y < height - 40; y += 50) if (!relleno(px(x, y))) return false;
    return true;
  };
  const filaRelleno = (y) => {
    for (let x = 40; x < width - 40; x += 50) if (!relleno(px(x, y))) return false;
    return true;
  };

  let x0 = 0;
  while (x0 < width / 2 && columnaRelleno(x0)) x0++;
  let x1 = width - 1;
  while (x1 > width / 2 && columnaRelleno(x1)) x1--;
  let y0 = 0;
  while (y0 < height / 2 && filaRelleno(y0)) y0++;
  let y1 = height - 1;
  while (y1 > height / 2 && filaRelleno(y1)) y1--;

  if (x0 > 0) x0 += MARGEN;
  if (x1 < width - 1) x1 -= MARGEN;
  if (y0 > 0) y0 += MARGEN;
  if (y1 < height - 1) y1 -= MARGEN;

  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  if (w === width && h === height) return null;
  console.log(`  · recortado: ${width}x${height} → ${w}x${h} (relleno plano en el borde)`);
  return `${w}:${h}:${x0}:${y0}`;
}

/** Ancho y alto de un PNG, leídos de su cabecera IHDR. */
function tamanoPng(ruta) {
  const b = readFileSync(ruta);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

function convertir(id, { ancho, alto }) {
  const crudo = join(RAW, `${id}.png`);
  const png = join(RAW, `${id}-recortado.png`);
  const webp = join(OUT, `${id}.webp`);
  const caja = recorte(crudo);
  const filtros = caja ? `crop=${caja},scale=${ancho}:-1` : `scale=${ancho}:-1`;
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", filtros, png]);
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
