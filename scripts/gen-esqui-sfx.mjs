#!/usr/bin/env node
// gen-esqui-sfx.mjs — efectos de un solo disparo y el ambiente de fondo del
// Modo Esquí (mismo endpoint que `gen-sfx.mjs`: `POST /v1/sound-generation`,
// `eleven_text_to_sound_v2`, pensado para clips cortos, no pistas musicales).
//
// Cuatro piezas: los tres momentos de disparo único del reto en sí
// (acertar/fallar una puerta, la meta) más UN loop ambiental de espectadores
// — el "wow tipo Angry Birds" pedido por el dueño necesita público, no solo
// SFX puntuales.
//
// `sfx-esqui-publico` es el único con duración VARIABLE: intenta primero
// ~20s (un ambiente de multitud necesita tiempo para no sonar como un loop
// de medio segundo cortado), y si ElevenLabs lo rechaza con un 4xx
// (`invalid_generation_settings`, el mismo tipo de error que ya documentó
// `gen-sfx.mjs` para el piso de 0.5s de los efectos cortos) baja a 15s y
// luego a 10s. El script registra en la consola, en tiempo real, cuál fue
// el límite real encontrado — no se puede anotar aquí de antemano porque
// este archivo es scaffolding y no se ejecuta todavía.
//
// Uso:   node scripts/gen-esqui-sfx.mjs                 genera lo que falte
//        node scripts/gen-esqui-sfx.mjs --solo victoria solo claves que casen
//        node scripts/gen-esqui-sfx.mjs --forzar        regenera aunque exista
//        node scripts/gen-esqui-sfx.mjs --seco          no genera nada, solo lista qué haría

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

// [id, prompt, duracionS] — duracionS es un número para los 3 efectos de
// disparo único, o un ARREGLO de candidatos (mayor a menor) para el
// ambiente, que se intentan en orden hasta que uno no reciba un 4xx.
const EFECTOS = [
  [
    "sfx-esqui-acierto",
    "A short, bright, cheerful success sound for a children's skiing math " +
      "game — passing through the correct gate, a satisfying quick chime " +
      "or bell sparkle, rewarding and happy but not overwhelming, under " +
      "one second, no music, no voice.",
    0.6,
  ],
  [
    "sfx-esqui-choque",
    "A short, soft 'bump' sound for a children's skiing game — hitting the " +
      "wrong gate, a gentle thud or soft impact, NOT a harsh crash, NOT " +
      "violent, NOT scary, never punishing or frightening for a young " +
      "child, under one second, no music, no voice.",
    0.7,
  ],
  [
    "sfx-esqui-victoria",
    "A short, cheerful victory fanfare for a children's skiing math game — " +
      "reaching the finish line, a bright triumphant little tune with " +
      "bells and brass, celebratory and warm, about one and a half " +
      "seconds, no lyrics, no voice.",
    1.5,
  ],
  // `sfx-esqui-publico`: ver nota de cabecera sobre la duración variable.
  ["sfx-esqui-publico", "A seamless-loop crowd ambience for a children's skiing game finish line, like a friendly olympic-style audience cheering and murmuring in the background, warm and encouraging, absolutely no identifiable words in any language, no music, no single dominant voice.", [20, 15, 10]],
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
    const err = new Error(`ElevenLabs respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Genera probando cada candidato de duración en orden; si uno recibe un
 * 4xx (`invalid_generation_settings` o similar), prueba el siguiente. Un
 * error que no sea 4xx (red, 5xx) se propaga de inmediato — solo el rechazo
 * explícito de la API justifica bajar la duración. */
async function generarConCandidatos(id, texto, candidatos) {
  for (let i = 0; i < candidatos.length; i++) {
    const d = candidatos[i];
    try {
      const audio = await generar(texto, d);
      if (i > 0) console.log(`  (${id}: ElevenLabs aceptó ${d}s tras rechazar ${candidatos.slice(0, i).join("s, ")}s)`);
      return audio;
    } catch (err) {
      const esUltimo = i === candidatos.length - 1;
      const es4xx = err.status >= 400 && err.status < 500;
      if (esUltimo || !es4xx) throw err;
      console.log(`  (${id}: ElevenLabs rechazó ${d}s con ${err.status}, probando ${candidatos[i + 1]}s)`);
    }
  }
}

function convertir(id) {
  const crudo = join(RAW, `${id}.mp3`);
  const salida = join(OUT, `${id}.mp3`);
  // Mismo loudnorm (-14 LUFS) que `gen-sfx.mjs` — sin esto, un efecto puede
  // salir de ElevenLabs 25-40dB más bajo que el resto de la misma corrida y
  // quedar inaudible en producción sin que ningún auditor de formato lo note.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-b:a", "64k", salida]);
}

async function principal() {
  const args = process.argv.slice(2);
  const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
  const forzar = args.includes("--forzar");
  const seco = args.includes("--seco");

  const piezas = EFECTOS.filter(([id]) => !solo || id.includes(solo));

  if (seco) {
    console.log(`--seco: se generarían ${piezas.length} efecto(s), sin llamar a ninguna API:`);
    for (const [id, , duracion] of piezas) {
      const etiqueta = Array.isArray(duracion) ? `${duracion.join("s → ")}s (candidatos en orden)` : `${duracion}s`;
      console.log(`  - ${id} (~${etiqueta})`);
    }
    console.log(`\nTotal: ${piezas.length} llamada(s) inicial(es) a la API de ElevenLabs sound-generation (el ambiente puede sumar reintentos si la API rechaza la duración).`);
    process.exit(0);
  }

  if (!llave()) {
    console.error("error: falta ELEVENLABS_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  mkdirSync(RAW, { recursive: true });

  let hechas = 0;
  for (const [id, texto, duracion] of piezas) {
    const yaExiste = existsSync(join(OUT, `${id}.mp3`));
    if (yaExiste && !forzar) {
      console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
      continue;
    }
    const candidatos = Array.isArray(duracion) ? duracion : [duracion];
    process.stdout.write(`… ${id} — generando (ElevenLabs sound-generation, ~${candidatos[0]}s)\n`);
    try {
      const audio = await generarConCandidatos(id, texto, candidatos);
      writeFileSync(join(RAW, `${id}.mp3`), audio);
      convertir(id);
      hechas++;
      console.log(`✓ ${id} — ${(audio.length / 1024).toFixed(0)} KB crudo, mp3 en ${OUT}`);
    } catch (err) {
      console.error(`✗ ${id} — ${err.message}`);
    }
  }

  console.log(`\n${hechas} efecto(s) generado(s). Revisión de OÍDO pendiente antes de commitear (D-080) — en particular sfx-esqui-choque: tiene que sonar como un tope suave, nunca como un castigo (línea roja #7), y sfx-esqui-publico: verificar que no se cuele ninguna palabra reconocible en ningún idioma.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
