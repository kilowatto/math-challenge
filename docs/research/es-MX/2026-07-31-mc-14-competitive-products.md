# Investigación competitiva y de diseño: productos líderes de aprendizaje de matemáticas

> Investigación Math Challenge — 2026-07-31 — tema 14

## Resumen ejecutivo (ES)

- Khan Academy combina video + práctica adaptativa con dos monedas de progreso distintas: **Energy Points** (miden esfuerzo, no dominio) y **Mastery Points** (miden dominio real por habilidad); esta separación evita que "jugar el sistema" se confunda con aprender [1]. Es gratuito, financiado por filantropía (~$128M/año) [Business model].
- La evidencia de Khan Academy es más fuerte a nivel de plataforma (≥30 min/semana → ~20% de ganancia adicional en MAP Growth) [2] que a nivel de Khanmigo (tutor IA): un estudio de física con 69 universitarios no encontró diferencia significativa frente a usar un buscador, aunque la percepción subjetiva fue positiva [3].
- Brilliant.org es la referencia de diseño de "aprender haciendo": cada lección es una secuencia de problemas interactivos con scaffolding y retroalimentación inmediata, sin video-lecciones tradicionales; una respuesta incorrecta no penaliza, se explica y se sigue [5][7]. Precio: ~$150/año o ~$10/mes.
- Kumon es el modelo de referencia para "pasos pequeños" e incrementalidad extrema: cada hoja de trabajo tiene un **Standard Completion Time** (tiempo estándar) que decide si el niño repite o avanza — el tiempo, no solo la corrección, es la señal de dominio [9][10]. El **What Works Clearinghouse (WWC)** no pudo emitir conclusión sobre su eficacia por falta de estudios que cumplan sus estándares [11] — un dato que conviene citar con cuidado, no como validación.
- IXL usa **SmartScore** (0–100), un algoritmo que pesa dificultad, racha y recencia; pasado el umbral 90 ("Challenge Zone") los aciertos suman poco y los errores restan mucho más, lo que fuerza consistencia real en vez de un pico de suerte [12][13].
- Prodigy Math es el caso de advertencia más citado: math gratis pero envuelto en una RPG con monetización agresiva de cosméticos/mascotas que crea "dos clases" de alumnos: hubo una queja formal ante la FTC de EE.UU. en 2021 por publicidad engañosa y manipulación a menores [15][16][17]. Es también evidencia de que el "core loop" de batalla (responder para ganar puntos de magia) no enseña por sí mismo — solo practica.
- DreamBox y ST Math tienen la evidencia independiente más sólida del grupo: DreamBox con estudios de Harvard/CEPR y SRI, calificado "STRONG" por Evidence for ESSA [20]; ST Math cumple el nivel WWC "Meets Evidence Standards with Reservations" según WestEd (2014), aunque análisis posteriores reportan efectos no significativos en algunos contextos — la evidencia es mixta, no unánime [21][23].
- ST Math (JiJi) es el diseño más radical: **cero palabras**, todo visual/espacial, pensado para que el idioma no sea barrera — relevante directamente para el requisito EN/ES/FR/PT/DE de Math Challenge [24][25].
- Photomath cambió de negocio tras ser adquirido por Google (2023): pasó de suscripción pura a alimentar señales de aprendizaje al ecosistema Google (Search, Workspace for Education) — es una herramienta de "resolver", no de práctica graduada [26].
- Duolingo Math no fracasó ni se canceló: se fusionó dentro de la app principal de Duolingo en 2023–2024 tras tener menos tracción que Chess/Music — una lección sobre lanzar un producto "spin-off" separado versus integrarlo desde el día uno [28].
- El hueco de mercado que ningún competidor cubre bien: nadie combina (a) problemas reales estilo Brilliant, (b) progresión incremental verificable estilo Kumon/IXL, (c) diseño multilingüe sin dependencia del texto estilo ST Math, y (d) ausencia de monetización manipuladora hacia menores. Ese es el espacio que Math Challenge puede ocupar.

## Executive summary (EN)

Nine products were reviewed for core loop, problem presentation, grading, progression, and independent evidence. The clearest pattern: platforms with the strongest *independent* efficacy evidence (Khan Academy at scale, DreamBox, IXL, ST Math) separate the "effort/engagement" reward layer from the "mastery" signal, and they use algorithmic, per-skill mastery thresholds rather than course completion. Platforms optimized purely for engagement (Prodigy) have drawn regulatory-grade criticism for monetizing children through virtual-goods pressure, and have weaker learning-outcome evidence relative to time spent. Kumon's contribution is not "engagement design" — it is a rigorously timed, incremental worksheet ladder where a stopwatch, not just correctness, decides progression; its formal efficacy evidence is thin by WWC standards despite decades of anecdotal reputation. Brilliant.org is the best template for *presenting a problem*: short concept intro, then guided interactive problem with scaffolds and non-punitive wrong-answer handling. ST Math is the strongest existing proof that a wordless, spatial approach can be validated (WWC/ESSA Tier 2) and is directly relevant to Math Challenge's five-language requirement. Duolingo Math's history (merged into the flagship app rather than surviving standalone) is a caution about spin-off dilution. The market gap: no single product pairs Brilliant-grade problem craft with Kumon/IXL-grade incremental mastery gating, ST Math-grade language-independence, and a business model that does not pressure children into spending.

## Hallazgos

### Khan Academy

**Core loop:** video/lectura breve opcional, luego un conjunto de práctica; las respuestas correctas ganan Energy Points (moneda de esfuerzo sin tope, no una señal de dominio) y avanzan hacia Mastery Points (específicos por habilidad, algorítmicos, que requieren corrección sostenida en el tiempo, no una sola racha) [1]. Las habilidades están en un árbol de habilidades con prerequisitos, con repaso espaciado que hace resurgir el material ya dominado. Khanmigo, el tutor de IA, es una capa de chat de estilo socrático, no un currículo separado [4].

**Calificación:** la corrección por pregunta alimenta el modelo de dominio; los Energy Points recompensan adentrarse en material nuevo aun fallando, para no castigar el riesgo [1].

**Evidencia:** el propio informe de Khan Academy de noviembre de 2024 afirma que ≥30 min/semana se correlaciona con ganancias ~20% mayores de lo esperado en MAP Growth [2] — evidencia correlacional a nivel de plataforma, no un RCT. Para Khanmigo específicamente, un estudio de métodos mixtos revisado por pares (69 universitarios, física) encontró ganancias significativas en todas las condiciones pero **ninguna diferencia significativa** entre Khanmigo y un buscador simple, aunque los estudiantes prefirieron subjetivamente la guía paso a paso de Khanmigo [3]. El propio blog de Khan Academy describe experimentos en curso (oct 2025–abr 2026) para mejorar la efectividad medida de Khanmigo [4] — la propia organización lo trata como no probado y en desarrollo.

**Negocio:** organización sin fines de lucro 501(c)(3), gratuita para el usuario final, financiada con ~$128M+/año de filantropía.

### Brilliant.org

**Core loop:** cada lección abre con una introducción de concepto de 2–4 frases + ilustración, y pasa directo a una cadena de problemas interactivos que el alumno resuelve — "aprender haciendo", explícitamente no primero-la-clase [5]. Las respuestas incorrectas no se penalizan: la interfaz muestra la respuesta correcta y explica el razonamiento [7].

**Presentación:** widgets visuales/interactivos (deslizadores, diagramas arrastrables, revelados de varios pasos), no muros de texto.

**Calificación:** retroalimentación inmediata por problema con explicaciones resueltas; problemas de desafío diario más mecánicas de racha/nivel impulsan las visitas de regreso [7].

**Progresión:** más de 40 cursos, de primaria a posgrado (matemáticas, ciencia, CS, datos, IA); amigable para saltar entre temas de distintos cursos, con secuencia cerrada dentro de cada lección.

**Evidencia:** no se encontró ningún estudio de eficacia independiente revisado por pares; el caso de Brilliant es credibilidad de diseño instruccional y reseñas, no resultados medidos.

**Negocio:** freemium; Premium ~$150/año (~$10/mes con pago anual), gratis para docentes K-12 [6].

### Kumon

**Core loop:** hojas de trabajo cortas y cronometradas en una secuencia fija de pasos diminutos — estudiar un ejemplo resuelto, luego resolver problemas casi idénticos con mínima intervención del maestro ("autoaprendizaje") [8][9].

**Calificación:** corrección *y* un **Standard Completion Time (SCT)** publicado por nivel. Terminar con exactitud dentro del SCT habilita la siguiente hoja; no cumplir el SCT — incluso con respuestas correctas — dispara repetición [10]. La velocidad es aquí un criterio de aprobado/reprobado de primera clase, a diferencia de todos los demás productos revisados.

**Progresión:** tamaño de paso deliberadamente más fino de lo que un salón de clases trataría como tema nuevo, de modo que cada paso se sienta alcanzable sin enseñanza directa.

**Evidencia:** el What Works Clearinghouse de EE.UU. revisó los estudios de Kumon Math y encontró que ninguno cumplía sus estándares de evidencia, así que **el WWC no pudo llegar a una conclusión** en ningún sentido [11] — un "sin veredicto", no un hallazgo negativo, pero significa que décadas de reputación de mercado no están respaldadas por evidencia de nivel WWC. Comentarios secundarios reportan ganancias concentradas en los primeros 12–18 meses (sobre todo en estudiantes que empiezan por debajo de su nivel de grado) con estancamiento después, y la crítica recurrente de que el método premia el cálculo mecánico sobre el razonamiento conceptual.

**Negocio:** centros franquiciados presenciales, colegiatura mensual por materia (varía según el mercado).

### IXL

**Core loop:** responder preguntas de práctica adaptativa en una habilidad elegida; **SmartScore**, un medidor de dominio de 0–100 por habilidad, se actualiza tras cada respuesta.

**Calificación:** SmartScore pesa dificultad, rachas de respuestas recientes y consistencia, no solo el porcentaje de aciertos [12][13]. Pasado el SmartScore 90 ("Challenge Zone"), los aciertos suman solo 1–2 puntos mientras un error puede restar 3–8 — deliberadamente asimétrico para que el tramo final exija consistencia real, no una racha de suerte [13].

**Progresión:** adaptividad de dos niveles — la dificultad de los ítems se adapta dentro de una habilidad, y un Real-Time Diagnostic recomienda en qué habilidad trabajar después.

**Evidencia:** IXL publica su propio documento metodológico de SmartScore [12]; no se encontró ningún estudio de resultados independiente de terceros.

**Negocio:** ~$79–159/año por niño según el paquete de materias, descuentos por varios hijos; licencias escolares desde ~$369/año [14].

### Prodigy Math

**Core loop:** una batalla RPG por turnos montada sobre la práctica de matemáticas — responder una pregunta gana Magic Points que se gastan lanzando hechizos contra monstruos/otros personajes; el mago sube de nivel, consigue equipo, desbloquea zonas [18].

**Calificación:** la corrección solo abre paso en la batalla; no hay explicación de conceptos integrada en el loop.

**Modelo de negocio y controversia:** el contenido de Math/English es nominalmente gratis; el contenido de Science y las mejoras cosméticas/de juego (mascotas, equipo, visuales de "nubes vs. tierra") requieren niveles de pago (Core ~$9.95/mes, Plus ~$14.95/mes, Ultra ~$19.95/mes) [19]. En febrero de 2021, grupos de defensa de la infancia presentaron una queja formal ante la FTC de EE.UU. alegando que Prodigy "aggressively" y "unfairly" markets premium upgrades to children, calificando de engañoso el enmarcado de gratis-para-las-escuelas y describiendo una experiencia visible de dos niveles entre alumnos que pagan y que no pagan [15][16][17]. Los críticos también argumentan que el juego "does not instruct... it only offers practice," citando una investigación que coloca a Prodigy en último lugar entre cuatro apps comparadas en ganancias de aprendizaje por hora invertida [17]. La respuesta de Prodigy: más del 95% de los usuarios registrados nunca han pagado, y el freemium financia el acceso gratuito del resto [16].

**Conclusión:** Prodigy es el cuento de advertencia más claro aquí — no las mecánicas de juego en sí, sino usar presión de estatus dentro del juego visible para los compañeros que no pagan, en un producto vendido a las escuelas como gratuito, es exactamente la forma que los reguladores ya han impugnado formalmente.

### DreamBox Learning

**Core loop:** lecciones adaptativas K–8 con forma de juego que ramifican según *cómo* resuelve el estudiante cada problema — estrategia y pasos intermedios, no solo la respuesta final — para elegir la siguiente tarea.

**Evidencia:** uno de los dos productos con mejor evidencia de los revisados. Un estudio de Harvard CEPR con ~3,000 estudiantes en dos distritos encontró que los estudiantes con 14 horas de uso mejoraron ~4% en las evaluaciones NWEA MAP/PARCC/estatales [20]. Un estudio de LearnPlatform en el distrito escolar William Penn (1,800 estudiantes K-6, mayoría negros y elegibles para FRL) encontró que los estudiantes que completaban menos de una hora/semana de DreamBox tenían puntajes de fin de año significativamente más altos en Savvas Math que sus pares de menor uso [22]. Existe un evidence snapshot del WWC aparte [21]. Un RCT citado en un distrito del sureste encontró una ganancia de 0.12 SD en una prueba de habilidades de los primeros años de primaria pero ninguna ventaja significativa en la prueba estatal de fin de grado — evidencia real pero desigual entre medidas de resultado. DreamBox está calificado "STRONG" por Evidence for ESSA [20].

**Negocio:** licenciamiento K-8 a distritos/escuelas, venta B2B a escuelas.

### ST Math (MIND Research Institute)

**Core loop:** el estudiante guía a JiJi el pingüino a través de rompecabezas espacial-visuales **sin ninguna instrucción escrita ni hablada** — todo el loop de problema/retroalimentación es visual, construido sobre razonamiento espacio-temporal en lugar de lenguaje [24][25].

**Calificación:** implícita — JiJi tiene éxito o fracasa según si la manipulación del rompecabezas por el estudiante es matemáticamente correcta; el fracaso es visible de inmediato y reintentable, sin necesidad de veredicto verbal.

**Evidencia:** una evaluación de WestEd de 2014 encontró que los grados con ST Math tenían 6.3 puntos porcentuales más de estudiantes competentes en el California Standards Test que escuelas de comparación emparejadas; ese diseño fue calificado por la revisión del WWC como **"Meets Evidence Standards with Reservations,"** y MIND afirma que el programa cumple ESSA Tier 2 [23][24]. Otros análisis de la misma ronda de búsqueda encontraron un efecto no significativo a lo largo de dos años en un contexto distinto — la evidencia es real pero mixta entre estudios.

**Relevancia directa:** ST Math es la prueba más sólida de que un **diseño sin palabras puede ser validado independientemente**, directamente útil para un producto de 5 idiomas (EN/ES/FR/PT/DE) — una pista espacial/visual bien diseñada no necesita traducción y se lanza en los cinco idiomas con costo incremental de localización cero, especialmente para edades pre-alfabetizadas de 4–7.

**Negocio:** MIND Research Institute es en sí una organización sin fines de lucro; ST Math se licencia B2B a distritos/escuelas.

### Matific

**Core loop:** contenido alineado al currículo en cuatro formatos — hojas de trabajo, "episodios" (apps cortas con forma de juego), problemas verbales y talleres para docentes — en una espiral modular y progresiva (los temas resurgen con dificultad creciente en lugar de una escalera estrictamente lineal).

**Evidencia:** el propio marketing de Matific cita una mejora promedio del 34% en puntajes de pruebas con 30 min/semana [29]; es una cifra reportada por el proveedor, no verificada independientemente en las fuentes consultadas, y debe tratarse como una afirmación por comprobar, no como un resultado citable.

**Negocio:** ~$9.99/mes o $79.99/año; nivel "Galaxy" $19.99 un solo grado o $39.99 K-6 completo/año; pruebas gratuitas.

### Mathletics (3P Learning)

**Core loop:** módulos de práctica basados en el currículo más un modo global en vivo "Live Mathletics" donde los estudiantes compiten cara a cara en tiempo real, junto con gamificación de certificados/puntos.

**Evidencia:** no se encontró ningún estudio independiente específico del producto. Los meta-análisis generales sobre gamificación en la educación matemática (41 estudios, ~5,071 participantes) muestran un tamaño de efecto promedio positivo grande pero con heterogeneidad significativa — algunas implementaciones no muestran efecto o muestran efecto negativo, así que la gamificación no es automáticamente eficaz; la calidad de la ejecución decide el resultado [32].

**Negocio:** ~$99/año hogar (un solo niño); precios para escuelas/distritos mediante cotización personalizada.

### Photomath

**Core loop:** fundamentalmente una **herramienta de resolver**, no práctica graduada — se fotografía un problema, el OCR (~98% de precisión declarada) lo convierte en una expresión simbólica, y un motor de álgebra computacional devuelve múltiples soluciones paso a paso con recorridos animados.

**Calificación/progresión:** ninguna en el sentido de dominio — no hay árbol de habilidades ni puerta de dominio; el valor es ayuda con la tarea bajo demanda, la apuesta de diseño opuesta a la progresión con puertas de Kumon/IXL/Khan Academy.

**Cambio de modelo de negocio:** adquirido por Google/Alphabet en 2023; para 2026 su papel pasó de app de suscripción independiente a alimentar datos de señales de aprendizaje a Google Workspace for Education/Gemini y al "Homework Helper" de Search — monetizando como valor de ecosistema en lugar de suscripción pura [26][27].

**Relevancia:** Photomath es el antipatrón que hay que evitar copiar — un resolvedor puro de respuestas socava "problemas reales, no aritmética desnuda" si un niño puede fotografiar cualquier problema de Math Challenge y obtener una respuesta instantánea. Esto aboga por formatos de problema interactivos/manipulables que resistan la resolución ingenua por foto.

### Duolingo Math

**Historia:** lanzado como una **app separada e independiente** en octubre de 2022; en Duocon 2023 Duolingo anunció que fusionaría Math en la app principal; la app independiente salió de la App Store el 30 de noviembre de 2023, integrada a la app principal a lo largo de inicios de 2024 [28]. Math (y Music) habían alcanzado aproximadamente 3 millones de usuarios combinados un año después del lanzamiento — menos que materias hermanas como Chess — contexto para, aunque no declarado como causa única de, integrarla en vez de mantenerla independiente. En septiembre de 2025 Math fue rediseñado para agrupar Units en Grades y Topics, reflejando un currículo escolar [28].

**Implicación de diseño:** una advertencia sobre la apuesta del "spin-off independiente exitoso" — una marca matriz fuerte (Duolingo) que lanza una materia adyacente como app propia vio menor adopción que las materias hermanas, y la solución fue la integración, no iterar sobre el spin-off. Para Math Challenge, que *es* el producto independiente, el riesgo transferible es dividirse en apps separadas por banda de grado o idioma en lugar de una sola PWA con modos temáticos.

## Tabla comparativa

| Producto | Core loop | Mecanismo de calificación | Modelo de progresión | Evidencia independiente | Precio / modelo |
|---|---|---|---|---|---|
| Khan Academy | Ver/leer → conjunto de práctica → ejercicio de dominio | Energy Points (esfuerzo, sin tope) separados de Mastery Points (por habilidad, algorítmicos) [1] | Árbol de habilidades con prerequisitos + repaso espaciado | Plataforma: ~20% de ganancia extra en MAP Growth con ≥30 min/sem (reportado por KA) [2]; estudio tipo RCT de Khanmigo: sin ganancia significativa vs. buscador [3] | Gratis; sin fines de lucro, ~$128M+/año de filantropía |
| Brilliant.org | Introducción breve de concepto → cadena de problemas interactivos | Retroalimentación inmediata por problema + explicación; las respuestas incorrectas no se penalizan [7] | Más de 40 cursos, primaria→posgrado, amigable para saltar entre temas | No se encontró estudio de eficacia independiente | ~$150/año (~$10/mes), gratis para docentes K-12 [6] |
| Kumon | Ejemplo resuelto → problemas de práctica casi idénticos, cronometrados | Corrección **y** Standard Completion Time (la velocidad es aprobado/reprobado) [10] | Pasos lineales extremadamente finos | WWC: ningún estudio cumplió los estándares de evidencia, sin conclusión posible [11] | Franquicia presencial, colegiatura mensual por materia |
| IXL | Pregunta adaptativa → actualización de SmartScore | SmartScore 0–100, asimétrico cerca del dominio (un error cuesta más de lo que suma un acierto) [13] | Adaptividad de dos niveles: dificultad de ítem + recomendación de habilidad vía diagnóstico | Solo documento metodológico del proveedor; no se encontró estudio de resultados de terceros [12] | ~$79–159/año por niño; licencia escolar desde $369/año [14] |
| Prodigy Math | Responder pregunta → Magic Points → batalla RPG | La corrección solo abre paso en la batalla; sin instrucción adaptativa | Subida de nivel de personaje/equipo, desbloqueo de zonas | Citado como último de 4 apps en ganancias de aprendizaje por hora [17]; queja formal ante la FTC por monetización [15][16] | Math/English gratis; Science + cosméticos vía niveles de $9.95–19.95/mes [19] |
| DreamBox | Lección adaptativa que sigue la estrategia, no solo la respuesta final | Ramificación consciente de la estrategia en cada paso | Ramificación adaptativa continua, K–8 | Harvard CEPR (~3,000 estudiantes, +4%) [20]; LearnPlatform William Penn (+ puntajes con <1h/sem) [22]; existe evidence snapshot del WWC [21]; "STRONG" según Evidence for ESSA | Licenciamiento a distritos/escuelas (B2B) |
| ST Math | Rompecabezas espacial sin palabras (JiJi) | Implícita — rompecabezas resuelto o no, totalmente visual | Secuencia espacio-temporal, preK–8 | WestEd 2014: +6.3pp de competencia; WWC "Meets Evidence Standards with Reservations"; ESSA Tier 2; otros análisis encontraron efectos no significativos [23][24] | Sin fines de lucro (MIND Research Institute), licenciamiento a distritos |
| Matific | Hojas de trabajo / episodios / problemas verbales / talleres | Corrección por actividad; revisita en espiral de los temas | Modular, alineado al currículo, en espiral | Afirmación de mejora del 34% reportada por el proveedor (no verificada independientemente en esta pasada) | ~$9.99/mes o $79.99/año; Galaxy $19.99–39.99/año |
| Mathletics | Módulos de currículo + competencia global en vivo | Corrección por pregunta + certificados/puntos | Módulos alineados al currículo, modo competitivo | No se encontró estudio específico del producto; los meta-análisis generales de gamificación muestran efecto grande pero heterogéneo | ~$99/año hogar; cotizaciones escolares personalizadas |
| Photomath | Fotografiar problema → OCR → resolución paso a paso | Ninguna (resolvedor, no práctica) | Ninguna (sin árbol de habilidades) | N/A — no es un producto de resultados de aprendizaje | Freemium → Photomath Plus; tras Google, integrado al ecosistema (Search/Workspace) [26] |
| Duolingo Math | Lección diaria basada en racha, gamificada | Corrección + racha/XP (mecánicas centrales de Duolingo) | Grades → Topics → Units (rediseñado 2025) | No investigado en esta pasada (no se encontró estudio de eficacia); los datos de adopción sugieren que la app independiente rindió menos que Chess | Gratis, integrado a la app principal de Duolingo desde 2023–24 [28] |

## Implicaciones de diseño para Math Challenge

1. **Separar la señal de esfuerzo de la señal de dominio**, como Khan Academy separa Energy Points de Mastery Points [1]. Las tablas de clasificación deben premiar el dominio demostrado por habilidad, no el volumen de repetición fácil.
2. **Copiar la forma de presentación de problemas de Brilliant**: introducción breve de concepto, luego un solo problema interactivo con scaffolding, luego retroalimentación inmediata no punitiva con una explicación resuelta [5][7] — esto mapea directamente a "problemas reales, no aritmética desnuda".
3. **Adoptar un umbral de dominio asimétrico cerca del tope**, como la Challenge Zone de IXL (los errores cuestan más de lo que suman los aciertos pasado 90) [13], de modo que una racha de suerte no pueda falsear el dominio.
4. **Reservar una dimensión de tiempo solo para habilidades de fluidez procedimental** (datos aritméticos, manipulación algebraica), inspirada en el Standard Completion Time de Kumon [10] — no extender la presión de tiempo a tareas de razonamiento, donde el WWC no encontró evidencia sólida de que el modelo con puerta de velocidad construya comprensión conceptual [11].
5. **No construir una economía de estatus estilo Prodigy.** Evitar mecánicas donde los usuarios que pagan obtienen cosméticos visiblemente superiores que los compañeros que no pagan ven — la forma exacta de una queja formal ante la FTC [15][16][17]. Si Math Challenge monetiza, mantener los niveles premium orientados a los padres (reportes, perfiles extra, profundidad del tutor), no como símbolos de estatus orientados a los niños.
6. **Construir al menos una pista de problemas sin palabras/con texto mínimo para edades 4–7**, siguiendo el modelo JiJi de ST Math [24][25] — no necesita traducción y se lanza en los cinco idiomas con costo incremental de localización cero.
7. **Diseñar la infraestructura de evidencia desde el día uno**, idealmente con forma de WWC. La mayoría de los productos revisados con fuerte reputación de mercado (Brilliant, Matific, Mathletics) carecen de evidencia de eficacia independiente; los que pueden hacer afirmaciones de nivel escolar/distrital (DreamBox, ST Math) se construyeron para medir desde temprano, no después del hecho.
8. **Tratar el resultado nulo de Khanmigo como advertencia contra las sobre-afirmaciones del tutor de IA.** Un estudio controlado no encontró ventaja significativa frente a un buscador simple pese a la preferencia subjetiva por la IA [3]; validar el tutor de Math Challenge en resultados, no en satisfacción, antes de venderlo como pedagógicamente superior.
9. **Diseñar formatos de problema que resistan la resolución trivial por foto.** Un resolvedor de tarea por foto (el stack OCR+Gemini de Google) derrota cualquier problema simbólico/de texto estático en segundos [26]; favorecer la interfaz interactiva/manipulable (arrastrar, ordenar, construir, revelado de varios pasos) para problemas pensados para razonarse, no para buscarse.
10. **Evitar lanzar una materia adyacente como app separada e independiente.** La menor adopción de Duolingo Math frente a las materias hermanas, reintegrada a la app principal en cuestión de un año [28], aboga por una sola PWA con modos temáticos de grado/idioma en lugar de dividirse en apps separadas.
11. **Usar un currículo en espiral, no una escalera estrictamente lineal**, siguiendo el diseño modular/en espiral de Matific — los temas resurgen con dificultad creciente. Esto conviene a los perfiles multigrado administrados por padres, donde un niño que se mueve entre bandas de grado necesita los temas previos alcanzables y re-evaluables, no archivados.
12. **Mantener el "por qué" visible en cada interacción de calificación**, como hacen Brilliant [7] y Khan Academy por defecto, y como ST Math lo muestra mediante la consecuencia directa de un movimiento equivocado en lugar de un veredicto en texto [24]. El estado de fallo debe enseñar, no solo marcar en rojo.
13. **Considerar con cuidado un modo en vivo/competitivo.** La competencia en tiempo real de Mathletics es un diferenciador, pero los meta-análisis de gamificación muestran efectos grandes aunque altamente heterogéneos [32] — la calidad de la ejecución, no la presencia de competencia, decide si ayuda o añade ansiedad a los alumnos menos seguros.
14. **El hueco de mercado:** ningún producto revisado combina (a) factura de problemas reales de nivel Brilliant, (b) puertas de dominio incremental verificables de nivel Kumon/IXL, (c) diseño independiente del idioma de nivel ST Math, y (d) un modelo de negocio que no presione a los niños a través del estatus dentro del juego. Los productos tienen factura-sin-evidencia (Brilliant), evidencia-sin-diseño-multilingüe (DreamBox, ST Math), o engagement-sin-integridad (Prodigy) — un producto que afirme creíblemente las cuatro cosas a la vez tiene espacio real de posicionamiento.

## Preguntas abiertas para el dueño del proyecto

1. ¿Debería Math Challenge comprometerse, desde el día uno, a una instrumentación que soporte un futuro estudio de eficacia estilo WWC o de comparación emparejada (aunque el estudio mismo se contrate después)?
2. ¿La pista de problemas sin palabras/espaciales (inspirada en ST Math) debería delimitarse solo a edades 4–7, o extenderse más allá como un modo general de "razonamiento visual" a lo largo de los grados?
3. Dado el precedente de la FTC con Prodigy, ¿debería Math Challenge adoptar una política interna explícita que prohíba por completo la monetización cosmética orientada a los niños, documentada en `docs/wiki/decisions.md` como un ADR, de modo que ninguna propuesta de funcionalidad futura pueda reintroducirla sin una decisión consciente de anularla?
4. ¿Está un modo competitivo en vivo/tiempo real (estilo Mathletics) dentro del alcance de un hito posterior, y de ser así, quiere el dueño puertas por nivel de confianza (p. ej., solo oponentes de nivel de habilidad emparejado) para mitigar el riesgo de ansiedad que la literatura de gamificación señala para alumnos de baja confianza?
5. ¿Debería la funcionalidad de tutor de IA evitar explícitamente afirmaciones de "ganancias de aprendizaje probadas" en los textos de marketing hasta que Math Challenge haya corrido su propio estudio de resultados, dado el resultado nulo de Khanmigo en al menos una comparación controlada?

## Fuentes

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
