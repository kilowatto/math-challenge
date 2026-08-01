#!/usr/bin/env node
// ¿Los auditores atrapan lo que dicen atrapar?
//
//     node audits/pruebas-auditores.mjs [nombre-del-auditor]
//
// Por qué existe. CLAUDE.md § Git, regla 3: *"Toda prueba de regresión debe
// haberse visto fallar sin el arreglo. Una prueba que nunca se vio fallar no
// prueba nada."* Trece de estos auditores se escribieron **antes** que el código
// que vigilan (D-032 y la respuesta del dueño del 2026-08-01), así que no hay
// código real que los haga fallar. Sin algo como esto, trece auditores en verde
// serían indistinguibles de trece auditores rotos.
//
// Cómo funciona. Para cada caso: escribe un archivo que VIOLA la regla, corre el
// auditor, y exige que (a) salga distinto de cero y (b) su mensaje mencione lo
// que debía mencionar. Después borra el archivo. Si el auditor pasa en verde con
// la violación delante, el auditor está roto y esto lo dice.
//
// El archivo se escribe sin rastrear en git, que es justo lo que los auditores
// tienen que ver: `git ls-files --others --exclude-standard`. Un auditor ciego a
// archivos nuevos también falla aquí, y ese fallo ya ocurrió dos veces de verdad.

import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname;

/**
 * Los casos. Cada uno es una violación mínima y concreta.
 *
 * `espera` es una subcadena que TIENE que aparecer en la salida. Sin eso, un
 * auditor que falle por una razón equivocada —una excepción, un archivo que no
 * encuentra— contaría como éxito, y esa es exactamente la clase de verde falso
 * que este archivo existe para impedir.
 */
const CASOS = [
  {
    auditor: "child-pii",
    que: "una columna de correo añadida con ALTER TABLE a una tabla de niño",
    archivo: "migrations/9999_prueba_pii.sql",
    contenido: "ALTER TABLE child_profiles ADD COLUMN email TEXT;\n",
    espera: "correo electrónico",
  },
  {
    auditor: "child-pii",
    que: "una fecha de nacimiento exacta en el CREATE TABLE",
    archivo: "migrations/9999_prueba_dob.sql",
    contenido: "CREATE TABLE child_profiles (\n  id TEXT PRIMARY KEY,\n  birth_date TEXT NOT NULL\n);\n",
    espera: "fecha exacta de nacimiento",
  },
  {
    auditor: "child-free-text",
    que: "una columna de texto libre añadida con ALTER TABLE",
    archivo: "migrations/9999_prueba_texto.sql",
    contenido: "ALTER TABLE child_profiles ADD COLUMN nota TEXT;\n",
    espera: "child_profiles",
  },
  {
    auditor: "sin-penalizacion",
    que: "una penalización por borrar una respuesta",
    archivo: "apps/web/src/lib/prueba-penalizacion.ts",
    contenido: "export function calificar(borrados: number) {\n  return 1 - borrados * 0.1; // penaliza borrar\n}\n",
    espera: "penaliz",
  },
  {
    auditor: "puntaje-servidor",
    que: "un puntaje que llega del cliente y se guarda tal cual",
    archivo: "apps/web/src/pages/api/prueba-puntaje.ts",
    contenido:
      "export async function POST({ request }: any) {\n" +
      "  const { score } = await request.json();\n" +
      "  await guardarPuntaje(score);\n" +
      "  return new Response(null, { status: 204 });\n" +
      "}\n",
    espera: "cliente",
  },
  {
    auditor: "kinder-sin-examen",
    que: "un examen de ubicación obligatorio en kinder",
    archivo: "apps/web/src/lib/prueba-kinder.ts",
    contenido:
      "export const KINDER_PLACEMENT_REQUIRED = true;\n" +
      "export function examenObligatorioKinder() { return true; }\n",
    espera: "kinder",
  },
  {
    auditor: "notacion-locale",
    que: "un formateador de números que asume un solo separador decimal",
    archivo: "apps/web/src/lib/prueba-numeros.ts",
    contenido:
      "export function formatear(n: number) {\n" +
      "  return n.toFixed(2).replace('.', ',');\n" +
      "}\n",
    espera: "decimal",
  },
  {
    auditor: "do-por-entidad",
    que: "un Durable Object global en vez de uno por entidad",
    archivo: "apps/web/src/lib/prueba-do.ts",
    contenido:
      "export function idDelObjeto(env: any) {\n" +
      "  return env.SALON.idFromName('global');\n" +
      "}\n",
    espera: "global",
  },
  {
    auditor: "telemetria-infantil",
    que: "un beacon en una superficie de niño",
    archivo: "apps/web/src/components/RetoKinder.astro",
    contenido: "---\n---\n<script src=\"https://static.cloudflareinsights.com/beacon.min.js\"></script>\n",
    espera: "superficie de niño",
  },
  {
    auditor: "motor-puntuacion",
    que: "el tiempo entrando al puntaje de kinder",
    archivo: "apps/web/src/lib/prueba-motor.ts",
    contenido:
      "export function puntajeKinder(rt: number) {\n" +
      "  let score = 1;\n" +
      "  score = score * (1000 / rt); // kinder\n" +
      "  return score;\n" +
      "}\n",
    espera: "kinder",
  },
  {
    auditor: "motor-puntuacion",
    que: "un puntaje que depende de si el usuario paga",
    archivo: "apps/web/src/lib/prueba-premium.ts",
    contenido: "export function score(base: number, premium: boolean) {\n  return premium ? base * 2 : base;\n}\n",
    espera: "línea roja #4",
  },
  {
    auditor: "tabla-bandas",
    que: "un tope de nivel por edad",
    archivo: "apps/web/src/lib/prueba-bandas.ts",
    contenido: "export const nivel_max_por_edad = { 5: 2, 6: 3 };\n",
    espera: "edad",
  },
  {
    auditor: "intercalado",
    que: "una serie ordenada por tema",
    archivo: "apps/web/src/lib/prueba-serie.ts",
    contenido:
      "export const CONSULTA_SERIE = `SELECT * FROM items ORDER BY topic ASC LIMIT 10`;\n",
    espera: "tema",
  },
  {
    auditor: "adaptativo-simulacion",
    que: "un motor adaptativo que ajusta theta sin acotar el paso",
    archivo: "apps/web/src/lib/prueba-adaptativo.ts",
    contenido:
      "export function actualizar(theta: number, acierto: number) {\n" +
      "  theta += 0.4 * (acierto - 0.5);\n" +
      "  return theta;\n" +
      "}\n",
    espera: "acotar",
  },
  {
    auditor: "signup-dos-campos",
    que: "un registro con cuatro campos",
    archivo: "apps/web/src/components/RegistroPrueba.astro",
    contenido:
      "---\n---\n<form>\n" +
      '  <input name="email" />\n' +
      '  <input name="password" />\n' +
      '  <input name="nombre" />\n' +
      '  <input name="pais" />\n' +
      "</form>\n",
    espera: "4 campos",
  },
  {
    auditor: "band-typography",
    que: "una familia tipográfica literal en vez del token",
    archivo: "apps/web/src/styles/prueba-tipografia.css",
    contenido: ".titulo { font-family: Comic Sans MS, cursive; }\n",
    espera: "literal",
  },
  {
    auditor: "borrado-cuatro-sistemas",
    que: "un runbook de borrado que solo cubre D1",
    archivo: "docs/prueba-erasure.md",
    contenido: "# Borrado\n\nSe corre `DELETE FROM child_profiles WHERE id = ?` en la base D1.\n",
    espera: "R2",
  },
  {
    auditor: "sin-penalizacion",
    que: "la palabra «trampa» en una superficie de niño",
    archivo: "apps/web/src/components/RetoKinderPrueba.astro",
    contenido: '---\n---\n<p>Eso fue muy rápido, ¿hiciste trampa?</p>\n',
    espera: "acusación visible",
  },
  {
    auditor: "sin-penalizacion",
    que: "un modelo de dinámica de tecleo (art. 9 del GDPR)",
    archivo: "apps/web/src/lib/prueba-ritmo.ts",
    contenido: "export function perfil(keystroke_intervals: number[]) {\n  return keystroke_intervals.reduce((a, b) => a + b, 0);\n}\n",
    espera: "biométrico",
  },
  {
    auditor: "notacion-locale",
    que: "toLocaleString con un locale de idioma sin región",
    archivo: "apps/web/src/lib/prueba-intl.ts",
    contenido: "export const f = (n: number) => n.toLocaleString('es');\n",
    espera: "sin región",
  },
  {
    auditor: "notacion-locale",
    que: "un separador decimal declarado fuera de MATH_CONVENTIONS",
    archivo: "apps/web/src/lib/prueba-sep.ts",
    contenido: "export const DECIMAL = ',';\n",
    espera: "separador fuera",
  },
];

const soloEste = process.argv[2] ?? null;
const casos = soloEste ? CASOS.filter((c) => c.auditor === soloEste) : CASOS;

if (casos.length === 0) {
  console.error(`✗ no hay casos para "${soloEste}".`);
  console.error(`  Auditores con caso: ${[...new Set(CASOS.map((c) => c.auditor))].join(", ")}`);
  process.exit(2);
}

console.log(`\n== ¿los auditores atrapan lo que dicen atrapar? — ${casos.length} caso(s) ==\n`);

let fallos = 0;

for (const caso of casos) {
  const ruta = `${RAIZ}${caso.archivo}`;
  const existiaAntes = existsSync(ruta);
  const original = existiaAntes ? readFileSync(ruta, "utf8") : null;

  // Un caso que sobrescribiera un archivo real y luego lo restaurara mal sería
  // peor que no probar nada. Se aborta antes de tocarlo.
  if (existiaAntes) {
    console.error(`  ✗ ${caso.auditor}: ${caso.archivo} YA EXISTE. El caso lo sobrescribiría.`);
    fallos++;
    continue;
  }

  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, caso.contenido, "utf8");

  let r;
  try {
    r = spawnSync("node", [`audits/${caso.auditor}.mjs`], {
      cwd: RAIZ,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
  } finally {
    rmSync(ruta, { force: true });
    if (original !== null) writeFileSync(ruta, original, "utf8");
  }

  const salida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  const bloqueo = r.status !== 0;
  const menciona = salida.toLowerCase().includes(caso.espera.toLowerCase());

  if (bloqueo && menciona) {
    console.log(`  ✓ ${caso.auditor.padEnd(22)} atrapó: ${caso.que}`);
  } else {
    fallos++;
    console.error(`  ✗ ${caso.auditor.padEnd(22)} NO atrapó: ${caso.que}`);
    if (!bloqueo) console.error(`      salió 0 con la violación delante`);
    if (bloqueo && !menciona) console.error(`      bloqueó pero no dijo "${caso.espera}" — ¿falló por otra razón?`);
    console.error(`      salida: ${salida.split("\n").filter(Boolean).slice(0, 3).join(" | ").slice(0, 200)}`);
  }
}

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} de ${casos.length} auditor(es) no atraparon su propia violación.\n`);
  console.error("  Un auditor que no se vio fallar no prueba nada (CLAUDE.md § Git, regla 3).");
  process.exit(1);
}
console.log(`✓ los ${casos.length} casos bloquearon, y por la razón correcta\n`);
