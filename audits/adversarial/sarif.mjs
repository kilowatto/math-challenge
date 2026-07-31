// Los hallazgos en SARIF 2.1.0 — el estándar OASIS para resultados de análisis
// estático (OASIS Standard desde 2020-03-27, con Errata 01 de 2023).
//
// No es ISO. Es OASIS, y es el que de verdad se usa: GitHub Code Scanning,
// Azure DevOps y VS Code ingieren SARIF directo. Un informe propio obliga a
// escribir un visor propio; uno en SARIF lo abre cualquier herramienta que ya
// exista, hoy y dentro de cinco años.
//
// El mapeo no es cosmético — el estándar resulta que ya modela las dos reglas
// de D-032, y usarlo bien las hace legibles para una máquina ajena al proyecto:
//
//   Regla 1 (citar la decisión)  → `tool.driver.rules[]`. La **regla** de SARIF
//     es la cita, no el auditor. Es la lectura correcta: lo que se hace cumplir
//     es la línea roja o la decisión; el auditor solo es quien la encontró, y
//     va en `properties.auditor`. Cada regla lleva `helpUri` al documento real,
//     así que un hallazgo se puede rastrear hasta su fuente con un clic.
//
//   Regla 2 (anular por escrito) → `results[].suppressions[]` con
//     `kind: "external"` y `justification`. SARIF ya tiene el concepto de
//     "hallazgo real que alguien decidió no atender, con su razón": es
//     exactamente ANULACIONES.md, y queda expresado en el estándar en vez de en
//     una convención nuestra.
//
//   Seguimiento entre corridas → `partialFingerprints`, que es literalmente
//     para lo que existe. Se usa la misma huella `auditor·archivo·cita`.

import { huella } from "./anulaciones.mjs";

const ESQUEMA = "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json";
const REPO = "https://github.com/Kilowatto/math-challenge";

/**
 * Nivel SARIF: `error` | `warning` | `note` | `none`.
 *
 * `error` se reserva a lo que de verdad detiene el PR — línea roja o decisión
 * explícita con gravedad bloqueante (D-032). Un hallazgo que cita investigación
 * nunca es `error` por convincente que sea, porque no bloquea: degradarlo aquí
 * mantiene el informe honesto ante una herramienta externa que solo mire
 * `level` y no sepa nada de D-032.
 */
function nivel(h) {
  if (h.bloquea) return "error";
  if (h.gravedad === "menor") return "note";
  return "warning";
}

/**
 * A dónde apunta una cita. Es lo que hace rastreable el hallazgo.
 *
 * El fragmento va percent-encoded: el ancla de CLAUDE.md tiene acentos, y una
 * URI con caracteres no-ASCII crudos **no valida** contra el esquema oficial
 * (`must match format "uri"`). Lo detectó el validador, no una prueba mía.
 */
function helpUri(id, universo) {
  if (id.startsWith("LR-")) {
    return `${REPO}/blob/main/CLAUDE.md#${encodeURIComponent("las-ocho-líneas-que-no-se-cruzan")}`;
  }
  if (id.startsWith("D-")) return `${REPO}/blob/main/docs/decisions.md#${id.toLowerCase()}`;
  if (id.startsWith("mc-")) {
    const archivo = universo.archivoInvestigacion?.get(id);
    return archivo ? `${REPO}/blob/main/docs/research/${archivo}` : `${REPO}/tree/main/docs/research`;
  }
  return REPO;
}

function descripcionRegla(id, universo) {
  if (universo.lineasRojas.has(id)) return universo.lineasRojas.get(id);
  if (universo.decisiones.has(id)) return universo.decisiones.get(id);
  if (universo.investigacion.has(id)) return universo.investigacion.get(id);
  return id;
}

export function construirSarif({ hallazgos, anulados, fallidos, meta, universo, cartas }) {
  // Una regla por cita realmente usada. Declarar las 89 posibles llenaría el
  // informe de reglas que nadie disparó.
  const usadas = [...new Set([...hallazgos, ...anulados].map((h) => h.cita_id))].sort();

  const rules = usadas.map((id) => ({
    id,
    name: id.replace(/[^A-Za-z0-9]/g, ""),
    shortDescription: { text: descripcionRegla(id, universo).slice(0, 200) },
    fullDescription: { text: descripcionRegla(id, universo) },
    helpUri: helpUri(id, universo),
    defaultConfiguration: {
      // Codifica qué puede bloquear: línea roja y decisión sí, investigación no.
      level: id.startsWith("mc-") ? "note" : "error",
    },
    properties: {
      clase: id.startsWith("LR-") ? "linea-roja" : id.startsWith("D-") ? "decision" : "investigacion",
      puedeBloquear: !id.startsWith("mc-"),
    },
  }));

  const aResultado = (h, suppression) => ({
    ruleId: h.cita_id,
    ruleIndex: usadas.indexOf(h.cita_id),
    level: suppression ? nivel({ ...h, bloquea: true }) : nivel(h),
    message: {
      text: `${h.resumen}\n\nEvidencia: ${h.evidencia}${h.arreglo ? `\n\nArreglo propuesto: ${h.arreglo}` : ""}`,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: h.archivo, uriBaseId: "%SRCROOT%" },
          // SARIF exige startLine >= 1. Un hallazgo no puntual no lleva región,
          // en vez de inventarle la línea 1 y mandar a leer el lugar equivocado.
          ...(h.linea > 0 ? { region: { startLine: h.linea } } : {}),
        },
      },
    ],
    partialFingerprints: {
      // Para lo que existe el campo: seguir el mismo hallazgo entre corridas.
      // Es la misma huella que usa ANULACIONES.md, a propósito.
      auditorArchivoCita: huella(h.auditor, h.archivo, h.cita_id),
    },
    // NO se usa `fixes`. El estándar exige que un `fix` traiga `artifactChanges`
    // —un parche aplicable, con la región y el texto de reemplazo—, y lo que
    // produce un auditor con LLM es prosa, no un parche. Declarar un `fix` sin
    // parche es prometerle a la herramienta consumidora un botón de "aplicar"
    // que no existe. El arreglo va en el mensaje y en `properties`, donde
    // cualquier visor lo muestra sin fingir que es accionable.
    ...(suppression
      ? {
          suppressions: [
            {
              kind: "external",
              justification: suppression.razon,
              properties: { fecha: suppression.fecha, quien: suppression.quien, registro: "audits/adversarial/ANULACIONES.md" },
            },
          ],
        }
      : {}),
    properties: {
      auditor: h.auditor,
      auditorTitulo: cartas.get(h.auditor)?.titulo,
      gravedad: h.gravedad,
      arreglo: h.arreglo,
    },
  });

  return {
    $schema: ESQUEMA,
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Math Challenge — flota adversarial",
            fullName: "Flota adversarial de Math Challenge (D-032)",
            informationUri: `${REPO}/blob/main/audits/README.md`,
            version: "1.0.0",
            rules,
            properties: {
              decision: "D-032",
              auditores: cartas.size,
              modelo: meta.modelo,
              nota:
                "Los auditores adversariales bloquean únicamente cuando citan una línea roja o una " +
                "decisión explícita; el resto reporta sin detener el PR (D-032).",
            },
          },
        },
        // Auditores que no pudieron correr. Un auditor fallido NO es un auditor
        // que aprobó, y SARIF tiene dónde decirlo en vez de omitirlo.
        invocations: [
          {
            executionSuccessful: fallidos.length === 0,
            commandLine: "node audits/adversarial.mjs",
            ...(fallidos.length
              ? {
                  toolExecutionNotifications: fallidos.map((f) => ({
                    level: "error",
                    message: { text: `El auditor \`${f.auditor}\` no pudo correr: ${f.error}. Su área quedó sin revisar.` },
                  })),
                }
              : {}),
          },
        ],
        results: [
          ...hallazgos.map((h) => aResultado(h, null)),
          ...anulados.map((h) => aResultado(h, h.anulacion)),
        ],
        properties: { fecha: meta.fecha, modo: meta.modo, base: meta.base, archivos: meta.archivos },
      },
    ],
  };
}
