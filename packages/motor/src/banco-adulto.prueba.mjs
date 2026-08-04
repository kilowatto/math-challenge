#!/usr/bin/env node
// Casos del banco de la franja adulta (SERIO) — F5b #159–#167, D-034, mc-36, mc-40.
//
//     node --experimental-strip-types packages/motor/src/banco-adulto.prueba.mjs
//
// Lo que estos casos defienden no rompe nada visible al romperse: un
// distractor que no corresponde a ningún error real sigue siendo un número, y
// una media cuya «mediana» distractor coincide con la respuesta pasa toda
// revisión de tipos. Se descubre cuando Larry le explica a alguien un error
// que no cometió — igual que en kinder (#166).
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  generarBancoAdulto,
  PLANTILLAS_ADULTO,
  HABILIDADES_ADULTO,
  proporcionDePlantilla,
} from "./banco-adulto.ts";
import { validarItem, calificarRespuesta } from "./item.ts";

let fallos = 0, corridos = 0;
function caso(n, fn) { corridos++; try { fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== banco de la franja adulta (SERIO) — F5b #159–#167 ==\n");
const banco = generarBancoAdulto();

caso("la franja cabe en su nombre: ~150 ítems, nunca más de 200 (D-034, #161)", () => {
  if (banco.length < 100) throw new Error(`solo ${banco.length}: la franja mínima no alcanza para un club`);
  if (banco.length > 200) throw new Error(`${banco.length} ítems: «mínima» se convirtió en segunda banda`);
  console.log(`      ${banco.length} ítems`);
});

caso("todo ítem vive en N8–N10: es una franja, no una banda (D-017, D-034)", () => {
  for (const i of banco) {
    if (i.nivel < 8 || i.nivel > 10) throw new Error(`${i.id}: nivel ${i.nivel} fuera de la franja N8–N10`);
  }
  const porNivel = {};
  for (const i of banco) porNivel[i.nivel] = (porNivel[i.nivel] ?? 0) + 1;
  for (const n of [8, 9, 10]) {
    if (!porNivel[n]) throw new Error(`N${n} quedó vacío: la franja tiene un escalón hueco`);
  }
  console.log(`      N8: ${porNivel[8]} · N9: ${porNivel[9]} · N10: ${porNivel[10]}`);
});

caso("la proporción de plantilla se MIDE y queda en el rango que mc-40 documenta (#165)", () => {
  const p = proporcionDePlantilla();
  es(p.total, banco.length, "el conteo de tipos cubre todo el banco");
  const pct = (100 * p.parametrica) / p.total;
  // mc-40: 20–35% paramétrico en N8–N10. Fuera de rango no bloquea el ítem,
  // bloquea la PROMESA de costo — por eso es caso y no nota.
  if (pct < 15 || pct > 40) {
    throw new Error(`paramétrico ${pct.toFixed(1)}% — mc-40 documenta 20–35% en esta franja; fuera de eso, el costo de autoría se está contando mal`);
  }
  console.log(`      ${p.parametrica} de plantilla + ${p.manual} a mano = ${pct.toFixed(1)}% paramétrico`);
});

caso("TODOS los ítems generados son válidos (validarItem, #166)", () => {
  const malos = banco.map((i) => ({ i, p: validarItem(i) })).filter((x) => x.p.length);
  if (malos.length) throw new Error(`${malos.length} inválidos; el primero (${malos[0].i.id}): ${malos[0].p.join(" | ")}`);
});

caso("ningún id se repite y la generación es determinista", () => {
  es(new Set(banco.map((i) => i.id)).size, banco.length, "ids únicos");
  es(
    JSON.stringify(generarBancoAdulto().map((i) => i.id)),
    JSON.stringify(banco.map((i) => i.id)),
    "dos corridas",
  );
});

caso("todo ítem tiene al menos 2 distractores, ninguno igual a la respuesta", () => {
  for (const i of banco) {
    if (i.errores.length < 2) throw new Error(`${i.id}: ${i.errores.length} distractor(es)`);
    for (const e of i.errores) {
      if (String(e.valor) === String(i.respuesta.valor)) throw new Error(`${i.id}: distractor = respuesta (${e.valor})`);
      if (typeof e.valor === "number" && !Number.isFinite(e.valor)) throw new Error(`${i.id}: distractor no finito`);
    }
  }
});

caso("las trece habilidades declaradas tienen ítems, y ninguna plantilla quedó huérfana", () => {
  for (const h of Object.keys(HABILIDADES_ADULTO)) {
    const n = banco.filter((i) => i.habilidad === h).length;
    if (n === 0) throw new Error(`${h} (${HABILIDADES_ADULTO[h]}): cero ítems — existe en el catálogo y nadie la sirve`);
  }
  for (const p of PLANTILLAS_ADULTO) {
    if (!(p.habilidad in HABILIDADES_ADULTO)) throw new Error(`plantilla huérfana: ${p.habilidad} no está declarada`);
    if (p.parametros().length === 0) throw new Error(`${p.habilidad} (${p.tipo}): parametros() vacío — una plantilla que no genera nada`);
  }
});

caso("sin Sabana, sin historia, sin contexto: la franja es del club, no del sendero (#163, D-034)", () => {
  for (const i of banco) {
    if (i.contexto) throw new Error(`${i.id}: tiene contexto — la franja no referencia lugares de la Sabana`);
    if (i.formato !== "toca_la_respuesta") throw new Error(`${i.id}: formato ${i.formato} — la franja usa el formato que funciona en producción`);
    if (/sabana|historia|sendero/i.test(i.id) || /sabana|historia|sendero/i.test(i.enunciado.clave)) {
      throw new Error(`${i.id}: referencia a la Sabana en el id o la clave`);
    }
  }
});

caso("una sola autoría: cada ítem tiene UNA clave y sus números viajan como vars (#162)", () => {
  for (const i of banco) {
    if (!/^a\.[a-z._]+$/.test(i.enunciado.clave)) throw new Error(`${i.id}: clave ${i.enunciado.clave} fuera del espacio a.*`);
    for (const [k, v] of Object.entries(i.enunciado.vars)) {
      if (typeof v !== "number") throw new Error(`${i.id}: vars.${k} no es número — el texto no va en la estructura`);
    }
  }
});

// ─── A01/A02: los errores del porcentaje son REALES y calculables ───────────

caso("A01: los tres distractores son los tres errores documentados del porcentaje", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.pct.de");
  if (items.length < 10) throw new Error(`solo ${items.length} ítems de porcentaje directo`);
  for (const i of items) {
    const { p, n } = i.enunciado.vars;
    const r = (n * p) / 100;
    es(i.respuesta.valor, r, `${i.id}: la respuesta`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.pct_coma_corrida"), (n * p) / 10, `${i.id}: ÷10 en vez de ÷100`);
    es(porCausa.get("error.a.pct_dividio_de_mas"), (n * p) / 1000, `${i.id}: ÷1000`);
    es(porCausa.get("error.a.pct_resto_puntos"), n - p, `${i.id}: restó los puntos`);
  }
});

caso("A02: el descuento cobra el paso que falta — el precio final, no el descuento", () => {
  const descuentos = banco.filter((i) => i.enunciado.clave === "a.pct.descuento");
  const aumentos = banco.filter((i) => i.enunciado.clave === "a.pct.aumento");
  if (descuentos.length < 8 || aumentos.length < 3) throw new Error(`${descuentos.length} descuentos, ${aumentos.length} aumentos`);
  for (const i of descuentos) {
    const { n, p } = i.enunciado.vars;
    es(i.respuesta.valor, n - (n * p) / 100, `${i.id}: el precio final`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.pct_solo_el_porcentaje"), (n * p) / 100, `${i.id}: contestó el descuento`);
    es(porCausa.get("error.a.pct_sumo_en_vez_de_quitar"), n + (n * p) / 100, `${i.id}: sumó el descuento`);
  }
  for (const i of aumentos) {
    const { n, p } = i.enunciado.vars;
    es(i.respuesta.valor, n + (n * p) / 100, `${i.id}: el total con propina`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.pct_quito_en_vez_de_sumar"), n - (n * p) / 100, `${i.id}: quitó la propina`);
  }
});

// ─── A03: la fracción como operador, y «pegar las cifras» ───────────────────

caso("A03: «3/4 de n» — el complemento y la fracción invertida son errores con botón", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.frac.de");
  if (items.length < 6) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, b, n } = i.enunciado.vars;
    const r = (n * a) / b;
    es(i.respuesta.valor, r, `${i.id}: la respuesta`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    // El complemento solo es distractor distinto cuando la fracción no es «b−1/b»
    // ni «1/b» — ahí colapsa con «sin numerador» y se filtra a propósito.
    if (a !== 1 && a !== b - 1) es(porCausa.get("error.a.frac_complemento"), n - r, `${i.id}: el complemento`);
    es(porCausa.get("error.a.frac_sin_numerador"), n / b, `${i.id}: se quedó en la división`);
  }
});

caso("A03: «1/4 como decimal» — 1,4 es EL error, y la invertida solo cuando termina", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.frac.decimal");
  if (items.length < 5) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, b } = i.enunciado.vars;
    es(i.respuesta.valor, a / b, `${i.id}: el decimal`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.frac_pegada"), a + b / 10, `${i.id}: pegó las cifras`);
    // Un decimal no terminante no es un botón honesto: si 1/3 → 0,333… nunca es
    // distractor, «b/a» tampoco puede serlo cuando no termina.
    const reves = b / a;
    if (Number.isFinite(reves) && Math.abs(reves - Math.round(reves * 10000) / 10000) < 1e-12 && String(reves).length <= 6) {
      if (!porCausa.has("error.a.frac_reves_decimal")) throw new Error(`${i.id}: b/a termina (${reves}) y no se ofrece`);
    }
  }
});

// ─── A04: el error aditivo, siempre presente ────────────────────────────────

caso("A04: el razonamiento aditivo tiene botón en TODOS los ítems de regla de tres", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.prop.maquina");
  if (items.length < 8) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, c, b } = i.enunciado.vars;
    es(i.respuesta.valor, (c * b) / a, `${i.id}: la proporción`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.prop_aditivo"), c + (b - a), `${i.id}: sumó la diferencia`);
  }
});

// ─── A06: el orden de operaciones, y el día que coincide no diagnostica ─────

caso("A06: el error de izquierda a derecha NUNCA coincide con la respuesta", () => {
  for (const i of banco.filter((x) => x.enunciado.clave === "a.orden.suma_mult")) {
    const { a, b, c } = i.enunciado.vars;
    const izquierda = (a + b) * c;
    if (izquierda === i.respuesta.valor) {
      throw new Error(`${i.id}: izquierda-a-derecha da la respuesta — el ítem no diagnostica el convenio`);
    }
    es(calificarRespuesta(i, izquierda).causa, "error.a.orden_izquierda", `${i.id}: el error clásico`);
  }
  for (const i of banco.filter((x) => x.enunciado.clave === "a.orden.parentesis")) {
    const { a, b, c } = i.enunciado.vars;
    es(calificarRespuesta(i, a + b * c).causa, "error.a.orden_ignoro_parentesis", `${i.id}: ignoró el paréntesis`);
  }
});

// ─── A07: los negativos son botones honestos en esta banda ──────────────────

caso("A07: las reglas de signos se califican con su causa, incluidos los resultados negativos", () => {
  const suma = banco.find((i) => i.enunciado.clave === "a.enteros.suma" && i.respuesta.valor < 0);
  if (!suma) throw new Error("ningún (−a) + b da negativo: la mitad de la habilidad no se ejercita");
  const { a, b } = suma.enunciado.vars;
  es(suma.respuesta.valor, b - a, "la suma con signo");
  es(calificarRespuesta(suma, a + b).causa, "error.a.signo_ignoro", "ignoró el menos");
  es(calificarRespuesta(suma, -(b - a)).causa, "error.a.signo_al_reves", "el signo al revés");

  const mult = banco.find((i) => i.enunciado.clave === "a.enteros.mult");
  if (!mult) throw new Error("falta la multiplicación con signo");
  const v = mult.enunciado.vars;
  es(mult.respuesta.valor, -(v.a * v.b), "menos por más");
  es(calificarRespuesta(mult, v.a * v.b).causa, "error.a.signo_menos_por_mas", "perdió el signo");

  const resta = banco.find((i) => i.enunciado.clave === "a.enteros.resta");
  if (!resta) throw new Error("falta restar un negativo");
  const w = resta.enunciado.vars;
  es(resta.respuesta.valor, w.a + w.b, "restar un negativo es sumar");
  es(calificarRespuesta(resta, w.a - w.b).causa, "error.a.signo_resta_doble", "lo restó como positivo");
});

// ─── A08: el despeje, en el orden correcto ──────────────────────────────────

caso("A08: los dos pasos se hacen en orden, y el orden inverso es distractor calculado", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.ecu.dos_pasos_suma");
  if (items.length < 4) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { m, b, c } = i.enunciado.vars;
    es(i.respuesta.valor, (c - b) / m, `${i.id}: el despeje`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.ecu_no_dividio"), c - b, `${i.id}: no dividió`);
    es(porCausa.get("error.a.ecu_sumo_en_vez_de_restar"), (c + b) / m, `${i.id}: movió sumando`);
    // Estos cinco se escogieron para que c/m sea entero: el orden inverso da un
    // número tentador y equivocado — si no terminara, el distractor no existiría.
    es(porCausa.get("error.a.ecu_orden_inverso"), c / m - b, `${i.id}: dividió primero`);
  }
});

// ─── A09: la mediana como distractor exige listas escogidas a mano ──────────

caso("A09: en TODA lista la mediana es entera y NO es la media — si no, no diagnostica", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.media.lista");
  if (items.length < 4) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { t1, t2, t3, t4 } = i.enunciado.vars;
    const orden = [t1, t2, t3, t4].sort((x, y) => x - y);
    const mediana = (orden[1] + orden[2]) / 2;
    if (!Number.isInteger(mediana)) throw new Error(`${i.id}: la mediana no es entera — el distractor se filtró solo`);
    if (mediana === i.respuesta.valor) throw new Error(`${i.id}: media = mediana — confundirlas no tiene botón`);
    es(calificarRespuesta(i, mediana).causa, "error.a.media_mediana", `${i.id}: confundió con la mediana`);
  }
});

// ─── A10: la estimación tiene contrato distinto — y sus errores son de orden ─

caso("A10: la mejor estimación es la de los dos números redondeados, con el orden de magnitud vigilado", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.est.producto");
  if (items.length < 5) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, b } = i.enunciado.vars;
    const r = Math.round(a / 10) * 10 * (Math.round(b / 10) * 10);
    es(i.respuesta.valor, r, `${i.id}: la estimación`);
    const porCausa = new Map(i.errores.map((e) => [e.causa, e.valor]));
    es(porCausa.get("error.a.est_orden_menor"), r / 10, `${i.id}: diez veces abajo`);
    es(porCausa.get("error.a.est_orden_mayor"), r * 10, `${i.id}: diez veces arriba`);
    es(porCausa.get("error.a.est_a_la_baja"), Math.floor(a / 10) * 10 * (Math.floor(b / 10) * 10), `${i.id}: todo a la baja`);
  }
});

// ─── A11: mcd contra mcm, la confusión con nombre ───────────────────────────

caso("A11: «multiplicar los dos» nunca da el mcm en estas parejas — comparten factor a propósito", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.div.mcm");
  if (items.length < 3) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, b } = i.enunciado.vars;
    if (a * b === i.respuesta.valor) throw new Error(`${i.id}: el producto ES el mcm — el atajo funciona y el ítem no enseña`);
    es(calificarRespuesta(i, a * b).causa, "error.a.mcm_producto", `${i.id}: multiplicó los dos`);
  }
  const mcds = banco.filter((i) => i.enunciado.clave === "a.div.mcd");
  for (const i of mcds) {
    const { a, b } = i.enunciado.vars;
    const r = i.respuesta.valor;
    if (a % r !== 0 || b % r !== 0) throw new Error(`${i.id}: ${r} no divide a los dos`);
    if (r > Math.min(a, b)) throw new Error(`${i.id}: el mcd no puede superar al menor`);
    es(calificarRespuesta(i, (a * b) / r).causa, "error.a.mcd_confundio_mcm", `${i.id}: dio el mcm`);
  }
});

// ─── A12: las reglas se comprueban contra TODOS los términos ────────────────

caso("A12: la respuesta es coherente con los cuatro términos mostrados", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.sec.sigue");
  if (items.length < 9) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { t1, t2, t3, t4 } = i.enunciado.vars;
    const fib = t3 === t1 + t2 && t4 === t2 + t3;
    const geo = t2 === t1 * 3 && t3 === t2 * 3 && t4 === t3 * 3;
    if (fib) es(i.respuesta.valor, t3 + t4, `${i.id}: fibonáccica`);
    else if (geo) es(i.respuesta.valor, t4 * 3, `${i.id}: geométrica ×3`);
    // Las mixtas traen su respuesta declarada a mano (n²+1, ×2+1, primos): no
    // hay fórmula común que comprobar — la revisión humana es la comprobación.
  }
});

// ─── A13: la división exacta, y el signo que viaja por locale ───────────────

caso("A13: toda división es exacta y el múltiplo vecino queda a uno", () => {
  const items = banco.filter((i) => i.enunciado.clave === "a.div.exacta");
  if (items.length < 8) throw new Error(`solo ${items.length}`);
  for (const i of items) {
    const { a, b } = i.enunciado.vars;
    if (!Number.isInteger(a / b)) throw new Error(`${i.id}: ${a}/${b} no es exacta — promete «exacta» en el enunciado`);
    es(i.respuesta.valor, a / b, `${i.id}: el cociente`);
    es(calificarRespuesta(i, a / b - 1).causa, "error.a.div_multiplo_vecino", `${i.id}: el múltiplo de abajo`);
  }
});

console.log("");
if (fallos > 0) { console.error(`✗ ${fallos} de ${corridos} casos fallaron`); process.exit(1); }
console.log(`✓ ${corridos} casos del banco de la franja adulta`);
