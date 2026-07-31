# Learning fractions, decimals, ratio, and proportional reasoning (ages ~8–14)

> Math Challenge research — 2026-07-31 — topic 07

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

## Findings

### 1. Siegler's integrated theory of numerical development

Siegler and colleagues propose that a single underlying representation — numerical magnitude, mapped onto a mental number line — unifies whole numbers, integers, fractions, and decimals. Development proceeds by progressively broadening and integrating the range of numbers that get this magnitude representation [1][2]. Fractions are "the new frontier" because they are the first number type where the printed symbol (two integers stacked) actively misleads a magnitude interpretation unless whole-number habits are suppressed [2].

Two predictive directions are confirmed: whole-number magnitude knowledge in first grade predicts fraction-magnitude knowledge in middle school, and — more consequential for curriculum design — fraction and division knowledge at age 10 uniquely predicts algebra knowledge and overall math achievement at age 16, in a US sample and a British cohort study, controlling for IQ, reading, working memory, and family income/education [3][4]. This is the strongest argument for treating fractions as high-leverage in a "kinder to PhD" curriculum rather than one unit among many.

### 2. IES Practice Guide: "Developing Effective Fractions Instruction, K–8" (NCEE 2010-4039)

Five recommendations, each with its own evidence rating [6]: (1) build on informal sharing/proportionality understanding (minimal evidence); (2) help students see fractions as numbers, not just shaded shapes (moderate); (3) teach why fraction-computation procedures work (moderate); (4) teach ratio/rate/proportion conceptually before cross-multiplication (minimal); (5) improve teachers' own fraction content knowledge (minimal). The ordering is deliberate: informal intuition → fractions as numbers → conceptually-grounded procedures → ratio/proportion on the same magnitude sense, with cross-multiplication earned last rather than memorized first [6].

### 3. Whole-number bias and the canonical error catalogue

Whole-number bias (also called denominator neglect) is applying intuitions valid for natural numbers to fractions/decimals, where they no longer hold [5][10]. It is strongest in young learners, decreases from grade 4 to grade 8, and never fully disappears — even capable adults revert to whole-number shortcuts on fraction comparisons under time pressure or cognitive load, with a measurable cost detected in brain-response studies [10].

The dominant symptom is treating numerator and denominator as two independent integers. Two well-documented error families follow: **additive error** (adding numerators and denominators separately, e.g., 1/8 + 1/8 → 2/16, or 2/3 + 4/6 → 6/9 [5]) and **comparison error** (judging magnitude by the larger integer, e.g., 1/4 > 1/2 "because 4 > 2" [10][17][18]). A related misconception generalizes the unit-fraction rule ("bigger denominator → smaller piece") to all comparisons, when it is only guaranteed for unit fractions [18].

### 4. Number line vs. part-whole (area model) representation

US curricula historically favored part-whole/area models (a fraction as a shaded shape), while several Asian curricula emphasize a "measurement" interpretation — a fraction as a position on a line — earlier and more consistently [7]. Research increasingly favors the number line: a single point at 75% of the way from 0 to 1 forces the "one magnitude" interpretation that area models do not, since area models keep numerator and denominator visually separable [7][8]. Work comparing fraction-division tasks found number lines, but not area models, supported both accuracy and correct conceptual models [8]. The caveat across sources: number lines are the right target representation but are harder to teach well, so sequencing rather than outright replacement is what the evidence supports [7][8].

### 5. Ratio and proportional reasoning (Lamon; Tourniaire & Pulos)

Tourniaire and Pulos's 1985 review remains the reference synthesis, cataloguing correct and erroneous strategies on proportion problems and the variables that predict which appears [14]. Lamon defines proportional reasoning as "the deliberate use of multiplicative relationships to compare quantities and predict the value of one quantity based on the values of another," resting on understanding covariance of quantities together with invariance of their ratio [13]. Proportional reasoning is not additive reasoning extended — it requires a qualitative shift to multiplicative comparison, and even students fluent in fraction arithmetic often default to additive proportional strategies (e.g., "add 3 to both terms") on novel problems [13][14]. Lamon argues proportional reasoning is among the best predictors of later math success, which, combined with Siegler's fraction→algebra finding, makes this age band disproportionately consequential for long-term learning outcomes [3][13].

### 6. Decimal-specific misconception taxonomy (Steinle & Stacey)

Steinle, Stacey, and Chambers's research program (1998–2002) is the most machine-classification-ready taxonomy here, built from large-scale diagnostic test data rather than case studies [9][11]:

- **"Longer is larger"** — more digits after the point means bigger (e.g., 0.125 > 0.3). Sub-types: whole-number thinking, column-overflow thinking, "zero makes small," reverse thinking.
- **"Shorter is larger"** — the opposite (e.g., 0.3 > 0.496). Sub-types: denominator-focused thinking, reciprocal thinking, negative thinking.
- **"Apparent-expert" behavior** — correct-looking comparisons without real place-value understanding, including "money thinking" (treating decimals as dollars-and-cents past two digits) and specific difficulty with zero.

Reported prevalence for some sub-types (e.g., "zero makes small") was around 3% of tested students, a useful base rate for how aggressively to flag a rare-but-real misconception [11].

### 7. "Multiplication makes bigger" / "division makes smaller"

This pair traces to one root cause: multiplication first modeled as repeated addition, which is genuinely always-increasing for integers greater than 1 — so the belief is locally correct for years before failing on a fraction/decimal below 1, e.g., 0.5 × 0.2 = 0.1 (smaller), or 8 ÷ ½ = 16 (bigger) [12]. This is one of the few misconceptions with tested remediation: prediction-then-reveal activities that force a committed prediction before the counter-example outperformed direct explanation [12].

### 8. Ashlock's diagnostic error-pattern framework

Ashlock's *Error Patterns in Computation* (10 editions) is the closest thing to a general-purpose diagnostic manual for a wrong answer [15]. Its claim: nearly every recurring error is either **over-generalizing** a rule beyond where it's valid (e.g., multiplying tops-and-bottoms rule mis-applied to addition), or **over-specializing** a rule to only the narrow case first taught (e.g., a subtraction rule that silently assumes no regrouping, breaking on mixed numbers) [15]. Ashlock organizes fractions/decimals chapters by operation — a useful secondary axis alongside misconception name for tagging wrong answers.

### 9. Toward automatic classification: prior art

A 2026 arXiv paper describes "MalruleLib," a library encoding documented misconceptions as executable "malrules" with step-by-step reasoning traces, prevalence data, root-cause hypotheses, and remediation guidance, designed to classify an incorrect answer against catalogued patterns [16]. This is the shape of system the Math Challenge tutor needs: a rule-matching layer that infers which named malrule produced a specific wrong numeric answer and responds to the belief rather than genericized wrongness. Its lineage traces to Brown and Burton's 1978 "DEBUGGY" work — the founding case that wrong answers are usually the deterministic output of a consistent, nameable, incorrect procedure, not noise.

## Design implications for Math Challenge

1. Treat fractions/decimals/ratio (grades 3–8, ages 8–14) as *high-leverage* in scheduling and mastery-gating, not a unit of equal weight — the fraction→algebra predictive link is one of the strongest findings in math-education research [3][4].
2. Default fraction-introducing exercises to a **number-line** representation, with part-whole/area models as an earlier scaffold rather than the target — per the consensus that unidimensional magnitude representations build truer fraction sense [7][8].
3. Build a **named-misconception classifier**, not a correct/incorrect checker: match the student's specific wrong numeric answer against a small catalogue of documented malrules (see table) before falling back to a generic "incorrect."
4. Have the AI tutor **name the belief**, not just restate the procedure — "you added the tops and bottoms separately" is more diagnostic than "remember to find a common denominator."
5. Use **prediction-then-reveal** micro-interactions for "multiplication makes bigger" / "division makes smaller" — the one misconception here with tested, superior remediation over direct explanation [12].
6. Instrument decimal-comparison items to detect Steinle & Stacey sub-types specifically (longer-is-larger, shorter-is-larger, money-thinking, zero-makes-small); their known base rates (~3% for some) can calibrate how aggressively the tutor intervenes vs. lets a rare slip pass [9][11].
7. Tag every diagnosed error with Ashlock's over-generalization vs. over-specialization axis; it shapes tutor language ("this rule doesn't cover this case" vs. "this rule only works for X") and shows content designers which operations generate which mechanism [15].
8. Sequence ratio/proportion instruction so conceptual strategies (scaling, unit rates, build-up) are mastered before cross-multiplication unlocks, per IES recommendation 4 — cross-multiplication is a shortcut that hides the multiplicative understanding this age needs [6].
9. Since proportional reasoning requires a shift from additive to multiplicative comparison, design items that force the choice (e.g., recipe-scaling tasks where naive "add 3 to both terms" looks plausible but is wrong) so the misconception surfaces and can be named [13][14].
10. Log which misconception a child triggers repeatedly; a child producing the same malrule repeatedly is a stronger trigger for a targeted micro-lesson than aggregate item accuracy alone.
11. Author bilingual (EN/ES/FR/PT/DE) tutor copy per misconception as a template with number slots, not translated ad hoc per item — keeps "name the belief" phrasing consistent and lets one native reviewer sign off per misconception.
12. Since whole-number bias never fully disappears even in capable adults under load, don't gate "fraction mastery" as a permanent badge; track correct-under-time-pressure as separate from correct-untimed, given speed is already a scored dimension.

### Misconception → wrong answer → tutor response (starter table)

| Named misconception | Typical wrong answer it produces | What the AI tutor should say |
|---|---|---|
| Whole-number bias / fraction as two integers | 1/8 + 1/8 = 2/16 (adds numerators and denominators separately) [5] | "You added the tops and bottoms on their own — a fraction is one number. 1/8 and 1/8 are same-size pieces, so add the pieces: 1 + 1 = 2 eighths = 2/8." |
| Bigger-denominator-means-bigger-fraction | Says 1/4 > 1/2 "because 4 is bigger than 2" [10][17][18] | "You compared the bottom numbers like whole numbers. A bigger denominator means the whole is cut into more, smaller pieces. Let's cut the same pizza into 2 and into 4 pieces and compare." |
| Unit-fraction rule over-applied to non-unit fractions | Says 2/5 < 3/8 by comparing only denominators (5 < 8), ignoring numerators [18] | "That shortcut only works when the top number is 1 for both fractions. Here the tops differ too, so let's find a common denominator instead." |
| Numerator/denominator treated as unrelated integers (equivalence confusion) | Believes 2/4 and 3/6 are different amounts because the digits differ [19] | "Different top/bottom numbers can still be the same amount. Let's multiply 1/2 by 2/2 and see what we get." |
| "Longer decimal is larger" (whole-number / column-overflow thinking) | Judges 0.125 > 0.3 [9][11] | "You compared these like whole numbers — 125 vs 3. But right after the point, the tenths digit matters most: 0.3 = 0.300, and 3 tenths beats 1 tenth." |
| "Shorter decimal is larger" (denominator-focused / reciprocal thinking) | Judges 0.3 > 0.496 [9][11] | "Let's line them up to the same digits: 0.300 vs 0.496. Compare from the left — which tenths digit is bigger?" |
| "Money thinking" limit on decimals | Mishandles a third decimal digit, e.g., reads 0.145 as "1 dollar 45" [9][11] | "Money only has two digits after the point, but decimals can have more. This third digit is the thousandths place." |
| "Multiplication always makes bigger" | Predicts 0.5 × 0.2 > 0.5, confused it's 0.1 [12] | "True when you multiply by more than 1 — but 0.2 is less than one whole, so you're taking a small part of 0.5, not adding to it." |
| "Division always makes smaller" | Predicts 8 ÷ ½ < 8, confused it's 16 [12] | "Dividing by ½ asks 'how many halves fit in 8?' Halves are small, so lots fit — that's why the answer is bigger." |
| Additive (not multiplicative) proportional reasoning | "3 flour : 2 sugar, scale to 9 flour" answered as 8 sugar (+6 to both terms instead of ×3) [13][14] | "You added the same amount to both numbers, but a ratio grows by the same multiple. Flour tripled (3→9) — what happens to sugar if it also triples?" |
| Cross-multiplication without understanding | Sets up cross-multiplication correctly but can't explain why, or misapplies it to a non-proportional relation [6] | "Before we cross-multiply, tell me why these two ratios should be equal. If they're not really proportional, cross-multiplying gives a wrong-looking-right answer." |
| Over-generalization of an operation rule (Ashlock) | Applies the common-denominator rule to multiplication, e.g., 1/2 × 1/3 [15] | "That rule is for adding/subtracting. Multiplication works differently — multiply straight across tops and bottoms." |
| Over-specialization of an operation rule (Ashlock) | A subtraction procedure that worked once fails on mixed numbers needing regrouping, e.g., 3 − 1¾ [15] | "This rule worked for easier problems, but here we need to borrow from the whole number first. Let's rewrite 3 as 2 and 4/4." |

## Open questions for the project owner

1. Should the classifier match the malrule catalogue on *every* wrong answer, or only escalate to named-misconception feedback after a repeat (to avoid over-diagnosing a one-off slip)?
2. For age 8 (grade 3), should the number line be the first fraction model shown, or should a brief part-whole bridge precede it, given number lines are harder to teach well?
3. Should "correct under time pressure" and "correct untimed" be separate, displayed mastery signals for fractions (per implication #12), or would that add disproportionate UI complexity?
4. Should the misconception → tutor-response templates be authored natively per language, or templated and machine-translated with native review — a cost/tone trade-off for EN/ES/FR/PT/DE?
5. Should cross-multiplication be gated behind conceptual ratio mastery (IES recommendation 4), even against a student/parent wanting faster access to the "shortcut"?

## Sources

1. Siegler, R. S., Thompson, C. A., & Schneider, M. (2011). An integrated theory of whole number and fractions development. *Cognitive Psychology*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/STS2011.pdf
2. Siegler, R. S., Fazio, L. K., Bailey, D. H., & Zhou, X. (2013). Fractions: The new frontier for theories of numerical development. *Trends in Cognitive Sciences*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/2013-SieglerFazioBaileyZhou-fac.pdf
3. Siegler, R. S., Duncan, G. J., Davis-Kean, P. E., Duckworth, K., Claessens, A., Engel, M., Susperreguy, M. I., & Chen, M. (2012). Early Predictors of High School Mathematics Achievement. *Psychological Science*. https://journals.sagepub.com/doi/abs/10.1177/0956797612440101 (open PDF: https://files.eric.ed.gov/fulltext/ED552898.pdf)
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
