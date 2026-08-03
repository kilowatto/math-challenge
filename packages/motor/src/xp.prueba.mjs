#!/usr/bin/env node
// Casos de XP y Rango — D-055, D-014, línea roja #5, #192, #194, #219, #225.
//
//     node --experimental-strip-types packages/motor/src/xp.prueba.mjs
//
// Por qué existen. Una fórmula cerrada mal despejada da un número plausible y
// equivocado: el niño sube de rango un poco antes o un poco después y no hay
// con qué discutirlo. Y un XP que puede bajar es una penalización que nadie
// declaró — D-055 dice, textual, «el XP es todo lo que has aprendido, nunca baja».
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  RANGO_ESCALA,
  XP_POR_DIA_ESTIMADO,
  BONO_FINALIZACION_XP,
  XP_POR_TIPO,
  RANGOS_PUBLICADOS,
  umbralXpParaRango,
  rangoDeXp,
  rangoDeXpCerrado,
  rangoDeXpIterativo,
  xpDeTipo,
  xpDeItem,
  xpDelReto,
  eventoDeRango,
  agregarXp,
  SQL_UPSERT_XP,
} from "./xp.ts";
import { calificar, valorDelItem } from "./puntuacion.ts";
import { tocaEscribir, INTERVALO_MIN_MS } from "./rollup.ts";

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

const igual = (a, b, msg) => {
  const [x, y] = [JSON.stringify(a), JSON.stringify(b)];
  if (x !== y) throw new Error(`${msg ?? "valor"}: esperaba ${y}, obtuve ${x}`);
};
const lanza = (fn, fragmento) => {
  try {
    fn();
  } catch (err) {
    if (fragmento && !String(err.message).includes(fragmento)) {
      throw new Error(`lanzó, pero por otra razón: "${err.message}"`);
    }
    return err;
  }
  throw new Error("no lanzó");
};

console.log("\n== XP y Rango — D-055, línea roja #5 ==\n");

// --- La curva (#194) --------------------------------------------------------

caso("umbralXpParaRango es 25·(r−1)·(r+2), y el Rango 1 empieza en 0", () => {
  igual(umbralXpParaRango(1), 0, "R1");
  igual(umbralXpParaRango(2), RANGO_ESCALA * 1 * 4, "R2");
  igual(umbralXpParaRango(2), 100, "R2 en números");
  igual(umbralXpParaRango(15), 5950, "R15");
  igual(umbralXpParaRango(30), 25 * 29 * 32, "R30");
});

caso("rechaza un rango no entero o menor que 1", () => {
  lanza(() => umbralXpParaRango(0), "escalera");
  lanza(() => umbralXpParaRango(-3), "escalera");
  lanza(() => umbralXpParaRango(2.5), "escalera");
  lanza(() => umbralXpParaRango(NaN), "escalera");
});

caso("el INCREMENTO entre umbrales crece linealmente, no el umbral exponencialmente", () => {
  // Es lo que pide la fuente de #194: incremento lineal. Si algún día alguien
  // reusa el 1.6 de valorDelItem(), esta comprobación es la que lo dice.
  const incrementos = [];
  for (let r = 2; r <= 15; r++) incrementos.push(umbralXpParaRango(r) - umbralXpParaRango(r - 1));
  for (let i = 1; i < incrementos.length; i++) {
    const salto = incrementos[i] - incrementos[i - 1];
    igual(salto, 50, `el salto entre incrementos en r=${i + 2} es constante`);
  }
});

caso("la forma cerrada y la iterativa coinciden en 1 000 puntos, umbrales incluidos", () => {
  // El criterio de #194 pide al menos 500. Se hacen 1 000, y además los 40
  // umbrales exactos y sus vecinos — que es donde `Math.sqrt` de un cuadrado
  // perfecto puede caer un ulp por debajo y devolver el rango anterior.
  for (let xp = 0; xp <= 30_000; xp += 30) {
    igual(rangoDeXpCerrado(xp), rangoDeXpIterativo(xp), `xp=${xp}`);
    igual(rangoDeXp(xp), rangoDeXpIterativo(xp), `xp=${xp} (la que se usa)`);
  }
  for (let r = 1; r <= 40; r++) {
    const u = umbralXpParaRango(r);
    igual(rangoDeXp(u), r, `justo en el umbral de R${r}`);
    if (u > 0) igual(rangoDeXp(u - 1), r - 1, `un XP antes del umbral de R${r}`);
    igual(rangoDeXp(u + 1), r, `un XP después del umbral de R${r}`);
  }
});

caso("no hay tope de rango impuesto: la curva desacelera sola", () => {
  igual(rangoDeXp(1_000_000), rangoDeXpIterativo(1_000_000), "un millón de XP");
  if (rangoDeXp(1_000_000) <= 15) throw new Error("la curva se topó donde no debía");
});

caso("un XP negativo o no finito se rechaza: el XP nunca baja (D-055)", () => {
  lanza(() => rangoDeXp(-1), "nunca es negativo");
  lanza(() => rangoDeXpIterativo(Infinity), "nunca es negativo");
});

caso("la tabla publicada tiene 15 rangos y se DERIVA de la fórmula, no se escribe a mano", () => {
  igual(RANGOS_PUBLICADOS.length, 15, "quince");
  for (const fila of RANGOS_PUBLICADOS) {
    igual(fila.xpParaEntrar, umbralXpParaRango(fila.rango), `R${fila.rango}`);
    igual(fila.diasEstimados, Math.ceil(fila.xpParaEntrar / XP_POR_DIA_ESTIMADO), `días de R${fila.rango}`);
  }
  igual(RANGOS_PUBLICADOS[0].incremento, 0, "el primero no tiene incremento");
  igual(RANGOS_PUBLICADOS[14].xpParaEntrar, 5950, "R15");
});

caso("los umbrales son alcanzables: R15 en menos de tres meses a la calibración declarada", () => {
  // Es la comprobación que motivó descartar la curva exponencial. Con el 1.6 de
  // valorDelItem el R20 tardaría 6.9 años; aquí se mide que no vuelva a pasar.
  const dias = RANGOS_PUBLICADOS[14].diasEstimados;
  if (dias > 90) throw new Error(`R15 tardaría ${dias} días [estimado]: la curva es inalcanzable`);
  const r30 = Math.ceil(umbralXpParaRango(30) / XP_POR_DIA_ESTIMADO);
  if (r30 > 365) throw new Error(`R30 tardaría ${r30} días [estimado]: la curva es inalcanzable`);
});

// --- XP por ítem y por reto (#192) ------------------------------------------

caso("xpDeItem reusa valorDelItem y NUNCA es negativo al fallar", () => {
  igual(xpDeItem(1, 1), Math.round(valorDelItem(1)), "N1 acierto");
  igual(xpDeItem(8, 1), Math.round(valorDelItem(8)), "N8 acierto");
  igual(xpDeItem(8, 0), 0, "N8 fallo: cero, nunca negativo");
  igual(xpDeItem(12, 0), 0, "N12 fallo");
});

caso("xpDeItem no admite tiempo: su firma tiene dos parámetros y ninguno es rtMs", () => {
  igual(xpDeItem.length, 2, "nivel y acc, nada más");
});

caso("xpDeItem rechaza un acc parcial y un nivel fuera de la escalera", () => {
  lanza(() => xpDeItem(3, 0.5), "nunca un parcial");
  lanza(() => xpDeItem(0, 1), "escalera");
  lanza(() => xpDeItem(13, 1), "escalera");
});

caso("el bono de finalización es valorDelItem(1), no un 10 escrito a mano", () => {
  igual(BONO_FINALIZACION_XP, Math.round(valorDelItem(1)), "el bono");
  igual(BONO_FINALIZACION_XP, 10, "en números");
});

caso("xpDelReto suma los ítems y añade el bono solo si el reto se cerró", () => {
  const items = [
    { nivel: 1, acc: 1 },
    { nivel: 2, acc: 1 },
    { nivel: 3, acc: 0 },
  ];
  const suma = Math.round(valorDelItem(1)) + Math.round(valorDelItem(2));
  igual(xpDelReto(items, false), suma, "sin cerrar");
  igual(xpDelReto(items, true), suma + BONO_FINALIZACION_XP, "cerrado");
});

caso("un reto cerrado por el límite de pantalla sin un solo acierto sigue dando el bono", () => {
  // Es la línea roja #6 vista desde el otro eje: si el día se da por cumplido
  // para la racha, sería absurdo no darlo por cumplido para el XP.
  igual(xpDelReto([], true), BONO_FINALIZACION_XP, "cero ítems, reto cerrado");
  igual(xpDelReto([{ nivel: 5, acc: 0 }], true), BONO_FINALIZACION_XP, "un fallo y nada más");
});

caso("el XP de un reto nunca puede ser negativo, se responda lo que se responda", () => {
  for (let nivel = 1; nivel <= 12; nivel++) {
    for (const acc of [0, 1]) {
      for (const completo of [true, false]) {
        const v = xpDelReto([{ nivel, acc }, { nivel, acc }], completo);
        if (v < 0) throw new Error(`nivel ${nivel}, acc ${acc}, completo ${completo} dio ${v}`);
      }
    }
  }
});

// --- La tabla fija y publicada (#219, línea roja #5) ------------------------

caso("la tabla de XP por tipo es fija, y un tipo desconocido LANZA en vez de dar 0", () => {
  igual(xpDeTipo("reto_completado"), BONO_FINALIZACION_XP, "reto");
  igual(xpDeTipo("mision_repaso"), XP_POR_TIPO.mision_repaso, "misión de repaso");
  igual(xpDeTipo("mision_dia_completo"), XP_POR_TIPO.mision_dia_completo, "bono del día");
  igual(xpDeTipo("mision_semanal"), XP_POR_TIPO.mision_semanal, "misión semanal");
  lanza(() => xpDeTipo("cofre_sorpresa"), "tabla publicada");
});

caso("la tabla está congelada: no se le puede añadir un tipo en caliente", () => {
  try {
    XP_POR_TIPO.cofre = 999;
  } catch {
    /* en modo estricto lanza, y también está bien */
  }
  igual(XP_POR_TIPO.cofre, undefined, "no entró");
});

caso("mil llamadas al mismo tipo dan el mismo número: cero varianza", () => {
  const primera = xpDeTipo("mision_dominio");
  for (let i = 0; i < 1000; i++) igual(xpDeTipo("mision_dominio"), primera, `llamada ${i}`);
});

// --- El evento de Rango (#192) ---------------------------------------------

caso("eventoDeRango devuelve null si el lote no cruzó ningún umbral", () => {
  igual(eventoDeRango(10, 90), null, "dentro del R1");
  igual(eventoDeRango(0, 0), null, "sin movimiento");
});

caso("un lote que cruza VARIOS umbrales emite UN evento, no uno por umbral", () => {
  const e = eventoDeRango(0, 5950); // de R1 a R15 de un golpe
  igual(e.rangoAnterior, 1, "antes");
  igual(e.rangoNuevo, 15, "después");
  igual(e.totalXp, 5950, "total");
});

caso("un XP que baja lanza: D-055 dice que nunca baja", () => {
  lanza(() => eventoDeRango(500, 400), "nunca baja");
});

// --- XP y puntos son dos monedas y no se cambian (#225, D-055) --------------

caso("no existe ninguna conversión: calificar() no cambia de firma ni de resultado", () => {
  const intento = { banda: "PRIMARIA", nivel: 4, acc: 1, rtMs: 12_000 };
  const antes = JSON.stringify(calificar(intento));
  xpDeItem(4, 1);
  xpDelReto([{ nivel: 4, acc: 1 }], true);
  igual(JSON.stringify(calificar(intento)), antes, "el veredicto");
  igual(calificar.length, 1, "calificar sigue recibiendo un solo argumento");
});

caso("los dos ejes DIVERGEN en una banda cronometrada: no son el mismo número", () => {
  // Si alguien intentara «unificarlos», este caso lo dice. Un fallo resta en
  // puntos (D-010) y da 0 en XP; nunca pueden ser la misma cifra.
  const fallo = { banda: "PRIMARIA", nivel: 4, acc: 0, rtMs: 5_000 };
  const puntos = calificar(fallo).puntos;
  const xp = xpDeItem(4, 0);
  igual(xp, 0, "el XP de un fallo");
  if (!(puntos < 0)) throw new Error(`se esperaba que fallar restara puntos, dio ${puntos}`);
  if (puntos === xp) throw new Error("los dos ejes dieron el mismo número: se mezclaron");
});

caso("en KINDER los dos coinciden por construcción, y eso es esperado (D-055)", () => {
  const acierto = { banda: "KINDER", nivel: 2, acc: 1 };
  igual(Math.round(calificar(acierto).puntos), xpDeItem(2, 1), "aciertos en kinder");
  const fallo = { banda: "KINDER", nivel: 2, acc: 0 };
  igual(calificar(fallo).puntos, xpDeItem(2, 0), "fallos en kinder: los dos en 0");
});

// --- El rollup (#192, mc-32 riesgo #1) --------------------------------------

caso("agregarXp comprime: mil eventos de tres niños salen como tres filas", () => {
  const eventos = [];
  for (let i = 0; i < 1000; i++) {
    eventos.push({ childProfileId: `n${i % 3}`, xp: 10 });
  }
  const lote = agregarXp(eventos);
  igual(lote.filas.length, 3, "filas");
  igual(lote.eventosAgregados, 1000, "eventos");
  igual(lote.filas.reduce((s, f) => s + f.delta, 0), 10_000, "nada se perdió al agregar");
});

caso("agregarXp rechaza un delta negativo antes de que llegue a D1", () => {
  lanza(() => agregarXp([{ childProfileId: "n1", xp: -5 }]), "negativo");
});

caso("el disparador de escritura se REUSA de rollup.ts, no se duplica", () => {
  igual(tocaEscribir(0, INTERVALO_MIN_MS), false, "sin pendientes no se escribe");
  igual(tocaEscribir(1, INTERVALO_MIN_MS), true, "por tiempo");
  igual(tocaEscribir(200, 0), true, "por tamaño");
});

caso("el upsert suma el delta y NO guarda una columna de rango", () => {
  if (!SQL_UPSERT_XP.includes("total_xp + excluded.total_xp")) {
    throw new Error("el upsert no suma el delta: mandar el total pierde escrituras concurrentes");
  }
  if (/\brango\b|\brank\b/i.test(SQL_UPSERT_XP)) {
    throw new Error("el upsert toca una columna de rango; el rango se DERIVA de total_xp (#194)");
  }
  if (/\bperiod\b|\btheme_band\b/i.test(SQL_UPSERT_XP)) {
    throw new Error("xp_totals no tiene period ni theme_band: el XP es de por vida (#192)");
  }
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
