# Retroalimentación y evaluación formativa en matemáticas — evidencia para un tutor de IA

> Investigación Math Challenge — 2026-07-31 — tema 11

## Resumen ejecutivo (ES)

- Hattie & Timperley (2007): la retroalimentación eficaz responde tres preguntas — "¿A dónde voy?", "¿Cómo voy?", "¿A dónde sigo?" — en cuatro niveles: tarea, proceso, autorregulación y "yo". El nivel "yo" (elogios genéricos) es el menos eficaz [1].
- Kluger & DeNisi (1996), meta-análisis de 607 tamaños de efecto: la retroalimentación mejora el desempeño en promedio (d=0.41), pero **más de un tercio de las intervenciones de retroalimentación lo empeoraron** — el mensaje "dar retroalimentación siempre ayuda" es falso [2].
- Black & Wiliam (1998) revisaron >250 estudios: la evaluación formativa bien implementada produce tamaños de efecto de 0.4–0.7, mayores que casi cualquier otra intervención educativa, y reduce especialmente la brecha con los estudiantes de bajo desempeño [3].
- El momento (inmediato vs. diferido) importa menos que el **contenido** de la retroalimentación; un meta-análisis reciente de 51 estudios (160 tamaños de efecto) no halló diferencia promedio por momento, pero sí encontró que matemáticas obtiene efectos mayores que otras materias y que la retroalimentación elaborada supera a la de solo corrección [4][5].
- Shute (2008) distingue cuatro tipos: Conocimiento de Resultado (KR, solo correcto/incorrecto), Conocimiento de Respuesta Correcta (KCR), Retroalimentación Elaborada (EF, explica el porqué) e Intentar-Hasta-Correcto (AUC). La EF gana en general, pero el exceso de elaboración puede saturar y perjudicar [5].
- Elogiar la inteligencia ("eres muy listo") en vez del esfuerzo ("trabajaste con método") reduce la persistencia tras el fracaso, aumenta las atribuciones de habilidad fija y empuja a elegir tareas más fáciles — hallazgo clásico de Mueller & Dweck (1998), 6 estudios [6].
- El elogio inflado ("¡increíblemente perfecto!") predice **menor** autoestima con el tiempo en niños, y en niños con autoestima ya alta predice más narcisismo; el elogio genuino y no inflado no produce ninguno de los dos efectos — Brummelman et al. (2014, 2017) [7].
- Los sistemas tutores inteligentes (ITS) con retroalimentación a nivel de paso (step-based) llegan a d≈0.76, casi tan eficaces como un tutor humano; los que solo evalúan la respuesta final rinden mucho menos (d≈0.40) — VanLehn (2011) [8].
- Los LLM actuales, sin ajuste pedagógico, tienden a **revelar la respuesta antes de tiempo** o a generar explicaciones que sí razonan paso a paso pero contienen errores matemáticos con apariencia coherente — MathDial (2023), MathTutorBench (2025) [9][10].
- El ensayo aleatorio Tutor CoPilot (2024, 783 tutores, N grande) mostró que las sugerencias de IA orientadas a preguntas indagatorias (en vez de elogio genérico) subieron el dominio de temas de matemáticas en 4 puntos porcentuales, con mayor ganancia para los tutores de menor calificación [11].

## Executive summary (EN)

Hattie & Timperley's (2007) synthesis frames feedback as answering three questions (feed up / feed back / feed forward) across four levels (task, process, self-regulation, self) — with self-level praise the weakest lever [1]. Kluger & DeNisi's (1996) meta-analysis of 607 effect sizes is the single most important caution here: feedback helps on average (d = .41), but **over a third of feedback interventions reduced performance**, mainly when it directs attention to the self rather than the task [2]. Black & Wiliam (1998) established formative assessment as one of education's highest-leverage interventions (d = 0.4–0.7 across 250+ studies), disproportionately benefiting low performers [3]. Timing alone shows weak, inconsistent effects; a 2024/2025 meta-analysis of 51 studies found math produces larger effects than other subjects, and that content elaboration matters more than timing [4][5]. Shute's (2008) taxonomy — KR, KCR, elaborated feedback, answer-until-correct — shows elaboration generally wins, but excess can backfire [5]. Ability praise (Mueller & Dweck, 1998) undermines persistence and challenge-seeking after failure relative to effort/process praise [6]; inflated praise predicts lower self-esteem over time and, in already-high-self-esteem children, more narcissism (Brummelman et al., 2014/2017) [7]. Step-level ITS feedback approaches human-tutor effectiveness (d ≈ 0.76 vs. 0.40 for answer-only systems) [8]. Current LLM tutors, unless specifically trained (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tend to give away answers prematurely or produce fluent but mathematically wrong reasoning [9][10][12]. The one live RCT of AI-assisted tutoring (Tutor CoPilot, 2024) found gains concentrated in reduced generic praise and increased probing questions [11].

## Hallazgos

### 1. El modelo de retroalimentación de Hattie & Timperley (2007)

La retroalimentación eficaz responde tres preguntas: "¿A dónde voy?" (feed up), "¿Cómo voy?" (feed back), "¿A dónde sigo?" (feed forward) [1]. Opera en cuatro niveles: **tarea**, **proceso** (estrategia/método), **autorregulación** y **yo** (elogio personal, "eres muy listo"). La retroalimentación de tarea/proceso orientada a la autorregulación es poderosa; el elogio a nivel "yo" es el más débil de los cuatro y puede diluir a los demás cuando se combina en un mismo mensaje (p. ej., "¡Buen trabajo, eres brillante!" añadido a un aviso de corrección) [1].

### 2. Kluger & DeNisi (1996): la retroalimentación puede perjudicar

Un meta-análisis de 607 tamaños de efecto / 23,663 observaciones encontró un efecto promedio positivo (d = .41), pero **más de un tercio de las intervenciones de retroalimentación disminuyeron el desempeño** [2]. La Teoría de la Intervención de Retroalimentación explica esta división: la retroalimentación que redirige la atención al **yo** (que involucra el ego, es comparativa, elogio/reproche) desvía recursos de la tarea y puede suprimir el desempeño tras un fracaso; la retroalimentación que mantiene la atención en la **tarea** y en la estrategia para cerrar la brecha tiende a ayudar. Esta es la base empírica para considerar falsa la idea de que "siempre hay que dar retroalimentación".

### 3. Black & Wiliam y la base de evidencia de la evaluación formativa

Al revisar más de 250 estudios, Black & Wiliam (1998) encontraron que la evaluación formativa eleva los resultados de las pruebas con tamaños de efecto de 0.4–0.7 — mayores que la mayoría de las intervenciones educativas — con las mayores ganancias para los estudiantes de bajo desempeño [3]. Condiciones: la información debe usarse para ajustar la enseñanza casi en tiempo real, la retroalimentación debe indicar cómo cerrar la brecha (no solo qué tan lejos está), y los estudiantes necesitan apropiarse del proceso (autoevaluación/evaluación entre pares). Esto respalda un bucle formativo continuo (intento → explicación → ajuste del siguiente problema) en vez de un informe único al final de la sesión.

### 4. Momento: retroalimentación inmediata vs. diferida

Un meta-análisis reciente (51 estudios, 1988–2024, 160 tamaños de efecto) no encontró **diferencia promedio significativa entre la retroalimentación inmediata y la diferida**, pero las tareas de matemáticas mostraron efectos mayores que otras materias, y la retroalimentación inmediata aumentó la confianza del alumno en la práctica de matemáticas por computadora incluso sin cambiar las ganancias en exactitud [4]. La elaboración (lo que dice la retroalimentación) importó más que el momento (cuándo llega) [4][5]. En resumen: el momento es secundario, el contenido es primordial — pero la inmediatez sigue ayudando a la confianza y evita que se siga practicando un procedimiento incorrecto.

### 5. Taxonomía del contenido de la retroalimentación (Shute, 2008)

Shute distingue **Conocimiento de Resultados (KR)** (solo correcto/incorrecto), **Conocimiento de Respuesta Correcta (KCR)** (indica la respuesta), **Retroalimentación Elaborada (EF)** (explica el porqué, con pistas/ejemplos/estrategias) e **Intentar-Hasta-Correcto**. La EF por lo general supera a KR/KCR, pero **la elaboración excesiva puede ser perjudicial**, al sobrecargar la memoria de trabajo [5]. Esto respalda una retroalimentación elaborada pero breve, no una re-enseñanza exhaustiva de lo que el alumno ya hizo bien.

### 6. Elogio al esfuerzo vs. a la capacidad, y elogio inflado

Mueller & Dweck (1998, seis estudios): los niños elogiados por su inteligencia mostraron, tras un fracaso posterior, menos persistencia, menos disfrute, más autoatribuciones de baja capacidad y peor desempeño que los niños elogiados por su esfuerzo/estrategia; el 92% de los niños elogiados por el esfuerzo eligieron rompecabezas posteriores más difíciles frente al 33% de los elogiados por la inteligencia [6]. Brummelman et al. (2014, 2017) encontraron que el elogio **inflado** predice menor autoestima con el tiempo, y mayor narcisismo en niños que ya tienen alta autoestima; el elogio preciso y no inflado no produjo ninguno de los dos efectos [7]. En conjunto: elogiar el proceso/la estrategia, mantenerlo proporcionado, nunca elogiar rasgos fijos.

### 7. Meta-análisis de retroalimentación en ITS/CAI

VanLehn (2011): los sistemas tutores inteligentes alcanzan d ≈ 0.58 frente a no recibir tutoría, casi igualando a la tutoría humana. La **tutoría basada en pasos** (retroalimentación en cada paso de la solución) alcanzó d ≈ 0.76 — casi tan buena como un tutor humano — mientras que los **sistemas basados en la respuesta** (retroalimentación solo sobre la respuesta final) alcanzaron apenas d ≈ 0.40 [8]. Señal contundente: comentar los pasos/el trabajo, no solo la respuesta final, siempre que el formato capture el trabajo intermedio.

### 8. Retroalimentación de tutoría matemática generada por LLM (2023–2026)

MathDial (EMNLP 2023) construyó 3,000 diálogos de tutoría porque los LLM sin ajustar "fail at tutoring" — generan retroalimentación incorrecta o revelan soluciones demasiado pronto ("telling@k") [9]. SocraticLM y PEARL entrenan modelos para retener las respuestas y en su lugar guiar con preguntas [10][12]. MathTutorBench (EMNLP 2025): la capacidad de resolver problemas **no** se transfiere a una buena tutoría, la pedagogía y la competencia entran en compensación mutua, y la calidad se degrada en diálogos más largos [10]. Los LLM también producen cadenas de razonamiento fluidas pero erróneas, distintas de revelar la respuesta [13]. El único ensayo aleatorizado de campo, Tutor CoPilot (2024, 783 tutores, ~350k mensajes), encontró que las sugerencias de IA aumentaron las preguntas indagatorias y **disminuyeron el elogio genérico**, con una ganancia de dominio de 4 pp (p<0.01), concentrada entre los tutores peor calificados [11]. Las evaluaciones de Khanmigo reportan que supera a GPT-4o sin ajustar en la detección de errores, y que las señales estructuradas de desempeño mejoraron la exactitud del siguiente ítem en ~6% — pero el uso regular se mantiene bajo (~15%) [14].

### 9. Redacción apropiada para la edad

Las guías para la primera infancia (NAEYC, Wisconsin DCF) recomiendan una **retroalimentación descriptiva y específica** en vez de elogios genéricos ("contaste los frijoles otra vez y obtuviste el mismo número" vs. "buen trabajo"), ya que la especificidad permite que el niño conecte la retroalimentación con una acción repetible [15]. El gradiente por edad va desde un lenguaje concreto/sensorial para los niños pequeños hacia un lenguaje metacognitivo abstracto (estrategia, porqué, transferencia) para los estudiantes mayores.

## Implicaciones de diseño para Math Challenge

1. **Estructurar cada mensaje del tutor como feed-up / feed-back / feed-forward**: (a) reformular el objetivo, (b) decir qué ocurrió en relación con él, (c) dar un paso siguiente concreto. Nunca detenerse en (b) — eso deja sin usar la parte de mayor valor del modelo de Hattie & Timperley [1].

2. **Nunca combinar la retroalimentación de la tarea con elogios a nivel "yo"/rasgo en la misma frase.** Prohibir "¡Correcto! Eres muy listo para las matemáticas" — separar la corrección del ánimo, y mantener el ánimo enfocado en el esfuerzo/la estrategia, nunca en la capacidad. Se desprende del hallazgo de Kluger & DeNisi de que la captura de atención a nivel "yo" es el mecanismo probable detrás de que la retroalimentación resulte contraproducente [2][6].

3. **Comentar el trabajo/los pasos del alumno, no solo la respuesta final**, siempre que el formato capture los pasos intermedios. La decisión arquitectónica de mayor impacto según el meta-análisis de ITS de VanLehn (basado en pasos d≈0.76 vs. basado en respuesta d≈0.40) [8].

4. **Mantener la retroalimentación elaborada breve — de 3 a 6 frases, un ejemplo trabajado como máximo.** El efecto adverso de la elaboración excesiva que describe Shute implica que el prompt necesita un límite de longitud explícito, no "explica todo lo que puedas" [5].

5. **No dejar que el tutor revele la respuesta o el método del siguiente problema de forma prematura a mitad del intento** (p. ej., en un flujo de pistas antes de la entrega) — el modo de falla MathDial/"telling@k". Limitar al tutor a pistas socráticas o escalonadas por pasos durante un intento activo, y reservar las explicaciones completas trabajadas para la revisión posterior a la entrega [9][10][12].

6. **Protegerse contra cadenas de razonamiento erróneas presentadas con confianza.** Validar cualquier explicación paso a paso generada contra una solución correcta calculada de forma determinista antes de mostrarla — el LLM debe narrar una derivación conocida como correcta, no volver a derivar libremente las matemáticas, dado que hay cadenas de razonamiento fluidas pero erróneas documentadas [13].

7. **Retroalimentación inmediata para las señales de corrección/finalización** (correcto/incorrecto, puntos obtenidos); un retraso corto (menos de un segundo a unos pocos segundos) está bien para la explicación más profunda del "porqué", pero no al final de la sesión — la retroalimentación inmediata ayuda a la confianza y evita que se siga practicando un procedimiento incorrecto [4].

8. **Reservar la retroalimentación a nivel de patrones para un resumen al final de la sesión**, distinta de la retroalimentación por problema: p. ej., "más rápido en las tablas de multiplicar, más lento en problemas verbales de varios pasos; la próxima sesión incluirá más problemas verbales guiados." Esto corresponde al bucle formativo de Black & Wiliam — usar evidencia agregada para ajustar la *siguiente* unidad didáctica, no solo la siguiente frase [3].

9. **Plantillas de RETROALIMENTACIÓN escalonadas por edad para el prompt del tutor:**

   - **Edades ~4–6:** 1–2 frases breves, concretas/sensoriales, sin hablar de estrategias abstractas. Plantilla: *[observación concreta] → [paso correcto simple] → [elogio al esfuerzo vinculado a la acción específica]*. Ejemplo: "Contaste las manzanas una por una — hay 7, tú dijiste 6; contemos juntos: 1, 2, 3... Cada vez cuentas con más cuidado."
   - **Edades ~7–10:** 3–4 frases que nombran el paso exacto donde se desvió, una estrategia nombrada, elogio al esfuerzo/estrategia. Plantilla: *[lo que hiciste bien] + [el paso exacto donde se desvió] + [por qué funciona el paso correcto] + [ánimo basado en la estrategia]*.
   - **Edades ~11–14:** 4–5 frases que introducen el *porqué* detrás de la regla, invitan a comparar con el enfoque correcto, usan vocabulario de la materia. Plantilla: *[feed up: qué evaluaba el problema] + [feed back: dónde coincidió/se desvió el razonamiento] + [regla correcta con un mini paso trabajado] + [feed forward: un tipo de problema relacionado a vigilar]*.
   - **Edades 15+ / adultos:** Conciso, técnico, entre pares; omitir el relleno de ánimo, enfocarse en la precisión ("correcto pero no mínimo; aquí hay un camino más rápido"), ofrecer profundidad si se solicita.

   Todas las franjas: nunca enmarcar con rasgos fijos ("no eres una persona de matemáticas"); siempre nombrar la acción *específica*, nunca un juicio global.

10. **Retroalimentación por evitar, porque la evidencia dice que resulta contraproducente:** elogio genérico de rasgo/capacidad [6]; elogio inflado/superlativo por una corrección rutinaria [7]; retroalimentación de solo corrección sin camino a seguir cuando la respuesta es incorrecta [5]; revelar la solución completa antes de que termine el intento [9][10]; re-enseñanza larga de material ya dominado [5]; retroalimentación comparativa/normativa ("por detrás de otros niños de tu edad") — el mecanismo exacto de cambio de atención al "yo" detrás de las caídas de desempeño inducidas por la retroalimentación [2].

11. **Vincular la retroalimentación de gamificación a señales de esfuerzo/proceso** (persistencia, uso de estrategias, mejora respecto a la propia línea base), no solo a la velocidad o las rachas, para que la puntuación no reintroduzca retroalimentación enmarcada en la capacidad mediante tablas de clasificación o insignias de talento fijo.

12. **Exigir que el prompt del tutor se autoverifique con una rúbrica breve antes de emitir un mensaje**: separa la tarea del elogio; nombra un paso siguiente concreto; respeta el límite de longitud de la franja de edad; evita revelar respuestas del siguiente intento; cualquier paso trabajado se valida contra una verdad de referencia calculada. Esto convierte las reglas anteriores en una compuerta que se aplica, no en una esperanza.

## Preguntas abiertas para el responsable del proyecto

1. ¿La retroalimentación inmediata por problema y la explicación más completa del tutor de IA deben mostrarse siempre juntas, o las edades 4–6 deberían recibir una reacción simplificada en línea de inmediato y la explicación completa solo en una revisión para padres/de sesión?
2. ¿Actualmente capturamos el trabajo/los pasos intermedios en problemas de varios pasos, no solo la respuesta final? Si no, ¿vale la pena priorizarlo dada la brecha de ITS entre basado en pasos y basado en respuesta (d≈0.76 vs. 0.40)?
3. ¿Los resúmenes al final de la sesión deben ir al niño, al padre o a ambos, con redacción distinta (ánimo dirigido al niño vs. detalle diagnóstico dirigido al padre)?
4. ¿Cómo debe validar el tutor la narración de su solución trabajada contra la verdad de referencia — un solucionador determinista independiente, o una segunda pasada de verificación con LLM?
5. ¿Queremos un recurso de respaldo tipo "maestro novato" (revelar la respuesta correcta sin más) para cuando una explicación socrática/elaborada completa resultaría demasiado lenta o costosa, y a partir de qué umbral de latencia/costo?

## Fuentes

1. Hattie & Timperley (2007). The Power of Feedback, *Review of Educational Research* 77(1). Seguimiento: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).
2. Kluger & DeNisi (1996). The Effects of Feedback Interventions on Performance, *Psychological Bulletin* 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
3. Black & Wiliam (1998). Inside the Black Box, *Phi Delta Kappan*. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).
4. A Meta-Analysis of the Impact of Feedback Timing on Learning Outcomes in Computer-Assisted Learning, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).
5. Shute (2008). Focus on Formative Feedback, *Review of Educational Research* 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).
6. Mueller & Dweck (1998). Praise for Intelligence Can Undermine Children's Motivation and Performance. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).
7. Brummelman et al. (2014, 2017). Person Praise Backfires in Children With Low Self-Esteem; When Parents' Praise Inflates, Children's Self-Esteem Deflates, *Child Development*. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).
8. VanLehn (2011), resumido en: [Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).
9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).
10. MathTutorBench: A Benchmark for Measuring Open-ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).
11. Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).
12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).
13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).
14. Khan Academy Blog. How Khan Academy Is Building a Better AI Tutor. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).
15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
