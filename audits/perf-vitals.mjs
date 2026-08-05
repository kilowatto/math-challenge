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
//
// ─── La medición juzga lo que el repo controla (D-182) ─────────────────────
//
// Medido el 2026-08-04: la inyección de ZONA (Zaraz/GA4/DoubleClick — la
// excepción declarada de D-076, que el dueño no puede apagar) cuesta ~1.0s de
// LCP en el artículo largo: 2.83s con ella, 1.83s sin ella. Ninguna línea de
// este repo puede cambiar ese segundo. D-182 fija que el presupuesto juzga el
// código propio: cada página se mide DOS veces —completa (se reporta como
// información) y con los patrones de la inyección bloqueados (la que se
// JUZGA contra el umbral)—. Si algún día Zaraz se apaga, las dos mediciones
// se juntan y el comentario sobra, no el auditor.

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

// Los patrones de la inyección de zona que D-182 excluye del presupuesto
// (ver el comentario de arriba). Se bloquean por URL en la corrida juzgada.
const INYECCION_ZONA = [
  "*cdn-cgi/zaraz*",
  "*googletagmanager.com*",
  "*google-analytics.com*",
  "*doubleclick.net*",
];

const problems = [];
const ok = [];
const info = [];

function medir(url, nombre, { bloquearInyeccion }) {
  const dir = mkdtempSync(join(tmpdir(), "mc-lh-"));
  const salida = join(dir, "reporte.json");
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
        ...(bloquearInyeccion
          ? INYECCION_ZONA.flatMap((p) => [`--blocked-url-patterns=${p}`])
          : []),
      ],
      { stdio: ["ignore", "ignore", "inherit"], timeout: 120_000 },
    );
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`Lighthouse no corrió — ${err.message}`);
  }
  const reporte = JSON.parse(readFileSync(salida, "utf8"));
  rmSync(dir, { recursive: true, force: true });
  const lcp = reporte.audits["largest-contentful-paint"]?.numericValue;
  const cls = reporte.audits["cumulative-layout-shift"]?.numericValue;
  const tbt = reporte.audits["total-blocking-time"]?.numericValue;
  if (lcp == null || cls == null || tbt == null) {
    throw new Error("Lighthouse no devolvió LCP/CLS/TBT — reporte incompleto");
  }
  return { lcp, cls, tbt };
}

for (const { ruta, nombre } of PAGINAS) {
  const url = `${ORIGIN}${ruta}`;
  console.log(`Midiendo ${nombre} — ${url} …`);
  let cruda, propia;
  try {
    cruda = medir(url, nombre, { bloquearInyeccion: false });
    propia = medir(url, nombre, { bloquearInyeccion: true });
  } catch (err) {
    problems.push(`${nombre}: ${err.message}`);
    continue;
  }

  info.push(
    `${nombre}: LCP completo ${(cruda.lcp / 1000).toFixed(2)}s ` +
      `(inyección de zona incluida; la juzgada es la de código propio, D-182)`,
  );

  const { lcp, cls, tbt } = propia;
  if (lcp <= UMBRAL.lcp) ok.push(`${nombre}: LCP ${(lcp / 1000).toFixed(2)}s (≤2.5s)`);
  else problems.push(`${nombre}: LCP ${(lcp / 1000).toFixed(2)}s, por encima de 2.5s`);

  if (cls <= UMBRAL.cls) ok.push(`${nombre}: CLS ${cls.toFixed(3)} (≤0.1)`);
  else problems.push(`${nombre}: CLS ${cls.toFixed(3)}, por encima de 0.1`);

  if (tbt <= UMBRAL.tbt) ok.push(`${nombre}: TBT ${tbt.toFixed(0)}ms (proxy de INP, ≤200ms)`);
  else problems.push(`${nombre}: TBT ${tbt.toFixed(0)}ms, por encima del proxy de 200ms`);
}

console.log(`\nPresupuesto de Core Web Vitals (laboratorio) — ${ORIGIN}\n`);
for (const p of problems) console.error(`  ✗ ${p}`);
if (info.length > 0) {
  console.log("  Medición completa (con la inyección de zona, solo informativa):");
  for (const i of info) console.log(`    ◦ ${i}`);
  console.log("");
}
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
