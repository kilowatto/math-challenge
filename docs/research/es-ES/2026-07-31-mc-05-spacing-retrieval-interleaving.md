# Espaciado, práctica de recuperación e intercalado aplicados a las matemáticas

> Investigación Math Challenge — 2026-07-31 — tema 05

## Resumen ejecutivo (ES)

- La práctica **intercalada** (mezclar tipos de problema en vez de agruparlos por bloques) duplica el rendimiento en pruebas de matemáticas un día después, aunque empeora el rendimiento *durante* la propia sesión de práctica [1][2].
- En un aula real de 7.º grado (n=140, nueve semanas, prueba sorpresa dos semanas después), la práctica intercalada superó a la práctica en bloque y los profesores la consideraron viable sin materiales adicionales [2][3].
- Una dosis más alta de intercalado produjo puntuaciones más altas tanto a los dos días como a un mes (n=126, 7.º grado); el beneficio no depende de que los problemas se «parezcan» entre sí [4][5].
- Los Bjork (UCLA) llaman a esto «dificultad deseable»: condiciones que ralentizan el aprendizaje aparente pero mejoran la retención a largo plazo — espaciado, intercalado, recuperación, generación y variación [6][7].
- El «efecto de la prueba» (Roediger & Karpicke, 2006): recuperar información de memoria fortalece más que releer, y la ventaja crece cuanto más larga es la demora antes de la prueba final [8].
- El intervalo de repaso óptimo no es fijo: depende de cuánto debe durar el recuerdo. Para una semana, el hueco óptimo es ~20‑40 % del intervalo; para un año, ~5‑10 % [9].
- Algoritmos de repetición espaciada en software real: Leitner (cajas con intervalos crecientes), SM‑2 (SuperMemo/Anki clásico, factor de facilidad), FSRS (Anki actual, modela estabilidad/dificultad/recuperabilidad por tarjeta), y la regresión de vida media de Duolingo (p = 2^(-Δt/h), mejoró el compromiso diario 12 %) [10][11].
- El «aprendizaje de dominio» tradicionalmente exige 80‑90 % de precisión antes de avanzar; evidencia reciente sugiere umbrales más altos (0,98) mejoran el rendimiento posterior; «N correctas consecutivas» (típicamente 3) es un proxy barato y común [12][13].
- El olvido sigue mejor una curva de ley de potencia que una exponencial pura — motivo por el cual FSRS abandonó la exponencial [10][16].
- Para Math Challenge se recomienda un programador tipo FSRS simplificado por habilidad (no por pregunta), con intercalado dentro de cada sesión una vez que hay dos o más habilidades activas, y un umbral de dominio de dos etapas (racha + repaso espaciado exitoso).

## Executive summary (EN)
- **Práctica intercalada** (mezclar tipos de problemas en lugar de bloquearlos) duplica aproximadamente las puntuaciones en pruebas de matemáticas al día siguiente en comparación con la práctica bloqueada, aunque su rendimiento sea peor durante la propia sesión de práctica [1][2].
- Un ECA en un aula de 7.º de primaria (n=140, nueve semanas, prueba no anunciada dos semanas después) encontró que la práctica intercalada superó a la práctica bloqueada, y los docentes la consideraron factible sin materiales adicionales [2][3]. Un estudio de dosis‑respuesta (n=126) halló que mayor intercalado producía mejores puntuaciones tanto a los 2 días como a 1 mes de retraso, y el efecto no se limita a tipos de problemas superficialmente similares [4][5].
- Robert y Elizabeth Bjork (UCLA) lo enmarcan como **«dificultades deseables»**: condiciones que ralentizan la adquisición pero mejoran la retención a largo plazo — el espaciamiento, la intercalación, la práctica de recuperación, la generación y la práctica variada son las que cuentan con la evidencia más sólida [6][7].
- El **efecto de prueba** (Roediger y Karpicke, 2006): recuperar una respuesta de la memoria supera volver a estudiarla, y la ventaja aumenta con el retraso antes de la prueba final [8].
- Cepeda et al. (2008, *Psychological Science*, >1.350 sujetos): la **brecha de espaciamiento óptimo se ajusta al objetivo de retención** — aproximadamente el 20‑40 % de una meta de 1 semana, reduciéndose al 5‑10 % de una meta de 1 año («línea de cresta temporal») [9].
- Algoritmos de programación de software: **Leitner** (5 cajas, intervalos de ~1/2/4/7/14 días, reinicio al error) [14]; **SM‑2** (factor de facilidad 1,3‑2,5, intervalos 1, 6, luego anterior×facilidad) [15]; **FSRS** (valor predeterminado actual de Anki — estabilidad/dificultad/recuperabilidad por tarjeta, curva de olvido de ley de potencias, ~19‑21 pesos ajustados, objetivo de «retención deseada» de un solo usuario ~0,90) [10]; **Half‑Life Regression de Duolingo** (p = 2^(-Δt/h), reduce el error de predicción >45 % frente a líneas base, incrementó el compromiso 12 % en directo) [11].
- **Aprendizaje de dominio** tradicionalmente emplea una precisión del 80‑90 % para avanzar (Bloom); la investigación en sistemas adaptativos encuentra que umbrales más altos (~0,98) mejoran el rendimiento posterior; «N correctas consecutivas» (a menudo 3) es un proxy económico y frecuente [12][13].
- El olvido sigue una curva de ley de potencias/logarítmica mejor que una decadencia exponencial pura — pérdida pronunciada al principio, cola aplanada — lo que explica por qué FSRS se alejó de las curvas exponenciales [10][16].
- La habilidad matemática procedimental (fluidez de hechos, ejecución de algoritmos) se beneficia especialmente de la intercalación porque entrena la *discriminación de estrategias*, no solo la memorización; la comprensión conceptual se enriquece con el espaciamiento y con el efecto de transferencia de la intercalación cuando se manejan varios conceptos simultáneamente [1][2][6].

## Findings

### 1. Práctica intercalada en matemáticas (Rohrer & Taylor)

Los estudios de laboratorio de Rohrer y Taylor hicieron que niños practicaran cuatro tipos de problemas matemáticos ya sea de forma bloqueada (AAAA BBBB) o intercalada (ABCD ABCD). La intercalación *deterioró* el rendimiento durante la sesión, pero **duplicó las puntuaciones en la prueba del día siguiente** [1] — el patrón característico de una dificultad deseable.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) realizaron un ensayo controlado aleatorizado (RCT) en el aula: alumnos de 7.º curso (n=140) recibieron práctica bloqueada o intercalada durante nueve semanas y fueron evaluados sin previo aviso dos semanas después. El material con práctica intercalada obtuvo puntuaciones más altas [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900‑908) llevaron a cabo un RCT de dosis‑respuesta (n=126, 7.º curso): una mayor dosis de intercalación en las mismas hojas de ejercicios elevó las puntuaciones tanto a ~2‑day como a 1‑month de retraso, sin tiempo de práctica adicional [4]. El beneficio no es un artefacto de la similitud superficial entre tipos de problemas — se mantiene incluso cuando los problemas intercalados son bastante diferentes, lo que concuerda con la idea de que la intercalación entrena la *selección de estrategia*, no la memorización mecánica [5]. Las encuestas a docentes valoraron la intercalación como altamente factible — solo requiere reordenar los problemas existentes [2][3].

### 2. Dificultades deseables de Bjork (UCLA)

Robert & Elizabeth Bjork (1994) acuñaron el término «dificultades deseables»: condiciones que ralentizan la *adquisición* a menudo mejoran la *retención y transferencia* a largo plazo, porque el rendimiento durante el aprendizaje y el propio aprendizaje son disociables [6]. Cinco dificultades cuentan con fuerte evidencia: espaciado, intercalación, práctica de recuperación, generación y práctica variada [7]. Un diseño instruccional optimizado para sesiones fluidas y sin errores (repetición masiva, bloqueo, relectura) produce un aprendizaje que se siente bien pero no perdura.

### 3. El efecto de la prueba (Roediger & Karpicke)

Roediger & Karpicke (2006) compararon el estudio repetido con la prueba repetida del mismo material. Inmediatamente después, los estudiantes parecían mejores (~83 % vs. ~71 % de recuerdo); una semana después el patrón se invertía (~40 % vs. ~61 %) [8]. El beneficio de la práctica de recuperación crece con el retraso antes de la prueba criterial — el mismo sello que la intercalación. Implicación: un bucle «respuesta, luego retroalimentación» debería ser el evento principal de aprendizaje, no una evaluación añadida a la instrucción.

### 4. Intervalos de espaciado óptimos — la línea de cresta temporal de Cepeda et al.

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, >1.350 sujetos) variaron la brecha entre estudio y reaprendizaje y evaluaron la retención hasta un año después. La brecha óptima **no es fija** — como fracción del retraso final de la prueba oscila entre ~20‑40 % para un objetivo de 1 semana y ~5‑10 % para un objetivo de 1 año [9]. El repaso intensivo antes de una prueba que se necesita recordar durante un año está sub‑espaciado; espaciar revisiones a un mes de distancia para recordar algo durante una semana está sobre‑espaciado — precisamente la tensión que los planificadores adaptativos (SM‑2, FSRS, HLR) pretenden resolver.

### 5. Algoritmos de repetición espaciada usados en software real

**Leitner (1972).** Las tarjetas se organizan en cajas (clásicamente 5) con cadencias fijas (~1, 2, 4, 7, 14 días); una respuesta correcta la promueve, una incorrecta la devuelve a la caja 1 [14].

**SM‑2 (Woźniak, 1987).** Cada ítem tiene un factor de facilidad (EF), que comienza en 2,5 y tiene un mínimo de 1,3. Intervalos: I(1)=1, I(2)=6, I(n)=I(n‑1)×EF a partir de entonces. Una valoración de calidad de 0‑5 ajusta EF mediante  
EF' = EF + (0,1 − (5−Q)×(0,08 + (5−Q)×0,02)); Q<3 restablece el ítem [15].

**FSRS (predeterminado actual de Anki).** Controla tres variables de estado por tarjeta: **Estabilidad** S (días hasta que la probabilidad de recuerdo decae al 90 %), **Dificultad** D (1‑10) y **Recuperabilidad** R (0‑1, que decae según una curva de ley de potencias, no exponencial). Un único control, **retención deseada** (típicamente 0,85‑0,95, por defecto ~0,90), dirige el planificador a invertir la curva de olvido y elegir el intervalo donde la R prevista alcanza ese objetivo. FSRS‑6 ajusta ~19‑21 pesos por alumno a partir del historial de repeticiones mediante descenso de gradiente, superando al factor de facilidad fijo de SM‑2 una vez que existen suficientes datos (~1.000+ repeticiones) [10].

**Half‑Life Regression (Duolingo; Settles & Meeder, 2016, ACL).** Modela la media vida de la memoria h de cada ítem como una función log‑lineal del número de aciertos y errores previos; la probabilidad de recuerdo p = 2^(−Δt/h) — una curva exponencial explícita (frente a la ley de potencias de FSRS). Reduce el error de predicción en más del 45 % frente a las líneas base y aumentó la participación diaria en un 12 % en un experimento A/B en vivo [11].

**Hilo común.** Los cuatro programan la siguiente exposición para el momento en que la probabilidad de recuerdo está a punto de cruzar un umbral objetivo — no antes (repetición desperdiciada), no mucho después (ya olvidado). Diferen en que la curva de olvido es fija (Leitner, SM‑2) o se ajusta por ítem/alumno (FSRS, HLR), y en la forma exponencial versus ley de potencias.

### 6. Umbrales de aprendizaje maestro

El aprendizaje maestro de Bloom exige una precisión de ~80‑90 % antes de avanzar, con remediación por debajo del umbral [12][13]. Un proxy barato y frecuente, sobre todo en programas de fluidez de hechos K‑12, es «N respuestas correctas consecutivas» (a menudo 3), que se restablece limpiamente ante una respuesta errónea [13]. Investigaciones recientes de tutoría adaptativa hallaron que elevar la barra de dominio de ~0,95 a ~0,98 de probabilidad estimada de dominio mejoró el rendimiento en lecciones subsiguientes dependientes — el umbral tradicional subestima los contenidos prerrequisitos [12]. La literatura sobre fluidez de hechos subraya que el dominio debe evaluarse *después de un intervalo*, no solo en la sesión de entrenamiento, ya que la precisión de recuerdo inmediato sobrestima el dominio duradero [13].

### 7. Curvas de olvido

La curva clásica de Ebbinghaus muestra una pérdida temprana pronunciada (~42 % olvidado en los primeros 20 minutos, ~67 % en las primeras 24 horas) y luego una larga cola aplanada [16]. Ebbinghaus la modeló como aproximadamente exponencial, pero el consenso moderno — y la razón por la que FSRS sustituyó su propio modelo exponencial por una curva de ley de potencias en FSRS‑4,5/6 — es que el olvido real se desacelera más rápido de lo que predice una decadencia puramente exponencial [16][10].

### 8. Habilidad procedimental vs. comprensión conceptual en matemáticas

El trabajo de Rohrer/Taylor se centra en la habilidad *procedimental*: qué método aplicar a cada problema. Se teoriza que el beneficio de la intercalación proviene de la **práctica de discriminación** — notar qué estrategia requiere un problema, algo que la práctica bloqueada nunca exige porque el bloque revela la estrategia [1][2][5]. Para la comprensión *conceptual*, el espaciado y la práctica de recuperación siguen ayudando mediante el mismo mecanismo de fortalecimiento de trazas, pero la intercalación aporta valor de transferencia — reconocer la aplicabilidad de un concepto en un contexto mixto y novedoso [6][7][8]. En resumen: la fluidez procedimental necesita recuperación espaciada *y* intercalada; la comprensión conceptual necesita recuperación espaciada y gana aún más con la intercalación cuando varios conceptos están activos.

## Implicaciones de diseño para Math Challenge

1. **Programar por nodo de habilidad, no por pregunta.** Seguimos unidades como «sustracción de 2 cifras con préstamo» como entidad programable: las habilidades matemáticas se generalizan a lo largo de muchas instancias de preguntas, a diferencia de las tarjetas de aprendizaje.

2. **Algoritmo recomendado concreto: FSRS‑lite con arranque en frío tipo Leitner.** Las habilidades nuevas con <20 puntos de datos usan una escalera tipo Leitner sencilla (1 → 3 → 7 → 16 → 35 días, reinicio ante respuesta errónea, sin ajuste necesario). Cuando se acumulan suficientes intentos, se pasa a un modelo estilo FSRS sembrado con los pesos predeterminados de FSRS‑6 publicados, reajustándose periódicamente sin conexión. Se expone un único control ajustable: **retención deseada = 0,90** por defecto, ajustable por tramo de curso (0,85 para las edades más jóvenes para reducir la frustración, 0,92+ para usuarios mayores/competitivos).

3. **Umbral de dominio en dos fases.** Exigir **3 respuestas correctas consecutivas con dificultad creciente** dentro de una habilidad como señal de «aprendida provisionalmente» (la convención habitual de fluidez de hechos [13]), pero no marcar una habilidad como «maestra» para la programación hasta que también supere **una revisión espaciada correcta con una separación ≥3 días** — codificando directamente la lección del efecto de prueba que las rachas de recuerdo inmediato sobreestiman el aprendizaje duradero.

4. **Nunca bloquear la práctica por habilidad una vez que haya 2 o más habilidades en rotación.** Cuando una segunda habilidad está pendiente de revisión, intercalar esa habilidad con la lección actual dentro de la misma sesión (ABAB/ABCABC), en lugar de terminar los problemas de una habilidad antes de comenzar la siguiente — el cambio de mayor impacto y coste cero que respalda la literatura [1][2][4].

5. **Proporción de intercalado en la sesión: ~40‑60 % de contenido nuevo/de la lección actual mezclado con ~40‑60 % pendiente de revisión**, extraído de 2‑4 otras habilidades, intercalado a nivel de pregunta (no en subbloques de 3‑4 problemas del mismo tipo). Para educación infantil, sesgar hacia 70/30 nuevo/revisión y entrelazar como máximo 2 habilidades, dadas las restricciones de la memoria de trabajo que la literatura sobre dificultades deseables señala como condición límite [6][7].

6. **Las revisiones son siempre de recuperación, nunca de reexposición pasiva.** Un evento de revisión obliga al niño a producir una respuesta antes de que aparezca cualquier explicación, incluso para material «ya aprendido» [8].

7. **Escalar los intervalos de revisión según la duración que la habilidad debe mantenerse, no según una cadencia de calendario fija.** Etiquetar las habilidades como «unit‑scoped» (intervalos más estrechos, ~20‑30 % de la ventana de retención) frente a «foundational» (intervalos progresivamente más amplios, ~5‑10 % de un horizonte de un año una vez bien establecidas), según la línea de referencia de Cepeda [9].

8. **Seguir la Dificultad por separado de la Estabilidad por habilidad**, como hace FSRS, de modo que un niño que tiene dificultades reciba tanto un intervalo siguiente más corto como menores ganancias de estabilidad por respuesta correcta que uno que la encuentra fácil — evitando que un algoritmo de facilidad fija trate una conjetura afortunada igual que un dominio genuino.

9. **Modelar el olvido con una curva de ley de potencias, no con una exponencial pura**, para estimaciones de ubicación/dificultad adaptativa de «cuánto ha olvidado este niño desde la última práctica» — una exponencial pura sobrestima el olvido en retrasos largos y lo subestima poco después del aprendizaje [16][10].

10. **Instrumentar ambas firmas de Rohrer como métricas internas.** Seguir la precisión en la misma sesión y la precisión de recuerdo diferido (p. ej., un breve cuestionario de calentamiento sobre las habilidades de ayer) como KPIs separados; esperar que la precisión en sesiones intercaladas a veces parezca *más baja* que en sesiones bloqueadas mientras que la precisión diferida sea mayor — no permitir que una caída de precisión en la misma sesión dispare el retorno al bloqueo.

11. **Informar «practicado» frente a «aprendido» por separado a padres y docentes.** Mostrar la señal de dominio en dos fases (punto 3) en lugar de la precisión bruta de la sesión, evitando la trampa donde una racha del mismo día parece dominio y luego falla en la siguiente revisión no anunciada.

12. **La retroalimentación del tutor IA debe incitar a la recuperación antes de revelar las soluciones.** Ante una respuesta errónea, ofrecer primero una pista estructurada para la recuperación (efecto de generación [6][7]); reservar ejemplos trabajados completos para un segundo intento erróneo.

## Preguntas abiertas para el responsable del proyecto

1. ¿Debe el estado de programación vivir solo por niño‑por‑habilidad, o también debemos mantener un ajuste de parámetros FSRS a nivel poblacional para sembrar los horarios de los niños nuevos antes de que exista suficiente datos propios?
2. ¿Debe la retención deseada ser un 0,90 fijo en toda la plataforma, o un control ajustable para usuarios mayores/de nivel doctorado al estilo de Anki para usuarios avanzados?
3. ¿Debe el etiquetado de habilidades «unit‑scoped» frente a «foundational» elaborarse manualmente por nodo curricular, o inferirse a partir de la profundidad del grafo de prerrequisitos?
4. ¿Interactúa la proporción de intercalado con el sistema de señales conductuales anti‑trampa — hace que la mezcla de tipos de habilidad facilite o dificulte la detección de patrones temporales?
5. ¿Debe la barra de dominio en dos fases (racha + revisión diferida) bloquear el progreso al siguiente unidad curricular, o solo afectar la programación de revisiones mientras el progreso se mantiene bajo un umbral de precisión separado?

## Fuentes

1. Rohrer & Taylor, «The shuffling of mathematics problems improves learning» — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf  
2. Taylor & Rohrer (2010), «The effects of interleaved practice», *Applied Cognitive Psychology* 24, 837‑848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598  
3. IES WWC Study 89950, interleaved mathematics practice classroom RCT — https://ies.ed.gov/ncee/wwc/Study/89950  
4. Rohrer, Dedrick & Stershic (2015), «Interleaved practice improves mathematics learning», *Journal of Educational Psychology* 107(3), 900‑908 — https://files.eric.ed.gov/fulltext/ED557355.pdf  
5. Rohrer et al. (2014), «The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems» — https://pubmed.ncbi.nlm.nih.gov/24578089/  
6. Bjork & Bjork (2011), «Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning» — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/  
7. «Desirable Difficulties: Bjork's 5 Principles» — https://www.structural-learning.com/post/desirable-difficulties  
8. Roediger & Karpicke (2006), «Test‑Enhanced Learning» / «The Power of Testing Memory», *Perspectives on Psychological Science* 1(3), 181‑210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x  
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), «Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention», *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf  
10. FSRS algorithm documentation — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm  
11. Settles & Meeder (2016), «A Trainable Spaced Repetition Model for Language Learning», ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; código — https://github.com/duolingo/halflife-regression/blob/master/README.md  
12. «How Much Mastery is Enough Mastery?» EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html  
13. «The Importance of Math Fact Fluency: Evidence‑Informed Classroom Practices» — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/  
14. Leitner system overview — https://e-student.org/leitner-system/ and https://supermemo.guru/wiki/Leitner_system  
15. SuperMemo SM‑2 algorithm original specification — https://super-memory.com/english/ol/sm2.htm  
16. Ebbinghaus forgetting curve — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve and https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
