#!/usr/bin/env node
// Auditor determinista — el grupo ve de un niño solo lo que D-027 autoriza
//
// Hace cumplir: D-027 (alias, puntos y racha — ni nombre real, ni edad exacta,
// ni otros grupos), D-087 (el ranking es opt-in, apagado por default), issues
// #383, #384 y #401.
//
// Por qué existe. El estado vivo de un grupo lo guarda
// `math-challenge-classroom-do`, y lo que ese objeto PUBLICA es lo que un
// grupo entero —un adulto que no es el padre, y hasta 35 niños— llega a saber
// de cada niño. Dos formas de que eso se pase, ninguna visible como error:
//
//   1. **Un campo de más en la proyección.** Alguien añade `banda` o
//      `membership_id` al almacenamiento —porque lo necesita dentro— y lo
//      devuelve con `...fila` en la respuesta. El objeto entero sale
//      publicado, y «nunca un campo adicional porque ya estaba en la fila»
//      deja de ser cierto sin que nada falle.
//   2. **El filtro de opt-in quitado.** La vista ordenada por posición solo
// puede incluir a quien tiene `leaderboard_opt_in = 1` (D-087). Quitar el
//      filtro es una línea, y el síntoma es invisible: un niño aparece en la
//      tabla de posiciones de su salón y su padre nunca lo activó.
//
// Cómo comprueba: lee `classroom-do.ts` y compara contra la tabla de
// precondiciones ESCRITA A MANO de abajo — no importada del módulo que juzga,
// porque un auditor que juzga con la misma lista que el código usa para
// decidir no puede fallar nunca (D-070, la trampa de `mision-slot-nunca-vacio`).
//
// LO QUE NO PUEDE COMPROBAR: la consulta D1 del roster del dueño (issue #383)
// — todavía no existe; cuando exista, este auditor gana su segunda sección.
// Tampoco que `ordenar()` no filtre por otra cosa: eso es del motor de liga y
// tiene sus propias pruebas.

import { leer, sinComentarios, informar, existe } from "./lib/repo.mjs";

const DO = "apps/web/src/lib/classroom-do.ts";

/**
 * La lista CERRADA de lo que un grupo puede ver de un niño, reescrita aquí a
 * mano desde D-027 y F9 §5. Es la segunda fuente: si el objeto proyecta algo
 * que no está aquí, o si alguien edita esta lista para que coincida con una
 * proyección ya inflada, el cruce con la interfaz `FilaDifundida` y con el
 * `return` lo delata — las tres tienen que moverse a la vez, a propósito.
 */
const LISTA_CERRADA = ["alias", "avatar_parts", "puntos", "current_streak", "posicion"];

const problemas = [];
const notas = [];

if (!existe(DO)) {
  // El objeto es de este PR; si falta, no hay nada que vigilar todavía y el
  // auditor lo dice en vez de pasar en verde sobre un archivo fantasma.
  problemas.push(`${DO} no existe — este auditor vigila el Durable Object del grupo (F9, D-098)`);
}

const texto = sinComentarios(leer(DO) ?? "");

// ─── 1. La interfaz pública proyecta exactamente la lista cerrada ───────────
const bloqueInterfaz = texto.match(/interface\s+FilaDifundida\s*\{([\s\S]*?)\}/);
if (!bloqueInterfaz) {
  problemas.push(`${DO}: no se encontró \`interface FilaDifundida\` — ¿cambió de nombre la proyección?`);
} else {
  const campos = [...bloqueInterfaz[1].matchAll(/^\s*(\w+)[?:]/gm)].map((m) => m[1]).sort();
  const cerrada = [...LISTA_CERRADA].sort();
  if (campos.length !== cerrada.length || !campos.every((c, i) => c === cerrada[i])) {
    problemas.push(
      `${DO}: FilaDifundida proyecta [${campos.join(", ")}] y la lista cerrada de D-027 es ` +
        `[${cerrada.join(", ")}]. Un campo de más aquí es un dato de un niño publicado a todo el ` +
        "grupo; un campo de menos es una pantalla rota. Las dos listas se mueven juntas o no se mueven.",
    );
  }
}

// ─── 2. La tabla ordenada filtra por opt-in, con la función del motor ───────
if (!/visibleEnTablaDePosiciones\(/.test(texto)) {
  problemas.push(
    `${DO}: la tabla no filtra por \`visibleEnTablaDePosiciones\`. Sin ese filtro, la vista ordenada ` +
      "por posición incluye a niños cuyo padre nunca activó el ranking (D-087: opt-in, apagado por " +
      "default, en TODA banda). Un niño en una tabla que su padre no pidió no da error — simplemente aparece.",
  );
}

// ─── 3. La proyección se copia campo a campo, nunca con spread ─────────────
const cuerpoTabla = texto.match(/async\s+tabla\(\)[^{]*\{([\s\S]*?)\n  \}/);
if (cuerpoTabla && /\.\.\.\s*(fila|f)\b/.test(cuerpoTabla[1])) {
  problemas.push(
    `${DO}: la proyección de \`tabla()\` usa spread (\`...fila\`). Con spread, añadir un campo al ` +
      "almacenamiento lo publica al grupo entero sin que nadie lo decida — los campos se copian UNO A UNO.",
  );
}

// ─── 4. Lo que se guarda no se cuela: la banda se almacena y NO se proyecta ─
if (/\bbanda\s*:/.test(cuerpoTabla?.[1] ?? "") || (bloqueInterfaz && /\bbanda[?:]/.test(bloqueInterfaz[1]))) {
  problemas.push(
    `${DO}: la banda sale en la proyección. Se almacena solo para calcular la posición visible ` +
      "(tercios en KINDER, D-081) — un miembro nunca ve la banda de otro.",
  );
}

informar({
  nombre: "grupo-visibilidad-minima",
  problemas,
  notas,
  revisados: 1,
  resumen: "la proyección del grupo es exactamente la lista cerrada de D-027, con filtro de opt-in",
  cita: "D-027, D-087, mc-28, issues #383/#384/#401",
  porQueBloquea:
    "Lo que un grupo sabe de un niño es la superficie de mayor exposición del producto: un adulto sin " +
    "verificar mirando datos de hasta 35 menores. Que sea exactamente alias, avatar, puntos, racha y " +
    "posición —y nada más— no se confía a que cada cambio lo recuerde: se comprueba en cada commit.",
});
