# Accesibilidad y diferencias de aprendizaje en un juego matemático global para todas las edades

> Investigación Math Challenge — 2026-07-31 — tema 38

## Resumen ejecutivo (ES)

- WCAG 2.2 añade requisitos que un juego táctil, cronometrado y multigeneracional afecta de lleno: **2.5.8 Target Size (Mínimo, AA)** exige objetivos de ≥24 × 24 px CSS [1]; **2.5.7 Dragging Movements (AA)** exige alternativa sin arrastre [10]; **2.5.1 Pointer Gestures (A)** exige alternativa de un solo puntero para gestos multipunto [8].
- El conflicto central — puntuación por velocidad vs. **2.2.1 Timing Adjustable (A)** — se resuelve así: la “Essential Exception” cubre solo un límite de tiempo donde “extenderlo invalidaría la actividad” [2]. Eso justifica un modo “Speed Challenge” opt‑in, no el modo por defecto, porque sí existe alternativa razonable (modo sin temporizador).
- MathML Core es una Candidate Recommendation Snapshot desde el 24 de junio de 2025 [3]; su propio texto indica que `alttext` “no define ningún comportamiento observable” — la semántica accesible de las fórmulas depende de MathJax + Speech Rule Engine, no del núcleo del estándar [3][11].
- Discalculia: 3–6 % de la población [4], sin criterio diagnóstico consensuado; mejores intervenciones: materiales manipulativos concretos, recta numérica computarizada (*The Number Race*, *Graphogame‑math*) y software adaptativo (*Calcularis*, *Meister Cody*) [4].
- Evidencia sobre fuentes especiales para dislexia (OpenDyslexic, Dyslexie) es débil o negativa: Rello & Baeza‑Yates (2013) no hallaron mejora en el tiempo de lectura; un estudio de 2016 mostró preferencia por Arial sobre fuentes «de dislexia»; uno de 2023 halló preferencia estética pero ninguna diferencia en los resultados [5].
- La Ley Europea de Accesibilidad exige cumplimiento desde el **28 de junio de 2025**, incluyendo explícitamente el comercio electrónico [7]; EN 301 549 (que incorpora WCAG 2.1 completo) es su referencia técnica [9]. La regla ADA Título II de EE. UU. exige WCAG 2.1 AA a gobiernos estatales y locales —incluidas escuelas públicas— para 2027/2028 [6].

## Executive summary (EN)
Math Challenge combina juego puntuado por velocidad, renderizado simbólico de matemáticas, edades 4‑adulto, cinco idiomas y entrada de teléfono/tableta/escritorio — una superficie de accesibilidad más exigente que la mayoría de aplicaciones de audiencia única. WCAG 2.2 añade criterios que atacan directamente: **2.5.8 Target Size (Minimum, AA)** requiere objetivos de puntero de ≥24 × 24 CSS px, con cuatro excepciones estrechas [1]; **2.5.7 Dragging Movements (AA)** requiere una alternativa sin arrastre para cualquier mecánica de arrastre [10]. El conflicto de carga es **2.2.1 Timing Adjustable (A)** frente a la puntuación por velocidad; su **Essential Exception** — «the time limit is essential and extending it would invalidate the activity» [2] — es estrecha y no cubre por defecto un ejercicio gamificado; la solución es arquitectónica (un modo sin tiempo separado más un modo cronometrado optativo), detallada a continuación.

MathML Core es una Instantánea de Recomendación Candidata de W3C (24 June 2025) cuyo propio texto indica que el atributo `alttext` no tiene un comportamiento observable definido [3] — MathML Core estandariza el renderizado, no la semántica accesible, que proviene en su lugar de las extensiones de accesibilidad de MathJax basadas en el Speech Rule Engine [11], más los lectores de pantalla con soporte matemático (JAWS 16+, VoiceOver) [12]. La discalculia afecta al 3–6 % de la población [4], no tiene un criterio diagnóstico consensuado, y sus intervenciones con mayor evidencia — manipulativos concretos, entrenamiento informatizado en la recta numérica, ejercicios adaptativos — se acercan a lo que Math Challenge ya construye [4]. La evidencia de fuentes específicas para dislexia es débil o negativa; la British Dyslexia Association recomienda fuentes sans‑serif ordinarias en su lugar [5]. Legalmente, el EU European Accessibility Act se aplica desde el 28 June 2025 a productos/servicios de consumo, incluido el comercio electrónico [7]; EN 301 549 (que incorpora WCAG 2.1 en su totalidad) es su columna técnica [9]; y la norma US ADA Title II de 2024 exige WCAG 2.1 AA para sitios y aplicaciones de gobiernos estatales/locales — incluidas las escuelas públicas — para 2027/2028 [6], lo que aparecerá en la contratación de distritos escolares aunque no obligue directamente a Math Challenge.

## Resultados

### 1. WCAG 2.2: los criterios nuevos que impactan más aquí

WCAG 2.2 (octubre de 2023) añadió nueve criterios de éxito sobre la versión 2.1. Los más relevantes para un juego de matemáticas cronometrado, táctil y con capacidad de arrastre:

- **2.5.8 Target Size (Minimum) — AA.** “El objetivo para la entrada de puntero debe ser de al menos 24 × 24 píxeles CSS, salvo que: Equivalente… En línea… Control del agente de usuario… Esencial.” [1] Un límite inferior, no superior: la UI para menores de 8 años debe apuntar muy por encima de él.  
- **2.5.7 Dragging Movements — AA (nuevo).** “La funcionalidad que puede operarse mediante movimientos de arrastre también puede operarse con activaciones de puntero único sin arrastrar, a menos que el arrastre sea esencial.” [10] Cualquier mecánica de “arrastrar a la recta numérica” necesita un equivalente de toque para colocar.  
- **2.5.1 Pointer Gestures — A.** “Toda la funcionalidad que usa gestos multipunto o basados en trayectorias para su operación puede operarse con un puntero único sin gesto de trayectoria, salvo que sea esencial.” [8]  
- **2.5.4 Motion Actuation — A.** La entrada de movimiento del dispositivo también debe poder operarse mediante componentes de la interfaz, con la respuesta de movimiento desactivable [8] — relevante si se contempla “inclinar para responder”.  
- **1.4.10 Reflow — AA.** “El contenido puede presentarse sin pérdida de información o funcionalidad, y sin requerir desplazamiento en dos dimensiones para: contenido con desplazamiento vertical a una anchura equivalente a 320 píxeles CSS… Salvo las partes del contenido que requieran un diseño bidimensional para su uso o significado.” [13] Un lienzo de geometría podría alegar la excepción; los elementos de la interfaz (botones, puntuación, instrucciones) no pueden.  
- **1.4.1 Use of Color — A.** “El color no se utiliza como único medio visual para transmitir información, indicar una acción, incitar una respuesta o distinguir un elemento visual.” [14] Directamente implicado por la retroalimentación codificada por color de aciertos/errores o los niveles de dificultad.  
- Otras incorporaciones de la 2.2 (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) son más relevantes para la capa de cuenta/portal; **3.3.8 Accessible Authentication** merece señalamiento si alguna puerta de perfil utilizara una prueba cognitiva tipo puzzle/CAPTCHA como único método.

### 2. El conflicto de temporización, expresado con precisión

Una ronda puntuado por velocidad establece “un límite de tiempo… por el contenido”, condición disparadora del **2.2.1 Timing Adjustable (A)**, que se cumple solo si el usuario puede desactivar el límite, ajustarlo ≥10 x el valor por defecto, ampliarlo con advertencia, o si entra dentro de la **excepción en tiempo real** (“una parte requerida de un evento en tiempo real… y no es posible una alternativa al límite de tiempo”) o la **excepción esencial** (“esencial y ampliarlo invalidaría la actividad”) [2]. Existe también una **excepción de 20 horas** y una nota que vincula este criterio con el 3.2.1 (Predictable) [2]. Resolución completa más abajo.

### 3. Matemáticas accesibles: MathML Core, MathJax, lectores de pantalla

MathML Core es un **Candidate Recommendation Snapshot (24 de junio de 2025)**, “no se espera que avance a Proposed Recommendation antes del 30 de septiembre de 2025” [3] — un subconjunto deliberadamente reducido y testeable en navegadores de MathML 3. Su propio texto indica que el atributo `alttext` “no define ningún comportamiento observable que sea específico del atributo alttext” [3] — la especificación estandariza la representación, no la semántica accesible. Firefox y Safari llevan tiempo soportando MathML; Chromium añadió una implementación “a principios de 2023” [15]. Lectores de pantalla: **JAWS a partir de la versión 16 soporta la vocalización y salida Braille de MathML**; **VoiceOver lee MathML en Safari** [12]; el soporte de NVDA para matemáticas existe mediante complementos, pero no se confirmó con una fuente primaria aquí y debería verificarse antes del lanzamiento.

**MathJax** “ofrece un potente conjunto de extensiones de accesibilidad que proporcionan navegación, exploración y vocalización en el cliente”, incluyendo Zoom de Expresión y, para offline/ePub, “descripciones textuales alternativas o anotaciones de voz y Braille más finas” [11]. Bajo su capa, el **Speech Rule Engine (SRE)** convierte la estructura MathML/LaTeX en descripciones en lenguaje natural (“un medio más un tercio”, no nombres de símbolos crudos). **KaTeX** es más rápido pero dispone de herramientas de accesibilidad más débiles y suele requerir un fallback a MathML más allá de la visualización decorativa. Renderizar fórmulas como imágenes o glifos en canvas — atajo frecuente de UI amigable para niños — no produce nada para un lector de pantalla; MathML más una capa de accesibilidad es la única vía que mantiene la notación disponible para usuarios ciegos o con baja visión en cualquier edad.

### 4. Discalculia: prevalencia, identificación, intervenciones

La discalculia es “un trastorno del aprendizaje que genera dificultad para aprender o comprender la aritmética”, que “no refleja un déficit general en las capacidades cognitivas ni dificultades con el tiempo, la medición y el razonamiento espacial” [4]. Prevalencia: **3–6 %**, comparable entre géneros [4]. No existe **un criterio diagnóstico consensuado**; la identificación combina pruebas de rendimiento, evaluación de la memoria de trabajo y funciones ejecutivas, evaluación docente y (en investigación) patrones de fMRI [4]. Las intervenciones con mayor evidencia se agrupan en tres familias: **manipulables concretos** (paradigma de tutoría de Fuchs — juegos, tarjetas didácticas, manipulables) [4]; **entrenamiento informático de la recta numérica** (*The Number Race*, *Graphogame‑math*) [4]; y **software adaptativo** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Esto coincide mecánicamente con la propia categoría de Math Challenge — un juego de recta numérica y ejercicios de aritmética — lo que argumenta a favor de un modo explícito informado por la discalculia en lugar de una solución añadida.

### 5. Tipografía para dislexia: la fuente es la parte débil del argumento

No controvertido y barato: tipo más grande, interlineado amplio, líneas más cortas, alineación a la izquierda, sin cursivas ni mayúsculas en el cuerpo del texto, contraste sólido pero no extremo. Lo que **no** se sostiene es la afirmación de que la dislexia necesita una fuente especial. OpenDyslexic (Abbie Gonzalez, 2011) es el ejemplo más conocido [5]. Evidencia: **Rello & Baeza‑Yates (2013)** hallaron que no “mejoró significativamente el tiempo de lectura ni acortó la fijación ocular” [5]; una **tesis de 2010** encontró que Dyslexie “no condujo a una lectura más rápida” frente a Arial [5]; un **estudio de 2016** mostró que los lectores disléxicos **preferían Arial** sobre tipografías específicas para dislexia [5]; un **estudio de 2023** reveló una preferencia estética por OpenDyslexic (58 %) pero “sin diferencia en las puntuaciones de las pruebas según la fuente utilizada” [5]. La British Dyslexia Association recomienda fuentes sans‑serif ordinarias [5]. **Conclusión:** no crear ni licenciar una “fuente para dislexia”; invertir el esfuerzo en espaciado, longitud de línea y una iconografía coherente.

### 6. TDAH y atención en una aplicación de aprendizaje gamificada

El trabajo de Accesibilidad Cognitiva (COGA) de W3C se alinea con tres encabezados de directrices WCAG: **2.2 Enough Time**, **2.4 Navigable**, **3.2 Predictable** [16], con patrones más profundos en la nota “Making Content Usable”. En términos de producto: estructura de sesión predecible, estímulos visuales/áudio competidores mínimos durante la resolución activa de problemas, pantallas de foco único y límites de tiempo ajustables o evitables por defecto. Las mecánicas de recompensa variable y comparación social — ganchos habituales de gamificación para captar la atención del TDAH — conllevan un **coste documentado de estrés/atención** junto al beneficio de compromiso (ver tema 10 de esta serie) y deben considerarse una **compensación**, no una victoria gratuita.

### 7. Autismo y diseño sensorial: movimiento, sonido, predictibilidad

`prefers-reduced-motion` tiene **estatus de disponibilidad general desde enero de 2020** [17] y permite a una aplicación respetar la preferencia a nivel de SO. Su justificación documentada son los **trastornos vestibulares del movimiento** — animaciones de escalado/panning que provocan mareos o desorientación [17]; la extensión a la sensibilidad sensorial del autismo es una práctica bien establecida aunque no la afirmación específica citada en la fuente primaria usada aquí. El criterio **2.3.3 Animation from Interactions (AAA)** de WCAG exige que “la animación de movimiento activada por interacción pueda desactivarse, salvo que la animación sea esencial” [18] — AAA, no obligatorio en AA, pero barato y directamente protector. El sonido merece el mismo tratamiento: un alternador persistente y detectable “reducir movimiento / reducir sonido”, por defecto al señal del SO.

### 8. Impedimento visual y el problema de geometría

La geometría es el sub‑dominio más difícil para usuarios ciegos o con baja visión porque su contenido es inherentemente espacial. El conjunto de herramientas estándar: **gráficos táctiles** (papel en relieve o con relieve o formas impresas en 3D); **Código Braille Nemeth** (Abraham Nemeth, documentado por primera vez en 1952), un sistema de seis puntos para linealizar la notación matemática con cobertura total de símbolos para triángulos, círculos, paralelogramos y relaciones como paralela/perpendicular/ángulo [19]; y **descripción verbal estructurada** — una gramática fija (tipo de forma, luego vértices/lados, luego ángulos, mismo orden siempre) que permite a un usuario de lector de pantalla construir un modelo mental sin necesidad de un dispositivo táctil. Para una aplicación web, el camino a corto plazo es la autoría rigurosa de texto alternativo con gramática fija más datos de forma navegables con teclado y describibles — los píxeles del lienzo son invisibles para un lector de pantalla, independientemente de la calidad del texto alternativo en otro sitio.

### 9. Impedimento motor y acceso mediante interruptor

**2.5.2 Pointer Cancellation (A)** exige que la activación con un solo puntero no se dispare en el evento de pulsación inicial a menos que se aplique una salvaguarda (abortar/deshacer, reversión del evento de liberación, o un disparador esencial del evento de pulsación) [8] — protege a usuarios con temblor de activaciones accidentales en una interfaz de pulsación rápida. El acceso completo mediante interruptor también necesita alcanzabilidad secuencial de teclado/interruptor con foco visible (2.4.7/2.4.11), y ninguna interacción que requiera arrastre, pellizco o doble pulsación cronometrada con precisión sin una alternativa de un solo interruptor.

### 10. Daltonismo en un juego codificado por colores

Las deficiencias rojo‑verde (protanopía, deuteranopía) son las más comunes; la tritanopía (azul‑amarillo) es más rara; la acromatopsia (total, en escala de grises) afecta a una minoría muy pequeña [20]. Norma básica, coherente con 1.4.1 [14]: nunca permitir que el color, por sí solo, indique correcto/incorrecto, dificultad o categoría; combinar cada indicio de color con una forma, un icono o un texto, y comprobar la paleta mediante una simulación en escala de grises, no solo frente a un observador «típico» [20].

### 11. Subtítulos y alternativas de audio

Los avisos hablados de números, los vídeos tutoriales y los audios de celebración necesitan subtítulos/equivalentes de texto sincronizados y una vía sin sonido (el caso de uso mayoritario en colegios y entornos públicos) — territorio estándar de WCAG 1.2.x, de riesgo comparativamente bajo frente a los problemas más complejos descritos anteriormente.

### 12. La capa legal

**EU European Accessibility Act (Directive 2019/882).** Cumplimiento obligatorio a partir del **28 June 2025**: «todos los productos y servicios relevantes puestos a disposición en el mercado de la UE deben ahora cumplir los requisitos de accesibilidad» [7]. El alcance incluye explícitamente dispositivos informáticos personales, libros electrónicos y **servicios de comercio electrónico** [7]. Las microempresas (<10 empleados, <€2M de facturación) están exentas [7]; la conformidad se auto‑certifica, con sanciones que varían marcadamente según el Estado miembro [7]. **Si Math Challenge vende suscripciones en la UE, probablemente esté dentro del alcance como servicio de comercio electrónico** — la cuestión legal de mayor prioridad aquí.

**EN 301 549.** La norma armonizada de accesibilidad TIC de la UE; v3.2.1 «incluye el texto completo de WCAG 2.1» [9] y es la referencia técnica tanto para la Directiva de Accesibilidad Web como para la EAA, extendiéndose más allá de los sitios web a aplicaciones móviles y servicios de telecomunicaciones; Canadá la adoptó formalmente en 2024 [9].

**US ADA Title II (2024) / Section 508.** Exige a entidades gubernamentales estatales y locales — incluidos los distritos escolares públicos — cumplir **WCAG 2.1 AA** para contenido web/aplicación, con plazos **26 April 2027** (población ≥50.000) / **2028** (más pequeña), y cinco excepciones de contenido estrechas [6]. La Sección 508 vincula por separado la contratación de agencias federales [21]. Math Challenge no está directamente obligado, pero los compradores de los distritos escolares probablemente exigirán una declaración de conformidad WCAG 2.1 AA (VPAT); diseñar según WCAG 2.2 AA satisface ambos regímenes con margen.

## Conformance checklist — WCAG 2.2 AA criteria most at risk here

| SC | Level | Riesgo en Math Challenge | Regla de diseño |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Fichas de respuesta/teclados numéricos dimensionados para escritorio | Todos los objetivos ≥24×24 px CSS; ≥44×44 px para UI de menores de 8 años |
| 2.5.7 Dragging Movements | AA | Arrastrar a la línea numérica, arrastrar para ordenar | Alternativa de tocar‑para‑seleccionar + tocar‑para‑colocar para cada arrastre |
| 2.5.1 Pointer Gestures | A | Cualquier pellizco/deslizar‑para‑responder | Alternativa de un solo puntero; ninguna esencial por diseño |
| 2.5.2 Pointer Cancellation | A | Puntuación por pulsación rápida que se dispara al contacto | Activar en el evento de liberación, abortar arrastrando fuera |
| 2.2.1 Timing Adjustable | A | Modo predeterminado cronometrado | Ver «conflicto de temporización» — el modo sin tiempo es la vía de cumplimiento |
| 1.4.10 Reflow | AA | Lienzos de geometría, cuadrículas de coordenadas | Reflujo de toda la interfaz a 320 px; solo la figura puede requerir disposición 2D |
| 1.4.1 Use of Color | A | Codificación de correcto/incorrecto, nivel, categoría | Cada indicio de color también lleva icono/forma/texto |
| 1.4.3 / 1.4.11 Contrast | AA | Paletas brillantes y lúdicas para niños | 4,5:1 texto, 3:1 UI/gráficos, comprobado contra la paleta real |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Componentes de juego personalizados, sin estilo de foco nativo | Indicador de foco visible y sin obstruir en todas partes |
| 3.3.8 Accessible Authentication | AA | Portales de perfil «Resolver para desbloquear» | No usar pruebas de función cognitiva como único método de autenticación |

## The timing conflict — resolved

**2.2.1 Timing Adjustable (Level A)** se aplica siempre que «un límite de tiempo… sea establecido por el contenido» [2] — una ronda cronometrada califica inequívocamente. Las dos excepciones que podrían cubrirlo directamente son estrechas:

> **Excepción en tiempo real:** El límite de tiempo es una parte obligatoria de un evento en tiempo real (por ejemplo, una subasta), y no es posible una alternativa al límite de tiempo. [2]

> **Excepción esencial:** El límite de tiempo es esencial y ampliarlo invalidaría la actividad. [2]

Ninguna debería ser el único argumento de cumplimiento para la experiencia predeterminada, porque existe claramente una alternativa razonable (un modo sin temporizador que enseña la misma matemática). La excepción esencial sólo es defendible para un modo **«Speed Challenge»** distinto y claramente etiquetado, donde la temporización es realmente *la* actividad medida.

**Resolución:**
1. El **modo de aprendizaje predeterminado** no tiene temporizador o cumple con el estándar (Desactivar / Ajustar ≥10 x / Ampliar con advertencia) [2].
2. Un modo **Speed Challenge** separado y opcional mantiene la temporización estricta e invoca honestamente la excepción esencial.
3. La progresión (rachas, desbloqueos) en el modo predeterminado se basa en la precisión/completado, no en la latencia; la velocidad es una estadística extra que solo aparece en Speed Challenge.
4. Esto también coincide con la literatura sobre la ansiedad matemática (tema 10 de esta serie): el reloj es el amplificador documentado de la caída de rendimiento vinculada a la ansiedad, por lo que eliminarlo del camino predeterminado está alineado con la evidencia, no es sólo una solución de cumplimiento.

## Implicaciones de diseño

1. Representar toda la notación matemática como MathML o marcado accesible ARIA mediante una capa de accesibilidad tipo MathJax — nunca glifos sólo de canvas/imagen [3][11].  
2. Modo de juego predeterminado sin límite de tiempo o con temporizador ajustable; aislar el cronometrado estricto en un modo «Speed Challenge» opt‑in que invoque la Excepción esencial de forma honesta [2].  
3. Todos los objetivos interactivos ≥24 × 24 px CSS, ≥44 × 44 px para interfaces de usuarios menores de 8 años [1].  
4. Cada interacción de arrastre incluye una alternativa de toque‑selección/toque‑colocación; el arrastre es una mejora, nunca la única vía [10].  
5. Nunca codificar correcto/incorrecto, dificultad o categoría únicamente mediante el color; combinar con icono/forma/texto y comprobar contra simulaciones de protanopía, deuteranopía, tritanopía y acromatopsia [14][20].  
6. Incluir un control persistente «reduce motion/sound» con valor predeterminado `prefers-reduced-motion`, más allá del requisito AAA‑only 2.3.3, porque la población atendida es real independientemente del nivel AA [17][18].  
7. Desarrollar un **modo de Discalculia / Sentido Numérico** distinto: presentación basada primero en la recta numérica, visuales con manipulativos concretos, rampa adaptativa modelada en Number Race/Calcularis en lugar de una curva Elo genérica; accesible en la configuración, sin estar restringido a un diagnóstico (no hay consenso) [4].  
8. No crear/licenciar una «fuente para dislexia»; invertir en interlineado, líneas instruccionales más cortas, alineación a la izquierda y una tipografía sans‑serif estándar legible [5].  
9. Cada figura geométrica recibe una descripción de texto estructurada con gramática fija (forma, luego vértices/lados, luego ángulos) más datos de forma navegables y describibles con teclado, sin representación exclusiva de canvas [19].  
10. Añadir un «modo de enfoque» de bajo estímulo para TDAH/atención: pantallas de tarea única, sin animación/audio competidor durante el problema, estructura predecible, efectos celebratorios diferidos — alineado con Enough Time/Navigable/Predictable de COGA [16].  
11. Operatividad completa mediante conmutador/teclado: orden de foco secuencial, indicador de foco visible y sin obstrucciones, sin interacción que requiera multitáctil o toque cronometrado con precisión sin una alternativa de puntero único [8].  
12. Proveer subtítulo/equivalente de texto para cada indicación hablada y clip instruccional; hacer que el bucle completo de resolución de problemas sea completable silenciado por defecto.  
13. Tratar la EAA de la UE como ya vinculante (fecha de cumplimiento superada el 28 June 2025) si se vende a consumidores de la UE; comisionar ahora una autoevaluación tipo VPAT contra EN 301 549 [7][9].  
14. Apuntar internamente a WCAG 2.2 AA, un superconjunto estricto que pre‑satisface la barra WCAG 2.1 AA que los distritos escolares de EE. UU. requerirán en la contratación [6].

## Preguntas abiertas para el responsable del proyecto

1. ¿Vende Math Challenge a consumidores físicamente en la UE hoy o dentro de 12 meses? Determina si el cumplimiento de la EAA (ya exigido desde el 28 June 2025) está activo o es prospectivo [7].  
2. ¿Es la tabla de clasificación pública una característica central permanente, o puede replantearse como el modo opt‑in Speed Challenge, manteniendo el reloj opcional por defecto?  
3. ¿Es la adopción por parte de los distritos escolares de EE. UU. un canal real de salida al mercado? En caso afirmativo, un VPAT WCAG 2.1 AA se convierte en un activo de venta, no solo en cumplimiento [6].  
4. ¿Debe el contenido de geometría limitarse a formas estructuradas en texto/navegables con teclado, o la franja de edad mayor necesita geometría interactiva real en canvas/SVG (requiriendo una mayor inversión en accesibilidad)?  
5. ¿Presupuesto/disposición para una capa de renderizado de accesibilidad tipo MathJax (voz basada en SRE) frente a un renderizador más ligero como KaTeX puro con herramientas integradas más débiles?  
6. ¿Incluir el conmutador reduce motion/sound en el lanzamiento, o posponerlo para una fase de accesibilidad posterior, dado que es económico, AAA‑only y protege a usuarios autistas/vestibulares [17][18]?  

## Fuentes

1. W3C, WCAG 2.2, SC 2.5.8 Tamaño del objetivo (mínimo) — https://www.w3.org/TR/WCAG22/#target-size-minimum  
2. W3C, WCAG 2.2, SC 2.2.1 Temporización ajustable — https://www.w3.org/TR/WCAG22/#timing-adjustable  
3. W3C, MathML Core (Candidate Recommendation Snapshot, 24 June 2025) — https://www.w3.org/TR/mathml-core/  
4. Wikipedia, «Dyscalculia» — https://en.wikipedia.org/wiki/Dyscalculia  
5. Wikipedia, «OpenDyslexic» — https://en.wikipedia.org/wiki/OpenDyslexic  
6. ADA.gov, «Regla de accesibilidad web y de aplicaciones móviles del Título II de 2024» — https://www.ada.gov/resources/2024-03-08-web-rule/  
7. Wikipedia, «European Accessibility Act» — https://en.wikipedia.org/wiki/European_Accessibility_Act  
8. W3C, WCAG 2.2, SC 2.5.1 Gestos del puntero / 2.5.2 Cancelación del puntero / 2.5.4 Actuación de movimiento — https://www.w3.org/TR/WCAG22/#pointer-gestures  
9. Wikipedia, «EN 301 549» — https://en.wikipedia.org/wiki/EN_301_549  
10. W3C, WCAG 2.2, SC 2.5.7 Movimientos de arrastre — https://www.w3.org/TR/WCAG22/#dragging-movements  
11. MathJax Project, visión general de las funciones de accesibilidad — https://www.mathjax.org/#accessibility  
12. Wikipedia, «MathML» (soporte para lectores de pantalla) — https://en.wikipedia.org/wiki/MathML  
13. W3C, WCAG 2.2, SC 1.4.10 Reflujo — https://www.w3.org/TR/WCAG22/#reflow  
14. W3C, WCAG 2.2, SC 1.4.1 Uso del color — https://www.w3.org/TR/WCAG22/#use-of-color  
15. Wikipedia, «MathML» (historia de la implementación en Chromium) — https://en.wikipedia.org/wiki/MathML  
16. W3C WAI, visión general de la accesibilidad cognitiva — https://www.w3.org/WAI/cognitive/  
17. MDN Web Docs, «prefers-reduced-motion» — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
18. W3C, WCAG 2.2, SC 2.3.3 Animación a partir de interacciones — https://www.w3.org/TR/WCAG22/#animation-from-interactions  
19. Wikipedia, «Nemeth Braille» — https://en.wikipedia.org/wiki/Nemeth_Braille  
20. WebAIM, «Discapacidades visuales: daltonismo» — https://webaim.org/articles/visual/colorblind  
21. Section508.gov, «Leyes y políticas» — https://www.section508.gov/manage/laws-and-policies/  
22. W3C, Referencia rápida WCAG 2.2 (nuevos criterios de éxito en 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
