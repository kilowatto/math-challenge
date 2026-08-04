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
//   5. **Durable Objects** — estado vivo POR NIÑO: el modelo adaptativo
//      (`math-challenge-learner-do`) y, desde F6 #136, el medidor de gasto del
//      tutor. Éste se añadió el 2026-08-02 y hasta entonces no estaba en la
//      lista, así que un runbook que cubriera los otros cuatro habría salido en
//      verde dejando el modelo de un niño intacto (plan F6 §5.3).
//
// El derecho de supresión de GDPR-K, COPPA y LGPD no distingue entre ésos. Y borrar de D1 es lo natural: es donde está la fila que se ve. Los
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
  // ─── El quinto, añadido en F6 #136 ───────────────────────────────────────
  //
  // El nombre de este auditor dice CUATRO y ahora mira cinco, y el nombre se
  // queda: renombrarlo rompería su renglón en `run.mjs`, su caso en
  // `pruebas-auditores.mjs` y las citas que ya lo mencionan. Lo que importa no
  // es el número del título, es que no falte ninguno.
  //
  // **El quinto son los Durable Objects, y hasta hoy no estaban.** Ya hay dos
  // que guardan estado POR NIÑO: `math-challenge-learner-do` (el modelo
  // adaptativo, un objeto por `child_profile_id`) y, desde F6, el medidor de
  // gasto del tutor dentro de `math-challenge-ratelimiter-do`. Ninguno vive en
  // D1, en KV, en R2 ni en Analytics Engine, así que un runbook que cubriera los
  // cuatro de arriba **los dejaría intactos** y este auditor habría salido en
  // verde diciendo que todo estaba cubierto.
  //
  // El plan de F6 §5.3 lo señala y añade un dato que conviene no perder: este
  // repo tenía DOS listas distintas de «los cuatro sistemas» —la de este archivo
  // y la de D-035, que dice D1, DO, Analytics Engine y Vectorize— y nadie lo
  // había notado. Ésta es la que corre en cada commit, así que ésta es la que
  // tenía que crecer.
  //
  // Añadirlo hoy sale gratis y es a propósito: hay **cero** archivos de borrado
  // en el repo, así que esta línea no bloquea nada ahora y bloqueará el día que
  // alguien escriba el primer runbook — que es exactamente cuando se comete el
  // error, pensando en la fila de D1 que se ve y no en el objeto que no se ve.
  ["Durable Objects", /\b(durable[\s_-]?object|DurableObject|idFromName|LEARNER_DO|RATE_LIMITER)\b/i],
];

const ES_BORRADO = /(erasure|borrado|deletion|delete-?account|supresion|right-?to-?be-?forgotten|olvido|purge)/i;

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|md)$/);
const candidatos = fuentes.filter((f) => ES_BORRADO.test(f));

const problemas = [];
const notas = [];

if (candidatos.length === 0) {
  notas.push("todavía no hay runbook ni código de borrado; el auditor está listo para el primero");
  notas.push("los sistemas vigilados: D1, KV, R2, Analytics Engine y Durable Objects (mc-32, plan F6 §5.3)");
  notas.push("Analytics Engine NO tiene DELETE: su retención es por conjunto de datos, no por fila");
} else {
  for (const archivo of candidatos) {
    const texto = leer(archivo) ?? "";
    const faltan = SISTEMAS.filter(([, re]) => !re.test(texto)).map(([n]) => n);

    if (faltan.length > 0) {
      problemas.push(
        `${archivo}: no menciona ${faltan.join(", ")}. El borrado tiene que cubrir TODOS los ` +
          "sistemas donde este producto guarda datos (mc-32, plan F6 §5.3). Los que se olvidan son los que no " +
          "se ven: borrar de D1 es lo natural porque ahí está la fila. Un dato de menor que " +
          "sobrevive en R2 tras la petición del padre es un incumplimiento con nombre (mc-25).",
      );
    } else {
      notas.push(`${archivo}: cubre los ${SISTEMAS.length} sistemas`);
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

// ---------------------------------------------------------------------------
// 2. El borrado por CASCADE es estructural, no de runbook (F8 #287)
// ---------------------------------------------------------------------------
//
// Toda tabla que cuelga de una ENTIDAD borrable —`user_id` → `users`,
// `child_profile_id` → `child_profiles`— tiene que declarar
// `ON DELETE CASCADE` en la propia referencia: borrar la cuenta o el perfil
// limpia sus filas en la misma sentencia, sin que ningún runbook tenga que
// acordarse de la lista. Una tabla nueva SIN el cascade es un dato de menor
// (o de padre) que sobrevive al borrado en el sistema que menos se mira: la
// propia base. Así nacieron `parent_report_settings` y `child_report_state`
// (#287), y así tiene que nacer toda la que venga.
//
// Se lee de las migraciones REALES (segunda fuente, D-070), no de una lista
// escrita aquí a mano. Solo se miran las columnas que nombran al DUEÑO de la
// fila (`user_id`, `child_profile_id`): las columnas de ACTOR
// (`decided_by`, `reviewed_by`, `updated_by`) referencian `users` sin cascade
// a propósito — borrar al actor no debe borrar el hecho que registró.

let tablasConCascade = 0;
for (const archivo of archivos(/^migrations\/.*\.sql$/)) {
  const texto = leer(archivo) ?? "";
  for (const linea of texto.split("\n")) {
    if (linea.trimStart().startsWith("--")) continue;
    const esDueno = /\b(child_profile_id|user_id)\b[^\n]*\bREFERENCES\s+(child_profiles|users)\s*\(id\)/i;
    if (!esDueno.test(linea)) continue;
    if (!/ON\s+DELETE\s+CASCADE/i.test(linea)) {
      problemas.push(
        `${archivo}: una columna \`user_id\`/\`child_profile_id\` referencia a su dueño SIN ` +
          "ON DELETE CASCADE. El borrado de la entidad dejaría esta fila viva (mc-32 riesgo " +
          "#7): el cascade es cómo el runbook no tiene que acordarse de cada tabla.",
      );
    } else {
      tablasConCascade++;
    }
  }
}
notas.push(
  `${tablasConCascade} referencia(s) de fila-dueña con ON DELETE CASCADE verificado en migraciones ` +
    "(#287: parent_report_settings y child_report_state entre ellas)",
);

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
