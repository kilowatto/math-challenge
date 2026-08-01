# Building and Operating a 2,500-Item Math Bank: What Real Learning Products Do

> Math Challenge research — 2026-07-31 — topic 40

## Zusammenfassung (ES)

Echte Lernprodukte schreiben selten jedes Item von Hand. IXL veröffentlicht ~1.219 Mathematik‑Kompetenzen für Vorschule–Klasse 8 [1] — keine Items, sondern *Fähigkeiten*, von denen jede durch dynamische Fragegenerierung unterstützt wird. Khan Academy nutzt Perseus, seinen eigenen Übungs‑Editor/Renderer [2], um menschliche Autorenschaft mit parametrischer Variation zu verbinden. WeBWorK zeigt das Gegenstück: eine Vorlage in seiner PG‑Sprache erzeugt eine unbegrenzte Anzahl numerischer Varianten [5]. Die Forschung 2023–2026 zur Item‑Generierung mit LLM ist zugleich klar und bescheiden: Modelle erzeugen mathematisch gültige Distraktoren, aber **antizipieren die realen Fehlvorstellungen der Lernenden nicht gut** [arXiv 2404.02124] — deshalb kann diese Bank die „Erklärung des häufigen Fehlers“ nicht ohne menschliche Überprüfung automatisieren.

Für 2.500 Items in 5 Sprachen verteilt der Plan die Arbeit wie folgt: ~40 % erzeugt durch parametrisierte Vorlagen (stark im K‑8‑Bereich, schwach im Postgraduierten‑/Doktorats‑Bereich), ~29 % von LLM verfasst mit obligatorischer menschlicher Überprüfung und ~31 % von Fachleuten handschriftlich erstellt (vorherrschend in den höchsten Stufen). Die LLM‑API‑Kosten für das Verfassen und Übersetzen liegen, bei der unten gezeigten Rechnung, im Bereich von mehreren hundert Dollar — ein Rundungsfehler gegenüber den menschlichen Kosten (Fachexperten, Redaktion, Übersetzung, psychometrische Überprüfung), geschätzt im Umfang von etwa tausend Personen‑Tagen. QTI 3.0 ist schrittweise einsetzbar (sein eigenes Konformitätsmodell erlaubt dies) [3][4]; für das MVP muss die vollständige Spezifikation nicht implementiert werden.

## Zusammenfassung (EN)

Echte Lernprodukte schreiben selten jedes Item von Hand. IXL veröffentlicht ~1.219 Mathematik‑Fähigkeiten für Vorschule–Klasse 8 [1] — keine Items, sondern *Fähigkeiten*, die jeweils durch dynamische Fragegenerierung unterstützt werden. Khan Academy nutzt Perseus, seinen eigenen Übungs‑Editor/Renderer [2], um menschliche Autorenschaft mit parametrischer Variation zu verbinden. WeBWorK stellt das klare Extrem dar: ein Problem in seiner PG‑Sprache kann unbegrenzt randomisierte numerische Instanzen erzeugen [5]. Die Forschung 2023–2026 zur Item‑Generierung mit LLM ist zugleich klar und bescheiden: Modelle entwerfen mathematisch gültige Distraktoren, sind jedoch **nicht gut darin, reale Fehlvorstellungen der Lernenden vorherzusehen** [arXiv 2404.02124] — der Grund, warum diese Bank die „Erklärung des häufigen Fehlers“ nicht ohne menschliche Überprüfung automatisieren kann.

Für 2.500 Items in 5 Sprachen teilt der nachfolgende Plan die Arbeit etwa zu 40 % auf parametrisierte Vorlagen (stark im K‑8‑Bereich, schwach im Graduierten‑/PhD‑Bereich), zu 29 % auf von LLM verfasste Inhalte mit obligatorischer menschlicher Überprüfung und zu 31 % auf von Fachleuten handschriftlich erstellte Items (vorherrschend an der Spitze). Die LLM‑API‑Kosten für das Verfassen und Übersetzen liegen, bei der unten gezeigten Rechnung, im Bereich von mehreren hundert Dollar — ein Rundungsfehler gegenüber den Kosten für menschliche Arbeitszeit (Fachexperten, Redaktion, Übersetzung, psychometrische Überprüfung), geschätzt auf etwa tausend Personen‑Tage. QTI 3.0 ist schrittweise einsetzbar (sein eigenes Konformitätsmodell erlaubt dies) [3][4]; das MVP benötigt nicht die vollständige Spezifikation.

## Ergebnisse

### Wie viele Items haben reale Produkte tatsächlich

Veröffentlichte, verifizierbare Zahlen sind seltener als es die Marketing‑Texte vermuten lassen. Die spanischsprachige Mathe‑Seite von IXL gibt die Skill‑Anzahlen pro Klassenstufe an – Preescolar 73, 1. Klasse 117, 2. Klasse 127, 3. Klasse 183, 4. Klasse 130, 5. Klasse 125, 6. Klasse 112, 7. Klasse 108, 8. Klasse 144 – was zu **~1.219 Skills über 9 Klassenstufen** summiert [1]. Das sind *Skills*, keine Items: Jeder Skill ist eine vorlagenartige Kategorie, gegen die IXL dynamisch Übungsfragen generiert, sodass die Fragenanzahl pro Skill unbegrenzt ist, ähnlich wie bei einem WeBWorK‑Problem. Für diese Sitzung wurde kein vergleichbar präziser Gesamtsatz für die Übungsanzahl von Khan Academy, die Problemanzahl von Brilliant oder die Arbeitsblattanzahl von Kumon gefunden – diese Zahlen kursieren in Marketing‑ und Sekundärquellen, aber keine primäre Seite, die in dieser Sitzung abgerufen wurde, gab eine Zahl an, daher werden sie weggelassen statt geraten. Der Wikipedia‑Artikel „Item Bank“ beschreibt die Lebenszyklus‑Metadaten, die Item‑Banks verfolgen (status: new/pilot/active/retired; usage history) [item bank wiki], liefert jedoch keine konkrete Größe für ein benanntes Programm.

### Parametrisierte Generierung vs. handgeschriebene Autorenschaft

Khan Academys Perseus ist die eigene Repository‑Beschreibung von „Khan Academys Übungs‑Fragen‑Editor und Renderer“ — ein System zum Autorieren, Rendern und Bewerten von Übungsantworten, MIT‑lizenziert, aber für externe Beiträge gesperrt [2]. WeBWorKs PG („Problem Generation“)-Sprache ist ein perl‑basiertes Autorierungsformat, das für Randomisierung entwickelt wurde: Dozenten schreiben ein Problem, und die Parametrisierung ermöglicht es jeder Studentensitzung, unterschiedliche numerische Werte aus derselben Vorlage zu ziehen, wodurch ein praktisch unbegrenzter Item‑Pool aus einer einzigen autorisierten Quelle entsteht [5] — das konkrete Muster „eine Vorlage, viele Items“, das dieses Projekt für K‑8‑Arithmetik und frühe Algebra benötigt. Brilliant.org beschreibt seinen Ansatz als hybrid: Inhalte werden „hand‑crafted“ von einem Team aus „Math‑PhDs bis zu Ingenieuren und Designern“ erstellt, während maschinelles Lernen „on‑the‑fly visuelle und interaktive“ Personalisierung darüber legt — und Brilliant gibt an, dass neuer Review‑Set‑Content „human‑review[ed] everything“ sei und aus diesem Grund schrittweise ausgerollt wird [brilliant about page]. Das Muster bei allen drei: Vorlagen und dynamische Generierung vervielfachen *Volumen*, aber ein Mensch entwirft weiterhin die Vorlage und deren Einschränkungen.

### Von LLM generierte Items: real, aber begrenzt (Forschung 2023–2026)

Ein konkreter, zitierbarer Datenpunkt: Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas und Lan, „Exploring Automated Distractor Generation for Math Multiple‑choice Questions via Large Language Models“ (arXiv 2404.02124), testen In‑Context‑Learning und Fine‑Tuning zur Generierung von Multiple‑Choice‑Distraktoren auf einem realen Mathematik‑Datensatz. Die zentrale Erkenntnis lautet genau die Einschränkung, die das Schema‑Design dieses Projekts berücksichtigen muss: „although LLMs can generate some mathematically valid distractors, they are less adept at anticipating common errors or misconceptions among real students“ [arXiv 2404.02124]. Im abgerufenen Abstract dieser Sitzung war keine numerische Experten‑Review‑Bestandquote angegeben, daher wird keine zitiert — aber die qualitative Erkenntnis ist entscheidend: Ein LLM kann eine plausibel aussehende falsche Antwort schreiben, doch ob sie dem entspricht, was ein echter Schüler tatsächlich denken würde, ist ein schwierigeres Problem, bei dem aktuelle Modelle unterperformen. Die Forschungsseite von Duolingo listet „Jump‑Starting Item Parameters for Adaptive Language Tests“ (McCarthy et al., EMNLP 2021) [Duolingo research] auf, das das benachbarte Cold‑Start‑Problem der Abschätzung von Schwierigkeitsgraden für frisch generierte Items behandelt, bevor reale Antwortdaten vorliegen — ein Problem, dem diese Bank bei jedem neuen Item am ersten Tag gegenübersteht.

### Der Item‑QA‑Workflow und psychometrisches Screening

Die Klassische Testtheorie (CTT) definiert zwei pro‑Item‑Statistiken, die jede Produktionspipeline benötigt, bevor ein Item vertraut wird: der **p‑Wert**, „der Anteil der Prüflinge, die in die vorgegebene Richtung antworten“ (Schwierigkeit — höherer p‑Wert bedeutet leichter), und die **Item‑Diskriminierung**, berechnet über die Punkt‑Biserial‑Korrelation zwischen der Punktzahl eines Items und der Gesamttestpunktzahl, verwendet „to evaluate items and diagnose possible issues, such as a confusing distractor“ [CTT wiki; point-biserial wiki]. Keiner der Artikel gab einen numerischen Schwellenwert für „good enough“ Diskriminierung oder Schwierigkeit an, daher wird hier nichts behauptet. Was *dokumentiert* ist: Computerized Adaptive Testing sagt, „all items must be pretested with a large enough sample to obtain stable item statistics. This sample may be required to be as large as **1.000 examinees**“ [CAT wiki] — die einzige quantitative Stichprobengrößen‑Angabe, die in dieser Sitzung gefunden wurde, und ein nützlicher Oberwert dafür, wie konservativ reale Programme sein können. Item Bank beschreibt die Lebenszyklus‑Metadaten, die reife Systeme verfolgen: „item status (e.g., new, pilot, active, retired)“ und „item history (e.g., usage date(s) and reviews)“ [item bank wiki] — was direkt das untenstehende Feld `status` informiert.

### Ein Item nach tausenden von Antworten, die bereits darauf verweisen, korrigieren

Keine Quelle behandelte Versionierung direkt, aber das Lebenszyklus‑Status‑Muster [item bank wiki] impliziert die Antwort: Ein Item mit angehängten Antwortdaten wird niemals an Ort und Stelle bearbeitet — Statistiken werden anhand der genauen Formulierung, die die Schüler beantwortet haben, berechnet, und ein stillschweigendes Ändern würde jeden vorherigen Antwortbeitrag ungültig machen. Das sichere Muster: Eine neue Version erstellen, die alte zurückziehen (`status: retired`, nie gelöscht) und ein frisches Statistik‑Fenster starten.

### QTI 3.0 — lohnt es sich für ein Startup

1EdTechs QTI 3.0 ist der Standard für „exchanging assessment items, tests, usage data, and results reporting between different applications“, konsolidiert frühere QTI‑Versionen und den APIP‑Barrierefreiheitsstandard, bietet native Computer‑Adaptive‑Testing‑ und Portable‑Custom‑Interaction‑Unterstützung sowie integrierte Section‑508‑/WCAG 2.1‑AA‑Barrierefreiheit [3]. Die eigene Implementierungs‑Leitlinie macht ausdrücklich klar, dass Konformität **modular** ist: „the needs of the assessment program generally dictate which of the many QTI 3 features are used“, und Konformität/Zertifizierung ist ein separates Dokument, damit Organisationen ein Teilset übernehmen können [4]. Ein minimaler Pfad — Kern‑XML/XSD‑Validierung, grundlegende Auswahl‑/Texteingabe‑Interaktionen, Response‑Processing‑Templates, Standard‑Packaging, Kern‑Barrierefreiheits‑Markup — funktioniert, ohne adaptives Testing oder Portable Custom Interactions zu berühren [4]. QTI 3.0 ist nicht alles‑oder‑nichts: Das Aufschieben von CAT/PCI bei gleichzeitiger Gewinnung von Interoperabilität und Barrierefreiheits‑Gerüst für die Item‑Typen des MVP ist eine echte Option.

### Lokalisierungs‑Workflow über 5 Sprachen

Keine Quelle beschrieb einen mathematikspezifischen Übersetzungs‑Workflow, daher ist dies eine abgeleitete Überlegung. Die aus dem AIG/WeBWorK‑Material zu übernehmende Tatsache: Die Übersetzungskosten skalieren mit *unterschiedlichem autorisiertem Inhalt*, nicht mit der Anzahl generierter Items. Der feste Text einer Vorlage („What is __ + __?“) wird einmal pro Sprache übersetzt und deckt jede numerische Variante ab, die sie jemals erzeugt, während der vollständige Text eines handgeschriebenen oder von LLM erstellten Items pro Item übersetzt wird — der mit Abstand größte Hebel im untenstehenden Kostenmodell.

### Echte Kosten‑pro‑Item‑Zahlen aus der Bewertungs‑Industrie

In dieser Sitzung wurden keine unabhängig verifizierten Zahlen gefunden. Abrufversuche bei den Ressourcen‑Seiten von AIR, NCIEA und ETS lieferten 404‑Fehler oder keine Kostenangaben; die Forschungs‑Startseite von ETS gab lediglich an, dass es „11,9K publications“ gibt, keine Kostenangabe [ETS research page]. Branchen‑Blogs nennen häufig Kosten pro Item im niedrigen Tausender‑Dollar‑Bereich — aber da keine primäre Quelle in dieser Sitzung live abgerufen wurde, wird diese Zahl **nicht** weiter unten verwendet. Das Kostenmodell leitet sich stattdessen vollständig aus den angegebenen LLM‑API‑Preisen und expliziten, gekennzeichneten Person‑Tag‑Annahmen ab.

## Benchmark‑Tabelle

| Produkt / System | Item‑ oder Skill‑Anzahl | Generiert oder handgeschrieben | Quelle |
|---|---|---|---|
| IXL (math, PreK–8) | ~1.219 Skills (9 Klassenstufen) | Kuratierte Skill‑Kategorien; Fragen werden dynamisch pro Skill generiert | [1] |
| Khan Academy (Perseus) | Nicht in dieser Sitzung verifiziert | Hybrid: von Menschen erstellte Übungsdefinitionen, die von Perseus gerendert/variiert werden | [2] |
| WeBWorK (PG language) | Große Bibliothek; Anzahl nicht verifiziert | Vorlagenbasiert: ein PG‑Problem erzeugt unbegrenzte randomisierte Instanzen | [5] |
| Brilliant.org | Nicht öffentlich angegeben | Hybrid: hand‑crafted Basis + ML‑basierte Personalisierung on‑the‑fly, menschlich geprüft | [brilliant about] |
| Duolingo (item calibration research) | k.A. — Sprachtest | Algorithmisch generierte Items; ML‑unterstützte Schwierigkeitskalibrierung für Cold‑Start‑Items | [Duolingo research] |
| NWEA MAP Growth (CAT) | Nicht in dieser Sitzung verifiziert | CAT‑Bank; Pretest‑Stichproben bis zu 1.000 Prüflinge für stabile Statistiken angegeben | [CAT wiki] |
| General AIG practice | Keine universelle Angabe | Test‑Spezialist erstellt ein „item model“; Algorithmus generiert Item‑Familien daraus | [AIG wiki] |

## Ein konkreter 2.500‑Item‑MVP‑Plan

**Level‑Bänder und Item‑Anzahlen** (Pyramide — die meisten Items dort, wo die meisten Nutzer sind):

| Band | Items |
|---|---|
| K–2 | 300 |
| 3–5 | 400 |
| 6–8 | 450 |
| 9–10 | 400 |
| 11–12 | 350 |
| Undergraduate (intro) | 350 |
| Advanced undergrad / Masters | 150 |
| PhD / research | 100 |
| **Total** | **2.500** |

**Anteil nach Quelle, pro Band** (Vorlagenanteil sinkt, handgeschriebener Anteil steigt, je höher das Niveau — Vorlagen kämpfen mit beweislastigem fortgeschrittenem Inhalt, und Missverständnis‑Nuancen sind dort am wichtigsten, wo LLMs am schwächsten sind):

| Band | Vorlage % / Items | LLM‑erstellte % / Items | Handgeschriebene % / Items |
|---|---|---|---|
| K–2 | 70 % / 210 | 20 % / 60 | 10 % / 30 |
| 3–5 | 60 % / 240 | 25 % / 100 | 15 % / 60 |
| 6–8 | 50 % / 225 | 30 % / 135 | 20 % / 90 |
| 9–10 | 35 % / 140 | 35 % / 140 | 30 % / 120 |
| 11–12 | 30 % / 105 | 30 % / 105 | 40 % / 140 |
| Undergraduate | 20 % / 70 | 30 % / 105 | 50 % / 175 |
| Advanced/Masters | 10 % / 15 | 30 % / 45 | 60 % / 90 |
| PhD | 5 % / 5 | 25 % / 25 | 70 % / 70 |
| **Total** | **1.010 (40,4 %)** | **715 (28,6 %)** | **775 (31,0 %)** |

**Das Review‑Gate** (jedes Item durchläuft alle Stufen; nur der Aufwand pro Stufe unterscheidet sich): SME‑Autorenschaft / Vorlagendesign → redaktioneller Durchlauf → mathematische Genauigkeitsprüfung → Barrierefreiheits‑Review (Alt‑Text, screen‑reader‑sichere Notation) → Übersetzung (4 Zielsprachen) → Pilot (echte Antworten sammeln) → psychometrisches Screening (Item wird erst zu `active` befördert, wenn die Antwortzahl ausreichend ist — Implikation 4). Handgeschriebene Items starten bei „SME‑Autorenschaft“; LLM‑erstellte Items kommen mit einem Entwurf, durchlaufen aber jede nachgelagerte Stufe; vorlagenbasierte Items überspringen die Autorenschaft pro Item, aber die *Vorlage* durchläuft das gleiche Gate einmal.

**Item‑JSON‑Schema – erforderliche Felder:**

```
item_id, version, status, level_band, topic_tag, source_type, template_id,
languages{locale: {stem, choices, correct_answer, worked_solution,
  misconceptions[]}}, stem_canonical, choices, correct_answer,
worked_solution_canonical, misconceptions[{trigger_answer, explanation,
  remediation_hint}], difficulty_estimate_initial, irt_parameters{a, b, c,
  n_responses, last_calibrated_at}, p_value, point_biserial,
accessibility_metadata{alt_text, mathml, contrast_notes}, media[],
authoring_metadata{author, reviewer, created_at, reviewed_at, notes},
qti_export_ref, curriculum_tags[], retirement_reason
```

**Aufwand in Personen‑Tagen** (jede Angabe ein gekennzeichneter Schätzwert; arithmetische Schritte gezeigt):

- Vorlagendesign: 50 Vorlagen (≈20 Varianten/Vorlage für die 1.010 Vorlagen‑Items) × 0,5 Tag = **25 Tage**; einmaliger Parameterisierungs‑Engine‑Aufbau **≈15 Tage** (nicht pro Item).
- LLM‑erstellte Item‑Review/Korrektur: 715 × 0,15 Tag = **≈107 Tage**.
- Handgeschriebene Autorenschaft: 615 Items (K‑2 – Undergrad, 0,5 Tag je) + 160 (Advanced + PhD, 1,0 Tag je, seltener Spezialisten‑Zeit) = **≈468 Tage**.
- Übersetzungs‑Review (bilingualer SME‑Spot‑Check der LLM‑Übersetzung, nicht unabhängige Neu‑Übersetzung): 50 Vorlagen × 4 Sprachen = 200 Einheiten, plus 1.490 Items × 4 Sprachen = 5.960 → **6.160 Einheiten** × 0,05 Tag = **≈308 Tage**.
- Redaktion‑ + Barrierefreiheits‑Durchlauf, einheitlich: 2.500 × 0,05 Tag = **≈125 Tage**.
- Psychometrischer Batch‑Review: 2.500 / 50 pro Batch × 0,1 Tag = **≈5 Tage** (exkl. Kalenderzeit für Pilot‑Antworten — ein Zeitplan‑Constraint, keine Aufwand‑Kosten).

**Gesamt:** 25 + 15 + 107 + 468 + 308 + 125 + 5 ≈ 1.053 Personen‑Tage, grob 4,2 Personen‑Jahre. Ein 5‑köpfiges Team (2 Mathe‑SMEs, 1 Lokalisierungs‑Lead, 1 Editor/Psychometriker, 1 Engineer) schafft das in ≈1.053 ÷ 5 ≈ **210 Arbeitstage**, also etwa **10 Monate** — eine abgeleitete Schätzung, keine zitierte Branchenzahl.

**Geschätzte LLM‑Kosten für das Erstellen + Übersetzen** (Claude Sonnet 5 Standard‑Pricing: $3,00 Input / $15,00 Output pro Million Tokens):

- LLM‑erstellte Items, erster Entwurf (~1.500 Input + ~800 Output‑Tokens/Item): (1.500×$3 + 800×$15)/1.000.000 = **$0,0165/Item** × 715 ≈ **$12**.
- Handgeschriebene Items, LLM‑unterstützte Missverständnis‑Erstellung nur (gleiches Token‑Profil): 775 × $0,0165 ≈ **$13**.
- Vorlagen‑Autorenschaft‑Unterstützung (~5.000 Input + 2.000 Output‑Tokens/Vorlage): $0,045/Vorlage × 50 ≈ **$2**.
- Übersetzung (~800 Input + ~900 Output‑Tokens/Einheit): $0,0159/Einheit × 6.160 Einheiten ≈ **$98**.

**Roh‑Ein‑Durchlauf‑Gesamt ≈ $125.** Ein 5‑facher Sicherheits‑Multiplikator für realistische Iterationen (Validierungs‑Wiederholungen, Review‑ausgelöste Regeneration, Opus 5 für die schwierigsten Bänder) ergibt **≈ $500–$700** Gesamt‑Kosten für den gesamten Erstell‑ und Übersetzungs‑Durchlauf — immer noch unter $1.500, verdoppelt für Kontingenz, drei Größenordnungen unter den Personen‑Tag‑Kosten. Prompt‑Caching würde das weiter senken, ist hier aber nicht eingerechnet.

## Design‑Implikationen

1. Parameterisierte Vorlagen für K–8‑Arithmetik und frühe Algebra verwenden — eine WeBWorK‑artige Vorlage, die unbegrenzt numerische Varianten erzeugt [5], ist der wirkungsvollste Hebel in diesem Plan.
2. Budget für handgeschriebene Autorenschaft für 11–12 bis PhD reservieren, wo Vorlagen den geringsten Anteil (30 % bis 5 %) haben, weil beweisbasierter Inhalt sich nur schwer zufällig generieren lässt.
3. Vorlagen, nicht generierte Instanzen, übersetzen: 200 Übersetzungs‑Einheiten decken 1.010 Vorlagen‑Items ab versus 5.960 Einheiten für Einzel‑Items — der größte Lokalisierungs‑Hebel im Modell.
4. p‑Werte und Punkt‑Biserial‑Diskriminierung als provisorisch behandeln, bis Antworten vorliegen; CAT‑Literatur nennt Stichproben bis zu 1.000 Prüflinge für stabile Pre‑Test‑Statistiken [CAT wiki] — Items nicht zu `active` befördern, wenn nicht ein klar definiertes Minimum erreicht ist (offene Frage 4).
5. Items unveränderlich versionieren. Nie ein Item mit bereits vorhandenen Antworten editieren — neue Version erstellen, alte `status: retired` setzen (nie löschen), analog zum neuen/pilot/active/retired‑Lebenszyklus, der allgemein für Item‑Banks dokumentiert ist [item bank wiki].
6. QTI 3.0 schrittweise einführen — sein Konformitäts‑Modell ist explizit modular [4]; Kern‑Interaktionen und Barrierefreiheits‑Metadaten für das MVP implementieren, CAT/PCI‑Support später hinzufügen.
7. Das Review‑Gate als explizite Zustandsmaschine implementieren, die dem Feld `status` entspricht: draft → editorial → math check → accessibility → translation → pilot → psychometric screening → active/retired.
8. LLM‑API‑Kosten als vernachlässigbar (Hunderte Dollar) gegenüber den Personalkosten (Hunderttausende, laut obiger Personen‑Tag‑Rechnung) budgetieren — die eigentliche Engstelle ist SME‑ und Übersetzerzeit, nicht Token‑Verbrauch.
9. Da Forschung 2023–2026 zeigt, dass LLMs mathematisch valide, aber missverständnis‑blindes Distraktoren‑Material erzeugen [arXiv 2404.02124], muss jede LLM‑erstellte oder LLM‑unterstützte Item‑Missverständnis‑Erklärung von Menschen geprüft werden — nie ein unreviewtes LLM‑Missverständnis‑Erklärung an Larry ausliefern.
10. Erwartet, dass der ROI von Vorlagen stark nach oben abnimmt: Design‑Kosten pro Vorlage sind etwa konstant, aber eine PhD‑Vorlage liefert viel weniger sicher nutzbare Varianten als eine K‑2‑Vorlage — der Plan gewichtet den Vorlagen‑Anteil bereits nach steigender Stufe.
11. Übersetzung *nach* mathematischer Prüfung und Barrierefreiheits‑Review durchführen, nicht vorher — Übersetzung von Inhalten, die später technisch scheitern, verschwendet Übersetzerzeit.
12. Gemeinsamen Instruktions‑/Schema‑/Style‑Guide‑Text über alle Erstell‑ und Übersetzungs‑Aufrufe cachen; 715 + 775 + 6.160 Aufrufe teilen einen großen stabilen Präfix, sodass Prompt‑Caching die realisierten LLM‑Kosten weiter senken kann.
13. Item‑Expositions‑Kontrolle planen, sobald die Plattform adaptives Ausliefern unterstützt — selbst ein 2.500‑Item‑Bank profitiert vom Expositions‑Kontroll‑Prinzip, das CAT‑Systeme nutzen, um Über‑Anzeige populärer Items zu vermeiden [CAT wiki].
14. Jede Aufwand‑ und Kosten‑Zahl hier als Schätzung verstehen, die gegen einen Pilot validiert werden muss, nicht als festes Ziel — keine Quelle lieferte einen verifizierten Items‑pro‑Vorlage‑Multiplikator oder pro‑Item‑Kosten für mathematischen Inhalt; die 20×‑pro‑Vorlage und $/Item‑Zahlen sind modellierte Annahmen, als solche gekennzeichnet.

## Offene Fragen für den Projektinhaber

1. Welchen geladenen Tagessatz sollten wir für SME/Übersetzer/Editor‑Zeit ansetzen, um die ~1.053 Personen‑Tage oben in eine Budget‑Zahl zu überführen?
2. Ist 2.500 Items ein festes Ziel oder ein Minimum, mit Puffer für Themen, die mehr Items benötigen, sobald Pilot‑Daten zurückkommen?
3. Welche der 4 Nicht‑Englisch‑Sprachen können LLM‑Übersetzung + Spot‑Check nutzen (wie oben modelliert), und welche benötigen von Anfang an unabhängige menschliche Übersetzung?
4. Welcher minimale Antwort‑Count soll die Beförderung zu `active` steuern — die traditionelle CTT‑Daumenregel (oft ~30) oder der konservativere ~200–1.000‑Bereich, den die CAT‑Literatur für stabile Statistiken nennt [CAT wiki]?
5. Soll das Review‑Gate bei MVP den QTI 3.0‑Export blockieren, oder das auf einen post‑MVP‑Interoperabilitäts‑Meilenstein verschieben?
6. Advanced/Masters und PhD haben den niedrigsten Vorlagen‑Anteil und höchsten pro‑Item‑Kosten — sollten wir dafür einen spezialisierten Contractor‑SME budgetieren?
7. Soll Larrys Missverständnis‑Erklärungen einmal auf Englisch erstellt und dann übersetzt werden, oder pro Sprache unabhängig (z. B. Dezimal‑Komma‑ vs. Punkt‑Verwirrung in ES/FR/DE)?

## Quellen

1. [IXL — Math (spanisches Locale, Fähigkeitszahlen nach Klassenstufe)](https://la.ixl.com/math)  
2. [Khan/perseus — Der Übungsfrage‑Editor und Renderer von Khan Academy](https://github.com/Khan/perseus)  
3. [1EdTech — Überblick über QTI‑Standards](https://www.1edtech.org/standards/qti)  
4. [1EdTech — Leitfaden zur Implementierung/Konformität von QTI 3.0](https://www.imsglobal.org/spec/qti/v3p0/impl)  
5. [Wikipedia — WeBWorK](https://en.wikipedia.org/wiki/WeBWorK)  
6. [Wikipedia — Automatische Item‑Generierung](https://en.wikipedia.org/wiki/Automatic_item_generation)  
7. [Wikipedia — Klassische Testtheorie](https://en.wikipedia.org/wiki/Classical_test_theory)  
8. [Wikipedia — Punkt‑Biserial‑Korrelationskoeffizient](https://en.wikipedia.org/wiki/Point-biserial_correlation_coefficient)  
9. [Wikipedia — Itembank](https://en.wikipedia.org/wiki/Item_bank)  
10. [Wikipedia — Computerisiertes adaptives Testen](https://en.wikipedia.org/wiki/Computerized_adaptive_testing)  
11. [Wikipedia — Item‑Response‑Theorie](https://en.wikipedia.org/wiki/Item_response_theory)  
12. [Wikipedia — Duolingo English Test](https://en.wikipedia.org/wiki/Duolingo_English_Test)  
13. [Duolingo Research — Publikationsseite](https://research.duolingo.com/)  
14. [arXiv 2404.02124 — Untersuchung der automatisierten Ablenkungs‑Generierung für mathematische Multiple‑Choice‑Fragen mittels großer Sprachmodelle (Feng, Lee, McNichols, Scarlatos, Smith, Woodhead, Otero Ornelas, Lan)](https://arxiv.org/abs/2404.02124)  
15. [Brilliant.org — Über](https://brilliant.org/about/)  
16. [ETS Research Institute — Startseite](https://www.ets.org/research.html)
