#!/usr/bin/env node
// Casos del ítem y de la serie — criterios #38, #43, #44, #45, #46, #47 de F3.

import { calificarRespuesta, validarItem } from "./item.ts";
import { armarSerie, validarSerie, proximoRepaso, tocaRepasar, MAX_SEGUIDOS } from "./serie.ts";

let fallos = 0, corridos = 0;
function caso(nombre, fn) {
  corridos++;
  try { fn(); console.log(`  ✓ ${nombre}`); }
  catch (err) { fallos++; console.error(`  ✗ ${nombre}`); console.error(`      ${err.message}`); }
}
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

const ITEM = {
  id: "k11-001", habilidad: "K11", nivel: 2, formato: "toca_la_respuesta",
  enunciado: { clave: "k.suma.patos", vars: { a: 3, b: 4 } },
  respuesta: { valor: 7, tol: 0 },
  errores: [
    { valor: 12, causa: "error.multiplico" },
    { valor: 1, causa: "error.resto" },
    { valor: 8, causa: "error.conto_el_primero_dos_veces" },
  ],
  proposito: "sumar contando desde el primero",
  contexto: "los patos del lago de Larry",
  variacion: null,
};

const item = (id, habilidad, extra = {}) => ({
  ...ITEM, id, habilidad, variacion: "cambia el sumando mayor", ...extra,
});

console.log("\n== ítem y serie — criterios #38, #43, #44, #46, #47 de F3 ==\n");

// --- El veredicto nombra la causa (#38, #45) --------------------------------
caso("acertar da acc=1 y ninguna causa", () => {
  const v = calificarRespuesta(ITEM, 7);
  es(v.acc, 1); es(v.causa, null); es(v.inesperada, false);
});

caso("el veredicto NOMBRA el error, no dice solo «mal» (#38, mc-11)", () => {
  es(calificarRespuesta(ITEM, 12).causa, "error.multiplico", "12 = 3×4");
  es(calificarRespuesta(ITEM, 1).causa, "error.resto", "1 = 4−3");
  es(calificarRespuesta(ITEM, 8).causa, "error.conto_el_primero_dos_veces");
});

caso("una respuesta que el autor no previó se marca como inesperada", () => {
  const v = calificarRespuesta(ITEM, 99);
  es(v.acc, 0); es(v.causa, null); es(v.inesperada, true);
});

caso("una respuesta rara no revienta el motor — un niño puede tocar cualquier cosa", () => {
  for (const raro of ["", "🦆", -1, 0.5, "siete"]) calificarRespuesta(ITEM, raro);
});

// --- D-048: toda elección autorada vale acierto -----------------------------
caso("en «cuál sobra», la segunda respuesta defendible también vale 1 (D-048)", () => {
  const sobra = {
    ...ITEM, id: "cs-1", formato: "cual_sobra",
    respuesta: { valor: 8, tol: 0 },
    tambienCorrectas: [{ valor: 9, razon: "razon.no_esta_en_la_tabla_del_2" }],
    errores: [{ valor: 4, causa: "error.eligio_al_azar" }],
  };
  const v = calificarRespuesta(sobra, 9);
  es(v.acc, 1, "acc"); es(v.razonAlterna, "razon.no_esta_en_la_tabla_del_2");
  es(calificarRespuesta(sobra, 8).acc, 1, "la principal también");
});

// --- Validación del ítem ----------------------------------------------------
caso("un ítem sin errores con causa nombrada no pasa", () => {
  const p = validarItem({ ...ITEM, errores: [] });
  if (!p.some((x) => x.includes("causa nombrada"))) throw new Error(p.join(" | "));
});

caso("un enunciado con espacios es texto disfrazado de clave", () => {
  const p = validarItem({ ...ITEM, enunciado: { clave: "¿Cuántos patos hay?", vars: {} } });
  if (!p.some((x) => x.includes("clave de mensaje"))) throw new Error(p.join(" | "));
});

caso("un ítem sin propósito no pasa (mc-36, #47)", () => {
  const p = validarItem({ ...ITEM, proposito: "" });
  if (!p.some((x) => x.includes("proposito"))) throw new Error(p.join(" | "));
});

caso("un error igual a la respuesta correcta no pasa", () => {
  const p = validarItem({ ...ITEM, errores: [{ valor: 7, causa: "error.x" }] });
  if (!p.some((x) => x.includes("igual a la respuesta"))) throw new Error(p.join(" | "));
});

caso("una respuesta alterna sin razón escrita no pasa (D-048)", () => {
  const p = validarItem({ ...ITEM, tambienCorrectas: [{ valor: 9, razon: "" }] });
  if (!p.some((x) => x.includes("sin razón"))) throw new Error(p.join(" | "));
});

caso("el ítem de ejemplo del plan §9 es válido", () => {
  const p = validarItem(ITEM);
  if (p.length) throw new Error(p.join(" | "));
});

// --- La serie intercala (#44, mc-05) ----------------------------------------
caso("la serie NO deja más de dos ítems seguidos de la misma habilidad (mc-05)", () => {
  const s = armarSerie({
    K01: [item("a1", "K01"), item("a2", "K01"), item("a3", "K01"), item("a4", "K01")],
    K03: [item("b1", "K03"), item("b2", "K03"), item("b3", "K03"), item("b4", "K03")],
  });
  let seguidos = 1, max = 1;
  for (let i = 1; i < s.pasos.length; i++) {
    seguidos = s.pasos[i].item.habilidad === s.pasos[i - 1].item.habilidad ? seguidos + 1 : 1;
    max = Math.max(max, seguidos);
  }
  if (max > MAX_SEGUIDOS) throw new Error(`${max} seguidos; el tope es ${MAX_SEGUIDOS}`);
  es(s.pasos.length, 8, "no se pierde ningún ítem");
});

caso("una serie bloqueada por tema NO pasa la validación", () => {
  const pasos = ["K01", "K01", "K01", "K01"].map((h, i) => ({
    item: item(`x${i}`, h), ejemploTrabajado: i === 0, variacion: i ? "algo" : null,
  }));
  const p = validarSerie({ pasos, habilidades: ["K01", "K03"] });
  if (!p.some((x) => x.includes("seguidos"))) throw new Error(p.join(" | ") || "no detectó el bloque");
});

// --- Ejemplo trabajado (#43, mc-04) -----------------------------------------
caso("una habilidad NUEVA se abre con ejemplo trabajado (mc-04)", () => {
  const s = armarSerie({ K11: [item("c1", "K11"), item("c2", "K11")] }, new Set());
  es(s.pasos[0].ejemploTrabajado, true, "el primero");
  es(s.pasos[1].ejemploTrabajado, false, "el segundo ya se practica");
});

caso("una habilidad YA VISTA no repite el ejemplo trabajado", () => {
  const s = armarSerie({ K11: [item("d1", "K11"), item("d2", "K11")] }, new Set(["K11"]));
  if (s.pasos.some((x) => x.ejemploTrabajado)) throw new Error("repitió el ejemplo");
});

// --- Variación explícita (#46, mc-02) ---------------------------------------
caso("un paso sin eje de variación declarado NO pasa (mc-02)", () => {
  const s = armarSerie({
    K01: [item("e1", "K01"), { ...item("e2", "K01"), variacion: null }],
  }, new Set(["K01"]));
  const p = validarSerie(s);
  if (!p.some((x) => x.includes("variación"))) throw new Error(p.join(" | ") || "no lo detectó");
});

caso("una serie bien armada pasa limpia", () => {
  const s = armarSerie({
    K01: [item("f1", "K01"), item("f2", "K01")],
    K03: [item("g1", "K03"), item("g2", "K03")],
  }, new Set(["K01", "K03"]));
  const p = validarSerie(s);
  if (p.length) throw new Error(p.join(" | "));
});

// --- Espaciado (mc-05) ------------------------------------------------------
caso("los intervalos de repaso CRECEN: 1, 3, 7, 16, 35 (mc-05)", () => {
  const v = [0, 1, 2, 3, 4].map(proximoRepaso);
  es(JSON.stringify(v), JSON.stringify([1, 3, 7, 16, 35]));
  for (let i = 1; i < v.length; i++) {
    if (!(v[i] > v[i - 1])) throw new Error("no crecen: repasar al mismo intervalo no espacia nada");
  }
});

caso("pasado el último intervalo se sigue repasando, no se abandona", () => {
  es(proximoRepaso(99), 35);
  es(tocaRepasar(40, 99), true);
  es(tocaRepasar(3, 0), true, "3 días con 0 repasos");
  es(tocaRepasar(0, 0), false, "el mismo día no");
});

console.log("");
if (fallos > 0) {
  console.error(`✗ ítem y serie — ${fallos} de ${corridos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log(`✓ ítem y serie — ${corridos} casos\n`);
