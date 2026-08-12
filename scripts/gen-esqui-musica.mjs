#!/usr/bin/env node
// gen-esqui-musica.mjs — música de fondo del Modo Esquí, vía ElevenLabs Music
// (mismo endpoint y misma excepción a D-035 que `gen-musica-fondo.mjs`).
//
// El modo esquí es "wow tipo Angry Birds": deslizamiento sin parar, más
// intenso que la exploración calmada del mapa de KINDER. Las 8 pistas de
// aquí (4 biomas × 2 ánimos) son deliberadamente más enérgicas en conjunto
// que las 8 de `gen-musica-fondo.mjs` — incluso el ánimo "calma" de este
// modo (pantalla previa/menú del reto) es más animado que el "calma" del
// mapa, porque el contexto entero es de aventura sin pausa, no de
// exploración tranquila.
//
// Endpoint: POST https://api.elevenlabs.io/v1/music, header `xi-api-key`,
// body JSON {prompt, music_length_ms} — igual que `gen-musica-fondo.mjs`.
//
// Uso:   node scripts/gen-esqui-musica.mjs                genera lo que falte
//        node scripts/gen-esqui-musica.mjs --solo nieve   solo claves que casen
//        node scripts/gen-esqui-musica.mjs --forzar       regenera aunque exista
//        node scripts/gen-esqui-musica.mjs --seco         no genera nada, solo lista qué haría

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/esqui");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.ELEVENLABS_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.ELEVENLABS_API_KEY;

// Mismo loop de 60s que `gen-musica-fondo.mjs` — elección deliberada, no el
// tope de la API (que acepta hasta 600_000 ms).
const DURACION_MS = 60_000;

// [clave, prompt] — musica-esqui-{bioma}-{calma|energia}, 4 biomas × 2 ánimos.
const PISTAS = [
  [
    "musica-esqui-sabana-calma",
    "Warm, breezy, seamless-loop instrumental background music for the " +
      "pre-run menu of a children's high-energy skiing/sliding math game " +
      "set in an African savanna. Light hand percussion (djembe-like), " +
      "playful pizzicato strings, cheerful and anticipatory, more upbeat " +
      "than a calm exploration track but still relaxed, no vocals, no " +
      "lyrics, no sudden dynamic changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-sabana-energia",
    "High-energy, driving, seamless-loop instrumental background music for " +
      "a non-stop sliding/skiing children's math game set in an African " +
      "savanna. Fast hand percussion, energetic pizzicato strings and " +
      "brass stabs, thrilling and adventurous mood like a fast arcade " +
      "runner, exciting but never scary or tense, no vocals, no lyrics, no " +
      "sudden dynamic changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-desierto-calma",
    "Warm, spacious, seamless-loop instrumental background music for the " +
      "pre-run menu of a children's high-energy skiing/sliding math game " +
      "set in a sandy desert. Breathy wind flute, light hand drums, " +
      "cheerful and anticipatory, more upbeat than a calm exploration " +
      "track but still relaxed, no vocals, no lyrics, no sudden dynamic " +
      "changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-desierto-energia",
    "High-energy, driving, seamless-loop instrumental background music for " +
      "a non-stop sliding/skiing children's math game set in a sandy " +
      "desert. Fast hand drums, energetic breathy wind flute runs, " +
      "thrilling and adventurous mood like a fast arcade runner, exciting " +
      "but never scary or tense, no vocals, no lyrics, no sudden dynamic " +
      "changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-nieve-calma",
    "Bright, crisp, seamless-loop instrumental background music for the " +
      "pre-run menu of a children's high-energy skiing/sliding math game " +
      "set in snowy mountains. Crystalline bells, light glockenspiel, " +
      "cheerful and anticipatory, more upbeat than a calm exploration " +
      "track but still relaxed, no vocals, no lyrics, no sudden dynamic " +
      "changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-nieve-energia",
    "High-energy, driving, seamless-loop instrumental background music for " +
      "a non-stop sliding/skiing children's math game set in snowy " +
      "mountains. Fast bright bells, energetic glockenspiel runs and a " +
      "driving pulse, thrilling and adventurous mood like a fast arcade " +
      "runner, exciting but never scary or tense, no vocals, no lyrics, no " +
      "sudden dynamic changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-costa-calma",
    "Bright, breezy, seamless-loop instrumental background music for the " +
      "pre-run menu of a children's high-energy skiing/sliding math game " +
      "set on a tropical coastline. Light ukulele, gentle marimba, " +
      "cheerful and anticipatory, more upbeat than a calm exploration " +
      "track but still relaxed, no vocals, no lyrics, no sudden dynamic " +
      "changes, loops cleanly from end back to start.",
  ],
  [
    "musica-esqui-costa-energia",
    "High-energy, driving, seamless-loop instrumental background music for " +
      "a non-stop sliding/skiing children's math game set on a tropical " +
      "coastline. Fast marimba runs, energetic steel drum accents and a " +
      "driving pulse, thrilling and adventurous mood like a fast arcade " +
      "runner, exciting but never scary or tense, no vocals, no lyrics, no " +
      "sudden dynamic changes, loops cleanly from end back to start.",
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
  // Mismo bitrate que `gen-musica-fondo.mjs` (música de fondo, no la fuente
  // maestra), sin loudnorm — igual criterio que el original.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-b:a", "96k", salida]);
}

async function principal() {
  const args = process.argv.slice(2);
  const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
  const forzar = args.includes("--forzar");
  const seco = args.includes("--seco");

  const piezas = PISTAS.filter(([id]) => !solo || id.includes(solo));

  if (seco) {
    console.log(`--seco: se generarían ${piezas.length} pista(s), sin llamar a ninguna API:`);
    for (const [id] of piezas) console.log(`  - ${id}`);
    console.log(`\nTotal: ${piezas.length} llamada(s) a la API de ElevenLabs Music.`);
    process.exit(0);
  }

  if (!llave()) {
    console.error("error: falta ELEVENLABS_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  mkdirSync(RAW, { recursive: true });

  let hechas = 0;
  for (const [id, prompt] of piezas) {
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

  console.log(`\n${hechas} pista(s) generada(s). Revisión de OÍDO pendiente antes de commitear (D-080) — escúchalas completas: el loop tiene que cerrar limpio.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
