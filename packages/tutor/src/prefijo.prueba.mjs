// Casos de la arquitectura de prompts de Larry (F6 #134, plan F6 §3).
//
// Lo que estas pruebas defienden, y que no se ve mirando el código: que añadir
// un locale sea escribir UN archivo. Eso no se comprueba leyendo — se comprueba
// componiendo un catálogo con un locale de mentira y viendo qué se rompe.
//
// El catálogo real se lee del disco, no se importa: `apps/web/src/i18n/larry/`
// usa la sintaxis de importación de JSON de Vite, que Node en ESM no acepta sin
// atributo de tipo. Es la misma frontera que mudó `MATH_CONVENTIONS` al motor.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { CANON, revisarCanon } from "./canon.ts";
import { BLOQUE_BANDA, ORDEN_TEMAS, bandaDePrompt } from "./banda.ts";
import { fichaDeNotacion, todasLasFichas } from "./notacion.ts";
import { validarCatalogo, CAMPOS_OBLIGATORIOS, EJEMPLOS_POR_LOCALE } from "./catalogo.ts";
import {
  componerPrefijo,
  componerBloqueLocale,
  llavesDePrefijo,
  hashDePrefijo,
} from "./prefijo.ts";
import { LOCALES } from "../../motor/src/convenciones.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("larry/prefijo — tres capas, siete locales, treinta y cinco prefijos\n");

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(AQUI, "../../../apps/web/src/i18n/larry");
const catalogo = {};
for (const archivo of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  catalogo[archivo.replace(/\.json$/, "")] = JSON.parse(readFileSync(`${DIR}/${archivo}`, "utf8"));
}

// --- el CANON cumple sus propios invariantes -------------------------------
{
  const problemas = revisarCanon();
  ok(problemas.length === 0, `el CANON pasa sus invariantes${problemas.length ? `: ${problemas[0]}` : ""}`);

  // Control negativo: la regla atrapa lo que dice atrapar.
  ok(
    revisarCanon(`${CANON}\nAlways answer in English.`).length > 0,
    "un CANON que nombra un idioma queda marcado — si no, la capa deja de ser común",
  );
  ok(
    revisarCanon(`${CANON}\nWhen the learner writes 2 + 2 you say so.`).length > 0,
    "un CANON con un numeral usado como cantidad queda marcado",
  );
  ok(
    revisarCanon(`${CANON}\nUse the ÷ sign.`).length > 0,
    "un CANON con un operador repartido por locale queda marcado (de-DE divide con `:`)",
  );
  ok(
    revisarCanon(`${CANON}\nSee D-035 and mc-11, item 1.`).length === 0,
    "las citas D-0NN y mc-NN NO se marcan: la regla del primer diseño marcaba el archivo que se describe a sí mismo",
  );
}

// --- el catálogo real está completo ----------------------------------------
{
  const problemas = validarCatalogo(catalogo);
  ok(problemas.length === 0, `los siete bloques de locale validan${problemas.length ? `: ${problemas[0]}` : ""}`);
  ok(Object.keys(catalogo).length === LOCALES.length, `hay ${LOCALES.length} archivos de locale`);
}

// --- añadir un locale es UN archivo, y quitarlo se nota --------------------
{
  const sinAleman = { ...catalogo };
  delete sinAleman["de-DE"];
  ok(
    validarCatalogo(sinAleman).some((p) => p.includes("de-DE")),
    "quitar un locale del catálogo bloquea — un locale sin bloque responde en el idioma del CANON",
  );

  const conIntruso = { ...catalogo, "es": catalogo["es-MX"] };
  ok(
    validarCatalogo(conIntruso).some((p) => p.includes("`es`")),
    "un bloque `es` sin región queda marcado: `es` no dice si el decimal es punto o coma",
  );

  for (const campo of CAMPOS_OBLIGATORIOS) {
    const mutilado = { ...catalogo, en: { ...catalogo.en } };
    delete mutilado.en[campo];
    ok(
      validarCatalogo(mutilado).some((p) => p.includes(campo)),
      `falta \`${campo}\` en un bloque y se detecta`,
    );
  }
}

// --- los pares que comparten idioma NO comparten contenido (D-022) ---------
{
  const copiado = { ...catalogo, "es-ES": catalogo["es-MX"] };
  const problemas = validarCatalogo(copiado);
  ok(
    problemas.some((p) => p.includes("es-MX") && p.includes("es-ES")),
    "copiar el archivo de es-MX sobre es-ES bloquea — seis autores y una copia no son siete autores",
  );

  const copiadoPt = { ...catalogo, "pt-PT": catalogo["pt-BR"] };
  ok(
    validarCatalogo(copiadoPt).some((p) => p.includes("pt-BR") && p.includes("pt-PT")),
    "copiar pt-BR sobre pt-PT bloquea — lo que los separa es persona verbal y clítico",
  );

  ok(
    catalogo["pt-PT"].registro.includes("segunda pessoa") &&
      catalogo["pt-BR"].registro.includes("terceira pessoa"),
    "pt-PT trata por `tu` y pt-BR por `você`, escrito en el registro y no supuesto",
  );
  ok(
    EJEMPLOS_POR_LOCALE === 3 && catalogo["de-DE"].ejemplos.length === 3,
    "tres ejemplos autorados por locale",
  );
}

// --- la ficha de notación se GENERA, y las siete no son iguales ------------
{
  const fichas = todasLasFichas();
  ok(
    fichas["es-MX"] !== fichas["es-ES"],
    "la ficha de es-MX difiere de la de es-ES — México es el único país hispano con punto decimal",
  );
  ok(
    fichas["pt-BR"] !== fichas["pt-PT"],
    "la ficha de pt-BR difiere de la de pt-PT — escala corta contra larga, `÷` contra `:`",
  );
  ok(
    fichaDeNotacion("de-DE").includes("·") && !fichaDeNotacion("de-DE").includes("×"),
    "en de-DE la ficha dice punto medio y no cruz: la cruz se confunde con la variable",
  );
  ok(new Set(Object.values(fichas)).size === LOCALES.length, "las siete fichas son distintas entre sí");

  let lanzo = false;
  try {
    fichaDeNotacion("xx-XX");
  } catch {
    lanzo = true;
  }
  ok(lanzo, "un locale sin fila de MATH_CONVENTIONS lanza en vez de componer un prompt sin notación");
}

// --- el prefijo se compone en el orden que la caché necesita ---------------
{
  const p = componerPrefijo({ locale: "fr-FR", banda: "KINDER", bloque: catalogo["fr-FR"] });

  const iCanon = p.texto.indexOf(CANON.slice(0, 40));
  const iLocale = p.texto.indexOf("LANGUAGE");
  const iBanda = p.texto.indexOf("AUDIENCE");
  ok(
    iCanon >= 0 && iCanon < iLocale && iLocale < iBanda,
    "el orden es CANON → LOCALE → BANDA: de menos volátil a más, que es lo que la caché de prefijo necesita",
  );
  ok(p.llave === "larry|fr-FR|KINDER", "la llave es `larry|<locale>|<banda>`");
  ok(
    !/perfil|child|nino|niño/i.test(p.llave),
    "la llave no lleva nada del niño: un identificador de menor en una cabecera hacia un proveedor de inferencia (línea roja #2)",
  );
  ok(
    p.texto.includes("quatre-vingt-dix"),
    "el bloque de fr-FR nombra quatre-vingt-dix como riesgo de palabra-número",
  );
  ok(
    componerPrefijo({ locale: "de-DE", banda: "KINDER", bloque: catalogo["de-DE"] }).texto.includes("einundzwanzig"),
    "el bloque de de-DE nombra einundzwanzig: la unidad va delante y es una sola palabra",
  );

  // El CANON aparece una sola vez, no siete: es el argumento entero de la capa.
  const veces = p.texto.split("WHAT YOU NEVER DO").length - 1;
  ok(veces === 1, "el contrato de seguridad aparece UNA vez en el prefijo, no una por idioma");
}

// --- JR no tiene bloque propio, y no por olvido ----------------------------
{
  ok(bandaDePrompt("JR") === "PRO", "JR usa el bloque de PRO: es un alias de dificultad, no un tema (D-017)");
  ok(ORDEN_TEMAS.length === 5 && Object.keys(BLOQUE_BANDA).length === 5, "cinco bloques de banda, no seis");
  ok(
    BLOQUE_BANDA.KINDER.includes("does not read"),
    "el bloque de KINDER dice que el texto se va a pronunciar: sin eso salen frases correctas e impronunciables",
  );
}

// --- la cardinalidad: 35 en la escalera, 14 en el MVP ----------------------
{
  ok(llavesDePrefijo().length === 35, `${llavesDePrefijo().length} prefijos en la escalera completa (7 × 5)`);
  ok(llavesDePrefijo(true).length === 14, `${llavesDePrefijo(true).length} prefijos en el MVP (7 × 2)`);
  ok(new Set(llavesDePrefijo()).size === 35, "ninguna llave se repite");
}

// --- el hash detecta qué se movió, que es para lo único que sirve ----------
{
  const antes = {};
  for (const locale of LOCALES) {
    for (const tema of ORDEN_TEMAS) {
      const p = componerPrefijo({ locale, banda: tema, bloque: catalogo[locale] });
      antes[p.llave] = hashDePrefijo(p.texto);
    }
  }
  ok(Object.keys(antes).length === 35, "los 35 prefijos se componen sin lanzar");

  // Tocar UN locale mueve exactamente sus cinco llaves.
  const tocado = { ...catalogo, "de-DE": { ...catalogo["de-DE"], cierre: "Anders." } };
  let movidas = 0;
  for (const locale of LOCALES) {
    for (const tema of ORDEN_TEMAS) {
      const p = componerPrefijo({ locale, banda: tema, bloque: tocado[locale] });
      if (hashDePrefijo(p.texto) !== antes[p.llave]) movidas++;
    }
  }
  ok(movidas === 5, `tocar de-DE mueve exactamente 5 hashes (movió ${movidas}), y ninguno de otro locale`);

  ok(hashDePrefijo("a") !== hashDePrefijo("b"), "el hash distingue dos textos distintos");
  ok(hashDePrefijo(CANON) === hashDePrefijo(CANON), "el hash es determinista");
}

// --- el bloque compuesto lleva la ficha AL FINAL ---------------------------
{
  const bloque = componerBloqueLocale("pt-PT", catalogo["pt-PT"]);
  ok(
    bloque.lastIndexOf("NOTATION IN FORCE") > bloque.indexOf("WORKED EXAMPLES"),
    "la ficha generada va al final del bloque: es la parte que cambia cuando cambia la tabla",
  );
  ok(bloque.includes("long"), "pt-PT declara escala larga, que es lo que no comparte con pt-BR");
}

console.log(`\n${fallos === 0 ? "✓ todo verde" : `✗ ${fallos} fallo(s)`}`);
process.exit(fallos === 0 ? 0 : 1);
