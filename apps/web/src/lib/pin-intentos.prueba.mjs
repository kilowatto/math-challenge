#!/usr/bin/env node
// Casos del límite de intentos del PIN (D-202, consecuencia obligatoria).
//
//     node --experimental-strip-types apps/web/src/lib/pin-intentos.prueba.mjs
//
// Sin servidor real: una implementación mínima de `KVNamespace` en memoria,
// que es todo lo que estas funciones tocan.

import { puedeIntentar, anotarFallo, limpiarFallos, estaBloqueado, MAX_FALLOS, ESPERA_S } from "./pin-intentos.ts";

let fallos = 0;
let corridos = 0;

async function caso(nombre, fn) {
  corridos++;
  try {
    await fn();
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    fallos++;
    console.error(`  ✗ ${nombre}\n      ${String(err).split("\n")[0]}`);
  }
}

function igual(real, esperado, que) {
  if (real !== esperado) throw new Error(`${que}: esperaba ${JSON.stringify(esperado)}, fue ${JSON.stringify(real)}`);
}

/** Un KV de mentira, suficiente para lo que `pin-intentos.ts` pide. */
function kvDeMentira() {
  const datos = new Map();
  return {
    async get(clave) {
      return datos.has(clave) ? datos.get(clave) : null;
    },
    async put(clave, valor) {
      datos.set(clave, valor);
    },
    async delete(clave) {
      datos.delete(clave);
    },
  };
}

console.log("\npin-intentos — D-202, el límite obligatorio\n");

await caso("sin historial, se puede intentar", async () => {
  const kv = kvDeMentira();
  igual(await puedeIntentar(kv, "nino-1"), true, "puede");
});

await caso(`hasta ${MAX_FALLOS - 1} fallos, se sigue pudiendo intentar`, async () => {
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS - 1; i++) await anotarFallo(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-1"), true, "puede");
  igual(await estaBloqueado(kv, "nino-1"), false, "bloqueado");
});

await caso(`EL CASO QUE JUSTIFICA EL LÍMITE: al fallo ${MAX_FALLOS}, se bloquea`, async () => {
  // Sin este bloqueo, un hermano con el dispositivo ya desbloqueado agota las
  // 84 combinaciones del PIN de KINDER (D-202) sin ningún freno.
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS; i++) await anotarFallo(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-1"), false, "puede");
  igual(await estaBloqueado(kv, "nino-1"), true, "bloqueado");
});

await caso("el bloqueo NO afecta a otro perfil — es por hijo, no por dispositivo", async () => {
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS; i++) await anotarFallo(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-2"), true, "el hermano puede intentar igual");
});

await caso("un acierto (limpiarFallos) borra el contador entero", async () => {
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS; i++) await anotarFallo(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-1"), false, "bloqueado antes de limpiar");
  await limpiarFallos(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-1"), true, "puede tras limpiar");
});

await caso("el desbloqueo del adulto usa la MISMA función que un acierto", async () => {
  // No hay una segunda función `desbloquear()`: el adulto que confía sin
  // esperar y el niño que acertó borran el mismo contador, por la misma vía.
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS; i++) await anotarFallo(kv, "nino-1");
  await limpiarFallos(kv, "nino-1"); // lo que llama api/pin-desbloquear.ts
  igual(await estaBloqueado(kv, "nino-1"), false, "ya no bloqueado");
});

await caso("pasada la espera, se puede intentar de nuevo sin que nadie desbloquee", async () => {
  // El bloqueo se resuelve SOLO — no depende de que el adulto intervenga.
  const kv = kvDeMentira();
  for (let i = 0; i < MAX_FALLOS; i++) await anotarFallo(kv, "nino-1");
  igual(await puedeIntentar(kv, "nino-1"), false, "bloqueado justo después");
  // Se adelanta el reloj retocando el estado guardado, en vez de esperar
  // ESPERA_S segundos de verdad en cada corrida del gancho de pre-commit.
  const crudo = JSON.parse(await kv.get("pin-fallos:nino-1"));
  crudo.bloqueadoDesde = Date.now() - (ESPERA_S * 1000 + 1);
  await kv.put("pin-fallos:nino-1", JSON.stringify(crudo));
  igual(await puedeIntentar(kv, "nino-1"), true, "puede tras la espera");
});

console.log(`\n${corridos - fallos}/${corridos} casos\n`);
if (fallos > 0) process.exit(1);
