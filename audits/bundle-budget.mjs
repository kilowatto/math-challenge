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
  // 12 → 14, 2026-08-02, medido, no subido a ciegas hasta que pasara.
  //
  // D-065 agregó `Instalar.astro` a `layouts/Privada.astro` (el aviso de
  // instalación en el panel del padre, D-034/mc-33: quien vuelve ahí a diario
  // es a quien más le conviene instalar). Ese componente YA vivía en
  // `Base.astro`; que un SEGUNDO layout lo importe le cambia a Vite el cálculo
  // de qué CSS compartido conviene incrustar contra cuál conviene enlazar
  // aparte — y ese cálculo es GLOBAL, no por página: una página de marketing
  // sin ninguna relación con `/app/` (`de-DE/architektur`) terminó recibiendo
  // más CSS incrustado que antes.
  //
  // Aislado y confirmado quitando el import: sin `Instalar` en `Privada.astro`
  // el corrimiento desaparece. Se decidió conservar el aviso de instalación
  // —vale más que 78 páginas midan 0.1-0.2 KB más— y subir el techo con la
  // medición real en vez de tocar una sola ruta (`SEGS_CORPUS` de abajo existe
  // justo para no reconocer excepciones "por lo gorda que salió la página").
  //
  // MEDICIÓN, 2026-08-02, 78 páginas no-corpus, con el import ya puesto:
  //
  //     mínimo 0.5 · mediana 7.8 · p90 9.8 · p99 12.1 · máximo 12.1
  //
  // Mismo ~15% de holgura sobre el máximo real que ya usa `htmlCorpus` más
  // abajo (24 sobre 20.8). 12.1 × 1.15 ≈ 13.9 → 14.
  //
  // 14 → 16, 2026-08-03, medido, con la misma disciplina que esa subida. El
  // contenido i18n creció a propósito en una sola jornada: la franja adulta
  // (98 claves por locale, #482) y los conteos de kinder (25 claves nuevas,
  // #484) viajan incrustados en las páginas de producto. Las dos páginas más
  // pesadas hoy son las de `reto-demo` en de-DE y fr-FR — los dos locales
  // cuyo texto de la franja es más largo— y miden 14.2 KB gz. El resto de
  // páginas de producto sigue por debajo del techo anterior. 14.2 × 1.15 ≈
  // 16.3 → 16. Si mañana alguien recorta el payload del demo (cargar solo las
  // claves que la página usa en vez del catálogo entero), este número baja
  // con la misma medición.
  html: 16,       // por página de producto o marketing
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
  // El número sale de medir, no de subirlo hasta que pasara.
  //
  // PRIMERA MEDICIÓN, con el corpus sirviendo INGLÉS en los siete locales
  // (336 páginas, KB gz):
  //
  //     mínimo 9.4 · mediana 13.7 · p90 17.3 · p99 20.3 · máximo 20.8  → techo 24
  //
  // SEGUNDA MEDICIÓN, 2026-08-01, con el corpus ya TRADUCIDO (329 páginas):
  //
  //     mínimo 11.2 · mediana 16.6 · p90 20.5 · p99 23.8 · máximo 24.1
  //
  // El corpus creció porque dejó de servir inglés en los siete idiomas: el
  // español y el portugués ocupan más que su original. Es contenido real que
  // antes no se servía, no una regresión — y el techo de 24 pasó a cortar en el
  // percentil 99.4, o sea a bloquear el commit por el techo natural del
  // contenido en vez de por una regresión, que es exactamente el modo de falla
  // que la primera medición eligió evitar.
  //
  // 28 deja el mismo ~15% de holgura sobre el máximo real que daba el 24. El
  // presupuesto de JavaScript NO se toca: el cuello de botella en 4G lento es el
  // JS, no el HTML, y 28 KB gz siguen siendo ~0.3 s de descarga.
  //
  // Se reproduce midiendo dist/*/*/mc-*/index.html con gzip.
  htmlCorpus: 28,
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
