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

// ---------------------------------------------------------------------------
// La parte que NO es estática: se generan sesiones de verdad (F4 criterio #98)
// ---------------------------------------------------------------------------
//
// Todo lo de arriba lee código. Eso atrapa a quien escribe «agrupado por tema» y
// no atrapa a quien escribe un intercalador que agrupa igual — que es el caso
// que importa, porque ese código se ve bien.
//
// Desde F4 existe `ordenDeSesion()`, así que aquí se le pide que arme sesiones
// y se mira lo que sale. Es la diferencia entre comprobar que alguien dijo la
// palabra y comprobar que la cosa hace lo que la palabra promete.
{
  const { ordenDeSesion, bloqueMasLargo, repasoInicial, REPASO_MINIMO, REPASO_MAXIMO } =
    await import("../packages/motor/src/programador.ts");

  const DIA = 86_400_000;
  const AHORA = 1_800_000_000_000; // fijo: un auditor no lee el reloj
  let generadas = 0;

  // Se barren tamaños de rotación y de sesión porque el modo de falla clásico
  // —una cola se vacía antes que la otra— solo aparece en ciertas proporciones.
  for (const cuantasVencidas of [1, 2, 3, 4, 6, 9]) {
    for (const cuantasFrescas of [0, 1, 3, 7]) {
      for (const huecos of [4, 6, 8, 10, 14, 20]) {
        const rotacion = [
          ...Array.from({ length: cuantasVencidas }, (_, i) => ({
            skillId: `V${i}`,
            estado: { ...repasoInicial(), venceEn: AHORA - (i + 1) * DIA, intentos: 5 },
          })),
          ...Array.from({ length: cuantasFrescas }, (_, i) => ({
            skillId: `F${i}`,
            estado: { ...repasoInicial(), venceEn: AHORA + 30 * DIA, intentos: 5 },
          })),
        ];
        const orden = ordenDeSesion(rotacion, AHORA, huecos);
        generadas++;

        const distintas = new Set(orden).size;
        const bloque = bloqueMasLargo(orden);

        // Con 2+ habilidades distintas en la sesión NO puede haber bloques.
        if (distintas >= 2 && bloque > 1) {
          problemas.push(
            `ordenDeSesion(${cuantasVencidas} vencidas, ${cuantasFrescas} frescas, ${huecos} huecos) ` +
              `produjo un bloque de ${bloque} de la misma habilidad con ${distintas} en rotación: ` +
              `${orden.join(" ")}. mc-05: el bloque da fluidez que se evapora.`,
          );
        }
        if (orden.length !== Math.min(huecos, huecos)) {
          problemas.push(
            `ordenDeSesion pidió ${huecos} huecos y devolvió ${orden.length}: una sesión corta ` +
              "es «vuelve mañana» por la puerta de atrás (criterio #94).",
          );
        }
        // La mezcla 40-60%, solo cuando hay las dos clases que mezclar.
        if (cuantasVencidas > 0 && cuantasFrescas > 0) {
          const repaso = orden.filter((s) => s.startsWith("V")).length / orden.length;
          if (repaso < REPASO_MINIMO - 1e-9 || repaso > REPASO_MAXIMO + 1e-9) {
            problemas.push(
              `ordenDeSesion(${cuantasVencidas}v/${cuantasFrescas}f/${huecos}) dio ` +
                `${(repaso * 100).toFixed(0)}% de repaso, fuera de [${REPASO_MINIMO * 100}%, ` +
                `${REPASO_MAXIMO * 100}%] (criterio #98).`,
            );
          }
        }
      }
    }
  }
  notas.unshift(`${generadas} sesiones GENERADAS y medidas, no solo código leído (F4 #98)`);
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
