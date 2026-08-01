#!/usr/bin/env node
// Traductor del corpus de investigación — un documento, un locale.
//
//     node scripts/traducir-corpus.mjs <locale> [--todos | archivo.md]
//
// De `docs/research/*.md` a `docs/research/<locale>/<mismo-nombre>.md`.
//
// Por qué existe: el corpus son 47 investigaciones y ~158,858 palabras que hay
// que publicar en SEIS locales destino. Traducir a mano no escala, y traducir
// con un prompt ingenuo destruye lo único que hace publicable una investigación:
// las cifras, las URL de las fuentes y las marcas [unverified].
//
// Tres cosas que este script hace y que un `for` sobre una API no haría:
//
//  1. **Es idempotente.** Si el destino existe y es más nuevo que el origen, se
//     salta. Sin esto, un reintento tras un fallo a mitad de corrida vuelve a
//     pagar todo lo que ya salió bien.
//  2. **Trocea por encabezado**, nunca a media tabla ni a media lista de
//     fuentes. Una tabla partida por la mitad se traduce con columnas distintas
//     en cada mitad, y una lista de fuentes partida pierde numeración.
//  3. **Baja al modelo de respaldo** si el primario falla o devuelve vacío.
//     `kimi-k2.6` es un modelo de razonamiento: gasta max_tokens pensando y
//     puede terminar con finish_reason "length" y `content` VACÍO.
//
// Lo que este script NO hace: no verifica su propio trabajo. Eso es
// `audits/corpus-integridad.mjs`, que es un programa distinto a propósito —
// un traductor que se autoevalúa aprueba lo que acaba de escribir.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGEN = join(RAIZ, "docs", "research");

// --------------------------------------------------------------- 1. locales
// D-022: cinco idiomas, SIETE locales. `en` es el origen; los otros seis son
// destino. es-MX y es-ES no comparten separador decimal, pt-BR y pt-PT no
// comparten escala numérica — por eso cada uno lleva su propia ficha y no un
// "es" o un "pt" genérico. Todo lo de aquí sale de mc-34.
const LOCALES = {
  "es-MX": {
    nombre: "Spanish (Mexico)",
    decimal: "punto (.)",
    millares: "coma (1,234,567)",
    notas:
      'México es la EXCEPCIÓN del mundo hispano: usa PUNTO decimal, como en inglés. ' +
      'Vocabulario mexicano: "computadora" (no "ordenador"), "celular" (no "móvil"), ' +
      '"aplicación", "boleta". Escala larga: 10⁹ = "mil millones", 10¹² = "billón". ' +
      "Usa punto y coma como separador de listas solo cuando los elementos ya llevan comas.",
  },
  "es-ES": {
    nombre: "Spanish (Spain)",
    decimal: "coma (,)",
    millares: "punto (1.234.567)",
    notas:
      'España usa COMA decimal y PUNTO de millares. Vocabulario peninsular: ' +
      '"ordenador" (no "computadora"), "móvil" (no "celular"), "vosotros" cuando ' +
      'aplique. Escala larga: 10⁹ = "mil millones", 10¹² = "billón". ' +
      "Con coma decimal, el separador de listas numéricas es punto y coma.",
  },
  "fr-FR": {
    nombre: "French (France)",
    decimal: "virgule (,)",
    millares: "espace fine insécable (1 234 567)",
    notas:
      "Le français de France utilise la VIRGULE décimale et l'ESPACE FINE comme " +
      "séparateur de milliers. Échelle longue : 10⁹ = « milliard », 10¹² = « billion ». " +
      "Espace insécable avant : ; ! ? et à l'intérieur des guillemets « ». " +
      "Le point-virgule sert de séparateur de liste quand la virgule est décimale.",
  },
  "pt-BR": {
    nombre: "Portuguese (Brazil)",
    decimal: "vírgula (,)",
    millares: "ponto (1.234.567)",
    notas:
      "Português do BRASIL: vírgula decimal, ponto de milhar. Brasil usa ESCALA CURTA " +
      '(exceção lusófona): 10⁹ = "bilhão", 10¹² = "trilhão". Ortografia e léxico ' +
      'brasileiros: "usuário", "tela", "celular", "time", "gerenciar", "arquivo", "esporte". ' +
      "Gerúndio brasileiro, não o infinitivo pessoal de Portugal.",
  },
  "pt-PT": {
    nombre: "Portuguese (Portugal)",
    decimal: "vírgula (,)",
    millares: "ponto (1.234.567)",
    notas:
      "Português EUROPEU: vírgula decimal, ponto de milhar. Portugal usa ESCALA LONGA " +
      '(ao contrário do Brasil): 10⁹ = "mil milhões", 10¹² = "bilião". Léxico e ' +
      'ortografia de Portugal: "utilizador" (não "usuário"), "ecrã" (não "tela"), ' +
      '"telemóvel" (não "celular"), "equipa" (não "time"), "gerir", "ficheiro", "desporto". ' +
      "Construção «estar a + infinitivo», não o gerúndio brasileiro. " +
      "pt-PT NÃO é pt-BR com outra ortografia: são dois locales distintos.",
  },
  "de-DE": {
    nombre: "German (Germany)",
    decimal: "Komma (,)",
    millares: "Punkt (1.234.567)",
    notas:
      "Deutsch (Deutschland): KOMMA als Dezimaltrennzeichen, PUNKT als Tausendertrennzeichen. " +
      'Lange Skala: 10⁹ = "Milliarde", 10¹² = "Billion" — "Billion" heißt auf Deutsch NICHT ' +
      'das englische "billion". Multiplikationszeichen im Unterricht ist der Malpunkt "·", ' +
      'Division ":". Zahlwortstellung invertiert (21 = "einundzwanzig"). ' +
      "Substantive groß, ß beibehalten (kein Schweizer ss).",
  },
};

// ------------------------------------------------------------ 2. argumentos
const args = process.argv.slice(2);
const valorDe = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1];
};
// El locale se acepta suelto o con `--locale`; `audits/corpus-integridad.mjs`
// anuncia la segunda forma en su mensaje de fallo cerrado. Los valores que
// siguen a una bandera no cuentan como posicionales.
const banderasConValor = ["--locale", "--limite"];
const posicionales = args.filter(
  (a, i) => !a.startsWith("--") && !banderasConValor.includes(args[i - 1]),
);
const locale = valorDe("--locale") ?? posicionales[0];
const todos = args.includes("--todos") || valorDe("--limite") !== null;
const forzar = args.includes("--forzar");
const seco = args.includes("--seco");
const limite = valorDe("--limite") === null ? Infinity : Number(valorDe("--limite"));
const archivoPedido = posicionales[1];

function uso(mensaje) {
  console.error(`error: ${mensaje}\n`);
  console.error("uso: node scripts/traducir-corpus.mjs <locale> [--todos | archivo.md]");
  console.error(`     locales destino: ${Object.keys(LOCALES).join(", ")}`);
  console.error("     --limite N corre solo los primeros N documentos");
  console.error("     --forzar   retraduce aunque el destino esté al día");
  console.error("     --seco     enseña el plan y el troceo sin llamar al modelo");
  process.exit(2);
}

if (!locale) uso("falta el locale destino");
if (locale === "en") uso("`en` es el ORIGEN del corpus (D-022), no un destino");
if (!LOCALES[locale]) uso(`locale desconocido "${locale}"`);
if (!todos && !archivoPedido) uso("indica un archivo.md o pasa --todos");

const ficha = LOCALES[locale];
const DESTINO = join(ORIGEN, locale);

// ------------------------------------------------------------- 3. inventario
const disponibles = readdirSync(ORIGEN)
  .filter((f) => f.endsWith(".md"))
  .sort();

let objetivo;
if (todos) {
  // `--limite N` corta la lista: sirve para medir el costo de una corrida real
  // antes de comprometer las 282 traducciones que faltan.
  objetivo = Number.isFinite(limite) ? disponibles.slice(0, limite) : disponibles;
} else {
  const nombre = basename(archivoPedido);
  if (!disponibles.includes(nombre)) uso(`"${nombre}" no está en docs/research/`);
  objetivo = [nombre];
}

// ------------------------------------------------------------- 4. el troceo
//
// Se corta SOLO en encabezados de nivel 2 (`## `) que estén fuera de un bloque
// de código cercado. Un `## ` dentro de ```…``` es contenido, no estructura.
//
// Si una sección sola pasa del presupuesto se intenta cortar en sus `### `. Si
// ni así cabe, se manda entera: mejor un trozo grande que una tabla partida.
// Nunca se corta en una línea de tabla (`|…|`) ni dentro de una lista numerada,
// porque cortar ahí es exactamente cómo se pierden columnas y numeración.

const PALABRAS_POR_TROZO = Number(process.env.MC_TRAD_PALABRAS ?? 1400);

function palabras(texto) {
  return texto.split(/\s+/).filter(Boolean).length;
}

/** Divide en bloques por encabezados del nivel pedido, respetando cercas de código. */
function partirPorNivel(texto, nivel) {
  const marca = "#".repeat(nivel) + " ";
  const lineas = texto.split("\n");
  const bloques = [];
  let actual = [];
  let cerca = null;

  for (const linea of lineas) {
    const abre = linea.match(/^\s*(```+|~~~+)/);
    if (abre) {
      if (cerca && linea.trim().startsWith(cerca)) cerca = null;
      else if (!cerca) cerca = abre[1];
    }
    if (!cerca && linea.startsWith(marca) && actual.length > 0) {
      bloques.push(actual.join("\n"));
      actual = [];
    }
    actual.push(linea);
  }
  if (actual.length > 0) bloques.push(actual.join("\n"));
  return bloques;
}

function trocear(texto) {
  const secciones = partirPorNivel(texto, 2);
  const trozos = [];

  for (const seccion of secciones) {
    if (palabras(seccion) <= PALABRAS_POR_TROZO) {
      trozos.push(seccion);
      continue;
    }
    // Sección grande: intenta subdividirla por `### `.
    const sub = partirPorNivel(seccion, 3);
    if (sub.length === 1) {
      // No hay dónde cortar sin romper algo. Entera.
      trozos.push(seccion);
      continue;
    }
    let acumulado = [];
    for (const pieza of sub) {
      const candidato = [...acumulado, pieza].join("\n");
      if (acumulado.length > 0 && palabras(candidato) > PALABRAS_POR_TROZO) {
        trozos.push(acumulado.join("\n"));
        acumulado = [pieza];
      } else {
        acumulado.push(pieza);
      }
    }
    if (acumulado.length > 0) trozos.push(acumulado.join("\n"));
  }

  // Junta trozos consecutivos pequeños: menos llamadas, menos costuras.
  const juntos = [];
  for (const trozo of trozos) {
    const ultimo = juntos.at(-1);
    if (ultimo && palabras(ultimo) + palabras(trozo) <= PALABRAS_POR_TROZO) {
      juntos[juntos.length - 1] = `${ultimo}\n${trozo}`;
    } else {
      juntos.push(trozo);
    }
  }
  return juntos;
}

// ------------------------------------------------------------ 5. el proveedor
// Workers AI y solo Workers AI (D-035). Mismo endpoint compatible con OpenAI
// que usa audits/adversarial/proveedores.mjs, y los mismos precios.
if (!process.env.CLOUDFLARE_API_TOKEN && existsSync(join(RAIZ, ".env"))) {
  process.loadEnvFile(join(RAIZ, ".env"));
}

const CADENA = [
  process.env.MC_TRAD_MODELO ?? "@cf/moonshotai/kimi-k2.6",
  process.env.MC_TRAD_MODELO_RESPALDO ?? "@cf/openai/gpt-oss-120b",
];

// Precios por millón de tokens, de la página de precios de Workers AI.
// Espejo de audits/adversarial/proveedores.mjs — si allá cambian, aquí también.
const PRECIOS = {
  "@cf/moonshotai/kimi-k2.6": { entrada: 0.95, cacheada: 0.16, salida: 4.0 },
  "@cf/openai/gpt-oss-120b": { entrada: 0.35, cacheada: null, salida: 0.75 },
};

// kimi es un modelo de razonamiento: gasta parte del presupuesto PENSANDO antes
// de escribir. Con presupuesto justo devuelve `content` vacío y finish_reason
// "length" — que se lee como "no tradujo" cuando en realidad no le alcanzó.
// Un trozo de 1,400 palabras son ~2,000 tokens de salida; el resto es margen de
// razonamiento. Lo que se cobra es lo usado, no el tope.
const MAX_TOKENS = Number(process.env.MC_TRAD_MAX_TOKENS ?? 16_000);
const TOPE_MS = Number(process.env.MC_TRAD_TOPE_MS ?? 300_000);

const cuenta = () => process.env.CLOUDFLARE_ACCOUNT_ID;
const token = () => process.env.CLOUDFLARE_API_TOKEN;

const SISTEMA = `You translate published research documents. Your output is republished verbatim under an AGPL-3.0 public repository, with the original author's name on it.

TARGET LOCALE: ${locale} — ${ficha.nombre}
Decimal separator: ${ficha.decimal}
Thousands separator: ${ficha.millares}
${ficha.notas}

ABSOLUTE RULES — breaking any one of these makes the output unusable:

1. NUMBERS SURVIVE IDENTICAL. Every digit, percentage, year, sample size, effect
   size, price and count keeps its exact value. A 43% that becomes 34% is a
   fabricated citation with our name on it. You may re-format a number to the
   target locale's decimal/thousands convention (43.5 -> 43,5 where the locale
   uses a comma), but you may NEVER change its value, drop it, round it, or
   invent one that was not there.
2. SOURCE URLs ARE UNTOUCHABLE. Copy every http/https URL character for
   character. Do not translate, shorten, localize or "fix" any URL. Do not
   translate the domain. Do not add or remove URLs.
3. THE MARKER [unverified] STAYS, in that exact English spelling, in exactly the
   places it appears. It is a warning that the claim was not independently
   confirmed. Losing it turns a warning into an assertion, which is worse than
   losing a paragraph. Same for longer bracketed variants such as
   [unverified this session, high training-knowledge confidence] — keep the
   bracket, keep the word "unverified", you may translate the rest of the phrase.
4. CITED IDs ARE NOT TRANSLATED. Identifiers of the form mc-01..mc-48 and
   D-001..D-999 stay exactly as written, lowercase/uppercase as in the source.
5. CITATION MARKERS like [1], [2][3], [5] stay exactly where they are, attached
   to the same claim. Never renumber them.
6. MARKDOWN STRUCTURE IS PRESERVED. Same heading levels, same table shape (same
   number of columns and rows, same alignment row), same list markers, same
   blockquotes, same bold/italic emphasis, same fenced code blocks.
7. CODE, MATH NOTATION SAMPLES, FILE PATHS AND IDENTIFIERS INSIDE BACKTICKS ARE
   NOT TRANSLATED. \`wrangler.jsonc\`, \`docs/research/\`, \`@cf/...\`, and notation
   examples like \`127 : 4 = 31,75\` are literal. Leave them byte-identical.
8. LOCALE NAMES (en, es-MX, es-ES, fr-FR, pt-BR, pt-PT, de-DE) and BCP-47 tags
   are never translated.
9. PROPER NAMES of organizations, products, standards, laws and researchers stay
   in their original form (BIPM, ISO 80000-1, COPPA, GDPR, CLDR, Cloudflare,
   Duolingo, Miura, Fuson). You may add a translated gloss in parentheses only
   where the source itself explains the term.
10. DO NOT SUMMARIZE, DO NOT EXPAND, DO NOT ADD COMMENTARY. One paragraph in,
    one paragraph out. No preamble, no "Here is the translation", no closing
    remarks, no code fences wrapping the whole answer.

The document contains a section titled "Resumen ejecutivo (ES)" and another
"Executive summary (EN)". Translate BOTH into the target locale, keeping both
headings' structure; the corpus keeps a two-summary shape by design.

Output ONLY the translated Markdown.`;

async function llamar({ modelo, usuario, sesion }) {
  const ctrl = new AbortController();
  const reloj = setTimeout(() => ctrl.abort(), TOPE_MS);
  let res;
  try {
    res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cuenta()}/ai/v1/chat/completions`,
      {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          authorization: `Bearer ${token()}`,
          "content-type": "application/json",
          // Manda todos los trozos de un documento a la misma instancia para
          // que la caché de prefijo del sistema acierte. El SISTEMA es idéntico
          // en todos los trozos: es exactamente lo que se quiere cachear.
          "x-session-affinity": sesion,
        },
        body: JSON.stringify({
          model: modelo,
          max_tokens: MAX_TOKENS,
          temperature: 0,
          messages: [
            { role: "system", content: SISTEMA },
            { role: "user", content: usuario },
          ],
        }),
      },
    );
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(`${modelo} no respondió en ${TOPE_MS / 1000}s (MC_TRAD_TOPE_MS lo cambia)`);
    }
    throw err;
  } finally {
    clearTimeout(reloj);
  }

  if (!res.ok) {
    const cuerpo = await res.text().catch(() => "");
    throw new Error(`Workers AI ${res.status} en ${modelo}: ${cuerpo.slice(0, 300)}`);
  }

  const json = await res.json();
  const eleccion = json?.choices?.[0] ?? {};
  const texto = eleccion.message?.content ?? "";
  const u = json?.usage ?? {};

  if (eleccion.finish_reason === "length" && !texto.trim()) {
    throw new Error(
      `${modelo} agotó max_tokens (${MAX_TOKENS}) razonando y no escribió nada — ` +
        `${(eleccion.message?.reasoning_content ?? "").length} caracteres de razonamiento. ` +
        "Súbelo con MC_TRAD_MAX_TOKENS.",
    );
  }
  if (!texto.trim()) {
    throw new Error(`${modelo} devolvió contenido vacío (finish_reason ${eleccion.finish_reason})`);
  }

  return {
    texto,
    uso: {
      entrada: u.prompt_tokens ?? 0,
      salida: u.completion_tokens ?? 0,
      cacheada: u.prompt_tokens_details?.cached_tokens ?? 0,
    },
  };
}

/** Quita el envoltorio de bloque de código que a veces añade el modelo. */
function desenvolver(texto) {
  const limpio = texto.trim();
  const m = limpio.match(/^```(?:markdown|md)?\n([\s\S]*)\n```$/);
  return (m ? m[1] : limpio).trim();
}

async function traducirTrozo(usuario, sesion) {
  const problemas = [];
  for (const modelo of CADENA) {
    for (let intento = 0; intento < 2; intento++) {
      try {
        const r = await llamar({ modelo, usuario, sesion });
        return { ...r, texto: desenvolver(r.texto), modelo, reintentos: intento };
      } catch (err) {
        problemas.push(`${modelo}: ${err.message}`);
      }
    }
  }
  throw new Error(`ningún modelo tradujo el trozo — ${problemas.join(" | ")}`);
}

function costo(modelo, uso) {
  const p = PRECIOS[modelo];
  if (!p) return 0;
  const frescos = Math.max(0, uso.entrada - uso.cacheada);
  const precioCache = p.cacheada ?? p.entrada;
  return (
    (frescos * p.entrada + uso.cacheada * precioCache + uso.salida * p.salida) / 1_000_000
  );
}

const dinero = (n) => `$${n.toFixed(4)}`;

// ------------------------------------------------------------- 6. la corrida
if (!seco && (!cuenta() || !token())) {
  console.error("error: faltan CLOUDFLARE_ACCOUNT_ID y/o CLOUDFLARE_API_TOKEN");
  console.error("       se leen de .env (./scripts/set-keys.sh los captura sin eco)");
  process.exit(2);
}

mkdirSync(DESTINO, { recursive: true });

const total = { entrada: 0, salida: 0, cacheada: 0, costo: 0, trozos: 0 };
const hechos = [];
const saltados = [];
const fallidos = [];
const arranque = Date.now();

console.log(`\n== traducir-corpus — ${locale} (${ficha.nombre}) ==`);
console.log(`   origen  docs/research/            ${objetivo.length} documento(s)`);
console.log(`   destino docs/research/${locale}/`);
console.log(`   modelos ${CADENA.join(" -> ")}`);
console.log(`   trozo   ~${PALABRAS_POR_TROZO} palabras, max_tokens ${MAX_TOKENS}\n`);

for (const nombre of objetivo) {
  const rutaOrigen = join(ORIGEN, nombre);
  const rutaDestino = join(DESTINO, nombre);

  // Idempotencia: destino más nuevo que origen = ya está al día.
  if (!forzar && existsSync(rutaDestino)) {
    const mOrigen = statSync(rutaOrigen).mtimeMs;
    const mDestino = statSync(rutaDestino).mtimeMs;
    if (mDestino >= mOrigen) {
      saltados.push(nombre);
      console.log(`   ·  ${nombre}  al día, se salta`);
      continue;
    }
  }

  const fuente = readFileSync(rutaOrigen, "utf8");
  const trozos = trocear(fuente);
  const sesion = `mc-trad-${locale}-${nombre}`;

  console.log(`   >  ${nombre}  ${palabras(fuente)} palabras -> ${trozos.length} trozo(s)`);

  if (seco) {
    trozos.forEach((t, i) => {
      const primera = t.split("\n").find((l) => l.trim())?.slice(0, 64) ?? "";
      console.log(`      ${String(i + 1).padStart(2)}. ${String(palabras(t)).padStart(5)} pal  ${primera}`);
    });
    continue;
  }

  const salida = [];
  const docInicio = Date.now();
  const docUso = { entrada: 0, salida: 0, cacheada: 0, costo: 0 };
  let roto = false;

  for (let i = 0; i < trozos.length; i++) {
    const cabecera =
      `Translate chunk ${i + 1} of ${trozos.length} of the research document ` +
      `"${nombre}" into ${locale}.\n\n---\n\n`;
    try {
      const r = await traducirTrozo(cabecera + trozos[i], sesion);
      salida.push(r.texto);
      docUso.entrada += r.uso.entrada;
      docUso.salida += r.uso.salida;
      docUso.cacheada += r.uso.cacheada;
      const c = costo(r.modelo, r.uso);
      docUso.costo += c;
      total.trozos += 1;
      console.log(
        `      ${String(i + 1).padStart(2)}/${trozos.length}  ${r.modelo.split("/").pop()}` +
          `${r.reintentos ? ` (reintento ${r.reintentos})` : ""}` +
          `  in ${r.uso.entrada} (cache ${r.uso.cacheada})  out ${r.uso.salida}  ${dinero(c)}`,
      );
    } catch (err) {
      console.error(`      ${i + 1}/${trozos.length}  FALLÓ: ${err.message}`);
      fallidos.push(`${nombre} trozo ${i + 1}: ${err.message}`);
      roto = true;
      break;
    }
  }

  if (roto) {
    // No se escribe nada. Un documento a medias pasaría la idempotencia la
    // próxima vez y quedaría truncado para siempre.
    console.error(`   ✗  ${nombre}  no se escribió (traducción incompleta)`);
    continue;
  }

  writeFileSync(rutaDestino, salida.join("\n\n") + "\n", "utf8");
  total.entrada += docUso.entrada;
  total.salida += docUso.salida;
  total.cacheada += docUso.cacheada;
  total.costo += docUso.costo;
  hechos.push({ nombre, ...docUso, seg: (Date.now() - docInicio) / 1000 });
  console.log(
    `   ✓  ${nombre}  ${dinero(docUso.costo)}  ` +
      `${docUso.entrada}+${docUso.salida} tokens  ${((Date.now() - docInicio) / 1000).toFixed(1)}s`,
  );
}

// ------------------------------------------------------------- 7. el resumen
const seg = (Date.now() - arranque) / 1000;
console.log(`\n-- resumen ${locale} ------------------------------------------`);
console.log(`   traducidos ${hechos.length}   saltados ${saltados.length}   fallidos ${fallidos.length}`);
console.log(`   trozos     ${total.trozos}`);
console.log(`   tokens     entrada ${total.entrada} (cacheada ${total.cacheada})  salida ${total.salida}`);
console.log(`   costo      ${dinero(total.costo)}`);
if (hechos.length > 0) {
  const medio = total.costo / hechos.length;
  console.log(`   por doc    ${dinero(medio)} de media`);
  // 47 investigaciones + README = 48 archivos x 6 locales destino = 288.
  // El encargo habla de 282 porque cuenta el corpus sin los seis que ya
  // estuvieran hechos; se imprimen las dos cifras para no adivinar cuál quiere.
  console.log(`   proyección 282 docs ≈ ${dinero(medio * 282)}   288 docs ≈ ${dinero(medio * 288)}`);
}
console.log(`   tiempo     ${seg.toFixed(1)}s\n`);

if (fallidos.length > 0) {
  console.error("fallos:");
  for (const f of fallidos) console.error(`  - ${f}`);
  process.exit(1);
}
if (!seco && hechos.length === 0 && saltados.length === 0) {
  console.error("error: no se tradujo ni se saltó nada — no había qué hacer");
  process.exit(1);
}
console.log(`siguiente: node audits/corpus-integridad.mjs ${locale}\n`);
