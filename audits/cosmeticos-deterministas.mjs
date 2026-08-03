#!/usr/bin/env node
// Auditor determinista — un cosmético se gana, nunca se compra y nunca se sortea
//
// Hace cumplir: línea roja #5, D-014, #252, #256.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-014 pone «cosméticos ganados (deterministas)» en la columna del SÍ y
// «moneda comprable» y «recompensas aleatorias de pago» en la del NO. Las dos
// prohibiciones se rompen igual: sin mala intención y en una línea.
//
//   · El precio llega como una columna «por si acaso» en la migración del
//     catálogo. Nadie la cobra el primer año. Existe, y el día que exista un
//     plan de pago ya está el hueco hecho.
//   · El azar llega como un desempate «que da igual» — dos cosméticos elegibles
//     y uno que se sortea— o como una «sorpresa» de producto. `mc-17` §7 es
//     explícito en que el radio de la historia de las cajas de botín alcanza a
//     lo gratuito y a lo cosmético:
//
//       «any future "mystery reward" or "surprise box" mechanic — even
//        cosmetic, even free — sits in the blast radius of this regulatory
//        history if it uses randomization to drive engagement»
//
//     Bélgica y Países Bajos las declararon juego ilegal en 2018.
//
// ─── Cómo comprueba, y por qué de dos formas ──────────────────────────────
//
// D-070: una comprobación que el código vigilado satisface por construcción es
// decorativa. Por eso hay dos ejes independientes.
//
//   · ESTÁTICO — lee los archivos: columnas de precio, llamadas a un generador
//     de azar, tipos de evento fuera del enum, cosméticos sin camino de
//     obtención.
//   · DINÁMICO — **ejecuta** `cosmeticosQueDesbloquea()` con las mismas reglas
//     barajadas de 32 formas distintas y exige el mismo arreglo las 32 veces. Un
//     `Math.random()` escondido detrás de un `eval`, un `Set` iterado por orden
//     de inserción o un desempate por `Date.now()` no se ven en un grep y sí se
//     ven aquí.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si el ARTE de un cosmético es bueno, o si su condición es alcanzable en la
//    práctica. Eso es contenido y lo revisa una persona (mc-40).
//  · Si un cosmético se anuncia con lenguaje de escasez en una pantalla. Eso es
//    léxico, y le toca a la flota adversarial.
//  · Si el catálogo todavía no existe, no hay filas que cruzar. Lo dice en voz
//    alta en vez de aprobar en silencio.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";
import { TIPOS_DE_EVENTO, cosmeticosQueDesbloquea } from "../packages/motor/src/cosmeticos.ts";

const MODULO = "packages/motor/src/cosmeticos.ts";

// `alias.ts` genera el apodo público de un niño eligiendo palabras al azar de
// una lista. Ese azar es de SELECCIÓN DE PALABRA, no de otorgamiento de un
// logro ya ganado, y por eso está exceptuado por escrito (criterio de #256) en
// vez de estar exceptuado por accidente.
const AZAR_PERMITIDO = new Set(["packages/motor/src/alias.ts"]);

const AZAR = /(Math\s*\.\s*random|crypto\s*\.\s*getRandomValues|getRandomValues\s*\()/;
const PRECIO = palabra(
  "price", "precio", "cost", "costo", "coste", "moneda", "currency",
  "gems", "gemas", "lingots", "coins", "monedas", "amount_cents", "sku",
);
const AZAR_EN_ESQUEMA = palabra("probabilidad", "probability", "rarity", "rareza", "chance", "drop_rate", "weight_random");
const TABLA_COSMETICA = /\b(cosmetic_catalog|cosmetic_unlock_rules|child_cosmetics_unlocked|cosmetic_[a-z_]+|child_cosmetics_[a-z_]+)\b/;

const problemas = [];
const notas = [];

// ─── 1. El módulo existe y no sortea nada ────────────────────────────────────

if (!existe(MODULO)) {
  problemas.push(
    `${MODULO} no existe. Este auditor importa el módulo para ejecutarlo, así que ` +
      "sin él no comprueba nada — y «no comprobé» nunca puede leerse como «está bien».",
  );
}

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => /^(apps|packages|workers)\//.test(f));
let revisados = 0;

for (const archivo of fuentes) {
  const crudo = leer(archivo) ?? "";
  revisados++;
  const texto = sinComentarios(crudo);

  // ¿Este archivo está en el camino que otorga un cosmético?
  const enElCamino =
    archivo === MODULO ||
    /child_cosmetics_unlocked/.test(texto) ||
    (/cosmetic/i.test(texto) && /(INSERT|UPDATE|desbloque|unlock)/i.test(texto));

  if (!enElCamino) continue;

  if (AZAR.test(texto) && !AZAR_PERMITIDO.has(archivo)) {
    const linea = texto.split("\n").findIndex((l) => AZAR.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: hay azar en el camino que otorga un cosmético. ` +
        "Línea roja #5 y D-014: los cosméticos son deterministas, se ganan y nunca se sortean. " +
        "mc-17 §7: una «sorpresa», aunque sea gratis y aunque sea cosmética, cae en el radio " +
        "de las cajas de botín que Bélgica y Países Bajos declararon juego ilegal.",
    );
  }

  if (PRECIO.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => PRECIO.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: aparece vocabulario de precio o de moneda en el camino de un ` +
        "cosmético. D-014 prohíbe «moneda comprable» por nombre; un cosmético que se compra " +
        "deja de ser una recompensa por progreso y pasa a ser una tienda.",
    );
  }
}

// ─── 2. El esquema: ni precio, ni azar, ni tipo de evento fuera del enum ─────

const sql = archivos(/\.sql$/);
const catalogo = new Set();
const conRegla = new Set();
const iniciales = new Set();
let filasVistas = 0;

for (const archivo of sql) {
  const crudo = leer(archivo) ?? "";
  revisados++;
  const texto = sinComentarios(crudo);
  if (!TABLA_COSMETICA.test(texto)) continue;

  // Columnas de una tabla cosmética.
  for (const bloque of texto.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_]+)\s*\(([\s\S]*?)\n\s*\)/gi)) {
    const [, tabla, cuerpo] = bloque;
    if (!TABLA_COSMETICA.test(tabla)) continue;
    for (const renglon of cuerpo.split("\n")) {
      const col = renglon.trim().split(/\s+/)[0]?.replace(/[",`]/g, "") ?? "";
      if (!col || /^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)$/i.test(col)) continue;
      if (PRECIO.test(col)) {
        problemas.push(
          `${archivo}: la tabla \`${tabla}\` tiene la columna \`${col}\`, que nombra un precio, ` +
            "un costo o una moneda. D-014: sin moneda comprable. Una columna de precio que hoy " +
            "nadie cobra es el hueco ya hecho para el día que alguien quiera cobrar.",
        );
      }
      if (AZAR_EN_ESQUEMA.test(col)) {
        problemas.push(
          `${archivo}: la tabla \`${tabla}\` tiene la columna \`${col}\`, que nombra una ` +
            "probabilidad o una rareza. Línea roja #5: cero azar en el otorgamiento.",
        );
      }
    }
  }

  // Los `tipo_evento` que el esquema acepta, contra el enum del módulo.
  for (const m of texto.matchAll(/tipo_evento[^\n]*?IN\s*\(([^)]*)\)/gi)) {
    for (const valor of m[1].split(",")) {
      const v = valor.trim().replace(/^['"]|['"]$/g, "");
      if (v && !TIPOS_DE_EVENTO.includes(v)) {
        problemas.push(
          `${archivo}: el esquema acepta \`tipo_evento = '${v}'\`, que no está en el enum ` +
            `cerrado de ${MODULO} (${TIPOS_DE_EVENTO.join(", ")}). Una regla con ese valor ` +
            "existiría en la base y no se dispararía nunca: un cosmético que nadie puede ganar " +
            "y que nadie sabe que no puede ganar.",
        );
      }
    }
  }

  // Las filas del catálogo y de las reglas, para cruzarlas.
  for (const ins of texto.matchAll(
    /INSERT\s+INTO\s+(cosmetic_catalog|cosmetic_unlock_rules)\s*\(([^)]*)\)\s*VALUES\s*([\s\S]*?);/gi,
  )) {
    const [, tabla, columnas, valores] = ins;
    const cols = columnas.split(",").map((c) => c.trim().replace(/[",`]/g, "").toLowerCase());
    for (const tupla of valores.matchAll(/\(([^()]*)\)/g)) {
      const campos = repartir(tupla[1]);
      if (campos.length !== cols.length) continue;
      const fila = Object.fromEntries(cols.map((c, i) => [c, campos[i]]));
      filasVistas++;
      if (tabla.toLowerCase() === "cosmetic_catalog") {
        const id = limpiar(fila.id ?? fila.cosmetic_id ?? "");
        if (id) catalogo.add(id);
        if (id && String(fila.es_inicial ?? "").trim() === "1") iniciales.add(id);
      } else {
        const id = limpiar(fila.cosmetic_id ?? "");
        if (id) conRegla.add(id);
        const tipo = limpiar(fila.tipo_evento ?? "");
        if (tipo && !TIPOS_DE_EVENTO.includes(tipo)) {
          problemas.push(
            `${archivo}: la regla de \`${id}\` usa \`tipo_evento = '${tipo}'\`, fuera del enum ` +
              `cerrado de ${MODULO}. Nadie agrega un tipo de evento sin tocar ese archivo.`,
          );
        }
      }
    }
  }
}

for (const id of catalogo) {
  if (!iniciales.has(id) && !conRegla.has(id)) {
    problemas.push(
      `el cosmético \`${id}\` no es inicial (\`es_inicial = 1\`) ni tiene una fila en ` +
        "`cosmetic_unlock_rules`: no hay forma de conseguirlo. Un cosmético sin camino de " +
        "obtención es un hueco silencioso, no una reserva — y desde fuera se ve igual que " +
        "una recompensa aleatoria que nunca cae (#256, línea roja #5).",
    );
  }
}

function repartir(tupla) {
  // Parte por comas que no estén dentro de comillas.
  const partes = [];
  let actual = "";
  let comilla = null;
  for (const ch of tupla) {
    if (comilla) {
      actual += ch;
      if (ch === comilla) comilla = null;
    } else if (ch === "'" || ch === '"') {
      comilla = ch;
      actual += ch;
    } else if (ch === ",") {
      partes.push(actual);
      actual = "";
    } else {
      actual += ch;
    }
  }
  partes.push(actual);
  return partes.map((s) => s.trim());
}

function limpiar(v) {
  return String(v).trim().replace(/^['"]|['"]$/g, "");
}

// ─── 3. Determinista de verdad: se ejecuta, no se lee ────────────────────────
//
// Este eje es el que D-070 pide. El estático puede pasar sobre un módulo que
// sortee de una forma que el regex no conoce; esto lo mide.

if (existe(MODULO)) {
  // CUATRO reglas por tipo de evento, no una.
  //
  // Con una sola regla por tipo, la salida tiene como mucho un elemento y el
  // orden no puede cambiar nada: la comprobación pasaría siempre, dijera lo
  // que dijera el módulo. Es exactamente la aserción cierta por construcción
  // que D-070 prohíbe — se descubrió aquí, degradando `cosmeticos.ts` para
  // quitarle el `.sort()` y viendo al auditor aprobar la degradación.
  //
  // Con cuatro umbrales por tipo, un logro grande desbloquea varios a la vez y
  // el orden de salida pasa a ser observable.
  const REGLAS = [];
  for (const tipoEvento of TIPOS_DE_EVENTO) {
    const cuenta = !["habilidad_dominada", "primer_intento"].includes(tipoEvento);
    for (const [n, umbral] of [1, 2, 3, 4].entries()) {
      REGLAS.push({
        cosmeticId: `${tipoEvento}_${"zmac"[n]}${n}`,
        tipoEvento,
        parametro: tipoEvento === "habilidad_dominada" ? "K01" : null,
        umbral: cuenta ? umbral : null,
      });
    }
  }
  const LOGROS = [
    { tipo: "habilidad_dominada", skillId: "K01" },
    { tipo: "primer_intento" },
    { tipo: "habilidades_dominadas_conteo", conteo: 14 },
    { tipo: "racha_dias", dias: 30 },
    { tipo: "liga_top_pct", pct: 3 },
    { tipo: "nivel_alcanzado", nivel: 9 },
  ];

  let semilla = 987654321;
  const siguiente = () => (semilla = (semilla * 1103515245 + 12345) % 2147483648) / 2147483648;

  for (const logro of LOGROS) {
    const esperado = JSON.stringify(cosmeticosQueDesbloquea(logro, REGLAS));
    for (let v = 0; v < 32; v++) {
      const barajado = [...REGLAS];
      for (let i = barajado.length - 1; i > 0; i--) {
        const j = Math.floor(siguiente() * (i + 1));
        [barajado[i], barajado[j]] = [barajado[j], barajado[i]];
      }
      const salida = JSON.stringify(cosmeticosQueDesbloquea(logro, barajado));
      if (salida !== esperado) {
        problemas.push(
          `${MODULO}: el evaluador NO es determinista. Con el logro ${logro.tipo} y las mismas ` +
            `reglas en otro orden devolvió ${salida} en vez de ${esperado}. Línea roja #5: ` +
            "misma entrada, misma salida, siempre.",
        );
        break;
      }
    }
  }
  notas.push(`ejecutado: ${LOGROS.length} logros × 32 barajadas, salida idéntica las 32 veces`);
}

// ─── 4. Un cosmético es una capa visual: el puntaje no lo conoce ─────────────

for (const motor of ["packages/motor/src/puntuacion.ts", "packages/motor/src/item.ts"]) {
  const texto = sinComentarios(leer(motor) ?? "");
  if (/cosmetic|avatar_parts|marco_perfil/i.test(texto)) {
    problemas.push(
      `${motor} menciona un cosmético. D-010 y el criterio de #252: equipar un cosmético ` +
        "nunca puede cambiar el resultado de `calificar()`. La forma de garantizarlo es que " +
        "el motor de puntuación no sepa que existen.",
    );
  }
}

const moduloTexto = sinComentarios(leer(MODULO) ?? "");
if (/from\s+["'][^"']*(puntuacion|item)\.ts["']/.test(moduloTexto)) {
  problemas.push(
    `${MODULO} importa el motor de puntuación. Un cosmético no puede leer ni influir el ` +
      "veredicto (D-010, #252).",
  );
}

notas.push(
  filasVistas > 0
    ? `${catalogo.size} cosmético(s) de catálogo, ${conRegla.size} con regla, ${iniciales.size} iniciales`
    : "todavía no hay filas de `cosmetic_catalog` en ninguna migración: el cruce " +
        "«ningún cosmético huérfano» está listo y hoy no tiene qué mirar (#253 no construida)",
);
notas.push(`azar exceptuado por escrito: ${[...AZAR_PERMITIDO].join(", ")} (selección de palabra, no de logro)`);

informar({
  nombre: "cosmeticos-deterministas",
  problemas,
  notas,
  cita: "línea roja #5, D-014, #252, #256, mc-17 §7",
  revisados,
  resumen: `${revisados} archivo(s) de producto y esquema`,
  porQueBloquea:
    "un cosmético con precio es la moneda comprable que D-014 prohíbe por nombre, y un " +
    "cosmético sorteado es la caja de botín que Bélgica y Países Bajos declararon juego " +
    "ilegal — aunque sea gratis y aunque sea solo un sombrero (mc-17 §7).",
  noComprueba: [
    "si el arte del cosmético es bueno ni si su condición es alcanzable — eso es contenido, " +
      "y lo revisa una persona (mc-40).",
    "si una pantalla lo anuncia con lenguaje de escasez. Eso es léxico y le toca a la flota " +
      "adversarial.",
  ],
});
