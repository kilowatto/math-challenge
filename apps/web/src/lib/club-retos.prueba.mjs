import assert from "node:assert/strict";
import { generarBancoAdulto } from "../../../../packages/motor/src/banco-adulto.ts";
import { itemsDelReto, puntuarRespuestas } from "./club-retos.ts";

const banco = generarBancoAdulto().filter((item) => item.nivel === 8).slice(0, 2);
const items = itemsDelReto(JSON.stringify(banco.map((item) => item.id)), banco);
assert.equal(items.length, 2);
const respuestas = items.map((item) => ({ itemId: item.id, eleccion: item.respuesta.valor }));
assert.equal(puntuarRespuestas(items, respuestas)?.correctas, 2);
assert.equal(puntuarRespuestas(items, respuestas.slice(0, 1)), null);
assert.equal(puntuarRespuestas(items, [{ ...respuestas[0], itemId: "otro" }, respuestas[1]]), null);
console.log("club-retos: ok");
