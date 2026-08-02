// Casos del programador de repaso (F4 #95, #96, #97, #98, #99; mc-05, D-018, D-063).
//
// Las dos que hay que mirar:
//
//  · **`mastered_at` no se puede escribir el mismo día.** Tres seguidas en la
//    misma sesión marcan `provisional_at` y nada más. Se ve fallar quitando la
//    comprobación del hueco de 3 días en `registrarRepaso`.
//  · **Con 2+ habilidades en rotación no hay bloques.** Se ve fallar cambiando
//    `findIndex((s) => s !== anterior)` por `0`.

import {
  INTERVALOS_LEITNER,
  DATOS_PARA_FSRS,
  RETENCION_OBJETIVO,
  RETENCION_KINDER,
  RACHA_PROVISIONAL,
  DIAS_PARA_DOMINIO,
  REPASO_MINIMO,
  REPASO_MAXIMO,
  repasoInicial,
  registrarRepaso,
  intervaloFsrs,
  retencionDe,
  etapaDe,
  vencidas,
  ordenDeSesion,
  bloqueMasLargo,
  cerrarPorCorte,
} from "./programador.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const DIA = 86_400_000;
const T0 = 1_800_000_000_000; // un instante fijo: este módulo no lee el reloj

console.log("programador — cuándo vuelve una habilidad\n");

// --- la retención por banda (criterio #96) ---------------------------------
ok(retencionDe("KINDER") === RETENCION_KINDER, "kinder repasa a 0.85: menos repasos, menos frustración");
ok(retencionDe("PRIMARIA") === RETENCION_OBJETIVO, "el resto a 0.90");
ok(RETENCION_KINDER < RETENCION_OBJETIVO, "y 0.85 es MENOS exigente, o sea intervalos MÁS largos");
ok(intervaloFsrs(10, RETENCION_KINDER) > intervaloFsrs(10, RETENCION_OBJETIVO),
  "con la misma estabilidad, kinder espera más días (el signo, que es donde esto se escribe al revés)");
ok(Math.abs(intervaloFsrs(10, 0.9) - 10) < 0.6,
  `con R=0.90 el intervalo es ~la estabilidad (dio ${intervaloFsrs(10, 0.9).toFixed(2)} para S=10)`);

// --- el arranque Leitner (criterio #96) ------------------------------------
{
  let e = repasoInicial();
  ok(etapaDe(e) === "sin_ver", "una habilidad nunca vista no está «vencida», está sin empezar");

  const dias = [];
  let t = T0;
  for (let i = 0; i < 5; i++) {
    e = registrarRepaso(e, { correcto: true, ahora: t, banda: "PRIMARIA" });
    dias.push(Math.round((e.venceEn - t) / DIA));
    t = e.venceEn;
  }
  ok(JSON.stringify(dias) === JSON.stringify([...INTERVALOS_LEITNER]),
    `la escalera de Leitner es 1→3→7→16→35 (dio ${dias.join("→")})`);

  // Fallar vuelve al primer escalón.
  e = registrarRepaso(e, { correcto: false, ahora: t, banda: "PRIMARIA" });
  ok(Math.round((e.venceEn - t) / DIA) === INTERVALOS_LEITNER[0],
    "fallar devuelve el intervalo al primer escalón");
  ok(e.rachaCorrectas === 0, "y reinicia la racha");
}

// --- la estabilidad NO se borra al fallar ----------------------------------
{
  let e = repasoInicial();
  let t = T0;
  for (let i = 0; i < 6; i++) {
    e = registrarRepaso(e, { correcto: true, ahora: t, banda: "PRIMARIA" });
    t += 3 * DIA;
  }
  const antes = e.estabilidad;
  e = registrarRepaso(e, { correcto: false, ahora: t, banda: "PRIMARIA" });
  ok(e.estabilidad < antes, "fallar recorta la estabilidad");
  ok(e.estabilidad > 0, "pero NO la borra: lo que se supo un mes no vale lo mismo que lo de ayer");
}

// --- el cambio a FSRS (criterio #96) ---------------------------------------
{
  let e = repasoInicial();
  let t = T0;
  for (let i = 0; i < DATOS_PARA_FSRS - 1; i++) {
    e = registrarRepaso(e, { correcto: true, ahora: t, banda: "PRIMARIA" });
    t = e.venceEn;
  }
  const conLeitner = Math.round((e.venceEn - t + (e.venceEn - t)) / DIA);
  ok(e.intentos === DATOS_PARA_FSRS - 1, `con ${DATOS_PARA_FSRS - 1} intentos todavía manda Leitner`);
  ok(Math.round((e.venceEn - (t - (e.venceEn - t))) / DIA) <= INTERVALOS_LEITNER[4] * 2,
    "y el intervalo sigue acotado por el último escalón de la escalera");

  const antesDelCambio = e.venceEn;
  const t2 = e.venceEn;
  e = registrarRepaso(e, { correcto: true, ahora: t2, banda: "PRIMARIA" });
  ok(e.intentos === DATOS_PARA_FSRS, `en el intento ${DATOS_PARA_FSRS} manda FSRS`);
  ok(e.venceEn - t2 > 0, "y el intervalo sigue siendo positivo");
  ok(conLeitner >= 0 && antesDelCambio > 0, "la transición no produce un intervalo negativo ni cero");
}

// --- el techo del intervalo -------------------------------------------------
{
  let e = repasoInicial();
  let t = T0;
  let dias = 0;
  for (let i = 0; i < 60; i++) {
    e = registrarRepaso(e, { correcto: true, ahora: t, banda: "PRIMARIA" });
    dias = (e.venceEn - t) / DIA; // el intervalo de ESTE paso, antes de avanzar t
    t = e.venceEn;
  }
  ok(dias <= INTERVALOS_LEITNER[4] * 10,
    `el intervalo tiene techo (dio ${dias.toFixed(0)} días): dos años no es un repaso, es un olvido con fecha`);
}

// ---------------------------------------------------------------------------
// MAESTRÍA EN DOS ETAPAS (criterio #97) — la prueba que manda
// ---------------------------------------------------------------------------
//
// SE VE FALLAR: quita `huecoDias >= DIAS_PARA_DOMINIO` de `registrarRepaso` y
// tres aciertos en el mismo minuto escriben `dominadoEn`.
{
  let e = repasoInicial();
  const t = T0;
  // Tres seguidas en el MISMO instante, como en una sola sesión.
  for (let i = 0; i < RACHA_PROVISIONAL; i++) {
    e = registrarRepaso(e, { correcto: true, ahora: t + i * 1000, banda: "PRIMARIA" });
  }
  ok(e.provisionalEn !== null, "3 seguidas marcan `provisional_at`");
  ok(e.dominadoEn === null,
    "…y NO escriben `mastered_at`: tres seguidas en el momento no prueban nada durable (mc-05)");
  ok(etapaDe(e) === "provisional", "el panel del padre lee «provisional», no «aprendido»");

  // Un repaso correcto a 2 días todavía no basta.
  const casi = registrarRepaso(e, { correcto: true, ahora: e.ultimoIntento + 2 * DIA, banda: "PRIMARIA" });
  ok(casi.dominadoEn === null, `un repaso a 2 días tampoco: el hueco exigido es ${DIAS_PARA_DOMINIO}`);

  // A 3 días sí.
  const logrado = registrarRepaso(e, { correcto: true, ahora: e.ultimoIntento + DIAS_PARA_DOMINIO * DIA, banda: "PRIMARIA" });
  ok(logrado.dominadoEn !== null, "un repaso correcto a ≥3 días SÍ escribe `mastered_at`");
  ok(etapaDe(logrado) === "aprendido", "y solo entonces el panel dice «aprendido»");

  // Fallar el repaso espaciado no lo escribe.
  const fallado = registrarRepaso(e, { correcto: false, ahora: e.ultimoIntento + 5 * DIA, banda: "PRIMARIA" });
  ok(fallado.dominadoEn === null, "y un repaso espaciado FALLADO no lo escribe");

  // D-063: la maestría no bloquea nada. Se comprueba por ausencia — no hay
  // ninguna función que devuelva si se puede avanzar.
  const fuente = await (await import("node:fs/promises")).readFile(
    new URL("./programador.ts", import.meta.url), "utf8",
  );
  ok(!/puedeAvanzar|bloquea\w*\s*\(|desbloquea|gate|permitirAvance/i.test(fuente.replace(/\/\*[\s\S]*?\*\//g, "")),
    "no existe ninguna función que decida si el niño puede avanzar (D-063: la maestría no bloquea)");
}

// --- lo vencido -------------------------------------------------------------
{
  const rot = [
    { skillId: "A", estado: { ...repasoInicial(), venceEn: T0 - 5 * DIA, intentos: 3 } },
    { skillId: "B", estado: { ...repasoInicial(), venceEn: T0 - 1 * DIA, intentos: 3 } },
    { skillId: "C", estado: { ...repasoInicial(), venceEn: T0 + 9 * DIA, intentos: 3 } },
    { skillId: "D", estado: repasoInicial() },
  ];
  const v = vencidas(rot, T0).map((h) => h.skillId);
  ok(JSON.stringify(v) === '["A","B"]', "solo lo vencido, de lo más atrasado a lo menos");
  ok(!v.includes("D"), "una habilidad sin ver NUNCA cuenta como vencida (o todo lo nuevo entierra el repaso)");
}

// ---------------------------------------------------------------------------
// INTERCALADO (criterios #98 y #99) — la otra prueba que manda
// ---------------------------------------------------------------------------
//
// SE VE FALLAR: en `ordenDeSesion`, cambia
// `cola.findIndex((s) => s !== anterior)` por `0` y aparecen bloques de 2-3.
{
  const rot = ["A", "B", "C", "D"].map((s, i) => ({
    skillId: s,
    estado: { ...repasoInicial(), venceEn: T0 - (4 - i) * DIA, intentos: 5 },
  }));
  const orden = ordenDeSesion(rot, T0, 10);
  console.log(`     orden con 4 habilidades vencidas: ${orden.join(" ")}`);
  ok(orden.length === 10, "se llenan los 10 huecos pedidos");
  ok(bloqueMasLargo(orden) === 1,
    "con 2+ habilidades en rotación NO hay dos seguidas de la misma (criterio #98)");

  const cuantosRepaso = orden.filter((s) => ["A", "B", "C", "D"].includes(s)).length;
  ok(cuantosRepaso === 10, "todo sale de la rotación, nada inventado");

  // La mezcla 40-60%.
  const rotMixta = [
    ...["A", "B", "C"].map((s) => ({ skillId: s, estado: { ...repasoInicial(), venceEn: T0 - DIA, intentos: 5 } })),
    ...["X", "Y", "Z"].map((s) => ({ skillId: s, estado: { ...repasoInicial(), venceEn: T0 + 20 * DIA, intentos: 5 } })),
  ];
  const mixto = ordenDeSesion(rotMixta, T0, 10);
  const deRepaso = mixto.filter((s) => ["A", "B", "C"].includes(s)).length;
  console.log(`     mezcla: ${deRepaso}/10 de repaso — ${mixto.join(" ")}`);
  ok(deRepaso / mixto.length >= REPASO_MINIMO && deRepaso / mixto.length <= REPASO_MAXIMO,
    `la mezcla de repaso queda dentro de [${REPASO_MINIMO}, ${REPASO_MAXIMO}] (dio ${(deRepaso / 10).toFixed(1)})`);
  ok(bloqueMasLargo(mixto) === 1, "y sigue sin bloques");

  // Criterio #94: sin nada vencido, la sesión NO queda vacía.
  const nadaVencido = ["P", "Q"].map((s) => ({
    skillId: s, estado: { ...repasoInicial(), venceEn: T0 + 30 * DIA, intentos: 4 },
  }));
  const igual = ordenDeSesion(nadaVencido, T0, 8);
  ok(igual.length === 8,
    "sin nada vencido el motor sirve práctica igual: NUNCA dice «vuelve mañana» (criterio #94, línea roja #4)");
  ok(bloqueMasLargo(igual) === 1, "y esa práctica también va intercalada");

  // Una sola habilidad: forzar el intercalado sería servir un tema que el niño
  // no está viendo. Se acepta el bloque y se dice por qué.
  const sola = ordenDeSesion([{ skillId: "U", estado: { ...repasoInicial(), venceEn: T0 - DIA, intentos: 2 } }], T0, 5);
  ok(sola.length === 5 && bloqueMasLargo(sola) === 5,
    "con UNA sola habilidad en rotación no hay nada que intercalar, y no se inventa un tema");

  ok(ordenDeSesion([], T0, 5).length === 0, "sin rotación no se inventa nada");
  ok(ordenDeSesion(rot, T0, 0).length === 0, "cero huecos, cero ítems");
}

// --- el corte por límite de pantalla (criterio #95, línea roja #6) ---------
{
  let e = repasoInicial();
  e = registrarRepaso(e, { correcto: true, ahora: T0, banda: "PRIMARIA" });
  const cortado = cerrarPorCorte(e);
  ok(JSON.stringify(cortado) === JSON.stringify(e),
    "un corte por límite de pantalla deja el estado IDÉNTICO: el ítem sin contestar no cuenta como fallo (D-016)");
  ok(cortado.rachaCorrectas === e.rachaCorrectas,
    "y la racha no se toca — respetar el límite de pantalla nunca rompe nada (línea roja #6)");
}

console.log(fallos === 0 ? "\n✓ programador — todos los casos" : `\n✗ programador — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
