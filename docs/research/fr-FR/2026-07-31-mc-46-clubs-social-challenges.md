# Clubs, défis de groupe et gages : comment avoir des paris sans perdant et sans exposition réglementaire

> Recherche Math Challenge — 2026-07-31 — sujet 46

## Résumé exécutif (FR)

- **Le jeu d'argent illégal se définit, dans pratiquement toute loi d'État américaine, par trois éléments : le prix, le hasard et la contrepartie — et les trois doivent être présents** [1]. Il suffit d'en éliminer un pour sortir du champ. La stratégie standard de l'industrie des jeux-concours est précisément celle-là : retirer au moins un élément [1].
- **Le hasard est déjà absent ici.** Un défi mathématique se gagne par habileté, pas par chance. La qualification juridique qui s'applique est celle des concours d'adresse, où *« les gagnants ne sont pas choisis par hasard mais sur la base d'un critère mesurable »* [1].
- **La contrepartie disparaît si la plateforme ne touche jamais rien de valeur.** La contrepartie signifie *« le paiement d'argent ou de quelque chose de valeur pour participer, ou l'obligation de faire un achat »* [1]. Si Math Challenge ne fait payer aucune entrée à un défi, ne retient rien, ne transfère rien et ne fait appliquer rien, il n'y a pas de contrepartie envers la plateforme.
- **Le prix peut aussi être minimisé :** des récompenses intangibles comme le *« droit de se vanter »* ont une valeur monétaire minimale et peuvent ne pas atteindre le seuil légal de « prix » [1].
- **Strava a déjà résolu le pari sans perdant, et ça marche.** Son mode *Group Goal* laisse le groupe poursuivre un objectif partagé et — selon sa propre documentation — *« n'a pas de classement, si bien qu'on finit par moins se comparer aux autres »* [2][3]. Il coexiste avec les défis compétitifs comme un mode alternatif, pas comme un remplacement.
- Strava propose quatre types de défi de groupe : *Most Activity*, *Fastest Effort*, *Longest Single Activity* et *Group Goal* — seul le dernier est coopératif [2][3].
- **Le véritable standard de sauvegarde dans le sport jeunesse** exige une vérification des antécédents pour *« tout bénévole ayant l'occasion d'un contact non supervisé ou en tête-à-tête avec des mineurs »*, plus une personne nommée comme contact de sauvegarde connue de tous [4][5]. Le mot qui compte est **non supervisé**.
- Nous ne pouvons pas faire de vérification des antécédents, mais nous pouvons **concevoir pour qu'aucun contact non supervisé n'existe** : pas de chat, pas de canal privé, le propriétaire du club ne voit que le pseudonyme et les points, et le parent de chaque enfant approuve l'entrée.
- **Aucun mineur n'entre jamais dans un défi avec gage.** Cela tient tout l'analyse de jeu d'argent loin des enfants, là où l'exposition réglementaire documentée dans `mc-17` (Belgique, Pays-Bas, DSA, Children's Code) serait sévère.
- **Larry modère le texte du gage avant même qu'il existe**, avec un jugement de jeu entre adultes : la blague passe, le sexe, la violence et le rabaissement ne passent pas — et rien qui désigne une personne ne passe. C'est un appel distinct de celui du tuteur, avec son propre prompt, son propre journal et un comportement à l'épreuve des pannes.
- Conclusion de conception : **deux systèmes séparés dans la base de données** — `grupo_infantil` (classe de l'enseignant + club de parents, règles identiques) et `club_adulto` (avec défis et gages) — pour qu'une fonctionnalité ajoutée « aux clubs » ne puisse pas atterrir par inadvertance sur les enfants.

## Executive summary (EN)

- **Illegal gambling is defined, across virtually all US state law, by three elements — prize, chance, and consideration — and all three must be present** [1]. Removing one is sufficient. That is precisely the standard sweepstakes-industry strategy: eliminate at least one element [1].
- **Chance is already absent here.** A math challenge is won on skill. The applicable framing is the skill-contest one, where *"winners are not selected by chance but instead chosen based on some measurable criteria"* [1].
- **Consideration is eliminated if the platform never touches anything of value.** Consideration means *"payment of money or something valuable to enter, or a requirement that a purchase must be made"* [1]. If Math Challenge charges nothing to enter, escrows nothing, transfers nothing, and enforces nothing, there is no consideration flowing to the platform.
- **Prize can be minimized too:** intangible rewards such as *"bragging rights"* carry minimal monetary value and may not meet the legal threshold for a prize [1].
- **Strava already shipped the loser-free wager, and it works.** Its *Group Goal* mode lets a group chase a shared target and — per its own documentation — *"doesn't have a ranked leaderboard so you end up comparing yourself to others less"* [2][3]. It coexists with competitive challenges as an alternate mode, not a replacement.
- **The real youth-sports safeguarding standard** requires background checks for *"any volunteer with the opportunity for unsupervised or one-on-one contact with minors"*, plus a named safeguarding contact known to everyone [4][5]. The load-bearing word is **unsupervised**.
- We cannot run background checks, but we can **design so no unsupervised contact exists**: no chat, no private channel, club owner sees only alias and points, and each child's own parent approves the join.
- **No minor is ever in a challenge with stakes.** That keeps the entire gambling analysis away from children, where the regulatory exposure documented in `mc-17` would be severe.
- **Larry moderates the stake text before it exists**, with adult-game judgment: the joke passes; sex, violence, and degradation do not — and nothing that singles out a person does. It is a separate call from the tutor's, with its own prompt, audit log, and fail-closed behavior.
- Design conclusion: **two separate systems at the data layer** — `grupo_infantil` and `club_adulto` — so a feature added to "clubs" cannot land on children by accident.

## Résultats

### 1. Les trois éléments, et comment on en élimine un

Thompson Coburn LLP résume le cadre qui gouverne tout cela : pratiquement toute loi d'État définit le jeu d'argent illégal comme la présence simultanée du **prix, du hasard et de la contrepartie**, et **les trois doivent être présents** pour qu'une promotion soit qualifiée de jeu d'argent illégal [1]. La stratégie entière de l'industrie des jeux-concours consiste à s'assurer d'en éliminer au moins un.

Comment on élimine chacun, selon la même source [1] :

- **Le prix.** Difficile à éliminer complètement, mais des récompenses intangibles comme le *« droit de se vanter »* ou la désignation de gagnant hebdomadaire ont une valeur monétaire minimale et **peuvent ne pas atteindre le seuil légal** de « prix ».
- **Le hasard.** On transforme le tirage au sort en concours d'adresse, où *« les gagnants ne sont pas choisis par hasard mais sur la base d'un critère mesurable »*. Alternativement, on le structure comme un cadeau où tout le monde reçoit quelque chose.
- **La contrepartie.** C'est celle qu'on élimine le plus souvent. Elle inclut *« le paiement d'argent ou de quelque chose de valeur pour participer, ou l'obligation de faire un achat »*. Notamment, exiger que quelqu'un **envoie ses coordonnées n'est pas une contrepartie** — d'où le fait que les voies d'entrée gratuites soient standard dans la conception des jeux-concours. La distinction juridique dépend de si le participant doit faire quelque chose **au-delà du comportement normal de client** pour entrer.

**Où se situe Math Challenge.** Le hasard est absent par la nature du produit : résoudre des défis mathématiques est un critère mesurable d'habileté, pas de chance. La contrepartie est absente tant que la plateforme ne fait pas payer l'entrée à un défi et ne retient, ne transfère ni ne fait appliquer rien de valeur. Et avec les formes de gage proposées plus bas (§3), le prix se réduit à de l'agentivité ou à une expérience partagée, c'est-à-dire proche du seuil du « droit de se vanter ».

**Il manque deux éléments sur trois, peut-être les trois.** Mais cette position dépend **entièrement** du fait que la plateforme ne touche jamais à la valeur. Le jour où Math Challenge retiendrait 20 $ de chaque participant, la contrepartie apparaît et l'analyse s'inverse complètement. C'est la ligne, et elle n'est pas floue.

### 2. Le précédent qui existe déjà : Strava Group Goal

Strava exploite quatre types de défi de groupe : *Most Activity* (qui accumule le plus de temps, de distance ou de dénivelé), *Fastest Effort* (allure moyenne), *Longest Single Activity*, et *Group Goal* (poursuivre un objectif partagé en groupe) [2][3]. Les trois premiers sont compétitifs avec classement ; le quatrième ne l'est pas.

La description que fait Strava du mode coopératif est l'observation de conception la plus utile de toute cette recherche : *« Si rivaliser avec vos amis n'est pas votre style, vous pouvez créer un défi Group Goal pour avancer ensemble vers un objectif partagé. Cette version du défi de groupe **n'a pas de classement, si bien qu'on finit par moins se comparer aux autres**»* [3].

Deux lectures importent. Premièrement, **l'absence de classement est la fonction, pas une limitation** — c'est ce qui fait que le mode sert celui que la compétition démotive, qui est exactement la population que `mc-18` identifie comme celle qui décroche en bas du classement. Deuxièmement, **Strava l'offre à côté des modes compétitifs, pas à leur place** : le choix du mode revient à l'organisateur du défi selon son groupe. Des analyses de la plateforme elle-même signalent que les défis de groupe priorisent la connexion sur la pure compétition et soutiennent la communauté [2].

Cela converge avec ce qui figure déjà dans `mc-18` : la méta-analyse de Johnson & Johnson (122 études, 286 résultats) constate que les structures coopératives surpassent systématiquement les structures compétitives et individualistes, tant en réussite qu'en relations entre pairs.

### 3. Ce qui rend un pari amusant, décomposé

Avant de proposer des formes, il vaut la peine de décomposer ce qui produit le plaisir d'un pari social. Quatre choses : que **tout le monde ait quelque chose en jeu**, que **le résultat compte**, qu'**il en reste une anecdote**, et que **le groupe ait fait quelque chose ensemble**.

**Aucune des quatre n'exige un perdant.** La punition du dernier n'est pas l'ingrédient actif — c'est une conséquence du fait de supposer, sans l'examiner, que le gage doit forcément retomber sur quelqu'un. De cette observation naissent trois formes qui conservent les quatre propriétés :

**A · Gage collectif.** Le groupe s'engage ensemble contre un objectif partagé. On gagne ou on ne gagne pas en groupe. C'est le *Group Goal* de Strava appliqué aux points de mathématiques, avec l'appui coopératif de Johnson & Johnson.

**B · Le gagnant choisit.** On inverse le sens du prix : le premier ne reçoit pas de tribut des autres, mais **décide** de quelque chose pour le groupe — le prochain défi, l'objectif du club, l'endroit où ils vont. Le prix est **de l'agentivité, pas un tribut**. Juridiquement c'est la forme la plus propre, parce que décider n'a pas de valeur monétaire et frôle le seuil du « droit de se vanter » que [1] signale comme probablement insuffisant pour constituer un prix.

**C · Engagement personnel.** Chacun parie contre son propre objectif, publiquement. C'est la forme la mieux soutenue par les preuves : ce sont les intentions de mise en œuvre de Gollwitzer déjà documentées dans `mc-19`, avec des effets larges et reproduits (100 % contre 53 % de respect des auto-examens ; 4,2 kg contre 2,1 kg de perte de poids). C'est aussi, non par hasard, le mécanisme par lequel HealthyWage soutient que ce n'est pas du jeu d'argent : son argument public est que **l'utilisateur contrôle le résultat à tout moment** [6].

### 4. La propriété structurelle qui rend la modération superflue

Les trois formes partagent quelque chose qui vaut plus que n'importe quelle règle de modération : **aucune n'a de case « perdant ».**

- Dans le gage collectif, le texte décrit ce que fait **le groupe**.
- Dans « le gagnant choisit », c'est **celui qui a gagné** qui l'écrit, sur ce qui suit.
- Dans l'engagement personnel, on ne peut écrire **que sur soi-même**.

Dans aucune des trois n'existe de champ qui réponde à « qu'est-ce qui arrive au dernier ? ». Cela signifie que **le texte libre peut exister sans que l'humiliation ait où atterrir** : ce n'est pas qu'écrire ça soit interdit, c'est qu'il n'y a pas de case dans le modèle de données pour la mettre. C'est la même logique structurelle avec laquelle `mc-43` résout les pseudonymes (un choix dans un ensemble borné plutôt qu'une saisie libre), appliquée un niveau au-dessus : au lieu de borner le vocabulaire, on borne **l'objet dont le texte peut parler**.

**Risque résiduel, dit franchement.** Ce n'est pas hermétique. Quelqu'un peut écrire, dans un gage collectif, « on va manger des tacos et Jean se rase la tête ». Ce que la structure garantit, c'est que le système ne *désigne* jamais Jean, ne le pointe jamais du doigt et ne le fait jamais appliquer — le gage reste celui du groupe. Cette brèche est celle que Larry referme en §5, et ce qui reste ensuite se corrige par la procédure : le gage est visible **avant** que le défi commence, **tous les membres l'acceptent explicitement** pour rester dedans, n'importe qui peut se retirer sans pénalité, il ne peut pas être modifié une fois lancé, et il y a un bouton de signalement permanent. Avec cela, personne ne se retrouve soumis à un gage qu'il n'a ni lu ni accepté.

### 5. Larry comme modérateur de gages

**Décision du propriétaire :** le texte libre des gages est révisé par Larry avant que le gage n'existe, avec un critère explicite de **jeu entre adultes** — la blague passe ; le sexe, la violence et le rabaissement ne passent pas.

**Cela ne rompt pas le canon « Larry ne calcule jamais ».** Cette règle, documentée dans `mc-37` et D-004, existe pour une raison précise : un tuteur qui recalcule des mathématiques se trompe et enseigne l'erreur. Juger si un texte est dégradant est une tâche différente, et c'est de celles que les modèles de langage font bien. Ce qui s'hérite bien, c'est que **c'est un autre appel, pas le même** : prompt propre, modèle propre, journal propre, et aucune relation avec le point de terminaison du tuteur.

**Le critère que Larry applique**, par ordre de précédence :

1. **Désigne-t-il une personne ?** Un gage qui nomme un individu comme celui qui porte la conséquence est rejeté, même sur le ton de la blague. C'est la seule règle qui n'admet pas de nuance, parce que c'est celle qui soutient la ligne rouge du produit.
2. **Y a-t-il du sexe, de la violence ou du rabaissement ?** C'est rejeté. Cela inclut ce qui rabaisse par l'apparence, le poids, l'origine, les capacités ou toute caractéristique d'une personne — le canon de Larry interdit déjà que l'humour porte sur les caractéristiques des personnes (`mc-37`), et on l'étend ici de ce que Larry *dit* à ce que Larry *laisse passer*.
3. **Est-ce un jeu entre adultes ?** Si ça passe 1 et 2, **ça passe**. Larry n'est pas un censeur du bon goût : « celui qui gagne choisit le bar », « le club paie la première tournée », « le gagnant choisit la playlist pendant un mois » sont des gages légitimes et Larry n'a pas à donner son avis dessus.

**Le ton du refus compte autant que le refus lui-même.** Larry ne fait pas de sermon. `mc-11` est explicite sur le fait que la rétroaction dirigée vers la personne plutôt que vers la tâche est le mécanisme par lequel plus d'un tiers des interventions étudiées **aggravent** le résultat — et bien que ce constat porte sur l'apprentissage, le mécanisme social est le même : un refus moralisateur transforme un adulte en adversaire du produit. Larry refuse brièvement, dans son personnage, sans leçon : *« Celui-là, je vais devoir te le refuser — il laisse tout le groupe dans le gage, pas une seule personne. On retente ? »*

**Comportement à l'épreuve des pannes.** Si l'appel de modération échoue ou expire, le gage **n'est pas publié**. On montre que Larry n'a pas pu le réviser et on propose de réessayer. On ne publie jamais de texte non révisé, sous aucune condition d'erreur — le mode de défaillance bon marché est un utilisateur contrarié, le mode de défaillance coûteux est une humiliation publiée que le produit avait promis impossible.

**Routage et coût.** Le volume est trivial comparé à celui du tuteur : un appel par gage créé, pas par tentative. Haiku 4.5 suffit pour le cas clair, avec escalade vers Sonnet 5 quand le verdict est de faible confiance — la nuance entre « blague entre amis » et « rabaissement » est justement là où un petit modèle se trompe dans les deux sens. Avec le routage de D-015 et le plafond de dépense d'AI Gateway, cela ne bouge pas l'aiguille du budget.

**Faux positifs et appel.** Larry va se tromper, et il va rejeter des blagues légitimes. Sans voie d'appel, cela se ressent comme de la censure et c'est la plainte qui va arriver. Tout gage rejeté doit pouvoir être envoyé en révision humaine d'un geste, et cette file d'attente a besoin d'un responsable et d'un délai de réponse engagé — la même file que celle des signalements.

**Journal.** Chaque décision est enregistrée : texte proposé, verdict, modèle, motif et confiance. Cela sert à trois choses : affiner le prompt avec des cas réels, résoudre les appels avec des preuves, et détecter qui insiste à faire passer la même chose dix fois avec des variantes.

### 6. Les clubs de parents et le véritable standard de sauvegarde

La littérature du sport jeunesse est la référence la plus proche de « un adulte organise une activité pour des enfants qui ne sont pas les siens ». Le standard général qu'elle rapporte : une vérification des antécédents est requise pour *« tout bénévole ayant l'occasion d'un contact non supervisé ou en tête-à-tête avec des mineurs »* — y compris les parents coordinateurs qui organisent des activités ou gèrent des communications impliquant un contact avec des enfants [4][5]. Une vérification minimale couvre les antécédents pénaux fédéraux et le registre des délinquants sexuels ; il est recommandé de la répéter chaque année ou chaque saison, avec un consentement écrit préalable [4][5]. Et structurellement : il doit exister **une personne nommée, dont tout le monde connaît le nom et le contact**, comme premier point de contact pour toute préoccupation de sauvegarde [5].

**Math Challenge ne peut pas faire de vérification des antécédents**, et prétendre le contraire serait pire que de ne rien faire. Mais la définition elle-même indique où se situe le risque : **le contact non supervisé**. La solution de conception consiste à éliminer la catégorie entière :

- **Pas de chat ni de messages directs, dans aucune direction, jamais.** C'est déjà la règle pour les enseignants (D-011) ; elle s'étend à l'identique aux clubs.
- **Le propriétaire du club voit exclusivement le pseudonyme, les points et la série.** Ni nom réel, ni âge exact, ni photo, ni aucun autre groupe auquel l'enfant appartient.
- **Le parent de chaque enfant approuve l'entrée**, et voit l'identité déclarée du propriétaire avant d'approuver — le motif inversé de ClassDojo que `mc-28` identifie comme le seul mécanisme de sécurité confirmé dans l'industrie.
- **On invite en partageant un code avec les parents**, jamais en recherchant ni en contactant des enfants.
- **Un plafond dur plus petit qu'une classe** : un club est un groupe d'amis, pas une école.
- **Bouton de signalement permanent** et journal complet des inscriptions, approbations et départs.

L'affirmation honnête qui en découle : **un club de parents est sûr précisément parce qu'il est anémique.** C'est un tableau partagé, pas un espace social. Chaque fois que quelqu'un proposera d'y ajouter un chat, des photos ou des profils, la réponse est déjà écrite ici, avec sa raison.

### 7. Pourquoi deux systèmes et non un avec un indicateur

`grupo_infantil` (qui couvre la classe de l'enseignant et le club de parents, avec des règles de sécurité identiques) et `club_adulto` (avec défis et gages) doivent être des **structures séparées dans la base de données**, pas une table avec un champ `type`.

La raison n'est pas de modélisation mais de mode de défaillance. Avec une seule table, le jour où quelqu'un ajoute du texte libre, des messages ou du téléversement d'images « aux clubs », cette fonctionnalité atterrit par défaut aussi sur les groupes d'enfants, et la protection dépend du fait que celui qui écrit ce code se souvienne de la règle. Avec deux structures, ajouter du texte libre au club des adultes **ne peut pas** toucher les enfants même si personne ne se souvient de rien. C'est la différence entre une convention et un verrou.

## Tableau des formes de gage

| Forme | Qui porte la conséquence | Classement | Appui | Élément juridique qu'elle élimine |
|---|---|---|---|---|
| **A · Collectif** | Le groupe entier, ensemble | Non (par conception) | Strava Group Goal [2][3] ; Johnson & Johnson via `mc-18` | Prix (expérience partagée, sans transfert) |
| **B · Le gagnant choisit** | Personne ; le premier gagne de l'agentivité | Oui | Thompson Coburn sur les prix intangibles [1] | Prix (décider n'a pas de valeur monétaire) |
| **C · Engagement personnel** | Soi-même, contre son propre objectif | Optionnel | Gollwitzer via `mc-19` ; position de HealthyWage [6] | Hasard (vous contrôlez entièrement votre résultat) |
| ~~Punition du dernier~~ | ~~Celui qui est resté en arrière~~ | — | **Interdit** : ligne rouge n° 7, `mc-18` sur le préjudice en bas du classement | — |
| ~~Tribut entre membres~~ | ~~Les perdants paient le gagnant~~ | — | **Interdit** : crée un prix + un transfert de valeur entre personnes | — |

## Implications de conception

1. **Aucun mineur n'entre jamais dans un défi avec gage.** Les groupes d'enfants ont des objectifs et des célébrations ; les gages vivent exclusivement dans `club_adulto`. Cela sort les enfants de toute l'analyse de §1.
2. **La plateforme ne touche jamais à la valeur** : elle ne fait pas payer l'entrée à un défi, ne retient rien, ne transfère rien, n'arbitre rien et ne fait rien appliquer. Le gage est un accord social que le produit affiche, pas une obligation que le produit administre. C'est l'unique condition qui soutient la position de §1.
3. **Les trois formes de gage (A, B, C) s'implémentent comme des types distincts**, pas comme des variantes de texte d'un même objet — parce que chacune a un sujet grammatical différent (le groupe, le gagnant, soi-même) et c'est cette différence qui élimine la case « perdant » (§4).
4. **Il n'existe aucun champ qui demande ce qui arrive au dernier**, sous aucune forme, sur aucun écran, dans aucune API.
5. **Larry révise tout gage en texte libre avant qu'il existe**, avec le critère en trois étapes de §5 : désigner une personne est toujours rejeté, sexe/violence/rabaissement sont rejetés, et tout le reste passe sans que Larry ait à donner son avis.
6. **La modération est un appel séparé de celui du tuteur** — prompt propre, journal propre, routage propre (Haiku 4.5 avec escalade vers Sonnet 5 en cas de faible confiance). Elle ne partage ni point de terminaison ni prompt avec Larry Profe.
7. **À l'épreuve des pannes : si Larry ne peut pas réviser, le gage n'est pas publié.** Il n'y a jamais de texte non révisé en production, sous aucune condition d'erreur.
8. **Larry rejette brièvement et dans son personnage, sans sermon** — un refus moralisateur transforme l'adulte en adversaire du produit, et le canon de Larry interdit déjà le ton condescendant (`mc-11`, `mc-37`).
9. **Tout gage rejeté a un droit d'appel vers une révision humaine d'un geste.** Larry va rejeter des blagues légitimes, et sans appel cela se ressent comme de la censure.
10. **Tout gage est accepté explicitement par chaque membre avant que le défi commence**, il est visible dès avant, il ne peut pas être modifié une fois lancé, et n'importe qui peut se retirer du défi sans pénalité ni désignation (§4).
11. **Bouton de signalement permanent sur chaque gage et chaque club**, avec révision humaine — la seconde couche, pour ce que Larry laisse passer.
12. **Deux structures de données séparées**, `grupo_infantil` et `club_adulto`, pour qu'aucune fonctionnalité sociale ajoutée aux adultes ne puisse atteindre les enfants par omission (§7).
13. **Le propriétaire d'un groupe d'enfants voit le pseudonyme, les points et la série. Rien de plus.** Ni nom réel, ni âge exact, ni appartenance à d'autres groupes.
14. **Zéro canal privé adulte-enfant**, dans n'importe quel groupe d'enfants, qu'il soit d'enseignant ou de parent — la mitigation directe de ce que §6 identifie comme le risque réel.
15. **Le parent de chaque enfant approuve, en voyant d'abord l'identité déclarée du propriétaire du club**, avec un badge visible quand cette identité n'est pas vérifiée.
16. **Plafond de taille de club d'enfants plus petit que celui d'une classe**, et limite de clubs par compte, parce que la création illimitée de groupes est le levier qu'un abuseur utiliserait.
17. **Journal complet et visible pour le parent** de qui a demandé l'accès, qui a approuvé et quand — l'équivalent du « contact de sauvegarde nommé » qu'exige [5], adapté à un produit sans personnel.
18. **Ne pas présenter le club de parents comme équivalent à la supervision d'un vrai club sportif.** Un texte honnête : c'est un tableau partagé entre des familles qui se connaissent déjà, pas un programme supervisé.
19. **Consigner la position juridique de §1 par écrit et la faire réviser par un avocat avant d'activer les gages sur n'importe quel marché** — ce document est de la recherche, pas un avis juridique, et la conclusion « il manque deux éléments sur trois » dépend de faits produit qu'un changement de feuille de route peut invalider.

## Questions ouvertes pour le propriétaire du projet

1. Un adolescent de 12-17 ans peut-il être dans un `club_adulto` ? La réponse par défaut de ce document est **non** (implication 1), mais cela ferme le cas d'un groupe de cousins ou de camarades de lycée.
2. Le catalogue de gages démarre-t-il vide avec du texte libre dès le premier jour, ou est-il amorcé avec des exemples curés montrant le ton attendu ? L'amorcer est la manière économique de communiquer la norme sans l'interdire.
3. L'acceptation explicite du gage (implication 5) se fait-elle par défi ou une seule fois par club ? Par défi est plus sûr et plus contraignant.
4. Les défis de club d'adultes affectent-ils le classement global, ou vivent-ils isolés dans le club ? S'ils l'affectent, il faut revoir le contrôle d'exposition des items de `mc-29`.
5. Qui prend en charge la file d'attente des appels et des signalements (implications 9 et 11), et avec quel délai de réponse engagé ? Est-ce la même personne pour les deux files ou deux personnes différentes.
6. Quand Larry rejette un gage, dit-il à l'auteur **laquelle** des trois règles a été enfreinte, ou seulement que ça n'est pas passé ? Le dire aide à corriger ; cela apprend aussi à contourner le filtre.
7. Le prompt de modération de Larry est-il rédigé par langue ou traduit ? Le rabaissement est fortement culturel — ce qui est une blague entre potes au Mexique peut ne pas l'être en Allemagne, et inversement.
6. Un club d'enfants peut-il mélanger les enfants de plusieurs familles qui **ne** se connaissent **pas** entre elles, ou se limite-t-il à des familles ayant déjà un lien préalable ? C'est la différence entre un risque borné et un risque ouvert.

## Sources

1. Thompson Coburn LLP, "Shield your sweepstakes from gambling laws" — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — source des trois éléments, des définitions citées de la contrepartie et du hasard, et de l'observation sur les prix intangibles.
2. Strava Community Hub, "Combining Competition and Collaboration with Group Challenges" — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494
3. Strava Support, "Group Challenges" — https://support.strava.com/en-us/articles/15401736-group-challenges — source des quatre types de défi et de la citation sur l'absence délibérée de classement dans Group Goal.
4. JDP, "The Ultimate Guide to Background Checks for Youth Sports Volunteers" — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/
5. TidyHQ, "SafeSport Compliance Checklist for US Youth Sports Organizations" — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — source du standard de « contact non supervisé » et de l'exigence de contact de sauvegarde nommé.
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — source de la position publique selon laquelle l'utilisateur contrôle le résultat, utilisée ici comme précédent argumentatif, pas comme validation juridique.
7. Recherche interne : `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson sur les structures coopératives ; préjudice concentré en bas du classement), `2026-07-31-mc-19-habit-loops-push-notifications.md` (intentions de mise en œuvre de Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (la brèche de vérification de l'enseignant, T-5), `2026-07-31-mc-43-avatars-identity-progression.md` (choix borné plutôt que saisie libre), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (exposition réglementaire des mécaniques de hasard avec des mineurs), `2026-07-31-mc-37-larry-profe-port.md` (canon de Larry, routage des modèles, le motif de l'appel séparé), `2026-07-31-mc-11-feedback-formative-assessment.md` (pourquoi le refus moralisateur est contre-productif).

**Ceci est de la recherche, pas un avis juridique.** La conclusion de §1 — qu'il manque au moins deux des trois éléments — repose sur des faits produit (la plateforme ne fait pas payer, ne retient rien, ne transfère rien, ne fait rien appliquer) qui doivent rester vrais pour que la conclusion tienne. Un avocat doit la réviser avant d'activer les gages sur n'importe quel marché, et la source [1] date de 2011 et est américaine : elle ne couvre ni le Mexique, ni le Brésil, ni l'UE, où `mc-17` a déjà documenté que la Belgique et les Pays-Bas ont légiféré sur les mécaniques de hasard de façon plus stricte que les États-Unis.
