# El sitio abierto: por qué publicar la investigación *es* la estrategia orgánica

> Math Challenge research — 2026-07-31 — topic 48

## Resumen ejecutivo (ES)

- **El hallazgo que cambia el plan:** tras la actualización de marzo de 2026, *"la investigación original y los casos de estudio documentados se han convertido en los activos de contenido de mayor valor que una organización puede producir"* [1].
- **Y las citas de IA lo amplifican:** un estudio de Wellows sobre 2.400 citas en AI Overviews encontró que las páginas con señales fuertes de E-E-A-T tienen **2,3× más probabilidades de ser citadas** [1].
- **El coste de no disponer de ello es real:** cientos de sitios perdieron **40-70 % del tráfico orgánico de la noche a la mañana** en actualizaciones recientes del algoritmo; los que sobrevivieron y crecieron habían invertido profundamente en E-E-A-T [1].
- **E-E-A-T son cuatro cosas distintas** — Experience (experiencia de primera mano), Expertise (conocimiento y credenciales), Authoritativeness (reconocimiento y reputación) y Trustworthiness (exactitud, transparencia y experiencia de uso) [1][2]. La primera **E** se añadió en diciembre de 2022 [2].
- Math Challenge tiene 152.000 palabras de investigación original **con fuentes citadas, con limitaciones declaradas y con afirmaciones marcadas `[unverified]`** — eso cubre Expertise y Trustworthiness de una forma que casi nadie en edtech cubre.
- **Lo que no puede comprarse ni investigarse es la Experience**: la historia de primera mano de por qué existe el proyecto. Esa solo la aporta el dueño (ver [`por-que-existe.md`](../por-que-existe.md)).
- **JSON-LD es el formato preferido de Google**, y el contenido de la estructura **debe traducirse por versión de idioma** manteniendo el esquema intacto; cada versión localizada declara su `inLanguage` [3][4][5].
- **El esquema no reemplaza a `hreflang`**, lo complementa: `hreflang` señala las variantes de idioma y región, el esquema refuerza esa intención en forma legible por máquina [3][4].
- **Regla dura:** el contenido del esquema **debe coincidir con lo visible en la página**; si difiere, Google puede ignorar el marcado por completo [5].
- Implicación central: el sitio no es marketing con investigación adjunta. **La investigación es el sitio**, y la accesibilidad WCAG 2.2 AA (`mc-38`) no es solo obligación legal en la UE desde junio de 2025 sino señal directa de Trustworthiness.

## Executive summary (EN)

- **The finding that changes the plan:** after the March 2026 update, *"original research and documented case studies have become some of the highest-value content assets an organization can produce"* [1].
- **AI citations amplify it:** a Wellows study of 2.400 AI Overview citations found pages with strong E-E-A-T signals are **2,3× more likely to be cited** [1].
- **The cost of lacking it is real:** hundreds of sites lost **40-70 % of organic traffic overnight** in recent core updates; those that survived and grew had invested deeply in E-E-A-T [1].
- **E-E-A-T is four distinct things** — Experience (firsthand involvement), Expertise, Authoritativeness, Trustworthiness [1][2]. The first **E** was added in December 2022 [2].
- Math Challenge has 152.000 words of original research **with cited sources, declared limitations, and `[unverified]` flags** — covering Expertise and Trustworthiness in a way almost nobody in edtech does.
- **What cannot be bought or researched is Experience**: the firsthand story of why the project exists.
- **JSON-LD is Google's preferred format**, structured-data content **must be translated per language version** with the schema intact, and each localized version declares `inLanguage` [3][4][5].
- **Schema does not replace `hreflang`** — it complements it [3][4]. **Hard rule:** schema content **must match what is visible on the page**, or Google may ignore the markup entirely [5].
- Core implication: the research *is* the site, and WCAG 2.2 AA accessibility is a Trustworthiness signal, not only an EU legal obligation.

## Findings

### 1. Por qué 152.000 palabras de investigación son el activo, no el anexo

El cambio de fondo tras marzo de 2026 es que Google dejó de premiar el contenido que *parece* autoritativo y empezó a premiar el que **lo es de forma demostrable**. La formulación exacta de la fuente: la investigación original y los casos de estudio documentados *"se han vuelto de los activos de contenido de mayor valor que una organización puede producir"* [1].

El segundo efecto es el que importa más a mediano plazo. Con AI Overviews mediando cada vez más consultas, ser **citado** vale más que posicionar: el estudio de Wellows sobre 2.400 citas encontró que las páginas con señales fuertes de E‑E‑A‑T tienen **2,3× más probabilidad de ser citadas** [1]. Una investigación con fuentes numeradas y verificables es exactamente el tipo de página que un sistema de recuperación prefiere citar.

Y el riesgo de no hacerlo está medido: cientos de sitios perdieron **40-70 % de su tráfico orgánico de un día para otro** en actualizaciones recientes, y los que crecieron habían invertido a fondo en E‑E‑A‑T [1].

**Dónde está parado Math Challenge.** Las 45 investigaciones tienen fuentes numeradas, declaran sus limitaciones de método, marcan `[unverified]` lo que no pudieron confirmar contra fuente primaria, y —esto es lo inusual— **incluyen los pasajes donde la evidencia contradice al propio producto**: `mc-10` desmonta la cita más famosa sobre exámenes cronometrados, `mc-17` documenta la exposición regulatoria de la mecánica que el brief original pedía, `mc-14` señala que el tutor de Khan Academy no superó a un buscador en un estudio controlado.

Publicar eso no es humildad: es la definición operativa de Trustworthiness. Y prácticamente ningún competidor lo hace — `mc-14` documenta que Brilliant, Matific y Mathletics carecen de evidencia independiente publicada, y que Kumon no tiene ni un estudio que cumpla los estándares del What Works Clearinghouse.

### 2. Las cuatro letras, y cuál falta

E‑E‑A‑T se descompone en cuatro señales distintas, y conviene mapearlas porque el sitio necesita cubrir las cuatro por vías diferentes [1][2]:

| Señal | Qué pregunta | Con qué la cubre este sitio |
|---|---|---|
| **Experience** | ¿El autor tiene participación de primera mano? | La historia del dueño: por qué empezó, su propia relación con las matemáticas, su propio uso del producto. **Solo él la aporta.** |
| **Expertise** | ¿Hay conocimiento y competencia demostrada? | 45 investigaciones, 152.000 palabras, con fuentes primarias citadas |
| **Authoritativeness** | ¿Hay reconocimiento y reputación? | Ignia como respaldo institucional; citas entrantes que la investigación publicada atraiga con el tiempo |
| **Trustworthiness** | ¿Hay exactitud, transparencia y buena experiencia de uso? | Limitaciones declaradas, `[unverified]` visibles, contradicciones publicadas, y accesibilidad WCAG 2.2 AA |

La **Experience** es la única que no se puede producir con más trabajo de investigación, y fue añadida en diciembre de 2022 precisamente para distinguir al que vivió el problema del que solo lo estudió [2]. Por eso la entrevista al dueño no es contenido de relleno para la página "acerca de": es la señal que el resto del sitio no puede generar.

### 3. Datos estructurados en siete locales

**JSON‑LD es el formato preferido de Google** [3][5]. Las reglas que rigen su uso multilingüe:

- **El contenido dentro del JSON‑LD se traduce por versión de idioma, manteniendo la estructura intacta** — los datos estructurados deben reflejar cada versión localizada de forma independiente [3][4].
- **Cada versión declara su idioma** con la propiedad `inLanguage`; para nombres de organización conviene incluir `alternateName` en distintos idiomas [3][4].
- **Los tipos de esquema deben permanecer consistentes entre idiomas** — no se usa `Course` en español y `Article` en alemán para la misma página [5].
- **El esquema no reemplaza a `hreflang`.** Las etiquetas `hreflang` son las que indican variantes de idioma y región a los buscadores; el esquema refuerza esa intención en forma legible por máquina [3][4].
- **Regla que invalida todo lo demás si se rompe:** el contenido del esquema **debe coincidir con lo visible en la página**. Si el marcado contiene algo distinto de lo que se muestra, Google puede ignorarlo por completo [5].

Los tipos que corresponden a este sitio: `Organization` (Ignia como editor), `WebSite`, `Course` para las bandas de nivel, `FAQPage` para las preguntas de padres, `BreadcrumbList` para la navegación, y para cada una de las 45 investigaciones un tipo de artículo académico con sus fuentes citadas — que es justamente el formato que un sistema de citas prefiere consumir.

### 4. Siete locales, no cinco idiomas

El sitio hereda la realidad de `mc-34`: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Para SEO esto significa siete versiones con `hreflang` recíproco —cada página apuntando a todas las demás y a sí misma— más `x-default`.

La trampa específica de este producto: **`es-MX` y `es-ES` no son la misma página traducida**, porque la notación matemática difiere (punto contra coma decimal, formato de división larga). Publicar una sola versión "es" y declarar dos `hreflang` sería técnicamente válido y **factualmente incorrecto** en el contenido matemático, que es justo el contenido que el sitio quiere que se cite.

### 5. Accesibilidad como señal, no solo como obligación

`mc-38` ya establece el requisito legal: la Ley Europea de Accesibilidad aplica desde el 28 de junio de 2025 e incluye explícitamente el comercio electrónico, con EN 301 549 (que incorpora WCAG 2.1 completo) como referencia técnica. El objetivo interno es WCAG 2.2 AA, superconjunto estricto.

Lo que agrega este documento: la Trustworthiness de E‑E‑A‑T evalúa también **la experiencia de uso** [1][2]. Un sitio inaccesible no solo incumple en la UE — falla una de las cuatro señales que determinan si el contenido se posiciona y se cita. Es el caso raro donde cumplimiento legal y estrategia orgánica apuntan exactamente al mismo trabajo.

### 6. La atribución de Ignia, y por qué la precisión aquí es estratégica

Ignia Cloud es un proveedor de nube con sede en Ciudad de México y operación en Estados Unidos, que se describe con el lema *"Trust, Integrity and Availability in one place"*, ofrece infraestructura, seguridad de datos, gestión de datos a gran escala y cómputo de alto rendimiento, y declara 99,99 % de SLA con alianzas con Microsoft, Dell Technologies, Cisco Systems, OpenStack, Canonical y Acronis [6].

**Math Challenge corre sobre Cloudflare** (`mc-32`). Afirmar que el stack es provisto por Ignia sería desmentible con una consulta de DNS, y el público objetivo de la página de arquitectura es exactamente el que la haría.

La formulación exacta y verificable es de dos partes: **Ignia hace y patrocina el proyecto** —lo cual es cierto, e incluye que Larry es su personaje preexistente (`mc-37`, D-004)— **y Cloudflare es la infraestructura**. Ambas afirmaciones resisten escrutinio, y de paso la página de arquitectura se vuelve contenido técnico citable por sí mismo, que es más tráfico orgánico y no menos.

Esto conecta con Trustworthiness de forma directa: un sitio que publica sus `[unverified]` y luego exagera sobre su propia infraestructura se contradice en su señal más valiosa.

## Design implications

1. **Publicar las 45 investigaciones completas** como páginas propias e indexables, con fuentes, limitaciones y `[unverified]` visibles — es el activo que la actualización de marzo de 2026 premia (§1).  
2. **Publicar también lo que contradice al producto.** Es la parte que ningún competidor hace y la que sostiene la señal de Trustworthiness (§1, §2).  
3. **La historia del dueño es contenido de primer nivel, no una página «acerca de».** Es la única fuente de Experience del sitio (§2).  
4. **JSON‑LD con `inLanguage` por versión**, estructura idéntica entre locales y contenido traducido dentro (§3).  
5. **`hreflang` recíproco entre los siete locales más `x-default`**, complementado —no sustituido— por el esquema (§3, §4).  
6. **`es-MX` y `es-ES` son dos páginas distintas donde haya notación matemática**, no una con dos etiquetas (§4).  
7. **Auditor determinista que valide el JSON‑LD y la reciprocidad de `hreflang`** en cada commit, y otro que verifique que el esquema coincide con lo visible (§3) — la regla cuyo incumplimiento invalida todo el marcado.  
8. **WCAG 2.2 AA como requisito de publicación del sitio**, no solo de la app (§5).  
9. **Atribución de dos partes: proyecto de Ignia, infraestructura de Cloudflare** (§6).  
10. **La página de arquitectura es contenido, no un pie de página.** Explicar por qué RPC nativo en vez de gRPC, por qué HTTP/3, por qué los intentos no van a D1 — es material técnico citable (`mc-47`).  
11. **Un auditor de locale por idioma revisa también el sitio**, no solo la app: la notación matemática mal localizada en una página pública es un error citable por terceros.  
12. **No reclamar resultados de aprendizaje** hasta tener el estudio propio; el plan maestro §14 ya lo prohíbe, y en un sitio que presume rigor, una sola afirmación no sustentada cuesta más que en uno que no lo presume.  

## Open questions for the project owner

1. ¿Las 45 investigaciones se publican en los siete locales o solo en `en` y `es-MX`? Traducir 152.000 palabras × 6 es un **coste** real; publicarlas solo en dos y declarar `hreflang` correcto es defendible.  
2. ¿El sitio vive en `math.kilowatto.com` junto a la app, o en un dominio propio? Afecta autoridad de dominio y la separación entre lo público y lo autenticado.  
3. ¿Quién firma las investigaciones como autor? La Authoritativeness mejora con autoría atribuida y verificable, y hoy los documentos no tienen firma.  
4. ¿Se publica también `decisions.md` — incluidas las decisiones que se revirtieron, como D-001 y D-010? Es el nivel máximo de transparencia y también el más expuesto.  
5. ¿Hay apetito por buscar citas entrantes activamente (investigadores, prensa educativa, comunidad edtech), o la estrategia es puramente orgánica pasiva?  

## Sources

1. Digital Applied, “E‑E‑A‑T in March 2026: Google Rewards Experience Content” — https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide — fuente del hallazgo sobre investigación original como activo de mayor valor, del estudio Wellows de 2.400 citas (2,3×), y de la pérdida de 40-70 % de tráfico.  
2. Keywords Everywhere, “Google E‑E‑A‑T Guidelines: an Overview (2026 Playbook)” — https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/ — fuente de la definición de las cuatro señales y de la fecha de adición de Experience.  
3. Better i18n, “Multilingual Schema Markup: Structured Data for International SEO” — https://better-i18n.com/en/blog/multilingual-schema-markup/  
4. Linguise, “Using schema markup and structured data for multilingual websites SEO” — https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/  
5. SearchX, “Structured Data For Multilingual SEO: Top 7 Tips” — https://searchxpro.com/structured-data-for-multilingual-seo-top-7-tips/ — fuente de la regla de coincidencia esquema‑página.  
6. Ignia Cloud, sitio oficial — https://ignia.cloud — fuente de la descripción, lema, servicios, SLA y alianzas.  
7. Investigación interna: `mc-34-i18n-math-notation.md` (los siete locales y por qué no son cinco), `mc-38-accessibility-learning-differences.md` (WCAG 2.2 AA y la Ley Europea de Accesibilidad), `mc-14-competitive-products.md` (la ausencia de evidencia publicada en los competidores), `mc-47-stack-protocols-performance.md` (el contenido técnico citable), `mc-32-cloudflare-architecture.md` (qué corre dónde, para la atribución de §6).  

**Calidad de fuentes.** Ninguna fuente de este documento es primaria de Google: [1]‑[5] son publicaciones de agencias y consultorías de SEO, que tienen interés comercial en que el SEO parezca decisivo. Las cifras concretas —2,3×, 40-70 %, el estudio Wellows de 2.400 citas— **deben tratarse como no verificadas contra fuente primaria** y confirmarse en la documentación de Google Search Central antes de usarse en material público o para justificar presupuesto. La orientación estructural (JSON‑LD preferido, `inLanguage`, esquema no sustituye `hreflang`, el esquema debe coincidir con la página) es consistente entre las cinco fuentes y con la documentación pública de Google, y es la parte más confiable. La fuente [6] es primaria del propio Ignia.
