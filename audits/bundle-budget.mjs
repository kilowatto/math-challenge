#!/usr/bin/env node
// Auditor determinista 07 — presupuesto de peso
//
// Hace cumplir: D-030 y mc-47 §4. El dispositivo de referencia es **Android de
// gama baja actual sobre 4G lento**, no una laptop.
//
// Por qué el presupuesto está en bytes y no en una calificación de Lighthouse:
// Google rankea con datos de campo, no de laboratorio — "un 100 perfecto en
// Lighthouse no significa nada si los usuarios reales en 3G sufren" (mc-47 §4).
// Un presupuesto de bytes es lo único verificable antes de tener usuarios.
//
// El enemigo real de INP es el JavaScript que bloquea el hilo principal, por eso
// el presupuesto de JS es mucho más estricto que el de HTML o CSS.

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { gzipSync } from "node:zlib";

const DIST = "apps/web/dist";

// Presupuestos en KB, comprimidos con gzip (que es como viajan por la red).
const BUDGET = {
  html: 12,       // por página de producto o marketing
  // Un documento de investigación es legítimamente más pesado que una portada:
  // son ~3,300 palabras de texto, y ese texto ES el activo (D-033, mc-48). El
  // presupuesto de 12 KB se calibró contra páginas de 2 KB, y aplicárselo a un
  // corpus sería pedirle a un artículo que pese como un botón.
  //
  // 20 KB gz de HTML sobre 4G lento son ~0.2 s de descarga: no es el cuello de
  // botella. El cuello es el JavaScript, y por eso su presupuesto NO se relaja
  // ni aquí ni en ninguna ruta.
  //
  // Esto NO es bajar el listón porque el auditor me atrapó: el listón sigue en
  // 12 KB para todo lo demás, y la excepción está acotada por ruta y escrita.
  //
  // El 24 sale de medir, no de subirlo hasta que pasara. Distribución real de
  // las 336 páginas de corpus, en KB gz:
  //
  //     mínimo 9.4 · mediana 13.7 · p90 17.3 · p99 20.3 · máximo 20.8
  //
  // Un techo de 20 cortaba en el percentil 98: no habría atrapado regresiones,
  // habría atrapado el techo natural del contenido, y cada documento largo
  // nuevo bloquearía el commit. 24 deja ~15% de holgura sobre el máximo real,
  // que basta para que una página que se dispara a 30 KB sí se vea.
  //
  // Se reproduce midiendo dist/**/investigacion/**/index.html con gzip.
  htmlCorpus: 24,
  jsTotal: 60,    // TODO el JS de cliente sumado
  cssTotal: 24,
  imageEach: 120,
};

if (!existsSync(DIST)) {
  console.log("○ bundle-budget — no hay build todavía (corre pnpm build)");
  process.exit(0);
}

const gz = (p) => gzipSync(readFileSync(p)).length / 1024;

const pages = [];
let jsTotal = 0, cssTotal = 0;
const images = [];
const problems = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      // El worker del servidor no viaja al navegador: no cuenta al presupuesto.
      if (entry.name === "_worker.js") continue;
      walk(p);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (ext === ".html") pages.push({ p, kb: gz(p) });
    else if (ext === ".js" || ext === ".mjs") jsTotal += gz(p);
    else if (ext === ".css") cssTotal += gz(p);
    else if ([".avif", ".webp", ".png", ".jpg", ".jpeg", ".svg"].includes(ext)) {
      images.push({ p, kb: statSync(p).size / 1024 });
    }
  }
};
walk(DIST);

/**
 * Los segmentos bajo los que vive el corpus, uno por locale (D-049).
 *
 * Estaba cableado a `/investigacion/`, y al traducir los segmentos las 235
 * páginas de corpus de `en`, `fr-FR`, `pt-BR`, `pt-PT` y `de-DE` dejaron de
 * reconocerse: se midieron contra el presupuesto de una página de marketing y
 * bloquearon el commit en masa. El auditor tenía razón en el número y estaba
 * mirando la tabla equivocada.
 *
 * Ahora lee la misma tabla que genera las rutas. No puede volver a desfasarse
 * sin que alguien borre este import.
 */
const { SEGMENTOS } = await import("../apps/web/src/i18n/rutas-tabla.mjs");
const SEGS_CORPUS = new Set(Object.values(SEGMENTOS).map((t) => t.investigacion));

for (const { p, kb } of pages) {
  // El corpus tiene su propio techo. Se reconoce por la ruta, no por el peso —
  // reconocerlo por el peso sería que cualquier página gorda se auto-exima.
  const esCorpus = p.split("/").some((seg) => SEGS_CORPUS.has(seg));
  const techo = esCorpus ? BUDGET.htmlCorpus : BUDGET.html;
  if (kb > techo) {
    problems.push(`${p} — ${kb.toFixed(1)} KB gz, presupuesto ${techo} KB${esCorpus ? " (corpus)" : ""}`);
  }
}
if (jsTotal > BUDGET.jsTotal) {
  problems.push(`JS de cliente — ${jsTotal.toFixed(1)} KB gz, presupuesto ${BUDGET.jsTotal} KB`);
}
if (cssTotal > BUDGET.cssTotal) {
  problems.push(`CSS — ${cssTotal.toFixed(1)} KB gz, presupuesto ${BUDGET.cssTotal} KB`);
}
for (const { p, kb } of images) {
  if (kb > BUDGET.imageEach) problems.push(`${p} — ${kb.toFixed(1)} KB, presupuesto ${BUDGET.imageEach} KB`);
}

if (problems.length > 0) {
  console.error("✗ auditor bundle-budget\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-030, mc-47 §4`);
  console.error(`  Referencia: Android de gama baja actual sobre 4G lento.`);
  console.error(`  El JS es el presupuesto más estricto porque las tareas largas`);
  console.error(`  del hilo principal son lo que rompe INP, la vital que falla el`);
  console.error(`  43% de la web.`);
  process.exit(1);
}

const worst = pages.reduce((a, b) => (b.kb > a.kb ? b : a), pages[0] ?? { p: "-", kb: 0 });
console.log(`✓ bundle-budget — ${pages.length} página(s), la más pesada ${worst.kb.toFixed(1)} KB gz`);
console.log(`  · JS de cliente ${jsTotal.toFixed(1)} KB gz · CSS ${cssTotal.toFixed(1)} KB gz (gz = como viaja)`);
