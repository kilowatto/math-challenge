import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const route = fs.readFileSync(path.join(root, "apps/web/src/pages/api/cierre.ts"), "utf8");
const reader = fs.readFileSync(path.join(root, "apps/web/src/lib/banco-cierre-d1.ts"), "utf8");
const locales = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const problems = [];
if (!/bancoCierreD1/.test(route) || !/presentarItem|calificarContraBanco/.test(route)) problems.push("la ruta no usa el lector de cierre");
if (!/SECUNDARIA.*PRO|PRO.*SECUNDARIA/s.test(reader)) problems.push("no separa SECUNDARIA y PRO");
for (const locale of locales) {
  const file = path.join(root, `apps/web/src/i18n/reto/${locale}.json`);
  const messages = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const key of ["cierre.suma", "cierre.producto", "cierre.fraccion", "cierre.cuadrado", "cierre.operaciones", "cierre.secuencia", "cierre.ecuacion", "cierre.potencia", "cierre.raiz", "cierre.proporcion", "cierre.mcd"]) {
    if (typeof messages[key] !== "string") problems.push(`${locale}: falta ${key}`);
  }
  for (const n of [7, 11, 12]) for (let i = 1; i <= 3; i++) if (!Array.isArray(messages[`error.cierre.${n}.${i}`])) problems.push(`${locale}: falta error.cierre.${n}.${i}`);
}
if (problems.length) {
  console.error("✗ cierre-runtime\n\n  · " + problems.join("\n  · "));
  process.exit(1);
}
console.log("cierre-runtime: PASS (ruta D1 · bandas separadas · 7 locales)");
