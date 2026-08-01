# Cloudflare Architecture for Math Challenge

> Math Challenge research — 2026-07-31 — topic 32

## Resumen ejecutivo (ES)

Math Challenge ist eine PWA für Mathematik‑Übung, die vollständig auf Cloudflare aufgebaut ist. Die vorgeschlagene Architektur verwendet **Workers + Astro** für das Frontend/BFF, **D1** für relationale Daten (Konten, Inhalte, Mitgliedschaften), **Durable Objects mit SQLite‑Speicher** für Live‑Zustand mit niedriger Kardinalität (eine Liga von ~30, ein Klassenraum, die Sitzung eines Kindes), **Analytics Engine** für Telemetrie von Versuchen mit hohem Volumen (nicht D1 — D1 läuft zuerst an Speichergrenzen), **KV** für periodisch neu berechnete globale/klassenbezogene Leaderboard‑Snapshots, **R2** für Medien und kaltes Archiv, **Queues + Workflows** für asynchrones Scoring und KI‑Erklärungsgenerierung, **Vectorize + Workers AI** für mehrsprachiges RAG über die Hinweis‑Datenbank und **AI Gateway** vor der Claude‑API, um zu cachen, die Rate zu begrenzen und ein Ausgaben‑Limit für den Tutor „Larry“ mit Modell‑Routing zu setzen. Die Grenze, die wir zuerst erreichen, ist nicht die Rechenleistung: Es ist das Speicher‑Ceiling von D1 (10 GB pro Datenbank im kostenpflichtigen Plan), wenn jemand versucht, jeden Versuch dort zu speichern — deshalb gehen rohe Versuche zu Analytics Engine, nicht zu D1.

## Executive summary (EN)

Math Challenge ist eine PWA‑first‑Mathe‑Übungs‑App, die vollständig auf Cloudflare aufgebaut ist. Die vorgeschlagene Architektur verwendet **Workers + Astro** für das Frontend/BFF, **D1** für relationale Daten (Konten, Inhalte, Mitgliedschaften), **Durable Objects mit SQLite‑Speicher** für Live‑Zustand mit niedriger Kardinalität (eine Liga von ~30, ein Klassenraum, die Sitzung eines Kindes), **Analytics Engine** für Telemetrie von Versuchen mit hohem Volumen (nicht D1 — D1 läuft zuerst an Speichergrenzen), **KV** für periodisch neu berechnete globale/klassenbezogene Leaderboard‑Snapshots, **R2** für Medien und kaltes Archiv, **Queues + Workflows** für asynchrones Scoring und KI‑Erklärungsgenerierung, **Vectorize + Workers AI** für mehrsprachiges RAG über die Hinweis‑Datenbank und **AI Gateway** vor der Claude‑API, um zu cachen, die Rate zu begrenzen und ein Ausgaben‑Limit für den Tutor „Larry“ mit Modell‑Routing zu setzen. Die Grenze, die wir zuerst erreichen, ist nicht die Rechenleistung — sie ist das Speicher‑Ceiling von D1 (10 GB pro Datenbank im kostenpflichtigen Plan), wenn rohe Versuche dort gespeichert werden. Deshalb gehen rohe Versuche zu Analytics Engine, nicht zu D1.

## Product-to-primitive mapping

| Feature | Primitive | Why | Real limit that constrains it |
|---|---|---|---|
| Frontend + BFF, PWA‑Shell | Workers (Astro via `@astrojs/cloudflare`, static Assets) | Monorepo führt bereits Astro auf Workers aus; Framework‑Auto‑Konfiguration für Astro existiert seit Dez. 2025 [22][23] | Workers‑CPU‑/Request‑Grenzen — keine kurzfristige Einschränkung |
| Parent/child/teacher accounts, content catalog, memberships | D1 | Relational, transaktional, günstig in diesem Maßstab | 10 GB/database (paid), 500 MB (free); 50,000 DBs/account, 1 TB/account [2] |
| Per-attempt telemetry (tens of thousands of users × many attempts/day) | Analytics Engine | Genau dafür gebaut: hochkardinale, schreibintensive Ereignisse, kein zeilenbasiertes Speicherabrechnungsmodell wie D1 | 20 blobs / 20 doubles / 1 index (96 B) per point, 250 points per Worker invocation, 3‑month retention [13] |
| Live league (~30) and classroom standings | Durable Objects (SQLite storage) | One DO per league/classroom keeps request rate per object low (~30 writers), full in‑memory sort of 30 rows is trivial, WebSocket hibernation gives near‑real‑time push at near‑zero idle cost | Soft throughput ceiling ~500–1,000 req/s per individual DO — must shard by league/classroom, never one global DO [7] |
| Global / grade-band leaderboard | KV (precomputed snapshot) + Workflow/Cron rollup | KV read is edge‑cached and cheap at fan‑out scale; a global sorted view doesn't need sub‑second freshness | KV: 1 write/sec per key, min `cacheTtl` 30 s — cannot write per‑attempt, must batch [9][11][12] |
| Adaptive learner model per child | Durable Object (SQLite) or D1 rollup, read by Worker at question‑selection time | Needs low‑latency read/write colocated with compute; DO gives per‑child isolation | 10 GB storage per DO object [8] |
| Content bank (5 languages, thousands of items) | D1 (metadata) + R2 (media assets: images/audio) | D1 for structured queryable rows; R2 for large binary assets, no egress fee | R2 has no query language of its own — pair with D1 index |
| AI tutor "Larry" (Claude API, model routing) | Workers → AI Gateway → Claude API | AI Gateway gives caching, rate limits, and per‑user spend limits in front of the model call | AI Gateway: max 20 spend‑limit rules/gateway [Spend limits] |
| Cheap local inference: embeddings, TTS, translation | Workers AI | Runs on Cloudflare's network, no external round‑trip, per‑model pricing | Model‑specific: e.g. bge‑m3 $0.012/M input tokens [17] |
| RAG over hint/explanation bank | Vectorize (embeddings from bge‑m3) | Multilingual embedding model matches the 5‑language requirement | 10M vectors/index, 1,536 dims max [16] |
| Async scoring, AI explanation generation | Queues + Workflows | Decouples the attempt‑submission request from slower AI‑explanation generation; Workflows give durable retries | Queues: 64 KB operation unit, 100 K ops/day free [Queues pricing]; Workflows: 500K steps included/month [Workflows pricing] |
| Push notifications | Web Push (via a Worker sending payloads) + PWA service worker | Not a distinct CF product — Workers is just the sender; browser/OS owns delivery | iOS Web Push requires installed‑to‑homescreen Safari 16.4+; inconsistent on school‑managed Chromebooks/iPads |
| Offline play | PWA service worker + Cache API + background sync to `math-challenge-ingest` | Cache API is per‑Worker, not shared globally | 512 MB max cached object, 1,000 Cache API calls/request (paid) [20] |
| Bot defense on signup/login | Turnstile | Free, WCAG 2.2 AA, non‑interactive/invisible modes suit children | No hard rate limit found in fetched docs; verify current plan limits before launch |
| Privacy‑respecting site analytics | Web Analytics | Cookie‑free RUM, EU‑exclusion toggle | 7‑day unsampled retention, then ~10 % sampling [Web Analytics FAQ] |
| Cost control on Claude spend | AI Gateway (Unified Billing, spend limits, dynamic routing/fallback) | One place to see and cap the whole tutor cost surface | 20 spend‑limit rules/gateway ceiling |
| Hyperdrive | *(not used)* | No external Postgres/MySQL in this design — D1 is the system of record | N/A |
| Images/Stream | *(not used at launch)* | Content is illustrations + short audio, served fine from R2 directly; revisit if video lessons are added | N/A |

## Ergebnisse — servicebezogene Anmerkungen

**D1.** Paid‑Plan‑Limits: 10 GB pro Datenbank, 50.000 Datenbanken pro Konto, 1 TB Gesamtspeicher pro Konto, maximale Abfragezeit von 30 Sekunden, maximaler SQL‑Befehl von 100 KB, maximal 2 MB pro Zeile/BLOB, 6 gleichzeitige Verbindungen pro Worker, 1.000 Abfragen pro Worker‑Aufruf [2]. Preise: 25 Milliarden gelesene Zeilen pro Monat inbegriffen, danach $0,001 pro Million; 50 Millionen geschriebene Zeilen inbegriffen, danach $1,00 pro Million; Speicher $0,75/GB‑Monat über die enthaltenen 5 GB hinaus [1]. **Read replication** ist in der öffentlichen Beta über die Sessions‑API verfügbar und verwendet Lesezeichen für sequentielle Konsistenz („read your own writes“, monotone Lesevorgänge); Cloudflare erstellt automatisch eine Replikation pro unterstützter Region (ENAM, WNAM, WEUR, EEUR, APAC, OC) ohne zusätzliche Kosten – die Abrechnung bleibt unverändert [3][4]. Der Replikationsverzug ist im schlechtesten Fall unbegrenzt, sodass jeder „here's your new score“-Ablauf an das Lesezeichen der Schreib‑Session gebunden sein muss, nicht an einen unbeschränkten Lesevorgang.

**Durable Objects.** SQLite‑Speicher ist GA bei 10 GB pro Objekt [8]; eine weiche Durchsatzobergrenze von etwa 500–1.000 Anfragen pro Sekunde gilt **pro Objekt**, nicht pro Namensraum – Cloudflares eigene Richtlinie bezeichnet ein einzelnes „globales“ DO als Anti‑Pattern und verlangt Sharding nach natürlichen Grenzen (pro Raum, pro Nutzer, pro Liga) [7]. Compute (bezahlt): 1 Mio. Anfragen/Monat inbegriffen, danach $0,15 pro Million; 400.000 GB‑Sekunden inbegriffen, danach $12,50 pro Million GB‑s [1]. Die Speicherabrechnung für SQLite‑basierte DOs (Zeilen spiegeln D1‑Preise wider; Speicher $0,20/GB‑Monat) begann am 7. Januar 2026 – neu genug, dass ältere Kostenmodelle sie unterschätzen [1][9].

**Workers KV.** Bezahlt: 10 Mio. Lesevorgänge/Monat inbegriffen, danach $0,50 pro Million; 1 Mio. Schreib‑/Lösch‑/Listen‑Vorgänge inbegriffen, danach $5,00 pro Million; 1 GB Speicher inbegriffen, danach $0,50/GB‑Monat [Workers pricing]. Eventuell konsistent: Schreibvorgänge verbreiten sich weltweit innerhalb von 60 Sekunden oder nach dem von Ihnen gesetzten `cacheTtl` – das minimale `cacheTtl` wurde 2026 auf 30 Sekunden reduziert [12]. **Nur ein Schreibvorgang pro Schlüssel pro Sekunde** ist erlaubt; mehr löst 429‑Fehler aus [11]. Bulk‑Lesevorgänge (100 Schlüssel) und Bulk‑Schreibvorgänge (10.000 Paare, ≤100 MB) sind über die REST‑API verfügbar [10][11]. Das macht KV ungeeignet für Aktualisierungen pro Versuch und geeignet für periodisch aktualisierte Snapshots.

**Analytics Engine.** `writeDataPoint()` akzeptiert bis zu 20 Blobs, 20 Doubles, 1 Index (≤96 Bytes); ein Worker‑Aufruf kann höchstens 250 Datenpunkte schreiben; die Blob‑Nutzlast ist auf 16 KB pro Punkt begrenzt; die Aufbewahrung beträgt drei Monate [13]. Es wurde kein separater Preis pro Schreibvorgang in den abgerufenen Dokumenten gefunden – behandeln Sie ihn als im Workers‑Plan enthalten und prüfen Sie dies erneut, bevor Sie ein Volumenbudget festlegen; es ist die eine Kennzahl, die dieser Bericht nicht mit Sicherheit ermitteln konnte.

**Queues.** Eine „Operation“ wird pro 64 KB‑Block gelesen/geschrieben/gelöscht abgerechnet; das Zustellen einer Nachricht kostet typischerweise 3 Operationen. Kostenlos: 10.000 Ops/Tag. Bezahlt: 1 Mio. Ops/Monat inbegriffen, danach $0,40 pro Million. Die Aufbewahrung beträgt standardmäßig 4 Tage, konfigurierbar bis zu 14 Tage [Queues pricing].

**Workflows.** Requests und CPU‑Zeit teilen die Workers‑Pools (10 Mio. Anfragen + $0,30 pro Million darüber hinaus; 30 Mio. CPU‑ms + $0,02 pro Million darüber hinaus); Speicher 1 GB + $0,20/GB‑Monat; Schritte 500.000/Monat inbegriffen + $0,80 für zusätzliche 100.000 [Workflows pricing]. Die Abrechnung für Schritte/Speicher hatte zum Zeitpunkt des zitierten Änderungsprotokolls noch nicht begonnen – bestätigen Sie das Startdatum, bevor Sie Kostenmodelle finalisieren.

**R2.** Speicher $0,015/GB‑Monat; Klasse A (schreibähnlich) $4,50 pro Million; Klasse B (leseähnlich) $0,36 pro Million; Ausgangsdaten (egress) kostenlos. Gratis‑Stufe: 10 GB‑Monat Speicher, 1 Mio. Klasse A, 10 Mio. Klasse B/Monat [R2 pricing]. Keine Ausgangsgebühr ist relevant für Kaltarchiv: Batch‑Export/Training‑Abrufe kosten nichts beim Auslesen.

**Vectorize.** Indizes unterstützen jetzt bis zu 10 Mio. Vektoren (erhöht von 5 Mio. am 23. Januar 2026), begrenzt auf 1.536 Dimensionen pro Vektor [16]. Preise: 50 Mio. abgefragte Dimensionen pro Monat inbegriffen, danach $0,01 pro Million; 10 Mio. gespeicherte Dimensionen pro Monat inbegriffen, danach $0,05 pro 100 Millionen [1].

**Workers AI.** Beispielpreise: `@cf/baai/bge-m3` (mehrsprachige Einbettungen, entspricht dem 5‑Sprachen‑Bank) $0,012 pro Mio. Eingabetoken; `@cf/myshell-ai/melotts` (TTS) $0,0002 pro Audio‑Minute; `@cf/meta/m2m100-1.2b` (Übersetzung) $0,342 pro Mio. Token ein/aus [17] – günstig genug, um zur Inhaltserstellung zu laufen, nicht pro Anfrage.

**AI Gateway.** Caching gilt nur für identische Text‑/Bild‑Anfragen, kein semantischer Cache [Caching doc]. Ausgabenlimits sind kostenbasierte Budgets, die nach Modell/Anbieter/benutzerdefinierten Metadaten (z. B. pro Kind, pro Tag) scoped sind und auf 20 Regeln pro Gateway begrenzt werden [Spend limits doc]. Dynamisches Routing kann automatisch zu einem günstigeren Modell zurückfallen, wenn ein Budget erreicht wird, anstatt die Anfrage hart zu blockieren.

**Turnstile.** Kostenlos, WCAG 2.2 AA, bietet nicht‑interaktive und vollständig unsichtbare Modi, die für einen Kinder‑Registrierungsablauf geeignet sind. Es wurde kein festes Anfragen‑Volumen‑Limit auf den abgerufenen Seiten gefunden; prüfen Sie die aktuellen Plan‑Limits vor dem Start.

**Web Analytics.** Kostenlos, cookie‑freies RUM. Ungezogene Beacon‑Daten werden 7 Tage aufbewahrt und dann zu einer Stichprobe von ~10 % aggregiert; EU‑Besucher können mit einem Klick ausgeschlossen werden [Web Analytics FAQ].

**Cache API.** Pro Rechenzentrum, pro Worker‑Cache, getrennt vom Zonen‑Cache. Maximalobjekt 512 MB; 1.000 `put()`/`match()`/`delete()`‑Aufrufe pro Anfrage bei bezahlten Plänen (50 kostenlos), teilen das Sub‑Request‑Kontingent [20].

**Claude API / model routing.** Aktuelle Preise (aus dem gebündelten `claude-api`‑Skill, zwischengespeichert am 24. Juni 2026): Opus 5 $5/$25 pro Mio. Eingabe‑/Ausgabetoken; Sonnet 5 $3/$15 (Einführung $2/$10 bis zum 31. August 2026); Haiku 4.5 $1/$5. Larrys Routing‑Plan: Sonnet 5 als Standard‑Erklärer, Haiku 4.5 für günstige, hochvolumige Mikro‑Texte und eine seltene Opus‑Stufe‑Eskalation nur für die schwierigsten mehrstufigen Erklärungen – alles gesteuert durch AI‑Gateway‑Ausgabenlimits pro Kind pro Tag.

## Vorgeschlagener Ressourcenbestand

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Typ | Zweck (EN) | Zweck (ES) | Bindung |
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

## Leaderboard-Design

**Schreibpfad.** Ein Client sendet einen Versuch an `math-challenge-ingest`. Der Worker: (1) schreibt einen Datenpunkt in die Analytics Engine (rohe Telemetrie — keine D1‑Zeilen‑Schreibung), (2) ruft per RPC das `math-challenge-learner-do` des Kindes auf, um den Beherrschungs‑Status zu aktualisieren, (3) ruft per RPC das relevante `math-challenge-league-do` und/oder `math-challenge-classroom-do` mit der Punktedelta auf. Jedes Liga‑/Klassen‑DO speichert die Punktzahlen seiner ≤30 Mitglieder in einer eigenen SQLite‑Tabelle; bei jeder Aktualisierung sortiert es diese ≤30 Zeilen im Speicher neu (trivial) und sendet neue Ranglisten an verbundene Clients über einen hiberntauglichen WebSocket. Damit werden die Liga‑/Klassen‑Ranglisten „fast‑echtzeitartig“ ohne ein globales Sorted‑Set‑Primitive, das Cloudflare nativ nicht bereitstellt.

**Globale und Klassen‑Band‑Ranglisten folgen einem anderen Pfad.** Ein cron‑ausgelöster Worker (`math-challenge-leaderboard-cron`) startet `math-challenge-leaderboard-rollup-workflow` alle 30–60 Sekunden. Der Workflow aggregiert Gesamtsummen (eine D1‑Rollup‑Tabelle, die aus Analytics‑Engine‑SQL aktualisiert wird, oder batchweise D1‑Schreibvorgänge), berechnet die Top‑N pro Klassen‑Band und global und schreibt JSON‑Blobs in `math-challenge-leaderboard-kv`. Lesevorgänge sind dann einfache KV‑`get()`‑Aufrufe — günstig, am Edge verteilt und ausdrücklich **nicht** in Echtzeit (30–60 s veraltet nach Design), wodurch das KV‑Limit von 1‑Schreib‑/Sekunde/Schlüssel vollständig umgangen wird.

**Kosten pro 1.000.000 Versuche (ungefähre Größenordnung, kostenpflichtiger Plan):** Worker‑Ingestionsanfragen, ~1 M, innerhalb/gerade über dem inbegriffenen Kontingent von 10 M/Monat (≤$0,30). Analytics‑Engine‑Schreibvorgänge, 1 M `writeDataPoint()`‑Aufrufe — kein gemessener Preis in den aktuellen Dokumenten gefunden; vor Skalierung erneut prüfen. Durable‑Object‑Anfragen (Liga/Klasse + Learner‑DOs, ~2 Aufrufe/Versuch), ~2 M, ≈$0,15–$0,30. Durable‑Object‑SQLite‑Zeilen geschrieben, 1–2 M, innerhalb des inbegriffenen Kontingents von 50 M/Monat bei $0 Grenzkosten. D1‑Rollup‑Schreibvorgänge werden alle 30–60 s gebatcht, sodass die Kosten nicht mit der Versuchszahl skalieren. KV‑Schreibvorgänge erfolgen einmal pro Schlüssel pro Rollup‑Zyklus, nicht pro Versuch.

**Netto:** etwa **$0,50–$1,00 pro Million Versuche** bei direkten Primitive‑Kosten, dominiert von den Preisen für Worker/DO‑Anfragen statt von speicher‑spezifischen Kosten für Ranglisten — weil Schreibvorgänge pro Versuch bewusst von D1 und KV ferngehalten werden.

## Datenmodell-Entwurf (D1)

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

Roh‑Versuchs‑Zeilen sind **absichtlich nicht** in diesem Schema enthalten — sie befinden sich in `math-challenge-attempts-ae` (Analytics Engine) und, für alles, das über die 3‑Monats‑Retention hinaus benötigt wird, in `math-challenge-exports` (R2, über einen periodischen Pipeline‑ oder Worker‑Export‑Job).

## Designimplikationen / Risiken

1. **Die 10 GB/Database-Obergrenze von D1 ist die erste harte Grenze**, verursacht durch einen Designfehler (Speichern roher Versuche in D1), nicht durch Traffic‑Wachstum — die Analytics‑Engine‑Abmilderung muss bereits beim ersten Commit vorhanden sein, nicht nachträglich hinzugefügt werden [2].
2. **Ein einzelnes „globales“ Durable Object ist ein Anti‑Pattern** — ein DO, das alle Traffic‑Engpässe bei ca. 500–1.000 Anfragen/s verarbeitet; Ligen und Klassenräume müssen von Anfang an pro Entität ein DO erhalten [7].
3. **KVs 60‑Sekunden‑Worst‑Case‑Propagation und 30‑Sekunden‑Minimum `cacheTtl`** bedeuten, dass das globale/Klassenstufen‑Leaderboard nie wirklich live ist — dies in der UI anzeigen („vor einer Minute aktualisiert“), damit Kinder nicht denken, verdiente Punkte seien verschwunden [11][12].
4. **KVs Limit von 1 Schreibvorgang pro Sekunde pro Schlüssel** lässt jedes „Inkrement bei jedem Versuch“-Design bei Lastspitzen scheitern — das Rollup‑via‑Workflow‑Design schreibt stattdessen in einem festen Rhythmus.
5. **Das Caching des AI‑Gateway darf nicht einheitlich angewendet werden** — das Caching eines Embeddings‑Gateways liefert stillschweigend veraltete Vektoren, daher benötigen Tutor‑ und RAG‑Embedding‑Aufrufe separate Gateway‑Caching‑Konfigurationen, falls sie sich ein Gateway teilen.
6. **D1‑Lese‑Replikation ist nur sequenziell konsistent, mit unbegrenzter Worst‑Case‑Verzögerung** — ein „Siehe deinen Punktestand sofort nach dem Absenden“-Ablauf muss das Sessions‑API‑Bookmark verwenden, nicht ein unbeschränktes Lese‑Verfahren [3].
7. **COPPA/GDPR‑K‑Löschung ist ein Vier‑System‑Löschungsproblem**: D1‑Zeilen, DO‑SQLite‑Speicher, Analytics Engine (3‑Monats‑TTL hilft, löscht aber nicht auf Abruf) und Vectorize (hier vermieden, indem Vectorize nur auf kuratierten Inhalten beschränkt wird). Lösch‑Runbooks müssen alle vier aufführen.
8. **Vectorize muss auf den kuratierten Inhalts‑/Hinweis‑Bankbereich beschränkt bleiben**, nicht auf pro‑Kind‑Einbettungen — die 10 M‑Vektor‑Obergrenze ist bei Skalierung real, und pro‑Kind‑Vektoren stellen ein Datenschutz‑Risiko ohne saubere Lösch‑Möglichkeit dar [16].
9. **Die Abrechnung für DO‑SQLite‑Speicher begann am 7. Januar 2026** — neu genug, dass ältere Kostenmodelle sie unterschätzen; prüfen Sie die aktuelle Preisseite vor einer Kapazitätsplanung erneut [9].
10. **Turnstile mit jungen, möglicherweise nicht lesenden Nutzern ist hier ungetestet** — die jüngste Klassenstufe benötigt wahrscheinlich vollständig eine elternvermittelte Anmeldung, wodurch die Bot‑Verteidigungs‑UX für Kinder umgangen wird.
11. **Web‑Push ist auf schulverwalteten Geräten inkonsistent** — iOS benötigt eine installierte Home‑Screen‑PWA auf Safari 16.4+, und MDM‑verwaltete Chromebooks/iPads blockieren häufig Installationsaufforderungen; ein Nicht‑Push‑Fallback (Eltern‑E‑Mail‑Digest) ist für Reichweite nötig.
12. **Jede Abfrage gegen `score_totals` ohne den zusammengesetzten Index wird bei wachsender Tabellengröße schließlich den CPU‑Zeit‑Fehlermodus von D1 erreichen** — vor dem Rollout mit `EXPLAIN QUERY PLAN` prüfen, nicht nach einem Vorfall [5].
13. **Der Schreibpreis der Analytics Engine konnte aus den aktuellen Dokumenten nicht bestätigt werden** — die Kostenschätzung pro Million Versuche geht davon aus, dass sie im Workers‑Plan enthalten ist; vor Budgetierung die aktuelle Preisseite prüfen.

## Offene Fragen für den Projektinhaber

1. Welche genauen Klassenstufen / Altersbereiche sind im Geltungsbereich (K–2, 3–5, 6–8, 9–12, erwachsen)? Bestimmt die Partitionierung des Klassenstufen‑Leaderboards und die COPPA‑Altersgrenze (unter 13 vs. 13+).
2. Ist die 3‑Monats‑Retention der Analytics Engine für rohe Versuchs‑Historie akzeptabel, oder erfordert ein Jahres‑zu‑Jahres‑Fortschrittsbericht von Anfang an den R2‑+‑Pipelines‑Cold‑Archive‑Pfad?
3. Für welchen Worst‑Case‑gleichzeitigen Lastspurt sollten wir planen (z. B. ein ganzes Schulbezirk während derselben Unterrichtsperiode)? Bestimmt die Granularität des DO‑Sharding.
4. Ist „Echtzeit“ für Liga‑Ranglisten ein striktes Unter‑Sekunden‑WebSocket‑Requirement, oder ist ein Refresh von wenigen Sekunden akzeptabel?
5. Sollte es jemals eine unbegrenzte KI‑Tutor‑Stufe geben, oder gilt stets ein striktes tägliches Claude‑Ausgaben‑Limit pro Kind?
6. Welche genau fünf Sprachen? Bestimmt, ob Workers AI's `m2m100` alle Paare abdeckt oder für einige menschliche/Claude‑Qualitäts‑Übersetzungen zum Start nötig sind.
7. Werden Ligen automatisch zugewiesen (zufällige Gruppierung) oder von Lehrern/Eltern kuratiert? Beeinflusst den Liga‑Lebenszyklus‑Workflow und ob `math-challenge-league-do` einen Matching‑Schritt benötigt.
8. Wie lautet die Konfliktlösungs‑Regel für das Offline‑PWA‑Fortschritts‑Synchronisieren über zwei Geräte hinweg?
9. Welcher Identitäts‑Ansatz wird für Eltern‑Konten bevorzugt — Magic‑Link, Passkeys oder föderiert? Beeinflusst, wo Turnstile platziert wird und die Struktur der `users`‑Tabelle.
10. Wie hoch ist die angestrebte monatliche Ausgaben‑Obergrenze für das AI‑Gateway? Wird benötigt, um die 20 Ausgaben‑Limit‑Regeln und die Fallback‑Modell‑Richtlinie im Voraus zu dimensionieren.

## Quellen

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — Preislisten für D1, KV, Vectorize, Queues, Workers, Durable Objects. Accessed 2026-07-31.  
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — Datenbankgröße, Speicher, Abfrage‑ und Verbindungs‑Limits.  
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — Konsistenzmodell, unterstützte Regionen.  
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.  
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — CPU‑Zeit‑ und Überlast‑Fehlermodi.  
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — Abrechnung für Compute und SQLite‑Speicher.  
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — Durchsatz‑Leitlinien pro Objekt, Anti‑Patterns.  
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB pro Objekt.  
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, Beginn der Abrechnung.  
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — Bulk‑Lesevorgänge, `cacheTtl`.  
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — Limit von 1 Schreibvorgang pro Sekunde pro Schlüssel, Bulk‑Schreiblimits.  
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.  
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — Limits für Blobs/Doubles/Index/Retention.  
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — Speicher, Class‑A/B‑Operationen, Ausgangsdaten.  
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.  
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — Preisgestaltung pro Modell (bge-m3, melotts, m2m100).  
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — Budget‑Regeln, dynamischer Routen‑Fallback, Obergrenze von 20 Regeln.  
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — Cache‑Umfang und Identische‑Anfrage‑Abgleich.  
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — Cache‑API‑Limits, Anfrage‑/Antwort‑Limits.  
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — Stichproben‑ und Retentions‑Verhalten.  
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — Full‑Stack‑Deploy‑Modell, relevant für Astro auf Workers.  
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, bestätigt Astro als unterstütztes Framework.  
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — Anfragen, CPU‑Zeit, Speicher, Schritte.  
24. Anthropic `claude-api` skill, cached model/pricing table (2026-06-24) — Preisgestaltung für Claude Opus 5 / Sonnet 5 / Haiku 4.5, verwendet für den Modell‑Routing‑Plan.
