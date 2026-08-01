# Sistemas tutores inteligentes y modelado del alumno: BKT, DKT, PFA y el enfoque Elo de Math Garden

> Investigación Math Challenge — 2026-07-31 — tema 13

## Resumen ejecutivo (ES)

- BKT (Corbett & Anderson 1995) modela el dominio de una habilidad con cuatro parámetros — `P(L0)` maestría inicial, `P(T)` prob. de aprender, `P(G)` prob. de adivinar, `P(S)` prob. de "resbalón" — con valores de ejemplo ampliamente citados `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (motor de MATHia) combina "model tracing" (reglas de producción paso a paso) con knowledge tracing (dominio agregado por habilidad); son mecanismos distintos y a menudo confundidos [2].
- La evidencia de eficacia es mixta: What Works Clearinghouse (2016) califica Cognitive Tutor Algebra I como "efectos mixtos" en álgebra (+4 puntos, rango -7 a +19) y "sin efecto discernible" en logro general; Geometry obtuvo efecto potencialmente negativo (-8) [3].
- El ensayo de RAND (Pane et al. 2014) no halló efecto en el año 1 y sí ~0.21 desviaciones estándar en el año 2 — la eficacia dependió de la fidelidad de implementación [4].
- DKT (Piech et al. 2015) reportó AUC 0.86 vs 0.68 de BKT en ASSISTments, pero Khajah et al. (2016) mostraron que la comparación fue injusta: BKT bien replicado llega a 0.73, y variantes extendidas casi igualan a DKT [5][6].
- PFA y AFM son alternativas de regresión logística a BKT: cuentan aciertos/errores previos por componente de conocimiento sin estado bayesiano oculto [7][8].
- El sistema más relevante aquí es Math Garden (Rekentuin, U. Ámsterdam / Oefenweb): una variante Elo que re-estima habilidad e ítem con cada respuesta, sin calibración por lotes [9].
- Su regla "high-speed high-stakes" (HSHS, Maris & van der Maas 2010/2012) combina precisión y tiempo: `score = a_i · (d_i − RT) · (2·acc − 1)`, con `d_i` límite de tiempo, `a_i` factor de escala, `acc ∈ {0,1}` [10].
- Bajo esta regla el modelo de acierto es exactamente el 2PL de TRI, con `d_i` como parámetro de discriminación — un puente entre TRI clásica y calificación en tiempo real [10].
- Math Garden muestrea ítems para ~75% de éxito, coherente con la literatura de "dificultad deseable" (banda óptima ~70-85%) [9][11].
- Validez convergente de HSHS con CITO: r=0.78-0.84; en ajedrez, HSHS correlacionó más con FIDE que el conteo simple [10].
- Recomendación: implementar primero Elo/HSHS (no BKT completo) — requiere solo un factor K/incertidumbre, actualiza en O(1) por respuesta (ideal para Durable Objects), y ya está validado en un dominio casi idéntico (aritmética infantil).

## Executive summary (EN)

ITS research splits into two often-conflated lineages: **model tracing** (tracing a student's step-by-step solution against production rules — Cognitive Tutor's original mechanism) and **knowledge tracing** (tracking aggregate skill mastery across attempts — Bayesian Knowledge Tracing and successors) [2]. Efficacy evidence for the flagship model-tracing product, Carnegie Learning's Cognitive Tutor/MATHia, is genuinely mixed: the What Works Clearinghouse's 2016 review rates it "mixed effects" on algebra, "no discernible effects" on general math achievement, and "potentially negative" for the Geometry variant [3]. RAND's large randomized trial found no year-one effect and a modest 0.21 SD effect in year two, contingent on implementation fidelity [4] — adaptive tutoring is not automatically effective.

Bayesian Knowledge Tracing (BKT) is a four-parameter hidden Markov model (initial mastery, learning rate, guess, slip) with closed-form update equations [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) replaced this with an LSTM and reported large AUC gains, but a rigorous replication (Khajah, Lindsey & Mozer 2016) found the original comparison undersold BKT, and that extended BKT closes most of the gap [5][6]. Performance Factors Analysis and the Additive Factors Model offer a simpler logistic-regression alternative that fits incrementally [7][8].

The most directly applicable prior art is **Math Garden (Rekentuin)**, built at the University of Amsterdam, commercialized as Oefenweb/Prowise Learn: a computer-adaptive arithmetic practice system for children that updates learner ability and item difficulty after every response using an Elo variant combined with the **high-speed high-stakes (HSHS) scoring rule** (Maris & van der Maas, 2010/2012), scoring each attempt on both correctness and response time [9][10]. This is the basis of the concrete recommendation below.

## Hallazgos

### 1. Model tracing vs. knowledge tracing

La arquitectura original de Cognitive Tutor se apoya en **model tracing**: las acciones del alumno se comparan paso a paso contra un modelo experto construido a partir de reglas de producción (análisis de tareas cognitivas ACT-R), lo que permite pistas justo a tiempo y sensibles al contexto [2]. Sobre esa base, **knowledge tracing** monitorea el dominio gradual de cada habilidad (componente de conocimiento) a lo largo de las actividades de resolución de problemas, actualizando la probabilidad de que una regla esté "dominada" cada vez que se ejercita, independientemente de en qué problema específico ocurrió el paso [1][2]. Para un juego autocontenido de aritmética/lógica como Math Challenge — ítems discretos y bien especificados, no demostraciones abiertas de varios pasos — knowledge tracing (o su primo, Elo) es el mecanismo relevante; el model tracing completo se adapta mejor a la verificación de pasos en derivaciones de álgebra/geometría y no es probable que se necesite aquí.

### 2. Bayesian Knowledge Tracing: los cuatro parámetros y las ecuaciones de actualización

BKT (Corbett & Anderson, 1994/1995) tiene cuatro parámetros por habilidad: `P(L0)` (probabilidad inicial de que la habilidad se domine), `P(T)` (probabilidad de pasar de no dominada a dominada en cualquier oportunidad), `P(G)` (probabilidad de adivinar correctamente sin dominarla), `P(S)` (probabilidad de un "resbalón" — una respuesta incorrecta a pesar de dominar la habilidad) [1]. Según la re-derivación de van de Sande (2013), las dos ecuaciones rectoras son:

- Actualización de aprendizaje: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Corrección predicha: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

y la actualización posterior en línea (por observación) que usa el "Knowledge Tracing Algorithm" en tiempo real es la regla de Bayes aplicada al resultado observado, avanzando después un paso de aprendizaje:

- Si es correcta: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- Si es incorrecta: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Luego: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Un conjunto de parámetros de ejemplo ampliamente usado (que coincide con el modelo ilustrativo de Baker et al. 2008, reproducido en la Fig. 3 de van de Sande) es `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande también demuestra que BKT solo se comporta bien (no degenera de forma monotónica) cuando `P(G)+P(S) < 1`, y que su forma de cadena oculta de Markov solo es identificable hasta tres parámetros combinados a menos que se ajuste con el algoritmo recursivo por observación — una advertencia publicada sobre el ajuste de parámetros, no solo un detalle de implementación [1].

### 3. Evidencia de eficacia — mixta, no uniformemente positiva

El informe de WWC de junio de 2016 revisó 22 estudios candidatos, de los cuales 7 cumplieron los estándares de diseño grupal, abarcando 12,840 estudiantes en 118 ubicaciones [3]. Calificaciones: Cognitive Tutor Algebra I → **efectos mixtos** en álgebra (índice de mejora +4, rango −7 a +19, 5 estudios/12,182 estudiantes, evidencia "mediana a grande") y **sin efectos discernibles** en el logro matemático general (+2, 1 estudio, evidencia "pequeña"); Cognitive Tutor Geometry → **efectos potencialmente negativos** (−8, 1 estudio, evidencia "pequeña") [3]. El ensayo aleatorizado por conglomerados de RAND (Pane et al., 2014) no halló diferencia en el año uno y sí un efecto significativo de +0.21 DE en el año dos (≈percentil 50→58), atribuido en gran parte a la madurez de la implementación [4]. Conclusión: el tamaño del efecto es modesto y depende de la implementación, no una victoria garantizada solo por el algoritmo.

### 4. Deep Knowledge Tracing y la controversia sobre la equidad de la comparación

Piech et al. (2015) presentaron DKT, que modela secuencias de interacción con una LSTM: AUC de 0.86 en ASSISTments (vs. 0.68 de BKT) y 0.85 en Khan Academy (vs. 0.68 de BKT, 0.63 de línea base marginal) [5], leído como prueba de que el aprendizaje profundo domina a BKT. Khajah, Lindsey & Mozer (2016) mostraron que la comparación subestimó a BKT: una reimplementación correcta alcanzó 0.73 (vs. 0.67 reportado) con los mismos datos, y extender BKT con olvido, habilidad por estudiante y descubrimiento de habilidades cerró la mayor parte de la brecha [6]. Lección: no asumir que un modelo más sofisticado supera a uno simple bien ajustado sin comprobarlo — las necesidades de datos/cómputo de DKT (secuencias grandes, habilidades opacas) tampoco encajan bien con un producto que necesita una dificultad interpretable y amigable con el arranque en frío desde el primer día.

### 5. Performance Factors Analysis y el Additive Factors Model

AFM (Cen, Koedinger & Junker) modela la corrección mediante regresión logística sobre tres términos aditivos por componente de conocimiento: un intercepto de habilidad del estudiante, un intercepto de facilidad del KC, y una pendiente de tasa de aprendizaje del KC multiplicada por las oportunidades previas [7]. PFA (Pavlik, Cen & Koedinger, 2009) extiende esto reemplazando el "conteo de oportunidades" por **conteos separados de aciertos y errores previos** por KC [7][8]. Ambos se ajustan en línea mediante regresión logística incremental, sin necesitar una pasada de EM/búsqueda en cuadrícula como sí requiere BKT completo.

### 6. Dificultad adaptativa basada en Elo/TRI, y Math Garden en específico

La idea central de TRI: la probabilidad de acierto es una función logística de la habilidad latente menos la dificultad del ítem (1PL), opcionalmente escalada por discriminación (2PL) y un piso de adivinanza (3PL); la prueba adaptativa elige, después de cada respuesta, el ítem sin responder que maximiza la información en la estimación actual de habilidad [12]. La Half-Life Regression de Duolingo (Settles & Meeder 2016) está relacionada pero es distinta: ajusta una curva de olvido exponencial por ítem/estudiante a partir de características lingüísticas/de historial para predecir el momento del olvido, optimizando el momento de la repetición espaciada en vez de la selección basada en dificultad [13].

**Math Garden (Rekentuin)**, del departamento de métodos psicológicos de la Universidad de Ámsterdam (2007), hoy comercializado por Oefenweb/Prowise Learn, es el análogo más cercano al objetivo de Math Challenge de calificar velocidad y exactitud juntas [9]. Aplica una variante de Elo (1978) donde la habilidad del estudiante y la dificultad del ítem se reestiman con cada ítem respondido — sin lote de calibración fuera de línea, lo que permite calibrar sobre la marcha contenido recién creado [9]. Los ítems en la validación de 2011 se muestrearon para apuntar a una probabilidad de éxito promedio de **.75** [9], justo dentro de la banda de 70–80% que este proyecto tiene como objetivo, y validados empíricamente contra el desempeño de niños reales.

El mecanismo de calificación — leído directamente del artículo de Klinkenberg "High Speed High Stakes Scoring Rule" — se remonta a van der Maas & Wagenmakers (2005), quienes dieron a cada ítem un límite de tiempo `d` y calificaron una respuesta como el tiempo restante multiplicado por la exactitud binaria: `score = acc · (d − RT)` (0 si es incorrecta, más rápido puntúa más alto si es correcta) [10]. Esto premiaba adivinar arriesgadamente en ítems que parecían demasiado difíciles (adivinar era gratis), así que Maris & van der Maas (2010) hicieron simétrica la exactitud (`{-1,+1}` en vez de `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

donde `d_i` es el límite de tiempo del ítem, `RT` el tiempo de respuesta, `acc ∈ {0,1}` la exactitud, `a_i` un factor de escala del ítem — una respuesta incorrecta rápida se vuelve fuertemente negativa, eliminando el incentivo de adivinar y huir [10]. Maris & van der Maas (2012, Psychometrika) demostraron que bajo esta regla el modelo implícito de probabilidad de acierto es **exactamente el modelo 2PL de TRI**, con el límite de tiempo `d` actuando como discriminación del ítem — un puente limpio entre una regla de calificación en tiempo real y la TRI clásica [10]. Validado empíricamente: las calificaciones HSHS correlacionaron r=.78–.84 con los puntajes CITO holandeses en cuatro operaciones aritméticas, y en un conjunto de datos de ajedrez (CORUS 2008) correlacionaron más con el Elo de la FIDE (r=.808) que el simple conteo de aciertos (r=.575) [10].

### 7. Mecánica práctica de Elo para la selección adaptativa de ítems

La literatura más amplia sobre Elo en aprendizaje adaptativo (Pelánek, "Applications of the Elo Rating System in Adaptive Educational Systems") plantea la misma actualización de dos lados que el ajedrez: después de cada intento, la calificación del alumno y la dificultad del ítem se mueven una hacia la otra en proporción a la sorpresa (resultado real menos esperado, una función logística de la brecha de calificación), escalada por una "función de incertidumbre" que cumple el papel del factor K del ajedrez — mayor para ítems/alumnos totalmente nuevos, y que se reduce a medida que se acumulan observaciones [14]. Este es el mecanismo recomendado a continuación.

## Implicaciones de diseño para Math Challenge

1. **Implementar primero un modelo Elo/HSHS al estilo Math Garden, no BKT completo.** BKT necesita ajuste de parámetros por habilidad (búsqueda en cuadrícula o EM) antes de comportarse razonablemente [1]; Elo con HSHS actualiza la calificación del alumno y del ítem por intento en forma cerrada, sin calibración fuera de línea — ideal para un banco de ítems grande y creciente, en vivo desde el primer día.

2. **Fórmula concreta de calificación:** para un ítem cronometrado con límite `d_i` (segundos), tiempo de respuesta `RT`, exactitud `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, recortando `RT` a `d_i` si puede exceder el límite [10]. Empezar con `a_i = 1` para todos los ítems; introducir discriminación por ítem solo cuando exista suficiente información para estimarla (Maris & van der Maas muestran que `a_i`/`d_i` están entrelazados con la discriminación 2PL) [10].

3. **Regla de actualización:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (logística Elo estándar), `actual = score / (a_i·d_i)` reescalada a `[0,1]`, luego `ability += K_learner · (actual − expected)` y `difficulty −= K_item · (actual − expected)` [9][14].

4. **Programa del factor K:** hacer decaer la función de incertidumbre en vez de usar una K constante — grande (p. ej., ≈0.5–1.0) durante los primeros ~10–20 intentos de un alumno o ítem, reduciéndose después a un estado estable pequeño (≈0.05–0.1), reflejando el manejo de arranque en frío vs. estado estable en los sistemas educativos basados en Elo [14]. Llevar un contador de intentos por habilidad-alumno y por ítem para impulsar este decaimiento.

5. **La estimación de dificultad del ítem es en línea por construcción:** cada intento sobre el ítem `i` ajusta ligeramente su calificación de dificultad, así que un ítem totalmente nuevo obtiene una dificultad provisional tras un puñado de respuestas, sin necesitar preprueba — la mayor ventaja práctica de Elo sobre BKT/DKT/PFA, que asumen una taxonomía fija y/o un paso de ajuste por lotes [1][7][9].

6. **Tasa de éxito objetivo para la selección de ítems: 70–80%, centrada cerca de 75%**, coincidiendo con el objetivo validado de .75 de Math Garden [9] y con la literatura más amplia sobre dificultad deseable [11]. Al seleccionar el siguiente ítem para una habilidad `θ`, elegir entre los ítems cuya dificultad `β_i` ponga `expected(θ, β_i)` en `[0.70, 0.80]`; muestrear entre los 3–5 ítems elegibles de dificultad más cercana, en vez de siempre el único más próximo, para evitar saltos visiblemente repetitivos.

7. **Esquema mínimo de D1 por intento:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Guardar las calificaciones antes/después (no solo el estado actual) hace que el historial sea auditable y reproducible, y permite comparar sin conexión contra un experimento posterior de BKT/PFA sin volver a instrumentar.

8. **Separar la dificultad del ítem de los metadatos de dificultad de contenido.** Guardar una etiqueta de grado/nivel asignada por el autor de forma independiente a la calificación Elo en vivo; usarla solo como el prior de arranque en frío (sembrar cerca de la calificación media de ítems con la misma etiqueta), dejando que la calificación en vivo tome el control tras ~10 respuestas — esto evita que un ítem mal etiquetado nunca se enrute hacia los alumnos que revelarían su verdadera dificultad.

9. **Un Durable Object para la ruta activa, D1 como libro mayor.** La actualización O(1) por evento de Elo encaja en un Durable Object que guarda la calificación en vivo de un alumno (y un fragmento de calificaciones de ítems activos), volcando cada intento como una fila de solo anexar en D1; esto evita las condiciones de carrera de leer-modificar-escribir sobre filas de ítems compartidas que sufre un diseño ingenuo de solo D1 bajo concurrencia real.

10. **Diferir BKT/PFA/DKT a una capa v2 de "dominio de habilidades", no a la selección de ítems v1.** Una vez que exista suficiente historial en D1, un lote nocturno de BKT/PFA por habilidad de grano fino puede alimentar paneles de dominio y señales dirigidas a los padres — una superficie distinta de la selección en tiempo real, y mezclarlas desde el inicio arriesga repetir la trampa de equidad de DKT/BKT [5][6].

11. **No esperar que el algoritmo por sí solo garantice ganancias de aprendizaje.** Los hallazgos mixtos/nulos/negativos de WWC para un producto maduro [3] y el resultado nulo del año uno de RAND [4] muestran que la dificultad adaptativa es necesaria pero no suficiente. Hacer pruebas A/B del modelo del alumno contra una escalera fija simple antes de atribuir ganancias de enganche a Elo específicamente.

12. **Protegerse contra explotaciones de adivinanza arriesgada.** La transformación `(2·acc−1)` existe para que las respuestas incorrectas rápidas resulten costosas [10] — verificar en control de calidad que presionar respuestas al azar rápidamente no supere en calificación al enganche genuino, sobre todo para usuarios jóvenes que podrían no leer la estructura de incentivos como lo haría un adulto que presenta una prueba.

## Preguntas abiertas para el responsable del proyecto

1. ¿El límite de tiempo `d_i` por ítem debe fijarse por franja de edad/grado, o debe ser en sí mismo un parámetro estimado en vivo (según el resultado de equivalencia 2PL)?
2. Para los usuarios muy jóvenes (edades 4 a 6) que podrían no operar de forma confiable una interfaz de temporizador, ¿debería aplicarse HSHS siquiera, o el contenido de primera infancia debería usar una regla de solo exactitud hasta que el niño crezca lo suficiente para el juego cronometrado?
3. ¿Una escala Elo global por alumno, o escalas por dominio (aritmética vs. lógica vs. geometría) que no se comparen directamente?
4. ¿La capa de dominio con lote nocturno de BKT/PFA (§10) está dentro del alcance del mismo hito que el selector Elo en vivo, o queda para una fase posterior?
5. ¿Qué tolerancia al error de arranque en frío es aceptable para ítems totalmente nuevos — cuántas respuestas se necesitan antes de que una calificación de dificultad sea lo bastante "confiable" para enrutarse ampliamente?

## Fuentes

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
