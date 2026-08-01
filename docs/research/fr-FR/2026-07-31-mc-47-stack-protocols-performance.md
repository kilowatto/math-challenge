# Stack, protocoles et performance réelle : qu'est-ce qui est vraiment à la pointe sur Cloudflare

> Recherche Math Challenge — 2026-07-31 — sujet 47

## Résumé exécutif (FR)

- **gRPC n'est pas viable ici, et pas faute d'en avoir envie.** Les Workers et les Durable Objects **ne peuvent pas faire d'appels gRPC sortants** parce que le runtime ne prend pas en charge le streaming bidirectionnel HTTP/2 ; il existe une issue ouverte dans `cloudflare/workerd` qui le demande [1].
- **Et le navigateur ne parle pas gRPC non plus.** Le client web implémente un protocole différent du gRPC natif : les navigateurs n'exposent pas les fonctionnalités HTTP/2 dont gRPC a besoin, si bien que gRPC-Web utilise HTTP/1.1 — *« ce qui annule certains des avantages d'utiliser gRPC »* — et **ne prend en charge ni le streaming côté client ni le bidirectionnel** [2][3].
- **Le RPC natif de Workers gagne par architecture, et pas de peu.** Avec les Service Bindings *« il n'y a aucune surcharge ni latence ajoutée »*, et le Worker appelé *« ne traverse habituellement même pas un réseau, et tourne généralement dans le même thread que l'appelant, réduisant la latence à zéro »* [4][5].
- **HTTP/3 sur QUIC est un interrupteur, pas un projet.** Il est disponible sur tous les plans de Cloudflare et s'active depuis la configuration d'optimisation de protocole [6][7].
- **Le chiffre qui compte pour les réseaux dégradés :** sur des connexions avec 1-3 % de perte de paquets — le mobile réel — HTTP/3 apporte **10-30 % d'amélioration du temps de chargement**, parce que la récupération de perte par flux empêche un seul paquet perdu de bloquer toute la page [8].
- Avec le **0-RTT** pour les visiteurs récurrents, le gain peut **dépasser 300 ms**, suffisant pour faire passer une page de « à améliorer » à « bon » sur les Core Web Vitals [8].
- **INP est la métrique qui échoue.** 43 % des sites ne passent pas le seuil de 200 ms, et c'est la plus difficile de 2026 parce qu'elle mesure **chaque** interaction, pas la première ; l'ennemi ce sont les longues tâches JavaScript qui bloquent le thread principal [9].
- **Google se base sur des données de terrain, pas de laboratoire :** *« un 100 parfait sur Lighthouse ne veut rien dire si les utilisateurs réels sur des réseaux 3G souffrent »* [9].
- **AVIF et WebP donnent des fichiers 25-50 % plus petits** ; précharger l'image du LCP avec `fetchpriority="high"` est l'une des mesures les plus efficaces pour le LCP [9].
- Implication centrale : ce qui est à la pointe **sur cette plateforme** c'est le RPC natif + HTTP/3 + un budget dur d'INP, pas gRPC. Adopter gRPC ici reviendrait à adopter la génération précédente avec plus de travail.

## Executive summary (EN)

- **gRPC is not viable here.** Workers and Durable Objects **cannot make outbound gRPC calls** because the runtime lacks HTTP/2 bidirectional streaming; an open `cloudflare/workerd` issue tracks it [1].
- **Browsers don't speak gRPC either.** The web client implements a different protocol from native gRPC: browsers don't expose the HTTP/2 features gRPC needs, so gRPC-Web falls back to HTTP/1.1 — *"which cancels out some of the advantages of using gRPC"* — and **does not support client-streaming or bidirectional calls** [2][3].
- **Workers' native RPC wins on architecture.** With Service Bindings *"there is zero overhead or added latency"*, and the callee *"usually does not even cross a network, and usually runs in the very same thread as the caller, reducing latency to zero"* [4][5].
- **HTTP/3 over QUIC is a toggle, not a project** — available on all Cloudflare plans [6][7].
- **The number that matters for bad networks:** on 1-3% packet-loss connections, HTTP/3 delivers **10-30% page-load improvement**, because per-stream loss recovery stops one dropped packet from stalling everything [8]. With **0-RTT**, savings can **exceed 300 ms** [8].
- **INP is the one that fails.** 43% of sites miss the 200 ms threshold; it is 2026's hardest vital because it measures **every** interaction [9].
- **Google ranks on field data, not lab data** [9]. AVIF/WebP cut files 25-50% [9].
- Core implication: the leading edge **on this platform** is native RPC + HTTP/3 + a hard INP budget — not gRPC.

## Résultats

### 1. Pourquoi gRPC n'entre pas en ligne de compte

Trois faits indépendants, chacun suffisant à lui seul.

**Côté serveur.** L'issue `cloudflare/workerd#6455` documente que les Workers et les Durable Objects ne peuvent pas faire d'appels gRPC sortants parce que le runtime ne prend pas en charge le streaming bidirectionnel HTTP/2 ; l'issue elle-même signale que même prendre en charge uniquement le gRPC unaire — un POST HTTP/2 avec un corps protobuf plus des trailers — débloquerait la majorité des cas d'usage, et cela n'existe toujours pas [1].

**Côté navigateur.** Ce n'est pas une limitation de Cloudflare mais du protocole : la bibliothèque cliente web *implémente un protocole différent du gRPC natif* précisément parce que les navigateurs n'exposent pas les fonctionnalités HTTP/2 que gRPC requiert [3]. En conséquence, gRPC-Web utilise HTTP/1.1, *« ce qui annule certains des avantages d'utiliser gRPC »*, et **le streaming côté client et le bidirectionnel restent hors de portée** [2].

**Côté infrastructure intermédiaire.** Cloudflare documente sur son propre blog que les trailers HTTP — dont gRPC a besoin pour l'état — *n'étaient pas pleinement pris en charge* par son proxy de périphérie, et il existe des rapports de corps et de trailers gRPC supprimés à travers des tunnels même avec TLS+ALPN+h2 à l'origine [10][11].

**Conclusion.** Ce n'est pas que gRPC soit difficile ici : c'est que le cas d'usage qui le justifierait — un streaming binaire efficace et bidirectionnel — est exactement celui qui n'est disponible ni dans le runtime ni dans le navigateur. Ce qui resterait serait du protobuf sur HTTP/1.1 avec un proxy supplémentaire : plus de pièces, plus de latence, un débogage pire, et sans l'avantage.

### 2. Ce qui est vraiment à la pointe sur cette plateforme

Cloudflare dispose d'un RPC natif JavaScript sur les Service Bindings, conçu pour *« ressembler le plus possible à un appel de fonction JavaScript à l'intérieur du même Worker »* [4]. Sa caractéristique de performance ne se compare à aucune architecture réseau : *« il n'y a aucune surcharge ni latence ajoutée. Par défaut, les deux Workers tournent dans le même thread du même serveur Cloudflare »*, et le RPC vers un autre Worker *« ne traverse habituellement même pas un réseau »* [4][5].

Un RPC qui ne traverse pas le réseau ne peut pas être surpassé par un RPC qui le traverse, aussi efficace soit sa sérialisation. C'est toute la comparaison.

Les Service Bindings prennent en charge deux styles : le relais de `fetch` (on passe une `Request` complète) et le RPC typé (on invoque des méthodes directement) [5]. Le second est celui qui correspond au moteur de défi appelant le modèle de l'élève, le correcteur et le tuteur.

### 3. HTTP/3, QUIC et ce qui se passe vraiment sur un réseau congestionné

HTTP/3 est disponible sur tous les plans de Cloudflare et s'active avec un interrupteur dans la configuration d'optimisation de protocole [6][7]. Il n'y a pas de travail d'implémentation, seulement de vérification.

Ce qu'il apporte, avec des chiffres :

- **Perte de paquets.** Sur des connexions avec 1-3 % de perte — la fourchette typique du mobile réel — des études de Google et de Cloudflare rapportent **10-30 % d'amélioration du temps de chargement**, parce que l'isolation au niveau du flux empêche un paquet perdu de bloquer toutes les requêtes [8]. C'est exactement le scénario « Android d'entrée de gamme en Amérique latine » que le plan directeur nomme comme marché cible.
- **Établissement de connexion.** QUIC a été construit pour le 0-RTT/1-RTT ; avec le 0-RTT chez les visiteurs récurrents, le gain peut **dépasser 300 ms**, assez pour changer l'évaluation des Core Web Vitals d'une page [8].

**Ce que ça ne répare pas :** HTTP/3 accélère le transport, pas le travail. Un lourd bundle JavaScript continue de bloquer le thread principal exactement de la même façon sur QUIC que sur TCP. C'est pourquoi le budget d'INP (§4) compte plus que le protocole.

### 4. INP : la métrique que ce produit risque de manquer

Les seuils du « bon » en 2026 : LCP sous 2,5 s, CLS sous 0,1, INP sous 200 ms — et les sites les plus performants visent un **INP sous 150 ms** [9].

**43 % des sites échouent le seuil de 200 ms d'INP**, ce qui en fait la vitale la plus couramment manquée de 2026 [9]. La raison pour laquelle elle est plus difficile que les autres : **elle mesure chaque toucher et chaque clic, pas seulement le premier**, et l'ennemi ce sont les longues tâches du thread principal — du JavaScript lourd qui empêche le navigateur de répondre quand l'utilisateur interagit [9].

C'est un risque spécifique et nommable pour Math Challenge : le moteur de défi, ce sont des îlots React, l'enfant touche l'écran de nombreuses fois par session, et chaque toucher est mesuré. Un jeu de mathématiques est, par nature, une application à haute fréquence d'interaction — exactement le profil où INP se casse.

Et le cadre d'évaluation ferme la porte à l'autotromperie : **Google se base sur des données de terrain, pas de laboratoire** ; *« un 100 parfait sur Lighthouse ne veut rien dire si les utilisateurs réels sur des réseaux 3G souffrent »* [9].

### 5. Images

Servir des formats modernes — AVIF ou WebP — donne des fichiers **25-50 % plus petits** [9]. Pour le LCP, le plus efficace est de précharger l'image du LCP avec `fetchpriority="high"` en plus d'optimiser son poids [9].

Pour ce produit, le volume d'images est réel : ~30 œuvres de la Savane plus des illustrations d'items (`mc-40`, D-019), servies depuis R2 aux sept locales. Comme l'art se réutilise entre les langues — la Savane ne parle pas (D-019) — le catalogue d'images est partagé et donc hautement cachable.

### 6. Natif sur quatre plateformes

Les guides de plateforme sont explicites et distincts : Android suit Material Design, avec **Material 3** introduisant la couleur dynamique et les design tokens ; Apple couvre toutes ses plateformes avec les Human Interface Guidelines [12][13]. Pour qu'une PWA ne se sente pas comme du web, la recommandation pratique converge sur trois choses : **la typographie préférée du système**, distincte selon iOS/Android/Windows ; **des barres de navigation, onglets et modales dans le style de la plateforme** ; et **les gestes attendus** — défilement fluide, pincer pour zoomer, glisser [13][14].

Les contraintes fortes par plateforme sont déjà documentées dans `mc-33` et ne changent pas : sur iOS l'installation est manuelle et le push exige d'être installé ; sur Android il n'y a pas de barrière à l'installation ; sur macOS Safari 17+ il y a « Ajouter au Dock » ; sur Windows l'installation depuis Edge/Chromium est la plus intégrée des quatre.

Le coût de l'adaptation par plateforme n'est pas une question de recherche mais d'ingénierie : cela double les composants, les tests et les décisions de conception. C'est une décision produit, pas technique.

### 7. La flotte d'auditeurs

Un déploiement avec des auditeurs adversariaux est implémentable et correspond à la façon dont ce projet a été construit. Il se divise en deux classes avec des coûts et des vitesses différents.

**Déterministes (12), à chaque commit, en quelques secondes :** budget de bundle · Core Web Vitals avec les seuils de §4 · axe-core · contraste · taille des cibles tactiles par tranche (24 px WCAG AA / 44 px HIG / 88 px maternelle, selon `mc-38` et `mc-20`) · complétude des sept clés de langue · validation JSON-LD · réciprocité de `hreflang` · scan de secrets · préfixe `math-challenge-` (`CLAUDE.md` § Cloudflare) · sécurité des migrations · budget de pré-cache hors ligne (~5 MB d'audio, `mc-42`).

**Adversariaux avec LLM (23), à chaque PR, instruits pour trouver la violation et non pour approuver :** lignes rouges (les huit) · confidentialité COPPA/RGPD-K · anti-humiliation · anti-triche · patterns sombres · pédagogie · rigueur mathématique · rigueur scientifique (toute affirmation factuelle traçable) · canon de Larry · séries et temps d'écran · maternelle · PWA iOS · PWA Android · PWA-first/hors ligne · performance sur réseau lent · UX par tranche d'âge · et **un par locale** : `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

Total : **35**.

**Les deux règles qui les font servir plutôt que gêner.** Premièrement : **chaque auditeur cite la décision ou le document qu'il fait appliquer** — un auditeur qui ne peut pas pointer une décision de `decisions.md` ou un résultat de `research/` donne simplement un avis, et son verdict ne bloque pas. Deuxièmement : **annuler un auditeur exige d'écrire pourquoi**, et cette raison reste dans l'historique. Sans le premier, la flotte génère du bruit ; sans le second, elle devient un obstacle que les gens apprennent à contourner en silence.

**Risque connu, dit franchement :** 23 auditeurs avec LLM par PR ont un coût par PR et un taux de faux positifs. La mitigation, c'est que seuls les déterministes bloquent par défaut, et les adversariaux ne bloquent que lorsqu'ils citent une ligne rouge ou une décision explicite ; le reste rapporte sans bloquer.

## Implications de conception

1. **Pas de gRPC ni de gRPC-Web.** RPC natif de Workers sur les Service Bindings pour tout ce qui est interne (§1, §2).
2. **HTTP/3 vérifié, pas supposé**, y compris le 0-RTT pour les récurrents ; c'est de la configuration, et il faut confirmer que c'est actif avant de le revendiquer (§3).
3. **Budget dur d'INP ≤ 150 ms, pas 200** — c'est un jeu à haute fréquence d'interaction et le seuil laxiste est là où échouent 43 % du web (§4).
4. **Mesure avec des données de terrain dès le premier jour**, pas avec Lighthouse ; un 100 de laboratoire ne dit rien sur l'enfant en 3G (§4).
5. **AVIF avec repli WebP pour tout l'art**, avec `fetchpriority="high"` sur l'image du LCP de chaque écran (§5).
6. **L'art de la Savane est mis en cache une fois et sert les sept locales**, parce qu'il ne contient pas de texte (D-019) — c'est le levier de poids le moins cher que le produit possède.
7. **Interface adaptative par plateforme** : Material 3 sur Android, HIG sur iOS/macOS, contrôles du système sur Windows, avec la typographie du système sur chacune (§6).
8. **Budget de performance comme auditeur déterministe qui bloque**, pas comme rapport qu'on ignore (§7).
9. **35 auditeurs, avec les deux règles de §7** : citer la décision qu'ils font appliquer, et l'annulation par écrit.
10. **Seuls les déterministes bloquent par défaut** ; les adversariaux ne bloquent qu'en citant une ligne rouge ou une décision explicite (§7).

## Questions ouvertes pour le propriétaire du projet

1. Que fait-on quand un auditeur adversarial en contredit un autre — par exemple la performance qui demande moins de JavaScript et l'accessibilité qui demande plus de logique de focus ? Y a-t-il un ordre de préséance écrit ?
2. Les 23 auditeurs avec LLM tournent-ils à chaque PR ou seulement sur celles qui touchent des routes sensibles ? Le coût par PR et le temps d'attente changent beaucoup.
3. Le budget d'INP de 150 ms se mesure sur quel appareil de référence ? `mc-33` propose un Android milieu de gamme sur du 3G lent ; il faut le fixer, sinon le budget n'est pas vérifiable.
4. L'interface adaptative inclut-elle Windows et macOS dès le départ, ou seulement le mobile en v1 ?

## Sources

1. GitHub, `cloudflare/workerd` issue #6455 — "Support HTTP/2 bidirectional streaming (gRPC) in Workers/Durable Objects" — https://github.com/cloudflare/workerd/issues/6455
2. GitHub, `cloudflare/workerd` issue #3150 — "[Question] gRPC/gRPC-web (+streaming) support for Cloudflare Workers" — https://github.com/cloudflare/workerd/issues/3150
3. gRPC Core documentation, "gRPC Web" (PROTOCOL-WEB) — https://grpc.github.io/grpc/core/md_doc__p_r_o_t_o_c_o_l-_w_e_b.html
4. Cloudflare Blog, "We've added JavaScript-native RPC to Cloudflare Workers" — https://blog.cloudflare.com/javascript-native-rpc/
5. Cloudflare Workers docs, "Service bindings — RPC (WorkerEntrypoint)" — https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/
6. Cloudflare Speed docs, "HTTP/3 (with QUIC)" — https://developers.cloudflare.com/speed/optimization/protocol/http3/
7. Cloudflare Speed docs, "Protocol optimization" — https://developers.cloudflare.com/speed/optimization/protocol/
8. Calmops, "HTTP/3 and QUIC Protocol Complete Guide 2026" — https://calmops.com/network/http3-quic-protocol-complete-guide/ — source des chiffres de 10-30 % avec 1-3 % de perte et du gain >300 ms avec le 0-RTT.
9. Digital Applied, "Core Web Vitals 2026: INP, LCP & CLS Optimization" — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide — source des seuils, des 43 % qui échouent l'INP, du gain de 25-50 % d'AVIF/WebP et de la distinction terrain-vs-laboratoire.
10. Cloudflare Blog, "Road to gRPC" — https://blog.cloudflare.com/road-to-grpc/
11. GitHub, `cloudflare/cloudflared` issue #1641 — trailers gRPC supprimés à travers un tunnel — https://github.com/cloudflare/cloudflared/issues/1641
12. UXPin, "iOS vs. Android UI Design: 9 Key Differences (2026)" — https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/
13. DEV Community, "Designing Native-Like Progressive Web Apps for iOS" — https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o
14. MagicBell, "4 Essential PWA Strategies for Enhanced iOS Performance" — https://www.magicbell.com/blog/essential-pwa-strategies-for-enhanced-ios-performance
15. Recherche interne : `mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`, `mc-38-accessibility-learning-differences.md`, `mc-42-audio-haptics-game-feel.md`.

**Qualité des sources.** Les sources [1]-[7] et [10]-[11] sont primaires : documentation officielle de Cloudflare, de gRPC, et issues publiques de leurs dépôts. Les sources [8], [9], [12]-[14] sont des publications de l'industrie ; leurs chiffres (10-30 %, 43 %, 25-50 %) doivent être traités comme un **ordre de grandeur directionnel** et revérifiés contre le Web Almanac ou le CrUX avant d'être utilisés dans du matériel public. La conclusion sur gRPC (§1) repose **uniquement sur des sources primaires** et est la plus solide de ce document.
