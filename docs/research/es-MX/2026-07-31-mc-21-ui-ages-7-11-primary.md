# Diseño UI/UX para niños de 7-11 años (franja PRIMARIA / ELEMENTAL)

> Investigación Math Challenge — 2026-07-31 — tema 21

## Resumen ejecutivo (ES)

La franja PRIMARIA (7-11) corresponde al estadio "operacional concreto" de
Piaget: razonan con lógica sobre objetos concretos y ganan "decentración"
(atender varias dimensiones a la vez), pero aún no manejan bien lo abstracto
[1]. NN/g documenta que esta franja navega con más independencia que los
prelectores de 3-5 años, pero sigue rechazando contenido dirigido incluso un
grado escolar por encima o por debajo del propio [2]. Un estudio de avatares
(arXiv, 48 participantes de 8-13 años) documenta el "efecto armario": los
niños crean varios avatares pero usan sistemáticamente solo uno [4]. La
investigación de NN/g sobre adolescentes (100 usuarios de 13-17, 210 sitios)
marca el techo que PRIMARIA debe evitar tocar por abajo: los adolescentes
rechazan la palabra "Kids" y el exceso de animación decorativa [3]. COPPA
exige consentimiento parental verificable para menores de 13 años y limita
qué datos pueden recogerse, restringiendo cualquier función social en esta
franja [9]. La discalculia (5-10% de la población) exige representar
cantidades de forma visual además de numérica y evitar presión de tiempo
[11]. Este informe traduce estos hallazgos en una especificación para el
tema PRIMARIA, diferenciada de KINDER y de TEEN, por teléfono, tableta y
escritorio.

## Executive summary (EN)

The PRIMARY band (ages 7-11) sits in Piaget's "concrete operational" stage:
logical reasoning about concrete objects plus "decentration" (attending to
more than one dimension at once), but still weak abstract reasoning [1].
NN/g shows this band navigates more independently than 3-5-year-old
pre-readers, yet still rejects content pitched even one grade level off [2].
An avatar study (arXiv, 48 participants aged 8-13) documents the "wardrobe
effect": children build several avatars but consistently settle on one [4].
NN/g's teen research (100 users aged 13-17, 210 sites) marks the ceiling
PRIMARY must avoid touching from below: teens reject the word "Kids" and
excess decorative animation [3]. COPPA requires verifiable parental consent
under 13 and restricts data collection, directly constraining any social
feature in this band [9]. Dyscalculia (5-10% of the population) requires
pairing numerals with a visual quantity and avoiding time pressure [11].
This report turns these findings into a spec for the PRIMARY theme,
differentiated from KINDER and TEEN, across phone, tablet, and desktop.

## Hallazgos

### 1. Desarrollo cognitivo: lo que los 7-11 realmente pueden hacer

El estadio operacional concreto de Piaget cubre este rango: conservación,
razonamiento inductivo y "decentración" —seguir más de una variable en
pantalla en lugar de fijarse en una sola—, pero con razonamiento
abstracto/hipotético aún débil, lo que argumenta contra una UI que exija
sostener una regla en la mente sin un ancla concreta (recta numérica,
agrupación, paso resuelto) [1]. Las propias categorías de NN/g separan la
franja "media" de 6-8 (aún con andamiaje) de la de "mayores" de 9-12
(navegación independiente, lectura más fuerte) [2], así que PRIMARIA no es
internamente uniforme —un niño de 7 años está más cerca de KINDER, uno de
11 más cerca de TEEN.

### 2. "Padre" versus "de bebés": el mecanismo de rechazo

La evidencia citable más clara sobre el límite *superior* viene del corpus
de adolescentes de NN/g: los adolescentes (13-17) rechazan explícitamente la
palabra "Kids", les desagradan los visuales recargados o estridentes, y
quieren interactividad limpia y con propósito, con secciones separadas y
etiquetadas "Kids" y "Teens" donde ambas existen [3]. El mecanismo es el
rechazo de una autoimagen caducada, no una preferencia de detalle —un niño
que atraviesa los 7-11 está renegociando "ya no soy un niño chiquito" mucho
antes de volverse adolescente, así que PRIMARIA debe señalar más capacidad
que una apariencia de mascota y burbujas sin adoptar el aspecto más plano y
denso que prefieren los adolescentes [3].

### 3. Avatares y personalización como trabajo de identidad

Un estudio de 2026 con 48 niños de 8-13 años que construían avatares en
juegos sociales encontró cuatro motivaciones: autorrepresentación,
experimentar con identidades alternativas, necesidades sociales y desempeño
en el juego; el diseño de la monetización moldea de forma medible lo que los
niños construyen [4]. Su hallazgo principal es el "efecto armario" —los
niños crean varios avatares pero convergen en usar solo uno, así que el
*proceso* de personalización es donde reside el valor aunque el producto
final sea estrecho [4]. La síntesis de Digital Wellness Lab añade que los
avatares funcionan mejor expresando un yo actual o aspiracional, y que la
inclusión importa de forma concreta: el 42.1% de las niñas y el 38.6% de
los niños en la investigación citada evitan juegos que representan
personajes femeninos de forma hipersexualizada [5]. Un estudio relacionado
de Frontiers (82 participantes, estratificado por etnia) encontró que la
personalización frente a avatares preasignados apenas cambiaba el ánimo
inmediato, pero la satisfacción seguía de cerca qué tan bien las opciones
representaban la identidad propia del niño —la subrepresentación funciona
como una "subtle microaggression" [6]. Las compras aleatorias estilo caja de
botín se señalan como un riesgo de monetización distinto, con mayor
participación de los niños que de las niñas [5].

### 4. Coleccionables, progresión y motivación

La teoría de la autodeterminación enmarca las palancas: autonomía (elección
en cómo progresar), competencia (desafío calibrado con retroalimentación
clara) y vinculación (una dimensión social); las recompensas extrínsecas
sostienen la motivación solo cuando se leen como retroalimentación sobre la
competencia y no como un incentivo controlador [10]. Los coleccionables son
más duraderos cuando reunirlos se ata a algo que el niño ya valora (dominio,
historia, una meta elegida por él mismo) que cuando se persiguen
puramente por el premio externo [10].

### 5. Funciones sociales y sus implicaciones de seguridad

COPPA exige consentimiento parental verificable antes de recoger información
personal de un menor de 13 años, define la información personal de forma
amplia (identificadores persistentes, geolocalización, imágenes/audio) y
prohíbe condicionar la participación a la recolección excesiva de datos
[9]. Por eso la mayoría de las funciones de chat y perfiles públicos de
consumo excluyen a los menores de 13 o las ponen tras el consentimiento
parental [9] —una restricción real sobre tablas de clasificación, listas de
amigos o texto libre en una franja mayoritariamente menor de 13.

### 6. NN/g sobre las franjas inmediatamente por encima y por debajo de PRIMARIA

NN/g advierte contra tratar a "los niños" como un solo grupo indiferenciado
de 3-12, y separa las franjas joven/media/mayor con necesidades distintas de
tamaño de fuente y andamiaje [2]. El informe de adolescentes (100 usuarios,
tres rondas de investigación, EE. UU./Reino Unido/Australia) es el dato más
afilado sobre el techo: los adolescentes son demasiado confiados y sin
embargo rinden peor que los adultos por lectura débil, pobres habilidades de
búsqueda y poca paciencia —"they don't blame themselves, they blame you"—,
abandonando un flujo confuso en lugar de resolverlo [3]. El panorama de
usuarios jóvenes de NN/g cuantifica la división: un informe de 156
recomendaciones para edades 3-12 frente a un informe separado de 124
consejos para 13-17 [7] —dos manuales de reglas, evidencia de que PRIMARIA
necesita su propio tema y no una apariencia de kinder o de adolescente
escalada.

### 7. Tolerancia al error y frustración

Ninguna fuente encontrada midió la tolerancia al error para exactamente
7-11 de forma directa. La evidencia más cercana: la decentración de Piaget
significa que esta edad puede sostener "me equivoqué" y "puedo
arreglarlo" como hechos separados, a diferencia de un niño de 4-6 años que
los confunde [1]; y el corpus de adolescentes muestra impaciencia con
interfaces confusas, culpando al producto, ya presente a los 13-17 [3]. La
investigación sobre discalculia añade un punto concreto: la presión de
tiempo empeora el desempeño en manipulación numérica para niños con sentido
numérico débil, y un ritmo flexible reduce las caídas ligadas al estrés
[11] —un argumento contra los temporizadores de cuenta regresiva estrictos
para esta franja en general.

### 8. Nivel de lectura, longitud del texto, iconografía y etiquetas

La división en franjas de NN/g aplica directamente: los de 6-8 años
necesitan texto andamiado y más grande, los de 9-12 manejan lectura más
avanzada y navegación independiente, pero el contenido dirigido incluso un
grado por encima o por debajo se rechaza —a diferencia de los adultos, que
toleran un nivel por omisión de 8.º-10.º grado [2]. El corpus de
adolescentes, un escalón arriba, recomienda un nivel de lectura de 6.º grado
o menor incluso para una audiencia nominalmente más fuerte, porque la
velocidad y la atención —no la decodificación— son el cuello de botella
[3]. Esa lógica aplica con más fuerza aquí: etiquetas cortas, una idea por
pantalla, íconos literales en lugar de metafóricos.

### 9. Incorporación sin tutoriales largos

Ningún estudio abordó la longitud del tutorial de incorporación para 7-11
específicamente —una brecha de evidencia. Evidencia transferible: la poca
paciencia del corpus de adolescentes por cualquier cosa que retrase la tarea
dirigida a la meta [3], y el hallazgo operacional-concreto de que la
instrucción abstracta sin un primer ejemplo concreto se retiene mal [1] —en
conjunto argumentan por "aprender resolviendo el primer problema real, con
pistas andamiadas", no por un explicador de varias pantallas.

### 10. Contexto de dispositivo

Ninguna fuente consultada midió el uso de tabletas compartidas o
Chromebooks escolares para esta franja exacta —una segunda brecha, señalada
en lugar de disimulada. Sigue siendo una restricción casi segura —cambio
rápido de perfil, límites de sesión limpios, ninguna suposición de un inicio
de sesión personal persistente— que las implicaciones de diseño de abajo
tratan como un requisito incluso sin una cita que la respalde.

### 11. Accesibilidad: tipografía para dislexia y discalculia

La tipografía amigable con la dislexia converge en parámetros verificables:
fuentes sans-serif abiertas (Arial, Verdana, Open Sans, o las de propósito
específico Atkinson Hyperlegible/OpenDyslexic), texto de cuerpo mínimo de
16px, interlineado de 1.5×, espaciado entre letras de 0.12em, espaciado
entre palabras de 0.16em, longitud de línea de 45-100 caracteres, contraste
WCAG 4.5:1 (3:1 para texto grande/en negritas), alineación a la izquierda,
sin mayúsculas sostenidas ni itálicas pesadas [8]. La discalculia
(prevalencia de 5-10%) es una dificultad neurobiológica con el sentido de
cantidad, el mapeo numeral-a-cantidad, la memorización de hechos y sostener
números en la mente a mitad de un cálculo, en todos los niveles de
dificultad [11]. La respuesta de diseño: acompañar los numerales con una
cantidad visual (puntos, bloques, una recta numérica) en lugar de dígitos
desnudos, minimizar el desorden, ofrecer más de una modalidad de entrada,
evitar o hacer opcional cualquier presión de tiempo [11].

### 12. Entrada numérica en pantalla

No se encontró ningún estudio dedicado a teclados numéricos para 7-11 —una
tercera brecha. Dos hallazgos adyacentes acotan el diseño: las HIG de Apple
fijan 44×44pt como el piso general de objetivo táctil [12], y la brecha de
precisión motora en pantalla táctil frente a los adultos —grande en el
rango de 3-6— se cierra aproximadamente hacia primer grado [informe
complementario, tema 20]. El llamado de la literatura sobre discalculia a
múltiples modalidades de entrada [11] argumenta por un teclado que no sea la
*única* vía de respuesta —toques de opción múltiple, una recta numérica
tocable/arrastrable o un teclado, elegidos por tipo de problema.

## Implicaciones de diseño para Math Challenge

1. **Objetivos táctiles: mínimo 48×48 px CSS en teléfono/tableta, 44×44px en
   escritorio-con-ratón** —justo por encima del piso de 44×44pt de Apple
   [12], no el mínimo mucho mayor de KINDER (~88-96px), ya que la brecha de
   precisión motora frente a los adultos se ha cerrado en gran parte hacia
   los 7-10 [informe complementario, tema 20]. Esta es la diferencia
   mecánica más clara respecto a KINDER: nada de zonas sobredimensionadas
   "a prueba de pequeños".
2. **Tipografía: sans-serif redondeada pero no burbujeante**, base de
   18-20px para el texto del problema, etiqueta secundaria mínima de 16px
   —más pequeña y menos "ruidosa" que los numerales de 24-32px de KINDER.
   Ofrecer un interruptor dentro de la app de tipografía amigable con la
   dislexia (Atkinson Hyperlegible/OpenDyslexic, interlineado de 1.5×,
   espaciado de 0.12em, alineado a la izquierda) según los parámetros
   documentados [8].
3. **Paleta: saturada pero no pastel, no neón.** Una paleta confiada de
   tonos joya cercana al mundo gamer (verde azulado, índigo, ámbar, coral)
   usada con mesura —el color marca estado/categoría, no cada superficie.
   Sin llegar a la dirección más plana y monocromática de TEEN, implicada
   por el rechazo de los adolescentes a los visuales "glitzy" [3]:
   PRIMARIA mantiene notablemente más color y calidez.
4. **Densidad: una tarea por pantalla con contexto visible** (tira de
   progreso, indicador pequeño de racha/avatar) —KINDER omite esto, TEEN lo
   renderizaría como estadísticas densas. La decentración significa que esta
   franja puede sostener "dónde estoy en esta sesión" junto al problema
   actual [1].
5. **Movimiento: con propósito y ágil, no reboteante.** Reducir la mascota
   con animación constante en reposo de KINDER a un valor por omisión más
   calmado (presente, estática salvo en cambios de estado) manteniendo
   animaciones rápidas de confirmación —entre el hallazgo de
   animación-como-preferencia de KINDER y la menor tolerancia inferida de
   TEEN a la decoración, por el rechazo de los adolescentes a la "pointless
   multimedia" [3].
6. **Avatares: construir para el efecto armario, no contra él.** Creación de
   avatares barata y de baja fricción, esperando que los niños se queden con
   uno solo; invertir profundidad en los rasgos que se ha demostrado que
   importan (cabello, ropa, accesorios, opciones inclusivas de tono de
   piel/cuerpo/género) por encima de la amplitud de opciones desechables
   [4][5]. Desbloquear objetos mediante el progreso, nunca con cajas de
   botín de dinero real [5].
7. **Progresión: atar los desbloqueos a la competencia, no al tiempo
   invertido.** Insignias, rachas y coleccionables se leen como
   retroalimentación de dominio (un tema aprendido, una racha de respuestas
   genuinas), con algo de elección del jugador sobre qué perseguir después,
   satisfaciendo la palanca de autonomía [10].
8. **Social: sin chat abierto, sin perfil público, sin tabla de
   clasificación visible fuera de un grupo administrado por un
   docente/padre**, solo nombre de pila o apodo —la consecuencia directa de
   COPPA para una audiencia mayoritariamente menor de 13 [9].
9. **Respuestas incorrectas: correctivas, no punitivas, más directas que en
   KINDER.** Mostrar el camino correcto (paso resuelto, ayuda visual de
   cantidad), no solo un sonido alentador —esta franja puede sostener "me
   equivoqué" y "aquí está la solución" por separado [1]; una X roja
   desnuda sin camino hacia adelante violaría la cautela derivada de la
   discalculia contra la presión sin apoyo [11].
10. **Sin temporizadores de cuenta regresiva estrictos por omisión; hacer el
    cronometraje opt-in por conjunto.** La presión de tiempo degrada el
    desempeño de los niños con sentido numérico débil, y una prevalencia de
    5-10% es lo bastante alta para perjudicar a una fracción real de
    cualquier base de usuarios del tamaño de un salón de clases [11].
11. **Entrada numérica: ajustar la modalidad al tipo de problema**, no un
    teclado universal único —toques de opción múltiple para comprobaciones
    de conceptos, toque/arrastre en una recta numérica para magnitud, un
    teclado con teclas de 48px para entrada libre de numerales— según la
    cautela de la literatura sobre discalculia contra una única vía de
    entrada forzada [11].
12. **Duración de la sesión: rondas cortas con un punto de parada visible
    cada pocos problemas** (un conjunto temático de problemas, no una sola
    pregunta) —no se encontró en esta pasada ningún referencial exacto de
    minutos por edad; tratar cualquier cifra como una decisión de producto
    informada por, no dictada por, el patrón de paciencia documentado una
    franja arriba [3].
13. **Valores por omisión de dispositivo: cambio de perfil rápido y sin
    teclear**, sin suponer un inicio de sesión personal persistente, para
    tabletas familiares compartidas o Chromebooks escolares —un requisito
    inferido, no citado, dada la brecha señalada en el §10.
14. **Incorporación: saltarse la secuencia de tutorial; enseñar a través del
    primer problema real** con andamiaje en línea (primer paso resuelto,
    botón de pista), acorde con la poca paciencia de esta franja por la
    demora [3] y la débil retención de instrucción abstracta sin un ancla
    concreta [1].

## Antipatrones a evitar

- **Los objetivos sobredimensionados de KINDER y la animación constante en
  reposo de la mascota tal cual** —se leen como de bebés para un niño de
  9-11; no los respalda la evidencia motora de esta edad [informe
  complementario, tema 20].
- **La palabra "Kids" en cualquier texto orientado a PRIMARIA** —un
  repelente documentado en adolescentes, y la renegociación de "ya no soy
  un niño chiquito" empieza antes [3].
- **Chat, perfiles públicos o tablas de clasificación sin delimitar** sin un
  grupo administrado por un padre/docente —exposición directa a COPPA para
  una audiencia mayoritariamente menor de 13 [9].
- **Compras cosméticas aleatorizadas estilo caja de botín** —un riesgo de
  monetización cercano al juego de azar con el que los niños participan más
  [5].
- **Un solo teclado tecleado obligatorio para cada problema** —contradice la
  recomendación de múltiples modalidades de entrada de la investigación
  sobre discalculia [11].
- **Temporizadores de cuenta regresiva activados por omisión** —empeora de
  forma medible el desempeño de un grupo de alta prevalencia (5-10%) [11].
- **Un tutorial largo pantalla por pantalla antes del primer problema
  real** —choca con la impaciencia ante la demora y con la débil retención
  de instrucción abstracta [1][3].
- **Retroalimentación punitiva ante respuestas incorrectas (X roja, sin
  camino hacia adelante)** —deja al niño atascado exactamente donde se
  necesita apoyo, no presión [11].
- **Suponer un inicio de sesión personal persistente como única vía de
  acceso** —ignora la realidad de los dispositivos compartidos de las
  tabletas familiares y los Chromebooks escolares, aunque este informe no
  encontró una cita directa que cuantifique esa realidad para esta franja
  exacta.

## Preguntas abiertas para el dueño del proyecto

1. ¿Debería PRIMARIA soportar una **tabla de clasificación delimitada al
   docente/salón** además de una familiar, dado que el requisito de
   consentimiento de COPPA aplica de forma distinta cuando es una escuela la
   que inscribe al niño y no un padre directamente [9]?
2. ¿Cuál es la postura de Math Challenge sobre **cualquier superficie de
   compra con dinero real** alcanzable desde la experiencia de PRIMARIA
   orientada al niño —ausente por completo, o presente tras una barrera
   parental sin mecánica aleatorizada?
3. ¿Deberían los avatares ser **compartidos/portables entre KINDER,
   PRIMARIA y TEEN** conforme el niño crece, o cada franja tiene un sistema
   separado acorde a su propio lenguaje visual?
4. Dado el efecto armario [4], ¿vale la pena **almacenar varios avatares**
   siquiera, o debería PRIMARIA ofrecer una sola ranura editable acorde al
   uso real?
5. ¿El **interruptor de tipografía amigable con la dislexia** debería
   exponerse directamente al niño, o ser configurado solo por un
   padre/docente?
6. ¿Math Challenge ya tiene un **referencial interno o licenciado de
   duración de sesión por edad** que debería anular la brecha de "no se
   encontró cifra" señalada aquí, en lugar de dejarla como una decisión
   puramente de producto?

## Fuentes

1. Wikipedia. "Piaget's theory of cognitive development" (estadio
   operacional concreto: conservación, razonamiento inductivo, decentración,
   límites del razonamiento abstracto).
   https://en.wikipedia.org/wiki/Piaget%27s_theory_of_cognitive_development
2. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for
   Young People" (franjas por edad 3-5/6-8/9-12; rechazo por nivel de grado;
   preferencia de animación; ceguera a los anuncios).
   https://www.nngroup.com/articles/childrens-websites-usability-issues/
3. Nielsen Norman Group. "Teenagers' UX: Designing Websites for Teens"
   (100 usuarios de 13-17 años, 210 sitios/30 apps; recomendación de lectura
   de 6.º grado; "Kids" como repelente; poca paciencia; rechazo al desorden).
   https://www.nngroup.com/articles/usability-of-websites-for-teenagers/
4. arXiv. "Understanding Children's Avatar Making in Social Online Games"
   (48 participantes de 8-13 años; cuatro motivaciones; el "efecto
   armario").
   https://arxiv.org/abs/2502.18705
5. Digital Wellness Lab. "Young People's Use of Avatars and Virtual
   Character Customization" research brief (expresión de identidad,
   personalización por género, estadísticas de rechazo a la
   hipersexualización, preocupaciones sobre cajas de botín).
   https://digitalwellnesslab.org/research-briefs/young-peoples-use-of-avatars-and-virtual-character-customization/
6. Frontiers in Virtual Reality. "Designing the Self: Avatar Customization,
   Identity, and Affective Experience" (82 participantes, estratificado por
   etnia; satisfacción con la personalización frente a representación).
   https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1784948/full
7. Nielsen Norman Group. "Young Users Usability Research Reports" (página
   temática: informe de 156 recomendaciones para niños de 3-12 años frente a
   informe de 124 consejos para adolescentes de 13-17).
   https://www.nngroup.com/reports/topic/young-users/
8. accessiBe. "Dyslexia-Friendly Fonts & Typography Best Practices"
   (elección de fuente, mínimo de 16px, interlineado de 1.5x, espaciado
   entre letras de 0.12em, espaciado entre palabras de 0.16em, líneas de
   45-100 caracteres, contraste WCAG 4.5:1/3:1).
   https://accessibe.com/blog/knowledgebase/dyslexia-friendly-fonts
9. Wikipedia. "Children's Online Privacy Protection Act" (umbral de menores
   de 13, definición de información personal, consentimiento parental
   verificable, restricción sobre recolección excesiva de datos).
   https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act
10. Wikipedia. "Self-determination theory" (autonomía/competencia/
    vinculación; mecánicas de recompensa intrínseca frente a extrínseca).
    https://en.wikipedia.org/wiki/Self-determination_theory
11. Understood.org. "What Is Dyscalculia" (prevalencia de 5-10%, dificultad
    con el sentido de cantidad y el mapeo de numerales, sensibilidad a la
    presión de tiempo, recomendaciones de múltiples entradas).
    https://www.understood.org/en/articles/what-is-dyscalculia
12. Apple Developer. Human Interface Guidelines — Accessibility (objetivo
    táctil mínimo de 44×44pt).
    https://developer.apple.com/design/human-interface-guidelines/accessibility

**Brechas de evidencia señaladas en este informe** (ninguna fuente consultada
abordó estos puntos para la franja de 7-11 específicamente): referenciales
exactos de duración de sesión por edad; estudios sobre la longitud del
tutorial de incorporación; medición del uso de tabletas familiares
compartidas/Chromebooks escolares; un estudio dedicado al diseño de teclado
numérico para esta edad. Las implicaciones de diseño que descansan en estas
brechas están marcadas arriba como inferidas, no citadas como un hallazgo
establecido.
