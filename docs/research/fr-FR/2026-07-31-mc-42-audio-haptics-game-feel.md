# Audio, musique, retour haptique, mouvement et « juice » dans les jeux d'apprentissage

> Recherche Math Challenge — 2026-07-31 — sujet 42

## Résumé exécutif (FR)

Le « juice » (retour sensoriel exagéré : son, particules, tremblement d'écran)
rend un jeu plus agréable sans changer sa logique — thèse centrale de *Game
Feel* de Steve Swink et de la conférence de 2012 « Juice It or Lose It » de
Jonasson et Purho [1][2]. Mais Math Challenge est un logiciel éducatif, et une
tension réelle apparaît : l'« effet du son non pertinent » montre que la
parole et la musique de fond dégradent la mémoire de travail même sans
attention consciente [3], et le principe de cohérence de Mayer affirme que le
matériel décoratif — y compris la musique de fond — doit être supprimé parce
qu'il entre en concurrence pour des ressources cognitives limitées [4]. Aucun
des deux camps n'a tort : le juice aide la motivation ; la musique de fond
pendant un calcul actif peut nuire à la performance. La solution pratique est
de séparer les moments : silence pendant l'essai, juice complet seulement à
l'instant de la récompense ou de l'erreur.

Pour les enfants de 4 ans qui ne lisent pas encore, l'audio n'est pas une
décoration — c'est le canal d'instruction. L'API Vibration ne fonctionne sur
aucune version testée de Safari iOS, donc la vibration ne peut pas être le
canal principal sur iPad/iPhone [5][6]. `speechSynthesis` bénéficie d'une
large prise en charge par les navigateurs, mais la qualité et la disponibilité
des voix par langue dépendent du système d'exploitation, pas du navigateur
[7][8]. Les politiques de lecture automatique bloquent tout son avant un
geste de l'utilisateur [9][10][11] — ce qui définit l'écran de démarrage —,
et la règle d'accessibilité « aucune information essentielle uniquement par
le son » [12] exige que chaque son ait aussi un équivalent visuel.

## Executive summary (EN)

"Juice" — exaggerated feedback (sound, particles, screen shake) — makes a
game feel better without changing its logic, per Steve Swink's *Game Feel*
and the 2012 talk "Juice It or Lose It" [1][2]. Math Challenge is learning
software, though, and a genuine tension follows: the irrelevant-sound effect
shows background speech/music degrades working memory even when unattended
[3], and Mayer's coherence principle says decorative audio should be stripped
from instructional material because it competes for limited cognitive
capacity [4]. Both are right in their frame — juice aids motivation; ambient
sound during active calculation can hurt performance. The practical
resolution is to separate the moments: silence while solving, full juice only
at the reward/error instant.

For 4-year-old pre-readers, audio is the instruction channel, not decoration.
The Vibration API has no iOS Safari support in any version tested, so it
cannot be the primary reward channel on iPad/iPhone [5][6]. `speechSynthesis`
has broad browser support, but voice quality/availability per language is an
OS property, not a browser one [7][8]. Autoplay policy blocks any unmuted
audio before a user gesture [9][10][11], which shapes the start screen, and
the "no sound-only feedback" accessibility rule [12] requires a visual
equivalent for every audio cue.

---

## Constats

### 1. Game feel et « juice »

*Game Feel* (2008) de Steve Swink définit le « feel » comme contrôle + espace
simulé + polish, le polish étant le son, les particules, le tremblement
d'écran et les courbes d'accélération qui communiquent un état sans changer
les règles [1]. La conférence GDC Europe 2012 « Juice It or Lose It »
(Jonasson & Purho) est la démonstration pratique la plus citée : un jeu
minimaliste reçoit progressivement du « juice » — squash-and-stretch,
particules, tremblement de caméra et son — jusqu'à paraître bien plus
satisfaisant, sans aucun changement mécanique [2]. Pour Math Challenge, la
leçon est que le juice est bon marché et augmente directement la récompense
perçue d'une bonne réponse — ce qui compte le plus pour les enfants de 4 ans,
dont l'engagement est porté par la récompense sensorielle immédiate plus que
par le suivi de progression à long terme.

### 2. Sons de récompense

Un son court, distinct, à valence positive pour une bonne réponse fonctionne
comme un renforçateur secondaire, à la manière des sons de « pièce » dans les
jeux — un éloge instantané, indépendant de la langue. Pour un enfant de
4 ans, le carillon *est* l'éloge, délivré avant que le moindre texte puisse
être lu. Garder ces sons courts (environ 300-500 ms pour un tic ; jusqu'à
environ 1-2 s pour une célébration plus importante) afin qu'ils ne retardent
jamais la question suivante.

### 3. Musique de fond : une tension réelle et non résolue

**Contre.** L'effet du son non pertinent est un résultat robuste de la
psychologie cognitive : un son de fond sans rapport — parole, musique ou tout
autre stimulus non silencieux — dégrade le rappel sériel et la mémoire de
travail même quand il est ignoré et n'est pas lui-même testé [3].
L'explication standard est que le matériel auditif variable s'immisce dans la
boucle phonologique utilisée pour la répétition verbale, et cela s'applique à
la musique, pas seulement à la parole [3]. Le principe de cohérence de Mayer,
tiré de sa théorie cognitive de l'apprentissage multimédia, affirme
indépendamment que le matériel superflu — y compris la musique de fond
décorative — doit être exclu parce qu'il consomme une capacité de traitement
limitée nécessaire à la leçon elle-même [4] ; c'est l'un des résultats les
plus répliqués de la recherche sur le multimédia éducatif.

**Pour.** Aucun des deux résultats ne s'oppose à un son ponctuel et porteur
de sens — un carillon de bonne/mauvaise réponse, des instructions parlées
pour les non-lecteurs, un sting de célébration. Tous deux visent la
décoration continue et concurrente, pas un retour lié à un événement discret
(§1).

**Synthèse :** traiter « pendant la résolution » et « à la résolution »
comme deux régimes audio distincts. Le silence est le réglage par défaut
pendant la résolution ; si une musique existe, elle est optionnelle (opt-in)
et désactivée par défaut. À la résolution, le son bref de récompense/erreur
plus l'animation constituent le moment de juice — moins de deux secondes,
puis le silence reprend.

### 4. Audio pour les non-lecteurs

Pour les 4-6 ans, le texte à l'écran est inaccessible sans un adulte, donc
l'audio est l'interface principale, pas un supplément. Deux voies :

- **`speechSynthesis` (synthèse vocale).** Gratuite, utilisable hors ligne
  dès que la voix du système existe, peut lire du contenu dynamique
  (problèmes générés) sans préenregistrer chaque combinaison. Mais la
  qualité et la couverture des voix dépendent du système d'exploitation, pas
  du navigateur [7][8] ; un appareil sans pack vocal espagnol ou français
  installé bascule silencieusement vers une voix par défaut de moindre
  qualité, sans API web permettant de forcer son installation.
- **Voix off enregistrée (VO).** Qualité constante quel que soit l'appareil,
  mais figée et finie — chaque phrase, par langue, doit être enregistrée et
  livrée. Abordable pour un vocabulaire limité et borné (libellés de menu,
  « Correct ! », nombres, noms d'opérateurs) ; ne passe pas à l'échelle pour
  un texte de problème généré de façon arbitraire.

**Hybride recommandé :** voix off enregistrée pour le vocabulaire fixe
d'interface/de célébration dans les 5 langues ; synthèse vocale (ou extraits
de voix off concaténés) pour tout ce qui est combinatoire (énoncer des
problèmes générés) — le schéma que Khan Academy Kids et Duolingo utilisent
tous deux en pratique.

### 5. Animation de célébration : aide ou distrait ?

Les confettis, les compteurs d'étoiles et les animations de mascotte sont des
motivateurs extrinsèques qui s'ajoutent à la récompense intrinsèque d'une
bonne réponse. Une célébration longue et lente retarde le problème suivant et
risque de devenir exactement le type d'accroche superflue de l'attention
contre lequel mettent en garde la littérature sur la cohérence et le son non
pertinent. Une célébration courte et non bloquante (moins d'environ 1,5 s)
capture le bénéfice motivationnel sans interrompre le flux — « petit et
fréquent bat grand et occasionnel » pour maintenir l'engagement sans réduire
le temps passé sur la tâche.

### 6. Le retour haptique sur le web

La prise en charge de `navigator.vibrate()` est réelle mais inégale : Chrome
(bureau/Android), Edge, Samsung Internet et la plupart des navigateurs
Chromium Android la prennent en charge ; Firefox bureau ne l'a prise en
charge que jusqu'à la v128, abandonnée en 129+ ; et — surtout — **Safari iOS
ne l'a jamais prise en charge, dans aucune version de la 3,2 à la 26,5**
[5][6]. Comme toute WebView iOS utilise WebKit, ce n'est pas un problème de
« changer de navigateur ». La vibration est au mieux un accent sur
Android/Chromium, jamais le canal de retour principal, puisqu'une part
significative du parc cible (tous les iPad/iPhone) n'obtient rien. Aucune
API web n'expose le Taptic Engine d'iOS comme alternative.

### 7. `prefers-reduced-motion`

Cette fonctionnalité média CSS (Baseline depuis janvier 2020) expose une
préférence au niveau du système d'exploitation pour réduire les mouvements
non essentiels, car les animations de zoom/panoramique sont des déclencheurs
connus de troubles vestibulaires [13]. Chaque célébration à fort mouvement
(confettis, tremblement, rebond) a besoin d'une alternative plus calme
`prefers-reduced-motion: reduce` (fondu/changement de couleur) qui transmet
toujours « correct » — jamais en supprimant simplement le retour.

### 8. Une conception d'abord muette

Les salles de classe, les salles d'attente et les appareils familiaux
partagés sont des contextes où l'audio est souvent indésirable, indépendamment
des capacités de la plateforme. Combiné à la politique de lecture automatique
(§9), le silence doit être le réglage sûr par défaut, avec un contrôle de
sourdine persistant et toujours visible, activable en un tap, et la boucle
centrale (lire → répondre → voir le résultat) doit rester pleinement
utilisable en muet — une exigence également requise indépendamment par §10.

### 9. Politique de lecture automatique

Chrome et Safari bloquent tous deux l'audio avec son avant un geste de
l'utilisateur, sauf s'il est coupé [9][10]. L'indice d'engagement média
(Media Engagement Index) de Chrome peut mettre sur liste blanche une origine
bureau fréquemment visitée ; la lecture automatique en muet est toujours
autorisée [9]. Safari sur iOS exige `playsinline` pour la vidéo intégrée et
traite la vidéo coupée/sans audio de façon permissive [10][11]. Firefox
expose des préférences granulaires par domaine, dont une qui bloque
spécifiquement la lecture automatique de l'API Web Audio sans geste [11]. En
pratique : le premier son d'une session (y compris les instructions parlées)
ne peut pas se lancer automatiquement — il doit être conditionné à un tap sur
« Démarrer »/« Commencer ! », et ce même tap doit servir à reprendre/créer
l'`AudioContext` partagé (plus une mémoire tampon d'amorçage quasi
silencieuse) afin que tous les sons suivants se lancent instantanément.

### 10. Le retour ne doit jamais être uniquement sonore

Le critère WCAG 1.2.1 exige un équivalent textuel pour tout contenu
uniquement audio, car le texte peut être rendu par n'importe quelle modalité
sensorielle [12]. Les Game Accessibility Guidelines sont plus directes :
« veillez à ce qu'aucune information essentielle ne soit transmise uniquement
par des sons », et toute information audio supplémentaire doit être
reproduite en texte/visuel [14]. Pour Math Challenge, chaque signal de
bonne/mauvaise réponse, instruction et célébration a besoin d'une forme
visuelle (et, le cas échéant, textuelle) qui fonctionne seule, entièrement
coupée — une contrainte également exigée indépendamment par §8 et §9.

### 11. Chaîne de production des ressources

**Sprites.** Regrouper les effets courts (correct, incorrect, tic, tap) dans
un seul tampon audio-sprite lu via `AudioBufferSourceNode` de Web Audio avec
des décalages, ce qui évite de nombreuses petites requêtes et la charge par
instance de `<audio>`.

**Latence Web Audio vs `<audio>`.** L'élément `<audio>` sur mobile présente
une latence/des artefacts documentés et ne dispose ni de filtres, ni d'un
minutage précis, ni d'audio positionnel ; l'API Web Audio est la voie basse
latence pour un son de type jeu, tandis que `<audio>` reste utile pour
diffuser en flux une musique de fond longue sans bloquer sur un
téléchargement complet — souvent relié via `MediaElementAudioSourceNode` à
l'intérieur d'un `AudioContext` [15][17]. Les deux API bénéficient d'une
prise en charge large, de niveau Baseline, y compris sur Safari iOS [16][7] —
contrairement à la vibration, la lecture audio elle-même n'est pas un risque
multiplateforme.

**Budget de taille de fichier.** Cible de travail en attente de confirmation
du propriétaire : sons courts d'interface/de retour d'environ 10-30 Ko
chacun (compressés, dans un sprite) ; un vocabulaire de VO enregistrée borné
(environ 150-300 phrases) d'environ 15-40 Ko chacun représente plusieurs Mo
par langue — le principal facteur de poids des ressources hors ligne si les
5 langues sont livrées à l'installation. Mieux : n'embarquer que la langue
sélectionnée à l'installation, et récupérer/mettre en cache les autres à la
demande via un service worker.

**Licences.** Les effets sonores d'interface proviennent généralement de
bibliothèques libres de droits/CC0 ou d'audio commandé ; vérifier les
conditions d'attribution/d'usage commercial pour chaque ressource. La VO
enregistrée nécessite soit un accord avec un talent en interne, soit un
contrat avec un prestataire commercial de VO avec des droits clairs d'usage
commercial et de réenregistrement — une décision d'achat qui revient au
propriétaire, non tranchable à partir de la documentation publique.

---

## Tableau des capacités par plateforme

| Capacité | Safari iOS | Chrome Android | Bureau (Chrome/Edge/Firefox/Safari) | Source |
|---|---|---|---|---|
| **API Vibration** (`navigator.vibrate`) | **Non prise en charge**, toutes les versions testées de 3,2 à 26,5 | Prise en charge (actuelle) | Chrome v30+/Edge v79+ pris en charge ; Firefox v11–128 **seulement**, retiré en 129+ ; Safari bureau non pris en charge | caniuse.com/vibration [5] ; MDN [6] |
| **API Web Audio** | Prise en charge depuis Safari 6 | Prise en charge (actuelle) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ tous pris en charge | caniuse.com/audio-api [16] ; MDN [15] |
| **Lecture automatique (audio avec son)** | Bloquée avant un geste ; la vidéo coupée/sans audio peut se lancer automatiquement ; `playsinline` requis en ligne | Bloquée avant un geste sauf en muet ; le MEI de Chrome peut mettre sur liste blanche les origines fréquentes | Chrome/Edge : bloquée sauf muet/geste/MEI ; Firefox : préférences granulaires par domaine ; Safari bureau : même politique qu'iOS | Blog WebKit [10] ; blog Chrome [9] ; MDN [11] |
| **`speechSynthesis`** | Prise en charge depuis Safari 7 ; **le nombre et la qualité des voix par langue sont une propriété du système d'exploitation** | Prise en charge (actuelle) ; le navigateur système Android ne la propose pas | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ tous pris en charge | caniuse.com/speech-synthesis [7] ; MDN [8] |

Les inventaires de voix par langue (EN/ES/FR/PT/DE) ne peuvent pas être
établis à partir de la seule documentation — ils doivent être vérifiés par
système d'exploitation/appareil cible pendant la mise en œuvre [7][8].

---

## Implications de conception

1. **Âges 4-6.** Chaque instruction est audio (VO enregistrée, §4) plus un
   grand pictogramme — jamais du texte seul. Pas de musique de fond par
   défaut. Bonne réponse : carillon ≤ 500 ms + étincelle/rebond visuel
   simultané, sûr en muet.
2. **Âges 4-6, erreurs.** Ton doux, non punitif (pas de buzzers agressifs) +
   signal de rebond amical, maintenu dans une amplitude sûre pour
   `prefers-reduced-motion` même par défaut — cette tranche d'âge est plus
   sensible aux tremblements/flashs.
3. **Âges 7-10.** Le texte devient principal ; l'audio devient une lecture à
   voix haute optionnelle et activable. 2-3 variantes de carillon en
   rotation pour éviter la monotonie, ≤ 700 ms, sans animation bloquante.
4. **Âges 11+/adultes.** Audio désactivé par défaut, derrière une invite
   explicite « activer le son » (pas de lecture automatique) ; célébration
   minimale (tic de barre de progression, pas de confettis) pour un
   utilisateur peu distrait et rapide.
5. **Musique désactivée par défaut à chaque tranche d'âge** (§3). Si elle
   est proposée, uniquement en opt-in, avec un abaissement automatique
   (ducking) vers un niveau quasi silencieux pendant la résolution active,
   et un volume plein seulement sur les écrans de menu/inactivité.
6. **Répartition VO/TTS (§4).** VO enregistrée pour le vocabulaire fixe et
   borné (environ 150-300 phrases) dans les 5 langues ; `speechSynthesis`
   (ou extraits concaténés) pour les énoncés combinatoires de problèmes
   générés.
7. **Déverrouillage audio de la première session.** Le premier tap (un
   bouton « Démarrer », jamais de lecture automatique) sert aussi de geste
   pour reprendre/créer l'`AudioContext` partagé et déclenche un amorçage
   quasi silencieux, afin que les sons suivants n'aient aucun délai
   perceptible (§9).
8. **Haptique en accent seulement.** Déclencher un tic court (environ
   40-80 ms) là où `navigator.vibrate` existe (Chrome Android) ; concevoir
   une parité complète via le son et l'animation seuls pour iOS, où elle est
   totalement absente (§6).
9. **Variante `prefers-reduced-motion` pour chaque célébration**, livrée
   dans la même PR que la célébration — un fondu/pulsation calme qui
   préserve le signal de récompense sans déclencheur vestibulaire (§7).
10. **Contrôle de sourdine persistant en un tap**, toujours visible,
    mémorisant le dernier choix par appareil ; la boucle centrale en muet
    est un scénario testé de premier ordre, pas une réflexion après coup
    (§8, §10).
11. **Aucun retour uniquement sonore, nulle part** — chaque signal audio est
    associé à un équivalent visuel (et, quand du texte est à l'écran,
    textuel), vérifié à chaque nouveau son ajouté (§10).
12. **Budget de durée de célébration.** Par réponse : ≤ 500 ms d'audio /
    ≤ 800 ms d'animation, non bloquant. Au niveau de la session (série/niveau
    terminé) : ≤ 2,5 s au total, ignorable, sans jamais retenir « continuer »
    au-delà de ce plafond.
13. **Budget total de taille des ressources hors ligne** (cible de travail,
    en attente de confirmation du propriétaire) : ≤ 1,5 Mo de sprite
    d'effets sonores d'interface (indépendant de la langue) + ≤ 2-3 Mo pour
    le paquet de VO enregistrée de la langue par défaut à l'installation,
    les quatre autres langues étant récupérées/mises en cache à la demande
    plutôt qu'embarquées d'emblée. Cible d'empreinte audio à la première
    installation : **moins de 5 Mo**.

---

## Questions ouvertes pour le porteur du projet

1. Proposer de la musique de fond même en option (opt-in), malgré les
   preuves du §3 contre son usage pendant la résolution active — ou la
   réserver strictement aux écrans de menu/inactivité ?
2. Y a-t-il un budget/calendrier pour une VO professionnelle dans les
   5 langues pour le vocabulaire fixe, ou le lancement doit-il d'abord
   s'appuyer partout sur `speechSynthesis`, la VO étant ajoutée langue par
   langue plus tard ?
3. Livrer les 5 langues dans le paquet hors ligne initial, ou n'embarquer
   que la langue sélectionnée et récupérer les autres à la demande (ma
   recommandation de travail, voir l'implication 13) ?
4. Quel est le plafond de taille des ressources hors ligne pour
   l'application entière (pas seulement l'audio) — cela change le degré
   d'agressivité nécessaire du budget audio ?
5. Pour les déploiements en classe/sur appareil partagé, un réglage
   enseignant/administrateur devrait-il forcer la sourdine par défaut ou
   désactiver le contrôle du son pour les élèves, séparément du contrôle
   utilisateur par session ?
6. Une bibliothèque d'effets sonores sous licence est-elle déjà choisie, ou
   la note sur les licences du §11 doit-elle alimenter une décision d'achat
   avant qu'une ressource sonore ne soit livrée ?

---

## Sources

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation*
   (2008) — cadre du « feel » via le contrôle, l'espace et le polish.
2. GDC Vault, "Juice It or Lose It" (Martin Jonasson & Petri Purho, GDC
   Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose
3. Wikipedia, "Irrelevant speech effect" —
   https://en.wikipedia.org/wiki/Irrelevant_speech_effect
4. Mayer, R. & Moreno, R., "A Cognitive Theory of Multimedia Learning:
   Implications for Design Principles" (1998) — principe de cohérence
   (référencé via https://en.wikipedia.org/wiki/Multimedia_learning).
5. caniuse.com, "Vibration API" — https://caniuse.com/vibration
6. MDN, "Vibration API" —
   https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
7. caniuse.com, "Speech Synthesis API" —
   https://caniuse.com/speech-synthesis
8. MDN, "SpeechSynthesis" —
   https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
9. Chrome Developers blog, "Autoplay policy in Chrome" —
   https://developer.chrome.com/blog/autoplay/
10. WebKit blog, "New Video Policies for iOS" —
    https://webkit.org/blog/6784/new-video-policies-for-ios/
11. MDN, "Autoplay guide for media and Web Audio APIs" —
    https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
12. W3C WAI, "Understanding SC 1.2.1: Audio-only and Video-only
    (Prerecorded)" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html
13. MDN, "prefers-reduced-motion" —
    https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
14. Game Accessibility Guidelines, "Ensure no essential information is
    conveyed by sounds alone" —
    http://gameaccessibilityguidelines.com/full-list/
15. MDN, "Web Audio API" —
    https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API
16. caniuse.com, "Web Audio API" — https://caniuse.com/audio-api
17. web.dev, "Web Audio for games" — https://web.dev/articles/webaudio-games
18. W3C WAI, "Understanding SC 1.4.2: Audio Control" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
