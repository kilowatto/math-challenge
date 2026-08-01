#!/usr/bin/env node
// Prueba de las dos reglas de D-032 — sin gastar una llamada de LLM.
//
//   node audits/adversarial/prueba.mjs
//
// Prueba la clasificación con veredictos escritos a mano, porque es ahí donde
// la flota se rompe en silencio: un error aquí no revienta, solo hace que un
// bloqueante se reporte como observación (o al revés), y nadie se entera.
//
// Cada caso se vio fallar antes de existir el código que lo arregla — CLAUDE.md
// § Git, regla 3. Para volver a verlo: rompe `clasificar()` a propósito
// (por ejemplo, quita el `carta.cita.includes(...)`) y corre esto.

import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cargarUniverso } from "./citas.mjs";
import { leerAnulaciones, huella } from "./anulaciones.mjs";
import { clasificar } from "./reglas.mjs";
import { CARTAS, POR_ID } from "./cartas.mjs";
import { validar, extraerJSON } from "./esquema.mjs";
import { ESQUEMA_VEREDICTO } from "./cliente.mjs";
import { construirSarif } from "./sarif.mjs";
import { comparar } from "./informe.mjs";
import { extraerCitasTextuales, verificarEvidencia } from "./evidencia.mjs";

const universo = cargarUniverso();
let fallos = 0;

const comprobar = (nombre, real, esperado) => {
  const ok = real === esperado;
  console.log(`  ${ok ? "✓" : "✗"} ${nombre}${ok ? "" : `  — esperaba ${esperado}, dio ${real}`}`);
  if (!ok) fallos++;
};

const hallazgo = (extra) => ({
  archivo: "apps/web/src/x.ts",
  linea: 12,
  gravedad: "bloqueante",
  resumen: "resumen de prueba",
  evidencia: "evidencia de prueba",
  arreglo: "arreglo de prueba",
  ...extra,
});

const carta = POR_ID.get("kinder"); // cita LR-3, D-017, D-020, D-024, mc-06, mc-20, mc-38

console.log("Reglas de D-032 — clasificación de hallazgos\n");

// --- Regla 1: sin cita real, es opinión ----------------------------------
{
  const c = clasificar([hallazgo({ cita_tipo: "decision", cita_id: "D-999" })], carta, universo);
  comprobar("una cita inventada no bloquea", c.bloqueantes.length, 0);
  comprobar("una cita inventada se descarta", c.invalidos.length, 1);
}

// --- Regla 1, segunda mitad: la carta delimita qué puede invocar ---------
{
  // D-021 existe (monetización), pero no está en la carta de kinder. Sin este
  // corte, cualquier auditor podría invocar cualquier decisión y la división de
  // trabajo entre los 28 sería decorativa.
  const c = clasificar([hallazgo({ cita_tipo: "decision", cita_id: "D-021" })], carta, universo);
  comprobar("una decisión real fuera de la carta no bloquea", c.bloqueantes.length, 0);
  comprobar("una decisión real fuera de la carta se descarta", c.invalidos.length, 1);
}

// --- Qué bloquea: línea roja y decisión sí; investigación no -------------
{
  const c = clasificar([hallazgo({ cita_tipo: "linea-roja", cita_id: "LR-3" })], carta, universo);
  comprobar("línea roja + gravedad bloqueante → bloquea", c.bloqueantes.length, 1);
}
{
  const c = clasificar([hallazgo({ cita_tipo: "decision", cita_id: "D-024" })], carta, universo);
  comprobar("decisión + gravedad bloqueante → bloquea", c.bloqueantes.length, 1);
}
{
  // D-032: "Los adversariales bloquean únicamente cuando citan una línea roja o
  // una decisión explícita; el resto reporta sin detener el PR."
  const c = clasificar([hallazgo({ cita_tipo: "investigacion", cita_id: "mc-20" })], carta, universo);
  comprobar("investigación NO bloquea, por convincente que sea", c.bloqueantes.length, 0);
  comprobar("investigación sí se reporta", c.reportados.length, 1);
}
{
  const c = clasificar([hallazgo({ cita_tipo: "linea-roja", cita_id: "LR-3", gravedad: "grave" })], carta, universo);
  comprobar("línea roja con gravedad 'grave' reporta, no bloquea", c.bloqueantes.length, 0);
}

// --- Regla 2: anular exige haberlo escrito -------------------------------
const dir = mkdtempSync(join(tmpdir(), "mc-anul-"));

const escribir = (contenido) => {
  const ruta = join(dir, "ANULACIONES.md");
  writeFileSync(ruta, contenido);
  return leerAnulaciones(ruta);
};

{
  const anul = escribir(
    "### `kinder` · `apps/web/src/x.ts` · `LR-3` · 2026-08-01 · Esteban\n\n" +
      "Razón: el campo es de un flujo de adulto y el auditor lo confundió con kinder.\n",
  );
  const c = clasificar([hallazgo({ cita_tipo: "linea-roja", cita_id: "LR-3" })], carta, universo, anul);
  comprobar("una anulación escrita levanta el bloqueo", c.bloqueantes.length, 0);
  comprobar("y el hallazgo queda registrado como anulado", c.anulados.length, 1);
}

{
  // Fallar cerrado: si una razón vacía valiera, la regla 2 se cumpliría
  // escribiendo un encabezado, y eso no es escribir por qué.
  const anul = escribir("### `kinder` · `apps/web/src/x.ts` · `LR-3` · 2026-08-01 · Esteban\n\nRazón: no.\n");
  const c = clasificar([hallazgo({ cita_tipo: "linea-roja", cita_id: "LR-3" })], carta, universo, anul);
  comprobar("una razón de tres letras NO anula nada", c.bloqueantes.length, 1);
}

{
  // La anulación es puntual. Otro archivo es otro hallazgo.
  const anul = escribir(
    "### `kinder` · `apps/web/src/x.ts` · `LR-3` · 2026-08-01 · Esteban\n\n" +
      "Razón: el campo es de un flujo de adulto y el auditor lo confundió con kinder.\n",
  );
  const c = clasificar(
    [hallazgo({ cita_tipo: "linea-roja", cita_id: "LR-3", archivo: "apps/web/src/otro.ts" })],
    carta,
    universo,
    anul,
  );
  comprobar("la anulación no se contagia a otro archivo", c.bloqueantes.length, 1);
}

comprobar(
  "la huella ignora el texto del hallazgo (el modelo lo redacta distinto cada vez)",
  huella("kinder", "a.ts", "LR-3") === huella("kinder", "a.ts", "LR-3"),
  true,
);

// --- La flota completa ---------------------------------------------------
// D-032 decía 23. Son 28 desde que se añadieron las seis cartas de locale —
// una por idioma— para que el corpus traducido tuviera quien lo mirara con
// hostilidad en cada lengua. La decisión está enmendada con esa razón.
//
// El número sigue escrito a mano y no derivado de `CARTAS.length`, que sería
// una prueba que no puede fallar: existe justamente para que añadir una carta
// obligue a tocar la decisión, y no al revés.
comprobar("D-032 pide 28 adversariales", CARTAS.length, 28);
comprobar("cada carta tiene al menos una cita", CARTAS.every((c) => c.cita.length > 0), true);
comprobar("cada carta declara de qué es ciega", CARTAS.every((c) => c.ciega_a?.length > 20), true);
comprobar("ningún id de carta repetido", new Set(CARTAS.map((c) => c.id)).size, 28);

// --- El veredicto mal formado (D-035) ------------------------------------
// Con la API de Claude el esquema se imponía en la capa de la herramienta. El
// JSON Mode de Workers AI es best-effort — su propia documentación dice que "no
// puede garantizar que el modelo responda según el esquema pedido"—, así que
// esta validación es ahora lo único entre un veredicto roto y un auditor que
// parece limpio. Es la parte nueva más delicada de toda la flota.
console.log("\nVeredictos mal formados — el JSON de Workers AI es best-effort\n");

const bueno = { hallazgos: [], nota: "" };

comprobar("un veredicto vacío pero bien formado valida", validar(bueno, ESQUEMA_VEREDICTO).length, 0);

comprobar(
  "un hallazgo al que le falta `arreglo` no valida",
  validar({ hallazgos: [{ archivo: "a.ts", linea: 1, gravedad: "menor", resumen: "x", evidencia: "y", cita_tipo: "decision", cita_id: "D-001" }], nota: "" }, ESQUEMA_VEREDICTO).length > 0,
  true,
);

comprobar(
  "una gravedad inventada no valida",
  validar({ hallazgos: [{ archivo: "a.ts", linea: 1, gravedad: "catastrofico", resumen: "x", evidencia: "y", cita_tipo: "decision", cita_id: "D-001", arreglo: "z" }], nota: "" }, ESQUEMA_VEREDICTO).length > 0,
  true,
);

comprobar(
  "`linea` como texto no valida (el modelo chico manda \"12\" en vez de 12)",
  validar({ hallazgos: [{ archivo: "a.ts", linea: "12", gravedad: "menor", resumen: "x", evidencia: "y", cita_tipo: "decision", cita_id: "D-001", arreglo: "z" }], nota: "" }, ESQUEMA_VEREDICTO).length > 0,
  true,
);

comprobar("un campo de más no valida (additionalProperties: false)", validar({ ...bueno, extra: 1 }, ESQUEMA_VEREDICTO).length > 0, true);
comprobar("falta `nota` y no valida", validar({ hallazgos: [] }, ESQUEMA_VEREDICTO).length > 0, true);

// Extracción: un modelo best-effort envuelve, precede y comenta.
comprobar("JSON pelón se extrae", extraerJSON('{"hallazgos":[],"nota":""}')?.nota, "");
comprobar("JSON en bloque cercado se extrae", extraerJSON('```json\n{"hallazgos":[],"nota":"a"}\n```')?.nota, "a");
comprobar("JSON con prólogo se extrae", extraerJSON('Claro, aquí tienes:\n{"hallazgos":[],"nota":"b"}')?.nota, "b");
comprobar(
  "una llave dentro de una cadena no rompe el balanceo",
  extraerJSON('texto {"hallazgos":[],"nota":"esto trae una } suelta"} cola')?.nota,
  "esto trae una } suelta",
);
comprobar("prosa sin JSON devuelve null, no un objeto vacío", extraerJSON("No encontré nada que reportar."), null);
comprobar("un arreglo suelto no cuenta como veredicto", extraerJSON("[1,2,3]"), null);

// --- SARIF 2.1.0 (OASIS Standard) ----------------------------------------
// Un informe que dice ser SARIF y no lo es, es peor que uno propio: la
// herramienta que lo ingiera va a fallar o —peor— a leerlo mal en silencio.
console.log("\nSARIF 2.1.0 — conformidad con el estándar OASIS\n");

const hSarif = (o) => ({
  archivo: "apps/web/public/sw.js", linea: 12, gravedad: "bloqueante",
  resumen: "r", evidencia: "e", arreglo: "a", auditor: "pwa-ios", ...o,
});

const sarif = construirSarif({
  hallazgos: [
    { ...hSarif({ cita_id: "D-031" }), bloquea: true },
    { ...hSarif({ cita_id: "mc-33", gravedad: "menor", linea: 0 }), bloquea: false },
  ],
  anulados: [hSarif({ cita_id: "LR-3", anulacion: { fecha: "2026-07-31", quien: "Esteban", razon: "razón larga y suficiente" } })],
  fallidos: [{ auditor: "kinder", error: "timeout" }],
  meta: { fecha: "2026-07-31", modo: "rama", base: "abc", archivos: 1, modelo: "@cf/moonshotai/kimi-k2.6" },
  universo, cartas: POR_ID,
});
const run = sarif.runs[0];
const porId = (id) => run.results.find((r) => r.ruleId === id);

comprobar("version es exactamente 2.1.0", sarif.version, "2.1.0");
comprobar("declara el esquema de SARIF 2.1.0", sarif.$schema.includes("sarif-schema-2.1.0"), true);
comprobar("una regla por cita usada, sin repetir", run.tool.driver.rules.length, 3);
comprobar("`level` solo usa valores del estándar",
  run.results.every((r) => ["error","warning","note","none"].includes(r.level)), true);
comprobar("una decisión es `error`", porId("D-031").level, "error");
comprobar("investigación NUNCA es `error` — no bloquea (D-032)", porId("mc-33").level, "note");
comprobar("la regla codifica qué puede bloquear",
  run.tool.driver.rules.find((r) => r.id === "mc-33").properties.puedeBloquear, false);
comprobar("`ruleIndex` apunta a la regla correcta",
  run.tool.driver.rules[porId("D-031").ruleIndex].id, "D-031");
comprobar("cada cita lleva helpUri al documento real",
  run.tool.driver.rules.every((r) => r.helpUri.startsWith("https://")), true);
comprobar("la regla 2 de D-032 va como suppression `external`", porId("LR-3").suppressions[0].kind, "external");
comprobar("la suppression carga la razón escrita",
  porId("LR-3").suppressions[0].justification, "razón larga y suficiente");
comprobar("`startLine` se omite cuando no hay línea (SARIF exige >= 1)",
  porId("mc-33").locations[0].physicalLocation.region, undefined);
comprobar("un auditor fallido marca la invocación como no exitosa",
  run.invocations[0].executionSuccessful, false);
comprobar("y deja constancia de qué área quedó sin revisar",
  run.invocations[0].toolExecutionNotifications.length, 1);
// `fixes` NO se usa: el estándar exige `artifactChanges` —un parche aplicable—
// y un auditor con LLM produce prosa. Declarar un fix sin parche le promete a
// la herramienta consumidora un botón de "aplicar" que no existe. Lo detectó el
// validador oficial, no una prueba escrita a mano.
comprobar("no se declara `fixes` sin parche aplicable", porId("D-031").fixes, undefined);
comprobar("el arreglo va en properties", porId("D-031").properties.arreglo, "a");
comprobar("y también en el mensaje, donde cualquier visor lo muestra",
  porId("D-031").message.text.includes("Arreglo propuesto: a"), true);
comprobar("el helpUri de una línea roja valida como URI (sin acentos crudos)",
  /^[\x21-\x7E]+$/.test(run.tool.driver.rules.find((r) => r.id === "LR-3").helpUri), true);
comprobar("partialFingerprints usa la misma huella que ANULACIONES",
  porId("D-031").partialFingerprints.auditorArchivoCita, huella("pwa-ios", "apps/web/public/sw.js", "D-031"));

// --- Seguimiento entre corridas (el plan de remediación) -----------------
console.log("\nSeguimiento entre corridas\n");
const uno = { auditor: "pwa-ios", archivo: "a.ts", cita_id: "D-031", resumen: "x" };
const dos = { auditor: "kinder", archivo: "b.ts", cita_id: "LR-3", resumen: "y" };

comprobar("la primera corrida marca todo como nuevo", comparar([uno], null).primera, true);
comprobar("un hallazgo que sigue ahí es persistente, no nuevo",
  comparar([uno], { hallazgos: [uno] }).persistentes.length, 1);
comprobar("un hallazgo que ya no está cuenta como resuelto",
  comparar([], { hallazgos: [uno] }).resueltos.length, 1);
comprobar("uno nuevo se distingue de uno que ya estaba",
  comparar([uno, dos], { hallazgos: [uno] }).nuevos.length, 1);

// --- Evidencia fabricada: el caso real de la primera corrida --------------
// `locale-pt-PT` citó D-022 —que existe— y afirmó que pt-PT.json contenía
// "Ainda sem versión pública". El archivo dice "versão". Cita válida, evidencia
// inventada, y salió clasificado como bloqueante. Esto es esa corrida,
// reproducida con las cadenas exactas.
console.log("\nEvidencia fabricada — el caso que se coló en la corrida real\n");

const TURNO_REAL = 'El archivo apps/web/src/i18n/pt-PT.json contiene "status": "Em construção. Ainda sem versão pública."';
const cartaPT = POR_ID.get("locale-pt-PT");
const hPT = (evidencia) => ({
  archivo: "apps/web/src/i18n/pt-PT.json", linea: 21, gravedad: "bloqueante",
  resumen: "palabra en español en el locale pt-PT", evidencia,
  cita_tipo: "decision", cita_id: "D-022", arreglo: "usar versão",
});

comprobar(
  "la evidencia inventada YA NO bloquea",
  clasificar([hPT('La clave contiene el fragmento "Ainda sem versión pública".')], cartaPT, universo, new Map(), TURNO_REAL).bloqueantes.length,
  0,
);
comprobar(
  "pero se sigue reportando — puede tener razón de fondo",
  clasificar([hPT('La clave contiene el fragmento "Ainda sem versión pública".')], cartaPT, universo, new Map(), TURNO_REAL).reportados[0].evidenciaNoVerificable,
  true,
);
comprobar(
  "la misma evidencia, si fuera cierta, SÍ bloquea",
  clasificar([hPT('La clave contiene el fragmento "Ainda sem versão pública".')], cartaPT, universo, new Map(), TURNO_REAL).bloqueantes.length,
  1,
);
comprobar(
  "sin turno que comparar, no se degrada nada (no se inventa un veredicto)",
  clasificar([hPT('cita "inventada totalmente aqui"')], cartaPT, universo, new Map(), null).bloqueantes.length,
  1,
);
comprobar(
  "un auditor que parafrasea sin citar pasa — limitación conocida, no un pase",
  verificarEvidencia({ evidencia: "El archivo usa una palabra del castellano." }, TURNO_REAL).sinCitas,
  true,
);
comprobar("extrae de acentos graves", extraerCitasTextuales("dice `Ainda sem versão`").length, 1);
comprobar("extrae de comillas angulares", extraerCitasTextuales("dice «Ainda sem versão»").length, 1);
comprobar(
  "los acentos NO se normalizan — versión ≠ versão es justo el fallo a detectar",
  verificarEvidencia({ evidencia: '"Ainda sem versión"' }, TURNO_REAL).verificable,
  false,
);
comprobar(
  "un salto de línea de más no marca como fabricada una cita correcta",
  verificarEvidencia({ evidencia: '"Ainda sem\n  versão pública"' }, TURNO_REAL).verificable,
  true,
);

console.log(fallos === 0 ? `\n✓ ${61} comprobaciones` : `\n✗ ${fallos} fallo(s)`);
process.exit(fallos === 0 ? 0 : 1);
