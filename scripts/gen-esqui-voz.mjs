#!/usr/bin/env node
// gen-esqui-voz.mjs — la voz de Larry para el Modo Esquí, pregenerada vía
// ElevenLabs Text-to-Speech (mismo proveedor, misma llave y mismo patrón de
// `-antes`/`-despues` para números intercalados que `gen-voz-larry.mjs`).
//
// El guion (qué dice Larry, en qué locale) vive en `./datos/guion-esqui.mjs`
// — otra sesión lo está autorando en paralelo y puede que ese archivo NO
// EXISTA todavía en el momento en que se lee este script. Es esperado: el
// `import` de abajo es el import normal, sin condicionarlo, porque este
// archivo es scaffolding y no se ejecuta hasta que `guion-esqui.mjs` exista.
//
// Diferencia clave con `gen-voz-larry.mjs`: aquél solo cubre es-MX/es-ES.
// Este cubre los locales que `GUION_ESQUI` vaya teniendo — hoy solo es-MX,
// más se agregan ahí sin tocar código aquí — con un flag `--locale` para
// generar uno solo a la vez.
//
// Uso:   node scripts/gen-esqui-voz.mjs                    genera lo que falte, todos los locales de GUION_ESQUI
//        node scripts/gen-esqui-voz.mjs --locale fr-FR      solo ese locale
//        node scripts/gen-esqui-voz.mjs --solo victoria     solo claves que casen
//        node scripts/gen-esqui-voz.mjs --forzar            regenera aunque exista
//        node scripts/gen-esqui-voz.mjs --seco               no genera nada, solo lista qué haría

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GUION_ESQUI } from "./datos/guion-esqui.mjs";

const RAIZ = new URL("..", import.meta.url).pathname;
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.ELEVENLABS_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.ELEVENLABS_API_KEY;

// Mapa de voz por locale — hoy solo `es-MX` tiene voz asignada, la voz
// clonada "Kilowatto" que ya usa `gen-voz-larry.mjs`. Los otros 6 locales
// (en, fr-FR, pt-BR, pt-PT, de-DE, es-ES si difiere de es-MX) usan hoy la
// MISMA voz clonada, vía `eleven_multilingual_v2` — el modelo es
// multilingüe, así que una sola voz alcanza para los siete mientras nadie
// pida una voz nativa por idioma. Se agregan aquí cuando `GUION_ESQUI`
// tenga esos locales: la forma de mapa permite cambiar una sola voz por
// locale después sin tocar código en ningún otro lado.
// D-203 (2026-08-12) autorizó explícitamente usar la MISMA voz clonada de
// Kilowatto en los 7 locales, vía `eleven_multilingual_v2` — por eso los 7
// apuntan al mismo VOICE_ID hoy. La forma de mapa (no un string suelto)
// existe para que el día que se decida una voz distinta por locale, sea
// un cambio de dato, no de código.
const VOICE_ID_POR_LOCALE = {
  "es-MX": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "en": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "fr-FR": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "pt-BR": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "pt-PT": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "de-DE": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
  "es-ES": process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ",
};

/** Divide una frase con `{n}` en sus dos mitades; null si no lleva marcador.
 * Copiado de `gen-voz-larry.mjs` — mismo comportamiento exacto. */
function partirEnDos(clave, frase) {
  if (!frase.includes("{n}")) return null;
  const [antes, despues] = frase.split("{n}");
  return [[`${clave}-antes`, antes.trim()], [`${clave}-despues`, despues.trim()]];
}

async function generarTts(texto, voiceId) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": llave(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text: texto,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.85 },
      }),
      signal: AbortSignal.timeout(120_000),
    },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Caracteres restantes en la cuota de ElevenLabs — `GET /v1/user/subscription`,
 * misma auth (`xi-api-key`) que el TTS. */
async function caracteresRestantes() {
  const res = await fetch("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": llave() },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs (subscription) respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  return json.character_limit - json.character_count;
}

function convertir(locale, id) {
  const crudo = join(RAW, `${locale}-${id}.mp3`);
  const salida = join(RAIZ, "apps/web/public/voz", locale, `${id}.mp3`);
  // Mismo piso de -14 LUFS que `gen-voz-larry.mjs`.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-b:a", "64k", salida]);
}

async function principal() {
  const args = process.argv.slice(2);
  const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
  const forzar = args.includes("--forzar");
  const seco = args.includes("--seco");
  const localeArg = args.includes("--locale") ? args[args.indexOf("--locale") + 1] : null;

  const locales = localeArg ? [localeArg] : Object.keys(GUION_ESQUI);

  // Arma la lista final por locale, partiendo las frases con `{n}` igual
  // que `gen-voz-larry.mjs`, y aplicando `--solo` ya de una vez.
  //
  // Forma real de `GUION_ESQUI[locale]` (confirmada leyendo
  // `datos/guion-esqui.mjs`, no la que se había anticipado al escribir este
  // script): un arreglo de objetos `{clave, texto, tono, banda,
  // revisadoPor}`, no de tuplas `[clave, frase]`. Se extrae solo
  // `clave`/`texto` aquí — `tono`/`banda` quedan sin usar por ahora; filtrar
  // por banda (por ejemplo, generar solo "kinder") es una extensión futura,
  // no algo que este lote necesite todavía.
  const piezasPorLocale = {};
  for (const locale of locales) {
    const guionLocale = GUION_ESQUI[locale];
    if (!guionLocale) {
      console.error(`error: el locale "${locale}" no está en GUION_ESQUI`);
      process.exit(1);
    }
    const piezas = guionLocale
      .map(({ clave, texto }) => [clave, texto])
      .flatMap(([clave, frase]) => partirEnDos(clave, frase) ?? [[clave, frase]]);
    piezasPorLocale[locale] = solo ? piezas.filter(([id]) => id.includes(solo)) : piezas;

    // El archivo de datos documenta en su propia cabecera que TODA línea
    // trae `revisadoPor: null` hoy — borrador de primera pasada, sin
    // revisión humana (CLAUDE.md §Contenido: un ítem redactado con ayuda de
    // IA siempre pasa por revisión humana antes de grabarse o publicarse).
    // Este script no bloquea la generación por eso —no le corresponde
    // decidir eso solo— pero lo señala para que quien lo corra lo sepa.
    const sinRevisar = guionLocale.filter((l) => l.revisadoPor == null).length;
    if (sinRevisar > 0) {
      console.log(`⚠ ${locale}: ${sinRevisar} de ${guionLocale.length} línea(s) del guion siguen con revisadoPor: null (borrador sin revisión humana).`);
    }
  }

  if (seco) {
    console.log("--seco: no se llama a ninguna API, solo se lista qué se generaría.\n");
    let totalLlamadas = 0;
    for (const locale of locales) {
      const piezas = piezasPorLocale[locale];
      console.log(`${locale} — ${piezas.length} clip(s):`);
      for (const [id] of piezas) console.log(`  - ${id}`);
      totalLlamadas += piezas.length;
    }
    console.log(`\nTotal: ${totalLlamadas} llamada(s) a la API de ElevenLabs TTS.`);
    process.exit(0);
  }

  if (!llave()) {
    console.error("error: falta ELEVENLABS_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
    process.exit(1);
  }

  // Chequeo de cuota ANTES de generar nada — mejor detenerse antes que
  // quedarse a medias con un lote de TTS costoso.
  const necesarios = locales.reduce(
    (suma, locale) => suma + piezasPorLocale[locale].reduce((s, [, texto]) => s + texto.length, 0),
    0,
  );
  const restantes = await caracteresRestantes();
  console.log(`ElevenLabs: ${restantes} caracteres restantes en la cuota; este lote necesita ${necesarios}.`);
  if (restantes < necesarios) {
    console.error(`error: cuota insuficiente (faltan ${necesarios - restantes} caracteres) — no se generó nada.`);
    process.exit(1);
  }

  mkdirSync(RAW, { recursive: true });

  let hechasTotal = 0;
  for (const locale of locales) {
    const outLocale = join(RAIZ, "apps/web/public/voz", locale);
    // Carpeta nueva para cualquier locale que no sea es-MX — no existe
    // todavía en `apps/web/public/voz/`.
    mkdirSync(outLocale, { recursive: true });

    const voiceId = VOICE_ID_POR_LOCALE[locale];
    if (!voiceId) {
      console.log(`· ${locale} — sin voz asignada en VOICE_ID_POR_LOCALE, se salta por completo`);
      continue;
    }

    let hechas = 0;
    for (const [id, texto] of piezasPorLocale[locale]) {
      const destino = join(outLocale, `${id}.mp3`);
      if (existsSync(destino) && !forzar) {
        console.log(`· ${locale}/${id} — ya existe, se salta (--forzar para regenerar)`);
        continue;
      }
      process.stdout.write(`… ${locale}/${id} — generando ("${texto.slice(0, 40)}${texto.length > 40 ? "…" : ""}")\n`);
      try {
        const audio = await generarTts(texto, voiceId);
        writeFileSync(join(RAW, `${locale}-${id}.mp3`), audio);
        convertir(locale, id);
        hechas++;
        console.log(`✓ ${locale}/${id} — ${(audio.length / 1024).toFixed(0)} KB crudo, mp3 en ${outLocale}`);
      } catch (err) {
        console.error(`✗ ${locale}/${id} — ${err.message}`);
      }
    }
    console.log(`${hechas} clip(s) generado(s) para ${locale}.`);
    hechasTotal += hechas;
  }

  console.log(`\n${hechasTotal} clip(s) generado(s) en total.`);
  console.log(
    "Revisión de OÍDO obligatoria antes de commitear (D-080) — en especial que el tono nunca suene " +
      "condescendiente (línea roja #7), y que los pares -antes/-despues empalmen limpio con el número " +
      "intercalado al reproducirse.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
