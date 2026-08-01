# La menace du solveur : l'assistance mathématique par IA en 2026, et ce qui y résiste vraiment

> Recherche Math Challenge — 2026-07-31 — sujet 31

## Résumé exécutif (FR)

Toute tâche réductible à « un nombre final, envoyé sous forme de texte ou de
photo » est déjà résolue par la technologie disponible : les solveurs grand
public (Photomath, Symbolab, Mathway, Microsoft Math Solver, Gauth,
Wolfram|Alpha) renvoient une réponse détaillée par étapes en quelques secondes
pour presque tout le programme du primaire jusqu'au calcul universitaire
[4][5][6], et les assistants généralistes (GPT, Gemini, Claude) ont déjà
dépassé les mathématiques de compétition — l'AIME est considéré comme
« saturé » car les meilleurs modèles frôlent le maximum possible [12] — et en
juillet 2025, un système de Google DeepMind a atteint le niveau médaille d'or
aux Olympiades internationales de mathématiques (IMO) en opérant de bout en
bout en langage naturel, sans traduire le problème dans un langage formel
comme en 2024 [2][3]. La photo de l'écran brise presque toute défense interne
à l'application : elle ne touche jamais le DOM, le clavier ni l'API, si bien
qu'aucune mesure anti-copie ou limite de temps côté client ne peut la voir.
L'usage étudiant est déjà majoritaire et croît rapidement : 88 % des étudiants
de premier cycle britanniques ont utilisé l'IA générative pour des évaluations
en 2025, contre 53 % en 2024 [1] ; aux États-Unis, l'usage de ChatGPT pour les
devoirs scolaires chez les adolescents a doublé, passant de 13 % à 26 % en un
an, bien que les mathématiques restent l'usage que les adolescents eux-mêmes
jugent le moins acceptable (29 % pour, 28 % contre) [10]. Les détecteurs de
texte d'IA ne sont pas une échappatoire : ils sont contournables par simple
paraphrase et pénalisent de façon disproportionnée les personnes écrivant dans
une seconde langue [7][8] — ils ne doivent pas servir de portail punitif dans
une application bilingue. La défense qui tient n'est pas technique mais relève
de la conception de l'évaluation : demander le processus plutôt que la
réponse, demander de repérer l'erreur dans une solution d'autrui, exiger une
question de suivi adaptative avec des nombres différents, et utiliser des
tâches de manipulation interactive dont la réponse évaluée est un état
d'interface, pas une chaîne de texte copiable.

## Executive summary (EN)

Any math task reducible to "a single final number, submitted as text or a
photo" is already solved by tools students can access today: consumer solvers
(Photomath, Symbolab, Mathway, Microsoft Math Solver, Gauth, Wolfram|Alpha)
return a stepped solution in seconds across nearly the entire K-12-to-calculus
curriculum [4][5][6], and general assistants have moved past competition
math — AIME is now described by benchmark trackers as "saturated" because top
models sit near the ceiling [12] — and in July 2025 a Google DeepMind system
reached gold-medal standard at the IMO working end-to-end in natural language,
without the manual formalization into Lean its 2024 silver-medal predecessor
required [2][3]. A photo of the screen breaks nearly every in-app defense,
because it never touches the DOM, the keyboard, or the app's API — no
client-side anti-copy or timer can see it. Student use is already majority
behavior and rising fast: 88% of UK undergraduates used generative AI for
assessments in 2025, up from 53% in 2024 [1]; US teen ChatGPT-for-schoolwork
use doubled from 13% to 26% in a year, though teens rate math as the least
acceptable use case (29% approve, 28% disapprove) [10]. AI-text detectors are
not an escape hatch: they are evadable with simple paraphrasing and
systematically misclassify non-native-language writers [7][8] — unsuitable as
a punitive gate in a bilingual product. The defense that holds is assessment
design, not technology: ask for the process instead of the answer, ask the
student to find the error in someone else's worked solution, require an
adaptive follow-up with changed numbers, and use interactive manipulation
tasks whose graded output is a UI state, not a copyable string.

## Résultats

### 1. Solveurs mathématiques grand public : capacité et portée

Photomath combine un système de calcul formel avec de l'OCR (étendu à la
reconnaissance de l'écriture manuscrite depuis 2016) pour scanner un problème
imprimé ou manuscrit — y compris des problèmes énoncés en texte — et produire
une solution détaillée par étapes en quelques secondes, couvrant les
mathématiques « du primaire à l'université » : arithmétique, algèbre,
géométrie, trigonométrie, statistiques et calcul infinitésimal [4][5]. L'échelle
est massive : dès 2021, plus de 220 millions de téléchargements et environ 2,2
milliards de problèmes résolus par mois [4]. Symbolab annonce explicitement
accepter des « pages manuscrites et captures d'écran » en plus de la notation
tapée et des requêtes en langage naturel, couvrant du pré-algèbre au calcul
infinitésimal, la trigonométrie, la physique et les statistiques, en présentant
sa sortie comme détaillée par étapes plutôt que comme une simple réponse [6].
La force de Wolfram|Alpha réside dans le calcul symbolique/en forme close avec
une saisie libre — très solide en algèbre canonique, calcul infinitésimal et
résolution d'équations, historiquement plus faible sur les problèmes
nécessitant l'analyse sémantique d'un énoncé ambigu. Les applications
« caméra d'abord » comme Gauth (et Microsoft Math Solver, qui ajoute la
reconnaissance d'écriture manuscrite et le traçage de graphiques à un pipeline
OCR-plus-solveur similaire) suivent le même schéma : caméra en entrée, réponse
détaillée par étapes en sortie, en quelques secondes, plusieurs offrant en
plus un tchat de tuteur humain ou IA en direct pour tout ce que le solveur
automatique ne parvient pas à analyser proprement. Le point commun est que ces
outils sont les plus forts exactement là où les problèmes scolaires et
d'applications d'entraînement sont les plus faibles par nécessité de
conception : des problèmes uniques, bien posés, en forme close, avec une seule
réponse finale correcte.

### 2. Assistants d'IA généralistes : de l'AIME à l'or aux IMO

Les LLM de pointe ont traversé, puis dépassé, le palier des mathématiques de
compétition qui constituait autrefois un plafond significatif. L'AIME (un
examen olympique qualificatif américain) est désormais répertorié par au moins
un traceur de benchmarks comme un benchmark « archivé » ou saturé, car « la
performance sur ce benchmark a saturé » et les fournisseurs ont cessé de
soumettre leurs nouvelles versions à ce test, avec un score maximal de 98,12 %
enregistré pour Gemini 3.1 Pro Preview, et une note indiquant que neuf des dix
modèles les mieux classés du classement sont des modèles de raisonnement [12].
La génération de preuves en langage naturel de niveau compétition, la
frontière la plus difficile, a elle aussi reculé plus que prévu. En 2024,
AlphaProof et AlphaGeometry 2 de DeepMind ont atteint 28/42 points (niveau
médaille d'argent) aux IMO, mais seulement après que les problèmes ont été
traduits manuellement dans le langage formel Lean, et le problème le plus
difficile a nécessité jusqu'à trois jours de calcul [3]. Un an plus tard, en
juillet 2025, une version avancée de Gemini dotée de « Deep Think » a atteint
35/42 (niveau médaille d'or), résolvant parfaitement cinq des six problèmes,
de bout en bout en langage naturel — sans étape de formalisation — dans la
même limite de 4,5 heures par session que les compétiteurs humains [2].
L'examen des IMO eux-mêmes a confirmé que les solutions soumises étaient
« complètes et correctes », tout en précisant que « leur examen ne s'étend pas
à la validation de notre système, de nos processus ou du modèle sous-jacent »
[2] — ce sont des artefacts notés, pas des systèmes audités, et le résultat a
tout de même impliqué une curation humaine substantielle des données
d'entraînement et des indices généraux de résolution de problèmes [2]. OpenAI
a rapporté séparément des résultats comparables de niveau médaille d'or pour
un modèle expérimental sur la même période, bien que non soumis au même
processus de coordination officiel des IMO ; il faut traiter cette annonce
comme directionnellement cohérente avec le résultat vérifié de DeepMind,
plutôt que comme un score audité de façon indépendante. Là où les modèles
généralistes échouent encore, c'est sur la véritable frontière de la
recherche : FrontierMath d'Epoch AI puise ses problèmes auprès de
mathématiciens professionnels en théorie des nombres, analyse réelle,
géométrie algébrique et théorie des catégories, des problèmes qui prennent
chacun plusieurs heures à des experts, avec une tranche supérieure « Tier 4 »
demandant plusieurs jours d'effort expert — conçu pour continuer à tester les
systèmes de pointe à mesure que les benchmarks plus faciles saturent [11].
C'est bien au-dessus de tout ce qu'une application d'entraînement du primaire
à l'université assignerait, mais cela compte pour l'ambition de Math Challenge
d'atteindre un contenu de niveau doctorat : quelque part entre « série
d'exercices difficile » et « problème de recherche ouvert », les solveurs
cessent d'être fiables, et cette frontière mérite d'être connue précisément
avant de concevoir le contenu du plus haut niveau.

### 3. La capture d'écran multimodale vers la réponse : pourquoi les caméras déjouent les défenses internes à l'application

Le mécanisme qui rend la plupart des défenses anti-triche internes à
l'application non pertinentes est simple : une photographie d'écran est un
canal hors bande. Elle n'entre jamais dans le DOM de l'application, ne
déclenche jamais d'événement clavier ou de collage, ne touche jamais ses
requêtes réseau, et est invisible à toute défense de niveau JavaScript
(désactivation du copier-coller, obscurcissement du code source, flou lors du
changement d'onglet, filigrane, même la plupart des surveillances intégrées au
navigateur). La photo quitte l'appareil par la caméra puis via une deuxième
application ou un deuxième appareil — une surface que l'application
d'entraînement ne peut absolument pas instrumenter. Chaque solveur grand
public mentionné ci-dessus est construit exactement autour de ce flux de
travail — caméra en entrée, réponse détaillée par étapes en sortie, en
quelques secondes [4][5][6]. La nouveauté de 2026 est que cela ne nécessite
plus une étape discrète « photo, attente de l'OCR » : les assistants
multimodaux en direct (partage d'écran ou modes caméra/vision continus chez
GPT, Gemini et des produits comparables) permettent à un élève de partager son
écran en temps réel et d'obtenir une réponse parlée sur le ton de la
conversation, y compris la narration de ce qu'il faut faire ensuite — lisant
un problème sur un écran mobile ou partiellement obscurci, en pleine
interaction. Aucune défense purement côté client ou purement basée sur le
temps n'est durable à elle seule ; les deux réponses qui ne dépendent pas de
« l'élève peut-il faire sortir une photo » sont (a) exiger un artefact soumis
qui n'est pas une chaîne unique et reproductible — un processus, un état de
manipulation d'interface, un dialogue — et (b) rendre un aller-retour externe
plus coûteux, cumulativement, que les points qu'il rapporte, via la
re-interrogation adaptative (§6 et les implications de conception ci-dessous).

### 4. L'ampleur déjà réelle de l'usage de l'IA chez les élèves

Ce n'est pas un comportement marginal. L'enquête de décembre 2024 de HEPI
auprès de 1 041 étudiants britanniques de premier cycle à temps plein (menée
par Savanta) a trouvé que 92 % avaient utilisé un outil d'IA quelconque et
88 % avaient utilisé l'IA générative spécifiquement pour des évaluations, en
forte hausse par rapport aux 53 % de l'année précédente ; le gain de temps
(51 %) et l'amélioration perçue de la qualité (50 %) arrivaient en tête des
motivations déclarées, tandis que la crainte d'être accusé de triche (53 %) et
le risque d'hallucination (51 %) étaient les principaux facteurs dissuasifs —
pas un manque de capacité ou de connaissance [1]. La publication de janvier
2025 du Pew Research Center (Ipsos, sept.-oct. 2024, n=1 391 adolescents
américains de 13 à 17 ans) a trouvé que 26 % avaient utilisé ChatGPT pour
leurs devoirs, soit le double des 13 % enregistrés en 2023 — et le jugement
des adolescents sur ce qui est acceptable varie fortement selon la tâche :
54 % jugent cela acceptable pour rechercher un sujet, mais seulement 29 % pour
résoudre des problèmes de mathématiques (28 % jugent cela inacceptable), et
18 % pour rédiger des dissertations [10]. Cette asymétrie compte ici : les
mathématiques sont la matière sur laquelle les élèves eux-mêmes sont le plus
partagés, une véritable ouverture pour un produit dont les surfaces notées ou
classées peuvent revendiquer de manière crédible de résister à l'usage
occasionnel de solveurs. L'usage chez les personnes ayant déjà accès à l'IA
penche vers la recherche directe de réponses : l'analyse d'Anthropic sur
environ 575 000 conversations académiques sur Claude.ai a trouvé
l'informatique et les STEM fortement surreprésentées par rapport aux
inscriptions (l'informatique seule représentant 36,8 % des conversations
contre 5,4 % des diplômes américains), et près de la moitié (~47 %) des
conversations étaient « directes » — recherchant une réponse ou un contenu
fini avec peu d'allers-retours [9]. La répartition des tâches penchait vers un
travail d'ordre supérieur (Créer 39,8 %, Analyser 30,2 %) et s'éloignait du
rappel (Se souvenir 1,8 %) [9], cohérent avec un réflexe « laisser l'outil
raisonner, je prends le résultat » — précisément le comportement qu'une
application d'entraînement doit rendre non gratifiant.

### 5. L'échec des détecteurs de texte d'IA, et ce que cela implique

Deux axes de recherche publiée sapent l'idée qu'un détecteur puisse filtrer la
triche de manière fiable. D'abord, les détecteurs sont manifestement biaisés :
des études sur les détecteurs de type GPT trouvent qu'ils « classent
systématiquement à tort les échantillons d'écriture en anglais non natif comme
générés par l'IA, tandis que les échantillons d'écriture native sont
correctement identifiés », et les mêmes stratégies simples de formulation de
prompt qui réduisent ce biais permettent aussi à un utilisateur d'échapper
totalement à la détection — le même levier joue dans les deux sens [7].
Ensuite, les détecteurs sont fragiles face à l'évasion adversariale en
général : une recherche testant la détection contre des textes de ChatGPT et
de Claude a trouvé que la paraphrase, l'espacement aléatoire et les
perturbations adversariales « peuvent diminuer significativement l'efficacité
de la détection », concluant que les méthodes actuelles manquent de robustesse
même face à une évasion peu sophistiquée [8]. L'implication ici est directe :
tout champ « explique ton raisonnement » ne peut pas utiliser en toute
sécurité un détecteur d'IA comme filtre automatique de réussite/échec — cela
serait trivialement contournable et risquerait de signaler de façon
disproportionnée du travail authentique venant d'élèves hispanophones ou
d'autres non-natifs, dans un produit dont les exigences mêmes imposent une UX
bilingue. La détection, là où elle est utilisée, doit rester un signal souple
alimentant une révision humaine, jamais un blocage automatique.

### 6. Les réponses de conception qui survivent réellement au contact d'un solveur

Le fil conducteur de toute mesure d'atténuation qui tient est le même : cesser
de noter un artefact final unique et reproductible, et commencer à noter
quelque chose qu'un solveur ne peut pas remettre en une seule fois — un
processus avec des étapes intermédiaires notées, un jugement sur le travail
d'autrui, un suivi adaptatif en direct, ou un état d'interface manipulé. Rien
de tout cela ne rend un élève déterminé totalement résistant au solveur ; cela
augmente le nombre d'allers-retours, le travail de traduction et le coût en
temps par point gagné — le seul levier qu'une PWA en libre-service contrôle
réellement. Le tableau et les implications de conception ci-dessous
transforment cela en un catalogue de construction concret.

## Ce qui survit à un solveur

| Format d'item | Facilité avec laquelle un solveur le déjoue | Notabilité |
|---|---|---|
| Réponse finale simple (« résoudre pour x ») | Trivial — en quelques secondes, taux de réussite quasi total [4][5][6] | Entièrement notable automatiquement ; format le plus faible |
| Problème en texte à une seule étape | Facile pour les LLM multimodaux ; solveurs OCR seuls plus faibles mais rattrapent leur retard | Notable automatiquement avec un analyseur |
| Problème en texte à plusieurs étapes, sous-quantités nommées | Toujours déjoué, mais exige de retranscrire tout le problème | Notable automatiquement par étape ; friction, pas immunité |
| « Montre ton travail » / processus complet | Le solveur génère un processus complet à copier mot pour mot | Nécessite une notation humaine/IA ; texte copié pas détectable de façon fiable [7][8] |
| « Repère l'erreur dans cette solution » | Plus difficile — le solveur doit évaluer un argument, pas seulement en produire un | Notable automatiquement (quelle ligne, quelle erreur) |
| Estimation / ordre de grandeur seulement | Faible isolément — une réponse exacte de solveur satisfait trivialement une vérification de plage | Facile à noter automatiquement ; à combiner avec une justification |
| Manipulation interactive (glisser un point, construire un graphique, équilibrer une équation) | Le solveur peut décrire la cible, mais réaliser l'action d'interface exige encore l'élève | Notée sur l'état final de l'interface, pas sur une chaîne de texte |
| Réponses multiples/tout sélectionner, distracteurs de conception erronée | Modéré — la résolution brute force donne l'ensemble, mais des distracteurs ciblés affaiblissent le raccourci | Entièrement notable automatiquement |
| Suivi adaptatif (nouveaux nombres, même méthode) | Fort — capte « a répondu une fois » vs. « peut répéter » ; déjoué seulement en re-interrogeant à chaque fois | Notable automatiquement, entièrement contrôlé par l'application |
| Dialogue de tuteur socratique intégré à l'application | Fort face aux captures d'écran statiques ; se dégrade si du texte de solveur est collé | Nécessite son propre correcteur — la même course aux armements, un niveau plus haut |
| Défense orale en direct / vérification synchrone | Très fort | Nécessite du personnel/une infrastructure en direct ; peu adapté à une PWA en libre-service |
| Preuve originale/inédite de niveau recherche | Résiste aux solveurs et aux LLM généralistes à la véritable frontière [11][2][3] | Non notable à grande échelle ; révision par des experts uniquement |

## Implications de conception

1. Format par défaut d'indice/défi : montrer une solution détaillée avec une
   étape erronée, demander quelle ligne et pourquoi — évaluer un argument
   vaut mieux qu'en produire un.
2. Remplacer la case de réponse unique par un processus structuré à plusieurs
   champs (chaque opération plus son résultat intermédiaire), noté par étape,
   de sorte qu'une réponse finale copiée sans les étapes correspondantes
   échoue automatiquement.
3. Re-interrogation adaptative obligatoire : faire suivre une réponse correcte
   immédiatement d'un problème isomorphe (même méthode, nouveaux nombres) ;
   « juste une fois, faux sur la variante » est un signal réel, en particulier
   dans les modes classés/tableau de bord.
4. Items à réponses multiples/tout sélectionner avec des distracteurs
   construits à partir d'erreurs de conception documentées et propres au
   sujet, pas des « nombres proches » génériques, de sorte que la résolution
   brute force soit un raccourci plus faible vers l'ensemble correct complet.
5. Verrouiller les questions à valeur exacte derrière une étape d'estimation
   préalable (noter une plage ou une réponse d'ordre de grandeur avant de
   révéler la question précise), récompensant un sens du nombre dont un
   solveur n'a pas besoin.
6. Manipulables interactifs — glisser un point sur une droite numérique,
   placer des points pour construire un graphique, déplacer des termes pour
   équilibrer une équation — notés sur l'état résultant de l'interface, pas
   sur un nombre tapé : le seul format qu'un solveur ne peut pas restituer
   comme une chaîne copiable, même quand il peut en décrire la réponse.
7. Tchat de tuteur socratique intégré à l'application comme voie principale
   de demande d'aide, de sorte que demander de l'aide produise un dialogue
   noté plutôt qu'une chaîne extractible par capture d'écran ; noter en
   partie sur la cohérence et la spécificité des tours de parole propres à
   l'élève.
8. Un court champ « explique-le avec tes propres mots » avant qu'une réponse
   ne soit acceptée ; n'utiliser un éventuel signal de texte d'IA que comme
   un drapeau souple pour révision humaine, jamais comme un blocage
   automatique, étant donné le biais des détecteurs contre les non-natifs et
   leur contournabilité par paraphrase [7][8].
9. Des budgets de temps en mode classé assez courts pour qu'un aller-retour
   externe complet (photographie, OCR/résolution, recopie) coûte plus cher
   que de résoudre directement ; le mode pratique non chronométré reste la
   surface ouvertement peu contraignante et non compétitive.
10. Randomiser les paramètres numériques côté serveur par élève/tentative, de
    sorte qu'une capture d'écran, une clé de réponses partagée ou un résultat
    web mis en cache ne se transfère pas vers un item identique d'un autre
    élève.
11. Pondérer la notation vers la constance sur de nombreux petits items
    (séries, portfolios) plutôt que sur des items uniques à haute valeur,
    réduisant le gain à résoudre un seul item via une aide extérieure.
12. Une auto-évaluation de confiance (1-5) accompagnant chaque réponse ; une
    confiance élevée mal calibrée avec un raisonnement discordant est un
    signal utile et non punitif.
13. Diviser le discours d'intégrité par mode : le mode pratique ne revendique
    aucune résistance au solveur ; le mode classé/tableau de bord concentre
    les suivis adaptatifs, la notation de processus et les minuteurs courts,
    puisque c'est la surface dont l'intégrité compte pour les autres
    utilisateurs.
14. Router les items « produis une preuve inédite » de niveau doctorat vers une
    révision humaine ou par les pairs asynchrone plutôt qu'une notation
    automatique — le seul format qui résiste encore aux solveurs grand public
    et aux modèles de pointe [11][2][3], et le seul format que personne ne
    peut noter automatiquement à grande échelle.

**Ce que nous ne pouvons pas empêcher, dit clairement :** toute tâche
entièrement spécifiable comme du texte simple ou une image unique avec une
seule réponse finale vérifiable, soumise sans processus ni suivi obligatoire,
sera résolue en quelques secondes par des outils déjà largement utilisés par
les élèves — parce que le canal de la photo ou de la vision en direct ne
touche jamais l'application. Les assistants multimodaux en direct érodent
encore davantage les défenses fondées sur la pression temporelle, puisqu'un
élève peut obtenir un guidage parlé pendant que l'écran reste visible, au lieu
de faire l'aller-retour d'une capture d'écran statique. Aucun portail fondé
sur un détecteur n'est sûr à utiliser de façon punitive. Rien de tout cela ne
se corrige par l'ingénierie ; on ne peut que le rendre moins gratifiant (pas
la surface notée) ou plus coûteux par point (conception adaptative). Une
affirmation contraire relève du marketing, pas d'un fait.

## Questions ouvertes pour le propriétaire du projet

1. Les modes classés/tableau de bord devraient-ils imposer un plafond de
   temps strict par item, plus court qu'un aller-retour photo-et-résolution
   typique — et quel aménagement existe pour les élèves ayant réellement
   besoin de plus de temps ?
2. Quelle part de la feuille de route va à un tuteur socratique interne
   (coût de son propre LLM, modération, latence) par rapport à une
   conception d'items adaptatifs et de notation de processus sans composante
   générative du tout ?
3. Le produit devrait-il jamais utiliser des signaux de similarité de texte
   d'IA dans un contexte bilingue EN/ES, étant donné le biais documenté des
   détecteurs contre les non-natifs — ou ce type de vérification est-il
   exclu par principe ?
4. Pour le contenu de niveau doctorat, la révision manuelle/par les pairs de
   preuves ouvertes est-elle envisagée, ou le niveau le plus élevé reste-t-il
   confiné à des formats notables automatiquement (critique de preuve,
   repérage d'erreur), même si cela plafonne à quel point ce niveau peut
   être « doctorat » ?
5. Le mode pratique devrait-il autoriser explicitement l'usage d'outils
   externes comme choix de conception assumé, recentrant le discours
   d'intégrité sur le mode classé et la maîtrise dans la durée, plutôt que de
   laisser entendre que les réponses en mode pratique résistent au solveur
   alors qu'elles ne le peuvent structurellement pas ?

## Sources

1. HEPI, "Student Generative AI Survey 2025" — https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/
2. Google DeepMind, "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the International Mathematical Olympiad" — https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/
3. Google DeepMind, "AI solves IMO problems at silver medal level" — https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/
4. Wikipedia, "Photomath" — https://en.wikipedia.org/wiki/Photomath
5. Photomath, official product site — https://photomath.com/en/
6. Symbolab, official product site — https://es.symbolab.com/
7. Liang et al., "GPT detectors are biased against non-native English writers," arXiv:2304.02819 — https://arxiv.org/abs/2304.02819
8. "MGTBench: Benchmarking Machine-Generated Text Detection," arXiv:2303.14822 — https://arxiv.org/abs/2303.14822
9. Anthropic, "Anthropic Education Report: How University Students Use Claude" — https://www.anthropic.com/news/anthropic-education-report-how-university-students-use-claude
10. Pew Research Center, "About a quarter of U.S. teens have used ChatGPT for schoolwork — double the share in 2023" — https://www.pewresearch.org/short-reads/2025/01/15/about-a-quarter-of-us-teens-have-used-chatgpt-for-schoolwork-double-the-share-in-2023/
11. Epoch AI, "FrontierMath" benchmark page — https://epoch.ai/benchmarks/frontiermath
12. Vals AI, AIME benchmark leaderboard — https://www.vals.ai/benchmarks/aime
13. Wolfram|Alpha, official "About" page — https://www.wolframalpha.com/about
14. Microsoft Education, product overview (Math Solver context) — https://www.microsoft.com/en-us/education/products/math-solver
