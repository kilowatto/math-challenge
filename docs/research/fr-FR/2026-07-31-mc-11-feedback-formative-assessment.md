# Rétroaction et évaluation formative en mathématiques — les preuves pour un tuteur IA

> Recherche Math Challenge — 2026-07-31 — sujet 11

## Résumé exécutif (FR)

- Hattie & Timperley (2007) : la rétroaction efficace répond à trois questions — « Où est-ce que je vais ? », « Comment est-ce que j'avance ? », « Où est-ce que je vais ensuite ? » — à quatre niveaux : tâche, processus, autorégulation et « moi ». Le niveau « moi » (éloges génériques) est le moins efficace [1].
- Kluger & DeNisi (1996), méta-analyse de 607 tailles d'effet : la rétroaction améliore la performance en moyenne (d=0,41), mais **plus d'un tiers des interventions de rétroaction l'ont dégradée** — le message « donner de la rétroaction aide toujours » est faux [2].
- Black & Wiliam (1998) ont passé en revue plus de 250 études : l'évaluation formative bien mise en œuvre produit des tailles d'effet de 0,4 à 0,7, supérieures à presque toute autre intervention éducative, et réduit particulièrement l'écart avec les élèves peu performants [3].
- Le moment (immédiat contre différé) compte moins que le **contenu** de la rétroaction ; une méta-analyse récente de 51 études (160 tailles d'effet) n'a trouvé aucune différence moyenne selon le moment, mais a trouvé que les mathématiques obtiennent des effets plus importants que d'autres matières, et que la rétroaction élaborée surpasse celle de simple correction [4][5].
- Shute (2008) distingue quatre types : Connaissance du Résultat (KR, seulement correct/incorrect), Connaissance de la Réponse Correcte (KCR), Rétroaction Élaborée (EF, explique le pourquoi) et Essayer-Jusqu'à-Correct (AUC). L'EF l'emporte en général, mais un excès d'élaboration peut saturer et nuire [5].
- Louer l'intelligence (« tu es très intelligent ») plutôt que l'effort (« tu as travaillé avec méthode ») réduit la persistance après l'échec, augmente les attributions à une aptitude fixe et pousse à choisir des tâches plus faciles — résultat classique de Mueller & Dweck (1998), 6 études [6].
- L'éloge exagéré (« incroyablement parfait ! ») prédit une **moindre** estime de soi avec le temps chez les enfants, et chez les enfants ayant déjà une estime de soi élevée, prédit davantage de narcissisme ; l'éloge sincère et non exagéré ne produit aucun de ces deux effets — Brummelman et al. (2014, 2017) [7].
- Les systèmes tuteurs intelligents (ITS) avec rétroaction au niveau de l'étape (step-based) atteignent d≈0,76, presque aussi efficaces qu'un tuteur humain ; ceux qui n'évaluent que la réponse finale obtiennent des résultats bien moindres (d≈0,40) — VanLehn (2011) [8].
- Les LLM actuels, sans ajustement pédagogique, ont tendance à **révéler la réponse avant l'heure** ou à générer des explications qui raisonnent bien étape par étape mais contiennent des erreurs mathématiques d'apparence cohérente — MathDial (2023), MathTutorBench (2025) [9][10].
- L'essai randomisé Tutor CoPilot (2024, 783 tuteurs, N élevé) a montré que des suggestions d'IA orientées vers des questions d'investigation (plutôt qu'un éloge générique) ont augmenté la maîtrise des sujets de mathématiques de 4 points de pourcentage, avec un gain plus important pour les tuteurs les moins bien notés [11].

## Executive summary (EN)

Hattie & Timperley's (2007) synthesis frames feedback as answering three questions (feed up / feed back / feed forward) across four levels (task, process, self-regulation, self) — with self-level praise the weakest lever [1]. Kluger & DeNisi's (1996) meta-analysis of 607 effect sizes is the single most important caution here: feedback helps on average (d = .41), but **over a third of feedback interventions reduced performance**, mainly when it directs attention to the self rather than the task [2]. Black & Wiliam (1998) established formative assessment as one of education's highest-leverage interventions (d = 0.4–0.7 across 250+ studies), disproportionately benefiting low performers [3]. Timing alone shows weak, inconsistent effects; a 2024/2025 meta-analysis of 51 studies found math produces larger effects than other subjects, and that content elaboration matters more than timing [4][5]. Shute's (2008) taxonomy — KR, KCR, elaborated feedback, answer-until-correct — shows elaboration generally wins, but excess can backfire [5]. Ability praise (Mueller & Dweck, 1998) undermines persistence and challenge-seeking after failure relative to effort/process praise [6]; inflated praise predicts lower self-esteem over time and, in already-high-self-esteem children, more narcissism (Brummelman et al., 2014/2017) [7]. Step-level ITS feedback approaches human-tutor effectiveness (d ≈ 0.76 vs. 0.40 for answer-only systems) [8]. Current LLM tutors, unless specifically trained (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), tend to give away answers prematurely or produce fluent but mathematically wrong reasoning [9][10][12]. The one live RCT of AI-assisted tutoring (Tutor CoPilot, 2024) found gains concentrated in reduced generic praise and increased probing questions [11].

## Résultats

### 1. Le modèle de rétroaction de Hattie & Timperley (2007)

La rétroaction efficace répond à trois questions : « Où est-ce que je vais ? » (feed up), « Comment est-ce que j'avance ? » (feed back), « Où est-ce que je vais ensuite ? » (feed forward) [1]. Elle opère à quatre niveaux : **tâche**, **processus** (stratégie/méthode), **autorégulation**, et **moi** (éloge personnel, « tu es tellement intelligent »). La rétroaction sur la tâche/le processus visant l'autorégulation est puissante ; l'éloge au niveau du moi est le plus faible des quatre et peut diluer les autres lorsqu'il est combiné dans un même message (par exemple, « Bravo, tu es brillant ! » ajouté à une simple notification d'exactitude) [1].

### 2. Kluger & DeNisi (1996) : la rétroaction peut nuire

Une méta-analyse de 607 tailles d'effet / 23 663 observations a trouvé un effet moyen positif (d = 0,41), mais **plus d'un tiers des interventions de rétroaction ont diminué la performance** [2]. La théorie de l'intervention de rétroaction (Feedback Intervention Theory) explique cette scission : la rétroaction qui redirige l'attention vers le **moi** (impliquant l'ego, comparative, éloge/blâme) détourne des ressources de la tâche et peut freiner la performance après un échec ; la rétroaction qui garde l'attention sur la **tâche** et la stratégie de comblement de l'écart tend à aider. C'est la base probante pour traiter « toujours donner de la rétroaction » comme faux.

### 3. Black & Wiliam et la base de preuves de l'évaluation formative

En passant en revue plus de 250 études, Black & Wiliam (1998) ont trouvé que l'évaluation formative augmente les résultats aux tests avec des tailles d'effet de 0,4 à 0,7 — supérieures à la plupart des interventions éducatives — avec les gains les plus importants pour les élèves les plus faibles [3]. Conditions : l'information doit être utilisée pour ajuster l'enseignement en temps quasi réel, la rétroaction doit indiquer comment combler l'écart (pas seulement à quelle distance on en est), et les élèves ont besoin d'appropriation (auto-évaluation/évaluation par les pairs). Cela plaide pour une boucle formative continue (tentative → explication → ajustement du problème suivant) plutôt qu'un rapport ponctuel en fin de session.

### 4. Le moment : rétroaction immédiate contre différée

Une méta-analyse récente (51 études, 1988–2024, 160 tailles d'effet) n'a trouvé **aucune différence moyenne significative entre la rétroaction immédiate et différée**, mais les tâches de mathématiques montraient des effets plus importants que d'autres matières, et la rétroaction immédiate augmentait la confiance de l'apprenant dans la pratique mathématique assistée par ordinateur, même sans changer les gains d'exactitude [4]. L'élaboration (ce que dit la rétroaction) comptait plus que le moment (quand elle arrive) [4][5]. En somme : le moment est secondaire, le contenu est primordial — mais l'immédiateté aide quand même la confiance et empêche qu'une mauvaise procédure ne soit répétée davantage.

### 5. Taxonomie du contenu de la rétroaction (Shute, 2008)

Shute distingue la **Connaissance du Résultat (KR)** (correct/incorrect seulement), la **Connaissance de la Réponse Correcte (KCR)** (indique la réponse), la **Rétroaction Élaborée (EF)** (explique le pourquoi, avec indices/exemples/stratégies), et **Essayer-Jusqu'à-Correct**. L'EF surpasse généralement KR/KCR, mais **une élaboration excessive peut être préjudiciable**, surchargeant la mémoire de travail [5]. Cela plaide pour une rétroaction élaborée mais courte, pas pour un ré-enseignement exhaustif de ce que l'élève a déjà bien fait.

### 6. Éloge de l'effort contre l'aptitude, et éloge exagéré

Mueller & Dweck (1998, six études) : les enfants loués pour leur intelligence ont montré, après un échec ultérieur, moins de persistance, moins de plaisir, davantage d'auto-attributions de faible aptitude, et une performance moindre que les enfants loués pour leur effort/stratégie ; 92 % des enfants loués pour leur effort ont choisi des puzzles de suivi plus difficiles contre 33 % des enfants loués pour leur intelligence [6]. Brummelman et al. (2014, 2017) ont trouvé que l'éloge **exagéré** prédit une estime de soi plus faible avec le temps, et un narcissisme plus élevé chez les enfants ayant déjà une estime de soi élevée ; l'éloge non exagéré et exact ne produisait aucun des deux effets [7]. En somme : louer le processus/la stratégie, rester proportionné, ne jamais louer les traits fixes.

### 7. Méta-analyses de rétroaction ITS/EAO

VanLehn (2011) : les systèmes tuteurs intelligents atteignent d ≈ 0,58 par rapport à l'absence de tutorat, se rapprochant du tutorat humain. Le **tutorat au niveau de l'étape** (rétroaction à chaque étape de résolution) a atteint d ≈ 0,76 — presque aussi bon qu'un tuteur humain — tandis que les **systèmes fondés sur la réponse** (rétroaction uniquement sur la réponse finale) n'ont atteint que d ≈ 0,40 [8]. Signal fort : commenter les étapes/le travail, pas seulement la réponse finale, partout où le format capture le travail intermédiaire.

### 8. Rétroaction de tutorat mathématique générée par LLM (2023–2026)

MathDial (EMNLP 2023) a construit 3 000 dialogues de tutorat parce que les LLM bruts « échouent à tutorer » — ils génèrent une rétroaction incorrecte ou révèlent les solutions trop tôt (« telling@k ») [9]. SocraticLM et PEARL entraînent des modèles à retenir les réponses et à échafauder avec des questions à la place [10][12]. MathTutorBench (EMNLP 2025) : la capacité à résoudre ne se transfère **pas** à un bon tutorat, la pédagogie et la compétence s'échangent, et la qualité se dégrade sur des dialogues plus longs [10]. Les LLM produisent aussi des chaînes de raisonnement fluides mais erronées, distinctes de la révélation de réponse [13]. Le seul essai contrôlé randomisé sur le terrain, Tutor CoPilot (2024, 783 tuteurs, environ 350 k messages), a trouvé que les suggestions d'IA augmentaient les questions d'investigation et **diminuaient l'éloge générique**, un gain de maîtrise de 4 points de pourcentage (p < 0,01), concentré chez les tuteurs les moins bien notés [11]. Les évaluations de Khanmigo rapportent qu'il surpasse GPT-4o brut pour détecter les erreurs, et que des signaux de performance structurés ont amélioré l'exactitude du prochain item d'environ 6 % — mais l'usage régulier reste faible (environ 15 %) [14].

### 9. Formulation adaptée à l'âge

Les recommandations pour la petite enfance (NAEYC, Wisconsin DCF) préconisent une **rétroaction descriptive et spécifique** plutôt qu'un éloge générique (« tu as recompté les haricots et tu as trouvé le même nombre » plutôt que « bon travail »), puisque la spécificité permet à un enfant de relier la rétroaction à une action reproductible [15]. Le gradient d'âge va du langage concret/sensoriel pour les jeunes enfants vers un langage métacognitif abstrait (stratégie, pourquoi, transfert) pour les élèves plus âgés.

## Implications pour la conception de Math Challenge

1. **Structurer chaque message du tuteur en feed-up / feed-back / feed-forward** : (a) rappeler l'objectif, (b) dire ce qui s'est passé par rapport à lui, (c) donner une prochaine étape concrète. Ne jamais s'arrêter à (b) — cela laisse inutilisée la partie la plus précieuse du modèle de Hattie & Timperley [1].

2. **Ne jamais combiner la rétroaction sur la tâche avec un éloge de niveau moi/trait dans la même phrase.** Bannir « Correct ! Tu es tellement doué en maths » — séparer l'exactitude de l'encouragement, et garder l'encouragement centré sur l'effort/la stratégie, jamais sur l'aptitude. Découle de la découverte de Kluger & DeNisi selon laquelle la capture d'attention au niveau du moi est le mécanisme probable derrière l'effet contre-productif de la rétroaction [2][6].

3. **Commenter le travail/les étapes de l'élève, pas seulement la réponse finale**, partout où le format capture les étapes intermédiaires. Le choix architectural le plus déterminant selon la méta-analyse ITS de VanLehn (d≈0,76 au niveau des étapes contre d≈0,40 pour la réponse seule) [8].

4. **Garder la rétroaction élaborée courte — 3 à 6 phrases, un exemple travaillé au maximum.** L'effet contre-productif de l'élaboration excessive de Shute signifie que l'invite a besoin d'un plafond de longueur explicite, pas « explique tout ce que tu peux » [5].

5. **Ne pas laisser le tuteur révéler la réponse ou la méthode du prochain problème prématurément en cours de tentative** (par exemple, dans un flux d'indices avant la soumission) — le mode d'échec MathDial/« telling@k ». Contraindre le tuteur à des indices socratiques/échafaudés par étape pendant une tentative active, et réserver les explications travaillées complètes à la révision après soumission [9][10][12].

6. **Se prémunir contre un raisonnement étape par étape confiant mais erroné.** Valider toute explication étape par étape générée par rapport à une solution correcte calculée de façon déterministe avant de l'afficher — le LLM devrait narrer une dérivation connue et correcte, pas re-dériver librement les mathématiques, étant donné les chaînes de raisonnement fluides mais erronées documentées [13].

7. **Rétroaction immédiate pour les signaux d'exactitude/d'achèvement (correct/incorrect, points gagnés) ; un court délai (moins d'une seconde à quelques secondes) convient pour l'explication plus approfondie du « pourquoi »**, mais pas en fin de session — la rétroaction immédiate aide la confiance et empêche qu'une mauvaise procédure ne soit répétée davantage [4].

8. **Réserver la rétroaction au niveau des tendances pour un résumé de fin de session**, distinct de la rétroaction par problème : par exemple, « le plus rapide sur les tables de multiplication, le plus lent sur les problèmes à plusieurs étapes ; la prochaine session ajoute plus de problèmes à étapes guidées ». Cela correspond à la boucle formative de Black & Wiliam — utiliser des preuves agrégées pour ajuster la **prochaine** unité d'enseignement, pas seulement la prochaine phrase [3].

9. **Modèles de RÉTROACTION échelonnés par âge pour l'invite du tuteur :**

   - **Environ 4-6 ans :** 1 à 2 phrases courtes, concrètes/sensorielles, sans discours abstrait sur la stratégie. Modèle : *[observation concrète] → [étape correcte simple] → [éloge de l'effort lié à l'action spécifique]*. Exemple : « Tu as compté les pommes une par une — il y en a 7, tu as dit 6 ; comptons ensemble : 1, 2, 3… Tu deviens vraiment doué pour compter avec soin. »
   - **Environ 7-10 ans :** 3 à 4 phrases nommant l'étape précise où les choses ont divergé, une stratégie nommée, éloge de l'effort/de la stratégie. Modèle : *[ce que tu as bien fait] + [l'étape exacte qui a dévié] + [pourquoi l'étape correcte fonctionne] + [encouragement fondé sur la stratégie]*.
   - **Environ 11-14 ans :** 4 à 5 phrases introduisant le *pourquoi* derrière la règle, invitant à comparer avec la bonne approche, utilisant le vocabulaire de la matière. Modèle : *[feed up : ce que le problème testait] + [feed back : où le raisonnement correspondait/divergeait] + [règle correcte avec une mini-étape travaillée] + [feed forward : un type de problème connexe à surveiller]*.
   - **15 ans et plus / adulte :** Concis, technique, de pair à pair ; sauter le vernis d'encouragement, se concentrer sur la précision (« correct mais pas minimal ; voici un chemin plus rapide »), offrir de la profondeur sur demande.

   Toutes les tranches : jamais de cadrage de trait fixe (« tu n'es pas un matheux »), toujours nommer l'action *spécifique*, jamais un jugement global.

10. **Rétroaction à éviter, parce que les preuves montrent qu'elle est contre-productive :** l'éloge générique de trait/aptitude [6] ; l'éloge exagéré/superlatif pour une exactitude routinière [7] ; la rétroaction d'exactitude seule sans piste à suivre en cas d'erreur [5] ; révéler la solution complète avant la fin de la tentative [9][10] ; un long ré-enseignement d'un contenu déjà maîtrisé [5] ; la rétroaction comparative/normative (« en retard par rapport aux autres enfants de ton âge ») — exactement le mécanisme de bascule vers l'ego derrière les baisses de performance induites par la rétroaction [2].

11. **Lier la rétroaction de gamification aux signaux d'effort/de processus** (persistance, utilisation de stratégies, amélioration par rapport à sa propre base de référence), pas seulement à la vitesse ou aux séries, afin que la notation ne réintroduise pas une rétroaction cadrée sur l'aptitude via des classements ou des badges de talent fixe.

12. **Exiger que l'invite du tuteur s'autovérifie par rapport à une courte grille avant d'émettre un message** : sépare la tâche de l'éloge ; nomme une prochaine étape concrète ; respecte le plafond de longueur de la tranche d'âge ; évite de révéler les réponses de la prochaine tentative ; toute étape travaillée est validée par rapport à une vérité terrain calculée. Cela transforme les règles ci-dessus en un filtre, pas un espoir.

## Questions ouvertes pour le propriétaire du projet

1. La rétroaction immédiate par problème et l'explication complète du tuteur IA devraient-elles toujours s'afficher ensemble, ou les 4-6 ans devraient-ils recevoir une réaction en ligne simplifiée immédiatement et l'explication complète seulement dans une révision parent/session ?
2. Capturons-nous actuellement le travail/les étapes intermédiaires sur les problèmes à plusieurs étapes, pas seulement la réponse finale ? Sinon, cela vaut-il la peine d'être priorisé compte tenu de l'écart ITS étape-par-étape contre réponse seule (d≈0,76 contre 0,40) ?
3. Les résumés de fin de session devraient-ils aller à l'enfant, au parent, ou aux deux, avec des formulations différentes (encouragement destiné à l'enfant contre détail diagnostique destiné au parent) ?
4. Comment le tuteur devrait-il valider sa narration de solution travaillée par rapport à la vérité terrain — un solveur déterministe séparé, ou un second passage de vérification par LLM ?
5. Voulons-nous un repli « enseignant novice » (simple révélation de la réponse correcte) lorsqu'une explication socratique/élaborée complète serait trop lente ou coûteuse, et à quel seuil de latence/coût ?

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
