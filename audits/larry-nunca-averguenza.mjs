#!/usr/bin/env node
// Auditor determinista — Larry nunca avergüenza
//
// Hace cumplir: línea roja #7, D-004, mc-11, D-022, criterio #133 de F6.
//
// ─── Qué mira, y en qué se diferencia de `retro-completa.mjs` ──────────────
//
// `retro-completa` mira los **archivos**: que toda causa del banco tenga texto
// en los siete locales y que cada clave `error.*` sean exactamente dos frases.
// Es la comprobación del insumo.
//
// Éste mira la **salida**: ejecuta el módulo de explicación con cada causa que
// el banco produce de verdad, en los siete locales, y juzga la cadena que un
// niño acabaría leyendo. Son dos cosas distintas y las dos hacen falta — un
// texto impecable en el JSON puede llegar mutilado a la pantalla si quien lo
// junta se equivoca, y eso no lo ve nadie leyendo el JSON.
//
// ─── Las tres cosas que comprueba ──────────────────────────────────────────
//
//  1. **Ninguna cadena de explicación humilla.** Léxico POR LOCALE en
//     `audits/lib/lexico-verguenza/<locale>.json`, con seis categorías:
//     capacidad, elogio inflado, comparación, conteo de fallas, minimizadores y
//     tiempo/velocidad, más la culpa directa.
//  2. **Ningún fallo se sirve como marcador desnudo.** Shute (`mc-11` §5): un
//     «mal» sin siguiente paso es de los tipos de retroalimentación más pobres
//     que se han medido. Kluger & DeNisi, sobre 607 tamaños de efecto: más de un
//     tercio de las intervenciones de retroalimentación EMPEORÓ el desempeño.
//  3. **Ninguna clave cruda llega a una pantalla.** Es #349 otra vez: un niño de
//     cuatro años vio tres botones que decían `casilla3`, `casilla0`, `casilla1`.
//     Se prueba con una causa que nadie autoró, que es el único caso donde el
//     código tendría la tentación de imprimir el identificador.
//  4. **Y desde F6 #136, la MISMA carta sobre el camino EN VIVO.** La compuerta
//     léxica del Worker se ejerce aquí con salidas humillantes escritas a
//     propósito en cada uno de los siete idiomas, y tiene que descartarlas todas.
//     No es un auditor nuevo a propósito: la carta anti-vergüenza es UNA, y
//     partirla en dos sería tener dos listas que envejecen distinto. Lo que
//     cambia entre los dos caminos es de dónde sale el texto, no qué se prohíbe.
//
// ─── Por qué el léxico se parte por locale ─────────────────────────────────
//
// `retro-completa` corre un regex único con las palabras de los cinco idiomas
// mezcladas. Con 15 textos por locale eso es inofensivo; con el corpus completo
// deja de serlo, y sobre todo **produce falsos positivos contra texto ya
// aprobado**: `es-ES` sirve «Inténtalo otra vez, sin prisa» y `de-DE` «Versuch
// es noch einmal, in Ruhe». Prohibir «otra vez» marcaría los dos, mientras que
// «otra vez te equivocaste», que sí humilla, es la misma palabra en otra
// construcción. **Lo que se prohíbe es una construcción, y las construcciones no
// se traducen.**
//
// LO QUE NO PUEDE COMPROBAR — y hay que decirlo, no esconderlo:
//
//  · **El léxico es un cable trampa, no un juez.** «No todos nacemos para los
//    números» es atribución de rasgo fijo pura y no contiene ni una palabra de
//    ninguna lista. Eso lo cubre la carta adversarial `anti-humillacion`
//    (`audits/adversarial/cartas.mjs`), que corre a mano y cuesta dinero, y la
//    revisión humana por locale de D-022.
//  · **Nadie ha oído a Larry.** Todo esto se verifica leyendo texto, y en kinder
//    el niño no lee: escucha. Un texto que pasa cada compuerta puede sonar
//    condescendiente por la entonación, el ritmo o la pausa. No hay auditor para
//    eso y no se propone uno: se propone que alguien escuche los siete locales
//    antes de soltar kinder.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { informar, RAIZ } from "./lib/repo.mjs";

const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];
// El léxico se mudó a `packages/tutor/src/lexico/` en F6 #136. La razón está
// escrita en `packages/tutor/src/lexico.ts`: con el camino en vivo hay un
// segundo lector, y ése corre DENTRO del Worker. Copiarlo habría dejado dos
// listas, y la que se desincronizara sería la que juzga el texto que nadie
// revisó antes de publicarlo.
const DIR_LEXICO = "packages/tutor/src/lexico";
const DIR_TEXTOS = "apps/web/src/i18n/reto";

const problemas = [];
const notas = [];
let revisados = 0;

// --- 0. Las piezas. Fallar CERRADO si falta cualquiera ----------------------
const motor = await import(`${RAIZ}packages/motor/src/explicacion.ts`).catch((e) => {
  problemas.push(`no pude importar el módulo de explicación: ${String(e).slice(0, 120)}`);
  return null;
});
const banco = await import(`${RAIZ}packages/motor/src/banco-kinder.ts`).catch(() => null);
if (!banco) problemas.push("no pude importar el banco para saber qué causas produce de verdad");

const catalogos = {};
for (const loc of LOCALES) {
  const ruta = `${RAIZ}${DIR_TEXTOS}/${loc}.json`;
  if (!existsSync(ruta)) {
    problemas.push(`falta ${DIR_TEXTOS}/${loc}.json — el locale ${loc} no tiene explicación (D-022)`);
    continue;
  }
  try {
    catalogos[loc] = JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    problemas.push(`${DIR_TEXTOS}/${loc}.json no es JSON válido: ${String(e).slice(0, 80)}`);
  }
}

// El léxico. Un locale sin lista es un locale sin vigilancia, y ese es
// exactamente el modo de falla de D-022: funciona en el idioma de quien escribió
// el código y falla en los otros seis.
const lexico = {};
const enElDirectorio = existsSync(`${RAIZ}${DIR_LEXICO}`)
  ? readdirSync(`${RAIZ}${DIR_LEXICO}`).filter((f) => f.endsWith(".json"))
  : [];
for (const loc of LOCALES) {
  if (!enElDirectorio.includes(`${loc}.json`)) {
    problemas.push(
      `falta ${DIR_LEXICO}/${loc}.json. Sin lista, ese locale no está vigilado, y una lista ` +
        "global traducida no sirve: lo que se prohíbe es una construcción.",
    );
    continue;
  }
  const doc = JSON.parse(readFileSync(`${RAIZ}${DIR_LEXICO}/${loc}.json`, "utf8"));
  lexico[loc] = (doc.construcciones ?? []).map((c) => ({
    categoria: c.categoria,
    porque: c.porque,
    re: new RegExp(c.patron, "iu"),
  }));
  if (lexico[loc].length === 0) {
    problemas.push(`${DIR_LEXICO}/${loc}.json no tiene ninguna construcción: es una lista vacía vigilando`);
  }
}

/** Juzga UNA cadena contra el léxico de SU locale. */
function revisar(loc, donde, texto) {
  if (!texto || !lexico[loc]) return;
  for (const c of lexico[loc]) {
    if (c.re.test(texto)) {
      problemas.push(
        `${loc} · ${donde}: «${texto.slice(0, 70)}» cae en la categoría \`${c.categoria}\` ` +
          `(${c.re.source}). ${c.porque}. Línea roja #7: Larry nunca avergüenza a un niño por equivocarse.`,
      );
    }
  }
}

if (motor && banco && Object.keys(catalogos).length === LOCALES.length) {
  const { sellarSobre, explicarEnLocale } = motor;
  const causas = [...new Set(banco.generarBanco().flatMap((i) => i.errores.map((e) => e.causa)))].sort();

  // Los cuatro caminos que el módulo puede tomar, y el quinto que no debería.
  const sobres = [
    ...causas.map((causa) => [`causa ${causa}`, { acc: 0, causa, habilidad: "K11" }]),
    ["acierto", { acc: 1, habilidad: "K11" }],
    ["inesperada", { acc: 0, inesperada: true, habilidad: "K11" }],
    ["causa sin autorar", { acc: 0, causa: "error.que_nadie_autoro", habilidad: "K11" }],
  ];

  for (const loc of LOCALES) {
    revisados++;
    for (const [donde, bruto] of sobres) {
      const e = explicarEnLocale(sellarSobre(bruto), loc, catalogos);

      // 1. Nada que humille.
      revisar(loc, donde, e.titulo);
      revisar(loc, donde, e.siguiente);
      for (const p of e.pasos) revisar(loc, `${donde} · paso`, p.texto);

      // 2. Ningún fallo sin siguiente paso.
      if (bruto.acc === 0 && (!e.siguiente || e.siguiente.trim() === "")) {
        problemas.push(
          `${loc} · ${donde}: la explicación de un FALLO llega sin siguiente paso — «${e.titulo}» y ` +
            "nada más. Es un marcador desnudo, que Shute (`mc-11` §5) clasifica entre los tipos de " +
            "retroalimentación más pobres que se han medido: dice que hubo un fallo y no qué hacer con él.",
        );
      }

      // 3. Ninguna clave cruda.
      const todo = `${e.titulo} ${e.siguiente} ${e.pasos.map((p) => p.texto).join(" ")}`;
      const clave = todo.match(/\b(?:error|juego|paso|habilidad|forma|lado|k)\.[a-z_0-9.]+/i);
      if (clave) {
        problemas.push(
          `${loc} · ${donde}: la explicación imprime la CLAVE «${clave[0]}» en vez de un texto. Es #349 ` +
            "otra vez — un niño de cuatro años vio tres botones que decían `casilla3`, `casilla0` y " +
            "`casilla1`, que eran los identificadores internos. Cuando falta texto se sirve el " +
            "genérico autorado, nunca el identificador.",
        );
      }
    }
  }

  notas.push(`${causas.length} causa(s) del banco × ${LOCALES.length} locales, ejecutadas de verdad`);
  notas.push(`${sobres.length} sobre(s) por locale: cada causa, el acierto, lo inesperado y una causa sin autorar`);
  notas.push(
    `construcciones vigiladas: ${LOCALES.map((l) => `${l} ${lexico[l]?.length ?? 0}`).join(" · ")}`,
  );
}

// ══ 4 · LA MISMA CARTA, SOBRE EL CAMINO EN VIVO (F6 #136) ═══════════════════
//
// Hasta aquí se juzgó texto que una persona escribió y otra revisó. Lo que sigue
// juzga la compuerta que corre en el Worker sobre texto que **nadie ha visto**:
// lo que el modelo acaba de escribir, medio segundo antes de que lo lea alguien.
//
// Es el mismo léxico, leído del mismo directorio, y por eso está en este auditor
// y no en uno nuevo. La carta anti-vergüenza es UNA. Partirla en dos daría dos
// listas que envejecen distinto, y la que envejeciera peor sería justo la del
// texto sin revisar.
//
// Las frases de abajo están escritas a mano en cada idioma, no traducidas: lo
// que humilla en una lengua no es la traducción de lo que humilla en otra, que
// es el argumento entero de que el léxico esté partido por locale. Cada una
// tiene que caer, y si alguna deja de caer es que el léxico de ese locale
// perdió una construcción.
const HUMILLANTES = {
  "en": [
    ["capacidad", "You are so smart, that is why this one is easy."],
    ["comparacion", "The other children already got this one."],
    ["minimizadores", "That was easy, have another go."],
  ],
  "es-MX": [
    ["capacidad", "Eres muy listo, por eso te toca otra."],
    ["comparacion", "Los demás niños ya lo lograron."],
    ["tiempo_velocidad", "Te tardaste, vamos a intentarlo otra vez."],
  ],
  "es-ES": [
    ["capacidad", "Qué inteligente, prueba con la siguiente."],
    ["comparacion", "El resto del grupo ya lo tiene."],
    ["minimizadores", "Era muy fácil, vuelve a mirarlo."],
  ],
  "fr-FR": [
    ["capacidad", "Tu es très intelligent, essaie encore."],
    ["comparacion", "Les autres enfants ont déjà réussi."],
    ["minimizadores", "C'était facile, regarde encore une fois."],
  ],
  "pt-BR": [
    ["capacidad", "Você é muito inteligente, tente de novo."],
    ["comparacion", "As outras crianças já conseguiram."],
    ["tiempo_velocidad", "Você foi muito lento, tente de novo."],
  ],
  "pt-PT": [
    ["capacidad", "És muito inteligente, tenta outra vez."],
    ["comparacion", "As outras crianças já conseguiram."],
    ["conteo_de_fallas", "É a terceira vez, tenta outra vez."],
  ],
  "de-DE": [
    ["capacidad", "Du bist so schlau, versuch es noch einmal."],
    ["comparacion", "Die anderen Kinder haben es schon."],
    ["minimizadores", "Das war doch einfach, schau noch einmal."],
  ],
};

if (motor && Object.keys(lexico).length === LOCALES.length) {
  const enVivo = await import(`${RAIZ}packages/tutor/src/en-vivo.ts`).catch((e) => {
    problemas.push(`no pude importar el camino en vivo: ${String(e).slice(0, 120)}`);
    return null;
  });

  if (enVivo) {
    const { juzgarSalida } = enVivo;
    let cazadas = 0;

    for (const loc of LOCALES) {
      for (const [categoria, frase] of HUMILLANTES[loc] ?? []) {
        const descartes = juzgarSalida({ texto: frase, locale: loc, banda: "PRIMARIA", lexico: lexico[loc] });
        const lexicas = descartes.filter((d) => d.compuerta === "lexica");
        if (lexicas.length === 0) {
          problemas.push(
            `${loc} · EN VIVO: la compuerta léxica DEJA PASAR «${frase}», que es \`${categoria}\`. ` +
              "Esa frase la escribiría un modelo y la leería un niño sin que nadie la hubiera visto " +
              "antes. Línea roja #7: Larry nunca avergüenza a un niño por equivocarse.",
          );
        } else {
          cazadas++;
        }
      }
    }

    // Y el otro frente del camino en vivo, que el pregenerado no tiene: el
    // modelo puede escribir una cifra que nadie le dio. El sobre no lleva ni un
    // numeral, así que cualquiera que salga es invención.
    const conNumero = juzgarSalida({
      texto: "You counted 4 and the answer was 5.",
      locale: "en",
      banda: "PRIMARIA",
      lexico: lexico["en"],
    });
    if (!conNumero.some((d) => d.compuerta === "estructural")) {
      problemas.push(
        "la compuerta estructural del camino en vivo deja pasar un dígito. El sobre no contiene " +
          "ninguno, así que una cifra en la salida la inventó el modelo — y una cifra inventada en " +
          "un producto de matemáticas no es un defecto de estilo, es otra respuesta (línea roja #7).",
      );
    }

    notas.push(`${cazadas} frase(s) humillantes escritas a mano en los siete idiomas, todas descartadas por la compuerta EN VIVO`);
  }
}

informar({
  nombre: "larry-nunca-averguenza",
  problemas,
  notas,
  cita: "línea roja #7, D-004, D-022, mc-11 (Shute; Kluger & DeNisi; Mueller & Dweck), criterios #133 y #136 de F6",
  revisados,
  resumen: `${revisados} locale(s) · la salida de los DOS caminos, no solo el JSON`,
  porQueBloquea:
    "Kluger & DeNisi midieron 607 tamaños de efecto y más de un tercio de las intervenciones de " +
    "retroalimentación EMPEORÓ el desempeño. «Hay feedback» no es el criterio: un texto que " +
    "avergüenza es peor que no decir nada.",
  noComprueba: [
    "si el texto es BUENO. «No todos nacemos para los números» no contiene ni una palabra de " +
      "ninguna lista y es atribución de rasgo fijo pura. Eso lo juzgan la revisión humana por " +
      "locale y la carta adversarial `anti-humillacion`.",
    "cómo SUENA. En kinder el niño no lee, escucha, y la entonación no está en el texto. Hace " +
      "falta que alguien escuche los siete locales antes de soltar kinder.",
  ],
});
