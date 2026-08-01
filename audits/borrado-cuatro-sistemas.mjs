#!/usr/bin/env node
// Auditor determinista — borrar borra en los CUATRO sistemas
//
// Hace cumplir: D-013, `mc-25` (privacidad infantil), `mc-32`, D-020.
//
// Por qué existe. Este producto guarda datos en cuatro sitios distintos por
// razones legítimas de arquitectura (`mc-32`):
//
//   1. **D1** — identidad, perfiles, grupos.
//   2. **KV** — sesiones y cachés.
//   3. **R2** — exportaciones y objetos generados.
//   4. **Analytics Engine** — intentos y señales derivadas.
//
// El derecho de supresión de GDPR-K, COPPA y LGPD no distingue entre esos
// cuatro. Y borrar de D1 es lo natural: es donde está la fila que se ve. Los
// otros tres se olvidan porque no se ven — y un dato de menor que sobrevive en
// R2 después de que el padre pidió borrarlo es un incumplimiento con nombre.
//
// Analytics Engine merece una advertencia propia: **no tiene DELETE**. Su
// retención es por configuración de conjunto de datos, no por fila. Un runbook
// de borrado que prometa borrar de ahí está prometiendo algo que la plataforma
// no ofrece; lo correcto es no escribir ahí nada que identifique a nadie —que es
// justamente lo que exige D-020— y decirlo en el runbook.
//
// LO QUE NO PUEDE COMPROBAR: que el borrado se ejecute de verdad. Esto lee
// código y documentación, no corre el runbook. Probar el borrado de punta a
// punta necesita un entorno con datos, y sigue pendiente.

import { archivos, leer, informar, existe } from "./lib/repo.mjs";

const SISTEMAS = [
  ["D1", /\b(D1|db|DB|prepare\s*\(|DELETE\s+FROM)/],
  ["KV", /\b(KV|kv)\b|\.delete\s*\(/],
  ["R2", /\b(R2|r2|BUCKET|bucket)\b/],
  ["Analytics Engine", /\b(AE|analytics_?engine|writeDataPoint|ANALYTICS)\b/i],
];

const ES_BORRADO = /(erasure|borrado|deletion|delete-?account|supresion|right-?to-?be-?forgotten|olvido|purge)/i;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|md)$/);
const candidatos = fuentes.filter((f) => ES_BORRADO.test(f));

const problemas = [];
const notas = [];

if (candidatos.length === 0) {
  notas.push("todavía no hay runbook ni código de borrado; el auditor está listo para el primero");
  notas.push("los cuatro sistemas: D1, KV, R2 y Analytics Engine (mc-32)");
  notas.push("Analytics Engine NO tiene DELETE: su retención es por conjunto de datos, no por fila");
} else {
  for (const archivo of candidatos) {
    const texto = leer(archivo) ?? "";
    const faltan = SISTEMAS.filter(([, re]) => !re.test(texto)).map(([n]) => n);

    if (faltan.length > 0) {
      problemas.push(
        `${archivo}: no menciona ${faltan.join(", ")}. El borrado tiene que cubrir los CUATRO ` +
          "sistemas donde este producto guarda datos (mc-32). Los que se olvidan son los que no " +
          "se ven: borrar de D1 es lo natural porque ahí está la fila. Un dato de menor que " +
          "sobrevive en R2 tras la petición del padre es un incumplimiento con nombre (mc-25).",
      );
    } else {
      notas.push(`${archivo}: cubre los cuatro sistemas`);
    }

    // Prometer un DELETE en Analytics Engine es prometer lo imposible.
    if (/(DELETE|borrar|eliminar)[^.\n]{0,40}(Analytics|AE\b)/i.test(texto)) {
      problemas.push(
        `${archivo}: promete borrar filas de Analytics Engine. La plataforma NO ofrece DELETE — ` +
          "la retención se configura por conjunto de datos. Lo correcto es no escribir ahí nada " +
          "que identifique a nadie (D-020) y decirlo, no prometer un borrado que no existe.",
      );
    }
  }
  notas.unshift(`${candidatos.length} archivo(s) de borrado revisados`);
}

informar({
  nombre: "borrado-cuatro-sistemas",
  problemas,
  notas: notas.slice(0, 7),
  cita: "D-013, D-020, mc-25, mc-32",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s), ${candidatos.length} de borrado`,
  porQueBloquea:
    "el derecho de supresión no distingue entre almacenes. Un dato de menor que sobrevive " +
    "en el sistema que nadie mira es un incumplimiento de GDPR-K, COPPA y LGPD (mc-25).",
  noComprueba: [
    "que el borrado se ejecute de verdad. Esto lee código y documentación; probarlo de " +
      "punta a punta necesita un entorno con datos y sigue pendiente.",
  ],
});
