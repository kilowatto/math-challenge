#!/usr/bin/env node
// Casos del cable D1 del banco de PRIMARIA — F5c #356, D-072.
//
//     node --experimental-strip-types apps/web/src/lib/banco-primaria.prueba.mjs
//
// El motor (banco-primaria.prueba.mjs) prueba las plantillas; el presentador
// (presentar.prueba.mjs) prueba la composición. Esto es lo otro: el CAMINO
// completo — migración 0016 + siembra generada por el guion + lectura por
// D1 — contra SQLite de verdad (`node:sqlite`), no contra un simulacro. Un
// cable mal escrito no da error: da un adulto que recibe `banco_vacio`
// teniendo 1 800 ítems sembrados, o un «corrió un lugar» explicado como
// «cayó un lugar» porque la fila se leyó torcida.
//
// Se corre desde el gancho vía audits/run.mjs, no a mano.

import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { bancoPrimariaD1 } from "./banco-primaria.ts";

let fallos = 0, corridos = 0;
// `await` dentro: los casos son async (leyen D1). Sin esperar al promise, el
// ✓ salía antes de que el caso corriera y un fallo real salía como crash al
// final — visto de verdad al escribir esta prueba.
async function caso(n, fn) { corridos++; try { await fn(); console.log(`  ✓ ${n}`); } catch (e) { fallos++; console.error(`  ✗ ${n}`); console.error(`      ${e.message}`); } }
const es = (a, b, m) => { if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); };

console.log("\n== banco de primaria en D1 — el cable completo (#356, D-072) ==\n");

// --- La base de verdad: la migración 0016 + la siembra del guion -----------
const db = new DatabaseSync(":memory:");
db.exec(readFileSync("migrations/0016_banco_items_primaria.sql", "utf8"));
execFileSync("node", [
  "--experimental-strip-types", "--no-warnings",
  "scripts/sembrar-banco-primaria.mjs", "--salida", "/tmp/f5c-siembra-prueba.sql",
]);
db.exec(readFileSync("/tmp/f5c-siembra-prueba.sql", "utf8"));

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

const origen = bancoPrimariaD1(adaptar(db), MENSAJES);

await caso("el catálogo devuelve la siembra entera, con el techo solo en P03", async () => {
  const catalogo = await origen.catalogoAdaptativo();
  if (catalogo.length < 1400) throw new Error(`solo ${catalogo.length} filas`);
  const techos = new Set(catalogo.filter((c) => c.hastaNivel != null).map((c) => c.habilidad));
  es(JSON.stringify([...techos]), JSON.stringify(["P03"]), "qué modelo tiene techo");
  for (const c of catalogo) {
    if (c.habilidad === "P03" && c.hastaNivel !== 4) throw new Error(`${c.id}: techo ${c.hastaNivel}`);
    if (c.habilidad !== "P03" && c.hastaNivel != null) throw new Error(`${c.id}: techo donde no toca`);
    if (!Number.isFinite(c.dificultad)) throw new Error(`${c.id}: sin dificultad`);
  }
});

await caso("presentarItem compone el enunciado y las opciones en el locale", async () => {
  const p = await origen.presentarItem("p02-0-2-1-2-3-0", "es-ES");
  if (!p) throw new Error("no presentó un ítem sembrado");
  es(p.enunciado, "¿Qué número es el mayor?", "el enunciado en es-ES");
  const textos = p.opciones.map((o) => o.texto).sort();
  es(JSON.stringify(textos), JSON.stringify(["2.123", "2.231", "2.312"]), "las opciones con punto de millar");
});

await caso("calificarContraBanco nombra la causa — Larry recibe el veredicto, no calcula", async () => {
  const bien = await origen.calificarContraBanco("p02-0-2-1-2-3-0", 2312);
  es(bien.acc, 1, "la correcta");
  es(bien.banda, "PRIMARIA", "la banda del intento");
  const mal = await origen.calificarContraBanco("p02-0-2-1-2-3-0", 2123);
  es(mal.acc, 0, "el distractor");
  es(mal.causa, "error.p.comparo_desde_las_unidades", "la causa nombrada");
  es(mal.nivel, 4, "el nivel del ítem");
});

await caso("un ítem que no está devuelve null, no una excepción — el endpoint decide su respaldo", async () => {
  es(await origen.presentarItem("k11-3-4-0", "en"), null, "ítem de kinder en el banco de primaria");
  es(await origen.calificarContraBanco("k11-3-4-0", 7), null, "calificar un ítem de kinder aquí");
});

await caso("una fila corrupta no se sirve: validarItem al leer, siempre", async () => {
  // La fila se puede editar a mano (D-072). Una edición mala no llega a una
  // pantalla: se valida al leer y se trata como ausente.
  db.prepare(
    "INSERT INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) " +
      "VALUES ('p99-mala', 'PRIMARIA', 'P99', 3, NULL, 0, '{\"id\":\"p99-mala\"}', 0, 0)",
  ).run();
  db.prepare(
    "INSERT INTO item_bank (id, banda, habilidad, nivel, hasta_nivel, dificultad, item_json, creado_en, actualizado_en) " +
      "VALUES ('p99-sinerrores', 'PRIMARIA', 'P01', 3, NULL, 0, " +
      "'{\"id\":\"p99-sinerrores\",\"habilidad\":\"P01\",\"nivel\":3,\"formato\":\"toca_la_respuesta\",\"enunciado\":{\"clave\":\"p.fluidez.suma\",\"vars\":{\"a\":1,\"b\":2}},\"respuesta\":{\"valor\":3,\"tol\":0},\"errores\":[],\"proposito\":\"interpretar\",\"variacion\":null}', 0, 0)",
  ).run();
  es(await origen.presentarItem("p99-mala", "en"), null, "JSON que no es un ítem");
  es(await origen.presentarItem("p99-sinerrores", "en"), null, "ítem sin errores nombrados");
  es(await origen.calificarContraBanco("p99-mala", 1), null, "calificar la corrupta");
});

await caso("la re-siembra NO pisa una fila corregida a mano (D-072, INSERT OR IGNORE)", async () => {
  const antes = await origen.presentarItem("p02-0-2-1-2-3-0", "en");
  // Una corrección manual: el ítem ahora tiene nivel 5 en la base.
  db.prepare("UPDATE item_bank SET nivel = 5, item_json = json_set(item_json, '$.nivel', 5) WHERE id = 'p02-0-2-1-2-3-0'").run();
  // Re-sembrar encima: la corrección sobrevive.
  db.exec(readFileSync("/tmp/f5c-siembra-prueba.sql", "utf8"));
  const despues = await origen.presentarItem("p02-0-2-1-2-3-0", "en");
  es(despues.nivel, 5, "la corrección manual tras re-sembrar");
  es(antes.enunciado, despues.enunciado, "el ítem sigue sirviéndose");
});

console.log("");
if (fallos > 0) { console.error(`✗ ${fallos} de ${corridos} casos fallaron`); process.exit(1); }
console.log(`✓ ${corridos} casos del cable D1 del banco de primaria`);
