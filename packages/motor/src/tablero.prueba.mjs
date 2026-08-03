#!/usr/bin/env node
// Casos del tablero global y del rollup del adulto — D-003, D-025, D-040,
// D-081, #247, #250.
//
//     node --experimental-strip-types packages/motor/src/tablero.prueba.mjs
//
// Por qué existen. El tablero es la única superficie del producto donde el
// error no se ve: una lista ordenada mal sigue siendo una lista ordenada, y una
// escalera de visibilidad rota le enseña a un niño de siete años que es el
// 4.812º sin que nada falle. Lo que estos casos fijan es lo que NO puede
// viajar.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  TOP_PRIMARIA,
  TOP_TABLERO,
  ordenarPorPuntos,
  formaDeTablero,
  armarTablero,
  SQL_TOP_NINO,
  SQL_TOP_ADULTO,
} from "./tablero.ts";
import {
  PERMITIDAS_PARA_ADULTO,
  agregarAdulto,
  validarLoteAdulto,
  SQL_UPSERT_ADULTO,
} from "./rollup-adulto.ts";

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
  if (a !== b) throw new Error(`${msg ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
};

const filas = [];
for (let i = 0; i < 60; i++) {
  filas.push({ alias: `Alias${i}`, total_score: 6000 - i * 10, id: `p${String(i).padStart(3, "0")}` });
}

console.log("\n== tablero global y rollup del adulto ==\n");

// --- D-025: puntos, nunca θ ni velocidad -----------------------------------

caso("ordena por puntos descendente", () => {
  const o = ordenarPorPuntos([...filas].reverse());
  igual(o[0].id, "p000", "el de más puntos primero");
  igual(o[59].id, "p059", "el de menos, último");
});

caso("a igualdad de puntos el desempate es estable, no el orden del SELECT", () => {
  const empatados = [
    { alias: "C", total_score: 100, id: "c" },
    { alias: "A", total_score: 100, id: "a" },
    { alias: "B", total_score: 100, id: "b" },
  ];
  igual(ordenarPorPuntos(empatados).map((f) => f.id).join(""), "abc");
  igual(ordenarPorPuntos([...empatados].reverse()).map((f) => f.id).join(""), "abc");
});

caso("ordenar no muta la entrada", () => {
  const copia = [...filas];
  ordenarPorPuntos(copia);
  igual(copia[0].id, "p000", "la entrada llegó ordenada y sigue igual");
});

// --- La escalera por banda (#247, D-081) -----------------------------------

caso("cada banda tiene su forma de tablero", () => {
  igual(formaDeTablero("KINDER").forma, "tercios");
  igual(formaDeTablero("PRIMARIA").forma, "top_y_propio");
  igual(formaDeTablero("PRIMARIA").top, TOP_PRIMARIA);
  for (const b of ["SECUNDARIA", "SERIO", "JR", "PRO"]) {
    igual(formaDeTablero(b).forma, "exacta", b);
    igual(formaDeTablero(b).top, TOP_TABLERO, b);
  }
});

caso("KINDER: ni un número de posición viaja en la respuesta", () => {
  const v = armarTablero("KINDER", filas, "p040");
  igual(v.mi_posicion.forma, "tercio");
  if (JSON.stringify(v).includes('"rank"')) throw new Error("un rank numérico viajó dentro");
  for (const e of v.lista) igual(e.posicion.forma, "tercio", e.alias);
});

caso("KINDER no publica el fondo de la tabla", () => {
  const v = armarTablero("KINDER", filas, "p000");
  if (v.lista.some((e) => e.posicion.tercio === "bottom")) {
    throw new Error("la lista de kinder llegó hasta el tercio de abajo (mc-18 implicación 7)");
  }
});

caso("PRIMARIA fuera del top 20 ve solo su propio total", () => {
  const v = armarTablero("PRIMARIA", filas, "p045");
  igual(v.lista.length, 0, "sin lista");
  igual(v.mi_posicion, null, "sin rango, ni siquiera el propio");
  igual(v.mi_total, 5550, "su total sí, siempre");
});

caso("PRIMARIA dentro del top 20 sí ve la lista — el control positivo", () => {
  const v = armarTablero("PRIMARIA", filas, "p003");
  igual(v.lista.length, TOP_PRIMARIA, "la lista completa");
  igual(v.mi_posicion.rank, 4, "y su posición");
  igual(v.lista.filter((e) => e.soy_yo).length, 1, "«tú estás aquí», una sola vez");
});

caso("SECUNDARIA y arriba ven posición exacta incluso fuera del top", () => {
  for (const b of ["SECUNDARIA", "SERIO", "JR", "PRO"]) {
    const v = armarTablero(b, filas, "p059");
    igual(v.mi_posicion.forma, "exacta", b);
    igual(v.mi_posicion.rank, 60, b);
  }
});

caso("quien no está en la lista recibe total 0 y ninguna posición", () => {
  const v = armarTablero("SECUNDARIA", filas, "no-existe");
  igual(v.mi_total, 0);
  igual(v.mi_posicion, null);
});

caso("una entrada del tablero publica cuatro campos y ninguno más", () => {
  const e = armarTablero("SECUNDARIA", filas, "p000").lista[0];
  igual(Object.keys(e).sort().join(","), "alias,posicion,soy_yo,total_score");
});

// --- Las dos consultas, que no se unen nunca (#250, D-027) ----------------

caso("la consulta de niños lleva el opt-in dentro, y la de adultos no la toca", () => {
  if (!/child_consents/.test(SQL_TOP_NINO)) throw new Error("SQL_TOP_NINO no cruza child_consents (D-040)");
  if (!/LEADERBOARD/.test(SQL_TOP_NINO)) throw new Error("no filtra por el código LEADERBOARD");
  if (!/revoked_at IS NULL/.test(SQL_TOP_NINO)) throw new Error("no exige que el consentimiento siga vigente");
  if (/score_totals_adulto/.test(SQL_TOP_NINO)) throw new Error("la consulta de niños toca la tabla de adultos");
  if (/child_profiles|child_consents/.test(SQL_TOP_ADULTO)) throw new Error("la de adultos toca tablas de niño");
});

caso("ninguna de las dos consultas usa UNION", () => {
  for (const [nombre, sql] of [["SQL_TOP_NINO", SQL_TOP_NINO], ["SQL_TOP_ADULTO", SQL_TOP_ADULTO]]) {
    if (/\bUNION\b/i.test(sql)) throw new Error(`${nombre} une las dos tablas de puntos`);
  }
});

caso("las dos ordenan por puntos y con desempate estable", () => {
  for (const [nombre, sql] of [["SQL_TOP_NINO", SQL_TOP_NINO], ["SQL_TOP_ADULTO", SQL_TOP_ADULTO]]) {
    if (!/ORDER BY s\.total_score DESC/.test(sql)) throw new Error(`${nombre} no ordena por puntos`);
    if (!/id ASC/.test(sql)) throw new Error(`${nombre} no tiene desempate estable`);
  }
});

caso("ninguna consulta selecciona un campo de identidad real", () => {
  for (const [nombre, sql] of [["SQL_TOP_NINO", SQL_TOP_NINO], ["SQL_TOP_ADULTO", SQL_TOP_ADULTO]]) {
    for (const campo of ["email", "first_name", "display_name", "birth_year", "avatar_url"]) {
      if (new RegExp(campo, "i").test(sql)) throw new Error(`${nombre} selecciona ${campo}`);
    }
    if (!/alias/.test(sql)) throw new Error(`${nombre} no publica el alias`);
  }
});

// --- El rollup del adulto (#250) -------------------------------------------

caso("un adulto no acumula en la banda de un niño", () => {
  igual(PERMITIDAS_PARA_ADULTO.join(","), "SECUNDARIA,SERIO,JR,PRO");
  const lote = agregarAdulto([{ userId: "u1", period: "all_time", themeBand: "KINDER", puntos: 10 }]);
  const p = validarLoteAdulto(lote);
  if (p.length === 0) throw new Error("aceptó un lote de adulto en banda KINDER");
});

caso("agrega muchos intentos en pocas filas: eso es «por lotes»", () => {
  const intentos = [];
  for (let i = 0; i < 300; i++) {
    intentos.push({ userId: `u${i % 10}`, period: "all_time", themeBand: "SERIO", puntos: 3 });
  }
  const lote = agregarAdulto(intentos);
  igual(lote.filas.length, 10, "diez cuentas, diez filas");
  igual(lote.intentosAgregados, 300);
  igual(lote.filas[0].delta, 90, "los puntos de cada cuenta se suman");
  igual(validarLoteAdulto(lote).length, 0, "y el lote es válido");
});

caso("un itemId en la fila convierte la tabla en una tabla por intento", () => {
  const lote = agregarAdulto([{ userId: "u1", period: "all_time", themeBand: "SERIO", puntos: 5 }]);
  lote.filas[0].itemId = "i-42";
  const p = validarLoteAdulto(lote);
  if (!p.some((x) => x.includes("itemId"))) throw new Error("no rechazó el itemId (mc-32 riesgo #1)");
});

caso("el upsert manda el incremento, nunca el total", () => {
  if (!/total_score = total_score \+ excluded\.total_score/.test(SQL_UPSERT_ADULTO)) {
    throw new Error("el upsert escribe el total en vez de sumarlo: entre leer y escribir cabe otro lote");
  }
  if (!/ON CONFLICT \(user_id, period\)/.test(SQL_UPSERT_ADULTO)) {
    throw new Error("el upsert no tiene la llave de conflicto correcta");
  }
});

caso("un lote que no comprime nada se rechaza", () => {
  const p = validarLoteAdulto({
    filas: [
      { userId: "a", period: "all_time", themeBand: "SERIO", delta: 1 },
      { userId: "b", period: "all_time", themeBand: "SERIO", delta: 1 },
    ],
    intentosAgregados: 1,
  });
  if (p.length === 0) throw new Error("«por lotes» tiene que comprimir, o es «por intento» con más pasos");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
