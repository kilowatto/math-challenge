#!/usr/bin/env node
// Auditor determinista — la voz es SALIDA, y no dice nada que no esté escrito
//
// Hace cumplir: línea roja #1 (nunca micrófono para un menor), línea roja #7
// (Larry nunca avergüenza), D-078.
//
// ─── Por qué existe ────────────────────────────────────────────────────────
//
// D-078 mete `speechSynthesis` en la pantalla del reto para que Larry hable en
// los siete idiomas. La API vecina —`SpeechRecognition`— se escribe casi igual,
// vive en el mismo objeto `window`, aparece en el mismo párrafo de cualquier
// tutorial, y **es el micrófono**. La línea roja #1 no la admite para un menor
// en ninguna banda; la enmienda de D-075 abrió la cámara para un ADULTO
// verificado y nada más.
//
// La distancia entre lo permitido y lo prohibido es aquí de una palabra. Ese es
// exactamente el sitio donde hace falta una máquina y no la buena intención de
// quien edita el archivo el mes que viene.
//
// ─── Las tres cosas que comprueba ──────────────────────────────────────────
//
//  1. **Ninguna API de entrada de audio o vídeo**, por nombre, en el código de
//     producto: `SpeechRecognition`, `getUserMedia`, `MediaRecorder`,
//     `AudioContext.createMediaStreamSource`. Los comentarios sí pueden
//     nombrarlas —este archivo mismo lo hace— así que se quitan antes de mirar.
//
//  2. **`decir()` nunca recibe un literal.** Si alguien escribiera
//     `decir("¡Uy, casi!")`, Larry tendría una voz que dice cosas que el
//     servidor no mandó y que nadie ve en pantalla: una superficie de tono sin
//     auditar, que es la línea roja #7 por la puerta de atrás. La voz lee
//     variables —el enunciado y el veredicto ya servidos— o no lee.
//
//  3. **Los controles de voz nacen escondidos.** `mc-42` §4: el inventario de
//     voces es propiedad del sistema operativo, así que un aparato puede no
//     tener ninguna de este idioma. La condición que puso D-077 —«la pantalla
//     tiene que decirlo»— se cumple mostrando el aviso y NO el botón. Un botón
//     de escuchar que no suena es peor que ningún botón.
//
// LO QUE NO PUEDE COMPROBAR: cómo suena. Que exista una voz `de-DE` instalada
// no dice que lea «einundzwanzig» bien (`mc-34`). Eso lo tiene que oír una
// persona por locale, y sigue pendiente — está escrito así en D-078.

import { archivos, leer, informar, SOLO_PRODUCTO } from "./lib/repo.mjs";

/** Entrada de audio o vídeo. Ninguna de éstas entra en este producto. */
const ENTRADA = [
  [/\bwebkitSpeechRecognition\b|\bSpeechRecognition\b/, "`SpeechRecognition` — es el MICRÓFONO, no la voz"],
  [/\bgetUserMedia\b/, "`getUserMedia` — cámara o micrófono"],
  [/\bMediaRecorder\b/, "`MediaRecorder` — graba audio o vídeo"],
  [/\bcreateMediaStreamSource\b/, "`createMediaStreamSource` — entrada de audio en vivo"],
];

/** Quita comentarios y cadenas: hablar de una API no es usarla. */
function soloCodigo(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");
}

const problemas = [];
const notas = [];

const todas = archivos(/\.(astro|ts|js|mjs)$/).filter((f) => SOLO_PRODUCTO.test(f));

/*
 * Los arneses de prueba SÍ nombran estas APIs, y tienen que hacerlo:
 * `packages/tutor/src/voz.prueba.mjs` comprueba que el módulo de voz no
 * exporte ninguna entrada de audio, y para eso necesita la lista de nombres
 * escrita. Un auditor que los prohibiera ahí prohibiría la prueba de la propia
 * línea roja.
 *
 * Se exime el ARCHIVO DE PRUEBA, no el patrón: si mañana alguien mete el
 * micrófono en `voz.prueba.mjs` de verdad, no lo atrapa esto — lo atrapa que
 * un `.prueba.mjs` no se sirve al navegador ni entra en el bundle.
 */
const ES_PRUEBA = /\.prueba\.mjs$/;
const fuentes = todas.filter((f) => !ES_PRUEBA.test(f));

// ─── 1. Ninguna API de entrada ─────────────────────────────────────────────
for (const archivo of fuentes) {
  const codigo = soloCodigo(leer(archivo) ?? "");
  for (const [re, nombre] of ENTRADA) {
    if (re.test(codigo)) {
      problemas.push(
        `${archivo}: usa ${nombre}. La línea roja #1 no admite micrófono ni biometría para un ` +
          "menor en ninguna banda, y D-075 abrió la cámara SOLO para un adulto verificado, bajo " +
          "acción explícita, jamás en una superficie donde pueda haber un menor. `speechSynthesis` " +
          "es salida y sí está permitido; esto no lo es.",
      );
    }
  }
}

// ─── 2. `decir()` nunca recibe un literal ──────────────────────────────────
let llamadas = 0;
for (const archivo of fuentes) {
  const codigo = soloCodigo(leer(archivo) ?? "");
  for (const m of codigo.matchAll(/\bdecir\s*\(\s*([^)]*)/g)) {
    llamadas++;
    const arg = m[1].trim();
    if (/^["'`]/.test(arg)) {
      problemas.push(
        `${archivo}: \`decir(${arg.slice(0, 40)}…)\` habla con un texto escrito aquí. La voz de ` +
          "Larry solo puede leer lo que el servidor ya sirvió y que ya está en pantalla — si dice " +
          "algo que no se ve, es una superficie de tono que nadie audita, y la línea roja #7 " +
          "(Larry nunca avergüenza) deja de poder comprobarse.",
      );
    }
  }
}

// ─── 3. Los controles nacen escondidos ─────────────────────────────────────
const PANTALLA = "apps/web/src/components/reto/Pantalla.astro";
const pantalla = leer(PANTALLA);
if (!pantalla) {
  problemas.push(`${PANTALLA}: no existe. Este auditor mira ahí y no puede aprobar a ciegas.`);
} else {
  const bloque = pantalla.match(/<div id="voz"[^>]*>/);
  if (!bloque) {
    problemas.push(
      `${PANTALLA}: no encuentro \`<div id="voz">\`. Si la voz se movió, este auditor quedó ` +
        "mirando a un sitio vacío — que es la forma en que un auditor empieza a aprobar siempre.",
    );
  } else if (!/\bhidden\b/.test(bloque[0])) {
    problemas.push(
      `${PANTALLA}: los controles de voz NO nacen con \`hidden\`. Se ofrecerían en un aparato sin ` +
        "voz instalada para este idioma, y tocarlos no haría nada (`mc-42` §4: el inventario de " +
        "voces es del sistema operativo). D-077 y D-078 exigen que la pantalla lo DIGA en ese caso.",
    );
  }
  if (!/id="voz-sin"/.test(pantalla)) {
    problemas.push(
      `${PANTALLA}: falta el aviso \`#voz-sin\`. Sin él, un aparato sin voz de este idioma se ` +
        "queda callado sin explicación — que es la condición que D-077 puso y D-078 mantuvo.",
    );
  }
}

// ─── 3b. El cliente y el contrato dicen lo mismo ───────────────────────────
/*
 * D-070: ninguna comprobación puede ser cierta por construcción. Aquí hay dos
 * fuentes de verdad de verdad independientes —`ETIQUETA_DE_VOZ` en
 * `packages/tutor/src/voz.ts` y la búsqueda de voz dentro del script inline— y
 * no pueden importarse una a la otra: `define:vars` implica `is:inline` y un
 * script inline no admite módulos (D-032). Así que la etiqueta viaja como
 * propiedad, y lo que se comprueba es que el cliente NO se la invente.
 */
const CONTRATO = "packages/tutor/src/voz.ts";
const contrato = leer(CONTRATO);
if (!contrato) {
  problemas.push(`${CONTRATO}: no existe. Es de donde sale la etiqueta de voz de cada locale.`);
} else if (!/ETIQUETA_DE_VOZ/.test(contrato)) {
  problemas.push(`${CONTRATO}: ya no exporta \`ETIQUETA_DE_VOZ\`.`);
} else if (!/"en"\s*:\s*"en-GB"/.test(contrato)) {
  problemas.push(
    `${CONTRATO}: \`ETIQUETA_DE_VOZ.en\` dejó de ser \`en-GB\`. El corpus inglés está autorado en ` +
      "ortografía británica («practising», «recognising»), y una voz que la lee con fonología " +
      "estadounidense es el detalle que un adulto oye y un niño imita.",
  );
}
if (pantalla) {
  const cuerpo = soloCodigo(pantalla);
  if (!/etiquetaVoz/.test(cuerpo)) {
    problemas.push(
      `${PANTALLA}: el script no usa \`etiquetaVoz\`. Si vuelve a calcular la etiqueta a partir ` +
        "del locale —un `slice(0, 2)`, por ejemplo— se come la decisión de `en-GB` sin que nadie " +
        "la revierta, y el contrato y la pantalla dejan de decir lo mismo.",
    );
  }
  // La búsqueda de voz tiene que ser de coincidencia EXACTA. `startsWith` o un
  // `slice` sobre la etiqueta son las dos formas de colar
  // `misma_lengua_otra_region` como si fuera un sí, que es exactamente lo que
  // `coberturaDeVoz()` devuelve aparte para que NO se cuele.
  const busqueda = cuerpo.match(/function buscarVoz\s*\([\s\S]*?\n    \}/);
  if (!busqueda) {
    problemas.push(`${PANTALLA}: no encuentro \`buscarVoz()\`. Este auditor quedó mirando al vacío.`);
  } else if (/startsWith|\.slice\s*\(/.test(busqueda[0])) {
    problemas.push(
      `${PANTALLA}: \`buscarVoz()\` acepta coincidencias PARCIALES de etiqueta. Una voz \`pt-BR\` ` +
        "leyendo texto `pt-PT` cambia la fonología de las vocales átonas y el niño aprende a decir " +
        "los números de otra manera. `coberturaDeVoz()` devuelve `misma_lengua_otra_region` como " +
        "categoría propia justo para que un `||` no la convierta en un sí.",
    );
  }
}

// ─── 4. Los cuatro rótulos, en los siete locales ───────────────────────────
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const CLAVES = ["juego.escuchar", "juego.vozActivada", "juego.vozDesactivada", "juego.sinVoz"];
for (const loc of LOCALES) {
  const crudo = leer(`apps/web/src/i18n/reto/${loc}.json`);
  if (!crudo) {
    problemas.push(`apps/web/src/i18n/reto/${loc}.json: no existe.`);
    continue;
  }
  let catalogo;
  try {
    catalogo = JSON.parse(crudo);
  } catch (e) {
    problemas.push(`apps/web/src/i18n/reto/${loc}.json: JSON inválido — ${e.message}`);
    continue;
  }
  for (const clave of CLAVES) {
    if (typeof catalogo[clave] !== "string" || catalogo[clave].trim() === "") {
      problemas.push(
        `apps/web/src/i18n/reto/${loc}.json: falta \`${clave}\`. La voz sale con los SIETE ` +
          "locales (D-078) — un rótulo que cae al respaldo en inglés le habla en inglés a un niño " +
          "que no lee inglés, que es peor que no tener el control.",
      );
    }
  }
}

notas.push(`${fuentes.length} archivo(s) de producto revisados, ${llamadas} llamada(s) a \`decir()\``);
notas.push(
  "`speechSynthesis` SÍ está permitido: es salida, y la enmienda de D-078 la mete a propósito. " +
    "Lo que este auditor cierra es la API vecina, que se escribe casi igual y es el micrófono.",
);

informar({
  nombre: "voz-solo-salida",
  problemas,
  notas,
  revisados: fuentes.length,
  resumen: `voz de salida en 7 locales, ${llamadas} llamada(s) a \`decir()\``,
  cita: "líneas rojas #1 y #7, D-075, D-077, D-078, mc-42 §4/§7",
  porQueBloquea:
    "Entre `speechSynthesis` y `SpeechRecognition` hay una palabra de distancia y una línea roja " +
    "de por medio. Y una voz que dice algo que no está en pantalla es tono sin auditar.",
  noComprueba: [
    "cómo suena. Que exista voz `de-DE` no dice que lea «einundzwanzig» bien (`mc-34`): eso lo " +
      "tiene que OÍR una persona por locale, y sigue pendiente.",
  ],
});
