# Habit Loops, Retention Mechanics and Push Notifications for a Children's Math PWA

> Math Challenge research — 2026-07-31 — topic 19

## Resumen ejecutivo (ES)

La formación de hábitos en apps se apoya en tres marcos clásicos que se complementan: el bucle **señal-rutina-recompensa** de Duhigg [7], el modelo **B=MAP** (Motivación, Habilidad, Prompt) de BJ Fogg [1], y el modelo **Hook** de Nir Eyal (disparador, acción, recompensa variable, inversión) [8][9]. Los tres coinciden en un mecanismo central: la **recompensa variable**, heredada del condicionamiento operante de Skinner, es el ingrediente que convierte una rutina en un hábito difícil de extinguir porque el cerebro libera dopamina anticipando el premio, no solo al recibirlo [11]. Este mismo mecanismo es el que sustenta las máquinas tragamonedas y las loot boxes, lo que obliga a Math Challenge a decidir conscientemente dónde trazar la línea entre "hábito saludable" y "compulsión". El propio Eyal, después de escribir el manual de la persuasión (*Hooked*, 2014), escribió su contraparte (*Indistractable*, 2019) reconociendo la tensión ética del modelo y defendiendo el "tiempo por elección" sobre el "tiempo por distracción" [9]. Duolingo es el caso de estudio obligado: su racha (streak) con aversión a la pérdida, sus ligas competitivas y su algoritmo de notificaciones personalizado ("bandit algorithm") impulsan un compromiso enorme, pero también han generado críticas por incentivar trampas y "aprendizaje superficial" para no romper la racha [15]. Las intenciones de implementación ("si ocurre X, entonces haré Y", Gollwitzer) tienen tamaños de efecto grandes y documentados (p. ej. +100% vs 53% en autoexámenes) [4] y son más aplicables a un recordatorio bien diseñado que la pura repetición.

En el plano técnico: Web Push funciona en iOS/iPadOS Safari **solo desde la versión 16.4**, **solo si la PWA fue instalada a la pantalla de inicio**, y el permiso debe solicitarse tras una interacción directa del usuario [2]. Chrome/Android soporta Push API de forma completa y sin las restricciones de instalación de Apple [5][3]. La API de "Notification Triggers" (notificaciones locales programadas sin red) nunca llegó a estandarizarse entre navegadores y no debe asumirse disponible en 2026. Cloudflare Workers puede firmar y enviar Web Push (VAPID) de forma nativa: soporta Web Crypto API completamente y, desde abril 2025, `node:crypto` bajo el flag `nodejs_compat` [16][17], lo que hace viable reescribir o ejecutar librerías como `web-push` en el edge.

## Executive summary (EN)

App habit formation rests on three classic, complementary frameworks: Duhigg's **cue-routine-reward** loop [7], Fogg's **B=MAP** model (Motivation, Ability, Prompt) [1], and Eyal's **Hook** model (trigger, action, variable reward, investment) [8][9]. All three converge on the same mechanism: **variable reward**, inherited from Skinnerian operant conditioning, is what turns a routine into a habit that resists extinction, because the brain releases dopamine in anticipation of a reward, not only on receipt of it [11]. That is the same mechanism behind slot machines and loot boxes, which means Math Challenge has to decide deliberately where "healthy habit" ends and "compulsion" begins. Eyal himself, after writing the field manual for persuasive design (*Hooked*, 2014), wrote its counterpart (*Indistractable*, 2019), acknowledging the ethical tension in his own model and arguing for "traction" (time well spent by choice) over "distraction" [9]. Duolingo is the mandatory case study: its loss-aversion-driven streak, competitive leagues, and personalized notification bandit algorithm drive enormous engagement, but have also drawn criticism for incentivizing cheating and shallow learning to avoid breaking a streak [15]. Implementation intentions ("if X, then I will Y", Gollwitzer) have large, documented effect sizes (e.g., +100% vs. 53% on self-exam completion) [4] and are a better design target than raw repetition.

On the technical side: Web Push on iOS/iPadOS Safari works **only from version 16.4**, **only if the PWA is installed to the home screen**, and permission must be requested following direct user interaction [2]. Chrome/Android supports the Push API fully, without Apple's installation gate [5][3]. The Notification Triggers API (scheduled local notifications without a network round-trip) never reached cross-browser standardization and should not be assumed available in 2026. Cloudflare Workers can sign and send Web Push (VAPID) natively: it fully supports the Web Crypto API and, since April 2025, `node:crypto` under the `nodejs_compat` flag [16][17], making it practical to run or port libraries like `web-push` at the edge.

---

## Findings — Part 1: The psychology of habit and retention

### 1.1 The three core models, and how they nest

- **Cue-Routine-Reward (Duhigg)** [7]: the cue puts the brain into "automatic mode"; the routine is the behavior; the reward is what makes the brain encode the loop as worth repeating. Duhigg documents the loop through commercial cases (P&G's Febreze) rather than original experiments — it is a synthesis of existing behavioral science aimed at practitioners, not a peer-reviewed model in itself.
- **B=MAP (Fogg)** [1]: behavior happens only when Motivation, Ability, and a Prompt converge at the same moment. Fogg's practical corollary — "make it tiny," reduce Ability friction rather than trying to manufacture Motivation — is the more actionable half of the model for product design, precisely because motivation is unreliable and hard to engineer, while friction is directly controllable.
- **Hook Model (Eyal)** [8]: External Trigger → Action → Variable Reward → Investment, repeating until the trigger becomes internal (boredom, loneliness, a felt need trigger the app without an external push). The model's own author later published a corrective: *Indistractable* reframes the same mechanics as something that can be resisted, and Eyal has publicly opposed blanket regulation of habit-forming tech while critics have drawn an explicit parallel to tobacco-industry "personal responsibility" messaging that obscured intentionally addictive design [9]. That critique matters directly for Math Challenge, a children's product: the same Hook mechanics that Eyal sold to consumer app companies in 2014 are the ones he later argued need active counter-design in a product aimed at kids.

### 1.2 Variable-ratio reinforcement is the load-bearing mechanism

Operant conditioning's variable-ratio schedule — reward after an unpredictable number of responses — produces "a very high, persistent rate of response" that resists extinction more than fixed schedules do [11]. This is explicitly the mechanism behind slot machines and loot boxes, and the same source notes that "the majority of video games are designed around a compulsion loop" using this schedule [11]. For a math practice app, this is a design fork, not a detail: a fixed reward (same coin count every correct answer) builds a routine; a variable reward (random bonus multipliers, surprise streak badges, mystery box unlocks) builds a compulsion loop indistinguishable in mechanism from a slot machine. Given the target audience includes children, this is the single highest-stakes psychology finding for this project.

### 1.3 Implementation intentions outperform vague reminders

Gollwitzer's if-then planning ("If situation X, then I will do Y") produces large, replicated effects: +4.1 points in voter turnout, 100% vs. 53% completion of breast self-exams, larger weight loss (4.2 kg vs. 2.1 kg over two months), and increased fruit/vegetable intake, all versus goal-only control groups [4]. The design implication is concrete: a notification that says "Do your math practice" is a generic goal-reminder; a notification that helps the family or child pre-commit to a specific if-then ("After breakfast, do 5 minutes of Math Challenge") is an implementation-intention prompt and should outperform it. This argues for onboarding that elicits a specific time-and-place commitment from the family, and for notifications that echo that commitment back rather than generic re-engagement copy.

### 1.4 Streaks: loss aversion, sunk cost, and the endowed-progress effect

Loss aversion (Kahneman & Tversky) holds that losses are felt roughly twice as intensely as equivalent gains [12]. Streak mechanics reframe engagement from gain-seeking ("earn more") to loss-avoidance ("don't lose what you have"), which is the more psychologically forceful lever [12]. The sunk cost fallacy — continuing to invest because of what's already been invested, partly to avoid "appearing wasteful" — compounds this: a 47-day streak is not just a number, it is a sunk investment the user (or the parent, vicariously) does not want to have wasted [13]. This family of effects (loss aversion, sunk cost, and the closely related endowed-progress effect from loyalty-program research, where users given a head start toward a goal complete it faster than those starting from zero) is precisely the mechanism Duolingo's streak, freeze tokens, and streak-repair purchases are built on [15].

**Duolingo as worked example** [15]: streak (with a "Friend Streak" social variant), weekly leagues ranking cohorts of up to 30 users, badges, and a bandit-algorithm-personalized notification system that selects which nudge each user gets. Its own mascot's "aggressive reminder" persona became a meme, which Duolingo leaned into deliberately in marketing. The documented downside: language-teaching critics say gamification "led to cheating, hacking, and incentivized game strategies that conflict with actual learning," and a 2023 Duolingo-funded study found its English learners "did not significantly learn much grammar" [15]. The lesson for Math Challenge: engagement metrics and learning outcomes can diverge, and a streak optimized purely for daily-open counts can measurably crowd out the actual pedagogical goal — a risk that matters more, not less, in a product for children where a parent is trusting the app with learning time, not just attention.

### 1.5 Push notification effectiveness, frequency, and fatigue

Directly reproducible field data on notification-frequency opt-out curves proved harder to source live in this session than the psychology literature above (several industry-report URLs — Airship, OneSignal, Business of Apps — returned 404/403 during this research pass and are not cited below as a result; this is a gap, not a null finding, and is flagged in Open Questions). What is verifiable from primary technical/behavioral sources:

- The permission **ask itself is the highest-leverage decision**. Chrome's own developer guidance is explicit: "The worst thing you can do is to show the permission dialog to users as soon as they land on your site. They have zero context... blocking permissions at this point out of frustration is not uncommon" [6]. Once a user blocks permission, the site **cannot re-prompt programmatically** — the user must go into browser settings to change it [6]. This makes the *first* ask closer to a one-shot deal than a resource to spend cheaply.
- Recommended pattern is a **soft-ask / double-permission** flow: show an in-app explanation of the value first, and only trigger the native browser prompt after the user opts in to that explanation, plus giving users an always-visible way to manage/opt out of notifications later rather than forcing an all-or-nothing decision at first contact [6].
- The psychological reward-anticipation research on variable ratio [11] implies that notification copy which occasionally surprises ("today's mystery bonus is live") will outperform monotonous copy on open-rate — but this is the exact mechanism flagged in §1.2 as compulsion-adjacent, so it should be used, if at all, sparingly and transparently rather than exploited.

## Findings — Part 2: The technical reality of web push in 2026

### 2.1 iOS/iPadOS Safari — hard requirements

Per WebKit's own engineering blog post on Web Push for web apps [2]:

- **Minimum OS version 16.4.** No web push at all on earlier iOS/iPadOS.
- **Home Screen installation is mandatory.** The manifest must declare `display: "standalone"` or `"fullscreen"`, and the user must add the app via Share → "Add to Home Screen." Web Push **does not work** for the same site opened in ordinary Safari tabs or via a bookmark — installation is a hard gate, not a preference.
- **Permission must follow a direct user gesture** (e.g., tapping a "Subscribe" button) — Apple does not allow ambient/automatic permission prompts.
- **Standards-based**: uses the same W3C Web Push stack as macOS Ventura/Safari, riding on Apple Push Notification service infrastructure, and — notably — **requires no Apple Developer Program membership** to send web push, unlike native iOS push.
- **Badging API is supported** for installed web apps (`navigator.setAppBadge()` / `clearAppBadge()`), and notifications respect system Focus modes, with per-app settings synced across the user's devices via the manifest's `id` field.
- `caniuse` data corroborates the version gate: iOS Safari shows only **partial** support from 16.4 through the newest tracked version as of this research, versus **full** support on macOS Safari from version 18 [3]. That "partial" flag is a real, current caveat, not stale data — treat any second-hand claim of "full iOS support" with suspicion until re-verified against caniuse or WebKit's own posts.

### 2.2 Android / Chrome — broadest support, no install gate

The Push API has been "Widely Available" (cross-browser baseline) since March 2023 [5], and `caniuse` shows full support on Chrome for Android and Chrome/Firefox/Samsung Internet desktop-equivalents, reaching roughly 95% of global browser usage share when partial support is included [3]. Unlike iOS, **installation to the home screen is not required** to receive push on Android Chrome — a page with a registered, active service worker can subscribe and receive push while running as an ordinary browser tab, though installed/standalone PWAs get a more native-feeling notification/tap-to-launch experience. Chrome imposes no quota limit on push message volume; Firefox does impose a quota (refreshed per site visit) unless the message reliably produces a visible notification [5].

### 2.3 Desktop — mature, but not equally implemented

Desktop Safari only reached full Push API support at Safari 18 (partial in 16.1–17.6) [3]; Chrome desktop has had full support since v50, Firefox since v44 [3]. Desktop generally does not carry Apple's install-to-home-screen requirement — the primary asymmetry is macOS Safari specifically, which inherited the same permission-gesture and (for the newest versions) Focus-mode integration rules as its iOS counterpart [2].

### 2.4 Notification Triggers / scheduled local notifications — not viable in 2026

An API for scheduling notifications to fire at a future time **without a network round-trip** (`Notification.showTrigger`, part of a proposed "Notification Triggers" capability) was explored as a Chrome-only origin trial several years ago but never reached cross-browser consensus or a stable, shipped, standards-track implementation usable in production. Attempts in this research session to locate a current, live specification or shipped-feature page for it returned 404s on both the W3C draft URL and Chrome's own blog post URL — consistent with it having been shelved rather than promoted to a real standard. **Design consequence: do not build any feature (e.g., "remind me in this exact device timezone at 4pm even if the app never opens the network") that depends on client-side scheduled local notifications.** Every scheduled reminder in Math Challenge needs a real server-triggered Web Push, which in turn needs an active subscription and, on iOS, an installed PWA.

### 2.5 Sending web push at scale, Cloudflare-side

The reference Node.js library for Web Push (`web-push` from web-push-libs) is built on Node's `Buffer` and `crypto` APIs and is not documented as edge/serverless-runtime aware out of the box [14]. Two Cloudflare-native paths make this workable inside the existing Workers-based stack rather than needing a separate Node server:

1. **Native Web Crypto API** — Cloudflare Workers fully support the standard `SubtleCrypto` interface [17], which is sufficient to hand-roll VAPID's ES256 (ECDSA P-256) JWT signing and the AES-GCM/ECDH payload encryption that Web Push requires, without any Node compatibility flag.
2. **`node:crypto` under `nodejs_compat`** — since the April 2025 Cloudflare changelog entry, the full `node:crypto` and `node:tls` APIs are available in Workers when the `nodejs_compat` compatibility flag is set [16], which means the existing `web-push` npm package (or a close fork) can likely run directly in a Worker rather than requiring a rewrite against raw SubtleCrypto — worth a small spike to confirm before committing to one approach or the other.

Either path keeps push-sending inside the Workers/Queues stack already in use elsewhere in this project (per `AGENTS.md` §5.2), avoiding a new non-Cloudflare service just to fire notifications.

## Platform support table

| Capability | iOS/iPadOS Safari | Android Chrome | Desktop (Chrome/Firefox/Safari) |
|---|---|---|---|
| Push API (server push while app closed) | Partial; requires 16.4+ [3] | Full, baseline since 2023 [5] | Full on Chrome (v50+)/Firefox (v44+); Safari only from v18, partial 16.1–17.6 [3] |
| Must be installed to Home Screen / standalone | **Yes, mandatory** [2] | No — works from a browser tab with an active service worker | No (desktop has no "home screen" gate; macOS Safari inherits the same permission-gesture rule) |
| Permission prompt rules | Must follow a direct user gesture; no ambient prompts [2] | Must follow user gesture per Chrome best practice [6]; less strictly enforced by the OS than iOS | Same best practice, not OS-enforced |
| Re-prompt after user blocks | Not possible programmatically; user must change it in system Settings [2][6] | Not possible programmatically; must be changed in browser site settings [6] | Same |
| Badging (app icon badge count) | Supported for installed web apps [2] | Supported via Badging API on installed PWAs | Varies; less commonly surfaced on desktop OS chrome |
| Silent / quiet / background-only push | Background handling before permission is possible [2]; no separate "silent push" guarantee documented | Standard push event handling in service worker; no notification is optional if data-only, but showing one is effectively required by browser policy to avoid "silent push" abuse | Standard service worker push event handling |
| Message volume limits | Governed by APNs via WebKit's push service, not separately documented here | No Chrome-imposed quota [5] | Firefox enforces a quota unless messages produce visible notifications [5] |
| Scheduled/local notifications without network (Notification Triggers) | Not available — no evidence of a shipped standard in 2026 | Not available | Not available |

## Design implications for Math Challenge

1. **Make the first permission ask a soft-ask, not a hard ask.** Never trigger the native browser prompt on first load. Show an in-app explainer ("We'll remind [child] once a day when it's practice time") with a clear "Not now," and only fire the real OS prompt after explicit opt-in — a denied prompt cannot be re-shown programmatically on any platform [2][6].
2. **Gate the "install to Home Screen" step before promising push on iOS.** Because iOS Web Push is unavailable outside an installed PWA [2], the notification-opt-in flow on iOS must first walk the parent through "Add to Home Screen," or must silently degrade to no-push and rely on in-app reminders / email instead.
3. **Address notifications to the parent by default, not the child.** Given loss-aversion/streak mechanics are the most compulsion-adjacent lever available (§1.2, §1.4), and the audience includes children, the safer default is: streak-at-risk and re-engagement nudges go to the *parent's* registered device/channel, with the child only receiving in-app (not push) prompts during an active session.
4. **Cap push at one notification per day, hard limit, with an easy in-app snooze/mute.** No industry frequency-vs-opt-out curve could be independently re-verified in this pass (flagged in Open Questions), so err conservative: one daily nudge, never more, plus an always-visible per-family control to reduce or silence it — mirroring the "give an easy opt-out or users take the nuclear option" finding from Chrome's own guidance [6].
5. **Use implementation-intention phrasing, not generic re-engagement copy.** At onboarding, ask the family to pick a concrete time/place ("after breakfast," "before bed"). Notification copy should echo that commitment ("It's [time] — [child]'s math moment") rather than a bare "Come back and play!", consistent with the if-then effect sizes in §1.3 [4].
6. **Use a fixed, transparent reward for the core loop; reserve variability for rare, clearly-labeled bonus events.** Because variable-ratio reward is mechanistically identical to slot-machine/loot-box design [11], the everyday correct-answer reward (coins, stars) should be predictable. Reserve any surprise element (a "mystery star" once a week) for something infrequent, clearly bounded, and never monetized.
7. **Do not sell streak repair or streak insurance.** Loss aversion is already doing the motivational work for free [12][13]; charging money to avoid losing a streak converts a psychological mechanic into a direct monetization of a child's or family's loss aversion, which is a step further than Duolingo's own model and worth avoiding on that basis alone.
8. **Treat the streak counter itself as something a parent can reset/forgive without penalty.** Sunk-cost pressure (§1.4) can make a broken streak feel like a reason to quit entirely ("we already lost it, why bother"); a one-tap "we're still here, restart gently" affordance blunts the all-or-nothing cliff-edge that pure streak mechanics create.
9. **Build every scheduled reminder as a server-sent Web Push, never a client-side scheduled/local notification.** §2.4 found no viable Notification Triggers-style API in 2026 — any "remind me at 4pm" feature needs a server (Cloudflare Worker + Queues/cron) that pushes at the right moment per user, not a promise the client can keep offline.
10. **Send push from Cloudflare Workers using Web Crypto (or `node:crypto` under `nodejs_compat`) rather than standing up a separate Node push server.** Both paths are confirmed available on Workers today [16][17]; prototype both against the existing `web-push` library before choosing, since compatibility with that library specifically (vs. hand-rolled VAPID) was not independently confirmed in this pass.
11. **Design the notification content to survive iOS's install gate gracefully.** For the fraction of iOS users who never install to Home Screen, fall back to email or an in-app banner on next open rather than a broken promise of "you'll get reminded" — the gate in §2.1 is absolute, not a permission the app can work around.
12. **Distinguish "habit" from "compulsion" with an explicit internal metric, not just DAU/streak length.** Given Duolingo's own documented tension between engagement and learning outcomes [15], track a pedagogical metric (e.g., problems mastered, error-rate improvement) alongside streak/open metrics, and treat a rising streak with a flat or falling mastery metric as a warning sign, not a win.
13. **Respect Focus modes and quiet hours by default.** iOS already integrates push with system Focus modes [2]; Math Challenge should additionally enforce its own app-level quiet hours (e.g., no push before 7am or after 8pm local time) regardless of platform, since not all platforms tie into Focus automatically.
14. **Make the parental screen-time limit and the notification cadence the same lever, not two separate settings.** Since the product's premise is a parent-set daily limit, the notification plan should default its one-per-day nudge to land near the *start* of the parent-approved window, operationalizing the implementation-intention finding (§1.3) rather than pushing at an arbitrary marketing-optimal hour.

## Open questions for the project owner

1. Should push notifications be **parent-only**, **child-only (on a child's own device)**, or **both with different content**, given the household may have a shared or child-specific device?
2. What is the acceptable ceiling — is one push per day acceptable, or should some days have zero by policy (e.g., only push on a missed day, never on a day already completed)?
3. Should the "surprise bonus" mechanic exist at all, or does the compulsion-mechanism overlap with slot-machine/loot-box design (§1.2) rule it out entirely for a children's product regardless of how it's bounded?
4. Is a streak-repair/streak-freeze mechanic wanted at all (even if never sold for money), or should broken streaks always restart clean to avoid sunk-cost pressure on a child?
5. This research pass could not independently re-verify current industry frequency-vs-opt-out data (Airship/OneSignal/Business-of-Apps sources 404/403'd) — is it worth a follow-up research pass specifically to pull that data from an accessible mirror, or is the conservative one-per-day default in item 4 above acceptable without it?
6. Should Math Challenge commit engineering time now to prototype `node:crypto`-based `web-push` on Workers vs. hand-rolled Web Crypto VAPID, given both are technically available but neither was validated end-to-end in this research pass?

## Sources

1. BJ Fogg Behavior Model (B=MAP) — https://en.wikipedia.org/wiki/Fogg_Behavior_Model
2. WebKit Blog, "Web Push for web apps on iOS and iPadOS" — https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
3. caniuse, Push API browser support — https://caniuse.com/push-api
4. Implementation intention (Gollwitzer if-then planning) — https://en.wikipedia.org/wiki/Implementation_intention
5. MDN, Push API overview — https://developer.mozilla.org/en-US/docs/Web/API/Push_API
6. web.dev, "Permission UX: getting users to accept notifications" — https://web.dev/push-notifications-permissions-ux/
7. Wikipedia, "The Power of Habit" (Duhigg cue-routine-reward) — https://en.wikipedia.org/wiki/The_Power_of_Habit
8. Nir Eyal, "How to Manufacture Desire" (Hook Model) — https://www.nirandfar.com/how-to-manufacture-desire/
9. Wikipedia, "Nir Eyal" (Hooked vs. Indistractable tension) — https://en.wikipedia.org/wiki/Nir_Eyal
10. web.dev, "Push notifications overview" — https://web.dev/articles/push-notifications-overview
11. Wikipedia, "Operant conditioning" (variable-ratio schedules) — https://en.wikipedia.org/wiki/Operant_conditioning
12. Wikipedia, "Loss aversion" — https://en.wikipedia.org/wiki/Loss_aversion
13. Wikipedia, "Sunk cost" — https://en.wikipedia.org/wiki/Sunk_cost
14. GitHub, web-push-libs/web-push — https://github.com/web-push-libs/web-push
15. Wikipedia, "Duolingo" (streaks, leagues, notification algorithm, criticism) — https://en.wikipedia.org/wiki/Duolingo
16. Cloudflare Changelog, "Improved support for Node.js Crypto and TLS APIs in Workers" (2025-04-08) — https://developers.cloudflare.com/changelog/post/2025-04-08-nodejs-crypto-and-tls/
17. Cloudflare Docs, Node.js compatibility in Workers (Web Crypto API support table) — https://developers.cloudflare.com/workers/runtime-apis/nodejs/
18. MDN, Notifications API — https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
