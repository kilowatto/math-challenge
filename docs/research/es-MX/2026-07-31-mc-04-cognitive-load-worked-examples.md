# Teoría de la carga cognitiva y los ejemplos resueltos en matemáticas
> Investigación Math Challenge — 2026-07-31 — tema 04

## Resumen ejecutivo (ES)

- La Teoría de la Carga Cognitiva (CLT, John Sweller, UNSW) asume memoria de trabajo muy limitada y memoria a largo plazo (esquemas) casi ilimitada; la instrucción debe minimizar la carga "extraña" (mal diseño) y proteger la carga "productiva" (construir esquemas) [1][13].
- **Efecto del ejemplo resuelto**: para principiantes, estudiar un ejemplo resuelto enseña más, en menos tiempo y con menos errores, que resolver el mismo problema desde cero (Sweller y Cooper, 1985) [1][2].
- **Reversión de la pericia** (Kalyuga): al ganar competencia, ese mismo andamiaje se vuelve redundante y **perjudica** el aprendizaje [3][4].
- La solución práctica es el **desvanecimiento** (*fading*, Renkl): pasar gradualmente de ejemplo completo → un paso en blanco → problema completo [5][6].
- Los **prompts de autoexplicación** (Chi) potencian el efecto; combinados con el desvanecimiento producen ganancias medianas-grandes en transferencia cercana y lejana sin más tiempo de estudio (Atkinson, Renkl y Merrill, 2003) [6][14].
- **Atención dividida** y **redundancia** son errores de diseño: separar diagrama y texto, o repetir la misma información en dos canales, desperdicia memoria de trabajo [7].
- **Efecto libre de meta**: pedir "encuentra todos los valores que puedas" en vez de "encuentra X" reduce la carga de la búsqueda medios-fines [8].
- CLT tiene problemas serios de fondo: no existe una medida fiable de carga cognitiva (se usa mayormente una escala de un solo ítem) y la teoría ha atravesado varias crisis de réplica [9].
- La presión de tiempo **no es neutra**: para ~1/3 de los alumnos (Ashcraft) la prueba cronometrada origina la ansiedad matemática, y esa ansiedad ocupa memoria de trabajo igual que una tarea secundaria [11][12].
- Implicación central: **puntuar por velocidad no es gratis** — al aprender algo nuevo, la velocidad mide sobre todo automatización previa, no comprensión.
- Recomendación: mostrar ejemplo resuelto a quien no conoce el patrón, desvanecer pasos al acertar, y no cronometrar hasta que el patrón esté consolidado.

## Executive summary (EN)

- Cognitive Load Theory (CLT, John Sweller, UNSW): working memory is severely limited, long-term memory (schemas) is effectively unlimited; instruction should minimize extraneous load and protect germane (schema-building) load [1][13].
- **Worked-example effect**: for novices, studying a worked example teaches more, faster, with fewer errors, than solving the same problem unaided (Sweller & Cooper, 1985) [1][2].
- **Expertise reversal effect** (Kalyuga): as competence grows, the same scaffolding becomes redundant and can actively **harm** learning [3][4].
- The fix is **fading** (Renkl): gradually moving from full example → one blank step → independent problem [5][6].
- **Self-explanation prompts** (Chi) amplify the effect; combined with fading they produce medium-large gains on near **and** far transfer at no extra time cost (Atkinson, Renkl & Merrill, 2003) [6][14].
- **Split-attention** and **redundancy** are design failures: separating diagram from text, or repeating information across two channels, wastes working memory [7].
- **Goal-free effect**: "find as many values as you can" instead of "solve for X" lowers means-ends search load [8].
- CLT has real foundational problems: no validated measure of cognitive load exists (mostly single-item effort scales), and the theory has been through multiple replication crises [9].
- Time pressure is **not neutral**: for roughly a third of learners (Ashcraft), timed testing is itself the origin of math anxiety, which consumes working memory like a secondary task [11][12].
- Core implication: **speed-based scoring is not free** — while a concept is new, speed mostly measures prior automaticity, not understanding.
- Design recommendation: full worked example for unfamiliar patterns, fade as the learner succeeds, and hold off timing until the pattern is consolidated.

## Hallazgos

### 1. Núcleo teórico: memoria de trabajo, esquemas y tres tipos de carga

CLT modela la cognición humana según la distinción de Geary entre conocimiento *biológicamente primario* (preparado por la evolución, p. ej. el lenguaje hablado) y conocimiento *biológicamente secundario* (culturalmente importante pero no preparado evolutivamente, p. ej. la aritmética y el álgebra escritas) [13]. Como las matemáticas son biológicamente secundarias, deben enseñarse de forma explícita, y su cuello de botella es la memoria de trabajo, que retiene solo unos pocos elementos nuevos a la vez y los pierde en segundos a menos que se organicen en un esquema de memoria a largo plazo [1][13]. CLT divide la carga en **intrínseca** (complejidad inevitable, determinada por la *interactividad de elementos* — cuántas piezas interactuantes hay que mantener en mente a la vez), **extraña** (añadida por un mal diseño, sin valor de aprendizaje) y **productiva** (procesamiento esforzado que construye el esquema). El diseño debe minimizar la carga extraña para que la capacidad sobrante sirva al procesamiento productivo [1][7][13].

### 2. El efecto del ejemplo resuelto

Sweller y Cooper (1985) enseñaron álgebra a lo largo de cinco experimentos y hallaron que, manteniendo constante el tiempo de estudio, los estudiantes que trabajaron con ejemplos resueltos resolvieron los problemas de la prueba posterior aproximadamente el doble de rápido y con cerca de una quinta parte de los errores de quienes resolvieron sin ayuda desde el inicio [1][2]. Resolver sin ayuda obliga a un proceso de búsqueda que compite con la construcción del esquema; leer un ejemplo, en cambio, dirige toda la capacidad a reconocer la estructura de la solución. Sweller lo llama "the best known and most widely studied of the cognitive load effects" [1]. Trabajo posterior (Van Gog, Kester y Paas, 2011) muestra que solo-ejemplo y pares alternados ejemplo-problema superan a la resolución pura de problemas en otros dominios procedimentales (p. ej., análisis de circuitos), así que el efecto se generaliza más allá del álgebra [1].

### 3. La reversión de la pericia y la redundancia

El beneficio no es permanente. Kalyuga demostró, en formación de ingeniería, circuitos de relevadores y PLC, que la ventaja de los ejemplos resueltos sobre la resolución de problemas **se reduce y se revierte** a medida que los aprendices ganan experiencia [3][4]. El mecanismo: ya existe un esquema eficiente, así que volver a mostrar cada paso obliga a procesar información innecesaria, desperdiciando capacidad que podría dedicarse a la práctica de recuperación — y además niega esa práctica [3][4]. Esto llevó a Sweller a revisar su propia afirmación de 1988 de que la resolución de problemas debía minimizarse en general: la cantidad correcta de resolución sin ayuda es función de la pericia *actual*, no de la etapa curricular [4].

### 4. Desvanecimiento, problemas de completar y autoexplicación

El **desvanecimiento** (*fading*) de Renkl: empezar totalmente resuelto, luego omitir un paso (un *problema de completar*), luego más, hasta que el alumno resuelva sin ayuda. El desvanecimiento puede ir hacia adelante o hacia atrás; el desvanecimiento hacia atrás (omitir primero el último paso) se recomienda generalmente porque el paso final suele anclar la conexión con la meta [5]. Los ejemplos desvanecidos en geometría produjeron una comprensión conceptual más profunda que los bloques de ejemplos sin desvanecer [5]. El desvanecimiento por sí solo ayuda de forma confiable a la transferencia cercana pero no a la transferencia lejana. Atkinson, Renkl y Merrill (2003, *J. Educational Psychology*, 95(4), 774–783) combinaron el desvanecimiento con **prompts de autoexplicación** — preguntas breves que piden al alumno enunciar el principio detrás de cada paso, apoyándose en el hallazgo de Chi de que los alumnos fuertes se autoexplican espontáneamente y los débiles no [6][14]. A lo largo de dos experimentos, esta combinación produjo ganancias medianas a grandes tanto en transferencia cercana como lejana, sin tiempo de estudio adicional — "highly recommendable" según los autores [6]. Un metaanálisis más amplio de autoexplicación reporta un tamaño de efecto medio de alrededor de g = 0.66 en 69 comparaciones [14].

### 5. Atención dividida y redundancia en el diseño

Dos efectos de fallo de diseño. **Atención dividida**: la comprensión exige integrar mentalmente fuentes separadas física o temporalmente (un diagrama aparte de su leyenda, o un paso mostrado antes de su explicación); los materiales integrados y bien diseñados superan a los divididos [7]. **Redundancia**: presentar la misma información dos veces en canales distintos (p. ej., narrar palabra por palabra un texto que ya está en pantalla) añade un costo de reconciliación sin ningún beneficio [7]. Para la interfaz de matemáticas: un paso de la solución y el razonamiento detrás de él deben ocupar la misma región visual al mismo tiempo; elige un solo canal por unidad de información.

### 6. El efecto libre de meta

Un problema de meta específica ("despeja x") activa el **análisis medios-fines**: mantener a la vez el estado meta, el estado actual, su diferencia y los operadores candidatos — carga alta, útil para encontrar una respuesta pero pobre para aprender el método, porque la atención persigue la meta en vez de la estructura [8]. Una versión **libre de meta** ("encuentra todos los valores que puedas") elimina el objetivo, así que el alumno avanza de forma oportunista desde lo que ya sabe, bajando la carga y dirigiendo la atención hacia la estructura, lo que mejora el aprendizaje aunque no se vea como "resolver el problema" [8].

### 7. Críticas, problemas de medición y el debate de replicación

El propio principal proponente de CLT reconoce una historia de "replication crises and incorporation of other theories", revisada más de una vez tras replicaciones fallidas — la más visible, la postura de 1988 de minimizar la resolución de problemas, desmontada por la reversión de la pericia [3][4][9]. La crítica de fondo sin resolver es la **medición**: no existe un instrumento validado y confiable para la carga cognitiva en sí; la práctica dominante es un solo ítem de autorreporte de esfuerzo, que no se puede verificar en cuanto a confiabilidad y que confunde el esfuerzo percibido con lo que la manipulación realmente le hizo a la memoria de trabajo [9]. Muchos efectos clásicos se infieren de resultados conductuales (errores, transferencia, tiempo) tratando la carga como algo no medido — razonable en conjunto pero difícil de diagnosticar caso por caso. Los críticos también señalan que "cognitive load" a veces funciona como una etiqueta post-hoc para cualquier resultado consistente con la teoría, en vez de un constructo medido de forma independiente — una crítica que comparte con la literatura más amplia de la crisis de replicación de la psicología, no exclusiva de CLT [9].

### 8. Práctica cronometrada, calificación por velocidad y ansiedad matemática

Lo más relevante para un diseño de puntos por velocidad. El programa de Ashcraft muestra que la ansiedad matemática funciona como una tarea secundaria concurrente, que ocupa la memoria de trabajo (el componente ejecutivo) que de otro modo serviría a la aritmética — produciendo errores y lentitud que parecen un déficit de competencia pero son un déficit de recursos inducido por la ansiedad, no por las matemáticas [11]. Las pruebas cronometradas revelan de forma confiable brechas ligadas a la ansiedad en aritmética que no aparecen en pruebas sin tiempo del mismo contenido — lo que se mide bajo presión, para los alumnos ansiosos, es el reloj, no las matemáticas [11][12]. Boaler: el inicio de las pruebas cronometradas es, para una fracción significativa de los estudiantes, el punto de origen de la propia ansiedad matemática, y una vez ansioso, la memoria de trabajo queda parcialmente consumida por esa ansiedad, bloqueando el acceso a datos que el alumno ya domina — un ciclo que se refuerza a sí mismo [12]. La evidencia no es unilateral: algunos estudios encuentran que las condiciones con tiempo igualado pueden aumentar la precisión, y uno no halló interacción triple significativa entre memoria, ansiedad y cronometraje [11] — real pero moderado por el nivel de ansiedad y por si "cronometrado" significa un reloj estricto o una disponibilidad con ritmo.

Síntesis: la velocidad es un marcador legítimo de *automaticidad* una vez que un esquema está consolidado — la recuperación rápida y sin esfuerzo es exactamente lo que la carga productiva "pagó" [1][13]. Pero la velocidad medida *antes* de la consolidación no mide comprensión; mide cualquier proceso esforzado que el alumno esté usando como sustituto, y un reloj encima de eso añade exactamente la carga extraña que CLT dice evitar, justo en el momento en que la memoria de trabajo debería protegerse, no exigirse [1][7][8][11].

## Implicaciones de diseño para Math Challenge

1. **Mostrar un ejemplo resuelto completo antes del primer intento de un niño con un patrón nuevo** (nunca resuelto, o si los últimos N intentos en esa habilidad fallaron) en vez de "luchar primero" — coincide con el efecto del ejemplo resuelto para principiantes [1][2].
2. **Nunca combinar "patrón nuevo" con un reloj de cuenta regresiva.** Poner en cero el peso de la calificación por velocidad en las primeras exposiciones; introducir el cronometraje solo cuando el patrón se resuelva correctamente sin que haya un ejemplo resuelto presente [11][12].
3. **Desvanecer automáticamente a partir de una señal de dominio**, no de un conteo fijo de ítems: la precisión reciente, el uso de pistas y el conteo de pasos sin ayuda seleccionan el siguiente peldaño (ejemplo completo → un espacio en blanco → dos espacios en blanco → problema completo), según la secuencia de problemas de completar de Renkl [5][6].
4. **Sesgar el desvanecimiento hacia atrás** (omitir primero el último paso), ya que ancla la conexión con la meta y debe practicarse temprano [5].
5. **Acompañar cada paso desvanecido con un prompt de autoexplicación de un solo toque** (opción múltiple para edades más pequeñas, texto libre/voz para mayores) — la única intervención que ha demostrado añadir transferencia lejana sin costo de tiempo [6][14].
6. **Diseñar la interfaz para evitar la atención dividida y la redundancia**: mantener un paso y su explicación en la misma región visual al mismo tiempo; nunca narrar y mostrar el mismo texto de forma simultánea [7].
7. **Usar planteamientos libres de meta en los ítems de colocación/diagnóstico** ("encuentra todos los valores que puedas") para revelar el conocimiento previo con menor carga, cambiando a calificación con meta específica una vez que empieza la evaluación de dominio [8].
8. **Tratar la reversión de la pericia como un alto total al andamiaje**: pasado un umbral de dominio, no ofrecer ejemplos resueltos/pistas por omisión (disponibles solo a petición), ya que el andamiaje redundante perjudica de forma medible a los alumnos avanzados [3][4].
9. **Desacoplar los puntos por corrección de los puntos por velocidad** como canales ajustables por separado; el peso de velocidad debe estar cerca de cero por omisión hasta que la escalera de desvanecimiento llegue a "problema completo, sin pistas". Decirles explícitamente a padres/maestros que subir el peso de velocidad aumenta la varianza ligada a la ansiedad en alumnos que aún no dominan la habilidad [11][12].
10. **No dejar que un temporizador global de sesión/racha sustituya la restricción de dominio por habilidad** — un reloj de nivel meta puede reintroducir el mismo efecto de ansiedad incluso con problemas sin cronometrar; hacer que los temporizadores de racha se puedan omitir y nunca bloquear el acceso al ejemplo resuelto.
11. **Registrar en qué peldaño de desvanecimiento necesitó apoyo un niño** como señal de dominio para maestros/padres, no solo si acertó — la forma en que se retira el andamiaje es en sí misma diagnóstica de la fortaleza del esquema [5][6].
12. **No sobre-instrumentar la "carga cognitiva" de forma directa** (p. ej., solo a partir de la varianza en el tiempo de respuesta); usar sustitutos validados conductualmente — la trayectoria de precisión a lo largo de la escalera de desvanecimiento, la calidad de la autoexplicación — ya que incluso la propia literatura de CLT carece de una medida directa de carga validada sobre la cual construir [9].

## Preguntas abiertas para el dueño del proyecto

1. ¿Deben los puntos basados en velocidad estar activados por omisión para alguna banda de edad, dada la evidencia sobre ansiedad, o deben activarse solo por elección desde la cuenta de cada padre/maestro?
2. ¿Qué umbral de dominio (p. ej., N aciertos consecutivos en el peldaño "problema completo") debe habilitar la transición de sin-cronometrar a cronometrado por habilidad?
3. ¿Deben los prompts de autoexplicación ser obligatorios u omitibles, dado que las edades de aproximadamente 4-6 años podrían carecer del lenguaje metacognitivo necesario?
4. ¿Se traduce con limpieza "encuentra todos los valores que puedas" (el planteamiento libre de meta) al EN/ES/FR/PT/DE sin perder su apertura?
5. ¿Debe la escalera de desvanecimiento ser visible para el niño, o invisible/solo de backend?

## Fuentes

1. [Worked-example effect — Wikipedia](https://en.wikipedia.org/wiki/Worked-example_effect)
2. [Sweller, J., & Cooper, G. A. (1985). The Use of Worked Examples as a Substitute for Problem Solving in Learning Algebra. Cognition and Instruction, 2(1), 59–89 — citation record](https://notes.andymatuschak.org/zYHdLJ7TFdpcwGtqDChMNbm)
3. [Expertise reversal effect — Wikipedia](https://en.wikipedia.org/wiki/Expertise_reversal_effect)
4. [The "Expertise Reversal Effect" — Cognitive Load Theory (blog, summarizing Kalyuga et al. 2001, 2003, 2007)](https://cognitiveloadtheory.wordpress.com/the-expertise-reversal-effect/)
5. [Exploring the Use of Faded Worked Examples — ERIC](https://files.eric.ed.gov/fulltext/EJ1086007.pdf)
6. [Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning From Studying Examples to Solving Problems: Effects of Self-Explanation Prompts and Fading Worked-Out Steps. Journal of Educational Psychology, 95(4), 774–783 — ERIC record](https://eric.ed.gov/?id=EJ678596)
7. [Split attention effect — Wikipedia](https://en.wikipedia.org/wiki/Split_attention_effect)
8. [The Goal-Free Effect (Sweller & Ayres) — Semantic Scholar](https://www.semanticscholar.org/paper/The-Goal-Free-Effect-Sweller-Ayres/ba2fcd3134382fa4cd6e415f8e3333fbb0e131dd)
9. [The Development of Cognitive Load Theory: Replication Crises and Incorporation of Other Theories Can Lead to Theory Expansion — Educational Psychology Review (2023)](https://link.springer.com/article/10.1007/s10648-023-09817-2)
10. [Cognitive load theory: Research that teachers really need to understand — NSW Department of Education (CESE, 2017)](https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory.pdf)
11. [Ashcraft, M., & Krause, J. (2007). Working Memory, Math Performance, and Math Anxiety. Psychonomic Bulletin & Review, 14, 243–248](https://link.springer.com/article/10.3758/BF03194059)
12. [Boaler, J. Speed and Time Pressure Blocks Working Memory (Stanford / youcubed, reprint)](https://www.dyslexicadvantage.org/wp-content/uploads/2015/12/Speed_and_Time_Pressure_Blocks_Working_Memory_.pdf)
13. [Sweller, J. (2019 et al.). Cognitive Architecture and Instructional Design: 20 Years Later. Educational Psychology Review](https://leadinglearner.me/wp-content/uploads/2019/02/sweller2019_article_cognitivearchitectureandinstru.pdf)
14. [Chi, M. T. H., & Leeuw, N. Eliciting Self-Explanations Improves Understanding — Semantic Scholar](https://www.semanticscholar.org/paper/Eliciting-Self-Explanations-Improves-Understanding-Chi-Leeuw/dd869eeb2e13264d47eb0d150d05912b7afd9aba)
15. [Does working memory moderate the effect of fading on math performance? Miller-Cotto et al. British Journal of Educational Psychology (2026)](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjep.12781)
16. [Sweller, J. (1988). Cognitive Load During Problem Solving: Effects on Learning. Cognitive Science, 12(2), 257–285 — Wiley Online Library](https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1202_4)
