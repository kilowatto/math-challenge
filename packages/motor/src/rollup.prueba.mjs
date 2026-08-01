#!/usr/bin/env node
// Casos del rollup a D1 — criterio #35 de F3, mc-32 riesgo #1.

import { agregar, validarLote, tocaEscribir, SQL_UPSERT, INTERVALO_MIN_MS } from "./rollup.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

const intento = (nino, puntos, period = "all_time") => ({
  childProfileId: nino, period, themeBand: "KINDER", puntos,
});

console.log("\n== rollup a D1 — criterio #35, mc-32 riesgo #1 ==\n");

caso("mil intentos de treinta niños salen como treinta filas", () => {
  const intentos = [];
  for (let i = 0; i < 1000; i++) intentos.push(intento(`n${i % 30}`, 10));
  const lote = agregar(intentos);
  es(lote.filas.length, 30, "filas");
  es(lote.intentosAgregados, 1000, "intentos");
});

caso("los puntos del mismo niño se SUMAN, no se pisan", () => {
  const lote = agregar([intento("a", 10), intento("a", 5), intento("a", 2.5)]);
  es(lote.filas.length, 1);
  es(lote.filas[0].delta, 17.5);
});

caso("periodos distintos del mismo niño son filas distintas", () => {
  const lote = agregar([intento("a", 10, "all_time"), intento("a", 10, "season:2026q3")]);
  es(lote.filas.length, 2);
});

caso("el upsert SUMA el incremento, no escribe el total", () => {
  if (!/total_score = total_score \+ excluded\.total_score/.test(SQL_UPSERT)) {
    throw new Error("el SQL pisa el total: entre leer y escribir cabe otro lote, y se pierden puntos");
  }
  if (/SELECT/i.test(SQL_UPSERT)) throw new Error("lee antes de escribir");
});

caso("una fila con itemId NO pasa: sería una tabla por intento con otro nombre", () => {
  const lote = { filas: [{ childProfileId: "a", period: "all_time", themeBand: "KINDER", delta: 10, itemId: "i1" }], intentosAgregados: 1 };
  const p = validarLote(lote);
  if (!p.some((x) => x.includes("itemId"))) throw new Error(p.join(" | ") || "no lo detectó");
});

caso("una fila con tiempo de respuesta tampoco pasa", () => {
  const lote = { filas: [{ childProfileId: "a", period: "all_time", themeBand: "KINDER", delta: 10, rtMs: 1200 }], intentosAgregados: 1 };
  const p = validarLote(lote);
  if (!p.some((x) => x.includes("rtMs"))) throw new Error(p.join(" | ") || "no lo detectó");
});

caso("un lote que no comprime nada NO pasa", () => {
  const p = validarLote({ filas: [1,2,3].map((i) => ({ childProfileId: `n${i}`, period: "all_time", themeBand: "KINDER", delta: 1 })), intentosAgregados: 2 });
  if (!p.some((x) => x.includes("no está agregando"))) throw new Error(p.join(" | ") || "no lo detectó");
});

caso("un lote bien formado pasa limpio", () => {
  const p = validarLote(agregar([intento("a", 10), intento("b", 5)]));
  if (p.length) throw new Error(p.join(" | "));
});

caso("se escribe por tamaño O por tiempo, y hacen falta los dos disparadores", () => {
  es(tocaEscribir(200, 0), true, "por tamaño, aunque no haya pasado tiempo");
  es(tocaEscribir(1, INTERVALO_MIN_MS), true, "por tiempo, aunque sea un solo intento");
  es(tocaEscribir(1, 1000), false, "ni tamaño ni tiempo");
  es(tocaEscribir(0, 999999), false, "sin pendientes no se escribe nada");
});

caso("el intervalo mínimo son los 30 s que dice la migración 0002", () => {
  es(INTERVALO_MIN_MS, 30_000);
});

console.log("");
if (fallos > 0) { console.error(`✗ rollup — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ rollup a D1 — ${corridos} casos, criterio #35\n`);
