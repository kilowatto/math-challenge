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
// La segunda sección (issue #383, añadida con la superficie) vigila el otro
// extremo del mismo principio: la PANTALLA del roster del dueño. El peligro
// ahí no es el objeto sino la página que «solo añade una consultita» — un SQL
// propio, una columna de más pintada sobre la fila. La regla es que la
// pantalla NO consulta: todo lo que pinta sale de los dos módulos ya
// vigilados (`grupo-roster.ts` por `racha-salones-minima`, `grupo-tabla.ts`
// por la sección 6 de aquí).
//
// LO QUE NO PUEDE COMPROBAR: que `ordenar()` no filtre por otra cosa — eso
// es del motor de liga y tiene sus propias pruebas.

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

// ─── SEGUNDA SECCIÓN (issue #383): la pantalla del roster no añade nada ─────
//
// La pantalla del grupo (`[id].astro`) es donde la lista cerrada se rompe sin
// que ninguna prueba de SQL lo vea: alguien añade una consulta propia «para el
// chip», o pinta un campo de la fila interna. Las comprobaciones, contra una
// lista ESCRITA A MANO (D-070), no derivada de la página:

const PAGINA = "apps/web/src/pages/[locale]/app/grupos/[id].astro";
const TABLA_MODULO = "apps/web/src/lib/grupo-tabla.ts";

/** Lo que la pantalla JAMÁS nombra, reescrito a mano desde D-027 y #208. */
const PROHIBIDOS_EN_PANTALLA = [
  ["max_streak", "la mejor marca personal del niño — #208 la excluye por nombre"],
  ["birth_year", "la edad exacta se infiere del año — D-027 la prohíbe"],
  ["parent_user_id", "el vínculo a la cuenta del padre no es dato del grupo"],
  ["shields_available", "los escudos son presencia del menor, no dato de grupo"],
  ["full_name", "el nombre real no existe en esta superficie (línea roja #2)"],
  ["email", "ningún correo sale en una pantalla con datos de menores"],
];

/** La lista cerrada de la vista ordenada, a mano: alias, puntos, racha, posición. */
const LISTA_ORDENADA = ["alias", "current_streak", "posicion", "puntos"];

if (!existe(PAGINA) || !existe(TABLA_MODULO)) {
  problemas.push(
    `la superficie del roster (#383) está incompleta: ${PAGINA} o ${TABLA_MODULO} no existe — ` +
      "esta sección vigila que la pantalla del dueño no añada datos por su cuenta.",
  );
} else {
  const pagina = sinComentarios(leer(PAGINA) ?? "");
  const modulo = sinComentarios(leer(TABLA_MODULO) ?? "");

  // 5. Toda la lectura pasa por los dos módulos vigilados; la página NO
  //    ejecuta SQL propio. Un `.prepare(` aquí es la «consultita» que nadie
  //    audita — el modo de falla entero que esta sección existe para cerrar.
  if (!pagina.includes("rosterDelGrupo(")) {
    problemas.push(
      `${PAGINA}: el roster no sale de \`rosterDelGrupo\`. La consulta vigilada por ` +
        "`racha-salones-minima` es la única vía — una pantalla con su propio SQL es una " +
        "pantalla que puede añadir la columna prohibida sin que ningún auditor la lea.",
    );
  }
  if (!pagina.includes("tablaOrdenadaDelGrupo(")) {
    problemas.push(
      `${PAGINA}: la vista ordenada no sale de \`tablaOrdenadaDelGrupo\`. Sin ella, el filtro ` +
        "de opt-in (D-087) depende de que la página lo recuerde — y el filtro vive en el módulo.",
    );
  }
  if (/\.prepare\(/.test(pagina)) {
    problemas.push(
      `${PAGINA}: la pantalla ejecuta SQL propio (\`.prepare(\`). La regla de la superficie del ` +
        "roster es que NO consulta: todo lo que pinta sale de `grupo-roster.ts` y " +
        "`grupo-tabla.ts`, los dos módulos con auditor propio.",
    );
  }

  // 6. Los campos prohibidos no aparecen ni en la página ni en la proyección
  //    del módulo de la vista ordenada.
  for (const [campo, porque] of PROHIBIDOS_EN_PANTALLA) {
    if (new RegExp(`\\b${campo}\\b`).test(pagina)) {
      problemas.push(`${PAGINA}: nombra \`${campo}\` — ${porque}.`);
    }
  }
  const bloqueOrdenada = modulo.match(/interface\s+FilaOrdenada\s*\{([\s\S]*?)\}/);
  if (!bloqueOrdenada) {
    problemas.push(`${TABLA_MODULO}: no se encontró \`interface FilaOrdenada\` — ¿cambió de nombre la proyección?`);
  } else {
    const campos = [...bloqueOrdenada[1].matchAll(/^\s*(?:readonly\s+)?(\w+)[?:]/gm)].map((m) => m[1]).sort();
    if (campos.length !== LISTA_ORDENADA.length || !campos.every((c, i) => c === LISTA_ORDENADA[i])) {
      problemas.push(
        `${TABLA_MODULO}: FilaOrdenada proyecta [${campos.join(", ")}] y la lista cerrada es ` +
          `[${LISTA_ORDENADA.join(", ")}]. La banda se usa para calcular la posición y JAMÁS se ` +
          "devuelve — un campo de más aquí es un dato de un niño publicado al grupo.",
      );
    }
  }

  // 7. El filtro de opt-in de la vista ordenada, con la función del motor.
  if (!/visibleEnTablaDePosiciones\(/.test(modulo)) {
    problemas.push(
      `${TABLA_MODULO}: la vista ordenada no filtra por \`visibleEnTablaDePosiciones\`. Sin ese ` +
        "filtro, la tabla incluye a niños cuyo padre nunca activó el ranking (D-087: opt-in, " +
        "apagado por default). Un niño en una tabla que su padre no pidió no da error — aparece.",
    );
  }
}

informar({
  nombre: "grupo-visibilidad-minima",
  problemas,
  notas,
  revisados: 2,
  resumen:
    "la proyección del grupo es exactamente la lista cerrada de D-027, con filtro de opt-in — " +
    "en el objeto y en la pantalla del roster (#383)",
  cita: "D-027, D-087, mc-28, issues #383/#384/#401",
  porQueBloquea:
    "Lo que un grupo sabe de un niño es la superficie de mayor exposición del producto: un adulto sin " +
    "verificar mirando datos de hasta 35 menores. Que sea exactamente alias, avatar, puntos, racha y " +
    "posición —y nada más— no se confía a que cada cambio lo recuerde: se comprueba en cada commit.",
});
