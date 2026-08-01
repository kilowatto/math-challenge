#!/usr/bin/env node
// Auditor determinista 09 — presupuesto de precaché del service worker
//
// Hace cumplir: D-030 (presupuesto de rendimiento), D-032, mc-42 (≤5 MB de
// audio en la primera instalación), mc-47 §4, mc-33.
//
// Por qué existe. Todo lo que está en `PRECACHE` se descarga **antes de que el
// usuario pida nada**: el evento `install` corre en la primera visita, mientras
// la persona todavía está mirando la primera pantalla. En una laptop eso no se
// nota nunca; el dispositivo de referencia de este producto es Android de gama
// baja sobre 4G lento (mc-47 §4), donde cada entrada del precaché es tiempo que
// el usuario paga sin haberlo pedido.
//
// La lista de precaché es además el sitio donde el peso crece sin que nadie lo
// vea: `bundle-budget` mide `apps/web/dist` y no sabe nada de esta lista, y una
// entrada añadida aquí no rompe ninguna prueba, no cambia ninguna pantalla y no
// aparece en ningún diff que se lea con prisa. Por eso el guardián es mecánico.
//
// Se mide el peso **real de los archivos en disco**, no el declarado. Un
// comentario que dice "son 2 archivos pequeños" envejece; los bytes no.
//
// Lo que este auditor NO puede comprobar, dicho antes de que alguien lo suponga:
//
//   · Lo que el runtime cachea después de instalar. La estrategia cache-first
//     de `fetch` mete en `runtime-*` todo lo estático que se visite, y eso no
//     está acotado por nadie. Aquí solo se juzga la primera instalación.
//   · Que el servidor sirva esos bytes comprimidos de verdad. Se estima con
//     gzip para lo que es texto, que es conservador frente al brotli de
//     Cloudflare; comprobar el `content-encoding` real es trabajo de live.mjs.
//   · El peso de la primera instalación completa. El navegador también baja el
//     HTML, el CSS y el JS de la primera navegación. mc-42 habla de la huella
//     de audio del primer install, y de ella este auditor solo ve la parte que
//     pasa por PRECACHE — audio que se descargue desde el código de la
//     aplicación en el primer arranque es invisible aquí.
//   · Si un archivo del precaché es el correcto. Que exista y pese poco no
//     dice que sea la fuente que la página referencia.

import { existsSync, readFileSync, statSync } from "node:fs";
import { extname } from "node:path";
import { gzipSync } from "node:zlib";

const raiz = new URL("..", import.meta.url).pathname;
const SW = "apps/web/public/sw.js";
const PUBLIC = "apps/web/public";

// Presupuestos en KB tal como viajan por la red.
//
// De dónde salen los números, porque un presupuesto sin origen se negocia a la
// baja el día que estorba:
//
//   shellTotal — hoy el precaché real pesa ~72 KB (dos subconjuntos de la
//     fuente variable, dos íconos y el manifest). 200 KB deja sitio para dos
//     subconjuntos más o para un CSS crítico, y se queda corto justo cuando
//     alguien quiera precachear las siete páginas de locale — que es
//     exactamente la decisión que `sw.js` documenta haber tomado al revés.
//   cadaEntrada — 100 KB. El archivo más pesado hoy son 42 KB de woff2. Este
//     techo caza el PNG sin optimizar o la fuente sin subsetear, que es la
//     forma habitual en que este presupuesto se rompe de golpe.
//   audioTotal — 5 MB, el límite duro de mc-42 (§13: sprite de efectos ≤1.5 MB
//     + paquete de voz del idioma por defecto ≤2-3 MB, los otros cuatro
//     idiomas bajo demanda). Es el único número aquí que no es nuestro: viene
//     de la investigación y no se ajusta sin cambiarla.
const PRESUPUESTO = {
  shellTotal: 200,
  cadaEntrada: 100,
  audioTotal: 5 * 1024,
};

// Lo que gana con compresión de texto. Todo lo demás (woff2, png, avif, webp,
// mp3, opus) ya viene comprimido y volver a comprimirlo no cambia nada, así que
// para esos el peso en red es el peso en disco.
const COMPRIMIBLES = new Set([
  ".webmanifest", ".json", ".js", ".mjs", ".css", ".html", ".svg", ".txt", ".xml",
]);

// Extensiones de audio. `.webm` entra aunque también sirva para video: en este
// producto no hay video, y si algún día lo hubiera el que lo añada debería
// tropezar con este auditor y decidir a propósito, no colarlo por ambigüedad.
const AUDIO = new Set([
  ".mp3", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".wav", ".flac", ".weba", ".webm",
]);

const problemas = [];

// --- Falla cerrado -------------------------------------------------------
// Un escáner que no encuentra qué medir pasa siempre, y eso ya fue un bug real
// de este repo (audits/secrets.mjs era ciego en un clon sin commits). Si no hay
// service worker, o no se puede leer la lista, esto es un fallo — no un "no
// aplica".

if (!existsSync(`${raiz}${SW}`)) {
  console.error("✗ precache-budget\n");
  console.error(`  · no existe ${SW}. El service worker es la implicación 3 de mc-33,`);
  console.error(`    no un extra: si desapareció, alguien tiene que decir por qué.`);
  console.error(`\n  Hace cumplir: D-030, D-032, mc-42, mc-47 §4, mc-33`);
  process.exit(1);
}

const fuente = readFileSync(`${raiz}${SW}`, "utf8");

// Se lee el literal del arreglo, no se ejecuta el service worker: importarlo
// exigiría un DOM falso con `self`, `caches` y `clients`, y un auditor que
// necesita un entorno simulado para opinar se rompe cada vez que el archivo que
// vigila cambia de forma.
const bloque = fuente.match(/const\s+PRECACHE\s*=\s*\[([\s\S]*?)\]\s*;/);

if (!bloque) {
  console.error("✗ precache-budget\n");
  console.error(`  · no se encontró \`const PRECACHE = [...]\` en ${SW}.`);
  console.error(`    O se renombró, o pasó a construirse en tiempo de ejecución.`);
  console.error(`    En ambos casos este auditor quedó ciego, y ciego se falla.`);
  console.error(`\n  Hace cumplir: D-030, D-032, mc-42, mc-47 §4, mc-33`);
  process.exit(1);
}

const cuerpo = bloque[1];

// Si la lista deja de ser literales de cadena —un spread, una variable, una
// plantilla— el peso real deja de ser calculable desde aquí. Preferimos decirlo
// a medir la mitad y reportar verde.
const sinComentarios = cuerpo.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
const dinamico = sinComentarios.replace(/(["'])(?:\\.|(?!\1)[^\\])*\1/g, "").replace(/[\s,]/g, "");
if (dinamico.length > 0) {
  problemas.push(
    `PRECACHE contiene algo que no es un literal de cadena (\`${dinamico.slice(0, 40)}\`). ` +
      `El peso real deja de ser medible desde el archivo, y un presupuesto que no se puede medir no es un presupuesto.`,
  );
}

const entradas = [...sinComentarios.matchAll(/(["'])((?:\\.|(?!\1)[^\\])*)\1/g)].map((m) => m[2]);

if (entradas.length === 0) {
  console.error("✗ precache-budget\n");
  console.error(`  · PRECACHE está vacío. Un service worker que no precachea nada`);
  console.error(`    no tiene shell offline, que es la implicación 3 de mc-33.`);
  console.error(`    Y un presupuesto medido sobre cero entradas pasa siempre.`);
  console.error(`\n  Hace cumplir: D-030, D-032, mc-42, mc-47 §4, mc-33`);
  process.exit(1);
}

// --- Forma de las entradas ----------------------------------------------

const vistas = new Set();
for (const url of entradas) {
  if (vistas.has(url)) {
    problemas.push(`${url} — está dos veces en PRECACHE. Se descarga una sola vez, pero la lista ya está mintiendo sobre lo que contiene.`);
  }
  vistas.add(url);

  // Una URL relativa en un service worker se resuelve contra el *scope*, no
  // contra el archivo. Es un error que funciona en la raíz y se rompe el día
  // que el worker se sirve desde otro lado, y se rompe en silencio.
  if (!url.startsWith("/")) {
    problemas.push(`${url} — no empieza con "/". En un service worker se resuelve contra el scope, no contra el archivo; funciona hasta que el scope cambia.`);
  }
}

// Las páginas de locale se sirven network-first (así está escrito en `fetch`) y
// precachearlas serían siete documentos completos descargados para usar uno.
// `sw.js` explica que se decidió no hacerlo; esto impide que se deshaga sin
// darse cuenta.
for (const url of entradas) {
  const esNavegacion = url.endsWith("/") || /\.html?$/.test(url) || !extname(url);
  if (esNavegacion) {
    problemas.push(
      `${url} — parece una ruta de navegación. El HTML es network-first en este service worker, ` +
        `y precachearlo son siete páginas de locale descargadas para usar una (sw.js lo documenta).`,
    );
  }
}

// --- Peso real ------------------------------------------------------------

const pesoEnRed = (ruta) => {
  const crudo = readFileSync(ruta);
  return COMPRIMIBLES.has(extname(ruta).toLowerCase())
    ? gzipSync(crudo).length / 1024
    : crudo.length / 1024;
};

const medidas = [];
let audioKB = 0;
let audioCount = 0;
let shellKB = 0;

for (const url of entradas) {
  const ruta = `${raiz}${PUBLIC}${url.startsWith("/") ? url : `/${url}`}`;

  // Una entrada inexistente no es un detalle cosmético: `cache.add` de una URL
  // rota rechaza, y como `install` usa `allSettled` el service worker se
  // instala igual — con el precaché a medias y sin que nadie se entere. El
  // primer síntoma sería un usuario sin conexión al que le falta el ícono o la
  // fuente, meses después.
  if (!existsSync(ruta) || !statSync(ruta).isFile()) {
    problemas.push(
      `${url} — no existe en ${PUBLIC}. \`cache.add\` la rechaza, \`allSettled\` se lo traga, ` +
        `y el service worker se instala con el precaché incompleto sin fallar.`,
    );
    continue;
  }

  const kb = pesoEnRed(ruta);
  const esAudio = AUDIO.has(extname(url).toLowerCase());
  medidas.push({ url, kb, esAudio });

  if (esAudio) {
    audioKB += kb;
    audioCount++;
  } else {
    shellKB += kb;
    if (kb > PRESUPUESTO.cadaEntrada) {
      problemas.push(`${url} — ${kb.toFixed(1)} KB, presupuesto por entrada ${PRESUPUESTO.cadaEntrada} KB.`);
    }
  }
}

if (medidas.length === 0) {
  console.error("✗ precache-budget\n");
  console.error(`  · ninguna de las ${entradas.length} entradas de PRECACHE existe en ${PUBLIC}.`);
  console.error(`    No hay nada que pesar, así que no hay nada que aprobar.`);
  console.error(`\n  Hace cumplir: D-030, D-032, mc-42, mc-47 §4, mc-33`);
  process.exit(1);
}

if (shellKB > PRESUPUESTO.shellTotal) {
  problemas.push(
    `el shell del precaché pesa ${shellKB.toFixed(1)} KB, presupuesto ${PRESUPUESTO.shellTotal} KB. ` +
      `Son bytes que el usuario descarga antes de pedir nada, en 4G lento.`,
  );
}

// --- Audio: escrito hoy, con efecto desde F5 ------------------------------
// Hoy no hay un solo archivo de audio en el repo, así que esta rama no puede
// disparar. Se escribe ahora a propósito: el guardián que se escribe después
// del código que debía vigilar llega tarde por definición, y el día que entre
// el primer paquete de voz nadie va a acordarse de mc-42. La lógica está
// probada contra un caso sintético (un precaché con audio deliberadamente
// pasado de peso), no solo escrita.
if (audioKB > PRESUPUESTO.audioTotal) {
  problemas.push(
    `el audio del precaché pesa ${(audioKB / 1024).toFixed(2)} MB, límite duro ${PRESUPUESTO.audioTotal / 1024} MB (mc-42). ` +
      `El reparto de mc-42 §13 es: ≤1.5 MB de sprite de efectos + ≤2-3 MB de voz del idioma por defecto, ` +
      `y los otros cuatro idiomas bajo demanda, nunca en la primera instalación.`,
  );
}

if (problemas.length > 0) {
  console.error("✗ precache-budget\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-030, D-032, mc-42, mc-47 §4, mc-33`);
  console.error(`  Referencia: Android de gama baja actual sobre 4G lento.`);
  console.error(`  Todo lo que está en PRECACHE se descarga en el evento install,`);
  console.error(`  antes de que el usuario pida nada. No se paga cuando se usa: se`);
  console.error(`  paga siempre, y se paga primero.`);
  process.exit(1);
}

// El "más pesado" que se reporta es el del shell, no el del precaché entero: el
// audio se mide contra su propio límite de mc-42 y siempre sería el más grande,
// así que ponerlo aquí escondería la única cifra que este renglón sirve para
// vigilar.
const deShell = medidas.filter((m) => !m.esAudio);
const peor = deShell.length > 0 ? deShell.reduce((a, b) => (b.kb > a.kb ? b : a)) : null;
const pct = ((shellKB / PRESUPUESTO.shellTotal) * 100).toFixed(0);

console.log(
  `✓ precache-budget — ${medidas.length} entrada(s), shell ${shellKB.toFixed(1)} KB de ${PRESUPUESTO.shellTotal} KB (${pct}%)`,
);
if (peor) {
  console.log(`  · la más pesada del shell ${peor.url} — ${peor.kb.toFixed(1)} KB de ${PRESUPUESTO.cadaEntrada} KB (gz para texto, crudo para binario)`);
}
if (audioCount === 0) {
  console.log(`  · audio: 0 archivo(s). El límite de ${PRESUPUESTO.audioTotal / 1024} MB de mc-42 está escrito y en espera de F5`);
} else {
  console.log(`  · audio: ${audioCount} archivo(s), ${(audioKB / 1024).toFixed(2)} MB de ${PRESUPUESTO.audioTotal / 1024} MB (mc-42)`);
}
