#!/usr/bin/env node
// gen-sfx.mjs — efectos de un solo disparo del Modo Historia (D-198, ronda 2).
//
// El dueño, tras confirmar la música, pidió explícito: "Siempre música y
// efectos especiales... esto en un juego, que debe ser adictivo como angry
// bird". Tres efectos, los tres momentos que YA existen en el código y no
// tenían ningún sonido: tocar un botón/nodo, acertar un ítem, fallarlo.
// "Racha"/celebración de sesión se deja fuera a propósito — no existe todavía
// una pantalla de esa celebración en Phaser, y generar un sonido para un
// momento que no existe sería adivinar.
//
// Mismo endpoint que `gen-musica-fondo.mjs` documenta para música, pero es
// OTRO de ElevenLabs: `POST /v1/sound-generation` (`eleven_text_to_sound_v2`),
// pensado para efectos cortos, no para pistas musicales largas.

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

const EFECTOS = [
  [
    "sfx-toque",
    "A short, soft, friendly UI tap sound for a children's game button, " +
      "gentle wooden click with a light pop, warm and inviting, no music, no voice.",
    // ElevenLabs rechaza duration_seconds < 0.5 (visto en vivo: 400
    // invalid_generation_settings con 0.4) — 0.5 es el piso real de la API,
    // no una elección de diseño.
    0.5,
  ],
  [
    "sfx-acierto",
    "A short, bright, cheerful success chime for a children's math game — " +
      "correct answer sound, playful ascending bell/xylophone sparkle, " +
      "rewarding and happy but not overwhelming, under one second, no music, " +
      "no voice.",
    0.8,
  ],
  [
    "sfx-error",
    "A short, soft, gentle 'try again' sound for a children's math game — " +
      "NOT a harsh buzzer or failure sound, a warm neutral descending tone, " +
      "friendly and encouraging, never punishing or embarrassing, under one " +
      "second, no music, no voice.",
    0.7,
  ],
  // D-199, ronda 2: "como un videojuego, con efecto especial de sonido
  // cuando se abra y se cierre" — el panel de ajustes de perfil, no un botón
  // suelto. Un timbre de madera (encaja con el resto del atrezo de esta
  // pantalla) en vez de un "whoosh" digital genérico.
  [
    "sfx-panel-abre",
    "A short, satisfying wooden 'pop and swing open' sound effect for a UI " +
      "panel opening in a children's game — like a small wooden box or " +
      "picture frame swinging open with a light creak and a cheerful upward " +
      "flourish, warm and playful, under one second, no music, no voice.",
    0.7,
  ],
  [
    "sfx-panel-cierra",
    "A short, satisfying wooden 'close' sound effect for a UI panel closing " +
      "in a children's game — like a small wooden box or picture frame " +
      "closing with a soft thud, a gentle downward flourish, warm and " +
      "friendly, never abrupt or harsh, under one second, no music, no voice.",
    0.6,
  ],
];

// ─── SFX por mecánica (plan de mundo multi-bioma, 2026-08-09) ───────────────
//
// Los 5 efectos de arriba son de EVENTO (toqué algo / acerté / fallé) y se
// quedan universales — un "sí" no necesita sonar distinto según la mecánica.
// Estos 19 son de TEXTURA DE INTERACCIÓN: el sonido de CÓMO se tocó, uno por
// cada una de las 19 mecánicas de kinder (las 5 ya existentes ganan la suya
// propia también, en vez de compartir `sfx-toque` genérico — decisión del
// dueño: "19 SFX nuevos, uno por mecánica"). Universales entre los 4 biomas:
// un sonido no lleva paleta de color, y cuatro pops de burbuja casi
// idénticos por bioma sería gasto sin diferencia audible real.
const EFECTOS_MECANICA = [
  ["sfx-elegir", "A short, decisive, soft 'select' click for a children's math game — choosing one clear option among several, crisp but gentle, no music, no voice.", 0.5],
  ["sfx-contar-toque", "A short, soft, warm single counting tap sound for a children's game — like gently tapping a small wooden bead, meant to repeat quickly many times in a row without becoming annoying, no music, no voice.", 0.5],
  ["sfx-destello", "A very short bright shimmer or sparkle sound for a children's game, marking a brief flash of light on screen, delicate and quick, no music, no voice.", 0.5],
  ["sfx-casilla", "A short, soft 'fill the slot' click for a children's math game — like gently placing a small tile into an empty frame, satisfying but quiet, no music, no voice.", 0.5],
  ["sfx-descartar", "A short, soft, neutral 'set aside' sound for a children's game — gently pushing one item away from a group, never negative or buzzer-like, no music, no voice.", 0.5],
  ["sfx-ficha-conteo", "A short, gentle bead-drop or token-drop sound for a children's counting game — soft and light, meant to repeat quickly many times in a row, no music, no voice.", 0.5],
  ["sfx-burbuja-pop", "A short, cheerful bubble-pop sound for a children's game — light and bouncy, satisfying but not loud, no music, no voice.", 0.5],
  ["sfx-salto", "A short, playful hop or bounce sound for a children's game — a small object jumping a short distance, light and springy, no music, no voice.", 0.5],
  ["sfx-snap", "A short, soft mechanical snap or click for a children's game — a slider locking into place, satisfying and precise but gentle, no music, no voice.", 0.5],
  ["sfx-comparar", "A short, soft whoosh-in sound for a children's game — two things appearing briefly on screen to be compared, light and airy, no music, no voice.", 0.5],
  ["sfx-clasificar", "A short, soft 'drop into a basket' sound for a children's game — a light thud landing in a soft container, warm and satisfying, no music, no voice.", 0.5],
  ["sfx-voltear", "A short, crisp card-flip sound for a children's memory game — light paper-like flip, quick and clean, no music, no voice.", 0.5],
  ["sfx-pulso", "A short, warm single drum-tap or hand-clap sound for a children's rhythm game — meant to repeat steadily like a gentle heartbeat, no music, no voice.", 0.5],
  ["sfx-progreso", "A short, soft rising tick sound for a children's game — one small step of a gauge filling up, light and encouraging, meant to repeat several times in a row, no music, no voice.", 0.5],
  ["sfx-trazo", "A short, soft gliding whoosh sound for a children's game — a finger gently tracing a short path, airy and smooth, no music, no voice.", 0.6],
  ["sfx-pista", "A short, gentle friendly chime for a children's game — a helpful hint appearing on screen, warm and inviting, never urgent, no music, no voice.", 0.6],
  ["sfx-fusion", "A short, soft magical merge whoosh for a children's game — two small things combining into one, warm and rounded, no music, no voice.", 0.6],
  ["sfx-incremento", "A short, soft double-tone tick for a children's math game — one small click followed immediately by a slightly higher-pitched click, light and clear, no music, no voice.", 0.5],
  ["sfx-blanco", "A short, satisfying 'lock-on' catch sound for a children's game — successfully tapping a moving target right as it passes, bright and quick, no music, no voice.", 0.5],
];

async function generar(texto, duracionS) {
  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST",
    headers: {
      "xi-api-key": llave(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texto, duration_seconds: duracionS }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function convertir(id) {
  const crudo = join(RAW, `${id}.mp3`);
  const salida = join(OUT, `${id}.mp3`);
  // Un efecto corto no necesita el bitrate de una pista musical — 64kbps es
  // inaudible como pérdida en menos de un segundo y pesa una fracción.
  //
  // `loudnorm` (EBU R128) a propósito, y no solo `-b:a`: se midió con
  // `volumedetect` que `sfx-toque` salió de ElevenLabs ~25-40dB más bajo
  // que el resto de los efectos generados en la MISMA corrida — la API no
  // normaliza entre generaciones, y sin esto un efecto puede quedar
  // inaudible en producción sin que ningún auditor lo detecte (un mp3
  // válido y silencioso pasa cualquier chequeo de formato). Un target de
  // -14 LUFS es el mismo piso que ya usan las plataformas de streaming
  // para voz/efectos cortos — suficientemente alto para notarse sobre la
  // música de fondo sin distorsionar.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-b:a", "64k", salida]);
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
for (const [id, texto, duracionS] of [...EFECTOS, ...EFECTOS_MECANICA]) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.mp3`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando (ElevenLabs sound-generation, ~${duracionS}s)\n`);
  try {
    const audio = await generar(texto, duracionS);
    writeFileSync(join(RAW, `${id}.mp3`), audio);
    convertir(id);
    hechas++;
    console.log(`✓ ${id} — ${(audio.length / 1024).toFixed(0)} KB crudo, mp3 en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} efecto(s) generado(s). Revisión de OÍDO pendiente antes de commitear (D-080) — en particular sfx-error: tiene que sonar neutral, nunca como un castigo (línea roja #7).`);
