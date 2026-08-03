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
5. **La inferencia corre sobre Workers AI, dentro del Worker** (D-035, y la
   ampliación del dueño el mismo día: «solo vamos a trabajar con Cloudflare, es
   una decisión tomada»). No queda ningún camino a la API de Claude.

   Esta línea decía «AI Gateway va delante de Claude siempre, para caché, límite
   de gasto por perfil y ruteo de modelo», y era falsa en las tres cosas desde
   D-035. Lo que vale hoy, corregido en F6 #136:

   - **El ruteo por banda** lo hace el Worker (`packages/tutor/src/en-vivo.ts`),
     con `gpt-oss-120b` abajo y `kimi-k2.6` arriba. Es el punto 3 de D-004 con
     otros modelos.
   - **El tope de gasto por perfil y por día** lo hace el **Durable Object**, no
     el Gateway. El plan de F6 §5.1 enmienda D-015 y explica por qué: el objeto
     decide ANTES de gastar y puede degradar con criterio pedagógico —servir la
     explicación pregenerada revisada por humano—, y eso el Gateway no lo sabe
     hacer. Puede devolver 429 o cambiar a un modelo más barato, y lo segundo es
     justo lo que D-035 prohíbe para la banda Pro.
   - **El Gateway se queda como red de seguridad en DÓLARES**, y con una
     advertencia medible: si su base de precios no cubre los modelos `@cf/`, el
     tope en dólares no dispara nunca. Se comprueba llamando, no leyendo.
   - **La caché del Gateway va apagada**: solo empata peticiones idénticas, sin
     caché semántico, y con un ítem distinto por petición la tasa de acierto es
     ~0. Lo que sí se cachea es el **prefijo de sistema**, por
     `larry|<locale>|<banda>` — catorce llaves en el MVP, treinta y cinco en la
     escalera completa, y **jamás por perfil del niño**.

## Inventario de objetos / Resource inventory

Every object is prefixed `math-challenge-` as required. Binding names use `UPPER_SNAKE_CASE`.

| Name | Type | Purpose (EN) | Propósito (ES) | Binding |
|---|---|---|---|---|
| `math-challenge-web` | Worker (Astro, Static Assets) | Public PWA frontend + BFF routes | Frontend PWA público + rutas BFF | n/a (entry Worker) |
| `math-challenge-ingest` | Worker | Validates and ingests attempt submissions; writes telemetry, enqueues scoring | Valida e ingiere envíos de intentos; escribe telemetría, encola calificación | `INGEST` (service binding desde web) |
| `math-challenge-tutor` | Worker | ⚠️ NOT CREATED, and F6 did not need it. Larry's live path lives inside `math-challenge-web` (`/api/larry`) because the sealed envelope, the profile session and the spend meter are already there; a second Worker would move the prompt away from the only place that can seal it. The row stays as a reminder that it is not pending — it is unnecessary | ⚠️ NO CREADO, y F6 no lo necesitó. El camino en vivo de Larry vive dentro de `math-challenge-web` (`/api/larry`): el sobre sellado, la sesión del perfil y el medidor de gasto ya están ahí, y un segundo Worker alejaría el prompt del único sitio que puede sellarlo | n/a |
| `math-challenge-leaderboard-cron` | Worker (Cron Trigger) | Triggers the periodic leaderboard rollup Workflow | Dispara el Workflow periódico de recálculo de leaderboard | n/a |
| `math-challenge-db` | D1 database | System of record: users, children, classrooms, leagues, content metadata, consent | Registro maestro: usuarios, niños, salones, ligas, metadatos de contenido, consentimiento | `DB` |
| `math-challenge-league-do` | Durable Object class (SQLite) | Live state + WebSocket broadcast for one league of ~30 | Estado en vivo + difusión WebSocket de una liga de ~30 | `LEAGUE_DO` |
| `math-challenge-classroom-do` | Durable Object class (SQLite) | Live state for one classroom's roster and in-class standings | Estado en vivo del roster y clasificación de un salón | `CLASSROOM_DO` |
| `math-challenge-db` · migración `0003_accounts_onboarding.sql` | D1 schema | Accounts and onboarding: derived signup columns, consent catalog with abort trigger, household devices, teacher verification, contextual marks | Cuentas y onboarding: columnas derivadas del registro, catálogo de consentimiento con trigger de aborto, dispositivos de la casa, verificación de maestro, marcas contextuales | `DB` |
| `math-challenge-db` · migración `0004_consent_governance.sql` | D1 schema | One governed consent path: consent_records frozen by trigger, consent_version and current_version added, cookie mc_h corrected to D1 | Un solo camino de consentimiento con gobierno: consent_records congelada por trigger, consent_version y current_version añadidas, cookie mc_h corregida a D1 | `DB` |
| `math-challenge-db` · migración `0005_group_owner_identity.sql` | D1 schema | teacher_verifications renamed to group_owner_identity: this product does not verify anyone is a teacher. `assurance='declared'` means the person wrote it and nobody checked, and that is what the parent is shown | teacher_verifications renombrada a group_owner_identity: este producto no verifica que nadie sea maestro. `assurance='declared'` significa que lo escribió esa persona y nadie lo comprobó, y eso es lo que se le muestra al padre | `DB` |
| `math-challenge-db` · migración `0006_solo_el_anio.sql` | D1 schema | birth_month removed from child_profiles: the band derives from the YEAR and the month feeds no product decision. Data minimisation under D-013, declared with the narrow `migration-safety-minimizacion` marker that requires naming the column | birth_month retirada de child_profiles: la banda se deriva del AÑO y el mes no alimenta ninguna decisión del producto. Minimización de datos por D-013, declarada con el marcador estrecho `migration-safety-minimizacion` que exige nombrar la columna | `DB` |
| `math-challenge-db` · migración `0007_racha_y_xp.sql` | D1 schema | Two new add-only tables: child_streak (one row per learner, local-day streak, earned shields capped at 2, family pause) and xp_totals (lifetime XP, no period, no theme_band, and deliberately NO rango column — the rank derives from total_xp on read). Neither has a price, currency, coupon or free-text column, and neither is a per-attempt table | Dos tablas nuevas que solo agregan: child_streak (una fila por aprendiz, racha por día local, escudos ganados con tope 2, pausa familiar) y xp_totals (XP de por vida, sin period, sin theme_band, y deliberadamente SIN columna rango — el rango se deriva de total_xp al leer). Ninguna tiene columna de precio, moneda, cupón ni texto libre, y ninguna es una tabla por intento | `DB` |
| `math-challenge-db` · migración `0008_escudos_por_racha.sql` | D1 schema | Add-only column child_streak.shields_earned_this_streak: the cap of 2 shields is PER STREAK, not every seven days (D-079). Without it the bank refilled forever and, past day 14, skipping one day in seven cost almost nothing. Written as a new migration and not as an edit to 0007 because D1 tracks migrations BY FILENAME — an already-applied 0007 never runs again | Columna que solo agrega, child_streak.shields_earned_this_streak: el tope de 2 escudos es POR RACHA, no cada siete días (D-079). Sin ella el banco se reponía para siempre y, pasado el día 14, saltarse un día de cada siete no costaba casi nada. Va como migración nueva y no como edición de la 0007 porque D1 lleva el control POR NOMBRE DE ARCHIVO — una 0007 ya aplicada no vuelve a correr | `DB` |
| `math-challenge-db` · migración `0009_misiones_diarias.sql` | D1 schema | Add-only table mission_daily_summary: ONE row per (learner, local day, mission type) — at most three per person per day, never one per attempt (mc-32 risk #1). Polymorphic like child_streak: a child profile or an adult learner, never both. mission_type is TEXT with a CHECK closed to the ten catalogue types, cross-checked against `packages/motor/src/misiones.ts` by `audits/mision-recompensa-deterministica.mjs`. No price, currency, coupon or plan column (red line #4: practising is never charged for), no probability or rarity column (red line #5), no free-text column (red line #3), and no board-points column (#225). KINDER writes nothing here: its "daily mission" is the day's HISTORIA challenge in the Savannah (D-019) | Tabla que solo agrega, mission_daily_summary: UNA fila por (aprendiz, día local, tipo de misión) — como mucho tres por persona y por día, jamás una por intento (mc-32 riesgo #1). Polimórfica como child_streak: un perfil de niño o un adulto aprendiz, nunca los dos. mission_type es TEXT con un CHECK cerrado a los diez tipos del catálogo, cruzado contra `packages/motor/src/misiones.ts` por `audits/mision-recompensa-deterministica.mjs`. Sin columna de precio, moneda, cupón ni plan (línea roja #4: nunca se cobra por practicar), sin columna de probabilidad ni rareza (línea roja #5), sin columna de texto libre (línea roja #3) y sin columna de puntos de tablero (#225). KINDER no escribe aquí: su «misión diaria» es el reto HISTORIA del día en la Sabana (D-019) | `DB` |
| `math-challenge-db` · migración `0010_mapa_companero.sql` | D1 schema | New add-only table companion_state: two preferences of the person (visible, accessory_ids) for the map companion, which is Larry himself with earned accessories (D-080). Deliberately NO hunger, happiness, health, energy, mood or last_fed_at column — mc-43 §6 shows Tamagotchi's retention mechanism and its guilt mechanism are the same mechanism, so the decay state is impossible by construction rather than forbidden by rule. No price, currency or drop-rate column either (red line #5). The MAP itself has no table: it is a read layer over skill_state, EstadoHistoria, xp_totals and child_streak (#231) | Tabla nueva que solo agrega, companion_state: dos preferencias de la persona (visible, accessory_ids) para el compañero del mapa, que es Larry mismo con accesorios ganados (D-080). Deliberadamente SIN columna de hambre, felicidad, salud, energía, humor ni última alimentación — `mc-43` §6 documenta que el mecanismo de retención de Tamagotchi y su mecanismo de culpa son el mismo, así que el decaimiento es imposible por construcción y no prohibido por regla. Tampoco hay columna de precio, moneda ni probabilidad (línea roja #5). El MAPA no tiene tabla: es una capa de lectura sobre skill_state, EstadoHistoria, xp_totals y child_streak (#231) | `DB` |
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
| `math-challenge-tutor-gateway` | AI Gateway | ⚠️ NOT CREATED YET. Dollar-denominated safety net in front of Workers AI — never in front of Claude, that path was removed by D-035. The per-profile/day cap does NOT depend on it: it lives in the Durable Object (F6 plan §5.1, amends D-015). Zero Data Retention in production: counts and costs, never prompts — the prompt carries what a minor answered. Cache OFF (see structural decision 5) | ⚠️ TODAVÍA NO CREADO. Red de seguridad en dólares delante de Workers AI — nunca delante de Claude, camino que D-035 quitó. El tope por perfil y día NO depende de él: vive en el Durable Object (plan F6 §5.1, enmienda D-015). Zero Data Retention en producción: conteos y costos, jamás prompts — el prompt lleva lo que respondió un menor. Caché apagada | `AI_GATEWAY_ID` (var; sin ella se llama sin gateway) |
| `math-challenge-attempts-ae` | Analytics Engine dataset | Per-attempt telemetry (high-cardinality, high-volume) | Telemetría por intento (alta cardinalidad, alto volumen) | `ATTEMPTS_AE` |
| `math-challenge-vitals-ae` | Analytics Engine dataset | Field Core Web Vitals (LCP/CLS/INP/TTFB/FCP); never written from a child surface | Core Web Vitals de campo; jamás se escribe desde una superficie de niño (D-037) | `VITALS_AE` |
| `math-challenge-funnel-ae` | Analytics Engine dataset | Activation funnel for the ADULT: signup, first child profile, first household device. Never a child — D-037 and red line #2 | Embudo de activación del ADULTO: registro, primer perfil de niño, primer dispositivo de la casa. Nunca un niño — D-037 y línea roja #2 | `FUNNEL_AE` |
| `math-challenge-ratelimiter-do` | Durable Object | Two things, two keys. (a) Rate limiter, one instance per (action, IP). (b) **Since F6 #136, the tutor spend meter** on route `/tutor`, one instance per daily profile pseudonym `pd = HMAC(secret, day‖profile_id)`, storing three integers — calls, settled µ$, reserved µ$ — for seven days. A counter needs read-and-write without a race; KV is eventually consistent and allows one write per second per key. The two halves fail in OPPOSITE directions on purpose: the rate limiter fails open (its absence makes a form slow, not open), the meter fails closed (its absence would make spend unbounded) | Dos cosas, dos llaves. (a) Limitador de tasa, una instancia por (acción, IP). (b) **Desde F6 #136, el medidor de gasto del tutor** en la ruta `/tutor`, una instancia por seudónimo diario del perfil `pd = HMAC(secreto, día‖profile_id)`, con tres enteros —llamadas, µ$ liquidados, µ$ reservados— durante siete días. Las dos mitades fallan en direcciones OPUESTAS a propósito: el limitador falla abierto, el medidor falla cerrado | `RATE_LIMITER` |
| `math-challenge-tutor-usage-ae` | Analytics Engine dataset | Tutor usage/cost telemetry indexed `banda\|locale\|modelo`. **NEVER per child, not even hashed** — this row used to say "per-child, per-model", which broke red line #2 and was unfixable after the fact: Analytics Engine keeps three months and has no DELETE (`mc-32` risk #7). The per-profile counter lives in the Durable Object for seven days and IS deleted | Telemetría de uso/costo del tutor indexada `banda\|locale\|modelo`. **JAMÁS por niño, ni siquiera hasheado** — este renglón decía «per-child, per-model», que cruzaba la línea roja #2 y además no tenía arreglo posterior: Analytics Engine retiene tres meses y no tiene DELETE. El contador por perfil vive en el Durable Object siete días y ése sí se borra | `TUTOR_AE` |
| `kilowatto` ⚠️ sin prefijo, ver D-054 | Turnstile widget | Bot defense on signup forms. REUSED: a Turnstile widget belongs to a hostname list, not to a project, and math.kilowatto.com lives inside kilowatto.com | Defensa contra bots en el formulario de registro. REUSADO: un widget de Turnstile pertenece a una lista de hostnames, no a un proyecto, y math.kilowatto.com vive dentro de kilowatto.com | `TURNSTILE_SITE_KEY` (público, var) · `TURNSTILE_SECRET_KEY` (secreto) |
| `math-challenge-web-analytics` | Web Analytics site | Privacy-first RUM for the PWA | RUM respetuoso de la privacidad para la PWA | (JS snippet, no binding) |
| `math-challenge-secrets` | Secrets Store | Third-party credentials. **No longer `ANTHROPIC_API_KEY`**: D-035 removed that path and the `@anthropic-ai/sdk` package was uninstalled. Current tenant of this row: `TUTOR_PD_SECRET`, the HMAC salt for the tutor's daily per-profile pseudonym. Without it the live path does not run at all — no `pd` means no per-profile counter, and a live path without a cap is not switched on | Credenciales de terceros. **Ya no `ANTHROPIC_API_KEY`**: D-035 quitó ese camino y el paquete `@anthropic-ai/sdk` se desinstaló. Inquilino actual: `TUTOR_PD_SECRET`, la sal del HMAC del seudónimo diario del perfil. Sin él el camino en vivo no corre: sin `pd` no hay contador por perfil, y un camino en vivo sin tope no se enciende | vía `wrangler secret put` |


## Bitácora de creación / Creation log

| Fecha | Objeto | ID real | Quién | Nota |
|-------|--------|---------|-------|------|
| 2026-07-31 | `math-challenge-db` (D1) | `25276cac-2d48-4771-87c1-f58bc8722b4e` | Esteban | Región **WNAM**. Migraciones 0001 y 0002 aplicadas en local y remoto; 10 tablas. Binding `DB`, no el `math_challenge_db` que sugiere wrangler |
| 2026-07-31 | `math-challenge-session-kv` (KV) | `c7157f96cd7d478ca8bd0190ef396239` | Esteban | Binding `SESSION_KV`. **Solo tokens efímeros** hasta verificar residencia de KV con Cloudflare |
| 2026-07-31 | `math-challenge-config-kv` (KV) | `76bfad78247544bbb8fbd447a06ad933` | Esteban | Binding `CONFIG_KV` |
| 2026-07-31 | `math-challenge-media` (R2) | *(el nombre es el id)* | Esteban | Binding `MEDIA_BUCKET`. Arte de la Sabana, imágenes y audio |
| 2026-07-31 | `math-challenge-exports` (R2) | *(el nombre es el id)* | Esteban | Binding `EXPORTS_BUCKET`. Archivo frío y exportaciones COPPA/GDPR |
| 2026-08-01 | `math-challenge-learner-do` (Durable Object, clase `Aprendiz`) | *(la clase es el id)* | Claude | Binding `LEARNER_DO`, migración de DO `v2` con `new_sqlite_classes`. **Un objeto por niño** (`idFromName(child_profile_id)`) — un DO global topa en 500-1.000 req/s (`mc-32` riesgo #2) y, sobre todo, hace imposible que borrar el perfil sea `deleteAll()`. Guarda **estado derivado**: estimaciones, contadores y fechas; jamás el intento crudo, que va a `math-challenge-attempts-ae`. Tres sitios hay que tocar para añadir una clase de DO y olvidar cualquiera rompe distinto: `worker.ts` (export con nombre), `astro.config.mjs` (`namedExports`) y `wrangler.jsonc` (binding + `migrations`) |
| 2026-08-02 | `mail.kilowatto.com` ⚠️ sin prefijo — es un DOMINIO, no un objeto de la cuenta | Cloudflare Email Service (Email Sending) | Esteban | Binding `EMAIL`, `"remote": true`. Envía a CUALQUIER destinatario, a diferencia de Email Routing —que sigue en `enabled: false`— que solo recibiría. **Reputación «At Risk» desde el día uno**: 10 envíos de prueba con 1 rebote dan 10% contra un umbral de riesgo del 5%, y Cloudflare pausa el envío de la cuenta si no baja. Por eso el reseteo de contraseña solo puede escribir a direcciones que ya estén en `users` (issue #313). Cuota 1000/día. DNS: MX de rebotes, SPF, DKIM y DMARC en `_dmarc` |

| 2026-08-02 | Binding `AI` (Workers AI) + dataset `math-challenge-tutor-usage-ae` | *(ninguno: Workers AI no crea objeto de cuenta; el dataset aparece la primera vez que un Worker le escribe)* | Claude | F6 #136. **Lo que este renglón NO significa:** no se creó el AI Gateway `math-challenge-tutor-gateway`, así que la red de seguridad en dólares **no está activa**. No hace falta para que el tope funcione — el tope por perfil y día lo hace cumplir el Durable Object (plan F6 §5.1, enmienda D-015)— pero sí para el segundo cinturón. Y falta `TUTOR_PD_SECRET` por `wrangler secret put`: **sin él no se llama al modelo en absoluto**, así que el estado de hoy es «camino en vivo apagado por falta de secreto», que es el estado seguro. Tres cosas hay que hacer para encenderlo: crear el gateway, poner el secreto, y marcar el plan de una cuenta como `familia` en `CONFIG_KV` |

| 2026-08-02 | Migración `0011_screen_time_daily_usage.sql` sobre `math-challenge-db` (D1) | *(tabla `screen_time_daily_usage`, no un objeto de la cuenta)* | Claude | F8 #267. **Cero recursos nuevos de Cloudflare**: el renglón existe porque la migración se commiteó, no porque se haya creado nada. Una tabla, solo AGREGA, `PRIMARY KEY (child_profile_id, local_date)` y `ON DELETE CASCADE` sobre `child_profiles`. Es el CONSUMO del día —cuántos minutos lleva jugados el niño hoy— que `screen_time_settings` (la configuración) nunca guardó, y sin el cual el aviso de los 5 minutos y el corte diario de D-016 no se pueden calcular. Es un rollup por niño y por día, el mismo patrón que `score_totals`: **no** es lo que `mc-32` riesgo #1 prohíbe, que son intentos crudos y siguen yendo solo a `math-challenge-attempts-ae`. Se descartó un `math-challenge-screentime-do` por niño: sumar minutos no tiene la exigencia de consistencia serializada que justifica un DO en F4, y un objeto más que inventariar sin problema de latencia que resolver es costo sin beneficio. **Lo que este renglón NO significa:** la migración todavía no se ha aplicado a `math-challenge-db` ni a `math-challenge-db-eu` — sin `wrangler d1 migrations apply` la tabla no existe en ningún ambiente, y el motor que la lee (`packages/motor/src/limite-pantalla.ts`) es puro y no la toca todavía. Y **la numeración salta de 0008 a 0011 a propósito**: 0009 y 0010 están reservadas a F7 misiones y a F7 ligas, que se construyen en paralelo; `audits/migration-safety.mjs` avisa del hueco hasta que esas dos ramas mergeen, y tiene razón en avisar |

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
