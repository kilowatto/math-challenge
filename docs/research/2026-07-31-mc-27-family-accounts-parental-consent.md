# Family Account Architecture and Consent UX — How the Best Products Do It

> Math Challenge research — 2026-07-31 — topic 27

## Resumen ejecutivo (ES)

El patrón dominante no es "el niño se registra": es "el adulto crea una cuenta y añade perfiles hijos bajo su propio consentimiento", con un inicio de sesión infantil deliberadamente ligero (PIN, imagen, o tocar un avatar en un dispositivo ya vinculado) para que un niño de 6-10 años entre sin leer. Apple, Google y Microsoft usan **cuentas hijas reales** dentro de un grupo familiar, con gasto, tiempo de pantalla y contenido controlados por el padre, y una transición a los 13 (edad de consentimiento digital en EE. UU.) y otra en la mayoría de edad. Streaming (Netflix, Disney+) y algunos juegos (Nintendo) usan **perfiles**, no cuentas: más ligero, sin identidad propia del niño. Educación (Prodigy, Google Classroom) añade un tercer actor, el profesor, que crea un aula y vincula estudiantes por código, con el consentimiento de cada padre capturado aparte o delegado a la escuela (excepción FERPA).

Para el consentimiento parental verificable (VPC), la FTC mantiene desde hace una década una lista de métodos aceptados bajo COPPA (formulario firmado, cargo a tarjeta, llamada a línea gratuita, videollamada, ID gubernamental con comparación facial — aprobado en 2015), y ha aprobado individualmente métodos de estimación facial de edad (PRIVO/Yoti, 2023) vía el proceso 16 CFR 312.12. **No se pudo verificar con fuente primaria en esta sesión** si la actualización de la Regla COPPA de enero de 2025 añadió métodos nuevos directamente al texto — las páginas de ftc.gov bloquearon el acceso automatizado; confirmar antes de citar como hecho legal.

Para Math Challenge, el diseño ya decidido coincide con el patrón Apple/Google/Microsoft más el patrón de aula de Google Classroom. Recomendación: perfiles hijos (no cuentas OAuth propias) con PIN de 4 dígitos + avatar para tablets compartidas, código de aula de 6 caracteres para invitar, y un panel de aprobación del lado del padre (nunca del niño) para cualquier ingreso a aula.

## Executive summary (EN)

The dominant pattern is not "the child signs up" — it is "an adult creates an account and adds child profiles under their own consent," with a deliberately lightweight child sign-in (PIN, picture, or tapping an avatar on an already-bound device) so a 6–10-year-old can get in without reading. Apple, Google, and Microsoft use **real child accounts** inside a family group, with spending, screen-time, and content controlled by the parent, transitioning at 13 (COPPA's US digital-consent age) and again at legal majority. Streaming (Netflix, Disney+) and some games (Nintendo) use **profiles**, not accounts — lighter, but with no durable child identity. Education products (Prodigy, Google Classroom) add a third actor, the teacher, who creates a class and links students by code, with each parent's consent captured separately or delegated to the school (FERPA exception).

For verifiable parental consent (VPC), the FTC has maintained an accepted-methods list under COPPA for over a decade (signed form, credit-card charge, toll-free call, video conference, government-ID + facial match — approved 2015), and has individually approved facial-age-estimation methods (PRIVO/Yoti, 2023) via the 16 CFR 312.12 process. **Whether the January 2025 final COPPA Rule amendments added new methods directly to the rule text could not be confirmed against a primary source this session** — ftc.gov blocked automated fetches; verify before citing as legal fact.

For Math Challenge, the already-decided design matches the Apple/Google/Microsoft pattern plus Google Classroom's classroom pattern. Recommendation: child profiles (not independent OAuth accounts) with a 4-digit PIN + avatar for shared tablets, a 6-character class code for invites, and a parent-side (never child-side) approval panel for any classroom join.

## Findings

### Apple: Family Sharing, Child Accounts, Ask to Buy, Declared Age Range API

An organizer (parent, 18+, own Apple ID) designates family members, including children. A child member's purchases route through **Ask to Buy**: App Store/iTunes/Books purchases, in-app purchases, and iCloud storage upgrades generate a request the organizer approves or denies before it completes [1]. Child accounts are created and managed under the organizer's family group, never self-registered.

The newer **Declared Age Range API** (iOS/iPadOS/macOS 26, previewed WWDC 2025) lets an app read a privacy-preserving age *category* (under 13 / 13–17 / 18+) instead of a birthdate. The age is set once, at account creation or via Screen Time/Family Sharing, and apps read it via a Swift API without seeing the underlying date of birth [2][3]. It ships alongside a **Significant Change (PermissionKit)** mechanism for re-consent when an app's feature set changes, and Server Notifications when a parent revokes consent. Apple frames this as compliance tooling for 2025–2026 age-assurance laws (Texas, Louisiana, Utah, Brazil, Australia, Singapore) — a jurisdiction-agnostic age signal, not a VPC method itself.

### Google Family Link

A parent 18+ creates a Google Account for a child under 13 (or local consent age) via Family Link, in the same country as the child [4]. The account is flagged supervised: the parent approves/blocks Play installs and purchases, sets screen-time limits and bedtimes, filters mature content, and sees device location. Sign-in is a normal Google Account sign-in; on a shared device, parent and child accounts coexist and the child switches via the standard Android account switcher. Google's exact "graduation" mechanics at 13+ could not be confirmed against a fetched primary source this session and should be verified separately.

### Microsoft Family Safety / Xbox / Minecraft

Family Safety groups a parent's Microsoft Account with child accounts, delivering screen-time limits, content filtering, and activity summaries across Windows, Xbox, and Android [5]. Minecraft authenticates through the same Microsoft Account system, so its parental surface is the Xbox/Microsoft family group: a child's own Microsoft Account signs in, and family settings gate multiplayer/Realms access, chat, and ratings. Exact creation-flow and 13/18-transition mechanics could not be retrieved from fetched pages this session (only overview content loaded) and should be re-verified before citing specifics.

### Nintendo Switch parental controls

A parent (18+) needs a Nintendo Account and pairs the free **Nintendo Switch Parental Controls** app to the household's console(s) [6]. Controls: ESRB-based game filtering, daily/nightly play-time limits, restricting messaging/GameChat to approved contacts, requiring approval for video chat with under-16s, blocking screenshot sharing to social networks, and eShop spending limits. This is console-level profile restriction rather than a distinct signed-in child identity — no separate password-protected account is needed to play; a parent PIN overrides restrictions on the shared console.

### Netflix and Disney+ kids profiles

Both use **profiles under one paid household account**, not separate child accounts. Netflix's Kids profile hides content above a settable maturity rating and can sit behind a numeric Profile Lock PIN; Disney+ offers a similar Junior Mode plus profile PIN. This is the lightest-weight pattern surveyed: no child identity persists outside the household account, nothing to migrate at 13/18, and the "consent" boundary is a household-purchasing boundary, not a data-collection-from-a-minor boundary — neither is a COPPA operator collecting a minor's PII to create an account, which is why profiles suffice. (Help-center pages were not fetchable this session due to bot-blocking; these are well-established stable features, not summarized from a live source — spot-check if exact UI copy is needed.)

### Roblox parental controls and age verification

Roblox requires an account to play (guest play removed 2017); since a November 2024 overhaul, a parent can create a **separate linked parent account** controlling screen time, private messaging, and communication settings. Since December 2025 (first markets)/January 2026 (global), Roblox requires **age verification for any in-platform communication**, via vendor Persona: government ID upload or facial age-estimation video, with manual correction if the estimate is wrong; verified users are grouped into age bands (e.g., a 12-year-old can message only ages 9–15) [7]. This is a live, current example of facial age estimation deployed at consumer scale to gate communication rather than account creation — relevant if Math Challenge ever considers chat/social features.

### Khan Academy, Duolingo, Prodigy

Khan Academy Kids (ages 2–7) is a separate free app; Khan Academy proper uses a coach-student model where a teacher creates a classroom and a separate flow lets a parent view progress — exact child sign-in mechanics could not be confirmed from a live source this session. Duolingo ABC (2020, pre-readers, no ads/IAP) is fully separate from the main product; the Super Duolingo Family Plan bundles household subscriptions, but exact parent-child linking mechanics could not be verified from a primary source and should be checked directly before use as a design reference.

Prodigy separates the **child's play account** (typically created through the school for classroom use) from a **parent account** the parent creates independently and links to the child, unlocking a Membership dashboard: real-time and monthly progress reports, goal-setting, in-game rewards, and printable worksheets [8]. This is the closest existing analog to Math Challenge's teacher mode: the child's classroom identity exists first, and a parent later attaches their own account to monitor and authorize it, rather than creating the child from scratch.

### Verifiable parental consent (VPC) under COPPA

The FTC has certified safe-harbor programs whose members design their own approved VPC flow: TrustArc, ESRB, CARU, PRIVO, Samet Privacy/kidSAFE, iKeepSafe (Aristotle Inc. withdrew August 2021) [9]. Outside safe harbor, COPPA §312.12 lets any operator apply for approval of a novel method — the process PRIVO used in 2023 to get a facial-age-estimation method (built on Yoti technology) approved as a consent-giver-verification tool. Baseline enumerated methods: a signed form (mail/fax/scan), a monetary transaction (card charge), a toll-free number with trained staff, a video conference with trained personnel, and government-ID verification cross-checked against a live photo — this last, "face match to verified photo ID" (FMVPI), was itself an FTC approval dated November 19, 2015 [9][10]. **Verification note**: the January 2025 final COPPA Rule amendments (reportedly effective June 2025) are widely described as adding new enumerated methods and tightening third-party-disclosure consent, but ftc.gov's rule/press-release pages returned 403/404 to automated fetch this session — background only, confirm before relying on it.

### Age-assurance vendors: k-ID and Yoti

k-ID is a compliance platform: **AgeKit** (free coarse age classification), **AgeKit+** (higher-assurance verification via facial estimation, ID checks, or reusable credentials), **Family Connect** (a parent-consent portal with portfolio-level approval across client titles, claiming up to 96% completion rates), **AgeKey** (reusable cross-platform age credential), and **neimo** (regulatory tracking) — claiming coverage across 200+ jurisdictions including COPPA, GDPR Article 8, the UK Age Appropriate Design Code/Online Safety Act, Australia's under-16 law, and Brazil's/India's equivalents [11]. Yoti's facial-age-estimation product could not be fetched directly this session (403) — its accuracy claims and certifications should be verified directly at yoti.com before citing numbers.

### Classroom-join patterns

Google Classroom: each class has an auto-generated **class code**, re-displayable from Settings; a student joins by signing into classroom.google.com and entering it [12]. Workspace-for-Education has per-class caps (50 teachers, 1,000 members) via Google Groups; personal accounts face activity limits, and cross-domain invites are restricted unless a shareable code/link is used. Clever is a **rostering/SSO layer, not a consent layer**: it imports roster data from a school's SIS and provides one sign-on across ed-tech tools; consent responsibility sits with the school (often the FERPA "school official" exception, letting a school authorize a vendor on its behalf) or the vendor's own COPPA flow. Kahoot uses a **game PIN**: hosting requires registration, but joining a live game needs only the PIN, no account — the lightest-friction join pattern surveyed, built for anonymous, ephemeral participation with no persistent identity or consent state.

## Consent mechanism comparison table

| Method | Friction (parent) | Cost per consent | Accepted by | Recommendation |
|---|---|---|---|---|
| Signed form (mail/fax/scan) | High, slow | Low $, high ops overhead | FTC enumerated [9] | No — too slow for onboarding |
| Credit/debit card micro-charge | Medium — needs a card | Processor fee + fraud risk | FTC enumerated [9] | Only if MC charges for a subscription |
| Toll-free number, trained staff | High — real staffing | High (labor) | FTC enumerated [9] | No — not viable at PWA scale |
| Video conference, trained staff | High — scheduling | High (labor) | FTC enumerated [9] | No |
| Gov-ID + live photo match (FMVPI) | Medium-high | Vendor fee (unverified) | FTC-approved 2015 [9][10] | No — disproportionate for a math app |
| Facial age estimation (Yoti/k-ID/PRIVO) | Low-medium, seconds | Vendor fee (unverified) | FTC-approved via §312.12 (2023) [9][11] | Not needed for "is this a parent"; relevant only for future chat/age-band gating |
| Email + click-through | Low | Near-zero | Lower COPPA bar (internal use only) | Good base layer combined with parent-only gating |
| Parent-gated account creation, no child self-registration | Low for parent, zero for child | Near-zero | Sidesteps VPC — consent trigger is collecting PII *from a child*, which never happens here | **Recommended primary pattern** — matches Apple/Google/Microsoft/Prodigy |
| Reusable age credential (k-ID AgeKey, Apple Declared Age Range) | Very low after first check | Amortized | Emerging; not itself a VPC method | Monitor, not needed at MVP |

## Design implications for Math Challenge

1. **Three entities**: `Parent` (credentials, verified email), `ChildProfile` (belongs to exactly one parent, no independent credentials by default), `Teacher` (credentials, creates `Classroom`). A `Classroom` holds many `ChildProfile` references, each with its own per-parent authorization record — mirrors Prodigy's classroom-first child identity plus attaching parent account [8], and Google Classroom's code-join flow [12].
2. **No child self-registration, ever** — matches the decided design and Apple/Google/Microsoft [1][4][5]. Since the child never independently supplies PII, this sits in the lighter "parent-gated creation" row above, not a full COPPA VPC ceremony per child.
3. **Child sign-in on a shared tablet, under 5 seconds, no reading**: avatar grid (parent-chosen icon/color) + 4-digit numeric PIN pad, no keyboard — echoes Nintendo's PIN-override [6] and Netflix's Profile Lock, scaled for pre-readers; faster and more device-agnostic than QR or biometrics.
4. **Device-bound "last profile" shortcut**: on a personal device, remember the last-used profile and go straight to "tap to continue," falling back to the avatar grid only when a second profile is detected — keeps the common one-child-one-tablet case at ~1 tap.
5. **Parent PIN, separate from child PINs**, to reach account settings, add/remove children, or approve a classroom join — same shape as Nintendo's override PIN [6] and Netflix's Profile Lock, applied to protect parent-only actions.
6. **Teacher invites by class code, not email lookup**: a 6-character code (avoiding 0/O, 1/I) shown as text/link/QR — mirrors Google Classroom [12] and Kahoot's PIN, but unlike Kahoot's ephemeral session, must persist and gate on parent approval.
7. **Classroom join is a two-step handshake**: (a) parent adds the code from their own dashboard, never the child's device; (b) status becomes pending or active per trust model; (c) parent always retains a "Remove from classroom" control, satisfying "any parent can pull their child out at any time."
8. **Model authorization as a join table, not a boolean**: `ClassroomMembership(child_profile_id, classroom_id, parent_id, status: pending|approved|revoked, approved_at, revoked_at)` — a free audit trail if a consent dispute ever arises.
9. **Age-band logic keyed off parent-declared age, not a child-re-entered birthdate**: store `birth_year_month` on `ChildProfile`, entered once by the parent; derive "under 13"/"13+" server-side only — echoes Apple's Declared Age Range philosophy of exposing a category, not a date [2][3].
10. **At age 13**: not a hard wall for an app collecting minimal PII, but define an event (`child_profile.crossed_13`) that stops treating the profile as a "child" for any future COPPA-relevant practice (chat, marketing analytics) and optionally offers the parent an account-conversion prompt. Model conversion as parent-triggered, not automatic — Google's/Microsoft's graduation-at-consent-age pattern exists [4][5], but exact mechanics were not independently confirmed this session, so don't copy them blind.
11. **At age 18 (or local majority)**: offer an explicit "convert to independent account" flow requiring the now-adult user to set their own credentials, after which the profile detaches and the parent loses default visibility — general shape matches Apple/Google/Microsoft family-group exits, though none of this session's sources gave a precise mechanism; validate against current docs before implementing.
12. **Do not build facial-age-estimation or government-ID consent for MVP.** The decided design already gates all child data behind a registered parent account, so exposure is closer to "email + parent-gated creation" than a COPPA operator collecting PII from an unsupervised child. Revisit only if a future feature lets a child give PII to a third party (e.g., a public real-name leaderboard) or lets a child start account creation unsupervised.
13. **Reserve the §312.12/safe-harbor path only if counsel determines full COPPA VPC applies at all** — Netflix, Disney+, and Nintendo use profiles instead of accounts specifically to avoid being a COPPA "operator collecting PII from a child"; Math Challenge's parent-creates-profile model should aim for the same legal shape.
14. **Clever/ClassLink rostering is Phase 2+, not MVP**: it solves bulk SIS import and SSO, relevant only once Math Challenge has institutional/district customers; the class-code model (item 6) is sufficient to bootstrap, matching how Kahoot and Google Classroom both work before any SIS integration exists.

## Open questions for the project owner

1. Should the "parent PIN to leave Kid Mode" be shared across all of a parent's children, or per-child?
2. Should a classroom join require teacher confirmation too (two-sided handshake), or is parent-approval alone sufficient?
3. At 13, should Math Challenge proactively prompt for account conversion, or leave it indefinite until the user/parent initiates it?
4. Is any planned feature (chat, real-name leaderboard, user-generated content) likely to raise the COPPA/VPC bar beyond "parent-gated profile creation" — this changes whether items 12–13 hold?
5. Should shared classroom tablets support multiple children via the avatar+PIN grid, or is one-tablet-per-child assumed for the initial rollout?

## Sources

1. Apple Support — Family Sharing overview: https://support.apple.com/en-us/105121
2. Apple Developer — Declared Age Range documentation: https://developer.apple.com/documentation/declaredagerange
3. Apple Developer — Age assurance support/Q&A: https://developer.apple.com/support/age-assurance
4. Google Support — Family Link, set up a child's account: https://support.google.com/families/answer/7101025
5. Microsoft — Family Safety product overview: https://www.microsoft.com/en-us/microsoft-365/family-safety
6. Nintendo — Switch Parental Controls: https://www.nintendo.com/us/switch/parental-controls/
7. Wikipedia — Roblox (age-verification and parental-controls history, Nov 2024 / Dec 2025–Jan 2026 rollout, Persona vendor): https://en.wikipedia.org/wiki/Roblox
8. Prodigy — Parents landing page (Membership/parent dashboard): https://webflow.prodigygame.com/main-en/parents
9. FTC — Complying with COPPA: Frequently Asked Questions (safe-harbor programs, enumerated VPC methods): https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
10. Wikipedia — Children's Online Privacy Protection Act (FMVPI approval Nov 19, 2015; COPPA 2.0 legislative status): https://en.wikipedia.org/wiki/Children%27s_Online_Privacy_Protection_Act
11. k-ID — company/product overview (AgeKit, AgeKit+, Family Connect, AgeKey, neimo): https://www.k-id.com/
12. Google Support — Join a class with a class code: https://support.google.com/edu/classroom/answer/6020282
13. Wikipedia — Clever (company): https://en.wikipedia.org/wiki/Clever_(company)
14. Wikipedia — Kahoot! (game PIN, host vs. player registration): https://en.wikipedia.org/wiki/Kahoot!
15. Wikipedia — Family Sharing (Apple) cross-reference: https://en.wikipedia.org/wiki/Family_Sharing

**Verification note**: several official vendor pages (ftc.gov press releases/legal-library, xbox.com support, yoti.com, help.netflix.com, help.disneyplus.com, Roblox's parental-controls help center) returned HTTP 403/404 to automated fetch this session (bot-blocking or stale paths). Claims sourced only from Wikipedia or general knowledge are flagged inline as such and should be re-verified against the primary vendor/regulator page before being used for legal or compliance decisions.
