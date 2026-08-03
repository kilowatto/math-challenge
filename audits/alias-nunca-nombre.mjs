#!/usr/bin/env node
// Auditor determinista — en una superficie social, siempre alias, jamás nombre
//
// Hace cumplir: **línea roja #2** («el niño nunca es un usuario… no se pide
// nombre real, correo, foto ni fecha exacta de nacimiento»), D-003, D-040,
// D-081, `mc-25` (recital 26: un alias con mapeo sigue siendo dato personal),
// `mc-43`, e issues #237 y #239.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// D-081 lo repite aunque ya estuviera dicho: «**siempre alias generado, jamás
// nombre**». Que haga falta repetirlo es el dato: una liga y un tablero son las
// dos primeras superficies del producto donde una persona ve a OTRA, y la
// tentación de «pon el nombre, que se entiende mejor» aparece en la primera
// pantalla que alguien maquete.
//
// El generador ya existe —`packages/motor/src/alias.ts`, con sus siete listas
// autoradas por locale y su lista de bloqueo sobre la CADENA COMBINADA— y este
// auditor vigila las dos mitades:
//
//   1. Que ninguna superficie social nombre un campo de identidad real.
//   2. Que **no aparezca un segundo generador**. Dos generadores es cómo una de
//      las dos listas de bloqueo se queda sin el «Pato Loco» del criterio, y la
//      lista que falla es siempre la que nadie recuerda que existe.
//
// ─── El detalle que el criterio subraya y es fácil hacer mal ──────────────
//
// La lista de bloqueo se comprueba sobre la cadena YA FORMADA, no palabra por
// palabra: «Pato» y «Loco» son inocentes por separado. Aquí se verifica
// ejecutando el módulo, no leyéndolo — un `aliasPermitido` que mirara las
// palabras sueltas pasaría cualquier inspección estática.
//
// LO QUE NO PUEDE COMPROBAR: si una lista de alias contiene, en algún locale,
// una combinación ofensiva que nadie previó. Eso es revisión humana por locale
// (D-022) y la flota adversarial.

import { archivos, leer, informar, SOLO_PRODUCTO, sinComentarios, palabra } from "./lib/repo.mjs";

/** Qué es «una superficie social»: donde alguien ve a otro. */
const SOCIAL = /(liga|league|duel|duelo|tablero|leaderboard|club)/i;

/**
 * Campos de identidad real. Ninguno puede aparecer en una superficie social,
 * ni como columna, ni como propiedad, ni dentro de una consulta.
 */
const IDENTIDAD = [
  ["email", "el correo — línea roja #2, y de un menor ni siquiera se pide"],
  ["correo", "el correo — línea roja #2"],
  ["first_name", "el nombre real"],
  ["last_name", "el apellido"],
  ["full_name", "el nombre completo"],
  ["display_name", "un nombre escrito por alguien — el alias se GENERA (D-003)"],
  ["real_name", "el nombre real"],
  ["nombre_real", "el nombre real"],
  ["photo", "una foto — línea roja #1 y #2"],
  ["foto", "una foto — líneas rojas #1 y #2"],
  ["avatar_url", "una imagen subida; el avatar se arma de piezas del catálogo (mc-43)"],
  ["birth_date", "la fecha exacta de nacimiento — línea roja #2"],
  ["birth_month", "el mes de nacimiento — D-053 lo retiró del producto"],
];

const problemas = [];
const notas = [];

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro|sql)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => SOCIAL.test(f))
  .filter((f) => !/\.prueba\.mjs$/.test(f));

for (const archivo of fuentes) {
  const texto = sinComentarios(leer(archivo) ?? "");
  for (const [campo, que] of IDENTIDAD) {
    if (palabra(campo).test(texto)) {
      problemas.push(
        `${archivo}: nombra \`${campo}\` — ${que}. D-081: siempre alias generado, jamás nombre. ` +
          "Y `mc-25` recital 26: un alias sigue siendo dato personal mientras nosotros " +
          "guardemos el mapeo, así que «anónimo hacia afuera» no es «anónimo».",
      );
    }
  }
}

// ─── Un solo generador de alias ─────────────────────────────────────────────
//
// `generarAlias` solo puede DECLARARSE en `packages/motor/src/alias.ts`.
// Llamarla desde donde sea es correcto y no se cuenta.

const FUENTE_UNICA = "packages/motor/src/alias.ts";
const declaradores = [];

for (const archivo of archivos(/\.(ts|tsx|js|jsx|mjs)$/).filter((f) => SOLO_PRODUCTO.test(f))) {
  const texto = sinComentarios(leer(archivo) ?? "");
  if (/export\s+(?:async\s+)?function\s+generarAlias\b/.test(texto)) declaradores.push(archivo);
}

if (declaradores.length === 0) {
  problemas.push(
    `nadie declara \`generarAlias\`. Debería estar en ${FUENTE_UNICA} — si se movió, este ` +
      "auditor está mirando al vacío, que es peor que bloquear.",
  );
} else if (declaradores.length > 1 || declaradores[0] !== FUENTE_UNICA) {
  problemas.push(
    `hay ${declaradores.length} generador(es) de alias: ${declaradores.join(", ")}. #239 lo pide ` +
      `con estas palabras: «el generador se reusa tal cual para adultos — no se escribe un ` +
      `segundo generador». Dos generadores es cómo una de las dos listas de bloqueo se queda ` +
      "sin la combinación del criterio, y la que falla es la que nadie recuerda que existe.",
  );
}

// ─── La lista de bloqueo se comprueba sobre la CADENA COMBINADA ─────────────
//
// Se EJECUTA el módulo. Un `aliasPermitido` que mirara palabra por palabra
// pasaría cualquier inspección estática y dejaría entrar «Pato Loco», que es el
// ejemplo literal del criterio #115.

const alias = await import("../packages/motor/src/alias.ts").catch(() => null);
if (!alias) {
  problemas.push(`no pude importar ${FUENTE_UNICA} para ejercitar su lista de bloqueo.`);
} else {
  const locales = alias.localesConLista();
  if (locales.length !== 7) {
    problemas.push(
      `el generador tiene ${locales.length} listas y los locales del lanzamiento son 7 (D-022). ` +
        "Un locale sin lista es un locale sin alias, y la superficie social se queda sin velo.",
    );
  }
  // La combinación del criterio: dos palabras inocentes que juntas no lo son.
  if (alias.aliasPermitido("PatoLoco1234", "es-MX")) {
    problemas.push(
      "`aliasPermitido` deja pasar «PatoLoco» en es-MX. El criterio #115 lo da como ejemplo " +
        "literal: la comprobación se hace sobre la CADENA COMBINADA, no palabra por palabra, " +
        "porque cada palabra por separado es inocente.",
    );
  }
  // Y con acento y separador, que es el primer truco que alguien prueba.
  if (alias.aliasPermitido("Pató-loco 42", "es-MX")) {
    problemas.push(
      "`aliasPermitido` deja pasar «Pató-loco»: la normalización no está quitando acentos ni " +
        "signos antes de comparar. Esquivar una lista de bloqueo con un acento es el primer " +
        "truco que alguien prueba.",
    );
  }
  // El sufijo sale del ALEATORIO inyectado, nunca de un contador (mc-43
  // implicación 12). Se comprueba de la única forma que puede fallar de verdad:
  // dos llamadas con la MISMA fuente de azar tienen que dar el mismo alias. Un
  // contador secuencial daría dos distintos, y ahí se delata — mientras que
  // leer el código buscando «++» no distingue un contador de un índice de bucle.
  const conFuente = (v) => {
    let i = 0;
    return alias.generarAlias("en", () => v[i++ % v.length]).alias;
  };
  const a1 = conFuente([0.1, 0.2, 0.3]);
  const a2 = conFuente([0.1, 0.2, 0.3]);
  const a3 = conFuente([0.7, 0.4, 0.9]);
  if (a1 !== a2) {
    problemas.push(
      `dos alias con la misma fuente de azar salieron distintos (${a1} ≠ ${a2}): hay estado ` +
        "que no viene del `aleatorio` inyectado. `mc-43` implicación 12: un sufijo secuencial " +
        "delata el orden de registro, y es un censo que nadie pidió publicar.",
    );
  }
  if (a1 === a3) {
    problemas.push(
      `dos alias con fuentes de azar distintas salieron iguales (${a1}): el sufijo no depende ` +
        "del azar, así que es fijo o derivado de otra cosa.",
    );
  }
  notas.push(`${locales.length} locales con lista propia, autorada — nunca una traducida siete veces`);
}

notas.push(`${fuentes.length} archivo(s) de superficie social sin un solo campo de identidad real`);
notas.push(`un solo generador de alias: ${FUENTE_UNICA}`);

informar({
  nombre: "alias-nunca-nombre",
  problemas,
  notas,
  cita: "línea roja #2, D-003, D-040, D-081, mc-25, mc-43, #237, #239",
  revisados: fuentes.length + 1,
  resumen: `${fuentes.length} superficie(s) social(es) · generador único ejercitado`,
  porQueBloquea:
    "una liga y un tablero son las dos primeras superficies donde una persona ve a OTRA, y " +
    "«pon el nombre, que se entiende mejor» aparece en la primera pantalla que alguien maquete.",
  noComprueba: [
    "si alguna lista contiene una combinación ofensiva que nadie previó. Eso es revisión " +
      "humana por locale (D-022) y la flota adversarial.",
  ],
});
