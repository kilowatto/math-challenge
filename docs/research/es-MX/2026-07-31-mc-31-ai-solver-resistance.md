# La amenaza del solucionador: la asistencia de IA en matemáticas en 2026 y qué es lo que realmente resiste

> Investigación Math Challenge — 2026-07-31 — tema 31

## Resumen ejecutivo (ES)

Cualquier tarea reducible a "un número final, enviado como texto o foto" ya está
resuelta por la tecnología disponible: los solucionadores de consumo (Photomath,
Symbolab, Mathway, Microsoft Math Solver, Gauth, Wolfram|Alpha) devuelven una
respuesta con pasos en segundos para casi todo el currículo de primaria a
cálculo universitario [4][5][6], y los asistentes generales (GPT, Gemini,
Claude) ya superaron la matemática de competencia — AIME se considera
"saturado" porque los mejores modelos rondan el máximo posible [12] — y en
julio de 2025 un sistema de Google DeepMind alcanzó nivel de medalla de oro en
la Olimpiada Internacional de Matemáticas operando de extremo a extremo en
lenguaje natural, sin traducir el problema a un lenguaje formal como en 2024
[2][3]. La foto de la pantalla rompe casi cualquier defensa dentro de la app:
nunca toca el DOM, el teclado ni la API, así que ninguna medida de anti-copia
o límite de tiempo del cliente puede verla. El uso estudiantil ya es mayoría y
crece rápido: 88% de universitarios de Reino Unido usó IA generativa para
evaluaciones en 2025, frente a 53% en 2024 [1]; en EE. UU. el uso de ChatGPT
para tareas escolares entre adolescentes se duplicó de 13% a 26% en un año,
aunque las matemáticas siguen siendo el uso que los propios adolescentes
consideran menos aceptable (29% a favor, 28% en contra) [10]. Los detectores
de texto de IA no son salida: son evadibles con paráfrasis simple y penalizan
de forma desproporcionada a quien escribe en un segundo idioma [7][8] — no
deben usarse como puerta punitiva en una app bilingüe. La defensa que sí
funciona no es técnica sino de diseño de evaluación: pedir el proceso en vez
de la respuesta, pedir detectar el error en una solución ajena, exigir una
pregunta de seguimiento adaptativa con números distintos, y usar tareas de
manipulación interactiva cuya respuesta es un estado de UI, no texto copiable.

## Executive summary (EN)

Any math task reducible to "a single final number, submitted as text or a
photo" is already solved by tools students can access today: consumer solvers
(Photomath, Symbolab, Mathway, Microsoft Math Solver, Gauth, Wolfram|Alpha)
return a stepped solution in seconds across nearly the entire K-12-to-calculus
curriculum [4][5][6], and general assistants have moved past competition
math — AIME is now described by benchmark trackers as "saturated" because top
models sit near the ceiling [12] — and in July 2025 a Google DeepMind system
reached gold-medal standard at the IMO working end-to-end in natural language,
without the manual formalization into Lean its 2024 silver-medal predecessor
required [2][3]. A photo of the screen breaks nearly every in-app defense,
because it never touches the DOM, the keyboard, or the app's API — no
client-side anti-copy or timer can see it. Student use is already majority
behavior and rising fast: 88% of UK undergraduates used generative AI for
assessments in 2025, up from 53% in 2024 [1]; US teen ChatGPT-for-schoolwork
use doubled from 13% to 26% in a year, though teens rate math as the least
acceptable use case (29% approve, 28% disapprove) [10]. AI-text detectors are
not an escape hatch: they are evadable with simple paraphrasing and
systematically misclassify non-native-language writers [7][8] — unsuitable as
a punitive gate in a bilingual product. The defense that holds is assessment
design, not technology: ask for the process instead of the answer, ask the
student to find the error in someone else's worked solution, require an
adaptive follow-up with changed numbers, and use interactive manipulation
tasks whose graded output is a UI state, not a copyable string.

## Hallazgos

### 1. Solucionadores matemáticos de consumo: capacidad y alcance

Photomath combina un sistema de álgebra computacional con OCR (extendido a
reconocimiento de escritura a mano desde 2016) para escanear un problema
impreso o manuscrito — incluyendo problemas de palabras — y producir una
solución paso a paso en segundos, cubriendo matemáticas "de primaria a
universidad": aritmética, álgebra, geometría, trigonometría, estadística y
cálculo [4][5]. La escala es grande: a partir de 2021, más de 220 millones de
descargas y aproximadamente 2.2 mil millones de problemas resueltos por mes
[4]. Symbolab anuncia explícitamente la aceptación de "written pages and
screenshots" junto con notación escrita y consultas en lenguaje natural,
cubriendo desde pre-álgebra hasta cálculo, trigonometría, física y
estadística, presentando la salida como paso a paso en lugar de solo la
respuesta [6]. La fortaleza de Wolfram|Alpha es el cómputo simbólico/de forma
cerrada con entrada de formato libre — muy fuerte en álgebra canónica, cálculo
y resolución de ecuaciones, históricamente más débil en problemas que
requieren análisis semántico de un problema de palabras ambiguo. Las apps
centradas en cámara como Gauth (y Microsoft Math Solver, que añade
reconocimiento de escritura a mano y graficación a un pipeline similar de OCR
más solucionador) siguen el mismo patrón: cámara adentro, respuesta con pasos
afuera en segundos, varias con un chat de tutor humano o de IA en vivo
superpuesto para cualquier cosa que el solucionador automático no analice
limpiamente. El hilo común es que estas herramientas son más fuertes justo
donde los problemas escolares y de apps de práctica son más débiles por
necesidad de diseño: problemas únicos, bien planteados, de forma cerrada, con
una sola respuesta final correcta.

### 2. Asistentes de IA generales: de AIME al oro de la IMO

Los LLM de frontera ya atravesaron y superaron el nivel de matemáticas de
competencia que solía ser un techo significativo. AIME (un examen olímpico
clasificatorio de EE. UU.) ahora aparece listado por al menos un rastreador de
benchmarks como un benchmark "archivado" o saturado porque "el desempeño en
este benchmark se ha saturado" y los proveedores dejaron de correr
lanzamientos nuevos contra él, con una puntuación máxima de 98.12% registrada
para Gemini 3.1 Pro Preview y una nota de que nueve de los diez modelos mejor
clasificados en el leaderboard son modelos de razonamiento [12]. La generación
de demostraciones en lenguaje natural de nivel de competencia, la frontera más
dura, también ha caído más rápido de lo esperado. En 2024, AlphaProof y
AlphaGeometry 2 de DeepMind alcanzaron 28/42 puntos (nivel de medalla de
plata) en la IMO, pero solo después de que los problemas fueran traducidos
manualmente al lenguaje formal Lean, y el problema más difícil tomó hasta tres
días de cómputo [3]. Un año después, en julio de 2025, una versión avanzada de
Gemini con "Deep Think" alcanzó 35/42 (nivel de medalla de oro), resolviendo
perfectamente cinco de seis problemas, de extremo a extremo en lenguaje
natural — sin paso de formalización — dentro del mismo límite de 4.5 horas por
sesión que enfrentan los competidores humanos [2]. La propia revisión de la
IMO confirmó que las soluciones enviadas eran "complete and correct" pero
declaró que "their review does not extend to validating our system,
processes, or underlying model" [2] — estos son artefactos calificados, no
sistemas auditados, y el resultado aún involucró una curación humana
sustancial de los datos de entrenamiento y pistas generales de resolución de
problemas [2]. OpenAI reportó por separado resultados comparables de nivel de
medalla de oro para un modelo experimental alrededor del mismo periodo, aunque
no se ejecutó a través del mismo proceso oficial de coordinación de la IMO;
hay que tratar esa afirmación como consistente en dirección con el resultado
verificado de DeepMind, no como una puntuación auditada de forma
independiente. Donde los modelos generales todavía fallan es en la verdadera
frontera de investigación: FrontierMath de Epoch AI obtiene problemas de
matemáticos profesionales que abarcan teoría de números, análisis real,
geometría algebraica y teoría de categorías, que toman varias horas cada uno
incluso para expertos, con un tramo superior de "Tier 4" que toma varios días
de esfuerzo experto — diseñado para seguir poniendo a prueba a los sistemas de
frontera a medida que los benchmarks más fáciles se saturan [11]. Eso está muy
por encima de cualquier cosa que una app de práctica de K-12/universidad
asignaría, pero importa para la ambición de Math Challenge de llegar a
contenido de nivel doctorado: en algún punto entre "conjunto de problemas
difícil" y "problema de investigación abierto", los solucionadores dejan de
ser confiables, y esa frontera vale la pena conocerla con precisión antes de
diseñar contenido de nivel superior.

### 3. De captura de pantalla multimodal a respuesta: por qué las cámaras vencen las defensas dentro de la app

El mecanismo que hace irrelevante a la mayoría de los diseños anti-copia
dentro de la app es simple: una fotografía de una pantalla es un canal fuera
de banda. Nunca entra al DOM de la app, nunca dispara un evento de teclado o
de pegado, nunca toca sus solicitudes de red, y es invisible para cualquier
defensa a nivel de JavaScript (deshabilitar copiar/pegar, ofuscar el código
fuente, difuminar al cambiar de pestaña, marcas de agua, incluso la mayoría de
la vigilancia dentro del navegador). La foto sale del dispositivo a través de
la cámara y de una segunda app o dispositivo — una superficie que la app de
práctica no puede instrumentar en absoluto. Cada solucionador de consumo
mencionado arriba está construido exactamente alrededor de este flujo —
cámara adentro, respuesta con pasos afuera, en segundos [4][5][6]. La novedad
más reciente para 2026 es que esto ya no necesita un paso discreto de "foto,
esperar el OCR": los asistentes multimodales en vivo (compartir pantalla o
modos continuos de cámara/visión en GPT, Gemini y productos comparables)
permiten que un estudiante comparta su pantalla en tiempo real y reciba una
respuesta hablada de forma conversacional, incluyendo la narración de qué
hacer después — leyendo un problema desde una pantalla en movimiento o
parcialmente oculta, en medio de la interacción. Ninguna defensa puramente del
lado del cliente o puramente basada en tiempo es duradera por sí sola; las dos
respuestas que no dependen de "si el estudiante puede sacar una foto" son (a)
exigir un artefacto entregado que no sea una sola cadena reproducible — un
proceso, un estado de manipulación de la interfaz, un diálogo — y (b) hacer
que cada ida y vuelta externa cueste más, de forma acumulada, que los puntos
que gana, mediante repreguntas adaptativas (§6 e Implicaciones de diseño más
abajo).

### 4. Qué tan extendido está ya el uso de IA entre los estudiantes

Esto no es un comportamiento marginal. La encuesta de HEPI de diciembre de
2024 a 1,041 estudiantes universitarios de tiempo completo del Reino Unido
(levantada por Savanta) encontró que 92% había usado alguna herramienta de IA
y 88% había usado IA generativa específicamente para evaluaciones, un salto
marcado desde 53% un año antes; el ahorro de tiempo (51%) y la mejora
percibida de calidad (50%) encabezaron las motivaciones declaradas, con el
miedo a acusaciones de copia (53%) y el riesgo de alucinaciones (51%) como los
principales disuasivos — no una falta de capacidad o de conocimiento [1]. El
reporte de enero de 2025 de Pew Research (Ipsos, sept.–oct. 2024, n=1,391
adolescentes de EE. UU. de 13 a 17 años) encontró que 26% había usado ChatGPT
para tareas escolares, el doble del 13% registrado en 2023 — y el propio
juicio de los adolescentes sobre qué tan aceptable es varía marcadamente según
la tarea: 54% lo considera aceptable para investigar un tema, pero solo 29%
para resolver problemas de matemáticas (28% lo considera inaceptable), y 18%
para escribir ensayos [10]. Esa asimetría importa aquí: las matemáticas son la
materia sobre la que los propios estudiantes están más divididos, una
apertura real para un producto cuyas superficies calificadas/clasificadas
pueden afirmar de forma creíble que resisten el uso casual de solucionadores.
El uso entre quienes ya tienen acceso a IA se inclina hacia la búsqueda
directa de respuestas: el análisis de Anthropic de aproximadamente 575,000
conversaciones académicas en Claude.ai encontró que Ciencias de la
Computación y STEM están fuertemente sobrerrepresentadas respecto a la
matrícula (Ciencias de la Computación por sí sola es 36.8% de las
conversaciones contra 5.4% de los títulos en EE. UU.), y cerca de la mitad
(~47%) de las conversaciones fueron "Direct" — buscando una respuesta o
contenido terminado con un mínimo de ida y vuelta [9]. El desglose de tareas
se inclinó hacia trabajo de orden superior (Creating 39.8%, Analyzing 30.2%) y
se alejó del recuerdo (Remembering 1.8%) [9], consistente con un modo por
defecto de "deja que la herramienta razone, yo me quedo con el resultado" —
precisamente el comportamiento que una app de práctica necesita volver poco
rentable.

### 5. El fracaso de los detectores de texto de IA, y lo que implica

Dos líneas de investigación publicada socavan la idea de que un detector
pueda filtrar la copia de forma confiable. Primero, los detectores están
demostrablemente sesgados: los estudios sobre detectores de GPT encuentran que
"consistently misclassify non-native English writing samples as AI-generated,
whereas native writing samples are accurately identified", y las mismas
estrategias simples de prompting que reducen este sesgo también permiten que
un usuario evada la detección por completo — la misma palanca corta en ambos
sentidos [7]. Segundo, los detectores son frágiles frente a la evasión
adversarial en general: una investigación que probó la detección contra texto
de ChatGPT y Claude encontró que la paráfrasis, el espaciado aleatorio y las
perturbaciones adversariales "can significantly diminish detection
effectiveness", concluyendo que los métodos actuales carecen de robustez
incluso frente a una evasión poco sofisticada [8]. La implicación aquí es
directa: ningún campo de "explica tu razonamiento" puede usar de forma segura
un detector de IA como un filtro automatizado de aprobado/reprobado — hacerlo
sería trivialmente evadible y arriesgaría marcar de forma desproporcionada
trabajo genuino de escritores cuya primera lengua es el español u otros
escritores no nativos, en un producto cuyos propios requisitos exigen una
experiencia bilingüe. La detección, donde se use, debe funcionar como una
señal suave que alimenta la revisión humana, nunca como un bloqueo
automatizado.

### 6. Respuestas de diseño que sí sobreviven el contacto con un solucionador

El hilo conductor de toda mitigación que realmente funciona es el mismo: dejar
de calificar un solo artefacto final reproducible, y empezar a calificar algo
que un solucionador no puede entregar de un solo golpe — un proceso con pasos
intermedios calificados, un juicio sobre el trabajo de alguien más, una
repregunta adaptativa en vivo, o un estado de manipulación de la interfaz.
Nada de esto vuelve a un estudiante decidido "a prueba de solucionador"; lo
que hace es elevar las idas y vueltas, el trabajo de traducción y el costo en
tiempo por punto ganado — la única palanca que una PWA de autoservicio
realmente controla. La tabla y las Implicaciones de diseño más abajo
convierten esto en un catálogo concreto de construcción.

## Qué sobrevive a un solucionador

| Formato del ítem | Qué tan fácil lo vence un solucionador | Calificabilidad |
|---|---|---|
| Respuesta final simple ("resuelve para x") | Trivial — segundos, éxito casi total [4][5][6] | Totalmente autocalificable; el formato más débil |
| Problema de palabras de un solo paso | Fácil para LLM multimodales; los solucionadores solo-OCR son más débiles pero están cerrando la brecha | Autocalificable con un parser |
| Problema de palabras multi-paso, con subcantidades nombradas | Sigue siendo vencido, pero requiere transcribir todo el problema | Autocalificable por paso; fricción, no inmunidad |
| "Muestra tu trabajo" / proceso completo | El solucionador genera un proceso completo para copiar textualmente | Necesita calificación humana/de IA; el texto copiado no es detectable de forma confiable [7][8] |
| "Encuentra el error en esta solución" | Más difícil — el solucionador debe evaluar un argumento, no solo producir uno | Autocalificable (qué línea, qué error) |
| Solo estimación / orden de magnitud | Débil por sí sola — una respuesta exacta de un solucionador satisface trivialmente una verificación de rango | Fácil de autocalificar; combinar con una justificación |
| Manipulación interactiva (arrastrar un punto, construir una gráfica, balancear una ecuación) | El solucionador puede describir el objetivo, pero realizar la acción en la interfaz todavía requiere al estudiante | Calificado sobre el estado final de la interfaz, no sobre una cadena de texto |
| Multi-respuesta / selecciona-todos, distractores basados en errores conceptuales | Moderado — resolver por fuerza bruta obtiene el conjunto, pero los distractores dirigidos debilitan el atajo | Totalmente autocalificable |
| Repregunta adaptativa (números nuevos, mismo método) | Fuerte — detecta la diferencia entre "respondió una vez" y "puede repetir"; solo se vence volviendo a consultar cada vez | Autocalificable, totalmente controlado por la app |
| Diálogo socrático con el tutor dentro de la app | Fuerte contra capturas de pantalla estáticas; se degrada si se pega texto de un solucionador | Necesita su propio calificador — la misma carrera armamentista, un nivel más arriba |
| Defensa oral en vivo / verificación síncrona | Muy fuerte | Necesita personal/infraestructura en vivo; mal ajuste para una PWA de autoservicio |
| Demostración original/novedosa de nivel de investigación | Resiste a los solucionadores y a los LLM generales en la verdadera frontera [11][2][3] | No calificable a escala; solo revisión experta |

## Implicaciones de diseño

1. Formato por defecto de pista/reto: mostrar una solución resuelta con un
   paso incorrecto, preguntar cuál línea y por qué — evaluar un argumento
   vence a producir uno.
2. Reemplazar la caja de respuesta única con un proceso estructurado de
   múltiples campos (cada operación más su resultado intermedio), calificado
   por paso, de modo que una respuesta final copiada sin los pasos
   correspondientes falle automáticamente.
3. Repregunta adaptativa obligatoria: seguir una respuesta correcta
   inmediatamente con un problema isomorfo (mismo método, números nuevos);
   "correcto una vez, incorrecto en la variante" es una señal real,
   especialmente en los modos clasificados/leaderboard.
4. Ítems de multi-respuesta/selecciona-todos con distractores construidos a
   partir de errores conceptuales documentados y específicos del tema, no de
   "números cercanos" genéricos, de modo que resolver por fuerza bruta sea un
   atajo más débil hacia el conjunto correcto completo.
5. Poner las preguntas de valor exacto detrás de un paso de estimación
   primero (calificar una respuesta de rango u orden de magnitud antes de
   revelar la pregunta precisa), premiando el sentido numérico que un
   solucionador no necesita.
6. Manipulativos interactivos — arrastrar un punto en una recta numérica,
   colocar puntos para construir una gráfica, mover términos para balancear
   una ecuación — calificados sobre el estado resultante de la interfaz, no
   sobre un número escrito: el único formato que un solucionador no puede
   devolver como una cadena copiable, incluso cuando puede describir la
   respuesta.
7. Chat de tutor socrático dentro de la app como la vía principal para pedir
   ayuda, de modo que pedir ayuda produzca un diálogo calificado en lugar de
   una cadena extraíble por captura de pantalla; calificar en parte según la
   coherencia y especificidad de los propios turnos de seguimiento del
   estudiante.
8. Un campo breve de "explícalo con tus propias palabras" antes de aceptar
   una respuesta; usar cualquier señal de texto de IA solo como una marca
   suave para revisión humana, nunca como un bloqueo automatizado, dado el
   sesgo de los detectores contra escritores no nativos y su evadibilidad
   mediante paráfrasis [7][8].
9. Presupuestos de tiempo en modo clasificado suficientemente cortos para que
   una ida y vuelta externa completa (fotografiar, hacer OCR/resolver, copiar
   de regreso) cueste más que resolver directamente; el modo de práctica sin
   límite de tiempo se mantiene como la superficie abiertamente de baja
   fricción y no competitiva.
10. Aleatorizar los parámetros numéricos del lado del servidor por
    estudiante/intento, de modo que una captura de pantalla, una clave de
    respuestas compartida o un resultado web guardado en caché no se
    transfiera al ítem idéntico de otro estudiante.
11. Ponderar la calificación hacia la consistencia a través de muchos ítems
    pequeños (rachas, portafolios) en lugar de ítems individuales de alto
    valor, reduciendo el beneficio de resolver un solo ítem con ayuda
    externa.
12. Autoevaluación de confianza (1-5) junto a cada respuesta; una alta
    confianza mal calibrada con un razonamiento que no coincide es una señal
    útil y no punitiva.
13. Separar el discurso de integridad por modo: el modo práctica no hace
    ninguna afirmación de resistencia a solucionadores; el modo
    clasificado/leaderboard concentra repreguntas adaptativas, calificación
    de proceso y temporizadores cortos, ya que esa es la superficie cuya
    integridad le importa a otros usuarios.
14. Enrutar los ítems de "produce una demostración novedosa" cercanos a nivel
    doctorado hacia revisión humana o entre pares de forma asíncrona en lugar
    de autocalificación — el único formato que todavía resiste tanto a los
    solucionadores de consumo como a los modelos de frontera [11][2][3], y el
    único formato que nadie puede autocalificar a escala.

**Lo que no podemos prevenir, dicho sin rodeos:** cualquier tarea completamente
especificable como texto plano o una sola imagen con una respuesta final
verificable, entregada sin un proceso o repregunta obligatorios, será resuelta
en segundos por herramientas ya ampliamente usadas por los estudiantes —
porque el canal de la foto o la visión en vivo nunca toca la app en absoluto.
Los asistentes multimodales en vivo erosionan aún más las defensas basadas en
presión de tiempo, ya que un estudiante puede recibir guía hablada mientras la
pantalla permanece visible, en lugar de hacer una ida y vuelta con una captura
de pantalla estática. Ningún filtro basado en detectores es seguro para
usarse de forma punitiva. Nada de esto se puede arreglar con ingeniería; solo
se puede hacer menos rentable (no la superficie calificada) o más costoso por
punto (diseño adaptativo). Una afirmación en contrario es mercadotecnia, no un
hecho.

## Preguntas abiertas para el dueño del proyecto

1. ¿Deberían los modos clasificados/leaderboard imponer un techo de tiempo
   estricto por ítem, más corto que una ida y vuelta típica de
   foto-y-resolver — y qué adaptación existe para los estudiantes que
   genuinamente necesitan más tiempo?
2. ¿Cuánto del roadmap se destina a un tutor socrático propio (costo de LLM
   propio, moderación, latencia) frente al diseño de ítems adaptativos y
   calificación de procesos sin ningún componente generativo?
3. ¿Debería el producto usar alguna vez señales de similitud de texto de IA
   en un contexto bilingüe EN/ES, dado el sesgo documentado de los
   detectores contra escritores no nativos — o esa clase de verificación
   queda descartada por política?
4. Para el contenido de nivel doctorado, ¿está la revisión manual/entre
   pares de demostraciones abiertas dentro del alcance, o el nivel superior
   se mantiene confinado a formatos autocalificables (crítica de
   demostraciones, detección de errores) aunque eso limite qué tan "de
   doctorado" puede llegar a ser?
5. ¿Debería el modo práctica permitir explícitamente el uso de herramientas
   externas como una decisión de diseño declarada, replanteando el discurso
   de integridad alrededor del modo clasificado y del dominio a lo largo del
   tiempo, en lugar de dar a entender que las respuestas de práctica
   resisten a los solucionadores cuando estructuralmente no pueden?

## Fuentes

1. HEPI, "Student Generative AI Survey 2025" — https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/
2. Google DeepMind, "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the International Mathematical Olympiad" — https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/
3. Google DeepMind, "AI solves IMO problems at silver medal level" — https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/
4. Wikipedia, "Photomath" — https://en.wikipedia.org/wiki/Photomath
5. Photomath, sitio oficial del producto — https://photomath.com/en/
6. Symbolab, sitio oficial del producto — https://es.symbolab.com/
7. Liang et al., "GPT detectors are biased against non-native English writers," arXiv:2304.02819 — https://arxiv.org/abs/2304.02819
8. "MGTBench: Benchmarking Machine-Generated Text Detection," arXiv:2303.14822 — https://arxiv.org/abs/2303.14822
9. Anthropic, "Anthropic Education Report: How University Students Use Claude" — https://www.anthropic.com/news/anthropic-education-report-how-university-students-use-claude
10. Pew Research Center, "About a quarter of U.S. teens have used ChatGPT for schoolwork — double the share in 2023" — https://www.pewresearch.org/short-reads/2025/01/15/about-a-quarter-of-us-teens-have-used-chatgpt-for-schoolwork-double-the-share-in-2023/
11. Epoch AI, página del benchmark "FrontierMath" — https://epoch.ai/benchmarks/frontiermath
12. Vals AI, leaderboard del benchmark AIME — https://www.vals.ai/benchmarks/aime
13. Wolfram|Alpha, página oficial "About" — https://www.wolframalpha.com/about
14. Microsoft Education, resumen del producto (contexto de Math Solver) — https://www.microsoft.com/en-us/education/products/math-solver
