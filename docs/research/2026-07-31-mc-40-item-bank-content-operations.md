# Building and Operating a 2,500-Item Math Bank: What Real Learning Products Do

> Math Challenge research — 2026-07-31 — topic 40

## Resumen ejecutivo (ES)

Los productos educativos reales rara vez escriben cada ítem a mano. IXL
publica ~1,219 competencias de matemáticas para preescolar–8º grado [1] — no
ítems, sino *habilidades*, cada una respaldada por generación dinámica de
preguntas. Khan Academy usa Perseus, su editor/renderizador de ejercicios
[2], para mezclar autoría humana con variación paramétrica. WeBWorK muestra
el extremo opuesto: una plantilla en su lenguaje PG produce un número
ilimitado de variantes numéricas [5]. La investigación 2023-2026 sobre
generación de ítems con LLM es clara y modesta a la vez: los modelos generan
distractores matemáticamente válidos pero **no anticipan bien los errores
reales de los estudiantes** [arXiv 2404.02124] — por eso este banco no puede
automatizar la "explicación del error común" sin revisión humana.

Para 2,500 ítems en 5 idiomas, el plan reparte el trabajo así: ~40% generado
por plantillas paramétricas (fuerte en K-8, débil en posgrado/doctorado),
~29% redactado por LLM con revisión humana obligatoria, y ~31% escrito a mano
por especialistas (dominante en los niveles más altos). El costo de API del
LLM para redactar y traducir es, con aritmética mostrada abajo, del orden de
cientos de dólares — un error de redondeo frente al costo humano (SME,
editorial, traducción, revisión psicométrica), estimado en el orden de mil
días-persona. QTI 3.0 es adoptable de forma incremental (su propio modelo de
conformidad lo permite) [3][4]; no hace falta implementarlo entero para el
MVP.

## Executive summary (EN)

Real learning products rarely hand-write every item. IXL publishes ~1,219
math skills for PreK–8 [1] — not items, but *skills*, each backed by dynamic
question generation. Khan Academy uses Perseus, its own exercise
editor/renderer [2], to blend human authoring with parametric variation.
WeBWorK is the clean extreme: one problem in its PG language can produce
unlimited randomized numeric instances [5]. 2023–2026 research on LLM item
generation is clear and modest at once: models draft mathematically valid
distractors but are **not good at anticipating real student misconceptions**
[arXiv 2404.02124] — the reason this bank cannot automate the
"common-error explanation" step without human review.

For 2,500 items in 5 languages, the plan below splits work roughly 40%
parameterized templates (strong at K-8, weak at graduate/PhD), 29%
LLM-drafted with mandatory human review, and 31% handwritten by specialists
(dominant at the top of the ladder). LLM API cost for drafting and
translating, with arithmetic shown below, is on the order of hundreds of
dollars — a rounding error against human-hour cost (SME, editorial,
translation, psychometric review), estimated at roughly a thousand
person-days. QTI 3.0 is adoptable incrementally (its own conformance model
permits this) [3][4]; the MVP does not need the full spec.

## Findings

### How many items do real products actually have

Published, verifiable counts are scarcer than marketing copy suggests. IXL's
Spanish-locale math page states skill counts per grade band — Preescolar 73,
1st 117, 2nd 127, 3rd 183, 4th 130, 5th 125, 6th 112, 7th 108, 8th 144 —
summing to **1,219 skills across 9 grade levels** [1]. That is *skills*, not
items: each skill is a template-like category IXL generates practice
questions against dynamically, so the question count per skill is unbounded
the same way a WeBWorK problem is. No comparably precise total was found this
session for Khan Academy's exercise count, Brilliant's problem count, or
Kumon's worksheet count — those figures circulate in marketing and secondary
sources, but no primary page fetched this session stated a number, so they
are omitted rather than guessed. Wikipedia's Item Bank article describes the
lifecycle metadata item banks track (status: new/pilot/active/retired; usage
history) [item bank wiki] but gives no concrete size for any named program.

### Parameterized generation vs. handwritten authoring

Khan Academy's Perseus is its own repository's description of "Khan Academy's
exercise question editor and renderer" — a system for authoring, rendering,
and evaluating exercise responses, MIT-licensed but closed to external
contributions [2]. WeBWorK's PG ("Problem Generation") language is a
Perl-based authoring format built for randomization: instructors write one
problem, and parameterization lets each student session draw different
numeric values from the same template, producing an effectively unlimited
item pool from a single authored source [5] — the concrete "one template,
many items" pattern this project needs for K-8 arithmetic and early algebra.
Brilliant.org describes its approach as hybrid: content is "hand-crafted" by
a team spanning "math PhDs to engineers and designers," while machine
learning generates "on-the-fly visual and interactive" personalization
layered on top — and Brilliant states new review-set content is
"human-review[ed] everything," rolled out gradually for that reason
[brilliant about page]. The pattern across all three: templates and dynamic
generation multiply *volume*, but a human still designs the template and its
constraints.

Wikipedia's Automatic Item Generation (AIG) article frames the method: "a
test specialist creates a template called an item model; then, a computer
algorithm is developed to generate test items" — algorithms then "generate
families of items from a smaller set of parent item models," which "can
generate many more items in a given amount of time than a human test
specialist," reducing cost [AIG wiki]. No article gave a concrete
items-per-template multiplier or cost-reduction percentage this session.

### LLM-generated items: real but limited (2023–2026 research)

A concrete, citable data point: Feng, Lee, McNichols, Scarlatos, Smith,
Woodhead, Otero Ornelas, and Lan, "Exploring Automated Distractor Generation
for Math Multiple-choice Questions via Large Language Models" (arXiv
2404.02124), tests in-context learning and fine-tuning for generating
multiple-choice distractors on a real-world math dataset. Its headline
finding is exactly the constraint this project's schema design has to
respect: "although LLMs can generate some mathematically valid distractors,
they are less adept at anticipating common errors or misconceptions among
real students" [arXiv 2404.02124]. No numeric expert-review pass rate was in
the abstract text retrieved this session, so none is quoted — but the
qualitative finding is load-bearing: an LLM can write a plausible-looking
wrong answer, but whether it matches what a real student would actually
think is a harder problem current models under-perform at. Duolingo's
research page lists "Jump-Starting Item Parameters for Adaptive Language
Tests" (McCarthy et al., EMNLP 2021) [Duolingo research], addressing the
adjacent cold-start problem of estimating difficulty for freshly generated
items before real response data exists — a problem this bank faces for every
new item on day one.

### The item QA workflow and psychometric screening

Classical Test Theory (CTT) defines two per-item statistics any production
pipeline needs before trusting an item: the **p-value**, "the proportion of
examinees responding in the keyed direction" (difficulty — higher p means
easier), and **item discrimination**, computed via point-biserial
correlation between an item's score and the total test score, used "to
evaluate items and diagnose possible issues, such as a confusing distractor"
[CTT wiki; point-biserial wiki]. Neither article stated a numeric threshold
for "good enough" discrimination or difficulty, so none is asserted here.
What *is* documented: Computerized Adaptive Testing states "all items must be
pretested with a large enough sample to obtain stable item statistics. This
sample may be required to be as large as **1,000 examinees**" [CAT wiki] —
the only quantitative sample-size figure surfaced this session, and a useful
upper bound for how conservative real programs can be. Item Bank describes
the lifecycle metadata mature systems track: "item status (e.g., new, pilot,
active, retired)" and "item history (e.g., usage date(s) and reviews)" [item
bank wiki] — directly informing the `status` field below.

### Fixing an item after thousands of answers already reference it

No source addressed versioning directly, but the lifecycle-status pattern
[item bank wiki] implies the answer: an item with response data attached is
never edited in place — statistics are computed against the exact wording
students answered, and silently changing it invalidates every prior
response's contribution. The safe pattern: create a new version, retire the
old one (`status: retired`, never deleted), start a fresh statistics window.

### QTI 3.0 — is it worth it for a startup

1EdTech's QTI 3.0 is the standard for "exchanging assessment items, tests,
usage data, and results reporting between different applications,"
consolidating earlier QTI versions and the APIP accessibility standard, with
native Computer Adaptive Testing and Portable Custom Interaction support,
and built-in Section 508 / WCAG 2.1 AA accessibility [3]. Its own
implementation guidance is explicit that conformance is **modular**: "the
needs of the assessment program generally dictate which of the many QTI 3
features are used," and conformance/certification is a separate document
precisely so organizations can adopt a subset [4]. A minimal path — core
XML/XSD validation, basic choice/text-entry interactions, response-processing
templates, standard packaging, core accessibility markup — works without
touching adaptive testing or Portable Custom Interactions [4]. QTI 3.0 is
not all-or-nothing: deferring CAT/PCI while gaining interoperability and
accessibility scaffolding for the MVP's item types is a genuine option.

### Localization workflow across 5 languages

No source described a math-specific translation workflow, so this is
derived reasoning. The fact worth carrying from the AIG/WeBWorK material:
translation cost scales with *distinct authored content*, not generated item
count. A template's fixed text ("What is __ + __?") is translated once per
language and covers every numeric variant it ever generates, while a
handwritten or LLM-drafted item's full text is translated per item — the
single biggest lever in the cost model below.

### Real cost-per-item figures from the assessment industry

None found and independently verified this session. Fetch attempts at AIR,
NCIEA, and ETS resource pages returned 404s or no cost figures; ETS's
research homepage stated only "11.9K publications" exist, no cost figure
[ETS research page]. Industry blogs commonly cite per-item costs in the low
thousands of dollars — but since no primary source was retrieved live this
session, that figure is **not** used below. The cost model instead derives
entirely from stated LLM API pricing and explicit, labeled person-day
assumptions.

## Benchmarks table

| Product / system | Item or skill count | Generated or handwritten | Source |
|---|---|---|---|
| IXL (math, PreK–8) | ~1,219 skills (9 grade bands) | Curated skill categories; questions generated dynamically per skill | [1] |
| Khan Academy (Perseus) | Not verified this session | Hybrid: human-authored exercise definitions rendered/varied by Perseus | [2] |
| WeBWorK (PG language) | Large library; count not verified | Template-based: one PG problem yields unlimited randomized instances | [5] |
| Brilliant.org | Not stated publicly | Hybrid: hand-crafted foundation + ML on-the-fly personalization, human-reviewed | [brilliant about] |
| Duolingo (item calibration research) | N/A — language testing | Algorithmically generated items; ML-assisted difficulty calibration for cold-start items | [Duolingo research] |
| NWEA MAP Growth (CAT) | Not verified this session | CAT bank; pretest samples cited up to 1,000 examinees for stable statistics | [CAT wiki] |
| General AIG practice | No universal figure | Test specialist authors an "item model"; algorithm generates item families from it | [AIG wiki] |

## A concrete 2,500-item MVP plan

**Level bands and item counts** (pyramid — most items where most users are):

| Band | Items |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Undergraduate (intro) | 350 |
| Advanced undergrad / Masters | 150 |
| PhD / research | 100 |
| **Total** | **2,500** |

**Share by source, per band** (template share falls and handwritten share
rises as level climbs — templates struggle with proof-based advanced
content, and misconception nuance matters most where LLMs are weakest):

| Band | Template % / items | LLM-drafted % / items | Handwritten % / items |
|---|---|---|---|
| K–2 | 70% / 210 | 20% / 60 | 10% / 30 |
| 3–5 | 60% / 240 | 25% / 100 | 15% / 60 |
| 6–8 | 50% / 225 | 30% / 135 | 20% / 90 |
| 9–10 | 35% / 140 | 35% / 140 | 30% / 120 |
| 11–12 | 30% / 105 | 30% / 105 | 40% / 140 |
| Undergraduate | 20% / 70 | 30% / 105 | 50% / 175 |
| Advanced/Masters | 10% / 15 | 30% / 45 | 60% / 90 |
| PhD | 5% / 5 | 25% / 25 | 70% / 70 |
| **Total** | **1,010 (40.4%)** | **715 (28.6%)** | **775 (31.0%)** |

**The review gate** (every item passes all stages; only per-stage effort
differs): SME authoring / template design → editorial pass → math accuracy
check → accessibility review (alt text, screen-reader-safe notation) →
translation (4 target languages) → pilot (collect real responses) →
psychometric screening (promote to `active` only once response count is
sufficient — implication 4). Handwritten items enter at "SME authoring";
LLM-drafted items enter with a draft in hand but go through every
downstream stage; template-generated items skip per-item authoring, but the
*template* goes through the same gate once.

**Item JSON schema — fields required:**

```
item_id, version, status, level_band, topic_tag, source_type, template_id,
languages{locale: {stem, choices, correct_answer, worked_solution,
  misconceptions[]}}, stem_canonical, choices, correct_answer,
worked_solution_canonical, misconceptions[{trigger_answer, explanation,
  remediation_hint}], difficulty_estimate_initial, irt_parameters{a, b, c,
  n_responses, last_calibrated_at}, p_value, point_biserial,
accessibility_metadata{alt_text, mathml, contrast_notes}, media[],
authoring_metadata{author, reviewer, created_at, reviewed_at, notes},
qti_export_ref, curriculum_tags[], retirement_reason
```

**Effort in person-days** (each figure a labeled estimate; arithmetic shown):

- Template design: 50 templates (≈20 variants/template covering the 1,010
  template items) × 0.5 day = **25 days**; one-time parameterization engine
  build **~15 days** (not per-item).
- LLM-drafted item review/correction: 715 × 0.15 day = **~107 days**.
- Handwritten authoring: 615 items (K-2–undergrad, 0.5 day each) + 160
  (Advanced+PhD, 1.0 day each, scarcer specialist time) = **~468 days**.
- Translation review (bilingual SME spot-check of LLM translation, not
  independent re-translation): 50 templates × 4 languages = 200 units, plus
  1,490 items × 4 languages = 5,960 → **6,160 units** × 0.05 day = **~308
  days**.
- Editorial + accessibility pass, uniform: 2,500 × 0.05 day = **~125 days**.
- Psychometric batch review: 2,500 / 50 per batch × 0.1 day = **~5 days**
  (excludes calendar time waiting for pilot responses — a timeline
  constraint, not an effort cost).

**Total: 25+15+107+468+308+125+5 ≈ 1,053 person-days**, roughly 4.2
person-years. A 5-person team (2 math SMEs, 1 localization lead, 1
editor/psychometrician, 1 engineer) clears this in ≈1,053÷5 ≈ **210 working
days, roughly 10 months** — a derived estimate, not a cited industry figure.

**Estimated LLM cost for drafting + translating** (Claude Sonnet 5 standard
pricing: $3.00 input / $15.00 output per million tokens):

- LLM-drafted items, first draft (~1,500 input + ~800 output tokens/item):
  (1,500×$3 + 800×$15)/1,000,000 = **$0.0165/item** × 715 ≈ **$12**.
- Handwritten items, LLM-assisted misconception drafting only (same token
  profile): 775 × $0.0165 ≈ **$13**.
- Template-authoring assistance (~5,000 input + 2,000 output
  tokens/template): $0.045/template × 50 ≈ **$2**.
- Translation (~800 input + ~900 output tokens/unit): $0.0159/unit × 6,160
  units ≈ **$98**.

**Raw single-pass total ≈ $125.** A 5× safety multiplier for realistic
iteration (validation retries, review-triggered regeneration, Opus 5 for the
hardest bands) gives **≈ $500–$700** total for the whole drafting and
translation pass — still under $1,500 doubled for contingency, three orders
of magnitude below the person-day labor cost. Prompt caching would reduce
this further but is not counted here.

## Design implications

1. Use parameterized templates for K–8 arithmetic and early algebra — one
   WeBWorK-style template yielding unlimited numeric variants [5] is the
   highest-leverage lever in this plan.
2. Reserve handwritten-authoring budget for 11–12 through PhD, where
   templates get their lowest share (30% down to 5%) because proof-based
   content resists safe randomization.
3. Translate templates, not generated instances: 200 translation units
   cover 1,010 template items versus 5,960 units for one-off items — the
   biggest localization lever in the model.
4. Treat p-values and point-biserial discrimination as provisional until
   responses accumulate; CAT literature cites samples up to 1,000
   examinees for stable pretest statistics [CAT wiki] — don't auto-promote
   an item to `active` below a clearly-stated minimum (open question 4).
5. Version items immutably. Never edit an item with responses attached —
   create a new version, retire the old (`status: retired`, never
   deleted), mirroring the new/pilot/active/retired lifecycle documented
   for item banks generally [item bank wiki].
6. Adopt QTI 3.0 incrementally — its conformance model is explicitly
   modular [4]; implement core interactions and accessibility metadata for
   the MVP and defer CAT/PCI support.
7. Build the review gate as an explicit state machine matching the
   `status` field: draft → editorial → math check → accessibility →
   translation → pilot → psychometric screening → active/retired.
8. Budget LLM API cost as negligible (hundreds of dollars) relative to
   human review cost (hundreds of thousands, per the person-day math
   above) — the real constraint is SME and translator time, not tokens.
9. Because 2023–2026 research shows LLMs draft mathematically valid but
   misconception-blind distractors [arXiv 2404.02124], require human
   misconception review on every LLM-drafted or LLM-assisted item — never
   ship an unreviewed LLM misconception explanation to Larry.
10. Expect template ROI to fall sharply near the top of the level pyramid:
    design cost per template is roughly fixed regardless of difficulty, but
    a PhD template yields far fewer safely-usable variants than a K-2 one —
    the plan already weights template share down as level rises.
11. Sequence translation *after* math check and accessibility review, not
    before — translating content that later fails technical review wastes
    translator time.
12. Cache the shared instruction/schema/style-guide text across drafting and
    translation calls; 715+775+6,160 calls share a large stable prefix, so
    prompt caching can cut realized LLM cost further below the estimate.
13. Plan for item-exposure control once the platform supports adaptive
    delivery — even a 2,500-item bank benefits from the exposure-control
    principle CAT systems use to avoid over-showing popular items [CAT wiki].
14. Treat every effort-day and cost figure here as an estimate to validate
    against a pilot, not a fixed target — no source gave a verified
    items-per-template multiplier or per-item cost for math content
    specifically; the 20×-per-template and $/item numbers are modeled
    assumptions, labeled as such.

## Open questions for the project owner

1. What loaded daily rate should we assume for SME/translator/editor time,
   to convert the ~1,053 person-days above into a budget figure?
2. Is 2,500 items a firm target or a floor, with headroom reserved for
   topics that need more items once pilot data comes back?
3. Which of the 4 non-English languages can use LLM-translation-plus-
   spot-check (as modeled above), and which need independent human
   translation from day one?
4. What minimum response count should gate promotion to `active` — the
   traditional CTT rule-of-thumb (often ~30), or the more conservative
   ~200–1,000 range CAT literature cites for stable statistics [CAT wiki]?
5. Should the review gate block on QTI 3.0 export at MVP, or defer that to
   a post-MVP interoperability milestone?
6. Advanced/Masters and PhD carry the lowest template share and highest
   per-item cost — should we budget a specialized contractor SME for just
   those two bands?
7. Should Larry's misconception explanations be authored once in English
   and translated, or independently per language (e.g., decimal comma vs.
   point confusion across ES/FR/DE)?

## Sources

1. [IXL — Math (Spanish locale, skill counts by grade)](https://la.ixl.com/math)
2. [Khan/perseus — Khan Academy's exercise question editor and renderer](https://github.com/Khan/perseus)
3. [1EdTech — QTI standards overview](https://www.1edtech.org/standards/qti)
4. [1EdTech — QTI 3.0 implementation/conformance guidance](https://www.imsglobal.org/spec/qti/v3p0/impl)
5. [Wikipedia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)
6. [Wikipedia — Automatic item generation](https://en.wikipedia.org/wiki/Automatic_item_generation)
7. [Wikipedia — Classical test theory](https://en.wikipedia.org/wiki/Classical_test_theory)
8. [Wikipedia — Point-biserial correlation coefficient](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)
9. [Wikipedia — Item bank](https://en.wikipedia.org/wiki/Item_bank)
10. [Wikipedia — Computerized adaptive testing](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)
11. [Wikipedia — Item response theory](https://en.wikipedia.org/wiki/Item_response_theory)
12. [Wikipedia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)
13. [Duolingo Research — publications page](https://research.duolingo.com/)
14. [arXiv 2404.02124 — Exploring Automated Distractor Generation for Math Multiple-choice Questions via Large Language Models (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)
15. [Brilliant.org — About](https://brilliant.org/about/)
16. [ETS Research Institute — homepage](https://www.ets.org/research.html)
