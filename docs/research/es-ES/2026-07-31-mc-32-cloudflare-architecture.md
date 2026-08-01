# Arquitectura Cloudflare para Math Challenge

> Investigación Math Challenge — 2026-07-31 — tema 32

## Resumen ejecutivo (ES)

Math Challenge es una PWA de práctica matemática construida enteramente sobre Cloudflare. La arquitectura propuesta usa **Workers + Astro** para el frontend/BFF, **D1** para datos relacionales (cuentas, contenido, membresías), **Durable Objects con almacenamiento SQLite** para estado en vivo de baja cardinalidad (una liga de ~30, un aula, la sesión de un menor), **Analytics Engine** para telemetría de intentos de alto volumen (no D1 — D1 se queda sin espacio primero), **KV** para instantáneas del ranking global/por curso recalculadas periódicamente, **R2** para medios y archivo frío, **Queues + Workflows** para calificación asíncrona y generación de explicaciones de IA, **Vectorize + Workers AI** para RAG multilingüe sobre el banco de pistas, y **AI Gateway** delante de la API de Claude para cachear, limitar la tasa y establecer un límite de gasto al tutor «Larry» con enrutamiento de modelos. El límite que golpearemos primero no es cómputo: es el techo de almacenamiento de D1 (10 GB por base de datos en el plan de pago) si alguien intenta guardar cada intento ahí — por eso los intentos crudos van a Analytics Engine, no a D1.

## Executive summary (EN)
Math Challenge es una app de práctica matemática **PWA‑first** construida íntegramente en Cloudflare. La arquitectura propuesta utiliza **Workers + Astro** para el frontend/BFF, **D1** para datos relacionales (cuentas, contenido, membresías), **Durable Objects con almacenamiento SQLite** para estado en vivo de baja cardinalidad (una liga de ~30, un aula, la sesión de un niño), **Analytics Engine** para telemetría de intentos de alto volumen (no D1 — D1 se queda sin espacio de almacenamiento primero), **KV** para instantáneas del marcador global/de banda de nivel recalculadas periódicamente, **R2** para media y archivo en frío, **Queues + Workflows** para puntuación asíncrona y generación de explicaciones IA, **Vectorize + Workers AI** para RAG multilingüe sobre el banco de pistas, y **AI Gateway** delante de la API de Claude para caché, limitación de velocidad y límite de gasto del tutor «Larry» con enrutamiento de modelo. El límite que alcanzamos primero no es el cómputo — es el techo de almacenamiento de D1 (10 GB por base de datos en el plan de pago) si los intentos sin procesar se almacenan allí. Por eso los intentos sin procesar van a Analytics Engine, no a D1.

## Product-to-primitive mapping

| Funcionalidad | Primitiva | Motivo | Límite real que lo constriñe |
|---|---|---|---|
| Frontend + BFF, capa PWA | Workers (Astro vía `@astrojs/cloudflare`, activos estáticos) | El monorepo ya ejecuta Astro en Workers; la auto‑configuración del framework para Astro existe desde diciembre de 2025 [22][23] | Límites de CPU por solicitud en Workers — no es una restricción a corto plazo |
| Cuentas de padres/hijos/profesores, catálogo de contenido, membresías | D1 | Relacional, transaccional, económico a esta escala | 10 GB/base de datos (de pago), 500 MB (gratuita); 50.000 DBs/cuenta, 1 TB/cuenta [2] |
| Telemetría por intento (decenas de miles de usuarios × muchos intentos/día) | Analytics Engine | Diseñado precisamente para esto: eventos de alta cardinalidad con muchas escrituras, sin modelo de facturación por fila como D1 | 20 blobs / 20 doubles / 1 índice (96 B) por punto, 250 puntos por invocación de Worker, retención de 3 meses [13] |
| Clasificaciones en tiempo real de liga (~30) y aula | Durable Objects (SQLite storage) | Un DO por liga/aula mantiene la tasa de peticiones por objeto baja (~30 escritores), ordenar en memoria 30 filas es trivial, la hibernación de WebSocket ofrece push casi en tiempo real con coste de inactividad casi nulo | Techo de rendimiento suave ~500–1.000 req/s por DO individual — debe fragmentarse por liga/aula, nunca un DO global [7] |
| Ranking global / por curso | KV (instantánea precomputada) + Workflow/Cron rollup | La lectura de KV está en caché en el edge y es económica a escala de fan‑out; una vista global ordenada no necesita frescura subsegundo | KV: 1 escritura/seg por clave, `cacheTtl` mínimo 30 s — no se puede escribir por intento, debe agruparse [9][11][12] |
| Modelo adaptativo de aprendizaje por menor | Durable Object (SQLite) o consolidación en D1, leído por Worker al seleccionar la pregunta | Requiere lecturas/escrituras de baja latencia co‑localizadas con el cómputo; el DO brinda aislamiento por menor | 10 GB de almacenamiento por objeto DO [8] |
| Banco de contenido (5 idiomas, miles de ítems) | D1 (metadata) + R2 (activos multimedia: imágenes/audio) | D1 para filas estructuradas consultables; R2 para activos binarios grandes, sin tarifa de salida | R2 no dispone de lenguaje de consulta propio — combinar con índice D1 |
| Tutor IA «Larry» (API de Claude, enrutamiento de modelos) | Workers → AI Gateway → Claude API | AI Gateway proporciona caché, límites de tasa y límites de gasto por usuario delante de la llamada al modelo | AI Gateway: máximo 20 reglas de límite de gasto/pasarela [Spend limits] |
| Inferencia local económica: embeddings, TTS, traducción | Workers AI | Se ejecuta en la red de Cloudflare, sin viajes externos, precios por modelo | p. ej., bge-m3 $0,012/M tokens de entrada [17] |
| RAG sobre el banco de pistas/explicaciones | Vectorize (embeddings from bge-m3) | El modelo de embeddings multilingüe cumple con el requisito de 5 idiomas | 10 M vectores/índice, 1.536 dims máx [16] |
| Puntuación asíncrona, generación de explicaciones IA | Queues + Workflows | Desacopla la solicitud de envío de intento de la generación más lenta de explicaciones IA; los Workflows proporcionan reintentos duraderos | Queues: 64 KB por unidad de operación, 100 K ops/día gratuitas [Queues pricing]; Workflows: 500 K pasos incluidos/mes [Workflows pricing] |
| Notificaciones push | Web Push (via a Worker sending payloads) + PWA service worker | No es un producto CF distinto — Workers solo envía; el navegador/SO gestiona la entrega | Web Push en iOS requiere Safari 16.4+ instalado en pantalla de inicio; es inconsistente en Chromebooks/iPads gestionados por centros educativos |
| Juego sin conexión | PWA service worker + Cache API + background sync to `math-challenge-ingest` | La API de caché es por Worker, no compartida globalmente | 512 MB objeto máximo en caché, 1.000 llamadas a la API de caché por solicitud (de pago) [20] |
| Defensa contra bots en registro/inicio de sesión | Turnstile | Gratuita, WCAG 2.2 AA, modos no interactivos/invisibles adecuados para niños | No se encontró límite de tasa estricto en la documentación; verificar los límites del plan actual antes del lanzamiento |
| Analítica del sitio respetuosa con la privacidad | Web Analytics | RUM sin cookies, con conmutador de exclusión UE | Retención sin muestreo de 7 días, luego muestreo de ~10 % [Web Analytics FAQ] |
| Control de costes del gasto en Claude | AI Gateway (Unified Billing, spend limits, dynamic routing/fallback) | Un único punto para ver y limitar todo el coste del tutor | 20 reglas de límite de gasto/pasarela |
| Hyperdrive | *(not used)* | No hay Postgres/MySQL externo en este diseño — D1 es el sistema de registro | N/A |
| Images/Stream | *(not used at launch)* | El contenido son ilustraciones + audio corto, servidos directamente desde R2; reconsiderar si se añaden lecciones en vídeo | N/A |

## Hallazgos — notas por servicio

**D1.** Límites del plan de pago: 10 GB por base de datos, 50.000 bases de datos por cuenta, 1 TB de almacenamiento total por cuenta, duración máxima de consulta de 30 s, sentencia SQL máxima de 100 KB, fila/BLOB máximo de 2 MB, 6 conexiones simultáneas por Worker, 1.000 consultas por invocación de Worker [2]. Precio: 25 mil millones de filas leídas incluidas al mes, luego 0,001 $/millón; 50 millones de filas escritas incluidas, luego 1,00 $/millón; almacenamiento 0,75 $/GB‑mes más allá de los 5 GB incluidos [1]. **La replicación de lectura** está en beta pública a través de la API Sessions, usando marcadores para consistencia secuencial («lee tus propias escrituras», lecturas monótonas); Cloudflare crea automáticamente una réplica por región admitida (ENAM, WNAM, WEUR, EEUR, APAC, OC) sin coste adicional — la facturación no cambia [3][4]. El retardo de la réplica es ilimitado en el peor caso, por lo que cualquier flujo «aquí tienes tu nueva puntuación» debe anclarse al marcador de la sesión de escritura, no a una lectura sin restricciones.

**Objetos duraderos.** El almacenamiento SQLite está en GA con 10 GB por objeto [8]; un techo de rendimiento suave de aproximadamente 500–1.000 peticiones/segundo se aplica **por objeto**, no por espacio de nombres — la propia guía de Cloudflare considera que un único DO «global» es un anti‑patrón y requiere fragmentar por límites naturales (por sala, por usuario, por liga) [7]. Cómputo (de pago): 1 M de peticiones al mes incluidas, luego 0,15 $/millón; 400.000 GB‑segundo incluidos, luego 12,50 $/millón de GB‑s [1]. La facturación del almacenamiento para DOs basados en SQLite (las filas replican las tarifas de D1; almacenamiento 0,20 $/GB‑mes) comenzó el January 7, 2026 — suficientemente reciente como para que los modelos de coste anteriores lo subestimen [1][9].

**Workers KV.** Pagado: 10 M de lecturas al mes incluidas, luego 0,50 $/millón; 1 M de escrituras/borrados/listados incluidos, luego 5,00 $/millón; 1 GB de almacenamiento incluido, luego 0,50 $/GB‑mes [Workers pricing]. Consistencia eventual: las escrituras se propagan en un máximo de 60 s a nivel mundial, o según el `cacheTtl` que establezcas — el `cacheTtl` mínimo se redujo a 30 s en 2026 [12]. **Solo se permite una escritura por clave por segundo**; más desencadena errores 429 [11]. Lecturas masivas (100 claves) y escrituras masivas (10.000 pares, ≤100 MB) están disponibles a través de la API REST [10][11]. Esto hace que KV sea inadecuado para actualizaciones por intento y adecuado para instantáneas refrescadas periódicamente.

**Analytics Engine.** `writeDataPoint()` acepta hasta 20 blobs, 20 dobles, 1 índice (≤96 bytes); una invocación de Worker puede escribir como máximo 250 puntos de datos; la carga del blob está limitada a 16 KB/punto; la retención es de tres meses [13]. No se encontró un precio separado por escritura en los documentos obtenidos — trátalo como incluido en el plan Workers y reconfirma antes de comprometerte con un presupuesto de volumen; es la única cifra que este informe no pudo obtener con certeza.

**Colas.** Una «operación» se factura por bloque de 64 KB leído/escrito/borrado; entregar un mensaje suele costar 3 operaciones. Gratis: 10.000 ops/día. De pago: 1 M de ops al mes incluidas, luego 0,40 $/millón. La retención es de 4 días por defecto, hasta 14 configurables [Queues pricing].

**Workflows.** Solicitudes y tiempo de CPU comparten los pools de Workers (10 M de solicitudes + 0,30 $/millón adicionales; 30 M de CPU‑ms + 0,02 $/millón adicionales); almacenamiento 1 GB + 0,20 $/GB‑mes; pasos 500.000 al mes incluidos + 0,80 $/100.000 adicionales [Workflows pricing]. La facturación de pasos/almacenamiento no había comenzado según el registro de cambios citado — confirma la fecha de inicio antes de finalizar los modelos de coste.

**R2.** Almacenamiento 0,015 $/GB‑mes; Clase A (tipo escritura) 4,50 $/millón; Clase B (tipo lectura) 0,36 $/millón; salida sin coste. Nivel gratuito: 10 GB‑mes de almacenamiento, 1 M de Clase A, 10 M de Clase B al mes [R2 pricing]. La ausencia de tarifa de salida es relevante para archivo en frío: las exportaciones por lotes o extracciones para entrenamiento no cuestan nada al leerse.

**Vectorize.** Los índices ahora admiten hasta 10 M de vectores (aumento desde 5 M el 2026-01-23), limitados a 1.536 dimensiones por vector [16]. Precio: 50 M de dimensiones consultadas incluidas al mes, luego 0,01 $/millón; 10 M de dimensiones almacenadas incluidas, luego 0,05 $/100 millones [1].

**Workers AI.** Precios representativos: `@cf/baai/bge-m3` (embeddings multilingües, coincide con el banco de 5 idiomas) 0,012 $/M de tokens de entrada; `@cf/myshell-ai/melotts` (TTS) 0,0002 $/minuto de audio; `@cf/meta/m2m100-1.2b` (traducción) 0,342 $/M de tokens de entrada/salida [17] — lo suficientemente barato para ejecutarse en tiempo de creación de contenido, no por solicitud.

**AI Gateway.** El almacenamiento en caché se aplica solo a peticiones idénticas de texto/imagen, sin caché semántica [Caching doc]. Los límites de gasto son presupuestos basados en coste delimitados por modelo/proveedor/metadatos personalizados (p. ej., por niño, por día), limitados a 20 reglas por gateway [Spend limits doc]. El enrutamiento dinámico puede retroceder a un modelo más barato automáticamente cuando se alcanza un presupuesto, en lugar de bloquear la petición de forma rígida.

**Turnstile.** Gratis, WCAG 2.2 AA, ofrece modos no interactivos y totalmente invisibles adecuados para un flujo de registro infantil. No se encontró un límite estricto de volumen de peticiones en las páginas obtenidas; confirma los límites del plan actual antes del lanzamiento.

**Web Analytics.** Gratis, RUM sin cookies. Los datos de beacon sin muestrear se conservan 7 días y luego se agregan a un muestreo de ~10 %; los visitantes de la UE pueden excluirse con un clic [Web Analytics FAQ].

**Cache API.** Caché por centro de datos, por Worker, distinta de la caché de zona. Objeto máximo 512 MB; 1.000 llamadas `put()`/`match()`/`delete()` por solicitud en la versión de pago (50 gratuitas), compartiendo la cuota de subpeticiones [20].

**Claude API / enrutamiento de modelo.** Precios actuales (del skill `claude-api` incluido, cached 2026-06-24): Opus 5 5 $/25 $ por millón de tokens de entrada/salida; Sonnet 5 3 $/15 $ (intro 2 $/10 $ hasta 2026-08-31); Haiku 4.5 1 $/5 $. El plan de enrutamiento de Larry: Sonnet 5 como explicador por defecto, Haiku 4.5 para micro‑copias baratas y de gran volumen, y una rara escalada al nivel Opus solo para las explicaciones multi‑paso más difíciles — todo regulado por los límites de gasto del AI Gateway por niño al día.

## Inventario de recursos propuesto

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Type | Propósito (EN) | Propósito (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Public PWA frontend + BFF routes | Frontend PWA público + rutas BFF | n/a (entry Worker) |
| `math-challenge-ingest` | Worker | Validates and ingests attempt submissions; writes telemetry, enqueues scoring | Valida e ingiere envíos de intentos; escribe telemetría, encola la puntuación | n/a |
| `math-challenge-tutor` | Worker | Hosts "Larry" AI tutor; calls Claude via AI Gateway with RAG | Aloja al tutor de IA «Larry»; llama a Claude a través del AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Triggers the periodic leaderboard rollup Workflow | Dispara el Workflow periódico de recalculo de la tabla de clasificación | n/a |
| `math-challenge-db` | D1 database | System of record: users, children, classrooms, leagues, content metadata, consent | Registro maestro: usuarios, niños, aulas, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Live state + WebSocket broadcast for one league of ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Live state for one classroom's roster and in-class standings | Estado en vivo de la lista y clasificación de un aula | `CLASSROOM_DO` |
| `math-challenge-learner-do` | Durable Object class (SQLite) | Per-child adaptive learner model (mastery estimates, item selection state) | Modelo de aprendizaje adaptativo por niño | `LEARNER_DO` |
| `math-challenge-ratelimiter-do` | Durable Object class (SQLite) | Sharded rate limiting (login attempts, tutor calls, signup) | Limitación de tasa fragmentada (inicios de sesión, llamadas al tutor, inscripción) | `RATE_LIMITER_DO` |
| `math-challenge-leaderboard-kv` | KV namespace | Precomputed global/grade-band leaderboard snapshots | Instantáneas precalculadas de la tabla de clasificación global/por‑grado | `LEADERBOARD_KV` |
| `math-challenge-config-kv` | KV namespace | Feature flags and content-catalog cache | Feature flags y caché del catálogo de contenido | `CONFIG_KV` |
| `math-challenge-session-kv` | KV namespace | Short-lived auth/session tokens | Tokens de sesión/autenticación de corta duración | `SESSION_KV` |
| `math-challenge-media` | R2 bucket | Item images, audio, illustrations | Imágenes, audio e ilustraciones de los ítems | `MEDIA_BUCKET` |
| `math-challenge-exports` | R2 bucket | Cold archive of aged-out attempts; COPPA/GDPR data-subject exports | Archivo frío de intentos caducados; exportaciones para solicitudes COPPA/GDPR | `EXPORTS_BUCKET` |
| `math-challenge-scoring-queue` | Queue | Async scoring + learner-model update jobs | Trabajos asíncronos de calificación y actualización del modelo de aprendizaje | `SCORING_QUEUE` |
| `math-challenge-scoring-dlq` | Queue (dead-letter) | Failed scoring jobs after max retries | Trabajos de calificación fallidos tras reintentos máximos | `SCORING_DLQ` |
| `math-challenge-ai-explain-queue` | Queue | Async AI-explanation generation requests | Solicitudes asíncronas de generación de explicaciones de IA | `AI_EXPLAIN_QUEUE` |
| `math-challenge-ai-explain-dlq` | Queue (dead-letter) | Failed explanation jobs after max retries | Trabajos de explicación fallidos tras reintentos máximos | `AI_EXPLAIN_DLQ` |
| `math-challenge-leaderboard-rollup-workflow` | Workflow | Periodic global/grade-band leaderboard computation | Cálculo periódico de la tabla de clasificación global/por‑grado | `LEADERBOARD_WORKFLOW` |
| `math-challenge-onboarding-workflow` | Workflow | Multi-step account + child-profile + consent setup | Configuración multi-paso de cuenta + perfil de niño + consentimiento | `ONBOARDING_WORKFLOW` |
| `math-challenge-explanations-index` | Vectorize index | Multilingual RAG index over curated hints/explanations | Índice RAG multilingüe sobre pistas/explicaciones curadas | `EXPLANATIONS_INDEX` |
| `math-challenge-tutor-gateway` | AI Gateway | Caching, rate limits, spend limits, model routing for Claude calls | Caché, límites de tasa, límites de gasto y enrutamiento de modelos para Claude | (gateway ID in `ANTHROPIC_BASE_URL`) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Per-attempt telemetry (high-cardinality, high-volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Tutor usage/cost telemetry (per-child, per-model) | Telemetría de uso/coste del tutor (por niño, por modelo) | `TUTOR_AE` |
| `math-challenge-turnstile-signup` | Turnstile widget | Bot defense on signup/login forms | Defensa contra bots en formularios de registro/inicio de sesión | (site key/secret via env) |
| `math-challenge-web-analytics` | Web Analytics site | Privacy-first RUM for the PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Holds `ANTHROPIC_API_KEY` and other third-party credentials | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |

## Diseño de la tabla de clasificación

**Ruta de escritura.** Un cliente envía un intento a `math-challenge-ingest`. El Worker: (1) escribe un punto de datos de Analytics Engine (telemetría cruda — no una escritura de fila en D1), (2) realiza RPC al `math-challenge-learner-do` del niño para actualizar el estado de maestría, (3) realiza RPC al `math-challenge-league-do` y/o al `math-challenge-classroom-do` correspondiente con el delta de puntuación. Cada DO de liga/aula mantiene las puntuaciones de sus ≤30 miembros en su propia tabla SQLite; en cada actualización vuelve a ordenar esas ≤30 filas en memoria (trivial) y envía las nuevas clasificaciones a los clientes conectados mediante un WebSocket hibernable. Esto es lo que hace que las clasificaciones de liga/aula sean “casi en tiempo real” sin una primitiva global de conjunto ordenado, que Cloudflare no ofrece de forma nativa.

**Las tablas de clasificación globales y por franjas de grado siguen un camino diferente.** El Worker activado por Cron (`math-challenge-leaderboard-cron`) dispara `math-challenge-leaderboard-rollup-workflow` cada 30–60 segundos. El Workflow agrega totales (una tabla de consolidación D1 actualizada desde Analytics Engine SQL, o escrituras D1 por lotes), calcula los N mejores por franja de grado y a nivel global, y escribe blobs JSON en `math-challenge-leaderboard-kv`. Las lecturas son entonces simples llamadas KV `get()` — baratas, distribuidas en el edge y explícitamente **no** en tiempo real (con una latencia de 30–60 s por diseño), lo que evita por completo el límite de 1 escritura/segundo/clave de KV.

**Coste por 1.000.000 de intentos (orden de magnitud aproximado, plan de pago):**  
- Solicitudes de ingestión de Workers, ~1 M, dentro o justo por encima del nivel incluido de 10 M/mes (≤0,30 $).  
- Escrituras en Analytics Engine, 1 M llamadas `writeDataPoint()` — no se ha encontrado precio medido en la documentación actual; reconfirmar antes de escalar.  
- Solicitudes a Durable Objects (ligas/aulas + DOs de aprendiz, ~2 llamadas/intent, ~2 M, ≈0,15–0,30 $).  
- Filas SQLite escritas en Durable Objects, 1–2 M, dentro del nivel incluido de 50 M/mes con coste marginal de 0 $.  
- Las escrituras de consolidación D1 se agrupan cada 30–60 s, por lo que el coste no escala con el número de intentos.  
- Las escrituras KV se realizan una vez por clave por ciclo de consolidación, no por intento.

**Resultado neto:** aproximadamente **0,50–1,00 $ por millón de intentos** en coste directo de primitivas, dominado por la tarificación de solicitudes de Workers/DO más que por el almacenamiento específico de la tabla de clasificación — porque las escrituras por intento se mantienen deliberadamente fuera de D1 y KV.

## Esquema del modelo de datos (D1)

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

Las filas crudas por intento están **deliberadamente ausentes** de este esquema — residen en `math-challenge-attempts-ae` (Analytics Engine) y, para cualquier cosa que se necesite más allá de su retención de 3 meses, en `math-challenge-exports` (R2, mediante un Pipeline periódico o un trabajo de exportación de Worker).

## Implicaciones de diseño / riesgos

1. **El límite de 10 GB/base de datos de D1 es la primera barrera dura**, alcanzado por un error de diseño (almacenar intentos crudos en D1), no por el crecimiento del tráfico — la mitigación mediante Analytics Engine debe estar presente desde el primer commit, no añadida retroactivamente [2].

2. **Un único "global" Durable Object es un anti‑patrón** — un DO que gestiona todos los cuellos de botella del tráfico a ~500–1.000 req/s; las ligas y aulas deben fragmentarse con un DO por entidad desde el primer día [7].

3. **La propagación peor‑caso de 60 segundos y el `cacheTtl` mínimo de 30 segundos de KV** hacen que la tabla de clasificación global/por franja de curso nunca esté realmente en tiempo real — muéstrelo en la UI ("actualizado hace un minuto") para que los niños no crean que los puntos obtenidos han desaparecido [11][12].

4. **El límite de 1 escritura‑por‑segundo‑por‑clave de KV** hace que cualquier diseño de "incrementar en cada intento" falle bajo carga de ráfaga — el diseño de acumulación mediante Workflow escribe a un ritmo fijo en su lugar.

5. **La caché del AI Gateway no debe aplicarse de forma uniforme** — almacenar en caché un gateway de incrustaciones devuelve silenciosamente vectores obsoletos, por lo que las llamadas al tutor y a la incrustación RAG necesitan configuraciones de caché de gateway separadas si alguna vez comparten un gateway.

6. **La replicación de lecturas de D1 es solo secuencialmente consistente, con retardo peor‑caso sin límite** — un flujo de "ver tu propia puntuación inmediatamente después de enviarla" debe usar el marcador de la Sessions API, no una lectura sin restricciones [3].

7. **El borrado bajo COPPA/GDPR‑K es un problema de eliminación en cuatro sistemas**: filas de D1, almacenamiento SQLite del DO, Analytics Engine (el TTL de 3 meses ayuda pero no borra a demanda) y Vectorize (evitado aquí manteniendo Vectorize limitado al contenido curado únicamente). Los manuales de eliminación deben enumerar los cuatro.

8. **Vectorize debe permanecer limitado al banco de contenido/ pistas curado**, no a incrustaciones por niño — el techo de 10 M‑vectores es real a escala, y los vectores por niño suponen una vulnerabilidad de privacidad sin una historia de borrado limpia [16].

9. **La facturación del almacenamiento SQLite del DO comenzó el 7 de enero de 2026** — lo suficientemente reciente como para que los modelos de coste anteriores lo subestimen; vuelva a comprobar la página de precios actual antes de un plan de capacidad [9].

10. **Turnstile con usuarios jóvenes, posiblemente no lectores, no está probado aquí** — la franja de curso más joven probablemente necesite un inicio de sesión mediado por los padres, evitando la experiencia de defensa contra bots para los niños.

11. **Web Push es inconsistente en dispositivos gestionados por la escuela** — iOS requiere una PWA instalada en la pantalla de inicio en Safari 16.4+, y los Chromebooks/iPads gestionados por MDM a menudo bloquean los avisos de instalación; se necesita una alternativa sin push (resumen por correo electrónico para padres) para alcanzar a los usuarios.

12. **Cualquier consulta a `score_totals` sin el índice compuesto eventualmente alcanzará el modo de fallo por tiempo de CPU de D1** a medida que la tabla crezca — verifíquelo con `EXPLAIN QUERY PLAN` antes de lanzar, no tras un incidente [5].

13. **No se pudo confirmar el precio de escritura del Analytics Engine a partir de la documentación actual** — la estimación de coste‑por‑millón‑de‑intentos asume que está incluido en el plan Workers; verifíquelo contra la página de precios en vivo antes de que entre en un presupuesto.

## Preguntas abiertas para el propietario del proyecto

1. ¿Qué franjas de curso / rangos de edad exactos están dentro del alcance (K–2, 3–5, 6–8, 9–12, adulto)? Conduce la partición de la tabla de clasificación por franja de curso y la limitación de edad según COPPA (menores de 13 frente a 13 años o más).

2. ¿Es aceptable una retención de 3 meses en Analytics Engine para el historial de intentos crudos, o un informe de progreso año tras año requiere la ruta de archivo en frío R2+Pipelines desde el primer día?

3. ¿Para qué ráfaga concurrente peor‑caso deberíamos diseñar (p. ej., un distrito entero en el mismo periodo de clase)? Tamaños de granularidad de fragmentación del DO.

4. ¿Es "tiempo real" para las clasificaciones de ligas un requisito estricto de WebSocket de menos de un segundo, o es aceptable una actualización de unos pocos segundos?

5. ¿Debería existir alguna vez un nivel de AI‑tutor sin límite, o siempre se aplicará un estricto límite diario de gasto de Claude por niño?

6. ¿Cuáles son exactamente los 5 idiomas? Determina si `m2m100` de Workers AI cubre todos los pares o si algunos necesitan traducción humana/de calidad Claude para el lanzamiento.

7. ¿Se asignan las ligas automáticamente (cohortes aleatorias) o son curadas por profesores/padres? Afecta el flujo de trabajo del ciclo de vida de la liga y si `math-challenge-league-do` necesita un paso de emparejamiento.

8. ¿Cuál es la regla de resolución de conflictos para la sincronización offline de progreso de la PWA entre dos dispositivos?

9. ¿Qué enfoque de identidad se prefiere para las cuentas de padres — enlace mágico, claves de paso o federado? Afecta dónde se sitúa Turnstile y la estructura de la tabla `users`.

10. ¿Cuál es el techo de gasto mensual objetivo para AI Gateway? Necesario para dimensionar las 20 reglas de límite de gasto y la política de modelo de respaldo desde el principio.

## Sources

1. [Workers Platform Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — tablas de precios de la plataforma Workers (D1, KV, Vectorize, Queues, Workers y Durable Objects). Accedido 2026-07-31.  
2. [D1 Platform Limits](https://developers.cloudflare.com/d1/platform/limits/) — límites de la plataforma D1: tamaño de la base de datos, almacenamiento, consultas y conexiones.  
3. [D1 Read Replication (best practices)](https://developers.cloudflare.com/d1/best-practices/read-replication/) — replicación de lectura D1 (mejores prácticas): modelo de consistencia y regiones admitidas.  
4. [D1 Read Replication Public Beta (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-10-d1-read-replication-beta/) — 2025-04-10.  
5. [D1 Debug / Error Reference](https://developers.cloudflare.com/d1/observability/debug-d1/) — referencia de depuración/errores D1: modos de fallo por tiempo de CPU y sobrecarga.  
6. [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) — precios de Durable Objects: facturación de cómputo y almacenamiento SQLite.  
7. [Durable Objects: Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/) — reglas de Durable Objects: guía de rendimiento por objeto y anti‑patrones.  
8. [SQLite in Durable Objects GA (changelog)](https://developers.cloudflare.com/changelog/post/2025-04-07-sqlite-in-durable-objects-ga/) — 2025-04-07, 10 GB por objeto.  
9. [Billing for SQLite Storage (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-12-durable-objects-sqlite-storage-billing/) — 2025-12-12, fecha de inicio de facturación.  
10. [KV: Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/) — lecturas masivas de KV, `cacheTtl`.  
11. [KV: Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — límite de 1 escritura/segundo/clave, límites de escritura masiva.  
12. [Reduced minimum cacheTtl for Workers KV (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-30-kv-reduced-minimum-cachettl/) — 2026-01-30.  
13. [Workers Analytics Engine — data point limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/) — límites de puntos de datos: blobs, doubles, índices y retención.  
14. [R2 Pricing](https://developers.cloudflare.com/r2/pricing/) — precios de R2: almacenamiento, operaciones Clase A/B y salida de datos.  
15. [Vectorize indexes now support up to 10 million vectors (changelog)](https://developers.cloudflare.com/changelog/post/2026-01-23-increased-index-capacity/) — 2026-01-23.  
16. [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) — precios por modelo (bge-m3, melotts, m2m100).  
17. [AI Gateway: Spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/) — límites de gasto: normas presupuestarias, reserva de ruta dinámica y techo de 20 normas.  
18. [AI Gateway: Caching](https://developers.cloudflare.com/ai-gateway/features/caching/) — caché del AI Gateway: ámbito de la caché y coincidencia de peticiones idénticas.  
19. [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) — límites de la plataforma Workers: límites de la API de caché y de peticiones/respuestas.  
20. [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — preguntas frecuentes de Cloudflare Web Analytics: comportamiento de muestreo y retención.  
21. [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — recursos estáticos de Workers: modelo de despliegue full-stack relevante para Astro en Workers.  
22. [Configure your framework for Cloudflare automatically (changelog)](https://developers.cloudflare.com/changelog/post/2025-12-16-wrangler-autoconfig/) — 2025-12-16, confirma que Astro es un framework compatible.  
23. [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/) — precios de Workflows: peticiones, tiempo de CPU, almacenamiento y pasos.  
24. Anthropic `claude-api` skill, cached model/pricing table (2026-06-24) — precios de Claude Opus 5 / Sonnet 5 / Haiku 4.5 utilizados para el plan de enrutamiento de modelos.
