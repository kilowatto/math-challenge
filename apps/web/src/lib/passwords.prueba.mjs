// Casos de la contraseña de respaldo (F2 #112, D-038).
//
// Corre con:  node --experimental-strip-types --no-warnings apps/web/src/lib/passwords.prueba.mjs
//
// Se ejecuta el MISMO archivo que se despliega, no una copia compilada. Node
// expone `crypto.subtle` global igual que workerd, así que estas pruebas cubren
// la lógica; el TIEMPO se midió aparte, dentro de workerd, y está en el
// encabezado de `passwords.ts`.

import {
  hashear,
  verificar,
  leerPHC,
  largoValido,
  ITERACIONES,
  LARGO_MINIMO,
  LARGO_MAXIMO,
} from "./passwords.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("passwords — contraseña de respaldo (D-038, F2 #112)\n");

// --- la cadena PHC lleva su algoritmo y sus iteraciones adentro -------------
const h = await hashear("caballo correcto batería grapa");
ok(/^\$pbkdf2-sha256\$i=600000\$/.test(h), "la cadena declara algoritmo e iteraciones");

const phc = leerPHC(h);
ok(phc !== null, "la cadena se puede volver a leer");
ok(phc.iteraciones === ITERACIONES, `las iteraciones son ${ITERACIONES}`);
ok(phc.sal.length === 16, "la sal son 16 bytes (NIST SP 800-132)");
ok(phc.hash.length === 32, "el hash son 32 bytes (SHA-256)");

// --- dos hashes de la misma contraseña NO son iguales -----------------------
// Sin sal por fila, dos padres con la misma contraseña tendrían el mismo hash y
// una filtración diría cuáles la comparten.
const h2 = await hashear("caballo correcto batería grapa");
ok(h !== h2, "la misma contraseña produce dos hashes distintos (hay sal por fila)");

// --- verificar --------------------------------------------------------------
ok((await verificar("caballo correcto batería grapa", h)).ok, "la contraseña correcta verifica");
ok(!(await verificar("caballo correcto bateria grapa", h)).ok, "un acento de diferencia NO verifica");
ok(!(await verificar("", h)).ok, "la cadena vacía no verifica");

// --- el rehash cuando suben las iteraciones ---------------------------------
// Es el caso que hace que subir ITERACIONES sirva de algo: sin esta señal, quien
// ya tenía cuenta se queda con el hash débil para siempre.
const viejo = await hashear("caballo correcto batería grapa", 100_000);
const r = await verificar("caballo correcto batería grapa", viejo);
ok(r.ok, "un hash viejo (100k) sigue verificando");
ok(r.desactualizado, "y se reporta desactualizado, para poder re-hashearlo");
ok(!(await verificar("caballo correcto batería grapa", h)).desactualizado, "uno al día no se reporta desactualizado");

// --- cadenas corruptas: null, nunca excepción -------------------------------
// Una excepción aquí sería un 500 en el inicio de sesión de alguien cuya fila se
// corrompió, en vez de un "contraseña incorrecta".
for (const mala of ["", "$", "$argon2id$v=19$m=1$x$y", "$pbkdf2-sha256$i=0$YQ==$Yg==", "$pbkdf2-sha256$i=abc$YQ==$Yg==", "texto suelto"]) {
  ok(leerPHC(mala) === null, `cadena inválida devuelve null: ${JSON.stringify(mala.slice(0, 28))}`);
}
ok((await verificar("x", "basura")).ok === false, "verificar sobre basura devuelve false, no lanza");

// --- largo: NIST, no reglas de composición ----------------------------------
ok(!largoValido("a".repeat(LARGO_MINIMO - 1)), `${LARGO_MINIMO - 1} caracteres no basta`);
ok(largoValido("a".repeat(LARGO_MINIMO)), `${LARGO_MINIMO} caracteres basta`);
ok(largoValido("a".repeat(LARGO_MAXIMO)), `${LARGO_MAXIMO} caracteres se acepta (NIST exige aceptar 64)`);
ok(!largoValido("a".repeat(LARGO_MAXIMO + 1)), `${LARGO_MAXIMO + 1} caracteres se rechaza`);
ok(largoValido("todo en minúsculas sin números"), "NO se exige mayúscula ni número (NIST SP 800-63B retiró las reglas de composición)");

// El emoji cuenta como UN carácter. Con `.length` de JavaScript contaría 2 y
// cinco emojis «pasarían» un mínimo de 8 sin tener 8 caracteres reales.
ok(!largoValido("🐘🐘🐘🐘🐘"), "5 emojis NO pasan el mínimo de 8 (se cuenta por punto de código)");
ok(largoValido("🐘🐘🐘🐘🐘🐘🐘🐘"), "8 emojis sí pasan");

// --- una contraseña larguísima no revienta ----------------------------------
ok(!largoValido("a".repeat(5000)), "una contraseña de 5000 caracteres se rechaza por largo, sin hashearla");

console.log(fallos === 0 ? "\n✓ passwords — todos los casos" : `\n✗ passwords — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
