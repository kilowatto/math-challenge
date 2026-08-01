# Arquitectura de Cloudflare para Math Challenge

> Investigación Math Challenge — 2026-07-31 — tema 32

## Resumen ejecutivo (ES)

Math Challenge es una PWA de práctica matemática construida enteramente sobre Cloudflare. La arquitectura propuesta usa **Workers + Astro** para el frontend/BFF, **D1** para datos relacionales (cuentas, contenido, membresías), **Durable Objects con almacenamiento SQLite** para estado en vivo de bajo cardinal (una liga de ~30, un salón, la sesión de un niño), **Analytics Engine** para telemetría de intentos de alto volumen (no D1 — D1 se queda sin espacio primero), **KV** para instantáneas de leaderboard global/por-grado recalculadas periódicamente, **R2** para medios y archivo frío, **Queues + Workflows** para calificación asíncrona y generación de explicaciones de IA, **Vectorize + Workers AI** para RAG multilingüe sobre el banco de pistas, y **AI Gateway** delante de la API de Claude para cachear, limitar tasa y poner tope de gasto al tutor "Larry" con enrutamiento de modelos. El límite que golpearemos primero no es cómputo: es el techo de almacenamiento de D1 (10 GB por base de datos en el plan de pago) si alguien intenta guardar cada intento ahí — por eso los intentos crudos van a Analytics Engine, no a D1.

## Executive summary (EN)

Math Challenge is a PWA-first math practice app built entirely on Cloudflare. The proposed architecture uses **Workers + Astro** for the frontend/BFF, **D1** for relational data (accounts, content, memberships), **Durable Objects with SQLite storage** for low-cardinality live state (a league of ~30, a classroom, a child's session), **Analytics Engine** for high-volume attempt telemetry (not D1 — D1 runs out of storage first), **KV** for periodically-recomputed global/grade-band leaderboard snapshots, **R2** for media and cold archive, **Queues + Workflows** for async scoring and AI-explanation generation, **Vectorize + Workers AI** for multilingual RAG over the hint bank, and **AI Gateway** in front of the Claude API to cache, rate-limit, and spend-cap the "Larry" tutor with model routing. The limit we hit first is not compute — it is D1's storage ceiling (10 GB per database on the paid plan) if raw attempts are stored there. That is why raw attempts go to Analytics Engine, not D1.

## Mapeo de producto a primitiva

| Funcionalidad | Primitiva | Por qué | Límite real que la restringe |
|---|---|---|---|
| Frontend + BFF, shell de la PWA | Workers (Astro vía `@astrojs/cloudflare`, Static Assets) | El monorepo ya ejecuta Astro en Workers; la auto-configuración de framework existe para Astro desde diciembre de 2025 [22][23] | Límites de CPU/solicitud de Workers — no es una restricción a corto plazo |
| Cuentas de padres/niños/maestros, catálogo de contenido, membresías | D1 | Relacional, transaccional, económico a esta escala | 10 GB/base de datos (de pago), 500 MB (gratis); 50,000 DBs/cuenta, 1 TB/cuenta [2] |
| Telemetría por intento (decenas de miles de usuarios × muchos intentos/día) | Analytics Engine | Construido exactamente para esto: eventos de alta cardinalidad con muchas escrituras, sin modelo de facturación por fila como D1 | 20 blobs / 20 doubles / 1 índice (96 B) por punto, 250 puntos por invocación de Worker, retención de 3 meses [13] |
| Clasificaciones en vivo de liga (~30) y salón | Durable Objects (SQLite storage) | Un DO por liga/salón mantiene baja la tasa de solicitudes por objeto (~30 escritores), ordenar en memoria 30 filas completo es trivial, la hibernación de WebSocket da push casi en tiempo real con un costo de inactividad casi nulo | Techo de rendimiento suave ~500–1,000 solicitudes/s por DO individual — debe fragmentarse por liga/salón, nunca un DO global [7] |
| Leaderboard global / por grado | KV (instantánea precalculada) + Workflow/Cron rollup | La lectura de KV está en caché en el edge y es barata a escala de fan-out; una vista global ordenada no necesita frescura de menos de un segundo | KV: 1 escritura/seg por clave, `cacheTtl` mínimo 30 s — no se puede escribir por intento, debe agruparse por lotes [9][11][12] |
| Modelo de aprendizaje adaptativo por niño | Durable Object (SQLite) o consolidación en D1, leído por el Worker al momento de seleccionar la pregunta | Necesita lectura/escritura de baja latencia colocalizada con el cómputo; el DO da aislamiento por niño | 10 GB de almacenamiento por objeto DO [8] |
| Banco de contenido (5 idiomas, miles de ítems) | D1 (metadatos) + R2 (activos multimedia: imágenes/audio) | D1 para filas estructuradas consultables; R2 para activos binarios grandes, sin tarifa de salida | R2 no tiene lenguaje de consulta propio — combinar con un índice de D1 |
| "Larry", el tutor de IA (API de Claude, enrutamiento de modelos) | Workers → AI Gateway → Claude API | AI Gateway da caché, límites de tasa y límites de gasto por usuario delante de la llamada al modelo | AI Gateway: máximo 20 reglas de límite de gasto/gateway [Spend limits] |
| Inferencia local barata: embeddings, TTS, traducción | Workers AI | Corre en la red de Cloudflare, sin ida y vuelta externa, precios por modelo | Específico por modelo: p. ej., bge-m3 $0.012/M tokens de entrada [17] |
| RAG sobre el banco de pistas/explicaciones | Vectorize (embeddings de bge-m3) | El modelo de embeddings multilingüe cumple con el requisito de 5 idiomas | 10M vectores/índice, 1,536 dimensiones máx [16] |
| Calificación asíncrona, generación de explicaciones de IA | Queues + Workflows | Desacopla la solicitud de envío de intento de la generación más lenta de explicaciones de IA; los Workflows dan reintentos duraderos | Queues: unidad de operación de 64 KB, 100 K ops/día gratis [Queues pricing]; Workflows: 500K pasos incluidos/mes [Workflows pricing] |
| Notificaciones push | Web Push (vía un Worker que envía payloads) + service worker de la PWA | No es un producto distinto de CF — Workers solo es el emisor; el navegador/SO controla la entrega | Web Push en iOS requiere Safari 16.4+ instalado en la pantalla de inicio; inconsistente en Chromebooks/iPads gestionados por escuelas |
| Juego sin conexión | service worker de la PWA + Cache API + sincronización en segundo plano hacia `math-challenge-ingest` | Cache API es por Worker, no compartida globalmente | 512 MB objeto máximo en caché, 1,000 llamadas a Cache API/solicitud (de pago) [20] |
| Defensa contra bots en registro/inicio de sesión | Turnstile | Gratis, WCAG 2.2 AA, modos no interactivos/invisibles adecuados para niños | No se encontró un límite de tasa estricto en la documentación obtenida; verificar los límites del plan actual antes del lanzamiento |
| Analítica del sitio respetuosa de la privacidad | Web Analytics | RUM sin cookies, con interruptor de exclusión para la UE | Retención sin muestreo de 7 días, luego ~10% de muestreo [Web Analytics FAQ] |
| Control de costo sobre el gasto en Claude | AI Gateway (Unified Billing, spend limits, dynamic routing/fallback) | Un solo lugar para ver y limitar toda la superficie de costo del tutor | Techo de 20 reglas de límite de gasto/gateway |
| Hyperdrive | *(not used)* | No hay Postgres/MySQL externo en este diseño — D1 es el sistema de registro | N/A |
| Images/Stream | *(not used at launch)* | El contenido son ilustraciones + audio corto, servido bien directamente desde R2; reconsiderar si se añaden lecciones en video | N/A |

## Hallazgos — notas por servicio

**D1.** Límites del plan de pago: 10 GB por base de datos, 50,000 bases de datos por cuenta, 1 TB de almacenamiento total por cuenta, duración máxima de consulta de 30 segundos, sentencia SQL máxima de 100 KB, fila/BLOB máximo de 2 MB, 6 conexiones simultáneas por Worker, 1,000 consultas por invocación de Worker [2]. Precios: 25 mil millones de filas leídas incluidas por mes, luego $0.001/millón; 50 millones de filas escritas incluidas, luego $1.00/millón; almacenamiento $0.75/GB-mes más allá de los 5 GB incluidos [1]. **La replicación de lectura** está en beta pública vía la Sessions API, usando marcadores (bookmarks) para consistencia secuencial ("leer tus propias escrituras", lecturas monótonas); Cloudflare crea automáticamente una réplica por región compatible (ENAM, WNAM, WEUR, EEUR, APAC, OC) sin costo adicional — la facturación no cambia [3][4]. El retraso de la réplica no tiene límite en el peor caso, así que cualquier flujo de "aquí está tu nueva puntuación" debe anclarse al marcador de la sesión que escribió, no a una lectura sin restricciones.

**Durable Objects.** El almacenamiento SQLite está en GA con 10 GB por objeto [8]; un techo de rendimiento suave de aproximadamente 500–1,000 solicitudes/segundo aplica **por objeto**, no por espacio de nombres — la propia guía de Cloudflare llama a un único DO "global" un anti-patrón y exige fragmentar por límite natural (por sala, por usuario, por liga) [7]. Cómputo (de pago): 1M solicitudes/mes incluidas, luego $0.15/millón; 400,000 GB-segundos incluidos, luego $12.50/millón de GB-s [1]. La facturación de almacenamiento para DOs respaldados por SQLite (las filas reflejan las tarifas de D1; almacenamiento $0.20/GB-mes) comenzó el 7 de enero de 2026 — lo suficientemente reciente como para que los modelos de costo más antiguos lo subestimen [1][9].

**Workers KV.** De pago: 10M lecturas/mes incluidas, luego $0.50/millón; 1M escrituras/borrados/listados incluidos, luego $5.00/millón; 1 GB de almacenamiento incluido, luego $0.50/GB-mes [Workers pricing]. Consistencia eventual: las escrituras se propagan en un máximo de 60 segundos a nivel mundial, o según el `cacheTtl` que configures — el `cacheTtl` mínimo se redujo a 30 segundos en 2026 [12]. **Solo se permite una escritura por clave por segundo**; más desencadena errores 429 [11]. Existen lecturas masivas (100 claves) y escrituras masivas (10,000 pares, ≤100 MB) vía la API REST [10][11]. Esto hace que KV sea inadecuado para actualizaciones por intento y adecuado para instantáneas refrescadas periódicamente.

**Analytics Engine.** `writeDataPoint()` acepta hasta 20 blobs, 20 doubles, 1 índice (≤96 bytes); una invocación de Worker puede escribir como máximo 250 puntos de datos; la carga útil del blob está limitada a 16 KB/punto; la retención es de tres meses [13]. No se encontró un precio separado por escritura en la documentación obtenida — trátalo como incluido en el plan de Workers y reconfirma antes de comprometerte con un presupuesto de volumen; es la única cifra que este reporte no pudo sustentar con certeza.

**Queues.** Una "operación" se factura por bloque de 64 KB leído/escrito/borrado; entregar un mensaje típicamente cuesta 3 operaciones. Gratis: 10,000 ops/día. De pago: 1M ops/mes incluidas, luego $0.40/millón. La retención es de 4 días por defecto, hasta 14 configurables [Queues pricing].

**Workflows.** Las solicitudes y el tiempo de CPU comparten los pools de Workers (10M solicitudes + $0.30/millón adicional; 30M CPU-ms + $0.02/millón adicional); almacenamiento 1 GB + $0.20/GB-mes; pasos 500,000/mes incluidos + $0.80/100,000 adicionales [Workflows pricing]. La facturación de pasos/almacenamiento no había comenzado según el changelog citado — confirma la fecha de inicio antes de finalizar los modelos de costo.

**R2.** Almacenamiento $0.015/GB-mes; Clase A (tipo escritura) $4.50/millón; Clase B (tipo lectura) $0.36/millón; salida gratis. Nivel gratuito: 10 GB-mes de almacenamiento, 1M Clase A, 10M Clase B/mes [R2 pricing]. La ausencia de tarifa de salida importa para el archivo frío: las exportaciones por lotes o las extracciones para entrenamiento no cuestan nada al leerse.

**Vectorize.** Los índices ahora admiten hasta 10M vectores (aumentado desde 5M el 2026-01-23), con un límite de 1,536 dimensiones/vector [16]. Precios: 50M dimensiones consultadas incluidas/mes, luego $0.01/millón; 10M dimensiones almacenadas incluidas, luego $0.05/100 millones [1].

**Workers AI.** Precios representativos: `@cf/baai/bge-m3` (embeddings multilingües, coincide con el banco de 5 idiomas) $0.012/M tokens de entrada; `@cf/myshell-ai/melotts` (TTS) $0.0002/minuto de audio; `@cf/meta/m2m100-1.2b` (traducción) $0.342/M tokens de entrada/salida [17] — suficientemente barato para correr en el momento de creación de contenido, no por solicitud.

**AI Gateway.** El caché aplica solo a solicitudes idénticas de texto/imagen, sin caché semántico [Caching doc]. Los límites de gasto son presupuestos basados en costo, delimitados por modelo/proveedor/metadatos personalizados (p. ej., por niño, por día), con un tope de 20 reglas por gateway [Spend limits doc]. El enrutamiento dinámico puede retroceder automáticamente a un modelo más barato cuando se alcanza un presupuesto, en lugar de bloquear la solicitud de forma rígida.

**Turnstile.** Gratis, WCAG 2.2 AA, ofrece modos no interactivos y totalmente invisibles adecuados para un flujo de registro infantil. No apareció un límite estricto de volumen de solicitudes en las páginas obtenidas; confirma los límites del plan actual antes del lanzamiento.

**Web Analytics.** Gratis, RUM sin cookies. Los datos de beacon sin muestrear se conservan 7 días y luego se agregan a un muestreo de ~10%; los visitantes de la UE pueden excluirse con un clic [Web Analytics FAQ].

**Cache API.** Caché por centro de datos, por Worker, distinta de la caché de zona. Objeto máximo 512 MB; 1,000 llamadas `put()`/`match()`/`delete()` por solicitud en el plan de pago (50 en el gratis), compartiendo la cuota de subsolicitudes [20].

**Claude API / enrutamiento de modelos.** Precios actuales (del skill `claude-api` incluido, cacheado 2026-06-24): Opus 5 $5/$25 por millón de tokens de entrada/salida; Sonnet 5 $3/$15 (introductorio $2/$10 hasta 2026-08-31); Haiku 4.5 $1/$5. El plan de enrutamiento de Larry: Sonnet 5 como explicador por defecto, Haiku 4.5 para micro-textos baratos de alto volumen, y una escalada rara a nivel Opus solo para las explicaciones multi-paso más difíciles — todo controlado por los límites de gasto de AI Gateway por niño por día.

## Inventario de recursos propuesto

Todo objeto lleva el prefijo `math-challenge-` según lo requerido. Los nombres de binding usan `UPPER_SNAKE_CASE`.

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

## Diseño del leaderboard

**Ruta de escritura.** Un cliente envía un intento a `math-challenge-ingest`. El Worker: (1) escribe un punto de datos de Analytics Engine (telemetría cruda — no una escritura de fila en D1), (2) hace RPC al `math-challenge-learner-do` del niño para actualizar el estado de dominio, (3) hace RPC al `math-challenge-league-do` y/o `math-challenge-classroom-do` correspondiente con el delta de puntuación. Cada DO de liga/salón guarda las puntuaciones de sus ≤30 miembros en su propia tabla SQLite; en cada actualización vuelve a ordenar esas ≤30 filas en memoria (trivial) y envía las nuevas clasificaciones a los clientes conectados vía un WebSocket hibernable. Esto es lo que hace que las clasificaciones de liga/salón sean "casi en tiempo real" sin una primitiva global de conjunto ordenado, que Cloudflare no ofrece de forma nativa.

**Los leaderboards global y por grado siguen una ruta distinta.** Un Worker activado por Cron (`math-challenge-leaderboard-cron`) dispara `math-challenge-leaderboard-rollup-workflow` cada 30–60 segundos. El Workflow agrega los totales (una tabla de consolidación en D1 refrescada desde SQL de Analytics Engine, o escrituras por lotes a D1), calcula el top-N por grado y a nivel global, y escribe blobs JSON en `math-challenge-leaderboard-kv`. Las lecturas son entonces simples llamadas `get()` de KV — baratas, distribuidas en el edge y explícitamente **no** en tiempo real (con hasta 30–60 s de antigüedad por diseño), lo que evita por completo el límite de KV de 1 escritura/segundo/clave.

**Costo por 1,000,000 de intentos (orden de magnitud aproximado, plan de pago):** Solicitudes de ingestión de Workers, ~1M, dentro o justo por encima del nivel incluido de 10M/mes (≤$0.30). Escrituras en Analytics Engine, 1M llamadas a `writeDataPoint()` — no se encontró un precio medido en la documentación actual; reconfirmar antes de escalar. Solicitudes a Durable Objects (DOs de liga/salón + de aprendiz, ~2 llamadas/intento), ~2M, ≈$0.15–$0.30. Filas SQLite escritas en Durable Objects, 1–2M, dentro del nivel incluido de 50M/mes a costo marginal de $0. Las escrituras de consolidación en D1 se agrupan cada 30–60 s, así que el costo no escala con el número de intentos. Las escrituras en KV ocurren una vez por clave por ciclo de consolidación, no por intento.

**Neto:** aproximadamente **$0.50–$1.00 por millón de intentos** en costo directo de primitivas, dominado por el precio de solicitudes de Workers/DO más que por almacenamiento específico del leaderboard — porque las escrituras por intento se mantienen deliberadamente fuera de D1 y de KV.

## Bosquejo del modelo de datos (D1)

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

Las filas crudas por intento están **deliberadamente ausentes** de este esquema — viven en `math-challenge-attempts-ae` (Analytics Engine) y, para cualquier cosa necesaria más allá de su retención de 3 meses, en `math-challenge-exports` (R2, vía un Pipeline periódico o un trabajo de exportación en un Worker).

## Implicaciones de diseño / riesgos

1. **El techo de 10 GB/base de datos de D1 es el primer muro duro**, alcanzado por un error de diseño (guardar intentos crudos en D1), no por crecimiento de tráfico — la mitigación con Analytics Engine debe estar ahí desde el primer commit, no añadida después [2].
2. **Un único Durable Object "global" es un anti-patrón** — un DO que maneja todo el tráfico se vuelve cuello de botella a ~500–1,000 solicitudes/s; las ligas y los salones deben fragmentarse un-DO-por-entidad desde el primer día [7].
3. **La propagación de hasta 60 segundos en el peor caso y el `cacheTtl` mínimo de 30 segundos de KV** significan que el leaderboard global/por grado nunca es verdaderamente en vivo — hay que mostrar esto en la UI ("actualizado hace un minuto") para que los niños no crean que los puntos ganados desaparecieron [11][12].
4. **El límite de 1 escritura por segundo por clave de KV** hace que cualquier diseño de "incrementar en cada intento" falle bajo carga en ráfaga — el diseño de consolidación vía Workflow escribe a un ritmo fijo en su lugar.
5. **El caché de AI Gateway no debe aplicarse de forma uniforme** — cachear un gateway de embeddings devuelve silenciosamente vectores obsoletos, así que las llamadas del tutor y las de embeddings de RAG necesitan configuraciones de caché de gateway separadas si alguna vez comparten un gateway.
6. **La replicación de lectura de D1 solo es secuencialmente consistente, con un retraso sin límite en el peor caso** — un flujo de "ver tu propia puntuación inmediatamente después de enviarla" debe usar el marcador de la Sessions API, no una lectura sin restricciones [3].
7. **El borrado bajo COPPA/GDPR-K es un problema de eliminación en cuatro sistemas**: filas de D1, almacenamiento SQLite del DO, Analytics Engine (el TTL de 3 meses ayuda pero no borra bajo demanda), y Vectorize (evitado aquí manteniendo Vectorize limitado solo al contenido curado). Los manuales de eliminación deben enumerar los cuatro.
8. **Vectorize debe permanecer limitado al banco de contenido/pistas curado**, no a embeddings por niño — el techo de 10M vectores es real a escala, y los vectores por niño son un riesgo de privacidad sin una forma limpia de borrarlos [16].
9. **La facturación de almacenamiento SQLite del DO comenzó el 7 de enero de 2026** — lo suficientemente reciente como para que los modelos de costo anteriores lo subestimen; vuelve a revisar la página de precios actual antes de hacer un plan de capacidad [9].
10. **Turnstile con usuarios jóvenes, posiblemente que aún no saben leer, no está probado aquí** — el grado más joven probablemente necesita un inicio de sesión mediado enteramente por los padres, evitando la experiencia de defensa contra bots para los niños.
11. **Web Push es inconsistente en dispositivos gestionados por escuelas** — iOS necesita una PWA instalada en la pantalla de inicio con Safari 16.4+, y los Chromebooks/iPads gestionados por MDM a menudo bloquean los avisos de instalación; se necesita una alternativa sin push (resumen por correo electrónico para los padres) para tener alcance.
12. **Cualquier consulta contra `score_totals` sin el índice compuesto eventualmente va a topar con el modo de fallo por tiempo de CPU de D1** conforme la tabla crezca — verifícalo con `EXPLAIN QUERY PLAN` antes de lanzar, no después de un incidente [5].
13. **El precio de escritura de Analytics Engine no se pudo confirmar con la documentación actual** — la estimación de costo-por-millón-de-intentos asume que está incluido en el plan de Workers; verifícalo contra la página de precios en vivo antes de que entre en un presupuesto.

## Preguntas abiertas para el dueño del proyecto

1. ¿Qué grados / rangos de edad exactos están dentro del alcance (K–2, 3–5, 6–8, 9–12, adulto)? Determina la partición del leaderboard por grado y el control de edad de COPPA (menores de 13 vs. 13+).
2. ¿Es aceptable la retención de 3 meses de Analytics Engine para el historial crudo de intentos, o un reporte de progreso año contra año requiere la ruta de archivo frío R2+Pipelines desde el primer día?
3. ¿Para qué ráfaga concurrente en el peor caso deberíamos diseñar (p. ej., un distrito completo en el mismo periodo de clase)? Define el tamaño de la granularidad de fragmentación de los DO.
4. ¿Es "tiempo real" para las clasificaciones de liga un requisito estricto de WebSocket de menos de un segundo, o es aceptable una actualización de unos pocos segundos?
5. ¿Debería existir alguna vez un nivel de tutor de IA sin límite, o siempre debe estar vigente un tope estricto de gasto diario de Claude por niño?
6. ¿Cuáles son exactamente los 5 idiomas? Determina si `m2m100` de Workers AI cubre todos los pares o si algunos necesitan traducción humana/de calidad Claude para el lanzamiento.
7. ¿Se asignan las ligas automáticamente (agrupación aleatoria) o son curadas por maestros/padres? Afecta el Workflow del ciclo de vida de la liga y si `math-challenge-league-do` necesita un paso de emparejamiento.
8. ¿Cuál es la regla de resolución de conflictos para la sincronización de progreso sin conexión de la PWA entre dos dispositivos?
9. ¿Qué enfoque de identidad se prefiere para las cuentas de los padres — enlace mágico, passkeys, o federado? Afecta dónde se coloca Turnstile y la forma de la tabla `users`.
10. ¿Cuál es el techo de gasto mensual objetivo para AI Gateway? Necesario para dimensionar de entrada las 20 reglas de límite de gasto y la política de modelo de respaldo.

## Fuentes

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — tablas de precios de D1, KV, Vectorize, Queues, Workers, Durable Objects. Consultado 2026-07-31.
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — límites de tamaño de base de datos, almacenamiento, consultas y conexiones.
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — modelo de consistencia, regiones compatibles.
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — modos de fallo por tiempo de CPU y sobrecarga.
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — facturación de cómputo y almacenamiento SQLite.
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — guía de rendimiento por objeto, anti-patrones.
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB por objeto.
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, fecha de inicio de facturación.
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — lecturas masivas, `cacheTtl`.
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — límite de 1 escritura/seg/clave, límites de escritura masiva.
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — límites de blobs/doubles/índice/retención.
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — almacenamiento, operaciones Clase A/B, salida.
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — precios por modelo (bge-m3, melotts, m2m100).
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — reglas de presupuesto, respaldo de enrutamiento dinámico, techo de 20 reglas.
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — alcance del caché y coincidencia de solicitudes idénticas.
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — límites de Cache API, límites de solicitud/respuesta.
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — comportamiento de muestreo y retención.
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — modelo de despliegue full-stack relevante para Astro en Workers.
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirma a Astro como framework compatible.
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — solicitudes, tiempo de CPU, almacenamiento, pasos.
24. Anthropic `claude-api` skill, tabla de modelos/precios cacheada (2026-06-24) — precios de Claude Opus 5 / Sonnet 5 / Haiku 4.5 usados para el plan de enrutamiento de modelos.
