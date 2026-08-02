#!/usr/bin/env node
// Auditor determinista 09 — JSON-LD válido y coincidente con la página
//
// Hace cumplir: mc-48 §3 (implicación de diseño 7), D-022, mc-34.
//
// Por qué existe, y por qué la mitad importante no es la validación.
//
// Validar que el JSON parsea es lo barato. Lo que de verdad decide si el
// marcado sirve o no existe es la regla dura de mc-48 §3: **el contenido del
// esquema debe coincidir con lo visible en la página, y si difiere Google
// puede ignorar el marcado por completo**. No una propiedad, no un nodo: todo.
// Un JSON-LD impecable que anuncia un título que la página no muestra vale
// exactamente lo mismo que no tener JSON-LD, con el costo añadido de que nadie
// se entera, porque no rompe nada visible ni sale en ninguna prueba.
//
// Ese es el modo de falla que este auditor persigue. Los otros —`@type`
// ausente, `inLanguage` copiado de otro locale, tipos que divergen entre
// idiomas— son baratos de comprobar y salen gratis en el mismo recorrido.
//
// POR QUÉ SOBRE EL BUILD Y NO SOBRE https://math.kilowatto.com. El sitio ya
// está desplegado y responde 200, así que las dos opciones existen. Se eligió
// `apps/web/dist/` por la misma razón que el README de esta carpeta separa
// `run.mjs` de `live.mjs`: este auditor corre en el gancho de pre-commit y debe
// juzgar **el cambio que estás por hacer**, no producción. Medir contra el
// origen desplegado haría que un commit fallara porque el sitio se cayó o
// porque el despliegue anterior aún no propagó — culpa que no es del commit —
// y además metería la red dentro de un gate que hoy es determinista y offline.
// La verificación del HTML realmente servido es trabajo de `audits/live.mjs`.
//
// LO QUE ESTE AUDITOR NO PUEDE COMPROBAR, dicho de frente:
//
//   · Que Google acepte el marcado. Esto no es la Rich Results Test; comprueba
//     las reglas que mc-48 documenta, no el validador de Google.
//   · Que las propiedades sean las correctas para cada tipo de schema.org. No
//     hay vocabulario cargado: si alguien pone `autor` en vez de `author`, pasa.
//   · Texto oculto por CSS. "Visible" aquí significa "está en el <body> fuera
//     de <script> y <style>". Un `display:none` o un `hidden` se cuentan como
//     visibles, y un texto inyectado por JavaScript después del render se
//     cuenta como ausente.
//   · Contenido renderizado en el servidor bajo demanda. Solo ve lo que Astro
//     dejó prerenderizado en `dist/`.
//   · Si la traducción es buena. Comprueba que el marcado de `de-DE` coincida
//     con la página `de-DE`; que el alemán esté bien escrito es `mc-34`.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { SEGMENTOS } from "../apps/web/src/i18n/rutas-tabla.mjs";

const DIST = "apps/web/dist";
const I18N = "apps/web/src/i18n/index.ts";
const ORIGEN = "https://math.kilowatto.com";
const MANIFIESTO = "apps/web/src/lib/corpus-verificado.json";

// --- Documentos del corpus que YA se sabe que siguen en inglés -------------
// `corpus.ts` cae a honestidad deliberada (D-… la traducción no verificada NO
// se sirve): si `docs/research/<locale>/<file>.md` no pasó el auditor de
// integridad, la página sirve el cuerpo en inglés y su ScholarlyArticle
// declara `inLanguage: "en"` en vez de mentir. Sin esta lista ese
// comportamiento correcto se ve idéntico a la plantilla mal copiada que la
// regla de abajo sí busca cazar — y castigar la honestidad con un auditor en
// rojo es exactamente el incentivo que empuja a alguien a mentir en su lugar.
const VERIFICADOS = existsSync(MANIFIESTO) ? JSON.parse(readFileSync(MANIFIESTO, "utf8")) : {};
function traduccionVerificada(locale, ruta) {
  const m = /\/(mc-\d+-[a-z0-9-]+)\/[^/]*$/.exec(ruta);
  if (!m) return true; // no es un documento del corpus: la regla no aplica
  const slug = m[1];
  return (VERIFICADOS[locale] ?? []).some((archivo) => archivo.includes(`-${slug}.md`));
}

// --- Normalizar el primer tramo de la ruta a su clave canónica (D-049) -----
// `SEGMENTOS[locale][clave] = segmentoLocalizado` — p.ej. SEGMENTOS["de-DE"]
// .investigacion === "forschung". Para agrupar "la misma página" entre
// locales hace falta la operación inversa: dado un locale y su segmento
// localizado, encontrar la clave canónica ("investigacion") que comparten
// los siete. Sin esto, agrupar por ruta cruda compara "/forschung/mc-01/"
// contra "/investigacion/mc-01/" — nunca son la misma clave, así que cada
// documento parece "faltante" en seis de los siete locales aunque exista.
const SEGMENTOS_INVERSOS = new Map(
  Object.entries(SEGMENTOS).map(([locale, tabla]) => [
    locale,
    new Map(Object.entries(tabla).map(([clave, local]) => [local, clave])),
  ]),
);

function normalizarRuta(ruta, locale) {
  const partes = ruta.split("/").filter(Boolean);
  if (partes.length === 0) return ruta;
  const canonico = SEGMENTOS_INVERSOS.get(locale)?.get(partes[0]);
  if (canonico) partes[0] = canonico;
  return "/" + partes.join("/");
}

// Cobertura léxica mínima de la descripción del esquema sobre el texto visible.
//
// Por qué un umbral y no coincidencia literal. El título sí se exige literal —
// es una frase corta que la página muestra tal cual. La descripción no: es un
// resumen, y ninguna página razonable la repite palabra por palabra en el
// cuerpo. Exigir literalidad ahí produciría un gate que falla siempre, y un
// gate que falla siempre se desactiva, que es peor que no tenerlo.
//
// Lo que sí detecta este umbral es el modo de falla real: que la descripción
// del marcado hable de OTRA página —copiada de otro locale, heredada de una
// plantilla, rellenada de palabras clave que la página no contiene—. Hoy las
// siete páginas van entre 67% y 76%; el 60% deja margen sin volverse decorativo.
// El resumen de éxito imprime la peor cobertura a propósito, para que la
// erosión se vea venir antes de que bloquee un commit.
const COBERTURA_MIN = 0.6;

const problemas = [];

// --- Los locales, leídos de su única fuente de verdad ---------------------
// Se leen de apps/web/src/i18n/index.ts en vez de repetirlos aquí: una lista
// duplicada es una lista que se desincroniza. Si no se puede leer, se falla —
// sin la lista no se sabe cuántas páginas DEBERÍAN existir, y un auditor que no
// sabe qué espera encuentra siempre lo que hay.
function leerLocales() {
  if (!existsSync(I18N)) return null;
  const m = readFileSync(I18N, "utf8").match(/export const LOCALES\s*=\s*\[([^\]]*)\]/);
  if (!m) return null;
  const locales = [...m[1].matchAll(/["']([\w-]+)["']/g)].map((x) => x[1]);
  return locales.length > 0 ? locales : null;
}

const LOCALES = leerLocales();
if (!LOCALES) {
  console.error("✗ jsonld-valid\n");
  console.error(`  · no se pudo leer la lista de locales de ${I18N}.`);
  console.error("    Sin ella no se sabe qué páginas deberían existir, y un");
  console.error("    auditor que no sabe qué espera siempre encuentra lo que hay.");
  console.error("\n  Hace cumplir: mc-48 §3, D-022, mc-34");
  process.exit(1);
}

// --- Sin build no hay nada que medir --------------------------------------
// Este es el único camino que sale con 0 sin haber comprobado nada, y se
// anuncia en voz alta. `apps/web/dist/` está en .gitignore: en un clon recién
// hecho no existe, y bloquear ahí el primer commit sería castigar al que aún no
// corrió `pnpm build`. Que quede claro qué no se verificó.
if (!existsSync(DIST)) {
  console.log("○ jsonld-valid — no hay build todavía; NADA se verificó (corre pnpm build)");
  console.log(`  · el marcado se emite en apps/web/src/layouts/Base.astro y solo`);
  console.log(`    se puede juzgar ya renderizado: es lo que Google lee.`);
  process.exit(0);
}

// --- Utilidades de texto ---------------------------------------------------

// Normaliza para comparar: sin acentos, sin mayúsculas, sin variantes de guion
// ni de comilla, con espacios colapsados. Sin esto, el marcado y la página
// difieren por un guion largo contra uno corto y el auditor grita por nada.
const ENTIDADES = {
  "&amp;": "&", "&#38;": "&", "&#x26;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#34;": '"', "&#x22;": '"',
  "&#39;": "'", "&#x27;": "'", "&apos;": "'", "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–",
};

function normalizar(texto) {
  return texto
    .replace(/&(amp|#38|#x26|lt|gt|quot|#34|#x22|#39|#x27|apos|nbsp|mdash|ndash);/g, (e) => ENTIDADES[e] ?? e)
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[‐-―]/g, "-")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// El texto que un lector ve: el <body> sin <script> ni <style>, sin etiquetas.
// El <head> queda fuera a propósito — <title> y <meta description> son lo que
// el marcado suele copiarse a sí mismo, y comparar el esquema contra ellos no
// prueba que la PÁGINA diga lo mismo. Se comparan aparte, como comprobación
// distinta.
function textoVisible(html) {
  const i = html.search(/<body[\s>]/i);
  const cuerpo = i === -1 ? html : html.slice(i);
  return normalizar(
    cuerpo
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

// Palabras de contenido: se descartan las de tres letras o menos, que son
// artículos y preposiciones y aparecen en cualquier texto por casualidad.
// Contarlas inflaría la cobertura y volvería el umbral una formalidad.
function palabrasDeContenido(texto) {
  return [...new Set(normalizar(texto).split(/[^\p{L}\p{N}']+/u).filter((p) => p.length > 3))];
}

// Prefiere el grupo nombrado `valor` cuando existe.
//
// El patrón de atributos abría con ["'] y cerraba con ["'] sin recordar cuál
// había usado, así que el apóstrofo de "l'âge" en francés terminaba la captura a
// media frase y el auditor fallaba sobre su propio bug, no sobre el sitio. Al
// arreglarlo con retrorreferencia el contenido se movió de grupo, y contar
// paréntesis para saber cuál leer es exactamente cómo se rompe la próxima vez.
const atributo = (html, re) => {
  const m = html.match(re);
  if (!m) return null;
  return m.groups?.valor ?? m[1] ?? null;
};

// Un nodo se nombra por su tipo cuando lo tiene: "#1[0] WebSite" le dice a
// quien lee el fallo dónde mirar, y "#1[0]" a secas no le dice nada.
const etiqueta = ({ nodo, ruta }) => (nodo["@type"] ? `${ruta} ${[nodo["@type"]].flat().join("/")}` : ruta);

// --- Recorrido del grafo ---------------------------------------------------

// Aplana el documento a una lista de nodos, entren por @graph, por un arreglo
// en la raíz o por anidamiento. Distingue nodos de referencias: un objeto con
// solo @id no es un nodo, es un puntero, y se exige que apunte a algo.
function recorrer(valor, nodos, referencias, ruta = "$") {
  if (Array.isArray(valor)) {
    valor.forEach((v, i) => recorrer(v, nodos, referencias, `${ruta}[${i}]`));
    return;
  }
  if (valor === null || typeof valor !== "object") return;

  const llaves = Object.keys(valor).filter((k) => k !== "@context");
  if (llaves.length === 1 && llaves[0] === "@id") {
    referencias.push({ id: valor["@id"], ruta });
    return;
  }

  nodos.push({ nodo: valor, ruta });
  for (const [k, v] of Object.entries(valor)) {
    if (k === "@context") continue;
    recorrer(v, nodos, referencias, `${ruta}.${k}`);
  }
}

// --- Recolección de páginas ------------------------------------------------

function paginasHtml(dir, encontradas = []) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name === "_worker.js") continue; // servidor, no se sirve al navegador
      paginasHtml(p, encontradas);
    } else if (entrada.name.endsWith(".html")) {
      encontradas.push(p);
    }
  }
  return encontradas;
}

const todas = paginasHtml(DIST);
if (todas.length === 0) {
  console.error("✗ jsonld-valid\n");
  console.error(`  · 0 páginas HTML en ${DIST}. Un escáner que no ve nada pasa siempre.`);
  console.error("\n  Hace cumplir: mc-48 §3, D-022, mc-34");
  process.exit(1);
}

// --- Análisis página por página --------------------------------------------

const analizadas = [];
let saltadas = 0;
let nodosTotales = 0;
let peorCobertura = { pagina: null, valor: 1 };

for (const archivo of todas) {
  const html = readFileSync(archivo, "utf8");
  const rel = relative(DIST, archivo).split(sep).join("/");

  // Una página noindex no entra al índice, así que no necesita datos
  // estructurados. La raíz del sitio es exactamente eso: un redirector a /en/.
  const robots = atributo(html, /<meta\s+name=["']robots["']\s+content=(?<q>["'])(?<valor>(?:(?!\k<q>).)*)\k<q>/i);
  if (robots && /noindex/i.test(robots)) {
    saltadas++;
    continue;
  }

  const bloques = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (bloques.length === 0) {
    problemas.push(`${rel}: página indexable sin ningún <script type="application/ld+json">.`);
    continue;
  }

  const canonica = atributo(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonica) {
    problemas.push(`${rel}: sin <link rel="canonical">. Sin ella no se puede decir a qué página se refiere el marcado.`);
  }

  const titulo = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? null;
  const metaDesc = atributo(html, /<meta\s+name=["']description["']\s+content=(?<q>["'])(?<valor>(?:(?!\k<q>).)*)\k<q>/i);
  const visible = textoVisible(html);
  if (visible.length === 0) {
    problemas.push(`${rel}: el <body> no dejó texto visible. Sin él no se puede comprobar la regla de coincidencia.`);
    continue;
  }

  // El locale se deduce de la ruta: dist/de-DE/index.html → de-DE.
  const primerTramo = rel.split("/")[0];
  const locale = LOCALES.includes(primerTramo) ? primerTramo : null;
  const ruta = locale ? "/" + rel.slice(primerTramo.length + 1) : "/" + rel;
  const rutaCanonica = locale ? normalizarRuta(ruta, locale) : ruta;

  const nodos = [];
  const referencias = [];
  let roto = false;

  for (const [i, bloque] of bloques.entries()) {
    const crudo = bloque[1];

    // Un `</` sin escapar dentro del bloque cierra el <script> antes de tiempo
    // y el navegador recibe JSON partido a la mitad. La regex de arriba ya
    // habría cortado ahí, así que esto caza el resto: comentarios HTML dentro
    // del JSON, que es la otra forma de romperlo.
    if (crudo.includes("<!--") || crudo.includes("<![CDATA[")) {
      problemas.push(`${rel}: el bloque JSON-LD #${i + 1} contiene marcado HTML sin escapar.`);
      roto = true;
      continue;
    }

    let doc;
    try {
      doc = JSON.parse(crudo);
    } catch (e) {
      problemas.push(`${rel}: el bloque JSON-LD #${i + 1} no parsea — ${e.message}`);
      roto = true;
      continue;
    }

    const contexto = Array.isArray(doc) ? doc.map((d) => d?.["@context"]).find(Boolean) : doc?.["@context"];
    const contextoTexto = typeof contexto === "string" ? contexto : JSON.stringify(contexto ?? "");
    if (!contexto) {
      problemas.push(`${rel}: el bloque JSON-LD #${i + 1} no declara @context.`);
    } else if (!/schema\.org/.test(contextoTexto)) {
      problemas.push(`${rel}: @context no apunta a schema.org (dice ${contextoTexto}).`);
    }

    const raiz = doc && !Array.isArray(doc) && doc["@graph"] ? doc["@graph"] : doc;
    recorrer(raiz, nodos, referencias, `#${i + 1}`);
  }

  if (roto) continue;

  nodosTotales += nodos.length;

  // Todo nodo declara su tipo. Un nodo sin @type es invisible para el
  // consumidor: no sabe qué está leyendo, y lo ignora.
  for (const { nodo, ruta: r } of nodos) {
    if (!nodo["@type"]) {
      problemas.push(`${rel}: nodo sin @type en ${r} (llaves: ${Object.keys(nodo).slice(0, 4).join(", ")}).`);
    }
  }

  // Toda referencia {"@id": …} resuelve a un nodo definido en el mismo
  // documento. Un `publisher` que apunta a una organización que nadie definió
  // deja el grafo colgando y la señal de editor se pierde entera.
  const idsDefinidos = new Set(nodos.map(({ nodo }) => nodo["@id"]).filter(Boolean));
  for (const { id, ruta: r } of referencias) {
    if (!idsDefinidos.has(id)) {
      problemas.push(`${rel}: la referencia ${r} apunta a "${id}", que ningún nodo define.`);
    }
  }

  // inLanguage: cada versión declara el suyo, y es el de su ruta (mc-48 §3).
  // El error clásico es copiar la plantilla de un locale a otro y dejar el
  // inLanguage del original — el marcado queda diciendo que la página alemana
  // está en inglés.
  const conIdioma = nodos.filter(({ nodo }) => nodo.inLanguage);
  const idiomaDe = (nodo) =>
    typeof nodo.inLanguage === "string" ? nodo.inLanguage : nodo.inLanguage?.["@id"] ?? "";

  if (locale) {
    if (conIdioma.length === 0) {
      problemas.push(`${rel}: ningún nodo declara inLanguage. Cada versión localizada debe declarar el suyo (mc-48 §3).`);
    }

    // 1. Los nodos de una misma página no pueden contradecirse entre sí.
    //
    // Esta comprobación es la que faltaba, y su ausencia costó 52 páginas
    // reales (#319). La regla de abajo compara cada nodo contra el locale de la
    // RUTA, y exime al `ScholarlyArticle` cuando cae honestamente al inglés. El
    // nodo `WebPage` no estaba exento… pero tampoco podía fallar: el layout
    // escribía `inLanguage: locale` sin condición, así que comparar ese valor
    // con el locale de la ruta era comparar `locale` con `locale`. Verde
    // garantizado, y mientras tanto la misma página declaraba el mismo titular
    // como francés en un nodo y como inglés en el otro.
    //
    // Comparar los nodos ENTRE SÍ no se puede satisfacer por construcción: hace
    // falta que el layout sepa de verdad en qué idioma está el texto que le
    // pasaron.
    const idiomas = [...new Set(conIdioma.map(({ nodo }) => idiomaDe(nodo)))];
    if (idiomas.length > 1) {
      const detalle = conIdioma.map((e) => `${etiqueta(e)}=${idiomaDe(e.nodo)}`).join(", ");
      problemas.push(
        `${rel}: los nodos JSON-LD de la MISMA página declaran idiomas distintos (${detalle}). ` +
          "El mismo texto no puede estar en dos idiomas a la vez; Google descarta el marcado " +
          "contradictorio o publica el equivocado (mc-48 §3).",
      );
    }

    // 2. Y el idioma que declaran es el de la ruta — salvo la caída honesta a
    //    inglés de un documento del corpus todavía sin traducción verificada,
    //    que ahora aplica a la página ENTERA y no solo al artículo.
    const caidaHonesta = !traduccionVerificada(locale, ruta);
    for (const entrada of conIdioma) {
      const decl = idiomaDe(entrada.nodo);
      if (decl === "en" && caidaHonesta) continue;
      if (decl !== locale) {
        problemas.push(`${rel}: inLanguage "${decl}" en ${etiqueta(entrada)}, pero la página es "${locale}".`);
      }
    }
    // El <html lang> y el marcado no pueden discrepar: si lo hacen, uno de los
    // dos miente y no hay forma de saber cuál.
    const lang = atributo(html, /<html[^>]*\blang=["']([^"']+)["']/i);
    if (lang && lang !== locale) {
      problemas.push(`${rel}: <html lang="${lang}"> no coincide con el locale de la ruta "${locale}".`);
    }
  }

  // El nodo que habla de ESTA página: el que declara su URL canónica. Buscarlo
  // por url y no por @type es a propósito — mañana la página de una
  // investigación será ScholarlyArticle y la de una banda Course, y este
  // auditor no debería tener que enterarse.
  const mismaUrl = (v) => typeof v === "string" && v.replace(/#.*$/, "").replace(/\/$/, "") === (canonica ?? "").replace(/\/$/, "");
  const nodoPagina = nodos.find(({ nodo }) => mismaUrl(nodo.url) || mismaUrl(nodo["@id"]))?.nodo;

  if (!nodoPagina) {
    problemas.push(`${rel}: ningún nodo del marcado se refiere a esta página (${canonica ?? "sin canónica"}).`);
  } else {
    // --- La regla dura de mc-48 §3 -----------------------------------------
    const nombre = nodoPagina.name;
    const descripcion = nodoPagina.description;

    if (!nombre) {
      problemas.push(`${rel}: el nodo de la página no declara name.`);
    } else {
      // El título compuesto se parte por su separador. "Math Challenge — De
      // contar patos a topología algebraica" no aparece entero en ninguna
      // parte del cuerpo, pero sus dos mitades sí: una es el <h1> y la otra el
      // lema bajo él. Exigir la cadena completa castigaría una construcción
      // correcta; exigir cada mitad es la comprobación que de verdad quería
      // hacerse.
      const segmentos = nombre.split(/\s+[—–|·]\s+|\s+-\s+/).map((s) => s.trim()).filter(Boolean);
      for (const seg of segmentos) {
        if (!visible.includes(normalizar(seg))) {
          problemas.push(
            `${rel}: el name del marcado dice "${seg}" y ese texto NO aparece en el cuerpo de la página. ` +
              `mc-48 §3: si el esquema no coincide con lo visible, Google puede ignorar TODO el marcado.`,
          );
        }
      }
      if (titulo && normalizar(titulo) !== normalizar(nombre)) {
        problemas.push(`${rel}: el name del marcado ("${nombre}") no coincide con el <title> ("${titulo.trim()}").`);
      }
    }

    if (!descripcion) {
      problemas.push(`${rel}: el nodo de la página no declara description.`);
    } else {
      if (metaDesc && normalizar(metaDesc) !== normalizar(descripcion)) {
        problemas.push(`${rel}: la description del marcado no coincide con <meta name="description">.`);
      }
      const palabras = palabrasDeContenido(descripcion);
      if (palabras.length === 0) {
        problemas.push(`${rel}: la description del marcado no tiene ni una palabra de contenido.`);
      } else {
        const presentes = palabras.filter((p) => visible.includes(p));
        const cobertura = presentes.length / palabras.length;
        if (cobertura < peorCobertura.valor) peorCobertura = { pagina: rel, valor: cobertura };
        if (cobertura < COBERTURA_MIN) {
          const ausentes = palabras.filter((p) => !visible.includes(p));
          problemas.push(
            `${rel}: solo el ${(cobertura * 100).toFixed(0)}% de la description del marcado aparece en el ` +
              `cuerpo (mínimo ${COBERTURA_MIN * 100}%). Ausentes: ${ausentes.slice(0, 12).join(", ")}. ` +
              `mc-48 §3: marcado que no coincide con la página se ignora entero.`,
          );
        }
      }
    }

    // Una URL de otro origen en el nodo de la página es marcado copiado de otro
    // sitio, o de staging. Google lo lee como que la página habla de otra cosa.
    for (const clave of ["url", "@id"]) {
      const v = nodoPagina[clave];
      if (typeof v === "string" && /^https?:\/\//.test(v) && !v.startsWith(ORIGEN)) {
        problemas.push(`${rel}: el nodo de la página declara ${clave} fuera de ${ORIGEN} → ${v}`);
      }
    }
  }

  analizadas.push({
    rel,
    locale,
    ruta,
    rutaCanonica,
    tipos: [...new Set(nodos.flatMap(({ nodo }) => [nodo["@type"]].flat()).filter(Boolean))].sort(),
  });
}

// --- Los siete locales, y el mismo esquema en los siete --------------------
// mc-48 §3: los tipos deben permanecer consistentes entre idiomas — no se usa
// Course en español y Article en alemán para la misma página. Se agrupa por
// `rutaCanonica` (el segmento de sección normalizado a su clave D-049, p.ej.
// "forschung" y "pesquisa" ambos vuelven a "investigacion") y NO por `ruta`
// cruda: como cada locale traduce su propio segmento de sección, agrupar por
// ruta cruda nunca encuentra la misma clave dos veces y reporta cada página
// como "faltante" en los otros seis locales aunque exista.
const porRuta = new Map();
for (const p of analizadas) {
  if (!p.locale) continue;
  if (!porRuta.has(p.rutaCanonica)) porRuta.set(p.rutaCanonica, []);
  porRuta.get(p.rutaCanonica).push(p);
}

for (const [ruta, versiones] of porRuta) {
  const faltantes = LOCALES.filter((l) => !versiones.some((v) => v.locale === l));
  if (faltantes.length > 0) {
    problemas.push(`la ruta "${ruta}" no tiene marcado en: ${faltantes.join(", ")} (D-022: siete locales, no cinco idiomas).`);
  }
  const base = versiones[0];
  for (const v of versiones.slice(1)) {
    if (v.tipos.join("|") !== base.tipos.join("|")) {
      problemas.push(
        `la ruta "${ruta}" usa tipos distintos entre locales: ${base.locale} → [${base.tipos.join(", ")}] ` +
          `vs ${v.locale} → [${v.tipos.join(", ")}]. mc-48 §3 exige el mismo esquema en todos los idiomas.`,
      );
    }
  }
}

// Falla cerrado. Si tras todo el recorrido no quedó ninguna página indexable
// con marcado, no hay nada que este auditor haya comprobado — y un auditor que
// no comprobó nada no pasa.
if (analizadas.length === 0) {
  console.error("✗ jsonld-valid\n");
  console.error(`  · 0 páginas indexables con JSON-LD entre ${todas.length} HTML de ${DIST}.`);
  console.error("    Un escáner que no ve nada pasa siempre; este falla.");
  console.error("\n  Hace cumplir: mc-48 §3, D-022, mc-34");
  process.exit(1);
}

if (problemas.length > 0) {
  console.error("✗ jsonld-valid\n");
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(`\n  Hace cumplir: mc-48 §3, D-022, mc-34`);
  console.error(`  La regla que invalida todo lo demás: el contenido del esquema debe`);
  console.error(`  coincidir con lo visible en la página. Si difiere, Google puede`);
  console.error(`  ignorar el marcado POR COMPLETO — no la propiedad que falla, todo.`);
  console.error(`  El marcado se emite en apps/web/src/layouts/Base.astro; el título y`);
  console.error(`  la descripción del esquema salen de las mismas variables que rinde`);
  console.error(`  el <body> justamente para que no puedan separarse. Si este auditor`);
  console.error(`  falla, alguien las separó.`);
  process.exit(1);
}

const tipos = analizadas[0].tipos.join(", ");
console.log(
  `✓ jsonld-valid — ${analizadas.length} página(s) indexable(s), ${nodosTotales} nodo(s), ` +
    `0 desajustes con lo visible`,
);
console.log(`  · inLanguage correcto en ${porRuta.size} ruta(s) × ${LOCALES.length} locales · mismos tipos en todas: ${tipos}`);
console.log(
  `  · descripción→cuerpo: peor cobertura ${(peorCobertura.valor * 100).toFixed(0)}% ` +
    `(${peorCobertura.pagina ?? "-"}), umbral ${COBERTURA_MIN * 100}%`,
);
console.log(`  · ${saltadas} página(s) noindex saltada(s) · no ve texto oculto por CSS ni inyectado por JS`);
