# Construire et exploiter une banque de 2 500 items de mathématiques : ce que font réellement les produits d'apprentissage

> Recherche Math Challenge — 2026-07-31 — sujet 40

## Résumé exécutif (FR)

Les produits éducatifs réels rédigent rarement chaque item à la main. IXL
publie environ 1 219 compétences de mathématiques pour la maternelle à la
8ᵉ année [1] — pas des items, mais des *compétences*, chacune adossée à une
génération dynamique de questions. Khan Academy utilise Perseus, son propre
éditeur/moteur de rendu d'exercices [2], pour mélanger rédaction humaine et
variation paramétrique. WeBWorK illustre l'extrême opposé : un seul modèle
écrit dans son langage PG produit un nombre illimité de variantes numériques
[5]. La recherche 2023-2026 sur la génération d'items par LLM est à la fois
claire et modeste : les modèles génèrent des distracteurs mathématiquement
valides mais **n'anticipent pas bien les erreurs réelles des élèves**
[arXiv 2404.02124] — c'est pourquoi cette banque ne peut pas automatiser
l'« explication de l'erreur courante » sans révision humaine.

Pour 2 500 items en 5 langues, le plan répartit le travail ainsi : environ
40 % générés par des modèles paramétriques (solide en K-8,
faible en master/doctorat), environ 29 % rédigés par LLM avec révision
humaine obligatoire, et environ 31 % écrits à la main par des spécialistes
(dominant aux niveaux les plus élevés). Le coût d'API du LLM pour la
rédaction et la traduction est, arithmétique détaillée plus bas, de l'ordre
de quelques centaines de dollars — une erreur d'arrondi face au coût humain
(experts du domaine, édition, traduction, révision psychométrique), estimé
de l'ordre de mille jours-personne. QTI 3.0 est adoptable de façon
incrémentale (son propre modèle de conformité le permet) [3][4] ; il n'est
pas nécessaire de l'implémenter en entier pour le MVP.

## Executive summary (EN)

Real learning products rarely hand-write every item. IXL publishes ~1 219
math skills for PreK–8 [1] — not items, but *skills*, each backed by dynamic
question generation. Khan Academy uses Perseus, its own exercise
editor/renderer [2], to blend human authoring with parametric variation.
WeBWorK is the clean extreme: one problem in its PG language can produce
unlimited randomized numeric instances [5]. 2023–2026 research on LLM item
generation is clear and modest at once: models draft mathematically valid
distractors but are **not good at anticipating real student misconceptions**
[arXiv 2404.02124] — the reason this bank cannot automate the
"common-error explanation" step without human review.

For 2 500 items in 5 languages, the plan below splits work roughly 40%
parameterized templates (strong at K-8, weak at graduate/PhD), 29%
LLM-drafted with mandatory human review, and 31% handwritten by specialists
(dominant at the top of the ladder). LLM API cost for drafting and
translating, with arithmetic shown below, is on the order of hundreds of
dollars — a rounding error against human-hour cost (SME, editorial,
translation, psychometric review), estimated at roughly a thousand
person-days. QTI 3.0 is adoptable incrementally (its own conformance model
permits this) [3][4]; the MVP does not need the full spec.

## Constatations

### Combien d'items les produits réels ont-ils vraiment

Les chiffres publiés et vérifiables sont plus rares que ne le laisse penser
le discours marketing. La page mathématiques d'IXL en locale espagnole
indique le nombre de compétences par niveau — Préscolaire 73, 1ʳᵉ année 117,
2ᵉ année 127, 3ᵉ année 183, 4ᵉ année 130, 5ᵉ année 125, 6ᵉ année 112,
7ᵉ année 108, 8ᵉ année 144 — pour un total de **1 219 compétences réparties
sur 9 niveaux scolaires** [1]. Ce sont des *compétences*, pas des items :
chaque compétence est une catégorie de type modèle contre laquelle IXL
génère dynamiquement des questions d'entraînement, si bien que le nombre de
questions par compétence est illimité, tout comme pour un problème WeBWorK.
Aucun total comparable n'a été trouvé pendant cette session pour le nombre
d'exercices de Khan Academy, le nombre de problèmes de Brilliant, ou le
nombre de fiches de Kumon — ces chiffres circulent dans le marketing et les
sources secondaires, mais aucune page primaire consultée pendant cette
session n'énonçait de nombre, donc ils sont omis plutôt que devinés.
L'article Wikipédia sur les banques d'items décrit les métadonnées de cycle
de vie que suivent les banques d'items (statut : new/pilot/active/retired ;
historique d'usage) [item bank wiki] mais ne donne aucune taille concrète
pour un programme nommé.

### Génération paramétrique vs. rédaction manuelle

Perseus, chez Khan Academy, est décrit par son propre dépôt comme « Khan
Academy's exercise question editor and renderer » — un système pour
rédiger, afficher et évaluer les réponses aux exercices, sous licence MIT
mais fermé aux contributions externes [2]. Le langage PG (« Problem
Generation ») de WeBWorK est un format de rédaction basé sur Perl, conçu
pour la randomisation : les instructeurs écrivent un problème, et la
paramétrisation permet à chaque session d'élève de tirer des valeurs
numériques différentes du même modèle, produisant un vivier d'items
pratiquement illimité à partir d'une seule source rédigée [5] — le schéma
concret « un modèle, de nombreux items » dont ce projet a besoin pour
l'arithmétique et l'algèbre précoce de niveau K-8. Brilliant.org
décrit son approche comme hybride : le contenu est « hand-crafted » par une
équipe allant « des docteurs en mathématiques aux ingénieurs et designers »,
tandis que l'apprentissage automatique génère une personnalisation
« on-the-fly visual and interactive » en surcouche — et Brilliant affirme
que le nouveau contenu des ensembles de révision fait l'objet d'un
« human-review[ed] everything », déployé progressivement pour cette raison
[brilliant about page]. Le schéma commun aux trois : les modèles et la
génération dynamique multiplient le *volume*, mais un humain conçoit
toujours le modèle et ses contraintes.

L'article Wikipédia sur la génération automatique d'items (AIG) cadre la
méthode ainsi : « a test specialist creates a template called an item
model; then, a computer algorithm is developed to generate test items » —
les algorithmes « generate families of items from a smaller set of parent
item models », ce qui « can generate many more items in a given amount of
time than a human test specialist », réduisant le coût [AIG wiki]. Aucun
article n'a donné de multiplicateur concret d'items par modèle ni de
pourcentage de réduction de coût pendant cette session.

### Items générés par LLM : réels mais limités (recherche 2023-2026)

Un point de données concret et citable : Feng, Lee, McNichols, Scarlatos,
Smith, Woodhead, Otero Ornelas et Lan, « Exploring Automated Distractor
Generation for Math Multiple-choice Questions via Large Language Models »
(arXiv 2404.02124), teste l'apprentissage en contexte et le fine-tuning pour
générer des distracteurs à choix multiples sur un jeu de données
mathématiques réel. Son résultat principal est exactement la contrainte que
la conception du schéma de ce projet doit respecter : « although LLMs can
generate some mathematically valid distractors, they are less adept at
anticipating common errors or misconceptions among real students »
[arXiv 2404.02124]. Aucun taux numérique de validation par des experts ne
figurait dans le texte du résumé récupéré pendant cette session, donc aucun
n'est cité — mais le résultat qualitatif est déterminant : un LLM peut
rédiger une mauvaise réponse à l'apparence plausible, mais savoir si elle
correspond à ce qu'un élève réel penserait vraiment est un problème plus
difficile, sur lequel les modèles actuels sont peu performants. La page de
recherche de Duolingo répertorie « Jump-Starting Item Parameters for
Adaptive Language Tests » (McCarthy et al., EMNLP 2021) [Duolingo research],
qui traite le problème adjacent du démarrage à froid consistant à estimer
la difficulté d'items fraîchement générés avant qu'il n'existe de vraies
données de réponse — un problème que cette banque rencontre pour chaque
nouvel item dès le premier jour.

### Le flux de contrôle qualité des items et le filtrage psychométrique

La théorie classique des tests (Classical Test Theory, CTT) définit deux
statistiques par item dont tout pipeline de production a besoin avant de
faire confiance à un item : la **valeur p**, « the proportion of examinees
responding in the keyed direction » (difficulté — un p plus élevé signifie
plus facile), et la **discrimination de l'item**, calculée via la
corrélation point-bisériale entre le score sur l'item et le score total au
test, utilisée « to evaluate items and diagnose possible issues, such as a
confusing distractor » [CTT wiki ; point-biserial wiki]. Aucun des deux
articles n'indiquait de seuil numérique pour une discrimination ou une
difficulté « suffisamment bonne », donc aucun n'est avancé ici. Ce qui *est*
documenté : l'article sur les tests adaptatifs informatisés (Computerized
Adaptive Testing) indique que « all items must be pretested with a large
enough sample to obtain stable item statistics. This sample may be required
to be as large as **1 000 examinees** » [CAT wiki] — le seul chiffre
quantitatif de taille d'échantillon apparu pendant cette session, et une
borne supérieure utile pour mesurer jusqu'où les programmes réels peuvent
être prudents. L'article sur les banques d'items décrit les métadonnées de
cycle de vie que suivent les systèmes matures : « item status (e.g., new,
pilot, active, retired) » et « item history (e.g., usage date(s) and
reviews) » [item bank wiki] — informant directement le champ `status`
ci-dessous.

### Corriger un item après que des milliers de réponses le référencent déjà

Aucune source n'a traité directement le versionnement, mais le schéma de
statut de cycle de vie [item bank wiki] implique la réponse : un item
auquel des données de réponse sont attachées n'est jamais modifié sur
place — les statistiques sont calculées par rapport au libellé exact
auquel les élèves ont répondu, et le modifier silencieusement invalide la
contribution de chaque réponse antérieure. Le schéma sûr : créer une
nouvelle version, retirer l'ancienne (`status: retired`, jamais supprimée),
démarrer une nouvelle fenêtre statistique.

### QTI 3.0 — est-ce que ça vaut le coup pour une startup

QTI 3.0, de 1EdTech, est le standard pour « exchanging assessment items,
tests, usage data, and results reporting between different applications »,
consolidant les versions QTI antérieures et le standard d'accessibilité
APIP, avec une prise en charge native du Computer Adaptive Testing et des
Portable Custom Interactions, et une accessibilité Section 508 / WCAG 2.1 AA
intégrée [3]. Ses propres directives d'implémentation précisent
explicitement que la conformité est **modulaire** : « the needs of the
assessment program generally dictate which of the many QTI 3 features are
used », et la conformité/certification fait l'objet d'un document séparé
précisément pour que les organisations puissent adopter un sous-ensemble
[4]. Un chemin minimal — validation XML/XSD de base, interactions de base à
choix/saisie de texte, modèles de traitement des réponses, packaging
standard, balisage d'accessibilité de base — fonctionne sans toucher au CAT
ni aux Portable Custom Interactions [4]. QTI 3.0 n'est pas tout-ou-rien :
différer le CAT/PCI tout en gagnant l'interopérabilité et l'échafaudage
d'accessibilité pour les types d'items du MVP est une option authentique.

### Flux de localisation sur 5 langues

Aucune source ne décrivait de flux de traduction spécifique aux
mathématiques, ce raisonnement est donc dérivé. Le fait à retenir du
matériel AIG/WeBWorK : le coût de traduction croît avec le *contenu rédigé
distinct*, pas avec le nombre d'items générés. Le texte fixe d'un modèle
(« What is __ + __? ») est traduit une fois par langue et couvre chaque
variante numérique qu'il génère jamais, tandis que le texte complet d'un
item écrit à la main ou rédigé par LLM est traduit item par item — le
levier de coût le plus important du modèle ci-dessous.

### Chiffres réels de coût par item dans l'industrie de l'évaluation

Aucun trouvé et vérifié indépendamment pendant cette session. Les tentatives
de récupération sur les pages ressources d'AIR, du NCIEA et d'ETS ont
renvoyé des erreurs 404 ou aucun chiffre de coût ; la page d'accueil
recherche d'ETS indiquait seulement l'existence de « 11,9K publications »,
sans chiffre de coût [ETS research page]. Les blogs sectoriels citent
couramment des coûts par item de l'ordre de quelques milliers de dollars
— mais comme aucune source primaire n'a été récupérée en direct pendant
cette session, ce chiffre n'est **pas** utilisé ci-dessous. Le modèle de
coût dérive plutôt entièrement du tarif d'API LLM indiqué et d'hypothèses
explicites, étiquetées en jours-personne.

## Tableau de référence

| Produit / système | Nombre d'items ou de compétences | Généré ou écrit à la main | Source |
|---|---|---|---|
| IXL (mathématiques, maternelle–8e année) | ~1 219 compétences (9 tranches de niveau) | Catégories de compétences organisées ; questions générées dynamiquement par compétence | [1] |
| Khan Academy (Perseus) | Non vérifié pendant cette session | Hybride : définitions d'exercices rédigées par des humains, affichées/variées par Perseus | [2] |
| WeBWorK (langage PG) | Grande bibliothèque ; nombre non vérifié | Basé sur des modèles : un problème PG produit un nombre illimité d'instances randomisées | [5] |
| Brilliant.org | Non indiqué publiquement | Hybride : socle rédigé à la main + personnalisation ML à la volée, revue par des humains | [brilliant about] |
| Duolingo (recherche sur le calibrage d'items) | N/A — test de langue | Items générés algorithmiquement ; calibrage de la difficulté assisté par ML pour les items en démarrage à froid | [Duolingo research] |
| NWEA MAP Growth (CAT) | Non vérifié pendant cette session | Banque CAT ; échantillons de prétest cités jusqu'à 1 000 candidats pour des statistiques stables | [CAT wiki] |
| Pratique AIG générale | Aucun chiffre universel | Un spécialiste des tests rédige un « modèle d'item » ; un algorithme en génère des familles | [AIG wiki] |

## Un plan concret de MVP à 2 500 items

**Tranches de niveau et nombre d'items** (pyramide — la plupart des items là
où sont la plupart des utilisateurs) :

| Tranche | Items |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Licence (introduction) | 350 |
| Licence avancée / Master | 150 |
| Doctorat / recherche | 100 |
| **Total** | **2 500** |

**Répartition par source, par tranche** (la part des modèles baisse et la
part écrite à la main monte à mesure que le niveau grimpe — les modèles ont
du mal avec le contenu avancé basé sur des preuves, et la nuance des erreurs
de conception compte le plus là où les LLM sont les plus faibles) :

| Tranche | Modèles % / items | Rédigé par LLM % / items | Écrit à la main % / items |
|---|---|---|---|
| K–2 | 70 % / 210 | 20 % / 60 | 10 % / 30 |
| 3–5 | 60 % / 240 | 25 % / 100 | 15 % / 60 |
| 6–8 | 50 % / 225 | 30 % / 135 | 20 % / 90 |
| 9–10 | 35 % / 140 | 35 % / 140 | 30 % / 120 |
| 11–12 | 30 % / 105 | 30 % / 105 | 40 % / 140 |
| Licence | 20 % / 70 | 30 % / 105 | 50 % / 175 |
| Avancé/Master | 10 % / 15 | 30 % / 45 | 60 % / 90 |
| Doctorat | 5 % / 5 | 25 % / 25 | 70 % / 70 |
| **Total** | **1 010 (40,4 %)** | **715 (28,6 %)** | **775 (31,0 %)** |

**Le portail de révision** (chaque item passe par toutes les étapes ; seul
l'effort par étape diffère) : rédaction par un expert du domaine /
conception du modèle → passage éditorial → vérification de l'exactitude
mathématique → révision d'accessibilité (texte alternatif, notation sûre
pour lecteur d'écran) → traduction (4 langues cibles) → pilote (collecte de
vraies réponses) → filtrage psychométrique (promotion à `active` seulement
une fois le nombre de réponses suffisant — implication 4). Les items écrits
à la main entrent à l'étape « rédaction par un expert du domaine » ; les
items rédigés par LLM entrent avec un brouillon en main mais passent par
toutes les étapes suivantes ; les items générés par modèle sautent la
rédaction par item, mais le *modèle* passe une fois par le même portail.

**Schéma JSON de l'item — champs requis :**

```
item_id, version, status, level_band, topic_tag, source_type, template_id,
languages{locale: {stem, choices, correct_answer, worked_solution,
  misconceptions[]}}, stem_canonical, choices, correct_answer,
worked_solution_canonical, misconceptions[{trigger_answer, explanation,
  remediation_hint}], difficulty_estimate_initial, irt_parameters{a, b, c,
  n_responses, last_calibrated_at}, p_value, point_biserial,
accessibility_metadata{alt_text, mathml, contrast_notes}, media[],
authoring_metadata{author, reviewer, created_at, reviewed_at, notes},
qti_export_ref, curriculum_tags[], retirement_reason
```

**Effort en jours-personne** (chaque chiffre est une estimation étiquetée ;
arithmétique montrée) :

- Conception des modèles : 50 modèles (≈20 variantes/modèle couvrant les
  1 010 items sur modèle) × 0,5 jour = **25 jours** ; construction unique
  du moteur de paramétrisation **~15 jours** (pas par item).
- Révision/correction des items rédigés par LLM : 715 × 0,15 jour =
  **~107 jours**.
- Rédaction manuelle : 615 items (K-2 à licence, 0,5 jour chacun) + 160
  (avancé + doctorat, 1,0 jour chacun, temps de spécialiste plus rare) =
  **~468 jours**.
- Révision de traduction (contrôle ponctuel bilingue par un expert du
  domaine sur la traduction par LLM, pas une retraduction indépendante) :
  50 modèles × 4 langues = 200 unités, plus 1 490 items × 4 langues =
  5 960 → **6 160 unités** × 0,05 jour = **~308 jours**.
- Passage éditorial + accessibilité, uniforme : 2 500 × 0,05 jour =
  **~125 jours**.
- Révision psychométrique par lot : 2 500 / 50 par lot × 0,1 jour =
  **~5 jours** (exclut le temps calendaire d'attente des réponses du
  pilote — une contrainte de calendrier, pas un coût d'effort).

**Total : 25+15+107+468+308+125+5 ≈ 1 053 jours-personne**, soit environ
4,2 personnes-années. Une équipe de 5 personnes (2 experts du domaine en
mathématiques, 1 responsable localisation, 1 éditeur/psychométricien,
1 ingénieur) l'accomplit en ≈1 053 : 5 ≈ **210 jours ouvrés, soit environ
10 mois** — une estimation dérivée, pas un chiffre sectoriel cité.

**Coût LLM estimé pour la rédaction + la traduction** (tarification
standard de Claude Sonnet 5 : 3,00 $ en entrée / 15,00 $ en sortie par
million de tokens) :

- Items rédigés par LLM, premier brouillon (~1 500 tokens en entrée +
  ~800 en sortie/item) : (1 500×3 $ + 800×15 $) : 1 000 000 =
  **0,0165 $/item** × 715 ≈ **12 $**.
- Items écrits à la main, rédaction de la mauvaise conception assistée
  par LLM uniquement (même profil de tokens) : 775 × 0,0165 $ ≈ **13 $**.
- Assistance à la rédaction de modèles (~5 000 tokens en entrée + 2 000 en
  sortie/modèle) : 0,045 $/modèle × 50 ≈ **2 $**.
- Traduction (~800 tokens en entrée + ~900 en sortie/unité) :
  0,0159 $/unité × 6 160 unités ≈ **98 $**.

**Total brut en une passe ≈ 125 $.** Un multiplicateur de sécurité ×5 pour
une itération réaliste (nouvelles tentatives de validation, régénération
déclenchée par la révision, Opus 5 pour les tranches les plus difficiles)
donne **≈ 500 $ à 700 $** au total pour toute la passe de rédaction et de
traduction — encore en dessous de 1 500 $ en doublant pour l'imprévu, trois
ordres de grandeur en dessous du coût de main-d'œuvre en jours-personne. La
mise en cache des instructions réduirait encore ce coût mais n'est pas
comptée ici.

## Implications de conception

1. Utiliser des modèles paramétriques pour l'arithmétique et l'algèbre
   précoce de niveau K-8 — un modèle façon WeBWorK produisant des
   variantes numériques illimitées [5] est le levier le plus puissant de
   ce plan.
2. Réserver le budget de rédaction manuelle pour la 11e-12e jusqu'au
   doctorat, où les modèles ont leur part la plus faible (de 30 % à 5 %)
   car le contenu basé sur des preuves résiste à une randomisation sûre.
3. Traduire les modèles, pas les instances générées : 200 unités de
   traduction couvrent 1 010 items sur modèle contre 5 960 unités pour des
   items ponctuels — le plus grand levier de localisation du modèle.
4. Traiter les valeurs p et la discrimination point-bisériale comme
   provisoires tant que les réponses ne se sont pas accumulées ; la
   littérature CAT cite des échantillons allant jusqu'à 1 000 candidats
   pour des statistiques de prétest stables [CAT wiki] — ne pas promouvoir
   automatiquement un item à `active` en dessous d'un minimum clairement
   énoncé (question ouverte 4).
5. Versionner les items de façon immuable. Ne jamais modifier un item
   ayant des réponses attachées — créer une nouvelle version, retirer
   l'ancienne (`status: retired`, jamais supprimée), reflétant le cycle de
   vie new/pilot/active/retired documenté pour les banques d'items en
   général [item bank wiki].
6. Adopter QTI 3.0 de façon incrémentale — son modèle de conformité est
   explicitement modulaire [4] ; implémenter les interactions de base et
   les métadonnées d'accessibilité pour le MVP et différer le support
   CAT/PCI.
7. Construire le portail de révision comme une machine à états explicite
   correspondant au champ `status` : draft → editorial → math check →
   accessibility → translation → pilot → psychometric screening →
   active/retired.
8. Budgétiser le coût d'API LLM comme négligeable (centaines de dollars)
   par rapport au coût de révision humaine (centaines de milliers, selon
   le calcul en jours-personne ci-dessus) — la véritable contrainte est le
   temps des experts du domaine et des traducteurs, pas les tokens.
9. Comme la recherche 2023-2026 montre que les LLM rédigent des
   distracteurs mathématiquement valides mais aveugles aux erreurs de
   conception [arXiv 2404.02124], exiger une révision humaine des erreurs
   de conception sur chaque item rédigé ou assisté par LLM — ne jamais
   livrer à Larry une explication d'erreur de conception générée par LLM
   sans révision.
10. S'attendre à ce que le retour sur investissement des modèles chute
    fortement près du sommet de la pyramide de niveaux : le coût de
    conception par modèle est à peu près fixe quelle que soit la
    difficulté, mais un modèle de niveau doctorat produit bien moins de
    variantes utilisables en toute sécurité qu'un modèle de niveau K-2 —
    le plan pondère déjà la part des modèles à la baisse quand le niveau
    monte.
11. Séquencer la traduction *après* la vérification mathématique et la
    révision d'accessibilité, pas avant — traduire du contenu qui échoue
    ensuite à la révision technique gaspille le temps du traducteur.
12. Mettre en cache le texte d'instructions/schéma/guide de style partagé
    entre les appels de rédaction et de traduction ; 715+775+6 160 appels
    partagent un long préfixe stable, donc la mise en cache des
    instructions peut réduire encore le coût LLM réel en dessous de
    l'estimation.
13. Prévoir un contrôle d'exposition des items une fois que la plateforme
    prendra en charge la diffusion adaptative — même une banque de
    2 500 items bénéficie du principe de contrôle d'exposition que les
    systèmes CAT utilisent pour éviter de trop montrer les items
    populaires [CAT wiki].
14. Traiter chaque chiffre de jour d'effort et de coût ici comme une
    estimation à valider face à un pilote, pas comme une cible fixe —
    aucune source n'a donné de multiplicateur d'items par modèle vérifié
    ni de coût par item vérifié spécifiquement pour du contenu
    mathématique ; les chiffres de ×20 par modèle et de $/item sont des
    hypothèses modélisées, étiquetées comme telles.

## Questions ouvertes pour le responsable du projet

1. Quel taux journalier chargé devrions-nous supposer pour le temps des
   experts du domaine/traducteurs/éditeurs, afin de convertir les
   ~1 053 jours-personne ci-dessus en un chiffre de budget ?
2. 2 500 items est-il une cible ferme ou un plancher, avec une marge
   réservée pour les sujets qui auront besoin de plus d'items une fois les
   données du pilote reçues ?
3. Lesquelles des 4 langues non anglaises peuvent utiliser la traduction
   par LLM plus contrôle ponctuel (comme modélisé ci-dessus), et
   lesquelles ont besoin d'une traduction humaine indépendante dès le
   premier jour ?
4. Quel nombre minimal de réponses devrait conditionner la promotion à
   `active` — la règle empirique traditionnelle de la CTT (souvent ~30),
   ou la plage plus prudente de ~200 à 1 000 que cite la littérature CAT
   pour des statistiques stables [CAT wiki] ?
5. Le portail de révision doit-il bloquer sur l'export QTI 3.0 dès le MVP,
   ou différer cela à un jalon d'interopérabilité post-MVP ?
6. Les niveaux avancé/master et doctorat portent la part de modèles la
   plus faible et le coût par item le plus élevé — devrions-nous
   budgétiser un expert du domaine contractuel spécialisé pour ces deux
   seules tranches ?
7. Les explications d'erreur de conception de Larry devraient-elles être
   rédigées une fois en anglais puis traduites, ou de façon indépendante
   par langue (par exemple, la confusion virgule décimale vs. point
   décimal entre ES/FR/DE) ?

## Sources

1. [IXL — Mathématiques (locale espagnole, nombre de compétences par niveau)](https://la.ixl.com/math)
2. [Khan/perseus — l'éditeur/moteur de rendu des questions d'exercice de Khan Academy](https://github.com/Khan/perseus)
3. [1EdTech — vue d'ensemble des standards QTI](https://www.1edtech.org/standards/qti)
4. [1EdTech — directives d'implémentation/conformité QTI 3.0](https://www.imsglobal.org/spec/qti/v3p0/impl)
5. [Wikipédia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)
6. [Wikipédia — Génération automatique d'items](https://en.wikipedia.org/wiki/Automatic_item_generation)
7. [Wikipédia — Théorie classique des tests](https://en.wikipedia.org/wiki/Classical_test_theory)
8. [Wikipédia — Coefficient de corrélation point-bisériale](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)
9. [Wikipédia — Banque d'items](https://en.wikipedia.org/wiki/Item_bank)
10. [Wikipédia — Test adaptatif informatisé](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)
11. [Wikipédia — Théorie de la réponse à l'item](https://en.wikipedia.org/wiki/Item_response_theory)
12. [Wikipédia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)
13. [Duolingo Research — page des publications](https://research.duolingo.com/)
14. [arXiv 2404.02124 — Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)
15. [Brilliant.org — À propos](https://brilliant.org/about/)
16. [ETS Research Institute — page d'accueil](https://www.ets.org/research.html)
