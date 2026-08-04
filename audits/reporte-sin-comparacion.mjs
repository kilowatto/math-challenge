#!/usr/bin/env node
// Auditor determinista — el reporte al padre NUNCA compara (F8 #292)
//
// Hace cumplir: D-025, línea roja #7, mc-18 (la comparación pública o
// implícita como riesgo documentado), #286 §5.
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// El correo de reportes junta a todos los hijos de un hogar en un solo
// documento que lee un adulto. Esa es exactamente la superficie donde una
// comparación se cuela sin que nadie la escriba: un orden por puntos, un
// «va mejor que», un promedio del hogar. Kluger & DeNisi midieron 607
// tamaños de efecto y más de un TERCIO de las retroalimentaciones normativas
// EMPEORÓ el desempeño — comparar no es neutro, es dañino.
//
// ─── Qué vigila, concretamente ─────────────────────────────────────────────
//
//  1. `packages/motor/src/reportes.ts` (sin comentarios):
//     · `AVG(`, `PERCENT_RANK` — agregados entre niños.
//     · Léxico de comparación en el código (percentil, promedio, …).
//     · Cualquier resta o comparación sobre los campos de SALIDA de una
//       `SeccionHijo` (`puntosGanados`, `xpGanado`, `rachaActual`, …): el
//       motor solo puede restar un hijo contra SU PROPIO snapshot, que vive
//       en campos de ENTRADA (`scoreAllTime`, `lastScoreAllTime`). Un
//       operador aritmético o de comparación pegado a un campo de salida es
//       una comparación entre hermanos en construcción.
//     · Cualquier `.sort(` cuyo comparador no use `localeCompare`: el orden
//       de `hijos` es alfabético o es una tabla de posiciones dibujada.
//  2. `apps/web/src/i18n/reportes/*.json`: el léxico de comparación,
//     autorado por locale (las construcciones no se traducen, mismo criterio
//     que `racha-lexico.mjs`).
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Una comparación que no use estas palabras ni estos campos («el correo
//    de esta semana te va a encantar» dicho a un padre competitivo). Es un
//    cable trampa, no un juez: el hueco lo cubren la carta adversarial
//    `anti-humillacion` (cuyo `alcance` se amplió a `/reporte|informe/i` en
//    este mismo PR) y la revisión humana por locale.
//  · El orden VISUAL final en el cliente de correo. Lo que se garantiza aquí
//    es que el motor ordena por alias y la plantilla no reordena; el render
//    lo revisa la matriz manual de #291.

import { existsSync, readFileSync } from "node:fs";
import { informar, RAIZ, sinComentarios, conFronteraUnicode } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const MOTOR = "packages/motor/src/reportes.ts";
const DIR_PLANTILLAS = "apps/web/src/i18n/reportes";

const problemas = [];
const notas = [];
let revisados = 0;

// ─── El léxico de comparación, autorado por locale ─────────────────────────
//
// Las construcciones no se traducen: «par rapport à» en francés es comparación
// y «rapport» a secas no lo es. Cada entrada lleva su `porque` para que el
// hallazgo diga QUÉ categoría cruzó, no solo que cruzó.
const LEXICO = {
  en: [
    ["better than", "mejor que otro"],
    ["worse than", "peor que otro"],
    ["other children", "los demás niños"],
    ["other kids", "los demás niños"],
    ["compared to", "comparación explícita"],
    ["average", "promedio entre niños"],
    ["percentile", "percentil"],
  ],
  "es-MX": [
    ["mejor que", "mejor que otro"],
    ["peor que", "peor que otro"],
    ["otros niños", "los demás niños"],
    ["otras niñas", "los demás niños"],
    ["promedio", "promedio entre niños"],
    ["percentil", "percentil"],
    ["que su hermano", "comparación entre hermanos"],
    ["que su hermana", "comparación entre hermanos"],
  ],
  "es-ES": [
    ["mejor que", "mejor que otro"],
    ["peor que", "peor que otro"],
    ["otros niños", "los demás niños"],
    ["otras niñas", "los demás niños"],
    ["promedio", "promedio entre niños"],
    ["percentil", "percentil"],
    ["que su hermano", "comparación entre hermanos"],
    ["que su hermana", "comparación entre hermanos"],
  ],
  "fr-FR": [
    ["mieux que", "mejor que otro"],
    ["pire que", "peor que otro"],
    ["autres enfants", "los demás niños"],
    ["par rapport", "comparación explícita"],
    ["moyenne", "promedio entre niños"],
    ["percentile", "percentil"],
  ],
  "pt-BR": [
    ["melhor que", "mejor que otro"],
    ["pior que", "peor que otro"],
    ["outras crianças", "los demás niños"],
    ["em comparação", "comparación explícita"],
    ["média", "promedio entre niños"],
    ["percentil", "percentil"],
  ],
  "pt-PT": [
    ["melhor que", "mejor que otro"],
    ["pior que", "peor que otro"],
    ["outras crianças", "los demás niños"],
    ["em comparação", "comparación explícita"],
    ["média", "promedio entre niños"],
    ["percentil", "percentil"],
  ],
  "de-DE": [
    ["besser als", "mejor que otro"],
    ["schlechter als", "peor que otro"],
    ["andere Kinder", "los demás niños"],
    ["im Vergleich", "comparación explícita"],
    ["Durchschnitt", "promedio entre niños"],
    ["Perzentil", "percentil"],
  ],
};

// ─── 1. El motor puro ───────────────────────────────────────────────────────

const rutaMotor = `${RAIZ}${MOTOR}`;
if (!existsSync(rutaMotor)) {
  problemas.push(
    `falta ${MOTOR} — el auditor nació con el motor (#288) y un auditor sin su ` +
      "archivo vigila nada.",
  );
} else {
  const codigo = sinComentarios(readFileSync(rutaMotor, "utf8"));
  revisados++;

  // 1a. Agregados entre niños.
  for (const [re, que] of [
    [/\bAVG\s*\(/i, "AVG("],
    [/\bPERCENT_RANK\b/i, "PERCENT_RANK"],
  ]) {
    if (re.test(codigo)) {
      problemas.push(
        `${MOTOR}: aparece ${que}. El reporte NO agrega entre niños: cada sección se ` +
          "construye solo con la fila de ese hijo y su propio snapshot (D-025, mc-18).",
      );
    }
  }

  // 1b. Léxico de comparación en el código (en cualquier idioma: el código se
  // escribe en inglés pero el comentario de un futuro cambio puede no estarlo).
  for (const lista of Object.values(LEXICO)) {
    for (const [patron, porque] of lista) {
      const re = new RegExp(conFronteraUnicode(patron.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "iu");
      if (re.test(codigo)) {
        problemas.push(
          `${MOTOR}: léxico de comparación — "${patron}" (${porque}). D-025 y mc-18: el ` +
            "reporte nunca compara, ni entre hermanos ni contra ninguna media.",
        );
      }
    }
  }

  // 1c. Aritmética o comparación sobre campos de SALIDA de una SeccionHijo.
  //
  // La única resta legítima del motor es de un hijo contra SU PROPIO snapshot,
  // y vive en campos de ENTRADA (`scoreAllTime - lastScoreAllTime`). Los campos
  // de salida (`puntosGanados`, …) solo se ASIGNAN y se LEEN para pintar: un
  // operador pegado a uno de ellos es una comparación entre hermanos en
  // construcción.
  const CAMPOS_SALIDA = [
    "puntosGanados",
    "xpGanado",
    "rachaActual",
    "rachaMaxima",
    "puntosTotales",
    "minutosPracticados",
    "diasActivos",
    "repasosPendientes",
  ];
  for (const campo of CAMPOS_SALIDA) {
    const re = new RegExp(`\\.${campo}\\s*(?:[-+*/<>=!]=?|==(?!=))`);
    if (re.test(codigo)) {
      problemas.push(
        `${MOTOR}: \`.${campo}\` aparece en una operación aritmética o de comparación. ` +
          "Los campos de salida se asignan y se leen, nunca se operan: la única resta " +
          "legítima es de un hijo contra su propio snapshot, y vive en los campos de " +
          "ENTRADA. Esto es una comparación entre hermanos en construcción (D-025).",
      );
    }
  }

  // 1d. Todo `.sort(` del motor tiene que ordenar por `localeCompare`.
  for (const m of codigo.matchAll(/\.sort\s*\(([^)]*\{[^}]*\}|[^)]*=>[^)]*)\)/g)) {
    if (!/localeCompare/.test(m[1])) {
      problemas.push(
        `${MOTOR}: hay un \`.sort()\` que no ordena por \`localeCompare\`. El orden de ` +
          "`hijos` es alfabético o es una tabla de posiciones dibujada sin números — " +
          "y una tabla de posiciones ES la comparación prohibida (D-025, #288).",
      );
    }
  }
}

// ─── 2. Las plantillas, locale por locale ───────────────────────────────────

let cadenas = 0;
for (const loc of LOCALES) {
  const ruta = `${RAIZ}${DIR_PLANTILLAS}/${loc}.json`;
  if (!existsSync(ruta)) {
    problemas.push(
      `falta ${DIR_PLANTILLAS}/${loc}.json — el locale ${loc} no tiene plantilla de ` +
        "reporte (D-022). Los siete locales se autoran, no se traducen.",
    );
    continue;
  }
  let textos;
  try {
    textos = JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    problemas.push(`${DIR_PLANTILLAS}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
    continue;
  }
  revisados++;

  for (const [clave, valor] of Object.entries(textos)) {
    for (const cadena of Array.isArray(valor) ? valor : [valor]) {
      if (typeof cadena !== "string") continue;
      cadenas++;
      for (const [patron, porque] of LEXICO[loc]) {
        const re = new RegExp(conFronteraUnicode(patron.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "iu");
        if (re.test(cadena)) {
          problemas.push(
            `${DIR_PLANTILLAS}/${loc}.json · ${clave}: léxico de comparación — "${cadena}". ` +
              `Categoría: ${porque}. D-025 y mc-18: el reporte lista lo logrado, nunca ` +
              "compara — ni entre hermanos, ni contra la semana anterior, ni «va peor».",
          );
        }
      }
    }
  }
}

// ─── 3. La autocomprobación (D-070) ─────────────────────────────────────────
//
// Ninguna comprobación de este auditor puede ser cierta por construcción: un
// léxico que no caza su propia construcción canónica pasa TODO en verde y se
// ve idéntico a uno que funciona. Cada control lleva la forma natural de
// decir la comparación en ese locale.
const CONTROLES = {
  en: "He did better than his sister",
  "es-MX": "Le fue mejor que a su hermano",
  "es-ES": "Le fue mejor que a su hermano",
  "fr-FR": "Il a fait mieux que sa sœur",
  "pt-BR": "Ele foi melhor que o irmão",
  "pt-PT": "Ele foi melhor que o irmão",
  "de-DE": "Er war besser als seine Schwester",
};

for (const [loc, frase] of Object.entries(CONTROLES)) {
  const lista = LEXICO[loc];
  const caza = lista.some(([patron]) =>
    new RegExp(conFronteraUnicode(patron.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "iu").test(frase),
  );
  if (!caza) {
    problemas.push(
      `el léxico ${loc} NO caza su propio control negativo: «${frase}». Un léxico que ` +
        "no bloquea la construcción más obvia de su categoría está fallando ABIERTO, y " +
        "se ve idéntico a uno que funciona (D-070).",
    );
  }
}

notas.push(`${cadenas} cadena(s) revisadas en ${LOCALES.length} locales de plantilla`);
notas.push(`${Object.keys(CONTROLES).length} control(es) negativo(s): cada léxico caza su construcción canónica`);
notas.push(`campos de salida vigilados en el motor: ninguno admite operador aritmético ni de comparación`);
notas.push("mc-18 / Kluger & DeNisi: más de un tercio de las retroalimentaciones normativas EMPEORÓ el desempeño");

informar({
  nombre: "reporte-sin-comparacion",
  problemas,
  notas,
  cita: "D-025, línea roja #7, mc-18, #286 §5, #292",
  revisados,
  resumen: `${revisados} archivo(s): el motor del reporte y las plantillas de ${LOCALES.length} locales`,
  porQueBloquea:
    "el correo junta a todos los hijos de un hogar en un solo documento. Una resta entre " +
    "hermanos, un orden por puntos o un «va mejor que» convierte el resumen en una tabla " +
    "de posiciones familiar — y la comparación implícita es el riesgo documentado de este " +
    "subsistema (mc-18, D-025).",
  noComprueba: [
    "una comparación que no use estas palabras ni estos campos. Es un cable trampa, no un " +
      "juez: el hueco lo cubren la carta adversarial `anti-humillacion` (alcance ampliado a " +
      "`/reporte|informe/i` en el mismo PR) y la revisión humana por locale.",
    "el render final en el cliente de correo. Lo revisa la matriz manual de #291.",
  ],
});
