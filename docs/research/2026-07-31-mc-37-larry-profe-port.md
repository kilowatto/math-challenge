# Larry Profe — porting Larry to Math Challenge
> Math Challenge research — 2026-07-31 — topic 37

## Resumen ejecutivo (ES)

Larry ya existe en IOS como copiloto EN/ES sobre Workers AI (`kimi-k2.6` → `gpt-oss-120b` → respuesta enlatada), con un prompt de sistema bilingüe único, un protocolo de "tool calling" hecho a mano (JSON en una línea) y auditoría durable en D1. Nada de esto usa la API de Claude — sería la primera integración de Claude en este repo.

El dueño ya decidió: Larry Profe usa la **API de Claude** con **ruteo por dificultad** (Haiku/Sonnet/Opus). El precedente más cercano en el repo no es el chat libre sino `src/larry/contador/explain.ts`: un hallazgo determinístico entra, un LLM lo explica en lenguaje natural sin recalcular nada, con fallback a plantilla. Larry Profe debe seguir exactamente ese patrón: el motor de calificación decide qué está bien o mal; Claude solo explica, en el idioma, edad y tono correctos, nunca avergonzando al niño.

## Executive summary (EN)

Larry-in-IOS runs on Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → canned reply), with a hand-rolled single-line-JSON tool-calling protocol and a durable D1 audit sink. It never touches the Claude API — Larry Profe would be this repo's first Claude integration, not a reuse of existing plumbing.

The owner has decided Larry Profe uses the **Claude API** with **model routing by difficulty** (Haiku/Sonnet/Opus). The closest existing precedent is not the free-form chat endpoint but `src/larry/contador/explain.ts`: a deterministic-finding-in, LLM-explains-it-out pattern with a hard "never compute, only cite what's in the JSON" rule and a template fallback. Larry Profe should follow that shape: Math Challenge's own grading engine is the source of truth on correctness; Claude's only job is turning a structured verdict into a warm, age-appropriate, five-language explanation — never re-deriving the math itself.

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

| Difficulty band | Model ID | $/MTok in / out | Est. tokens in → out | Est. cost / 1,000 explanations | Latency target |
|---|---|---|---|---|---|
| Basic arithmetic | `claude-haiku-4-5` | $1.00 / $5.00 | ~300 → ~150 | **~$1.05** | < 1.5 s, no streaming needed |
| Mid-tier (fractions, algebra, geometry) | `claude-sonnet-5` | $3.00 / $15.00 (intro $2/$10 thru 2026-08-31) | ~500 → ~300 | **~$6.00** (intro **~$4.00**) | 2–4 s, stream if > ~3 s |
| Advanced (tensor calculus, double integrals, proofs) | `claude-opus-5` | $5.00 / $25.00 | ~800 → ~600 + adaptive thinking | **~$19 floor, realistically $35–60** once thinking tokens are counted | 5–15 s; must stream |

Notes:

- **Opus 5 cost is thinking-token-dominated.** Per the skill, thinking is **on by default** on Opus 5 — a request that never sets `thinking` still thinks, and thinking is billed as output at $25/MTok. A hard explanation may spend 1,000–2,000 thinking tokens before the 600-token answer, adding ~$25–50/1,000 calls on its own. Disabling thinking has real failure modes (tool calls or `<thinking>` tags leaking into visible text, per `shared/model-migration.md`), so the safer lever is **`output_config.effort`** — start Opus 5 at `medium` and raise only if evaluation shows shallow explanations.
- **Haiku 4.5 needs a 4,096-token cacheable prefix.** Per `shared/prompt-caching.md`'s per-model minimum table, Haiku 4.5's floor is 4,096 tokens (highest of any current model; Opus 5/Fable 5 need only 512). A basic-arithmetic system prompt (persona + rules + one age band + one language) is likely well under that, meaning **Haiku calls may never hit prompt caching** unless the prefix is deliberately padded — flag this to the owner rather than assuming caching "just works" on the cheapest tier.
- **Batch API (50% off) fits pre-generation, not live traffic.** A live in-session explanation can't batch, but pre-generating the top-N known misconceptions per topic/age/language ahead of launch is exactly the Batch API's use case (up to 100K requests/batch, non-latency-sensitive).

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

1. **Claude prompt caching** on the stable prefix (persona + rules + one language + one age band). Per-model, per-prefix — writes cost 1.25× (5-min TTL) or 2× (1-hour), reads ~0.1×. A 1-hour TTL with periodic pre-warming (`max_tokens: 0` requests, per `shared/prompt-caching.md`) suits bursty homework-hours traffic. Skip for Haiku unless the prefix clears 4,096 tokens (see above).
2. **Application-level misconception cache (D1/KV)** — the mechanism the owner's brief actually asks for. Cache the **whole generated explanation**, keyed by `(topic, misconception-classification, age-band, locale)` — not exact problem instance, so different fraction problems with the same "forgot common denominator" error hit one cache entry. Mirrors the existing static `S3_ERROR_KB`/`METRIC_KB` lookup pattern (`src/larry/tools.ts:59-135`), except populated by Claude output at generation time; fall back to a live call on miss and populate the cache, mirroring `contador/explain.ts`'s AI-then-template shape. Record `cache_hit: boolean` and real `usage.input_tokens`/`usage.output_tokens` in an audit table analogous to migration `0011` — not the `text.length/4` estimate `audit.ts` uses today.
3. **Batch API for cold-start seeding** — pre-generate the top-N misconceptions per topic before launch at 50% off, converting most early traffic into cache reads from day one.

## Design implications

1. Larry Profe is a **new Claude API integration**; do not route it through IOS's Workers AI gateway — the owner wants Claude, and ADR-006 is a different, Workers-AI-first architecture for a different product.
2. Model the **grading engine as source of truth**, Claude as explain-only — follow `contador/explain.ts`'s shape, not `chat.ts`'s free-form tool loop.
3. Drop the bilingual-inline-prompt pattern; one prompt per locale, since 5 languages makes cross-language drift within one prompt both expensive and error-prone.
4. Take locale as an **explicit parameter** from the client (Math Challenge already has a language setting) rather than inferring it the way `locale.ts` does for IOS.
5. Build the difficulty-tier router in Math Challenge's backend (next to grading, which already knows topic/tier) — never let Claude choose its own model tier.
6. Treat `effort` as a second routing axis independent of model choice; start conservative (`medium` on Opus 5) since it's the primary lever against thinking-token cost blowup.
7. Record real Claude `usage` fields in the audit sink from day one instead of repeating `audit.ts`'s character-count estimate.
8. Write a child-safety hard-rule canon parallel to `docs/larry.md` §4.2's five-item list, but from scratch — IOS's rules are about data safety, not emotional safety.
9. Reuse `LarryAvatar` and its state machine unchanged, but reconsider whether `denying` should ever fire at a child.
10. Keep the misconception cache and Claude's prompt caching as **distinct systems** — they solve different problems (avoiding prefix re-send vs. avoiding re-generating semantically identical output) and conflating them under-delivers on the "one generation, not a thousand" goal.
11. Use the Batch API to pre-seed the misconception cache before launch and to backfill new misconception types found in production.
12. Every hard rule and prompt line needs human-reviewed EN/ES/FR/PT/DE copy — tone that reads as encouraging in one language can land as condescending in another; don't leave this to runtime translation.

## Open questions for the project owner

1. Does the difficulty-tier router live in Math Challenge's backend (grading engine tags topic/tier), or should Larry Profe re-classify difficulty from problem text?
2. What are the actual age bands (K-2/3-5/6-8/9-12, or by grade)? This drives both vocabulary variants and the number of cached prompt combinations to author (locale × age-band × tier could be 5×4×3 = 60).
3. Should Opus 5's `effort` be fixed per tier, or tunable per-topic within "advanced" (a double integral and a full tensor-calculus proof plausibly need different effort)?
4. Is there a product-level latency budget (e.g. "must start streaming within 2s or show a loading state") that should gate default streaming per tier?
5. Who reviews the FR/PT/DE hard-rule and prompt copy — a multilingual education content reviewer, or machine translation as a first draft from the EN/ES version?
6. Does the misconception cache need a TTL, or is a cached explanation for a rare misconception fine to serve indefinitely?
7. Must "what the student did right" always find something, even for a blank/guessed answer — and if so, what's the honest floor (e.g. "you tried")?

## Sources

**Repo files (paths cited above):**
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

All paths are relative to `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Claude API facts (from the `claude-api` skill, cached 2026-06-24; not from training memory):**
- Model IDs/pricing: `claude-haiku-4-5` ($1/$5 per MTok), `claude-sonnet-5` ($3/$15, intro $2/$10 thru 2026-08-31), `claude-opus-5` ($5/$25) — skill's "Current Models" table.
- Prompt caching economics and per-model minimum cacheable prefix (Haiku 4.5 = 4,096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.
- Batch API (50% discount, up to 100,000 requests/batch) — `python/claude-api/batches.md`.
- Adaptive thinking on by default on Opus 5, `output_config.effort`, thinking billed as output — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.
- Structured outputs (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.
- Live-pricing fetch targets named by the skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — not fetched separately in this pass since the skill's cached table was current for the needed models.
