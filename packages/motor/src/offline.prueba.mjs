#!/usr/bin/env node
// Casos de la cola offline y el modo avión — criterio #41 de F3, D-047.

import { sincronizar, podar, llave, armarPaqueteDeVuelo, TOPE_AUDIO_BYTES } from "./offline.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

const enCola = (extra = {}) => ({
  sesionId: "s1", orden: 1, itemId: "i1", nivel: 5, banda: "PRIMARIA",
  eleccion: 7, rtLocalMs: 1200, contestadoEn: 1700000000000, ...extra,
});

console.log("\n== cola offline y modo avión — criterio #41, D-047 ==\n");

caso("el servidor RECALCULA: el tiempo local no toca el puntaje", () => {
  const rapido = sincronizar(enCola({ rtLocalMs: 1 }), () => true);
  const lento  = sincronizar(enCola({ rtLocalMs: 900_000 }), () => true);
  es(rapido.veredicto.puntos, lento.veredicto.puntos,
     "dos tiempos locales distintos dieron puntajes distintos");
});

caso("un intento offline NUNCA cuenta para el tablero (D-047, D-025)", () => {
  es(sincronizar(enCola(), () => true).fueraDelTablero, true);
  es(sincronizar(enCola({ banda: "KINDER" }), () => true).fueraDelTablero, true);
});

caso("en banda cronometrada se marca soloPrecision; en kinder no hace falta", () => {
  es(sincronizar(enCola({ banda: "PRO" }), () => true).soloPrecision, true);
  es(sincronizar(enCola({ banda: "KINDER" }), () => true).soloPrecision, false,
     "kinder ya era solo precisión (D-024): no hay nada que degradar");
});

caso("acertar offline SUMA — nadie pierde el trabajo hecho en el metro", () => {
  const v = sincronizar(enCola(), () => true).veredicto;
  if (!(v.puntos > 0)) throw new Error(`dio ${v.puntos}`);
});

caso("fallar offline da 0, no un negativo", () => {
  es(sincronizar(enCola(), () => false).veredicto.puntos, 0);
});

caso("el intento en cola no tiene DÓNDE poner un puntaje", () => {
  const permitidas = new Set(["sesionId","orden","itemId","nivel","banda","eleccion","rtLocalMs","contestadoEn"]);
  for (const k of Object.keys(enCola())) if (!permitidas.has(k)) throw new Error(`lleva "${k}"`);
  for (const k of Object.keys(enCola())) if (/score|puntaje|puntos|points/i.test(k)) throw new Error(`lleva "${k}"`);
});

caso("podar quita lo ya sincronizado, por (sesión, orden)", () => {
  const cola = [enCola({ orden: 1 }), enCola({ orden: 2 }), enCola({ sesionId: "s2", orden: 1 })];
  const quedan = podar(cola, new Set([llave({ sesionId: "s1", orden: 1 })]));
  es(quedan.length, 2);
  if (quedan.some((i) => i.sesionId === "s1" && i.orden === 1)) throw new Error("no podó");
});

// --- Modo avión -------------------------------------------------------------
const catalogo = {
  itemsPorNivel: { 5: ["a","b","c"], 6: ["d","e"], 12: ["z"] },
  audioPorNivel: { 5: ["v1","comun"], 6: ["v2","comun"] },
  bytesPorItem: 1000, bytesPorAudio: 100_000,
};

caso("el paquete lleva el nivel actual Y EL SIGUIENTE (D-047 enmendada)", () => {
  const p = armarPaqueteDeVuelo(5, catalogo);
  es(JSON.stringify(p.niveles), JSON.stringify([5, 6]));
  es(p.itemIds.length, 5, "los ítems de los dos niveles");
});

caso("el audio se comparte entre niveles, no se duplica", () => {
  const p = armarPaqueteDeVuelo(5, catalogo);
  es(p.audioIds.length, 3, "v1, v2 y comun una sola vez");
});

caso("si el audio no cabe se recorta el del siguiente, NUNCA los ítems", () => {
  const p = armarPaqueteDeVuelo(5, catalogo, 250_000);
  es(p.itemIds.length, 5, "los ítems de los dos niveles siguen enteros");
  es(p.audioIds.length, 2, "solo el audio del nivel actual");
  if (p.audioIds.includes("v2")) throw new Error("conservó el audio del siguiente");
});

caso("en el último nivel no se inventa un nivel 13", () => {
  const p = armarPaqueteDeVuelo(12, catalogo);
  es(JSON.stringify(p.niveles), JSON.stringify([12]));
});

caso("el paquete dice cuántos bytes son, para poder avisar ANTES de descargar", () => {
  const p = armarPaqueteDeVuelo(5, catalogo);
  es(p.bytes, 5 * 1000 + 3 * 100_000);
});

caso("el tope de audio de mc-42 son 5 MB", () => {
  es(TOPE_AUDIO_BYTES, 5 * 1024 * 1024);
});

console.log("");
if (fallos > 0) { console.error(`✗ cola offline — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ cola offline y modo avión — ${corridos} casos, D-047\n`);
