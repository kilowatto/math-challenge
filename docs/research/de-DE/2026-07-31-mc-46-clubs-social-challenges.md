# Clubs, Gruppen‑Challenges und Einsätze: Wie man Wetten ohne Verlierer und ohne regulatorische Exposition gestaltet

> Math Challenge Forschung — 2026-07-31 — Thema 46

## Zusammenfassung (ES)

- **Illegales Glücksspiel wird in praktisch allen US‑Bundesstaatengesetzen durch drei Elemente definiert – Preis, Zufall und Gegenleistung – und alle drei müssen vorhanden sein** [1]. Das Entfernen eines Elements reicht aus. Das ist genau die Standardstrategie der Gewinnspiel‑Industrie: mindestens ein Element eliminieren [1].
- **Zufall ist hier bereits nicht vorhanden.** Eine mathematische Herausforderung wird durch Können gewonnen. Die anwendbare rechtliche Einordnung ist die eines Geschicklichkeitswettbewerbs, bei dem *„Gewinner werden nicht durch Zufall, sondern anhand messbarer Kriterien ausgewählt“* [1].
- **Gegenleistung entfällt, wenn die Plattform keinen Wert berührt.** Gegenleistung bedeutet *„Zahlung von Geld oder etwas Wertvollem zum Eintritt, oder die Voraussetzung, dass ein Kauf getätigt werden muss“* [1]. Wenn Math Challenge nichts für die Teilnahme verlangt, nichts verwahrt, nichts überträgt und nichts durchsetzt, gibt es keine Gegenleistung an die Plattform.
- **Der Preis kann ebenfalls minimiert werden:** immaterielle Belohnungen wie *„Recht zu prahlen“* haben einen minimalen Geldwert und können die gesetzliche Schwelle für einen Preis nicht erreichen [1].
- **Strava hat bereits die verlustfreie Wette umgesetzt, und sie funktioniert.** Sein *Group Goal*-Modus lässt eine Gruppe ein gemeinsames Ziel verfolgen und – laut eigener Dokumentation – *„keine Rangliste hat, sodass man sich weniger mit anderen vergleicht“* [2][3]. Er koexistiert mit Wettbewerbs‑Challenges als alternativer Modus, nicht als Ersatz.
- Strava bietet vier Arten von Gruppen‑Challenges an: *Most Activity*, *Fastest Effort*, *Longest Single Activity* und *Group Goal* – nur Letzteres ist kooperativ [2][3].
- **Der tatsächliche Jugendschutzstandard im Sport** verlangt Hintergrundprüfungen für *„jeden Freiwilligen mit der Möglichkeit zu unüberwachten oder Einzelkontakt mit Minderjährigen“*, plus eine benannte Schutzkontaktperson, die allen bekannt ist [4][5]. Das tragende Wort ist **unüberwacht**.
- Wir können keine Hintergrundprüfungen durchführen, aber wir können **so konzipieren, dass kein unüberwachter Kontakt besteht**: kein Chat, kein privater Kanal, der Club‑Besitzer sieht nur Alias und Punkte, und jeder Elternteil des Kindes genehmigt den Beitritt.
- **Kein Minderjähriger nimmt jemals an einer Challenge mit Einsatz teil.** Das hält die gesamte Glücksspiel‑Analyse von Kindern fern, wo die in `mc-17` dokumentierte regulatorische Exposition (Belgien, Niederlande, DSA, Children's Code) schwerwiegend wäre.
- **Larry moderiert den Einsatz‑Text, bevor er entsteht**, mit einer erwachsenen‑spielbezogenen Beurteilung: Der Scherz ist erlaubt; Sex, Gewalt und Herabwürdigung nicht – und nichts, das eine Person herausstellt. Es ist ein separater Aufruf vom Tutor, mit eigenem Prompt, eigenem Audit‑Log und fehlersicherem Verhalten.
- Design‑Fazit: **zwei getrennte Systeme auf der Datenebene** – `grupo_infantil` (Lehrerzimmer + Eltern‑Club, identische Regeln) und `club_adulto` (mit Challenges und Einsätzen) – sodass ein zu „Clubs“ hinzugefügtes Feature nicht versehentlich bei Kindern landet.

## Executive summary (EN)

- **Illegales Glücksspiel wird in praktisch allen US‑Bundesstaatengesetzen durch drei Elemente definiert – Preis, Zufall und Gegenleistung – und alle drei müssen vorhanden sein** [1]. Das Entfernen eines Elements reicht aus. Das ist genau die Standardstrategie der Gewinnspiel‑Industrie: mindestens ein Element eliminieren [1].
- **Zufall ist hier bereits nicht vorhanden.** Eine mathematische Herausforderung wird durch Können gewonnen. Die anwendbare Einordnung ist die eines Geschicklichkeitswettbewerbs, bei dem *„Gewinner werden nicht durch Zufall, sondern anhand messbarer Kriterien ausgewählt“* [1].
- **Gegenleistung entfällt, wenn die Plattform keinen Wert berührt.** Gegenleistung bedeutet *„Zahlung von Geld oder etwas Wertvollem zum Eintritt, oder die Voraussetzung, dass ein Kauf getätigt werden muss“* [1]. Wenn Math Challenge nichts für die Teilnahme verlangt, nichts verwahrt, nichts überträgt und nichts durchsetzt, gibt es keine Gegenleistung an die Plattform.
- **Der Preis kann ebenfalls minimiert werden:** immaterielle Belohnungen wie *„Recht zu prahlen“* haben einen minimalen Geldwert und können die gesetzliche Schwelle für einen Preis nicht erreichen [1].
- **Strava hat bereits die verlustfreie Wette umgesetzt, und sie funktioniert.** Sein *Group Goal*-Modus lässt eine Gruppe ein gemeinsames Ziel verfolgen und – laut eigener Dokumentation – *„keine Rangliste hat, sodass man sich weniger mit anderen vergleicht“* [2][3]. Er koexistiert mit Wettbewerbs‑Challenges als alternativer Modus, nicht als Ersatz.
- **Der tatsächliche Jugendschutzstandard im Sport** verlangt Hintergrundprüfungen für *„jeden Freiwilligen mit der Möglichkeit zu unüberwachten oder Einzelkontakt mit Minderjährigen“*, plus eine benannte Schutzkontaktperson, die allen bekannt ist [4][5]. Das tragende Wort ist **unüberwacht**.
- Wir können keine Hintergrundprüfungen durchführen, aber wir können **so konzipieren, dass kein unüberwachter Kontakt besteht**: kein Chat, kein privater Kanal, der Club‑Besitzer sieht nur Alias und Punkte, und jeder Elternteil des Kindes genehmigt den Beitritt.
- **Kein Minderjähriger nimmt jemals an einer Challenge mit Einsatz teil.** Das hält die gesamte Glücksspiel‑Analyse von Kindern fern, wo die in `mc-17` dokumentierte regulatorische Exposition schwerwiegend wäre.
- **Larry moderiert den Einsatz‑Text, bevor er entsteht**, mit einer erwachsenen‑spielbezogenen Beurteilung: Der Scherz ist erlaubt; Sex, Gewalt und Herabwürdigung nicht – und nichts, das eine Person herausstellt. Es ist ein separater Aufruf vom Tutor, mit eigenem Prompt, eigenem Audit‑Log und fehlersicherem Verhalten.
- Design‑Fazit: **zwei getrennte Systeme auf der Datenebene** – `grupo_infantil` und `club_adulto` – sodass ein zu „Clubs“ hinzugefügtes Feature nicht versehentlich bei Kindern landet.

## Findings

### 1. Die drei Elemente und wie man eines eliminiert

Thompson Coburn LLP fasst den Rahmen zusammen, der das Ganze regelt: Praktisch jedes staatliche Gesetz definiert illegales Glücksspiel als das gleichzeitige Vorhandensein von **Preis, Zufall und Gegenleistung**, und **alle drei müssen vorhanden sein**, damit eine Promotion als illegales Glücksspiel gilt [1]. Die gesamte Strategie der Lotterie‑Industrie besteht darin, mindestens eines davon zu entfernen.

Wie jedes davon eliminiert wird, laut derselben Quelle [1]:

- **Preis.** Schwer vollständig zu entfernen, aber immaterielle Belohnungen wie *„Recht zu prahlen“* oder die Benennung eines wöchentlichen Gewinners haben einen minimalen Geldwert und **können die gesetzliche Schwelle** für einen „Preis“ **nicht erreichen**.
- **Zufall.** Das Gewinnspiel wird zu einem Geschicklichkeitswettbewerb, bei dem *„die Gewinner nicht durch Zufall, sondern anhand eines messbaren Kriteriums ausgewählt werden“*. Alternativ wird es als Geschenk strukturiert, bei dem alle etwas erhalten.
- **Gegenleistung.** Dies ist am häufigsten zu entfernen. Sie umfasst *„die Zahlung von Geld oder etwas Wertvollem zum Eintritt, oder die Voraussetzung, dass ein Kauf getätigt werden muss“*. Bemerkenswerterweise ist das **Erfordernis, dass jemand seine Kontaktdaten sendet, keine Gegenleistung** – daher sind kostenlose Teilnahmewege im Lotterie‑Design Standard. Die rechtliche Unterscheidung hängt davon ab, ob der Teilnehmer **über das normale Kundenverhalten hinaus** etwas tun muss, um teilzunehmen.

**Wo Math Challenge steht.** Der Zufall fehlt aufgrund der Natur des Produkts: Das Lösen mathematischer Aufgaben ist ein messbares Geschicklichkeitskriterium, kein Glück. Die Gegenleistung fehlt, solange die Plattform nichts für die Teilnahme an einer Aufgabe verlangt oder etwas Wertvolles zurückhält, überträgt oder durchsetzt. Und mit den unten vorgeschlagenen Wettformen (§3) wird der Preis auf Handlungsfreiheit oder ein gemeinsames Erlebnis reduziert, also nahe der Schwelle des „Rechts zu prahlen“.

**Zwei von drei fehlen, möglicherweise alle drei.** Diese Position hängt jedoch **vollständig** davon ab, dass die Plattform niemals einen Wert berührt. An dem Tag, an dem Math Challenge $20 von jedem Teilnehmer einbehält, erscheint die Gegenleistung und die Analyse kehrt sich vollständig um. Das ist die Grenze, und sie ist nicht verschwommen.

### 2. Der bereits bestehende Präzedenzfall: Strava Group Goal

Strava bietet vier Arten von Gruppenherausforderungen an: *Most Activity* (wer die meiste Zeit, Distanz oder Höhenmeter sammelt), *Fastest Effort* (Durchschnittstempo), *Longest Single Activity* und *Group Goal* (ein gemeinsames Ziel als Gruppe verfolgen) [2][3]. Die ersten drei sind wettbewerbsorientiert mit Rangliste; die vierte nicht.

Die Strava‑Beschreibung des kooperativen Modus ist die nützlichste Design‑Beobachtung dieser gesamten Untersuchung: *„Wenn das Wettkämpfen mit deinen Freunden nicht dein Stil ist, kannst du eine Group‑Goal‑Herausforderung erstellen, um gemeinsam auf ein gemeinsames Ziel hinzuarbeiten. Diese Version der Gruppenherausforderung **hat keine Rangliste, sodass du dich weniger mit anderen vergleichst**“* [3].

Zwei Erkenntnisse sind wichtig. Erstens, **das Fehlen einer Rangliste ist die Funktion, nicht eine Einschränkung** – es ist das, was den Modus für diejenigen nützlich macht, die durch Wettbewerb demotiviert werden, genau die Zielgruppe, die `mc-18` als die identifiziert, die am unteren Ende des Boards abspringt. Zweitens, **Strava bietet es zusammen mit den wettbewerbsorientierten Optionen an, nicht anstelle davon**: Die Moduswahl trifft der Organisator der Herausforderung basierend auf seiner Gruppe. Analysen der Plattform selbst zeigen, dass Gruppenherausforderungen die Verbindung über reinen Wettbewerb stellen und die Gemeinschaft unterstützen [2].

Das stimmt mit dem überein, was bereits in `mc-18` steht: Die Meta‑Analyse von Johnson & Johnson (122 Studien, 286 Befunde) findet, dass kooperative Strukturen konsequent wettbewerbsorientierte und individualistische Strukturen sowohl in Leistung als auch in Peer‑Beziehungen übertreffen.

### 3. Was eine Wette unterhaltsam macht, zerlegt

Bevor Formen vorgeschlagen werden, lohnt es sich, zu zerlegen, was den Spaß an einer sozialen Wette erzeugt. Vier Dinge: dass **alle etwas zu verlieren haben**, dass **das Ergebnis wichtig ist**, dass **eine Anekdote entsteht**, und dass **die Gruppe etwas gemeinsam getan hat**.

**Keines der vier erfordert einen Verlierer.** Die Bestrafung des Letzten ist nicht die aktive Zutat – sie ist eine Folge der Annahme, ohne sie zu hinterfragen, dass die Wette auf jemanden fallen muss. Aus dieser Beobachtung ergeben sich drei Formen, die die vier Eigenschaften bewahren:

A · Kollektive Wette. Die Gruppe verpflichtet sich gemeinsam gegen ein gemeinsames Ziel. Man gewinnt oder verliert als Gruppe. Es ist das *Group Goal* von Strava, angewendet auf Mathematik‑Punkte, mit der kooperativen Unterstützung von Johnson & Johnson.

B · Der Gewinner wählt. Die Richtung des Preises wird umgekehrt: Der Erstplatz erhält keinen Tribut von den anderen, sondern **entscheidet** etwas für die Gruppe – die nächste Herausforderung, das Ziel des Clubs, den Ort, zu dem sie gehen. Der Preis ist **Handlungsfreiheit, kein Tribut**. Rechtlich ist dies die sauberste Form, weil eine Entscheidung keinen Geldwert hat und an die Schwelle des „Rechts zu prahlen“ stößt, die [1] als wahrscheinlich unzureichend für einen Preis bezeichnet.

C · Eigenes Commitment. Jeder wettet öffentlich gegen sein eigenes Ziel. Dies ist die am besten durch Evidenz gestützte Form: Es handelt sich um die Implementierungsabsichten von Gollwitzer, die bereits in `mc-19` dokumentiert sind, mit großen und replizierten Effekten (100 % vs. 53 % Erfüllungsrate bei Selbsttests; 4,2 kg vs. 2,1 kg Gewichtsverlust). Es ist zudem, nicht zufällig, der Mechanismus, mit dem HealthyWage argumentiert, dass es kein Glücksspiel ist: Ihr öffentliches Argument ist, dass **der Nutzer das Ergebnis jederzeit kontrolliert** [6].

### 4. Die strukturelle Eigenschaft, die Moderation überflüssig macht

Die drei Formen teilen etwas, das mehr wert ist als jede Moderationsregel: **keine hat ein Feld für einen Verlierer.**

- Bei der kollektiven Wette beschreibt der Text, was **die Gruppe** tut.
- Bei „der Gewinner wählt“ schreibt **der Gewinner** darüber, was als Nächstes geschieht.
- Beim eigenen Commitment kann nur **über sich selbst** geschrieben werden.

In keiner der drei gibt es ein Feld, das die Frage „Was passiert mit dem Letzten?“ beantwortet. Das bedeutet, dass **freier Text existieren kann, ohne dass Demütigung einen Platz hat**: Es ist nicht verboten, sie zu schreiben, aber es gibt keine Schublade im Datenmodell, um sie zu platzieren. Es ist dieselbe strukturelle Logik, mit der `mc-43` Alias‑Entscheidungen (Auswahl innerhalb einer begrenzten Menge statt freier Eingabe) löst, ein Level höher angewendet: Statt den Wortschatz zu begrenzen, wird **das Objekt, über das der Text sprechen kann**, begrenzt.

**Restliches Risiko, offen gesagt.** Das ist nicht hermetisch. Jemand könnte innerhalb einer kollektiven Wette schreiben: „Wir gehen zu Tacos und Juan rasiert sich.“ Was die Struktur garantiert, ist, dass das System Juan niemals *zuweist*, ihn nie markiert und nie durchsetzt – die Wette bleibt der Gruppe vorbehalten. Diese Lücke schließt Larry in §5, und das, was danach bleibt, wird durch Verfahren gemindert: Die Wette ist **vor** Beginn der Herausforderung sichtbar, **alle Mitglieder akzeptieren sie ausdrücklich**, um teilzunehmen, jeder kann ohne Strafe austreten, sie kann nach Beginn nicht mehr bearbeitet werden, und es gibt einen permanenten Melde‑Button. Damit ist niemand einer Wette ausgesetzt, die er nicht gelesen und akzeptiert hat.

### 5. Larry als Moderator von Aufgaben

**Entscheidung des Eigentümers:** Der freie Text der Aufgaben wird von Larry geprüft, bevor die Aufgabe existiert, mit dem expliziten Kriterium **Spiel unter Erwachsenen** — der Scherz ist erlaubt; Sex, Gewalt und Herabwürdigung nicht.

**Das verletzt nicht das Prinzip „Larry rechnet nie“.** Diese Regel, dokumentiert in `mc-37` und D-004, existiert aus einem bestimmten Grund: Ein Tutor, der Mathematik neu berechnet, macht Fehler und lehrt Fehlverhalten. Das Beurteilen, ob ein Text herabwürdigend ist, ist eine andere Aufgabe, die Sprachmodelle gut erledigen. Was jedoch übernommen wird, ist dass **es ein anderer Aufruf ist, nicht derselbe**: eigener Prompt, eigenes Modell, eigenes Logbuch und keinerlei Beziehung zum Tutor‑Endpoint.

**Das Kriterium, das Larry anwendet**, in Reihenfolge der Priorität:

1. **Zeigt es auf eine Person?** Eine Aufgabe, die eine Person nennt, die die Konsequenz trägt, wird abgelehnt, selbst wenn sie im Scherzton formuliert ist. Das ist die einzige Regel, die keinen Spielraum zulässt, weil sie die rote Linie des Produkts definiert.  
2. **Gibt es Sex, Gewalt oder Herabwürdigung?** Wird abgelehnt. Dazu zählen alles, was aufgrund von Aussehen, Gewicht, Herkunft, Fähigkeit oder irgendeinem Merkmal einer Person herabsetzt — das Larry‑Prinzip verbietet bereits, dass Humor sich auf Personenmerkmale bezieht (`mc-37`), und hier wird von dem, was Larry *sagt*, zu dem, was Larry *zulässt*, erweitert.  
3. **Ist es ein Spiel unter Erwachsenen?** Wenn 1 und 2 bestanden sind, **besteht** es. Larry ist kein Zensor des guten Geschmacks: „Der Gewinner wählt die Bar“, „Der Club zahlt die erste Runde“, „Der Gewinner wählt einen Monat lang die Playlist“ sind legitime Aufgaben und Larry muss dazu nichts sagen.

**Der Ton beim Ablehnen ist genauso wichtig wie die Ablehnung selbst.** Larry hält keine Predigt. `mc-11` ist eindeutig, dass Feedback, das an die Person statt an die Aufgabe gerichtet ist, der Mechanismus ist, durch den mehr als ein Drittel der untersuchten Interventionen **das Ergebnis verschlechtern** — und obwohl diese Erkenntnis aus dem Lernen stammt, ist der soziale Mechanismus derselbe: ein moralisierender Ablehnung macht einen Erwachsenen zum Gegner des Produkts. Larry lehnt kurz, in der Rolle, ohne Lehre ab: *„Das muss ich zurückweisen – das betrifft die ganze Gruppe in der Aufgabe, nicht nur eine Person. Sollen wir es noch einmal versuchen?“*

**Fehlertolerantes Verhalten.** Wenn der Moderationsaufruf fehlschlägt oder abläuft, wird die Aufgabe **nicht veröffentlicht**. Es wird angezeigt, dass Larry sie nicht prüfen konnte, und ein erneuter Versuch wird angeboten. Unter keinen Fehlbedingungen wird Text unverprüft veröffentlicht — der günstige Fehlmodus ist ein verärgerter Nutzer, der teure Fehlmodus ist eine veröffentlichte Demütigung, die das Produkt versprochen hat, nicht zulassen zu können.

**Routing und Kosten.** Das Volumen ist im Vergleich zum Tutor trivial: ein Aufruf pro erstellter Aufgabe, nicht pro Versuch. Haiku 4,5 reicht für den klaren Fall, mit Eskalation zu Sonnet 5, wenn das Urteil geringes Vertrauen hat — die Nuance zwischen „Scherz unter Freunden“ und „Herabwürdigung“ ist genau dort, wo ein kleines Modell in beide Richtungen Fehler macht. Mit dem Routing von D-015 und dem Ausgabenlimit des AI‑Gateway bewegt sich das nicht wesentlich im Budget.

**False Positive und Beschwerde.** Larry wird Fehler machen und legitime Scherze ablehnen. Ohne Beschwerdeweg fühlt sich das wie Zensur an und wird zu Beschwerden führen. Jede abgelehnte Aufgabe muss per Knopfdruck zur menschlichen Prüfung weitergeleitet werden können, und diese Warteschlange benötigt einen Verantwortlichen und zugesagte Antwortzeiten — dieselbe Warteschlange wie bei Meldungen.

**Logbuch.** Jede Entscheidung wird erfasst: vorgeschlagener Text, Urteil, Modell, Grund und Vertrauen. Es dient drei Zwecken: den Prompt mit realen Fällen zu verfeinern, Beschwerden mit Beweisen zu lösen und zu erkennen, wer versucht, dasselbe zehnmal mit Varianten zu wiederholen.

### 6. Die Elternclubs und der reale Schutzstandard

Die Literatur zu Jugendsport ist die nächstliegende Referenz zu „ein Erwachsener organisiert eine Aktivität für fremde Kinder“. Der allgemein berichtete Standard verlangt eine Hintergrundüberprüfung für *„jede*n Freiwillige*n mit Möglichkeit zu unbeaufsichtigtem oder eins‑zu‑eins Kontakt zu Minderjährigen“* — einschließlich Elternkoordinatoren, die Aktivitäten organisieren oder Kommunikation managen, die Kontakt zu Kindern beinhaltet [4][5]. Eine minimale Überprüfung deckt bundesweite Strafregister und das Register sexueller Straftäter ab; es wird empfohlen, sie jährlich oder pro Saison zu wiederholen, mit vorheriger schriftlicher Einwilligung [4][5]. Und strukturell muss **eine benannte Person existieren, deren Name und Kontakt alle kennen**, als erste Anlaufstelle bei jeglichen Schutzbedenken [5].

**Math Challenge kann keine Hintergrundüberprüfung durchführen**, und das Vortäuschen wäre schlimmer als das Unterlassen. Aber die Definition selbst weist auf das Risiko hin: **unbeaufsichtigter Kontakt**. Die Design‑Lösung ist, die gesamte Kategorie zu entfernen:

- **Kein Chat und keine Direktnachrichten, in irgendeiner Richtung, niemals.** Das ist bereits die Regel für Lehrkräfte (D-011); sie wird identisch auf Clubs ausgeweitet.  
- **Der Club‑Besitzer sieht ausschließlich Alias, Punkte und Rangfolge.** Weder echter Name, noch genaues Alter, noch Foto, noch andere Gruppen, denen das Kind angehört.  
- **Der Vater jedes Kindes genehmigt den Eintritt** und sieht die deklarierte Identität des Besitzers, bevor er zustimmt — das umgekehrte Muster von ClassDojo, das `mc-28` als den einzigen in der Branche bestätigten Sicherheitsmechanismus identifiziert.  
- **Einladung erfolgt durch Teilen eines Codes mit den Eltern**, niemals durch Suchen oder Kontaktieren von Kindern.  
- **Harte Obergrenze kleiner als ein Klassenraum**: Ein Club ist eine Freundesgruppe, keine Schule.  
- **Dauerhafter Melde‑Button** und vollständiges Logbuch von Anmeldungen, Genehmigungen und Abmeldungen.

Die ehrliche Feststellung daraus: **Ein Elternclub ist genau deshalb sicher, weil er anämisch ist.** Es ist ein geteiltes Brett, kein sozialer Raum. Jedes Mal, wenn jemand vorschlägt, Chat, Fotos oder Profile hinzuzufügen, ist die Antwort hier bereits festgeschrieben, mit ihrer Begründung.

### 7. Warum zwei Systeme und nicht eines mit Flagge

`grupo_infantil` (das den Lehrer‑Klassenraum und den Elternclub abdeckt, mit identischen Sicherheitsregeln) und `club_adulto` (mit Herausforderungen und Aufgaben) müssen **separate Strukturen in der Datenbank** sein, nicht eine Tabelle mit einem Feld `tipo`.

Der Grund liegt nicht im Modellieren, sondern im Fehlermodus. Mit einer einzigen Tabelle würde, sobald jemand freien Text, Nachrichten oder Bild‑Uploads zu „den Clubs“ hinzufügt, diese Funktion standardmäßig auch auf die Kindergruppen wirken, und der Schutz hinge davon ab, dass der Entwickler die Regel im Kopf behält. Mit zwei Strukturen kann das Hinzufügen von freiem Text zum Erwachsenen‑Club **nicht** die Kinder berühren, selbst wenn niemand die Regel erinnert. Das ist der Unterschied zwischen einer Konvention und einem Schloss.

## Tabelle der Aufgabenformen

| Form | Wer trägt die Konsequenz | Positions‑Tabelle | Unterstützung | Rechtliches Element, das entfernt wird |
|---|---|---|---|---|
| **A · Kollektiv** | Die gesamte Gruppe gemeinsam | Nein (nach Design) | Strava Group Goal [2][3]; Johnson & Johnson via `mc-18` | Preis (gemeinsames Erlebnis, ohne Transfer) |
| **B · Der Gewinner wählt** | Niemand; der Erste gewinnt die Agentur | Ja | Thompson Coburn zu immateriellen Preisen [1] | Preis (Entscheidung hat keinen Geldwert) |
| **C · Eigenes Commitment** | Man selbst, gegen das eigene Ziel | Optional | Gollwitzer via `mc-19`; Haltung von HealthyWage [6] | Zufall (du kontrollierst dein Ergebnis vollständig) |
| ~~Castigo al último~~ | ~~Der Zurückgebliebene~~ | — | **Verboten**: rote Linie #7, `mc-18` über Schaden im Brettgrund | — |
| ~~Tributo entre miembros~~ | ~~Die Verlierer zahlen an den Gewinner~~ | — | **Verboten**: erzeugt Preis + Werttransfer zwischen Personen | — |

## Design implications

1. **Kein Minderjähriger betritt jemals eine Herausforderung mit Wette.** Kindergruppen haben Ziele und Feiern; die Wetten existieren ausschließlich im `club_adulto`. Das schließt Kinder aus der gesamten Analyse von §1 aus.  
2. **Die Plattform berührt niemals den Wert**: Sie erhebt keine Gebühr für die Teilnahme an einer Herausforderung, behält nichts zurück, überträgt nichts, schiedet nicht und setzt nichts durch. Die Wette ist ein soziales Abkommen, das das Produkt anzeigt, keine Verpflichtung, die das Produkt verwaltet. Sie ist die einzige Bedingung, die die Position von §1 stützt.  
3. **Die drei Formen der Wette (A, B, C) werden als unterschiedliche Typen implementiert**, nicht als Textvarianten desselben Objekts — weil jede einen anderen grammatischen Subjekt hat (die Gruppe, der Gewinner, man selbst) und genau dieser Unterschied die Verlierer‑Kästchen (§4) eliminiert.  
4. **Es gibt kein Feld, das fragt, was mit dem Letzten passiert**, in keiner Form, auf keinem Bildschirm, in keiner API.  
5. **Larry prüft jede freie Textwette, bevor sie existiert**, nach dem Dreischritt‑Kriterium von §5: das Markieren einer Person wird immer abgelehnt, Sex/Violenz/Denigration werden abgelehnt, und alles andere wird ohne Larrys Meinung durchgelassen.  
6. **Die Moderation ist ein separater Aufruf vom Tutor** — eigener Prompt, eigenes Logbuch, eigene Weiterleitung (Haiku 4.5 mit Eskalation zu Sonnet 5 bei niedriger Vertrauensstufe). Sie teilt weder Endpunkt noch Prompt mit Larry Profe.  
7. **Fehlertolerant: Wenn Larry nicht prüfen kann, wird die Wette nicht veröffentlicht.** Es gibt niemals ungeprüften Text in Produktion, unter keiner Fehlbedingung.  
8. **Larry lehnt kurz und in Rolle ab, ohne Predigt** — eine moralisierende Ablehnung macht den Erwachsenen zum Gegner des Produkts, und Larrys Kanon verbietet bereits den herablassenden Ton (`mc-11`, `mc-37`).  
9. **Jede abgelehnte Wette hat einen menschlichen Überprüfungs‑Appeal mit einem Hinweis.** Larry wird legitime Scherze zurückweisen, und ohne Appeal fühlt sich das wie Zensur an.  
10. **Jede Wette wird von jedem Mitglied ausdrücklich akzeptiert, bevor die Herausforderung startet**, ist vorher sichtbar, kann nach dem Start nicht mehr bearbeitet werden, und jeder kann die Herausforderung ohne Strafe oder Hinweis verlassen (§4).  
11. **Permanent‑Melde‑Button bei jeder Wette und jedem Club**, mit menschlicher Überprüfung — die zweite Ebene, für das, was Larry durchrutschen lässt.  
12. **Zwei getrennte Datenstrukturen**, `grupo_infantil` und `club_adulto`, damit keine soziale Funktion, die zu den Erwachsenen hinzugefügt wird, Kinder durch Unterlassung erreichen kann (§7).  
13. **Der Besitzer einer Kinderguppe sieht Alias, Punkte und Serie. Nichts weiter.** Weder echten Namen, noch genaues Alter, noch Zugehörigkeit zu anderen Gruppen.  
14. **Kein privater Erwachsen‑Kind‑Kanal**, in jeder Kinderguppe, sei es von Lehrern oder Eltern — die direkte Minderung des von §6 identifizierten realen Risikos.  
15. **Der Vater jedes Kindes genehmigt, indem er vorher die deklarierte Identität des Club‑Besitzers einsehen kann**, mit sichtbarem Abzeichen, wenn diese Identität nicht verifiziert ist.  
16. **Größenobergrenze für Kindergroups kleiner als die für Klassen**, und Begrenzung der Clubs pro Konto, weil die unbegrenzte Erstellung von Gruppen die Hebelwirkung wäre, die ein Missbraucher nutzen würde.  
17. **Vollständiges und sichtbares Logbuch für den Vater** darüber, wer Zugang beantragt hat, wer genehmigt hat und wann — das Gegenstück zum „benannten Schutzkontakt“, den [5] fordert, angepasst an ein Produkt ohne Personal.  
18. **Den Eltern‑Club nicht als Äquivalent zur Aufsicht eines echten Sportclubs darstellen.** Ehrlicher Text: Es ist ein gemeinsam genutztes Board zwischen Familien, die sich bereits kennen, kein überwacht‑Programm.  
19. **Die rechtliche Position von §1 schriftlich festhalten und vor der Aktivierung von Wetten in irgendeinem Markt mit einem Anwalt prüfen** — dieses Dokument ist Forschung, keine Rechtsberatung, und die Schlussfolgerung „zwei von drei Elementen fehlen“ hängt von Produktfakten ab, die ein Roadmap‑Wechsel ungültig machen können.

## Open questions for the project owner

1. Kann ein Jugendlicher im Alter von 12‑17 Jahren in einem `club_adulto` sein? Die Standardantwort dieses Dokuments ist **nein** (Implikation 1), aber das schließt den Fall einer Gruppe von Cousins oder von Klassenkameraden aus.  
2. Beginnt der Katalog der Wetten leer mit freiem Text ab Tag 1, oder wird er mit kuratierten Beispielen besät, die den erwarteten Ton zeigen? Das Besäen ist die günstige Art, die Regel zu kommunizieren, ohne sie zu verbieten.  
3. Ist die ausdrückliche Annahme der Wette (Implikation 5) pro Herausforderung oder einmalig pro Club? Pro Herausforderung ist sicherer, aber lästiger.  
4. Beeinflussen die Herausforderungen von Erwachsen‑Clubs das globale Board, oder sind sie im Club isoliert? Wenn sie Einfluss haben, muss die Expositionskontrolle der Items `mc-29` überprüft werden.  
5. Wer bearbeitet die Warteschlange für Appeals und Meldungen (Implikationen 9 und 11) und mit welcher zugesagten Reaktionszeit? Ist dieselbe Person für beide Warteschlangen zuständig oder sind es zwei Personen.  
6. Wenn Larry eine Wette ablehnt, sagt er dem Autor **welche** der drei Regeln verletzt wurde, oder nur, dass sie nicht bestand? Das zu sagen hilft beim Korrigieren; es lehrt auch, den Filter zu umgehen.  
7. Wird der Moderations‑Prompt von Larry pro Sprache erstellt oder übersetzt? Der abwertende Ton ist stark kulturell geprägt — was in Mexiko ein Scherz unter Freunden ist, kann in Deutschland anders sein, und umgekehrt.  
8. Darf ein Kinder‑Club Kinder mehrerer Familien mischen, die **nicht** miteinander bekannt sind, oder ist es auf Familien beschränkt, die bereits eine vorherige Bindung haben? Das ist der Unterschied zwischen einem begrenzten und einem offenen Risiko.

## Sources

1. Thompson Coburn LLP, „Shield your sweepstakes from gambling laws“ — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — Quelle der drei Elemente, der zitierten Definitionen von „Consideration“ und „Chance“ sowie der Beobachtung zu immateriellen Preisen.  
2. Strava Community Hub, „Combining Competition and Collaboration with Group Challenges“ — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494  
3. Strava Support, „Group Challenges“ — https://support.strava.com/en-us/articles/15401736-group-challenges — Quelle der vier Herausforderungstypen und des Zitats über das bewusste Fehlen einer Rangliste im Group Goal.  
4. JDP, „The Ultimate Guide to Background Checks for Youth Sports Volunteers“ — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/  
5. TidyHQ, „SafeSport Compliance Checklist for US Youth Sports Organizations“ — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — Quelle des Standards für „unüberwachten Kontakt“ und der Anforderung eines benannten Schutzkontakts.  
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — Quelle der öffentlichen Position, dass der Nutzer das Ergebnis kontrolliert, hier als Argumentationspräzedenz, nicht als rechtliche Validierung verwendet.  
7. Interne Untersuchung: `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson zu kooperativen Strukturen; konzentrierter Schaden im Board‑Hintergrund), `2026-07-31-mc-19-habit-loops-push-notifications.md` (Implementierungsabsichten von Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (Lehrerverifikationslücke, T‑5), `2026-07-31-mc-43-avatars-identity-progression.md` (beschränkte Auswahl statt freier Eingabe), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (regulatorische Exposition von Glücksspiel‑Mechaniken mit Minderjährigen), `2026-07-31-mc-37-larry-profe-port.md` (Larry‑Kanon, Modell‑Routing, Muster des separaten Aufrufs), `2026-07-31-mc-11-feedback-formative-assessment.md` (warum moralistische Ablehnung kontraproduktiv ist).  

**Dies ist Forschung, keine Rechtsberatung.** Die Schlussfolgerung von §1 — dass mindestens zwei der drei Elemente fehlen — beruht auf Produktfakten (die Plattform erhebt keine Gebühren, behält nichts zurück, überträgt nichts, setzt nichts durch), die weiterhin zutreffen müssen, damit die Schlussfolgerung Bestand hat. Ein Anwalt muss sie prüfen, bevor Wetten in irgendeinem Markt aktiviert werden, und die Quelle [1] stammt aus dem Jahr 2011 und ist US‑amerikanisch: sie deckt weder Mexiko, Brasilien noch die EU ab, wo `mc-17` bereits dokumentiert hat, dass Belgien und die Niederlande Glücksspiel‑Mechaniken strenger regulieren als die USA.
