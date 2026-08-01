#!/usr/bin/env node
// Auditor determinista — toda causa de error tiene texto en los siete locales
//
// Hace cumplir: `mc-11` (retroalimentación formativa), línea roja #7 (Larry
// nunca avergüenza), D-022 (siete locales), criterio #45 de F3.
//
// Por qué existe. El motor ya sabe QUÉ error cometió el niño: devuelve
// `error.multiplico` en vez de «mal». Pero una clave sin texto no le dice nada a
// nadie — la pantalla muestra la clave cruda, o un hueco, y solo se descubre
// mirando esa pantalla en ese idioma.
//
// Y hay un fallo peor que el hueco: que la causa exista en inglés y falte en
// alemán. Entonces el producto funciona en las pruebas de quien lo escribió y
// falla exactamente para el niño que no habla el idioma de quien lo escribió.
//
// LO QUE NO PUEDE COMPROBAR: si el texto es bueno. `mc-11` §6 y Kluger & DeNisi
// son explícitos en que la retroalimentación mal dada EMPEORA el desempeño, así
// que «hay texto» no es el criterio. Que nombre el error y dé el siguiente paso
// sin elogiar la capacidad lo juzga una persona.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { archivos, leer, informar, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];

// --- 1. Las causas que el banco produce -------------------------------------
const banco = await import(`${RAIZ}packages/motor/src/banco-kinder.ts`).catch(() => null);
if (!banco) {
  problemas.push("no pude importar el banco para saber qué causas produce");
}

const causasDelBanco = banco
  ? [...new Set(banco.generarBanco().flatMap((i) => i.errores.map((e) => e.causa)))].sort()
  : [];

// --- 2. Los archivos de mensajes --------------------------------------------
const mensajes = {};

// TODOS los .json del directorio, no solo los siete conocidos. Un archivo suelto
// ahí se sirve igual que cualquier otro, y leyendo solo la lista conocida sería
// invisible — lo cazó el arnés de pruebas, que escribe uno para comprobarlo.
const enElDirectorio = existsSync(`${RAIZ}${DIR}`)
  ? readdirSync(`${RAIZ}${DIR}`).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""))
  : [];
for (const suelto of enElDirectorio) {
  if (LOCALES.includes(suelto)) continue;
  try {
    mensajes[suelto] = JSON.parse(leer(`${DIR}/${suelto}.json`) ?? "{}");
  } catch {
    problemas.push(`${DIR}/${suelto}.json no es JSON válido`);
  }
}

for (const loc of LOCALES) {
  const ruta = `${DIR}/${loc}.json`;
  if (!existsSync(`${RAIZ}${ruta}`)) {
    problemas.push(`falta ${ruta}: el locale ${loc} no tiene retroalimentación`);
    continue;
  }
  try {
    mensajes[loc] = JSON.parse(leer(ruta) ?? "{}");
  } catch (err) {
    problemas.push(`${ruta} no es JSON válido: ${String(err).slice(0, 80)}`);
  }
}

// --- 3. Ninguna causa sin texto, en ningún locale ---------------------------
for (const causa of causasDelBanco) {
  const faltan = LOCALES.filter((l) => mensajes[l] && !(causa in mensajes[l]));
  if (faltan.length > 0) {
    problemas.push(
      `\`${causa}\` no tiene texto en ${faltan.join(", ")}. El motor devuelve esa causa y la ` +
        "pantalla mostraría la clave cruda o un hueco — y solo en ese idioma, así que funciona " +
        "en las pruebas de quien lo escribió (mc-11, D-022).",
    );
  }
}

// --- 4. Cada causa dice QUÉ pasó y CUÁL es el siguiente paso ---------------
for (const [loc, m] of Object.entries(mensajes)) {
  for (const [clave, valor] of Object.entries(m)) {
    if (!clave.startsWith("error.") && clave !== "inesperada") continue;
    if (!Array.isArray(valor) || valor.length !== 2) {
      problemas.push(
        `${loc}: \`${clave}\` no son dos frases. mc-11 pide nombrar el error Y dar el siguiente ` +
          "paso: un marcador desnudo o un «mal» solo empeoran el desempeño (Kluger & DeNisi).",
      );
      continue;
    }
    for (const frase of valor) {
      if (typeof frase !== "string" || frase.trim() === "") {
        problemas.push(`${loc}: \`${clave}\` tiene una frase vacía`);
      }
    }
  }
}

// --- 5. Nunca elogio a la capacidad (mc-11 §6) ------------------------------
//
// «¡Qué listo eres!» atribuye el resultado a un rasgo fijo. Cuando después algo
// sale mal, la misma atribución dice que el rasgo falló. Se elogia el proceso o
// no se elogia.
const ELOGIO_A_LA_CAPACIDAD =
  /\b(listo|lista|inteligente|genio|crack|brillante|smart|clever|genius|brilliant|schlau|klug|intelligent|malin|intelligente|esperto|génio)\b/i;

for (const [loc, m] of Object.entries(mensajes)) {
  for (const [clave, valor] of Object.entries(m)) {
    const texto = Array.isArray(valor) ? valor.join(" ") : String(valor);
    if (ELOGIO_A_LA_CAPACIDAD.test(texto)) {
      problemas.push(
        `${loc}: \`${clave}\` elogia la capacidad — «${texto.slice(0, 60)}». mc-11 §6: elogiar un ` +
          "rasgo fijo hace que el siguiente fallo se lea como que el rasgo falló.",
      );
    }
  }
}

if (causasDelBanco.length > 0) {
  notas.push(`${causasDelBanco.length} causa(s) en el banco, todas con texto en los 7 locales`);
}
notas.push(`locales con retroalimentación: ${Object.keys(mensajes).join(", ")}`);

informar({
  nombre: "retro-completa",
  problemas,
  notas,
  cita: "mc-11, línea roja #7, D-022, criterio #45 de F3",
  revisados: Object.keys(mensajes).length,
  resumen: `${Object.keys(mensajes).length} locale(s) · ${causasDelBanco.length} causa(s) del banco`,
  porQueBloquea:
    "una causa sin texto muestra la clave cruda, y solo en el idioma que no habla quien " +
    "escribió el código — funciona en sus pruebas y falla para el niño (mc-11, D-022).",
  noComprueba: [
    "si el texto es bueno. «Hay feedback» no es el criterio: la retroalimentación mal dada " +
      "EMPEORA el desempeño (Kluger & DeNisi, mc-11 §6). Eso lo juzga una persona.",
  ],
});
