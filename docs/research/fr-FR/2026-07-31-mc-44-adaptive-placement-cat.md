# Tests de placement adaptatifs et tests adaptatifs informatisés (CAT) : TRI, calibration à froid et espaces de connaissances

> Recherche Math Challenge — 2026-07-31 — sujet 44

## Résumé exécutif (FR)

- La TRI comporte trois modèles emboîtés : 1PL/Rasch (seulement la difficulté
  `b`), 2PL (+ discrimination `a`), 3PL (+ devinette `c`) [1][2]. Seul le 1PL
  est calibrable avec peu de données : le score brut est une statistique
  suffisante pour l'habileté, donc la difficulté peut être estimée sans
  connaître d'abord l'habileté de qui que ce soit [2]. Les 2PL/3PL exigent
  « des centaines » de réponses par item, selon la propre équipe de
  psychométrie de Duolingo [4].
- Le CAT sélectionne l'item d'information de Fisher maximale pour l'habileté
  estimée, met à jour par MLE ou par EAP/MAP bayésien, et s'arrête sur un
  seuil d'erreur type ou une longueur fixe [3].
- Contrôle d'exposition : Sympson-Hetter bloque probabilistiquement les
  items surutilisés ; « randomesque » choisit au hasard parmi les 5-10
  meilleurs [3][12][13]. Duolingo (2026) remplace le blocage par un
  échantillonnage de Thompson, intégrant la limite d'exposition directement
  dans la sélection [5].
- Le démarrage à froid est nommé et résolu en production : Duolingo
  distingue le cold-start (item sans réponse), le jump-start (peu de
  réponses pilotes) et le warm-start (recalibration du banc opérationnel),
  et calibre les nouveaux items à partir de caractéristiques de contenu
  (plongements BERT, fréquence lexicale) via l'AutoML, sans attendre des
  centaines de réponses [4].
- Elo est l'alternative pratique : il met à jour l'habileté et l'item en
  O(1) par réponse, sans phase de pilotage séparée ; c'est déjà le mécanisme
  recommandé dans la recherche précédente de ce projet (sujet 13, Math
  Garden) [9].
- ALEKS n'utilise pas une échelle unique : il applique la théorie des
  espaces de connaissances (Knowledge Space Theory), modélisant le domaine
  comme des sous-ensembles réalisables de concepts avec une structure de
  prérequis ; le résultat est une position dans un graphe, pas un nombre —
  le meilleur précédent pour l'arbre de compétences [7][8].
- Le Duolingo English Test (V8) administre 18 items de vocabulaire Oui/Non +
  9 items de vocabulaire en contexte par session (27 sur 14 types au total),
  puisés dans un banc de 3 290 + 585 items [4].
- La documentation publique de NWEA MAP Growth, i-Ready, Khan Academy et IXL
  sur leurs algorithmes internes est bien plus rare que celle de
  Duolingo/ALEKS — elle confirme seulement qu'ils sont adaptatifs, pas les
  formules [15][16][17].
- Un CAT de seulement 5 items, répété, a atteint une efficacité comparable à
  un plan pré-post complet dans une étude de 2024 — cela soutient l'idée de
  commencer court, par sujet, plutôt que par un long examen global [18].
- Recommandation centrale : difficulté experte de 1 à 100 par item,
  sélection « le plus proche de la difficulté actuelle », mise à jour Elo
  avec un `K` décroissant, arrêt à 10-15 items ou par stabilité, et
  trajectoire d'amélioration vers une TRI/Rasch calibrée avec ≥ 200-400
  réponses par item.

## Executive summary (EN)

IRT has three nested logistic models: 1PL/Rasch (difficulty `b` only, discrimination fixed), 2PL (`b` + discrimination `a`), and 3PL (adds guessing floor `c`) [1][2]. Only Rasch is realistic to calibrate with little data: its raw score is a sufficient statistic for ability, so item difficulty can be estimated by conditional maximum likelihood without first knowing anyone's ability [2]. 2PL/3PL need far more data — Duolingo's own calibration paper states traditional IRT "requires many test taker responses (e.g., hundreds) for each item," and piloting outside a live high-stakes test creates security risk [4].

CAT mechanics: select the unused item that maximizes Fisher information at the current ability estimate (informally, the item closest in difficulty to where the learner is now), update ability via MLE (unbiased, undefined for all-right/all-wrong patterns) or Bayesian EAP/MAP (handles that edge case via a prior), and stop on a standard-error threshold, a fixed item count, or a classification-confidence threshold [3]. Exposure control keeps the single best item from being shown to everyone: Sympson-Hetter probabilistically blocks over-exposed items; "randomesque" picks randomly among the top 5-10 [3]. Comparative studies find trade-offs, not one dominant method [12][13][14]. A 2026 Duolingo paper (S2A3) replaces blocking with Thompson Sampling, folding exposure limits directly into a bandit-style selection policy [5].

Math Challenge's exact situation — an item bank with no calibrated difficulty — is a named production problem, not a hypothetical. Duolingo's AutoIRT paper (2024) names three regimes: **cold-start** (new item, zero responses, calibrated from content features alone), **jump-start** (a small pilot sample blended with the operational bank), and **warm-start** (periodic recalibration as population/UI shift) [4]. Their fix trains an AutoML grade classifier on item content (BERT embeddings, word frequency, CEFR wordlists) and projects it onto interpretable IRT parameters via Monte Carlo EM — proof that provisional, feature/expert-derived difficulty is an accepted professional starting point with a defined upgrade path, not an amateur shortcut [4]. The lower-effort alternative is **Elo-based online calibration**: it updates both learner and item ratings after every response, with no offline fitting step [4][9]; a 2019 EDM paper extends it to multi-concept items [10]. This project's own prior research (topic 13) already recommends Elo/Math Garden's "high-speed high-stakes" rule as the concrete precedent — O(1) updates, validated in children's arithmetic practice [9].

ALEKS is structurally different: built on **Knowledge Space Theory** (Doignon & Falmagne), it models a domain as a finite concept set `Q`, where a learner's actual state is one *feasible subset* constrained by prerequisite relationships, not every subset of "known topics" [7][8]. The **outer fringe** of a state is what the learner is ready to learn next; the assessment narrows down *which* feasible state the learner is in, then recommends the outer fringe — a position in a prerequisite graph, not a scalar score [7]. This is the closest published match to "place a learner in a prerequisite graph rather than on one scale."

Public detail is uneven across vendors: Duolingo publishes peer-reviewed numbers (item counts, model equations, cold-start terminology) [4][5][6]; ALEKS's foundation is academically well documented [7][8]; but NWEA's RIT scale, Khan Academy's course-challenge mechanics, i-Ready's diagnostic, and IXL's Real-Time Diagnostic are described only at a marketing level in public pages — each confirms adaptivity, none publishes item-selection internals [15][16][17]. The usable blueprints for this project are the Duolingo and ALEKS/academic literatures, not the K-12 diagnostic vendors.

## Constats

### 1. Les bases de la TRI — trois modèles emboîtés, un seul réaliste pour un démarrage à froid

`p(θ) = c + (1-c)·σ(a(θ-d))` donne la probabilité de réussite à partir de
l'habileté θ et des paramètres d'item : difficulté `d`, discrimination `a`,
devinette `c` [1][4]. Fixer `c=0, a=1` donne le **1PL/Rasch** — la
difficulté est le seul paramètre d'item libre, et sa propriété de
statistique suffisante permet d'estimer la difficulté d'un item par maximum
de vraisemblance conditionnel sans connaître d'abord l'habileté [2]. Le
**2PL** libère `a` : une discrimination plus élevée signifie qu'un item
sépare plus nettement les candidats juste en dessous de la difficulté de
ceux juste au-dessus [1]. Le **3PL** ajoute la devinette `c`, adaptée aux
items à choix multiples (plancher d'environ 0,25 sur quatre options) [1].
Les deux exigent nettement plus de données par item que le Rasch — la
littérature parle par défaut de « centaines » de réponses [1][4].

### 2. Mécanique du CAT — sélection, estimation, arrêt, exposition

La boucle : estimer θ à partir des réponses obtenues jusque-là ; choisir
l'item non utilisé qui maximise l'information de Fisher à ce θ ;
l'administrer ; mettre à jour ; répéter [3]. Le MLE est asymptotiquement non
biaisé mais indéfini pour les profils de réponses parfaits/nuls ; l'EAP/MAP
bayésien résout ce cas via un a priori, au prix d'un léger biais [3]. Règles
d'arrêt : seuil d'erreur type (longueur variable), nombre fixe d'items, ou
seuil de confiance de classification pour les décisions réussite/échec [3].
**Sympson-Hetter** tire un nombre aléatoire par item candidat contre un
paramètre d'exposition propre à l'item, pour bloquer probabilistiquement
même le meilleur item [3][12]. **Randomesque** sélectionne uniformément
parmi les 5-10 items les plus informatifs [3]. Des études comparatives
(Ozturk & Dogan 2015 ; Leroux et al. 2013, 2016) testent ces méthodes face à
des méthodes plus récentes de type « erreur type progressive-restreinte »
sur des modèles 3PL/GPC, trouvant généralement des compromis
précision/exposition plutôt qu'un vainqueur net [12][13][14]. L'article
S2A3 de Duolingo (2026) remplace le blocage par un échantillonnage de
Thompson, traitant les limites d'exposition comme des contraintes
stochastiques à l'intérieur même de la sélection d'items [5].
L'**équilibrage de contenu** est la contrainte orthogonale selon laquelle la
sélection doit aussi atteindre un mélange de contenu cible, pas seulement
maximiser l'information [3].

### 3. Le problème du démarrage à froid, nommé et résolu par un système de production réel

L'article AutoIRT de Duolingo nomme exactement la situation de Math
Challenge : **cold-start** (nouvel item, aucune réponse, calibré uniquement
à partir de caractéristiques de contenu), **jump-start** (petit échantillon
pilote mélangé au banc opérationnel), **warm-start** (recalibration à
mesure que la population/l'interface/le matériel de préparation évoluent)
[4]. Leur solution : un ensemble AutoML (forêts aléatoires, LightGBM,
XGBoost, CatBoost) entraîné sur les caractéristiques de contenu des items,
projeté sur des paramètres de TRI interprétables via un EM de Monte-Carlo,
ce qui évite d'avoir besoin de centaines de réponses réelles avant qu'un
item soit utilisable [4]. Cela établit qu'une difficulté provisoire,
dérivée de caractéristiques/d'experts, est un point de départ professionnel
avec une véritable trajectoire d'amélioration, pas un raccourci.

L'alternative compatible avec une petite équipe est la **calibration Elo en
ligne** : AutoIRT et la littérature plus large notent qu'Elo est une
procédure en ligne de longue date pour le modèle de Rasch, mettant à jour
les cotes de la personne et de l'item après chaque réponse, sans étape
d'ajustement hors ligne [4][9]. Un article EDM de 2019 (Abdi, Khosravi,
Sadiq & Gasevic) étend l'Elo à un seul concept vers une forme multivariée
pour les items à étiquettes multiples, rapportant une meilleure précision
prédictive [10]. Le sujet 13 de la propre recherche de ce projet recommande
déjà la règle HSHS d'Elo/Math Garden comme précédent concret : mises à jour
en O(1) (bien adaptées aux Durable Objects), validées en arithmétique
enfantine [9]. Une troisième voie, à un stade ultérieur : BOBCAT (Ghosh &
Lan, 2021) formule la sélection d'items elle-même comme une optimisation
bi-niveau plutôt que comme une pure information de Fisher — une mise à
niveau plausible pour une v2/v3 une fois qu'assez de données journalisées
existent pour l'entraîner [11].

### 4. ALEKS et la théorie des espaces de connaissances — un graphe, pas une échelle

ALEKS est né à UC Irvine en 1994 (financé par la NSF), racheté par
McGraw-Hill en 2013 [8]. La théorie des espaces de connaissances (Doignon &
Falmagne) modélise un domaine comme un ensemble de concepts `Q` ; l'état
d'un apprenant est un *sous-ensemble réalisable*, contraint par des
prérequis, et non n'importe quel sous-ensemble de `Q` [7]. Cela définit un
ordre partiel sur les états réalisables. La **frange externe** est ce que
l'apprenant est prêt à apprendre ensuite (prérequis satisfaits) ; la
**frange interne** est ce qui vient juste d'être acquis [7]. L'évaluation
d'ALEKS restreint l'état réalisable occupé par l'apprenant, puis recommande
la frange externe — un parcours personnalisé à travers un graphe de
prérequis, pas un score en percentile [7][8]. C'est le design de référence
pour une interface d'arbre de compétences, la TRI/Elo se chargeant de
l'ordonnancement de la difficulté *au sein* d'un nœud.

### 5. Le Duolingo English Test — le CAT le plus concrètement documenté de l'ed-tech

Dans la version du DET étudiée (V8), chaque session comprend 18 items de
vocabulaire Oui/Non (5 secondes chacun, jugeant des mots réels contre des
mots faux générés algorithmiquement) et 9 items de vocabulaire en contexte
(20 secondes chacun, texte à trous) — 27 items pour deux des 14 types de
tâche au total, puisés respectivement dans des bancs de 3 290 et 585 items
[4]. θ se situe sur une échelle continue dont l'a priori suit une **loi
normale centrée réduite** (moyenne zéro, variance un), le score rapporté
étant la moyenne a posteriori calculée à partir de la distribution complète
pendant la calibration, et non une estimation ponctuelle [4]. Duolingo a
également publié spécifiquement sur l'IA responsable pour ce test,
présentant la qualité/l'équité comme une chaîne d'argumentation de validité
continue (définition du domaine → évaluation → généralisation →
explication → extrapolation → utilisation) — une structure de liste de
contrôle utile même en dehors des tests d'admission à forts enjeux [6].

### 6. NWEA, i-Ready, Khan Academy, IXL — des détails publics plus minces

Le MAP Growth de NWEA repose sur une échelle propriétaire **RIT** (« Rasch
unIT »), indépendante du niveau scolaire et continue ; le centre de
recherche de NWEA publie des études de dérive des paramètres d'item et de
validation présupposant un fondement TRI/Rasch, mais l'algorithme exact de
sélection des items n'a pas été trouvé sur les pages publiques accessibles
lors de cette recherche [15]. Les propres documents de Khan Academy
décrivent l'apprentissage par maîtrise comme le modèle pédagogique, mais la
mécanique de placement de son « Course challenge » n'est pas détaillée sur
les pages librement accessibles [16]. La page produit d'IXL affirme
simplement que « la difficulté des questions s'adapte automatiquement »,
confirmant un comportement de type CAT, sans publier l'échelle, le nombre
d'items ou la règle de sélection [17]. Le manuel technique d'i-Ready n'a
pas pu être récupéré au cours de cette session ; aucune affirmation précise
n'est faite à son sujet au-delà de son existence en tant que diagnostic
adaptatif. Cette lacune est elle-même un constat : les littératures de
Duolingo et d'ALEKS/académique sont les plans utilisables pour la v1 ; les
fournisseurs de diagnostics K-12 traitent leurs mécanismes internes comme
des secrets commerciaux.

### 7. Combien d'items, et par sujet ou global

Aucun minimum universel n'existe, mais deux points de référence bornent la
fourchette. Les CAT à enjeux élevés et longueur fixe comptent couramment des
dizaines d'items pour une cible d'erreur type serrée [3]. Une étude de 2024
enchaînant de courts CAT pour le Force Concept Inventory a trouvé que des
administrations adaptatives répétées de 5 items (9 fois sur un semestre)
atteignaient une efficacité « comparable à celle de la méthode pré-post »
pour suivre le changement — spécifique au contexte (mesure formative
répétée, pas un placement en une seule fois), mais une preuve que le
court-et-répété peut se substituer au long-et-unique [18]. Cela favorise un
**placement par sujet** (10-15 items par branche, conforme au cahier des
charges du projet) plutôt qu'un long test global unique : un enfant peut se
placer simultanément en « arithmétique de 3ᵉ année » et en « géométrie de
maternelle », ce qu'un score global unique ne peut pas représenter mais
qu'un CAT par sujet et le modèle d'espace de connaissances d'ALEKS peuvent
tous deux faire [7].

### 8. Ne pas ressembler à un examen pour un enfant de 6 ans

Aucune source examinée ici ne traite directement de l'expérience
utilisateur enfant, mais deux faits structurels se traduisent en
contraintes. Comme le CAT cible chaque item près de l'habileté réelle de
l'apprenant par construction, un placement adaptatif bien implémenté
produit naturellement une expérience de réussite mêlée plutôt qu'un mur
d'échec — le mécanisme lui-même protège le ressenti, à condition que
l'interface n'en rajoute pas par-dessus (pas de compte à rebours visible ni
de buzzers de mauvaise réponse) [3]. Comme un placement court, par sujet
(§7), est à la fois défendable et mieux adapté à la capacité d'attention
d'un enfant, il peut être livré comme une séquence de courts mini-jeux
thématiques plutôt que comme un examen continu — en s'appuyant sur le
précédent déjà validé auprès d'enfants de Math Garden issu du sujet 13,
plutôt qu'en redérivant le ton ici [9].

## Implications de conception

1. **Utiliser une difficulté provisoire de type Rasch (1PL) pour la v1, pas
   2PL/3PL.** Avec un historique de réponses nul, seul un paramètre de
   difficulté unique par item est réaliste ; la discrimination/devinette
   nécessitent des données que la v1 n'aura pas [1][2][4].
2. **Algorithme : difficulté étiquetée par un expert + sélection par
   difficulté la plus proche.** Étiqueter chaque item de 1 à 100 à la main.
   À chaque étape, sélectionner l'item non utilisé dont l'étiquette est la
   plus proche de l'estimation d'habileté actuelle — un substitut sans
   paramètre à la sélection par information de Fisher maximale [3][4].
3. **Mise à jour de l'habileté : Elo, pas MLE/EAP.**
   `ability += K * (outcome - expected)`, `expected` étant une fonction
   logistique de (habileté − difficulté de l'item), conforme à la forme de
   réponse Rasch ; O(1) par réponse, s'adapte à un Durable Object ou à une
   écriture D1 par tour, conformément au précédent du sujet 13 [1][9].
4. **K décroissant au sein d'une même session.** K élevé pour les 3-4
   premiers items (convergence rapide depuis l'estimation initiale fondée
   sur l'âge), K plus faible ensuite (stabilité) — l'analogue, au sein
   d'une session, de la période de cote provisoire des échecs Elo [9].
5. **Règle d'arrêt : plafond strict de 15 items, arrêt anticipé possible à
   partir de l'item 8 en cas de stabilité.** Arrêter tôt si les 4 dernières
   réponses ont alterné autour du même palier (±1) sans dérive nette — un
   indicateur de substitution pour « l'erreur type est assez faible » en
   l'absence d'un modèle calibré pour la calculer [3].
6. **Placement par sujet, pas un score global unique**, conformément au
   modèle à états multiples d'ALEKS et à l'arbre de compétences propre au
   projet [7][8].
7. **L'âge n'amorce que l'item 1 ; l'estimation d'habileté gouverne tout le
   reste.** L'âge saisi est un a priori, pas un plafond ni un plancher —
   2-3 réponses devraient pouvoir déplacer l'estimation d'un palier entier.
8. **Journaliser chaque réponse** (identifiant de l'item, difficulté
   étiquetée, résultat) dès le premier jour. Ce sont exactement les données
   de « jump-start » que l'équipe de Duolingo exige avant toute
   recalibration ; sans cela dès le lancement, l'implication 9 démarre en
   retard [4].
9. **Trajectoire d'amélioration : réajuster par lots les difficultés
   étiquetées en un véritable modèle de Rasch vers 200-400 réponses/item**,
   en mélangeant l'a priori expert avec l'estimation empirique plutôt qu'en
   l'écartant, car le volume par item sera inégal [4].
10. **2PL uniquement une fois le Rasch stable et le volume élevé**
    (« centaines » de réponses selon la littérature) ; sauter entièrement
    les paramètres de devinette 3PL sauf si le format est un choix
    multiple à options fixes, car la devinette n'est sinon pas
    identifiable [1][4].
11. **Contrôle d'exposition seulement une fois que le trafic dépasse le
    volume du banc d'items.** En v1, il suffit d'éviter de répéter un item
    au sein d'une même session ; n'ajouter un blocage de type
    Sympson-Hetter ou un top-N randomesque que lorsque la télémétrie montre
    qu'une poignée d'items domine la sélection [3][12].
12. **UX par tranche d'âge :** environ 4-6 ans — un seul mini-jeu guidé par
    un personnage, aucun score/minuteur/vocabulaire d'« examen » visible,
    un retour festif quelle que soit la justesse, se terminant par une
    transition narrative, pas un écran de résultats. Environ 7-11 ans —
    une « quête d'échauffement » avec une barre de progression comptant les
    items (jamais une barre de justesse), une narration légère, toujours
    sans score numérique affiché. Environ 12-17 ans et adulte/expert — un
    cadrage transparent (« pour pouvoir te placer au bon niveau ») convient
    et est souvent préféré, mais il faut quand même éviter le vocabulaire
    d'« évaluation de ton habileté » ; un test adaptatif bien ciblé est
    réellement plus proche d'une pratique guidée que d'un examen une fois
    qu'il converge correctement, ce qui soutient ce cadrage à tout âge [3].
13. **L'âge est un thème et une amorce, jamais une limite de placement
    stricte** — tout l'intérêt d'un test adaptatif selon le cahier des
    charges est que c'est l'habileté, pas l'âge, qui fixe le niveau.

## Questions ouvertes pour le porteur du projet

1. Placement obligatoire avant toute pratique, ou optionnel avec un repli
   par défaut fondé sur l'âge et une action de « recalibrage » plus tard ?
2. Quel calendrier de K pour la mise à jour Elo à K décroissant — fixe
   (par exemple 1,0 / 0,5 / 0,25) ou ajusté empiriquement après le
   lancement à partir des données journalisées ?
3. Étiquetage de la difficulté des items par un seul auteur, ou un
   processus léger à plusieurs évaluateurs (2-3 personnes, réconciliation
   des désaccords) avant qu'aucun item ne soit livré ?
4. Chaque sujet doit-il partager un plafond de 15 items, ou les branches
   larges (par exemple, toute l'arithmétique) devraient-elles avoir un
   plafond plus élevé que les branches étroites (par exemple, la division
   longue) ?
5. Quand le placement diverge fortement de l'âge déclaré (un enfant de
   5 ans se plaçant en 3ᵉ année), faut-il l'afficher clairement, l'adoucir, ou
   demander d'abord confirmation au parent ?
6. Le replacement périodique (toutes les N semaines, ou après M mauvaises
   réponses au palier actuel) est-il une fonctionnalité de la v1, ou un
   ajout ultérieur une fois la boucle centrale validée ?
7. Étant donné à quel point la documentation publique de
   NWEA/i-Ready/IXL/Khan Academy est mince, y a-t-il un intérêt à obtenir
   leurs manuels techniques via des accords de données de recherche, ou la
   base Duolingo/ALEKS/académique présentée ici est-elle suffisante pour
   l'instant ?

## Sources

1. Wikipedia — Item response theory. https://en.wikipedia.org/wiki/Item_response_theory
2. Wikipedia — Rasch model. https://en.wikipedia.org/wiki/Rasch_model
3. Wikipedia — Computerized adaptive testing. https://en.wikipedia.org/wiki/Computerized_adaptive_testing
4. Sharpnack, J., Mulcaire, P., Bicknell, K., LaFlair, G., & Yancey, K.
   (2024). *AutoIRT: Calibrating Item Response Theory Models with
   Automated Machine Learning.* arXiv:2409.08823. https://arxiv.org/pdf/2409.08823v1
5. Sharpnack, J., Tsigler, A., Lockwood, J.R., Nydick, S., & von Davier,
   A.A. (2026). *S2A3: Thompson Sampling and Stochastic Exposure Control
   for High-Stakes CATs.* arXiv:2606.07364. https://arxiv.org/pdf/2606.07364v1
6. Burstein, J., LaFlair, G.T., Yancey, K., von Davier, A.A., & Dotan, R.
   (2024). *Responsible AI for Test Equity and Quality: The Duolingo
   English Test as a Case Study.* arXiv:2409.07476. https://arxiv.org/pdf/2409.07476v1
7. Wikipedia — Knowledge space. https://en.wikipedia.org/wiki/Knowledge_space
8. Wikipedia — ALEKS. https://en.wikipedia.org/wiki/ALEKS
9. Wikipedia — Elo rating system. https://en.wikipedia.org/wiki/Elo_rating_system
10. Abdi, S., Khosravi, H., Sadiq, S., & Gasevic, D. (2019). *A
    Multivariate Elo-based Learner Model for Adaptive Educational
    Systems.* Proceedings of the 12th International Conference on
    Educational Data Mining (EDM 2019).
11. Ghosh, A., & Lan, A. (2021). *BOBCAT: Bilevel Optimization-Based
    Computerized Adaptive Testing.* arXiv (IJCAI 2021).
12. Ozturk, N.B., & Dogan, N. (2015). *Investigating Item Exposure Control
    Methods in Computerized Adaptive Testing.* Educational Sciences:
    Theory and Practice. ERIC EJ1057460. https://eric.ed.gov/?id=EJ1057460
13. Leroux, A.J., Lopez, M., Hembry, I., & Dodd, B.G. (2013). *A
    Comparison of Exposure Control Procedures in CATs Using the 3PL
    Model.* Educational and Psychological Measurement. ERIC EJ1019083.
    https://eric.ed.gov/?id=EJ1019083
14. Leroux, A.J., & Dodd, B.G. (2016). *A Comparison of Exposure Control
    Procedures in CATs Using the GPC Model.* Journal of Experimental
    Education.
15. Wikipedia — NWEA. https://en.wikipedia.org/wiki/NWEA
16. Wikipedia — Khan Academy. https://en.wikipedia.org/wiki/Khan_Academy
17. IXL — page produit Real-Time Diagnostic. https://la.ixl.com/diagnostic
18. Yasuda, J., Hull, M.M., Mae, N., & Kojima, K. (2024). *Chained
    computerized adaptive testing for the Force Concept Inventory.* arXiv.
19. Recherche interne Math Challenge, sujet 13 : *Intelligent Tutoring
    Systems and Learner Modelling: BKT, DKT, PFA, and the Math Garden Elo
    Approach* (2026-07-31), docs/research/2026-07-31-mc-13-its-knowledge-tracing-elo.md
    — le précédent Elo/Math Garden sur lequel ce document s'appuie plutôt
    que de le redériver.
