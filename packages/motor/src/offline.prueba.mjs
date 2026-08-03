#!/usr/bin/env node
// Casos de la cola offline y el modo avión — criterio #41 de F3, D-047.

import * as offline from "./offline.ts";
import { sincronizar, podar, llave, armarPaqueteDeVuelo, TOPE_AUDIO_BYTES } from "./offline.ts";
import { ESTADO_INICIAL } from "./racha.ts";

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

// --- #198: XP completo al sincronizar, sin la reserva de D-047 ---------------
//
// Segunda fuente A MANO (D-070): los valores esperados se calcularon fuera del
// motor — valorDelItem(n) = 10 · 1.6^(n−1), así que nivel 1 → 10, nivel 2 → 16,
// nivel 5 → round(65.536) = 66. Nada de esto llama a xpDeItem ni a valorDelItem.

caso("un intento offline acredita XP COMPLETO, sin descuento ni marca (#198)", () => {
  es(sincronizar(enCola({ nivel: 5 }), () => true).xp, 66, "nivel 5 acertado");
  es(sincronizar(enCola({ nivel: 1 }), () => true).xp, 10, "nivel 1 acertado");
  es(sincronizar(enCola({ nivel: 2, banda: "PRO" }), () => true).xp, 16,
     "ni siquiera PRO descuenta: el XP no ve el reloj en ninguna banda (D-055)");
});

caso("fallar offline acredita 0 XP, nunca un negativo (D-055)", () => {
  es(sincronizar(enCola({ nivel: 5 }), () => false).xp, 0);
});

// --- #209: los días de vuelo cuentan para la racha ---------------------------

// Instantes fijos, con su día local derivado A MANO (D-070, segunda fuente):
// agosto no tiene horario de verano en America/Mexico_City (UTC−6 todo el año)
// ni en Asia/Tokyo (UTC+9 todo el año).
const DIA_1 = Date.UTC(2026, 7, 10, 15, 0, 0); // CDMX: 2026-08-10 09:00 → día 10
const DIA_2 = Date.UTC(2026, 7, 11, 15, 0, 0); // CDMX: 2026-08-11 09:00 → día 11
const ZONA = "America/Mexico_City";

const retoDeVuelo = (sesionId, contestadoEn) => [
  enCola({ sesionId, orden: 1, contestadoEn }),
  enCola({ sesionId, orden: 2, itemId: "i2", contestadoEn: contestadoEn + 60_000 }),
];

caso("dos días de vuelo, sincronizados juntos al aterrizar: la racha avanza 2 (#209)", () => {
  let racha = ESTADO_INICIAL;
  racha = offline.sincronizarReto(retoDeVuelo("vuelo-1", DIA_1), () => true, true, ZONA, racha).racha;
  racha = offline.sincronizarReto(retoDeVuelo("vuelo-2", DIA_2), () => true, true, ZONA, racha).racha;
  es(racha.current_streak, 2, "ni 0 (los días de vuelo sí cuentan) ni 1 (son DOS días)");
  es(racha.last_completed_local_date, "2026-08-11");
});

caso("ítems sueltos SIN reto cerrado no cuentan para la racha (#209)", () => {
  const r = offline.sincronizarReto(retoDeVuelo("suelto", DIA_1), () => true, false, ZONA, ESTADO_INICIAL);
  if (r.racha !== ESTADO_INICIAL) throw new Error("un reto no cerrado movió la racha");
  // Pero el XP de los ítems sí se acredita: son preguntas distintas (#198).
  es(r.xp, 66 + 66, "dos ítems de nivel 5 acertados");
});

caso("el día lo decide la zona del HOGAR, nunca el reloj del dispositivo (#209)", () => {
  // El mismo instante: 2026-08-11 04:00 UTC. En CDMX aún es el día 10 (22:00);
  // en Tokio ya es el día 11 (13:00). Derivado a mano, no con diaEfectivo.
  const LIMITE = Date.UTC(2026, 7, 11, 4, 0, 0);
  const cdmx = offline.sincronizarReto(retoDeVuelo("z1", LIMITE), () => true, true, ZONA, ESTADO_INICIAL);
  es(cdmx.racha.last_completed_local_date, "2026-08-10");
  const tokio = offline.sincronizarReto(retoDeVuelo("z2", LIMITE), () => true, true, "Asia/Tokyo", ESTADO_INICIAL);
  es(tokio.racha.last_completed_local_date, "2026-08-11");
});

caso("un reto offline sigue FUERA del tablero: soloPrecision y fueraDelTablero no cambian (D-047 intacta)", () => {
  const r = offline.sincronizarReto(retoDeVuelo("tablero", DIA_1), () => true, true, ZONA, ESTADO_INICIAL);
  es(r.resultados.length, 2);
  for (const res of r.resultados) {
    es(res.fueraDelTablero, true, "D-047: un intento offline nunca cuenta para el tablero");
    es(res.soloPrecision, true, "banda PRIMARIA: solo precisión, como antes");
  }
});

caso("un reto completo VACÍO es un error de quien llama, no un día gratis", () => {
  let lanzo = false;
  try { offline.sincronizarReto([], () => true, true, ZONA, ESTADO_INICIAL); } catch { lanzo = true; }
  if (!lanzo) throw new Error("un reto completo sin ítems habría contado un día de la nada");
});

console.log("");
if (fallos > 0) { console.error(`✗ cola offline — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ cola offline y modo avión — ${corridos} casos, D-047\n`);
