#!/usr/bin/env node
// Mide cuánto del corpus está traducido de verdad.
//
//     node scripts/medir-traduccion.mjs [--locale es-MX]
//
// Por qué existe, y por qué no basta con `ls | wc -l`. Contar archivos dice que
// un locale está completo cuando lo único que pasó es que alguien copió el
// inglés a la carpeta. Es una medición que se siente rigurosa y no lo es.
//
// Y hay una trampa peor, en la que ya caí. El primer intento comparaba el
// primer encabezado `## ` de cada archivo — que en este corpus es
// `## Resumen ejecutivo (ES)`, **ya en español en el original inglés** por la
// regla de CLAUDE.md § Idiomas. Comparar ahí reporta "0 traducidos, todos
// idénticos" para archivos que sí estaban traducidos, o al revés según el
// locale. Por eso este script compara el cuerpo DESPUÉS de los resúmenes.
//
// Lo que este script NO dice: si la traducción es correcta. Eso es
// `audits/corpus-integridad.mjs`, y la diferencia importa — de los 127
// documentos que este script cuenta como traducidos, 74 tienen hallazgos de
// integridad. Traducido no es publicable. Ver docs/traduccion.md §2.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGEN = join(RAIZ, "docs", "research");
const LOCALES = ["es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const args = process.argv.slice(2);
const i = args.indexOf("--locale");
const pedido = i === -1 ? null : args[i + 1];
if (pedido && !LOCALES.includes(pedido)) {
  console.error(`error: locale desconocido "${pedido}"`);
  console.error(`       destinos: ${LOCALES.join(", ")}`);
  process.exit(2);
}

// El cuerpo es lo que va después del último resumen ejecutivo. Los dos resúmenes
// (ES y EN) están en el original y el ES ya viene en español; compararlos no
// distingue traducido de copiado.
function cuerpo(texto) {
  const m = [...texto.matchAll(/\n## (?!Resumen ejecutivo|Executive summary)/g)];
  const corte = m.length > 0 ? m[0].index : 0;
  return texto.slice(corte).replace(/\s+/g, " ").trim();
}

const documentos = readdirSync(ORIGEN)
  .filter((f) => f.endsWith(".md") && !f.startsWith("README"))
  .sort();

if (documentos.length === 0) {
  console.error("✗ 0 documentos en docs/research/. Un medidor que no ve nada reporta 0% y suena igual que un corpus sin traducir.");
  process.exit(1);
}

console.log(`\n== traducción del corpus — ${documentos.length} documentos × ${LOCALES.length} locales ==\n`);
console.log("   locale   traducido   copia-en   sin       total");
console.log("                        inglés     archivo");

const global = { trad: 0, copia: 0, falta: 0 };

for (const locale of pedido ? [pedido] : LOCALES) {
  const dir = join(ORIGEN, locale);
  if (!existsSync(dir)) {
    console.log(`   ${locale.padEnd(8)} ${"—".padStart(9)}   ${"—".padStart(8)}   ${String(documentos.length).padStart(7)}   sin carpeta`);
    global.falta += documentos.length;
    continue;
  }

  let trad = 0;
  let copia = 0;
  let falta = 0;

  for (const nombre of documentos) {
    const destino = join(dir, nombre);
    if (!existsSync(destino)) {
      falta++;
      continue;
    }
    const a = cuerpo(readFileSync(join(ORIGEN, nombre), "utf8"));
    const b = cuerpo(readFileSync(destino, "utf8"));
    // 200 caracteres bastan: si el cuerpo arranca idéntico, no se tradujo.
    if (a.slice(0, 200) === b.slice(0, 200)) copia++;
    else trad++;
  }

  global.trad += trad;
  global.copia += copia;
  global.falta += falta;

  const pct = Math.round((trad / documentos.length) * 100);
  console.log(
    `   ${locale.padEnd(8)} ${String(trad).padStart(9)}   ${String(copia).padStart(8)}   ${String(falta).padStart(7)}   ${String(pct).padStart(3)}%`,
  );
}

const objetivo = documentos.length * (pedido ? 1 : LOCALES.length);
console.log(
  `\n   total    ${String(global.trad).padStart(9)}   ${String(global.copia).padStart(8)}   ${String(global.falta).padStart(7)}   de ${objetivo}`,
);
console.log(`\n   Traducido NO es publicable. Para saber cuáles están limpios:`);
console.log(`     node audits/corpus-integridad.mjs --locale <locale>`);
console.log(`   El manual completo: docs/traduccion.md\n`);
