#!/usr/bin/env node
// Abre una fase: la convierte en issue real y crea un sub-issue por criterio.
//
//   node scripts/abrir-fase.mjs S2 [--seco]
//
// Por qué existe. Una fase como elemento único del tablero solo tiene tres
// estados, y pasa semanas en el de en medio sin decir nada: S2 estuvo desplegado
// en producción mientras el tablero decía "Todo", y S0 quedó a un criterio de
// cerrar sin que se notara. Desglosarla convierte "en progreso" en "6 de 9", que
// es la columna `Sub-issues progress` que el tablero ya tiene y que hoy está
// vacía porque nadie la alimenta.
//
// La fuente de los criterios es el cuerpo del elemento en el tablero, que lo
// escribe `scripts/detallar-proyecto.mjs`. **No se inventan criterios aquí**: si
// falta uno, se añade allá y se vuelve a correr esto. Un desglose que no
// corresponde a los criterios de la fase es peor que no desglosar, porque
// aparenta rigor.
//
// Idempotente: si el sub-issue ya existe (mismo título bajo el mismo padre), lo
// salta. Correrlo dos veces no duplica nada.

import { execFileSync } from "node:child_process";

const REPO = "kilowatto/math-challenge";
const DUENO = "kilowatto";
const PROYECTO = "1";

const fase = process.argv[2];
const seco = process.argv.includes("--seco");

if (!fase) {
  console.error("uso: node scripts/abrir-fase.mjs <FASE> [--seco]");
  console.error("     p.ej.  node scripts/abrir-fase.mjs S2");
  process.exit(1);
}

const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const items = JSON.parse(
  gh("project", "item-list", PROYECTO, "--owner", DUENO, "--format", "json", "--limit", "100"),
).items;

// El nombre de la fase tiene que coincidir COMPLETO, no como prefijo.
//
// `startsWith` mordió dos veces. La primera con F1/F10/F11, y se «arregló»
// ordenando por longitud y tomando el más corto — que es peor, porque entonces
// pedir F5 devuelve **F5b**: "F5b · Franja adulta" es más corto que
// "F5 · Contenido kinder — RUTA CRÍTICA" y gana el desempate.
//
// Lo correcto no es desempatar mejor: es que no haya empate. El título empieza
// con la fase seguida de un separador —espacio o punto medio— así que `F5` no
// puede casar con `F5b` porque después de `F5` viene una `b`, no un separador.
const item = items.find((i) => new RegExp(`^${fase}(\\s|·|$)`).test(i.title));

if (!item) {
  console.error(`✗ no encontré la fase "${fase}" en el tablero.`);
  console.error(`  Hay: ${items.map((i) => i.title.split(" ")[0]).join(", ")}`);
  process.exit(1);
}

const cuerpo = item.content?.body ?? "";

// Los criterios son las casillas del cuerpo. Se conserva si venía marcada: un
// criterio ya cumplido nace como sub-issue cerrado, no como trabajo pendiente.
// Sin la bandera `m`: con ella, `$` termina en cada renglón y trunca todo
// criterio que ocupe dos líneas — que son casi todos, porque van sangrados.
const criterios = [...cuerpo.matchAll(/- \[([ x])\]\s+([\s\S]+?)(?=\n- \[|\n\s*\n|\n#{2,}|$)/g)].map((m) => ({
  hecho: m[1] === "x",
  texto: m[2].replace(/\s+/g, " ").trim(),
}));

if (criterios.length === 0) {
  console.error(`✗ "${item.title}" no tiene criterios de aceptación en su cuerpo.`);
  console.error(`  Escríbelos primero en scripts/detallar-proyecto.mjs y corre ese script.`);
  console.error(`  Desglosar una fase sin criterios sería inventarlos, que es peor que no desglosar.`);
  process.exit(1);
}

console.log(`${item.title}`);
console.log(`  ${criterios.length} criterio(s) · ${criterios.filter((c) => c.hecho).length} ya cumplido(s)\n`);

if (seco) {
  for (const c of criterios) console.log(`  ${c.hecho ? "[x]" : "[ ]"} ${c.texto.slice(0, 96)}`);
  console.log(`\n(seco) no se creó nada`);
  process.exit(0);
}

// --- El issue padre --------------------------------------------------------
const abiertos = JSON.parse(gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "200", "--json", "number,title"));
let padre = abiertos.find((i) => i.title === item.title);

if (!padre) {
  const url = gh("issue", "create", "--repo", REPO, "--title", item.title, "--body", cuerpo).trim().split("\n").pop();
  const num = Number(url.split("/").pop());
  padre = { number: num, title: item.title };
  console.log(`  padre creado: #${num}`);
  gh("project", "item-add", PROYECTO, "--owner", DUENO, "--url", url);
} else {
  console.log(`  padre ya existía: #${padre.number}`);
}

// --- Borrar el borrador que acabamos de sustituir --------------------------
//
// Sin esto, la fase queda DOS VECES en el tablero: el borrador original y el
// issue real. Y el que se ve arriba es el borrador, que no tiene sub-issues, no
// enlaza PRs y no se mueve nunca — así que el tablero dice `Todo` con la fase a
// medio hacer. Pasó con F3: tres criterios cerrados y la fila seguía en `Todo`.
//
// El borrador se identifica por ser DraftIssue con el mismo título. Se borra
// después de crear el issue, nunca antes: si la creación falla, el borrador
// sigue ahí y no se ha perdido nada.
if (item.content?.type === "DraftIssue") {
  try {
    gh("project", "item-delete", PROYECTO, "--owner", DUENO, "--id", item.id);
    console.log(`  borrador sustituido y borrado del tablero`);
  } catch (err) {
    console.error(`  ! no pude borrar el borrador: ${String(err.stderr ?? err.message).slice(0, 120)}`);
    console.error(`    Bórralo a mano o la fase quedará dos veces en el tablero.`);
  }
}

// --- Ponerla en progreso ---------------------------------------------------
// Abrir una fase ES empezarla. Dejarla en `Todo` con sus sub-issues creados es
// exactamente la desincronización que este guion existe para evitar.
try {
  const proyectoId = gh("project", "view", PROYECTO, "--owner", DUENO, "--format", "json").match(/"id":"([^"]+)"/)?.[1];
  const campos = JSON.parse(gh("project", "field-list", PROYECTO, "--owner", DUENO, "--format", "json"));
  const estado = campos.fields.find((f) => f.name === "Status");
  const enProgreso = estado?.options?.find((o) => /in progress/i.test(o.name));
  const itemsAhora = JSON.parse(
    gh("project", "item-list", PROYECTO, "--owner", DUENO, "--format", "json", "--limit", "200"),
  ).items;
  const fila = itemsAhora.find((i) => i.content?.number === padre.number);
  if (proyectoId && estado && enProgreso && fila) {
    gh("project", "item-edit", "--id", fila.id, "--project-id", proyectoId,
       "--field-id", estado.id, "--single-select-option-id", enProgreso.id);
    console.log(`  estado: In Progress`);
  }
} catch (err) {
  console.error(`  ! no pude mover el estado: ${String(err.stderr ?? err.message).slice(0, 120)}`);
}

// --- Los sub-issues --------------------------------------------------------
const yaHijos = JSON.parse(gh("api", `repos/${REPO}/issues/${padre.number}/sub_issues`));
const titulosHijos = new Set(yaHijos.map((h) => h.title));

let creados = 0;
let saltados = 0;

for (const c of criterios) {
  const titulo = `${fase} · ${c.texto.slice(0, 110)}${c.texto.length > 110 ? "…" : ""}`;
  if (titulosHijos.has(titulo)) {
    saltados++;
    continue;
  }

  const cuerpoHijo = [
    c.texto,
    ``,
    `---`,
    ``,
    `Criterio de aceptación de **${item.title}** (#${padre.number}).`,
    ``,
    `**Se cierra corriendo su comprobación, no por criterio propio.** Fue así como`,
    `F0 estuvo marcada cerrada con el 0-RTT sin verificar hasta que alguien preguntó.`,
  ].join("\n");

  const url = gh("issue", "create", "--repo", REPO, "--title", titulo, "--body", cuerpoHijo).trim().split("\n").pop();
  const num = Number(url.split("/").pop());

  // Enlazarlo como sub-issue del padre. Es lo único que llena la columna
  // `Sub-issues progress` del tablero — una lista de casillas en el cuerpo no.
  const id = JSON.parse(gh("api", `repos/${REPO}/issues/${num}`)).id;
  gh("api", "-X", "POST", `repos/${REPO}/issues/${padre.number}/sub_issues`, "-F", `sub_issue_id=${id}`);

  if (c.hecho) gh("issue", "close", String(num), "--repo", REPO, "--reason", "completed", "--comment", "Ya cumplido cuando se abrió la fase; se registra cerrado para que el progreso sea real.");

  console.log(`  ${c.hecho ? "✓" : "○"} #${num}  ${c.texto.slice(0, 72)}`);
  creados++;
}

console.log(`\n✓ ${creados} sub-issue(s) creado(s) · ${saltados} ya existía(n)`);
console.log(`  https://github.com/users/${DUENO}/projects/${PROYECTO}`);
