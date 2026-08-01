#!/usr/bin/env node
// La flota de auditores — corredor
//
// D-032: 35 auditores en dos clases. Los deterministas bloquean por defecto;
// los adversariales con LLM bloquean solo cuando citan una línea roja o una
// decisión explícita.
//
// Este archivo es también el inventario honesto: lo que ya corre, y lo que
// todavía no puede correr porque la fase que lo habilita no existe. Un auditor
// listado como "pendiente" no está olvidado — está esperando su fase.

import { spawnSync } from "node:child_process";

// --- Deterministas: implementados y bloqueando ---------------------------
const ACTIVE = [
  ["cf-prefix",         "prefijo math-challenge- en objetos de Cloudflare",  "CLAUDE.md § Cloudflare"],
  ["child-free-text",   "ningún campo de texto libre en tablas de niño",     "línea roja #3, D-013"],
  ["locales-complete",  "los 7 locales, no 5 idiomas",                       "D-022, mc-34"],
  ["no-attempts-in-d1", "intentos fuera de D1",                              "mc-32 riesgo #1"],
  ["secrets",           "ningún secreto commiteado",                         "CLAUDE.md § Cloudflare"],
  ["brand-image",       "paleta Ignia, AVIF/WebP, llaves de imagen",         "guia-de-estilo.md, mc-38, mc-47"],
  ["bundle-budget",     "peso gz por página, JS y CSS de cliente",           "D-030, mc-47 §4"],
  ["telemetria-infantil","ninguna telemetría en superficies de niño",         "D-037, línea roja #2"],
  ["ipad-usabilidad",   "orientación libre, Split View, foco y hover en iPad", "D-041, WCAG 2.2 AA"],

  // --- Los trece escritos ANTES que el código que vigilan (2026-08-01) ------
  //
  // Nacieron para F2-F4 y la intención era dejarlos en PENDIENTE hasta que su
  // fase abriera. Están activos, y la razón es que PENDIENTE **no corre**: de
  // los ocho que ya estaban ahí, seis fallaban abiertos sin que nadie lo
  // supiera. Un guardián que espera su turno en una lista es un guardián que no
  // vigila.
  //
  // Los trece son análisis estático, cuestan milisegundos, pasan en verde sobre
  // el repo de hoy, y cada uno tiene su caso en `pruebas-auditores.mjs` donde se
  // le vio bloquear. Activarlos ahora significa que el primer commit de F2 ya
  // llega vigilado, en vez de que alguien tenga que acordarse de moverlos.
  ["child-pii",              "ningún dato personal de un niño",              "línea roja #2, D-013, mc-25"],
  ["sin-penalizacion",       "nunca se penaliza borrar ni corregir",         "línea roja #8, D-020, mc-30"],
  ["kinder-sin-examen",      "kinder no presenta exámenes ni cronómetros",   "D-024, D-045, D-046, mc-10"],
  ["borrado-cuatro-sistemas","borrar borra en D1, KV, R2 y Analytics",       "D-013, mc-25, mc-32"],
  ["puntaje-servidor",       "el puntaje lo calcula el servidor",            "D-010, D-025, mc-29"],
  ["motor-puntuacion",       "un solo motor, con los invariantes de D-010",  "D-010, D-018, D-024, D-048"],
  ["tabla-bandas",           "una sola tabla de bandas; la edad no limita",  "D-002, D-017, D-046"],
  ["notacion-locale",        "notación por locale, no por idioma",           "D-022, mc-34"],
  ["signup-dos-campos",      "el registro son dos campos",                   "D-026, D-038, mc-45"],
  ["band-typography",        "marca en Raleway, controles en voz del sistema","D-036, D-031, mc-38"],
  ["do-por-entidad",         "un Durable Object por entidad, nunca global",  "mc-32, D-030, D-043"],
  ["intercalado",            "las series intercalan, no agrupan por tema",   "D-018, mc-05"],
  ["adaptativo-simulacion",  "el motor adaptativo se simula antes de usarse","D-002, mc-13, mc-44"],
  ["retro-completa",         "toda causa de error tiene texto en los 7 locales","mc-11, línea roja #7, D-022"],
  ["migration-safety",       "migraciones sin borrado destructivo",           "mc-32, D-013, D-032"],

  // El manifiesto del corpus traducido — no la integridad, que es otra cosa.
  //
  // `corpus-integridad` NO está aquí y no es un olvido: sale con 1 mientras
  // exista un documento con hallazgo, y hoy hay 36 de 282. Ponerlo en el gancho
  // haría que todo el mundo commiteara con --no-verify, que es como se muere una
  // flota. Se corre a mano. Lo que sí bloquea es que su manifiesto envejezca,
  // porque ese modo falla ABIERTO: el sitio seguiría prometiendo verificación
  // sobre un archivo que ya cambió.
  // Los dos que esperaban «cuando haya interfaz» (#129). Ya la hay, y los dos
  // pasan sobre el repo de hoy — comprobado antes de moverlos, no después.
  //
  // `contrast` se queda en PENDING y NO es un olvido: reporta tres pares de la
  // paleta CLARA por debajo de su umbral, incluido el naranja de Ignia a 2.83:1
  // sobre la superficie real. Está en docs/dudas.md §14 y es decisión del dueño
  // —cambia la paleta de marca—, no una corrección de implementación.
  // Activarlo hoy bloquearía cada commit por una decisión que no es del código.
  ["axe-a11y",               "axe-core sin violaciones",                     "WCAG 2.2 AA, mc-38"],
  ["touch-targets",          "24px WCAG / 44px HIG / 88px kinder",           "mc-20, WCAG 2.5.8"],
  ["passkey-rp-id",          "el rp.id de las passkeys no se toca",          "D-038, #112, #263"],
  ["turnstile-solo-adulto",   "Turnstile jamás delante de un niño",           "línea roja #1, D-054, #113"],
  ["corpus-manifiesto",      "el manifiesto del corpus traducido está al día", "D-033, D-022, mc-48 §3"],

  // S0 ya tiene sitio: estos dos se escribieron y corrían por su cuenta, pero
  // nadie los movió aquí — quedaron en PENDING diciendo "cuando haya sitio"
  // con el sitio ya desplegado (2026-08-01). Un auditor listo que no vigila
  // cada commit es exactamente el mismo error que dejó F0 cerrada con el
  // 0-RTT sin verificar: no basta con que exista, tiene que estar en el gancho.
  ["jsonld-valid",           "JSON-LD válido y coincidente con la página",     "S0 §59, mc-48 §3, D-022"],
  ["hreflang-recip",         "hreflang recíproco entre los 7 + x-default",     "S0 §59, mc-48 §3"],
];

// --- Deterministas: esperando la fase que los habilita -------------------
const PENDING = [
  ["cwv-budget",        "INP ≤150ms, LCP ≤2.5s, CLS ≤0.1 — datos de CAMPO", "D-037 · cuando el beacon lleve semanas recolectando"],
  ["contrast",          "contraste 4.5:1 texto, 3:1 gráficos",       "F2 · cuando haya interfaz"],
  ["precache-budget",   "≤5 MB de audio en la primera instalación",  "F5 · cuando haya audio"],
];

// --- Adversariales con LLM: construidos en F1 ----------------------------
// Viven en audits/adversarial.mjs y NO corren aquí a propósito. Estos
// deterministas cuestan milisegundos y bloquean cada commit; aquéllos cuestan
// dinero y segundos. Bloquear cada commit con 28 llamadas de LLM es exactamente
// cómo una flota se convierte en el ruido que D-032 teme.
const ADVERSARIAL_COUNT = 28;

console.log("Flota de auditores — D-032\n");

let failed = 0;
// `--experimental-strip-types` para todos: `tabla-bandas` importa el motor, que
// es TypeScript, para cruzarlo contra las tablas de decisions.md. Se le pasa a
// todos en vez de mantener una lista de cuáles lo necesitan — una lista así se
// desincroniza el día que un auditor nuevo importe código de producto.
for (const [name, what, enforces] of ACTIVE) {
  const r = spawnSync(
    "node",
    ["--experimental-strip-types", "--no-warnings", `audits/${name}.mjs`],
    { stdio: "inherit" },
  );
  if (r.status !== 0) failed++;
}

// --- Casos del motor de puntuación (F3) ----------------------------------
//
// No es un auditor: es la prueba de la fórmula de D-010 y D-024. Corre aquí
// porque el fallo que previene es del mismo tipo que el que previenen los
// auditores — un signo invertido en `(2·acc − 1)` no rompe nada, produce un
// tablero injusto que nadie nota hasta que un niño pregunta por qué su hermano
// tiene más puntos con menos aciertos.
//
// `--experimental-strip-types` porque el motor es TypeScript y la prueba es
// JavaScript: se ejecuta el MISMO archivo que se despliega, no una copia
// compilada que podría diferir.
for (const prueba of [
  "packages/motor/src/bandas.prueba.mjs",
  "packages/motor/src/alias.prueba.mjs",
  "packages/motor/src/pin-imagenes.prueba.mjs",
  "apps/web/src/lib/passwords.prueba.mjs",
  "apps/web/src/lib/sesiones.prueba.mjs",
  "packages/motor/src/puntuacion.prueba.mjs",
  "packages/motor/src/sesion.prueba.mjs",
  "packages/motor/src/numeros.prueba.mjs",
  "packages/motor/src/item.prueba.mjs",
  "packages/motor/src/offline.prueba.mjs",
  "packages/motor/src/rollup.prueba.mjs",
  "packages/motor/src/banco.prueba.mjs",
  "packages/motor/src/historia.prueba.mjs",
  "packages/motor/src/cola.prueba.mjs",
]) {
  const r = spawnSync(
    "node",
    ["--experimental-strip-types", "--no-warnings", prueba],
    { stdio: "inherit" },
  );
  if (r.status !== 0) failed++;
}

console.log(`\n── pendientes de fase ──`);
for (const [name, what, when] of PENDING) {
  console.log(`  ○ ${name.padEnd(18)} ${what}`);
  console.log(`    ${" ".repeat(18)} ${when}`);
}

console.log(`\n── flota adversarial (F1) ──`);
console.log(`  ● ${ADVERSARIAL_COUNT} auditores con LLM, cada uno con su carta`);
console.log(`    corre antes de abrir el PR:  node audits/adversarial.mjs`);
console.log(`    sin gastar nada:             node audits/adversarial.mjs --seco`);

const total = ACTIVE.length + PENDING.length + ADVERSARIAL_COUNT;
console.log(
  `\n${ACTIVE.length + ADVERSARIAL_COUNT} construidos · ${PENDING.length} esperando fase · ${total} planeados (D-032)`,
);

if (failed > 0) {
  console.error(`\n✗ ${failed} auditor(es) bloquearon.`);
  console.error(`  Anular exige escribir por qué, y queda en el historial (D-032).`);
  process.exit(1);
}
console.log("\n✓ todos los auditores activos pasaron");
