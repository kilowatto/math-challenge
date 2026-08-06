# Navigation für den authentifizierten App-Bereich: Eltern-Dashboard und zukünftige Spiel-Oberflächen für Kind/Erwachsene

> Math Challenge Forschung — 2026-08-02 — Thema 50

## Zusammenfassung (ES)

Der Inhaber fand anhand eines echten Screenshots, dass das Eltern-Panel
("Tu casa") `Base.astro` erbte — das MARKETING-Nav, mit "Entrar"/"Crear
cuenta" als Aktionen für jemanden, der bereits eingeloggt ist. Die interne
Untersuchung bestätigte, dass dies ein Versehen war, keine Entscheidung:
die drei Dateien unter `app/kids/**` tragen ausführliche, zitierte
Begründungen, warum sie `Base.astro` NICHT verwenden (null Telemetrie,
null Marken-Navigation, null JavaScript — rote Linie #2, D-037), aber
`app/index.astro` und `app/signin.astro` waren die einzigen beiden Dateien
unter `/app/**` ohne einen einzigen Kommentar, der ihre Layout-Wahl
erklärte. Weder `docs/master-plan.md` noch `docs/decisions.md` enthalten
eine einzige Entscheidung darüber, welche Navigation der authentifizierte
Erwachsenenbereich haben soll — D-064 und `mc-49` decken ausschließlich
die öffentliche Website ab.

Der tiefere Befund betraf nicht das Layout, sondern das Datenmodell: der
Bildschirm nahm an, dass jeder Erwachsene ein Elternteil ist.
`users.is_learner` existiert seit Migration 0001 — "nutzt dieser
Erwachsene das Produkt für sich selbst?" — und nichts downstream hat es je
gelesen. Ein Erwachsener, der sich über `registro-aprendo` registrierte,
sah den leeren, sinnlosen Abschnitt "Tus hijos" und **hat keinen Ort, wohin
er gehen kann**: es gibt keinen Übungsbildschirm für einen allein
lernenden Erwachsenen — F5b (Inhalt N8-N10) und F10 (Erwachsenen-Clubs)
sind weiterhin ungebaut —, sodass die Navigationslücke in Wahrheit zwei
Lücken war: das falsche Layout und eine Funktion, die noch nicht existiert.

Die externe Untersuchung läuft auf ein bekanntes Muster hinaus: Google
Family Link — das nächste reale Analogon, ein Erwachsener, der die Nutzung
eines Minderjährigen verwaltet — verwendet exakt 3 feste Tabs
(Übersicht/Kontrollen/Standort), kein Marketing-Site-Nav [1]. Die
UX-Literatur bestätigt, dass feste Tabs funktionieren, wenn es 3-5
gleich wichtige Ziele gibt [2][3], und dass ein Panel mit mehr als das zu
einer einseitigen scrollbaren Liste statt zu Tabs wird [4] — dieselbe
HIG-/Material-3-Regel, die D-064 bereits auf 5 festgelegt hat.

Zu den KIND-Oberflächen in zukünftigen Bändern (PRIMARIA, SECUNDARIA): die
Untersuchungen `mc-20`/`mc-21` haben das bereits geklärt — Navigation mit
maximal 2 Taps, null Menü, das Avatar-Raster IST die Navigation [5][6].
`mc-21` fügt für PRIMARIA eine leichte "Wo bin ich in der Sitzung"-Leiste
hinzu (kein Menü) [7]. `mc-22` (Sekundarstufe) ist die einzige, die ein
anderes Navigationsmuster vorschlägt: **persistentes Seiten-Rail nur auf
Desktop**, angedockter Ziffernblock unten auf dem Mobilgerät — aber als
Inhaltsdichte innerhalb des Übungsbildschirms beschrieben, nicht als
Account-Chrome [8]. `mc-23` (Erwachsene/Pro) verlangt SICHTBARE
Sprung-Navigation innerhalb der Übung (zum Thema springen), statt eines
festen linearen Flusses — wiederum innerhalb des Problemlöse-Bildschirms,
kein Account-Menü [9].

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

## Ergebnisse

**1. Die Tab-Struktur von Google Family Link.** Drei feste Tabs: Highlights
(heutige Nutzung, meistgenutzte App), Controls (Bildschirmzeit /
App-Limits), Location — plus ein gemeinsamer Benachrichtigungs-Hub.
Haushalte mit mehreren Kindern erhalten schnellen Profilwechsel aus
derselben Shell [1]. Das ist architektonisch das nächste reale Produkt an
"Tu casa": ein Erwachsenen-Account, der Minderjährige verwaltet, keine
Marketing-Website.

**2. Tabs vs. einzelne Scroll-Liste, und wo die Grenze liegt.** Untere Tabs
passen zu 3-5 primären Zielen, die wiederholt aufgerufen werden [2].
Einstellungsbildschirme im Speziellen: Tabs funktionieren, wenn die Ziele
gleich wichtig und einander nicht untergeordnet sind; wenn ein Ziel klar
primär und der Rest sekundär ist, oder wenn es mehr verschiedene Kategorien
als das gibt, dient eine einzelne scrollbare Liste besser [3][4].
Seitenleisten-Navigation ist die richtige Wahl für Produkte mit 15-40
Abschnitten (Admin-Panels, SaaS-Dashboards) — nicht anwendbar auf die
Größenordnung dieses Bildschirms (2-5 Abschnitte) [10].

**3. Die Navigationsbefunde von `mc-20` (KINDER), für den Zweck dieser
Aufgabe wiederholt.** Maximal 2 Taps vom App-Start bis zum "Beantworten
eines Retos". Tap 1: Avatar wählen. Tap 2: Maskottchen/Play antippen.
Explizites Antipattern: "tiefe oder versteckte Navigation
(Hamburger-Menüs, mehrstufige Einstellungen) innerhalb der
Kind-Oberfläche" [5]. Gilt designbedingt für KINDER; die Codebasis
verwendet derzeit dasselbe Zero-Chrome-Muster für ALLE Kinderbänder über
`kids/jugar.astro` (explizit als Vereinfachung dokumentiert: "en esta
rejilla conviven las tres bandas de niño... manda el piso más alto de los
tres").

**4. Die Navigationsbefunde von `mc-21` (PRIMARIA).** Schneller
Profilwechsel ohne Tippen; keine Annahme eines persistierten persönlichen
Logins (geteilte Familien-Tablets, Schul-Chromebooks) [6]. Ein neues
Element gegenüber KINDER: eine leichte Sitzungs-Kontextleiste
(Fortschritts-/Serien-Indikator) — das erste Band, in dem "Wo bin ich in
dieser Sitzung" überhaupt empfohlen wird, aber immer noch kein Menü [7].

**5. Die Navigationsbefunde von `mc-22` (SECUNDARIA/Teens).** Die eine
direkt übertragbare Chrome-Idee über alle vier Band-Dokumente hinweg:
*"Tablet: two-pane (problem + scratch/graph). Desktop: persistent
skill-tree sidebar that phone omits — the 'not a kids app' signal on
desktop leans toward Desmos/Khan-Academy-style utility density."* [8]
Explizit als Dichte pro Oberfläche innerhalb des Übungsbildschirms
gerahmt, nicht als Account-Level-App-Navigation. Dark-Mode-by-default für
dieses Band ist bereits in `bandas.css` implementiert.

**6. Die Navigationsbefunde von `mc-23` (Erwachsene/Experten).** *"Expose
explicit learner control over path: visible skip/reorder/jump-to-topic...
honoring the self-concept assumption that adults disengage when the system
controls sequencing."* [9] Ebenfalls innerhalb des Übungsbildschirms —
Multi-Panel-Dichte (Problem, Rechenfläche, Versuchsverlauf), kein
Einstellungs-/Account-Menü.

**7. Was keines der vier Band-Dokumente behandelt.** Ein persistentes,
Top-Level-, Account-zugewandtes Navigationsmenü für den authentifizierten
Bereich. KINDER/PRIMARIA wollen designbedingt null Chrome. Die
SECUNDARIA-/Erwachsenen-Befunde betreffen Inhaltsdichte in der Übung. Das
bestätigt, dass die Navigationslücke der privaten App, die dieses Dokument
behandelt, zuvor keinerlei Forschungsabdeckung hatte — dieselbe Schluss-
folgerung, zu der `mc-49` für die öffentliche Website vor D-064 kam.

**8. Die Datenmodell-Lücke.** `migrations/0001_identity.sql`, Kommentar zum
bewussten Fehlen einer `role`-Spalte: *"Sin columna `role`... una persona
puede ser las tres cosas a la vez: el propio dueño es papá y aprendiz
adulto (por-que-existe.md). Un rol excluyente obligaría a mentir."*
Fähigkeiten werden abgeleitet: Elternteil ⇐ hat Zeilen in
`child_profiles`; Lehrkraft ⇐ hat eine Zeile in `group_owner_identity`
(F9, ungebaut); Lernender ⇐ `users.is_learner = 1`, **das einzige
explizite Flag**, bei der Registrierung über die `registro-aprendo`-Tür
gesetzt, aber vor diesem Durchgang niemals downstream gelesen.

## Designimplikationen

1. **Der authentifizierte Erwachsenenbereich bekommt ein eigenes Layout,
   nicht `Base.astro`.** Dasselbe Prinzip, das `app/kids/**` bereits für
   Kind-Oberflächen etabliert hat, erweitert auf die eine verbleibende
   Lücke (D-065).
2. **Feste obere Tab-Leiste, nicht die Vier-Kontexte-Maschinerie von
   D-064.** Dieser Bildschirm hat 2-5 Ziele, nicht "6 Abschnitte +
   Overflow im Wettbewerb mit einem Marketing-Nav" — das Problem, das die
   Komplexität von D-064 löst, existiert hier nicht. Eine einfache sticky
   Tab-Zeile, unabhängig von `display-mode` vorhanden (es gibt kein
   konkurrierendes Browser-Tab-vs-installiert-Nav, mit dem man stapeln
   müsste), passt sowohl zum Family-Link-Präzedenzfall als auch zum
   eigenen Instinkt des Produkts, "keine Maschinerie zu bauen, die ein
   Problem nicht braucht".
3. **Tabs werden von dem abgeleitet, was der Account tatsächlich hat,
   nicht davon, durch welche Tür er sich registriert hat.** `esFamilia` =
   hat ≥1 Kinderprofil. `esSolo` = `users.is_learner = 1`. Nicht
   gegenseitig exklusiv. Begrenzt auf 5 (HIG/Material 3, die eigene
   Zitation von mc-49, hier erneut angewendet).
4. **"Cuenta" (Passkey/Passwort/Abmelden) ist immer vorhanden und immer
   echt** — es ist das eine Ziel, das niemals vom Account-Typ abhängt, und
   garantiert, dass das Dashboard niemals eine Sackgasse ist, selbst für
   einen Account ohne Kinder und ohne gesetztes `is_learner` (z. B.
   nur-Lehrkraft, F9 ungebaut).
5. **Der Landing-Tab ist der erste ECHTE (nicht-"coming soon") Tab**,
   nicht einfach der erste in der Anzeigereihenfolge — ein allein
   Lernender sollte die App nicht auf einem "coming soon"-Platzhalter
   öffnen, wenn "Cuenta" echten, funktionierenden Inhalt hat.
6. **Das RUM-Band ist `SERIO`, nicht `PUBLICO`.** D-037 erlaubt das
   Messen von Erwachsenen-Oberflächen; `PUBLICO` mischt
   Marketing-Traffic mit authentifizierter Produktnutzung in demselben
   Metrik-Bucket.
7. **Für zukünftige Kind-Bänder (PRIMARIA, SECUNDARIA): niemals
   Account-Level-Chrome — das ist die Leitlinie, die der Inhaber jetzt
   fixiert haben wollte statt sie zu verschieben.** Das
   Null-Navigation-, Avatar-Raster-als-Einstieg-Muster, das `kids/**`
   bereits für KINDER implementiert, bleibt das Muster für jedes
   Kinderband. Was sich pro Band ändert, ist die *Inhaltsdichte innerhalb
   des Spielbildschirms*, niemals die App-Level-Navigation: PRIMARIA fügt
   eine leichte Sitzungs-Fortschrittsleiste hinzu (kein Menü);
   SECUNDARIAs Desktop-Übungsbildschirm darf ein persistentes
   Skill-Tree-Seiten-Rail tragen, das Telefon dockt weiterhin den
   Ziffernblock an, ohne zusätzlichen Chrome; keines der drei bekommt je
   ein Hamburger-Menü, eine untere Tab-Leiste oder irgendeine Struktur,
   die mehr als 2 Taps vom Öffnen bis zum "Beantworten eines Retos"
   erfordert. Ein Kind erreicht niemals `layouts/Privada.astro` — dieses
   Layout ist konstruktionsbedingt nur für Erwachsene (D-065).
8. **Für die zukünftige Selbstlern-Oberfläche Erwachsene/Pro (F5b/F10,
   ungebaut):** wenn sie ausgeliefert wird, lebt sie als **echter**
   "Practicar"-Tab in derselben `Privada.astro`-Shell (kein neues
   Layout) — die sichtbare Skip/Jump-to-topic-Navigation von `mc-23`
   geschieht *innerhalb* dieses Bildschirms, so wie sie es in jedem
   Übungsbildschirm täte, nicht als zweites Account-Level-Nav-System.

## Offene Fragen für den Projektinhaber

Bereits in dieser Sitzung gelöst, hier zur Nachverfolgbarkeit festgehalten:

1. *Solo- vs. Familien-Accounts, und wie sich das Menü unterscheiden
   soll* → gelöst: von echten Daten abgeleitet (`is_learner`,
   Kinderanzahl), nicht von der Registrierungstür; Tabs sind die Vereinigung
   dessen, was zutrifft.
2. *Ob die Tabs von F8 jetzt antizipiert werden sollen* → gelöst: ja, als
   sichtbare "Próximamente"-Tabs, statt die Navigation zweimal neu zu bauen.
3. *Ob die Zukunftsband-Leitlinie jetzt geschrieben oder verschoben wird*
   → gelöst: jetzt (Designimplikation #7 oben).

Weiterhin offen, für wen auch immer F5b/F9/F10 baut:

1. Wenn der "Practicar"-Tab für Erwachsene vom Platzhalter zu echt wird,
   verwendet er dann Entity-Modellierung im `child_profiles`-Stil, oder
   eine eigene Tabelle, direkt auf `users.id` gekeyed? (Außerhalb des
   Navigations-Umfangs; eine Inhalts-/Datenfrage für F5b.)
2. Wenn F9 (Lehrkraft/Klassenzimmer) ausgeliefert wird, bekommt die
   Lehrkraft hier einen 6. Tab, oder einen vollständig separaten
   `/app/maestro/`-Bereich? Die 5-Tab-Grenze dieses Dokuments nimmt
   Elternteil+Lernenden an; ein Lehrkraft-Tab bräuchte an diesem Punkt
   seine eigene Scope-Entscheidung.

## Quellen

1. Google Families / Family Link Produktdokumentation und Support-Seiten —
   Tab-Struktur (Highlights/Controls/Location), Profilwechsel bei mehreren
   Kindern — https://support.google.com/families/answer/7103340 ,
   https://families.google/familylink/ (abgerufen 2026-08-02)
2. UXPin, "Mobile Navigation Patterns: Pros and Cons" —
   https://www.uxpin.com/studio/blog/mobile-navigation-patterns-pros-and-cons/
   (abgerufen 2026-08-02)
3. LogRocket Blog, "Tabbed navigation in UX: Where and when to use it" —
   https://blog.logrocket.com/ux-design/tabs-ux-best-practices/ (abgerufen
   2026-08-02)
4. Cursa, "Tab Navigation Patterns and When to Use Them" —
   https://cursa.app/en/page/tab-navigation-patterns-and-when-to-use-them
   (abgerufen 2026-08-02)
5. Math Challenge interne Untersuchung,
   `docs/research/2026-07-31-mc-20-ui-ages-3-6-kinder.md`
   §8, Designimplikationen #8-#9.
6. Math Challenge interne Untersuchung,
   `docs/research/2026-07-31-mc-21-ui-ages-7-11-primary.md`
   §10, Designimplikation #13.
7. Wie [6], Designimplikation #4.
8. Math Challenge interne Untersuchung,
   `docs/research/2026-07-31-mc-22-ui-teens-12-17.md`,
   Designimplikation #13.
9. Math Challenge interne Untersuchung,
   `docs/research/2026-07-31-mc-23-ui-adult-expert.md`,
   Designimplikationen #8, #10.
10. AlfDesignGroup, "Sidebar Design for Web Apps: UX Best Practices (2026
    Guide)" — https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps
    (abgerufen 2026-08-02)
11. Math Challenge interner Code/Entscheidungen —
    `migrations/0001_identity.sql` (Schema-Kommentar zu `role` vs.
    abgeleiteten Fähigkeiten, `is_learner`-Spalte),
    `apps/web/src/pages/[locale]/app/kids/index.astro` (§"Por qué esta
    pantalla NO usa `layouts/Base.astro`"), `docs/decisions.md` D-034,
    D-064.
