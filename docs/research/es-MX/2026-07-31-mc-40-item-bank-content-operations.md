# Construir y operar un banco de 2,500 ítems de matemáticas: qué hacen los productos de aprendizaje reales
> Investigación Math Challenge — 2026-07-31 — tema 40

## Resumen ejecutivo (ES)

Los productos educativos reales rara vez escriben cada ítem a mano. IXL
publica ~1,219 competencias de matemáticas para preescolar–8º grado [1] — no
ítems, sino *habilidades*, cada una respaldada por generación dinámica de
preguntas. Khan Academy usa Perseus, su editor/renderizador de ejercicios
[2], para mezclar autoría humana con variación paramétrica. WeBWorK muestra
el extremo opuesto: una plantilla en su lenguaje PG produce un número
ilimitado de variantes numéricas [5]. La investigación 2023-2026 sobre
generación de ítems con LLM es clara y modesta a la vez: los modelos generan
distractores matemáticamente válidos pero **no anticipan bien los errores
reales de los estudiantes** [arXiv 2404.02124] — por eso este banco no puede
automatizar la "explicación del error común" sin revisión humana.

Para 2,500 ítems en 5 idiomas, el plan reparte el trabajo así: ~40% generado
por plantillas paramétricas (fuerte en K-8, débil en posgrado/doctorado),
~29% redactado por LLM con revisión humana obligatoria, y ~31% escrito a mano
por especialistas (dominante en los niveles más altos). El costo de API del
LLM para redactar y traducir es, con aritmética mostrada abajo, del orden de
cientos de dólares — un error de redondeo frente al costo humano (SME,
editorial, traducción, revisión psicométrica), estimado en el orden de mil
días-persona. QTI 3.0 es adoptable de forma incremental (su propio modelo de
conformidad lo permite) [3][4]; no hace falta implementarlo entero para el
MVP.

## Executive summary (EN)

Real learning products rarely hand-write every item. IXL publishes ~1,219
math skills for PreK–8 [1] — not items, but *skills*, each backed by dynamic
question generation. Khan Academy uses Perseus, its own exercise
editor/renderer [2], to blend human authoring with parametric variation.
WeBWorK is the clean extreme: one problem in its PG language can produce
unlimited randomized numeric instances [5]. 2023–2026 research on LLM item
generation is clear and modest at once: models draft mathematically valid
distractors but are **not good at anticipating real student misconceptions**
[arXiv 2404.02124] — the reason this bank cannot automate the
"common-error explanation" step without human review.

For 2,500 items in 5 languages, the plan below splits work roughly 40%
parameterized templates (strong at K-8, weak at graduate/PhD), 29%
LLM-drafted with mandatory human review, and 31% handwritten by specialists
(dominant at the top of the ladder). LLM API cost for drafting and
translating, with arithmetic shown below, is on the order of hundreds of
dollars — a rounding error against human-hour cost (SME, editorial,
translation, psychometric review), estimated at roughly a thousand
person-days. QTI 3.0 is adoptable incrementally (its own conformance model
permits this) [3][4]; the MVP does not need the full spec.

## Hallazgos

### Cuántos ítems tienen en realidad los productos reales

Los conteos publicados y verificables son más escasos de lo que sugiere el
material de mercadeo. La página de matemáticas de IXL en locale español
declara conteos de habilidades por banda de grado — Preescolar 73, 1° 117,
2° 127, 3° 183, 4° 130, 5° 125, 6° 112, 7° 108, 8° 144 — sumando **1,219
habilidades en 9 niveles de grado** [1]. Eso son *habilidades*, no ítems:
cada habilidad es una categoría tipo-plantilla contra la que IXL genera
preguntas de práctica dinámicamente, así que el conteo de preguntas por
habilidad no tiene límite de la misma forma que un problema de WeBWorK no lo
tiene. No se encontró en esta sesión un total comparablemente preciso para el
conteo de ejercicios de Khan Academy, el conteo de problemas de Brilliant, ni
el conteo de hojas de trabajo de Kumon — esas cifras circulan en marketing y
fuentes secundarias, pero ninguna página primaria consultada en esta sesión
declaró un número, así que se omiten en vez de adivinarse. El artículo de
Wikipedia sobre Item Bank describe los metadatos de ciclo de vida que
rastrean los bancos de ítems (estado: nuevo/piloto/activo/retirado; historial
de uso) [item bank wiki] pero no da un tamaño concreto para ningún programa
nombrado.

### Generación paramétrica vs. autoría escrita a mano

Perseus de Khan Academy es, según la descripción de su propio repositorio,
"Khan Academy's exercise question editor and renderer" — un sistema para
autoría, renderizado y evaluación de respuestas a ejercicios, licenciado bajo
MIT pero cerrado a contribuciones externas [2]. El lenguaje PG ("Problem
Generation") de WeBWorK es un formato de autoría basado en Perl construido
para la aleatorización: los instructores escriben un problema, y la
parametrización permite que cada sesión de estudiante extraiga distintos
valores numéricos de la misma plantilla, produciendo un banco de ítems
efectivamente ilimitado a partir de una sola fuente autorada [5] — el patrón
concreto de "una plantilla, muchos ítems" que este proyecto necesita para
aritmética K-8 y álgebra temprana. Brilliant.org describe su enfoque como
híbrido: el contenido está "hand-crafted" por un equipo que abarca desde
"math PhDs to engineers and designers", mientras el aprendizaje automático
genera "on-the-fly visual and interactive" personalización superpuesta — y
Brilliant declara que el contenido nuevo de conjuntos de repaso "human-
review[ed] everything", desplegado gradualmente por esa razón [brilliant
about page]. El patrón en los tres: las plantillas y la generación dinámica
multiplican el *volumen*, pero un humano sigue diseñando la plantilla y sus
restricciones.

El artículo de Wikipedia sobre Generación Automática de Ítems (AIG) enmarca
el método: "a test specialist creates a template called an item model; then,
a computer algorithm is developed to generate test items" — los algoritmos
luego "generate families of items from a smaller set of parent item models",
lo cual "can generate many more items in a given amount of time than a human
test specialist", reduciendo el costo [AIG wiki]. Ningún artículo dio un
multiplicador concreto de ítems-por-plantilla ni un porcentaje de reducción
de costo en esta sesión.

### Ítems generados por LLM: reales pero limitados (investigación 2023–2026)

Un dato concreto y citable: Feng, Lee, McNichols, Scarlatos, Smith, Woodhead,
Otero Ornelas y Lan, "Exploring Automated Distractor Generation for Math
Multiple-choice Questions via Large Language Models" (arXiv 2404.02124),
prueba aprendizaje en contexto y ajuste fino (fine-tuning) para generar
distractores de opción múltiple en matemáticas sobre un conjunto de datos
real. Su hallazgo principal es exactamente la restricción que el diseño de
esquema de este proyecto debe respetar: "although LLMs can generate some
mathematically valid distractors, they are less adept at anticipating common
errors or misconceptions among real students" [arXiv 2404.02124]. Ninguna
tasa numérica de aprobación en revisión experta apareció en el texto del
resumen recuperado en esta sesión, así que no se cita ninguna — pero el
hallazgo cualitativo es determinante: un LLM puede escribir una respuesta
incorrecta que se ve plausible, pero si coincide con lo que un estudiante
real pensaría en realidad es un problema más difícil en el que los modelos
actuales rinden por debajo. La página de investigación de Duolingo lista
"Jump-Starting Item Parameters for Adaptive Language Tests" (McCarthy et al.,
EMNLP 2021) [Duolingo research], que aborda el problema adyacente de arranque
en frío de estimar la dificultad de ítems recién generados antes de que
existan datos de respuesta reales — un problema que este banco enfrenta para
cada ítem nuevo el primer día.

### El flujo de control de calidad del ítem y el filtro psicométrico

La Teoría Clásica de los Tests (CTT) define dos estadísticas por ítem que
cualquier canal de producción necesita antes de confiar en un ítem: el
**valor p**, "the proportion of examinees responding in the keyed direction"
(dificultad — un p más alto significa más fácil), y la **discriminación del
ítem**, calculada vía correlación punto-biserial entre el puntaje de un ítem
y el puntaje total del test, usada "to evaluate items and diagnose possible
issues, such as a confusing distractor" [CTT wiki; point-biserial wiki].
Ningún artículo declaró un umbral numérico de "suficientemente bueno" para
discriminación o dificultad, así que no se afirma ninguno aquí. Lo que *sí*
está documentado: Computerized Adaptive Testing declara que "all items must
be pretested with a large enough sample to obtain stable item statistics.
This sample may be required to be as large as **1,000 examinees**" [CAT
wiki] — la única cifra cuantitativa de tamaño de muestra que surgió en esta
sesión, y un límite superior útil para saber qué tan conservadores pueden
ser los programas reales. Item Bank describe los metadatos de ciclo de vida
que rastrean los sistemas maduros: "item status (e.g., new, pilot, active,
retired)" e "item history (e.g., usage date(s) and reviews)" [item bank
wiki] — informando directamente el campo `status` de abajo.

### Corregir un ítem después de que miles de respuestas ya lo referencian

Ninguna fuente abordó el versionado directamente, pero el patrón de estado de
ciclo de vida [item bank wiki] implica la respuesta: un ítem con datos de
respuesta adjuntos nunca se edita en el lugar — las estadísticas se calculan
contra la redacción exacta que respondieron los estudiantes, y cambiarla en
silencio invalida la contribución de cada respuesta previa. El patrón
seguro: crear una nueva versión, retirar la antigua (`status: retired`,
nunca eliminada), empezar una ventana de estadísticas fresca.

### QTI 3.0 — ¿vale la pena para una startup?

QTI 3.0 de 1EdTech es el estándar para "exchanging assessment items, tests,
usage data, and results reporting between different applications",
consolidando versiones anteriores de QTI y el estándar de accesibilidad
APIP, con soporte nativo para Computer Adaptive Testing y Portable Custom
Interaction, y accesibilidad Sección 508 / WCAG 2.1 AA integrada [3]. Su
propia guía de implementación es explícita en que la conformidad es
**modular**: "the needs of the assessment program generally dictate which of
the many QTI 3 features are used", y la conformidad/certificación es un
documento aparte precisamente para que las organizaciones puedan adoptar un
subconjunto [4]. Un camino mínimo — validación XML/XSD del núcleo,
interacciones básicas de opción/entrada de texto, plantillas de
procesamiento de respuesta, empaquetado estándar, marcado de accesibilidad
central — funciona sin tocar pruebas adaptativas ni Portable Custom
Interactions [4]. QTI 3.0 no es todo-o-nada: diferir CAT/PCI mientras se
gana interoperabilidad y andamiaje de accesibilidad para los tipos de ítem
del MVP es una opción genuina.

### Flujo de localización en 5 idiomas

Ninguna fuente describió un flujo de traducción específico para matemáticas,
así que esto es razonamiento derivado. El dato que vale la pena llevarse del
material de AIG/WeBWorK: el costo de traducción escala con el *contenido
autorado distinto*, no con el conteo de ítems generados. El texto fijo de
una plantilla ("¿Cuánto es __ + __?") se traduce una vez por idioma y cubre
cada variante numérica que genere alguna vez, mientras el texto completo de
un ítem escrito a mano o redactado por LLM se traduce por ítem — la palanca
individual más grande en el modelo de costo de abajo.

### Cifras reales de costo por ítem de la industria de evaluación

Ninguna encontrada y verificada de forma independiente en esta sesión. Los
intentos de consulta a las páginas de recursos de AIR, NCIEA y ETS devolvieron
404 o ninguna cifra de costo; la página de investigación de ETS declaró solo
"11.9K publications" existentes, sin cifra de costo [ETS research page]. Los
blogs de la industria comúnmente citan costos por ítem en los miles bajos de
dólares — pero como ninguna fuente primaria se consultó en vivo en esta
sesión, esa cifra **no** se usa abajo. El modelo de costo se deriva en su
lugar enteramente de los precios de API de LLM declarados y de supuestos
explícitos y etiquetados en días-persona.

## Tabla de referencias comparativas

| Producto / sistema | Conteo de ítems o habilidades | Generado o escrito a mano | Fuente |
|---|---|---|---|
| IXL (matemáticas, PreK–8) | ~1,219 habilidades (9 bandas de grado) | Categorías de habilidad curadas; preguntas generadas dinámicamente por habilidad | [1] |
| Khan Academy (Perseus) | No verificado en esta sesión | Híbrido: definiciones de ejercicio autoradas por humanos, renderizadas/variadas por Perseus | [2] |
| WeBWorK (lenguaje PG) | Biblioteca grande; conteo no verificado | Basado en plantillas: un problema PG produce instancias aleatorizadas ilimitadas | [5] |
| Brilliant.org | No declarado públicamente | Híbrido: base hecha a mano + ML de personalización al vuelo, revisado por humanos | [brilliant about] |
| Duolingo (investigación de calibración de ítems) | N/A — evaluación de idiomas | Ítems generados algorítmicamente; calibración de dificultad asistida por ML para ítems de arranque en frío | [Duolingo research] |
| NWEA MAP Growth (CAT) | No verificado en esta sesión | Banco CAT; muestras de preprueba citadas hasta 1,000 examinados para estadísticas estables | [CAT wiki] |
| Práctica general de AIG | Ninguna cifra universal | Un especialista en tests autora un "modelo de ítem"; un algoritmo genera familias de ítems a partir de él | [AIG wiki] |

## Un plan concreto de MVP de 2,500 ítems

**Bandas de nivel y conteo de ítems** (pirámide — la mayoría de los ítems
donde está la mayoría de los usuarios):

| Banda | Ítems |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Universitario (introductorio) | 350 |
| Universitario avanzado / Maestría | 150 |
| Doctorado / investigación | 100 |
| **Total** | **2,500** |

**Reparto por fuente, por banda** (la participación de plantillas cae y la
de escritura a mano sube conforme sube el nivel — las plantillas batallan
con contenido avanzado basado en demostraciones, y el matiz de conceptos
erróneos importa más justo donde los LLM son más débiles):

| Banda | Plantilla % / ítems | Redactado por LLM % / ítems | Escrito a mano % / ítems |
|---|---|---|---|
| K–2 | 70% / 210 | 20% / 60 | 10% / 30 |
| 3–5 | 60% / 240 | 25% / 100 | 15% / 60 |
| 6–8 | 50% / 225 | 30% / 135 | 20% / 90 |
| 9–10 | 35% / 140 | 35% / 140 | 30% / 120 |
| 11–12 | 30% / 105 | 30% / 105 | 40% / 140 |
| Universitario | 20% / 70 | 30% / 105 | 50% / 175 |
| Avanzado/Maestría | 10% / 15 | 30% / 45 | 60% / 90 |
| Doctorado | 5% / 5 | 25% / 25 | 70% / 70 |
| **Total** | **1,010 (40.4%)** | **715 (28.6%)** | **775 (31.0%)** |

**El filtro de revisión** (cada ítem pasa todas las etapas; solo el esfuerzo
por etapa difiere): autoría SME/diseño de plantilla → pasada editorial →
verificación de exactitud matemática → revisión de accesibilidad (texto
alternativo, notación segura para lector de pantalla) → traducción (4
idiomas destino) → piloto (recolectar respuestas reales) → filtro
psicométrico (promover a `active` solo una vez que el conteo de respuestas
sea suficiente — implicación 4). Los ítems escritos a mano entran en
"autoría SME"; los ítems redactados por LLM entran con un borrador en mano
pero pasan por cada etapa subsiguiente; los ítems generados por plantilla
se saltan la autoría por ítem, pero la *plantilla* pasa por el mismo filtro
una vez.

**Esquema JSON del ítem — campos requeridos:**

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

**Esfuerzo en días-persona** (cada cifra es una estimación etiquetada;
aritmética mostrada):

- Diseño de plantillas: 50 plantillas (≈20 variantes/plantilla cubriendo los
  1,010 ítems de plantilla) × 0.5 día = **25 días**; construcción única del
  motor de parametrización **~15 días** (no por ítem).
- Revisión/corrección de ítems redactados por LLM: 715 × 0.15 día = **~107
  días**.
- Autoría escrita a mano: 615 ítems (K-2–universitario, 0.5 día cada uno) +
  160 (Avanzado+Doctorado, 1.0 día cada uno, tiempo de especialista más
  escaso) = **~468 días**.
- Revisión de traducción (verificación puntual por SME bilingüe de la
  traducción de LLM, no re-traducción independiente): 50 plantillas × 4
  idiomas = 200 unidades, más 1,490 ítems × 4 idiomas = 5,960 → **6,160
  unidades** × 0.05 día = **~308 días**.
- Pasada editorial + accesibilidad, uniforme: 2,500 × 0.05 día = **~125
  días**.
- Revisión psicométrica por lote: 2,500 / 50 por lote × 0.1 día = **~5 días**
  (excluye tiempo de calendario esperando respuestas del piloto — una
  restricción de cronograma, no un costo de esfuerzo).

**Total: 25+15+107+468+308+125+5 ≈ 1,053 días-persona**, aproximadamente 4.2
persona-años. Un equipo de 5 personas (2 SME de matemáticas, 1 líder de
localización, 1 editor/psicómetra, 1 ingeniero) lo despacha en
≈1,053÷5 ≈ **210 días laborables, aproximadamente 10 meses** — una
estimación derivada, no una cifra citada de la industria.

**Costo estimado de LLM para redacción + traducción** (precio estándar de
Claude Sonnet 5: $3.00 entrada / $15.00 salida por millón de tokens):

- Ítems redactados por LLM, primer borrador (~1,500 tokens de entrada +
  ~800 de salida/ítem): (1,500×$3 + 800×$15)/1,000,000 = **$0.0165/ítem** ×
  715 ≈ **$12**.
- Ítems escritos a mano, redacción de conceptos erróneos asistida por LLM
  solamente (mismo perfil de tokens): 775 × $0.0165 ≈ **$13**.
- Asistencia de autoría de plantillas (~5,000 tokens de entrada + 2,000 de
  salida/plantilla): $0.045/plantilla × 50 ≈ **$2**.
- Traducción (~800 tokens de entrada + ~900 de salida/unidad):
  $0.0159/unidad × 6,160 unidades ≈ **$98**.

**Total de una sola pasada en bruto ≈ $125.** Un multiplicador de seguridad
de 5× para iteración realista (reintentos de validación, regeneración
disparada por revisión, Opus 5 para las bandas más difíciles) da
**≈ $500–$700** total para toda la pasada de redacción y traducción —
todavía por debajo de $1,500 al duplicarlo por contingencia, tres órdenes de
magnitud por debajo del costo laboral en días-persona. El caché de prompt
reduciría esto aún más pero no se cuenta aquí.

## Implicaciones de diseño

1. Usar plantillas paramétricas para aritmética K–8 y álgebra temprana — una
   plantilla estilo WeBWorK que produce variantes numéricas ilimitadas [5]
   es la palanca de mayor apalancamiento en este plan.
2. Reservar presupuesto de autoría escrita a mano para 11–12 hasta
   doctorado, donde las plantillas tienen su participación más baja (30%
   bajando a 5%) porque el contenido basado en demostraciones resiste la
   aleatorización segura.
3. Traducir plantillas, no instancias generadas: 200 unidades de traducción
   cubren 1,010 ítems de plantilla contra 5,960 unidades para ítems
   individuales — la palanca de localización más grande del modelo.
4. Tratar los valores p y la discriminación punto-biserial como
   provisionales hasta que se acumulen respuestas; la literatura de CAT cita
   muestras de hasta 1,000 examinados para estadísticas de preprueba
   estables [CAT wiki] — no promover automáticamente un ítem a `active` por
   debajo de un mínimo claramente declarado (pregunta abierta 4).
5. Versionar los ítems de forma inmutable. Nunca editar un ítem con
   respuestas adjuntas — crear una nueva versión, retirar la antigua
   (`status: retired`, nunca eliminada), reflejando el ciclo de vida
   nuevo/piloto/activo/retirado documentado para los bancos de ítems en
   general [item bank wiki].
6. Adoptar QTI 3.0 de forma incremental — su modelo de conformidad es
   explícitamente modular [4]; implementar interacciones centrales y
   metadatos de accesibilidad para el MVP y diferir el soporte de CAT/PCI.
7. Construir el filtro de revisión como una máquina de estados explícita que
   coincida con el campo `status`: borrador → editorial → verificación
   matemática → accesibilidad → traducción → piloto → filtro psicométrico →
   activo/retirado.
8. Presupuestar el costo de API de LLM como insignificante (cientos de
   dólares) frente al costo de revisión humana (cientos de miles, según la
   aritmética en días-persona de arriba) — la restricción real es el tiempo
   de SME y traductor, no los tokens.
9. Dado que la investigación 2023–2026 muestra que los LLM redactan
   distractores matemáticamente válidos pero ciegos a conceptos erróneos
   [arXiv 2404.02124], exigir revisión humana de conceptos erróneos en cada
   ítem redactado o asistido por LLM — nunca enviar a Larry una explicación
   de concepto erróneo generada por LLM sin revisar.
10. Esperar que el retorno de las plantillas caiga fuertemente cerca de la
    cima de la pirámide de niveles: el costo de diseño por plantilla es
    aproximadamente fijo sin importar la dificultad, pero una plantilla de
    doctorado produce muchas menos variantes usables de forma segura que una
    de K-2 — el plan ya pondera hacia abajo la participación de plantilla
    conforme sube el nivel.
11. Secuenciar la traducción *después* de la verificación matemática y la
    revisión de accesibilidad, no antes — traducir contenido que después
    falla la revisión técnica desperdicia tiempo de traductor.
12. Cachear el texto compartido de instrucción/esquema/guía de estilo entre
    las llamadas de redacción y traducción; 715+775+6,160 llamadas comparten
    un prefijo estable grande, así que el caché de prompt puede reducir aún
    más el costo real de LLM por debajo de la estimación.
13. Planear el control de exposición de ítems una vez que la plataforma
    soporte entrega adaptativa — incluso un banco de 2,500 ítems se
    beneficia del principio de control de exposición que usan los sistemas
    CAT para evitar sobremostrar ítems populares [CAT wiki].
14. Tratar cada cifra de días de esfuerzo y costo aquí como una estimación a
    validar contra un piloto, no un objetivo fijo — ninguna fuente dio un
    multiplicador verificado de ítems-por-plantilla ni un costo por ítem
    para contenido matemático específicamente; el multiplicador de 20× por
    plantilla y las cifras de $/ítem son supuestos modelados, etiquetados
    como tales.

## Preguntas abiertas para el dueño del proyecto

1. ¿Qué tarifa diaria cargada deberíamos asumir para el tiempo de
   SME/traductor/editor, para convertir los ~1,053 días-persona de arriba en
   una cifra de presupuesto?
2. ¿2,500 ítems es un objetivo firme o un piso, con margen reservado para
   temas que necesiten más ítems una vez que regresen los datos del piloto?
3. ¿Cuáles de los 4 idiomas no ingleses pueden usar traducción por LLM más
   verificación puntual (como se modeló arriba), y cuáles necesitan
   traducción humana independiente desde el día uno?
4. ¿Qué conteo mínimo de respuestas debería condicionar la promoción a
   `active` — la regla general tradicional de CTT (a menudo ~30), o el rango
   más conservador de ~200–1,000 que cita la literatura de CAT para
   estadísticas estables [CAT wiki]?
5. ¿El filtro de revisión debería bloquear en la exportación QTI 3.0 en el
   MVP, o diferir eso a un hito de interoperabilidad posterior al MVP?
6. Avanzado/Maestría y Doctorado tienen la participación de plantilla más
   baja y el costo por ítem más alto — ¿deberíamos presupuestar un SME
   contratista especializado solo para esas dos bandas?
7. ¿Las explicaciones de conceptos erróneos de Larry deberían redactarse una
   vez en inglés y traducirse, o de forma independiente por idioma (p. ej.,
   confusión de coma decimal vs. punto decimal entre ES/FR/DE)?

## Fuentes

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
