#!/usr/bin/env node
// gen-loader-fondo.mjs — el fondo fotorrealista de `LoaderScene` (D-201).
//
// Pedido del dueño (2026-08-11), viendo el loader ya funcionando sobre verde
// plano: una SABANA al amanecer, con bruma, y a lo lejos —un poco
// desenfocada— una manada de rinocerontes naranjas pastando. Sutil: que se
// vea, no que compita.
//
// ─── Por qué rinocerontes, y por qué naranjas ──────────────────────────────
//
// Larry es un rinoceronte y el naranja es el color de la marca (#F36B1C).
// Una manada suya al fondo es identidad sin poner un logo encima — que es la
// única forma de marca que cabe en una pantalla que ve un niño de cuatro
// años. El naranja no es un rinoceronte teñido: es la piel bañada por la luz
// rasante del amanecer, que es como se pide para que salga creíble en vez de
// salir un juguete de plástico.
//
// ─── Por qué Gemini y no Recraft ───────────────────────────────────────────
//
// CLAUDE.md § Imágenes: Recraft mantiene la continuidad del avatar de Larry;
// Gemini/Nano Banana hace las piezas complejas de interfaz. Un paisaje
// fotorrealista con profundidad de campo es de las segundas — es exactamente
// el mismo caso que `gen-pin-imagenes-fondo.mjs`, que ya salió bien por aquí.
// Recraft, pidiéndole fotografía, mete escenografía de producto (ver la
// memoria de sobre-ajuste).
//
// ─── UNA imagen cuadrada, y Phaser recorta ─────────────────────────────────
//
// La primera versión pedía dos piezas —1:2 para teléfono, 16:9 para
// escritorio— y las forzaba con `ffmpeg scale`. Gemini devuelve 1024x1024 sin
// importar lo que diga el prompt sobre proporción, así que ese `scale`
// **estiraba** la foto: acacias flacas y altas, y una manada de rinocerontes
// alargados. Se disimulaba, que es lo peor que puede hacer un defecto.
//
// Se guarda cuadrada, tal como sale, y `LoaderScene` la escala para CUBRIR y
// recorta lo que sobre. Sin deformación en ninguna orientación, y un archivo
// en vez de dos — que en el primer asset que baja el niño no es un detalle.
//
// ─── DOS TAMAÑOS, porque no todo es un teléfono ────────────────────────────
//
// El dueño lo señaló al ver la primera versión: «estás olvidando la imagen
// para iPad, una desktop de 32 pulgadas 4K, y demás». Tenía razón —cubrir un
// monitor 4K con 1024 px es ampliar 3.75x, y eso en una foto se ve como una
// mancha—. Pero mandarle la de 4K a un Android de gama baja tampoco: es el
// primer byte que espera un niño (mc-47 §5).
//
// Así que dos archivos y que decida el dispositivo:
//
//   · `loader-fondo.webp`    2048 px — teléfonos y tablets
//   · `loader-fondo-4k.webp` 3840 px — pantallas grandes o densas
//
// `LoaderScene` elige por `ancho * devicePixelRatio`, que es lo que de verdad
// hay que llenar: un iPhone de 402 pt a 3x pide 1206 px reales, y un iPad Pro
// en horizontal, más. Gemini entrega 1024, así que ambas se amplían con
// Lanczos —para una foto con bruma y desenfoque es suficiente; el detalle fino
// que se perdería no existe en esta imagen a propósito.
//
//     node scripts/gen-loader-fondo.mjs [--forzar]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.GOOGLE_AI_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.GOOGLE_AI_API_KEY;
const MODELO = "gemini-2.5-flash-image";

/**
 * El prompt, y las cinco cosas que hace a propósito.
 *
 *  1. **La manada va LEJOS y desenfocada.** Se pide explícitamente el plano
 *     («distant», «far background», «out of focus») porque un rinoceronte
 *     nítido en primer plano se come el HUD y deja de ser fondo.
 *  2. **El naranja se pide como LUZ, no como pigmento.** «warm orange dawn
 *     light on their hide» da piel real iluminada; «orange rhinos» a secas
 *     devuelve figuras de plástico. La primera pasada se quedó corta —la
 *     manada salió en silueta gris— así que se insiste en que el sol les da
 *     DE LADO y les enciende el lomo, que es lo que pidió el dueño: naranjas,
 *     pero creíbles.
 *  3. **El tercio superior, vacío y claro.** Ahí van el porcentaje y el
 *     nombre del asset, en blanco: si el cielo se llena de detalle o se
 *     oscurece, el texto deja de leerse y no hay CSS que lo arregle.
 *  4. **Sin personas, sin texto, sin marcas.** Lo tercero porque los modelos
 *     firman las fotos de stock con marcas de agua inventadas.
 *  5. **Nada de amenaza.** Un amanecer de sabana se parece peligrosamente a
 *     una escena de documental de caza si no se dice lo contrario; esto lo ve
 *     un niño de cuatro años esperando a que cargue su juego.
 */
const ESCENA =
  "Photorealistic African savanna at early morning, soft golden dawn light, " +
  "low layers of mist and haze drifting over tall dry grass, a few acacia " +
  "trees silhouetted on the horizon. In the FAR background, small and clearly " +
  "out of focus, a calm herd of rhinoceroses grazing peacefully. The low sun " +
  "rakes across them from the side and sets their hide glowing a warm orange, " +
  "clearly warmer than the grey haze behind them, so the herd reads as orange " +
  "shapes rather than dark silhouettes. The herd stays a subtle, distant " +
  "detail, never the subject. Wide open, uncluttered sky in the upper third, " +
  "bright and low in contrast. Shallow depth of field, gentle and peaceful " +
  "mood, nothing threatening, no people, no vehicles, no buildings, no text, " +
  "no logos, no watermark, professional landscape photography.";

// Encuadre centrado: el horizonte y la manada a media altura, cielo limpio
// arriba y pasto abajo. Es lo que sobrevive a que se recorte por los lados en
// un teléfono vertical o por arriba y abajo en un escritorio.
const ENCUADRE = `${ESCENA} Horizon and herd centred in the frame, square composition.`;

const PIEZAS = [
  ["loader-fondo", ENCUADRE, 2048],
  // Comparte el PNG crudo con la de arriba: es la misma foto a otro tamaño, y
  // generarla dos veces daría dos sabanas distintas — el fondo cambiaría al
  // rotar un iPad, que es peor que verlo un poco blando.
  ["loader-fondo-4k", null, 3840],
];

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
  if (!res.ok) {
    throw new Error(`Gemini respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  const b64 = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!b64) throw new Error(`respuesta sin imagen: ${JSON.stringify(json).slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

/**
 * Calidad 72, y el motivo es propio de ESTA pieza.
 *
 * Es el PRIMER archivo que baja el niño —el fondo del loader no puede
 * esperar a que baje el loader— así que su peso es latencia pura antes de
 * ver nada. Una foto con bruma y desenfoque es justo el tipo de imagen que
 * el WebP comprime bien: a 72 no se distingue de 88 y pesa la mitad
 * (mc-47 §4, `audits/bundle-budget.mjs` limita a 120 KB por archivo).
 */
function convertir(id, lado, fuente = id) {
  const crudo = join(RAW, `${fuente}.png`);
  const png = join(RAW, `${id}-escalado.png`);
  const webp = join(OUT, `${id}.webp`);
  // `scale=lado:-1` conserva la proporción: nunca se estira. Ver el encabezado.
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", `scale=${lado}:-1`, png]);
  execFileSync("cwebp", ["-q", "72", png, "-o", webp]);
}

if (!llave()) {
  console.error("error: falta GOOGLE_AI_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const forzar = process.argv.includes("--forzar");
let hechas = 0;

for (const [id, prompt, lado] of PIEZAS) {
  if (existsSync(join(OUT, `${id}.webp`)) && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  // `prompt` en null = derivada de la foto anterior, sin volver a generar.
  const fuente = prompt ? id : PIEZAS[0][0];
  process.stdout.write(`… ${id} — ${prompt ? "generando" : `reescalando desde ${fuente}`}\n`);
  try {
    if (prompt) {
      const img = await generar(prompt);
      writeFileSync(join(RAW, `${id}.png`), img);
    }
    convertir(id, lado, fuente);
    hechas++;
    const kb = (await import("node:fs")).statSync(join(OUT, `${id}.webp`)).size / 1024;
    console.log(`✓ ${id} — ${kb.toFixed(0)} KB en WebP`);
  } catch (err) {
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s). Revisión humana pendiente antes de commitear (D-080).`);
