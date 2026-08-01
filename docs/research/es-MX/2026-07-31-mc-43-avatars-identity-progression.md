# Avatares, identidad y progresión para productos infantiles bajo privacidad estricta
> Investigación Math Challenge — 2026-07-31 — tema 43

## Resumen ejecutivo (ES)

Los productos infantiles serios resuelven la identidad sin datos personales
de la misma forma: **alias generados** (elegidos, no escritos) más un
**avatar de piezas prediseñadas** (nunca una foto) — como el Mii de Nintendo
[11], y lo que el proyecto ya decidió en D-003 [19]. El efecto Proteus (el
avatar cambia la conducta de quien lo porta) está replicado con un tamaño de
efecto pequeño a mediano [2][3], lo que justifica tratarlo como una palanca
real. El problema Scunthorpe —filtros que bloquean palabras inocentes por
una subcadena ofensiva— es el riesgo técnico central de generar alias en
cinco idiomas [1][10]; la solución que funciona en producción es una lista
blanca mantenida, no un filtro más estricto. Bélgica y Países Bajos
resolvieron en 2018 que las cajas de recompensa aleatorias son juego de azar
aunque el contenido sea cosmético [4] — la línea no es "cosmético vs.
jugable", es "aleatorio y pagado vs. determinista". Un compañero tipo
Tamagotchi genera retención real pero también inventó el mecanismo de culpa
que lo hizo famoso [5]. La investigación de Mayer sobre agentes pedagógicos
respalda a un personaje-guía con reservas: el efecto es modesto y depende de
las señales sociales, no de la animación [9]; la investigación de Sesame
Street y el vínculo parasocial con Elmo muestran que un personaje ya
familiar enseña mejor que uno nuevo [6][7][8] — exactamente el caso de
Larry, ya que existe en el canon de Ignia [18][19]. Roblox es la advertencia
para el texto libre sin restricción: 1,600 moderadores más IA, y el
contenido inapropiado sigue reapareciendo [13].

## Executive summary (EN)

Serious children's products solve identity the same way: **generated aliases**
(picked, not typed) plus an **avatar of pre-made parts** (never a photo) —
Nintendo's Mii [11], and what the project already decided in D-003 [19]. The
Proteus effect (an avatar changes the wearer's behavior) is replicated at a
small-to-medium effect size [2][3], justifying treating it as a real lever.
The Scunthorpe problem — filters blocking innocent words over an offensive
substring — is the central technical risk of generating aliases in five
languages [1][10]; the fix that works in production is a maintained
whitelist, not a stricter filter. Belgium and the Netherlands ruled in 2018
that randomized reward boxes are gambling even when contents are cosmetic
[4] — the line is "randomized-and-paid vs. deterministic," not
"cosmetic vs. gameplay." A Tamagotchi-style companion drives real retention
but also invented the guilt mechanic that made it famous [5]. Mayer's
pedagogical-agent research backs a character-guide with caveats: the effect
is modest and depends on social cues, not animation [9]; Sesame Street and
Elmo parasocial research show a familiar character teaches better than a new
one [6][7][8] — exactly Larry's case, since he already exists in Ignia's
canon [18][19]. Roblox is the warning for unrestricted free text: 1,600
moderators plus AI, and inappropriate content still resurfaces [13].

## Findings

### 1. Identidad sin datos personales: el patrón de la industria

Todo producto infantil/familiar importante converge en la misma solución de
dos partes: un **identificador generado o curado** en lugar de un nombre
real escrito, y un **avatar construido a partir de un conjunto cerrado de
piezas** en lugar de una fotografía. El Mii de Nintendo es el caso más
claro: los personajes se construyen seleccionando entre rasgos faciales,
peinados, accesorios y tipos de cuerpo prediseñados; incluso el modo
opcional de creación basado en foto solo *siembra* la selección de rasgos y
nunca almacena ni muestra la foto de origen, preservando "self-representation
while maintaining privacy" [11]. Duolingo permite a los usuarios construir un
avatar a partir de un guardarropa fijo de piezas cosméticas de temporada en
lugar de una imagen subida [12]. La forma de ingeniería común es:
**identidad = elección dentro de un conjunto acotado y prevalidado**, nunca
entrada libre — exactamente lo que el proyecto ya eligió en D-003 (alias
generados, sin foto, sin ciudad, tableros segmentados por nivel) [19].

### 2. El efecto Proteus: por qué el avatar no es solo decoración

La investigación de Stanford de 2007 de Yee y Bailenson acuñó el "efecto
Proteus": las personas en entornos virtuales se comportan de formas
consistentes con los rasgos implícitos de su avatar, impulsadas por la
autopercepción y la confirmación conductual, no por lo que realmente hacen
los demás [2][3]. Un metaanálisis de 46 estudios experimentales encontró que
el efecto es confiable con un tamaño "pequeño pero cercano a mediano"
(0.22–0.26) en distintos contextos — avatares más atractivos produjeron
conductas más seguras, avatares atléticos aumentaron el ejercicio, avatares
heroicos aumentaron la conducta prosocial fuera de línea [2]. Trabajo más
reciente complica el requisito de encarnación: los participantes
desarrollaron apego a los avatares incluso sin una inmersión fuerte, lo que
sugiere que el efecto no es puramente un fenómeno de RV/encarnación [2].
Lectura práctica para Math Challenge: un cosmético que señala visualmente
"matemático cuidadoso y orientado al dominio" (un birrete de erudito, una
insignia de explorador) no es solo una recompensa — puede empujar la
conducta hacia el rasgo que representa, lo que argumenta a favor de
*categorías* cosméticas ligadas a conductas de aprendizaje reales
(persistencia, precisión, curiosidad) en lugar de skins arbitrarias.

### 3. Generación segura de nombres multilingües y el problema Scunthorpe

El "problema Scunthorpe" recibe su nombre de un incidente de 1996 en el que
el filtro de AOL bloqueó a la ciudad inglesa de Scunthorpe porque su nombre
contiene una subcadena ofensiva; el mismo modo de falla ha afectado al
apellido de Craig Cockburn, a "shitake mushrooms", a los resultados de
Google SafeSearch para la ciudad y —de forma crítica para un producto de
cinco idiomas— a palabras compuestas alemanas que forman legítimamente una
subcadena ofensiva en una letra de enlace, y a nombres de lugares chinos
marcados por homonimia de caracteres [1]. El mecanismo es estructural: los
filtros ingenuos de subcadena "lack contextual understanding" [10], y la
falla se vuelve *peor* mientras más idiomas cubra un solo filtro, porque una
palabra limpia en un idioma puede ser una subcadena insegura en otro — el
propio ecosistema de moderación de China muestra el punto límite, sin una
sola lista autoritativa de palabras prohibidas ni siquiera dentro de un
idioma, así que cada plataforma mantiene su propia lista de casos límite
indefinidamente [10]. La solución probada en producción no es un algoritmo
más estricto — es una **lista blanca mantenida y registrada** de cadenas
confirmadas como seguras que un filtro ingenuo rechazaría, construida a
partir de registros reales de rechazo a lo largo del tiempo [1][10]. La
implicación directa para la *construcción* de las listas de palabras: las
listas EN/ES/FR/PT/DE deben ser autoradas por idioma por un revisor fluido,
no traducidas por máquina, porque la traducción es exactamente la operación
que convierte una palabra segura en una subcadena insegura en otro lugar
(refleja el hallazgo de D-005 de que el vocabulario matemático mismo no se
puede traducir palabra por palabra entre estos cinco idiomas [19]).

### 4. Moderación de contenido generado por usuarios — ¿deberían los niños tener texto libre en absoluto?

Roblox es el caso de estudio de mayor inversión disponible: verificación de
edad obligatoria desde enero de 2026, chat restringido a grupos por banda de
edad, y aun así "1,600+ moderators" más filtrado impulsado por IA, y una
investigación de 2020 describió los esfuerzos de retiro de contenido como
"whack-a-mole" con contenido sexual reapareciendo; un reporte de 2024
vinculó incidentes reales de depredación con "insufficient moderation", y le
siguieron al menos seis arrestos por explotación infantil vía la plataforma
desde enero de 2025 [13]. Esta no es una empresa que haya invertido de menos
— es evidencia de que **el texto libre a escala, de niños, no se puede
moderar por completo** ni siquiera con un presupuesto de confianza y
seguridad de nueve cifras. La conclusión honesta para un producto de la
escala de Math Challenge: ninguna superficie de texto libre para niños en
absoluto en v1. La selección de alias, el ensamblaje de avatar y cualquier
interacción social deberían ser de vocabulario cerrado (tocar una frase o
emoji preestablecido), nunca una caja de texto — más estricto que la mayoría
de los competidores, pero la única postura que no hereda la deuda de
moderación de Roblox.

### 5. Progresión cosmética vs. juego de azar: la línea regulatoria

La Comisión de Juegos de Bélgica resolvió en 2018 que las cajas de botín en
FIFA 18, Overwatch y CS:GO eran juegos de azar bajo la ley de juego, sin
importar que el contenido fuera solo cosmético — el no poder comprar el
ítem específico directamente lo hace basado en el azar — y el ministro de
justicia enmarcó la preocupación explícitamente en torno a los niños [4]. La
autoridad de juegos de los Países Bajos llegó a una conclusión similar ese
mismo año para varios (no todos) los títulos estudiados, citando un diseño
que fomenta la adicción incluso por debajo del umbral de aplicación legal
[4]. El Reino Unido tomó la posición más estrecha de que los ítems solo
cosméticos, no intercambiables y no canjeables por dinero quedan fuera del
juego de azar sujeto a licencia, pero su propia revisión de DCMS de 2022 aun
así encontró niveles elevados de "gambling, mental health, financial and
problem gaming-related harms" entre los jugadores de cajas de botín, y
empujó por autorregulación en lugar de un cambio de ley [4]. Leído en
conjunto, el centro de gravedad regulatorio es: **la aleatorización más el
pago es el detonante, no la distinción cosmético/jugable** — una compra
determinista (comprar este sombrero específico) es segura donde sea que
apliquen estos fallos; una caja aleatoria pagada está en disputa incluso
cuando es puramente cosmética. Para un producto infantil esto argumenta a
favor de ir más allá del fallo actual más estricto: **ninguna recompensa
aleatoria de ningún tipo**, pagada o gratis, ya que el mecanismo que
preocupa a los reguladores (el refuerzo de razón variable) no necesita
dinero para funcionar en un niño.

### 6. Ciclos de cuidado de compañero/mascota: poder de retención y el mecanismo de culpa

Tamagotchi (1996) es el caso de referencia: tres medidores (hambre,
felicidad, entrenamiento) que decaen sin atención, con la muerte real como
el estado de fracaso [5]. Produjo un enganche extraordinario —40 millones de
unidades en dos años— precisamente porque el descuido tenía una consecuencia
real y perturbadora: los niños llevaban los dispositivos a la escuela para
evitar la muerte a mitad de clase, las escuelas los prohibieron por
disrupción, y la prensa de la época reportó duelo genuino, incluyendo
funerales simulados para las mascotas "muertas" [5]. El mecanismo de
retención y el patrón oscuro son el mismo mecanismo — el dispositivo no
funciona como compañero sin una amenaza, y la amenaza produjo tanto el
enganche como el rechazo. Una función de compañero puede tomar prestado el
ciclo de *cuidado* (alimentar, vestir, interactuar) sin el ciclo de
*pérdida*: etapas de crecimiento y desbloqueos cosméticos ligados a la
propia práctica de matemáticas del niño, sin estado de decaimiento, sin
muerte, sin notificación enmarcada en torno a la angustia del compañero —
conservando el mecanismo de construcción de afecto mientras se descarta el
mecanismo de culpa que hizo al original tan querido como controvertido.

### 7. Investigación de agentes pedagógicos — por qué importa el formato de Larry, no solo su existencia

La investigación de aprendizaje multimedia de Mayer sobre agentes
pedagógicos encuentra un soporte real pero modesto: los agentes ayudan
principalmente como "presenter of social cues", y un metaanálisis reciente
encontró solo una "negligible improvement" a partir de la mera presencia del
agente — las ganancias vienen de *lo que hace el agente* (resaltar,
personalizar, voz humanoide), no de tener un personaje en absoluto [9]. Los
agentes con rol de tutor no muestran una ventaja clara sobre las lecciones
sin agente; los agentes enmarcados como compañeros de aprendizaje elevan la
autoeficacia de forma más confiable; la representación estática frente a
animada sigue siendo una pregunta abierta y contradictoria [9]. Esto
converge con la propia historia de investigación de Sesame Street: los
estudios de ETS de 1970-71 encontraron que los espectadores más frecuentes
aprendían más sin importar la desventaja, y un análisis económico de 2019
(Kearney y Levine) lo llamó "perhaps the biggest, yet least costly, early
childhood intervention" [6]. Debajo de eso está la investigación de vínculo
parasocial: el equipo de Calvert encontró que niños de 21 meses aprendían
mejor una tarea de secuenciación de un personaje *familiar* (Elmo) que de
uno desconocido, y que darles a los niños un juguete del personaje
desconocido primero —para que se volviera familiar— cerraba la brecha; los
personajes personalizados profundizaban aún más el enganche, ya que
"perceived similarities increase children's interest and investment" [7][8].
Esto favorece a Larry tal como ya se decidió en D-004: no es un personaje
nuevo sino el rinoceronte naranja ya existente de Ignia, así que la
familiaridad que la investigación de Calvert dice que impulsa el aprendizaje
ya está ganada, no es algo que construir desde cero [18][19]. El corolario:
las reglas de canon de Larry (nunca se burla del niño, "¡Ya vas!" solo al
aceptar una tarea) importan más que su diseño visual — la ganancia está en
la conducta de señales sociales, no en el modelo del personaje [9][18].

### 8. Visualizar el progreso para los niños — mapas, árboles y el efecto del gradiente de meta

El efecto del gradiente de meta —el esfuerzo se acelera a medida que se
reduce la distancia percibida a una meta— está bien establecido en la
literatura de economía conductual/marketing ("resurrección" de Kivetz,
Urminsky y Zheng de la hipótesis original de Hull, en contextos de programas
de lealtad) [14]. Las revisiones de aprendizaje gamificado anotan que los
aprendices visuales específicamente "benefit from... progress bars, game
maps, and colorful visuals" para la motivación, mientras advierten que los
puntos/insignias/tablas de posiciones usados de forma aislada no son
confiablemente efectivos — funcionan cuando están ligados a señales reales
de competencia, no como decoración [15]. Esto coincide con la propia
investigación de banda PRIMARY del proyecto: un estudio del "efecto
guardarropa" encontró que los niños construyen varios avatares pero
convergen en usar uno solo, lo que significa que el *proceso* de
personalizar lleva el valor motivacional incluso cuando el artefacto final
es estrecho [16]; la investigación de banda KINDER encontró que los niños
pequeños "expect feedback on every single action" y responden a la
animación consistente de la mascota de una forma que los adultos
explícitamente no [17]. La propia historia de Duolingo es un dato de
advertencia sobre *qué* metáfora de progreso elegir: reemplazó su mapa de
habilidades en forma de árbol por un camino lineal en agosto de 2022, lo que
provocó un rechazo visible y sostenido de los usuarios [12] — evidencia de
que la metáfora de árbol/mapa en sí llevaba un valor motivacional que la
línea recta no reemplazó.

## Design implications

1. **El generador de alias se autora por idioma, no se traduce.** Construir
   cinco listas de palabras independientes (EN/ES/FR/PT/DE) con un revisor
   fluido por idioma, combinando una palabra de categoría + una palabra de
   rasgo + un número de dos dígitos aleatorizado (no secuencial). Nunca
   derivar la lista de un idioma traduciendo la de otro — esa es exactamente
   la operación que crea fallas tipo Scunthorpe [1][10].
2. **La selección de alias es solo por toque para edades 3-11 (KINDER +
   PRIMARY).** El niño elige entre 3-5 opciones generadas; no hay campo de
   texto donde escribir, lo que elimina la superficie de inyección para las
   bandas de edad menos capaces de automoderarse. TEEN (12-17) obtiene un
   reroll limitado pero tampoco escribe nunca.
3. **Validar la cadena renderizada combinada, no cada palabra por separado,
   y registrar cada rechazo/regeneración** (palabras, idioma, locale,
   motivo). Dos palabras limpias pueden combinarse en una insegura al cruzar
   un límite de idioma; una lista blanca registrada de cadenas confirmadas
   como seguras, construida a partir de esos registros, es la solución real
   de producción para el problema Scunthorpe, no un filtro más estricto
   [1]. Limitar la tasa de regeneración (p. ej., un pequeño número de
   rerolls al día) para que un niño no pueda forzar por fuerza bruta una
   combinación que pase el filtro.
4. **Ningún campo de texto libre en ningún lugar al que pueda llegar un
   niño menor de 13 años** — sin biografía, sin chat, sin etiqueta
   personalizada. Cualquier interacción de niño a niño (reacciones,
   felicitaciones) es un conjunto cerrado de frases/emoji preestablecidos,
   según la lectura honesta del historial de moderación de Roblox incluso a
   escala [13].
5. **Avatar = solo piezas prediseñadas, al estilo Mii.** Sin subir fotos,
   sin acceso a cámara, nunca. Las piezas están organizadas en categorías
   (cabello, expresión, accesorio) desbloqueadas como cosméticos, no
   escritas ni dibujadas.
6. **Los cosméticos se desbloquean en una tabla determinista y publicada**
   ligada a hitos de dominio, rachas o posición en la liga — p. ej.,
   terminar una unidad de tema desbloquea un ítem específico con nombre.
   Ninguna caja, cofre, paquete o recompensa "misteriosa" de ningún tipo,
   gratis o pagada — más estricto que la propia excepción cosmética del
   Reino Unido y completamente fuera de la línea de Bélgica/Países Bajos
   [4]. Si la monetización llega a tocar los cosméticos, es solo compra
   directa de un ítem con nombre y previsualizado, nunca una compra
   aleatorizada.
7. **Una función de compañero/mascota (si se construye) no tiene estado de
   decaimiento, hambre o muerte**, y no envía ninguna notificación
   enmarcada en torno a la tristeza o el abandono del compañero — conservar
   el ciclo de construcción de afecto, descartar el ciclo de culpa de
   Tamagotchi [5]. Del mismo modo, **la pérdida de racha nunca borra ni hace
   retroceder visualmente el mapa de progreso** — un día perdido no debería
   deshacer retroactivamente el progreso ganado, evitando un segundo
   mecanismo de culpa apilado sobre el primero.
8. **La visualización del progreso está segmentada por edad, no es una sola
   apariencia para todas las edades:** KINDER — un camino de viaje físico
   con la mascota caminando hacia adelante, sin números; PRIMARY — un árbol
   de habilidades/mapa de dominio con temas nombrados (no una línea recta —
   el propio cambio de Duolingo en 2022 alejándose de un árbol provocó un
   rechazo visible [12][15]); TEEN — un tablero de estadísticas con una
   liga opt-in; ADULT — métricas de dominio numéricas simples, apariencia
   gamificada opcional y apagada por defecto (según los hallazgos de
   adultos/expertos de mc-23).
9. **La presencia de Larry está segmentada por edad, según la arquitectura
   de prompt ya existente de mc-37:** KINDER — animado, primero por voz,
   reacciona a cada intento; PRIMARY — mismo personaje, explica el error
   conceptual según las reglas duras ya fijadas en D-004; TEEN — mismo
   rinoceronte, el tono se desplaza hacia "profesor paciente", menos
   animaciones, opción de desactivar disponible; ADULT — Larry disponible a
   solicitud pero relegado detrás de una UI de retroalimentación más densa
   [9][18].
10. **Larry nunca comenta sobre el alias o la elección de avatar del
    niño.** Su voz canónica se mantiene en matemáticas, nunca en apariencia
    o identidad — extiende la regla de D-004 de "nunca avergonzar a un
    niño" a un lugar donde la vergüenza podría colarse de otro modo (un bot
    que "elogia" un nombre implícitamente también puede juzgar uno)
    [18][19].
11. **Las categorías cosméticas señalan rasgos de aprendizaje** que la
    investigación del efecto Proteus dice que pueden influir en la conducta
    (persistencia, curiosidad, cuidado) — p. ej., una línea de insignias de
    "explorador" por intentar problemas difíciles — en lugar de decoración
    arbitraria, ya que el avatar tiene un eco conductual pequeño pero real
    sobre quien lo porta [2][3].
12. **La identidad de alias/avatar nunca es derivable de la cuenta del
    padre**, el correo, o el nombre real del niño en la UI — un sufijo
    numérico debería ser aleatorizado, no secuencial, ya que si no
    "Bunny07" implica el orden de registro.

## Preguntas abiertas para el dueño del proyecto

1. ¿Debería existir en absoluto el conjunto de reacciones de vocabulario
   cerrado (emoji/frases preestablecidas) en v1, o es "ninguna interacción
   de niño a niño de ningún tipo" la opción predeterminada más segura hasta
   que haya presupuesto de moderación para respaldar incluso un conjunto
   cerrado?
2. ¿Está un compañero tipo Tamagotchi en el alcance de este producto en
   absoluto, o el riesgo del ciclo de culpa (§6) argumenta a favor de
   omitir la función por completo en lugar de intentar construir una
   versión "segura" de ella?
3. Para el árbol de habilidades de banda PRIMARY: ¿debería el orden de
   temas ser estrictamente lineal (coincide con la secuenciación actual del
   currículo) o permitir exploración ramificada (coincide con el hallazgo
   del "efecto guardarropa" de que los niños valoran la elección incluso
   cuando convergen en un solo camino)?
4. ¿Deberían las tablas de desbloqueo cosmético ser visibles para el niño
   de antemano (transparencia total: "termina fracciones para desbloquear
   este sombrero") o revelarse solo al desbloquear (sorpresa, pero más
   cercano en espíritu al mecanismo que escrutan los reguladores incluso
   sin aleatoriedad)?
5. ¿Obtienen los alias de banda TEEN un grado extra de libertad (p. ej., un
   número autoelegido, aún validado) frente al conjunto totalmente generado
   de PRIMARY/KINDER, o se mantiene el mismo mecanismo de solo-toque hasta
   los 17 años?
6. ¿Deberían construirse las listas de palabras de alias internamente por
   idioma, o hay presupuesto/apetito para licenciar un conjunto de datos
   multilingüe de palabras prohibidas/seguras ya mantenido, en lugar de
   autorar cinco listas desde cero?

## Fuentes

1. Wikipedia — Scunthorpe problem. https://en.wikipedia.org/wiki/Scunthorpe_problem
2. Wikipedia — Proteus effect. https://en.wikipedia.org/wiki/Proteus_effect
3. Yee, N. y Bailenson, J. (2007). "The Proteus Effect: The Effect of
   Transformed Self-Representation on Behavior." Human Communication
   Research, 33(3). Estudio original subyacente a [2]; no reconsultado en
   vivo.
4. Wikipedia — Loot box (historial regulatorio: Bélgica, Países Bajos, DCMS
   del Reino Unido). https://en.wikipedia.org/wiki/Loot_box
5. Wikipedia — Tamagotchi. https://en.wikipedia.org/wiki/Tamagotchi
6. Wikipedia — Sesame Street research. https://en.wikipedia.org/wiki/Sesame_Street_research
7. Wikipedia — Parasocial interaction. https://en.wikipedia.org/wiki/Parasocial_interaction
8. Lauricella, A., Gola, A. y Calvert, S. (2011). "Toddlers' learning from
   socially meaningful video characters." Media Psychology, 14(2). Estudio
   primario referenciado en [7]; no reconsultado en vivo.
9. Wikipedia — Pedagogical agent. https://en.wikipedia.org/wiki/Pedagogical_agent
10. Wikipedia — Profanity filter. https://en.wikipedia.org/wiki/Profanity_filter
11. Wikipedia — Mii. https://en.wikipedia.org/wiki/Mii
12. Wikipedia — Duolingo. https://en.wikipedia.org/wiki/Duolingo
13. Wikipedia — Roblox (historial de seguridad/moderación). https://en.wikipedia.org/wiki/Roblox
14. Kivetz, R., Urminsky, O. y Zheng, Y. (2006). "The Goal-Gradient
    Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal
    Progress, and Customer Retention." Journal of Marketing Research,
    43(1). Literatura establecida; no reconsultada en vivo.
15. Wikipedia — Gamification of learning. https://en.wikipedia.org/wiki/Gamification_of_learning
16. Interno — `math-challenge/docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
    §3 (estudio del "efecto guardarropa" del avatar, marco de la teoría de
    la autodeterminación).
17. Interno — `math-challenge/docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
    §5, §7 (preferencia de mascota/animación, hallazgo de retroalimentación
    en cada acción).
18. Interno — `math-challenge/docs/research/2026-07-31-mc-37-larry-profe-port.md`
    (reglas duras de Larry, arquitectura de prompt, tono por banda de edad).
19. Interno — `math-challenge/docs/decisions.md` D-003 (alias generados),
    D-004 (Larry), D-005 (cinco idiomas).
