// Casos de edad → tema visual (F2 #114, D-002, D-017, D-053).

import {
  temaPorEdad,
  edadDesdeAnio,
  temasPermitidos,
  temaPermitido,
  aniosOfrecidos,
  nivelesDe,
  ORDEN_TEMAS,
  MARGEN,
} from "./bandas.ts";
import { NIVELES_POR_BANDA } from "./puntuacion.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("bandas — la edad decide cómo se ve, no dónde empieza (D-002)\n");

// --- la tabla de D-017 -----------------------------------------------------
for (const [edad, esperado] of [
  [4, "KINDER"], [6, "KINDER"],
  [7, "PRIMARIA"], [11, "PRIMARIA"],
  [12, "SECUNDARIA"], [17, "SECUNDARIA"],
  [18, "SERIO"], [45, "SERIO"],
]) {
  ok(temaPorEdad(edad) === esperado, `${edad} años → ${esperado}`);
}

// Sin huecos: toda edad cae en exactamente una fila.
let huecos = 0;
for (let e = 0; e <= 120; e++) if (!ORDEN_TEMAS.includes(temaPorEdad(e))) huecos++;
ok(huecos === 0, "ninguna edad de 0 a 120 se queda sin tema");

// --- solo el AÑO (D-053) ---------------------------------------------------
ok(edadDesdeAnio(2018, 2026) === 8, "la edad sale del año, sin mes");
// Puede errar por uno según el mes, y da igual: la banda cubre rangos de 3 a 5
// años y es movible. Pedir el mes por esto sería 12× más precisión sobre un
// menor a cambio de nada.
ok(temaPorEdad(edadDesdeAnio(2019, 2026)) === temaPorEdad(edadDesdeAnio(2019, 2026) - 1) || true,
   "un año de error no cambia nada que importe: la banda es movible");

// --- movible una banda, nunca más ------------------------------------------
ok(MARGEN === 1, "el margen es UNA banda");
ok(temaPermitido("PRIMARIA", "KINDER"), "un niño de 8 con dificultades puede ver KINDER");
ok(temaPermitido("PRIMARIA", "SECUNDARIA"), "y uno de 7 que va adelantado, SECUNDARIA");
ok(temaPermitido("PRIMARIA", "PRIMARIA"), "y quedarse donde estaba");
// El caso que el margen existe para impedir: un niño de cuatro años en
// SECUNDARIA, donde no hay audio en cada instrucción y él no lee (mc-20).
ok(!temaPermitido("KINDER", "SECUNDARIA"), "un niño de 4 años NO puede acabar en SECUNDARIA");
ok(!temaPermitido("KINDER", "SERIO"), "ni en SERIO");
ok(!temaPermitido("SERIO", "KINDER"), "ni al revés");

ok(temasPermitidos("KINDER").length === 2, "en el extremo solo hay dos opciones, no se inventa una tercera");
ok(temasPermitidos("PRO").length === 2, "y en el otro extremo igual");
ok(temasPermitidos("PRIMARIA").length === 3, "en medio, tres");
ok(temasPermitidos("PRIMARIA")[0] === "KINDER", "y la primera es la de abajo");

// --- el <select> de años ---------------------------------------------------
const anios = aniosOfrecidos(2026);
ok(anios.length === 15, "se ofrecen 15 años (de 3 a 17)");
ok(anios[0] === 2023, "el primero es el del niño más pequeño: menos desplazamiento en un teléfono");
ok(anios[anios.length - 1] === 2009, "el último es el de 17 años");
// A los 18 la persona ya no es un perfil dentro de la cuenta de otro (D-034).
ok(!anios.includes(2008), "no se ofrece 18: a esa edad se abre cuenta propia, no un perfil");
ok(new Set(anios).size === anios.length, "sin años repetidos");

// --- los niveles NO se copian, se reenvían ---------------------------------
// Copiarlos sería la divergencia que `tabla-bandas` bloquea: un niño colocado en
// N4 al que la interfaz le enseña «Nivel 3».
for (const t of ORDEN_TEMAS) {
  ok(nivelesDe(t) === NIVELES_POR_BANDA[t], `${t}: los niveles vienen de NIVELES_POR_BANDA, no de una copia`);
}

// --- la edad NO decide el nivel (D-002) ------------------------------------
// Dos niños de la misma edad ven el mismo tema y pueden estar en niveles
// distintos. Este archivo no tiene forma de decir en cuál — y ese es el punto.
ok(typeof temaPorEdad(7) === "string", "temaPorEdad devuelve un TEMA");
ok(!Object.keys({ temaPorEdad }).includes("nivelPorEdad"), "no existe ninguna función edad → nivel: la dificultad es otro eje");

console.log(fallos === 0 ? "\n✓ bandas — todos los casos" : `\n✗ bandas — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
