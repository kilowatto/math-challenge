# Feedback and Formative Assessment in Mathematics — Evidence for an AI Tutor

> Math Challenge research — 2026-07-31 — topic 11

## Resumen ejecutivo (ES)

- Hattie & Timperley (2007): la retroalimentación eficaz responde tres preguntas — "¿A dónde voy?", "¿Cómo voy?", "¿A dónde sigo?" — en cuatro niveles: tarea, proceso, autorregulación y "yo". El nivel "yo" (elogios genéricos) es el menos eficaz [1].
- Kluger & DeNisi (1996), meta-análisis de 607 tamaños de efecto: la retroalimentación mejora el desempeño en promedio (d=0.41), pero **más de un tercio de las intervenciones de retroalimentación lo empeoraron** — el mensaje "dar retroalimentación siempre ayuda" es falso [2].
- Black & Wiliam (1998) revisaron >250 estudios: la evaluación formativa bien implementada produce tamaños de efecto de 0.4–0.7, mayores que casi cualquier otra intervención educativa, y reduce especialmente la brecha con los estudiantes de bajo desempeño [3].
- El momento (inmediato vs. diferido) importa menos que el **contenido** de la retroalimentación; un meta-análisis reciente de 51 estudios (160 tamaños de efecto) no halló diferencia promedio por momento, pero sí encontró que matemáticas obtiene efectos mayores que otras materias y que la retroalimentación elaborada supera a la de solo corrección [4][5].
- Shute (2008) distingue cuatro tipos: Conocimiento de Resultado (KR, solo correcto/incorrecto), Conocimiento de Respuesta Correcta (KCR), Retroalimentación Elaborada (EF, explica el porqé) e Intentar-Hasta-Correcto (AUC). La EF gana en general, pero el exceso de elaboración puede saturar y perjudicar [5].
- Elogiar la inteligencia ("eres muy listo") en vez del esfuerzo ("trabajaste con método") reduce la persistencia tras el fracaso, aumenta las atribuciones de habilidad fija y empuja a elegir tareas más fáciles — hallazgo clásico de Mueller & Dweck (1998), 6 estudios [6].
- El elogio inflado ("¡increíblemente perfecto!") predice **menor** autoestima con el tiempo en niños, y en niños con autoestima ya alta predice más narcisismo; el elogio genuino y no inflado no produce ninguno de los dos efectos — Brummelman et al. (2014, 2017) [7].
- Los sistemas tutores inteligentes (ITS) con retroalimentación a nivel de paso (step-based) llegan a d≈0.76, casi tan eficaces como un tutor humano; los que solo evalúan la respuesta final rinden mucho menos (d≈0.40) — VanLehn (2011) [8].
- Los LLM actuales, sin ajuste pedagógico, tienden a **revelar la respuesta antes de tiempo** o a generar explicaciones que sí razonan paso a paso pero contienen errores matemáticos con apariencia coherente — MathDial (2023), MathTutorBench (2025) [9][10].
- El ensayo aleatorio Tutor CoPilot (2024, 783 tutores, N grande) mostró que sugerencias de IA orientadas a preguntas indagatorias (en vez de elogio genérico) subieron el dominio de temas de matemáticas en 4 puntos porcentuales, con mayor ganancia para tutores de menor calificación [11].

## Executive summary (EN)

Hattie & Timperley's (2007) synthesis frames feedback as answering three questions (feed up / feed back / feed forward) across four levels (task, process, self-regulation, self) — with self-level praise the weakest lever [1]. Kluger & DeNisi's (1996) meta-analysis of 607 effect sizes is the single most important caution here: feedback helps on average (d = .41), but **over a third of feedback interventions reduced performance**, mainly when it directs attention to the self rather than the task [2]. Black & Wiliam (1998) established formative assessment as one of education's highest-leverage interventions (d = 0.4–0.7 across 250+ studies), disproportionately benefiting low performers [3]. Timing alone shows weak, inconsistent effects; a 2024/2025 meta-analysis of 51 studies found math produces larger effects than other subjects, and that content elaboration matters more than timing [4][5]. Shute's (2008) taxonomy — KR, KCR, elaborated feedback, answer-until-correct — shows elaboration generally wins, but excess can backfire [5]. Ability praise (Mueller & Dweck, 1998) undermines persistence and challenge-seeking after failure relative to effort/process praise [6]; inflated praise predicts lower self-esteem over time and, in already-high-self-esteem children, more narcissism (Brummelman et al., 2014/2017) [7]. Step-level ITS feedback approaches human-tutor effectiveness (d ≈ 0.76 vs. 0.40 for answer-only systems) [8]. Current LLM tutors, unless specifically trained (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tend to give away answers prematurely or produce fluent but mathematically wrong reasoning [9][10][12]. The one live RCT of AI-assisted tutoring (Tutor CoPilot, 2024) found gains concentrated in reduced generic praise and increased probing questions [11].

## Findings

### 1. Hattie & Timperley's feedback model (2007)

Effective feedback answers three questions: "Where am I going?" (feed up), "How am I going?" (feed back), "Where to next?" (feed forward) [1]. It operates at four levels: **task**, **process** (strategy/method), **self-regulation**, and **self** (personal praise, "you're so smart"). Task/process feedback aimed at self-regulation is powerful; self-level praise is the weakest of the four and can dilute the others when combined in one message (e.g., "Great job, you're brilliant!" tacked onto a correctness notice) [1].

### 2. Kluger & DeNisi (1996): feedback can hurt

A meta-analysis of 607 effect sizes / 23,663 observations found a positive average effect (d = .41), but **over a third of feedback interventions decreased performance** [2]. Feedback Intervention Theory explains the split: feedback that redirects attention to the **self** (ego-involving, comparative, praise/blame) draws resources away from the task and can suppress performance after failure; feedback that keeps attention on the **task** and gap-closing strategy tends to help. This is the evidentiary basis for treating "always give feedback" as false.

### 3. Black & Wiliam and the formative-assessment evidence base

Reviewing 250+ studies, Black & Wiliam (1998) found formative assessment raises test outcomes with effect sizes of 0.4–0.7 — larger than most educational interventions — with the biggest gains for low-attaining students [3]. Conditions: information must be used to adjust teaching in near-real time, feedback must say how to close the gap (not just how far off), and students need ownership (self-/peer-assessment). This argues for a continuous formative loop (attempt → explain → adjust next problem) rather than a one-shot end-of-session report.

### 4. Timing: immediate vs. delayed feedback

A recent meta-analysis (51 studies, 1988–2024, 160 effect sizes) found **no significant average difference between immediate and delayed feedback**, but math tasks showed larger effects than other subjects, and immediate feedback raised learner confidence in computer-based math practice even without changing accuracy gains [4]. Elaboration (what feedback says) mattered more than timing (when it arrives) [4][5]. Net: timing is secondary, content is primary — but immediacy still helps confidence and prevents a wrong procedure from being rehearsed further.

### 5. Feedback content taxonomy (Shute, 2008)

Shute distinguishes **Knowledge of Results (KR)** (correct/incorrect only), **Knowledge of Correct Response (KCR)** (states the answer), **Elaborated Feedback (EF)** (explains why, with cues/examples/strategies), and **Answer-Until-Correct**. EF generally outperforms KR/KCR, but **excessive elaboration can be detrimental**, overloading working memory [5]. This argues for elaborated-but-short feedback, not exhaustive re-teaching of what a student already got right.

### 6. Praise for effort vs. ability, and inflated praise

Mueller & Dweck (1998, six studies): children praised for intelligence showed, after a subsequent failure, less persistence, less enjoyment, more low-ability self-attributions, and worse performance than children praised for effort/strategy; 92% of effort-praised children chose harder follow-up puzzles vs. 33% of intelligence-praised children [6]. Brummelman et al. (2014, 2017) found **inflated** praise predicts lower self-esteem over time, and higher narcissism in children who already have high self-esteem; non-inflated, accurate praise produced neither effect [7]. Together: praise process/strategy, keep it proportionate, never praise fixed traits.

### 7. ITS/CAI feedback meta-analyses

VanLehn (2011): intelligent tutoring systems reach d ≈ 0.58 vs. no tutoring, nearly matching human tutoring. **Step-based tutoring** (feedback at each solution step) reached d ≈ 0.76 — almost as good as a human tutor — while **answer-based systems** (final-answer-only feedback) reached only d ≈ 0.40 [8]. Strong signal: comment on steps/work, not just the final answer, wherever the format captures intermediate work.

### 8. LLM-generated math tutoring feedback (2023–2026)

MathDial (EMNLP 2023) built 3,000 tutoring dialogues because raw LLMs "fail at tutoring" — they generate incorrect feedback or reveal solutions too early ("telling@k") [9]. SocraticLM and PEARL train models to withhold answers and scaffold with questions instead [10][12]. MathTutorBench (EMNLP 2025): solving ability does **not** transfer to good tutoring, pedagogy and competence trade off, and quality degrades over longer dialogues [10]. LLMs also produce fluent-but-wrong chain-of-thought, distinct from answer-revealing [13]. The one field RCT, Tutor CoPilot (2024, 783 tutors, ~350k messages), found AI suggestions increased probing questions and **decreased generic praise**, a 4pp mastery gain (p<0.01), concentrated among lower-rated tutors [11]. Khanmigo evaluations report it beats raw GPT-4o at catching errors, and structured performance signals improved next-item correctness ~6% — but regular usage stays low (~15%) [14].

### 9. Age-appropriate phrasing

Early-childhood guidance (NAEYC, Wisconsin DCF) recommends **descriptive, specific feedback** over generic praise ("you counted the beans again and got the same number" vs. "good job"), since specificity lets a child connect feedback to a repeatable action [15]. The age gradient runs from concrete/sensory language for young children toward abstract meta-cognitive language (strategy, why, transfer) for older students.

## Design implications for Math Challenge

1. **Structure every tutor message as feed-up / feed-back / feed-forward**: (a) restate the goal, (b) say what happened relative to it, (c) give one concrete next step. Never stop at (b) — that leaves the highest-value part of Hattie & Timperley's model unused [1].

2. **Never combine task feedback with self/trait-level praise in the same sentence.** Ban "Correct! You're so smart at math" — split correctness from encouragement, and keep encouragement about effort/strategy, never ability. Follows from Kluger & DeNisi's finding that self-level attention capture is the likely mechanism behind feedback backfiring [2][6].

3. **Comment on the student's work/steps, not only the final answer**, wherever the format captures intermediate steps. The single highest-leverage architectural choice per VanLehn's ITS meta-analysis (step-based d≈0.76 vs. answer-based d≈0.40) [8].

4. **Keep elaborated feedback short — 3 to 6 sentences, one worked example maximum.** Shute's excessive-elaboration backfire means the prompt needs an explicit length cap, not "explain everything you can" [5].

5. **Do not let the tutor give away the next problem's answer or method prematurely mid-attempt** (e.g., in a hint flow before submission) — the MathDial/"telling@k" failure mode. Constrain the tutor to Socratic/step-scaffolded hints during an active attempt, and reserve full worked explanations for the post-submission review [9][10][12].

6. **Guard against confidently-wrong chain-of-thought.** Validate any generated step-by-step explanation against a deterministically computed correct solution before showing it — the LLM should narrate a known-correct derivation, not freely re-derive the math, given documented fluent-but-wrong reasoning chains [13].

7. **Immediate feedback for correctness/completion signals (right/wrong, points earned); a short delay (sub-second to a few seconds) is fine for the deeper "why" explanation**, but not end-of-session — immediate feedback helps confidence and prevents a wrong procedure from being rehearsed further [4].

8. **Reserve pattern-level feedback for an end-of-session summary**, distinct from per-problem feedback: e.g., "fastest on multiplication facts, slowest on multi-step word problems; next session adds more scaffolded word problems." This maps to Black & Wiliam's formative loop — using aggregated evidence to adjust the *next* instructional unit, not just the next sentence [3].

9. **Age-tiered FEEDBACK TEMPLATES for the tutor prompt:**

   - **Ages ~4–6:** 1–2 short sentences, concrete/sensory, no abstract strategy talk. Template: *[concrete observation] → [simple correct step] → [effort praise tied to the specific action]*. Example: "You counted the apples one by one — there are 7, you said 6; let's count together: 1, 2, 3... You're getting really good at counting carefully."
   - **Ages ~7–10:** 3–4 sentences naming the specific step where things diverged, one named strategy, effort/strategy praise. Template: *[what you got right] + [the exact step that went off track] + [why the correct step works] + [strategy-based encouragement]*.
   - **Ages ~11–14:** 4–5 sentences introducing the *why* behind the rule, inviting comparison to the correct approach, using subject vocabulary. Template: *[feed up: what the problem tested] + [feed back: where reasoning matched/diverged] + [correct rule with a mini worked step] + [feed forward: a related problem type to watch for]*.
   - **Ages 15+ / adult:** Terse, technical, peer-level; skip encouragement boilerplate, focus on precision ("correct but not minimal; here's a faster path"), offer depth on request.

   All bands: never fixed-trait framing ("you're not a math person"); always name the *specific* action, never a global judgment.

10. **Feedback to avoid, because evidence says it backfires:** generic trait/ability praise [6]; inflated/superlative praise for routine correctness [7]; correctness-only feedback with no path forward when wrong [5]; revealing the full solution before the attempt is over [9][10]; long re-teaching of material already mastered [5]; comparative/normative feedback ("behind other kids your age") — the exact ego-shift mechanism behind feedback-induced performance drops [2].

11. **Tie gamification feedback to effort/process signals** (persistence, strategy use, improvement over own baseline), not only speed or streaks, so scoring doesn't reintroduce ability-framed feedback via leaderboards or fixed-talent badges.

12. **Require the tutor prompt to self-check a short rubric before emitting a message**: separates task from praise; names a concrete next step; within the age-band's length cap; avoids revealing next-attempt answers; any worked step is validated against a computed ground truth. This operationalizes the rules above as a gate, not a hope.

## Open questions for the project owner

1. Should immediate per-problem feedback and the fuller AI-tutor explanation always show together, or should ages 4–6 get a simplified inline reaction immediately and the fuller explanation only in a parent/session review?
2. Do we currently capture intermediate work/steps on multi-step problems, not just the final answer? If not, is that worth prioritizing given the step-based-vs-answer-based ITS gap (d≈0.76 vs 0.40)?
3. Should end-of-session summaries go to the child, the parent, or both, with different phrasing (child-facing encouragement vs. parent-facing diagnostic detail)?
4. How should the tutor validate its worked-solution narration against ground truth — a separate deterministic solver, or a secondary verification LLM pass?
5. Do we want a "novice teacher" fallback (plain correct-answer reveal) when a full Socratic/elaborated explanation would be too slow or costly, and at what latency/cost threshold?

## Sources

1. Hattie & Timperley (2007). The Power of Feedback, *Review of Educational Research* 77(1). Follow-up: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).
2. Kluger & DeNisi (1996). The Effects of Feedback Interventions on Performance, *Psychological Bulletin* 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).
3. Black & Wiliam (1998). Inside the Black Box, *Phi Delta Kappan*. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).
4. A Meta-Analysis of the Impact of Feedback Timing on Learning Outcomes in Computer-Assisted Learning, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).
5. Shute (2008). Focus on Formative Feedback, *Review of Educational Research* 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).
6. Mueller & Dweck (1998). Praise for Intelligence Can Undermine Children's Motivation and Performance. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).
7. Brummelman et al. (2014, 2017). Person Praise Backfires in Children With Low Self-Esteem; When Parents' Praise Inflates, Children's Self-Esteem Deflates, *Child Development*. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).
8. VanLehn (2011), summarized in: [Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).
9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).
10. MathTutorBench: A Benchmark for Measuring Open-ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).
11. Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).
12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).
13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).
14. Khan Academy Blog. How Khan Academy Is Building a Better AI Tutor. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).
15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
