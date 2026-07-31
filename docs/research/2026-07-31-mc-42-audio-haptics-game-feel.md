# Audio, Music, Haptics, Motion and "Juice" in Learning Games

> Math Challenge research — 2026-07-31 — topic 42

## Resumen ejecutivo (ES)

El "juice" (retroalimentación sensorial exagerada: sonido, partículas, sacudida
de pantalla) hace que un juego se sienta mejor sin cambiar su lógica — tesis
central de *Game Feel* de Steve Swink y de la charla de 2012 "Juice It or Lose
It" de Jonasson y Purho [1][2]. Pero Math Challenge es software educativo, y
ahí aparece una tensión real: el "efecto del sonido irrelevante" muestra que
el habla y la música de fondo degradan la memoria de trabajo aunque no se les
preste atención consciente [3], y el principio de coherencia de Mayer dice
que el material decorativo —incluida la música de fondo— debe eliminarse
porque compite por recursos cognitivos limitados [4]. Ninguno de los dos
lados es falso: el juice ayuda a la motivación; la música de fondo durante el
cálculo activo puede perjudicar el desempeño. La resolución práctica es
separar los momentos: silencio durante el intento, juice completo solo en el
instante de recompensa/error.

Para niños de 4 años que no leen, el audio no es decorativo — es el canal de
instrucciones. La Vibration API no funciona en Safari de iOS en ninguna
versión probada, así que la vibración no puede ser el canal principal en
iPad/iPhone [5][6]. `speechSynthesis` tiene soporte amplio de navegador, pero
la calidad y disponibilidad de voces por idioma depende del sistema
operativo, no del navegador [7][8]. Las políticas de autoplay bloquean
cualquier audio con sonido antes de un gesto del usuario [9][10][11] —esto
define la pantalla de inicio—, y la regla de accesibilidad "ninguna
información esencial solo por audio" [12] exige que cada sonido tenga
también un equivalente visual.

## Executive summary (EN)

"Juice" — exaggerated feedback (sound, particles, screen shake) — makes a
game feel better without changing its logic, per Steve Swink's *Game Feel*
and the 2012 talk "Juice It or Lose It" [1][2]. Math Challenge is learning
software, though, and a genuine tension follows: the irrelevant-sound effect
shows background speech/music degrades working memory even when unattended
[3], and Mayer's coherence principle says decorative audio should be stripped
from instructional material because it competes for limited cognitive
capacity [4]. Both are right in their frame — juice aids motivation; ambient
sound during active calculation can hurt performance. The practical
resolution is to separate the moments: silence while solving, full juice only
at the reward/error instant.

For 4-year-old pre-readers, audio is the instruction channel, not decoration.
The Vibration API has no iOS Safari support in any version tested, so it
cannot be the primary reward channel on iPad/iPhone [5][6]. `speechSynthesis`
has broad browser support, but voice quality/availability per language is an
OS property, not a browser one [7][8]. Autoplay policy blocks any unmuted
audio before a user gesture [9][10][11], which shapes the start screen, and
the "no sound-only feedback" accessibility rule [12] requires a visual
equivalent for every audio cue.

---

## Findings

### 1. Game feel and "juice"

Steve Swink's *Game Feel* (2008) frames "feel" as control + simulated space +
polish, where polish is sound, particles, screen shake and easing that
communicate state without changing rules [1]. The 2012 GDC Europe talk "Juice
It or Lose It" (Jonasson & Purho) is the widely cited practical demo: a
bare-bones game is progressively "juiced" with squash-and-stretch, particles,
camera shake and sound until it reads as far more satisfying, with no
mechanical change [2]. For Math Challenge the takeaway is that juice is cheap
and directly raises the perceived reward of a correct answer — which matters
most for 4-year-olds, whose engagement is driven by immediate sensory reward
more than long-term progress tracking.

### 2. Reward sounds

A short, distinct, positive-affect correct-answer sound works as a secondary
reinforcer, the way "coin" sounds do in games — instant, language-independent
praise. For a 4-year-old, the chime *is* the praise, delivered before any text
could be read. Keep such sounds short (~300-500ms for a tick; up to ~1-2s for
a bigger celebration) so they never delay the next question.

### 3. Background music: a genuine, unresolved tension

**Against it.** The irrelevant sound effect is a robust cognitive-psychology
finding: unrelated background sound — speech, music, or other non-silent
stimuli — degrades serial recall and working memory even when ignored and not
itself being tested [3]. The standard explanation is that varying auditory
material intrudes on the phonological loop used for verbal rehearsal, and it
applies to music, not only speech [3]. Mayer's coherence principle, from his
*Cognitive Theory of Multimedia Learning*, independently states that
extraneous material — including decorative background music — should be
excluded because it consumes limited processing capacity needed for the
lesson itself [4]; it is one of the most replicated findings in
educational-multimedia research.

**For it.** Neither finding argues against *momentary, meaningful* sound — a
correct/incorrect chime, spoken pre-reader instructions, a celebration sting.
Both target *continuous, concurrent* decoration, not feedback tied to a
discrete event (§1).

**Synthesis:** treat "while solving" and "on resolution" as separate audio
regimes. Default to silence while solving; if music exists at all, it's
opt-in and off by default. At resolution, the short reward/error sound +
animation is the juice moment — under two seconds, then silence resumes.

### 4. Audio for pre-readers

For ages 4-6, on-screen text is inaccessible without an adult, so audio is
the primary interface, not an enhancement. Two paths:

- **`speechSynthesis` (TTS).** Free, offline-capable once the OS voice
  exists, can read dynamic content (generated problems) without pre-recording
  every combination. But voice quality/coverage depends on the OS, not the
  browser [7][8]; a device with no installed Spanish or French voice pack
  falls back silently to a lesser default, with no web API to force-install one.
- **Recorded voice-over (VO).** Consistent quality regardless of device, but
  fixed and finite — every phrase, per language, must be recorded and
  shipped. Affordable for a small bounded vocabulary (menu labels,
  "¡Correcto!", numbers, operator names); does not scale to arbitrary
  generated problem text.

**Recommended hybrid:** recorded VO for the fixed UI/celebration vocabulary in
all 5 languages; TTS (or concatenated VO clips) for anything combinatorial
(reading out generated problems) — the pattern Khan Academy Kids and Duolingo
both use in practice.

### 5. Celebration animation: helps or distracts?

Confetti, star counters, and mascot animations are extrinsic motivators on
top of the intrinsic reward of a correct answer. A long, slow celebration
delays the next problem and risks becoming exactly the kind of extraneous
attention-grab the coherence/irrelevant-sound literature warns about. A short,
non-blocking celebration (under ~1.5s) captures the motivational benefit
without interrupting flow — "small and frequent beats large and occasional"
for sustaining engagement without displacing time-on-task.

### 6. Haptics on the web

`navigator.vibrate()` support is real but uneven: Chrome (desktop/Android),
Edge, Samsung Internet and most Chromium Android browsers support it; Firefox
desktop supported it only through v128, dropped in 129+; and — critically —
**iOS Safari has never supported it, in any version from 3.2 to 26.5** [5][6].
Since any iOS WebView uses WebKit, this isn't a "switch browsers" problem.
Vibration is at best an accent on Android/Chromium, never the primary
feedback channel, since a meaningful share of the target fleet (all iPad/
iPhone) gets nothing. No web API exposes the iOS Taptic Engine as an
alternative.

### 7. `prefers-reduced-motion`

This CSS media feature (Baseline since January 2020) exposes an OS-level
preference to reduce non-essential motion, because scaling/panning animations
are known vestibular-disorder triggers [13]. Every high-motion celebration
(confetti, shake, bounce) needs a calmer `prefers-reduced-motion: reduce`
alternative (fade/color change) that still conveys "correct" — never simply
removing the feedback.

### 8. Mute-first design

Classrooms, waiting rooms and shared family devices are contexts where audio
is often unwelcome regardless of platform capability. Combined with autoplay
policy (§9), silence should be the safe default, with a persistent, always-
visible one-tap mute control, and the core loop (read → answer → see result)
must be fully usable muted — independently required by §10 as well.

### 9. Autoplay policy

Chrome and Safari both block audio-with-sound before a user gesture unless
muted [9][10]. Chrome's Media Engagement Index can allow-list a
frequently-visited desktop origin; muted autoplay is always allowed [9].
Safari on iOS requires `playsinline` for inline video and treats muted/
audio-less video permissively [10][11]. Firefox exposes granular per-domain
prefs, including one that specifically blocks Web Audio API autoplay without
a gesture [11]. Practically: the first sound of a session (including spoken
instructions) cannot autoplay — gate it behind a "Start"/"¡Empezar!" tap, and
use that same tap to resume/create the shared `AudioContext` (plus a
near-silent primer buffer) so every later sound plays instantly.

### 10. Feedback must never be sound-only

WCAG 1.2.1 requires a text-based equivalent for audio-only content, since
text renders through any sensory modality [12]. The Game Accessibility
Guidelines are more direct: "ensure no essential information is conveyed by
sounds alone," and supplementary audio info must be replicated in text/visuals
[14]. For Math Challenge every correct/incorrect signal, instruction and
celebration needs a visual (and where relevant textual) form that stands
alone fully muted — a constraint independently required by §8 and §9 too.

### 11. Asset pipeline

**Sprites.** Bundle short effects (correct, wrong, tick, tap) into one
audio-sprite buffer played via Web Audio `AudioBufferSourceNode` with offsets,
avoiding many small requests and per-instance `<audio>` overhead.

**Web Audio vs `<audio>` latency.** The `<audio>` element on mobile has
documented latency/glitches and lacks filters, precise timing and positional
audio; Web Audio API is the low-latency path for game-like sound, while
`<audio>` remains useful for streaming long background music without
blocking on a full download — often bridged via
`MediaElementAudioSourceNode` inside an `AudioContext` [15][17]. Both APIs
have wide, Baseline-level support including iOS Safari [16][7] — unlike
vibration, audio playback itself is not a cross-platform risk.

**File-size budget.** Working target pending owner confirmation: short
UI/feedback sounds at ~10-30 KB each (compressed, in one sprite); a bounded
recorded-VO vocabulary (~150-300 phrases) at ~15-40 KB each runs several MB
per language — the single biggest offline-asset driver if all 5 languages
ship at install. Better: bundle only the selected language at install, lazy-
fetch/cache others via service worker on demand.

**Licensing.** UI sound effects typically come from royalty-free/CC0
libraries or commissioned audio; confirm attribution/commercial-use terms per
asset. Recorded VO needs either an in-house talent agreement or a commercial
VO vendor contract with clear commercial-use and re-recording rights — a
procurement decision for the owner, not resolvable from public docs.

---

## Platform capability table

| Capability | iOS Safari | Android Chrome | Desktop (Chrome/Edge/Firefox/Safari) | Source |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **Not supported**, all versions 3.2–26.5 tested | Supported (current) | Chrome v30+/Edge v79+ supported; Firefox v11–128 **only**, removed 129+; Safari desktop not supported | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Supported since Safari 6 | Supported (current) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ all supported | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (audio with sound)** | Blocked before gesture; muted/audio-less video may autoplay; `playsinline` required inline | Blocked before gesture unless muted; Chrome MEI can allow-list frequent origins | Chrome/Edge: blocked unless muted/gestured/MEI; Firefox: granular per-domain prefs; Safari desktop: same as iOS policy | WebKit blog [10]; Chrome blog [9]; MDN [11] |
| **`speechSynthesis`** | Supported since Safari 7; **voice count/quality per language is an OS property** | Supported (current); Android system browser lacks it | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ all supported | caniuse.com/speech-synthesis [7]; MDN [8] |

Voice inventories per language (EN/ES/FR/PT/DE) cannot be enumerated from
documentation alone — they must be verified per target OS/device during
implementation [7][8].

---

## Design implications

1. **Ages 4-6.** Every instruction is audio (recorded VO, §4) plus a large
   pictogram — never text alone. No background music by default. Correct
   answer: ≤500ms chime + simultaneous visual sparkle/bounce, silence-safe.
2. **Ages 4-6, errors.** Soft, non-punitive tone (no harsh buzzers) + friendly
   bounce-back cue, kept within `prefers-reduced-motion`-safe amplitude even
   by default — this age group is more shake/flash-sensitive.
3. **Ages 7-10.** Text becomes primary; audio becomes optional toggleable
   read-aloud. 2-3 rotating chime variants to avoid monotony, ≤700ms, no
   blocking animation.
4. **Ages 11+/adults.** Audio off by default behind an explicit "sound on"
   prompt (not autoplay); minimal celebration (progress-bar tick, not
   confetti) for a low-distraction, fast-working user.
5. **Music off by default at every age band** (§3). If offered, opt-in only,
   auto-ducking to near-silent during active solving, full volume only on
   menu/idle screens.
6. **VO/TTS split (§4).** Recorded VO for the bounded fixed vocabulary
   (~150-300 phrases) in all 5 languages; `speechSynthesis` (or concatenated
   clips) for combinatorial generated-problem readouts.
7. **First-session audio unlock.** The first tap (a "Start" button, never
   autoplay) doubles as the gesture that resumes/creates the shared
   `AudioContext` plus fires a near-silent primer, so later sounds have zero
   perceptible delay (§9).
8. **Haptics as accent only.** Fire a short (~40-80ms) tick where
   `navigator.vibrate` exists (Android Chrome); design full parity via
   sound+animation alone for iOS, where it's entirely absent (§6).
9. **`prefers-reduced-motion` variant for every celebration**, shipped in the
   same PR as the celebration — a calm fade/pulse that preserves the reward
   signal without vestibular triggers (§7).
10. **Persistent one-tap mute control**, always visible, remembering the last
    choice per device; the muted core loop is a first-class tested scenario,
    not an afterthought (§8, §10).
11. **No sound-only feedback anywhere** — every audio cue pairs with a visual
    (and, where text is on screen, textual) equivalent, checked on every new
    sound added (§10).
12. **Celebration duration budget.** Per-answer: ≤500ms audio / ≤800ms
    animation, non-blocking. Session-level (streak/level complete): ≤2.5s
    total, skippable, never gating "continue" past that ceiling.
13. **Total offline asset-size budget** (working target, pending owner
    confirmation): ≤1.5 MB UI sound-effect sprite (language-independent) +
    ≤2-3 MB for the default-language recorded-VO bundle at install, with the
    other four languages fetched/cached on demand rather than bundled
    upfront. First-install audio footprint target: **under 5 MB**.

---

## Open questions for the project owner

1. Offer background music at all (even opt-in), given §3's evidence against
   it during active solving — or reserve it strictly for menu/idle screens?
2. Is there budget/timeline for professional VO in all 5 languages for the
   fixed vocabulary, or should launch rely on `speechSynthesis` everywhere
   first, with VO added per language later?
3. Ship all 5 languages in the initial offline bundle, or bundle only the
   selected language and fetch others on demand (my working recommendation,
   see implication 13)?
4. What is the offline asset-size ceiling for the whole app (not just audio)
   — this changes how aggressive the audio budget needs to be?
5. For classroom/shared-device deployments, should a teacher/admin setting
   force mute-by-default or disable the sound toggle for students, separate
   from the per-session user toggle?
6. Is a licensed sound-effect library already chosen, or does §11's licensing
   note need to feed a procurement decision before any sound asset ships?

---

## Sources

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation*
   (2008) — framework for "feel" via control, space, and polish.
2. GDC Vault, "Juice It or Lose It" (Martin Jonasson & Petri Purho, GDC
   Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose
3. Wikipedia, "Irrelevant speech effect" —
   https://en.wikipedia.org/wiki/Irrelevant_speech_effect
4. Mayer, R. & Moreno, R., "A Cognitive Theory of Multimedia Learning:
   Implications for Design Principles" (1998) — coherence principle
   (referenced via https://en.wikipedia.org/wiki/Multimedia_learning).
5. caniuse.com, "Vibration API" — https://caniuse.com/vibration
6. MDN, "Vibration API" —
   https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
7. caniuse.com, "Speech Synthesis API" —
   https://caniuse.com/speech-synthesis
8. MDN, "SpeechSynthesis" —
   https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
9. Chrome Developers blog, "Autoplay policy in Chrome" —
   https://developer.chrome.com/blog/autoplay/
10. WebKit blog, "New Video Policies for iOS" —
    https://webkit.org/blog/6784/new-video-policies-for-ios/
11. MDN, "Autoplay guide for media and Web Audio APIs" —
    https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
12. W3C WAI, "Understanding SC 1.2.1: Audio-only and Video-only
    (Prerecorded)" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html
13. MDN, "prefers-reduced-motion" —
    https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
14. Game Accessibility Guidelines, "Ensure no essential information is
    conveyed by sounds alone" —
    http://gameaccessibilityguidelines.com/full-list/
15. MDN, "Web Audio API" —
    https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API
16. caniuse.com, "Web Audio API" — https://caniuse.com/audio-api
17. web.dev, "Web Audio for games" — https://web.dev/articles/webaudio-games
18. W3C WAI, "Understanding SC 1.4.2: Audio Control" —
    https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
