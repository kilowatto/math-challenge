#!/usr/bin/env node
// Auditor determinista — los barandales de D-034 sobre la franja adulta (SERIO)
//
// Hace cumplir: #161, #162, #163, #164, #165, D-034, D-070, mc-34.
//
// D-034 creó la franja con barandales explícitos para que «mínima» no crezca
// sola. Este auditor es esos barandales hechos código:
//
//   1. **~150 ítems, y algo que impida que crezca (#161).** Falla por encima
//      de 200 y con el banco vacío; el número queda escrito en las notas, no
//      supuesto.
//   2. **La proporción de plantilla se MIDE y se publica (#165).** mc-40: la
//      proporción paramétrica baja con el nivel. Cada plantilla declara su
//      tipo; aquí se cuenta y se imprime — si la plantilla no da de sí, el
//      costo de autoría aparece en el número antes de comprometer una fecha.
//   3. **Sin Sabana, sin modo historia, sin serie curada (#163).** Ningún
//      ítem de la franja referencia la Sabana (ni en id, clave, contexto ni
//      en sus textos en los 7 locales) y ningún id de la franja aparece en
//      una serie curada — las series curadas son de kinder.
//   4. **Una sola autoría, siete renders de notación (#162).** Aquí es donde
//      el proyecto COBRA haber guardado el ítem como estructura. La tabla de
//      signos y separadores de mc-34 está escrita A MANO abajo (D-070, segunda
//      fuente), se cruza contra `MATH_CONVENTIONS` para que ninguna de las
//      dos derive en silencio, y se comprueba contra los textos autorados Y
//      contra el render real de `presentarItemEstructura` en los 7 locales:
//      de-DE multiplica con `·` y divide con `:`, fr-FR agrupa con el espacio
//      fino insecable, el decimal es coma en cinco locales y punto en dos.
//   5. **Sin ubicación adaptativa propia (#164).** La franja usa el motor de
//      F4. Un segundo motor escondido en el archivo de contenido se vería
//      como matemática de selección (logits, estados) donde solo hay ítems.
//
// LO QUE NO PUEDE COMPROBAR: que el MVP no dependa de esto (#167) — es un
// barandal de proceso, no de código; y la contradicción de la serie (#160),
// que es decisión del dueño y bloquea por escrito, no por auditor.

import { archivos, leer, informar, RAIZ, patronUnicode } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
const DIR = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];

// --- 0. Las piezas. Fallar CERRADO si falta cualquiera -----------------------
const bancoMod = await import(`${RAIZ}packages/motor/src/banco-adulto.ts`).catch(() => null);
const convMod = await import(`${RAIZ}packages/motor/src/convenciones.ts`).catch(() => null);
const presMod = await import(`${RAIZ}packages/motor/src/presentar.ts`).catch(() => null);
if (!bancoMod || !convMod || !presMod) {
  problemas.push("no pude importar banco-adulto.ts, convenciones.ts o presentar.ts para cruzarlos");
}

const catalogos = {};
for (const loc of LOCALES) {
  const crudo = leer(`${DIR}/${loc}.json`);
  if (!crudo) {
    problemas.push(`falta ${DIR}/${loc}.json`);
    continue;
  }
  try {
    catalogos[loc] = JSON.parse(crudo);
  } catch (e) {
    problemas.push(`${DIR}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
  }
}

const banco = bancoMod ? bancoMod.generarBancoAdulto() : [];

// --- 1. El número, con techo (#161) -------------------------------------------
if (bancoMod) {
  if (banco.length === 0) {
    problemas.push("la franja generó 0 ítems: un auditor sobre un banco vacío aprueba siempre");
  }
  if (banco.length > 200) {
    problemas.push(
      `la franja tiene ${banco.length} ítems: D-034 dice «~150, no 400 — es una franja, no una banda». ` +
        "Sin este techo, «mínima» se convierte en una segunda banda completa y F5 pierde el foco (#161).",
    );
  }
  const fuera = banco.filter((i) => i.nivel < 8 || i.nivel > 10);
  if (fuera.length > 0) {
    problemas.push(`${fuera.length} ítem(s) fuera de N8–N10 (el primero: ${fuera[0].id}): la franja es N8–N10 (D-017, D-034)`);
  }
  notas.push(`${banco.length} ítems en la franja (techo: 200)`);
}

// --- 2. La proporción de plantilla, medida y publicada (#165) ------------------
if (bancoMod) {
  const prop = bancoMod.proporcionDePlantilla();
  if (prop.total !== banco.length) {
    problemas.push(
      `proporcionDePlantilla() cuenta ${prop.total} y el banco genera ${banco.length}: la medición ` +
        "de #165 no cuadra con la producción — publicarla así sería publicar un número falso.",
    );
  }
  for (const p of bancoMod.PLANTILLAS_ADULTO ?? []) {
    if (p.tipo !== "parametrica" && p.tipo !== "manual") {
      problemas.push(`la plantilla ${p.habilidad} no declara tipo parametrica|manual: sin la declaración no hay medición (#165)`);
    }
  }
  const pct = prop.total > 0 ? ((100 * prop.parametrica) / prop.total).toFixed(1) : "0.0";
  notas.push(
    `proporción de plantilla PUBLICADA (#165, mc-40): ${prop.parametrica} de plantilla, ` +
      `${prop.manual} a mano — ${pct}% paramétrico`,
  );
}

// --- 3. Sin Sabana, sin historia, sin serie curada (#163) -----------------------
const SABANA = patronUnicode("\\b(sabana|sendero|larry|historia)\\b");
if (bancoMod) {
  for (const i of banco) {
    if (i.contexto) {
      problemas.push(`${i.id}: tiene contexto — la franja no referencia lugares de la Sabana (#163)`);
    }
    if (SABANA.test(i.id) || SABANA.test(i.enunciado.clave)) {
      problemas.push(`${i.id}: el id o la clave referencia la Sabana/historia — la Sabana es de kinder (#163)`);
    }
  }
}
// Los textos que se sirven, en los 7 locales: ni la Sabana ni el compañero de
// kinder tienen por qué aparecer en una pantalla del club de adultos.
for (const [loc, cat] of Object.entries(catalogos)) {
  for (const [k, v] of Object.entries(cat)) {
    if (!k.startsWith("a.") && !k.startsWith("error.a.") && !k.startsWith("habilidad.A")) continue;
    const texto = Array.isArray(v) ? v.join(" ") : String(v);
    if (SABANA.test(texto)) {
      problemas.push(`${loc}: \`${k}\` menciona la Sabana, el sendero, Larry o la historia — eso es de kinder (#163)`);
    }
  }
}
// Ningún id de la franja entra en una serie curada: los ~2 500 retos curados
// son de kinder (D-034). Los archivos de la propia F5b (banco, siembra,
// pruebas, lib) referencian ids aNN-… con toda legitimidad — el barandal es
// para el RESTO del repo.
const PROPIOS = new Set([
  "packages/motor/src/banco-adulto.ts",
  "packages/motor/src/banco-adulto.prueba.mjs",
  "scripts/sembrar-banco-adulto.mjs",
  "apps/web/src/lib/banco-adulto.ts",
  "apps/web/src/lib/banco-adulto.prueba.mjs",
]);
for (const f of archivos(/\.(ts|mts|mjs|sql|json|astro)$/)) {
  if (PROPIOS.has(f)) continue;
  const texto = leer(f) ?? "";
  if (/'a\d{2}-[0-9]|"a\d{2}-[0-9]/.test(texto)) {
    problemas.push(
      `${f} referencia un id de la franja (aNN-…): si es una serie curada, viola D-034 — la franja ` +
        "compone retos del banco sin curaduría por serie (#163). Si es otro uso legítimo, añade el archivo a PROPIOS con el porqué.",
    );
  }
}

// --- 4. Una autoría, siete notaciones (#162, mc-34, D-070) ----------------------
//
// La tabla de mc-34, escrita A MANO como segunda fuente. Si esto y
// MATH_CONVENTIONS alguna vez discrepan, una de las dos se movió sola — y eso
// es exactamente lo que D-070 existe para cazar.
const SIGNOS_ESPERADOS = {
  "en":    { multiplicacion: "×", division: "÷", decimal: ".", millares: "," },
  "es-MX": { multiplicacion: "×", division: "÷", decimal: ".", millares: "," },
  "es-ES": { multiplicacion: "×", division: "÷", decimal: ",", millares: "." },
  "fr-FR": { multiplicacion: "×", division: ":", decimal: ",", millares: " " },
  "pt-BR": { multiplicacion: "×", division: "÷", decimal: ",", millares: "." },
  "pt-PT": { multiplicacion: "×", division: ":", decimal: ",", millares: "." },
  "de-DE": { multiplicacion: "·", division: ":", decimal: ",", millares: "." },
};

if (convMod) {
  for (const loc of LOCALES) {
    const esperado = SIGNOS_ESPERADOS[loc];
    const real = convMod.MATH_CONVENTIONS[loc];
    if (!real) {
      problemas.push(`MATH_CONVENTIONS no tiene ${loc} y la tabla escrita a mano sí: una de las dos se movió sola (D-070)`);
      continue;
    }
    if (real.multiplication !== esperado.multiplicacion || real.division !== esperado.division) {
      problemas.push(
        `${loc}: MATH_CONVENTIONS dice ×→«${real.multiplication}» ÷→«${real.division}» y la tabla escrita a mano ` +
          `dice ×→«${esperado.multiplicacion}» ÷→«${esperado.division}». Una de las dos fuentes se movió sola (D-070, mc-34).`,
      );
    }
    if (real.decimal !== esperado.decimal || real.grouping !== esperado.millares) {
      problemas.push(
        `${loc}: los separadores de MATH_CONVENTIONS ya no coinciden con la tabla escrita a mano (D-070, mc-34).`,
      );
    }
  }
}

// La disciplina de signos en los textos autorados. Los signos PROHIBIDOS por
// locale: el × y el ÷ en alemán (en un aula alemana el × se lee como la
// variable x y se divide con «:»), el ÷ en fr-FR y pt-PT (dividen con «:»),
// y el punto medio «·» en todos los demás (es el signo alemán de multiplicar).
const PROHIBIDOS = {
  "en":    ["·"],
  "es-MX": ["·"],
  "es-ES": ["·"],
  "fr-FR": ["÷", "·"],
  "pt-BR": ["·"],
  "pt-PT": ["÷", "·"],
  "de-DE": ["×", "÷"],
};

const clavesEnunciado = (cat) => Object.keys(cat).filter((k) => /^a\.[a-z._]+$/.test(k));

for (const [loc, cat] of Object.entries(catalogos)) {
  const enunciados = clavesEnunciado(cat);
  for (const k of enunciados) {
    for (const signo of PROHIBIDOS[loc] ?? []) {
      if (String(cat[k]).includes(signo)) {
        problemas.push(
          `${loc}: \`${k}\` usa «${signo}», que mc-34 prohíbe en este locale ` +
            `(multiplicar es «${SIGNOS_ESPERADOS[loc].multiplicacion}», dividir es «${SIGNOS_ESPERADOS[loc].division}»). ` +
            "La notación no es un detalle: ES el producto de la franja (#162).",
        );
      }
    }
  }
  // Presencia, no solo ausencia: que el signo del locale APAREZCA de verdad en
  // algún enunciado — un catálogo sin × en en no estaría mal, estaría vacío.
  const todo = enunciados.map((k) => String(cat[k])).join(" ");
  if (!todo.includes(SIGNOS_ESPERADOS[loc].multiplicacion)) {
    problemas.push(`${loc}: ningún enunciado a.* muestra el signo de multiplicar «${SIGNOS_ESPERADOS[loc].multiplicacion}» — la notación no se está ejercitando (#162)`);
  }
  // El signo de dividir puede ir pegado a un espacio fino insecable (fr-FR
  // escribe «1000 : 8» con U+202F antes de los dos puntos), así que la
  // presencia se comprueba tolerando los dos espacios.
  const divisionPresente = new RegExp(
    `[\\s\\u202f]${SIGNOS_ESPERADOS[loc].division}[\\s\\u202f]`,
  ).test(todo);
  if (!divisionPresente) {
    problemas.push(`${loc}: ningún enunciado a.* muestra el signo de dividir «${SIGNOS_ESPERADOS[loc].division}» — la notación no se está ejercitando (#162)`);
  }
  // Las causas NO llevan signos de operación: se escriben con palabras, y un
  // ×/÷/· en la retroalimentación es una fuga de notación sin revisar.
  for (const [k, v] of Object.entries(cat)) {
    if (!k.startsWith("error.a.")) continue;
    const texto = Array.isArray(v) ? v.join(" ") : String(v);
    for (const signo of ["×", "÷", "·"]) {
      if (texto.includes(signo)) {
        problemas.push(`${loc}: la causa \`${k}\` contiene «${signo}» — las causas se escriben con palabras en los siete locales`);
      }
    }
  }
}

// El espacio fino insecable del francés, en los enunciados que lo necesitan:
// un « ?» o un « %» con espacio normal puede partir el número o el signo en
// dos líneas (mc-34). Se busca el espacio U+0020 delante de ? ; ! %.
const fr = catalogos["fr-FR"];
if (fr) {
  for (const k of clavesEnunciado(fr)) {
    if (/ [?;!%]/.test(String(fr[k]))) {
      problemas.push(
        `fr-FR: \`${k}\` tiene un espacio normal antes de la puntuación. El francés usa el espacio ` +
          "fino insecable (U+202F): con uno normal la línea puede partirse en medio del número (mc-34).",
      );
    }
  }
}

// El render REAL, contra la tabla escrita a mano — no contra formatear(). Dos
// ítems bastan: uno con decimal (1/4 → 0,25 | 0.25) y uno con millares
// (1 000 | 1.000 | 1,000 ÷ 8 | : 8).
if (bancoMod && presMod) {
  const decimal = banco.find((i) => i.id === "a03-1-1-4");
  const millares = banco.find((i) => i.id === "a13-1000-8");
  if (!decimal || !millares) {
    problemas.push("faltan los ítems muestra (a03-1-1-4, a13-1000-8) para el cruce del render real");
  } else {
    for (const loc of LOCALES) {
      const cat = catalogos[loc];
      if (!cat) continue;
      const esperado = SIGNOS_ESPERADOS[loc];
      const presDec = presMod.presentarItemEstructura(decimal, loc, cat);
      const textoEsperado = `0${esperado.decimal}25`;
      if (!presDec.opciones.some((o) => o.texto === textoEsperado)) {
        problemas.push(
          `${loc}: el render de 1/4 no produce «${textoEsperado}» (salió ${presDec.opciones.map((o) => o.texto).join(", ")}). ` +
            "El ítem es uno y el decimal es del locale — si esto falla, la promesa de #162 falla.",
        );
      }
      const presMil = presMod.presentarItemEstructura(millares, loc, cat);
      // Antes del «:» francés va el espacio fino insecable, igual que delante
      // de «?»: la plantilla lo trae y el render lo conserva.
      const antesDeDividir = loc === "fr-FR" ? " " : " ";
      const milEsperado = `1${esperado.millares}000${antesDeDividir}${esperado.division} 8`;
      if (!presMil.enunciado.includes(milEsperado)) {
        problemas.push(
          `${loc}: el render de 1000 entre 8 no produce «${milEsperado}» (salió «${presMil.enunciado}»). ` +
            "Millares y signo de división, por locale, contra la tabla escrita a mano (D-070, mc-34).",
        );
      }
    }
    notas.push("render real cruzado en los 7 locales: decimal (0,25 | 0.25), millares (1 000 | 1.000 | 1,000) y ÷ | :");
  }
}

// --- 5. Sin ubicación adaptativa propia (#164) -----------------------------------
const contenido = leer("packages/motor/src/banco-adulto.ts") ?? "";
if (/Math\.exp|logit|elegirSiguiente|estadoInicial|nivelSemilla/.test(contenido)) {
  problemas.push(
    "banco-adulto.ts contiene matemática de selección adaptativa: la franja usa el motor de F4, " +
      "no se le escribe uno «para adultos» (D-034, #164).",
  );
}

informar({
  nombre: "franja-adulta",
  problemas,
  notas,
  cita: "#161, #162, #163, #164, #165, D-034, D-070, mc-34",
  revisados: banco.length + Object.keys(catalogos).length,
  resumen: `${banco.length} ítems contra los barandales de D-034 y la notación de mc-34 en los 7 locales`,
  porQueBloquea:
    "sin techo, «mínima» se convierte en una segunda banda y F5 pierde el foco; y una notación " +
    "equivocada no degrada el texto: en de-DE cambia lo que el ítem PREGUNTA (× se lee como la variable x).",
  noComprueba: [
    "que el MVP no dependa de la franja (#167) — es un barandal de proceso, no de código",
    "la contradicción de la serie (#160) — es decisión del dueño, escrita y con fecha, no de un auditor",
    "la calidad pedagógica de los ítems — eso es la revisión humana de mc-40, declarada en el PR",
  ],
});
