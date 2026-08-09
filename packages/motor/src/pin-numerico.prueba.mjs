// Casos del PIN numérico — PRIMARIA/SECUNDARIA (D-197 §2).

import {
  LARGO_PIN_NUMERICO,
  pinNumericoValido,
  hashearPinNumerico,
  pinesNumericosIguales,
  COMBINACIONES_PIN_NUMERICO,
} from "./pin-numerico.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("pin-numerico — PIN de 4 dígitos para PRIMARIA/SECUNDARIA (D-197)\n");

const SECRETO = "secreto-de-prueba-nunca-el-real";

// --- forma del PIN ----------------------------------------------------------
ok(LARGO_PIN_NUMERICO === 4, "el PIN numérico son 4 dígitos");
ok(pinNumericoValido([1, 2, 3, 4]), "cuatro dígitos distintos es válido");
ok(pinNumericoValido([1, 1, 1, 1]), "dígitos repetidos SÍ son válidos (a diferencia del PIN de imágenes)");
ok(!pinNumericoValido([1, 2, 3]), "menos de 4 dígitos no es válido");
ok(!pinNumericoValido([1, 2, 3, 4, 5]), "más de 4 dígitos no es válido");
ok(!pinNumericoValido([1, 2, 3, 10]), "un dígito fuera de 0-9 no es válido");
ok(!pinNumericoValido([1, 2, -1, 4]), "un dígito negativo no es válido");
ok(!pinNumericoValido("1234"), "una cadena en vez de un arreglo no es válida");

// --- el hash es determinista y salado por niño ------------------------------
const hashA1 = await hashearPinNumerico(SECRETO, "child-a", [1, 2, 3, 4]);
const hashA2 = await hashearPinNumerico(SECRETO, "child-a", [1, 2, 3, 4]);
ok(hashA1 === hashA2, "el mismo PIN del mismo niño da siempre el mismo hash");

const hashB = await hashearPinNumerico(SECRETO, "child-b", [1, 2, 3, 4]);
ok(hashA1 !== hashB, "el MISMO PIN de OTRO niño da un hash distinto (salado por childProfileId)");

const hashOtroPin = await hashearPinNumerico(SECRETO, "child-a", [4, 3, 2, 1]);
ok(hashA1 !== hashOtroPin, "otro PIN del mismo niño da un hash distinto");

// --- nunca se guarda el PIN en claro, solo el hash --------------------------
ok(!hashA1.includes("1234"), "el hash no contiene el PIN en claro");
ok(/^[0-9a-f]{64}$/.test(hashA1), "el hash es un SHA-256 en hex (64 caracteres)");

// --- lanza con dígitos inválidos, no hashea basura --------------------------
let lanzo = false;
try {
  await hashearPinNumerico(SECRETO, "child-a", [1, 2, 3]);
} catch {
  lanzo = true;
}
ok(lanzo, "hashear un PIN inválido lanza en vez de guardar cualquier cosa");

// --- comparación en tiempo constante -----------------------------------------
ok(pinesNumericosIguales(hashA1, hashA1), "un hash se compara igual a sí mismo");
ok(!pinesNumericosIguales(hashA1, hashB), "hashes distintos comparan distinto");

// --- el espacio de combinaciones se publica, no se esconde ------------------
ok(COMBINACIONES_PIN_NUMERICO === 10000, "10,000 combinaciones (10^4) — más que las 504 del PIN de imágenes");

console.log(fallos === 0 ? "\n✓ pin-numerico — todos los casos" : `\n✗ pin-numerico — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
