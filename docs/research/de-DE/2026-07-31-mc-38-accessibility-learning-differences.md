# Accessibility and learning differences in a global, all-ages math game

> Math Challenge research — 2026-07-31 — topic 38

## Zusammenfassung (ES)

- WCAG 2.2 fügt Anforderungen hinzu, die ein taktiles, zeitgesteuertes und altersübergreifendes Spiel voll berühren: **2.5.8 Target Size (Minimum, AA)** verlangt Zielbereiche von ≥24×24 px CSS [1]; **2.5.7 Dragging Movements (AA)** verlangt eine nicht‑zieh‑Alternative [10]; **2.5.1 Pointer Gestures (A)** verlangt eine Ein‑Pointer‑Alternative für Mehrpunkt‑Gesten [8].
- Der zentrale Konflikt — Punktzahl nach Geschwindigkeit vs. **2.2.1 Timing Adjustable (A)** — wird folgendermaßen gelöst: die „Essential Exception“ deckt nur ein Zeitlimit ab, bei dem „eine Verlängerung die Aktivität ungültig machen würde“ [2]. Das rechtfertigt einen optionalen „Speed Challenge“-Modus, nicht den Standardmodus, weil eine vernünftige Alternative (ein Modus ohne Uhr) existiert.
- MathML Core ist ein Candidate Recommendation Snapshot vom 24. Juni 2025 [3]; sein eigener Text besagt, dass `alttext` „kein beobachtbares Verhalten definiert“ — die barrierefreie Semantik von Formeln hängt von MathJax + Speech Rule Engine ab, nicht vom Kernstandard [3][11].
- Dyskalkulie: 3–6 % der Bevölkerung [4], ohne konsensiertes Diagnosekriterium; beste Interventionen: konkrete Manipulative, computerisierte Zahlenstrahl‑Übungen (*The Number Race*, *Graphogame-math*) und adaptive Software (*Calcularis*, *Meister Cody*) [4].
- Belege für spezielle Schriften bei Dyslexie (OpenDyslexic, Dyslexie) sind schwach bis negativ: Rello & Baeza‑Yates (2013) fanden keine Verbesserung der Lesegeschwindigkeit; eine Studie von 2016 zeigte eine Präferenz für Arial gegenüber „Dyslexie‑Schriften“; eine von 2023 ergab ästhetische Vorliebe, aber keinen Unterschied in den Ergebnissen [5].
- Das Europäische Barrierefreiheitsgesetz verlangt die Einhaltung seit dem **28. Juni 2025**, einschließlich ausdrücklich des elektronischen Handels [7]; EN 301 549 (das die vollständige WCAG 2.1 integriert) ist seine technische Referenz [9]. Die US‑ADA‑Regel Titel II verlangt WCAG 2.1 AA für staatliche/kommunale Behörden — einschließlich öffentlicher Schulen — bis 2027/2028 [6].

## Zusammenfassung (EN)

Math Challenge kombiniert ein nach Geschwindigkeit bewertetes Gameplay, symbolische mathematische Darstellung, Altersgruppen von 4 Jahren bis erwachsen, fünf Sprachen und Eingaben über Telefon/Tablet/Desktop — eine komplexere Barrierefreiheitslage als die meisten ein‑Ziel‑Apps. WCAG 2.2 fügt Kriterien hinzu, die direkt greifen: **2.5.8 Target Size (Minimum, AA)** verlangt Zielbereiche von ≥24×24 CSS‑px, mit vier engen Ausnahmen [1]; **2.5.7 Dragging Movements (AA)** verlangt eine nicht‑zieh‑Alternative für jede Zieh‑Mechanik [10]. Der tragende Konflikt ist **2.2.1 Timing Adjustable (A)** versus Geschwindigkeits‑Punktzahl; seine **Essential Exception** — „das Zeitlimit ist wesentlich und eine Verlängerung würde die Aktivität ungültig machen“ [2] — ist eng gefasst und deckt ein gamifiziertes Training nicht standardmäßig ab; die Lösung ist architektonisch (ein separater untimed‑Modus plus ein optionaler timed‑Modus), unten detailliert.

MathML Core ist ein W3C Candidate Recommendation Snapshot (24. Juni 2025), dessen eigener Text besagt, dass das Attribut `alttext` kein definiertes beobachtbares Verhalten hat [3] — MathML Core standardisiert die Darstellung, nicht die barrierefreie Semantik, die stattdessen aus den Barrierefreiheits‑Erweiterungen von MathJax, aufgebaut auf der Speech Rule Engine [11], sowie Screen‑Readern mit Mathematik‑Unterstützung (JAWS 16+, VoiceOver) [12] stammt. Dyskalkulie betrifft 3–6 % der Menschen [4], hat kein konsensiertes Diagnosekriterium, und die am besten belegten Interventionen — konkrete Manipulative, computerisiertes Zahlenstrahl‑Training, adaptive Übungen — entsprechen dem, was Math Challenge bereits bietet [4]. Evidenz für dyslexiespezifische Schriften ist schwach bis negativ; die British Dyslexia Association empfiehlt stattdessen gewöhnliche serifenlose Schriften [5]. Rechtlich gilt der EU European Accessibility Act seit dem 28. Juni 2025 für Verbraucherprodukte/Dienstleistungen einschließlich E‑Commerce [7]; EN 301 549 (das die vollständige WCAG 2.1 einbettet) ist sein technisches Rückgrat [9], und die US‑ADA‑Regel Title II von 2024 verlangt WCAG 2.1 AA für staatliche/kommunale Websites und Apps — einschließlich öffentlicher Schulen — bis 2027/2028 [6], was im Beschaffungsprozess von Schulbezirken auftauchen wird, obwohl es Math Challenge nicht direkt bindet.

## Ergebnisse

### 1. WCAG 2.2: die neuen Kriterien, die hier am stärksten treffen

WCAG 2.2 (Oktober 2023) fügte neun Success Criteria zu 2,1 hinzu. Am relevantesten für ein Touch‑First‑, Drag‑fähiges, zeitgesteuertes Mathematik‑Spiel:

- **2.5.8 Target Size (Minimum) — AA.** "The target for pointer input is at least 24 by 24 CSS pixels in size, except where: Equivalent... Inline... User Agent Control... Essential." [1] Eine Untergrenze, keine Obergrenze — die UI für Kinder unter 8 Jahren sollte deutlich darüber liegen.
- **2.5.7 Dragging Movements — AA (new).** "Functionality that can be operated by dragging movements can also be operated by single pointer activations without dragging, unless dragging is essential." [10] Jede „Drag‑auf‑die‑Zahlenlinie“-Mechanik benötigt ein Tap‑to‑Place‑Äquivalent.
- **2.5.1 Pointer Gestures — A.** "All functionality that uses multipoint or path-based gestures for operation can be operated with a single pointer without a path-based gesture, unless... essential." [8]
- **2.5.4 Motion Actuation — A.** Device‑motion input must also be operable via UI components, with motion response disable‑able [8] — relevant, falls „tilt to answer“ jemals in Betracht gezogen wird.
- **1.4.10 Reflow — AA.** "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: vertical scrolling content at a width equivalent to 320 CSS pixels... Except for parts of the content which require two-dimensional layout for usage or meaning." [13] Ein Geometrie‑Canvas kann plausibel die Ausnahme beanspruchen; das umgebende Chrome (Buttons, Score, Anweisungen) kann es nicht.
- **1.4.1 Use of Color — A.** "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element." [14] Direkt relevant durch farbkodiertes korrekt/inkorrekt‑Feedback oder Schwierigkeitsstufen.
- Andere 2,2‑Ergänzungen (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) sind wichtiger für die Konto/Portal‑Ebene; **3.3.8 Accessible Authentication** ist zu kennzeichnen, falls irgendein Profil‑Gate jemals ein Puzzle‑/CAPTCHA‑ähnliches kognitives Testverfahren als einzige Methode verwendet.

### 2. Der Zeitkonflikt, präzise formuliert

Ein rundenbasiertes, geschwindigkeitsbasiertes Spiel legt „ein Zeitlimit … durch den Inhalt fest“ — die Auslösebedingung für **2.2.1 Timing Adjustable (A)**, die nur erfüllt ist, wenn der Nutzer das Limit ausschalten, es um ≥10 × den Standardwert anpassen, es mit Warnung verlängern kann, oder es unter die **Real‑time‑Exception** („ein erforderlicher Teil eines Echtzeit‑Ereignisses … und keine Alternative zum Zeitlimit möglich ist“) bzw. die **Essential‑Exception** („essentiell und eine Verlängerung würde die Aktivität ungültig machen“) fällt [2]. Eine 20‑Stunden‑Ausnahme und ein Hinweis, der dieses SC mit 3.2.1 (Predictable) verknüpft, existieren ebenfalls [2]. Vollständige Auflösung folgt unten.

### 3. Barrierefreie Mathematik: MathML Core, MathJax, Screenreader

MathML Core ist ein **Candidate Recommendation Snapshot (24 June 2025)**, „not expected to advance to Proposed Recommendation any earlier than 30 September 2025“ [3] — ein bewusst reduzierter, im Browser testbarer Teilbereich von MathML 3. Sein eigener Text: das `alttext`‑Attribut „does not define any observable behavior that is specific to the alttext attribute“ [3] — die Spezifikation standardisiert das Rendering, nicht die barrierefreie Semantik. Firefox und Safari unterstützen MathML bereits seit Langem; Chromium fügte eine Implementierung „at the beginning of 2023“ [15] hinzu. Screenreader: **JAWS ab Version 16 unterstützt MathML‑Sprachausgabe und Braille‑Ausgabe**; **VoiceOver liest MathML in Safari** [12]; NVDA‑Mathe‑Unterstützung existiert über Add‑Ons, wurde hier jedoch nicht aus einer primären Quelle bestätigt und sollte vor dem Start verifiziert werden.

**MathJax** „provides a powerful set of accessibility extensions that provide navigation, exploration, and voicing on the client“, einschließlich Expression Zoom und für Offline/ePub „alternative textual descriptions or more fine‑grained speech annotations and Braille“ [11]. Darunter wandelt die **Speech Rule Engine (SRE)** MathML/LaTeX‑Strukturen in natürlichsprachliche Beschreibungen um („ein halb plus ein drittel“, nicht Rohsymbolnamen). **KaTeX** ist schneller, hat aber schwächere integrierte Barrierefreiheits‑Werkzeuge und benötigt typischerweise ein MathML‑Fallback jenseits dekorativer Anzeige‑Mathematik. Das Rendern von Formeln als Bilder oder Canvas‑Glyphen — ein gängiger kinderfreundlicher UI‑Kurzweg — liefert nichts für einen Screenreader; MathML plus einer Barrierefreiheits‑Schicht ist der einzige Weg, der Notation für blinde/sehbehinderte Nutzer jeden Alters verfügbar macht.

### 4. Dyskalkulie: Prävalenz, Identifikation, Interventionen

Dyskalkulie ist „eine Lernstörung, die zu Schwierigkeiten beim Erlernen oder Verstehen von Arithmetik führt“, die „keinen allgemeinen Defizit in kognitiven Fähigkeiten oder Schwierigkeiten mit Zeit, Messung und räumlichem Denken widerspiegelt“ [4]. Prävalenz: **3–6 %**, geschlechtsübergreifend vergleichbar [4]. **Kein konsensbasierter diagnostischer Kriterium** existiert; die Identifikation kombiniert Leistungstests, Arbeits‑/Exekutiv‑Funktion‑Beurteilungen, Lehrer‑Evaluation und (in der Forschung) fMRT‑Muster [4]. Am besten belegte Interventionen lassen sich in drei Familien einteilen: **konkrete Manipulative** (Fuchs' Tutoring‑Paradigma — Spiele, Lernkarten, Manipulierbares) [4]; **computerisiertes Zahlenlinien‑Training** (*The Number Race*, *Graphogame-math*) [4]; und **adaptive Software** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Dies entspricht mechanisch stark der eigenen Kategorie von Math Challenge — ein Zahlenlinien‑ und Rechen‑Übungs‑Spiel — und spricht für einen explizit dyskalkulie‑informierten Modus statt einer nachträglichen Ergänzung.

### 5. Dyslexie‑Typografie: Die Schriftarten sind der schwache Teil der Geschichte

Unumstritten und kostengünstig: größere Schrift, großzügiger Zeilenabstand, kürzere Zeilen, linksbündig, keine Kursiv‑/Versalien im Fließtext, solider, aber nicht extremer Kontrast. Was **nicht** standhält, ist die Behauptung, dass Dyslexie eine spezielle Schriftart benötige. OpenDyslexic (Abbie Gonzalez, 2011) ist das bekannteste Beispiel [5]. Evidenz: **Rello & Baeza‑Yates (2013)** fanden, dass sie „die Lesegeschwindigkeit nicht signifikant verbesserte noch die Augenfixierung verkürzte“ [5]; eine **2010‑These** ergab, dass Dyslexie „nicht zu schnellerem Lesen“ im Vergleich zu Arial führte [5]; eine **2016‑Studie** zeigte, dass dyslexische Leser **Arial** gegenüber dyslexie‑spezifischen Schriftarten bevorzugten [5]; eine **2023‑Studie** fand ästhetische Präferenz für OpenDyslexic (58 %), aber „keinen Unterschied in den Testergebnissen je nach verwendeter Schriftart“ [5]. Die British Dyslexia Association empfiehlt stattdessen gewöhnliche serifenlose Schriften [5]. **Fazit:** bauen oder lizenzieren Sie keine „Dyslexie‑Schriftart“; investieren Sie stattdessen in Zeilenabstand, Zeilenlänge und konsistente Ikonografie.

### 6. ADHS und Aufmerksamkeit in einer gamifizierten Lern‑App

Die Arbeit von W3C zur kognitiven Barrierefreiheit (COGA) ordnet sich drei WCAG‑Leitlinien‑Überschriften zu: **2,2 Enough Time**, **2,4 Navigable**, **3,2 Predictable** [16], mit tiefergehenden Mustern im Hinweis „Making Content Usable“. In Produktbegriffen: vorhersehbare Sitzungsstruktur, minimale konkurrierende visuelle/audio‑Stimuli während des aktiven Problemlösens, Bildschirme mit Einzel‑Fokus und standardmäßig anpassbare oder vermeidbare Zeitlimits. Variable‑Belohnungs‑ und Sozial‑Vergleichs‑Mechaniken — gängige ADHS‑Engagement‑Hooks in kommerzieller Gamifizierung — verursachen dokumentierte Stress‑/Aufmerksamkeits‑Kosten neben dem Engagement‑Nutzen (siehe Thema 10 dieser Serie) und sollten als Kompromiss, nicht als kostenloser Gewinn, behandelt werden.

### 7. Autismus und sensorisches Design: Bewegung, Klang, Vorhersagbarkeit

`prefers-reduced-motion` hat **seit Januar 2020 den Baseline‑Status weit verbreitet** [17] und ermöglicht einer App, eine OS‑seitige Präferenz zu berücksichtigen. Die dokumentierte Begründung sind **vestibuläre Bewegungsstörungen** — Skalierungs‑/Schwenk‑Animationen, die Schwindel oder Desorientierung verursachen [17]; die Erweiterung auf Autismus/ sensorische Empfindlichkeit ist etablierte Praxis, wenn auch nicht die im primären Quelltext zitierte spezifische Behauptung. WCAGs **2.3.3 Animation from Interactions (AAA)** verlangt, dass „Bewegungsanimationen, die durch Interaktion ausgelöst werden, deaktivierbar sind, es sei denn, die Animation ist essenziell“ [18] — AAA, nicht zwingend bei AA, aber kostengünstig und direkt schützend. Klang verdient die gleiche Behandlung: ein persistierbarer, auffindbarer Schalter „Bewegung reduzieren / Klang reduzieren“, der standardmäßig dem OS‑Signal folgt.

### 8. Visuelle Beeinträchtigung und das Geometrie‑Problem

Geometrie ist das schwierigste Teilgebiet für blinde/sehbehinderte Nutzer, da ihr Inhalt inhärent räumlich ist. Das Standard‑Werkzeugset: **taktile Grafiken** (geprägtes/aufgeblähtes Papier oder 3‑D‑gedruckte Formen); **Nemeth Braille Code** (Abraham Nemeth, erstmals dokumentiert 1952), ein Sechs‑Punkte‑System zur Linearisation mathematischer Notation mit vollständiger Symbolabdeckung für Dreiecke, Kreise, Parallelogramme und Relationen wie parallel/perpendikulär/Winkel [19]; und **strukturierte verbale Beschreibung** — eine feste Grammatik (Formtyp, dann Eckpunkte/Seiten, dann Winkel, stets gleiche Reihenfolge), die einem Screenreader‑Nutzer ermöglicht, ein mentales Modell ohne taktiles Gerät zu bauen. Für eine Web‑App ist der kurzfristige Weg die rigorose Erstellung von Text‑Alternativen nach fester Grammatik plus tastatur‑navigierbare, beschreibbare Formdaten — Canvas‑Pixel sind für einen Screenreader unsichtbar, unabhängig von der Qualität des Alt‑Textes an anderer Stelle.

### 9. Motorische Beeinträchtigung und Switch‑Zugriff

**2.5.2 Pointer Cancellation (A)** verlangt, dass eine Einzel‑Zeiger‑Aktivierung nicht beim initialen Down‑Event ausgelöst wird, es sei denn, eine Schutzmaßnahme greift (Abbruch/Rückgängig, Up‑Event‑Umkehr, oder ein essenzieller Down‑Event‑Trigger) [8] — schützt Nutzer mit Tremor vor versehentlicher Aktivierung in einer Schnell‑Tap‑Oberfläche. Vollständiger Switch‑Zugriff erfordert zusätzlich sequenzielle Tastatur‑/Switch‑Erreichbarkeit mit sichtbarem Fokus (2.4.7/2.4.11) und keine Interaktion, die ein Ziehen, Pinchen oder präzise zeitlich abgestimmtes Doppel‑Tap ohne Alternative für einen Einzel‑Switch erfordert.

### 10. Farbenblindheit in einem farbkodierten Spiel

Rot‑Grün-Defizite (Protanopie, Deuteranopie) sind am häufigsten; Tritanopie (Blau‑Gelb) ist seltener; Achromatopsie (total, Graustufen) betrifft eine sehr kleine Minderheit [20]. Grundregel, konsistent mit 1.4.1 [14]: Nie allein durch Farbe korrekt/falsch, Schwierigkeitsgrad oder Kategorie signalisieren – jede Farbangabe mit Form, Symbol oder Text kombinieren und die Palette in einer Graustufensimulation prüfen, nicht nur gegenüber einem „typischen“ Betrachter [20].

### 11. Untertitel und Audio‑Alternativen

Gesprochene Zahlen‑Eingabeaufforderungen, Tutorial‑Video und feierliche Audios benötigen synchronisierte Untertitel/Text‑Entsprechungen und einen stumm‑Schalter (der häufigste Anwendungsfall in Schulen und öffentlichen Einrichtungen) – Standard-WCAG 1.2.x-Gebiet, im Vergleich zu den oben genannten schwierigeren Problemen relativ geringes Risiko.

### 12. Die rechtliche Ebene

**EU European Accessibility Act (Directive 2019/882).** Verbindliche Einhaltung ab **28. Juni 2025**: „alle relevanten Produkte und Dienstleistungen, die auf dem EU‑Markt bereitgestellt werden, müssen nun den Barrierefreiheitsanforderungen entsprechen“ [7]. Der Anwendungsbereich schließt ausdrücklich persönliche Computergeräte, E‑Books und **E‑Commerce‑Dienste** [7] ein. Mikro‑Unternehmen (<10 Mitarbeiter, <€2 M Umsatz) sind ausgenommen [7]; die Konformität wird selbstzertifiziert, mit Strafen, die je nach Mitgliedstaat stark variieren [7]. **Wenn Math Challenge EU‑Abonnements verkauft, ist es plausibel als E‑Commerce‑Dienst im Anwendungsbereich** – die hier vorrangigste Rechtsfrage.

**EN 301 549.** Der harmonisierte EU‑ICT‑Barrierefreiheitsstandard; v3.2.1 „enthält den vollständigen Text von WCAG 2.1“ [9] und ist die technische Referenz sowohl für die Web Accessibility Directive als auch für die EAA, erweitert über Websites hinaus auf mobile Apps und Telekom‑Dienste; Kanada hat ihn formell 2024 übernommen [9].

**US ADA Title II (2024) / Section 508.** Verlangt von staatlichen/kommunalen Behörden – einschließlich öffentlicher Schulbezirke – die Einhaltung von **WCAG 2.1 AA** für Web‑/App‑Inhalte, Fristen **26. April 2027** (Einwohnerzahl ≥50.000) / **2028** (kleiner), mit fünf engen Inhaltsausnahmen [6]. Section 508 bindet zusätzlich die Beschaffung durch Bundesbehörden [21]. Math Challenge ist nicht direkt betroffen, aber Schulbezirks‑Käufer werden wahrscheinlich eine WCAG 2.1 AA‑Konformitätserklärung (VPAT) verlangen; die Umsetzung von WCAG 2.2 AA erfüllt beide Regime mit Spielraum.

## Konformitäts‑Checkliste – WCAG 2.2 AA‑Kriterien mit höchstem Risiko hier

| SC | Level | Risiko in Math Challenge | Design‑Regel |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Antwort‑Chips/Zahlentasten für Desktop dimensioniert | Alle Ziele ≥24×24 CSS‑px; ≥44×44 px für UI unter 8 Jahren |
| 2.5.7 Dragging Movements | AA | Ziehen‑zur‑Zahlenlinie, Ziehen‑zum‑Sortieren | Tippen‑zum‑Auswählen + Tippen‑zum‑Platzieren‑Alternative für jedes Ziehen |
| 2.5.1 Pointer Gestures | A | Jede Pinch‑/Swipe‑zu‑Antwort | Einzel‑Pointer‑Alternative; keine ist per Design essentiell |
| 2.5.2 Pointer Cancellation | A | Schnelles‑Tippen‑Punktesystem, das beim Touch‑Down auslöst | Aktivierung beim Up‑Event/Loslassen, Abbruch durch Wegziehen |
| 2.2.1 Timing Adjustable | A | Standardmodus mit Zeitwertung | Siehe „Timing‑Konflikt“ – untimierter Modus ist der Konformitätspfad |
| 1.4.10 Reflow | AA | Geometrie‑Canvas, Koordinatengitter | Alle Oberflächen bei 320 px neu fließen lassen; nur die Figur könnte ein 2D‑Layout benötigen |
| 1.4.1 Use of Color | A | Kodierung von korrekt/falsch, Stufe, Kategorie | Jede Farbangabe trägt zusätzlich ein Symbol/Form/Text |
| 1.4.3 / 1.4.11 Contrast | AA | Helle, verspielte Kinderpaletten | 4,5:1 Text, 3:1 UI/Grafiken, geprüft gegen die tatsächliche Palette |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Benutzerdefinierte Spielkomponenten, kein nativer Fokusstil | Sichtbarer, nicht verdeckter Fokusindikator überall |
| 3.3.8 Accessible Authentication | AA | „Lösen zum Entsperren“-Profilschranken | Kein kognitiver Funktionstest als alleiniges Authentifizierungsverfahren |

## Der Timing‑Konflikt – gelöst

**2.2.1 Timing Adjustable (Level A)** gilt immer, wenn „ein Zeitlimit … vom Inhalt festgelegt wird“ [2] – eine zeitbewertete Runde qualifiziert sich eindeutig. Die beiden Ausnahmen, die es vollständig abdecken könnten, sind eng:

> "Echtzeit‑Ausnahme: Das Zeitlimit ist ein erforderlicher Teil eines Echtzeit‑Ereignisses (z. B. einer Auktion), und es ist keine Alternative zum Zeitlimit möglich." [2]

> "Essenzielle Ausnahme: Das Zeitlimit ist wesentlich und eine Verlängerung würde die Aktivität ungültig machen." [2]

Keine der beiden sollte das alleinige Konformitätsargument für die Standard‑Erfahrung sein, da eine vernünftige Alternative eindeutig existiert (ein untimierter Modus, der dieselbe Mathematik lehrt). Die essenzielle Ausnahme ist nur für einen separaten, klar gekennzeichneten **„Speed Challenge“**‑Modus vertretbar, bei dem die Zeitmessung tatsächlich *die* zu messende Aktivität ist.

**Lösung:**
1. Der **Standard‑Lernmodus** ist untimiert oder standardkonform (Ausschalten / Anpassen ≥10× / Verlängern mit Warnung) [2].
2. Ein separater, optionaler **Speed‑Challenge‑Modus** behält feste Zeitlimits bei und beruft sich ehrlich auf die essenzielle Ausnahme.
3. Der Fortschritt (Serien, Freischaltungen) im Standardmodus wird durch Genauigkeit/Abschluss, nicht durch Latenz, gesteuert; Geschwindigkeit ist ein Bonus‑Statistikwert, der nur im Speed‑Challenge‑Modus angezeigt wird.
4. Dies entspricht zudem der Literatur zur Mathe‑Angst (Thema 10 dieser Serie): Die Uhr ist der dokumentierte Verstärker von angstbedingten Leistungsabfällen, sodass das Entfernen aus dem Standardpfad evidenzbasiert und nicht nur ein Konformitäts‑Workaround ist.

## Designimplikationen

1. Alle mathematischen Notationen als MathML oder barrierefreie ARIA‑Markups über eine MathJax‑Klassen‑Barrierefreiheits‑Schicht rendern – niemals Canvas‑/Bild‑nur‑Glyphen [3][11].
2. Standard‑Spielmodus untimiert oder timer‑anpassbar; feste Zeitlimits auf einen optionalen „Speed Challenge“‑Modus beschränken, der die essenzielle Ausnahme ehrlich nutzt [2].
3. Alle interaktiven Ziele ≥24×24 CSS‑px, ≥44×44 px für UI unter 8 Jahren [1].
4. Jede Drag‑Interaktion bietet eine Tippen‑Auswahl/Tippen‑Platz‑Alternative; Drag ist eine Ergänzung, niemals der einzige Weg [10].
5. Nie allein Farbe für korrekt/falsch, Schwierigkeitsgrad oder Kategorie kodieren; mit Symbol/Form/Text kombinieren und gegen Protanopie/Deuteranopie/Tritanopie/Achromatopsie‑Simulationen prüfen [14][20].
6. Ein dauerhaftes „Bewegung/Audio reduzieren“‑Steuerelement ausliefern, das standardmäßig `prefers-reduced-motion` nutzt, über die AAA‑nur‑2.3.3‑Anforderung hinaus, weil die bediente Zielgruppe real ist, unabhängig vom AA‑Status [17][18].
7. Einen eigenen **Dyskalkulie‑/Zahl‑Sinn‑Modus** entwickeln: Präsentation mit Zahlenlinie zuerst, konkrete manipulative Visualisierungen, adaptive Steigerung basierend auf Number Race/Calcularis statt einer generischen Elo‑Kurve; in den Einstellungen auffindbar, nicht hinter einer Diagnose (es gibt keinen Konsens) [4].
8. Kein „Dyslexie‑Font“ entwickeln/lizenzieren; in Zeilenabstand, kürzere Anleitungszeilen, Links‑Ausrichtung, gut lesbare Standard‑Sans‑Serif‑Schrift investieren [5].
9. Jede geometrische Figur erhält eine fest‑grammatische, strukturierte Textbeschreibung (Form, dann Eckpunkte/Seiten, dann Winkel) plus tastatur‑navigierbare/beschreibbare Formdaten, nicht nur Canvas‑Rendering [19].
10. Einen low‑Stimulus‑„Fokus‑Modus“ für ADHS/Aufmerksamkeit hinzufügen: Ein‑Aufgabe‑Bildschirme, keine konkurrierenden Animationen/Audios während des Problems, vorhersehbare Struktur, verzögerte Feier‑Effekte – abgestimmt an COGA's Enough Time/Navigable/Predictable [16].
11. Vollständige Schalter‑/Tastatur‑Bedienbarkeit: sequentielle Fokusreihenfolge, sichtbarer, nicht verdeckter Fokusindikator, keine Interaktion, die Multi‑Touch oder präzise getimtes Tippen ohne Einzel‑Pointer‑Alternative erfordert [8].
12. Untertitel/Text‑Entsprechung für jede gesprochene Eingabeaufforderung und jedes Anleitungsvideo; den gesamten Problemlösungs‑Loop standardmäßig stumm abschließbar machen.
13. Den EU‑EAA bereits als verbindlich behandeln (Konformitätsdatum nach dem 28. Juni 2025), wenn an EU‑Verbraucher verkauft wird; jetzt eine VPAT‑ähnliche Selbstbewertung gegen EN 301 549 beauftragen [7][9].
14. Intern WCAG 2.2 AA anstreben, ein striktes Superset, das die WCAG 2.1 AA‑Schwelle, die US‑Schulbezirke in der Beschaffung verlangen, bereits erfüllt [6].

## Offene Fragen für den Projektinhaber

1. Verkauft Math Challenge heute physisch an Verbraucher in der EU oder innerhalb von 12 Monaten? Bestimmt, ob die EAA‑Konformität (seit dem 28. Juni 2025 fällig) bereits aktiv oder zukunftsgerichtet ist [7].
2. Ist die öffentliche Bestenliste ein dauerhaftes Kernfeature oder lässt sie sich als optionaler Speed‑Challenge‑Modus umrahmen, wobei die Standard‑Uhr optional bleibt?
3. Ist die Einführung in US‑Schulbezirken ein tatsächlicher Go‑to‑Market‑Kanal? Wenn ja, wird ein WCAG 2.1 AA‑VPAT zu einem Vertriebs‑Asset, nicht nur zur Konformität [6].
4. Sollte Geometrie‑Inhalt nur auf strukturierte Texte/tastatur‑navigierbare Formen beschränkt werden, oder benötigt die ältere Zielgruppe wirklich interaktive Canvas/SVG‑Geometrie (was einen größeren Barrierefreiheits‑Aufwand erfordert)?
5. Budget/Interesse an einer MathJax‑Klassen‑Barrierefreiheits‑Rendering‑Schicht (SRE‑basiertes Vorlesen) gegenüber einem leichteren Renderer wie reinem KaTeX mit schwächerer integrierter Tool‑Unterstützung?
6. Den Reduce‑Motion/‑Sound‑Schalter beim Start ausliefern oder auf einen nachträglichen Barrierefreiheits‑Durchlauf verschieben, da er günstig, AAA‑nur und schützend für autistische/vestibuläre Nutzer ist [17][18]?

## Quellen

1. W3C, WCAG 2.2, SC 2.5.8 Zielgröße (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum  
2. W3C, WCAG 2.2, SC 2.2.1 Zeit einstellbar — https://www.w3.org/TR/WCAG22/#timing-adjustable  
3. W3C, MathML Core (Entwurf einer Kandidatenempfehlung, 24. Juni 2025) — https://www.w3.org/TR/mathml-core/  
4. Wikipedia, "Dyscalculia" — https://en.wikipedia.org/wiki/Dyscalculia  
5. Wikipedia, "OpenDyslexic" — https://en.wikipedia.org/wiki/OpenDyslexic  
6. ADA.gov, "2024 Title II Regel für Barrierefreiheit von Web‑ und Mobilanwendungen" — https://www.ada.gov/resources/2024-03-08-web-rule/  
7. Wikipedia, "European Accessibility Act" — https://en.wikipedia.org/wiki/European_Accessibility_Act  
8. W3C, WCAG 2.2, SC 2.5.1 Zeigergesten / 2.5.2 Zeigercancelierung / 2.5.4 Bewegungsaktivierung — https://www.w3.org/TR/WCAG22/#pointer-gestures  
9. Wikipedia, "EN 301 549" — https://en.wikipedia.org/wiki/EN_301_549  
10. W3C, WCAG 2.2, SC 2.5.7 Ziehbewegungen — https://www.w3.org/TR/WCAG22/#dragging-movements  
11. MathJax Project, Übersicht über Barrierefreiheitsfunktionen — https://www.mathjax.org/#accessibility  
12. Wikipedia, "MathML" (Unterstützung für Screenreader) — https://en.wikipedia.org/wiki/MathML  
13. W3C, WCAG 2.2, SC 1.4.10 Umbruch — https://www.w3.org/TR/WCAG22/#reflow  
14. W3C, WCAG 2.2, SC 1.4.1 Farbgebrauch — https://www.w3.org/TR/WCAG22/#use-of-color  
15. Wikipedia, "MathML" (Geschichte der Chromium-Implementierung) — https://en.wikipedia.org/wiki/MathML  
16. W3C WAI, Übersicht über kognitive Barrierefreiheit — https://www.w3.org/WAI/cognitive/  
17. MDN Web Docs, "prefers-reduced-motion" — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
18. W3C, WCAG 2.2, SC 2.3.3 Animation aus Interaktionen — https://www.w3.org/TR/WCAG22/#animation-from-interactions  
19. Wikipedia, "Nemeth Braille" — https://en.wikipedia.org/wiki/Nemeth_Braille  
20. WebAIM, "Visuelle Behinderungen: Farbenblindheit" — https://webaim.org/articles/visual/colorblind  
21. Section508.gov, "Gesetze und Richtlinien" — https://www.section508.gov/manage/laws-and-policies/  
22. W3C, WCAG 2.2 Schnellreferenz (neue Erfolgskriterien in 2,2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
