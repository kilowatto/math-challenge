#!/usr/bin/env node
// Auditor determinista — todo distractor se puede tocar y se puede explicar
//
// Hace cumplir: plan F5 §3.4j y §4.1, rezagados §7, línea roja #7, D-070.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// Tres defectos medidos sobre el banco en producción, y los tres comparten una
// cara: `validarItem` no los puede ver, porque compara cada distractor contra
// la respuesta correcta y nada más.
//
//   1. **El negativo.** K12 generaba `b − a` con `b < a` siempre: un número
//      NEGATIVO de distractor en el 100% de la habilidad —45 de 45 ítems—
//      ofrecido a un niño de cuatro años que no sabe leer (rezagados §7).
//      Sobrevivió a la ronda de #345–#361 porque `b − a` ES un número, y los
//      auditores de entonces buscaban cadenas servidas como rótulo.
//
//   2. **La colisión.** `calificarRespuesta` hace `.find()` y devuelve la
//      PRIMERA causa que coincide con el valor. Dos causas sobre el mismo
//      valor significan que la segunda es código muerto — y que Larry puede
//      explicar con seguridad un error que el niño no cometió, que es la
//      línea roja #7 rozada por un `.find()` (plan F5 §4.1: 39 ítems en el
//      diseño de K11; al escribir este auditor apareció vivo en K05 con
//      `patos = gorros`, K06 con n=2, K08 con `antes = 1`, K09 con
//      `llenas = 9` y K14 con núcleo AB).
//
//   3. **La causa borrada que vuelve.** El plan F5 §3.4j lista las causas que
//      hay que BORRAR, no validar: `error.multiplico` y `error.resto` mal
//      etiquetaban el 44% de K11 (un niño de kinder no ha visto una
//      multiplicación); `error.resto_al_reves` era el negativo de arriba;
//      `error.sumo_en_vez_de_completar` exige leer dos numerales en una banda
//      que no los muestra; `error.eligio_al_azar` no es una causa sino la
//      ausencia de causa, y como comodín apagaba `inesperada` — la única
//      señal que detecta un catálogo incompleto (mc-40).
//
// ─── La pregunta de D-070 ──────────────────────────────────────────────────
//
// La lista BORRADAS se copió A MANO del plan §3.4j: es la segunda fuente. Si
// alguien reintroduce una de esas causas en el banco, este auditor no se
// entera por el banco — se entera por su propia tabla, escrita en otro
// momento y desde otro documento. El día que el plan cambie la tabla, este
// archivo cambia con él, a mano también.
//
// ─── Fallar CERRADO ────────────────────────────────────────────────────────
//
// Si el banco no se puede importar, esto sale con 1. «No pude leer» y «está
// todo bien» no son lo mismo.

import { informar } from "./lib/repo.mjs";

const problemas = [];
const notas = [];

// ── La tabla de causas borradas, copiada a mano del plan F5 §3.4j ──────────
//
// Segunda fuente (D-070): NO se deriva del banco ni del código. Cada entrada
// lleva el motivo por el que el plan manda borrarla; ese motivo es el mensaje
// que bloquea si la causa vuelve.
const BORRADAS = [
  ["error.multiplico", "un niño de kinder no ha visto una multiplicación, y en 9 de 25 ítems de K11 valía lo mismo que contar un solo grupo"],
  ["error.resto", "en 4 ítems más de K11 |a−b| valía lo mismo que contar un solo grupo — entre las dos, el 44% de la habilidad mal etiquetada"],
  ["error.resto_al_reves", "con b < a siempre era un número NEGATIVO en el 100% de K12 (rezagados §7)"],
  ["error.sumo_en_vez_de_completar", "exige leer dos numerales y sumarlos, y en N2 no se muestran dos numerales"],
  ["error.conto_el_primero_dos_veces", "la clave y el valor no coincidían: a+b+1 no es «contó el primero dos veces»"],
  ["error.eligio_al_azar", "no es una causa, es la ausencia de causa — y como comodín apagaba `inesperada`"],
  ["error.eligio_sin_particion", "no es representable: es «el complemento del conjunto aceptado», y eso ya se llama `inesperada`"],
  ["error.invirtio_los_digitos", "la inversión alemana empieza en 21 (einundzwanzig, mc-34 §7), fuera del rango de K04; en español es fusión, no inversión"],
  ["error.confunde_el_glifo_2_y_3", "el propio diseño dice «no se calcula, no debe existir» — es una nota, no una causa"],
];

let banco;
try {
  const mod = await import("../packages/motor/src/banco-kinder.ts");
  banco = mod.generarBanco();
} catch (err) {
  console.error("✗ distractores-explicables — no pude importar el banco de kinder.");
  console.error(`  ${String(err).slice(0, 200)}`);
  console.error("  Un auditor que deja de entender su fuente no pasa en verde: bloquea,");
  console.error("  porque «no encontré nada» y «está todo bien» no son lo mismo (D-070).");
  process.exit(1);
}

// Agrupado por habilidad: 773 ítems producirían 773 renglones casi iguales.
const agrupa = (mapa, hab, dato) => {
  if (!mapa.has(hab)) mapa.set(hab, new Set());
  mapa.get(hab).add(dato);
};

const negativos = new Map();
const colisiones = new Map();
const resucitadas = new Map();

for (const item of banco) {
  // ── 1. Ninguna opción numérica es negativa ────────────────────────────────
  const valores = [
    item.respuesta.valor,
    ...item.errores.map((e) => e.valor),
    ...(item.tambienCorrectas ?? []).map((c) => c.valor),
  ];
  for (const v of valores) {
    if (typeof v === "number" && v < 0) agrupa(negativos, item.habilidad, `${item.id} → ${v}`);
  }

  // ── 2. Dos errores no comparten valor ─────────────────────────────────────
  const vistos = new Map();
  for (const e of item.errores) {
    const k = String(e.valor);
    if (vistos.has(k)) {
      agrupa(colisiones, item.habilidad, `${item.id} → ${k} (${vistos.get(k)} / ${e.causa})`);
    } else {
      vistos.set(k, e.causa);
    }
  }

  // ── 3. Ninguna causa borrada vuelve ───────────────────────────────────────
  for (const [causa, motivo] of BORRADAS) {
    if (item.errores.some((e) => e.causa === causa)) agrupa(resucitadas, causa, motivo);
  }
}

const primeros = (valores) => [...valores].sort().slice(0, 4).join("; ");

for (const [hab, v] of [...negativos].sort()) {
  problemas.push(
    `${hab} · opción numérica NEGATIVA: ${primeros(v)}. Un niño de cuatro años no tiene nada que ` +
      "tocar ahí: fue el 100% de K12 durante semanas (rezagados §7), y sobrevivió porque los " +
      "auditores de entonces buscaban cadenas y b−a es un número.",
  );
}

for (const [hab, v] of [...colisiones].sort()) {
  problemas.push(
    `${hab} · dos causas con el mismo valor: ${primeros(v)}. \`calificarRespuesta\` hace \`.find()\` ` +
      "y devuelve la primera: la segunda es código muerto, y Larry puede explicar con seguridad un " +
      "error que el niño no cometió — la línea roja #7 rozada por un `.find()` (plan F5 §4.1).",
  );
}

for (const [causa, v] of [...resucitadas].sort()) {
  problemas.push(
    `la causa borrada \`${causa}\` volvió al banco. El plan F5 §3.4j manda borrarla, no validarla: ` +
      `${[...v][0]}.`,
  );
}

notas.push(`${banco.length} ítem(s), ${BORRADAS.length} causas en la tabla de borradas (segunda fuente, escrita a mano)`);

informar({
  nombre: "distractores-explicables",
  problemas,
  notas,
  cita: "plan F5 §3.4j y §4.1, rezagados §7, línea roja #7, D-070",
  revisados: banco.length,
  resumen: `${banco.length} ítem(s) sin negativos, sin colisiones de causa y sin causas borradas`,
  porQueBloquea:
    "un distractor que no se puede tocar, o dos causas sobre el mismo valor, hacen que Larry " +
    "explique con seguridad un error que el niño no cometió — y eso es la línea roja #7.",
  noComprueba: [
    "que la causa nombrada sea el error que los niños REALES cometen — eso lo valida un maestro " +
      "de kinder contra la señal `inesperada` (mc-40 impl. 9, plan F5 §3.4)",
    "que el distractor sea pedagógicamente bueno: que se pueda tocar y explicar es el piso, no el techo",
    "el banco de primaria en adelante — hoy solo existe kinder",
  ],
});
