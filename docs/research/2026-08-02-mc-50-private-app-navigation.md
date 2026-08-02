# Navigation for the Authenticated App Area: Parent Dashboard and Future Child/Adult Play Surfaces

> Math Challenge research — 2026-08-02 — topic 50

## Resumen ejecutivo (ES)

El dueño encontró, con una captura real, que el panel del padre ("Tu casa")
heredaba `Base.astro` — el nav de MARKETING, con "Entrar"/"Crear cuenta" como
acciones para alguien que ya inició sesión. La investigación interna confirmó
que esto era omisión, no decisión: los tres archivos de `app/kids/**` tienen
razonamiento extenso y citado para NO usar `Base.astro` (cero telemetría,
cero navegación de marca, cero JavaScript — línea roja #2, D-037), pero
`app/index.astro` y `app/signin.astro` eran los dos únicos archivos bajo
`/app/**` sin ningún comentario que explicara su elección de layout. Ni
`docs/master-plan.md` ni `docs/decisions.md` contienen una sola decisión
sobre qué navegación debe tener el área autenticada del adulto — D-064 y
`mc-49` cubren exclusivamente el sitio público.

El hallazgo más profundo no fue de layout sino de modelo de datos: la
pantalla asumía que todo adulto es un padre. `users.is_learner` existe desde
la migración 0001 —"¿este adulto usa el producto para sí mismo?"— y nada
downstream lo leía nunca. Un adulto que se registró por `registro-aprendo`
veía la sección "Tus hijos" vacía y sin sentido, y **no tiene ningún lugar a
donde ir**: no existe pantalla de práctica para un adulto que aprende solo
—F5b (contenido N8-N10) y F10 (clubs de adultos) siguen sin construirse—, así
que el hueco de navegación era en realidad dos huecos: el layout equivocado y
una función que no existe todavía.

La investigación externa converge en un patrón conocido: Google Family
Link —el análogo real más cercano, un adulto gestionando el uso de un
menor— usa exactamente 3 pestañas fijas (Resumen/Controles/Ubicación), no un
nav de sitio de marketing [1]. La literatura de UX confirma que pestañas
fijas sirven cuando hay 3-5 destinos igual de importantes [2][3], y que un
panel con más de eso se vuelve una lista de una sola pantalla en vez de
pestañas [4] — la misma regla de HIG/Material 3 que ya fijó D-064 en 5.

Sobre las superficies de NIÑO en bandas futuras (PRIMARIA, SECUNDARIA): la
investigación de `mc-20`/`mc-21` ya deja esto resuelto — navegación máxima de
2 toques, cero menú, la rejilla de caras ES la navegación [5][6]. `mc-21`
agrega, para PRIMARIA, una franja ligera de "dónde estoy en la sesión" (no un
menú) [7]. `mc-22` (secundaria) es la única que sugiere un patrón de
navegación distinto: **riel lateral persistente solo en escritorio**, teclado
numérico anclado abajo en móvil — pero está descrito como densidad de
contenido dentro de la pantalla de práctica, no como app-chrome de cuenta
[8]. `mc-23` (adulto/pro) pide navegación de salto VISIBLE dentro de la
práctica (saltar de tema), en vez de un flujo lineal fijo — de nuevo, dentro
de la pantalla de resolver problemas, no un menú de cuenta [9].

## Executive summary (EN)

The owner found, via a real screenshot, that the parent dashboard ("Tu
casa") inherited `Base.astro` — the MARKETING nav, with "Sign in"/"Sign up"
as actions for someone already logged in. Internal research confirmed this
was omission, not decision: the three `app/kids/**` files carry extensive,
cited reasoning for NOT using `Base.astro` (zero telemetry, zero brand nav,
zero JavaScript — red line #2, D-037), but `app/index.astro` and
`app/signin.astro` were the only two files under `/app/**` with no comment
explaining their layout choice. Neither `master-plan.md` nor `decisions.md`
contains a single decision about what navigation the authenticated adult
area should have — D-064 and `mc-49` cover the public site exclusively.

The deeper finding wasn't about layout but about the data model: the screen
assumed every adult is a parent. `users.is_learner` has existed since
migration 0001 — "does this adult use the product for themselves?" — and
nothing downstream ever read it. An adult who registered via
`registro-aprendo` saw the same empty, meaningless "Your children" section,
and **has nowhere to go**: no practice screen exists for a solo adult
learner — F5b (N8-N10 content) and F10 (adult clubs) remain unbuilt — so the
navigation gap was really two gaps: the wrong layout, and a feature that
doesn't exist yet.

External research converges on a known pattern: Google Family Link — the
closest real analogue, an adult managing a minor's usage — uses exactly 3
fixed tabs (Highlights/Controls/Location), not a marketing-site nav [1]. UX
literature confirms fixed tabs work for 3-5 equally-important destinations
[2][3], and that a panel with more than that becomes a single scrollable
list instead of tabs [4] — the same HIG/Material 3 rule D-064 already fixed
at 5. On future CHILD-facing bands (PRIMARIA, SECUNDARIA): `mc-20`/`mc-21`
already settle this — maximum 2-tap navigation, zero menu, the avatar grid
IS the navigation [5][6]. `mc-21` adds, for PRIMARIA, a lightweight
in-session "where am I" strip (not a menu) [7]. `mc-22` (teens) is the only
one suggesting a different navigation pattern: **persistent sidebar,
desktop-only**, docked numeric keypad on phone — but framed as in-screen
content density, not account-level chrome [8]. `mc-23` (adult/pro) asks for
visible jump navigation inside practice (skip to topic), instead of a fixed
linear flow — again inside the problem-solving screen, not an account menu
[9].

---

## Findings

**1. Google Family Link's tab structure.** Three fixed tabs: Highlights
(today's usage, most-used app), Controls (screen time / app limits),
Location — plus a shared notification hub. Multi-child households get fast
profile switching from the same shell [1]. This is architecturally the
closest real product to "Tu casa": an adult account managing minors, not a
marketing site.

**2. Tabs vs. single-scroll-list, and where the line is.** Bottom tabs suit
3-5 primary destinations accessed repeatedly [2]. Settings screens
specifically: tabs work when destinations are equally important and not
subordinate to each other; when one destination is clearly primary and the
rest secondary, or when there are more varied categories than that, a single
scrollable list serves better [3][4]. Sidebar navigation is the right call
for products with 15-40 sections (admin panels, SaaS dashboards) — not
applicable at this screen's scale (2-5 sections) [10].

**3. `mc-20` (KINDER) navigation findings, restated for this task's
purpose.** Max 2 taps from app-open to "answering a challenge." Tap 1: pick
avatar. Tap 2: tap mascot/Play. Explicit anti-pattern: "deep or hidden
navigation (hamburger menus, multi-level settings) inside the child-facing
surface" [5]. Applies to KINDER by design; the codebase currently reuses
this same zero-chrome pattern for ALL child bands via `kids/jugar.astro`
(explicitly documented as a simplification: "en esta rejilla conviven las
tres bandas de niño... manda el piso más alto de los tres").

**4. `mc-21` (PRIMARIA) navigation findings.** Fast, no-typing profile
switching; no assumption of a persisted personal login (shared family
tablets, school Chromebooks) [6]. One new element vs. KINDER: a lightweight
in-session context strip (progress/streak indicator) — the first band where
"where am I in this session" is recommended at all, but still not a menu
[7].

**5. `mc-22` (SECUNDARIA/teens) navigation findings.** The one directly
transferable chrome idea across all four band docs: *"Tablet: two-pane
(problem + scratch/graph). Desktop: persistent skill-tree sidebar that phone
omits — the 'not a kids app' signal on desktop leans toward
Desmos/Khan-Academy-style utility density."* [8] Explicitly framed as
per-surface density inside the practice screen, not account-level app
navigation. Dark-mode-by-default for this band is already implemented in
`bandas.css`.

**6. `mc-23` (adult/expert) navigation findings.** *"Expose explicit learner
control over path: visible skip/reorder/jump-to-topic... honoring the
self-concept assumption that adults disengage when the system controls
sequencing."* [9] Also inside the practice screen — multi-panel density
(problem, scratch area, attempt history), not a settings/account menu.

**7. What none of the four band docs address.** A persistent, top-level,
account-facing navigation menu for the authenticated area. KINDER/PRIMARIA
want zero chrome by design. SECUNDARIA/adult findings are about in-practice
content density. This confirms the private-app navigation gap this document
addresses had no prior research coverage at all — same conclusion `mc-49`
reached for the public site before D-064.

**8. The data-model gap.** `migrations/0001_identity.sql`, comment on the
deliberate absence of a `role` column: *"Sin columna `role`... una persona
puede ser las tres cosas a la vez: el propio dueño es papá y aprendiz adulto
(por-que-existe.md). Un rol excluyente obligaría a mentir."* Capabilities are
derived: parent ⇐ has rows in `child_profiles`; teacher ⇐ has a row in
`group_owner_identity` (F9, unbuilt); learner ⇐ `users.is_learner = 1`,
**the only explicit flag**, set at signup from the `registro-aprendo` door
but never read downstream before this pass.

## Design implications

1. **The authenticated adult area gets its own layout, not `Base.astro`.**
   Same principle `app/kids/**` already established for child surfaces,
   extended to the one remaining gap (D-065).
2. **Fixed top tab strip, not the four-context machinery of D-064.** This
   screen has 2-5 destinations, not "6 sections + overflow competing with a
   marketing nav" — the problem D-064's complexity solves doesn't exist
   here. A simple sticky tab row, present regardless of `display-mode`
   (there's no competing browser-tab-vs-installed nav to avoid stacking
   with), matches both the Family Link precedent and the product's own
   "don't build machinery a problem doesn't need" instinct.
3. **Tabs are derived from what the account actually has, not from which
   door it registered through.** `esFamilia` = has ≥1 child profile.
   `esSolo` = `users.is_learner = 1`. Not mutually exclusive. Cap at 5
   (HIG/Material 3, mc-49's own citation, reapplied here).
4. **"Cuenta" (passkey/password/sign-out) is always present and always
   real** — it's the one destination that never depends on account type, and
   guarantees the dashboard is never a dead end even for an account with
   neither children nor `is_learner` set (e.g. teacher-only, F9 unbuilt).
5. **Landing tab is the first REAL (non-"coming soon") tab**, not simply the
   first in display order — a solo learner should not open the app to a
   "coming soon" placeholder when "Cuenta" has real, working content.
6. **RUM band is `SERIO`, not `PUBLICO`.** D-037 permits measuring adult
   surfaces; `PUBLICO` mixes marketing traffic with authenticated product
   usage in the same metrics bucket.
7. **For future child-facing bands (PRIMARIA, SECUNDARIA): no account-level
   chrome, ever — this is the lineamiento the owner asked to fix now rather
   than defer.** The zero-navigation, avatar-grid-as-entry pattern
   `kids/**` already implements for KINDER stays the pattern for every child
   band. What changes per band is *content density inside the play screen*,
   never app-level navigation: PRIMARIA adds a lightweight in-session
   progress strip (not a menu); SECUNDARIA's desktop practice screen may
   carry a persistent skill-tree sidebar, phone still docks the keypad with
   no added chrome; none of the three ever gets a hamburger menu, a bottom
   tab bar, or any structure requiring more than 2 taps from open to
   "answering a challenge." A child never reaches `layouts/Privada.astro` —
   that layout is adult-only by construction (D-065).
8. **For the future adult/pro self-study surface (F5b/F10, unbuilt):** when
   it ships, it lives as a **real** "Practicar" tab in this same
   `Privada.astro` shell (not a new layout) — `mc-23`'s visible
   skip/jump-to-topic navigation happens *inside* that screen, the same way
   it would inside any practice screen, not as a second account-level nav
   system.

## Open questions for the project owner

Already resolved this session, recorded here for traceability:

1. *Solo vs. family accounts, and how the menu should differ* → resolved:
   derived from real data (`is_learner`, child count), not signup door;
   tabs are the union of what applies.
2. *Whether to anticipate F8's tabs now* → resolved: yes, as visible
   "Próximamente" tabs rather than rebuilding navigation twice.
3. *Whether to write the future-band guideline now or defer* → resolved:
   now (design implication #7 above).

Still open, for whoever builds F5b/F9/F10:

1. When the adult "Practicar" tab goes from placeholder to real, does it
   reuse `child_profiles`-style entity modeling, or a separate table keyed
   directly on `users.id`? (Out of scope for navigation; a content/data
   question for F5b.)
2. When F9 (teacher/classroom) ships, does the teacher get a 6th tab here,
   or a fully separate `/app/maestro/` area? This document's 5-tab cap
   assumes parent+learner; a teacher tab would need its own scope decision
   at that point.

## Sources

1. Google Families / Family Link product documentation and support pages —
   tab structure (Highlights/Controls/Location), multi-child profile
   switching — https://support.google.com/families/answer/7103340 ,
   https://families.google/familylink/ (fetched 2026-08-02)
2. UXPin, "Mobile Navigation Patterns: Pros and Cons" —
   https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
   (fetched 2026-08-02)
3. LogRocket Blog, "Tabbed navigation in UX: Where and when to use it" —
   https://blog.logrocket.com/ux-design/tabs-ux-best-practices/ (fetched
   2026-08-02)
4. Cursa, "Tab Navigation Patterns and When to Use Them" —
   https://cursa.app/en/page/tab-navigation-patterns-and-when-to-use-them
   (fetched 2026-08-02)
5. Math Challenge internal research, `docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
   §8, design implications #8-#9.
6. Math Challenge internal research, `docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
   §10, design implication #13.
7. Same as [6], design implication #4.
8. Math Challenge internal research, `docs/research/2026-07-31-mc-22-ui-teens-12-17.md`,
   design implication #13.
9. Math Challenge internal research, `docs/research/2026-07-31-mc-23-ui-adult-expert.md`,
   design implications #8, #10.
10. AlfDesignGroup, "Sidebar Design for Web Apps: UX Best Practices (2026
    Guide)" — https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps
    (fetched 2026-08-02)
11. Math Challenge internal code/decisions — `migrations/0001_identity.sql`
    (schema comment on `role` vs. derived capabilities, `is_learner`
    column), `apps/web/src/pages/[locale]/app/kids/index.astro` (§"Por qué
    esta pantalla NO usa `layouts/Base.astro`"), `docs/decisions.md` D-034,
    D-064.
