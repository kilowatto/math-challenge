#!/usr/bin/env node
// gen-voz-larry.mjs — la voz de Larry, pregenerada (D-192, reservada y hasta
// hoy sin escribir). En español usa la voz clonada "Kilowatto" del dueño
// (fuera de este repositorio) vía ElevenLabs Text-to-Speech — mismo
// proveedor y misma llave que ya generan música (`gen-musica-fondo.mjs`) y
// SFX (`gen-sfx.mjs`), misma excepción puntual a D-035.
//
// Las otras 6 voces (en, fr-FR, pt-BR, pt-PT, de-DE, y es-ES si difiere de
// es-MX) siguen SIN DECIDIR — este script solo cubre `es-MX`/`es-ES` con
// Kilowatto. Extenderlo a los demás locales es una voz de ElevenLabs (u otro
// proveedor) por idioma, no una línea de código nueva: el mismo `VOICE_ID`
// se vuelve un mapa por locale cuando haya voces que poner ahí.
//
// ═══ Por qué los números viajan separados de la frase ═══════════════════════
//
// `packages/tutor/src/voz.ts` §5 ya lo manda: los números NO se componen
// fonéticamente (en alemán «21» es una sola palabra, «einundzwanzig», no
// decena+unidad pegadas). La consecuencia para AUDIO pregenerado es la
// misma: una frase como "vistes 3 burbujas" no se grava una vez por cada
// número posible — se grava la frase CORTADA en el punto donde va el
// número («vistes» + [espacio para el número] + «burbujas»), y en tiempo de
// reproducción el cliente concatena los DOS clips de la frase con el clip
// del número correspondiente (del catálogo `NUMEROS` de abajo, que también
// genera este script). Una frase con marcador `{n}` en el texto fuente se
// divide en `-antes`/`-despues`; una frase sin marcador se graba como una
// sola pieza.
//
// Uso:   node scripts/gen-voz-larry.mjs                  genera lo que falte
//        node scripts/gen-voz-larry.mjs --solo causa     solo claves que casen
//        node scripts/gen-voz-larry.mjs --forzar         regenera aunque exista

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/voz/es-MX");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.ELEVENLABS_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.ELEVENLABS_API_KEY;
// El id de la voz clonada "Kilowatto" en el panel de ElevenLabs del dueño —
// confirmado en vivo contra `GET /v1/voices` el 2026-08-09: única voz de
// categoría "cloned" en la cuenta, sin ambigüedad con las voces "premade" de
// biblioteca. No es secreto (a diferencia de `ELEVENLABS_API_KEY`, que sí
// vive solo en `.env`) — es un identificador de configuración, así que se
// escribe aquí en vez de capturarse con `set-keys.sh`. `KILOWATTO_VOICE_ID`
// sigue disponible como variable de entorno para sobreescribirlo sin tocar
// código, por ejemplo si el dueño reemplaza el clon.
const VOICE_ID = process.env.KILOWATTO_VOICE_ID ?? "PB3qgWFhiD1nqaQ2qiEZ";

// ─── 1. El catálogo de números hablados (voz.ts::RANGO_DE_NUMEROS) ──────────
//
// Del 0 al 21 más el 25 — el rango que el banco de kinder produce hoy
// (`voz.ts:300`). Autorado a mano, no compuesto: nadie pega "veinte" + "uno".
const NUMEROS = [
  [0, "cero"], [1, "uno"], [2, "dos"], [3, "tres"], [4, "cuatro"], [5, "cinco"],
  [6, "seis"], [7, "siete"], [8, "ocho"], [9, "nueve"], [10, "diez"],
  [11, "once"], [12, "doce"], [13, "trece"], [14, "catorce"], [15, "quince"],
  [16, "dieciséis"], [17, "diecisiete"], [18, "dieciocho"], [19, "diecinueve"],
  [20, "veinte"], [21, "veintiuno"], [25, "veinticinco"],
].map(([n, palabra]) => [`numero-${n}`, palabra]);

// ─── 2. Los 15 tips de error, uno por causa (packages/motor/src/banco-kinder.ts) ─
//
// Tono fijo, el mismo en las 15: "está bien" o "¡casi!" primero — nunca
// entra directo al error — seguido de qué pasó, sin decir "mal" ni "no
// sabes". Línea roja #7: Larry nunca avergüenza, y el tip tampoco.
const CAUSAS = [
  ["error.subestimo", "¡Casi! Dijiste un número más chico de lo que había. La próxima vez, fíjate bien en todos los puntos antes de responder."],
  ["error.sobreestimo", "¡Casi! Dijiste un número más grande de lo que había. La próxima vez, cuenta solo lo que de verdad ves."],
  ["error.conto_uno_dos_veces", "Está bien, no estuvo correcto. Parece que contaste el mismo dos veces. La próxima vez, toca cada uno solo una vez."],
  ["error.se_salto_uno", "Está bien, no estuvo correcto. Parece que te saltaste uno sin tocarlo. La próxima vez, toca uno por uno, sin brincarte ninguno."],
  ["error.dijo_otro_numero_de_la_cuenta", "Está bien, no estuvo correcto. Ese número lo dijiste mientras contabas, pero no es el último. El último número que dices es cuántos hay en total."],
  ["error.eligio_el_menor", "Está bien, no estuvo correcto. Elegiste el montón con menos. Fíjate cuál tiene más para la próxima vez."],
  ["error.puso_el_total", "Está bien, no estuvo correcto. Pusiste el número completo, pero te estaban preguntando por la parte que falta."],
  ["error.repitio_la_parte", "Está bien, no estuvo correcto. Repetiste la parte que ya estaba, en vez de la que faltaba."],
  ["error.repitio_el_ultimo", "Está bien, no estuvo correcto. Dijiste el mismo número que ya habías dicho antes, en vez del que sigue."],
  ["error.siguio_el_patron_al_reves", "Está bien, no estuvo correcto. Seguiste el patrón para atrás. Fíjate en qué dirección va creciendo."],
  ["error.conto_los_dos_grupos", "Está bien, no estuvo correcto. Contaste los dos grupos juntos. Aquí solo había que contar los que sobran."],
  ["error.conto_el_que_quita", "Está bien, no estuvo correcto. Contaste el que se quita, en vez de los que se quedan."],
  ["error.conto_desde_uno", "Está bien, no estuvo correcto. Empezaste a contar desde uno otra vez. Puedes seguir contando desde donde ya estabas."],
  ["error.mismo_aspecto_global", "Está bien, no estuvo correcto. Se veían parecidos de lejos, pero fíjate bien en la forma de cada uno."],
  ["error.sumo", "Está bien, no estuvo correcto. Sumaste en vez de comparar. Fíjate cuál de los dos es más grande."],
];

// ─── 3. Acierto explicado, uno por habilidad (no genérico — decisión de hoy) ─
//
// `{n}` marca dónde va el número: el script corta la frase ahí y genera
// `-antes`/`-despues` por separado. Las que no llevan número (K07, K13, K14)
// se graban enteras.
const ACIERTOS = [
  ["acierto.K01", "¡Sí! Vistes {n} de un solo vistazo, sin necesitar contarlos uno por uno."],
  ["acierto.K02", "¡Muy bien! Reconociste {n} al instante. Eso es justo lo que estamos practicando."],
  ["acierto.K03", "¡Correcto! Tocaste cada uno una sola vez, y el último número que dijiste fue cuántos había: {n}."],
  ["acierto.K04", "¡Excelente! Contaste hasta {n} sin saltarte ninguno."],
  ["acierto.K05", "¡Sí! Emparejaste uno con uno, y viste que sobraban {n}."],
  ["acierto.K06", "¡Correcto! El último número que dijiste al contar es cuántos hay en total: {n}."],
  ["acierto.K07", "¡Bien! Viste cuál montón tenía más, sin necesitar contar los dos."],
  ["acierto.K08", "¡Sí! Ese es el lugar correcto en la recta numérica."],
  ["acierto.K09", "¡Muy bien! El marco de diez te ayudó a ver que faltaban {n} para completarlo."],
  ["acierto.K10", "¡Correcto! Hay varias formas de armar el mismo número, y encontraste una: {n}."],
  ["acierto.K11", "¡Sí! Sumaste bien, y el total es {n}."],
  ["acierto.K12", "¡Correcto! Quitaste algunos, y te quedaron {n}."],
  ["acierto.K13", "¡Bien! Encontraste la forma que no era igual a las demás."],
  ["acierto.K14", "¡Sí! Seguiste el patrón y adivinaste qué seguía."],
];

// ─── 4. Ejemplos de enunciado para 4 de los 28 pares habilidad×mecánica nueva ─
//
// Establecen el patrón de frase para las mecánicas nuevas — los 24 pares
// restantes se autoran igual, después de que el dueño oiga y apruebe estos
// cuatro (D-080, misma regla que arte y música: revisión humana antes de
// generar el resto).
const ENUNCIADOS_NUEVOS = [
  ["k.pop.subitiza", "Revienta exactamente {n} burbujas."],
  ["k.fusion.descomponer", "Junta las burbujas hasta llegar a {n}."],
  ["k.mover.marco", "Mueve una ficha al marco de diez."],
  ["k.incremento.marco", "Toca la casilla chica para sumar una. Toca la fila para sumar una fila completa."],
];

async function generarTts(texto) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
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

function convertir(id) {
  const crudo = join(RAW, `${id}.mp3`);
  const salida = join(OUT, `${id}.mp3`);
  // Mismo piso de -14 LUFS que `gen-sfx.mjs` — la voz de Larry compite con
  // la música de fondo (D-198) y tiene que notarse por encima sin distorsionar.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-b:a", "64k", salida]);
}

/** Divide una frase con `{n}` en sus dos mitades; null si no lleva marcador. */
function partirEnDos(clave, frase) {
  if (!frase.includes("{n}")) return null;
  const [antes, despues] = frase.split("{n}");
  return [[`${clave}-antes`, antes.trim()], [`${clave}-despues`, despues.trim()]];
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

// Arma la lista final: los números y las causas van enteros; los aciertos y
// los enunciados nuevos se parten si llevan `{n}`.
const piezas = [
  ...NUMEROS,
  ...CAUSAS,
  ...[...ACIERTOS, ...ENUNCIADOS_NUEVOS].flatMap(([clave, frase]) => partirEnDos(clave, frase) ?? [[clave, frase]]),
];

let hechas = 0;
for (const [id, texto] of piezas) {
  if (solo && !id.includes(solo)) continue;
  const destino = join(OUT, `${id}.mp3`);
  if (existsSync(destino) && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando ("${texto.slice(0, 40)}${texto.length > 40 ? "…" : ""}")\n`);
  try {
    const audio = await generarTts(texto);
    writeFileSync(join(RAW, `${id}.mp3`), audio);
    convertir(id);
    hechas++;
    console.log(`✓ ${id} — ${(audio.length / 1024).toFixed(0)} KB crudo, mp3 en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} clip(s) generado(s) de ${piezas.length} en este lote.`);
console.log(
  "Revisión de OÍDO obligatoria antes de commitear (D-080) — en especial: que el tono nunca suene " +
    "condescendiente en los tips de error (línea roja #7), y que los pares -antes/-despues empalmen " +
    "limpio con el número intercalado al reproducirse.",
);
console.log(
  "\nEsto cubre SOLO es-MX/es-ES con Kilowatto. Las otras 6 voces (en, fr-FR, pt-BR, pt-PT, de-DE, " +
    "es-ES si difiere) siguen sin decidir — docs/dudas.md P-19/P-20.",
);
