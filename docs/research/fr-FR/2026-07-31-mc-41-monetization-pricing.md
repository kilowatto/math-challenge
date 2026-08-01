# Monétisation et tarification pour l'edtech mathématique familiale — ce que facturent réellement les comparables, et ce qu'exigent réellement les régulateurs

> Recherche Math Challenge — 2026-07-31 — sujet 41

## Résumé exécutif (FR)

Les comparables en mathématiques et en edtech familiale convergent vers un
schéma clair : le contenu curriculaire de base est gratuit ou quasi
gratuit, et ce qui est facturé, ce sont la personnalisation, le suivi
parental et les améliorations cosmétiques/motivationnelles. Prodigy offre
tout le contenu de mathématiques et d'anglais gratuitement aux enseignants
et aux élèves, et facture aux parents 9,95 à 19,95 $ US/mois
(Core/Plus/Ultra) pour l'analytique, la monnaie de jeu et une seconde
matière, avec une **remise additionnelle de 25 % par enfant supplémentaire**
sur le même compte [2]. IXL facture à partir de 9,95 $ US/mois pour un
enfant (mathématiques seulement) et **4 $ US/mois par enfant
supplémentaire**, ou 79 $ US/an [1]. Mathletics n'offre aucune remise
familiale : c'est 19,95 $ US par enfant, par mois, sans plus [3]. Photomath
utilise un modèle freemium classique (0 $ / 9,99 $ par mois / 69,99 $ par
an) [4]. Khan Academy reste gratuit à 100 %, financé par des donateurs
(Google, la Fondation Gates, Carlos Slim, AT&T, Elon Musk) pour des dizaines
de millions de dollars cumulés, et ne facture que son tuteur IA optionnel
(Khanmigo, ~4 $/mois) [7]. Kumon ne publie aucun prix national : chaque
centre franchisé fixe son propre tarif, typiquement 140 à 200 $ US/mois par
matière plus 50 à 100 $ de frais d'inscription, selon des agrégateurs (non
vérifié auprès d'une source primaire) [8].

La donnée la plus utile pour décider de l'empaquetage de Math Challenge
est le benchmark 2026 de RevenueCat : la catégorie éducation favorise les
formules annuelles dans 59 % des paywalls affichés, avec un prix annuel
médian de 44,99 $ US (le plus élevé de toutes les catégories), et les
essais gratuits de 17 à 32 jours convertissent 1,7 fois mieux que ceux de
4 jours ou moins [donnée de référence, voir Sources]. Cela suggère un essai
de 14 jours comme minimum raisonnable et une ancre de prix annuelle, pas
mensuelle.

Côté paiements, Stripe confirme une prise en charge complète d'OXXO
(Mexique, paiement unique seulement, sans renouvellement automatique,
plafond de 10 000 MXN) et de Pix (Brésil, avec une taxe IOF de 3,5 % si
l'entreprise n'est pas domiciliée au Brésil, et Pix Automático récurrent en
statut « sur invitation seulement » à l'intérieur du Brésil) [10][11]. Le
plus important pour l'activité : **Stripe Tax n'a pas le Brésil dans sa
liste de pays pris en charge** pour le calcul automatique des taxes — même
pas pour les produits numériques [14] — alors que le Mexique, lui, est
totalement pris en charge, avec un enregistrement à la TVA obligatoire
dans les 30 jours suivant la première vente à un client mexicain, sans
seuil minimal [15]. Dans l'UE, le système de guichet unique (OSS) permet un
seul enregistrement et une seule déclaration pour les 27 pays [16].

Côté commissions des boutiques d'applications : depuis avril 2025, Apple
ne peut plus prélever aucune commission sur les ventes dirigées vers un
lien externe aux États-Unis (jugement pour outrage contre Apple, en appel)
[17], et dans l'UE le DMA oblige à autoriser les liens externes et les
boutiques alternatives, avec une amende de 500 millions d'€ contre Apple en
avril 2025 [18]. Cela rend la facturation sur le web (hors app store) plus
viable que jamais si Math Challenge est empaqueté comme une PWA enveloppée.

## Executive summary (EN)

Family math comparables converge on one pattern: core curriculum content is free or nearly free, and the paid layer is personalization, parent-facing analytics, and cosmetic/motivational extras. Prodigy gives all math and English content free to teachers and students, and charges parents $9,95–19,95 USD/month (Core/Plus/Ultra) for analytics, in-game currency, and a second subject, with an **extra 25% discount per additional child** on the same account [2]. IXL starts at $9,95 USD/month for one child (math only) plus **$4 USD/month per additional child**, or $79 USD/year [1]. Mathletics offers no family discount at all: $19,95 USD per child, per month, flat [3]. Photomath runs a classic freemium ladder ($0 / $9,99 monthly / $69,99 annual) [4]. Khan Academy stays 100% free, funded by tens of millions of dollars in cumulative philanthropic donations (Google, the Gates Foundation, Carlos Slim, AT&T, Elon Musk), monetizing only its optional AI tutor (Khanmigo, ~$4/month) [7]. Kumon publishes no national price at all — each franchised center sets its own rate, aggregator estimates put it at $140–200 USD/month per subject plus a $50–100 enrollment fee, unverified against a primary source [8].

The single most useful data point for packaging Math Challenge is RevenueCat's 2026 benchmark report: the education category favors annual plans in 59% of paywalls shown, with a median annual price of $44,99 USD (the highest of any category), and 17–32 day trials convert 1,7× better than trials of 4 days or fewer (see Sources). This argues for a 14-day-minimum trial and an annual price anchor rather than a monthly one.

On payments, Stripe confirms full support for OXXO (Mexico, one-time payment only, no auto-renewal, 10 000 MXN cap) and Pix (Brazil, with a 3,5% IOF tax if the business isn't Brazil-domiciled, and recurring Pix Automático still invite-only for Brazil-based accounts) [10][11]. Most consequential for the business model: **Stripe Tax does not list Brazil among its supported countries** for automatic tax calculation, even for digital products [14] — while Mexico is fully supported, with mandatory IVA registration within 30 days of the first sale to a Mexican customer and no minimum threshold [15]. In the EU, the One-Stop-Shop (OSS) scheme lets one registration and one return cover all 27 member states [16].

On app-store commissions: since April 2025 Apple can no longer collect any commission on sales routed through an external link in the US (contempt ruling, under appeal) [17], and in the EU the DMA compels link-outs and alternative app stores, backed by a €500 million fine against Apple in April 2025 [18]. This makes web-based billing (outside any app-store wrapper) more viable than at any point in the last decade if Math Challenge is ever wrapped as a native shell.

## Tableau tarifaire des concurrents

| Produit | Formule | Prix | Devise | Ce qui est gratuit | URL source | Date de consultation |
|---|---|---|---|---|---|---|
| IXL | Familial — 1 enfant, mensuel | 9,95 $/mois | USD | Rien au-delà d'une garantie de remboursement de 30 jours ; pas de palier gratuit permanent | https://la.ixl.com/afiliacion/familiar/eligir-plan/mensual/matematicas | 2026-07-31 |
| IXL | Familial — 1 enfant, annuel | 79 $/an (6,59 $/mois effectif) | USD | — | idem | 2026-07-31 |
| IXL | Enfant supplémentaire (toute formule) | +4 $/mois par enfant | USD | — | idem | 2026-07-31 |
| Prodigy Math | Core | 9,95 $/mois ou 58,95 $/an | USD | Contenu de base en mathématiques + anglais, usage enseignant illimité | https://www.prodigygame.com/Memberships/math/ | 2026-07-31 |
| Prodigy Math | Plus | 14,95 $/mois ou 88,95 $/an | USD | — | idem | 2026-07-31 |
| Prodigy Math | Ultra (offre groupée maths+anglais) | 19,95 $/mois ou 118,95 $/an | USD | — | idem | 2026-07-31 |
| Prodigy Math | Remise multi-enfants | 25 % de remise supplémentaire | USD | — | idem | 2026-07-31 |
| Mathletics | Maison, par enfant | 19,95 $/enfant/mois (essai gratuit de 14 jours) | USD | Essai de 14 jours seulement, pas de palier gratuit permanent | https://parent.prod.eastus2.mathletics.com/subscription/create/create-account | 2026-07-31 |
| Photomath | Basic | 0 $ | USD | Explications étape par étape, aides visuelles, conseils « comment/pourquoi » | https://photomath.com/ | 2026-07-31 |
| Photomath | Plus, mensuel | 9,99 $/mois | USD | — | idem | 2026-07-31 |
| Photomath | Plus, annuel | 69,99 $/an | USD | — | idem | 2026-07-31 |
| Duolingo | Gratuit | 0 $ | USD | Contenu de cours complet, financé par la publicité | https://www.duolingo.com/super | 2026-07-31 |
| Duolingo | Súper (individuel) | non affiché avant le passage en caisse | USD | — | idem | 2026-07-31 |
| Duolingo | Súper Familia (jusqu'à 6 utilisateurs) | non affiché avant le passage en caisse | USD | — | idem | 2026-07-31 |
| Brilliant | Gratuit | 0 $ | USD | Leçon quotidienne, accès limité aux cours | https://brilliant.org/premium/ | 2026-07-31 |
| Brilliant | Premium | non affiché avant le passage en caisse (annuel « meilleure offre » vs mensuel) | USD | — | idem | 2026-07-31 |
| Khan Academy | Plateforme de base | 0 $ | USD | Tout : cours, exercices, outils enseignants | https://en.wikipedia.org/wiki/Khan_Academy | 2026-07-31 |
| Khan Academy | Tuteur IA Khanmigo | ~4 $/mois (selon Wikipédia ; non vérifié indépendamment sur khanacademy.org, qui a bloqué la récupération automatisée) | USD | — | idem | 2026-07-31 |
| Kumon | Par matière, par mois | non publié au niveau national ; estimation d'agrégateur 140-200 $/mois | USD | Aucun — pas de palier gratuit ; la franchise fixe le prix local | https://www.kumon.com/ (aucune page de tarifs n'existe) | 2026-07-31 |
| Kumon | Frais d'inscription | non publié ; estimation d'agrégateur 50-100 $ ponctuels | USD | — | (non vérifié, source secondaire) | 2026-07-31 |
| Mathspace | — | n'a pas pu être récupéré (403 Forbidden en direct et via la recherche) | — | — | https://mathspace.co/us/pricing | 2026-07-31 (échec) |

## Constatations

### Le freemium est la norme ; le paywall se cache derrière l'analytique et les extras, pas le contenu de base

Chaque produit de mathématiques en vente directe au consommateur étudié
garde la boucle d'apprentissage de base gratuite ou quasi gratuite et
facture une seconde couche : tableaux de bord parentaux et rapports de
progression (Prodigy, IXL, Mathletics), un tuteur IA (Khanmigo de Khan
Academy), ou la suppression de la publicité et une profondeur de pratique
illimitée (Duolingo, Photomath). Aucun des cinq produits étudiés ne place
la pratique des compétences de base derrière un paywall strict — le
rapport 2026 de RevenueCat constate que les paywalls stricts convertissent
environ 5 fois mieux que le freemium (10,7 % contre 2,1 % de médiane
téléchargement-vers-payant), mais la norme de catégorie dans l'edtech
mathématique pour enfants est le freemium quand même, ce qui suggère que
le marché a jugé que la confiance parentale et le bouche-à-oreille (un
enfant doit vraiment apprécier le produit gratuit avant qu'un parent ne
paie) l'emportent sur l'avantage brut de taux de conversion consistant à
verrouiller le contenu immédiatement.

### La tarification familiale/multi-enfants a deux formes : le siège incrémental à prix réduit, et le forfait plat par enfant

IXL et Prodigy utilisent tous deux un modèle **prix de base + siège
incrémental à prix réduit** : le premier enfant d'IXL coûte 9,95 $/mois et
chaque enfant supplémentaire coûte 4 $/mois — soit une remise d'environ
60 % par siège supplémentaire [1]. Prodigy adopte plutôt une approche par
remise en pourcentage : 25 % de remise forfaitaire sur le total à l'achat
d'abonnements pour plusieurs enfants [2]. Mathletics, à l'inverse, facture
19,95 $ par enfant **sans aucune remise de volume** [3] — un modèle SaaS
strictement par siège, inhabituel parmi les produits en vente directe aux
parents, et à noter comme référence de « ce qui se passe si on ne se
préoccupe pas d'une formule familiale ».

### La tarification annuelle en premier et les longs essais dominent spécifiquement l'éducation

Le rapport State of Subscription Apps 2026 de RevenueCat est le benchmark
primaire le plus solide obtenu pendant cette session : les applications
éducatives affichent des formules annuelles sur 59 % des paywalls (la part
de préférence annuelle la plus élevée de toutes les catégories mesurées),
avec un prix annuel médian de 44,99 $ — là encore le médian le plus élevé
de toutes les catégories, ce qui implique que les parents acceptent de
payer davantage d'avance pour un engagement sur une année complète que les
utilisateurs d'autres catégories d'applications. Le même rapport montre que
la durée d'essai compte énormément : les essais de 17 à 32 jours
convertissent en payant à 42,5 % de médiane contre 25,5 % pour les essais
de 4 jours ou moins, un écart de 1,7 fois. Appliqué aux comparables :
l'essai de 14 jours de Mathletics se situe près du point optimal ; l'essai
de 7 jours de Duolingo est court selon ce benchmark.

### Le modèle gratuit de Khan Academy est une histoire de financement philanthropique, pas de freemium

Khan Academy est une organisation à but non lucratif 501(c)(3) ; selon ses
déclarations IRS Form 990 (résumées par Wikipédia), elle a déclaré 31
millions de dollars de revenus en 2018 et 28 millions en 2019, financée
par des subventions nommées : Google a contribué 2 millions de dollars en
2010 (Project 10^100), AT&T a donné 2,25 millions de dollars en 2015 pour
le développement mobile, la Fondation Bill & Melinda Gates a donné plus de
10 millions de dollars cumulés, la Fondation Luis Alcázar de Carlos Slim a
financé la traduction vidéo en espagnol en 2013, et Elon Musk a fait don
de 5 millions de dollars en janvier 2021 [7]. Ceci est structurellement
différent de tous les autres comparables de ce tableau — ce n'est pas un
modèle économique que Math Challenge (un produit payé par les parents,
selon le brief) peut reproduire, mais cela fixe l'attente de palier
gratuit à laquelle toute application de maths est désormais confrontée :
une large fraction des parents a déjà été habituée à l'idée que « le bon
contenu de pratique mathématique est gratuit », ce qui renforce le
constat freemium-pas-paywall-strict ci-dessus.

### Kumon ne publie délibérément aucun prix, parce que le prix est local et en personne

Le site de Kumon lui-même n'a pas de page tarifs ; il redirige chaque
client potentiel vers « Book a free assessment » dans un centre physique
[8]. C'est une activité structurellement différente — du tutorat en
franchise en personne, pas du SaaS — mais c'est pertinent pour la question
du « canal école/enseignant » de Math Challenge ci-dessous, car cela
démontre un modèle de monétisation alternatif durable, vieux de plusieurs
décennies (frais de scolarité mensuels par matière plus des frais
d'inscription ponctuels) qui commande toujours une tarification premium
(140-200 $/mois par matière selon les estimations d'agrégateurs)
précisément parce qu'il inclut une relation humaine en direct, qu'une PWA
ne peut pas reproduire et ne devrait pas essayer de concurrencer
directement sur le prix.

### Les moyens de paiement qui comptent par marché, confirmés selon la documentation de Stripe elle-même

La vue d'ensemble des moyens de paiement de Stripe regroupe les options en
cartes, prélèvements bancaires, redirections bancaires, virements
bancaires, achetez-maintenant-payez-plus-tard, paiements en temps réel,
vouchers et portefeuilles électroniques, et note explicitement que
« different payment methods are more dominant in certain regions...
offering more options reduces the possibility of losing a customer at
checkout » [9]. Pour les marchés cibles de Math Challenge spécifiquement :

- **Mexique** : OXXO (voucher/espèces) est réservé au Mexique, en MXN
  seulement, plafonné à 10 000 MXN par transaction, réglé jusqu'à T+4, et
  **ne prend en charge ni les paiements récurrents, ni les remboursements,
  ni les litiges** [10]. Cela signifie qu'OXXO peut financer un achat
  ponctuel ou annuel mais ne peut pas renouveler automatiquement un
  abonnement — une méthode par carte ou bancaire reste nécessaire pour le
  renouvellement. Le Mexique dispose aussi d'une méthode d'échelonnement
  dédiée prise en charge par Stripe (« meses sin intereses »), unique au
  Mexique parmi la famille achetez-maintenant-payez-plus-tard [9].
- **Brésil** : Pix est une méthode de virement bancaire en temps réel
  gérée par la Banco Central do Brasil ; Stripe prend en charge Pix à la
  fois en paiement unique et récurrent (via « Pix Automático ») [11].
  Élément critique : **la facturation récurrente Pix Automático est sur
  invitation seulement pour les comptes Stripe domiciliés au Brésil**,
  bien que les comptes domiciliés dans de nombreux autres pays (y compris
  les États-Unis) puissent accepter Pix, y compris récurrent, de clients
  brésiliens [11]. Tout client brésilien payant une entreprise non
  domiciliée au Brésil via Pix se voit aussi facturer la taxe IOF
  brésilienne sur la conversion de devise, actuellement 3,5 % de la
  transaction — payable par le client par défaut, bien que le marchand
  puisse l'absorber via le paramètre `amount_includes_iof` [11]. Boleto
  (voucher) est l'autre grande méthode proche des espèces au Brésil, dans
  la même famille non récurrente qu'OXXO [9].
- **Allemagne** : le prélèvement SEPA est la solution naturelle — libellé
  en EUR, prend en charge nativement la facturation récurrente/par
  abonnement, mais se règle lentement (T+6) et comporte une fenêtre de
  litige inhabituellement longue : les clients peuvent annuler un
  prélèvement SEPA « sans poser de question » pendant **8 semaines**, et
  peuvent contester un prélèvement non autorisé pendant jusqu'à
  **13 mois** [12]. Klarna est aussi fort spécifiquement en Allemagne —
  c'est l'un des trois seuls pays (avec la Suède et les États-Unis) où
  l'option « Pay Later » de Klarna est disponible pour la facturation par
  abonnement et à la demande, pas seulement pour les achats ponctuels
  [13].
- **États-Unis/Royaume-Uni/Espagne/France** : les rails carte plus les
  portefeuilles électroniques (Apple Pay, Google Pay, PayPal, Link)
  couvrent l'essentiel de la facturation edtech grand public ; Klarna est
  largement disponible sur tous ces marchés pour les achats ponctuels et
  échelonnés [13].

### Stripe Tax a une lacune de couverture au Brésil, ce qui affecte concrètement le coût de la mise sur le marché

En croisant le tableau des pays pris en charge par Stripe Tax [14] et
l'index de collecte de taxe spécifique à l'Amérique latine [15] avec la
liste complète des pays, on constate que le Brésil est **absent des
deux** — chaque autre grand marché de Math Challenge (le Mexique, l'UE,
l'Allemagne spécifiquement, les États-Unis) figure dans la liste, mais pas
le Brésil. Le Mexique, en fait, dispose d'une prise en charge complète
dans les deux sens (entreprise au Mexique et client au Mexique) [15], avec
une exigence de conformité ferme : un vendeur à distance non résident de
services numériques à des consommateurs mexicains doit s'enregistrer à la
TVA mexicaine (IVA) dans les **30 jours suivant la première vente**, sans
**aucun seuil minimal** (une seule transaction déclenche l'obligation), et
doit nommer un représentant légal et établir un domicile fiscal mexicain
[15]. Cela signifie que le Brésil est le seul marché cible où le produit
fiscal de Stripe ne peut pas être fiable pour le calcul/versement
automatique — un chemin de conformité séparé (conseiller fiscal local,
intermédiaire type EOR, ou dépôt manuel) sera nécessaire si Math Challenge
vend directement à des consommateurs brésiliens.

### Le guichet unique de l'UE ramène la conformité TVA à 27 pays à un seul enregistrement

Pour le marché de l'UE (Espagne, France, Allemagne, Portugal pour le
volet portugais du brief), la documentation de Stripe sur l'UE confirme
que le **régime OSS Union** (pour les vendeurs basés dans l'UE) et le
**régime OSS Non-Union** (pour les vendeurs non basés dans l'UE)
permettent tous deux à un seul enregistrement et une seule déclaration
trimestrielle de couvrir les obligations de TVA sur les 27 États membres,
au lieu de s'enregistrer pays par pays [16]. Il existe aussi une
**exonération « petit vendeur » de 10 000 EUR/an** pour les entreprises
domiciliées dans l'UE vendant des produits numériques à des particuliers
dans toute l'UE, en dessous de laquelle le taux de TVA du pays d'origine
du vendeur s'applique au lieu de celui du client [16] — probablement sans
pertinence pour Math Challenge une fois qu'il aura un vrai revenu dans
l'UE, mais pertinent pendant le lancement initial.

### Les règles de commission des boutiques d'applications ont changé de manière significative en 2024-2026, en faveur de Math Challenge en cas d'enveloppement natif

Deux filières réglementaires indépendantes réduisent désormais le coût de
la redirection des utilisateurs vers un passage en caisse web depuis
l'intérieur d'une enveloppe d'application native :

- **États-Unis** : l'injonction anti-steering originale de 2021 de la
  juge Yvonne Gonzalez Rogers contre Apple (Epic Games v. Apple) exigeait
  qu'Apple laisse les développeurs créer des liens vers des flux d'achat
  externes ; la Cour suprême a refusé d'entendre un nouvel appel en
  janvier 2024. La mise en conformité initiale d'Apple — une commission de
  27 % sur les ventes via lien externe plus des avertissements
  d'écran dissuasifs — a été jugée « bad faith compliance » dans un
  jugement pour outrage d'avril 2025, qui a **interdit à Apple de
  percevoir toute commission sur les transactions via lien externe** et
  interdit toute friction d'interface au-delà d'un avis neutre. Apple fait
  appel devant la Ninth Circuit et a déposé une requête en certiorari
  auprès de la Cour suprême pour sa session 2026 [17].
- **Union européenne** : les articles 5(c) et 6(c) du Digital Markets Act
  exigent que les « gatekeepers » (Apple, Google) autorisent les
  utilisateurs professionnels à rediriger les utilisateurs finaux vers des
  offres hors plateforme et autorisent les boutiques d'applications et
  moyens de paiement alternatifs. Apple a été la première entreprise mise
  en cause au titre du DMA (juin 2024) et a reçu une amende de
  500 millions d'€ en avril 2025 pour violations continues [18].

Aucun des deux jugements n'est pleinement définitif (les deux sont en
appel), mais tous deux pointent actuellement dans la même direction : une
PWA enveloppée peut créer un lien vers un passage en caisse web avec un
risque de commission nettement moindre qu'à tout moment précédent depuis
la création de l'App Store. Cela ne change pas la recommandation de
lancer d'abord comme PWA pure (pas d'enveloppe, pas de revue de boutique,
aucune commission du tout), mais cela réduit le coût d'une future enveloppe
native si celle-ci devient nécessaire pour la découvrabilité.

### La réglementation du marketing d'abonnement est en mouvement des deux côtés de l'Atlantique, et aucun des deux statuts n'est pleinement confirmé pendant cette session

Deux règles n'ont **pas** pu être vérifiées auprès d'une source primaire
pendant cette session, et doivent être traitées comme du contexte
uniquement :

- **Règle FTC « click-to-cancel » (É.-U.)** : publiquement rapportée comme
  finalisée fin 2024 en tant qu'amendement à la Negative Option Rule puis
  annulée par la Eighth Circuit mi-2025 pour motifs procéduraux — ceci n'a
  pas pu être confirmé auprès de ftc.gov ou d'une source de dossier
  judiciaire pendant cette session (ftc.gov a renvoyé une erreur 403 à la
  récupération automatisée, et l'article Wikipédia sur la facturation par
  option négative ne couvre pas les événements 2024-2026) [sources
  primaires tentées et bloquées]. Indépendamment du statut précis de la
  règle click-to-cancel, l'obligation sous-jacente que l'annulation ne
  soit pas plus difficile que l'inscription est séparément exigée par la
  posture d'application de la ROSCA (Restore Online Shoppers' Confidence
  Act) de la FTC et par les lois de renouvellement automatique de type
  « mini-ROSCA » au niveau des États (Californie, et autres) qui ne
  dépendent pas du sort de la règle fédérale.
- **Digital Fairness Act de l'UE** : confirmé via un résumé secondaire
  comme étant une proposition active ciblant les dark patterns, les
  pratiques de personnalisation/marketing ciblé, et la transparence du
  marketing d'influenceurs ; sa consultation publique s'est déroulée de
  juillet à octobre 2025, et une proposition législative formelle est
  attendue au T3 2026 [19] — c'est-à-dire essentiellement maintenant, au
  moment de cette recherche. Ce n'est pas encore une loi et elle n'a
  aucune disposition confirmée spécifique aux mineurs, bien que son
  orientation dark patterns soit directement pertinente pour tout produit
  commercialisant des abonnements auprès de comptes d'enfants.

### Canal école/enseignant : offrir l'outil de classe gratuitement, facturer le parent

Chaque produit de mathématiques K-12 étudié disposant d'un volet classe
(Prodigy, Mathletics, Khan Academy) donne aux enseignants la pleine
fonctionnalité de classe gratuitement et ne monétise que la couche
tournée vers les parents. Prodigy l'énonce explicitement sur sa page
d'accueil : « No trial period, no hidden costs for educators. Our
optional parent memberships ensure Prodigy stays free for all teachers »
[2]. Mathletics applique le schéma inverse au niveau institutionnel — son
produit pour les écoles est du B2B sur devis (pas de prix public, « Buy
now » redirige vers un devis commercial), entièrement séparé de son
produit direct-au-parent à 19,95 $/enfant/mois [3]. Cela suggère deux
filières de monétisation distinctes qu'il vaut la peine de garder séparées
dans le propre modèle de Math Challenge : un mode enseignant/classe
gratuit et sans friction qui entraîne l'adoption ascendante et le
bouche-à-oreille, et un abonnement payé par les parents qui finance le
produit — avec une possible troisième filière district/licence scolaire
sur devis, modelée sur le bras B2B de Mathletics si Math Challenge
poursuit plus tard des ventes institutionnelles.

## Implications de conception

1. **Garder la boucle de pratique de base gratuite pour toujours ; mettre
   le paywall sur la couche tournée vers les parents.** Chaque comparable
   étudié fait cela. Palier gratuit = pratique mathématique de base
   illimitée au niveau de l'enfant, révision des erreurs, et récompenses
   basiques. Palier payant = analytique/rapports parentaux détaillés,
   fiches imprimables, une seconde matière ou verticale de contenu, et des
   extras cosmétiques/motivationnels (avatars, protections de série). Cela
   correspond au schéma partagé de Prodigy, IXL et Khan Academy et évite
   le coût de confiance consistant à verrouiller l'apprentissage d'un
   enfant en milieu de session.

2. **Forme de la formule familiale : siège de base + forte remise par
   enfant supplémentaire, pas un prix plat par enfant.** Copier le modèle
   d'IXL plutôt que celui de Mathletics : premier enfant au prix affiché
   complet, chaque enfant supplémentaire à environ 40-60 % du coût
   marginal du siège (IXL facture 4 $ pour un siège supplémentaire contre
   une base de 9,95 $ — une remise de 60 %). Un modèle plat par enfant
   (19,95 $ × N de Mathletics) est le seul schéma de cette étude sans
   aucune remise familiale, et il existe précisément dans un produit sans
   véritable positionnement « familial » ; Math Challenge, explicitement
   un produit familial, ne devrait pas le copier.

3. **Ancrer la tarification sur la formule annuelle, pas mensuelle.** Les
   données 2026 de RevenueCat montrent que l'éducation est la catégorie la
   plus orientée vers les formules annuelles (59 % des paywalls) avec le
   prix annuel médian le plus élevé (44,99 $) de toutes les catégories.
   Présenter l'annuel comme sélection par défaut avec le mensuel comme
   option visible mais secondaire, en suivant le propre schéma
   d'interface de Prodigy et Mathletics qui affiche des bannières
   « Économisez 50 % » sur l'annuel.

4. **Prix d'ancrage suggéré É.-U./R.-U.** : un enfant, annuel, autour de
   39,99-59,99 $ US (en dessous des 118,95 $ de Prodigy Ultra et au-dessus
   des 79 $ d'IXL ; raisonnement : Math Challenge est mathématiques
   uniquement comme IXL mais avec moins d'années de confiance de marque,
   donc se positionner en dessous du prix annuel mono-matière d'IXL est
   un point d'entrée raisonnable) avec le mensuel à 6,99-8,99 $ US. Cela
   se situe dans la fourchette observée de 58,95-118,95 $ de Prodigy et
   en dessous du plafond de Mathletics de 19,95 $/mois par enfant
   (239,40 $/an).

5. **Tarification ajustée au pouvoir d'achat pour le Mexique et le
   Brésil, pas un prix USD plat au niveau mondial.** Aucun des comparables
   n'a publié de prix spécifiques au Mexique ou au Brésil pendant cette
   recherche (IXL et Mathletics affichaient du USD même sur leurs pages
   tournées vers l'Amérique latine), mais Prodigy et Duolingo sont tous
   deux connus pour appliquer une tarification localisée in-app au
   passage en caisse (non capturée par les récupérations statiques de
   pages pendant cette session). Recommandation : tarifer le Mexique
   autour de 45-55 % du prix en dollars US une fois converti en MXN aux
   taux en vigueur (une bande d'ajustement PPA courante pour les
   abonnements grand public), et le Brésil de façon similaire en BRL, les
   deux à revalider face à la tarification des concurrents locaux (une
   tâche de recherche de suivi, cette session n'ayant pas pu récupérer de
   prix de passage en caisse localisés pour aucun comparable).

6. **Allemagne/France/Espagne/Portugal : tarifer en EUR à parité avec, ou
   avec une petite prime par rapport au, prix en dollars US**, cohérent
   avec l'approche apparente à palier unique par devise de Photomath et
   Brilliant ; ne pas appliquer de remise PPA à l'Europe de l'Ouest.

7. **Durée d'essai : 14 jours minimum, pas 7.** Le benchmark de RevenueCat
   montre un écart de conversion de 1,7 fois entre les essais de
   17-32 jours et ceux de ≤4 jours, et l'essai de 14 jours de Mathletics
   se situe dans la moitié supérieure de cette fourchette alors que
   l'essai de 7 jours de Duolingo n'y est pas. Un essai de 14 jours donne
   aussi à une famille assez de temps pour surmonter une première
   mauvaise soirée (enfant fatigué, une session sautée) sans annuler à
   cause d'un faux négatif.

8. **Pile de paiement, déployée par phases selon le marché** : lancer avec
   cartes + Apple Pay/Google Pay partout (base universelle). Ajouter le
   prélèvement SEPA pour l'Allemagne/l'UE comme seconde méthode (prise en
   charge native du récurrent, pas de complexité fiscale supplémentaire
   au-delà de l'OSS). Ajouter OXXO pour le Mexique comme option
   ponctuelle/annuelle uniquement (jamais pour le renouvellement
   automatique mensuel, puisqu'OXXO ne peut pas se renouveler
   automatiquement) avec une carte requise en repli pour quiconque veut
   une facturation mensuelle. Ajouter Pix pour le Brésil une fois résolues
   l'expérience utilisateur de la taxe IOF et la question de conformité
   fiscale brésilienne (constat ci-dessus) — ne pas lancer le Brésil sans
   un plan de calcul fiscal séparé.

9. **Ne pas promettre d'abonnements à renouvellement automatique via OXXO
   ou Boleto ponctuel.** Les deux sont des vouchers à usage unique sans
   capacité récurrente dans Stripe [10]. Toute interface de tarification
   Mexique/Brésil doit soit exiger une carte/un portefeuille électronique
   pour les formules par abonnement, soit proposer OXXO/Boleto uniquement
   pour une formule annuelle prépayée (un seul paiement par voucher,
   renouvelé manuellement l'année suivante) — une différence d'expérience
   utilisateur qui devrait être explicite dans le texte du passage en
   caisse, pas découverte par le client au moment du renouvellement.

10. **Le Brésil nécessite son propre chantier de conformité avant tout
    lancement public là-bas.** Comme Stripe Tax n'a aucune entrée pour le
    Brésil [14], résoudre — avant de facturer tout client brésilien — si
    Math Challenge va (a) utiliser un partenaire Merchant-of-Record/EOR
    qui absorbe les obligations fiscales brésiliennes, (b) engager un
    conseiller fiscal local pour une conformité manuelle ISS/PIS/COFINS,
    ou (c) retarder le lancement au Brésil jusqu'à ce que Stripe (ou un
    autre processeur) ajoute une prise en charge native. C'est une
    véritable porte go/no-go, pas un simple plus.

11. **Le Mexique exige un enregistrement dans les 30 jours suivant la
    première vente, sans aucun seuil de grâce.** Contrairement à
    l'exonération petit-vendeur de 10 000 EUR de l'UE, la règle IVA du
    Mexique pour les vendeurs à distance de services numériques n'a
    aucune exonération de transaction minimale — le premier client
    mexicain payant déclenche un délai de 30 jours pour s'enregistrer,
    nommer un représentant légal et établir un domicile fiscal mexicain
    [15]. Cela devrait être budgété en ressources (probablement via un
    conseil juridique ou un service de représentant fiscal) avant que le
    Mexique ne soit activé comme pays de facturation, pas après la
    première vente.

12. **Utiliser le régime OSS Non-Union de l'UE dès le premier jour pour
    les ventes dans l'UE**, en s'enregistrant une fois dans un seul État
    membre de l'UE choisi comme pays d'attache OSS, plutôt qu'en
    s'enregistrant pays par pays — c'est le chemin standard, documenté
    par Stripe, pour une entreprise non domiciliée dans l'UE
    (IOS/Math Challenge, vraisemblablement domiciliée aux É.-U. ou au
    Mexique) vendant des abonnements numériques à des consommateurs de
    l'UE [16].

13. **L'annulation doit être au moins aussi facile que l'inscription,
    indépendamment de la façon dont se règle le statut juridique de la
    règle américaine « click-to-cancel ».** Comme l'applicabilité
    actuelle de cette règle n'a pas pu être confirmée pendant cette
    session, concevoir de façon défensive : annulation en libre-service
    dans l'application, aucune exigence d'appel téléphonique, aucun dark
    pattern de flux de rétention (boucles forcées multi-étapes « êtes-vous
    sûr », boutons d'annulation cachés). Ceci est exigé sur le fond par la
    ROSCA et par la plupart des lois de renouvellement automatique des
    États américains, indépendamment du sort de la règle fédérale, et
    anticipe le Digital Fairness Act à venir de l'UE, dont la consultation
    publique ciblait explicitement les dark patterns dans les flux
    d'annulation d'abonnement [19].

14. **Divulguer le droit de rétractation de 14 jours de l'UE, et formuler
    correctement la renonciation, avant de facturer tout client de l'UE**
    — selon les dispositions sur le contenu numérique de la directive
    relative aux droits des consommateurs, un consommateur perd le droit
    de rétractation de 14 jours seulement s'il consent expressément à la
    livraison immédiate du contenu/service numérique et reconnaît
    expressément la perte de droit de rétractation qui en résulte. Les
    deux consentements doivent être recueillis (pas simplement implicites
    en cliquant sur « s'abonner »), et cette exigence précise n'a pas pu
    être re-vérifiée auprès d'une source EUR-Lex en direct pendant cette
    session (europa.eu a bloqué la récupération automatisée) — une revue
    juridique est recommandée avant le lancement dans l'UE pour confirmer
    les exigences de formulation actuelles.

15. **Construire un mode enseignant/classe gratuit et complet comme
    surface produit distincte, monétisé indirectement.** En suivant le
    modèle explicite de Prodigy « gratuit pour tous les enseignants,
    financé par des abonnements parentaux optionnels », un mode classe de
    Math Challenge (import de liste d'élèves, devoirs, tableau de bord de
    progression) ne devrait jamais exiger un abonnement parental pour
    fonctionner pour l'enseignant — le palier payé par les parents ne
    devrait débloquer que des fonctionnalités supplémentaires en
    surcouche, reflétant le schéma qui entraîne l'adoption par près d'un
    million d'enseignants de Prodigy.

16. **Réserver une filière de licence école/district comme produit B2B
    séparé, sur devis**, modelée sur le bras institutionnel de Mathletics,
    plutôt que d'essayer d'intégrer la licence scolaire dans le même
    passage en caisse en libre-service que les abonnements familiaux
    individuels — les points de prix, les cycles d'achat et les moyens de
    paiement (bons de commande, pas des cartes) sont assez différents pour
    justifier une démarche commerciale séparée.

## Questions ouvertes pour le responsable du projet

1. Math Challenge devrait-il reprendre l'idée de Prodigy de « groupage
   d'une seconde matière » (regrouper les maths avec, disons, la
   lecture/logique) à un palier supérieur, ou rester mathématiques
   uniquement comme IXL pour garder un positionnement simple ?
2. Quelle est la date cible de lancement au Brésil — le chantier de
   conformité (constat/implication 10) doit-il être cadré maintenant, ou
   le Brésil doit-il être explicitement hors périmètre pour la
   tarification v1 ?
3. Une option d'achat unique/à vie (comme de nombreuses applications pour
   enfants qui évitent complètement l'abonnement) mérite-t-elle d'être
   testée face au modèle abonnement-en-premier utilisé par chaque
   comparable étudié ici ?
4. Le palier gratuit devrait-il inclure des données de progression
   visibles par les parents, ou le suivi de progression est-il lui-même
   l'appât payant (comme chez Prodigy/IXL/Mathletics) ?
5. Math Challenge veut-il poursuivre un canal école/enseignant dès la v1,
   sachant que cela ajoute une seconde surface produit et démarche
   commerciale (implication 15-16), ou le différer à une phase
   ultérieure ?
6. Quelle est la tolérance au risque acceptable pour lancer la
   facturation dans l'UE avant que le texte de proposition formelle du
   Digital Fairness Act du T3 2026 ne soit disponible — procéder
   maintenant sous le droit actuel, ou attendre la clarté ?

## Sources

1. IXL family membership plan and pricing (1 child $9,95/mo or $79/yr; +$4/mo per additional child) — https://la.ixl.com/afiliacion/familiar/eligir-plan/mensual/matematicas — consulté le 2026-07-31
2. Prodigy Math membership pricing (Core/Plus/Ultra, multi-child 25% discount) — https://www.prodigygame.com/Memberships/math/ — consulté le 2026-07-31
3. Mathletics home-product pricing ($19,95/child/month, 14-day trial) — https://parent.prod.eastus2.mathletics.com/subscription/create/create-account — consulté le 2026-07-31
4. Photomath pricing tiers (Basic $0 / Plus $9,99 mo / $69,99 yr) — https://photomath.com/ — consulté le 2026-07-31
5. Duolingo Súper / Súper Familia tier structure (up to 6 users) — https://www.duolingo.com/super — consulté le 2026-07-31
6. Brilliant Premium plan structure (annual vs monthly, price not shown pre-checkout) — https://brilliant.org/premium/ — consulté le 2026-07-31
7. Khan Academy funding and nonprofit model (donor figures, Khanmigo pricing) — https://en.wikipedia.org/wiki/Khan_Academy — consulté le 2026-07-31
8. Kumon homepage (no published pricing; routes to local-center assessment) — https://www.kumon.com/ — consulté le 2026-07-31
9. Stripe payment methods overview (categories and regional dominance) — https://docs.stripe.com/payments/payment-methods/overview — consulté le 2026-07-31
10. Stripe OXXO documentation (Mexico, no recurring, 10 000 MXN cap, no refunds/disputes) — https://docs.stripe.com/payments/oxxo — consulté le 2026-07-31
11. Stripe Pix documentation (Brazil, IOF 3,5%, Pix Automático invite-only in Brazil) — https://docs.stripe.com/payments/pix — consulté le 2026-07-31
12. Stripe SEPA Direct Debit documentation (Germany/EU, 8-week dispute window, T+6 settlement) — https://docs.stripe.com/payments/sepa-debit — consulté le 2026-07-31
13. Stripe Klarna documentation (country coverage, subscription support in Germany/Sweden/US) — https://docs.stripe.com/payments/klarna — consulté le 2026-07-31
14. Stripe Tax supported-countries list (Brazil absent; Mexico/EU/Germany present) — https://docs.stripe.com/tax/supported-countries — consulté le 2026-07-31
15. Stripe Tax Mexico registration requirements (30-day rule, no threshold, legal representative) — https://docs.stripe.com/tax/supported-countries/latin-america-and-caribbean/collect-tax?tax-jurisdiction-latin-america=mexico — consulté le 2026-07-31
16. Stripe Tax EU OSS/Non-Union OSS scheme and 10 000 EUR small-seller threshold — https://docs.stripe.com/tax/supported-countries/european-union — consulté le 2026-07-31
17. Epic Games v. Apple — US anti-steering injunction and April 2025 contempt ruling — https://en.wikipedia.org/wiki/Epic_Games_v._Apple — consulté le 2026-07-31
18. EU Digital Markets Act — anti-steering provisions and April 2025 €500M Apple fine — https://en.wikipedia.org/wiki/Digital_Markets_Act — consulté le 2026-07-31
19. EU Digital Fairness Act — consultation timeline and Q3 2026 proposal target — https://en.wikipedia.org/wiki/Digital_Fairness_Act — consulté le 2026-07-31
20. RevenueCat State of Subscription Apps 2026 — freemium/hard-paywall conversion, trial-length conversion, education-category annual-plan share and median price — https://www.revenuecat.com/state-of-subscription-apps/ — consulté le 2026-07-31

**Non vérifié pendant cette session (signalé, pas utilisé comme fait) :** le statut post-annulation de la règle FTC click-to-cancel (ftc.gov a bloqué la récupération automatisée) ; les prix numériques exacts de Duolingo Súper/Súper Familia et Brilliant Premium (tous deux derrière un paywall de connexion/passage en caisse au moment de la récupération) ; la tarification de Mathspace (403 Forbidden sur toutes les URL tentées) ; la formulation exacte de la renonciation au droit de rétractation de la directive européenne relative aux droits des consommateurs (europa.eu a bloqué la récupération automatisée, la description ici s'appuie sur une connaissance générale de l'article 16(m) et devrait être revue juridiquement avant utilisation).
