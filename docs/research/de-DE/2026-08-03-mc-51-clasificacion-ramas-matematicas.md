# Klassifikation der Zweige der Mathematik und ihre Voraussetzungsstruktur — von MSC 2020 zu den Universitätscurricula und den Schullehrplänen der Welt

> Math Challenge Forschung — 2026-08-03 — Thema 51

## Zusammenfassung (ES)

- Es existieren drei lebende Klassifikationen der Zweige der Mathematik,
  und sie sind absichtlich verschieden: **MSC 2020** (63 zweistellige
  Bereiche, der standardmäßig zitierfähige — offene Lizenz, duale
  AMS/zbMATH-Pflege, dekadische Revision) [1][2], **arXiv math** (32
  Kategorien, die die aktuelle Forschungspraxis abbildet) [3], und die
  **ICM-Sektionen** (20 im Jahr 2022, alle vier Jahre vom Structure
  Committee überarbeitet) [4][5]. Für die Schule existiert keine
  Zweig-Taxonomie: was es gibt, ist PISA (4 Inhaltskategorien der
  Evaluation) und ISCED-F der UNESCO (0541 Mathematics / 0542 Statistics)
  [6][7].
- Die **schulische Voraussetzungsstruktur ist universell**: Zählen →
  Addition/Subtraktion → Multiplikation/Division → Brüche (setzt Division
  voraus) → Dezimalzahlen → Prozent (setzt Brüche/100 voraus) → Verhältnis
  und Proportion (setzt Multiplikation und Brüche voraus) → ganze Zahlen
  und Prä-Algebra → lineare Gleichungen → Funktionen → Quadratische →
  Exponentialfunktionen → Trigonometrie (setzt **gleichzeitig** Geometrie
  und Funktionen voraus) → Analysis (setzt Funktionen voraus). Verifiziert
  gegen Common Core, den englischen National Curriculum, IB, Mexiko SEP,
  Spanien LOMLOE, Frankreich lycée, Bayern Gymnasium und Singapur MOE
  [8]-[17].
- **Was sich pro Land ändert, ist nicht die Reihenfolge, sondern die
  Verpackung**: die USA erlauben Algebra I → Geometry → Algebra II oder
  integriert; Spanien gabelt in 4º ESO (A/B); Frankreich spezialisiert in
  première; Singapur macht Streaming (Standard/Foundation); das
  Basis-O-level von Singapur und das GCSE **enthalten keine Analysis**.
- An der Universität, die dominante Kette, verifiziert an 10 Institutionen
  (MIT, Harvard, Stanford, Cambridge, Oxford, ETH, Princeton, Berkeley,
  UNAM, Sorbonne) [18]-[27]: **Lineare Algebra kommt nach oder parallel
  zur mehrdimensionalen Analysis, niemals vor der Analysis einer
  Variablen**; die Wahrscheinlichkeit tritt zweimal ein (früh mit
  Analysis, rigoros nach der Maßtheorie); der **Beweis-Brückenkurs**
  existiert überall in drei Designs (expliziter Kurs, integriert ab Tag 1,
  beschleunigte Spur); die reelle Analysis setzt nur Analysis voraus, aber
  alles, was folgt (Funktionalanalysis, Mannigfaltigkeiten, PDEs), setzt
  **reelle Analysis ∧ lineare Algebra** gleichzeitig voraus.
- Konsequenz für Math Challenge: die Leiter N1-N12 muss **Zweig-Codes**
  und **Voraussetzungskanten** getrennt vom Schwierigkeitsgrad tragen. Das
  Niveau sagt, wie schwer es ist; der Zweig sagt, aus welcher Familie es
  kommt; die Kante sagt, was vorher bekannt sein muss. Ohne alle drei
  Dinge kann „6 Retos pro Niveau" (D-122) keine Zweig-Abdeckung
  garantieren — und genau das ermöglicht dieses Dokument zu messen.
- Design-Warnung: das naive Beispiel „Algebra setzt grundlegende Geometrie
  voraus" **ist in allen verifizierten Systemen falsch** — Geometrie läuft
  als parallele Spirale, nicht als Voraussetzung der Algebra. Die echten
  harten Abhängigkeiten sind: Brüche setzen Division voraus; Prozent setzt
  Brüche voraus; Verhältnis setzt Brüche voraus; Trigonometrie setzt
  Geometrie + Funktionen voraus; Analysis setzt Funktionen voraus; reelle
  Analysis setzt Analysis voraus; Funktionalanalysis/PDEs/theoretische
  Wahrscheinlichkeit setzen reelle Analysis + lineare Algebra voraus
  (+ Maßtheorie).

## Executive summary (EN)

- Three live classifications of mathematical branches exist, deliberately
  different: **MSC 2020** (63 two-digit areas, the citable default — open
  license, dual AMS/zbMATH maintenance, decennial review) [1][2], **arXiv
  math** (32 categories, reflecting current research practice) [3], and the
  **ICM sections** (20 in 2022, revised every four years) [4][5]. School-level
  has no branch taxonomy: PISA offers 4 evaluation content categories and
  UNESCO's ISCED-F offers 0541/0542 [6][7].
- The **school prerequisite structure is universal**: counting → add/subtract
  → multiply/divide → fractions (requires division) → decimals → percentages
  (requires fractions/100) → ratio and proportion → integers and pre-algebra →
  linear equations → functions → quadratics → exponentials → trigonometry
  (requires **both** geometry and functions) → calculus (requires functions).
  Verified against Common Core, England's NC, IB, Mexico's SEP, Spain's
  LOMLOE, France's lycée, Bavaria's Gymnasium, and Singapore's MOE [8]-[17].
- What varies by country is packaging, not order: US allows traditional or
  integrated sequences; Spain forks at 4º ESO; France specializes in première;
  Singapore streams; base O-level and GCSE include **no calculus**.
- In universities (10 institutions verified) [18]-[27]: **linear algebra comes
  after or parallel to multivariable calculus, never before single-variable
  calculus**; probability enters twice (early calculus-based, rigorous after
  measure theory); a **proof-bridge course** exists everywhere in three
  designs; real analysis requires only calculus, but everything beyond
  (functional analysis, manifolds, PDEs) requires **real analysis ∧ linear
  algebra** together.
- Consequence for Math Challenge: the N1-N12 ladder needs **branch codes** and
  **prerequisite edges** separate from difficulty level. Level says how hard;
  branch says which family; the edge says what must be known first. Without
  all three, "6 challenges per level" (D-122) cannot guarantee branch
  coverage — which is what this document enables measuring.
- Design warning: the naive example "algebra requires basic geometry" is
  **false in every verified system** — geometry runs as a parallel spiral.
  The real hard dependencies are: fractions require division; percentages
  require fractions; ratio requires fractions; trigonometry requires
  geometry + functions; calculus requires functions; real analysis requires
  calculus; functional analysis/PDEs/theoretical probability require real
  analysis + linear algebra (+ measure theory).

## 1. Die drei lebenden Klassifikationen, und warum man nicht nur eine wählen kann

### 1.1 MSC 2020 — das zitierfähige Rückgrat

Die Mathematics Subject Classification, Revision 2020, gemeinsam
herausgegeben von Mathematical Reviews (AMS) und zbMATH unter der Lizenz
CC-BY-NC-SA [1][2]: **63 zweistellige Bereiche, 529 dreistellige, 6.022
fünfstellige** [2]. Jedes klassifizierte Item trägt exakt eine primäre
Klasse und null oder mehr sekundäre [2].

Die 63 zweistelligen Bereiche, aus dem heruntergeladenen offiziellen PDF
[1]:

```
00 General/overarching      20 Group theory           43 Abstract harmonic      65 Numerical analysis
01 History and biography    22 Topological/Lie groups 44 Integral transforms    68 Computer science
03 Logic and foundations    26 Real functions         45 Integral equations     70 Mechanics: particles
05 Combinatorics            28 Measure/integration    46 Functional analysis    74 Mechanics: solids
06 Order and lattices       30 Complex variable       47 Operator theory        76 Fluid mechanics
08 General algebraic sys.   31 Potential theory       49 Calc. of variations    78 Optics, electromag.
11 Number theory            32 Several complex var.   51 Geometry               80 Thermodynamics
12 Field theory/polynomials 33 Special functions      52 Convex/discrete geom.  81 Quantum theory
13 Commutative algebra      34 ODEs                   53 Differential geometry  82 Statistical mechanics
14 Algebraic geometry       35 PDEs                   54 General topology       83 Relativity
15 Linear/multilinear alg.  37 Dynamical systems      55 Algebraic topology     85 Astronomy
16 Associative rings        39 Difference equations   57 Manifolds              86 Geophysics
17 Nonassociative rings     40 Sequences and series   58 Global analysis        90 Operations research
18 Category theory          41 Approximations         60 Probability            91 Game theory/economics
19 K-theory                 42 Harmonic analysis      62 Statistics             92 Biology
                                                                   93 Systems and control
                                                                   94 Information/circuits
                                                                   97 Mathematics education
```

Änderungen 2010 → 2020: keine auf zweistelliger Ebene („es wurden keine
neuen Felder geschaffen"); neun neue dreistellige Klassen (18M, 18N, 53E,
57K, 57Z, 60L, 62R, 68V, 82M); 113 fünfstellige Klassen gestrichen und 486
neue; vereinheitlichte Bindestriche (`-08` rechnerische Methoden, `-10`
Modellierung, `-11` Forschungsdaten) [2]. Der offizielle Artikel der
Revision ist Dunne & Hulek, EMS Newsletter [28].

**Strukturelle Anmerkung, relevant für uns:** der MSC ist kein Baum,
sondern ein DAG — die Klassen tragen explizite Querverweise (`{For differential
topology, see 57Rxx}`) [1]. Eine Zweig-Klassifikation, die
keine Querlinks zulässt, ist vom ersten Tag an schlecht designed.

### 1.2 arXiv math — die aktuelle Praxis

32 Kategorien `math.*` mit offiziellen Beschreibungen [3]: AC
(kommutativ), AG (algebraisch), AP (PDEs), AT (algebraische Topologie), CA
(klassische Analysis und ODEs), CO (Kombinatorik), CT (Kategorien), CV
(komplexe Variable), DG (differenziell), DS (dynamisch), FA (funktional),
GM, GN (allgemeine Topologie), GR (Gruppen), GT (geometrisch), HO, IT, KT,
LO (Logik), MG (metrisch), MP (mathematische Physik), NA (numerisch), NT
(Zahlen), OA (Operatoren), OC (Optimierung und Kontrolle), PR
(Wahrscheinlichkeit), QA (Quanten), RA (Ringe), RT (Darstellung), SG
(symplektisch), SP (spektral), ST (Statistik). Sie bildet lebende Grenzen
ab, die MSC verteilt (K-theory, Symplektik, Quanten haben eine eigene
Kategorie), hat aber keinen veröffentlichten formalen Revisionsprozess.

### 1.3 ICM-Sektionen — die vierjährliche Gemeinschaftssicht

Die 20 Sektionen des ICM 2022, aus den offiziellen EMS-Press-Proceedings
[4]: Logic; Algebra; Number Theory; Algebraic and Complex Geometry;
Geometry; Topology; Lie Theory; Analysis; Dynamics; PDEs; Mathematical
Physics; Probability; Combinatorics; Mathematics of Computer Science;
Numerical Analysis and Scientific Computing; Control Theory and
Optimization; Statistics and Data Analysis; Stochastic and Differential
Modelling; Mathematical Education; History. **Sie sind nicht fest**: das
Structure Committee der IMU überarbeitet sie alle vier Jahre (erster
Vorsitzender: Terence Tao; seit August 2025: Martin Hairer) [5].

### 1.4 Die Schule: es gibt keine Zweig-Taxonomie, und das muss gesagt werden

- **PISA 2022** klassifiziert den *Evaluations*-Inhalt in vier Kategorien:
  quantity; uncertainty and data; change and relationships; space and
  shape (~¼ der Items jeweils) — das sind keine Zweige, sondern
  Mess-Linsen [6].
- **ISCED-F 2013 (UNESCO)** klassifiziert Bildungsprogramme: Feld `054` →
  **0541 Mathematics** / **0542 Statistics** [7].
- Die nationalen Lehrpläne (§3) organisieren nach Domänen oder
  Themensträngen, nicht nach Forschungszweigen. Jeder Katalog, der
  vorgibt, „Zweige" auf Schualter abzubilden, baut etwas Neues — wie
  dieses Dokument.

## 2. Die schulische Voraussetzungsstruktur: das universelle Rückgrat

Verifiziert gegen acht Systeme [8]-[17]. Die Reihenfolge ist in allen
dieselbe; nur die Verpackung und das Jahr variieren.

### 2.1 Die neun Glieder, mit ihrer harten Abhängigkeit

1. **Zählen und Kardinalität → Addition und Subtraktion.** Universell
   (CCSS K-1, NC Y1, Singapur P1, Mexiko Fase 3, Bayern Primarstufe).
2. **Multiplikation und Division** mit dem Stellenwertsystem parallel.
   Die Division ist die am häufigsten zitierte Voraussetzung der gesamten
   Schulzeit: sie öffnet Brüche, Verhältnis, Prozent und Durchschnitt.
3. **Brüche** (CCSS 3.NF, NC Y3-Y5, Singapur P2-P5, BNCC Números).
   **Setzt gefestigte Division voraus.** Die drei detailliertesten Systeme
   behandeln Brüche/Dezimalzahlen/Prozente als „Formen derselben Zahl"
   (wörtlich in NC Y4-Y5).
4. **Dezimalzahlen → Prozent.** **Prozent setzt Brüche mit Nenner 100
   voraus** — es ist ein Verhältnis pro hundert (CCSS 6.RP.3c, NC Y5).
5. **Verhältnis und Proportionalität** — die Brücke zur Sekundarstufe
   (CCSS 6.RP, NC Y6, Mexiko «variación», die big idea «Proportionality»
   von Singapur, das französische «taux d'évolution»). **Setzt
   Multiplikation, Division und Brüche gleichzeitig voraus** — es ist die
   erste echte Mehrfachabhängigkeit.
6. **Ganze Zahlen mit Vorzeichen und Prä-Algebra → lineare Gleichungen →
   lineare Funktionen** (CCSS 7.NS → 8.EE → 8.F; Bayern M5 ℤ → M8;
   Frankreich seconde).
7. **Quadratische Funktionen und Polynome → Exponentialfunktionen und
   Logarithmen** (Frankreich 1ʳᵉ: second degré → exponentielle, definiert
   als einzige f mit f′ = f [14]; Bayern M9 → M10; CCSS HS Algebra).
8. **Trigonometrie.** **Setzt gleichzeitig Geometrie (Ähnlichkeit,
   Pythagoras) und Funktionen voraus** — deshalb kommt sie in allen
   Systemen spät (GCSE Higher, Frankreich 1ʳᵉ mit trigonometrischem
   Kreis, Bayern M9-M10, O-level Singapur, CCSS HS Geometry/Algebra II).
9. **Analysis** (Ableitung → Integral). **Setzt Funktionen und intuitive
   Grenzwerte voraus.** Es ist der abschließende Inhalt — mit zwei
   gewichtigen Ausnahmen: **das Basis-O-level von Singapur und das
   englische GCSE enthalten KEINE Analysis** [16][10]; sie beginnt mit
   16-17 in Frankreich und Spanien [14][13], mit 17-18 in A-level, Abitur
   und AP Calc.

### 2.2 Die zwei parallelen Spiralen

**Geometrie und Maß** (Figuren → Maß → Winkel → Pythagoras → Koordinaten
→ Vektoren) und **Statistik und Wahrscheinlichkeit** (Piktogramme →
Mittelwert → einfache Wahrscheinlichkeit → Verteilungen) laufen spiralförmig
ab der Primarstufe in **allen** verifizierten Systemen [8]-[17].
**Geometrie ist in keinem System Voraussetzung der Algebra**: es sind
parallele Stränge, die sich spät treffen (in der analytischen Geometrie
und der Trigonometrie). Die Aussage „man kann keine Algebra ohne
grundlegende Geometrie machen" ist als Voraussetzung falsch; die
strukturelle Wahrheit ist, dass sich die zwei Spiralen an konkreten
Punkten *kreuzen*: Koordinaten (Algebra · Geometrie), Steigung (Verhältnis
· Funktionen), Trigonometrie (Geometrie · Funktionen), Vektoren (lineare
Algebra · Geometrie).

### 2.3 Was sich pro Land unterscheidet (und warum es für ein Produkt in 7 Locales wichtig ist)

- **Verpackung der Sekundarstufe**: die USA erlauben Algebra I → Geometry
  → Algebra II *oder* integriert — die Bundesstaaten entscheiden
  (Appendix A von CCSS) [8]; Spanien integriert und gabelt in 4º ESO
  (Matemáticas A akademisch / B angewandt) und nach Modalität im
  Bachillerato mit formaler Prelation 1º→2º [13]; Frankreich: tronc
  commun in seconde + Spezialität [14]; Deutschland: integriert nach
  Jahrgangsstufe [15]; Singapur: Streaming Standard/Foundation in P5 und
  Express/NA/NT danach [16].
- **Wann der formale Beweis einsetzt**: Frankreich und das IB (Proofs,
  nur HL) machen ihn explizit [14][12]; die USA konzentrieren ihn im
  Geometry-Kurs; der englische NC verdünnt ihn in «reason mathematically»
  [9].
- **Mexiko im Übergang**: die MCCEMS (Acuerdo 09/08/23) reorganisiert die
  obere Mittelstufe in transversale Progressionen des «Pensamiento
  Matemático» statt der klassischen Fächer Álgebra → Geometría y
  Trigonometría → Cálculo [11]. Ein Produkt, das von „Sekundarstufen-
  Algebra" spricht, spricht zum alten System.

## 3. Die universitäre Voraussetzungsstruktur: zehn verifizierte Institutionen

Heruntergeladene Primärquellen: offizielle Kataloge und Curricula von MIT
[18], Harvard [19], Stanford [20], Cambridge [21], Oxford [22], ETH
Zürich [23], Princeton [24], UC Berkeley [25], UNAM [26] und Sorbonne
(partiell) [27].

### 3.1 Die fünf wiederkehrenden Muster

**Muster 1 — Lineare Algebra kommt nach oder parallel zur
mehrdimensionalen Analysis, niemals vor der Analysis einer Variablen.**
MIT: `18.06` setzt `18.02` voraus [18]. Harvard: `21b` (linear + ODEs)
nach `21a` [19]. Berkeley: `54` nach `52`, zusammen mit `53` [25].
Princeton: `202` nach `104`, austauschbar mit `201` [24]. Stanford:
integriert (`Math 51` ist linear + mehrdimensional) [20]. Die europäischen
Systeme mit geschlossenem Jahr (Cambridge, Oxford, ETH, UNAM) legen sie
ins erste Jahr **parallel** zur Analysis, weil das gesamte Jahr 1 Kern ist
[21][22][23][26].

**Muster 2 — Die Wahrscheinlichkeit tritt zweimal ein.** Früh und auf
Analysis gestützt (MIT `18.05` setzt `18.02` voraus; Cambridge/Oxford/ETH
in Jahr 1-2); rigoros mit Maß, **nach der reellen Analysis**: ETH deklariert
`Analysis III
(Masstheorie)` como base de la `Wahrscheinlichkeitstheorie`, der
Funktionalanalysis und der PDEs [23]; MIT `18.675` empfiehlt `18.600`
[18]; Harvard `114` (Maß) öffnet den Analysis-Strang [19].

**Muster 3 — Der Beweis-Brückenkurs existiert überall, in drei Designs.**
(a) Expliziter Kurs: MIT `18.090`, Berkeley `55`, Harvard `101/112/121`,
Princeton `210/214`, ETH `Grundstrukturen`, UNAM `Álgebra
Superior`
(erstes Semester: Induktion, Teilbarkeit, Kongruenzen) [26]; (b) integriert
ab Tag 1: Cambridge (`Numbers and Sets` + `Analysis I` mit ε-δ in Jahr 1),
Oxford (`Introduction to University Mathematics`); (c) parallele
beschleunigte Spur: Harvard `25/55`, Stanford `60CM/DM`, Princeton
`215-217`. **Kein System wirft einen Studierenden ohne Brücke in
Beweiskurse.**

**Muster 4 — Die reelle Analysis setzt nur Analysis voraus; alles andere
setzt beides voraus.** MIT `18.100A/B`: Voraussetzung einzig `18.02` [18].
Aber `18.101` (Mannigfaltigkeiten), `18.102` (Funktionalanalysis),
`18.112` (fortgeschrittene komplexe Analysis), `18.152` (PDEs) setzen
**(lineare Algebra) ∧ (reelle Analysis)** gleichzeitig voraus [18]. Die
Konjunktion ist das Tor zum Upper Division auch in Berkeley (`104` + `110`
obligatorisch) [25] und Cambridge (`Linear Algebra` und `Analysis & Topology` in
IB) [21].

**Muster 5 — Zwei Stufen linearer Algebra** (rechnerisch → theoretisch):
MIT `18.06` → `18.700`; Berkeley `54` → `110`; Stanford `51` → `113`;
Cambridge `Vectors and Matrices` → `Linear Algebra`. Der zweite Durchgang
ist der, der abstrakte Algebra, Darstellungen und Geometrie speist.

### 3.2 Der universitäre Voraussetzungsgraph (Synthese)

```
cálculo 1 variable ──┬──> multivariable ──┬──> EDOs
                     │                    ├──> álgebra lineal (computacional)
                     │                    └──> probabilidad (temprana)
                     ├──> análisis real ──────────┐
                     └──> [puente de demostración]│
álgebra lineal ──────┴──> álgebra lineal teórica ──┴──> álgebra abstracta
análisis real ∧ álgebra lineal ──┬──> análisis funcional
                                 ├──> variable compleja avanzada
                                 ├──> variedades / geometría diferencial
                                 ├──> EDPs
medida ──────────────────────────┴──> probabilidad teórica
álgebra abstracta ─────────────────> teoría de Galois, representaciones
topología general (tras análisis) ──> topología algebraica
```

Die **harten Einschreibungs**-Abhängigkeiten sind ein US-Phänomen
(`Prereq:` im Katalog); Cambridge, Oxford, ETH und UNAM verwenden
geschlossene Jahre + „indikative" Abhängigkeiten nach Inhalt
[21][22][23][26].

## 4. Die Zweiglandkarte für Math Challenge

Synthese von §1-§3 in eine operative Klassifikation. Jeder Zweig trägt
seinen MSC-2020-Code, seine schulische Position (falls vorhanden) und sein
Voraussetzungstor. Es ist die Klassifikation, die der Reto-Katalog
(`docs/planes/f11-contenido-retos.md`) referenziert, und die ein zukünftiges
`rama`-Feld der Itembank verwenden sollte.

### Familie F0 · Grundlagen der Zahl (MSC 11 zum Teil, 97)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `ARIT` | Ganzzahlarithmetik | Zählen | N1-N4 |
| `ENTE` | Ganze Zahlen mit Vorzeichen | Arithmetik | N7 |
| `FRAC` | Brüche | Division | N5 |
| `DECI` | Dezimalzahlen und Prozent | Brüche | N6 |
| `RAZO` | Verhältnis und Proportion | Brüche + Multiplikation | N6 |
| `DIVI` | Teilbarkeit und Primzahlen | Multiplikation/Division | N4-N7 |
| `TNUM` | Zahlentheorie | Teilbarkeit + Kongruenzen | N11 |

### Familie F1 · Algebra (MSC 12, 15, 16, 20, 08)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `PREA` | Prä-Algebra und Folgen | Arithmetik | N7 |
| `ALGE` | Algebra (Gleichungen, Systeme, Polynome) | Prä-Algebra | N8 |
| `EXP` | Exponentialfunktionen und Logarithmen | Quadratische Funktionen | N9 |
| `ALIN` | Lineare Algebra (Matrizen, Vektoren, Determinanten) | Algebra + Funktionen | N11 |
| `AABS` | Abstrakte Algebra (Gruppen, Ringe) | theoretische lineare Algebra + Beweisbrücke | N12 |

### Familie F2 · Geometrie und Maß (MSC 51, 52, 53, 14)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `GEOP` | Ebene Geometrie (Figuren, Fläche, Umfang) | Arithmetik | N5 |
| `GEOA` | Analytische Geometrie (Koordinaten, Steigung, Abstand) | Algebra | N8 |
| `VECT` | Vektoren und Vektorrechnung | lineare Algebra + mehrdimensionale Analysis | N12 |
| `TOPO` | Topologie (als Bewertungsformat, mc-12) | reelle Analysis | N12 |

### Familie F3 · Analysis (MSC 26, 28, 30, 34, 35, 40, 46)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `FUNC` | Funktionen | lineare Gleichungen | N9 |
| `TRIG` | Trigonometrie | Geometrie + Funktionen (gleichzeitig) | N9-N10 |
| `CALD` | Differentialrechnung | Funktionen | N10 |
| `CALI` | Integralrechnung | Differentialrechnung | N10 |
| `ANAL` | Reelle Analysis (rigorose Grenzwerte) | Analysis + Beweisbrücke | N12 |
| `VCOM` | Komplexe Analysis | reelle Analysis ∧ lineare Algebra | (Zukunft) |
| `EDOS` | Differentialgleichungen | Integralrechnung + lineare Algebra | (Zukunft) |

### Familie F4 · Wahrscheinlichkeit und Statistik (MSC 60, 62)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `ESTB` | Statistik (Mittelwert, Median, Daten) | Arithmetik + Brüche | N6-N10 |
| `PROB` | Wahrscheinlichkeit | Brüche + Funktionen | N9 |
| `COMB` | Kombinatorik | Multiplikation + Algebra | N11 |

### Familie F5 · Beweis und Logik (MSC 03)

| Code | Zweig | Tor (setzt voraus) | Niveau N |
|---|---|---|---|
| `LOGI` | Logik und Quantorennegation | Algebra | N11-N12 |
| `DEMO` | Beweisführung (Validierung, den Fehler erkennen) | Brücke — die „Lean-4-Spur" von D-124 | N11-N12 |

**Regeln der Landkarte:** (1) das Niveau N ist **Schwierigkeit**, der
Zweig ist **Familie** — sie bewegen sich getrennt (D-017 sagt es bereits
für visuelles Thema und Niveau; hier ist es dasselbe Prinzip eine Ebene
tiefer). (2) Die Tore sind die verifizierte Hälfte dieses Dokuments
(§2-§3), kein Ermessen: jedes zitiert sein System. (3) Die Landkarte ist
ein DAG wie der MSC, kein Baum: `TRIG` hat zwei Tore, `VCOM` und `EDOS`
je zwei.

## 5. Designimplikationen für Math Challenge

1. **Die Itembank gewinnt ein `rama`-Feld** (die Codes aus §4), getrennt
   von `nivel` und von `habilidad`. Ohne es kann „6 Retos pro Niveau"
   (D-122) mit sechs Retos desselben Zweigs erfüllt werden, und niemand
   würde es bemerken. Mit ihm kann der Auditor der Untergrenze
   (`piso-seis-retos.mjs`) Abdeckung fordern: ≥3 verschiedene Zweige pro
   Niveau.
2. **Die Voraussetzungskanten des Adaptiven** (F4) müssen aus §4 kommen,
   nicht erfunden werden: `skill_state` plant Fähigkeitsknoten, und die
   Frage „darf er Brüche sehen?" wird mit der Kante `FRAC ← división`
   beantwortet. Die Tabelle in §4 ist die erste verifizierte Quelle des
   Projekts für diese Kanten.
3. **Der Katalog der 54 Retos wird zum ersten Mal gemessen.** Aktuelle
   Abdeckung: 20 Zweige der 24 der Landkarte — **es fehlen `VCOM`, `EDOS`,
   `FUNC` als expliziter Zweig (er ist verteilt), und `DIVI` liegt lose
   außerhalb von N4**. Die Lücken sind mit D-124 verträglich (die
   selbstbewertbaren Formate bestimmen), aber jetzt sind sie sichtbar und
   entscheidbar, nicht unsichtbar.
4. **Die „Beweisbrücke" muss als Spur existieren, nicht als Hoffnung**:
   die zehn Universitätssysteme haben sie, und unsere Version ist die
   Lean-4-Spur (D-124) plus die Formate von `mc-12` (den Fehler erkennen,
   Schritte ordnen), bereits in N11-N12 des Katalogs vorhanden.
5. **Geometrie läuft spiralförmig, man „schließt" sie nicht einmal ab**:
   die Landkarte setzt sie auf N5, N8 und N12, und die Trigonometrie mit
   zwei Toren. Jedes lineare Voraussetzungsdesign („erst die ganze
   Geometrie, dann die ganze Algebra") widerspricht den acht verifizierten
   Schulsystemen.
6. **Mexiko und Singapur führen Algebra früh ein** (variación/big ideas);
   die USA warten bis zur 6. Klasse. Für die 7 Locales ist das Niveau N
   eines Retos landesneutral (D-017/mc-15) — und diese Untersuchung ist
   die Evidenz dafür, warum es das bleiben muss: der Inhalt pro Alter
   variiert; die Abhängigkeitsstruktur nicht.
7. **Die Wahrscheinlichkeit wird zweimal gelehrt** (früh mit Analysis,
   rigoros mit Maß). Unser `PROB` von N9 ist das erste; das zweite ist mit
   den aktuellen Formaten nicht selbstbewertbar und bleibt explizit
   draußen.
8. **MSC 97 (Mathematics education) und Sektion 19 des ICM** sind die
   offizielle Brücke zwischen Forschung und Lehre — dieses Dokument lebt
   dort, und die Klassifikation von §4 muss überarbeitet werden, wenn MSC
   2030 erscheint (deklarierter dekadischer Zyklus [2]).

## 6. Offene Fragen für den Projektinhaber — GELÖST (2026-08-03)

| # | Frage | Antwort | Entscheidung |
|---|---|---|---|
| 1 | Eigene Codes oder MSC? | **MSC mit 2 Stellen, mit Personen-Namen, autorisiert pro Locale** (personalisierte Antwort des Inhabers: Rigorosität des Standards, Gesicht einer Person) | D-128 |
| 2 | Abdeckung des Auditors der Untergrenze? | ≥3 verschiedene MSC-Zweige pro Niveau, zusätzlich zu den 6 Retos | D-129 |
| 3 | `VCOM`/`EDOS`? | Kommen als zukünftige Niveaus herein — `mc-12` bestätigt, dass sie selbstbewertbar sind | D-130 |
| 4 | Die Spiralen als Kanten? | Schwach (empfehlen, blockieren nicht); hart nur die verifizierten | D-131 |
| 5 | Die Beweisbrücke? | Transversale Spur, sichtbar auf der Landkarte, kein weiteres Niveau | D-132 |
| 6 | Wer hält es aktuell? | Datierte Einträge in `dudas.md`: 2027 (Lehrpläne) und 2030 (MSC) | D-133 |
| 7 | `FUNC` explizit? | Ja — es ist das Tor der gesamten Analysis und muss auditierbar sein | D-134 |
| 8 | Wo lebt der Graph? | Reines Modul `packages/motor/src/ramas.ts` | D-135 |

## Quellen

1. **MSC 2020, vollständiges offizielles PDF** — zbMATH/Mathematical
   Reviews — https://zbmath.org/static/msc2020.pdf — heruntergeladen;
   Quelle der 63 Bereiche und der Querverweise.
2. **MSC 2020 Portal und Nutzungsregeln** — https://msc2020.org/ und
   https://mathscinet.ams.org/msc/msc2020.html — heruntergeladen; Zählungen
   (63/529/6022), Änderungen 2010→2020, Lizenz CC-BY-NC-SA, Regel der
   einzigen Primärklasse.
3. **arXiv category taxonomy** — https://arxiv.org/category_taxonomy —
   heruntergeladen; die 32 math.*-Kategorien mit Beschreibungen.
4. **Proceedings des ICM 2022, Inhaltsverzeichnis** — EMS Press —
   https://www.proceedings.com/content/074/074997webtoc.pdf —
   heruntergeladen; die 20 Sektionen.
5. **IMU — ICM Structure Committee** — https://www.mathunion.org/icm/icm-2022
   und https://www.mathunion.org/icm/icm-2026 — heruntergeladen; die
   vierjährliche Revision der Sektionen. Die Sektionen des ICM 2026
   konnten nicht heruntergeladen werden (Site unerreichbar) — ausstehend.
6. **OCDE, PISA 2022 Assessment and Analytical Framework** —
   https://www.oecd-ilibrary.org/content/dam/oecd/en/publications/reports/2023/08/pisa-2022-assessment-and-analytical-framework_a124aec8/dfe0bf9c-en.pdf
   — die OCDE-Hauptseite gab 403; Inhalt via iLibrary und Spiegel
   (ilsa-gateway.org) bestätigt. Die 4 Inhaltskategorien.
7. **UNESCO ISCED-F 2013** — uis.unesco.org (offizielles PDF nicht direkt
   herunterladbar; Codes 0541/0542 via egracons.eu bestätigt).
8. **Common Core State Standards** — https://www.thecorestandards.org/Math/
   und Domänenseiten pro Jahrgang (K, 3.NF, 6.RP, 8.F, HSA) —
   heruntergeladen.
9. **National Curriculum in England: Mathematics programmes of study** —
   gov.uk — heruntergeladen (Y1-Y5 wörtlich; KS3/KS4 abgeschnitten).
   GCSE: Indexseite heruntergeladen, Inhalt bestätigt. A-level: 404,
   **nicht verifiziert**.
10. **IB — Mathematics in the DP** — https://www.ibo.org/programmes/diploma-programme/curriculum/mathematics/
    — heruntergeladen (4 Kurse, 5 Themen, Proofs und Vectors nur HL).
11. **Mexiko SEP** — Campo formativo Saberes y Pensamiento Científico
    (SNTE-PDF) und Pensamiento Matemático II, Colegio de Bachilleres, Plan
    2023 (gob.mx) — heruntergeladen. Die DOF-Notiz des Acuerdo 09/08/23
    scheiterte am Netz.
12. **IB Group 5 subjects** — Wikipedia — heruntergeladen
    (Sekundärquelle, mit [10] gegengeprüft).
13. **Spanien LOMLOE** — RD 217/2022 (ESO) und RD 243/2022 (Bachillerato),
    BOE — heruntergeladen (die Prelation 1º→2º des Art. 21.2, wörtlich;
    Inhaltsanlagen abgeschnitten).
14. **Frankreich, programme de spécialité Mathématiques de première**
    (offizielles PDF) und BO maths intégré à l'enseignement scientifique —
    education.gouv.fr — vollständig heruntergeladen. Seconde und terminale:
    nicht heruntergeladen.
15. **Deutschland, LehrplanPLUS Bayern Gymnasium** (M5, M10) und KMK
    Bildungsstandards — heruntergeladen. Es ist ein Land von 16: nicht
    ohne Sorgfalt auf ganz Deutschland extrapolieren.
16. **Singapur** — MOE Primary Mathematics Syllabus 2021 (PDF) und SEAB
    O-Level Mathematics 4052 (PDF) — heruntergeladen. Hinweis: der
    CPA-Ansatz erscheint nicht unter diesem Namen im offiziellen Syllabus
    (er lebt in den didaktischen Materialien) — gesagt, damit niemand es
    aus dem falschen Dokument zitiert.
17. **Brasilien BNCC** — offizielles Portal ist eine JS-Anwendung (nicht
    herunterladbar); Struktur via Wikipedia bestätigt (heruntergeladen).
    Die 5 thematischen Einheiten (Números; Álgebra; Geometria; Grandezas e
    medidas; Probabilidade e estatística). Detail pro Jahr: **noch fein zu
    verifizieren**.
18. **MIT** — Katalog Course 18 (student.mit.edu/catalog/m18a.html,
    catalog.mit.edu/subjects/18/) und Roadmaps des Departments —
    heruntergeladen; die in §3 wörtlich zitierten Voraussetzungen.
19. **Harvard** — Courses in Mathematics (Department-PDF) —
    heruntergeladen; die Brückenkurse und «Math 123 cannot be taken
    before Math 122».
20. **Stanford** — bulletin.stanford.edu/programs/MATH-BS —
    heruntergeladen.
21. **Cambridge** — Guide to Courses in Part IA und IB 2024-25 (PDFs) —
    heruntergeladen; die advisorischen Abhängigkeiten («builds on»,
    «essential for»).
22. **Oxford** — offizieller Prospectus des Mathematical Institute —
    heruntergeladen; die Tabelle Jahr für Jahr.
23. **ETH Zürich** — Wegleitung Bachelor Mathematik 2024 (PDF, auf
    Deutsch) — heruntergeladen; Masstheorie als Basis von
    Wahrscheinlichkeit/Funktionalanalysis/PDEs, wörtlich.
24. **Princeton** — Standard Math Sequences und Overview of Lower
    Division (math.princeton.edu) — heruntergeladen; der doppelte Weg
    example/proof-based.
25. **UC Berkeley** — Course Requirements: Pure Mathematics
    (math.berkeley.edu) — heruntergeladen.
26. **UNAM, Facultad de Ciencias** — Fiche des Studiengangs, Studienplan
    (oferta.unam.mx PDF) und DGAE-SIAE-Struktur — heruntergeladen; die
    «seriación indicativa» und die nummerierten Ketten.
27. **Sorbonne Université** — Onisep, licence mention mathématiques —
    partieller Zugriff (offizielle Site 404/Cookie-Wand); nur die
    Struktur der L1-Portale und die L2/L3-Gabelungen. **Die maquette
    Kurs für Kurs blieb unverifiziert.**
28. **Dunne & Hulek, "The revision of the Mathematics Subject
    Classification"** — EMS Newsletter, https://doi.org/10.4171/NEWS/115/2
    — der offizielle Artikel der MSC-2020-Revision.

**Warnungen dieser Sitzung:** Khan Academy blieb vollständig unverifiziert
(reine JS-Site, API 410 Gone, Wayback blockiert) — die Kurslandkarte, die
im Umlauf ist, konnte nicht zertifiziert werden; A-level, BNCC pro Jahr,
seconde/terminale und die maquette der Sorbonne bleiben als nicht
heruntergeladen markiert. Alles andere hat oben eine verifizierte URL.
