# UI and interaction design for children aged 3-6 (KINDER band)

> Math Challenge research — 2026-07-31 — topic 20

## Resumen ejecutivo (ES)

Los niños de 3 a 6 años tienen precisión motriz muy inferior a la de un adulto:
Hourcade et al. (2004) midieron 90% de precisión de apuntado en niños de 4 años
recién con objetivos de 23.7mm, muy por encima de los ~9mm (44pt) que asumen
las guías de adultos [1][2]. El arrastrar-y-soltar ("drag-and-drop") es el
gesto que más falla en esta edad: es significativamente más lento que el toque
según la ley de Fitts en niños de 4-6 años (no así en niños de 7-10) [4], y
aparece repetidamente como el gesto más difícil de ejecutar junto con el doble
toque y el trazo [3][5]. La política de Apple para la categoría Kids exige
"parental gates" con tareas de nivel adulto antes de compras o enlaces
externos, e indicaciones por voz para niños que no leen [11]. El marco de los
"cuatro pilares" de Hirsh-Pasek (activo, comprometido, significativo,
socialmente interactivo) es el estándar académico para evaluar si una app es
realmente educativa, no solo "educativa" de nombre [10]. NN/g documenta que
los niños de 3-5 años prefieren animación y sonido —al contrario que los
adultos— y que necesitan navegación espacial y metáforas de la vida real
porque aún no leen [8][9]. La FTC ha sancionado con $520M a Epic Games por
patrones oscuros que permitían compras accidentales de menores [13], lo cual
es directamente relevante para cualquier flujo de pago o salida de la app.
Este informe traduce esos hallazgos en una especificación concreta para la
franja KINDER de Math Challenge: tamaños de objetivo táctil, tipografía,
paleta, sonido, animación, profundidad de navegación, número de toques para
iniciar un reto, forma del input de respuesta, y comportamiento ante una
respuesta incorrecta, diferenciado por teléfono, tableta y escritorio.

## Executive summary (EN)

Children aged 3-6 have markedly lower motor precision than adults. Hourcade et
al. (2004) measured 90% pointing accuracy in 4-year-olds only at 23.7mm
targets, well above the ~9mm (44pt) adult guideline baseline [1][2].
Drag-and-drop is the gesture that fails most at this age: it is significantly
slower than tapping under Fitts' law for 4-6-year-olds (but not for
7-10-year-olds) [4], and repeatedly surfaces as the hardest gesture alongside
double-tap and tracing [3][5]. Apple's Kids category policy requires
"parental gates" — adult-level tasks — before purchases or external links, and
voice prompts for pre-literate children [11]. Hirsh-Pasek's "four pillars"
framework (active, engaged, meaningful, socially interactive) is the academic
standard for whether an app is actually educational rather than educational in
name only [10]. NN/g documents that 3-5-year-olds prefer animation and sound —
unlike adults, who usually dislike them — and need spatial navigation and
real-life metaphors because they cannot yet read [8][9]. The FTC fined Epic
Games $520M over dark patterns enabling accidental purchases by minors [13],
directly relevant to any payment or exit flow. This report translates those
findings into a concrete spec for Math Challenge's KINDER band: touch target
sizes, typography, palette, sound, animation, navigation depth, taps to start
a challenge, answer-input shape, and wrong-answer behavior, broken out by
phone, tablet, and desktop.

## Findings

### 1. Motor development and touch accuracy

Hourcade, Bederson, Druin and Guimbretière (2004) tested mouse pointing in
preschoolers and found target size had "a significant effect on accuracy and
target reentry"; 4-year-olds reached 90% pointing accuracy only at target
sizes around **23.7mm** — roughly 2.5x the commonly cited adult 44pt
(~9.2mm) guideline [1][2]. Touchscreen-specific work confirms the same gap
for direct-touch input. Vatavu, Cramariuc and Schipor's "Touch interaction
for children aged 3 to 6 years" studied children in Piaget's preoperational
stage performing tap and drag-and-drop on phones and tablets and reported
systematically higher error and variance than adult baselines [3]. A
synthesis paper, "Physical dimensions of children's touchscreen interactions:
Lessons Learned," ran six studies with 180+ participants (116 children) and
cites Baloian et al. (2013)'s finding that **tracing, double-tapping, and
drag-and-drop were the most difficult gestures** to execute reliably for
5-6-year-olds [5][6]. Gesture-ability-by-age research reports 2-3-year-olds
can perform tap, slide, and flick, while 4-6-year-olds add drag-and-drop and
pinch-to-zoom — but with markedly lower success than school-age children:
one study found only 7-8-year-olds achieved reliable drag-and-drop (30%
success) and following audio/video instructions (34%) [6]. A Fitts'-law
validity study found movement time was "significantly higher for
drag-and-drop than for tap" specifically in 4-6-year-olds, with the gap
disappearing by age 7-10 — the deficit is age-bound and closes around first
grade [4].

### 2. Why drag-and-drop struggles, and what works instead

Drag-and-drop requires sustained finger contact, continuous visual tracking
of a moving target, and a controlled release — three chained motor/attention
sub-tasks, which is why it consistently underperforms simple tap across the
literature above [3][4][5][6]. A York University study (FittsFarm) found
drag-and-drop accuracy improved significantly with a low-cost **stylus versus
finger input**, since the stylus reduces the occlusion and contact-area noise
of a fingertip [7]. Khan Academy Kids' prototyping write-up reached a
complementary conclusion: drag-and-drop responses correlated *more strongly*
with other valid assessment items than tap, because children treat dragging
as more deliberate — useful for assessment, but a reason to reserve it for
cases where deliberateness is wanted, not routine input [15]. Practical
implication for 3-6-year-olds: **prefer tap-to-select over drag-and-drop** for
the primary answer mechanic; if a drag is used at all (e.g., "place the apple
in the basket"), keep the distance short, the target large, and add a
snap-to-target magnet so an imprecise release still registers as correct.

### 3. Audio-first design and text-to-speech

Because reading is "not at all" developed at this age per NN/g's age-banded
research (3-5 vs. 6-8 vs. 9-12) [8][9], every instruction, number, and prompt
needs a spoken equivalent, not just text. NN/g's newer children's-UX research
found 3-year-olds could already recognize video-player icons (play, pause,
volume, fullscreen) from repeated exposure even without reading, suggesting
icon+sound pairing builds real, transferable comprehension at this age [9].
Khan Academy Kids' internal testing is a useful caution here too: adding
unique sounds to on-screen characters caused children to "spend more time
tapping monsters to hear noises than focusing on" the task — audio novelty can
itself become a distraction, so sound must be purposeful (confirming an
action, reading a prompt) rather than decorative-interactive [15].

### 4. Icon comprehension

Pictogram/icon research generally treats symbol comprehension as still
developing through the preschool years and stresses concreteness over
abstraction — a photograph-like or literal icon (an apple, a whole number of
dots) is understood well before an abstract or metaphorical one [17][18]. This
lines up with NN/g's finding that 3-year-olds recognized *functional* icons
tied to a consistent, repeated action (play/pause) rather than novel or
one-off icons [9].

### 5. Characters, mascots, and animation

NN/g explicitly reports that young children (3-5) "showed preference for
animation and sound," calling out that this is the opposite of adult
preference, where such elements are "usually disliked" [8]. This is one of the
clearest divergences between adult and child UX in the corpus and justifies
theme-level investment in a consistent mascot for the KINDER band, since a
recurring character is also the vehicle for voice-over delivery and for
softening wrong-answer feedback (see §7).

### 6. Color and visual design

A dedicated study on interface color for children's applications found
"the frequency of high saturation in children's user interfaces is higher than
in adult user interfaces" [16], and eye-tracking work on children's color
preference found warm hues (red, orange, yellow) slightly dominate, though the
precise interaction of hue/saturation/brightness remains inconclusive at the
research level [19]. Typography guidance converges around large, simple,
rounded sans-serif type: one practitioner synthesis specifies an 18-19px
minimum for body/label text for this age band, well above adult mobile body
text [12].

### 7. Feedback, reward, and error handling

NN/g's usability testing states plainly that young children "expect feedback
on every single action they perform" [12] — silence after a tap reads as
"broken," not "nothing happened." Combined with the four-pillars framework's
emphasis on *meaningful* engagement over flashy reward loops [10], and the
Smashing Magazine synthesis's warning that extrinsic reward mechanics can
undercut intrinsic motivation over time [12], the implication is: give instant
sensory feedback (sound + micro-animation) on every tap, but keep the
*reward* layer (stars, badges, mascot celebration) tied to genuine task
completion, not to tapping itself.

### 8. Navigation, session length, and accidental exits

Apple's Kids category guidance requires a "parental gate" — an adult-level
task such as a math problem — before an in-app purchase or any link-out to
external content, with voice prompts so pre-literate children understand why
they're blocked [11]. Google Play's Families program imposes comparable
policy obligations for content and behavioral advertising review [14]. The FTC
formally treats dark patterns that let children accumulate purchases without
a parent noticing as a deceptive practice; its 2022 settlement with Epic
Games over Fortnite cost $520M specifically for "dark patterns to trick
players into making unwanted purchases" reachable by children [13]. On session
length, the AAP's newest child-media guidance (covered in a 2026 healthychildren.org
release) organizes recommendations by age band — including "early childhood
0-5" — and calls for "child-centered designs" built with children and families
in the design process, though the public excerpt does not give an exact
minutes-per-session figure [20]; treat any specific number as a product
decision, not a cited standard, absent the full *Pediatrics* technical report.

### 9. Sign-in without reading

None of the sources fetched specify a named "picture password" study for this
exact age band, and this is a genuine evidence gap in the applied literature
found. What is established, and what any picture/avatar/PIN-based sign-in
should be built on, is (a) NN/g and Hourcade-lineage evidence that icon
recognition from repeated exposure is reliable well before text reading is
[9], and (b) Apple's requirement that any adult-gated action for this age
group use a **non-text, audio-paired mechanism** [11]. An avatar-grid "pick
your face" pattern (used by Khan Academy Kids-style apps) is consistent with
both: it requires no reading, no typing, and is trivially fast for a 4-year-old
to execute correctly.

### 10. Parent co-play

The four-pillars framework itself treats "socially interactive" as one of the
four required pillars of an educational app — an app that is better *with* a
co-playing adult scores higher on this dimension, not lower [10]. Apple's
parental-gate mechanism and Google's Families program both formalize a
distinct, separate parent-facing layer (settings, purchase approval,
time limits) from the child-facing experience [11][14], which is the
architecture to copy: two clearly separated surfaces, not one shared screen
with hidden adult controls.

## Design implications for Math Challenge

1. **Touch target minimum: 88×88px CSS px on phone/tablet, 76×76px acceptable
   on desktop-with-mouse.** Derived from Hourcade et al.'s 23.7mm figure at a
   typical ~160dpi baseline (≈150px on a high-density asset canvas, scaling to
   ~88-96 CSS px after accounting for device pixel ratio) [1][2], and
   cross-checked against the Smashing Magazine practitioner minimum of 75×75px
   for this age band [12]. Use the larger figure, not the 44pt (~9mm) adult
   HIG baseline — that number is documented as too small for 4-year-olds by a
   wide margin [1].
2. **No drag-and-drop as the primary answer mechanic.** Use tap-to-select
   (e.g., tap the correct number/object among 3-4 large choices). Reserve any
   drag interaction for a secondary/celebratory moment (e.g., dragging a
   sticker onto a reward board), with large snap-to-target zones, because
   drag-and-drop is the single most consistently-failing gesture in the
   literature for ages 3-6 [3][4][5][6].
3. **Every screen and every prompt has a spoken equivalent (TTS or recorded
   VO), triggered automatically on screen entry, replayable by tapping the
   mascot.** No prompt should rely on text alone, since reading is undeveloped
   at this age [8][9].
4. **Typography: 24-32px minimum for any on-screen numeral or label** (larger
   than the 18-19px practitioner floor for body text [12], because Math
   Challenge's primary content is numerals children must visually
   discriminate quickly, not paragraph text), rounded sans-serif, high
   stroke-width for legibility at a glance.
5. **Palette: high-saturation, warm-leaning primary colors** for KINDER
   theme chrome (mascot, buttons, celebration states), consistent with
   measured higher saturation in children's interfaces vs. adult ones and
   children's warm-hue preference [16][19]. Keep saturation lower on the
   background/canvas layer so the tappable objects are the most saturated
   elements on screen — saturation itself becomes an affordance for "this is
   tappable."
6. **Sound: purposeful only, not decorative-interactive.** A confirm-chime on
   every tap (per NN/g's "feedback on every action" finding [12]), spoken
   number/prompt narration, and mascot voice lines on success/retry — but no
   ambient sound-on-touch for background elements, per Khan Academy Kids'
   finding that novelty sounds pull attention away from the task [15].
7. **Animation: every state change animates** (button press, correct/incorrect
   reveal, mascot reactions) — animation is a documented preference at this
   age rather than adult-style "reduce motion" default [8]. Respect
   OS-level reduced-motion settings as an accessibility override, but do not
   default to a minimal-motion KINDER theme.
8. **Navigation depth: maximum 2 taps from app open to "a challenge is being
   answered."** Tap 1: pick avatar/child profile (no login, see #9). Tap 2:
   tap the mascot or a single large "Play" button. This matches the
   evidence that deep menu structures and multi-step navigation are the kind
   of adult-designed complexity 3-6-year-olds cannot reliably parse without
   reading [8][12].
9. **Sign-in: avatar-grid selection, no PIN and no typed password for the
   KINDER band.** A grid of 4-6 large avatar tiles (one per child profile in
   the household), tapped once, functionally replaces login; any
   parent-facing action (switching profiles' billing, settings) sits behind a
   separate, adult-gated surface per Apple's parental-gate requirement
   [9][11].
10. **Wrong-answer behavior: no red X, no buzzer, no "fail" language.** Mascot
    gives an encouraging audio cue ("¡Casi! / Almost!"), the wrong choice
    gently shakes/dims rather than disappearing, and the child is invited to
    try again on the same screen — consistent with keeping feedback
    encouraging rather than punitive at an age where NN/g documents
    self-image is easily bruised by "this is for babies" framing if the tone
    misjudges the child's developmental stage [8][10].
11. **A parent-only settings/purchase surface, gated by a math problem or
    press-and-hold pattern, never reachable via a stray tap from the child
    experience** — directly implementing Apple's Kids-category parental gate
    requirement [11] and avoiding the dark-pattern liability the FTC has
    fined $520M for in a comparable product category [13]. No in-app
    purchase flow should be reachable at all from the child-facing surface
    for the KINDER band; all purchase/subscription actions live exclusively
    behind the parent gate.
12. **Session/level structure: short, self-contained challenge rounds (60-120
    seconds each) with a natural stopping point (mascot celebration + "play
    again?" prompt) every 3-5 rounds**, so a parent can end a session at a
    clean boundary rather than mid-task — the AAP's push for child-centered,
    family-involved design supports building natural pause points rather than
    an infinite-scroll structure, even though no exact minute figure is
    citable from the fetched excerpt [20].
13. **Desktop-specific adaptation: keep the same 76px+ target minimum and
    tap-first (click-first) mechanic; do not introduce keyboard-only input
    for the KINDER band**, since none of the accuracy research assumes
    keyboard fluency at this age and mouse-pointing accuracy research (the
    original Hourcade study) used the same large-target logic as touch [1].
14. **Icon design: literal, not abstract** — a whole apple for "1 apple," not
    a stylized fraction of one; functional icons (play, home, retry) repeated
    identically across every screen so recognition transfers, per NN/g's
    finding that repeated, consistent icons are what 3-year-olds actually
    learn to recognize [9].

## Anti-patterns to avoid

- **Drag-and-drop as the only way to answer a question** — the age band's
  most consistently documented failure mode [3][4][5][6].
- **44pt/9mm touch targets** copied from general adult mobile guidelines —
  measured as insufficient for 4-year-olds by Hourcade et al. [1][2].
- **Any purchase, subscription, or external link reachable without a parental
  gate** — an FTC enforcement risk, not just a UX issue [11][13].
- **Text-only prompts or instructions** with no audio equivalent — unusable by
  a non-reader by definition [8][9].
- **Decorative sound-on-touch for non-actionable elements** — measurably
  distracts children from the task at hand [15].
- **Punitive wrong-answer feedback** (red X, buzzer, "Wrong!", disappearing
  choices) — works against the encouraging tone the age band needs and risks
  a "this app doesn't like me" reaction that NN/g's research shows children
  articulate directly ("this is for babies") when tone misjudges age [8].
- **Deep or hidden navigation** (hamburger menus, multi-level settings inside
  the child-facing surface) — this age group cannot reliably navigate
  structures that assume reading or memory of prior screens [8][12].
- **Reward mechanics that reward tapping/engagement itself** rather than task
  completion — undermines the "meaningful" pillar of the four-pillars
  framework and intrinsic motivation more broadly [10][12].
- **Typed passwords or PINs for the child-facing profile switch** — no
  fetched evidence supports typed-credential entry as usable for a non-reading
  4-year-old, and Apple's own guidance assumes non-text gating for this
  age [11].
- **Autoplay-into-next-content without a stopping point** — works against
  AAP's child-centered, family-involved design push and removes the natural
  session boundary a parent needs [20].

## Open questions for the project owner

1. Should the KINDER band support **more than one child profile per household**
   via the avatar-grid sign-in, or is Math Challenge single-child-per-account
   for this band?
2. Is a **stylus/Apple Pencil input path** worth supporting on tablet for
   drag-based bonus activities, given FittsFarm's finding that stylus
   materially improves child drag-and-drop accuracy over finger [7]?
3. What is Math Challenge's **position on any reward currency** (stars,
   coins) for KINDER — purely cosmetic/celebratory, or tied to unlocking
   content, given the tension the literature flags between reward mechanics
   and intrinsic motivation [10][12]?
4. Should session-boundary prompts ("play again?") **count toward or reset**
   any daily-limit feature the app or OS-level parental controls might
   enforce?
5. For the parental gate, does the owner prefer **a simple arithmetic
   challenge** (Apple's own suggested pattern [11]) or a **press-and-hold**
   pattern — the former doubles as in-theme content, the latter is faster for
   a parent who wants to open settings often?

## Sources

1. Hourcade, J.P., Bederson, B.B., Druin, A., Guimbretière, F. (2004).
   "Differences in pointing task performance between preschool children and
   adults using mice." ACM TOCHI. https://dl.acm.org/doi/10.1145/1035575.1035577
2. ResearchGate summary of Hourcade et al. (2004), citing 23.7mm target /
   90% accuracy for 4-year-olds.
   https://www.researchgate.net/publication/220286166_Differences_in_pointing_task_performance_between_preschool_children_and_adults_using_mice
3. Vatavu, R.-D., Cramariuc, G., Schipor, D.M. "Touch interaction for children
   aged 3 to 6 years: Experimental findings and relationship to motor
   skills." International Journal of Human-Computer Studies.
   https://www.sciencedirect.com/science/article/pii/S1071581914001426
4. "Children's interaction with touchscreen devices: Performance and validity
   of Fitts' law" (movement-time comparison, drag-and-drop vs. tap, ages
   4-6 vs. 7-10).
   https://www.researchgate.net/publication/355490786_Children's_interaction_with_touchscreen_devices_Performance_and_validity_of_Fitts'_law
5. "Physical dimensions of children's touchscreen interactions: Lessons
   Learned" (six studies, 180+ participants incl. 116 children; cites
   Baloian et al. 2013 on tracing/double-tap/drag-and-drop difficulty).
   https://www.sciencedirect.com/science/article/pii/S1071581918302441
6. "Ability of children to perform touchscreen gestures and follow prompting
   techniques when using mobile apps" (gesture ability by age, 2-3 vs. 4-6
   vs. 7-8).
   https://www.researchgate.net/publication/339053838_Ability_of_children_to_perform_touchscreen_gestures_and_follow_prompting_techniques_when_using_mobile_apps
7. "FittsFarm: Comparing Children's Drag-and-Drop Performance Using Finger
   [and Stylus]." York University / INTERACT 2019.
   https://www.yorku.ca/mack/interact2019.html
8. Nielsen Norman Group. "Children's UX: Usability Issues in Designing for
   Young People." https://www.nngroup.com/articles/childrens-websites-usability-issues/
9. Nielsen Norman Group. "UX Design for Children (Ages 3-12)" report.
   https://www.nngroup.com/reports/children-on-the-web/
10. Hirsh-Pasek, K., Zosh, J.M., Golinkoff, R.M., et al. (2015). "Putting
    Education in 'Educational' Apps: Lessons from the Science of Learning."
    Psychological Science in the Public Interest.
    https://journals.sagepub.com/doi/abs/10.1177/1529100615569721
11. Apple Developer. "Design safe and age-appropriate experiences" (Kids
    category guidance: age bands, parental gates, data/ad restrictions).
    https://developer.apple.com/kids/
12. Smashing Magazine (2024). "A Practical Guide to Designing for Children"
    (75×75px minimum tap target, 18-19px text, feedback-on-every-action,
    reward-vs-intrinsic-motivation caution).
    https://www.smashingmagazine.com/2024/02/practical-guide-design-children/
13. FTC. Press release, "Fortnite Video Game Maker Epic Games to Pay More
    Than Half a Billion Dollars over FTC Allegations" (dark patterns enabling
    unauthorized charges by children), 2022.
    https://www.ftc.gov/news-events/news/press-releases/2022/12/fortnite-video-game-maker-epic-games-pay-more-half-billion-dollars-over-ftc-allegations
14. Google Play Console. "Families" program policies.
    https://play.google.com/console/about/programs/families/
15. Khan Academy Blog. "Prototyping Playful and Nimble Pre-K Assessments"
    (audio-as-distraction finding; drag-and-drop vs. tap assessment
    validity). https://blog.khanacademy.org/prototyping-playful-and-nimble-pre-k-assessments/
16. "Color design in application interfaces for children." Color Research &
    Application (Wiley). https://onlinelibrary.wiley.com/doi/abs/10.1002/col.22726
17. Siegler, R. "Using Symbols: Developmental Perspectives" (children's
    understanding of words, photographs, scale models, maps, text).
    https://siegler.tc.columbia.edu/wp-content/uploads/2020/08/wcs.1280.pdf
18. Frontiers in Developmental Psychology. "Exploring the Potential Relations
    Between a Novel Visual [icon-matching task] and preschool spatial/math
    skill." https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2026.1746813/full
19. Frontiers in Psychology. "Using head-mounted eye trackers to explore
    children's color preferences" (warm-hue preference).
    https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1205213/full
20. AAP / HealthyChildren.org. "A Child-Friendly Digital World: AAP Releases
    New Media Recommendations" (age-banded guidance incl. early childhood
    0-5, child-centered design).
    https://www.healthychildren.org/English/news/Pages/creating-a-child-friendly-digital-world-AAP-releases-new-media-recommendations.aspx
21. Kirkorian, H.L., et al. (2017). "All Tapped Out: Touchscreen Interactivity
    and Young Children's Self-Regulation and Word Learning." Frontiers in
    Psychology. https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.00578/full
