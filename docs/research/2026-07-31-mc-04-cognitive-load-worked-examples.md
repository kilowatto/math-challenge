# Cognitive Load Theory and Worked Examples in Mathematics
> Math Challenge research — 2026-07-31 — topic 04

## Resumen ejecutivo (ES)

- La Teoría de la Carga Cognitiva (CLT, John Sweller, UNSW) asume memoria de trabajo muy limitada y memoria a largo plazo (esquemas) casi ilimitada; la instrucción debe minimizar la carga "extraña" (mal diseño) y proteger la carga "productiva" (construir esquemas) [1][13].
- **Efecto del ejemplo resuelto**: para principiantes, estudiar un ejemplo resuelto enseña más, en menos tiempo y con menos errores, que resolver el mismo problema desde cero (Sweller y Cooper, 1985) [1][2].
- **Reversión de la pericia** (Kalyuga): al ganar competencia, ese mismo andamiaje se vuelve redundante y **perjudica** el aprendizaje [3][4].
- La solución práctica es el **desvanecimiento** (*fading*, Renkl): pasar gradualmente de ejemplo completo → un paso en blanco → problema completo [5][6].
- Los **prompts de autoexplicación** (Chi) potencian el efecto; combinados con el desvanecimiento producen ganancias medianas-grandes en transferencia cercana y lejana sin más tiempo de estudio (Atkinson, Renkl y Merrill, 2003) [6][14].
- **Atención dividida** y **redundancia** son errores de diseño: separar diagrama y texto, o repetir la misma información en dos canales, desperdicia memoria de trabajo [7].
- **Efecto libre de meta**: pedir "encuentra todos los valores que puedas" en vez de "encuentra X" reduce la carga de la búsqueda medios-fines [8].
- CLT tiene problemas serios de fondo: no existe una medida fiable de carga cognitiva (se usa mayormente una escala de un solo ítem) y la teoría ha atravesado varias crisis de réplica [9].
- La presión de tiempo **no es neutra**: para ~1/3 de los alumnos (Ashcraft) la prueba cronometrada origina la ansiedad matemática, y esa ansiedad ocupa memoria de trabajo igual que una tarea secundaria [11][12].
- Implicación central: **puntuar por velocidad no es gratis** — al aprender algo nuevo, la velocidad mide sobre todo automatización previa, no comprensión.
- Recomendación: mostrar ejemplo resuelto a quien no conoce el patrón, desvanecer pasos al acertar, y no cronometrar hasta que el patrón esté consolidado.

## Executive summary (EN)

- Cognitive Load Theory (CLT, John Sweller, UNSW): working memory is severely limited, long-term memory (schemas) is effectively unlimited; instruction should minimize extraneous load and protect germane (schema-building) load [1][13].
- **Worked-example effect**: for novices, studying a worked example teaches more, faster, with fewer errors, than solving the same problem unaided (Sweller & Cooper, 1985) [1][2].
- **Expertise reversal effect** (Kalyuga): as competence grows, the same scaffolding becomes redundant and can actively **harm** learning [3][4].
- The fix is **fading** (Renkl): gradually moving from full example → one blank step → independent problem [5][6].
- **Self-explanation prompts** (Chi) amplify the effect; combined with fading they produce medium-large gains on near **and** far transfer at no extra time cost (Atkinson, Renkl & Merrill, 2003) [6][14].
- **Split-attention** and **redundancy** are design failures: separating diagram from text, or repeating information across two channels, wastes working memory [7].
- **Goal-free effect**: "find as many values as you can" instead of "solve for X" lowers means-ends search load [8].
- CLT has real foundational problems: no validated measure of cognitive load exists (mostly single-item effort scales), and the theory has been through multiple replication crises [9].
- Time pressure is **not neutral**: for roughly a third of learners (Ashcraft), timed testing is itself the origin of math anxiety, which consumes working memory like a secondary task [11][12].
- Core implication: **speed-based scoring is not free** — while a concept is new, speed mostly measures prior automaticity, not understanding.
- Design recommendation: full worked example for unfamiliar patterns, fade as the learner succeeds, and hold off timing until the pattern is consolidated.

## Findings

### 1. Theoretical core: working memory, schemas, and three loads

CLT models human cognition per Geary's split of *biologically primary* knowledge (evolutionarily prepared, e.g. spoken language) versus *biologically secondary* knowledge (culturally important but not prepared for, e.g. written arithmetic and algebra) [13]. Because math is biologically secondary it must be explicitly taught, and it is bottlenecked by working memory, which holds only a few novel elements at once and loses them within seconds unless organized into a long-term-memory schema [1][13]. CLT splits load into **intrinsic** (unavoidable complexity, driven by *element interactivity* — how many interacting pieces must be held in mind at once), **extraneous** (added by poor design, no learning value), and **germane** (effortful processing that builds the schema). Design should minimize extraneous load so spare capacity serves germane processing [1][7][13].

### 2. The worked-example effect

Sweller and Cooper (1985) taught algebra across five experiments and found that, holding study time constant, worked-example students solved post-test problems roughly twice as fast with about one-fifth the errors of students who solved unaided from the start [1][2]. Unaided problem-solving forces a search process that competes with schema-building; reading an example instead directs full capacity at recognizing solution structure. Sweller calls it "the best known and most widely studied of the cognitive load effects" [1]. Later work (Van Gog, Kester & Paas, 2011) shows example-only and alternating example-problem pairs beating pure problem-solving on other procedural domains (e.g., circuit analysis), so the effect generalizes beyond algebra [1].

### 3. Expertise reversal and redundancy

The benefit is not permanent. Kalyuga showed across engineering, relay-circuit, and PLC training that worked-examples' advantage over problem-solving **shrinks and reverses** as trainees gain experience [3][4]. Mechanism: an efficient schema already exists, so re-showing every step forces processing of unneeded information, wasting capacity that could go to retrieval practice — and denies the practice itself [3][4]. This pushed Sweller to revise his own 1988 claim that problem-solving should generally be minimized: the right amount of unaided solving is a function of *current* expertise, not curricular stage [4].

### 4. Fading, completion problems, and self-explanation

Renkl's **fading**: start fully worked, then omit one step (a *completion problem*), then more, until the learner solves unaided. Fading can go forward or backward; backward (omit the last step first) is generally recommended since the final step usually anchors the connection to the goal [5]. Faded examples in geometry produced deeper conceptual understanding than blocks of unfaded examples [5]. Fading alone reliably helps near-transfer but not far-transfer. Atkinson, Renkl and Merrill (2003, *J. Educational Psychology*, 95(4), 774–783) paired fading with **self-explanation prompts** — brief questions asking learners to state the principle behind each step, building on Chi's finding that strong learners spontaneously self-explain and weak learners do not [6][14]. Across two experiments this combination produced medium-to-large gains on both near and far transfer with no added study time — "highly recommendable" per the authors [6]. A broader meta-analysis of self-explanation reports a mean effect size around g = 0.66 across 69 comparisons [14].

### 5. Split-attention and redundancy in design

Two design-failure effects. **Split-attention**: understanding requires mentally integrating physically or temporally separated sources (diagram apart from caption, or a step shown before its explanation); integrated, well-designed materials outperform split ones [7]. **Redundancy**: presenting identical information twice in different channels (e.g., narrating on-screen text word-for-word) adds reconciliation cost with no benefit [7]. For math UI: a solution step and the reasoning behind it should occupy the same visual region at the same time; pick one channel per unit of information.

### 6. The goal-free effect

A specific-goal problem ("solve for x") triggers **means-ends analysis**: holding goal state, current state, their difference, and candidate operators simultaneously — high load, useful for finding an answer but poor for learning method, since attention chases the goal rather than the structure [8]. A **goal-free** version ("find as many values as you can") removes the target, so learners work forward opportunistically from what they know, lowering load and directing attention to structure, improving learning even though it doesn't look like "solving the problem" [8].

### 7. Critiques, measurement problems, replication debate

CLT's own leading proponent acknowledges a history of "replication crises and incorporation of other theories," revised more than once after failed replications — most visibly the 1988 minimize-problem-solving stance, undone by expertise reversal [3][4][9]. The deeper unresolved criticism is **measurement**: there is no validated, reliable instrument for cognitive load itself; the dominant practice is a single self-report effort-rating item, which cannot be checked for reliability and conflates felt effort with what the manipulation actually did to working memory [9]. Many classic effects are inferred from behavioral outcomes (errors, transfer, time) with load treated as unmeasured — reasonable in aggregate but hard to diagnose case-by-case. Critics also note "cognitive load" sometimes functions as a post-hoc label for any theory-consistent result rather than an independently measured construct — a critique shared with psychology's broader replication-crisis literature, not unique to CLT [9].

### 8. Timed practice, speed scoring, and math anxiety

Most relevant to a points-for-speed design. Ashcraft's program shows math anxiety functions as a concurrent secondary task, occupying working memory (the executive component) that would otherwise serve the arithmetic — producing errors and slowdowns that look like a competence deficit but are a resource deficit induced by anxiety, not by the math [11]. Timed testing reliably reveals anxiety-linked gaps on arithmetic that don't appear on untimed tests of the same content — the clock, not the math, is what's being measured under pressure for anxious learners [11][12]. Boaler: timed testing onset is, for a meaningful share of students, the origin point of math anxiety itself, and once anxious, working memory is partly consumed by that anxiety, blocking access to facts they otherwise know — a self-reinforcing loop [12]. The evidence isn't one-sided: some studies find time-matched conditions can increase accuracy, and one found no significant three-way interaction of memory, anxiety, and timing [11] — real but moderated by anxiety level and by whether "timed" means a hard clock or paced availability.

Synthesis: speed is a legitimate marker of *automaticity* once a schema is consolidated — fast, effortless retrieval is exactly what germane load "paid for" [1][13]. But speed measured *before* consolidation doesn't measure understanding; it measures whatever effortful process the learner is substituting, and a clock on top of that adds exactly the extraneous load CLT says to avoid, at the moment working memory should be protected, not taxed [1][7][8][11].

## Design implications for Math Challenge

1. **Show a full worked example before a child's first attempt at a new pattern** (never solved, or last N attempts on that skill failed) rather than "struggle first" — matches the worked-example effect for novices [1][2].
2. **Never pair "new pattern" with a countdown clock.** Zero-weight speed scoring on first exposures; introduce timing only once the pattern is solved correctly without a worked example present [11][12].
3. **Fade automatically from a mastery signal**, not a fixed item count: recent accuracy, hint usage, unaided-step count select the next rung (full example → one blank → two blanks → full problem), per Renkl's completion-problem sequence [5][6].
4. **Bias fading backward** (omit the last step first), since it anchors the goal connection and should be practiced early [5].
5. **Pair every faded step with a one-tap self-explanation prompt** (multiple-choice for younger ages, free text/voice for older) — the one intervention shown to add far-transfer at no time cost [6][14].
6. **Design against split-attention and redundancy in the UI**: keep a step and its explanation in the same visual region at once; never narrate and display identical text simultaneously [7].
7. **Use goal-free framings for placement/diagnostic items** ("find as many values as you can") to reveal prior knowledge at lower load, switching to goal-specific scoring once mastery assessment begins [8].
8. **Treat expertise reversal as a hard stop on scaffolding**: past a mastery threshold, withhold worked examples/hints by default (available only on request), since redundant scaffolding measurably hurts advanced learners [3][4].
9. **Decouple correctness points from speed points** as separately tunable channels; default speed-weight near zero until the fade-ladder reaches "full problem, no hints." Tell parents/teachers explicitly that raising speed weight increases anxiety-linked variance for below-mastery learners [11][12].
10. **Don't let a global session/streak timer substitute for per-skill mastery gating** — a meta-level clock can reintroduce the same anxiety effect even with untimed problems; make streak timers skippable and never block worked-example access.
11. **Log which fading rung a child needed as a mastery signal for teachers/parents**, not just correctness — scaffolding-withdrawal shape is itself diagnostic of schema strength [5][6].
12. **Do not over-instrument "cognitive load" directly** (e.g., from response-time variance alone); use behaviorally validated proxies — accuracy trajectory across the fade-ladder, self-explanation quality — since even CLT's own literature has no validated direct load measure to build on [9].

## Open questions for the project owner

1. Should speed-based points be **on by default** for any age band given the anxiety evidence, or opt-in per parent/teacher account?
2. What mastery threshold (e.g., N consecutive correct at "full problem" rung) should gate untimed-to-timed transition per skill?
3. Should self-explanation prompts be mandatory or skippable, given ages ~4-6 may lack the metacognitive language for them?
4. Does "find as many values as you can" (goal-free framing) translate cleanly across EN/ES/FR/PT/DE without losing its open-endedness?
5. Should the fading ladder be visible to the child, or invisible/backend-only?

## Sources

1. [Worked-example effect — Wikipedia](https://en.wikipedia.org/wiki/Worked-example_effect)
2. [Sweller, J., & Cooper, G. A. (1985). The Use of Worked Examples as a Substitute for Problem Solving in Learning Algebra. Cognition and Instruction, 2(1), 59–89 — citation record](https://notes.andymatuschak.org/zYHdLJ7TFdpcwGtqDChMNbm)
3. [Expertise reversal effect — Wikipedia](https://en.wikipedia.org/wiki/Expertise_reversal_effect)
4. [The "Expertise Reversal Effect" — Cognitive Load Theory (blog, summarizing Kalyuga et al. 2001, 2003, 2007)](https://cognitiveloadtheory.wordpress.com/the-expertise-reversal-effect/)
5. [Exploring the Use of Faded Worked Examples — ERIC](https://files.eric.ed.gov/fulltext/EJ1086007.pdf)
6. [Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning From Studying Examples to Solving Problems: Effects of Self-Explanation Prompts and Fading Worked-Out Steps. Journal of Educational Psychology, 95(4), 774–783 — ERIC record](https://eric.ed.gov/?id=EJ678596)
7. [Split attention effect — Wikipedia](https://en.wikipedia.org/wiki/Split_attention_effect)
8. [The Goal-Free Effect (Sweller & Ayres) — Semantic Scholar](https://www.semanticscholar.org/paper/The-Goal-Free-Effect-Sweller-Ayres/ba2fcd3134382fa4cd6e415f8e3333fbb0e131dd)
9. [The Development of Cognitive Load Theory: Replication Crises and Incorporation of Other Theories Can Lead to Theory Expansion — Educational Psychology Review (2023)](https://link.springer.com/article/10.1007/s10648-023-09817-2)
10. [Cognitive load theory: Research that teachers really need to understand — NSW Department of Education (CESE, 2017)](https://education.nsw.gov.au/content/dam/main-education/about-us/educational-data/cese/2017-cognitive-load-theory.pdf)
11. [Ashcraft, M., & Krause, J. (2007). Working Memory, Math Performance, and Math Anxiety. Psychonomic Bulletin & Review, 14, 243–248](https://link.springer.com/article/10.3758/BF03194059)
12. [Boaler, J. Speed and Time Pressure Blocks Working Memory (Stanford / youcubed, reprint)](https://www.dyslexicadvantage.org/wp-content/uploads/2015/12/Speed_and_Time_Pressure_Blocks_Working_Memory_.pdf)
13. [Sweller, J. (2019 et al.). Cognitive Architecture and Instructional Design: 20 Years Later. Educational Psychology Review](https://leadinglearner.me/wp-content/uploads/2019/02/sweller2019_article_cognitivearchitectureandinstru.pdf)
14. [Chi, M. T. H., & Leeuw, N. Eliciting Self-Explanations Improves Understanding — Semantic Scholar](https://www.semanticscholar.org/paper/Eliciting-Self-Explanations-Improves-Understanding-Chi-Leeuw/dd869eeb2e13264d47eb0d150d05912b7afd9aba)
15. [Does working memory moderate the effect of fading on math performance? Miller-Cotto et al. British Journal of Educational Psychology (2026)](https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjep.12781)
16. [Sweller, J. (1988). Cognitive Load During Problem Solving: Effects on Learning. Cognitive Science, 12(2), 257–285 — Wiley Online Library](https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1202_4)
