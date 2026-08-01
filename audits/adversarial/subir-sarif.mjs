#!/usr/bin/env node
// Sube el informe SARIF a GitHub Code Scanning.
//
//   node audits/adversarial/subir-sarif.mjs [ruta.sarif]
//
// **Sin GitHub Actions.** El camino normal para subir SARIF es el workflow
// `github/codeql-action/upload-sarif`, y este proyecto no usa CI — es una
// decisión del dueño, no una carencia. La API REST acepta el mismo archivo
// desde esta máquina, así que la flota conserva su forma: se corre a mano
// antes de abrir el PR, y publica sus hallazgos donde GitHub los muestra
// anclados a `archivo:línea`.
//
// La autenticación va por `gh api`, no por un token en una variable: así la
// llave nunca pasa por argv, por el entorno de este proceso, ni por el
// historial del shell — la misma regla que aplica `scripts/set-keys.sh`.
//
// Requisitos del endpoint: el SARIF va **gzip y luego base64**, y el
// `commit_sha` tiene que existir en el remoto. Subir contra un commit que solo
// vive en tu máquina falla, porque GitHub no tiene contra qué anclar las
// alertas.

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";

const raiz = new URL("../../", import.meta.url).pathname;
const ruta = process.argv[2] ?? new URL("./informes/ultimo.sarif", import.meta.url).pathname;

if (!existsSync(ruta)) {
  console.error(`✗ no hay SARIF que subir en ${ruta}`);
  console.error(`  Genera uno con:  node audits/adversarial.mjs`);
  process.exit(1);
}

const git = (...a) => execFileSync("git", a, { cwd: raiz, encoding: "utf8" }).trim();

const sha = git("rev-parse", "HEAD");
const rama = git("rev-parse", "--abbrev-ref", "HEAD");
const ref = `refs/heads/${rama}`;

// Fallar temprano y claro: un commit que no está en el remoto no puede
// sostener alertas, y el error de GitHub para ese caso no lo dice así.
try {
  git("rev-parse", "--verify", `origin/${rama}`);
  const local = sha;
  const remoto = git("rev-parse", `origin/${rama}`);
  if (local !== remoto) {
    console.error(`✗ tu rama local va adelante de origin/${rama}.`);
    console.error(`  GitHub no puede anclar alertas a un commit que no tiene.`);
    console.error(`  Corre:  git push`);
    process.exit(1);
  }
} catch {
  console.error(`✗ la rama \`${rama}\` no existe en el remoto.`);
  console.error(`  Corre:  git push -u origin ${rama}`);
  process.exit(1);
}

const sarif = readFileSync(ruta);
const comprimido = gzipSync(sarif).toString("base64");

const cuerpo = JSON.stringify({
  commit_sha: sha,
  ref,
  sarif: comprimido,
  tool_name: "Math Challenge — flota adversarial",
  checkout_uri: `file://${raiz.replace(/\/$/, "")}`,
});

console.log(`Subiendo ${(sarif.length / 1024).toFixed(1)} KB (${(comprimido.length / 1024).toFixed(1)} KB comprimidos y en base64)`);
console.log(`  rama   ${rama}`);
console.log(`  commit ${sha.slice(0, 12)}`);

let respuesta;
try {
  respuesta = execFileSync(
    "gh",
    ["api", "-X", "POST", "repos/{owner}/{repo}/code-scanning/sarifs", "--input", "-"],
    { cwd: raiz, encoding: "utf8", input: cuerpo },
  );
} catch (err) {
  console.error(`\n✗ GitHub rechazó la subida:\n${err.stdout || err.stderr || err.message}`);
  process.exit(1);
}

const { id } = JSON.parse(respuesta);
console.log(`\n✓ aceptado — análisis \`${id}\``);
console.log(`  El procesamiento es asíncrono. Consulta el estado con:`);
console.log(`    gh api repos/{owner}/{repo}/code-scanning/sarifs/${id}`);
console.log(`  Y las alertas en:`);
console.log(`    https://github.com/kilowatto/math-challenge/security/code-scanning`);
