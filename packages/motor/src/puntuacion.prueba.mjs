#!/usr/bin/env node
// Casos del motor de puntuación.
//
//     node packages/motor/src/puntuacion.prueba.mjs
//
// Por qué existen y por qué son tantos. La fórmula de D-010 es aritmética con un
// signo que decide si sumas o restas. Equivocar ese signo no rompe nada: produce
// un tablero injusto que nadie nota hasta que un niño pregunta por qué su
// hermano tiene más puntos con menos aciertos.
//
// Cada caso de abajo comprueba una afirmación de D-010 o D-024 que se puede
// citar. No hay casos de relleno.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  calificar, valorDelItem, PARAMETROS, pareceImposible, PISO_MS,
  NIVEL_MAXIMO, NIVELES_POR_BANDA,
} from "./puntuacion.ts";

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

const cerca = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const igual = (a, b, msg) => {
  if (!cerca(a, b)) throw new Error(`${msg ?? "valor"}: esperaba ${b}, obtuve ${a}`);
};
const lanza = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !err.message.includes(fragmento)) {
      throw new Error(`lanzó, pero por otra razón: "${err.message}"`);
    }
    return;
  }
  throw new Error("no lanzó");
};

console.log("\n== motor de puntuación — D-010 y D-024 ==\n");

// --- El valor del ítem ------------------------------------------------------
caso("los vectores de D-010: N1=10, N2=16, N8=268, N9=429, N12=1759", () => {
  // Los cinco que el criterio de F3 escribe con nombre y apellido. Redondeados
  // como los escribe el criterio; la fórmula da decimales.
  igual(valorDelItem(1), 10, "N1");
  igual(valorDelItem(2), 16, "N2");
  igual(Math.round(valorDelItem(8)), 268, "N8");
  igual(Math.round(valorDelItem(9)), 429, "N9");
  igual(Math.round(valorDelItem(12)), 1759, "N12");
});

caso("un nivel 8 vale como ~30 sumas de nivel 1 — ninguna estrategia domina", () => {
  const razon = valorDelItem(8) / valorDelItem(1);
  if (razon < 25 || razon > 32) throw new Error(`razón ${razon.toFixed(1)}, D-010 dice ~30`);
});

caso("calificar() PESA por dificultad en HSHS — no solo valorDelItem() (bug #189)", () => {
  // El caso de arriba comprobaba `valorDelItem(8) / valorDelItem(1)` **en
  // aislamiento**, y por eso pasó en verde mientras `calificar()` ignoraba el
  // peso por completo. Es la misma forma del error que ya vivió aquí con la
  // escalera de 10 niveles: la prueba defendía el bug en vez de cazarlo.
  //
  // Este mira lo que de verdad se le da a un niño: el resultado de `calificar`.
  const p = (n) => calificar({ banda: "PRIMARIA", nivel: n, acc: 1, rtMs: 10000 }).puntos;

  const razon = p(8) / p(1);
  if (razon < 25 || razon > 32) {
    throw new Error(
      `un nivel 8 puntúa ${razon.toFixed(1)}× un nivel 1 y D-010 pide ~30. ` +
        "Con razón 1, moler nivel 1 es estrictamente dominante: más ítems por " +
        "minuto y los mismos puntos por ítem.",
    );
  }
  if (!(p(12) > p(8))) throw new Error("un nivel 12 tiene que valer más que un nivel 8");
  if (!(p(2) > p(1))) throw new Error("la escalera tiene que ser monótona");
  if (!(p(8) > p(1) * 20)) throw new Error("un ítem difícil no se compensa con veinte fáciles");

  // El peso también se aplica al castigo: adivinar en un nivel alto cuesta más.
  const f = (n) => calificar({ banda: "PRIMARIA", nivel: n, acc: 0, rtMs: 1000 }).puntos;
  if (!(f(8) < f(1))) throw new Error("fallar en nivel 8 tiene que restar más que en nivel 1");
});

caso("la escalera de D-017 son DOCE niveles, no diez", () => {
  // Este caso empezó afirmando 1..10 y estaba mal: rechazaba N11 y N12, que son
  // exactamente los de PRO según D-017. El criterio de F3 lo cazó al listar
  // N12 = 1,759 como vector. La prueba codificaba el error, no la decisión.
  if (NIVEL_MAXIMO !== 12) throw new Error(`NIVEL_MAXIMO es ${NIVEL_MAXIMO}, D-017 dice 12`);
  valorDelItem(11);
  valorDelItem(12);
  lanza(() => valorDelItem(0), "escalera");
  lanza(() => valorDelItem(13), "escalera");
  lanza(() => valorDelItem(2.5), "escalera");
});

caso("cada banda cubre los niveles que le da D-017, y se traslapan a propósito", () => {
  const esperado = {
    KINDER: [1, 3], PRIMARIA: [3, 6], SECUNDARIA: [6, 8],
    SERIO: [8, 10], JR: [11, 12], PRO: [11, 12],
  };
  for (const [banda, [min, max]] of Object.entries(esperado)) {
    const r = NIVELES_POR_BANDA[banda];
    if (r.min !== min || r.max !== max) {
      throw new Error(`${banda}: N${r.min}–N${r.max}, D-017 dice N${min}–N${max}`);
    }
  }
  // El traslape es la decisión, no un descuido: un niño de 7 años puede estar
  // en N3 igual que uno de 6, porque la banda es el tema visual y el nivel la
  // dificultad, y D-017 los mueve por separado.
  if (NIVELES_POR_BANDA.KINDER.max !== NIVELES_POR_BANDA.PRIMARIA.min) {
    throw new Error("KINDER y PRIMARIA dejaron de traslaparse en N3");
  }
});

// --- Kinder: solo precisión (D-024) ----------------------------------------
caso("kinder puntúa valor · acc, sin tiempo (D-024)", () => {
  const v = calificar({ banda: "KINDER", nivel: 1, acc: 1 });
  igual(v.puntos, 10);
  if (v.regla !== "kinder-precision") throw new Error(`regla ${v.regla}`);
});

caso("kinder que falla saca 0, no un número negativo (D-024)", () => {
  const v = calificar({ banda: "KINDER", nivel: 3, acc: 0 });
  igual(v.puntos, 0);
});

caso("kinder RECHAZA que le llegue el tiempo (D-024, D-045)", () => {
  lanza(() => calificar({ banda: "KINDER", nivel: 1, acc: 1, rtMs: 5000 }), "no recibe tiempo");
});

caso("el veredicto de kinder no expone d ni a: no existen para esa banda", () => {
  const v = calificar({ banda: "KINDER", nivel: 2, acc: 1 });
  if (v.detalle.d !== undefined || v.detalle.a !== undefined) {
    throw new Error("el detalle de kinder trae parámetros de velocidad");
  }
});

caso("KINDER no tiene fila en PARAMETROS — el bug de a=0 no se puede reescribir", () => {
  if ("KINDER" in PARAMETROS) {
    throw new Error(
      "KINDER está en PARAMETROS. D-010 lo intentó con a=0 y da CERO para toda " +
        "respuesta, correcta o incorrecta: no es puntuar sin cronometrar, es no puntuar.",
    );
  }
});

// --- De primaria a Pro: HSHS (D-010) ---------------------------------------
caso("primaria acierta al instante: a · d · 1", () => {
  const v = calificar({ banda: "PRIMARIA", nivel: 1, acc: 1, rtMs: 0 });
  igual(v.puntos, 0.3 * 60); // 18
});

caso("fallar RÁPIDO resta más que fallar lento — el castigo está en la fórmula", () => {
  const rapido = calificar({ banda: "PRIMARIA", nivel: 1, acc: 0, rtMs: 1000 }).puntos;
  const lento = calificar({ banda: "PRIMARIA", nivel: 1, acc: 0, rtMs: 50_000 }).puntos;
  if (!(rapido < lento)) {
    throw new Error(`fallar rápido (${rapido}) debería restar MÁS que fallar lento (${lento})`);
  }
  if (rapido >= 0) throw new Error("fallar tiene que restar");
});

caso("acertar siempre suma o empata, nunca resta, por lento que sea", () => {
  for (const banda of ["PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"]) {
    for (const rtMs of [0, 5_000, 60_000, 600_000]) {
      const p = calificar({ banda, nivel: 5, acc: 1, rtMs }).puntos;
      if (p < 0) {
        throw new Error(
          `${banda} a ${rtMs}ms dio ${p}: una respuesta CORRECTA no puede restar. ` +
            "Sin acotar RT a d, (d − RT) se vuelve negativo y castiga a quien piensa.",
        );
      }
    }
  }
});

caso("pasarse del tiempo permitido da 0, no un negativo (el tope de RT)", () => {
  const v = calificar({ banda: "PRO", nivel: 1, acc: 1, rtMs: 999_999 });
  igual(v.puntos, 0);
});

caso("las bandas rápidas premian más la velocidad (a sube, d baja)", () => {
  const bandas = ["PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"];
  for (let i = 1; i < bandas.length; i++) {
    const antes = PARAMETROS[bandas[i - 1]];
    const ahora = PARAMETROS[bandas[i]];
    if (!(ahora.a > antes.a)) throw new Error(`a no sube de ${bandas[i - 1]} a ${bandas[i]}`);
    if (!(ahora.d < antes.d)) throw new Error(`d no baja de ${bandas[i - 1]} a ${bandas[i]}`);
  }
});

caso("una banda con tiempo EXIGE rtMs; no se inventa un valor por omisión", () => {
  lanza(() => calificar({ banda: "PRIMARIA", nivel: 1, acc: 1 }), "no llegó rtMs");
});

caso("acc solo es 1 o 0 (D-010, D-048)", () => {
  lanza(() => calificar({ banda: "PRIMARIA", nivel: 1, acc: 0.5, rtMs: 100 }), "1 o 0");
});

caso("rtMs negativo o no finito se rechaza", () => {
  lanza(() => calificar({ banda: "PRIMARIA", nivel: 1, acc: 1, rtMs: -5 }), "inválido");
  lanza(() => calificar({ banda: "PRIMARIA", nivel: 1, acc: 1, rtMs: NaN }), "inválido");
});

// --- El piso de tiempo (mc-29) ---------------------------------------------
caso("el piso marca lo imposible pero NO cambia el puntaje (mc-29, línea roja #7)", () => {
  const rapidisimo = { banda: "PRIMARIA", nivel: 1, acc: 1, rtMs: 10 };
  if (!pareceImposible(rapidisimo.rtMs)) throw new Error("10ms debería marcarse");
  const conMarca = calificar(rapidisimo).puntos;
  const sinMarca = calificar({ ...rapidisimo, rtMs: PISO_MS + 1 }).puntos;
  // Son distintos por el tiempo, no por la marca: se compara contra la fórmula.
  igual(conMarca, 0.3 * (60 - 0.01));
  if (conMarca <= sinMarca) throw new Error("la marca no debe penalizar, y aquí penalizó");
});

caso("sin tiempo no hay nada que marcar", () => {
  if (pareceImposible(undefined)) throw new Error("undefined no es imposible, es kinder");
});

// --- Informe ----------------------------------------------------------------
console.log("");
if (fallos > 0) {
  console.error(`✗ motor de puntuación — ${fallos} de ${corridos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log(`✓ motor de puntuación — ${corridos} casos, D-010 y D-024\n`);
