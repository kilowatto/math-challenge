# Espaciado, práctica de recuperación y entrelazado aplicados a las matemáticas

> Investigación Math Challenge — 2026-07-31 — tema 05

## Resumen ejecutivo (ES)

- La práctica **entrelazada** (mezclar tipos de problema en vez de agruparlos por bloques) duplica el desempeño en pruebas de matemáticas un día después, aunque empeora el desempeño *durante* la práctica misma [1][2].
- En un aula real de 7º grado (n=140, nueve semanas, prueba sorpresa dos semanas después), la práctica entrelazada superó a la práctica en bloque y los profesores la consideraron viable sin materiales extra [2][3].
- Una dosis más alta de entrelazado produjo puntajes más altos tanto a los dos días como a un mes (n=126, 7º grado); el beneficio no depende de que los problemas se "parezcan" entre sí [4][5].
- Los Bjork (UCLA) llaman a esto "dificultad deseable": condiciones que ralentizan el aprendizaje aparente pero mejoran la retención a largo plazo — espaciado, entrelazado, recuperación, generación y variación [6][7].
- El "efecto de la prueba" (Roediger & Karpicke, 2006): recuperar información de memoria fortalece más que releer, y la ventaja crece cuanto más larga es la demora antes de la prueba final [8].
- El intervalo de repaso óptimo no es fijo: depende de cuánto debe durar el recuerdo. Para una semana, el hueco óptimo es ~20-40% del intervalo; para un año, ~5-10% [9].
- Algoritmos de repetición espaciada en software real: Leitner (cajas con intervalos crecientes), SM-2 (SuperMemo/Anki clásico, factor de facilidad), FSRS (Anki actual, modela estabilidad/dificultad/recuperabilidad por tarjeta), y la regresión de vida media de Duolingo (p = 2^(-Δt/h), mejoró el compromiso diario 12%) [10][11].
- El "aprendizaje de dominio" tradicionalmente exige 80-90% de precisión antes de avanzar; evidencia reciente sugiere umbrales más altos (0.98) mejoran el desempeño posterior; "N correctas seguidas" (típicamente 3) es un proxy barato y común [12][13].
- El olvido sigue mejor una curva de ley de potencia que una exponencial pura — motivo por el cual FSRS abandonó la exponencial [10][16].
- Para Math Challenge se recomienda un programador tipo FSRS simplificado por habilidad (no por pregunta), con entrelazado dentro de cada sesión una vez que hay dos o más habilidades activas, y un umbral de dominio de dos etapas (racha + repaso espaciado exitoso).

## Executive summary (EN)

- **Interleaved practice** (mixing problem types instead of blocking them) roughly doubles next-day math test scores relative to blocked practice, even though it performs worse during the practice session itself [1][2].
- A 7th-grade classroom RCT (n=140, nine weeks, unannounced test two weeks later) found interleaved practice beat blocked practice, and teachers rated it feasible with no extra materials [2][3]. A dose-response study (n=126) found more interleaving produced better scores at both 2-day and 1-month delays, and the effect isn't limited to superficially similar problem types [4][5].
- Robert & Elizabeth Bjork (UCLA) frame this as **"desirable difficulties"**: conditions that slow acquisition but improve long-term retention — spacing, interleaving, retrieval practice, generation, and varied practice have the strongest evidence [6][7].
- The **testing effect** (Roediger & Karpicke, 2006): retrieving an answer from memory beats re-studying it, and the advantage grows with the delay before the final test [8].
- Cepeda et al. (2008, *Psychological Science*, >1,350 subjects): the **optimal spacing gap scales with retention goal** — roughly 20-40% of a 1-week target, shrinking to 5-10% of a 1-year target ("temporal ridgeline") [9].
- Software scheduling algorithms: **Leitner** (5 boxes, ~1/2/4/7/14-day intervals, reset on error) [14]; **SM-2** (ease factor 1.3-2.5, intervals 1, 6, then previous×ease) [15]; **FSRS** (Anki's current default — per-card Stability/Difficulty/Retrievability, power-law forgetting curve, ~19-21 fitted weights, single user-facing "desired retention" target ~0.90) [10]; **Duolingo's Half-Life Regression** (p = 2^(-Δt/h), cut prediction error 45%+ vs. baselines, lifted engagement 12% live) [11].
- **Mastery learning** traditionally uses 80-90% accuracy to advance (Bloom); adaptive-system research finds higher bars (~0.98) improve downstream performance; "N correct in a row" (often 3) is a common cheap proxy [12][13].
- Forgetting follows a power-law/logarithmic curve better than pure exponential decay — steep early loss, flattening tail — which is why FSRS moved away from exponential curves [10][16].
- Procedural math skill (fact fluency, algorithm execution) benefits especially from interleaving because it trains *strategy discrimination*, not just recall; conceptual understanding gains from spacing and from interleaving's transfer effect once multiple concepts are in play [1][2][6].

## Hallazgos

### 1. Práctica entrelazada en matemáticas (Rohrer & Taylor)

Los estudios de laboratorio de Rohrer y Taylor hicieron que niños practicaran cuatro tipos de problemas de matemáticas ya sea en bloque (AAAA BBBB) o entrelazados (ABCD ABCD). El entrelazado *perjudicó* el desempeño dentro de la sesión, pero **duplicó los puntajes de la prueba del día siguiente** [1] — el patrón característico de una dificultad deseable.

Taylor y Rohrer (2010, *Applied Cognitive Psychology*) condujeron un RCT en aula: alumnos de 7º grado (n=140) recibieron práctica en bloque o entrelazada durante nueve semanas, con una prueba sorpresa dos semanas después. El material practicado de forma entrelazada obtuvo puntajes más altos [2][3].

Rohrer, Dedrick y Stershic (2015, *J. Educational Psychology* 107(3), 900-908) condujeron un RCT de dosis-respuesta (n=126, 7º grado): una dosis más alta de entrelazado en las mismas hojas de ejercicios elevó los puntajes tanto a los ~2 días como a 1 mes, sin tiempo de práctica adicional [4]. El beneficio no es un artefacto de la similitud superficial entre tipos de problema — se mantiene incluso cuando los problemas entrelazados se ven bastante distintos, consistente con que el entrelazado entrena la *selección de estrategia*, no el recuerdo mecánico [5]. Las encuestas a profesores calificaron el entrelazado como altamente viable — solo requiere reordenar los problemas existentes [2][3].

### 2. Las dificultades deseables de Bjork (UCLA)

Robert y Elizabeth Bjork (1994) acuñaron el término "desirable difficulties" ("dificultades deseables"): las condiciones que ralentizan la *adquisición* a menudo mejoran la *retención y la transferencia* a largo plazo, porque el desempeño-durante-el-aprendizaje y el aprendizaje-en-sí son disociables [6]. Cinco dificultades tienen evidencia sólida: espaciado, entrelazado, práctica de recuperación, generación y práctica variada [7]. El diseño instruccional optimizado para sesiones fluidas y sin errores (repetición masiva, bloques, relectura) produce un aprendizaje que se siente bien pero no dura.

### 3. El efecto de la prueba (Roediger & Karpicke)

Roediger y Karpicke (2006) compararon el estudio repetido contra la prueba repetida del mismo material. Inmediatamente después, quienes estudiaron se veían mejor (~83% vs. ~71% de recuerdo); una semana después el patrón se invirtió (~40% vs. ~61%) [8]. El beneficio de la práctica de recuperación crece con la demora antes de la prueba criterio — la misma firma que el entrelazado. Implicación: un ciclo de "responder y luego recibir retroalimentación" debe ser el evento de aprendizaje primario, no una evaluación añadida a la instrucción.

### 4. Intervalos de espaciado óptimos: la cresta temporal de Cepeda et al.

Cepeda, Vul, Rohrer, Wixted y Pashler (2008, *Psychological Science*, >1,350 sujetos) variaron el hueco entre el estudio y el reaprendizaje y midieron la retención hasta un año después. El hueco óptimo **no es fijo** — como fracción de la demora eventual hasta la prueba va de ~20-40% para una meta de 1 semana a ~5-10% para una meta de 1 año [9]. Empollar antes de un examen cuyo contenido necesitas recordar por un año sub-espacia; espaciar los repasos con un mes de separación para recordar algo por una semana sobre-espacia — exactamente la tensión que los programadores adaptativos (SM-2, FSRS, HLR) existen para resolver.

### 5. Algoritmos de repetición espaciada usados en software real

**Leitner (1972).** Las tarjetas viven en cajas (clásicamente 5) con cadencias fijas (~1, 2, 4, 7, 14 días); una respuesta correcta promueve, una incorrecta regresa a la caja 1 [14].

**SM-2 (Woźniak, 1987).** Cada ítem tiene un factor de facilidad (EF), que inicia en 2.5, con piso en 1.3. Intervalos: I(1)=1, I(2)=6, I(n)=I(n-1)×EF en adelante. Una calificación de calidad de 0-5 ajusta el EF mediante EF' = EF + (0.1 − (5−Q)×(0.08 + (5−Q)×0.02)); Q<3 reinicia el ítem [15].

**FSRS (el valor por omisión actual de Anki).** Rastrea tres variables de estado por tarjeta: **Estabilidad** S (días hasta que la probabilidad de recuerdo decae a 90%), **Dificultad** D (1-10) y **Recuperabilidad** R (0-1, decayendo según una curva de ley de potencia, no exponencial). Una sola perilla, la **retención deseada** (típicamente 0.85-0.95, por omisión ~0.90), dirige al programador para invertir la curva de olvido y elegir el intervalo donde la R predicha alcanza esa meta. FSRS-6 ajusta ~19-21 pesos por aprendiz a partir del historial de repasos mediante descenso de gradiente, superando el factor de facilidad fijo de SM-2 una vez que hay suficientes datos (~1,000+ repasos) [10].

**Regresión de vida media (Duolingo; Settles y Meeder, 2016, ACL).** Modela la vida media h de la memoria de cada ítem como una función log-lineal de los conteos previos de aciertos/errores; probabilidad de recuerdo p = 2^(−Δt/h) — una curva exponencial explícita (frente a la ley de potencia de FSRS). Redujo el error de predicción 45%+ contra las líneas base y elevó el compromiso diario 12% en un A/B en vivo [11].

**Hilo común.** Los cuatro programan la siguiente exposición para el momento en que la probabilidad de recuerdo está a punto de cruzar un umbral objetivo — ni antes (repetición desperdiciada) ni mucho después (ya olvidado). Difieren en si la curva de olvido es fija (Leitner, SM-2) o ajustada por ítem/aprendiz (FSRS, HLR), y en la forma exponencial vs. ley de potencia.

### 6. Umbrales de aprendizaje de dominio

El aprendizaje de dominio de Bloom pide ~80-90% de precisión antes de avanzar, con remediación por debajo del umbral [12][13]. Un proxy barato y común, especialmente en programas de fluidez de operaciones básicas en K-12, es "N consecutive correct" (N correctas consecutivas, a menudo 3), que se reinicia limpiamente ante una respuesta incorrecta [13]. Investigación reciente en tutoría adaptativa encontró que elevar la barra de dominio de ~0.95 a ~0.98 de probabilidad de dominio estimado mejoró el desempeño en lecciones subsecuentes dependientes — el umbral tradicional se queda corto para contenido prerrequisito [12]. La literatura de fluidez de operaciones básicas enfatiza que el dominio debe evaluarse *después de un hueco*, no solo en la sesión de entrenamiento, porque la precisión de recuerdo inmediato sobreestima el dominio duradero [13].

### 7. Curvas de olvido

La curva clásica de Ebbinghaus: pérdida temprana pronunciada (~42% olvidado en 20 minutos, ~67% en 24 horas) y luego una larga cola aplanada [16]. Ebbinghaus la modeló como aproximadamente exponencial, pero el consenso moderno — y la razón por la que FSRS reemplazó su propio modelo exponencial con una curva de ley de potencia en FSRS-4.5/6 — es que el olvido real desacelera más rápido de lo que predice el decaimiento exponencial puro [16][10].

### 8. Habilidad matemática procedimental vs. conceptual

El trabajo de Rohrer/Taylor apunta a la habilidad *procedimental*: qué método aplica a qué problema. Se teoriza que el beneficio del entrelazado proviene de la **práctica de discriminación** — notar qué estrategia pide un problema, algo que la práctica en bloque nunca exige porque el bloque revela la estrategia [1][2][5]. Para la comprensión *conceptual*, el espaciado y la práctica de recuperación siguen ayudando por el mismo mecanismo de fortalecimiento de la traza, pero el entrelazado añade valor de transferencia — reconocer la aplicabilidad de un concepto en un contexto novedoso y mezclado [6][7][8]. En resumen: la fluidez procedimental quiere recuperación espaciada *y* entrelazada; la comprensión conceptual quiere recuperación espaciada y gana aún más del entrelazado una vez que hay varios conceptos activos.

## Implicaciones de diseño para Math Challenge

1. **Programar por nodo de habilidad, no por pregunta.** Rastrear unidades como "resta de 2 dígitos con préstamo" como la entidad programable — las habilidades matemáticas generalizan a través de muchas instancias de pregunta, a diferencia de las tarjetas de memoria.

2. **Algoritmo concreto recomendado: FSRS-lite con arranque en frío Leitner.** Las habilidades nuevas con <20 datos usan una escalera simple tipo Leitner (1 → 3 → 7 → 16 → 35 días, reinicio ante respuesta incorrecta, sin ajuste requerido). Una vez que se acumulan suficientes intentos, se cambia a un modelo estilo FSRS sembrado con los pesos por omisión publicados de FSRS-6, reajustado periódicamente fuera de línea. Exponer una sola perilla ajustable: **retención deseada = 0.90** por omisión, ajustable por banda de grado (0.85 para las edades más pequeñas para reducir la frustración, 0.92+ para usuarios mayores/competitivos).

3. **Umbral de dominio de dos etapas.** Exigir **3 correctas consecutivas con dificultad creciente** dentro de una habilidad como señal de "aprendida provisionalmente" (la convención común de fluidez de operaciones básicas [13]), pero no marcar una habilidad como "dominada" para la programación hasta que también sobreviva **un repaso espaciado correcto con un hueco de ≥3 días** — codificando directamente la lección del efecto de la prueba de que las rachas de recuerdo inmediato sobreestiman el aprendizaje duradero.

4. **Nunca practicar en bloque por habilidad una vez que hay 2+ habilidades en rotación.** Una vez que una segunda habilidad está pendiente de repaso, entrelazarla con la lección actual dentro de la misma sesión (ABAB/ABCABC), en vez de terminar los problemas de una habilidad antes de empezar la siguiente — el cambio de mayor palanca y costo cero que la literatura respalda [1][2][4].

5. **Proporción de entrelazado por sesión: ~40-60% de material nuevo/lección actual mezclado con ~40-60% de repasos pendientes**, tomados de 2-4 habilidades distintas, mezclados a nivel de pregunta (no en sub-bloques de 3-4 problemas del mismo tipo). Para pre-K/K, sesgar hacia 70/30 nuevo/repaso y entrelazar a lo sumo 2 habilidades, dadas las restricciones de memoria de trabajo que la propia literatura de dificultades deseables señala como condición límite [6][7].

6. **Los repasos son siempre recuperación, nunca re-exposición pasiva.** Un evento de repaso requiere que el niño produzca una respuesta antes de que aparezca cualquier explicación, incluso para material "ya aprendido" [8].

7. **Escalar los huecos de repaso a cuánto debe durar la habilidad, no a una cadencia fija de calendario.** Etiquetar las habilidades como "de unidad" (huecos más cerrados, ~20-30% de la ventana de retención) vs. "fundamentales" (huecos progresivamente más amplios, ~5-10% de un horizonte de un año una vez bien establecidas), según la cresta de Cepeda [9].

8. **Rastrear la Dificultad por separado de la Estabilidad por habilidad**, como hace FSRS, de modo que un niño que batalla reciba tanto un intervalo siguiente más corto como ganancias de estabilidad menores por respuesta correcta que uno al que le resultó fácil — evitando que un algoritmo de facilidad fija trate una respuesta adivinada igual que un dominio genuino.

9. **Modelar el olvido con una curva de ley de potencia, no exponencial pura**, para las estimaciones de colocación/dificultad adaptativa de "cuánto ha olvidado este niño desde la última práctica" — una exponencial pura sobreestima el olvido en demoras largas y lo subestima poco después del aprendizaje [16][10].

10. **Instrumentar ambas firmas de Rohrer como métricas internas.** Rastrear la precisión dentro de la sesión y la precisión de recuerdo diferido (p. ej., un breve quiz de calentamiento sobre las habilidades de ayer) como KPIs separados; esperar que la precisión en sesiones entrelazadas a veces se vea *más baja* que en bloque mientras la precisión diferida es más alta — no permitir que una caída de precisión en sesión dispare un regreso al bloqueo.

11. **Reportar "practicado" vs. "aprendido" por separado a padres y profesores.** Mostrar la señal de dominio de dos etapas (punto 3) en lugar de la precisión cruda de sesión, evitando la trampa de que una racha del mismo día parezca dominio y luego falle en el siguiente repaso sorpresa.

12. **La retroalimentación del tutor de IA debe provocar recuperación antes de revelar soluciones.** Ante una respuesta incorrecta, dar primero una pista con andamiaje de recuperación (efecto de generación [6][7]); reservar los ejemplos completamente resueltos para un segundo intento incorrecto.

## Preguntas abiertas para el dueño del proyecto

1. ¿El estado de programación debe vivir solo por niño-por-habilidad, o debemos mantener también un ajuste de parámetros FSRS a nivel de población para sembrar los programas de niños nuevos antes de que existan suficientes datos propios?
2. ¿La retención deseada debe ser un 0.90 fijo en toda la plataforma, o una perilla ajustable para usuarios mayores/de trayectoria avanzada, como Anki la expone a los usuarios avanzados?
3. ¿El etiquetado de habilidades de unidad vs. fundamentales debe ser autorado manualmente por nodo curricular, o inferirse de la profundidad del grafo de prerrequisitos?
4. ¿La proporción de entrelazado interactúa con el sistema de señales conductuales anti-trampa — mezclar tipos de habilidad hace más fácil o más difícil razonar sobre la detección de patrones/tiempos?
5. ¿La barra de dominio de dos etapas (racha + repaso diferido) debe bloquear la progresión a la siguiente unidad curricular, o solo afectar la programación de repasos mientras la progresión sigue en un umbral de precisión separado?

## Fuentes

1. Rohrer & Taylor, "The shuffling of mathematics problems improves learning" — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf
2. Taylor & Rohrer (2010), "The effects of interleaved practice," *Applied Cognitive Psychology* 24, 837-848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598
3. IES WWC Study 89950, RCT en aula de práctica matemática entrelazada — https://ies.ed.gov/ncee/wwc/Study/89950
4. Rohrer, Dedrick & Stershic (2015), "Interleaved practice improves mathematics learning," *Journal of Educational Psychology* 107(3), 900-908 — https://files.eric.ed.gov/fulltext/ED557355.pdf
5. Rohrer et al. (2014), "The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems" — https://pubmed.ncbi.nlm.nih.gov/24578089/
6. Bjork & Bjork (2011), "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning" — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/
7. "Desirable Difficulties: Bjork's 5 Principles" — https://www.structural-learning.com/post/desirable-difficulties
8. Roediger & Karpicke (2006), "Test-Enhanced Learning" / "The Power of Testing Memory," *Perspectives on Psychological Science* 1(3), 181-210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), "Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention," *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf
10. Documentación del algoritmo FSRS — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm y https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
11. Settles & Meeder (2016), "A Trainable Spaced Repetition Model for Language Learning," ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; código — https://github.com/duolingo/halflife-regression/blob/master/README.md
12. "How Much Mastery is Enough Mastery?" EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html
13. "The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices" — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/
14. Panorama del sistema Leitner — https://e-student.org/leitner-system/ y https://supermemo.guru/wiki/Leitner_system
15. Especificación original del algoritmo SM-2 de SuperMemo — https://super-memory.com/english/ol/sm2.htm
16. Curva de olvido de Ebbinghaus — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve y https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
