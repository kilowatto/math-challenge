# Recherche concurrentielle et de conception : les principaux produits d'apprentissage des mathématiques

> Recherche Math Challenge — 2026-07-31 — sujet 14

## Résumé exécutif (FR)

- Khan Academy combine vidéo et pratique adaptative avec deux monnaies de progression distinctes : les **Energy Points** (qui mesurent l'effort, pas la maîtrise) et les **Mastery Points** (qui mesurent la maîtrise réelle par compétence) ; cette séparation évite que « jouer avec le système » soit confondu avec apprendre [1]. C'est gratuit, financé par la philanthropie (~128 M$/an) [modèle économique].
- Les preuves de Khan Academy sont plus solides au niveau de la plateforme (≥30 min/semaine → ~20 % de gain supplémentaire au MAP Growth) [2] qu'au niveau de Khanmigo (tuteur IA) : une étude de physique menée auprès de 69 étudiants n'a trouvé aucune différence significative par rapport à l'utilisation d'un moteur de recherche, bien que la perception subjective ait été positive [3].
- Brilliant.org est la référence en matière de conception « apprendre en faisant » : chaque leçon est une séquence de problèmes interactifs avec étayage et retour immédiat, sans cours vidéo traditionnels ; une réponse incorrecte n'est pas pénalisée, elle est expliquée et l'on continue [5][7]. Prix : ~150 $/an ou ~10 $/mois.
- Kumon est le modèle de référence des « petits pas » et de l'incrémentalité extrême : chaque feuille d'exercices a un **Standard Completion Time** (temps standard) qui décide si l'enfant répète ou avance — le temps, pas seulement l'exactitude, est le signal de maîtrise [9][10]. Le **What Works Clearinghouse (WWC)** n'a pas pu se prononcer sur son efficacité, faute d'études répondant à ses normes [11] — une donnée à citer avec prudence, pas comme une validation.
- IXL utilise le **SmartScore** (0-100), un algorithme qui pondère la difficulté, la série de bonnes réponses et la récence ; au-delà du seuil de 90 (« Challenge Zone »), les bonnes réponses rapportent peu et les erreurs retirent bien davantage, ce qui impose une véritable constance plutôt qu'un pic de chance [12][13].
- Prodigy Math est le cas d'alerte le plus cité : les mathématiques sont gratuites mais enveloppées dans un RPG à la monétisation agressive de cosmétiques/mascottes, qui crée « deux classes » d'élèves : une plainte formelle a été déposée auprès de la FTC des États-Unis en 2021 pour publicité trompeuse et manipulation de mineurs [15][16][17]. C'est aussi la preuve que la « boucle centrale » de combat (répondre pour gagner des points de magie) n'enseigne pas en soi — elle ne fait qu'entraîner.
- DreamBox et ST Math disposent des preuves indépendantes les plus solides du groupe : DreamBox avec des études de Harvard/CEPR et de SRI, noté « STRONG » par Evidence for ESSA [20] ; ST Math atteint le niveau WWC « Meets Evidence Standards with Reservations » selon WestEd (2014), bien que des analyses ultérieures rapportent des effets non significatifs dans certains contextes — les preuves sont mitigées, pas unanimes [21][23].
- ST Math (JiJi) est la conception la plus radicale : **zéro mot**, tout est visuel/spatial, pensé pour que la langue ne soit pas une barrière — directement pertinent pour l'exigence EN/ES/FR/PT/DE de Math Challenge [24][25].
- Photomath a changé de modèle économique après son rachat par Google (2023) : passant d'un abonnement pur à l'alimentation de signaux d'apprentissage pour l'écosystème Google (Search, Workspace for Education) — c'est un outil de « résolution », pas de pratique graduée [26].
- Duolingo Math n'a ni échoué ni été annulé : il a été fusionné dans l'application principale de Duolingo en 2023-2024 après avoir eu moins de traction que Chess/Music — une leçon sur le lancement d'un produit « spin-off » séparé face à son intégration dès le premier jour [28].
- Le vide de marché qu'aucun concurrent ne comble bien : personne ne combine (a) de vrais problèmes façon Brilliant, (b) une progression incrémentale vérifiable façon Kumon/IXL, (c) une conception multilingue sans dépendance au texte façon ST Math, et (d) l'absence de monétisation manipulatrice envers les mineurs. C'est l'espace que Math Challenge peut occuper.

## Executive summary (EN)

Nine products were reviewed for core loop, problem presentation, grading, progression, and independent evidence. The clearest pattern: platforms with the strongest *independent* efficacy evidence (Khan Academy at scale, DreamBox, IXL, ST Math) separate the "effort/engagement" reward layer from the "mastery" signal, and they use algorithmic, per-skill mastery thresholds rather than course completion. Platforms optimized purely for engagement (Prodigy) have drawn regulatory-grade criticism for monetizing children through virtual-goods pressure, and have weaker learning-outcome evidence relative to time spent. Kumon's contribution is not "engagement design" — it is a rigorously timed, incremental worksheet ladder where a stopwatch, not just correctness, decides progression; its formal efficacy evidence is thin by WWC standards despite decades of anecdotal reputation. Brilliant.org is the best template for *presenting a problem*: short concept intro, then guided interactive problem with scaffolds and non-punitive wrong-answer handling. ST Math is the strongest existing proof that a wordless, spatial approach can be validated (WWC/ESSA Tier 2) and is directly relevant to Math Challenge's five-language requirement. Duolingo Math's history (merged into the flagship app rather than surviving standalone) is a caution about spin-off dilution. The market gap: no single product pairs Brilliant-grade problem craft with Kumon/IXL-grade incremental mastery gating, ST Math-grade language-independence, and a business model that does not pressure children into spending.

## Résultats

### Khan Academy

**Boucle centrale :** une courte vidéo/lecture facultative, puis une série d'exercices ; les bonnes réponses rapportent des Energy Points (monnaie d'effort non plafonnée, pas un signal de maîtrise) et font progresser vers les Mastery Points (spécifiques à la compétence, algorithmiques, exigeant une exactitude soutenue dans le temps, pas une seule série) [1]. Les compétences s'inscrivent dans un arbre de compétences à prérequis, avec une révision espacée qui refait resurgir le contenu maîtrisé. Khanmigo, le tuteur IA, est une couche de discussion de style socratique, pas un curriculum séparé [4].

**Notation :** l'exactitude par question alimente le modèle de maîtrise ; les Energy Points récompensent le fait de s'aventurer dans un nouveau contenu même en cas d'erreur, pour éviter de pénaliser la prise de risque [1].

**Preuves :** le propre rapport de Khan Academy de novembre 2024 indique que ≥30 min/semaine est corrélé à ~20 % de gains supérieurs aux attentes au MAP Growth [2] — une preuve corrélationnelle au niveau de la plateforme, pas un ECR. Pour Khanmigo spécifiquement, une étude à méthodes mixtes évaluée par les pairs (69 étudiants de premier cycle, physique) a trouvé des gains significatifs dans toutes les conditions mais **aucune différence significative** entre Khanmigo et un simple moteur de recherche, bien que les élèves aient subjectivement préféré le guidage pas à pas de Khanmigo [3]. Le propre blog de Khan Academy décrit des expériences en cours (octobre 2025 - avril 2026) pour améliorer l'efficacité mesurée de Khanmigo [4] — l'organisation elle-même la considère comme non prouvée et en cours.

**Modèle économique :** organisation à but non lucratif 501(c)(3), gratuite pour les utilisateurs finaux, financée par plus de ~128 M$/an de philanthropie.

### Brilliant.org

**Boucle centrale :** chaque leçon s'ouvre sur une introduction du concept de 2 à 4 phrases plus une illustration, puis enchaîne directement sur une chaîne de problèmes interactifs que l'apprenant résout — « apprendre en faisant », explicitement pas un cours magistral d'abord [5]. Les réponses fausses ne sont pas pénalisées : l'interface montre la bonne réponse et explique le raisonnement [7].

**Présentation :** des widgets visuels/interactifs (curseurs, diagrammes déplaçables, révélations en plusieurs étapes), pas des murs de texte.

**Notation :** un retour immédiat par problème avec des explications détaillées ; des problèmes de défi quotidien ainsi que des mécaniques de série/niveau incitent à revenir [7].

**Progression :** plus de 40 cours, du primaire au niveau supérieur (mathématiques, sciences, informatique, données, IA) ; facile à parcourir en sautant de sujet en sujet entre les cours, mais fortement séquencé au sein d'une leçon.

**Preuves :** aucune étude d'efficacité indépendante évaluée par les pairs n'a été trouvée ; l'argument en faveur de Brilliant repose sur la crédibilité de la conception pédagogique et les avis, pas sur des résultats mesurés.

**Modèle économique :** freemium ; Premium à ~150 $/an (~10 $/mois facturé annuellement), gratuit pour les enseignants K-12 [6].

### Kumon

**Boucle centrale :** de courtes feuilles d'exercices chronométrées, dans une séquence fixe de tout petits pas — étudier un exemple résolu, puis résoudre des problèmes quasi identiques avec une intervention minimale de l'enseignant (« auto-apprentissage ») [8][9].

**Notation :** l'exactitude *et* un **Standard Completion Time (SCT)** publié par niveau. Terminer avec exactitude dans le SCT autorise la feuille suivante ; ne pas respecter le SCT — même avec des réponses correctes — déclenche une répétition [10]. La vitesse est ici un critère de réussite/échec à part entière, contrairement à tous les autres produits passés en revue.

**Progression :** une taille de pas délibérément plus fine que ce qu'une salle de classe traiterait comme un nouveau sujet, si bien que chaque pas paraît accessible sans enseignement direct.

**Preuves :** le What Works Clearinghouse américain a passé en revue les études sur Kumon Math et n'en a trouvé aucune répondant à ses normes de preuve, si bien que **le WWC n'a pu tirer aucune conclusion** dans un sens ou dans l'autre [11] — un « pas de verdict », pas un résultat négatif, mais cela signifie que des décennies de réputation sur le marché ne sont pas étayées par des preuves de niveau WWC. Des commentaires secondaires rapportent des gains concentrés dans les 12 à 18 premiers mois (surtout pour les élèves partant en dessous du niveau scolaire), avec un plateau ensuite, et une critique récurrente selon laquelle la méthode récompense le calcul mécanique plutôt que le raisonnement conceptuel.

**Modèle économique :** centres franchisés en présentiel, frais de scolarité mensuels par matière (variable selon le marché).

### IXL

**Boucle centrale :** répondre à des questions de pratique adaptative dans une compétence choisie ; le **SmartScore**, une jauge de maîtrise de 0 à 100 par compétence, se met à jour après chaque réponse.

**Notation :** le SmartScore pondère la difficulté, les séries de bonnes réponses récentes et la constance, pas seulement le pourcentage de réussite [12][13]. Au-delà d'un SmartScore de 90 (« Challenge Zone »), les bonnes réponses n'ajoutent que 1 à 2 points, tandis qu'une erreur peut en retirer 3 à 8 — délibérément asymétrique, de sorte que la dernière ligne droite exige une vraie constance, pas une série de chance [13].

**Progression :** une adaptativité à deux niveaux — la difficulté des items s'adapte au sein d'une compétence, et un diagnostic en temps réel recommande la compétence sur laquelle travailler ensuite.

**Preuves :** IXL publie son propre document de méthodologie sur le SmartScore [12] ; aucune étude de résultats indépendante par un tiers n'a été trouvée.

**Modèle économique :** ~79 à 159 $/an par enfant selon le bouquet de matières, avec réductions multi-enfants ; licences scolaires à partir de ~369 $/an [14].

### Prodigy Math

**Boucle centrale :** un combat de RPG au tour par tour superposé à la pratique des mathématiques — répondre à une question rapporte des Magic Points dépensés pour lancer des sorts contre des monstres/autres personnages ; le mage monte de niveau, obtient de l'équipement, débloque des zones [18].

**Notation :** l'exactitude conditionne uniquement la progression du combat ; aucune explication de concept n'est intégrée à la boucle.

**Modèle économique et controverse :** le contenu de maths/anglais est nominalement gratuit ; le contenu de sciences et les améliorations cosmétiques/de jeu (animaux de compagnie, équipement, visuels « nuages contre boue ») exigent des paliers payants (Core ~9,95 $/mois, Plus ~14,95 $/mois, Ultra ~19,95 $/mois) [19]. En février 2021, des groupes de défense de l'enfance ont déposé une plainte formelle auprès de la FTC américaine, alléguant que Prodigy commercialise des mises à niveau premium auprès des enfants de manière « agressive » et « déloyale », qualifiant de trompeur le discours de gratuité pour les écoles et décrivant une expérience à deux vitesses visible entre élèves payants et non payants [15][16][17]. Les critiques soutiennent aussi que le jeu « n'enseigne pas... il ne fait qu'offrir de la pratique », citant une recherche classant Prodigy dernier parmi quatre applications comparées pour les gains d'apprentissage par heure investie [17]. La réponse de Prodigy : plus de 95 % des utilisateurs inscrits n'ont jamais payé, et le modèle freemium finance l'accès gratuit pour les autres [16].

**À retenir :** Prodigy est ici l'avertissement le plus clair — ce ne sont pas les mécaniques de jeu elles-mêmes, mais le fait d'utiliser une pression de statut en jeu visible par les pairs non payants, sur un produit commercialisé aux écoles comme gratuit, qui correspond exactement à ce que les régulateurs ont déjà formellement contesté.

### DreamBox Learning

**Boucle centrale :** des leçons adaptatives, ludiques, du primaire au collège (K-8), qui bifurquent selon la *manière* dont l'élève résout chaque problème — la stratégie et les étapes intermédiaires, pas seulement la réponse finale — pour choisir la tâche suivante.

**Preuves :** l'un des deux produits passés en revue disposant des meilleures preuves. Une étude Harvard CEPR portant sur ~3 000 élèves dans deux districts a trouvé que les élèves avec 14 heures d'utilisation s'amélioraient d'environ 4 % aux évaluations NWEA MAP/PARCC/de l'État [20]. Une étude LearnPlatform au William Penn School District (1 800 élèves de la maternelle à la 6ᵉ, majoritairement noirs et éligibles au FRL) a trouvé que les élèves utilisant DreamBox moins d'une heure/semaine avaient des scores Savvas Math de fin d'année significativement plus élevés que leurs pairs à moindre usage [22]. Un instantané de preuves WWC distinct existe [21]. Un ECR cité dans un district du sud-est a trouvé un gain de 0,12 écart-type à un test de compétences du primaire précoce mais aucun avantage significatif au test de fin d'année de l'État — des preuves réelles mais inégales selon les mesures de résultat. DreamBox est noté « STRONG » par Evidence for ESSA [20].

**Modèle économique :** licences de district/école du primaire au collège (K-8), vendues en B2B aux écoles.

### ST Math (MIND Research Institute)

**Boucle centrale :** l'élève guide JiJi le pingouin à travers des puzzles spatio-visuels **sans aucune instruction écrite ou parlée** — toute la boucle problème/retour est visuelle, construite autour du raisonnement spatio-temporel plutôt que du langage [24][25].

**Notation :** implicite — JiJi réussit ou échoue selon que la manipulation du puzzle par l'élève est mathématiquement correcte ; l'échec est immédiatement visible et peut être retenté, sans verdict verbal nécessaire.

**Preuves :** une évaluation WestEd de 2014 a trouvé que les niveaux ST Math comptaient 6,3 points de pourcentage d'élèves de plus atteignant la compétence au California Standards Test que les écoles témoins appariées ; cette conception a été jugée par la revue WWC comme répondant au niveau **« Meets Evidence Standards with Reservations »**, et MIND affirme que le programme atteint le niveau ESSA Tier 2 [23][24]. D'autres analyses de la même série de recherche ont trouvé un effet non significatif sur deux ans dans un contexte différent — les preuves sont réelles mais mitigées selon les études.

**Pertinence directe :** ST Math est la preuve la plus solide qu'une **conception sans mots peut être validée indépendamment**, directement utile pour un produit à 5 langues (EN/ES/FR/PT/DE) — un parcours spatial/visuel bien conçu n'a besoin d'aucune traduction et se lance dans les cinq langues à coût de localisation incrémental nul, en particulier pour les âges de pré-littératie de 4 à 7 ans.

**Modèle économique :** le MIND Research Institute est lui-même un organisme à but non lucratif ; ST Math est concédé sous licence en B2B aux districts/écoles.

### Matific

**Boucle centrale :** un contenu aligné sur le programme scolaire en quatre formats — feuilles d'exercices, « épisodes » (courtes applications ludiques), problèmes énoncés et ateliers pour enseignants — dans une spirale modulaire et progressive (les sujets resurgissent à difficulté croissante plutôt que selon une échelle strictement linéaire).

**Preuves :** le marketing de Matific cite lui-même une amélioration moyenne de 34 % des scores aux tests avec 30 min/semaine [29] ; il s'agit d'un chiffre rapporté par le fournisseur, non vérifié indépendamment dans les sources récupérées, à traiter comme une allégation à vérifier, pas comme un résultat de qualité citable.

**Modèle économique :** ~9,99 $/mois ou 79,99 $/an ; palier « Galaxy » à 19,99 $ pour un seul niveau ou 39,99 $ pour l'ensemble K-6/an ; essais gratuits.

### Mathletics (3P Learning)

**Boucle centrale :** des modules de pratique alignés sur le programme scolaire, plus un mode « Live Mathletics » mondial en direct où les élèves s'affrontent en temps réel, accompagné d'une gamification par certificats/points.

**Preuves :** aucune étude indépendante spécifique au produit n'a été trouvée. Des méta-analyses générales sur la gamification dans l'enseignement des mathématiques (41 études, ~5 071 participants) montrent une taille d'effet positive moyenne importante mais une hétérogénéité significative — certaines mises en œuvre montrent un effet nul ou négatif, donc la gamification n'est pas automatiquement efficace ; la qualité d'exécution détermine le résultat [32].

**Modèle économique :** ~99 $/an à la maison (un seul enfant) ; tarification école/district sur devis personnalisé.

### Photomath

**Boucle centrale :** fondamentalement un **outil de résolution**, pas une pratique notée — on photographie un problème, l'OCR (précision revendiquée de ~98 %) le convertit en expression symbolique, et un moteur de calcul formel renvoie plusieurs solutions pas à pas avec des explications animées.

**Notation/progression :** aucune au sens de la maîtrise — pas d'arbre de compétences ni de verrou de maîtrise ; la valeur réside dans une aide aux devoirs à la demande, le pari de conception opposé à la progression verrouillée de Kumon/IXL/Khan Academy.

**Évolution du modèle économique :** racheté par Google/Alphabet en 2023 ; d'ici 2026, son rôle est passé d'une application autonome par abonnement à l'alimentation de données de signal d'apprentissage pour Google Workspace for Education/Gemini et le « Homework Helper » de Search — une monétisation en tant que valeur d'écosystème plutôt qu'un abonnement pur [26][27].

**Pertinence :** Photomath est l'anti-modèle à ne pas copier — un pur solveur de réponses sape le principe « de vrais problèmes, pas de l'arithmétique nue » si un enfant peut photographier n'importe quel problème de Math Challenge et obtenir une réponse instantanée. Cela plaide pour des formats de problèmes interactifs/manipulables qui résistent à la résolution naïve par photo.

### Duolingo Math

**Historique :** lancé comme une **application autonome distincte** en octobre 2022 ; lors de Duocon 2023, Duolingo a annoncé qu'il fusionnerait Math dans l'application phare ; l'application autonome a quitté l'App Store le 30 novembre 2023, intégrée à l'application principale jusqu'au début de 2024 [28]. Math (et Music) avait atteint environ 3 millions d'utilisateurs combinés un an après le lancement — moins que des matières sœurs comme Chess — un contexte pour, sans être présenté comme la seule cause de, sa fusion plutôt que son maintien en autonome. En septembre 2025, Math a été repensé pour regrouper les Units en Grades et Topics, à l'image d'un programme scolaire [28].

**Implication de conception :** un avertissement sur le pari du « spin-off autonome réussi » — une marque mère forte (Duolingo) lançant une matière adjacente comme sa propre application a connu une adoption plus faible que ses matières sœurs, et le correctif a été l'intégration, pas l'itération sur le spin-off. Pour Math Challenge, qui *est* le produit autonome, le risque transposable est de se scinder en applications séparées par bande de niveau ou par langue plutôt qu'une seule PWA avec des modes thématiques.

## Tableau comparatif

| Produit | Boucle centrale | Mécanisme de notation | Modèle de progression | Preuves indépendantes | Prix / modèle |
|---|---|---|---|---|---|
| Khan Academy | Regarder/lire → série d'exercices → exercice de maîtrise | Energy Points (effort, non plafonné) séparés des Mastery Points (par compétence, algorithmique) [1] | Arbre de compétences à prérequis + révision espacée | Plateforme : ~20 % de gain MAP Growth supplémentaire à ≥30 min/sem. (rapporté par KA) [2] ; étude de type ECR sur Khanmigo : aucun gain significatif vs moteur de recherche [3] | Gratuit ; à but non lucratif, >128 M$/an de philanthropie |
| Brilliant.org | Courte intro de concept → chaîne de problèmes interactifs | Retour immédiat par problème + explication ; réponses fausses non pénalisées [7] | 40+ cours, primaire→supérieur, facile à parcourir par sujet | Aucune étude d'efficacité indépendante trouvée | ~150 $/an (~10 $/mois), gratuit pour les enseignants K-12 [6] |
| Kumon | Exemple résolu → problèmes d'entraînement quasi identiques, chronométrés | Exactitude **et** Standard Completion Time (la vitesse est réussite/échec) [10] | Pas linéaires extrêmement fins | WWC : aucune étude ne répond aux normes de preuve, aucune conclusion possible [11] | Franchise en présentiel, frais de scolarité mensuels par matière |
| IXL | Question adaptative → mise à jour du SmartScore | SmartScore 0-100, asymétrique près de la maîtrise (une erreur coûte plus qu'une réussite n'aide) [13] | Adaptativité à deux niveaux : difficulté des items + recommandation de compétence via diagnostic | Document de méthodologie du fournisseur seulement ; aucune étude de résultats par un tiers trouvée [12] | ~79 à 159 $/an par enfant ; licence scolaire à partir de 369 $/an [14] |
| Prodigy Math | Répondre à une question → Magic Points → combat RPG | L'exactitude conditionne uniquement le combat ; aucune instruction adaptative | Montée de niveau du personnage/de l'équipement, déblocage de zones | Cité comme classé dernier sur 4 applications pour les gains d'apprentissage par heure [17] ; plainte formelle auprès de la FTC pour monétisation [15][16] | Maths/anglais gratuits ; sciences + cosmétiques via des paliers de 9,95 à 19,95 $/mois [19] |
| DreamBox | Leçon adaptative suivant la stratégie, pas seulement la réponse finale | Bifurcation sensible à la stratégie à chaque étape | Bifurcation adaptative continue, K-8 | Harvard CEPR (~3 000 élèves, +4 %) [20] ; LearnPlatform William Penn (scores supérieurs à <1h/sem.) [22] ; un instantané de preuves WWC existe [21] ; « STRONG » selon Evidence for ESSA | Licences district/école (B2B) |
| ST Math | Puzzle spatial sans mots (JiJi) | Implicite — puzzle résolu ou non, entièrement visuel | Séquence spatio-temporelle, préscolaire-8 | WestEd 2014 : +6,3 points de compétence ; WWC « Meets Evidence Standards with Reservations » ; ESSA Tier 2 ; d'autres analyses ont trouvé des effets non significatifs [23][24] | À but non lucratif (MIND Research Institute), licences aux districts |
| Matific | Feuilles d'exercices / épisodes / problèmes énoncés / ateliers | Exactitude par activité ; retour en spirale sur les sujets | Modulaire, aligné sur le programme, en spirale | Allégation d'amélioration de 34 % rapportée par le fournisseur (non vérifiée indépendamment dans cette passe) | ~9,99 $/mois ou 79,99 $/an ; Galaxy 19,99-39,99 $/an |
| Mathletics | Modules alignés sur le programme + compétition mondiale en direct | Exactitude par question + certificats/points | Modules alignés sur le programme, mode compétitif | Aucune étude spécifique au produit trouvée ; les méta-analyses générales sur la gamification montrent un effet important mais hétérogène | ~99 $/an à la maison ; devis scolaires personnalisés |
| Photomath | Photographier le problème → OCR → résolution pas à pas | Aucun (solveur, pas pratique) | Aucun (pas d'arbre de compétences) | S. O. — pas un produit de résultat d'apprentissage | Freemium → Photomath Plus ; post-Google, intégré à l'écosystème (Search/Workspace) [26] |
| Duolingo Math | Leçon quotidienne fondée sur la série, gamifiée | Exactitude + série/XP (mécaniques centrales de Duolingo) | Grades → Topics → Units (repensé en 2025) | Non étudié dans cette passe (aucune étude d'efficacité trouvée) ; les données d'adoption suggèrent que l'application autonome a sous-performé par rapport à Chess | Gratuit, intégré à l'application principale Duolingo depuis 2023-24 [28] |

## Implications de conception pour Math Challenge

1. **Séparer le signal d'effort du signal de maîtrise**, comme Khan Academy sépare les Energy Points des Mastery Points [1]. Les classements devraient récompenser la maîtrise démontrée par compétence, pas le volume d'entraînement facile.
2. **Reprendre la forme de présentation des problèmes de Brilliant** : courte introduction du concept, puis un seul problème interactif avec étayage, puis un retour immédiat non punitif avec une explication détaillée [5][7] — cela correspond directement à « de vrais problèmes, pas de l'arithmétique nue ».
3. **Adopter un seuil de maîtrise asymétrique près du sommet**, comme la Challenge Zone d'IXL (les erreurs coûtent plus que les réussites ne rapportent au-delà de 90) [13], pour qu'une série de chance ne puisse pas simuler la maîtrise.
4. **Réserver une dimension temporelle aux seules compétences de fluidité procédurale** (faits arithmétiques, manipulation algébrique), en s'inspirant du Standard Completion Time de Kumon [10] — ne pas étendre la pression temporelle aux tâches de raisonnement, où le WWC n'a trouvé aucune preuve solide que le modèle verrouillé par la vitesse construit une compréhension conceptuelle [11].
5. **Ne pas construire une économie de statut façon Prodigy.** Éviter les mécaniques où les utilisateurs payants obtiennent des cosmétiques visiblement supérieurs que voient leurs pairs non payants — exactement la forme d'une plainte formelle auprès de la FTC [15][16][17]. Si Math Challenge se monétise, garder les paliers premium orientés parents (rapports, profils supplémentaires, profondeur du tuteur), pas des symboles de statut orientés enfants.
6. **Construire au moins un parcours de problèmes sans mots/à texte minimal pour les 4-7 ans**, suivant le modèle JiJi de ST Math [24][25] — il ne nécessite aucune traduction et se lance dans les cinq langues à coût de localisation incrémental nul.
7. **Concevoir dès le premier jour une infrastructure de preuves**, idéalement de forme WWC. La plupart des produits passés en revue à forte réputation sur le marché (Brilliant, Matific, Mathletics) manquent de preuves d'efficacité indépendantes ; ceux qui peuvent formuler des affirmations de niveau école/district (DreamBox, ST Math) ont conçu la mesure tôt, pas après coup.
8. **Traiter le résultat nul de Khanmigo comme un avertissement contre la surenchère d'affirmations sur les tuteurs IA.** Une étude contrôlée n'a trouvé aucun avantage significatif par rapport à un simple moteur de recherche malgré une préférence subjective pour l'IA [3] ; valider le tuteur de Math Challenge sur les résultats, pas sur la satisfaction, avant de le commercialiser comme pédagogiquement supérieur.
9. **Concevoir des formats de problèmes qui résistent à la résolution triviale par photo.** Un solveur de devoirs par photo (la pile OCR+Gemini de Google) déjoue en quelques secondes tout problème symbolique/textuel statique [26] ; privilégier une interface interactive/manipulable (glisser, ordonner, construire, révélation en plusieurs étapes) pour les problèmes destinés à être raisonnés, pas recherchés.
10. **Éviter de lancer une matière adjacente comme une application autonome distincte.** L'adoption plus faible de Duolingo Math par rapport à ses matières sœurs, réintégré dans l'application phare en environ un an [28], plaide pour une seule PWA avec des modes thématiques par niveau/langue plutôt qu'une scission en applications séparées.
11. **Utiliser un programme en spirale, pas une échelle strictement linéaire**, suivant la conception modulaire/en spirale de Matific — les sujets resurgissent à difficulté croissante. Cela convient aux profils multi-niveaux gérés par les parents, où un enfant passant d'une bande de niveau à l'autre a besoin que les sujets antérieurs restent accessibles et retestables, pas archivés.
12. **Garder le « pourquoi » visible dans chaque interaction de notation**, comme le font par défaut Brilliant [7] et Khan Academy, et comme ST Math le montre par la conséquence directe d'un mauvais geste plutôt que par un verdict textuel [24]. L'état d'échec devrait enseigner, pas seulement marquer en rouge.
13. **Envisager un mode en direct/compétitif avec prudence.** La compétition en temps réel de Mathletics est un différenciateur, mais les méta-analyses sur la gamification montrent des effets importants mais très hétérogènes [32] — c'est la qualité d'exécution, pas la présence de compétition, qui détermine si cela aide ou ajoute de l'anxiété pour les apprenants moins confiants.
14. **Le vide de marché :** aucun produit passé en revue ne combine (a) une qualité de vrais problèmes digne de Brilliant, (b) un verrouillage de maîtrise incrémentale vérifiable digne de Kumon/IXL, (c) une conception indépendante de la langue digne de ST Math, et (d) un modèle économique qui ne met pas les enfants sous pression via un statut en jeu. Les produits ont de la qualité sans preuves (Brilliant), des preuves sans conception multilingue (DreamBox, ST Math), ou de l'engagement sans intégrité (Prodigy) — un produit revendiquant crédiblement les quatre à la fois dispose d'un vrai espace de positionnement.

## Questions ouvertes pour le porteur du projet

1. Math Challenge devrait-il s'engager, dès le premier jour, à une instrumentation permettant de soutenir une future étude d'efficacité de type WWC ou par comparaison appariée (même si l'étude elle-même est commanditée plus tard) ?
2. Le parcours de problèmes sans mots/spatial (inspiré de ST Math) doit-il être cadré uniquement pour les 4-7 ans, ou étendu comme un mode général de « raisonnement visuel » à travers les niveaux ?
3. Compte tenu du précédent Prodigy/FTC, Math Challenge devrait-il adopter une politique interne explicite interdisant entièrement la monétisation cosmétique orientée enfants, documentée dans `docs/wiki/decisions.md` comme un ADR, afin qu'aucune future proposition de fonctionnalité ne puisse la réintroduire sans une décision consciente de dérogation ?
4. Un mode compétitif en direct/temps réel (façon Mathletics) est-il prévu pour un jalon ultérieur, et si oui, le porteur du projet souhaite-t-il un verrouillage par niveau de confiance (par ex., des adversaires de niveau de compétence apparié seulement) pour atténuer le risque d'anxiété que signale la littérature sur la gamification pour les apprenants peu confiants ?
5. La fonctionnalité de tuteur IA devrait-elle explicitement éviter les affirmations de « gains d'apprentissage prouvés » dans les textes marketing tant que Math Challenge n'a pas mené sa propre étude de résultats, compte tenu du résultat nul de Khanmigo dans au moins une comparaison contrôlée ?

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
