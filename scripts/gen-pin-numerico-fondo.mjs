#!/usr/bin/env node
// gen-pin-numerico-fondo.mjs — fondo y textura de botón del PIN numérico (D-197.1).
//
// El dueño vio la primera versión del teclado numérico (D-197 §2) — cuadros
// blancos con borde, sin nada — y la señaló como "esto está fatal, quitaste
// todo lo increíble del app por algo blanco". Pidió imágenes fotorrealistas,
// "gráficamente coherente" con el resto de la app.
//
// Primera ronda: un fondo de escena nuevo y UNA textura de botón de madera
// que los 10 dígitos reusaban, con el número pintado por CSS encima. El
// dueño vio esa versión ("Mucho mejor!") y pidió el siguiente paso: "manda a
// hacer los 10 botones para que se vean grabados bien" — el dígito TALLADO
// en la madera de verdad, no un texto plano encima. Ahí es donde SÍ hace
// falta una pieza fotorrealista por dígito.
//
// `pin-numerico-boton.png` (la textura ya aprobada) se manda como imagen de
// REFERENCIA en las 10 llamadas de talla — mismo truco que
// `gen-larry-fotorrealista.mjs` usa para mantener a Larry consistente entre
// cuadros: sin la referencia, cada dígito saldría con su propio tono/veta de
// madera, y las 10 fichas se verían como maderas distintas en vez de la
// misma plancha con 10 números tallados.

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
    "pin-numerico-fondo",
    "A warm, photorealistic outdoor scene in portrait orientation: a cozy " +
      "wooden garden gate standing open among soft green rolling hills, " +
      "golden hour sunlight, warm and inviting mood, shallow depth of " +
      "field, no people, no animals, no text, no logos, no watermark, " +
      "professional photography style, vertical 1:2 aspect ratio.",
    { alfa: false, ancho: 800, alto: 1600 },
  ],
  [
    "pin-numerico-letrero",
    "A photorealistic wooden plank sign hanging from two ropes tied to a " +
      "hook above, completely blank with no text or carvings, warm honey-" +
      "brown wood matching a garden gate, natural hemp rope, straight-on " +
      "front view, isolated on a plain solid white background filling the " +
      "whole frame, no watermark.",
    { alfa: true, ancho: 900, alto: 420 },
  ],
  [
    "pin-numerico-marco",
    "A photorealistic small square wooden picture frame, simple and " +
      "rustic, hanging from a small rope loop over a hook above, with a " +
      "completely flat plain white blank interior (no picture, no glass " +
      "glare, just flat white), warm honey-brown wood matching a garden " +
      "gate, straight-on front view, isolated on a plain solid white " +
      "background filling the whole frame, no watermark.",
    { alfa: true, ancho: 420, alto: 480 },
  ],
  [
    "pin-numerico-boton",
    "An extreme close-up macro photograph of natural wood grain texture, " +
      "warm honey-brown color, filling the entire square frame edge to " +
      "edge with no visible borders, no rounded corners, no background, " +
      "no isolated object — just a seamless full-bleed wood texture photo, " +
      "soft even natural lighting, no text, no numbers, no carvings, no " +
      "watermark.",
    { alfa: false, ancho: 256, alto: 256 },
  ],
];

/**
 * Los 10 dígitos tallados — cada uno pide "el MISMO" tono de madera que la
 * referencia (D-197.1, segunda ronda: "que se vean grabados bien"). Se
 * generan aparte de `PIEZAS` porque llevan imagen de referencia y las otras
 * dos no.
 */
const REFERENCIA_ID = "pin-numerico-boton";
const DIGITOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => [
  `pin-numerico-digito-${d}`,
  `Using this exact same wood texture and color as a strict visual ` +
    `reference: an extreme close-up macro photograph of a wood tile with ` +
    `the number "${d}" deeply carved and engraved into the wood surface, ` +
    `natural shadow inside the carved grooves, warm honey-brown wood grain ` +
    `matching the reference exactly, filling the entire square frame edge ` +
    `to edge with no visible borders, no rounded corners, no background, ` +
    `no watermark, professional macro photography.`,
  { alfa: false, ancho: 256, alto: 256 },
]);

function referenciaBase64() {
  const ruta = join(RAW, `${REFERENCIA_ID}.png`);
  if (!existsSync(ruta)) return null;
  return readFileSync(ruta).toString("base64");
}

/**
 * El estado PRESIONADO de cada botón (D-197.1, cuarta ronda: "todos los
 * estados en imágenes") — 10 fotos más, cada una con referencia a SU PROPIO
 * dígito ya aprobado (no la textura en blanco): así el número tallado es
 * exactamente el mismo, solo cambia la iluminación para verse hundido.
 */
const DIGITOS_PRESIONADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => [
  `pin-numerico-digito-${d}-presionado`,
  `pin-numerico-digito-${d}`,
  `Using this exact same wood tile with the carved number "${d}" as a ` +
    `strict visual reference (identical wood grain, identical carved ` +
    `numeral shape and position): create the SAME tile but looking pressed ` +
    `down and recessed — noticeably darker overall, a deeper shadow inside ` +
    `the carved groove, a subtle darker vignette around the outer edges as ` +
    `if the tile is pushed inward, same wood color and grain, filling the ` +
    `entire square frame edge to edge, no watermark.`,
  { alfa: false, ancho: 256, alto: 256 },
]);

async function generar(prompt, refB64) {
  const parts = refB64 ? [{ text: prompt }, { inline_data: { mime_type: "image/png", data: refB64 } }] : [{ text: prompt }];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${llave()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
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

function convertir(id, extension, { alfa, ancho, alto }) {
  const crudo = join(RAW, `${id}.${extension}`);
  const webp = join(OUT, `${id}.webp`);
  if (alfa) {
    const png = join(RAW, `${id}-alfa.png`);
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", crudo,
      "-vf", `colorkey=0xFFFFFF:0.15:0.08,scale=${ancho}:${alto}`,
      png,
    ]);
    execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
  } else {
    const png = join(RAW, `${id}-recortado.png`);
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", `scale=${ancho}:${alto}`, png]);
    // Calidad 88 en un fondo grande (800×1600) da ~210KB — por encima del
    // presupuesto de 120KB de `audits/bundle-budget.mjs` (mc-47 §4, Android
    // de gama baja sobre 4G). 75 en una foto con desenfoque de profundidad
    // (la escena del portón lo tiene a propósito) es visualmente idéntica y
    // pesa la mitad — confirmado a ojo antes de commitear (D-080).
    const calidad = ancho * alto > 200_000 ? 75 : 88;
    execFileSync("cwebp", ["-q", String(calidad), png, "-o", webp]);
  }
}

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt, opciones] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.webp`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando\n`);
  try {
    const img = await generar(prompt);
    writeFileSync(join(RAW, `${id}.png`), img);
    convertir(id, "png", opciones);
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

// Los 10 dígitos tallados — con la textura ya aprobada como referencia.
const refB64 = referenciaBase64();
if (!refB64) {
  console.log(`aviso: no hay ${REFERENCIA_ID}.png en ${RAW} — genera esa pieza primero (sin --solo).`);
} else {
  for (const [id, prompt, opciones] of DIGITOS) {
    if (solo && !id.includes(solo)) continue;
    const yaExiste = existsSync(join(OUT, `${id}.webp`));
    if (yaExiste && !forzar) {
      console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
      continue;
    }
    process.stdout.write(`… ${id} — generando (con referencia)\n`);
    try {
      const img = await generar(prompt, refB64);
      writeFileSync(join(RAW, `${id}.png`), img);
      convertir(id, "png", opciones);
      hechas++;
      console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
    } catch (err) {
      console.error(`✗ ${id} — ${err.message}`);
    }
  }
}

// Los 10 estados presionados — cada uno con SU PROPIO dígito ya aprobado
// como referencia (no la textura en blanco).
for (const [id, refId, prompt, opciones] of DIGITOS_PRESIONADOS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.webp`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  const rutaRef = join(RAW, `${refId}.png`);
  if (!existsSync(rutaRef)) {
    console.log(`aviso: no hay ${refId}.png — genera ese dígito primero.`);
    continue;
  }
  const refDigitoB64 = readFileSync(rutaRef).toString("base64");
  process.stdout.write(`… ${id} — generando (con referencia)\n`);
  try {
    const img = await generar(prompt, refDigitoB64);
    writeFileSync(join(RAW, `${id}.png`), img);
    convertir(id, "png", opciones);
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) generada(s). Revisión humana pendiente antes de commitear (D-080).`);
