// Casos del brazo de control y las dos firmas de Rohrer (F4 #103, mc-05, mc-13).
//
// La que manda: **las dos firmas se mueven en direcciones opuestas**, y por eso
// se miden por separado. Un solo campo `accuracy` acaba siendo el de sesión —es
// el que se tiene a mano— y el otro no se mira nunca. Aquí se comprueba que la
// función del día siguiente NO devuelve lo mismo que la de sesión ni siquiera
// cuando los datos podrían confundirlas.

import {
  elegirPorEscaleraFija,
  aciertoEnSesion,
  aciertoAlDiaSiguiente,
  tablaDeComparacion,
} from "./comparacion.ts";
import { estadoInicial, nivelDeHabilidad, elegirSiguiente, esperado } from "./adaptativo.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const DIA = 86_400_000;
const T0 = 1_800_000_000_000;

console.log("comparacion — el brazo de control y las dos firmas de Rohrer\n");

// --- el brazo de control es REAL, no una idea (mc-13 impl. 11) -------------
{
  const banco = [];
  for (let i = 0; i < 60; i++) banco.push({ id: `b${i}`, dificultad: -3 + (i / 59) * 6 });
  const est = estadoInicial(6);

  const fijo = elegirPorEscaleraFija(banco, est, new Set(), () => 0);
  ok(fijo !== null, "la escalera fija sirve un ítem de verdad");
  ok(nivelDeHabilidad(fijo.dificultad) === nivelDeHabilidad(est.habilidad),
    "y lo sirve del escalón que le toca al niño, sin adaptar nada");

  // Misma firma que el adaptativo: es lo que hace que sean comparables.
  const adapt = elegirSiguiente(banco, est, new Set(), () => 0);
  ok(adapt !== null && typeof adapt.id === "string" && typeof adapt.dificultad === "number",
    "los dos selectores tienen la MISMA firma — si no, se compararían dos rutas de código");

  // La diferencia que se está midiendo: el adaptativo apunta a una probabilidad,
  // la escalera fija al escalón.
  const pFijo = esperado(est.habilidad, fijo.dificultad);
  const pAdapt = esperado(est.habilidad, adapt.dificultad);
  console.log(`     escalera fija p=${pFijo.toFixed(2)} · adaptativo p=${pAdapt.toFixed(2)}`);
  ok(Math.abs(pFijo - 0.5) < 0.2 && Math.abs(pAdapt - 0.5) < 0.2,
    "en el ítem 1 los dos arrancan cerca del 50%: la diferencia aparece DESPUÉS, con las respuestas");

  // Se agota el escalón y sube. Es la única «adaptación» de una escalera fija.
  const delEscalon = new Set(
    banco.filter((c) => nivelDeHabilidad(c.dificultad) === nivelDeHabilidad(est.habilidad)).map((c) => c.id),
  );
  const siguiente = elegirPorEscaleraFija(banco, est, delEscalon, () => 0);
  ok(siguiente !== null && nivelDeHabilidad(siguiente.dificultad) > nivelDeHabilidad(est.habilidad),
    "agotado el escalón sube al siguiente — agotar y avanzar, que es lo que hace casi todo el software educativo");

  ok(elegirPorEscaleraFija(banco, est, new Set(banco.map((b) => b.id)), () => 0) === null,
    "banco agotado devuelve null, jamás un repetido");
}

// ---------------------------------------------------------------------------
// LAS DOS FIRMAS SE MIDEN POR SEPARADO (criterio #103)
// ---------------------------------------------------------------------------
{
  // Un escenario construido para que las dos firmas DISCREPEN, que es el punto
  // entero de mc-05 impl. 10: en sesión el adaptativo sale peor y al día
  // siguiente sale mejor.
  const intentos = [];
  const empujar = (skillId, correcto, dia, sesionId, modo) =>
    intentos.push({ skillId, correcto, ahora: T0 + dia * DIA, sesionId, modo });

  // Día 0 — el adaptativo intercala y acierta 2 de 6; la escalera fija agrupa y
  // acierta 5 de 6. Esa es la fluidez que se evapora.
  for (const [s, c] of [["A", true], ["B", false], ["C", false], ["A", true], ["B", false], ["C", false]]) {
    empujar(s, c, 0, "s1", "adaptativo");
  }
  for (const [s, c] of [["A", true], ["A", true], ["A", true], ["B", true], ["B", true], ["B", false]]) {
    empujar(s, c, 0, "s1f", "escalera_fija");
  }

  // Día 2 — el primer intento de cada habilidad en frío. El adaptativo acierta
  // 3 de 3; la escalera fija 1 de 2.
  for (const [s, c] of [["A", true], ["B", true], ["C", true]]) empujar(s, c, 2, "s2", "adaptativo");
  for (const [s, c] of [["A", true], ["B", false]]) empujar(s, c, 2, "s2f", "escalera_fija");

  const t = tablaDeComparacion(intentos);
  console.log(`     adaptativo   en sesión ${t.adaptativo.enSesion?.toFixed(2)} · día siguiente ${t.adaptativo.alDiaSiguiente?.toFixed(2)}`);
  console.log(`     esc. fija    en sesión ${t.escaleraFija.enSesion?.toFixed(2)} · día siguiente ${t.escaleraFija.alDiaSiguiente?.toFixed(2)}`);

  ok(t.adaptativo.enSesion < t.escaleraFija.enSesion,
    "el adaptativo sale PEOR en el acierto de sesión — es lo esperado (mc-05 impl. 10)");
  ok(t.adaptativo.alDiaSiguiente > t.escaleraFija.alDiaSiguiente,
    "…y MEJOR al día siguiente, que es la firma que importa");
  ok(t.adaptativo.enSesion !== t.adaptativo.alDiaSiguiente,
    "las dos firmas dan números DISTINTOS sobre los mismos datos: no son la misma métrica con dos nombres");

  ok(/no revierte a bloques/i.test(t.lecturaEsperada),
    "la tabla lleva escrito que una bajada en sesión NO revierte a bloques (criterio #103)");
}

// --- solo cuenta el PRIMER intento en frío ---------------------------------
{
  // Si se contaran todos los de la sesión siguiente, se estaría midiendo otra
  // vez el aprendizaje de esa sesión y la firma quedaría contaminada.
  const intentos = [
    { skillId: "A", correcto: true, ahora: T0, sesionId: "s1", modo: "adaptativo" },
    // Día 3: el primero falla, los siguientes aciertan porque ya se practicó.
    { skillId: "A", correcto: false, ahora: T0 + 3 * DIA, sesionId: "s2", modo: "adaptativo" },
    { skillId: "A", correcto: true, ahora: T0 + 3 * DIA + 1000, sesionId: "s2", modo: "adaptativo" },
    { skillId: "A", correcto: true, ahora: T0 + 3 * DIA + 2000, sesionId: "s2", modo: "adaptativo" },
  ];
  ok(aciertoAlDiaSiguiente(intentos, "adaptativo") === 0,
    "solo cuenta el PRIMER intento en frío: 0 de 1, no 2 de 3 (o la firma se contamina con lo recién practicado)");
  ok(Math.abs(aciertoEnSesion(intentos, "adaptativo") - 0.75) < 1e-9,
    "y el de sesión sí cuenta los cuatro: 3 de 4");
}

// --- el mismo día no cuenta -------------------------------------------------
{
  const mismoDia = [
    { skillId: "A", correcto: true, ahora: T0, sesionId: "s1", modo: "adaptativo" },
    { skillId: "A", correcto: true, ahora: T0 + 3600_000, sesionId: "s2", modo: "adaptativo" },
  ];
  ok(aciertoAlDiaSiguiente(mismoDia, "adaptativo") === null,
    "dos sesiones el MISMO día no producen firma de día siguiente");

  const mismaSesion = [
    { skillId: "A", correcto: true, ahora: T0, sesionId: "s1", modo: "adaptativo" },
    { skillId: "A", correcto: true, ahora: T0 + 2 * DIA, sesionId: "s1", modo: "adaptativo" },
  ];
  ok(aciertoAlDiaSiguiente(mismaSesion, "adaptativo") === null,
    "ni dos intentos de la MISMA sesión separados dos días — una sesión no dura dos días");
}

// --- huecos, no ceros -------------------------------------------------------
{
  const t = tablaDeComparacion([]);
  ok(t.adaptativo.enSesion === null && t.escaleraFija.alDiaSiguiente === null,
    "sin datos devuelve null y NO cero: un cero en una gráfica se lee «el adaptativo no funciona»");
}

console.log(fallos === 0 ? "\n✓ comparacion — todos los casos" : `\n✗ comparacion — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
