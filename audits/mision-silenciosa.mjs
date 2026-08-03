#!/usr/bin/env node
// Auditor determinista — ninguna misión se pinta dentro de un reto activo
//
// Hace cumplir: #211, #221, D-018, D-024, mc-42 §3, mc-17 §9.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// D-018 protege el modo PROBLEMA precisamente para que el reloj no estorbe al
// pensamiento, y D-024 prohíbe cronómetros encendidos por defecto. Una insignia
// de misión parpadeando en la esquina —«¡vas por tu misión!», «2 de 3»—
// reintroduce la misma presión evaluativa que el modo fue diseñado para evitar,
// aunque no sea un cronómetro.
//
// Y no es una intuición de diseño: `mc-42` §3 mide que el estímulo irrelevante
// **durante la tarea** perjudica. El efecto de habla irrelevante degrada el
// recuerdo serial *aunque no se atienda* — o sea que «es chiquito y está en la
// esquina» no es una defensa. `mc-17` §9 nombra además la categoría: *nagging*.
//
// La regla, entonces: **las misiones se anuncian al empezar la sesión y se
// resumen al terminarla, nunca en medio.**
//
// ─── Cómo comprueba ───────────────────────────────────────────────────────
//
// Mismo patrón de grafo de dependencias que `larry-sin-item.mjs` usa en F6: no
// se juzga el texto, se juzga QUIÉN PUEDE VER QUÉ. Un componente que no importa
// el estado de misión no puede pintarlo, se escriba lo que se escriba dentro.
//
//   · Las superficies de un reto activo (los componentes de `components/reto/`,
//     las páginas que montan un reto) no importan el motor de misiones ni
//     nombran ninguna de sus funciones o constantes.
//   · Y el motor de misiones no importa ninguna interfaz: es puro y no exporta
//     ni una cadena de cara a la persona. El copy vive en los archivos de
//     locale — viaja la clave, nunca el valor (D-022, mc-34).
//
// La ruta `/api/*` queda FUERA a propósito y no es un descuido: cerrar un reto
// **tiene** que poder avanzar el progreso de la misión en el servidor. Lo que
// #221 prohíbe es renderizarla, no contarla. La distinción es exactamente la
// línea entre «el servidor sabe» y «el niño lo ve mientras piensa».
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si la pantalla de FIN de reto muestra el resumen con buen gusto, o si el
//    anuncio del principio es demasiado largo. Eso es diseño y lo ve una
//    persona, o la flota adversarial.
//  · Un texto de misión inyectado por otra vía (una cadena de locale reusada
//    dentro del reto). El grafo de imports no lo alcanza; el léxico sí, y le
//    toca a la flota adversarial.

import { archivos, leer, informar, sinComentarios, existe } from "./lib/repo.mjs";

const MODULO = "packages/motor/src/misiones.ts";

/**
 * Dónde vive un reto ACTIVO: lo que se pinta mientras alguien resuelve.
 *
 * `pages/api/` no está, y está dicho arriba por qué.
 */
const SUPERFICIES_DE_RETO = [
  /(^|\/)components\/reto\/[^/]+\.(astro|tsx|jsx|svelte|vue)$/,
  /(^|\/)Reto[A-Z][^/]*\.(astro|tsx|jsx|svelte|vue)$/,
  /(^|\/)pages\/.*\/(jugar|reto)[^/]*\.(astro|tsx|jsx)$/,
  /(^|\/)pages\/.*\/reto-demo\.astro$/,
];

const esSuperficieDeReto = (ruta) =>
  SUPERFICIES_DE_RETO.some((re) => re.test(ruta)) && !/\/pages\/api\//.test(ruta);

/** Importar el motor de misiones desde dentro del reto. */
const IMPORTA_MISION = /from\s+["'][^"']*misiones?(?:\.ts)?["']|import\s+["'][^"']*misiones?[^"']*["']/i;

/** Y nombrarlo sin importarlo: una prop, un `window.__misiones`, un fetch. */
const NOMBRA_MISION =
  /\b(elegirMisionesDelDia|cierreDelDia|avanzarMision|MISIONES_POR_DIA|TIPOS_DE_MISION|BONO_DIA_COMPLETO|mission_daily_summary|misionDelDia|misionesDelDia)\b/;

/** Una interfaz importada desde el motor: el motor no pinta nada. */
const MOTOR_IMPORTA_UI = /from\s+["'][^"']*\.(astro|svelte|vue|css)["']|from\s+["'][^"']*components?\//i;

const problemas = [];
const notas = [];
let revisados = 0;
let superficies = 0;

const fuentes = archivos(/\.(astro|tsx|jsx|svelte|vue|ts|js|mjs)$/).filter((f) => /^apps\//.test(f));

for (const archivo of fuentes) {
  revisados++;
  if (!esSuperficieDeReto(archivo)) continue;
  superficies++;
  const texto = sinComentarios(leer(archivo) ?? "");

  if (IMPORTA_MISION.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => IMPORTA_MISION.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: una superficie de reto activo importa el motor de misiones. #221: las ` +
        "misiones se anuncian al empezar la sesión y se resumen al terminarla, **nunca en medio**. " +
        "`mc-42` §3 mide que el estímulo irrelevante durante la tarea perjudica aunque no se " +
        "atienda, así que «es chiquito y está en la esquina» no es una defensa. Lo que un " +
        "componente no puede ver, no lo puede pintar.",
    );
  }

  if (NOMBRA_MISION.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => NOMBRA_MISION.test(l)) + 1;
    problemas.push(
      `${archivo}:${linea}: una superficie de reto activo nombra el estado de misión sin ` +
        "importarlo (una prop, un global, una consulta). El grafo de imports se puede rodear, y " +
        "esto es la otra mitad de #221: el reto no conoce la misión por ninguna vía, y menos aún " +
        "por una que ningún import delata.",
    );
  }
}

if (superficies === 0) {
  problemas.push(
    "no se encontró ninguna superficie de reto activo. Este auditor existiría en falso: revisar " +
      "cero pantallas y salir en verde es indistinguible de estar roto. Revisa " +
      "`SUPERFICIES_DE_RETO` — probablemente los componentes del reto se movieron de sitio.",
  );
}

// ─── Y el motor no pinta: es puro y no tiene texto de cara a nadie ───────────

if (existe(MODULO)) {
  revisados++;
  const texto = sinComentarios(leer(MODULO) ?? "");
  if (MOTOR_IMPORTA_UI.test(texto)) {
    problemas.push(
      `${MODULO} importa una interfaz. El motor de misiones es PURO: entra un perfil y un día, ` +
        "sale una decisión. Un componente importado desde aquí es el primer paso para que la " +
        "decisión y su dibujo vivan en el mismo sitio, y entonces #221 ya no se puede hacer " +
        "cumplir con el grafo de imports.",
    );
  }
} else {
  problemas.push(`${MODULO} no existe y este auditor comprueba que no importe interfaz.`);
}

notas.push(`${superficies} superficie(s) de reto activo revisadas por import y por nombre`);
notas.push(
  "`pages/api/` queda fuera a propósito: cerrar un reto tiene que poder avanzar el progreso en " +
    "el servidor. #221 prohíbe renderizar la misión, no contarla",
);

informar({
  nombre: "mision-silenciosa",
  problemas,
  notas,
  cita: "#211, #221, D-018, D-024, mc-42 §3, mc-17 §9",
  revisados,
  resumen: `${revisados} archivo(s) de la aplicación, ${superficies} de ellos superficie de reto`,
  porQueBloquea:
    "una insignia de misión durante la resolución reintroduce la presión evaluativa que el modo " +
    "PROBLEMA fue diseñado para quitar (D-018), y `mc-42` §3 mide que el estímulo irrelevante " +
    "degrada el recuerdo serial aunque no se atienda. No rompe nada: solo hace que se aprenda " +
    "peor, que es la clase de daño que ninguna prueba encuentra.",
  noComprueba: [
    "si la pantalla de FIN de reto muestra el resumen con buen gusto, o si el anuncio del " +
      "principio es demasiado largo. Eso es diseño y lo ve una persona o la flota adversarial.",
    "un texto de misión inyectado por otra vía (una cadena de locale reusada dentro del reto). " +
      "El grafo de imports no lo alcanza; el léxico sí, y le toca a la flota adversarial.",
  ],
});
