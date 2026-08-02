#!/usr/bin/env node
// Auditor determinista — el sitemap anuncia TODAS las páginas públicas y solo esas
//
// Hace cumplir: `mc-48` §3, D-033, D-049, issue #324.
//
// Por qué existe. `/sitemap.xml` daba 404 mientras `astro.config.mjs` tenía un
// comentario que daba por hecho que existía («Estas URLs se publicaron y están
// en el sitemap»). Nadie mentía: el archivo simplemente nunca se escribió, y
// nada en el repo podía notarlo — un sitemap ausente no rompe ninguna página.
//
// Ahora existe y se genera de las mismas tablas que generan las páginas, así
// que el fallo interesante ya no es «falta», es **desincronización**:
//
//   · una página nueva que nadie añade al generador → invisible para Google
//   · una URL en el sitemap que ya no existe → 404 prometido en un archivo que
//     el rastreador trata como autoridad, y eso es una señal de calidad, no un
//     detalle
//
// Las dos direcciones se comprueban aquí, y contra `dist/` — no contra el
// código que dice qué debería haber. Comparar el generador consigo mismo sería
// la misma tautología que dejó pasar #319 durante 52 páginas.
//
// LO QUE NO PUEDE COMPROBAR: que la página anunciada sea *buena*, ni que
// Google la indexe. Solo que existe, que se construyó, y que no hay ninguna
// construida que el sitemap calle.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { informar } from "./lib/repo.mjs";

const DIST = "apps/web/dist";
const SITEMAP = join(DIST, "sitemap.xml");
const ORIGEN = "https://math.kilowatto.com";

const problemas = [];
const notas = [];

if (!existsSync(DIST)) {
  // Igual que el resto de auditores que leen `dist/`: sin build no hay nada que
  // decir, y bloquear aquí obligaría a construir antes de cada commit.
  informar({
    nombre: "sitemap-completo",
    problemas: [],
    notas: ["sin `apps/web/dist` — corre `npx astro build` primero"],
    cita: "mc-48 §3, D-033, #324",
    revisados: 0,
    resumen: "no se ejecutó",
    porQueBloquea: "un sitemap desincronizado promete URLs que no existen o calla páginas reales.",
    noComprueba: [],
  });
  process.exit(0);
}

// --- Lo que el sitio construyó de verdad ------------------------------------
//
// Toda página es `<algo>/index.html` por `build.format: "directory"`. Se
// excluyen las tres familias que NO deben anunciarse, y cada exclusión lleva su
// razón: si mañana alguien añade una cuarta, tiene que escribirla aquí.
const FUERA = [
  [/^\/404\/?$/, "la página de error no se indexa"],
  [/^\/app\//, "detrás de sesión — no se esconde con Disallow, simplemente no se anuncia"],
  [/^\/api\//, "no son páginas"],
];

const construidas = new Set();
const noindex = new Set();

const recorrer = (dir) => {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) {
      recorrer(ruta);
      continue;
    }
    if (entrada !== "index.html") continue;
    const url = "/" + ruta.slice(DIST.length + 1, -"index.html".length);
    if (FUERA.some(([patron]) => patron.test(url))) continue;
    // La raíz `/` lleva `robots: noindex` a propósito: solo redirige al locale
    // del navegador. Se detecta leyendo el HTML, no listándola aquí, para que
    // cualquier página que gane un `noindex` mañana salga sola del cálculo.
    const html = readFileSync(ruta, "utf8");
    if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
      noindex.add(url);
      continue;
    }
    construidas.add(url);
  }
};
recorrer(DIST);

// --- Lo que el sitemap anuncia ---------------------------------------------
if (!existsSync(SITEMAP)) {
  problemas.push(
    "`dist/sitemap.xml` no existe. `robots.txt` lo anuncia con una línea `Sitemap:`, " +
      "así que su ausencia no es un hueco silencioso: es una URL prometida que da 404 (#324).",
  );
} else {
  const xml = readFileSync(SITEMAP, "utf8");
  const anunciadas = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGEN, "")),
  );

  for (const url of anunciadas) {
    if (noindex.has(url)) {
      problemas.push(`el sitemap anuncia ${url}, que lleva \`noindex\` en su propio HTML. Las dos señales se contradicen.`);
      continue;
    }
    if (!construidas.has(url)) {
      problemas.push(`el sitemap anuncia ${url} y \`dist\` no la construyó — es un 404 prometido.`);
    }
  }
  for (const url of construidas) {
    if (!anunciadas.has(url)) {
      problemas.push(`\`dist\` construyó ${url} y el sitemap no la anuncia.`);
    }
  }

  notas.push(`${anunciadas.size} URL(s) anunciadas · ${construidas.size} página(s) públicas construidas`);
  notas.push(`${noindex.size} página(s) con \`noindex\` propio, fuera del sitemap por decisión suya`);
  for (const [, razon] of FUERA) notas.push(`excluido: ${razon}`);
}

informar({
  nombre: "sitemap-completo",
  problemas,
  notas,
  cita: "mc-48 §3, D-033, D-049, #324",
  revisados: construidas.size,
  resumen: `${construidas.size} página(s) públicas en dist`,
  porQueBloquea:
    "un sitemap que calla una página la deja fuera del descubrimiento; uno que anuncia una " +
    "página muerta le entrega al rastreador un 404 con firma de autoridad. Para 400+ URLs en " +
    "7 locales cuya estrategia entera es el corpus (mc-48), ninguna de las dos es cosmética.",
  noComprueba: [
    "que la página anunciada sea buena, ni que Google la indexe — eso no lo decide un archivo.",
    "el `robots.txt` que se sirve en producción: hoy lo pisa un ajuste de zona de Cloudflare " +
      "(#330), que vive en el panel y no en este repo.",
  ],
});
