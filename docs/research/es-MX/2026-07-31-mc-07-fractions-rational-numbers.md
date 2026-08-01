# Aprender fracciones, decimales, razón y razonamiento proporcional (edades ~8–14)

> Investigación Math Challenge — 2026-07-31 — tema 07

## Resumen ejecutivo (ES)

- Para Siegler, las fracciones son la "nueva frontera" del desarrollo numérico: hay que dejar de ver numerador y denominador como dos enteros y verlos como **una sola magnitud** en la recta numérica [1][2].
- El conocimiento de fracciones a los 10 años predice el logro en álgebra y matemáticas a los 16, controlando CI, memoria de trabajo e ingreso familiar — en EE. UU. y Reino Unido [3][4].
- El "sesgo de número entero" causa los errores más comunes: sumar numeradores y denominadores por separado (2/3 + 4/6 → 6/9), o creer que 1/4 > 1/2 porque "4 > 2" [5][10].
- El IES/WWC (2010) da cinco recomendaciones (evidencia mínima a moderada): partir de nociones informales de reparto, enseñar la fracción como número, enseñar por qué funcionan los procedimientos, enseñar razón/proporción antes de la multiplicación cruzada, y mejorar la formación docente [6].
- Consenso creciente: la **recta numérica** enseña mejor el sentido de fracción que los modelos de área/parte-todo, aunque es más difícil de enseñar bien [7][8].
- Para decimales, Steinle y Stacey catalogaron tres familias: "más largo es más grande" (0.125 > 0.3), "más corto es más grande" (0.3 > 0.496), y comportamiento "aparentemente experto" sin comprensión real del valor posicional [9][11].
- "Multiplicar siempre agranda" y "dividir siempre achica" se rompen justo con fracciones/decimales menores a 1 (0.5 × 0.2 = 0.1; 8 ÷ ½ = 16) [12].
- El razonamiento proporcional (Lamon; Tourniaire & Pulos) es multiplicativo, distinto y más tardío que el aditivo; es de los mejores predictores de éxito matemático posterior [13][14].
- Ashlock explica casi todos los errores de cómputo con fracciones por dos mecanismos: **sobregeneralizar** una regla de enteros o **sobre-especializar** una regla a un solo caso [15].
- Ya existen catálogos de "malrules" ejecutables para que un sistema clasifique una respuesta incorrecta en un tipo de error con nombre — el enfoque que necesita el tutor de IA de Math Challenge [16].
- Implicación central: el diagnóstico en fracciones/decimales/razón no debe ser solo "correcto/incorrecto"; debe mapear la respuesta a un catálogo corto de misconceptions con nombre, y el tutor debe nombrar la creencia, no solo repetir el procedimiento correcto.

## Executive summary (EN)

- Fractions mark the point where children must stop treating numerator/denominator as two integers and start treating a fraction as one magnitude on a number line — Siegler's integrated theory of numerical development [1][2].
- Fraction knowledge at age 10 uniquely predicts algebra and overall math achievement at 16, controlling for IQ, working memory, and SES, in both US and UK longitudinal cohorts [3][4].
- Whole-number bias drives the most common fraction errors: adding numerators and denominators separately, and judging 1/4 > 1/2 because 4 > 2 [5][10].
- The 2010 IES/WWC Practice Guide gives five recommendations (minimal-to-moderate evidence): build on informal sharing/proportionality intuitions; teach fractions as numbers; teach why procedures work; teach ratio/rate/proportion conceptually before cross-multiplication; improve teacher content knowledge [6].
- Growing consensus favors the number line over 2-D area/part-whole models for fraction magnitude sense, though number lines are harder to teach well [7][8].
- For decimals, Steinle and Stacey's taxonomy names three families — "longer-is-larger," "shorter-is-larger," "apparent-expert" (correct procedure, no place-value understanding) — with named sub-types like "zero makes small" and "money thinking" [9][11].
- "Multiplication always makes bigger" / "division always makes smaller" are over-generalizations from repeated-addition models, and they break exactly on the fraction/decimal (<1) territory this age learns [12].
- Proportional reasoning (Lamon; Tourniaire & Pulos) is a distinct, later-developing multiplicative skill, not additive reasoning extended, and a strong predictor of later math success [13][14].
- Ashlock's framework explains most fraction computation errors as over-generalizing a whole-number rule or over-specializing a rule to a narrow case [15].
- A 2026 arXiv system ("MalruleLib") frames misconceptions as executable "malrules" with prevalence and remediation metadata for automatic classification of a wrong answer — directly relevant prior art for the tutor [16].

## Hallazgos

### 1. La teoría integrada del desarrollo numérico de Siegler

Siegler y sus colegas proponen que una sola representación subyacente — la magnitud numérica, mapeada sobre una recta numérica mental — unifica los números naturales, los enteros, las fracciones y los decimales. El desarrollo avanza ampliando e integrando progresivamente el rango de números que reciben esta representación de magnitud [1][2]. Las fracciones son "la nueva frontera" porque son el primer tipo de número donde el símbolo impreso (dos enteros apilados) induce activamente a error a una interpretación de magnitud, a menos que se supriman los hábitos de número entero [2].

Se confirman dos direcciones predictivas: el conocimiento de la magnitud de los números enteros en primer grado predice el conocimiento de la magnitud de las fracciones en secundaria, y — más trascendental para el diseño curricular — el conocimiento de fracciones y división a los 10 años predice de forma única el conocimiento de álgebra y el logro matemático general a los 16, en una muestra de EE. UU. y en un estudio de cohorte británico, controlando CI, lectura, memoria de trabajo e ingreso/educación familiar [3][4]. Este es el argumento más sólido para tratar las fracciones como un tema de alto apalancamiento en un currículo "de kínder al doctorado", y no como una unidad más entre muchas.

### 2. Guía de práctica IES: "Developing Effective Fractions Instruction, K–8" (NCEE 2010-4039)

Cinco recomendaciones, cada una con su propia calificación de evidencia [6]: (1) partir de la comprensión informal del reparto y la proporcionalidad (evidencia mínima); (2) ayudar a los estudiantes a ver las fracciones como números, no solo como figuras sombreadas (moderada); (3) enseñar por qué funcionan los procedimientos de cómputo con fracciones (moderada); (4) enseñar razón/tasa/proporción conceptualmente antes de la multiplicación cruzada (mínima); (5) mejorar el propio conocimiento de contenido de fracciones de los docentes (mínima). El orden es deliberado: intuición informal → fracciones como números → procedimientos con base conceptual → razón/proporción sobre el mismo sentido de magnitud, con la multiplicación cruzada ganada al final en lugar de memorizada primero [6].

### 3. El sesgo de número entero y el catálogo canónico de errores

El sesgo de número entero (también llamado *denominator neglect*) consiste en aplicar a fracciones/decimales intuiciones válidas para los números naturales, donde ya no se sostienen [5][10]. Es más fuerte en los aprendices jóvenes, disminuye de 4.° a 8.° grado y nunca desaparece del todo — incluso adultos capaces recaen en atajos de número entero en comparaciones de fracciones bajo presión de tiempo o carga cognitiva, con un costo medible detectado en estudios de respuesta cerebral [10].

El síntoma dominante es tratar numerador y denominador como dos enteros independientes. De ahí se derivan dos familias de error bien documentadas: el **error aditivo** (sumar numeradores y denominadores por separado, p. ej., 1/8 + 1/8 → 2/16, o 2/3 + 4/6 → 6/9 [5]) y el **error de comparación** (juzgar la magnitud por el entero mayor, p. ej., 1/4 > 1/2 "porque 4 > 2" [10][17][18]). Una misconception relacionada generaliza la regla de las fracciones unitarias ("mayor denominador → pieza más pequeña") a todas las comparaciones, cuando solo está garantizada para fracciones unitarias [18].

### 4. Recta numérica vs. representación parte-todo (modelo de área)

Los currículos de EE. UU. favorecieron históricamente los modelos parte-todo/de área (una fracción como figura sombreada), mientras que varios currículos asiáticos enfatizan una interpretación de "medición" — una fracción como posición en una recta — más temprano y de forma más consistente [7]. La investigación favorece cada vez más la recta numérica: un solo punto al 75% del camino de 0 a 1 fuerza la interpretación de "una sola magnitud" que los modelos de área no fuerzan, ya que los modelos de área mantienen numerador y denominador visualmente separables [7][8]. El trabajo que comparó tareas de división de fracciones encontró que las rectas numéricas, pero no los modelos de área, apoyaron tanto la precisión como los modelos conceptuales correctos [8]. La salvedad común a las fuentes: las rectas numéricas son la representación objetivo correcta, pero son más difíciles de enseñar bien, así que lo que la evidencia respalda es la secuenciación, no el reemplazo total [7][8].

### 5. Razón y razonamiento proporcional (Lamon; Tourniaire & Pulos)

La revisión de Tourniaire y Pulos de 1985 sigue siendo la síntesis de referencia, catalogando las estrategias correctas y erróneas en problemas de proporción y las variables que predicen cuál aparece [14]. Lamon define el razonamiento proporcional como "the deliberate use of multiplicative relationships to compare quantities and predict the value of one quantity based on the values of another," que descansa en comprender la covariación de las cantidades junto con la invariancia de su razón [13]. El razonamiento proporcional no es razonamiento aditivo extendido — requiere un cambio cualitativo hacia la comparación multiplicativa, e incluso estudiantes fluidos en aritmética de fracciones suelen recurrir por defecto a estrategias proporcionales aditivas (p. ej., "sumar 3 a ambos términos") en problemas nuevos [13][14]. Lamon sostiene que el razonamiento proporcional está entre los mejores predictores del éxito matemático posterior, lo que, combinado con el hallazgo de Siegler sobre fracciones→álgebra, hace que esta banda de edad sea desproporcionadamente trascendental para los resultados de aprendizaje a largo plazo [3][13].

### 6. Taxonomía de misconceptions específicas de decimales (Steinle & Stacey)

El programa de investigación de Steinle, Stacey y Chambers (1998–2002) es la taxonomía más lista para clasificación automática de este documento, construida a partir de datos de pruebas diagnósticas a gran escala y no de estudios de caso [9][11]:

- **"Más largo es más grande"** — más dígitos después del punto significa más grande (p. ej., 0.125 > 0.3). Subtipos: pensamiento de número entero, pensamiento de desbordamiento de columna, "el cero hace pequeño", pensamiento inverso.
- **"Más corto es más grande"** — lo contrario (p. ej., 0.3 > 0.496). Subtipos: pensamiento centrado en el denominador, pensamiento recíproco, pensamiento negativo.
- **Comportamiento "aparentemente experto"** — comparaciones de apariencia correcta sin comprensión real del valor posicional, incluido el "pensamiento de dinero" (tratar los decimales como dólares y centavos más allá de dos dígitos) y dificultad específica con el cero.

La prevalencia reportada para algunos subtipos (p. ej., "el cero hace pequeño") fue de alrededor del 3% de los estudiantes evaluados, una tasa base útil para decidir con qué agresividad señalar una misconception rara pero real [11].

### 7. "Multiplicar agranda" / "dividir achica"

Este par se remonta a una sola causa raíz: la multiplicación modelada primero como suma repetida, que es genuinamente siempre creciente para enteros mayores que 1 — así que la creencia es localmente correcta durante años antes de fallar con una fracción/decimal menor que 1, p. ej., 0.5 × 0.2 = 0.1 (más pequeño), u 8 ÷ ½ = 16 (más grande) [12]. Es una de las pocas misconceptions con remediación probada: las actividades de predicción y luego revelación, que fuerzan una predicción comprometida antes del contraejemplo, superaron a la explicación directa [12].

### 8. El marco diagnóstico de patrones de error de Ashlock

*Error Patterns in Computation* de Ashlock (10 ediciones) es lo más parecido a un manual diagnóstico de propósito general para una respuesta incorrecta [15]. Su tesis: casi todo error recurrente es **sobregeneralizar** una regla más allá de donde es válida (p. ej., la regla de multiplicar de arriba a abajo mal aplicada a la suma), o **sobre-especializar** una regla al único caso estrecho enseñado primero (p. ej., una regla de resta que supone tácitamente que no hay reagrupación, y que se rompe con números mixtos) [15]. Ashlock organiza los capítulos de fracciones/decimales por operación — un eje secundario útil junto al nombre de la misconception para etiquetar respuestas incorrectas.

### 9. Hacia la clasificación automática: arte previo

Un artículo de arXiv de 2026 describe "MalruleLib", una biblioteca que codifica misconceptions documentadas como "malrules" ejecutables con trazas de razonamiento paso a paso, datos de prevalencia, hipótesis de causa raíz y guía de remediación, diseñada para clasificar una respuesta incorrecta contra patrones catalogados [16]. Esta es la forma del sistema que necesita el tutor de Math Challenge: una capa de coincidencia de reglas que infiere qué malrule con nombre produjo una respuesta numérica incorrecta específica y responde a la creencia, no a una incorrección genérica. Su linaje se remonta al trabajo "DEBUGGY" de Brown y Burton de 1978 — el caso fundacional de que las respuestas incorrectas suelen ser la salida determinista de un procedimiento consistente, nombrable e incorrecto, no ruido.

## Implicaciones de diseño para Math Challenge

1. Tratar fracciones/decimales/razón (grados 3–8, edades 8–14) como de *alto apalancamiento* en la calendarización y en las puertas de dominio, no como una unidad de peso igual — el vínculo predictivo fracción→álgebra es uno de los hallazgos más sólidos de la investigación en educación matemática [3][4].
2. Hacer que los ejercicios que introducen fracciones usen por omisión una representación de **recta numérica**, con los modelos parte-todo/de área como andamiaje previo y no como objetivo — según el consenso de que las representaciones de magnitud unidimensionales construyen un sentido de fracción más verdadero [7][8].
3. Construir un **clasificador de misconceptions con nombre**, no un verificador de correcto/incorrecto: confrontar la respuesta numérica incorrecta específica del estudiante contra un catálogo pequeño de malrules documentadas (ver tabla) antes de caer en un "incorrecto" genérico.
4. Hacer que el tutor de IA **nombre la creencia**, no solo repita el procedimiento — "sumaste los de arriba y los de abajo por separado" es más diagnóstico que "recuerda encontrar un denominador común".
5. Usar micro-interacciones de **predicción y luego revelación** para "multiplicar agranda" / "dividir achica" — la única misconception de este documento con remediación probada y superior a la explicación directa [12].
6. Instrumentar los ítems de comparación de decimales para detectar específicamente los subtipos de Steinle & Stacey (más-largo-es-más-grande, más-corto-es-más-grande, pensamiento-de-dinero, el-cero-hace-pequeño); sus tasas base conocidas (~3% para algunos) pueden calibrar con qué agresividad interviene el tutor vs. deja pasar un desliz raro [9][11].
7. Etiquetar cada error diagnosticado con el eje de sobregeneralización vs. sobre-especialización de Ashlock; da forma al lenguaje del tutor ("esta regla no cubre este caso" vs. "esta regla solo funciona para X") y muestra a los diseñadores de contenido qué operaciones generan qué mecanismo [15].
8. Secuenciar la instrucción de razón/proporción de modo que las estrategias conceptuales (escalamiento, tasas unitarias, construcción progresiva) se dominen antes de que se desbloquee la multiplicación cruzada, según la recomendación 4 del IES — la multiplicación cruzada es un atajo que esconde la comprensión multiplicativa que esta edad necesita [6].
9. Como el razonamiento proporcional requiere un cambio de comparación aditiva a multiplicativa, diseñar ítems que fuercen la elección (p. ej., tareas de escalar recetas donde el ingenuo "sumar 3 a ambos términos" se ve plausible pero es incorrecto) para que la misconception aflore y pueda nombrarse [13][14].
10. Registrar qué misconception dispara un niño repetidamente; un niño que produce la misma malrule una y otra vez es un disparador más fuerte para una micro-lección dirigida que la precisión agregada de ítems por sí sola.
11. Autorar el texto del tutor bilingüe (EN/ES/FR/PT/DE) por misconception como plantilla con espacios para números, no traducido ad hoc por ítem — mantiene consistente la formulación de "nombrar la creencia" y permite que un solo revisor nativo apruebe cada misconception.
12. Como el sesgo de número entero nunca desaparece del todo ni en adultos capaces bajo carga, no cerrar el "dominio de fracciones" como insignia permanente; registrar correcto-bajo-presión-de-tiempo por separado de correcto-sin-tiempo, dado que la velocidad ya es una dimensión puntuada.

### Misconception → respuesta incorrecta → respuesta del tutor (tabla inicial)

| Misconception con nombre | Respuesta incorrecta típica que produce | Lo que el tutor de IA debería decir |
|---|---|---|
| Sesgo de número entero / fracción como dos enteros | 1/8 + 1/8 = 2/16 (suma numeradores y denominadores por separado) [5] | "Sumaste los de arriba y los de abajo por su cuenta — una fracción es un solo número. 1/8 y 1/8 son piezas del mismo tamaño, así que suma las piezas: 1 + 1 = 2 octavos = 2/8." |
| Mayor-denominador-significa-mayor-fracción | Dice 1/4 > 1/2 "porque 4 es más grande que 2" [10][17][18] | "Comparaste los números de abajo como si fueran números enteros. Un denominador mayor significa que el entero se corta en más piezas, más pequeñas. Cortemos la misma pizza en 2 y en 4 piezas y comparemos." |
| Regla de fracción unitaria sobre-aplicada a fracciones no unitarias | Dice 2/5 < 3/8 comparando solo los denominadores (5 < 8), ignorando los numeradores [18] | "Ese atajo solo funciona cuando el número de arriba es 1 en ambas fracciones. Aquí los de arriba también son distintos, así que mejor busquemos un denominador común." |
| Numerador/denominador tratados como enteros sin relación (confusión de equivalencia) | Cree que 2/4 y 3/6 son cantidades distintas porque los dígitos difieren [19] | "Números de arriba/abajo distintos pueden seguir siendo la misma cantidad. Multipliquemos 1/2 por 2/2 y veamos qué obtenemos." |
| "Decimal más largo es más grande" (pensamiento de número entero / desbordamiento de columna) | Juzga 0.125 > 0.3 [9][11] | "Comparaste estos como números enteros — 125 contra 3. Pero justo después del punto, el dígito de las décimas es el que más importa: 0.3 = 0.300, y 3 décimas le ganan a 1 décima." |
| "Decimal más corto es más grande" (pensamiento centrado en el denominador / recíproco) | Juzga 0.3 > 0.496 [9][11] | "Alineémoslos a los mismos dígitos: 0.300 contra 0.496. Compara desde la izquierda — ¿qué dígito de las décimas es más grande?" |
| Límite del "pensamiento de dinero" en decimales | Maneja mal un tercer dígito decimal, p. ej., lee 0.145 como "1 peso 45" [9][11] | "El dinero solo tiene dos dígitos después del punto, pero los decimales pueden tener más. Este tercer dígito es el lugar de las milésimas." |
| "Multiplicar siempre agranda" | Predice 0.5 × 0.2 > 0.5, confundido de que es 0.1 [12] | "Es cierto cuando multiplicas por más de 1 — pero 0.2 es menos que un entero, así que estás tomando una parte pequeña de 0.5, no sumándole." |
| "Dividir siempre achica" | Predice 8 ÷ ½ < 8, confundido de que es 16 [12] | "Dividir entre ½ pregunta '¿cuántas mitades caben en 8?' Las mitades son pequeñas, así que caben muchas — por eso la respuesta es más grande." |
| Razonamiento proporcional aditivo (no multiplicativo) | "3 harina : 2 azúcar, escala a 9 harina" respondido como 8 azúcar (+6 a ambos términos en lugar de ×3) [13][14] | "Sumaste la misma cantidad a ambos números, pero una razón crece por el mismo múltiplo. La harina se triplicó (3→9) — ¿qué pasa con el azúcar si también se triplica?" |
| Multiplicación cruzada sin comprensión | Plantea la multiplicación cruzada correctamente pero no sabe explicar por qué, o la aplica mal a una relación no proporcional [6] | "Antes de multiplicar en cruz, dime por qué estas dos razones deberían ser iguales. Si no son realmente proporcionales, multiplicar en cruz da una respuesta incorrecta que parece correcta." |
| Sobregeneralización de una regla de operación (Ashlock) | Aplica la regla del denominador común a la multiplicación, p. ej., 1/2 × 1/3 [15] | "Esa regla es para sumar/restar. La multiplicación funciona distinto — multiplica directo los de arriba y los de abajo." |
| Sobre-especialización de una regla de operación (Ashlock) | Un procedimiento de resta que funcionó una vez falla con números mixtos que necesitan reagrupación, p. ej., 3 − 1¾ [15] | "Esta regla funcionó para problemas más fáciles, pero aquí hay que pedir prestado al número entero primero. Reescribamos 3 como 2 y 4/4." |

## Preguntas abiertas para el dueño del proyecto

1. ¿El clasificador debería confrontar el catálogo de malrules en *cada* respuesta incorrecta, o solo escalar a retroalimentación de misconception con nombre tras una repetición (para evitar sobre-diagnosticar un desliz aislado)?
2. Para los 8 años (3.° grado), ¿la recta numérica debería ser el primer modelo de fracción mostrado, o debería precederla un breve puente parte-todo, dado que las rectas numéricas son más difíciles de enseñar bien?
3. ¿"Correcto bajo presión de tiempo" y "correcto sin tiempo" deberían ser señales de dominio separadas y visibles para fracciones (según la implicación #12), o añadiría eso una complejidad de interfaz desproporcionada?
4. ¿Las plantillas misconception → respuesta-del-tutor deberían autorarse nativamente por idioma, o plantillarse y traducirse a máquina con revisión nativa — una disyuntiva de costo/tono para EN/ES/FR/PT/DE?
5. ¿La multiplicación cruzada debería estar bloqueada detrás del dominio conceptual de razones (recomendación 4 del IES), incluso contra un estudiante/padre que quiere acceso más rápido al "atajo"?

## Fuentes

1. Siegler, R. S., Thompson, C. A., & Schneider, M. (2011). An integrated theory of whole number and fractions development. *Cognitive Psychology*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/STS2011.pdf
2. Siegler, R. S., Fazio, L. K., Bailey, D. H., & Zhou, X. (2013). Fractions: The new frontier for theories of numerical development. *Trends in Cognitive Sciences*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/2013-SieglerFazioBaileyZhou-fac.pdf
3. Siegler, R. S., Duncan, G. J., Davis-Kean, P. E., Duckworth, K., Claessens, A., Engel, M., Susperreguy, M. I., & Chen, M. (2012). Early Predictors of High School Mathematics Achievement. *Psychological Science*. https://journals.sagepub.com/doi/abs/10.1177/0956797612440101 (PDF abierto: https://files.eric.ed.gov/fulltext/ED552898.pdf)
4. Early Predictors of Middle School Fraction Knowledge. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC4146696/
5. Developmental changes in the whole number bias. ERIC / ResearchGate. https://files.eric.ed.gov/fulltext/ED572370.pdf
6. Institute of Education Sciences / What Works Clearinghouse (2010). Developing Effective Fractions Instruction for Kindergarten Through 8th Grade. NCEE 2010-4039. https://ies.ed.gov/ncee/wwc/practiceguide/15
7. Frax / ExploreLearning. Effective Strategies for Teaching Fractions: Rethinking Fraction Instruction. https://frax.explorelearning.com/resources/insights/are-we-teaching-fractions-effectively-rethinking-fraction-instruction
8. Number lines, but not area models, support children's accuracy and conceptual models of fraction division. *Journal of Experimental Child Psychology / Cognitive Development*, ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0361476X18305290
9. Denominator neglect / decimal misconceptions overview (Steinle & Stacey framework summary). Wikipedia. https://en.wikipedia.org/wiki/Denominator_neglect
10. Inhibiting the Whole Number Bias in a Fraction Comparison Task: An Event-Related Potential Study. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC7064278/
11. Steinle, V., & Stacey, K. (1998, 2002). The incidence of misconceptions of decimal notation amongst students in Grades 5 to 10 / Persistence of decimal misconceptions and readiness to move to expertise. University of Melbourne. https://extranet.education.unimelb.edu.au/SME/TNMY/Decimals/Decimals/backinfo/refs/merga98stst.pdf and https://www.researchgate.net/publication/251804213_PERSISTENCE_OF_DECIMAL_MISCONCEPTIONS_AND_READINESS_TO_MOVE_TO_EXPERTISE
12. Addressing the multiplication makes bigger and division makes smaller misconceptions via prediction and clickers. ResearchGate. https://www.researchgate.net/publication/233294366_Addressing_the_multiplication_makes_bigger_and_division_makes_smaller_misconceptions_via_prediction_and_clickers
13. Lamon, S. J. Teaching Fractions and Ratios for Understanding; cited via NCTM and MERGA summaries of Lamon's proportional-reasoning framework. https://www.nctm.org/uploadedFiles/Publications/More4U/Activity_Gems_in_the_6-8_Classroom/ch%202-5%20lamon%20article.pdf and https://files.eric.ed.gov/fulltext/ED520962.pdf
14. Tourniaire, F., & Pulos, S. (1985). Proportional reasoning: A review of the literature. *Educational Studies in Mathematics*, 16, 181–204. https://link.springer.com/article/10.1007/PL00020739
15. Ashlock, R. B. Error Patterns in Computation: Using Error Patterns to Help Each Student Learn (10th ed.). Pearson. https://www.pearson.com/en-us/subject-catalog/p/Ashlock-Error-Patterns-in-Computation-Using-Error-Patterns-to-Help-Each-Student-Learn-10th-Edition/P200000000739/9780135009109
16. MalruleLib: Large-Scale Executable Misconception Reasoning with Step Traces for Modeling Student Thinking in Mathematics. arXiv. https://arxiv.org/pdf/2601.03217
17. Whole Number Bias and 3 Misconceptions about fractions in Junior Math. Robertson Program, OISE, University of Toronto. https://www.oise.utoronto.ca/robertson/blog/whole-number-bias-and-3-misconceptions-about-fractions-junior-math-2022-05-26
18. Maths — No Problem. 4 common maths fractions misconceptions and how to address them. https://mathsnoproblem.com/blog/teaching-tips/how-to-address-4-common-fractions-misconceptions
19. Kwokario Education. Overcoming Common Fraction Misconceptions in Student Learning. https://kwokarioedu.com/common-misconceptions-and-mistakes-when-learning-fractions/
