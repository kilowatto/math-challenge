# Navigationsmuster für eine PWA-first-Website: installierte App, mobiler Browser-Tab und Desktop

> Math Challenge Forschung — 2026-08-01 — Thema 49

## Zusammenfassung (ES)

Die Website rendert heute **zwei vollständige Navigationsleisten gleichzeitig**
auf iOS/Android: `nav.sitio` oben (sechs Abschnitte in einer horizontal
scrollbaren Zeile, ohne visuellen Hinweis, dass sie scrollbar ist) und
`.barra-inferior` unten, ohne danach zu unterscheiden, ob die Seite installiert
läuft oder in einem normalen Browser-Tab. In einem Safari-Tab entstehen so
**drei** übereinandergestapelte Navigationen — die beiden eigenen plus die
Adressleiste des Browsers —, was die Grundursache dafür ist, dass sich das Menü
iOS-fremd statt nativ anfühlt. Die Evidenz läuft auf drei Regeln hinaus, keine
davon neu für native Softwaregestaltung, aber bis heute abwesend in
`docs/decisions.md`: (1) eine App kombiniert **niemals** zwei primäre
Navigationssysteme gleichzeitig [3][6][7]; (2) eine taktile untere Leiste ist
auf 3-5 Ziele begrenzt, niemals mehr — HIG und Material 3 nennen exakt
dieselbe Zahl [1][2]; (3) unter 5-6 Optionen auf dem Mobilgerät gewinnt ein
Hamburger-Menü in Auffindbarkeit gegenüber einer abgeschnittenen Zeile
[4][5][6]. `display-mode: standalone` in CSS — bereits in `Instalar.astro`
verwendet — ist das korrekte Signal, um "installierte App" von "Browser-Tab"
zu unterscheiden, und erlaubt, dass jeder Kontext seine eigene Navigation
besitzt, ohne dass sie sich überlagern [8][9]. Zu "Native-Look"-Bibliotheken
(Framework7, Ionic, Onsen UI): sie existieren und funktionieren, kosten aber
echtes JavaScript-Gewicht auf jeder Seite der Website — nicht nur dort, wo sie
verwendet werden — und keine konsultierte Quelle legt nahe, dass das Ergebnis
besser ist als gut gemachtes CSS für den konkreten Fall einer Tab-Leiste [10].
Auf dem iPad dokumentiert Material 3, dass die Konvention ab
"medium"-Breiten (≥600dp) von der unteren Leiste zu einem **Seiten-Rail**
wechselt — das deckt sich mit der Breitentabelle von D-041 in der Zeile für
horizontale Vollbilddarstellung [2][11].

## Executive summary (EN)

The site currently paints **two complete navigation bars at once** on
iOS/Android: `nav.sitio` at the top (six sections in a horizontally
scrolling row with no visual affordance that it scrolls) and
`.barra-inferior` at the bottom, unconditioned on whether the page runs
installed or in an ordinary browser tab. In a Safari tab this produces
**three** stacked navigations — the two the site owns plus the browser's own
address bar —, which is the root cause of the menu feeling foreign to iOS
instead of native. The evidence converges on three rules, none new to native
software design but absent from `docs/decisions.md` until now: (1) an app
**never** combines two primary navigation systems at once [3][6][7]; (2) a
touch bottom bar caps at 3-5 destinations, never more — HIG and Material 3
agree on the exact figure [1][2]; (3) below 5-6 options on mobile, a
hamburger menu beats a row that gets cut off, on discoverability [4][5][6].
`display-mode: standalone` in CSS —already used in `Instalar.astro`— is the
correct signal to distinguish "installed app" from "browser tab", letting
each context own its navigation without collision [8][9]. On "native-feel"
libraries (Framework7, Ionic, Onsen UI): they exist and work, but cost real
JavaScript weight on every page of the site —not only where they're used—
and no source consulted suggests the result beats well-made CSS for the
concrete case of a tab bar [10]. On iPad, Material 3 documents the
convention switching from bottom bar to **side rail** at "medium" widths
(≥600dp) — this lines up with D-041's width table at the full-screen
horizontal row [2][11].

---

## Mustermatrix

| Kontext | Plattform | Muster, das die Evidenz stützt | Quelle |
|---|---|---|---|
| Installierte App (`display-mode: standalone`) | iOS / Android, Telefonbreite | Untere Leiste, 3-5 Ziele, Icon + Text | [1][2] |
| Installierte App, volle Tablet-/iPad-Breite horizontal | iOS (iPad) | Seiten-Rail, keine untere Leiste | [2][11] |
| Normaler Browser-Tab | iOS / Android | Kompakter Header + Hamburger-Menü (keine App-Tab-Leiste) | [4][5][6] |
| Jeder Kontext | Windows / macOS / Desktop | Horizontale Leiste oben — entspricht dem "Top"-Modus von Fluent `NavigationView` und der Konvention von macOS-Web-Apps | [12] |
| Jeder mobile Kontext | — | **Niemals** zwei primäre Navigationssysteme gleichzeitig | [3][6][7] |

## Ergebnisse

**1. HIG: 3-5 Tabs, die minimal nötige Anzahl.** Apple dokumentiert
explizit "use three to five tabs in iOS; use a few more in iPadOS and
tvOS if necessary" und warnt, dass jeder zusätzliche Tab die Komplexität
beim Finden von Information erhöht [1].

**2. Material 3: derselbe Bereich und der Punkt, an dem das Muster
wechselt.** Die unteren Navigationsleisten von M3 sind auf 3-5 Ziele
begrenzt und **gelten nur für Telefone und kleine Tablets**. Ab
"medium"-Fenstern (600-839dp) schreibt die Richtlinie vor, die untere
Leiste durch ein **Seiten-Rail** (3-7 Ziele) zu ersetzen; bei mehr als 5
sollte ein erweitertes/modales Rail erwogen werden, statt weiter in der
Leiste zu stapeln [2].

**3. Keine erfolgreiche PWA kombiniert beide.** Mehrere Quellen zu
Navigationsmustern in PWAs stimmen überein, dass der Gewinner-Ansatz die
Wahl **eines einzigen** primären Navigationsmusters ist — die Alternative
(z. B. The Weather Channel, das sehr wohl oben und unten gleichzeitig eine
Leiste nutzt) wird explizit als Antipattern zitiert, nicht als Vorbild [3].

**4. Unter 5-6 Optionen gewinnt das Hamburger-Menü auf dem Mobilgerät.**
Nielsen Norman Group und mehrere UX-Pattern-Quellen stimmen überein: eine
horizontale Tab-Zeile hält auf dem Mobilgerät nicht mehr als 5-6 aus, bevor
sie Scrollen braucht, und horizontales Scrollen in der Navigation **wird
ignoriert**, es sei denn, es gibt einen starken visuellen Hinweis, dass sie
sich fortsetzt — die heutige Zeile (`nav.sitio`) hat keinen, und deshalb
ist der sechste Abschnitt ("Código abierto") praktisch unsichtbar [4][5][6].

**5. Der dokumentierte Trade-off des Hamburger-Menüs.** Er ist nicht
gratis: NN/g dokumentiert, dass versteckte Navigation ihre Auffindbarkeit
gegenüber sichtbarer reduziert. Das ist der Grund, warum die Empfehlung
nicht "alles hinter das Hamburger-Menü" lautet, sondern die
Conversion-Aktionen (Entrar, Crear cuenta) immer sichtbar zu halten und nur
die sechs Inhaltsabschnitte zu verstecken [5].

**6. `display-mode: standalone` ist bereits ein erprobtes Muster in diesem
Repo.** `Instalar.astro` nutzt bereits `@media (display-mode: standalone),
(display-mode: minimal-ui), (display-mode: fullscreen)`, um zu
unterscheiden, ob die Seite installiert läuft. Es ist dasselbe Signal —
ohne neues JavaScript, ohne Plattform-Erkennung in JS, konsistent mit der
bereits in `docs/guia-de-estilo.md` geschriebenen Regel —, das entscheidet,
welche der beiden Navigationen jeweils existieren soll [8][9].

**7. Windows/Fluent: der "Top"-Modus ist vollwertig, kein Kompromiss.**
Microsofts `NavigationView` unterstützt explizit einen horizontalen
Navigationsmodus oben ("Top") als erstklassige Alternative zum linken
Seiten-Rail, empfohlen, wenn alle Optionen gleichzeitig gezeigt werden
sollen und reichlich Bildschirmfläche vorhanden ist — was genau der
Desktop-Fall von Math Challenge heute ist [12].

**8. Zu "Native-Look"-Bibliotheken.** Framework7, Ionic und Onsen UI
existieren speziell, um native iOS-/Android-Controls in einer PWA
nachzuahmen, aber die konsultierten Quellen beschreiben Framework7 als
"relatively large" in der Größe, mit den entsprechenden Kosten in der
Ladezeit, und keine Quelle legt einen Ergebnisvorteil gegenüber gut
gebautem CSS für den konkreten Fall einer Tab-Leiste nahe — was genau das
ist, was `plataformas.css` heute bereits für Radien, Elevation und das
transluzente iOS-Material baut [10].

**9. Das Vollbild-Overlay hat iOS-Safari-spezifische Eigenheiten.** Eine
auf die Detailpflege der mobilen Erfahrung zentrierte Quelle dokumentiert,
dass Vollbild-Overlays in iOS Safari nicht mit der Wischgeste schließen,
die unter Android funktioniert, und dass `env(safe-area-inset-*)` in
diesem Kontext mit Sorgfalt behandelt werden muss — ein Menü, das sich
**durch Verschieben des Inhalts** öffnet (statt eines festen Overlays),
vermeidet diese Bug-Kategorie konstruktionsbedingt [6].

## Designimplikationen

1. **Niemals `nav.sitio` vollständig und `.barra-inferior` gleichzeitig
   rendern.** Ersteres ist das Browser-Tab-Muster, letzteres das der
   installierten App. Unterschieden wird mit `display-mode: standalone`,
   ohne JS.
2. **Die installierte untere Leiste ist auf 5 Ziele begrenzt, alle einen
   Tap entfernt**: das Maximum, das HIG/M3 erlauben. Kein Ziel landet
   hinter einer zweiten Ebene, wenn der Produktinhaber selbst verlangt,
   dass es einen Tap entfernt ist — die Lösung ist nicht, das Limit von 5
   zu verletzen, sondern gut zu wählen, welche 5.
3. **Die übrigen Abschnitte (Origen, Arquitectura, Código abierto) leben
   in einem nativen `<details>/<summary>`**, nicht in einem sechsten Tab
   und nicht in horizontalem Scrollen. Null JavaScript, derselbe Mechanismus
   in beiden Kontexten (installierte App und Browser-Tab), konsistent mit
   "Sin JavaScript: cinco enlaces", das `Base.astro` bereits deklariert.
4. **Im Browser-Tab (nicht installiert), kompakter Header**: Marke +
   Entrar + Crear cuenta immer sichtbar + Button, der die sechs Abschnitte
   **darunter** aufklappt und den Inhalt verschiebt — niemals ein
   Vollbild-Overlay, wegen Befund #9.
5. **iPad in voller Horizontalbreite (1024-1366px, die Zeile aus D-041)
   nutzt ein Seiten-Rail**, nicht die iPhone-Unterleiste — deckt sich mit
   dem Punkt, an dem Material 3 den Musterwechsel ansiedelt. Unterhalb
   dieser Breite (vertikal, Split View) verhält sich das iPad wie ein
   iPhone, was bereits die Basis von D-041 ist.
6. **Keine neue Bibliothek.** Semantisches HTML + CSS mit `data-platform`
   und `display-mode`, genau das Muster, das das Repo bereits nutzt — null
   zusätzliche Bundle-Kosten im Rest der Website.
7. **Desktop bleibt unverändert**: die heutige horizontale Leiste oben
   entspricht dem "Top"-Modus von Fluent NavigationView und der Konvention
   von macOS-Web-Apps — es gibt keine Evidenz, dass das Konkurrieren um ein
   anderes Muster dort etwas kauft.

## Fragen an den Projektinhaber — gelöst am 2026-08-01

Diese wurden in Multiple-Choice-Fragrunden während derselben Sitzung wie
diese Untersuchung gelöst und sind hier dokumentiert, damit die Entscheidung
nicht ohne ihr Warum dasteht:

1. **Wann wird die untere Leiste gezeigt?** → Nur installiert
   (`display-mode: standalone`).
2. **Was passiert mit dem, was nicht in 5 Ziele passt?** →
   `<details>/<summary>` "Más", außer Entrar/Crear cuenta, die der Inhaber
   explizit einen Tap entfernt verlangt hat, ohne Umweg über "Más".
3. **Bibliothek oder reines CSS?** → Reines CSS, keine neue Abhängigkeit.
4. **Breites iPad wie iPhone oder eigenes Rail?** → Eigenes Rail, nur in
   voller Horizontalbreite (1024-1366px).
5. **Sichtbare Aktionen im kompakten Header des Browser-Tabs?** → Immer
   sichtbar, dasselbe Kriterium wie die installierte Leiste.
6. **Wie klappt das Menü im Browser-Tab auf?** → Es verschiebt den Inhalt
   nach unten, kein Overlay — wegen Befund #9 zu iOS Safari.

## Quellen

1. Apple Developer, "Tab bars" — Human Interface Guidelines —
   https://developer.apple.com/design/human-interface-guidelines/tab-bars
   (abgerufen 2026-08-01)
2. Material Design 3, Richtlinien "Navigation bar" und "Navigation rail" —
   https://m3.material.io/components/navigation-bar/guidelines ·
   https://m3.material.io/components/navigation-rail/guidelines (abgerufen
   2026-08-01)
3. Phone Simulator, "Mobile Navigation Patterns That Work in 2026" —
   https://phone-simulator.com/blog/mobile-navigation-patterns-in-2026
   (abgerufen 2026-08-01)
4. Nielsen Norman Group, "Basic Patterns for Mobile Navigation: A Primer" —
   https://www.nngroup.com/articles/mobile-navigation-patterns/ (abgerufen
   2026-08-01)
5. Onething Design, "Hamburger Menu vs Tab Bar: Which Works Better?" —
   https://www.onething.design/post/hamburger-menu-vs-tab-bar (abgerufen
   2026-08-01)
6. Gromov, "Full-screen menu quirks for mobile Safari" —
   https://gromov.com/en/full-screen-menu-quirks-mobile-safari (abgerufen
   2026-08-01)
7. Smashing Magazine, "How To Decide Which PWA Elements Should Stick" —
   https://www.smashingmagazine.com/2020/01/mobile-pwa-sticky-bars-elements/
   (abgerufen 2026-08-01)
8. web.dev, "How to provide your own in-app install experience" (dokumentiert
   die `display-mode`-Media-Query) —
   https://web.dev/customize-install/ (abgerufen 2026-08-01)
9. Math Challenge interner Code, `apps/web/src/components/Instalar.astro` —
   bereits bestehende Nutzung von `@media (display-mode: standalone)` in
   diesem Repo.
10. StackShare, "Framework7 vs Ionic vs Onsen UI" —
    https://stackshare.io/stackups/framework7-vs-ionic-vs-onsen-ui (abgerufen
    2026-08-01)
11. Math Challenge interne Entscheidung, D-041 — iPad-Breitentabelle —
    `docs/decisions.md`
12. Microsoft Learn, "NavigationView" — Windows apps —
    https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview
    (abgerufen 2026-08-01)
