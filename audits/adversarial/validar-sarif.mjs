#!/usr/bin/env node
// Valida el informe contra el esquema OFICIAL de SARIF 2.1.0.
//
//   node audits/adversarial/validar-sarif.mjs [ruta.sarif]
//
// Por qué existe aparte de prueba.mjs: aquellas 20 comprobaciones verifican la
// estructura que YO escribí. Esto verifica la que escribió OASIS. No es lo
// mismo — un informe que dice ser SARIF y no lo es, es peor que uno propio:
// la herramienta que lo ingiera va a fallar, o —peor— a leerlo mal en silencio.
//
// El esquema se guarda en el repo (`sarif-schema-2.1.0.json`) a propósito. Uno
// descargado en cada corrida hace que la validación dependa de que GitHub esté
// arriba y de que nadie mueva el archivo, y convierte un gate local en una
// dependencia de red.

// El esquema oficial de SARIF 2.1.0 es **draft-04**, no draft-07. Ajv 8 no lo
// habla de fábrica: necesita esta envoltura. Descubierto al primer intento,
// que reventó con `no schema with key or ref "…draft-04/schema#"`.
import Ajv from "ajv-draft-04";
import addFormats from "ajv-formats";
import { readFileSync, existsSync } from "node:fs";

const ESQUEMA = new URL("./sarif-schema-2.1.0.json", import.meta.url).pathname;

/**
 * Valida un objeto SARIF ya en memoria. La usa el corredor después de escribir
 * el informe: así se detecta al producirlo, no cuando alguien se acuerde de
 * correr el validador.
 */
export function validarSarif(informe) {
  const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: true });
  addFormats(ajv);
  const v = ajv.compile(JSON.parse(readFileSync(ESQUEMA, "utf8")));
  return v(informe) ? [] : v.errors.map((e) => `${e.instancePath || "raíz"} ${e.message}`);
}

// Lo de abajo solo corre cuando se invoca directo desde la terminal.
if (process.argv[1] !== new URL(import.meta.url).pathname) {
  // importado como módulo: no hacer nada más
} else {

const porDefecto = new URL("./informes/ultimo.sarif", import.meta.url).pathname;
const ruta = process.argv[2] ?? porDefecto;

if (!existsSync(ruta)) {
  console.error(`✗ no hay informe que validar en ${ruta}`);
  console.error(`  Genera uno con:  node audits/adversarial.mjs`);
  process.exit(1);
}

const esquema = JSON.parse(readFileSync(ESQUEMA, "utf8"));
const informe = JSON.parse(readFileSync(ruta, "utf8"));

// strict:false porque el esquema oficial usa construcciones que el modo
// estricto de Ajv rechaza — no es que el esquema esté mal, es que Ajv es más
// severo que draft-04. Lo que importa —tipos, requeridos, enums, $ref— se
// valida igual.
const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: true });
addFormats(ajv);

const validar = ajv.compile(esquema);
const ok = validar(informe);

if (!ok) {
  console.error(`✗ ${ruta.split("/").pop()} NO cumple SARIF 2.1.0\n`);
  for (const e of validar.errors.slice(0, 25)) {
    console.error(`  · ${e.instancePath || "raíz"} ${e.message}${e.params ? ` ${JSON.stringify(e.params)}` : ""}`);
  }
  if (validar.errors.length > 25) console.error(`  … y ${validar.errors.length - 25} más`);
  process.exit(1);
}

const run = informe.runs[0];
console.log(`✓ ${ruta.split("/").pop()} cumple SARIF 2.1.0 (esquema oficial de OASIS)`);
console.log(`  ${informe.runs.length} run · ${run.tool.driver.rules.length} regla(s) · ${run.results.length} resultado(s)`);
console.log(`  herramienta: ${run.tool.driver.name}`);

}
