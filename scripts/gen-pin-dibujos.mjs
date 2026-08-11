#!/usr/bin/env node
// gen-pin-dibujos.mjs — los 24 dibujos del PIN de KINDER (D-201).
//
// ─── Qué reemplazan ────────────────────────────────────────────────────────
//
// Hasta D-201 los 24 dibujos del PIN eran EMOJI del sistema, con tres razones
// escritas en `kids/pin.astro`: no había arte, pesan cero bytes, y el repo ya
// lo hacía en otro sitio. La tercera sigue siendo cierta; las dos primeras
// dejan de serlo aquí. En una escena de Phaser un emoji es un `Text`, que es
// justo lo que la regla visual de D-201 proscribe: todo botón es una imagen
// generada.
//
// **Cambiar el arte no invalida ningún PIN.** Lo que se hashea es la POSICIÓN
// (`"0,4,7"`), nunca el dibujo — `pin-imagenes.ts` lo documenta y es lo que
// hace este cambio seguro sobre perfiles que ya tienen PIN.
//
// ─── Por qué TODOS son juguetes de madera, y no 24 estilos distintos ───────
//
// Dos problemas se resuelven con la misma decisión.
//
// El primero es el sobre-ajuste de Recraft con formas sin referente real. Una
// «estrella» y una «pelota» son geometría pura, y la memoria del proyecto
// documenta que ese caso deriva a un objeto real inventado o a decoración de
// guardería, sin converger por más negativos que se apilen. Un juguete de
// madera con forma de estrella **sí es un objeto real**: hay millones de fotos
// de uno. La abstracción desaparece del prompt.
//
// El segundo es la coherencia. La pantalla del PIN ya está aprobada
// (D-197.1/D-199.2) y es un portón de madera: letrero tallado, botones con
// veta, marco colgante. Veinticuatro iconos planos encima de esa madera se
// verían pegados; veinticuatro juguetes de madera pintada pertenecen a la
// misma escena.
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco). Una pieza ya generada no se regenera salvo --forzar.
//
// Uso:   node scripts/gen-pin-dibujos.mjs               genera lo que falte
//        node scripts/gen-pin-dibujos.mjs --solo gato   solo ids que casen
//        node scripts/gen-pin-dibujos.mjs --forzar      regenera aunque exista
//
// Después de generar, MIRA cada imagen antes de commitearla (D-080). Lo que
// hay que comprobar aquí, además de lo de siempre (sin texto, sin marca de
// agua, un solo objeto): **que un niño de cuatro años pueda nombrarla a 88 px**
// — el tamaño real al que se pinta, no los 1024 px del original. Un objeto
// precioso e irreconocible a ese tamaño es un fallo, porque el PIN se recuerda
// por el dibujo.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
// `public/juego` y no una carpeta nueva: `astro.config.mjs` hashea SOLO
// `juego`, `mapa` y `avatares` para el candado de versión de D-200. Un
// directorio nuevo no entraría en ese hash y `CargaGlobalScene` nunca sabría
// que estas imágenes cambiaron.
const OUT = join(RAIZ, "apps/web/public/juego");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

// ─── Por qué ilustración plana y no fotografía de juguete ──────────────────
//
// El primer enfoque fue «juguete de madera tallada», fotográfico
// (`realistic_image`). Falló dos rondas seguidas y por la misma causa: «product
// photograph» arrastra a Recraft a una FOTO DE PRODUCTO completa —con mesa,
// suelo de madera rosa y luz de estudio— en vez de a un objeto aislado. Y para
// las formas difíciles de tallar (luna, estrella, nube, globo) entregaba «un
// juguete CON ese motivo pintado encima» en vez de «un juguete CON esa forma»:
// un cubo con lunas, un barril con una mariposa. Cambiar el fondo a magenta
// puro para recortarlo mejor tampoco ayudó — lo interpretó como escenografía
// rosa y lo ignoró como fondo.
//
// La memoria del proyecto dice exactamente qué hacer aquí: tras 2-3 fallos del
// mismo patrón se cambia el ENFOQUE, no se apilan negativos. El enfoque ya
// calibrado en este repo es el de `gen-avatares-animal.mjs`: «flat vector
// mascot logo icon design» sobre blanco liso, que produjo 16 piezas limpias y
// aisladas a la primera o segunda.
//
// Y para un PIN es además lo correcto, no solo lo que funciona: estos 24 son
// ICONOS que un niño de cuatro años tiene que reconocer a 88 px y recordar
// durante meses. Una silueta plana y saturada se lee a ese tamaño; una foto con
// veta, sombra y profundidad de campo, no.
const ESTILO =
  "flat cel-shaded vector icon design, thick uniform dark outline, solid " +
  "flat color fills, bright cheerful saturated colors, NOT a photograph, " +
  "NOT watercolor, NOT painterly, no texture, no brush strokes, no gradient, " +
  "no shadow, single object only, nothing else: no scenery, no ground, " +
  "no surface, no props, no hands, no text, no letters, no numbers, " +
  "no logos, no watermark, no signature, no badges, no stars";

// El encuadre de `gen-avatares-animal.mjs`, que es el que de verdad consigue
// el fondo blanco liso en este repo.
const ENCUADRE =
  "the object fills most of the square frame, seen straight " +
  "from the front, simple and instantly recognizable silhouette, isolated on " +
  "a plain solid pure white background with absolutely nothing else in it, " +
  "no frame, no border, no rounded square behind it, no card, no badge, " +
  "no shape, no gradient behind the object";

/**
 * Los 24 de `CATALOGO` (`packages/motor/src/pin-imagenes.ts`), en su orden.
 *
 * El orden NO importa para nada funcional —la rejilla se baraja por niño— pero
 * se conserva para poder cotejar la lista de un vistazo contra el motor.
 */
const DIBUJOS = [
  ["sol", "a smiling sun with short triangular rays, bright yellow"],
  ["luna", "a friendly cartoon crescent moon character with a small sleepy smiling face in profile, pale yellow-white, like a moon from a childrens bedtime picture book"],
  ["estrella", "a five-pointed star, golden yellow"],
  ["nube", "a single fluffy white cloud drawn as a die-cut sticker with a clean white outline around its bumpy edge, floating free with nothing around it"],
  ["arbol", "a tree with a round bushy green canopy and a short brown trunk"],
  ["flor", "a flower with six rounded petals, pink with a yellow center"],
  ["manzana", "a red apple with a small brown stem and one green leaf"],
  ["platano", "a curved banana, bright yellow"],
  ["pez", "a plump fish seen from the side, orange with a rounded tail"],
  ["gato", "a sitting cat seen from the front, gray with pointed ears, drawn as a die-cut sticker with a clean white outline around the cat itself, floating free with nothing around it"],
  ["perro", "a sitting dog seen from the front, light brown with floppy ears"],
  ["pajaro", "a small round bird seen from the side, sky blue with a tiny orange beak"],
  ["mariposa", "a butterfly with two pairs of open rounded wings, purple and orange"],
  ["abeja", "a plump bee with yellow and black stripes and small white wings"],
  ["rana", "a sitting frog seen from the front, bright green with big round eyes"],
  ["tortuga", "a turtle seen from the side, green with a patterned brown shell"],
  ["casa", "a house with a triangular red roof, a yellow door and one square window"],
  ["coche", "a small car seen from the side, red with two black wheels, drawn as a die-cut sticker with a clean white outline around the car itself, floating free with nothing around it"],
  ["barco", "a sailboat with one white triangular sail and a blue hull"],
  ["avion", "an airplane seen from the side, blue with straight wings"],
  ["pelota", "a round ball with wide red and white stripes"],
  ["globo", "a party balloon with a small knot at the bottom and a short curly string, bright red"],
  ["tambor", "a drum with a cream-colored top and red and blue sides"],
  ["campana", "a bell with a small loop on top, golden brass"],
];

const args = process.argv.slice(2);
const solo = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const forzar = args.includes("--forzar");

async function generar(prompt) {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${llave()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style: "digital_illustration", size: "1024x1024", n: 1 }),
    signal: AbortSignal.timeout(180_000),
  });
  if (!res.ok) throw new Error(`Recraft respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const url = json.data?.[0]?.url;
  if (!url) throw new Error(`respuesta sin url: ${JSON.stringify(json).slice(0, 200)}`);
  const img = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!img.ok) throw new Error(`la descarga respondió ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

/**
 * 256 px y no 512.
 *
 * Se pinta en una casilla de 88-112 px. 256 cubre incluso una pantalla @3x sin
 * pagar el doble de bytes, y son **24 archivos** en un dispositivo de gama
 * baja sobre 4G lento (`mc-47` §5) — de los que cada niño descarga nueve.
 */
function convertir(id) {
  const crudo = join(RAW, `pin-dibujo-${id}.webp`);
  const png = join(RAW, `pin-dibujo-${id}.png`);
  // `colorkey` del blanco a alfa, con la tolerancia de `gen-mapa-historia.mjs`
  // subida un punto (0.22 en vez de 0.18) porque el borde de una ilustración
  // plana es más limpio que el de una foto: no hay degradado que perdonar.
  //
  // Nota para quien lo toque: NO subirlo más. Tres de las 24 tienen blanco
  // DENTRO (la vela del barco, el parche del tambor, la nube), y una tolerancia
  // generosa les abre un agujero en medio que a 88 px parece suciedad.
  // El recorte no es opcional aquí: estos dibujos se pintan ENCIMA de la tabla
  // de madera de cada casilla (`pin-numerico-boton.webp`). Un PNG con fondo
  // blanco cuadrado taparía la veta y se vería como una calcomanía pegada.
  //
  // Sin AVIF, a diferencia de los avatares: `libsvtav1` con `yuv420p` **no
  // conserva el canal alfa**, así que el AVIF saldría con el fondo blanco de
  // vuelta — el defecto exacto que este recorte existe para evitar, y encima
  // invisible hasta verlo en pantalla. WebP con alfa es lo que Phaser carga.
  execFileSync("ffmpeg", [
    "-y", "-v", "error", "-i", crudo,
    "-vf", "colorkey=0xFFFFFF:0.22:0.10,scale=256:256",
    png,
  ]);
  execFileSync("cwebp", ["-q", "90", "-alpha_q", "100", png, "-o", join(OUT, `pin-dibujo-${id}.webp`)]);
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

let hechas = 0;
let fallidas = 0;
for (const [id, forma] of DIBUJOS) {
  if (solo && !id.includes(solo)) continue;
  if (existsSync(join(OUT, `pin-dibujo-${id}.webp`)) && !forzar) {
    console.log(`· ${id} — ya existe, se salta (--forzar para regenerar)`);
    continue;
  }
  process.stdout.write(`… ${id}\n`);
  try {
    const img = await generar(`${ESTILO} ${forma}, ${ENCUADRE}`);
    writeFileSync(join(RAW, `pin-dibujo-${id}.webp`), img);
    convertir(id);
    hechas++;
    console.log(`✓ ${id} — ${(img.length / 1024).toFixed(0)} KB crudo → AVIF+WebP 256px`);
  } catch (err) {
    fallidas++;
    console.error(`✗ ${id} — ${err.message}`);
  }
}

console.log(`\n${hechas} generada(s), ${fallidas} fallida(s).`);
console.log("Revisión humana pendiente antes de commitear (D-080): que sea el objeto pedido,");
console.log("sin texto ni marca de agua, y RECONOCIBLE a 88 px — no a 1024.");
