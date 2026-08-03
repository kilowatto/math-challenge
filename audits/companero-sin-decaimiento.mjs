#!/usr/bin/env node
// Auditor determinista — el compañero no tiene vida, ni hambre, ni decaimiento
//
// Hace cumplir: D-080, #235, #234, #257, mc-43 §6 e implicaciones 7 y 10.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// `mc-43` §6 documenta el caso Tamagotchi con una conclusión incómoda: tres
// medidores que bajan solos y una muerte de verdad como estado de fracaso. Le
// dio 40 millones de unidades en dos años **por eso mismo**, y le dio funerales
// de mentira en patios de escuela por lo mismo:
//
//   «The retention mechanism and the dark pattern are the same mechanism — the
//    device does not work as a companion without a threat»
//
// D-080 lo resuelve por CONSTRUCCIÓN y no por regla: si no existe un campo que
// decaiga, nadie puede encenderlo dentro de un año. Este auditor es lo que hace
// que «por construcción» siga siendo verdad el año que viene.
//
// La forma en que esto se rompe no es con mala intención. Es con una idea
// razonable en una reunión: «que Larry se ponga contento cuando vuelves».
// Contento implica un estado, un estado implica que puede no estarlo, y un
// compañero que puede no estar contento es un niño que se siente culpable por
// no abrir una app de matemáticas.
//
// ─── Cómo comprueba, y por qué de tres formas (D-070) ─────────────────────
//
//   · DINÁMICO — **ejecuta** `estadoInicial()` en las cinco bandas y exige que
//     el objeto tenga EXACTAMENTE dos claves. No busca «hambre»: un medidor se
//     llamaría `mood`, `bond`, `energy` o `carino` y pasaría cualquier lista de
//     palabras. Lo que no pasa es el conteo.
//   · ESTÁTICO sobre el ESQUEMA — `companion_state` (migración 0010) no puede
//     ganar una columna que el motor no declare, y ninguna migración puede
//     declarar una columna de compañero con nombre de medidor.
//   · ESTÁTICO sobre el MÓDULO y los TEXTOS — el módulo no puede leer el reloj
//     (sin reloj no hay decaimiento posible), y ninguna clave i18n del mapa
//     puede enmarcar nada alrededor de la tristeza o el abandono de Larry
//     (criterio 3 de #235, `mc-43` implicación 7).
//
// ─── Y la frontera de #257 ────────────────────────────────────────────────
//
// Con D-080 el tutor y el compañero son la MISMA criatura, así que la frontera
// entre «te explico tu error» y «qué bonito tu sombrero» ya no la dibuja el
// personaje. Aquí se comprueba lo estructural: que el módulo del compañero no
// pueda hablar (no importa el tutor, no exporta texto).
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si un modelo, en vivo, improvisa un elogio al sombrero de un niño. Eso lo
//    vigilan `larry-en-vivo` y la compuerta de salida de F6, que es donde está
//    la superficie generativa.
//  · Si el arte del compañero da pena o alegría. Eso es contenido y lo mira una
//    persona.
//  · Si una notificación push habla de Larry triste: el canal de push no existe
//    todavía (F7 lo cede a una fase posterior). El día que exista, este auditor
//    tiene que crecer para mirar su copy.

import { archivos, leer, informar, sinComentarios, sqlSinComentarios, palabra } from "./lib/repo.mjs";
import {
  estadoInicial,
  VISIBLE_AL_CREAR,
  PRESENCIA_POR_TEMA,
  COLUMNAS_COMPANION_STATE,
} from "../packages/motor/src/companero.ts";
import { ORDEN_TEMAS } from "../packages/motor/src/bandas.ts";

const MODULO = "packages/motor/src/companero.ts";
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/**
 * Nombres de medidor, en los cinco idiomas del producto.
 *
 * Es la red de seguridad, no la comprobación principal: la principal es el
 * conteo de claves, que caza también los nombres que esta lista no imaginó.
 */
const MEDIDOR = palabra(
  "hunger", "hambre", "faim", "fome", "hunger_level",
  "happiness", "felicidad", "felicidade", "bonheur", "gluck", "glueck",
  "health", "salud", "saude", "sante", "gesundheit",
  "energy", "energia", "energie",
  "mood", "humor", "humeur", "stimmung",
  "decay", "decaimiento", "decadencia", "verfall",
  "hp", "vidas", "lives", "leben",
  "last_fed_at", "fed_at", "alimentado",
);

/** El reloj: sin él no hay decaimiento posible. */
const RELOJ = /(Date\s*\.\s*now|new\s+Date\s*\(|setInterval|setTimeout|performance\s*\.\s*now)/;

/**
 * Culpa y abandono, en los cinco idiomas. Criterio 3 de #235 y `mc-43`
 * implicación 7: ninguna notificación —ni ningún texto de pantalla— se enmarca
 * alrededor de la tristeza del compañero.
 */
const CULPA = [
  [/\b(te extra[ñn]a|te echa de menos|misses you|tu lui manques|sente sua falta|sente a tua falta|vermisst dich)\b/i, "el compañero te echa de menos"],
  [/\b(est[aá] triste|is sad|est triste|ist traurig|fica triste)\b/i, "el compañero está triste"],
  [/\b(tiene hambre|is hungry|a faim|est[aá] com fome|tem fome|hat hunger|ist hungrig)\b/i, "el compañero tiene hambre"],
  [/\b(se va a morir|va a morir|will die|va mourir|vai morrer|stirbt)\b/i, "el compañero se muere"],
  [/\b(no lo abandones|don'?t abandon|ne l'?abandonne|n[aã]o o abandones|lass ihn nicht)\b/i, "no abandones al compañero"],
];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. DINÁMICO — el estado tiene exactamente dos claves ─────────────────

for (const tema of ORDEN_TEMAS) {
  const claves = Object.keys(estadoInicial(tema)).sort();
  if (claves.length !== 2 || claves[0] !== "accesorios" || claves[1] !== "visible") {
    problemas.push(
      `\`estadoInicial("${tema}")\` devuelve ${claves.length} clave(s) (${claves.join(", ")}) en ` +
        "vez de exactamente `accesorios` y `visible`. D-080: el compañero no tiene estado de " +
        "vida, hambre ni decaimiento, y eso desaparece POR CONSTRUCCIÓN — cualquier tercer " +
        "campo es el sitio donde un medidor aterriza dentro de un año (mc-43 §6).",
    );
  }
}
revisados++;

// ─── 2. DINÁMICO — apagado por defecto en SERIO y PRO (#234) ──────────────

for (const tema of ["SERIO", "PRO"]) {
  if (VISIBLE_AL_CREAR[tema] !== false || estadoInicial(tema).visible !== false) {
    problemas.push(
      `el compañero nace VISIBLE en ${tema}. El primer criterio de #234 pide "visible = 0" al ` +
        "crear un perfil de esa banda: `mc-43` §8 dice «gamified skin optional and off by " +
        "default» para la banda adulta, y `mc-23` es de donde sale.",
    );
  }
  if (PRESENCIA_POR_TEMA[tema] !== "bajo_peticion") {
    problemas.push(
      `la presencia del compañero en ${tema} es "${PRESENCIA_POR_TEMA[tema]}" y D-080 dice ` +
        "«bajo demanda de SERIO en adelante» (mc-43 §9).",
    );
  }
}

// ─── 3. ESTÁTICO — el módulo no lee el reloj y no habla ───────────────────

const crudoModulo = leer(MODULO);
if (crudoModulo === null) {
  problemas.push(`${MODULO} no existe. El compañero de D-080 vive ahí (#235).`);
} else {
  revisados++;
  const texto = sinComentarios(crudoModulo);

  if (RELOJ.test(texto)) {
    problemas.push(
      `${MODULO} lee el reloj. Un compañero solo puede decaer si sabe cuánto tiempo pasó: sin ` +
        "reloj, el riesgo Tamagotchi de `mc-43` §6 no es que esté prohibido — es que no se puede " +
        "implementar.",
    );
  }
  if (MEDIDOR.test(texto)) {
    problemas.push(
      `${MODULO} nombra un medidor (hambre, felicidad, salud, energía, humor…). D-080: sin ` +
        "estado de vida, sin hambre, sin decaimiento.",
    );
  }
  // #257: si no puede llamar al tutor, no puede comentar el sombrero de nadie.
  if (/from\s+["'][^"']*(tutor|explicacion|larry)[^"']*["']/i.test(texto)) {
    problemas.push(
      `${MODULO} importa el tutor. Con D-080, Larry es a la vez quien explica y quien lleva los ` +
        "accesorios, así que la frontera de #257 —nunca comenta el avatar ni los cosméticos de " +
        "un niño— tiene que ser explícita: este módulo no habla y no puede llamar a quien habla.",
    );
  }
}

// ─── 4. ESTÁTICO — el esquema, cruzado contra lo que el motor declara ─────

let vistaLaTabla = false;
for (const f of archivos(/^migrations\/.*\.sql$/)) {
  revisados++;
  const sql = sqlSinComentarios(leer(f) ?? "");

  const bloque = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?companion_state["`]?\s*\(([\s\S]*?)\n\s*\)\s*;/i);
  if (bloque) {
    vistaLaTabla = true;
    const cuerpo = bloque[1];
    const columnas = cuerpo
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !/^(CHECK|CONSTRAINT|PRIMARY\s+KEY|UNIQUE|FOREIGN\s+KEY)\b/i.test(l))
      .map((l) => (l.match(/^["`]?(\w+)["`]?\s/) ?? [])[1])
      .filter(Boolean);

    const declaradas = new Set(COLUMNAS_COMPANION_STATE);
    const sobran = columnas.filter((c) => !declaradas.has(c));
    if (sobran.length > 0) {
      problemas.push(
        `${f}: \`companion_state\` tiene columna(s) que el motor no declara (${sobran.join(", ")}). ` +
          "`COLUMNAS_COMPANION_STATE` en companero.ts y este CREATE TABLE son dos fuentes " +
          "independientes a propósito: una columna que solo existe en el SQL es una columna que " +
          "nadie lee, y ese es exactamente el sitio donde aterriza un medidor de hambre.",
      );
    }
    const faltan = [...declaradas].filter((c) => !columnas.includes(c));
    if (faltan.length > 0) {
      problemas.push(`${f}: a \`companion_state\` le faltan columnas declaradas: ${faltan.join(", ")}`);
    }
  }

  // Y ninguna migración puede colar un medidor por ALTER TABLE.
  for (const m of sql.matchAll(/ALTER\s+TABLE\s+["`]?companion_state["`]?\s+ADD\s+COLUMN\s+["`]?(\w+)["`]?/gi)) {
    problemas.push(
      `${f}: ALTER TABLE companion_state añade \`${m[1]}\`. El compañero tiene dos campos y los ` +
        "dos son de la persona (D-080). Un tercero exige borrar esta comprobación y explicarlo " +
        "en un commit, que es justo el trámite que una decisión así necesita.",
    );
  }
}
if (!vistaLaTabla) {
  notas.push("`companion_state` todavía no está en ninguna migración: el cruce está listo y hoy no tiene qué mirar");
}

// ─── 5. ESTÁTICO — ningún texto enmarca culpa ni abandono ─────────────────

for (const loc of LOCALES) {
  const ruta = `apps/web/src/i18n/${loc}.json`;
  const crudo = leer(ruta);
  if (crudo === null) continue;
  revisados++;
  let textos;
  try {
    textos = JSON.parse(crudo);
  } catch {
    continue; // `mapa-sin-numero-de-nivel` ya reporta el JSON roto.
  }
  for (const [clave, valor] of Object.entries(textos)) {
    if (!clave.startsWith("mapa") || typeof valor !== "string") continue;
    for (const [re, que] of CULPA) {
      if (re.test(valor)) {
        problemas.push(
          `${ruta} · ${clave}: «${valor}» enmarca ${que}. Criterio 3 de #235 y \`mc-43\` ` +
            "implicación 7: ninguna notificación ni pantalla se enmarca alrededor de la tristeza " +
            "o el abandono del compañero. Es la mitad de Tamagotchi que este producto no copia.",
        );
      }
    }
  }
}

notas.push(`${COLUMNAS_COMPANION_STATE.length} columnas declaradas por el motor, cruzadas contra el esquema`);
notas.push("ejecutado: las 5 bandas de D-017, estado con exactamente 2 claves, apagado en SERIO y PRO");

informar({
  nombre: "companero-sin-decaimiento",
  problemas,
  notas,
  cita: "D-080, #235, #234, #257, mc-43 §6 e implicaciones 7 y 10",
  revisados,
  resumen: `${revisados} archivo(s) de motor, esquema y texto, más 5 bandas ejecutadas`,
  porQueBloquea:
    "en Tamagotchi el mecanismo de retención y el patrón oscuro son el mismo mecanismo: el " +
    "aparato no funciona como compañero sin la amenaza (mc-43 §6). Un compañero que se pone " +
    "triste convierte un juego de matemáticas en una obligación con culpa, y el que la siente " +
    "tiene cinco años.",
  noComprueba: [
    "si un modelo, en vivo, improvisa un elogio al sombrero de un niño. Eso lo vigilan " +
      "`larry-en-vivo` y la compuerta de salida de F6.",
    "si el arte del compañero da pena o alegría. Eso es contenido, y lo mira una persona.",
    "el copy de las notificaciones push: ese canal no existe todavía. El día que exista, este " +
      "auditor tiene que crecer para mirarlo.",
  ],
});
