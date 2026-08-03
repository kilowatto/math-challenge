#!/usr/bin/env node
// Casos del motor de ligas — D-003, D-025, D-056, D-081, #237, #238, #241, #243.
//
//     node --experimental-strip-types packages/motor/src/liga.prueba.mjs
//
// Por qué existen. Un error aquí no rompe nada visible. Produce un ascenso que
// le tocaba a otro, un descenso que cayó sobre la familia que respetó su límite
// de pantalla, o —la peor— un número exacto de posición enseñado a un niño de
// cinco años, que es justo lo que D-081 prohíbe y lo que `mc-10` mide que
// empeora el desempeño en matemáticas.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import {
  BANDAS_DE_LIGA,
  TAMANIO_OBJETIVO,
  SUBEN_DE_30,
  BAJAN_DE_30,
  MINIMO_ACTIVOS,
  ESCALON_TOPE,
  ESCALON_MINIMO,
  claveDeCohorte,
  cabeEn,
  elegirCohorte,
  semanaDe,
  cupos,
  ordenar,
  estaActivo,
  cerrarCiclo,
  posicionVisible,
  verPar,
  participaEnLiga,
} from "./liga.ts";

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

const miembro = (id, puntos, dias, joined = 1000) => ({
  id,
  child_profile_id: `c-${id}`,
  user_id: null,
  points_this_week: puntos,
  active_days: dias,
  joined_at: joined,
});

console.log("\n== motor de ligas ==\n");

// --- Las dos particiones (#237, #238) --------------------------------------

caso("las seis bandas salen del motor de puntuación, no de una copia", () => {
  igual(BANDAS_DE_LIGA.length, 6, "seis bandas (D-010)");
  for (const b of ["KINDER", "PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"]) {
    if (!BANDAS_DE_LIGA.includes(b)) throw new Error(`falta la banda ${b}`);
  }
});

caso("la llave separa por banda Y por tipo de participante", () => {
  const s = "2026-08-03";
  const a = claveDeCohorte("PRIMARIA", "child", 3, s);
  if (a === claveDeCohorte("PRIMARIA", "adult", 3, s)) throw new Error("niño y adulto comparten cohorte");
  if (a === claveDeCohorte("SECUNDARIA", "child", 3, s)) throw new Error("dos bandas comparten cohorte");
  if (a === claveDeCohorte("PRIMARIA", "child", 4, s)) throw new Error("dos escalones comparten cohorte");
  if (a === claveDeCohorte("PRIMARIA", "child", 3, "2026-08-10")) throw new Error("dos semanas comparten cohorte");
});

caso("una banda inventada o un escalón fuera de la escalera no se aceptan", () => {
  lanza(() => claveDeCohorte("UNIVERSIDAD", "child", 3, "2026-08-03"), "banda desconocida");
  lanza(() => claveDeCohorte("PRIMARIA", "grupo", 3, "2026-08-03"), "tipo de participante");
  lanza(() => claveDeCohorte("PRIMARIA", "child", ESCALON_TOPE + 1, "2026-08-03"), "fuera de la escalera");
});

// --- Formación sin sala de espera (#237) -----------------------------------

caso("sin cohorte con cupo se abre una nueva; nadie espera", () => {
  const r = elegirCohorte([], "PRIMARIA", "child", "2026-08-03");
  igual(r.cohorte, null, "no hay cohorte");
  igual(r.motivo, "abrir_nueva", "la respuesta nunca es «espera»");
});

caso("entra en la más llena que todavía tenga cupo, y el desempate es el id", () => {
  const base = { banda: "PRIMARIA", tipo_participante: "child", escalon: 1, week_start: "2026-08-03" };
  const r = elegirCohorte(
    [
      { ...base, id: "c3", member_count: 5 },
      { ...base, id: "c1", member_count: 29 },
      { ...base, id: "c2", member_count: 29 },
      { ...base, id: "lleno", member_count: TAMANIO_OBJETIVO },
    ],
    "PRIMARIA",
    "child",
    "2026-08-03",
  );
  igual(r.cohorte.id, "c1", "la más llena con cupo, y a igualdad el id menor");
});

caso("una cohorte llena no admite a nadie más", () => {
  const c = {
    id: "x",
    banda: "PRIMARIA",
    tipo_participante: "child",
    escalon: 1,
    week_start: "2026-08-03",
    member_count: TAMANIO_OBJETIVO,
  };
  igual(cabeEn(c, "PRIMARIA", "child", "2026-08-03").cabe, false, "llena");
});

// --- La semana (UTC, lunes) ------------------------------------------------

caso("la semana empieza en lunes, y el domingo retrocede seis días", () => {
  // 2026-08-03 es lunes; 2026-08-09, domingo.
  igual(semanaDe(Date.UTC(2026, 7, 3)).week_start, "2026-08-03", "lunes");
  igual(semanaDe(Date.UTC(2026, 7, 9)).week_start, "2026-08-03", "domingo, misma semana");
  igual(semanaDe(Date.UTC(2026, 7, 10)).week_start, "2026-08-10", "el lunes siguiente ya es otra");
  igual(semanaDe(Date.UTC(2026, 7, 3)).week_end, "2026-08-09", "termina el domingo");
});

// --- Los cupos de D-056 (#241) ---------------------------------------------

caso("las cifras de D-056 en una liga completa: 7 suben, 5 bajan", () => {
  igual(SUBEN_DE_30, 7, "SUBEN_DE_30");
  igual(BAJAN_DE_30, 5, "BAJAN_DE_30");
  const c = cupos(30);
  igual(c.suben, 7, "suben");
  igual(c.bajan, 5, "bajan");
});

caso("bajo el mínimo de activos la cohorte se congela", () => {
  for (let n = 0; n < MINIMO_ACTIVOS; n++) {
    igual(cupos(n).suben, 0, `suben con ${n} activos`);
    igual(cupos(n).bajan, 0, `bajan con ${n} activos`);
  }
});

caso("de 5 a 9 activos se mueve exactamente uno en cada dirección", () => {
  for (let n = 5; n <= 9; n++) {
    igual(cupos(n).suben, 1, `suben con ${n}`);
    igual(cupos(n).bajan, 1, `bajan con ${n}`);
  }
});

caso("de 10 a 29 se escala, con mínimo 1 y sin que las dos zonas se solapen", () => {
  for (let n = 10; n <= 29; n++) {
    const c = cupos(n);
    igual(c.suben, Math.max(1, Math.round((n * 7) / 30)), `suben con ${n}`);
    if (c.suben + c.bajan > n) throw new Error(`con ${n} activos las zonas se solapan`);
    if (c.bajan < 0) throw new Error("cupo de descenso negativo");
  }
});

// --- El ciclo (#241, D-014) ------------------------------------------------

caso("el descenso no alcanza a un inactivo, aunque esté al fondo de la tabla", () => {
  const miembros = [];
  for (let i = 0; i < 7; i++) miembros.push(miembro(`a${i}`, 1000 - i * 10, 3, 1000 + i));
  for (let i = 0; i < 3; i++) miembros.push(miembro(`z${i}`, 0, 0, 2000 + i));

  const r = cerrarCiclo(5, miembros);
  const bajan = r.filter((x) => x.outcome === "BAJA").map((x) => x.membership_id);
  igual(bajan.length, 1, "un descenso con 7 activos");
  igual(bajan[0], "a6", "el activo peor ubicado, no el último de la tabla cruda");
  for (const x of r) {
    if (x.membership_id.startsWith("z") && x.outcome !== "SE_QUEDA") {
      throw new Error(`el inactivo ${x.membership_id} salió con ${x.outcome}`);
    }
  }
});

caso("nadie sube ni baja si no hay activos suficientes", () => {
  const miembros = [miembro("a", 10, 1), miembro("b", 5, 1), miembro("c", 1, 0)];
  for (const x of cerrarCiclo(5, miembros)) igual(x.outcome, "SE_QUEDA", x.membership_id);
});

caso("el mismo cierre con las filas barajadas da exactamente lo mismo", () => {
  const miembros = [];
  for (let i = 0; i < 30; i++) miembros.push(miembro(`m${String(i).padStart(2, "0")}`, 3000 - i * 7, 4, 900 + i));

  const clave = (r) => r.map((x) => `${x.membership_id}:${x.final_rank}:${x.outcome}:${x.escalon_siguiente}`).join("|");
  const a = clave(cerrarCiclo(4, miembros));
  const b = clave(cerrarCiclo(4, [...miembros].reverse()));
  const c = clave(cerrarCiclo(4, [...miembros].sort((x, y) => (x.id < y.id ? 1 : -1))));
  igual(a, b, "orden invertido");
  igual(a, c, "otro orden más");
});

caso("empatados en todo, el desempate sigue siendo estable", () => {
  const iguales = [miembro("b", 100, 3, 500), miembro("a", 100, 3, 500), miembro("c", 100, 3, 500)];
  igual(
    ordenar(iguales).map((m) => m.id).join(""),
    "abc",
    "a igualdad total manda el id, no el orden de llegada del SELECT",
  );
});

caso("desde el escalón tope no se asciende, y sí se desciende", () => {
  const miembros = [];
  for (let i = 0; i < 10; i++) miembros.push(miembro(`m${i}`, 500 - i, 2, 100 + i));
  const r = cerrarCiclo(ESCALON_TOPE, miembros);
  if (r.some((x) => x.outcome === "SUBE")) throw new Error("ascendió alguien desde el tope");
  if (!r.some((x) => x.outcome === "BAJA")) throw new Error("el tope no puede ser un refugio");
  for (const x of r) {
    if (x.escalon_siguiente > ESCALON_TOPE) throw new Error("se salió de la escalera por arriba");
  }
});

caso("desde el primer escalón no se desciende, porque no hay dónde", () => {
  const miembros = [];
  for (let i = 0; i < 10; i++) miembros.push(miembro(`m${i}`, 500 - i, 2, 100 + i));
  const r = cerrarCiclo(ESCALON_MINIMO, miembros);
  if (r.some((x) => x.outcome === "BAJA")) throw new Error("descendió alguien desde el piso");
  for (const x of r) {
    if (x.escalon_siguiente < ESCALON_MINIMO) throw new Error("se salió de la escalera por abajo");
  }
});

caso("`estaActivo` es lo único que decide si alguien entra al reparto", () => {
  igual(estaActivo(miembro("a", 0, 1)), true, "un día basta");
  igual(estaActivo(miembro("b", 9999, 0)), false, "muchos puntos y ningún día no es activo");
});

// --- La condición 1 de D-081: la liga no puede quitar nada -----------------

caso("un ciclo cerrado no devuelve NI UN campo de aprendizaje", () => {
  const miembros = [];
  for (let i = 0; i < 12; i++) miembros.push(miembro(`m${i}`, 100 - i, 3, 100 + i));
  const PROHIBIDOS = ["total_xp", "current_streak", "max_streak", "shields_available", "skill_state"];
  for (const r of cerrarCiclo(3, miembros)) {
    for (const k of Object.keys(r)) {
      if (PROHIBIDOS.includes(k)) throw new Error(`el resultado del ciclo trae \`${k}\``);
    }
  }
  // Y las membresías que entraron salen intactas: el motor es puro.
  igual(miembros[0].points_this_week, 100, "la entrada no se mutó");
});

// --- La escalera de visibilidad (D-081, #243) ------------------------------

caso("en KINDER la posición es un tercio y nunca un número", () => {
  for (let rank = 1; rank <= 30; rank++) {
    const p = posicionVisible("KINDER", rank, 30);
    igual(p.forma, "tercio", `rango ${rank}`);
    if ("rank" in p) throw new Error("el número exacto viajó dentro del tercio");
  }
  igual(posicionVisible("KINDER", 1, 30).tercio, "top");
  igual(posicionVisible("KINDER", 15, 30).tercio, "mid");
  igual(posicionVisible("KINDER", 30, 30).tercio, "bottom");
});

caso("con cohortes chicas el tercio sigue repartiendo bien", () => {
  igual(posicionVisible("KINDER", 1, 4).tercio, "top", "1 de 4");
  igual(posicionVisible("KINDER", 4, 4).tercio, "bottom", "4 de 4");
  igual(posicionVisible("KINDER", 1, 1).tercio, "top", "el único es el primer tercio");
});

caso("de PRIMARIA en adelante la posición es el número exacto", () => {
  for (const b of ["PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"]) {
    const p = posicionVisible(b, 17, 30);
    igual(p.forma, "exacta", b);
    igual(p.rank, 17, b);
  }
});

caso("`verPar` publica cuatro campos y ninguno más", () => {
  const v = verPar(
    { alias: "NutriaVeloz1234", avatar_parts: "{}", points_this_week: 120 },
    "PRIMARIA",
    3,
    30,
  );
  igual(Object.keys(v).sort().join(","), "alias,avatar_parts,points_this_week,posicion");
});

// --- El opt-in (D-040, D-081) ----------------------------------------------

caso("KINDER no entra a una liga sin el consentimiento del padre", () => {
  igual(participaEnLiga("KINDER", "child", false), false, "default apagado");
  igual(participaEnLiga("KINDER", "child", true), true, "el padre lo activó");
});

caso("de PRIMARIA en adelante el default es encendido, y el adulto siempre", () => {
  igual(participaEnLiga("PRIMARIA", "child", false), true, "PRIMARIA sin fila de consentimiento");
  igual(participaEnLiga("SECUNDARIA", "child", false), true, "SECUNDARIA");
  igual(participaEnLiga("KINDER", "adult", false), true, "un adulto consiente por sí mismo");
});

// --- Forma de las firmas: nada que se pueda comprar (línea roja #5) --------

caso("ninguna función del ciclo acepta un parámetro de más", () => {
  igual(cupos.length, 1, "cupos recibe SOLO el número de activos");
  igual(cerrarCiclo.length, 2, "cerrarCiclo: escalon y miembros");
  igual(participaEnLiga.length, 3, "participaEnLiga: banda, tipo, consentimiento");
});

console.log(`\n${corridos - fallos}/${corridos} casos pasaron\n`);
if (fallos > 0) process.exit(1);
