#!/usr/bin/env node
// Auditor determinista — una cohorte es de UNA banda y de UN tipo de participante
//
// Hace cumplir: #237, #238, D-003, D-010, D-027, D-043, línea roja #2.
//
// ─── Por qué existe, y por qué esta regla no está en ninguna decisión ──────
//
// D-003 separa los tableros por banda de nivel. La separación por **tipo de
// participante** —niño / adulto— salió de la crítica adversarial del diseño de
// F7 y **no está en ninguna decisión previa**, que es exactamente por lo que
// hace falta un auditor: una regla que nadie puede citar es una regla que se
// pierde en la primera refactorización.
//
// Lo que impide: que un adulto y un menor acaben en la misma lista social. D-027
// eliminó la categoría entera de contacto no supervisado entre adultos y
// menores —«sin contacto no supervisado, no hay canal que proteger»— y una
// cohorte mixta la reintroduce por la puerta de atrás, sin chat pero con dos
// personas mirándose en una tabla.
//
// ─── Qué comprueba ─────────────────────────────────────────────────────────
//
//  1. El esquema: `league_cohort` tiene `tipo_participante` como columna de
//     primera clase con su CHECK, y `banda` con las seis de D-010.
//  2. El esquema: `league_membership` tiene el CHECK que obliga a que esté
//     llena exactamente una de las dos FK — ni las dos, ni ninguna.
//  3. El motor, EJECUTADO: la llave de cohorte cambia si cambia la banda y
//     cambia si cambia el tipo. Una llave que ignore cualquiera de las dos
//     fusiona dos poblaciones que no deben verse, y la que se olvida siempre es
//     el tipo de participante, porque no está en ninguna decisión.
//
// LO QUE NO PUEDE COMPROBAR: que quien inserta la membresía elija bien el tipo.
// Si una ruta mete a un adulto como `child_profile_id`, el CHECK no lo nota —
// eso es un error de datos, no de forma.

import { archivos, leer, informar, sqlSinComentarios } from "./lib/repo.mjs";

const problemas = [];
const notas = [];
let comprobaciones = 0;

// ─── 1 y 2. El esquema ──────────────────────────────────────────────────────

const migraciones = archivos(/^migrations\/.*\.sql$/);
let cohorteVista = false;
let membresiaVista = false;

for (const archivo of migraciones) {
  const sql = sqlSinComentarios(leer(archivo) ?? "");

  const cohorte = sql.match(/CREATE\s+TABLE\s+league_cohort\s*\(([\s\S]*?)\n\);/i);
  if (cohorte) {
    cohorteVista = true;
    comprobaciones++;
    const cuerpo = cohorte[1];

    if (!/tipo_participante\s+TEXT[^,]*CHECK\s*\([^)]*'child'[^)]*'adult'[^)]*\)/i.test(cuerpo)) {
      problemas.push(
        `${archivo} · league_cohort no tiene \`tipo_participante\` como columna con CHECK sobre ` +
          "('child','adult'). #238 la pide de primera clase y NO inferida de qué FK esté llena: " +
          "contestar «¿hay cupo en una cohorte de niños?» mirando las filas obliga a tocar datos " +
          "de participantes para decidir dónde meter a uno nuevo.",
      );
    }

    const SEIS = ["KINDER", "PRIMARIA", "SECUNDARIA", "SERIO", "JR", "PRO"];
    const check = cuerpo.match(/banda\s+TEXT[^,]*?CHECK\s*\(([^)]*)\)/i)?.[1] ?? "";
    for (const b of SEIS) {
      if (!check.includes(`'${b}'`)) {
        problemas.push(
          `${archivo} · league_cohort.banda no admite '${b}'. D-010 pone tabla de puntuación para ` +
            "las SEIS bandas, y una liga que no admite una de ellas deja a esa banda sin dónde " +
            "competir sin que nadie lo decida.",
        );
      }
    }
  }

  const membresia = sql.match(/CREATE\s+TABLE\s+league_membership\s*\(([\s\S]*?)\n\);/i);
  if (membresia) {
    membresiaVista = true;
    comprobaciones++;
    const cuerpo = membresia[1];
    const xor =
      /CHECK\s*\(\s*\(\s*child_profile_id\s+IS\s+NOT\s+NULL\s*\)\s*<>\s*\(\s*user_id\s+IS\s+NOT\s+NULL\s*\)\s*\)/i;
    if (!xor.test(cuerpo)) {
      problemas.push(
        `${archivo} · league_membership no tiene el CHECK que obliga a exactamente un dueño ` +
          "(`(child_profile_id IS NOT NULL) <> (user_id IS NOT NULL)`). Sin él, las dos NULL es " +
          "una fila huérfana y las dos llenas es un participante que aparece dos veces en su " +
          "propia liga. Es el mismo patrón de `child_streak` y `xp_totals` (migración 0007).",
      );
    }
  }
}

if (!cohorteVista) problemas.push("no existe `league_cohort` en ninguna migración (#238).");
if (!membresiaVista) problemas.push("no existe `league_membership` en ninguna migración (#238).");

// ─── 3. El motor, ejecutado ─────────────────────────────────────────────────

const liga = await import("../packages/motor/src/liga.ts").catch((e) => {
  problemas.push(`no pude importar packages/motor/src/liga.ts: ${String(e).slice(0, 120)}`);
  return null;
});

if (liga) {
  const semana = "2026-08-03";
  const nino = liga.claveDeCohorte("PRIMARIA", "child", 3, semana);
  const adulto = liga.claveDeCohorte("PRIMARIA", "adult", 3, semana);
  const otraBanda = liga.claveDeCohorte("SECUNDARIA", "child", 3, semana);
  const otroTier = liga.claveDeCohorte("PRIMARIA", "child", 4, semana);
  const otraSemana = liga.claveDeCohorte("PRIMARIA", "child", 3, "2026-08-10");

  comprobaciones += 4;
  if (nino === adulto) {
    problemas.push(
      "la llave de cohorte NO distingue niño de adulto: `claveDeCohorte(...,'child',...)` y " +
        "`(...,'adult',...)` dieron la misma. Un adulto y un menor acabarían en la misma lista " +
        "social, que es la categoría entera que D-027 eliminó.",
    );
  }
  if (nino === otraBanda) {
    problemas.push("la llave de cohorte no distingue la banda (D-003: tableros separados por banda).");
  }
  if (nino === otroTier) problemas.push("la llave de cohorte no distingue el escalon de la escalera.");
  if (nino === otraSemana) problemas.push("la llave de cohorte no distingue la semana.");

  // Y `cabeEn` tiene que rechazar por las mismas razones, no solo la llave: es
  // la función que decide de verdad dónde entra alguien.
  comprobaciones++;
  const cohorteDeNinos = {
    id: "x",
    banda: "PRIMARIA",
    tipo_participante: "child",
    escalon: 3,
    week_start: semana,
    member_count: 0,
  };
  if (liga.cabeEn(cohorteDeNinos, "PRIMARIA", "adult", semana).cabe) {
    problemas.push(
      "`cabeEn` deja entrar a un adulto en una cohorte de niños. La llave puede ser correcta y " +
        "esta función seguir equivocada — es la que se llama de verdad al asignar.",
    );
  }
  if (liga.cabeEn(cohorteDeNinos, "SECUNDARIA", "child", semana).cabe) {
    problemas.push("`cabeEn` deja entrar a otra banda en la cohorte.");
  }
  // Control positivo: si rechazara siempre, todo lo de arriba pasaría.
  comprobaciones++;
  if (!liga.cabeEn(cohorteDeNinos, "PRIMARIA", "child", semana).cabe) {
    problemas.push(
      "`cabeEn` rechaza al participante que SÍ corresponde. Una función que cierra siempre pasa " +
        "todos los casos negativos y no vigila nada (D-070).",
    );
  }

  // Sin sala de espera (#237): sin ninguna cohorte con cupo, la respuesta es
  // «abre una nueva», jamás «espera».
  comprobaciones++;
  const vacio = liga.elegirCohorte([], "PRIMARIA", "child", semana);
  if (vacio.cohorte !== null || vacio.motivo !== "abrir_nueva") {
    problemas.push(
      "sin cohortes con cupo, `elegirCohorte` no pide abrir una nueva. #237: un participante " +
        "nunca se bloquea por falta de liga — una sala de espera significa que un niño abre la " +
        "app y no puede jugar porque todavía no hay suficientes niños como él.",
    );
  }
}

notas.push(`${comprobaciones} comprobación(es) sobre el esquema y sobre el motor ejecutado`);
notas.push("la partición por tipo de participante no está en ninguna decisión: salió de la crítica adversarial de F7");

informar({
  nombre: "liga-sin-fusion-cohorte",
  problemas,
  notas,
  cita: "#237, #238, D-003, D-010, D-027, D-043, línea roja #2",
  revisados: comprobaciones + migraciones.length,
  resumen: `${comprobaciones} comprobación(es) de partición de cohortes`,
  porQueBloquea:
    "una cohorte mixta reintroduce por la puerta de atrás la categoría que D-027 eliminó entera: " +
    "un adulto y un menor mirándose en la misma tabla, sin chat pero juntos.",
  noComprueba: [
    "que quien inserta la membresía elija bien el tipo. Meter a un adulto como `child_profile_id` " +
      "es un error de datos y el CHECK no lo nota.",
  ],
});
