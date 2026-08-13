#!/usr/bin/env node
// gen-esqui-avatares.mjs — las hojas de sprite animadas de los 16 avatares
// deslizándose en el Modo Esquí (plan de mundo multi-bioma, 2026-08-09).
//
// `gen-avatares-animal.mjs` ya generó el PORTRAIT estático (busto) de los 16
// animales elegibles como avatar. Este script genera, por cada uno, una
// hoja de contacto 2×2 con las 4 poses de UN solo ciclo de deslizamiento
// continuo — el material de animación que ese script explícitamente dejó
// para una fase aparte ("las secuencias reales de animación... son una fase
// aparte, todavía sin construir").
//
// ─── Por qué Gemini 2.5 Flash Image ("Nano Banana") y no Recraft ───────────
//
// Calibración 2026-08-12 (B0), dos rondas con Recraft, dos fallos
// CONSISTENTES en dos estilos distintos: el ilustrado ignoró por completo
// "visto de espaldas" y siguió mostrando la cara en las 4 poses; el
// fotorrealista dio un ciclo de carrera real y consistente pero de PERFIL,
// no de espaldas. Ronda 3, mismos 2 personajes de prueba (elefante,
// foto_guepardo), con Gemini 2.5 Flash Image en vez de Recraft, mismo
// patrón de llamada que ya usa `gen-letrero-quien-juega.mjs`: los dos
// salieron de espaldas, cuerpo completo, diseño/color/iluminación
// consistentes en los 4 paneles, a la primera. Evidencia visual revisada
// por el dueño antes de decidir el cambio de proveedor — no es una
// preferencia de estilo, es que Recraft demostró dos veces que no sabe
// seguir esta instrucción específica y Nano Banana sí.
//
// Las 16 especies/descripciones (`ESPECIES` abajo) están COPIADAS, no
// importadas, de `ROSTER_ILUSTRADO`/`ROSTER_FOTORREALISTA` en
// `gen-avatares-animal.mjs`. Ese archivo no tiene guarda de
// `import.meta.url` — importarlo (en vez de copiar el texto) ejecutaría
// sus 16 llamadas reales a Recraft con solo cargar el módulo, exactamente
// el incidente de generación no intencional que la guarda de este archivo
// existe para evitar.
//
// Gemini devuelve PNG directo (no webp) — cada hoja se recorta en 4
// archivos con `ffmpeg -vf crop=iw/2:ih/2:...` y cada cuadro pasa por el
// mismo recorte de alfa por color (blanco → transparente) que
// `gen-mapa-historia.mjs` usa para la vegetación — no el patrón opaco de
// `gen-avatares-animal.mjs` (ese portrait se pinta dentro de un círculo de
// UI y nunca necesitó transparencia; estos sprites sí, porque van sobre la
// pista del juego, en cualquiera de los dos estilos).
//
// Uso:   node scripts/gen-esqui-avatares.mjs                  genera lo que falte
//        node scripts/gen-esqui-avatares.mjs --solo elefante  solo animalId que casen
//        node scripts/gen-esqui-avatares.mjs --forzar         regenera aunque exista
//        node scripts/gen-esqui-avatares.mjs --seco           no genera nada, solo lista qué haría
//
// Después de generar, MIRA cada hoja ANTES de recortarla en cuadros —mismo
// aviso de D-080 que el resto del arte de este proyecto—: un solo cuadro
// desalineado en la hoja produce 4 sprites desalineados, no 1.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/esqui");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.GOOGLE_AI_API_KEY;
const MODELO = "gemini-2.5-flash-image";

// [animalId, descripción del sujeto, style] — las 8 ilustradas
// (KINDER/PRIMARIA/SECUNDARIA temprana) seguidas de las 8 fotorrealistas
// antropomórficas (SECUNDARIA en adelante, D-191). Texto idéntico al de
// `ROSTER_ILUSTRADO`/`ROSTER_FOTORREALISTA` en `gen-avatares-animal.mjs` —
// se conserva aquí solo como referencia/documentación de identidad; el
// prompt real de la hoja usa `SUJETO_HOJA` (ver abajo, por qué).
const ESPECIES = [
  ["avatar_elefante", "a cute friendly gray elephant with big round ears", "ilustrado"],
  ["avatar_jirafa", "an extreme close-up of just the FACE of a cute friendly giraffe with small ossicones, cropped so tight that neck and body are not visible at all, only the head fills the entire frame", "ilustrado"],
  ["avatar_cebra", "an extreme close-up of just the FACE of a cute friendly zebra with black and white stripes, cropped so tight that neck and body are not visible at all, only the head fills the entire frame", "ilustrado"],
  ["avatar_mono", "a cute friendly brown monkey", "ilustrado"],
  ["avatar_suricata", "an extreme close-up of just the FACE of a cute friendly meerkat, cropped so tight that neck and body are not visible at all, only the head fills the entire frame", "ilustrado"],
  ["avatar_avestruz", "a hand-drawn cartoon illustration, definitely NOT a photograph, of just the FACE of a cute friendly ostrich, cropped so tight that neck and body are not visible at all, only the head fills the entire frame", "ilustrado"],
  ["avatar_hipopotamo", "a cute friendly purple-gray hippopotamus", "ilustrado"],
  ["avatar_leon", "a flat cartoon icon design of just the FACE of a cute friendly young lion character with a small round mane, drawn like a simple app icon graphic (not a wildlife photo or nature drawing), cropped so tight that body is not visible at all, only the head fills the entire frame, no initials or monogram or cursive mark anywhere", "ilustrado"],
  ["avatar_foto_guepardo", "an anthropomorphic cheetah with distinctive black tear-mark facial markings and spotted fur", "fotorrealista"],
  ["avatar_foto_bufalo", "an anthropomorphic cape buffalo with large curved horns", "fotorrealista"],
  ["avatar_foto_cocodrilo", "an anthropomorphic crocodile with textured scaly skin", "fotorrealista"],
  ["avatar_foto_aguila", "an anthropomorphic bald eagle with sharp feathers and a hooked beak", "fotorrealista"],
  ["avatar_foto_hiena", "an anthropomorphic spotted hyena", "fotorrealista"],
  ["avatar_foto_nu", "an anthropomorphic blue wildebeest with curved horns and a short mane", "fotorrealista"],
  ["avatar_foto_gacela", "an anthropomorphic gazelle with slender ringed horns", "fotorrealista"],
  ["avatar_foto_chacal", "an anthropomorphic black-backed jackal", "fotorrealista"],
];

// Sujeto CORTO por especie, solo para el prompt de la hoja de contacto —
// deliberadamente NO reusa la descripción de `ESPECIES` tal cual: media
// docena de esas descripciones dicen literalmente "extreme close-up of
// just the FACE... only the head fills the frame" — están escritas para
// el retrato de perfil de D-194, y le pedirían al modelo justo lo opuesto
// de lo que esta hoja necesita (cuerpo completo, de espaldas). El encuadre
// real lo pone `MARCO_HOJA_*` una sola vez para las 16.
const SUJETO_HOJA = {
  avatar_elefante: "a cute cartoon gray-bodied baby elephant character with big round ears",
  avatar_jirafa: "a cute cartoon giraffe character with small ossicones",
  avatar_cebra: "a cute cartoon zebra character with black and white stripes",
  avatar_mono: "a cute cartoon brown monkey character",
  avatar_suricata: "a cute cartoon meerkat character",
  avatar_avestruz: "a cute cartoon ostrich character",
  avatar_hipopotamo: "a cute cartoon purple-gray hippopotamus character",
  avatar_leon: "a cute cartoon young lion character with a small round mane",
  avatar_foto_guepardo: "a photorealistic anthropomorphic cheetah character with spotted fur",
  avatar_foto_bufalo:
    "a photorealistic anthropomorphic cape buffalo character with large curved horns, bare fur with " +
    "nothing draped over its head, neck, or back — no cape, no cloth, no cloak, no fabric, no hood, no " +
    "clothing of any kind, just its own fur",
  avatar_foto_cocodrilo: "a photorealistic anthropomorphic crocodile character with scaly skin",
  avatar_foto_aguila:
    "a photorealistic anthropomorphic bald eagle character with sharp feathers, wings always folded and " +
    "tucked against its body in all four panels — wings are NEVER spread open or extended outward in any " +
    "panel, same tucked-wing silhouette in every panel",
  avatar_foto_hiena: "a photorealistic anthropomorphic spotted hyena character",
  avatar_foto_nu: "a photorealistic anthropomorphic blue wildebeest character with curved horns",
  avatar_foto_gacela: "a photorealistic anthropomorphic gazelle character with slender ringed horns",
  avatar_foto_chacal: "a photorealistic anthropomorphic black-backed jackal character",
};

// ─── El marco de la hoja de contacto: mismo pose-cycle para las 16 ─────────
// Texto validado en calibración (2026-08-12, ronda 3, ver cabecera) sobre
// `avatar_elefante`/`avatar_foto_guepardo` — generalizado a las 16 sin
// cambiar ninguna de las cláusulas que la calibración confirmó necesarias.
const MARCO_HOJA_ILUSTRADA =
  "A 2x2 grid contact sheet image, divided into four separate square panels by a thin white line. " +
  "Each panel shows the SAME __SUJETO__ (flat cel-shaded vector mascot style, thick black outlines, " +
  "solid flat body color with orange (#F36B1C) and blue (#0B6AB0) accent colors), but the character is " +
  "shown ENTIRELY FROM BEHIND in every single panel — the viewer sees the character's back and the back " +
  "of its head, its face and eyes are NEVER visible in any panel, camera positioned directly behind the " +
  "character at all times. Full body visible from head to feet in all four panels. The four panels show " +
  "four sequential frames of one continuous running motion, as if the character is running away from the " +
  "camera: panel 1 (top-left) crouched low with knees bent, panel 2 (top-right) body rising mid-stride, " +
  "panel 3 (bottom-left) body fully extended and tall mid-stride, panel 4 (bottom-right) body sinking " +
  "back down. Identical character design, identical colors, identical camera distance in all four panels. " +
  "Isolated on a plain solid white background, no scenery, no ground line, no shadow, no ski equipment, " +
  "no text, no watermark.";

const MARCO_HOJA_FOTORREALISTA =
  "A 2x2 grid contact sheet image, divided into four separate square panels by a thin white line. Each " +
  "panel shows the SAME __SUJETO__, but the character is shown ENTIRELY FROM BEHIND in every single " +
  "panel — the viewer sees the character's back, its face is NEVER visible in any panel, camera " +
  "positioned directly behind the character at all times. Full body visible from head to feet in all " +
  "four panels, standing upright on two legs like a human (anthropomorphic), not on all four legs. The " +
  "four panels show four sequential frames of one continuous running motion, as if the character is " +
  "running away from the camera: panel 1 (top-left) crouched low with knees bent, panel 2 (top-right) " +
  "body rising mid-stride, panel 3 (bottom-left) body fully extended and tall mid-stride, panel 4 " +
  "(bottom-right) body sinking back down. Identical character design, identical fur texture, identical " +
  "studio lighting, identical camera distance in all four panels. Isolated on a plain solid white " +
  "background, no other animals, no people, no scenery, no text, no watermark.";

const HOJAS = ESPECIES.map(([animalId, , style]) => {
  const sujeto = SUJETO_HOJA[animalId];
  if (!sujeto) throw new Error(`falta SUJETO_HOJA para ${animalId}`);
  const marco = style === "ilustrado" ? MARCO_HOJA_ILUSTRADA : MARCO_HOJA_FOTORREALISTA;
  const prompt = marco.replace("__SUJETO__", sujeto);
  return [animalId, prompt];
});

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
  if (!res.ok) throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  const b64 = parte?.inlineData?.data;
  if (!b64) throw new Error(`respuesta sin imagen: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

// Las 4 esquinas de recorte de la hoja 2×2, en orden de lectura (igual al
// orden de las poses descritas en el prompt: 1=agachado, 2=subiendo,
// 3=extendido, 4=bajando).
const RECORTES = [
  { cuadro: 1, x: "0", y: "0" },
  { cuadro: 2, x: "iw/2", y: "0" },
  { cuadro: 3, x: "0", y: "ih/2" },
  { cuadro: 4, x: "iw/2", y: "ih/2" },
];

/** Recorta la hoja 2×2 (PNG, tal como la devuelve Gemini) en sus 4 cuadros
 * y a cada uno le aplica el mismo recorte de alfa por color (blanco →
 * transparente) que la vegetación de `gen-mapa-historia.mjs` — estos
 * sprites sí necesitan transparencia. Encadenado SIEMPRE en PNG entre
 * pasos de ffmpeg: este ffmpeg local no trae compilado el encoder de webp
 * (`ffmpeg -encoders | grep webp` no devuelve nada), solo existe como
 * binario aparte (`cwebp`) — pedirle a ffmpeg un .webp intermedio falla
 * con "Encoder not found" (visto en vivo en la calibración 2026-08-12). */
function convertirHoja(animalId) {
  const hoja = join(RAW, `esqui_${animalId}_hoja.png`);
  for (const { cuadro, x, y } of RECORTES) {
    const recortado = join(RAW, `esqui_${animalId}_${cuadro}-recorte.png`);
    const png = join(RAW, `esqui_${animalId}_${cuadro}-alfa.png`);
    const webp = join(OUT, `esqui_${animalId}_${cuadro}.webp`);
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", hoja,
      "-vf", `crop=iw/2:ih/2:${x}:${y}`,
      recortado,
    ]);
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", recortado,
      "-vf", "colorkey=0xFFFFFF:0.18:0.10",
      png,
    ]);
    execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
  }
}

async function principal() {
  const args = process.argv.slice(2);
  const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
  const forzar = args.includes("--forzar");
  const seco = args.includes("--seco");

  const piezas = HOJAS.filter(([animalId]) => !solo || animalId.includes(solo));

  if (seco) {
    console.log(`--seco: se generarían ${piezas.length} hoja(s) (${piezas.length * 4} sprite(s) tras recortar), sin llamar a ninguna API:`);
    for (const [animalId] of piezas) console.log(`  - esqui_${animalId}_hoja → esqui_${animalId}_{1,2,3,4}`);
    console.log(`\nTotal: ${piezas.length} llamada(s) a la API de Gemini (Nano Banana).`);
    process.exit(0);
  }

  if (!llave()) {
    console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  mkdirSync(RAW, { recursive: true });

  let hechas = 0;
  for (const [animalId, prompt] of piezas) {
    const yaExiste = existsSync(join(OUT, `esqui_${animalId}_1.webp`));
    if (yaExiste && !forzar) {
      console.log(`· esqui_${animalId} — ya existe, se salta (--forzar para regenerar)`);
      continue;
    }
    process.stdout.write(`… esqui_${animalId} — generando hoja\n`);
    try {
      const img = await generar(prompt);
      writeFileSync(join(RAW, `esqui_${animalId}_hoja.png`), img);
      convertirHoja(animalId);
      hechas++;
      console.log(`✓ esqui_${animalId} — ${(img.length / 1024).toFixed(0)} KB de hoja cruda, 4 sprites con alfa en ${OUT}`);
    } catch (err) {
      console.error(`✗ esqui_${animalId} — ${err.message}`);
    }
  }

  console.log(`\n${hechas} hoja(s) generada(s) y recortada(s). Revisión humana pendiente antes de commitear (D-080).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
