# Beyond High School: Proof, Olympiad Training, and PhD-Level Mathematics — What "PhD Mode" Could Realistically Contain

> Math Challenge research — 2026-07-31 — topic 12

## Resumen ejecutivo (ES)

- La investigación en educación matemática sobre cursos de "transición a la demostración" muestra que construir demostraciones y **validar** (juzgar la corrección de) demostraciones son habilidades distintas: un curso centrado en construcción no necesariamente mejora la capacidad de validación [3][4].
- Selden & Selden documentan que los estudiantes de matemáticas se fijan en "rasgos superficiales" — notación algebraica y cálculos — y prestan poca atención a la estructura global del argumento al validar una prueba [3][4].
- Los errores más recurrentes con cuantificadores son: no introducir una variable al probar un enunciado universal, asignar propiedades extra a una variable existencial, intercambiar el orden de cuantificadores (típico en pruebas ε-δ), y negar mal un enunciado (usada especialmente en pruebas por contradicción) [5][6].
- El método Moore / aprendizaje por indagación (IBL) es la pedagogía dominante en cursos avanzados de prueba: el instructor da axiomas y una secuencia de problemas: cero lectura de texto, los estudiantes prueban todo y se enseñan entre sí [1][2].
- El entrenamiento olímpico (IMO, Putnam) no enseña un plan de estudios lineal sino heurísticas de resolución de problemas (Polya: entender, planear, ejecutar, revisar) más un banco enorme de problemas categorizados por técnica — es la base metodológica de AoPS y del libro de Engel, "Problem-Solving Strategies" [7][8][9].
- La calificación real de IMO y Putnam usa escalas pequeñas con "huecos": IMO 0-7 (créditos parciales no acumulativos, se falla por gap conceptual, no por punto perdido); Putnam 0-10 pero prácticamente solo se otorgan {0,1,2,8,9,10} — el "Gap of Death" entre 3 y 7 rara vez se usa [10][11][12].
- El plan de estudios de un doctorado en matemáticas no es un currículo único: la mayoría de universidades exige 2-4 exámenes de calificación elegidos entre álgebra, análisis real, análisis complejo, topología (algebraica/diferencial), geometría diferencial y EDPs/probabilidad [13][14].
- La Clasificación Temática de Matemáticas (MSC 2020) tiene 63 áreas de dos dígitos — de 00 (general) a 97 (educación matemática) — y es la taxonomía oficial usada por zbMATH y MathSciNet para catalogar toda la investigación matemática publicada [15][16].
- Existen sistemas de calificación automática ya maduros para matemática universitaria: STACK (Moodle + Maxima como motor de álgebra computacional) y WeBWorK (Perl/PG) califican respuestas numéricas y simbólicas, no demostraciones [17][18][19].
- Los asistentes de prueba formal (Lean 4 + mathlib) permiten calificar demostraciones reales de forma mecánica —el compilador certifica corrección—, y el "Natural Number Game" demuestra que esto es viable como producto educativo gamificado [20][21].
- La calificación automática de demostraciones en **lenguaje natural** (no formalizadas) sigue sin resolverse: IMO-GradingBench (2025) muestra que los mejores modelos (o3, Gemini 2.5 Deep Think) aciertan solo ~52-54% de las calificaciones humanas en un entorno ciego, con errores concentrados entre "parcial" e "incorrecto" [22].
- Conclusión de diseño: un "PhD mode" auto-calificable en Math Challenge debe evitar prosa de demostración libre y usar en su lugar: verificación simbólica (SymPy-like), opción múltiple sobre pasos de prueba, ordenamiento de pasos, entrada de contraejemplos, y micro-pruebas verificadas en Lean para una franja explícitamente "formal".

## Executive summary (EN)

Advanced mathematics beyond high school splits into three pedagogically and assessment-wise distinct tracks: (1) the **transition-to-proof** course, where research (Selden & Selden, IBL/Moore-method literature) shows that proof *construction* and proof *validation* are separable skills, and that quantifier/definition handling is the single most persistent source of student error [1-6]; (2) **olympiad/competition training** (IMO, Putnam, AoPS, Engel, Polya), which teaches a heuristic problem-solving process and a technique taxonomy rather than a linear curriculum, and which is graded by humans on coarse, non-additive scales precisely because partial mathematical arguments resist mechanical scoring [7-12]; and (3) **graduate-level mathematics**, whose content is anchored by the official Mathematics Subject Classification (63 top-level areas) and whose gatekeeping mechanism — the PhD qualifying exam — samples 2-4 of a fixed set of core subjects (algebra, real/complex analysis, topology, geometry, PDEs/probability) [13-16]. On the auto-grading side, mature infrastructure exists for numerical/symbolic answer checking (STACK+Maxima, WeBWorK+PG, SymPy-style equivalence checking) but none of it grades free-form proofs [17-19]. The only mechanically sound way to auto-grade an actual proof is to have it checked by a proof assistant (Lean 4 + mathlib), which the Natural Number Game already packages as a teaching game [20][21]; grading proofs written in natural language by AI remains an open research problem, with 2025 benchmarks (IMO-GradingBench) putting the best LLM graders around 52-54% agreement with human judges in blind evaluation [22]. This sets a hard constraint for Math Challenge's "PhD mode": content can go arbitrarily deep, but the *format* of each question must be chosen up front to fit one of a small number of genuinely auto-gradable shapes.

## Findings

### (a) The transition-to-proof course and research on teaching proof

Most US departments insert a "transition to proof" course between calculus and the first proof-heavy course (algebra, real analysis) [1]. Its dominant pedagogy is the **Moore method**: the instructor gives only axioms and a sequenced problem list; students may not consult texts, prove everything themselves, and present to each other [1][2]. Evidence for effectiveness is mostly qualitative and long-run (more students moving into research) rather than tightly quantitative [2].

Selden & Selden's research draws a distinction central to assessment design: **proof construction** and **proof validation** (judging whether someone else's argument is correct) are separate competencies, and a construction-focused course does not reliably improve validation [3][4]. Eye-tracking and think-aloud studies show novices fixate on surface features (algebraic manipulation) while experts track global logical structure; validation is framed as active sense-making, not a binary check — which is exactly why it resists a machine-applied rubric [3][4].

Quantifier handling is the single most-replicated failure area: one study of 61 students found **none** could consistently rewrite an informal claim as its correct formal quantified equivalent [1]. Recurring failure modes: not introducing a variable when proving a universal statement; over-attributing properties to an existential witness; swapping quantifier order (classic in ε-δ proofs); and mis-negating a statement (stating the "opposite" rather than the logical negation), which undermines proof by contradiction [5][6]. A linear-algebra study similarly found students "talking past each other" over differing meanings of "unique" [6]. These are discrete, well-defined failure modes — each targetable by a narrow, checkable exercise (see Design Implications).

### (b) How olympiad training works

Olympiad training is organized around **heuristics + a technique bank**, not a linear syllabus. Pólya's *How to Solve It* (1945) supplies the four-stage heuristic — understand, plan, execute, look back — underlying essentially all competition-training literature [7][11]. Engel's *Problem-Solving Strategies* (Springer, 1998), aimed at trainers up to IMO/Putnam level, organizes by technique (invariants, pigeonhole, extremal principle, induction, coloring/counting) rather than MSC subject [10][11].

**AoPS** operationalizes this at scale — problems before explanations, curricula from Prealgebra through MATHCOUNTS/AMC/AIME/ARML and WOOT (olympiad training); every US IMO team member since 2015 has been an AoPS student [8]. Putnam prep follows the same problem-set-driven model, reinforced by seminar-style group sessions [9][11].

Grading in both is deliberately coarse and **non-additive** — a rejection of point-per-step scoring. IMO problems score 0-7, graded either "from 7 down" (near-complete) or "from 0 up" (missing a critical idea); partial credit reflects conceptual progress, not line count [23][24]. Putnam uses 0-10 but effectively only awards {0,1,2,8,9,10} — the "Gap of Death" (3-7) is nearly unused, so a proof missing full rigor scores ≤2 regardless of surrounding correct-looking work [12]. This is a direct signal that human-judged partial credit on proofs resists any additive, mechanical rubric — the same gap automated graders still cannot close (part d).

### (c) The topic taxonomy of advanced mathematics and PhD qualifying exams

The **Mathematics Subject Classification (MSC 2020)**, jointly maintained by AMS/MathSciNet and zbMATH, is the closest thing to an official taxonomy of all mathematics: 63 top-level two-digit codes, from `00` General and `03` Logic through the algebra family (`12`-`20`), the analysis/geometry/topology family (`26`-`58`), probability/statistics (`60`-`62`), applied areas (`68` CS, `76`-`86` mechanics, `90`-`94` OR/game theory/information), to `97` Mathematics education [15][16]. Each code subdivides into lettered second-level areas [15].

PhD qualifying exams sample a small, fairly universal core rather than the full 63 areas. Harvard names six: **Algebra** (Sylow, rings/modules, Galois, representation theory), **Algebraic geometry** (varieties, Riemann-Roch), **Complex analysis** (Cauchy theory, residues, Riemann surfaces), **Algebraic topology** (fundamental group, (co)homology, Poincaré duality), **Differential geometry** (manifolds, bundles, curvature), and **Real analysis** (measure theory, Lp spaces, Fourier analysis, PDEs, probability, Sobolev spaces) [13]. Other schools (TCU, UNT, Stanford, Penn State) require 2-4 exams from a similar, smaller menu — confirming that "PhD-level" means depth in a handful of core pillars, not encyclopedic MSC coverage [14].

### (d) Auto-gradable formats for advanced math

**STACK** (Moodle, backed by the **Maxima** CAS) and **WeBWorK** (Perl-based "PG" language) are the two mature, widely deployed systems for **numeric/symbolic** answer checking: both validate input, check algebraic equivalence (not string match) via random per-student parameters, and give instant feedback — neither claims to grade a written proof [17][18][19]. The same technique — subtract, simplify, check the residual is symbolically zero, or fall back to numeric evaluation — is what SymPy-style libraries provide programmatically, and underlies contemporary math-LLM grading harnesses [25].

For actual **proof** grading, the only mechanically sound approach is a proof assistant: **Lean 4 + mathlib** compiles a proof and accepts or rejects it — no partial credit, but zero ambiguity [20]. The **Natural Number Game** (Imperial College London) proves this works as a teaching product, gamifying the Peano axioms so "obvious" facts like `a+b=b+a` must be proved to a compiler; "Mathematics in Lean" extends the idea to undergraduate content [20][21].

Grading **natural-language** proofs — the format students actually write — remains unsolved. **LeanTutor** (2026) autoformalizes a proof step-by-step into Lean, but needs a pre-existing formalized staff solution [26]. **IMO-GradingBench** (2025), from 1,000 human-graded IMO solutions, found even frontier models (o3, Gemini 2.5 Deep Think) reach only 52-54% exact agreement with human graders *blind* (no reference), with errors concentrated in distinguishing "partial" from "wrong"; humans *with* a reference correlate at 0.96 [22]. **RefGrader** (2025) improves reliability by always grading against a reference rather than blind, at the cost of needing that reference pre-built [27]. Natural-language proof grading by AI is real but too unreliable at the hardest boundary to be the sole grading mechanism for instant, trustworthy feedback.

## Design implications for Math Challenge

Proposed bands above high school, each with concrete topics and — critically — an honest, realistic auto-grading mechanism:

1. **Band U1 — Transition to Proof.** Topics: propositional/predicate logic, quantifier manipulation (∀/∃ order, negation), direct proof, contrapositive, induction, proof by contradiction, basic set theory and functions. Auto-grading: multiple-choice/multi-select on "which of these is the correct negation of this statement," "insert the missing quantifier," and **step-ordering** exercises (shuffle a valid proof's lines, student reorders them) — this directly targets the documented quantifier and structure failures from Selden & Selden and the quantifier-order literature [3][5][6].

2. **Band U2 — Proof validation as its own skill.** Present a short "proof" with a seeded flaw (wrong quantifier order, unjustified step, circular reasoning) and ask the student to **select the exact line** that breaks, or classify the whole argument as valid/invalid/incomplete. This is directly motivated by Selden & Selden's finding that construction practice does not transfer to validation ability — it needs its own exercise type [3][4].

3. **Band U3 — Abstract Algebra (groups, rings, fields).** Topics: group axioms, Lagrange's theorem, cyclic groups, homomorphisms/isomorphisms, quotient groups, basic ring/field theory. Auto-grading: numeric/structural answers (order of an element, is this map a homomorphism — yes/no with a required counterexample element if no), Cayley-table completion, multiple-choice on "which axiom fails here."

4. **Band U4 — Real Analysis.** Topics: sequences/limits, ε-δ continuity, differentiability, Riemann integration, series convergence tests. Auto-grading: numeric answer (find N such that |a_n - L| < ε), multiple-choice on which convergence test applies, and **counterexample entry** ("give a sequence that converges pointwise but not uniformly") checked against a library of known-valid counterexamples plus a symbolic/numeric verifier (evaluate the candidate at sample points).

5. **Band U5 — Linear Algebra beyond the intro course.** Topics: eigenvalues/eigenvectors, diagonalization, Jordan form, inner product spaces, spectral theorem. Auto-grading: fully numeric/symbolic — this band is essentially free with a SymPy-equivalent CAS backend (the STACK/Maxima model applies almost directly) [17][18].

6. **Band U6 — Combinatorics & Number Theory (olympiad-flavored).** Topics: pigeonhole, invariants, modular arithmetic, generating functions, extremal combinatorics — modeled directly on Engel's taxonomy and AoPS/WOOT structure [8][10]. Auto-grading: this band is the best fit for Math Challenge's existing model — nearly all these problems have a **single numeric or closed-form final answer**, exactly like AMC/AIME/Putnam-style fill-in problems, so no new grading mechanism is needed beyond what the ladder already does lower down.

7. **Band G1 — Topology.** Topics: metric/topological spaces, compactness, connectedness, continuity, fundamental group basics. Auto-grading: multiple-choice ("is this space compact — yes/no, pick the covering that fails"), True/False with justification-selection (pick which of 4 candidate justifications is the valid one), since open-ended topological proofs are not mechanically checkable without formalization.

8. **Band G2 — Measure Theory & Graduate Real Analysis.** Topics: σ-algebras, Lebesgue measure, measurable functions, Lp spaces, dominated convergence. Auto-grading: mostly numeric (compute a Lebesgue integral, determine if a function is in L^p) plus multiple-choice on which convergence theorem applies to a given scenario — a near-direct mapping of Harvard's real-analysis qualifying syllabus [13].

9. **Band G3 — Complex Analysis.** Topics: holomorphicity, Cauchy's theorem, residues, conformal maps, Riemann mapping theorem. Auto-grading: numeric (evaluate a contour integral via residues — a classic CAS-checkable task) plus multiple-choice on singularity classification.

10. **Band G4 — Algebraic Topology / Differential Geometry.** Topics: homology/cohomology computation for standard spaces (spheres, tori, projective spaces), curvature of standard surfaces. Auto-grading: numeric (Betti numbers, Euler characteristic) — computable and checkable — but genuine proof content (e.g., "prove Poincaré duality for this space") is **not auto-gradable** and should be presented as read-only "worked example" content, not as a scored challenge.

11. **Band PhD-1 — PDEs & Probability (qualifying-exam core).** Topics: heat/wave/Laplace equations, weak solutions, Sobolev embedding basics; measure-theoretic probability, characteristic functions, central limit theorem. Auto-grading: numeric solution-checking for canonical PDEs (verify a candidate solution satisfies the PDE and boundary conditions via direct substitution — purely mechanical and CAS-friendly) and probability computation questions.

12. **Band PhD-Lean — "Formally Verified" capstone track, clearly labeled as different from the rest.** Topics: a curated sequence of small lemmas (in the spirit of the Natural Number Game) building toward one nontrivial result, authored in Lean 4 against mathlib. Auto-grading: the compiler itself is the grader — a proof is graded pass/fail by successful compilation, with zero grading ambiguity, at the cost of a steep authoring investment (each exercise needs a Lean-checkable skeleton) and a real learning-curve cost for the player (Lean syntax, not just mathematics) [20][21].

13. **Explicit non-goal: free-form natural-language proof grading by AI, as a scored (not tutor-feedback) mechanism.** Given IMO-GradingBench's ~52-54% blind-grading agreement with human judges even from frontier models in 2025-2026 [22], Math Challenge should **not** ship a feature that assigns a pass/fail or numeric score to student-written prose proofs via LLM judgment alone. It is appropriate, however, for the existing "AI tutor feedback after each challenge" to give qualitative, non-scoring commentary on a submitted proof sketch (this is a coaching feature, not a graded assessment, so a wrong or overconfident judgment is a UX quality issue, not a grading-integrity issue) — this distinction (feedback vs. score) is exactly what keeps the PhD-mode bands above honest about what "auto-gradable" means.

14. **Cross-cutting mechanism: adopt RefGrader's key idea — always grade against a reference, never blind — for any AI-assisted judgment used anywhere in PhD mode.** Since reference-based agentic grading measurably outperforms blind grading [22][27], any place the tutor evaluates open-ended reasoning (not just the no-go case above) should always be given the canonical solution/rubric as context, never asked to judge a proof cold.

## Open questions for the project owner

1. Should "PhD mode" include the Lean-checked capstone track (item 12) given its authoring cost, or stay entirely within numeric/multiple-choice/counterexample formats?
2. Is a coaching-only (non-scored) AI proof-sketch review acceptable for the top bands, or does the product need every challenge to produce a hard pass/fail score?
3. Should band boundaries follow MSC top-level codes strictly (for a "browse by MSC area" feature) or stay organized around the PhD-qualifying-exam core (which is narrower and more pedagogically standard)?
4. Is there appetite for licensing/integrating an existing CAS-backed engine (STACK's Maxima pipeline is open-source and Moodle-native) rather than building numeric/symbolic equivalence checking from scratch?

## Sources

1. ERIC ED502664 — Inquiry Based Learning: A Modified Moore Method Approach — https://eric.ed.gov/?id=ED502664
2. MAA Mathematical Communication — Moore Method & Inquiry-Based Learning — https://mathcomm.org/courses/modified-moore-method/
3. Selden & Selden, "Validation of Proofs as a Type of Reading and Sense-Making," Tennessee Tech Math Dept Technical Report TR-2015-4 — https://www.tntech.edu/cas/pdf/math/techreports/TR-2015-4.pdf
4. "Effective Proof Reading Strategies for Comprehending Mathematical Proofs," Intl. Journal of Research in Undergraduate Mathematics Education (Springer) — https://link.springer.com/article/10.1007/s40753-015-0011-0
5. "Overcoming Students' Difficulties in Learning to Understand and Construct Proofs," ERIC ED518604 — https://files.eric.ed.gov/fulltext/ED518604.pdf
6. "Mathematics students talking past each other: ... uniqueness quantification," ZDM Mathematics Education (Springer) — https://link.springer.com/article/10.1007/s11858-019-01099-9
7. Pólya's Four-Step Problem-Solving Method overview — https://www.henrikbachmann.com/uploads/7/7/6/3/77634444/polya4steps_numirai2021.pdf
8. Art of Problem Solving — official site and WOOT — https://artofproblemsolving.com/ and https://artofproblemsolving.com/woot
9. Putnam preparation (Stanford) — https://web.stanford.edu/~cm5/putnam.html
10. Arthur Engel, "Problem-Solving Strategies" (Springer) — reference listing — https://www.abebooks.com/Problem-Solving-Strategies-Arthur-Engel-Springer-New/8836405588/bd
11. Putnam and Polya Problem-Solving Seminars (Stanford) — http://math.stanford.edu/~vakil/putnam07/
12. Putnam grading scale / "Gap of Death" — Think Academy Education Briefs — https://www.thethinkacademy.com/blog/edubriefs-what-is-the-putnam-competition-a-guide-for-k12-families/
13. Harvard Mathematics Department — The Qualifying Exam Syllabus — https://www.math.harvard.edu/graduate/study-the-qualifying-exam/the-qualifying-exam-syllabus/
14. TCU Practice for Math PhD Prelims — https://faculty.tcu.edu/richardson/Prelims/
15. MSC2020 official site — https://msc2020.org/
16. Wikipedia — Mathematics Subject Classification — https://en.wikipedia.org/wiki/Mathematics_Subject_Classification
17. STACK — About — https://stack-assessment.org/About/
18. STACK question type — MoodleDocs — https://docs.moodle.org/502/en/STACK_question_type
19. WeBWorK — Wikipedia — https://en.wikipedia.org/wiki/WeBWorK
20. Natural Number Game (Imperial College London), GitHub — https://github.com/ImperialCollegeLondon/natural_number_game
21. Learning Lean 4 (Lean community, incl. Mathematics in Lean) — https://leanprover-community.github.io/learn.html
22. IMO-GradingBench summary — EmergentMind — https://www.emergentmind.com/topics/imo-gradingbench
23. USAMO 2003 Recommended Marking Scheme (Evan Chen) — https://web.evanchen.cc/upload/usamo-2003-rubric.pdf
24. MathArena — IMO Blogpost — https://matharena.ai/imo/
25. SymPy documentation — Gotchas and Pitfalls (expression equality vs. equivalence) — https://docs.sympy.org/latest/explanation/gotchas.html
26. LeanTutor: Towards a Verified AI Mathematical Proof Tutor (arXiv 2506.08321) — https://arxiv.org/html/2506.08321v2
27. RefGrader: Automated Grading of Mathematical Competition Proofs using Agentic Workflows (arXiv 2510.09021) — https://arxiv.org/pdf/2510.09021
