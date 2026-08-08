#!/usr/bin/env node
// Auditor determinista — Rango y Nivel son dos ejes con dos nombres, y el
// Rango nunca ordena a nadie contra nadie.
//
// Hace cumplir: #195, D-003, D-017 (criterio #100), D-055, y la decisión de
// naming de 2026-08-03 (Q2: «Rango»; Q3: una sola escalera universal).
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// El producto tiene TRES ejes de progreso que un niño puede tener distintos el
// mismo día: Rango (XP acumulado, `xp_totals`, nunca baja — D-055), Nivel de
// dificultad (1–12, pedagógico, y su número no se le enseña a nadie — D-017) y
// el mapa (dominio por habilidad, `skill_state.mastered_at` — D-019). Un niño
// en Nivel 3 puede estar en Rango 12. Si una pantalla confunde los dos
// números, el defecto no es de redacción: es de arquitectura de información.
//
// Este auditor complementa a `mapa-sin-numero-de-nivel.mjs`, no lo duplica:
// aquél vigila el módulo del mapa; éste vigila el RESTO de la interfaz
// (todas las cadenas visibles, no solo las `mapa*`), el naming de los ejes y
// la regla de que el Rango jamás ordena competitivamente.
//
// ─── Qué comprueba ────────────────────────────────────────────────────────
//
//   1. NAMING (cadenas visibles, siete locales). Toda cadena que use la
//      palabra de un eje —«nivel/level/niveau/nível/stufe» o
//      «rango/rank/rang»— tiene que estar en la LISTA BLANCA ESCRITA A MANO de
//      abajo, con su justificación. Una cadena nueva con la palabra de un eje
//      bloquea el commit hasta que una persona escribe por qué es legítima.
//   2. EL NÚMERO DE NIVEL (D-017, #100). Ninguna cadena visible escribe
//      «Nivel 3» — palabra de dificultad seguida de cifra. Las excepciones con
//      cifra (todas en superficies del padre) también están escritas a mano.
//   3. EL RANGO NUNCA ORDENA (D-003, D-055). Ningún `ORDER BY` toca
//      `total_xp` ni una columna `rango`; ningún `.sort()` de pantalla ordena
//      por `rango`; y `xp_totals` jamás gana una columna `theme_band` o
//      `period` — sin banda, la comparación entre bandas es imposible por
//      construcción.
//   4. PLANTILLAS. Ningún componente de las superficies de juego interpola
//      algo llamado `nivel`/`level`, ni escribe «Nivel 3» a mano.
//
// ─── La segunda fuente, escrita A MANO (D-070) ────────────────────────────
//
// La lista blanca NO se deriva del código que se audita: está escrita abajo,
// clave por clave, diciendo DÓNDE se pinta cada una y POR QUÉ es legítima. Si
// la leyéramos del mismo archivo que usa la interfaz, el auditor no podría
// fallar nunca — ya pasó dos veces en este repo (D-070).
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Que una clave permitida se pinte donde su justificación dice. Eso es un
//    llamador, y los llamadores los vigila `funcion-sin-llamar.mjs`.
//  · Marketing y contenido público (`i18n/paginas/`, como la página /niveles/
//    que SÍ publica la escalera N1–N12), los prefijos de Larry (`i18n/larry/`)
//    y los nombres hablados de los números (`i18n/voz/`): no son cadenas de la
//    interfaz de juego.
//  · Que «Rango 12» se muestre con buena tipografía. Eso es la guía de estilo.
//
// ─── La enmienda de D-183 (2026-08-06) ─────────────────────────────────────
//
// SERIO y PRIMARIA ya pueden elegir su nivel — cualitativo, nunca un número —
// y KINDER no se tocó: sigue exactamente donde estaba. El chequeo 4 (las
// plantillas) reconoce esa enmienda por DOS identificadores, escritos a mano
// y no derivados: `puedeElegirNivel` (el portón real contra la banda en D1,
// en las páginas que ofrecen el selector) y `nivelFijo` (el prop que
// `Pantalla.astro` reenvía tal cual, sin saber de bandas — la gatea siempre
// quien la llama, nunca ella). Un archivo que interpola «nivel» sin ninguno
// de los dos al lado sigue bloqueando el commit, igual que antes de D-183.
// El número CIFRADO sigue prohibido sin excepción, con o sin marca.

import { archivos, leer, informar, sinComentarios, sqlSinComentarios, conFronteraUnicode } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

// ─── Las palabras de los ejes, con frontera Unicode ────────────────────────
//
// `\b` de JavaScript solo conoce ASCII: no encuentra «Nível» ni «Niveau», y
// «Stufe» dentro de «Altersstufen» (grupos de EDAD, no el eje) daría un falso
// positivo sin frontera de verdad. `conFronteraUnicode()` repara las dos cosas.
// La lista de formas está escrita a mano, locale por locale (mc-34: es-MX no es
// es-ES, pt-BR no es pt-PT — y las cadenas se autoran, no se traducen).
const PALABRA_NIVEL = new RegExp(
  conFronteraUnicode("\\b(?:nivel|n[ií]vel|niveles|n[ií]veles|niveau|niveaux|level|levels|stufe|stufen)\\b"),
  "iu",
);
const PALABRA_RANGO = new RegExp(
  conFronteraUnicode("\\b(?:rango|rangos|rank|ranks|rang|rangs|ränge)\\b"),
  "iu",
);
/** «Nivel 3», «Level 2», «Niveau 4», «Nível 1», «Stufe 5». */
const NIVEL_CON_CIFRA = new RegExp(
  conFronteraUnicode("\\b(?:nivel|n[ií]vel|niveles|n[ií]veles|niveau|niveaux|level|levels|stufe|stufen)\\b") +
    "\\s*[:#]?\\s*\\d",
  "iu",
);

// ─── La lista blanca, ESCRITA A MANO (segunda fuente, D-070) ───────────────
//
// Cada entrada dice dónde se pinta la clave y por qué puede nombrar un eje.
// TODAS son superficies del padre o públicas; ninguna es una pantalla del
// niño. `conCifra: true` permite además el número (D-017 sigue aplicando a
// toda superficie del niño — por eso ninguna de estas lo es).
const LISTA_BLANCA = [
  {
    clave: "navLevels",
    conCifra: false,
    porQue:
      "etiqueta del nav PÚBLICO hacia la página /niveles/ (layouts/Base.astro). La página de " +
      "marketing sí explica la escalera al padre; lo que D-017 prohíbe es enseñar al niño SU nivel.",
  },
  {
    clave: "intro",
    conCifra: false,
    porQue:
      "portada pública: «una prueba de nivel adaptativa fija la dificultad». Explica el sistema " +
      "al visitante adulto; no es una pantalla del niño.",
  },
  {
    clave: "p3",
    conCifra: false,
    porQue:
      "portada pública, promesa de privacidad: «nunca cámara… a nadie, en ningún nivel». Uso no-eje " +
      "(equivale a «bajo ninguna circunstancia»), y público.",
  },
  {
    clave: "markAgeVsDifficulty",
    conCifra: true,
    porQue:
      "marca de D-026 al PADRE en PerfilNuevo.astro: explica que edad y dificultad son dos ejes, " +
      "con «nivel 2 / nivel 5» como EJEMPLOS. Es la pantalla donde la distinción se enseña; quitarla " +
      "sería esconder la regla justo donde se explica.",
  },
  {
    clave: "practicarAviso",
    conCifra: false,
    porQue:
      "pantalla del adulto solo (/app/practicar/): «los niveles de adulto están planeados, no " +
      "construidos». Lector adulto, uso descriptivo.",
  },
  {
    clave: "profileThemeLevels",
    conCifra: false,
    porQue:
      "al padre en PerfilNuevo.astro: el rango de niveles que cubre cada TEMA VISUAL («Niveles " +
      "{min}–{max}» sale de `nivelesDe()`, la única tabla), no el nivel del niño. El padre elige el " +
      "tema; el niño nunca ve esta pantalla.",
  },
  {
    clave: "profileThemeHelp",
    conCifra: false,
    porQue:
      "al padre en PerfilNuevo.astro: explica mover el TEMA visual una banda arriba o abajo (en " +
      "de-DE, «eine Stufe»). Mismo lector y mismo motivo que profileThemeLevels.",
  },
];

// ─── Alcance de las cadenas visibles ───────────────────────────────────────
//
// Escrito a mano: los archivos de mensajes de la INTERFAZ DE JUEGO. Fuera
// quedan `paginas/` (marketing público, como /niveles/), `larry/` (prefijos de
// modelo, no UI) y `voz/` (nombres hablados de los números).
const ARCHIVOS_DE_CADENAS = [
  ...LOCALES.map((l) => `apps/web/src/i18n/${l}.json`),
  ...["racha", "liga", "reto", "misiones", "push", "limite-pantalla"].flatMap((dir) =>
    LOCALES.map((l) => `apps/web/src/i18n/${dir}/${l}.json`),
  ),
];

const problemas = [];
const notas = [];
let revisados = 0;

// Recorre un JSON de mensajes y devuelve [rutaDeClave, valor] planos.
function pares(obj, prefijo = "") {
  const salida = [];
  for (const [k, v] of Object.entries(obj)) {
    const ruta = prefijo ? `${prefijo}.${k}` : k;
    if (typeof v === "string") salida.push([ruta, v]);
    else if (v && typeof v === "object") salida.push(...pares(v, ruta));
  }
  return salida;
}

const permitida = (ruta) => {
  const ultimoTramo = ruta.split(".").pop();
  return LISTA_BLANCA.find((e) => e.clave === ruta || e.clave === ultimoTramo) ?? null;
};

const clavesVistas = new Set();

// ─── 1 y 2. Naming y número de nivel, en los siete locales ────────────────

for (const ruta of ARCHIVOS_DE_CADENAS) {
  const crudo = leer(ruta);
  if (crudo === null) {
    problemas.push(`${ruta} no existe. Son siete locales por cada superficie (D-022).`);
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

  for (const [clave, valor] of pares(textos)) {
    if (clave.startsWith("_")) continue; // `_locale`, `_nota`: metadatos, no se pintan.
    const entrada = permitida(clave);
    if (entrada) clavesVistas.add(entrada.clave);

    const diceNivel = PALABRA_NIVEL.test(valor);
    const diceRango = PALABRA_RANGO.test(valor);
    if (!diceNivel && !diceRango) continue;

    if (!entrada) {
      problemas.push(
        `${ruta} · ${clave}: «${valor}» nombra un eje de progreso sin estar en la lista blanca. ` +
          "«Rango» solo nombra el XP y «Nivel» solo la dificultad (D-017, D-055, #195): si esta " +
          "cadena es legítima, escribe su justificación a mano en audits/rango-vs-nivel.mjs — " +
          "y si la pantalla es del niño, la respuesta casi seguro es que no.",
      );
      continue;
    }
    if (diceNivel && NIVEL_CON_CIFRA.test(valor) && !entrada.conCifra) {
      problemas.push(
        `${ruta} · ${clave}: «${valor}» enseña un número de nivel. D-017 y el criterio #100: el ` +
          "número de nivel no se le enseña a nadie; se dice qué se está practicando. " +
          "mapa-sin-numero-de-nivel vigila el mapa; este auditor vigila el resto de la interfaz.",
      );
    }
  }
}

// Una entrada de lista blanca que ya no existe en ningún locale es una
// excepción rancia: se borra, no se hereda. Misma regla que `separarDeuda()`.
for (const entrada of LISTA_BLANCA) {
  if (!clavesVistas.has(entrada.clave)) {
    problemas.push(
      `la entrada de lista blanca «${entrada.clave}» ya no corresponde a ninguna cadena de los ` +
        "siete locales. Bórrala del auditor: una lista de excepciones que nadie vacía es cómo un " +
        "gate se apaga sin que nadie lo decida.",
    );
  }
}

// ─── 3. El Rango nunca ordena (D-003, D-055) ───────────────────────────────
//
// `xp_totals` no tiene `theme_band` a propósito (0007): sin banda, ordenar por
// Rango ENTRE bandas es imposible por construcción. Las tres formas de romperlo:
// un ORDER BY sobre total_xp, un .sort() por `rango` en una pantalla, o una
// migración que le añada banda o período a la tabla.
const PRODUCTO = archivos(/^(apps|packages|migrations)\/.*\.(ts|mjs|sql|astro)$/);
const ORDER_POR_XP = /ORDER\s+BY[^;"'`]{0,120}?\b(total_xp|rango)\b/i;
const SORT_POR_RANGO = /\.sort\s*\([^)]{0,120}?\brango\b/is;

for (const f of PRODUCTO) {
  revisados++;
  const texto = f.endsWith(".sql") ? sqlSinComentarios(leer(f) ?? "") : sinComentarios(leer(f) ?? "");

  const orden = texto.match(ORDER_POR_XP);
  if (orden) {
    problemas.push(
      `${f} ordena por «${orden[1]}». El Rango es progreso personal (D-055): nunca es criterio de ` +
        "ordenamiento competitivo, y entre bandas lo prohíbe D-003 — un Rango 10 de KINDER y uno de " +
        "SERIO no son el mismo esfuerzo. El orden competitivo es de los puntos (`score_totals`), " +
        "nunca del XP.",
    );
  }
  if (!f.endsWith(".sql")) {
    const sort = texto.match(SORT_POR_RANGO);
    if (sort) {
      problemas.push(
        `${f} ordena una colección por \`rango\` en cliente. Es la misma violación que el ORDER BY: ` +
          "convierte el eje personal en ranking (D-003, D-055, #195).",
      );
    }
  }
}

// La tabla, en las migraciones: ni banda ni período, hoy y siempre.
for (const f of archivos(/^migrations\/.*\.sql$/)) {
  const sql = sqlSinComentarios(leer(f) ?? "");
  if (!/xp_totals/i.test(sql)) continue;
  revisados++;
  const create = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?xp_totals\s*\(([^;]*)\)/i);
  if (create && /\b(theme_band|period)\b/i.test(create[1])) {
    problemas.push(
      `${f} le da a \`xp_totals\` una columna de banda o período. La tabla no la tiene A PROPÓSITO ` +
        "(0007, D-055): con banda, ordenar por Rango entre bandas pasa de imposible a tentador, y " +
        "con período el XP dejaría de ser de por vida. Las dos cruzan D-003 y D-055.",
    );
  }
  for (const alter of sql.matchAll(/ALTER\s+TABLE\s+xp_totals\b[^;]*/gi)) {
    if (/\b(theme_band|period)\b/i.test(alter[0])) {
      problemas.push(
        `${f} altera \`xp_totals\` para añadir banda o período. Ver arriba: es la puerta a la ` +
          "comparación entre bandas que D-003 prohíbe (#195).",
      );
    }
  }
}

// ─── 4. Las plantillas de las superficies de juego ─────────────────────────
//
// Alcance escrito a mano: los componentes del juego y las pantallas del área
// de la app. Fuera: `components/paginas/` y las páginas públicas, que son
// superficies del padre o marketing (y cuyas cadenas pasan por la lista
// blanca de arriba).
const PLANTILLAS = archivos(
  /^apps\/web\/src\/(components\/(mapa|racha|misiones|reto)\/|pages\/\[locale\]\/app\/).*\.astro$/,
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
  const interpolaNivel = /\{[^}]*\b(nivel|level)\b[^}]*\}/i.test(texto);
  const gateadoPorEnmiendaD183 = /\b(puedeElegirNivel|nivelFijo)\b/.test(texto);
  if (interpolaNivel && !gateadoPorEnmiendaD183) {
    problemas.push(
      `${f} interpola algo llamado \`nivel\`/\`level\` sin pasar por \`puedeElegirNivel\`/\`nivelFijo\` ` +
        "(D-183). Ningún modelo de vista de las pantallas de juego trae el nivel por su cuenta " +
        "(D-017, #100): si aquí hay uno sin ese portón, salió de otra parte y va a llegar a una " +
        "pantalla sin que nadie haya comprobado la banda.",
    );
  }
}

notas.push(`${ARCHIVOS_DE_CADENAS.length} archivos de cadenas, ${PLANTILLAS.length} plantillas y ${PRODUCTO.length} archivos de producto revisados`);
notas.push(`lista blanca escrita a mano: ${LISTA_BLANCA.length} claves, todas en superficies del padre o públicas`);

informar({
  nombre: "rango-vs-nivel",
  problemas,
  notas,
  cita: "#195, D-003, D-017 (criterio #100), D-055, decisión de naming 2026-08-03",
  revisados,
  resumen: `${revisados} archivos revisados`,
  porQueBloquea:
    "un niño puede estar en Nivel 3 de dificultad y en Rango 12 de XP el mismo día. Si la interfaz " +
    "confunde los dos números —o si el Rango se vuelve ranking— el defecto no es de redacción, es de " +
    "arquitectura de información, y `mc-10` mide lo que esa presión le hace al desempeño en matemáticas.",
  noComprueba: [
    "que una clave permitida se pinte donde su justificación dice (los llamadores los vigila " +
      "funcion-sin-llamar.mjs).",
    "marketing y contenido público (i18n/paginas/, que incluye la página /niveles/ que SÍ publica " +
      "la escalera), prefijos de Larry y nombres hablados de números (i18n/larry/, i18n/voz/).",
    "el mapa como módulo: lo vigila mapa-sin-numero-de-nivel.mjs; este auditor cubre el resto de la interfaz.",
  ],
});
