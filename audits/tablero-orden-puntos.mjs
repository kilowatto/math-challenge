#!/usr/bin/env node
// Auditor determinista — el tablero ordena por PUNTOS, y cada banda ve lo suyo
//
// Hace cumplir: **D-025** (el tablero global ordena por puntos, no por θ),
// D-003, D-040, **D-081** (la escalera de visibilidad), D-027, #247, #250,
// `mc-10`, `mc-18`, `mc-25`.
//
// ─── Las cuatro cosas que vigila ───────────────────────────────────────────
//
//  1. **Orden por puntos, nunca por θ ni por velocidad.** D-025 se tomó CONTRA
//     la recomendación de `mc-18`, con sus razones escritas y su condición de
//     revisión (≥200 respuestas por ítem). Mientras esa condición no se cumpla,
//     un orden por habilidad estimada sería ordenar por una estimación sin
//     datos.
//  2. **Tableros separados por banda**, y las dos tablas de puntos —niños y
//     adultos— **jamás unidas con UNION**. Con una consulta unida, una fila del
//     resultado no sabe si es de un niño o de un adulto, y la primera pantalla
//     que se escriba sobre ella los pondrá en la misma lista sin que nadie lo
//     decida. Es el criterio de D-027 aplicado a una consulta.
//  3. **El opt-in vive en la consulta.** D-040: no se inserta fila al crear el
//     perfil, y ningún niño aparece sin una fila `LEADERBOARD` vigente. Un
//     filtro escrito en el código que lee las filas se olvida en la segunda
//     ruta que las lea; un JOIN no se puede olvidar sin borrarlo, y borrarlo se
//     ve en el diff.
//  4. **La escalera de visibilidad de D-081**, ejecutada: KINDER en tercios y
//     nunca un número; PRIMARIA fuera del top 20 sin rango ni vecinos;
//     SECUNDARIA en adelante con posición exacta y «tú estás aquí».
//
// LO QUE NO PUEDE COMPROBAR: si la pantalla PINTA lo que la API le manda. Un
// cliente que reciba el tercio y dibuje «3 de 30» pasaría esto — lo que se
// comprueba es que el número exacto no viaje, que es la mitad que sí se puede
// garantizar desde el servidor.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

// ─── 1, 2 y 3. Las consultas ────────────────────────────────────────────────

const fuentes = archivos(/\.(ts|tsx|js|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

let consultas = 0;

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (!/score_totals/i.test(texto)) continue;
  consultas++;
  comprobaciones++;

  // El UNION entre las dos tablas de puntos, por nombre.
  if (/UNION[\s\S]{0,400}score_totals_adulto/i.test(texto) || /score_totals_adulto[\s\S]{0,400}UNION/i.test(texto)) {
    problemas.push(
      `${archivo}: une \`score_totals\` y \`score_totals_adulto\` con UNION. #250 lo prohíbe por ` +
        "nombre: dos consultas, nunca una que mezcle las dos tablas en una sola fila de " +
        "resultado. Con el UNION, la fila no sabe si es de un niño o de un adulto.",
    );
  }

  // El orden. Cualquier ORDER BY sobre el tablero tiene que ser por puntos.
  for (const m of texto.matchAll(/ORDER\s+BY\s+([^\n;`]+)/gi)) {
    const orden = m[1].toLowerCase();
    if (/theta|habilidad|ability|rt\b|response_time|tiempo|speed|velocidad/.test(orden)) {
      problemas.push(
        `${archivo}: ORDER BY «${m[1].trim().slice(0, 60)}» en una consulta de tablero. D-025: se ` +
          "ordena por PUNTOS, nunca por θ ni por velocidad. El tiempo ya está dentro de la " +
          "fórmula de D-010 y volver a meterlo aquí lo contaría dos veces.",
      );
    }
  }

  // El opt-in. Toda consulta a `score_totals` (la de niños) tiene que cruzar
  // `child_consents`. La de adultos no: un adulto consiente por sí mismo.
  const tocaNinos = /FROM\s+score_totals\b/i.test(texto);
  if (tocaNinos && !/child_consents/.test(texto)) {
    problemas.push(
      `${archivo}: consulta \`score_totals\` sin cruzar \`child_consents\`. D-040: ningún perfil ` +
        "de niño aparece en ninguna instantánea del tablero sin una fila LEADERBOARD vigente " +
        "(`revoked_at IS NULL`). Y `mc-25` recital 26: un alias sigue siendo dato personal " +
        "mientras nosotros guardemos el mapeo.",
    );
  }
}

// El tablero de KINDER no se renderiza dentro del árbol del niño (#247): existe
// como widget del panel del padre y en ningún otro sitio.
const DEL_NINO = /(^|\/)(app\/kids|components\/kids)\//;
for (const archivo of fuentes.filter((f) => DEL_NINO.test(f))) {
  comprobaciones++;
  const texto = sinComentarios(leer(archivo) ?? "");
  if (/(score_totals|tablero|leaderboard)/i.test(texto)) {
    problemas.push(
      `${archivo}: el tablero aparece dentro del árbol del niño. #247: el tablero de la banda ` +
        "KINDER nunca se renderiza en `/app/kids/**`; solo existe como widget del panel del " +
        "padre. `mc-10` mide que la presión de rendimiento empeora el desempeño en matemáticas.",
    );
  }
}

// ─── 4. La escalera de visibilidad, ejecutada ───────────────────────────────

const tablero = await import("../packages/motor/src/tablero.ts").catch((e) => {
  problemas.push(`no pude importar packages/motor/src/tablero.ts: ${String(e).slice(0, 120)}`);
  return null;
});

if (tablero) {
  const filas = [];
  for (let i = 0; i < 60; i++) {
    filas.push({ alias: `Alias${i}`, total_score: 6000 - i * 10, id: `p${String(i).padStart(3, "0")}` });
  }

  // Orden: por puntos, descendente, con desempate estable.
  comprobaciones++;
  const orden = tablero.ordenarPorPuntos([...filas].reverse());
  if (orden[0].id !== "p000" || orden[59].id !== "p059") {
    problemas.push("`ordenarPorPuntos` no ordena por puntos descendente.");
  }

  // KINDER: tercio, jamás número.
  comprobaciones++;
  const kinder = tablero.armarTablero("KINDER", filas, "p040");
  if (kinder.mi_posicion?.forma !== "tercio") {
    problemas.push(
      "en KINDER la posición no llega en tercios. D-081: «si se activa, la posición se muestra " +
        "en tercios, nunca el número exacto». Y se calcula en el servidor: mandar el número y " +
        "esconderlo en el cliente lo deja en la respuesta, en las herramientas del navegador y " +
        "en cualquier registro de red.",
    );
  }
  if (JSON.stringify(kinder).match(/"rank"\s*:/)) {
    problemas.push(
      "la respuesta de KINDER lleva un `rank` numérico dentro. Nunca el número exacto, y nunca " +
        "el último lugar (`mc-18` implicación 7).",
    );
  }

  // PRIMARIA fuera del top 20: solo su propio total.
  comprobaciones++;
  const fuera = tablero.armarTablero("PRIMARIA", filas, "p045");
  if (fuera.lista.length !== 0 || fuera.mi_posicion !== null) {
    problemas.push(
      "PRIMARIA fuera del top 20 recibió lista o posición. #247: ve SOLO su propio total " +
        "acumulado, nunca un rango, una posición ni un vecino.",
    );
  }
  if (fuera.mi_total !== 5550) {
    problemas.push(`PRIMARIA fuera del top 20 no recibió su propio total (${fuera.mi_total} ≠ 5550).`);
  }

  // PRIMARIA dentro del top 20: sí ve la lista. Control positivo — sin él, un
  // `armarTablero` que devolviera siempre vacío pasaría el caso de arriba.
  comprobaciones++;
  const dentro = tablero.armarTablero("PRIMARIA", filas, "p003");
  if (dentro.lista.length !== 20 || dentro.mi_posicion === null) {
    problemas.push(
      "PRIMARIA dentro del top 20 no recibió la lista. Un tablero que devuelve siempre vacío " +
        "pasaría el caso anterior sin vigilar nada (D-070).",
    );
  }

  // SECUNDARIA en adelante: posición exacta incluso fuera del top 100.
  comprobaciones++;
  const secundaria = tablero.armarTablero("SECUNDARIA", filas, "p059");
  if (secundaria.mi_posicion?.forma !== "exacta" || secundaria.mi_posicion.rank !== 60) {
    problemas.push(
      "SECUNDARIA no recibió su posición numérica exacta. #247: «tú estás aquí» incluso fuera " +
        "del top 100.",
    );
  }
}

notas.push(`${consultas} archivo(s) con consultas de tablero · ${comprobaciones} comprobación(es)`);
notas.push("D-025 se tomó contra mc-18 y su condición de revisión (≥200 respuestas por ítem) sigue abierta");

informar({
  nombre: "tablero-orden-puntos",
  problemas,
  notas,
  cita: "D-025, D-003, D-040, D-081, D-027, #247, #250, mc-10, mc-18, mc-25",
  revisados: comprobaciones,
  resumen: `${comprobaciones} comprobación(es) sobre orden, opt-in y escalera de visibilidad`,
  porQueBloquea:
    "un niño de kinder y un adulto no pueden leer el mismo ranking crudo, y un perfil sin " +
    "consentimiento no puede aparecer en ninguna lista: las dos cosas se rompen con una consulta.",
  noComprueba: [
    "si la pantalla PINTA lo que la API le manda. Un cliente que reciba el tercio y dibuje " +
      "«3 de 30» pasaría esto; lo que se garantiza desde el servidor es que el número no viaje.",
  ],
});
