import assert from "node:assert/strict";
import { validarItem } from "./item.ts";
import { generarBancoCierre, nivelesDelCierre } from "./banco-cierre.ts";

const banco = generarBancoCierre();
assert.deepEqual(nivelesDelCierre(), [7, 11, 12]);
for (const nivel of nivelesDelCierre()) {
  const items = banco.filter((item) => item.nivel === nivel);
  assert.equal(items.length, 6);
  assert.ok(items.every((item) => validarItem(item).length === 0));
  assert.equal(new Set(items.map((item) => item.id)).size, 6);
}
console.log("banco-cierre: ok");
