#!/usr/bin/env node
// Auditor determinista — la liga nunca puede quitar nada
//
// Hace cumplir: **D-081, condición 1** (textual: «Descender no borra XP, no
// quita escudos, no toca la racha y no cambia el mapa. Ningún resultado social
// modifica un contador de aprendizaje»), #225, D-055, D-014, línea roja #6.
//
// ─── Por qué existe, y por qué no basta con la buena voluntad ──────────────
//
// El dueño tomó D-081 en contra de mi recomendación y le puso tres condiciones.
// La primera dice, con estas palabras, que la liga no puede quitar nada — y
// además dice cómo hacerla cumplir: **siguiendo el grafo, no la buena
// voluntad.** Esto es ese auditor.
//
// La forma en que esta regla se rompe no es que alguien escriba
// `borrarXpAlDescender()`. Es mucho más barato:
//
//   · «al bajar de liga, la racha se reinicia, si no no tiene consecuencia» —
//     una línea, y suena a diseño de juego razonable;
//   · «guardo el `total_xp` en `league_membership` para no consultarlo dos
//     veces» — y a la semana siguiente alguien lo actualiza desde ahí;
//   · un `UPDATE child_streak` dentro del Workflow del cierre semanal, porque
//     ya está abierta la transacción.
//
// Ninguna de las tres rompe nada visible. Las tres convierten un resultado
// social en un castigo de aprendizaje, que es exactamente lo que `mc-10`
// advierte que empeora el desempeño en matemáticas.
//
// ─── Qué comprueba ─────────────────────────────────────────────────────────
//
//  1. Ningún archivo del subsistema social IMPORTA el motor de racha, el de XP
//     ni el de cosméticos. Sin el import no hay llamada posible.
//  2. Ningún archivo del subsistema social NOMBRA un contador de aprendizaje —
//     ni como columna, ni como identificador, ni dentro de una cadena de SQL.
//  3. Ninguna tabla de liga tiene una columna donde quepa un contador de
//     aprendizaje. Sin columna no hay escritura.
//  4. Ningún UPDATE/DELETE sobre `xp_totals`, `child_streak` o `skill_state`
//     vive en un archivo del subsistema social.
//
// LO QUE NO PUEDE COMPROBAR: una escritura indirecta a través de una función
// que ya existe y que el archivo social llama por otro nombre —un
// `cerrarSemana()` genérico que por dentro toque la racha. Eso exige recorrer
// el grafo de llamadas entre módulos y no cabe en una expresión regular; lo que
// sí cabe, y es donde estuvo el riesgo real, es el import y el nombre de la
// columna.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios, sqlSinComentarios, palabra } from "./lib/repo.mjs";

/** Qué es «el subsistema social». */
const SOCIAL = /(liga|league|duel|duelo|tablero|leaderboard)/i;

/**
 * Los contadores de aprendizaje, por su nombre real de columna o de módulo.
 *
 * Son los nombres que D-081 lista: XP, escudos, racha y mapa. Se buscan tal
 * como se escriben en este repo, que es como los escribió quien los construyó
 * — `child_streak`, `xp_totals`, `shields_available`, `skill_state`.
 */
const CONTADORES = [
  ["total_xp", "el XP de por vida (#192, D-055)"],
  ["xp_totals", "la tabla del XP de por vida (#192)"],
  ["current_streak", "la racha en curso (#201, línea roja #6)"],
  ["max_streak", "la mejor marca personal (#201, mc-17 §83)"],
  ["shields_available", "los escudos ganados (#203, D-079)"],
  ["shields_earned_total", "los escudos ganados (#203)"],
  ["shields_earned_this_streak", "el cupo de escudos de esta racha (D-079)"],
  ["child_streak", "la tabla de la racha (#201)"],
  ["skill_state", "el mapa de progreso por habilidad (F4)"],
  ["cosmetic_unlock", "los cosméticos ganados (#253, D-014)"],
];

/** Los módulos cuyo solo import ya abre la puerta. */
const MOTORES_PROHIBIDOS = [
  ["racha.ts", "el motor de racha"],
  ["xp.ts", "el motor de XP"],
  ["cosmeticos.ts", "el motor de cosméticos"],
];

const problemas = [];
const notas = [];

// ─── 1 y 2. El código del subsistema social ─────────────────────────────────

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => SOCIAL.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

for (const archivo of fuentes) {
  // Sin comentarios: este subsistema tiene que poder EXPLICAR por qué no toca
  // la racha sin que explicarlo cuente como tocarla. Es la misma clase de falso
  // positivo que ya apagó a cuatro auditores antes (ver `sinComentarios`).
  const texto = sinComentarios(leer(archivo) ?? "");

  for (const [modulo, que] of MOTORES_PROHIBIDOS) {
    const re = new RegExp(`(?:import|require)[^;\\n]*["'\`][^"'\`]*${modulo.replace(".", "\\.")}["'\`]`);
    if (re.test(texto)) {
      problemas.push(
        `${archivo}: importa ${que} (\`${modulo}\`). D-081 condición 1: ningún resultado ` +
          "social modifica un contador de aprendizaje. Sin el import no hay llamada posible, " +
          "y con él la siguiente persona solo tiene que escribir una línea.",
      );
    }
  }

  for (const [columna, que] of CONTADORES) {
    if (palabra(columna).test(texto)) {
      problemas.push(
        `${archivo}: nombra \`${columna}\` — ${que}. D-081 condición 1: la liga no puede ` +
          "quitar nada, y un subsistema social que puede NOMBRAR un contador de aprendizaje " +
          "está a una línea de escribirlo. Descender no borra XP, no quita escudos, no toca " +
          "la racha y no cambia el mapa.",
      );
    }
  }
}

// ─── 3. El esquema: ninguna tabla de liga con dónde escribirlo ──────────────

const migraciones = archivos(/^migrations\/.*\.sql$/);
let tablasDeLiga = 0;

for (const archivo of migraciones) {
  const sql = sqlSinComentarios(leer(archivo) ?? "");

  for (const m of sql.matchAll(/CREATE\s+TABLE\s+(league_[a-z_]+)\s*\(([\s\S]*?)\n\);/gi)) {
    const [, tabla, cuerpo] = m;
    tablasDeLiga++;
    for (const [columna, que] of CONTADORES) {
      if (palabra(columna).test(cuerpo)) {
        problemas.push(
          `${archivo} · ${tabla} tiene una columna \`${columna}\` — ${que}. D-081 condición 1: ` +
            "sin columna no hay escritura, y con columna la escritura llega sola. Los " +
            "contadores de aprendizaje viven en sus tablas y la liga no los duplica.",
        );
      }
    }
  }

  // 4. Un UPDATE o DELETE sobre una tabla de aprendizaje escrito dentro del
  //    subsistema social. No hace falta que sea SQL de una migración: el SQL de
  //    un Workflow vive en un `.ts` y cae en el bucle de arriba por nombre de
  //    columna, pero un `DELETE FROM child_streak` sin nombrar columnas no.
}

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  for (const m of texto.matchAll(/\b(UPDATE|DELETE\s+FROM)\s+([a-z_]+)/gi)) {
    const tabla = m[2].toLowerCase();
    if (["xp_totals", "child_streak", "skill_state", "score_totals"].includes(tabla)) {
      problemas.push(
        `${archivo}: ${m[1].toUpperCase()} sobre \`${tabla}\` desde el subsistema social. ` +
          "D-081 condición 1 y #225: la liga y el tablero LEEN los totales, nunca los " +
          "reescriben. Quitar puntos por un resultado social es exactamente lo prohibido.",
      );
    }
  }
}

notas.push(`${fuentes.length} archivo(s) del subsistema social revisados`);
notas.push(`${tablasDeLiga} tabla(s) league_* en el esquema, ninguna con contador de aprendizaje`);
notas.push(
  "la objeción del dueño está en D-081 y no se borra: mc-10 mide que la presión de rendimiento " +
    "empeora el desempeño en matemáticas, y nadie ha visto todavía a un niño real usar una liga",
);

informar({
  nombre: "liga-no-quita",
  problemas,
  notas,
  cita: "D-081 condición 1, #225, D-055, D-014, línea roja #6, mc-10",
  revisados: fuentes.length + migraciones.length,
  resumen: `${fuentes.length} archivo(s) sociales · ${tablasDeLiga} tabla(s) de liga`,
  porQueBloquea:
    "el dueño puso tres condiciones a D-081 y ésta es la primera. Se rompe con una línea que " +
    "suena a diseño de juego razonable —«al bajar de liga la racha se reinicia»— y convierte un " +
    "resultado social en un castigo de aprendizaje.",
  noComprueba: [
    "una escritura indirecta a través de una función genérica que por dentro toque la racha. " +
      "Recorrer el grafo de llamadas entre módulos no cabe en una expresión regular; el import " +
      "y el nombre de la columna sí, y ahí estuvo el riesgo real.",
  ],
});
