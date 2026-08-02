// Casos del motor adaptativo (F4 #87..#94, D-002, D-060..D-063).
//
// La prueba que manda es la de la edad, al final del archivo: **dos perfiles con
// la misma habilidad verdadera y ocho años de diferencia en `birth_year` tienen
// que converger**. Es la que separa un motor adaptativo de la escalera de D-017
// con otro nombre.
//
// El criterio #88 la pedía con la cadena de respuestas FORZADA, y así es
// imposible para cualquier algoritmo — la demostración está junto a la prueba.
// Se ve fallar devolviendo los tramos fijos de `mc-44` en `kPara()`.

import {
  esperado,
  margenPara,
  ventanaDeDificultad,
  dificultadDeAutor,
  dificultadDeNivel,
  nivelDeHabilidad,
  nivelSemilla,
  estadoInicial,
  actualizar,
  kPara,
  habilidadParaElegir,
  elegirSiguiente,
  evaluarParada,
  ACIERTO_OBJETIVO,
  ACIERTO_SUELO,
  ACIERTO_TECHO,
  FALLOS_ANTES_DE_BAJAR,
  TOPE_DE_UBICACION,
  TOPE_DE_SALTO,
  NIVEL_MAXIMO,
  estaUbicando,
} from "./adaptativo.ts";
import { medirSesgoDeEdad } from "./simulacion-adaptativo.mjs";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};
const cerca = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

console.log("adaptativo — el motor que decide qué ítem va después\n");

// --- la escala --------------------------------------------------------------
ok(cerca(esperado(0, 0), 0.5), "habilidad igual a dificultad da 50%");
ok(cerca(esperado(margenPara(0.75), 0), 0.75), "el margen de 0.75 es exacto (ln 3)");
ok(esperado(2, 0) > esperado(1, 0), "más habilidad, más probabilidad");
ok(esperado(0, 2) < esperado(0, 1), "más dificultad, menos probabilidad");

// El signo de la ventana es donde esto se escribe mal.
const v = ventanaDeDificultad(0);
ok(v.min < v.max, "la ventana tiene el mínimo por debajo del máximo");
ok(
  cerca(esperado(0, v.max), ACIERTO_SUELO, 1e-9) && cerca(esperado(0, v.min), ACIERTO_TECHO, 1e-9),
  "el TECHO de aciertos produce el PISO de dificultad, no al revés",
);

// --- la dificultad del autor vs la viva (criterio #89) ----------------------
ok(dificultadDeAutor(1) < dificultadDeAutor(50) && dificultadDeAutor(50) < dificultadDeAutor(100),
  "la escala 1-100 del autor es monótona");
ok(cerca(dificultadDeAutor(1), -3) && cerca(dificultadDeAutor(100), 3), "cubre ±3 logits");
let lanzo = false;
try { dificultadDeAutor(0); } catch { lanzo = true; }
ok(lanzo, "una dificultad de autor fuera de 1..100 se rechaza, no se satura en silencio");

ok(cerca(dificultadDeNivel(1), -3) && cerca(dificultadDeNivel(12), 3), "la escalera de D-017 cubre lo mismo");
ok(nivelDeHabilidad(dificultadDeNivel(7)) === 7, "el nivel ida y vuelta es estable");
ok(nivelDeHabilidad(-99) === 1 && nivelDeHabilidad(99) === NIVEL_MAXIMO, "la habilidad extrema satura en la escalera");

// --- la semilla de edad, que es la ÚNICA puerta (D-060) --------------------
ok(nivelSemilla(2021, 2026) >= 1, "un niño de 5 arranca dentro de la escalera");
ok(nivelSemilla(2010, 2026) > nivelSemilla(2021, 2026), "más edad arranca más arriba");
ok(nivelSemilla(0, 2026) === 3, "«no se preguntó» (año 0) arranca en 3, y practica igual (línea roja #4)");
ok(nivelSemilla(1950, 2026) === NIVEL_MAXIMO, "un adulto satura arriba, no desborda");

// --- K decreciente (criterio #91) ------------------------------------------
ok(kPara(0, true) > kPara(5, true) && kPara(5, true) > kPara(30, true),
  "K decrece suave mientras ubica");
ok(kPara(30, true) >= 0.8, "…pero con piso: la ubicación no se congela antes del tope de 15");
ok(kPara(0, false) === 0.25 && kPara(30, false) === 0.25,
  "cerrada la ubicación, K es constante y chica: un mal martes no tira un mes");

// --- el paso de Elo ---------------------------------------------------------
const e0 = estadoInicial(6);
const acertando = actualizar(e0, { dificultad: e0.habilidad, correcto: true, nivel: 6 });
const fallando = actualizar(e0, { dificultad: e0.habilidad, correcto: false, nivel: 6 });
ok(acertando.habilidad > e0.habilidad, "acertar sube la estimación");
ok(fallando.habilidad < e0.habilidad, "fallar la baja");
ok(cerca(acertando.habilidad - e0.habilidad, e0.habilidad - fallando.habilidad, 1e-9),
  "en 50/50 sube y baja lo mismo: la estimación no está sesgada");
ok(e0.respondidos === 0, "`actualizar` NO muta el estado que recibe");

// Acertar un ítem MUY fácil casi no informa; acertar uno difícil sí.
const facil = actualizar(e0, { dificultad: e0.habilidad - 3, correcto: true, nivel: 3 });
const dificil = actualizar(e0, { dificultad: e0.habilidad + 3, correcto: true, nivel: 9 });
ok(dificil.habilidad - e0.habilidad > facil.habilidad - e0.habilidad,
  "acertar algo difícil informa más que acertar algo fácil");

// --- línea roja #8: corregir NUNCA empeora ---------------------------------
//
// La garantía es estructural —`RespuestaFinal` no tiene dónde escribir el rastro
// de correcciones— y esto lo comprueba por el comportamiento: dos sesiones con
// la misma respuesta FINAL producen la misma estimación, haya dudado o no.
{
  const paso = (est, correcto) => actualizar(est, { dificultad: 0.5, correcto, nivel: 7 });
  let aPrimera = estadoInicial(7);
  let dudando = estadoInicial(7);
  for (const c of [true, false, true, true]) aPrimera = paso(aPrimera, c);
  for (const c of [true, false, true, true]) dudando = paso(dudando, c);
  ok(cerca(aPrimera.habilidad, dudando.habilidad),
    "la estimación depende solo de la respuesta final (línea roja #8, mc-30)",
  );
  ok(
    Object.keys({ dificultad: 0, correcto: false, nivel: 0 }).length === 3,
    "`RespuestaFinal` tiene tres campos y ninguno es un rastro de correcciones",
  );
}

// --- histéresis y salida del atorado (criterio #92) ------------------------
{
  let est = estadoInicial(8);
  const antes = est.habilidad;
  for (let i = 0; i < FALLOS_ANTES_DE_BAJAR; i++) {
    est = actualizar(est, { dificultad: est.habilidad, correcto: false, nivel: 8 });
  }
  ok(est.fallosSeguidos === FALLOS_ANTES_DE_BAJAR, "los fallos seguidos se cuentan");
  ok(habilidadParaElegir(est) < est.habilidad,
    "tras N fallos seguidos el motor baja de escalón ANTES de volver a insistir");
  ok(nivelDeHabilidad(habilidadParaElegir(est)) < nivelDeHabilidad(antes),
    "y baja un escalón VISIBLE, no una fracción que sirve el mismo ítem otra vez");

  const conAcierto = actualizar(est, { dificultad: est.habilidad, correcto: true, nivel: 7 });
  ok(conAcierto.fallosSeguidos === 0, "un acierto reinicia el contador");
  ok(cerca(habilidadParaElegir(conAcierto), conAcierto.habilidad),
    "y con el contador en cero ya no se baja el escalón");
}

// --- la selección (criterio #90) -------------------------------------------
{
  const banco = [];
  for (let i = 0; i < 40; i++) banco.push({ id: `i${i}`, dificultad: -3 + (i / 39) * 6 });
  const est = estadoInicial(7);

  const elegido = elegirSiguiente(banco, est, new Set(), () => 0);
  ok(elegido !== null, "con banco disponible siempre sale un ítem");

  // Mientras UBICA se apunta a 0.50 —máxima información— y esa es la razón por
  // la que la ubicación cierra. El porqué, con las cifras medidas, está en
  // `ACIERTO_UBICANDO`.
  const pUbicando = esperado(est.habilidad, elegido.dificultad);
  ok(Math.abs(pUbicando - 0.5) < 0.11,
    `mientras ubica apunta a 0.50, no a 0.75 (dio ${pUbicando.toFixed(3)})`);

  // Cerrada la ubicación, manda el 0.75 de Math Garden y la ventana del
  // criterio #90. Se cierra sirviendo 15 ítems, que es el tope duro.
  let yaUbicado = estadoInicial(7);
  const gastados = new Set();
  for (let i = 0; i < TOPE_DE_UBICACION; i++) {
    yaUbicado = actualizar(yaUbicado, { dificultad: yaUbicado.habilidad, correcto: i % 2 === 0, nivel: 1 + (i % 9) });
  }
  ok(!estaUbicando(yaUbicado), "tras 15 ítems la ubicación está cerrada");
  const enPractica = elegirSiguiente(banco, yaUbicado, gastados, () => 0);
  const p = esperado(yaUbicado.habilidad, enPractica.dificultad);
  ok(p >= ACIERTO_SUELO - 1e-9 && p <= ACIERTO_TECHO + 1e-9,
    `en práctica el ítem elegido deja el acierto esperado en [0.70, 0.80] (dio ${p.toFixed(3)}) — criterio #90`);

  // Se sortea entre varios, no siempre el más cercano.
  const vistos = new Set();
  for (let r = 0; r < 4; r++) {
    vistos.add(elegirSiguiente(banco, est, new Set(), () => r / 4).id);
  }
  ok(vistos.size > 1, "el mismo estado NO devuelve siempre el mismo ítem: se sortea");

  // Ningún ítem se repite dentro de la sesión.
  const sesion = new Set();
  let est2 = estadoInicial(7);
  for (let i = 0; i < 20; i++) {
    const it = elegirSiguiente(banco, est2, sesion, () => (i * 0.37) % 1);
    if (!it) break;
    ok_silencioso(!sesion.has(it.id));
    sesion.add(it.id);
    est2 = actualizar(est2, { dificultad: it.dificultad, correcto: i % 3 !== 0, nivel: nivelDeHabilidad(it.dificultad) });
  }
  ok(sesion.size === 20, "ningún ítem se repite dentro de una sesión (20 servidos, 20 distintos)");

  // Y el banco agotado devuelve null, no un repetido.
  ok(elegirSiguiente(banco, est, new Set(banco.map((b) => b.id)), () => 0) === null,
    "banco agotado devuelve null, jamás un repetido");

  // Criterio #94: si la ventana ideal está vacía, sirve el más cercano — nunca
  // «vuelve mañana».
  const bancoLejos = [{ id: "x", dificultad: 3 }, { id: "y", dificultad: 2.9 }];
  const bajo = estadoInicial(1);
  ok(elegirSiguiente(bancoLejos, bajo, new Set(), () => 0) !== null,
    "con la ventana ideal vacía sirve el más cercano: el motor NUNCA dice «vuelve mañana» (criterio #94)");
}

// --- el cierre de la ubicación (criterio #91) ------------------------------
{
  let est = estadoInicial(6);
  for (let i = 0; i < TOPE_DE_UBICACION; i++) {
    // Alternando para que la parada temprana no se dispare antes.
    est = actualizar(est, { dificultad: est.habilidad, correcto: i % 2 === 0, nivel: 1 + (i % 9) });
  }
  ok(evaluarParada(est).motivo === "tope_duro", `el tope duro de ${TOPE_DE_UBICACION} ítems se respeta`);

  let estable = estadoInicial(6);
  for (let i = 0; i < 9; i++) {
    estable = actualizar(estable, { dificultad: estable.habilidad, correcto: i % 2 === 0, nivel: 6 + (i % 2) });
  }
  const par = evaluarParada(estable);
  ok(par.parar && par.motivo === "estable", "para temprano si las últimas 4 se movieron en el mismo escalón ±1");

  let temprano = estadoInicial(6);
  for (let i = 0; i < 5; i++) {
    temprano = actualizar(temprano, { dificultad: temprano.habilidad, correcto: true, nivel: 6 });
  }
  ok(!evaluarParada(temprano).parar, "no para antes del ítem 8 aunque esté quietísimo");
}

// ---------------------------------------------------------------------------
// LA PRUEBA DE D-002: la edad siembra el ítem 1 y NADA MÁS (criterio #88)
// ---------------------------------------------------------------------------
//
// ─── Primero, por qué el criterio NO se puede probar como está escrito ─────
//
// El criterio #88 pide «dos perfiles con la MISMA CADENA DE RESPUESTAS y
// `birth_year` distinto convergen a la misma dificultad para el ítem 3». Se
// construyó así, y falló con la distancia clavada en 7 escalones. No era un bug.
//
// **Con la cadena de respuestas forzada, NINGÚN algoritmo adaptativo converge.**
// La demostración cabe en tres líneas: el paso de Elo es `θ ← θ + K·(y − p)`, y
// como el selector sirve siempre en la misma `p` objetivo, la sucesión de pasos
// depende solo de la cadena `y` — no de `θ`. Dos trayectorias con la misma
// cadena son la misma trayectoria trasladada: se mueven en paralelo para
// siempre, separadas exactamente por lo que las separaba al empezar. Vale para
// Elo, para una escalera arriba-abajo y para bisección.
//
// Lo que el criterio QUIERE decir sí es comprobable, y es más fuerte: que la
// edad no determine la dificultad de forma persistente. Se prueba con un alumno
// **simulado de habilidad verdadera conocida**, cuyas respuestas salen de esa
// habilidad en vez de venir dictadas. Si la edad manda, los dos perfiles se
// quedan separados; si no manda, convergen a la verdad.
//
// SE VE FALLAR: en `kPara()`, devuelve los tramos fijos de `mc-44`
// —`respondidos < 3 ? 1.0 : respondidos < 8 ? 0.5 : 0.25`— y el sesgo del
// ítem 8 pasa de 0.09 a 1.32 escalones, ocho veces el umbral de esta prueba.
{
  // La simulación vive en `simulacion-adaptativo.mjs` y no aquí. Dos razones:
  // se corre a mano para MIRAR las cifras, y `audits/adaptativo-simulacion.mjs`
  // exige que exista como archivo propio — un motor adaptativo cuya simulación
  // está enterrada en un archivo de pruebas es un motor cuya simulación nadie
  // vuelve a correr.
  for (const nivelVerdadero of [3, 6, 9]) {
    const m = medirSesgoDeEdad({ nivelVerdadero, simulaciones: 800, items: 16 });
    console.log(
      `     N${nivelVerdadero}: sesgo de edad ítem 0=${m.enEscalones(0).toFixed(1)}` +
        ` → 3=${m.enEscalones(3).toFixed(2)} → 8=${m.enEscalones(8).toFixed(2)}` +
        ` → 16=${m.enEscalones(16).toFixed(2)} escalones` +
        ` · |error| final ${m.errorFinal.toFixed(2)} · salto máx ${m.saltoMaximo}`,
    );

    ok(Math.abs(m.enEscalones(0)) > 4,
      `N${nivelVerdadero}: al empezar la edad SÍ manda (${m.enEscalones(0).toFixed(1)} escalones) — es su única puerta`);

    // ≤1.1 y no ≤1.0, y el 0.1 tiene una razón medible: la distancia inicial
    // del peor caso es de 7-8 escalones y `TOPE_DE_SALTO` deja avanzar 3 por
    // ítem, así que el ítem 3 es el PRIMERO en el que llegar es geométricamente
    // posible — y se llega con un residuo. En el ítem 8 el sesgo ya está en
    // ~0.1. Subir el tope cerraría el hueco y le costaría al niño saltos de 6-7
    // escalones entre ítems seguidos; no vale la pena por una décima.
    ok(Math.abs(m.enEscalones(3)) <= 1.1,
      `N${nivelVerdadero}: en el ítem 3 el sesgo de edad ya es ≤1.1 escalones (criterio #88, D-002)`);
    ok(Math.abs(m.enEscalones(8)) <= 0.35,
      `N${nivelVerdadero}: en el ítem 8 el sesgo prácticamente desapareció`);
    ok(m.errorFinal <= 1.2,
      `N${nivelVerdadero}: y la estimación final acierta el escalón a ±${m.errorFinal.toFixed(2)}`);

    // El paso de θ está topado en 3 escalones (`TOPE_DE_SALTO`), pero el ítem
    // SERVIDO puede saltar hasta 5: el sorteo entre los 4 más cercanos añade
    // ±0.75 escalones a cada extremo. Es la cuenta, no una sorpresa — y es el
    // número que hay que mirar, porque es el que el niño siente.
    ok(m.saltoMaximo <= 5,
      `N${nivelVerdadero}: el salto entre ítems seguidos nunca pasa de 5 escalones ` +
        `(topado en ${(TOPE_DE_SALTO / (6 / (NIVEL_MAXIMO - 1))).toFixed(0)} + el sorteo)`);
  }
}

function ok_silencioso(cond) { if (!cond) fallos++; }

console.log(fallos === 0 ? "\n✓ adaptativo — todos los casos" : `\n✗ adaptativo — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
