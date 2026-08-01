# Le site ouvert : pourquoi publier la recherche *est* la stratégie organique

> Recherche Math Challenge — 2026-07-31 — sujet 48

## Résumé exécutif (FR)

- **Le constat qui change le plan :** après la mise à jour de mars 2026, *« la recherche originale et les études de cas documentées sont devenues l'un des actifs de contenu les plus précieux qu'une organisation puisse produire »* [1].
- **Et les citations de l'IA l'amplifient :** une étude de Wellows portant sur 2 400 citations dans les AI Overviews a trouvé que les pages avec des signaux E-E-A-T forts ont **2,3× plus de probabilité d'être citées** [1].
- **Le coût de ne pas l'avoir est réel :** des centaines de sites ont perdu **40-70 % de leur trafic organique du jour au lendemain** lors de mises à jour récentes de l'algorithme ; ceux qui ont survécu et grandi avaient investi à fond dans l'E-E-A-T [1].
- **E-E-A-T ce sont quatre choses distinctes** — Experience (implication de première main), Expertise (connaissance et compétences), Authoritativeness (reconnaissance et réputation) et Trustworthiness (exactitude, transparence et expérience d'utilisation) [1][2]. Le premier **E** a été ajouté en décembre 2022 [2].
- Math Challenge dispose de 152 000 mots de recherche originale **avec sources citées, limites déclarées et affirmations marquées `[unverified]`** — cela couvre l'Expertise et la Trustworthiness d'une façon que presque personne dans l'edtech ne couvre.
- **Ce qui ne peut être ni acheté ni recherché, c'est l'Experience** : l'histoire de première main de pourquoi le projet existe. Seul le propriétaire peut l'apporter (voir [`por-que-existe.md`](../por-que-existe.md)).
- **JSON-LD est le format préféré de Google**, et le contenu de la structure **doit être traduit par version de langue** en maintenant le schéma intact ; chaque version localisée déclare son `inLanguage` [3][4][5].
- **Le schéma ne remplace pas `hreflang`**, il le complète : `hreflang` signale les variantes de langue et de région, le schéma renforce cette intention sous une forme lisible par machine [3][4].
- **Règle dure :** le contenu du schéma **doit correspondre à ce qui est visible sur la page** ; s'il diffère, Google peut ignorer le balisage entièrement [5].
- Implication centrale : le site n'est pas du marketing avec de la recherche en annexe. **La recherche est le site**, et l'accessibilité WCAG 2.2 AA (`mc-38`) n'est pas seulement une obligation légale dans l'UE depuis juin 2025 mais un signal direct de Trustworthiness.

## Executive summary (EN)

- **The finding that changes the plan:** after the March 2026 update, *"original research and documented case studies have become some of the highest-value content assets an organization can produce"* [1].
- **AI citations amplify it:** a Wellows study of 2,400 AI Overview citations found pages with strong E-E-A-T signals are **2.3× more likely to be cited** [1].
- **The cost of lacking it is real:** hundreds of sites lost **40-70% of organic traffic overnight** in recent core updates; those that survived and grew had invested deeply in E-E-A-T [1].
- **E-E-A-T is four distinct things** — Experience (firsthand involvement), Expertise, Authoritativeness, Trustworthiness [1][2]. The first **E** was added in December 2022 [2].
- Math Challenge has 152,000 words of original research **with cited sources, declared limitations, and `[unverified]` flags** — covering Expertise and Trustworthiness in a way almost nobody in edtech does.
- **What cannot be bought or researched is Experience**: the firsthand story of why the project exists.
- **JSON-LD is Google's preferred format**, structured-data content **must be translated per language version** with the schema intact, and each localized version declares `inLanguage` [3][4][5].
- **Schema does not replace `hreflang`** — it complements it [3][4]. **Hard rule:** schema content **must match what is visible on the page**, or Google may ignore the markup entirely [5].
- Core implication: the research *is* the site, and WCAG 2.2 AA accessibility is a Trustworthiness signal, not only an EU legal obligation.

## Résultats

### 1. Pourquoi 152 000 mots de recherche sont l'actif, pas l'annexe

Le changement de fond après mars 2026, c'est que Google a arrêté de récompenser le contenu qui *paraît* faisant autorité et a commencé à récompenser celui qui **l'est de façon démontrable**. La formulation exacte de la source : la recherche originale et les études de cas documentées *« sont devenues l'un des actifs de contenu les plus précieux qu'une organisation puisse produire »* [1].

Le second effet est celui qui compte le plus à moyen terme. Avec les AI Overviews qui interviennent dans un nombre croissant de recherches, être **cité** vaut plus que se positionner : l'étude de Wellows sur 2 400 citations a trouvé que les pages avec des signaux E-E-A-T forts ont **2,3× plus de probabilité d'être citées** [1]. Une recherche avec des sources numérotées et vérifiables est exactement le type de page qu'un système de récupération préfère citer.

Et le risque de ne pas le faire est mesuré : des centaines de sites ont perdu **40-70 % de leur trafic organique du jour au lendemain** lors de mises à jour récentes, et ceux qui ont grandi avaient investi à fond dans l'E-E-A-T [1].

**Où en est Math Challenge.** Les 45 recherches ont des sources numérotées, déclarent leurs limites de méthode, marquent `[unverified]` ce qu'elles n'ont pas pu confirmer auprès d'une source primaire, et — voici ce qui est inhabituel — **incluent les passages où les preuves contredisent le produit lui-même** : `mc-10` démonte la citation la plus célèbre sur les examens chronométrés, `mc-17` documente l'exposition réglementaire de la mécanique que le brief original demandait, `mc-14` signale que le tuteur de Khan Academy n'a pas surpassé un moteur de recherche dans une étude contrôlée.

Publier cela n'est pas de l'humilité : c'est la définition opérationnelle de la Trustworthiness. Et pratiquement aucun concurrent ne le fait — `mc-14` documente que Brilliant, Matific et Mathletics manquent de preuves indépendantes publiées, et que Kumon n'a pas une seule étude qui respecte les standards du What Works Clearinghouse.

### 2. Les quatre lettres, et laquelle manque

E-E-A-T se décompose en quatre signaux distincts, et il convient de les cartographier parce que le site doit couvrir les quatre par des voies différentes [1][2] :

| Signal | Ce qu'il interroge | Par quoi ce site le couvre |
|---|---|---|
| **Experience** | L'auteur a-t-il une implication de première main ? | L'histoire du propriétaire : pourquoi il a commencé, sa propre relation aux mathématiques, son propre usage du produit. **Lui seul peut l'apporter.** |
| **Expertise** | Y a-t-il une connaissance et une compétence démontrées ? | 45 recherches, 152 000 mots, avec des sources primaires citées |
| **Authoritativeness** | Y a-t-il reconnaissance et réputation ? | Ignia comme soutien institutionnel ; les citations entrantes que la recherche publiée attirera avec le temps |
| **Trustworthiness** | Y a-t-il exactitude, transparence et bonne expérience d'utilisation ? | Limites déclarées, `[unverified]` visibles, contradictions publiées, et accessibilité WCAG 2.2 AA |

L'**Experience** est la seule qui ne peut pas être produite avec plus de travail de recherche, et elle a été ajoutée en décembre 2022 précisément pour distinguer celui qui a vécu le problème de celui qui ne l'a que étudié [2]. C'est pourquoi l'entretien avec le propriétaire n'est pas du contenu de remplissage pour la page « à propos » : c'est le signal que le reste du site ne peut pas générer.

### 3. Données structurées en sept locales

**JSON-LD est le format préféré de Google** [3][5]. Les règles qui régissent son usage multilingue :

- **Le contenu à l'intérieur du JSON-LD se traduit par version de langue, en maintenant la structure intacte** — les données structurées doivent refléter chaque version localisée de façon indépendante [3][4].
- **Chaque version déclare sa langue** avec la propriété `inLanguage` ; pour les noms d'organisation, il convient d'inclure `alternateName` dans différentes langues [3][4].
- **Les types de schéma doivent rester cohérents entre les langues** — on n'utilise pas `Course` en français et `Article` en allemand pour la même page [5].
- **Le schéma ne remplace pas `hreflang`.** Les balises `hreflang` sont celles qui indiquent les variantes de langue et de région aux moteurs de recherche ; le schéma renforce cette intention sous une forme lisible par machine [3][4].
- **Règle qui invalide tout le reste si elle est enfreinte :** le contenu du schéma **doit correspondre à ce qui est visible sur la page**. Si le balisage contient quelque chose de différent de ce qui est affiché, Google peut l'ignorer entièrement [5].

Les types qui correspondent à ce site : `Organization` (Ignia comme éditeur), `WebSite`, `Course` pour les tranches de niveau, `FAQPage` pour les questions des parents, `BreadcrumbList` pour la navigation, et pour chacune des 45 recherches un type d'article académique avec ses sources citées — ce qui est précisément le format qu'un système de citation préfère consommer.

### 4. Sept locales, pas cinq langues

Le site hérite de la réalité de `mc-34` : `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Pour le SEO, cela signifie sept versions avec `hreflang` réciproque — chaque page pointant vers toutes les autres et vers elle-même — plus `x-default`.

Le piège spécifique à ce produit : **`es-MX` et `es-ES` ne sont pas la même page traduite**, parce que la notation mathématique diffère (point contre virgule décimale, format de la division longue). Publier une seule version « es » et déclarer deux `hreflang` serait techniquement valide et **factuellement incorrect** dans le contenu mathématique, qui est justement le contenu que le site veut voir cité.

### 5. L'accessibilité comme signal, pas seulement comme obligation

`mc-38` établit déjà l'exigence légale : la loi européenne sur l'accessibilité s'applique depuis le 28 juin 2025 et inclut explicitement le commerce électronique, avec EN 301 549 (qui intègre entièrement WCAG 2.1) comme référence technique. L'objectif interne est WCAG 2.2 AA, un sur-ensemble strict.

Ce que ce document ajoute : la Trustworthiness de l'E-E-A-T évalue aussi **l'expérience d'utilisation** [1][2]. Un site inaccessible ne se contente pas d'enfreindre la loi dans l'UE — il échoue sur l'un des quatre signaux qui déterminent si le contenu se positionne et se fait citer. C'est le cas rare où conformité légale et stratégie organique visent exactement le même travail.

### 6. L'attribution d'Ignia, et pourquoi la précision ici est stratégique

Ignia Cloud est un fournisseur de cloud basé à Mexico avec des opérations aux États-Unis, qui se décrit avec la devise *« Trust, Integrity and Availability in one place »*, propose de l'infrastructure, de la sécurité des données, de la gestion de données à grande échelle et du calcul haute performance, et déclare un SLA de 99,99 % avec des alliances avec Microsoft, Dell Technologies, Cisco Systems, OpenStack, Canonical et Acronis [6].

**Math Challenge tourne sur Cloudflare** (`mc-32`). Affirmer que la stack est fournie par Ignia serait démenti par une simple requête DNS, et le public cible de la page d'architecture est précisément celui qui la ferait.

La formulation exacte et vérifiable se fait en deux parties : **Ignia crée et parraine le projet** — ce qui est vrai, et cela inclut le fait que Larry est son personnage préexistant (`mc-37`, D-004) — **et Cloudflare est l'infrastructure**. Les deux affirmations résistent à l'examen, et au passage la page d'architecture devient un contenu technique citable par lui-même, ce qui fait plus de trafic organique et pas moins.

Cela se connecte à la Trustworthiness de façon directe : un site qui publie ses `[unverified]` puis exagère à propos de sa propre infrastructure se contredit sur son signal le plus précieux.

## Implications de conception

1. **Publier les 45 recherches complètes** comme des pages propres et indexables, avec sources, limites et `[unverified]` visibles — c'est l'actif que la mise à jour de mars 2026 récompense (§1).
2. **Publier aussi ce qui contredit le produit.** C'est la partie qu'aucun concurrent ne fait et celle qui soutient le signal de Trustworthiness (§1, §2).
3. **L'histoire du propriétaire est du contenu de premier niveau, pas une page « à propos ».** C'est l'unique source d'Experience du site (§2).
4. **JSON-LD avec `inLanguage` par version**, structure identique entre les locales et contenu traduit à l'intérieur (§3).
5. **`hreflang` réciproque entre les sept locales plus `x-default`**, complété — pas remplacé — par le schéma (§3, §4).
6. **`es-MX` et `es-ES` sont deux pages distinctes là où il y a de la notation mathématique**, pas une avec deux étiquettes (§4).
7. **Un auditeur déterministe qui valide le JSON-LD et la réciprocité de `hreflang`** à chaque commit, et un autre qui vérifie que le schéma correspond à ce qui est visible (§3) — la règle dont le non-respect invalide tout le balisage.
8. **WCAG 2.2 AA comme exigence de publication du site**, pas seulement de l'application (§5).
9. **Attribution en deux parties : projet d'Ignia, infrastructure de Cloudflare** (§6).
10. **La page d'architecture est du contenu, pas un bas de page.** Expliquer pourquoi le RPC natif plutôt que gRPC, pourquoi HTTP/3, pourquoi les tentatives ne vont pas à D1 — c'est du matériel technique citable (`mc-47`).
11. **Un auditeur de locale par langue révise aussi le site**, pas seulement l'application : une notation mathématique mal localisée sur une page publique est une erreur citable par des tiers.
12. **Ne pas revendiquer de résultats d'apprentissage** tant que l'étude propre n'existe pas ; le plan directeur §14 l'interdit déjà, et sur un site qui affiche de la rigueur, une seule affirmation non étayée coûte plus cher que sur un site qui ne l'affiche pas.

## Questions ouvertes pour le propriétaire du projet

1. Les 45 recherches se publient-elles dans les sept locales ou seulement en `en` et `es-MX` ? Traduire 152 000 mots × 6 est un coût réel ; les publier seulement dans deux et déclarer un `hreflang` correct est défendable.
2. Le site vit-il sur `math.kilowatto.com` à côté de l'application, ou sur un domaine propre ? Cela affecte l'autorité de domaine et la séparation entre le public et l'authentifié.
3. Qui signe les recherches comme auteur ? L'Authoritativeness s'améliore avec une autorité attribuée et vérifiable, et aujourd'hui les documents n'ont pas de signature.
4. Publie-t-on aussi `decisions.md` — y compris les décisions qui ont été annulées, comme D-001 et D-010 ? C'est le niveau maximal de transparence et aussi le plus exposé.
5. Y a-t-il un appétit pour rechercher activement des citations entrantes (chercheurs, presse éducative, communauté edtech), ou la stratégie est-elle purement organique passive ?

## Sources

1. Digital Applied, "E-E-A-T in March 2026: Google Rewards Experience Content" — https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide — source du constat sur la recherche originale comme actif de plus grande valeur, de l'étude Wellows sur 2 400 citations (2,3×), et de la perte de 40-70 % de trafic.
2. Keywords Everywhere, "Google E-E-A-T Guidelines: an Overview (2026 Playbook)" — https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/ — source de la définition des quatre signaux et de la date d'ajout de l'Experience.
3. Better i18n, "Multilingual Schema Markup: Structured Data for International SEO" — https://better-i18n.com/en/blog/multilingual-schema-markup/
4. Linguise, "Using schema markup and structured data for multilingual websites SEO" — https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/
5. SearchX, "Structured Data For Multilingual SEO: Top 7 Tips" — https://searchxpro.com/structured-data-for-multilingual-seo-top-7-tips/ — source de la règle de correspondance schéma-page.
6. Ignia Cloud, site officiel — https://ignia.cloud — source de la description, de la devise, des services, du SLA et des alliances.
7. Recherche interne : `mc-34-i18n-math-notation.md` (les sept locales et pourquoi ce ne sont pas cinq langues), `mc-38-accessibility-learning-differences.md` (WCAG 2.2 AA et la loi européenne sur l'accessibilité), `mc-14-competitive-products.md` (l'absence de preuves publiées chez les concurrents), `mc-47-stack-protocols-performance.md` (le contenu technique citable), `mc-32-cloudflare-architecture.md` (ce qui tourne où, pour l'attribution de §6).

**Qualité des sources.** Aucune source de ce document n'est primaire de Google : [1]-[5] sont des publications d'agences et de cabinets de conseil en SEO, qui ont un intérêt commercial à ce que le SEO paraisse décisif. Les chiffres concrets — 2,3×, 40-70 %, l'étude Wellows sur 2 400 citations — **doivent être traités comme non vérifiés auprès d'une source primaire** et confirmés dans la documentation de Google Search Central avant d'être utilisés dans du matériel public ou pour justifier un budget. L'orientation structurelle (JSON-LD préféré, `inLanguage`, le schéma ne remplace pas `hreflang`, le schéma doit correspondre à la page) est cohérente entre les cinq sources et avec la documentation publique de Google, et c'est la partie la plus fiable. La source [6] est primaire, d'Ignia elle-même.
