#!/usr/bin/env node
// Auditor determinista — el camino EN VIVO de Larry
//
// Hace cumplir: líneas rojas #2 y #7, D-004 (punto 2, enmendado por D-035),
// D-015, D-035, y el criterio #136 de F6.
//
// ─── Por qué hace falta un auditor NUEVO y no basta el que ya hay ──────────
//
// `larry-nunca-calcula.mjs` termina diciéndolo él mismo, en su propia lista de
// «lo que no comprueba»: *«el camino EN VIVO de Larry (D-035), que todavía no
// existe. Cuando exista, su compuerta de salida es otra cosa y va en otro
// auditor.»* Éste es ese auditor.
//
// La diferencia es de naturaleza, no de alcance. El camino pregenerado no puede
// calcular porque **no tiene con qué**: es una función pura sobre un sobre sin
// números. El camino en vivo tiene un modelo dentro, y un modelo sí puede
// escribir una cifra que nadie le dio. Así que aquí hay dos frentes en vez de
// uno: que **no entre** lo que permitiría calcular, y que **no salga** lo que se
// haya calculado igual.
//
// ─── Las siete cosas que comprueba ─────────────────────────────────────────
//
//  1. **Una sola puerta al sobre.** `en-vivo.ts` tiene que importar
//     `sellarSobre` del motor y NO puede construir un `SobreParaLarry` a mano.
//     Dos listas blancas se desincronizan, y la que se desincronizara sería la
//     que va al modelo.
//  2. **`SobreEnVivo` tiene exactamente dos propiedades.** Un campo suelto al
//     lado del sobre es un campo que se saltó el sellado.
//  3. **Ningún campo prohibido**, ni en el tipo ni en el compositor del mensaje.
//     La misma lista que `larry-nunca-calcula`, leída del mismo sitio.
//  4. **Ni una operación aritmética** en el módulo que compone el prompt.
//  5. **La compuerta de salida existe y se usa.** Un `juzgarSalida` escrito y no
//     llamado es el bug de `funcion-sin-llamar`: la regla parece viva porque
//     tiene una prueba.
//  6. **Todo camino de vuelta del endpoint lleva la pregenerada.** No hay
//     respuesta sin explicación, no hay 500 y no hay hueco.
//  7. **Nada del niño viaja en la metadata del gateway.** Ni el id, ni el alias,
//     ni la edad, ni la elección. Solo `pd`, que es un HMAC que rota cada día.
//
// LO QUE NO PUEDE COMPROBAR — y hay que decirlo, porque es el hueco grande:
//
//  · **Las palabras-número.** «Vier minus eins ist fünf» no lleva un solo dígito
//    y pasa la compuerta estructural entera. El plan §3.4 ya lo nombra, y es
//    peor justo donde más cuesta: en alemán el veintiuno es una palabra
//    invertida y en francés el noventa son tres. Cerrarlo pide un léxico de
//    palabras-número AUTORADO por los siete locales, que es contenido y no
//    código.
//  · **Matemática falsa.** Ninguna de las compuertas la atrapa, y el plan §2.5
//    lo dice de frente. Aquí se acota de otra manera: como el sobre no lleva
//    cantidades, una cuenta falsa necesita cifras inventadas, y ésas sí se
//    descartan. Queda el hueco de las palabras.
//  · **Que el modelo obedezca.** Esto mira código, no salidas. Lo que mira
//    salidas es `larry-nunca-averguenza`, que ahora ejerce también la compuerta
//    en vivo, y la carta adversarial `anti-humillacion`.

import { archivos, leer, existe, informar, sinComentarios } from "./lib/repo.mjs";

const MODULO = "packages/tutor/src/en-vivo.ts";
const MOTOR = "packages/motor/src/explicacion.ts";
const ENDPOINT = "apps/web/src/pages/api/larry.ts";

/**
 * Lo que jamás puede acercarse al prompt. Misma lista y mismas razones que
 * `larry-nunca-calcula.mjs` — se repite aquí porque los dos auditores tienen que
 * poder correr sueltos, y se comprueba abajo que no haya divergido.
 */
const PROHIBIDOS = [
  ["vars", "son los operandos. Sin operandos no hay aritmética que hacer"],
  ["enunciado", "trae `vars` dentro: los operandos por la puerta de al lado"],
  ["operandos", "el nombre directo de lo mismo"],
  ["respuesta", "revela la respuesta con el intento abierto — «telling@k», mc-11 §8"],
  ["eleccion", "la `causa` ya nombra el error; el número que tocó el niño es un número que operar"],
  ["errores", "nombraría errores que el niño NO cometió (mc-11 §5, Shute)"],
  ["rtMs", "el cronómetro por la puerta de atrás (D-024/D-045)"],
  ["puntos", "mueve el feedback al nivel «yo» (Kluger & DeNisi)"],
  ["racha", "igual, y además invita a contar fallas en voz alta"],
  ["intentos", "contar los intentos es contar las fallas"],
  ["historial", "lo mismo, con más resolución"],
  ["childProfileId", "línea roja #2 y D-037"],
  ["alias", "el alias del niño es un dato del niño (línea roja #2, D-013)"],
  ["etiqueta", "la ETIQUETA de la habilidad es «descomponer (5 = 2+3)». Viaja la clave"],
];

const ARITMETICA = [
  [/\bMath\s*\./, "una llamada a `Math.`"],
  [/\b(parseInt|parseFloat|BigInt|Number)\s*\(/, "una conversión numérica"],
  [/[\w)\]]\s*\*\s*[\w([]/, "una multiplicación"],
  [/[\w)\]]\s*%\s*[\w([]/, "un módulo"],
  [/[\w)\]]\s*-\s*[\w([]/, "una resta"],
  [/[\w)\]]\s*\+\s*[\w([]/, "una suma"],
  [/\+\+|--/, "un incremento"],
];

function soloCodigo(texto) {
  return sinComentarios(texto)
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, '""')
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

const problemas = [];
const notas = [];
let revisados = 0;

// --- 0. Las dos piezas existen. Fallar CERRADO -----------------------------
//
// Un escáner que no encuentra su archivo aprueba siempre. Si el módulo se
// renombra, este auditor no puede seguir saliendo en verde sobre un producto
// donde la regla ya no la hace cumplir nadie.
const fuente = existe(MODULO) ? leer(MODULO) : null;
const endpoint = existe(ENDPOINT) ? leer(ENDPOINT) : null;

if (!fuente) {
  problemas.push(
    `no existe \`${MODULO}\`. Es donde vive el sobre del camino en vivo y su compuerta de salida; ` +
      "sin él este auditor no comprueba nada y la línea roja #7 queda dependiendo del prompt.",
  );
}
if (!endpoint) {
  problemas.push(
    `no existe \`${ENDPOINT}\`. Es el único sitio desde el que se llama al modelo; sin él, la ` +
      "compuerta y el tope de gasto son código que nadie ejecuta.",
  );
}

if (fuente) {
  revisados++;
  const codigo = soloCodigo(fuente);

  // --- 1. Una sola puerta al sobre -----------------------------------------
  // La ruta del import se busca en el archivo CRUDO: `soloCodigo` borra las
  // cadenas para poder mirar aritmética sin marcar la prosa, y una ruta de
  // import es una cadena.
  if (!/from\s+["'][^"']*explicacion\.ts["']/.test(sinComentarios(fuente)) || !/\bsellarSobre\b/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` no importa \`sellarSobre\` de \`${MOTOR}\`. El camino en vivo tiene que usar ` +
        "EL MISMO sellado que el pregenerado: dos listas blancas se desincronizan, y la que se " +
        "desincronizara sería justo la que va al modelo (línea roja #7).",
    );
  }
  // Construir el sobre a mano sería abrir una segunda puerta. Se busca un objeto
  // literal con los campos del sobre en vez del anidamiento.
  if (/\bacc\s*:\s*(?!.*sellarSobre)/.test(codigo) && /interface\s+SobreEnVivo[\s\S]*?\bacc\b/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` declara \`acc\` dentro de \`SobreEnVivo\`. El sobre en vivo CONTIENE el sobre ` +
        "sellado, no lo copia: copiarlo campo por campo es la segunda lista blanca que esta " +
        "estructura existe para no tener.",
    );
  }
  if (/\bItem\b/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` nombra el tipo \`Item\`. El camino en vivo recibe un veredicto ya calculado, ` +
        "no el ítem del que salió — es la misma regla que `larry-sin-item` pone sobre el paquete.",
    );
  }

  // --- 2. `SobreEnVivo` tiene exactamente dos propiedades ------------------
  const interfaz = codigo.match(/interface\s+SobreEnVivo\s*\{([\s\S]*?)\n\}/);
  if (!interfaz) {
    problemas.push("no encuentro la interfaz `SobreEnVivo`. Es la frontera del camino en vivo.");
  } else {
    const campos = [...interfaz[1].matchAll(/(^|\n)\s*(\w+)\s*\??\s*:/g)].map((m) => m[2]);
    if (campos.sort().join(",") !== "disparador,sobre") {
      problemas.push(
        `\`SobreEnVivo\` declara [${campos.join(", ")}] y tiene que declarar exactamente ` +
          "`sobre` y `disparador`. Un campo suelto al lado del sobre es un campo que se saltó " +
          "`sellarSobre()` — y la lista blanca solo sirve si todo pasa por ella.",
      );
    }
  }

  // --- 3. Ningún campo prohibido -------------------------------------------
  for (const [campo, porQue] of PROHIBIDOS) {
    if (new RegExp(`(^|\\n)\\s*${campo}\\s*\\??\\s*:`, "i").test(codigo)) {
      problemas.push(
        `\`${MODULO}\` declara un campo \`${campo}\`. ${porQue}. El camino en vivo recibe lo mismo ` +
          "que el pregenerado, ni un campo más: si necesitara más, la línea roja #7 sería una " +
          "preferencia y no una imposibilidad.",
      );
    }
  }

  // --- 4. Ni una operación aritmética --------------------------------------
  for (const [re, que] of ARITMETICA) {
    const m = codigo.match(re);
    if (m) {
      const linea = codigo.slice(0, m.index).split("\n").length;
      problemas.push(
        `\`${MODULO}\` hace aritmética: ${que} («${m[0].trim()}», línea ~${linea} del código sin ` +
          "comentarios). El módulo que compone el prompt no calcula, igual que no calcula el que " +
          "compone la explicación pregenerada. La aritmética del tope vive en `gasto.ts`, aparte.",
      );
    }
  }

  // --- 5. La compuerta existe, y prohíbe lo que dice prohibir --------------
  if (!/export function juzgarSalida/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` no exporta \`juzgarSalida\`. Sin compuerta de salida, lo único que separa a un ` +
        "niño de una cifra inventada es una frase del prompt — y un prompt es una petición.",
    );
  }
  if (!/\\d/.test(fuente) || !/compuerta:\s*"estructural"/.test(fuente)) {
    problemas.push(
      "la compuerta estructural no busca dígitos. El sobre del camino en vivo no lleva ni un " +
        "numeral, así que cualquiera que aparezca en la salida lo inventó el modelo (línea roja #7).",
    );
  }
  if (!/compuerta:\s*"lexica"/.test(fuente)) {
    problemas.push(
      "no hay compuerta léxica. La carta anti-vergüenza tiene que aplicarse también a lo que el " +
        "modelo acaba de escribir, no solo al texto que alguien revisó (línea roja #7).",
    );
  }
  // El léxico tiene que ser EL MISMO, no una copia.
  if (!/lexico/i.test(codigo)) {
    problemas.push(
      "la compuerta léxica no recibe ningún léxico. Si tuviera el suyo propio, habría dos listas " +
        "y la del camino en vivo sería la que envejece — que es justo la del texto que nadie revisó.",
    );
  }
}

// --- 6. Todo camino de vuelta del endpoint lleva la pregenerada ------------
if (endpoint) {
  revisados++;
  const codigo = sinComentarios(endpoint);

  if (!/\bsellarEnVivo\s*\(/.test(codigo)) {
    problemas.push(
      `${ENDPOINT} no sella el sobre con \`sellarEnVivo\`. Lo que llega del Worker de ingesta por ` +
        "RPC puede crecer, y sin sellar viajaría entero hasta el prompt.",
    );
  }
  if (!/\bexplicarEnLocale\s*\(/.test(codigo) || !/\bsellarSobre\s*\(/.test(codigo)) {
    problemas.push(
      `${ENDPOINT} no compone la explicación PREGENERADA. Es el respaldo de todo este endpoint: sin ` +
        "ella, un fallo del modelo deja un hueco donde tenía que haber una explicación revisada por " +
        "humano (D-004 punto 1).",
    );
  }
  if (!/\bjuzgarSalida\s*\(/.test(codigo)) {
    problemas.push(
      `${ENDPOINT} no llama a \`juzgarSalida\`. Una compuerta escrita y no llamada es el bug de ` +
        "`funcion-sin-llamar`: parece viva porque tiene prueba, y no la ejecuta nadie.",
    );
  }

  // Cada `return json(...)` del camino en vivo tiene que llevar `explicacion`.
  // La excepción son las validaciones de entrada, que responden 4xx antes de
  // que exista veredicto — ahí no hay nada que explicar todavía.
  const retornos = [...codigo.matchAll(/return json\(\{([\s\S]*?)\}\s*(?:,\s*(\d{3}))?\s*\)/g)];
  for (const r of retornos) {
    const cuerpo = r[1];
    const status = r[2] ? Number(r[2]) : 200;
    if (status >= 400) continue;
    if (!/\bexplicacion\b/.test(cuerpo)) {
      problemas.push(
        `${ENDPOINT} tiene una respuesta de éxito sin \`explicacion\`: «${cuerpo.trim().slice(0, 70)}». ` +
          "Este endpoint no puede devolver un hueco: cuando el modelo falla, se sirve la explicación " +
          "pregenerada, sin aviso, sin error y sin disculpa (plan §2.5).",
      );
    }
  }
  if (retornos.length === 0) {
    problemas.push(`${ENDPOINT} no tiene ninguna respuesta que este auditor sepa leer — ¿cambió la forma?`);
  }

  // Un 5xx **antes** de que la explicación pregenerada esté compuesta es
  // honesto: todavía no hay nada que servir, y es el mismo guardia que
  // `/api/jugar` pone cuando falta la ingesta. Un 5xx **después** tira a la
  // basura una explicación que ya existe, y eso es lo que este endpoint no puede
  // hacer.
  //
  // El ancla es la COMPOSICIÓN del piso, no la llamada a calificar, y la
  // diferencia importa: el `catch` de la calificación está textualmente después
  // de la llamada y aun así ahí no hay veredicto, así que su 503 es correcto.
  // Con el ancla en la llamada este auditor marcaba ese caso legítimo — pasó de
  // verdad, escribiéndolo.
  const dondeCompone = codigo.indexOf("explicarEnLocale(");
  for (const m of codigo.matchAll(/return json\([\s\S]{0,120}?\},\s*5\d{2}\s*\)/g)) {
    if (dondeCompone >= 0 && m.index > dondeCompone) {
      problemas.push(
        `${ENDPOINT} devuelve un 5xx con la explicación pregenerada YA compuesta: «${m[0].slice(0, 60)}». En ese ` +
          "punto la explicación pregenerada ya está compuesta, así que un error es una explicación " +
          "que se tira. Cuando algo va mal se sirve el piso, con 200 (plan §2.5).",
      );
    }
  }

  // --- 7. Nada del niño en la metadata del gateway -------------------------
  const meta = codigo.match(/metadata:\s*\{([^}]*)\}/);
  if (meta) {
    // Las CLAVES, no los valores: en `{ banda: tema }` la clave es `banda` y
    // `tema` es la variable de la que sale. Un barrido de identificadores contaba
    // los dos y habría aprobado `{ banda: childProfileId }`.
    const claves = meta[1]
      .split(",")
      .map((p) => p.split(":")[0].trim())
      .filter(Boolean);
    const permitidas = ["pd", "banda", "locale", "tema"];
    for (const clave of claves) {
      if (!permitidas.includes(clave)) {
        problemas.push(
          `${ENDPOINT} manda \`${clave}\` en la metadata del AI Gateway. Solo pueden ir ${permitidas.join(", ")}: ` +
            "`pd` es un HMAC con sal secreta que rota cada día, y cualquier otra cosa es un dato de " +
            "un menor en una cabecera HTTP hacia un proveedor de inferencia (línea roja #2, mc-25).",
        );
      }
    }
    notas.push(`metadata del gateway: ${claves.join(", ")}`);
  }

  // La llave de caché del prefijo jamás por perfil: cada niño pagaría el prefijo
  // frío en su PRIMERA explicación, que es el peor momento posible.
  if (/cacheKey:\s*[^,\n]*(?:pd|profileId|childProfile)/.test(codigo)) {
    problemas.push(
      `${ENDPOINT} usa el perfil en la llave de caché del prefijo. La llave es \`larry|<locale>|<banda>\`: ` +
        "por perfil serían catorce mil llaves frías en vez de catorce, y además metería al menor en " +
        "una cabecera (plan §3.7).",
    );
  }
}

// --- 8. Las dos listas de campos prohibidos no divergieron -----------------
//
// Este auditor y `larry-nunca-calcula` tienen cada uno su copia, para poder
// correr sueltos. Dos copias que se separan producen exactamente el agujero que
// las dos existen para tapar, así que se comprueba que la de allá esté contenida
// en la de aquí.
{
  const otro = leer("audits/larry-nunca-calcula.mjs");
  if (otro) {
    revisados++;
    const suyos = [...otro.matchAll(/\n\s*\["(\w+)",/g)].map((m) => m[1]);
    const mios = new Set(PROHIBIDOS.map(([c]) => c));
    const faltan = suyos.filter((c) => !mios.has(c));
    if (faltan.length > 0) {
      problemas.push(
        `\`larry-nunca-calcula\` prohíbe campos que este auditor no: ${faltan.join(", ")}. Las dos ` +
          "listas tienen que cubrir lo mismo o el camino en vivo acepta lo que el pregenerado rechaza.",
      );
    }
  }
}

// --- 9. Alguien llama al camino en vivo desde producto ---------------------
const llamadores = archivos(/\.(ts|tsx|astro|mjs)$/).filter((f) => {
  if (f === MODULO) return false;
  const t = leer(f) ?? "";
  return /\b(sellarEnVivo|juzgarSalida)\s*\(/.test(sinComentarios(t));
});
const deProducto = llamadores.filter((f) => !/\.prueba\.mjs$/.test(f));
if (deProducto.length === 0) {
  problemas.push(
    "nadie llama al camino en vivo desde código de producto — solo su prueba, o nadie. Es el bug de " +
      "`funcion-sin-llamar`: `marcarDispositivoDelHogar` estaba escrita, probada y sin un solo " +
      "llamador, y el motor adaptativo entero era inalcanzable desde una cuenta real.",
  );
}

if (revisados > 0) {
  notas.push(`${PROHIBIDOS.length} campos prohibidos · ${ARITMETICA.length} formas de aritmética buscadas`);
  notas.push(`${deProducto.length} llamador(es) de producto`);
}

informar({
  nombre: "larry-en-vivo",
  problemas,
  notas,
  cita: "líneas rojas #2 y #7, D-004 (punto 2), D-015, D-035, criterio #136 de F6",
  revisados,
  resumen: `${MODULO} + ${ENDPOINT} + ${llamadores.length} llamador(es)`,
  porQueBloquea:
    "el camino pregenerado no puede calcular porque no tiene con qué; el camino en vivo tiene un " +
    "modelo dentro, y un modelo sí puede escribir una cifra que nadie le dio. Lo que impide que " +
    "llegue a un niño son la lista blanca de entrada y la compuerta de salida, y las dos son código " +
    "que alguien puede quitar sin que nada más se rompa.",
  noComprueba: [
    "las palabras-número. «Vier minus eins ist fünf» no lleva un solo dígito y pasa la compuerta " +
      "estructural entera. Cerrarlo pide un léxico de palabras-número AUTORADO por los siete " +
      "locales, que es contenido y no código (plan §3.4).",
    "que la explicación en vivo sea matemáticamente correcta. Ninguna compuerta lo ve, y el plan " +
      "§2.5 lo dice de frente. Lo que sí acota el hueco es que el sobre no lleve cantidades.",
    "que el modelo obedezca. Esto mira código. Lo que mira salidas es `larry-nunca-averguenza`, " +
      "que ahora ejerce también la compuerta en vivo, y la carta adversarial `anti-humillacion`.",
  ],
});
