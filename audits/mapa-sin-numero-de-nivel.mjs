#!/usr/bin/env node
// Auditor determinista — el número de nivel no se le enseña a nadie
//
// Hace cumplir: D-017, criterio #100, #232, #233, mc-10.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-017 tiene doce niveles y el criterio #100 dice qué hacer con ellos: **no
// enseñárselos a nadie.** «Estás practicando: contar del 1 al 10», nunca
// «Nivel 3».
//
// No es pudor. `mc-10` mide que la presión de rendimiento **empeora el
// desempeño en matemáticas** — no el ánimo, el desempeño —, y un número de
// nivel es una nota escolar con otro nombre: se compara con el hermano, con el
// del salón, y con el que tenías el mes pasado.
//
// Y en KINDER hay una regla más fuerte todavía (#232): **ni un número, de
// ningún tipo.** El usuario tiene cuatro años y no lee (D-019); un porcentaje
// en esa pantalla no informa a nadie y sí convierte un juego en una evaluación.
// `mc-43` §8 lo escribe como «KINDER — a physical journey path with the mascot
// walking forward, **no numbers**».
//
// ─── Cómo comprueba, y por qué de tres formas (D-070) ─────────────────────
//
//   · DINÁMICO — **ejecuta** `construirArbol()` con habilidades de N5 y N7 y
//     exige que ninguno de los dos números aparezca en el objeto devuelto. Es
//     la comprobación que importa: un `nivel: e.nivel` de más compila, pasa
//     cualquier revisión de tipos, y pinta el número en la cara de un niño.
//   · ESTÁTICO sobre las PLANTILLAS — ningún componente del mapa puede
//     interpolar algo llamado `nivel`/`level`, ni escribir «Nivel 3» a mano.
//   · ESTÁTICO sobre los TEXTOS — ninguna clave i18n del mapa, en ninguno de
//     los siete locales, puede contener «Nivel/Level/Niveau/Nível/Stufe» seguido
//     de una cifra. Y las claves que KINDER lee no pueden contener NINGÚN
//     dígito.
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si un rótulo de habilidad que llega del catálogo trae el número dentro
//    («Nivel 4 · fracciones»). Ese texto es contenido y lo revisa una persona.
//  · Si una cifra correcta está mal explicada. Eso es léxico y le toca a la
//    flota adversarial.

import { archivos, leer, informar, sinComentarios } from "./lib/repo.mjs";
import { construirArbol, construirSendero } from "../packages/motor/src/mapa.ts";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

/**
 * Las claves que un KINDER puede tener delante. No llevan NI UN dígito.
 *
 * Están escritas a mano porque la lista es corta y el criterio es duro: una
 * heurística sobre nombres de clave dejaría fuera justo la que alguien añada
 * mañana sin pensar.
 */
const CLAVES_DE_KINDER = [
  "mapaSenderoNombre",
  "mapaLugarTerminado",
  "mapaLugarEnCurso",
  "mapaLugarPorVisitar",
  "mapaAqui",
  "mapaCompaneroNombre",
];

/** «Nivel 3», «Level 2», «Niveau 4», «Nível 1», «Stufe 5» — y `N3`. */
const NIVEL_CON_CIFRA = /\b(nivel|level|niveau|n[ií]vel|stufe)\s*[:#]?\s*\d/i;

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. DINÁMICO — el nivel de entrada no sale en el objeto de salida ─────

const ENTRADAS = [
  { habilidad: "S02", nivel: 7, skillState: 0.8, rotulo: "Proporciones" },
  { habilidad: "S01", nivel: 5, skillState: 0.1, rotulo: "Potencias" },
];
const arbol = construirArbol(ENTRADAS);
const serializado = JSON.stringify(arbol);

if (/"nivel"|"level"/i.test(serializado)) {
  problemas.push(
    "`construirArbol()` devuelve una clave `nivel`. El modelo de vista del mapa no lleva el " +
      "número de nivel (D-017, criterio #100): agrupa por él y devuelve un `orden` correlativo. " +
      "Con el número dentro, cualquier plantilla lo puede pintar por descuido.",
  );
}
const ordenes = arbol.grupos.map((g) => g.orden);
if (JSON.stringify(ordenes) !== JSON.stringify([1, 2])) {
  problemas.push(
    `con habilidades de N5 y N7, los grupos salen con orden ${JSON.stringify(ordenes)} en vez de ` +
      "[1,2]. `orden` es correlativo dentro del árbol; si coincide con el nivel, es que se está " +
      "devolviendo el nivel con otro nombre.",
  );
}
if (arbol.aristas.length > 0) {
  problemas.push(
    "el árbol nace con aristas de prerrequisito. La columna no existe en `skills` (F5 §4.8 " +
      "bloqueo 10) y #233 pide explícitamente que ningún elemento visual implique una relación " +
      "que el esquema no puede respaldar hoy.",
  );
}

// El sendero de KINDER: ni un `number` a ninguna profundidad (#232).
const sendero = construirSendero(["K01", "K02"], { K01: "terminado" });
const numeros = [];
const mirar = (v, ruta) => {
  if (typeof v === "number") numeros.push(`${ruta} = ${v}`);
  else if (Array.isArray(v)) v.forEach((x, i) => mirar(x, `${ruta}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) mirar(x, `${ruta}.${k}`);
};
mirar(sendero, "sendero");
if (numeros.length > 0) {
  problemas.push(
    `el modelo del sendero de KINDER lleva ${numeros.length} campo(s) numérico(s) ` +
      `(${numeros[0]}). #232 pide que la pantalla no muestre ningún número, y la forma de ` +
      "garantizarlo es que la plantilla no tenga de dónde sacarlo. El usuario tiene cuatro años " +
      "y no lee (D-019).",
  );
}
revisados++;

// ─── 2. ESTÁTICO — las plantillas del mapa ────────────────────────────────

// Todo lo que vive en `components/mapa/`, más cualquier página cuyo nombre
// diga que pinta un mapa. La segunda mitad es la que caza la pantalla que
// alguien añada mañana sin tocar el componente.
const PLANTILLAS = archivos(/^apps\/web\/src\/(components|pages)\/.*\.astro$/).filter(
  (f) => /^apps\/web\/src\/components\/mapa\//.test(f) || /(mapa|sendero|arbol|tablero|companero)/i.test(f),
);
for (const f of PLANTILLAS) {
  revisados++;
  const texto = sinComentarios(leer(f) ?? "");

  if (NIVEL_CON_CIFRA.test(texto)) {
    problemas.push(
      `${f} escribe un número de nivel a mano. D-017 y el criterio #100: el número de nivel no ` +
        "se enseña a nadie; se dice qué se está practicando.",
    );
  }
  // Interpolar `nivel` en la plantilla es la otra vía, y la más probable.
  if (/\{[^}]*\bnivel\b[^}]*\}/i.test(texto)) {
    problemas.push(
      `${f} interpola algo llamado \`nivel\`. El modelo de vista del mapa no trae el nivel ` +
        "(D-017, #100): si aquí hay uno, salió de otra parte y va a llegar a una pantalla.",
    );
  }
}

// ─── 3. ESTÁTICO — los textos, en los siete locales ───────────────────────

for (const loc of LOCALES) {
  const ruta = `apps/web/src/i18n/${loc}.json`;
  const crudo = leer(ruta);
  if (crudo === null) {
    problemas.push(`${ruta} no existe. Son siete locales, no cinco idiomas (D-022).`);
    continue;
  }
  revisados++;
  let textos;
  try {
    textos = JSON.parse(crudo);
  } catch (err) {
    problemas.push(`${ruta} no es JSON válido: ${err.message}`);
    continue;
  }

  for (const [clave, valor] of Object.entries(textos)) {
    if (!clave.startsWith("mapa")) continue;
    if (typeof valor !== "string") continue;

    if (NIVEL_CON_CIFRA.test(valor)) {
      problemas.push(
        `${ruta} · ${clave}: «${valor}» enseña un número de nivel. D-017 y el criterio #100 lo ` +
          "prohíben en todas las bandas, y `mc-10` mide por qué.",
      );
    }
    if (CLAVES_DE_KINDER.includes(clave) && /\d/.test(valor)) {
      problemas.push(
        `${ruta} · ${clave}: «${valor}» contiene una cifra, y esta clave se pinta en la banda ` +
          "KINDER. #232: la pantalla de kinder no muestra ningún número, ni porcentaje ni cifra " +
          "de progreso — el usuario tiene cuatro años y no lee (D-019, mc-43 §8).",
      );
    }
  }

  // Las seis claves de KINDER tienen que existir en los siete locales: una que
  // falte deja un `undefined` en un `aria-label`, que es peor que una cifra.
  const faltan = CLAVES_DE_KINDER.filter((c) => typeof textos[c] !== "string");
  if (faltan.length > 0) {
    problemas.push(`${ruta}: faltan las claves del sendero: ${faltan.join(", ")} (D-022)`);
  }
}

notas.push(`${PLANTILLAS.length} plantilla(s) del mapa y ${LOCALES.length} locales revisados`);
notas.push("ejecutado: N5+N7 → grupos 1 y 2, y el sendero sin un solo campo numérico");

informar({
  nombre: "mapa-sin-numero-de-nivel",
  problemas,
  notas,
  cita: "D-017, criterio #100, #232, #233, mc-10, mc-43 §8",
  revisados,
  resumen: `${revisados} archivo(s) y 2 modelos ejecutados`,
  porQueBloquea:
    "un número de nivel es una nota escolar con otro nombre: se compara con el hermano, con el " +
    "del salón y con el del mes pasado. `mc-10` mide que la presión de rendimiento empeora el " +
    "desempeño en matemáticas — no el ánimo, el desempeño.",
  noComprueba: [
    "si un rótulo de habilidad trae el número dentro («Nivel 4 · fracciones»). Ese texto es " +
      "contenido y lo revisa una persona (mc-40).",
    "si una cifra correcta está mal explicada. Eso es léxico y le toca a la flota adversarial.",
  ],
});
