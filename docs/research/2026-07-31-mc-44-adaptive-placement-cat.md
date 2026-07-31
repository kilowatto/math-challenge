# Adaptive Placement Testing and Computerized Adaptive Testing (CAT): IRT, Cold-Start Calibration, and Knowledge Spaces

> Math Challenge research — 2026-07-31 — topic 44

## Resumen ejecutivo (ES)

- TRI tiene tres modelos anidados: 1PL/Rasch (solo dificultad `b`), 2PL (+ discriminación `a`), 3PL (+ adivinanza `c`) [1][2]. Solo 1PL es calibrable con poca data: el puntaje bruto es estadístico suficiente para la habilidad, así que la dificultad se estima sin conocer la habilidad de nadie primero [2]. 2PL/3PL requieren "cientos" de respuestas por ítem según el propio equipo de psicometría de Duolingo [4].
- CAT selecciona el ítem de máxima información de Fisher para la habilidad estimada, actualiza por MLE o EAP/MAP bayesiano, y detiene por umbral de error estándar o largo fijo [3].
- Control de exposición: Sympson-Hetter bloquea probabilísticamente ítems sobreusados; "randomesque" elige al azar entre los 5-10 mejores [3][12][13]. Duolingo (2026) reemplaza el bloqueo por Thompson Sampling, integrando el límite de exposición en la selección misma [5].
- El arranque en frío está nombrado y resuelto en producción: Duolingo distingue cold-start (ítem sin respuestas), jump-start (pocas respuestas piloto) y warm-start (recalibración del banco operativo), y calibra ítems nuevos desde características de contenido (embeddings BERT, frecuencia léxica) vía AutoML, sin esperar cientos de respuestas [4].
- Elo es la alternativa práctica: actualiza habilidad e ítem en O(1) por respuesta, sin fase de pilotaje separada; ya es el mecanismo recomendado en la investigación previa de este proyecto (tema 13, Math Garden) [9].
- ALEKS no usa una escala única: aplica Knowledge Space Theory, modelando el dominio como subconjuntos factibles de conceptos con estructura de prerrequisitos; el resultado es una posición en un grafo, no un número — el mejor precedente para el árbol de habilidades [7][8].
- El Duolingo English Test (V8) administra 18 ítems Y/N Vocab + 9 Vocab-in-Context por sesión (27 de 14 tipos totales), de un banco de 3,290 + 585 ítems [4].
- La documentación pública de NWEA MAP Growth, i-Ready, Khan Academy e IXL sobre sus algoritmos internos es mucho más escasa que la de Duolingo/ALEKS — solo confirma que son adaptativos, no las fórmulas [15][16][17].
- Un CAT de solo 5 ítems, repetido, logró eficiencia comparable a un diseño pre-post completo en un estudio de 2024 — apoya empezar corto por tema en vez de un examen largo global [18].
- Recomendación central: dificultad experta 1-100 por ítem, selección "más cercano a la dificultad actual", actualización Elo con `K` decreciente, parada a los 10-15 ítems o por estabilidad, y ruta de mejora hacia TRI/Rasch calibrado con ≥200-400 respuestas por ítem.

## Executive summary (EN)

IRT has three nested logistic models: 1PL/Rasch (difficulty `b` only, discrimination fixed), 2PL (`b` + discrimination `a`), and 3PL (adds guessing floor `c`) [1][2]. Only Rasch is realistic to calibrate with little data: its raw score is a sufficient statistic for ability, so item difficulty can be estimated by conditional maximum likelihood without first knowing anyone's ability [2]. 2PL/3PL need far more data — Duolingo's own calibration paper states traditional IRT "requires many test taker responses (e.g., hundreds) for each item," and piloting outside a live high-stakes test creates security risk [4].

CAT mechanics: select the unused item that maximizes Fisher information at the current ability estimate (informally, the item closest in difficulty to where the learner is now), update ability via MLE (unbiased, undefined for all-right/all-wrong patterns) or Bayesian EAP/MAP (handles that edge case via a prior), and stop on a standard-error threshold, a fixed item count, or a classification-confidence threshold [3]. Exposure control keeps the single best item from being shown to everyone: Sympson-Hetter probabilistically blocks over-exposed items; "randomesque" picks randomly among the top 5-10 [3]. Comparative studies find trade-offs, not one dominant method [12][13][14]. A 2026 Duolingo paper (S2A3) replaces blocking with Thompson Sampling, folding exposure limits directly into a bandit-style selection policy [5].

Math Challenge's exact situation — an item bank with no calibrated difficulty — is a named production problem, not a hypothetical. Duolingo's AutoIRT paper (2024) names three regimes: **cold-start** (new item, zero responses, calibrated from content features alone), **jump-start** (a small pilot sample blended with the operational bank), and **warm-start** (periodic recalibration as population/UI shift) [4]. Their fix trains an AutoML grade classifier on item content (BERT embeddings, word frequency, CEFR wordlists) and projects it onto interpretable IRT parameters via Monte Carlo EM — proof that provisional, feature/expert-derived difficulty is an accepted professional starting point with a defined upgrade path, not an amateur shortcut [4]. The lower-effort alternative is **Elo-based online calibration**: it updates both learner and item ratings after every response, with no offline fitting step [4][9]; a 2019 EDM paper extends it to multi-concept items [10]. This project's own prior research (topic 13) already recommends Elo/Math Garden's "high-speed high-stakes" rule as the concrete precedent — O(1) updates, validated in children's arithmetic practice [9].

ALEKS is structurally different: built on **Knowledge Space Theory** (Doignon & Falmagne), it models a domain as a finite concept set `Q`, where a learner's actual state is one *feasible subset* constrained by prerequisite relationships, not every subset of "known topics" [7][8]. The **outer fringe** of a state is what the learner is ready to learn next; the assessment narrows down *which* feasible state the learner is in, then recommends the outer fringe — a position in a prerequisite graph, not a scalar score [7]. This is the closest published match to "place a learner in a prerequisite graph rather than on one scale."

Public detail is uneven across vendors: Duolingo publishes peer-reviewed numbers (item counts, model equations, cold-start terminology) [4][5][6]; ALEKS's foundation is academically well documented [7][8]; but NWEA's RIT scale, Khan Academy's course-challenge mechanics, i-Ready's diagnostic, and IXL's Real-Time Diagnostic are described only at a marketing level in public pages — each confirms adaptivity, none publishes item-selection internals [15][16][17]. The usable blueprints for this project are the Duolingo and ALEKS/academic literatures, not the K-12 diagnostic vendors.

## Findings

### 1. IRT basics — three nested models, one realistic for cold start

`p(θ) = c + (1-c)·σ(a(θ-d))` gives correctness probability from ability θ and item parameters difficulty `d`, discrimination `a`, guessing `c` [1][4]. Fixing `c=0, a=1` gives **1PL/Rasch** — difficulty is the only free item parameter, and its sufficient-statistic property lets item difficulty be estimated by conditional MLE without knowing ability first [2]. **2PL** frees `a`: higher discrimination means an item separates just-below- from just-above-difficulty test-takers more cleanly [1]. **3PL** adds guessing `c`, appropriate for multiple-choice items (≈0.25 floor on four options) [1]. Both need substantially more per-item data than Rasch — the literature default is "hundreds" of responses [1][4].

### 2. CAT mechanics — selection, estimation, stopping, exposure

The loop: estimate θ from responses so far; pick the unused item maximizing Fisher information at that θ; administer; update; repeat [3]. MLE is asymptotically unbiased but undefined for perfect/zero response patterns; Bayesian EAP/MAP resolves this via a prior at the cost of slight bias [3]. Stopping rules: standard-error threshold (variable length), fixed item count, or classification-confidence threshold for pass/fail decisions [3]. **Sympson-Hetter** draws a random number per candidate item against an item-specific exposure parameter to probabilistically block even the best item [3][12]. **Randomesque** selects uniformly from the top 5-10 most informative items [3]. Comparative studies (Ozturk & Dogan 2015; Leroux et al. 2013, 2016) test these against newer "progressive-restricted standard error" methods on 3PL/GPC models, generally finding precision/exposure trade-offs rather than a clear winner [12][13][14]. Duolingo's 2026 S2A3 paper replaces blocking with Thompson Sampling, treating exposure limits as stochastic constraints inside item selection [5]. **Content balancing** is the orthogonal constraint that selection must also hit a target content mix, not just maximize information [3].

### 3. The cold-start problem, named and solved by a live production system

Duolingo's AutoIRT paper names exactly Math Challenge's situation: **cold-start** (new item, no responses, calibrated from content features only), **jump-start** (small pilot sample blended with the operational bank), **warm-start** (recalibration as population/UI/prep materials shift) [4]. Their solution: an AutoML ensemble (random forests, LightGBM, XGBoost, CatBoost) trained on item content features, projected onto interpretable IRT parameters via Monte Carlo EM, avoiding the need for hundreds of live responses before an item is usable [4]. This establishes that provisional, feature/expert-derived difficulty is a professional starting point with a real upgrade path, not a shortcut.

The alternative compatible with a small team is **Elo-based online calibration**: both AutoIRT and the wider literature note Elo as a long-standing online procedure for the Rasch model, updating person and item ratings after every response with no offline fitting step [4][9]. A 2019 EDM paper (Abdi, Khosravi, Sadiq & Gasevic) extends single-concept Elo to a multivariate form for multi-tagged items, reporting improved predictive accuracy [10]. Topic 13 of this project's own research already recommends Elo/Math Garden's HSHS rule as the concrete precedent: O(1) updates (good fit for Durable Objects), validated in children's arithmetic [9]. A third, later-stage path: BOBCAT (Ghosh & Lan, 2021) frames item selection itself as bilevel optimization rather than pure Fisher information — a plausible v2/v3 upgrade once enough logged data exists to train it [11].

### 4. ALEKS and Knowledge Space Theory — a graph, not a scale

ALEKS originated at UC Irvine in 1994 (NSF-funded), acquired by McGraw-Hill in 2013 [8]. Knowledge Space Theory (Doignon & Falmagne) models a domain as concept set `Q`; a learner's state is one *feasible subset*, constrained by prerequisites, not every subset of `Q` [7]. This defines a partial order over feasible states. The **outer fringe** is what the learner is ready to learn next (prerequisites satisfied); the **inner fringe** is what was just acquired [7]. ALEKS's assessment narrows down which feasible state a learner occupies, then recommends the outer fringe — a personalized path through a prerequisite graph, not a percentile score [7][8]. This is the reference design for a skill-tree UI, with IRT/Elo handling *within-node* difficulty ordering.

### 5. Duolingo English Test — the most concretely documented CAT in ed-tech

In the DET version studied (V8), each session runs 18 Yes/No-Vocabulary items (5 seconds each, judging real vs. algorithmically-generated fake words) and 9 Vocab-in-Context items (20 seconds each, fill-in-the-blank) — 27 items for two of 14 total task types, drawn from pools of 3,290 and 585 items respectively [4]. θ sits on a continuous Normal(0,1)-prior scale, with the reported score as the posterior mean using the full posterior during calibration, not a point estimate [4]. Duolingo has also published specifically on Responsible AI for this test, framing quality/equity as an ongoing validity-argument chain (domain definition → evaluation → generalization → explanation → extrapolation → utilization) — a useful checklist shape even outside high-stakes admissions testing [6].

### 6. NWEA, i-Ready, Khan Academy, IXL — thinner public detail

NWEA's MAP Growth reports on a proprietary **RIT scale** ("Rasch unIT"), grade-independent and continuous; NWEA's research center publishes item-parameter-drift and validation studies presupposing an IRT/Rasch foundation, but the exact item-selection algorithm was not found on public pages reachable in this research [15]. Khan Academy's own materials describe **mastery learning** as the pedagogical model, but its "Course challenge" placement mechanics are not detailed in openly accessible pages [16]. IXL's product page states plainly that "the difficulty of the questions adapts automatically," confirming CAT-like behavior, without publishing scale, item count, or selection rule [17]. i-Ready's technical manual was not retrievable in this session; no specific claim is made about it beyond its existence as an adaptive diagnostic. This gap is itself a finding: the Duolingo and ALEKS/academic literatures are the usable blueprints for v1; the K-12 diagnostic vendors treat internals as trade secrets.

### 7. How many items, and per-topic vs. global

No universal minimum exists, but two data points bound the range. Fixed-length high-stakes CATs commonly run to tens of items for a tight standard-error target [3]. A 2024 study chaining short CATs for the Force Concept Inventory found repeated 5-item adaptive administrations (9 times across a semester) reached efficiency "comparable to that of the pre-post method" for tracking change — context-specific (repeated formative measurement, not one-shot placement), but evidence that short-and-repeated can substitute for long-and-single [18]. This favors **per-topic** placement (10-15 items per branch, matching the project brief) over one long global test: a child can place at "3rd-grade arithmetic" and "kindergarten geometry" simultaneously, which a single global score cannot represent but a per-topic CAT and ALEKS's knowledge-space model both can [7].

### 8. Not feeling like a test to a 6-year-old

No source reviewed here addresses child UX directly, but two structural facts translate into constraints. Because CAT targets each item near the learner's actual ability by construction, a well-implemented adaptive placement naturally produces a mixed-success experience rather than a wall of failure — the mechanism itself protects the feeling, provided the UI doesn't editorialize on top of it (no visible countdowns or wrong-answer buzzers) [3]. Because short, per-topic placement (§7) is both defensible and better suited to a child's attention span, it can be delivered as a sequence of short themed mini-games rather than one continuous exam — building on the already-child-validated Math Garden precedent from topic 13 rather than re-deriving tone here [9].

## Design implications

1. **Use Rasch-style (1PL) provisional difficulty for v1, not 2PL/3PL.** With zero response history, only a single difficulty parameter per item is realistic; discrimination/guessing need data v1 won't have [1][2][4].
2. **Algorithm: expert-tagged difficulty + closest-difficulty selection.** Tag every item 1-100 by hand. At each step, select the unused item whose tag is closest to the current ability estimate — a parameter-free stand-in for maximum-Fisher-information selection [3][4].
3. **Ability update: Elo, not MLE/EAP.** `ability += K * (outcome - expected)`, `expected` a logistic function of (ability − item difficulty), matching the Rasch response form; O(1) per response, fits a Durable Object or a D1 write per turn, consistent with the topic-13 precedent [1][9].
4. **Decreasing K within one session.** Large K for the first 3-4 items (fast convergence from the age-seeded guess), smaller K after (stability) — the within-session analogue of chess Elo's provisional-rating period [9].
5. **Stopping rule: hard cap of 15 items, early-stop from item 8 on stability.** Stop early if the last 4 responses have alternated around the same tier (±1) with no net drift — a proxy for "SE is small enough" without a calibrated model to compute SE from [3].
6. **Per-topic placement, not one global score**, matching ALEKS's many-states model and the project's own skill tree [7][8].
7. **Age seeds item 1 only; ability estimate governs everything after.** The age input is a prior, not a ceiling or floor — 2-3 answers should be able to move the estimate a full tier.
8. **Log every response (item id, tagged difficulty, outcome) from day one.** This is exactly the "jump-start" data Duolingo's team requires before any recalibration; without it from launch, implication 9 starts late [4].
9. **Upgrade path: batch-refit tagged difficulties into an actual Rasch model at ~200-400 responses/item**, blending the expert prior with the empirical estimate rather than discarding it, since per-item volume will be uneven [4].
10. **2PL only after Rasch is stable and volume is high** ("hundreds" of responses per the literature); skip 3PL guessing parameters entirely unless the format is fixed-option multiple choice, since guessing isn't identifiable otherwise [1][4].
11. **Exposure control only once traffic outpaces the item pool.** In v1, just avoid repeating an item within one session; add Sympson-Hetter-style blocking or randomesque top-N only when telemetry shows a handful of items dominating selection [3][12].
12. **UX per age band:** ages ~4-6 — single character-guided mini-game, no visible score/timer/"test" language, celebratory feedback regardless of correctness, ending in a narrative transition, not a results screen. Ages ~7-11 — a "warm-up quest" with an item-count progress bar (never a correctness bar), light narrative, still no numeric score shown. Ages ~12-17 and adult/expert — transparent framing ("so we can start you at the right level") is fine and often preferred, but still avoid "assessment of your ability" language; a well-targeted adaptive test is genuinely closer to guided practice than exam-taking once it's converging correctly, which supports this framing at every age [3].
13. **Age is a theme and a seed, never a hard placement limit** — the entire point of an adaptive test per the brief is that ability, not age, sets the level.

## Open questions for the project owner

1. Mandatory placement before any practice, or optional with an age-default fallback and a later "recalibrate" action?
2. What K schedule for the decreasing-K Elo update — fixed (e.g., 1.0 / 0.5 / 0.25) or tuned empirically post-launch from logged data?
3. Single-author item-difficulty tagging, or a lightweight multi-rater process (2-3 people, reconcile disagreements) before any items ship?
4. Should every topic share a 15-item cap, or should broad branches (e.g., all-of-arithmetic) get a longer cap than narrow ones (e.g., long division)?
5. When placement disagrees sharply with stated age (a 5-year-old placing at 3rd grade), show it plainly, soften it, or ask the parent to confirm first?
6. Is periodic re-placement (every N weeks, or after M wrong answers at the current tier) a v1 feature, or a later addition once the core loop is validated?
7. Given how thin NWEA/i-Ready/IXL/Khan Academy's public documentation is, is there appetite to pursue their technical manuals under research-data agreements, or is the Duolingo/ALEKS/academic basis here sufficient for now?

## Sources

1. Wikipedia — Item response theory. https://en.wikipedia.org/wiki/Item_response_theory
2. Wikipedia — Rasch model. https://en.wikipedia.org/wiki/Rasch_model
3. Wikipedia — Computerized adaptive testing. https://en.wikipedia.org/wiki/Computerized_adaptive_testing
4. Sharpnack, J., Mulcaire, P., Bicknell, K., LaFlair, G., & Yancey, K. (2024). *AutoIRT: Calibrating Item Response Theory Models with Automated Machine Learning.* arXiv:2409.08823. https://arxiv.org/pdf/2409.08823v1
5. Sharpnack, J., Tsigler, A., Lockwood, J.R., Nydick, S., & von Davier, A.A. (2026). *S2A3: Thompson Sampling and Stochastic Exposure Control for High-Stakes CATs.* arXiv:2606.07364. https://arxiv.org/pdf/2606.07364v1
6. Burstein, J., LaFlair, G.T., Yancey, K., von Davier, A.A., & Dotan, R. (2024). *Responsible AI for Test Equity and Quality: The Duolingo English Test as a Case Study.* arXiv:2409.07476. https://arxiv.org/pdf/2409.07476v1
7. Wikipedia — Knowledge space. https://en.wikipedia.org/wiki/Knowledge_space
8. Wikipedia — ALEKS. https://en.wikipedia.org/wiki/ALEKS
9. Wikipedia — Elo rating system. https://en.wikipedia.org/wiki/Elo_rating_system
10. Abdi, S., Khosravi, H., Sadiq, S., & Gasevic, D. (2019). *A Multivariate Elo-based Learner Model for Adaptive Educational Systems.* Proceedings of the 12th International Conference on Educational Data Mining (EDM 2019).
11. Ghosh, A., & Lan, A. (2021). *BOBCAT: Bilevel Optimization-Based Computerized Adaptive Testing.* arXiv (IJCAI 2021).
12. Ozturk, N.B., & Dogan, N. (2015). *Investigating Item Exposure Control Methods in Computerized Adaptive Testing.* Educational Sciences: Theory and Practice. ERIC EJ1057460. https://eric.ed.gov/?id=EJ1057460
13. Leroux, A.J., Lopez, M., Hembry, I., & Dodd, B.G. (2013). *A Comparison of Exposure Control Procedures in CATs Using the 3PL Model.* Educational and Psychological Measurement. ERIC EJ1019083. https://eric.ed.gov/?id=EJ1019083
14. Leroux, A.J., & Dodd, B.G. (2016). *A Comparison of Exposure Control Procedures in CATs Using the GPC Model.* Journal of Experimental Education.
15. Wikipedia — NWEA. https://en.wikipedia.org/wiki/NWEA
16. Wikipedia — Khan Academy. https://en.wikipedia.org/wiki/Khan_Academy
17. IXL — Real-Time Diagnostic product page. https://la.ixl.com/diagnostic
18. Yasuda, J., Hull, M.M., Mae, N., & Kojima, K. (2024). *Chained computerized adaptive testing for the Force Concept Inventory.* arXiv.
19. Math Challenge internal research, topic 13: *Intelligent Tutoring Systems and Learner Modelling: BKT, DKT, PFA, and the Math Garden Elo Approach* (2026-07-31), docs/research/2026-07-31-mc-13-its-knowledge-tracing-elo.md — the Elo/Math Garden precedent this document builds on rather than re-deriving.
