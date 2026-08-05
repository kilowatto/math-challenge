#!/usr/bin/env node
// Siembra add-only del contenido de cierre N7/N11/N12 (D-072, F11 #423).
// La tabla ya admite las bandas; no se crea una migración por contenido.
import { writeFileSync } from "node:fs";
import { generarBancoCierre } from "../packages/motor/src/banco-cierre.ts";
import { validarItem } from "../packages/motor/src/item.ts";
import { dificultadDeNivel } from "../packages/motor/src/adaptativo.ts";

const banco = generarBancoCierre();
const invalidos = banco.flatMap((item) => validarItem(item).map((error) => `${item.id}: ${error}`));
if (invalidos.length) {
  console.error("banco-cierre: no se genera SQL porque hay ítems inválidos");
  for (const error of invalidos) console.error(`- ${error}`);
  process.exit(1);
}
const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;
const bandaDe = (nivel) => (nivel === 7 ? "SECUNDARIA" : "PRO");
const lines = [
  "-- siembra add-only del banco de cierre F11; INSERT OR IGNORE por D-072",
  "",
  ...banco.map((item) =>
    "INSERT OR IGNORE INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) VALUES (" +
    [sql(item.id), sql(bandaDe(item.nivel)), sql(item.habilidad), item.nivel, "NULL", dificultadDeNivel(item.nivel), sql(JSON.stringify(item)), 1785888000000, 1785888000000].join(", ") + ");",
  ),
];
const output = process.argv.includes("--salida") ? process.argv[process.argv.indexOf("--salida") + 1] : null;
if (output) writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
else process.stdout.write(`${lines.join("\n")}\n`);
console.error(`✓ banco-cierre: ${banco.length} ítems; N7→SECUNDARIA, N11-N12→PRO`);
