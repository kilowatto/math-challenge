# Onboarding, inscription et activation : combien de champs, et pourquoi les visites guidées ne servent presque jamais

> Recherche Math Challenge — 2026-07-31 — sujet 45

## Résumé exécutif (FR)

- **L'inscription est le goulot d'étranglement mesurable.** HubSpot a
  analysé des formulaires de 40 000 clients et a trouvé qu'en passant de
  4 champs à 3, la conversion augmentait de **près de 50 %** [1]. Les
  repères de 2026 donnent une courbe complète : 23,1 % à 3 champs, 17,0 %
  à 5, 11,4 % à 7, 6,9 % à 10 ou plus [5].
- **La chute n'est pas linéaire.** Entre 5 et 7 champs, chaque champ
  supplémentaire coûte environ 2,8 points de pourcentage, contre environ
  1,5 avant cette plage [5] — c'est une falaise, pas une pente.
- **La relation n'est pas une loi.** Plusieurs sources documentent des cas
  où réduire les champs a *fait baisser* la conversion de 14 %, et des
  analyses où dix champs ont mieux converti que trois [3][5]. La lecture
  honnête : moins de champs aide presque toujours, mais c'est une
  hypothèse à mesurer, pas un axiome.
- **Nielsen Norman Group déconseille l'onboarding en général.** Sa
  recommandation littérale est *« évitez de créer un onboarding
  d'application dans la mesure du possible, et consacrez plutôt ces
  ressources à rendre l'interface plus utilisable »*, pour trois raisons :
  cela augmente le coût d'interaction, charge la mémoire de travail, et la
  recherche montre que cela n'améliore souvent pas la performance réelle
  sur la tâche [2].
- **Le carrousel de cartes est déconseillé nommément.** NN/g le signale
  explicitement : il fait *paraître l'interface plus complexe qu'elle ne
  l'est*, charge la mémoire de travail, et sa recherche sur les
  « deck-of-cards tutorials » a trouvé qu'ils **n'amélioraient pas la
  performance sur la tâche** [2].
- **Seuls trois cas justifient l'onboarding**, selon NN/g : recueillir une
  information indispensable, adapter l'expérience au contexte de
  l'utilisateur, et introduire des flux **véritablement inédits** qui
  s'écartent des schémas standards [2].
- **Ce qui fonctionne, c'est le contextuel.** NN/g privilégie l'aide en
  contexte plutôt que l'instruction anticipée : les indices apparaissent
  quand la fonction devient actionnable, pas à l'ouverture de
  l'application [2]. Les repères de guidage (*coach marks*) fonctionnent
  quand ils sont opportuns et discrets, et accompagnés de la tâche réelle
  [2].
- **Une règle visuelle concrète :** le style d'un indice doit rendre
  absolument évident qu'il s'agit d'une annotation et **non d'un élément
  interactif** [2].
- **NN/g recommande de tester d'abord l'application sans onboarding**, pour
  identifier les difficultés réelles avant d'investir dans des écrans pour
  les résoudre [2].
- Implication centrale pour Math Challenge : **inscription à 2 champs,
  configuration progressive et ignorable, et exactement cinq repères
  contextuels** — les cinq choses du produit qui sont vraiment inédites et
  ne s'expliquent pas d'elles-mêmes.

## Executive summary (EN)

- **Registration is the measurable bottleneck.** HubSpot analyzed forms from 40,000 customers and found that cutting fields from 4 to 3 raised conversion by **almost 50%** [1]. 2026 benchmarks give the full curve: 23.1% at 3 fields, 17.0% at 5, 11.4% at 7, 6.9% at 10+ [5].
- **The drop is non-linear.** Between 5 and 7 fields each added field costs ~2.8 percentage points versus ~1.5 below that range [5] — a cliff, not a slope.
- **It is not a law.** Sources document cases where cutting fields *lowered* conversion by 14%, and analyses where ten fields beat three [3][5]. Honest reading: fewer fields helps almost always, but it is a hypothesis to measure, not an axiom.
- **Nielsen Norman Group advises against onboarding generally.** Their literal recommendation is *"avoid creating app onboarding whenever possible and instead spend your resources making the UI more usable"* — because it raises interaction cost, strains working memory, and research shows it often fails to improve actual task performance [2].
- **The card-carousel format is disrecommended by name.** NN/g notes it makes interfaces *appear more complex than they are*, strains working memory, and their research on deck-of-cards tutorials found they **did not improve task performance** [2].
- **Only three cases justify onboarding**, per NN/g: gathering essential information, tailoring to user context, and introducing **genuinely novel** workflows that deviate from standard patterns [2].
- **What works is contextual.** NN/g champions contextual help over front-loaded instruction: tips appear when features become actionable, not upfront [2]. Coach marks work when timely, unobtrusive, and paired with actual task completion [2].
- **One concrete visual rule:** a hint's visual style must make unmistakably clear that it is an annotation and **not an interactive element** [2].
- **NN/g recommends testing the app without onboarding first**, to find genuine user difficulty before investing in screens to solve it [2].
- Core implication: **2-field registration, progressive and skippable configuration, and exactly five contextual marks** — the five things about this product that are genuinely novel and do not explain themselves.

## Constats

### 1. Le coût de chaque champ d'inscription

Le chiffre le plus cité et le mieux étayé vient de HubSpot, qui a étudié
des formulaires de contact de 40 000 clients : la conversion a **augmenté
de près de la moitié** en réduisant de 4 champs à 3 [1]. Une étude de
repères de 2026 trace la courbe complète et constitue la source la plus
utile pour budgétiser les champs [5] :

| Champs | Conversion |
|---|---|
| 3 | 23,1 % |
| 5 | 17,0 % |
| 7 | 11,4 % |
| 10+ | 6,9 % |

Ce qui compte n'est pas la pente moyenne mais **où se situe la rupture** :
entre 5 et 7 champs, chaque champ supplémentaire coûte environ 2,8 points
de pourcentage, contre environ 1,5 point par champ avant cette plage [5].
Autrement dit, le sixième et le septième champ coûtent bien plus cher que
le quatrième.

**L'avertissement à conserver.** La corrélation n'est ni parfaite ni
universelle : il existe des cas documentés où réduire les champs a produit
une **chute** de 14 % de la conversion, et au moins une analyse où dix
champs ont mieux converti que trois [3][5]. L'explication habituelle est
la qualité de l'intention — un long formulaire filtre les curieux —, ce
qui importe peu pour un produit gratuit dont l'objectif est que le papa
arrive à voir son enfant résoudre une addition. Pour Math Challenge, la
règle « moins de champs » s'applique avec force, mais elle est consignée
comme une hypothèse à mesurer, pas comme un fait établi.

### 2. La position de Nielsen Norman Group sur l'onboarding

C'est la partie inconfortable et la plus précieuse. La recommandation
principale de NN/g est que l'onboarding **doit être évité** : *"avoid
creating app onboarding whenever possible and instead spend your resources
making the UI more usable"* [2]. Le raisonnement repose sur trois piliers :
il augmente le coût d'interaction, charge la mémoire de travail, et la
recherche montre qu'il n'améliore souvent pas la performance réelle sur la
tâche [2].

NN/g reconnaît exactement trois scénarios qui justifient des écrans
d'onboarding [2] :

1. **Recueillir une information indispensable** (l'exemple qu'ils donnent :
   créer un compte sur une application bancaire).
2. **Adapter l'expérience** au contexte ou aux préférences de
   l'utilisateur.
3. **Introduire des flux véritablement inédits ou inconnus** qui s'écartent
   des schémas standards.

Et une recommandation de méthode qui vaut plus que n'importe quel schéma :
**tester d'abord l'application sans onboarding**, pour identifier les
difficultés réelles des utilisateurs avant d'investir dans des écrans pour
les résoudre [2].

### 3. Quel format fonctionne et lequel ne fonctionne pas

**Carrousel de cartes (« deck-of-cards tutorial ») : déconseillé
nommément.** NN/g signale qu'il fait *paraître l'interface plus complexe
qu'elle ne l'est* et charge la mémoire de travail ; sa recherche sur ce
format spécifique a trouvé qu'il **n'améliorait pas la performance sur la
tâche** [2]. C'est, de loin, le format le plus populaire de l'industrie et
le moins bien étayé.

**Repères de guidage et superpositions pédagogiques : utiles sous
conditions.** Ils fonctionnent quand ils sont **opportuns et discrets**, et
quand ils accompagnent l'exécution réelle de la tâche [2]. NN/g les
qualifie de *"nice-to-have"* plutôt que d'essentiels [2]. La règle visuelle
concrète : le style d'un indice doit rendre **absolument évident qu'il
s'agit d'une annotation, et non d'un élément interactif** [2].

**Promotion des fonctionnalités au lancement : à éviter.** Les
utilisateurs ont rarement besoin qu'on leur répète dans l'application ce
qu'ils ont déjà lu dans la boutique. Le schéma sert mieux les utilisateurs
existants qui découvrent de nouvelles fonctionnalités, et ne doit pas être
utilisé pour insister sur d'anciennes fonctionnalités peu utilisées [2].

**Aide contextuelle : le schéma que NN/g défend.** Il privilégie l'aide en
contexte plutôt que l'instruction anticipée, les indices apparaissant
quand la fonction devient actionnable pour l'utilisateur [2].

### 4. À propos des chiffres d'« engagement » qui circulent

Plusieurs sources secondaires de l'industrie citent des chiffres frappants
attribués à NN/g — par exemple, que le guidage déclenché par le
comportement aurait 68 % d'engagement en plus et 54 % de meilleure
adoption que les alternatives basées sur le temps ou la localisation. **Ce
chiffre n'a pas pu être vérifié par rapport à une publication de NN/g** au
cours de cette session, et il provient de blogs de fournisseurs d'outils
d'onboarding, qui ont un intérêt commercial direct à ce que l'onboarding
paraisse efficace. Il est consigné ici comme **non vérifié** et n'est pas
utilisé comme base d'aucune décision. La position documentée de NN/g
pointe, si tant est qu'elle pointe quelque part, dans la direction
inverse : moins d'onboarding, plus d'interface utilisable.

### 5. Ce qui est véritablement inédit dans Math Challenge

En appliquant le critère 3 de NN/g — seul ce qui s'écarte des schémas
standards mérite une explication — le produit compte exactement cinq
concepts qu'un utilisateur ne peut pas déduire de l'interface :

1. **L'âge et la difficulté sont des axes séparés** (D-002, D-017).
   Contre-intuitif et central ; sans cela, un papa ne comprend pas pourquoi
   son enfant de 7 ans voit un sujet de primaire mais du contenu de
   maternelle.
2. **L'enfant est un profil, pas un utilisateur** (D-013). Cela s'écarte
   du modèle mental « créer un compte pour mon enfant » que les gens
   apportent d'autres produits.
3. **Le placement n'est pas un examen**, et en maternelle il n'en a même
   pas l'air (D-002, `mc-44`).
4. **Les clubs et les salons n'ont pas de chat, et n'en auront jamais**
   (D-011, D-027). C'est une absence délibérée, et une absence ne
   s'explique pas d'elle-même.
5. **Les gages n'ont pas de perdant** (D-028). Cela s'écarte de ce que
   « pari » signifie pour quiconque arrive sur le produit.

Tout le reste — toucher la bonne réponse, voir ses points, changer de
profil — doit s'expliquer de lui-même, ou c'est un défaut d'interface, pas
un manque d'onboarding.

## Implications de conception

1. **Aucune inscription ne dépasse 3 champs, et aucune des nôtres n'a
   besoin de plus de 2.** E-mail et mot de passe pour les trois portes
   d'entrée (adulte, parent, enseignant). Tout le reste est de la
   configuration ultérieure.
2. **S'inscrire n'est pas se configurer.** Le profil de l'enfant, la
   tranche d'âge, la limite de temps d'écran et le salon sont demandés
   *après* l'inscription, en étapes séparées et ignorables avec des
   valeurs par défaut saines — la plage de 5-7 champs est justement où se
   trouve la falaise [5].
3. **Zéro carrousel de bienvenue**, dans aucune des cinq portes d'entrée.
   C'est le format que NN/g déconseille nommément et dont la recherche
   spécifique n'a trouvé aucune amélioration de la performance [2].
4. **Exactement cinq repères contextuels**, un par concept véritablement
   inédit (§5), chacun déclenché au moment où sa fonction devient
   actionnable, pas à l'ouverture de l'application [2].
5. **Chaque repère contextuel a l'apparence d'une annotation, jamais d'un
   contrôle.** Style visuel sans équivoque, distinct de tout élément
   touchable [2].
6. **L'adulte arrive à sa première question de mathématiques sans passer
   par un formulaire au-delà de l'inscription.** C'est l'épreuve du feu de
   « tester l'application sans onboarding » [2] appliquée au cas d'usage
   principal.
7. **La vérification de l'enseignant intervient avant de créer un salon,
   pas avant de s'inscrire.** Déplacer la friction d'identité vers
   l'inscription pénaliserait tout le monde pour une exigence qui ne
   s'applique qu'à ceux qui vont avoir des enfants d'autrui sous leur
   surveillance.
8. **Tout repère contextuel est définitivement rejetable et ne réapparaît
   plus.** Réapparaître est la version onboarding du schéma de
   « harcèlement » (nagging) que la FTC nomme explicitement (`mc-17`).
9. **Instrumenter l'entonnoir étape par étape dès le premier jour**, pour
   pouvoir mesurer l'hypothèse du §1 sur nos propres données plutôt que
   d'hériter du repère externe : inscription commencée → inscription
   terminée → premier profil créé → premier défi terminé.
10. **En maternelle, il n'y a aucun onboarding pour l'enfant, en aucun
    cas.** La première promenade dans la Savane *est* le placement
    (`mc-44`), et l'enfant ne lit pas — tout écran explicatif qui lui est
    destiné est, par définition, inutile.

## Questions ouvertes pour le porteur du projet

1. L'inscription de l'adulte utilise-t-elle un mot de passe, un lien
   magique ou une clé d'accès (passkey) ? Le lien magique réduit à **un**
   seul champ mais ajoute un saut vers la boîte mail en pleine activation.
2. L'entonnoir est-il mesuré avec Web Analytics (sans cookies,
   échantillonné à 10 % après 7 jours), ou faut-il quelque chose avec une
   rétention plus longue pour pouvoir comparer les cohortes d'inscription ?
3. Les cinq repères contextuels sont-ils rédigés par langue ou traduits ?
   Le ton d'une explication brève est précisément l'endroit où la
   traduction littérale sonne condescendante (`mc-37`).
4. Un test A/B à 2 contre 3 champs sur l'inscription du parent en vaut-il
   la peine, étant donné que les preuves externes ne sont pas unanimes
   (§1) ?

## Sources

1. HubSpot, analyse de formulaires de 40 000 clients (4→3 champs,
   environ +50 % de conversion), relayé via Venture Harbour, "5 Studies on
   How Form Length Impacts Conversion Rates" —
   https://ventureharbour.com/how-form-length-impacts-conversion-rates/
2. Nielsen Norman Group, "Mobile App Onboarding" —
   https://www.nngroup.com/articles/mobile-app-onboarding/ — source
   primaire de la position contre l'onboarding, du constat sur les
   deck-of-cards tutorials, des trois cas justifiés et de la règle
   visuelle annotation-vs-contrôle.
3. Cobloom, "Form Fields and Conversion Rates: Is Less Really More?" —
   https://www.cobloom.com/blog/form-fields-and-conversion-rates-is-less-really-more
   — source des contre-exemples (chute de 14 %, dix champs surpassant
   trois).
4. Mailmunch, "How Does Form Length Affect Your Conversion Rate" —
   https://www.mailmunch.com/blog/form-length-affect-conversion-rate
5. Digital Applied, "Form Conversion Rate Benchmarks 2026: 100+ Data
   Points" —
   https://www.digitalapplied.com/blog/form-conversion-rate-benchmarks-2026-data-points
   — source de la courbe 3/5/7/10+ et de la rupture non linéaire entre 5
   et 7 champs.

**Avertissement de méthode et de qualité des sources.** Seule la source
[2] est une recherche primaire d'une organisation UX indépendante. Les
sources [1], [3], [4] et [5] sont des publications de l'industrie du
marketing et de fournisseurs d'outils de formulaires, avec un intérêt
commercial dans le sujet qu'elles mesurent ; le chiffre de HubSpot est
cité de seconde main car l'étude originale n'a pas pu être récupérée
directement au cours de cette session. Les chiffres de conversion du §1
doivent être traités comme un **ordre de grandeur directionnel**, pas
comme des constantes. Le chiffre de « 68 % d'engagement en plus » qui
circule, attribué à NN/g, **n'a pas pu être vérifié et n'est pas utilisé**
(§4).
