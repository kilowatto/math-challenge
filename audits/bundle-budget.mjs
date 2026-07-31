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
  html: 12,       // por página
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

for (const { p, kb } of pages) {
  if (kb > BUDGET.html) problems.push(`${p} — ${kb.toFixed(1)} KB gz, presupuesto ${BUDGET.html} KB`);
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
