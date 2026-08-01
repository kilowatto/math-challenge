# Clubs, retos de grupo y prendas: cómo tener apuestas sin perdedor y sin exposición regulatoria

> Math Challenge research — 2026-07-31 — topic 46

## Resumen ejecutivo (ES)

- **El juego ilegal se define, en prácticamente toda ley estatal de EE.UU., por tres elementos: premio, azar y consideración — y los tres deben estar presentes** [1]. Basta eliminar uno para quedar fuera. La estrategia estándar de la industria de sorteos es exactamente esa: quitar al menos un elemento [1].
- **El azar ya está ausente aquí.** Un reto matemático se gana por habilidad, no por suerte. La formulación jurídica que aplica es la de los concursos de destreza, donde *«los ganadores no se eligen por azar sino con base en algún criterio medible»* [1].
- **La consideración se elimina si la plataforma no toca nada de valor.** Consideración significa *«pago de dinero o de algo valioso para entrar, o el requisito de hacer una compra»* [1]. Si Math Challenge no cobra por entrar a un reto, no retiene, no transfiere y no hace cumplir nada, no hay consideración hacia la plataforma.
- **El premio también se puede minimizar:** premios intangibles como *«derecho a presumir»* tienen valor monetario mínimo y pueden no alcanzar el umbral legal de "premio" [1].
- **Strava ya resolvió la apuesta sin perdedor, y funciona.** Su modo *Group Goal* deja al grupo perseguir una meta compartida y —en su propia documentación— *«no tiene tabla de clasificación, así que terminas comparándote menos con los demás»* [2][3]. Convive con los retos competitivos como un modo alterno, no como sustituto.
- Strava ofrece cuatro tipos de reto de grupo: *Most Activity*, *Fastest Effort*, *Longest Single Activity* y *Group Goal* — solo el último es cooperativo [2][3].
- **El estándar real de salvaguarda en deportes juveniles** exige verificación de antecedentes a *«cualquier voluntario con oportunidad de contacto no supervisado o uno a uno con menores»*, más una persona nombrada como contacto de salvaguarda conocida por todos [4][5]. La palabra que importa es **no supervisado**.
- No podemos realizar verificación de antecedentes, pero sí podemos **diseñar para que no exista contacto no supervisado**: sin chat, sin canal privado, con el propietario del club viendo únicamente alias y puntos, y con el padre o tutor de cada niño aprobando la entrada.
- **Ningún menor entra jamás a un reto con prenda.** Eso mantiene todo el análisis de juego lejos de los niños, donde la exposición regulatoria documentada en `mc-17` (Bélgica, Países Bajos, DSA, Children's Code) sería severa.
- **Larry modera el texto de la prenda antes de que exista**, con criterio de juego entre adultos: pasa la broma, no pasa el sexo, la violencia ni lo denigrante — y no pasa nada que señale a una persona. Es una llamada distinta a la del tutor, con su propio prompt, su propio registro y comportamiento a prueba de fallos.
- Conclusión de diseño: **dos sistemas separados en la capa de datos** — `grupo_infantil` (aula + club de padres, reglas idénticas) y `club_adulto` (con retos y prendas) — para que una función añadida a «los clubes» no pueda aparecer por descuido sobre menores.

## Executive summary (EN)

- **Illegal gambling is defined, across virtually all US state law, by three elements — prize, chance, and consideration — and all three must be present** [1]. Removing one is sufficient. That is precisely the standard sweepstakes-industry strategy: eliminate at least one element [1].
- **Chance is already absent here.** A math challenge is won on skill. The applicable framing is the skill‑contest one, where *«winners are not selected by chance but instead chosen based on some measurable criteria»* [1].
- **Consideration is eliminated if the platform never touches anything of value.** Consideration means *«payment of money or something valuable to enter, or a requirement that a purchase must be made»* [1]. If Math Challenge charges nothing to enter, escrows nothing, transfers nothing, and enforces nothing, there is no consideration flowing to the platform.
- **Prize can be minimized too:** intangible rewards such as *«bragging rights»* carry minimal monetary value and may not meet the legal threshold for a prize [1].
- **Strava already shipped the loser‑free wager, and it works.** Its *Group Goal* mode lets a group chase a shared target and — per its own documentation — *«doesn't have a ranked leaderboard so you end up comparing yourself to others less»* [2][3]. It coexists with competitive challenges as an alternate mode, not a replacement.
- **The real youth‑sports safeguarding standard** requires background checks for *«any volunteer with the opportunity for unsupervised or one‑on‑one contact with minors»*, plus a named safeguarding contact known to everyone [4][5]. The load‑bearing word is **unsupervised**.
- We cannot run background checks, but we can **design so no unsupervised contact exists**: no chat, no private channel, club owner sees only alias and points, and each child's own parent approves the join.
- **No minor is ever in a challenge with stakes.** That keeps the entire gambling analysis away from children, where the regulatory exposure documented in `mc-17` would be severe.
- **Larry moderates the stake text before it exists**, with adult‑game judgment: the joke passes; sex, violence, and degradation do not — and nothing that singles out a person does. It is a separate call from the tutor's, with its own prompt, audit log, and fail‑closed behavior.
- Design conclusion: **two separate systems at the data layer** — `grupo_infantil` and `club_adulto` — so a feature added to "clubs" cannot land on children by accident.

## Findings

### 1. Los tres elementos, y cómo se elimina uno

Thompson Coburn LLP resume el marco que gobierna todo esto: prácticamente toda ley estatal define el juego ilegal como la presencia simultánea de **premio, azar y consideración**, y **los tres deben estar presentes** para que una promoción califique como juego ilegal [1]. La estrategia entera de la industria de sorteos consiste en asegurarse de eliminar al menos uno.

Cómo se elimina cada uno, según la misma fuente [1]:

- **Premio.** Difícil de eliminar por completo, pero recompensas intangibles como *«derecho a presumir»* o la designación de ganador semanal tienen valor monetario mínimo y **pueden no alcanzar el umbral legal** de «premio».
- **Azar.** Se convierte el sorteo en un concurso de destreza, donde *«los ganadores no se eligen por azar sino con base en algún criterio medible»*. Alternativamente, se estructura como regalo donde todos reciben algo.
- **Consideración.** Es el que más comúnmente se elimina. Incluye *«el pago de dinero o de algo valioso para entrar, o el requisito de que se deba hacer una compra»*. Notablemente, exigir que alguien **envíe sus datos de contacto no es consideración** — de ahí que las vías de entrada gratuita sean estándar en el diseño de sorteos. La distinción legal depende de si el participante debe hacer algo **más allá del comportamiento normal de cliente** para entrar.

**Dónde queda Math Challenge.** El azar está ausente por la naturaleza del producto: resolver retos matemáticos es un criterio medible de destreza, no suerte. La consideración está ausente mientras la plataforma no cobre por entrar a un reto ni retenga, transfiera o haga cumplir nada de valor. Y con las formas de prenda propuestas abajo (§3), el premio se reduce a agencia o a una experiencia compartida, es decir, cerca del umbral de «derecho a presumir».

**Faltan dos de tres, posiblemente los tres.** Pero esa posición depende **enteramente** de que la plataforma nunca toque valor. El día que Math Challenge retenga 20 $ de cada participante, aparece la consideración y el análisis se invierte por completo. Esa es la línea, y no es difusa.

### 2. El precedente que ya existe: Strava Group Goal

Strava opera cuatro tipos de reto de grupo: *Most Activity* (quien acumule más tiempo, distancia o desnivel), *Fastest Effort* (ritmo medio), *Longest Single Activity*, y *Group Goal* (perseguir un objetivo compartido como grupo) [2][3]. Los primeros tres son competitivos con tabla de posiciones; el cuarto no.

La descripción de Strava del modo cooperativo es la observación de diseño más útil de toda esta investigación: *«Si competir con tus amigos no es tu estilo, puedes crear un reto de Group Goal para ir avanzando juntos hacia un objetivo compartido. Esta versión del reto grupal **no tiene tabla de posiciones, así que terminas comparándote menos con los demás**»* [3].

Dos lecturas importan. Primero, **la ausencia de tabla es la función, no una limitación** — es lo que hace que el modo sirva a quien la competencia desmotiva, que es exactamente la población que `mc-18` identifica como la que se desengancha en el fondo del tablero. Segundo, **Strava lo ofrece junto a los competitivos, no en lugar de**: la elección de modo la hace el organizador del reto según su grupo. Análisis de la propia plataforma señalan que los retos grupales priorizan la conexión sobre la competencia pura y sostienen la comunidad [2].

Esto conviene con lo que ya está en `mc-18`: el meta‑análisis de Johnson & Johnson (122 estudios, 286 hallazgos) encuentra que las estructuras cooperativas superan consistentemente a las competitivas e individualistas tanto en logro como en relaciones entre pares.

### 3. Qué hace divertida una apuesta, descompuesto

Antes de proponer formas, vale descomponer qué produce el disfrute de una apuesta social. Cuatro cosas: que **todos tengan algo en juego**, que **el resultado importe**, que **quede una anécdota**, y que **el grupo haya hecho algo junto**.

**Ninguna de las cuatro requiere un perdedor.** El castigo al último no es el ingrediente activo — es una consecuencia de asumir, sin examinarlo, que la prenda tiene que caer sobre alguien. De esa observación salen tres formas que conservan las cuatro propiedades:

**A · Prenda colectiva.** El grupo se compromete junto contra un objetivo compartido. Se gana o no se gana en grupo. Es el *Group Goal* de Strava aplicado a puntos de matemáticas, con el respaldo cooperativo de Johnson & Johnson.

**B · El ganador elige.** Se invierte la dirección del premio: el primer lugar no recibe tributo de los demás, sino que **decide** algo para el grupo — el próximo reto, el objetivo del club, el lugar a donde van. El premio es **agencia, no tributo**. Legalmente es la forma más limpia, porque decidir no tiene valor monetario y roza el umbral de «derecho a presumir» que [1] señala como probablemente insuficiente para constituir premio.

**C · Compromiso propio.** Cada quien se apuesta contra su propia meta, públicamente. Es la forma mejor respaldada por evidencia: son las intenciones de implementación de Gollwitzer ya documentadas en `mc-19`, con efectos grandes y replicados (100 % vs. 53 % de cumplimiento en autoexámenes; 4,2 kg vs. 2,1 kg de pérdida de peso). Es también, no por casualidad, el mecanismo con el que HealthyWage sostiene que no es juego: su argumento público es que **el usuario controla el resultado en todo momento** [6].

### 4. La propiedad estructural que hace innecesaria la moderación

Las tres formas comparten algo que vale más que cualquier regla de moderación: **ninguna tiene una casilla de perdedor**.

- En la prenda colectiva, el texto describe lo que hace **el grupo**.
- En «el ganador elige», lo escribe **quien ganó**, sobre lo que sigue.
- En el compromiso propio, solo se puede escribir **sobre uno mismo**.

En ninguna de las tres existe un campo que responda a «¿qué le pasa al último?». Esto significa que **el texto libre puede existir sin que la humillación tenga dónde aterrizar**: no es que se prohíba escribirla, es que no hay ranura en el modelo de datos donde ponerla. Es la misma lógica estructural con la que `mc-43` resuelve los alias (elección dentro de un conjunto acotado en vez de entrada libre), aplicada un nivel más arriba: en vez de acotar el vocabulario, se acota **el objeto sobre el que el texto puede hablar**.

**Riesgo residual, dicho de frente.** Esto no es hermético. Alguien puede escribir, dentro de una prenda colectiva, «vamos por tacos y Juan se rapa». Lo que la estructura garantiza es que el sistema nunca *designe* a Juan, nunca lo señale y nunca lo haga cumplir — la prenda sigue siendo del grupo. Ese hueco es el que cierra Larry en §5, y lo que queda después se mitiga por procedimiento: la prenda es visible **antes** de que empiece el reto, **todos los miembros la aceptan explícitamente** para quedar dentro, cualquiera puede salirse sin penalización, no se puede editar una vez arrancado, y hay botón de informe permanente. Con eso, nadie queda sujeto a una prenda que no leyó y aceptó.

### 5. Larry como moderador de prendas

**Decisión del dueño:** el texto libre de las prendas lo revisa Larry antes de que la prenda exista, con criterio explícito de **juego entre adultos** — la broma pasa; el sexo, la violencia y lo denigrante no.

**Esto no rompe el canon de "Larry nunca calcula".** Esa regla, documentada en `mc-37` y D-004, existe por una razón específica: un tutor que recalcula matemáticas se equivoca y enseña error. Juzgar si un texto es denigrante es una tarea distinta, y es de las que los modelos de lenguaje hacen bien. Lo que sí se hereda es que **es otra llamada, no la misma**: prompt propio, modelo propio, bitácora propia, y ninguna relación con el endpoint del tutor.

**El criterio que Larry aplica**, en orden de precedencia:

1. **¿Señala a una persona?** Una prenda que nombra a un individuo como quien carga la consecuencia se rechaza, aunque venga en tono de broma. Es la única regla que no admite matiz, porque es la que sostiene la línea roja del producto.
2. **¿Hay sexo, violencia o denigración?** Se rechaza. Incluye lo que degrada por apariencia, peso, origen, capacidad o cualquier característica de una persona — el canon de Larry ya prohíbe que el humor vaya sobre características de las personas (`mc-37`), y aquí se extiende de lo que Larry *dice* a lo que Larry *deja pasar*.
3. **¿Es un juego entre adultos?** Si pasa 1 y 2, **pasa**. Larry no es un censor de buen gusto: "el que gana escoge el bar", "el club paga la primera ronda", "el ganador elige la playlist un mes" son prendas legítimas y Larry no tiene por qué opinar sobre ellas.

**El tono al rechazar importa tanto como el rechazo.** Larry no sermonea. `mc-11` es explícito en que la retroalimentación dirigida a la persona en vez de a la tarea es el mecanismo por el cual más de un tercio de las intervenciones estudiadas **empeoran** el resultado — y aunque ese hallazgo es sobre aprendizaje, el mecanismo social es el mismo: un rechazo moralizante convierte a un adulto en adversario del producto. Larry rechaza breve, en personaje, sin lección: *"Esa se la voy a tener que rebotar — deja al grupo entero en la prenda, no a uno solo. ¿Le damos otra vuelta?"*

**Comportamiento a prueba de fallos.** Si la llamada de moderación falla o expira, la prenda **no se publica**. Se muestra que Larry no pudo revisarla y se ofrece reintentar. Nunca se publica texto sin revisar bajo ninguna condición de error — el modo de falla barato es un usuario molesto, el modo de falla caro es una humillación publicada que el producto prometió que no podía ocurrir.

**Ruteo y coste.** El volumen es trivial comparado con el del tutor: una llamada por prenda creada, no por intento. Haiku 4.5 alcanza para el caso claro, con escalada a Sonnet 5 cuando el veredicto sea de baja confianza — el matiz entre "broma entre amigos" y "denigración" es justo donde un modelo chico se equivoca en ambas direcciones. Con el ruteo de D-015 y el tope de gasto de AI Gateway, esto no mueve la aguja del presupuesto.

**Falsos positivos y apelación.** Larry se va a equivocar, y va a rechazar bromas legítimas. Sin vía de apelación, eso se siente como censura y es la queja que va a llegar. Toda prenda rechazada debe poder mandarse a revisión humana con un toque, y esa cola necesita dueño y tiempo de respuesta comprometido — la misma cola de los reportes.

**Bitácora.** Cada decisión se registra: texto propuesto, veredicto, modelo, motivo y confianza. Sirve para tres cosas: afinar el prompt con casos reales, resolver apelaciones con evidencia, y detectar a quien insiste en pasar lo mismo diez veces con variantes.

### 6. Los clubs de padres y el estándar real de salvaguarda

La literatura de deportes juveniles es la referencia más cercana a "un adulto organiza una actividad para niños ajenos". El estándar general que reporta: se requiere verificación de antecedentes para *"cualquier voluntario con oportunidad de contacto no supervisado o uno a uno con menores"* — incluyendo a padres coordinadores que organizan actividades o gestionan comunicaciones que involucran contacto con niños [4][5]. Una verificación mínima cubre antecedentes penales federales y registro de ofensores sexuales; se recomienda repetirla cada año o cada temporada, con consentimiento escrito previo [4][5]. Y estructuralmente: debe existir **una persona nombrada, cuyo nombre y contacto conozcan todos**, como primer punto de contacto ante cualquier preocupación de salvaguarda [5].

**Math Challenge no puede correr verificación de antecedentes**, y fingir lo contrario sería peor que no hacerlo. Pero la definición misma señala dónde está el riesgo: **contacto no supervisado**. La salida de diseño es eliminar la categoría entera:

- **Sin chat y sin mensajes directos, en ninguna dirección, nunca.** Ya es la regla para maestros (D-011); se extiende idéntica a clubs.
- **El dueño del club ve exclusivamente alias, puntos y racha.** Ni nombre real, ni edad exacta, ni foto, ni otro grupo al que el niño pertenezca.
- **El padre de cada niño aprueba la entrada**, y ve la identidad declarada del dueño antes de aprobar — el patrón invertido de ClassDojo que `mc-28` identifica como el único mecanismo de seguridad confirmado en la industria.
- **Se invita compartiendo un código con los padres**, nunca buscando ni contactando niños.
- **Tope duro más chico que un aula**: un club es un grupo de amigos, no una escuela.
- **Botón de reporte permanente** y bitácora completa de altas, aprobaciones y bajas.

La afirmación honesta que sale de esto: **un club de padres es seguro precisamente porque es anémico**. Es un tablero compartido, no un espacio social. Cada vez que alguien proponga agregarle chat, fotos o perfiles, la respuesta ya está escrita aquí, con su razón.

### 7. Por qué dos sistemas y no uno con bandera

`grupo_infantil` (que cubre salón de maestro y club de padres, con reglas de seguridad idénticas) y `club_adulto` (con retos y prendas) deben ser **estructuras separadas en la base de datos**, no una tabla con un campo `tipo`.

La razón no es de modelado sino de modo de falla. Con una sola tabla, el día que alguien agregue texto libre, mensajes o subida de imágenes a "los clubs", esa función aterriza por defecto también sobre los grupos infantiles, y la protección depende de que quien escriba ese código recuerde la regla. Con dos estructuras, agregar texto libre al club de adultos **no puede** tocar a los niños aunque nadie recuerde nada. Es la diferencia entre una convención y un candado.

## Tabla de formas de prenda

| Forma | Quién carga la consecuencia | Tabla de posiciones | Respaldo | Elemento legal que elimina |
|---|---|---|---|---|
| **A · Colectiva** | Todo el grupo, conjuntamente | No (por diseño) | Strava Group Goal [2][3]; Johnson & Johnson vía `mc-18` | Premio (experiencia compartida, sin transferencia) |
| **B · El ganador elige** | Nadie; el primero gana agencia | Sí | Thompson Coburn sobre premios intangibles [1] | Premio (decidir no tiene valor monetario) |
| **C · Compromiso propio** | Uno mismo, contra su propia meta | Opcional | Gollwitzer vía `mc-19`; postura de HealthyWage [6] | Azar (controlas tu resultado por completo) |
| ~~Castigo al último~~ | ~~El que quedó atrás~~ | — | **Prohibido**: línea roja #7, `mc-18` sobre daño en el fondo del tablero | — |
| ~~Tributo entre miembros~~ | ~~Los perdedores pagan al ganador~~ | — | **Prohibido**: crea premio + transferencia de valor entre personas | — |

## Implicaciones de diseño

1. **Ningún menor entra jamás a un reto con prenda.** Los grupos infantiles tienen metas y celebraciones; las prendas viven exclusivamente en `club_adulto`. Esto excluye a los niños de todo el análisis de §1.  
2. **La plataforma nunca toca valor**: no cobra por entrar a un reto, no retiene, no transfiere, no arbitra y no hace cumplir. La prenda es un acuerdo social que el producto muestra, no una obligación que el producto administra. Es la única condición que sostiene la posición de §1.  
3. **Las tres formas de prenda (A, B, C) se implementan como tipos distintos**, no como variantes de texto de un mismo objeto — porque cada una tiene un sujeto gramatical distinto (el grupo, el ganador, uno mismo) y es esa diferencia la que elimina la casilla de perdedor (§4).  
4. **No existe ningún campo que pregunte qué le pasa al último**, en ninguna forma, en ninguna pantalla, en ninguna API.  
5. **Larry revisa toda prenda de texto libre antes de que se cree**, con el criterio de tres pasos de §5: señalar a una persona se rechaza siempre, sexo/violencia/denigración se rechazan, y todo lo demás pasa sin que Larry opine.  
6. **La moderación es una llamada separada de la del tutor** — prompt propio, bitácora propia, ruteo propio (Haiku 4.5 con escalada a Sonnet 5 en baja confianza). No comparte endpoint ni prompt con Larry Profe.  
7. **A prueba de fallos: si Larry no puede revisar, la prenda no se publica.** Nunca hay texto sin revisar en producción, bajo ninguna condición de error.  
8. **Larry rechaza breve y en personaje, sin sermón** — un rechazo moralizante convierte al adulto en adversario del producto, y el canon de Larry ya prohíbe el tono condescendiente (`mc-11`, `mc-37`).  
9. **Toda prenda rechazada tiene apelación a revisión humana con un toque.** Larry va a rebotar bromas legítimas, y sin apelación eso se siente como censura.  
10. **Toda prenda se acepta explícitamente por cada miembro antes de que arranque el reto**, es visible desde antes, no se puede editar después de arrancar, y cualquiera puede salirse del reto sin penalización ni señalamiento (§4).  
11. **Botón de reporte permanente en cada prenda y cada club**, con revisión humana — la segunda capa, para lo que Larry deje pasar.  
12. **Dos estructuras de datos separadas**, `grupo_infantil` y `club_adulto`, para que ninguna función social agregada a los adultos pueda alcanzar a los niños por omisión (§7).  
13. **El dueño de un grupo infantil ve alias, puntos y racha. Nada más.** Ni nombre real, ni edad exacta, ni pertenencia a otros grupos.  
14. **Cero canal privado adulto‑niño**, en cualquier grupo infantil, sea de maestro o de padre — la mitigación directa contra lo que §6 identifica como el riesgo real.  
15. **El padre de cada niño aprueba, viendo antes la identidad declarada del dueño del club**, con insignia visible cuando esa identidad no está verificada.  
16. **Tope de tamaño de club infantil menor que el de aula**, y límite de clubs por cuenta, porque la creación ilimitada de grupos es la palanca que un abusador usaría.  
17. **Bitácora completa y visible para el padre** de quién pidió acceso, quién aprobó y cuándo — el análogo del "contacto de salvaguarda nombrado" que [5] exige, adaptado a un producto sin personal.  
18. **No presentar el club de padres como equivalente a la supervisión de un club deportivo real.** Copy honesto: es un tablero compartido entre familias que ya se conocen, no un programa supervisado.  
19. **Registrar la posición legal de §1 por escrito y revisarla con abogado antes de habilitar prendas en cualquier mercado** — este documento es investigación, no asesoría legal, y la conclusión "faltan dos de tres elementos" depende de hechos de producto que un cambio de roadmap puede invalidar.  

## Preguntas abiertas para el responsable del proyecto

1. ¿Un adolescente de 12-17 años puede estar en un `club_adulto`? La respuesta por defecto de este documento es **no** (implicación 1), pero eso cierra el caso de un grupo de primos o de compañeros de bachillerato.  
2. ¿El catálogo de prendas arranca vacío con texto libre desde el día uno, o se siembra con ejemplos curados que muestren el tono esperado? Sembrarlo es la forma barata de comunicar la norma sin prohibirla.  
3. ¿La aceptación explícita de la prenda (implicación 5) es por reto o una sola vez por club? Por reto es más seguro y más molesto.  
4. ¿Los retos de club de adultos afectan el tablero global, o viven aislados en el club? Si afectan, hay que revisar el control de exposición de ítems de `mc-29`.  
5. ¿Quién atiende la cola de apelaciones y reportes (implicaciones 9 y 11), y con qué tiempo de respuesta comprometido? Es la misma persona para las dos colas o son dos.  
6. Cuando Larry rechaza una prenda, ¿le dice al autor **cuál** de las tres reglas rompió, o solo que no pasó? Decirlo ayuda a corregir; también enseña a esquivar el filtro.  
7. ¿El prompt de moderación de Larry se autoriza por idioma o se traduce? Lo denigrante es fuertemente cultural — lo que en México es una broma entre amigos en Alemania puede no serlo, y al revés.  
6. ¿Se permite que un club infantil mezcle hijos de varias familias que **no** se conocen entre sí, o se limita a familias que ya tienen un vínculo previo? Es la diferencia entre un riesgo acotado y uno abierto.

## Fuentes

1. Thompson Coburn LLP, “Shield your sweepstakes from gambling laws” — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — fuente de los tres elementos, de las definiciones citadas de consideración y azar, y de la observación sobre premios intangibles.  
2. Strava Community Hub, “Combining Competition and Collaboration with Group Challenges” — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494  
3. Strava Support, “Group Challenges” — https://support.strava.com/en-us/articles/15401736-group-challenges — fuente de los cuatro tipos de reto y de la cita sobre la ausencia deliberada de tabla de posiciones en Group Goal.  
4. JDP, “The Ultimate Guide to Background Checks for Youth Sports Volunteers” — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/  
5. TidyHQ, “SafeSport Compliance Checklist for US Youth Sports Organizations” — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — fuente del estándar de “contacto no supervisado” y del requisito de contacto de salvaguarda nombrado.  
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — fuente de la postura pública de que el usuario controla el resultado, usada aquí como precedente de argumentación, no como validación legal.  
7. Investigación interna: `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson sobre estructuras cooperativas; daño concentrado en el fondo del tablero), `2026-07-31-mc-19-habit-loops-push-notifications.md` (intenciones de implementación de Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (el hueco de verificación del maestro, T‑5), `2026-07-31-mc-43-avatars-identity-progression.md` (elección acotada en vez de entrada libre), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (exposición regulatoria de mecánicas de azar con menores), `2026-07-31-mc-37-larry-profe-port.md` (canon de Larry, ruteo de modelos, el patrón de llamada separada), `2026-07-31-mc-11-feedback-formative-assessment.md` (por qué el rechazo moralizante es contraproducente).

**Esto es investigación, no asesoría legal.** La conclusión de §1 —que faltan al menos dos de los tres elementos— descansa sobre hechos de producto (la plataforma no cobra, no retiene, no transfiere, no hace cumplir) que deben seguir siendo ciertos para que la conclusión se sostenga. Un abogado debe revisarla antes de activar productos en cualquier mercado, y la fuente [1] es de 2011 y estadounidense: no cubre México, Brasil, ni la UE, donde `mc-17` ya documentó que Bélgica y Países Bajos legislaron sobre mecánicas de azar de forma más estricta que EE.UU.
