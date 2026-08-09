#!/usr/bin/env node
// gen-larry-fotorrealista.mjs — el Larry fotorrealista de "¿Quién juega?" (D-196).
//
// Reversa PUNTUAL de D-191 para una sola pantalla: D-191 reservó el
// fotorrealismo para SECUNDARIA→SERIO→PRO, con KINDER/PRIMARIA terminados en
// los 7 locales primero. El dueño vio ese conflicto explícito y decidió que
// `QuienJuegaScene` —que YA mezclaba niño ilustrado + adulto fotorrealista
// desde D-194— puede tener a Larry fotorrealista también, sin esperar. Otras
// pantallas de niño (`MenuScene`, `MapScene`) NO se tocan: siguen con el
// Larry ilustrado bípede de D-190 (`gen-larry.mjs`), sin ningún cambio.
//
// ─── Por qué Gemini/Nano Banana y no Recraft ────────────────────────────────
//
// Primer intento: Recraft (`realistic_image`), mismo generador que el resto
// del proyecto. Después de 8 rondas de prompt (ver el historial de commits
// de este archivo) el resultado seguía fallando de tres formas distintas y
// alternándose entre ellas sin converger: (1) Larry salía con cuerpo humano
// delgado y solo la cabeza de rinoceronte — el dueño lo señaló explícito
// viendo un resultado ("Larry no se puede ver flaco, es un rinoceronte");
// (2) pedir "ropa deportiva estilo Adidas/Puma, sin el logo real" traía el
// logo real de todas formas — nombrar la marca la trae aunque se niegue en
// la misma frase, y quitar el nombre de la marca no evitaba que apareciera
// un símbolo de todas formas reconocible (una estrella tipo Converse, un
// swoosh); (3) apilar más negativos para arreglar (2) rompió (1) más: en una
// corrida terminó generando DOS personajes separados (un humano y un
// rinoceronte de peluche aparte) en vez de uno.
//
// El dueño mostró cómo arma sus propios prompts para Nano Banana (Gemini
// 2.5 Flash Image, ya autorizado en CLAUDE.md § Imágenes para "piezas
// complejas de interfaz") — una frase directa y corta, sin apilar negativos
// — y el resultado fue correcto a la primera: cuerpo grueso de rinoceronte
// de verdad, una marca de ropa FICTICIA con su propio logo inventado (nunca
// una marca real, así que no hay problema de infracción de marca) y fondo
// blanco limpio. Este script usa ese mismo modelo y ese mismo estilo de
// prompt — descriptivo y natural, no una lista de negaciones.
//
// ─── El vestuario: marca ficticia, nunca una real ───────────────────────────
//
// "Rhino Athletics", con su propio escudo inventado — resuelve lo que D-191
// pedía ("ropa deportiva de corte real, estilo Adidas/Puma") sin el riesgo
// legal de un logo real. Colores naranja/blanco, tenis siempre naranjas
// (D-191/D-196).
//
// ─── Siete comportamientos + reposo + caminata ──────────────────────────────
//
//   idle       — 2 cuadros, de pie, respiración/parpadeo.
//   camina     — 4 cuadros, ciclo de caminata.
//   baila      — 4 cuadros.
//   saluda     — 2 cuadros.
//   aburrido   — 2 cuadros — pedido explícito del dueño.
//   ejercicio  — 4 cuadros, jumping-jacks.
//   arrastra   — 2 cuadros, arrastrando una silla ("se sienta a leer"): el
//                dueño simplificó el comportamiento — Larry sale de cuadro
//                arrastrando la silla, la pantalla queda sin Larry unos
//                segundos (sentarse/leer/pararse pasa FUERA de cuadro,
//                nunca visible), y regresa caminando normal (reusa
//                `larry_foto_camina_1..4`) — así que no hace falta un solo
//                cuadro de sentarse/leer/pararse.
//   medita     — 2 cuadros — propuesto por Claude, contrapeso de energía
//                baja frente a bailar/ejercicio.
//   riega      — 2 cuadros, regando una plantita — propuesto por Claude, un
//                gesto de cuidado calmado, con la regadera y la planta
//                horneadas en el cuadro (no hay prop aparte que alinear).
//
// Total: 24 cuadros de Larry, cero props sueltos.
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Una pieza ya generada no se regenera salvo --forzar.
//
// Uso:   node scripts/gen-larry-fotorrealista.mjs                 genera lo que falte
//        node scripts/gen-larry-fotorrealista.mjs --solo baila    solo ids que casen
//        node scripts/gen-larry-fotorrealista.mjs --forzar        regenera aunque exista
//
// Después de generar, MIRA cada imagen (D-080 sigue exigiendo revisión
// humana, la reversa cambia el estilo, no la regla): que sea Larry — un
// rinoceronte GRUESO y musculoso, nunca un cuerpo humano delgado con
// cabeza de rinoceronte, con la marca ficticia "Rhino Athletics" (nunca una
// marca real), tenis naranjas, sin texto suelto, sin un segundo personaje.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/mapa");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.GOOGLE_AI_API_KEY;
const MODELO = "gemini-2.5-flash-image";

// El cuerpo/vestuario base, en prosa natural — CANON aprobado por el dueño
// (2026-08-09, tercera ronda de candidatos) tras dos correcciones: "muy
// fuertes" (se bajó de fisicoculturista a sturdy/friendly) y "que la ropa no
// sea naranja más que los tenis" (paso a azul/blanco). Repetido en las 24
// piezas para ayudar a la consistencia entre llamadas — y desde
// `REFERENCIA_ID` además se manda la imagen aprobada como ancla real, no
// solo texto (ver `generar()`).
const LARRY = "a photorealistic, hyperrealistic anthropomorphic orange " +
  "rhinoceros character named Larry. He has a sturdy, friendly, athletic " +
  "rhinoceros body — NOT an extreme bodybuilder, not overly muscular, just " +
  "naturally sturdy and a bit chunky like a real rhino — covered in short " +
  "orange fur, with a rhino head with one horn and a warm friendly smile, " +
  "standing upright on two legs like a person. He wears a SHORT-SLEEVE " +
  "athletic top with real fabric sleeves covering his shoulders and upper " +
  "arms down to mid-bicep (never a sleeveless tank top with bare " +
  "shoulders) and matching shorts, from a fictional brand called \"Rhino " +
  "Athletics\" — a simple circular badge logo with a small rhino head icon " +
  "and the words \"Rhino Athletics\" written clearly and legibly underneath " +
  "in a simple clean sans-serif font (never garbled or misspelled text). " +
  "The clothing is solid deep blue with white trim (NOT orange) — only his " +
  "sneakers are orange";

const FONDO = "Full body shot from head to feet, isolated on a plain " +
  "solid white background filling the whole frame, no other characters, " +
  "no people, no scenery, no props, no watermark";

const PIEZAS = [
  ["larry_foto_idle_1", `${LARRY}, standing still facing forward, both arms relaxed at the sides, calm friendly neutral expression. ${FONDO}.`],
  ["larry_foto_idle_2", `${LARRY}, standing still facing forward, both arms relaxed at the sides, calm friendly expression mid-blink. ${FONDO}.`],

  ["larry_foto_camina_1", `${LARRY}, full body side profile facing right, walk cycle frame 1 of 4: contact pose, right leg stepping forward touching the ground, left leg stretched back, arms swinging opposite the legs. ${FONDO}.`],
  ["larry_foto_camina_2", `${LARRY}, full body side profile facing right, walk cycle frame 2 of 4: passing pose, legs close together mid-step under the body. ${FONDO}.`],
  ["larry_foto_camina_3", `${LARRY}, full body side profile facing right, walk cycle frame 3 of 4: contact pose, left leg stepping forward touching the ground, right leg stretched back — mirror of frame 1. ${FONDO}.`],
  ["larry_foto_camina_4", `${LARRY}, full body side profile facing right, walk cycle frame 4 of 4: passing pose, legs close together mid-step under the body — mirror of frame 2. ${FONDO}.`],

  ["larry_foto_baila_1", `${LARRY}, energetic dance pose: one arm raised high, opposite knee lifted, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_2", `${LARRY}, energetic dance pose: both arms out to the sides mid-spin, joyful open expression. ${FONDO}.`],
  ["larry_foto_baila_3", `${LARRY}, energetic dance pose: crouched low with both arms bent close to the chest, playful expression. ${FONDO}.`],
  ["larry_foto_baila_4", `${LARRY}, energetic dance pose: jumping up with both arms raised straight overhead, joyful open expression. ${FONDO}.`],

  ["larry_foto_saluda_1", `${LARRY}, facing the viewer, one arm starting to raise up beside the body, warm friendly smile. ${FONDO}.`],
  ["larry_foto_saluda_2", `${LARRY}, facing the viewer, one arm raised high waving with an open palm, warm friendly smile. ${FONDO}.`],

  ["larry_foto_aburrido_1", `${LARRY}, facing the viewer, slouched posture, arms crossed over the chest, unimpressed bored expression looking off to the side. ${FONDO}.`],
  ["larry_foto_aburrido_2", `${LARRY}, facing the viewer, slouched posture, resting his chin on one hand with the elbow propped up, sleepy bored expression. ${FONDO}.`],

  ["larry_foto_ejercicio_1", `${LARRY}, jumping jack exercise, frame 1 of 4: standing with feet together and arms down at the sides, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_2", `${LARRY}, jumping jack exercise, frame 2 of 4: mid-jump with legs spread wide and both arms raised overhead, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_3", `${LARRY}, jumping jack exercise, frame 3 of 4: standing with feet together and arms down at the sides, focused athletic expression. ${FONDO}.`],
  ["larry_foto_ejercicio_4", `${LARRY}, jumping jack exercise, frame 4 of 4: mid-jump with legs spread wide and both arms raised overhead — mirror of frame 2. ${FONDO}.`],

  ["larry_foto_arrastra_1", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, right leg stepping forward. ${FONDO}.`],
  ["larry_foto_arrastra_2", `${LARRY}, full body side profile facing left, walking while dragging a small simple wooden folding chair with one hand, leaning forward to pull it, determined focused expression, left leg stepping forward — mirror of the other frame. ${FONDO}.`],

  ["larry_foto_medita_1", `${LARRY}, sitting cross-legged on the ground, both hands resting on his knees, eyes closed, calm peaceful expression, breathing in. ${FONDO}.`],
  ["larry_foto_medita_2", `${LARRY}, sitting cross-legged on the ground, both hands resting on his knees, eyes closed, calm peaceful expression, shoulders slightly raised, breathing out. ${FONDO}.`],

  ["larry_foto_riega_1", `${LARRY}, holding a small metal watering can with one hand, tilting it toward a small potted plant on the ground beside his feet, gentle caring expression. ${FONDO}.`],
  ["larry_foto_riega_2", `${LARRY}, holding a small metal watering can with one hand, tilted further down with water pouring onto a small potted plant on the ground beside his feet, gentle caring expression. ${FONDO}.`],
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

// La REFERENCIA — `larry_foto_idle_1`, ya aprobada — se manda como imagen de
// entrada en las otras 23 llamadas. Probado en esta sesión: describir a
// Larry desde cero en cada llamada (24 prompts de texto independientes) daba
// variación real de cuerpo/logo/color entre cuadros; mandar la referencia
// como imagen y pedir "el MISMO personaje, cambia solo la pose" la mantiene.
const REFERENCIA_ID = "larry_foto_idle_1";

function referenciaBase64() {
  const ruta = join(RAW, `${REFERENCIA_ID}.png`);
  if (!existsSync(ruta)) return null;
  return readFileSync(ruta).toString("base64");
}

async function generar(prompt, refB64) {
  const parts = refB64
    ? [
        {
          text:
            "Using this exact same character as a strict visual reference " +
            "(identical body, fur color, face, fictional Rhino Athletics " +
            "outfit and logo, and sneakers — change ONLY the pose described " +
            `below): ${prompt}`,
        },
        { inline_data: { mime_type: "image/png", data: refB64 } },
      ]
    : [{ text: prompt }];
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

// Con alfa (colorkey sobre blanco) — estas piezas se pintan sueltas sobre la
// escena ilustrada de `QuienJuegaScene`, nunca dentro de un círculo/tarjeta
// propia. Mismo patrón que `PIEZAS_DE_JUEGO_CON_ALFA` de `gen-larry.mjs`.
function convertirConAlfa(id, extension) {
  const crudo = join(RAW, `${id}.${extension}`);
  const png = join(RAW, `${id}-alfa.png`);
  const webp = join(OUT, `${id}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "colorkey=0xFFFFFF:0.15:0.08,scale=512:512",
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
}

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const refB64 = referenciaBase64();
if (!refB64) {
  console.log(`aviso: no hay ${REFERENCIA_ID}.png en ${RAW} todavía — las piezas se generarán sin imagen de referencia (menos consistentes).`);
}

let hechas = 0;
for (const [id, prompt] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const yaExiste = existsSync(join(OUT, `${id}.webp`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  // La referencia nunca se manda como su propia imagen de entrada — se
  // generaría "a partir de sí misma" sin sentido.
  const ref = id === REFERENCIA_ID ? null : refB64;
  process.stdout.write(`… ${id} — generando${ref ? " (con referencia)" : ""}\n`);
  try {
    const img = await generar(prompt, ref);
    writeFileSync(join(RAW, `${id}.png`), img);
    convertirConAlfa(id, "png");
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP con alfa en ${OUT}`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) generada(s). Revisión humana pendiente antes de commitear (D-080).`);
