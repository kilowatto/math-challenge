#!/usr/bin/env node
// gen-mecanicas-historia.mjs — assets de las 14 mecánicas nuevas de kinder,
// una vez por cada uno de los 4 biomas (plan de mundo multi-bioma,
// docs/planes/2026-08-09-mundo-kinder-multi-bioma.md §4 y §6).
//
// Mismo patrón exacto que `gen-mapa-historia.mjs` para la vegetación: fondo
// blanco puro para recorte por color (`colorkey`), estilo "digital_illustration"
// de Recraft, paleta de color como el ÚNICO eje que cambia entre biomas — la
// forma de cada pieza es la misma en los 4, para que un niño reconozca "esto
// se toca" sin importar en qué bioma esté (mc-20: iconos funcionales
// repetidos y consistentes son lo que un niño de 3 años aprende a reconocer).
//
// Ningún numeral se hornea en ninguna pieza — Phaser pinta encima, igual que
// `tronco-a`/`tronco-b` (D-190).
//
// 7 piezas base × 4 biomas = 28 generaciones de Recraft. Decisión explícita
// del dueño: bespoke por bioma SOLO para objetos del mundo con volumen real
// (piedra, burbuja, canasta) — nunca una forma compartida con tinte.
//
// **12 de las 19 mecánicas NO están en este archivo, a propósito**, las 12
// dibujadas con `Phaser.GameObjects.Graphics` en vez de Recraft:
//   - marco-comparar, camino-guia, riel-carril, carta-reverso, marco-carta:
//     formas planas sin referente real fuerte. Recraft insiste en
//     inventarles un objeto real (espejo, aro de luz, pantalla, vía de
//     tren, retrato, ficha de pintura) sin importar el prompt — 3-4
//     intentos cada una, documentado en el historial de cada punto abajo.
//   - zona-destino, indicador-pulso, contador-visual, icono-pista,
//     efecto-fusion, punto-incremento, blanco-movil: interfaz de
//     interacción abstracta, no objetos del mundo — el dueño decidió
//     (2026-08-10) que no deben cambiar por bioma.
// Ver [[feedback_recraft-overfitting-fixes]] puntos 7-9.
//
// Uso:   node scripts/gen-mecanicas-historia.mjs              genera lo que falte
//        node scripts/gen-mecanicas-historia.mjs --solo pop   solo claves que casen
//        node scripts/gen-mecanicas-historia.mjs --forzar     regenera aunque exista

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── Fondo blanco para recorte por color — idéntico a gen-mapa-historia.mjs ─
const BLANCO =
  "isolated on a pure flat solid white (#FFFFFF) background, nothing else in the frame, no shadow, " +
  "no ground, no gradient background, no scenery, no landscape, no background scene, no other objects, " +
  "no second item, no extra elements";

// ─── Las 4 paletas de bioma — MISMOS valores hex que ya usa gen-mapa-historia.mjs,
// reusados literalmente para que un objeto de mecánica y una piedra/planta del
// mismo bioma se sientan de la misma familia visual.
const ESTILO_SABANA =
  "simple flat vector game asset illustration, object only, not a character, not alive, no personality, " +
  "side view or slight top-down game asset, clean simple shape that reads well at small size, " +
  "warm savanna green and gold tones (#5B8C3A base, #8FC461 highlights, warm gold accents allowed) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
const ESTILO_DESIERTO =
  "simple flat vector clipart illustration, object only, not a character, not alive, no personality, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "warm sand and terracotta tones (#D9A066 base, #E8C48A highlights) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, " +
  "no animals, no creatures, no camel, no lizard, no snake, no bird, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
const ESTILO_NIEVE =
  "simple flat vector clipart illustration, object only, smooth solid-color surface with completely plain unmarked texture, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "cool white and pale blue tones (#EAF3F7 base, #BFDCE8 highlights) " +
  "no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";
const ESTILO_COSTA =
  "simple flat vector clipart illustration, object only, not a character, not alive, no personality, " +
  "side view game asset, clean simple shape that reads well at small size, " +
  "tropical green and sandy tones (#5B8C3A base, #E8D9A8 highlights) " +
  "absolutely no face, no eyes, no mouth, no smile, no cheeks, no limbs, no people, no characters, no animals, " +
  "no text, no numbers, no letters, no logos, no watermarks, no signatures";

// ─── El candado contra "escena en vez de icono" ─────────────────────────────
//
// Encontrado probando de verdad, no anticipado en el diseño: pedir "a single
// bubble... floating pop-game bubble" le bastó a Recraft para dibujar una
// escena completa — una ranita antropomorfizada mirando la burbuja, sobre
// pasto, con un insecto — nada que se pareciera a un ícono aislado. Mismo
// fallo que ya documentó `gen-mapa-historia.mjs` con la vegetación
// ("children's game" + forma redondeada dispara personaje), solo que aquí
// además compone una escena narrativa entera. La combinación que sí funciona
// (verificada contra `roca-desierto`/`roca-costa`, ya en producción, y
// reconfirmada probando esta sesión): "extreme close-up crop... filling the
// entire frame" para objetos con volumen, "flat vector icon of..." para
// props planos de UI, y este candado en las dos — nunca uno sin el otro.
// Recortado a propósito (2026-08-09, tras el primer lote real): la mitad de
// las 76 pasaba el límite de 1000 caracteres de Recraft con la versión larga.
// Lo que NO_ESCENA necesita aportar es solo lo que ESTILO_X todavía no cubre
// — anti-CRIATURA ya está en los 4 bloques de bioma; lo que faltaba era
// anti-ESCENA (fondo narrativo, otros objetos).
const NO_ESCENA = "isolated single icon, no scene, no background story, no ground, no other objects";

// ─── Las 19 piezas base, cada una × 4 biomas = 76 entradas explícitas ───────
//
// [clave, prompt, ancho, alto]. Nada de esto se genera por función: cada
// entrada es la prompt real y completa que se le manda a Recraft — a
// propósito, para que se pueda copiar una sola línea a mano si algún día
// hay que regenerar solo esa.
export const MECANICAS = [
  // 1. Tap en secuencia/orden (K03, K06) — cada toque crea una ficha con conteo audible
  // Dos intentos previos (ver git history): "counting token"/"disc" horneó un
  // número y estrellas grabadas (asociación con moneda de colección); luego
  // "pebble marker" con exclusiones de moneda dio una piedra con cara y hojas
  // (la misma antropomorfización no pedida que ya se peleó en la vegetación).
  // La frase que ya funciona en `roca-desierto`/`roca-costa` — "extreme
  // close-up crop... filling the entire frame" + "geological mineral object,
  // not a creature" — evita las dos cosas sin necesitar exclusiones extra.
  ["ficha-conteo-sabana", `extreme close-up crop of a smooth round flat pebble filling the entire frame, plain rounded flat top with a subtle raised edge, completely plain unmarked surface, geological mineral object, not a creature, ${BLANCO}, ${ESTILO_SABANA}`, 120, 120],
  ["ficha-conteo-desierto", `extreme close-up crop of a smooth round flat pebble filling the entire frame, plain rounded flat top with a subtle raised edge, completely plain unmarked surface, geological mineral object, not a creature, ${BLANCO}, ${ESTILO_DESIERTO}`, 120, 120],
  ["ficha-conteo-nieve", `extreme close-up crop of a smooth round flat pebble filling the entire frame, plain rounded flat top with a subtle raised edge, completely plain unmarked surface, geological mineral object, not a creature, ${BLANCO}, ${ESTILO_NIEVE}`, 120, 120],
  ["ficha-conteo-costa", `extreme close-up crop of a smooth round flat pebble filling the entire frame, plain rounded flat top with a subtle raised edge, completely plain unmarked surface, geological mineral object, not a creature, ${BLANCO}, ${ESTILO_COSTA}`, 120, 120],

  // 2. Tap-to-pop, estado normal (K01, K02, K03, K11, K12) — burbuja
  //
  // Primer intento: "a single round bubble... floating pop-game bubble" —
  // Recraft devolvió una rana antropomorfizada mirando la burbuja, sobre
  // pasto, con un insecto de fondo. Exactamente el fallo que motivó el
  // candado `NO_ESCENA`.
  // "burbuja-sabana"/"burbuja-costa" — primer intento con "or glass orb"
  // devolvió, las dos veces, una bola de nieve/snow-globe con una escena
  // completa adentro (una jirafa en la sabana, una palmera en la playa) —
  // "glass orb" tiene demasiada asociación con snow globes decorativos. Se
  // quita esa frase y se deja solo "soap bubble", con candado explícito
  // contra el globo de nieve.
  ["burbuja-sabana", `extreme close-up crop of a single round translucent soap bubble filling the entire frame, smooth glossy iridescent surface with a small highlight, empty bubble with nothing inside, not a snow globe, no scene inside, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 160, 160],
  ["burbuja-desierto", `extreme close-up crop of a single round soap bubble or glass orb filling the entire frame, smooth glossy translucent surface with a small highlight and a thin outline, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 160, 160],
  ["burbuja-nieve", `extreme close-up crop of a single round soap bubble or glass orb filling the entire frame, smooth glossy translucent surface with a small highlight and a thin outline, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 160, 160],
  ["burbuja-costa", `extreme close-up crop of a single round translucent soap bubble filling the entire frame, smooth glossy iridescent surface with a small highlight, empty bubble with nothing inside, not a snow globe, no scene inside, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 160, 160],

  // 3. Tap-to-pop, estado reventado — burbuja-pop
  // "burbuja-pop-sabana"/"burbuja-pop-costa" — primer intento con "radiating
  // outward" devolvió una escena de fondo (bosque desenfocado con una
  // ramita en Sabana; una flor de diente de león con semillas volando sobre
  // pasto en Costa) — "particle... radiating" se leyó como una escena de
  // naturaleza, no como fragmentos de burbuja. Se reformula sin
  // "radiating" y con candado explícito contra planta/bosque/suelo.
  // "burbuja-pop-sabana" — 2do intento (con candado anti-planta) todavía
  // coló un fondo completo de bosque desenfocado, suelo y brillo de sol —
  // 3er y último intento: candado explícito contra fondo/foto exterior,
  // sin mencionar el bioma dentro del prompt de esta pieza.
  ["burbuja-pop-sabana", `extreme close-up crop of a bursting soap bubble filling the frame, round droplets and curved fragments with sparkle, plain white background only, no forest, no sunlight glow, no horizon, no ground, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 180, 180],
  ["burbuja-pop-desierto", `extreme close-up crop of a bursting soap bubble filling the entire frame, a few small soft particle fragments and a light sparkle radiating outward from a mostly-vanished round shape, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 180, 180],
  ["burbuja-pop-nieve", `extreme close-up crop of a bursting soap bubble filling the entire frame, a few small soft particle fragments and a light sparkle radiating outward from a mostly-vanished round shape, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 180, 180],
  ["burbuja-pop-costa", `extreme close-up crop of a bursting soap bubble filling the entire frame, breaking into round droplets and curved soap-film fragments with a light sparkle, no flower, no plant, no forest, no grass, no ground, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 180, 180],

  // 4. Tap origen→destino, zona de aterrizaje (K05, K09, K10, K12) — SACADO DE
  // RECRAFT (decisión del dueño, 2026-08-10): es interfaz abstracta, no un
  // objeto del mundo — no cambia por bioma. `Phaser.GameObjects.Graphics`
  // dibuja el anillo una sola vez con la paleta de marca.

  // 5. Tap origen→destino, el objeto que salta — objeto-saltarin
  ["objeto-saltarin-sabana", `extreme close-up crop of a small smooth rounded pebble filling the entire frame, plain unmarked surface, geological mineral object, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 110, 110],
  ["objeto-saltarin-desierto", `extreme close-up crop of a small smooth rounded pebble filling the entire frame, plain unmarked surface, geological mineral object, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 110, 110],
  ["objeto-saltarin-nieve", `extreme close-up crop of a small smooth rounded pebble filling the entire frame, plain unmarked surface, geological mineral object, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 110, 110],
  // "objeto-saltarin-costa" — primer intento coló 4-5 piedras juntas en vez
  // de una sola (mismo prompt que sabana/desierto, que sí salieron con una
  // sola) — se refuerza "only one, not a pile" para esta variante.
  // 2do intento (una sola piedra, sin cúmulo) coló una enredadera con hojas
  // creciendo sobre la piedra — 3er intento: candado explícito contra planta.
  ["objeto-saltarin-costa", `extreme close-up crop of a single small smooth rounded pebble filling the entire frame, plain unmarked surface, geological mineral object, only one pebble, not a pile, not a cluster, no other pebbles, no plant, no vine, no leaves, no sprout growing on it, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 110, 110],

  // 6. Swipe corto con snap, el riel (K08, K14) — SACADO DE RECRAFT
  // (decisión del dueño, 2026-08-10). 3 intentos, 3 fallos distintos —
  // vía de ferrocarril, comida (queso, pan), plano técnico con acotaciones
  // — mismo patrón que marco-comparar/camino-guia: forma sin referente
  // real fuerte, Recraft le inventa un objeto real cada vez. "-nieve" sí
  // había funcionado en el 2do intento pero se retira por consistencia —
  // las 4 variantes de bioma se dibujan igual con `Phaser.Graphics`, sin
  // variar entre biomas (mismo criterio que las otras piezas de interfaz).

  // 7. Swipe corto con snap, la perilla que se mueve — indicador-movil
  //
  // Primer intento: "bead or button" — Recraft dibujó un botón de costura
  // real con agujeros para el hilo, las 4 veces (y en Desierto/Costa coló
  // varios botones juntos en vez de uno). "button" tiene demasiada
  // asociación con botones de ropa — se cambia a "glass marble", sin
  // agujeros posibles, y se refuerza "only one, not a pile".
  ["indicador-movil-sabana", `extreme close-up crop of a single small smooth glass marble filling the entire frame, plain glossy surface with a small highlight, no holes, only one marble, not a pile, not a cluster, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 90, 90],
  ["indicador-movil-desierto", `extreme close-up crop of a single small smooth glass marble filling the entire frame, plain glossy surface with a small highlight, no holes, only one marble, not a pile, not a cluster, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 90, 90],
  ["indicador-movil-nieve", `extreme close-up crop of a single small smooth glass marble filling the entire frame, plain glossy surface with a small highlight, no holes, only one marble, not a pile, not a cluster, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 90, 90],
  ["indicador-movil-costa", `extreme close-up crop of a single small smooth glass marble filling the entire frame, plain glossy surface with a small highlight, no holes, only one marble, not a pile, not a cluster, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 90, 90],

  // 8. Comparar-y-tocar, el marco de aparición (K01, K07) — SACADO DE RECRAFT.
  //
  // Tres intentos, tres objetos reales distintos en vez de una forma
  // abstracta: "spotlight frame con brillo suave" → un espejo de mano con
  // tripié; "glowing ring of light como spotlight" → un aro de luz de
  // videoconferencia con cable USB. Un círculo delgado sin más no tiene
  // referente real que Recraft pueda dibujar — así que dibuja UNO cada vez.
  // Se dibuja con `Phaser.GameObjects.Graphics` en el cliente (un círculo con
  // trazo y brillo), no con un asset — ver [[feedback_recraft-overfitting-fixes]]
  // punto 7. Sin entradas aquí: no hay generación de Recraft para esta pieza.

  // 9. Tap-to-sort, contenedor A (K07, K13)
  ["canasta-clasificar-sabana", `flat vector icon of a single empty woven basket container, seen from a slight top-down angle, nothing inside it, isolated object, no market, no shop, no other baskets, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 220, 180],
  ["canasta-clasificar-desierto", `flat vector icon of a single empty woven basket container, seen from a slight top-down angle, nothing inside it, isolated object, no market, no shop, no other baskets, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 220, 180],
  ["canasta-clasificar-nieve", `flat vector icon of a single empty woven basket container, seen from a slight top-down angle, nothing inside it, isolated object, no market, no shop, no other baskets, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 220, 180],
  ["canasta-clasificar-costa", `flat vector icon of a single empty woven basket container, seen from a slight top-down angle, nothing inside it, isolated object, no market, no shop, no other baskets, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 220, 180],

  // 10. Tap-to-sort, contenedor B (segundo, visualmente distinto del A)
  ["canasta-b-sabana", `flat vector icon of an empty smooth rounded bowl container, unlike a woven basket, top-down angle, nothing inside, no market, no shop, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_SABANA}`, 220, 180],
  ["canasta-b-desierto", `flat vector icon of an empty smooth rounded bowl container, unlike a woven basket, top-down angle, nothing inside, no market, no shop, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_DESIERTO}`, 220, 180],
  ["canasta-b-nieve", `flat vector icon of an empty smooth rounded bowl container, unlike a woven basket, top-down angle, nothing inside, no market, no shop, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_NIEVE}`, 220, 180],
  // "canasta-b-costa" — primer intento coló un patrón decorativo de frutas
  // tropicales pintado en el tazón (piña, aguacate, cereza) — Recraft
  // ignoró "no fruit, no food" al decorar la SUPERFICIE del objeto en vez
  // de poner fruta adentro; se refuerza contra decoración/patrón, no solo
  // contra fruta como contenido.
  ["canasta-b-costa", `flat vector icon of an empty smooth rounded bowl container, unlike a woven basket, top-down angle, nothing inside, plain unpatterned surface with no decoration, no painted pattern, no illustration on it, no market, no shop, no fruit, no food, ${NO_ESCENA}, ${BLANCO}, ${ESTILO_COSTA}`, 220, 180],

  // 11-12. Match-tap de pares, reverso y marco de la carta (K05, K06) —
  // SACADAS DE RECRAFT (decisión del dueño, 2026-08-10). Cuatro intentos,
  // cuatro fallos distintos por palabra-gatillo: "face" → retrato humano;
  // "tile" → ficha técnica de cerámica con texto inventado; forma
  // geométrica pura sin ninguna palabra → muestra de pintura/Pantone con
  // texto inventado. 2 de las 8 (carta-reverso-desierto, marco-carta-sabana)
  // habían sobrevivido al 3er intento, pero se retiran por consistencia —
  // un rectángulo con esquinas redondeadas es trivial en
  // `Phaser.Graphics`, y las 8 variantes se dibujan igual sin variar por
  // bioma (mismo criterio que el resto de la interfaz abstracta).

  // 13. Tap-to-beat, marcador de pulso (K02, K14) — SACADO DE RECRAFT
  // (interfaz abstracta, no objeto del mundo). Phaser dibuja los anillos
  // concéntricos con `Graphics` una sola vez.

  // 14. Tap-hasta-un-objetivo, medidor visual (K04) — SACADO DE RECRAFT
  // (interfaz abstracta). Phaser dibuja el arco del medidor y la aguja con
  // `Graphics` una sola vez.

  // 15. Trazado guiado, la línea del camino (K08, K13) — SACADO DE RECRAFT.
  //
  // Mismo problema que marco-comparar: "dashed guide line" → un mapa de ruta
  // con pin de ubicación; "dashes on a screen" → una pantalla de computadora
  // literal con un avioncito de papel. Una línea punteada corta se dibuja con
  // `Phaser.GameObjects.Graphics` (`lineStyle` + `strokeLineShape` con un
  // patrón de trazos), exacta siempre — ver
  // [[feedback_recraft-overfitting-fixes]] punto 7.

  // 16. Tap-and-hold, ícono de pista opcional (transversal a cualquier
  // habilidad) — SACADO DE RECRAFT (interfaz abstracta, transversal a los 4
  // biomas por definición — no tendría sentido que cambiara). Phaser dibuja
  // el foquito con `Graphics`.

  // 17. Tap-para-fusionar, el efecto de combinar (K10, K11) — SACADO DE
  // RECRAFT (efecto de luz abstracto, no objeto del mundo). Phaser lo anima
  // con `Graphics` + un tween de escala/alpha, no con un sprite.

  // 18. Tap incremental en dos puntos fijos (K09) — SACADO DE RECRAFT
  // (dos botones planos son interfaz, no objeto del mundo). Phaser dibuja
  // los dos círculos con `Graphics`.

  // 19. Tap a blanco en movimiento (K04) — SACADO DE RECRAFT (interfaz
  // abstracta). Phaser dibuja el aro de blanco con `Graphics`; el
  // motion-streak es un tween de alpha/escala sobre una copia del trazo.
];

async function generar(prompt) {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, style: "digital_illustration", size: "1024x1024", n: 1 }),
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

/** Blanco → alfa, y recorte al tamaño final — idéntico a gen-mapa-historia.mjs. */
function convertir(clave, w, h) {
  const crudo = join(RAW, `${clave}.webp`);
  const png = join(RAW, `${clave}-alfa.png`);
  const webp = join(OUT, `${clave}.webp`);
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", `colorkey=0xFFFFFF:0.18:0.10,scale=${w}:${h}`,
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", webp]);
}

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
for (const [clave, prompt, w, h] of MECANICAS) {
  if (solo && !clave.includes(solo)) continue;
  const destino = join(OUT, `${clave}.webp`);
  if (existsSync(destino) && !forzar) {
    console.log(`· ${clave} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${clave} — generando`);
  try {
    const img = await generar(prompt);
    writeFileSync(join(RAW, `${clave}.webp`), img);
    convertir(clave, w, h);
    hechas++;
    console.log(`\r✓ ${clave} — ${(img.length / 1024).toFixed(0)} KB crudo, WebP con alfa en ${OUT}`);
  } catch (err) {
    console.error(`\r✗ ${clave} — ${err.message}`);
  }
}

console.log(`\n${hechas} pieza(s) nueva(s) de ${MECANICAS.length} en ${OUT}.`);
console.log("MIRA cada una antes de commitear — el recorte de blanco es el error más común (halo visible), y confirma que ninguna coló una cara o una escena de fondo (mismo riesgo que la vegetación de gen-mapa-historia.mjs).");
