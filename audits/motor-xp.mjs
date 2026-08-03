#!/usr/bin/env node
// Auditor determinista — XP y puntos son dos monedas, y ninguna se cambia por la otra
//
// Hace cumplir: D-055, D-025, D-010, D-014, línea roja #5, #192, #194, #219, #225.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-055 se escribió porque ya pasó: dos sesiones construyeron cosas
// incompatibles en la misma tanda — una hizo XP una fórmula nueva con tabla
// propia, la otra afirmó que «XP es el mismo número que los puntos». Las dos
// no pueden ser ciertas, y la diferencia no es de estilo:
//
//   · los puntos BAJAN al fallar rápido (D-010), se resetean por temporada y
//     existen para ordenar un tablero;
//   · el XP no baja nunca, no se resetea nunca, no ve el reloj en ninguna banda
//     y existe para progresar de Rango.
//
// En KINDER —toda la banda que el MVP construye— los dos coinciden por
// construcción, así que el lanzamiento **no expone la divergencia**. Ése es
// exactamente el motivo por el que hace falta un guardián ahora: el día que se
// exponga, ya no habrá dónde separarlos, y habrá filas en producción calculadas
// con la fórmula equivocada.
//
// ─── Las cinco cosas que comprueba ────────────────────────────────────────
//
//  1. **Un solo motor de XP.** La fórmula vive en `packages/motor/src/xp.ts` y
//     en ningún otro sitio, mismo patrón que `motor-puntuacion.mjs` impone para
//     D-010.
//  2. **Nunca se mezclan** (#225): ninguna expresión suma, resta o convierte
//     `total_xp` con `total_score`, ni `xp` con `puntos`.
//  3. **El XP no ve el reloj**: `xpDeItem`/`xpDelReto` no reciben `rtMs` ni
//     nada que se le parezca, en ninguna banda — ni siquiera en PRO.
//  4. **El XP nunca es negativo**, ejecutando el motor sobre los 12 niveles ×
//     los 2 aciertos × cerrado y sin cerrar.
//  5. **La tabla de XP es fija y publicada** (#219, línea roja #5): cero azar en
//     el camino que otorga XP, y la tabla congelada — se ejecuta y se comprueba,
//     no se lee.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si `RANGO_ESCALA = 25` es un buen número. No lo es ni deja de serlo: no hay
//    datos de producción, y el propio módulo lleva escrita su condición de
//    revisión. Eso se recalibra midiendo, no auditando.
//  · Si una pantalla muestra el Rango en KINDER como número (mc-43 §8 lo
//    prohíbe). Eso es interfaz y todavía no existe.

import { archivos, leer, informar, sinComentarios, palabra, existe } from "./lib/repo.mjs";
import {
  XP_POR_TIPO,
  RANGOS_PUBLICADOS,
  umbralXpParaRango,
  rangoDeXp,
  rangoDeXpIterativo,
  xpDeItem,
  xpDelReto,
  xpDeTipo,
  SQL_UPSERT_XP,
} from "../packages/motor/src/xp.ts";

const MOTOR = "packages/motor/src/xp.ts";

const problemas = [];
const notas = [];
let revisados = 0;

if (!existe(MOTOR)) {
  problemas.push(`${MOTOR} no existe. Este auditor lo ejecuta, así que sin él no comprueba nada.`);
}

// ─── 1. Un solo motor de XP ──────────────────────────────────────────────────

const DEFINE_XP =
  /(?:function|const)\s+\w*(?:xpDe|xpDel|umbralXp|rangoDeXp|calcularXp|computeXp)\w*\s*[=(]/;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => /^(apps|packages|workers)\//.test(f));
const otrosMotores = [];

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  if (archivo === MOTOR || /\.prueba\./.test(archivo)) continue;
  if (DEFINE_XP.test(texto)) otrosMotores.push(archivo);
}

if (otrosMotores.length > 0) {
  problemas.push(
    `${otrosMotores.length} archivo(s) definen su propia fórmula de XP fuera del motor ` +
      `(${otrosMotores.slice(0, 3).join(", ")}). D-055: hay UN eje de XP. Dos fórmulas dan dos ` +
      "rangos para el mismo niño, y la pantalla enseña el que le tocó.",
  );
}

// ─── 2. XP y puntos nunca se mezclan (#225, D-055) ───────────────────────────

/** Una expresión que junta las dos monedas en una sola cuenta. */
// `[\w.]*\.` delante del segundo término es lo que hace que esto sirva: la
// mezcla no se escribe con dos identificadores desnudos, se escribe
// `fila.total_xp + fila.total_score`. Sin ese trozo el auditor pasaba en verde
// sobre su propio control negativo — se descubrió aquí, no en producción.
const MEZCLA = [
  /total_xp\s*[+\-*/]\s*(?:[\w.]*\.)?total_score/i,
  /total_score\s*[+\-*/]\s*(?:[\w.]*\.)?total_xp/i,
  /\bxp\s*[+\-*/]\s*(?:[\w.]*\.)?puntos\b/i,
  /\bpuntos\s*[+\-*/]\s*(?:[\w.]*\.)?xp\b/i,
  /\b(xpAPuntos|puntosAXp|xpToScore|scoreToXp|convertirXp|convertirPuntos)\b/i,
];

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs|sql)$/).filter((f) =>
  /^(apps|packages|workers|migrations)\//.test(f),
)) {
  const texto = sinComentarios(leer(archivo) ?? "");
  revisados++;
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    for (const re of MEZCLA) {
      if (!re.test(lineas[i])) continue;
      problemas.push(
        `${archivo}:${i + 1}: XP y puntos del tablero se mezclan — ` +
          `\`${lineas[i].trim().slice(0, 80)}\`. #225 y D-055: son dos monedas distintas y no ` +
          "se convierten. Los puntos pueden bajar y se resetean por temporada; el XP no baja " +
          "nunca. Sumarlos produce un número que no significa ninguna de las dos cosas.",
      );
      break;
    }
  }

  // Y la tabla de XP no puede ganar las columnas que la vuelven un tablero.
  if (/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?xp_totals/i.test(texto)) {
    const cuerpo = texto.slice(texto.search(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?xp_totals/i));
    const decl = cuerpo.slice(0, cuerpo.indexOf(";") + 1);
    for (const prohibida of ["period", "theme_band", "rango", "rank"]) {
      if (palabra(prohibida).test(decl.replace(/CHECK\s*\([^)]*\)/gi, " "))) {
        problemas.push(
          `${archivo}: \`xp_totals\` declara la columna \`${prohibida}\`. #192 y #194: el XP es ` +
            "de por vida (sin `period`, sin `theme_band`) y el rango se DERIVA de `total_xp` al " +
            "leer. Guardar el rango es guardar dos veces el mismo hecho, y la curva lleva " +
            "escrita su condición de recalibración.",
        );
      }
    }
  }
}

// ─── 3, 4 y 5. Se EJECUTA el motor ──────────────────────────────────────────
//
// D-070: leer el archivo no basta. Estas tres reglas se miden.

if (existe(MOTOR)) {
  // El XP no ve el reloj, en ninguna banda.
  if (xpDeItem.length !== 2) {
    problemas.push(
      `${MOTOR}: \`xpDeItem\` recibe ${xpDeItem.length} parámetros y debe recibir 2 (nivel, acc). ` +
        "D-055: el XP no depende del reloj en NINGUNA banda, ni siquiera en PRO donde el " +
        "puntaje sí lo usa.",
    );
  }
  const textoMotor = sinComentarios(leer(MOTOR) ?? "");
  if (/\brtMs\b|\brt_?ms\b|responseTime|tiempoDeRespuesta/i.test(textoMotor)) {
    problemas.push(
      `${MOTOR} nombra el tiempo de respuesta. El XP no lo ve en ninguna banda (D-055).`,
    );
  }

  // El XP nunca es negativo, se responda lo que se responda.
  let barrido = 0;
  for (let nivel = 1; nivel <= 12; nivel++) {
    for (const acc of [0, 1]) {
      for (const completo of [true, false]) {
        const v = xpDelReto([{ nivel, acc }], completo);
        barrido++;
        if (v < 0) {
          problemas.push(
            `${MOTOR}: nivel ${nivel}, acc ${acc}, completo ${completo} dio ${v} XP. ` +
              "D-055: el XP nunca baja. Un número que baja es una penalización, y `mc-17` §11 " +
              "mide que la recompensa controladora daña más a un niño que a un universitario.",
          );
        }
      }
    }
  }

  // La curva: cerrada e iterativa idénticas, y sin tope artificial.
  let discrepancias = 0;
  for (let xp = 0; xp <= 30_000; xp += 29) {
    if (rangoDeXp(xp) !== rangoDeXpIterativo(xp) && discrepancias++ < 2) {
      problemas.push(
        `${MOTOR}: la forma cerrada y la iterativa discrepan en xp=${xp} ` +
          `(${rangoDeXp(xp)} vs ${rangoDeXpIterativo(xp)}). Una fórmula cerrada mal despejada da ` +
          "un número plausible y equivocado: el niño sube de rango antes o después y no hay con " +
          "qué discutirlo.",
      );
    }
  }

  // La tabla publicada sale de la fórmula, no de la mano de nadie.
  for (const fila of RANGOS_PUBLICADOS) {
    if (fila.xpParaEntrar !== umbralXpParaRango(fila.rango)) {
      problemas.push(
        `${MOTOR}: la tabla publicada dice ${fila.xpParaEntrar} XP para el Rango ${fila.rango} y ` +
          `la fórmula da ${umbralXpParaRango(fila.rango)}. Línea roja #5: la tabla es publicada, ` +
          "y una tabla que miente sobre el umbral es una caja sorpresa con otro nombre.",
      );
    }
  }
  if (RANGOS_PUBLICADOS.length < 15) {
    problemas.push(
      `${MOTOR}: la tabla publicada tiene ${RANGOS_PUBLICADOS.length} rangos y #194 pide al menos 15.`,
    );
  }

  // La tabla de XP por tipo: fija, congelada, y sin varianza entre llamadas.
  for (const tipo of Object.keys(XP_POR_TIPO)) {
    const primera = xpDeTipo(tipo);
    for (let i = 0; i < 64; i++) {
      if (xpDeTipo(tipo) !== primera) {
        problemas.push(
          `${MOTOR}: \`xpDeTipo("${tipo}")\` devolvió dos valores distintos. Línea roja #5 y ` +
            "#219: la tabla de XP es FIJA — el jugador puede saber de antemano cuánto vale cada " +
            "cosa. `mc-17` (implicación 3) y `mc-43` (hallazgo 5) son explícitos en que el " +
            "refuerzo de razón variable no necesita dinero para dañar a un niño.",
        );
        break;
      }
    }
  }
  if (!Object.isFrozen(XP_POR_TIPO)) {
    problemas.push(
      `${MOTOR}: \`XP_POR_TIPO\` no está congelada. Una tabla publicada a la que se le puede ` +
        "añadir un tipo en caliente no es una tabla publicada.",
    );
  }

  // Azar en el camino que otorga XP.
  if (/(Math\s*\.\s*random|crypto\s*\.\s*getRandomValues)/.test(textoMotor)) {
    problemas.push(
      `${MOTOR}: hay azar en el camino que otorga XP. Línea roja #5 y #219: la recompensa es ` +
        "fija y publicada, pagada o gratis.",
    );
  }

  // El upsert no guarda el rango ni convierte nada.
  if (/\brango\b|\brank\b/i.test(SQL_UPSERT_XP)) {
    problemas.push(`${MOTOR}: el upsert de \`xp_totals\` toca una columna de rango (#194).`);
  }
  if (!SQL_UPSERT_XP.includes("total_xp + excluded.total_xp")) {
    problemas.push(
      `${MOTOR}: el upsert manda un total en vez de un delta. Entre la lectura y la escritura ` +
        "cabe otro lote, y así se pierde XP sin que nadie lo note (mismo razonamiento que " +
        "`rollup.ts` ya escribió para los puntos).",
    );
  }

  notas.push(`ejecutado: ${barrido} combinaciones de nivel × acierto × cierre, ningún XP negativo`);
  notas.push("ejecutado: 1 035 puntos de la curva, forma cerrada ≡ iterativa");
  notas.push(`tabla publicada: ${RANGOS_PUBLICADOS.length} rangos derivados de la fórmula`);
  notas.push(`tabla de XP fija: ${Object.keys(XP_POR_TIPO).join(", ")} — 64 llamadas, mismo valor`);
}

notas.push("D-055: los puntos bajan y se resetean; el XP no baja nunca y no ve el reloj");

informar({
  nombre: "motor-xp",
  problemas,
  notas,
  cita: "D-055, D-025, D-010, D-014, línea roja #5, #192, #194, #219, #225",
  revisados,
  resumen: `${revisados} archivo(s) de producto y esquema, y el motor ejecutado`,
  porQueBloquea:
    "mezclar XP con los puntos del tablero produce un número que no significa ninguna de las " +
    "dos cosas, y en KINDER los dos coinciden por construcción — así que el error no se vería " +
    "hasta que hubiera filas en producción calculadas con la fórmula equivocada (D-055).",
  noComprueba: [
    "si RANGO_ESCALA = 25 es un buen número. No hay datos de producción; el módulo lleva " +
      "escrita su condición de revisión y eso se recalibra midiendo, no auditando.",
    "si una pantalla muestra el Rango como número en KINDER (mc-43 §8). Eso es interfaz y " +
      "todavía no existe.",
  ],
});
