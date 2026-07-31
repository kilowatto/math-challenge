# Accessibility and learning differences in a global, all-ages math game

> Math Challenge research — 2026-07-31 — topic 38

## Resumen ejecutivo (ES)

- WCAG 2.2 añade requisitos que un juego táctil, cronometrado y multiedad toca de lleno: **2.5.8 Target Size (Mínimo, AA)** exige objetivos de ≥24×24 px CSS [1]; **2.5.7 Dragging Movements (AA)** exige alternativa sin arrastre [10]; **2.5.1 Pointer Gestures (A)** exige alternativa de un solo puntero para gestos multipunto [8].
- El conflicto central — puntuación por velocidad vs. **2.2.1 Timing Adjustable (A)** — se resuelve así: la "Essential Exception" cubre solo un límite de tiempo donde "extenderlo invalidaría la actividad" [2]. Eso justifica un modo "Speed Challenge" opt-in, no el modo por defecto, porque sí existe alternativa razonable (modo sin reloj).
- MathML Core es Candidate Recommendation Snapshot desde el 24 de junio de 2025 [3]; su propio texto dice que `alttext` "no define ningún comportamiento observable" — la semántica accesible de las fórmulas depende de MathJax + Speech Rule Engine, no del núcleo del estándar [3][11].
- Discalculia: 3–6% de la población [4], sin criterio diagnóstico consensuado; mejores intervenciones: manipulables concretos, recta numérica computarizada (*The Number Race*, *Graphogame-math*) y software adaptativo (*Calcularis*, *Meister Cody*) [4].
- Evidencia sobre fuentes especiales para dislexia (OpenDyslexic, Dyslexie) es débil a negativa: Rello & Baeza-Yates (2013) no hallaron mejora en tiempo de lectura; un estudio de 2016 mostró preferencia por Arial sobre fuentes "de dislexia"; uno de 2023 halló preferencia estética pero ninguna diferencia en resultados [5].
- La Ley Europea de Accesibilidad exige cumplimiento desde el **28 de junio de 2025**, incluyendo explícitamente comercio electrónico [7]; EN 301 549 (que incorpora WCAG 2.1 completo) es su referencia técnica [9]. La regla ADA Título II de EE. UU. exige WCAG 2.1 AA a gobiernos estatales/locales —incluidas escuelas públicas— para 2027/2028 [6].

## Executive summary (EN)

Math Challenge combines speed-scored gameplay, symbolic math rendering, ages 4–adult, five languages, and phone/tablet/desktop input — a harder accessibility surface than most single-audience apps. WCAG 2.2 adds criteria that bite directly: **2.5.8 Target Size (Minimum, AA)** requires ≥24×24 CSS px pointer targets, with four narrow exceptions [1]; **2.5.7 Dragging Movements (AA)** requires a non-dragging alternative for any drag mechanic [10]. The load-bearing conflict is **2.2.1 Timing Adjustable (A)** versus speed scoring; its **Essential Exception** — "the time limit is essential and extending it would invalidate the activity" [2] — is narrow and does not cover a gamified drill by default; the fix is architectural (a separate untimed mode plus an opt-in timed mode), detailed below.

MathML Core is a W3C Candidate Recommendation Snapshot (24 June 2025) whose own text says the `alttext` attribute has no defined observable behavior [3] — MathML Core standardizes rendering, not accessible semantics, which instead comes from MathJax's accessibility extensions built on the Speech Rule Engine [11], plus screen readers with math support (JAWS 16+, VoiceOver) [12]. Dyscalculia affects 3–6% of people [4], has no consensus diagnostic criterion, and its best-evidenced interventions — concrete manipulatives, computerized number-line training, adaptive drills — are close to what Math Challenge already builds [4]. Evidence for dyslexia-specific fonts is weak-to-negative; the British Dyslexia Association recommends ordinary sans-serif fonts instead [5]. Legally, the EU European Accessibility Act has applied since 28 June 2025 to consumer products/services including e-commerce [7], EN 301 549 (embedding WCAG 2.1 in full) is its technical backbone [9], and the 2024 US ADA Title II rule requires WCAG 2.1 AA for state/local government sites and apps — including public schools — by 2027/2028 [6], which will surface in school-district procurement even though it does not bind Math Challenge directly.

## Findings

### 1. WCAG 2.2: the new criteria that hit hardest here

WCAG 2.2 (October 2023) added nine success criteria over 2.1. Most relevant to a touch-first, drag-capable, timed math game:

- **2.5.8 Target Size (Minimum) — AA.** "The target for pointer input is at least 24 by 24 CSS pixels in size, except where: Equivalent... Inline... User Agent Control... Essential." [1] A floor, not a ceiling — the under-8 UI should target well above it.
- **2.5.7 Dragging Movements — AA (new).** "Functionality that can be operated by dragging movements can also be operated by single pointer activations without dragging, unless dragging is essential." [10] Any "drag onto the number line" mechanic needs a tap-to-place equivalent.
- **2.5.1 Pointer Gestures — A.** "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless... essential." [8]
- **2.5.4 Motion Actuation — A.** Device-motion input must also be operable via UI components, with motion response disable-able [8] — relevant if "tilt to answer" is ever considered.
- **1.4.10 Reflow — AA.** "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: vertical scrolling content at a width equivalent to 320 CSS pixels... Except for parts of the content which require two-dimensional layout for usage or meaning." [13] A geometry canvas can plausibly claim the exception; surrounding chrome (buttons, score, instructions) cannot.
- **1.4.1 Use of Color — A.** "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." [14] Directly implicated by color-coded correct/incorrect feedback or difficulty tiers.
- Other 2.2 additions (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) matter more for the account/portal layer; **3.3.8 Accessible Authentication** is worth flagging if any profile gate ever uses a puzzle/CAPTCHA-like cognitive test as the sole method.

### 2. The timing conflict, precisely stated

A speed-scored round sets "a time limit... by the content" — the trigger condition for **2.2.1 Timing Adjustable (A)**, satisfied only if the user can turn the limit off, adjust it ≥10x the default, extend it with warning, or it falls under the **Real-time Exception** ("a required part of a real-time event... and no alternative to the time limit is possible") or the **Essential Exception** ("essential and extending it would invalidate the activity") [2]. A 20-hour exception and a note tying this SC to 3.2.1 (Predictable) also exist [2]. Full resolution below.

### 3. Accessible mathematics: MathML Core, MathJax, screen readers

MathML Core is a **Candidate Recommendation Snapshot (24 June 2025)**, "not expected to advance to Proposed Recommendation any earlier than 30 September 2025" [3] — a deliberately reduced, browser-testable subset of MathML 3. Its own text: the `alttext` attribute "does not define any observable behavior that is specific to the alttext attribute" [3] — the spec standardizes rendering, not accessible semantics. Firefox and Safari have long supported MathML; Chromium added an implementation "at the beginning of 2023" [15]. Screen readers: **JAWS from version 16 supports MathML voicing and Braille output**; **VoiceOver reads MathML in Safari** [12]; NVDA math support exists via add-ons but wasn't confirmed from a primary source here and should be verified before launch.

**MathJax** "provides a powerful set of accessibility extensions that provide navigation, exploration, and voicing on the client," including Expression Zoom and, for offline/ePub, "alternative textual descriptions or more fine-grained speech annotations and Braille" [11]. Underneath it, the **Speech Rule Engine (SRE)** converts MathML/LaTeX structure into natural-language descriptions ("one half plus one third," not raw symbol names). **KaTeX** is faster but has weaker built-in accessibility tooling and typically needs a MathML fallback beyond decorative display math. Rendering formulas as images or canvas glyphs — a common kid-friendly-UI shortcut — produces nothing for a screen reader; MathML plus an accessibility layer is the only path that keeps notation available to blind/low-vision users at every age.

### 4. Dyscalculia: prevalence, identification, interventions

Dyscalculia is "a learning disorder, resulting in difficulty learning or comprehending arithmetic," which "does not reflect a general deficit in cognitive abilities or difficulties with time, measurement, and spatial reasoning" [4]. Prevalence: **3–6%**, comparable across genders [4]. **No consensus diagnostic criterion** exists; identification combines achievement tests, working-memory/executive-function assessment, teacher evaluation, and (in research) fMRI patterns [4]. Best-evidenced interventions cluster into three families: **concrete manipulatives** (Fuchs's tutoring paradigm — games, flashcards, manipulables) [4]; **computerized number-line training** (*The Number Race*, *Graphogame-math*) [4]; and **adaptive software** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. This is a close mechanistic match to Math Challenge's own category — a number-line and arithmetic-drill game — arguing for an explicit dyscalculia-informed mode rather than a bolt-on.

### 5. Dyslexia typography: the fonts are the weak part of the story

Uncontroversial and cheap: larger type, generous line spacing, shorter lines, left-alignment, no italics/all-caps in body text, solid but not extreme contrast. What does **not** hold up is the claim that dyslexia needs a special font. OpenDyslexic (Abbie Gonzalez, 2011) is the best-known example [5]. Evidence: **Rello & Baeza-Yates (2013)** found it "did not significantly improve reading time nor shorten eye fixation" [5]; a **2010 thesis** found Dyslexie "did not lead to faster reading" versus Arial [5]; a **2016 study** found dyslexic readers **preferred Arial** over dyslexia-specific typefaces [5]; a **2023 study** found aesthetic preference for OpenDyslexic (58%) but "no difference in the test scores based on which font was used" [5]. The British Dyslexia Association recommends ordinary sans-serif fonts instead [5]. **Conclusion:** do not build or license a "dyslexia font"; spend the effort on spacing, line length, and consistent iconography instead.

### 6. ADHD and attention in a gamified learning app

W3C's Cognitive Accessibility (COGA) work maps to three WCAG guideline headings: **2.2 Enough Time**, **2.4 Navigable**, **3.2 Predictable** [16], with deeper patterns in the "Making Content Usable" note. In product terms: predictable session structure, minimal competing visual/audio stimuli during active problem-solving, single-focus screens, and time limits adjustable or avoidable by default. Variable-reward and social-comparison mechanics — common ADHD-engagement hooks in commercial gamification — carry a documented stress/attention cost alongside engagement benefit (see topic 10 of this series) and should be treated as a trade-off, not a free win.

### 7. Autism and sensory design: motion, sound, predictability

`prefers-reduced-motion` has **Baseline widely available status since January 2020** [17] and lets an app honor an OS-level preference. Its documented rationale is **vestibular motion disorders** — scaling/panning animations causing dizziness or disorientation [17]; extension to autism/sensory sensitivity is well-established practice though not the specific claim quoted in the primary source used here. WCAG's **2.3.3 Animation from Interactions (AAA)** requires that "motion animation triggered by interaction can be disabled, unless the animation is essential" [18] — AAA, not mandatory at AA, but cheap and directly protective. Sound deserves the same treatment: a persistent, discoverable "reduce motion / reduce sound" toggle, defaulting to the OS signal.

### 8. Visual impairment and the geometry problem

Geometry is the hardest sub-domain for blind/low-vision users because its content is inherently spatial. The standard toolkit: **tactile graphics** (embossed/swell-paper or 3D-printed shapes); **Nemeth Braille Code** (Abraham Nemeth, first documented 1952), a six-dot system for linearizing math notation with full symbol coverage for triangles, circles, parallelograms, and relations like parallel/perpendicular/angle [19]; and **structured verbal description** — a fixed grammar (shape type, then vertices/sides, then angles, same order every time) that lets a screen-reader user build a mental model without a tactile device. For a web app, the near-term path is rigorous fixed-grammar text-alternative authoring plus keyboard-navigable, describable shape data — canvas pixels are invisible to a screen reader regardless of alt-text quality elsewhere.

### 9. Motor impairment and switch access

**2.5.2 Pointer Cancellation (A)** requires that single-pointer activation not fire on the initial down-event unless a safeguard applies (abort/undo, up-event reversal, or an essential down-event trigger) [8] — protecting users with tremor from accidental activation in a fast-tap interface. Full switch access additionally needs sequential keyboard/switch reachability with visible focus (2.4.7/2.4.11), and no interaction that requires a drag, pinch, or precisely timed double-tap without a single-switch alternative.

### 10. Colour blindness in a colour-coded game

Red-green deficiencies (protanopia, deuteranopia) are most common; tritanopia (blue-yellow) is rarer; achromatopsia (total, grayscale) affects a very small minority [20]. Core rule, consistent with 1.4.1 [14]: never let color alone signal correct/incorrect, difficulty, or category — pair every color cue with shape, icon, or text, and check the palette in grayscale simulation, not just against a "typical" viewer [20].

### 11. Captions and audio alternatives

Spoken-number prompts, tutorial video, and celebratory audio need synchronized captions/text equivalents and a sound-off path (the majority use case in schools and public settings) — standard WCAG 1.2.x territory, comparatively low-risk next to the harder problems above.

### 12. The legal layer

**EU European Accessibility Act (Directive 2019/882).** Binding compliance from **28 June 2025**: "all relevant products and services made available on the EU market must now comply with accessibility requirements" [7]. Scope explicitly includes personal computing devices, e-books, and **e-commerce services** [7]. Microenterprises (<10 employees, <€2M turnover) are exempt [7]; conformity is self-certified, with penalties varying sharply by member state [7]. **If Math Challenge sells EU subscriptions, it is plausibly in scope as an e-commerce service** — the highest-priority legal question here.

**EN 301 549.** The harmonized EU ICT accessibility standard; v3.2.1 "includes the text of WCAG 2.1 in full" [9] and is the technical reference for both the Web Accessibility Directive and the EAA, extending past websites to mobile apps and telecom services; Canada adopted it formally in 2024 [9].

**US ADA Title II (2024) / Section 508.** Requires state/local government entities — including public school districts — to meet **WCAG 2.1 AA** for web/app content, deadlines **26 April 2027** (pop. ≥50,000) / **2028** (smaller), with five narrow content exceptions [6]. Section 508 separately binds federal agency procurement [21]. Math Challenge isn't directly bound, but school-district buyers will likely require a WCAG 2.1 AA conformance statement (VPAT); building to WCAG 2.2 AA satisfies both regimes with margin.

## Conformance checklist — WCAG 2.2 AA criteria most at risk here

| SC | Level | Risk in Math Challenge | Design rule |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Answer chips/number pads sized for desktop | All targets ≥24×24 CSS px; ≥44×44 px for under-8 UI |
| 2.5.7 Dragging Movements | AA | Drag-to-number-line, drag-to-sort | Tap-to-select + tap-to-place alternative for every drag |
| 2.5.1 Pointer Gestures | A | Any pinch/swipe-to-answer | Single-pointer alternative; none essential by design |
| 2.5.2 Pointer Cancellation | A | Fast-tap scoring firing on touch-down | Activate on up-event/release, abort-by-drag-away |
| 2.2.1 Timing Adjustable | A | Speed-scored default mode | See "timing conflict" — untimed mode is the compliance path |
| 1.4.10 Reflow | AA | Geometry canvases, coordinate grids | Reflow all chrome at 320px; only the figure may need 2D layout |
| 1.4.1 Use of Color | A | Correct/incorrect, tier, category coding | Every color cue also carries icon/shape/text |
| 1.4.3 / 1.4.11 Contrast | AA | Bright, playful kid palettes | 4.5:1 text, 3:1 UI/graphics, checked against actual palette |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Custom game components, no native focus style | Visible, unobscured focus indicator everywhere |
| 3.3.8 Accessible Authentication | AA | "Solve to unlock" profile gates | No cognitive-function test as sole authentication method |

## The timing conflict — resolved

**2.2.1 Timing Adjustable (Level A)** applies whenever "a time limit... is set by the content" [2] — a speed-scored round unambiguously qualifies. The two exceptions that could cover it outright are narrow:

> "Real-time Exception: The time limit is a required part of a real-time event (for example, an auction), and no alternative to the time limit is possible." [2]

> "Essential Exception: The time limit is essential and extending it would invalidate the activity." [2]

Neither should be the sole compliance argument for the default experience, because a reasonable alternative plainly exists (an untimed mode teaching the same math). The Essential Exception is defensible only for a distinct, clearly-labeled **"Speed Challenge"** mode where timing genuinely *is* the activity being measured.

**Resolution:**
1. The **default learning mode** is untimed or standard-compliant (Turn off / Adjust ≥10x / Extend with warning) [2].
2. A separate, opt-in **Speed Challenge mode** retains hard timing and honestly invokes the Essential Exception.
3. Progression (streaks, unlocks) in the default mode is driven by accuracy/completion, not latency; speed is a bonus stat surfaced only in Speed Challenge.
4. This also matches the math-anxiety literature (topic 10 of this series): the clock is the documented amplifier of anxiety-linked performance drops, so removing it from the default path is evidence-aligned, not just a compliance workaround.

## Design implications

1. Render all math notation as MathML or accessible-ARIA markup via a MathJax-class accessibility layer — never canvas/image-only glyphs [3][11].
2. Default game mode untimed or timer-adjustable; quarantine hard timing to an opt-in "Speed Challenge" mode invoking the Essential Exception honestly [2].
3. All interactive targets ≥24×24 CSS px, ≥44×44 px for under-8 UI [1].
4. Every drag interaction ships a tap-select/tap-place alternative; drag is an enhancement, never the only path [10].
5. Never encode correct/incorrect, difficulty, or category in color alone; pair with icon/shape/text and check against protanopia/deuteranopia/tritanopia/achromatopsia simulations [14][20].
6. Ship a persistent "reduce motion/sound" control defaulting to `prefers-reduced-motion`, beyond the AAA-only 2.3.3, because the served population is real regardless of AA status [17][18].
7. Build a distinct **Dyscalculia / Number-Sense mode**: number-line-first presentation, concrete-manipulative visuals, adaptive ramp modeled on Number Race/Calcularis rather than a generic Elo curve; discoverable in settings, not gated behind a diagnosis (none is consensus) [4].
8. Do not build/license a "dyslexia font"; invest in line spacing, shorter instructional lines, left-alignment, legible standard sans-serif [5].
9. Every geometric figure gets a fixed-grammar structured text description (shape, then vertices/sides, then angles) plus keyboard-navigable/describable shape data, not canvas-only rendering [19].
10. Add a low-stimulus "Focus mode" for ADHD/attention: single-task screens, no competing animation/audio mid-problem, predictable structure, deferred celebratory effects — aligned to COGA's Enough Time/Navigable/Predictable [16].
11. Full switch/keyboard operability: sequential focus order, visible unobscured focus indicator, no interaction requiring multi-touch or precisely timed tap without a single-pointer alternative [8].
12. Caption/text-equivalent every spoken prompt and instructional clip; make the full problem-solving loop completable muted by default.
13. Treat the EU EAA as already binding (compliance date passed 28 June 2025) if selling to EU consumers; commission a VPAT-style self-assessment against EN 301 549 now [7][9].
14. Target WCAG 2.2 AA internally, a strict superset that pre-satisfies the WCAG 2.1 AA bar US school districts will require in procurement [6].

## Open questions for the project owner

1. Does Math Challenge sell to consumers physically in the EU today or within 12 months? Determines whether EAA compliance (already due since 28 June 2025) is live or forward-looking [7].
2. Is the public leaderboard a permanent core feature, or reframable as the opt-in Speed Challenge mode, keeping the default clock-optional?
3. Is US school-district adoption an actual go-to-market channel? If yes, a WCAG 2.1 AA VPAT becomes a sales asset, not just compliance [6].
4. Should geometry content be scoped to structured-text/keyboard-navigable shapes only, or does the older-age band need genuinely interactive canvas/SVG geometry (needing a larger accessibility investment)?
5. Budget/appetite for a MathJax-class accessibility rendering layer (SRE-based voicing) versus a lighter renderer like raw KaTeX with weaker built-in tooling?
6. Ship the reduce-motion/sound toggle at launch, or defer to a post-launch accessibility pass, given it's cheap, AAA-only, and protective for autistic/vestibular users [17][18]?

## Sources

1. W3C, WCAG 2.2, SC 2.5.8 Target Size (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum
2. W3C, WCAG 2.2, SC 2.2.1 Timing Adjustable — https://www.w3.org/TR/WCAG22/#timing-adjustable
3. W3C, MathML Core (Candidate Recommendation Snapshot, 24 June 2025) — https://www.w3.org/TR/mathml-core/
4. Wikipedia, "Dyscalculia" — https://en.wikipedia.org/wiki/Dyscalculia
5. Wikipedia, "OpenDyslexic" — https://en.wikipedia.org/wiki/OpenDyslexic
6. ADA.gov, "2024 Title II Web and Mobile App Accessibility Rule" — https://www.ada.gov/resources/2024-03-08-web-rule/
7. Wikipedia, "European Accessibility Act" — https://en.wikipedia.org/wiki/European_Accessibility_Act
8. W3C, WCAG 2.2, SC 2.5.1 Pointer Gestures / 2.5.2 Pointer Cancellation / 2.5.4 Motion Actuation — https://www.w3.org/TR/WCAG22/#pointer-gestures
9. Wikipedia, "EN 301 549" — https://en.wikipedia.org/wiki/EN_301_549
10. W3C, WCAG 2.2, SC 2.5.7 Dragging Movements — https://www.w3.org/TR/WCAG22/#dragging-movements
11. MathJax Project, accessibility features overview — https://www.mathjax.org/#accessibility
12. Wikipedia, "MathML" (screen reader support) — https://en.wikipedia.org/wiki/MathML
13. W3C, WCAG 2.2, SC 1.4.10 Reflow — https://www.w3.org/TR/WCAG22/#reflow
14. W3C, WCAG 2.2, SC 1.4.1 Use of Color — https://www.w3.org/TR/WCAG22/#use-of-color
15. Wikipedia, "MathML" (Chromium implementation history) — https://en.wikipedia.org/wiki/MathML
16. W3C WAI, Cognitive Accessibility overview — https://www.w3.org/WAI/cognitive/
17. MDN Web Docs, "prefers-reduced-motion" — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
18. W3C, WCAG 2.2, SC 2.3.3 Animation from Interactions — https://www.w3.org/TR/WCAG22/#animation-from-interactions
19. Wikipedia, "Nemeth Braille" — https://en.wikipedia.org/wiki/Nemeth_Braille
20. WebAIM, "Visual Disabilities: Color Blindness" — https://webaim.org/articles/visual/colorblind
21. Section508.gov, "Laws and Policies" — https://www.section508.gov/manage/laws-and-policies/
22. W3C, WCAG 2.2 Quick Reference (new success criteria in 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
