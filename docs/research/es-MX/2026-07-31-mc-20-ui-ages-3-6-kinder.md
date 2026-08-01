# Diseño de UI e interacción para niños de 3 a 6 años (franja KINDER)

> Investigación Math Challenge — 2026-07-31 — tema 20

## Resumen ejecutivo (ES)

Los niños de 3 a 6 años tienen precisión motriz muy inferior a la de un adulto:
Hourcade et al. (2004) midieron 90% de precisión de apuntado en niños de 4 años
recién con objetivos de 23.7mm, muy por encima de los ~9mm (44pt) que asumen
las guías de adultos [1][2]. El arrastrar-y-soltar ("drag-and-drop") es el
gesto que más falla en esta edad: es significativamente más lento que el toque
según la ley de Fitts en niños de 4-6 años (no así en niños de 7-10) [4], y
aparece repetidamente como el gesto más difícil de ejecutar junto con el doble
toque y el trazo [3][5]. La política de Apple para la categoría Kids exige
"parental gates" con tareas de nivel adulto antes de compras o enlaces
externos, e indicaciones por voz para niños que no leen [11]. El marco de los
"cuatro pilares" de Hirsh-Pasek (activo, comprometido, significativo,
socialmente interactivo) es el estándar académico para evaluar si una app es
realmente educativa, no solo "educativa" de nombre [10]. NN/g documenta que
los niños de 3-5 años prefieren animación y sonido —al contrario que los
adultos— y que necesitan navegación espacial y metáforas de la vida real
porque aún no leen [8][9]. La FTC ha sancionado con $520M a Epic Games por
patrones oscuros que permitían compras accidentales de menores [13], lo cual
es directamente relevante para cualquier flujo de pago o salida de la app.
Este informe traduce esos hallazgos en una especificación concreta para la
franja KINDER de Math Challenge: tamaños de objetivo táctil, tipografía,
paleta, sonido, animación, profundidad de navegación, número de toques para
iniciar un reto, forma del input de respuesta, y comportamiento ante una
respuesta incorrecta, diferenciado por teléfono, tableta y escritorio.

## Executive summary (EN)

Children aged 3-6 have markedly lower motor precision than adults. Hourcade et
al. (2004) measured 90% pointing accuracy in 4-year-olds only at 23.7mm
targets, well above the ~9mm (44pt) adult guideline baseline [1][2].
Drag-and-drop is the gesture that fails most at this age: it is significantly
slower than tapping under Fitts' law for 4-6-year-olds (but not for
7-10-year-olds) [4], and repeatedly surfaces as the hardest gesture alongside
double-tap and tracing [3][5]. Apple's Kids category policy requires
"parental gates" — adult-level tasks — before purchases or external links, and
voice prompts for pre-literate children [11]. Hirsh-Pasek's "four pillars"
framework (active, engaged, meaningful, socially interactive) is the academic
standard for whether an app is actually educational rather than educational in
name only [10]. NN/g documents that 3-5-year-olds prefer animation and sound —
unlike adults, who usually dislike them — and need spatial navigation and
real-life metaphors because they cannot yet read [8][9]. The FTC fined Epic
Games $520M over dark patterns enabling accidental purchases by minors [13],
directly relevant to any payment or exit flow. This report translates those
findings into a concrete spec for Math Challenge's KINDER band: touch target
sizes, typography, palette, sound, animation, navigation depth, taps to start
a challenge, answer-input shape, and wrong-answer behavior, broken out by
phone, tablet, and desktop.

## Hallazgos

### 1. Desarrollo motor y precisión táctil

Hourcade, Bederson, Druin y Guimbretière (2004) probaron el apuntado con ratón
en niños preescolares y encontraron que el tamaño del objetivo tenía "a
significant effect on accuracy and target reentry"; los niños de 4 años
alcanzaron 90% de precisión de apuntado solo con tamaños de objetivo
alrededor de **23.7mm** — aproximadamente 2.5x la guía de adultos comúnmente
citada de 44pt (~9.2mm) [1][2]. El trabajo específico de pantallas táctiles
confirma la misma brecha para el input de toque directo. El estudio "Touch
interaction for children aged 3 to 6 years" de Vatavu, Cramariuc y Schipor
estudió a niños en la etapa preoperacional de Piaget ejecutando toque y
arrastrar-y-soltar en teléfonos y tabletas, y reportó error y varianza
sistemáticamente mayores que las líneas base de adultos [3]. Un artículo de
síntesis, "Physical dimensions of children's touchscreen interactions:
Lessons Learned", realizó seis estudios con más de 180 participantes (116
niños) y cita el hallazgo de Baloian et al. (2013) de que **el trazo, el doble
toque y el arrastrar-y-soltar fueron los gestos más difíciles** de ejecutar de
forma fiable para niños de 5-6 años [5][6]. La investigación sobre capacidad
de gestos por edad reporta que los niños de 2-3 años pueden hacer toque,
deslizamiento y gesto rápido (flick), mientras que los de 4-6 años añaden
arrastrar-y-soltar y pellizcar-para-ampliar — pero con un éxito notablemente
menor que los niños en edad escolar: un estudio encontró que solo los niños de
7-8 años lograron arrastrar-y-soltar fiable (30% de éxito) y seguir
instrucciones de audio/video (34%) [6]. Un estudio de validez de la ley de
Fitts encontró que el tiempo de movimiento fue "significantly higher for
drag-and-drop than for tap" específicamente en niños de 4-6 años, con la
brecha desapareciendo hacia los 7-10 años — el déficit está ligado a la edad
y se cierra alrededor de primer grado [4].

### 2. Por qué el arrastrar-y-soltar falla, y qué funciona en su lugar

El arrastrar-y-soltar requiere contacto sostenido del dedo, seguimiento visual
continuo de un objetivo en movimiento y una liberación controlada — tres
subtareas motrices/de atención encadenadas, razón por la cual rinde
consistentemente por debajo del toque simple en toda la literatura anterior
[3][4][5][6]. Un estudio de la York University (FittsFarm) encontró que la
precisión del arrastrar-y-soltar mejoró significativamente con un **stylus de
bajo costo frente al dedo**, ya que el stylus reduce la oclusión y el ruido
del área de contacto de la yema del dedo [7]. El reporte de prototipado de
Khan Academy Kids llegó a una conclusión complementaria: las respuestas de
arrastrar-y-soltar se correlacionaban *más fuertemente* con otros ítems de
evaluación válidos que el toque, porque los niños tratan el arrastre como más
deliberado — útil para evaluación, pero una razón para reservarlo para casos
donde se busca deliberación, no para el input rutinario [15]. Implicación
práctica para niños de 3-6 años: **preferir tocar-para-seleccionar sobre
arrastrar-y-soltar** para la mecánica de respuesta principal; si se usa un
arrastre en absoluto (p. ej., "coloca la manzana en la canasta"), mantener la
distancia corta, el objetivo grande, y añadir un imán de ajuste al objetivo
(snap-to-target) para que una liberación imprecisa aún se registre como
correcta.

### 3. Diseño audio-primero y texto-a-voz

Como la lectura está "not at all" desarrollada a esta edad según la
investigación de NN/g por franjas de edad (3-5 vs. 6-8 vs. 9-12) [8][9], cada
instrucción, número e indicación necesita un equivalente hablado, no solo
texto. La investigación más reciente de NN/g sobre UX infantil encontró que
los niños de 3 años ya podían reconocer los íconos del reproductor de video
(reproducir, pausa, volumen, pantalla completa) por exposición repetida incluso
sin saber leer, lo que sugiere que el emparejamiento ícono+sonido construye
comprensión real y transferible a esta edad [9]. Las pruebas internas de Khan
Academy Kids son también una advertencia útil aquí: añadir sonidos únicos a
los personajes en pantalla hizo que los niños "spend more time tapping
monsters to hear noises than focusing on" la tarea — la novedad de audio puede
convertirse ella misma en una distracción, así que el sonido debe tener un
propósito (confirmar una acción, leer una indicación) en lugar de ser
decorativo-interactivo [15].

### 4. Comprensión de íconos

La investigación sobre pictogramas/íconos generalmente trata la comprensión de
símbolos como aún en desarrollo durante los años preescolares y enfatiza lo
concreto sobre lo abstracto — un ícono tipo fotografía o literal (una manzana,
un número entero de puntos) se entiende mucho antes que uno abstracto o
metafórico [17][18]. Esto coincide con el hallazgo de NN/g de que los niños de
3 años reconocían íconos *funcionales* ligados a una acción consistente y
repetida (reproducir/pausa) en lugar de íconos novedosos o de un solo uso [9].

### 5. Personajes, mascotas y animación

NN/g reporta explícitamente que los niños pequeños (3-5) "showed preference
for animation and sound," señalando que esto es lo opuesto de la preferencia
adulta, donde tales elementos son "usually disliked" [8]. Esta es una de las
divergencias más claras entre UX adulta e infantil en el corpus y justifica
una inversión a nivel de tema en una mascota consistente para la franja
KINDER, ya que un personaje recurrente es también el vehículo para la entrega
de voz en off y para suavizar la retroalimentación ante respuestas incorrectas
(ver §7).

### 6. Color y diseño visual

Un estudio dedicado sobre el color en interfaces para aplicaciones infantiles
encontró que "the frequency of high saturation in children's user interfaces
is higher than in adult user interfaces" [16], y el trabajo de eye-tracking
sobre la preferencia de color de los niños encontró que los tonos cálidos
(rojo, naranja, amarillo) dominan ligeramente, aunque la interacción precisa
de tono/saturación/brillo sigue siendo inconclusa a nivel de investigación
[19]. La guía tipográfica converge alrededor de una sans-serif grande, simple
y redondeada: una síntesis de practicantes especifica un mínimo de 18-19px
para texto de cuerpo/etiqueta para esta franja de edad, muy por encima del
texto de cuerpo móvil para adultos [12].

### 7. Retroalimentación, recompensa y manejo de errores

Las pruebas de usabilidad de NN/g afirman llanamente que los niños pequeños
"expect feedback on every single action they perform" [12] — el silencio
después de un toque se lee como "roto", no como "no pasó nada". Combinado con
el énfasis del marco de los cuatro pilares en el compromiso *significativo*
sobre los llamativos bucles de recompensa [10], y la advertencia de la
síntesis de Smashing Magazine de que las mecánicas de recompensa extrínseca
pueden socavar la motivación intrínseca con el tiempo [12], la implicación es:
dar retroalimentación sensorial instantánea (sonido + micro-animación) en cada
toque, pero mantener la capa de *recompensa* (estrellas, insignias, celebración
de la mascota) ligada a la completación genuina de la tarea, no al toque en sí.

### 8. Navegación, duración de sesión y salidas accidentales

La guía de la categoría Kids de Apple exige un "parental gate" — una tarea de
nivel adulto como un problema de matemáticas — antes de una compra dentro de
la app o cualquier enlace hacia contenido externo, con indicaciones por voz
para que los niños que no leen entiendan por qué están bloqueados [11]. El
programa Families de Google Play impone obligaciones de política comparables
para la revisión de contenido y publicidad conductual [14]. La FTC trata
formalmente los patrones oscuros que permiten a los niños acumular compras sin
que un padre lo note como una práctica engañosa; su acuerdo de 2022 con Epic
Games por Fortnite costó $520M específicamente por "dark patterns to trick
players into making unwanted purchases" al alcance de los niños [13]. Sobre la
duración de la sesión, la guía más reciente de la AAP sobre medios infantiles
(cubierta en un comunicado de 2026 de healthychildren.org) organiza las
recomendaciones por franja de edad — incluyendo "early childhood 0-5" — y pide
"child-centered designs" construidos con niños y familias en el proceso de
diseño, aunque el extracto público no da una cifra exacta de minutos por
sesión [20]; tratar cualquier número específico como una decisión de producto,
no como un estándar citado, en ausencia del reporte técnico completo de
*Pediatrics*.

### 9. Inicio de sesión sin lectura

Ninguna de las fuentes consultadas especifica un estudio nombrado de
"picture password" para esta franja de edad exacta, y esta es una brecha de
evidencia genuina en la literatura aplicada encontrada. Lo que sí está
establecido, y sobre lo que cualquier inicio de sesión basado en
imagen/avatar/PIN debería construirse, es (a) la evidencia del linaje
NN/g-Hourcade de que el reconocimiento de íconos por exposición repetida es
fiable mucho antes de que lo sea la lectura de texto [9], y (b) el requisito
de Apple de que cualquier acción con barrera para adultos para este grupo de
edad use un **mecanismo no textual, emparejado con audio** [11]. Un patrón de
"elige tu cara" con cuadrícula de avatares (usado por apps al estilo de Khan
Academy Kids) es consistente con ambos: no requiere lectura ni tecleo, y es
trivialmente rápido de ejecutar correctamente para un niño de 4 años.

### 10. Juego conjunto con los padres

El propio marco de los cuatro pilares trata lo "socialmente interactivo" como
uno de los cuatro pilares requeridos de una app educativa — una app que es
mejor *con* un adulto jugando en conjunto puntúa más alto en esta dimensión,
no más bajo [10]. El mecanismo de parental gate de Apple y el programa
Families de Google formalizan ambos una capa distinta y separada orientada a
los padres (ajustes, aprobación de compras, límites de tiempo) de la
experiencia orientada al niño [11][14], que es la arquitectura a copiar: dos
superficies claramente separadas, no una pantalla compartida con controles de
adulto ocultos.

## Implicaciones de diseño para Math Challenge

1. **Mínimo de objetivo táctil: 88×88px px CSS en teléfono/tableta, 76×76px
   aceptable en escritorio-con-ratón.** Derivado de la cifra de 23.7mm de
   Hourcade et al. a una línea base típica de ~160dpi (≈150px en un lienzo de
   assets de alta densidad, escalando a ~88-96 px CSS tras considerar el
   device pixel ratio) [1][2], y verificado contra el mínimo de practicante de
   75×75px de Smashing Magazine para esta franja de edad [12]. Usar la cifra
   mayor, no la línea base HIG de adultos de 44pt (~9mm) — ese número está
   documentado como demasiado pequeño para niños de 4 años por un amplio
   margen [1].
2. **Nada de arrastrar-y-soltar como mecánica de respuesta principal.** Usar
   tocar-para-seleccionar (p. ej., tocar el número/objeto correcto entre 3-4
   opciones grandes). Reservar cualquier interacción de arrastre para un
   momento secundario/de celebración (p. ej., arrastrar una calcomanía a un
   tablero de recompensas), con zonas grandes de ajuste al objetivo, porque el
   arrastrar-y-soltar es el gesto que falla con mayor consistencia en la
   literatura para edades de 3-6 [3][4][5][6].
3. **Cada pantalla y cada indicación tiene un equivalente hablado (TTS o VO
   grabado), activado automáticamente al entrar a la pantalla, rejugable al
   tocar la mascota.** Ninguna indicación debería depender solo del texto, ya
   que la lectura no está desarrollada a esta edad [8][9].
4. **Tipografía: mínimo de 24-32px para cualquier numeral o etiqueta en
   pantalla** (mayor que el piso de practicante de 18-19px para texto de
   cuerpo [12], porque el contenido principal de Math Challenge son numerales
   que los niños deben discriminar visualmente con rapidez, no texto de
   párrafo), sans-serif redondeada, con grosor de trazo alto para legibilidad
   de un vistazo.
5. **Paleta: colores primarios de alta saturación, tendiendo a cálidos** para
   el chrome del tema KINDER (mascota, botones, estados de celebración),
   consistente con la mayor saturación medida en interfaces infantiles vs. las
   de adultos y la preferencia de los niños por tonos cálidos [16][19].
   Mantener la saturación más baja en la capa de fondo/lienzo para que los
   objetos tocables sean los elementos más saturados en pantalla — la
   saturación misma se convierte en una affordance de "esto se puede tocar".
6. **Sonido: solo con propósito, no decorativo-interactivo.** Un timbre de
   confirmación en cada toque (según el hallazgo de NN/g de "feedback on every
   action" [12]), narración hablada de números/indicaciones, y líneas de voz
   de la mascota en éxito/reintento — pero nada de sonido ambiental al toque
   para elementos de fondo, según el hallazgo de Khan Academy Kids de que los
   sonidos novedosos apartan la atención de la tarea [15].
7. **Animación: cada cambio de estado se anima** (pulsación de botón,
   revelación de correcto/incorrecto, reacciones de la mascota) — la animación
   es una preferencia documentada a esta edad, en lugar del estilo adulto de
   "reduce motion" por omisión [8]. Respetar los ajustes de movimiento
   reducido a nivel de SO como una anulación de accesibilidad, pero no
   usar por omisión un tema KINDER de movimiento mínimo.
8. **Profundidad de navegación: máximo 2 toques desde abrir la app hasta "se
   está respondiendo un reto".** Toque 1: elegir avatar/perfil de niño (sin
   login, ver #9). Toque 2: tocar la mascota o un único botón grande de
   "Jugar". Esto coincide con la evidencia de que las estructuras de menú
   profundas y la navegación de varios pasos son el tipo de complejidad
   diseñada para adultos que los niños de 3-6 años no pueden procesar de forma
   fiable sin leer [8][12].
9. **Inicio de sesión: selección por cuadrícula de avatares, sin PIN y sin
   contraseña tecleada para la franja KINDER.** Una cuadrícula de 4-6 mosaicos
   grandes de avatar (uno por perfil de niño en el hogar), tocada una vez,
   reemplaza funcionalmente el login; cualquier acción orientada a los padres
   (cambiar la facturación de los perfiles, ajustes) queda detrás de una
   superficie separada con barrera para adultos según el requisito de parental
   gate de Apple [9][11].
10. **Comportamiento ante respuesta incorrecta: sin X roja, sin zumbador, sin
    lenguaje de "fallo".** La mascota da una señal de audio alentadora
    ("¡Casi! / Almost!"), la opción incorrecta se sacude/attenúa suavemente en
    lugar de desaparecer, y se invita al niño a intentarlo de nuevo en la
    misma pantalla — consistente con mantener la retroalimentación alentadora
    en lugar de punitiva a una edad en la que NN/g documenta que la autoimagen
    se hiere fácilmente con un encuadre de "this is for babies" si el tono
    juzga mal la etapa de desarrollo del niño [8][10].
11. **Una superficie de ajustes/compras solo para padres, protegida por un
    problema de matemáticas o un patrón de presionar-y-mantener, nunca
    alcanzable por un toque perdido desde la experiencia del niño** —
    implementando directamente el requisito de parental gate de la categoría
    Kids de Apple [11] y evitando la responsabilidad por patrones oscuros por
    la que la FTC ha multado con $520M en una categoría de producto comparable
    [13]. Ningún flujo de compra dentro de la app debería ser alcanzable en
    absoluto desde la superficie orientada al niño para la franja KINDER;
    todas las acciones de compra/suscripción viven exclusivamente detrás del
    parental gate.
12. **Estructura de sesión/nivel: rondas de retos cortas y autocontenidas
    (60-120 segundos cada una) con un punto de parada natural (celebración de
    la mascota + indicación de "¿jugar otra vez?") cada 3-5 rondas**, para que
    un padre pueda terminar una sesión en un límite limpio en lugar de a media
    tarea — el impulso de la AAP hacia un diseño centrado en el niño y con la
    familia involucrada respalda construir puntos de pausa naturales en lugar
    de una estructura de scroll infinito, aunque ninguna cifra exacta de
    minutos sea citable del extracto consultado [20].
13. **Adaptación específica de escritorio: mantener el mismo mínimo de
    objetivo de 76px+ y la mecánica de toque-primero (clic-primero); no
    introducir input solo-de-teclado para la franja KINDER**, ya que ninguna
    de las investigaciones de precisión asume fluidez de teclado a esta edad y
    la investigación de precisión de apuntado con ratón (el estudio original
    de Hourcade) usó la misma lógica de objetivos grandes que el tacto [1].
14. **Diseño de íconos: literal, no abstracto** — una manzana entera para
    "1 manzana", no una fracción estilizada de una; íconos funcionales
    (reproducir, inicio, reintentar) repetidos idénticamente en cada pantalla
    para que el reconocimiento se transfiera, según el hallazgo de NN/g de que
    los íconos repetidos y consistentes son lo que los niños de 3 años
    realmente aprenden a reconocer [9].

## Antipatrones a evitar

- **Arrastrar-y-soltar como única forma de responder una pregunta** — el modo
  de fallo documentado con mayor consistencia de esta franja de edad
  [3][4][5][6].
- **Objetivos táctiles de 44pt/9mm** copiados de las guías móviles generales
  para adultos — medidos como insuficientes para niños de 4 años por Hourcade
  et al. [1][2].
- **Cualquier compra, suscripción o enlace externo alcanzable sin un parental
  gate** — un riesgo de acción de la FTC, no solo un problema de UX [11][13].
- **Indicaciones o instrucciones solo de texto** sin equivalente de audio —
  inutilizables por un no-lector por definición [8][9].
- **Sonido decorativo al toque para elementos no accionables** — distrae a los
  niños de la tarea en cuestión de forma medible [15].
- **Retroalimentación punitiva ante respuestas incorrectas** (X roja, zumbador,
  "¡Mal!", opciones que desaparecen) — va en contra del tono alentador que la
  franja de edad necesita y arriesga una reacción de "a esta app no le gusto"
  que la investigación de NN/g muestra que los niños articulan directamente
  ("this is for babies") cuando el tono juzga mal la edad [8].
- **Navegación profunda u oculta** (menús hamburguesa, ajustes de varios
  niveles dentro de la superficie orientada al niño) — este grupo de edad no
  puede navegar de forma fiable estructuras que asumen lectura o memoria de
  pantallas previas [8][12].
- **Mecánicas de recompensa que recompensan el toque/engagement en sí** en
  lugar de la completación de la tarea — socavan el pilar "significativo" del
  marco de los cuatro pilares y la motivación intrínseca en general [10][12].
- **Contraseñas tecleadas o PINs para el cambio de perfil orientado al niño** —
  ninguna evidencia consultada respalda la entrada de credenciales tecleadas
  como usable para un niño de 4 años que no lee, y la propia guía de Apple
  asume barreras no textuales para esta edad [11].
- **Reproducción automática hacia el siguiente contenido sin punto de
  parada** — va en contra del impulso de la AAP hacia un diseño centrado en el
  niño y con la familia involucrada, y elimina el límite natural de sesión que
  un padre necesita [20].

## Preguntas abiertas para el dueño del proyecto

1. ¿Debería la franja KINDER soportar **más de un perfil de niño por hogar**
   vía el inicio de sesión con cuadrícula de avatares, o Math Challenge es
   un-niño-por-cuenta para esta franja?
2. ¿Vale la pena soportar un **camino de input con stylus/Apple Pencil** en
   tableta para actividades extra basadas en arrastre, dado el hallazgo de
   FittsFarm de que el stylus mejora materialmente la precisión del
   arrastrar-y-soltar infantil frente al dedo [7]?
3. ¿Cuál es la **posición de Math Challenge sobre cualquier moneda de
   recompensa** (estrellas, monedas) para KINDER — puramente
   cosmética/de celebración, o ligada a desbloquear contenido, dada la tensión
   que la literatura señala entre mecánicas de recompensa y motivación
   intrínseca [10][12]?
4. ¿Deberían las indicaciones de límite de sesión ("¿jugar otra vez?")
   **contar hacia o reiniciar** cualquier función de límite diario que la app
   o los controles parentales a nivel de SO puedan imponer?
5. Para el parental gate, ¿prefiere el dueño **un reto aritmético simple** (el
   patrón sugerido por la propia Apple [11]) o un patrón de
   **presionar-y-mantener** — el primero funciona también como contenido dentro
   del tema, el segundo es más rápido para un padre que quiere abrir los
   ajustes con frecuencia?

## Fuentes

1. Hourcade, J.P., Bederson, B.B., Druin, A., Guimbretière, F. (2004).
   "Differences in pointing task performance between preschool children and
   adults using mice." ACM TOCHI. https://dl.acm.org/doi/10.1145/1035575.1035577
2. Resumen en ResearchGate de Hourcade et al. (2004), citando objetivo de
   23.7mm / 90% de precisión para niños de 4 años.
   https://www.researchgate.net/publication/220286166_Differences_in_pointing_task_performance_between_preschool_children_and_adults_using_mice
3. Vatavu, R.-D., Cramariuc, G., Schipor, D.M. "Touch interaction for children
   aged 3 to 6 years: Experimental findings and relationship to motor
   skills." International Journal of Human-Computer Studies.
   https://www.sciencedirect.com/science/article/pii/S1071581914001426
4. "Children's interaction with touchscreen devices: Performance and validity
   of Fitts' law" (comparación de tiempo de movimiento, arrastrar-y-soltar
   vs. toque, edades 4-6 vs. 7-10).
   https://www.researchgate.net/publication/355490786_Children's_interaction_with_touchscreen_devices_Performance_and_validity_of_Fitts'_law
5. "Physical dimensions of children's touchscreen interactions: Lessons
   Learned" (seis estudios, más de 180 participantes incl. 116 niños; cita a
   Baloian et al. 2013 sobre la dificultad de trazo/doble
   toque/arrastrar-y-soltar).
   https://www.sciencedirect.com/science/article/pii/S1071581918302441
6. "Ability of children to perform touchscreen gestures and follow prompting
   techniques when using mobile apps" (capacidad de gestos por edad, 2-3 vs.
   4-6 vs. 7-8).
   https://www.researchgate.net/publication/339053838_Ability_of_children_to_perform_touchscreen_gestures_and_follow_prompting_techniques_when_using_mobile_apps
7. "FittsFarm: Comparing Children's Drag-and-Drop Performance Using Finger
   [and Stylus]." York University / INTERACT 2019.
   https://www.yorku.ca/mack/interact2019.html
8. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for
   Young People." https://www.nngroup.com/articles/childrens-websites-usability-issues/
9. Nielsen Norman Group. "UX Design for Children (Ages 3-12)" report.
   https://www.nngroup.com/reports/children-on-the-web/
10. Hirsh-Pasek, K., Zosh, J.M., Golinkoff, R.M., et al. (2015). "Putting
    Education in 'Educational' Apps: Lessons from the Science of Learning."
    Psychological Science in the Public Interest.
    https://journals.sagepub.com/doi/abs/10.1177/1529100615569721
11. Apple Developer. "Design safe and age-appropriate experiences" (guía de la
    categoría Kids: franjas de edad, parental gates, restricciones de
    datos/publicidad).
    https://developer.apple.com/kids/
12. Smashing Magazine (2024). "A Practical Guide to Designing for Children"
    (objetivo táctil mínimo de 75×75px, texto de 18-19px,
    retroalimentación-en-cada-acción, advertencia de
    recompensa-vs-motivación-intrínseca).
    https://www.smashingmagazine.com/2024/02/practical-guide-design-children/
13. FTC. Comunicado de prensa, "Fortnite Video Game Maker Epic Games to Pay
    More Than Half a Billion Dollars over FTC Allegations" (patrones oscuros
    que permitían cargos no autorizados por niños), 2022.
    https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations
14. Google Play Console. Políticas del programa "Families".
    https://play.google.com/console/about/programs/families/
15. Khan Academy Blog. "Prototyping Playful and Nimble Pre-K Assessments"
    (hallazgo de audio-como-distracción; validez de evaluación de
    arrastrar-y-soltar vs. toque). https://blog.khanacademy.org/prototyping-playful-and-nimble-pre-k-assessments/
16. "Color design in application interfaces for children." Color Research &
    Application (Wiley). https://onlinelibrary.wiley.com/doi/abs/10.1002/col.22726
17. Siegler, R. "Using Symbols: Developmental Perspectives" (comprensión
    infantil de palabras, fotografías, modelos a escala, mapas, texto).
    https://siegler.tc.columbia.edu/wp-content/uploads/2020/08/wcs.1280.pdf
18. Frontiers in Developmental Psychology. "Exploring the Potential Relations
    Between a Novel Visual [icon-matching task] and preschool spatial/math
    skill." https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2026.1746813/full
19. Frontiers in Psychology. "Using head-mounted eye trackers to explore
    children's color preferences" (preferencia por tonos cálidos).
    https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1205213/full
20. AAP / HealthyChildren.org. "A Child-Friendly Digital World: AAP Releases
    New Media Recommendations" (guía por franjas de edad incl. early childhood
    0-5, diseño centrado en el niño).
    https://www.healthychildren.org/English/news/Pages/creating-a-child-friendly-digital-world-AAP-releases-new-media-recommendations.aspx
21. Kirkorian, H.L., et al. (2017). "All Tapped Out: Touchscreen Interactivity
    and Young Children's Self-Regulation and Word Learning." Frontiers in
    Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00578/full
