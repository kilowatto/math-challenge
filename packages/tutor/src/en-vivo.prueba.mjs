// Casos del camino EN VIVO de Larry (F6 #136, plan F6 §2.5, §5.5 y §6.1).
//
// Lo que estas pruebas defienden, y que no se ve leyendo el código:
//
//  1. Que el sobre en vivo sea **el mismo** sobre sellado del camino
//     pregenerado. No que se parezca: el mismo, con una sola puerta.
//  2. Que las compuertas de salida **no marquen el texto ya aprobado**. Es la
//     medición que corrigió dos de las reglas de este archivo — la primera
//     versión marcaba 359 combinaciones de texto revisado por humano, y la culpa
//     era de los dos puntos, que en `de-DE` son el signo de división y en los
//     siete idiomas son puntuación.
//  3. Que Pro y kinder se puedan encender y apagar **sin desplegar**.
//
// El catálogo de textos se lee del disco, no se importa, por lo mismo que
// `prefijo.prueba.mjs:7`: los JSON de `apps/web` usan la sintaxis de Vite, que
// Node en ESM no acepta sin atributo de tipo.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  sellarEnVivo,
  mensajeDeUsuario,
  juzgarSalida,
  decidirLlamada,
  interruptores,
  modeloDe,
  operadoresDeCualquierLocale,
  EN_VIVO_POR_DEFECTO,
  MODELOS,
  TOPE_FRASES,
  TOPE_TOKENS_ENTRADA,
  TOPE_TOKENS_SALIDA,
  TOQUES_POR_ITEM,
} from "./en-vivo.ts";
import { compilarLexico, validarLexico, DIRECTORIO_LEXICO } from "./lexico.ts";
import { componerPrefijo } from "./prefijo.ts";
import { ORDEN_TEMAS } from "./banda.ts";
import { LOCALES } from "../../motor/src/convenciones.ts";

let fallos = 0;
const ok = (cond, nombre) => {
  console.log(`  ${cond ? "✓" : "✗"} ${nombre}`);
  if (!cond) fallos++;
};

console.log("larry/en-vivo — el sobre, las compuertas, el ruteo y los interruptores\n");

const AQUI = dirname(fileURLToPath(import.meta.url));
const DIR_RETO = resolve(AQUI, "../../../apps/web/src/i18n/reto");
const DIR_LEXICO = resolve(AQUI, "lexico");
const DIR_LARRY = resolve(AQUI, "../../../apps/web/src/i18n/larry");

const lexicoCrudo = {};
for (const archivo of readdirSync(DIR_LEXICO).filter((f) => f.endsWith(".json"))) {
  lexicoCrudo[archivo.replace(/\.json$/, "")] = JSON.parse(readFileSync(`${DIR_LEXICO}/${archivo}`, "utf8"));
}
const bloques = {};
for (const archivo of readdirSync(DIR_LARRY).filter((f) => f.endsWith(".json"))) {
  bloques[archivo.replace(/\.json$/, "")] = JSON.parse(readFileSync(`${DIR_LARRY}/${archivo}`, "utf8"));
}

// ── 1 · El sobre en vivo es el sobre del motor, con una sola puerta ─────────
{
  const bruto = {
    acc: 0,
    causa: "error.se_salto_uno",
    razonAlterna: null,
    inesperada: false,
    habilidad: "K10",
    // Todo lo de abajo es lo que un Worker de ingesta podría añadir mañana sin
    // que nadie de F6 se entere. Ninguno tiene campo por donde entrar.
    vars: { a: 7, b: 3 },
    respuesta: { valor: 10 },
    eleccion: 12,
    rtMs: 4210,
    puntos: 30,
    racha: 4,
    childProfileId: "0198f0aa-1111-2222-3333-444455556666",
    alias: "Rino",
  };
  const sobre = sellarEnVivo(bruto, "no_entendi");

  ok(Object.keys(sobre).sort().join(",") === "disparador,sobre", "el sobre en vivo tiene DOS propiedades: el sobre sellado y el disparador");

  const serializado = JSON.stringify(sobre);
  for (const prohibido of ["vars", "respuesta", "eleccion", "rtMs", "puntos", "racha", "childProfileId", "alias", "4210", "Rino"]) {
    ok(!serializado.includes(prohibido), `\`${prohibido}\` no está en el sobre en vivo`);
  }

  const mensaje = mensajeDeUsuario(sobre);
  ok(mensaje.includes("error.se_salto_uno"), "el mensaje lleva la CLAVE de la causa");
  ok(mensaje.includes("K10"), "el mensaje lleva la CLAVE de la habilidad");
  ok(!mensaje.includes("10)") && !mensaje.includes("descomponer"), "el mensaje NO lleva la etiqueta de la habilidad, que es «descomponer (5 = 2+3)»");
  for (const prohibido of ["4210", "12", "Rino", "0198f0aa"]) {
    ok(!mensaje.includes(prohibido), `el mensaje al modelo no contiene «${prohibido}»`);
  }

  // Un disparador desconocido no abre un tercer camino: cae en el que menos supone.
  ok(sellarEnVivo(bruto, "lo_que_sea").disparador === "no_entendi", "un disparador desconocido cae en `no_entendi`");
  ok(sellarEnVivo(bruto, "no_catalogado").disparador === "no_catalogado", "`no_catalogado` se conserva");
}

// ── 2 · Las compuertas NO marcan el texto ya aprobado ───────────────────────
//
// Ésta es la prueba que corrigió el diseño, y por eso va antes que los controles
// negativos: una compuerta que descarta texto revisado por humano no protege de
// nada, porque lo que hace es servir la pregenerada SIEMPRE — y entonces la capa
// en vivo es decorativa y nadie lo nota (plan §7.2).
{
  let revisados = 0;
  let marcados = 0;
  let ejemplo = "";
  for (const locale of LOCALES) {
    const reto = JSON.parse(readFileSync(`${DIR_RETO}/${locale}.json`, "utf8"));
    const lexico = compilarLexico(lexicoCrudo[locale]);
    for (const [clave, valor] of Object.entries(reto)) {
      if (!/^(error\.|acierto|inesperada|paso\.)/.test(clave)) continue;
      const frases = Array.isArray(valor) ? valor : [valor];
      // El nombre del paso se sustituye como lo haría el motor: la plantilla
      // cruda lleva `{paso}`, que no es texto que nadie lea.
      const texto = frases.join(" ").split("{paso}").join("la columna");
      for (const tema of ORDEN_TEMAS) {
        revisados++;
        const d = juzgarSalida({ texto, locale, banda: tema, lexico });
        if (d.length > 0) {
          marcados++;
          if (!ejemplo) ejemplo = `${locale} ${tema} ${clave}: ${d[0].porque.slice(0, 90)}`;
        }
      }
    }
  }
  ok(revisados > 800, `se midieron ${revisados} combinaciones de texto autorado × banda`);
  ok(marcados === 0, `ninguna de las ${revisados} combinaciones de texto REVISADO POR HUMANO se descarta${ejemplo ? ` — ${ejemplo}` : ""}`);
}

// ── 3 · Los controles negativos de cada compuerta ───────────────────────────
{
  const lexico = compilarLexico(lexicoCrudo["en"]);
  const base = { locale: "en", banda: "PRIMARIA", lexico };

  const conDigito = juzgarSalida({ ...base, texto: "You counted 4 and there were 5." });
  ok(
    conDigito.some((d) => d.compuerta === "estructural"),
    "un dígito en la salida se descarta — el sobre no lleva ninguno, así que lo inventó el modelo (línea roja #7)",
  );

  const conOperador = juzgarSalida({ ...base, texto: "The two parts go together with ×." });
  ok(conOperador.some((d) => d.compuerta === "estructural"), "un operador inequívoco se descarta");

  // Y el control del control: los dos puntos NO se descartan, porque son
  // puntuación en los siete idiomas aunque en `de-DE` sean el signo de división.
  const conDosPuntos = juzgarSalida({
    locale: "de-DE",
    banda: "PRIMARIA",
    lexico: compilarLexico(lexicoCrudo["de-DE"]),
    texto: "Die Spalte: dieser Schritt trägt.",
  });
  ok(conDosPuntos.length === 0, "los dos puntos NO se descartan: son puntuación, y prohibirlos marcaba 359 textos ya aprobados");

  const humillante = juzgarSalida({ ...base, texto: "You are so smart, but the other kids got it." });
  ok(humillante.some((d) => d.compuerta === "lexica"), "el elogio a la capacidad se descarta con el MISMO léxico que audita el texto pregenerado");

  const larga = juzgarSalida({ ...base, texto: "One. Two. Three. Four. Five. Six." });
  ok(larga.some((d) => d.compuerta === "forma"), `más de ${TOPE_FRASES.PRIMARIA} frases en PRIMARIA se descarta`);

  const vacia = juzgarSalida({ ...base, texto: "   " });
  ok(vacia.some((d) => d.compuerta === "forma"), "una salida vacía se descarta — es el `finish_reason: length` de D-035, no un silencio elegante");

  // El techo de frases sube con la banda, o kinder y Pro tendrían la misma voz.
  ok(
    juzgarSalida({ ...base, banda: "KINDER", texto: "One. Two. Three." }).length > 0 &&
      juzgarSalida({ ...base, banda: "PRO", texto: "One. Two. Three." }).length === 0,
    "el techo de frases es por banda: tres frases pasan en PRO y no en KINDER",
  );
}

// ── 4 · El ruteo de modelo por complejidad (D-004 punto 3, D-035) ───────────
{
  ok(modeloDe("KINDER").id === MODELOS.chico.id, "kinder rutea al modelo chico");
  ok(modeloDe("PRIMARIA").id === MODELOS.chico.id, "primaria rutea al modelo chico");
  ok(modeloDe("SECUNDARIA").id === MODELOS.grande.id, "secundaria rutea al modelo grande");
  ok(modeloDe("SERIO").id === MODELOS.grande.id, "la banda adulta rutea al modelo grande");
  ok(modeloDe("PRO").id === MODELOS.grande.id, "Pro rutea al modelo grande — con Cloudflare, `kimi-k2.6` es el techo (D-035)");
  ok(modeloDe("JR").id === modeloDe("PRO").id, "JR usa el modelo de PRO, igual que usa su bloque de prompt (D-017)");

  // Los precios son los de D-035, verificados contra la cuenta. Si alguien los
  // cambia sin decirlo, el tope de gasto miente en la misma proporción.
  ok(MODELOS.chico.entrada === 350_000 && MODELOS.chico.salida === 750_000, "los precios de `gpt-oss-120b` son los de D-035");
  ok(MODELOS.grande.entrada === 950_000 && MODELOS.grande.salida === 4_000_000, "los precios de `kimi-k2.6` son los de D-035");
  ok(MODELOS.chico.cacheada === null, "`gpt-oss-120b` no declara precio de entrada cacheada, y eso es `null` y no cero");

  // El presupuesto de salida jamás puede ser el de los ~500 tokens que D-035
  // documenta como la condición en la que la respuesta llega VACÍA.
  for (const tema of ORDEN_TEMAS) {
    ok(TOPE_TOKENS_SALIDA[tema] >= 1_000, `${tema} presupuesta ${TOPE_TOKENS_SALIDA[tema]} tokens de salida — el razonamiento se cobra ahí (D-035 hallazgo 1)`);
  }
}

// ── 5 · El presupuesto de ENTRADA cubre los prefijos de verdad ──────────────
//
// Si un bloque de locale crece por encima de lo presupuestado, el medidor
// reserva de menos y el tope deja de ser una cota. Se estima a cuatro caracteres
// por token, que es la regla de dedo habitual y va del lado conservador para
// texto latino con acentos.
{
  let peor = 0;
  let dondePeor = "";
  for (const locale of LOCALES) {
    for (const tema of ORDEN_TEMAS) {
      const p = componerPrefijo({ locale, banda: tema, bloque: bloques[locale] });
      const tokens = Math.ceil(p.texto.length / 4);
      if (tokens > peor) {
        peor = tokens;
        dondePeor = p.llave;
      }
    }
  }
  ok(
    peor <= TOPE_TOKENS_ENTRADA,
    `el prefijo más largo (${dondePeor}) estima ${peor} tokens y se presupuestan ${TOPE_TOKENS_ENTRADA}`,
  );
}

// ── 6 · Los interruptores: Pro y kinder se apagan sin desplegar ─────────────
{
  ok(EN_VIVO_POR_DEFECTO.PRO === false, "Pro nace APAGADA — D-035 condiciona la banda a medirla contra explicaciones revisadas por humano");
  ok(EN_VIVO_POR_DEFECTO.KINDER === false, "kinder nace APAGADA — recomendación (a) de P-1, y en kinder una línea en vivo no se puede pregrabar");
  ok(EN_VIVO_POR_DEFECTO.PRIMARIA === true, "primaria nace encendida: es la banda donde D-073 puso el producto");

  const encendida = interruptores({ PRO: true });
  ok(encendida.PRO === true, "una llave de configuración enciende Pro sin tocar código");
  ok(encendida.KINDER === false, "encender Pro no toca a las demás");

  // Falla hacia lo que el CÓDIGO dice, nunca hacia encendido.
  ok(interruptores(null).PRO === false, "una configuración ausente deja los valores por defecto, que son los conservadores");
  ok(interruptores("basura").PRO === false, "una configuración ilegible deja los valores por defecto");
  ok(interruptores({ PRO: "si" }).PRO === false, "un valor que no es booleano se ignora — «si» no enciende nada");
  ok(interruptores({ INVENTADA: true }).PRO === false, "una banda que no existe no crea una fila");
}

// ── 7 · Cuándo se llama, y las cinco condiciones ───────────────────────────
{
  const base = {
    banda: "PRIMARIA",
    interruptores: EN_VIVO_POR_DEFECTO,
    peldano: "P0",
    disparador: "no_entendi",
    paseDelInterruptorAutomatico: true,
    toquesEnEsteItem: 1,
  };
  ok(decidirLlamada(base).llama === true, "en P0, con el interruptor encendido y un toque, se llama");
  ok(decidirLlamada({ ...base, banda: "PRO" }).motivo === "interruptor:PRO", "Pro no llama, y el motivo lo dice");
  ok(decidirLlamada({ ...base, banda: "KINDER" }).motivo === "interruptor:KINDER", "kinder no llama, y el motivo lo dice");
  ok(decidirLlamada({ ...base, paseDelInterruptorAutomatico: false }).llama === false, "el interruptor automático por tasa de descarte corta la llamada");
  ok(decidirLlamada({ ...base, toquesEnEsteItem: TOQUES_POR_ITEM + 1 }).llama === false, `más de ${TOQUES_POR_ITEM} toques por ítem no llama`);
  ok(decidirLlamada({ ...base, peldano: "P2" }).llama === false, "P2 no llama: se degrada hacia texto humano revisado, nunca hacia un modelo peor");
  ok(decidirLlamada({ ...base, peldano: "P3" }).llama === false, "P3 no llama");
  ok(decidirLlamada({ ...base, peldano: "P1" }).llama === false, "en P1 el «no entendí» ya no llama");
  ok(
    decidirLlamada({ ...base, peldano: "P1", disparador: "no_catalogado" }).llama === true,
    "en P1 sobrevive el error NO CATALOGADO — es el único caso sin texto revisado que servir en su lugar",
  );

  // Y el que importa de verdad: encender Pro es una llave, no un despliegue.
  ok(
    decidirLlamada({ ...base, banda: "PRO", interruptores: interruptores({ PRO: true }) }).llama === true,
    "con la llave puesta, Pro llama — el día que pase la evaluación de D-035 no hay que compilar nada",
  );
}

// ── 8 · El léxico está completo en los siete locales ───────────────────────
{
  const problemas = validarLexico(lexicoCrudo);
  ok(problemas.length === 0, `los siete léxicos validan${problemas.length ? `: ${problemas[0]}` : ""}`);
  ok(Object.keys(lexicoCrudo).length === LOCALES.length, `hay ${LOCALES.length} archivos en ${DIRECTORIO_LEXICO}`);

  const sinFrances = { ...lexicoCrudo };
  delete sinFrances["fr-FR"];
  ok(validarLexico(sinFrances).some((p) => p.includes("fr-FR")), "quitar un locale del léxico se marca — un locale sin lista es un locale sin vigilancia");

  ok(
    validarLexico({ ...lexicoCrudo, en: { locale: "en", construcciones: [] } }).some((p) => p.includes("lista vacía")),
    "una lista vacía se marca: vigilar nada en verde es el fallo de D-032",
  );
}

// ── 9 · La compuerta de operadores se deriva y no se teclea ────────────────
{
  const signos = operadoresDeCualquierLocale();
  ok(signos.includes("÷") && signos.includes("×") && signos.includes("·"), "los signos de división y multiplicación de la tabla están vigilados");
  ok(!signos.includes(":"), "los dos puntos NO están vigilados, y ésa es la corrección que midieron los 875 textos");
}

console.log("");
if (fallos > 0) {
  console.error(`✗ ${fallos} caso(s) fallaron\n`);
  process.exit(1);
}
console.log("✓ el camino en vivo cumple su contrato\n");
