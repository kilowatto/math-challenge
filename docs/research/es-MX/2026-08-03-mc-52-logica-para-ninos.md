# Lógica para niños: booleana, tablas de verdad y acertijos — cómo se enseña en el mundo y cómo se convierte en retos de 7 años en adelante

> Investigación Math Challenge — 2026-08-03 — tema 52

## Resumen ejecutivo (ES)

- La petición del dueño: que los niños vean lógica booleana y tablas de
  verdad desde después de kinder, en todos los niveles, «porque es la base
  de la programación y tienen que conocerla». La investigación dice: **la
  idea es defendible, y la forma lo es todo**.
- **Bebras** es el sistema más grande del mundo enseñando exactamente esto:
  reto anual de pensamiento computacional en 50+ países, con bandas por edad
  (8-10, 10-12, 12-14, 14-16, 16+), tareas de 1-4 minutos en tres formatos
  (interactiva, abierta, opción múltiple) y validación como instrumento de
  medición de pensamiento computacional [1][2][3]. Sus tarjetas «Unplugged»
  tienen sets separados por edad **desde los 3 años** (3-4, 5-6, 7-8, 9-10)
  [3].
- **La estrategia «unplugged» (sin pantalla) es la más usada del mundo para
  pensamiento computacional en niños** (Caeli & Yadav 2020) — y la revisión
  honesta es que **no hay evidencia clara de qué estrategia es la mejor**
  (Hsu et al. 2018). Hay que decirlo así y no vender la rama como probada
  [4].
- **Los acertijos de «caballeros y mentirosos» de Raymond Smullyan son el
  puente documentado entre la lógica elemental y la demostración**: la MAA
  recomienda usarlos para esa transición — desarrollan la intuición de la
  prueba por contradicción, y «casi todos los estudiantes parecen
  disfrutarlos» [5]. Los Math Circles los usan con piezas físicas [6].
- **La progresión formal de referencia** (Mathematics Manifesto): lógica
  booleana con acertijos y tablas de verdad a los **11-14**; lógica formal
  con cuantificadores a los **14-18** [7]. Eso sugiere que la tabla de
  verdad **formal** no es contenido de 7 años; el razonamiento Y/O/NO
  encarnado, sí.
- **Conclusión de diseño**: la rama LOGI puede existir en **todos los
  niveles desde N4** — pero escalando la forma: atributos y reglas
  compuestas (N4-N6), acertijos (N6-N8), tablas de verdad pequeñas (N8+),
  De Morgan (N10), predicados y negación de cuantificadores (N11-N12, ya en
  el catálogo). La tabla de verdad como herramienta se **construye antes de
  dibujarse**: primero se razona, luego se tabula.
- Precaución honesta para el producto: un niño de 7 no lee tablas de símbolos;
  los retos de N4-N6 deben funcionar con figuras, atributos y rejillas, no
  con notación lógica (coherente con mc-20/mc-21 y la línea roja #3).

## Executive summary (EN)

- The owner's request: children should see Boolean logic and truth tables
  right after kindergarten, in every level, "because it's the foundation of
  programming and they have to know it." The research says: **the idea is
  defensible, and the form is everything**.
- **Bebras** is the world's largest system teaching exactly this: an annual
  computational-thinking challenge in 50+ countries, age-banded (8-10 to
  16+), 1-4 minute tasks in three formats, validated as a CT measurement
  instrument [1][2][3]. Its Unplugged cards have age-separated sets **from
  age 3** [3].
- **Unplugged is the most-used strategy worldwide for CT in children**
  (Caeli & Yadav 2020) — and the honest review is that **no strategy is
  clearly proven best** (Hsu et al. 2018) [4].
- **Smullyan's knights-and-knaves puzzles are the documented bridge from
  elementary logic to proof**: the MAA recommends them for that transition —
  they build intuition for proof by contradiction, and students enjoy them
  [5]. Math Circles run them with physical pieces [6].
- **Reference formal progression** (Mathematics Manifesto): Boolean logic
  with puzzles and truth tables at **11-14**; formal logic with quantifiers
  at **14-18** [7]. The formal truth table is not 7-year-old content;
  embodied AND/OR/NOT reasoning is.
- **Design conclusion**: the LOGI branch can exist in **every level from
  N4** — with the form scaling: attributes and compound rules (N4-N6),
  puzzles (N6-N8), small truth tables (N8+), De Morgan (N10), predicates
  and quantifier negation (N11-N12, already in the catalog). The truth
  table is **built before it is drawn**: reason first, tabulate later.

## 1. Qué hace el mundo hoy, verificado

### 1.1 Bebras — el sistema de referencia

El Bebras International Challenge on Informatics and Computational
Thinking corre en más de 50 países desde hace ~16 años [1][3]. Bandas de
edad: Little Beavers 8-10, Benjamins 10-12, Cadets 12-14, Juniors 14-16,
Seniors [2]. Cada participante resuelve 15-18 tareas en 40-45 minutos (1-4
minutos por tarea), en tres formatos: interactivas, abiertas y opción
múltiple con cuatro opciones [2]. Sus dominios medidos: descomposición,
reconocimiento de patrones, abstracción, modelado y simulación, algoritmos
y evaluación [3]. Las **Bebras Unplugged Cards** existen en sets por edad
desde los 3 años (3-4, 5-6, 7-8, 9-10), con opciones a elegir y sin
requerir dispositivos ni experiencia previa de código [3]. Hay validación
publicada de las tarjetas como test de pensamiento computacional (Sung
2022, citado en [3]) y una evaluación 2024 de un programa Bebras en
primaria [4].

**Lo que Bebras prueba para nosotros:** las tareas lógicas de 1-4 minutos
con opción múltiple funcionan desde los 7-8 años — que es exactamente el
formato `toca_la_respuesta` que ya tenemos en producción.

### 1.2 La estrategia unplugged y su evidencia honesta

La revisión de la literatura (EPFL/Springer 2024) encuentra que el
pensamiento computacional se integra cada vez más en currículos tempranos
y que **unplugged es la estrategia más comúnmente empleada** para niños
(Caeli & Yadav 2020) — pero advierte textualmente: *«there is no clear
evidence regarding which strategies are most suitable for this purpose
(Hsu et al., 2018)»* [4]. Es decir: el mundo lo hace, la medición de qué
funciona mejor está abierta. Nuestro producto no puede prometer que la
rama «mejora la mente» — puede prometer que está bien diseñada y que la
medición propia (master-plan §15) dirá si funciona.

### 1.3 Smullyan y los acertijos como puente a la demostración

La Mathematical Association of America, en su guía de recursos para
enseñar matemáticas discretas, recomienda los acertijos de «caballeros y
mentirosos» de Raymond Smullyan (*What is the Name of this Book?*, 1978)
como **puente de la lógica elemental a la demostración**: *«working on
them helps develop a basis of intuition for proof by contradiction…
almost all students seem to enjoy the puzzles»* [5]. Los Math Circles los
operan con piezas físicas de dos colores (caballero/mentiroso) — análisis
de casos como habilidad explícita [6]. Smullyan publicó 14 libros de
acertijos lógicos entre 1978 y 2015, muchos anidados en narrativa (Alicia,
Sherlock Holmes, las Mil y una noches) [8].

**La lección de formato:** el acertijo lógico efectivo es **narrativo y
concreto** (una isla, dos guardias, piezas de dos colores), nunca una
fórmula. La evaluación es de consecuencias, no de notación.

### 1.4 La progresión formal de referencia

El Mathematics Manifesto (Emaths, Reino Unido) propone: a los **11-14**,
lógica booleana (AND, OR, NOT) «through basic logic puzzles and truth
tables» — explícitamente como fundamento de la computación; a los
**14-18**, lógica formal con notación y cuantificadores, más
computabilidad y fundamentos [7]. TryEngineering (IEEE) tiene material de
álgebra de Boole «is Elementary» orientado a escuela [9].

**Lo que esto fija para nosotros:** la tabla de verdad como objeto formal
cae a los 11-14 en la referencia más directa; el razonamiento booleano
encarnado puede (y en Bebras lo hace) empezar a los 7-8.

### 1.5 La lógica ya existe en los currículos — disfrazada

Ningún currículo escolar de mc-51 enseña «lógica» como materia en
primaria, pero todos la enseñan como **razonamiento**: el NC inglés pide
«reason mathematically» desde Y1 [10]; Common Core pide «make sense of
problems» como práctica transversal [11]; Singapur pone la resolución de
problemas al centro del marco con cinco componentes [12]. La rama LOGI de
un producto no compite con la escuela: la adelanta con buena forma.

## 2. La escalera propuesta de la rama LOGI (N4-N12)

Coherente con la evidencia de §1 y con lo que ya hay en N11-N12 del
catálogo (`f11-contenido-retos.md`). Cada nivel mantiene ≥3 ramas
(D-129) — LOGI sería una de ellas en todos.

| Nivel | Contenido LOGI | Forma del reto | Referencia |
|---|---|---|---|
| N4 | **Atributos y reglas compuestas**: «toca la figura que es roja Y redonda»; «toca la que NO es azul» | Figuras con atributos (forma/color/tamaño) — AND/NOT encarnados | Bebras 7-8 [3] |
| N5 | **Reglas con O**: «vale cualquiera que sea grande O roja»; clasificar por dos criterios | Misma superficie, criterio disyuntivo | Bebras 7-8 [3] |
| N6 | **Acertijo simple**: «de estas tres afirmaciones solo una es falsa, ¿qué caja tiene el premio?» | Acertijo narrativo corto, opción múltiple | Bebras 8-10, Math Circles [3][6] |
| N7 | **Si… entonces y su no-inversa**: «todos los zorbos son azules; esto no es azul, ¿es un zorbo?» | Lógica proposicional encarnada (contrapositiva sin nombrarla) | Smullyan [5] |
| N8 | **Tablas de verdad pequeñas (2 variables)**: «¿en cuántas filas es verdad?» | La tabla como opción: 2×2 con Y/O/NO | Manifesto 11-14 [7] |
| N9 | **3 variables y equivalencias**: «estas dos expresiones, ¿dicen lo mismo?» | Tabla 2×2×2; equivalencia como verdad-en-toda-fila | [7] |
| N10 | **De Morgan**: «niega: (grande Y roja)» | `¬(A∧B) ≡ ¬A∨¬B` con atributos primero, símbolos después | [7] |
| N11 | **Predicados**: «todos / algunos / ninguno» sobre conjuntos concretos | Cuantificación encarnada | mc-12, Manifesto 14-18 [7] |
| N12 | **Negación de cuantificadores** (ya autorado: `n12-p4`) + detectar el error lógico en una cadena | `¬∀ ≡ ∃¬`; «¿qué línea rompe el argumento?» | mc-12 [5] |

**La regla de forma que sostiene toda la escalera:** primero se razona,
luego se tabula. La tabla de verdad es la **foto del razonamiento que el
niño ya hizo** con atributos y acertijos — nunca el punto de partida.

## 3. Cómo se convierte en retos auto-calificables (con lo que ya existe)

- **N4-N5 (atributos):** el formato `toca_la_respuesta` con opciones
  dibujadas (`dibujos` del `Item` — el mecanismo que ya existe desde
  #349): la opción es la figura, no un identificador. Un reto son 3-4
  figuras que varían en 2-3 atributos; la respuesta es la única que
  cumple la regla compuesta. **Ninguna tabla, ningún símbolo.**
- **N6-N7 (acertijos):** enunciado narrativo de 1-2 líneas (autorado por
  locale, línea roja #3 intacta: el niño nunca escribe) + 3-4 opciones.
  El distractor es el error lógico real con causa nombrada
  (`tomó_la_contraria`, `confundió_todos_con_alguno`,
  `asumió_la_inversa`).
- **N8-N10 (tablas):** la tabla se dibuja con figuras/ticks, no con V/F
  solos; la pregunta es sobre una fila o sobre el conteo — opción
  múltiple numérica o de figura. La tabla completa como respuesta libre
  NO entra (no es auto-calificable con `toca_la_respuesta`; las tablas
  grandes quedan para el pizarrón de D-075 en bandas adultas).
- **N11-N12:** ya autorado en el catálogo (`n12-p4` y la plantilla de
  lógica de la negación); se completa con «detecta la línea que rompe»
  (formato de mc-12, ya decidido).

**Errores con causa nombrada que esta rama añade al vocabulario**
(familia propia, con fuente): `tomó_la_contraria` (niega al revés),
`asumió_la_inversa` (si A→B cree que B→A), `confundió_y_con_o`,
`confundió_todos_con_alguno` (cuantificadores), `negó_la_proposición_en_vez_del_cuantificador`
(ya en el catálogo), `olvidó_un_caso` (análisis de casos incompleto).

## 4. Precauciones (la parte que no hay que saltarse)

1. **No prometer transferencia.** La revisión dice que no hay evidencia
   clara de qué estrategia de pensamiento computacional funciona mejor
   (Hsu et al. 2018, vía [4]). El producto no puede decir «la lógica
   mejora la mente» — puede decir «está bien diseñada, y medimos»
   (master-plan §15: el único umbral que importa es retención diferida).
2. **Un niño de 7 no lee notación lógica.** Los niveles N4-N6 son
   figuras, atributos y acertijos narrados — coherente con mc-20/mc-21 y
   la línea roja #3. El símbolo llega cuando la intuición ya existe.
3. **El disfrute es un activo documentado, no un adorno** («almost all
   students seem to enjoy the puzzles» [5]) — pero el acertijo que
   humilla al que falla es anti-Larry: los errores con causa nombrada de
   §3 son el canal del feedback (mc-11).
4. **No competir con Bebras, complementar:** su reto es anual y escolar;
   el nuestro es adaptativo y diario. La inspiración de formato es
   explícita y citada, no copia de tareas (son concurso protegido).

## 5. Implicaciones de diseño para Math Challenge

1. **LOGI pasa de rama de N11-N12 a rama presente en TODOS los niveles
   N4-N12** (petición del dueño 2026-08-03), con la escalera de §2. El
   mapa de `mc-51` §4 se actualiza: `LOGI` deja de ser solo predicados y
   se vuelve la escalera completa (booleana → acertijos → tablas →
   predicados), con sus dos sub-etiquetas (booleana / predicados).
2. **Es la cuarta rama de cada nivel** — D-129 pide ≥3 ramas por nivel;
   con LOGI presente en todos, cada nivel tiene una rama garantizada
   transversal más dos de su materia.
3. **El catálogo de los 54 crece con retos LOGI por nivel** (sección
   aparte en `f11-contenido-retos.md`), sin cambiar el piso de 6: los
   retos LOGI son **adicionales** al piso, porque su función es
   transversal (base de programación y demostración), no de materia.
4. **Es la base oficial de la pista de demostración** (D-132): la pista
   transversal arranca en acertijos (N6) y termina en Lean 4 (D-124) —
   la misma espina, diez años de largo.
5. **El nombre de persona de la rama** (D-128) se autora por locale:
   «acertijos lógicos» / «logic puzzles» — nunca «03 Mathematical logic
   and foundations» en pantalla.

## 6. Preguntas abiertas para el dueño — RESUELTAS (2026-08-03, D-147)

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | ¿Dentro del piso de 6 o adicionales? | **Adicionales** — la lógica es transversal, no una materia del nivel |
| 2 | ¿Cuándo la tabla de verdad formal? | **N8**, tras atributos y acertijos |
| 3 | ¿Nombre de la rama en pantalla? | **«Acertijos»**, autorado por locale |
| 4 | ¿Kinder? | **Fuera, desde N4** — la trayectoria de mc-06 tiene prioridad |

Los retos quedaron autorados como anexo de `docs/planes/f11-contenido-retos.md`.

## Fuentes

1. **USA Bebras Computing Challenge** — https://bebraschallenge.org/ —
   la competencia y su formato.
2. **Constructionism 2016 Proceedings** (descripción del reto Bebras:
   bandas, 15-18 tareas, 40-45 minutos, tres formatos) —
   https://e-school.kmutt.ac.th/constructionism2016/Constructionism%202016%20Proceedings.pdf
   — descargado.
3. **Bebras Unplugged Computational Thinking Cards** (sets por edad desde
   3 años, dominios medidos, validación) — vía
   https://adn.reviste.ubbcluj.ro/papers/article_16_1_3.pdf — descargado.
4. **A Bebras Computational Thinking program for primary school
   (Springer 2024)** — https://link.springer.com/article/10.1007/s10639-023-12441-w
   — descargado; incluye la advertencia de Hsu et al. 2018 («no clear
   evidence which strategies are most suitable») y Caeli & Yadav 2020.
5. **MAA, Resources for Teaching Discrete Mathematics** —
   https://www.maa.org/wp-content/uploads/2024/10/NTE74.pdf#page=200 —
   descargado; Smullyan como puente a la demostración, la cita sobre el
   disfrute.
6. **Carleton Math Circle — Knights and Knaves con piezas físicas** —
   https://cdn.carleton.edu/uploads/sites/66/2020/06/Math-Circle-Comps.pdf
   — descargado; y MathCircles.org «Knights and Knaves: a journey to the
   land of logic».
7. **Mathematics Manifesto (Emaths)** —
   https://www.emaths.co.uk/images/Blogs/MathematicsManifesto/Mathematics%20Manifesto.pdf
   — descargado; la progresión 11-14 booleana / 14-18 formal.
8. **Computational Complexity blog — Smullyan obituario/bibliografía** —
   https://blog.computationalcomplexity.org/2017/02/raymond-smullyan-was-born-on-may-25.html
   — descargado; los 14 libros de acertijos (1978-2015).
9. **TryEngineering — Boolean Algebra is Elementary (IEEE)** —
   https://tryengineering.org/wp-content/uploads/Boolean-Algebra-Elementary.pdf
   — descargado.
10. **National Curriculum in England** — gov.uk (vía mc-51 [9]) — «reason
    mathematically» como hilo desde Y1.
11. **Common Core** — thecorestandards.org (vía mc-51 [8]) — prácticas
    transversales.
12. **Singapur MOE Primary Mathematics Syllabus 2021** (vía mc-51 [16]) —
    resolución de problemas al centro del marco.

**Advertencias de esta sesión:** las tareas concretas de Bebras son de
concurso y no se descargaron (se citan formato y bandas, no tareas); la
referencia del Manifesto es de un autor y no un estándar nacional; la
evidencia de efectividad de las estrategias de pensamiento computacional
está abierta (§4.1) y este documento no afirma transferencia.
