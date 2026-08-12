#!/usr/bin/env node
// gen-icon-larry.mjs — el ícono real de instalación, con Larry (loader F).
//
// ─── Qué reemplaza ──────────────────────────────────────────────────────────
//
// `apps/web/public/icons/icon-{192,512}.png` son un placeholder deliberado
// desde F0 (`scripts/gen-icons.mjs`, que dice en su propio encabezado "el
// arte definitivo sale de Recraft... cuando llegue, este script se borra"):
// un cuadrado naranja con un signo de más blanco, 521 bytes. Éste es ese
// "cuando llegue".
//
// ─── Por qué ESTE estilo, y no el de `larry_busto` ─────────────────────────
//
// `larry_busto.webp` (usado en el árbol de PRIMARIA/SECUNDARIA) es precioso
// pero es ilustración PINTADA —textura, grano, sombreado suave— con hojas y
// un borde circular decorativo. Ninguna de las dos cosas sirve para un ícono
// de instalación: la textura se pierde por completo a 48px (el tamaño real
// en la mayoría de pantallas de inicio), y las hojas del borde son justo lo
// que un recorte "maskable" de Android corta primero.
//
// El estilo que SÍ ya se usó, con éxito, para íconos pequeños es el de
// `scripts/gen-avatares-animal.mjs`: plano, cel-shaded, contorno grueso,
// sin textura — los 16 avatares que el niño elige en «¿Quién juega?» y que
// además son los que caen en este mismo loader (`LoaderScene::
// texturasDeAvatar`). Usar el MISMO lenguaje visual para el ícono de Larry
// es coherencia, no una elección nueva: el ícono va a convivir, cayendo, con
// esos 16 avatares en la propia pantalla del loader.
//
// Larry no está entre esos 16 a propósito (D-194: "ninguna de las 16
// especies es rinoceronte, Larry es único") — por eso necesita su propia
// pieza, no una reutilización.
//
// ─── El fondo, y por qué es naranja y no blanco ─────────────────────────────
//
// Los 16 avatares van sobre blanco porque son una tarjeta DENTRO del juego,
// rodeada de otro contenido. Un ícono de instalación vive solo, entre otras
// apps, en un fondo que no controlamos (pantalla de inicio, cajón de apps) —
// blanco se pierde o se ve "sin terminar" en la mayoría de fondos de sistema.
// El propio placeholder que se reemplaza ya usaba naranja Ignia (#F36B1C,
// el `theme_color` real del manifest) de fondo; se conserva esa decisión,
// solo con Larry en vez de una cruz.
//
// ─── Maskable, con margen a propósito ──────────────────────────────────────
//
// `manifest.webmanifest` declara el mismo archivo para `purpose: "any"` Y
// `"maskable"`. Un ícono maskable puede perder hasta ~20% del borde en
// cualquier lado (Android recorta a distintas formas según el fabricante),
// así que el encuadre pide la cabeza dentro de una zona seguramente menor
// al 80% central — más conservador que el `ENCUADRE_ILUSTRADO` de los
// avatares, que solo vive DENTRO de un círculo pequeño en una tarjeta y
// nunca se recorta por el sistema operativo.
//
// Las llaves NUNCA se commitean: se leen de .env (./scripts/set-keys.sh las
// captura sin eco).
//
// Uso:   node scripts/gen-icon-larry.mjs             genera si falta
//        node scripts/gen-icon-larry.mjs --forzar    regenera aunque exista
//
// Después de generar, MIRA la imagen antes de commitear (D-080): que sea
// SOLO la cabeza de Larry, sin cuerno de más, sin texto, sin marca de agua,
// y que no haya nada suyo pegado al borde que un recorte redondo se coma.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;
const OUT = join(RAIZ, "apps/web/public/icons");
const RAW = join(RAIZ, ".arte-crudo");

if (!process.env.RECRAFT_API_KEY && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}
const llave = () => process.env.RECRAFT_API_KEY;

/**
 * Basado en el prompt de `larry_busto` (`gen-larry.mjs`), que sí funcionó a
 * la primera: "a circular avatar icon showing only the head of a cute
 * friendly orange rhinoceros, big round head taking up the whole image,
 * facing the viewer...". Dos intentos propios con otra redacción ("head and
 * shoulders", "portrait headshot cropped at the shoulders") le devolvieron a
 * Recraft el cuerpo completo — una vez de pie, otra con sudadera y una "R"
 * bordada, violando "sin texto". La palabra "mascot"/"character" parece
 * arrastrar la idea de un personaje completo con ropa; el prompt de busto
 * nunca las usa, dice solo "the head of a rhinoceros". Se adapta ESE patrón
 * —ya probado— en vez de seguir apilando negativos sobre uno que no sirve
 * (mismo principio que la memoria de sobre-ajuste de Recraft: cuando un
 * sujeto falla, se cambia la descripción, no se agregan más "no").
 */
// Cuarto intento: apilar más negativos ("no circle, no ring, no frame, no
// border, no badge...") empeoró todavío más — un marco decorado con
// medallones en las esquinas, textura de papel de fondo. Es el mismo patrón
// que la memoria de sobre-ajuste de Recraft ya documenta: pedir demasiado
// "no X" hace que el modelo se fije justo en la familia de conceptos que se
// niegan. Se vuelve al prompt de `larry_busto` casi palabra por palabra —
// el que sí funcionó a la primera— cambiando solo el fondo, sin apilar nada.
const PROMPT =
  "a circular avatar icon showing only the head of a cute friendly " +
  "orange rhinoceros, big round head taking up the whole image, facing " +
  "the viewer, both eyes and both ears visible, one small horn, calm " +
  "gentle neutral expression, plain solid dark orange background " +
  "(#CE4912), no circle badge, no leaves, no plants, no decorative " +
  "border";

async function generar() {
  const res = await fetch("https://external.api.recraft.ai/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${llave()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: PROMPT,
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

/**
 * PNG, no WebP/AVIF — a propósito.
 *
 * `manifest.webmanifest` declara `"type": "image/png"` para los cuatro
 * íconos, y ese formato es el que Chrome/Android exigen de verdad para
 * considerar una PWA instalable (`gen-icons.mjs` ya lo documentaba). PNG con
 * fondo SÓLIDO (nunca transparente: un ícono maskable con alfa deja ver lo
 * que haya detrás en el recorte del sistema, que no controlamos) a los dos
 * tamaños que el manifest pide.
 */
/**
 * El recorte, medido a ojo sobre la pieza aceptada (D-080).
 *
 * Recraft entregó la cabeza dentro de un círculo con margen blanco fuera y
 * unas hojas decorativas abajo (mismo motivo botánico que ya lleva
 * `larry_busto`, aceptado ahí). `crop=880:880:70:40` quita el margen blanco
 * y deja el círculo casi inscrito en el cuadro — las hojas que sobreviven
 * son un toque menor, no el sujeto.
 */
const RECORTE = "crop=880:880:70:40";

/**
 * Paleta indexada (256 colores), no RGB directo: el mismo cuadro pesaba
 * 474 KB en RGB y 174 KB con paleta, sin diferencia visible — la ilustración
 * ya usa pocos colores por diseño, RGB solo los repite sin comprimir mejor.
 * No hay `pngquant` disponible en este entorno; `palettegen`/`paletteuse` de
 * ffmpeg hacen el mismo trabajo sin depender de otra herramienta.
 */
function convertir() {
  const crudo = join(RAW, "icon-larry.webp");
  for (const lado of [192, 512]) {
    const paleta = join(RAW, `icon-larry-paleta-${lado}.png`);
    const filtro = `${RECORTE},scale=${lado}:${lado}`;
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", crudo, "-vf", `${filtro},palettegen=max_colors=256`, paleta]);
    execFileSync("ffmpeg", [
      "-y", "-v", "error",
      "-i", crudo, "-i", paleta,
      "-filter_complex", `${filtro}[x];[x][1:v]paletteuse`,
      join(OUT, `icon-${lado}.png`),
    ]);
  }
}

if (!llave()) {
  console.error("error: falta RECRAFT_API_KEY — se lee de .env (./scripts/set-keys.sh la captura sin eco)");
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });

const forzar = process.argv.includes("--forzar");
const yaExiste = existsSync(join(OUT, "icon-512.png")) && statSync(join(OUT, "icon-512.png")).size > 3000;

if (yaExiste && !forzar) {
  console.log("· icon-larry — ya existe (más de 3 KB, no es el placeholder), se salta (--forzar para regenerar)");
} else {
  process.stdout.write("… icon-larry — generando\n");
  const img = await generar();
  writeFileSync(join(RAW, "icon-larry.webp"), img);
  convertir();
  console.log(
    `✓ icon-larry — ${(img.length / 1024).toFixed(0)} KB crudo, PNG 192/512 en ${OUT}`,
  );
  console.log("\n1 pieza generada. Revisión humana pendiente antes de commitear (D-080).");
}
