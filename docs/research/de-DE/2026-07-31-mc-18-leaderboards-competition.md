# Leaderboards and Competition Design: Psychological Effects, Rating Systems, and Fair Cross-Difficulty Comparison

> Math Challenge research — 2026-07-31 — topic 18

## Resumen ejecutivo (ES)

- Leaderboards im Bildungsbereich haben **gemischte und positionsabhängige** Effekte: Sie motivieren Lernende, die nahe der Spitze stehen, demotivieren jedoch konsequent diejenigen, die am unteren Ende bleiben — die systematische Übersicht von 2023 zu Leaderboards in gamifizierten Umgebungen dokumentiert dieses Muster „von oben nach unten“ und fordert, den Effekt nach Position zu messen, nicht nur nach dem Klassendurchschnitt [1][2].
- Die soziale Vergleichstheorie von Festinger (1954) erklärt den Mechanismus: Der Vergleich „nach oben“ kann je nach vorherigem Selbstwertgefühl motivieren oder entmutigen; der Vergleich „nach unten“ schützt die Stimmung, lehrt jedoch nichts. Ein Leaderboard ohne sorgfältiges Design maximiert den Aufwärtsvergleich für die Mehrheit der Gruppe [4].
- Christy und Fox (2014) fanden in einem virtuellen Klassenzimmer, dass die Komponente des sozialen Vergleichs (das Ranking) stärker wirkte als die Stereotypbedrohung auf die mathematische Leistung von Frauen — das Ranking selbst verändert das Ergebnis, nicht nur den Inhalt [1].
- Die Selbstbestimmungstheorie (Deci & Ryan) sagt voraus, dass als kontrollierend wahrgenommene Konkurrenz die intrinsische Motivation verdrängt; deshalb ist es wichtig, dass die Teilnahme am Ranking optional ist [5].
- Die Metaanalyse von Johnson und Johnson (1981, >122 Studien) zeigt, dass kooperative Strukturen konsequent bessere Leistungen und Peer‑Beziehungen erzielen als kompetitive und individualistische Strukturen [6].
- Glicko‑2 (mit Bewertungsabweichung RD und Volatilität σ) ist für ein Spiel mit unregelmäßigen Sitzungen wie Math Challenge geeigneter als einfaches Elo; TrueSkill/OpenSkill lösen ein Team‑Problem, das dieses Projekt bislang nicht hat [7][8][9][10].
- Um ein 6‑jähriges Kind beim Addieren mit einem Erwachsenen in fortgeschrittenen Themen zu vergleichen, ist die richtige Lösung eine Fähigkeits­skala (θ), die unabhängig davon geschätzt wird, welche Items beantwortet wurden — der Ansatz der Item‑Response‑Theory (IRT) und das, was Codeforces approximiert, indem es die Leistung relativ zum Gegner bewertet, nicht den nominalen Problemwert [11].
- Das Ligasystem von Duolingo (wöchentliche Gruppen von ~30 mit Auf‑ und Abstieg) ist die dem bereits festgelegten Design für Math Challenge am nächsten kommende Referenz; die kleine Gruppengröße ist beabsichtigt: Sie hält eine erreichbare Position für jeden in dieser Woche [13].
- „Sandbagging“ (absichtliche Leistungsabsenkung) und „Smurfing“ (neue Konten, um unter dem tatsächlichen Niveau zu spielen) sind bekannte Schwachstellen jeder Fähigkeits‑Matchmaking‑Methode; sie werden durch hohe RD/Volatilität bei neuen Konten gemindert, nicht durch manuelle Regeln.
- Prodigy Math hat dokumentierte Kritik erhalten (Beschwerde bei der FTC von >20 Organisationen, Berichterstattung von NBC News und Financial Times) wegen Spielmechaniken, die den echten mathematischen Inhalt verwässern — eine direkte Warnung, nicht die Spielschicht das Lernen verschlingen zu lassen [14][15][16].

## Executive summary (EN)

Leaderboards im Bildungsbereich erzeugen **positionsabhängige, nicht einheitliche, Effekte**: Sie unterstützen Lernende nahe der Spitze und schaden zuverlässig Lernenden am unteren Ende, die dazu neigen, sich zurückzuziehen — die systematische Übersicht von 2023 zu Leaderboards in gamifizierten Bildungskontexten beschreibt dies als ein „von oben nach unten“‑Muster und fordert, die Effekte nach Rangposition und nicht nach dem Klassendurchschnitt zu messen [1][2]. Christy und Fox (2014) fanden heraus, dass die soziale Vergleichskomponente eines Leaderboards die Stereotypbedrohung bei der mathematischen Leistung von Frauen in einem simulierten Klassenzimmer stärker beeinflusste — das Ranking selbst verändert das Verhalten [1]. Festingers (1954) soziale Vergleichstheorie liefert den Mechanismus: Aufwärtsvergleich kann je nach vorherigem Selbstwertgefühl motivieren oder demotivieren; Abwärtsvergleich schützt die Stimmung, lehrt jedoch nichts — ein naives Leaderboard maximiert den Aufwärtsvergleich für die Mehrheit jeder Gruppe [4]. Die Selbstbestimmungstheorie (Deci & Ryan) sagt voraus, dass als kontrollierend wahrgenommene Konkurrenz die intrinsische Motivation verdrängt, was die Grundlage dafür ist, jedes Ranking optional zu halten [5]. Johnson und Johnsons Metaanalysen (über 122 Studien) zeigten, dass kooperative Zielstrukturen konsequent bessere Leistungen und Peer‑Beziehungen erzielen als kompetitive und individualistische [6].

Zu Bewertungssystemen: Elo verfügt über kein Vertrauensmaß und driftet im Laufe der Zeit; Glicko‑2 fügt die Bewertungsabweichung (RD) und Volatilität (σ) hinzu und ist für unregelmäßiges Spielen geeignet; TrueSkill/OpenSkill erweitern das Bayessche Rating auf Teams, ein Problem, das Math Challenge derzeit nicht hat [7][8][9][10]. Für den Vergleich stark unterschiedlicher Schwierigkeitsgrade ist das richtige Werkzeug nicht die Punktnormalisierung, sondern eine Fähigkeits­schätzung, die unabhängig davon ist, welche Items beantwortet wurden — die Item‑Response‑Theory (IRT) und das, was Codeforces approximiert, indem es die Leistung relativ zu Gegnern bekannter Fähigkeit bewertet, anstatt feste Punkte pro Problem zu vergeben [11]. Duolingos wöchentliche Ligen mit ~30 Nutzern sind das realste Vorbild für das bereits festgelegte Design von Math Challenge, und die kleine Gruppengröße ist bewusst gewählt: Sie hält ein erreichbares Spitzenresultat für jeden, der in dieser Woche teilnimmt [13]. Sandbagging und Smurfing sind bekannte Fehlermodi des Fähigkeits‑Matchmakings, die am besten strukturell gemindert werden (schnelle RD/σ‑Konvergenz für neue/unstetige Konten) statt durch polizeiliche Maßnahmen. Prodigy Math hat dokumentierte Kritik erhalten — eine FTC‑Beschwerde von >20 Interessenvertretungen, Berichterstattung von NBC News und Financial Times — wegen Mechaniken, die den eigentlichen mathematischen Inhalt verdrängen, eine direkte Warnung, die Belohnungsschicht nicht das Lernen dominieren zu lassen [14][15][16].

## Ergebnisse

### 1. Ranglisten im Bildungsbereich: wen sie motivieren, wen sie demotivieren

Der systematische Review 2023 „The use of leaderboards in gamified educational settings“ fasst die zentrale Erkenntnis als **positionsabhängig, nicht einheitlich** zusammen: Die Reaktion einer Lernenden hängt stark davon ab, wo sie auf der Rangliste steht [2]. Eine Studie 2025 zu feedbackbasierten Ranglisten argumentiert für „standardisiertere Wege, potenzielle Effekte zu untersuchen“, weil frühere Forschung positive und null Ergebnisse vermischte, anstatt Top‑, Mittel‑ und Bottom‑Performer zu trennen [2]. Die Studie von Christy und Fox (2014) zeigte, dass eine soziale‑Vergleichs‑Manipulation (eine rangierte Rangliste) einen stärkeren Effekt auf die mathematische Leistung hatte als Stereotyp‑Bedrohung, und einige Teilnehmende, die unter Vergleichsdruck schlechter abschnitten, berichteten dennoch von *höherer* akademischer Identifikation — Verhaltens‑ und gefühlte Motivations‑Effekte können divergieren [1]. Eine breitere Metaanalyse von 41 Gamification‑Studien (5.071 Teilnehmende) fand einen großen aggregierten Effekt (g = 0,822), konnte jedoch keine ranglisten‑spezifischen Effekte für leistungsschwächere Teilnehmende isolieren — ein positiver Durchschnitt bedeutet nicht, dass jede Rangposition gleichermaßen profitiert [3]. Design‑Fazit: Ranglisten erhöhen im Schnitt das Engagement, konzentrieren jedoch das reale Risiko von Schaden an der Unterseite, das nur durch positionsbezogene Messungen sichtbar wird.

### 2. Sozialer Vergleichstheorie und Kinder

Festingers (1954) Theorie besagt, dass Menschen ihre Fähigkeiten bewerten, indem sie sich mit anderen vergleichen, besonders wenn keine objektive Messlatte vorhanden ist [4]. Aufwärts‑Vergleich (zu jemand Besserem) kann Menschen mit hohem Selbstwert motivieren, demotiviert jedoch solche, die bereits an sich zweifeln; Abwärts‑Vergleich schützt die Stimmung, erzeugt aber keinen Lernzuwachs [4]. Kinder besitzen im Allgemeinen weniger stabile Selbstwertgefühle als Erwachsene, und eine permanente, immer nach oben gerichtete Rangliste — bei der das mittlere Kind stets Personen vor sich sieht und nie beruhigenden Kontext erhält — begünstigt strukturell den Aufwärts‑Vergleich, den die Theorie als demotivierend für Personen mit geringem Selbstvertrauen einstuft.

### 3. Selbstbestimmungstheorie: Wettbewerb als kontrollierend vs. informativ

Die Selbstbestimmungstheorie (Deci & Ryan) ordnet Motivation nach Autonomie, Kompetenz und Verbundenheit ein, auf einem Kontinuum von kontrolliert zu autonom [5]. Die Wirkung von Wettbewerb hängt davon ab, ob er als informatives Feedback zur eigenen wachsenden Kompetenz erlebt wird oder als kontrollierender Druck, andere zu übertreffen. Eine Rangliste, aus der ein Kind nicht aussteigen kann, die von Gleichaltrigen gesehen wird und die Identität an den Rang bindet, liegt näher am Kontrollierenden; dasselbe Fähigkeits‑Signal privat und mit dem Hinweis „du hast dich verbessert“ präsentiert, liegt näher am Informativ‑Aspekt. Deshalb ist Wahlfreiheit ebenso wichtig wie die Berechnungs‑Logik des Rankings selbst [5].

### 4. Kooperative Alternativen: die Evidenz

Johnson und Johnsons Meta‑Analyse 1981 (122 Studien, 286 Befunde) und eine spätere Erweiterung (148 Studien zu frühen Jugendlichen) fanden, dass kooperative Zielstrukturen kompetitive und individualistische übertreffen, weil kooperative Settings Peer‑Support erzeugen, den kompetitive nicht bieten [6]. Das unterstützt direkt Team‑/Klassen‑Gesamt‑Mechaniken (kombinierte Klassen‑XP, ein „Familien‑Liga“‑Gesamt) als Ergänzung zu individuellen Rankings — kooperative Ziele aktivieren einen Motivationskanal, den individueller Wettbewerb nicht erreichen kann.

### 5. Bewertungssysteme: Elo, Glicko‑2, TrueSkill, OpenSkill

**Elo**: `E_A = 1/(1+10^((R_B−R_A)/400))`, `R_A' = R_A + K·(S_A−E_A)`. Kein Konzept von Vertrauen — ein Rating nach 3 Partien wird wie eines nach 300 behandelt — und ist über lange Zeiträume anfällig für Drift/Inflation (die Schach‑Population 2700+ wuchs von 1 Spieler 1979 auf 44 2012) [7].

**Glicko‑2** fügt **Rating Deviation (RD)** hinzu, das das Vertrauen quantifiziert (schrumpft mit Spielen, wächst bei Inaktivität), und **Volatilität (σ)**, die Ergebnis‑Konsistenz misst [8]. Neue Spieler starten mit hohem RD (Referenz‑Implementierung: 350), sodass frühe Ergebnisse das Rating schnell bewegen; etablierte Low‑RD‑Spieler bewegen sich langsam. Ein τ‑Parameter (~0,3–1,2) begrenzt, wie schnell die Volatilität selbst ändert. Das System arbeitet über diskrete Rating‑Perioden [8].

**TrueSkill** (Microsoft Research) modelliert jede Person als Gaußsche Verteilung (μ, σ) und erweitert das Bayessche Rating auf Teams, indem individuelle Skills summiert werden (wie beim Xbox Live‑Matchmaking); es kann Cheating nicht erkennen, keine intentionalen Handicaps handhaben und den individuellen Beitrag nicht trennen, wenn Spieler konsequent im Team auftreten [9].

**OpenSkill** ist eine Open‑Source‑, patentrechtsfreie Alternative, die Weng‑Lin‑Bayessche Approximationen (Bradley‑Terry, Plackett‑Luce, Thurstone‑Mosteller) implementiert und asymmetrisches Multi‑Team‑Matchmaking adressiert [10].

**Für eine Lern‑App**: Math Challenge ist grundsätzlich ein Einzelspieler‑gegen‑Inhalt‑Szenario, näher an Glicko‑2s ursprünglichem Anwendungsbereich (Einzelpersonen, unregelmäßiges Spielen, Bedarf an Vertrauensmaß) als an TrueSkill/OpenSkill’s Team‑Domäne. Glicko‑2 passt besser; team‑summierende Mechaniken lösen ein Problem (Team‑Wettbewerb), das derzeit nicht benötigt wird, und bringen reale Komplexität mit.

### 6. Faire Vergleichbarkeit bei stark unterschiedlichen Schwierigkeitsgraden

Das naive Summieren roher Punkte belohnt, wer die meisten leichten Aufgaben am schnellsten löst — genau das, was Wettbewerbs‑Programmierungs‑Plattformen wie Codeforces verhindern: „die Geschwindigkeit bei leichteren Aufgaben ist oft entscheidend“ wird als bekannte Bewertungs‑Verzerrung erkannt und in der Praxis korrigiert, indem die *Leistung relativ zu Gegnern bekannten Ratings* bewertet wird, statt eines festen Punktwerts pro Aufgabe [11].

Das übertragbare Prinzip ist **Item Response Theory (IRT)**: Statt roher Trefferzahlen schätzt IRT gemeinsam die Fähigkeit einer Person (θ, latenter Trait, standardisiert auf Mittelwert 0, SD 1) und die Schwierigkeit (b) sowie Diskriminations‑Parameter (a) jedes Items über ein logistisches Modell `p(θ) = c + (1−c)/(1+e^(−a(θ−b)))` [11]. Zwei Personen, die völlig unterschiedliche, unterschiedlich schwere Items beantworteten, landen auf derselben Fähigkeitsskala — genau das „6‑jährige vs. PhD“‑Problem, das das globale Board lösen muss. IRT liegt auch adaptiven Tests zugrunde, bei denen jedes Item so gewählt wird, dass es bei der aktuellen Fähigkeits‑Schätzung maximal informativ ist [11].

Ein nicht‑digitales Präzedenzbeispiel ist das Golf‑**World Handicap System**: `Course Handicap = (Handicap Index × Slope Rating)/113 + (Course Rating − Par)`, wobei der Slope Rating (55–155) erfasst, wie viel schwieriger ein Platz für einen Bogey‑Golfer im Vergleich zu einem Scratch‑Golfer ist — es normalisiert Spieler‑Skill und Aufgaben‑Schwierigkeit gleichzeitig, dieselbe Problemform wie beim Vergleich einer Kinder‑Additions‑Leistung mit einer Erwachsenen‑Topologie‑Leistung [12].

### 7. Anti‑Inflation und Saison‑Resets

Elo‑Familien‑Systeme driftieren, wenn Populationen wachsen; reale Systeme begegnen dem mit periodischer Neukalibrierung und indem sie den Median der Population verankern (Lichess berichtet, dass sein Median nahe 1500 bleibt, ohne signifikanten langfristigen Drift) [8]. Glicko‑2s RD bietet ein kostenloses Anti‑Inflations‑Werkzeug: Ein nicht genutztes Rating wird automatisch unsicherer, sodass ein altes Ergebnis nicht stillschweigend bei einem aufgeblähten Wert verbleiben kann — jede Rückkehr in den Wettbewerb testet die Zahl erneut.

### 8. Sandbagging und Smurfing

Sandbagging (absichtliches Unterperformen, um leichtere Gegner zu erhalten) und Smurfing (ein erfahrener Spieler mit neuem, niedrig bewerteten Account) sind gut dokumentierte Fehlermodi von Skill‑Matchmaking allgemein. Sandbagging wird typischerweise durch ungewöhnlich hohe Ergebnis‑Varianz im Vergleich zur Historie erkannt; Smurfing ist inhärent, wenn neuen Accounts niedrige/neutrale Ratings mit hoher Unsicherheit zugewiesen werden, weil ein talentierter neuer Account schnell gewinnt, bevor sein RD kollabiert und das wahre Rating einholt. Keines lässt sich allein durch die Formel lösen — reale Systeme kombinieren schnelle RD/σ‑Konvergenz mit Anomalie‑Erkennung außerhalb des Ratings selbst.

### 9. Wie benannte Produkte kindlichen Wettbewerb handhaben

- **Duolingo**: wöchentliche Ligen mit ~30 Lernenden, gruppiert nach ähnlichem Aktivitäts‑Level/Zeit‑Zone, nach XP gerankt, Aufstieg der Top‑ und Abstieg der Bottom‑Performer, ein Top‑Tier‑Eliminierungsturnier und vollständige Ranglisten‑Opt‑Out‑Möglichkeit [13].
- **Khan Academy**: Energiepunkte und ein fünf‑Stufen‑Badge‑System für Skills/Videos/Herausforderungen; Ranglisten existieren für mehrere Metriken, aber die Darstellung betont Punkte/Badges als Anerkennung von Aufwand und Beherrschung.
- **Zearn**: explizit kompetenz‑basiert und nicht‑kompetitiv — Lektionen schließen an einen „Tower of Power“‑Kompetenz‑Check an, statt Mitlernende zu übertreffen, keine Rangliste in der Design‑Dokumentation; Begründung ist Gerechtigkeit und individualisiertes Lerntempo.
- **Prodigy Math**: Spiel‑Fortschritt und In‑Game‑Währung überlagern Mathe‑Inhalte; löste eine FTC‑Beschwerde von >20 Kinder‑Advocacy‑Organisationen (Financial Times, NBC News) aus, die manipulative, irreführende Vermarktung und Upselling‑Praktiken an Kinder vorwarfen, und eine NEPC‑Prüfung kam zu dem Ergebnis, dass eine von Prodigy in Auftrag gegebene Johns‑Hopkins‑Studie die Lern‑Outcome‑Behauptungen des Unternehmens *nicht unterstützt* [14][15][16].
- **Mathletics / Live Mathletics (3P Learning)**: führt große zeitlich begrenzte Wettbewerbe („World Maths Day“) und einen Echtzeit‑Head‑to‑Head‑Modus „Live Mathletics“ durch; detaillierte Mechaniken waren nicht unabhängig zugänglich und sollten als unbestätigt behandelt werden.

### 10. Nennenswerte Kritik, die ernst genommen werden sollte

Veröffentlichte akademische Kritik an kompetitivem Gamification im Kinder‑Lernen ist dünner, als die Branchenberichterstattung vermuten lässt: Die meisten rigorosen Studien finden reale, aber *heterogene* Effekte — große aggregierte Gewinne neben unklaren oder negativen Effekten, die sich auf bestimmte Rangpositionen konzentrieren — nicht die Geschichte „immer gut/immer schlecht“, und fordern wiederholt, Effekte nach Subgruppen statt nach Klassen‑Durchschnitt zu messen [1][2][3].

## Designimplikationen für Math Challenge

1. **Adoptieren Sie Glicko-2, nicht Elo oder TrueSkill, als Kernbewertungsalgorithmus.** Verfolgen Sie `(rating μ, RD, volatility σ)` pro Spieler pro Klassenstufe/Fach. Startparameter gemäß der Glicko-2-Referenz: rating 1500, RD 350, σ ≈ 0,06, τ im Bereich 0,3–0,5 (bevorzugen Sie das niedrige Ende — widerstehen Sie volatilen Schwankungen stärker als ein Schach‑Server) [8]. Verwenden Sie kurze Bewertungsperioden (z. B. täglich), da es viele kleine „Matches“ (Probleme) gibt statt mehrtägiger Turniere [8].

2. **Bewerten Sie nicht Kopf‑zu‑Kopf; bewerten Sie stattdessen anhand der Aufgabenschwierigkeit, IRT‑artig.** Modellieren Sie jede Aufgabe mit ihrer eigenen gemeinsam geschätzten Schwierigkeit/Unterscheidungsfähigkeit [11]. Eine korrekte Antwort auf eine schwere Aufgabe ist ein viel stärkeres Signal als auf eine leichte Aufgabe — die direkte Lösung für „wer die einfachsten Aufgaben am schnellsten löst, gewinnt“, da rohe Punktzahlen nie in den Vergleich einfließen.

3. **Normalisieren Sie die globale Rangliste anhand einer Fähigkeitsabschätzung (θ), niemals anhand roher Punkte oder Geschwindigkeit.** Das θ eines 6‑jährigen bei Addition und das θ eines Erwachsenen bei fortgeschrittener Mathematik liegen auf derselben Skala, weil beide aus Antworten auf separat kalibrierte Items geschätzt werden — das gleiche Prinzip wie das Course Handicap im Golf [12]. Rangieren Sie die globale Rangliste nach θ (oder einer begrenzten Transformation davon), nicht nach XP oder gelöster Aufgabenanzahl.

4. **Behalten Sie Klassenstufen‑Boards und das globale Board bei, aber ranken Sie das globale Board auf derselben normalisierten θ‑Skala.** Klassenstufen‑Boards können einfachere, altersgerechte Metriken (Sterne, Serien) anzeigen; das θ‑basierte Ranking ist für die Ebene reserviert, die wirklich über Altersgrenzen hinweg vergleichbar sein soll.

5. **Ligapromotion/-demotion: Behalten Sie Duolingos Gruppengröße von ~30‑person bei; machen Sie die Degradierung weich.** Befördern Sie wöchentlich das oberste Band (z. B. die oberen 15‑20 %) ; degradieren Sie nur das unterste Band (z. B. die unteren 10 %), und degradieren Sie niemanden, der in dieser Woche weniger als N Tage aktiv war — Inaktivität sollte einfrieren, nicht bestrafen, und zielt direkt auf die Erkenntnis „unten disengagiert“ ab [1][2].

6. **Schützen Sie die unteren 20 % strukturell, nicht nur durch Kopie.** Da das untere Ende jeder Gruppe ständige Aufwärtsvergleiche erfährt [4], geben Sie dem unteren Band ein privates, nicht‑vergleichendes Signal („Sie haben diese Woche X % verbessert“ im Vergleich zu Ihrer eigenen Historie) anstelle nur eines öffentlichen Rangs — das Feedback wird von vergleichend zu informativ umgestaltet [5].

7. **Zeigen Sie standardmäßig niemals die wörtliche Letztplatz‑Rangzahl einem Kind.** Der empirische Schaden konzentriert sich am unteren Ende [1][2]; zeigen Sie für jüngere Stufen „obere Hälfte / nicht obere Hälfte“ Bänder anstelle des genauen Rangs, wobei der exakte numerische Rang für das globale Board (opt‑in) und ältere Klassenstufen‑Bänder reserviert wird.

8. **Machen Sie die Rangliste optional und umkehrbar.** Nutzer (oder ein Elternteil/Lehrer) sollten die Möglichkeit haben, das öffentliche globale Board zu deaktivieren und dennoch Ligen/Klassenmodus zu nutzen, oder umgekehrt, gemäß Duolingos eigenem Präzedenzfall und dem Autonomie‑Prinzip der Selbstbestimmungstheorie (SDT) [5][13].

9. **Fügen Sie eine kooperative Ebene neben dem individuellen Ranking hinzu: Klassen‑/Familien‑Summen.** Laut Johnson & Johnsons Evidenz [6] fügen Sie für den Klassenmodus eine Klassen‑ oder Team‑Metrik (kombinierte richtige Antworten, kombinierte Serien‑Tage) hinzu, die gemeinsam Erfolg oder Misserfolg hat und Peer‑Ermutigung als zweiten Motivationskanal nutzt.

10. **Schützen Sie strukturell vor Sandbagging/Smurfing, nicht durch Vertrauen.** Neue Konten erhalten hohe RD/σ, sodass frühe Siege eines Smurfs innerhalb weniger Sitzungen selbst korrigiert werden [8]. Kennzeichnen Sie Konten mit anomal hoch variierenden Ergebnissen zur Überprüfung, anstatt Sandbagging allein durch Regel zu verhindern.

11. **Setzen Sie Saison‑Ranglisten zurück, behalten Sie jedoch θ/RD/σ über Saisons hinweg persistent.** Öffentliche wöchentliche Ligen‑Ranglisten sollten jede Periode zurückgesetzt werden; die private Fähigkeitsabschätzung sollte bestehen bleiben und während Lücken einfach an Unsicherheit gewinnen — derselbe Anti‑Inflations‑Mechanismus, den reale Systeme nutzen, und er vermeidet, ein Kind nach einer schulfreien Pause zu bestrafen.

12. **Lassen Sie Spiel‑/Belohnungs‑Mechaniken nicht den Mathematik‑Inhalt überholen.** Prodigys dokumentierte Kritik bezieht sich speziell auf Spiel‑Fortschritt‑/Monetarisierungs‑Mechaniken, die die Mathematik‑Übungszeit verwässern [14][15][16]; begrenzen Sie den Anteil der Sitzungszeit, der im nicht‑mathematischen Spiel‑Loop verbracht wird, und ordnen Sie jedes Punkt‑/XP‑Ereignis einem tatsächlich beantworteten Mathematik‑Problem zu.

13. **Berichten Sie über Ranglisten‑Effekte nach Rangposition in den eigenen Analysen von Math Challenge.** Da die Kernkritik der Literatur darin besteht, dass die meisten Studien nur einen durchschnittlichen Effekt melden [1][2][3], statten Sie das Produkt aus, um Retention/Engagement separat für Top‑Band, Mittel‑Band und Bottom‑Band Nutzer innerhalb jeder Liga zu verfolgen — der einzige Weg, das Muster „unten disengagiert“ frühzeitig zu erkennen.

14. **Für den Klassenmodus lassen Sie den Lehrer die Wettbewerbsintensität pro Raum wählen.** Geben Sie Lehrern einen pro‑Raum‑Schalter zwischen individuellem Rangmodus, kooperativem Team‑Modus oder rang‑verstecktem Übungsmodus — die Erkenntnisse der SDT/kooperativen Lernens werden so zu einer echten Steuerung statt einer festen globalen Richtlinie [5][6].

## Offene Fragen für den Projektinhaber

1. Soll die globale Rangliste nach rohem θ ranken oder nach einer begrenzten/normalisierten Transformation (z. B. Perzentil innerhalb einer klassenstufen‑abgestimmten Kohorte) — rohes θ ist „ehrlicher“, das Perzentil für ein Kind leichter verständlich, ohne dass es eine Bewertungszahl verstehen muss?

2. Welche Bewertungsperioden‑Kadenz — täglich oder pro Sitzung — passt zur erwarteten Spielhäufigkeit von Math Challenge? Dies beeinflusst den RD‑Abfall von Glicko‑2.

3. Soll die Degradierung für das jüngste Klassen‑Band jemals vollständig ausgesetzt werden, oder reicht weiche Degradierung (untere 10 %, nur aktive) für alle Altersgruppen aus?

4. Soll der pro‑Raum‑Wettbewerbs‑Intensitäts‑Schalter des Lehrers eine einmalige Raumeinstellung sein oder mittwochs anpassbar, und führt eine Änderung dazu, dass die Rangliste dieser Woche zurückgesetzt wird?

5. Gibt es Interesse, „Verbesserung gegenüber der eigenen Historie“ bereits beim Start als erstklassige Metrik für das untere Band zu implementieren, oder ist das erst für eine spätere Iteration vorgesehen?

6. Soll die Schwierigkeit neuer Items vom Lehrplan vorgegeben werden (klassenstufen‑basierte Heuristik) mit Online‑IRT‑Verfeinerung ab dem ersten Tag, oder zunächst nur Lehrplan‑basiert starten und IRT‑Kalibrierung hinzufügen, sobald genügend Antwortdaten vorliegen?

## Quellen

1. Christy, K. R., & Fox, J. (2014). „Leaderboards in a virtual classroom: A test of stereotype threat and social comparison explanations for women's math performance.“ *Computers & Education*, 78. https://psycnet.apa.org/record/2014-34088-008  
2. Der Einsatz von Ranglisten in gamifizierten Bildungskontexten: Ein systematischer Überblick (2023). https://www.researchgate.net/publication/369118313_The_use_of_leaderboards_in_gamified_educational_settings_A_systematic_review  
3. Meta‑Analyse der Gamification‑Effekte auf Lernresultate von Studierenden (41 Studien, 5.071 Teilnehmende). https://pmc.ncbi.nlm.nih.gov/articles/PMC10591086/  
4. Festinger, L. (1954). Social comparison theory — Überblick und spätere Forschung (aufwärts/abwärts Vergleich). https://en.wikipedia.org/wiki/Social_comparison_theory  
5. Self‑Determination Theory (Deci & Ryan) — offizielle Theorieseite. https://selfdeterminationtheory.org/theory/  
6. Johnson, D. W., Maruyama, G., Johnson, R., & Nelson, D. (1981). „Effects of Cooperative, Competitive, and Individualistic Goal Structures on Achievement: A Meta‑Analysis.“ https://psycnet.apa.org/record/1981-05387-001  
7. Elo rating system — Formel, K‑Faktor, bekannte Inflationsprobleme. https://en.wikipedia.org/wiki/Elo_rating_system  
8. Glickman, M. E. „Example of the Glicko-2 system“ (offizielle Spezifikation). http://www.glicko.net/glicko/glicko2.pdf  
9. TrueSkill Ranking System (Microsoft Research Projektseite). https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/  
10. OpenSkill‑Dokumentation (Weng‑Lin Bayessche Bewertungsmodelle, Open‑Source‑Alternative zu TrueSkill). https://openskill.me/en/stable/  
11. Item Response Theory — Fähigkeitsparameter, Item‑Schwierigkeit/Unterscheidungsfähigkeit, logistisches Modell. https://en.wikipedia.org/wiki/Item_response_theory  
12. World Handicap System (Golf) — Handicap‑Index, Course Rating, Slope Rating‑Normalisierung. https://en.wikipedia.org/wiki/World_Handicap_System  
13. "How Duolingo Leaderboards and Leagues Work" (Duolingo‑Blog); Details zu Gruppengröße/Design‑Rationalität via Fallstudie. https://blog.duolingo.com/duolingo-leagues-leaderboards/ ; https://trophy.so/blog/duolingo-gamification-case-study  
14. Fairplay for Kids — „Prodigy's Losing Equation“ (FTC‑Beschwerde‑Berichterstattung). https://fairplayforkids.org/prodigy-losing-equation/  
15. NBC News — „Child protection nonprofit alleges manipulative upselling“ zu Prodigy. https://www.nbcnews.com/tech/tech-news/child-protection-nonprofit-alleges-manipulative-upselling-math-game-prodigy-n1258294  
16. National Education Policy Center — Newsletter‑Review der von Prodigy in Auftrag gegebenen Johns‑Hopkins‑Studie. https://nepc.colorado.edu/publication/newsletter-prodigy-032521  
17. Financial Times — Berichterstattung über die Prodigy‑FTC‑Beschwerde von über 20 Advocacy‑Organisationen. https://www.ft.com/content/38d9d4e7-da71-42d0-bcb8-316a1fc371a3  

## Hinweise zu Forschungseinschränkungen

Mehrere Hinweise konnten nicht unabhängig verifiziert werden und werden bewusst **not** als Fakt oben zitiert: die genaue aktuelle Ranglisten‑Konfiguration von Khan Academy und die exakte Bewertungs‑Änderungs‑Formel von Codeforces (beide lieferten HTTP 403 bei Abruf), sowie das detaillierte Belohnungs‑Mechanik‑Design von Mathletics/Live Mathletics (Support‑Inhalte hinter Login). Wo Befunde diese Produkte erwähnen, beziehen sie sich nur auf das, was unabhängig bestätigt wurde, und werden dort, wo dies nicht der Fall ist, als unbestätigt gekennzeichnet (§9).
