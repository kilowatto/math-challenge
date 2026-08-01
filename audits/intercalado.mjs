#!/usr/bin/env node
// Auditor determinista — una serie intercala, no agrupa por tema
//
// Hace cumplir: D-018, `mc-05` (espaciado, recuperación e intercalado),
// CLAUDE.md § Contenido ("la unidad de diseño es la serie, no la pregunta suelta").
//
// Por qué existe. `mc-05` documenta el hallazgo que a casi todo el mundo le
// parece equivocado la primera vez: practicar diez problemas del mismo tipo
// seguidos **se siente** mejor y **aprende** peor que mezclar tipos. El bloque
// da fluidez inmediata que se evapora; el intercalado obliga a elegir la
// estrategia, que es la parte difícil y la que se retiene.
//
// El fallo no es que alguien decida agrupar. Es que agrupar es lo que sale solo:
// se generan diez ítems de suma, se meten en una serie, y la serie queda
// bloqueada sin que nadie lo haya decidido. Este auditor obliga a que la decisión
// sea explícita.
//
// LO QUE NO PUEDE COMPROBAR: si el intercalado está bien calibrado. Alternar
// entre dos tipos casi idénticos es intercalado nominal y bloque de hecho. Eso
// es diseño de contenido y revisión humana (CLAUDE.md § Contenido).

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

const ES_SERIE = palabra("serie", "series", "sequence", "secuencia", "lote", "batch", "set_?de_?retos", "challenge_?set");
const INTERCALA = palabra("intercalad[oa]", "interleav\\w*", "mezclad[oa]", "mixed", "shuffle\\w*", "variad[oa]");
const AGRUPA = palabra("agrupad[oa]", "blocked", "bloque", "grouped", "by_?topic", "por_?tema", "same_?type", "mismo_?tipo");

// Los archivos de mensajes traducidos quedan fuera: ahí "serie" es prosa de
// interfaz, no un generador. Marcarlos daba cuatro avisos por cada locale, que
// es exactamente el ruido que apaga un auditor.
const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|json|sql)$/)
  .filter((f) => SOLO_PRODUCTO.test(f))
  .filter((f) => !/\/i18n\//.test(f));
const problemas = [];
const notas = [];
let series = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  if (!ES_SERIE.test(texto) && !ES_SERIE.test(archivo)) continue;
  series++;

  const esSql = archivo.endsWith(".sql");
  const lineas = texto.split("\n");

  for (let i = 0; i < lineas.length; i++) {
    const linea = (esSql ? lineas[i].replace(/--.*$/, "") : lineas[i].replace(/\/\/.*$/, "")).replace(/^\s*\*.*$/, "");
    if (!linea.trim()) continue;

    // Ordenar una serie por tema es agrupar, se llame como se llame.
    if (/ORDER\s+BY[^;\n]*\b(topic|tema|skill|habilidad|type|tipo)\b/i.test(linea) ||
        /sort\w*\s*\([^)]*\b(topic|tema|skill|type|tipo)\b/i.test(linea)) {
      problemas.push(
        `${archivo}:${i + 1}: la serie se ordena por tema — \`${linea.trim().slice(0, 80)}\`. ` +
          "mc-05: practicar el mismo tipo seguido se SIENTE mejor y aprende peor. " +
          "El intercalado obliga a elegir la estrategia, que es la parte que se retiene.",
      );
      continue;
    }

    if (AGRUPA.test(linea) && !INTERCALA.test(linea)) {
      notas.push(`${archivo}:${i + 1} habla de agrupar — revisar que sea una excepción decidida`);
    }
  }

  if (!INTERCALA.test(texto)) {
    notas.push(`${archivo}: define series y no nombra el intercalado — mc-05 lo pide explícito`);
  }
}

notas.unshift(
  series > 0
    ? `${series} archivo(s) definen series`
    : "todavía no hay generador de series; el auditor está listo para el de F3",
);

informar({
  nombre: "intercalado",
  problemas,
  notas: notas.slice(0, 6),
  cita: "D-018, mc-05, CLAUDE.md § Contenido",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "agrupar por tema es lo que sale solo, y produce fluidez que se evapora. La unidad de " +
    "diseño es la serie, no la pregunta suelta (CLAUDE.md § Contenido, mc-05).",
  noComprueba: [
    "si el intercalado está bien calibrado. Alternar entre dos tipos casi idénticos es " +
      "intercalado de nombre y bloque de hecho.",
  ],
});
