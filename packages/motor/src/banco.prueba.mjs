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
  // Se busca por PARÁMETROS y no por id literal. El id lleva dentro los ejes de
  // la plantilla, así que añadir uno —el contexto del enunciado— lo cambia
  // entero: `k11-3-4` pasó a `k11-3-4-0`. Un id escrito a mano en una prueba
  // convierte cada variación nueva del banco en una prueba rota que no señala
  // ningún defecto.
  const suma = banco.find(
    (i) => i.habilidad === "K11" && i.enunciado.vars.a === 3 && i.enunciado.vars.b === 4,
  );
  if (!suma) throw new Error("no encontré la suma 3 + 4");
  es(suma.respuesta.valor, 7);
  // Las dos causas con fuente (mc-06 §2): saltarse uno, y contar uno dos veces.
  es(calificarRespuesta(suma, 6).causa, "error.se_salto_uno", "6 = 7−1");
  es(calificarRespuesta(suma, 8).causa, "error.conto_uno_dos_veces", "8 = 7+1");
  // Y las borradas (plan F5 §3.4j) ya no se nombran: un 12 es hoy una
  // respuesta inesperada, no «multiplicaste» dicho a quien solo contó un montón.
  const multiplico = calificarRespuesta(suma, 12);
  es(multiplico.causa, null, "12 = 3×4 ya no tiene causa propia");
  es(multiplico.inesperada, true, "12 es inesperada");
});

caso("restar quitando: sumar tiene su causa, y NINGÚN distractor es negativo", () => {
  const resta = banco.find(
    (i) => i.habilidad === "K12" && i.enunciado.vars.a === 5 && i.enunciado.vars.b === 2,
  );
  if (!resta) throw new Error("no encontré la resta 5 − 2");
  es(resta.respuesta.valor, 3);
  es(calificarRespuesta(resta, 7).causa, "error.sumo");
  es(calificarRespuesta(resta, 2).causa, "error.conto_el_que_quita");
  es(calificarRespuesta(resta, 4).causa, "error.se_salto_uno");
  // `error.resto_al_reves` (b−a) era −3 aquí: un número negativo ofrecido a un
  // pre-lector en el 100% de la habilidad (rezagados §7, plan F5 §3.4j).
  const alReves = calificarRespuesta(resta, -3);
  es(alReves.causa, null, "b−a ya no es un error nombrado");
  es(alReves.inesperada, true);
});

caso("ninguna opción del banco es un número negativo (rezagados §7)", () => {
  // El distractor negativo de K12 sobrevivió una ronda entera de auditorías
  // porque b−a ES un número y los auditores buscaban cadenas. Este caso mira
  // los números.
  for (const i of banco) {
    const valores = [
      i.respuesta.valor,
      ...i.errores.map((e) => e.valor),
      ...(i.tambienCorrectas ?? []).map((c) => c.valor),
    ];
    for (const v of valores) {
      if (typeof v === "number" && v < 0) throw new Error(`${i.id}: la opción ${v} es negativa`);
    }
  }
});

caso("dos causas no comparten valor dentro de un ítem (plan F5 §4.1)", () => {
  // `calificarRespuesta` hace `.find()`: con dos causas sobre el mismo valor la
  // segunda es código muerto, y Larry puede explicar un error que el niño no
  // cometió (línea roja #7). Estuvo vivo en K05, K06, K08, K09 y K14.
  for (const i of banco) {
    const vistos = new Set();
    for (const e of i.errores) {
      const k = String(e.valor);
      if (vistos.has(k)) throw new Error(`${i.id}: dos causas con el valor ${k}`);
      vistos.add(k);
    }
  }
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

// ===========================================================================
// #349 — ninguna opción se sirve como identificador del código
// ===========================================================================
//
// El dueño jugó «¿Cuál no va con los demás?» y la pantalla le ofreció tres
// botones que decían `casilla3`, `casilla0` y `casilla1`. `validarItem` no
// podía verlo porque no había nada que mirar: el ítem no tenía dónde declarar
// cómo se dibuja una opción.
//
// Estos tres casos fallan sobre el banco anterior. El primero por 200 ítems.

caso("#349 · ninguna opción de cadena llega sin dibujo — `casilla3` no es un rótulo", () => {
  const malos = [];
  for (const i of banco) {
    const valores = [
      i.respuesta.valor,
      ...i.errores.map((e) => e.valor),
      ...(i.tambienCorrectas ?? []).map((c) => c.valor),
    ];
    for (const v of valores) {
      if (typeof v === "number") continue;
      const d = i.dibujos?.[String(v)];
      if (!d?.glifo || !d?.clave) malos.push(`${i.id}:${v}`);
    }
  }
  if (malos.length) {
    throw new Error(
      `${malos.length} opción(es) sin dibujo, así que solo se pueden pintar como su ` +
        `identificador. Las primeras: ${malos.slice(0, 4).join(", ")}`,
    );
  }
});

caso("#349 · toda clave de dibujo es una clave de mensaje, no una frase", () => {
  for (const i of banco) {
    for (const [v, d] of Object.entries(i.dibujos ?? {})) {
      if (/\s/.test(d.clave)) throw new Error(`${i.id}:${v} → "${d.clave}" es una frase`);
    }
  }
});

caso("#349 · en «cuál sobra» las CUATRO figuras son tocables, no tres de cuatro", () => {
  const sobra = banco.filter((i) => i.formato === "cual_sobra");
  if (sobra.length === 0) throw new Error("no hay ítems de cual_sobra que comprobar");
  for (const i of sobra) {
    const valores = new Set([
      String(i.respuesta.valor),
      ...i.errores.map((e) => String(e.valor)),
      ...(i.tambienCorrectas ?? []).map((c) => String(c.valor)),
    ]);
    if (valores.size !== 4) {
      throw new Error(
        `${i.id}: ${valores.size} opciones para 4 figuras dibujadas. Con una figura sin ` +
          "opción, la que falta o es siempre la buena o nunca lo es — el ítem filtra su " +
          `propia respuesta. Son: ${[...valores].join(", ")}`,
      );
    }
  }
  console.log(`      ${sobra.length} ítems de «cuál sobra», los cuatro tocables en todos`);
});

// ===========================================================================
// #349 (segunda parte) — la posición no puede predecir la respuesta
// ===========================================================================
//
// K07 ya cometió este fallo una vez —el montón mayor caía siempre a la
// derecha— y lo dejó escrito en su encabezado como advertencia. K13 lo estaba
// cometiendo igual y nadie lo vio, porque el otro defecto lo tapaba: las
// opciones eran ilegibles, así que «toca siempre la última» no era una
// estrategia que alguien pudiera descubrir. Al hacer tocables las cuatro
// figuras, habría acertado el 100% sin mirar la pantalla.
caso("#349 · en «cuál sobra» el intruso NO está siempre en la misma casilla", () => {
  const donde = new Set(
    banco.filter((i) => i.formato === "cual_sobra").map((i) => String(i.respuesta.valor)),
  );
  if (donde.size < 4) {
    throw new Error(
      `el intruso solo cae en ${donde.size} de 4 casillas (${[...donde].sort().join(", ")}). ` +
        "Tocar siempre la misma acierta sin mirar, que es lo que K07 dejó escrito que no " +
        "se repita.",
    );
  }
});

// El patrón tenía el mismo defecto con otra cara: la respuesta era `0` o `1`,
// el índice de la figura, y se pintaba tal cual. Peor que ilegible — parece
// contestable, porque el resto del banco sí pregunta números.
caso("#349 · lo que sigue en un patrón es una FIGURA, no su índice", () => {
  const patrones = banco.filter((i) => i.enunciado.clave.startsWith("k.patron."));
  if (patrones.length === 0) throw new Error("no hay ítems de patrón que comprobar");
  for (const i of patrones) {
    if (typeof i.respuesta.valor === "number") {
      throw new Error(
        `${i.id}: la respuesta es el número ${i.respuesta.valor}, que es el índice de una ` +
          "figura. Se pinta como «0» y nada en la pantalla dice qué figura era el 0.",
      );
    }
    if (!i.dibujos?.[String(i.respuesta.valor)]?.glifo) {
      throw new Error(`${i.id}: la respuesta "${i.respuesta.valor}" no tiene figura que dibujar`);
    }
  }
  console.log(`      ${patrones.length} ítems de patrón, todos con sus figuras`);
});

// ===========================================================================
// #347 — la cosa que se cuenta viaja con el ítem
// ===========================================================================
//
// La pantalla tenía `"🦆"` escrito en cinco sitios y el banco elige entre tres
// objetos: dos de cada tres ítems de contar pedían una cosa y enseñaban otra.
caso("#347 · todo ítem de contar dice QUÉ se cuenta", () => {
  const contar = banco.filter((i) => i.formato === "toca_para_contar");
  if (contar.length === 0) throw new Error("no hay ítems de contar que comprobar");
  const sinGlifo = contar.filter((i) => !i.enunciado.vars.glifo);
  if (sinGlifo.length) {
    throw new Error(
      `${sinGlifo.length} de ${contar.length} ítems de contar no traen glifo, así que la ` +
        `pantalla tiene que inventarlo. El primero: ${sinGlifo[0].id} ` +
        `(${sinGlifo[0].enunciado.clave})`,
    );
  }
});

caso("#347 · los tres objetos de contar salen de verdad, no solo el pato", () => {
  const glifos = new Set(
    banco.filter((i) => i.formato === "toca_para_contar").map((i) => i.enunciado.vars.glifo),
  );
  if (glifos.size < 3) {
    throw new Error(`solo ${glifos.size} objeto(s) distintos: ${[...glifos].join(" ")}`);
  }
  console.log(`      ${[...glifos].join(" ")} — tres objetos, tres claves de enunciado`);
});

console.log("");
if (fallos > 0) { console.error(`✗ banco — ${fallos} de ${corridos} fallaron\n`); process.exit(1); }
console.log(`✓ banco de kinder — ${corridos} casos\n`);
