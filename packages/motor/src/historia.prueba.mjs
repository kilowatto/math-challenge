#!/usr/bin/env node
// Casos del modo historia — criterio #48 de F3, mc-01, D-019.

import {
  iniciarHistoria, avanzar, registrarMetodo, nombrarIdea,
  haySuficientesMetodos, completa, ORDEN,
} from "./historia.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };
const lanza = (fn, frag) => {
  try { fn(); } catch (e) {
    if (frag && !e.message.includes(frag)) throw new Error(`lanzó por otra razón: "${e.message}"`);
    return;
  }
  throw new Error("no lanzó");
};

console.log("\n== modo historia — criterio #48, mc-01, D-019 ==\n");

caso("la historia empieza en exploración: el problema ANTES del método (mc-01)", () => {
  const h = iniciarHistoria("K11");
  es(h.fase, "exploracion");
  // Es lo contrario de la secuencia de EE.UU. y Alemania. TIMSS lo midió:
  // Japón dedica el 44% del tiempo a inventar soluciones nuevas.
});

caso("NO se puede saltar la síntesis — la fase más fácil de recortar (#48)", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  lanza(() => avanzar(h, "terminado"), "sintesis");
});

caso("el mensaje del salto EXPLICA por qué, no solo que no se puede", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  try { avanzar(h, "terminado"); } catch (e) {
    if (!e.message.includes("consolida")) throw new Error("no explica qué se pierde");
    return;
  }
  throw new Error("no lanzó");
});

caso("tampoco se salta la práctica", () => {
  const h = iniciarHistoria("K11");
  lanza(() => avanzar(h, "sintesis"), "practica");
});

caso("no se vuelve atrás: la historia va hacia adelante", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  lanza(() => avanzar(h, "exploracion"), "hacia adelante");
  lanza(() => avanzar(h, "practica"), "hacia adelante");
});

caso("una fase inventada se rechaza", () => {
  lanza(() => avanzar(iniciarHistoria("K11"), "victoria"), "fase desconocida");
});

// --- La síntesis no se hace de mentira ---------------------------------------
caso("llegar a la síntesis y pasar de largo NO cuenta como hacerla", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  h = avanzar(h, "sintesis");
  // Sin nombrar la idea, no se sale: sería saltársela con más pasos.
  lanza(() => avanzar(h, "terminado"), "sin nombrar la idea");
});

caso("nombrando la idea, la historia se completa", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  h = avanzar(h, "sintesis");
  h = nombrarIdea(h, "idea.contar_desde_el_mayor");
  h = avanzar(h, "terminado");
  es(completa(h), true);
  es(h.ideaNombrada, "idea.contar_desde_el_mayor");
});

// --- Los métodos, sin texto libre (línea roja #3) ----------------------------
caso("los métodos son ids AUTORADOS, nunca texto del niño (línea roja #3)", () => {
  const h = iniciarHistoria("K11");
  lanza(() => registrarMetodo(h, "conté con los dedos"), "texto libre");
  lanza(() => registrarMetodo(h, ""), "id de método");
  registrarMetodo(h, "metodo.con_los_dedos");
});

caso("un método repetido no se duplica: comparar dos veces el mismo no compara", () => {
  let h = iniciarHistoria("K11");
  h = registrarMetodo(h, "metodo.con_los_dedos");
  h = registrarMetodo(h, "metodo.con_los_dedos");
  es(h.metodosVistos.length, 1);
});

caso("los métodos se recogen en la exploración, no después", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  lanza(() => registrarMetodo(h, "metodo.x"), "en la exploración");
});

caso("la idea se nombra en la síntesis, no antes", () => {
  const h = iniciarHistoria("K11");
  lanza(() => nombrarIdea(h, "idea.x"), "en la síntesis");
});

// --- Neriage: comparar exige al menos dos ------------------------------------
caso("con un solo método NO hay neriage: comparar exige dos", () => {
  let h = iniciarHistoria("K11");
  es(haySuficientesMetodos(h), false, "cero");
  h = registrarMetodo(h, "metodo.a");
  es(haySuficientesMetodos(h), false, "uno");
  h = registrarMetodo(h, "metodo.b");
  es(haySuficientesMetodos(h), true, "dos");
});

caso("el orden de fases es el de la lección japonesa", () => {
  es(JSON.stringify(ORDEN), JSON.stringify(["exploracion", "practica", "sintesis", "terminado"]));
});

caso("una historia a medias no está completa aunque tenga idea", () => {
  let h = iniciarHistoria("K11");
  h = avanzar(h, "practica");
  h = avanzar(h, "sintesis");
  h = nombrarIdea(h, "idea.x");
  es(completa(h), false, "sigue en síntesis");
});

console.log("");
if (fallos > 0) { console.error(`✗ modo historia — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ modo historia — ${corridos} casos, criterio #48\n`);
