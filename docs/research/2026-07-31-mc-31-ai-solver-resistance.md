# The Solver Threat: AI Math Assistance in 2026 and What Actually Resists It

> Math Challenge research — 2026-07-31 — topic 31

## Resumen ejecutivo (ES)

Cualquier tarea reducible a "un número final, enviado como texto o foto" ya está
resuelta por la tecnología disponible: los solucionadores de consumo (Photomath,
Symbolab, Mathway, Microsoft Math Solver, Gauth, Wolfram|Alpha) devuelven una
respuesta con pasos en segundos para casi todo el currículo de primaria a
cálculo universitario [4][5][6], y los asistentes generales (GPT, Gemini,
Claude) ya superaron la matemática de competencia — AIME se considera
"saturado" porque los mejores modelos rondan el máximo posible [12] — y en
julio de 2025 un sistema de Google DeepMind alcanzó nivel de medalla de oro en
la Olimpiada Internacional de Matemáticas operando de extremo a extremo en
lenguaje natural, sin traducir el problema a un lenguaje formal como en 2024
[2][3]. La foto de la pantalla rompe casi cualquier defensa dentro de la app:
nunca toca el DOM, el teclado ni la API, así que ninguna medida de anti-copia
o límite de tiempo del cliente puede verla. El uso estudiantil ya es mayoría y
crece rápido: 88% de universitarios de Reino Unido usó IA generativa para
evaluaciones en 2025, frente a 53% en 2024 [1]; en EE. UU. el uso de ChatGPT
para tareas escolares entre adolescentes se duplicó de 13% a 26% en un año,
aunque las matemáticas siguen siendo el uso que los propios adolescentes
consideran menos aceptable (29% a favor, 28% en contra) [10]. Los detectores
de texto de IA no son salida: son evadibles con paráfrasis simple y penalizan
de forma desproporcionada a quien escribe en un segundo idioma [7][8] — no
deben usarse como puerta punitiva en una app bilingüe. La defensa que sí
funciona no es técnica sino de diseño de evaluación: pedir el proceso en vez
de la respuesta, pedir detectar el error en una solución ajena, exigir una
pregunta de seguimiento adaptativa con números distintos, y usar tareas de
manipulación interactiva cuya respuesta es un estado de UI, no texto copiable.

## Executive summary (EN)

Any math task reducible to "a single final number, submitted as text or a
photo" is already solved by tools students can access today: consumer solvers
(Photomath, Symbolab, Mathway, Microsoft Math Solver, Gauth, Wolfram|Alpha)
return a stepped solution in seconds across nearly the entire K-12-to-calculus
curriculum [4][5][6], and general assistants have moved past competition
math — AIME is now described by benchmark trackers as "saturated" because top
models sit near the ceiling [12] — and in July 2025 a Google DeepMind system
reached gold-medal standard at the IMO working end-to-end in natural language,
without the manual formalization into Lean its 2024 silver-medal predecessor
required [2][3]. A photo of the screen breaks nearly every in-app defense,
because it never touches the DOM, the keyboard, or the app's API — no
client-side anti-copy or timer can see it. Student use is already majority
behavior and rising fast: 88% of UK undergraduates used generative AI for
assessments in 2025, up from 53% in 2024 [1]; US teen ChatGPT-for-schoolwork
use doubled from 13% to 26% in a year, though teens rate math as the least
acceptable use case (29% approve, 28% disapprove) [10]. AI-text detectors are
not an escape hatch: they are evadable with simple paraphrasing and
systematically misclassify non-native-language writers [7][8] — unsuitable as
a punitive gate in a bilingual product. The defense that holds is assessment
design, not technology: ask for the process instead of the answer, ask the
student to find the error in someone else's worked solution, require an
adaptive follow-up with changed numbers, and use interactive manipulation
tasks whose graded output is a UI state, not a copyable string.

## Findings

### 1. Consumer math solvers: capability and reach

Photomath combines a computer-algebra system with OCR (extended to handwriting
recognition since 2016) to scan a printed or handwritten problem — including
word problems — and produce a step-by-step solution in seconds, spanning
"elementary through college" math: arithmetic, algebra, geometry, trigonometry,
statistics, and calculus [4][5]. Scale is large: as of 2021, over 220 million
downloads and roughly 2.2 billion problems solved per month [4]. Symbolab
explicitly advertises acceptance of "written pages and screenshots" alongside
typed notation and natural-language queries, covering pre-algebra through
calculus, trigonometry, physics, and statistics, framing output as
step-by-step rather than answer-only [6]. Wolfram|Alpha's strength is
symbolic/closed-form computation with free-form input — very strong on
canonical algebra, calculus, and equation-solving, historically weaker on
problems needing semantic parsing of an ambiguous word problem.
Camera-first apps such as Gauth (and Microsoft Math Solver, which adds
handwriting recognition and graphing to a similar OCR-plus-solver pipeline)
follow the same pattern: camera in, stepped answer out in seconds, several
with a live human-or-AI tutor chat layered on for anything the automatic
solver does not parse cleanly. The common thread is that these tools are
strongest exactly where school and practice-app problems are weakest by
design necessity: single, well-posed, closed-form problems with one correct
final answer.

### 2. General AI assistants: from AIME to IMO gold

Frontier LLMs have moved through and past the competition-math tier that used
to be a meaningful ceiling. AIME (a US qualifying olympiad exam) is now listed
by at least one benchmark tracker as an "archived" or saturated benchmark
because "performance on this benchmark has saturated" and providers have
stopped running new releases against it, with a top score of 98.12% recorded
for Gemini 3.1 Pro Preview and a note that nine of the ten top-ranked models on
the leaderboard are reasoning models [12]. Competition-grade natural-language
proof generation, the harder frontier, has also fallen further than expected.
In 2024, DeepMind's AlphaProof and AlphaGeometry 2 reached 28/42 points
(silver-medal standard) at the IMO, but only after problems were manually
translated into the formal language Lean, and the hardest problem took up to
three days of compute [3]. One year later, in July 2025, an advanced version
of Gemini with "Deep Think" reached 35/42 (gold-medal standard), solving five
of six problems perfectly, end-to-end in natural language — no formalization
step — within the same 4.5-hour-per-session limit human competitors face [2].
The IMO's own review confirmed the submitted solutions were "complete and
correct" but stated "their review does not extend to validating our system,
processes, or underlying model" [2] — these are graded artifacts, not audited
systems, and the result still involved substantial human curation of training
data and general problem-solving hints [2]. OpenAI separately reported
comparable gold-medal-level results for an experimental model around the same
period, though not run through the same official IMO coordination process;
treat that claim as directionally consistent with DeepMind's verified result
rather than an independently audited score. Where general models still fail
is the genuine research frontier: Epoch AI's FrontierMath sources problems
from professional mathematicians across number theory, real analysis,
algebraic geometry, and category theory that take experts multiple hours each,
with a top "Tier 4" tranche taking several days of expert effort — designed to
keep testing frontier systems as easier benchmarks saturate [11]. That is well
above anything a K-12/university practice app would assign, but it matters for
Math Challenge's ambition to reach PhD-level content: somewhere between "hard
problem set" and "open research problem," solvers stop being reliable, and
that boundary is worth knowing precisely before designing top-tier content.

### 3. Multimodal screenshot-to-answer: why cameras defeat in-app defenses

The mechanism that makes most in-app anti-cheat design irrelevant is simple: a
photograph of a screen is an out-of-band channel. It never enters the app's
DOM, never fires a keyboard or paste event, never touches its network
requests, and is invisible to any JavaScript-level defense (disabling
copy/paste, obfuscating source, blurring on tab-switch, watermarking, even
most in-browser proctoring). The photo leaves the device through the camera
and a second app or device — a surface the practice app cannot instrument at
all. Every consumer solver above is built around exactly this workflow —
camera in, stepped answer out, in seconds [4][5][6]. The newer wrinkle for
2026 is that this no longer needs a discrete "photo, wait for OCR" step: live
multimodal assistants (screen-share or continuous camera/vision modes across
GPT, Gemini, and comparable products) let a student share a screen in real
time and get a spoken answer conversationally, including narration of what to
do next — reading a problem off a moving or partially obscured screen,
mid-interaction. No purely client-side or purely time-based defense is
durable on its own; the two responses that do not depend on "can the student
get a photo out" are (a) requiring a submitted artifact that is not a single
reproducible string — a process, a UI manipulation state, a dialogue — and (b)
making one external round-trip cost more, cumulatively, than the points it
earns, via adaptive re-asking (§6 and Design Implications below).

### 4. How widespread AI use already is among students

This is not a marginal behavior. HEPI's December 2024 survey of 1,041 UK
full-time undergraduates (fielded by Savanta) found 92% had used any AI tool
and 88% had used generative AI specifically for assessments, up sharply from
53% a year earlier; time savings (51%) and perceived quality improvement (50%)
led stated motivations, with fear of cheating accusations (53%) and
hallucination risk (51%) the leading deterrents — not a lack of capability or
awareness [1]. Pew Research's January 2025 release (Ipsos, Sept–Oct 2024,
n=1,391 US teens 13–17) found 26% had used ChatGPT for schoolwork, double the
13% recorded in 2023 — and teens' own judgment of acceptability varies sharply
by task: 54% call it acceptable for researching a topic, but only 29% for
solving math problems (28% call it unacceptable), and 18% for writing essays
[10]. That asymmetry matters here: math is the subject students themselves are
most divided on, a real opening for a product whose scored/ranked surfaces can
credibly claim to resist casual solver use. Usage among people already given
AI access skews toward direct answer-seeking: Anthropic's analysis of roughly
575,000 academic Claude.ai conversations found Computer Science and STEM
heavily overrepresented relative to enrollment (Computer Science alone 36.8%
of conversations against 5.4% of US degrees), and close to half (~47%) of
conversations were "Direct" — seeking an answer or finished content with
minimal back-and-forth [9]. Task breakdown skewed toward higher-order work
(Creating 39.8%, Analyzing 30.2%) and away from recall (Remembering 1.8%) [9],
consistent with a "let the tool reason, I'll take the output" default —
precisely the behavior a practice app needs to make unrewarding.

### 5. The failure of AI-text detectors, and what it implies

Two lines of published research undercut the idea that a detector can gate
cheating reliably. First, detectors are demonstrably biased: GPT-detector
studies find they "consistently misclassify non-native English writing
samples as AI-generated, whereas native writing samples are accurately
identified," and the same simple prompting strategies that reduce this bias
also let a user evade detection entirely — the same lever cuts both ways [7].
Second, detectors are fragile to adversarial evasion generally: research
testing detection against ChatGPT and Claude text found paraphrasing, random
spacing, and adversarial perturbations "can significantly diminish detection
effectiveness," concluding current methods lack robustness against even
unsophisticated evasion [8]. The implication here is direct: any "explain your
reasoning" field cannot safely use an AI-detector as an automated pass/fail
gate — doing so would be trivially evadable and would risk disproportionately
flagging genuine work from Spanish-first or otherwise non-native writers in a
product whose own requirements mandate bilingual UX. Detection, where used at
all, belongs as a soft signal feeding human review, never an automated block.

### 6. Design responses that actually survive contact with a solver

The throughline across every mitigation that holds up is the same: stop
scoring a single, reproducible final artifact, and start scoring something a
solver cannot hand over in one shot — a process with graded intermediate
steps, a judgment about someone else's work, a live adaptive follow-up, or a
manipulated UI state. None of this makes a determined student solver-proof;
it raises the round-trips, translation work, and time cost per point earned —
the only lever a self-serve PWA actually controls. The table and Design
Implications below turn this into a concrete build catalogue.

## What survives a solver

| Item format | How easily a solver defeats it | Gradability |
|---|---|---|
| Plain final answer ("solve for x") | Trivial — seconds, near-total success [4][5][6] | Fully auto-gradable; weakest format |
| Single-step word problem | Easy for multimodal LLMs; OCR-only solvers weaker but closing | Auto-gradable with a parser |
| Multi-step word problem, named sub-quantities | Still defeated, but requires transcribing the whole problem | Auto-gradable per step; friction, not immunity |
| "Show your work" / full process | Solver generates a complete process to copy verbatim | Needs human/AI grading; copied text not reliably detectable [7][8] |
| "Spot the error in this solution" | Harder — solver must evaluate an argument, not just produce one | Auto-gradable (which line, what error) |
| Estimation / order-of-magnitude only | Weak alone — an exact solver answer trivially satisfies a range check | Easy to auto-grade; pair with justification |
| Interactive manipulation (drag point, build graph, balance equation) | Solver can describe the target, but performing the UI action still needs the student | Graded on final UI state, not a string |
| Multi-answer / select-all, misconception distractors | Moderate — brute solving gets the set, but targeted distractors weaken the shortcut | Fully auto-gradable |
| Adaptive follow-up (new numbers, same method) | Strong — catches "answered once" vs. "can repeat"; defeated only by re-querying every time | Auto-gradable, fully app-controlled |
| Socratic in-app tutor dialogue | Strong vs. static screenshots; degrades if solver text is pasted in | Needs its own grader — same arms race, one layer up |
| Live oral defense / synchronous check | Very strong | Needs live staff/infra; poor fit for a self-serve PWA |
| Original/novel research-level proof | Resists solvers and general LLMs at the true frontier [11][2][3] | Not gradable at scale; expert review only |

## Design implications

1. Default hint/challenge format: show a worked solution with one wrong step,
   ask which line and why — evaluating an argument beats producing one.
2. Replace the single-answer box with a structured multi-field process (each
   operation plus its intermediate result), graded per step, so a copied
   final answer without matching steps fails automatically.
3. Mandatory adaptive re-asking: follow a correct answer immediately with an
   isomorphic problem (same method, new numbers); "right once, wrong on the
   variant" is a real signal, especially in ranked/leaderboard modes.
4. Multi-answer/select-all items with distractors built from documented,
   topic-specific misconceptions, not generic "close numbers," so
   brute-solving is a weaker shortcut to the full correct set.
5. Gate exact-value questions behind an estimation-first step (score a range
   or order-of-magnitude answer before revealing the precise question),
   rewarding number sense a solver does not need.
6. Interactive manipulatives — drag a point on a number line, place points to
   build a graph, move terms to balance an equation — graded on the resulting
   UI state, not a typed number: the one format a solver cannot hand back as
   a copyable string even when it can describe the answer.
7. In-app Socratic tutor chat as the primary hint-seeking path, so asking for
   help produces a graded dialogue instead of a screenshot-extractable
   string; score partly on coherence and specificity of the student's own
   follow-up turns.
8. A short "explain it in your own words" field before an answer is accepted;
   use any AI-text signal only as a soft flag for human review, never an
   automated block, given detector bias against non-native writers and
   evadability by paraphrasing [7][8].
9. Ranked-mode time budgets short enough that a full external round-trip
   (photograph, OCR/solve, copy back) costs more than solving directly;
   untimed practice mode stays the openly low-friction, non-competitive
   surface.
10. Randomize numeric parameters server-side per student/attempt, so a
    screenshot, shared answer key, or cached web result does not transfer to
    another student's identical item.
11. Weight scoring toward consistency across many small items (streaks,
    portfolios) rather than single high-value items, reducing the payoff of
    solving any one item via outside help.
12. Confidence self-rating (1-5) alongside each answer; miscalibrated high
    confidence with mismatched reasoning is a useful, non-punitive signal.
13. Split the integrity story by mode: practice makes no solver-resistance
    claim; ranked/leaderboard mode concentrates adaptive follow-ups,
    process-grading, and short timers, since that is the surface whose
    integrity matters to other users.
14. Route PhD-adjacent "produce a novel proof" items to asynchronous human or
    peer review rather than auto-grading — the one format that still resists
    both consumer solvers and frontier models [11][2][3], and the one format
    nobody can auto-grade at scale.

**What we cannot prevent, stated plainly:** any task fully specifiable as
plain text or a single image with one verifiable final answer, submitted
without a required process or follow-up, will be solved in seconds by tools
already in wide student use — because the photo or live-vision channel never
touches the app at all. Live multimodal assistants further erode
time-pressure defenses, since a student can get spoken guidance while the
screen stays visible instead of round-tripping a static screenshot. No
detector-based gate is safe to use punitively. None of this is fixable by
engineering; it can only be made less rewarding (not the scored surface) or
more costly per point (adaptive design). A claim to the contrary is
marketing, not fact.

## Open questions for the project owner

1. Should ranked/leaderboard modes enforce a hard per-item time ceiling
   shorter than a typical photo-and-solve round trip — and what accommodation
   exists for students who genuinely need more time?
2. How much roadmap goes to an in-house Socratic tutor (own LLM cost,
   moderation, latency) versus adaptive-item and process-grading design with
   no generative component at all?
3. Should the product ever use AI-text-similarity signals in a bilingual
   EN/ES context, given documented detector bias against non-native writers —
   or is that class of check ruled out by policy?
4. For PhD-level content, is manual/peer review of open-ended proofs in
   scope, or does the top tier stay confined to auto-gradable formats
   (proof-critique, error-spotting) even if that caps how "PhD" it can be?
5. Should practice mode explicitly permit external tool use as a stated
   design choice, reframing the integrity narrative around ranked mode and
   mastery-over-time rather than implying practice answers are
   solver-resistant when they structurally cannot be?

## Sources

1. HEPI, "Student Generative AI Survey 2025" — https://www.hepi.ac.uk/2025/02/26/student-generative-ai-survey-2025/
2. Google DeepMind, "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the International Mathematical Olympiad" — https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/
3. Google DeepMind, "AI solves IMO problems at silver medal level" — https://deepmind.google/discover/blog/ai-solves-imo-problems-at-silver-medal-level/
4. Wikipedia, "Photomath" — https://en.wikipedia.org/wiki/Photomath
5. Photomath, official product site — https://photomath.com/en/
6. Symbolab, official product site — https://es.symbolab.com/
7. Liang et al., "GPT detectors are biased against non-native English writers," arXiv:2304.02819 — https://arxiv.org/abs/2304.02819
8. "MGTBench: Benchmarking Machine-Generated Text Detection," arXiv:2303.14822 — https://arxiv.org/abs/2303.14822
9. Anthropic, "Anthropic Education Report: How University Students Use Claude" — https://www.anthropic.com/news/anthropic-education-report-how-university-students-use-claude
10. Pew Research Center, "About a quarter of U.S. teens have used ChatGPT for schoolwork — double the share in 2023" — https://www.pewresearch.org/short-reads/2025/01/15/about-a-quarter-of-us-teens-have-used-chatgpt-for-schoolwork-double-the-share-in-2023/
11. Epoch AI, "FrontierMath" benchmark page — https://epoch.ai/benchmarks/frontiermath
12. Vals AI, AIME benchmark leaderboard — https://www.vals.ai/benchmarks/aime
13. Wolfram|Alpha, official "About" page — https://www.wolframalpha.com/about
14. Microsoft Education, product overview (Math Solver context) — https://www.microsoft.com/en-us/education/products/math-solver
