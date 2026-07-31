# Cloudflare Architecture for Math Challenge

> Math Challenge research — 2026-07-31 — topic 32

## Resumen ejecutivo (ES)

Math Challenge es una PWA de práctica matemática construida enteramente sobre Cloudflare. La arquitectura propuesta usa **Workers + Astro** para el frontend/BFF, **D1** para datos relacionales (cuentas, contenido, membresías), **Durable Objects con almacenamiento SQLite** para estado en vivo de bajo cardinal (una liga de ~30, un salón, la sesión de un niño), **Analytics Engine** para telemetría de intentos de alto volumen (no D1 — D1 se queda sin espacio primero), **KV** para instantáneas de leaderboard global/por-grado recalculadas periódicamente, **R2** para medios y archivo frío, **Queues + Workflows** para calificación asíncrona y generación de explicaciones de IA, **Vectorize + Workers AI** para RAG multilingüe sobre el banco de pistas, y **AI Gateway** delante de la API de Claude para cachear, limitar tasa y poner tope de gasto al tutor "Larry" con enrutamiento de modelos. El límite que golpearemos primero no es cómputo: es el techo de almacenamiento de D1 (10 GB por base de datos en el plan de pago) si alguien intenta guardar cada intento ahí — por eso los intentos crudos van a Analytics Engine, no a D1.

## Executive summary (EN)

Math Challenge is a PWA-first math practice app built entirely on Cloudflare. The proposed architecture uses **Workers + Astro** for the frontend/BFF, **D1** for relational data (accounts, content, memberships), **Durable Objects with SQLite storage** for low-cardinality live state (a league of ~30, a classroom, a child's session), **Analytics Engine** for high-volume attempt telemetry (not D1 — D1 runs out of storage first), **KV** for periodically-recomputed global/grade-band leaderboard snapshots, **R2** for media and cold archive, **Queues + Workflows** for async scoring and AI-explanation generation, **Vectorize + Workers AI** for multilingual RAG over the hint bank, and **AI Gateway** in front of the Claude API to cache, rate-limit, and spend-cap the "Larry" tutor with model routing. The limit we hit first is not compute — it is D1's storage ceiling (10 GB per database on the paid plan) if raw attempts are stored there. That is why raw attempts go to Analytics Engine, not D1.

## Product-to-primitive mapping

| Feature | Primitive | Why | Real limit that constrains it |
|---|---|---|---|
| Frontend + BFF, PWA shell | Workers (Astro via `@astrojs/cloudflare`, Static Assets) | Monorepo already runs Astro on Workers; framework auto-config exists for Astro since Dec 2025 [22][23] | Workers CPU/request limits — not a near-term constraint |
| Parent/child/teacher accounts, content catalog, memberships | D1 | Relational, transactional, cheap at this scale | 10 GB/database (paid), 500 MB (free); 50,000 DBs/account, 1 TB/account [2] |
| Per-attempt telemetry (tens of thousands of users × many attempts/day) | Analytics Engine | Built for exactly this: high-cardinality write-heavy events, no per-row storage billing model like D1 | 20 blobs / 20 doubles / 1 index (96 B) per point, 250 points per Worker invocation, 3-month retention [13] |
| Live league (~30) and classroom standings | Durable Objects (SQLite storage) | One DO per league/classroom keeps request rate per object low (~30 writers), full in-memory sort of 30 rows is trivial, WebSocket hibernation gives near-real-time push at near-zero idle cost | Soft throughput ceiling ~500–1,000 req/s per individual DO — must shard by league/classroom, never one global DO [7] |
| Global / grade-band leaderboard | KV (precomputed snapshot) + Workflow/Cron rollup | KV read is edge-cached and cheap at fan-out scale; a global sorted view doesn't need sub-second freshness | KV: 1 write/sec per key, min `cacheTtl` 30 s — cannot write per-attempt, must batch [9][11][12] |
| Adaptive learner model per child | Durable Object (SQLite) or D1 rollup, read by Worker at question-selection time | Needs low-latency read/write colocated with compute; DO gives per-child isolation | 10 GB storage per DO object [8] |
| Content bank (5 languages, thousands of items) | D1 (metadata) + R2 (media assets: images/audio) | D1 for structured queryable rows; R2 for large binary assets, no egress fee | R2 has no query language of its own — pair with D1 index |
| AI tutor "Larry" (Claude API, model routing) | Workers → AI Gateway → Claude API | AI Gateway gives caching, rate limits, and per-user spend limits in front of the model call | AI Gateway: max 20 spend-limit rules/gateway [Spend limits] |
| Cheap local inference: embeddings, TTS, translation | Workers AI | Runs on Cloudflare's network, no external round-trip, per-model pricing | Model-specific: e.g. bge-m3 $0.012/M input tokens [17] |
| RAG over hint/explanation bank | Vectorize (embeddings from bge-m3) | Multilingual embedding model matches the 5-language requirement | 10M vectors/index, 1,536 dims max [16] |
| Async scoring, AI explanation generation | Queues + Workflows | Decouples the attempt-submission request from slower AI-explanation generation; Workflows give durable retries | Queues: 64 KB operation unit, 100 K ops/day free [Queues pricing]; Workflows: 500K steps included/month [Workflows pricing] |
| Push notifications | Web Push (via a Worker sending payloads) + PWA service worker | Not a distinct CF product — Workers is just the sender; browser/OS owns delivery | iOS Web Push requires installed-to-homescreen Safari 16.4+; inconsistent on school-managed Chromebooks/iPads |
| Offline play | PWA service worker + Cache API + background sync to `math-challenge-ingest` | Cache API is per-Worker, not shared globally | 512 MB max cached object, 1,000 Cache API calls/request (paid) [20] |
| Bot defense on signup/login | Turnstile | Free, WCAG 2.2 AA, non-interactive/invisible modes suit children | No hard rate limit found in fetched docs; verify current plan limits before launch |
| Privacy-respecting site analytics | Web Analytics | Cookie-free RUM, EU-exclusion toggle | 7-day unsampled retention, then ~10% sampling [Web Analytics FAQ] |
| Cost control on Claude spend | AI Gateway (Unified Billing, spend limits, dynamic routing/fallback) | One place to see and cap the whole tutor cost surface | 20 spend-limit rules/gateway ceiling |
| Hyperdrive | *(not used)* | No external Postgres/MySQL in this design — D1 is the system of record | N/A |
| Images/Stream | *(not used at launch)* | Content is illustrations + short audio, served fine from R2 directly; revisit if video lessons are added | N/A |

## Findings — per-service notes

**D1.** Paid-plan limits: 10 GB per database, 50,000 databases per account, 1 TB total account storage, 30-second max query duration, 100 KB max SQL statement, 2 MB max row/BLOB, 6 simultaneous connections per Worker, 1,000 queries per Worker invocation [2]. Pricing: 25 billion rows read included/month then $0.001/million; 50 million rows written included then $1.00/million; storage $0.75/GB-month beyond the 5 GB included [1]. **Read replication** is public beta via the Sessions API, using bookmarks for sequential consistency ("read your own writes," monotonic reads); Cloudflare auto-creates one replica per supported region (ENAM, WNAM, WEUR, EEUR, APAC, OC) at no extra cost — billing is unchanged [3][4]. Replica lag is unbounded worst-case, so any "here's your new score" flow must pin to the writing session's bookmark, not an unconstrained read.

**Durable Objects.** SQLite storage is GA at 10 GB per object [8]; a soft throughput ceiling of roughly 500–1,000 requests/second applies **per object**, not per namespace — Cloudflare's own guidance calls a single "global" DO an anti-pattern and requires sharding by natural boundary (per room, per user, per league) [7]. Compute (paid): 1M requests/month included then $0.15/million; 400,000 GB-seconds included then $12.50/million GB-s [1]. Storage billing for SQLite-backed DOs (rows mirror D1's rates; storage $0.20/GB-month) began January 7, 2026 — recent enough that older cost models will understate it [1][9].

**Workers KV.** Paid: 10M reads/month included then $0.50/million; 1M writes/deletes/lists included then $5.00/million; 1 GB storage included then $0.50/GB-month [Workers pricing]. Eventually consistent: writes propagate within 60 seconds worldwide, or the `cacheTtl` you set — minimum `cacheTtl` was reduced to 30 seconds in 2026 [12]. **Only one write per key per second** is allowed; more triggers 429s [11]. Bulk reads (100 keys) and bulk writes (10,000 pairs, ≤100 MB) exist via the REST API [10][11]. This makes KV wrong for per-attempt updates and right for periodically-refreshed snapshots.

**Analytics Engine.** `writeDataPoint()` accepts up to 20 blobs, 20 doubles, 1 index (≤96 bytes); a Worker invocation can write at most 250 data points; blob payload is capped at 16 KB/point; retention is three months [13]. No separate per-write price was found in the fetched docs — treat it as bundled into the Workers plan and reconfirm before committing to a volume budget; it is the one figure this report could not source with certainty.

**Queues.** An "operation" bills per 64 KB chunk read/written/deleted; delivering one message typically costs 3 operations. Free: 10,000 ops/day. Paid: 1M ops/month included then $0.40/million. Retention is 4 days default, up to 14 configurable [Queues pricing].

**Workflows.** Requests and CPU time share the Workers pools (10M requests + $0.30/million beyond; 30M CPU-ms + $0.02/million beyond); storage 1 GB + $0.20/GB-month; steps 500,000/month included + $0.80/additional 100,000 [Workflows pricing]. Steps/storage billing had not started as of the cited changelog — confirm the start date before finalizing cost models.

**R2.** Storage $0.015/GB-month; Class A (write-like) $4.50/million; Class B (read-like) $0.36/million; egress free. Free tier: 10 GB-month storage, 1M Class A, 10M Class B/month [R2 pricing]. No egress fee matters for cold archive: batch export/training pulls cost nothing to read out.

**Vectorize.** Indexes now support up to 10M vectors (raised from 5M on 2026-01-23), capped at 1,536 dimensions/vector [16]. Pricing: 50M queried dimensions included/month then $0.01/million; 10M stored dimensions included then $0.05/100 million [1].

**Workers AI.** Representative prices: `@cf/baai/bge-m3` (multilingual embeddings, matches the 5-language bank) $0.012/M input tokens; `@cf/myshell-ai/melotts` (TTS) $0.0002/audio minute; `@cf/meta/m2m100-1.2b` (translation) $0.342/M tokens in/out [17] — cheap enough to run at content-authoring time, not per request.

**AI Gateway.** Caching applies to identical text/image requests only, no semantic cache [Caching doc]. Spend limits are cost-based budgets scoped by model/provider/custom metadata (e.g. per-child, per-day), capped at 20 rules per gateway [Spend limits doc]. Dynamic routing can fall back to a cheaper model automatically when a budget is hit rather than hard-blocking the request.

**Turnstile.** Free, WCAG 2.2 AA, offers non-interactive and fully invisible modes suited to a children's signup flow. No hard request-volume limit surfaced in the fetched pages; confirm current plan limits before launch.

**Web Analytics.** Free, cookie-free RUM. Unsampled beacon data is retained 7 days then aggregated to ~10% sampling; EU visitors can be excluded in one click [Web Analytics FAQ].

**Cache API.** Per-data-center, per-Worker cache, distinct from the zone cache. Max object 512 MB; 1,000 `put()`/`match()`/`delete()` calls per request on paid (50 free), sharing the subrequest quota [20].

**Claude API / model routing.** Current pricing (from the bundled `claude-api` skill, cached 2026-06-24): Opus 5 $5/$25 per million input/output tokens; Sonnet 5 $3/$15 (intro $2/$10 through 2026-08-31); Haiku 4.5 $1/$5. Larry's routing plan: Sonnet 5 as the default explainer, Haiku 4.5 for cheap high-volume micro-copy, and a rare Opus-tier escalation only for the hardest multi-step explanations — all gated by AI Gateway spend limits per child per day.

## Proposed resource inventory

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Type | Purpose (EN) | Propósito (ES) | Binding |
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

## Leaderboard design

**Write path.** A client submits an attempt to `math-challenge-ingest`. The Worker: (1) writes one Analytics Engine data point (raw telemetry — not a D1 row write), (2) RPCs the child's `math-challenge-learner-do` to update mastery state, (3) RPCs the relevant `math-challenge-league-do` and/or `math-challenge-classroom-do` with the score delta. Each league/classroom DO holds its ≤30 members' scores in its own SQLite table; on every update it re-sorts those ≤30 rows in memory (trivial) and pushes new standings to connected clients over a hibernatable WebSocket. This is what makes league/classroom standings "real-time-ish" without a global sorted-set primitive, which Cloudflare does not provide natively.

**Global and grade-band leaderboards take a different path.** A Cron-Triggered Worker (`math-challenge-leaderboard-cron`) fires `math-challenge-leaderboard-rollup-workflow` every 30–60 seconds. The Workflow aggregates totals (a D1 rollup table refreshed from Analytics Engine SQL, or batched D1 writes), computes top-N per grade band and globally, and writes JSON blobs to `math-challenge-leaderboard-kv`. Reads are then simple KV `get()` calls — cheap, edge-distributed, and explicitly **not** real-time (30–60 s stale by design), which avoids KV's 1-write/second/key limit entirely.

**Cost per 1,000,000 attempts (rough order of magnitude, paid plan):** Workers ingestion requests, ~1M, within/just past the 10M/month included tier (≤$0.30). Analytics Engine writes, 1M `writeDataPoint()` calls — no metered price found in current docs; reconfirm before scaling. Durable Object requests (league/classroom + learner DOs, ~2 calls/attempt), ~2M, ≈$0.15–$0.30. Durable Object SQLite rows written, 1–2M, within the 50M/month included tier at $0 marginal cost. D1 rollup writes are batched every 30–60 s, so cost does not scale with attempt count. KV writes happen once per key per rollup cycle, not per attempt.

**Net:** roughly **$0.50–$1.00 per million attempts** in direct primitive cost, dominated by Workers/DO request pricing rather than leaderboard-specific storage — because per-attempt writes are deliberately kept off D1 and off KV.

## Data model sketch (D1)

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

Raw per-attempt rows are **deliberately absent** from this schema — they live in `math-challenge-attempts-ae` (Analytics Engine) and, for anything needed past its 3-month retention, in `math-challenge-exports` (R2, via a periodic Pipeline or Worker export job).

## Design implications / risks

1. **D1's 10 GB/database ceiling is the first hard wall**, hit by a design mistake (storing raw attempts in D1), not by traffic growth — the Analytics Engine mitigation must be there from the first commit, not retrofitted [2].
2. **A single "global" Durable Object is an anti-pattern** — a DO handling all traffic bottlenecks at ~500–1,000 req/s; leagues and classrooms must be sharded one-DO-per-entity from day one [7].
3. **KV's 60-second worst-case propagation and 30-second minimum `cacheTtl`** mean the global/grade-band leaderboard is never truly live — surface this in the UI ("updated a minute ago") so kids don't think earned points vanished [11][12].
4. **KV's 1-write-per-second-per-key limit** makes any "increment on every attempt" design fail under burst load — the rollup-via-Workflow design writes at a fixed cadence instead.
5. **AI Gateway caching must not be applied uniformly** — caching an embeddings gateway silently returns stale vectors, so the tutor and RAG-embedding calls need separate gateway caching configuration if they ever share a gateway.
6. **D1 read replication is only sequentially consistent, with unbounded worst-case lag** — a "see your own score immediately after submitting" flow must use the Sessions API bookmark, not an unconstrained read [3].
7. **COPPA/GDPR-K erasure is a four-system deletion problem**: D1 rows, DO SQLite storage, Analytics Engine (3-month TTL helps but doesn't erase on demand), and Vectorize (avoided here by keeping Vectorize scoped to curated content only). Deletion runbooks must enumerate all four.
8. **Vectorize must stay scoped to the curated content/hint bank**, not per-child embeddings — the 10M-vector ceiling is real at scale, and per-child vectors are a privacy liability with no clean deletion story [16].
9. **DO SQLite storage billing started January 7, 2026** — recent enough that older cost models will understate it; re-check the current pricing page before a capacity plan [9].
10. **Turnstile with young, possibly non-reading users is untested here** — the youngest grade band likely needs parent-mediated login entirely, sidestepping bot-defense UX for children.
11. **Web Push is inconsistent on school-managed devices** — iOS needs an installed home-screen PWA on Safari 16.4+, and MDM-managed Chromebooks/iPads often block install prompts; a non-push fallback (parent email digest) is needed for reach.
12. **Any query against `score_totals` without the composite index will eventually hit D1's CPU-time failure mode** as the table grows — verify with `EXPLAIN QUERY PLAN` before shipping, not after an incident [5].
13. **Analytics Engine's write price could not be confirmed from current docs** — the cost-per-million-attempts estimate assumes it is bundled into the Workers plan; verify against the live pricing page before it enters a budget.

## Open questions for the project owner

1. What exact grade bands / age ranges are in scope (K–2, 3–5, 6–8, 9–12, adult)? Drives grade-band leaderboard partitioning and COPPA age-gating (under-13 vs. 13+).
2. Is 3-month Analytics Engine retention acceptable for raw attempt history, or does a year-over-year progress report require the R2+Pipelines cold-archive path from day one?
3. What worst-case concurrent burst should we design for (e.g. a whole district in the same class period)? Sizes DO sharding granularity.
4. Is "real-time" for league standings a hard sub-second WebSocket requirement, or is a few-seconds refresh acceptable?
5. Should an uncapped AI-tutor tier ever exist, or is a strict per-child daily Claude spend cap always in force?
6. Which 5 languages exactly? Determines whether Workers AI's `m2m100` covers all pairs or some need human/Claude-quality translation for launch.
7. Are leagues auto-assigned (random cohorting) or teacher/parent-curated? Affects the league-lifecycle Workflow and whether `math-challenge-league-do` needs a matchmaking step.
8. What is the conflict-resolution rule for offline PWA progress syncing across two devices?
9. What identity approach is preferred for parent accounts — magic link, passkeys, or federated? Affects where Turnstile sits and the `users` table shape.
10. What is the target monthly AI Gateway spend ceiling? Needed to size the 20 spend-limit rules and the fallback-model policy up front.

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
