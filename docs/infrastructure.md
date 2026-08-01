# Math Challenge — Infraestructura Cloudflare

> **Inventario canónico de objetos.** Todo objeto que Math Challenge crea en la
> cuenta de Cloudflare lleva el prefijo `math-challenge-` para distinguirlo de
> los de IOS y de IMP, que viven en la misma cuenta.
>
> **Estado: 5 de 27 objetos creados.** El resto de esta lista es lo que se va a
> crear, no lo que está creado. Conforme se creen, se anota el ID real y la fecha
> en la bitácora de abajo, según la regla de `CLAUDE.md` § Cloudflare.
>
> Bilingüe (EN/ES) porque la columna de propósito la lee tanto quien opera la
> cuenta como quien escribe el código.
>
> **Origen:** derivado de `research/2026-07-31-mc-32-cloudflare-architecture.md`,
> donde cada límite y cada precio está citado contra una página de documentación
> de Cloudflare efectivamente descargada. Si necesitas el *porqué* de una
> elección, está allá; aquí está el *qué*.

## Regla de nombres

```
math-challenge-<qué-es>[-<tipo>]
```

Los bindings van en `UPPER_SNAKE_CASE`. El prefijo nunca se omite, ni siquiera en
entornos de prueba — ahí se sufija: `math-challenge-db-dev`.

## Decisiones estructurales que explican esta lista

1. **Los intentos NO van a D1.** D1 topa en 10 GB por base y sería la primera
   pared que golpeamos. Los millones de intentos crudos van a Analytics Engine.
2. **Un Durable Object por liga y por salón**, no uno global. Cada liga tiene
   ~30 miembros y su propio estado en vivo por WebSocket.
3. **Un Durable Object por niño** para el modelo adaptativo, porque la selección
   del siguiente ítem necesita estado consistente y de baja latencia.
4. **KV guarda instantáneas del tablero**, nunca escrituras por intento — KV
   admite una escritura por segundo por llave.
5. **AI Gateway va delante de Claude siempre**, para caché, límite de gasto por
   perfil y ruteo de modelo por banda de dificultad.

## Inventario de objetos / Resource inventory

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Type | Purpose (EN) | Propósito (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Public PWA frontend + BFF routes | Frontend PWA público + rutas BFF | n/a (entry Worker) |
| `math-challenge-ingest` | Worker | Validates and ingests attempt submissions; writes telemetry, enqueues scoring | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | `INGEST` (service binding desde web) |
| `math-challenge-tutor` | Worker | Hosts "Larry" AI tutor; calls Claude via AI Gateway with RAG | Aloja al tutor de IA "Larry"; llama a Claude vía AI Gateway con RAG | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Triggers the periodic leaderboard rollup Workflow | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | System of record: users, children, classrooms, leagues, content metadata, consent | Registro maestro: usuarios, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Live state + WebSocket broadcast for one league of ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Live state for one classroom's roster and in-class standings | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-db` · migración `0003_accounts_onboarding.sql` | D1 schema | Accounts and onboarding: derived signup columns, consent catalog with abort trigger, household devices, teacher verification, contextual marks | Cuentas y onboarding: columnas derivadas del registro, catálogo de consentimiento con trigger de aborto, dispositivos de la casa, verificación de maestro, marcas contextuales | `DB` |
| `math-challenge-db` · migración `0004_consent_governance.sql` | D1 schema | One governed consent path: consent_records frozen by trigger, consent_version and current_version added, cookie mc_h corrected to D1 | Un solo camino de consentimiento con gobierno: consent_records congelada por trigger, consent_version y current_version añadidas, cookie mc_h corregida a D1 | `DB` |
| `math-challenge-db` · migración `0005_group_owner_identity.sql` | D1 schema | teacher_verifications renamed to group_owner_identity: this product does not verify anyone is a teacher. `assurance='declared'` means the person wrote it and nobody checked, and that is what the parent is shown | teacher_verifications renombrada a group_owner_identity: este producto no verifica que nadie sea maestro. `assurance='declared'` significa que lo escribió esa persona y nadie lo comprobó, y eso es lo que se le muestra al padre | `DB` |
| `math-challenge-sesion-reto-do` | Durable Object class (SQLite) | One challenge session: two server timestamps, idempotent scoring by (session, order), safe cut point | Una sesión de reto: los dos sellos del servidor, puntuación idempotente por (sesión, orden), punto seguro de corte | `SESION_RETO_DO` |
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
| `math-challenge-vitals-ae` | Analytics Engine dataset | Field Core Web Vitals (LCP/CLS/INP/TTFB/FCP); never written from a child surface | Core Web Vitals de campo; jamás se escribe desde una superficie de niño (D-037) | `VITALS_AE` |
| `math-challenge-funnel-ae` | Analytics Engine dataset | Activation funnel for the ADULT: signup, first child profile, first household device. Never a child — D-037 and red line #2 | Embudo de activación del ADULTO: registro, primer perfil de niño, primer dispositivo de la casa. Nunca un niño — D-037 y línea roja #2 | `FUNNEL_AE` |
| `math-challenge-ratelimiter-do` | Durable Object | Rate limiter, one instance per (action, IP). A counter needs read-and-write without a race; KV is eventually consistent and allows one write per second per key | Limitador de tasa, una instancia por (acción, IP). Un contador necesita leer y escribir sin carrera; KV es eventualmente consistente y admite una escritura por segundo por llave | `RATE_LIMITER` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Tutor usage/cost telemetry (per-child, per-model) | Telemetría de uso/costo del tutor (por niño, por modelo) | `TUTOR_AE` |
| `kilowatto` ⚠️ sin prefijo, ver D-054 | Turnstile widget | Bot defense on signup forms. REUSED: a Turnstile widget belongs to a hostname list, not to a project, and math.kilowatto.com lives inside kilowatto.com | Defensa contra bots en el formulario de registro. REUSADO: un widget de Turnstile pertenece a una lista de hostnames, no a un proyecto, y math.kilowatto.com vive dentro de kilowatto.com | `TURNSTILE_SITE_KEY` (público, var) · `TURNSTILE_SECRET_KEY` (secreto) |
| `math-challenge-web-analytics` | Web Analytics site | Privacy-first RUM for the PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Holds `ANTHROPIC_API_KEY` and other third-party credentials | Contiene `ANTHROPIC_API_KEY` y otras credenciales de terceros | via `wrangler secret put` |


## Bitácora de creación / Creation log

| Fecha | Objeto | ID real | Quién | Nota |
|-------|--------|---------|-------|------|
| 2026-07-31 | `math-challenge-db` (D1) | `25276cac-2d48-4771-87c1-f58bc8722b4e` | Esteban | Región **WNAM**. Migraciones 0001 y 0002 aplicadas en local y remoto; 10 tablas. Binding `DB`, no el `math_challenge_db` que sugiere wrangler |
| 2026-07-31 | `math-challenge-session-kv` (KV) | `c7157f96cd7d478ca8bd0190ef396239` | Esteban | Binding `SESSION_KV`. **Solo tokens efímeros** hasta verificar residencia de KV con Cloudflare |
| 2026-07-31 | `math-challenge-config-kv` (KV) | `76bfad78247544bbb8fbd447a06ad933` | Esteban | Binding `CONFIG_KV` |
| 2026-07-31 | `math-challenge-media` (R2) | *(el nombre es el id)* | Esteban | Binding `MEDIA_BUCKET`. Arte de la Sabana, imágenes y audio |
| 2026-07-31 | `math-challenge-exports` (R2) | *(el nombre es el id)* | Esteban | Binding `EXPORTS_BUCKET`. Archivo frío y exportaciones COPPA/GDPR |

> **Regla:** quien crea un recurso de Cloudflare escribe su renglón aquí en el
> mismo PR (`CLAUDE.md` § Cloudflare).

### Ajustes de zona (no son objetos, pero se rompen igual)

Estos no aparecen en el inventario porque no son objetos de la cuenta, sino
ajustes de la zona `kilowatto.com`. Se anotan porque nada en el repositorio los
declara: si alguien los apaga, el código no se entera.

| Ajuste | Estado | Evidencia | Fecha |
|--------|--------|-----------|-------|
| HTTP/2 | activo | — | 2026-07-31 |
| HTTP/2 to Origin | activo | — | 2026-07-31 |
| HTTP/3 (con QUIC) | activo | `alt-svc: h3=":443"` | 2026-07-31 |
| **0-RTT Connection Resumption** | **activo** | ticket TLS 1.3 con `Max Early Data: 14336` | 2026-07-31 |
| Enhanced HTTP/2 Prioritization | no disponible | requiere plan Pro; la zona es Free | — |

`audits/live.mjs` verifica HTTP/3 y 0-RTT en cada corrida, así que un apagón
accidental se detecta al desplegar en vez de meses después. Están en
**Speed → Optimization → Protocol Optimization**.

### Lo que quedó decidido sin decidirse: la jurisdicción

`math-challenge-db` se creó en **WNAM** (Norteamérica oeste). Eso importa más de
lo que parece: `mc-25` documenta que D1 tiene ajuste de jurisdicción por base de
datos desde noviembre de 2025, y que —igual que en R2— **se fija al crear y no se
puede cambiar después**.

Es decir, esta base **no puede convertirse en una base de jurisdicción europea**.
Si en algún momento hay que fijar residencia de datos para menores de la UE o del
Reino Unido —que es la implicación 11 de `mc-25`—, hace falta una **segunda base
con jurisdicción `eu`**, y la decisión de a cuál va cada familia se toma **en el
momento del registro**, no después.

No es un error: para el MVP, con el mercado inicial en LatAm y EE.UU., WNAM es lo
correcto. Pero es una puerta que se cerró al crear el objeto, y conviene que esté
escrito antes de que alguien la busque y no la encuentre.

**Pendiente asociado:** `mc-25` señala que la historia de residencia de Workers KV
**no se pudo confirmar**; hay que verificarla directamente con Cloudflare antes de
guardar datos personales de menores de la UE o el Reino Unido en `SESSION_KV` o
`CONFIG_KV`.

## Riesgo conocido

El precio por escritura de Analytics Engine **no pudo confirmarse** contra la
documentación actual de Cloudflare durante la investigación. Como todo el diseño
de telemetría descansa en ese servicio, hay que confirmarlo antes de
comprometerse — está registrado como riesgo #13 en `mc-32`.
