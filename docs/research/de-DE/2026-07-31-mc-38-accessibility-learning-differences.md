# Accessibility and learning differences in a global, all-ages math game

> Math Challenge research — 2026-07-31 — topic 38

## Zusammenfassung (ES)

- WCAG 2.2 fügt Anforderungen hinzu, die ein taktiles, zeitgesteuertes und altersübergreifendes Spiel voll treffen: **2.5.8 Target Size (Minimum, AA)** verlangt Zielbereiche von ≥24 × 24 CSS‑px [1]; **2.5.7 Dragging Movements (AA)** verlangt eine nicht‑zieh‑Alternative [10]; **2.5.1 Pointer Gestures (A)** verlangt eine Ein‑Pointer‑Alternative für Mehrpunkt‑Gesten [8].
- Der zentrale Konflikt – Punktzahl nach Geschwindigkeit vs. **2.2.1 Timing Adjustable (A)** – wird folgendermaßen gelöst: die „Essential Exception“ deckt nur ein Zeitlimit ab, bei dem „eine Verlängerung die Aktivität ungültig machen würde“ [2]. Das rechtfertigt einen optionalen „Speed Challenge“-Modus, nicht den Standardmodus, weil eine vernünftige Alternative (ein Modus ohne Uhr) existiert.
- MathML Core ist ein Candidate Recommendation Snapshot vom 24. Juni 2025 [3]; sein eigener Text besagt, dass `alttext` „kein beobachtbares Verhalten definiert“ – die barrierefreie Semantik von Formeln hängt von MathJax + Speech Rule Engine ab, nicht vom Kernstandard [3][11].
- Dyskalkulie: 3–6% der Bevölkerung [4], ohne konsensiertes Diagnosekriterium; beste Interventionen: konkrete Manipulative, computerisierte Zahlenstrahl‑Übungen (*The Number Race*, *Graphogame-math*) und adaptive Lernsoftware (*Calcularis*, *Meister Cody*) [4].
- Belege für dyslexiespezifische Schriftarten (OpenDyslexic, Dyslexie) sind schwach bis negativ: Rello & Baeza‑Yates (2013) fanden keine Verbesserung der Lesegeschwindigkeit; eine Studie von 2016 zeigte eine Präferenz für Arial gegenüber „Dyslexie‑Schriften“; eine von 2023 ergab ästhetische Vorliebe, aber keinen Unterschied in den Ergebnissen [5].
- Das Europäische Barrierefreiheitsgesetz verlangt Konformität seit dem **28. Juni 2025**, einschließlich ausdrücklich E‑Commerce [7]; EN 301 549 (das die vollständige WCAG 2.1 einbindet) ist seine technische Referenz [9]. Die US‑ADA‑Regelung Titel II verlangt WCAG 2.1 AA für staatliche/kommunale Behörden – einschließlich öffentlicher Schulen – bis 2027/2028 [6].

## Zusammenfassung (EN)

Math Challenge kombiniert ein nach Geschwindigkeit bewertetes Gameplay, symbolische mathematische Darstellung, Altersgruppen von 4 Jahren bis Erwachsenen, fünf Sprachen und Eingaben über Telefon/Tablet/Desktop – eine komplexere Barrierefreiheitslage als die meisten ein‑Ziel‑Apps. WCAG 2.2 fügt Kriterien hinzu, die direkt greifen: **2.5.8 Target Size (Minimum, AA)** verlangt Zielbereiche von ≥24 × 24 CSS‑px, mit vier engen Ausnahmen [1]; **2.5.7 Dragging Movements (AA)** verlangt eine nicht‑zieh‑Alternative für jede Zieh‑Mechanik [10]. Der tragende Konflikt ist **2.2.1 Timing Adjustable (A)** versus Geschwindigkeits‑Punktzahl; seine **Essential Exception** – „the time limit is essential and extending it would invalidate the activity“ [2] – ist eng gefasst und deckt standardmäßig keinen gamifizierten Drill ab; die Lösung ist architektonisch (ein separater untimed‑Modus plus ein optionaler timed‑Modus), unten detailliert.

MathML Core ist ein W3C Candidate Recommendation Snapshot (24. Juni 2025), dessen eigener Text besagt, dass das Attribut `alttext` kein definiertes beobachtbares Verhalten hat [3] – MathML Core standardisiert die Darstellung, nicht die barrierefreie Semantik, die stattdessen aus den Barrierefreiheits‑Erweiterungen von MathJax, aufgebaut auf der Speech Rule Engine [11], sowie Screen‑Readern mit Mathematik‑Unterstützung (JAWS 16+, VoiceOver) [12] stammt. Dyskalkulie betrifft 3–6% der Menschen [4], hat kein konsensiertes Diagnosekriterium, und die am besten belegten Interventionen – konkrete Manipulative, computerisiertes Zahlenstrahl‑Training, adaptive Übungen – liegen nahe an dem, was Math Challenge bereits bietet [4]. Evidenz für dyslexiespezifische Schriftarten ist schwach bis negativ; die British Dyslexia Association empfiehlt stattdessen gewöhnliche serifenlose Schriften [5]. Rechtlich gilt der EU European Accessibility Act seit dem 28. Juni 2025 für Verbraucherprodukte/Dienstleistungen einschließlich E‑Commerce [7]; EN 301 549 (die vollständige WCAG 2.1 einbettend) ist sein technisches Rückgrat [9], und die US‑ADA‑Regelung Title II von 2024 verlangt WCAG 2.1 AA für staatliche/kommunale Websites und Apps – einschließlich öffentlicher Schulen – bis 2027/2028 [6], was im Beschaffungsprozess von Schulbezirken sichtbar wird, obwohl es Math Challenge nicht direkt bindet.

## Ergebnisse

### 1. WCAG 2.2: die neuen Kriterien, die hier am stärksten treffen

WCAG 2.2 (Oktober 2023) fügte neun Erfolgskriterien zu 2.1 hinzu. Am relevantesten für ein Touch‑first, zieh‑fähiges, zeitgesteuertes Mathematik‑Spiel:

- **2.5.8 Zielgröße (Minimum) — AA.** „Das Ziel für Zeigereingaben muss mindestens 24 × 24 CSS‑Pixel groß sein, außer wenn: Equivalent… Inline… User Agent Control… Essential.“ [1] Eine Untergrenze, keine Obergrenze — die UI für Kinder unter 8 Jahren sollte deutlich darüber liegen.
- **2.5.7 Ziehbewegungen — AA (neu).** „Funktionen, die durch Ziehbewegungen bedient werden können, müssen auch mit einzelnen Zeigeraktivierungen ohne Ziehen bedienbar sein, es sei denn, das Ziehen ist essenziell.“ [10] Jede „Ziehen‑auf‑die‑Zahlenlinie“-Mechanik benötigt ein Äquivalent, das per Tippen platziert werden kann.
- **2.5.1 Zeigergesten — A.** „Alle Funktionen, die Mehrpunkt‑ oder Pfad‑Gesten für die Bedienung nutzen, müssen mit einem einzelnen Zeiger ohne Pfad‑Gesten bedienbar sein, es sei denn, sie sind essenziell.“ [8]
- **2.5.4 Bewegungsaktivierung — A.** Eingaben per Gerätebewegung müssen ebenfalls über UI‑Komponenten bedienbar sein, wobei die Bewegungsreaktion deaktivierbar sein muss [8] — relevant, falls „Neigen zum Antworten“ jemals in Betracht gezogen wird.
- **1.4.10 Neufluss — AA.** „Inhalte können dargestellt werden, ohne Informations‑ oder Funktionsverlust und ohne zweidimensionales Scrollen zu erfordern, für: vertikal scrollende Inhalte bei einer Breite von 320 CSS‑Pixeln… Ausgenommen sind Teile des Inhalts, die für die Nutzung oder Bedeutung ein zweidimensionales Layout erfordern.“ [13] Ein Geometrie‑Canvas kann plausibel die Ausnahme beanspruchen; das umgebende Chrome (Buttons, Punktestand, Anweisungen) nicht.
- **1.4.1 Farbgebrauch — A.** „Farbe wird nicht als einziges visuelles Mittel zur Vermittlung von Informationen, zur Anzeige einer Aktion, zur Aufforderung einer Reaktion oder zur Unterscheidung eines visuellen Elements verwendet.“ [14] Direkt relevant bei farbkodiertem korrekt/inkorrekt‑Feedback oder Schwierigkeitsstufen.
- Andere Ergänzungen in 2.2 (Focus Not Obscured, Focus Appearance, Consistent Help, Redundant Entry, Accessible Authentication) sind wichtiger für die Konto‑/Portal‑Ebene; **3.3.8 Accessible Authentication** ist zu kennzeichnen, falls irgendein Profil‑Gate jemals ein Puzzle‑/CAPTCHA‑ähnliches kognitives Testverfahren als alleiniges Verfahren nutzt.

### 2. Der Zeitkonflikt, präzise formuliert

Ein rundenbasiertes, geschwindigkeitsbasiertes Scoring legt „ein Zeitlimit … durch den Inhalt fest“ — die Auslösebedingung für **2.2.1 Timing Adjustable (A)**, die nur erfüllt ist, wenn der Nutzer das Limit ausschalten, es um ≥10 × den Standardwert anpassen, es mit Warnung verlängern kann oder es unter die **Echtzeit‑Ausnahme** („ein erforderlicher Teil eines Echtzeit‑Ereignisses … und keine Alternative zum Zeitlimit möglich ist“) bzw. die **Essentielle Ausnahme** („essentiell und eine Verlängerung würde die Aktivität ungültig machen“) fällt [2]. Eine 20‑Stunden‑Ausnahme und ein Hinweis, der dieses Erfolgskriterium mit 3.2.1 (Predictable) verknüpft, existieren ebenfalls [2]. Vollständige Auflösung folgt unten.

### 3. Barrierefreie Mathematik: MathML Core, MathJax, Screenreader

MathML Core ist ein **Candidate Recommendation Snapshot (24. Juni 2025)**, „nicht zu erwarten, dass es vor dem 30. September 2025 zur Proposed Recommendation aufsteigt“ [3] — ein bewusst reduzierter, im Browser testbarer Teilbereich von MathML 3. Im eigenen Text heißt zum `alttext`‑Attribut: „definiert kein beobachtbares Verhalten, das spezifisch für das alttext‑Attribut ist“ [3] — die Spezifikation standardisiert das Rendering, nicht die barrierefreie Semantik. Firefox und Safari unterstützen MathML bereits seit Langem; Chromium fügte eine Implementierung „zu Beginn des Jahres 2023“ hinzu [15]. Screenreader: **JAWS unterstützt ab Version 16 MathML‑Sprachausgabe und Braille‑Ausgabe**; **VoiceOver liest MathML in Safari** [12]; NVDA‑Mathe‑Unterstützung existiert über Add‑Ons, wurde hier jedoch nicht aus einer primären Quelle bestätigt und sollte vor dem Launch verifiziert werden.

**MathJax** „bietet ein leistungsfähiges Set an Barrierefreikeits‑Erweiterungen, die Navigation, Exploration und Sprachausgabe auf der Client‑Seite ermöglichen“, einschließlich Expression Zoom und, für Offline/ePub, „alternativen Textbeschreibungen oder feinere Sprach‑Annotationen und Braille“ [11]. Darunter wandelt die **Speech Rule Engine (SRE)** MathML/LaTeX‑Strukturen in natürlichsprachliche Beschreibungen um („ein halb plus ein drittel“, nicht rohe Symbolnamen). **KaTeX** ist schneller, hat aber schwächere integrierte Barrierefreiheits‑Werkzeuge und benötigt in der Regel ein MathML‑Fallback jenseits dekorativer Anzeige‑Mathematik. Formeln als Bilder oder Canvas‑Glyphen — ein gängiger, kinderfreundlicher UI‑Kurzweg — liefern nichts für einen Screenreader; MathML plus eine Barrierefreiheits‑Schicht ist der einzige Weg, der Notation für blinde/sehbehinderte Nutzer jeden Alters verfügbar zu halten.

### 4. Dyskalkulie: Prävalenz, Identifikation, Interventionen

Dyskalkulie ist „eine Lernstörung, die zu Schwierigkeiten beim Erlernen oder Verstehen von Arithmetik führt“, die „keinen generellen Defizit kognitiver Fähigkeiten oder Schwierigkeiten mit Zeit, Messung und räumlichem Denken widerspiegelt“ [4]. Prävalenz: **3–6 %**, geschlechtsübergreifend vergleichbar [4]. **Kein konsensbasierter diagnostischer Kriterium** existiert; die Identifikation kombiniert Leistungstests, Arbeits‑/Exekutiv‑Funktion‑Beurteilungen, Lehrer‑Evaluation und (in der Forschung) fMRT‑Muster [4]. Am besten belegte Interventionen lassen sich in drei Familien einordnen: **konkrete Manipulative** (Fuchs‘ Nachhilfe‑Paradigma — Spiele, Lernkarten, Manipulierbares) [4]; **computerisiertes Zahlenlinien‑Training** (*The Number Race*, *Graphogame-math*) [4]; und **adaptive Software** (*Dybuster Calcularis*, *Meister Cody – Talasia*) [4]. Das entspricht mechanisch stark der eigenen Kategorie von Math Challenge — ein Zahlenlinien‑ und Rechen‑Übungs‑Spiel — und spricht für einen explizit dyskalkulie‑informierten Modus statt einer nachträglichen Ergänzung.

### 5. Dyslexie‑Typografie: Die Schriftarten sind der schwache Teil der Geschichte

Unstrittig und kostengünstig: größere Schrift, großzügiger Zeilenabstand, kürzere Zeilen, linksbündig, keine Kursiv‑/Versalien‑Schrift im Fließtext, solider, aber nicht extremer Kontrast. Was **nicht** standhält, ist die Behauptung, dass Dyslexie eine spezielle Schriftart benötige. OpenDyslexic (Abbie Gonzalez, 2011) ist das bekannteste Beispiel [5]. Evidenz: **Rello & Baeza‑Yates (2013)** fanden, dass sie „die Lesegeschwindigkeit nicht signifikant verbesserte noch die Blickfixierung verkürzte“ [5]; eine **2010‑Dissertation** ergab, dass Dyslexie „nicht zu schnellerem Lesen“ im Vergleich zu Arial führte [5]; eine **2016‑Studie** zeigte, dass dyslexische Leser **Arial** Dyslexie‑spezifischen Schriften vorzogen [5]; eine **2023‑Studie** fand ästhetische Vorliebe für OpenDyslexic (58 %), aber „keinen Unterschied in den Testergebnissen je nach verwendeter Schriftart“ [5]. Die British Dyslexia Association empfiehlt stattdessen gewöhnliche serifenlose Schriften [5]. **Fazit:** Entwickeln oder lizenzieren Sie keine „Dyslexie‑Schrift“; investieren Sie stattdessen in Zeilenabstand, Zeilenlänge und konsistente Ikonografie.

### 6. ADHS und Aufmerksamkeit in einer gamifizierten Lern‑App

Die Arbeit von W3C zur kognitiven Barrierefreiheit (COGA) ordnet sich drei WCAG‑Leitlinien‑Überschriften zu: **2.2 Enough Time**, **2.4 Navigable**, **3.2 Predictable** [16], mit tiefergehenden Mustern im Hinweis „Making Content Usable“. Produktseitig bedeutet das: vorhersehbare Sitzungsstruktur, minimale konkurrierende visuelle/audio‑Stimuli während des aktiven Problemlösens, Bildschirme mit einzelner Fokus‑Komponente und standardmäßig anpassbare oder vermeidbare Zeitlimits. Variable‑Belohnungs‑ und Sozial‑Vergleichs‑Mechaniken — gängige ADHS‑Bindungs‑Hooks in kommerzieller Gamifizierung — bringen dokumentierte Stress‑/Aufmerksamkeits‑Kosten neben dem Engagement‑Nutzen (siehe Thema 10 dieser Serie) und sollten als Kompromiss, nicht als kostenloser Gewinn, behandelt werden.

### 7. Autismus und sensorisches Design: Bewegung, Klang, Vorhersagbarkeit

`prefers-reduced-motion` hat **seit Januar 2020 den Baseline‑Status weit verbreitet** [17] und ermöglicht einer App, eine OS‑seitige Präferenz zu berücksichtigen. Die dokumentierte Begründung sind **vestibuläre Bewegungsstörungen** — Skalierungs‑/Schwenk‑Animationen, die Schwindel oder Desorientierung hervorrufen [17]; die Erweiterung auf Autismus/ sensorische Empfindlichkeit ist gut etablierte Praxis, wenn auch nicht die hier zitierte spezifische Behauptung. WCAGs **2.3.3 Animation from Interactions (AAA)** verlangt, dass „Bewegungsanimationen, die durch Interaktion ausgelöst werden, deaktivierbar sind, es sei denn, die Animation ist essenziell“ [18] — AAA, nicht zwingend bei AA, aber kostengünstig und direkt schützend. Klang verdient die gleiche Behandlung: ein beständiger, auffindbarer Schalter „Bewegung reduzieren / Klang reduzieren“, der standardmäßig dem OS‑Signal folgt.

### 8. Sehbehinderung und das Geometrie‑Problem

Geometrie ist das schwierigste Teilgebiet für blinde/sehbehinderte Nutzer, da ihr Inhalt inhärent räumlich ist. Der Standard‑Werkzeugkasten: **taktil‑grafische Darstellungen** (geprägtes/aufgeblähtes Papier oder 3‑D‑gedruckte Formen); **Nemeth‑Braille‑Code** (Abraham Nemeth, erstmals dokumentiert 1952), ein Sechs‑Punkte‑System zur Linearisation mathematischer Notation mit vollständiger Symbolabdeckung für Dreiecke, Kreise, Parallelogramme und Relationen wie parallel/orthogonal/Winkel [19]; und **strukturierte verbale Beschreibung** — eine feste Grammatik (Formtyp, dann Eckpunkte/Seiten, dann Winkel, stets in derselben Reihenfolge), die einem Screenreader‑Nutzer ermöglicht, ein mentales Modell ohne taktiles Gerät zu bauen. Für eine Web‑App ist der kurzfristige Weg die rigorose Erstellung von Text‑Alternativen nach fester Grammatik plus tastatur‑navigierbare, beschreibbare Formdaten — Canvas‑Pixel sind für einen Screenreader unsichtbar, unabhängig von der Qualität des Alt‑Textes an anderer Stelle.

### 9. Motorische Beeinträchtigung und Schalter‑Zugang

**2.5.2 Pointer Cancellation (A)** verlangt, dass eine Einzel‑Zeiger‑Aktivierung nicht beim ersten „down“-Ereignis ausgelöst wird, es sei denn, eine Schutzmaßnahme greift (Abbruch/Rückgängig, „up“-Ereignis‑Umkehr oder ein essenzieller „down“-Trigger) [8] — schützt Nutzer mit Tremor vor unbeabsichtigter Aktivierung in einer Schnell‑Tip‑Oberfläche. Vollständiger Schalter‑Zugang erfordert zusätzlich eine sequenzielle Tastatur‑/Schalter‑Erreichbarkeit mit sichtbarem Fokus (2.4.7/2.4.11) und keinerlei Interaktion, die ein Ziehen, Kneifen oder präzise zeitlich abgestimmtes Doppeltippen ohne Alternative für einen Einzelschalter verlangt.

### 10. Farbenblindheit in einem farbkodierten Spiel

Rot‑Grün‑Defizite (Protanopie, Deuteranopie) sind am häufigsten; Tritanopie (Blau‑Gelb) ist seltener; Achromatopsie (total, Graustufen) betrifft eine sehr kleine Minderheit [20]. Grundregel, konsistent mit 1.4.1 [14]: Nie allein durch Farbe korrekte/inkorrekte Antworten, Schwierigkeitsgrad oder Kategorie signalisieren — jede Farbanzeige mit Form, Symbol oder Text kombinieren und die Palette in einer Graustufensimulation prüfen, nicht nur gegenüber einem „typischen“ Betrachter [20].

### 11. Untertitel und Audio‑Alternativen

Gesprochene Zahlen‑Prompts, Tutorial‑Video und feierliche Audios benötigen synchronisierte Untertitel/Text‑Entsprechungen und einen stumm‑Schalter (der häufigste Anwendungsfall in Schulen und öffentlichen Einrichtungen) — Standard‑WCAG 1.2.x‑Gebiet, vergleichsweise geringes Risiko im Vergleich zu den oben genannten schwierigeren Problemen.

### 12. Die rechtliche Ebene

**EU European Accessibility Act (Richtlinie 2019/882).** Verbindliche Konformität ab dem **28. Juni 2025**: „Alle relevanten Produkte und Dienstleistungen, die auf dem EU‑Markt bereitgestellt werden, müssen nun den Barrierefreiheitsanforderungen entsprechen“ [7]. Der Geltungsbereich schließt ausdrücklich persönliche Computergeräte, E‑Books und **E‑Commerce‑Dienste** [7] ein. Mikro‑Unternehmen (<10 Mitarbeiter, <€2 Mio. Umsatz) sind ausgenommen [7]; die Konformität wird selbstzertifiziert, mit Strafen, die je nach Mitgliedstaat stark variieren [7]. **Wenn Math Challenge EU‑Abonnements verkauft, fällt es plausibel in den Geltungsbereich als E‑Commerce‑Dienst** — die hier prioritärste Rechtsfrage.

**EN 301 549.** Der harmonisierte EU‑ICT‑Barrierefreiheitsstandard; v3.2.1 „enthält den vollständigen Text von WCAG 2.1“ [9] und ist die technische Referenz sowohl für die Web‑Accessibility‑Richtlinie als auch für den EAA, erweitert über Websites hinaus auf mobile Apps und Telekom‑Dienste; Kanada hat ihn formell 2024 übernommen [9].

**US ADA Title II (2024) / Section 508.** Verlangt von staatlichen/kommunalen Behörden — einschließlich öffentlicher Schulbezirke — die Einhaltung von **WCAG 2.1 AA** für Web‑/App‑Inhalte, Fristen **26. April 2027** (Einwohnerzahl ≥50 000) / **2028** (kleiner), mit fünf engen Inhaltsausnahmen [6]. Section 508 bindet zudem die Beschaffung durch Bundesbehörden [21]. Math Challenge ist nicht direkt betroffen, aber Schulbezirk‑Käufer werden wahrscheinlich eine WCAG 2.1 AA‑Konformitätserklärung (VPAT) verlangen; die Umsetzung von WCAG 2.2 AA erfüllt beide Regime mit Spielraum.

## Konformitäts‑Checkliste — WCAG 2.2 AA‑Kriterien mit höchstem Risiko hier

| SC | Stufe | Risiko in Math Challenge | Gestaltungsregel |
|---|---|---|---|
| 2.5.8 Target Size (Minimum) | AA | Antwort‑Chips/Zahlentasten für Desktop dimensioniert | Alle Ziele ≥24×24 CSS px; ≥44×44 px für UI unter 8 Jahren |
| 2.5.7 Dragging Movements | AA | Ziehen‑zu‑Zahlenlinie, Ziehen‑zum‑Sortieren | Tap‑to‑select + tap‑to‑place‑Alternative für jedes Ziehen |
| 2.5.1 Pointer Gestures | A | Jede Pinch‑/Swipe‑zu‑Antwort | Alternative mit Einzelzeiger; keine essentiell per Design |
| 2.5.2 Pointer Cancellation | A | Schnell‑Tap‑Bewertung bei Touch‑Down | Aktivierung bei Up‑Event/Release, Abbruch durch Wegziehen |
| 2.2.1 Timing Adjustable | A | Standardmodus mit Zeitwertung | Siehe „Zeitkonflikt“ — untimierter Modus ist der Konformitätsweg |
| 1.4.10 Reflow | AA | Geometrie‑Canvas, Koordinatengitter | Reflow aller UI‑Elemente bei 320 px; nur die Figur könnte 2D‑Layout benötigen |
| 1.4.1 Use of Color | A | Korrekt/inkorrekt, Stufe, Kategoriekodierung | Jede Farbanzeige trägt zusätzlich Icon/Form/Text |
| 1.4.3 / 1.4.11 Contrast | AA | Helle, verspielte Kinderpaletten | 4,5:1 Text, 3:1 UI/Grafiken, geprüft gegen die tatsächliche Palette |
| 2.4.7 / 2.4.11 Focus Visible/Not Obscured | AA | Benutzerdefinierte Spielkomponenten, kein nativer Fokusstil | Sichtbarer, nicht verdeckter Fokusindikator überall |
| 3.3.8 Accessible Authentication | AA | „Lösen zum Freischalten“-Profilschranken | Kein kognitiver Funktionstest als alleiniges Authentifizierungsverfahren |

## Der Zeitkonflikt — gelöst

**2.2.1 Timing Adjustable (Level A)** gilt, wann immer „ein Zeitlimit … vom Inhalt festgelegt wird“ [2] — eine rundenbasierte Zeitwertung qualifiziert eindeutig. Die beiden Ausnahmen, die es vollständig abdecken könnten, sind eng gefasst:

> „Real‑Time‑Exception: Das Zeitlimit ist ein erforderlicher Teil eines Echtzeit‑Ereignisses (z. B. einer Auktion) und es ist keine Alternative zum Zeitlimit möglich.“ [2]

> „Essential‑Exception: Das Zeitlimit ist wesentlich und eine Verlängerung würde die Aktivität ungültig machen.“ [2]

Keine sollte das alleinige Konformitätsargument für das Standard‑Erlebnis sein, da eine vernünftige Alternative eindeutig existiert (ein untimierter Modus, der dieselbe Mathematik lehrt). Die Essential‑Exception ist nur für einen separaten, klar gekennzeichneten **„Speed Challenge“**‑Modus vertretbar, bei dem das Timing tatsächlich *die* zu messende Aktivität ist.

**Resolution:**
1. Der **Standard‑Lernmodus** ist untimiert oder standardkonform (Ausschalten / Anpassen ≥10x / Mit Warnung verlängern) [2].
2. Ein separater, optionaler **Speed‑Challenge‑Modus** behält festes Timing bei und beruft sich ehrlich auf die Essential‑Exception.
3. Fortschritt (Serien, Freischaltungen) im Standardmodus wird durch Genauigkeit/Abschluss, nicht durch Latenz, bestimmt; Geschwindigkeit ist ein Bonus‑Statistik, die nur im Speed‑Challenge‑Modus angezeigt wird.
4. Das entspricht zudem der Literatur zur Mathe‑Angst (Thema 10 dieser Serie): Die Uhr ist der dokumentierte Verstärker von angstbedingten Leistungsabfällen, sodass das Entfernen aus dem Standardpfad evidenzbasiert und nicht nur ein Compliance‑Workaround ist.

## Design‑Implikationen

1. Alle mathematischen Notationen als MathML oder barrierefreies ARIA‑Markup über eine MathJax‑Klassen‑Barrierefreiheits‑Schicht rendern — niemals Canvas‑/Bild‑nur‑Glyphen [3][11].
2. Standard‑Spielmodus untimiert oder timer‑anpassbar; festes Timing auf einen optionalen „Speed Challenge“‑Modus beschränken, der die Essential‑Exception ehrlich nutzt [2].
3. Alle interaktiven Ziele ≥24×24 CSS px, ≥44×44 px für UI unter 8 Jahren [1].
4. Jede Drag‑Interaktion bietet eine Tap‑Select‑/Tap‑Place‑Alternative; Drag ist eine Ergänzung, niemals der einzige Weg [10].
5. Nie allein durch Farbe korrekte/inkorrekte Antworten, Schwierigkeitsgrad oder Kategorie kodieren; mit Icon/Form/Text kombinieren und gegen Protanopie/Deuteranopie/Tritanopie/Achromatopsie‑Simulationen prüfen [14][20].
6. Einen dauerhaften „reduce motion/sound“‑Schalter bereitstellen, der standardmäßig `prefers-reduced-motion` nutzt, über die AAA‑nur 2.3.3‑Anforderung hinaus, weil die bediente Zielgruppe real ist, unabhängig vom AA‑Status [17][18].
7. Einen eigenen **Dyskalkulie‑/Zahlensinn‑Modus** entwickeln: Präsentation zuerst als Zahlenlinie, konkrete manipulative Visualisierungen, adaptive Steigerung basierend auf Number Race/Calcularis statt einer generischen Elo‑Kurve; in den Einstellungen auffindbar, nicht hinter einer Diagnose (es gibt keinen Konsens) [4].
8. Keine „Dyslexie‑Schrift“ entwickeln/lizenzieren; in Zeilenabstand, kürzere Anleitungszeilen, Links‑Ausrichtung und gut lesbare Standard‑Sans‑Serif‑Schriften investieren [5].
9. Jede geometrische Figur erhält eine fest‑grammatische, strukturierte Textbeschreibung (Form, dann Eckpunkte/Seiten, dann Winkel) plus tastatur‑navigierbare/beschreibbare Formdaten, nicht nur Canvas‑Rendering [19].
10. Einen low‑Stimulus‑„Focus‑Modus“ für ADHS/Aufmerksamkeit hinzufügen: Ein‑Aufgabe‑Bildschirme, keine konkurrierende Animation/Audiowiedergabe während des Problems, vorhersehbare Struktur, verzögerte Feier‑Effekte — abgestimmt an COGA’s Enough Time/Navigable/Predictable [16].
11. Vollständige Schalter‑/Tastatur‑Bedienbarkeit: sequentielle Fokusreihenfolge, sichtbarer, nicht verdeckter Fokusindikator, keine Interaktion, die Multi‑Touch oder präzise getimten Tap ohne Einzelzeiger‑Alternative erfordert [8].
12. Untertitel/Text‑Entsprechungen für jede gesprochene Eingabeaufforderung und jedes Instruktions‑Clip bereitstellen; den gesamten Problemlösungs‑Loop standardmäßig stumm abschließbar machen.
13. Den EU‑EAA als bereits verbindlich betrachten (Konformitätsdatum nach dem 28. Juni 2025), wenn an EU‑Verbraucher verkauft wird; jetzt eine VPAT‑ähnliche Selbstbewertung gegen EN 301 549 beauftragen [7][9].
14. Intern WCAG 2.2 AA anstreben, ein striktes Superset, das die WCAG 2.1 AA‑Schwelle, die US‑Schulbezirke in der Beschaffung verlangen, bereits erfüllt [6].

## Offene Fragen für den Projektinhaber

1. Verkauft Math Challenge heute physisch an Verbraucher in der EU oder innerhalb von 12 Monaten? Das bestimmt, ob die EAA‑Konformität (seit dem 28. Juni 2025 fällig) bereits aktiv oder zukunftsgerichtet ist [7].
2. Ist die öffentliche Bestenliste ein dauerhaftes Kern‑Feature oder lässt sie sich als optionaler Speed‑Challenge‑Modus umgestalten, wobei die Standard‑Uhr optional bleibt?
3. Ist die Einführung in US‑Schulbezirken ein tatsächlicher Go‑to‑Market‑Kanal? Wenn ja, wird ein WCAG 2.1 AA‑VPAT zu einem Vertriebs‑Asset, nicht nur zu einer Compliance‑Maßnahme [6].
4. Soll der Geometrie‑Inhalt ausschließlich auf strukturierte Texte/tastatur‑navigierbare Formen beschränkt werden, oder benötigt die ältere Zielgruppe wirklich interaktive Canvas/SVG‑Geometrie (was einen größeren Barrierefreiheits‑Aufwand erfordert)?
5. Budget/Interesse an einer MathJax‑Klassen‑Barrierefreiheits‑Rendering‑Schicht (SRE‑basiertes Voicing) gegenüber einem leichteren Renderer wie reinem KaTeX mit schwächerer integrierter Tool‑Unterstützung?
6. Den Reduce‑Motion/Sound‑Schalter beim Start ausliefern oder auf einen nachträglichen Barrierefreiheits‑Durchlauf verschieben, da er kostengünstig, AAA‑nur und schützend für autistische/vestibuläre Nutzer ist [17][18]?

## Quellen

1. W3C, WCAG 2.2, SC 2.5.8 Zielgröße (Minimum) — https://www.w3.org/TR/WCAG22/#target-size-minimum  
2. W3C, WCAG 2.2, SC 2.2.1 Zeit einstellbar — https://www.w3.org/TR/WCAG22/#timing-adjustable  
3. W3C, MathML Core (Entwurf einer Kandidatenempfehlung, 24. Juni 2025) — https://www.w3.org/TR/mathml-core/  
4. Wikipedia, „Dyskalkulie“ — https://en.wikipedia.org/wiki/Dyscalculia  
5. Wikipedia, „OpenDyslexic“ — https://en.wikipedia.org/wiki/OpenDyslexic  
6. ADA.gov, „2024 Title II Web‑ und Mobile‑App‑Zugänglichkeitsregel“ — https://www.ada.gov/resources/2024-03-08-web-rule/  
7. Wikipedia, „European Accessibility Act“ — https://en.wikipedia.org/wiki/European_Accessibility_Act  
8. W3C, WCAG 2.2, SC 2.5.1 Pointer Gestures / 2.5.2 Pointer Cancellation / 2.5.4 Motion Actuation — https://www.w3.org/TR/WCAG22/#pointer-gestures  
9. Wikipedia, „EN 301 549“ — https://en.wikipedia.org/wiki/EN_301_549  
10. W3C, WCAG 2.2, SC 2.5.7 Ziehbewegungen — https://www.w3.org/TR/WCAG22/#dragging-movements  
11. MathJax Project, Übersicht der Barrierefreiheitsfunktionen — https://www.mathjax.org/#accessibility  
12. Wikipedia, „MathML“ (Unterstützung für Screenreader) — https://en.wikipedia.org/wiki/MathML  
13. W3C, WCAG 2.2, SC 1.4.10 Umbruch — https://www.w3.org/TR/WCAG22/#reflow  
14. W3C, WCAG 2.2, SC 1.4.1 Farbgebrauch — https://www.w3.org/TR/WCAG22/#use-of-color  
15. Wikipedia, „MathML“ (Chronik der Chromium‑Implementierung) — https://en.wikipedia.org/wiki/MathML  
16. W3C WAI, Übersicht kognitiver Barrierefreiheit — https://www.w3.org/WAI/cognitive/  
17. MDN Web Docs, „prefers-reduced-motion“ — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
18. W3C, WCAG 2.2, SC 2.3.3 Animation aus Interaktionen — https://www.w3.org/TR/WCAG22/#animation-from-interactions  
19. Wikipedia, „Nemeth‑Braille“ — https://en.wikipedia.org/wiki/Nemeth_Braille  
20. WebAIM, „Visuelle Behinderungen: Farbenblindheit“ — https://webaim.org/articles/visual/colorblind  
21. Section508.gov, „Gesetze und Richtlinien“ — https://www.section508.gov/manage/laws-and-policies/  
22. W3C, WCAG 2.2 Schnellreferenz (neue Erfolgskriterien in 2.2) — https://www.w3.org/WAI/WCAG22/quickref/?versions=2.2
