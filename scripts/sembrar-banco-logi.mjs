#!/usr/bin/env node
// Siembra add-only de la rama transversal LOGI (D-147). El banco de contenido
// vive en D1; esta salida es deliberadamente separada de las migraciones.
import { writeFileSync } from "node:fs";
import { generarBancoLogi } from "../packages/motor/src/banco-logi.ts";
import { validarItem } from "../packages/motor/src/item.ts";
import { dificultadDeNivel } from "../packages/motor/src/adaptativo.ts";

const banco = generarBancoLogi();
const invalidos = banco.flatMap((item) => validarItem(item).map((error) => `${item.id}: ${error}`));
if (invalidos.length) {
  console.error("banco-logi: no se genera SQL porque hay ítems inválidos");
  for (const error of invalidos) console.error(`- ${error}`);
  process.exit(1);
}
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const output = process.argv.includes("--salida") ? process.argv[process.argv.indexOf("--salida") + 1] : null;
const lines = banco.map((item) =>
  "INSERT OR IGNORE INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) VALUES (" +
  [sql(item.id), sql(item.nivel <= 7 ? "PRIMARIA" : "SERIO"), sql(item.habilidad), item.nivel, "NULL", dificultadDeNivel(item.nivel), sql(JSON.stringify(item)), 1785888000000, 1785888000000].join(", ") + ");",
);
if (output) writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
else process.stdout.write(`${lines.join("\n")}\n`);
console.error(`✓ banco-logi: ${banco.length} ítems; N4-N7→PRIMARIA, N8-N12→SERIO`);
