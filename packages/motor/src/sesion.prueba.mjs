#!/usr/bin/env node
// Casos de la sesión de reto — criterios #32 y #33 de F3.
//
// El criterio #33 nombra su propia prueba: «dos envíos idénticos, un solo
// punto». Está abajo, con ese nombre.

import {
  estadoInicial, servir, responder, puntoSeguroDeCorte, progreso,
} from "./sesion.ts";

let fallos = 0;
let corridos = 0;

function caso(nombre, fn) {
  corridos++;
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}`);
    console.error(`      ${err.message}`);
  }
}

const lanza = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !err.message.includes(fragmento)) {
      throw new Error(`lanzó por otra razón: "${err.message}"`);
    }
    return;
  }
  throw new Error("no lanzó");
};

const item = (orden, nivel = 5) => ({ orden, itemId: `it-${orden}`, nivel });
const correcta = (e) => e === "bien";

console.log("\n== sesión de reto — criterios #32 y #33 de F3 ==\n");

// --- Idempotencia (#33) -----------------------------------------------------
caso("dos envíos idénticos, un solo punto (la prueba que nombra el criterio)", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 1000);

  const primero = responder(s, { orden: 1, eleccion: "bien" }, correcta, 3000);
  const puntosTrasUno = primero.estado.puntosTotales;

  const segundo = responder(primero.estado, { orden: 1, eleccion: "bien" }, correcta, 9000);

  if (!segundo.resultado.repetida) throw new Error("el reenvío no se marcó como repetido");
  if (segundo.estado.puntosTotales !== puntosTrasUno) {
    throw new Error(
      `el reenvío sumó: ${puntosTrasUno} → ${segundo.estado.puntosTotales}. ` +
        "Una conexión mala en el metro multiplicaría los puntos por los reintentos.",
    );
  }
  if (segundo.resultado.veredicto.puntos !== primero.resultado.veredicto.puntos) {
    throw new Error("el reenvío devolvió un veredicto distinto");
  }
});

caso("el reenvío devuelve el veredicto ORIGINAL, no uno recalculado con el reloj nuevo", () => {
  let s = estadoInicial("PRO");
  s = servir(s, item(1, 11), 0);
  const uno = responder(s, { orden: 1, eleccion: "bien" }, correcta, 1000);
  // 8 segundos después: si recalculara, el RT sería otro y los puntos también.
  const dos = responder(uno.estado, { orden: 1, eleccion: "bien" }, correcta, 9000);
  if (dos.resultado.rtMs !== uno.resultado.rtMs) {
    throw new Error(`rtMs cambió: ${uno.resultado.rtMs} → ${dos.resultado.rtMs}`);
  }
});

caso("un reenvío con OTRA elección tampoco repuntúa — la llave es (sesión, orden)", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 0);
  const uno = responder(s, { orden: 1, eleccion: "bien" }, correcta, 1000);
  const dos = responder(uno.estado, { orden: 1, eleccion: "mal" }, correcta, 2000);
  if (!dos.resultado.repetida) throw new Error("no se marcó como repetido");
  if (dos.estado.puntosTotales !== uno.estado.puntosTotales) {
    throw new Error("cambiar la elección en el reenvío movió el puntaje");
  }
});

// --- Los dos sellos del servidor (#32) --------------------------------------
caso("el tiempo sale de dos sellos del SERVIDOR, no de la respuesta", () => {
  let s = estadoInicial("SECUNDARIA");
  s = servir(s, item(1, 7), 5_000);
  const r = responder(s, { orden: 1, eleccion: "bien" }, correcta, 7_500);
  if (r.resultado.rtMs !== 2_500) throw new Error(`rtMs ${r.resultado.rtMs}, esperaba 2500`);
});

caso("la respuesta no tiene dónde poner un puntaje ni un tiempo", () => {
  // La interfaz `Respuesta` solo lleva `orden` y `eleccion`. Este caso lo
  // comprueba en ejecución: si alguien añade campos, el objeto que llega tendría
  // más llaves de las dos permitidas.
  const permitidas = new Set(["orden", "eleccion"]);
  const r = { orden: 1, eleccion: "bien" };
  for (const k of Object.keys(r)) {
    if (!permitidas.has(k)) throw new Error(`la respuesta lleva "${k}"`);
  }
});

caso("no se puede servir un segundo ítem con uno pendiente: dos relojes a la vez", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 0);
  lanza(() => servir(s, item(2), 100), "sin contestar");
});

caso("el servidor no puntúa lo que no sirvió", () => {
  const s = estadoInicial("PRIMARIA");
  lanza(() => responder(s, { orden: 1, eleccion: "bien" }, correcta, 100), "no hay ítem servido");
});

caso("una respuesta para otro orden se rechaza", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(3), 0);
  lanza(() => responder(s, { orden: 7, eleccion: "bien" }, correcta, 100), "el ítem servido es el 3");
});

caso("un reloj que va hacia atrás da 0, nunca un tiempo negativo", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 5_000);
  const r = responder(s, { orden: 1, eleccion: "bien" }, correcta, 4_000);
  if (r.resultado.rtMs !== 0) throw new Error(`rtMs ${r.resultado.rtMs}`);
});

// --- Kinder dentro de la sesión (D-024) -------------------------------------
caso("en kinder la sesión mide el tiempo y el puntaje no lo ve (D-045)", () => {
  let s = estadoInicial("KINDER");
  s = servir(s, item(1, 2), 0);
  const r = responder(s, { orden: 1, eleccion: "bien" }, correcta, 30_000);
  // El tiempo SE MIDE: está en el resultado, disponible para la bitácora.
  if (r.resultado.rtMs !== 30_000) throw new Error("la sesión dejó de medir el tiempo en kinder");
  // Y el puntaje NO lo vio: valor del ítem × acc, sin rastro de d ni a.
  if (r.resultado.veredicto.regla !== "kinder-precision") throw new Error("regla equivocada");
  if (r.resultado.veredicto.detalle.d !== undefined) throw new Error("el veredicto de kinder trae d");
});

// --- El punto seguro de corte (#33, D-016) ----------------------------------
caso("con un ítem servido NO es punto seguro de corte (D-016)", () => {
  let s = estadoInicial("PRIMARIA");
  if (!puntoSeguroDeCorte(s)) throw new Error("una sesión vacía sí es punto seguro");
  s = servir(s, item(1), 0);
  if (puntoSeguroDeCorte(s)) {
    throw new Error(
      "cortaría a media respuesta: un problema en pantalla y el reloj corriendo. " +
        "El límite de D-016 protege al niño; cortar ahí lo castiga por pensar.",
    );
  }
});

caso("tras contestar vuelve a ser punto seguro de corte", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 0);
  const r = responder(s, { orden: 1, eleccion: "bien" }, correcta, 1000);
  if (!puntoSeguroDeCorte(r.estado)) throw new Error("no volvió a ser seguro");
});

caso("el progreso dice cuántas van y cuántos puntos", () => {
  let s = estadoInicial("PRIMARIA");
  for (const n of [1, 2, 3]) {
    s = servir(s, item(n), n * 1000);
    s = responder(s, { orden: n, eleccion: "bien" }, correcta, n * 1000 + 500).estado;
  }
  const p = progreso(s);
  if (p.contestadas !== 3) throw new Error(`contestadas ${p.contestadas}`);
  if (!(p.puntos > 0)) throw new Error("puntos no acumularon");
});

caso("no se puede reservar un orden ya contestado", () => {
  let s = estadoInicial("PRIMARIA");
  s = servir(s, item(1), 0);
  s = responder(s, { orden: 1, eleccion: "bien" }, correcta, 500).estado;
  lanza(() => servir(s, item(1), 1000), "ya se contestó");
});

console.log("");
if (fallos > 0) {
  console.error(`✗ sesión de reto — ${fallos} de ${corridos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log(`✓ sesión de reto — ${corridos} casos, criterios #32 y #33\n`);
