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
    auditor: "signup-dos-campos",
    que: "el MISMO formulario en un componente que no se llama registro",
    // El punto ciego que se midió: reconocer las pantallas solo por el nombre
    // del archivo dejaba pasar cuatro campos dentro de un `TwoFieldForm.astro`,
    // que es justo el nombre que el plan de F2 proponía.
    archivo: "apps/web/src/components/CampoDobleParaPrueba.astro",
    contenido:
      "---\n---\n<form>\n" +
      '  <input name="a" autocomplete="username webauthn" />\n' +
      '  <input name="b" autocomplete="new-password" />\n' +
      '  <input name="c" />\n' +
      '  <input name="d" />\n' +
      "</form>\n",
    espera: "4 campos",
  },
  {
    auditor: "signup-dos-campos",
    que: "un selector de fecha en la pantalla que crea el perfil del nino",
    // Linea roja #2: un <input type="date"> TIENE dia, y el dia no se pide.
    // D-053 dejo solo el año. Antes de este caso, los tres auditores que
    // deberian haberlo visto pasaban en verde.
    archivo: "apps/web/src/components/PerfilParaPrueba.astro",
    contenido: '---\n---\n<input type="date" name="nacimiento" />\n',
    espera: "type=\"date\"",
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
  // Los tres de #321/#322. Ninguno es código: son cadenas que escribió una
  // persona, y estuvieron en producción en los siete locales sin romper nada.
  {
    // Solo corre con `dist/` construido; sin él el auditor sale en verde
    // diciéndolo, y este caso fallaría por la razón equivocada. Es el mismo
    // trato que ya tienen `axe-a11y` y `jsonld-valid`.
    auditor: "sitemap-completo",
    que: "una página construida que el sitemap no anuncia",
    archivo: "apps/web/dist/prueba-huerfana/index.html",
    contenido: "<!doctype html><html lang=\"en\"><title>huérfana</title>\n",
    espera: "el sitemap no la anuncia",
  },
  {
    auditor: "notacion-locale",
    que: "un texto pt-PT que agrupa los millares con espacio en vez de punto",
    archivo: "apps/web/src/i18n/paginas/prueba-millares.json",
    contenido: JSON.stringify({ "pt-PT": { x: "cerca de 157 000 palavras" } }, null, 2) + "\n",
    espera: "agrupa con espacio normal",
  },
  {
    auditor: "notacion-locale",
    que: "un texto fr-FR con apóstrofo recto en vez del tipográfico",
    archivo: "apps/web/src/i18n/paginas/prueba-apostrofo.json",
    contenido: JSON.stringify({ "fr-FR": { x: "un jeu d'enfant" } }, null, 2) + "\n",
    espera: "apóstrofo recto",
  },
  {
    auditor: "notacion-locale",
    que: "un texto fr-FR con espacio normal antes de un signo doble",
    archivo: "apps/web/src/i18n/paginas/prueba-espacio.json",
    contenido: JSON.stringify({ "fr-FR": { x: "Deux axes distincts : voici pourquoi" } }, null, 2) + "\n",
    espera: "espacio NORMAL antes de",
  },
  {
    auditor: "ipad-usabilidad",
    que: "un min-width de 900px sin acotar por media query",
    archivo: "apps/web/src/styles/prueba-ancho.css",
    contenido: ".panel { min-width: 900px; }\n",
    espera: "Split View",
  },
  {
    auditor: "retro-completa",
    que: "retroalimentación que elogia la capacidad en vez del proceso",
    archivo: "apps/web/src/i18n/reto/prueba.json",
    contenido: '{ "error.x": ["\u00a1Qu\u00e9 listo eres!", "sigue as\u00ed"] }\n',
    espera: "elogia la capacidad",
  },
  {
    auditor: "navegacion-unica",
    que: "un import de una librería de navegación nativa que D-064 descartó explícitamente",
    archivo: "apps/web/src/components/PruebaLibreriaNav.astro",
    contenido: '---\nimport Framework7 from "framework7";\n---\n<div></div>\n',
    espera: "framework7",
  },
  {
    auditor: "area-privada",
    que: "una pantalla de /app/ que importa el layout público en vez del privado",
    archivo: "apps/web/src/pages/[locale]/app/prueba-layout.astro",
    contenido: '---\nimport Base from "../../../layouts/Base.astro";\n---\n<Base locale="en" seccion={null} title="x" description="x"></Base>\n',
    espera: "Base.astro",
  },
  {
    // El auditor se llama `script-cliente-sin-ts`, no `scripts-inline-validos`.
    // Dos sesiones encontraron el mismo bug el mismo día —TypeScript dentro de
    // un `<script define:vars>`, que viaja crudo al navegador y mata el script
    // entero— y una registró un auditor que nunca escribió. Ese renglón muerto
    // reventaba `run.mjs` con MODULE_NOT_FOUND y bloqueaba el commit de todos.
    // El caso se conserva tal cual y apunta al auditor que sí existe.
    auditor: "script-cliente-sin-ts",
    que: "un <script define:vars> con sintaxis de TypeScript que el navegador no puede parsear",
    archivo: "apps/web/src/components/PruebaScriptTS.astro",
    contenido: '---\n---\n<script define:vars={{ x: 1 }}>\n  const el = (document.body as HTMLElement);\n</script>\n',
    espera: "lleva TypeScript",
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
