#!/usr/bin/env node
// Auditor determinista — las seis cabeceras de seguridad llegan a las rutas SSR
//
// Hace cumplir: issue #337 — `public/_headers` solo alcanza los assets
// estáticos; las rutas que genera el Worker (`/app/**`, `/api/**`, sign-in)
// reciben las mismas seis cabeceras desde `src/middleware.ts`.
//
// Por qué existe: la medición del issue era que la parte con la sesión y los
// datos de los menores era exactamente la que no tenía CSP ni
// Permissions-Policy. El arreglo duplica los valores en dos sitios —`_headers`
// para assets, `src/lib/cabeceras-seguridad.ts` para el Worker— porque
// Cloudflare no ofrece uno solo. Una duplicidad sin auditor se separa en
// silencio: alguien endurece la CSP del sitio público y el área privada se
// queda con la vieja, y nadie se entera hasta que importa.
//
// La lista de las seis cabeceras está escrita A MANO aquí abajo (D-070): si el
// auditor leyera la lista del propio módulo que juzga, no podría fallar nunca.

import { readFileSync, existsSync } from "node:fs";
import { CABECERAS_SEGURIDAD } from "../apps/web/src/lib/cabeceras-seguridad.ts";

const problems = [];

// Segunda fuente, escrita a mano. Si cambia el conjunto de cabeceras, se
// cambia AQUÍ y en los dos lugares desplegados — y el auditor bloquea hasta
// que los tres coincidan.
const ESPERADAS = [
  "content-security-policy-report-only",
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

// 1. El módulo del Worker tiene exactamente las seis, ni una más ni una menos.
const delModulo = Object.keys(CABECERAS_SEGURIDAD).map((k) => k.toLowerCase()).sort();
const faltanEnModulo = ESPERADAS.filter((h) => !delModulo.includes(h));
const sobranEnModulo = delModulo.filter((h) => !ESPERADAS.includes(h));
if (faltanEnModulo.length > 0) {
  problems.push(`cabeceras-seguridad.ts no define: ${faltanEnModulo.join(", ")}`);
}
if (sobranEnModulo.length > 0) {
  problems.push(
    `cabeceras-seguridad.ts define cabeceras fuera de la lista acordada: ${sobranEnModulo.join(", ")} ` +
      `(si fue a propósito, la lista del auditor se actualiza a mano en el mismo commit)`,
  );
}

// 2. `_headers` declara las mismas seis en su bloque /* con los mismos valores.
const texto = readFileSync("apps/web/public/_headers", "utf8");
const lineas = texto.split("\n");
const inicio = lineas.findIndex((l) => l.trim() === "/*");
if (inicio === -1) {
  problems.push("apps/web/public/_headers no tiene bloque /* — no hay dónde comparar");
} else {
  const enHeaders = {};
  for (const linea of lineas.slice(inicio + 1)) {
    // El bloque termina en la primera línea de sección nueva (`/_astro/*`, …).
    if (/^[^#\s]/.test(linea)) break;
    const m = linea.match(/^\s+([A-Za-z-]+):\s+(.+?)\s*$/);
    if (m) enHeaders[m[1].toLowerCase()] = m[2];
  }
  const faltanEnFile = ESPERADAS.filter((h) => !(h in enHeaders));
  if (faltanEnFile.length > 0) {
    problems.push(`_headers (bloque /*) no declara: ${faltanEnFile.join(", ")}`);
  }
  for (const h of ESPERADAS) {
    const delWorker = Object.entries(CABECERAS_SEGURIDAD).find(
      ([k]) => k.toLowerCase() === h,
    )?.[1];
    if (delWorker !== undefined && enHeaders[h] !== undefined && enHeaders[h] !== delWorker) {
      problems.push(
        `"${h}" vale distinto en _headers que en cabeceras-seguridad.ts:\n` +
          `    _headers:  ${enHeaders[h]}\n` +
          `    worker:    ${delWorker}`,
      );
    }
  }
}

// 3. El middleware existe y es el que las pone — sin él, el módulo es código
// muerto (el patrón «correcto pero sin llamador» de audits/funcion-sin-llamar).
const RUTA_MIDDLEWARE = "apps/web/src/middleware.ts";
if (!existsSync(RUTA_MIDDLEWARE)) {
  problems.push(
    "apps/web/src/middleware.ts no existe — las rutas SSR vuelven a quedar sin cabeceras (#337)",
  );
} else {
  const mw = readFileSync(RUTA_MIDDLEWARE, "utf8");
  if (!mw.includes("cabeceras-seguridad")) {
    problems.push("middleware.ts no importa cabeceras-seguridad.ts");
  }
  if (!/await\s+next\(\)/.test(mw)) {
    problems.push("middleware.ts no llama `await next()` — rompería toda ruta SSR");
  }
  // Se ignoran los comentarios antes de juzgar: el propio middleware explica
  // por qué NO toca Cache-Control, y un texto que dice «no lo toca» no es
  // tocarlo (la trampa de contar llamadas dentro de comentarios, ya medida
  // en audits/funcion-sin-llamar.mjs).
  const mwSinComentarios = mw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
  if (/cache-control/i.test(mwSinComentarios)) {
    problems.push(
      "middleware.ts toca Cache-Control — cada ruta pone su propio no-store a propósito",
    );
  }
}

if (problems.length > 0) {
  console.error("✗ cabeceras-ssr — las rutas SSR y los assets no llevan las mismas cabeceras:");
  for (const p of problems) console.error(`  · ${p}`);
  process.exit(1);
}
console.log(
  `✓ cabeceras-ssr — las ${ESPERADAS.length} cabeceras de seguridad son idénticas en _headers y en el middleware del Worker`,
);
