# Larry Profe — portando a Larry a Math Challenge
> Investigación Math Challenge — 2026-07-31 — tema 37

## Resumen ejecutivo (ES)

Larry ya existe en IOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → respuesta enlatada), con un prompt de sistema bilingüe único, un protocolo de "tool calling" hecho a mano (JSON en una línea) y auditoría durable en D1. Nada de esto usa la API de Claude — sería la primera integración de Claude en este repo.

El dueño ya decidió: Larry Profe usa la **API de Claude** con **ruteo por dificultad** (Haiku/Sonnet/Opus). El precedente más cercano en el repo no es el chat libre sino `src/larry/contador/explain.ts`: un hallazgo determinístico entra, un LLM lo explica en lenguaje natural sin recalcular nada, con fallback a plantilla. Larry Profe debe seguir exactamente ese patrón: el motor de calificación decide qué está bien o mal; Claude solo explica, en el idioma, edad y tono correctos, nunca avergonzando al niño.

## Executive summary (EN)

Larry-in-IOS runs on Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → canned reply), with a hand-rolled single-line-JSON tool-calling protocol and a durable D1 audit sink. It never touches the Claude API — Larry Profe would be this repo's first Claude integration, not a reuse of existing plumbing.

The owner has decided Larry Profe uses the **Claude API** with **model routing by difficulty** (Haiku/Sonnet/Opus). The closest existing precedent is not the free-form chat endpoint but `src/larry/contador/explain.ts`: a deterministic-finding-in, LLM-explains-it-out pattern with a hard "never compute, only cite what's in the JSON" rule and a template fallback. Larry Profe should follow that shape: Math Challenge's own grading engine is the source of truth on correctness; Claude's only job is turning a structured verdict into a warm, age-appropriate, five-language explanation — never re-deriving the math itself.

## Qué existe hoy — rutas de archivo y referencias de línea de este repo

- **Persona/canon.** `docs/larry.md:1-16` — "rinoceronte naranja, entrenador honesto," con la frase distintiva "¡Ya vas!" solo al aceptar una tarea, y humor que nunca apunta a nadie más que a sí mismo.
- **La cadena de modelos es Workers AI, no Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (el mismo par en `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): "nuestro propio modelo (Workers AI) atiende el 70–90% del tráfico rutinario; una API de frontera atiende los casos difíciles" más una caché semántica y un presupuesto por rol — una forma conceptualmente similar a lo que necesita Larry Profe, pero IOS prioriza Workers AI con Claude como desborde; el brief del dueño para Math Challenge prioriza Claude con ruteo por dificultad del problema, que no es la misma política.
- **Patrón de prompt único bilingüe.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — cada línea de persona/regla está escrita dos veces, EN y luego ES, en un solo string (p. ej. `:29`); solo la instrucción "responde en el idioma X" (`:47`) es específica del locale. No escala a 5 idiomas (ver abajo).
- **Lista rígida de "nunca".** `src/larry/prompts.ts:38-44` — cinco viñetas: nunca borrar datos del cliente, nunca leer contenido de objetos, nunca tocar facturación sin confirmación, nunca crear/rotar llaves por chat, nunca cambiar código/configuración; reafirmada en prosa en `docs/larry.md:96-102` (§4.2). Este es el espacio de plantilla donde Larry Profe necesita sus propias reglas de seguridad infantil.
- **Protocolo de herramientas hecho a mano.** El modelo debe responder solo con una línea `{"tool": "<name>", "args": {...}}` (`prompts.ts:50-51`), no con los bloques de contenido `tool_use` de Anthropic. Se parsea con `parseToolCall` (`chat.ts:273-289`); se itera con `generateReplyWithTools` (`:236-267`), tope en `MAX_TOOL_HOPS = 2` (`:44`). La seguridad de alcance por tenant vive en `src/larry/tools.ts:47-48, 342-394`.
- **Cadena de respaldo, sin reintento/backoff.** `chat.ts:295-314` `generateReply` intenta cada modelo una vez, y cae a `cannedErrorReply(locale)` (`prompts.ts:67-71`) si ambos fallan.
- **Sumidero de auditoría.** `migrations/0011_larry_audit.sql:5-23` — tabla D1, tipos de fila `chat`/`tool`, columnas que incluyen `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Los escritores `src/larry/audit.ts:36-67, 70-97` son de mejor esfuerzo, nunca lanzan excepción. Los conteos de tokens son una estimación burda de `text.length / 4` (`audit.ts:31-33`), no el `usage` real del modelo — las respuestas de Claude traen conteos exactos de tokens, que la auditoría de Larry Profe debería registrar con precisión en vez de estimarlos.
- **La detección de locale es solo EN/ES.** `src/larry/locale.ts:9, 63-71` — una lista de palabras en español codificada a mano más una verificación de caracteres acentuados; el inglés es el valor por omisión. No existe infraestructura FR/PT/DE; extender esta heurística es frágil (ver abajo).
- **El precedente real: `src/larry/contador/explain.ts`.** `:67-75` la regla rígida del prompt de sistema ("Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0."); `:106-145` `explainFinding()` quita el campo `explanation` ya precalculado antes de enviarle al modelo el hallazgo (`:113`, para que no pueda simplemente repetir un string enlatado), pide JSON bilingüe `{"en":..., "es":...}`, y cae a `renderTemplateExplanation()` (`:41-60`) — un volcado de hechos plano, sin LLM — ante cualquier falla. Esto es arquitectónicamente lo que Larry Profe necesita.
- **Avatar + máquina de estados.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — estados `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` un `@keyframes` por estado, deshabilitado bajo `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` documenta `idle → thinking → working → idle`. Reutilizable tal cual para Larry Profe.
- **No hay uso de la API de Claude en ninguna parte de este repo hoy** — no hay ningún import de `@anthropic-ai/sdk` bajo `src/` ni `packages/`. Esta es una primera integración, no una extensión.

## Qué debe cambiar para un tutor de matemáticas para niños

1. **Tono, no "entrenador honesto."** La persona de IOS apunta a ingenieros adultos B2B que pueden recibir una corrección directa. Un niño nunca debe sentirse avergonzado — más estricto que "el humor nunca se burla de las características de una persona."
2. **Cinco idiomas, no dos.** El tipo `'en'|'es'` de `locale.ts` y su detector por lista de palabras no se extienden a FR/PT/DE, y el patrón de `prompts.ts` de "escribir cada línea dos veces" multiplicaría por 5 los tokens del prompt para contenido que en su mayoría no se usa en cada llamada — mejor construir un prompt de un solo idioma por locale.
3. **La corrección matemática no puede depender del LLM.** Una respuesta incorrecta de una herramienta de IOS es una mala pista de UI; una explicación incorrecta de Larry Profe enseña matemáticas erróneas de forma activa. Esta es exactamente la razón por la que la forma "el LLM explica, nunca calcula" de `contador/explain.ts` es correcta y el ciclo libre de `chat.ts` no lo es.
4. **Vocabulario por edad**, explícito en el prompt (banda de edad como parámetro), no dejado a que el modelo lo infiera del tono.
5. **El ruteo por modelo es nuevo** — ADR-006 describe un ruteo híbrido con prioridad Workers AI; Larry Profe lo invierte (prioridad Claude, tres niveles de dificultad, sin Workers AI), según el brief del dueño.
6. **Retirar o suavizar el estado de avatar `denying`** para un producto infantil — el lenguaje corporal de negar con la cabeza (`larry.css:87-98`) se lee como "estás mal"; preferir `thinking`→`presenting` para las correcciones.

## Tabla de ruteo por modelo

Los precios/IDs de modelo vienen de la skill `claude-api` (en caché desde 2026-06-24; el precio de introducción de Sonnet 5 corre hasta el 2026-08-31), no de memoria de entrenamiento. Las estimaciones de costo asumen un prefijo de prompt de sistema compartido (cubierto bajo caché abajo) más una carga útil por llamada de {problema, pasos del estudiante, veredicto de calificación}; las cifras son estimaciones a validar contra prompts reales, no mediciones.

| Banda de dificultad | ID de modelo | $/MTok entrada / salida | Tokens estimados entrada → salida | Costo estimado / 1,000 explicaciones | Meta de latencia |
|---|---|---|---|---|---|
| Aritmética básica | `claude-haiku-4-5` | $1.00 / $5.00 | ~300 → ~150 | **~$1.05** | < 1.5 s, sin necesidad de streaming |
| Nivel medio (fracciones, álgebra, geometría) | `claude-sonnet-5` | $3.00 / $15.00 (intro $2/$10 hasta 2026-08-31) | ~500 → ~300 | **~$6.00** (intro **~$4.00**) | 2–4 s, streaming si > ~3 s |
| Avanzado (cálculo tensorial, integrales dobles, demostraciones) | `claude-opus-5` | $5.00 / $25.00 | ~800 → ~600 + razonamiento adaptativo | **~$19 de piso, realistamente $35–60** una vez contados los tokens de razonamiento | 5–15 s; debe usar streaming |

Notas:

- **El costo de Opus 5 está dominado por los tokens de razonamiento.** Según la skill, el razonamiento está **activado por omisión** en Opus 5 — una solicitud que nunca configura `thinking` de todos modos razona, y el razonamiento se factura como salida a $25/MTok. Una explicación difícil puede gastar 1,000–2,000 tokens de razonamiento antes de la respuesta de 600 tokens, lo que añade ~$25–50 por cada 1,000 llamadas solo por eso. Deshabilitar el razonamiento tiene fallas reales (llamadas a herramientas o etiquetas `<thinking>` filtrándose al texto visible, según `shared/model-migration.md`), así que la palanca más segura es **`output_config.effort`** — empezar Opus 5 en `medium` y subirlo solo si la evaluación muestra explicaciones superficiales.
- **Haiku 4.5 necesita un prefijo cacheable de 4,096 tokens.** Según la tabla de mínimos por modelo de `shared/prompt-caching.md`, el piso de Haiku 4.5 es 4,096 tokens (el más alto de cualquier modelo actual; Opus 5/Fable 5 necesitan solo 512). Un prompt de sistema de aritmética básica (persona + reglas + una banda de edad + un idioma) probablemente queda muy por debajo de eso, lo que significa que **las llamadas a Haiku podrían nunca activar el caché de prompt** a menos que el prefijo se rellene deliberadamente — hay que señalarle esto al dueño en vez de asumir que el caché "simplemente funciona" en el nivel más barato.
- **La API por lotes (Batch, 50% de descuento) sirve para la pregeneración, no para tráfico en vivo.** Una explicación en vivo dentro de una sesión no puede ir por lotes, pero pregenerar los N conceptos erróneos más comunes por tema/edad/idioma antes del lanzamiento es exactamente el caso de uso de la API por lotes (hasta 100K solicitudes por lote, no sensible a latencia).

## La arquitectura del prompt — esqueleto propuesto, 5 idiomas, reglas rígidas

Apartándose del patrón de "cada línea dos veces" de `prompts.ts`, construir **un prompt por (locale, banda de edad, nivel)**, mostrado en inglés (FR/PT/DE/ES son renders paralelos de un solo idioma, no concatenaciones):

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

Reservar `output_config.format` / esquemas `strict: true` para el traspaso motor-de-calificación → Larry-Profe (el propio backend de Math Challenge valida ese JSON, no Claude) — la salida de este prompt es prosa simple en streaming, no datos estructurados.

## Estrategia de caché y control de costo

Dos capas independientes:

1. **Caché de prompt de Claude** sobre el prefijo estable (persona + reglas + un idioma + una banda de edad). Por modelo, por prefijo — las escrituras cuestan 1.25× (TTL de 5 min) o 2× (1 hora), las lecturas ~0.1×. Un TTL de 1 hora con precalentamiento periódico (solicitudes `max_tokens: 0`, según `shared/prompt-caching.md`) conviene al tráfico de horas de tarea, que llega en ráfagas. Omitir para Haiku a menos que el prefijo supere los 4,096 tokens (ver arriba).
2. **Caché de conceptos erróneos a nivel de aplicación (D1/KV)** — el mecanismo que el brief del dueño realmente pide. Cachear la **explicación generada completa**, indexada por `(topic, misconception-classification, age-band, locale)` — no la instancia exacta del problema, para que distintos problemas de fracciones con el mismo error de "olvidó el denominador común" acierten en la misma entrada de caché. Refleja el patrón estático existente de búsqueda `S3_ERROR_KB`/`METRIC_KB` (`src/larry/tools.ts:59-135`), excepto que se puebla con salida de Claude al momento de generarse; si falla, hacer una llamada en vivo y poblar el caché, reflejando la forma AI-luego-plantilla de `contador/explain.ts`. Registrar `cache_hit: boolean` y el `usage.input_tokens`/`usage.output_tokens` real en una tabla de auditoría análoga a la migración `0011` — no la estimación `text.length/4` que usa hoy `audit.ts`.
3. **API por lotes para la siembra en frío** — pregenerar los N conceptos erróneos más comunes por tema antes del lanzamiento con 50% de descuento, convirtiendo la mayor parte del tráfico temprano en lecturas de caché desde el día uno.

## Implicaciones de diseño

1. Larry Profe es una **nueva integración con la API de Claude**; no enrutarla a través del gateway de Workers AI de IOS — el dueño quiere Claude, y ADR-006 es una arquitectura distinta, con prioridad Workers AI, para un producto distinto.
2. Modelar el **motor de calificación como fuente de verdad**, Claude solo-explica — seguir la forma de `contador/explain.ts`, no el ciclo libre de herramientas de `chat.ts`.
3. Descartar el patrón de prompt bilingüe en línea; un prompt por locale, ya que 5 idiomas hace que la deriva entre idiomas dentro de un solo prompt sea a la vez costosa y propensa a errores.
4. Tomar el locale como un **parámetro explícito** del cliente (Math Challenge ya tiene una configuración de idioma) en vez de inferirlo como lo hace `locale.ts` para IOS.
5. Construir el ruteador de nivel de dificultad en el backend de Math Challenge (junto a la calificación, que ya sabe tema/nivel) — nunca dejar que Claude elija su propio nivel de modelo.
6. Tratar `effort` como un segundo eje de ruteo independiente de la elección del modelo; empezar conservador (`medium` en Opus 5) ya que es la palanca principal contra el disparo de costo por tokens de razonamiento.
7. Registrar los campos `usage` reales de Claude en el sumidero de auditoría desde el día uno en vez de repetir la estimación por conteo de caracteres de `audit.ts`.
8. Escribir un canon de reglas rígidas de seguridad infantil paralelo a la lista de cinco puntos de `docs/larry.md` §4.2, pero desde cero — las reglas de IOS son sobre seguridad de datos, no seguridad emocional.
9. Reutilizar `LarryAvatar` y su máquina de estados sin cambios, pero reconsiderar si `denying` debería siquiera dispararse frente a un niño.
10. Mantener el caché de conceptos erróneos y el caché de prompt de Claude como **sistemas distintos** — resuelven problemas diferentes (evitar reenviar el prefijo vs. evitar regenerar salida semánticamente idéntica) y confundirlos entrega menos del objetivo de "una generación, no mil".
11. Usar la API por lotes para presembrar el caché de conceptos erróneos antes del lanzamiento y para rellenar nuevos tipos de conceptos erróneos encontrados en producción.
12. Cada regla rígida y línea de prompt necesita copia EN/ES/FR/PT/DE revisada por humanos — un tono que se lee como alentador en un idioma puede aterrizar como condescendiente en otro; no dejar esto a la traducción en tiempo de ejecución.

## Preguntas abiertas para el dueño del proyecto

1. ¿El ruteador de nivel de dificultad vive en el backend de Math Challenge (el motor de calificación etiqueta tema/nivel), o Larry Profe debería reclasificar la dificultad a partir del texto del problema?
2. ¿Cuáles son las bandas de edad reales (K-2/3-5/6-8/9-12, o por grado)? Esto determina tanto las variantes de vocabulario como el número de combinaciones de prompt cacheadas a redactar (locale × banda-de-edad × nivel podría ser 5×4×3 = 60).
3. ¿El `effort` de Opus 5 debería ser fijo por nivel, o ajustable por tema dentro de "avanzado" (una integral doble y una demostración completa de cálculo tensorial plausiblemente necesitan distinto esfuerzo)?
4. ¿Existe un presupuesto de latencia a nivel de producto (p. ej. "debe empezar a transmitirse en 2 s o mostrar un estado de carga") que debería condicionar el streaming por omisión por nivel?
5. ¿Quién revisa la copia de reglas rígidas y prompts en FR/PT/DE — un revisor de contenido educativo multilingüe, o traducción automática como primer borrador a partir de la versión EN/ES?
6. ¿El caché de conceptos erróneos necesita un TTL, o está bien servir indefinidamente una explicación cacheada para un concepto erróneo raro?
7. ¿"Lo que el estudiante hizo bien" siempre debe encontrar algo, incluso para una respuesta en blanco/adivinada — y si es así, cuál es el piso honesto (p. ej. "lo intentaste")?

## Fuentes

**Archivos del repo (rutas citadas arriba):**
- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (archivo completo)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (archivo completo — el precedente existente más cercano)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

All paths are relative to `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Datos de la API de Claude (de la skill `claude-api`, en caché desde 2026-06-24; no de memoria de entrenamiento):**
- IDs de modelo/precios: `claude-haiku-4-5` ($1/$5 por MTok), `claude-sonnet-5` ($3/$15, intro $2/$10 hasta 2026-08-31), `claude-opus-5` ($5/$25) — tabla "Current Models" de la skill.
- Economía del caché de prompt y el prefijo cacheable mínimo por modelo (Haiku 4.5 = 4,096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.
- API por lotes (50% de descuento, hasta 100,000 solicitudes por lote) — `python/claude-api/batches.md`.
- Razonamiento adaptativo activado por omisión en Opus 5, `output_config.effort`, el razonamiento se factura como salida — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.
- Salidas estructuradas (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.
- Objetivos de consulta de precio en vivo nombrados por la skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — no consultados por separado en esta pasada ya que la tabla en caché de la skill estaba vigente para los modelos necesarios.
