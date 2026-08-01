# Espacement, pratique de récupération et entrelacement appliqués aux mathématiques

> Recherche Math Challenge — 2026-07-31 — sujet 05

## Résumé exécutif (FR)

- La pratique **entrelacée** (mélanger les types de problèmes plutôt que de les regrouper par blocs) double le résultat aux tests de mathématiques un jour plus tard, même si elle dégrade la performance *pendant* la pratique elle-même [1][2].
- Dans une salle de classe réelle de 7e année (n = 140, neuf semaines, test surprise deux semaines plus tard), la pratique entrelacée a surpassé la pratique en bloc, et les enseignants l'ont jugée réalisable sans matériel supplémentaire [2][3].
- Une dose plus élevée d'entrelacement a produit de meilleurs résultats à la fois à deux jours et à un mois (n = 126, 7e année) ; le bénéfice ne dépend pas du fait que les problèmes « se ressemblent » entre eux [4][5].
- Les Bjork (UCLA) appellent cela les « difficultés désirables » : des conditions qui ralentissent l'apprentissage apparent mais améliorent la rétention à long terme — espacement, entrelacement, récupération, génération et variation [6][7].
- L'« effet de test » (Roediger & Karpicke, 2006) : récupérer une information en mémoire renforce plus que la relire, et l'avantage augmente à mesure que le délai avant le test final s'allonge [8].
- L'intervalle de révision optimal n'est pas fixe : il dépend de la durée pendant laquelle le souvenir doit persister. Pour une semaine, l'écart optimal est d'environ 20 à 40 % de l'intervalle ; pour un an, d'environ 5 à 10 % [9].
- Algorithmes de répétition espacée dans des logiciels réels : Leitner (boîtes à intervalles croissants), SM-2 (SuperMemo/Anki classique, facteur de facilité), FSRS (Anki actuel, modélise stabilité/difficulté/récupérabilité par carte), et la régression de demi-vie de Duolingo (p = 2^(−Δt/h), a amélioré l'engagement quotidien de 12 %) [10][11].
- L'« apprentissage de la maîtrise » exige traditionnellement 80 à 90 % de précision avant de progresser ; des données récentes suggèrent que des seuils plus élevés (0,98) améliorent la performance ultérieure ; « N réponses correctes d'affilée » (typiquement 3) est un indicateur indirect, peu coûteux et courant [12][13].
- L'oubli suit mieux une courbe en loi de puissance qu'une exponentielle pure — raison pour laquelle FSRS a abandonné l'exponentielle [10][16].
- Pour Math Challenge, on recommande un programmateur de type FSRS simplifié par compétence (et non par question), avec entrelacement au sein de chaque session dès que deux compétences ou plus sont actives, et un seuil de maîtrise à deux étapes (série de réussites + révision espacée réussie).

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

## Résultats

### 1. La pratique entrelacée en mathématiques (Rohrer & Taylor)

Les études en laboratoire de Rohrer et Taylor ont fait pratiquer aux enfants quatre types de problèmes mathématiques, soit en bloc (AAAA BBBB), soit entrelacés (ABCD ABCD). L'entrelacement *nuisait* à la performance pendant la session, mais **doublait les résultats du test réalisé le lendemain** [1] — la signature caractéristique d'une difficulté désirable.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) ont mené un essai randomisé contrôlé en classe : des élèves de 7e année (n = 140) ont reçu une pratique en bloc ou entrelacée pendant neuf semaines, testés sans préavis deux semaines plus tard. Le matériel pratiqué de façon entrelacée a obtenu de meilleurs résultats [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900-908) ont mené un essai randomisé contrôlé dose-réponse (n = 126, 7e année) : une dose plus élevée d'entrelacement dans les mêmes feuilles d'exercices a augmenté les résultats à la fois à environ 2 jours et à 1 mois, sans temps de pratique supplémentaire [4]. Le bénéfice n'est pas un artefact de la similarité superficielle entre les types de problèmes — il se maintient même quand les problèmes entrelacés semblent assez différents, ce qui concorde avec l'idée que l'entrelacement entraîne la *sélection de stratégie*, et non le rappel mécanique [5]. Les enquêtes auprès des enseignants ont jugé l'entrelacement hautement réalisable — il exige seulement de réordonner les problèmes existants [2][3].

### 2. Les difficultés désirables de Bjork (UCLA)

Robert & Elizabeth Bjork (1994) ont inventé l'expression « difficultés désirables » : des conditions qui ralentissent l'*acquisition* améliorent souvent la *rétention et le transfert* à long terme, car la performance pendant l'apprentissage et l'apprentissage lui-même sont dissociables [6]. Cinq difficultés bénéficient de preuves solides : l'espacement, l'entrelacement, la pratique de récupération, la génération et la pratique variée [7]. Une conception pédagogique optimisée pour des sessions fluides et sans erreur (répétition massée, blocs, relecture) produit un apprentissage agréable sur le moment mais qui ne dure pas.

### 3. L'effet de test (Roediger & Karpicke)

Roediger & Karpicke (2006) ont comparé l'étude répétée à des tests répétés sur le même matériel. Immédiatement après, ceux qui avaient étudié semblaient meilleurs (environ 83 % contre 71 % de rappel) ; une semaine plus tard, le schéma s'inversait (environ 40 % contre 61 %) [8]. Le bénéfice de la pratique de récupération augmente avec le délai avant le test décisif — la même signature que l'entrelacement. Implication : une boucle « réponse, puis rétroaction » devrait être l'événement d'apprentissage principal, et non une évaluation greffée après coup sur l'enseignement.

### 4. Intervalles d'espacement optimaux — la ligne de crête temporelle de Cepeda et al.

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, plus de 1 350 sujets) ont fait varier l'écart entre l'étude et le réapprentissage et testé la rétention jusqu'à un an plus tard. L'écart optimal **n'est pas fixe** — en proportion du délai final du test, il va d'environ 20 à 40 % pour un objectif à 1 semaine, jusqu'à environ 5 à 10 % pour un objectif à 1 an [9]. Bachoter avant un contrôle dont on doit se souvenir pendant un an sous-espace ; espacer des révisions d'un mois pour se souvenir de quelque chose pendant une semaine sur-espace — exactement la tension que les planificateurs adaptatifs (SM-2, FSRS, HLR) existent pour résoudre.

### 5. Algorithmes de répétition espacée utilisés dans des logiciels réels

**Leitner (1972).** Les cartes vivent dans des boîtes (classiquement 5) à cadence fixe (environ 1, 2, 4, 7, 14 jours) ; une bonne réponse fait passer à la boîte suivante, une mauvaise réponse renvoie à la boîte 1 [14].

**SM-2 (Woźniak, 1987).** Chaque élément a un facteur de facilité (EF), qui commence à 2,5, avec un plancher à 1,3. Intervalles : I(1) = 1, I(2) = 6, puis I(n) = I(n−1) × EF. Une note de qualité de 0 à 5 ajuste l'EF via EF' = EF + (0,1 − (5−Q)×(0,08 + (5−Q)×0,02)) ; Q < 3 réinitialise l'élément [15].

**FSRS (réglage actuel par défaut d'Anki).** Suit trois variables d'état par carte : la **Stabilité** S (nombre de jours avant que la probabilité de rappel descende à 90 %), la **Difficulté** D (1 à 10) et la **Récupérabilité** R (0 à 1, décroissant selon une courbe en loi de puissance, non exponentielle). Un seul réglage, la **rétention désirée** (typiquement 0,85 à 0,95, valeur par défaut environ 0,90), pilote le planificateur pour inverser la courbe d'oubli et choisir l'intervalle où la R prévue atteint cette cible. FSRS-6 ajuste environ 19 à 21 poids par apprenant à partir de l'historique de révision par descente de gradient, surpassant le facteur de facilité fixe de SM-2 une fois que suffisamment de données existent (environ 1 000 révisions ou plus) [10].

**Régression de demi-vie (Duolingo ; Settles & Meeder, 2016, ACL).** Modélise la demi-vie de mémoire h de chaque élément comme une fonction log-linéaire des comptes précédents de bonnes/mauvaises réponses ; probabilité de rappel p = 2^(−Δt/h) — une courbe exponentielle explicite (contrairement à la loi de puissance de FSRS). A réduit l'erreur de prédiction de 45 % ou plus par rapport aux références et a augmenté l'engagement quotidien de 12 % lors d'un test A/B en conditions réelles [11].

**Point commun.** Les quatre algorithmes programment la prochaine exposition au moment où la probabilité de rappel est sur le point de franchir un seuil cible — ni avant (répétition gaspillée), ni longtemps après (déjà oublié). Ils diffèrent selon que la courbe d'oubli est fixe (Leitner, SM-2) ou ajustée par élément/apprenant (FSRS, HLR), et selon la forme exponentielle ou en loi de puissance.

### 6. Seuils d'apprentissage de la maîtrise

L'apprentissage de la maîtrise de Bloom exige environ 80 à 90 % de précision avant de progresser, avec remédiation en dessous du seuil [12][13]. Un indicateur indirect courant et peu coûteux, notamment dans les programmes de fluence des faits du primaire et du secondaire, est « N réponses correctes d'affilée » (souvent 3), qui se réinitialise proprement à la première erreur [13]. Des recherches récentes sur le tutorat adaptatif ont montré que relever la barre de maîtrise d'une probabilité estimée d'environ 0,95 à 0,98 améliorait la performance sur les leçons suivantes dépendantes — le seuil traditionnel est insuffisant pour le contenu prérequis [12]. La littérature sur la fluence des faits souligne que la maîtrise doit être évaluée *après un intervalle*, pas seulement pendant la session d'entraînement, car la précision du rappel immédiat surestime la maîtrise durable [13].

### 7. Courbes d'oubli

La courbe classique d'Ebbinghaus : une perte initiale abrupte (environ 42 % oubliés en 20 minutes, environ 67 % en 24 heures), puis une longue traîne qui s'aplatit [16]. Ebbinghaus l'a modélisée comme approximativement exponentielle, mais le consensus actuel — et la raison pour laquelle FSRS a remplacé son propre modèle exponentiel par une courbe en loi de puissance dans FSRS-4.5/6 — est que l'oubli réel décélère plus vite que ne le prédit une décroissance exponentielle pure [16][10].

### 8. Compétence mathématique procédurale vs conceptuelle

Les travaux de Rohrer/Taylor visent la compétence *procédurale* : quelle méthode s'applique à quel problème. Le bénéfice de l'entrelacement viendrait, selon la théorie, de la **pratique de discrimination** — remarquer quelle stratégie un problème exige, ce que la pratique en bloc n'exige jamais puisque le bloc révèle la stratégie [1][2][5]. Pour la compréhension *conceptuelle*, l'espacement et la pratique de récupération aident aussi via le même mécanisme de renforcement de la trace, mais l'entrelacement ajoute une valeur de transfert — reconnaître l'applicabilité d'un concept dans un contexte nouveau et mélangé [6][7][8]. En bref : la fluence procédurale veut une récupération espacée *et* entrelacée ; la compréhension conceptuelle veut une récupération espacée et gagne davantage de l'entrelacement une fois plusieurs concepts actifs.

## Implications de conception pour Math Challenge

1. **Programmer par nœud de compétence, pas par question.** Suivre des unités comme « soustraction à 2 chiffres avec emprunt » comme entité programmable — les compétences mathématiques se généralisent à de nombreuses instances de questions, contrairement aux cartes mémoire.

2. **Algorithme concret recommandé : FSRS allégé avec démarrage à froid façon Leitner.** Les nouvelles compétences avec moins de 20 points de données utilisent une échelle simple façon Leitner (1 → 3 → 7 → 16 → 35 jours, réinitialisation à la mauvaise réponse, sans ajustement requis). Une fois suffisamment de tentatives accumulées, passer à un modèle de type FSRS initialisé avec les poids par défaut publiés de FSRS-6, réajustés périodiquement hors ligne. Exposer un seul réglage ajustable : rétention désirée = 0,90 par défaut, ajustable par tranche scolaire (0,85 pour les plus jeunes afin de réduire la frustration, 0,92 ou plus pour les utilisateurs plus âgés/compétitifs).

3. **Seuil de maîtrise à deux étapes.** Exiger 3 réponses correctes consécutives à difficulté croissante au sein d'une compétence comme signal « provisoirement appris » (la convention courante en fluence des faits [13]), mais ne marquer une compétence « maîtrisée » pour la programmation qu'après qu'elle survive aussi à une révision espacée réussie avec un écart ≥ 3 jours — ce qui encode directement la leçon de l'effet de test selon laquelle les séries de rappel immédiat surestiment l'apprentissage durable.

4. **Ne jamais bloquer la pratique par compétence dès que 2 compétences ou plus sont en rotation.** Dès qu'une deuxième compétence est due pour révision, l'entrelacer avec la leçon en cours au sein de la même session (ABAB/ABCABC), plutôt que de finir les problèmes d'une compétence avant de commencer la suivante — le changement à effet le plus élevé et à coût nul que soutient la littérature [1][2][4].

5. **Ratio d'entrelacement en session : environ 40 à 60 % de nouveau/leçon en cours mélangés avec environ 40 à 60 % de révision due**, tirés de 2 à 4 autres compétences, mélangés au niveau de la question (pas en sous-blocs de 3 à 4 problèmes du même type). Pour la maternelle/pré-maternelle, privilégier un ratio 70/30 nouveau/révision et entrelacer au plus 2 compétences, étant donné les contraintes de mémoire de travail que la littérature sur les difficultés désirables signale elle-même comme une condition limite [6][7].

6. **Les révisions sont toujours de la récupération, jamais une réexposition passive.** Un événement de révision exige que l'enfant produise une réponse avant qu'aucune explication ne s'affiche, même pour du contenu « déjà appris » [8].

7. **Adapter les écarts de révision à la durée pendant laquelle la compétence doit persister, et non à une cadence calendaire fixe.** Étiqueter les compétences comme « limitées à une unité » (écarts plus serrés, environ 20 à 30 % de la fenêtre de rétention) ou « fondamentales » (écarts progressivement plus larges, environ 5 à 10 % d'un horizon d'un an une fois bien établies), selon la ligne de crête de Cepeda [9].

8. **Suivre la Difficulté séparément de la Stabilité par compétence**, comme le fait FSRS, afin qu'un enfant en difficulté obtienne à la fois un intervalle suivant plus court et des gains de stabilité plus faibles par bonne réponse qu'un enfant qui a trouvé cela facile — ce qui empêche un algorithme à facilité fixe de traiter une réponse chanceuse comme une véritable maîtrise.

9. **Modéliser l'oubli avec une courbe en loi de puissance, et non une exponentielle pure**, pour les estimations de placement/difficulté adaptative de « combien cet enfant a-t-il oublié depuis la dernière pratique » — une exponentielle pure surestime l'oubli aux longs délais et le sous-estime peu après l'apprentissage [16][10].

10. **Instrumenter les deux signatures de Rohrer comme indicateurs internes.** Suivre la précision en session et la précision de rappel différé (par exemple, un court quiz d'échauffement sur les compétences de la veille) comme des indicateurs clés distincts ; s'attendre à ce que la précision en session entrelacée paraisse parfois plus basse qu'en bloc alors que la précision différée est plus élevée — ne pas laisser une baisse de précision en session déclencher un retour au blocage.

11. **Rapporter séparément aux parents/enseignants « pratiqué » et « appris ».** Afficher le signal de maîtrise à deux étapes (point 3) plutôt que la précision brute de session, pour éviter le piège où une série réussie le même jour ressemble à de la maîtrise puis échoue à la révision surprise suivante.

12. **La rétroaction du tuteur IA doit inciter à la récupération avant de révéler les solutions.** En cas de mauvaise réponse, donner d'abord un indice qui étaye la récupération (effet de génération [6][7]) ; réserver les exemples entièrement résolus pour une deuxième tentative erronée.

## Questions ouvertes pour le porteur du projet

1. L'état de programmation doit-il vivre uniquement par enfant et par compétence, ou devons-nous aussi maintenir un ajustement de paramètre FSRS au niveau de la population pour amorcer les programmes des nouveaux enfants avant que suffisamment de leurs propres données existent ?
2. La rétention désirée doit-elle être fixée à 0,90 pour toute la plateforme, ou un réglage ajustable pour les utilisateurs plus âgés/en filière doctorat, comme Anki l'expose aux utilisateurs avancés ?
3. L'étiquetage « limité à une unité » vs « compétence fondamentale » doit-il être rédigé manuellement par nœud de curriculum, ou inféré à partir de la profondeur du graphe de prérequis ?
4. Le ratio d'entrelacement interagit-il avec le système de signaux comportementaux anti-triche — mélanger les types de compétences rend-il la détection des délais/motifs plus facile ou plus difficile à raisonner ?
5. La barre de maîtrise à deux étapes (série + révision différée) doit-elle bloquer la progression vers l'unité de curriculum suivante, ou seulement affecter la programmation des révisions tandis que la progression reste régie par un seuil de précision distinct ?

## Sources

1. Rohrer & Taylor, "The shuffling of mathematics problems improves learning" — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf
2. Taylor & Rohrer (2010), "The effects of interleaved practice," *Applied Cognitive Psychology* 24, 837-848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598
3. IES WWC Study 89950, essai randomisé contrôlé en classe sur la pratique mathématique entrelacée — https://ies.ed.gov/ncee/wwc/Study/89950
4. Rohrer, Dedrick & Stershic (2015), "Interleaved practice improves mathematics learning," *Journal of Educational Psychology* 107(3), 900-908 — https://files.eric.ed.gov/fulltext/ED557355.pdf
5. Rohrer et al. (2014), "The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems" — https://pubmed.ncbi.nlm.nih.gov/24578089/
6. Bjork & Bjork (2011), "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning" — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/
7. "Desirable Difficulties: Bjork's 5 Principles" — https://www.structural-learning.com/post/desirable-difficulties
8. Roediger & Karpicke (2006), "Test-Enhanced Learning" / "The Power of Testing Memory," *Perspectives on Psychological Science* 1(3), 181-210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), "Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention," *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf
10. Documentation de l'algorithme FSRS — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm et https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
11. Settles & Meeder (2016), "A Trainable Spaced Repetition Model for Language Learning," ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; code — https://github.com/duolingo/halflife-regression/blob/master/README.md
12. "How Much Mastery is Enough Mastery?" EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html
13. "The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices" — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/
14. Aperçu du système Leitner — https://e-student.org/leitner-system/ et https://supermemo.guru/wiki/Leitner_system
15. Spécification originale de l'algorithme SM-2 de SuperMemo — https://super-memory.com/english/ol/sm2.htm
16. Courbe d'oubli d'Ebbinghaus — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve et https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
