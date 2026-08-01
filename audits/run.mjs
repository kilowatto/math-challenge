#!/usr/bin/env node
// La flota de auditores — corredor
//
// D-032: 35 auditores en dos clases. Los deterministas bloquean por defecto;
// los adversariales con LLM bloquean solo cuando citan una línea roja o una
// decisión explícita.
//
// Este archivo es también el inventario honesto: lo que ya corre, y lo que
// todavía no puede correr porque la fase que lo habilita no existe. Un auditor
// listado como "pendiente" no está olvidado — está esperando su fase.

import { spawnSync } from "node:child_process";

// --- Deterministas: implementados y bloqueando ---------------------------
const ACTIVE = [
  ["cf-prefix",         "prefijo math-challenge- en objetos de Cloudflare",  "CLAUDE.md § Cloudflare"],
  ["child-free-text",   "ningún campo de texto libre en tablas de niño",     "línea roja #3, D-013"],
  ["locales-complete",  "los 7 locales, no 5 idiomas",                       "D-022, mc-34"],
  ["no-attempts-in-d1", "intentos fuera de D1",                              "mc-32 riesgo #1"],
  ["secrets",           "ningún secreto commiteado",                         "CLAUDE.md § Cloudflare"],
  ["brand-image",       "paleta Ignia, AVIF/WebP, llaves de imagen",         "guia-de-estilo.md, mc-38, mc-47"],
  ["bundle-budget",     "peso gz por página, JS y CSS de cliente",           "D-030, mc-47 §4"],
  ["telemetria-infantil","ninguna telemetría en superficies de niño",         "D-037, línea roja #2"],
];

// --- Deterministas: esperando la fase que los habilita -------------------
const PENDING = [
  ["cwv-budget",        "INP ≤150ms, LCP ≤2.5s, CLS ≤0.1 — datos de CAMPO", "D-037 · cuando el beacon lleve semanas recolectando"],
  ["axe-a11y",          "axe-core sin violaciones",                  "F2 · cuando haya interfaz"],
  ["contrast",          "contraste 4.5:1 texto, 3:1 gráficos",       "F2 · cuando haya interfaz"],
  ["touch-targets",     "24px WCAG / 44px HIG / 88px kinder",        "F2 · cuando haya interfaz"],
  ["jsonld-valid",      "JSON-LD válido y coincidente con la página","S0 · cuando haya sitio"],
  ["hreflang-recip",    "hreflang recíproco entre los 7 + x-default","S0 · cuando haya sitio"],
  ["precache-budget",   "≤5 MB de audio en la primera instalación",  "F5 · cuando haya audio"],
  ["migration-safety",  "migraciones sin borrado destructivo",       "F2 · cuando haya más de una"],
];

// --- Adversariales con LLM: construidos en F1 ----------------------------
// Viven en audits/adversarial.mjs y NO corren aquí a propósito. Estos
// deterministas cuestan milisegundos y bloquean cada commit; aquéllos cuestan
// dinero y segundos. Bloquear cada commit con 23 llamadas de LLM es exactamente
// cómo una flota se convierte en el ruido que D-032 teme.
const ADVERSARIAL_COUNT = 23;

console.log("Flota de auditores — D-032\n");

let failed = 0;
for (const [name, what, enforces] of ACTIVE) {
  const r = spawnSync("node", [`audits/${name}.mjs`], { stdio: "inherit" });
  if (r.status !== 0) failed++;
}

console.log(`\n── pendientes de fase ──`);
for (const [name, what, when] of PENDING) {
  console.log(`  ○ ${name.padEnd(18)} ${what}`);
  console.log(`    ${" ".repeat(18)} ${when}`);
}

console.log(`\n── flota adversarial (F1) ──`);
console.log(`  ● ${ADVERSARIAL_COUNT} auditores con LLM, cada uno con su carta`);
console.log(`    corre antes de abrir el PR:  node audits/adversarial.mjs`);
console.log(`    sin gastar nada:             node audits/adversarial.mjs --seco`);

const total = ACTIVE.length + PENDING.length + ADVERSARIAL_COUNT;
console.log(
  `\n${ACTIVE.length + ADVERSARIAL_COUNT} construidos · ${PENDING.length} esperando fase · ${total} planeados (D-032)`,
);

if (failed > 0) {
  console.error(`\n✗ ${failed} auditor(es) bloquearon.`);
  console.error(`  Anular exige escribir por qué, y queda en el historial (D-032).`);
  process.exit(1);
}
console.log("\n✓ todos los auditores activos pasaron");
