#!/usr/bin/env node
// Auditor determinista — Larry nunca calcula
//
// Hace cumplir: línea roja #7, D-004 (punto 1), D-074, criterio #132 de F6.
//
// ─── La regla, y por qué no basta con escribirla ───────────────────────────
//
// *«Larry nunca avergüenza a un niño por equivocarse, y nunca calcula: recibe el
// veredicto ya calculado y solo lo explica.»*
//
// El precedente con archivo y línea es `src/larry/contador/explain.ts:67-75` en
// IOS (`mc-37`): *«Every number MUST appear verbatim in the provided JSON. Never
// compute, convert, round, or invent a figure»*, a temperatura 0. Eso es una
// regla escrita **en un prompt**, y un prompt es una petición: si el modelo la
// desatiende, nadie se entera hasta que un niño lee una explicación con una
// suma inventada.
//
// Aquí la regla se hace cumplir de otra manera, que es la que este auditor
// vigila: **el camino de explicación no puede calcular porque nunca recibe con
// qué**. No hay operandos en el sobre, no hay respuesta correcta, no hay
// elección del niño. Quitarle la aritmética a algo que no tiene números no es
// una promesa, es una imposibilidad — mientras nadie amplíe la lista blanca.
//
// ─── Las cuatro cosas que comprueba ────────────────────────────────────────
//
//  1. **La lista blanca no crece.** `CAMPOS_DEL_SOBRE` es una lista escrita a
//     mano, y ni ella ni la interfaz `SobreParaLarry` pueden nombrar un
//     operando, la respuesta, la elección, el tiempo, el puntaje o el id del
//     niño. Un `Omit<Item, …>` haría que un campo nuevo del ítem viajara solo.
//  2. **El módulo no conoce el ítem.** Ni lo importa, ni nombra su tipo. Es el
//     patrón de `puntuacion.ts:37` — dejar KINDER fuera de `PARAMETROS` hizo que
//     el bug de `a = 0` no se pueda volver a escribir.
//  3. **No hay aritmética en ningún camino de explicación.** Ni `Math.`, ni un
//     `*`, ni un `-` entre dos identificadores. Se mira el código sin
//     comentarios y sin cadenas, porque el archivo EXPLICA la regla y un auditor
//     que castiga documentar su propia regla se acaba anulando por costumbre.
//  4. **Nadie llama a la composición sin sellar el sobre.** Un llamador que
//     construya el sobre a mano se salta la lista blanca entera.
//
// LO QUE NO PUEDE COMPROBAR: que la explicación sea matemáticamente correcta.
// No lo comprueba nadie y no puede — no hay matemática que comprobar, porque no
// hay ningún número. Ese es justamente el diseño: `mc-11` [13] documenta la
// cadena de razonamiento fluida pero equivocada como un modo de falla distinto
// de revelar la respuesta, y la única defensa robusta es no tener con qué.

import { archivos, leer, existe, informar, sinComentarios } from "./lib/repo.mjs";

const MODULO = "packages/motor/src/explicacion.ts";

/**
 * Lo que jamás puede entrar al sobre. Cada uno con su razón, porque una lista de
 * nombres sin razón es una lista que alguien amplía sin pensar.
 */
const PROHIBIDOS = [
  ["vars", "son los operandos. Sin operandos no hay aritmética que hacer"],
  ["enunciado", "trae `vars` dentro: los operandos por la puerta de al lado"],
  ["operandos", "el nombre directo de lo mismo"],
  ["respuesta", "revela la respuesta con el intento abierto — «telling@k», mc-11 §8"],
  ["eleccion", "la `causa` ya nombra el error; el número que tocó el niño es un número que operar"],
  ["errores", "nombraría errores que el niño NO cometió. mc-11 §5 (Shute): el exceso de elaboración satura"],
  ["rtMs", "el cronómetro por la puerta de atrás. D-024/D-045: en kinder el tiempo no se ve, no se oye y no cuesta puntos"],
  ["puntos", "mueve el feedback al nivel «yo» — el tercio de intervenciones que Kluger & DeNisi midió EMPEORANDO el desempeño"],
  ["racha", "igual, y además invita a contar fallas en voz alta"],
  ["intentos", "contar los intentos es contar las fallas"],
  ["historial", "lo mismo, con más resolución"],
  ["childProfileId", "línea roja #2 y D-037"],
  ["etiqueta", "la ETIQUETA de la habilidad es «descomponer (5 = 2+3)»: tres operandos y una igualdad. Viaja la clave"],
];

/**
 * Aritmética, buscada sobre el código sin comentarios ni cadenas.
 *
 * `+` incluido: tras quitar las cadenas, un `+` que quede solo puede estar
 * sumando. La concatenación de texto de este módulo se hace con `join` y con
 * plantillas, que se eliminan enteras antes de mirar.
 */
const ARITMETICA = [
  [/\bMath\s*\./, "una llamada a `Math.`"],
  [/\b(parseInt|parseFloat|BigInt|Number)\s*\(/, "una conversión numérica"],
  [/[\w)\]]\s*\*\s*[\w([]/, "una multiplicación"],
  [/[\w)\]]\s*%\s*[\w([]/, "un módulo"],
  [/[\w)\]]\s*\/\s*[\w([]/, "una división"],
  [/[\w)\]]\s*-\s*[\w([]/, "una resta"],
  [/[\w)\]]\s*\+\s*[\w([]/, "una suma"],
  [/\+\+|--/, "un incremento"],
];

/**
 * Quita comentarios, cadenas y plantillas. Lo que queda es código de verdad.
 *
 * Es la lección que este repo ya pagó cuatro veces: `sin-penalizacion` marcó una
 * cadena de prosa que DESCRIBE la regla, y `turnstile-solo-adulto` se marcó a sí
 * mismo. Este archivo y el módulo que vigila están llenos de la palabra
 * «operandos» y del signo `+` dentro de citas — todas escritas para explicar por
 * qué eso no se hace.
 */
function soloCodigo(texto) {
  return sinComentarios(texto)
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/'(?:\\.|[^'\\\n])*'/g, '""')
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""');
}

const problemas = [];
const notas = [];
let revisados = 0;

// --- 0. El módulo tiene que existir. Fallar CERRADO. ------------------------
//
// Si alguien lo renombra, este auditor se quedaría sin nada que mirar y saldría
// en verde sobre un producto en el que la regla ya no se hace cumplir en
// ninguna parte. Un escáner que no ve nada aprueba siempre.
const fuente = existe(MODULO) ? leer(MODULO) : null;
if (!fuente) {
  problemas.push(
    `no existe \`${MODULO}\`. Es el único sitio donde vive la lista blanca del sobre; ` +
      "sin él este auditor no comprueba nada y la línea roja #7 no la hace cumplir nadie.",
  );
} else {
  revisados++;
  const codigo = soloCodigo(fuente);

  // --- 1. La lista blanca, y la interfaz ------------------------------------
  const listaBlanca = codigo.match(/CAMPOS_DEL_SOBRE\s*=\s*\[([\s\S]*?)\]/);
  const interfaz = codigo.match(/interface\s+SobreParaLarry\s*\{([\s\S]*?)\n\}/);

  if (!listaBlanca) {
    problemas.push(
      "no encuentro `CAMPOS_DEL_SOBRE` en el módulo. La lista blanca es lo que impide que un " +
        "campo nuevo del ítem viaje solo hasta Larry; si desapareció, desapareció la frontera.",
    );
  }
  if (!interfaz) {
    problemas.push("no encuentro la interfaz `SobreParaLarry`. Es la otra mitad de la frontera.");
  }

  // Las cadenas se borraron para mirar el código, así que la lista blanca se
  // vuelve a leer del archivo crudo — pero SOLO ese bloque, no el archivo.
  const listaCruda = fuente.match(/CAMPOS_DEL_SOBRE\s*=\s*\[([\s\S]*?)\]/);
  const declarados = listaCruda ? [...listaCruda[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];

  for (const [campo, porQue] of PROHIBIDOS) {
    const enLista = declarados.some((d) => d.toLowerCase() === campo.toLowerCase());
    const enInterfaz = interfaz
      ? new RegExp(`(^|\\n)\\s*${campo}\\s*\\??\\s*:`, "i").test(interfaz[1])
      : false;
    if (enLista || enInterfaz) {
      problemas.push(
        `el sobre de Larry tiene un campo \`${campo}\` (${enLista ? "en CAMPOS_DEL_SOBRE" : "en la interfaz"}). ` +
          `${porQue}. Línea roja #7: Larry recibe el veredicto ya calculado, no lo que haría falta para calcularlo.`,
      );
    }
  }

  // --- 2. El módulo no conoce el ítem --------------------------------------
  if (/from\s+["'][^"']*item\.ts["']/.test(codigo) || /from\s+["'][^"']*banco-kinder\.ts["']/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` importa el ítem o el banco. Si puede nombrar \`Item\`, alguien puede leer ` +
        "`item.enunciado.vars`, y entonces la regla vuelve a depender de que nadie lo haga.",
    );
  }
  if (/\bItem\b/.test(codigo)) {
    problemas.push(
      `\`${MODULO}\` nombra el tipo \`Item\`. El módulo de explicación no debe poder mencionarlo: ` +
        "recibe un veredicto ya calculado, no el ítem del que salió.",
    );
  }

  // --- 3. Ni una operación aritmética --------------------------------------
  for (const [re, que] of ARITMETICA) {
    const m = codigo.match(re);
    if (m) {
      const linea = codigo.slice(0, m.index).split("\n").length;
      problemas.push(
        `\`${MODULO}\` hace aritmética: ${que} («${m[0].trim()}», línea ~${linea} del código sin ` +
          "comentarios). Larry NUNCA calcula (línea roja #7, `contador/explain.ts:67-75`): recibe el " +
          "veredicto ya resuelto y solo elige palabras.",
      );
    }
  }
}

// --- 4. Nadie compone sin sellar -------------------------------------------
//
// La lista blanca solo sirve si todo el mundo pasa por ella. Un llamador que
// arme el objeto a mano puede meter lo que quiera, y el tipo de TypeScript no lo
// impide en tiempo de ejecución: el veredicto llega de un Worker por RPC.
const llamadores = archivos(/\.(ts|tsx|astro|mjs)$/).filter((f) => {
  const t = leer(f) ?? "";
  return /\b(componerExplicacion|explicarEnLocale)\s*\(/.test(sinComentarios(t));
});

for (const f of llamadores) {
  revisados++;
  const t = sinComentarios(leer(f) ?? "");
  // El propio módulo se exceptúa: es donde `explicarEnLocale` llama a
  // `componerExplicacion`, y sellar dos veces no añade nada.
  if (f === MODULO) continue;
  if (!/\bsellarSobre\s*\(/.test(t)) {
    problemas.push(
      `${f} compone una explicación sin sellar el sobre. \`sellarSobre()\` es lo único que ` +
        "copia campo por campo; sin él, lo que llegue del Worker de ingesta viaja entero — " +
        "incluidos los campos que ese Worker añada mañana y que nadie decidió mandar a Larry.",
    );
  }
}

// Y un llamador de PRODUCTO, no solo su prueba.
//
// «Una prueba unitaria llama a la función: es el único llamador que tiene, y eso
// es exactamente lo que la hace parecer viva.» Es literal el encabezado de
// `funcion-sin-llamar.mjs`, y el bug que lo motivó —`marcarDispositivoDelHogar`
// escrita, probada y sin llamador— dejó el motor adaptativo entero inalcanzable
// desde una cuenta real. La explicación pregenerada es el punto 1 de D-004 y el
// camino del 95% de las veces: escrita y sin llamador, la pantalla sigue
// sirviendo «esta vez no».
const deProducto = llamadores.filter((f) => f !== MODULO && !/\.prueba\.mjs$/.test(f));
if (deProducto.length === 0) {
  problemas.push(
    "nadie llama a `componerExplicacion` ni a `explicarEnLocale` desde código de producto — " +
      "solo su propia prueba, o nadie. La causa nombrada seguiría muriendo en el servidor y la " +
      "pantalla seguiría sirviendo un marcador desnudo.",
  );
}

if (revisados > 0) {
  notas.push(`${deProducto.length} llamador(es) de producto, todos sobre sobre sellado`);
  notas.push(`${PROHIBIDOS.length} campos prohibidos en el sobre · ${ARITMETICA.length} formas de aritmética buscadas`);
}

informar({
  nombre: "larry-nunca-calcula",
  problemas,
  notas,
  cita: "línea roja #7, D-004, D-074, mc-37 (`contador/explain.ts:67-75`), criterio #132 de F6",
  revisados,
  resumen: `${MODULO} + ${llamadores.length} llamador(es)`,
  porQueBloquea:
    "una explicación que recalcula es una explicación que puede enseñar matemática incorrecta, y " +
    "el niño no tiene cómo saber cuál de las dos creer (mc-37 §3).",
  noComprueba: [
    "que la explicación sea matemáticamente correcta. No hay matemática que comprobar porque no " +
      "hay ningún número: ese ES el diseño, no un hueco.",
    "el camino EN VIVO de Larry (D-035), que todavía no existe. Cuando exista, su compuerta de " +
      "salida es otra cosa y va en otro auditor.",
  ],
});
