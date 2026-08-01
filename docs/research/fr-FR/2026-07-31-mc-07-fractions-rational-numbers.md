# Apprentissage des fractions, décimaux, rapports et raisonnement proportionnel (environ 8 à 14 ans)

> Recherche Math Challenge — 2026-07-31 — sujet 07

## Résumé exécutif (FR)

- Pour Siegler, les fractions sont la « nouvelle frontière » du développement numérique : il faut cesser de voir numérateur et dénominateur comme deux entiers et les voir comme **une seule magnitude** sur la droite numérique [1][2].
- La connaissance des fractions à 10 ans prédit la réussite en algèbre et en mathématiques à 16 ans, en contrôlant le QI, la mémoire de travail et le revenu familial — aux États-Unis comme au Royaume-Uni [3][4].
- Le « biais du nombre entier » cause les erreurs les plus courantes : additionner numérateurs et dénominateurs séparément (2/3 + 4/6 → 6/9), ou croire que 1/4 > 1/2 parce que « 4 > 2 » [5][10].
- L'IES/WWC (2010) donne cinq recommandations (preuves de faibles à modérées) : partir de notions informelles de partage, enseigner la fraction comme un nombre, enseigner pourquoi les procédures fonctionnent, enseigner le rapport/la proportion avant la multiplication croisée, et améliorer la formation des enseignants [6].
- Consensus croissant : la droite numérique enseigne mieux le sens de la fraction que les modèles d'aire/partie-tout, bien qu'elle soit plus difficile à bien enseigner [7][8].
- Pour les décimaux, Steinle et Stacey ont catalogué trois familles : « plus long est plus grand » (0,125 > 0,3), « plus court est plus grand » (0,3 > 0,496), et un comportement « apparemment expert » sans réelle compréhension de la valeur positionnelle [9][11].
- « Multiplier agrandit toujours » et « diviser rétrécit toujours » se brisent précisément avec les fractions/décimaux inférieurs à 1 (0,5 × 0,2 = 0,1 ; 8 : ½ = 16) [12].
- Le raisonnement proportionnel (Lamon ; Tourniaire & Pulos) est multiplicatif, distinct et plus tardif que le raisonnement additif ; c'est l'un des meilleurs prédicteurs de la réussite mathématique ultérieure [13][14].
- Ashlock explique presque toutes les erreurs de calcul avec les fractions par deux mécanismes : **sur-généraliser** une règle des nombres entiers ou **sur-spécialiser** une règle à un seul cas [15].
- Il existe déjà des catalogues de « malrules » exécutables permettant à un système de classer une réponse incorrecte dans un type d'erreur nommé — l'approche dont a besoin le tuteur IA de Math Challenge [16].
- Implication centrale : le diagnostic en fractions/décimaux/rapport ne doit pas se limiter à « correct/incorrect » ; il doit associer la réponse à un catalogue court de méconceptions nommées, et le tuteur doit nommer la croyance, pas seulement répéter la procédure correcte.

## Executive summary (EN)

- Fractions mark the point where children must stop treating numerator/denominator as two integers and start treating a fraction as one magnitude on a number line — Siegler's integrated theory of numerical development [1][2].
- Fraction knowledge at age 10 uniquely predicts algebra and overall math achievement at 16, controlling for IQ, working memory, and SES, in both US and UK longitudinal cohorts [3][4].
- Whole-number bias drives the most common fraction errors: adding numerators and denominators separately, and judging 1/4 > 1/2 because 4 > 2 [5][10].
- The 2010 IES/WWC Practice Guide gives five recommendations (minimal-to-moderate evidence): build on informal sharing/proportionality intuitions; teach fractions as numbers; teach why procedures work; teach ratio/rate/proportion conceptually before cross-multiplication; improve teacher content knowledge [6].
- Growing consensus favors the number line over 2-D area/part-whole models for fraction magnitude sense, though number lines are harder to teach well [7][8].
- For decimals, Steinle and Stacey's taxonomy names three families — "longer-is-larger," "shorter-is-larger," "apparent-expert" (correct procedure, no place-value understanding) — with named sub-types like "zero makes small" and "money thinking" [9][11].
- "Multiplication always makes bigger" / "division always makes smaller" are over-generalizations from repeated-addition models, and they break exactly on the fraction/decimal (<1) territory this age learns [12].
- Proportional reasoning (Lamon; Tourniaire & Pulos) is a distinct, later-developing multiplicative skill, not additive reasoning extended, and a strong predictor of later math success [13][14].
- Ashlock's framework explains most fraction computation errors as over-generalizing a whole-number rule or over-specializing a rule to a narrow case [15].
- A 2026 arXiv system ("MalruleLib") frames misconceptions as executable "malrules" with prevalence and remediation metadata for automatic classification of a wrong answer — directly relevant prior art for the tutor [16].

## Résultats

### 1. La théorie intégrée du développement numérique de Siegler

Siegler et ses collègues proposent qu'une seule représentation sous-jacente — la magnitude numérique, projetée sur une droite numérique mentale — unifie les nombres entiers, les entiers relatifs, les fractions et les décimaux. Le développement progresse en élargissant et en intégrant progressivement l'éventail de nombres qui reçoivent cette représentation de magnitude [1][2]. Les fractions sont « la nouvelle frontière » car elles sont le premier type de nombre où le symbole imprimé (deux entiers empilés) induit activement en erreur une interprétation de magnitude, à moins que les habitudes liées aux nombres entiers ne soient supprimées [2].

Deux directions prédictives sont confirmées : la connaissance de la magnitude des nombres entiers en première année prédit la connaissance de la magnitude des fractions au collège, et — plus déterminant pour la conception du curriculum — la connaissance des fractions et de la division à 10 ans prédit spécifiquement la connaissance en algèbre et la réussite mathématique globale à 16 ans, dans un échantillon américain et une étude de cohorte britannique, en contrôlant le QI, la lecture, la mémoire de travail et le revenu/l'éducation de la famille [3][4]. C'est l'argument le plus solide pour traiter les fractions comme un levier à haute valeur dans un curriculum « de la maternelle au doctorat », plutôt que comme une unité parmi d'autres.

### 2. Guide de pratique de l'IES : « Developing Effective Fractions Instruction, K–8 » (NCEE 2010-4039)

Cinq recommandations, chacune avec sa propre cote de preuve [6] : (1) s'appuyer sur la compréhension informelle du partage/de la proportionnalité (preuve minimale) ; (2) aider les élèves à voir les fractions comme des nombres, pas seulement des formes ombrées (modérée) ; (3) enseigner pourquoi les procédures de calcul avec fractions fonctionnent (modérée) ; (4) enseigner le rapport/taux/proportion de façon conceptuelle avant la multiplication croisée (minimale) ; (5) améliorer la connaissance des fractions chez les enseignants eux-mêmes (minimale). L'ordre est délibéré : intuition informelle → fractions comme nombres → procédures ancrées conceptuellement → rapport/proportion sur le même sens de la magnitude, la multiplication croisée s'acquérant en dernier plutôt que d'être mémorisée en premier [6].

### 3. Le biais du nombre entier et le catalogue d'erreurs canonique

Le biais du nombre entier (aussi appelé négligence du dénominateur) consiste à appliquer aux fractions/décimaux des intuitions valides pour les nombres naturels, alors qu'elles n'y tiennent plus [5][10]. Il est le plus fort chez les jeunes apprenants, diminue de la 4e à la 8e année, et ne disparaît jamais complètement — même des adultes compétents reviennent à des raccourcis de nombre entier pour comparer des fractions sous pression temporelle ou charge cognitive, avec un coût mesurable détecté dans des études de réponse cérébrale [10].

Le symptôme dominant est de traiter numérateur et dénominateur comme deux entiers indépendants. Deux familles d'erreurs bien documentées en découlent : l'**erreur additive** (additionner numérateurs et dénominateurs séparément, par exemple 1/8 + 1/8 → 2/16, ou 2/3 + 4/6 → 6/9 [5]) et l'**erreur de comparaison** (juger la magnitude par le plus grand entier, par exemple 1/4 > 1/2 « parce que 4 > 2 » [10][17][18]). Une méconception connexe généralise la règle des fractions unitaires (« dénominateur plus grand → part plus petite ») à toutes les comparaisons, alors qu'elle n'est garantie que pour les fractions unitaires [18].

### 4. Droite numérique vs représentation partie-tout (modèle d'aire)

Les curriculums américains ont historiquement privilégié les modèles partie-tout/aire (une fraction comme forme ombrée), tandis que plusieurs curriculums asiatiques mettent l'accent sur une interprétation de « mesure » — une fraction comme position sur une ligne — plus tôt et de façon plus cohérente [7]. La recherche privilégie de plus en plus la droite numérique : un point unique à 75 % du chemin entre 0 et 1 impose l'interprétation « une seule magnitude » que les modèles d'aire n'imposent pas, puisque ces derniers gardent numérateur et dénominateur visuellement séparables [7][8]. Des travaux comparant des tâches de division de fractions ont trouvé que les droites numériques, mais pas les modèles d'aire, soutenaient à la fois la précision et des modèles conceptuels corrects [8]. La réserve commune aux sources : les droites numériques sont la bonne représentation cible mais sont plus difficiles à bien enseigner, si bien que c'est un séquençage, plutôt qu'un remplacement pur et simple, que les preuves soutiennent [7][8].

### 5. Rapport et raisonnement proportionnel (Lamon ; Tourniaire & Pulos)

La revue de 1985 de Tourniaire et Pulos reste la synthèse de référence, cataloguant les stratégies correctes et erronées sur les problèmes de proportion et les variables qui prédisent laquelle apparaît [14]. Lamon définit le raisonnement proportionnel comme « l'usage délibéré de relations multiplicatives pour comparer des quantités et prédire la valeur d'une quantité à partir des valeurs d'une autre », reposant sur la compréhension de la covariance des quantités conjuguée à l'invariance de leur rapport [13]. Le raisonnement proportionnel n'est pas un raisonnement additif étendu — il exige un changement qualitatif vers la comparaison multiplicative, et même les élèves à l'aise avec l'arithmétique des fractions retombent souvent sur des stratégies proportionnelles additives (par exemple « ajouter 3 aux deux termes ») face à des problèmes nouveaux [13][14]. Lamon soutient que le raisonnement proportionnel est parmi les meilleurs prédicteurs de la réussite mathématique ultérieure, ce qui, combiné à la découverte de Siegler sur le lien fraction→algèbre, rend cette tranche d'âge démesurément déterminante pour les résultats d'apprentissage à long terme [3][13].

### 6. Taxonomie des méconceptions spécifiques aux décimaux (Steinle & Stacey)

Le programme de recherche de Steinle, Stacey et Chambers (1998-2002) est la taxonomie la plus prête pour une classification automatique ici, construite à partir de données de tests diagnostiques à grande échelle plutôt que d'études de cas [9][11] :

- **« Plus long est plus grand »** — plus de chiffres après la virgule signifie plus grand (par exemple, 0,125 > 0,3). Sous-types : pensée de nombre entier, pensée de débordement de colonne, « le zéro rend petit », pensée inversée.
- **« Plus court est plus grand »** — l'inverse (par exemple, 0,3 > 0,496). Sous-types : pensée centrée sur le dénominateur, pensée réciproque, pensée négative.
- **Comportement « apparemment expert »** — des comparaisons d'apparence correcte sans réelle compréhension de la valeur positionnelle, y compris la « pensée monétaire » (traiter les décimaux comme des dollars et des cents au-delà de deux chiffres) et une difficulté spécifique avec le zéro.

La prévalence rapportée pour certains sous-types (par exemple, « le zéro rend petit ») était d'environ 3 % des élèves testés, un taux de base utile pour déterminer avec quelle vigueur signaler une méconception rare mais réelle [11].

### 7. « La multiplication agrandit » / « la division rétrécit »

Cette paire remonte à une cause unique : la multiplication d'abord modélisée comme une addition répétée, ce qui est réellement toujours croissant pour les entiers supérieurs à 1 — la croyance est donc localement correcte pendant des années avant d'échouer sur une fraction/un décimal inférieur à 1, par exemple 0,5 × 0,2 = 0,1 (plus petit), ou 8 : ½ = 16 (plus grand) [12]. C'est l'une des rares méconceptions avec une remédiation testée : des activités de prédiction-puis-révélation, qui forcent un engagement sur une prédiction avant le contre-exemple, ont surpassé l'explication directe [12].

### 8. Le cadre diagnostique des schémas d'erreur d'Ashlock

*Error Patterns in Computation* d'Ashlock (10 éditions) est ce qui se rapproche le plus d'un manuel diagnostique généraliste pour une réponse erronée [15]. Sa thèse : presque chaque erreur récurrente relève soit d'une **sur-généralisation** d'une règle au-delà de son domaine de validité (par exemple, la règle « multiplier haut et bas » mal appliquée à l'addition), soit d'une **sur-spécialisation** d'une règle au seul cas restreint enseigné en premier (par exemple, une règle de soustraction qui suppose implicitement l'absence de regroupement, et qui échoue sur les nombres mixtes) [15]. Ashlock organise les chapitres sur les fractions/décimaux par opération — un axe secondaire utile, en plus du nom de la méconception, pour étiqueter les réponses erronées.

### 9. Vers une classification automatique : travaux antérieurs

Un article arXiv de 2026 décrit « MalruleLib », une bibliothèque encodant des méconceptions documentées sous forme de « malrules » exécutables avec des traces de raisonnement étape par étape, des données de prévalence, des hypothèses de cause profonde et des conseils de remédiation, conçue pour classer une réponse incorrecte par rapport à des schémas catalogués [16]. C'est la forme de système dont a besoin le tuteur de Math Challenge : une couche d'appariement de règles qui infère quelle malrule nommée a produit une réponse numérique erronée spécifique et répond à la croyance plutôt qu'à une erreur générique. Sa filiation remonte aux travaux « DEBUGGY » de Brown et Burton (1978) — le cas fondateur montrant que les réponses erronées sont généralement le résultat déterministe d'une procédure incorrecte cohérente et nommable, et non du bruit.

## Implications de conception pour Math Challenge

1. Traiter les fractions/décimaux/rapports (de la 3e à la 8e année, environ 8 à 14 ans) comme un domaine à **haute valeur de levier** dans la programmation et le verrouillage de maîtrise, et non comme une unité de poids égal — le lien prédictif fraction→algèbre est l'une des conclusions les plus solides de la recherche en didactique des mathématiques [3][4].
2. Faire des exercices d'introduction aux fractions une représentation par **droite numérique** par défaut, les modèles partie-tout/aire servant d'étayage antérieur plutôt que de cible — conformément au consensus selon lequel les représentations de magnitude unidimensionnelles construisent un sens plus fidèle de la fraction [7][8].
3. Construire un **classificateur de méconceptions nommées**, pas un simple vérificateur correct/incorrect : associer la réponse numérique erronée spécifique de l'élève à un petit catalogue de malrules documentées (voir tableau) avant de se rabattre sur un « incorrect » générique.
4. Faire en sorte que le tuteur IA **nomme la croyance**, pas seulement reformule la procédure — « tu as additionné les numérateurs et les dénominateurs séparément » est plus diagnostique que « pense à trouver un dénominateur commun ».
5. Utiliser des micro-interactions de **prédiction-puis-révélation** pour « la multiplication agrandit » / « la division rétrécit » — la seule méconception ici dont la remédiation testée s'est montrée supérieure à l'explication directe [12].
6. Instrumenter les items de comparaison de décimaux pour détecter spécifiquement les sous-types de Steinle & Stacey (plus-long-est-plus-grand, plus-court-est-plus-grand, pensée monétaire, le-zéro-rend-petit) ; leurs taux de base connus (environ 3 % pour certains) peuvent calibrer avec quelle vigueur le tuteur intervient plutôt que de laisser passer une erreur rare [9][11].
7. Étiqueter chaque erreur diagnostiquée selon l'axe d'Ashlock sur-généralisation vs sur-spécialisation ; cela façonne le langage du tuteur (« cette règle ne couvre pas ce cas » vs « cette règle ne fonctionne que pour X ») et montre aux concepteurs de contenu quelles opérations génèrent quel mécanisme [15].
8. Séquencer l'enseignement du rapport/de la proportion pour que les stratégies conceptuelles (mise à l'échelle, taux unitaires, construction progressive) soient maîtrisées avant que la multiplication croisée ne se débloque, selon la recommandation 4 de l'IES — la multiplication croisée est un raccourci qui masque la compréhension multiplicative dont cet âge a besoin [6].
9. Puisque le raisonnement proportionnel exige un passage de la comparaison additive à la comparaison multiplicative, concevoir des items qui forcent ce choix (par exemple, des tâches de mise à l'échelle de recette où le naïf « ajouter 3 aux deux termes » semble plausible mais est faux) afin que la méconception apparaisse et puisse être nommée [13][14].
10. Consigner quelle méconception un enfant déclenche de façon répétée ; un enfant produisant la même malrule à répétition est un déclencheur plus fort pour une micro-leçon ciblée que la seule précision agrégée des items.
11. Rédiger le texte du tuteur (EN/ES/FR/PT/DE) par méconception sous forme de gabarit avec des emplacements de nombres, et non traduit au cas par cas par item — cela garde la formulation « nommer la croyance » cohérente et permet à un réviseur natif unique de valider par méconception.
12. Puisque le biais du nombre entier ne disparaît jamais complètement, même chez des adultes compétents sous charge, ne pas verrouiller la « maîtrise des fractions » comme un badge permanent ; suivre le taux de réussite sous pression temporelle séparément du taux de réussite sans chronométrage, étant donné que la vitesse est déjà une dimension notée.

### Tableau de départ : méconception → réponse erronée → réponse du tuteur

| Méconception nommée | Réponse erronée typique produite | Ce que le tuteur IA devrait dire |
|---|---|---|
| Biais du nombre entier / fraction vue comme deux entiers | 1/8 + 1/8 = 2/16 (additionne numérateurs et dénominateurs séparément) [5] | « Tu as additionné le haut et le bas séparément — une fraction est un seul nombre. 1/8 et 1/8 sont des parts de même taille, alors additionne les parts : 1 + 1 = 2 huitièmes = 2/8. » |
| Dénominateur-plus-grand-signifie-fraction-plus-grande | Affirme 1/4 > 1/2 « parce que 4 est plus grand que 2 » [10][17][18] | « Tu as comparé les nombres du bas comme des nombres entiers. Un dénominateur plus grand veut dire que le tout est coupé en plus de parts, plus petites. Coupons la même pizza en 2 puis en 4 parts et comparons. » |
| Règle des fractions unitaires sur-appliquée aux fractions non unitaires | Affirme 2/5 < 3/8 en comparant seulement les dénominateurs (5 < 8), en ignorant les numérateurs [18] | « Ce raccourci ne fonctionne que quand le nombre du haut est 1 pour les deux fractions. Ici, les nombres du haut sont différents aussi, alors trouvons plutôt un dénominateur commun. » |
| Numérateur/dénominateur traités comme des entiers sans lien (confusion d'équivalence) | Croit que 2/4 et 3/6 sont des quantités différentes parce que les chiffres diffèrent [19] | « Des nombres du haut/bas différents peuvent quand même représenter la même quantité. Multiplions 1/2 par 2/2 et voyons ce qu'on obtient. » |
| « Le décimal le plus long est le plus grand » (pensée de nombre entier / débordement de colonne) | Juge 0,125 > 0,3 [9][11] | « Tu as comparé ça comme des nombres entiers — 125 contre 3. Mais juste après la virgule, c'est le chiffre des dixièmes qui compte le plus : 0,3 = 0,300, et 3 dixièmes bat 1 dixième. » |
| « Le décimal le plus court est le plus grand » (pensée centrée sur le dénominateur / réciproque) | Juge 0,3 > 0,496 [9][11] | « Alignons-les sur le même nombre de chiffres : 0,300 contre 0,496. Compare à partir de la gauche — quel chiffre des dixièmes est le plus grand ? » |
| Limite de la « pensée monétaire » sur les décimaux | Gère mal un troisième chiffre décimal, par exemple lit 0,145 comme « 1 dollar 45 » [9][11] | « L'argent n'a que deux chiffres après la virgule, mais les décimaux peuvent en avoir plus. Ce troisième chiffre est le rang des millièmes. » |
| « La multiplication agrandit toujours » | Prédit 0,5 × 0,2 > 0,5, alors qu'en réalité c'est 0,1 [12] | « Vrai quand tu multiplies par plus de 1 — mais 0,2 est inférieur à un tout, donc tu prends une petite partie de 0,5, pas un ajout. » |
| « La division rétrécit toujours » | Prédit 8 : ½ < 8, alors qu'en réalité c'est 16 [12] | « Diviser par ½ demande « combien de demis tiennent dans 8 ? ». Les demis sont petits, donc il en tient beaucoup — c'est pour ça que la réponse est plus grande. » |
| Raisonnement proportionnel additif (et non multiplicatif) | « 3 farine : 2 sucre, mise à l'échelle à 9 farine » répondu comme 8 sucre (+6 aux deux termes au lieu de ×3) [13][14] | « Tu as ajouté la même quantité aux deux nombres, mais un rapport grandit selon le même multiple. La farine a triplé (3→9) — que se passe-t-il pour le sucre s'il triple aussi ? » |
| Multiplication croisée sans compréhension | Pose correctement la multiplication croisée mais ne peut pas expliquer pourquoi, ou l'applique à tort à une relation non proportionnelle [6] | « Avant de multiplier en croix, dis-moi pourquoi ces deux rapports devraient être égaux. S'ils ne sont pas vraiment proportionnels, la multiplication croisée donne une réponse qui a l'air juste mais qui ne l'est pas. » |
| Sur-généralisation d'une règle d'opération (Ashlock) | Applique la règle du dénominateur commun à la multiplication, par exemple 1/2 × 1/3 [15] | « Cette règle est pour l'addition/soustraction. La multiplication fonctionne différemment — multiplie directement les numérateurs entre eux et les dénominateurs entre eux. » |
| Sur-spécialisation d'une règle d'opération (Ashlock) | Une procédure de soustraction qui fonctionnait échoue sur des nombres mixtes nécessitant un regroupement, par exemple 3 − 1¾ [15] | « Cette règle fonctionnait pour des problèmes plus simples, mais ici il faut d'abord emprunter au nombre entier. Réécrivons 3 comme 2 et 4/4. » |

## Questions ouvertes pour le porteur du projet

1. Le classificateur doit-il comparer chaque réponse erronée au catalogue de malrules, ou n'escalader vers une rétroaction de méconception nommée qu'après une répétition (pour éviter de sur-diagnostiquer une erreur isolée) ?
2. Pour l'âge de 8 ans (3e année), la droite numérique doit-elle être le premier modèle de fraction montré, ou un bref pont partie-tout doit-il la précéder, étant donné que les droites numériques sont plus difficiles à bien enseigner ?
3. « Correct sous pression temporelle » et « correct sans chronométrage » doivent-ils être des signaux de maîtrise affichés séparément pour les fractions (selon l'implication n° 12), ou cela ajouterait-il une complexité d'interface disproportionnée ?
4. Les gabarits méconception → réponse du tuteur doivent-ils être rédigés nativement par langue, ou modélisés puis traduits automatiquement avec relecture native — un compromis coût/ton pour EN/ES/FR/PT/DE ?
5. La multiplication croisée doit-elle être verrouillée derrière la maîtrise conceptuelle du rapport (recommandation 4 de l'IES), même contre la volonté d'un élève/parent d'accéder plus vite au « raccourci » ?

## Sources

1. Siegler, R. S., Thompson, C. A., & Schneider, M. (2011). An integrated theory of whole number and fractions development. *Cognitive Psychology*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/STS2011.pdf
2. Siegler, R. S., Fazio, L. K., Bailey, D. H., & Zhou, X. (2013). Fractions: The new frontier for theories of numerical development. *Trends in Cognitive Sciences*. https://siegler.tc.columbia.edu/wp-content/uploads/2019/02/2013-SieglerFazioBaileyZhou-fac.pdf
3. Siegler, R. S., Duncan, G. J., Davis-Kean, P. E., Duckworth, K., Claessens, A., Engel, M., Susperreguy, M. I., & Chen, M. (2012). Early Predictors of High School Mathematics Achievement. *Psychological Science*. https://journals.sagepub.com/doi/abs/10.1177/0956797612440101 (PDF en accès libre : https://files.eric.ed.gov/fulltext/ED552898.pdf)
4. Early Predictors of Middle School Fraction Knowledge. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC4146696/
5. Developmental changes in the whole number bias. ERIC / ResearchGate. https://files.eric.ed.gov/fulltext/ED572370.pdf
6. Institute of Education Sciences / What Works Clearinghouse (2010). Developing Effective Fractions Instruction for Kindergarten Through 8th Grade. NCEE 2010-4039. https://ies.ed.gov/ncee/wwc/practiceguide/15
7. Frax / ExploreLearning. Effective Strategies for Teaching Fractions: Rethinking Fraction Instruction. https://frax.explorelearning.com/resources/insights/are-we-teaching-fractions-effectively-rethinking-fraction-instruction
8. Number lines, but not area models, support children's accuracy and conceptual models of fraction division. *Journal of Experimental Child Psychology / Cognitive Development*, ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0361476X18305290
9. Denominator neglect / decimal misconceptions overview (résumé du cadre de Steinle & Stacey). Wikipedia. https://en.wikipedia.org/wiki/Denominator_neglect
10. Inhibiting the Whole Number Bias in a Fraction Comparison Task: An Event-Related Potential Study. PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC7064278/
11. Steinle, V., & Stacey, K. (1998, 2002). The incidence of misconceptions of decimal notation amongst students in Grades 5 to 10 / Persistence of decimal misconceptions and readiness to move to expertise. University of Melbourne. https://extranet.education.unimelb.edu.au/SME/TNMY/Decimals/Decimals/backinfo/refs/merga98stst.pdf et https://www.researchgate.net/publication/251804213_PERSISTENCE_OF_DECIMAL_MISCONCEPTIONS_AND_READINESS_TO_MOVE_TO_EXPERTISE
12. Addressing the multiplication makes bigger and division makes smaller misconceptions via prediction and clickers. ResearchGate. https://www.researchgate.net/publication/233294366_Addressing_the_multiplication_makes_bigger_and_division_makes_smaller_misconceptions_via_prediction_and_clickers
13. Lamon, S. J. Teaching Fractions and Ratios for Understanding ; cité via des résumés NCTM et MERGA du cadre de raisonnement proportionnel de Lamon. https://www.nctm.org/uploadedFiles/Publications/More4U/Activity_Gems_in_the_6-8_Classroom/ch%202-5%20lamon%20article.pdf et https://files.eric.ed.gov/fulltext/ED520962.pdf
14. Tourniaire, F., & Pulos, S. (1985). Proportional reasoning: A review of the literature. *Educational Studies in Mathematics*, 16, 181–204. https://link.springer.com/article/10.1007/PL00020739
15. Ashlock, R. B. Error Patterns in Computation: Using Error Patterns to Help Each Student Learn (10th ed.). Pearson. https://www.pearson.com/en-us/subject-catalog/p/Ashlock-Error-Patterns-in-Computation-Using-Error-Patterns-to-Help-Each-Student-Learn-10th-Edition/P200000000739/9780135009109
16. MalruleLib: Large-Scale Executable Misconception Reasoning with Step Traces for Modeling Student Thinking in Mathematics. arXiv. https://arxiv.org/pdf/2601.03217
17. Whole Number Bias and 3 Misconceptions about fractions in Junior Math. Robertson Program, OISE, University of Toronto. https://www.oise.utoronto.ca/robertson/blog/whole-number-bias-and-3-misconceptions-about-fractions-junior-math-2022-05-26
18. Maths — No Problem. 4 common maths fractions misconceptions and how to address them. https://mathsnoproblem.com/blog/teaching-tips/how-to-address-4-common-fractions-misconceptions
19. Kwokario Education. Overcoming Common Fraction Misconceptions in Student Learning. https://kwokarioedu.com/common-misconceptions-and-mistakes-when-learning-fractions/
