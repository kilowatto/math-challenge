# Larry Profe — portando Larry a Math Challenge
> Investigación Math Challenge — 2026-07-31 — tema 37

## Resumen ejecutivo (ES)

Larry ya existe en IOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → respuesta enlatada), con un prompt de sistema bilingüe único, un protocolo de «tool calling» hecho a mano (JSON en una línea) y auditoría durable en D1. Nada de esto usa la API de Claude — sería la primera integración de Claude en este repo.

El propietario ya decidió: Larry Profe usa la **API de Claude** con **enrutamiento por dificultad** (Haiku/Sonnet/Opus). El precedente más cercano en el repo no es el chat libre sino `src/larry/contador/explain.ts`: un hallazgo determinístico entra, un LLM lo explica en lenguaje natural sin recalcular nada, con fallback a plantilla. Larry Profe debe seguir exactamente ese patrón: el motor de calificación decide qué está bien o mal; Claude solo explica, en el idioma, la edad y el tono correctos, sin avergonzar al niño.

## Executive summary (EN)
Larry-in-IOS se ejecuta en Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → respuesta predefinida), con un protocolo artesanal de llamada a herramientas de JSON de una sola línea y un sumidero de auditoría D1 duradero. Nunca toca la API de Claude — Larry Profe sería la primera integración de Claude de este repositorio, no una reutilización de la infraestructura existente.

El propietario ha decidido que Larry Profe utilice la **Claude API** con **model routing by difficulty** (Haiku/Sonnet/Opus). El precedente más cercano no es el punto final de chat libre, sino `src/larry/contador/explain.ts`: un patrón de entrada determinista y salida explicada por LLM con una regla estricta «never compute, only cite what's in the JSON» y un fallback de plantilla. Larry Profe debe seguir esa forma: el motor de calificación propio de Math Challenge es la fuente de verdad sobre la corrección; la única tarea de Claude es convertir un veredicto estructurado en una explicación cálida, adecuada a la edad y en cinco idiomas — nunca volver a derivar la matemática en sí.

## What exists today — file paths and line references from this repo

- **Persona/canon.** `docs/larry.md:1-16` — "orange rhinoceros, honest coach," catchphrase "¡Ya vas!" only when accepting a task, humor only ever aimed at himself.
- **Model chain is Workers AI, not Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (same pair in `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): "our own model (Workers AI) serves the routine 70–90% of traffic; a frontier API handles hard cases" plus a semantic cache and per-role budget — conceptually similar shape to what Larry Profe needs, but IOS is Workers-AI-first with Claude as overflow; the owner's Math Challenge brief is Claude-first with routing by problem difficulty, not the same policy.
- **Bilingual single-prompt pattern.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — every persona/rule line is written twice, EN then ES, in one string (e.g. `:29`); only the "reply in language X" instruction (`:47`) is locale-specific. Does not scale to 5 languages (see below).
- **Hard "never" list.** `src/larry/prompts.ts:38-44` — five bullets: never delete client data, never read object contents, never touch billing without confirmation, never create/rotate keys by chat, never change code/config; restated in prose at `docs/larry.md:96-102` (§4.2). This is the template slot Larry Profe needs its own child-safety rules in.
- **Hand-rolled tool protocol.** Model must reply with only a single-line `{"tool": "<name>", "args": {...}}` (`prompts.ts:50-51`), not Anthropic's `tool_use` content blocks. Parsed by `parseToolCall` (`chat.ts:273-289`); looped by `generateReplyWithTools` (`:236-267`), capped at `MAX_TOOL_HOPS = 2` (`:44`). Tenant-scoping safety lives in `src/larry/tools.ts:47-48, 342-394`.
- **Fallback chain, no retry/backoff.** `chat.ts:295-314` `generateReply` tries each model once, falls through to `cannedErrorReply(locale)` (`prompts.ts:67-71`) if both fail.
- **Audit sink.** `migrations/0011_larry_audit.sql:5-23` — D1 table, `chat`/`tool` row kinds, columns include `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Writers `src/larry/audit.ts:36-67, 70-97` are best-effort, never throw. Token counts are a rough `text.length / 4` estimate (`audit.ts:31-33`), not real model `usage` — Claude responses carry exact token counts, which Larry Profe's audit should record precisely instead.
- **Locale detection is EN/ES only.** `src/larry/locale.ts:9, 63-71` — hard-coded Spanish-word list plus accented-character check, English is the default. No FR/PT/DE infrastructure exists; extending this heuristic is fragile (see below).
- **The real precedent: `src/larry/contador/explain.ts`.** `:67-75` system prompt's hard rule ("Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0."); `:106-145` `explainFinding()` strips the pre-computed `explanation` field before sending the model the finding (`:113`, so it can't just parrot a canned string), asks for bilingual `{"en":..., "es":...}` JSON, and falls back to `renderTemplateExplanation()` (`:41-60`) — a plain fact-dump, no LLM — on any failure. This is architecturally what Larry Profe needs.
- **Avatar + state machine.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — states `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` one `@keyframes` per state, disabled under `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documents `idle → thinking → working → idle`. Reusable as-is for Larry Profe.
- **No Claude API usage anywhere in this repo today** — no `@anthropic-ai/sdk` import under `src/` or `packages/`. This is a first integration, not an extension.

## What must change for a children's math tutor

1. **Tone, not "honest coach."** IOS's persona targets adult B2B engineers who can take a blunt correction. A child must never feel shamed — stricter than "humor never mocks people's characteristics."
2. **Five languages, not two.** `locale.ts`'s `'en'|'es'` type and word-list detector don't extend to FR/PT/DE, and `prompts.ts`'s "write every line twice" pattern would 5x prompt tokens for content mostly unused per call — build one single-language prompt per locale instead.
3. **Math correctness cannot depend on the LLM.** A wrong IOS tool answer is a bad UI hint; a wrong Larry Profe explanation actively teaches incorrect math. This is exactly why `contador/explain.ts`'s "LLM explains, never computes" shape is right and `chat.ts`'s free-form loop is not.
4. **Per-age vocabulary**, explicit in the prompt (age band as a parameter), not left for the model to infer from tone.
5. **Model routing is new** — ADR-006 describes Workers-AI-first hybrid routing; Larry Profe inverts this (Claude-first, three difficulty tiers, no Workers AI), per the owner's brief.
6. **Retire or soften the `denying` avatar state** for a children's product — head-shake body language (`larry.css:87-98`) reads as "you're wrong"; prefer `thinking`→`presenting` for corrections.

## Model routing table

Pricing/model IDs are from the `claude-api` skill (cached 2026-06-24; Sonnet 5 intro pricing runs through 2026-08-31), not training memory. Cost estimates assume a shared system-prompt prefix (covered under caching below) plus a per-call payload of {problem, student steps, grading verdict}; figures are estimates to validate against real prompts, not measurements.

| Banda de dificultad | Identificador de modelo | $/MTok entrada / salida | Tokens estimados entrada → salida | Coste estimado / 1.000 explicaciones | Objetivo de latencia |
|---|---|---|---|---|---|
| Basic arithmetic | `claude-haiku-4-5` | 1,00 $ / 5,00 $ | ~300 → ~150 | **~1,05 $** | < 1,5 s, sin streaming necesario |
| Mid-tier (fractions, algebra, geometry) | `claude-sonnet-5` | 3,00 $ / 15,00 $ (intro $2/$10 hasta el 2026-08-31) | ~500 → ~300 | **~6,00 $** (intro **~4,00 $**) | 2–4 s, streaming si > ~3 s |
| Advanced (tensor calculus, double integrals, proofs) | `claude-opus-5` | 5,00 $ / 25,00 $ | ~800 → ~600 + adaptive thinking | **~19 $ mínimo, realisticamente 35–60 $** una vez contados los tokens de razonamiento | 5–15 s; debe stream |

Notes:

- **El coste de Opus 5 está dominado por los tokens de razonamiento.** Según la habilidad, el razonamiento está **activado por defecto** en Opus 5 — una solicitud que nunca establezca `thinking` sigue razonando, y el razonamiento se factura como salida a $25/MTok. Una explicación exigente puede consumir 1.000–2.000 tokens de razonamiento antes de la respuesta de 600 tokens, añadiendo ~25–50 $/1.000 llamadas por sí misma. Desactivar el razonamiento genera modos de fallo reales (llamadas a herramientas o etiquetas `<thinking>` que se filtran al texto visible, según `shared/model-migration.md`), por lo que la palanca más segura es **`output_config.effort`** — iniciar Opus 5 en `medium` y aumentarla solo si la evaluación muestra explicaciones superficiales.
- **Haiku 4.5 necesita un prefijo cacheable de 4.096 tokens.** Según la tabla mínima por modelo de `shared/prompt-caching.md`, el umbral de Haiku 4.5 es de 4.096 tokens (el más alto de los modelos actuales; Opus 5/Fable 5 solo requieren 512). Un prompt de sistema de aritmética básica (persona + reglas + una banda de edad + un idioma) probablemente quede muy por debajo de ese límite, lo que significa **que las llamadas a Haiku pueden nunca activar la caché de prompt** a menos que el prefijo se rellene deliberadamente — avise al propietario en lugar de asumir que la caché “simplemente funciona” en el nivel más barato.
- **La API por lotes (50 % de descuento) sirve para pre‑generación, no para tráfico en tiempo real.** Una explicación en sesión en directo no puede agruparse, pero pre‑generar los N principales conceptos erróneos conocidos por tema/edad/idioma antes del lanzamiento es exactamente el caso de uso de la API por lotes (hasta 100 K peticiones/lote, sin sensibilidad a la latencia).

## The prompt architecture — proposed skeleton, 5 languages, hard rules

Departing from `prompts.ts`'s "every line twice" pattern, build **one prompt per (locale, age-band, tier)**, English shown (FR/PT/DE/ES are parallel single-language renders, not concatenations):

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

Reserve `output_config.format` / `strict: true` tool schemas for the grading-engine → Larry-Profe handoff (Math Challenge's own backend validates that JSON, not Claude) — this prompt's output is plain streamed prose, not structured data.

## Caching and cost control strategy

Two independent layers:

1. **Claude prompt caching** on the stable prefix (persona + rules + one language + one age band). Per-model, per-prefix — writes cost 1,25× (5‑min TTL) or 2× (1‑hour), reads ~0,1×. Una TTL de 1 hora con pre‑calentamiento periódico (`max_tokens: 0` requests, per `shared/prompt-caching.md`) se adapta al tráfico explosivo de horas de deberes. Omitir para Haiku a menos que el prefijo supere los 4.096 tokens (ver arriba).
2. **Application-level misconception cache (D1/KV)** — el mecanismo que el brief del propietario solicita. Cachear la **explicación completa generada**, con clave `(topic, misconception-classification, age-band, locale)` — no la instancia exacta del problema, de modo que diferentes problemas de fracciones con el mismo error de “olvidar el denominador común” accedan a la misma entrada. Refleja el patrón estático `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), pero se llena con la salida de Claude en tiempo de generación; en caso de miss se recurre a una llamada en vivo y se rellena la caché, imitando la forma AI‑then‑template de `contador/explain.ts`. Registrar `cache_hit: boolean` y los campos reales `usage.input_tokens`/`usage.output_tokens` en una tabla de auditoría análoga a la migración `0011` — no la estimación `text.length/4` que usa hoy `audit.ts`.
3. **Batch API for cold-start seeding** — pre‑generar los N principales conceptos erróneos por tema antes del lanzamiento con un 50 % de descuento, convirtiendo la mayor parte del tráfico inicial en lecturas de caché desde el primer día.

## Design implications

1. Larry Profe es una **nueva integración de la API de Claude**; no canalizarlo a través del gateway Workers AI de IOS — el propietario quiere Claude, y ADR‑006 es una arquitectura distinta, centrada en Workers‑AI para otro producto.
2. Modelar el **motor de calificación como fuente de verdad**, Claude solo para explicar — seguir la forma de `contador/explain.ts`, no el bucle libre de herramientas de `chat.ts`.
3. Eliminar el patrón de prompt bilingüe en línea; un prompt por idioma, ya que 5 idiomas hacen que la deriva entre lenguas dentro de un mismo prompt sea costosa y propensa a errores.
4. Tomar el idioma como **parámetro explícito** del cliente (Math Challenge ya dispone de una configuración de idioma) en lugar de inferirlo como hace `locale.ts` para IOS.
5. Construir el router de nivel de dificultad en el backend de Math Challenge (junto a la calificación, que ya conoce tema/nivel) — nunca permitir que Claude elija su propio nivel de modelo.
6. Tratar `effort` como un segundo eje de enrutamiento independiente de la elección del modelo; iniciar de forma conservadora (`medium` en Opus 5) pues es la palanca principal contra el desbordamiento de costes por tokens de razonamiento.
7. Registrar los campos reales `usage` de Claude en el sumidero de auditoría desde el primer día, en lugar de repetir la estimación basada en caracteres de `audit.ts`.
8. Redactar un canon de reglas estrictas de seguridad infantil paralelo a la lista de cinco ítems de `docs/larry.md` §4.2, pero desde cero — las reglas de IOS tratan la seguridad de datos, no la seguridad emocional.
9. Reutilizar `LarryAvatar` y su máquina de estados sin cambios, pero reconsiderar si `denying` debería activarse alguna vez contra un niño.
10. Mantener la caché de conceptos erróneos y la caché de prompts de Claude como **sistemas distintos** — resuelven problemas diferentes (evitar reenviar el prefijo vs. evitar volver a generar una salida semánticamente idéntica) y combinarlos entregaría menos de lo esperado en el objetivo “una generación, no mil”.
11. Utilizar la API por lotes para pre‑sembrar la caché de conceptos erróneos antes del lanzamiento y para rellenar nuevos tipos de error detectados en producción.
12. Cada regla estricta y cada línea de prompt necesita una copia revisada por humanos en EN/ES/FR/PT/DE — un tono que suena alentador en un idioma puede resultar condescendiente en otro; no delegar esto a la traducción en tiempo de ejecución.

## Preguntas abiertas para el responsable del proyecto

1. ¿Reside el enrutador de niveles de dificultad en el backend de Math Challenge (etiquetas del motor de calificación tema/nivel), o debería Larry Profe reclasificar la dificultad a partir del texto del problema?  
2. ¿Cuáles son las franjas de edad reales (K‑2/3‑5/6‑8/9‑12, o por curso)? Esto determina tanto las variantes de vocabulario como el número de combinaciones de prompts en caché que hay que crear (localización × franja de edad × nivel podría ser 5×4×3 = 60).  
3. ¿Debe el `effort` de Opus 5 fijarse por nivel, o ser ajustable por tema dentro de «avanzado» (una doble integral y una demostración completa de cálculo tensorial podrían requerir un esfuerzo diferente)?  
4. ¿Existe un presupuesto de latencia a nivel de producto (p. ej., «debe iniciar la transmisión en un máximo de 2 s o mostrar un estado de carga») que deba regular la transmisión predeterminada por nivel?  
5. ¿Quién revisa la regla estricta y el texto del prompt en FR/PT/DE: un revisor multilingüe de contenidos educativos, o la traducción automática como borrador inicial a partir de la versión EN/ES?  
6. ¿Necesita la caché de conceptos erróneos un TTL, o es aceptable servir indefinidamente una explicación en caché para una concepción errónea poco frecuente?  
7. ¿Debe «lo que el estudiante hizo bien» siempre encontrar algo, incluso para una respuesta en blanco o adivinada — y, de ser así, cuál es el mínimo honesto (p. ej., «has intentado»)?  

## Fuentes

**Archivos del repositorio (rutas citadas arriba):**
- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (whole file)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (whole file — the closest existing precedent)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

Todas las rutas son relativas a `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Datos de la API de Claude (del skill `claude-api`, almacenados en caché el 2026‑06‑24; no proceden de la memoria de entrenamiento):**
- Identificadores de modelo y precios: `claude-haiku-4-5` (1 $/5 $ por MTok), `claude-sonnet-5` (3 $/15 $, introducción 2 $/10 $ hasta el 2026‑08‑31), `claude-opus-5` (5 $/25 $) — tabla «Current Models» del skill.  
- Economía del almacenamiento en caché de prompts y prefijo mínimo cacheable por modelo (Haiku 4.5 = 4.096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.  
- API por lotes (descuento del 50 %, hasta 100.000 peticiones por lote) — `python/claude-api/batches.md`.  
- Pensamiento adaptativo activado por defecto en Opus 5, `output_config.effort`, el pensamiento facturado como salida — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.  
- Salidas estructuradas (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.  
- Objetivos de obtención de precios en tiempo real nombrados por el skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — no se recuperaron por separado en este paso, ya que la tabla en caché del skill estaba actualizada para los modelos necesarios.
