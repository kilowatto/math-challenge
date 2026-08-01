# Design d'interface et d'interaction pour les enfants de 3 à 6 ans (bande KINDER)

> Math Challenge research — 2026-07-31 — topic 20

## Résumé exécutif (FR)

Les enfants de 3 à 6 ans ont une précision motrice bien inférieure à celle d'un
adulte : Hourcade et al. (2004) ont mesuré une précision de pointage de 90 %
chez les enfants de 4 ans seulement avec des cibles de 23,7 mm, bien au-dessus
des ~9 mm (44pt) que supposent les guides pour adultes [1][2]. Le
glisser-déposer (« drag-and-drop ») est le geste qui échoue le plus à cet âge :
il est significativement plus lent que le tap selon la loi de Fitts chez les
enfants de 4-6 ans (mais pas chez les enfants de 7-10 ans) [4], et apparaît de
façon répétée comme le geste le plus difficile à exécuter, avec le double tap
et le tracé [3][5]. La politique d'Apple pour la catégorie Kids exige des
« parental gates » avec des tâches de niveau adulte avant les achats ou les
liens externes, et des indications vocales pour les enfants qui ne lisent pas
[11]. Le cadre des « quatre piliers » de Hirsh-Pasek (actif, engagé,
significatif, socialement interactif) est le standard académique pour évaluer
si une appli est réellement éducative, pas seulement « éducative » de nom [10].
NN/g documente que les enfants de 3-5 ans préfèrent l'animation et le son — à
l'inverse des adultes — et qu'ils ont besoin d'une navigation spatiale et de
métaphores de la vie réelle parce qu'ils ne lisent pas encore [8][9]. La FTC a
sanctionné Epic Games à hauteur de 520 M$ pour des dark patterns qui
permettaient des achats accidentels par des mineurs [13], ce qui est
directement pertinent pour tout flux de paiement ou de sortie de l'appli. Ce
rapport traduit ces résultats en une spécification concrète pour la bande
KINDER de Math Challenge : tailles de cible tactile, typographie, palette,
son, animation, profondeur de navigation, nombre de taps pour démarrer un
défi, forme de l'input de réponse, et comportement face à une réponse
incorrecte, différencié par téléphone, tablette et bureau.

## Executive summary (EN)

Children aged 3-6 have markedly lower motor precision than adults. Hourcade et
al. (2004) measured 90% pointing accuracy in 4-year-olds only at 23.7mm
targets, well above the ~9mm (44pt) adult guideline baseline [1][2].
Drag-and-drop is the gesture that fails most at this age: it is significantly
slower than tapping under Fitts' law for 4-6-year-olds (but not for
7-10-year-olds) [4], and repeatedly surfaces as the hardest gesture alongside
double-tap and tracing [3][5]. Apple's Kids category policy requires
"parental gates" — adult-level tasks — before purchases or external links, and
voice prompts for pre-literate children [11]. Hirsh-Pasek's "four pillars"
framework (active, engaged, meaningful, socially interactive) is the academic
standard for whether an app is actually educational rather than educational in
name only [10]. NN/g documents that 3-5-year-olds prefer animation and sound —
unlike adults, who usually dislike them — and need spatial navigation and
real-life metaphors because they cannot yet read [8][9]. The FTC fined Epic
Games $520M over dark patterns enabling accidental purchases by minors [13],
directly relevant to any payment or exit flow. This report translates those
findings into a concrete spec for Math Challenge's KINDER band: touch target
sizes, typography, palette, sound, animation, navigation depth, taps to start
a challenge, answer-input shape, and wrong-answer behavior, broken out by
phone, tablet, and desktop.

## Findings

### 1. Développement moteur et précision tactile

Hourcade, Bederson, Druin et Guimbretière (2004) ont testé le pointage à la
souris chez des enfants d'âge préscolaire et ont trouvé que la taille de la
cible avait « un effet significatif sur la précision et la ré-entrée dans la
cible » ; les enfants de 4 ans n'ont atteint une précision de pointage de 90 %
qu'avec des tailles de cible d'environ **23,7 mm** — environ 2,5 fois le
repère adulte communément cité de 44pt (~9,2 mm) [1][2]. Les travaux
spécifiques à l'écran tactile confirment le même écart pour l'input à contact
direct. « Touch interaction for children aged 3 to 6 years » de Vatavu,
Cramariuc et Schipor a étudié des enfants au stade préopératoire de Piaget
exécutant du tap et du glisser-déposer sur téléphones et tablettes et a
rapporté une erreur et une variance systématiquement plus élevées que les
lignes de base adultes [3]. Un article de synthèse, « Physical dimensions of
children's touchscreen interactions: Lessons Learned », a mené six études
avec plus de 180 participants (116 enfants) et cite la conclusion de Baloian
et al. (2013) selon laquelle le **tracé, le double tap et le glisser-déposer
étaient les gestes les plus difficiles** à exécuter de façon fiable pour les
enfants de 5-6 ans [5][6]. La recherche sur la capacité gestuelle par âge
rapporte que les enfants de 2-3 ans peuvent exécuter tap, glissement et
flick, tandis que les enfants de 4-6 ans ajoutent le glisser-déposer et le
pincer-zoomer — mais avec un taux de réussite nettement plus bas que les
enfants d'âge scolaire : une étude a trouvé que seuls les enfants de 7-8 ans
atteignaient un glisser-déposer fiable (30 % de réussite) et suivaient des
instructions audio/vidéo (34 %) [6]. Une étude de validité de la loi de Fitts
a trouvé que le temps de mouvement était « significativement plus élevé pour
le glisser-déposer que pour le tap » spécifiquement chez les enfants de 4-6
ans, l'écart disparaissant vers 7-10 ans — le déficit est lié à l'âge et se
referme vers le CP.

### 2. Pourquoi le glisser-déposer pose problème, et ce qui fonctionne à la place

Le glisser-déposer requiert un contact soutenu du doigt, un suivi visuel
continu d'une cible en mouvement, et un relâchement contrôlé — trois
sous-tâches motrices/attentionnelles chaînées, ce qui explique pourquoi il
sous-performe constamment le simple tap dans la littérature ci-dessus
[3][4][5][6]. Une étude de l'Université York (FittsFarm) a trouvé que la
précision du glisser-déposer s'améliorait significativement avec un **stylet
peu coûteux par rapport à l'input au doigt**, puisque le stylet réduit
l'occlusion et le bruit de zone de contact d'un bout de doigt [7]. Le compte
rendu de prototypage de Khan Academy Kids a atteint une conclusion
complémentaire : les réponses en glisser-déposer étaient corrélées *plus
fortement* avec d'autres items d'évaluation valides que le tap, parce que les
enfants traitent le glissement comme plus délibéré — utile pour l'évaluation,
mais une raison de le réserver aux cas où le caractère délibéré est
souhaité, pas pour l'input de routine [15]. Implication pratique pour les
3-6 ans : **privilégier le tap-pour-sélectionner par rapport au
glisser-déposer** pour la mécanique de réponse principale ; si un glissement
est utilisé du tout (par ex. « place la pomme dans le panier »), garder la
distance courte, la cible grande, et ajouter un aimant d'aimantation à la
cible pour qu'un relâchement imprécis compte quand même comme correct.

### 3. Design centré sur l'audio et synthèse vocale

Comme la lecture n'est « pas du tout » développée à cet âge selon la
recherche par bandes d'âge de NN/g (3-5 vs. 6-8 vs. 9-12) [8][9], chaque
instruction, chiffre et invite a besoin d'un équivalent parlé, pas seulement
de texte. La recherche plus récente de NN/g sur l'UX enfantine a trouvé que
les enfants de 3 ans pouvaient déjà reconnaître les icônes de lecteur vidéo
(lecture, pause, volume, plein écran) par exposition répétée même sans
lecture, suggérant que l'association icône+son construit une compréhension
réelle et transférable à cet âge [9]. Les tests internes de Khan Academy Kids
offrent aussi une mise en garde utile ici : ajouter des sons uniques aux
personnages à l'écran a fait que les enfants « passaient plus de temps à
taper sur les monstres pour entendre les bruits qu'à se concentrer sur » la
tâche — la nouveauté sonore peut elle-même devenir une distraction, donc le
son doit être intentionnel (confirmer une action, lire une invite) plutôt que
décoratif-interactif [15].

### 4. Compréhension des icônes

La recherche sur les pictogrammes/icônes traite généralement la compréhension
des symboles comme encore en développement pendant les années préscolaires et
insiste sur la concrétude plutôt que l'abstraction — une icône photo-réaliste
ou littérale (une pomme, un nombre entier de points) est comprise bien avant
une icône abstraite ou métaphorique [17][18]. Cela s'aligne avec la
conclusion de NN/g selon laquelle les enfants de 3 ans reconnaissaient les
icônes *fonctionnelles* liées à une action cohérente et répétée
(lecture/pause) plutôt que des icônes nouvelles ou ponctuelles [9].

### 5. Personnages, mascottes et animation

NN/g rapporte explicitement que les jeunes enfants (3-5 ans) « ont montré une
préférence pour l'animation et le son », soulignant que c'est l'inverse de la
préférence adulte, où de tels éléments sont « généralement mal aimés » [8].
C'est l'une des divergences les plus claires entre l'UX adulte et enfantine
dans ce corpus et justifie un investissement au niveau du thème dans une
mascotte cohérente pour la bande KINDER, puisqu'un personnage récurrent est
aussi le véhicule pour la livraison de voix off et pour adoucir le retour en
cas de mauvaise réponse (voir §7).

### 6. Couleur et design visuel

Une étude dédiée sur la couleur d'interface pour les applications d'enfants a
trouvé que « la fréquence de haute saturation dans les interfaces
utilisateur pour enfants est plus élevée que dans les interfaces utilisateur
pour adultes » [16], et des travaux d'eye-tracking sur la préférence de
couleur des enfants ont trouvé que les teintes chaudes (rouge, orange, jaune)
dominent légèrement, bien que l'interaction précise entre teinte/saturation/
luminosité reste non concluante au niveau de la recherche [19]. Les
directives typographiques convergent vers une police sans-serif grande,
simple et arrondie : une synthèse praticienne spécifie un minimum de 18-19px
pour le texte de corps/étiquette pour cette bande d'âge, bien au-dessus du
texte de corps mobile adulte [12].

### 7. Retour, récompense et gestion des erreurs

Les tests d'utilisabilité de NN/g affirment sans détour que les jeunes
enfants « attendent un retour sur chaque action qu'ils effectuent » [12] — le
silence après un tap se lit comme « cassé », pas « rien ne s'est passé ».
Combiné à l'accent mis par le cadre des quatre piliers sur l'engagement
*significatif* plutôt que sur des boucles de récompense clinquantes [10], et
à l'avertissement de la synthèse de Smashing Magazine selon lequel les
mécaniques de récompense extrinsèque peuvent saper la motivation intrinsèque
avec le temps [12], l'implication est : donner un retour sensoriel instantané
(son + micro-animation) à chaque tap, mais garder la couche de *récompense*
(étoiles, badges, célébration de la mascotte) liée à un achèvement de tâche
authentique, pas au simple fait de taper.

### 8. Navigation, durée de session et sorties accidentelles

Les directives de la catégorie Kids d'Apple exigent une « parental gate » —
une tâche de niveau adulte telle qu'un problème de mathématiques — avant un
achat intégré ou tout lien vers du contenu externe, avec des invites vocales
pour que les enfants qui ne lisent pas encore comprennent pourquoi ils sont
bloqués [11]. Le programme Families de Google Play impose des obligations de
politique comparables pour la revue du contenu et de la publicité
comportementale [14]. La FTC traite formellement les dark patterns qui
permettent aux enfants d'accumuler des achats sans qu'un parent le remarque
comme une pratique trompeuse ; son règlement de 2022 avec Epic Games au sujet
de Fortnite a coûté 520 M$ spécifiquement pour des « dark patterns visant à
piéger les joueurs pour qu'ils fassent des achats non désirés » accessibles
aux enfants [13]. Sur la durée de session, les directives les plus récentes
de l'AAP sur les médias pour enfants (couvertes dans une publication
healthychildren.org de 2026) organisent les recommandations par bande d'âge
— incluant « petite enfance 0-5 » — et appellent à des « designs centrés sur
l'enfant » construits avec les enfants et les familles dans le processus de
design, bien que l'extrait public ne donne pas de chiffre exact de minutes
par session [20] ; traiter tout chiffre spécifique comme une décision
produit, pas comme un standard cité, en l'absence du rapport technique
*Pediatrics* complet.

### 9. Connexion sans lecture

Aucune des sources récupérées ne spécifie d'étude nommée de « mot de passe
en images » pour cette tranche d'âge exacte, et c'est une véritable lacune de
preuve dans la littérature appliquée trouvée. Ce qui est établi, et sur quoi
toute connexion basée sur image/avatar/PIN devrait être construite, c'est
(a) la preuve de NN/g et de la lignée Hourcade selon laquelle la
reconnaissance d'icônes par exposition répétée est fiable bien avant que la
lecture de texte ne le soit [9], et (b) l'exigence d'Apple selon laquelle
toute action protégée par un adulte pour cette tranche d'âge utilise un
**mécanisme non textuel, associé à de l'audio** [11]. Un motif de grille
d'avatars « choisis ton visage » (utilisé par des applis façon Khan Academy
Kids) est cohérent avec les deux : il ne requiert aucune lecture, aucune
saisie, et est trivialement rapide à exécuter correctement pour un enfant de
4 ans.

### 10. Co-jeu parental

Le cadre des quatre piliers lui-même traite « socialement interactif » comme
l'un des quatre piliers requis d'une appli éducative — une appli qui est
meilleure *avec* un adulte co-joueur obtient un meilleur score sur cette
dimension, pas un moins bon [10]. Le mécanisme de parental gate d'Apple et le
programme Families de Google formalisent tous deux une couche distincte et
séparée, orientée parent (paramètres, approbation d'achat, limites de temps)
de l'expérience orientée enfant [11][14], ce qui est l'architecture à copier :
deux surfaces clairement séparées, pas un écran partagé unique avec des
contrôles adultes cachés.

## Implications de design pour Math Challenge

1. **Cible tactile minimale : 88×88px CSS sur téléphone/tablette, 76×76px
   acceptable sur bureau avec souris.** Dérivé du chiffre de 23,7 mm de
   Hourcade et al. à une base typique d'environ 160dpi (≈150px sur une toile
   d'assets haute densité, s'échelonnant à ~88-96px CSS après prise en
   compte du ratio de pixels de l'appareil) [1][2], et recoupé avec le
   minimum praticien de Smashing Magazine de 75×75px pour cette bande d'âge
   [12]. Utiliser le chiffre le plus grand, pas la ligne de base HIG adulte
   de 44pt (~9mm) — ce chiffre est documenté comme trop petit pour les
   enfants de 4 ans par une large marge [1].
2. **Pas de glisser-déposer comme mécanique de réponse principale.** Utiliser
   le tap-pour-sélectionner (par ex. taper le bon nombre/objet parmi 3-4
   grands choix). Réserver toute interaction de glissement à un moment
   secondaire/de célébration (par ex. glisser un autocollant sur un tableau
   de récompense), avec de grandes zones d'aimantation à la cible, parce que
   le glisser-déposer est le geste qui échoue le plus systématiquement dans
   la littérature pour les 3-6 ans [3][4][5][6].
3. **Chaque écran et chaque invite a un équivalent parlé (TTS ou VO
   enregistrée), déclenché automatiquement à l'entrée sur l'écran, rejouable
   en tapant sur la mascotte.** Aucune invite ne devrait reposer sur le
   texte seul, puisque la lecture n'est pas développée à cet âge [8][9].
4. **Typographie : 24-32px minimum pour tout chiffre ou étiquette à
   l'écran** (plus grand que le plancher praticien de 18-19px pour le texte
   de corps [12], parce que le contenu principal de Math Challenge est
   constitué de chiffres que les enfants doivent discriminer visuellement
   rapidement, pas du texte de paragraphe), sans-serif arrondie, épaisseur
   de trait élevée pour la lisibilité au premier coup d'œil.
5. **Palette : couleurs primaires à haute saturation, à tendance chaude**
   pour l'habillage du thème KINDER (mascotte, boutons, états de
   célébration), cohérent avec la saturation mesurée plus élevée dans les
   interfaces enfantines par rapport aux interfaces adultes et la préférence
   des enfants pour les teintes chaudes [16][19]. Garder la saturation plus
   basse sur la couche fond/toile pour que les objets tapables soient les
   éléments les plus saturés à l'écran — la saturation elle-même devient une
   affordance pour « ceci est tapable ».
6. **Son : intentionnel uniquement, pas décoratif-interactif.** Un
   carillon de confirmation à chaque tap (selon la conclusion de NN/g sur le
   « retour à chaque action » [12]), une narration vocale du chiffre/de
   l'invite, et des répliques vocales de la mascotte au succès/à la
   nouvelle tentative — mais aucun son ambiant au toucher pour les éléments
   de fond, selon la conclusion de Khan Academy Kids selon laquelle les sons
   de nouveauté détournent l'attention de la tâche [15].
7. **Animation : chaque changement d'état s'anime** (appui sur bouton,
   révélation correcte/incorrecte, réactions de la mascotte) — l'animation
   est une préférence documentée à cet âge plutôt que le défaut adulte de
   « réduire les animations » [8]. Respecter les réglages de réduction des
   animations au niveau de l'OS comme dérogation d'accessibilité, mais ne
   pas mettre par défaut un thème KINDER à animation minimale.
8. **Profondeur de navigation : maximum 2 taps depuis l'ouverture de
   l'appli jusqu'à « un défi est en cours de réponse ».** Tap 1 : choisir
   l'avatar/le profil enfant (pas de connexion, voir #9). Tap 2 : taper la
   mascotte ou un unique grand bouton « Jouer ». Cela correspond à la
   preuve que les structures de menu profondes et la navigation multi-étapes
   sont le type de complexité conçue par des adultes que les 3-6 ans ne
   peuvent pas parser de façon fiable sans lecture [8][12].
9. **Connexion : sélection en grille d'avatars, aucun PIN et aucun mot de
   passe tapé pour la bande KINDER.** Une grille de 4-6 grandes tuiles
   d'avatar (une par profil enfant du foyer), tapée une fois, remplace
   fonctionnellement la connexion ; toute action orientée parent
   (changement de facturation des profils, paramètres) se trouve derrière
   une surface séparée, protégée par un adulte, selon l'exigence de
   parental gate d'Apple [9][11].
10. **Comportement en cas de mauvaise réponse : pas de croix rouge, pas de
    buzzer, aucun langage d'« échec ».** La mascotte donne une indication
    audio encourageante (« Presque ! »), le mauvais choix vibre/s'estompe
    doucement plutôt que de disparaître, et l'enfant est invité à réessayer
    sur le même écran — cohérent avec le fait de garder le retour
    encourageant plutôt que punitif à un âge où NN/g documente que
    l'image de soi est facilement meurtrie par un cadrage « c'est pour les
    bébés » si le ton méjuge le stade développemental de l'enfant [8][10].
11. **Une surface de paramètres/achats réservée aux parents, protégée par un
    problème de mathématiques ou un motif d'appui long, jamais accessible
    par un tap accidentel depuis l'expérience enfant** — implémentant
    directement l'exigence de parental gate de la catégorie Kids d'Apple
    [11] et évitant la responsabilité liée aux dark patterns pour laquelle
    la FTC a sanctionné 520 M$ dans une catégorie de produit comparable
    [13]. Aucun flux d'achat intégré ne devrait être accessible du tout
    depuis la surface orientée enfant pour la bande KINDER ; toutes les
    actions d'achat/abonnement vivent exclusivement derrière la parental
    gate.
12. **Structure de session/niveau : manches de défi courtes et
    autonomes (60-120 secondes chacune) avec un point d'arrêt naturel
    (célébration de la mascotte + invite « rejouer ? ») tous les 3-5
    manches**, pour qu'un parent puisse terminer une session à une limite
    propre plutôt qu'en milieu de tâche — la poussée de l'AAP pour un design
    centré sur l'enfant et impliquant la famille soutient la construction de
    points de pause naturels plutôt qu'une structure de défilement infini,
    même si aucun chiffre exact de minutes n'est citable à partir de
    l'extrait récupéré [20].
13. **Adaptation spécifique au bureau : garder le même minimum de cible de
    76px+ et la mécanique tap-en-premier (clic-en-premier) ; ne pas
    introduire d'input clavier uniquement pour la bande KINDER**, puisque
    aucune des recherches sur la précision ne suppose une aisance au
    clavier à cet âge et que la recherche sur la précision de pointage à la
    souris (l'étude Hourcade originale) utilisait la même logique de grande
    cible que le tactile [1].
14. **Design d'icônes : littéral, pas abstrait** — une pomme entière pour
    « 1 pomme », pas une fraction stylisée d'une pomme ; des icônes
    fonctionnelles (lecture, accueil, réessayer) répétées à l'identique sur
    chaque écran pour que la reconnaissance se transfère, selon la
    conclusion de NN/g selon laquelle des icônes répétées et cohérentes sont
    ce que les enfants de 3 ans apprennent réellement à reconnaître [9].

## Anti-patterns à éviter

- **Le glisser-déposer comme seul moyen de répondre à une question** — le
  mode de défaillance le plus systématiquement documenté de cette bande
  d'âge [3][4][5][6].
- **Des cibles tactiles de 44pt/9mm** copiées des directives mobiles
  adultes générales — mesurées comme insuffisantes pour les enfants de 4 ans
  par Hourcade et al. [1][2].
- **Tout achat, abonnement ou lien externe accessible sans parental gate**
  — un risque d'application de la FTC, pas seulement une question d'UX
  [11][13].
- **Des invites ou instructions uniquement textuelles** sans équivalent
  audio — inutilisables par un non-lecteur par définition [8][9].
- **Un son décoratif au toucher pour des éléments non actionnables** —
  distrait mesurablement les enfants de la tâche en cours [15].
- **Un retour punitif en cas de mauvaise réponse** (croix rouge, buzzer,
  « Faux ! », choix qui disparaissent) — va à l'encontre du ton encourageant
  dont cette bande d'âge a besoin et risque une réaction « cette appli ne
  m'aime pas » que la recherche de NN/g montre que les enfants articulent
  directement (« c'est pour les bébés ») quand le ton méjuge l'âge [8].
- **Une navigation profonde ou cachée** (menus hamburger, paramètres
  multi-niveaux dans la surface orientée enfant) — cette tranche d'âge ne
  peut pas naviguer de façon fiable dans des structures qui supposent la
  lecture ou la mémoire des écrans précédents [8][12].
- **Des mécaniques de récompense qui récompensent le fait de taper/de
  s'engager en soi** plutôt que l'achèvement de la tâche — sape le pilier
  « significatif » du cadre des quatre piliers et la motivation intrinsèque
  plus largement [10][12].
- **Des mots de passe ou PIN tapés pour le changement de profil orienté
  enfant** — aucune preuve récupérée ne soutient la saisie d'identifiants
  tapés comme utilisable pour un enfant de 4 ans qui ne lit pas, et les
  propres directives d'Apple supposent une protection non textuelle pour
  cette tranche d'âge [11].
- **La lecture automatique vers le contenu suivant sans point d'arrêt** —
  va à l'encontre de la poussée de l'AAP pour un design centré sur l'enfant
  et impliquant la famille, et supprime la limite de session naturelle dont
  un parent a besoin [20].

## Questions ouvertes pour le propriétaire du projet

1. La bande KINDER devrait-elle prendre en charge **plus d'un profil
   enfant par foyer** via la connexion en grille d'avatars, ou Math
   Challenge est-il un seul enfant par compte pour cette bande ?
2. Un **chemin d'input stylet/Apple Pencil** vaut-il la peine d'être pris en
   charge sur tablette pour les activités bonus basées sur le glissement,
   étant donné la conclusion de FittsFarm selon laquelle le stylet améliore
   matériellement la précision du glisser-déposer enfantin par rapport au
   doigt [7] ?
3. Quelle est la **position de Math Challenge sur toute monnaie de
   récompense** (étoiles, pièces) pour KINDER — purement
   cosmétique/festive, ou liée au déblocage de contenu, étant donné la
   tension que la littérature signale entre les mécaniques de récompense et
   la motivation intrinsèque [10][12] ?
4. Les invites de limite de session (« rejouer ? ») devraient-elles
   **compter pour ou réinitialiser** toute fonctionnalité de limite
   quotidienne que l'appli ou les contrôles parentaux au niveau de l'OS
   pourraient appliquer ?
5. Pour la parental gate, le propriétaire préfère-t-il **un défi
   arithmétique simple** (le propre motif suggéré par Apple [11]) ou un
   motif **d'appui long** — le premier double comme contenu dans le thème,
   le second est plus rapide pour un parent qui veut ouvrir les paramètres
   souvent ?

## Sources

1. Hourcade, J.P., Bederson, B.B., Druin, A., Guimbretière, F. (2004).
   "Differences in pointing task performance between preschool children and
   adults using mice." ACM TOCHI. https://dl.acm.org/doi/10.1145/1035575.1035577
2. ResearchGate summary of Hourcade et al. (2004), citing 23.7mm target /
   90% accuracy for 4-year-olds.
   https://www.researchgate.net/publication/220286166_Differences_in_pointing_task_performance_between_preschool_children_and_adults_using_mice
3. Vatavu, R.-D., Cramariuc, G., Schipor, D.M. "Touch interaction for children
   aged 3 to 6 years: Experimental findings and relationship to motor
   skills." International Journal of Human-Computer Studies.
   https://www.sciencedirect.com/science/article/pii/S1071581914001426
4. "Children's interaction with touchscreen devices: Performance and validity
   of Fitts' law" (movement-time comparison, drag-and-drop vs. tap, ages
   4-6 vs. 7-10).
   https://www.researchgate.net/publication/355490786_Children's_interaction_with_touchscreen_devices_Performance_and_validity_of_Fitts'_law
5. "Physical dimensions of children's touchscreen interactions: Lessons
   Learned" (six studies, 180+ participants incl. 116 children; cites
   Baloian et al. 2013 on tracing/double-tap/drag-and-drop difficulty).
   https://www.sciencedirect.com/science/article/pii/S1071581918302441
6. "Ability of children to perform touchscreen gestures and follow prompting
   techniques when using mobile apps" (gesture ability by age, 2-3 vs. 4-6
   vs. 7-8).
   https://www.researchgate.net/publication/339053838_Ability_of_children_to_perform_touchscreen_gestures_and_follow_prompting_techniques_when_using_mobile_apps
7. "FittsFarm: Comparing Children's Drag-and-Drop Performance Using Finger
   [and Stylus]." York University / INTERACT 2019.
   https://www.yorku.ca/mack/interact2019.html
8. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for
   Young People." https://www.nngroup.com/articles/childrens-websites-usability-issues/
9. Nielsen Norman Group. "UX Design for Children (Ages 3-12)" report.
   https://www.nngroup.com/reports/children-on-the-web/
10. Hirsh-Pasek, K., Zosh, J.M., Golinkoff, R.M., et al. (2015). "Putting
    Education in 'Educational' Apps: Lessons from the Science of Learning."
    Psychological Science in the Public Interest.
    https://journals.sagepub.com/doi/abs/10.1177/1529100615569721
11. Apple Developer. "Design safe and age-appropriate experiences" (Kids
    category guidance: age bands, parental gates, data/ad restrictions).
    https://developer.apple.com/kids/
12. Smashing Magazine (2024). "A Practical Guide to Designing for Children"
    (75×75px minimum tap target, 18-19px text, feedback-on-every-action,
    reward-vs-intrinsic-motivation caution).
    https://www.smashingmagazine.com/2024/02/practical-guide-design-children/
13. FTC. Press release, "Fortnite Video Game Maker Epic Games to Pay More
    Than Half a Billion Dollars over FTC Allegations" (dark patterns enabling
    unauthorized charges by children), 2022.
    https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations
14. Google Play Console. "Families" program policies.
    https://play.google.com/console/about/programs/families/
15. Khan Academy Blog. "Prototyping Playful and Nimble Pre-K Assessments"
    (audio-as-distraction finding; drag-and-drop vs. tap assessment
    validity). https://blog.khanacademy.org/prototyping-playful-and-nimble-pre-k-assessments/
16. "Color design in application interfaces for children." Color Research &
    Application (Wiley). https://onlinelibrary.wiley.com/doi/abs/10.1002/col.22726
17. Siegler, R. "Using Symbols: Developmental Perspectives" (children's
    understanding of words, photographs, scale models, maps, text).
    https://siegler.tc.columbia.edu/wp-content/uploads/2020/08/wcs.1280.pdf
18. Frontiers in Developmental Psychology. "Exploring the Potential Relations
    Between a Novel Visual [icon-matching task] and preschool spatial/math
    skill." https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2026.1746813/full
19. Frontiers in Psychology. "Using head-mounted eye trackers to explore
    children's color preferences" (warm-hue preference).
    https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1205213/full
20. AAP / HealthyChildren.org. "A Child-Friendly Digital World: AAP Releases
    New Media Recommendations" (age-banded guidance incl. early childhood
    0-5, child-centered design).
    https://www.healthychildren.org/English/news/Pages/creating-a-child-friendly-digital-world-AAP-releases-new-media-recommendations.aspx
21. Kirkorian, H.L., et al. (2017). "All Tapped Out: Touchscreen Interactivity
    and Young Children's Self-Regulation and Word Learning." Frontiers in
    Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00578/full
