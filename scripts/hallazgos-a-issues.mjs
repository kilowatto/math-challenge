#!/usr/bin/env node
// Convierte los hallazgos que reportan sin detener en issues de GitHub.
//
//   node scripts/hallazgos-a-issues.mjs [--seco]
//
// Por qué solo esos, y no todos: los **bloqueantes** se arreglan en el PR que
// los provocó o se anulan por escrito; convertirlos en issues sería abrir y
// cerrar tickets la misma tarde. Los que reportan sin detener son, por
// definición de D-032, trabajo de seguimiento — y hoy viven solo en un archivo
// local que se sobrescribe en la siguiente corrida.
//
// **Idempotente por huella.** Cada issue lleva al final un marcador
// `<!-- mc-huella: auditor·archivo·cita -->`, la misma huella que usan
// ANULACIONES.md y `partialFingerprints` de SARIF. Antes de crear, se busca esa
// huella entre los issues existentes: correr esto dos veces no duplica nada.
// Sin eso, cada corrida de la flota llenaría el repo de tickets repetidos, que
// es la forma más rápida de que la gente deje de leerlos.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { huella } from "../audits/adversarial/anulaciones.mjs";

const REPO = "kilowatto/math-challenge";
const seco = process.argv.includes("--seco");
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const informe = new URL("../audits/adversarial/informes/ultimo.json", import.meta.url).pathname;
if (!existsSync(informe)) {
  console.error("✗ no hay informe. Corre primero:  node audits/adversarial.mjs");
  process.exit(1);
}

const datos = JSON.parse(readFileSync(informe, "utf8"));
const seguimiento = (datos.hallazgos ?? []).filter((h) => !h.bloquea);

// Etiquetas por clase de cita, para poder filtrar por qué se hace cumplir.
const ETIQUETAS = { "linea-roja": "línea-roja", decision: "decisión", investigacion: "investigación" };

const existentes = new Set();
for (const linea of gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "500", "--json", "body")
  .split("\n")
  .filter(Boolean)) {
  try {
    for (const i of JSON.parse(linea)) {
      const m = (i.body ?? "").match(/<!-- mc-huella: (.+?) -->/);
      if (m) existentes.add(m[1]);
    }
  } catch {
    /* la salida viene como un solo JSON; se maneja abajo */
  }
}
try {
  for (const i of JSON.parse(gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "500", "--json", "body"))) {
    const m = (i.body ?? "").match(/<!-- mc-huella: (.+?) -->/);
    if (m) existentes.add(m[1]);
  }
} catch {
  /* sin issues todavía */
}

console.log(`${seguimiento.length} hallazgo(s) de seguimiento · ${existentes.size} ya tienen issue\n`);

let creados = 0;
let saltados = 0;

for (const h of seguimiento) {
  const hu = huella(h.auditor, h.archivo, h.cita_id);
  if (existentes.has(hu)) {
    saltados++;
    continue;
  }

  const degradado = h.evidenciaNoVerificable
    ? "\n> ⚠️ **Evidencia no verificable.** El auditor citó cadenas que no aparecen en lo que se le mostró. " +
      "Verifica antes de actuar.\n"
    : h.archivoNoMostrado
      ? "\n> ⚠️ **El auditor no vio ese archivo.** No estaba en su alcance del diff. Puede ser una conjetura razonable, no evidencia.\n"
      : "";

  const cuerpo = [
    `**Auditor:** \`${h.auditor}\` · **Hace cumplir:** \`${h.cita_id}\` · **Gravedad:** ${h.gravedad}`,
    `**Archivo:** \`${h.archivo}\`${h.linea ? ` línea ${h.linea}` : ""}`,
    degradado,
    `## Qué encontró`,
    h.resumen,
    ``,
    `## Evidencia`,
    h.evidencia,
    ``,
    `## Arreglo propuesto`,
    h.arreglo,
    ``,
    `---`,
    ``,
    `Reporta sin detener el PR: cita investigación, no una línea roja ni una decisión ` +
      `explícita ([D-032](../blob/main/docs/decisions.md#d-032)). Generado por la flota adversarial (F1); ` +
      `regenerable con \`node audits/adversarial.mjs\`.`,
    ``,
    `<!-- mc-huella: ${hu} -->`,
  ].join("\n");

  const titulo = `${h.auditor}: ${h.resumen.slice(0, 90)}${h.resumen.length > 90 ? "…" : ""}`;

  if (seco) {
    console.log(`  + ${titulo}`);
    creados++;
    continue;
  }

  const args = ["issue", "create", "--repo", REPO, "--title", titulo, "--body", cuerpo];
  for (const e of ["flota-adversarial", ETIQUETAS[h.clase] ?? "hallazgo", h.auditor]) {
    args.push("--label", e);
  }
  try {
    const url = gh(...args).trim().split("\n").pop();
    console.log(`  ✓ ${url}  ${h.auditor}`);
    creados++;
  } catch (err) {
    // Las etiquetas que no existen hacen fallar la creación entera. Se
    // reintenta sin ellas antes de darse por vencido: un issue sin etiqueta es
    // mucho mejor que un hallazgo perdido.
    try {
      const url = gh("issue", "create", "--repo", REPO, "--title", titulo, "--body", cuerpo).trim().split("\n").pop();
      console.log(`  ✓ ${url}  ${h.auditor}  (sin etiquetas)`);
      creados++;
    } catch (err2) {
      console.error(`  ✗ ${h.auditor}: ${String(err2.stderr ?? err2.message).slice(0, 160)}`);
    }
  }
}

console.log(`\n${seco ? "(seco) " : ""}${creados} creado(s) · ${saltados} ya existía(n)`);
