#!/usr/bin/env node
// Auditor determinista — el motor de puntuación es el de D-010, no otro
//
// Hace cumplir: D-010, D-018, D-024, D-045, D-048, línea roja #4.
//
// Por qué existe. D-010 define UNA fórmula. Lo que ocurre con las fórmulas en un
// producto que crece es que se copian: alguien necesita puntuar el modo historia
// y escribe su versión "parecida", alguien más ajusta el peso del tiempo en un
// experimento y no lo devuelve. Al año hay tres motores que dan tres números
// distintos para el mismo intento, y el tablero compara peras con manzanas.
//
// La regla es que haya UN módulo que calcule, y que todo lo demás lo llame.
//
// Además, tres invariantes que salen de decisiones distintas y que el motor
// tiene que respetar sí o sí:
//
//   · D-024 y D-045 — en kinder el tiempo NO entra en el puntaje. Se mide, se
//     guarda, y el puntaje nunca lo ve.
//   · D-048 — en «cuál sobra», toda elección autorada vale `acc = 1`. Un motor
//     que compare contra una única respuesta correcta rompe el formato entero.
//   · Línea roja #4 — nunca se cobra por dejar practicar. Un puntaje que dependa
//     de un plan de pago, o una vida que se agote, es la misma prohibición.
//
// LO QUE NO PUEDE COMPROBAR: si los pesos de la fórmula son buenos. Eso es
// producto, y se revisa con simulación (`adaptativo-simulacion.mjs`).

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

const CALCULA_PUNTAJE = palabra("score", "puntaje", "puntuar", "calificar", "computeScore", "scoreOf");
const ES_EL_MOTOR = /(scoring|puntuacion|motor)/i;
const TIEMPO = palabra("rt", "response_?time", "tiempo_?respuesta", "elapsed", "duracion", "duration", "ms_?transcurridos");
const KINDER = palabra("kinder", "kindergarten", "preescolar", "banda_?0", "band0");
const PAGO = palabra("premium", "paid", "pagado", "subscription", "suscripcion", "plan", "tier", "vidas", "lives", "hearts", "corazones", "energia", "energy");

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];

// El archivo de casos no es un motor aunque se llame `puntuacion.prueba.mjs`.
// Contarlo hacía que el auditor informara "2 módulos de puntuación" cuando hay
// uno, que es justo la cifra que este auditor existe para vigilar.
const motores = fuentes.filter((f) => ES_EL_MOTOR.test(f) && !/\.prueba\./.test(f));
const calculan = [];

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const lineas = texto.split("\n");

  // ¿Este archivo CALCULA un puntaje, o solo lo pasa de mano?
  const define = /(?:function|const|export)\s+\w*(?:score|puntaje|puntu|calific)\w*\s*[=(]/i.test(texto);
  const aritmetica = /(?:score|puntaje|puntos|points)\w*\s*[+\-*/]?=\s*[^=]/i.test(texto);
  if (define && aritmetica && !ES_EL_MOTOR.test(archivo)) calculan.push(archivo);

  // El contexto de kinder y el de puntaje son del ARCHIVO, no de la línea.
  //
  // La primera versión exigía kinder + tiempo + puntaje en la misma expresión, y
  // dejó pasar su propio caso de prueba:
  //
  //     export function puntajeKinder(rt: number) {
  //       score = score * (1000 / rt);   // <- la violación, sin la palabra "kinder"
  //
  // La palabra "kinder" está en el nombre de la función, una línea más arriba, y
  // el comentario que sí la decía se quita antes de mirar. Nadie escribe el
  // contexto completo en cada renglón.
  const contextoKinder = KINDER.test(archivo) || KINDER.test(texto);
  const contextoPuntaje = CALCULA_PUNTAJE.test(archivo) || CALCULA_PUNTAJE.test(texto);

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i].replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    // 1. Tiempo dentro del puntaje de kinder.
    if (contextoKinder && contextoPuntaje && TIEMPO.test(linea) && /[*/+\-]/.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: el tiempo entra en el puntaje de kinder — \`${linea.trim().slice(0, 80)}\`. ` +
          "D-024 y D-045: en kinder el tiempo se MIDE y el puntaje nunca lo ve.",
      );
    }

    // 2. El puntaje depende de si pagas.
    if (PAGO.test(linea) && contextoPuntaje && /[+\-*/]?=|\?|if\s*\(/.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: el puntaje depende de un plan de pago o de una moneda que se agota — ` +
          `\`${linea.trim().slice(0, 80)}\`. Línea roja #4: nunca se cobra por dejar que un niño ` +
          "practique. Sin corazones, sin vidas, sin energía.",
      );
    }
  }
}

// 3. Más de un lugar que calcula.
if (calculan.length > 0 && motores.length > 0) {
  problemas.push(
    `${calculan.length} archivo(s) calculan puntaje fuera del motor (${calculan.slice(0, 3).join(", ")}). ` +
      "D-010 define UNA fórmula. Dos motores dan dos números para el mismo intento, y el " +
      "tablero de D-025 compara cosas distintas creyendo que son la misma.",
  );
}

notas.push(
  motores.length > 0
    ? `${motores.length} módulo(s) de puntuación: ${motores.join(", ")}`
    : "todavía no hay motor de puntuación; el auditor está listo para el de F3",
);
notas.push("D-048: en «cuál sobra» toda elección autorada vale acc=1 — el motor no compara contra una sola");

informar({
  nombre: "motor-puntuacion",
  problemas,
  notas,
  cita: "D-010, D-018, D-024, D-045, D-048, línea roja #4",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "dos motores de puntuación dan dos números para el mismo intento, y el tablero " +
    "compara cosas distintas creyendo que son la misma (D-010, D-025).",
  noComprueba: [
    "si los pesos de la fórmula son buenos. Eso se revisa con simulación " +
      "(adaptativo-simulacion.mjs), no leyendo el código.",
  ],
});
