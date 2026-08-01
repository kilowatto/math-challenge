# Construir y operar un banco de 2.500 ítems de matemáticas: lo que hacen de verdad los productos de aprendizaje

> Investigación Math Challenge — 2026-07-31 — tema 40

## Resumen ejecutivo (ES)

Los productos educativos reales rara vez escriben cada ítem a mano. IXL publica ~1.219 competencias de matemáticas para preescolar–8.º grado [1] — no ítems, sino *habilidades*, cada una respaldada por generación dinámica de preguntas. Khan Academy usa Perseus, su editor/renderizador de ejercicios [2], para mezclar autoría humana con variación paramétrica. WeBWorK muestra el extremo opuesto: una plantilla en su lenguaje PG produce un número ilimitado de variantes numéricas [5]. La investigación 2023–2026 sobre generación de ítems con LLM es clara y modesta a la vez: los modelos generan distractores matemáticamente válidos pero **no anticipan bien los errores reales de los estudiantes** [arXiv 2404.02124] — por eso este banco no puede automatizar la "explicación del error común" sin revisión humana.

Para 2.500 ítems en 5 idiomas, el plan reparte el trabajo así: ~40 % generado por plantillas paramétricas (fuerte en K‑8, débil en posgrado/doctorado), ~29 % redactado por LLM con revisión humana obligatoria, y ~31 % escrito a mano por especialistas (dominante en los niveles más altos). El **coste** de API del LLM para redactar y traducir es, con aritmética mostrada abajo, del orden de cientos de dólares — un error de redondeo frente al **coste** humano (SME, editorial, traducción, revisión psicométrica), estimado en el orden de mil días‑persona. QTI 3.0 es adoptable de forma incremental (su propio modelo de conformidad lo permite) [3][4]; no hace falta implementarlo entero para el MVP.

## Executive summary (EN)
Los productos de aprendizaje reales rara vez escriben a mano cada ítem. IXL publica ~1.219 habilidades matemáticas para PreK–8 [1] — no ítems, sino *habilidades*, cada una respaldada por generación dinámica de preguntas. Khan Academy usa Perseus, su propio editor/renderizador de ejercicios [2], para combinar la autoría humana con variación paramétrica. WeBWorK es el extremo limpio: un problema en su lenguaje PG puede producir instancias numéricas aleatorias ilimitadas [5]. La investigación 2023–2026 sobre generación de ítems con LLM es clara y modesta a la vez: los modelos redactan distractores matemáticamente válidos pero **no son buenos anticipando las verdaderas ideas erróneas de los estudiantes** [arXiv 2404.02124] — la razón por la que este banco no puede automatizar el paso de la «common-error explanation» sin revisión humana.

Para 2.500 ítems en 5 idiomas, el plan a continuación reparte el trabajo aproximadamente 40 % plantillas parametrizadas (fuertes en K‑8, débiles en graduate/PhD), 29 % redactados por LLM con revisión humana obligatoria, y 31 % escritos a mano por especialistas (dominantes en la parte superior de la escalera). El coste de la API de LLM para redactar y traducir, con la aritmética mostrada a continuación, está en el orden de cientos de dólares — un error de redondeo frente al coste en horas‑hombre (SME, editorial, traducción, revisión psicométrica), estimado en aproximadamente mil días‑persona. QTI 3.0 es adoptable incrementalmente (su propio modelo de conformidad lo permite) [3][4]; el MVP no necesita la especificación completa.

## Findings

### How many items do real products actually have

Published, verifiable counts are scarcer than marketing copy suggests. IXL's
Spanish‑locale math page states skill counts per grade band — Preescolar 73,
1.º 117, 2.º 127, 3.º 183, 4.º 130, 5.º 125, 6.º 112, 7.º 108, 8.º 144 —
summing to **1.219 destrezas en 9 niveles de curso** [1]. That is *destrezas*, not
ítems: each destreza is a template‑like category IXL generates practice
questions against dynamically, so the question count per destreza is unbounded
the same way a WeBWorK problem is. No comparably precise total was found this
session for Khan Academy's exercise count, Brilliant's problem count, or
Kumon's worksheet count — those figures circulate in marketing and secondary
sources, but no primary page fetched this session stated a number, so they
are omitted rather than guessed. Wikipedia's Item Bank article describes the
lifecycle metadata item banks track (status: new/pilot/active/retired; usage
history) [item bank wiki] but gives no concrete size for any named program.

### Parameterized generation vs. handwritten authoring

Khan Academy's Perseus is its own repository's description of "Khan Academy's
exercise question editor and renderer" — a system for authoring, rendering,
and evaluating exercise responses, MIT‑licensed but closed to external
contributions [2]. WeBWorK's PG ("Problem Generation") language is a
Perl‑based authoring format built for randomisation: instructors write one
problem, and parameterisation lets each student session draw different
numeric values from the same template, producing an effectively unlimited
pool of ítems from a single authored source [5] — the concrete "one template,
many ítems" pattern this project needs for K‑8 arithmetic and early algebra.
Brilliant.org describes its approach as hybrid: content is "hand‑crafted" by
a team spanning "math PhDs to engineers and designers," while machine
learning generates "on‑the‑fly visual and interactive" personalisation
layered on top — and Brilliant states new review‑set content is
"human‑review[ed] everything," rolled out gradually for that reason
[brilliant about page]. The pattern across all three: templates and dynamic
generation multiply *volume*, but a human still designs the template and its
constraints.

Wikipedia's Automatic Item Generation (AIG) article frames the method: "a
test specialist creates a template called an item model; then, a computer
algorithm is developed to generate test ítems" — algorithms then "generate
families of ítems from a smaller set of parent item models," which "can
generate many more ítems in a given amount of time than a human test
specialist," reducing cost [AIG wiki]. No article gave a concrete
ítems‑per‑template multiplier or cost‑reduction percentage this session.

### LLM‑generated items: real but limited (2023–2026 research)

A concrete, citable data point: Feng, Lee, McNichols, Scarlatos, Smith,
Woodhead, Otero Ornelas, and Lan, "Exploring Automated Distractor Generation
for Math Multiple‑choice Questions via Large Language Models" (arXiv
2404.02124), tests in‑context learning and fine‑tuning for generating
multiple‑choice distractors on a real‑world math dataset. Its headline
finding is exactly the constraint this project's schema design has to
respect: "although LLMs can generate some mathematically valid distractors,
they are less adept at anticipating common errors or misconceptions among
real students" [arXiv 2404.02124]. No numeric expert‑review pass rate was in
the abstract text retrieved this session, so none is quoted — but the
qualitative finding is load‑bearing: an LLM can write a plausible‑looking
wrong answer, but whether it matches what a real student would actually
think is a harder problem current models under‑perform at. Duolingo's
research page lists "Jump‑Starting Item Parameters for Adaptive Language
Tests" (McCarthy et al., EMNLP 2021) [Duolingo research], addressing the
adjacent cold‑start problem of estimating difficulty for freshly generated
ítems before real response data exists — a problem this bank faces for every
new ítem on day one.

### The ítem QA workflow and psychometric screening

Classical Test Theory (CTT) defines two per‑ítem statistics any production
pipeline needs before trusting an ítem: the **p‑valor**, "the proportion of
examinees responding in the keyed direction" (difficulty — higher p means
easier), and **discriminación del ítem**, computed via correlación punto‑biserial
between an ítem's score and the total test score, used "to evaluate ítems and
diagnose possible issues, such as a confusing distractor"
[CTT wiki; point‑biserial wiki]. Neither article stated a numeric threshold
for "good enough" discrimination or difficulty, so none is asserted here.
What *is* documented: Computerised Adaptive Testing states "all ítems must be
pretested with a large enough sample to obtain stable ítem statistics. This
sample may be required to be as large as **1.000 examinados**" [CAT wiki] —
the only quantitative sample‑size figure surfaced this session, and a useful
upper bound for how conservative real programmes can be. Item Bank describes
the lifecycle metadata mature systems track: "item status (e.g., new, pilot,
active, retired)" and "item history (e.g., usage date(s) and reviews)" [item
bank wiki] — directly informing the `status` field below.

### Fixing an ítem after thousands of answers already reference it

No source addressed versioning directly, but the lifecycle‑status pattern
[item bank wiki] implies the answer: an ítem with response data attached is
never edited in place — statistics are computed against the exact wording
students answered, and silently changing it invalidates every prior
response's contribution. The safe pattern: create a new version, retire the
old one (`status: retired`, never deleted), start a fresh statistics window.

### QTI 3.0 — is it worth it for a startup

1EdTech's QTI 3.0 is the standard for "exchanging assessment ítems, tests,
usage data, and results reporting between different applications,"
consolidating earlier QTI versions and the APIP accessibility standard, with
native Computer Adaptive Testing and Portable Custom Interaction support,
and built‑in Section 508 / WCAG 2.1 AA accessibility [3]. Its own
implementation guidance is explicit that conformance is **modular**: "the
needs of the assessment programme generally dictate which of the many QTI 3
features are used," and conformance/certification is a separate document
precisely so organisations can adopt a subset [4]. A minimal path — core
XML/XSD validation, basic choice/text‑entry interactions, response‑processing
templates, standard packaging, core accessibility markup — works without
touching adaptive testing or Portable Custom Interactions [4]. QTI 3.0 is
not all‑or‑nothing: deferring CAT/PCI while gaining interoperability and
accessibility scaffolding for the MVP's ítem types is a genuine option.

### Localization workflow across 5 languages

No source described a math‑specific translation workflow, so this is
derived reasoning. The fact worth carrying from the AIG/WeBWorK material:
translation cost scales with *distinct authored content*, not generated ítem
count. A template's fixed text ("What is __ + __?") is translated once per
language and covers every numeric variant it ever generates, while a
hand‑written or LLM‑drafted ítem's full text is translated per ítem — the
single biggest lever in the cost model below.

### Real cost‑per‑ítem figures from the assessment industry

None found and independently verified this session. Fetch attempts at AIR,
NCIEA, and ETS resource pages returned 404s or no cost figures; ETS's
research homepage stated only "11,9 K publicaciones" exist, no cost figure
[ETS research page]. Industry blogs commonly cite per‑ítem costs in the low
thousands of dollars — but since no primary source was retrieved live this
session, that figure is **not** used below. The cost model instead derives
entirely from stated LLM API pricing and explicit, labelled person‑day
assumptions.

## Tabla de referencias comparativas

| Producto / sistema | Recuento de ítems o habilidades | Generado o manuscrito | Fuente |
|---|---|---|---|
| IXL (matemáticas, PreK–8) | ~1.219 habilidades (9 bandas de curso) | Categorías de habilidades curadas; preguntas generadas dinámicamente por habilidad | [1] |
| Khan Academy (Perseus) | No verificado esta sesión | Híbrido: definiciones de ejercicios creadas por humanos y renderizadas/variadas por Perseus | [2] |
| WeBWorK (lenguaje PG) | Gran biblioteca; recuento no verificado | Basado en plantillas: un problema PG produce instancias aleatorias ilimitadas | [5] |
| Brilliant.org | No declarado públicamente | Híbrido: base artesanal + ML para personalización en tiempo real, revisión humana | [brilliant about] |
| Duolingo (investigación de calibración de ítems) | N/D — pruebas de idiomas | Ítems generados algorítmicamente; calibración de dificultad asistida por ML para ítems de arranque en frío | [Duolingo research] |
| NWEA MAP Growth (CAT) | No verificado esta sesión | Banco CAT; muestras de pre‑prueba citadas de hasta 1.000 examinados para estadísticas estables | [CAT wiki] |
| Práctica general de AIG | No hay cifra universal | Especialistas en pruebas crean un “modelo de ítem”; el algoritmo genera familias de ítems a partir de él | [AIG wiki] |

## Plan MVP concreto de 2.500 ítems

**Bandas de nivel y recuento de ítems** (pirámide — más ítems donde hay más usuarios):

| Banda | Ítems |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Pregrado (intro) | 350 |
| Pregrado avanzado / Máster | 150 |
| Doctorado / investigación | 100 |
| **Total** | **2.500** |

**Distribución por origen, por banda** (la proporción de plantillas disminuye y la manuscrita aumenta a medida que sube el nivel — las plantillas tienen dificultades con contenido avanzado basado en pruebas, y el matiz de conceptos erróneos importa más donde los LLM son más débiles):

| Banda | Plantilla % / ítems | Redactado por LLM % / ítems | Manuscrito % / ítems |
|---|---|---|---|
| K–2 | 70 % / 210 | 20 % / 60 | 10 % / 30 |
| 3–5 | 60 % / 240 | 25 % / 100 | 15 % / 60 |
| 6–8 | 50 % / 225 | 30 % / 135 | 20 % / 90 |
| 9–10 | 35 % / 140 | 35 % / 140 | 30 % / 120 |
| 11–12 | 30 % / 105 | 30 % / 105 | 40 % / 140 |
| Pregrado | 20 % / 70 | 30 % / 105 | 50 % / 175 |
| Avanzado/Máster | 10 % / 15 | 30 % / 45 | 60 % / 90 |
| Doctorado | 5 % / 5 | 25 % / 25 | 70 % / 70 |
| **Total** | **1.010 (40,4 %)** | **715 (28,6 %)** | **775 (31,0 %)** |

**La puerta de revisión** (cada ítem pasa por todas las etapas; solo varía el esfuerzo por fase): autoría de SME / diseño de plantilla → pase editorial → verificación de exactitud matemática → revisión de accesibilidad (texto alternativo, notación segura para lectores de pantalla) → traducción (4 lenguas objetivo) → piloto (recopilación de respuestas reales) → cribado psicométrico (promocionar a `active` solo cuando el recuento de respuestas es suficiente — implicación 4). Los ítems manuscritos entran en “autoría de SME”; los redactados por LLM entran con un borrador en mano pero atraviesan todas las fases posteriores; los ítems generados por plantilla omiten la autoría por ítem, pero la *plantilla* pasa por la misma puerta una única vez.

**Esquema JSON del ítem — campos obligatorios:**

```
item_id, version, status, level_band, topic_tag, source_type, template_id,
languages{locale: {stem, choices, correct_answer, worked_solution,
  misconceptions[]}}, stem_canonical, choices, correct_answer,
worked_solution_canonical, misconceptions[{trigger_answer, explanation,
  remediation_hint}], difficulty_estimate_initial, irt_parameters{a, b, c,
  n_responses, last_calibrated_at}, p_value, point_biserial,
accessibility_metadata{alt_text, mathml, contrast_notes}, media[],
authoring_metadata{author, reviewer, created_at, reviewed_at, notes},
qti_export_ref, curriculum_tags[], retirement_reason
```

**Esfuerzo en días‑persona** (cada cifra es una estimación etiquetada; se muestra la aritmética):

- Diseño de plantillas: 50 plantillas (≈20 variantes/plantilla que cubren los 1.010 ítems de plantilla) × 0,5 día = **25 días**; motor de parametrización de una sola vez **≈15 días** (no por ítem).
- Revisión/corrección de ítems redactados por LLM: 715 × 0,15 día = **≈107 días**.
- Autoría manuscrita: 615 ítems (K‑2–pregrado, 0,5 día cada uno) + 160 (Avanzado+Doctorado, 1,0 día cada uno, tiempo de especialista más escaso) = **≈468 días**.
- Revisión de traducción (revisión puntual de SME bilingüe de la traducción LLM, sin re‑traducción independiente): 50 plantillas × 4 lenguas = 200 unidades, más 1.490 ítems × 4 lenguas = 5.960 → **6.160 unidades** × 0,05 día = **≈308 días**.
- Pase editorial + accesibilidad, uniforme: 2.500 × 0,05 día = **≈125 días**.
- Revisión psicométrica por lotes: 2.500 / 50 por lote × 0,1 día = **≈5 días** (excluye el tiempo de calendario esperando respuestas del piloto — restricción de calendario, no coste de esfuerzo).

**Total: 25+15+107+468+308+125+5 ≈ 1.053 días‑persona**, aproximadamente 4,2 años‑persona. Un equipo de 5 personas (2 expertos en matemáticas, 1 responsable de localización, 1 editor/psicométrico, 1 ingeniero) lo completa en ≈1.053÷5 ≈ **210 días laborables**, aproximadamente 10 meses — una estimación derivada, no una cifra citada de la industria.

**Coste estimado de LLM para redactar + traducir** (tarifa estándar de Claude Sonnet 5: 3,00 $ entrada / 15,00 $ salida por millón de tokens):

- Ítems redactados por LLM, primer borrador (~1.500 tokens de entrada + ~800 tokens de salida por ítem): (1.500×3 $ + 800×15 $)/1.000.000 = **0,0165 $/ítem** × 715 ≈ **12 $**.
- Ítems manuscritos, asistencia LLM solo para redactar conceptos erróneos (mismo perfil de tokens): 775 × 0,0165 $ ≈ **13 $**.
- Asistencia en autoría de plantillas (~5.000 tokens de entrada + 2.000 tokens de salida por plantilla): 0,045 $/plantilla × 50 ≈ **2 $**.
- Traducción (~800 tokens de entrada + ~900 tokens de salida por unidad): 0,0159 $/unidad × 6.160 unidades ≈ **98 $**.

**Total bruto de una pasada ≈ 125 $**. Un multiplicador de seguridad de 5× para iteraciones realistas (reintentos de validación, regeneración provocada por revisiones, Opus 5 para las bandas más difíciles) da **≈ 500–700 $** en total para todo el proceso de redacción y traducción — aún bajo 1.500 $ duplicado para contingencias, tres órdenes de magnitud por debajo del coste laboral en días‑persona. La caché de prompts reduciría esto aún más, pero no se contabiliza aquí.

## Design implications

1. Utilizar plantillas parametrizadas para aritmética de K‑8 y álgebra inicial — una plantilla al estilo WeBWorK que genere variantes numéricas ilimitadas [5] es la palanca de mayor impacto en este plan.  
2. Reservar el presupuesto de autoría manuscrita para los niveles de 11‑12 hasta doctorado, donde las plantillas reciben su menor proporción (30 % bajando a 5 %) porque el contenido basado en pruebas resiste la aleatorización segura.  
3. Traducir las plantillas, no las instancias generadas: 200 unidades de traducción cubren 1.010 ítems de plantilla frente a 5.960 unidades para ítems puntuales — la palanca de localización más importante del modelo.  
4. Tratar los valores *p* y la discriminación punto‑biserial como provisionales hasta que se acumulen respuestas; la literatura de CAT cita muestras de hasta 1.000 examinados para obtener estadísticas de preprueba estables [CAT wiki] — no promover automáticamente un ítem a `active` por debajo de un mínimo claramente indicado (pregunta abierta 4).  
5. Versionar los ítems de forma inmutable. Nunca editar un ítem con respuestas asociadas — crear una nueva versión, retirar la anterior (`status: retired`, nunca eliminada), replicando el ciclo nuevo/piloto/activo/retirado documentado para los bancos de ítems en general [item bank wiki].  
6. Adoptar QTI 3.0 de forma incremental — su modelo de conformidad es explícitamente modular [4]; implementar las interacciones principales y los metadatos de accesibilidad para el MVP y posponer el soporte de CAT/PCI.  
7. Construir la puerta de revisión como una máquina de estados explícita que coincida con el campo `status`: borrador → editorial → revisión matemática → accesibilidad → traducción → piloto → cribado psicométrico → active/retired.  
8. Presupuestar el coste de la API de LLM como insignificante (cientos de dólares) en comparación con el coste de la revisión humana (cientos de miles, según el cálculo de person‑day anterior) — la verdadera limitación son el tiempo de los expertos SME y de los traductores, no los tokens.  
9. Dado que la investigación 2023–2026 muestra que los LLM generan distractores matemáticamente válidos pero ciegos a conceptos erróneos [arXiv 2404.02124], exigir una revisión humana de conceptos erróneos en cada ítem redactado o asistido por LLM — nunca lanzar una explicación de concepto erróneo de LLM sin revisar a Larry.  
10. Esperar que el ROI de las plantillas caiga bruscamente cerca de la cúspide de la pirámide de niveles: el coste de diseño por plantilla es aproximadamente fijo sin importar la dificultad, pero una plantilla de doctorado produce muchas menos variantes utilizables con seguridad que una de K‑2 — el plan ya reduce la proporción de plantillas a medida que sube el nivel.  
11. Secuenciar la traducción *después* de la revisión matemática y de accesibilidad, no antes — traducir contenido que después falla la revisión técnica desperdicia tiempo del traductor.  
12. Cachear el texto compartido de instrucciones/esquema/guía de estilo entre las llamadas de redacción y traducción; 715+775+6.160 llamadas comparten un prefijo grande y estable, por lo que el cacheado de prompts puede reducir aún más el coste real de LLM por debajo de la estimación.  
13. Planificar el control de exposición de ítems una vez que la plataforma admita la entrega adaptativa — incluso un banco de 2.500 ítems se beneficia del principio de control de exposición que los sistemas CAT usan para evitar mostrar en exceso los ítems más populares [CAT wiki].  
14. Tratar cada día‑esfuerzo y cifra de coste aquí como una estimación a validar contra un piloto, no como un objetivo fijo — ninguna fuente proporcionó un multiplicador verificado de ítems por plantilla ni un coste por ítem para contenido matemático específicamente; los números 20×‑por‑plantilla y $/ítem son supuestos modelados, señalados como tales.  

## Open questions for the project owner

1. ¿Qué tarifa diaria cargada deberíamos asumir para el tiempo de SME/traductor/editor, para convertir los ~1.053 person‑days anteriores en una cifra presupuestaria?  
2. ¿Son 2.500 ítems un objetivo firme o un umbral mínimo, con margen reservado para temas que requieran más ítems una vez que los datos piloto regresen?  
3. ¿Cuál de los 4 idiomas no anglosajones puede usar traducción mediante LLM más revisión puntual (según el modelo anterior), y cuál necesita traducción humana independiente desde el primer día?  
4. ¿Qué recuento mínimo de respuestas debería ser la condición para promover a `active` — la regla empírica tradicional de teoría clásica de tests (a menudo ~30), o el rango más conservador de ~200–1.000 que la literatura de CAT cita para estadísticas estables [CAT wiki]?  
5. ¿Debería la puerta de revisión bloquear la exportación QTI 3.0 en el MVP, o posponerlo a un hito de interoperabilidad posterior al MVP?  
6. Los niveles de Máster/Doctorado conllevan la menor proporción de plantillas y el mayor coste por ítem — ¿deberíamos presupuestar un SME contratista especializado solo para esas dos franjas?  
7. ¿Deben las explicaciones de conceptos erróneos de Larry redactarse una vez en inglés y traducirse, o elaborarse independientemente por idioma (p. ej., confusión entre coma decimal y punto en ES/FR/DE)?  

## Sources

1. [IXL — Math (Spanish locale, skill counts by grade)](https://la.ixl.com/math)  
2. [Khan/perseus — Khan Academy's exercise question editor and renderer](https://github.com/Khan/perseus)  
3. [1EdTech — QTI standards overview](https://www.1edtech.org/standards/qti)  
4. [1EdTech — QTI 3.0 implementation/conformance guidance](https://www.imsglobal.org/spec/qti/v3p0/impl)  
5. [Wikipedia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)  
6. [Wikipedia — Automatic item generation](https://en.wikipedia.org/wiki/Automatic_item_generation)  
7. [Wikipedia — Classical test theory](https://en.wikipedia.org/wiki/Classical_test_theory)  
8. [Wikipedia — Point-biserial correlation coefficient](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)  
9. [Wikipedia — Item bank](https://en.wikipedia.org/wiki/Item_bank)  
10. [Wikipedia — Computerized adaptive testing](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)  
11. [Wikipedia — Item response theory](https://en.wikipedia.org/wiki/Item_response_theory)  
12. [Wikipedia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)  
13. [Duolingo Research — publications page](https://research.duolingo.com/)  
14. [arXiv 2404.02124 — Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)  
15. [Brilliant.org — About](https://brilliant.org/about/)  
16. [ETS Research Institute — homepage](https://www.ets.org/research.html)
