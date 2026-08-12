#!/usr/bin/env node
// gen-musica-fondo.mjs — música de fondo de Modo Historia, vía ElevenLabs Music (D-198).
//
// Reversa puntual de D-035 ("solo Cloudflare") y de `PRESUPUESTO.musica` de
// `packages/tutor/src/voz.ts` (antes `false` en los dos regímenes) — el dueño
// la autorizó explícitamente para este caso, sabiendo que ElevenLabs Music es
// un servicio fuera de Cloudflare y que no hay tarifa gratuita para música.
//
// Dos pistas por ahora (D-198): "calma" para mapa/menú/¿quién-juega?, "energia"
// para el reto en sí. Cada una es un loop, generado UNA vez, revisado por
// oído por el dueño (D-080, mismo estándar que el arte de Larry) antes de
// commitear — este script no puede sustituir esa revisión.
//
// Endpoint confirmado en la documentación de ElevenLabs (2026-08-09):
// POST https://api.elevenlabs.io/v1/music, header `xi-api-key`, body JSON
// {prompt, music_length_ms, output_format vía query}. Devuelve el audio
// crudo (mp3), no JSON ni base64.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.ELEVENLABS_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.ELEVENLABS_API_KEY;

// Loop de 60s: suficientemente largo para no notarse repetitivo en una sesión
// típica de práctica, suficientemente corto para que el costo por generación
// sea acotado. `music_length_ms` acepta hasta 600_000 (10 min) — 60s es una
// elección deliberada, no el tope de la API.
const DURACION_MS = 60_000;

// Las 2 pistas universales de D-198 quedan REEMPLAZADAS por 8 pistas por
// bioma (plan de mundo multi-bioma, 2026-08-09: "8 pistas, una por bioma ×
// ánimo" en vez de mantener las 2 genéricas). El ánimo ("calma" en mapa/menú,
// "energía" en el reto) sigue siendo el mismo eje de siempre — lo que cambia
// es que ahora también varía por bioma, para que Sabana no suene igual que
// Nieve. `MusicManager.reproducir()` necesita el nombre del bioma actual
// además del ánimo para elegir la pista correcta — cambio de firma pendiente,
// no incluido en este script.
const PISTAS = [
  [
    "musica-sabana-calma",
    "Gentle, warm, seamless-loop instrumental background music for a " +
      "children's educational adventure game map screen set in an African " +
      "savanna. Soft acoustic guitar, light hand percussion (djembe-like), " +
      "and warm woodwinds, slow tempo, cheerful but calm and unobtrusive, " +
      "no vocals, no lyrics, no sudden dynamic changes, loops cleanly from " +
      "end back to start.",
  ],
  [
    "musica-sabana-energia",
    "Upbeat, playful, seamless-loop instrumental background music for a " +
      "children's math game while solving a puzzle, set in an African " +
      "savanna. Warm hand percussion, pizzicato strings, curious and " +
      "encouraging mood — energetic but never tense or stressful, no " +
      "vocals, no lyrics, no sudden dynamic changes, loops cleanly from end " +
      "back to start.",
  ],
  [
    "musica-desierto-calma",
    "Gentle, spacious, seamless-loop instrumental background music for a " +
      "children's educational adventure game map screen set in a sandy " +
      "desert. Soft breathy wind flute, sparse warm plucked strings, wide " +
      "open and unhurried feeling, calm and unobtrusive, no vocals, no " +
      "lyrics, no sudden dynamic changes, loops cleanly from end back to " +
      "start.",
  ],
  [
    "musica-desierto-energia",
    "Upbeat, playful, seamless-loop instrumental background music for a " +
      "children's math game while solving a puzzle, set in a sandy desert. " +
      "Light hand drums, breathy wind flute accents, curious and " +
      "adventurous mood — energetic but never tense or stressful, no " +
      "vocals, no lyrics, no sudden dynamic changes, loops cleanly from end " +
      "back to start.",
  ],
  [
    "musica-nieve-calma",
    "Gentle, slow, seamless-loop instrumental background music for a " +
      "children's educational adventure game map screen set in snowy " +
      "mountains. Soft crystalline bells, gentle celesta, and a slow warm " +
      "pad underneath, calm and unobtrusive with a light wintry sparkle, " +
      "no vocals, no lyrics, no sudden dynamic changes, loops cleanly from " +
      "end back to start.",
  ],
  [
    "musica-nieve-energia",
    "Upbeat, playful, seamless-loop instrumental background music for a " +
      "children's math game while solving a puzzle, set in snowy mountains. " +
      "Bright bells, light glockenspiel, curious and encouraging mood — " +
      "energetic but never tense or stressful, no vocals, no lyrics, no " +
      "sudden dynamic changes, loops cleanly from end back to start.",
  ],
  [
    "musica-costa-calma",
    "Gentle, breezy, seamless-loop instrumental background music for a " +
      "children's educational adventure game map screen set on a tropical " +
      "coastline. Soft ukulele, gentle marimba, and a faint suggestion of " +
      "calm rolling waves in the background texture, calm and unobtrusive, " +
      "no vocals, no lyrics, no sudden dynamic changes, loops cleanly from " +
      "end back to start.",
  ],
  [
    "musica-costa-energia",
    "Upbeat, playful, seamless-loop instrumental background music for a " +
      "children's math game while solving a puzzle, set on a tropical " +
      "coastline. Bright marimba, light steel drum accents, curious and " +
      "encouraging mood — energetic but never tense or stressful, no " +
      "vocals, no lyrics, no sudden dynamic changes, loops cleanly from end " +
      "back to start.",
  ],
];

async function generar(prompt) {
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: {
      "xi-api-key": llave(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, music_length_ms: DURACION_MS }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function convertir(id) {
  const crudo = join(RAW, `${id}.mp3`);
  const salida = join(OUT, `${id}.mp3`);
  // 96kbps estéreo: música de fondo, no la fuente maestra — no hay presupuesto
  // de peso ya establecido para audio (bundle-budget.mjs solo mide imágenes),
  // así que este número es un juicio razonable, no una regla auditada.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-b:a", "96k", salida]);
}

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

if (!llave()) {
  console.error("error: falta ELEVENLABS_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt] of PISTAS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.mp3`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando (ElevenLabs Music, ~${DURACION_MS / 1000}s)\n`);
  try {
    const audio = await generar(prompt);
    writeFileSync(join(RAW, `${id}.mp3`), audio);
    convertir(id);
    hechas++;
    console.log(`✓ ${id} — ${(audio.length / 1024).toFixed(0)} KB crudo, mp3 en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pista(s) generada(s). Revisión de OÍDO pendiente antes de commitear (D-080) — escúchalas completas, no solo los primeros segundos: el loop tiene que cerrar limpio.`);
