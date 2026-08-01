#!/usr/bin/env node
// Quita del tablero las filas que ya no dicen nada.
//
//     node scripts/limpiar-tablero.mjs [--seco]
//
// Qué quita, y solo esto: **sub-issues CERRADOS**. Su fila no aporta — el padre
// ya lleva la columna `Sub-issues progress` diciendo «20 de 20», y 25 filas
// verdes debajo son ruido que empuja hacia abajo lo que sí está por hacer.
//
// Qué NO quita, y es la parte importante:
//
//   · **Los padres de fase**, aunque estén cerrados. Un tablero sin F3 no cuenta
//     la historia del proyecto.
//   · **Los sub-issues abiertos.** Ésos son el trabajo.
//   · **Los borradores.** F7…F11 y las tensiones T-5 y T-6 no se han abierto, y
//     que sigan siendo borradores es información honesta, no suciedad.
//
// **Quitar del tablero no borra nada.** El issue sigue existiendo, sigue cerrado
// y sigue enlazado como sub-issue de su padre — comprobado antes de correr esto
// en masa: se quitó una fila y `sub_issues_summary` siguió diciendo 20/20.

import { execFileSync } from "node:child_process";

const REPO = "kilowatto/math-challenge";
const DUENO = "kilowatto";
const PROYECTO = "1";
const seco = process.argv.includes("--seco");
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

// Los padres de fase se reconocen porque tienen sub-issues. Se preguntan, no se
// listan a mano: una lista de números aquí se queda vieja en la primera fase
// nueva, y entonces este script borra un padre.
const items = JSON.parse(
  gh("project", "item-list", PROYECTO, "--owner", DUENO, "--format", "json", "--limit", "300"),
).items;

const issues = JSON.parse(
  gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "400", "--json", "number,state,title"),
);
const estado = new Map(issues.map((i) => [i.number, i.state]));

let quitados = 0;
let padresConservados = 0;
let abiertos = 0;
let borradores = 0;

for (const item of items) {
  const c = item.content ?? {};
  if (c.type === "DraftIssue") { borradores++; continue; }
  const n = c.number;
  if (!n || estado.get(n) !== "CLOSED") { if (n) abiertos++; continue; }

  // ¿Es padre? Tiene sub-issues.
  let esPadre = false;
  try {
    esPadre = JSON.parse(gh("api", `repos/${REPO}/issues/${n}/sub_issues`)).length > 0;
  } catch { esPadre = false; }

  if (esPadre) { padresConservados++; continue; }

  console.log(`  − #${n}  ${item.title.slice(0, 60)}`);
  if (!seco) gh("project", "item-delete", PROYECTO, "--owner", DUENO, "--id", item.id);
  quitados++;
}

console.log(
  `\n${seco ? "(seco) " : ""}${quitados} fila(s) de sub-issue cerrado quitadas\n` +
    `  conservados: ${padresConservados} padre(s) · ${abiertos} sub-issue(s) abierto(s) · ${borradores} borrador(es)\n` +
    `  quitar del tablero NO borra el issue ni rompe el conteo del padre`,
);
