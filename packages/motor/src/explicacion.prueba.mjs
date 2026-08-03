#!/usr/bin/env node
// La explicación pregenerada — D-004 punto 1, D-074, línea roja #7.
//
// Criterios de F6: #132 (Larry nunca calcula) y #137 (funciona offline y sin
// modelo). Los dos se cierran corriendo su comprobación, no por criterio propio.
//
// Los mensajes NO son de juguete: se leen los siete archivos reales de
// `apps/web/src/i18n/reto/`. Una prueba con un diccionario inventado pasa en
// verde mientras la pantalla sirve la clave cruda, que es exactamente el fallo
// de #349.

import { readFileSync } from "node:fs";
import { calificarRespuesta } from "./item.ts";
import {
  componerExplicacion,
  explicarEnLocale,
  sellarSobre,
  modoDeProcedimiento,
  CAMPOS_DEL_SOBRE,
  PROCEDIMIENTO_POR_MATERIA,
} from "./explicacion.ts";

let fallos = 0, corridos = 0;
function caso(nombre, fn) {
  corridos++;
  try { fn(); console.log(`  ✓ ${nombre}`); }
  catch (err) { fallos++; console.error(`  ✗ ${nombre}`); console.error(`      ${err.message}`); }
}
const es = (a, b, m) => {
  if (a !== b) throw new Error(`${m ?? "valor"}: esperaba ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`);
};
const cierto = (v, m) => { if (!v) throw new Error(m ?? "esperaba verdadero"); };

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const RAIZ = new URL("../../../", import.meta.url).pathname;
const CATALOGOS = Object.fromEntries(
  LOCALES.map((l) => [l, JSON.parse(readFileSync(`${RAIZ}apps/web/src/i18n/reto/${l}.json`, "utf8"))]),
);
const EN = CATALOGOS.en;

// El mismo ítem que usa `item.prueba.mjs`: 3 + 4, con tres errores nombrados.
const ITEM = {
  id: "k11-001", habilidad: "K11", nivel: 2, formato: "toca_la_respuesta",
  enunciado: { clave: "k.suma.patos", vars: { a: 3, b: 4 } },
  respuesta: { valor: 7, tol: 0 },
  errores: [
    { valor: 12, causa: "error.multiplico" },
    { valor: 1, causa: "error.resto" },
    { valor: 8, causa: "error.conto_el_primero_dos_veces" },
  ],
  proposito: "interpretar",
  variacion: null,
};

const sobreDe = (eleccion, extra = {}) =>
  sellarSobre({ ...calificarRespuesta(ITEM, eleccion), habilidad: ITEM.habilidad, ...extra });

console.log("\n== la explicación pregenerada — F6 #132, #137, D-074 ==\n");

// --- Lo que hoy se tira: la causa nombrada llega hasta la frase --------------

caso("el error nombrado deja de ser «esta vez no» y pasa a NOMBRAR el error", () => {
  const e = componerExplicacion(sobreDe(12), EN);
  es(e.origen, "causa");
  es(e.titulo, "You multiplied instead of adding.");
  es(e.siguiente, "Count on from the bigger number.");
});

caso("las tres causas del ítem producen tres explicaciones DISTINTAS", () => {
  const textos = [12, 1, 8].map((v) => componerExplicacion(sobreDe(v), EN).titulo);
  es(new Set(textos).size, 3, "tres causas, tres textos");
});

caso("acertar confirma sin elogiar la capacidad (mc-11 §6)", () => {
  const e = componerExplicacion(sobreDe(7), EN);
  es(e.origen, "acierto");
  es(e.titulo, "That's it.");
  es(e.siguiente, "", "el acierto no lleva «siguiente paso»: no hay nada que corregir");
});

caso("una respuesta que nadie previó cae en el genérico, NUNCA en la clave cruda", () => {
  const e = componerExplicacion(sobreDe(99), EN);
  es(e.origen, "inesperada");
  es(e.titulo, "Not that one.");
  es(e.siguiente, "Try again, no rush.");
});

caso("una causa SIN texto autorado cae al genérico y no imprime la clave (#349)", () => {
  const e = componerExplicacion(sellarSobre({ acc: 0, causa: "error.inventado", habilidad: "K11" }), EN);
  es(e.origen, "inesperada");
  cierto(!e.titulo.includes("error.inventado"), `pintó la clave: «${e.titulo}»`);
  cierto(!e.siguiente.includes("error."), `pintó la clave: «${e.siguiente}»`);
});

caso("toda causa del banco tiene explicación de dos frases en los SIETE locales", () => {
  const causas = Object.keys(EN).filter((k) => k.startsWith("error."));
  for (const locale of LOCALES) {
    for (const causa of causas) {
      const e = explicarEnLocale(sellarSobre({ acc: 0, causa, habilidad: "K11" }), locale, CATALOGOS);
      es(e.origen, "causa", `${locale} · ${causa}`);
      cierto(e.titulo.trim() !== "" && e.siguiente.trim() !== "", `${locale} · ${causa} vacío`);
    }
  }
});

// --- Línea roja #7: Larry nunca calcula (#132) ------------------------------

caso("el sobre NO tiene dónde poner los operandos, la respuesta ni la elección", () => {
  const prohibidos = [
    "vars", "enunciado", "respuesta", "eleccion", "operandos", "errores",
    "rtMs", "puntos", "racha", "childProfileId", "nivel", "dificultad",
  ];
  for (const p of prohibidos) {
    cierto(!CAMPOS_DEL_SOBRE.includes(p), `\`${p}\` está en la lista blanca del sobre`);
  }
});

caso("sellarSobre DESCARTA todo lo que no está en la lista blanca", () => {
  const sobre = sellarSobre({
    acc: 0, causa: "error.multiplico", habilidad: "K11",
    // Todo esto llega desde el Worker de ingesta y NO debe viajar.
    vars: { a: 3, b: 4 }, respuesta: 7, eleccion: 12, rtMs: 4200,
    puntos: 12, racha: 3, childProfileId: "uuid-de-un-niño",
  });
  for (const clave of Object.keys(sobre)) {
    cierto(CAMPOS_DEL_SOBRE.includes(clave), `\`${clave}\` sobrevivió al sellado`);
  }
  es(JSON.stringify(sobre).includes("4200"), false, "el tiempo de respuesta viajó");
  es(JSON.stringify(sobre).includes("uuid"), false, "el id del niño viajó");
});

caso("ningún número del ítem aparece en la explicación: no hay de dónde sacarlo", () => {
  // 3, 4 y 7 son los operandos y la respuesta. Ninguno está en el sobre, así que
  // ninguno puede estar en la salida — y esta prueba lo comprueba, no lo supone.
  for (const eleccion of [7, 12, 1, 8, 99]) {
    const e = componerExplicacion(sobreDe(eleccion), EN);
    const todo = `${e.titulo} ${e.siguiente}`;
    cierto(!/[0-9]/.test(todo), `salió un dígito: «${todo}»`);
  }
});

caso("es PURA: la misma entrada da la misma salida, sin red y sin reloj (#137)", () => {
  const a = JSON.stringify(componerExplicacion(sobreDe(12), EN));
  const b = JSON.stringify(componerExplicacion(sobreDe(12), EN));
  es(a, b);
  // Y sin `fetch`: si el módulo lo llamara, esto reventaría.
  const guardado = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("la explicación pregenerada tocó la red"); };
  try { componerExplicacion(sobreDe(12), EN); } finally { globalThis.fetch = guardado; }
});

// --- D-074: el juicio por PASO, y dónde Larry deja de dictaminar ------------

const PASOS = [
  { clave: "paso.uno", juicio: "bien" },
  { clave: "paso.dos", juicio: "mal", causa: "error.multiplico" },
];
const CON_PASOS = { ...EN, "paso.uno": "the units column", "paso.dos": "the tens column" };

caso("en una materia JUZGABLE, Larry explica cada paso que el motor juzgó", () => {
  const e = componerExplicacion(
    sellarSobre({ acc: 0, causa: "error.multiplico", habilidad: "K11", materia: "reagrupacion", pasos: PASOS }),
    CON_PASOS,
  );
  es(e.pasos.length, 2);
  es(e.pasos[0].texto, "the units column: this step holds.");
  cierto(e.pasos[0].dictamina && e.pasos[1].dictamina, "los dos pasos dictaminan");
  es(e.describeSinDictaminar, false);
});

caso("en una materia DESCRIBIBLE, Larry describe y NO dictamina (D-074 §3)", () => {
  const e = componerExplicacion(
    sellarSobre({ acc: 0, habilidad: "M99", materia: "topologia", pasos: PASOS }),
    CON_PASOS,
  );
  es(e.pasos.length, 2);
  es(e.describeSinDictaminar, true);
  for (const p of e.pasos) {
    es(p.dictamina, false, `dictaminó: «${p.texto}»`);
    es(p.texto.includes("does not hold"), false, `dictaminó en palabras: «${p.texto}»`);
    es(p.texto.includes("this step holds"), false, `dictaminó en palabras: «${p.texto}»`);
  }
});

caso("el juicio que el motor NO debió emitir se descarta aquí, no se repite", () => {
  // El caso que D-074 escribió: «una alucinación se convierte en "tu
  // procedimiento está mal" dicho a alguien que lo tenía bien». Aunque el
  // veredicto traiga `juicio: "mal"`, en una materia describible no se dice.
  const e = componerExplicacion(
    sellarSobre({
      acc: 0, habilidad: "M99", materia: "hipotesis_de_riemann",
      pasos: [{ clave: "paso.uno", juicio: "mal", causa: "error.multiplico" }],
    }),
    CON_PASOS,
  );
  es(e.pasos[0].dictamina, false);
  es(e.pasos[0].texto, "the units column: this step is not checked here.");
});

caso("un paso que el motor no pudo juzgar se describe aunque la materia sea juzgable", () => {
  const e = componerExplicacion(
    sellarSobre({
      acc: 0, habilidad: "K11", materia: "division_larga",
      pasos: [{ clave: "paso.uno", juicio: null }],
    }),
    CON_PASOS,
  );
  es(e.pasos[0].dictamina, false);
  es(e.describeSinDictaminar, true);
});

caso("el disparador es la MATERIA, no la banda: kinder no recibe pasos jamás", () => {
  const e = componerExplicacion(
    sellarSobre({ acc: 0, causa: "error.multiplico", habilidad: "K11", materia: "conteo", pasos: PASOS }),
    CON_PASOS,
  );
  es(e.pasos.length, 0, "contar patos no tiene procedimiento que explicar");
  // Y sin materia declarada, tampoco: el default silencioso es no pronunciarse.
  const sinMateria = componerExplicacion(
    sellarSobre({ acc: 0, causa: "error.multiplico", habilidad: "K11", pasos: PASOS }),
    CON_PASOS,
  );
  es(sinMateria.pasos.length, 0);
});

caso("una materia desconocida cae en «no se pronuncia», no en «se pronuncia»", () => {
  es(modoDeProcedimiento("materia_que_nadie_escribió"), "no_aplica");
  es(modoDeProcedimiento(undefined), "no_aplica");
  // Y las tres que el dueño nombró literalmente en D-074 están en la tabla.
  for (const m of ["topologia", "calculo_avanzado", "hipotesis_de_riemann"]) {
    es(PROCEDIMIENTO_POR_MATERIA[m], "describible", m);
  }
});

caso("un paso sin nombre autorado no se pinta como su clave (#349, otra vez)", () => {
  const e = componerExplicacion(
    sellarSobre({ acc: 0, habilidad: "M99", materia: "topologia", pasos: [{ clave: "paso.sin_autorar", juicio: null }] }),
    EN,
  );
  es(e.pasos.length, 0);
});

// --- Anti-vergüenza en la costura (#133, línea roja #7) ---------------------

caso("ninguna explicación cuenta las veces que se ha fallado", () => {
  // No hay dónde: el sobre no tiene intento, ni racha, ni historial. Si algún
  // día lo tuviera, esta prueba seguiría verde y el auditor `larry-nunca-calcula`
  // es quien bloquea — por eso son dos comprobaciones y no una.
  for (const p of ["intento", "intentos", "fallos", "historial", "racha", "veces"]) {
    cierto(!CAMPOS_DEL_SOBRE.includes(p), `\`${p}\` está en el sobre`);
  }
});

caso("un fallo SIEMPRE trae el siguiente paso: nunca un marcador desnudo (Shute)", () => {
  for (const locale of LOCALES) {
    for (const eleccion of [12, 1, 8, 99]) {
      const e = explicarEnLocale(sobreDe(eleccion), locale, CATALOGOS);
      cierto(e.siguiente.trim() !== "", `${locale} · ${eleccion}: sin siguiente paso`);
    }
  }
});

console.log(`\n${fallos === 0 ? "✓" : "✗"} explicación — ${corridos - fallos}/${corridos} casos\n`);
process.exit(fallos === 0 ? 0 : 1);
