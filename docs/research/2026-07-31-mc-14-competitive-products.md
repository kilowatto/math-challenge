# Competitive and Design Research: Leading Math Learning Products

> Math Challenge research — 2026-07-31 — topic 14

## Resumen ejecutivo (ES)

- Khan Academy combina video + práctica adaptativa con dos monedas de progreso distintas: **Energy Points** (miden esfuerzo, no dominio) y **Mastery Points** (miden dominio real por habilidad); esta separación evita que "jugar el sistema" se confunda con aprender [1]. Es gratuito, financiado por filantropía (~$128M/año) [Business model].
- La evidencia de Khan Academy es más fuerte a nivel de plataforma (≥30 min/semana → ~20% de ganancia adicional en MAP Growth) [2] que a nivel de Khanmigo (tutor IA): un estudio de física con 69 universitarios no encontró diferencia significativa frente a usar un buscador, aunque la percepción subjetiva fue positiva [3].
- Brilliant.org es la referencia de diseño de "aprender haciendo": cada lección es una secuencia de problemas interactivos con scaffolding y feedback inmediato, sin video-lecciones tradicionales; una respuesta incorrecta no penaliza, se explica y se sigue [5][7]. Precio: ~$150/año o ~$10/mes.
- Kumon es el modelo de referencia para "pasos pequeños" e incrementalidad extrema: cada hoja de trabajo tiene un **Standard Completion Time** (tiempo estándar) que decide si el niño repite o avanza — el tiempo, no solo la corrección, es la señal de dominio [9][10]. El **What Works Clearinghouse (WWC)** no pudo emitir conclusión sobre su eficacia por falta de estudios que cumplan sus estándares [11] — un dato que conviene citar con cuidado, no como validación.
- IXL usa **SmartScore** (0–100), un algoritmo que pesa dificultad, racha y recencia; pasado el umbral 90 ("Challenge Zone") los aciertos suman poco y los errores restan mucho más, lo que fuerza consistencia real en vez de un pico de suerte [12][13].
- Prodigy Math es el caso de advertencia más citado: math gratis pero envuelto en una RPG con monetización agresiva de cosméticos/mascotas que crea "dos clases" de alumnos: hubo una queja formal ante la FTC de EE.UU. en 2021 por publicidad engañosa y manipulación a menores [15][16][17]. Es también evidencia de que el "core loop" de batalla (responder para ganar puntos de magia) no enseña por sí mismo — solo practica.
- DreamBox y ST Math tienen la evidencia independiente más sólida del grupo: DreamBox con estudios de Harvard/CEPR y SRI, calificado "STRONG" por Evidence for ESSA [20]; ST Math cumple el nivel WWC "Meets Evidence Standards with Reservations" según WestEd (2014), aunque análisis posteriores reportan efectos no significativos en algunos contextos — la evidencia es mixta, no unánime [21][23].
- ST Math (JiJi) es el diseño más radical: **cero palabras**, todo visual/espacial, pensado para que el idioma no sea barrera — relevante directamente para el requisito EN/ES/FR/PT/DE de Math Challenge [24][25].
- Photomath cambió de negocio tras ser adquirido por Google (2023): pasó de suscripción pura a alimentar señales de aprendizaje al ecosistema Google (Search, Workspace for Education) — es una herramienta de "resolver", no de práctica graduada [26].
- Duolingo Math no fracasó ni se canceló: se fusionó dentro de la app principal de Duolingo en 2023–2024 tras tener menos tracción que Chess/Music — una lección sobre lanzar un producto "spin-off" separado versus integrarlo desde el día uno [28].
- El hueco de mercado que ningún competidor cubre bien: nadie combina (a) problemas reales estilo Brilliant, (b) progresión incremental verificable estilo Kumon/IXL, (c) diseño multilingüe sin dependencia del texto estilo ST Math, y (d) ausencia de monetización manipuladora hacia menores. Ese es el espacio que Math Challenge puede ocupar.

## Executive summary (EN)

Nine products were reviewed for core loop, problem presentation, grading, progression, and independent evidence. The clearest pattern: platforms with the strongest *independent* efficacy evidence (Khan Academy at scale, DreamBox, IXL, ST Math) separate the "effort/engagement" reward layer from the "mastery" signal, and they use algorithmic, per-skill mastery thresholds rather than course completion. Platforms optimized purely for engagement (Prodigy) have drawn regulatory-grade criticism for monetizing children through virtual-goods pressure, and have weaker learning-outcome evidence relative to time spent. Kumon's contribution is not "engagement design" — it is a rigorously timed, incremental worksheet ladder where a stopwatch, not just correctness, decides progression; its formal efficacy evidence is thin by WWC standards despite decades of anecdotal reputation. Brilliant.org is the best template for *presenting a problem*: short concept intro, then guided interactive problem with scaffolds and non-punitive wrong-answer handling. ST Math is the strongest existing proof that a wordless, spatial approach can be validated (WWC/ESSA Tier 2) and is directly relevant to Math Challenge's five-language requirement. Duolingo Math's history (merged into the flagship app rather than surviving standalone) is a caution about spin-off dilution. The market gap: no single product pairs Brilliant-grade problem craft with Kumon/IXL-grade incremental mastery gating, ST Math-grade language-independence, and a business model that does not pressure children into spending.

## Findings

### Khan Academy

**Core loop:** optional short video/read, then a practice set; correct answers earn Energy Points (uncapped effort currency, not a mastery signal) and progress toward Mastery Points (skill-specific, algorithmic, requiring sustained correctness over time, not one streak) [1]. Skills sit in a prerequisite-gated skill tree with spaced review resurfacing mastered material. Khanmigo, the AI tutor, is a Socratic-style chat layer, not a separate curriculum [4].

**Grading:** per-question correctness feeds the mastery model; Energy Points reward pushing into new material even when wrong, to avoid punishing risk-taking [1].

**Evidence:** Khan Academy's own November 2024 report states ≥30 min/week correlates with ~20% greater-than-expected gains on MAP Growth [2] — platform-level correlational evidence, not an RCT. For Khanmigo specifically, a peer-reviewed mixed-methods study (69 undergraduates, physics) found significant gains in all conditions but **no significant difference** between Khanmigo and a plain search engine, though students subjectively preferred Khanmigo's step-by-step guidance [3]. Khan Academy's own blog describes ongoing (Oct 2025–Apr 2026) experiments to improve Khanmigo's measured effectiveness [4] — the organization itself treats it as unproven and in-progress.

**Business:** 501(c)(3) nonprofit, free to end users, funded by ~$128M+/year in philanthropy.

### Brilliant.org

**Core loop:** each lesson opens with a 2–4 sentence concept intro + illustration, then moves straight into a chain of interactive problems the learner solves — "learn by doing," explicitly not lecture-first [5]. Wrong answers are not penalized: the UI shows the correct answer and explains the reasoning [7].

**Presentation:** visual/interactive widgets (sliders, draggable diagrams, multi-step reveals), not text walls.

**Grading:** immediate per-problem feedback with worked explanations; daily challenge problems plus streak/level mechanics drive return visits [7].

**Progression:** 40+ courses, elementary through graduate level (math, science, CS, data, AI); topic-jump friendly across courses, tightly sequenced within a lesson.

**Evidence:** no independent, peer-reviewed efficacy study was found; the case for Brilliant is instructional-design credibility and reviews, not measured outcomes.

**Business:** freemium; ~$150/year Premium (~$10/month billed annually), free for K-12 teachers [6].

### Kumon

**Core loop:** short, timed worksheets in a fixed sequence of tiny steps — study a worked example, then solve near-identical problems with minimal teacher intervention ("self-learning") [8][9].

**Grading:** correctness *and* a published **Standard Completion Time (SCT)** per level. Finishing accurately within SCT licenses the next worksheet; missing SCT — even with correct answers — triggers repetition [10]. Speed is a first-class pass/fail criterion here, unlike every other product reviewed.

**Progression:** step size deliberately finer than a classroom would treat as a new topic, so each step feels achievable without direct teaching.

**Evidence:** the U.S. What Works Clearinghouse reviewed Kumon Math studies and found none met its evidence standards, so **WWC could not draw a conclusion** either way [11] — a "no verdict," not a negative finding, but it means decades of market reputation aren't backed by WWC-grade evidence. Secondary commentary reports gains concentrated in the first 12–18 months (especially for students starting below grade level) with plateauing after, and recurring criticism that the method rewards rote calculation over conceptual reasoning.

**Business:** in-person franchise centers, per-subject monthly tuition (varies by market).

### IXL

**Core loop:** answer adaptive practice questions in a chosen skill; **SmartScore**, a 0–100 mastery meter per skill, updates after every answer.

**Grading:** SmartScore weights difficulty, recent-answer streaks, and consistency, not just percent correct [12][13]. Past SmartScore 90 ("Challenge Zone"), correct answers add only 1–2 points while a miss can subtract 3–8 — deliberately asymmetric so the last stretch requires real consistency, not a lucky run [13].

**Progression:** two-level adaptivity — item difficulty adapts within a skill, and a Real-Time Diagnostic recommends which skill to work on next.

**Evidence:** IXL publishes its own SmartScore methodology paper [12]; no independent third-party outcome study was found.

**Business:** ~$79–159/year per child depending on subject bundle, multi-child discounts; school licenses from ~$369/year [14].

### Prodigy Math

**Core loop:** a turn-based RPG battle layered over math practice — answering a question earns Magic Points spent casting spells against monsters/other characters; the wizard levels up, gets gear, unlocks zones [18].

**Grading:** correctness gates battle progress only; no concept explanation is embedded in the loop.

**Business model and controversy:** Math/English content is nominally free; Science content and cosmetic/gameplay enhancements (pets, gear, "clouds vs. dirt" visuals) require paid tiers (Core ~$9.95/mo, Plus ~$14.95/mo, Ultra ~$19.95/mo) [19]. In February 2021, child-advocacy groups filed a formal U.S. FTC complaint alleging Prodigy "aggressively" and "unfairly" markets premium upgrades to children, calling the free-to-schools framing misleading and describing a visible two-tier experience between paying and non-paying students [15][16][17]. Critics also argue the game "does not instruct... it only offers practice," citing research ranking Prodigy last among four compared apps for learning gains per hour invested [17]. Prodigy's response: over 95% of registered users have never paid, and freemium funds free access for the rest [16].

**Takeaway:** Prodigy is the clearest cautionary tale here — not the game mechanics themselves, but using in-game status pressure visible to non-paying peers, on a product marketed to schools as free, is exactly the shape regulators have already formally challenged.

### DreamBox Learning

**Core loop:** adaptive, game-like K–8 lessons that branch based on *how* a student solves each problem — strategy and intermediate steps, not just the final answer — to pick the next task.

**Evidence:** one of the two best-evidenced products reviewed. A Harvard CEPR study of ~3,000 students across two districts found students with 14 hours of usage improved ~4% on NWEA MAP/PARCC/state assessments [20]. A LearnPlatform study at William Penn School District (1,800 K-6 students, majority Black and FRL-eligible) found students completing under one hour/week of DreamBox had significantly higher end-of-year Savvas Math scores than lower-usage peers [22]. A separate WWC evidence snapshot exists [21]. A cited RCT in a southeastern district found a 0.12 SD gain on an early-elementary skills test but no significant advantage on the state end-of-grade test — real but uneven evidence across outcome measures. DreamBox is rated "STRONG" by Evidence for ESSA [20].

**Business:** K-8 district/school licensing, sold B2B into schools.

### ST Math (MIND Research Institute)

**Core loop:** the student guides JiJi the penguin through spatial-visual puzzles with **no written or spoken instructions at all** — the whole problem/feedback loop is visual, built around spatial-temporal reasoning rather than language [24][25].

**Grading:** implicit — JiJi succeeds or fails based on whether the student's manipulation of the puzzle is mathematically correct; failure is immediately visible and re-triable, no verbal verdict needed.

**Evidence:** a WestEd 2014 evaluation found ST Math grades had 6.3 percentage points more students proficient on the California Standards Test than matched comparison schools; that design was found by WWC review to meet **"Meets Evidence Standards with Reservations,"** and MIND states the program meets ESSA Tier 2 [23][24]. Other analyses in the same search round found a nonsignificant effect over two years in a different context — evidence is real but mixed across studies.

**Direct relevance:** ST Math is the strongest proof that a **wordless design can be independently validated**, directly useful for a 5-language product (EN/ES/FR/PT/DE) — a well-designed spatial/visual track needs no translation and launches in all five languages at zero incremental localization cost, especially for pre-literacy ages 4–7.

**Business:** MIND Research Institute is itself a nonprofit; ST Math is licensed B2B to districts/schools.

### Matific

**Core loop:** curriculum-aligned content in four formats — worksheets, "episodes" (short game-like apps), word problems, and teacher workshops — in a modular, progressive spiral (topics resurface at increasing difficulty rather than a strict linear ladder).

**Evidence:** Matific's own marketing cites an average 34% test-score improvement at 30 min/week [29]; this is a vendor-reported figure, not independently verified in the sources retrieved, and should be treated as a claim to check, not a citation-grade result.

**Business:** ~$9.99/month or $79.99/year; "Galaxy" tier $19.99 single grade or $39.99 full K-6/year; free trials.

### Mathletics (3P Learning)

**Core loop:** curriculum-based practice modules plus a live, global "Live Mathletics" mode where students compete head-to-head in real time, alongside certificates/points gamification.

**Evidence:** no product-specific independent study was found. General gamification-in-math-education meta-analyses (41 studies, ~5,071 participants) show a large average positive effect size but meaningful heterogeneity — some implementations show no or negative effect, so gamification is not automatically efficacious; execution quality decides the outcome [32].

**Business:** ~$99/year home (single child); school/district pricing via custom quote.

### Photomath

**Core loop:** fundamentally a **solve tool**, not graded practice — photograph a problem, OCR (~98% accuracy claimed) converts it to a symbolic expression, and a computer-algebra engine returns multiple step-by-step solutions with animated walkthroughs.

**Grading/progression:** none in the mastery sense — no skill tree or mastery gate; the value is on-demand homework help, the opposite design bet from Kumon/IXL/Khan Academy's gated progression.

**Business model shift:** acquired by Google/Alphabet in 2023; by 2026 its role shifted from a standalone subscription app toward feeding learning-signal data into Google Workspace for Education/Gemini and Search's "Homework Helper" — monetizing as ecosystem value rather than pure subscription [26][27].

**Relevance:** Photomath is the anti-pattern to avoid copying — a pure answer-solver undermines "real problems, not bare arithmetic" if a child can photograph any Math Challenge problem and get an instant answer. This argues for interactive/manipulable problem formats that resist naive photo-solving.

### Duolingo Math

**History:** launched as a **separate, standalone app** in October 2022; at Duocon 2023 Duolingo announced it would merge Math into the flagship app; the standalone app left the App Store on November 30, 2023, folded into the main app through early 2024 [28]. Math (and Music) had reached roughly 3 million combined users a year after launch — smaller than sibling subjects like Chess — context for, though not stated as the sole cause of, folding it in rather than keeping it standalone. In September 2025 Math was redesigned to group Units into Grades and Topics, mirroring a school curriculum [28].

**Design implication:** a caution about the "successful standalone spin-off" bet — a strong parent brand (Duolingo) launching an adjacent subject as its own app saw lower adoption than sibling subjects, and the fix was integration, not iterating on the spin-off. For Math Challenge, which *is* the standalone product, the transferable risk is splitting into separate apps per grade band or language rather than one PWA with themed modes.

## Comparison table

| Product | Core loop | Grading mechanism | Progression model | Independent evidence | Price / model |
|---|---|---|---|---|---|
| Khan Academy | Watch/read → practice set → mastery drill | Energy Points (effort, uncapped) separate from Mastery Points (per-skill, algorithmic) [1] | Prerequisite-gated skill tree + spaced review | Platform: ~20% extra MAP Growth gain at ≥30 min/wk (KA-reported) [2]; Khanmigo RCT-style study: no significant gain vs. search engine [3] | Free; nonprofit, ~$128M+/yr philanthropy |
| Brilliant.org | Short concept intro → chain of interactive problems | Immediate per-problem feedback + explanation; wrong answers not penalized [7] | 40+ courses, elementary→graduate, topic-jump friendly | No independent efficacy study found | ~$150/yr (~$10/mo), free for K-12 teachers [6] |
| Kumon | Worked example → near-identical drill problems, timed | Correctness **and** Standard Completion Time (speed is pass/fail) [10] | Extremely fine-grained linear steps | WWC: no studies met evidence standards, no conclusion possible [11] | In-person franchise, per-subject monthly tuition |
| IXL | Adaptive question → SmartScore update | SmartScore 0–100, asymmetric near mastery (miss costs more than a hit helps) [13] | Two-level adaptivity: item difficulty + skill recommendation via diagnostic | Vendor methodology paper only; no third-party outcome study found [12] | ~$79–159/yr per child; school license from $369/yr [14] |
| Prodigy Math | Answer question → Magic Points → RPG battle | Correctness gates battle only; no adaptive instruction | Character/gear leveling, zone unlocks | Cited as ranking last of 4 apps for learning gains per hour [17]; formal FTC complaint over monetization [15][16] | Math/English free; Science + cosmetics via $9.95–19.95/mo tiers [19] |
| DreamBox | Adaptive lesson tracking strategy, not just final answer | Strategy-aware branching each step | Continuous adaptive branching, K–8 | Harvard CEPR (~3,000 students, +4%) [20]; LearnPlatform William Penn (+ scores at <1hr/wk) [22]; WWC evidence snapshot exists [21]; "STRONG" per Evidence for ESSA | District/school licensing (B2B) |
| ST Math | Wordless spatial puzzle (JiJi) | Implicit — puzzle solved or not, fully visual | Spatial-temporal sequence, preK–8 | WestEd 2014: +6.3pp proficiency; WWC "Meets Evidence Standards with Reservations"; ESSA Tier 2; other analyses found nonsignificant effects [23][24] | Nonprofit (MIND Research Institute), district licensing |
| Matific | Worksheets / episodes / word problems / workshops | Per-activity correctness; spiral revisit of topics | Modular, curriculum-aligned, spiral | Vendor-reported 34% improvement claim (not independently verified in this pass) | ~$9.99/mo or $79.99/yr; Galaxy $19.99–39.99/yr |
| Mathletics | Curriculum modules + live global competition | Per-question correctness + certificates/points | Curriculum-aligned modules, competitive mode | No product-specific study found; general gamification meta-analyses show large but heterogeneous effect | ~$99/yr home; custom school quotes |
| Photomath | Photograph problem → OCR → step-by-step solve | None (solver, not practice) | None (no skill tree) | N/A — not a learning-outcome product | Freemium → Photomath Plus; post-Google, ecosystem-integrated (Search/Workspace) [26] |
| Duolingo Math | Streak-based daily lesson, gamified | Correctness + streak/XP (Duolingo core mechanics) | Grades → Topics → Units (redesigned 2025) | Not researched in this pass (no efficacy study found); adoption data suggests standalone app underperformed vs. Chess | Free, folded into main Duolingo app since 2023–24 [28] |

## Design implications for Math Challenge

1. **Separate the effort signal from the mastery signal**, as Khan Academy splits Energy Points from Mastery Points [1]. Leaderboards should reward demonstrated per-skill mastery, not volume of easy grinding.
2. **Copy Brilliant's problem-presentation shape**: short concept intro, then a single interactive problem with scaffolding, then immediate non-punitive feedback with a worked explanation [5][7] — this maps directly to "real problems, not bare arithmetic."
3. **Adopt an asymmetric mastery threshold near the top**, like IXL's Challenge Zone (misses cost more than hits gain past 90) [13], so a lucky streak cannot fake mastery.
4. **Reserve a timing dimension for procedural-fluency skills only** (arithmetic facts, algebraic manipulation), inspired by Kumon's Standard Completion Time [10] — do not extend timing pressure to reasoning tasks, where WWC found no strong evidence the speed-gated model builds conceptual understanding [11].
5. **Do not build a Prodigy-style status economy.** Avoid mechanics where paying users get visibly superior cosmetics that non-paying peers see — the exact shape of a formal FTC complaint [15][16][17]. If Math Challenge monetizes, keep premium tiers parent-facing (reports, extra profiles, tutor depth), not child-facing status symbols.
6. **Build at least one wordless/minimal-text problem track for ages 4–7**, following ST Math's JiJi model [24][25] — it needs no translation and launches in all five languages at zero incremental localization cost.
7. **Design evidence infrastructure in from day one**, ideally WWC-shaped. Most reviewed products with strong market reputation (Brilliant, Matific, Mathletics) lack independent efficacy evidence; the ones that can make school/district-grade claims (DreamBox, ST Math) built for measurement early, not after the fact.
8. **Treat Khanmigo's null result as a warning against AI-tutor overclaiming.** A controlled study found no significant advantage over a plain search engine despite subjective preference for the AI [3]; validate Math Challenge's tutor on outcomes, not satisfaction, before marketing it as pedagogically superior.
9. **Design problem formats that resist trivial photo-solving.** A homework-photo-solver (Google's OCR+Gemini stack) defeats any static symbolic/text problem in seconds [26]; favor interactive/manipulable UI (drag, order, construct, multi-step reveal) for problems meant to be reasoned through, not looked up.
10. **Avoid launching an adjacent subject as a separate standalone app.** Duolingo Math's lower adoption versus sibling subjects, folded back into the flagship app within about a year [28], argues for one PWA with themed grade/language modes rather than splitting into separate apps.
11. **Use a spiral curriculum, not a strict linear ladder**, following Matific's modular/spiral design — topics resurface at increasing difficulty. This suits parent-managed, multi-grade profiles, where a child moving between grade bands needs prior topics reachable and re-testable, not archived.
12. **Keep the "why" visible in every grading interaction**, as Brilliant [7] and Khan Academy do by default, and as ST Math shows through the direct consequence of a wrong move rather than a text verdict [24]. The failure state should teach, not just mark red.
13. **Consider a live/competitive mode carefully.** Mathletics' real-time competition is a differentiator, but gamification meta-analyses show large yet highly heterogeneous effects [32] — execution quality, not the presence of competition, decides whether it helps or adds anxiety for less confident learners.
14. **The market gap:** no reviewed product combines (a) Brilliant-grade real-problem craft, (b) Kumon/IXL-grade verifiable incremental mastery gating, (c) ST Math-grade language-independent design, and (d) a business model that doesn't pressure children through in-game status. Products have craft-without-evidence (Brilliant), evidence-without-multilingual-design (DreamBox, ST Math), or engagement-without-integrity (Prodigy) — a product credibly claiming all four at once has real positioning room.

## Open questions for the project owner

1. Should Math Challenge commit, from day one, to instrumentation that would support a future WWC-style or matched-comparison efficacy study (even if the study itself is commissioned later)?
2. Should the wordless/spatial problem track (ST Math-inspired) be scoped for ages 4–7 only, or extended further as a general "visual reasoning" mode across grades?
3. Given the Prodigy FTC precedent, should Math Challenge adopt an explicit internal policy barring child-facing cosmetic monetization entirely, documented in `docs/wiki/decisions.md` as an ADR, so no future feature proposal can reintroduce it without a conscious decision to override?
4. Is a live/real-time competitive mode (Mathletics-style) in scope for a later milestone, and if so, does the owner want confidence-level gating (e.g., only matched-skill-level opponents) to mitigate the anxiety risk the gamification literature flags for low-confidence learners?
5. Should the AI tutor feature explicitly avoid claims of "proven learning gains" in marketing copy until Math Challenge has run its own outcome study, given Khanmigo's null result in at least one controlled comparison?

## Sources

1. Khan Academy Help Center — "What are energy points, badges, and avatars?" https://support.khanacademy.org/hc/en-us/articles/202487710-What-are-energy-points-badges-and-avatars
2. Khan Academy Blog — "Khan Academy Efficacy Results, November 2024" https://blog.khanacademy.org/khan-academy-efficacy-results-november-2024/
3. Journal of Teaching and Learning — "Leveraging 'Khanmigo' Generative AI-Powered Tool for Personalized Tutoring to Learn Scientific Concepts" https://jtl.uwindsor.ca/index.php/jtl/article/view/10052
4. Khan Academy Blog — "How Khan Academy Is Building a Better AI Tutor: Our Most Recent Learnings" https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/
5. SkillsCouter — "Brilliant.org Review 2026" https://skillscouter.com/brilliant-review-math-science-coding/
6. SchemaNinja — "Brilliant.org Pricing 2026" https://schemaninja.com/brilliant-org-pricing/
7. Brilliant — "Brilliant Basics" Help Center https://brilliant.org/help/using-brilliant/
8. Kumon — "Self-Learning: The Kumon Method and Its Strengths" https://www.kumon.com/about-kumon/kumon-method/self-learning
9. Kumon Institute of Education — "Small-Step Worksheets" https://www.kumongroup.com/eng/about-kumon/method/small-steps/
10. Kumon — "Understanding Completion Time in Kumon: A Parent's Practical Guide" https://www.kumon.com/resources/canadian_english/understanding-completion-time-in-kumon-a-parents-practical-guide/
11. What Works Clearinghouse — "WWC Intervention Report: Kumon Math" (March 2009) https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_kumon_031009.pdf
12. IXL — "SmartScore Guide" https://www.ixl.com/materials/SmartScore_Guide.pdf
13. IXL Official Blog — "IXL SmartScore: The key to mastery-based learning" https://blog.ixl.com/2020/11/11/ixl-smartscore-the-key-to-mastery-based-learning/
14. Brighterly — "IXL Cost: All You Need to Know [2026]" https://brighterly.com/blog/ixl-cost/
15. EdWeek — "Popular Interactive Math Game Prodigy Is Target of Complaint to Federal Trade Commission" https://www.edweek.org/technology/popular-interactive-math-game-prodigy-is-target-of-complaint-to-federal-trade-commission/2021/02
16. NBC News — "In Complaint to FTC, Child Advocates Warn Prodigy Math Game Exploiting Pandemic to Prey on Students, Parents" https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294
17. Fairplay for Kids — "7 reasons to say 'no' to Prodigy" https://fairplayforkids.org/pf/prodigy/
18. Prodigy Game Wiki (Fandom) — "Battles" https://prodigy-game.fandom.com/wiki/Battles
19. Brighterly — "Prodigy Membership Cost 2026: How Much Does It Really Cost?" https://brighterly.com/blog/prodigy-membership-cost/
20. Higher Ed Dive — "Harvard research finds positive results from DreamBox adaptive learning" https://www.highereddive.com/news/harvard-research-finds-positive-results-from-dreambox-adaptive-learning/420471/
21. What Works Clearinghouse — "Evidence Snapshot: DreamBox Learning" https://ies.ed.gov/ncee/wwc/EvidenceSnapshot/627
22. Business Wire — "Study Proves DreamBox Learning Significantly Increases Math Achievement After Only One Hour of Use Per Week" https://www.businesswire.com/news/home/20230330005199/en/Study-Proves-DreamBox-Learning%C2%AE-Significantly-Increases-Math-Achievement-After-Only-One-Hour-of-Use-Per-Week
23. WestEd — "Evaluation of the MIND Research Institute's Spatial-Temporal Math (ST Math) Program in California" (2014) https://www.wested.org/resource/stmathevaluation2014/
24. MIND Research Institute — "ST Math Meets ESSA Tier 2 and WWC Standards" https://blog.mindresearch.org/news/st-math-meets-essa-tier-2-and-wwc-standards
25. MIND Education / ST Math — "Validation and Methodology" https://stmath.com/impact/validation-and-methodology
26. Business Model Canvas Template — "How Does Photomath Company Work?" https://businessmodelcanvastemplate.com/blogs/how-it-works/photomath-how-it-works
27. AI Chat Daily — "Photomath review 2026: is the math solver still essential?" https://www.aichatdaily.com/tools/photomath
28. Duolingo Wiki (Fandom) — "Math" https://duolingo.fandom.com/wiki/Duolingo_Math
29. Matific — Parents product page (efficacy claim) https://www.matific.com/us/en-us/home/parents/
30. Educational App Store — "Matific Review - Features, Pricing, Pros & Cons" https://www.educationalappstore.com/app/matific-for-school-educational-math-games
31. Mathletics — "How much does Mathletics cost?" https://knowledgebase.mathletics.com/pricing/how-much-does-mathletics-cost
32. PMC — "Examining the effectiveness of gamification as a tool promoting teaching and learning in educational settings: a meta-analysis" https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
