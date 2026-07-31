# UI/UX design for children aged 7-11 (PRIMARY / ELEMENTARY band)

> Math Challenge research — 2026-07-31 — topic 21

## Resumen ejecutivo (ES)

La franja PRIMARIA (7-11) corresponde al estadio "operacional concreto" de
Piaget: razonan con lógica sobre objetos concretos y ganan "decentración"
(atender varias dimensiones a la vez), pero aún no manejan bien lo abstracto
[1]. NN/g documenta que esta franja navega con más independencia que los
prelectores de 3-5 años, pero sigue rechazando contenido dirigido incluso un
grado escolar por encima o por debajo del propio [2]. Un estudio de avatares
(arXiv, 48 participantes de 8-13 años) documenta el "efecto armario": los
niños crean varios avatares pero usan sistemáticamente solo uno [4]. La
investigación de NN/g sobre adolescentes (100 usuarios de 13-17, 210 sitios)
marca el techo que PRIMARIA debe evitar tocar por abajo: los adolescentes
rechazan la palabra "Kids" y el exceso de animación decorativa [3]. COPPA
exige consentimiento parental verificable para menores de 13 años y limita
qué datos pueden recogerse, restringiendo cualquier función social en esta
franja [9]. La discalculia (5-10% de la población) exige representar
cantidades de forma visual además de numérica y evitar presión de tiempo
[11]. Este informe traduce estos hallazgos en una especificación para el
tema PRIMARIA, diferenciada de KINDER y de TEEN, por teléfono, tableta y
escritorio.

## Executive summary (EN)

The PRIMARY band (ages 7-11) sits in Piaget's "concrete operational" stage:
logical reasoning about concrete objects plus "decentration" (attending to
more than one dimension at once), but still weak abstract reasoning [1].
NN/g shows this band navigates more independently than 3-5-year-old
pre-readers, yet still rejects content pitched even one grade level off [2].
An avatar study (arXiv, 48 participants aged 8-13) documents the "wardrobe
effect": children build several avatars but consistently settle on one [4].
NN/g's teen research (100 users aged 13-17, 210 sites) marks the ceiling
PRIMARY must avoid touching from below: teens reject the word "Kids" and
excess decorative animation [3]. COPPA requires verifiable parental consent
under 13 and restricts data collection, directly constraining any social
feature in this band [9]. Dyscalculia (5-10% of the population) requires
pairing numerals with a visual quantity and avoiding time pressure [11].
This report turns these findings into a spec for the PRIMARY theme,
differentiated from KINDER and TEEN, across phone, tablet, and desktop.

## Findings

### 1. Cognitive development: what 7-11 can actually do

Piaget's concrete operational stage covers this range: conservation,
inductive reasoning, and "decentration" — tracking more than one on-screen
variable rather than fixating on one — but still weak abstract/hypothetical
reasoning, arguing against UI that requires holding a rule in mind without a
concrete anchor (number line, grouping, worked step) [1]. NN/g's own
buckets split "mid-range" 6-8 (still scaffolded) from "older" 9-12
(independent navigation, stronger reading) [2], so PRIMARY is not internally
uniform — a 7-year-old sits closer to KINDER, an 11-year-old closer to TEEN.

### 2. "Cool" versus "babyish": the rejection mechanism

The clearest citable evidence on the *upper* boundary comes from NN/g's teen
corpus: teens (13-17) explicitly reject the word "Kids," dislike cluttered
or garish visuals, and want clean, purposeful interactivity, with separate
labeled "Kids" and "Teens" sections where both exist [3]. The mechanism is
rejection of a stale self-image, not a detail preference — a child moving
through 7-11 is renegotiating "not a little kid anymore" well before
becoming a teen, so PRIMARY must signal more capability than a mascot-and-
bubbles skin without adopting the flatter, denser look teens prefer [3].

### 3. Avatars and customization as identity work

A 2026 study of 48 children aged 8-13 building avatars in social games found
four motivations: self-representation, experimenting with alternate
identities, social needs, and gameplay performance; monetization design
measurably shapes what children build [4]. Its headline finding is the
"wardrobe effect" — children create several avatars but converge on using
just one, so the customization *process* is where value lives even though
the final product is narrow [4]. Digital Wellness Lab's synthesis adds that
avatars work best expressing a current-or-aspirational self, and that
inclusion matters concretely: 42.1% of girls and 38.6% of boys in the cited
research avoid games depicting female characters in a hypersexualized way
[5]. A related Frontiers study (82 participants, ethnicity-stratified) found
customization vs. pre-assigned avatars barely changed immediate mood, but
satisfaction tracked how well the options represented the child's own
identity — under-representation functions like a "subtle microaggression"
[6]. Loot-box-style random purchases are flagged as a distinct monetization
risk, with boys engaging more than girls [5].

### 4. Collectibles, progression, and motivation

Self-determination theory frames the levers: autonomy (choice in how to
progress), competence (calibrated challenge with clear feedback), and
relatedness (a social dimension); extrinsic rewards sustain motivation only
when they read as feedback on competence rather than a controlling incentive
[10]. Collectibles are more durable when gathering them ties to something
the child already values (mastery, story, a self-chosen goal) than when
pursued purely for the external prize [10].

### 5. Social features and their safety implications

COPPA requires verifiable parental consent before collecting personal
information from a child under 13, defines personal information broadly
(persistent identifiers, geolocation, images/audio), and bars conditioning
participation on excess data collection [9]. This is why most consumer chat
and public-profile features exclude under-13s or gate behind parent consent
[9] — a real constraint on leaderboards, friend lists, or free text in a
band mostly under 13.

### 6. NN/g on the bands immediately above and below PRIMARY

NN/g warns against treating "children" as one undifferentiated 3-12 group,
splitting young/mid/older bands with different font-size and scaffolding
needs [2]. The teen report (100 users, three research rounds, US/UK/
Australia) is the sharpest data point on the ceiling: teens are
overconfident yet perform worse than adults from weak reading, poor query
skills, and low patience — "they don't blame themselves, they blame you" —
abandoning a confusing flow rather than troubleshooting it [3]. NN/g's
young-users overview quantifies the split: a 156-recommendation report for
ages 3-12 versus a separate 124-tip report for 13-17 [7] — two rulebooks,
evidence PRIMARY needs its own theme rather than a scaled kinder or teen skin.

### 7. Error tolerance and frustration

No source found measured error tolerance for exactly 7-11 directly. The
closest evidence: Piaget's decentration means this age can hold "I got this
wrong" and "I can fix it" as separate facts, unlike a 4-6-year-old who
conflates them [1]; and the teen corpus shows impatience with confusing
interfaces, blaming the product, already present by 13-17 [3]. Dyscalculia
research adds a concrete point: time pressure worsens numeric-manipulation
performance for children with weak number sense, and flexible pacing reduces
stress-linked drops [11] — an argument against strict countdown timers for
this band generally.

### 8. Reading level, text length, iconography and labels

NN/g's banding applies directly: 6-8-year-olds need scaffolded, larger text,
9-12-year-olds handle more advanced reading and independent navigation, but
content pitched even one grade off gets rejected — unlike adults, who
tolerate an 8th-10th-grade default [2]. The teen corpus, one step up,
recommends a 6th-grade reading level or lower even for a nominally stronger
audience, because speed and attention — not decoding — are the bottleneck
[3]. That logic applies with more force here: short labels, one idea per
screen, literal rather than metaphorical icons.

### 9. Onboarding without long tutorials

No study addressed onboarding-tutorial length for 7-11 specifically — an
evidence gap. Transferable evidence: the teen corpus' low patience for
anything delaying the goal-directed task [3], and the concrete-operational
finding that abstract instruction without a concrete first example is
poorly retained [1] — together arguing for "learn by doing the first real
problem, with scaffolded hints," not a multi-screen explainer.

### 10. Device context

No source fetched measured shared-tablet or school-Chromebook usage for
this exact band — a second gap, flagged rather than papered over. It is
still a near-certain constraint — fast profile switching, clean session
boundaries, no assumption of a persisted personal login — that the design
implications below treat as a requirement even without a backing citation.

### 11. Accessibility: dyslexia typography and dyscalculia

Dyslexia-friendly typography converges on checkable parameters: open
sans-serif faces (Arial, Verdana, Open Sans, or purpose-built Atkinson
Hyperlegible/OpenDyslexic), 16px minimum body text, 1.5× line-height,
0.12em letter-spacing, 0.16em word-spacing, 45-100 character line length,
WCAG 4.5:1 contrast (3:1 for large/bold text), left alignment, no all-caps
or heavy italics [8]. Dyscalculia (5-10% prevalence) is a neurobiological
difficulty with quantity sense, numeral-to-quantity mapping, fact
memorization, and holding numbers in mind mid-calculation, across all
difficulty levels [11]. The design response: pair numerals with a visual
quantity (dots, blocks, a number line) rather than bare digits, minimize
clutter, offer more than one input modality, avoid or make optional any
time pressure [11].

### 12. On-screen numeric input

No dedicated numeric-keypad study for 7-11 was found — a third gap. Two
adjacent findings bound the design: Apple's HIG sets 44×44pt as the general
tappable-target floor [12], and the touchscreen motor-accuracy gap versus
adults — large in the 3-6 range — closes by roughly first grade [companion
report, topic 20]. The dyscalculia literature's call for multiple input
modalities [11] argues for a keypad that is not the *only* answer path —
multiple-choice taps, a tappable/draggable number line, or a keypad, chosen
per problem type.

## Design implications for Math Challenge

1. **Touch targets: 48×48 CSS px minimum on phone/tablet, 44×44px on
   desktop-with-mouse** — just above Apple's 44×44pt floor [12], not
   KINDER's much larger (~88-96px) minimum, since the motor-accuracy gap
   versus adults has largely closed by 7-10 [companion report, topic 20].
   This is the clearest mechanical difference from KINDER: no oversized
   "toddler-safe" zones.
2. **Typography: rounded-but-not-bubbly sans-serif**, 18-20px base for
   problem text, 16px minimum secondary label — smaller and less "loud"
   than KINDER's 24-32px numerals. Offer an in-app dyslexia-friendly toggle
   (Atkinson Hyperlegible/OpenDyslexic, 1.5× line-height, 0.12em spacing,
   left-aligned) per the documented parameters [8].
3. **Palette: saturated but not pastel, not neon.** A confident,
   gamer-adjacent jewel-tone palette (teal, indigo, amber, coral) used with
   restraint — color marks state/category, not every surface. Short of
   TEEN's flatter, more monochrome direction implied by teens' dislike of
   "glitzy" visuals [3]: PRIMARY keeps noticeably more color and warmth.
4. **Density: one task per screen with visible context** (progress strip,
   small streak/avatar indicator) — KINDER omits this, TEEN would render it
   as dense stats. Decentration means this band can hold "where am I in
   this session" alongside the current problem [1].
5. **Motion: purposeful and snappy, not bouncy.** Reduce KINDER's constant
   idle-animation mascot to a calmer default (present, static except on
   state changes) while keeping quick confirmation animations — between
   KINDER's animation-as-preference finding and TEEN's inferred lower
   tolerance for decoration, from teens' dislike of "pointless multimedia"
   [3].
6. **Avatars: build for the wardrobe effect, not against it.** Cheap,
   low-friction avatar creation, expecting children to settle on one;
   invest depth in traits shown to matter (hair, clothing, accessories,
   inclusive skin-tone/body/gender options) over breadth of throwaway
   options [4][5]. Unlock items through progress, never real-money loot
   boxes [5].
7. **Progression: tie unlocks to competence, not time spent.** Badges,
   streaks, and collectibles read as mastery feedback (a topic learned, a
   genuine-answer streak), with some player choice in what to chase next,
   satisfying the autonomy lever [10].
8. **Social: no open chat, no public profile, no leaderboard visible
   outside a teacher/parent-managed group**, first-name-or-nickname only —
   the direct consequence of COPPA for an audience mostly under 13 [9].
9. **Wrong answers: corrective, not punitive, more direct than KINDER.**
   Show the correct path (worked step, visual quantity aid), not just an
   encouraging sound — this band can hold "I was wrong" and "here's the
   fix" separately [1]; a bare red X with no path forward would violate the
   dyscalculia-driven caution against pressure without support [11].
10. **No hard countdown timers by default; make timing opt-in per set.**
    Time pressure degrades performance for children with weak number sense,
    and 5-10% prevalence is high enough to disadvantage a real share of any
    classroom-sized user base [11].
11. **Numeric input: match modality to problem type**, not one universal
    keypad — multiple-choice taps for concept checks, a number-line
    tap/drag for magnitude, a 48px-key keypad for open numeral entry — per
    the dyscalculia literature's caution against a single forced input path
    [11].
12. **Session length: short rounds with a visible stopping point every few
    problems** (a themed problem set, not a single question) — no exact
    per-age minute benchmark was found in this pass; treat any number as a
    product decision informed by, not dictated by, the patience pattern
    documented one band up [3].
13. **Device defaults: fast, no-typing profile switching**, no assumption
    of a persisted personal login, for shared family tablets or school
    Chromebooks — an inferred requirement, not a cited one, given the gap
    noted in §10.
14. **Onboarding: skip the tutorial sequence; teach through the first real
    problem** with inline scaffolding (worked first step, hint button),
    matching this band's low patience for delay [3] and weak retention of
    abstract instruction without a concrete anchor [1].

## Anti-patterns to avoid

- **KINDER's oversized targets and constant idle mascot animation as-is** —
  reads babyish to a 9-11-year-old; not supported by this age's motor
  evidence [companion report, topic 20].
- **The word "Kids" anywhere in PRIMARY-facing copy** — a documented teen
  repellent, and the "not a little kid" renegotiation starts earlier [3].
- **Chat, public profiles, or unscoped leaderboards** without a parent/
  teacher-managed group — direct COPPA exposure for a mostly under-13
  audience [9].
- **Loot-box-style randomized cosmetic purchases** — a gambling-adjacent
  monetization risk boys engage with more [5].
- **A single mandatory typed keypad for every problem** — contradicts the
  multiple-input-modality recommendation from dyscalculia research [11].
- **Default-on countdown timers** — measurably worsens performance for a
  high-prevalence (5-10%) group [11].
- **A long screen-by-screen tutorial before the first real problem** —
  fights impatience with delay and weak retention of abstract instruction
  [1][3].
- **Punitive wrong-answer feedback (red X, no path forward)** — leaves a
  child stuck exactly where support, not pressure, is needed [11].
- **Assuming a persisted personal login as the only sign-in path** —
  ignores the shared-device reality of family tablets and school
  Chromebooks, though this report found no direct citation quantifying
  that reality for this exact band.

## Open questions for the project owner

1. Should PRIMARY support a **teacher/classroom-scoped leaderboard** in
   addition to a family one, given COPPA's consent requirement applies
   differently when a school enrolls the child rather than a parent
   directly [9]?
2. What is Math Challenge's stance on **any real-money purchase surface**
   reachable from the PRIMARY child-facing experience — absent entirely, or
   present behind a parent gate with no randomized mechanic?
3. Should avatars be **shared/portable across KINDER, PRIMARY, and TEEN**
   as a child ages up, or does each band get a separate system matching
   its own visual language?
4. Given the wardrobe effect [4], is it worth **storing multiple avatars**
   at all, or should PRIMARY offer one editable slot to match actual usage?
5. Should the **dyslexia-friendly typography toggle** be exposed to the
   child directly, or set by a parent/teacher only?
6. Does Math Challenge already have an internal or licensed **per-age
   session-length benchmark** that should override the "no figure found"
   gap flagged here, rather than leaving it a pure product decision?

## Sources

1. Wikipedia. "Piaget's theory of cognitive development" (concrete
   operational stage: conservation, inductive reasoning, decentration,
   limits on abstract reasoning).
   https://en.wikipedia.org/wiki/Piaget%27s_theory_of_cognitive_development
2. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for
   Young People" (age-banding 3-5/6-8/9-12; grade-level rejection;
   animation preference; ad-blindness).
   https://www.nngroup.com/articles/childrens-websites-usability-issues/
3. Nielsen Norman Group. "Teenagers' UX: Designing Websites for Teens"
   (100 users aged 13-17, 210 sites/30 apps; 6th-grade reading
   recommendation; "Kids" as repellent; low patience; dislike of clutter).
   https://www.nngroup.com/articles/usability-of-websites-for-teenagers/
4. arXiv. "Understanding Children's Avatar Making in Social Online Games"
   (48 participants aged 8-13; four motivations; the "wardrobe effect").
   https://arxiv.org/abs/2502.18705
5. Digital Wellness Lab. "Young People's Use of Avatars and Virtual
   Character Customization" research brief (identity expression, gendered
   customization, hypersexualization-avoidance stats, loot-box concerns).
   https://digitalwellnesslab.org/research-briefs/young-peoples-use-of-avatars-and-virtual-character-customization/
6. Frontiers in Virtual Reality. "Designing the Self: Avatar Customization,
   Identity, and Affective Experience" (82 participants, ethnicity-
   stratified; customization satisfaction vs. representation).
   https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1784948/full
7. Nielsen Norman Group. "Young Users Usability Research Reports" (topic
   page: 156-recommendation Children ages 3-12 report vs. 124-tip
   Teenagers ages 13-17 report).
   https://www.nngroup.com/reports/topic/young-users/
8. accessiBe. "Dyslexia-Friendly Fonts & Typography Best Practices" (font
   choice, 16px minimum, 1.5x line-height, 0.12em letter-spacing, 0.16em
   word-spacing, 45-100 character lines, WCAG 4.5:1/3:1 contrast).
   https://accessibe.com/blog/knowledgebase/dyslexia-friendly-fonts
9. Wikipedia. "Children's Online Privacy Protection Act" (under-13
   threshold, personal-information definition, verifiable parental
   consent, restriction on excess data collection).
   https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act
10. Wikipedia. "Self-determination theory" (autonomy/competence/
    relatedness; intrinsic vs. extrinsic reward mechanics).
    https://en.wikipedia.org/wiki/Self-determination_theory
11. Understood.org. "What Is Dyscalculia" (5-10% prevalence, quantity-sense
    and numeral-mapping difficulty, time-pressure sensitivity, multi-input
    recommendations).
    https://www.understood.org/en/articles/what-is-dyscalculia
12. Apple Developer. Human Interface Guidelines — Accessibility (44×44pt
    minimum tappable target).
    https://developer.apple.com/design/human-interface-guidelines/accessibility

**Evidence gaps flagged in this report** (no source fetched addressed these
for the 7-11 band specifically): exact per-age session-length benchmarks;
onboarding-tutorial-length studies; shared-family-tablet/school-Chromebook
usage measurement; a dedicated numeric-keypad design study for this age.
Design implications resting on these gaps are marked as inferred above, not
cited as an established finding.
