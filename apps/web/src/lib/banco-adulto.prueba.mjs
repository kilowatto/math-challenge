#!/usr/bin/env node
// Casos del cable D1 de la franja adulta (SERIO) — F5b #159–#167, D-034, D-072.
//
//     node --experimental-strip-types apps/web/src/lib/banco-adulto.prueba.mjs
//
// El motor (banco-adulto.prueba.mjs) prueba las plantillas; esto es el CAMINO
// completo — migración 0016 + siembra de los DOS bancos de D1 + lectura —
// contra SQLite de verdad (`node:sqlite`), no contra un simulacro. Un cable
// mal escrito no da error: da un adulto que recibe `banco_vacio` teniendo la
// franja sembrada, o un ítem de primaria calificado como SERIO porque la
// cadena de respaldo se conectó al revés.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bancoAdultoD1 } from "./banco-adulto.ts";

let fallos = 0, corridos = 0;
// `await` dentro: los casos son async (leyen D1). Sin esperar al promise, el
// ✓ salía antes de que el caso corriera y un fallo real salía como crash al
// final — la lección viene de la prueba hermana de primaria.
async function caso(n, fn) { corridos++; try { await fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== la franja adulta en D1 — el cable completo (#159–#167, D-034) ==\n");

// --- La base de verdad: la migración 0016 + las DOS siembras ----------------
const db = new DatabaseSync(":memory:");
db.exec(readFileSync("migrations/0016_banco_items_primaria.sql", "utf8"));
execFileSync("node", [
  "--experimental-strip-types", "--no-warnings",
  "scripts/sembrar-banco-adulto.mjs", "--salida", "/tmp/f5b-siembra-prueba.sql",
]);
execFileSync("node", [
  "--experimental-strip-types", "--no-warnings",
  "scripts/sembrar-banco-primaria.mjs", "--salida", "/tmp/f5c-siembra-prueba.sql",
]);
db.exec(readFileSync("/tmp/f5b-siembra-prueba.sql", "utf8"));

/** El adaptador D1 mínimo sobre node:sqlite (el patrón de limite-dia.prueba). */
function adaptar(database) {
  return {
    prepare(sql) {
      let args = [];
      const bound = {
        bind(...a) { args = a; return bound; },
        async all() { return { results: database.prepare(sql).all(...args) }; },
        async first() { return database.prepare(sql).get(...args) ?? null; },
        async run() { return database.prepare(sql).run(...args); },
      };
      return bound;
    },
  };
}

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const MENSAJES = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`apps/web/src/i18n/reto/${l}.json`, "utf8"))]),
);

const origen = bancoAdultoD1(adaptar(db), MENSAJES);

await caso("el catálogo es la franja entera: 150 ítems, todos en N8–N10, sin techo", async () => {
  const catalogo = await origen.catalogoAdaptativo();
  es(catalogo.length, 150, "filas del catálogo SERIO");
  for (const c of catalogo) {
    if (c.nivel < 8 || c.nivel > 10) throw new Error(`${c.id}: nivel ${c.nivel} fuera de la franja`);
    if (c.hastaNivel != null) throw new Error(`${c.id}: la franja no tiene techo de servicio (no hay Kalyuga que aplicar)`);
    if (!Number.isFinite(c.dificultad)) throw new Error(`${c.id}: sin dificultad`);
  }
});

await caso("presentarItem compone en el locale — la notación ES el producto (mc-34, #162)", async () => {
  // a13: división exacta. En alemán divide con `:`, en inglés con `÷`.
  const de = await origen.presentarItem("a13-144-12", "de-DE");
  if (!de) throw new Error("no presentó un ítem sembrado");
  es(de.enunciado, "Wie viel ist 144 : 12?", "el enunciado en de-DE");
  const en = await origen.presentarItem("a13-144-12", "en");
  es(en.enunciado, "How much is 144 ÷ 12?", "el enunciado en en");
  // Y el mismo ítem, con el separador decimal de cada uno: 1/4 = 0,25 | 0.25.
  const esES = await origen.presentarItem("a03-1-1-4", "es-ES");
  if (!esES.opciones.some((o) => o.texto === "0,25")) throw new Error(`es-ES sin coma decimal: ${esES.opciones.map((o) => o.texto)}`);
  const esMX = await origen.presentarItem("a03-1-1-4", "es-MX");
  if (!esMX.opciones.some((o) => o.texto === "0.25")) throw new Error(`es-MX sin punto decimal: ${esMX.opciones.map((o) => o.texto)}`);
  const fr = await origen.presentarItem("a13-1000-8", "fr-FR");
  if (!fr.enunciado.includes("1 000")) throw new Error(`fr-FR sin espacio fino de millares: ${fr.enunciado}`);
});

await caso("calificarContraBanco nombra la causa y etiqueta SERIO — el veredicto viaja calculado", async () => {
  const bien = await origen.calificarContraBanco("a13-144-12", 12);
  es(bien.acc, 1, "la correcta");
  es(bien.banda, "SERIO", "la banda del intento");
  es(bien.nivel, 8, "el nivel");
  const mal = await origen.calificarContraBanco("a13-144-12", 21);
  es(mal.acc, 0, "el distractor");
  es(mal.causa, "error.a.div_cifras", "las cifras invertidas, nombradas");
  const neg = await origen.calificarContraBanco("a07-0-25-10", -35);
  es(neg.causa, "error.a.signo_todo_negativo", "un distractor NEGATIVO calificado con su causa");
});

await caso("el respaldo: un ítem de PRIMARIA se presenta y se califica a través de la cadena", async () => {
  db.exec(readFileSync("/tmp/f5c-siembra-prueba.sql", "utf8"));
  const p = await origen.presentarItem("p02-0-2-1-2-3-0", "en");
  if (!p) throw new Error("el respaldo a primaria no presentó");
  const v = await origen.calificarContraBanco("p02-0-2-1-2-3-0", 2123);
  es(v.causa, "error.p.comparo_desde_las_unidades", "la causa del respaldo");
  es(v.banda, "PRIMARIA", "la banda del respaldo — no se disfraza de SERIO");
});

await caso("un ítem que no está ni en la franja ni en primaria devuelve null, no una excepción", async () => {
  es(await origen.presentarItem("k11-3-4-0", "en"), null, "ítem de kinder");
  es(await origen.calificarContraBanco("k11-3-4-0", 7), null, "calificar un ítem de kinder aquí");
});

await caso("una fila corrupta de SERIO no se sirve: validarItem al leer, siempre", async () => {
  db.prepare(
    "INSERT INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) " +
      "VALUES ('a99-mala', 'SERIO', 'A99', 8, NULL, 0, '{\"id\":\"a99-mala\"}', 0, 0)",
  ).run();
  db.prepare(
    "INSERT INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) " +
      "VALUES ('a99-sinerrores', 'SERIO', 'A01', 8, NULL, 0, " +
      "'{\"id\":\"a99-sinerrores\",\"habilidad\":\"A01\",\"nivel\":8,\"formato\":\"toca_la_respuesta\",\"enunciado\":{\"clave\":\"a.pct.de\",\"vars\":{\"p\":5,\"n\":400}},\"respuesta\":{\"valor\":20,\"tol\":0},\"errores\":[],\"proposito\":\"interpretar\",\"variacion\":null}', 0, 0)",
  ).run();
  es(await origen.presentarItem("a99-mala", "en"), null, "JSON que no es un ítem");
  es(await origen.presentarItem("a99-sinerrores", "en"), null, "ítem sin errores nombrados — un adulto también merece la causa (#166)");
  es(await origen.calificarContraBanco("a99-mala", 1), null, "calificar la corrupta");
});

await caso("la re-siembra NO pisa una fila corregida a mano (D-072, INSERT OR IGNORE)", async () => {
  db.prepare("UPDATE item_bank SET nivel = 9, item_json = json_set(item_json, '$.nivel', 9) WHERE id = 'a13-144-12'").run();
  db.exec(readFileSync("/tmp/f5b-siembra-prueba.sql", "utf8"));
  const despues = await origen.presentarItem("a13-144-12", "en");
  es(despues.nivel, 9, "la corrección manual tras re-sembrar");
});

console.log("");
if (fallos > 0) { console.error(`✗ ${fallos} de ${corridos} casos fallaron`); process.exit(1); }
console.log(`✓ ${corridos} casos del cable D1 de la franja adulta`);
