# Larry Profe — porter Larry vers Math Challenge
> Recherche Math Challenge — 2026-07-31 — sujet 37

## Résumé exécutif (FR)

Larry existe déjà dans IOS en tant que copilote EN/ES au-dessus de Workers AI (`kimi-k2.6` → `gpt-oss-120b` → réponse en conserve), avec un unique prompt système bilingue, un protocole de « tool calling » fait main (JSON sur une ligne) et un journal d'audit durable dans D1. Rien de tout cela n'utilise l'API de Claude — ce serait la première intégration de Claude dans ce dépôt.

Le porteur du projet a déjà décidé : Larry Profe utilise l'**API de Claude** avec un **routage par difficulté** (Haiku/Sonnet/Opus). Le précédent le plus proche dans le dépôt n'est pas le chat libre, mais `src/larry/contador/explain.ts` : un constat déterministe entre, un LLM l'explique en langage naturel sans rien recalculer, avec repli sur un gabarit. Larry Profe doit suivre exactement ce schéma : le moteur de notation décide de ce qui est juste ou faux ; Claude se contente d'expliquer, dans la langue, l'âge et le ton corrects, sans jamais faire honte à l'enfant.

## Executive summary (EN)

Larry-in-IOS runs on Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → canned reply), with a hand-rolled single-line-JSON tool-calling protocol and a durable D1 audit sink. It never touches the Claude API — Larry Profe would be this repo's first Claude integration, not a reuse of existing plumbing.

The owner has decided Larry Profe uses the **Claude API** with **model routing by difficulty** (Haiku/Sonnet/Opus). The closest existing precedent is not the free-form chat endpoint but `src/larry/contador/explain.ts`: a deterministic-finding-in, LLM-explains-it-out pattern with a hard "never compute, only cite what's in the JSON" rule and a template fallback. Larry Profe should follow that shape: Math Challenge's own grading engine is the source of truth on correctness; Claude's only job is turning a structured verdict into a warm, age-appropriate, five-language explanation — never re-deriving the math itself.

## Ce qui existe aujourd'hui — chemins de fichiers et références de lignes de ce dépôt

- **Persona/canon.** `docs/larry.md:1-16` — « rhinocéros orange, coach honnête », phrase fétiche « ¡Ya vas! » seulement à l'acceptation d'une tâche, humour toujours dirigé contre lui-même seulement.
- **La chaîne de modèles est Workers AI, pas Claude.** `src/larry/chat.ts:40-41` : `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (même paire dans `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006) : « notre propre modèle (Workers AI) sert 70 à 90 % du trafic routinier ; une API de pointe traite les cas difficiles » plus un cache sémantique et un budget par rôle — une forme conceptuellement similaire à ce dont Larry Profe a besoin, mais IOS est d'abord Workers AI avec Claude en débordement ; le brief Math Challenge du porteur du projet est d'abord Claude avec routage par difficulté du problème, ce n'est pas la même politique.
- **Motif de prompt bilingue unique.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — chaque ligne de persona/règle est écrite deux fois, EN puis ES, dans une seule chaîne (par ex. `:29`) ; seule l'instruction « répondre dans la langue X » (`:47`) est spécifique à la locale. Ne passe pas à l'échelle pour 5 langues (voir plus bas).
- **Liste stricte des « jamais ».** `src/larry/prompts.ts:38-44` — cinq points : ne jamais supprimer les données du client, ne jamais lire le contenu des objets, ne jamais toucher à la facturation sans confirmation, ne jamais créer/faire tourner des clés par chat, ne jamais modifier le code/la configuration ; reformulé en prose dans `docs/larry.md:96-102` (§4.2). C'est l'emplacement de gabarit dans lequel Larry Profe a besoin de ses propres règles de sécurité pour enfants.
- **Protocole d'outils fait main.** Le modèle doit répondre uniquement avec un `{"tool": "<name>", "args": {...}}` sur une ligne (`prompts.ts:50-51`), et non avec les blocs de contenu `tool_use` d'Anthropic. Analysé par `parseToolCall` (`chat.ts:273-289`) ; bouclé par `generateReplyWithTools` (`:236-267`), plafonné à `MAX_TOOL_HOPS = 2` (`:44`). La sécurité de portée par tenant se trouve dans `src/larry/tools.ts:47-48, 342-394`.
- **Chaîne de repli, sans nouvelle tentative/backoff.** `chat.ts:295-314` `generateReply` essaie chaque modèle une fois, et retombe sur `cannedErrorReply(locale)` (`prompts.ts:67-71`) si les deux échouent.
- **Puits d'audit.** `migrations/0011_larry_audit.sql:5-23` — table D1, types de ligne `chat`/`tool`, colonnes incluant `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Les écrivains `src/larry/audit.ts:36-67, 70-97` sont best-effort, ne lèvent jamais d'exception. Les comptages de tokens sont une estimation grossière `text.length / 4` (`audit.ts:31-33`), pas un véritable `usage` du modèle — les réponses de Claude portent des comptages de tokens exacts, que l'audit de Larry Profe devrait enregistrer précisément à la place.
- **La détection de locale se limite à EN/ES.** `src/larry/locale.ts:9, 63-71` — liste de mots espagnols codée en dur, plus vérification de caractères accentués ; l'anglais est la valeur par défaut. Aucune infrastructure FR/PT/DE n'existe ; étendre cette heuristique est fragile (voir plus bas).
- **Le véritable précédent : `src/larry/contador/explain.ts`.** `:67-75` la règle stricte du prompt système (« Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0. ») ; `:106-145` `explainFinding()` retire le champ `explanation` précalculé avant d'envoyer le constat au modèle (`:113`, pour qu'il ne puisse pas simplement répéter une chaîne toute faite), demande un JSON bilingue `{"en":..., "es":...}`, et retombe sur `renderTemplateExplanation()` (`:41-60`) — un simple déversement de faits, sans LLM — en cas d'échec. C'est architecturalement ce dont Larry Profe a besoin.
- **Avatar + machine à états.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — états `orb|face|idle|thinking|working|happy|denying|celebrating|presenting` ; `larry.css:1-121` un `@keyframes` par état, désactivé sous `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documente `idle → thinking → working → idle`. Réutilisable tel quel pour Larry Profe.
- **Aucun usage de l'API Claude nulle part dans ce dépôt aujourd'hui** — aucun import `@anthropic-ai/sdk` sous `src/` ou `packages/`. C'est une première intégration, pas une extension.

## Ce qui doit changer pour un tuteur de mathématiques destiné aux enfants

1. **Le ton, pas le « coach honnête ».** La persona d'IOS vise des ingénieurs B2B adultes capables d'encaisser une correction directe. Un enfant ne doit jamais se sentir humilié — plus strict que « l'humour ne se moque jamais des caractéristiques des personnes ».
2. **Cinq langues, pas deux.** Le type `'en'|'es'` et le détecteur par liste de mots de `locale.ts` ne s'étendent pas à FR/PT/DE, et le motif « écrire chaque ligne deux fois » de `prompts.ts` multiplierait par 5 les tokens de prompt pour un contenu majoritairement inutilisé par appel — construire à la place un prompt monolingue par locale.
3. **L'exactitude mathématique ne peut pas dépendre du LLM.** Une mauvaise réponse d'outil IOS est une mauvaise indication d'interface ; une mauvaise explication de Larry Profe enseigne activement des mathématiques incorrectes. C'est précisément pourquoi le schéma « le LLM explique, ne calcule jamais » de `contador/explain.ts` est le bon, et pas la boucle libre de `chat.ts`.
4. **Vocabulaire par âge**, explicite dans le prompt (tranche d'âge en tant que paramètre), et non laissé à l'inférence du modèle à partir du ton.
5. **Le routage de modèle est nouveau** — l'ADR-006 décrit un routage hybride d'abord Workers AI ; Larry Profe inverse cela (d'abord Claude, trois paliers de difficulté, sans Workers AI), selon le brief du porteur du projet.
6. **Retirer ou adoucir l'état d'avatar `denying`** pour un produit destiné aux enfants — le langage corporel de hochement de tête négatif (`larry.css:87-98`) se lit comme « tu as tort » ; préférer `thinking`→`presenting` pour les corrections.

## Tableau de routage des modèles

Les identifiants de tarification/modèle proviennent de la compétence `claude-api` (mise en cache le 2026-06-24 ; la tarification de lancement de Sonnet 5 court jusqu'au 2026-08-31), et non de la mémoire d'entraînement. Les estimations de coût supposent un préfixe de prompt système partagé (couvert sous la mise en cache ci-dessous) plus une charge utile par appel de {problème, étapes de l'élève, verdict de notation} ; les chiffres sont des estimations à valider face à de vrais prompts, pas des mesures.

| Palier de difficulté | ID du modèle | $/MTok entrée / sortie | Tokens est. entrée → sortie | Coût est. / 1 000 explications | Cible de latence |
|---|---|---|---|---|---|
| Arithmétique de base | `claude-haiku-4-5` | 1,00 $ / 5,00 $ | ~300 → ~150 | **~1,05 $** | < 1,5 s, streaming non nécessaire |
| Palier intermédiaire (fractions, algèbre, géométrie) | `claude-sonnet-5` | 3,00 $ / 15,00 $ (lancement 2 $/10 $ jusqu'au 2026-08-31) | ~500 → ~300 | **~6,00 $** (lancement **~4,00 $**) | 2-4 s, streaming si > ~3 s |
| Avancé (calcul tensoriel, intégrales doubles, preuves) | `claude-opus-5` | 5,00 $ / 25,00 $ | ~800 → ~600 + réflexion adaptative | **plancher de ~19 $, réalistement 35-60 $** une fois les tokens de réflexion comptés | 5-15 s ; streaming obligatoire |

Notes :

- **Le coût d'Opus 5 est dominé par les tokens de réflexion.** Selon la compétence, la réflexion est **activée par défaut** sur Opus 5 — une requête qui ne définit jamais `thinking` réfléchit quand même, et la réflexion est facturée comme sortie à 25 $/MTok. Une explication difficile peut consommer 1 000 à 2 000 tokens de réflexion avant la réponse de 600 tokens, ajoutant à elle seule ~25-50 $/1 000 appels. Désactiver la réflexion a de véritables modes d'échec (appels d'outils ou balises `<thinking>` qui fuient dans le texte visible, selon `shared/model-migration.md`), donc le levier le plus sûr est **`output_config.effort`** — démarrer Opus 5 à `medium` et n'augmenter que si l'évaluation montre des explications superficielles.
- **Haiku 4.5 a besoin d'un préfixe en cache d'au moins 4 096 tokens.** Selon le tableau des minimums par modèle de `shared/prompt-caching.md`, le plancher de Haiku 4.5 est de 4 096 tokens (le plus élevé de tous les modèles actuels ; Opus 5/Fable 5 n'ont besoin que de 512). Un prompt système d'arithmétique de base (persona + règles + une tranche d'âge + une langue) est probablement bien en dessous de ce seuil, ce qui signifie que **les appels Haiku pourraient ne jamais atteindre la mise en cache de prompt**, sauf si le préfixe est délibérément rembourré — à signaler au porteur du projet plutôt que de supposer que la mise en cache « fonctionne simplement » sur le palier le moins cher.
- **L'API Batch (50 % de réduction) convient à la pré-génération, pas au trafic en direct.** Une explication en session en direct ne peut pas être traitée par lot, mais pré-générer les N principales idées fausses connues par thème/âge/langue avant le lancement est exactement le cas d'usage de l'API Batch (jusqu'à 100 000 requêtes par lot, non sensible à la latence).

## L'architecture du prompt — squelette proposé, 5 langues, règles strictes

En s'écartant du motif « chaque ligne deux fois » de `prompts.ts`, construire **un prompt par (locale, tranche d'âge, palier)** ; l'anglais est présenté ici (FR/PT/DE/ES sont des rendus monolingues parallèles, pas des concaténations) :

```
You are Larry Profe, Larry the orange rhinoceros, teaching math to
[AGE_BAND] students. Same character as always — just teaching math now.

WHAT YOU RECEIVE: a JSON verdict from the grading engine (problem, student
steps, which were correct, where the error started, its classification).
You do NOT grade or recompute. Every number/step you reference MUST come
verbatim from that JSON.

WHAT YOU DO:
1. Say specifically what the student did right (not just "good job").
2. Explain what went wrong and why — the real misconception, not "wrong answer."
3. Walk through the correct process, like a patient professor, at a level a
   [AGE_BAND] student can follow.
4. End on encouragement, never on the mistake.

HARD RULES:
- Never call a student "bad at math," "slow," or any variant — mistakes are
  how math is learned.
- Never use sarcasm, exasperation, or a disappointed tone, even softened.
- Never invent or alter a number/step/verdict not in the provided JSON.
- Never compare the student to other students or a class average.
- Never skip "what you did right," even if everything was wrong — find
  something true and specific (effort, a correct partial step, right
  approach/wrong arithmetic).
- If asked something outside math tutoring, redirect kindly to a
  parent/teacher.

LANGUAGE: Reply only in [LOCALE_NAME]. Never mix languages or offer translation.
VOCABULARY: [age-band guidance — e.g. ages 6-8: concrete objects, no jargon;
ages 13+: precise terminology expected.]
```

Réserver les schémas d'outils `output_config.format` / `strict: true` pour le passage moteur-de-notation → Larry Profe (c'est le backend propre à Math Challenge qui valide ce JSON, pas Claude) — la sortie de ce prompt est de la prose diffusée en continu, pas des données structurées.

## Stratégie de mise en cache et de maîtrise des coûts

Deux couches indépendantes :

1. **La mise en cache de prompt de Claude** sur le préfixe stable (persona + règles + une langue + une tranche d'âge). Par modèle, par préfixe — les écritures coûtent 1,25× (TTL de 5 min) ou 2× (1 heure), les lectures ~0,1×. Un TTL d'1 heure avec préchauffage périodique (requêtes `max_tokens: 0`, selon `shared/prompt-caching.md`) convient au trafic en rafales des heures de devoirs. À ignorer pour Haiku, sauf si le préfixe dépasse 4 096 tokens (voir ci-dessus).
2. **Cache d'idées fausses au niveau applicatif (D1/KV)** — le mécanisme que le brief du porteur du projet demande réellement. Mettre en cache l'**explication générée entière**, indexée par `(sujet, classification de l'idée fausse, tranche d'âge, locale)` — et non l'instance exacte du problème, de sorte que différents problèmes de fractions présentant la même erreur « dénominateur commun oublié » tombent sur une seule entrée de cache. Reflète le motif de recherche statique existant `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), sauf qu'il est peuplé par la sortie de Claude au moment de la génération ; en cas d'échec du cache, retomber sur un appel en direct et peupler le cache, en reflétant le schéma IA-puis-gabarit de `contador/explain.ts`. Enregistrer `cache_hit: boolean` et les véritables `usage.input_tokens`/`usage.output_tokens` dans une table d'audit analogue à la migration `0011` — et non l'estimation `text.length/4` qu'utilise `audit.ts` aujourd'hui.
3. **L'API Batch pour l'amorçage à froid** — pré-générer les N principales idées fausses par thème avant le lancement à 50 % de réduction, convertissant la majeure partie du trafic initial en lectures de cache dès le premier jour.

## Implications pour la conception

1. Larry Profe est une **nouvelle intégration de l'API Claude** ; ne pas la faire transiter par la passerelle Workers AI d'IOS — le porteur du projet veut Claude, et l'ADR-006 décrit une architecture différente, d'abord Workers AI, pour un produit différent.
2. Modéliser le **moteur de notation comme source de vérité**, Claude n'étant que l'explicateur — suivre le schéma de `contador/explain.ts`, pas la boucle d'outils libre de `chat.ts`.
3. Abandonner le motif de prompt bilingue en ligne ; un prompt par locale, car 5 langues rendent la dérive inter-langues au sein d'un seul prompt à la fois coûteuse et sujette aux erreurs.
4. Prendre la locale comme un **paramètre explicite** venant du client (Math Challenge a déjà un paramètre de langue), plutôt que de l'inférer comme le fait `locale.ts` pour IOS.
5. Construire le routeur de palier de difficulté dans le backend de Math Challenge (à côté de la notation, qui connaît déjà le thème/le palier) — ne jamais laisser Claude choisir son propre palier de modèle.
6. Traiter `effort` comme un second axe de routage indépendant du choix du modèle ; commencer prudemment (`medium` sur Opus 5), car c'est le levier principal contre l'explosion du coût des tokens de réflexion.
7. Enregistrer les véritables champs `usage` de Claude dans le puits d'audit dès le premier jour, plutôt que de reproduire l'estimation par comptage de caractères de `audit.ts`.
8. Rédiger un canon de règles strictes de sécurité pour enfants, parallèle à la liste de cinq points de `docs/larry.md` §4.2, mais en partant de zéro — les règles d'IOS portent sur la sécurité des données, pas sur la sécurité émotionnelle.
9. Réutiliser `LarryAvatar` et sa machine à états sans les modifier, mais reconsidérer si `denying` devrait jamais se déclencher face à un enfant.
10. Garder le cache d'idées fausses et la mise en cache de prompt de Claude comme des **systèmes distincts** — ils résolvent des problèmes différents (éviter le renvoi du préfixe contre éviter de régénérer une sortie sémantiquement identique), et les confondre nuit à l'objectif « une seule génération, pas mille ».
11. Utiliser l'API Batch pour préamorcer le cache d'idées fausses avant le lancement, et pour combler rétroactivement les nouveaux types d'idées fausses découverts en production.
12. Chaque règle stricte et chaque ligne de prompt a besoin d'un texte EN/ES/FR/PT/DE revu par un humain — un ton qui se lit comme encourageant dans une langue peut atterrir comme condescendant dans une autre ; ne pas laisser cela à la traduction en temps d'exécution.

## Questions ouvertes pour le porteur du projet

1. Le routeur de palier de difficulté réside-t-il dans le backend de Math Challenge (le moteur de notation étiquette le thème/le palier), ou Larry Profe devrait-il reclassifier la difficulté à partir du texte du problème ?
2. Quelles sont les tranches d'âge réelles (K-2/3-5/6-8/9-12, ou par niveau scolaire) ? Cela détermine à la fois les variantes de vocabulaire et le nombre de combinaisons de prompts mises en cache à rédiger (locale × tranche d'âge × palier pourrait donner 5×4×3 = 60).
3. L'`effort` d'Opus 5 devrait-il être fixé par palier, ou réglable par thème au sein du palier « avancé » (une intégrale double et une preuve complète de calcul tensoriel ont plausiblement besoin d'efforts différents) ?
4. Existe-t-il un budget de latence au niveau du produit (par ex. « doit commencer le streaming en moins de 2 s ou afficher un état de chargement ») qui devrait conditionner le streaming par défaut selon le palier ?
5. Qui relit les règles strictes et le texte de prompt FR/PT/DE — un relecteur de contenu pédagogique multilingue, ou une traduction automatique comme premier brouillon à partir de la version EN/ES ?
6. Le cache d'idées fausses a-t-il besoin d'un TTL, ou est-il acceptable de servir indéfiniment une explication mise en cache pour une idée fausse rare ?
7. Le « ce que l'élève a fait de juste » doit-il toujours trouver quelque chose, même pour une réponse vide/devinée — et si oui, quel est le plancher honnête (par ex. « tu as essayé ») ?

## Sources

**Fichiers du dépôt (chemins cités ci-dessus) :**
- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (fichier entier)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (fichier entier — le précédent le plus proche)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

Tous les chemins sont relatifs à `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Faits sur l'API Claude (tirés de la compétence `claude-api`, mise en cache le 2026-06-24 ; pas de la mémoire d'entraînement) :**
- Identifiants de modèle/tarification : `claude-haiku-4-5` (1 $/5 $ par MTok), `claude-sonnet-5` (3 $/15 $, lancement 2 $/10 $ jusqu'au 2026-08-31), `claude-opus-5` (5 $/25 $) — tableau « Current Models » de la compétence.
- Économie de la mise en cache de prompt et préfixe minimum en cache par modèle (Haiku 4.5 = 4 096 tokens ; Opus 5 = 512) — `shared/prompt-caching.md`.
- API Batch (50 % de réduction, jusqu'à 100 000 requêtes par lot) — `python/claude-api/batches.md`.
- Réflexion adaptative activée par défaut sur Opus 5, `output_config.effort`, réflexion facturée comme sortie — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.
- Sorties structurées (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.
- Cibles de récupération de tarification en direct nommées par la compétence (`shared/live-sources.md`) : `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — non récupérées séparément lors de cette passe, car le tableau mis en cache de la compétence était à jour pour les modèles nécessaires.
