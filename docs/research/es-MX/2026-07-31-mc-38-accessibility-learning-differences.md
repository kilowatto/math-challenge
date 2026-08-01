# Accesibilidad y diferencias de aprendizaje en un juego de matemáticas global, para todas las edades
> Investigación Math Challenge — 2026-07-31 — tema 38

## Resumen ejecutivo (ES)

- WCAG 2.2 añade requisitos que un juego táctil, cronometrado y multiedad toca de lleno: **2.5.8 Target Size (Mínimo, AA)** exige objetivos de ≥24×24 px CSS [1]; **2.5.7 Dragging Movements (AA)** exige alternativa sin arrastre [10]; **2.5.1 Pointer Gestures (A)** exige alternativa de un solo puntero para gestos multipunto [8].
- El conflicto central — puntuación por velocidad vs. **2.2.1 Timing Adjustable (A)** — se resuelve así: la "Essential Exception" cubre solo un límite de tiempo donde "extenderlo invalidaría la actividad" [2]. Eso justifica un modo "Speed Challenge" opt-in, no el modo por defecto, porque sí existe alternativa razonable (modo sin reloj).
- MathML Core es Candidate Recommendation Snapshot desde el 24 de junio de 2025 [3]; su propio texto dice que `alttext` "no define ningún comportamiento observable" — la semántica accesible de las fórmulas depende de MathJax + Speech Rule Engine, no del núcleo del estándar [3][11].
- Discalculia: 3–6% de la población [4], sin criterio diagnóstico consensuado; mejores intervenciones: manipulables concretos, recta numérica computarizada (*The Number Race*, *Graphogame-math*) y software adaptativo (*Calcularis*, *Meister Cody*) [4].
- Evidencia sobre fuentes especiales para dislexia (OpenDyslexic, Dyslexie) es débil a negativa: Rello & Baeza-Yates (2013) no hallaron mejora en tiempo de lectura; un estudio de 2016 mostró preferencia por Arial sobre fuentes "de dislexia"; uno de 2023 halló preferencia estética pero ninguna diferencia en resultados [5].
- La Ley Europea de Accesibilidad exige cumplimiento desde el **28 de junio de 2025**, incluyendo explícitamente comercio electrónico [7]; EN 301 549 (que incorpora WCAG 2.1 completo) es su referencia técnica [9]. La regla ADA Título II de EE. UU. exige WCAG 2.1 AA a gobiernos estatales/locales —incluidas escuelas públicas— para 2027/2028 [6].

## Executive summary (EN)

Math Challenge combines speed-scored gameplay, symbolic math rendering, ages 4–adult, five languages, and phone/tablet/desktop input — a harder accessibility surface than most single-audience apps. WCAG 2.2 adds criteria that bite directly: **2.5.8 Target Size (Minimum, AA)** requires ≥24×24 CSS px pointer targets, with four narrow exceptions [1]; **2.5.7 Dragging Movements (AA)** requires a non-dragging alternative for any drag mechanic [10]. The load-bearing conflict is **2.2.1 Timing Adjustable (A)** versus speed scoring; its **Essential Exception** — "the time limit is essential and extending it would invalidate the activity" [2] — is narrow and does not cover a gamified drill by default; the fix is architectural (a separate untimed mode plus an opt-in timed mode), detailed below.

MathML Core is a W3C Candidate Recommendation Snapshot (24 June 2025) whose own text says the `alttext` attribute has no defined observable behavior [3] — MathML Core standardizes rendering, not accessible semantics, which instead comes from MathJax's accessibility extensions built on the Speech Rule Engine [11], plus screen readers with math support (JAWS 16+, VoiceOver) [12]. Dyscalculia affects 3–6% of people [4], has no consensus diagnostic criterion, and its best-evidenced interventions — concrete manipulatives, computerized number-line training, adaptive drills — are close to what Math Challenge already builds [4]. Evidence for dyslexia-specific fonts is weak-to-negative; the British Dyslexia Association recommends ordinary sans-serif fonts instead [5]. Legally, the EU European Accessibility Act has applied since 28 June 2025 to consumer products/services including e-commerce [7], EN 301 549 (embedding WCAG 2.1 in full) is its technical backbone [9], and the 2024 US ADA Title II rule requires WCAG 2.1 AA for state/local government sites and apps — including public schools — by 2027/2028 [6], which will surface in school-district procurement even though it does not bind Math Challenge directly.

## Hallazgos

### 1. WCAG 2.2: los criterios nuevos que más pegan aquí

WCAG 2.2 (octubre 2023) añadió nueve criterios de éxito sobre 2.1. Los más relevantes para un juego de matemáticas táctil, con capacidad de arrastre y cronometrado:

- **2.5.8 Target Size (Minimum) — AA.** "The target for pointer input is at least 24 by 24 CSS pixels in size, except where: Equivalent... Inline... User Agent Control... Essential." [1] Un piso, no un techo — la UI para menores de 8 años debería apuntar bien por encima de eso.
- **2.5.7 Dragging Movements — AA (nuevo).** "Functionality that can be operated by dragging movements can also be operated by single pointer activations without dragging, unless dragging is essential." [10] Cualquier mecánica de "arrastrar a la recta numérica" necesita un equivalente de tocar-para-colocar.
- **2.5.1 Pointer Gestures — A.** "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless... essential." [8]
- **2.5.4 Motion Actuation — A.** La entrada por movimiento del dispositivo también debe poder operarse mediante componentes de UI, con la respuesta al movimiento deshabilitable [8] — relevante si alguna vez se considera "inclinar para responder".
- **1.4.10 Reflow — AA.** "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: vertical scrolling content at a width equivalent to 320 CSS pixels... Except for parts of the content which require two-dimensional layout for usage or meaning." [13] Un lienzo de geometría plausiblemente puede alegar la excepción; el resto de la interfaz (botones, puntaje, instrucciones) no puede.
- **1.4.1 Use of Color — A.** "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." [14] Directamente implicado por retroalimentación correcto/incorrecto codificada por color o niveles de dificultad.
- Otras adiciones de 2.2 (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) importan más para la capa de cuenta/portal; **3.3.8 Accessible Authentication** vale la pena señalarla si alguna vez una compuerta de perfil usa un rompecabezas o prueba tipo CAPTCHA como único método.

### 2. El conflicto de tiempo, planteado con precisión

Una ronda con puntuación por velocidad establece "a time limit... by the content" — la condición que dispara **2.2.1 Timing Adjustable (A)**, que se satisface solo si el usuario puede desactivar el límite, ajustarlo ≥10x el valor por defecto, extenderlo con aviso, o si cae bajo la **Real-time Exception** ("a required part of a real-time event... and no alternative to the time limit is possible") o la **Essential Exception** ("essential and extending it would invalidate the activity") [2]. También existen una excepción de 20 horas y una nota que vincula este SC con 3.2.1 (Predictable) [2]. Resolución completa abajo.

### 3. Matemáticas accesibles: MathML Core, MathJax, lectores de pantalla

MathML Core es un **Candidate Recommendation Snapshot (24 de junio de 2025)**, "not expected to advance to Proposed Recommendation any earlier than 30 September 2025" [3] — un subconjunto de MathML 3 deliberadamente reducido y probable en el navegador. Su propio texto: el atributo `alttext` "does not define any observable behavior that is specific to the alttext attribute" [3] — la especificación estandariza el renderizado, no la semántica accesible. Firefox y Safari han soportado MathML desde hace tiempo; Chromium añadió una implementación "at the beginning of 2023" [15]. Lectores de pantalla: **JAWS desde la versión 16 soporta la vocalización de MathML y salida en Braille**; **VoiceOver lee MathML en Safari** [12]; el soporte matemático de NVDA existe vía complementos pero no se confirmó desde una fuente primaria en esta sesión y debe verificarse antes del lanzamiento.

**MathJax** "provides a powerful set of accessibility extensions that provide navigation, exploration, and voicing on the client," incluyendo Expression Zoom y, para offline/ePub, "alternative textual descriptions or more fine-grained speech annotations and Braille" [11]. Debajo, el **Speech Rule Engine (SRE)** convierte la estructura MathML/LaTeX en descripciones en lenguaje natural ("un medio más un tercio", no nombres de símbolos crudos). **KaTeX** es más rápido pero tiene herramientas de accesibilidad integradas más débiles y típicamente necesita un respaldo en MathML más allá de las matemáticas decorativas. Renderizar fórmulas como imágenes o glifos de canvas — un atajo común de UI amigable para niños — no produce nada para un lector de pantalla; MathML más una capa de accesibilidad es el único camino que mantiene la notación disponible para usuarios ciegos/con baja visión a cualquier edad.

### 4. Discalculia: prevalencia, identificación, intervenciones

La discalculia es "a learning disorder, resulting in difficulty learning or comprehending arithmetic," que "does not reflect a general deficit in cognitive abilities or difficulties with time, measurement, and spatial reasoning" [4]. Prevalencia: **3–6%**, comparable entre géneros [4]. **No existe un criterio diagnóstico consensuado**; la identificación combina pruebas de rendimiento, evaluación de memoria de trabajo/función ejecutiva, evaluación docente y (en investigación) patrones de fMRI [4]. Las intervenciones mejor respaldadas por evidencia se agrupan en tres familias: **manipulables concretos** (el paradigma de tutoría de Fuchs — juegos, tarjetas didácticas, manipulables) [4]; **entrenamiento computarizado de recta numérica** (*The Number Race*, *Graphogame-math*) [4]; y **software adaptativo** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Esto coincide de cerca mecánicamente con la propia categoría de Math Challenge — un juego de recta numérica y práctica aritmética —, lo que argumenta a favor de un modo explícito informado por discalculia en vez de un añadido superficial.

### 5. Tipografía y dislexia: las fuentes son la parte débil de la historia

Sin controversia y barato: letra más grande, interlineado generoso, líneas más cortas, alineación a la izquierda, sin cursivas/mayúsculas sostenidas en el cuerpo del texto, contraste sólido pero no extremo. Lo que **no** se sostiene es la afirmación de que la dislexia necesita una fuente especial. OpenDyslexic (Abbie Gonzalez, 2011) es el ejemplo más conocido [5]. Evidencia: **Rello & Baeza-Yates (2013)** encontraron que "did not significantly improve reading time nor shorten eye fixation" [5]; una **tesis de 2010** encontró que Dyslexie "did not lead to faster reading" frente a Arial [5]; un **estudio de 2016** encontró que los lectores disléxicos **prefirieron Arial** sobre las tipografías específicas para dislexia [5]; un **estudio de 2023** encontró preferencia estética por OpenDyslexic (58%) pero "no difference in the test scores based on which font was used" [5]. La British Dyslexia Association recomienda en cambio fuentes sans-serif ordinarias [5]. **Conclusión:** no construir ni licenciar una "fuente para dislexia"; invertir ese esfuerzo en espaciado, longitud de línea e iconografía consistente en su lugar.

### 6. TDAH y atención en una aplicación de aprendizaje gamificada

El trabajo de Accesibilidad Cognitiva (COGA) del W3C se mapea a tres encabezados de pauta WCAG: **2.2 Enough Time**, **2.4 Navigable**, **3.2 Predictable** [16], con patrones más profundos en la nota "Making Content Usable". En términos de producto: estructura de sesión predecible, mínimos estímulos visuales/auditivos que compitan durante la resolución activa del problema, pantallas de un solo foco, y límites de tiempo ajustables o evitables por defecto. Las mecánicas de recompensa variable y comparación social — ganchos comunes de enganche para TDAH en la gamificación comercial — cargan un costo documentado de estrés/atención junto con el beneficio de enganche (ver tema 10 de esta serie) y deben tratarse como una compensación, no como una ganancia gratuita.

### 7. Autismo y diseño sensorial: movimiento, sonido, predictibilidad

`prefers-reduced-motion` tiene **estatus Baseline ampliamente disponible desde enero de 2020** [17] y permite que una aplicación respete una preferencia a nivel de sistema operativo. Su justificación documentada son los **trastornos vestibulares de movimiento** — animaciones de escalado/paneo que causan mareo o desorientación [17]; la extensión a autismo/sensibilidad sensorial es una práctica bien establecida aunque no sea la afirmación específica citada en la fuente primaria usada aquí. El criterio **2.3.3 Animation from Interactions (AAA)** de WCAG exige que "motion animation triggered by interaction can be disabled, unless the animation is essential" [18] — AAA, no obligatorio en AA, pero barato y directamente protector. El sonido merece el mismo tratamiento: un control persistente y descubrible de "reducir movimiento / reducir sonido", con valor por defecto tomado de la señal del sistema operativo.

### 8. Discapacidad visual y el problema de la geometría

La geometría es el subdominio más difícil para usuarios ciegos/con baja visión porque su contenido es inherentemente espacial. El repertorio estándar: **gráficos táctiles** (papel en relieve/swell paper o formas impresas en 3D); **Código Braille Nemeth** (Abraham Nemeth, documentado por primera vez en 1952), un sistema de seis puntos para linealizar la notación matemática con cobertura completa de símbolos para triángulos, círculos, paralelogramos y relaciones como paralelo/perpendicular/ángulo [19]; y **descripción verbal estructurada** — una gramática fija (tipo de figura, luego vértices/lados, luego ángulos, en el mismo orden siempre) que permite a un usuario de lector de pantalla construir un modelo mental sin un dispositivo táctil. Para una aplicación web, el camino a corto plazo es una redacción rigurosa de texto alternativo con gramática fija más datos de figura navegables/describibles por teclado — los píxeles de un canvas son invisibles para un lector de pantalla sin importar la calidad del texto alternativo en otras partes.

### 9. Discapacidad motriz y acceso por switch

**2.5.2 Pointer Cancellation (A)** exige que la activación de un solo puntero no se dispare en el evento inicial de presión a menos que aplique una salvaguarda (abortar/deshacer, reversión en el evento de soltar, o un disparador de presión esencial) [8] — protegiendo a usuarios con temblor de la activación accidental en una interfaz de toque rápido. El acceso completo por switch además necesita alcanzabilidad secuencial por teclado/switch con foco visible (2.4.7/2.4.11), y ninguna interacción que requiera un arrastre, pellizco o doble toque temporizado con precisión sin una alternativa de un solo switch.

### 10. Daltonismo en un juego codificado por color

Las deficiencias rojo-verde (protanopía, deuteranopía) son las más comunes; la tritanopía (azul-amarillo) es más rara; la acromatopsia (total, escala de grises) afecta a una minoría muy pequeña [20]. Regla central, consistente con 1.4.1 [14]: nunca dejar que el color solo señale correcto/incorrecto, dificultad o categoría — emparejar cada indicio de color con forma, ícono o texto, y revisar la paleta en simulación de escala de grises, no solo contra un observador "típico" [20].

### 11. Subtítulos y alternativas de audio

Las indicaciones habladas de números, el video tutorial y el audio de celebración necesitan subtítulos/equivalentes de texto sincronizados y una ruta con sonido apagado (el caso de uso mayoritario en escuelas y entornos públicos) — territorio estándar de WCAG 1.2.x, de riesgo comparativamente bajo frente a los problemas más difíciles de arriba.

### 12. La capa legal

**Ley Europea de Accesibilidad de la UE (Directiva 2019/882).** Cumplimiento obligatorio desde el **28 de junio de 2025**: "all relevant products and services made available on the EU market must now comply with accessibility requirements" [7]. El alcance incluye explícitamente dispositivos de cómputo personal, libros electrónicos y **servicios de comercio electrónico** [7]. Las microempresas (<10 empleados, <€2M de facturación) están exentas [7]; la conformidad es autocertificada, con penalidades que varían fuertemente por estado miembro [7]. **Si Math Challenge vende suscripciones en la UE, plausiblemente está en el alcance como servicio de comercio electrónico** — la pregunta legal de mayor prioridad aquí.

**EN 301 549.** El estándar armonizado de accesibilidad TIC de la UE; la v3.2.1 "includes the text of WCAG 2.1 in full" [9] y es la referencia técnica tanto de la Directiva de Accesibilidad Web como de la EAA, extendiéndose más allá de los sitios web a aplicaciones móviles y servicios de telecomunicaciones; Canadá la adoptó formalmente en 2024 [9].

**ADA Título II de EE. UU. (2024) / Sección 508.** Exige que las entidades gubernamentales estatales/locales — incluidos los distritos escolares públicos — cumplan con **WCAG 2.1 AA** para contenido web/de aplicación, con plazos al **26 de abril de 2027** (población ≥50,000) / **2028** (más pequeñas), con cinco excepciones de contenido acotadas [6]. La Sección 508 vincula por separado las adquisiciones de agencias federales [21]. Math Challenge no está directamente vinculado, pero es probable que los compradores de distritos escolares exijan una declaración de conformidad WCAG 2.1 AA (VPAT); construir hasta WCAG 2.2 AA satisface ambos regímenes con margen.

## Lista de conformidad — criterios WCAG 2.2 AA con más riesgo aquí

| SC | Nivel | Riesgo en Math Challenge | Regla de diseño |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Fichas de respuesta/teclados numéricos dimensionados para escritorio | Todos los objetivos ≥24×24 px CSS; ≥44×44 px para UI de menores de 8 años |
| 2.5.7 Dragging Movements | AA | Arrastrar a la recta numérica, arrastrar para ordenar | Alternativa de tocar-para-seleccionar + tocar-para-colocar para cada arrastre |
| 2.5.1 Pointer Gestures | A | Cualquier pellizco/deslizamiento para responder | Alternativa de un solo puntero; ninguno esencial por diseño |
| 2.5.2 Pointer Cancellation | A | Puntuación de toque rápido disparándose en el toque inicial | Activar en el evento de soltar/liberar, abortar arrastrando fuera |
| 2.2.1 Timing Adjustable | A | Modo por defecto con puntuación por velocidad | Ver "conflicto de tiempo" — el modo sin reloj es el camino de cumplimiento |
| 1.4.10 Reflow | AA | Lienzos de geometría, cuadrículas de coordenadas | Reflujo de toda la interfaz a 320px; solo la figura puede necesitar diseño 2D |
| 1.4.1 Use of Color | A | Codificación de correcto/incorrecto, nivel, categoría | Cada indicio de color también lleva ícono/forma/texto |
| 1.4.3 / 1.4.11 Contrast | AA | Paletas infantiles vivas y lúdicas | 4.5:1 texto, 3:1 UI/gráficos, verificado contra la paleta real |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Componentes de juego personalizados, sin estilo de foco nativo | Indicador de foco visible y no obstruido en todas partes |
| 3.3.8 Accessible Authentication | AA | Compuertas de perfil "resuelve para desbloquear" | Ninguna prueba de función cognitiva como único método de autenticación |

## El conflicto de tiempo — resuelto

**2.2.1 Timing Adjustable (Nivel A)** aplica siempre que "a time limit... is set by the content" [2] — una ronda con puntuación por velocidad califica sin ambigüedad. Las dos excepciones que podrían cubrirla del todo son acotadas:

> "Real-time Exception: The time limit is a required part of a real-time event (for example, an auction), and no alternative to the time limit is possible." [2]

> "Essential Exception: The time limit is essential and extending it would invalidate the activity." [2]

Ninguna debería ser el único argumento de cumplimiento para la experiencia por defecto, porque una alternativa razonable claramente existe (un modo sin reloj que enseñe las mismas matemáticas). La Essential Exception es defendible solo para un modo distinto, claramente etiquetado, de **"Speed Challenge"** donde el tiempo genuinamente *es* la actividad que se mide.

**Resolución:**
1. El **modo de aprendizaje por defecto** es sin reloj o cumple el estándar (Desactivar / Ajustar ≥10x / Extender con aviso) [2].
2. Un modo **Speed Challenge** aparte, opt-in, conserva el cronometraje estricto e invoca honestamente la Essential Exception.
3. La progresión (rachas, desbloqueos) en el modo por defecto está impulsada por precisión/finalización, no por latencia; la velocidad es una estadística de bono que solo aparece en Speed Challenge.
4. Esto también coincide con la literatura de ansiedad matemática (tema 10 de esta serie): el reloj es el amplificador documentado de las caídas de rendimiento ligadas a la ansiedad, así que removerlo del camino por defecto está alineado con la evidencia, no es solo un atajo de cumplimiento.

## Implicaciones de diseño

1. Renderizar toda la notación matemática como MathML o marcado ARIA accesible vía una capa de accesibilidad tipo MathJax — nunca glifos de canvas/imagen solamente [3][11].
2. Modo de juego por defecto sin reloj o con temporizador ajustable; poner en cuarentena el cronometraje estricto a un modo opt-in "Speed Challenge" que invoque honestamente la Essential Exception [2].
3. Todos los objetivos interactivos ≥24×24 px CSS, ≥44×44 px para UI de menores de 8 años [1].
4. Cada interacción de arrastre trae una alternativa de tocar-seleccionar/tocar-colocar; el arrastre es una mejora, nunca el único camino [10].
5. Nunca codificar correcto/incorrecto, dificultad o categoría solo en color; emparejar con ícono/forma/texto y verificar contra simulaciones de protanopía/deuteranopía/tritanopía/acromatopsia [14][20].
6. Enviar un control persistente de "reducir movimiento/sonido" con valor por defecto en `prefers-reduced-motion`, más allá del 2.3.3 que es solo AAA, porque la población atendida es real sin importar el estatus AA [17][18].
7. Construir un **modo distinto de Discalculia / Sentido Numérico**: presentación centrada en la recta numérica, visuales de manipulables concretos, rampa adaptativa modelada en Number Race/Calcularis en vez de una curva Elo genérica; descubrible en configuración, no bloqueado detrás de un diagnóstico (ninguno tiene consenso) [4].
8. No construir/licenciar una "fuente para dislexia"; invertir en interlineado, líneas instructivas más cortas, alineación a la izquierda, sans-serif estándar legible [5].
9. Cada figura geométrica lleva una descripción de texto estructurada de gramática fija (forma, luego vértices/lados, luego ángulos) más datos de figura navegables/describibles por teclado, no solo renderizado en canvas [19].
10. Añadir un "modo de enfoque" de bajo estímulo para TDAH/atención: pantallas de una sola tarea, sin animación/audio competidor a mitad del problema, estructura predecible, efectos celebratorios diferidos — alineado con Enough Time/Navigable/Predictable de COGA [16].
11. Operabilidad completa por switch/teclado: orden de foco secuencial, indicador de foco visible y no obstruido, ninguna interacción que requiera multitáctil o toque temporizado con precisión sin una alternativa de un solo puntero [8].
12. Poner subtítulo/equivalente de texto a cada indicación hablada y clip instructivo; hacer que todo el ciclo de resolución de problemas sea completable silenciado por defecto.
13. Tratar la EAA de la UE como ya vinculante (fecha de cumplimiento pasada el 28 de junio de 2025) si se vende a consumidores de la UE; encargar ya una autoevaluación tipo VPAT contra EN 301 549 [7][9].
14. Apuntar a WCAG 2.2 AA internamente, un superconjunto estricto que ya satisface de antemano el estándar WCAG 2.1 AA que exigirán en adquisiciones los distritos escolares de EE. UU. [6].

## Preguntas abiertas para el dueño del proyecto

1. ¿Math Challenge vende a consumidores físicamente en la UE hoy o dentro de 12 meses? Determina si el cumplimiento de la EAA (ya vencido desde el 28 de junio de 2025) es actual o a futuro [7].
2. ¿La tabla de líderes pública es una característica central permanente, o puede replantearse como el modo opt-in Speed Challenge, manteniendo el reloj opcional por defecto?
3. ¿La adopción por distritos escolares de EE. UU. es un canal real de salida al mercado? De ser así, un VPAT de WCAG 2.1 AA se vuelve un activo de venta, no solo cumplimiento [6].
4. ¿El contenido de geometría debería limitarse solo a formas de texto estructurado/navegables por teclado, o la banda de mayor edad necesita geometría genuinamente interactiva en canvas/SVG (que requiere una inversión mayor en accesibilidad)?
5. ¿Presupuesto/apetito para una capa de renderizado de accesibilidad tipo MathJax (vocalización basada en SRE) versus un renderizador más ligero como KaTeX puro con herramientas integradas más débiles?
6. ¿Enviar el control de reducir-movimiento/sonido en el lanzamiento, o diferirlo a una pasada de accesibilidad posterior al lanzamiento, dado que es barato, solo AAA, y protector para usuarios autistas/vestibulares [17][18]?

## Fuentes

1. W3C, WCAG 2.2, SC 2.5.8 Target Size (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum
2. W3C, WCAG 2.2, SC 2.2.1 Timing Adjustable — https://www.w3.org/TR/WCAG22/#timing-adjustable
3. W3C, MathML Core (Candidate Recommendation Snapshot, 24 June 2025) — https://www.w3.org/TR/mathml-core/
4. Wikipedia, "Dyscalculia" — https://en.wikipedia.org/wiki/Dyscalculia
5. Wikipedia, "OpenDyslexic" — https://en.wikipedia.org/wiki/OpenDyslexic
6. ADA.gov, "2024 Title II Web and Mobile App Accessibility Rule" — https://www.ada.gov/resources/2024-03-08-web-rule/
7. Wikipedia, "European Accessibility Act" — https://en.wikipedia.org/wiki/European_Accessibility_Act
8. W3C, WCAG 2.2, SC 2.5.1 Pointer Gestures / 2.5.2 Pointer Cancellation / 2.5.4 Motion Actuation — https://www.w3.org/TR/WCAG22/#pointer-gestures
9. Wikipedia, "EN 301 549" — https://en.wikipedia.org/wiki/EN_301_549
10. W3C, WCAG 2.2, SC 2.5.7 Dragging Movements — https://www.w3.org/TR/WCAG22/#dragging-movements
11. MathJax Project, accessibility features overview — https://www.mathjax.org/#accessibility
12. Wikipedia, "MathML" (screen reader support) — https://en.wikipedia.org/wiki/MathML
13. W3C, WCAG 2.2, SC 1.4.10 Reflow — https://www.w3.org/TR/WCAG22/#reflow
14. W3C, WCAG 2.2, SC 1.4.1 Use of Color — https://www.w3.org/TR/WCAG22/#use-of-color
15. Wikipedia, "MathML" (Chromium implementation history) — https://en.wikipedia.org/wiki/MathML
16. W3C WAI, Cognitive Accessibility overview — https://www.w3.org/WAI/cognitive/
17. MDN Web Docs, "prefers-reduced-motion" — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
18. W3C, WCAG 2.2, SC 2.3.3 Animation from Interactions — https://www.w3.org/TR/WCAG22/#animation-from-interactions
19. Wikipedia, "Nemeth Braille" — https://en.wikipedia.org/wiki/Nemeth_Braille
20. WebAIM, "Visual Disabilities: Color Blindness" — https://webaim.org/articles/visual/colorblind
21. Section508.gov, "Laws and Policies" — https://www.section508.gov/manage/laws-and-policies/
22. W3C, WCAG 2.2 Quick Reference (new success criteria in 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
