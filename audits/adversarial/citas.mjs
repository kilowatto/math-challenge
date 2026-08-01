// La regla 1 de D-032, hecha código.
//
//   "Cada auditor cita la decisión o el documento que hace cumplir. Un auditor
//    que no puede señalar una decisión de `decisions.md` o un hallazgo de
//    `research/` está opinando, y su veredicto no bloquea."
//
// Una regla que solo vive en prosa se cumple cuando alguien se acuerda. Este
// archivo lee el repo de verdad — los encabezados de `docs/decisions.md`, los
// archivos de `docs/research/`, las ocho líneas rojas — y contrasta cada cita
// contra eso. Un hallazgo que cite `D-036` cuando las decisiones llegan a D-034
// no bloquea, por convincente que suene.

import { readFileSync, readdirSync } from "node:fs";
import { LINEAS_ROJAS } from "./cartas.mjs";

const raiz = new URL("../../", import.meta.url).pathname;

/** Ids de decisión que existen de verdad: D-001 → título. */
export function leerDecisiones() {
  const texto = readFileSync(`${raiz}docs/decisions.md`, "utf8");
  const mapa = new Map();
  for (const m of texto.matchAll(/^## (D-\d{3}) — (.+?)(?: · \d{4}-\d{2}-\d{2})?$/gm)) {
    mapa.set(m[1], m[2].trim());
  }
  if (mapa.size === 0) {
    throw new Error("docs/decisions.md no tiene encabezados '## D-0nn — …'; el validador de citas quedó ciego");
  }
  return mapa;
}

/** Ids de investigación que existen de verdad: mc-01 → título del archivo. */
export const archivoInvestigacion = new Map();

export function leerInvestigacion() {
  const mapa = new Map();
  for (const archivo of readdirSync(`${raiz}docs/research`)) {
    const m = archivo.match(/^\d{4}-\d{2}-\d{2}-(mc-\d{2})-(.+)\.md$/);
    if (m) {
      mapa.set(m[1], m[2].replace(/-/g, " "));
      archivoInvestigacion.set(m[1], archivo);
    }
  }
  if (mapa.size === 0) {
    throw new Error("docs/research/ no tiene archivos 'AAAA-MM-DD-mc-nn-*.md'; el validador de citas quedó ciego");
  }
  return mapa;
}

/** Ids de línea roja: LR-1 → texto. */
export function leerLineasRojas() {
  return new Map(LINEAS_ROJAS.map((t, i) => [`LR-${i + 1}`, t]));
}

export function cargarUniverso() {
  const investigacion = leerInvestigacion();
  return {
    decisiones: leerDecisiones(),
    investigacion,
    lineasRojas: leerLineasRojas(),
    // Para el `helpUri` de SARIF: la cita tiene que poder rastrearse al archivo.
    archivoInvestigacion,
  };
}

/**
 * ¿Existe esta cita? Devuelve `{ valida, clase, titulo }`.
 *
 * `clase` importa: D-032 dice que los adversariales bloquean "únicamente cuando
 * citan una línea roja o una decisión explícita". Una cita a investigación es
 * válida —el hallazgo se reporta y se toma en serio— pero no detiene el PR.
 */
export function verificarCita(id, universo = cargarUniverso()) {
  const limpio = String(id ?? "").trim();

  if (universo.lineasRojas.has(limpio)) {
    return { valida: true, clase: "linea-roja", puedeBloquear: true, titulo: universo.lineasRojas.get(limpio) };
  }
  if (universo.decisiones.has(limpio)) {
    return { valida: true, clase: "decision", puedeBloquear: true, titulo: universo.decisiones.get(limpio) };
  }
  if (universo.investigacion.has(limpio)) {
    return { valida: true, clase: "investigacion", puedeBloquear: false, titulo: universo.investigacion.get(limpio) };
  }
  return { valida: false, clase: null, puedeBloquear: false, titulo: null };
}

/**
 * Verifica que TODAS las cartas citen documentos que existen. Corre al arrancar:
 * una carta que cite un documento inventado debe fallar antes de gastar una
 * llamada de LLM, no en medio de una revisión.
 */
export function verificarCartas(cartas, universo = cargarUniverso()) {
  const rotas = [];
  for (const carta of cartas) {
    for (const id of carta.cita) {
      if (!verificarCita(id, universo).valida) rotas.push({ carta: carta.id, cita: id });
    }
  }
  return rotas;
}

/** Texto completo de una decisión, para dárselo al auditor como contexto. */
export function textoDecision(id) {
  const texto = readFileSync(`${raiz}docs/decisions.md`, "utf8");
  const i = texto.search(new RegExp(`^## ${id} — `, "m"));
  if (i === -1) return null;
  const resto = texto.slice(i);
  const fin = resto.search(/^\n---\n/m);
  return (fin === -1 ? resto : resto.slice(0, fin)).trim();
}

/**
 * Resumen ejecutivo de una investigación. El documento completo puede pasar de
 * 3.000 palabras; 28 auditores con el texto íntegro de sus citas costarían más
 * que la revisión que justifican. Se manda el encabezado y el resumen.
 */
export function resumenInvestigacion(id, maxCaracteres = 2500) {
  const archivo = readdirSync(`${raiz}docs/research`).find((a) => a.includes(`-${id}-`));
  if (!archivo) return null;
  const texto = readFileSync(`${raiz}docs/research/${archivo}`, "utf8");
  return texto.length <= maxCaracteres
    ? texto.trim()
    : `${texto.slice(0, maxCaracteres).trim()}\n\n[…recortado; el documento completo está en docs/research/${archivo}]`;
}
