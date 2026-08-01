# Feedback and Formative Assessment in Mathematics — Evidence for an AI Tutor

> Math Challenge research — 2026-07-31 — topic 11

## Zusammenfassung (ES)

- Hattie & Timperley (2007): Wirksames Feedback beantwortet drei Fragen — „Wohin gehe ich?“, „Wie gehe ich?“, „Wohin gehe ich weiter?“ — auf vier Ebenen: Aufgabe, Prozess, Selbstregulation und „Ich“. Die Ebene „Ich“ (generische Lobäußerungen) ist am wenigsten wirksam [1].
- Kluger & DeNisi (1996), Meta‑Analyse von 607 Effektgrößen: Feedback verbessert die Leistung im Durchschnitt (d=0,41), aber **mehr als ein Drittel der Feedback‑Interventionen verschlechterten sie** — die Botschaft „Feedback hilft immer“ ist falsch [2].
- Black & Wiliam (1998) überprüften >250 Studien: Gut implementierte formativen Bewertung erzeugt Effektgrößen von 0,4–0,7, größer als fast jede andere Bildungsintervention, und reduziert insbesondere die Leistungslücke bei leistungsschwachen Schüler*innen [3].
- Der Zeitpunkt (sofort vs. verzögert) ist weniger wichtig als der **Inhalt** des Feedbacks; eine aktuelle Meta‑Analyse von 51 Studien (160 Effektgrößen) fand keinen durchschnittlichen Unterschied nach Zeitpunkt, zeigte jedoch, dass Mathematik größere Effekte als andere Fächer erzielt und dass elaboriertes Feedback das reine Korrektur‑Feedback übertrifft [4][5].
- Shute (2008) unterscheidet vier Typen: Ergebniswissen (KR, nur richtig/falsch), Kenntnis der korrekten Antwort (KCR), elaboriertes Feedback (EF, erklärt das Warum) und „Answer‑Until‑Correct“ (AUC). EF gewinnt im Allgemeinen, aber ein Übermaß an Elaborierung kann überfordern und schädigen [5].
- Intelligenz zu loben („du bist sehr klug“) statt Anstrengung („du hast methodisch gearbeitet“) verringert die Ausdauer nach Misserfolg, erhöht die Zuschreibung einer festen Fähigkeit und führt dazu, leichtere Aufgaben zu wählen — klassisches Ergebnis von Mueller & Dweck (1998), 6 Studien [6].
- Übertriebenes Lob („unglaublich perfekt!“) sagt **niedrigeres** Selbstwertgefühl im Laufe der Zeit bei Kindern voraus, und bei Kindern mit bereits hohem Selbstwertgefühl prognostiziert es mehr Narzissmus; echtes, nicht übertriebenes Lob erzeugt keinen dieser Effekte — Brummelman et al. (2014, 2017) [7].
- Intelligente Tutorsysteme (ITS) mit schrittbasiertem Feedback erreichen d≈0,76, fast so wirksam wie ein menschlicher Tutor; Systeme, die nur die Endantwort bewerten, erzielen deutlich weniger (d≈0,40) — VanLehn (2011) [8].
- Aktuelle LLMs, ohne pädagogische Feinabstimmung, neigen dazu, **die Antwort zu früh preiszugeben** oder Erklärungen zu erzeugen, die zwar schrittweise logisch erscheinen, aber mathematische Fehler enthalten — MathDial (2023), MathTutorBench (2025) [9][10].
- Die randomisierte Studie Tutor CoPilot (2024, 783 Tutor*innen, große Stichprobe) zeigte, dass KI‑Vorschläge, die zu untersuchenden Fragen anregen (statt generischem Lob), die Beherrschung mathematischer Themen um 4 Prozentpunkte steigerten, mit größerem Gewinn bei Tutor*innen mit niedrigerer Bewertung [11].

## Zusammenfassung (EN)

- Hattie & Timperley (2007) fassen Feedback als Beantwortung von drei Fragen (Feed‑up / Feed‑back / Feed‑forward) über vier Ebenen (Aufgabe, Prozess, Selbstregulation, Selbst) — wobei Lob auf Selbst‑Ebene das schwächste Hebel ist [1].
- Kluger & DeNisis (1996) Meta‑Analyse von 607 Effektgrößen ist hier die wichtigste Warnung: Feedback hilft im Durchschnitt (d = ,41), aber **über ein Drittel der Feedback‑Interventionen reduzierten die Leistung**, vor allem, wenn die Aufmerksamkeit auf das Selbst statt auf die Aufgabe gelenkt wird [2].
- Black & Wiliam (1998) etablierten formatives Assessment als eine der wirkungsvollsten Bildungsinterventionen (d = 0,4–0,7 über 250+ Studien), die besonders leistungsschwache Lernende begünstigen [3].
- Der Zeitpunkt allein zeigt schwache, inkonsistente Effekte; eine Meta‑Analyse von 51 Studien (2024/2025) ergab, dass Mathematik größere Effekte als andere Fächer erzielt und dass die Ausarbeitung des Inhalts wichtiger ist als der Zeitpunkt [4][5].
- Shutes (2008) Taxonomie — KR, KCR, elaboriertes Feedback, answer‑until‑correct — zeigt, dass Elaborierung im Allgemeinen gewinnt, aber ein Übermaß nach hinten losgehen kann [5].
- Fähigkeitslob (Mueller & Dweck, 1998) untergräbt die Ausdauer und die Suche nach Herausforderungen nach Misserfolg im Vergleich zu Anstrengungs‑/Prozesslob [6]; übertriebenes Lob sagt langfristig geringeres Selbstwertgefühl voraus und führt bei bereits selbstwertstarken Kindern zu mehr Narzissmus (Brummelman et al., 2014/2017) [7].
- Schritt‑basiertes ITS‑Feedback erreicht fast die Wirksamkeit eines menschlichen Tutors (d ≈ 0,76 vs. 0,40 für reine Antwort‑Systeme) [8].
- Aktuelle LLM‑Tutor*innen, sofern sie nicht speziell trainiert wurden (MathDial, SocraticLM, Tutor CoPilot, MathTutorBench), neigen dazu, Antworten zu früh preiszugeben oder flüssige, aber mathematisch falsche Argumentationen zu erzeugen [9][10][12].
- Die einzige Live‑RCT zur KI‑unterstützten Nachhilfe (Tutor CoPilot, 2024) zeigte, dass die Verbesserungen vor allem auf reduziertem generischem Lob und vermehrten Nachfragen beruhten [11].

## Ergebnisse

### 1. Hattie & Timperleys Feedback‑Modell (2007)

Effektives Feedback beantwortet drei Fragen: „Wo gehe ich hin?“ (feed up), „Wie gehe ich?“ (feed back), „Wohin als Nächstes?“ (feed forward) [1]. Es wirkt auf vier Ebenen: **task**, **process** (Strategie/Methode), **self‑regulation** und **self** (persönliches Lob, „du bist so schlau“). Aufgaben‑/Prozess‑Feedback, das auf Selbstregulation abzielt, ist wirkungsvoll; Lob auf Selbst‑Ebene ist das schwächste der vier und kann die anderen verwässern, wenn es in einer Nachricht kombiniert wird (z. B. „Tolle Arbeit, du bist brillant!“ zusätzlich zu einem Hinweis auf Richtigkeit) [1].

### 2. Kluger & DeNisi (1996): Feedback kann schaden

Eine Meta‑Analyse von 607 Effektgrößen / 23.663 Beobachtungen fand einen positiven durchschnittlichen Effekt (d = ,41), aber **über ein Drittel der Feedback‑Interventionen verringerte die Leistung** [2]. Die Feedback‑Intervention‑Theorie erklärt die Aufspaltung: Feedback, das die Aufmerksamkeit auf das **self** (ego‑bezogen, vergleichend, Lob/Schuldzuweisung) lenkt, bindet Ressourcen vom Auftrag ab und kann die Leistung nach einem Misserfolg unterdrücken; Feedback, das die Aufmerksamkeit auf das **task** und die Lückenschließ‑Strategie richtet, hilft eher. Das ist die evidenzbasierte Grundlage dafür, „immer Feedback geben“ als falsch zu betrachten.

### 3. Black & Wiliam und die Evidenzbasis für formatives Assessment

Bei der Auswertung von 250+ Studien fanden Black & Wiliam (1998), dass formatives Assessment die Testergebnisse mit Effektgrößen von 0,4–0,7 erhöht – größer als die meisten pädagogischen Interventionen – wobei die größten Gewinne bei leistungsschwachen Schüler*innen erzielt wurden [3]. Bedingungen: Informationen müssen genutzt werden, um den Unterricht in nahezu Echtzeit anzupassen, Feedback muss sagen, wie die Lücke zu schließen ist (nicht nur, wie groß sie ist), und Lernende benötigen Ownership (Selbst‑/Peer‑Assessment). Das spricht für eine kontinuierliche formative Schleife (Versuch → Erklärung → Anpassung der nächsten Aufgabe) statt eines einmaligen End‑der‑Sitzung‑Berichts.

### 4. Timing: sofortiges vs. verzögertes Feedback

Eine aktuelle Meta‑Analyse (51 Studien, 1988–2024, 160 Effektgrößen) fand **keinen signifikanten durchschnittlichen Unterschied zwischen sofortigem und verzögertem Feedback**, aber Mathe‑Aufgaben zeigten größere Effekte als andere Fächer, und sofortiges Feedback steigerte das Lernenden‑Vertrauen in computerbasiertes Mathe‑Üben, ohne die Genauigkeitsgewinne zu verändern [4]. Elaborierung (was das Feedback sagt) war wichtiger als das Timing (wann es eintrifft) [4][5]. Fazit: Timing ist sekundär, Inhalt ist primär — aber Sofortigkeit hilft dennoch beim Vertrauen und verhindert, dass ein falsches Verfahren weiter geübt wird.

### 5. Taxonomie des Feedback‑Inhalts (Shute, 2008)

Shute unterscheidet **Knowledge of Results (KR)** (nur richtig/falsch), **Knowledge of Correct Response (KCR)** (gibt die Antwort an), **Elaborated Feedback (EF)** (erklärt warum, mit Hinweisen/Beispielen/Strategien) und **Answer‑Until‑Correct**. EF übertrifft im Allgemeinen KR/KCR, aber **exzessive Elaborierung kann nachteilig sein**, weil sie das Arbeitsgedächtnis überlastet [5]. Das spricht für elaboriertes, aber kurzes Feedback, nicht für ein erschöpfendes Nach‑unterrichten dessen, was ein*e Lernende*r bereits richtig hatte.

### 6. Lob für Anstrengung vs. Fähigkeit und übertriebenes Lob

Mueller & Dweck (1998, sechs Studien): Kinder, die für Intelligenz gelobt wurden, zeigten nach einem anschließenden Misserfolg weniger Ausdauer, weniger Freude, mehr niedrig‑fähigkeits‑Selbstzuschreibungen und schlechtere Leistungen als Kinder, die für Anstrengung/Strategie gelobt wurden; **92 %** der für Anstrengung gelobten Kinder wählten schwierigere Folgerätsel gegenüber **33 %** der für Intelligenz gelobten Kinder [6]. Brummelman et al. (2014, 2017) fanden, dass **übertriebenes** Lob langfristig geringeres Selbstwertgefühl und höheren Narzissmus bei Kindern mit bereits hohem Selbstwertvorhersagt; nicht‑übertriebenes, genaues Lob zeigte keinen Effekt [7]. Gemeinsam: Lob‑Prozess/Strategie, proportional halten, niemals feste Eigenschaften loben.

### 7. ITS/CAI‑Feedback‑Meta‑Analysen

VanLehn (2011): Intelligente Tutor‑Systeme erreichen d ≈ 0,58 gegenüber keiner Nachhilfe, fast so gut wie menschliche Tutor*innen. **Step‑based tutoring** (Feedback bei jedem Lösungsschritt) erreichte d ≈ 0,76 — fast so gut wie ein menschlicher Tutor — während **answer‑based systems** (Feedback nur zur Endantwort) nur d ≈ 0,40 erreichten [8]. Starke Botschaft: Kommentar zu Schritten/Arbeit, nicht nur zur Endantwort, wo immer das Format Zwischenschritte erfasst.

### 8. LLM‑generiertes Mathe‑Tutor‑Feedback (2023–2026)

MathDial (EMNLP 2023) erstellte 3.000 Tutor‑Dialoge, weil rohe LLMs „im Tutoring versagen“ — sie erzeugen falsches Feedback oder geben Lösungen zu früh preis („telling@k“) [9]. SocraticLM und PEARL trainieren Modelle, Antworten zurückzuhalten und stattdessen mit Fragen zu stützen [10][12]. MathTutorBench (EMNLP 2025): Lösungskompetenz **überträgt sich nicht** auf gutes Tutoring, Pädagogik und Kompetenz stehen im Trade‑off, und die Qualität verschlechtert sich über längere Dialoge [10]. LLMs produzieren zudem flüssige, aber falsche Gedankenketten, die sich von Antwort‑Enthüllungen unterscheiden [13]. Die einzige Feld‑RCT, Tutor CoPilot (2024, 783 Tutor*innen, ~350k Nachrichten), fand, dass KI‑Vorschläge mehr Nachfragen und **weniger generisches Lob** erzeugten, ein **4 pp**‑Meisterschafts‑Gewinn (p < 0,01), konzentriert bei schlechter bewerteten Tutor*innen [11]. Khanmigo‑Evaluierungen berichten, dass es rohes GPT‑4o beim Fehlerschluss übertrifft, und strukturierte Leistungs‑Signale verbesserten die Korrektheit des nächsten Items um ~6 % — die reguläre Nutzung bleibt jedoch niedrig (~15 %) [14].

### 9. Altersgerechte Formulierung

Frühkindliche Leitlinien (NAEYC, Wisconsin DCF) empfehlen **beschreibendes, spezifisches Feedback** statt generischem Lob („du hast die Bohnen wieder gezählt und dieselbe Zahl erhalten“ vs. „gute Arbeit“), da Spezifität einem Kind ermöglicht, das Feedback mit einer wiederholbaren Handlung zu verknüpfen [15]. Der Altersgradient verläuft von konkreter/sensorischer Sprache für kleine Kinder hin zu abstrakter metakognitiver Sprache (Strategie, warum, Transfer) für ältere Schüler*innen.

## Designimplikationen für Math Challenge

1. **Strukturiere jede Tutor‑Nachricht als Feed‑up / Feed‑back / Feed‑forward**: (a) das Ziel wiederholen, (b) sagen, was im Verhältnis dazu geschehen ist, (c) einen konkreten nächsten Schritt geben. Nie bei (b) stoppen — das lässt den wertvollsten Teil von Hattie & Timperleys Modell ungenutzt [1].

2. **Kombiniere niemals Aufgaben‑Feedback mit Lob auf Selbst‑/Eigenschaftsebene im selben Satz.** Verbanne „Correct! You're so smart at math“ — trenne Korrektheit von Ermutigung und halte das Lob auf Anstrengung/Strategie, nie auf Fähigkeit. Das folgt aus der Erkenntnis von Kluger & DeNisi, dass die Aufmerksamkeitsbindung auf Selbst‑Ebene der wahrscheinliche Mechanismus für das Gegenwirken von Feedback ist [2][6].

3. **Kommentiere die Arbeit/Schritte des Schülers, nicht nur die Endantwort**, wo immer das Format Zwischenschritte erfasst. Die mit Abstand wirkungsvollste architektonische Entscheidung laut VanLehns ITS‑Meta‑Analyse (schrittbasiert d≈0,76 vs. antwortbasiert d≈0,40) [8].

4. **Halte ausgearbeitetes Feedback kurz — 3 bis 6 Sätze, maximal ein ausgearbeitetes Beispiel.** Shutes Gegenwirkung bei übermäßiger Ausführlichkeit bedeutet, dass die Eingabeaufforderung eine explizite Längenbegrenzung benötigt, nicht „explain everything you can“ [5].

5. **Lasse den Tutor nicht vorzeitig während eines Versuchs die Antwort oder Methode der nächsten Aufgabe preisgeben** (z. B. in einem Hinweis‑Fluss vor der Einreichung) — der MathDial/„telling@k“‑Fehlermodus. Beschränke den Tutor auf sokratische/Schritt‑gestützte Hinweise während eines aktiven Versuchs und reserviere vollständige ausgearbeitete Erklärungen für die Nach‑Einreichungs‑Überprüfung [9][10][12].

6. **Schütze vor selbstsicher‑falschen Gedankenketten.** Validiere jede erzeugte Schritt‑für‑Schritt‑Erklärung gegen eine deterministisch berechnete korrekte Lösung, bevor sie angezeigt wird — das LLM soll eine bekannte korrekte Herleitung erzählen, nicht frei die Mathematik neu ableiten, angesichts dokumentierter flüssig‑aber‑falscher Argumentationsketten [13].

7. **Sofortiges Feedback für Korrektheits‑/Abschluss‑Signale (richtig/falsch, erhaltene Punkte); eine kurze Verzögerung (unter einer Sekunde bis ein paar Sekunden) ist für die tiefere „why“‑Erklärung in Ordnung**, jedoch nicht am Ende der Sitzung — sofortiges Feedback stärkt das Vertrauen und verhindert, dass ein falsches Verfahren weiter geübt wird [4].

8. **Behalte Feedback auf Muster‑Ebene für eine Zusammenfassung am Sitzungsende vor**, getrennt vom Feedback pro Aufgabe: z. B. „schnellste bei Multiplikations‑Fakten, langsamste bei mehrstufigen Textaufgaben; nächste Sitzung fügt mehr gestufte Textaufgaben hinzu.“ Das entspricht Black & Wiliams formativer Schleife — aggregierte Evidenz nutzen, um die *nächste* Unterrichtseinheit anzupassen, nicht nur den nächsten Satz [3].

9. **Age‑tiered FEEDBACK TEMPLATES for the tutor prompt:**

   - **Alter ~4–6:** 1–2 kurze Sätze, konkret/sensorisch, keine abstrakte Strategiediskussion. Vorlage: *[konkrete Beobachtung] → [einfacher korrekter Schritt] → [Anstrengungs‑Lob, das an die spezifische Handlung gekoppelt ist]*. Beispiel: „You counted the apples one by one — there are 7, you said 6; let's count together: 1, 2, 3... You're getting really good at counting carefully.“

   - **Alter ~7–10:** 3–4 Sätze, die den spezifischen Schritt benennen, in dem etwas abwich, eine benannte Strategie, Anstrengungs‑/Strategie‑Lob. Vorlage: *[what you got right] + [the exact step that went off track] + [why the correct step works] + [strategy-based encouragement]*.

   - **Alter ~11–14:** 4–5 Sätze, die das *Warum* hinter der Regel einführen, zum Vergleich mit dem korrekten Vorgehen einladen, Fachvokabular nutzen. Vorlage: *[feed up: what the problem tested] + [feed back: where reasoning matched/diverged] + [correct rule with a mini worked step] + [feed forward: a related problem type to watch for]*.

   - **Alter 15+ / Erwachsene:** Prägnant, technisch, auf Peer‑Ebene; Ermutigungsfloskeln weglassen, auf Präzision fokussieren („correct but not minimal; here's a faster path“), bei Bedarf Tiefe anbieten.

   Alle Stufen: niemals feste‑Eigenschafts‑Formulierungen („you're not a math person“); immer die *spezifische* Handlung benennen, niemals ein globales Urteil.

10. **Feedback, das vermieden werden sollte, weil Evidenz zeigt, dass es nach hinten wirkt:** generisches Lob von Eigenschaften/Fähigkeiten [6]; übertriebenes/superlatives Lob für routinemäßige Korrektheit [7]; reines Korrektheits‑Feedback ohne Weiter‑Weg, wenn falsch [5]; die vollständige Lösung vor Abschluss des Versuchs preisgeben [9][10]; langes Nach‑Unterrichten von bereits beherrschtem Material [5]; vergleichendes/normatives Feedback („behind other kids your age“) — der genaue Ego‑Shift‑Mechanismus hinter leistungseinbußen durch Feedback [2].

11. **Verknüpfe Gamification‑Feedback mit Aufwand‑/Prozess‑Signalen** (Beharrlichkeit, Strategienutzung, Verbesserung gegenüber eigenem Ausgangsniveau), nicht nur Geschwindigkeit oder Serien, damit das Punktesystem kein fähigkeitsbasiertes Feedback über Ranglisten oder feste Talent‑Abzeichen wieder einführt.

12. **Verlange, dass die Tutor‑Eingabeaufforderung vor dem Senden einer Nachricht eine kurze Checkliste selbst prüft**: trennt Aufgabe vom Lob; nennt einen konkreten nächsten Schritt; liegt innerhalb der Längenbegrenzung der jeweiligen Altersstufe; verhindert das Offenbaren von Antworten für den nächsten Versuch; jeder ausgearbeitete Schritt wird gegen eine berechnete Ground‑Truth validiert. Das operationalisiert die obigen Regeln als Schranke, nicht als Hoffnung.

## Offene Fragen für den Projektinhaber

1. Soll sofortiges Feedback pro Aufgabe und die ausführlichere KI‑Tutor‑Erklärung immer zusammen angezeigt werden, oder sollten Kinder im Alter von 4–6 Jahren eine vereinfachte Inline‑Reaktion sofort erhalten und die ausführlichere Erklärung nur in einer Eltern‑/Sitzungs‑Übersicht?

2. Erfassen wir derzeit Zwischenschritte bei mehrstufigen Aufgaben, nicht nur die Endantwort? Falls nicht, lohnt es sich, das zu priorisieren angesichts der Lücke zwischen schrittbasiertem und antwortbasiertem ITS (d≈0,76 vs 0,40)?

3. Sollten Zusammenfassungen am Sitzungsende an das Kind, die Eltern oder beide gehen, mit unterschiedlicher Formulierung (ermutigend für das Kind vs. diagnostisch für die Eltern)?

4. Wie soll der Tutor seine ausgearbeitete Lösungsdarstellung gegen die Ground‑Truth validieren — ein separater deterministischer Solver oder ein zweiter Verifikations‑LLM‑Durchlauf?

5. Wollen wir ein „Novice‑Teacher“-Fallback (reine Antwortoffenlegung) einsetzen, wenn eine vollständige sokratische/ausgearbeitete Erklärung zu langsam oder zu kostenintensiv wäre, und bei welcher Latenz‑/Kosten‑Schwelle?

## Quellen

1. Hattie & Timperley (2007). The Power of Feedback, *Review of Educational Research* 77(1). Nachverfolgung: [Revisiting "The Power of Feedback"](https://www.sciencedirect.com/science/article/abs/pii/S0959475222001396).

2. Kluger & DeNisi (1996). The Effects of Feedback Interventions on Performance, *Psychological Bulletin* 119(2). [ResearchGate](https://www.researchgate.net/publication/232458848_The_Effects_of_Feedback_Interventions_on_Performance_A_Historical_Review_a_Meta-Analysis_and_a_Preliminary_Feedback_Intervention_Theory).

3. Black & Wiliam (1998). Inside the Black Box, *Phi Delta Kappan*. [PDF](http://allianceforlearning.co.uk/wp-content/uploads/2017/03/William-and-Black-Inside-the-Black-Box.pdf).

4. Eine Meta‑Analyse zur Auswirkung des Feedback‑Timings auf Lernergebnisse im computergestützten Lernen, *Educational Psychology Review* (2026). [Springer](https://link.springer.com/article/10.1007/s10648-026-10117-8).

5. Shute (2008). Focus on Formative Feedback, *Review of Educational Research* 78(1). [PDF](https://andymatuschak.org/files/papers/Shute%20-%202008%20-%20Focus%20on%20Formative%20Feedback.pdf).

6. Mueller & Dweck (1998). Praise for Intelligence Can Undermine Children’s Motivation and Performance. [PubMed](https://pubmed.ncbi.nlm.nih.gov/9686450/).

7. Brummelman et al. (2014, 2017). Person Praise Backfires in Children With Low Self-Esteem; When Parents’ Praise Inflates, Children’s Self-Esteem Deflates, *Child Development*. [Wiley](https://onlinelibrary.wiley.com/doi/full/10.1111/cdev.12936).

8. VanLehn (2011), zusammengefasst in: [Effectiveness of Intelligent Tutoring Systems: A Meta-Analytic Review](https://www.researchgate.net/publication/277636218_Effectiveness_of_Intelligent_Tutoring_Systems_A_Meta-Analytic_Review).

9. MathDial: A Dialogue Tutoring Dataset with Rich Pedagogical Properties, EMNLP Findings 2023. [arXiv:2305.14536](https://arxiv.org/abs/2305.14536).

10. MathTutorBench: A Benchmark for Measuring Open-ended Pedagogical Capabilities of LLM Tutors, EMNLP 2025. [arXiv:2502.18940](https://arxiv.org/abs/2502.18940).

11. Tutor CoPilot: A Human-AI Approach for Scaling Real-Time Expertise (2024). [arXiv:2410.03017](https://arxiv.org/html/2410.03017).

12. Boosting LLMs with Socratic Method for Conversational Mathematics Teaching. [arXiv:2407.17349](https://arxiv.org/html/2407.17349).

13. Mathematical Computation and Reasoning Errors by Large Language Models. [arXiv:2508.09932](https://arxiv.org/pdf/2508.09932).

14. Khan Academy Blog. How Khan Academy Is Building a Better AI Tutor. [blog.khanacademy.org](https://blog.khanacademy.org/how-khan-academy-is-building-a-better-ai-tutor-our-most-recent-learnings/).

15. Providing Descriptive Feedback to Young Children, Wisconsin DCF / YoungStar. [PDF](https://dcf.wisconsin.gov/files/youngstar/pdf/ys-2019-20/desc-fdbk.pdf).
