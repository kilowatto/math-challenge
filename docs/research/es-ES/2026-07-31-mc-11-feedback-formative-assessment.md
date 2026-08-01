# Retroalimentación y evaluación formativa en matemáticas — Evidencia para un tutor IA

> Investigación Math Challenge — 2026-07-31 — tema 11

## Resumen ejecutivo (ES)

- Hattie & Timperley (2007): la retroalimentación eficaz responde tres preguntas — «¿A dónde voy?», «¿Cómo voy?», «¿A dónde sigo?» — en cuatro niveles: tarea, proceso, autorregulación y «yo». El nivel «yo» (elogios genéricos) es el menos eficaz [1].
- Kluger & DeNisi (1996), meta‑análisis de 607 tamaños de efecto: la retroalimentación mejora el rendimiento en promedio (d = 0,41), pero **más de un tercio de las intervenciones de retroalimentación lo empeoraron** — el mensaje «dar retroalimentación siempre ayuda» es falso [2].
- Black & Wiliam (1998) revisaron >250 estudios: la evaluación formativa bien implementada produce tamaños de efecto de 0,4–0,7, mayores que casi cualquier otra intervención educativa, y reduce especialmente la brecha con los estudiantes de bajo rendimiento [3].
- El momento (inmediato vs. diferido) importa menos que el **contenido** de la retroalimentación; un meta‑análisis reciente de 51 estudios (160 tamaños de efecto) no halló diferencia promedio por momento, pero sí encontró que las matemáticas obtienen efectos mayores que otras materias y que la retroalimentación elaborada supera a la de solo corrección [4][5].
- Shute (2008) distingue cuatro tipos: Conocimiento de Resultado (KR, solo correcto/incorrecto), Conocimiento de Respuesta Correcta (KCR), Retroalimentación Elaborada (EF, explica el porqué) e Intentar‑Hasta‑Correcto (AUC). La EF gana en general, pero el exceso de elaboración puede saturar y perjudicar [5].
- Elogiar la inteligencia («eres muy listo») en vez del esfuerzo («trabajaste con método») reduce la persistencia tras el fracaso, aumenta las atribuciones de habilidad fija y empuja a elegir tareas más fáciles — hallazgo clásico de Mueller & Dweck (1998), 6 estudios [6].
- El elogio inflado («¡increíblemente perfecto!») predice **menor** autoestima con el tiempo en niños, y en niños con autoestima ya alta predice más narcisismo; el elogio genuino y no inflado no produce ninguno de los dos efectos — Brummelman et al. (2014, 2017) [7].
- Los sistemas tutores inteligentes (ITS) con retroalimentación a nivel de paso (step‑based) llegan a d≈0,76, casi tan eficaces como un tutor humano; los que solo evalúan la respuesta final rinden mucho menos (d≈0,40) — VanLehn (2011) [8].
- Los LLM actuales, sin ajuste pedagógico, tienden a **revelar la respuesta antes de tiempo** o a generar explicaciones que sí razonan paso a paso pero contienen errores matemáticos con apariencia coherente — MathDial (2023), MathTutorBench (2025) [9][10].
- El ensayo aleatorio Tutor CoPilot (2024, 783 tutores, N grande) mostró que sugerencias de IA orientadas a preguntas indagatorias (en vez de elogio genérico) subieron el dominio de temas de matemáticas en 4 puntos porcentuales, con mayor ganancia para tutores de menor calificación [11].

## Executive summary (EN)
Hattie & Timperley (2007) sintetizan la retroalimentación como respuesta a tres preguntas (feed up / feed back / feed forward) en cuatro niveles (tarea, proceso, autorregulación, yo) — siendo el elogio a nivel de yo la palanca más débil [1]. El meta‑análisis de Kluger & DeNisi (1996) de 607 tamaños de efecto es la advertencia más importante aquí: la retroalimentación ayuda en promedio (d = ,41), pero **más de un tercio de las intervenciones de retroalimentación redujeron el rendimiento**, sobre todo cuando dirige la atención al yo en lugar de a la tarea [2]. Black & Wiliam (1998) establecieron la evaluación formativa como una de las intervenciones de mayor palanca en educación (d = 0,4–0,7 en más de 250 estudios), beneficiando desproporcionadamente a los alumnos de bajo rendimiento [3]. El momento por sí solo muestra efectos débiles e inconsistentes; un meta‑análisis 2024/2025 de 51 estudios encontró que matemáticas produce efectos mayores que otras asignaturas, y que la elaboración del contenido importa más que el momento [4][5]. La taxonomía de Shute (2008) — KR, KCR, retroalimentación elaborada, respuesta‑hasta‑correcto — muestra que la elaboración suele ganar, pero el exceso puede resultar contraproducente [5]. El elogio de capacidad (Mueller & Dweck, 1998) socava la persistencia y la búsqueda de retos tras el fracaso en comparación con el elogio al esfuerzo/proceso [6]; el elogio inflado predice una autoestima más baja a lo largo del tiempo y, en niños ya con alta autoestima, más narcisismo (Brummelman et al., 2014/2017) [7]. Los enfoques de retroalimentación a nivel de paso de ITS se acercan a la eficacia de un tutor humano (d ≈ 0,76 frente a 0,40 para sistemas solo de respuesta) [8]. Los tutores LLM actuales, a menos que se entrenen específicamente (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tienden a ofrecer respuestas prematuramente o a producir razonamientos fluidos pero matemáticamente erróneos [9][10][12]. El único ensayo clínico aleatorizado en directo de tutoría asistida por IA (Tutor CoPilot, 2024) encontró mejoras concentradas en la reducción del elogio genérico y el aumento de preguntas de sondeo [11].

## Findings

### 1. Modelo de retroalimentación de Hattie & Timperley (2007)

Una retroalimentación eficaz responde a tres preguntas: «¿A dónde voy?» (retroalimentación ascendente), «¿Cómo voy?» (retroalimentación retroactiva) y «¿Qué sigue?» (retroalimentación prospectiva) [1]. Funciona en cuatro niveles: **tarea**, **proceso** (estrategia/método), **autorregulación** y **personal** (elogio personal, «eres muy listo»). La retroalimentación de tarea/proceso orientada a la autorregulación es poderosa; el elogio a nivel personal es el más débil de los cuatro y puede diluir los demás cuando se combina en un mismo mensaje (p. ej., «¡Buen trabajo, eres brillante!» añadido a un aviso de corrección) [1].

### 2. Kluger & DeNisi (1996): la retroalimentación puede perjudicar

Un meta‑análisis de 607 tamaños de efecto / 23.663 observaciones encontró un efecto medio positivo (d = ,41), pero **más de un tercio de las intervenciones de retroalimentación disminuyeron el rendimiento** [2]. La Teoría de la Intervención de la Retroalimentación explica la división: la retroalimentación que redirige la atención al **yo** (involucrando el ego, comparativa, elogio/reproche) desvía recursos de la tarea y puede suprimir el rendimiento tras un error; la retroalimentación que mantiene la atención en la **tarea** y en la estrategia de cierre de brecha tiende a ayudar. Esta es la base empírica para considerar falsa la afirmación de «siempre hay que dar retroalimentación».

### 3. Black & Wiliam y la evidencia de la evaluación formativa

Al revisar 250+ estudios, Black & Wiliam (1998) hallaron que la evaluación formativa eleva los resultados de los exámenes con tamaños de efecto de 0,4–0,7 — superiores a la mayoría de las intervenciones educativas — con los mayores avances para los estudiantes de bajo rendimiento [3]. Condiciones: la información debe usarse para ajustar la enseñanza en tiempo casi real, la retroalimentación debe indicar cómo cerrar la brecha (no solo cuán lejos está) y los estudiantes necesitan apropiarse del proceso (auto‑evaluación/entre pares). Esto defiende un bucle formativo continuo (intento → explicación → ajuste del siguiente problema) en lugar de un informe puntual al final de la sesión.

### 4. Momento: retroalimentación inmediata vs. diferida

Un meta‑análisis reciente (51 estudios, 1988–2024, 160 tamaños de efecto) encontró **ninguna diferencia media significativa entre la retroalimentación inmediata y la diferida**, aunque las tareas de matemáticas mostraron efectos mayores que otras materias, y la retroalimentación inmediata aumentó la confianza del alumno en la práctica matemática basada en ordenador sin modificar los incrementos de exactitud [4]. La elaboración (lo que dice la retroalimentación) importó más que el momento (cuándo llega) [4][5]. En resumen: el momento es secundario, el contenido es primordial — pero la inmediatez sigue ayudando a la confianza y evita que un procedimiento erróneo se practique más.

### 5. Taxonomía del contenido de la retroalimentación (Shute, 2008)

Shute distingue **Conocimiento de Resultados (KR)** (solo correcto/incorrecto), **Conocimiento de Respuesta Correcta (KCR)** (indica la respuesta), **Retroalimentación Elaborada (RE)** (explica el porqué, con pistas/ejemplos/estrategias) y **Respuesta hasta corregir**. La RE suele superar a KR/KCR, pero **una elaboración excesiva puede ser perjudicial**, sobrecargando la memoria de trabajo [5]. Esto aboga por una retroalimentación elaborada pero breve, no una re‑enseñanza exhaustiva de lo que el alumno ya ha acertado.

### 6. Elogio al esfuerzo vs. a la capacidad, y elogio inflado

Mueller & Dweck (1998, six studies): los niños elogiados por su inteligencia mostraron, tras un fracaso posterior, menos persistencia, menos disfrute, más atribuciones de baja capacidad y peor rendimiento que los niños elogiados por su esfuerzo/estrategia; el 92 % de los niños elogiados por el esfuerzo eligieron puzzles posteriores más difíciles frente al 33 % de los elogiados por la inteligencia [6]. Brummelman et al. (2014, 2017) hallaron que el **elogio inflado** predice una menor autoestima a lo largo del tiempo y un mayor narcisismo en niños que ya poseen alta autoestima; el elogio no inflado y preciso no produjo ningún efecto [7]. En conjunto: el proceso/estrategia del elogio debe mantenerse proporcionado y nunca elogiar rasgos fijos.

### 7. Meta‑análisis de retroalimentación en ITS/CAI

VanLehn (2011): los sistemas de tutoría inteligente alcanzan d ≈ 0,58 frente a la ausencia de tutoría, casi equiparables a la tutoría humana. La **tutoría basada en pasos** (retroalimentación en cada paso de la solución) alcanzó d ≈ 0,76 — casi tan buena como un tutor humano — mientras que los **sistemas basados en respuestas** (retroalimentación solo a la respuesta final) alcanzaron solo d ≈ 0,40 [8]. Señal clara: comentar los pasos/trabajo, no solo la respuesta final, siempre que el formato capture el trabajo intermedio.

### 8. Retroalimentación de tutoría matemática generada por LLM (2023–2026)

MathDial (EMNLP 2023) construyó 3.000 diálogos de tutoría porque los LLM sin refinar «fallan en la tutoría» — generan retroalimentación incorrecta o revelan soluciones demasiado pronto («telling@k») [9]. SocraticLM y PEARL entrenan modelos para retener respuestas y estructurar con preguntas en su lugar [10][12]. MathTutorBench (EMNLP 2025): la capacidad de resolución no se transfiere a una buena tutoría, la pedagogía y la competencia se compensan, y la calidad se degrada en diálogos más extensos [10]. Los LLM también producen cadenas de razonamiento fluidas pero erróneas, distintas de la revelación de respuestas [13]. El único RCT de campo, Tutor CoPilot (2024, 783 tutores, ~350k mensajes), encontró que las sugerencias de IA aumentaron las preguntas de sondeo y **disminuyeron el elogio genérico**, con un aumento de dominio de 4 pp (p<0,01), concentrado entre los tutores mejor valorados [11]. Khanmigo evaluations report it beats raw GPT-4o at catching errors, and structured performance signals improved next-item correctness ~6 % — but regular usage stays low (~15 %) [14].

### 9. Age-appropriate phrasing

Early-childhood guidance (NAEYC, Wisconsin DCF) recommends **descriptive, specific feedback** over generic praise («you counted the beans again and got the same number» vs. «good job»), since specificity lets a child connect feedback to a repeatable action [15]. The age gradient runs from concrete/sensory language for young children toward abstract meta-cognitive language (strategy, why, transfer) for older students.

## Implicaciones de diseño para Math Challenge

1. **Estructurar cada mensaje del profesor particular como alimentación ascendente / retroalimentación / retroalimentación prospectiva**: (a) reformular el objetivo, (b) indicar lo que ha ocurrido en relación con él, (c) ofrecer un paso concreto siguiente. No detenerse en (b) — así se deja sin usar la parte de mayor valor del modelo de Hattie & Timperley [1].

2. **Nunca combinar la retroalimentación de la tarea con elogios a nivel de rasgo o personal en la misma frase**. Prohibir «¡Correcto! Eres muy listo en matemáticas» — separar la corrección del estímulo, y centrar el estímulo en el esfuerzo o la estrategia, nunca en la capacidad. Esto se desprende del hallazgo de Kluger & DeNisi de que la captura de atención a nivel personal es el probable mecanismo que hace que la retroalimentación tenga efectos contraproducentes [2][6].

3. **Comentar el trabajo/pasos del alumno, no solo la respuesta final**, siempre que el formato registre los pasos intermedios. La elección arquitectónica de mayor impacto según el meta‑análisis de VanLehn (d≈0,76 basado en pasos frente a d≈0,40 basado en respuestas) [8].

4. **Mantener la retroalimentación elaborada breve — de 3 a 6 frases, como máximo un ejemplo trabajado**. El efecto adverso de la sobre‑elaboración descrito por Shute implica que el aviso debe incluir un límite explícito de longitud, no «explica todo lo que puedas» [5].

5. **No permitir que el profesor particular revele la respuesta o el método del siguiente problema de forma prematura durante el intento** (p. ej., en una pista antes de la entrega) — modo de fallo MathDial/«telling@k». Limitar al profesor a pistas socráticas o escalonadas por pasos durante el intento activo, y reservar explicaciones completas para la revisión posterior a la entrega [9][10][12].

6. **Protegerse contra cadenas de razonamiento erróneas pero presentadas con confianza**. Validar cualquier explicación paso a paso generada contra una solución correcta calculada de forma determinista antes de mostrarla — el modelo debe narrar una derivación conocida como correcta, no volver a derivar libremente la operación, dado que se han documentado cadenas de razonamiento fluidas pero equivocadas [13].

7. **Retroalimentación inmediata para señales de corrección o finalización** (correcto/incorrecto, puntos obtenidos); un breve retraso (menos de un segundo a unos pocos segundos) está bien para la explicación más profunda del «por qué», pero no al final de la sesión — la retroalimentación inmediata favorece la confianza y evita que se practique más un procedimiento erróneo [4].

8. **Reservar la retroalimentación a nivel de patrones para un resumen al final de la sesión**, distinto de la retroalimentación por problema: p. ej., «más rápido en las tablas de multiplicar, más lento en problemas verbales de varios pasos; la próxima sesión incluirá más problemas verbales escalonados». Esto se corresponde con el bucle formativo de Black & Wiliam — usar la evidencia agregada para ajustar la *próxima* unidad didáctica, no solo la siguiente frase [3].

9. **Plantillas de retroalimentación por franja de edad para el indicador del profesor**:

   - **Edades ~4–6:** de 1 a 2 frases breves, concretas/sensoriales, sin hablar de estrategias abstractas. Plantilla: *[observación concreta] → [paso correcto simple] → [elogio al esfuerzo vinculado a la acción específica]*. Ejemplo: «Has contado las manzanas una a una — son 7, tú dijiste 6; contemos juntos: 1, 2, 3… Estás mejorando mucho en contar con precisión».
   - **Edades ~7–10:** de 3 a 4 frases nombrando el paso concreto donde se desvió, una estrategia, elogio al esfuerzo/estrategia. Plantilla: *[lo que has acertado] + [el paso exacto que se desvió] + [por qué funciona el paso correcto] + [ánimo basado en la estrategia]*.
   - **Edades ~11–14:** de 4 a 5 frases introduciendo el *por qué* de la regla, invitando a comparar con el enfoque correcto, usando el vocabulario de la materia. Plantilla: *[alimentación ascendente: qué evaluaba el problema] + [retroalimentación: dónde coincidió o se desvió el razonamiento] + [regla correcta con un mini paso trabajado] + [alimentación prospectiva: un tipo de problema relacionado a vigilar]*.
   - **Edades 15+ / adulto:** conciso, técnico, a nivel de pares; omitir la plantilla de elogio, centrarse en la precisión («correcto pero no óptimo; aquí hay una vía más rápida»), ofrecer mayor profundidad bajo petición.

   Todas las franjas: nunca enmarcar con rasgos fijos («no eres una persona de matemáticas»); siempre nombrar la *acción específica*, nunca un juicio global.

10. **Retroalimentación a evitar, porque la evidencia muestra que produce efectos adversos**: elogio genérico a rasgo/capacidad [6]; elogio inflado o superlativo por correcciones rutinarias [7]; retroalimentación solo de corrección sin vía a seguir cuando es errónea [5]; revelar la solución completa antes de que termine el intento [9][10]; re‑enseñanza prolongada de material ya dominado [5]; retroalimentación comparativa/normativa («por detrás de otros niños de tu edad») — el mecanismo exacto de cambio de ego que provoca caídas de rendimiento por la retroalimentación [2].

11. **Vincular la retroalimentación de gamificación a señales de esfuerzo o proceso** (persistencia, uso de estrategias, mejora respecto a la propia referencia), no solo a la velocidad o rachas, de modo que la puntuación no reintroduzca retroalimentación basada en la capacidad mediante tablas de clasificación o insignias de talento fijo.

12. **Exigir que el indicador del profesor se autocompruebe con una rúbrica breve antes de emitir un mensaje**: separa la tarea del elogio; nombra un paso concreto siguiente; respeta el límite de longitud de la franja de edad; evita revelar respuestas para el próximo intento; cualquier paso trabajado se valida contra la verdad de base calculada. Así se operacionalizan las normas anteriores como una puerta, no como una esperanza.

## Preguntas abiertas para el responsable del proyecto

1. ¿Debe la retroalimentación inmediata por problema y la explicación más completa del tutor IA mostrarse siempre juntas, o los niños de 4 a 6 años deberían recibir una reacción simplificada en línea de inmediato y la explicación completa solo en la revisión para padres/sesión?
2. ¿Capturamos actualmente el trabajo/intermedios en problemas de varios pasos, no solo la respuesta final? En caso negativo, ¿vale la pena priorizarlo teniendo en cuenta la brecha ITS basada en pasos vs. basada en respuestas (d≈0,76 frente a d≈0,40)?
3. ¿Los resúmenes al final de la sesión deben enviarse al niño, al padre o a ambos, con una redacción distinta (ánimo dirigido al niño vs. detalle diagnóstico para el padre)?
4. ¿Cómo debe el profesor validar la narración de su solución trabajada contra la verdad de base: ¿con un solucionador determinista independiente o con una pasada de verificación secundaria del LLM?
5. ¿Queremos un recurso de «profesor novato» (revelar la respuesta correcta sin más) cuando una explicación socrática o elaborada resulte demasiado lenta o costosa, y a qué umbral de latencia/coste debería activarse?

## Fuentes

1. Hattie & Timperley (2007). The Power of Feedback, *Review of Educational Research* 77(1). Follow-up: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).
2. Kluger & DeNisi (1996). The Effects of Feedback Interventions on Performance, *Psychological Bulletin* 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
3. Black & Wiliam (1998). Inside the Black Box, *Phi Delta Kappan*. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).
4. A Meta-Analysis of the Impact of Feedback Timing on Learning Outcomes in Computer-Assisted Learning, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).
5. Shute (2008). Focus on Formative Feedback, *Review of Educational Research* 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).
6. Mueller & Dweck (1998). Praise for Intelligence Can Undermine Children's Motivation and Performance. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).
7. Brummelman et al. (2014, 2017). Person Praise Backfires in Children With Low Self-Esteem; When Parents' Praise Inflates, Children's Self-Esteem Deflates, *Child Development*. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).
8. VanLehn (2011), summarized in: [Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).
9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).
10. MathTutorBench: A Benchmark for Measuring Open-ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).
11. Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).
12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).
13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).
14. Khan Academy Blog. How Khan Academy Is Building a Better AI Tutor. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).
15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
