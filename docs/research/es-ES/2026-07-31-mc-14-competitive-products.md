# Investigación competitiva y de diseño: productos líderes de aprendizaje de matemáticas

> Investigación Math Challenge — 2026-07-31 — tema 14

## Resumen ejecutivo (ES)

- Khan Academy combina vídeo + práctica adaptativa con dos monedas de progreso distintas: **Energy Points** (miden esfuerzo, no dominio) y **Mastery Points** (miden dominio real por habilidad); esta separación evita que «jugar el sistema» se confunda con aprender [1]. Es gratuito, financiado por filantropía (~128 M $ /año) [Business model].
- La evidencia de Khan Academy es más fuerte a nivel de plataforma (≥30 min/semana → ~20 % de ganancia adicional en MAP Growth) [2] que a nivel de Khanmigo (profesor particular IA): un estudio de física con 69 universitarios no encontró diferencia significativa frente a usar un buscador, aunque la percepción subjetiva fue positiva [3].
- Brilliant.org es la referencia de diseño de «aprender haciendo»: cada lección es una secuencia de problemas interactivos con scaffolding y feedback inmediato, sin vídeo-lecciones tradicionales; una respuesta incorrecta no penaliza, se explica y se sigue [5][7]. Precio: ~150 $ /año o ~10 $ /mes.
- Kumon es el modelo de referencia para «pasos pequeños» e incrementalidad extrema: cada hoja de trabajo tiene un **Standard Completion Time** (tiempo estándar) que decide si el niño repite o avanza — el tiempo, no solo la corrección, es la señal de dominio [9][10]. El **What Works Clearinghouse (WWC)** no pudo emitir conclusión sobre su eficacia por falta de estudios que cumplan sus estándares [11] — un dato que conviene citar con cuidado, no como validación.
- IXL usa **SmartScore** (0–100), un algoritmo que pesa dificultad, racha y recencia; pasado el umbral 90 («Challenge Zone») los aciertos suman poco y los errores restan mucho más, lo que fuerza consistencia real en vez de un pico de suerte [12][13].
- Prodigy Math es el caso de advertencia más citado: matemáticas gratis pero envuelto en una RPG con monetización agresiva de cosméticos/mascotas que crea «dos clases» de alumnos: hubo una queja formal ante la FTC de EE.UU. en 2021 por publicidad engañosa y manipulación a menores [15][16][17]. Es también evidencia de que el «core loop» de batalla (responder para ganar puntos de magia) no enseña por sí mismo — solo practica.
- DreamBox y ST Math tienen la evidencia independiente más sólida del grupo: DreamBox con estudios de Harvard/CEPR y SRI, calificado «STRONG» por Evidence for ESSA [20]; ST Math cumple el nivel WWC «Meets Evidence Standards with Reservations» según WestEd (2014), aunque análisis posteriores reportan efectos no significativos en algunos contextos — la evidencia es mixta, no unánime [21][23].
- ST Math (JiJi) es el diseño más radical: **cero palabras**, todo visual/espacial, pensado para que el idioma no sea barrera — relevante directamente para el requisito EN/ES/FR/PT/DE de Math Challenge [24][25].
- Photomath cambió de negocio tras ser adquirido por Google (2023): pasó de suscripción pura a alimentar señales de aprendizaje al ecosistema Google (Search, Workspace for Education) — es una herramienta de «resolver», no de práctica graduada [26].
- Duolingo Math no fracasó ni se canceló: se fusionó dentro de la aplicación principal de Duolingo en 2023–2024 tras tener menos tracción que Chess/Music — una lección sobre lanzar un producto «spin‑off» separado versus integrarlo desde el día uno [28].
- El hueco de mercado que ningún competidor cubre bien: nadie combina (a) problemas reales estilo Brilliant, (b) progresión incremental verificable estilo Kumon/IXL, (c) diseño multilingüe sin dependencia del texto estilo ST Math, y (d) ausencia de monetización manipuladora hacia menores. Ese es el espacio que Math Challenge puede ocupar.

## Executive summary (EN)
Nueve productos fueron evaluados para bucle central, presentación del problema, calificación, progresión y evidencia independiente. El patrón más claro: las plataformas con la evidencia de eficacia *independiente* más sólida (Khan Academy a gran escala, DreamBox, IXL, ST Math) separan la capa de recompensa de «effort/engagement» de la señal de «mastery», y utilizan umbrales de dominio por habilidad algorítmicos en lugar de la finalización del curso. Las plataformas optimizadas puramente para el compromiso (Prodigy) han recibido críticas de nivel regulatorio por monetizar a los niños mediante la presión de bienes virtuales, y presentan una evidencia de resultados de aprendizaje más débil en relación con el tiempo invertido. La contribución de Kumon no es «engagement design» — es una escalera de hojas de trabajo incremental, cronometrada rigurosamente, donde un cronómetro, no solo la corrección, decide la progresión; su evidencia formal de eficacia es escasa según los estándares WWC a pesar de décadas de reputación anecdótica. Brilliant.org es la mejor plantilla para *presentar un problema*: breve introducción conceptual, seguida de un problema interactivo guiado con andamios y gestión de respuestas erróneas sin castigo. ST Math es la prueba más sólida existente de que un enfoque sin palabras y espacial puede validarse (WWC/ESSA Tier 2) y es directamente relevante para el requisito de cinco lenguas de Math Challenge. La historia de Duolingo Math (integrada en la aplicación principal en lugar de permanecer como producto independiente) es una advertencia sobre la dilución de los spin‑off. La brecha del mercado: ningún producto único combina la elaboración de problemas al nivel de Brilliant con la puerta de dominio incremental al nivel de Kumon/IXL, la independencia lingüística al nivel de ST Math, y un modelo de negocio que no presione a los niños a gastar.

## Findings

### Khan Academy

**Bucle central:** vídeo corto opcional o lectura, seguido de un conjunto de ejercicios; las respuestas correctas otorgan Puntos de energía (moneda de esfuerzo sin límite, no es una señal de dominio) y avanzan hacia los Puntos de dominio (específicos de la destreza, algorítmicos, que requieren corrección sostenida a lo largo del tiempo, no una racha única) [1]. Las destrezas se organizan en un árbol de destrezas con requisitos previos y repaso espaciado que vuelve a presentar el material ya dominado. Khanmigo, el tutor IA, es una capa de chat al estilo socrático, no un currículo separado [4].

**Valoración:** la corrección por pregunta alimenta el modelo de dominio; los Puntos de energía recompensan el avance a material nuevo incluso cuando se falla, para no castigar la toma de riesgos [1].

**Evidencia:** el propio informe de November 2024 de Khan Academy indica que ≥30 min/semana se correlaciona con ~20 % de ganancias superiores a lo esperado en MAP Growth [2] — evidencia correlacional a nivel de plataforma, no un ECA. Para Khanmigo específicamente, un estudio revisado por pares de métodos mixtos (69 estudiantes de pregrado, física) encontró ganancias significativas en todas las condiciones pero **sin diferencia significativa** entre Khanmigo y un motor de búsqueda convencional, aunque los alumnos prefirieron subjetivamente la orientación paso a paso de Khanmigo [3]. El blog de Khan Academy describe experimentos en curso (Oct 2025–Apr 2026) para mejorar la efectividad medida de Khanmigo [4] — la propia organización lo trata como no probado y en desarrollo.

**Negocio:** organización sin ánimo de lucro 501(c)(3), gratuita para los usuarios finales, financiada con $128M+/año en filantropía.

### Brilliant.org

**Bucle central:** cada lección comienza con una introducción conceptual de 2–4 frases + ilustración, y pasa directamente a una cadena de problemas interactivos que el alumno resuelve — “aprender haciendo”, explícitamente sin clase magistral previa [5]. Las respuestas incorrectas no se penalizan: la interfaz muestra la respuesta correcta y explica el razonamiento [7].

**Presentación:** widgets visuales/interactivos (deslizadores, diagramas arrastrables, revelaciones en varios pasos), sin muros de texto.

**Valoración:** retroalimentación inmediata por problema con explicaciones trabajadas; los retos diarios y la mecánica de racha/nivel impulsan las visitas recurrentes [7].

**Progresión:** 40+ cursos, desde primaria hasta nivel de posgrado (matemáticas, ciencias, informática, datos, IA); salto temático sencillo entre cursos, secuenciación estrecha dentro de cada lección.

**Evidencia:** no se encontró ningún estudio independiente revisado por pares sobre la eficacia; el caso de Brilliant se basa en la credibilidad del diseño instruccional y reseñas, no en resultados medidos.

**Negocio:** modelo freemium; ~$150/año Premium (~$10/mes facturado anualmente), gratuito para docentes K‑12 [6].

### Kumon

**Bucle central:** hojas de trabajo breves y cronometradas en una secuencia fija de pasos diminutos — estudiar un ejemplo trabajado, luego resolver problemas casi idénticos con mínima intervención del profesor (“autoaprendizaje”) [8][9].

**Valoración:** corrección *y* un **Tiempo estándar de finalización (SCT)** publicado por nivel. Completar con precisión dentro del SCT autoriza la siguiente hoja; no cumplir el SCT —aunque las respuestas sean correctas— obliga a repetir [10]. La velocidad es un criterio de aprobado/reprobado de primera clase aquí, a diferencia de cualquier otro producto revisado.

**Progresión:** el tamaño del paso es deliberadamente más fino que lo que una aula consideraría un nuevo tema, de modo que cada paso resulta alcanzable sin enseñanza directa.

**Evidencia:** el What Works Clearinghouse de EE. UU. revisó estudios de Kumon Math y constató que ninguno cumplía sus estándares de evidencia, por lo que **WWC no pudo extraer una conclusión** en ningún sentido [11] — un “sin veredicto”, no un hallazgo negativo, pero implica que décadas de reputación de mercado no están respaldadas por evidencia de nivel WWC. Comentarios secundarios reportan ganancias concentradas en los primeros 12–18 meses (especialmente para alumnos que comienzan por debajo del nivel de curso) con mesetas posteriores, y críticas recurrentes de que el método premia el cálculo mecánico sobre el razonamiento conceptual.

**Negocio:** centros franquiciados presenciales, matrícula mensual por asignatura (varía según el mercado).

### IXL

**Bucle central:** responder preguntas de práctica adaptativa en una destreza elegida; **SmartScore**, un medidor de dominio de 0–100 por destreza, se actualiza tras cada respuesta.

**Valoración:** SmartScore pondera dificultad, rachas de respuestas recientes y consistencia, no solo el porcentaje correcto [12][13]. En SmartScore 90 (“Zona de reto”), las respuestas correctas añaden solo 1–2 puntos mientras que un error puede restar 3–8 — asimetría deliberada para que el tramo final requiera verdadera consistencia, no una racha afortunada [13].

**Progresión:** doble nivel de adaptividad — la dificultad del ítem se adapta dentro de la destreza, y un Diagnóstico en tiempo real recomienda qué destreza trabajar a continuación.

**Evidencia:** IXL publica su propio documento metodológico de SmartScore [12]; no se encontró ningún estudio independiente de terceros sobre resultados.

**Negocio:** $79–159/año por niño según el paquete de asignaturas, con descuentos por varios niños; licencias escolares desde $369/año [14].

### Prodigy Math

**Bucle central:** batalla RPG por turnos superpuesta a la práctica matemática — responder una pregunta otorga Puntos mágicos que se gastan para lanzar hechizos contra monstruos u otros personajes; el mago sube de nivel, obtiene equipamiento y desbloquea zonas [18].

**Valoración:** la corrección abre la puerta al progreso de la batalla; no se incorpora explicación de conceptos en el bucle.

**Modelo de negocio y controversia:** el contenido de Matemáticas/Inglés es nominalmente gratuito; el contenido de Ciencias y los elementos cosméticos/mejora de juego (mascotas, equipamiento, visuales “nubes vs. tierra”) requieren suscripciones de pago (Core ~$9,95/mes, Plus ~$14,95/mes, Ultra ~$19,95/mes) [19]. En February 2021, grupos de defensa infantil presentaron una queja formal ante la FTC de EE. UU. alegando que Prodigy “agresivamente” y “injustamente” comercializa actualizaciones premium a niños, describiendo el encuadre como gratuito para escuelas como engañoso y señalando una experiencia visible de dos niveles entre alumnos que pagan y los que no [15][16][17]. Los críticos también sostienen que el juego “no instruye… solo ofrece práctica”, citando una investigación que sitúa a Prodigy último entre cuatro apps comparadas por ganancias de aprendizaje por hora invertida [17]. La respuesta de Prodigy: más del 95 % de los usuarios registrados nunca han pagado, y el modelo freemium financia el acceso gratuito para el resto [16].

**Conclusión:** Prodigy es el caso de advertencia más claro aquí — no tanto por sus mecánicas de juego, sino por la presión de estatus dentro del juego visible para compañeros no pagadores, en un producto promocionado a escuelas como gratuito, que ya ha sido objetado formalmente por los reguladores.

### DreamBox Learning

**Bucle central:** lecciones adaptativas tipo juego para K‑8 que ramifican según *cómo* el alumno resuelve cada problema — estrategia y pasos intermedios, no solo la respuesta final — para elegir la siguiente tarea.

**Evidencia:** uno de los dos productos con mejor evidencia revisada. Un estudio de Harvard CEPR con ~3.000 alumnos en dos distritos encontró que los estudiantes con 14 horas de uso mejoraron ~4 % en las evaluaciones NWEA MAP/PARCC/estatales [20]. Un estudio de LearnPlatform en el distrito escolar William Penn (1.800 alumnos de K‑6, mayoría afroamericana y con derecho a comidas gratuitas) halló que los estudiantes que completaban menos de una hora/semana de DreamBox obtenían puntuaciones finales de Savvas Math significativamente más altas que sus compañeros con menor uso [22]. Existe también una instantánea de evidencia de WWC [21]. Un ECA en un distrito del sureste encontró una ganancia de 0,12 DE en una prueba de destrezas de educación primaria temprana, pero sin ventaja significativa en la prueba estatal de fin de curso — evidencia real pero desigual según la medida de resultados. DreamBox está calificado como “STRONG” por Evidence for ESSA [20].

**Negocio:** licencias para distritos/escuelas K‑8, venta B2B a centros educativos.

### ST Math (MIND Research Institute)

**Bucle central:** el alumno guía a JiJi el pingüino a través de puzzles espaciales y visuales **sin instrucciones escritas ni orales** — todo el bucle problema/retroalimentación es visual, construido alrededor del razonamiento espacial‑temporal más que del lenguaje [24][25].

**Valoración:** implícita — JiJi tiene éxito o falla según si la manipulación del puzzle por parte del alumno es matemáticamente correcta; el fallo es inmediatamente visible y reintentable, sin veredicto verbal necesario.

**Evidencia:** una evaluación de WestEd 2014 encontró que las calificaciones de ST Math tenían 6,3 puntos porcentuales más de estudiantes proficientes en el California Standards Test que en escuelas de comparación emparejadas; ese diseño fue calificado por WWC como **“Meets Evidence Standards with Reservations,”** y MIND afirma que el programa cumple con ESSA Tier 2 [23][24]. Otros análisis del mismo lote de búsqueda hallaron un efecto no significativo durante dos años en otro contexto — la evidencia es real pero mixta entre estudios.

**Relevancia directa:** ST Math es la prueba más sólida de que un **diseño sin palabras puede ser validado independientemente**, útil para un producto en 5 idiomas (EN/ES/FR/PT/DE) — una pista visual bien diseñada no necesita traducción y se lanza en los cinco idiomas sin coste de localización adicional, especialmente para edades prelectoras de 4–7 años.

**Negocio:** MIND Research Institute es una entidad sin ánimo de lucro; ST Math se licencia B2B a distritos/escuelas.

### Matific

**Bucle central:** contenido alineado al currículo en cuatro formatos — hojas de trabajo, “episodios” (aplicaciones breves tipo juego), problemas verbales y talleres para docentes — en una espiral modular y progresiva (los temas reaparecen con mayor dificultad en lugar de una escalera lineal estricta).

**Evidencia:** el propio marketing de Matific cita una mejora media del 34 % en la puntuación de pruebas con 30 min/sem [29]; se trata de una cifra reportada por el proveedor, no verificada de forma independiente en las fuentes recuperadas, y debe considerarse una afirmación que comprobar, no un resultado de nivel citación.

**Negocio:** ~9,99 $/mes o 79,99 $/año; nivel “Galaxy” 19,99 $ por grado individual o 39,99 $ por K‑6 completo/año; pruebas gratuitas.

### Mathletics (3P Learning)

**Bucle central:** módulos de práctica basados en el currículo más un modo “Live Mathletics” en directo y global donde los estudiantes compiten cara a cara en tiempo real, junto a gamificación mediante certificados/puntos.

**Evidencia:** no se encontró ningún estudio independiente específico del producto. Los meta‑análisis generales sobre gamificación en la educación matemática (41 estudios, ~5.071 participantes) muestran un gran efecto positivo medio pero una heterogeneidad significativa — algunas implementaciones no generan efecto o incluso lo negativo, de modo que la gamificación no es automáticamente eficaz; la calidad de la ejecución decide el resultado [32].

**Negocio:** ~99 $/año para el hogar (un solo niño); precios para escuelas/distritos mediante presupuesto a medida.

### Photomath

**Bucle central:** fundamentalmente una **herramienta de resolución**, no práctica evaluada — se fotografía un problema, el OCR (precisión reclamada ~98 %) lo convierte en una expresión simbólica, y un motor de álgebra computacional devuelve múltiples soluciones paso a paso con recorridos animados.

**Evaluación/progresión:** ninguna en sentido de dominio — no hay árbol de habilidades ni puerta de dominio; el valor reside en la ayuda puntual para deberes, el diseño opuesto al de Kumon/IXL/Khan Academy con progresión gated.

**Cambio de modelo de negocio:** adquirido por Google/Alphabet en 2023; para 2026 su papel pasó de ser una aplicación de suscripción independiente a alimentar datos de señal de aprendizaje en Google Workspace for Education/Gemini y en la función “Homework Helper” de Search — monetizando como valor del ecosistema más que como suscripción pura [26][27].

**Relevancia:** Photomath es el anti‑patrón a evitar copiar — un solucionador puro de respuestas socava “problemas reales, no aritmética desnuda” si un niño puede fotografiar cualquier problema de Math Challenge y obtener una respuesta instantánea. Esto defiende formatos de problemas interactivos y manipulables que resistan la resolución ingenua mediante foto.

### Duolingo Math

**Historia:** lanzada como una **aplicación independiente** en octubre de 2022; en Duocon 2023 Duolingo anunció que integraría Math en la aplicación principal; la app independiente salió de la App Store el 30 de noviembre de 2023, integrándose en la app principal a principios de 2024 [28]. Math (y Music) había alcanzado aproximadamente 3 millones de usuarios combinados un año después del lanzamiento — menos que asignaturas hermanas como Chess — contexto que, aunque no se indica como única causa, explica la integración en lugar de mantenerla independiente. En septiembre de 2025 Math se rediseñó para agrupar Unidades en Cursos y Temas, imitando un currículo escolar [28].

**Implicación de diseño:** una advertencia sobre la apuesta del “spin‑off independiente exitoso” — una marca matriz fuerte (Duolingo) que lanza una asignatura adyacente como su propia app observó una adopción menor que las asignaturas hermanas, y la solución fue la integración, no iterar sobre el spin‑off. Para Math Challenge, que *es* el producto independiente, el riesgo transferible es dividirlo en apps separadas por nivel o idioma en lugar de una PWA única con modos temáticos.

## Tabla comparativa

| Producto | Bucle central | Mecanismo de evaluación | Modelo de progresión | Evidencia independiente | Precio / modelo |
|---|---|---|---|---|---|
| Khan Academy | Ver/leer → conjunto de práctica → ejercicio de dominio | Puntos de energía (esfuerzo, sin límite) separados de los Puntos de dominio (por habilidad, algorítmicos) [1] | Árbol de habilidades con puerta de prerequisitos + repaso espaciado | Plataforma: ~20 % de ganancia extra en MAP Growth con ≥30 min/sem (informado por KA) [2]; estudio estilo RCT de Khanmigo: sin ganancia significativa frente a motor de búsqueda [3] | Gratis; sin ánimo de lucro, ~128 millones $/año en filantropía |
| Brilliant.org | Introducción breve de concepto → cadena de problemas interactivos | Retroalimentación inmediata por problema + explicación; respuestas erróneas no penalizadas [7] | Más de 40 cursos, de primaria a posgrado, salto temático flexible | No se encontró estudio independiente de eficacia | ~150 $/año (~10 $/mes), gratis para docentes K‑12 [6] |
| Kumon | Ejemplo trabajado → problemas de práctica casi idénticos, cronometrados | Exactitud **y** Tiempo estándar de finalización (la velocidad es aprobado/reprobado) [10] | Pasos lineales extremadamente desglosados | WWC: ningún estudio cumplió los estándares de evidencia, no se pudo llegar a una conclusión [11] | Franquicia presencial, matrícula mensual por asignatura |
| IXL | Pregunta adaptativa → actualización de SmartScore | SmartScore 0–100, asimétrico cercano al dominio (un error cuesta más que un acierto ayuda) [13] | Doble nivel de adaptividad: dificultad del ítem + recomendación de habilidad mediante diagnóstico | Sólo documento metodológico del proveedor; no se encontró estudio de resultados de terceros [12] | ~79–159 $/año por niño; licencia escolar desde 369 $/año [14] |
| Prodigy Math | Responder pregunta → Puntos mágicos → batalla RPG | Exactitud abre la batalla; sin instrucción adaptativa | Nivelación de personaje/equipo, desbloqueo de zonas | Citado como el último de 4 apps en ganancias de aprendizaje por hora [17]; queja formal de la FTC por monetización [15][16] | Matemáticas/Inglés gratis; Ciencia + cosméticos mediante niveles de 9,95 $–19,95 $/mes [19] |
| DreamBox | Seguimiento adaptativo de lección, no solo respuesta final | Estrategia consciente en cada paso | Ramificación adaptativa continua, K‑8 | Harvard CEPR (~3.000 estudiantes, +4 %) [20]; LearnPlatform William Penn (+ puntuaciones con <1 hr/sem) [22]; instantánea de evidencia WWC [21]; “Fuerte” según Evidence for ESSA | Licenciamiento para distritos/escuelas (B2B) |
| ST Math | Puzzle espacial sin palabras (JiJi) | Implícito — puzzle resuelto o no, totalmente visual | Secuencia espacial‑temporal, preK‑8 | WestEd 2014: +6,3 pp de competencia; WWC “Cumple con reservas”; ESSA Nivel 2; otros análisis sin efectos significativos [23][24] | Sin ánimo de lucro (MIND Research Institute), licenciamiento para distritos |
| Matific | Hojas de trabajo / episodios / problemas verbales / talleres | Exactitud por actividad; revisión espiral de temas | Modular, alineado al currículo, espiral | Reclamo reportado por el proveedor de una mejora del 34 % (no verificado de forma independiente en este paso) | ~9,99 $/mes o 79,99 $/año; Galaxy 19,99 $–39,99 $/año |
| Mathletics | Módulos de práctica curricular + competición global en directo | Exactitud por pregunta + certificados/puntos | Módulos alineados al currículo, modo competitivo | No se encontró estudio específico del producto; meta‑análisis general de gamificación muestra efecto grande pero heterogéneo | ~99 $/año para el hogar; presupuestos personalizados para escuelas |
| Photomath | Fotografía problema → OCR → solución paso a paso | Ninguno (solucionador, no práctica) | Ninguno (sin árbol de habilidades) | N/D — no es un producto de resultados de aprendizaje | Freemium → Photomath Plus; post‑Google, integrado al ecosistema (Search/Workspace) [26] |
| Duolingo Math | Lección diaria basada en racha, gamificada | Exactitud + racha/XP (mecánicas centrales de Duolingo) | Cursos → Temas → Unidades (rediseñado 2025) | No investigado en este paso (no se encontró estudio de eficacia); los datos de adopción sugieren que la app independiente tuvo peor rendimiento que Chess | Gratis, integrado en la app principal de Duolingo desde 2023‑24 [28] |

## Design implications for Math Challenge

1. **Separar la señal de esfuerzo de la señal de dominio**, como Khan Academy separa los *Energy Points* de los *Mastery Points* [1]. Las tablas de clasificación deberían recompensar el dominio demostrado por habilidad, no el volumen de tareas fáciles.
2. **Copiar la forma de presentación de problemas de Brilliant**: breve introducción conceptual, seguida de un único problema interactivo con andamiaje, y retroalimentación inmediata no punitiva con una explicación paso a paso [5][7] — esto se corresponde directamente con «problemas reales, no mera aritmética».
3. **Adoptar un umbral de dominio asimétrico cerca de la cima**, como la Zona de Desafío de IXL (los fallos cuestan más que los aciertos a partir del 90 %) [13], de modo que una racha de suerte no pueda simular dominio.
4. **Reservar una dimensión temporal solo para habilidades de fluidez procedimental** (hechos aritméticos, manipulación algebraica), inspirado en el Tiempo Estándar de Finalización de Kumon [10] — no extender la presión temporal a tareas de razonamiento, donde WWC no encontró evidencia sólida de que el modelo con límite de velocidad favorezca la comprensión conceptual [11].
5. **No crear una economía de estatus al estilo Prodigy**. Evitar mecánicas en las que los usuarios que pagan obtengan cosméticos visiblemente superiores que los usuarios gratuitos vean — la forma exacta de una denuncia formal ante la FTC [15][16][17]. Si Math Challenge se monetiza, mantener los niveles premium dirigidos a los padres (informes, perfiles extra, profundidad del tutor), no símbolos de estatus dirigidos a los niños.
6. **Desarrollar al menos una pista de problemas sin texto o con texto mínimo para edades de 4 a 7 años**, siguiendo el modelo JiJi de ST Math [24][25] — no necesita traducción y se lanza en los cinco idiomas sin coste de localización adicional.
7. **Diseñar la infraestructura de evidencia desde el primer día**, idealmente al estilo WWC. La mayoría de los productos revisados con fuerte reputación de mercado (Brilliant, Matific, Mathletics) carecen de evidencia de eficacia independiente; los que pueden hacer afirmaciones a nivel escolar o de distrito (DreamBox, ST Math) construyeron la medición desde el principio, no a posteriori.
8. **Tratar el resultado nulo de Khanmigo como una advertencia contra la sobrepromesa de tutores IA**. Un estudio controlado no encontró ventaja significativa frente a un motor de búsqueda convencional pese a la preferencia subjetiva por la IA [3]; validar el tutor de Math Challenge en resultados, no solo en satisfacción, antes de promocionarlo como pedagógicamente superior.
9. **Diseñar formatos de problema que resistan la resolución trivial mediante foto**. Un solucionador de fotos de deberes (la combinación OCR+Gemini de Google) supera cualquier problema estático simbólico/textual en segundos [26]; favorecer interfaces interactivas/manipulables (arrastrar, ordenar, construir, revelado en varios pasos) para problemas que deben razonarse, no buscarse.
10. **Evitar lanzar una materia adyacente como aplicación independiente**. La menor adopción de Duolingo Math frente a materias hermanas, que se reincorporó a la aplicación principal en torno a un año [28], defiende una única PWA con modos temáticos por curso/idioma en lugar de dividirla en aplicaciones separadas.
11. **Utilizar un currículo en espiral, no una escalera lineal estricta**, siguiendo el diseño modular/espiral de Matific — los temas reaparecen con dificultad creciente. Esto se adapta a perfiles gestionados por los padres y multi‑curso, donde un niño que pasa entre franjas de curso necesita acceder a temas previos y volver a evaluarlos, no archivarlos.
12. **Mantener el «por qué» visible en cada interacción de evaluación**, como hacen Brilliant [7] y Khan Academy por defecto, y como muestra ST Math a través de la consecuencia directa de un movimiento incorrecto en lugar de un veredicto textual [24]. El estado de error debe enseñar, no solo marcar en rojo.
13. **Considerar con cuidado un modo en directo/competitivo**. La competición en tiempo real de Mathletics es un diferenciador, pero los meta‑análisis de gamificación muestran efectos grandes pero altamente heterogéneos [32] — la calidad de la ejecución, no la mera presencia de competición, decide si ayuda o genera ansiedad en los alumnos con menor confianza.
14. **La brecha del mercado:** ningún producto revisado combina (a) la elaboración de problemas reales de nivel Brilliant, (b) la verificación incremental de dominio de nivel Kumon/IXL, (c) el diseño independiente del idioma de nivel ST Math, y (d) un modelo de negocio que no presione a los niños mediante estatus dentro del juego. Los productos presentan (i) artesanía sin evidencia (Brilliant), (ii) evidencia sin diseño multilingüe (DreamBox, ST Math) o (iii) compromiso sin integridad (Prodigy) — un producto que reclame crediblemente los cuatro simultáneamente tiene una posición real en el mercado.

## Open questions for the project owner

1. ¿Debería Math Challenge comprometerse, desde el primer día, a la instrumentación que apoye un futuro estudio de eficacia al estilo WWC o de comparación pareada (aunque el estudio se encargue más adelante)?
2. ¿Debe la pista de problemas sin texto/espacial (inspirada en ST Math) limitarse a edades de 4 a 7 años, o ampliarse como modo de «razonamiento visual» general para todos los cursos?
3. Dado el precedente de la FTC contra Prodigy, ¿debería Math Challenge adoptar una política interna explícita que prohíba totalmente la monetización de cosméticos dirigidos a niños, documentada en `docs/wiki/decisions.md` como un ADR, de modo que ninguna propuesta futura pueda reintroducirla sin una decisión consciente de anularla?
4. ¿Está dentro del alcance incluir un modo competitivo en tiempo real (al estilo Mathletics) en una fase posterior, y, en caso afirmativo, el propietario desea una limitación por nivel de confianza (p. ej., solo oponentes con habilidades equiparadas) para mitigar el riesgo de ansiedad que la literatura de gamificación señala para los alumnos con baja confianza?
5. ¿Debe la función de tutor IA evitar explícitamente afirmar «ganancias de aprendizaje probadas» en el material de marketing hasta que Math Challenge haya realizado su propio estudio de resultados, dado el resultado nulo de Khanmigo en al menos una comparación controlada?

## Sources

1. Khan Academy Help Center — "What are energy points, badges, and avatars?" https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars
2. Khan Academy Blog — "Khan Academy Efficacy Results, November 2024" https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/
3. Journal of Teaching and Learning — "Leveraging 'Khanmigo' Generative AI-Powered Tool for Personalized Tutoring to Learn Scientific Concepts" https://jtl.uwindsor.ca/index.php/jtl/article/view/10052
4. Khan Academy Blog — "How Khan Academy Is Building a Better AI Tutor: Our Most Recent Learnings" https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/
5. SkillsCouter — "Brilliant.org Review 2026" https://skillscouter.com/brilliant-review-math-science-coding/
6. SchemaNinja — "Brilliant.org Pricing 2026" https://schemaninja.com/brilliant-org-pricing/
7. Brilliant — "Brilliant Basics" Help Center https://brilliant.org/help/using-brilliant/
8. Kumon — "Self-Learning: The Kumon Method and Its Strengths" https://www.kumon.com/about-kumon/kumon-method/self-learning
9. Kumon Institute of Education — "Small-Step Worksheets" https://www.kumongroup.com/eng/about-kumon/method/small-steps/
10. Kumon — "Understanding Completion Time in Kumon: A Parent's Practical Guide" https://www.kumon.com/resources/canadian_english/understanding-completion-time-in-kumon-a-parents-practical-guide/
11. What Works Clearinghouse — "WWC Intervention Report: Kumon Math" (March 2009) https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_kumon_031009.pdf
12. IXL — "SmartScore Guide" https://www.ixl.com/materials/SmartScore_Guide.pdf
13. IXL Official Blog — "IXL SmartScore: The key to mastery-based learning" https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/
14. Brighterly — "IXL Cost: All You Need to Know [2026]" https://brighterly.com/blog/ixl-cost/
15. EdWeek — "Popular Interactive Math Game Prodigy Is Target of Complaint to Federal Trade Commission" https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02
16. NBC News — "In Complaint to FTC, Child Advocates Warn Prodigy Math Game Exploiting Pandemic to Prey on Students, Parents" https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294
17. Fairplay for Kids — "7 reasons to say 'no' to Prodigy" https://fairplayforkids.org/pf/prodigy/
18. Prodigy Game Wiki (Fandom) — "Battles" https://prodigy-game.fandom.com/wiki/Battles
19. Brighterly — "Prodigy Membership Cost 2026: How Much Does It Really Cost?" https://brighterly.com/blog/prodigy-membership-cost/
20. Higher Ed Dive — "Harvard research finds positive results from DreamBox adaptive learning" https://www.highereddive.com/news/harvard-research-finds-positive-results-from-dreambox-adaptive-learning/420471/
21. What Works Clearinghouse — "Evidence Snapshot: DreamBox Learning" https://ies.ed.gov/ncee/wwc/EvidenceSnapshot/627
22. Business Wire — "Study Proves DreamBox Learning Significantly Increases Math Achievement After Only One Hour of Use Per Week" https://www.businesswire.com/news/home/20230330005199/en/Study-Proves-DreamBox-Learning%C2%AE-Significantly-Increases-Math-Achievement-After-Only-One-Hour-of-Use-Per-Week
23. WestEd — "Evaluation of the MIND Research Institute's Spatial-Temporal Math (ST Math) Program in California" (2014) https://www.wested.org/resource/stmathevaluation2014/
24. MIND Research Institute — "ST Math Meets ESSA Tier 2 and WWC Standards" https://blog.mindresearch.org/news/st-math-meets-essa-tier-2-and-wwc-standards
25. MIND Education / ST Math — "Validation and Methodology" https://stmath.com/impact/validation-and-methodology
26. Business Model Canvas Template — "How Does Photomath Company Work?" https://businessmodelcanvastemplate.com/blogs/how-it-works/photomath-how-it-works
27. AI Chat Daily — "Photomath review 2026: is the math solver still essential?" https://www.aichatdaily.com/tools/photomath
28. Duolingo Wiki (Fandom) — "Math" https://duolingo.fandom.com/wiki/Duolingo_Math
29. Matific — Parents product page (efficacy claim) https://www.matific.com/us/en-us/home/parents/
30. Educational App Store — "Matific Review - Features, Pricing, Pros & Cons" https://www.educationalappstore.com/app/matific-for-school-educational-math-games
31. Mathletics — "How much does Mathletics cost?" https://knowledgebase.mathletics.com/pricing/how-much-does-mathletics-cost
32. PMC — "Examining the effectiveness of gamification as a tool promoting teaching and learning in educational settings: a meta-analysis" https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
