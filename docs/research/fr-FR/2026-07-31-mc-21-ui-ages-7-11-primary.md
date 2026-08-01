# Conception UI/UX pour les enfants de 7 à 11 ans (tranche PRIMARY / ELEMENTARY)

> Recherche Math Challenge — 2026-07-31 — sujet 21

## Résumé exécutif (FR)

La tranche PRIMARY (7-11 ans) correspond au stade « opératoire concret » de Piaget : les enfants raisonnent avec logique sur des objets concrets et gagnent en « décentration » (attention à plusieurs dimensions à la fois), mais ne maîtrisent pas encore bien l'abstrait [1]. NN/g documente que cette tranche navigue avec plus d'indépendance que les pré-lecteurs de 3-5 ans, mais continue de rejeter tout contenu ciblant même un niveau scolaire au-dessus ou en dessous du sien [2]. Une étude sur les avatars (arXiv, 48 participants de 8-13 ans) documente « l'effet penderie » : les enfants créent plusieurs avatars mais n'en utilisent systématiquement qu'un seul [4]. La recherche de NN/g sur les adolescents (100 utilisateurs de 13-17 ans, 210 sites) marque le plafond que PRIMARY doit éviter de toucher par le bas : les adolescents rejettent le mot « Kids » et l'excès d'animation décorative [3]. La COPPA exige un consentement parental vérifiable pour les moins de 13 ans et limite les données pouvant être collectées, restreignant ainsi toute fonctionnalité sociale dans cette tranche [9]. La dyscalculie (5-10 % de la population) exige de représenter les quantités visuellement en plus du numérique, et d'éviter la pression temporelle [11]. Ce rapport traduit ces constats en une spécification pour le thème PRIMARY, différencié de KINDER et de TEEN, sur téléphone, tablette et ordinateur.

## Executive summary (EN)

The PRIMARY band (ages 7-11) sits in Piaget's "concrete operational" stage:
logical reasoning about concrete objects plus "decentration" (attending to
more than one dimension at once), but still weak abstract reasoning [1].
NN/g shows this band navigates more independently than 3-5-year-old
pre-readers, yet still rejects content pitched even one grade level off [2].
An avatar study (arXiv, 48 participants aged 8-13) documents the "wardrobe
effect": children build several avatars but consistently settle on one [4].
NN/g's teen research (100 users aged 13-17, 210 sites) marks the ceiling
PRIMARY must avoid touching from below: teens reject the word "Kids" and
excess decorative animation [3]. COPPA requires verifiable parental consent
under 13 and restricts data collection, directly constraining any social
feature in this band [9]. Dyscalculia (5-10% of the population) requires
pairing numerals with a visual quantity and avoiding time pressure [11].
This report turns these findings into a spec for the PRIMARY theme,
differentiated from KINDER and TEEN, across phone, tablet, and desktop.

## Résultats

### 1. Développement cognitif : ce que les 7-11 ans peuvent réellement faire

Le stade opératoire concret de Piaget couvre cette tranche : conservation, raisonnement inductif et « décentration » — suivre plusieurs variables à l'écran plutôt que se fixer sur une seule — mais avec un raisonnement abstrait/hypothétique encore faible, ce qui plaide contre une interface exigeant de garder une règle en tête sans ancrage concret (droite numérique, groupement, étape travaillée) [1]. Les propres catégories de NN/g séparent la tranche « intermédiaire » 6-8 ans (encore accompagnée) de la tranche « plus âgée » 9-12 ans (navigation indépendante, lecture plus solide) [2] : PRIMARY n'est donc pas homogène en interne — un enfant de 7 ans se rapproche de KINDER, un enfant de 11 ans se rapproche de TEEN.

### 2. « Cool » contre « bébé » : le mécanisme de rejet

La preuve la plus clairement citable sur la limite *supérieure* vient du corpus adolescent de NN/g : les adolescents (13-17 ans) rejettent explicitement le mot « Kids », n'aiment pas les visuels chargés ou criards, et veulent une interactivité propre et ciblée, avec des sections « Kids » et « Teens » séparées et étiquetées là où les deux existent [3]. Le mécanisme est le rejet d'une image de soi obsolète, pas une préférence de détail — un enfant qui traverse les 7-11 ans renégocie le « je ne suis plus un petit enfant » bien avant de devenir adolescent, si bien que PRIMARY doit signaler davantage de compétence qu'une habillage mascotte-et-bulles sans adopter le look plus plat et plus dense que préfèrent les adolescents [3].

### 3. Avatars et personnalisation comme travail identitaire

Une étude de 2026 portant sur 48 enfants de 8-13 ans construisant des avatars dans des jeux sociaux a identifié quatre motivations : l'auto-représentation, l'expérimentation d'identités alternatives, les besoins sociaux et la performance de jeu ; la conception de la monétisation façonne de manière mesurable ce que les enfants créent [4]. Son constat principal est « l'effet penderie » — les enfants créent plusieurs avatars mais convergent vers l'usage d'un seul, si bien que le *processus* de personnalisation est là où réside la valeur, même si le produit final reste étroit [4]. La synthèse du Digital Wellness Lab ajoute que les avatars fonctionnent mieux lorsqu'ils expriment un soi actuel ou aspirationnel, et que l'inclusion compte concrètement : 42,1 % des filles et 38,6 % des garçons dans la recherche citée évitent les jeux représentant des personnages féminins de manière hypersexualisée [5]. Une étude connexe de Frontiers (82 participants, stratifiés par appartenance ethnique) a montré que la personnalisation face à des avatars préassignés modifiait à peine l'humeur immédiate, mais que la satisfaction suivait la mesure dans laquelle les options représentaient la propre identité de l'enfant — la sous-représentation fonctionne comme une « microagression subtile » [6]. Les achats aléatoires de type loot-box sont signalés comme un risque de monétisation distinct, avec un engagement plus fort des garçons que des filles [5].

### 4. Objets à collectionner, progression et motivation

La théorie de l'autodétermination structure les leviers : l'autonomie (le choix de la façon de progresser), la compétence (un défi calibré avec un retour clair) et l'appartenance (une dimension sociale) ; les récompenses extrinsèques ne soutiennent la motivation que lorsqu'elles se lisent comme un retour sur la compétence plutôt que comme une incitation contrôlante [10]. Les objets à collectionner sont plus durables lorsque leur collecte est liée à quelque chose que l'enfant valorise déjà (maîtrise, histoire, objectif choisi par lui-même) que lorsqu'ils sont poursuivis uniquement pour la récompense externe [10].

### 5. Fonctionnalités sociales et leurs implications pour la sécurité

La COPPA exige un consentement parental vérifiable avant de collecter des informations personnelles sur un enfant de moins de 13 ans, définit l'information personnelle de manière large (identifiants persistants, géolocalisation, images/audio) et interdit de conditionner la participation à une collecte excessive de données [9]. C'est pourquoi la plupart des fonctionnalités de chat grand public et de profil public excluent les moins de 13 ans ou les font passer par le consentement parental [9] — une contrainte réelle pour les tableaux de classement, les listes d'amis ou le texte libre dans une tranche majoritairement composée de moins de 13 ans.

### 6. NN/g sur les tranches immédiatement au-dessus et en dessous de PRIMARY

NN/g met en garde contre le fait de traiter les « enfants » comme un seul groupe indifférencié de 3-12 ans, en séparant les tranches jeune/intermédiaire/âgée avec des besoins différents en taille de police et en accompagnement [2]. Le rapport adolescent (100 utilisateurs, trois vagues de recherche, États-Unis/Royaume-Uni/Australie) est le point de donnée le plus net sur le plafond : les adolescents sont trop confiants mais performent moins bien que les adultes en raison d'une lecture faible, de compétences de recherche pauvres et d'une faible patience — « ils ne se blâment pas eux-mêmes, ils vous blâment vous » — abandonnant un parcours confus plutôt que de le déboguer [3]. La vue d'ensemble de NN/g sur les jeunes utilisateurs quantifie cette division : un rapport de 156 recommandations pour les 3-12 ans contre un rapport séparé de 124 conseils pour les 13-17 ans [7] — deux manuels distincts, preuve que PRIMARY a besoin de son propre thème plutôt que d'un habillage kinder ou teen redimensionné.

### 7. Tolérance à l'erreur et frustration

Aucune source trouvée n'a mesuré directement la tolérance à l'erreur pour les 7-11 ans exactement. La preuve la plus proche : la décentration de Piaget signifie que cet âge peut tenir « je me suis trompé » et « je peux le corriger » comme deux faits distincts, contrairement à un enfant de 4-6 ans qui les confond [1] ; et le corpus adolescent montre une impatience face aux interfaces confuses, en blâmant le produit, déjà présente à 13-17 ans [3]. La recherche sur la dyscalculie ajoute un point concret : la pression temporelle dégrade la performance en manipulation numérique chez les enfants ayant un sens du nombre faible, et un rythme flexible réduit les baisses liées au stress [11] — un argument contre les minuteurs de compte à rebours stricts pour cette tranche en général.

### 8. Niveau de lecture, longueur du texte, iconographie et étiquettes

La segmentation de NN/g s'applique directement : les enfants de 6-8 ans ont besoin d'un texte plus grand et accompagné, ceux de 9-12 ans gèrent une lecture plus avancée et une navigation indépendante, mais un contenu situé même un niveau scolaire à côté est rejeté — contrairement aux adultes, qui tolèrent un niveau par défaut de 8e-10e année [2]. Le corpus adolescent, un cran au-dessus, recommande un niveau de lecture de 6e année ou inférieur, même pour un public nominalement plus fort, parce que la vitesse et l'attention — pas le décodage — sont le goulot d'étranglement [3]. Cette logique s'applique avec plus de force ici : étiquettes courtes, une idée par écran, icônes littérales plutôt que métaphoriques.

### 9. Intégration sans longs tutoriels

Aucune étude n'a abordé la longueur des tutoriels d'intégration pour les 7-11 ans spécifiquement — une lacune de preuve. Preuve transférable : la faible patience du corpus adolescent face à tout ce qui retarde la tâche orientée vers un objectif [3], et le constat opératoire concret selon lequel une instruction abstraite sans premier exemple concret est mal retenue [1] — ensemble, ces éléments plaident pour « apprendre en faisant le premier vrai problème, avec des indices échelonnés », et non un explicatif multi-écrans.

### 10. Contexte de l'appareil

Aucune source consultée n'a mesuré l'usage de tablettes partagées ou de Chromebooks scolaires pour cette tranche exacte — une deuxième lacune, signalée plutôt que masquée. C'est néanmoins une contrainte quasi certaine — changement de profil rapide, limites de session claires, sans supposer une connexion personnelle persistante — que les implications de conception ci-dessous traitent comme une exigence même sans citation à l'appui.

### 11. Accessibilité : typographie pour la dyslexie et discalculie

La typographie adaptée à la dyslexie converge vers des paramètres vérifiables : polices sans-serif ouvertes (Arial, Verdana, Open Sans, ou les polices dédiées Atkinson Hyperlegible/OpenDyslexic), texte de corps d'au moins 16 px, interligne de 1,5×, espacement des lettres de 0,12 em, espacement des mots de 0,16 em, longueur de ligne de 45-100 caractères, contraste WCAG 4.5:1 (3:1 pour le texte grand/gras), alignement à gauche, sans majuscules intégrales ni italiques appuyées [8]. La dyscalculie (prévalence de 5-10 %) est une difficulté neurobiologique touchant le sens de la quantité, la correspondance numéral-quantité, la mémorisation des faits, et le maintien des nombres en mémoire pendant un calcul, à tous les niveaux de difficulté [11]. La réponse de conception : associer les numéraux à une quantité visuelle (points, blocs, une droite numérique) plutôt que des chiffres nus, minimiser l'encombrement, offrir plus d'une modalité de saisie, éviter ou rendre optionnelle toute pression temporelle [11].

### 12. Saisie numérique à l'écran

Aucune étude dédiée au clavier numérique pour les 7-11 ans n'a été trouvée — une troisième lacune. Deux constats adjacents délimitent la conception : le HIG d'Apple fixe 44 × 44 pt comme seuil général de cible tactile [12], et l'écart de précision motrice tactile par rapport aux adultes — important dans la tranche 3-6 ans — se referme à peu près en première année de primaire [rapport complémentaire, sujet 20]. L'appel de la littérature sur la dyscalculie en faveur de modalités de saisie multiples [11] plaide pour un clavier qui ne soit pas la *seule* voie de réponse — des choix à cocher, une droite numérique tactile/glissable, ou un clavier, selon le type de problème.

## Implications de conception pour Math Challenge

1. **Cibles tactiles : 48 × 48 px CSS minimum sur téléphone/tablette, 44 × 44 px sur ordinateur avec souris** — juste au-dessus du seuil de 44 × 44 pt d'Apple [12], loin en dessous du minimum bien plus grand de KINDER (~88-96 px), puisque l'écart de précision motrice par rapport aux adultes s'est largement refermé à 7-10 ans [rapport complémentaire, sujet 20]. C'est la différence mécanique la plus nette avec KINDER : pas de zones surdimensionnées « à l'épreuve des tout-petits ».
2. **Typographie : sans-serif arrondie mais pas enfantine**, base de 18-20 px pour le texte du problème, 16 px minimum pour l'étiquette secondaire — plus petit et moins « criard » que les numéraux de 24-32 px de KINDER. Proposer un commutateur intégré adapté à la dyslexie (Atkinson Hyperlegible/OpenDyslexic, interligne 1,5×, espacement 0,12 em, aligné à gauche) selon les paramètres documentés [8].
3. **Palette : saturée mais ni pastel ni néon.** Une palette confiante, proche de l'univers gamer, en tons pierres précieuses (sarcelle, indigo, ambre, corail) utilisée avec retenue — la couleur marque l'état/la catégorie, pas chaque surface. En deçà de la direction plus plate et plus monochrome de TEEN, suggérée par le dégoût des adolescents pour les visuels « tape-à-l'œil » [3] : PRIMARY conserve nettement plus de couleur et de chaleur.
4. **Densité : une tâche par écran avec contexte visible** (bandeau de progression, petit indicateur de série/avatar) — KINDER l'omet, TEEN le présenterait comme des statistiques denses. La décentration signifie que cette tranche peut tenir « où en suis-je dans cette session » en même temps que le problème en cours [1].
5. **Mouvement : ciblé et vif, pas rebondissant.** Réduire la mascotte animée en permanence au repos de KINDER à un état par défaut plus calme (présent, statique sauf lors de changements d'état) tout en conservant des animations de confirmation rapides — entre le constat de KINDER selon lequel l'animation est une préférence et la tolérance inférée plus basse de TEEN pour la décoration, déduite du dégoût des adolescents pour les « multimédias inutiles » [3].
6. **Avatars : concevoir pour l'effet penderie, pas contre lui.** Création d'avatars peu coûteuse et à faible friction, en s'attendant à ce que les enfants se fixent sur un seul ; investir en profondeur dans les traits qui comptent réellement (cheveux, vêtements, accessoires, options inclusives de teinte de peau/corps/genre) plutôt qu'en largeur d'options jetables [4][5]. Débloquer les éléments par la progression, jamais par des loot-boxes à argent réel [5].
7. **Progression : lier les déblocages à la compétence, pas au temps passé.** Badges, séries et objets à collectionner se lisent comme un retour de maîtrise (un sujet appris, une série de bonnes réponses), avec un certain choix du joueur sur ce qu'il poursuit ensuite, satisfaisant le levier d'autonomie [10].
8. **Social : pas de chat ouvert, pas de profil public, pas de tableau de classement visible en dehors d'un groupe géré par un enseignant/parent**, prénom ou pseudonyme uniquement — la conséquence directe de la COPPA pour un public majoritairement composé de moins de 13 ans [9].
9. **Mauvaises réponses : correctives, non punitives, plus directes que KINDER.** Montrer le chemin correct (étape travaillée, aide visuelle de quantité), pas seulement un son d'encouragement — cette tranche peut tenir « je me suis trompé » et « voici la solution » séparément [1] ; une simple croix rouge sans chemin à suivre violerait la prudence issue de la recherche sur la dyscalculie contre la pression sans soutien [11].
10. **Pas de minuteur de compte à rebours strict par défaut ; rendre le chronométrage optionnel par série.** La pression temporelle dégrade la performance des enfants ayant un sens du nombre faible, et une prévalence de 5-10 % est assez élevée pour désavantager une part réelle de toute base d'utilisateurs de la taille d'une classe [11].
11. **Saisie numérique : faire correspondre la modalité au type de problème**, pas un clavier universel unique — choix à cocher pour les vérifications de concept, glisser/toucher sur une droite numérique pour la magnitude, un clavier à touches de 48 px pour la saisie ouverte de numéraux — selon la mise en garde de la littérature sur la dyscalculie contre une voie de saisie unique forcée [11].
12. **Durée de session : des séries courtes avec un point d'arrêt visible tous les quelques problèmes** (un ensemble thématique de problèmes, pas une question isolée) — aucun repère précis de minutes par âge n'a été trouvé dans cette recherche ; considérer tout chiffre comme une décision produit informée, mais non dictée, par le schéma de patience documenté dans la tranche supérieure [3].
13. **Réglages par défaut de l'appareil : changement de profil rapide, sans saisie de texte**, sans supposer une connexion personnelle persistante, pour des tablettes familiales partagées ou des Chromebooks scolaires — une exigence déduite, pas citée, compte tenu de la lacune signalée au §10.
14. **Intégration : sauter la séquence de tutoriel ; enseigner à travers le premier vrai problème** avec un accompagnement intégré (première étape travaillée, bouton d'indice), en cohérence avec la faible patience de cette tranche face au délai [3] et la faible rétention de l'instruction abstraite sans ancrage concret [1].

## Anti-modèles à éviter

- **Les cibles surdimensionnées de KINDER et l'animation constante de la mascotte au repos, telles quelles** — se lisent comme infantiles pour un enfant de 9-11 ans ; non soutenues par les preuves motrices de cet âge [rapport complémentaire, sujet 20].
- **Le mot « Kids » n'importe où dans les textes destinés à PRIMARY** — un répulsif documenté pour les adolescents, et la renégociation du « je ne suis plus un petit enfant » commence plus tôt [3].
- **Chat, profils publics ou tableaux de classement non délimités** sans groupe géré par un parent/enseignant — exposition directe à la COPPA pour un public majoritairement composé de moins de 13 ans [9].
- **Achats cosmétiques aléatoires de type loot-box** — un risque de monétisation proche des jeux d'argent, auquel les garçons s'engagent davantage [5].
- **Un unique clavier saisi obligatoire pour chaque problème** — contredit la recommandation de modalités de saisie multiples issue de la recherche sur la dyscalculie [11].
- **Minuteurs de compte à rebours activés par défaut** — dégradent de manière mesurable la performance d'un groupe à forte prévalence (5-10 %) [11].
- **Un long tutoriel écran par écran avant le premier vrai problème** — se heurte à l'impatience face au délai et à la faible rétention de l'instruction abstraite [1][3].
- **Un retour punitif sur les mauvaises réponses (croix rouge, sans chemin à suivre)** — laisse un enfant bloqué exactement là où c'est du soutien, pas de la pression, qui est nécessaire [11].
- **Supposer une connexion personnelle persistante comme seule voie d'accès** — ignore la réalité des appareils partagés que sont les tablettes familiales et les Chromebooks scolaires, même si ce rapport n'a trouvé aucune citation directe quantifiant cette réalité pour cette tranche exacte.

## Questions ouvertes pour le porteur du projet

1. PRIMARY devrait-il prendre en charge un **tableau de classement à l'échelle de la classe/enseignant** en plus d'un tableau familial, sachant que l'exigence de consentement de la COPPA s'applique différemment lorsqu'une école inscrit l'enfant plutôt qu'un parent directement [9] ?
2. Quelle est la position de Math Challenge sur **toute surface d'achat en argent réel** accessible depuis l'expérience destinée aux enfants de PRIMARY — absente entièrement, ou présente derrière une barrière parentale sans mécanique aléatoire ?
3. Les avatars devraient-ils être **partagés/transférables entre KINDER, PRIMARY et TEEN** à mesure que l'enfant grandit, ou chaque tranche dispose-t-elle d'un système séparé correspondant à son propre langage visuel ?
4. Compte tenu de l'effet penderie [4], vaut-il la peine de **stocker plusieurs avatars**, ou PRIMARY devrait-il offrir un unique emplacement modifiable correspondant à l'usage réel ?
5. Le **commutateur typographique adapté à la dyslexie** devrait-il être exposé directement à l'enfant, ou réglé uniquement par un parent/enseignant ?
6. Math Challenge dispose-t-il déjà d'un **repère interne ou sous licence de durée de session par âge** qui devrait primer sur la lacune « aucun chiffre trouvé » signalée ici, plutôt que de la laisser comme une pure décision produit ?

## Sources

1. Wikipedia. « Piaget's theory of cognitive development » (stade opératoire concret : conservation, raisonnement inductif, décentration, limites du raisonnement abstrait).
   https://en.wikipedia.org/wiki/Piaget%27s_theory_of_cognitive_development
2. Nielsen Norman Group. « Children's UX: Usability Issues in Designing for Young People » (segmentation par âge 3-5/6-8/9-12 ; rejet par niveau scolaire ; préférence d'animation ; cécité publicitaire).
   https://www.nngroup.com/articles/childrens-websites-usability-issues/
3. Nielsen Norman Group. « Teenagers' UX: Designing Websites for Teens » (100 utilisateurs de 13-17 ans, 210 sites/30 applications ; recommandation de niveau de lecture 6e année ; « Kids » comme répulsif ; faible patience ; dégoût de l'encombrement).
   https://www.nngroup.com/articles/usability-of-websites-for-teenagers/
4. arXiv. « Understanding Children's Avatar Making in Social Online Games » (48 participants de 8-13 ans ; quatre motivations ; « l'effet penderie »).
   https://arxiv.org/abs/2502.18705
5. Digital Wellness Lab. « Young People's Use of Avatars and Virtual Character Customization » note de recherche (expression identitaire, personnalisation genrée, statistiques d'évitement de l'hypersexualisation, préoccupations liées aux loot-boxes).
   https://digitalwellnesslab.org/research-briefs/young-peoples-use-of-avatars-and-virtual-character-customization/
6. Frontiers in Virtual Reality. « Designing the Self: Avatar Customization, Identity, and Affective Experience » (82 participants, stratifiés par appartenance ethnique ; satisfaction de personnalisation contre représentation).
   https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1784948/full
7. Nielsen Norman Group. « Young Users Usability Research Reports » (page thématique : rapport de 156 recommandations pour les 3-12 ans contre rapport séparé de 124 conseils pour les 13-17 ans).
   https://www.nngroup.com/reports/topic/young-users/
8. accessiBe. « Dyslexia-Friendly Fonts & Typography Best Practices » (choix de police, 16 px minimum, interligne 1,5×, espacement des lettres 0,12 em, espacement des mots 0,16 em, lignes de 45-100 caractères, contraste WCAG 4.5:1/3:1).
   https://accessibe.com/blog/knowledgebase/dyslexia-friendly-fonts
9. Wikipedia. « Children's Online Privacy Protection Act » (seuil de moins de 13 ans, définition de l'information personnelle, consentement parental vérifiable, restriction sur la collecte excessive de données).
   https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act
10. Wikipedia. « Self-determination theory » (autonomie/compétence/appartenance ; mécaniques de récompense intrinsèque contre extrinsèque).
    https://en.wikipedia.org/wiki/Self-determination_theory
11. Understood.org. « What Is Dyscalculia » (prévalence de 5-10 %, difficulté de perception de la quantité et de correspondance numérale, sensibilité à la pression temporelle, recommandations de saisie multiple).
    https://www.understood.org/en/articles/what-is-dyscalculia
12. Apple Developer. Human Interface Guidelines — Accessibility (cible tactile minimale de 44 × 44 pt).
    https://developer.apple.com/design/human-interface-guidelines/accessibility

**Lacunes de preuve signalées dans ce rapport** (aucune source consultée n'a abordé ces points pour la tranche des 7-11 ans spécifiquement) : repères précis de durée de session par âge ; études sur la longueur des tutoriels d'intégration ; mesure de l'usage des tablettes familiales partagées/Chromebooks scolaires ; une étude dédiée au design de clavier numérique pour cette tranche d'âge. Les implications de conception reposant sur ces lacunes sont marquées ci-dessus comme déduites, et non citées comme un constat établi.
