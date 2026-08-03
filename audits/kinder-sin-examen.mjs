#!/usr/bin/env node
// Auditor determinista — kinder nunca presenta un examen
//
// Hace cumplir: D-024, D-045, D-046, D-020, `mc-06`, `mc-10`.
//
// Por qué existe. Tres decisiones dicen lo mismo desde tres ángulos y ninguna lo
// dice con estas palabras:
//
//   · D-024 — en kinder no hay cronómetro, ni en el puntaje ni a la vista.
//   · D-045 — el tiempo se MIDE en kinder, y el puntaje nunca lo ve.
//   · D-046 — la ubicación (colocación por nivel) es OPCIONAL, siempre.
//
// Junta las tres y sale una regla: a un niño de kinder no se le aplica una
// prueba. Ni de colocación, ni cronometrada, ni con "resultado". `mc-10`
// documenta por qué esto no es delicadeza: el cronómetro es el origen medible
// de la ansiedad matemática en niños chicos, y la ansiedad temprana predice
// evitación de las matemáticas años después.
//
// La forma en que esto se rompe no es que alguien escriba "examen de kinder".
// Es que el motor adaptativo, que necesita una estimación inicial, la obtenga
// del modo más barato: preguntando. Un `placement` obligatorio para todos, y
// kinder cae dentro.
//
// LO QUE NO PUEDE COMPROBAR: si la experiencia SE SIENTE como un examen. Diez
// preguntas seguidas sin retroalimentación son un examen aunque el código las
// llame "práctica". Eso lo ve una persona, o el auditor adversarial `ux-banda`.

import { archivos, leer, informar, SOLO_PRODUCTO, palabra } from "./lib/repo.mjs";

// `palabra()` y no `\b`: para JavaScript el guion bajo es carácter de palabra,
// así que `/\bkinder\b/` NO encuentra `KINDER_PLACEMENT_REQUIRED`. El arnés de
// pruebas lo cazó — este auditor pasaba en verde con esa constante delante.

/** Lo que este producto entiende por kinder. */
const KINDER = palabra("kinder", "kindergarten", "preescolar", "banda_?0", "band0", "ages?_?3_?6");

/** Lo que es un examen, con todos sus nombres. */
const EXAMEN = palabra(
  "placement", "ubicacion", "colocacion", "examen", "exam", "test_?inicial",
  "initial_?test", "assessment", "evaluacion_?diagnostica", "diagnostic",
  "pretest", "screening", "nivelacion",
);

/** Lo que lo vuelve obligatorio. */
const OBLIGATORIO = new RegExp(
  palabra("required", "obligatori[oa]", "mandatory", "forced", "forzad[oa]", "must_?complete").source +
    "|(?:skip(?:pable)?|opcional|optional)\\s*[:=]\\s*false",
  "i",
);

/** Un cronómetro visible o puntuado. */
const CRONOMETRO = palabra(
  "timer", "countdown", "cuenta_?regresiva", "cronometro", "time_?limit",
  "limite_?de_?tiempo", "deadline", "segundos_?restantes", "seconds_?left",
);

const fuentes = archivos(/\.(ts|tsx|js|jsx|mjs|astro|svelte|vue|json|sql)$/).filter((f) => SOLO_PRODUCTO.test(f));
const problemas = [];
const notas = [];
let archivosDeKinder = 0;

for (const archivo of fuentes) {
  const texto = leer(archivo) ?? "";
  const esSql = archivo.endsWith(".sql");
  const lineas = texto.split("\n");

  const hablaDeKinder = KINDER.test(archivo) || KINDER.test(texto);
  if (hablaDeKinder) archivosDeKinder++;

  for (let i = 0; i < lineas.length; i++) {
    const soloCodigo = (esSql ? lineas[i].replace(/--.*$/, "") : lineas[i].replace(/\/\/.*$/, ""))
      .replace(/^\s*\*.*$/, "");
    if (!soloCodigo.trim()) continue;

    const mencionaKinder = KINDER.test(soloCodigo);
    const mencionaExamen = EXAMEN.test(soloCodigo);
    const mencionaCrono = CRONOMETRO.test(soloCodigo);

    // 1. Un examen obligatorio en cualquier parte: D-046 dice que la colocación
    //    es opcional para TODOS, no solo para kinder.
    if (mencionaExamen && OBLIGATORIO.test(soloCodigo)) {
      problemas.push(
        `${archivo}:${i + 1}: colocación obligatoria — \`${soloCodigo.trim().slice(0, 80)}\`. ` +
          "D-046: la ubicación es opcional y la edad no limita el nivel. " +
          (mencionaKinder ? "Y en kinder, además, D-024 y D-045 lo prohíben de plano." : ""),
      );
      continue;
    }

    // 2. Examen y kinder en la misma expresión.
    if (mencionaKinder && mencionaExamen) {
      problemas.push(
        `${archivo}:${i + 1}: examen o colocación en kinder — \`${soloCodigo.trim().slice(0, 80)}\`. ` +
          "D-024, D-045 y mc-10: el cronómetro y la prueba son el origen medible de la " +
          "ansiedad matemática en niños chicos.",
      );
      continue;
    }

    // 3. Cronómetro y kinder en la misma expresión.
    if (mencionaKinder && mencionaCrono) {
      problemas.push(
        `${archivo}:${i + 1}: cronómetro en kinder — \`${soloCodigo.trim().slice(0, 80)}\`. ` +
          "D-024: en kinder no hay cronómetro, ni puntuado ni a la vista. D-045 permite " +
          "MEDIR el tiempo; lo que no puede es verse ni contar.",
      );
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Ninguna superficie de kinder pinta una posición exacta (F7 #243, D-081)
// ---------------------------------------------------------------------------
//
// D-081 dice, para KINDER: «si se activa, la posición se muestra **en tercios**,
// nunca el número exacto». Es hermana de las tres reglas de arriba y por la
// misma fuente: `mc-10` mide que la presión de rendimiento empeora el desempeño
// en matemáticas, y `mc-18` implicación 7 recomienda no exponer el fondo de la
// tabla a los más chicos. «Eres el 27 de 30» es exactamente esa presión, escrita
// con un número.
//
// Se mira la INTERFAZ, no el motor: `liga.ts` nombra `rank` porque es quien
// decide cuándo NO mandarlo, y `posicionVisible` devuelve un tercio para KINDER.
// Lo que no puede existir es una pantalla de kinder que pinte el número.

const RANGO_EXACTO = /(\.rank\b|\bfinal_rank\b|\brank\s*[:=]|posicion\s*\.\s*rank|#\{?\s*(rank|posicion))/;

const superficies = fuentes.filter((f) =>
  /^apps\/web\/src\/(components|pages|layouts)\//.test(f),
);
let superficiesDeKinder = 0;

for (const archivo of superficies) {
  const texto = leer(archivo) ?? "";
  const esDeKinder = KINDER.test(archivo) || /(^|\/)(app\/kids|components\/kids)\//.test(archivo) || KINDER.test(texto);
  if (!esDeKinder) continue;
  superficiesDeKinder++;

  const m = texto.replace(/\/\/.*$/gm, "").match(RANGO_EXACTO);
  if (m) {
    problemas.push(
      `${archivo}: una superficie de kinder pinta una posición exacta (\`${m[0].trim()}\`). ` +
        "D-081: en KINDER la posición se muestra en tercios, nunca el número exacto y nunca el " +
        "último lugar. Y el número no se oculta al pintar: no viaja — `posicionVisible()` de " +
        "`liga.ts` devuelve el tercio ya calculado en el servidor.",
    );
  }
}

notas.push(
  archivosDeKinder > 0
    ? `${archivosDeKinder} archivo(s) hablan de kinder, ninguno con examen ni cronómetro`
    : "todavía no hay superficies de kinder; el auditor está listo para la primera",
);
notas.push(
  superficiesDeKinder > 0
    ? `${superficiesDeKinder} superficie(s) de kinder sin un número de posición (D-081)`
    : "todavía no hay pantalla de liga de kinder; el auditor bloquea la primera que pinte un rango",
);
notas.push("D-045 SÍ permite medir el tiempo en kinder — lo que no puede es verse ni puntuar");

informar({
  nombre: "kinder-sin-examen",
  problemas,
  notas,
  cita: "D-024, D-045, D-046, D-020, mc-06, mc-10",
  revisados: fuentes.length,
  resumen: `${fuentes.length} archivo(s) de producto`,
  porQueBloquea:
    "el cronómetro es el origen medible de la ansiedad matemática en niños chicos, y la " +
    "ansiedad temprana predice evitación de las matemáticas años después (mc-10).",
  noComprueba: [
    "si la experiencia SE SIENTE como un examen. Diez preguntas seguidas sin " +
      "retroalimentación son un examen aunque el código las llame práctica.",
  ],
});
