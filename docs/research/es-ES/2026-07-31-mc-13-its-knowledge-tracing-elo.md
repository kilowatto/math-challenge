# Sistemas de tutoría inteligente y modelado del aprendiz: BKT, DKT, PFA y el enfoque Elo de Math Garden

> Investigación Math Challenge — 2026-07-31 — tema 13

## Resumen ejecutivo (ES)

- BKT (Corbett & Anderson 1995) modela el dominio de una habilidad con cuatro parámetros — `P(L0)` maestría inicial, `P(T)` prob. de aprender, `P(G)` prob. de adivinar, `P(S)` prob. de “resbalón” — con valores de ejemplo ampliamente citados `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (motor de MATHia) combina “model tracing” (reglas de producción paso a paso) con knowledge tracing (dominio agregado por habilidad); son mecanismos distintos y a menudo confundidos [2].
- La evidencia de eficacia es mixta: What Works Clearinghouse (2016) califica Cognitive Tutor Algebra I como “efectos mixtos” en álgebra (+4 puntos, rango -7 a +19) y “sin efecto discernible” en logro general; Geometry obtuvo efecto potencialmente negativo (-8) [3].
- El ensayo de RAND (Pane et al. 2014) no halló efecto en el año 1 y sí ~0,21 desviaciones estándar en el año 2 — la eficacia dependió de la fidelidad de implementación [4].
- DKT (Piech et al. 2015) reportó AUC 0,86 vs 0,68 de BKT en ASSISTments, pero Khajah et al. (2016) mostraron que la comparación fue injusta: BKT bien replicado llega a 0,73, y variantes extendidas casi igualan a DKT [5][6].
- PFA y AFM son alternativas de regresión logística a BKT: cuentan aciertos/errores previos por componente de conocimiento sin estado bayesiano oculto [7][8].
- El sistema más relevante aquí es Math Garden (Rekentuin, U. Ámsterdam / Oefenweb): una variante Elo que re‑estima habilidad e ítem con cada respuesta, sin calibración por lotes [9].
- Su regla “high-speed high-stakes” (HSHS, Maris & van der Maas 2010/2012) combina precisión y tiempo: `score = a_i · (d_i − RT) · (2·acc − 1)`, con `d_i` límite de tiempo, `a_i` factor de escala, `acc ∈ {0,1}` [10].
- Bajo esta regla el modelo de acierto es exactamente el 2PL de TRI, con `d_i` como parámetro de discriminación — un puente entre TRI clásica y calificación en tiempo real [10].
- Math Garden muestrea ítems para ~75 % de éxito, coherente con la literatura de “dificultad deseable” (banda óptima ~70‑85 %) [9][11].
- Validez convergente de HSHS con CITO: r=0,78‑0,84; en ajedrez, HSHS correlacionó más con FIDE que el conteo simple [10].
- Recomendación: implementar primero Elo/HSHS (no BKT completo) — requiere solo un factor K/incertidumbre, actualiza en O(1) por respuesta (ideal para Durable Objects), y ya está validado en un dominio casi idéntico (aritmética infantil).

## Executive summary (EN)
ITS research se divide en dos linajes a menudo confundidos: **trazado de modelo** (trazar la solución paso a paso del estudiante contra reglas de producción — el mecanismo original de Cognitive Tutor) y **trazado de conocimiento** (seguir el dominio agregado de habilidades a lo largo de los intentos — Bayesian Knowledge Tracing y sus sucesores) [2]. La evidencia de eficacia del producto insignia de trazado de modelo, Cognitive Tutor/MATHia de Carnegie Learning, es genuinamente mixta: la revisión de 2016 del What Works Clearinghouse lo califica como «mixed effects» en álgebra, «no discernible effects» en el logro general de matemáticas y «potentially negative» para la variante de Geometría [3]. El gran ensayo aleatorizado de RAND no encontró efecto en el primer año y un modesto efecto de 0,21 DE en el segundo año, dependiente de la fidelidad de implementación [4] — la tutoría adaptativa no es automáticamente eficaz.

Bayesian Knowledge Tracing (BKT) es un modelo de Markov oculto de cuatro parámetros (maestría inicial, tasa de aprendizaje, conjetura, error) con ecuaciones de actualización en forma cerrada [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) sustituyó esto por una LSTM e informó grandes ganancias de AUC, pero una replicación rigurosa (Khajah, Lindsey & Mozer 2016) descubrió que la comparación original subestimó a BKT, y que una BKT ampliada cierra la mayor parte de la brecha [5][6]. Performance Factors Analysis y el Additive Factors Model ofrecen una alternativa de regresión logística más sencilla que se ajusta incrementalmente [7][8].

El arte previo más directamente aplicable es **Math Garden (Rekentuin)**, desarrollado en la Universidad de Ámsterdam, comercializado como Oefenweb/Prowise Learn: un sistema de práctica de aritmética adaptativo por ordenador para niños que actualiza la capacidad del alumno y la dificultad del ítem tras cada respuesta usando una variante de Elo combinada con la «regla de puntuación de alta velocidad y alta apuesta (HSHS)» (Maris & van der Maas, 2010/2012), puntuando cada intento tanto por la corrección como por el tiempo de respuesta [9][10]. Esta es la base de la recomendación concreta que se expone a continuación.

## Findings

### 1. Model tracing vs. knowledge tracing

La arquitectura original de Cognitive Tutor se basa en el **trazado de modelo**: las acciones del estudiante se comparan paso a paso con un modelo experto construido a partir de reglas de producción (análisis de tareas cognitivas ACT‑R), lo que permite pistas contextuales y just‑in‑time [2]. Encima, el **rastreo de conocimiento** monitoriza el dominio gradual de cada habilidad (componente de conocimiento) a lo largo de las actividades de resolución de problemas, actualizando la probabilidad de que una regla sea “conocida” cada vez que se ejerce, independientemente del problema concreto del que provenga el paso [1][2]. Para un juego de aritmética/lógica autocontenido como Math Challenge — ítems discretos y bien especificados en lugar de pruebas abiertas de varios pasos — el rastreo de conocimiento (o su variante Elo) es el mecanismo pertinente; el trazado de modelo completo es adecuado para la verificación paso a paso de derivaciones de álgebra/geomtría y es poco probable que sea necesario aquí.

### 2. Bayesian Knowledge Tracing: the four parameters and update equations

El Rastreo de Conocimiento Bayesiano (BKT) (Corbett & Anderson, 1994/1995) dispone de cuatro parámetros por habilidad: `P(L0)` (probabilidad inicial de que la habilidad sea conocida), `P(T)` (probabilidad de pasar de desconocida a conocida en cualquier oportunidad), `P(G)` (probabilidad de adivinar correctamente estando desconocida) y `P(S)` (probabilidad de un desliz — respuesta incorrecta pese a conocer la habilidad) [1]. Según la re‑derivación de van de Sande (2013), las dos ecuaciones rectoras son:

- Actualización del aprendizaje: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Corrección predicha: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

y la actualización posterior en línea (por observación) utilizada por el algoritmo de Rastreo de Conocimiento en tiempo real es la regla de Bayes aplicada al resultado observado, para después avanzar un paso de aprendizaje:

- Si es correcto: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- Si es incorrecto: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Luego: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Un conjunto de parámetros muy usado (coincidente con el modelo ilustrativo de Baker et al. 2008, reproducido en la Fig. 3 de van de Sande) es `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande también demuestra que BKT solo se comporta bien (monótonamente no degenerado) cuando `P(G)+P(S) < 1`, y que su forma de cadena de Markov oculta es identificable solo hasta tres parámetros combinados a menos que se ajuste con el algoritmo recursivo por observación — una advertencia publicada sobre el ajuste de parámetros, no meramente un detalle de implementación [1].

### 3. Efficacy evidence — mixed, not uniformly positive

El informe de WWC de junio 2016 revisó 22 estudios candidatos, 7 de los cuales cumplen los estándares de diseño grupal, abarcando 12.840 estudiantes en 118 ubicaciones [3]. Valoraciones: Cognitive Tutor Algebra I → **efectos mixtos** en álgebra (índice de mejora +4, rango −7 a +19, 5 estudios/12.182 estudiantes, evidencia “media a grande”) y **sin efectos discernibles** en el logro de matemáticas generales (+2, 1 estudio, evidencia “pequeña”); Cognitive Tutor Geometry → **posibles efectos negativos** (−8, 1 estudio, evidencia “pequeña”) [3]. El ensayo cluster‑aleatorizado de RAND (Pane et al., 2014) no encontró diferencia en el primer año y sí un efecto significativo de +0,21 SD en el segundo año (≈50.º→58.º percentil), atribuido en gran medida a la madurez de la implementación [4]. Conclusión: el tamaño del efecto es modesto y depende de la implementación, no es una victoria garantizada del algoritmo por sí solo.

### 4. Deep Knowledge Tracing and the fairness controversy

Piech et al. (2015) introdujeron DKT, modelando secuencias de interacción con una LSTM: AUC 0,86 en ASSISTments (vs. 0,68 BKT) y 0,85 en Khan Academy (vs. 0,68 BKT, 0,63 baseline marginal) [5], interpretado como prueba de que el aprendizaje profundo domina al BKT. Khajah, Lindsey & Mozer (2016) mostraron que la comparación subestimó al BKT: una re‑implementación correcta alcanzó 0,73 (vs. 0,67 reportado) con los mismos datos, y al ampliar BKT con olvido, capacidad por estudiante y descubrimiento de habilidades se cerró la mayor parte de la brecha [6]. Lección: no asumir que un modelo más sofisticado supera a uno simple bien ajustado sin comprobarlo — las necesidades de datos y cómputo de DKT (secuencias largas, habilidades opacas) también encajan pobremente con un producto que necesita una dificultad interpretable y amigable desde el primer día.

### 5. Performance Factors Analysis and the Additive Factors Model

El AFM (Cen, Koedinger & Junker) modela el acierto mediante regresión logística sobre tres términos aditivos por componente de conocimiento: intercepto de habilidad del estudiante, intercepto de facilidad del KC y pendiente de tasa de aprendizaje del KC multiplicada por oportunidades previas [7]. El PFA (Pavlik, Cen & Koedinger, 2009) amplía esto sustituyendo el “recuento de oportunidades” por recuentos separados de aciertos y fallos previos por KC [7][8]. Ambos se ajustan en línea mediante regresión logística incremental, sin necesidad de una pasada EM/búsqueda en cuadrícula, a diferencia del BKT completo.

### 6. Elo/IRT-based adaptive difficulty, and Math Garden specifically

La idea central del IRT: la probabilidad de acierto es una función logística de la habilidad latente menos la dificultad del ítem (1PL), opcionalmente escalada por discriminación (2PL) y un piso de adivinanza (3PL); las pruebas adaptativas eligen, tras cada respuesta, el ítem sin contestar que maximiza la información según la estimación actual de la habilidad [12]. La Regresión de Media Vida de Duolingo (Settles & Meeder 2016) es similar pero distinta: ajusta una curva exponencial de olvido por ítem/estudiante a partir de características lingüísticas/históricas para predecir el momento del olvido, optimizando la temporización de la repetición espaciada en lugar de la selección basada en la dificultad [13].

**Math Garden (Rekentuin)**, del departamento de métodos psicológicos de la Universidad de Ámsterdam (2007), ahora comercializado por Oefenweb/Prowise Learn, es el análogo más cercano al objetivo de Math Challenge de puntuar velocidad y precisión simultáneamente [9]. Aplica una variante del Elo (1978) en la que la habilidad del estudiante y la dificultad del ítem se reestiman con cada ítem respondido — sin lote de calibración offline, lo que permite la calibración en tiempo real de contenido recién creado [9]. Los ítems en la validación de 2011 se seleccionaron para alcanzar una probabilidad media de éxito de ,75 [9], justo dentro del rango del 70–80 % que persigue este proyecto, y se validó empíricamente contra el rendimiento real de niños.

El mecanismo de puntuación — tomado directamente del artículo “High Speed High Stakes Scoring Rule” de Klinkenberg — se remonta a van der Maas & Wagenmakers (2005), que asignaron a cada ítem un límite de tiempo `d` y puntuaron una respuesta como tiempo restante multiplicado por la exactitud binaria: `score = acc · (d − RT)` (0 si es incorrecto, una respuesta más rápida obtiene una puntuación mayor si es correcta) [10]. Este esquema premiaba la adivinanza arriesgada en ítems que parecían demasiado duros (adivinar era gratuito), de modo que Maris & van der Maas (2010) hicieron la precisión simétrica (`{-1,+1}` en lugar de `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

donde `d_i` es el límite de tiempo del ítem, `RT` el tiempo de respuesta, `acc ∈ {0,1}` la corrección, `a_i` un factor de escala del ítem — una respuesta rápida e incorrecta se vuelve fuertemente negativa, eliminando el incentivo a adivinar y abandonar [10]. Maris & van der Maas (2012, Psychometrika) demostraron que bajo esta regla el modelo implícito de probabilidad de acierto es exactamente el modelo IRT 2PL, con el límite de tiempo `d` actuando como discriminación del ítem — un puente claro entre una regla de puntuación en tiempo real y el IRT clásico [10]. Validado empíricamente: las puntuaciones HSHS correlacionaron r=,78–,84 con las puntuaciones CITO holandesas en cuatro operaciones aritméticas, y en un conjunto de datos de ajedrez (CORUS 2008) correlacionaron más con el Elo de la FIDE (r=,808) que con la suma simple de aciertos (r=,575) [10].

### 7. Practical Elo mechanics for adaptive item selection

La literatura más amplia sobre Elo en aprendizaje adaptativo (Pelánek, “Applications of the Elo Rating System in Adaptive Educational Systems”) enmarca la misma actualización bidireccional como en el ajedrez: tras cada intento, la puntuación del alumno y la dificultad del ítem se desplazan uno hacia el otro de forma proporcional a la sorpresa (resultado real menos esperado, función logística de la brecha de puntuación), escalada por una “función de incertidumbre” que cumple el papel del factor K del ajedrez — mayor para ítems/alumnos recién creados, y decreciente a medida que se acumulan observaciones [14].

## Design implications for Math Challenge

1. **Implementar primero un modelo tipo Elo/HSHS al estilo de Math Garden, y no el BKT completo.** BKT necesita ajuste de parámetros por competencia (búsqueda en cuadrícula o EM) antes de comportarse de forma razonable [1]; Elo con HSHS actualiza la valoración del aprendiz y la del ítem por intento en forma cerrada, sin calibración offline — ideal para un gran banco de ítems en crecimiento en vivo desde el primer día.

2. **Fórmula de puntuación concreta:** para un ítem cronometrado con límite `d_i` (segundos), tiempo de respuesta `RT`, corrección `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, recortando `RT` a `d_i` si puede superar el límite [10]. Comenzar con `a_i = 1` para todos los ítems; introducir discriminación por ítem solo cuando haya suficientes datos para estimarla (Maris & van der Maas demuestran que `a_i`/`d_i` están entrelazados con la discriminación 2PL) [10].

3. **Regla de actualización:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (logística estándar de Elo), `actual = score / (a_i·d_i)` reescalado a `[0,1]`, luego `ability += K_learner · (actual − expected)` y `difficulty −= K_item · (actual − expected)` [9][14].

4. **Calendario del factor K:** hacer decaer la función de incertidumbre en lugar de usar un K constante — grande (p. ej., ≈0,5–1,0) para los primeros ~10–20 intentos de un aprendiz o de un ítem, reduciéndose a un pequeño estado estable (≈0,05–0,1) posteriormente, imitando la gestión de arranque en frío frente a estado estable en sistemas educativos basados en Elo [14]. Registrar un contador de intentos por competencia del aprendiz y por ítem para impulsar esta decaída.

5. **La estimación de la dificultad del ítem es online por construcción:** cada intento sobre el ítem `i` ajusta ligeramente su valoración de dificultad, de modo que un ítem recién creado obtiene una dificultad provisional tras unas cuantas respuestas, sin necesidad de pretest — la mayor ventaja práctica de Elo sobre BKT/DKT/PFA, que asumen una taxonomía fija y/o un paso de ajuste por lotes [1][7][9].

6. **Tasa de éxito objetivo para la selección de ítems: 70–80 %, centrada alrededor del 75 %**, coincidiendo con el objetivo validado de .75 de Math Garden [9] y la literatura más amplia sobre dificultad deseable [11]. Cuando se seleccione el siguiente ítem para la capacidad `θ`, escoger entre los ítems cuya dificultad `β_i` sitúe `expected(θ, β_i)` en `[0.70, 0.80]`; muestrear entre los 3–5 ítems elegibles de dificultad más cercana en lugar de siempre el coincidente más próximo, para evitar saltos visiblemente repetitivos.

7. **Esquema D1 mínimo por intento:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Almacenar las valoraciones antes/después (no solo el estado actual) hace que el historial sea auditable y reproducible, y permite la comparación offline con un experimento posterior de BKT/PFA sin volver a instrumentar.

8. **Separar la dificultad del ítem de los metadatos de dificultad de contenido.** Almacenar una etiqueta de curso/nivel asignada por el autor de forma independiente de la valoración Elo en tiempo real; usarla solo como prior de arranque en frío (semilla cerca de la valoración media de los ítems con la misma etiqueta), dejando que la valoración en tiempo real tome el control tras ~10 respuestas — esto evita que un ítem mal etiquetado nunca sea dirigido a los aprendices que revelarían su verdadera dificultad.

9. **Objeto Durable para la ruta crítica, D1 como libro mayor.** La actualización O(1) por evento de Elo encaja en un Objeto Durable que mantiene la valoración en tiempo real de un aprendiz (y una partición de valoraciones de ítems activos), volcando cada intento como una fila D1 solo de anexado; esto evita carreras de lectura‑modificación‑escritura en filas de ítems compartidas que sufre un diseño ingenuo solo D1 bajo concurrencia real.

10. **Diferir BKT/PFA/DKT a una capa v2 de «maestría de competencias», no a la selección de ítems v1.** Cuando exista suficiente historial D1, un lote nocturno de BKT/PFA por competencia de gran granularidad puede alimentar paneles de maestría y señales dirigidas a los padres — una superficie distinta de la selección en tiempo real, y mezclar ambos prematuramente arriesga repetir la trampa de equidad DKT/BKT [5][6].

11. **No esperar que el algoritmo por sí solo garantice mejoras de aprendizaje.** Los hallazgos mixtos/nulos/negativos de WWC para un producto maduro [3] y el resultado nulo de RAND en el primer año [4] demuestran que la dificultad adaptativa es necesaria pero no suficiente. Realizar pruebas A/B del modelo de aprendiz contra una escalera fija simple antes de atribuir los aumentos de compromiso específicamente a Elo.

12. **Protegerse contra explotaciones de adivinanzas arriesgadas.** La transformación `(2·acc−1)` existe para hacer costosos los errores rápidos [10] — comprobar en QA que pulsar respuestas aleatorias rápidamente no supere al compromiso genuino, sobre todo en usuarios jóvenes que pueden no leer la estructura de incentivos como lo haría un adulto.

## Open questions for the project owner

1. ¿Debería el límite de tiempo `d_i` por ítem fijarse según la banda de edad/curso, o ser él mismo un parámetro estimado en tiempo real (según el resultado de equivalencia 2PL)?

2. Para usuarios muy jóvenes (de 4 a 6 años) que pueden no operar de forma fiable una interfaz de temporizador, ¿debería aplicarse HSHS en absoluto, o debería el contenido de primera infancia usar una regla basada solo en la precisión hasta que el niño alcance una edad que le permita jugar con temporizador?

3. ¿Una escala Elo global por aprendiz, o escalas por dominio (aritmética vs. lógica vs. geometría) que no se comparen directamente?

4. ¿Está la capa nocturna por lotes de maestría BKT/PFA (§10) dentro del alcance del mismo hito que el selector Elo en tiempo real, o corresponde a una fase posterior?

5. ¿Qué tolerancia de error de arranque en frío es aceptable para ítems recién creados — cuántas respuestas se requieren antes de que una valoración de dificultad sea lo suficientemente «fiable» para dirigirlo de forma amplia?

## Sources

1. Van de Sande (2013). "Properties of the Bayesian Knowledge Tracing Model." JEDM 5(2). https://files.eric.ed.gov/fulltext/EJ1115329.pdf
2. Koedinger & Corbett (2006). Cognitive Tutors — model tracing vs. knowledge tracing. PACT Center, CMU. https://pact.cs.cmu.edu/pubs/koedingercorbett06.pdf
3. What Works Clearinghouse (June 2016). "Cognitive Tutor" Intervention Report. https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_cognitivetutor_062116.pdf
4. Pane, Griffin, McCaffrey & Karam (2014). "Effectiveness of Cognitive Tutor Algebra I at Scale." RAND. https://www.rand.org/pubs/research_briefs/RB9746.html
5. Piech et al. (2015). "Deep Knowledge Tracing." NeurIPS 28. https://arxiv.org/pdf/1506.05908
6. Khajah, Lindsey & Mozer (2016). "How Deep is Knowledge Tracing?" https://arxiv.org/pdf/1604.02416
7. Pavlik, Cen & Koedinger (2009). "Performance Factors Analysis." https://files.eric.ed.gov/fulltext/ED506305.pdf
8. Cen, Koedinger & Junker — Additive/Instructional Factors Analysis. https://www.cs.cmu.edu/~ggordon/chi-etal-ifa.pdf
9. Klinkenberg, Straatemeier & van der Maas (2011). "Computer adaptive practice of Maths ability..." Computers & Education 57, 1813–1824. https://www.klinkenberg.amsterdam/publication/math-garden/
10. Klinkenberg, "High Speed High Stakes Scoring Rule" (SURF report), building on Maris & van der Maas (2012) Psychometrika 77, 615–633. https://www.surf.nl/files/2019-04/Artikel%20High%20Speed%20High%20Stakes%20Scoring%20Rule.pdf ; https://link.springer.com/article/10.1007/s11336-012-9288-y
11. Wilson et al. (2019). "The Eighty Five Percent Rule for optimal learning." Nature Communications. https://www.nature.com/articles/s41467-019-12552-4
12. IRT basics (1PL/2PL/3PL, adaptive selection via maximum information). https://www.cogn-iq.org/learn/theory/item-response-theory/
13. Settles & Meeder (2016). "A Trainable Spaced Repetition Model for Language Learning" (Duolingo HLR). ACL. https://research.duolingo.com/papers/settles.acl16.pdf
14. Pelánek. "Applications of the Elo Rating System in Adaptive Educational Systems." Computers & Education. https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf
