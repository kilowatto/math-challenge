#!/usr/bin/env node
// Desglosa F5 en una subfase POR HABILIDAD de kinder.
//
//     node scripts/desglosar-f5.mjs [--seco]
//
// Por qué existe, además de `abrir-fase.mjs`. Esa convierte los criterios de
// aceptación en sub-issues, y para F5 los criterios son **reglas de calidad**
// —«todo ítem guardado como estructura», «todo ítem con errores con causa
// nombrada»— que valen para las 400 y no dicen nada del avance. Con solo esas
// cinco, F5 lleva meses en «0 de 5» mientras se construye la mitad del banco.
//
// El trabajo de F5 son **14 habilidades**. Una subfase por habilidad hace que
// «en progreso» se lea como «6 de 14», que es lo que el tablero existe para
// decir.
//
// Las cifras salen de `docs/planes/f5-contenido-kinder.md`, que las produjeron
// 14 diseños con sus 14 críticas adversariales. Donde la crítica corrigió la
// cuenta, manda la crítica.

import { execFileSync } from "node:child_process";

const REPO = "kilowatto/math-challenge";
const PADRE = 138;
const seco = process.argv.includes("--seco");
const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

// nombre · nivel · plantillas · ítems tras la crítica · estado hoy · lo que falta
const HABILIDADES = [
  ["K01", "subitizar 1-3", 1, 6, 39, "plantilla", "T1 y T2 recortadas por la crítica: con n=1 el mismo dibujo sale en tres patrones"],
  ["K02", "subitizar 4-6", 1, 5, 31, "plantilla", "P4 es un documento inválido: `cual_sobra` sin `tambienCorrectas` (D-048)"],
  ["K03", "contar 1-10", 1, 6, 86, "plantilla", "cuentas verificadas por la crítica"],
  ["K04", "contar 1-20", 2, 6, 41, "plantilla", "cuentas verificadas una por una: 12+6+8+5+6+4"],
  ["K05", "correspondencia uno a uno", 1, 6, 34, "SIN PLANTILLA", "P1 y P4 recortadas: en (2,1) y (4,2) el error vale lo mismo que la respuesta"],
  ["K06", "cardinalidad", 1, 6, 68, "SIN PLANTILLA", "6 ítems inválidos: 3 sin su respuesta entre las opciones, 3 sin ningún error con causa"],
  ["K07", "comparar más/menos", 1, 6, 90, "plantilla ARREGLADA", "la versión anterior daba 45 ítems con la respuesta SIEMPRE en el segundo grupo"],
  ["K08", "recta numérica 0-10", 2, 7, 131, "SIN PLANTILLA", "18 ítems de `flash_mas_cerca` tienen la respuesta siempre a la derecha; 11 inválidos"],
  ["K09", "marco de diez", 2, 5, 37, "SIN PLANTILLA", "`donde-se-equivoco`: ninguna de sus 12 entradas de error es computable"],
  ["K10", "descomponer (5 = 2+3)", 2, 6, 45, "plantilla", "cuenta dudosa: `larry_dice` declara 9 y sus parámetros dan 18, sin regla de corte"],
  ["K11", "sumar contando", 2, 8, 150, "plantilla", "39 ítems con dos causas que comparten valor: Larry explicaría la equivocada"],
  ["K12", "restar quitando", 2, 6, 119, "plantilla", "15 inválidos: con b=0 el error `dijo_el_total` vale lo mismo que la respuesta"],
  ["K13", "formas básicas", 1, 5, 40, "plantilla NUEVA", "cuadrado y rectángulo no se generan juntos: un cuadrado ES un rectángulo"],
  ["K14", "patrones AB", 2, 7, 90, "SIN PLANTILLA", "`donde_se_rompe`: tocar siempre la posición 3 acierta 2 de 3"],
];

const yaHijos = JSON.parse(gh("api", `repos/${REPO}/issues/${PADRE}/sub_issues`));
const titulos = new Set(yaHijos.map((h) => h.title));

let creados = 0, saltados = 0;

for (const [id, nombre, nivel, plantillas, items, estado, nota] of HABILIDADES) {
  const titulo = `F5 · ${id} ${nombre} — ${items} ítems desde ${plantillas} plantillas`;
  if (titulos.has(titulo)) { saltados++; continue; }

  const cuerpo = [
    `**${id} — ${nombre}** · nivel N${nivel} · estado hoy: **${estado}**`,
    ``,
    `| | |`,
    `|---|---|`,
    `| Plantillas a construir | ${plantillas} |`,
    `| Ítems que producen | **${items}** (cifra tras la crítica adversarial) |`,
    `| Texto de enunciado | ${plantillas} claves × 7 locales = **${plantillas * 7}** unidades, autoradas |`,
    `| Arte | por decidir cuántas de las ${plantillas} lo necesitan |`,
    `| Audio | toda clave × 7 locales — en kinder la voz es la interfaz |`,
    ``,
    `**Lo que la crítica adversarial encontró:** ${nota}`,
    ``,
    `---`,
    ``,
    `Subfase de **F5 · Contenido kinder** (#${PADRE}). El diseño completo, con sus`,
    `plantillas, parámetros y errores con causa nombrada, está en`,
    `[\`docs/planes/f5-contenido-kinder.md\`](../blob/main/docs/planes/f5-contenido-kinder.md).`,
    ``,
    `**Se cierra cuando sus ítems pasan \`validarItem\` y su serie pasa \`validarSerie\`,`,
    `no cuando las plantillas existen.** Un ítem válido puede no enseñar nada — K07`,
    `tenía 45 ítems perfectamente válidos donde tocar siempre a la derecha acertaba`,
    `el 100%.`,
    ``,
    `**Y el texto NO se traduce, se autora** (CLAUDE.md § Idiomas). En alemán el 21`,
    `es «einundzwanzig» y México usa punto decimal: una plantilla traducida produce`,
    `matemáticas incorrectas sin romper ninguna prueba.`,
  ].join("\n");

  if (seco) { console.log(`  + ${titulo}`); creados++; continue; }

  const url = gh("issue", "create", "--repo", REPO, "--title", titulo, "--body", cuerpo).trim().split("\n").pop();
  const num = Number(url.split("/").pop());
  const idIssue = JSON.parse(gh("api", `repos/${REPO}/issues/${num}`)).id;
  gh("api", "-X", "POST", `repos/${REPO}/issues/${PADRE}/sub_issues`, "-F", `sub_issue_id=${idIssue}`);
  console.log(`  ○ #${num}  ${id} ${nombre} — ${items} ítems`);
  creados++;
}

const total = HABILIDADES.reduce((s, h) => s + h[4], 0);
const plantillas = HABILIDADES.reduce((s, h) => s + h[3], 0);
console.log(`\n${seco ? "(seco) " : ""}${creados} creada(s) · ${saltados} ya existía(n)`);
console.log(`  ${plantillas} plantillas · ${total} ítems · ${plantillas * 7} unidades de texto`);
console.log(`  el plan maestro §9 presupuestaba ~400 ítems: esto es ${(total / 400).toFixed(1)}× ese número`);
