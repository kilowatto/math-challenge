#!/usr/bin/env node
// Auditor determinista — el puntaje se calcula en el servidor, nunca se recibe
//
// Hace cumplir: D-010, D-025, `mc-29` (integridad de la evaluación), `mc-32`.
//
// Por qué existe. D-010 define el motor de puntuación y D-025 dice que el
// tablero global ordena por puntos. Los dos dan por hecho algo que ninguna
// decisión escribe con todas sus letras porque parece obvio: **el puntaje lo
// calcula el servidor**. Lo obvio es exactamente lo que se rompe cuando alguien
// necesita que la interfaz "se sienta rápida" y manda el número ya hecho.
//
// El fallo tiene una propiedad fea: no se ve. Un cliente que manda
// `{ score: 999999 }` produce un tablero con un tramposo, no un error. Y como
// D-047 ya permite jugar sin conexión, va a existir de verdad una cola de
// intentos que sincroniza — y esa cola manda RESPUESTAS, no puntajes. La
// distinción es la regla entera.
//
// LO QUE NO PUEDE COMPROBAR: si el servidor calcula BIEN. Eso es
// `motor-puntuacion.mjs`, que compara la fórmula contra D-010. Aquí solo se
// vigila de dónde sale el número.

import { archivos, leer, informar, RAIZ } from "./lib/repo.mjs";

/** Endpoints: lo que corre en el servidor. */
const ES_SERVIDOR = /(\/api\/|\/functions\/|worker|server|\.server\.|durable)/i;

/** Un puntaje que viene de fuera. */
const LEE_DEL_CUERPO =
  /(?:const|let|var)?\s*\{[^}]*\b(score|puntaje|puntos|points|rating|theta|elo)\b[^}]*\}\s*=\s*await\s+(?:request|req|c\.req)\.json/i;

/** Ese mismo valor guardándose o publicándose. */
const LO_GUARDA =
  /\b(insert|update|put|save|guardar|writeDataPoint|prepare|bind|set)\w*\s*\(/i;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/);
const problemas = [];
const notas = [];
let endpoints = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  if (!ES_SERVIDOR.test(archivo)) continue;
  endpoints++;

  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].replace(/\/\/.*$/, "");
    if (!LEE_DEL_CUERPO.test(linea)) continue;

    // Leerlo no basta para bloquear: se puede leer para VALIDARLO contra el
    // recalculado, que es exactamente lo correcto. Se mira si en las 12 líneas
    // siguientes se guarda sin recalcular.
    const despues = lineas.slice(i + 1, i + 13).join("\n");
    const recalcula = /\b(calcular|compute|recompute|recalcul|motor|engine|puntuar|scoreOf)\w*\s*\(/i.test(despues);
    const guarda = LO_GUARDA.test(despues);

    if (guarda && !recalcula) {
      problemas.push(
        `${archivo}:${i + 1}: el puntaje llega del CLIENTE y se guarda sin recalcularlo — ` +
          `\`${linea.trim().slice(0, 80)}\`. ` +
          "D-010 y mc-29: el servidor calcula, el cliente manda respuestas. Un cliente que " +
          "manda `{ score: 999999 }` no produce un error, produce un tablero con un tramposo.",
      );
    } else if (recalcula) {
      notas.push(`${archivo}:${i + 1} recibe un puntaje y lo recalcula antes de guardar — correcto`);
    }
  }
}


// --- 2. El motor no viaja al navegador (criterio #32 de F3) ----------------
//
// La otra mitad de "el servidor califica": si la fórmula de D-010 se empaqueta
// en el JavaScript del cliente, cualquiera la lee, la entiende y sabe
// exactamente qué mandar. No es que el cliente pudiera puntuar — es que le
// entregamos el mapa.
//
// Se mira el JS que de verdad se sirve, no los imports del código fuente: un
// `import type` desaparece al compilar y un import normal no. La diferencia solo
// se ve en `dist`.
import { readdirSync, statSync } from "node:fs";

const FIRMAS_DEL_MOTOR = [
  [/2\s*\*\s*acc\s*-\s*1/, "la fórmula HSHS de D-010"],
  [/kinder-precision/, "la regla de kinder (D-024)"],
  [/1\.6\s*,\s*nivel\s*-\s*1|Math\.pow\(\s*1\.6/, "el valor del ítem 10 × 1.6^(n−1)"],
];

function jsDeCliente(dir, salida = []) {
  let entradas;
  try {
    entradas = readdirSync(dir, { withFileTypes: true });
  } catch {
    return salida;
  }
  for (const e of entradas) {
    const ruta = `${dir}/${e.name}`;
    // `_worker.js` es el servidor. Lo que viaja al navegador es todo lo demás.
    if (e.isDirectory()) {
      if (e.name === "_worker.js") continue;
      jsDeCliente(ruta, salida);
    } else if (e.name.endsWith(".js") || e.name.endsWith(".mjs")) {
      salida.push(ruta);
    }
  }
  return salida;
}

const bundles = jsDeCliente(`${RAIZ}apps/web/dist`);
for (const b of bundles) {
  const t = leer(b.slice(RAIZ.length)) ?? "";
  for (const [re, que] of FIRMAS_DEL_MOTOR) {
    if (re.test(t)) {
      problemas.push(
        `${b.slice(RAIZ.length)}: ${que} está en el bundle de CLIENTE. ` +
          "Criterio #32 de F3 y mc-29 impl. 12: la fórmula en el navegador es el mapa " +
          "para saber qué mandar. El motor se queda en el servidor.",
      );
    }
  }
}
notas.push(
  bundles.length > 0
    ? `${bundles.length} archivo(s) de JS de cliente revisados, ninguno con la fórmula`
    : "no hay dist/ construido: el motor en el cliente NO se comprobó en esta corrida",
);

if (endpoints === 0) {
  notas.push("todavía no hay endpoints de servidor con puntaje; el auditor espera al primero");
} else {
  notas.unshift(`${endpoints} archivo(s) de servidor revisados`);
}

informar({
  nombre: "puntaje-servidor",
  problemas,
  notas: notas.slice(0, 5),
  cita: "D-010, D-025, mc-29, mc-32",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s), ${endpoints} de servidor`,
  porQueBloquea:
    "un puntaje aceptado del cliente no genera un error, genera un tablero con un " +
    "tramposo — y el tablero es lo único de este producto que compara a un niño con otros.",
  noComprueba: [
    "si el servidor calcula BIEN. Eso lo hace motor-puntuacion.mjs contra D-010.",
    "la cola offline de D-047 cuando exista: tiene que sincronizar RESPUESTAS, nunca puntajes.",
  ],
});
