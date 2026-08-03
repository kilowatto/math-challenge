#!/usr/bin/env node
// Auditor determinista — F7 lee a F4 y a la liga por un sobre, nunca por dentro
//
// Hace cumplir: #211, #214, #215, mc-32 (aislamiento entre Durable Objects por
// entidad), D-027 (dos estructuras separadas, no una compartida), D-030.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// Misiones diarias necesita saber tres cosas de F4 (qué toca repasar, qué está
// cerca de dominarse, qué ya se domina) y tres de la liga (si está en una, si
// dio opt-in a DUELO, y el contador colectivo). Hay dos formas de conseguirlas:
//
//   · Por un **sobre**: una interfaz con esos campos y nada más, que quien llama
//     rellena. Es lo que hace `SobreParaLarry` en F6, y lo que este auditor
//     defiende.
//   · Importando el módulo de F4 o el Durable Object de la liga «para no
//     duplicar el tipo». Eso no es reutilizar: es que un bug de F4 pueda tocar
//     las misiones sin que nadie lo decida, y que borrar el modelo adaptativo de
//     un niño (GDPR 17, criterio #104 de F4) tenga un segundo lector que nadie
//     recordó.
//
// El sobre además hace posible lo contrario: **F7 se despliega antes que F4**
// (#228), porque `null` es un valor legítimo del contrato y no una avería.
//
// ─── Las cuatro cosas que comprueba ───────────────────────────────────────
//
//  1. El camino de misión **no importa** el árbol de F4 ni el de ligas, y no
//     nombra sus tablas ni sus bindings de Durable Object.
//  2. El camino de misión **no escribe** en F4: ni `INSERT`, ni `UPDATE`, ni
//     `fetch` a su objeto. El contrato es de SOLO LECTURA (#214).
//  3. Las dos listas blancas **no crecen**. Los campos de
//     `ResumenAdaptativoParaMisiones` y `ResumenDeLigaParaMisiones` se comparan
//     contra la lista exacta de #214 y #215 — un campo de más es el momento en
//     que el sobre deja de ser un sobre y pasa a ser el estado interno de otro
//     subsistema con otro nombre.
//  4. F4 tampoco importa a F7. El aislamiento no es de una dirección sola.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si quien RELLENA el sobre lo hace con datos correctos. Que el resumen diga
//    «tres habilidades en repaso» y sean las equivocadas es un bug de F4, y F7
//    no puede distinguirlo — es precisamente el precio de no mirar dentro.
//  · Si el sobre viaja por la red sin cifrar o con más de lo que dice. Eso es de
//    la ruta, y hoy no existe ninguna.

import { archivos, leer, informar, sinComentarios, existe } from "./lib/repo.mjs";

const MODULO = "packages/motor/src/misiones.ts";

/** Los campos exactos de #214. Ni uno más. */
const CAMPOS_F4 = ["habilidadesEnRepaso", "habilidadesCercaDeDominio", "habilidadesDominadas"];
/** Los campos exactos de #215. Ni uno más. */
const CAMPOS_LIGA = ["enLiga", "dueloOptIn", "metaColectivaHoy"];

/** El árbol de F4 y el de ligas: lo que un módulo de misión no puede importar. */
const IMPORT_AJENO =
  /from\s+["'][^"']*(adaptativo|programador|aprendiz|learner|liga|league|clasificacion|leaderboard)[^"']*["']/i;

/** Los nombres internos de otro subsistema, que aquí no se pueden ni escribir. */
const NOMBRE_AJENO =
  /\b(skill_state|LEARNER_DO|LEAGUE_DO|CLASSROOM_DO|SESION_RETO_DO|idFromName|DurableObject|DurableObjectStub)\b/;

/** Escribir en el subsistema de al lado. El contrato es de solo lectura. */
const ESCRITURA_AJENA =
  /\b(INSERT\s+INTO\s+(skill_state|league_[a-z_]+)|UPDATE\s+(skill_state|league_[a-z_]+)|actualizarHabilidad|escribirModelo|guardarSkill)\b/i;

const problemas = [];
const notas = [];
let revisados = 0;

if (!existe(MODULO)) {
  problemas.push(
    `${MODULO} no existe y este auditor lo lee para comprobar las dos listas blancas. ` +
      "«No comprobé» nunca puede leerse como «está bien».",
  );
}

// ─── 1 y 2. El camino de misión no mira ni escribe en el subsistema de al lado ─

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => /^(apps|packages|workers)\//.test(f));
let deMision = 0;

for (const archivo of fuentes) {
  revisados++;
  const texto = sinComentarios(leer(archivo) ?? "");
  const esDeMision =
    archivo === MODULO || /(^|\/)mision[a-z-]*\.(ts|tsx|js|mjs)$/i.test(archivo);
  if (!esDeMision) continue;
  deMision++;

  for (const m of texto.matchAll(/^.*from\s+["'][^"']+["'].*$/gm)) {
    if (IMPORT_AJENO.test(m[0])) {
      problemas.push(
        `${archivo}: importa el árbol de F4 o el de ligas — \`${m[0].trim().slice(0, 90)}\`. ` +
          "#214 y #215: F7 solo puede verlos por `ResumenAdaptativoParaMisiones` y " +
          "`ResumenDeLigaParaMisiones`, que son listas blancas rellenadas por quien llama. " +
          "Importar el módulo hace que un bug de F4 pueda tocar las misiones sin que nadie lo " +
          "decida, y que borrar el modelo de un niño tenga un segundo lector que nadie recordó.",
      );
    }
  }

  if (NOMBRE_AJENO.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => NOMBRE_AJENO.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: nombra el estado interno de otro subsistema (tabla de F4 o binding de ` +
        "un Durable Object). `mc-32` pide un DO por entidad y aislamiento entre ellos; el motor de " +
        "misiones es puro y no conoce ningún objeto ni ninguna tabla ajena.",
    );
  }

  if (ESCRITURA_AJENA.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => ESCRITURA_AJENA.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: ESCRIBE en el subsistema de al lado. #214 dice de solo lectura, y es ` +
        "literal: una misión reconoce con XP un evento que F4 ya produjo por su cuenta, no lo " +
        "provoca ni lo modifica.",
    );
  }
}

if (deMision === 0) {
  problemas.push(
    "no se encontró ningún archivo de misión que revisar. Este auditor existiría en falso: " +
      "revisar cero archivos y salir en verde es indistinguible de estar roto.",
  );
}

// ─── 3. Las dos listas blancas no crecen ─────────────────────────────────────

const modulo = leer(MODULO) ?? "";

function camposDeInterfaz(nombre) {
  const m = modulo.match(new RegExp(`export\\s+interface\\s+${nombre}\\s*\\{([\\s\\S]*?)\\n\\}`));
  if (!m) return null;
  const cuerpo = sinComentarios(m[1]);
  const campos = [];
  for (const linea of cuerpo.split("\n")) {
    const c = linea.trim().match(/^(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*\??\s*:/);
    if (c) campos.push(c[1]);
  }
  return campos;
}

for (const [nombre, esperados, issue] of [
  ["ResumenAdaptativoParaMisiones", CAMPOS_F4, "#214"],
  ["ResumenDeLigaParaMisiones", CAMPOS_LIGA, "#215"],
]) {
  const campos = camposDeInterfaz(nombre);
  if (campos === null) {
    problemas.push(
      `${MODULO}: no declara \`export interface ${nombre}\`. ${issue} pide el contrato definido ` +
        "en este PR aunque el otro subsistema no exista todavía: es lo que permite que F7 se " +
        "despliegue antes y se encienda sola cuando el otro aterrice.",
    );
    continue;
  }
  for (const c of campos) {
    if (!esperados.includes(c)) {
      problemas.push(
        `${MODULO}: \`${nombre}\` declara el campo \`${c}\`, que no está en la lista blanca de ` +
          `${issue} (${esperados.join(", ")}). Un campo de más es el momento exacto en que el ` +
          "sobre deja de ser un sobre y pasa a ser el estado interno de otro subsistema con otro " +
          "nombre — mismo fallo que `larry-en-vivo` vigila para el sobre de Larry.",
      );
    }
  }
  for (const c of esperados) {
    if (!campos.includes(c)) {
      problemas.push(
        `${MODULO}: \`${nombre}\` no declara \`${c}\`, que ${issue} sí pide. Quien rellene el ` +
          "sobre no tendrá dónde poner ese dato y la misión que lo necesita quedará muerta.",
      );
    }
  }
  notas.push(`${nombre}: ${campos.length} campo(s), exactamente los de ${issue}`);
}

// ─── 4. Y el aislamiento tampoco es de una dirección sola ────────────────────

for (const vecino of [
  "packages/motor/src/adaptativo.ts",
  "packages/motor/src/programador.ts",
  "packages/motor/src/serie.ts",
]) {
  if (!existe(vecino)) continue;
  revisados++;
  const texto = sinComentarios(leer(vecino) ?? "");
  if (/from\s+["'][^"']*misiones?[^"']*["']/i.test(texto)) {
    problemas.push(
      `${vecino} importa el motor de misiones. El aislamiento no es de una dirección sola: si F4 ` +
        "supiera qué misión tiene hoy el niño, podría elegir el ítem para que la cumpla, y " +
        "entonces la selección adaptativa dejaría de ser pedagógica (D-027, mc-32).",
    );
  }
}

notas.push(`${deMision} archivo(s) del camino de misión revisados por imports y por escrituras`);

informar({
  nombre: "misiones-sin-do-ajeno",
  problemas,
  notas,
  cita: "#211, #214, #215, mc-32, D-027, D-030",
  revisados,
  resumen: `${revisados} archivo(s) de producto, y las dos listas blancas contadas campo a campo`,
  porQueBloquea:
    "un import del árbol de F4 o del DO de la liga convierte dos subsistemas con dueños y ciclos " +
    "de vida distintos en uno solo: un bug de allá toca las misiones sin que nadie lo decida, y " +
    "F7 deja de poder desplegarse antes que F4 (#228), que es justo lo que el sobre existe para " +
    "permitir.",
  noComprueba: [
    "si quien RELLENA el sobre lo hace con datos correctos. Que el resumen diga «tres " +
      "habilidades en repaso» y sean las equivocadas es un bug de F4, y F7 no puede " +
      "distinguirlo — es el precio de no mirar dentro.",
    "si el sobre viaja por la red con más de lo que dice. Eso es de la ruta, y hoy no existe " +
      "ninguna ruta de misiones.",
  ],
});
