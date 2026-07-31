# Leaderboards and Competition Design: Psychological Effects, Rating Systems, and Fair Cross-Difficulty Comparison

> Math Challenge research — 2026-07-31 — topic 18

## Resumen ejecutivo (ES)

- Los leaderboards en educación tienen efectos **mixtos y dependientes de la posición**: motivan a quienes están cerca de la cima, pero desmotivan de forma consistente a quienes quedan en el último lugar — la revisión sistemática de 2023 sobre leaderboards en entornos gamificados documenta este patrón "de arriba a abajo" y pide medir el efecto por posición, no solo el promedio de la clase [1][2].
- La teoría de la comparación social de Festinger (1954) explica el mecanismo: comparar "hacia arriba" puede motivar o deprimir según la autoestima previa; comparar "hacia abajo" protege el ánimo pero no enseña nada. Un leaderboard sin diseño cuidadoso maximiza la comparación hacia arriba para la mayoría del grupo [4].
- Christy y Fox (2014), en un aula virtual, encontraron que el componente de comparación social (el ranking) pesó más que la amenaza del estereotipo en el desempeño matemático de mujeres — el ranking en sí cambia el resultado, no solo el contenido [1].
- La teoría de la autodeterminación (Deci y Ryan) predice que la competencia percibida como controladora desplaza la motivación intrínseca; por eso importa que participar en el ranking sea opcional [5].
- La meta-análisis de Johnson y Johnson (1981, 122+ estudios) encuentra que las estructuras cooperativas superan consistentemente a las competitivas e individualistas en logro y en relaciones entre pares [6].
- Glicko-2 (con desviación de calificación RD y volatilidad σ) es más apropiado que Elo simple para un juego con sesiones irregulares como Math Challenge; TrueSkill/OpenSkill resuelven un problema de equipos que este proyecto no tiene todavía [7][8][9][10].
- Para comparar un niño de 6 años sumando con un adulto en temas avanzados, la solución correcta es una escala de habilidad (θ) estimada independientemente de qué ítems se respondieron — el enfoque de la Teoría de Respuesta al Ítem (TRI), y lo que Codeforces aproxima calificando el rendimiento relativo al rival, no el valor nominal del problema [11].
- El sistema de ligas de Duolingo (grupos semanales de ~30 con ascenso/descenso) es la referencia más cercana al diseño ya decidido para Math Challenge; el tamaño pequeño del grupo es intencional: mantiene una posición alcanzable para cualquiera esa semana [13].
- El "sandbagging" (bajar el rendimiento a propósito) y el "smurfing" (cuentas nuevas para jugar por debajo del nivel real) son fallas conocidas de cualquier emparejamiento por habilidad; se mitigan con RD/volatilidad alta en cuentas nuevas, no con reglas manuales.
- Prodigy Math ha recibido críticas documentadas (queja ante la FTC de 20+ organizaciones, cobertura de NBC News y Financial Times) por mecánicas de juego que diluyen el contenido matemático real — advertencia directa contra dejar que la capa de juego devore el aprendizaje [14][15][16].

## Executive summary (EN)

Leaderboards in education produce **position-dependent, not uniform, effects**: they help learners near the top, and reliably hurt learners at the bottom, who tend to disengage — the 2023 systematic review of leaderboards in gamified educational settings frames this as a "top to bottom" pattern and calls for measuring effects by rank position, not classroom average [1][2]. Christy and Fox (2014) found that a leaderboard's social-comparison component outweighed stereotype threat in driving women's math performance in a simulated classroom — the ranking itself changes behavior [1]. Festinger's (1954) social comparison theory supplies the mechanism: upward comparison can motivate or demoralize depending on prior self-esteem; downward comparison protects mood but teaches nothing — a naive leaderboard maximizes upward comparison for most of any group [4]. Self-determination theory (Deci & Ryan) predicts competition perceived as controlling crowds out intrinsic motivation, the basis for keeping any ranking optional [5]. Johnson and Johnson's meta-analyses (122+ studies) found cooperative goal structures consistently outperform competitive and individualistic ones on both achievement and peer relationships [6].

On rating systems: Elo has no confidence measure and drifts over time; Glicko-2 adds rating deviation (RD) and volatility (σ), suited to irregular play; TrueSkill/OpenSkill extend Bayesian rating to teams, a problem Math Challenge does not currently have [7][8][9][10]. For comparing wildly different difficulty levels, the right tool is not point normalization but an ability estimate independent of which items were answered — Item Response Theory (IRT), and what Codeforces approximates by rating performance relative to opponents of known skill rather than fixed per-problem points [11]. Duolingo's weekly leagues of ~30 users is the closest real precedent to Math Challenge's own decided design, and the small group size is deliberate: it keeps a top finish achievable for anyone engaging that week [13]. Sandbagging and smurfing are known failure modes of skill matchmaking, best mitigated structurally (fast RD/σ convergence for new/erratic accounts) rather than by policing. Prodigy Math has drawn documented criticism — an FTC complaint from 20+ advocacy groups, NBC News and Financial Times coverage — for mechanics that crowd out actual math content, a direct warning against letting the reward layer dominate learning [14][15][16].

## Findings

### 1. Leaderboards in education: who they motivate, who they demotivate

The 2023 systematic review "The use of leaderboards in gamified educational settings" frames the central finding as **position-dependent, not uniform**: a learner's response depends heavily on where they land on the board [2]. A 2025 study on leaderboard-based feedback argues for "more standardized ways of examining potential effects," because prior research mixed positive and null results instead of separating top, middle, and bottom performers [2]. Christy and Fox's (2014) study found a social-comparison manipulation (a ranked leaderboard) had a stronger effect on math performance than stereotype threat, and some participants who performed worse under comparison pressure still reported *higher* academic identification — behavioral and felt-motivation effects can diverge [1]. A broader meta-analysis of 41 gamification studies (5,071 participants) found a large aggregate effect (g = 0.822) but could not isolate leaderboard-specific effects on lower performers — a positive average does not mean every rank position benefits equally [3]. The design conclusion: leaderboards help engagement on average while concentrating real risk of harm at the bottom, invisible unless measured by position.

### 2. Social comparison theory and children

Festinger's (1954) theory holds people evaluate their abilities by comparing with others, especially absent an objective yardstick [4]. Upward comparison (to someone better) can motivate high-self-esteem people but demoralize those already doubting themselves; downward comparison protects mood without producing learning gain [4]. Children generally have less stable self-esteem than adults, and a permanent, always-upward-facing leaderboard — where the median child always sees people ahead and is never shown reassuring context — structurally favors the upward comparison that the theory flags as demoralizing for lower-confidence individuals.

### 3. Self-determination theory: competition as controlling vs. informational

Self-determination theory (Deci & Ryan) organizes motivation around autonomy, competence, and relatedness, on a spectrum from controlled to autonomous [5]. Competition's effect depends on whether it is experienced as informational feedback about one's own growing competence, or as controlling pressure to beat others. A leaderboard a child cannot opt out of, visible to peers, tying identity to rank, sits closer to controlling; the same skill signal delivered privately and framed as "you improved" sits closer to informational. This is why optionality matters as much as the ranking computation itself [5].

### 4. Cooperative alternatives: the evidence

Johnson and Johnson's 1981 meta-analysis (122 studies, 286 findings) and a later extension (148 studies on early adolescents) both found cooperative goal structures outperform competitive and individualistic ones on achievement, because cooperative settings generate peer support that competitive settings do not [6]. This directly supports team/class-total mechanics (combined class XP, a "family league" total) as a complement to individual ranking — cooperative goals recruit a motivational channel individual competition cannot.

### 5. Rating systems: Elo, Glicko-2, TrueSkill, OpenSkill

**Elo**: `E_A = 1/(1+10^((R_B−R_A)/400))`, `R_A' = R_A + K·(S_A−E_A)`. No confidence concept — a rating from 3 games is treated like one from 300 — and known to drift/inflate over long horizons (chess's 2700+ population grew from 1 player in 1979 to 44 by 2012) [7].

**Glicko-2** adds **Rating Deviation (RD)**, quantifying confidence (shrinks with play, grows with inactivity), and **volatility (σ)**, quantifying result consistency [8]. New players start with high RD (reference implementation: 350) so early results move ratings fast; established low-RD players move slowly. A tau (τ) parameter (~0.3–1.2) constrains how fast volatility itself changes. It operates over discrete rating periods [8].

**TrueSkill** (Microsoft Research) represents each player as a Gaussian (μ, σ), extending Bayesian rating to teams by summing individual skills (powers Xbox Live matchmaking); it cannot detect cheating, cannot handle intentional handicaps, and cannot separate individual contribution when players consistently team up [9].

**OpenSkill** is an open-source, patent-unencumbered alternative implementing Weng-Lin Bayesian approximations (Bradley-Terry, Plackett-Luce, Thurstone-Mosteller), targeting asymmetric multi-team matchmaking [10].

**Fit for a learning app**: Math Challenge is fundamentally single-player-against-content, closer to Glicko-2's original domain (individuals, irregular play, need for a confidence measure) than to TrueSkill/OpenSkill's team domain. Glicko-2 fits better; team-sum machinery solves a problem (team competition) not currently needed, at real added complexity.

### 6. Fair comparison across wildly different difficulty levels

Naively summing raw points rewards whoever answers the most easy problems fastest — exactly what competitive-programming platforms like Codeforces guard against: "the speed in solving easier problems is often decisive" is flagged as a known scoring distortion, corrected in practice by rating *performance relative to opponents of known rating* rather than a fixed point value per problem [11].

The generalizable principle is **Item Response Theory (IRT)**: instead of raw correct counts, IRT jointly estimates a person's ability (θ, a latent trait, standardized to mean 0, SD 1) and each item's difficulty (b) and discrimination (a), via a logistic model `p(θ) = c + (1−c)/(1+e^(−a(θ−b)))` [11]. Two people who answered completely different, differently-difficult items land on the *same* ability scale — precisely the "6-year-old vs. PhD" problem the global board needs solved. IRT also underlies adaptive testing, where each item is chosen to be maximally informative at the test-taker's current ability estimate [11].

A non-digital precedent is golf's **World Handicap System**: `Course Handicap = (Handicap Index × Slope Rating)/113 + (Course Rating − Par)`, where Slope Rating (55–155) captures how much harder a course is for a bogey golfer than a scratch golfer — normalizing player skill and task difficulty simultaneously, the same shape of problem as comparing a child's addition score to an adult's topology score [12].

### 7. Anti-inflation and season resets

Elo-family systems drift as populations grow; real systems counter this with periodic recalibration and by anchoring the population median (Lichess reports its median stays near 1500 with no significant long-run drift) [8]. Glicko-2's RD gives a complementary anti-inflation tool for free: an unexercised rating automatically grows more uncertain, so an old score cannot silently coast at an inflated value — every re-entry into competition re-tests the number.

### 8. Sandbagging and smurfing

Sandbagging (deliberately underperforming to face easier opponents) and smurfing (a skilled player on a fresh, low-rated account) are well-documented failure modes of skill matchmaking generally. Sandbagging is typically caught by unusually high result variance relative to history; smurfing is inherent to giving new accounts low/neutral ratings with high uncertainty, since a skilled new account wins quickly before its RD collapses and true rating catches up. Neither is solvable by the formula alone — real systems combine fast RD/σ convergence with anomaly detection outside the rating itself.

### 9. How named products handle child competition

- **Duolingo**: weekly leagues of ~30 learners grouped by similar activity level/time zone, ranked by XP, promotion of top and demotion of bottom performers, a top-tier elimination tournament, and a full leaderboard opt-out [13].
- **Khan Academy**: energy points and a five-tier badge system for skills/videos/challenges; leaderboards exist for several metrics, but framing emphasizes points/badges as recognition of effort and mastery.
- **Zearn**: explicitly mastery-based and non-competitive — lessons gate on a "Tower of Power" mastery check rather than beating peers, no leaderboard in its design documentation; stated rationale is equity and individualized pacing.
- **Prodigy Math**: game-progress and in-game currency layered onto math content; drew an FTC complaint from 20+ child-advocacy organizations (Financial Times, NBC News coverage) alleging manipulative, deceptive-marketing and upselling practices aimed at children, and an NEPC review concluding a Prodigy-commissioned Johns Hopkins study "fails to support" the company's learning-outcome claims [14][15][16].
- **Mathletics / Live Mathletics (3P Learning)**: runs large time-boxed competitions ("World Maths Day") and a real-time head-to-head "Live Mathletics" mode; detailed mechanics were not independently accessible and should be treated as unconfirmed.

### 10. Named criticism worth taking seriously

Published academic criticism of competitive gamification in children's learning is thinner than industry coverage suggests: most rigorous studies find real but *heterogeneous* effects — large aggregate gains alongside unclear or negative effects concentrated at specific rank positions — not an "always good/bad" story, and repeatedly call for measuring effects by subgroup rather than class-wide average [1][2][3].

## Design implications for Math Challenge

1. **Adopt Glicko-2, not Elo or TrueSkill, as the core rating algorithm.** Track `(rating μ, RD, volatility σ)` per player per grade-band/subject. Starting parameters per the Glicko-2 reference: rating 1500, RD 350, σ ≈ 0.06, τ in the 0.3–0.5 range (favor the low end — resist volatile swings more than a chess server would) [8]. Use short rating periods (e.g., daily), given many small "matches" (problems) rather than multi-day tournaments [8].
2. **Do not rate head-to-head; rate against item difficulty, IRT-style.** Model each problem with its own jointly-estimated difficulty/discrimination [11]. A correct answer on a hard item is a much bigger signal than one on an easy item — the direct fix for "whoever does the easiest problems fastest wins," since raw point totals never enter the comparison.
3. **Normalize the global board on an ability estimate (θ), never raw points or speed.** A 6-year-old's addition θ and an adult's advanced-math θ live on the same scale because both are estimated from responses to separately-calibrated items — the same principle as golf's Course Handicap [12]. Rank the global board by θ (or a bounded transform of it), not XP or solve count.
4. **Keep grade-band boards and the global board, but rank the global board on the same normalized θ scale.** Grade-band boards can show simpler, age-appropriate metrics (stars, streaks); θ-based ranking is reserved for the layer meant to be genuinely comparable across ages.
5. **League promotion/demotion: keep Duolingo's ~30-person group size; make demotion soft.** Promote the top band (e.g., top 15-20%) weekly; demote only the very bottom band (e.g., bottom 10%), and never demote anyone active fewer than N days that week — inactivity should freeze, not punish, directly targeting the "bottom disengages" finding [1][2].
6. **Protect the bottom 20% structurally, not just via copy.** Since the bottom of any group experiences constant upward comparison [4], give the bottom band a private, non-comparative signal ("you improved X% this week" against their own history) instead of only public rank — reframing feedback from comparative to informational [5].
7. **Never show the literal last-place rank number to a child by default.** The empirical harm concentrates at the very bottom [1][2]; show "top half / not top half" bands instead of exact rank for younger tiers, reserving exact numeric rank for the global board (opt-in) and older grade bands.
8. **Make the leaderboard optional and reversible.** Users (or a parent/teacher) should be able to opt out of the public global board while still using leagues/classroom mode, or vice versa, per Duolingo's own precedent and SDT's autonomy principle [5][13].
9. **Add a cooperative layer alongside individual ranking: class/family totals.** Per Johnson & Johnson's evidence [6], add a class-total or team-total metric (combined correct answers, combined streak days) for classroom mode that succeeds or fails together, recruiting peer encouragement as a second motivational channel.
10. **Guard against sandbagging/smurfing structurally, not by trust.** New accounts get high RD/σ so a smurf's early wins self-correct within a handful of sessions [8]. Flag accounts with anomalously high result variance for review rather than preventing sandbagging by rule alone.
11. **Reset season standings, but keep θ/RD/σ persistent across seasons.** Public weekly league standings should reset each cycle; the private ability estimate should persist and simply regain uncertainty during gaps — the same anti-inflation mechanism real systems use, and it avoids punishing a child returning after a school-year break.
12. **Do not let game/reward mechanics outrun the math content.** Prodigy's documented criticism specifically concerns game-progress/monetization mechanics diluting math practice time [14][15][16]; cap the fraction of session time on non-math game loop, and map every point/XP-earning event to an actually-answered math problem.
13. **Report leaderboard effects by rank position in Math Challenge's own analytics.** Since the literature's core complaint is that most studies only report an averaged effect [1][2][3], instrument the product to track retention/engagement separately for top-band, middle-band, and bottom-band users within each league — the only way to detect the "bottom disengages" pattern early.
14. **For classroom mode, let the teacher choose competitive intensity per room.** Give teachers a per-room toggle between individual ranked mode, cooperative team mode, or ranking-hidden practice mode — operationalizing the SDT/cooperative-learning findings as a real control rather than a fixed global policy [5][6].

## Open questions for the project owner

1. Should the global board rank by raw θ, or by a bounded/normalized transform (e.g., percentile within grade-matched cohort) — raw θ is more "honest," percentile more legible to a child without requiring them to understand a rating number?
2. What rating-period cadence — daily or per-session — fits Math Challenge's expected play frequency? This tunes Glicko-2's RD decay.
3. Should demotion ever be fully suspended for the youngest grade band, or is soft demotion (bottom 10%, active-only) sufficient across all ages?
4. Should the teacher's per-room competitive-intensity toggle be a one-time room setting or adjustable mid-week, and does changing it reset that week's standings?
5. Is there appetite to build "improved over your own history" as a first-class metric for the bottom band at launch, or is that scope for a later iteration?
6. Should new-item difficulty be curriculum-seeded (grade-level heuristic) with online IRT refinement from day one, or launch curriculum-only and add IRT calibration once enough response data exists?

## Sources

1. Christy, K. R., & Fox, J. (2014). "Leaderboards in a virtual classroom: A test of stereotype threat and social comparison explanations for women's math performance." *Computers & Education*, 78. https://psycnet.apa.org/record/2014-34088-008
2. "The use of leaderboards in gamified educational settings: A systematic review" (2023). https://www.researchgate.net/publication/369118313_The_use_of_leaderboards_in_gamified_educational_settings_A_systematic_review
3. Meta-analysis of gamification effects on student learning outcomes (41 studies, 5,071 participants). https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/
4. Festinger, L. (1954). Social comparison theory — overview and later research (upward/downward comparison). https://en.wikipedia.org/wiki/Social_comparison_theory
5. Self-Determination Theory (Deci & Ryan) — official theory site. https://selfdeterminationtheory.org/theory/
6. Johnson, D. W., Maruyama, G., Johnson, R., & Nelson, D. (1981). "Effects of Cooperative, Competitive, and Individualistic Goal Structures on Achievement: A Meta-Analysis." https://psycnet.apa.org/record/1981-05387-001
7. Elo rating system — formula, K-factor, known inflation issues. https://en.wikipedia.org/wiki/Elo_rating_system
8. Glickman, M. E. "Example of the Glicko-2 system" (official specification). http://www.glicko.net/glicko/glicko2.pdf
9. TrueSkill Ranking System (Microsoft Research project page). https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/
10. OpenSkill documentation (Weng-Lin Bayesian rating models, open-source TrueSkill alternative). https://openskill.me/en/stable/
11. Item Response Theory — ability parameter, item difficulty/discrimination, logistic model. https://en.wikipedia.org/wiki/Item_response_theory
12. World Handicap System (golf) — Handicap Index, Course Rating, Slope Rating normalization. https://en.wikipedia.org/wiki/World_Handicap_System
13. "How Duolingo Leaderboards and Leagues Work" (Duolingo blog); group-size/design-rationale detail via case study. https://blog.duolingo.com/duolingo-leagues-leaderboards/ ; https://trophy.so/blog/duolingo-gamification-case-study
14. Fairplay for Kids — "Prodigy's Losing Equation" (FTC complaint coverage). https://fairplayforkids.org/prodigy-losing-equation/
15. NBC News — "Child protection nonprofit alleges manipulative upselling" re: Prodigy. https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294
16. National Education Policy Center — newsletter review of Prodigy-commissioned Johns Hopkins study. https://nepc.colorado.edu/publication/newsletter-prodigy-032521
17. Financial Times — coverage of the Prodigy FTC complaint by 20+ advocacy organizations. https://www.ft.com/content/38d9d4e7-da71-42d0-bcb8-316a1fc371a3

## Notes on research limitations

Several leads could not be independently verified and are deliberately **not** cited as fact above: Khan Academy's precise current leaderboard configuration and Codeforces' exact rating-change formula (both returned HTTP 403 on fetch), and Mathletics/Live Mathletics' detailed reward-mechanic design (support content behind login). Where findings reference these products, they are scoped to what was independently confirmed and flagged as unconfirmed where not (§9).
