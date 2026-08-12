#!/usr/bin/env node
// gen-esqui-pistas.mjs — el fondo y la superficie del Modo Esquí/Deslizamiento
// multi-bioma (plan de mundo multi-bioma, 2026-08-09).
//
// Dos capas, dos formas distintas de generarse y convertirse:
//
//  1. PLACAS — la escena de fondo: cielo, horizonte, silueta lejana del
//     bioma. NUNCA incluye el camino/pista en sí — esa es la SUPERFICIE,
//     una capa aparte que Phaser dibuja/repite encima. Mismo motivo que ya
//     documentó `gen-mapa-historia.mjs` para el fondo del mapa: un camino
//     pintado en el fondo casi nunca coincidiría píxel a píxel con la ruta
//     real que dibuja el motor.
//
//     Cada bioma tiene DOS placas: una vertical y una horizontal (la
//     primera composición apaisada del proyecto — hasta hoy todo el arte
//     de escena se generó vertical porque Phaser estira un sprite alto
//     sobre un mundo alto). Generadas con Gemini, no Recraft — ver la nota
//     de proveedor más abajo, junto a las superficies.
//
//  2. SUPERFICIES — la textura del suelo (nieve/arena/pasto/agua-arena),
//     vista en perspectiva, sin horizonte y sin objetos, pensada para
//     repetirse VERTICALMENTE mientras el jugador se desliza sin parar.
//
// ─── Por qué las dos capas usan Gemini 2.5 Flash Image ("Nano Banana") y no
// Recraft ────────────────────────────────────────────────────────────────
//
// Calibración 2026-08-12, tres fallos documentados con RECRAFT antes del
// cambio de proveedor (mismo patrón que D-204 ya encontró con los avatares):
//
// - SUPERFICIES, intento 1 ("flat packed sand dune track texture... top-down
//   perspective"): ignoró "no horizon, no scenery" y devolvió un paisaje
//   panorámico ilustrado completo, con huellas y vegetación.
// - SUPERFICIES, intento 2 ("extreme close-up macro texture swatch",
//   reformulado siguiendo [[feedback_recraft-overfitting-fixes]] punto 9):
//   salió PEOR — un paisaje FOTORREALISTA completo, ignorando también "flat
//   cartoon illustration style, not photorealistic".
// - PLACAS verticales (sabana, desierto): pese a 2-4 rondas de negativos
//   cada vez más explícitos ("no dirt path, no road, no trail, no tire
//   tracks, no winding line leading toward the horizon..."), Recraft siguió
//   dibujando un camino de tierra serpenteante en el primer plano — un
//   sesgo compositivo persistente de "panorama vertical" que el negativo
//   no logró apagar ni a la cuarta vuelta.
//
// Con GEMINI, mismo concepto en los dos casos ("flat seamless tileable
// texture pattern... like a fabric swatch" para superficies; "empty video
// game level background... ground is bare... no path of any kind" para
// placas) funcionó a la primera: patrón plano sin paisaje en las
// superficies, terreno realmente vacío sin camino en las placas. No es
// preferencia de estilo — es la tercera vez en este mismo lote de D-202
// que Recraft no sigue una instrucción compositiva específica y Gemini sí
// (ver también D-204, avatares).
//
// El patrón de superficie que devuelve Gemini ya se ve razonablemente
// repetible por construcción, pero la conversión igual aplica un apilado
// de espejo vertical (`ffmpeg vflip` + `vstack`) — barato, y disimula
// cualquier costura residual sin costar un reintento de generación. Las
// placas no necesitan ese paso (no se repiten, son fondo fijo/parallax).
//
// Uso:   node scripts/gen-esqui-pistas.mjs              genera lo que falte
//        node scripts/gen-esqui-pistas.mjs --solo nieve solo claves que casen
//        node scripts/gen-esqui-pistas.mjs --forzar     regenera aunque exista
//        node scripts/gen-esqui-pistas.mjs --seco       no genera nada, solo lista qué haría
//
// Después de generar, MIRA cada imagen antes de commitearla — mismo aviso
// que el resto de los scripts de arte de este proyecto.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/esqui");
const RAW = join(RAIZ, ".arte-crudo"); // WebP de Recraft; no se commitea

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llaveGemini = () => process.env.GOOGLE_AI_API_KEY;
const MODELO_GEMINI = "gemini-2.5-flash-image";

// ─── Paletas por bioma — MISMOS hexadecimales que ya usa gen-mapa-historia.mjs,
// para que la placa de esquí no desentone con el resto del mundo de ese bioma.
const PALETA = {
  sabana: { base: "#5B8C3A", alto: "#8FC461", nombre: "African savanna", extra: "" },
  desierto: { base: "#D9A066", alto: "#E8C48A", nombre: "sandy desert", extra: "" },
  nieve: { base: "#EAF3F7", alto: "#BFDCE8", nombre: "snowy mountains", extra: "" },
  // Costa: el diseño original (`gen-mapa-historia.mjs::fondo-costa-1`) es
  // pasto verde en un lado y agua turquesa calma en el otro — el color
  // "base" (#5B8C3A) es del PASTO, no del agua. Sin mencionar el agua
  // explícitamente, Gemini devolvió pasto con parches de arena y CERO
  // agua/océano (calibración 2026-08-12) — se agrega la descripción del
  // agua a propósito, no alcanza con los hexadecimales solos.
  costa: {
    base: "#5B8C3A",
    alto: "#E8D9A8",
    nombre: "tropical coastline",
    extra: " Green grassy hills on one side, with calm flat turquoise ocean water clearly visible on the other side.",
  },
};

// Calibración 2026-08-12: la primera versión decía "for a children's
// sliding/skiing game" — la palabra "sliding/skiing" disparó una escena de
// PARQUE INFANTIL literal (resbaladilla, torre con escalera, gorro rojo con
// bandera) en vez de un fondo de videojuego, mismo patrón ya documentado
// para sustantivos evocadores ([[feedback_recraft-overfitting-fixes]]
// punto 9). Quitada la palabra; agregado el negativo explícito de
// estructuras de parque.
const NO_ESCENA_FONDO =
  "no dirt path, no paved path, no road, no trail, no track, no walkway, no stepping stones, no tire " +
  "tracks or tread marks, no wheel ruts, no winding line or ribbon leading toward the horizon — ground " +
  "between foreground and horizon is smooth and untouched, no playground, no slide, no swing set, no " +
  "play structure, no ladder, no fence, no flag, no characters, no people, no animals, no text, no " +
  "numbers, no letters, no logos, no watermarks, no signatures";

// Proporción real pedida a Gemini vía `generationConfig.imageConfig.aspectRatio`
// (confirmado en calibración que el parámetro SÍ se respeta — sin él, Gemini
// siempre devuelve 1024×1024 sin importar lo que diga el prompt sobre
// "panorama"). "9:16"/"16:9" son las proporciones soportadas más cercanas a
// la 1:2 vertical / 2:1 horizontal que ya usa el resto del proyecto.
const ASPECTO_GEMINI = { vertical: "9:16", horizontal: "16:9" };

function prompt_placa(bioma, orientacion) {
  const { base, alto, nombre, extra } = PALETA[bioma];
  const forma = orientacion === "vertical" ? "wide vertical panorama, tall portrait orientation" : "wide horizontal panorama, wide landscape orientation";
  return (
    `${forma} of an empty ${nombre} video game level background, ` +
    `flat cartoon illustration style, not photorealistic, no dramatic lighting, no cinematic shot, ` +
    `terrain in ${base} base tones with ${alto} highlights, distant silhouettes of the ${nombre} horizon near the edges, ` +
    `a pale sky with a few simple clouds at the top, gentle side-scrolling game backdrop perspective.${extra} ` +
    `Completely empty middle ground reserved for game elements added later, which are NOT part of this image. ` +
    `${NO_ESCENA_FONDO}`
  );
}

// [clave, prompt, aspecto, w, h] — w/h son el resize final de `cwebp`,
// elegido para quedar bajo el presupuesto de `audits/bundle-budget.mjs`
// (120 KB), mismo criterio que `convertirFondo` en `gen-mapa-historia.mjs`.
const PLACAS = [];
for (const bioma of ["sabana", "desierto", "nieve", "costa"]) {
  PLACAS.push([`esqui-placa-${bioma}-vertical`, prompt_placa(bioma, "vertical"), ASPECTO_GEMINI.vertical, 800, 1600]);
  PLACAS.push([`esqui-placa-${bioma}-horizontal`, prompt_placa(bioma, "horizontal"), ASPECTO_GEMINI.horizontal, 1600, 800]);
}

// ─── Las superficies: sin horizonte, sin objetos, solo la textura del suelo ──
//
// Calibración 2026-08-12: la primera versión ("flat packed sand dune track
// texture... seen in a steep top-down perspective") ignoró "no horizon, no
// scenery" por completo y devolvió un paisaje panorámico completo con
// montañas, cielo, árboles y huellas — "dune"/"track" son sustantivos que
// arrastran hacia una escena de paisaje, mismo patrón que "snow" en
// `bloque-nieve-tronco` ([[feedback_recraft-overfitting-fixes]] punto 9).
// Reformulado como muestra de material/textura en macro (el mismo encuadre
// que ya funciona para `roca-nieve`), nunca como terreno o paisaje.
const TEXTURA_POR_BIOMA = {
  sabana: "short green grass blades and packed dirt, in green tones (#5B8C3A base with #8FC461 highlights)",
  desierto: "fine sand grains with small ripples, in warm sandy tones (#D9A066 base with #E8C48A highlights)",
  nieve: "packed snow crystals, in cool white and pale blue tones (#EAF3F7 base with #BFDCE8 highlights)",
  costa: "wet sand with a thin film of shallow water, in sandy tan blended with turquoise (#5B8C3A and #E8D9A8 tones)",
};

function prompt_superficie(bioma) {
  return (
    `A flat, seamless, tileable texture pattern of ${TEXTURA_POR_BIOMA[bioma]}. This is a flat 2D ` +
    `pattern/swatch, like a fabric sample or wallpaper texture, viewed straight-on with the camera ` +
    `pointed directly down at a flat surface. The entire image is filled edge-to-edge with ONLY the ` +
    `repeating texture pattern — there is no horizon, no sky, no distant landscape, no mountains, no ` +
    `dunes as a landform, no hills, no depth, no perspective, no vanishing point, no 3D scene of any ` +
    `kind. Flat cartoon illustration style, not photorealistic, not a photograph. No objects, no ` +
    `plants, no rocks, no footprints, no ski marks, no characters, no people, no animals, no text, no ` +
    `watermark. Think of this as digital wallpaper or fabric print design, not a picture of a place.`
  );
}

// [clave, prompt, w, h] — w/h son el tamaño FINAL tras el apilado espejo
// (el mosaico duplica la altura del recorte original), pensado para que el
// tile se vea bien al repetirse verticalmente en pantalla sin pesar de más.
const SUPERFICIES = [
  ["esqui-superficie-sabana", prompt_superficie("sabana"), 512, 1024],
  ["esqui-superficie-desierto", prompt_superficie("desierto"), 512, 1024],
  ["esqui-superficie-nieve", prompt_superficie("nieve"), 512, 1024],
  ["esqui-superficie-costa", prompt_superficie("costa"), 512, 1024],
];

/** Gemini 2.5 Flash Image ("Nano Banana") para las dos capas — mismo
 * patrón que `gen-esqui-avatares.mjs` (D-204) y
 * `gen-letrero-quien-juega.mjs`. `aspectRatio` es lo que de verdad
 * controla la proporción de salida — sin él, Gemini siempre devuelve
 * 1024×1024 sin importar lo que diga el prompt sobre "panorama" (probado
 * en vivo, 2026-08-12). */
async function generarGemini(prompt, aspectRatio) {
  const generationConfig = { responseModalities: ["IMAGE"] };
  if (aspectRatio) generationConfig.imageConfig = { aspectRatio };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent?key=${llaveGemini()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
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

/** Placa de fondo: opaca, sin alfa que recortar — mismo patrón que
 * `convertirFondo` de `gen-mapa-historia.mjs`. Entrada PNG (Gemini). */
function convertirPlaca(clave, w, h) {
  const crudo = join(RAW, `${clave}.png`);
  const webp = join(OUT, `${clave}.webp`);
  // q65, no q75: estas placas (más detalladas que los fondos de
  // gen-mapa-historia.mjs) pasaban los 120 KB de audits/bundle-budget.mjs
  // a q75 (133/129 KB medidos en vivo, 2026-08-12).
  execFileSync("cwebp", ["-q", "65", "-resize", String(w), String(h), crudo, "-o", webp]);
}

/** Superficie: entrada PNG (Gemini). Espejo vertical adicional (barato,
 * sin costo de generación) para disimular cualquier costura residual del
 * patrón al hacer scroll continuo, luego el mismo `cwebp -q 75 -resize`
 * que las placas. */
function convertirSuperficie(clave, w, h) {
  const crudo = join(RAW, `${clave}.png`);
  const mosaico = join(RAW, `${clave}-mosaico.png`);
  const webp = join(OUT, `${clave}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-filter_complex", "[0:v]vflip[espejo];[0:v][espejo]vstack=inputs=2",
    mosaico,
  ]);
  execFileSync("cwebp", ["-q", "75", "-resize", String(w), String(h), mosaico, "-o", webp]);
}

async function principal() {
  const args = process.argv.slice(2);
  const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
  const forzar = args.includes("--forzar");
  const seco = args.includes("--seco");

  const todas = [
    ...PLACAS.map(([clave, prompt, aspectRatio, w, h]) => ({ clave, prompt, aspectRatio, w, h, tipo: "placa" })),
    ...SUPERFICIES.map(([clave, prompt, w, h]) => ({ clave, prompt, aspectRatio: null, w, h, tipo: "superficie" })),
  ].filter((p) => !solo || p.clave.includes(solo));

  if (seco) {
    console.log(`--seco: se generarían ${todas.length} pieza(s), sin llamar a ninguna API (todas vía Gemini/Nano Banana):`);
    for (const p of todas) console.log(`  - ${p.clave} (${p.tipo}${p.aspectRatio ? `, ${p.aspectRatio}` : ""})`);
    console.log(`\nTotal: ${todas.length} llamada(s) a Gemini.`);
    process.exit(0);
  }

  if (!llaveGemini()) {
    console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  mkdirSync(RAW, { recursive: true });

  let hechas = 0;
  for (const p of todas) {
    const destino = join(OUT, `${p.clave}.webp`);
    if (existsSync(destino) && !forzar) {
      console.log(`· ${p.clave} — ya existe, se salta (--forzar para regenerar)`);
      continue;
    }
    process.stdout.write(`… ${p.clave} — generando`);
    const img = await generarGemini(p.prompt, p.aspectRatio);
    writeFileSync(join(RAW, `${p.clave}.png`), img);
    if (p.tipo === "placa") convertirPlaca(p.clave, p.w, p.h);
    else convertirSuperficie(p.clave, p.w, p.h);
    hechas++;
    console.log(`\r✓ ${p.clave} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP en ${OUT}`);
  }

  console.log(`\n${hechas} pieza(s) nueva(s) en ${OUT}.`);
  console.log("MIRA cada una antes de commitearla — sobre todo las superficies: la costura espejada tiene que verse limpia en scroll continuo.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await principal();
}
