// Casos del PIN de imágenes (F2 #116, línea roja #3, D-012).

import {
  rejillaDe,
  hashearPin,
  hashearPinConOrden,
  pinValido,
  pinesIguales,
  CATALOGO,
  CASILLAS,
  LARGO_PIN,
  COMBINACIONES,
} from "./pin-imagenes.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

const SECRETO = "secreto-de-prueba-no-es-el-de-produccion";

console.log("pin-imagenes — el niño entra sin escribir (línea roja #3)\n");

// --- la rejilla ------------------------------------------------------------
const r1 = await rejillaDe(SECRETO, "nino-1");
ok(r1.length === CASILLAS, `la rejilla son ${CASILLAS} casillas`);
ok(new Set(r1).size === CASILLAS, "sin dibujos repetidos: tocar dos iguales sería ambiguo");
ok(r1.every((d) => CATALOGO.includes(d)), "todos los dibujos salen del catálogo");

// --- determinista para el MISMO niño ---------------------------------------
// Si cambiara entre visitas, el niño no podría recordar su PIN.
const r1bis = await rejillaDe(SECRETO, "nino-1");
ok(JSON.stringify(r1) === JSON.stringify(r1bis), "el mismo niño ve SIEMPRE la misma rejilla");

// --- distinta entre hermanos -----------------------------------------------
// Dos hermanos en la misma tablet: mirar por encima del hombro no basta, hay que
// aprenderse las posiciones del otro y no los dibujos.
const r2 = await rejillaDe(SECRETO, "nino-2");
ok(JSON.stringify(r1) !== JSON.stringify(r2), "dos niños distintos ven rejillas distintas");

// Y con muchos niños las rejillas siguen repartiéndose, no colapsan a una.
const vistas = new Set();
for (let i = 0; i < 30; i++) vistas.add(JSON.stringify(await rejillaDe(SECRETO, `n-${i}`)));
ok(vistas.size >= 28, `30 niños dan ${vistas.size} rejillas distintas`);

// --- el secreto importa -----------------------------------------------------
const conOtroSecreto = await rejillaDe("otro-secreto-distinto", "nino-1");
ok(JSON.stringify(r1) !== JSON.stringify(conOtroSecreto), "cambiar el secreto cambia todas las rejillas");

// --- validación del PIN -----------------------------------------------------
ok(pinValido([0, 4, 7]), "tres posiciones distintas es un PIN válido");
ok(!pinValido([3, 3, 3]), "la misma casilla tres veces NO vale — es lo que hace un niño que no entendió, y aceptarlo dejaría 9 combinaciones");
ok(!pinValido([0, 1]), "dos posiciones no bastan");
ok(!pinValido([0, 1, 2, 3]), "cuatro son demasiadas");
ok(!pinValido([0, 1, 9]), "una posición fuera de la rejilla no vale");
ok(!pinValido([0, 1, -1]), "ni una negativa");
ok(!pinValido([0, 1, 2.5]), "ni una fraccionaria");
ok(!pinValido(null), "ni null");

// --- el hash ----------------------------------------------------------------
const h = await hashearPin(SECRETO, "nino-1", [0, 4, 7]);
ok(/^[0-9a-f]{64}$/.test(h), "el hash son 64 hexadecimales (SHA-256)");
ok(h === (await hashearPin(SECRETO, "nino-1", [0, 4, 7])), "el mismo PIN da el mismo hash");
// D-202: el orden dejó de contar. Este caso decía lo contrario hasta el
// 2026-08-11 — se invierte, no se borra: es el que fija la decisión.
// KINDER no lee ni memoriza secuencias; acordarse de tres dibujos es
// reconocimiento, acordarse de tres EN ORDEN es memoria de trabajo.
ok(h === (await hashearPin(SECRETO, "nino-1", [7, 4, 0])), "el orden NO cuenta: 0-4-7 abre igual que 7-4-0");
ok(h === (await hashearPin(SECRETO, "nino-1", [4, 0, 7])), "y cualquier otro orden de los mismos tres");
ok(h !== (await hashearPin(SECRETO, "nino-1", [0, 4, 8])), "pero tres dibujos DISTINTOS siguen siendo otro PIN");

// El camino de migración: los PIN elegidos antes de D-202 llevan el orden
// dentro del hash, y `pin-entrar` los reconoce con esta función para poder
// reescribirlos. Sin esto, cada niño con PIN previo se habría quedado fuera.
const conOrden = await hashearPinConOrden(SECRETO, "nino-1", [7, 4, 0]);
ok(conOrden !== h, "el hash viejo (con orden) NO es el nuevo — por eso hace falta migrar");
ok(conOrden === (await hashearPinConOrden(SECRETO, "nino-1", [7, 4, 0])), "y el viejo sigue siendo estable");
ok(h !== (await hashearPin(SECRETO, "nino-2", [0, 4, 7])), "dos niños con el mismo PIN tienen hashes distintos");

// El hash no contiene los dibujos: se guardan posiciones, no «sol, gato, barco».
ok(!CATALOGO.some((d) => h.includes(d)), "el hash no filtra ningún nombre de dibujo");

let lanzo = false;
try { await hashearPin(SECRETO, "nino-1", [1, 1, 1]); } catch { lanzo = true; }
ok(lanzo, "hashear un PIN inválido lanza en vez de guardar basura");

// --- comparación ------------------------------------------------------------
ok(pinesIguales(h, h), "un hash es igual a sí mismo");
ok(!pinesIguales(h, "0".repeat(64)), "y distinto de otro");
ok(!pinesIguales(h, h.slice(0, 60)), "un hash truncado no pasa");

// --- lo que este PIN NO es --------------------------------------------------
ok(COMBINACIONES === 84, `son ${COMBINACIONES} combinaciones — NO es seguridad contra un adulto, y D-012 dice que la protección real la da el dispositivo`);

console.log(fallos === 0 ? "\n✓ pin-imagenes — todos los casos" : `\n✗ pin-imagenes — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
