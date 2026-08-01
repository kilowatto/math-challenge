# Architecture Cloudflare pour Math Challenge

> Recherche Math Challenge — 2026-07-31 — sujet 32

## Résumé exécutif (FR)

Math Challenge est une PWA de pratique mathématique construite entièrement sur Cloudflare. L'architecture proposée utilise **Workers + Astro** pour le frontend/BFF, **D1** pour les données relationnelles (comptes, contenu, adhésions), des **Durable Objects avec stockage SQLite** pour l'état en direct à faible cardinalité (une ligue d'environ 30, une salle de classe, la session d'un enfant), **Analytics Engine** pour la télémétrie des tentatives à haut volume (pas D1 — D1 manque d'espace en premier), **KV** pour des instantanés de classement global/par niveau recalculés périodiquement, **R2** pour les médias et l'archive froide, **Queues + Workflows** pour la notation asynchrone et la génération d'explications par IA, **Vectorize + Workers AI** pour du RAG multilingue sur la banque d'indices, et **AI Gateway** devant l'API Claude pour mettre en cache, limiter le débit et plafonner les dépenses du tuteur « Larry » avec un routage de modèles. La limite que l'on atteindra en premier n'est pas le calcul : c'est le plafond de stockage de D1 (10 GB par base de données sur le plan payant) si quelqu'un tente d'y stocker chaque tentative — c'est pourquoi les tentatives brutes vont vers Analytics Engine, pas vers D1.

## Executive summary (EN)

Math Challenge is a PWA-first math practice app built entirely on Cloudflare. The proposed architecture uses **Workers + Astro** for the frontend/BFF, **D1** for relational data (accounts, content, memberships), **Durable Objects with SQLite storage** for low-cardinality live state (a league of ~30, a classroom, a child's session), **Analytics Engine** for high-volume attempt telemetry (not D1 — D1 runs out of storage first), **KV** for periodically-recomputed global/grade-band leaderboard snapshots, **R2** for media and cold archive, **Queues + Workflows** for async scoring and AI-explanation generation, **Vectorize + Workers AI** for multilingual RAG over the hint bank, and **AI Gateway** in front of the Claude API to cache, rate-limit, and spend-cap the "Larry" tutor with model routing. The limit we hit first is not compute — it is D1's storage ceiling (10 GB per database on the paid plan) if raw attempts are stored there. That is why raw attempts go to Analytics Engine, not D1.

## Correspondance produit-primitive

| Fonctionnalité | Primitive | Pourquoi | Limite réelle qui la contraint |
|---|---|---|---|
| Frontend + BFF, coque PWA | Workers (Astro via `@astrojs/cloudflare`, Static Assets) | Le monorepo fait déjà tourner Astro sur Workers ; la configuration automatique du framework existe pour Astro depuis décembre 2025 [22][23] | Limites CPU/requête des Workers — pas une contrainte à court terme |
| Comptes parent/enfant/enseignant, catalogue de contenu, adhésions | D1 | Relationnel, transactionnel, peu coûteux à cette échelle | 10 GB/base de données (payant), 500 MB (gratuit) ; 50 000 BD/compte, 1 TB/compte [2] |
| Télémétrie par tentative (dizaines de milliers d'utilisateurs × nombreuses tentatives/jour) | Analytics Engine | Conçu exactement pour cela : événements à forte cardinalité et à forte écriture, pas de modèle de facturation par ligne comme D1 | 20 blobs / 20 doubles / 1 index (96 B) par point, 250 points par invocation de Worker, rétention de 3 mois [13] |
| Classement en direct d'une ligue (~30) et d'une salle de classe | Durable Objects (stockage SQLite) | Un DO par ligue/salle de classe maintient un faible taux de requêtes par objet (~30 rédacteurs), le tri complet en mémoire de 30 lignes est trivial, l'hibernation WebSocket donne une diffusion quasi temps réel à un coût d'inactivité quasi nul | Plafond de débit souple d'environ 500 à 1 000 req/s par DO individuel — doit être fragmenté par ligue/salle de classe, jamais un DO global unique [7] |
| Classement global / par niveau | KV (instantané précalculé) + rollup par Workflow/Cron | La lecture KV est mise en cache en périphérie et peu coûteuse à l'échelle de la diffusion ; une vue triée globale n'a pas besoin d'une fraîcheur inférieure à la seconde | KV : 1 écriture/s par clé, `cacheTtl` minimum de 30 s — impossible d'écrire par tentative, doit être regroupé en lots [9][11][12] |
| Modèle d'apprenant adaptatif par enfant | Durable Object (SQLite) ou rollup D1, lu par le Worker au moment de la sélection des questions | Nécessite une lecture/écriture à faible latence colocalisée avec le calcul ; le DO donne une isolation par enfant | 10 GB de stockage par objet DO [8] |
| Banque de contenu (5 langues, milliers d'items) | D1 (métadonnées) + R2 (médias : images/audio) | D1 pour des lignes structurées et interrogeables ; R2 pour les gros actifs binaires, pas de frais de sortie | R2 n'a pas de langage de requête propre — à associer à un index D1 |
| Tuteur IA « Larry » (API Claude, routage de modèles) | Workers → AI Gateway → API Claude | AI Gateway offre la mise en cache, les limites de débit et les limites de dépenses par utilisateur devant l'appel au modèle | AI Gateway : maximum 20 règles de limite de dépenses par passerelle [Spend limits] |
| Inférence locale peu coûteuse : embeddings, TTS, traduction | Workers AI | Tourne sur le réseau de Cloudflare, pas d'aller-retour externe, tarification par modèle | Spécifique au modèle : p. ex. bge-m3 à $0,012/M tokens en entrée [17] |
| RAG sur la banque d'indices/explications | Vectorize (embeddings issus de bge-m3) | Le modèle d'embedding multilingue correspond à l'exigence des 5 langues | 10 M vecteurs/index, 1 536 dimensions max [16] |
| Notation asynchrone, génération d'explications par IA | Queues + Workflows | Découple la requête de soumission de tentative de la génération plus lente d'explications par IA ; les Workflows offrent des reprises durables | Queues : unité d'opération de 64 KB, 100 K opérations/jour gratuites [Queues pricing] ; Workflows : 500 K étapes incluses/mois [Workflows pricing] |
| Notifications push | Web Push (via un Worker envoyant les charges utiles) + service worker PWA | Pas un produit CF distinct — Workers n'est que l'expéditeur ; le navigateur/OS possède la livraison | Le Web Push iOS exige Safari 16.4+ installé sur l'écran d'accueil ; incohérent sur les Chromebooks/iPads gérés par l'école |
| Jeu hors ligne | Service worker PWA + Cache API + synchronisation en arrière-plan vers `math-challenge-ingest` | L'API Cache est propre à chaque Worker, pas partagée globalement | 512 MB d'objet mis en cache max, 1 000 appels d'API Cache/requête (payant) [20] |
| Défense anti-bot à l'inscription/connexion | Turnstile | Gratuit, WCAG 2.2 AA, modes non interactifs/invisibles adaptés aux enfants | Aucune limite de débit stricte trouvée dans la documentation consultée ; vérifier les limites du plan actuel avant le lancement |
| Analytique de site respectueuse de la vie privée | Web Analytics | RUM sans cookies, bascule d'exclusion UE | Rétention non échantillonnée de 7 jours, puis ~10 % d'échantillonnage [Web Analytics FAQ] |
| Contrôle des coûts sur les dépenses Claude | AI Gateway (facturation unifiée, limites de dépenses, routage/repli dynamique) | Un seul endroit pour voir et plafonner toute la surface de coût du tuteur | Plafond de 20 règles de limite de dépenses par passerelle |
| Hyperdrive | *(non utilisé)* | Pas de Postgres/MySQL externe dans cette conception — D1 est le système de référence | N/A |
| Images/Stream | *(non utilisé au lancement)* | Le contenu est constitué d'illustrations + audio court, bien servi directement depuis R2 ; à revoir si des leçons vidéo sont ajoutées | N/A |

## Résultats — notes par service

**D1.** Limites du plan payant : 10 GB par base de données, 50 000 bases de données par compte, 1 TB de stockage total par compte, durée maximale de requête de 30 secondes, instruction SQL maximale de 100 KB, ligne/BLOB maximale de 2 MB, 6 connexions simultanées par Worker, 1 000 requêtes par invocation de Worker [2]. Tarification : 25 milliards de lignes lues incluses/mois puis $0,001/million ; 50 millions de lignes écrites incluses puis $1,00/million ; stockage à $0,75/GB-mois au-delà des 5 GB inclus [1]. La **réplication en lecture** est en bêta publique via l'API Sessions, utilisant des signets pour la cohérence séquentielle (« lire ses propres écritures », lectures monotones) ; Cloudflare crée automatiquement une réplique par région prise en charge (ENAM, WNAM, WEUR, EEUR, APAC, OC) sans coût supplémentaire — la facturation reste inchangée [3][4]. Le décalage de réplique est illimité dans le pire des cas, donc tout flux « voici ton nouveau score » doit s'ancrer sur le signet de la session d'écriture, pas sur une lecture non contrainte.

**Durable Objects.** Le stockage SQLite est disponible en GA à 10 GB par objet [8] ; un plafond de débit souple d'environ 500 à 1 000 requêtes par seconde s'applique **par objet**, pas par espace de noms — les propres directives de Cloudflare qualifient un seul DO « global » d'anti-pattern et exigent un fragmentement selon une frontière naturelle (par salle, par utilisateur, par ligue) [7]. Calcul (payant) : 1 M de requêtes/mois incluses puis $0,15/million ; 400 000 GB-secondes incluses puis $12,50/million de GB-s [1]. La facturation du stockage pour les DO à stockage SQLite (les lignes reflètent les tarifs de D1 ; stockage à $0,20/GB-mois) a commencé le 7 janvier 2026 — assez récent pour que les anciens modèles de coûts le sous-estiment [1][9].

**Workers KV.** Payant : 10 M de lectures/mois incluses puis $0,50/million ; 1 M d'écritures/suppressions/listages inclus puis $5,00/million ; 1 GB de stockage inclus puis $0,50/GB-mois [Workers pricing]. Cohérence à terme : les écritures se propagent dans le monde entier en 60 secondes ou selon le `cacheTtl` défini — le `cacheTtl` minimum a été réduit à 30 secondes en 2026 [12]. **Une seule écriture par clé et par seconde** est autorisée ; au-delà, cela déclenche des erreurs 429 [11]. Des lectures en masse (100 clés) et des écritures en masse (10 000 paires, ≤100 MB) existent via l'API REST [10][11]. Cela rend KV inadapté aux mises à jour par tentative et adapté aux instantanés rafraîchis périodiquement.

**Analytics Engine.** `writeDataPoint()` accepte jusqu'à 20 blobs, 20 doubles, 1 index (≤96 octets) ; une invocation de Worker peut écrire au maximum 250 points de données ; la charge utile d'un blob est plafonnée à 16 KB/point ; la rétention est de trois mois [13]. Aucun prix distinct par écriture n'a été trouvé dans la documentation consultée — à traiter comme intégré au plan Workers et à reconfirmer avant de s'engager sur un budget de volume ; c'est le seul chiffre que ce rapport n'a pas pu sourcer avec certitude.

**Queues.** Une « opération » est facturée par tranche de 64 KB lue/écrite/supprimée ; livrer un message coûte typiquement 3 opérations. Gratuit : 10 000 opérations/jour. Payant : 1 M d'opérations/mois incluses puis $0,40/million. La rétention est de 4 jours par défaut, configurable jusqu'à 14 jours [Queues pricing].

**Workflows.** Les requêtes et le temps CPU partagent les pools Workers (10 M de requêtes + $0,30/million au-delà ; 30 M de CPU-ms + $0,02/million au-delà) ; stockage 1 GB + $0,20/GB-mois ; étapes 500 000/mois incluses + $0,80 par 100 000 supplémentaires [Workflows pricing]. La facturation des étapes/du stockage n'avait pas commencé à la date du journal des modifications cité — confirmer la date de début avant de finaliser les modèles de coûts.

**R2.** Stockage à $0,015/GB-mois ; classe A (type écriture) $4,50/million ; classe B (type lecture) $0,36/million ; sortie gratuite. Plan gratuit : 10 GB-mois de stockage, 1 M classe A, 10 M classe B/mois [R2 pricing]. L'absence de frais de sortie compte pour l'archive froide : les exports en lot/extractions d'entraînement ne coûtent rien à la lecture.

**Vectorize.** Les index prennent désormais en charge jusqu'à 10 M de vecteurs (relevé de 5 M le 2026-01-23), plafonnés à 1 536 dimensions/vecteur [16]. Tarification : 50 M de dimensions interrogées incluses/mois puis $0,01/million ; 10 M de dimensions stockées incluses puis $0,05/100 millions [1].

**Workers AI.** Prix représentatifs : `@cf/baai/bge-m3` (embeddings multilingues, correspond à la banque des 5 langues) à $0,012/M tokens en entrée ; `@cf/myshell-ai/melotts` (TTS) à $0,0002/minute audio ; `@cf/meta/m2m100-1.2b` (traduction) à $0,342/M tokens entrée/sortie [17] — assez peu coûteux pour tourner au moment de la rédaction du contenu, pas par requête.

**AI Gateway.** La mise en cache s'applique uniquement aux requêtes texte/image identiques, pas de cache sémantique [Caching doc]. Les limites de dépenses sont des budgets fondés sur le coût, portés par modèle/fournisseur/métadonnée personnalisée (par ex. par enfant, par jour), plafonnées à 20 règles par passerelle [Spend limits doc]. Le routage dynamique peut basculer automatiquement vers un modèle moins coûteux quand un budget est atteint plutôt que de bloquer purement et simplement la requête.

**Turnstile.** Gratuit, WCAG 2.2 AA, propose des modes non interactifs et entièrement invisibles adaptés à un flux d'inscription pour enfants. Aucune limite stricte de volume de requêtes n'est apparue dans les pages consultées ; confirmer les limites du plan actuel avant le lancement.

**Web Analytics.** Gratuit, RUM sans cookies. Les données de balise non échantillonnées sont conservées 7 jours puis agrégées à environ 10 % d'échantillonnage ; les visiteurs de l'UE peuvent être exclus en un clic [Web Analytics FAQ].

**Cache API.** Cache propre à chaque centre de données, propre à chaque Worker, distinct du cache de zone. Objet maximal de 512 MB ; 1 000 appels `put()`/`match()`/`delete()` par requête en payant (50 en gratuit), partageant le quota de sous-requêtes [20].

**API Claude / routage de modèles.** Tarification actuelle (issue de la compétence groupée `claude-api`, mise en cache le 2026-06-24) : Opus 5 à $5/$25 par million de tokens entrée/sortie ; Sonnet 5 à $3/$15 (tarif de lancement $2/$10 jusqu'au 2026-08-31) ; Haiku 4.5 à $1/$5. Le plan de routage de Larry : Sonnet 5 comme explicateur par défaut, Haiku 4.5 pour les micro-textes à haut volume et peu coûteux, et une rare escalade de niveau Opus uniquement pour les explications multi-étapes les plus difficiles — le tout plafonné par les limites de dépenses d'AI Gateway par enfant et par jour.

## Inventaire des ressources proposées

Chaque objet est préfixé par `math-challenge-` comme requis. Les noms de binding utilisent `UPPER_SNAKE_CASE`.

| Nom | Type | Objectif (EN) | Objectif (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Public PWA frontend + BFF routes | Frontend PWA público + rutas BFF | n/a (entry Worker) |
| `math-challenge-ingest` | Worker | Validates and ingests attempt submissions; writes telemetry, enqueues scoring | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | n/a |
| `math-challenge-tutor` | Worker | Hosts "Larry" AI tutor; calls Claude via AI Gateway with RAG | Aloja al tutor de IA "Larry"; llama a Claude vía AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Triggers the periodic leaderboard rollup Workflow | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | System of record: users, children, classrooms, leagues, content metadata, consent | Registro maestro: usuarios, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Live state + WebSocket broadcast for one league of ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Live state for one classroom's roster and in-class standings | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-learner-do` | Durable Object class (SQLite) | Per-child adaptive learner model (mastery estimates, item selection state) | Modelo de aprendizaje adaptativo por niño | `LEARNER_DO` |
| `math-challenge-ratelimiter-do` | Durable Object class (SQLite) | Sharded rate limiting (login attempts, tutor calls, signup) | Limitación de tasa fragmentada (inicios de sesión, llamadas al tutor, registro) | `RATE_LIMITER_DO` |
| `math-challenge-leaderboard-kv` | KV namespace | Precomputed global/grade-band leaderboard snapshots | Instantáneas precalculadas del leaderboard global/por-grado | `LEADERBOARD_KV` |
| `math-challenge-config-kv` | KV namespace | Feature flags and content-catalog cache | Feature flags y caché del catálogo de contenido | `CONFIG_KV` |
| `math-challenge-session-kv` | KV namespace | Short-lived auth/session tokens | Tokens de sesión/autenticación de corta duración | `SESSION_KV` |
| `math-challenge-media` | R2 bucket | Item images, audio, illustrations | Imágenes, audio e ilustraciones de los reactivos | `MEDIA_BUCKET` |
| `math-challenge-exports` | R2 bucket | Cold archive of aged-out attempts; COPPA/GDPR data-subject exports | Archivo frío de intentos vencidos; exportaciones para solicitudes COPPA/GDPR | `EXPORTS_BUCKET` |
| `math-challenge-scoring-queue` | Queue | Async scoring + learner-model update jobs | Trabajos asíncronos de calificación y actualización del modelo de aprendizaje | `SCORING_QUEUE` |
| `math-challenge-scoring-dlq` | Queue (dead-letter) | Failed scoring jobs after max retries | Trabajos de calificación fallidos tras reintentos máximos | `SCORING_DLQ` |
| `math-challenge-ai-explain-queue` | Queue | Async AI-explanation generation requests | Solicitudes asíncronas de generación de explicaciones de IA | `AI_EXPLAIN_QUEUE` |
| `math-challenge-ai-explain-dlq` | Queue (dead-letter) | Failed explanation jobs after max retries | Trabajos de explicación fallidos tras reintentos máximos | `AI_EXPLAIN_DLQ` |
| `math-challenge-leaderboard-rollup-workflow` | Workflow | Periodic global/grade-band leaderboard computation | Cálculo periódico del leaderboard global/por-grado | `LEADERBOARD_WORKFLOW` |
| `math-challenge-onboarding-workflow` | Workflow | Multi-step account + child-profile + consent setup | Configuración multi-paso de cuenta + perfil de niño + consentimiento | `ONBOARDING_WORKFLOW` |
| `math-challenge-explanations-index` | Vectorize index | Multilingual RAG index over curated hints/explanations | Índice RAG multilingüe sobre pistas/explicaciones curadas | `EXPLANATIONS_INDEX` |
| `math-challenge-tutor-gateway` | AI Gateway | Caching, rate limits, spend limits, model routing for Claude calls | Caché, límites de tasa, límites de gasto y enrutamiento de modelos para Claude | (gateway ID in `ANTHROPIC_BASE_URL`) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Per-attempt telemetry (high-cardinality, high-volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Tutor usage/cost telemetry (per-child, per-model) | Telemetría de uso/costo del tutor (por niño, por modelo) | `TUTOR_AE` |
| `math-challenge-turnstile-signup` | Turnstile widget | Bot defense on signup/login forms | Defensa contra bots en formularios de registro/inicio de sesión | (site key/secret via env) |
| `math-challenge-web-analytics` | Web Analytics site | Privacy-first RUM for the PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Holds `ANTHROPIC_API_KEY` and other third-party credentials | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |

## Conception du classement

**Chemin d'écriture.** Un client soumet une tentative à `math-challenge-ingest`. Le Worker : (1) écrit un point de données Analytics Engine (télémétrie brute — pas une écriture de ligne D1), (2) appelle en RPC le `math-challenge-learner-do` de l'enfant pour mettre à jour l'état de maîtrise, (3) appelle en RPC le `math-challenge-league-do` et/ou `math-challenge-classroom-do` pertinent avec le delta de score. Chaque DO de ligue/salle de classe conserve les scores de ses ≤30 membres dans sa propre table SQLite ; à chaque mise à jour, il retrie ces ≤30 lignes en mémoire (trivial) et pousse le nouveau classement aux clients connectés via un WebSocket hibernable. C'est ce qui rend le classement de ligue/salle de classe « quasi temps réel » sans primitive d'ensemble trié globale, que Cloudflare ne fournit pas nativement.

**Les classements globaux et par niveau suivent un chemin différent.** Un Worker déclenché par Cron (`math-challenge-leaderboard-cron`) déclenche `math-challenge-leaderboard-rollup-workflow` toutes les 30 à 60 secondes. Le Workflow agrège les totaux (une table de rollup D1 rafraîchie depuis du SQL Analytics Engine, ou des écritures D1 par lots), calcule le top N par niveau et globalement, et écrit des blobs JSON dans `math-challenge-leaderboard-kv`. Les lectures deviennent alors de simples appels `get()` KV — peu coûteux, distribués en périphérie, et explicitement **pas** en temps réel (obsolescence de conception de 30 à 60 s), ce qui évite entièrement la limite d'1 écriture/seconde/clé de KV.

**Coût pour 1 000 000 de tentatives (ordre de grandeur approximatif, plan payant) :** requêtes d'ingestion Workers, ~1 M, dans/juste au-delà du palier inclus de 10 M/mois (≤$0,30). Écritures Analytics Engine, 1 M d'appels `writeDataPoint()` — aucun prix mesuré trouvé dans la documentation actuelle ; à reconfirmer avant de passer à l'échelle. Requêtes Durable Object (DO ligue/salle de classe + apprenant, ~2 appels/tentative), ~2 M, ≈$0,15–$0,30. Lignes SQLite Durable Object écrites, 1 à 2 M, dans le palier inclus de 50 M/mois à un coût marginal de $0. Les écritures de rollup D1 sont regroupées toutes les 30 à 60 s, donc le coût n'évolue pas avec le nombre de tentatives. Les écritures KV se produisent une fois par clé et par cycle de rollup, pas par tentative.

**Net :** environ **$0,50 à $1,00 par million de tentatives** en coût direct de primitives, dominé par la tarification des requêtes Workers/DO plutôt que par un stockage propre au classement — parce que les écritures par tentative sont délibérément tenues à l'écart de D1 et de KV.

## Esquisse du modèle de données (D1)

```sql
-- Accounts
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('parent','teacher','admin')),
  email TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at INTEGER NOT NULL
);

-- Children never get a direct login credential of their own kind that
-- collects full DOB; only a birth-year bucket, per COPPA minimization.
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  birth_year_bucket INTEGER,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_children_parent ON children(parent_user_id);

CREATE TABLE classrooms (
  id TEXT PRIMARY KEY,
  teacher_user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE classroom_members (
  classroom_id TEXT NOT NULL REFERENCES classrooms(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (classroom_id, child_id)
);
CREATE INDEX idx_classroom_members_child ON classroom_members(child_id);

CREATE TABLE leagues (
  id TEXT PRIMARY KEY,
  grade_band TEXT NOT NULL,
  season_id TEXT NOT NULL,
  size_cap INTEGER NOT NULL DEFAULT 30,
  created_at INTEGER NOT NULL
);

CREATE TABLE league_members (
  league_id TEXT NOT NULL REFERENCES leagues(id),
  child_id TEXT NOT NULL REFERENCES children(id),
  joined_at INTEGER NOT NULL,
  PRIMARY KEY (league_id, child_id)
);
CREATE INDEX idx_league_members_child ON league_members(child_id);

-- Content bank
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  skill_tag TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  media_key TEXT,          -- R2 key in math-challenge-media
  version INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_content_items_skill ON content_items(subject, skill_tag, difficulty);

CREATE TABLE item_translations (
  item_id TEXT NOT NULL REFERENCES content_items(id),
  language TEXT NOT NULL,   -- one of the 5 supported languages
  prompt_text TEXT NOT NULL,
  choices_json TEXT,
  PRIMARY KEY (item_id, language)
);

-- Rollups (NOT raw attempts — those live in Analytics Engine)
CREATE TABLE score_totals (
  child_id TEXT NOT NULL REFERENCES children(id),
  period TEXT NOT NULL,     -- 'all_time' | 'season:<season_id>'
  total_score INTEGER NOT NULL DEFAULT 0,
  grade_band TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (child_id, period)
);
CREATE INDEX idx_score_totals_rank ON score_totals(period, grade_band, total_score DESC);

CREATE TABLE push_subscriptions (
  id TEXT PRIMARY KEY,
  child_id TEXT REFERENCES children(id),
  endpoint TEXT NOT NULL,
  keys_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE consent_records (
  id TEXT PRIMARY KEY,
  parent_user_id TEXT NOT NULL REFERENCES users(id),
  child_id TEXT REFERENCES children(id),
  consent_type TEXT NOT NULL,
  granted_at INTEGER NOT NULL,
  ip_hash TEXT
);
```

Les lignes brutes par tentative sont **délibérément absentes** de ce schéma — elles vivent dans `math-challenge-attempts-ae` (Analytics Engine) et, pour tout ce qui dépasse sa rétention de 3 mois, dans `math-challenge-exports` (R2, via un job d'export périodique en Pipeline ou en Worker).

## Implications de conception / risques

1. **Le plafond de 10 GB/base de données de D1 est le premier mur dur**, atteint par une erreur de conception (stocker les tentatives brutes dans D1), pas par la croissance du trafic — la mitigation Analytics Engine doit être présente dès le premier commit, pas ajoutée après coup [2].
2. **Un seul DO « global » est un anti-pattern** — un DO gérant tout le trafic devient un goulot d'étranglement à ~500-1 000 req/s ; les ligues et salles de classe doivent être fragmentées en un DO par entité dès le premier jour [7].
3. **La propagation dans le pire des cas de 60 secondes de KV et le `cacheTtl` minimum de 30 secondes** font que le classement global/par niveau n'est jamais réellement en direct — cela doit apparaître dans l'interface (« mis à jour il y a une minute ») pour que les enfants ne croient pas que des points gagnés ont disparu [11][12].
4. **La limite d'1 écriture par seconde et par clé de KV** fait échouer toute conception « incrémenter à chaque tentative » sous une charge en rafale — la conception par rollup via Workflow écrit plutôt à une cadence fixe.
5. **La mise en cache d'AI Gateway ne doit pas être appliquée uniformément** — mettre en cache une passerelle d'embeddings renvoie silencieusement des vecteurs obsolètes, donc le tuteur et les appels d'embedding RAG ont besoin d'une configuration de mise en cache de passerelle séparée s'ils partagent un jour une même passerelle.
6. **La réplication en lecture de D1 n'est que séquentiellement cohérente, avec un décalage illimité dans le pire des cas** — un flux « voir son propre score immédiatement après l'envoi » doit utiliser le signet de l'API Sessions, pas une lecture non contrainte [3].
7. **L'effacement COPPA/GDPR-K est un problème de suppression sur quatre systèmes** : lignes D1, stockage SQLite des DO, Analytics Engine (le TTL de 3 mois aide mais n'efface pas à la demande), et Vectorize (évité ici en limitant Vectorize au contenu curé uniquement). Les procédures de suppression doivent énumérer les quatre.
8. **Vectorize doit rester limité à la banque de contenu/indices curée**, pas à des embeddings par enfant — le plafond de 10 M de vecteurs est réel à l'échelle, et les vecteurs par enfant sont un risque pour la vie privée sans scénario de suppression propre [16].
9. **La facturation du stockage SQLite des DO a commencé le 7 janvier 2026** — assez récent pour que les anciens modèles de coûts la sous-estiment ; revérifier la page de tarification actuelle avant un plan de capacité [9].
10. **Turnstile avec de jeunes utilisateurs, éventuellement non lecteurs, n'a pas été testé ici** — la tranche d'âge la plus jeune a probablement besoin d'une connexion entièrement médiée par le parent, contournant l'UX de défense anti-bot pour les enfants.
11. **Web Push est incohérent sur les appareils gérés par l'école** — iOS nécessite une PWA installée sur l'écran d'accueil sous Safari 16.4+, et les Chromebooks/iPads gérés par MDM bloquent souvent les invites d'installation ; un repli sans push (digest par e-mail au parent) est nécessaire pour la portée.
12. **Toute requête sur `score_totals` sans l'index composite finira par atteindre le mode d'échec de temps CPU de D1** à mesure que la table grandit — vérifier avec `EXPLAIN QUERY PLAN` avant la mise en production, pas après un incident [5].
13. **Le prix d'écriture d'Analytics Engine n'a pas pu être confirmé dans la documentation actuelle** — l'estimation de coût par million de tentatives suppose qu'il est inclus dans le plan Workers ; à vérifier par rapport à la page de tarification en ligne avant qu'il n'entre dans un budget.

## Questions ouvertes pour le propriétaire du projet

1. Quelles tranches d'âge/niveaux scolaires exactes sont dans le périmètre (K–2, 3–5, 6–8, 9–12, adulte) ? Cela détermine le partitionnement du classement par niveau et le contrôle d'âge COPPA (moins de 13 ans vs. 13 ans et plus).
2. Une rétention Analytics Engine de 3 mois est-elle acceptable pour l'historique brut des tentatives, ou un rapport de progrès d'une année sur l'autre exige-t-il dès le premier jour le chemin d'archive froide R2+Pipelines ?
3. Quelle rafale simultanée dans le pire des cas doit-on concevoir (par exemple tout un district dans le même créneau de classe) ? Cela dimensionne la granularité de fragmentation des DO.
4. Le « temps réel » pour les classements de ligue est-il une exigence dure de WebSocket inférieure à la seconde, ou un rafraîchissement de quelques secondes est-il acceptable ?
5. Un palier de tuteur IA sans plafond devrait-il jamais exister, ou un plafond strict de dépenses Claude par enfant et par jour est-il toujours en vigueur ?
6. Quelles sont exactement les 5 langues ? Cela détermine si `m2m100` de Workers AI couvre toutes les paires ou si certaines ont besoin d'une traduction humaine/de qualité Claude pour le lancement.
7. Les ligues sont-elles auto-assignées (cohortes aléatoires) ou organisées par l'enseignant/le parent ? Cela affecte le Workflow de cycle de vie de la ligue et si `math-challenge-league-do` a besoin d'une étape d'appariement.
8. Quelle est la règle de résolution des conflits pour la synchronisation de la progression PWA hors ligne entre deux appareils ?
9. Quelle approche d'identité est préférée pour les comptes parent — lien magique, clés d'accès (passkeys), ou fédération ? Cela affecte où se situe Turnstile et la forme de la table `users`.
10. Quel est le plafond de dépenses mensuelles cible pour AI Gateway ? Nécessaire pour dimensionner les 20 règles de limite de dépenses et la politique de modèle de repli en amont.

## Sources

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — D1, KV, Vectorize, Queues, Workers, Durable Objects pricing tables. Accessed 2026-07-31.
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — database size, storage, query and connection limits.
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — consistency model, supported regions.
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — CPU-time and overload failure modes.
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — compute and SQLite storage billing.
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — per-object throughput guidance, anti-patterns.
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB per object.
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, billing start date.
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — bulk reads, `cacheTtl`.
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — 1 write/sec/key limit, bulk write limits.
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — blobs/doubles/index/retention limits.
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — storage, Class A/B operations, egress.
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — per-model pricing (bge-m3, melotts, m2m100).
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — budget rules, dynamic-route fallback, 20-rule ceiling.
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — cache scope and identical-request matching.
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — Cache API limits, request/response limits.
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — sampling and retention behavior.
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — full-stack deployment model relevant to Astro on Workers.
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirms Astro as a supported framework.
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — requests, CPU time, storage, steps.
24. Anthropic `claude-api` skill, cached model/pricing table (2026-06-24) — Claude Opus 5 / Sonnet 5 / Haiku 4.5 pricing used for the model-routing plan.
