#!/usr/bin/env node
// Presupuesto de Core Web Vitals — criterio de S0 #61.
//
// Corre a mano después de desplegar:  node audits/perf-vitals.mjs
//
// Va aparte de audits/run.mjs por la misma razón que audits/live.mjs: mide lo
// desplegado, no el cambio que estás por hacer, necesita red y un Chrome
// local, y tarda decenas de segundos por página — bloquear cada commit con
// esto es exactamente el ruido que D-032 quiere evitar.
//
// LO QUE ESTO MIDE, Y LO QUE NO.
//
// Lighthouse en modo `mobile` (su preset por omisión) simula un Moto G4 con
// CPU a 4× de desaceleración y red "Slow 4G" — el perfil de gama baja que
// pide el criterio. LCP y CLS salen directo de sus auditorías; son de
// LABORATORIO, sobre una carga simulada, no de usuarios reales.
//
// INP no tiene auditoría de laboratorio: es una métrica de INTERACCIÓN, y
// Lighthouse no interactúa con la página — la carga y mide. Lo más cercano en
// laboratorio es Total Blocking Time (TBT), que corre en el mismo eje que INP
// (bloqueo del hilo principal) pero no es la misma métrica ni tiene el mismo
// umbral. Se reporta con su propio umbral, marcado como proxy, nunca como INP.
//
// La métrica de campo real —el auditor `cwv-budget` de `audits/run.mjs`,
// todavía PENDING— existe para eso: nace del beacon RUM (D-037) sobre tráfico
// real, y hasta que ese beacon lleve semanas de datos, este es el mejor
// sustituto disponible. Los dos se complementan, no se reemplazan.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGIN = process.argv[2] ?? "https://math.kilowatto.com";

// Portada (la página más liviana) y un documento de investigación largo (la
// más pesada del corpus): el rango que importa, no un punto medio que no
// representa a ninguna de las dos.
const PAGINAS = [
  { ruta: "/en/", nombre: "portada" },
  { ruta: "/en/research/mc-01-japan-lesson-study/", nombre: "artículo largo (mc-01, 4002 palabras)" },
];

const UMBRAL = { lcp: 2500, cls: 0.1, tbt: 200 };

const problems = [];
const ok = [];

for (const { ruta, nombre } of PAGINAS) {
  const url = `${ORIGIN}${ruta}`;
  const dir = mkdtempSync(join(tmpdir(), "mc-lh-"));
  const salida = join(dir, "reporte.json");

  console.log(`Midiendo ${nombre} — ${url} …`);
  try {
    execFileSync(
      "npx",
      [
        "lighthouse",
        url,
        "--output=json",
        `--output-path=${salida}`,
        "--chrome-flags=--headless",
        "--only-categories=performance",
        "--quiet",
      ],
      { stdio: ["ignore", "ignore", "inherit"], timeout: 120_000 },
    );
  } catch (err) {
    problems.push(`${nombre}: Lighthouse no corrió — ${err.message}`);
    rmSync(dir, { recursive: true, force: true });
    continue;
  }

  const reporte = JSON.parse(readFileSync(salida, "utf8"));
  rmSync(dir, { recursive: true, force: true });

  const lcp = reporte.audits["largest-contentful-paint"]?.numericValue;
  const cls = reporte.audits["cumulative-layout-shift"]?.numericValue;
  const tbt = reporte.audits["total-blocking-time"]?.numericValue;

  if (lcp == null || cls == null || tbt == null) {
    problems.push(`${nombre}: Lighthouse no devolvió LCP/CLS/TBT — reporte incompleto`);
    continue;
  }

  if (lcp <= UMBRAL.lcp) ok.push(`${nombre}: LCP ${(lcp / 1000).toFixed(2)}s (≤2.5s)`);
  else problems.push(`${nombre}: LCP ${(lcp / 1000).toFixed(2)}s, por encima de 2.5s`);

  if (cls <= UMBRAL.cls) ok.push(`${nombre}: CLS ${cls.toFixed(3)} (≤0.1)`);
  else problems.push(`${nombre}: CLS ${cls.toFixed(3)}, por encima de 0.1`);

  if (tbt <= UMBRAL.tbt) ok.push(`${nombre}: TBT ${tbt.toFixed(0)}ms (proxy de INP, ≤200ms)`);
  else problems.push(`${nombre}: TBT ${tbt.toFixed(0)}ms, por encima del proxy de 200ms`);
}

console.log(`\nPresupuesto de Core Web Vitals (laboratorio) — ${ORIGIN}\n`);
for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length === 0) {
  console.log(`  ✓ ${ok.length} comprobaciones`);
  for (const o of ok) console.log(`    · ${o}`);
  console.log(
    "\n  NO comprobado aquí: INP real (necesita interacción de usuario, no laboratorio) " +
      "ni datos de campo sobre dispositivos de gama baja reales. Eso es `cwv-budget` " +
      "(D-037, PENDING en audits/run.mjs) cuando el beacon lleve semanas recolectando.",
  );
} else {
  console.error(`\n  ${problems.length} problema(s), ${ok.length} bien`);
  process.exit(1);
}
