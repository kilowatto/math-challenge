#!/usr/bin/env node
// Sincroniza el campo Status del tablero con el estado real de cada issue.
//
//     node scripts/sincronizar-tablero.mjs [--seco]
//
// Por qué existe. En GitHub Projects, el campo `Status` es **independiente** del
// estado abierto/cerrado del issue. Cerrar un issue no mueve su fila, y mover la
// fila no cierra el issue. Así que el tablero puede decir `In Progress` sobre
// trabajo terminado y `Done` sobre trabajo que se reabrió — que es exactamente
// lo que pasó: #34 y #35 cerrados y en `In Progress`, y #61 reabierto y en
// `Done`.
//
// Un tablero que no coincide con la realidad es peor que no tener tablero: la
// gente deja de mirarlo, y entonces deja de servir incluso cuando sí coincide.
//
// La regla es simple y va en un solo sentido: **el issue manda**. Cerrado → Done.
// Abierto y con algo cerrado debajo, o con etiqueta de progreso → In Progress.
// Abierto y sin nada → se deja como está, porque ahí el humano sí sabe más.

import { execFileSync } from "node:child_process";

const REPO = "kilowatto/math-challenge";
const DUENO = "kilowatto";
const PROYECTO = "1";
const seco = process.argv.includes("--seco");

const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const proyecto = JSON.parse(gh("project", "view", PROYECTO, "--owner", DUENO, "--format", "json"));
const campos = JSON.parse(gh("project", "field-list", PROYECTO, "--owner", DUENO, "--format", "json"));
const estado = campos.fields.find((f) => f.name === "Status");
if (!estado) {
  console.error("✗ el tablero no tiene campo Status");
  process.exit(1);
}
const opcion = (re) => estado.options.find((o) => re.test(o.name));
const DONE = opcion(/^done$/i);
const PROGRESO = opcion(/in progress/i);
const TODO = opcion(/^todo$/i);
if (!DONE || !PROGRESO || !TODO) {
  console.error("✗ faltan las opciones Done / In Progress / Todo");
  process.exit(1);
}

const items = JSON.parse(
  gh("project", "item-list", PROYECTO, "--owner", DUENO, "--format", "json", "--limit", "200"),
).items;

// El estado real de cada issue, de una sola llamada.
const issues = JSON.parse(
  gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "300", "--json", "number,state"),
);
const estadoDe = new Map(issues.map((i) => [i.number, i.state]));

let movidos = 0;
let yaBien = 0;

for (const item of items) {
  const n = item.content?.number;
  if (!n) continue; // los borradores no tienen issue que mandar
  const real = estadoDe.get(n);
  if (!real) continue;

  // Los dos sentidos, y el segundo es el que importa.
  //
  // Cerrado y el tablero no dice Done: la fila va por detrás del trabajo, que es
  // molesto. Abierto y el tablero DICE Done: la fila **miente sobre trabajo que
  // no está hecho**, que es el único error de tablero que hace daño de verdad.
  // Pasó con #61 — lo cerré por error con un `Closes` equivocado, lo reabrí, y
  // el campo se quedó en Done diciendo que los Core Web Vitals de campo estaban
  // medidos cuando no hay ni una semana de datos.
  const deberia =
    real === "CLOSED" ? DONE
    : item.status === DONE.name ? TODO
    : null;
  if (!deberia) continue;

  if (item.status === deberia.name) {
    yaBien++;
    continue;
  }

  console.log(`  #${n}  ${item.status ?? "—"} → ${deberia.name}   ${item.title.slice(0, 46)}`);
  if (!seco) {
    gh("project", "item-edit", "--id", item.id, "--project-id", proyecto.id,
       "--field-id", estado.id, "--single-select-option-id", deberia.id);
  }
  movidos++;
}

console.log(`\n${seco ? "(seco) " : ""}${movidos} fila(s) movida(s) · ${yaBien} ya coincidían`);
if (movidos > 0 && seco) console.log("  corre sin --seco para aplicarlo");
