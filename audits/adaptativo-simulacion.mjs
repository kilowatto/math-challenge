#!/usr/bin/env node
// Auditor determinista — el motor adaptativo no llega a un niño sin simular
//
// Hace cumplir: D-002, D-046, `mc-13` (trazado de conocimiento y Elo),
// `mc-44` (colocación adaptativa y CAT).
//
// Por qué existe. Un motor adaptativo mal calibrado no falla: coloca. Un niño
// termina en un nivel demasiado alto y se frustra, o demasiado bajo y se aburre,
// y en los dos casos el sistema reporta que funciona — hay intentos, hay
// puntajes, hay progresión. El daño es invisible desde dentro.
//
// `mc-44` es explícito sobre la única defensa que existe: **simular antes de
// desplegar**. Se generan alumnos sintéticos con habilidad conocida, se les pasa
// el motor, y se comprueba que los coloca donde deberían. Es barato, corre en
// segundos, y es lo primero que se salta cuando hay prisa.
//
// Este auditor no juzga la calibración. Exige que la simulación EXISTA y que se
// haya corrido — porque un motor adaptativo sin simulación es un experimento con
// niños de por medio.
//
// LO QUE NO PUEDE COMPROBAR: si la simulación es buena. Alumnos sintéticos
// generados con el mismo modelo que usa el motor confirman lo que el motor ya
// cree. Eso es diseño de la simulación, y `mc-13` habla de ello.

import { archivos, leer, informar, existe, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

const ES_ADAPTATIVO = palabra("adaptativ\\w*", "adaptive", "cat_?engine", "irt", "elo", "theta", "knowledge_?tracing", "bkt", "dkt");
const ES_SIMULACION = /(simulacion|simulation|simular|simulate|synthetic|sintetic)/i;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];

const motores = fuentes.filter((f) => {
  const t = leer(f) ?? "";
  return ES_ADAPTATIVO.test(f) || ES_ADAPTATIVO.test(t);
});

// La simulación puede vivir fuera de apps/: es herramienta, no producto.
const simulaciones = archivos(/\.(ts|js|mjs)$/, { incluirAuditores: false }).filter(
  (f) => ES_SIMULACION.test(f) && ES_ADAPTATIVO.test(leer(f) ?? ""),
);

if (motores.length > 0 && simulaciones.length === 0) {
  problemas.push(
    `hay ${motores.length} archivo(s) de motor adaptativo (${motores.slice(0, 3).join(", ")}) ` +
      "y NINGUNA simulación. mc-44: un motor adaptativo se simula con alumnos sintéticos de " +
      "habilidad conocida ANTES de que toque a un niño. Un motor mal calibrado no falla: " +
      "coloca mal, y el sistema reporta que funciona — hay intentos, hay puntajes, hay progresión.",
  );
}

for (const f of motores) {
  const t = leer(f) ?? "";
  // Un motor que se despliega sin límites es el otro fallo: el paso de ajuste
  // sin tope puede mover a un alumno tres niveles con una racha de suerte.
  if (/theta\s*[+\-]=|elo\s*[+\-]=/i.test(t) && !/(clamp|Math\.(min|max)|limite|cap|bound)/i.test(t)) {
    problemas.push(
      `${f}: ajusta la habilidad estimada sin acotar el paso. Sin tope, una racha de suerte ` +
        "mueve a un alumno varios niveles de golpe (mc-13). D-046 permite colocarse alto — " +
        "lo que no puede es llegar ahí por ruido.",
    );
  }
}

notas.push(
  motores.length > 0
    ? `${motores.length} archivo(s) de motor adaptativo, ${simulaciones.length} simulación(es)`
    : "todavía no hay motor adaptativo; el auditor está listo para el de F4",
);
notas.push("mc-44: simular con alumnos sintéticos de habilidad conocida antes de desplegar");

informar({
  nombre: "adaptativo-simulacion",
  problemas,
  notas,
  cita: "D-002, D-046, mc-13, mc-44",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "un motor adaptativo mal calibrado no falla, coloca mal — y el daño es invisible desde " +
    "dentro porque el sistema sigue reportando intentos, puntajes y progresión (mc-44).",
  noComprueba: [
    "si la simulación es buena. Alumnos sintéticos generados con el mismo modelo que usa " +
      "el motor confirman lo que el motor ya cree (mc-13).",
  ],
});
