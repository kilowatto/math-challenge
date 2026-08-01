// El plan de remediación.
//
// Sin esto, la flota solo escupía a la pantalla, y una lista que se pierde al
// hacer scroll no es un plan de nada: no puedes saber si tu arreglo limpió el
// hallazgo, cuáles aparecieron nuevos, ni pegar la evidencia en el PR —que
// CLAUDE.md § Git exige literalmente ("toda afirmación factual debe poder
// re-ejecutarse").
//
// Cada corrida deja dos archivos:
//
//   informes/ultimo.json  · máquina. Es lo que permite comparar corridas.
//   informes/ultimo.md    · persona. Es lo que se pega en el PR.
//
// Y lo que convierte la lista en plan: **antes de sobrescribir, se lee el JSON
// de la corrida anterior y se compara**. De ahí salen las tres cubetas que de
// verdad importan al remediar — nuevos, resueltos, y los que siguen abiertos.
//
// La huella es `auditor·archivo·cita`, la misma que usa ANULACIONES.md. Es a
// propósito: así una anulación escrita y un hallazgo rastreado hablan del mismo
// objeto. Su límite conocido: dos hallazgos distintos del mismo auditor, en el
// mismo archivo, citando la misma decisión, cuentan como uno. Se prefiere eso a
// una huella que incluya el texto, porque el modelo lo redacta distinto cada
// corrida y entonces **todo** parecería nuevo siempre.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { huella } from "./anulaciones.mjs";
import { construirSarif } from "./sarif.mjs";
import { validarSarif } from "./validar-sarif.mjs";

const DIR = new URL("./informes/", import.meta.url).pathname;
// `--simular` escribe a otro nombre. Si escribiera sobre `ultimo.*` pisaría la
// línea base contra la que se compara la siguiente corrida real, y el "nuevos /
// resueltos" del plan de remediación pasaría a comparar contra hallazgos
// inventados. Un plan que compara contra ficción es peor que no comparar.
const nombre = (base, sim) => `${DIR}${sim ? "simulado" : "ultimo"}.${base}`;

const clave = (h) => huella(h.auditor, h.archivo, h.cita_id);

/** Lee la corrida anterior. Devuelve null si es la primera. */
export function leerAnterior(simulado = false) {
  const ruta = nombre("json", simulado);
  if (!existsSync(ruta)) return null;
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Compara esta corrida contra la anterior.
 *
 * Solo se comparan bloqueantes y reportados: un hallazgo descartado por la
 * regla 1 nunca fue un hallazgo, y meterlo aquí haría que "resuelto" incluyera
 * cosas que solo dejaron de inventarse.
 */
export function comparar(actuales, anterior) {
  if (!anterior) return { nuevos: actuales, resueltos: [], persistentes: [], primera: true };

  const antes = new Map((anterior.hallazgos ?? []).map((h) => [clave(h), h]));
  const ahora = new Map(actuales.map((h) => [clave(h), h]));

  return {
    primera: false,
    nuevos: actuales.filter((h) => !antes.has(clave(h))),
    persistentes: actuales.filter((h) => antes.has(clave(h))),
    resueltos: [...antes.values()].filter((h) => !ahora.has(clave(h))),
    fechaAnterior: anterior.fecha,
  };
}

const GRAVEDAD_ORDEN = { bloqueante: 0, grave: 1, menor: 2 };

/**
 * Ordena para remediar, no para leer.
 *
 * Primero lo que bloquea, y dentro de eso **agrupado por archivo**: se arregla
 * un archivo a la vez, no un auditor a la vez. Un plan ordenado por auditor
 * obliga a abrir el mismo archivo cinco veces.
 */
function ordenarParaRemediar(hallazgos) {
  return [...hallazgos].sort(
    (a, b) =>
      (a.bloquea === b.bloquea ? 0 : a.bloquea ? -1 : 1) ||
      a.archivo.localeCompare(b.archivo) ||
      (GRAVEDAD_ORDEN[a.gravedad] ?? 9) - (GRAVEDAD_ORDEN[b.gravedad] ?? 9) ||
      (a.linea ?? 0) - (b.linea ?? 0),
  );
}

function renderMarkdown({ hallazgos, diff, meta, anulados, invalidos, fallidos }) {
  const L = [];
  const bloqueantes = hallazgos.filter((h) => h.bloquea);
  const reportados = hallazgos.filter((h) => !h.bloquea);

  L.push(`# Flota adversarial — informe de remediación`);
  L.push("");
  L.push(`> ${meta.fecha} · ${meta.modo}${meta.base ? ` contra \`${meta.base.slice(0, 12)}\`` : ""}`);
  L.push(`> ${meta.auditores} auditor(es) sobre ${meta.archivos} archivo(s) · ${meta.modelo}`);
  L.push(`> ${meta.tokensEntrada.toLocaleString("es-MX")} tokens de entrada, ${meta.tokensSalida.toLocaleString("es-MX")} de salida · ~$${meta.costo.toFixed(3)} USD`);
  L.push("");

  L.push(`## Resumen`);
  L.push("");
  L.push(`| | |`);
  L.push(`|---|---|`);
  L.push(`| **Bloquean el PR** | ${bloqueantes.length} |`);
  L.push(`| Reportan sin detener | ${reportados.length} |`);
  if (anulados.length) L.push(`| Anulados por escrito | ${anulados.length} |`);
  if (invalidos.length) L.push(`| Descartados (regla 1: sin cita válida) | ${invalidos.length} |`);
  if (fallidos.length) L.push(`| **Auditores que no pudieron correr** | ${fallidos.length} |`);
  L.push("");

  if (!diff.primera) {
    L.push(`### Contra la corrida anterior (${diff.fechaAnterior ?? "sin fecha"})`);
    L.push("");
    L.push(`- **${diff.nuevos.length} nuevo(s)** — aparecieron con este cambio`);
    L.push(`- **${diff.resueltos.length} resuelto(s)** — estaban y ya no`);
    L.push(`- ${diff.persistentes.length} sigue(n) abierto(s)`);
    L.push("");
    if (diff.resueltos.length) {
      L.push(`<details><summary>Los ${diff.resueltos.length} resueltos</summary>`);
      L.push("");
      for (const h of diff.resueltos) L.push(`- \`${h.auditor}\` · \`${h.archivo}\` [${h.cita_id}] — ${h.resumen}`);
      L.push("");
      L.push(`</details>`);
      L.push("");
    }
  }

  if (fallidos.length) {
    L.push(`## ⚠ Auditores que no pudieron correr`);
    L.push("");
    L.push(`Un auditor que falló **no es un auditor que aprobó**. Estas áreas quedaron sin revisar:`);
    L.push("");
    for (const f of fallidos) L.push(`- \`${f.auditor}\` — ${f.error}`);
    L.push("");
  }

  const seccion = (titulo, lista, nota) => {
    if (!lista.length) return;
    L.push(`## ${titulo}`);
    L.push("");
    if (nota) {
      L.push(nota);
      L.push("");
    }
    let archivoActual = null;
    for (const h of ordenarParaRemediar(lista)) {
      if (h.archivo !== archivoActual) {
        archivoActual = h.archivo;
        L.push(`### \`${h.archivo}\``);
        L.push("");
      }
      const esNuevo = diff.nuevos.some((n) => clave(n) === clave(h));
      L.push(
        `- [ ] **${h.resumen}**` +
          `${h.linea ? ` — línea ${h.linea}` : ""}` +
          `  \n  ` +
          `\`${h.auditor}\` · **[${h.cita_id}]** · ${h.gravedad}${esNuevo && !diff.primera ? " · 🆕 nuevo" : ""}`,
      );
      if (h.evidenciaNoVerificable) {
        L.push(
          `  - ⚠️ **Evidencia no verificable.** Citó ${h.citasFaltantes.map((c) => `\`${c.slice(0, 60)}\``).join(", ")}, ` +
            `que no aparece en nada de lo que se le mostró. **Degradado: no bloquea.**`,
        );
      }
      L.push(`  - **Evidencia:** ${h.evidencia}`);
      L.push(`  - **Arreglo:** ${h.arreglo}`);
      L.push("");
    }
  };

  seccion(
    "Bloquean el PR",
    bloqueantes,
    "Citan una línea roja o una decisión explícita. Para dejar pasar alguno, D-032 exige escribir " +
      "por qué en [`ANULACIONES.md`](../ANULACIONES.md) y commitearlo en este mismo PR.",
  );
  seccion(
    "Reportan sin detener",
    reportados,
    "Citan investigación. Se toman en serio pero no detienen el PR (D-032). Son candidatos naturales " +
      "a un issue de seguimiento en vez de a un arreglo en caliente.",
  );

  if (anulados.length) {
    L.push(`## Anulados por escrito`);
    L.push("");
    for (const h of anulados) {
      L.push(`- \`${h.auditor}\` · \`${h.archivo}\` [${h.cita_id}] — ${h.resumen}`);
      L.push(`  - ${h.anulacion.fecha}, ${h.anulacion.quien}: ${h.anulacion.razon.split("\n")[0]}`);
    }
    L.push("");
  }

  if (invalidos.length) {
    L.push(`## Descartados por la regla 1`);
    L.push("");
    L.push(`Opinión sin cita válida. No bloquean, y se listan para que se pueda auditar al auditor.`);
    L.push("");
    for (const h of invalidos) L.push(`- \`${h.auditor}\`: ${h.resumen} — *${h.motivo}*`);
    L.push("");
  }

  L.push(`---`);
  L.push("");
  L.push(`Regenerar: \`node audits/adversarial.mjs\``);
  L.push("");
  return L.join("\n");
}

/** Escribe los dos archivos y devuelve el diff contra la corrida anterior. */
export function escribirInforme({ bloqueantes, reportados, anulados, invalidos, fallidos, meta, universo, cartas, simulado = false }) {
  const JSON_PATH = nombre("json", simulado);
  const MD_PATH = nombre("md", simulado);
  const SARIF_PATH = nombre("sarif", simulado);
  const anterior = leerAnterior(simulado);

  const hallazgos = [
    ...bloqueantes.map((h) => ({ ...h, bloquea: true })),
    ...reportados.map((h) => ({ ...h, bloquea: false })),
  ];

  const diff = comparar(hallazgos, anterior);

  mkdirSync(DIR, { recursive: true });
  writeFileSync(
    JSON_PATH,
    JSON.stringify({ fecha: meta.fecha, meta, hallazgos, anulados, invalidos, fallidos }, null, 2),
  );
  writeFileSync(MD_PATH, renderMarkdown({ hallazgos, diff, meta, anulados, invalidos, fallidos }));

  // SARIF 2.1.0 (OASIS Standard). Es lo que hace que estos hallazgos los pueda
  // leer una herramienta que no sepa nada de este proyecto.
  const sarif = construirSarif({ hallazgos, anulados, fallidos, meta, universo, cartas });
  writeFileSync(SARIF_PATH, JSON.stringify(sarif, null, 2));

  // Se valida contra el esquema oficial de OASIS al producirlo. Un informe que
  // dice ser SARIF y no lo es, es peor que uno propio: la herramienta que lo
  // ingiera va a fallar, o —peor— a leerlo mal en silencio. Así se detectaron
  // dos defectos que 20 pruebas escritas a mano no podían ver.
  const erroresSarif = validarSarif(sarif);

  return { diff, rutaMd: MD_PATH, rutaJson: JSON_PATH, rutaSarif: SARIF_PATH, erroresSarif };
}
