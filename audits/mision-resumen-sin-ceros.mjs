#!/usr/bin/env node
// Auditor determinista — el resumen de fin de día no tiene ceros ni
// denominadores, y ningún texto de misión sugiere un cofre
//
// Hace cumplir: #222 (el resumen lista SOLO lo logrado), #220 (el bono es una
// suma, jamás un cofre), #227 (textos autorados por locale, números solo vía
// `numeros.ts`), línea roja #7, mc-17 §5 (confirm-shaming), mc-43 (hallazgo 5).
//
// ─── Por qué existe ───────────────────────────────────────────────────────
//
// Un renglón «0/3 misiones» es un veredicto negativo aunque el copy no lo diga
// — es la línea roja #7 disfrazada de contador. `cierreDelDia()` ya no devuelve
// denominador, pero eso solo cubre el motor: nada impedía que la PANTALLA lo
// reconstruyera (`ResumenMisiones` recibiendo `meta` y `progreso` «para poner
// contexto»). Este auditor cierra ese hueco en el único sitio donde puede
// volver a nacer: las props del componente del resumen.
//
// La otra mitad es el texto. El bono del día (+XP por las tres) se muestra como
// una suma porque un cofre que se abre sugiere sorpresa, y `mc-43` hallazgo 5:
// el mecanismo regulatorio —el refuerzo de razón variable— no necesita dinero
// para funcionar sobre un niño. La metáfora vive en las CADENAS de locale, que
// ningún auditor de grafo de imports alcanza.
//
// ─── Qué comprueba ────────────────────────────────────────────────────────
//
//  1. `ResumenMisiones.astro` no recibe ni nombra `progreso`, `meta`, `target`
//     ni ninguna forma de denominador. Sin la prop, el «0 de 3» no se puede
//     pintar aunque alguien quiera — la comprobación es sobre la frontera del
//     componente, no sobre su buen gusto.
//  2. Los siete `i18n/misiones/*.json` existen, tienen las MISMAS llaves, y
//     las treinta llaves por tipo (`titulo`, `progreso`, `logro` × 10 tipos)
//     están en todos — la lista de tipos se lee del catálogo del motor, que es
//     la única fuente.
//  3. Ningún VALOR de esos archivos contiene un dígito. Todo número visible
//     («2 de 3», el XP, el contador de liga) llega como marcador `{n}`/`{xp}`…
//     y lo resuelve `formatear()` (#227, mc-34). Un dígito escrito a mano es
//     un número que no pasó por la convención del locale.
//  4. Los marcadores son los mismos en los siete locales: si el `progreso` de
//     `es-MX` tiene `{n}` y `{meta}` y el de `de-DE` solo tiene `{n}`, el
//     alemán pierde la meta en silencio.
//  5. Ninguna metáfora de cofre, regalo o sorpresa en ningún locale (#220).
//
// ─── LO QUE ESTE AUDITOR NO PUEDE VER ─────────────────────────────────────
//
//  · Si el MENÚ (`MenuMisiones.astro`) enseña el progreso con buen gusto. Ahí
//    «2 de 3» es legítimo — es el anuncio de lo que se puede hacer hoy, no el
//    veredicto de lo que faltó (§6 del diseño). Lo prohibido es el resumen.
//  · El tono de los textos. «Sin fallar ni una» podría leerse como exigencia;
//    eso es revisión humana por locale y flota adversarial, no una lista.

import { archivos, leer, informar, sinComentarios, existe, patronUnicode } from "./lib/repo.mjs";
import { TIPOS_DE_MISION } from "../packages/motor/src/misiones.ts";

const RESUMEN = "apps/web/src/components/misiones/ResumenMisiones.astro";
const DIR_TEXTOS = /^apps\/web\/src\/i18n\/misiones\/([a-zA-Z-]+)\.json$/;
const LOCALES = ["en", "es-MX", "es-ES", "fr-FR", "pt-BR", "pt-PT", "de-DE"];

const problemas = [];
const notas = [];
let revisados = 0;

// ─── 1. El resumen no puede pintar un denominador: no recibe los datos ───────

/*
 * La lista negra deliberada. Una lista blanca de props sería más fina y más
 * frágil: el día que el componente gane una prop legítima, el auditor la
 * borraría de la lista «para que pase». Aquí lo prohibido se nombra, y es la
 * forma exacta del veredicto: el denominador y lo que falta.
 *
 * `\b` de JavaScript solo conoce ASCII, así que esto pasa por
 * `patronUnicode()` — la trampa está medida en este repo: `/\bse acab[oó]\b/`
 * no encuentra «Se acabó».
 */
const DENOMINADOR = patronUnicode(
  "\\b(?:progreso|progress|target|pendientes|faltan?|restantes|remaining|denominador)\\b|" +
    // «meta» sola sí es sospechosa aquí: el resumen no conoce la meta de nada.
    // (`xpTotal`, `diaCompleto` y `xpBono` son las props legítimas y no casan.)
    "\\bmeta\\b|" +
    // Un «0/3» o un «2/3» literal en la plantilla del componente.
    "\\b\\d+\\s*/\\s*\\d+\\b",
);

if (!existe(RESUMEN)) {
  problemas.push(
    `${RESUMEN} no existe y este auditor comprueba que el resumen de fin de día no pinte ` +
      "denominadores. Sin el componente, «no encontré nada» no se puede leer como «está bien».",
  );
} else {
  revisados++;
  const texto = sinComentarios(leer(RESUMEN) ?? "");
  if (DENOMINADOR.test(texto)) {
    const linea = texto.split("\n").findIndex((l) => DENOMINADOR.test(l)) + 1;
    problemas.push(
      `${RESUMEN}:${linea}: el resumen de fin de día nombra un denominador, un progreso o lo que ` +
        "falta. #222 y línea roja #7: el resumen lista SOLO lo logrado, como una lista que crece — " +
        "un «0/3» es un veredicto negativo aunque el copy no lo diga (mc-17 §5: el " +
        "confirm-shaming es una categoría nombrada por la FTC). `cierreDelDia()` ya no devuelve " +
        "denominador; no lo reconstruyas en la interfaz.",
    );
  } else {
    notas.push("el resumen no recibe progreso, meta ni denominador: el «0/3» no se puede pintar");
  }
}

// ─── 2-5. Los textos de misión en los siete locales ──────────────────────────

const archivosTextos = archivos(DIR_TEXTOS);
const porLocale = new Map();
for (const archivo of archivosTextos) {
  const m = archivo.match(DIR_TEXTOS);
  if (m) porLocale.set(m[1], archivo);
}

for (const locale of LOCALES) {
  if (!porLocale.has(locale)) {
    problemas.push(`falta apps/web/src/i18n/misiones/${locale}.json (#227: los siete locales).`);
  }
}

// La metáfora de cofre, regalo o sorpresa, en los idiomas del producto (#220).
// Aunque el contenido sea conocido de antemano, un cofre que se abre SUGIERE
// azar — y el radio de la historia regulatoria alcanza a lo gratuito (mc-17 §7,
// mc-43 hallazgo 5). El bono se muestra como una suma directa.
const COFRE = patronUnicode(
  "\\b(?:cofre|chest|loot|lootbox|gacha|ruleta|spin|sorpresa|surprise|misterio|mystery|" +
    "regalo|gift|cadeau|surpresa|presente|geschenk|truhe|schatz|überraschung|" +
    "scratch|rasca)\\b",
);

const catalogo = new Map(); // locale -> Record<string,string>
for (const [locale, archivo] of porLocale) {
  revisados++;
  try {
    catalogo.set(locale, JSON.parse(leer(archivo) ?? "{}"));
  } catch (err) {
    problemas.push(`${archivo}: JSON ilegible — ${String(err).slice(0, 120)}`);
  }
}

// Las llaves que tienen que existir: las cinco de marco más las tres por tipo.
const LLAVES_MARCO = [
  "misiones.titulo",
  "misiones.xp",
  "misiones.resumen.titulo",
  "misiones.resumen.bono",
  "misiones.resumen.total",
];
const llavesEsperadas = [
  ...LLAVES_MARCO,
  ...TIPOS_DE_MISION.flatMap((tipo) => [
    `mision.${tipo}.titulo`,
    `mision.${tipo}.progreso`,
    `mision.${tipo}.logro`,
  ]),
];

const marcadoresDe = (texto) => [...texto.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1]).sort().join(",");

for (const [locale, textos] of catalogo) {
  const archivo = porLocale.get(locale);
  const llaves = Object.keys(textos);

  for (const llave of llavesEsperadas) {
    if (!(llave in textos)) {
      problemas.push(`${archivo}: falta la llave "${llave}" (#227: 10 tipos × 3 mensajes × 7 locales).`);
    }
  }
  for (const llave of llaves) {
    if (!llavesEsperadas.includes(llave)) {
      problemas.push(`${archivo}: la llave "${llave}" no corresponde a ningún tipo del catálogo.`);
      continue;
    }
    const valor = textos[llave];
    if (typeof valor !== "string" || valor.length === 0) {
      problemas.push(`${archivo}: la llave "${llave}" está vacía o no es texto.`);
      continue;
    }
    // 3. Ni un dígito escrito a mano: los números llegan por marcador y los
    //    resuelve `formatear()` con la convención del locale (mc-34).
    if (/\d/.test(valor)) {
      problemas.push(
        `${archivo}: "${llave}" lleva un dígito escrito a mano — \`${valor.slice(0, 60)}\`. #227: ` +
          "todo número visible pasa por `numeros.ts`/`convenciones.ts`, nunca se escribe a mano. " +
          "Un «3» literal en un JSON es un número que no pasó por la convención del locale.",
      );
    }
    // 5. La metáfora prohibida.
    if (COFRE.test(valor)) {
      problemas.push(
        `${archivo}: "${llave}" sugiere un cofre, un regalo o una sorpresa — \`${valor.slice(0, 60)}\`. ` +
          "#220 y mc-43 (hallazgo 5): el bono del día se muestra como una SUMA. Aunque el " +
          "contenido sea conocido, la metáfora de abrir algo sugiere azar, y el refuerzo de " +
          "razón variable no necesita dinero para funcionar sobre un niño.",
      );
    }
  }

  // 4. Los marcadores coinciden con los del inglés, llave a llave.
  const base = catalogo.get("en");
  if (base && locale !== "en") {
    for (const llave of llavesEsperadas) {
      if (typeof base[llave] !== "string" || typeof textos[llave] !== "string") continue;
      const a = marcadoresDe(base[llave]);
      const b = marcadoresDe(textos[llave]);
      if (a !== b) {
        problemas.push(
          `${archivo}: "${llave}" tiene los marcadores {${b}} y el inglés tiene {${a}}. Un ` +
            "marcador perdido es un número que ese locale no muestra nunca, en silencio.",
        );
      }
    }
  }
}

if (catalogo.size > 0) {
  notas.push(`${catalogo.size} archivos de locale, ${llavesEsperadas.length} llaves esperadas en cada uno`);
}

informar({
  nombre: "mision-resumen-sin-ceros",
  problemas,
  notas,
  cita: "#220, #222, #227, línea roja #7, mc-17 §5, mc-43 hallazgo 5",
  revisados,
  resumen: `${revisados} archivo(s): el componente del resumen y los textos de locale`,
  porQueBloquea:
    "un «0/3» en el resumen de fin de día es un veredicto negativo aunque el copy no lo diga — " +
    "la línea roja #7 hecha contador—, y una metáfora de cofre sugiere azar aunque el contenido " +
    "sea determinista (mc-43 hallazgo 5). Ninguno de los dos rompe una prueba ni el build: se " +
    "descubriría en alemán, tres semanas después, por un padre.",
  noComprueba: [
    "el menú de inicio de sesión (`MenuMisiones.astro`), donde «2 de 3» es legítimo: es el " +
      "anuncio de lo que se puede hacer hoy, no el veredicto de lo que faltó (§6 del diseño).",
    "el tono de los textos — eso es revisión humana por locale (D-022) y flota adversarial.",
  ],
});
