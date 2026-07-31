#!/usr/bin/env node
// Auditor determinista 05 — ningún secreto commiteado
//
// Hace cumplir: CLAUDE.md § Cloudflare — "Nunca commitees un secreto.
// `wrangler secret put` o el dashboard." Y § Imágenes — "Las llaves viven en
// .env local y nunca se commitean."

import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const PATTERNS = [
  [/sk-ant-[A-Za-z0-9_-]{20,}/, "llave de API de Anthropic"],
  [/\bAKIA[0-9A-Z]{16}\b/, "llave de acceso de AWS"],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, "llave privada"],
  [/\bghp_[A-Za-z0-9]{36}\b/, "token de GitHub"],
  [/\b(sk|rk)_live_[A-Za-z0-9]{16,}\b/, "llave viva de Stripe"],
  [/["']?(api[_-]?key|secret|password|token)["']?\s*[:=]\s*["'][A-Za-z0-9_\-]{24,}["']/i, "posible credencial embebida"],
];

// Archivos que hablan DE secretos sin contenerlos.
const SKIP = [/^docs\//, /^audits\//, /^CLAUDE\.md$/, /^README\.md$/, /\.example$/, /^\.gitignore$/];

let files;
try {
  // --cached y --others: lo rastreado MÁS lo nuevo todavía sin commitear.
  // Con solo `git ls-files` este auditor era ciego a los archivos recién
  // escritos — es decir, ciego exactamente en el momento en que sirve.
  // --exclude-standard respeta .gitignore, así que node_modules no entra.
  files = execSync("git ls-files --cached --others --exclude-standard", { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
} catch {
  console.error("✗ secrets — no es un repositorio git");
  process.exit(1);
}

if (files.length === 0) {
  console.error("✗ secrets — 0 archivos que escanear; el auditor no está viendo nada");
  process.exit(1);
}

const problems = [];
let scanned = 0;

for (const file of files) {
  if (SKIP.some((re) => re.test(file))) continue;
  try {
    if (statSync(file).size > 2_000_000) continue;
    const content = readFileSync(file, "utf8");
    scanned++;
    for (const [re, label] of PATTERNS) {
      const m = content.match(re);
      if (m) {
        const line = content.slice(0, m.index).split("\n").length;
        problems.push(`${file}:${line} — ${label}`);
      }
    }
  } catch {
    /* binario o ilegible */
  }
}

// .env nunca debe estar rastreado
for (const file of files) {
  if (/^\.env(\.|$)/.test(file) && !file.endsWith(".example")) {
    problems.push(`${file} está rastreado por git — .gitignore lo prohíbe`);
  }
}

if (problems.length > 0) {
  console.error("✗ auditor secrets\n");
  for (const p of problems) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: CLAUDE.md § Cloudflare, § Imágenes`);
  console.error(`  Un secreto commiteado sigue en el historial aunque lo borres`);
  console.error(`  en el siguiente commit. Rótalo, no lo borres nada más.`);
  process.exit(1);
}

console.log(`✓ secrets — ${scanned} archivo(s) limpios`);
