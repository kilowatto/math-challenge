# Intelligent Tutoring Systems and Learner Modelling: BKT, DKT, PFA, and the Math Garden Elo Approach

> Math Challenge research — 2026-07-31 — topic 13

## Resumen ejecutivo (ES)

- BKT (Corbett & Anderson 1995) modela el dominio de una habilidad con cuatro parámetros — `P(L0)` maestría inicial, `P(T)` prob. de aprender, `P(G)` prob. de adivinar, `P(S)` prob. de "resbalón" — con valores de ejemplo ampliamente citados `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (motor de MATHia) combina "model tracing" (reglas de producción paso a paso) con knowledge tracing (dominio agregado por habilidad); son mecanismos distintos y a menudo confundidos [2].
- La evidencia de eficacia es mixta: What Works Clearinghouse (2016) califica Cognitive Tutor Algebra I como "efectos mixtos" en álgebra (+4 puntos, rango -7 a +19) y "sin efecto discernible" en logro general; Geometry obtuvo efecto potencialmente negativo (-8) [3].
- El ensayo de RAND (Pane et al. 2014) no halló efecto en el año 1 y sí ~0.21 desviaciones estándar en el año 2 — la eficacia dependió de la fidelidad de implementación [4].
- DKT (Piech et al. 2015) reportó AUC 0.86 vs 0.68 de BKT en ASSISTments, pero Khajah et al. (2016) mostraron que la comparación fue injusta: BKT bien replicado llega a 0.73, y variantes extendidas casi igualan a DKT [5][6].
- PFA y AFM son alternativas de regresión logística a BKT: cuentan aciertos/errores previos por componente de conocimiento sin estado bayesiano oculto [7][8].
- El sistema más relevante aquí es Math Garden (Rekentuin, U. Ámsterdam / Oefenweb): una variante Elo que re-estima habilidad e ítem con cada respuesta, sin calibración por lotes [9].
- Su regla "high-speed high-stakes" (HSHS, Maris & van der Maas 2010/2012) combina precisión y tiempo: `score = a_i · (d_i − RT) · (2·acc − 1)`, con `d_i` límite de tiempo, `a_i` factor de escala, `acc ∈ {0,1}` [10].
- Bajo esta regla el modelo de acierto es exactamente el 2PL de TRI, con `d_i` como parámetro de discriminación — un puente entre TRI clásica y calificación en tiempo real [10].
- Math Garden muestrea ítems para ~75% de éxito, coherente con la literatura de "dificultad deseable" (banda óptima ~70-85%) [9][11].
- Validez convergente de HSHS con CITO: r=0.78-0.84; en ajedrez, HSHS correlacionó más con FIDE que el conteo simple [10].
- Recomendación: implementar primero Elo/HSHS (no BKT completo) — requiere solo un factor K/incertidumbre, actualiza en O(1) por respuesta (ideal para Durable Objects), y ya está validado en un dominio casi idéntico (aritmética infantil).

## Executive summary (EN)

ITS research splits into two often-conflated lineages: **model tracing** (tracing a student's step-by-step solution against production rules — Cognitive Tutor's original mechanism) and **knowledge tracing** (tracking aggregate skill mastery across attempts — Bayesian Knowledge Tracing and successors) [2]. Efficacy evidence for the flagship model-tracing product, Carnegie Learning's Cognitive Tutor/MATHia, is genuinely mixed: the What Works Clearinghouse's 2016 review rates it "mixed effects" on algebra, "no discernible effects" on general math achievement, and "potentially negative" for the Geometry variant [3]. RAND's large randomized trial found no year-one effect and a modest 0.21 SD effect in year two, contingent on implementation fidelity [4] — adaptive tutoring is not automatically effective.

Bayesian Knowledge Tracing (BKT) is a four-parameter hidden Markov model (initial mastery, learning rate, guess, slip) with closed-form update equations [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) replaced this with an LSTM and reported large AUC gains, but a rigorous replication (Khajah, Lindsey & Mozer 2016) found the original comparison undersold BKT, and that extended BKT closes most of the gap [5][6]. Performance Factors Analysis and the Additive Factors Model offer a simpler logistic-regression alternative that fits incrementally [7][8].

The most directly applicable prior art is **Math Garden (Rekentuin)**, built at the University of Amsterdam, commercialized as Oefenweb/Prowise Learn: a computer-adaptive arithmetic practice system for children that updates learner ability and item difficulty after every response using an Elo variant combined with the **high-speed high-stakes (HSHS) scoring rule** (Maris & van der Maas, 2010/2012), scoring each attempt on both correctness and response time [9][10]. This is the basis of the concrete recommendation below.

## Findings

### 1. Model tracing vs. knowledge tracing

Cognitive Tutor's original architecture rests on **model tracing**: student actions are compared step-by-step against an expert model built from production rules (ACT-R cognitive task analysis), enabling just-in-time, context-sensitive hints [2]. Layered on top, **knowledge tracing** monitors gradual mastery of each skill (knowledge component) across problem-solving activities, updating the probability a rule is "known" each time it's exercised, independent of which specific problem the step came from [1][2]. For a self-contained arithmetic/logic game like Math Challenge — discrete, well-specified items rather than open-ended multi-step proofs — knowledge tracing (or its Elo cousin) is the relevant mechanism; full model tracing suits step-checking algebra/geometry derivations and is unlikely to be needed here.

### 2. Bayesian Knowledge Tracing: the four parameters and update equations

BKT (Corbett & Anderson, 1994/1995) has four parameters per skill: `P(L0)` (initial probability the skill is known), `P(T)` (probability of transitioning from unknown to known on any opportunity), `P(G)` (probability of guessing correctly while unknown), `P(S)` (probability of a slip — an incorrect answer despite knowing the skill) [1]. Per van de Sande's (2013) re-derivation, the two governing equations are:

- Learning update: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Predicted correctness: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

and the online (per-observation) posterior update used by the real-time "Knowledge Tracing Algorithm" is Bayes' rule applied to the observed outcome, then advanced one learning step:

- If correct: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- If incorrect: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Then: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

A widely used example parameter set (matching Baker et al. 2008's illustrative model, reproduced in van de Sande's Fig. 3) is `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande also proves BKT is only well-behaved (monotonically non-degenerate) when `P(G)+P(S) < 1`, and that its hidden Markov form is identifiable only up to three combined parameters unless fit with the recursive per-observation algorithm — a published caveat about parameter fitting, not just an implementation detail [1].

### 3. Efficacy evidence — mixed, not uniformly positive

WWC's June 2016 report reviewed 22 candidate studies, 7 meeting group-design standards, covering 12,840 students in 118 locations [3]. Ratings: Cognitive Tutor Algebra I → **mixed effects** on algebra (improvement index +4, range −7 to +19, 5 studies/12,182 students, "medium to large" evidence) and **no discernible effects** on general mathematics achievement (+2, 1 study, "small" evidence); Cognitive Tutor Geometry → **potentially negative effects** (−8, 1 study, "small" evidence) [3]. RAND's cluster-randomized trial (Pane et al., 2014) found no year-one difference and a significant +0.21 SD effect in year two (≈50th→58th percentile), attributed largely to implementation maturity [4]. Takeaway: effect size is modest and implementation-dependent, not a guaranteed win from the algorithm alone.

### 4. Deep Knowledge Tracing and the fairness controversy

Piech et al. (2015) introduced DKT, modelling interaction sequences with an LSTM: AUC 0.86 on ASSISTments (vs. 0.68 BKT) and 0.85 on Khan Academy (vs. 0.68 BKT, 0.63 marginal baseline) [5], read as proof deep learning dominates BKT. Khajah, Lindsey & Mozer (2016) showed the comparison undersold BKT: a correct re-implementation reached 0.73 (vs. 0.67 reported) on the same data, and extending BKT with forgetting, per-student ability, and skill discovery closed most of the gap [6]. Lesson: don't assume a fancier model beats a well-tuned simple one without checking — DKT's data/compute needs (large sequences, opaque skills) also poorly match a product needing interpretable, cold-start-friendly difficulty from day one.

### 5. Performance Factors Analysis and the Additive Factors Model

AFM (Cen, Koedinger & Junker) models correctness via logistic regression on three additive terms per knowledge component: student-ability intercept, KC-easiness intercept, and a KC learning-rate slope times prior opportunities [7]. PFA (Pavlik, Cen & Koedinger, 2009) extends this by replacing "opportunity count" with **separate counts of prior successes and failures** per KC [7][8]. Both fit online via incremental logistic regression, needing no EM/grid-search pass unlike full BKT.

### 6. Elo/IRT-based adaptive difficulty, and Math Garden specifically

IRT's core idea: correctness probability is a logistic function of latent ability minus item difficulty (1PL), optionally scaled by discrimination (2PL) and a guessing floor (3PL); adaptive testing picks, after each response, the unanswered item maximizing information at the current ability estimate [12]. Duolingo's Half-Life Regression (Settles & Meeder 2016) is related but distinct: it fits an exponential forgetting curve per item/student from linguistic/history features to predict the forgetting moment, optimizing spaced-repetition timing rather than difficulty-based selection [13].

**Math Garden (Rekentuin)**, from the University of Amsterdam's psychological methods department (2007), now commercialized by Oefenweb/Prowise Learn, is the closest analog to Math Challenge's goal of scoring speed and accuracy together [9]. It applies an Elo (1978) variant where student ability and item difficulty are re-estimated with every answered item — no offline calibration batch, enabling on-the-fly calibration of freshly authored content [9]. Items in the 2011 validation were sampled to target a mean success probability of **.75** [9], squarely inside the 70–80% band this project targets, and empirically validated against real children's performance.

The scoring mechanism — read directly from Klinkenberg's "High Speed High Stakes Scoring Rule" paper — traces to van der Maas & Wagenmakers (2005), who gave each item a time limit `d` and scored a response as remaining time times binary accuracy: `score = acc · (d − RT)` (0 if incorrect, faster scores higher if correct) [10]. This rewarded risky guessing on items that looked too hard (guessing was free), so Maris & van der Maas (2010) made accuracy symmetric (`{-1,+1}` instead of `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

where `d_i` is the item's time limit, `RT` the response time, `acc ∈ {0,1}` correctness, `a_i` an item scaling factor — a fast wrong answer becomes strongly negative, removing the incentive to guess-and-bail [10]. Maris & van der Maas (2012, Psychometrika) proved that under this rule the implied probability-of-correct model is **exactly the 2PL IRT model**, with time limit `d` acting as item discrimination — a clean bridge between a real-time scoring rule and classical IRT [10]. Validated empirically: HSHS ratings correlated r=.78–.84 with Dutch CITO scores across four arithmetic operations, and in a chess dataset (CORUS 2008) correlated more with FIDE Elo (r=.808) than simple sum-correct (r=.575) [10].

### 7. Practical Elo mechanics for adaptive item selection

The broader literature on Elo in adaptive learning (Pelánek, "Applications of the Elo Rating System in Adaptive Educational Systems") frames the same two-sided update as chess: after each attempt, learner rating and item difficulty move toward each other proportional to the surprise (actual minus expected outcome, a logistic function of the rating gap), scaled by an "uncertainty function" playing chess's K-factor role — largest for brand-new items/learners, shrinking as observations accumulate [14]. This is the mechanism recommended below.

## Design implications for Math Challenge

1. **Implement a Math-Garden-style Elo/HSHS model first, not full BKT.** BKT needs per-skill parameter fitting (grid search or EM) before it behaves sensibly [1]; Elo-with-HSHS updates a learner rating and item rating per attempt in closed form, no offline calibration — ideal for a large, growing item bank live from day one.

2. **Concrete scoring formula:** for a timed item with limit `d_i` (seconds), response time `RT`, correctness `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, clipping `RT` to `d_i` if it can exceed the limit [10]. Start with `a_i = 1` for all items; introduce per-item discrimination only once enough data exists to estimate it (Maris & van der Maas show `a_i`/`d_i` are entangled with 2PL discrimination) [10].

3. **Update rule:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (standard Elo logistic), `actual = score / (a_i·d_i)` rescaled to `[0,1]`, then `ability += K_learner · (actual − expected)` and `difficulty −= K_item · (actual − expected)` [9][14].

4. **K-factor schedule:** decay the uncertainty function rather than using a constant K — large (e.g., ≈0.5–1.0) for a learner's or item's first ~10–20 attempts, shrinking to a small steady state (≈0.05–0.1) afterward, mirroring cold-start-vs-steady-state handling in Elo-based education systems [14]. Track an attempt counter per learner-skill and per-item to drive this decay.

5. **Item difficulty estimation is online by construction:** every attempt on item `i` nudges its difficulty rating, so a brand-new item gets a provisional difficulty after a handful of responses, no pretest needed — the biggest practical win of Elo over BKT/DKT/PFA, which assume a fixed taxonomy and/or a batch-fit step [1][7][9].

6. **Target success rate for item selection: 70–80%, centered near 75%**, matching Math Garden's validated .75 target [9] and the broader desirable-difficulty literature [11]. When selecting the next item for ability `θ`, pick from items whose difficulty `β_i` puts `expected(θ, β_i)` in `[0.70, 0.80]`; sample among the 3–5 nearest-difficulty eligible items rather than always the single closest match, to avoid visibly repetitive jumps.

7. **Minimum D1 schema per attempt:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Storing before/after ratings (not just current state) makes history auditable and replayable, and supports offline comparison against a later BKT/PFA experiment without re-instrumenting.

8. **Separate item difficulty from content-difficulty metadata.** Store an author-assigned grade/level tag independently of the live Elo rating; use it only as the cold-start prior (seed near the mean rating of same-tagged items), letting the live rating take over after ~10 responses — this avoids a mis-tagged item never getting routed to learners who'd reveal its true difficulty.

9. **Durable Object for the hot path, D1 as the ledger.** Elo's O(1) per-event update fits a Durable Object holding a learner's live rating (and a shard of hot item ratings), flushing each attempt as an append-only D1 row; this avoids read-modify-write races on shared item rows that a naive D1-only design hits under real concurrency.

10. **Defer BKT/PFA/DKT to a v2 "skill mastery" layer**, not v1 item selection. Once enough D1 history exists, a nightly BKT/PFA batch per fine-grained skill can power mastery dashboards and parent-facing signals — a different surface from real-time selection, and mixing them early risks repeating the DKT/BKT fairness trap [5][6].

11. **Don't expect the algorithm alone to guarantee learning gains.** WWC's mixed/null/negative findings for a mature product [3] and RAND's null year-one result [4] show adaptive difficulty is necessary but not sufficient. A/B the learner model against a simple fixed ladder before crediting engagement gains to Elo specifically.

12. **Guard against risky-guessing exploits.** The `(2·acc−1)` transform exists to make fast wrong answers costly [10] — verify in QA that mashing random answers quickly doesn't out-rate genuine engagement, especially for young users who may not read the incentive structure the way an adult test-taker would.

## Open questions for the project owner

1. Should the time limit `d_i` per item be fixed by age/grade band, or itself a live-estimated parameter (per the 2PL-equivalence result)?
2. For very young users (ages 4-6) who may not reliably operate a timer UI, should HSHS apply at all, or should early-childhood content use an accuracy-only rule until a child ages into timed play?
3. One global Elo scale per learner, or per-domain scales (arithmetic vs. logic vs. geometry) that don't directly compare?
4. Is a nightly batch BKT/PFA mastery layer (§10) in scope for the same milestone as the live Elo selector, or a later phase?
5. What cold-start error tolerance is acceptable for brand-new items — how many responses before a difficulty rating is "trustworthy" enough to route broadly?

## Sources

1. Van de Sande (2013). "Properties of the Bayesian Knowledge Tracing Model." JEDM 5(2). https://files.eric.ed.gov/fulltext/EJ1115329.pdf
2. Koedinger & Corbett (2006). Cognitive Tutors — model tracing vs. knowledge tracing. PACT Center, CMU. https://pact.cs.cmu.edu/pubs/koedingercorbett06.pdf
3. What Works Clearinghouse (June 2016). "Cognitive Tutor" Intervention Report. https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_cognitivetutor_062116.pdf
4. Pane, Griffin, McCaffrey & Karam (2014). "Effectiveness of Cognitive Tutor Algebra I at Scale." RAND. https://www.rand.org/pubs/research_briefs/RB9746.html
5. Piech et al. (2015). "Deep Knowledge Tracing." NeurIPS 28. https://arxiv.org/pdf/1506.05908
6. Khajah, Lindsey & Mozer (2016). "How Deep is Knowledge Tracing?" https://arxiv.org/pdf/1604.02416
7. Pavlik, Cen & Koedinger (2009). "Performance Factors Analysis." https://files.eric.ed.gov/fulltext/ED506305.pdf
8. Cen, Koedinger & Junker — Additive/Instructional Factors Analysis. https://www.cs.cmu.edu/~ggordon/chi-etal-ifa.pdf
9. Klinkenberg, Straatemeier & van der Maas (2011). "Computer adaptive practice of Maths ability..." Computers & Education 57, 1813–1824. https://www.klinkenberg.amsterdam/publication/math-garden/
10. Klinkenberg, "High Speed High Stakes Scoring Rule" (SURF report), building on Maris & van der Maas (2012) Psychometrika 77, 615–633. https://www.surf.nl/files/2019-04/Artikel%20High%20Speed%20High%20Stakes%20Scoring%20Rule.pdf ; https://link.springer.com/article/10.1007/s11336-012-9288-y
11. Wilson et al. (2019). "The Eighty Five Percent Rule for optimal learning." Nature Communications. https://www.nature.com/articles/s41467-019-12552-4
12. IRT basics (1PL/2PL/3PL, adaptive selection via maximum information). https://www.cogn-iq.org/learn/theory/item-response-theory/
13. Settles & Meeder (2016). "A Trainable Spaced Repetition Model for Language Learning" (Duolingo HLR). ACL. https://research.duolingo.com/papers/settles.acl16.pdf
14. Pelánek. "Applications of the Elo Rating System in Adaptive Educational Systems." Computers & Education. https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf
