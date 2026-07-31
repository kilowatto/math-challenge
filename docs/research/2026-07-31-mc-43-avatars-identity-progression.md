# Avatars, Identity and Progression for Children's Products Under Strict Privacy
> Math Challenge research — 2026-07-31 — topic 43

## Resumen ejecutivo (ES)

Los productos infantiles serios resuelven la identidad sin datos personales
igual: **alias generados** (no escritos) más un **avatar de piezas
predefinidas** (nunca foto) — como el Mii de Nintendo [11], y como ya decidió
D-003 [19]. El "efecto Proteus" (el avatar cambia la conducta de quien lo
porta) está replicado con tamaño de efecto pequeño-a-moderado [2][3], lo que
justifica tratarlo como mecanismo real. El "problema Scunthorpe" — filtros que
bloquean palabras inocentes por una subcadena ofensiva — es el riesgo técnico
central de generar alias en cinco idiomas [1][10]; la solución real en
producción es una lista blanca mantenida, no un filtro más estricto. Bélgica y
Países Bajos declararon en 2018 que las cajas de recompensa aleatorias son
juego de azar aunque el contenido sea cosmético [4] — la línea no es
"cosmético vs. jugable", es "aleatorio pagado vs. determinista". Un compañero
tipo Tamagotchi genera retención real pero también inventó el mecanismo de
culpa que lo hizo famoso [5]. La investigación de Mayer sobre agentes
pedagógicos respalda al personaje-guía con reservas: el efecto es modesto y
depende de las señales sociales, no de la animación [9]; la investigación de
Sesame Street y el vínculo parasocial con Elmo muestran que un personaje ya
familiar enseña mejor que uno nuevo [6][7][8] — el caso exacto de Larry, ya
existente en el canon de Ignia [18][19]. Roblox advierte lo que pasa con texto
libre sin restricción: 1,600 moderadores más IA y el contenido inapropiado
sigue reapareciendo [13].

## Executive summary (EN)

Serious children's products solve identity the same way: **generated aliases**
(picked, not typed) plus an **avatar of pre-made parts** (never a photo) —
Nintendo's Mii [11], and what the project already decided in D-003 [19]. The
Proteus effect (an avatar changes the wearer's behavior) is replicated at a
small-to-medium effect size [2][3], justifying treating it as a real lever.
The Scunthorpe problem — filters blocking innocent words over an offensive
substring — is the central technical risk of generating aliases in five
languages [1][10]; the fix that works in production is a maintained
whitelist, not a stricter filter. Belgium and the Netherlands ruled in 2018
that randomized reward boxes are gambling even when contents are cosmetic
[4] — the line is "randomized-and-paid vs. deterministic," not
"cosmetic vs. gameplay." A Tamagotchi-style companion drives real retention
but also invented the guilt mechanic that made it famous [5]. Mayer's
pedagogical-agent research backs a character-guide with caveats: the effect
is modest and depends on social cues, not animation [9]; Sesame Street and
Elmo parasocial research show a familiar character teaches better than a new
one [6][7][8] — exactly Larry's case, since he already exists in Ignia's
canon [18][19]. Roblox is the warning for unrestricted free text: 1,600
moderators plus AI, and inappropriate content still resurfaces [13].

## Findings

### 1. Identity without personal data: the industry pattern

Every major children's/family product converges on the same two-part solution:
a **generated or curated identifier** instead of a typed real name, and an
**avatar built from a closed set of parts** instead of a photograph. Nintendo's
Mii is the clearest case: characters are built by selecting from pre-designed
facial features, hairstyles, accessories, and body types; even the optional
photo-based creation mode only *seeds* feature selection and never stores or
displays the source photo, preserving "self-representation while maintaining
privacy" [11]. Duolingo lets users build an avatar from a fixed wardrobe of
seasonal cosmetic pieces rather than an uploaded image [12]. The common
engineering shape is: **identity = choice among a bounded, pre-vetted set**,
never free input — exactly what the project already picked in D-003
(generated aliases, no photo, no city, boards segmented by level) [19].

### 2. The Proteus effect: why the avatar is not just decoration

Yee and Bailenson's 2007 Stanford research coined the "Proteus effect": people
in virtual environments behave in ways consistent with their avatar's implied
traits, driven by self-perception and behavioral confirmation rather than by
what others actually do [2][3]. A meta-analysis of 46 experimental studies
found the effect reliable at a "small-but-approaching-medium" size (0.22–0.26)
across contexts — more attractive avatars produced more confident behavior,
athletic avatars increased exercise, heroic avatars increased prosocial
behavior offline [2]. Newer work complicates the embodiment requirement:
participants formed attachment to avatars even without strong immersion,
suggesting the effect is not purely a VR/embodiment phenomenon [2]. Practical
read for Math Challenge: a cosmetic that visually signals "careful,
mastery-oriented mathematician" (a scholar's cap, an explorer's badge) is not
just a reward — it may nudge behavior toward the trait it depicts, arguing for
cosmetic *categories* tied to real learning behaviors (persistence, accuracy,
curiosity) rather than arbitrary skins.

### 3. Safe multilingual name generation and the Scunthorpe problem

The "Scunthorpe problem" is named for a 1996 incident where AOL's filter
blocked the English town of Scunthorpe because its name contains an offensive
substring; the same failure mode has hit Craig Cockburn's surname, "shitake
mushrooms," Google SafeSearch results for the town, and — critically for a
five-language product — German compound words that legitimately form an
offensive substring at a linking letter, and Chinese place names flagged by
character homonymy [1]. The mechanism is structural: naive substring filters
"lack contextual understanding" [10], and the failure gets *worse* the more
languages a single filter covers, because a clean word in one language can be
an unsafe substring in another — China's own moderation ecosystem shows the
endpoint, with no single authoritative banned-word list even within one
language, so every platform runs its own edge-case list indefinitely [10].
The production-proven fix is not a stricter algorithm — it is a **maintained,
logged whitelist** of confirmed-safe strings a naive filter would reject,
built from real rejection logs over time [1][10]. The direct implication for
word-list *construction*: EN/ES/FR/PT/DE lists must be authored per language
by a fluent reviewer, not machine-translated, because translation is exactly
the operation that turns a safe word into an unsafe substring elsewhere
(mirrors D-005's finding that math vocabulary itself cannot be translated
word-for-word across these five languages [19]).

### 4. Moderation of user-generated content — should children get free text at all

Roblox is the highest-investment case study available: mandatory age
verification since January 2026, chat restricted to age-banded groups, still
"1,600+ moderators" plus AI-driven filtering, and a 2020 investigation
described takedown efforts as "whack-a-mole" with sexual content reappearing;
a 2024 report tied real predation incidents to "insufficient moderation," and
at least six arrests followed for child exploitation via the platform since
January 2025 [13]. This is not a company that under-invested — it is evidence
that **free text at scale, from children, cannot be fully moderated** even
with a nine-figure trust-and-safety budget. The honest conclusion for a
product at Math Challenge's scale: no free-text surface for children at all
in v1. Alias selection, avatar assembly, and any social interaction should be
closed-vocabulary (tap a preset phrase or emoji), never a text box — stricter
than most competitors, but the only posture that does not inherit Roblox's
moderation debt.

### 5. Cosmetic progression vs. gambling: the regulatory line

Belgium's Gaming Commission ruled in 2018 that loot boxes in FIFA 18,
Overwatch, and CS:GO were games of chance under gambling law regardless of
cosmetic-only contents — no way to buy the specific item directly makes it
chance-based — and the justice minister framed the concern explicitly around
children [4]. The Netherlands' gaming authority reached a similar conclusion
the same year for several (not all) titles studied, citing addiction-fostering
design even below the legal enforcement threshold [4]. The UK took the
narrower position that cosmetic-only, non-tradeable, non-cashable items sit
outside licensable gambling, but its own 2022 DCMS review still found elevated
"gambling, mental health, financial and problem gaming-related harms" among
loot-box players and pushed self-regulation over a law change [4]. Read
together, the regulatory center of gravity is: **randomization plus payment is
the trigger, not the cosmetic/gameplay distinction** — a deterministic
purchase (buy this specific hat) is safe everywhere these rulings apply; a
paid randomized box is contested even when purely cosmetic. For a children's
product this argues for going further than the strictest current ruling: **no
randomized rewards of any kind**, paid or free, since the mechanism
regulators worry about (variable-ratio reinforcement) needs no money to work
on a child.

### 6. Companion/pet care loops: retention power and the guilt mechanic

Tamagotchi (1996) is the reference case: three meters (hunger, happiness,
training) that decay without attention, with genuine death as the failure
state [5]. It produced extraordinary engagement — 40 million units in two
years — precisely because neglect had a real, upsetting consequence: children
brought devices to school to prevent death mid-lesson, schools banned them for
disruption, and press at the time reported genuine grief, including mock
funerals for "dead" pets [5]. The retention mechanism and the dark pattern are
the same mechanism — the device does not work as a companion without a
threat, and the threat produced both the engagement and the backlash. A
companion feature can borrow the *care* loop (feed, dress, interact) without
the *loss* loop: growth stages and cosmetic unlocks tied to the child's own
math practice, no decay state, no death, no notification framed around the
companion's distress — keeping the affection-building mechanic while
discarding the guilt mechanic that made the original both beloved and
controversial.

### 7. Pedagogical agent research — why Larry's format matters, not just his existence

Mayer's multimedia-learning research on pedagogical agents finds real but
modest support: agents help mainly as a "presenter of social cues," and a
recent meta-analysis found only "negligible improvement" from the agent's
mere presence — the gains come from *what the agent does* (highlighting,
personalizing, human-like voice), not from having a character at all [9].
Tutor-role agents show no clear advantage over agent-free lessons; co-
learner-framed agents raise self-efficacy more reliably; static vs. animated
representation remains an open, contradictory question [9]. This converges
with Sesame Street's own research history: ETS's 1970-71 studies found
heavier viewers learned more regardless of disadvantage, and a 2019 economic
analysis (Kearney & Levine) called it "perhaps the biggest, yet least costly,
early childhood intervention" [6]. Underneath that is parasocial-bond
research: Calvert's team found 21-month-olds learned a sequencing task better
from a *familiar* character (Elmo) than an unfamiliar one, and that giving
children a toy of the unfamiliar character first — so it became familiar —
closed the gap; personalized characters deepened engagement further, since
"perceived similarities increase children's interest and investment" [7][8].
This favors Larry as already decided in D-004: he is not a new character but
Ignia's existing orange rhino, so the familiarity Calvert's research says
drives learning is already banked, not something to build from zero [18][19].
The corollary: Larry's canon rules (never mocks the child, "¡Ya vas!" only on
task acceptance) matter more than his visual design — the payoff is in the
social-cue behavior, not the character model [9][18].

### 8. Visualizing progress for children — maps, trees, and the goal-gradient effect

The goal-gradient effect — effort accelerates as perceived distance to a goal
shrinks — is well established in the behavioral-economics/marketing
literature (Kivetz, Urminsky & Zheng's "resurrection" of Hull's original
hypothesis, in loyalty-program contexts) [14]. Gamified-learning reviews note
visual learners specifically "benefit from... progress bars, game maps, and
colorful visuals" for motivation, while cautioning that points/badges/
leaderboards used in isolation are not reliably effective — they work when
tied to real competence signals, not as decoration [15]. This matches the
project's own PRIMARY-band research: a "wardrobe effect" study found children
build several avatars but converge on using one, meaning the *process* of
customizing carries the motivational value even when the final artifact is
narrow [16]; KINDER-band research found young children "expect feedback on
every single action" and respond to consistent mascot animation in a way
adults explicitly do not [17]. Duolingo's own history is a cautionary data
point on *which* progress metaphor to pick: it replaced its tree-shaped skill
map with a linear path in August 2022, drawing visible, sustained user
backlash [12] — evidence the tree/map metaphor itself carried motivational
value a straight line did not replace.

## Design implications

1. **Alias generator is per-language authored, not translated.** Build five
   independent word lists (EN/ES/FR/PT/DE) with a fluent reviewer per
   language, combining a category word + a trait word + a randomized (not
   sequential) two-digit number. Never derive one language's list by
   translating another's — that is the exact operation that creates
   Scunthorpe-style failures [1][10].
2. **Alias selection is tap-only for ages 3-11 (KINDER + PRIMARY).** The child
   picks from 3-5 generated options; there is no text field to type into,
   which removes the injection surface for the age bands least able to
   self-moderate. TEEN (12-17) gets a limited reroll but still never types.
3. **Validate the combined rendered string, not each word alone, and log
   every rejection/regeneration** (words, language, locale, reason). Two
   clean words can combine into an unsafe one across a language boundary;
   a logged whitelist of confirmed-safe strings, built from those logs, is
   the actual production fix for the Scunthorpe problem, not a stricter
   filter [1]. Rate-limit regeneration (e.g., a small number of rerolls/day)
   so a child cannot brute-force a combination past the filter.
4. **No free-text field anywhere a child under 13 can reach** — no bio, no
   chat, no custom label. Any child-to-child interaction (reactions,
   congratulations) is a closed set of preset phrases/emoji, per the honest
   read of Roblox's moderation record even at scale [13].
5. **Avatar = pre-made parts only, Mii-style.** No photo upload, no camera
   access, ever. Parts are organized in categories (hair, expression,
   accessory) unlocked as cosmetics, not typed or drawn.
6. **Cosmetics unlock on a deterministic, published table** tied to mastery
   milestones, streaks, or league placement — e.g., finishing a topic unit
   unlocks a specific named item. No box, chest, pack, or "mystery" reward of
   any kind, free or paid — stricter than the UK's own cosmetic carve-out
   and clear of the Belgium/Netherlands line entirely [4]. If monetization
   ever touches cosmetics, it is direct purchase of a named, previewed item
   only, never a randomized purchase.
7. **A companion/pet feature (if built) has no decay, hunger, or death
   state**, and sends no notification framed around the companion's sadness
   or neglect — keep the affection-building loop, discard Tamagotchi's guilt
   loop [5]. Likewise, **streak loss never erases or visually regresses the
   progress map** — a missed day should not retroactively undo earned
   progress, avoiding a second guilt mechanic stacked on the first.
8. **Progress visualization is age-banded, not one skin for all ages:**
   KINDER — a physical journey path with the mascot walking forward, no
   numbers; PRIMARY — a named-topic skill tree/mastery map (not a straight
   line — Duolingo's own 2022 switch away from a tree drew visible backlash
   [12][15]); TEEN — a stats dashboard with an opt-in league; ADULT — plain
   numeric mastery metrics, gamified skin optional and off by default (per
   mc-23's adult/expert findings).
9. **Larry's presence is age-banded, per mc-37's existing prompt
   architecture:** KINDER — animated, voice-first, reacts to every attempt;
   PRIMARY — same character, explains the misconception per the hard rules
   already set in D-004; TEEN — same rhino, tone shifts toward "patient
   professor," fewer animations, opt-out available; ADULT — Larry available
   on request but backgrounded behind denser feedback UI [9][18].
10. **Larry never comments on the child's alias or avatar choice.** His canon
    voice stays on math, never on appearance or identity — extends D-004's
    "never shames a child" rule to a place shame could otherwise creep in
    (a bot "complimenting" a name implicitly also can judge one) [18][19].
11. **Cosmetic categories signal learning traits** the Proteus-effect
    research says can influence behavior (persistence, curiosity, care) —
    e.g., an "explorer" badge line for trying hard problems — rather than
    arbitrary decoration, since the avatar has a small but real behavioral
    echo on the wearer [2][3].
12. **Alias/avatar identity is never derivable from the parent account**,
    email, or child's real name in the UI — a numeric suffix should be
    randomized, not sequential, else "Bunny07" implies signup order.

## Open questions for the project owner

1. Should the closed-vocabulary reaction set (emoji/preset phrases) exist at
   all in v1, or is "no child-to-child interaction of any kind" the safer
   default until there is a moderation budget to support even a closed set?
2. Is a Tamagotchi-style companion in scope for this product at all, or does
   the guilt-loop risk (§6) argue for skipping the feature entirely rather
   than trying to build a "safe" version of it?
3. For the PRIMARY-band skill tree: should topic order be strictly linear
   (matches the current curriculum sequencing) or allow branching
   exploration (matches the "wardrobe effect" finding that children value
   choice even when they converge on one path)?
4. Should cosmetic unlock tables be visible to the child in advance (full
   transparency: "finish fractions to unlock this hat") or revealed only on
   unlock (surprise, but closer in spirit to the mechanic regulators
   scrutinize even without randomness)?
5. Do TEEN-band aliases get one extra degree of freedom (e.g., a self-chosen
   number, still validated) versus PRIMARY/KINDER's fully generated set, or
   is the same tap-only mechanism kept through age 17?
6. Should the alias word lists be built in-house per language, or is there
   budget/appetite to license an existing maintained multilingual
   profanity/safe-word dataset instead of authoring five lists from scratch?

## Sources

1. Wikipedia — Scunthorpe problem. https://en.wikipedia.org/wiki/Scunthorpe_problem
2. Wikipedia — Proteus effect. https://en.wikipedia.org/wiki/Proteus_effect
3. Yee, N. & Bailenson, J. (2007). "The Proteus Effect: The Effect of
   Transformed Self-Representation on Behavior." Human Communication
   Research, 33(3). Original study underlying [2]; not re-fetched live.
4. Wikipedia — Loot box (regulatory history: Belgium, Netherlands, UK
   DCMS). https://en.wikipedia.org/wiki/Loot_box
5. Wikipedia — Tamagotchi. https://en.wikipedia.org/wiki/Tamagotchi
6. Wikipedia — Sesame Street research. https://en.wikipedia.org/wiki/Sesame_Street_research
7. Wikipedia — Parasocial interaction. https://en.wikipedia.org/wiki/Parasocial_interaction
8. Lauricella, A., Gola, A., & Calvert, S. (2011). "Toddlers' learning from
   socially meaningful video characters." Media Psychology, 14(2). Primary
   study referenced in [7]; not re-fetched live.
9. Wikipedia — Pedagogical agent. https://en.wikipedia.org/wiki/Pedagogical_agent
10. Wikipedia — Profanity filter. https://en.wikipedia.org/wiki/Profanity_filter
11. Wikipedia — Mii. https://en.wikipedia.org/wiki/Mii
12. Wikipedia — Duolingo. https://en.wikipedia.org/wiki/Duolingo
13. Wikipedia — Roblox (safety/moderation record). https://en.wikipedia.org/wiki/Roblox
14. Kivetz, R., Urminsky, O., & Zheng, Y. (2006). "The Goal-Gradient
    Hypothesis Resurrected: Purchase Acceleration, Illusionary Goal Progress,
    and Customer Retention." Journal of Marketing Research, 43(1).
    Established literature; not re-fetched live.
15. Wikipedia — Gamification of learning. https://en.wikipedia.org/wiki/Gamification_of_learning
16. Internal — `math-challenge/docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
    §3 (avatar "wardrobe effect" study, self-determination theory framing).
17. Internal — `math-challenge/docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
    §5, §7 (mascot/animation preference, feedback-on-every-action finding).
18. Internal — `math-challenge/docs/research/2026-07-31-mc-37-larry-profe-port.md`
    (Larry's hard rules, prompt architecture, age-band tone).
19. Internal — `math-challenge/docs/decisions.md` D-003 (generated aliases),
    D-004 (Larry), D-005 (five languages).
