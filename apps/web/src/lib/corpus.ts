/**
 * corpus.ts — el sitio LEE `docs/research/`, no lo copia (plan §4.1).
 *
 * Los 47 documentos de investigación viven en `docs/research/` y son a la vez
 * documentación interna y contenido publicado. Copiarlos dentro de `apps/web`
 * crearía dos versiones del mismo documento, y la primera que se desincroniza
 * es la que declara sus `[unverified]` — justo la afirmación legal que más
 * cuidado necesita (plan §4.1).
 *
 * ─── Cómo está partido este archivo, y por qué ──────────────────────────────
 *
 * Todo lo que parsea Markdown son **funciones puras sobre una cadena**, sin
 * `import.meta.glob` ni `fs`. Eso no es estilo: es lo que permite correrlas en
 * Node suelto —`node --experimental-strip-types`, importando este mismo
 * archivo— y que cada cifra que el sitio publica (cuántos documentos, cuántas
 * palabras, cuántas marcas `[unverified]`) salga de un comando re-ejecutable y
 * no de una constante escrita a mano (CLAUDE.md, regla de commit 2).
 *
 * El auditor anti-deriva que el plan §4.9 pide —`audits/research-sync.mjs`—
 * todavía no existe; cuando exista, debe consumir estas funciones y no
 * reimplementarlas.
 *
 * La única parte que depende de Vite es `loadCorpus()` / `loadBodies()`, y
 * está **dentro de funciones** a propósito: importar este módulo desde Node no
 * evalúa ningún `import.meta.glob`.
 *
 * ─── El parser falla fuerte, nunca en silencio ──────────────────────────────
 *
 * El plan §4.2 avisa que derivar metadatos de la tabla del `README.md` "falla
 * en silencio el día que alguien reordene una columna", y recomienda añadir
 * frontmatter a los 47 documentos. No se hizo así porque esos 47 archivos no
 * son de este encargo. La mitigación es que **cada supuesto tira una
 * excepción en el build**: un documento sin categoría, sin `## Sources`, sin
 * H1 o sin resumen ejecutivo rompe `pnpm build` con el nombre del archivo.
 * Un sitio que no compila es ruidoso; una página con un campo vacío no.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Las cinco categorías del índice de `docs/research/README.md`. */
export type CategoryKey =
  | "pedagogia"
  | "producto"
  | "gamificacion"
  | "interfaz"
  | "plataforma";

export interface Source {
  /** El número con el que el cuerpo del documento la cita: `[7]`. */
  n: number;
  /** Título sin marcas de Markdown: es lo que va en `citation[].name` Y en la lista visible. */
  name: string;
  url?: string;
}

export interface UnverifiedMark {
  /** La marca literal tal como aparece: `[unverified]` o su variante larga. */
  mark: string;
  /** La oración que la contiene, en texto plano. Se publica visible (D-033). */
  sentence: string;
}

export interface FaqPair {
  question: string;
  answer: string;
}

export interface ResearchDoc {
  /** `mc-34` */
  id: string;
  /** 34 — para ordenar y para el enlazado interno `mc-nn`. */
  topic: number;
  /** `mc-34-i18n-math-notation` — el segmento de URL, invariante en los 7 locales. */
  slug: string;
  /** Nombre de archivo dentro de `docs/research/`. */
  file: string;
  /** `2026-07-31`, tomada del nombre del archivo. */
  date: string;
  /** El H1 del documento. Es lo que se renderiza como `<h1>` y lo que va en `headline`. */
  title: string;
  category: CategoryKey;
  /** ⭐ / ⭐⭐ del índice: 0, 1 o 2. */
  stars: number;
  /**
   * Los dos resúmenes ejecutivos, ya en bloques de texto plano.
   *
   * Se guardan los dos siempre —no solo el del locale— porque los 47
   * documentos traen los dos y la página declara cuál está mostrando. Un
   * resumen que existe y no se muestra sería esconder contenido; mostrar uno
   * que no existe sería inventarlo.
   */
  summary: { es: SummaryBlock[]; en: SummaryBlock[] };
  sources: Source[];
  unverified: UnverifiedMark[];
  /** Las preguntas abiertas al dueño. NO son un FAQ: no tienen respuesta. */
  openQuestions: string[];
  /** Pares pregunta-respuesta reales, si el documento tiene alguno. Ver `faqPairs`. */
  faq: FaqPair[];
  /** Palabras del documento completo, contadas en el build (plan §4.9). */
  words: number;
}

// ---------------------------------------------------------------------------
// Utilidades puras
// ---------------------------------------------------------------------------

/**
 * Markdown en línea → texto plano.
 *
 * Existe por la regla dura de `mc-48` §3: lo que va en el JSON-LD tiene que
 * aparecer en el **texto visible** de la página. El navegador muestra
 * "Developmental Science", no "*Developmental Science*", así que la cadena que
 * se pone en `citation[].name` o en `abstract` tiene que estar igual de limpia
 * que la que pinta el HTML, o el auditor de coincidencia falla.
 *
 * Lo que NO toca, a propósito: `[1]` y `[unverified]`. La sustitución de
 * enlaces exige paréntesis inmediatamente después del corchete, así que las
 * referencias numéricas y las marcas de verificación sobreviven — y tienen que
 * sobrevivir, porque también se ven en la página.
 */
export function plain(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Cuenta palabras sobre texto plano. Una sola definición para todo el sitio. */
export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Devuelve el cuerpo de una sección `## Encabezado`, hasta el siguiente `## `.
 * `null` si la sección no existe — quien la necesite decide si eso es un error.
 */
export function section(raw: string, heading: string): string | null {
  const lines = raw.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^## /.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

/** Igual que `section`, pero acepta varios nombres posibles del encabezado. */
export function sectionAny(raw: string, headings: string[]): string | null {
  for (const h of headings) {
    const s = section(raw, h);
    if (s !== null) return s;
  }
  return null;
}

/**
 * Un resumen ejecutivo, partido en los bloques que la página va a pintar.
 *
 * Los 47 resúmenes no tienen la misma forma: unos son un párrafo largo y otros
 * son viñetas. Aplanarlos a una sola cadena perdería la lista; renderizarlos
 * con el pipeline de Markdown los volvería a llenar de marcas y de comillas
 * tipográficas, y entonces la cadena del `abstract` dejaría de ser idéntica a
 * la visible — que es la regla que invalida el marcado entero (`mc-48` §3).
 *
 * La salida es texto plano ya limpio, con la estructura conservada. La página
 * pinta estos bloques y el JSON-LD los concatena: una sola fuente, dos usos.
 */
export interface SummaryBlock {
  kind: "p" | "li";
  text: string;
}

export function summaryBlocks(md: string): SummaryBlock[] {
  const out: SummaryBlock[] = [];
  let buf = "";
  let kind: "p" | "li" = "p";

  const flush = () => {
    const text = plain(buf);
    if (text) out.push({ kind, text });
    buf = "";
  };

  for (const line of md.split("\n")) {
    const bullet = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (bullet) {
      flush();
      kind = "li";
      buf = bullet[1];
    } else if (!line.trim()) {
      flush();
      kind = "p";
    } else if (buf) {
      buf += " " + line.trim();
    } else {
      kind = "p";
      buf = line.trim();
    }
  }
  flush();
  return out;
}

/**
 * La primera oración de un texto plano. Alimenta la `meta description` y, por
 * `Base.astro`, el `description` del JSON-LD.
 *
 * No lleva puntos suspensivos ni texto añadido: la cadena tiene que aparecer
 * **literal** dentro del texto visible de la página o incumple la regla dura de
 * `mc-48` §3. Como la página pinta el resumen ejecutivo completo, cualquier
 * prefijo de él sigue siendo una subcadena visible — por eso `cap` puede
 * recortar sin romper nada, siempre en un límite de palabra.
 *
 * El corte de oración exige punto + espacio + mayúscula, y descarta las
 * abreviaturas de una letra (`M. E.`, `R. S.`) y las siglas con punto, que es
 * donde un `split(". ")` ingenuo parte una cita bibliográfica por la mitad.
 */
export function firstSentence(text: string, min = 60): string {
  const re = /([.!?])\s+(?=[A-ZÁÉÍÓÚÑÜ¿¡"“])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const cut = m.index + 1;
    if (cut < min) continue;
    const before = text.slice(0, m.index);
    // Abreviatura: la "oración" termina en una sola letra o en una sigla con
    // puntos internos. No es un final de oración.
    if (/(^|[\s(])[A-Za-zÁÉÍÓÚÑ]$/.test(before)) continue;
    if (/\b(?:[A-Za-z]\.){1,}[A-Za-z]$/.test(before)) continue;
    return text.slice(0, cut).trim();
  }
  return text.trim();
}

/**
 * El texto que el JSON-LD pone en `abstract`: los bloques del resumen unidos
 * por un espacio. Es exactamente lo que un lector ve, porque el auditor de
 * coincidencia colapsa las etiquetas HTML a espacios (plan §3.1 punto 4).
 */
export function blocksText(blocks: SummaryBlock[]): string {
  return blocks.map((b) => b.text).join(" ");
}

/**
 * `description` de la página: la primera oración del primer bloque del resumen,
 * recortada en límite de palabra. Nunca añade nada al texto del documento.
 */
export function leadOf(blocks: SummaryBlock[], cap = 300): string {
  const first = blocks[0]?.text ?? "";
  const sentence = firstSentence(first);
  if (sentence.length <= cap) return sentence;
  const cut = sentence.lastIndexOf(" ", cap);
  return sentence.slice(0, cut > 0 ? cut : cap).trim();
}

// ---------------------------------------------------------------------------
// Parsers de documento
// ---------------------------------------------------------------------------

/** `2026-07-31-mc-34-i18n-math-notation.md` → `{ date, topic, id, slug }`. */
export function parseFileName(file: string) {
  const m = /^(\d{4}-\d{2}-\d{2})-(mc-(\d{2})-[a-z0-9-]+)\.md$/.exec(file);
  if (!m) throw new Error(`corpus: nombre de archivo inesperado: ${file}`);
  return { date: m[1], slug: m[2], id: `mc-${m[3]}`, topic: Number(m[3]) };
}

/**
 * La sección `## Sources`, como lista numerada.
 *
 * `citation` es el campo con más valor del JSON-LD y el más fácil de romper
 * (plan §4.3): 801 enlaces externos en 344 dominios. Se parsea de la sección
 * real, y la página renderiza **este mismo arreglo**, no el HTML del Markdown,
 * para que la cadena del esquema y la cadena visible sean literalmente el mismo
 * objeto de JavaScript. Es la única forma de que no se separen al editar una.
 *
 * Tres documentos no numeran todas sus fuentes (`mc-37` abre con una lista de
 * archivos del repo). Ahí el arreglo sale más corto o vacío, y la página omite
 * `citation` en vez de inventarlo.
 */
export function parseSources(raw: string): Source[] {
  const body = section(raw, "Sources");
  if (body === null) return [];
  const out: Source[] = [];
  let current: { n: number; text: string } | null = null;

  const flush = () => {
    if (!current) return;
    const urlMatch = /(https?:\/\/[^\s)>\]]+)/.exec(current.text);
    const url = urlMatch ? urlMatch[1].replace(/[.,;]+$/, "") : undefined;
    // El nombre es lo que va ANTES de la URL: una URL dentro del `name` haría
    // que la cadena del esquema no coincida con el texto que pinta el <a>.
    const beforeUrl = url ? current.text.slice(0, current.text.indexOf(url)) : current.text;
    const name = plain(beforeUrl).replace(/[\s—–\-,;:.]+$/, "").trim();
    if (name) out.push({ n: current.n, name, url });
    current = null;
  };

  for (const line of body.split("\n")) {
    const item = /^\s*(\d+)\.\s+(.*)$/.exec(line);
    if (item) {
      flush();
      current = { n: Number(item[1]), text: item[2] };
      continue;
    }
    // Continuación de un elemento: línea no vacía que no abre otro bloque.
    if (current && line.trim() && !/^\s*[-*>#|]/.test(line)) {
      current.text += " " + line.trim();
      continue;
    }
    flush();
  }
  flush();
  return out;
}

/**
 * Las marcas `[unverified]` con la oración que las contiene.
 *
 * Esto NO es una nota al pie: `mc-48` §1 y D-033 lo identifican como el
 * diferenciador del sitio, y el plan §4.4 lo dice sin matiz — esconderlas en un
 * acordeón gris destruye exactamente lo que hace citable la investigación. La
 * página las publica arriba, a tamaño de cuerpo y sin JavaScript.
 *
 * Cuenta la variante larga (`[unverified this session, …]`) además de la corta.
 */
export function parseUnverified(raw: string): UnverifiedMark[] {
  const out: UnverifiedMark[] = [];
  const re = /\[unverified[^\]]*\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    // La oración que contiene la marca. Los cortes son: fin de oración, salto
    // de línea y borde de celda de tabla — porque varias marcas viven dentro de
    // una tabla y ahí la "oración" es la celda.
    const before = raw.slice(0, m.index);
    const startIdx = Math.max(
      before.lastIndexOf(". "),
      before.lastIndexOf("\n"),
      before.lastIndexOf("| "),
    );
    const after = raw.slice(m.index + m[0].length);
    const endRel = after.search(/\.\s|\n|\s\|/);
    const sentence = plain(
      raw.slice(
        startIdx === -1 ? 0 : startIdx + 1,
        m.index + m[0].length + (endRel === -1 ? after.length : endRel + 1),
      ),
    ).replace(/^[>\-*|\s]+/, "");
    out.push({ mark: m[0], sentence });
  }
  return out;
}

/** Las preguntas abiertas al dueño. Viñetas `-` o numeradas `1.`. */
export function parseOpenQuestions(raw: string): string[] {
  const body = section(raw, "Open questions for the project owner");
  if (body === null) return [];
  const out: string[] = [];
  let current: string | null = null;
  for (const line of body.split("\n")) {
    const item = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (item) {
      if (current) out.push(plain(current));
      current = item[1];
    } else if (current && line.trim()) {
      current += " " + line.trim();
    } else if (current) {
      out.push(plain(current));
      current = null;
    }
  }
  if (current) out.push(plain(current));
  return out.filter(Boolean);
}

/**
 * Pares pregunta-respuesta REALES. El `FAQPage` sale de aquí o no sale.
 *
 * El encargo dice `FAQPage` **solo donde el documento tenga preguntas claras**,
 * y `mc-48` §3 explica por qué no se fuerza: un `FAQPage` cuyas preguntas o
 * respuestas no estén visibles en la página hace que Google pueda ignorar el
 * marcado **entero**, no solo ese nodo. En un sitio con 329 páginas de artículo
 * eso sería tirar el `ScholarlyArticle` de todas.
 *
 * Dos reglas que descartan casi todo, y está bien que así sea:
 *
 *  1. **La sección "Open questions for the project owner" no cuenta.** Son 47
 *     secciones de preguntas sin respuesta. `FAQPage` exige `acceptedAnswer`;
 *     inventarla sería fabricar contenido, y responderlas con `decisions.md`
 *     sería marcado que la página no muestra.
 *  2. La respuesta tiene que estar **en el documento, pegada a la pregunta**, y
 *     medir al menos `minAnswer` caracteres. Un "sí" no es un FAQ.
 *
 * Cuántos pares hacen falta para emitir el nodo lo fija `FAQ_MIN_PAIRS`.
 */
export const FAQ_MIN_PAIRS = 2;

export function faqPairs(raw: string, minAnswer = 120): FaqPair[] {
  // Fuera la sección de preguntas abiertas antes de buscar nada.
  const lines = raw.split("\n");
  const openIdx = lines.findIndex(
    (l) => l.trim() === "## Open questions for the project owner",
  );
  let scoped = lines;
  if (openIdx !== -1) {
    const rest = lines.slice(openIdx + 1);
    const end = rest.findIndex((l) => /^## /.test(l));
    scoped = [
      ...lines.slice(0, openIdx),
      ...(end === -1 ? [] : rest.slice(end)),
    ];
  }

  const out: FaqPair[] = [];

  // (a) Encabezado que es una pregunta, seguido de al menos un párrafo.
  for (let i = 0; i < scoped.length; i++) {
    const h = /^#{2,4}\s+(.*\?)\s*$/.exec(scoped[i]);
    if (!h) continue;
    const question = plain(h[1].replace(/^\d+[.)]\s*/, ""));
    const answerLines: string[] = [];
    for (let j = i + 1; j < scoped.length; j++) {
      const l = scoped[j];
      if (/^#{1,6}\s/.test(l)) break;
      if (!l.trim() && answerLines.length) break;
      if (l.trim()) answerLines.push(l.trim());
    }
    const answer = plain(answerLines.join(" "));
    if (answer.length >= minAnswer) out.push({ question, answer });
  }

  // (b) Párrafo que abre con una pregunta en negritas y sigue con su respuesta.
  //     Se junta el párrafo entero antes de mirarlo: los documentos no tienen
  //     un ancho de línea uniforme, y buscar la respuesta solo en la primera
  //     línea haría que el detector dependiera de dónde quedó un salto de línea.
  for (const para of scoped.join("\n").split(/\n\s*\n/)) {
    const m = /^\*\*([^*]+\?)\*\*\s+([\s\S]+)$/.exec(para.trim());
    if (!m) continue;
    const question = plain(m[1]);
    const answer = plain(m[2]);
    if (answer.length >= minAnswer) out.push({ question, answer });
  }

  return out;
}

/**
 * Documento completo. Tira excepción con el nombre del archivo si falta
 * cualquier cosa de la que dependa una página pública.
 */
export function parseDoc(
  file: string,
  raw: string,
  index: Map<string, IndexEntry>,
): ResearchDoc {
  const { date, slug, id, topic } = parseFileName(file);

  const h1 = /^#\s+(.+)$/m.exec(raw);
  if (!h1) throw new Error(`corpus: ${file} no tiene H1`);

  const es = section(raw, "Resumen ejecutivo (ES)");
  const en = section(raw, "Executive summary (EN)");
  if (!es) throw new Error(`corpus: ${file} no tiene "## Resumen ejecutivo (ES)"`);
  if (!en) throw new Error(`corpus: ${file} no tiene "## Executive summary (EN)"`);

  const entry = index.get(file);
  if (!entry) {
    throw new Error(
      `corpus: ${file} no aparece en el índice docs/research/README.md. ` +
        `Todo documento publicado necesita categoría; añádelo a la tabla de su sección.`,
    );
  }

  return {
    id,
    topic,
    slug,
    file,
    date,
    title: plain(h1[1]),
    category: entry.category,
    stars: entry.stars,
    summary: { es: summaryBlocks(es), en: summaryBlocks(en) },
    sources: parseSources(raw),
    unverified: parseUnverified(raw),
    openQuestions: parseOpenQuestions(raw),
    faq: faqPairs(raw),
    words: countWords(plain(raw)),
  };
}

// ---------------------------------------------------------------------------
// El índice: `docs/research/README.md`
// ---------------------------------------------------------------------------

export interface IndexEntry {
  file: string;
  category: CategoryKey;
  /** Título en español de la tabla del índice. No se publica como `headline`. */
  titleEs: string;
  stars: number;
}

/**
 * Los cinco encabezados de sección del índice → una llave estable.
 *
 * Se mapea el texto exacto porque el encabezado del README es prosa en
 * español y las llaves tienen que sobrevivir a que alguien lo reescriba. Si
 * aparece una sección nueva con documentos dentro, `parseIndex` tira excepción
 * en vez de dejarlos sin categoría.
 */
const CATEGORY_BY_HEADING: Record<string, CategoryKey> = {
  "Pedagogía — cómo se enseñan las matemáticas": "pedagogia",
  "Producto, motor y contenido": "producto",
  "Gamificación, competencia e identidad": "gamificacion",
  "Interfaz por banda de edad y dispositivo": "interfaz",
  "Plataforma, seguridad y negocio": "plataforma",
};

export function parseIndex(readme: string): Map<string, IndexEntry> {
  const out = new Map<string, IndexEntry>();
  let current: CategoryKey | null = null;
  let currentHeading = "";

  for (const line of readme.split("\n")) {
    const h = /^##\s+(.*)$/.exec(line);
    if (h) {
      currentHeading = h[1].trim();
      current = CATEGORY_BY_HEADING[currentHeading] ?? null;
      continue;
    }
    const row = /^\|\s*(\d+)\s*\|\s*\[(.+?)\]\((2\d{3}-\d{2}-\d{2}-mc-[a-z0-9-]+\.md)\)\s*\|(.*)\|\s*$/.exec(line);
    if (!row) continue;
    if (!current) {
      throw new Error(
        `corpus: docs/research/README.md lista ${row[3]} bajo la sección ` +
          `"${currentHeading}", que no tiene categoría. Añádela a CATEGORY_BY_HEADING.`,
      );
    }
    out.set(row[3], {
      file: row[3],
      category: current,
      titleEs: plain(row[2]),
      stars: (row[4].match(/⭐/g) ?? []).length,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Carga (esta parte sí depende de Vite / Astro)
// ---------------------------------------------------------------------------

/**
 * Los 47 documentos, ordenados por número de tema.
 *
 * `import.meta.glob` apunta FUERA de `apps/web`, a `docs/research/`. El plan
 * §9.1 lo listaba como no verificado ("primer spike de S1"); está verificado:
 * `pnpm build` genera las rutas. Los documentos se quedan donde están.
 *
 * La llamada vive dentro de la función para que importar este módulo desde
 * Node —sin Vite— no reviente: así `scripts/verificar-corpus.mjs` puede
 * re-ejecutar los mismos parsers sobre los mismos archivos.
 */
export function loadCorpus(): ResearchDoc[] {
  const raws = import.meta.glob("../../../../docs/research/2*-mc-*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const readme = import.meta.glob("../../../../docs/research/README.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const readmeRaw = Object.values(readme)[0];
  if (!readmeRaw) throw new Error("corpus: no se encontró docs/research/README.md");
  const index = parseIndex(readmeRaw);

  const docs = Object.entries(raws).map(([path, raw]) =>
    parseDoc(path.slice(path.lastIndexOf("/") + 1), raw, index),
  );
  if (docs.length === 0) throw new Error("corpus: 0 documentos; el glob no resolvió nada");
  return docs.sort((a, b) => a.topic - b.topic);
}

/**
 * El texto crudo de cada documento, por nombre de archivo.
 *
 * Por qué existe. La página índice del corpus tenía su PROPIO `import.meta.glob`
 * sobre `docs/research/`, y comparaba su resultado con el de `loadCorpus()` para
 * detectar divergencias — con un mensaje de error que decía, correctamente, que
 * si divergen "una de las dos listas está mintiendo y no se puede saber cuál".
 *
 * Divergieron. No por un cambio en el corpus: al mover la página a un componente
 * (D-049) su glob relativo quedó apuntando un nivel más arriba y resolvió a
 * nada, mientras `loadCorpus()` seguía entregando los 47. El guardián funcionó,
 * pero estaba guardando un problema que solo existía porque había dos lectores.
 *
 * Ahora hay uno. Un glob que no puede divergir de sí mismo.
 */
export function loadRaw(): Record<string, string> {
  const raws = import.meta.glob("../../../../docs/research/2*-mc-*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const out: Record<string, string> = {};
  for (const [path, raw] of Object.entries(raws)) {
    out[path.slice(path.lastIndexOf("/") + 1)] = raw;
  }
  if (Object.keys(out).length === 0) throw new Error("corpus: 0 documentos crudos; el glob no resolvió nada");
  return out;
}

/**
 * Cuántos `.md` hay en `docs/research/`, incluido el README.
 *
 * Es el número que devuelve `ls docs/research/*.md | wc -l` — 48, no 47 —, y la
 * página índice lo publica para explicar en voz alta por qué ese comando da otro
 * número que el conteo de investigaciones. Un lector escéptico que corra el
 * comando obvio tiene que encontrar la diferencia explicada, no una
 * contradicción.
 */
export function countMdFiles(): number {
  return Object.keys(
    import.meta.glob("../../../../docs/research/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }),
  ).length;
}

/**
 * El cuerpo compilado de cada documento, por nombre de archivo.
 *
 * Se usa el pipeline de Markdown de Astro (el mismo que compila cualquier `.md`
 * del proyecto), no una dependencia nueva: tablas, notas y encabezados con `id`
 * salen ya resueltos, y `apps/web/package.json` no crece.
 */
export function loadBodies(): Record<string, () => Promise<{ compiledContent: () => string | Promise<string> }>> {
  const mods = import.meta.glob("../../../../docs/research/2*-mc-*.md");
  const out: Record<string, any> = {};
  for (const [path, loader] of Object.entries(mods)) {
    out[path.slice(path.lastIndexOf("/") + 1)] = loader;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Traducciones — solo los locales con estructura verificada (2026-08-01)
// ---------------------------------------------------------------------------

import VERIFICADO from "./corpus-verificado.json";

/**
 * Qué documento tiene traducción publicable, por locale.
 *
 * **La lista la escribe el auditor, no una persona.** `node
 * audits/corpus-integridad.mjs --manifiesto` compara cada traducción contra su
 * original —números leídos con la convención del locale, URLs, marcadores de
 * cita, marcas `[unverified]`, ids `mc-NN`— y escribe aquí solo los que
 * coinciden. Hoy son 245 de 282.
 *
 * Por qué por DOCUMENTO y no por locale, que es como estaba. La página dice, en
 * su nota de idioma, que la traducción está verificada contra la fuente. Con una
 * lista por locale esa frase era falsa para todo documento con hallazgo dentro
 * de un locale aprobado — y `de-DE/mc-36` es el ejemplo que lo obliga: dejó dos
 * veces `2,500` a la inglesa, que **en alemán se lee 2.5**. No es tipografía:
 * es una cifra falsa con nuestro nombre encima, que es justo lo que D-033 y
 * `mc-48` no toleran. Ahora ese documento se publica en inglés y lo dice.
 */
const VERIFICADOS: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(VERIFICADO as Record<string, string[]>).map(([l, fs]) => [l, new Set(fs)]),
);

/** ¿Puede el sitio servir la traducción de ESTE documento en ESTE locale? */
export function traduccionVerificada(locale: string, file: string): boolean {
  return VERIFICADOS[locale]?.has(file) ?? false;
}

/** Los locales con al menos un documento verificado. */
export const LOCALES_TRADUCCION_VERIFICADA = Object.entries(VERIFICADOS)
  .filter(([, s]) => s.size > 0)
  .map(([l]) => l);

/**
 * Los encabezados que puede llevar el resumen en el idioma del locale, en orden
 * de preferencia.
 *
 * Son varios por locale porque las traducciones vienen de pasadas distintas y
 * **son inconsistentes dentro de sí mismas**: de-DE tiene 45 archivos con
 * `## Zusammenfassung (ES)`, uno con `(DE)` y uno con `## Executive
 * Zusammenfassung (ES)`. Aceptar la lista es más barato y menos destructivo que
 * reescribir 141 archivos de contenido para uniformar un encabezado, y deja el
 * fallo donde debe estar: un archivo cuyo encabezado no está en su lista cae de
 * vuelta al inglés él solo, sin tumbar a los otros 46.
 *
 * El sufijo `(ES)` sobrevive en las traducciones porque es el del original —
 * marca *cuál de los dos resúmenes* es, no en qué idioma está. Renombrarlo es
 * trabajo de contenido, no de este archivo.
 */
const RESUMEN_HEADING_POR_LOCALE: Record<string, string[]> = {
  "es-MX": ["Resumen ejecutivo (ES)"],
  "es-ES": ["Resumen ejecutivo (ES)"],
  "fr-FR": ["Résumé exécutif (FR)"],
  "pt-PT": ["Resumo executivo (ES)"],
  "pt-BR": ["Resumo executivo (tópicos)"],
  "de-DE": ["Zusammenfassung (ES)", "Zusammenfassung (DE)", "Executive Zusammenfassung (ES)"],
};

/**
 * Los `id` (slug de rehype) del SEGUNDO resumen —el que en el original es
 * `## Executive summary (EN)`—, por locale. `trimBody` corta el cuerpo justo
 * después de él, así que si ninguno aparece no hay recorte posible.
 *
 * Varios por locale por lo mismo que arriba: pt-BR llamó a los dos resúmenes por
 * su forma (`tópicos` / `prosa`) en vez de por su idioma, y tres de sus archivos
 * usaron `Sumário executivo (EN)`.
 */
export const RESUMEN_EN_IDS_POR_LOCALE: Record<string, string[]> = {
  "es-MX": ["executive-summary-en"],
  "es-ES": ["executive-summary-en"],
  "fr-FR": ["executive-summary-en"],
  "pt-PT": ["resumo-executivo-en", "executive-summary-en"],
  "pt-BR": ["resumo-executivo-prosa", "sumário-executivo-en", "sumario-executivo-en"],
  "de-DE": ["zusammenfassung-en", "executive-summary-en", "executive-zusammenfassung-en"],
};

/**
 * Los `id` (slug de rehype) que puede tener el encabezado "Sources" traducido,
 * por locale, en el orden en que conviene probarlos. Ver `trimBody`.
 */
export const SOURCES_IDS_POR_LOCALE: Record<string, string[]> = {
  "es-MX": ["fuentes", "sources"],
  "es-ES": ["fuentes", "sources"],
  "fr-FR": ["sources"],
  "pt-PT": ["fontes"],
  "pt-BR": ["fontes"],
  "de-DE": ["quellen"],
};

/**
 * El texto crudo de cada documento TRADUCIDO, por locale y nombre de archivo.
 * Solo cubre `LOCALES_TRADUCCION_VERIFICADA` — un locale fuera de esa lista
 * devuelve un objeto vacío, nunca lanza.
 */
export function loadTranslatedRaw(): Record<string, Record<string, string>> {
  const raws = import.meta.glob("../../../../docs/research/*/2026-07-31-mc-*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  }) as Record<string, string>;

  const out: Record<string, Record<string, string>> = {};
  for (const [path, raw] of Object.entries(raws)) {
    const m = /\/docs\/research\/([^/]+)\/([^/]+\.md)$/.exec(path);
    if (!m) continue;
    const [, locale, file] = m;
    // Se filtra aquí, no en la página: un documento que no pasó el auditor
    // tampoco entra al bundle, así que no se puede servir por accidente.
    if (!traduccionVerificada(locale, file)) continue;
    (out[locale] ??= {})[file] = raw;
  }
  return out;
}

/** Igual que `loadBodies()`, pero para los documentos traducidos. */
export function loadTranslatedBodies(): Record<
  string,
  Record<string, () => Promise<{ compiledContent: () => string | Promise<string> }>>
> {
  const mods = import.meta.glob("../../../../docs/research/*/2026-07-31-mc-*.md");
  const out: Record<string, any> = {};
  for (const [path, loader] of Object.entries(mods)) {
    const m = /\/docs\/research\/([^/]+)\/([^/]+\.md)$/.exec(path);
    if (!m) continue;
    const [, locale, file] = m;
    if (!traduccionVerificada(locale, file)) continue;
    (out[locale] ??= {})[file] = loader;
  }
  return out;
}

/**
 * El resumen ejecutivo traducido, ya en bloques — o `null` si el documento no
 * tiene traducción o su encabezado no coincide con lo esperado para ese
 * locale. `null` es una señal para que quien llama caiga de vuelta al inglés,
 * no un error: un documento sin traducción todavía es un estado válido
 * mientras el corpus no llega a 100% en los seis locales.
 */
/**
 * El H1 del documento traducido, o `null` si no lo tiene.
 *
 * Existe porque sin esto una página alemana declaraba `inLanguage: "de-DE"` con
 * un titular en inglés: el `<h1>` salía de `doc.title`, que se parsea del
 * ORIGINAL, y no del archivo que se está sirviendo. `mc-48` §3 pide que el
 * esquema coincida con lo visible, y coincidía —los dos en inglés—, pero el
 * idioma declarado no coincidía con ninguno de los dos.
 *
 * Devuelve el H1 del archivo traducido tal cual, **sin comparar con el
 * original**. Que 38 de los 47 títulos alemanes sigan en inglés no es un error
 * que este archivo deba corregir: es lo que esa traducción dice, y publicar su
 * propio título es más honesto que fabricar uno.
 */
export function translatedTitle(raw: string): string | null {
  for (const line of raw.split("\n")) {
    const m = /^#\s+(.+?)\s*$/.exec(line);
    if (m) return plain(m[1]);
    if (line.trim() && !line.startsWith("<!--")) break;
  }
  return null;
}

export function translatedSummaryBlocks(raw: string, locale: string): SummaryBlock[] | null {
  const headings = RESUMEN_HEADING_POR_LOCALE[locale];
  if (!headings) return null;
  const body = sectionAny(raw, headings);
  if (body === null) return null;
  return summaryBlocks(body);
}

// ---------------------------------------------------------------------------
// Transformaciones sobre el HTML ya compilado
// ---------------------------------------------------------------------------

/**
 * Recorta el HTML compilado: fuera el H1 y la cabecera, fuera los dos resúmenes
 * ejecutivos, fuera la sección `Sources`.
 *
 * Las tres partes que se quitan **se vuelven a pintar en la página** desde los
 * datos ya parseados, y esa es toda la razón del recorte:
 *
 *  · El **H1** lo pinta la plantilla, con el mismo texto que va en `headline`.
 *    Dos H1 idénticos serían un defecto de accesibilidad y de esquema a la vez.
 *  · Los **resúmenes** los pinta la plantilla desde `summaryBlocks`, que es la
 *    misma cadena que va en `abstract`. Si se dejaran al pipeline de Markdown,
 *    `abstract` y lo visible serían dos cadenas parecidas pero independientes:
 *    basta que el renderizador convierta una comilla recta en tipográfica para
 *    que dejen de coincidir, y `mc-48` §3 dice que entonces Google puede
 *    ignorar el marcado **entero**.
 *  · **Sources** la pinta la plantilla desde `parseSources`, que es el mismo
 *    arreglo que alimenta `citation[]`, por lo mismo.
 *
 * Tira excepción si no encuentra los cortes. Un recorte que falla en silencio
 * publicaría el H1 duplicado —o el resumen dos veces— en 329 páginas.
 */
/**
 * `sourcesIds`: el `id` que rehype-slug le puso al encabezado "Sources" —
 * `"sources"` en el original y en los locales que tradujeron la sección con
 * la misma palabra (fr-FR: "Sources" es igual en francés). Los que sí la
 * tradujeron usan otro id (`es-MX`/`es-ES`: "fuentes"). Acepta varios porque
 * `es-ES` es inconsistente **dentro de sí mismo** — 28 de 47 archivos usan
 * "Fuentes" y 19 se quedaron con "Sources", herencia de pasadas de
 * traducción distintas — así que un solo id fijo fallaría en la mitad de
 * los documentos de ese locale.
 */
export function trimBody(
  html: string,
  file: string,
  sourcesIds: string[] = ["sources"],
  resumenEnIds: string[] = ["executive-summary-en"],
): string {
  let en = -1;
  for (const id of resumenEnIds) {
    const idx = html.indexOf(`<h2 id="${id}"`);
    if (idx !== -1) { en = idx; break; }
  }
  if (en === -1) throw new Error(`corpus: ${file} compilado sin <h2> de segundo resumen (probé: ${resumenEnIds.join(", ")})`);
  const start = html.indexOf("<h2", en + 1);
  if (start === -1) throw new Error(`corpus: ${file} no tiene contenido después del resumen`);
  let cut = -1;
  for (const id of sourcesIds) {
    const idx = html.indexOf(`<h2 id="${id}"`);
    if (idx !== -1) { cut = idx; break; }
  }
  if (cut === -1) throw new Error(`corpus: ${file} compilado sin <h2> de fuentes (probé: ${sourcesIds.join(", ")})`);
  if (cut <= start) throw new Error(`corpus: ${file} tiene la sección de fuentes antes que el cuerpo`);
  return html.slice(start, cut);
}

/**
 * Enlaza cada mención `mc-nn` del cuerpo a su propia página.
 *
 * Los 47 documentos se citan entre sí en texto plano —solo hay 2 enlaces
 * relativos en los 47— así que esto produce cientos de enlaces internos
 * correctos sin tocar una sola línea del Markdown (plan §4.6).
 *
 * Se recorre el HTML a mano en vez de con una expresión regular global por dos
 * razones concretas: no tocar el interior de una etiqueta (`<a href="…mc-34…">`
 * se convertiría en HTML roto) y no anidar un `<a>` dentro de otro, que el
 * navegador reescribe de forma impredecible.
 *
 * El texto visible no cambia —sigue diciendo `mc-34`—, así que ninguna cadena
 * del JSON-LD deja de coincidir por culpa de esta función.
 */
export function linkCrossReferences(
  html: string,
  bySlug: Map<string, string>,
  selfId: string,
  hrefFor: (slug: string) => string,
): string {
  let out = "";
  let i = 0;
  let anchorDepth = 0;

  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      out += anchorDepth ? html.slice(i) : linkText(html.slice(i));
      break;
    }
    out += anchorDepth ? html.slice(i, lt) : linkText(html.slice(i, lt));
    const gt = html.indexOf(">", lt);
    if (gt === -1) {
      out += html.slice(lt);
      break;
    }
    const tag = html.slice(lt, gt + 1);
    if (/^<a[\s>]/i.test(tag)) anchorDepth++;
    else if (/^<\/a\s*>/i.test(tag)) anchorDepth = Math.max(0, anchorDepth - 1);
    out += tag;
    i = gt + 1;
  }
  return out;

  function linkText(text: string): string {
    return text.replace(/\bmc-(\d{2})\b/g, (whole, nn: string) => {
      const id = `mc-${nn}`;
      if (id === selfId) return whole;
      const slug = bySlug.get(id);
      return slug ? `<a href="${hrefFor(slug)}">${whole}</a>` : whole;
    });
  }
}

/**
 * Vuelve visible cada marca `[unverified]` del cuerpo.
 *
 * D-033 y el plan §4.4: las marcas son el activo, no una nota al pie. Se
 * envuelven en `<mark>` —elemento nativo, sin JavaScript, con significado
 * semántico— y se enlazan al panel de verificación de la propia página.
 *
 * **El texto de la marca no cambia**: sigue diciendo `[unverified]`, así que el
 * texto visible de la página es idéntico al del documento fuente. Cambiarlo por
 * un icono la borraría para los rastreadores que no ejecutan JavaScript, que es
 * justo lo que el plan §4.4 punto 4 prohíbe.
 */
export function markUnverified(html: string, anchorId: string, label: string): string {
  return html.replace(/\[unverified[^\]]*\]/g, (mark) =>
    `<a class="nv" href="#${anchorId}" title="${escapeAttr(label)}">${mark}</a>`,
  );
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
