#!/usr/bin/env node
// Llena los campos del proyecto de GitHub.
//
//   node scripts/poblar-proyecto.mjs [numero-de-proyecto]
//
// Va aparte de crear-proyecto.sh porque `gh project item-create` no acepta
// valores de campo: crea el elemento y ya. Poner los datos solo en el cuerpo
// —que fue el primer intento— deja los campos vacíos, y entonces agrupar por
// Vía o filtrar por Riesgo no devuelve nada. Un tablero cuyos campos no se
// pueden filtrar es una lista con pasos extra.
//
// Es idempotente: se puede volver a correr tras editar la tabla de abajo.

import { execFileSync } from "node:child_process";

const proyecto = process.argv[2] ?? "1";
const DUENO = "kilowatto";

const gh = (...a) => execFileSync("gh", a, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

const campos = JSON.parse(gh("project", "field-list", proyecto, "--owner", DUENO, "--format", "json")).fields;
const items = JSON.parse(
  gh("project", "item-list", proyecto, "--owner", DUENO, "--format", "json", "--limit", "100"),
).items;
const proyectoId = items[0]?.id ? JSON.parse(gh("project", "view", proyecto, "--owner", DUENO, "--format", "json")).id : null;

const campo = (n) => campos.find((c) => c.name === n);
const opcion = (n, v) => campo(n)?.options?.find((o) => o.name === v)?.id;

// prefijo del título → [Vía, Depende de, Decisiones, Ruta crítica, Riesgo, Estado]
const DATOS = {
  "S0": ["Sitio abierto", "—", "D-033", "No", "Bajo", "Todo"],
  "S1": ["Sitio abierto", "S0", "D-033", "No", "Bajo", "Todo"],
  "S2": ["Sitio abierto", "S0", "D-033", "No", "Bajo", "Todo"],
  "F0": ["Producto", "—", "D-022, D-023, D-030", "Sí", "Bajo", "Done"],
  "F1": ["Producto", "F0", "D-032, D-035", "Sí", "Bajo", "Done"],
  "F2": ["Producto", "F0", "D-011, D-012, D-013, D-026", "Sí", "Medio", "Todo"],
  "F3": ["Producto", "F2", "D-010, D-018, D-024", "Sí", "Medio", "Todo"],
  "F4": ["Producto", "F3", "D-002", "No", "Medio", "Todo"],
  "F5 ": ["Producto", "esquema de ítem (§9)", "D-006, D-009, D-022", "Sí", "Alto", "Todo"],
  "F5b": ["Producto", "F5", "D-034", "No", "Medio", "Todo"],
  "F6": ["Producto", "F3, F5", "D-004, D-015, D-035", "No", "Medio", "Todo"],
  "F7": ["Producto", "F4", "D-003, D-014, D-016, D-025", "No", "Bajo", "Todo"],
  "F8": ["Producto", "F2", "D-016, D-021", "No", "Bajo", "Todo"],
  "F9": ["Producto", "F2, F7", "D-011, D-027", "No", "Bloqueada", "Todo"],
  "F10": ["Producto", "F5b, F7", "D-027, D-028, D-029", "No", "Medio", "Todo"],
  "F11": ["Producto", "todas", "D-020, D-031", "No", "Medio", "Todo"],
  "T-5": ["Transversal", "bloquea F9", "D-011, D-027", "Sí", "Bloqueada", "Todo"],
  "T-6": ["Transversal", "bloquea modo Pro", "D-034", "No", "Medio", "Todo"],
};

// Ordenadas de más larga a más corta: `"F10".startsWith("F1")` es verdadero,
// así que emparejar en orden de inserción le daba a F10 y F11 los datos de F1.
// El fallo era silencioso — el script decía "✓" sobre el elemento equivocado.
const CLAVES = Object.keys(DATOS).sort((a, b) => b.length - a.length);

const editar = (itemId, nombreCampo, valor, esSelect) => {
  const c = campo(nombreCampo);
  if (!c) return;
  const args = ["project", "item-edit", "--id", itemId, "--project-id", proyectoId, "--field-id", c.id];
  if (esSelect) {
    const o = opcion(nombreCampo, valor);
    if (!o) return;
    args.push("--single-select-option-id", o);
  } else {
    args.push("--text", valor);
  }
  gh(...args);
};

let hechos = 0;
for (const item of items) {
  const clave = CLAVES.find((k) => item.title.startsWith(k));
  if (!clave) {
    console.log(`  ? sin datos: ${item.title}`);
    continue;
  }
  const [via, depende, decisiones, critica, riesgo, estado] = DATOS[clave];
  editar(item.id, "Vía", via, true);
  editar(item.id, "Depende de", depende, false);
  editar(item.id, "Decisiones", decisiones, false);
  editar(item.id, "Ruta crítica", critica, true);
  editar(item.id, "Riesgo", riesgo, true);
  editar(item.id, "Status", estado, true);
  console.log(`  ✓ ${item.title.slice(0, 52)}`);
  hechos++;
}

console.log(`\n✓ ${hechos} elemento(s) con campos completos`);
console.log(`  https://github.com/users/${DUENO}/projects/${proyecto}`);
