# Intelligent Tutoring Systems and Learner Modelling: BKT, DKT, PFA, and the Math Garden Elo Approach

> Math Challenge research — 2026-07-31 — topic 13

## Zusammenfassung (ES)

- BKT (Corbett & Anderson 1995) modelliert das Domänenmodell einer Fähigkeit mit vier Parametern — `P(L0)` Anfangsbeherrschung, `P(T)` Lernwahrscheinlichkeit, `P(G)` Rate für Raten, `P(S)` Rate für „Slip“ — mit weit verbreiteten Beispielwerten `P(L0)=0.36, P(T)=0.1, P(G)=0.3, P(S)=0.05` [1].
- Cognitive Tutor (Motor von MATHia) kombiniert „model tracing“ (Produktionsregeln Schritt für Schritt) mit knowledge tracing (aggregiertes Fähigkeits‑Domänenmodell); es sind unterschiedliche Mechanismen, die oft verwechselt werden [2].
- Die Wirksamkeitsnachweise sind gemischt: Das What Works Clearinghouse (2016) stuft Cognitive Tutor Algebra I als „gemischte Effekte“ in Algebra (+4 Punkte, Bereich -7 bis +19) und als „keine erkennbaren Effekte“ im allgemeinen Leistungsniveau ein; Geometry zeigte potenziell negative Effekte (-8) [3].
- Der RAND‑Versuch (Pane et al. 2014) fand keinen Effekt in Jahr 1 und etwa 0,21 Standardabweichungen in Jahr 2 — die Wirksamkeit hing von der Implementierungstreue ab [4].
- DKT (Piech et al. 2015) berichtete AUC 0,86 gegenüber 0,68 für BKT in ASSISTments, aber Khajah et al. (2016) zeigten, dass der Vergleich unfair war: gut repliziertes BKT erreicht 0,73, und erweiterte Varianten nähern sich DKT an [5][6].
- PFA und AFM sind logistische Regressionsalternativen zu BKT: sie zählen frühere richtige/falsche Antworten pro Wissenskomponente ohne verborgenen bayesschen Zustand [7][8].
- Das hier relevanteste System ist Math Garden (Rekentuin, Universität Amsterdam / Oefenweb): eine Elo‑Variante, die Fähigkeit und Item nach jeder Antwort neu schätzt, ohne Batch‑Kalibrierung [9].
- Seine Regel „high-speed high-stakes“ (HSHS, Maris & van der Maas 2010/2012) kombiniert Genauigkeit und Zeit: `score = a_i · (d_i − RT) · (2·acc − 1)`, mit `d_i` Zeitlimit, `a_i` Skalierungsfaktor, `acc ∈ {0,1}` [10].
- Unter dieser Regel ist das Treffer‑Modell exakt das 2PL‑Modell von TRI, wobei `d_i` als Diskriminationsparameter dient — eine Brücke zwischen klassischer TRI und Echtzeit‑Bewertung [10].
- Math Garden wählt Items für etwa 75 % Erfolgsrate, konsistent mit der Literatur zur „wünschenswerten Schwierigkeit“ (optimales Bandbreite etwa 70‑85 %) [9][11].
- Konvergente Validität von HSHS mit CITO: r=0,78‑0,84; im Schach korrelierte HSHS stärker mit FIDE als die einfache Zählung [10].
- Empfehlung: zuerst Elo/HSHS implementieren (nicht das vollständige BKT) — es benötigt nur einen Faktor K/Unsicherheit, aktualisiert in O(1) pro Antwort (ideal für Durable Objects) und ist bereits in einem fast identischen Bereich (Kinderarithmetik) validiert.

## Executive summary (EN)

ITS research splits into two often-conflated lineages: **model tracing** (tracing a student's step-by-step solution against production rules — Cognitive Tutor's original mechanism) and **knowledge tracing** (tracking aggregate skill mastery across attempts — Bayesian Knowledge Tracing and successors) [2]. Efficacy evidence for the flagship model-tracing product, Carnegie Learning's Cognitive Tutor/MATHia, is genuinely mixed: the What Works Clearinghouse's 2016 review rates it "mixed effects" on algebra, "no discernible effects" on general math achievement, and "potentially negative" for the Geometry variant [3]. RAND's large randomized trial found no year-one effect and a modest 0.21 SD effect in year two, contingent on implementation fidelity [4] — adaptive tutoring is not automatically effective.

Bayesian Knowledge Tracing (BKT) is a four-parameter hidden Markov model (initial mastery, learning rate, guess, slip) with closed-form update equations [1]. Deep Knowledge Tracing (DKT, Piech et al. 2015) replaced this with an LSTM and reported large AUC gains, but a rigorous replication (Khajah, Lindsey & Mozer 2016) found the original comparison undersold BKT, and that extended BKT closes most of the gap [5][6]. Performance Factors Analysis and the Additive Factors Model offer a simpler logistic-regression alternative that fits incrementally [7][8].

The most directly applicable prior art is **Math Garden (Rekentuin)**, built at the University of Amsterdam, commercialized as Oefenweb/Prowise Learn: a computer-adaptive arithmetic practice system for children that updates learner ability and item difficulty after every response using an Elo variant combined with the **high-speed high-stakes (HSHS) scoring rule** (Maris & van der Maas, 2010/2012), scoring each attempt on both correctness and response time [9][10]. This is the basis of the concrete recommendation below.

## Ergebnisse

### 1. Modellverfolgung vs. Wissensverfolgung

Die ursprüngliche Architektur von Cognitive Tutor beruht auf **model tracing**: Schüleraktionen werden Schritt für Schritt mit einem Expertenmodell verglichen, das aus Produktionsregeln (ACT‑R kognitive Aufgabenanalyse) aufgebaut ist und just‑in‑time, kontextsensitive Hinweise ermöglicht [2]. Darauf aufbauend überwacht **knowledge tracing** die schrittweise Beherrschung jeder Fähigkeit (knowledge component) über die Problemlösungsaktivitäten hinweg und aktualisiert die Wahrscheinlichkeit, dass eine Regel „bekannt“ ist, jedes Mal, wenn sie angewendet wird, unabhängig davon, aus welchem konkreten Problem der Schritt stammt [1][2]. Für ein in sich abgeschlossenes Arithmetik‑/Logik‑Spiel wie Math Challenge – diskrete, klar definierte Items statt offener mehrschrittiger Beweise – ist knowledge tracing (oder sein Elo‑Verwandter) der relevante Mechanismus; vollständiges model tracing eignet sich zum Schritt‑prüfen von Algebra‑/Geometrie‑Derivationen und wird hier wahrscheinlich nicht benötigt.

### 2. Bayesian Knowledge Tracing: die vier Parameter und Aktualisierungsgleichungen

BKT (Corbett & Anderson, 1994/1995) hat vier Parameter pro Fähigkeit: `P(L0)` (initial probability the skill is known), `P(T)` (probability of transitioning from unknown to known on any opportunity), `P(G)` (probability of guessing correctly while unknown), `P(S)` (probability of a slip — an incorrect answer despite knowing the skill) [1].

Nach van de Sande (2013) lauten die beiden maßgeblichen Gleichungen:

- Learning update: `P(Lj) = P(Lj-1) + P(T)·(1 − P(Lj-1))`
- Predicted correctness: `P(Cj) = P(G)·(1 − P(Lj)) + (1 − P(S))·P(Lj)`

und das online (per‑observation) posterior update, das vom Echtzeit‑„Knowledge Tracing Algorithm“ verwendet wird, ist Bayes‑Regel angewandt auf das beobachtete Ergebnis, anschließend ein Lernschritt weiter:

- If correct: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)(1−P(S))] / [P(Lj-1|Oj-1)(1−P(S)) + (1−P(Lj-1|Oj-1))·P(G)]`
- If incorrect: `P(Lj-1|Oj) = [P(Lj-1|Oj-1)·P(S)] / [P(Lj-1|Oj-1)·P(S) + (1−P(Lj-1|Oj-1))·(1−P(G))]`
- Then: `P(Lj|Oj) = P(Lj-1|Oj) + [1 − P(Lj-1|Oj)]·P(T)`

Ein häufig genutztes Beispiel‑Parameter‑Set (entsprechend dem illustrativen Modell von Baker et al. 2008, reproduziert in van de Sandes Abb. 3) ist `P(S)=0.05, P(G)=0.3, P(T)=0.1, P(L0)=0.36` [1]. Van de Sande beweist zudem, dass BKT nur wohlverhalten (monoton nicht‑degeneriert) ist, wenn `P(G)+P(S) < 1`, und dass seine versteckte‑Markov‑Form nur bis zu drei kombinierten Parametern identifizierbar ist, sofern nicht der rekursive per‑observation‑Algorithmus verwendet wird – ein veröffentlichter Hinweis zur Parameteranpassung, nicht bloß ein Implementierungsdetail [1].

### 3. Evidenz zur Wirksamkeit — gemischt, nicht durchweg positiv

Der WWC‑Bericht vom Juni 2016 prüfte 22 Kandidatenstudien, 7 erfüllten die Gruppen‑Design‑Standards, und umfassten 12.840 Schüler an 118 Standorten [3]. Bewertungen: Cognitive Tutor Algebra I → **mixed effects** auf Algebra (Improvement Index +4, Range −7 bis +19, 5 Studien/12.182 Schüler, „medium to large“ evidence) und **no discernible effects** auf allgemeine Mathematikleistung (+2, 1 Studie, „small“ evidence); Cognitive Tutor Geometry → **potentially negative effects** (−8, 1 Studie, „small“ evidence) [3]. RANDs cluster‑randomisierte Studie (Pane et al., 2014) fand keinen Unterschied im ersten Jahr und einen signifikanten +0,21 SD‑Effekt im zweiten Jahr (≈50. → 58. Perzentil), größtenteils auf die Reife der Implementierung zurückgeführt [4]. Fazit: Der Effekt ist bescheiden und implementierungsabhängig, kein garantierter Gewinn allein durch den Algorithmus.

### 4. Deep Knowledge Tracing und die Fairness‑Kontroverse

Piech et al. (2015) stellten DKT vor, das Interaktionssequenzen mit einem LSTM modelliert: AUC 0,86 auf ASSISTments (vs. 0,68 BKT) und 0,85 auf Khan Academy (vs. 0,68 BKT, 0,63 marginal baseline) [5], gelesen als Beweis, dass Deep Learning BKT dominiert. Khajah, Lindsey & Mozer (2016) zeigten, dass der Vergleich BKT unterschätzte: eine korrekte Re‑Implementierung erreichte 0,73 (vs. 0,67 berichtet) auf denselben Daten, und die Erweiterung von BKT um Forgetting, pro‑Student‑Fähigkeit und Skill‑Discovery schloss den größten Teil der Lücke [6]. Lektion: Man darf nicht automatisch annehmen, dass ein ausgefeilteres Modell ein gut abgestimmtes einfaches übertrifft, ohne es zu prüfen – DKT’s Daten‑/Rechen‑Bedarf (lange Sequenzen, undurchsichtige Skills) passt zudem schlecht zu einem Produkt, das von Anfang an interpretierbare, cold‑start‑freundliche Schwierigkeitsgrade benötigt.

### 5. Performance Factors Analysis und das Additive Factors Model

AFM (Cen, Koedinger & Junker) modelliert Korrektheit mittels logistischer Regression über drei additive Terme pro Knowledge Component: Student‑Ability‑Intercept, KC‑Easiness‑Intercept und eine KC‑Learning‑Rate‑Steigung multipliziert mit vorherigen Gelegenheiten [7]. PFA (Pavlik, Cen & Koedinger, 2009) erweitert dies, indem der „opportunity count“ durch **separate counts of prior successes and failures** pro KC ersetzt wird [7][8]. Beide passen online mittels inkrementeller logistischer Regression, benötigen keinen EM/Grid‑Search‑Durchlauf wie vollständiges BKT.

### 6. Elo/IRT‑basierte adaptive Schwierigkeit und Math Garden im Detail

Der Kern von IRT: Die Korrektheitswahrscheinlichkeit ist eine logistische Funktion von latenter Fähigkeit minus Item‑Schwierigkeit (1PL), optional skaliert durch Discrimination (2PL) und einen Guessing‑Floor (3PL); adaptives Testen wählt nach jeder Antwort das unbeantwortete Item, das die Information bei der aktuellen Fähigkeits­schätzung maximiert [12]. Duolingos Half‑Life Regression (Settles & Meeder 2016) ist verwandt, aber eigenständig: Sie passt eine exponentielle Vergessenskurve pro Item/Student aus linguistischen/History‑Features an, um den Vergessenszeitpunkt vorherzusagen und das Timing von Spaced‑Repetition zu optimieren statt die Schwierigkeit zu steuern [13].

**Math Garden (Rekentuin)**, aus der Abteilung Psychologische Methoden der Universität Amsterdam (2007), heute kommerzialisiert von Oefenweb/Prowise Learn, ist das engste Gegenstück zu Math Challenges Ziel, Geschwindigkeit und Genauigkeit gemeinsam zu bewerten [9]. Es verwendet eine Elo‑Variante (1978), bei der Schüler‑Fähigkeit und Item‑Schwierigkeit nach jedem beantworteten Item neu geschätzt werden – keine Offline‑Kalibrierungs‑Batch, wodurch eine Kalibrierung frisch erstellter Inhalte on‑the‑fly möglich ist [9]. Items der Validierung 2011 wurden so gezogen, dass sie eine mittlere Erfolgswahrscheinlichkeit von **0,75** anstreben [9], genau im 70–80 %‑Band, das dieses Projekt anvisiert, und wurden empirisch gegen reale Kinderleistungen validiert.

Der Scoring‑Mechanismus – direkt aus Klinkenbergs Paper „High Speed High Stakes Scoring Rule“ entnommen – geht zurück auf van der Maas & Wagenmakers (2005), die jedem Item ein Zeitlimit `d` gaben und eine Antwort als verbleibende Zeit multipliziert mit binärer Genauigkeit bewerteten: `score = acc · (d − RT)` (0 bei falscher Antwort, schneller = höheres Ergebnis bei richtiger) [10]. Das belohnte riskantes Raten bei zu schweren Items (Raten war kostenlos), sodass Maris & van der Maas (2010) die Genauigkeit symmetrisch machten (`{-1,+1}` statt `{0,1}`):

**`score = a_i · (d_i − RT) · (2·acc − 1)`**

wobei `d_i` das Zeitlimit des Items, `RT` die Reaktionszeit, `acc ∈ {0,1}` die Korrektheit und `a_i` ein Skalierungsfaktor des Items ist – eine schnelle falsche Antwort wird stark negativ, wodurch das Anreiz‑Raten‑und‑Aufgeben entfernt wird [10]. Maris & van der Maas (2012, Psychometrika) bewiesen, dass unter dieser Regel das implizite Probability‑of‑Correct‑Modell **exactly the 2PL IRT model** ist, wobei das Zeitlimit `d` als Item‑Discrimination wirkt – eine saubere Brücke zwischen einer Echtzeit‑Scoring‑Regel und klassischer IRT [10]. Empirisch validiert: HSHS‑Ratings korrelierten r=0,78–0,84 mit niederländischen CITO‑Scores über vier arithmetische Operationen, und in einem Schach‑Datensatz (CORUS 2008) korrelierten stärker mit FIDE‑Elo (r=0,808) als mit einfacher Summen‑Korrektheit (r=0,575) [10].

### 7. Praktische Elo‑Mechanik für adaptive Item‑Auswahl

Die breitere Literatur zu Elo im adaptiven Lernen (Pelánek, „Applications of the Elo Rating System in Adaptive Educational Systems“) beschreibt das gleiche zweiseitige Update wie im Schach: Nach jedem Versuch nähern sich Lernenden‑Rating und Item‑Schwierigkeit proportional zur Überraschung (tatsächliches Ergebnis minus erwartetes Ergebnis, logistische Funktion der Rating‑Differenz) an, skaliert durch eine „uncertainty function“, die die Rolle des Schach‑K‑Faktors übernimmt – am größten für brandneue Items/Lernende, schrumpft mit zunehmender Beobachtungszahl [14]. Dies ist der unten empfohlene Mechanismus.

## Designimplikationen für Math Challenge

1. **Implementieren Sie zunächst ein Math‑Garden‑ähnliches Elo/HSHS‑Modell, nicht das vollständige BKT.** BKT erfordert das Anpassen von Parameter‑pro‑Skill (Gitter‑Suche oder EM), bevor es sinnvoll funktioniert [1]; Elo‑mit‑HSHS aktualisiert die Lernenden‑Bewertung und die Item‑Bewertung pro Versuch in geschlossener Form, ohne Offline‑Kalibrierung — ideal für eine große, wachsende Item‑Bank, die vom ersten Tag an live ist.

2. **Konkrete Scoring‑Formel:** für ein zeitlich begrenztes Item mit Limit `d_i` (Sekunden), Reaktionszeit `RT`, Korrektheit `acc ∈ {0,1}`: `score = a_i · (d_i − RT) · (2·acc − 1)`, wobei `RT` auf `d_i` gekürzt wird, falls es das Limit überschreiten kann [10]. Beginnen Sie mit `a_i = 1` für alle Items; führen Sie die Diskriminierung pro Item erst ein, wenn genügend Daten zur Schätzung vorliegen (Maris & van der Maas zeigen, dass `a_i`/`d_i` mit der 2PL‑Diskriminierung verknüpft sind) [10].

3. **Aktualisierungsregel:** `expected = 1 / (1 + 10^(-(ability − difficulty)/400))` (standard Elo‑logistische Funktion), `actual = score / (a_i·d_i)` reskaliert auf `[0,1]`, dann `ability += K_learner · (actual − expected)` und `difficulty −= K_item · (actual − expected)` [9][14].

4. **K‑Faktor‑Plan:** die Unsicherheitsfunktion abklingen lassen statt eines konstanten K — groß (z. B. ≈0,5–1,0) für die ersten ~10–20 Versuche eines Lernenden oder Items, danach schrumpfend zu einem kleinen Gleichgewicht (≈0,05–0,1), was das Cold‑Start‑vs‑Steady‑State‑Handling in Elo‑basierten Bildungssystemen nachahmt [14]. Verfolgen Sie einen Versuchs‑Zähler pro Lernenden‑Skill und pro Item, um dieses Abklingen zu steuern.

5. **Die Schwierigkeits­schätzung von Items ist per Definition online:** jeder Versuch an Item `i` justiert dessen Schwierigkeits‑Rating, sodass ein brandneues Item nach wenigen Antworten eine vorläufige Schwierigkeit erhält, ohne Vortest — der größte praktische Vorteil von Elo gegenüber BKT/DKT/PFA, die eine feste Taxonomie und/oder einen Batch‑Fit‑Schritt voraussetzen [1][7][9].

6. **Ziel‑Erfolgsrate für die Item‑Auswahl: 70–80 %, zentriert bei etwa 75 %**, passend zum validierten 0,75‑Ziel von Math Garden [9] und der breiteren Literatur zu wünschenswerter Schwierigkeit [11]. Bei der Auswahl des nächsten Items für die Fähigkeit `θ` wählen Sie aus Items, deren Schwierigkeit `β_i` `expected(θ, β_i)` in `[0.70, 0.80]` legt; ziehen Sie unter den 3–5 nächst‑ähnlichen Schwierigkeits‑Items statt immer das einzig nächstliegende, um sichtbar repetitive Sprünge zu vermeiden.

7. **Mindest‑D1‑Schema pro Versuch:** `attempt_id, learner_id, item_id, skill_id(s), timestamp, response_time_ms, time_limit_ms, correct, raw_score, learner_rating_before/after, item_difficulty_before/after, k_factor_used, context flags (input_method, hint_used), sequence_index_in_session`. Das Speichern von Vor‑ und Nach‑Ratings (nicht nur des aktuellen Zustands) macht die Historie prüfbar und wiederholbar und unterstützt den Offline‑Vergleich mit einem späteren BKT/PFA‑Experiment, ohne erneutes Instrumentieren.

8. **Trennen Sie Item‑Schwierigkeit von Metadaten zur Inhalts‑Schwierigkeit.** Speichern Sie ein vom Autor zugewiesenes Klassen‑/Level‑Tag unabhängig vom Live‑Elo‑Rating; verwenden Sie es nur als Cold‑Start‑Prior (Startwert nahe dem Mittelwert der gleich getaggten Items), sodass das Live‑Rating nach ~10 Antworten übernimmt — das verhindert, dass ein falsch getaggtes Item nie zu Lernenden geleitet wird, die seine wahre Schwierigkeit enthüllen würden.

9. **Durable Object für den Hot‑Path, D1 als Ledger.** Elo's O(1)‑Update pro Ereignis passt zu einem Durable Object, das die Live‑Bewertung eines Lernenden (und einen Teil der heißen Item‑Ratings) hält, wobei jeder Versuch als Append‑Only‑D1‑Zeile geschrieben wird; das vermeidet Lese‑Modifikations‑Schreib‑Rennen auf geteilten Item‑Zeilen, die ein naives D1‑nur‑Design bei echter Parallelität erfährt.

10. **Verzögern Sie BKT/PFA/DKT auf eine v2‑„Skill‑Mastery“‑Schicht**, nicht auf die v1‑Item‑Auswahl. Sobald genügend D1‑Historie vorhanden ist, kann ein nächtlicher BKT/PFA‑Batch pro fein‑granularem Skill Mastery‑Dashboards und eltern‑gerichtete Signale versorgen — eine andere Ebene als die Echtzeit‑Auswahl, und ein frühes Mischen birgt das Risiko, die DKT/BKT‑Fairness‑Falle zu wiederholen [5][6].

11. **Erwarten Sie nicht, dass der Algorithmus allein Lernzuwächse garantiert.** WWC's gemischte/null/negative Befunde für ein ausgereiftes Produkt [3] und RANDs null‑Ergebnis im ersten Jahr [4] zeigen, dass adaptive Schwierigkeit notwendig, aber nicht hinreichend ist. Führen Sie A/B‑Tests des Lernenden‑Modells gegen eine einfache feste Leiter durch, bevor Sie Engagement‑Gewinne speziell Elo zuschreiben.

12. **Schützen Sie sich vor riskanten Rat‑Exploits.** Die `(2·acc−1)`‑Transformation dient dazu, schnelle falsche Antworten kostspielig zu machen [10] — prüfen Sie im QA, dass das schnelle Zufalls‑Antworten nicht das echte Engagement übertrifft, besonders bei jungen Nutzern, die die Anreizstruktur nicht wie erwachsene Testteilnehmer lesen.

## Offene Fragen für den Projektinhaber

1. Soll das Zeitlimit `d_i` pro Item fest nach Alters‑/Klassen‑Band sein, oder selbst ein live‑geschätzter Parameter (gemäß dem 2PL‑Äquivalenz‑Ergebnis)?
2. Für sehr junge Nutzer (Alter 4‑6), die möglicherweise keinen Timer‑UI zuverlässig bedienen können, sollte HSHS überhaupt angewendet werden, oder sollte frühkindlicher Inhalt nur eine Genauigkeits‑Regel nutzen, bis das Kind alt genug für zeitgesteuertes Spielen ist?
3. Ein globaler Elo‑Skala pro Lernender, oder domänenspezifische Skalen (Arithmetik vs. Logik vs. Geometrie), die nicht direkt vergleichbar sind?
4. Ist ein nächtlicher Batch‑BKT/PFA‑Mastery‑Layer (§10) im gleichen Meilenstein wie der Live‑Elo‑Selektor vorgesehen, oder in einer späteren Phase?
5. Welche Cold‑Start‑Fehlertoleranz ist für brandneue Items akzeptabel — wie viele Antworten, bevor ein Schwierigkeits‑Rating „vertrauenswürdig“ genug ist, um breit zu routen?

## Quellen

1. Van de Sande (2013). „Eigenschaften des Bayesian Knowledge Tracing Modells.“ JEDM 5(2). https://files.eric.ed.gov/fulltext/EJ1115329.pdf  
2. Koedinger & Corbett (2006). „Cognitive Tutors — Modell‑Tracing vs. Knowledge‑Tracing.“ PACT Center, CMU. https://pact.cs.cmu.edu/pubs/koedingercorbett06.pdf  
3. What Works Clearinghouse (Juni 2016). „Cognitive Tutor“ Interventionsbericht. https://ies.ed.gov/ncee/wwc/Docs/InterventionReports/wwc_cognitivetutor_062116.pdf  
4. Pane, Griffin, McCaffrey & Karam (2014). „Wirksamkeit von Cognitive Tutor Algebra I im großen Maßstab.“ RAND. https://www.rand.org/pubs/research_briefs/RB9746.html  
5. Piech et al. (2015). „Deep Knowledge Tracing.“ NeurIPS 28. https://arxiv.org/pdf/1506.05908  
6. Khajah, Lindsey & Mozer (2016). „Wie tief ist Knowledge Tracing?“ https://arxiv.org/pdf/1604.02416  
7. Pavlik, Cen & Koedinger (2009). „Performance Factors Analysis.“ https://files.eric.ed.gov/fulltext/ED506305.pdf  
8. Cen, Koedinger & Junker — Additive/Instructional Factors Analysis. https://www.cs.cmu.edu/~ggordon/chi-etal-ifa.pdf  
9. Klinkenberg, Straatemeier & van der Maas (2011). „Computer‑adaptive Praxis von Mathe‑Fähigkeiten …“ Computers & Education 57, 1813–1824. https://www.klinkenberg.amsterdam/publication/math-garden/  
10. Klinkenberg, „High Speed High Stakes Scoring Rule“ (SURF‑Report), aufbauend auf Maris & van der Maas (2012) Psychometrika 77, 615–633. https://www.surf.nl/files/2019-04/Artikel%20High%20Speed%20High%20Stakes%20Scoring%20Rule.pdf ; https://link.springer.com/article/10.1007/s11336-012-9288-y  
11. Wilson et al. (2019). "The Eighty Five Percent Rule for optimal learning." Nature Communications. https://www.nature.com/articles/s41467-019-12552-4  
12. IRT‑Grundlagen (1PL/2PL/3PL, adaptive Auswahl via maximaler Information). https://www.cogn-iq.org/learn/theory/item-response-theory/  
13. Settles & Meeder (2016). „Ein trainierbares Spaced‑Repetition‑Modell für Sprachenlernen“ (Duolingo HLR). ACL. https://research.duolingo.com/papers/settles.acl16.pdf  
14. Pelánek. „Anwendungen des Elo‑Rating‑Systems in adaptiven Bildungssystemen.“ Computers & Education. https://www.fi.muni.cz/~xpelanek/publications/CAE-elo.pdf
