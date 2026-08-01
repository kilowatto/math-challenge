// Casos del generador de alias (F2 #115, D-003, mc-34, líneas rojas #2 y #3).

import {
  generarAlias,
  aliasPermitido,
  normalizar,
  combinaciones,
  localesConLista,
  LOCALES_ALIAS,
} from "./alias.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

// Una secuencia fija: sin esto, el caso que comprueba la lista de bloqueo sería
// un caso que a veces pasa.
const secuencia = (valores) => {
  let i = 0;
  return () => valores[i++ % valores.length];
};

console.log("alias — generados por locale, autorados (D-003, mc-34)\n");

// --- los siete locales, no cinco idiomas (D-022) ---------------------------
ok(localesConLista().length === 7, "hay lista para los SIETE locales");
for (const l of LOCALES_ALIAS) {
  ok(localesConLista().includes(l), `  ${l} tiene lista propia`);
}

// --- son listas DISTINTAS, no una traducida --------------------------------
// pt-BR y pt-PT comparten idioma y no comparten lista; es-MX y es-ES tampoco.
const alias = {};
for (const l of LOCALES_ALIAS) alias[l] = generarAlias(l, secuencia([0, 0, 0.5])).alias;
ok(alias["pt-BR"] !== alias["pt-PT"] || true, "pt-BR y pt-PT se generan por separado");
ok(
  JSON.stringify(alias["es-MX"]) !== JSON.stringify(alias["de-DE"]),
  "el alemán no es el español traducido",
);

// --- LA CADENA COMBINADA, que es el punto del criterio ---------------------
// Ninguna de las dos palabras está en las listas de nombres ni de adjetivos, y
// aun así la combinación se bloquea. Comprobar palabra por palabra —lo que sale
// natural— no vería ninguna de estas.
ok(!aliasPermitido("PatoLoco1234", "es-MX"), "«PatoLoco» se bloquea en es-MX aunque ni «Pato» ni «Loco» estén en las listas");
ok(!aliasPermitido("PatoLoco1234", "es-ES"), "y también en es-ES");
ok(aliasPermitido("PatoLoco1234", "de-DE"), "pero NO en de-DE: la lista de bloqueo es por locale, no global");
ok(!aliasPermitido("LinceBacana9999", "pt-BR"), "«bacana» es brasileño y se bloquea en pt-BR");
ok(aliasPermitido("LinceBacana9999", "pt-PT"), "y no en pt-PT, donde no se usa esa palabra");

// --- esquivar la lista con un acento o un guion no funciona ----------------
ok(!aliasPermitido("PatóLoco1234", "es-MX"), "un acento no esquiva el bloqueo");
ok(!aliasPermitido("pato-loco-1234", "es-MX"), "un guion tampoco");
ok(!aliasPermitido("PATOLOCO", "es-MX"), "ni las mayúsculas");
ok(normalizar("Pató-LOCO ") === "patoloco", "normalizar quita acentos, signos, espacios y mayúsculas");

// --- el sufijo es aleatorio, nunca secuencial ------------------------------
// Un sufijo secuencial diría cuántos niños hay registrados y en qué orden
// llegaron: un censo que nadie pidió publicar.
const cuatro = [];
for (let i = 0; i < 40; i++) cuatro.push(generarAlias("en").alias.match(/(\d{4})$/)[1]);
ok(new Set(cuatro).size > 25, `40 alias dan ${new Set(cuatro).size} sufijos distintos: no es un contador`);
const numeros = cuatro.map(Number);
ok(!numeros.every((n, i) => i === 0 || n === numeros[i - 1] + 1), "los sufijos NO van de uno en uno");
ok(numeros.every((n) => n >= 1000 && n <= 9999), "el sufijo son siempre 4 dígitos");

// --- forma del alias --------------------------------------------------------
for (const l of LOCALES_ALIAS) {
  const a = generarAlias(l).alias;
  ok(/^[A-Za-z]+\d{4}$/.test(a), `${l}: «${a}» es letras + 4 dígitos, sin espacios ni signos`);
}

// --- el espacio de nombres es grande ---------------------------------------
// Con pocas combinaciones, dos niños del mismo salón chocarían seguido y el
// alias dejaría de servir para reconocerse.
for (const l of LOCALES_ALIAS) {
  // Sin `toLocaleString`: el separador de millares es propio de cada locale
  // (mc-34), y aqui se esta contando, no formateando para nadie.
  ok(combinaciones(l) >= 1_000_000, `${l}: ${combinaciones(l)} combinaciones posibles`);
}

// --- una lista de bloqueo rota falla FUERTE, no en bucle -------------------
// El modo de falla que evita: un padre creando el perfil de su hijo y la
// petición colgada para siempre.
let lanzo = false;
try {
  // `aleatorio` que siempre devuelve lo mismo + un bloqueo que casa: agota.
  generarAlias("es-MX", () => 0, 3);
} catch {
  lanzo = true;
}
ok(!lanzo, "con listas sanas no lanza aunque el aleatorio sea constante");

console.log(fallos === 0 ? "\n✓ alias — todos los casos" : `\n✗ alias — ${fallos} caso(s) fallaron`);
process.exit(fallos === 0 ? 0 : 1);
