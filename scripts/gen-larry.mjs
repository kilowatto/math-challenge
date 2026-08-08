#!/usr/bin/env node
// gen-larry.mjs — el arte del compañero: Larry caminando y Larry de busto
//
// Por qué existe: el hueco `data-hueco-de-arte="larry"` (PR #391) describe las
// piezas que hacen falta y NO se inventan aquí:
//
//   1. larry_caminando — cuerpo entero, caminando, de perfil. Para el sendero
//      de KINDER (`--tap-kinder`, 88 px) y el sendero de la racha (#205). Es
//      el único sitio donde Larry se mueve.
//   2. larry_busto — busto, de frente, NEUTRO. Para el nodo del árbol de
//      PRIMARIA/SECUNDARIA y el tablero adulto (~48 px). Neutro a propósito:
//      mc-37 — el estado `denying` del avatar viejo se leía como «estás mal».
//
// El canon de Larry (guía de estilo § Larry): rinoceronte NARANJA —el naranja
// de Ignia es su color—, coach honesto, jamás avergüenza a un niño. La
// continuidad con el avatar existente es obligatoria (D-080): mismo estilo
// Recraft con el que se generó, misma paleta descrita en los prompts de
// gen-cosmeticos.mjs (colores DESCRITOS, nunca «brand palette»: esa frase
// disparaba un muestrario de color).
//
// ─── El ciclo de caminata real (D-190/plan de rediseño de Modo Historia) ────
//
// `larry_caminando` (arriba) es UNA pose estática — sirve para el sendero
// plano de KINDER, donde Larry nunca se mueve en vivo, solo "teletransporta".
// El mundo multi-bioma nuevo lo hace CAMINAR de verdad por la curva del mapa
// (`LarryAvatar.ts`), y una sola pose animada con tween se ve como un cartón
// deslizando, no caminando — de ahí `larry_camina_1..4`: cuatro cuadros de
// zancada lateral, mismo cuerpo/color/proporción que `larry_caminando`, solo
// cambia la pose de las piernas. Se generan como CUATRO llamadas separadas
// (no un spritesheet en una sola imagen) porque Recraft no da control por
// cuadro dentro de una tira — cada cuadro es su propio prompt con el mismo
// bloque de estilo, y la consistencia entre cuadros se vigila a ojo en la
// revisión humana (si un cuadro se ve fuera de tono, se regenera solo ese
// con `--solo camina_N`, no la serie completa).
//
// `larry_festejo` — pose de celebración (pata delantera/cuerno arriba), para
// el nodo recién completado, como en el video de referencia.
// `larry_idle_1/2` — dos cuadros de respiración/parpadeo sutil para cuando
// Larry está parado esperando, evita que se vea "congelado" en el mapa.
//
// Estas piezas nunca tocan el contrato de `companero.ts` (D-080): siguen
// siendo 2 campos de estado (`visible`, `accesorios`) — la animación es
// puramente de RENDER en Phaser (`scene.anims`), nunca un campo nuevo en
// `companion_state`.
//
// El punto de anclaje de accesorios NO es una tercera imagen: es el manifiesto
// `apps/web/src/components/mapa/arte-larry.json`, donde cada pieza declara
// dónde se posa un sombrero (cabeza) y dónde una bandana (cuello), en
// coordenadas relativas de la caja. Sin él, cada accesorio traería su propio
// offset y el catálogo se vuelve inmantenible (#391).
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Una pieza ya generada no se regenera — el .avif existente
// se salta, igual que la idempotencia de gen-cosmeticos.mjs.
//
// Uso:   node scripts/gen-larry.mjs                  genera lo que falte
//        node scripts/gen-larry.mjs --solo busto     solo ids que casen
//        node scripts/gen-larry.mjs --forzar         regenera aunque exista
//
// Después de generar, MIRA cada imagen antes de commitearla: que es UN
// rinoceronte naranja, neutro, sin texto ni números ni fauna de sabana
// estereotipada. Eso no lo hace este script; lo haces tú.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/mapa");
const RAW = join(RAIZ, ".arte-crudo"); // WebP de 1024 de Recraft; no se commitea
const MANIFIESTO = join(RAIZ, "apps/web/src/components/mapa/arte-larry.json");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── Las piezas: id → prompt ────────────────────────────────────────────────
//
// Las trampas ya medidas en los otros dos frentes, aplicadas desde el inicio:
// NADA de «savanna» (jala megafauna aunque la prohibición la nombre), NADA de
// «children's math app» (jala insignias con números — es «picture book»),
// ningún segundo animal (dos Larrys parecidos son peores que uno), y ningún
// texto, número ni letra: la Sabana no habla (D-019).
const ESTILO =
  "cute flat vector cartoon illustration for a children's picture book, " +
  "drawn in warm orange (#F36B1C) with blue (#0B6AB0) accents, " +
  "one single character centered on a plain solid white background, " +
  "nothing else in the image: no other animals, no people, no scenery, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures, " +
  "no color swatches, no color palette samples";

// Bloque de pose repetido en los cuatro cuadros de caminata: mismo cuerpo,
// mismo tamaño, mismo ángulo de cámara — SOLO cambia la descripción de las
// piernas/brazos. Es lo que le da a Recraft la mejor chance de consistencia
// entre llamadas separadas (no hay semilla compartida en la API pública).
//
// ANTROPOMÓRFICO, no a cuatro patas (corrección del dueño sobre el video de
// referencia): Larry camina ERGUIDO, en dos piernas, con brazos que se
// mueven al caminar — como el personaje del "Mundo Kinder" del video, no
// como `larry_caminando`/`larry_busto` (D-080, la pose original a cuatro
// patas que sigue viviendo en el sendero plano de KINDER y en la racha).
// Es una familia de pose NUEVA y deliberadamente distinta: el rediseño de
// Modo Historia es el único lugar donde Larry se ve así por ahora. Migrar
// las piezas viejas a bípedo, si el dueño lo pide, es un cambio aparte —
// esas dos ya están en producción en otras pantallas (Sendero.astro,
// SenderoRacha.astro) y no se tocan aquí sin que él lo pida explícitamente.
const CUERPO_CAMINATA =
  "an anthropomorphic cute friendly orange rhinoceros character walking " +
  "upright on two legs like a person, full body side profile view facing " +
  "right, visible arms swinging naturally at the sides while walking, " +
  "calm gentle neutral expression, small round body, tiny tail, cartoon " +
  "mascot game character style, exact same size and proportions and pose " +
  "angle as a walk cycle reference sheet frame";

const PIEZAS = [
  [
    "larry_caminando",
    "a cute small friendly orange rhinoceros walking, full body side profile " +
      "view facing right, mid-stride with one leg forward, calm gentle neutral " +
      "expression, small round body, tiny tail",
  ],
  [
    "larry_busto",
    "a circular avatar icon showing only the head of a cute friendly orange " +
      "rhinoceros, big round head taking up the whole image, facing the " +
      "viewer, both eyes and both ears visible, one small horn, calm gentle " +
      "neutral expression, plain white background, no circle badge, no leaves, " +
      "no plants, no decorative border",
  ],
  [
    "larry_camina_1",
    `${CUERPO_CAMINATA}, walk cycle frame 1 of 4: contact pose, right leg ` +
      "stepping far forward touching the ground, left leg stretched back, " +
      "left arm swung forward, right arm swung back",
  ],
  [
    "larry_camina_2",
    `${CUERPO_CAMINATA}, walk cycle frame 2 of 4: passing pose, legs close ` +
      "together mid-step directly under the body, arms passing close to the body",
  ],
  [
    "larry_camina_3",
    `${CUERPO_CAMINATA}, walk cycle frame 3 of 4: contact pose, left leg ` +
      "stepping far forward touching the ground, right leg stretched back, " +
      "right arm swung forward, left arm swung back — mirror of frame 1",
  ],
  [
    "larry_camina_4",
    `${CUERPO_CAMINATA}, walk cycle frame 4 of 4: passing pose, legs close ` +
      "together mid-step directly under the body, arms passing close to the " +
      "body, mirror of frame 2",
  ],
  [
    "larry_menu_aplaude",
    "an anthropomorphic cute friendly orange rhinoceros character clapping " +
      "with joy, standing upright on two legs like a person, three-quarter " +
      "view slightly turned toward the viewer, both front paws pressed " +
      "together near the chest in a clapping gesture, eyes closed happily, " +
      "big open joyful smile, small round body, tiny tail, cartoon mascot " +
      "game character style",
  ],
  [
    "larry_festejo",
    "an anthropomorphic cute friendly orange rhinoceros character " +
      "celebrating, standing upright on two legs like a person, full body " +
      "side profile view facing right, both arms raised up in the air in a " +
      "cheering gesture, happy joyful open expression, small round body, " +
      "tiny tail, cartoon mascot game character style, smooth solid-color " +
      "skin all over the body with completely plain unmarked texture",
  ],
  [
    "larry_idle_1",
    "an anthropomorphic cute friendly orange rhinoceros character standing " +
      "still, standing upright on two legs like a person, full body side " +
      "profile view facing right, arms relaxed at the sides, calm gentle " +
      "neutral expression with eyes open, small round body, tiny tail, " +
      "cartoon mascot game character style",
  ],
  [
    "larry_idle_2",
    "an anthropomorphic cute friendly orange rhinoceros character standing " +
      "still, standing upright on two legs like a person, full body side " +
      "profile view facing right, arms relaxed at the sides, calm gentle " +
      "expression with eyes closed mid-blink, small round body, tiny tail, " +
      "cartoon mascot game character style",
  ],
];

// ─── El anclaje de accesorios, medido sobre las piezas aceptadas ────────────
//
// Coordenadas relativas de la caja (0..1, origen arriba a la izquierda):
// `cabeza` es donde se posa un sombrero/gorra/orejeras; `cuello` es donde va
// una bandana/bufanda/collar. Los valores se miden MIRANDO la pieza aceptada
// y se ajustan a mano — por eso viven en el manifiesto y no en el prompt.
const ANCLAJES = {
  larry_caminando: { cabeza: { x: 0.7, y: 0.12 }, cuello: { x: 0.62, y: 0.45 } },
  larry_busto: { cabeza: { x: 0.48, y: 0.14 }, cuello: { x: 0.42, y: 0.82 } },
};

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

async function generar(id, prompt) {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${prompt}, ${ESTILO}`,
      style: "digital_illustration",
      size: "1024x1024",
      n: 1,
    }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) {
    throw new Error(`Recraft respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const json = await res.json();
  const url = json.data?.[0]?.url;
  if (!url) throw new Error(`respuesta sin url: ${JSON.stringify(json).slice(0, 200)}`);
  const img = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!img.ok) throw new Error(`la descarga respondió ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

function convertir(id) {
  const crudo = join(RAW, `${id}.webp`);
  const avif = join(OUT, `${id}.avif`);
  const webp = join(OUT, `${id}.webp`);
  // 512 px: se pinta en una caja de 88 px (sendero) o 48 px (nodo/tablero),
  // en Android de gama baja (mc-47 §5). Fondo blanco aplanado, como los
  // cosméticos: el componente ya le da el círculo.
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "scale=512:512",
    "-frames:v", "1", "-c:v", "libsvtav1", "-crf", "34", "-pix_fmt", "yuv420p",
    avif,
  ]);
  execFileSync("cwebp", ["-q", "85", "-resize", "512", "512", crudo, "-o", webp]);
}

/**
 * Las piezas de LarryAvatar.ts (D-190) se pintan sueltas sobre el mapa
 * ilustrado — nunca dentro de un círculo que ya les da su propio fondo, como
 * sí hacen `larry_caminando`/`larry_busto` en el sendero/tablero. Sin
 * recorte de alfa, el fondo blanco de Recraft se ve como un cuadro opaco
 * flotando sobre el bioma (encontrado al probar en navegador). Mismo
 * `colorkey` que ya usa `gen-mapa-historia.mjs` para la vegetación — y solo
 * WebP, no AVIF: estas piezas las carga `PreloadScene` con
 * `Phaser.Loader`, que pide una URL fija (ver el encabezado de ese script
 * para el porqué completo).
 */
const PIEZAS_DE_JUEGO_CON_ALFA = new Set([
  "larry_camina_1", "larry_camina_2", "larry_camina_3", "larry_camina_4",
  "larry_festejo", "larry_menu_aplaude", "larry_idle_1", "larry_idle_2",
]);

function convertirConAlfa(id) {
  const crudo = join(RAW, `${id}.webp`);
  const png = join(RAW, `${id}-alfa.png`);
  const webp = join(OUT, `${id}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "colorkey=0xFFFFFF:0.15:0.08,scale=512:512",
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
}

/**
 * El manifiesto se reescribe SIEMPRE al final, desde lo que hay en disco —
 * igual que el de arte-lugares.json: refleja lo que de verdad se sirve, y un
 * archivo borrado a mano deja de anunciarse solo. Los anclajes solo se
 * declaran para piezas que EXISTEN.
 */
function escribirManifiesto() {
  const piezas = {};
  for (const [id] of PIEZAS) {
    // Las piezas de juego con alfa (D-190) no llevan AVIF (ver
    // PIEZAS_DE_JUEGO_CON_ALFA) — no forman parte del manifiesto de
    // accesorios de todas formas, `LarryAvatar.ts` las carga por clave fija.
    const listo = PIEZAS_DE_JUEGO_CON_ALFA.has(id)
      ? existsSync(join(OUT, `${id}.webp`))
      : existsSync(join(OUT, `${id}.avif`)) && existsSync(join(OUT, `${id}.webp`));
    if (listo && ANCLAJES[id]) piezas[id] = { anclajes: ANCLAJES[id] };
  }
  writeFileSync(MANIFIESTO, JSON.stringify(piezas, null, 2) + "\n");
  return Object.keys(piezas).length;
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [id, prompt] of PIEZAS) {
  if (solo && !id.includes(solo)) continue;
  const conAlfa = PIEZAS_DE_JUEGO_CON_ALFA.has(id);
  const yaExiste = conAlfa ? existsSync(join(OUT, `${id}.webp`)) : existsSync(join(OUT, `${id}.avif`));
  if (yaExiste && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id} — generando`);
  const img = await generar(id, prompt);
  writeFileSync(join(RAW, `${id}.webp`), img);
  if (conAlfa) {
    convertirConAlfa(id);
    hechas++;
    console.log(`\r✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP con alfa en ${OUT}`);
  } else {
    convertir(id);
    hechas++;
    console.log(`\r✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo, AVIF+WebP en ${OUT}`);
  }
}

const total = escribirManifiesto();
console.log(`\n${hechas} pieza(s) nueva(s); ${total} de ${PIEZAS.length} en el manifiesto (${MANIFIESTO}).`);
console.log("MIRA cada una antes de commitearla: UN rinoceronte naranja, neutro, sin texto (mc-37, D-080).");
console.log("Y re-mide los anclajes del manifiesto contra la pieza aceptada: son coordenadas a mano.");
