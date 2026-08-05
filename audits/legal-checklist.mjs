#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { RAIZ, informar } from "./lib/repo.mjs";

const archivo = "docs/legal-checklist.md";
const texto = readFileSync(`${RAIZ}/${archivo}`, "utf8");
const requeridos = [
  "## COPPA",
  "## GDPR y Children’s Code",
  "## LGPD (Brasil)",
  "## México (LFPDPPP)",
  "## EAA / EN 301 549",
  "## Premios, azar y consideración",
  "## Zaraz / GA4",
  "## Condición de escalamiento",
];
const problemas = requeridos.filter((seccion) => !texto.includes(seccion)).map((seccion) => `falta la sección ${seccion}`);
if (!/Fecha de revisión:\*\*\s*2026-08-05/.test(texto)) problemas.push("falta fecha de revisión vigente");
if (!/no asesoría legal/.test(texto)) problemas.push("falta la limitación de alcance legal");
if (!/T-5 sigue abierta/.test(texto)) problemas.push("el checklist oculta que T-5 sigue abierta");
if (!/\*\*\[unverified\]\*\*/.test(texto)) problemas.push("falta una exposición [unverified] explícita");
if (problemas.length) {
  informar({
    nombre: "legal-checklist",
    problemas,
    cita: "D-126, F11 #427",
    revisados: 1,
    resumen: "checklist legal interno",
  });
} else {
  informar({
    nombre: "legal-checklist",
    problemas: [],
    cita: "D-126, F11 #427",
    revisados: 1,
    resumen: `${requeridos.length} secciones · fecha · límites y exposiciones visibles`,
  });
}
