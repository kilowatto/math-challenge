# Spacing, Retrieval Practice, and Interleaving Applied to Mathematics

> Math Challenge research — 2026-07-31 — topic 05

## Resumen ejecutivo (ES)

- La práctica **entrelazada** (mezclar tipos de problema en vez de agruparlos por bloques) duplica el desempeño en pruebas de matemáticas un día después, aunque empeora el desempeño *durante* la práctica misma [1][2].
- En un aula real de 7º grado (n=140, nueve semanas, prueba sorpresa dos semanas después), la práctica entrelazada superó a la práctica en bloque y los profesores la consideraron viable sin materiales extra [2][3].
- Una dosis más alta de entrelazado produjo puntajes más altos tanto a los dos días como a un mes (n=126, 7º grado); el beneficio no depende de que los problemas se "parezcan" entre sí [4][5].
- Los Bjork (UCLA) llaman a esto "dificultad deseable": condiciones que ralentizan el aprendizaje aparente pero mejoran la retención a largo plazo — espaciado, entrelazado, recuperación, generación y variación [6][7].
- El "efecto de la prueba" (Roediger & Karpicke, 2006): recuperar información de memoria fortalece más que releer, y la ventaja crece cuanto más larga es la demora antes de la prueba final [8].
- El intervalo de repaso óptimo no es fijo: depende de cuánto debe durar el recuerdo. Para una semana, el hueco óptimo es ~20-40% del intervalo; para un año, ~5-10% [9].
- Algoritmos de repetición espaciada en software real: Leitner (cajas con intervalos crecientes), SM-2 (SuperMemo/Anki clásico, factor de facilidad), FSRS (Anki actual, modela estabilidad/dificultad/recuperabilidad por tarjeta), y la regresión de vida media de Duolingo (p = 2^(-Δt/h), mejoró el compromiso diario 12%) [10][11].
- El "aprendizaje de dominio" tradicionalmente exige 80-90% de precisión antes de avanzar; evidencia reciente sugiere umbrales más altos (0.98) mejoran el desempeño posterior; "N correctas seguidas" (típicamente 3) es un proxy barato y común [12][13].
- El olvido sigue mejor una curva de ley de potencia que una exponencial pura — motivo por el cual FSRS abandonó la exponencial [10][16].
- Para Math Challenge se recomienda un programador tipo FSRS simplificado por habilidad (no por pregunta), con entrelazado dentro de cada sesión una vez que hay dos o más habilidades activas, y un umbral de dominio de dos etapas (racha + repaso espaciado exitoso).

## Executive summary (EN)

- **Interleaved practice** (mixing problem types instead of blocking them) roughly doubles next-day math test scores relative to blocked practice, even though it performs worse during the practice session itself [1][2].
- A 7th-grade classroom RCT (n=140, nine weeks, unannounced test two weeks later) found interleaved practice beat blocked practice, and teachers rated it feasible with no extra materials [2][3]. A dose-response study (n=126) found more interleaving produced better scores at both 2-day and 1-month delays, and the effect isn't limited to superficially similar problem types [4][5].
- Robert & Elizabeth Bjork (UCLA) frame this as **"desirable difficulties"**: conditions that slow acquisition but improve long-term retention — spacing, interleaving, retrieval practice, generation, and varied practice have the strongest evidence [6][7].
- The **testing effect** (Roediger & Karpicke, 2006): retrieving an answer from memory beats re-studying it, and the advantage grows with the delay before the final test [8].
- Cepeda et al. (2008, *Psychological Science*, >1,350 subjects): the **optimal spacing gap scales with retention goal** — roughly 20-40% of a 1-week target, shrinking to 5-10% of a 1-year target ("temporal ridgeline") [9].
- Software scheduling algorithms: **Leitner** (5 boxes, ~1/2/4/7/14-day intervals, reset on error) [14]; **SM-2** (ease factor 1.3-2.5, intervals 1, 6, then previous×ease) [15]; **FSRS** (Anki's current default — per-card Stability/Difficulty/Retrievability, power-law forgetting curve, ~19-21 fitted weights, single user-facing "desired retention" target ~0.90) [10]; **Duolingo's Half-Life Regression** (p = 2^(-Δt/h), cut prediction error 45%+ vs. baselines, lifted engagement 12% live) [11].
- **Mastery learning** traditionally uses 80-90% accuracy to advance (Bloom); adaptive-system research finds higher bars (~0.98) improve downstream performance; "N correct in a row" (often 3) is a common cheap proxy [12][13].
- Forgetting follows a power-law/logarithmic curve better than pure exponential decay — steep early loss, flattening tail — which is why FSRS moved away from exponential curves [10][16].
- Procedural math skill (fact fluency, algorithm execution) benefits especially from interleaving because it trains *strategy discrimination*, not just recall; conceptual understanding gains from spacing and from interleaving's transfer effect once multiple concepts are in play [1][2][6].

## Findings

### 1. Interleaved practice in mathematics (Rohrer & Taylor)

Rohrer and Taylor's lab studies had children practice four kinds of math problems either blocked (AAAA BBBB) or interleaved (ABCD ABCD). Interleaving *impaired* in-session performance yet **doubled next-day test scores** [1] — the signature pattern of a desirable difficulty.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) ran a classroom RCT: grade 7 (n=140) received blocked or interleaved practice over nine weeks, tested unannounced two weeks later. Interleaved-practice material scored higher [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900-908) ran a dose-response RCT (n=126, grade 7): a higher dose of interleaving in the same worksheets raised scores at both ~2-day and 1-month delays, with zero extra practice time [4]. The benefit is not an artifact of superficial similarity between problem types — it holds even when interleaved problems look quite different, consistent with interleaving training *strategy selection*, not rote recall [5]. Teacher surveys rated interleaving highly feasible — it requires only resequencing existing problems [2][3].

### 2. Bjork's desirable difficulties (UCLA)

Robert & Elizabeth Bjork (1994) coined "desirable difficulties": conditions that slow *acquisition* often improve long-term *retention and transfer*, because performance-while-learning and learning-itself are dissociable [6]. Five difficulties have strong evidence: spacing, interleaving, retrieval practice, generation, and varied practice [7]. Instructional design optimized for smooth, error-free sessions (massed repetition, blocking, re-reading) produces learning that feels good but doesn't last.

### 3. The testing effect (Roediger & Karpicke)

Roediger & Karpicke (2006) compared repeated studying vs. repeated testing of the same material. Immediately after, studiers looked better (~83% vs. ~71% recall); one week later the pattern reversed (~40% vs. ~61%) [8]. Retrieval-practice benefit grows with delay before the criterial test — the same signature as interleaving. Implication: an "answer, then feedback" loop should be the primary learning event, not an assessment bolted onto instruction.

### 4. Optimal spacing intervals — Cepeda et al.'s temporal ridgeline

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, >1,350 subjects) varied the study-to-relearning gap and tested retention up to a year later. The optimal gap is **not fixed** — as a fraction of the eventual test delay it runs ~20-40% for a 1-week goal down to ~5-10% for a 1-year goal [9]. Cramming before a quiz you need to remember for a year under-spaces; spacing reviews a month apart to remember something for a week over-spaces — exactly the tension adaptive schedulers (SM-2, FSRS, HLR) exist to solve.

### 5. Spaced-repetition algorithms used in real software

**Leitner (1972).** Cards live in boxes (classically 5) with fixed cadences (~1, 2, 4, 7, 14 days); a correct answer promotes, an incorrect one resets to box 1 [14].

**SM-2 (Woźniak, 1987).** Each item has an ease factor (EF), starting 2.5, floored at 1.3. Intervals: I(1)=1, I(2)=6, I(n)=I(n-1)×EF thereafter. A 0-5 quality rating adjusts EF via EF' = EF + (0.1 − (5−Q)×(0.08 + (5−Q)×0.02)); Q<3 resets the item [15].

**FSRS (Anki's current default).** Tracks three state variables per card: **Stability** S (days until recall probability decays to 90%), **Difficulty** D (1-10), and **Retrievability** R (0-1, decaying per a power-law curve, not exponential). A single knob, **desired retention** (typically 0.85-0.95, default ~0.90), drives the scheduler to invert the forgetting curve and pick the interval where predicted R hits that target. FSRS-6 fits ~19-21 weights per learner from review history via gradient descent, outperforming SM-2's fixed ease factor once enough data exists (~1,000+ reviews) [10].

**Half-Life Regression (Duolingo; Settles & Meeder, 2016, ACL).** Models each item's memory half-life h as a log-linear function of prior correct/incorrect counts; recall probability p = 2^(−Δt/h) — an explicit exponential curve (vs. FSRS's power-law). Cut prediction error 45%+ vs. baselines and lifted daily engagement 12% in a live A/B [11].

**Common thread.** All four schedule the next exposure for the moment recall probability is about to cross a target threshold — not before (wasted repetition), not long after (already forgotten). They differ in whether the forgetting curve is fixed (Leitner, SM-2) or fitted per item/learner (FSRS, HLR), and exponential vs. power-law shape.

### 6. Mastery learning thresholds

Bloom's mastery learning asks for ~80-90% accuracy before advancing, with remediation below threshold [12][13]. A common cheap proxy, especially in K-12 fact-fluency programs, is "N consecutive correct" (often 3), which resets cleanly on a wrong answer [13]. Recent adaptive-tutoring research found raising the mastery bar from ~0.95 to ~0.98 estimated-mastery probability improved performance on dependent subsequent lessons — the traditional threshold under-shoots for prerequisite content [12]. Fact-fluency literature stresses mastery must be assessed *after a gap*, not only in the training session, since immediate-recall accuracy overstates durable mastery [13].

### 7. Forgetting curves

Ebbinghaus's classic curve: steep early loss (~42% forgotten within 20 minutes, ~67% within 24 hours) then a long flattening tail [16]. Ebbinghaus modeled this as roughly exponential, but modern consensus — and the reason FSRS replaced its own exponential model with a power-law curve in FSRS-4.5/6 — is that real forgetting decelerates faster than pure exponential decay predicts [16][10].

### 8. Procedural vs. conceptual math skill

Rohrer/Taylor's work targets *procedural* skill: which method applies to which problem. Interleaving's benefit is theorized to come from **discrimination practice** — noticing which strategy a problem calls for, something blocked practice never requires since the block gives the strategy away [1][2][5]. For *conceptual* understanding, spacing and retrieval practice still help via the same trace-strengthening mechanism, but interleaving adds transfer value — recognizing a concept's applicability in a novel, mixed context [6][7][8]. In short: procedural fluency wants spaced *and* interleaved retrieval; conceptual understanding wants spaced retrieval and gains further from interleaving once multiple concepts are active.

## Design implications for Math Challenge

1. **Schedule per skill node, not per question.** Track units like "2-digit subtraction with borrowing" as the schedulable entity — math skills generalize across many question instances, unlike flashcards.

2. **Concrete recommended algorithm: FSRS-lite with a Leitner cold-start.** New skills with <20 data points use a simple Leitner-like ladder (1 → 3 → 7 → 16 → 35 days, reset on wrong answer, no fitting required). Once enough attempts accumulate, switch to an FSRS-style model seeded with published FSRS-6 default weights, refit periodically offline. Expose one tunable knob: **desired retention = 0.90** default, adjustable per grade band (0.85 for youngest ages to reduce frustration, 0.92+ for older/competitive users).

3. **Two-stage mastery threshold.** Require **3 consecutive correct at increasing difficulty** within a skill as the "provisionally learned" signal (the common fact-fluency convention [13]), but don't mark a skill "mastered" for scheduling until it also survives **one correct spaced review at a ≥3-day gap** — directly encoding the testing-effect lesson that immediate-recall streaks overstate durable learning.

4. **Never block practice by skill once 2+ skills are in rotation.** Once a second skill is due for review, interleave it with the current lesson within the same session (ABAB/ABCABC), rather than finishing one skill's problems before starting the next — the single highest-leverage, zero-cost change the literature supports [1][2][4].

5. **Session interleaving ratio: ~40-60% new/current-lesson mixed with ~40-60% due-for-review**, drawn from 2-4 other skills, mixed at the question level (not sub-blocks of 3-4 same-type problems). For pre-K/K, bias toward 70/30 new/review and interleave at most 2 skills, given working-memory constraints the desirable-difficulties literature itself flags as a boundary condition [6][7].

6. **Reviews are always retrieval, never passive re-exposure.** A review event requires the child to produce an answer before any explanation shows, even for "already learned" material [8].

7. **Scale review gaps to how long the skill needs to last, not a fixed calendar cadence.** Tag skills as "unit-scoped" (tighter gaps, ~20-30% of the retention window) vs. "foundational" (progressively wider gaps, ~5-10% of a year-long horizon once well-established), per Cepeda's ridgeline [9].

8. **Track Difficulty separately from Stability per skill**, as FSRS does, so a child who struggles gets both a shorter next interval and smaller stability gains per correct answer than one who found it easy — preventing a fixed-ease algorithm from treating a lucky guess the same as genuine mastery.

9. **Model forgetting with a power-law curve, not pure exponential**, for placement/adaptive-difficulty estimates of "how much has this child forgotten since last practice" — a pure exponential overstates forgetting at long delays and understates it shortly after learning [16][10].

10. **Instrument both Rohrer signatures as internal metrics.** Track same-session accuracy and delayed-recall accuracy (e.g., a short warm-up quiz on yesterday's skills) as separate KPIs; expect interleaved-session accuracy to sometimes look *lower* than blocked while delayed accuracy is higher — don't let a same-session accuracy dip trigger reverting to blocking.

11. **Report "practiced" vs. "learned" separately to parents/teachers.** Surface the two-stage mastery signal (item 3) rather than raw session accuracy, avoiding the trap where a same-day streak looks like mastery and then fails on the next unannounced review.

12. **AI tutor feedback should prompt retrieval before revealing solutions.** On a wrong answer, give a retrieval-scaffolded hint first (generation effect [6][7]); reserve full worked examples for a second wrong attempt.

## Open questions for the project owner

1. Should scheduling state live per-child-per-skill only, or should we also maintain a population-level FSRS parameter fit to seed new children's schedules before enough of their own data exists?
2. Should desired retention be a fixed 0.90 platform-wide, or a tunable knob for older/PhD-track users the way Anki exposes it to power users?
3. Should unit-scoped vs. foundational-skill tagging be authored manually per curriculum node, or inferred from prerequisite-graph depth?
4. Does the interleaving ratio interact with the anti-cheating behavioral-signal system — does mixing skill types make timing/pattern detection easier or harder to reason about?
5. Should the two-stage mastery bar (streak + delayed review) block progression to the next curriculum unit, or only affect review scheduling while progression stays on a separate accuracy threshold?

## Sources

1. Rohrer & Taylor, "The shuffling of mathematics problems improves learning" — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf
2. Taylor & Rohrer (2010), "The effects of interleaved practice," *Applied Cognitive Psychology* 24, 837-848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598
3. IES WWC Study 89950, interleaved mathematics practice classroom RCT — https://ies.ed.gov/ncee/wwc/Study/89950
4. Rohrer, Dedrick & Stershic (2015), "Interleaved practice improves mathematics learning," *Journal of Educational Psychology* 107(3), 900-908 — https://files.eric.ed.gov/fulltext/ED557355.pdf
5. Rohrer et al. (2014), "The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems" — https://pubmed.ncbi.nlm.nih.gov/24578089/
6. Bjork & Bjork (2011), "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning" — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/
7. "Desirable Difficulties: Bjork's 5 Principles" — https://www.structural-learning.com/post/desirable-difficulties
8. Roediger & Karpicke (2006), "Test-Enhanced Learning" / "The Power of Testing Memory," *Perspectives on Psychological Science* 1(3), 181-210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), "Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention," *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf
10. FSRS algorithm documentation — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
11. Settles & Meeder (2016), "A Trainable Spaced Repetition Model for Language Learning," ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; code — https://github.com/duolingo/halflife-regression/blob/master/README.md
12. "How Much Mastery is Enough Mastery?" EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html
13. "The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices" — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/
14. Leitner system overview — https://e-student.org/leitner-system/ and https://supermemo.guru/wiki/Leitner_system
15. SuperMemo SM-2 algorithm original specification — https://super-memory.com/english/ol/sm2.htm
16. Ebbinghaus forgetting curve — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve and https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
