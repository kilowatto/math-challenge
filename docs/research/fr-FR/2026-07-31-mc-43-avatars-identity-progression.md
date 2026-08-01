# Avatars, identité et progression pour des produits destinés aux enfants sous contrainte de confidentialité stricte
> Recherche Math Challenge — 2026-07-31 — sujet 43

## Résumé exécutif (FR)

Les produits sérieux destinés aux enfants résolvent l'identité de la même
façon : des **alias générés** (choisis, pas tapés) plus un **avatar de
pièces prédéfinies** (jamais une photo) — le Mii de Nintendo [11], et ce que
le projet a déjà décidé dans D-003 [19]. L'effet Proteus (un avatar modifie
le comportement de celui qui le porte) est répliqué avec une taille d'effet
petite à moyenne [2][3], ce qui justifie de le traiter comme un levier réel.
Le problème Scunthorpe — des filtres qui bloquent des mots innocents à cause
d'une sous-chaîne offensante — est le risque technique central de générer
des alias en cinq langues [1][10] ; la solution qui fonctionne en production
est une liste blanche entretenue, pas un filtre plus strict. La Belgique et
les Pays-Bas ont jugé en 2018 que les coffres de récompense aléatoires
relèvent des jeux de hasard même quand leur contenu est cosmétique [4] — la
ligne de partage est « aléatoire et payant contre déterministe », pas
« cosmétique contre jouable ». Un compagnon de type Tamagotchi produit une
rétention réelle mais a aussi inventé le mécanisme de culpabilité qui l'a
rendu célèbre [5]. La recherche de Mayer sur les agents pédagogiques appuie
un personnage-guide avec des réserves : l'effet est modeste et dépend des
signaux sociaux, pas de l'animation [9] ; la recherche sur Sesame Street et
le lien parasocial avec Elmo montre qu'un personnage déjà familier enseigne
mieux qu'un nouveau [6][7][8] — exactement le cas de Larry, puisqu'il existe
déjà dans le canon d'Ignia [18][19]. Roblox est l'avertissement pour le texte
libre sans restriction : 1 600 modérateurs plus l'IA, et le contenu
inapproprié continue de réapparaître [13].

## Executive summary (EN)

Serious children's products solve identity the same way: **generated aliases**
(picked, not typed) plus an **avatar of pre-made parts** (never a photo) —
Nintendo's Mii [11], and what the project already decided in D-003 [19]. The
Proteus effect (an avatar changes the wearer's behavior) is replicated at a
small-to-medium effect size [2][3], justifying treating it as a real lever.
The Scunthorpe problem — filters blocking innocent words over an offensive
substring — is the central technical risk of generating aliases in five
languages [1][10]; the fix that works in production is a maintained
whitelist, not a stricter filter. Belgium and the Netherlands ruled in 2018
that randomized reward boxes are gambling even when contents are cosmetic
[4] — the line is "randomized-and-paid vs. deterministic," not
"cosmetic vs. gameplay." A Tamagotchi-style companion drives real retention
but also invented the guilt mechanic that made it famous [5]. Mayer's
pedagogical-agent research backs a character-guide with caveats: the effect
is modest and depends on social cues, not animation [9]; Sesame Street and
Elmo parasocial research show a familiar character teaches better than a new
one [6][7][8] — exactly Larry's case, since he already exists in Ignia's
canon [18][19]. Roblox is the warning for unrestricted free text: 1,600
moderators plus AI, and inappropriate content still resurfaces [13].

## Constats

### 1. L'identité sans données personnelles : le schéma de l'industrie

Chaque produit familial/pour enfants sérieux converge vers la même solution
en deux parties : un identifiant généré ou sélectionné à la place d'un vrai
nom tapé, et un avatar construit à partir d'un ensemble fermé de pièces à la
place d'une photographie. Le Mii de Nintendo est le cas le plus clair : les
personnages sont construits en choisissant parmi des traits du visage, des
coiffures, des accessoires et des types de corps prédéfinis ; même le mode de
création optionnel à partir d'une photo ne fait qu'orienter la sélection des
traits et ne stocke ni n'affiche jamais la photo source, préservant
« l'auto-représentation tout en maintenant la confidentialité » [11].
Duolingo permet de construire un avatar à partir d'une garde-robe fixe de
pièces cosmétiques saisonnières plutôt qu'à partir d'une image téléversée
[12]. La forme d'ingénierie commune est : identité = choix parmi un ensemble
borné et pré-validé, jamais une saisie libre — exactement ce que le projet a
déjà choisi dans D-003 (alias générés, pas de photo, pas de ville, classements
segmentés par niveau) [19].

### 2. L'effet Proteus : pourquoi l'avatar n'est pas qu'une décoration

La recherche de Stanford de Yee et Bailenson (2007) a inventé l'expression
« effet Proteus » : dans les environnements virtuels, les personnes se
comportent d'une façon cohérente avec les traits implicites de leur avatar,
sous l'effet de l'auto-perception et de la confirmation comportementale
plutôt que de ce que font réellement les autres [2][3]. Une méta-analyse de
46 études expérimentales a trouvé l'effet fiable, avec une taille « petite
mais proche de moyenne » (0,22–0,26) selon les contextes — des avatars plus
attirants ont produit un comportement plus confiant, des avatars athlétiques
ont augmenté la pratique d'exercice, des avatars héroïques ont augmenté le
comportement prosocial hors ligne [2]. Des travaux plus récents complexifient
l'exigence d'incarnation : des participants ont développé un attachement à
leur avatar même sans immersion forte, ce qui suggère que l'effet n'est pas
purement un phénomène de réalité virtuelle/d'incarnation [2]. Lecture
pratique pour Math Challenge : un élément cosmétique qui signale visuellement
« mathématicien soigneux, orienté vers la maîtrise » (une toque
d'universitaire, un badge d'explorateur) n'est pas seulement une récompense —
il peut orienter le comportement vers le trait qu'il représente, ce qui
plaide pour des *catégories* cosmétiques liées à de vrais comportements
d'apprentissage (persévérance, précision, curiosité) plutôt que pour des
apparences arbitraires.

### 3. Génération sûre de noms multilingues et le problème Scunthorpe

Le « problème Scunthorpe » tire son nom d'un incident de 1996 où le filtre
d'AOL a bloqué le nom de la ville anglaise de Scunthorpe parce que son nom
contient une sous-chaîne offensante ; le même mode de défaillance a touché le
nom de famille de Craig Cockburn, les « shitake mushrooms » (champignons
shiitake), les résultats de Google SafeSearch pour cette ville, et — ce qui
est critique pour un produit en cinq langues — des mots composés allemands
qui forment légitimement une sous-chaîne offensante à une lettre de liaison,
ainsi que des noms de lieux chinois signalés par homonymie de caractères [1].
Le mécanisme est structurel : les filtres naïfs par sous-chaîne « manquent de
compréhension contextuelle » [10], et l'échec s'aggrave à mesure qu'un même
filtre couvre davantage de langues, parce qu'un mot propre dans une langue
peut être une sous-chaîne dangereuse dans une autre — l'écosystème de
modération de la Chine montre lui-même où cela mène, sans liste unique et
faisant autorité de mots interdits même au sein d'une seule langue, si bien
que chaque plateforme entretient indéfiniment sa propre liste de cas limites
[10]. La solution éprouvée en production n'est pas un algorithme plus strict
— c'est une **liste blanche entretenue et journalisée** de chaînes confirmées
sûres qu'un filtre naïf rejetterait, construite à partir de journaux de rejet
réels au fil du temps [1][10]. L'implication directe pour la *construction*
des listes de mots : les listes EN/ES/FR/PT/DE doivent être rédigées par
langue par un relecteur natif, pas traduites automatiquement, parce que la
traduction est exactement l'opération qui transforme un mot sûr en une
sous-chaîne dangereuse ailleurs (cela reflète le constat de D-005 selon
lequel le vocabulaire mathématique lui-même ne peut pas être traduit mot à
mot entre ces cinq langues [19]).

### 4. Modération du contenu généré par les utilisateurs — les enfants devraient-ils avoir accès au texte libre ?

Roblox est l'étude de cas disposant du plus fort investissement disponible :
vérification d'âge obligatoire depuis janvier 2026, chat restreint à des
groupes segmentés par âge, encore avec "1,600+ moderators" plus
un filtrage piloté par IA ; une enquête de 2020 a décrit les efforts de
retrait comme un jeu de « chat contre souris » avec du contenu sexuel qui
réapparaît ; un rapport de 2024 a relié des incidents réels de prédation à
une « modération insuffisante », et au moins six arrestations ont suivi pour
exploitation d'enfants via la plateforme depuis janvier 2025 [13]. Il ne
s'agit pas d'une entreprise qui aurait sous-investi — c'est la preuve que
**le texte libre à grande échelle, venant d'enfants, ne peut pas être
entièrement modéré**, même avec un budget de confiance et de sécurité à neuf
chiffres. La conclusion honnête pour un produit à l'échelle de Math
Challenge : aucune surface de texte libre pour les enfants, en aucun cas,
dans la v1. La sélection d'alias, l'assemblage d'avatars et toute interaction
sociale doivent utiliser un vocabulaire fermé (toucher une phrase prédéfinie
ou un emoji), jamais un champ de texte — plus strict que la plupart des
concurrents, mais la seule posture qui n'hérite pas de la dette de modération
de Roblox.

### 5. Progression cosmétique contre jeu d'argent : la ligne réglementaire

La Commission des jeux de hasard belge a jugé en 2018 que les coffres à
butin (loot boxes) de FIFA 18, Overwatch et CS:GO étaient des jeux de hasard
au sens de la loi sur les jeux, indépendamment d'un contenu purement
cosmétique — l'impossibilité d'acheter directement l'objet précis en fait un
mécanisme aléatoire — et le ministre de la Justice a explicitement formulé
l'inquiétude autour des enfants [4]. L'autorité néerlandaise des jeux est
parvenue la même année à une conclusion similaire pour plusieurs (mais pas
tous) des titres étudiés, en citant une conception favorisant l'addiction
même en dessous du seuil d'application légale [4]. Le Royaume-Uni a adopté la
position plus étroite selon laquelle les objets purement cosmétiques, non
échangeables et non convertibles en argent, échappent aux jeux de hasard
soumis à licence, mais son propre examen du DCMS de 2022 a tout de même
trouvé des niveaux élevés de « préjudices liés au jeu, à la santé mentale, aux
finances et au jeu problématique » chez les joueurs de coffres à butin, et a
privilégié l'autorégulation plutôt qu'un changement de loi [4]. Pris
ensemble, le centre de gravité réglementaire est le suivant : c'est
l'aléatoire combiné au paiement qui déclenche l'attention, pas la distinction
cosmétique/jouable — un achat déterministe (acheter ce chapeau précis) est
sûr partout où ces décisions s'appliquent ; un coffre aléatoire payant est
contesté même s'il est purement cosmétique. Pour un produit destiné aux
enfants, cela plaide pour aller plus loin que la décision la plus stricte
actuelle : **aucune récompense aléatoire d'aucune sorte**, payante ou
gratuite, puisque le mécanisme qui inquiète les régulateurs (le renforcement
à ratio variable) n'a besoin d'aucun argent pour agir sur un enfant.

### 6. Boucles de soin d'un compagnon/animal : pouvoir de rétention et mécanisme de culpabilité

Le Tamagotchi (1996) est le cas de référence : trois jauges (faim, bonheur,
éducation) qui se dégradent sans attention, avec une mort réelle comme état
d'échec [5]. Il a produit un engagement extraordinaire — 40 millions
d'unités en deux ans — précisément parce que la négligence avait une
conséquence réelle et bouleversante : des enfants apportaient l'appareil à
l'école pour éviter la mort en plein cours, des écoles les ont interdits pour
perturbation, et la presse de l'époque a rapporté un chagrin authentique, y
compris de fausses funérailles pour les animaux « morts » [5]. Le mécanisme
de rétention et le dark pattern ne font qu'un — l'appareil ne fonctionne
comme un compagnon qu'à condition d'une menace, et cette menace a produit à
la fois l'engagement et le retour de bâton. Une fonctionnalité de compagnon
peut reprendre la boucle de *soin* (nourrir, habiller, interagir) sans la
boucle de *perte* : des étapes de croissance et des déblocages cosmétiques
liés à la pratique mathématique propre de l'enfant, sans état de dégradation,
sans mort, sans notification centrée sur la détresse du compagnon — en
gardant le mécanisme qui construit l'affection tout en écartant le mécanisme
de culpabilité qui a rendu l'original à la fois aimé et controversé.

### 7. La recherche sur les agents pédagogiques — pourquoi le format de Larry compte, pas seulement son existence

La recherche de Mayer sur l'apprentissage multimédia et les agents
pédagogiques trouve un appui réel mais modeste : les agents aident
principalement en tant que « présentateurs de signaux sociaux », et une
méta-analyse récente n'a trouvé qu'une « amélioration négligeable » liée à la
seule présence de l'agent — les gains viennent de *ce que fait* l'agent
(mettre en valeur, personnaliser, une voix humaine), pas du simple fait
d'avoir un personnage [9]. Les agents en rôle de tuteur ne montrent pas
d'avantage net par rapport aux leçons sans agent ; les agents présentés
comme co-apprenants renforcent plus fidèlement le sentiment d'efficacité
personnelle ; la représentation statique ou animée reste une question
ouverte et contradictoire [9]. Cela converge avec l'histoire de la recherche
sur Sesame Street elle-même : les études de l'ETS de 1970-71 ont trouvé que
les spectateurs les plus assidus apprenaient davantage, quel que soit leur
désavantage de départ, et une analyse économique de 2019 (Kearney & Levine)
l'a qualifiée de « peut-être la plus grande intervention de la petite enfance,
et pourtant la moins coûteuse » [6]. En dessous de cela se trouve la
recherche sur le lien parasocial : l'équipe de Calvert a trouvé que des
enfants de 21 mois apprenaient mieux une tâche de séquençage avec un
personnage familier (Elmo) qu'avec un personnage inconnu, et que le fait de
donner d'abord aux enfants un jouet du personnage inconnu — pour qu'il
devienne familier — comblait l'écart ; les personnages personnalisés
approfondissaient encore l'engagement, car « les similarités perçues
augmentent l'intérêt et l'investissement des enfants » [7][8]. Cela conforte
Larry, comme déjà décidé dans D-004 : ce n'est pas un nouveau personnage mais
le rhinocéros orange déjà existant d'Ignia, donc la familiarité que la
recherche de Calvert associe à l'apprentissage est déjà acquise, pas à
construire à partir de rien [18][19]. Le corollaire : les règles du canon de
Larry (ne jamais se moquer de l'enfant, « ¡Ya vas! » uniquement à
l'acceptation d'une tâche) comptent plus que son design visuel — le bénéfice
se situe dans le comportement des signaux sociaux, pas dans le modèle du
personnage [9][18].

### 8. Visualiser la progression pour les enfants — cartes, arbres et l'effet de gradient d'objectif

L'effet de gradient d'objectif — l'effort s'accélère à mesure que la distance
perçue à un but se réduit — est bien établi dans la littérature d'économie
comportementale/marketing (la « résurrection » par Kivetz, Urminsky et Zheng
de l'hypothèse originale de Hull, dans des contextes de programmes de
fidélité) [14]. Les revues sur l'apprentissage ludifié notent que les
apprenants visuels « bénéficient... des barres de progression, des cartes de
jeu et des visuels colorés » pour la motivation, tout en avertissant que les
points/badges/classements utilisés isolément ne sont pas fiablement efficaces
— ils fonctionnent quand ils sont liés à de vrais signaux de compétence, pas
comme décoration [15]. Cela correspond à la propre recherche du projet sur la
tranche PRIMARY : une étude de l'« effet garde-robe » a trouvé que les
enfants construisent plusieurs avatars mais convergent vers l'utilisation
d'un seul, ce qui signifie que le *processus* de personnalisation porte la
valeur motivationnelle même quand l'artefact final est restreint [16] ; la
recherche sur la tranche KINDER a trouvé que les jeunes enfants
« s'attendent à un retour à chaque action » et répondent à une animation
constante de la mascotte d'une façon que les adultes n'ont explicitement pas
[17]. L'histoire propre de Duolingo constitue un exemple d'avertissement sur
*quelle* métaphore de progression choisir : l'entreprise a remplacé sa carte
de compétences en forme d'arbre par un chemin linéaire en août 2022,
provoquant un rejet visible et durable des utilisateurs [12] — preuve que la
métaphore de l'arbre/de la carte portait elle-même une valeur motivationnelle
qu'une ligne droite n'a pas su remplacer.

## Implications de conception

1. **Le générateur d'alias est rédigé par langue, pas traduit.** Construire
   cinq listes de mots indépendantes (EN/ES/FR/PT/DE) avec un relecteur
   natif par langue, combinant un mot de catégorie + un mot de trait de
   caractère + un nombre à deux chiffres tiré aléatoirement (pas
   séquentiel). Ne jamais dériver la liste d'une langue en traduisant celle
   d'une autre — c'est exactement l'opération qui crée des défaillances de
   type Scunthorpe [1][10].
2. **La sélection d'alias se fait uniquement par tap pour les âges 3-11
   (KINDER + PRIMARY).** L'enfant choisit parmi 3-5 options générées ; il
   n'y a aucun champ de texte à remplir, ce qui supprime la surface
   d'injection pour les tranches d'âge les moins capables de
   s'autoréguler. La tranche TEEN (12-17) obtient un nombre limité de
   relances, mais ne tape jamais de texte non plus.
3. **Valider la chaîne combinée finale, pas chaque mot isolément, et
   journaliser chaque rejet/régénération** (mots, langue, locale, raison).
   Deux mots propres peuvent se combiner en un mot dangereux d'une langue à
   l'autre ; une liste blanche journalisée de chaînes confirmées sûres,
   construite à partir de ces journaux, est la véritable solution de
   production au problème Scunthorpe, pas un filtre plus strict [1].
   Limiter le débit de régénération (par exemple, un petit nombre de
   relances par jour) afin qu'un enfant ne puisse pas forcer par force
   brute une combinaison à travers le filtre.
4. **Aucun champ de texte libre nulle part où un enfant de moins de 13 ans
   peut accéder** — pas de biographie, pas de chat, pas d'étiquette
   personnalisée. Toute interaction enfant-à-enfant (réactions,
   félicitations) utilise un ensemble fermé de phrases prédéfinies/emoji,
   selon la lecture honnête du bilan de modération de Roblox, même à
   grande échelle [13].
5. **Avatar = pièces prédéfinies uniquement, à la façon Mii.** Aucun
   téléversement de photo, aucun accès à la caméra, jamais. Les pièces sont
   organisées en catégories (cheveux, expression, accessoire) débloquées
   comme des cosmétiques, jamais tapées ni dessinées.
6. **Les cosmétiques se débloquent selon une table déterministe et
   publiée**, liée à des jalons de maîtrise, à des séries ou à un
   classement de ligue — par exemple, terminer une unité de sujet débloque
   un objet nommé précis. Aucun coffre, coffret, paquet ou récompense
   « mystère » d'aucune sorte, gratuite ou payante — plus strict que
   l'exception cosmétique du Royaume-Uni lui-même, et entièrement à l'écart
   de la ligne belgo-néerlandaise [4]. Si la monétisation touche un jour
   les cosmétiques, il s'agit uniquement d'un achat direct d'un objet nommé
   et prévisualisé, jamais d'un achat aléatoire.
7. **Une fonctionnalité de compagnon/animal (si elle est construite) n'a
   aucun état de dégradation, de faim ou de mort**, et n'envoie aucune
   notification centrée sur la tristesse ou la négligence du compagnon —
   garder la boucle qui construit l'affection, écarter la boucle de
   culpabilité du Tamagotchi [5]. De même, **la perte d'une série n'efface
   ni ne fait jamais régresser visuellement la carte de progression** — un
   jour manqué ne doit pas annuler rétroactivement une progression déjà
   acquise, ce qui évite d'empiler un second mécanisme de culpabilité sur
   le premier.
8. **La visualisation de la progression est segmentée par âge, pas une
   seule apparence pour tous les âges :** KINDER — un chemin physique de
   voyage avec la mascotte qui avance, sans chiffres ; PRIMARY — un arbre
   de compétences/une carte de maîtrise par sujet nommé (pas une ligne
   droite — le passage de Duolingo en 2022, abandonnant son arbre, a
   provoqué un rejet visible [12][15]) ; TEEN — un tableau de bord de
   statistiques avec une ligue en option ; ADULT — des mesures de maîtrise
   purement numériques, avec une apparence ludifiée optionnelle et
   désactivée par défaut (selon les constats adultes/experts de mc-23).
9. **La présence de Larry est segmentée par âge**, selon l'architecture de
   prompt déjà existante de mc-37 : KINDER — animé, d'abord vocal, réagit à
   chaque tentative ; PRIMARY — même personnage, explique l'erreur de
   raisonnement selon les règles strictes déjà fixées dans D-004 ; TEEN —
   même rhinocéros, ton qui évolue vers celui d'un « professeur patient »,
   moins d'animations, désactivation possible ; ADULT — Larry disponible
   sur demande mais relégué derrière une interface de retour plus dense
   [9][18].
10. **Larry ne commente jamais l'alias ou le choix d'avatar de l'enfant.**
    Sa voix canonique reste centrée sur les mathématiques, jamais sur
    l'apparence ou l'identité — cela étend la règle de D-004 « ne jamais
    faire honte à un enfant » à un endroit où la honte pourrait autrement
    s'infiltrer (un robot qui « complimente » un nom peut aussi,
    implicitement, en juger un autre) [18][19].
11. **Les catégories cosmétiques signalent des traits d'apprentissage** que
    la recherche sur l'effet Proteus dit pouvoir influencer le comportement
    (persévérance, curiosité, soin) — par exemple, une ligne de badges
    « explorateur » pour avoir essayé des problèmes difficiles — plutôt
    qu'une décoration arbitraire, puisque l'avatar a un écho comportemental
    petit mais réel sur celui qui le porte [2][3].
12. **L'identité de l'alias/avatar n'est jamais déductible du compte
    parent**, de l'e-mail ou du vrai nom de l'enfant dans l'interface — un
    suffixe numérique doit être aléatoire, pas séquentiel, sinon
    « Bunny07 » laisserait deviner l'ordre d'inscription.

## Questions ouvertes pour le porteur du projet

1. L'ensemble de réactions à vocabulaire fermé (emoji/phrases prédéfinies)
   doit-il exister en v1, ou « aucune interaction enfant-à-enfant d'aucune
   sorte » est-il le réglage par défaut le plus sûr tant qu'il n'y a pas de
   budget de modération pour soutenir même un ensemble fermé ?
2. Un compagnon de type Tamagotchi entre-t-il seulement dans le périmètre
   de ce produit, ou le risque de boucle de culpabilité (§6) plaide-t-il
   pour abandonner entièrement la fonctionnalité plutôt que d'essayer d'en
   construire une version « sûre » ?
3. Pour l'arbre de compétences de la tranche PRIMARY : l'ordre des sujets
   doit-il être strictement linéaire (ce qui correspond au séquençage
   actuel du programme) ou permettre une exploration ramifiée (ce qui
   correspond au constat de l'« effet garde-robe » selon lequel les
   enfants valorisent le choix même quand ils convergent vers un seul
   chemin) ?
4. Les tables de déblocage cosmétique doivent-elles être visibles à
   l'avance pour l'enfant (transparence totale : « termine les fractions
   pour débloquer ce chapeau ») ou révélées seulement au déblocage
   (surprise, mais plus proche dans l'esprit du mécanisme scruté par les
   régulateurs, même sans aléatoire) ?
5. Les alias de la tranche TEEN obtiennent-ils un degré de liberté
   supplémentaire (par exemple, un nombre choisi par l'enfant, mais
   toujours validé) par rapport à l'ensemble entièrement généré de
   PRIMARY/KINDER, ou le même mécanisme de sélection par tap uniquement
   est-il conservé jusqu'à 17 ans ?
6. Les listes de mots pour les alias doivent-elles être construites en
   interne par langue, ou existe-t-il un budget/une volonté de licencier un
   jeu de données multilingue existant et entretenu de mots interdits/sûrs,
   plutôt que de rédiger cinq listes à partir de zéro ?

## Sources

1. Wikipedia — Scunthorpe problem. https://en.wikipedia.org/wiki/Scunthorpe_problem
2. Wikipedia — Proteus effect. https://en.wikipedia.org/wiki/Proteus_effect
3. Yee, N. & Bailenson, J. (2007). "The Proteus Effect: The Effect of
   Transformed Self-Representation on Behavior." Human Communication
   Research, 33(3). Étude originale sous-jacente à [2] ; non consultée à
   nouveau en direct.
4. Wikipedia — Loot box (historique réglementaire : Belgique, Pays-Bas,
   DCMS britannique). https://en.wikipedia.org/wiki/Loot_box
5. Wikipedia — Tamagotchi. https://en.wikipedia.org/wiki/Tamagotchi
6. Wikipedia — Sesame Street research. https://en.wikipedia.org/wiki/Sesame_Street_research
7. Wikipedia — Parasocial interaction. https://en.wikipedia.org/wiki/Parasocial_interaction
8. Lauricella, A., Gola, A., & Calvert, S. (2011). "Toddlers' learning from
   socially meaningful video characters." Media Psychology, 14(2). Étude
   primaire référencée dans [7] ; non consultée à nouveau en direct.
9. Wikipedia — Pedagogical agent. https://en.wikipedia.org/wiki/Pedagogical_agent
10. Wikipedia — Profanity filter. https://en.wikipedia.org/wiki/Profanity_filter
11. Wikipedia — Mii. https://en.wikipedia.org/wiki/Mii
12. Wikipedia — Duolingo. https://en.wikipedia.org/wiki/Duolingo
13. Wikipedia — Roblox (bilan de sécurité/modération). https://en.wikipedia.org/wiki/Roblox
14. Kivetz, R., Urminsky, O., & Zheng, Y. (2006). "The Goal-Gradient
    Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress,
    and Customer Retention." Journal of Marketing Research, 43(1).
    Littérature établie ; non consultée à nouveau en direct.
15. Wikipedia — Gamification of learning. https://en.wikipedia.org/wiki/Gamification_of_learning
16. Interne — `math-challenge/docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
    §3 (étude de l'« effet garde-robe » de l'avatar, cadrage par la théorie
    de l'autodétermination).
17. Interne — `math-challenge/docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
    §5, §7 (préférence pour la mascotte/l'animation, constat du retour à
    chaque action).
18. Interne — `math-challenge/docs/research/2026-07-31-mc-37-larry-profe-port.md`
    (règles strictes de Larry, architecture de prompt, ton par tranche
    d'âge).
19. Interne — `math-challenge/docs/decisions.md` D-003 (alias générés),
    D-004 (Larry), D-005 (cinq langues).
