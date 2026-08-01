#!/usr/bin/env node
// Auditor determinista 08 — ninguna telemetría en superficies de niño
//
// Hace cumplir: D-037, línea roja #2 ("el niño nunca es un usuario"), `mc-25`.
//
// Por qué existe. D-037 permite medir Core Web Vitals de campo con el beacon de
// Cloudflare Web Analytics, y lo permite **solo en superficies de adulto**. Esa
// clase de regla se cumple mientras alguien la recuerda: dentro de seis meses,
// alguien añade el beacon al layout base "para tener el dato completo" y la
// regla se rompe sin que nadie lo note, porque no rompe nada visible.
//
// Este auditor la vuelve mecánica. Bloquea el commit.
//
// Lo que NO puede comprobar, dicho antes de que alguien lo suponga: si el
// beacon se inyecta desde el dashboard de Cloudflare en vez de desde el código.
// Cloudflare ofrece "inyección automática" a nivel de zona, y eso no aparece en
// ningún archivo de este repo. Se apagó a propósito y está anotado en
// docs/infrastructure.md; verificarlo exige mirar el dashboard o el HTML
// servido — lo hace `audits/live.mjs`, no este.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const raiz = new URL("..", import.meta.url).pathname;

// Lo que cuenta como telemetría de navegador. No es una lista de proveedores
// prohibidos: es cualquier cosa que reporte comportamiento desde el cliente.
const TELEMETRIA = [
  [/cloudflareinsights\.com/i, "beacon de Cloudflare Web Analytics"],
  [/beacon\.min\.js/i, "beacon de Cloudflare Web Analytics"],
  [/google-analytics\.com|googletagmanager\.com|gtag\(/i, "Google Analytics"],
  [/plausible\.io|umami\.|posthog|mixpanel|segment\.com|amplitude/i, "analítica de terceros"],
  [/new PerformanceObserver|web-vitals/i, "medición de Web Vitals en el cliente"],
  [/navigator\.sendBeacon/i, "sendBeacon"],
];

// Superficies donde un niño puede estar. Hoy no existen: el sitio es informativo
// y la ruta de locale es pública. Se listan de antemano a propósito — un
// guardián que se escribe después del código que debía vigilar llega tarde.
const SUPERFICIES_DE_NINO = [
  /\/(kinder|primaria|nino|nina|child|kid)/i,
  /\/(reto|retos|challenge|practica|practice|juego|play)/i,
  /(Kinder|Primaria|Child|Reto|Challenge|Practica)[A-Z]?[a-z]*\.(astro|tsx|jsx|ts|js|svelte|vue)$/,
];

const esDeNino = (ruta) => SUPERFICIES_DE_NINO.some((re) => re.test(ruta));

const archivos = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: raiz,
  encoding: "utf8",
})
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((f) => /\.(astro|tsx|jsx|ts|js|mjs|html|svelte|vue)$/.test(f))
  .filter((f) => !/^(node_modules|dist|\.astro|audits\/telemetria-infantil\.mjs)/.test(f));

if (archivos.length === 0) {
  console.error("✗ telemetria-infantil — 0 archivos escaneados.");
  console.error("  Un escáner que no ve nada pasa siempre. Revisa el patrón de archivos.");
  process.exit(1);
}

const problemas = [];
let deNino = 0;
let conTelemetria = 0;

for (const archivo of archivos) {
  let texto;
  try {
    texto = readFileSync(`${raiz}${archivo}`, "utf8");
  } catch {
    continue;
  }

  const encontrado = TELEMETRIA.filter(([re]) => re.test(texto));
  if (encontrado.length === 0) continue;
  conTelemetria++;

  // Toda telemetría, esté donde esté, tiene que declarar por qué no alcanza a un
  // niño. Sin esa marca no se distingue "revisado y acotado" de "se coló".
  const declarada = /D-037/.test(texto);

  if (esDeNino(archivo)) {
    deNino++;
    problemas.push(
      `${archivo}: ${encontrado.map(([, q]) => q).join(", ")} en una superficie de niño. ` +
        `D-037 y la línea roja #2 lo prohíben sin excepción.`,
    );
  } else if (!declarada) {
    problemas.push(
      `${archivo}: ${encontrado.map(([, q]) => q).join(", ")} sin citar D-037. ` +
        `Toda telemetría declara por qué no alcanza a un niño, o no se distingue de una que se coló.`,
    );
  }
}

if (problemas.length > 0) {
  console.error("✗ telemetria-infantil\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: D-037, línea roja #2, mc-25`);
  process.exit(1);
}

console.log(`✓ telemetria-infantil — ${archivos.length} archivo(s), ninguna telemetría en superficie de niño`);
console.log(`  · ${conTelemetria} archivo(s) con telemetría, todos declarando D-037`);
console.log(`  · pendiente de live.mjs: que la inyección automática de la zona siga apagada`);
