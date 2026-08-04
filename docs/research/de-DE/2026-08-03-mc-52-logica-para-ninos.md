# Logik für Kinder: Boolesche Logik, Wahrheitstabellen und Rätsel — wie sie in der Welt gelehrt wird und wie sie zu Retos ab 7 Jahren wird

> Math Challenge Forschung — 2026-08-03 — Thema 52

## Zusammenfassung (ES)

- Die Bitte des Inhabers: dass Kinder Boolesche Logik und
  Wahrheitstabellen direkt nach dem Kindergarten sehen, auf allen
  Niveaus, „weil sie die Grundlage des Programmierens ist und sie sie
  kennen müssen". Die Untersuchung sagt: **die Idee ist vertretbar, und
  die Form ist alles**.
- **Bebras** ist das größte System der Welt, das exakt dies lehrt:
  jährlicher Computational-Thinking-Wettbewerb in 50+ Ländern, mit
  Altersbändern (8-10, 10-12, 12-14, 14-16, 16+), Aufgaben von 1-4
  Minuten in drei Formaten (interaktiv, offen, Multiple-Choice) und
  Validierung als Messinstrument für Computational Thinking [1][2][3].
  Seine «Unplugged»-Karten haben altersgetrennte Sets **ab 3 Jahren**
  (3-4, 5-6, 7-8, 9-10) [3].
- **Die «unplugged»-Strategie (ohne Bildschirm) ist die weltweit am
  häufigsten verwendete für Computational Thinking bei Kindern** (Caeli &
  Yadav 2020) — und die ehrliche Bilanz ist, dass **es keine klare
  Evidenz gibt, welche Strategie die beste ist** (Hsu et al. 2018). Das
  muss so gesagt werden, statt den Zweig als bewiesen zu verkaufen [4].
- **Raymond Smullyans Rätsel der «Ritter und Knaves» sind die
  dokumentierte Brücke zwischen elementarer Logik und Beweis**: die MAA
  empfiehlt sie für diesen Übergang — sie entwickeln die Intuition des
  Widerspruchsbeweises, und «fast alle Studierenden scheinen sie zu
  genießen» [5]. Die Math Circles betreiben sie mit physischen Teilen [6].
- **Die formale Referenzprogression** (Mathematics Manifesto): Boolesche
  Logik mit Rätseln und Wahrheitstabellen mit **11-14**; formale Logik
  mit Quantoren mit **14-18** [7]. Das legt nahe, dass die **formale**
  Wahrheitstabelle kein Inhalt für 7-Jährige ist; das verkörperte
  UND/ODER/NICHT-Reasoning schon.
- **Design-Schlussfolgerung**: der Zweig LOGI kann auf **allen Niveaus ab
  N4** existieren — aber mit skalierender Form: Attribute und
  zusammengesetzte Regeln (N4-N6), Rätsel (N6-N8), kleine
  Wahrheitstabellen (N8+), De Morgan (N10), Prädikate und
  Quantorennegation (N11-N12, bereits im Katalog). Die Wahrheitstabelle
  als Werkzeug wird **gebaut, bevor sie gezeichnet wird**: erst wird
  reasoning betrieben, dann tabelliert.
- Ehrliche Vorsicht für das Produkt: ein 7-Jähriger liest keine
  Symboltabellen; die Retos von N4-N6 müssen mit Figuren, Attributen und
  Rastern funktionieren, nicht mit logischer Notation (konsistent mit
  mc-20/mc-21 und der roten Linie #3).

## Executive summary (EN)

- The owner's request: children should see Boolean logic and truth tables
  right after kindergarten, in every level, "because it's the foundation of
  programming and they have to know it." The research says: **the idea is
  defensible, and the form is everything**.
- **Bebras** is the world's largest system teaching exactly this: an annual
  computational-thinking challenge in 50+ countries, age-banded (8-10 to
  16+), 1-4 minute tasks in three formats, validated as a CT measurement
  instrument [1][2][3]. Its Unplugged cards have age-separated sets **from
  age 3** [3].
- **Unplugged is the most-used strategy worldwide for CT in children**
  (Caeli & Yadav 2020) — and the honest review is that **no strategy is
  clearly proven best** (Hsu et al. 2018) [4].
- **Smullyan's knights-and-knaves puzzles are the documented bridge from
  elementary logic to proof**: the MAA recommends them for that transition —
  they build intuition for proof by contradiction, and students enjoy them
  [5]. Math Circles run them with physical pieces [6].
- **Reference formal progression** (Mathematics Manifesto): Boolean logic
  with puzzles and truth tables at **11-14**; formal logic with quantifiers
  at **14-18** [7]. The formal truth table is not 7-year-old content;
  embodied AND/OR/NOT reasoning is.
- **Design conclusion**: the LOGI branch can exist in **every level from
  N4** — with the form scaling: attributes and compound rules (N4-N6),
  puzzles (N6-N8), small truth tables (N8+), De Morgan (N10), predicates
  and quantifier negation (N11-N12, already in the catalog). The truth
  table is **built before it is drawn**: reason first, tabulate later.

## 1. Was die Welt heute tut, verifiziert

### 1.1 Bebras — das Referenzsystem

Der Bebras International Challenge on Informatics and Computational
Thinking läuft in mehr als 50 Ländern seit ~16 Jahren [1][3].
Altersbänder: Little Beavers 8-10, Benjamins 10-12, Cadets 12-14,
Juniors 14-16, Seniors [2]. Jede*r Teilnehmende löst 15-18 Aufgaben in
40-45 Minuten (1-4 Minuten pro Aufgabe), in drei Formaten: interaktiv,
offen und Multiple-Choice mit vier Optionen [2]. Seine gemessenen Domänen:
Zerlegung, Mustererkennung, Abstraktion, Modellierung und Simulation,
Algorithmen und Evaluation [3]. Die **Bebras Unplugged Cards** existieren
in Sets pro Alter ab 3 Jahren (3-4, 5-6, 7-8, 9-10), mit Optionen zur
Auswahl und ohne Geräte oder vorherige Code-Erfahrung zu erfordern [3]. Es
gibt eine veröffentlichte Validierung der Karten als
Computational-Thinking-Test (Sung 2022, zitiert in [3]) und eine
Evaluation 2024 eines Bebras-Programms in der Primarstufe [4].

**Was Bebras für uns beweist:** logische Aufgaben von 1-4 Minuten mit
Multiple-Choice funktionieren ab 7-8 Jahren — was exakt das Format
`toca_la_respuesta` ist, das wir bereits in Produktion haben.

### 1.2 Die Unplugged-Strategie und ihre ehrliche Evidenz

Der Literaturüberblick (EPFL/Springer 2024) findet, dass Computational
Thinking zunehmend in frühe Curricula integriert wird und dass
**unplugged die am häufigsten eingesetzte Strategie** für Kinder ist
(Caeli & Yadav 2020) — warnt aber wörtlich: *«there is no clear
evidence regarding which strategies are most suitable for this purpose
(Hsu et al., 2018)»* [4]. Das heißt: die Welt tut es, die Messung, was
besser funktioniert, ist offen. Unser Produkt kann nicht versprechen,
dass der Zweig «den Geist verbessert» — es kann versprechen, dass er gut
designed ist und dass die eigene Messung (master-plan §15) sagen wird, ob
er funktioniert.

### 1.3 Smullyan und die Rätsel als Brücke zum Beweis

Die Mathematical Association of America empfiehlt in ihrem
Ressourcen-Leitfaden für das Lehren diskreter Mathematik die
«Knights-and-Knaves»-Rätsel von Raymond Smullyan (*What is the Name of
this Book?*, 1978) als **Brücke von der elementaren Logik zum Beweis**:
*«working on them helps develop a basis of intuition for proof by
contradiction… almost all students seem to enjoy the puzzles»* [5]. Die
Math Circles betreiben sie mit physischen Teilen in zwei Farben
(Ritter/Knave) — Fallanalyse als explizite Fähigkeit [6]. Smullyan
veröffentlichte 14 Bücher mit Logikrätseln zwischen 1978 und 2015, viele
in Narrative eingebettet (Alice, Sherlock Holmes, Tausendundeine Nacht)
[8].

**Die Format-Lektion:** das wirksame Logikrätsel ist **narrativ und
konkret** (eine Insel, zwei Wachen, Teile in zwei Farben), niemals eine
Formel. Bewertet wird über Konsequenzen, nicht über Notation.

### 1.4 Die formale Referenzprogression

Das Mathematics Manifesto (Emaths, Vereinigtes Königreich) schlägt vor:
mit **11-14** Boolesche Logik (AND, OR, NOT) «through basic logic puzzles
and truth tables» — explizit als Fundament der Informatik; mit **14-18**
formale Logik mit Notation und Quantoren, plus Berechenbarkeit und
Grundlagen [7]. TryEngineering (IEEE) hat Material zur Booleschen Algebra
«is Elementary», auf die Schule ausgerichtet [9].

**Was das für uns festlegt:** die Wahrheitstabelle als formales Objekt
fällt in der direktesten Referenz auf 11-14; das verkörperte Boolesche
Reasoning kann (und tut es in Bebras) mit 7-8 beginnen.

### 1.5 Die Logik existiert bereits in den Lehrplänen — verkleidet

Kein Schullehrplan von mc-51 lehrt «Logik» als Fach in der Primarstufe,
aber alle lehren sie als **Reasoning**: der englische NC verlangt «reason
mathematically» ab Y1 [10]; Common Core verlangt «make sense of
problems» als transversale Praxis [11]; Singapur stellt das
Problemlösen mit fünf Komponenten ins Zentrum des Rahmens [12]. Der
LOGI-Zweig eines Produkts konkurriert nicht mit der Schule: er greift ihr
mit guter Form voraus.

## 2. Die vorgeschlagene Leiter des Zweigs LOGI (N4-N12)

Konsistent mit der Evidenz aus §1 und mit dem, was bereits in N11-N12 des
Katalogs existiert (`f11-contenido-retos.md`). Jedes Niveau hält ≥3
Zweige (D-129) — LOGI wäre einer davon auf allen.

| Niveau | LOGI-Inhalt | Form des Retos | Referenz |
|---|---|---|---|
| N4 | **Attribute und zusammengesetzte Regeln**: «tippe die Figur, die rot UND rund ist»; «tippe die, die NICHT blau ist» | Figuren mit Attributen (Form/Farbe/Größe) — verkörpertes AND/NOT | Bebras 7-8 [3] |
| N5 | **Regeln mit ODER**: «es gilt jede, die groß ODER rot ist»; nach zwei Kriterien klassifizieren | Dieselbe Oberfläche, disjunktives Kriterium | Bebras 7-8 [3] |
| N6 | **Einfaches Rätsel**: «von diesen drei Aussagen ist nur eine falsch, welche Kiste hat den Preis?» | Kurzes narratives Rätsel, Multiple-Choice | Bebras 8-10, Math Circles [3][6] |
| N7 | **Wenn… dann und seine Nicht-Umkehrung**: «alle Zorbos sind blau; das hier ist nicht blau, ist es ein Zorbo?» | Verkörperte Aussagenlogik (Kontraposition, ohne sie zu benennen) | Smullyan [5] |
| N8 | **Kleine Wahrheitstabellen (2 Variablen)**: «in wie vielen Zeilen ist es wahr?» | Die Tabelle als Option: 2·2 mit UND/ODER/NICHT | Manifesto 11-14 [7] |
| N9 | **3 Variablen und Äquivalenzen**: «sagen diese zwei Ausdrücke dasselbe?» | Tabelle 2·2·2; Äquivalenz als wahr-in-jeder-Zeile | [7] |
| N10 | **De Morgan**: «negiere: (groß UND rot)» | `¬(A∧B) ≡ ¬A∨¬B` mit Attributen zuerst, Symbole danach | [7] |
| N11 | **Prädikate**: «alle / einige / keiner» über konkreten Mengen | Verkörperte Quantifikation | mc-12, Manifesto 14-18 [7] |
| N12 | **Quantorennegation** (bereits autorisiert: `n12-p4`) + den logischen Fehler in einer Kette erkennen | `¬∀ ≡ ∃¬`; «welche Zeile bricht das Argument?» | mc-12 [5] |

**Die Formregel, die die ganze Leiter trägt:** erst wird reasoning
betrieben, dann tabelliert. Die Wahrheitstabelle ist das **Foto des
Reasonings, das das Kind bereits gemacht hat** mit Attributen und
Rätseln — niemals der Ausgangspunkt.

## 3. Wie daraus selbstbewertbare Retos werden (mit dem, was bereits existiert)

- **N4-N5 (Attribute):** das Format `toca_la_respuesta` mit gezeichneten
  Optionen (`dibujos` des `Item` — der Mechanismus, der seit #349
  existiert): die Option ist die Figur, kein Identifikator. Ein Reto sind
  3-4 Figuren, die in 2-3 Attributen variieren; die Antwort ist die
  einzige, die die zusammengesetzte Regel erfüllt. **Keine Tabelle, kein
  Symbol.**
- **N6-N7 (Rätsel):** narrativer Stimulus von 1-2 Zeilen (autorisiert pro
  Locale, rote Linie #3 intakt: das Kind schreibt nie) + 3-4 Optionen.
  Der Distraktor ist der echte logische Fehler mit benannter Ursache
  (`tomó_la_contraria`, `confundió_todos_con_alguno`,
  `asumió_la_inversa`).
- **N8-N10 (Tabellen):** die Tabelle wird mit Figuren/Häkchen gezeichnet,
  nicht nur mit W/F; die Frage betrifft eine Zeile oder die Zählung —
  numerische oder Figuren-Multiple-Choice. Die vollständige Tabelle als
  freie Antwort kommt NICHT herein (nicht selbstbewertbar mit
  `toca_la_respuesta`; die großen Tabellen bleiben für die Tafel von
  D-075 in Erwachsenenbändern).
- **N11-N12:** bereits im Katalog autorisiert (`n12-p4` und die Vorlage
  der Negationslogik); vervollständigt mit «erkenne die Zeile, die
  bricht» (Format von mc-12, bereits entschieden).

**Fehler mit benannter Ursache, die dieser Zweig dem Vokabular
hinzufügt** (eigene Familie, mit Quelle): `tomó_la_contraria` (negiert
umgekehrt), `asumió_la_inversa` (wenn A→B, glaubt er B→A),
`confundió_y_con_o`, `confundió_todos_con_alguno` (Quantoren),
`negó_la_proposición_en_vez_del_cuantificador` (bereits im Katalog),
`olvidó_un_caso` (unvollständige Fallanalyse).

## 4. Vorsichtsmaßnahmen (der Teil, den man nicht überspringen darf)

1. **Keine Transferversprechen.** Der Überblick sagt, dass es keine klare
   Evidenz gibt, welche Computational-Thinking-Strategie besser
   funktioniert (Hsu et al. 2018, via [4]). Das Produkt kann nicht sagen
   «Logik verbessert den Geist» — es kann sagen «sie ist gut designed,
   und wir messen» (master-plan §15: die einzige Schwelle, die zählt, ist
   verzögerte Retention).
2. **Ein 7-Jähriger liest keine logische Notation.** Die Niveaus N4-N6
   sind Figuren, Attribute und erzählte Rätsel — konsistent mit
   mc-20/mc-21 und der roten Linie #3. Das Symbol kommt, wenn die
   Intuition bereits existiert.
3. **Der Genuss ist ein dokumentiertes Asset, kein Schmuck** («almost all
   students seem to enjoy the puzzles» [5]) — aber das Rätsel, das den
   beschämt, der scheitert, ist anti-Larry: die Fehler mit benannter
   Ursache aus §3 sind der Kanal des Feedbacks (mc-11).
4. **Nicht mit Bebras konkurrieren, ergänzen:** ihr Wettbewerb ist
   jährlich und schulisch; unserer ist adaptiv und täglich. Die
   Format-Inspiration ist explizit und zitiert, keine Aufgabenkopie (sie
   sind geschützter Wettbewerb).

## 5. Designimplikationen für Math Challenge

1. **LOGI geht von einem Zweig von N11-N12 zu einem Zweig über, der auf
   ALLEN Niveaus N4-N12 präsent ist** (Bitte des Inhabers 2026-08-03),
   mit der Leiter aus §2. Die Landkarte von `mc-51` §4 wird
   aktualisiert: `LOGI` hört auf, nur Prädikate zu sein, und wird die
   vollständige Leiter (Boolesch → Rätsel → Tabellen → Prädikate), mit
   ihren zwei Sub-Etiketten (Boolesch / Prädikate).
2. **Es ist der vierte Zweig jedes Niveaus** — D-129 verlangt ≥3 Zweige
   pro Niveau; mit LOGI auf allen präsent hat jedes Niveau einen
   garantierten transversalen Zweig plus zwei seines Fachs.
3. **Der Katalog der 54 wächst mit LOGI-Retos pro Niveau** (eigener
   Abschnitt in `f11-contenido-retos.md`), ohne die Untergrenze von 6 zu
   ändern: die LOGI-Retos sind **zusätzlich** zur Untergrenze, weil ihre
   Funktion transversal ist (Grundlage von Programmierung und Beweis),
   nicht fachlich.
4. **Es ist die offizielle Basis der Beweisspur** (D-132): die
   transversale Spur beginnt bei Rätseln (N6) und endet bei Lean 4
   (D-124) — dasselbe Rückgrat, zehn Jahre lang.
5. **Der Personen-Name des Zweigs** (D-128) wird pro Locale autorisiert:
   «Logikrätsel» / «logic puzzles» — niemals «03 Mathematical logic and
   foundations» auf dem Bildschirm.

## 6. Offene Fragen für den Projektinhaber — GELÖST (2026-08-03, D-147)

| # | Frage | Antwort |
|---|---|---|
| 1 | Innerhalb der Untergrenze von 6 oder zusätzlich? | **Zusätzlich** — Logik ist transversal, kein Fach des Niveaus |
| 2 | Wann die formale Wahrheitstabelle? | **N8**, nach Attributen und Rätseln |
| 3 | Name des Zweigs auf dem Bildschirm? | **«Rätsel»**, autorisiert pro Locale |
| 4 | Kindergarten? | **Draußen, ab N4** — die Trajektorie von mc-06 hat Priorität |

Die Retos wurden als Anhang von `docs/planes/f11-contenido-retos.md`
autorisiert.

## Quellen

1. **USA Bebras Computing Challenge** — https://bebraschallenge.org/ —
   der Wettbewerb und sein Format.
2. **Constructionism 2016 Proceedings** (Beschreibung des
   Bebras-Wettbewerbs: Bänder, 15-18 Aufgaben, 40-45 Minuten, drei
   Formate) —
   https://e-school.kmutt.ac.th/constructionism2016/Constructionism%202016%20Proceedings.pdf
   — heruntergeladen.
3. **Bebras Unplugged Computational Thinking Cards** (Sets pro Alter ab
   3 Jahren, gemessene Domänen, Validierung) — via
   https://adn.reviste.ubbcluj.ro/papers/article_16_1_3.pdf —
   heruntergeladen.
4. **A Bebras Computational Thinking program for primary school
   (Springer 2024)** — https://link.springer.com/article/10.1007/s10639-023-12441-w
   — heruntergeladen; enthält die Warnung von Hsu et al. 2018 («no clear
   evidence which strategies are most suitable») und Caeli & Yadav 2020.
5. **MAA, Resources for Teaching Discrete Mathematics** —
   https://www.maa.org/wp-content/uploads/2024/10/NTE74.pdf#page=200 —
   heruntergeladen; Smullyan als Brücke zum Beweis, das Zitat über den
   Genuss.
6. **Carleton Math Circle — Knights and Knaves mit physischen Teilen** —
   https://cdn.carleton.edu/uploads/sites/66/2020/06/Math-Circle-Comps.pdf
   — heruntergeladen; und MathCircles.org «Knights and Knaves: a journey
   to the land of logic».
7. **Mathematics Manifesto (Emaths)** —
   https://www.emaths.co.uk/images/Blogs/MathematicsManifesto/Mathematics%20Manifesto.pdf
   — heruntergeladen; die Progression 11-14 Boolesch / 14-18 formal.
8. **Computational Complexity blog — Smullyan Nachruf/Bibliografie** —
   https://blog.computationalcomplexity.org/2017/02/raymond-smullyan-was-born-on-may-25.html
   — heruntergeladen; die 14 Rätselbücher (1978-2015).
9. **TryEngineering — Boolean Algebra is Elementary (IEEE)** —
   https://tryengineering.org/wp-content/uploads/Boolean-Algebra-Elementary.pdf
   — heruntergeladen.
10. **National Curriculum in England** — gov.uk (via mc-51 [9]) —
    «reason mathematically» als Strang ab Y1.
11. **Common Core** — thecorestandards.org (via mc-51 [8]) —
    transversale Praktiken.
12. **Singapur MOE Primary Mathematics Syllabus 2021** (via mc-51 [16]) —
    Problemlösen im Zentrum des Rahmens.

**Warnungen dieser Sitzung:** die konkreten Bebras-Aufgaben sind
Wettbewerbsmaterial und wurden nicht heruntergeladen (Format und Bänder
werden zitiert, nicht Aufgaben); die Manifesto-Referenz stammt von einem
Autor und ist kein nationaler Standard; die Evidenz zur Wirksamkeit der
Computational-Thinking-Strategien ist offen (§4.1), und dieses Dokument
behauptet keinen Transfer.
