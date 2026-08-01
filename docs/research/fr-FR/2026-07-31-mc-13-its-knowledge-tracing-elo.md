# Systèmes tutoriels intelligents et modélisation de l'apprenant : BKT, DKT, PFA et l'approche Elo de Math Garden

> Recherche Math Challenge — 2026-07-31 — sujet 13

## Résumé exécutif (FR)

- Le BKT (Corbett & Anderson 1995) modélise la maîtrise d'une compétence avec quatre paramètres — `P(L0)` maîtrise initiale, `P(T)` probabilité d'apprentissage, `P(G)` probabilité de deviner, `P(S)` probabilité de « glissement » (erreur d'inattention malgré la maîtrise) — avec un jeu de valeurs d'exemple largement cité `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (moteur de MATHia) combine le « model tracing » (règles de production pas à pas) et le knowledge tracing (maîtrise agrégée par compétence) ; ce sont des mécanismes distincts, souvent confondus [2].
- Les preuves d'efficacité sont mitigées : le What Works Clearinghouse (2016) qualifie Cognitive Tutor Algebra I d'« effets mitigés » en algèbre (+4 points, plage -7 à +19) et de « sans effet discernable » sur la réussite générale ; Geometry a obtenu un effet potentiellement négatif (-8) [3].
- L'essai de RAND (Pane et al. 2014) n'a trouvé aucun effet en année 1, mais bien ~0,21 écart-type en année 2 — l'efficacité dépendait de la fidélité de mise en œuvre [4].
- Le DKT (Piech et al. 2015) a rapporté une AUC de 0,86 contre 0,68 pour le BKT sur ASSISTments, mais Khajah et al. (2016) ont montré que la comparaison était inéquitable : un BKT correctement répliqué atteint 0,73, et des variantes étendues rejoignent presque le DKT [5][6].
- PFA et AFM sont des alternatives au BKT fondées sur la régression logistique : elles comptent les réussites/échecs antérieurs par composante de connaissance, sans état bayésien caché [7][8].
- Le système le plus pertinent ici est Math Garden (Rekentuin, université d'Amsterdam / Oefenweb) : une variante d'Elo qui réestime la compétence et l'item après chaque réponse, sans calibration par lots [9].
- Sa règle « high-speed high-stakes » (HSHS, Maris & van der Maas 2010/2012) combine précision et temps : `score = a_i · (d_i − RT) · (2·acc − 1)`, avec `d_i` limite de temps, `a_i` facteur d'échelle, `acc ∈ {0,1}` [10].
- Sous cette règle, le modèle de réussite est exactement le 2PL de la TRI, avec `d_i` comme paramètre de discrimination — un pont entre la TRI classique et la notation en temps réel [10].
- Math Garden échantillonne les items pour viser ~75 % de réussite, cohérent avec la littérature sur la « difficulté désirable » (bande optimale ~70-85 %) [9][11].
- Validité convergente du HSHS avec le CITO : r=0,78-0,84 ; aux échecs, le HSHS a mieux corrélé avec le classement FIDE que le simple décompte des bonnes réponses [10].
- Recommandation : mettre en œuvre d'abord Elo/HSHS (pas le BKT complet) — il ne nécessite qu'un facteur K/incertitude, se met à jour en O(1) par réponse (idéal pour les Durable Objects), et est déjà validé dans un domaine quasi identique (l'arithmétique enfantine).

## Executive summary (EN)

ITS research splits into two often-conflated lineages: **model tracing** (tracing a student's step-by-step solution against production rules — Cognitive Tutor's original mechanism) and **knowledge tracing** (tracking aggregate skill mastery across attempts — Bayesian Knowledge Tracing and successors) [2]. Efficacy evidence for the flagship model-tracing product, Carnegie Learning's Cognitive Tutor/MATHia, is genuinely mixed: the What Works Clearinghouse's 2016 review rates it "mixed effects" on algebra, "no discernible effects" on general math achievement, and "potentially negative" for the Geometry variant [3]. RAND's large randomized trial found no year-one effect and a modest 0.21 SD effect in year two, contingent on implementation fidelity [4] — adaptive tutoring is not automatically effective.

Bayesian Knowledge Tracing (BKT) is a four-parameter hidden Markov model (initial mastery, learning rate, guess, slip) with closed-form update equations [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) replaced this with an LSTM and reported large AUC gains, but a rigorous replication (Khajah, Lindsey & Mozer 2016) found the original comparison undersold BKT, and that extended BKT closes most of the gap [5][6]. Performance Factors Analysis and the Additive Factors Model offer a simpler logistic-regression alternative that fits incrementally [7][8].

The most directly applicable prior art is **Math Garden (Rekentuin)**, built at the University of Amsterdam, commercialized as Oefenweb/Prowise Learn: a computer-adaptive arithmetic practice system for children that updates learner ability and item difficulty after every response using an Elo variant combined with the **high-speed high-stakes (HSHS) scoring rule** (Maris & van der Maas, 2010/2012), scoring each attempt on both correctness and response time [9][10]. This is the basis of the concrete recommendation below.

## Résultats

### 1. Traçage de modèle et traçage des connaissances

L'architecture originale de Cognitive Tutor repose sur le **traçage de modèle** : les actions de l'élève sont comparées, étape par étape, à un modèle expert construit à partir de règles de production (analyse de tâche cognitive ACT-R), ce qui permet des indices contextuels et « juste à temps » [2]. Par-dessus, le **traçage des connaissances** suit la maîtrise progressive de chaque compétence (composante de connaissance) au fil des activités de résolution de problèmes, en mettant à jour la probabilité qu'une règle soit « connue » à chaque fois qu'elle est exercée, indépendamment du problème précis dont provient l'étape [1][2]. Pour un jeu d'arithmétique/logique autonome comme Math Challenge — des items discrets et bien spécifiés plutôt que des démonstrations ouvertes à plusieurs étapes — le traçage des connaissances (ou sa cousine fondée sur Elo) est le mécanisme pertinent ; le traçage de modèle complet convient à la vérification pas à pas des dérivations d'algèbre/géométrie et ne sera vraisemblablement pas nécessaire ici.

### 2. Traçage de connaissance bayésien : les quatre paramètres et les équations de mise à jour

Le BKT (Corbett & Anderson, 1994/1995) comporte quatre paramètres par compétence : `P(L0)` (probabilité initiale que la compétence soit connue), `P(T)` (probabilité de passer d'inconnue à connue à chaque occasion), `P(G)` (probabilité de deviner correctement alors qu'elle est inconnue), `P(S)` (probabilité d'un glissement — une réponse incorrecte malgré la maîtrise de la compétence) [1]. Selon la re-dérivation de van de Sande (2013), les deux équations directrices sont :

- Mise à jour de l'apprentissage : `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Correction prédite : `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

et la mise à jour a posteriori en ligne (par observation) utilisée par l'« algorithme de traçage des connaissances » en temps réel applique la règle de Bayes au résultat observé, puis avance d'un pas d'apprentissage :

- Si correct : `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- Si incorrect : `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Puis : `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Un jeu de paramètres d'exemple largement utilisé (correspondant au modèle illustratif de Baker et al. 2008, reproduit dans la Fig. 3 de van de Sande) est `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande démontre également que le BKT n'est bien comporté (monotone et non dégénéré) que lorsque `P(G)+P(S) < 1`, et que sa forme de Markov cachée n'est identifiable qu'à trois paramètres combinés près, sauf à être ajustée avec l'algorithme récursif par observation — une mise en garde publiée sur l'ajustement des paramètres, pas un simple détail d'implémentation [1].

### 3. Preuves d'efficacité — mitigées, pas uniformément positives

Le rapport de juin 2016 du WWC a passé en revue 22 études candidates, dont 7 répondaient à ses normes de conception de groupe, couvrant 12 840 élèves dans 118 sites [3]. Évaluations : Cognitive Tutor Algebra I → **effets mitigés** en algèbre (indice d'amélioration +4, plage −7 à +19, 5 études/12 182 élèves, preuves « moyennes à importantes ») et **aucun effet discernable** sur la réussite mathématique générale (+2, 1 étude, preuves « faibles ») ; Cognitive Tutor Geometry → **effets potentiellement négatifs** (−8, 1 étude, preuves « faibles ») [3]. L'essai à randomisation en grappes de RAND (Pane et al., 2014) n'a trouvé aucune différence la première année et un effet significatif de +0,21 écart-type la deuxième année (≈ du 50ᵉ au 58ᵉ centile), attribué en grande partie à la maturité de la mise en œuvre [4]. À retenir : la taille d'effet est modeste et dépend de la mise en œuvre — ce n'est pas une victoire garantie par le seul algorithme.

### 4. Deep Knowledge Tracing et la controverse sur l'équité de la comparaison

Piech et al. (2015) ont introduit le DKT, modélisant les séquences d'interaction avec un LSTM : AUC de 0,86 sur ASSISTments (contre 0,68 pour le BKT) et 0,85 sur Khan Academy (contre 0,68 pour le BKT, 0,63 pour la base marginale) [5], lu comme la preuve que l'apprentissage profond surpasse le BKT. Khajah, Lindsey & Mozer (2016) ont montré que la comparaison sous-estimait le BKT : une réimplémentation correcte a atteint 0,73 (contre 0,67 rapporté) sur les mêmes données, et l'extension du BKT avec l'oubli, la capacité par élève et la découverte de compétences comble l'essentiel de l'écart [6]. Leçon : ne pas supposer qu'un modèle plus sophistiqué bat un modèle simple bien réglé sans vérifier — les besoins en données/calcul du DKT (longues séquences, compétences opaques) correspondent aussi mal à un produit ayant besoin, dès le premier jour, d'une difficulté interprétable et adaptée au démarrage à froid.

### 5. Performance Factors Analysis et l'Additive Factors Model

L'AFM (Cen, Koedinger & Junker) modélise la correction par régression logistique sur trois termes additifs par composante de connaissance : une constante de capacité de l'élève, une constante de facilité de la composante, et une pente de taux d'apprentissage de la composante multipliée par les occasions antérieures [7]. Le PFA (Pavlik, Cen & Koedinger, 2009) étend cela en remplaçant le « nombre d'occasions » par **des comptages séparés des réussites et des échecs antérieurs** par composante [7][8]. Les deux s'ajustent en ligne par régression logistique incrémentale, sans passe EM/recherche par grille contrairement au BKT complet.

### 6. Difficulté adaptative fondée sur Elo/TRI, et Math Garden en particulier

L'idée centrale de la TRI : la probabilité de réussite est une fonction logistique de l'aptitude latente moins la difficulté de l'item (1PL), pondérée éventuellement par une discrimination (2PL) et un plancher de « devinette » (3PL) ; les tests adaptatifs choisissent, après chaque réponse, l'item non répondu qui maximise l'information à l'estimation courante de l'aptitude [12]. La régression de demi-vie de Duolingo (Half-Life Regression, Settles & Meeder 2016) est apparentée mais distincte : elle ajuste une courbe d'oubli exponentielle par item/élève à partir de caractéristiques linguistiques/historiques pour prédire le moment de l'oubli, optimisant le rythme de la répétition espacée plutôt qu'une sélection fondée sur la difficulté [13].

**Math Garden (Rekentuin)**, issu du département de méthodes psychologiques de l'université d'Amsterdam (2007), aujourd'hui commercialisé par Oefenweb/Prowise Learn, est l'analogue le plus proche de l'objectif de Math Challenge de noter conjointement vitesse et exactitude [9]. Il applique une variante d'Elo (1978) où l'aptitude de l'élève et la difficulté de l'item sont réestimées après chaque item répondu — sans lot de calibration hors ligne, ce qui permet une calibration à la volée d'un contenu tout juste créé [9]. Dans la validation de 2011, les items étaient échantillonnés pour viser une probabilité de réussite moyenne de **,75** [9], en plein dans la bande de 70 à 80 % visée par ce projet, et validés empiriquement par rapport à la performance réelle d'enfants.

Le mécanisme de notation — lu directement dans l'article « High Speed High Stakes Scoring Rule » de Klinkenberg — remonte à van der Maas & Wagenmakers (2005), qui attribuaient à chaque item une limite de temps `d` et notaient une réponse par le temps restant multiplié par l'exactitude binaire : `score = acc · (d − RT)` (0 si incorrect, plus rapide donne un score plus élevé si correct) [10]. Cela récompensait la devinette risquée sur les items paraissant trop difficiles (deviner ne coûtait rien), si bien que Maris & van der Maas (2010) ont rendu l'exactitude symétrique (`{-1,+1}` au lieu de `{0,1}`) :

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

où `d_i` est la limite de temps de l'item, `RT` le temps de réponse, `acc ∈ {0,1}` l'exactitude, `a_i` un facteur d'échelle de l'item — une réponse rapide et fausse devient fortement négative, supprimant l'incitation à deviner puis abandonner [10]. Maris & van der Maas (2012, Psychometrika) ont démontré que, sous cette règle, le modèle implicite de probabilité de réussite est **exactement le modèle 2PL de la TRI**, la limite de temps `d` jouant le rôle de discrimination de l'item — un pont net entre une règle de notation en temps réel et la TRI classique [10]. Validé empiriquement : les notes HSHS ont corrélé à r=,78–,84 avec les scores CITO néerlandais sur quatre opérations arithmétiques, et sur un jeu de données d'échecs (CORUS 2008), elles ont mieux corrélé avec le classement Elo FIDE (r=,808) que le simple décompte des bonnes réponses (r=,575) [10].

### 7. Mécanique Elo pratique pour la sélection adaptative d'items

La littérature plus large sur Elo dans l'apprentissage adaptatif (Pelánek, « Applications of the Elo Rating System in Adaptive Educational Systems ») formule la même mise à jour à deux sens qu'aux échecs : après chaque tentative, la note de l'apprenant et la difficulté de l'item se rapprochent l'une de l'autre proportionnellement à la surprise (résultat réel moins résultat attendu, une fonction logistique de l'écart de notes), pondérée par une « fonction d'incertitude » jouant le rôle du facteur K des échecs — maximale pour les items/apprenants tout juste créés, décroissante à mesure que les observations s'accumulent [14]. C'est le mécanisme recommandé ci-dessous.

## Implications de conception pour Math Challenge

1. **Mettre en œuvre d'abord un modèle Elo/HSHS façon Math Garden, pas le BKT complet.** Le BKT exige un ajustement de paramètres par compétence (recherche par grille ou EM) avant de se comporter raisonnablement [1] ; Elo-avec-HSHS met à jour la note de l'apprenant et celle de l'item par tentative sous forme fermée, sans calibration hors ligne — idéal pour un grand banc d'items en croissance, actif dès le premier jour.

2. **Formule de notation concrète :** pour un item chronométré avec une limite `d_i` (secondes), un temps de réponse `RT`, une exactitude `acc ∈ {0,1}` : `score = a_i · (d_i − RT) · (2·acc − 1)`, en plafonnant `RT` à `d_i` s'il peut dépasser la limite [10]. Commencer avec `a_i = 1` pour tous les items ; n'introduire une discrimination par item qu'une fois assez de données disponibles pour l'estimer (Maris & van der Maas montrent que `a_i`/`d_i` sont enchevêtrés avec la discrimination 2PL) [10].

3. **Règle de mise à jour :** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (logistique Elo standard), `actual = score / (a_i·d_i)` remis à l'échelle sur `[0,1]`, puis `ability += K_learner · (actual − expected)` et `difficulty −= K_item · (actual − expected)` [9][14].

4. **Barème du facteur K :** faire décroître la fonction d'incertitude plutôt que d'utiliser un K constant — élevé (par ex. ≈0,5–1,0) pour les ~10–20 premières tentatives d'un apprenant ou d'un item, puis réduit vers un régime stable plus petit (≈0,05–0,1) par la suite, à l'image du traitement démarrage-à-froid/régime-stable des systèmes éducatifs fondés sur Elo [14]. Suivre un compteur de tentatives par couple apprenant-compétence et par item pour piloter cette décroissance.

5. **L'estimation de la difficulté d'un item est en ligne par construction :** chaque tentative sur l'item `i` ajuste légèrement sa note de difficulté, si bien qu'un item tout juste créé obtient une difficulté provisoire après une poignée de réponses, sans prétest nécessaire — le plus grand avantage pratique d'Elo sur BKT/DKT/PFA, qui supposent une taxonomie fixe et/ou une étape d'ajustement par lots [1][7][9].

6. **Taux de réussite cible pour la sélection des items : 70 à 80 %, centré près de 75 %**, correspondant à la cible validée de ,75 de Math Garden [9] et à la littérature plus large sur la difficulté désirable [11]. Lors du choix du prochain item pour une aptitude `θ`, sélectionner parmi les items dont la difficulté `β_i` place `expected(θ, β_i)` dans `[0.70, 0.80]` ; échantillonner parmi les 3 à 5 items éligibles de difficulté la plus proche plutôt que toujours la correspondance la plus proche, pour éviter des sauts visiblement répétitifs.

7. **Schéma D1 minimal par tentative :** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Conserver les notes avant/après (pas seulement l'état courant) rend l'historique auditable et rejouable, et permet une comparaison hors ligne avec une future expérience BKT/PFA sans réinstrumenter.

8. **Séparer la difficulté de l'item des métadonnées de difficulté du contenu.** Stocker une étiquette de niveau/grade attribuée par l'auteur indépendamment de la note Elo en direct ; ne l'utiliser que comme a priori de démarrage à froid (initialisée près de la note moyenne des items portant la même étiquette), en laissant la note en direct prendre le relais après ~10 réponses — cela évite qu'un item mal étiqueté ne soit jamais dirigé vers les apprenants qui révéleraient sa véritable difficulté.

9. **Un Durable Object pour le chemin critique, D1 comme registre.** La mise à jour Elo en O(1) par événement se prête à un Durable Object détenant la note en direct d'un apprenant (et une partition des notes d'items les plus sollicités), qui journalise chaque tentative comme une ligne D1 en ajout seul ; cela évite les conditions de concurrence lecture-modification-écriture sur des lignes d'items partagées, auxquelles se heurte une conception naïve tout-D1 en concurrence réelle.

10. **Reporter BKT/PFA/DKT à une couche v2 de « maîtrise de compétence »**, et non à la sélection d'items v1. Une fois suffisamment d'historique D1 accumulé, un lot nocturne BKT/PFA par compétence fine peut alimenter des tableaux de bord de maîtrise et des signaux destinés aux parents — une surface différente de la sélection en temps réel, et les mélanger trop tôt risque de reproduire le piège d'équité DKT/BKT [5][6].

11. **Ne pas s'attendre à ce que l'algorithme seul garantisse des gains d'apprentissage.** Les résultats mitigés/nuls/négatifs du WWC pour un produit mature [3] et le résultat nul de RAND pour la première année [4] montrent que la difficulté adaptative est nécessaire mais pas suffisante. Comparer en A/B le modèle d'apprenant à une simple échelle fixe avant d'attribuer spécifiquement des gains d'engagement à Elo.

12. **Se prémunir contre les exploits de devinette risquée.** La transformation `(2·acc−1)` existe pour rendre coûteuses les réponses rapides et fausses [10] — vérifier en QA que le fait de cliquer des réponses aléatoires rapidement ne surclasse pas un engagement authentique, en particulier pour les jeunes utilisateurs qui pourraient ne pas percevoir la structure d'incitation comme le ferait un adulte passant un test.

## Questions ouvertes pour le porteur du projet

1. La limite de temps `d_i` par item doit-elle être fixée selon la bande d'âge/de niveau, ou être elle-même un paramètre estimé en direct (selon le résultat d'équivalence 2PL) ?
2. Pour les très jeunes utilisateurs (4 à 6 ans) qui ne maîtrisent pas forcément une interface de minuteur, le HSHS doit-il s'appliquer du tout, ou le contenu de la petite enfance doit-il utiliser une règle fondée uniquement sur l'exactitude jusqu'à ce que l'enfant grandisse vers un jeu chronométré ?
3. Une seule échelle Elo globale par apprenant, ou des échelles par domaine (arithmétique vs logique vs géométrie) non directement comparables entre elles ?
4. Une couche de maîtrise BKT/PFA en lot nocturne (§10) fait-elle partie du même jalon que le sélecteur Elo en direct, ou d'une phase ultérieure ?
5. Quelle tolérance d'erreur au démarrage à froid est acceptable pour des items tout juste créés — combien de réponses faut-il avant qu'une note de difficulté soit assez « fiable » pour être diffusée largement ?

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
