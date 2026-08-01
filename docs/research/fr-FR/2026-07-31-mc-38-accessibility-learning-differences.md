# Accessibilité et différences d'apprentissage dans un jeu de mathématiques mondial, tous âges

> Recherche Math Challenge — 2026-07-31 — sujet 38

## Résumé exécutif (FR)

- La norme WCAG 2.2 ajoute des exigences qui touchent de plein fouet un jeu tactile, chronométré et multi-âges : **2.5.8 Target Size (Minimum, AA)** exige des cibles d'au moins 24 × 24 px CSS [1] ; **2.5.7 Dragging Movements (AA)** exige une alternative sans glissement [10] ; **2.5.1 Pointer Gestures (A)** exige une alternative à un seul pointeur pour les gestes multipoints [8].
- Le conflit central — notation basée sur la vitesse vs. **2.2.1 Timing Adjustable (A)** — se résout ainsi : l'« Essential Exception » ne couvre qu'une limite de temps où « l'étendre invaliderait l'activité » [2]. Cela justifie un mode « Speed Challenge » opt-in, pas le mode par défaut, car il existe bien une alternative raisonnable (mode sans chronomètre).
- MathML Core est une Candidate Recommendation Snapshot depuis le 24 juin 2025 [3] ; son propre texte indique que `alttext` « ne définit aucun comportement observable » — la sémantique accessible des formules dépend de MathJax + Speech Rule Engine, pas du cœur de la norme [3][11].
- Dyscalculie : 3 à 6 % de la population [4], sans critère diagnostique consensuel ; meilleures interventions : manipulables concrets, ligne numérique informatisée (*The Number Race*, *Graphogame-math*) et logiciels adaptatifs (*Calcularis*, *Meister Cody*) [4].
- Les preuves concernant les polices spéciales pour la dyslexie (OpenDyslexic, Dyslexie) sont faibles, voire négatives : Rello & Baeza-Yates (2013) n'ont trouvé aucune amélioration du temps de lecture ; une étude de 2016 a montré une préférence pour Arial par rapport aux polices « pour dyslexiques » ; une étude de 2023 a trouvé une préférence esthétique mais aucune différence dans les résultats [5].
- La loi européenne sur l'accessibilité exige la conformité depuis le **28 juin 2025**, incluant explicitement le commerce électronique [7] ; la norme EN 301 549 (qui intègre l'intégralité de WCAG 2.1) en est la référence technique [9]. La règle du Titre II de l'ADA aux États-Unis exige WCAG 2.1 AA pour les gouvernements étatiques/locaux — y compris les écoles publiques — d'ici 2027/2028 [6].

## Executive summary (EN)

Math Challenge combines speed-scored gameplay, symbolic math rendering, ages 4–adult, five languages, and phone/tablet/desktop input — a harder accessibility surface than most single-audience apps. WCAG 2.2 adds criteria that bite directly: **2.5.8 Target Size (Minimum, AA)** requires ≥24×24 CSS px pointer targets, with four narrow exceptions [1]; **2.5.7 Dragging Movements (AA)** requires a non-dragging alternative for any drag mechanic [10]. The load-bearing conflict is **2.2.1 Timing Adjustable (A)** versus speed scoring; its **Essential Exception** — "the time limit is essential and extending it would invalidate the activity" [2] — is narrow and does not cover a gamified drill by default; the fix is architectural (a separate untimed mode plus an opt-in timed mode), detailed below.

MathML Core is a W3C Candidate Recommendation Snapshot (24 June 2025) whose own text says the `alttext` attribute has no defined observable behavior [3] — MathML Core standardizes rendering, not accessible semantics, which instead comes from MathJax's accessibility extensions built on the Speech Rule Engine [11], plus screen readers with math support (JAWS 16+, VoiceOver) [12]. Dyscalculia affects 3–6% of people [4], has no consensus diagnostic criterion, and its best-evidenced interventions — concrete manipulatives, computerized number-line training, adaptive drills — are close to what Math Challenge already builds [4]. Evidence for dyslexia-specific fonts is weak-to-negative; the British Dyslexia Association recommends ordinary sans-serif fonts instead [5]. Legally, the EU European Accessibility Act has applied since 28 June 2025 to consumer products/services including e-commerce [7], EN 301 549 (embedding WCAG 2.1 in full) is its technical backbone [9], and the 2024 US ADA Title II rule requires WCAG 2.1 AA for state/local government sites and apps — including public schools — by 2027/2028 [6], which will surface in school-district procurement even though it does not bind Math Challenge directly.

## Constatations

### 1. WCAG 2.2 : les nouveaux critères qui frappent le plus fort ici

WCAG 2.2 (octobre 2023) a ajouté neuf critères de succès par rapport à 2,1. Les plus pertinents pour un jeu de mathématiques tactile, capable de glissement et chronométré :

- **2.5.8 Target Size (Minimum) — AA.** « The target for pointer input is at least 24 by 24 CSS pixels in size, except where: Equivalent... Inline... User Agent Control... Essential. » [1] Un plancher, pas un plafond — l'interface pour les moins de 8 ans devrait viser bien au-delà.
- **2.5.7 Dragging Movements — AA (nouveau).** « Functionality that can be operated by dragging movements can also be operated by single pointer activations without dragging, unless dragging is essential. » [10] Tout mécanisme « glisser sur la ligne numérique » a besoin d'un équivalent tap-to-place (toucher pour placer).
- **2.5.1 Pointer Gestures — A.** « All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless... essential. » [8]
- **2.5.4 Motion Actuation — A.** L'entrée par mouvement de l'appareil doit aussi être opérable via des composants d'interface, avec une réponse au mouvement désactivable [8] — pertinent si un mode « incliner pour répondre » est un jour envisagé.
- **1.4.10 Reflow — AA.** « Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: vertical scrolling content at a width equivalent to 320 CSS pixels... Except for parts of the content which require two-dimensional layout for usage or meaning. » [13] Un canevas de géométrie peut plausiblement revendiquer l'exception ; l'habillage environnant (boutons, score, instructions) ne le peut pas.
- **1.4.1 Use of Color — A.** « Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element. » [14] Directement impliqué par un retour correct/incorrect codé par couleur ou des paliers de difficulté.
- D'autres ajouts de 2,2 (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) importent davantage pour la couche compte/portail ; **3.3.8 Accessible Authentication** mérite d'être signalé si un verrou de profil utilise un jour un test cognitif type puzzle/CAPTCHA comme seule méthode.

### 2. Le conflit de temporisation, énoncé avec précision

Une manche notée à la vitesse fixe « a time limit... by the content » — la condition déclenchante de **2.2.1 Timing Adjustable (A)**, satisfaite seulement si l'utilisateur peut désactiver la limite, l'ajuster à ≥10× la valeur par défaut, l'étendre avec avertissement, ou si elle relève de la **Real-time Exception** (« a required part of a real-time event... and no alternative to the time limit is possible ») ou de l'**Essential Exception** (« essential and extending it would invalidate the activity ») [2]. Il existe aussi une exception à 20 heures et une note reliant ce SC au 3.2.1 (Predictable) [2]. Résolution complète ci-dessous.

### 3. Mathématiques accessibles : MathML Core, MathJax, lecteurs d'écran

MathML Core est une **Candidate Recommendation Snapshot (24 juin 2025)**, « not expected to advance to Proposed Recommendation any earlier than 30 September 2025 » [3] — un sous-ensemble volontairement réduit et testable par navigateur de MathML 3. Son propre texte précise que l'attribut `alttext` « does not define any observable behavior that is specific to the alttext attribute » [3] — la spécification normalise le rendu, pas la sémantique accessible. Firefox et Safari prennent en charge MathML depuis longtemps ; Chromium a ajouté une implémentation « at the beginning of 2023 » [15]. Lecteurs d'écran : **JAWS prend en charge la vocalisation MathML et la sortie braille depuis la version 16** ; **VoiceOver lit MathML dans Safari** [12] ; la prise en charge des mathématiques par NVDA existe via des extensions, mais n'a pas été confirmée par une source primaire ici et devra être vérifiée avant le lancement.

**MathJax** « provides a powerful set of accessibility extensions that provide navigation, exploration, and voicing on the client », y compris Expression Zoom et, pour le hors-ligne/ePub, « alternative textual descriptions or more fine-grained speech annotations and Braille » [11]. En dessous, le **Speech Rule Engine (SRE)** convertit la structure MathML/LaTeX en descriptions en langage naturel (« un demi plus un tiers », pas des noms de symboles bruts). **KaTeX** est plus rapide mais dispose d'un outillage d'accessibilité intégré plus faible et nécessite généralement un repli sur MathML au-delà de l'affichage décoratif de formules. Le rendu des formules sous forme d'images ou de glyphes de canevas — un raccourci d'interface courant pour les enfants — ne produit rien pour un lecteur d'écran ; MathML associé à une couche d'accessibilité est la seule voie qui garde la notation disponible pour les utilisateurs aveugles/malvoyants à tout âge.

### 4. Dyscalculie : prévalence, identification, interventions

La dyscalculie est « a learning disorder, resulting in difficulty learning or comprehending arithmetic », qui « does not reflect a general deficit in cognitive abilities or difficulties with time, measurement, and spatial reasoning » [4]. Prévalence : **3 à 6 %**, comparable entre les sexes [4]. **Aucun critère diagnostique consensuel** n'existe ; l'identification combine des tests de performance, une évaluation de la mémoire de travail/des fonctions exécutives, l'évaluation des enseignants et, en recherche, des profils d'IRMf [4]. Les interventions les mieux étayées se regroupent en trois familles : les **manipulables concrets** (le paradigme de tutorat de Fuchs — jeux, cartes-éclair, manipulables) [4] ; l'**entraînement informatisé sur la ligne numérique** (*The Number Race*, *Graphogame-math*) [4] ; et les **logiciels adaptatifs** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Cela correspond de très près, sur le plan du mécanisme, à la catégorie même de Math Challenge — un jeu de ligne numérique et d'entraînement arithmétique — ce qui plaide pour un mode explicitement informé par la dyscalculie plutôt qu'un ajout superficiel.

### 5. Typographie et dyslexie : les polices sont le point faible de l'histoire

Non controversé et bon marché : caractères plus grands, interlignage généreux, lignes plus courtes, alignement à gauche, pas d'italique/majuscules intégrales dans le corps de texte, contraste soutenu mais non extrême. Ce qui **ne** tient **pas** est l'affirmation selon laquelle la dyslexie nécessite une police spéciale. OpenDyslexic (Abbie Gonzalez, 2011) en est l'exemple le plus connu [5]. Preuves : **Rello & Baeza-Yates (2013)** ont constaté qu'elle « did not significantly improve reading time nor shorten eye fixation » [5] ; une **thèse de 2010** a constaté que Dyslexie « did not lead to faster reading » par rapport à Arial [5] ; une **étude de 2016** a constaté que les lecteurs dyslexiques **préféraient Arial** aux polices spécifiques à la dyslexie [5] ; une **étude de 2023** a constaté une préférence esthétique pour OpenDyslexic (58 %) mais « no difference in the test scores based on which font was used » [5]. La British Dyslexia Association recommande plutôt des polices sans empattement ordinaires [5]. **Conclusion :** ne pas créer ni licencier une « police pour dyslexiques » ; investir plutôt l'effort dans l'espacement, la longueur des lignes et une iconographie cohérente.

### 6. TDAH et attention dans une application d'apprentissage ludifiée

Les travaux du W3C sur l'accessibilité cognitive (COGA) se rattachent à trois rubriques de directives WCAG : **2,2 Enough Time**, **2,4 Navigable**, **3,2 Predictable** [16], avec des schémas plus détaillés dans la note « Making Content Usable ». En termes produit : structure de session prévisible, stimuli visuels/audio concurrents minimaux pendant la résolution active de problèmes, écrans à foyer unique, et limites de temps ajustables ou évitables par défaut. Les mécaniques de récompense variable et de comparaison sociale — des leviers d'engagement courants pour le TDAH dans la ludification commerciale — comportent un coût documenté en stress/attention en plus du bénéfice d'engagement (voir le sujet 10 de cette série) et doivent être traitées comme un compromis, pas un gain gratuit.

### 7. Autisme et conception sensorielle : mouvement, son, prévisibilité

`prefers-reduced-motion` a le statut **Baseline widely available depuis janvier 2020** [17] et permet à une application de respecter une préférence définie au niveau du système d'exploitation. Sa justification documentée réside dans les **troubles vestibulaires liés au mouvement** — animations de zoom/panoramique provoquant des étourdissements ou une désorientation [17] ; son extension à l'autisme/la sensibilité sensorielle est une pratique bien établie, bien que ce ne soit pas l'affirmation précise citée dans la source primaire utilisée ici. Le critère **2.3.3 Animation from Interactions (AAA)** de WCAG exige que « motion animation triggered by interaction can be disabled, unless the animation is essential » [18] — niveau AAA, non obligatoire au niveau AA, mais peu coûteux et directement protecteur. Le son mérite le même traitement : un commutateur « réduire le mouvement / réduire le son » persistant et repérable, avec pour valeur par défaut le signal du système d'exploitation.

### 8. Déficience visuelle et le problème de la géométrie

La géométrie est le sous-domaine le plus difficile pour les utilisateurs aveugles/malvoyants, car son contenu est intrinsèquement spatial. La boîte à outils standard : les **graphiques tactiles** (formes en relief/papier gonflant ou imprimées en 3D) ; le **code braille Nemeth** (Abraham Nemeth, documenté pour la première fois en 1952), un système à six points pour linéariser la notation mathématique avec une couverture complète des symboles pour les triangles, cercles, parallélogrammes et relations comme parallèle/perpendiculaire/angle [19] ; et la **description verbale structurée** — une grammaire fixe (type de forme, puis sommets/côtés, puis angles, toujours dans le même ordre) qui permet à un utilisateur de lecteur d'écran de construire un modèle mental sans dispositif tactile. Pour une application web, la voie à court terme est une rédaction rigoureuse d'alternatives textuelles à grammaire fixe, associée à des données de forme navigables au clavier et descriptibles — les pixels d'un canevas sont invisibles pour un lecteur d'écran, quelle que soit par ailleurs la qualité du texte alternatif.

### 9. Déficience motrice et accès par contacteur

Le critère **2.5.2 Pointer Cancellation (A)** exige que l'activation à pointeur unique ne se déclenche pas sur l'événement initial de pression, sauf si une protection s'applique (annulation/défaire, inversion sur l'événement de relâchement, ou un déclencheur essentiel sur la pression) [8] — protégeant les utilisateurs souffrant de tremblements contre une activation accidentelle dans une interface à frappe rapide. L'accès complet par contacteur nécessite en outre une accessibilité séquentielle au clavier/contacteur avec un focus visible (2.4.7/2.4.11), et aucune interaction n'exigeant un glissement, un pincement, ou un double-tap chronométré avec précision sans alternative à contacteur unique.

### 10. Daltonisme dans un jeu codé par couleur

Les déficiences rouge-vert (protanopie, deutéranopie) sont les plus courantes ; la tritanopie (bleu-jaune) est plus rare ; l'achromatopsie (totale, en niveaux de gris) touche une très petite minorité [20]. Règle fondamentale, cohérente avec 1.4.1 [14] : ne jamais laisser la couleur seule signaler correct/incorrect, la difficulté ou la catégorie — associer chaque indice de couleur à une forme, une icône ou un texte, et vérifier la palette en simulation de niveaux de gris, pas seulement face à un spectateur « typique » [20].

### 11. Sous-titres et alternatives audio

Les invites vocales de nombres, les vidéos tutorielles et l'audio festif ont besoin de sous-titres/équivalents textuels synchronisés et d'un chemin son coupé (le cas d'usage majoritaire dans les écoles et les lieux publics) — territoire WCAG 1.2.x classique, comparativement à faible risque à côté des problèmes plus difficiles ci-dessus.

### 12. La couche juridique

**Loi européenne sur l'accessibilité (Directive 2019/882) — UE.** Conformité obligatoire depuis le **28 juin 2025** : « all relevant products and services made available on the EU market must now comply with accessibility requirements » [7]. Le champ d'application inclut explicitement les dispositifs informatiques personnels, les livres électroniques et les **services de commerce électronique** [7]. Les micro-entreprises (< 10 employés, < 2 M€ de chiffre d'affaires) en sont exemptées [7] ; la conformité est auto-certifiée, avec des sanctions variant fortement d'un État membre à l'autre [7]. **Si Math Challenge vend des abonnements dans l'UE, il entre plausiblement dans le champ d'application en tant que service de commerce électronique** — la question juridique la plus prioritaire ici.

**EN 301 549.** La norme harmonisée de l'UE en matière d'accessibilité des TIC ; v3.2.1 « includes the text of WCAG 2.1 in full » [9] et constitue la référence technique à la fois pour la directive sur l'accessibilité du web et pour la loi européenne sur l'accessibilité, s'étendant au-delà des sites web aux applications mobiles et aux services de télécommunications ; le Canada l'a formellement adoptée en 2024 [9].

**Titre II de l'ADA (2024) / Section 508 — États-Unis.** Exige des entités gouvernementales étatiques/locales — y compris les districts scolaires publics — qu'elles satisfassent **WCAG 2.1 AA** pour le contenu web/applicatif, avec des échéances au **26 avril 2027** (population ≥ 50 000) / **2028** (plus petites), avec cinq exceptions de contenu étroites [6]. La Section 508 lie séparément les marchés publics des agences fédérales [21]. Math Challenge n'y est pas directement soumis, mais les acheteurs des districts scolaires exigeront probablement une déclaration de conformité WCAG 2.1 AA (VPAT) ; viser WCAG 2.2 AA satisfait les deux régimes avec une marge de sécurité.

## Liste de conformité — critères WCAG 2.2 AA les plus à risque ici

| CS | Niveau | Risque dans Math Challenge | Règle de conception |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Puces de réponse/pavés numériques dimensionnés pour le bureau | Toutes les cibles ≥ 24 × 24 px CSS ; ≥ 44 × 44 px pour l'interface des moins de 8 ans |
| 2.5.7 Dragging Movements | AA | Glisser-vers-la-ligne-numérique, glisser-pour-trier | Alternative toucher-pour-sélectionner + toucher-pour-placer pour chaque glissement |
| 2.5.1 Pointer Gestures | A | Tout pincement/balayage-pour-répondre | Alternative à pointeur unique ; aucun geste essentiel par conception |
| 2.5.2 Pointer Cancellation | A | Notation à frappe rapide se déclenchant sur l'appui | Activation sur l'événement de relâchement, annulation en glissant hors de la cible |
| 2.2.1 Timing Adjustable | A | Mode par défaut noté à la vitesse | Voir « conflit de temporisation » — le mode sans chronomètre est la voie de conformité |
| 1.4.10 Reflow | AA | Canevas de géométrie, grilles de coordonnées | Réadapter tout l'habillage à 320 px ; seule la figure peut nécessiter une mise en page 2D |
| 1.4.1 Use of Color | A | Codage correct/incorrect, palier, catégorie | Chaque indice de couleur porte aussi une icône/forme/texte |
| 1.4.3 / 1.4.11 Contrast | AA | Palettes enfantines vives et ludiques | 4,5:1 pour le texte, 3:1 pour l'interface/les graphiques, vérifié sur la palette réelle |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Composants de jeu personnalisés, pas de style de focus natif | Indicateur de focus visible et non obstrué partout |
| 3.3.8 Accessible Authentication | AA | Verrous de profil « résoudre pour débloquer » | Aucun test de fonction cognitive comme seule méthode d'authentification |

## Le conflit de temporisation — résolu

**2.2.1 Timing Adjustable (niveau A)** s'applique dès lors que « a time limit... is set by the content » [2] — une manche notée à la vitesse est sans ambiguïté concernée. Les deux exceptions qui pourraient la couvrir purement et simplement sont étroites :

> « Real-time Exception: The time limit is a required part of a real-time event (for example, an auction), and no alternative to the time limit is possible. » [2]

> « Essential Exception: The time limit is essential and extending it would invalidate the activity. » [2]

Aucune des deux ne devrait constituer le seul argument de conformité pour l'expérience par défaut, car une alternative raisonnable existe clairement (un mode sans chronomètre enseignant les mêmes mathématiques). L'Essential Exception n'est défendable que pour un mode **« Speed Challenge »** distinct et clairement étiqueté, où la temporisation *est* réellement l'activité mesurée.

**Résolution :**
1. Le **mode d'apprentissage par défaut** est sans chronomètre ou conforme à la norme (désactiver / ajuster à ≥10× / étendre avec avertissement) [2].
2. Un **mode Speed Challenge** distinct et opt-in conserve une temporisation stricte et invoque honnêtement l'Essential Exception.
3. La progression (séries, déblocages) dans le mode par défaut est pilotée par la précision/l'achèvement, pas par la latence ; la vitesse n'est qu'une statistique bonus affichée uniquement dans Speed Challenge.
4. Cela correspond aussi à la littérature sur l'anxiété mathématique (sujet 10 de cette série) : le chronomètre est l'amplificateur documenté des baisses de performance liées à l'anxiété, donc le retirer du chemin par défaut est aligné sur les preuves, pas seulement un contournement de conformité.

## Implications de conception

1. Rendre toute la notation mathématique en MathML ou en balisage ARIA accessible via une couche d'accessibilité de type MathJax — jamais des glyphes canevas/image uniquement [3][11].
2. Mode de jeu par défaut sans chronomètre ou avec minuteur ajustable ; confiner la temporisation stricte à un mode « Speed Challenge » opt-in invoquant honnêtement l'Essential Exception [2].
3. Toutes les cibles interactives ≥ 24 × 24 px CSS, ≥ 44 × 44 px pour l'interface des moins de 8 ans [1].
4. Chaque interaction de glissement embarque une alternative toucher-pour-sélectionner/toucher-pour-placer ; le glissement est une amélioration, jamais la seule voie [10].
5. Ne jamais coder correct/incorrect, la difficulté ou la catégorie uniquement par la couleur ; associer une icône/forme/texte et vérifier contre des simulations de protanopie/deutéranopie/tritanopie/achromatopsie [14][20].
6. Fournir un contrôle persistant « réduire le mouvement/le son » dont la valeur par défaut suit `prefers-reduced-motion`, au-delà du critère AAA uniquement 2.3.3, car la population desservie est réelle indépendamment du statut AA [17][18].
7. Construire un **mode Dyscalculie / Sens du nombre** distinct : présentation d'abord centrée sur la ligne numérique, visuels avec manipulables concrets, rampe adaptative modelée sur Number Race/Calcularis plutôt qu'une courbe Elo générique ; repérable dans les paramètres, sans être verrouillé derrière un diagnostic (aucun n'est consensuel) [4].
8. Ne pas créer/licencier une « police pour dyslexiques » ; investir dans l'interlignage, des lignes d'instruction plus courtes, l'alignement à gauche, une police sans empattement standard et lisible [5].
9. Chaque figure géométrique reçoit une description textuelle structurée à grammaire fixe (forme, puis sommets/côtés, puis angles) plus des données de forme navigables au clavier/descriptibles, jamais un rendu canevas uniquement [19].
10. Ajouter un « mode Focus » à faible stimulation pour le TDAH/l'attention : écrans à tâche unique, pas d'animation/audio concurrent en cours de problème, structure prévisible, effets festifs différés — aligné sur Enough Time/Navigable/Predictable de COGA [16].
11. Opérabilité complète au contacteur/clavier : ordre de focus séquentiel, indicateur de focus visible et non obstrué, aucune interaction exigeant le multi-touche ou un tap chronométré avec précision sans alternative à pointeur unique [8].
12. Sous-titrer/fournir un équivalent textuel pour chaque invite vocale et chaque clip instructionnel ; rendre la totalité de la boucle de résolution de problèmes complétable en muet par défaut.
13. Traiter la EAA de l'UE comme déjà contraignante (date de conformité dépassée le 28 juin 2025) en cas de vente à des consommateurs de l'UE ; commander dès maintenant une autoévaluation de type VPAT par rapport à EN 301 549 [7][9].
14. Viser en interne WCAG 2.2 AA, un sur-ensemble strict qui satisfait par avance la barre WCAG 2.1 AA que les districts scolaires américains exigeront lors des marchés publics [6].

## Questions ouvertes pour le responsable du projet

1. Math Challenge vend-il physiquement à des consommateurs de l'UE aujourd'hui ou dans les 12 prochains mois ? Détermine si la conformité à la EAA (déjà due depuis le 28 juin 2025) est immédiate ou prospective [7].
2. Le classement public est-il une fonctionnalité centrale permanente, ou peut-il être reformulé comme le mode Speed Challenge opt-in, en gardant le chronomètre optionnel par défaut ?
3. L'adoption par les districts scolaires américains est-elle un véritable canal de mise sur le marché ? Si oui, un VPAT WCAG 2.1 AA devient un atout commercial, pas seulement une question de conformité [6].
4. Le contenu de géométrie doit-il se limiter à des formes en texte structuré/navigables au clavier, ou la tranche d'âge plus élevée a-t-elle besoin d'une géométrie canevas/SVG véritablement interactive (nécessitant un investissement d'accessibilité plus important) ?
5. Quel budget/appétit pour une couche de rendu d'accessibilité de type MathJax (vocalisation basée sur SRE) par rapport à un moteur de rendu plus léger comme KaTeX brut, avec un outillage intégré plus faible ?
6. Faut-il livrer le commutateur réduire-le-mouvement/le-son dès le lancement, ou le reporter à une phase d'accessibilité post-lancement, étant donné qu'il est peu coûteux, AAA uniquement, et protecteur pour les utilisateurs autistes/vestibulaires [17][18] ?

## Sources

1. W3C, WCAG 2.2, SC 2.5.8 Target Size (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum
2. W3C, WCAG 2.2, SC 2.2.1 Timing Adjustable — https://www.w3.org/TR/WCAG22/#timing-adjustable
3. W3C, MathML Core (Candidate Recommendation Snapshot, 24 juin 2025) — https://www.w3.org/TR/mathml-core/
4. Wikipédia, « Dyscalculia » — https://en.wikipedia.org/wiki/Dyscalculia
5. Wikipédia, « OpenDyslexic » — https://en.wikipedia.org/wiki/OpenDyslexic
6. ADA.gov, « 2024 Title II Web and Mobile App Accessibility Rule » — https://www.ada.gov/resources/2024-03-08-web-rule/
7. Wikipédia, « European Accessibility Act » — https://en.wikipedia.org/wiki/European_Accessibility_Act
8. W3C, WCAG 2.2, SC 2.5.1 Pointer Gestures / 2.5.2 Pointer Cancellation / 2.5.4 Motion Actuation — https://www.w3.org/TR/WCAG22/#pointer-gestures
9. Wikipédia, « EN 301 549 » — https://en.wikipedia.org/wiki/EN_301_549
10. W3C, WCAG 2.2, SC 2.5.7 Dragging Movements — https://www.w3.org/TR/WCAG22/#dragging-movements
11. MathJax Project, présentation des fonctionnalités d'accessibilité — https://www.mathjax.org/#accessibility
12. Wikipédia, « MathML » (prise en charge par les lecteurs d'écran) — https://en.wikipedia.org/wiki/MathML
13. W3C, WCAG 2.2, SC 1.4.10 Reflow — https://www.w3.org/TR/WCAG22/#reflow
14. W3C, WCAG 2.2, SC 1.4.1 Use of Color — https://www.w3.org/TR/WCAG22/#use-of-color
15. Wikipédia, « MathML » (historique de l'implémentation Chromium) — https://en.wikipedia.org/wiki/MathML
16. W3C WAI, présentation de l'accessibilité cognitive — https://www.w3.org/WAI/cognitive/
17. MDN Web Docs, « prefers-reduced-motion » — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
18. W3C, WCAG 2.2, SC 2.3.3 Animation from Interactions — https://www.w3.org/TR/WCAG22/#animation-from-interactions
19. Wikipédia, « Nemeth Braille » — https://en.wikipedia.org/wiki/Nemeth_Braille
20. WebAIM, « Visual Disabilities: Color Blindness » — https://webaim.org/articles/visual/colorblind
21. Section508.gov, « Laws and Policies » — https://www.section508.gov/manage/laws-and-policies/
22. W3C, WCAG 2.2 Quick Reference (nouveaux critères de succès dans 2,2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
