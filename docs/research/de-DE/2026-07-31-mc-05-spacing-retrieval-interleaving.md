# Spacing, Retrieval Practice, and Interleaving Applied to Mathematics

> Math Challenge research — 2026-07-31 — topic 05

## Zusammenfassung (ES)

- Die **interleavierte Praxis** (Mischen von Aufgabentypen anstatt sie blockweise zu gruppieren) verdoppelt die Leistung in Mathematiktests am nächsten Tag, obwohl die Leistung *während* der Praxis selbst schlechter ist [1][2].
- In einer realen 7.‑Klassen‑Klasse (n=140, neun Wochen, Überraschungstest zwei Wochen später) übertraf die interleavierte Praxis die blockweise Praxis, und die Lehrkräfte hielten sie für machbar ohne zusätzliches Material [2][3].
- Eine höhere Dosis an Interleaving führte zu höheren Punktzahlen sowohl nach zwei Tagen als auch nach einem Monat (n=126, 7. Klasse); der Nutzen hängt nicht davon ab, dass die Aufgaben „ähnlich“ zueinander sind [4][5].
- Die Bjork (UCLA) nennen dies „wünschenswerte Schwierigkeiten“: Bedingungen, die das scheinbare Lernen verlangsamen, aber die langfristige Behaltensleistung verbessern — Abstand, Interleaving, Abruf, Generierung und Variation [6][7].
- Der „Testeffekt“ (Roediger & Karpicke, 2006): Das Abrufen von Informationen aus dem Gedächtnis stärkt stärker als erneutes Lesen, und der Vorteil wächst, je länger die Verzögerung bis zum abschließenden Test ist [8].
- Das optimale Wiederholungsintervall ist nicht fest: Es hängt davon ab, wie lange die Erinnerung dauern soll. Für eine Woche liegt die optimale Lücke bei ~20‑40 % des Intervalls; für ein Jahr bei ~5‑10 % [9].
- Algorithmen für verteiltes Wiederholen in realer Software: Leitner (Kästen mit wachsenden Intervallen), SM‑2 (klassisches SuperMemo/Anki, Leichtigkeitsfaktor), FSRS (aktuelles Anki‑Standard‑Modell, modelliert Stabilität/Schwierigkeit/Abrufbarkeit pro Karte) und die Halbwertszeit‑Regression von Duolingo (p = 2^(-Δt/h), steigerte das tägliche Engagement um 12 %) [10][11].
- Das „Domänenlernen“ verlangt traditionell 80‑90 % Genauigkeit, bevor weitergegangen wird; neuere Befunde deuten darauf hin, dass höhere Schwellen (0,98) die nachfolgende Leistung verbessern; „N korrekte Antworten hintereinander“ (typischerweise 3) ist ein gängiger, kostengünstiger Proxy [12][13].
- Das Vergessen folgt besser einer Potenzgesetz‑Kurve als einer reinen exponentiellen — der Grund, warum FSRS die exponentielle Kurve aufgegeben hat [10][16].
- Für Math Challenge wird ein vereinfachter, nach Fähigkeit (nicht nach Frage) ausgerichteter FSRS‑Scheduler empfohlen, mit Interleaving innerhalb jeder Sitzung, sobald zwei oder mehr Fähigkeiten aktiv sind, sowie einem zweistufigen Domänenschwellen‑Modell (Erfolgsserie + erfolgreicher verteilter Wiederholung).

## Zusammenfassung (EN)

- **Interleavierte Praxis** (Mischen von Aufgabentypen anstatt sie zu blockieren) verdoppelt etwa die Mathematiktest‑Ergebnisse am nächsten Tag im Vergleich zur blockweisen Praxis, obwohl sie während der Praxis‑Sitzung schlechter abschneidet [1][2].
- Eine randomisierte Kontrollstudie in einer 7.‑Klassen‑Klasse (n=140, neun Wochen, unangekündigter Test zwei Wochen später) zeigte, dass interleavierte Praxis die blockweise Praxis übertraf, und Lehrkräfte bewerteten sie als machbar ohne zusätzliches Material [2][3]. Eine Dosis‑Response‑Studie (n=126) ergab, dass mehr Interleaving zu besseren Ergebnissen sowohl nach 2 Tagen als auch nach 1 Monat führte, und der Effekt ist nicht auf oberflächlich ähnliche Aufgabentypen beschränkt [4][5].
- Robert & Elizabeth Bjork (UCLA) bezeichnen dies als **„wünschenswerte Schwierigkeiten“**: Bedingungen, die das Erlernen verlangsamen, aber die langfristige Behaltensleistung verbessern — Abstand, Interleaving, Abruf‑Übung, Generierung und variierte Praxis haben die stärksten Evidenzen [6][7].
- Der **Testeffekt** (Roediger & Karpicke, 2006): Das Abrufen einer Antwort aus dem Gedächtnis ist wirksamer als erneutes Durcharbeiten, und der Vorteil wächst mit der Verzögerung bis zum abschließenden Test [8].
- Cepeda et al. (2008, *Psychological Science*, >1.350 Teilnehmende): Die **optimale Abstandslücke skaliert mit dem Behaltensziel** — etwa 20‑40 % eines 1‑Wochen‑Ziels, schrumpfend auf 5‑10 % eines 1‑Jahres‑Ziels („temporale Ridgeline“) [9].
- Software‑Planungsalgorithmen: **Leitner** (5 Kästen, ~1/2/4/7/14‑Tage‑Intervalle, bei Fehler zurücksetzen) [14]; **SM‑2** (Leichtigkeitsfaktor 1,3‑2,5, Intervalle 1, 6, dann vorherig×Leichtigkeit) [15]; **FSRS** (Ankis aktueller Standard — pro Karte Stabilität/Schwierigkeit/Abrufbarkeit, Potenz‑Gesetz‑Vergessenskurve, ~19‑21 angepasste Gewichte, einzelner nutzerseitiger „gewünschter Behaltens‑Zielwert“ ~0,90) [10]; **Duolingo's Half‑Life Regression** (p = 2^(-Δt/h), senkt Vorhersagefehler um >45 % gegenüber Baselines, steigerte das Live‑Engagement um 12 %) [11].
- **Meisterschafts‑Lernen** verwendet traditionell 80‑90 % Genauigkeit zum Fortschreiten (Bloom); Forschung zu adaptiven Systemen zeigt, dass höhere Schwellen (~0,98) die nachgelagerte Leistung verbessern; „N korrekte Antworten hintereinander“ (oft 3) ist ein gängiger, kostengünstiger Proxy [12][13].
- Das Vergessen folgt einer Potenz‑/Logarithmus‑Kurve besser als einem reinen exponentiellen Zerfall — starker anfänglicher Verlust, abflachender Schwanz — weshalb FSRS von exponentiellen Kurven abwich [10][16].
- Prozedurale mathematische Fähigkeiten (Fakten‑Flüssigkeit, Algorithmus‑Ausführung) profitieren besonders vom Interleaving, weil es *Strategiediskriminierung* trainiert, nicht nur das Abrufen; konzeptuelles Verständnis gewinnt durch Abstand und durch den Transfer‑Effekt des Interleavings, sobald mehrere Konzepte aktiv sind [1][2][6].

## Ergebnisse

### 1. Interleaved practice in Mathematik (Rohrer & Taylor)

Die Laborstudien von Rohrer und Taylor ließen Kinder vier Arten von Mathematikaufgaben entweder blockweise (AAAA BBBB) oder interleaved (ABCD ABCD) üben. Interleaving *verschlechterte* die Leistung während der Sitzung, verdoppelte jedoch **die Testergebnisse am nächsten Tag** [1] – das typische Muster einer wünschenswerten Schwierigkeit.

Taylor & Rohrer (2010, *Applied Cognitive Psychology*) führten ein Klassenraummodell‑RCT durch: Jahrgang 7 (n=140) erhielt über neun Wochen blockweise oder interleaved Praxis. Zwei Wochen später erfolgte ein unangekündigter Test. Das Material mit interleaved Praxis erzielte höhere Werte [2][3].

Rohrer, Dedrick & Stershic (2015, *J. Educational Psychology* 107(3), 900‑908) führten ein Dosis‑Response‑RCT (n=126, Jahrgang 7) durch: Eine höhere Dosis von Interleaving in denselben Arbeitsblättern erhöhte die Punktzahlen sowohl bei etwa ~2‑Tage‑ als auch bei 1‑Monats‑Verzögerungen, ohne zusätzlichen Übungsaufwand [4]. Der Nutzen ist kein Artefakt der oberflächlichen Ähnlichkeit zwischen Aufgabentypen – er besteht sogar, wenn interleaved Aufgaben stark unterschiedlich aussehen, was mit dem Training der *Strategieauswahl* durch Interleaving konsistent ist, nicht mit auswendig‑Lernen [5]. Lehrerbefragungen bewerteten Interleaving als hoch umsetzbar – es erfordert lediglich das Umordnen vorhandener Aufgaben [2][3].

### 2. Bjorks wünschenswerte Schwierigkeiten (UCLA)

Robert & Elizabeth Bjork (1994) prägten den Begriff „desirable difficulties“: Bedingungen, die die *Erwerb* verlangsamen, verbessern häufig die langfristige *Beibehaltung und Übertragung*, weil Leistung‑während‑Lernen und Lernen‑selbst dissociierbar sind [6]. Fünf Schwierigkeiten verfügen über starke Evidenz: spacing, interleaving, retrieval practice, generation und varied practice [7]. Instruktionsdesign, das auf reibungslose, fehlerfreie Sitzungen (Massenwiederholung, Blockierung, erneutes Lesen) optimiert ist, erzeugt Lernen, das sich gut anfühlt, aber nicht von Dauer ist.

### 3. Der Testing‑Effekt (Roediger & Karpicke)

Roediger & Karpicke (2006) verglichen wiederholtes Lernen mit wiederholtem Testen desselben Materials. Direkt danach schnitten die Lernenden besser ab (~83 % vs. ~71 % Abruf); eine Woche später kehrte das Muster um (~40 % vs. ~61 %) [8]. Der Nutzen von Retrieval‑Practice wächst mit der Verzögerung vor dem kritischen Test – dasselbe Muster wie beim Interleaving. Implikation: Eine „answer, then feedback“-Schleife sollte das primäre Lernevent sein, nicht eine Bewertung, die an den Unterricht angehängt wird.

### 4. Optimale Spacing‑Intervalle — Cepedas zeitliche Ridgeline

Cepeda, Vul, Rohrer, Wixted & Pashler (2008, *Psychological Science*, >1.350 Teilnehmende) variierten die Lücke zwischen Lernen und Wiedererlernen und prüften das Behalten bis zu einem Jahr später. Das optimale Intervall ist **nicht fest** – als Bruchteil der eventualen Testverzögerung liegt es bei etwa ~20‑40 % für ein Ziel von 1 Woche bis zu ~5‑10 % für ein Ziel von 1 Jahr [9]. Kurz vor einem Quiz, das man ein Jahr später erinnern muss, führt Cramming zu zu wenig Spacing; einmonatige Wiederholungen, um etwas für eine Woche zu behalten, führen zu zu viel Spacing – genau die Spannung, die adaptive Planer (SM-2, FSRS, HLR) zu lösen versuchen.

### 5. Spaced‑Repetition‑Algorithmen in realer Software

**Leitner (1972).** Karten befinden sich in Kästchen (klassischerweise 5) mit festen Abständen (~1, 2, 4, 7, 14 Tage); eine richtige Antwort fördert, eine falsche setzt zurück in Kästchen 1 [14].

**SM-2 (Woźniak, 1987).** Jeder Gegenstand hat einen Ease‑Factor (EF), beginnend bei 2,5, mit Untergrenze 1,3. Intervalle: I(1)=1, I(2)=6, I(n)=I(n‑1)×EF danach. Eine Qualitätsbewertung von 0‑5 passt EF an über EF' = EF + (0,1 − (5−Q)×(0,08 + (5−Q)×0,02)); Q<3 setzt den Gegenstand zurück [15].

**FSRS (Ankis aktueller Standard).** Verfolgt drei Zustandsvariablen pro Karte: **Stability** S (Tage bis die Abrufwahrscheinlichkeit auf 90 % abnimmt), **Difficulty** D (1‑10) und **Retrievability** R (0‑1, abnehmend nach einer Power‑Law‑Kurve, nicht exponentiell). Ein einziger Regler, **desired retention** (typischerweise 0,85‑0,95, Standard ~0,90), steuert den Scheduler, die Vergessenskurve zu invertieren und das Intervall zu wählen, bei dem das vorhergesagte R den Zielwert erreicht. FSRS‑6 passt ~19‑21 Gewichte pro Lernender aus der Wiederholungshistorie mittels Gradient Descent an und übertrifft den festen Ease‑Factor von SM‑2, sobald genügend Daten vorliegen (~1.000+ Reviews) [10].

**Half-Life Regression (Duolingo; Settles & Meeder, 2016, ACL).** Modelliert die Gedächtnis‑Halbwertszeit h jedes Elements als log‑lineare Funktion der vorherigen korrekten/inkorrekten Zählungen; Abrufwahrscheinlichkeit p = 2^(−Δt/h) – eine explizite exponentielle Kurve (gegenüber FSRS' Power‑Law). Reduzierte den Vorhersagefehler um >45 % gegenüber Baselines und steigerte das tägliche Engagement um 12 % in einem Live‑A/B‑Test [11].

### Gemeinsamer Kern

Alle vier planen die nächste Wiederholung für den Moment, in dem die Abrufwahrscheinlichkeit gerade die Zielschwelle überschreitet – nicht vorher (verschwendete Wiederholungen), nicht lange danach (schon vergessen). Sie unterscheiden sich darin, ob die Vergessenskurve fest ist (Leitner, SM‑2) oder pro Element/Lernender angepasst wird (FSRS, HLR) sowie in exponentieller gegenüber Power‑Law‑Form.

### 6. Schwellenwerte des Mastery‑Learnings

Bloom's Mastery‑Learning verlangt ~80‑90 % Genauigkeit, bevor weitergegangen wird, mit Remediation unterhalb der Schwelle [12][13]. Ein gängiger günstiger Proxy, besonders in K‑12‑Fakten‑Fluency‑Programmen, ist „N aufeinanderfolgende richtige Antworten“ (oft 3), das bei einer falschen Antwort sauber zurücksetzt [13]. Aktuelle Forschung zum adaptiven Tutoring zeigte, dass das Anheben der Mastery‑Barriere von ~0,95 auf ~0,98 geschätzte Mastery‑Wahrscheinlichkeit die Leistung in abhängigen nachfolgenden Lektionen verbesserte – die traditionelle Schwelle unterschätzt Voraussetzungen‑Inhalte [12]. Die Fakten‑Fluency‑Literatur betont, dass Mastery *nach einer Lücke* bewertet werden muss, nicht nur in der Trainingssitzung, da die sofortige Abrufgenauigkeit die dauerhafte Mastery überbewertet [13].

### 7. Vergessenskurven

Ebbinghaus' klassische Kurve: steiler früher Verlust (~42 % innerhalb von 20 Minuten vergessen, ~67 % innerhalb von 24 Stunden) gefolgt von einem langen abflachenden Schwanz [16]. Ebbinghaus modellierte dies grob exponentiell, doch der moderne Konsens – und der Grund, warum FSRS sein eigenes exponentielles Modell durch eine Power‑Law‑Kurve in FSRS‑4,5/6 ersetzte – ist, dass reales Vergessen schneller abnimmt als eine reine exponentielle Zerfallsfunktion vorhersagt [16][10].

### 8. Prozedurale vs. konzeptuelle mathematische Fähigkeiten

Die Arbeit von Rohrer/Taylor zielt auf *prozedurale* Fähigkeiten ab: welche Methode auf welches Problem anzuwenden ist. Der Nutzen von Interleaving wird theoretisch auf **Discrimination Practice** zurückgeführt – das Erkennen, welche Strategie ein Problem erfordert, etwas, das blockweise Praxis nie verlangt, da der Block die Strategie preisgibt [1][2][5]. Für *konzeptuelles* Verständnis unterstützen spacing und retrieval practice weiterhin denselben Mechanismus der Spurverstärkung, aber Interleaving fügt Transferwert hinzu – das Erkennen der Anwendbarkeit eines Konzepts in einem neuartigen, gemischten Kontext [6][7][8]. Kurz gesagt: Prozedurale Fluency benötigt spaced *und* interleaved Retrieval; konzeptuelles Verständnis benötigt spaced Retrieval und profitiert zusätzlich von Interleaving, sobald mehrere Konzepte aktiv sind.

## Designimplikationen für Math Challenge

1. **Planung pro Fähigkeitsknoten, nicht pro Frage.** Verfolge Einheiten wie „2‑stellige Subtraktion mit Ausleihen“ als planbare Entität – mathematische Fähigkeiten verallgemeinern sich über viele Frageninstanzen, im Gegensatz zu Karteikarten.

2. **Konkreter empfohlener Algorithmus: FSRS-lite mit einem Leitner‑Cold‑Start.** Neue Fähigkeiten mit <20 Datenpunkten verwenden eine einfache Leitner‑ähnliche Leiter (1 → 3 → 7 → 16 → 35 Tage, bei falscher Antwort zurücksetzen, kein Fitten nötig). Sobald genügend Versuche vorliegen, wechsle zu einem FSRS‑ähnlichen Modell, das mit den veröffentlichten FSRS‑6‑Standardgewichten initialisiert wird und periodisch offline neu angepasst wird. Stelle einen einstellbaren Regler bereit: **gewünschte Behaltensrate = 0,90** Standard, anpassbar pro Klassenstufe (0,85 für die jüngsten Kinder, um Frustration zu reduzieren, 0,92+ für ältere/kompetitive Nutzer).

3. **Zweistufige Beherrschungsgrenze.** Erfordere **3 aufeinanderfolgende richtige Antworten bei steigender Schwierigkeit** innerhalb einer Fähigkeit als „vorläufig gelernt“-Signal (die gängige Fakt‑Flüssigkeits‑Konvention [13]), aber markiere eine Fähigkeit nicht als „beherrscht“ für die Planung, bis sie zudem **eine korrekte verteilte Wiederholung bei einem Abstand von ≥3‑Tagen** übersteht – das kodiert direkt die Lern‑Durch‑Test‑Effekt‑Lehre, dass sofortige Erfolgsserien das dauerhafte Lernen überschätzen.

4. **Blockiere das Üben nie nach Fähigkeit, sobald 2+ Fertigkeiten im Wechsel sind.** Sobald eine zweite Fähigkeit zur Wiederholung ansteht, mische sie mit der aktuellen Lektion innerhalb derselben Sitzung (ABAB/ABCABC), anstatt die Aufgaben einer Fähigkeit abzuschließen, bevor die nächste beginnt – die einzige höchstwirksame, kostenfreie Änderung, die die Literatur unterstützt [1][2][4].

5. **Sitzungs‑Mischungsverhältnis: ~40‑60 % neu/aktuelle Lektion gemischt mit ~40‑60 % fälliger Wiederholung**, entnommen aus 2‑4 anderen Fertigkeiten, gemischt auf Fraget‑Ebene (nicht in Unterblöcken von 3‑4 gleichen Aufgabentypen). Für Vorschule/Kinder im Kindergarten‑Alter, neige zu 70/30 neu/Wiederholung und mische höchstens 2 Fertigkeiten, da Arbeits‑Speicher‑Beschränkungen, die die Literatur zu wünschenswerten Schwierigkeiten als Grenzbedingung nennt [6][7].

6. **Wiederholungen sind immer Abruf, nie passive Wiederexposition.** Ein Wiederholungsereignis verlangt, dass das Kind eine Antwort liefert, bevor irgendeine Erklärung erscheint, selbst bei „bereits gelernten“ Inhalten [8].

7. **Skaliere Wiederholungslücken nach der gewünschten Dauer der Fähigkeit, nicht nach einem festen Kalenderrhythmus.** Kennzeichne Fähigkeiten als „einheitsbezogen“ (engere Lücken, ~20‑30 % des Behaltensfensters) versus „grundlegend“ (progressiv breitere Lücken, ~5‑10 % eines einjährigen Horizonts, sobald etabliert), gemäß Cepedas Ridgeline [9].

8. **Verfolge Schwierigkeit getrennt von Stabilität pro Fähigkeit**, wie FSRS es tut, sodass ein Kind, das Schwierigkeiten hat, sowohl ein kürzeres nächstes Intervall als auch geringere Stabilitätsgewinne pro richtiger Antwort erhält als ein Kind, dem es leicht fällt – das verhindert, dass ein festes‑Leichtigkeit‑Algorithmus einen Glücks‑Tipp gleichwertig zu echter Beherrschung behandelt.

9. **Modelliere das Vergessen mit einer Potenzgesetz‑Kurve, nicht mit reinem Exponential**, für Platzierungs‑/adaptiv‑Schwierigkeits‑Schätzungen von „wie viel hat dieses Kind seit der letzten Übung vergessen“ – ein reines Exponential überschätzt das Vergessen bei langen Verzögerungen und unterschätzt es kurz nach dem Lernen [16][10].

10. **Instrumentiere beide Rohrer‑Signaturen als interne Kennzahlen.** Verfolge die Genauigkeit innerhalb einer Sitzung und die verzögerte Abruf‑Genauigkeit (z. B. ein kurzer Aufwärm‑Quiz zu den gestrigen Fähigkeiten) als separate KPIs; erwarte, dass die Genauigkeit bei gemischten Sitzungen manchmal *niedriger* erscheint als bei blockierten, während die verzögerte Genauigkeit höher ist – lasse nicht zu, dass ein Abfall der Genauigkeit innerhalb einer Sitzung eine Rückkehr zum Blockieren auslöst.

11. **Berichte „geübt“ vs. „gelernt“ getrennt an Eltern/Lehrkräfte.** Zeige das zweistufige Beherrschungs‑Signal (Punkt 3) statt der rohen Sitzungs‑Genauigkeit, um die Falle zu vermeiden, dass ein Tages‑Erfolgs‑Streak wie Beherrschung wirkt und dann bei der nächsten unangekündigten Wiederholung scheitert.

12. **KI‑Tutor‑Feedback sollte Abruf anregen, bevor Lösungen gezeigt werden.** Bei einer falschen Antwort zuerst einen abruf‑gestützten Hinweis geben (Generierungseffekt [6][7]); vollständige ausgearbeitete Beispiele erst beim zweiten Fehlversuch bereitstellen.

## Offene Fragen für den Projektinhaber

1. Soll der Planungs‑Zustand nur pro Kind‑pro Fähigkeit live sein, oder sollten wir zusätzlich einen populationsweiten FSRS‑Parameter‑Fit pflegen, um die Zeitpläne neuer Kinder zu initialisieren, bevor genügend eigene Daten vorliegen?  
2. Soll die gewünschte Behaltensrate plattformweit ein fester Wert von 0,85 sein, oder ein einstellbarer Regler für ältere/Promotions‑Kandidaten, ähnlich wie Anki ihn Power‑Usern anbietet?  
3. Soll die Kennzeichnung einheitsbezogen vs. grundlegend manuell pro Curriculum‑Knoten erstellt werden, oder aus der Tiefe des Voraussetzungen‑Graphen abgeleitet werden?  
4. Interagiert das Mischungsverhältnis mit dem Anti‑Cheating‑Verhaltens‑Signal‑System – macht das Mischen von Fähigkeitstypen die Erkennung von Zeit‑/Muster‑Signalen leichter oder schwerer zu interpretieren?  
5. Soll die zweistufige Beherrschungs‑Barriere (Streak + verzögerte Wiederholung) den Fortschritt zur nächsten Curriculum‑Einheit blockieren, oder nur die Wiederholungs‑Planung beeinflussen, während der Fortschritt an einem separaten Genauigkeits‑Schwellenwert festgemacht wird?

## Quellen

1. Rohrer & Taylor, "The shuffling of mathematics problems improves learning" — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer&Taylor2007IS.pdf  
2. Taylor & Rohrer (2010), "The effects of interleaved practice," *Applied Cognitive Psychology* 24, 837-848 — https://onlinelibrary.wiley.com/doi/abs/10.1002/acp.1598  
3. IES WWC Study 89950, interleaved mathematics practice classroom RCT — https://ies.ed.gov/ncee/wwc/Study/89950  
4. Rohrer, Dedrick & Stershic (2015), "Interleaved practice improves mathematics learning," *Journal of Educational Psychology* 107(3), 900-908 — https://files.eric.ed.gov/fulltext/ED557355.pdf  
5. Rohrer et al. (2014), "The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems" — https://pubmed.ncbi.nlm.nih.gov/24578089/  
6. Bjork & Bjork (2011), "Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning" — https://mirjamglessmer.com/2026/03/07/currently-reading-bjork-bjork-2011-on-making-things-hard-on-yourself-but-in-a-good-way-creating-desirable-difficulties-to-enhance-learning/  
7. "Desirable Difficulties: Bjork's 5 Principles" — https://www.structural-learning.com/post/desirable-difficulties  
8. Roediger & Karpicke (2006), "Test-Enhanced Learning" / "The Power of Testing Memory," *Perspectives on Psychological Science* 1(3), 181-210 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x  
9. Cepeda, Vul, Rohrer, Wixted & Pashler (2008), "Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention," *Psychological Science* — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf  
10. FSRS algorithm documentation — https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm and https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm  
11. Settles & Meeder (2016), "A Trainable Spaced Repetition Model for Language Learning," ACL — https://research.duolingo.com/papers/settles.acl16.pdf ; code — https://github.com/duolingo/halflife-regression/blob/master/README.md  
12. "How Much Mastery is Enough Mastery?" EDM 2025 — https://educationaldatamining.org/EDM2025/proceedings/2025.EDM.short-papers.4/index.html  
13. "The Importance of Math Fact Fluency: Evidence-Informed Classroom Practices" — https://www.ldatschool.ca/the-importance-of-math-fact-fluency-evidence-informed-classroom-practices/  
14. Leitner system overview — https://e-student.org/leitner-system/ and https://supermemo.guru/wiki/Leitner_system  
15. SuperMemo SM-2 algorithm original specification — https://super-memory.com/english/ol/sm2.htm  
16. Ebbinghaus forgetting curve — https://www.flashcardify.me/blog/ebbinghaus-forgetting-curve and https://www.structural-learning.com/post/ebbinghaus-forgetting-curve
