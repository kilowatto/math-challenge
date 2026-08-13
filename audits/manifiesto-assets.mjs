#!/usr/bin/env node
// Auditor determinista — toda clave del manifiesto tiene su archivo
//
// Hace cumplir: D-200, D-201, mc-47 §5.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// `apps/web/src/game/assets-manifest.ts` es la lista de lo que Phaser precarga.
// Es texto: nada comprueba que las URLs que promete existan de verdad en
// `public/`. Los dos fallos que caza son silenciosos y de signo contrario:
//
//  1. **Una clave sin archivo.** El `Loader` de Phaser pide una URL que da 404
//     y la textura queda como el cuadro con diagonal verde de Phaser, o el
//     audio simplemente no suena. La pantalla no revienta: se ve mal. Pasó de
//     verdad con `larry_foto_silla` y el dueño tuvo que señalarlo desde una
//     captura.
//  2. **Un archivo sin clave.** Arte generado, revisado, desplegado… y que
//     Phaser nunca carga porque nadie lo añadió a la lista. Es exactamente lo
//     que estaba pasando con el Mundo Kinder multi-bioma: 32 imágenes y 27
//     audios en disco, conectadas 2 y 0. Nada falla; el juego simplemente no
//     usa lo que ya se pagó.
//
// El segundo es el que de verdad justifica este auditor. El primero se nota
// mirando la pantalla; el segundo NO se nota nunca — un asset que no se carga
// no deja rastro en ninguna parte.
//
// ─── Lo que NO comprueba ───────────────────────────────────────────────────
//
// Que la clave se USE en alguna escena. Un asset puede estar en el manifiesto
// y precargarse sin que ninguna escena lo dibuje todavía — es el caso de las
// ocho pistas de música por bioma, que se cargan pero no suenan hasta que
// `MusicManager.reproducir()` acepte un parámetro de bioma. Eso está anotado
// en el propio manifiesto y es deliberado, no un descuido que un barrido deba
// bloquear.

import { existsSync } from "node:fs";
import { archivos, leer, informar, RAIZ } from "./lib/repo.mjs";

const MANIFIESTO = "apps/web/src/game/assets-manifest.ts";
const PUBLICO = "apps/web/public";

const problemas = [];
const notas = [];

const crudo = leer(MANIFIESTO);
if (crudo === null) {
  problemas.push(`no pude leer ${MANIFIESTO} — sin él este auditor no vigila nada`);
}

const entradas = [...(crudo ?? "").matchAll(/\{\s*clave:\s*"([^"]+)",\s*url:\s*"([^"]+)"\s*\}/g)].map(
  (m) => ({ clave: m[1], url: m[2] }),
);

if (crudo && entradas.length === 0) {
  problemas.push(
    "0 entradas encontradas en el manifiesto — o cambió su forma, o dejó de listar assets. " +
      "Las dos cosas hay que mirarlas: un barrido sobre nada aprueba siempre.",
  );
}

// --- 1. Toda clave promete un archivo que existe ---------------------------
for (const { clave, url } of entradas) {
  if (!existsSync(`${RAIZ}${PUBLICO}${url}`)) {
    problemas.push(
      `${clave} → ${url} NO existe en ${PUBLICO}. Phaser pedirá esa URL, recibirá 404, y la ` +
        "textura saldrá como el placeholder con diagonal verde (o el audio no sonará). No falla " +
        "nada visible en el gate: se ve mal en el dispositivo.",
    );
  }
}

/**
 * Carpetas cuyo contenido DEBE estar en el manifiesto.
 *
 * `avatares` y `cosmeticos` quedan fuera a propósito: se cargan por lista
 * derivada (`TODOS_LOS_ANIMALES.map(claveDeAnimal)`) y no entrada por entrada,
 * así que exigirlos aquí sería pedir que se dupliquen.
 */
const VIGILADAS = [
  /^apps\/web\/public\/juego\/.*\.(webp|mp3)$/,
  // Modo Esquí/Deslizada (D-201, plan 2026-08-10): arte entero por bioma,
  // sin escena de Phaser todavía que lo use — exactamente el caso para el
  // que este auditor existe, y donde más falta hace vigilarlo (nadie va a
  // notar un archivo huérfano aquí solo mirando la pantalla).
  /^apps\/web\/public\/esqui\/.*\.(webp|mp3)$/,
];

/**
 * Grupos que el manifiesto declara con `.map()` en vez de entrada por entrada.
 *
 * No son huecos: `CLAVES_LETRERO_LOCALE.map(...)` y
 * `Array.from({ length: CANTIDAD_VARIANTES_ENGRANE }, ...)` generan sus URLs
 * en tiempo de ejecución, y derivarlas de una constante es MEJOR que listarlas
 * —un locale nuevo entra solo— así que este auditor no puede pedir que se
 * escriban a mano.
 *
 * Se listan por patrón y no se ignora la carpeta entera: si mañana aparece un
 * `letrero-quien-juega-ja-JP.webp` sin que nadie toque `CLAVES_LETRERO_LOCALE`,
 * este auditor tampoco lo vería. Ese hueco queda dicho aquí, no escondido.
 */
const DERIVADOS = [
  /\/letrero-quien-juega-[^/]+\.webp$/,
  /\/engrane-madera-\d+\.webp$/,
  // Los 24 dibujos del PIN se derivan de `CATALOGO` (el motor decide cuáles
  // existen) y su atrezo de `CLAVES_ATREZO_PIN`. Que la lista viva en el motor
  // y no aquí es lo que hace imposible que el manifiesto y el catálogo se
  // separen — y `audits/pin-arte-completo.mjs` ata ese lado con el disco.
  /\/pin-dibujo-[^/]+\.webp$/,
  /\/pin-numerico-[^/]+\.webp$/,
  // El fondo del loader NO pasa por el manifiesto, y es la única pieza de la
  // que eso es cierto a propósito (D-201, loader D).
  //
  // El manifiesto es la lista que `CargaAssetsScene` descarga, y el fondo del
  // loader no puede esperar a esa descarga: es lo que se ve MIENTRAS ocurre.
  // `LoaderScene` lo pide con un `Image` del DOM en su primer fotograma y
  // elige entre las dos variantes según los píxeles reales de la pantalla —
  // meterlo en el manifiesto haría que además se bajaran las dos en todos los
  // dispositivos, incluido el Android de gama baja al que la de 4K le sobra
  // (mc-47 §5).
  //
  // La regla que el auditor defiende sigue en pie: nadie más puede tener arte
  // fuera del manifiesto «porque sí». Ésta lleva su motivo escrito aquí y en
  // `LoaderScene::construirFondo`.
  /\/loader-fondo(-4k)?\.webp$/,
];

// --- 2. Todo archivo de esas carpetas está en el manifiesto ----------------
const declaradas = new Set(entradas.map((e) => e.url));
const enDisco = archivos(/^apps\/web\/public\/.*$/).filter((f) =>
  VIGILADAS.some((re) => re.test(f)),
);
const huerfanos = enDisco
  .filter((f) => !declaradas.has(f.replace(/^apps\/web\/public/, "")))
  .filter((f) => !DERIVADOS.some((re) => re.test(f)));

for (const ruta of huerfanos) {
  problemas.push(
    `${ruta} existe pero NINGUNA entrada del manifiesto lo nombra. Arte o audio generado, ` +
      "revisado y desplegado que Phaser nunca carga — no falla nada, simplemente no se usa lo " +
      "que ya se pagó. Añádelo a `IMAGENES_MODO_HISTORIA`/`AUDIOS_MODO_HISTORIA` (o al grupo " +
      "que corresponda), con un comentario en inglés diciendo para qué sirve.",
  );
}

notas.push(`${entradas.length} entradas en el manifiesto, ${enDisco.length} archivo(s) vigilados en public/juego y public/esqui`);

informar({
  nombre: "manifiesto-assets",
  problemas,
  notas,
  cita: "D-200, D-201, mc-47 §5",
  revisados: entradas.length + enDisco.length,
  resumen: "toda clave del manifiesto tiene archivo, y todo archivo de juego/ está en el manifiesto",
  porQueBloquea:
    "los dos fallos son invisibles: una clave sin archivo se ve como un placeholder verde en el " +
    "dispositivo (y solo ahí), y un archivo sin clave no deja rastro en ningún sitio — el juego " +
    "simplemente no usa arte que ya se generó, revisó y desplegó.",
  noComprueba: [
    "que la clave se USE en alguna escena: las 8 pistas de música por bioma se precargan y todavía no suenan, a propósito, hasta que MusicManager acepte un parámetro de bioma",
    "avatares/ y cosmeticos/, que se cargan por lista derivada y no entrada por entrada",
    "los letreros por locale y los engranes: el manifiesto los deriva con `.map()`, así que un archivo nuevo de esas familias sin tocar su constante tampoco se vería",
    "que el archivo contenga lo que su nombre dice — eso es revisión humana (D-080)",
  ],
});
