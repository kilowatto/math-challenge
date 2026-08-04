#!/usr/bin/env node
// Casos del banco de PRIMARIA — F5c #352–#355, plan §9, mc-36, mc-40.
//
//     node --experimental-strip-types packages/motor/src/banco-primaria.prueba.mjs
//
// Lo que estos casos defienden no rompe nada visible al romperse: un
// distractor que no corresponde a ningún error real sigue siendo un número,
// y un ítem de «resta con préstamo» cuyos distractores no distinguen «no
// pidió» de «pidió sin falta» pasa toda revisión de tipos. Se descubre
// cuando Larry le explica a alguien un error que no cometió.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  generarBancoPrimaria,
  PLANTILLAS_PRIMARIA,
  HABILIDADES_PRIMARIA,
  TECHO_POR_HABILIDAD,
} from "./banco-primaria.ts";
import { validarItem, calificarRespuesta } from "./item.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== banco de primaria — F5c #352–#355 ==\n");
const banco = generarBancoPrimaria();

caso("cada modelo genera al menos 20 variantes distintas (#352–#355)", () => {
  for (const p of PLANTILLAS_PRIMARIA) {
    const n = banco.filter((i) => i.habilidad === p.habilidad).length;
    if (n < 20) throw new Error(`${p.habilidad}: solo ${n} variantes`);
    console.log(`      ${p.habilidad} (${HABILIDADES_PRIMARIA[p.habilidad]}): ${n}`);
  }
});

caso("TODOS los ítems generados son válidos (validarItem)", () => {
  const malos = banco.map((i) => ({ i, p: validarItem(i) })).filter((x) => x.p.length);
  if (malos.length) throw new Error(`${malos.length} inválidos; el primero (${malos[0].i.id}): ${malos[0].p.join(" | ")}`);
});

caso("un ítem mal formado REVIENTA la siembra (#366)", () => {
  // Mismo control negativo que en el banco de kinder: la validación vive en
  // `generarBancoPrimaria()`, no solo en esta prueba. Una plantilla corrupta
  // tiene que impedir que la siembra se construya, no producir una fila rota
  // en `item_bank`.
  const corrupta = {
    habilidad: "P01",
    parametros: () => [{ params: {}, variacion: null }],
    generar: () => ({ ...banco[0], id: "prueba-corrupta-366", errores: [] }),
  };
  PLANTILLAS_PRIMARIA.push(corrupta);
  try {
    let revento = false;
    try {
      generarBancoPrimaria();
    } catch (e) {
      revento = e.message.includes("prueba-corrupta-366");
    }
    if (!revento) {
      throw new Error("generarBancoPrimaria() construyó la siembra con un ítem mal formado dentro");
    }
  } finally {
    PLANTILLAS_PRIMARIA.pop();
  }
});

caso("ningún id se repite y la generación es determinista", () => {
  es(new Set(banco.map((i) => i.id)).size, banco.length, "ids únicos");
  es(
    JSON.stringify(generarBancoPrimaria().map((i) => i.id)),
    JSON.stringify(banco.map((i) => i.id)),
    "dos corridas",
  );
});

caso("todo ítem tiene al menos 2 distractores, ninguno igual a la respuesta, ninguno negativo", () => {
  for (const i of banco) {
    if (i.errores.length < 2) throw new Error(`${i.id}: ${i.errores.length} distractor(es)`);
    for (const e of i.errores) {
      if (String(e.valor) === String(i.respuesta.valor)) throw new Error(`${i.id}: distractor = respuesta (${e.valor})`);
      if (typeof e.valor === "number" && e.valor < 0) throw new Error(`${i.id}: distractor negativo (${e.valor})`);
    }
    if (typeof i.respuesta.valor === "number" && i.respuesta.valor < 0) {
      throw new Error(`${i.id}: respuesta negativa — los negativos no son de esta banda (N3–N6)`);
    }
  }
});

// ─── P01 (#352): los distractores son errores REALES, no números al azar ────

caso("P01: «no llevó» solo existe cuando HAY llevada, y «llevó de más» solo cuando no la hay", () => {
  // Se verifica sobre TODA la plantilla, no sobre un ítem escogido: el barrido
  // usa pasos y un ítem literal puede no existir mañana (misma lección que el
  // id de kinder: la prueba busca la REGLA, no el ejemplar).
  const sumas = banco.filter((i) => i.habilidad === "P01" && i.enunciado.clave === "p.fluidez.suma");
  let conLlevar = 0, sinLlevar = 0;
  for (const i of sumas) {
    const { a, b } = i.enunciado.vars;
    const lleva = (a % 10) + (b % 10) >= 10;
    const causas = i.errores.map((e) => e.causa);
    if (lleva) {
      conLlevar++;
      if (!causas.includes("error.p.no_llevo")) throw new Error(`${i.id}: hay llevada y no se ofrece «no llevó»`);
      if (causas.includes("error.p.llevo_de_mas")) throw new Error(`${i.id}: SÍ lleva y «llevó de más» es inventado`);
    } else {
      sinLlevar++;
      if (!causas.includes("error.p.llevo_de_mas")) throw new Error(`${i.id}: no hay llevada y no se ofrece «llevó de más»`);
      if (causas.includes("error.p.no_llevo")) throw new Error(`${i.id}: NO lleva y «no llevó» es inventado`);
    }
  }
  if (conLlevar < 20 || sinLlevar < 20) throw new Error(`cobertura: ${conLlevar} con llevada, ${sinLlevar} sin`);
});

caso("P01: restar el menor del mayor por columna tiene su causa (#352, literal), y solo cuando hace falta pedir", () => {
  const restas = banco.filter((i) => i.habilidad === "P01" && i.enunciado.clave === "p.fluidez.resta");
  let conPrestamo = 0, sinPrestamo = 0;
  for (const i of restas) {
    const { a, b } = i.enunciado.vars;
    const pide = (a % 10) < (b % 10);
    const causas = i.errores.map((e) => e.causa);
    if (pide) {
      conPrestamo++;
      // 52 − 27 = 25; por columnas al revés: |2−7| = 5 y 5−2 = 3 → 35.
      const alReves = (Math.floor(a / 10) - Math.floor(b / 10)) * 10 + Math.abs((a % 10) - (b % 10));
      const entrada = i.errores.find((e) => e.causa === "error.p.resto_menor_del_mayor");
      if (!entrada) throw new Error(`${i.id}: falta «restó el menor del mayor»`);
      es(entrada.valor, alReves, `${i.id}: el valor del error por columnas`);
      // Cuando las unidades difieren en exactamente 5, «no pidió» (respuesta
      // + 10) y «restó al revés» dan el MISMO número: son dos procesos con un
      // solo distractor posible, y se queda el más informativo. Exigir las dos
      // causas ahí sería exigir dos botones con el mismo número.
      if (alReves !== i.respuesta.valor + 10 && !causas.includes("error.p.no_pidio")) {
        throw new Error(`${i.id}: hace falta pedir y falta «no pidió»`);
      }
      if (causas.includes("error.p.pidio_sin_faltar")) throw new Error(`${i.id}: SÍ hace falta y «pidió sin falta» es inventado`);
    } else {
      sinPrestamo++;
      if (!causas.includes("error.p.pidio_sin_faltar")) throw new Error(`${i.id}: no hace falta pedir y falta «pidió sin falta»`);
      if (causas.includes("error.p.no_pidio")) throw new Error(`${i.id}: NO hace falta y «no pidió» es inventado`);
    }
  }
  if (conPrestamo < 20 || sinPrestamo < 20) throw new Error(`cobertura: ${conPrestamo} con préstamo, ${sinPrestamo} sin`);
});

caso("P01: «olvidar el cero» solo se ofrece cuando el resultado termina en cero", () => {
  let redondas = 0;
  for (const i of banco.filter((x) => x.habilidad === "P01")) {
    const ofrece = i.errores.find((e) => e.causa === "error.p.olvido_el_cero");
    if (i.respuesta.valor % 10 !== 0) {
      if (ofrece) throw new Error(`${i.id}: «olvidó el cero» sin cero que olvidar`);
      continue;
    }
    redondas++;
    if (!ofrece) throw new Error(`${i.id}: el resultado termina en cero y no se ofrece «olvidó el cero»`);
    es(ofrece.valor, i.respuesta.valor / 10, `${i.id}: el valor del error del cero`);
  }
  if (redondas === 0) throw new Error("ningún ítem de P01 da un resultado redondo: el error del cero no se ejercita nunca");
});

// ─── P02 (#353): magnitud y valor posicional ────────────────────────────────

caso("P02: la respuesta es el mayor y cada distractor nombra SU error de comparación", () => {
  const comp = banco.find((i) => i.id === "p02-0-2-1-2-3-0"); // 2123 · 2231 · 2312
  if (!comp) throw new Error("no encontré p02-0-2-1-2-3-0");
  es(comp.respuesta.valor, 2312, "el mayor");
  es(calificarRespuesta(comp, 2123).causa, "error.p.comparo_desde_las_unidades", "gana en unidades");
  es(calificarRespuesta(comp, 2231).causa, "error.p.comparo_solo_una_posicion", "gana solo en decenas");
});

caso("P02: el valor posicional distingue la cifra de su valor", () => {
  // Sobre toda la familia, no sobre un ítem literal (el barrido usa pasos).
  const pos = banco.filter((i) => i.habilidad === "P02" && i.enunciado.clave === "p.posicional.valor");
  if (pos.length < 20) throw new Error(`solo ${pos.length} ítems de valor posicional`);
  for (const i of pos) {
    const { d } = i.enunciado.vars;
    const resp = i.respuesta.valor;
    const cifra = i.errores.find((e) => e.causa === "error.p.dijo_la_cifra");
    if (!cifra || cifra.valor !== d) throw new Error(`${i.id}: «dijo la cifra» falta o no vale ${d}`);
    // La respuesta es la cifra por una potencia de diez, nunca otra cosa.
    const coc = resp / d;
    if (!Number.isInteger(coc) || ![10, 100, 1000, 10000].includes(coc)) {
      throw new Error(`${i.id}: ${resp} no es ${d} por una potencia de diez`);
    }
  }
  // Y el ejemplo del issue: el 7 en 4 738 vale 700 — buscado por estructura.
  const ejemplo = pos.find((i) => i.respuesta.valor === 700 && i.enunciado.vars.d === 7);
  if (!ejemplo) throw new Error("no hay ningún «el 7 vale 700» en la familia");
  es(calificarRespuesta(ejemplo, 7).causa, "error.p.dijo_la_cifra", "dijo la cifra");
  es(calificarRespuesta(ejemplo, 7000).causa, "error.p.corrio_un_lugar", "un lugar a la izquierda");
  es(calificarRespuesta(ejemplo, 70).causa, "error.p.cayo_un_lugar", "un lugar a la derecha");
});

// ─── P03 (#354): el ejemplo resuelto, y su apagado por nivel ────────────────

caso("P03: el ejemplo es coherente — los pasos mostrados suman la respuesta", () => {
  for (const i of banco.filter((x) => x.habilidad === "P03" && x.enunciado.clave === "p.ejemplo.suma")) {
    const v = i.enunciado.vars;
    if (v.ad + v.bd !== v.sd || v.au + v.bu !== v.su || v.sd + v.su !== i.respuesta.valor) {
      throw new Error(`${i.id}: la descomposición no cuadra (${v.ad}+${v.bd}=${v.sd}, ${v.au}+${v.bu}=${v.su}, respuesta ${i.respuesta.valor})`);
    }
  }
  for (const i of banco.filter((x) => x.habilidad === "P03" && x.enunciado.clave === "p.ejemplo.resta")) {
    const v = i.enunciado.vars;
    if (v.a - v.bd !== v.paso1 || v.paso1 - v.bu !== i.respuesta.valor) {
      throw new Error(`${i.id}: la resta por partes no cuadra`);
    }
  }
});

caso("P03: se apaga por nivel — la reversión de la pericia no es opcional (#354, Kalyuga)", () => {
  es(TECHO_POR_HABILIDAD.P03, 4, "el techo declarado");
  for (const i of banco.filter((x) => x.habilidad === "P03")) {
    if (i.nivel > TECHO_POR_HABILIDAD.P03) throw new Error(`${i.id}: nivel ${i.nivel} por encima de su propio techo`);
  }
  for (const h of Object.keys(TECHO_POR_HABILIDAD)) {
    if (!(h in HABILIDADES_PRIMARIA)) throw new Error(`techo declarado para una habilidad que no existe: ${h}`);
  }
});

// ─── P04 (#355): aritméticas Y al menos dos tipos no aritméticos ────────────

caso("P04: hay progresiones aritméticas y DOS tipos no aritméticos (#355)", () => {
  const patrones = banco.filter((i) => i.habilidad === "P04");
  const geom = patrones.find((i) => i.errores.some((e) => e.causa === "error.p.siguio_sumando"));
  const cuad = patrones.find((i) => i.errores.some((e) => e.causa === "error.p.repitio_la_diferencia"));
  if (!geom) throw new Error("falta la familia geométrica (el error «siguió sumando»)");
  if (!cuad) throw new Error("falta la familia de cuadrados (el error «repitió la diferencia»)");
});

caso("P04: las tres familias diagnostican su error propio", () => {
  // Aritmética 2, 5, 8, 11 → 14; sumar dos pasos da 17.
  const ari = banco.find((i) => i.habilidad === "P04" && i.enunciado.vars.t1 === 2 && i.enunciado.vars.t2 === 5);
  if (!ari) throw new Error("no encontré 2, 5, 8, 11, …");
  es(ari.respuesta.valor, 14, "el que sigue");
  es(calificarRespuesta(ari, 17).causa, "error.p.sumo_dos_pasos", "dos pasos de una vez");

  // Geométrica 3, 6, 12, 24 → 48; seguir sumando da 36. Se fijan los cuatro
  // términos: «3, …, 24» también lo cumple una aritmética de paso 7.
  const geo = banco.find((i) => i.habilidad === "P04" && i.enunciado.vars.t1 === 3
    && i.enunciado.vars.t2 === 6 && i.enunciado.vars.t3 === 12 && i.enunciado.vars.t4 === 24);
  if (!geo) throw new Error("no encontré 3, 6, 12, 24, …");
  es(geo.respuesta.valor, 48, "el doble");
  es(calificarRespuesta(geo, 36).causa, "error.p.siguio_sumando", "sumó la última diferencia");

  // Cuadrados 1, 4, 9, 16 → 25; repetir la diferencia da 23. Se fijan los
  // cuatro términos: «1, …, 16» también lo cumple una aritmética de paso 5.
  const squ = banco.find((i) => i.habilidad === "P04" && i.enunciado.vars.t1 === 1
    && i.enunciado.vars.t2 === 4 && i.enunciado.vars.t3 === 9 && i.enunciado.vars.t4 === 16);
  if (!squ) throw new Error("no encontré 1, 4, 9, 16, …");
  es(squ.respuesta.valor, 25, "el siguiente cuadrado");
  es(calificarRespuesta(squ, 23).causa, "error.p.repitio_la_diferencia", "la diferencia crece de dos en dos");
});

console.log("");
if (fallos > 0) { console.error(`✗ ${fallos} de ${corridos} casos fallaron`); process.exit(1); }
console.log(`✓ ${corridos} casos del banco de primaria`);
