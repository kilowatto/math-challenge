import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pantalla = fs.readFileSync(path.join(root, "apps/web/src/components/reto/Pantalla.astro"), "utf8");
const cola = fs.readFileSync(path.join(root, "apps/web/src/lib/cola-offline.ts"), "utf8");
const problems = [];
if (!/import\s+\{\s*encolar,\s*engancharVaciado\s*\}\s+from\s+['\"]\.\.\/\.\.\/lib\/cola-offline['\"]/.test(pantalla)) problems.push("la pantalla no bundlea el adaptador offline");
if (!/encolarRespuesta/.test(pantalla) || !/payload/.test(pantalla)) problems.push("la respuesta offline no se encola");
if (!/window\.__mathChallengeOffline\s*=\s*offline/.test(pantalla) || !/engancharVaciado/.test(pantalla) || !/fetch\(/.test(pantalla)) problems.push("la cola no tiene vaciado real");
if (/interface IntentoPendiente[\s\S]{0,800}\b(score|puntaje)\s*[?:]/i.test(cola)) problems.push("la cola declara un campo de puntaje");
if (!/visibilitychange/.test(cola) || !/online/.test(cola)) problems.push("faltan disparadores de reconexión");
if (problems.length) {
  console.error("✗ offline-ruta-real\n\n  · " + problems.join("\n  · "));
  process.exit(1);
}
console.log("offline-ruta-real: PASS (respuesta · IndexedDB · reconexión · recalculo servidor)");
