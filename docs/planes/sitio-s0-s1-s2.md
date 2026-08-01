# Plan de la vía del sitio abierto — S0, S1, S2

> **Fecha:** 2026-07-31 · **Estado:** propuesta para revisión humana. Nada de esto
> está implementado ni commiteado.
>
> **Gobierno:** [`D-033`](../decisions.md#d-033--el-sitio-abierto-la-investigación-es-la-estrategia--2026-07-31)
> y [`mc-48`](../research/2026-07-31-mc-48-public-site-seo.md). Ambos leídos
> completos. También [`master-plan.md` §13.1](../master-plan.md) y los cuerpos
> de S0/S1/S2 que ya viven en `scripts/detallar-proyecto.mjs`.
>
> **Qué NO es este documento:** no crea recursos, no toca el tablero, no abre
> issues, no commitea. Es el diseño de tres fases para que una persona decida.

---

## 0. Cómo leer esto

Cada afirmación factual de este plan trae el comando que la produce. Si un
renglón no trae comando, es criterio, y lo dice. La sección
[§9](#9-lo-que-no-pude-verificar) lista lo que no pude comprobar y por qué.

Las tres fases **no dependen de ninguna fase del producto** (D-033,
`master-plan.md` §13). S1 y S2 dependen de S0 y entre sí no.

---

## 1. Lo que ya existe — no lo rehagas

`apps/web` no es un esqueleto vacío. Esto ya está construido y verificado:

| Ya existe | Dónde | Evidencia re-ejecutable |
|---|---|---|
| 7 rutas de locale prerenderizadas | `apps/web/src/pages/[locale]/index.astro` | `pnpm build` → imprime las 7 rutas |
| `hreflang` recíproco + auto-referencia + `x-default` | `apps/web/src/layouts/Base.astro:73-78` | `node -e 'const h=require("fs").readFileSync("apps/web/dist/en/index.html","utf8");console.log((h.match(/hreflang=/g)\|\|[]).length)'` → `14` (8 en `<head>`, 6 en el pie) |
| `canonical` por locale que coincide con la URL servida | `Base.astro:71` + `build.format:"directory"` | `grep canonical apps/web/dist/de-DE/index.html` |
| JSON-LD `@graph` con `WebSite` + `Organization` + `WebPage`, con `inLanguage` | `Base.astro:32-61` | ver §3.4 |
| `title`/`description` del JSON-LD salen de **las mismas variables** que el `<body>` | `Base.astro:19-31` | lectura del archivo |
| Los 7 locales con las mismas llaves de mensajes | `apps/web/src/i18n/*.json` | `node audits/locales-complete.mjs` |
| Convenciones matemáticas por locale ya modeladas | `apps/web/src/i18n/index.ts` (`MATH_CONVENTIONS`) | lectura del archivo |
| Raleway autohospedada, cero peticiones a terceros | `apps/web/src/styles/fonts.css` | `node audits/live.mjs` comprobación 2 |
| Presupuesto de peso vigente y holgado | `audits/bundle-budget.mjs` | `node audits/bundle-budget.mjs` → `8 página(s), la más pesada 2.1 KB gz` |
| Verificación en vivo de los 7 locales, `hreflang`, HTTP/3 y 0-RTT | `audits/live.mjs` | `node audits/live.mjs` |
| Enlace de idioma en el pie con `hreflang`/`lang` y blanco táctil ≥24 px | `Base.astro:127-141` | lectura |

**Conclusión:** S0 no es "construir el sitio". Es **cerrar siete huecos concretos**
sobre algo que ya sirve.

---

## 2. Los siete huecos de S0

Cada uno con la evidencia de que está abierto.

| # | Hueco | Evidencia de que falta |
|---|---|---|
| H1 | **No existe `audits/jsonld-valid.mjs`** | `node audits/run.mjs` lo imprime bajo "pendientes de fase": `jsonld-valid — S0 · cuando haya sitio` |
| H2 | **No existe `audits/hreflang-recip.mjs`** | idem: `hreflang-recip — S0 · cuando haya sitio` |
| H3 | **El nodo `Organization` no coincide con lo visible, y no está traducido** | ver §3.4 — es la regla dura de `mc-48` §3, la que invalida el marcado entero |
| H4 | **No hay `sitemap.xml` ni `robots.txt`** | `ls apps/web/public apps/web/dist` — no aparecen |
| H5 | **`hreflang` está cableado a los 7 locales para toda página** | `Base.astro:75-77` mapea `LOCALES` sin excepción. Bloquea S1 si la respuesta a "¿7 locales o 2?" es 2 |
| H6 | **La raíz redirige con `<meta refresh>` + JS** | `apps/web/src/pages/index.astro` — el propio comentario dice "cuando exista (S0), esto pasa a ser un 302 server-side" |
| H7 | **No hay aviso de código abierto ni enlace al repo/tablero en ninguna página** | `grep -ri "github\|open.source\|código abierto" apps/web/src` → sin resultados. Es un criterio de aceptación ya escrito en `scripts/detallar-proyecto.mjs` (S0) |

Y un octavo, que no es hueco sino **contradicción entre documentos**:

| H8 | `audits/run.mjs` agenda `axe-a11y` y `contrast` para **F2** ("cuando haya interfaz"), pero D-033 declara **WCAG 2.2 AA requisito de publicación del sitio**. El sitio se publica en S1/S2, mucho antes de F2 |

---

## 3. S0 — Cimientos del sitio

### 3.1 `audits/jsonld-valid.mjs` — el auditor de la regla que invalida todo

`mc-48` §3 lo dice sin matiz: *el contenido del esquema debe coincidir con lo
visible en la página; si difiere, Google puede ignorar el marcado por completo.*
Un auditor que solo valide sintaxis JSON no compra nada — el JSON de hoy ya es
sintácticamente válido y **ya incumple la regla** (§3.4).

Qué tiene que hacer, sobre `apps/web/dist/**/index.html`:

1. Extraer todo `<script type="application/ld+json">` y hacer `JSON.parse`.
2. Verificar que los `@type` presentes sean **idénticos entre los 7 locales**
   (`mc-48` §3: no `Course` en español y `Article` en alemán).
3. Verificar que cada nodo declare `inLanguage` igual al locale de la ruta,
   salvo los nodos que no son de página (`Organization`).
4. **La comprobación que importa:** para cada propiedad de texto legible por
   humano (`name`, `description`, `headline`, `abstract`, `alternateName`,
   `citation[].name`), comprobar que la cadena aparece en el **texto visible**
   de esa misma página — el HTML con `<script>`, `<style>` y `<head>` removidos,
   normalizando espacios y entidades.
5. Verificar que todo `@id` referenciado exista dentro del mismo `@graph`.
6. Fallar con la cadena exacta que no se encontró y en qué archivo.

**Prueba de regresión obligatoria (CLAUDE.md, regla de commit 3):** este auditor
tiene que **verse fallar** contra el `dist` de hoy, por el defecto de §3.4, antes
de que ese defecto se arregle. Esa salida se pega en el PR. Un auditor que nace
verde no prueba nada.

### 3.2 `audits/hreflang-recip.mjs`

`audits/live.mjs` ya comprueba `hreflang` **en producción**, pero solo sobre
`/es-MX/` y solo que las 8 etiquetas estén presentes. Eso no es reciprocidad, y
corre después de desplegar. El auditor determinista tiene que correr en el
gancho, sobre `dist`, y comprobar cuatro cosas que hoy nadie comprueba:

1. **Auto-referencia:** cada página se declara a sí misma.
2. **Reciprocidad real:** si A declara a B, B declara a A. Se construye el grafo
   y se busca la arista faltante, no se cuenta etiquetas.
3. **Cada `href` resuelve a un archivo que existe en `dist`.** Esta es la que
   bloquea S1: en cuanto una página exista en 2 locales y no en 7, el `hreflang`
   cableado de `Base.astro:75` empieza a apuntar a 404.
4. **`x-default` existe, es uno solo, y apunta a una página que existe.**

Además: `hreflang` con guion y región en mayúscula (`es-MX`), consistente con el
`lang` del `<html>`.

### 3.3 `hreflang` por página, no por sitio (H5)

`Base.astro` recibe hoy `locale`, `title`, `description`. Necesita un cuarto
prop: el **conjunto de locales en que esa página existe**. El default sigue
siendo los 7; las páginas de S1 pasarán el suyo.

Sin este cambio, la decisión "el corpus sale en 2 locales" produce 47 × 5 = 235
etiquetas `hreflang` apuntando a páginas inexistentes, que es exactamente el
fallo que hace que Google descarte el grupo de idiomas completo.

> **Dato técnico que sostiene el diseño:** `hreflang` **no exige** que todas las
> páginas existan en todos los locales. Exige que el conjunto declarado sea
> recíproco *para el grupo de URLs que sí existen*. Publicar la portada en 7 y el
> corpus en 2 es correcto siempre que cada página declare su propio conjunto.

### 3.4 El nodo `Organization` miente hoy — y es la regla dura

Reproducción:

```bash
pnpm build
node -e 'const fs=require("fs");
for (const l of ["en","de-DE"]) {
  const h=fs.readFileSync(`apps/web/dist/${l}/index.html`,"utf8");
  const ld=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org=ld["@graph"].find(n=>n["@type"]==="Organization");
  const visible=h.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<[^>]+>/g," ");
  console.log(l, JSON.stringify(org.description));
  console.log("  ¿visible en la página?", visible.includes("proveedor de nube"));
}'
```

Salida:

```
en "Ignia Cloud — proveedor de nube. Math Challenge es un proyecto de Ignia."
  ¿visible en la página? false
de-DE "Ignia Cloud — proveedor de nube. Math Challenge es un proyecto de Ignia."
  ¿visible en la página? false
```

Dos incumplimientos de `mc-48` §3 en un solo campo:

- **Está en español en los siete locales.** `mc-48` §3: *el contenido dentro del
  JSON-LD se traduce por versión de idioma, manteniendo la estructura intacta.*
- **No aparece en ninguna parte de la página.** Es la regla dura. El pie visible
  dice `m.sponsor` — en inglés, *"A project by Ignia, running on Cloudflare."* —
  que es un texto distinto.

**Arreglo, y cuál elegir.** Dos salidas legítimas:

- **(a) Quitar `description` del `Organization`.** `schema.org` no la exige, y el
  nodo sigue sirviendo como editor. Cero riesgo, cero trabajo de traducción.
- **(b) Hacerla visible y traducida.** Nueva llave de i18n con exactamente el
  texto que el pie ya muestra, y el JSON-LD leyéndola de la misma variable —
  el mismo patrón que `Base.astro:19` ya usa para `title`.

**Recomiendo (b)**, porque S2 va a necesitar de todas formas la atribución de dos
partes visible en cada página (D-033: *Ignia hace el proyecto, Cloudflare es la
infraestructura*), y porque (a) resuelve el síntoma sin instalar el patrón que
impide que vuelva a pasar. Con (b), añadir `sameAs: ["https://ignia.cloud"]` y
—cuando haya licencia, §6— el repositorio.

### 3.5 `sitemap.xml` y `robots.txt` (H4)

Ninguno de los dos existe. Con 8 páginas se puede vivir sin ellos; con 47 × N
documentos de S1, no.

- **`sitemap.xml` con `xhtml:link` de alternates por URL.** Es el gemelo legible
  por máquina del `hreflang`, y es lo que hace manejable un grupo de 329 URLs.
  Astro tiene `@astrojs/sitemap`, pero **su soporte de alternates es por
  configuración global de `i18n`**, que es justo lo que S1 rompe (§3.3). Propongo
  generarlo con un endpoint propio (`src/pages/sitemap.xml.ts`) que recorra las
  mismas rutas que genera el sitio: una sola fuente de verdad y sin dependencia
  nueva.
- **`robots.txt`** con `Sitemap:` y sin `Disallow` sobre nada del sitio abierto.
  Sí `Disallow: /api/` — `/api/health` no es contenido y hoy es indexable.
- **Decisión explícita sobre rastreadores de IA.** D-033 dice que la meta es ser
  **citado**. Bloquear `GPTBot`/`ClaudeBot`/`PerplexityBot` en `robots.txt`
  contradiría la estrategia entera. Se documenta que **no se bloquean, a
  propósito**, para que nadie lo "arregle" después por costumbre.

### 3.6 La raíz: de `<meta refresh>` a 302 (H6)

`apps/web/src/pages/index.astro` ya trae escrito el plan en su comentario. Hoy
`/` es un HTML con `noindex`, `<meta http-equiv="refresh">` y un `location.replace`
en JS. Funciona, parpadea, y depende de JavaScript.

En S0 pasa a ser una ruta con `prerender = false` que lee `Accept-Language`,
negocia contra los 7 locales con la misma lógica de coincidencia exacta →
idioma base, y responde **302** (no 301: la elección depende del visitante, no
es permanente) con `Vary: Accept-Language`.

**Lo que no cambia, y es lo que importa:** ninguna URL de contenido pierde su
canonical propio. `/` no es canonical de nada.

### 3.7 El aviso de código abierto en cada página (H7)

Criterio ya escrito en el tablero para S0: *"Enlace visible a
github.com/kilowatto/math-challenge en cada página"*. El diseño completo,
incluida la página propia, está en [§6](#6-código-abierto-cómo-lo-dice-el-sitio),
porque depende de una decisión de licencia que el dueño no ha tomado.

Lo que sí es S0 y no depende de esa decisión: **el enlace visible al repositorio
y al tablero público en el pie**, en los 7 locales.

Verificado hoy, no supuesto:

```bash
gh repo view kilowatto/math-challenge --json visibility,licenseInfo
# {"licenseInfo":null,"visibility":"PUBLIC"}
gh project list --owner kilowatto --format json
# número 1, "public": true, 18 elementos, https://github.com/users/kilowatto/projects/1
```

El repositorio **es público** y el tablero **es público**. Los dos enlaces
funcionan hoy. Lo que no existe es la licencia — y por eso la palabra "código
abierto" todavía no se puede escribir en el sitio (§7, conflicto C1).

### 3.8 WCAG 2.2 AA se adelanta de F2 a S0 (H8)

D-033: *"WCAG 2.2 AA como requisito de publicación"*. `mc-48` §5 agrega el
argumento que lo vuelve no negociable: la accesibilidad es señal directa de
**Trustworthiness**, no solo obligación legal europea desde el 28 de junio de
2025. Un sitio inaccesible falla una de las cuatro letras del E-E-A-T que este
sitio existe para presumir.

`audits/run.mjs` los tiene agendados para F2. Hay que moverlos:

- `axe-a11y` → corre sobre `apps/web/dist/**/*.html`. Sin navegador: `axe-core`
  necesita DOM, así que sobre `jsdom` o `linkedom`. **Limitación honesta:** axe
  estático no ve foco, orden de tabulación ni contraste calculado sobre
  imágenes. Cubre quizá la mitad; el resto es revisión humana en S2.
- `contrast` → el token `--color-accent` (#F36B1C, 3.03:1) ya tiene su regla
  escrita en `guia-de-estilo.md` y en `audits/brand-image.mjs`. Lo que falta es
  comprobarlo **sobre el HTML renderizado**, no sobre la paleta.
- `touch-targets` → 24 px de WCAG 2.5.8. El pie ya usa `--tap-min`; el auditor
  lo que hace es impedir que la próxima página lo olvide.

> **Hallazgo lateral, al inventariar la flota:** `audits/pwa-installable.mjs`
> existe como archivo pero **no aparece ni en `ACTIVE` ni en `PENDING` de
> `audits/run.mjs`** (`grep -n pwa-installable audits/run.mjs` → sin
> resultados). Es un auditor huérfano: no corre en el gancho y no está listado
> como pendiente. No es de esta vía, pero afecta a cualquier afirmación sobre
> "cuántos auditores bloquean", incluida la de este plan.

### 3.9 Vista previa social (og:image)

Hoy hay `og:type`, `og:title`, `og:description`, `og:url`, `og:locale` y **ningún
`og:image`**. Sin imagen, cada vez que alguien comparte una investigación en
LinkedIn, Slack o WhatsApp aparece una tarjeta gris — en un sitio cuya estrategia
es ser citado y compartido.

**Aquí hay un choque con una regla escrita de `CLAUDE.md`**, y no lo propongo
sin decirlo: *"Formato: AVIF con respaldo WebP, salvo los íconos de instalación
del manifest."* Los rastreadores sociales **no consumen AVIF de forma fiable**;
`og:image` es, en la práctica, PNG o JPEG. Es una segunda excepción a esa regla,
y necesita que el dueño la apruebe (pregunta P6) antes de escribirla en
`guia-de-estilo.md`. La alternativa es no tener vista previa social, que es una
decisión legítima pero hay que tomarla a sabiendas.

---

## 4. S1 — el corpus: 47 investigaciones, 157,235 palabras

Números verificados, no redondeados de memoria:

```bash
ls docs/research/2026-07-31-mc-*.md | wc -l          # 47
cat docs/research/2026-07-31-mc-*.md | wc -w         # 157235
grep -l "^## Sources" docs/research/2026-07-31-mc-*.md | wc -l              # 47
grep -l "^## Design implications" docs/research/2026-07-31-mc-*.md | wc -l  # 47
grep -l "Resumen ejecutivo" docs/research/2026-07-31-mc-*.md | wc -l        # 47
grep -o "\[unverified\]" docs/research/*.md | wc -l  # 18 marcas, en 14 documentos
grep -o "https\?://[^ )]*" docs/research/2026-07-31-mc-*.md | wc -l         # 801 enlaces externos
grep -o "https\?://[^/ )]*" docs/research/2026-07-31-mc-*.md | sed 's|.*://||' | sort -u | wc -l  # 344 dominios únicos
```

**Los 47 documentos son estructuralmente uniformes.** Los tres encabezados que
importan (`Resumen ejecutivo` / `Executive summary`, `Design implications`,
`Sources`) están en los 47 sin excepción. Eso es lo que hace que una plantilla
única sea posible y que el JSON-LD se pueda derivar sin caso especial.

### 4.1 Fuente única: el sitio lee `docs/research/`, no lo copia

`apps/web/src/content/` no existe todavía. La tentación es copiar los 47 .md
adentro de `apps/web`. **No.** Dos copias de un documento que declara sus
`[unverified]` es la forma más rápida de publicar una versión desactualizada de
la afirmación legal que más cuidado necesita.

Propuesta: una colección de contenido de Astro con `glob()` apuntando a
`../../docs/research/` desde `apps/web`. Los documentos se quedan donde están y
son a la vez documentación interna y contenido publicado.

> **No verificado:** que el `glob()` loader de Astro 5.13 lea desde fuera de la
> raíz del proyecto Astro (`apps/web`) sin quejarse. Es un *spike* de media hora
> y es lo primero que hay que probar de S1. Si falla, la salida es un enlace
> simbólico o un paso de copia **en el build**, nunca un archivo copiado a mano.

### 4.2 Metadatos: los documentos no traen frontmatter

Verificado: los 47 empiezan con `# Título` y una línea `> Math Challenge research
— 2026-07-31 — topic NN`. No hay YAML.

Para el JSON-LD y para los hubs hacen falta: `id` (mc-nn), `título`, `categoría`
(las 5 del `README.md`), `estrellas` (⭐/⭐⭐), `fecha`, `autor`, y el conteo de
`[unverified]`.

Dos caminos:

- **(a) Añadir frontmatter YAML a los 47 documentos.** 47 archivos tocados una
  vez, tipado y validado por Astro, imposible de desincronizar.
- **(b) Derivar de la tabla del `README.md` de research + el H1.** Cero archivos
  tocados, pero es un parser de Markdown-en-tabla que **falla en silencio** el
  día que alguien reordene una columna.

**Recomiendo (a).** La regla del proyecto es que las afirmaciones se puedan
re-ejecutar; un parser frágil que decide quién firma 47 páginas públicas es lo
contrario. Y el `README.md` de research pasa a **derivarse** del frontmatter, no
al revés — hoy dice "las 34 decisiones" cuando son 36, que es exactamente el modo
de falla de mantener el índice a mano.

### 4.3 JSON-LD por investigación, y la tabla de coincidencia

`mc-48` §3 pide *"para cada una de las investigaciones un tipo de artículo
académico con sus fuentes citadas"*. Tipo: `ScholarlyArticle`, idéntico en los N
locales.

La regla dura obliga a que **cada campo tenga su contraparte visible**. Así queda:

| Campo JSON-LD | De dónde sale | Qué se ve en la página |
|---|---|---|
| `headline` | H1 del documento | el H1 |
| `abstract` | primer bullet del resumen ejecutivo del locale | el resumen, arriba |
| `inLanguage` | el locale de la ruta | el `lang` del `<html>` y el selector del pie |
| `datePublished` | `2026-07-31` (frontmatter) | fecha visible bajo el título |
| `author` | **pendiente de P3** | firma visible bajo el título |
| `publisher` | `@id` del `Organization` de S0 | atribución del pie |
| `citation[]` | la sección `## Sources` | la propia sección `Sources`, numerada |
| `isPartOf` | `@id` del `WebSite` | migas de pan |
| `keywords` | categoría + id `mc-nn` | migas + etiqueta visible |

**`citation` es el campo con más valor y el más fácil de romper.** 801 enlaces
externos, 344 dominios. Si el JSON-LD lista una cita que la página no muestra
—porque alguien acortó la sección `Sources`— el auditor de §3.1 lo caza. Si no
existiera ese auditor, se publicaría marcado que Google descarta, en las 47
páginas a la vez.

Añadir también `BreadcrumbList` (`mc-48` §3) — visible como migas reales, no solo
como marcado.

### 4.4 `[unverified]` y las limitaciones: no son una nota al pie, son el activo

Esta es la parte del plan donde es más fácil equivocarse por buen gusto. La
tentación de diseño es esconder las marcas `[unverified]` y la sección de
limitaciones en un acordeón gris al final. **Eso destruye exactamente lo que
`mc-48` §1 identifica como el diferenciador**: prácticamente ningún competidor
publica sus limitaciones, y `mc-14` documenta que Brilliant, Matific y Mathletics
no publican evidencia independiente en absoluto.

Requisitos de render, no sugerencias:

1. `[unverified]` se renderiza como **insignia inline visible**, con contraste
   que pasa 4.5:1, enlazada a una página `/{locale}/metodo/` que explica qué
   significa y por qué existe.
2. La sección de **calidad de fuentes / limitaciones** de cada documento se
   renderiza a tamaño de cuerpo normal, en el flujo, no colapsada.
3. La **advertencia de método** del `README.md` de research —que la cuota de
   WebSearch se agotó a media investigación y que varios agentes trabajaron por
   WebFetch— sale publicada. Es incómoda y es la razón por la que las marcas
   `[unverified]` son creíbles.
4. Ninguna de estas tres cosas puede quedar detrás de JavaScript: si el
   `[unverified]` desaparece con el JS apagado, desaparece para parte de los
   rastreadores.

### 4.5 La página que ningún competidor puede copiar

D-033 dice que se publican *"las investigaciones completas — incluidas las que
contradicen al producto"*. Publicarlas es necesario pero no suficiente: enterrada
en 157,000 palabras, la contradicción no se ve.

**Propongo una página índice: `/{locale}/donde-la-evidencia-nos-contradice/`.**

No hay que escribirla a mano: `decisions.md` ya la tiene modelada. D-025 trae
literalmente los encabezados **"Investigación que la respalda"** e
**"Investigación que la contradice"**, y el cuerpo dice *"Esta decisión
contradice la investigación, y se toma con eso a la vista"*. Otros casos con
material listo: D-030 (el dueño pidió gRPC y la investigación lo descartó por
tres hechos), D-014/T-1 (el brief pedía "lo más adictivo posible"), D-024 (una
decisión anterior daba cero puntos a toda respuesta), D-016 (*"de los 5 años en
adelante ninguna autoridad publica una cifra"*), y las reversiones D-001→D-023 y
D-009→D-034.

Esta página es, en términos de `mc-48` §1-§2, la de mayor densidad de
Trustworthiness del sitio, y es la que un tercero cita cuando escribe sobre
edtech honesto. Cuesta poco porque el contenido ya está escrito.

Requisito duro: si se publica esta página, **se publica también `decisions.md`**
o al menos las decisiones que cita, o los enlaces mueren. Eso es la pregunta P4.

### 4.6 URLs, hubs y enlazado interno

Estructura propuesta:

```
/{locale}/investigacion/                      hub: las 5 categorías, los 47
/{locale}/investigacion/{categoria}/          5 páginas de categoría
/{locale}/investigacion/mc-34-i18n-notacion/  47 documentos
/{locale}/metodo/                             cómo se hizo, qué es [unverified]
/{locale}/donde-la-evidencia-nos-contradice/  §4.5
```

**Los segmentos de ruta: pregunta P5.** Invariantes en inglés
(`/de-DE/research/mc-34…/`) contra localizados (`/de-DE/forschung/mc-34…/`). Los
localizados ganan un poco de SEO en la ruta; los invariantes hacen que la
correspondencia entre locales sea mecánica y que un slug mal traducido no rompa
en silencio la reciprocidad de `hreflang`. Las URLs son para siempre: hay que
elegir antes de publicar, no después.

**Enlazado interno gratis:** los documentos se citan entre sí en texto plano
(`mc-34`, `mc-48`) más que con enlaces Markdown — solo hay **2** enlaces
relativos entre documentos en los 47. Un `remark` que convierta cada mención
`mc-nn` en enlace produce cientos de enlaces internos correctos sin tocar el
texto. Es la mejora de SEO con mejor relación esfuerzo/resultado de todo S1.

### 4.7 S1 rompe el presupuesto de peso — y no se sube el número en silencio

Medición:

```bash
node -e 'const fs=require("fs"),z=require("zlib");
const r=fs.readdirSync("docs/research").filter(f=>f.startsWith("2026-07-31-mc-"))
 .map(f=>({f,gz:z.gzipSync(fs.readFileSync("docs/research/"+f)).length/1024}))
 .sort((a,b)=>b.gz-a.gz);
console.log("mayor:",r[0].gz.toFixed(1),"KB gz",r[0].f);
console.log("mediana:",r[Math.floor(r.length/2)].gz.toFixed(1),"KB gz");'
```

```
mayor: 15.7 KB gz 2026-07-31-mc-36-problem-design-item-formats.md
mediana: 9.6 KB gz
```

Eso es el **Markdown crudo**; el HTML pesa más. El presupuesto vigente es
`html: 12` KB gz **por página** (`audits/bundle-budget.mjs:22`). Hoy la página
más pesada del sitio son 2.1 KB gz. Con S1, varios documentos lo revientan.

**Lo que no se hace:** subir el `12` a `30` y seguir. Ese número viene de D-030 y
`mc-47` §4, y el dispositivo de referencia es Android de gama baja sobre 4G
lento.

**Lo que se hace:** partir el presupuesto por **clase de página**, con la razón
escrita en el archivo del auditor:

| Clase | Presupuesto | Por qué |
|---|---|---|
| portada, hubs, páginas de producto | 12 KB gz (sin cambio) | son la puerta de entrada y compiten por LCP |
| artículo de investigación | propuesta: 30 KB gz | es texto que se transmite en flujo; lo que daña LCP e INP en un artículo son los recursos que bloquean el render y el JS, no la longitud del HTML |
| JS de cliente | 60 KB gz (sin cambio) | **no sube por S1**: un artículo no necesita JavaScript |
| CSS | 24 KB gz (sin cambio) | idem |

El renglón que de verdad protege el presupuesto es el tercero: **si S1 agrega un
solo kilobyte de JS de cliente, algo se diseñó mal.** Índices, filtros y tablas
de contenido se pueden hacer estáticos.

La alternativa —paginar los documentos largos— se descarta a propósito: destruye
la URL única y citable, que es el activo entero de S1.

### 4.8 ¿Siete locales o dos? — la pregunta con sus números

Es la pregunta abierta que `mc-48` (§Open questions #1) y el propio cuerpo de S1
del tablero dejan sin contestar. Los números reales:

| Opción | Palabras a traducir | Páginas de artículo | URLs en el sitemap (aprox.) |
|---|---|---|---|
| Solo `en` | 0 | 47 | ~60 |
| `en` + `es-MX` | 157,235 | 94 | ~110 |
| Los 7 locales | **943,410** (157,235 × 6) | 329 | ~380 |

Tres cosas que hacen falta para decidir bien, y que no son obvias:

1. **`mc-34` casi no aplica aquí.** El problema de los siete locales es de
   contenido matemático de kinder — "einundzwanzig", secuencias de conteo,
   división larga. La prosa de investigación tiene notación matemática en muy
   pocos documentos. Traducir la investigación **sí es traducible**, al revés que
   el contenido del producto (D-022). El costo es de volumen, no de autoría.
2. **Publicar en 2 y declarar `hreflang` correcto es técnicamente impecable**
   (§3.3), y `mc-48` §Open questions #1 lo llama *"defendible"* con esas
   palabras.
3. **Pero el sitio de producto sí está en 7.** Un visitante alemán que llega a
   `/de-DE/` y descubre que la investigación —el argumento central del sitio—
   solo existe en inglés, se lleva una experiencia partida. Mitigación: en los
   locales sin corpus, la ficha de cada investigación (título, resumen ejecutivo,
   limitaciones) **sí** se traduce, y el cuerpo se sirve en inglés con aviso
   visible. Son ~47 resúmenes × 5 locales, no 943,000 palabras.

Esa tercera vía —**fichas traducidas en 7, cuerpos en 2**— es mi recomendación, y
está en las opciones de P1.

### 4.9 Anti-deriva: el auditor que impide que el sitio y el repo se separen

Un auditor determinista corto, en el gancho:

- `count(páginas de investigación en dist para el locale base)` ==
  `count(docs/research/2026-07-31-mc-*.md)`. Hoy: 47.
- Cada documento tiene frontmatter válido y una categoría de las 5.
- El conteo de palabras que el sitio publica es **calculado en el build**, nunca
  una cadena escrita a mano.

Esto último no es pedantería. `D-033` dice "45 investigaciones" y "152,000
palabras"; `mc-48` dice lo mismo; el `README.md` de research y el `master-plan`
dicen 47 y ~157,000; el conteo real es **47 y 157,235**. En un sitio cuyo
argumento es el rigor, publicar un número obsoleto sobre el tamaño de la propia
investigación es el error más caro posible. `apps/web/src/i18n/en.json` ya dice
"Forty-seven studies, about 157,000 words" — está bien hoy y se desincroniza el
día que se agregue mc-49.

---

## 5. S2 — la historia, el producto y la arquitectura

Cinco páginas, en los 7 locales (aquí sí: son textos de producto, y el sitio de
producto ya está en 7).

### 5.1 `/{locale}/origen/` — la única fuente de *Experience*

De [`por-que-existe.md`](../por-que-existe.md), que ya trae escrito cómo se usa:
*"La historia se cuenta completa, incluidas la palabra 'adictivo' y su
corrección. La página de origen no abre con el producto: abre con niños perdiendo
el tiempo en TikTok y un adulto que extrañaba las matemáticas."*

Requisitos duros, tomados del propio documento:

- **La palabra "adictivo" se queda**, con lo que la investigación le hizo. Es lo
  que `mc-48` §2 llama la única señal que la investigación no puede producir.
- **No se le pone épica que no tiene** (`por-que-existe.md`, cierre).
- Se autora por locale, no se traduce: es voz, no especificación.
- JSON-LD: `AboutPage` + `Person`/`Organization` como autor. La firma visible
  depende de P3.

### 5.2 `/{locale}/niveles/` — 12 niveles × 5 temas

De D-017 y §4.1 del `master-plan`. Dos reglas:

- **Sin nombres de grado escolar** (`mc-15`: las fracciones se introducen entre
  los 6 y los 9 años según el país). Ya es criterio del tablero.
- **Ninguna afirmación de resultado de aprendizaje** — D-033 lo prohíbe, el
  `master-plan` §14.4 lo prohíbe, y `por-que-existe.md` §"Lo que esta historia
  obliga a no hacer" lo prohíbe otra vez. Nunca "las 2 sigma de Bloom".

**Nota de esquema con la que discrepo de `mc-48`, y lo digo:** `mc-48` §3
recomienda `Course` para las bandas de nivel. `Course` en `schema.org` describe
un curso ofrecido, y el resultado enriquecido de Google para `Course` pide
información de oferta e instancias. Marcar como `Course` algo que no se vende y
del que tenemos prohibido prometer resultados es afirmar de más — el mismo pecado
que `mc-48` §6 señala con la infraestructura. Propongo `ItemList` de `WebPage`
para la escalera, y reservar `Course` para cuando exista una banda con contenido
real, matriculación y descripción de curso. **No pude verificar los requisitos
actuales de `Course` de Google** (§9); si resultan compatibles, se usa `Course`.

### 5.3 `/{locale}/arquitectura/` — el contenido técnico citable

`mc-48` implicación #10: *"La página de arquitectura es contenido, no un pie de
página."* Material que ya existe y solo hay que redactar para público:

- **Por qué no gRPC** (D-030): Workers no puede hacer llamadas gRPC salientes,
  el navegador no habla gRPC, y los *trailers* de HTTP tienen soporte limitado en
  el borde. Tres hechos independientes, cada uno suficiente.
- **HTTP/3 y 0-RTT**, verificados en la zona con evidencia
  (`infrastructure.md` §"Ajustes de zona": `alt-svc: h3=":443"`, ticket TLS 1.3
  con `Max Early Data: 14336`), y comprobados en cada despliegue por
  `audits/live.mjs`.
- **Por qué los intentos no van a D1** (`mc-32` riesgo #1, y el auditor
  `no-attempts-in-d1.mjs` que lo impone).
- **La flota de 38 auditores** y las dos reglas de D-032.
- **La atribución de dos partes**: *un proyecto de Ignia, sobre Cloudflare.*
  D-033 y `mc-48` §6 son explícitos en que esto se dice separado, porque decir
  que el stack lo provee Ignia *"sería desmentible con una consulta de DNS, y el
  lector de la página de arquitectura es exactamente quien la haría."*

### 5.4 `/{locale}/preguntas/` — para padres

`mc-48` §3 lista `FAQPage`. Se marca, con la salvedad de §9: **no cuento con que
produzca resultado enriquecido**; se pone porque es correcto y legible por
máquina, no porque vaya a salir una caja en Google.

Contenido: qué datos se recogen del niño y cuáles no (D-013), por qué la práctica
es gratis (D-021), qué pasa con el límite de pantalla y la racha (D-014, D-016),
por qué no hay chat en ningún grupo infantil (D-027).

### 5.5 `/{locale}/codigo-abierto/` — §6

---

## 6. Código abierto: cómo lo dice el sitio

El dueño pidió que el sitio **diga que el proyecto es de código abierto y lo
presuma**, con enlace al repo y al tablero. Diseñado, con su bloqueo declarado.

### 6.1 El bloqueo, primero

```bash
gh repo view kilowatto/math-challenge --json visibility,licenseInfo
# {"licenseInfo":null,"visibility":"PUBLIC"}
ls LICENSE*     # no existe
```

Y en `README.md`, última línea:

> *Licencia / License — Privado. Todos los derechos reservados. · Private. All
> rights reserved.*

Y en `decisions.md`, D-023: *"vive en su propio repositorio,
`kilowatto/math-challenge`, **privado**"*.

**Un repositorio público sin archivo de licencia no es código abierto: es código
visible con todos los derechos reservados.** Nadie puede reusarlo legalmente. Si
el sitio dice "código abierto" y enlaza a un repo cuyo README dice "todos los
derechos reservados", el visitante que sigue el enlace encuentra la
contradicción en el primer scroll — y ese visitante es exactamente el lector
escéptico que `mc-48` §6 describe. Es el mismo modo de falla que presumir
infraestructura ajena, aplicado a la licencia.

**Por eso la palabra "código abierto" no se escribe en el sitio hasta que P2
esté contestada.** Lo que sí se puede escribir hoy, y es verdad: *"El código, la
investigación y el plan son públicos"*, con los dos enlaces.

### 6.2 Qué es cada cosa, porque no todo se licencia igual

Un solo `LICENSE` en la raíz sería un error para este repositorio, que contiene
cuatro cosas de naturaleza distinta:

| Qué | Propuesta | Por qué |
|---|---|---|
| Código (`apps/`, `audits/`, `scripts/`, `migrations/`) | licencia de software (MIT / Apache-2.0 / AGPL — P2) | es lo único que se "reusa" en el sentido normal |
| Investigación y documentación (`docs/`) | licencia de contenido, p. ej. CC BY 4.0 | invita a la **cita**, que es literalmente la estrategia de D-033 |
| **Larry y la marca Ignia** | **explícitamente fuera de toda licencia** | Larry es personaje preexistente de Ignia (D-004, `mc-37`). Una licencia permisiva sobre el repo, sin esta reserva escrita, es una invitación a que un tercero use al personaje |
| Banco de ítems (futuro, F5) | decisión aparte | es el producto (`CLAUDE.md` § Contenido). No hay que decidirlo hoy, pero sí no regalarlo por omisión |

Esa cuarta fila importa aunque hoy no exista contenido: si el `LICENSE` de la
raíz es permisivo y luego llegan 2,500 retos curados al mismo repositorio,
quedaron licenciados sin que nadie lo decidiera.

### 6.3 La página, si hay licencia

`/{locale}/codigo-abierto/`, con cinco bloques:

1. **Qué está abierto**, con enlace directo a cada cosa: el código, las 47
   investigaciones, `decisions.md` con sus reversiones, `CLAUDE.md` con las ocho
   líneas rojas, las 23 cartas de la flota adversarial, y el **tablero público**
   (`https://github.com/users/kilowatto/projects/1`, 18 elementos, verificado
   público).
2. **Bajo qué licencia cada cosa** (§6.2), con la reserva de marca dicha en voz
   alta.
3. **Qué se puede reusar de verdad**, con honestidad sobre lo que no sirve fuera
   de aquí: los auditores deterministas y la flota adversarial con cartas y regla
   de citación son lo genuinamente reusable; el esquema de ítem con errores de
   causa nombrada también.
4. **Cómo contribuir**: hoy no existen `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`
   ni `SECURITY.md` (verificado: `ls CONTRIBUTING* CODE_OF_CONDUCT* SECURITY*
   .github` → no hay ninguno). La página no puede decir "contribuye" y llevar a
   un repo sin ninguna instrucción. Es trabajo de S2, no de una tarde.
5. **Por qué**, que es lo único que lo vuelve presumible en vez de decorativo:
   el mismo argumento de D-033. Publicar el tablero incluye publicar que **F0
   estuvo marcada "cerrada" sin tener el 0-RTT verificado** y que hubo que
   reabrirla (`scripts/detallar-proyecto.mjs`, "Lección que dejó"). Un tablero
   que muestra un error propio es más creíble que cualquier declaración de
   valores.

### 6.4 El marcado, cuando exista la licencia

Al `@graph` de S0 se añade un nodo `SoftwareSourceCode` con `codeRepository`,
`license` (URL SPDX) y `programmingLanguage`, y `sameAs` en el `Organization`
apuntando al repositorio. **No antes:** declarar `license` en JSON-LD sin
`LICENSE` en el repositorio es una afirmación falsa legible por máquina, en un
sitio cuyo activo es no tener ninguna.

### 6.5 Lo que publicar el repositorio expone, dicho de frente

Ya es público, así que esto no es una advertencia previa sino un inventario de lo
que el sitio va a estar señalando activamente:

- `decisions.md` y `docs/research/` contienen afirmaciones legales marcadas
  `[unverified]` sobre COPPA, GDPR-K y el Children's Code. Publicarlas es la
  estrategia (D-033); confundirlas con asesoría legal no lo es. El aviso de
  `/{locale}/metodo/` (§4.4) tiene que cubrirlas explícitamente.
- `audits/adversarial/ANULACIONES.md` es el registro de auditores anulados. Es
  una fortaleza si se presenta como tal.
- Los informes de corrida están ignorados (`.gitignore`:
  `audits/adversarial/informes/`), y `.env` también. Verificado:
  `git ls-files .env` no devuelve nada y `node audits/secrets.mjs` pasa.

---

## 7. Conflictos

Ninguna acción de este plan cruza una de las ocho líneas rojas. Los conflictos
son entre documentos y reglas escritas, y **ninguno se resuelve aquí**.

**C1 · "Código abierto" contra tres documentos.** El dueño pide presumir código
abierto. Pero `README.md` dice "Privado. Todos los derechos reservados.",
`decisions.md` D-023 dice que el repositorio es **privado**, y no hay archivo
`LICENSE` (`gh repo view … --json licenseInfo` → `null`), mientras
`visibility` es **PUBLIC**. Tres afirmaciones incompatibles. **No propongo
escribir "código abierto" en el sitio hasta que exista licencia y D-023 se
enmiende.** → P2.

**C2 · El JSON-LD de hoy incumple la regla dura de `mc-48` §3.**
`Organization.description` está en español en los 7 locales y no aparece en
ninguna página (reproducción en §3.4). Se arregla en S0 y el auditor de §3.1
tiene que verse fallar contra el `dist` actual antes del arreglo.

**C3 · WCAG 2.2 AA: D-033 contra `audits/run.mjs`.** D-033 lo hace requisito de
publicación del sitio; `run.mjs` agenda `axe-a11y`, `contrast` y `touch-targets`
para **F2**. El sitio se publica antes que F2. → §3.8.

**C4 · `og:image` contra `CLAUDE.md` § Imágenes.** La regla dice AVIF con
respaldo WebP salvo los íconos del manifest; los rastreadores sociales exigen
PNG/JPEG en la práctica. Es una segunda excepción a una regla escrita. → P6.

**C5 · `Course` contra `mc-48` §3.** `mc-48` lo recomienda para las bandas de
nivel; usarlo sin oferta ni resultados prometidos afirma de más, y D-033 prohíbe
reclamar resultados de aprendizaje. Propongo desviarme y dejarlo escrito. → §5.2.

**C6 · Cifras obsoletas en documentos de gobierno.** D-033 y `mc-48` dicen "45
investigaciones" y "152,000 palabras"; el conteo real es **47** y **157,235**
(comandos en §4). No bloquea el sitio —que debe publicar el número calculado— pero
las decisiones deberían corregirse para no citar una cifra que el propio sitio
desmiente.

**C7 · `README.md` dice "Fase de planeación. No hay código todavía."** Es falso:
existen `apps/web`, `apps/ingest`, 7 auditores deterministas bloqueando en el
gancho (`node audits/run.mjs`), 2 migraciones aplicadas y un Worker desplegado;
F0 y F1 están cerradas. El sitio va a enlazar a ese README
desde cada página (§3.7). Un enlace de "presume nuestro trabajo" que aterriza en
"no hay código todavía" cuesta credibilidad justo donde el sitio la está
comprando.

---

## 8. Preguntas al dueño

Solo las que cambian lo que se construye.

### P1 · ¿En cuántos locales sale el corpus de S1?

*(Es la pregunta abierta #1 de `mc-48` y del cuerpo de S1 en el tablero.)*

- **A · Solo `en`.** 0 palabras traducidas, 47 páginas. Contradice que el resto
  del sitio esté en 7.
- **B · `en` + `es-MX`.** 157,235 palabras traducidas, 94 páginas. `mc-48` lo
  llama "defendible" con esas palabras.
- **C · Los 7 locales.** 943,410 palabras, 329 páginas. Multiplica por 7 el
  trabajo y el mantenimiento: cada corrección a un documento son 7 ediciones.
- **D · Híbrido (mi recomendación).** Ficha completa —título, resumen ejecutivo,
  limitaciones, `[unverified]`, fuentes— traducida en los 7; cuerpo largo en
  `en` + `es-MX` con aviso visible. Son ~47 resúmenes × 5 locales, no 943,000
  palabras, y ningún locale queda con una página vacía.

**Por qué cambia lo que se construye:** decide si `Base.astro` necesita
`hreflang` por página (§3.3), el tamaño del sitemap, y si hace falta un
componente de "este documento está en inglés".

### P2 · ¿Qué significa exactamente "código abierto" aquí?

- **A · MIT o Apache-2.0 para el código + CC BY 4.0 para `docs/`.** Máxima
  reutilización y máxima probabilidad de cita, que es la estrategia de D-033.
  Apache-2.0 añade concesión expresa de patentes; MIT es más corto.
- **B · AGPL-3.0 para el código + CC BY-SA 4.0 para `docs/`.** Copyleft: quien
  lo use como servicio publica sus cambios. Presumible, y ahuyenta a quien
  quisiera reusar sin devolver.
- **C · Source-available, sin licencia OSI.** El código se ve pero no se reusa.
  **Entonces el sitio no puede decir "código abierto"**: diría "el código y la
  investigación son públicos", que es cierto.
- **D · Todo cerrado y repo privado**, como dice D-023 hoy. Cancela el encargo.

En A y B hace falta además: enmendar D-023 (dice "privado"), corregir la línea
de licencia del `README.md`, y **reservar por escrito a Larry y la marca Ignia**
fuera de la licencia (§6.2).

### P3 · ¿Quién firma las 47 investigaciones?

*(Pregunta abierta #3 de `mc-48`.)* El `README.md` de research dice que las
hicieron *"agentes independientes"*. Firmarlas con un nombre humano sería
exactamente el tipo de afirmación que este sitio existe para no hacer.

- **A · `Organization: Ignia`**, sin persona. Seguro, pero `mc-48` §2 dice que
  la *Authoritativeness* mejora con autoría atribuida y verificable.
- **B · Esteban Rey como autor**, con una nota de método. Mayor autoridad,
  pero hay que poder sostener el grado de participación.
- **C · Autoría mixta y declarada:** *"Investigación asistida por IA, dirigida y
  revisada por Esteban Rey (Ignia)"*, con `/{locale}/metodo/` explicando el
  procedimiento, la advertencia de cuota de WebSearch y qué significa
  `[unverified]`. Es la más honesta y la más consistente con D-033.
- **D · Por documento**, si el nivel de revisión difiere entre ellos.

**Por qué cambia lo que se construye:** es el campo `author` del JSON-LD y una
firma visible en 47 × N páginas; cambiarlo después es reescribir todas.

### P4 · ¿Se publica `decisions.md`?

*(Pregunta abierta #4 de `mc-48`.)*

- **A · Completo, con las reversiones** (D-001→D-023, D-009→D-034,
  D-010→D-024, las enmiendas de D-035). Transparencia máxima. Habilita la
  página de §4.5, que es la de mayor valor de todo el sitio.
- **B · Solo las decisiones citadas** por la página de contradicciones. Menos
  exposición, enlaces vivos.
- **C · No se publica.** Entonces §4.5 se escribe a mano y sin enlaces, y pierde
  la mitad de su fuerza.

**Ojo:** `decisions.md` contiene afirmaciones legales `[unverified]` y el
reconocimiento explícito de decisiones que contradicen la investigación (D-025).
Eso es el activo, no el riesgo — pero es una decisión del dueño, no mía.

### P5 · ¿Los segmentos de URL se traducen?

- **A · Invariantes en inglés:** `/de-DE/research/mc-34-i18n-notation/`. La
  correspondencia entre locales es mecánica y `hreflang` no se rompe por un slug
  mal traducido.
- **B · Localizados:** `/de-DE/forschung/mc-34-…/`. Algo de SEO en la ruta, y
  cada slug es un punto de fallo silencioso × 7.
- **C · Mixto:** sección invariante, slug del documento localizado.

Las URLs son permanentes: elegir después implica redirecciones para siempre.

### P6 · ¿Se hacen imágenes de vista previa social?

- **A · Sí, PNG/JPEG**, aceptando una segunda excepción a la regla AVIF/WebP de
  `CLAUDE.md` y anotándola en `guia-de-estilo.md`.
- **B · Sí, generadas en el build** (una por documento, con título y categoría).
  Mismo formato, más trabajo, mucho mejor al compartir 47 artículos.
- **C · No.** Cero excepciones a la regla; las tarjetas al compartir salen sin
  imagen.

---

## 9. Lo que NO pude verificar

Dicho explícitamente, porque un plan que no lista sus huecos no los buscó.

1. **Que el `glob()` loader de Astro 5.13 lea contenido fuera de `apps/web`.**
   Es el supuesto sobre el que descansa §4.1 (fuente única). Sin red y sin
   probarlo, es intención. **Primer *spike* de S1.**
2. **Los requisitos actuales de Google para el resultado enriquecido de
   `Course`** (§5.2, C5) y **el estado del resultado enriquecido de `FAQPage`**
   (§5.4). No tengo acceso a red en esta sesión, y `mc-48` mismo advierte que
   ninguna de sus fuentes [1]-[5] es primaria de Google. Verificar contra Search
   Central antes de fijar el `@type`.
3. **Las cifras de `mc-48`** —2.3× de probabilidad de cita, 40-70% de pérdida de
   tráfico, el estudio Wellows de 2,400 citas— siguen **sin confirmar contra
   fuente primaria**; el propio documento lo dice en su nota de calidad de
   fuentes. **No deben aparecer en el sitio público** ni usarse para justificar
   presupuesto sin confirmarlas.
4. **El peso real en HTML de un artículo de S1.** Medí el Markdown crudo
   comprimido (15.7 KB gz el mayor, 9.6 KB gz la mediana). El HTML renderizado
   pesa más y no puedo medirlo sin construir S1. El presupuesto de 30 KB gz de
   §4.7 es una propuesta calibrada sobre esa medición, no un dato.
5. **Los límites de Cloudflare Workers Static Assets** (número de archivos y
   tamaño por archivo) frente a las ~380 páginas de la opción de 7 locales. Sé
   que existen; no pude consultar la cifra vigente. Verificar antes de elegir C
   en P1.
6. **El rendimiento de campo (LCP/CLS/INP) del sitio desplegado.** `audits/live.mjs`
   comprueba disponibilidad, `hreflang`, terceros, HTTP/3 y 0-RTT, pero el
   auditor `cwv-budget` sigue pendiente (`node audits/run.mjs` lo lista). El
   criterio de aceptación de S0 en el tablero lo exige y hoy **nadie lo mide**.
7. **Si `apps/web/dist` está sincronizado con producción.** Las mediciones de
   este documento salen de un `pnpm build` local del 2026-07-31, no de lo
   desplegado.

---

## 10. Orden de ejecución

Por dependencia, no por importancia. Cada renglón trae con qué se comprueba.

| # | Qué | Comprobación |
|---|---|---|
| 1 | `audits/jsonld-valid.mjs` — **viéndolo fallar** contra el `dist` de hoy | `pnpm build && node audits/jsonld-valid.mjs` → sale 1, señalando `Organization.description` |
| 2 | `audits/hreflang-recip.mjs` | `node audits/hreflang-recip.mjs` → pasa con las 8 páginas actuales |
| 3 | Arreglar el `Organization` (§3.4) y `hreflang` por página (§3.3) | el auditor 1 pasa a verde; el 2 sigue verde |
| 4 | `sitemap.xml` + `robots.txt` | `curl -s localhost:4321/sitemap.xml \| head`; `node audits/live.mjs` tras desplegar |
| 5 | Pie con enlaces a repo y tablero, en los 7 locales | `node audits/locales-complete.mjs` + `grep -l "kilowatto/math-challenge" apps/web/dist/*/index.html \| wc -l` → 7 |
| 6 | Raíz 302 por `Accept-Language` | `curl -sI -H 'Accept-Language: de' https://math.kilowatto.com/` → `302` a `/de-DE/` |
| 7 | `axe-a11y`, `contrast`, `touch-targets` movidos a S0 | `node audits/run.mjs` los muestra en activos, no en pendientes |
| 8 | *Spike*: colección de contenido leyendo `docs/research/` | `pnpm build` genera 47 rutas |
| 9 | Frontmatter en los 47 documentos + auditor anti-deriva | `node audits/research-sync.mjs` → 47 == 47 |
| 10 | Plantilla de artículo, `ScholarlyArticle`, `[unverified]` visible | auditor 1 sobre las 47 páginas nuevas |
| 11 | Presupuesto de peso por clase de página | `node audits/bundle-budget.mjs` pasa con los artículos dentro |
| 12 | Hubs, migas, enlazado automático de `mc-nn` | conteo de enlaces internos por página |
| 13 | `/donde-la-evidencia-nos-contradice/` | los enlaces a `decisions.md` resuelven (depende de P4) |
| 14 | S2: origen, niveles, arquitectura, preguntas | auditor 1 sobre cada página nueva |
| 15 | `/codigo-abierto/` + `LICENSE` + `CONTRIBUTING.md` | `gh repo view --json licenseInfo` deja de ser `null` (depende de P2) |

Los pasos 1-7 son S0 y **no dependen de ninguna respuesta**. Se pueden empezar
hoy mientras el dueño contesta P1-P6.

---

## Referencias

- [`decisions.md`](../decisions.md) — D-033 (el sitio abierto), D-022 (siete
  locales), D-023 (repositorio, dice "privado"), D-030, D-032, D-017
- [`master-plan.md`](../master-plan.md) §13.1 (las dos vías), §14 (lo que el
  plan no hace)
- [`research/2026-07-31-mc-48-public-site-seo.md`](../research/2026-07-31-mc-48-public-site-seo.md)
- [`por-que-existe.md`](../por-que-existe.md) — la voz del sitio
- [`infrastructure.md`](../infrastructure.md) — HTTP/3 y 0-RTT verificados
- `scripts/detallar-proyecto.mjs` — los cuerpos de S0/S1/S2 ya en el tablero
- Tablero público: `https://github.com/users/kilowatto/projects/1`
