# Clubs, retos de grupo y prendas: cómo tener apuestas sin perdedor y sin exposición regulatoria

> Math Challenge research — 2026-07-31 — topic 46

## Zusammenfassung (ES)

- **Illegales Glücksspiel wird, in praktisch allen US‑Bundesstaatengesetzen, durch drei Elemente definiert: Preis, Zufall und Gegenleistung — und alle drei müssen vorhanden sein** [1]. Es reicht, eines zu entfernen, um außerhalb zu liegen. Die Standardstrategie der Gewinnspiel‑Industrie ist genau das: mindestens ein Element entfernen [1].
- **Der Zufall fehlt hier bereits.** Eine mathematische Herausforderung wird durch Können gewonnen, nicht durch Glück. Die anwendbare juristische Einordnung ist die von Geschicklichkeitswettbewerben, bei denen *"die Gewinner nicht durch Zufall, sondern anhand messbarer Kriterien ausgewählt werden"* [1].
- **Die Gegenleistung entfällt, wenn die Plattform nichts von Wert berührt.** Gegenleistung bedeutet *"Zahlung von Geld oder etwas Wertvollem zum Eintritt, oder die Voraussetzung, dass ein Kauf getätigt werden muss"* [1]. Wenn Math Challenge nichts für die Teilnahme an einer Herausforderung verlangt, nichts verwahrt, nichts überträgt und nichts durchsetzt, gibt es keine Gegenleistung gegenüber der Plattform.
- **Der Preis kann ebenfalls minimiert werden:** immaterielle Belohnungen wie *"Recht zu prahlen"* haben einen minimalen Geldwert und können die gesetzliche Schwelle für einen „Preis“ nicht erreichen [1].
- **Strava hat bereits die verlustfreie Wette umgesetzt, und sie funktioniert.** Sein Modus *Group Goal* lässt die Gruppe ein gemeinsames Ziel verfolgen und — laut eigener Dokumentation — *"keine Rangliste hat, sodass man sich weniger mit anderen vergleicht"* [2][3]. Er koexistiert mit Wettbewerbs‑Herausforderungen als alternativer Modus, nicht als Ersatz.
- Strava bietet vier Arten von Gruppenherausforderungen an: *Most Activity*, *Fastest Effort*, *Longest Single Activity* und *Group Goal* — nur die letzte ist kooperativ [2][3].
- **Der tatsächliche Schutzstandard im Jugendsport** verlangt Hintergrundprüfungen für *"jede Freiwillige/r mit der Möglichkeit zu unüberwachten oder eins‑zu‑eins‑Kontakt mit Minderjährigen"*, plus eine als Schutzkontakt benannte Person, die allen bekannt ist [4][5]. Das entscheidende Wort ist **unüberwacht**.
- Wir können keine Hintergrundprüfungen durchführen, aber wir können **so konzipieren, dass kein unüberwachter Kontakt entsteht**: kein Chat, kein privater Kanal, der Club‑Besitzer sieht nur Alias und Punkte, und der Elternteil jedes Kindes genehmigt den Beitritt.
- **Kein Minderjähriger nimmt jemals an einer Herausforderung mit Einsatz teil.** Das hält die gesamte Glücksspiel‑Analyse von Kindern fern, wo die in `mc-17` dokumentierte regulatorische Exposition (Belgien, Niederlande, DSA, Children's Code) schwerwiegend wäre.
- **Larry moderiert den Einsatz‑Text, bevor er entsteht**, nach erwachsenen‑spiel‑Kriterien: Der Scherz darf bleiben, Sex, Gewalt und herabwürdigende Inhalte nicht — und nichts, was eine Person herausstellt. Es ist ein separater Aufruf vom Tutor, mit eigenem Prompt, eigenem Protokoll und fehlertolerantem Verhalten.
- Design‑Fazit: **zwei getrennte Systeme in der Datenbank** — `grupo_infantil` (Lehrersalon + Eltern‑Club, identische Regeln) und `club_adulto` (mit Herausforderungen und Einsätzen) — damit eine zu „Clubs“ hinzugefügte Funktion nicht versehentlich bei Kindern landet.

## Zusammenfassung (EN)

- **Illegales Glücksspiel wird, in praktisch allen US‑Bundesstaatengesetzen, durch drei Elemente definiert — Preis, Zufall und Gegenleistung — und alle drei müssen vorhanden sein** [1]. Das Entfernen eines Elements reicht aus. Das ist exakt die Standardstrategie der Gewinnspiel‑Industrie: mindestens ein Element eliminieren [1].
- **Der Zufall fehlt hier bereits.** Eine mathematische Herausforderung wird durch Können gewonnen. Die anwendbare Einordnung ist die eines Geschicklichkeitswettbewerbs, bei dem *"Gewinner nicht durch Zufall, sondern anhand messbarer Kriterien ausgewählt werden"* [1].
- **Gegenleistung entfällt, wenn die Plattform nie etwas von Wert berührt.** Gegenleistung bedeutet *"Zahlung von Geld oder etwas Wertvollem zum Eintritt, oder die Voraussetzung, dass ein Kauf getätigt werden muss"* [1]. Wenn Math Challenge nichts für die Teilnahme verlangt, nichts verwahrt, nichts überträgt und nichts durchsetzt, fließt keine Gegenleistung zur Plattform.
- **Der Preis kann ebenfalls minimiert werden:** immaterielle Belohnungen wie *"Recht zu prahlen"* haben einen minimalen Geldwert und können die gesetzliche Schwelle für einen Preis nicht erreichen [1].
- **Strava hat bereits die verlustfreie Wette bereitgestellt, und sie funktioniert.** Sein *Group Goal*-Modus lässt eine Gruppe ein gemeinsames Ziel verfolgen und — laut eigener Dokumentation — *"keine rangbasierte Bestenliste hat, sodass man sich weniger mit anderen vergleicht"* [2][3]. Er koexistiert mit Wettbewerbs‑Herausforderungen als alternativer Modus, nicht als Ersatz.
- **Der tatsächliche Schutzstandard im Jugendsport** verlangt Hintergrundprüfungen für *"jede Freiwillige/r mit der Möglichkeit zu unüberwachten oder eins‑zu‑eins‑Kontakt mit Minderjährigen"*, plus einen benannten Schutzkontakt, der allen bekannt ist [4][5]. Das tragende Wort ist **unüberwacht**.
- Wir können keine Hintergrundprüfungen durchführen, aber wir können **so konzipieren, dass kein unüberwachter Kontakt entsteht**: kein Chat, kein privater Kanal, der Club‑Besitzer sieht nur Alias und Punkte, und jeder Elternteil des Kindes genehmigt den Beitritt.
- **Kein Minderjähriger nimmt jemals an einer Herausforderung mit Einsatz teil.** Das hält die gesamte Glücksspiel‑Analyse von Kindern fern, wo die in `mc-17` dokumentierte regulatorische Exposition schwerwiegend wäre.
- **Larry moderiert den Einsatz‑Text, bevor er entsteht**, nach erwachsenen‑spiel‑Kriterien: Der Scherz darf bleiben; Sex, Gewalt und Herabwürdigung nicht — und nichts, was eine Person herausstellt. Es ist ein separater Aufruf vom Tutor, mit eigenem Prompt, Audit‑Log und fehlertolerantem Verhalten.
- Design‑Fazit: **zwei getrennte Systeme auf der Datenebene** — `grupo_infantil` und `club_adulto` — damit ein zu „Clubs“ hinzugefügtes Feature nicht versehentlich bei Kindern landet.

## Ergebnisse

### 1. Die drei Elemente und wie man eines eliminiert

Thompson Coburn LLP fasst den Rahmen zusammen, der all dies regelt: Praktisch jedes staatliche Gesetz definiert illegales Glücksspiel als das gleichzeitige Vorhandensein von **Preis, Zufall und Gegenleistung**, und **alle drei müssen vorhanden sein**, damit eine Promotion als illegales Glücksspiel gilt [1]. Die gesamte Strategie der Lotterie‑Industrie besteht darin, mindestens eines zu entfernen.

Wie jedes davon gemäß derselben Quelle [1] eliminiert wird:

- **Preis.** Schwer vollständig zu entfernen, aber immaterielle Belohnungen wie *„Recht zu prahlen“* oder die wöchentliche Gewinnerbenennung haben einen minimalen Geldwert und **können die gesetzliche Schwelle** für einen „Preis“ **nicht erreichen**.
- **Zufall.** Das Gewinnspiel wird zu einem Geschicklichkeitswettbewerb, bei dem *„die Gewinner nicht durch Zufall, sondern anhand eines messbaren Kriteriums ausgewählt werden“*. Alternativ wird es als Geschenk strukturiert, bei dem alle etwas erhalten.
- **Gegenleistung.** Dies ist am häufigsten zu entfernen. Sie umfasst *„die Zahlung von Geld oder etwas Wertvollem, um teilzunehmen, oder die Voraussetzung, dass ein Kauf getätigt werden muss“*. Bemerkenswerterweise ist das Verlangen, dass jemand **seine Kontaktdaten sendet, keine Gegenleistung** – daher sind kostenlose Teilnahmewege im Design von Gewinnspielen Standard. Die rechtliche Unterscheidung hängt davon ab, ob der Teilnehmer etwas **über das normale Kundenverhalten hinaus** tun muss, um teilzunehmen.

**Wo Math Challenge steht.** Der Zufall fehlt aufgrund der Natur des Produkts: Das Lösen mathematischer Aufgaben ist ein messbares Geschicklichkeitskriterium, kein Glück. Die Gegenleistung fehlt, solange die Plattform nichts für die Teilnahme an einer Aufgabe berechnet oder etwas Wertvolles zurückhält, überträgt oder durchsetzt. Und mit den unten vorgeschlagenen Einsatzformen (§3) wird der Preis auf Handlungsfreiheit oder ein gemeinsames Erlebnis reduziert, also nahe der Schwelle des „Rechts zu prahlen“.

**Zwei von drei fehlen, möglicherweise alle drei.** Diese Position hängt jedoch **vollständig** davon ab, dass die Plattform niemals einen Wert berührt. An dem Tag, an dem Math Challenge $20 von jedem Teilnehmer einbehält, erscheint die Gegenleistung und die Analyse kehrt sich vollständig um. Das ist die Grenze, und sie ist nicht verschwommen.

### 2. Der bereits bestehende Präzedenzfall: Strava Group Goal

Strava bietet vier Arten von Gruppenherausforderungen an: *Most Activity* (wer die meiste Zeit, Distanz oder Höhenmeter sammelt), *Fastest Effort* (Durchschnittstempo), *Longest Single Activity* und *Group Goal* (ein gemeinsames Ziel als Gruppe verfolgen) [2][3]. Die ersten drei sind wettbewerbsorientiert mit Rangliste; die vierte nicht.

Die Strava‑Beschreibung des kooperativen Modus ist die nützlichste Design‑Beobachtung dieser gesamten Untersuchung: *„Wenn du nicht gerne mit deinen Freunden konkurrierst, kannst du eine Group‑Goal‑Herausforderung erstellen, um gemeinsam auf ein gemeinsames Ziel hinzuarbeiten. Diese Version der Gruppenherausforderung **hat keine Rangliste, sodass du dich weniger mit anderen vergleichst**“* [3].

Zwei Erkenntnisse sind wichtig. Erstens, **das Fehlen einer Rangliste ist die Funktion, nicht eine Einschränkung** – es ist das, was den Modus für diejenigen nützlich macht, die durch Konkurrenz demotiviert werden, genau die Zielgruppe, die `mc-18` als die identifiziert, die am unteren Ende des Boards abspringt. Zweitens, **Strava bietet es zusammen mit den wettbewerbsorientierten Optionen an, nicht anstelle davon**: Die Moduswahl trifft der Organisator der Herausforderung basierend auf seiner Gruppe. Analysen der Plattform selbst zeigen, dass Gruppenherausforderungen die Verbindung über reinen Wettbewerb stellen und die Gemeinschaft unterstützen [2].

Dies stimmt mit dem, was bereits in `mc-18` steht, überein: Die Meta‑Analyse von Johnson & Johnson (122 Studien, 286 Befunde) findet, dass kooperative Strukturen konsequent wettbewerbsorientierte und individualistische Strukturen sowohl in Leistung als auch in Peer‑Beziehungen übertreffen.

### 3. Was eine Wette spaßig macht, zerlegt

Bevor Formen vorgeschlagen werden, lohnt es sich, zu zerlegen, was den Genuss einer sozialen Wette erzeugt. Vier Dinge: dass **alle etwas zu verlieren haben**, dass **das Ergebnis zählt**, dass **eine Anekdote entsteht**, und dass **die Gruppe etwas gemeinsam getan hat**.

**Keines der vier erfordert einen Verlierer.** Die Bestrafung des Letzten ist nicht die treibende Zutat – sie ist eine Konsequenz der Annahme, ohne sie zu hinterfragen, dass die Wette auf jemanden fallen muss. Aus dieser Beobachtung ergeben sich drei Formen, die die vier Eigenschaften bewahren:

**A · Kollektiver Einsatz.** Die Gruppe verpflichtet sich gemeinsam gegen ein gemeinsames Ziel. Man gewinnt oder verliert als Gruppe. Es ist das *Group Goal* von Strava, angewendet auf Mathematik‑Punkte, mit der kooperativen Unterstützung von Johnson & Johnson.

**B · Der Gewinner wählt.** Die Richtung des Preises wird umgekehrt: Der Erstplatz erhält keinen Tribut von den anderen, sondern **entscheidet** etwas für die Gruppe – die nächste Herausforderung, das Ziel des Clubs, den Ort, zu dem sie gehen. Der Preis ist **Handlungsfreiheit, kein Tribut**. Rechtlich ist dies die sauberste Form, weil eine Entscheidung keinen Geldwert hat und an die Schwelle des „Rechts zu prahlen“ stößt, die [1] als wahrscheinlich unzureichend für einen Preis bezeichnet.

**C · Eigenes Commitment.** Jeder wettet öffentlich gegen sein eigenes Ziel. Das ist die am besten durch Evidenz gestützte Form: Es sind die Implementierungsabsichten von Gollwitzer, bereits dokumentiert in `mc-19`, mit großen und replizierten Effekten (100 % vs. 53 % Erfüllungsrate bei Selbsttests; 4,2 kg vs. 2,1 kg Gewichtsverlust). Es ist zudem, nicht zufällig, der Mechanismus, mit dem HealthyWage behauptet, dass es kein Glücksspiel ist: Ihr öffentliches Argument ist, dass **der Nutzer das Ergebnis jederzeit kontrolliert** [6].

### 4. Die strukturelle Eigenschaft, die Moderation überflüssig macht

Die drei Formen teilen etwas, das mehr wert ist als jede Moderationsregel: **keine hat ein Verlierer‑Feld**.

- Bei dem kollektiven Einsatz beschreibt der Text, was **die Gruppe** tut.
- Bei „Der Gewinner wählt“ schreibt **der Gewinner**, worüber es weitergeht.
- Beim eigenen Commitment kann nur **über sich selbst** geschrieben werden.

In keiner der drei gibt es ein Feld, das die Frage „Was passiert mit dem Letzten?“ beantwortet. Das bedeutet, dass **freier Text existieren kann, ohne dass Demütigung einen Platz zum Landen hat**: Es ist nicht verboten, sie zu schreiben, aber es gibt keine Schublade im Datenmodell, in die sie passt. Es ist dieselbe strukturelle Logik, mit der `mc-43` Alias‑Entscheidungen (Auswahl innerhalb einer begrenzten Menge statt freier Eingabe) löst, ein Level höher angewendet: Statt den Wortschatz zu begrenzen, wird **das Objekt, über das der Text sprechen kann**, begrenzt.

**Restrisiko, offen gesagt.** Das ist nicht hermetisch. Jemand könnte innerhalb eines kollektiven Einsatzes schreiben: „Wir gehen Tacos essen und Juan rasiert sich.“ Was die Struktur garantiert, ist, dass das System Juan niemals *zuweist*, ihn nie markiert und nie durchsetzt – der Einsatz bleibt der Gruppe vorbehalten. Diese Lücke schließt Larry in §5, und das, was danach bleibt, wird durch Verfahren gemindert: Der Einsatz ist **vor** Beginn der Herausforderung sichtbar, **alle Mitglieder akzeptieren ihn ausdrücklich**, um teilzunehmen, jeder kann ohne Strafe austreten, er kann nach Beginn nicht mehr bearbeitet werden, und es gibt einen permanenten Melde‑Button. Damit ist niemand einer Wette ausgesetzt, die er nicht gelesen und akzeptiert hat.

### 5. Larry als Moderator von Aufgaben

**Entscheidung des Eigentümers:** Der freie Text der Aufgaben wird von Larry geprüft, bevor die Aufgabe existiert, mit dem expliziten Kriterium **Spiel unter Erwachsenen** — der Scherz ist erlaubt; Sex, Gewalt und Herabwürdigung nicht.

**Das verletzt nicht das Prinzip „Larry rechnet nie“.** Diese Regel, dokumentiert in `mc-37` und D-004, existiert aus einem bestimmten Grund: Ein Tutor, der Mathematik neu berechnet, macht Fehler und lehrt Fehlverhalten. Das Beurteilen, ob ein Text herabwürdigend ist, ist eine andere Aufgabe, und eine, die Sprachmodelle gut erledigen. Was jedoch übernommen wird, ist dass **es ein anderer Aufruf ist, nicht derselbe**: eigener Prompt, eigenes Modell, eigenes Logbuch und keinerlei Beziehung zum Tutor‑Endpoint.

**Das Kriterium, das Larry anwendet**, in Reihenfolge der Priorität:

1. **Zeigt es auf eine Person?** Eine Aufgabe, die eine Person namentlich nennt, die die Konsequenz trägt, wird abgelehnt, selbst wenn sie scherzhaft gemeint ist. Das ist die einzige Regel, die keinen Spielraum zulässt, weil sie die rote Linie des Produkts definiert.
2. **Enthält sie Sex, Gewalt oder Herabwürdigung?** Sie wird abgelehnt. Das schließt alles ein, was aufgrund von Aussehen, Gewicht, Herkunft, Fähigkeit oder irgendeinem Merkmal einer Person herabsetzt — das Larry‑Prinzip verbietet bereits, dass Humor sich über Personenmerkmale lustig macht (`mc-37`), und hier wird erweitert von dem, was Larry *sagt* zu dem, was Larry *zulässt*.
3. **Ist es ein Spiel unter Erwachsenen?** Wenn 1 und 2 bestanden sind, **besteht es**. Larry ist kein Geschmackscensor: „Der Gewinner wählt die Bar“, „Der Club zahlt die erste Runde“, „Der Gewinner wählt einen Monat lang die Playlist“ sind legitime Aufgaben, und Larry muss dazu nichts sagen.

**Der Ton beim Ablehnen ist genauso wichtig wie die Ablehnung selbst.** Larry hält keine Predigten. `mc-11` macht deutlich, dass Feedback, das an die Person statt an die Aufgabe gerichtet ist, der Mechanismus ist, durch den mehr als ein Drittel der untersuchten Interventionen das Ergebnis **verschlechtert** — und obwohl dieser Befund zum Lernen gehört, ist der soziale Mechanismus derselbe: Eine moralisierende Ablehnung macht einen Erwachsenen zum Gegner des Produkts. Larry lehnt kurz, in Rolle, ohne Lehre ab: *„Das muss ich zurückweisen — die gesamte Gruppe bleibt bei der Aufgabe, nicht nur einer. Geben wir ihr noch eine Runde?“*

**Fehlertolerantes Verhalten.** Wenn der Moderationsaufruf fehlschlägt oder abläuft, wird die Aufgabe **nicht veröffentlicht**. Es wird angezeigt, dass Larry sie nicht prüfen konnte, und ein erneuter Versuch wird angeboten. Unter keinen Fehlbedingungen wird Text unverprüft veröffentlicht — der günstige Fehlmodus ist ein verärgerter Nutzer, der teure Fehlmodus ist eine veröffentlichte Demütigung, die das Produkt versprochen hat, nicht zuzulassen.

**Routing und Kosten.** Das Volumen ist im Vergleich zum Tutor trivial: ein Aufruf pro erstellter Aufgabe, nicht pro Versuch. Haiku 4.5 reicht für den klaren Fall, mit Eskalation zu Sonnet 5, wenn das Urteil geringes Vertrauen hat — die Nuance zwischen „Scherz unter Freunden“ und „Herabwürdigung“ ist genau dort, wo ein kleines Modell in beide Richtungen Fehler macht. Mit dem Routing von D-015 und dem Ausgabenlimit des AI‑Gateway bewegt dies das Budget nicht.

**False Positive und Beschwerde.** Larry wird Fehler machen und legitime Scherze ablehnen. Ohne Beschwerdeweg fühlt sich das wie Zensur an und wird zur Beschwerde führen. Jede abgelehnte Aufgabe muss per Knopfdruck zur menschlichen Prüfung gesendet werden können, und diese Warteschlange benötigt einen Verantwortlichen und eine zugesagte Reaktionszeit — dieselbe Warteschlange wie bei Meldungen.

**Logbuch.** Jede Entscheidung wird protokolliert: vorgeschlagener Text, Urteil, Modell, Grund und Vertrauen. Es dient drei Zwecken: den Prompt mit realen Fällen zu verfeinern, Beschwerden mit Beweisen zu lösen und zu erkennen, wer versucht, dasselbe zehnmal mit Varianten zu wiederholen.

### 6. Die Elternclubs und der reale Schutzstandard

Die Literatur zu Jugendsport ist die nächstliegende Referenz zu „ein Erwachsener organisiert eine Aktivität für fremde Kinder“. Der allgemein berichtete Standard verlangt eine Hintergrundüberprüfung für *„jede Freiwillige*r mit Möglichkeit zu unbeaufsichtigtem oder eins‑zu‑eins‑Kontakt mit Minderjährigen“* — einschließlich Elternkoordinatoren, die Aktivitäten organisieren oder Kommunikation managen, die Kontakt mit Kindern beinhaltet [4][5]. Eine minimale Überprüfung deckt bundesweite Strafregister und das Register sexueller Straftäter ab; es wird empfohlen, sie jährlich oder pro Saison zu wiederholen, mit vorheriger schriftlicher Einwilligung [4][5]. Und strukturell muss **eine benannte Person existieren, deren Name und Kontakt alle kennen**, als erster Ansprechpartner bei jeglichen Schutzbedenken [5].

**Math Challenge kann keine Hintergrundüberprüfung durchführen**, und das Vortäuschen des Gegenteils wäre schlimmer als nichts zu tun. Aber die Definition selbst weist auf das Risiko hin: **unbeaufsichtigter Kontakt**. Die Design‑Lösung ist, die gesamte Kategorie zu entfernen:

- **Kein Chat und keine Direktnachrichten, in keiner Richtung, niemals.** Das ist bereits die Regel für Lehrkräfte (D-011); sie wird identisch auf Clubs ausgeweitet.
- **Der Club‑Besitzer sieht ausschließlich Alias, Punkte und Serie.** Kein richtiger Name, kein genaues Alter, kein Foto, keine andere Gruppe, der das Kind angehört.
- **Der Vater jedes Kindes genehmigt den Eintritt**, und sieht die deklarierte Identität des Besitzers, bevor er genehmigt — das umgekehrte Muster von ClassDojo, das `mc-28` als den einzigen in der Branche bestätigten Sicherheitsmechanismus identifiziert.
- **Einladung erfolgt durch Teilen eines Codes mit den Eltern**, niemals durch Suchen oder Kontaktieren von Kindern.
- **Harte Obergrenze kleiner als ein Klassenraum**: ein Club ist eine Freundesgruppe, keine Schule.
- **Permanent‑Report‑Button** und vollständiges Logbuch von Anmeldungen, Genehmigungen und Abmeldungen.

Die ehrliche Feststellung daraus: **Ein Eltern‑Club ist genau deshalb sicher, weil er anämisch ist.** Es ist ein geteiltes Brett, kein sozialer Raum. Jedes Mal, wenn jemand vorschlägt, Chat, Fotos oder Profile hinzuzufügen, ist die Antwort bereits hier geschrieben, mit ihrer Begründung.

### 7. Warum zwei Systeme und nicht eines mit Flagge

`grupo_infantil` (das Klassenraum‑ und Eltern‑Club‑Umfeld mit identischen Sicherheitsregeln) und `club_adulto` (mit Herausforderungen und Aufgaben) müssen **separate Strukturen in der Datenbank** sein, nicht eine Tabelle mit einem Feld `tipo`.

Der Grund liegt nicht im Modellieren, sondern im Fehlermodus. Mit einer einzigen Tabelle würde, sobald jemand freien Text, Nachrichten oder Bild‑Uploads zu „den Clubs“ hinzufügt, diese Funktion standardmäßig auch auf die Kindergruppen angewendet, und der Schutz hinge davon ab, dass der Entwickler die Regel im Kopf behält. Mit zwei Strukturen kann das Hinzufügen von freiem Text zum Erwachsenen‑Club **nicht** die Kinder berühren, selbst wenn niemand die Regel erinnert. Das ist der Unterschied zwischen einer Konvention und einem Schloss.

## Tabelle der Aufgabentypen

| Typ | Wer trägt die Konsequenz | Rangliste | Unterstützung | Rechtliches Element, das entfernt wird |
|---|---|---|---|---|
| **A · Kollektiv** | Die gesamte Gruppe, gemeinsam | Nein (nach Design) | Strava Group Goal [2][3]; Johnson & Johnson vía `mc-18` | Preis (gemeinsames Erlebnis, ohne Transfer) |
| **B · Der Gewinner wählt** | Niemand; der Erste gewinnt die Agentur | Ja | Thompson Coburn über immaterielle Preise [1] | Preis (Entscheidung hat keinen Geldwert) |
| **C · Eigenverpflichtung** | Man selbst, gegen das eigene Ziel | Optional | Gollwitzer vía `mc-19`; Haltung von HealthyWage [6] | Zufall (du kontrollierst dein Ergebnis vollständig) |
| ~~Strafe für den Letzten~~ | ~~Der Zurückgebliebene~~ | — | **Verboten**: rote Linie #7, `mc-18` über Schaden am Brettgrund | — |
| ~~Tribut unter Mitgliedern~~ | ~~Die Verlierer zahlen an den Gewinner~~ | — | **Verboten**: schafft Preis + Werttransfer zwischen Personen | — |

## Designimplikationen

1. **Kein Minderjähriger betritt jemals eine Herausforderung mit einer Wette.** Kindergruppen haben Ziele und Feiern; die Wetten leben ausschließlich im `club_adulto`. Das schließt Kinder aus der gesamten Analyse von §1 aus.  
2. **Die Plattform berührt niemals den Wert**: Sie erhebt keine Gebühr für die Teilnahme an einer Herausforderung, behält nichts zurück, überträgt nichts, schiedet nicht und setzt nichts durch. Die Wette ist ein soziales Abkommen, das das Produkt anzeigt, keine Verpflichtung, die das Produkt verwaltet. Sie ist die einzige Bedingung, die die Position von §1 stützt.  
3. **Die drei Formen der Wette (A, B, C) werden als unterschiedliche Typen implementiert**, nicht als Textvarianten desselben Objekts – weil jede einen anderen grammatischen Subjekt hat (die Gruppe, der Gewinner, man selbst) und genau dieser Unterschied die Verlierer‑Kästchen (§4) eliminiert.  
4. **Es gibt kein Feld, das fragt, was mit dem Letzten passiert**, in keiner Form, auf keinem Bildschirm, in keiner API.  
5. **Larry prüft jede freie Textwette, bevor sie existiert**, nach dem Dreischritt‑Kriterium von §5: das Nennen einer Person wird immer abgelehnt, Sex/Violenz/Denigrierung werden abgelehnt, und alles andere wird ohne Larrys Meinung durchgelassen.  
6. **Die Moderation ist ein separater Aufruf vom Tutor** — eigener Prompt, eigenes Logbuch, eigene Weiterleitung (Haiku 4.5 mit Eskalation zu Sonnet 5 bei niedriger Vertrauensstufe). Sie teilt weder Endpunkt noch Prompt mit Larry Profe.  
7. **Fehlertolerant: Wenn Larry nicht prüfen kann, wird die Wette nicht veröffentlicht.** Es gibt niemals ungeprüften Text in Produktion, unter keiner Fehlbedingung.  
8. **Larry lehnt kurz und in Rolle ab, ohne Predigt** — eine moralisierende Ablehnung macht den Erwachsenen zum Gegner des Produkts, und Larrys Kanon verbietet bereits den herablassenden Ton (`mc-11`, `mc-37`).  
9. **Jede abgelehnte Wette hat einen menschlichen Überprüfungs‑Appeal mit einem Hinweis.** Larry wird legitime Scherze zurückweisen, und ohne Appeal fühlt sich das wie Zensur an.  
10. **Jede Wette wird von jedem Mitglied ausdrücklich akzeptiert, bevor die Herausforderung startet**, ist vorher sichtbar, kann nach dem Start nicht mehr bearbeitet werden, und jeder kann die Herausforderung ohne Strafe oder Hinweis verlassen (§4).  
11. **Permanent‑Melde‑Button bei jeder Wette und jedem Club**, mit menschlicher Überprüfung – die zweite Ebene, für das, was Larry durchrutschen lässt.  
12. **Zwei getrennte Datenstrukturen**, `grupo_infantil` und `club_adulto`, damit keine soziale Funktion, die zu den Erwachsenen hinzugefügt wird, Kinder per Auslassung erreichen kann (§7).  
13. **Der Besitzer einer Kinderguppe sieht Alias, Punkte und Serie. Nichts weiter.** Weder echten Namen, noch genaues Alter, noch Zugehörigkeit zu anderen Gruppen.  
14. **Kein privater Erwachsen‑Kind‑Kanal**, in jeder Kinderguppe, sei es von Lehrkraft oder Vater – die direkte Minderung des von §6 identifizierten realen Risikos.  
15. **Der Vater jedes Kindes genehmigt, indem er vorher die deklarierte Identität des Club‑Besitzers einsehen kann**, mit sichtbarem Abzeichen, wenn diese Identität nicht verifiziert ist.  
16. **Größenobergrenze für Kindergroups kleiner als die für Klassen**, und Begrenzung der Clubs pro Konto, weil die unbegrenzte Erstellung von Gruppen die Hebelwirkung wäre, die ein Missbraucher nutzen würde.  
17. **Vollständiges und sichtbares Logbuch für den Vater** darüber, wer Zugriff beantragt hat, wer genehmigt hat und wann – das Gegenstück zum von [5] geforderten „benannten Schutzkontakt“, angepasst an ein Produkt ohne Personal.  
18. **Den Eltern‑Club nicht als Äquivalent zur Aufsicht eines echten Sportclubs darstellen.** Ehrlicher Text: Es ist ein gemeinsam genutztes Board zwischen Familien, die sich bereits kennen, kein überwacht‑Programm.  
19. **Die rechtliche Position von §1 schriftlich festhalten und vor der Aktivierung von Wetten in irgendeinem Markt mit einem Anwalt prüfen** – dieses Dokument ist Forschung, keine Rechtsberatung, und die Schlussfolgerung „zwei von drei Elementen fehlen“ hängt von Produktfakten ab, die ein Roadmap‑Wechsel ungültig machen können.

## Offene Fragen für den Projektinhaber

1. Kann ein Jugendlicher im Alter von 12‑17 in einem `club_adulto` sein? Die Standardantwort dieses Dokuments ist **nein** (Implikation 1), aber das schließt den Fall einer Gruppe von Cousins oder von Klassenkameraden aus.  
2. Beginnt der Katalog der Wetten leer mit freiem Text ab Tag eins, oder wird er mit kuratierten Beispielen besät, die den erwarteten Ton zeigen? Das Besäen ist die günstige Art, die Regel zu kommunizieren, ohne sie zu verbieten.  
3. Ist die ausdrückliche Annahme der Wette (Implikation 5) pro Herausforderung oder einmal pro Club? Pro Herausforderung ist sicherer, aber lästiger.  
4. Beeinflussen die Herausforderungen von Erwachsen‑Clubs das globale Board, oder leben sie isoliert im Club? Wenn sie beeinflussen, muss die Expositionskontrolle der Items `mc-29` überprüft werden.  
5. Wer bearbeitet die Warteschlange für Appeals und Meldungen (Implikationen 9 und 11) und mit welcher zugesagten Reaktionszeit? Ist dieselbe Person für beide Warteschlangen zuständig oder sind es zwei Personen.  
6. Wenn Larry eine Wette ablehnt, sagt er dem Autor **welche** der drei Regeln verletzt wurde, oder nur, dass sie nicht bestand? Das zu sagen hilft beim Korrigieren; es lehrt auch, den Filter zu umgehen.  
7. Wird der Moderations‑Prompt von Larry sprachspezifisch erstellt oder übersetzt? Der abwertende Ton ist stark kulturell geprägt – was in Mexiko ein Scherz unter Freunden ist, kann in Deutschland anders sein, und umgekehrt.  
6. Darf ein Kinder‑Club Kinder mehrerer Familien mischen, die **nicht** miteinander bekannt sind, oder ist er auf Familien beschränkt, die bereits eine vorherige Bindung haben? Das ist der Unterschied zwischen einem begrenzten und einem offenen Risiko.

## Quellen

1. Thompson Coburn LLP, „Shield your sweepstakes from gambling laws“ — https://www.thompsoncoburn.com/insights/blogs/sweepstakes-law/post/2011-12-21/shield-your-sweepstakes-from-gambling-laws — Quelle der drei Elemente, der zitierten Definitionen von Risiko und Zufall sowie der Beobachtung zu immateriellen Preisen.  
2. Strava Community Hub, „Combining Competition and Collaboration with Group Challenges“ — https://communityhub.strava.com/insider-journal-9/combining-competition-and-collaboration-with-group-challenges-1494  
3. Strava Support, „Group Challenges“ — https://support.strava.com/en-us/articles/15401736-group-challenges — Quelle der vier Herausforderungstypen und des Zitats über das bewusste Fehlen einer Rangliste im Group Goal.  
4. JDP, „The Ultimate Guide to Background Checks for Youth Sports Volunteers“ — https://www.jdp.com/blog/the-ultimate-guide-to-background-checks-for-youth-sports-volunteers/  
5. TidyHQ, „SafeSport Compliance Checklist for US Youth Sports Organizations“ — https://tidyhq.com/blog/safeguarding-checklist-us-sports-organizations — Quelle des Standards für „unüberwachten Kontakt“ und der Anforderung eines benannten Schutzkontakts.  
6. HealthyWage, HealthyWager FAQ — https://www.healthywage.com/healthywager/faq/ — Quelle der öffentlichen Position, dass der Nutzer das Ergebnis kontrolliert, hier als Argumentationspräzedenz, nicht als rechtliche Validierung verwendet.  
7. Interne Forschung: `2026-07-31-mc-18-leaderboards-competition.md` (Johnson & Johnson zu kooperativen Strukturen; konzentrierter Schaden im Board‑Fundus), `2026-07-31-mc-19-habit-loops-push-notifications.md` (Implementierungsabsichten von Gollwitzer), `2026-07-31-mc-28-teacher-classroom-mode.md` (die Verifikationslücke des Lehrers, T‑5), `2026-07-31-mc-43-avatars-identity-progression.md` (eingeschränkte Auswahl statt freier Eingabe), `2026-07-31-mc-17-ethical-gamification-dark-patterns.md` (regulatorische Exposition von Glücksspiel‑Mechaniken mit Minderjährigen), `2026-07-31-mc-37-larry-profe-port.md` (Larrys Kanon, Modell‑Routing, das Muster des separaten Aufrufs), `2026-07-31-mc-11-feedback-formative-assessment.md` (warum moralistische Ablehnung kontraproduktiv ist).

**Dies ist Forschung, keine Rechtsberatung.** Die Schlussfolgerung von §1 – dass mindestens zwei der drei Elemente fehlen – beruht auf Produktfakten (die Plattform erhebt keine Gebühren, behält nichts zurück, überträgt nichts, setzt nichts durch), die weiterhin zutreffen müssen, damit die Schlussfolgerung Bestand hat. Ein Anwalt muss sie prüfen, bevor Wetten in irgendeinem Markt aktiviert werden, und die Quelle [1] stammt aus dem Jahr 2011 und ist US‑amerikanisch: sie deckt weder Mexiko, Brasilien noch die EU ab, wo `mc-17` bereits dokumentiert hat, dass Belgien und die Niederlande Glücksspiel‑Mechaniken strenger regulieren als die USA.
