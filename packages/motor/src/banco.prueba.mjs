#!/usr/bin/env node
// Casos del banco de kinder — plan §9, mc-40, mc-02.

import { generarBanco, PLANTILLAS, SIN_PLANTILLA, HABILIDADES_KINDER } from "./banco-kinder.ts";
import { validarItem, calificarRespuesta } from "./item.ts";
import { armarSerie, validarSerie } from "./serie.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== banco de kinder — plan §9, mc-40 ==\n");
const banco = generarBanco();

caso("las plantillas generan un banco de tamaño útil", () => {
  if (banco.length < 150) throw new Error(`solo ${banco.length} ítems`);
  console.log(`      ${banco.length} ítems desde ${PLANTILLAS.length} plantillas`);
});

caso("TODOS los ítems generados son válidos", () => {
  const malos = banco.map((i) => ({ i, p: validarItem(i) })).filter((x) => x.p.length);
  if (malos.length) throw new Error(`${malos.length} inválidos; el primero (${malos[0].i.id}): ${malos[0].p.join(" | ")}`);
});

caso("ningún id se repite — un ítem duplicado rompe el historial de un niño", () => {
  const ids = new Set(banco.map((i) => i.id));
  es(ids.size, banco.length);
});

caso("es determinista: dos corridas dan los mismos ids", () => {
  es(JSON.stringify(generarBanco().map((i) => i.id)), JSON.stringify(banco.map((i) => i.id)));
});

caso("ningún distractor coincide con la respuesta correcta de su propio ítem", () => {
  for (const i of banco) {
    for (const e of i.errores) {
      if (String(e.valor) === String(i.respuesta.valor)) throw new Error(`${i.id}: ${e.valor}`);
    }
  }
});

caso("los errores se DERIVAN del parámetro, con su causa nombrada", () => {
  const suma = banco.find((i) => i.id === "k11-3-4");
  if (!suma) throw new Error("no encontré k11-3-4");
  es(suma.respuesta.valor, 7);
  es(calificarRespuesta(suma, 12).causa, "error.multiplico", "3×4");
  es(calificarRespuesta(suma, 1).causa, "error.resto", "4−3");
  es(calificarRespuesta(suma, 8).causa, "error.conto_el_primero_dos_veces");
});

caso("restar al revés tiene su propia causa", () => {
  const resta = banco.find((i) => i.id === "k12-5-2");
  es(resta.respuesta.valor, 3);
  es(calificarRespuesta(resta, 7).causa, "error.sumo");
});

caso("todo ítem declara su eje de variación (mc-02)", () => {
  const sin = banco.filter((i) => !i.variacion);
  if (sin.length) throw new Error(`${sin.length} sin variación; el primero ${sin[0].id}`);
});

caso("todo ítem declara su propósito (mc-36)", () => {
  const sin = banco.filter((i) => !i.proposito?.trim());
  if (sin.length) throw new Error(`${sin.length} sin propósito`);
});

caso("los cinco formatos táctiles están representados (plan §9)", () => {
  const formatos = new Set(banco.map((i) => i.formato));
  for (const f of ["toca_la_respuesta", "toca_para_contar", "flash", "arma_el_numero", "cual_sobra"]) {
    if (!formatos.has(f)) throw new Error(`falta el formato ${f}`);
  }
});

caso("las habilidades sin plantilla se declaran, no se esconden", () => {
  const conPlantilla = new Set(PLANTILLAS.map((p) => p.habilidad));
  const todas = Object.keys(HABILIDADES_KINDER);
  const faltan = todas.filter((h) => !conPlantilla.has(h));
  es(JSON.stringify(faltan.sort()), JSON.stringify([...SIN_PLANTILLA].sort()),
     "SIN_PLANTILLA no coincide con lo que de verdad falta");
  console.log(`      ${conPlantilla.size} con plantilla, ${faltan.length} esperando curaduría humana`);
});

caso("una serie armada del banco real pasa la validación (mc-05, mc-04, mc-02)", () => {
  const porHabilidad = {};
  for (const i of banco) (porHabilidad[i.habilidad] ??= []).push(i);
  // Cinco de cada habilidad, que es el tamaño de una sesión de kinder.
  const recorte = Object.fromEntries(Object.entries(porHabilidad).map(([h, is]) => [h, is.slice(0, 5)]));
  const s = armarSerie(recorte, new Set(Object.keys(recorte)));
  const p = validarSerie(s);
  if (p.length) throw new Error(p.join(" | "));
  console.log(`      serie de ${s.pasos.length} pasos sobre ${s.habilidades.length} habilidades`);
});

caso("todos los ítems de kinder están en los niveles N1-N3 de D-017", () => {
  const fuera = banco.filter((i) => i.nivel < 1 || i.nivel > 3);
  if (fuera.length) throw new Error(`${fuera.length} fuera de N1-N3; el primero ${fuera[0].id} en N${fuera[0].nivel}`);
});

console.log("");
if (fallos > 0) { console.error(`✗ banco — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ banco de kinder — ${corridos} casos\n`);
