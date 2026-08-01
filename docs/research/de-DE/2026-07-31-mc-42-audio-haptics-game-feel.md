> Math Challenge Forschung — 2026-07-31 — Thema 42

## Zusammenfassung (ES)

Der „Juice“ (übertriebene sensorische Rückmeldung: Klang, Partikel, Bildschirmerschütterung) lässt ein Spiel besser wirken, ohne seine Logik zu ändern — die zentrale These von *Game Feel* von Steve Swink und dem Vortrag von 2012 „Juice It or Lose It“ von Jonasson und Purho [1][2]. Doch Math Challenge ist Lernsoftware, und hier entsteht eine echte Spannung: Der „irrelevante‑Sound‑Effekt“ zeigt, dass Hintergrundsprache und -musik das Arbeitsgedächtnis beeinträchtigen, selbst wenn sie nicht bewusst wahrgenommen werden [3], und Mayers Kohärenzprinzip besagt, dass dekorative Audios – einschließlich Hintergrundmusik – entfernt werden sollten, weil sie um begrenzte kognitive Ressourcen konkurrieren [4]. Beide Seiten sind korrekt: Juice fördert die Motivation; Hintergrundklang während aktiver Berechnungen kann die Leistung mindern. Die praktische Lösung besteht darin, die Momente zu trennen: Stille während des Versuchs, voller Juice nur im Moment von Belohnung/Fehler.

Für vierjährige Kinder, die noch nicht lesen, ist Audio kein Dekorationsmittel — es ist der Instruktionskanal. Die Vibration‑API funktioniert in keiner getesteten Version von Safari auf iOS, sodass Vibration nicht der Hauptbelohnungskanal auf iPad/iPhone sein kann [5][6]. `speechSynthesis` wird von den meisten Browsern unterstützt, aber die Qualität und Verfügbarkeit von Stimmen pro Sprache hängt vom Betriebssystem, nicht vom Browser, ab [7][8]. Autoplay‑Richtlinien blockieren jedes ungedämpfte Audio vor einer Nutzer­geste [9][10][11] — das definiert den Startbildschirm —, und die Barrierefrei­heitsregel „keine rein auditiven wesentlichen Informationen“ [12] verlangt, dass jeder Klang auch eine visuelle Entsprechung hat.

## Zusammenfassung (EN)

„Juice“ — übertriebene Rückmeldung (Klang, Partikel, Bildschirmerschütterung) — lässt ein Spiel besser wirken, ohne seine Logik zu ändern, laut Steve Swinks *Game Feel* und dem Vortrag von 2012 „Juice It or Lose It“ [1][2]. Math Challenge ist Lernsoftware, doch es entsteht eine echte Spannung: Der Irrelevante‑Sound‑Effekt zeigt, dass Hintergrundsprache/-musik das Arbeitsgedächtnis selbst dann beeinträchtigt, wenn sie unbeachtet bleibt [3], und Mayers Kohärenzprinzip besagt, dass dekorative Audios aus Lehrmaterial entfernt werden sollten, weil sie um begrenzte kognitive Kapazität konkurrieren [4]. Beide Aussagen sind im jeweiligen Kontext richtig — Juice unterstützt die Motivation; Umgebungsgeräusche während aktiver Berechnungen können die Leistung mindern. Die praktische Lösung besteht darin, die Momente zu trennen: Stille beim Lösen, voller Juice nur im Belohnungs‑/Fehler‑Moment.

Für vierjährige Vorleser ist Audio der Instruktionskanal, nicht Dekoration. Die Vibration‑API hat in keiner getesteten iOS‑Safari‑Version Unterstützung, sodass sie nicht der primäre Belohnungskanal auf iPad/iPhone sein kann [5][6]. `speechSynthesis` wird von den meisten Browsern breit unterstützt, aber die Sprachqualität‑/Verfügbarkeit pro Sprache ist eine Eigenschaft des Betriebssystems, nicht des Browsers [7][8]. Autoplay‑Richtlinien blockieren jedes ungedämpfte Audio vor einer Nutzer­geste [9][10][11], was den Startbildschirm prägt, und die Barrierefrei­heitsregel „keine rein auditiven wesentlichen Informationen“ [12] verlangt ein visuelles Gegenstück für jeden Audio‑Hinweis.

## Ergebnisse

### 1. Game‑Feel und „Juice“

Steve Swinks *Game Feel* (2008) definiert „Feel“ als Kontrolle + simulierter Raum + Politur, wobei Politur Klang, Partikel, Bildschütteln und Easing umfasst, die den Zustand kommunizieren, ohne die Regeln zu ändern [1]. Der 2012 GDC‑Europe‑Talk „Juice It or Lose It“ (Jonasson & Purho) ist das häufig zitierte Praxisbeispiel: Ein Minimal‑Spiel wird schrittweise mit „Squash‑and‑Stretch“, Partikeln, Kameraschütteln und Sound „gejuiced“, bis es deutlich befriedigender wirkt, ohne mechanische Änderungen [2]. Für *Math Challenge* bedeutet das, dass Juice günstig ist und die wahrgenommene Belohnung einer richtigen Antwort direkt erhöht — was bei 4‑jährigen Kindern besonders wichtig ist, da deren Engagement stärker durch sofortige sensorische Belohnung als durch langfristige Fortschrittsverfolgung getrieben wird.

### 2. Belohnungs‑Sounds

Ein kurzer, klarer, positiv besetzter Sound für die richtige Antwort wirkt als sekundärer Verstärker, ähnlich wie „Münz‑“Sounds in Spielen — sofortiges, sprachunabhängiges Lob. Für ein 4‑jähriges Kind ist das Klingeln *das* Lob, das kommt, bevor irgendein Text gelesen werden könnte. Halte solche Sounds kurz (~300‑500 ms für ein Tick; bis zu ~1‑2 s für eine größere Feier), damit sie nie die nächste Frage verzögern.

### 3. Hintergrundmusik: eine echte, ungelöste Spannung

**Dagegen.** Der irrelevante Sound‑Effekt ist ein robustes Befund aus der kognitiven Psychologie: Unabhängiger Hintergrundsound — Sprache, Musik oder andere nicht‑stille Stimuli — verschlechtert das serielle Erinnern und das Arbeitsgedächtnis, selbst wenn er ignoriert und nicht selbst getestet wird [3]. Die gängige Erklärung lautet, dass variierendes auditives Material in die phonologische Schleife eingreift, die für verbales Wiederholen genutzt wird, und das gilt für Musik, nicht nur für Sprache [3]. Mayers Kohärenzprinzip aus seiner *Cognitive Theory of Multimedia Learning* besagt unabhängig, dass extrinsisches Material — einschließlich dekorativer Hintergrundmusik — ausgeschlossen werden sollte, weil es die begrenzte Verarbeitungskapazität verbraucht, die für die eigentliche Lektion nötig ist [4]; es ist einer der am häufigsten replizierten Befunde in der Bildungs‑Multimedia‑Forschung.

**Dafür.** Keiner der Befunde spricht gegen *momentanen, sinnvollen* Sound — ein korrektes/inkorrektes Klingeln, gesprochene Vor‑Lese‑Anweisungen, ein Feier‑Sting. Beide zielen auf *kontinuierliche, gleichzeitige* Dekoration, nicht auf Feedback, das an ein diskretes Ereignis gebunden ist (§ 1).

**Synthese:** Behandle „während des Lösens“ und „bei Auflösung“ als getrennte Audio‑Regime. Standardmäßig Stille während des Lösens; falls überhaupt Musik vorhanden ist, sollte sie optional und standardmäßig deaktiviert sein. Bei Auflösung ist der kurze Belohnungs‑/Fehler‑Sound + Animation der Juice‑Moment — unter zwei Sekunden, danach kehrt Stille zurück.

### 4. Audio für Vor‑Lese‑Kinder

Für Kinder im Alter von 4‑6 Jahren ist Bildschirmt­ext ohne erwachsene Unterstützung unzugänglich, sodass Audio die primäre Schnittstelle und nicht nur eine Ergänzung ist. Zwei Wege:

- **`speechSynthesis` (TTS).** Kostenlos, offline‑fähig, sobald die OS‑Stimme vorhanden ist, kann dynamische Inhalte (generierte Aufgaben) vorlesen, ohne jede Kombination vorher aufnehmen zu müssen. Doch die Sprach‑Qualität und -Abdeckung hängen vom OS, nicht vom Browser ab [7][8]; ein Gerät ohne installierte spanische oder französische Sprachpakete fällt still auf eine minderwertige Default‑Stimme zurück, und es gibt keine Web‑API, die ein solches Paket zwangsweise installieren kann.
- **Aufgezeichnete Voice‑Over (VO).** Konsistente Qualität unabhängig vom Gerät, aber fest und endlich — jede Phrase pro Sprache muss aufgenommen und ausgeliefert werden. Erschwinglich für ein begrenztes Vokabular (Menü‑Beschriftungen, „¡Correcto!“, Zahlen, Operator‑Namen); skaliert nicht zu beliebig generierten Aufgabentexten.

**Empfohlene Hybrid‑Lösung:** Aufgezeichnetes VO für das feste UI‑/Feier‑Vokabular in allen 5 Sprachen; TTS (oder zusammengefügte VO‑Clips) für alles Kombinatorische (Vorlesen generierter Aufgaben) — das Muster, das Khan Academy Kids und Duolingo in der Praxis verwenden.

### 5. Feier‑Animation: hilft oder lenkt ab?

Konfetti, Stern‑Zähler und Maskottchen‑Animationen sind extrinsische Motivatoren zusätzlich zur intrinsischen Belohnung einer richtigen Antwort. Eine lange, langsame Feier verzögert das nächste Problem und birgt das Risiko, genau die Art von extrinsischer Aufmerksamkeits­lenkung zu werden, vor der die Kohärenz‑/Irrelevanz‑Sound‑Literatur warnt. Eine kurze, nicht blockierende Feier (unter ~1,5 s) erfasst den motivationalen Nutzen, ohne den Fluss zu unterbrechen — „klein und häufig schlägt groß und selten“ für anhaltendes Engagement, ohne die Bearbeitungszeit zu verdrängen.

### 6. Haptik im Web

`navigator.vibrate()` wird unterstützt, jedoch ungleichmäßig: Chrome (Desktop/Android), Edge, Samsung Internet und die meisten Chromium‑Android‑Browser unterstützen es; Firefox Desktop unterstützte es nur bis v128, ab v129 nicht mehr; und – entscheidend – **iOS Safari hat es in keiner Version von 3,2 bis 26,5 unterstützt** [5][6]. Da jede iOS‑WebView WebKit nutzt, ist das kein „Browser‑wechseln“-Problem. Vibration ist höchstens ein Akzent auf Android/Chromium, niemals der primäre Feedback‑Kanal, weil ein bedeutender Teil der Ziel‑Flotte (alle iPad/iPhone) nichts bekommt. Keine Web‑API stellt die iOS‑Taptic‑Engine als Alternative bereit.

### 7. `prefers-reduced-motion`

Dieses CSS‑Media‑Feature (Baseline seit Januar 2020) gibt eine OS‑seitige Präferenz zur Reduktion nicht‑essentieller Bewegung wieder, weil skalierende/verschiebende Animationen bekannte Auslöser für vestibuläre Störungen sind [13]. Jede stark‑bewegte Feier (Konfetti, Schütteln, Springen) benötigt eine ruhigere Alternative `prefers-reduced-motion: reduce` (Verblassen/Farbwechsel), die weiterhin „richtig“ signalisiert — nie das Feedback einfach entfernen.

### 8. Mute‑First‑Design

Klassenzimmer, Wartebereiche und gemeinsam genutzte Familiengeräte sind Kontexte, in denen Audio häufig unerwünscht ist, unabhängig von den Plattform‑Fähigkeiten. Kombiniert mit der Autoplay‑Richtlinie (§ 9) sollte Stille die sichere Vorgabe sein, mit einer persistenten, immer sichtbaren Ein‑Tap‑Mute‑Steuerung, und der Kern‑Loop (lesen → antworten → Ergebnis sehen) muss vollständig stumm nutzbar sein — unabhängig gefordert auch durch § 10.

### 9. Autoplay‑Richtlinie

Chrome und Safari blockieren Audio‑mit‑Sound vor einer Nutzer‑Geste, sofern es nicht stumm ist [9][10]. Chromes Media Engagement Index kann häufig besuchte Desktop‑Origins zulassen; stummes Autoplay ist immer erlaubt [9]. Safari auf iOS verlangt `playsinline` für Inline‑Video und behandelt stummes/tonloses Video permissiv [10][11]. Firefox bietet feinkörnige pro‑Domain‑Einstellungen, darunter eine, die das Autoplay der Web‑Audio‑API ohne Geste blockiert [11]. Praktisch: Der erste Sound einer Session (inklusive gesprochener Anweisungen) kann nicht automatisch abgespielt werden — er muss hinter einem „Start“/„¡Empezar!“‑Tap verborgen werden, und derselbe Tap sollte das gemeinsame `AudioContext` (plus einen nahezu stummen Primer‑Buffer) erzeugen, sodass jeder spätere Sound sofort spielt.

### 10. Feedback darf niemals rein akustisch sein

WCAG 1.2.1 verlangt eine textbasierte Entsprechung für rein akustische Inhalte, da Text über jede sensorische Modalität dargestellt werden kann [12]. Die Game Accessibility Guidelines formulieren es direkter: „Stelle sicher, dass keine wesentlichen Informationen ausschließlich durch Sounds vermittelt werden“, und ergänzende Audio‑Infos müssen in Text/Visuelles dupliziert werden [14]. Für *Math Challenge* muss jedes korrekte/inkorrekte Signal, jede Anweisung und jede Feier eine visuelle (und, wo relevant, textuelle) Form besitzen, die vollständig stumm funktioniert — eine Anforderung, die ebenfalls durch § 8 und § 9 bedingt ist.

### 11. Asset‑Pipeline

**Sprites.** Bündle kurze Effekte (korrekt, falsch, Tick, Tap) in einen Audio‑Sprite‑Buffer, der über Web‑Audio `AudioBufferSourceNode` mit Offsets abgespielt wird, um viele kleine Anfragen und pro‑Instanz `<audio>`‑Overhead zu vermeiden.

**Web Audio vs `<audio>`‑Latenz.** Das `<audio>`‑Element auf Mobilgeräten hat dokumentierte Latenz/Glitches und fehlt Filter, präzises Timing und räumliches Audio; die Web‑Audio‑API ist der Low‑Latency‑Weg für spielähnlichen Sound, während `<audio>` weiterhin nützlich für das Streamen langer Hintergrundmusik ohne Blockierung eines kompletten Downloads bleibt — oft über `MediaElementAudioSourceNode` innerhalb eines `AudioContext` [15][17]. Beide APIs besitzen breite Baseline‑Unterstützung, inklusive iOS Safari [16][7] — im Gegensatz zur Vibration ist die Audiowiedergabe selbst kein plattformübergreifendes Risiko.

**Dateigrößen‑Budget.** Arbeitsziel (noch zu bestätigen durch den Auftraggeber): kurze UI/Feedback‑Sounds bei ~10‑30 KB jeweils (komprimiert, in einem Sprite); ein begrenztes aufgezeichnetes VO‑Vokabular (~150‑300 Phrasen) bei ~15‑40 KB pro Phrase erzeugt mehrere MB pro Sprache — der größte Offline‑Asset‑Treiber, wenn alle 5 Sprachen beim Installieren mitgeliefert werden. Besser: Nur die ausgewählte Sprache beim Installieren bündeln, andere bei Bedarf per Service‑Worker lazy‑fetch/cache.

**Lizenzierung.** UI‑Sound‑Effekte stammen typischerweise aus royalty‑free/CC0‑Bibliotheken oder werden in Auftrag gegeben; prüfe Attribution‑ und kommerzielle Nutzungsbedingungen pro Asset. Aufgezeichnetes VO benötigt entweder eine interne Talent‑Vereinbarung oder einen kommerziellen VO‑Anbieter‑Vertrag mit klaren kommerziellen Nutzungs‑ und Nachaufnahmerechten — eine Beschaffungs‑Entscheidung des Auftraggebers, die nicht aus öffentlichen Dokumenten ableitbar ist.

## Plattform‑Fähigkeitstabelle

| Fähigkeit | iOS Safari | Android Chrome | Desktop (Chrome/Edge/Firefox/Safari) | Quelle |
|---|---|---|---|---|
| **Vibration API** (`navigator.vibrate`) | **Nicht unterstützt**, alle Versionen 3,2–26,5 getestet | Unterstützt (aktuell) | Chrome v30+/Edge v79+ unterstützt; Firefox v11–128 **nur**, entfernt ab 129+; Safari Desktop nicht unterstützt | caniuse.com/vibration [5]; MDN [6] |
| **Web Audio API** | Unterstützt seit Safari 6 | Unterstützt (aktuell) | Chrome v14+, Edge v12+, Firefox v25+, Safari v6+ alle unterstützt | caniuse.com/audio-api [16]; MDN [15] |
| **Autoplay (Audio mit Ton)** | Vor Gesten blockiert; stummes/tonloses Video kann automatisch abspielen; `playsinline` erforderlich | Vor Gesten blockiert, es sei denn stumm; Chrome MEI kann häufige Herkunfts‑Domains zulassen | Chrome/Edge: blockiert, es sei denn stumm/Geste/MEI; Firefox: granular per‑Domain‑Einstellungen; Safari Desktop: gleiche Richtlinie wie iOS | WebKit‑Blog [10]; Chrome‑Blog [9]; MDN [11] |
| **`speechSynthesis`** | Unterstützt seit Safari 7; **Stimmenanzahl/-qualität pro Sprache ist eine Betriebssystem‑Eigenschaft** | Unterstützt (aktuell); Android‑System‑Browser fehlt | Chrome v33+, Edge v14+, Firefox v49+, Safari v7+ alle unterstützt | caniuse.com/speech-synthesis [7]; MDN [8] |

Sprachinventare pro Sprache (EN/ES/FR/PT/DE) können nicht allein aus der Dokumentation aufgelistet werden – sie müssen während der Implementierung pro Ziel‑OS/Gerät verifiziert werden [7][8].

## Designimplikationen

1. **Alter 4‑6.** Jede Anweisung ist Audio (aufgezeichnete VO, §4) plus ein großes Piktogramm – niemals nur Text. Keine Hintergrundmusik standardmäßig. Richtige Antwort: ≤500 ms Klingelton + gleichzeitiges visuelles Funkeln/Abprallen, geräuschfrei sicher.  
2. **Alter 4‑6, Fehler.** Weicher, nicht‑strafender Ton (keine harten Summer) + freundlicher Rückprall‑Hinweis, selbst standardmäßig innerhalb einer `prefers-reduced-motion`‑sicheren Amplitude gehalten – diese Altersgruppe ist empfindlicher gegenüber Schütteln/Blitzen.  
3. **Alter 7‑10.** Text wird primär; Audio wird optional ein‑/ausschaltbares Vorlesen. 2‑3 rotierende Klingel‑Varianten zur Vermeidung von Monotonie, ≤700 ms, keine blockierende Animation.  
4. **Alter 11 +/Erwachsene.** Audio standardmäßig aus, hinter einer expliziten „Sound an“-Aufforderung (nicht Autoplay); minimale Feier (Fortschritts‑Bar‑Tick, kein Konfetti) für einen wenig ablenkenden, schnell arbeitenden Nutzer.  
5. **Musik in allen Altersgruppen standardmäßig aus (§3).** Wenn angeboten, nur nach Zustimmung, automatisches Ducking zu nahezu stumm während aktivem Lösen, volle Lautstärke nur in Menüs/Leerlauf‑Bildschirmen.  
6. **VO/TTS‑Aufteilung (§4).** Aufgezeichnete VO für das begrenzte feste Vokabular (~150‑300 Phrasen) in allen 5 Sprachen; `speechSynthesis` (oder zusammengefügte Clips) für kombinatorisch generierte Aufgaben‑Vorlesungen.  
7. **Audio‑Entsperrung in der ersten Sitzung.** Der erste Tap (ein „Start“-Button, niemals Autoplay) dient gleichzeitig als Geste, die den geteilten `AudioContext` wiederaufnimmt/erstellt und einen nahezu stillen Primer auslöst, sodass spätere Sounds keine wahrnehmbare Verzögerung haben (§9).  
8. **Haptik nur als Akzent.** Einen kurzen (~40‑80 ms) Tick auslösen, wo `navigator.vibrate` existiert (Android Chrome); für iOS volle Parität über Sound + Animation allein gestalten, da dort Vibration komplett fehlt (§6).  
9. **`prefers-reduced-motion`‑Variante für jede Feier**, im selben PR wie die Feier ausgeliefert — ein ruhiges Ausblenden/Pulsieren, das das Belohnungssignal ohne vestibuläre Auslöser bewahrt (§7).  
10. **Persistente Ein‑Tap‑Stummschaltung**, immer sichtbar, merkt die letzte Wahl pro Gerät; die stummgeschaltete Kernschleife ist ein erstklassig getestetes Szenario, kein Nachgedanke (§8, §10).  
11. **Kein reines Sound‑Feedback irgendwo** — jeder Audio‑Hinweis wird mit einem visuellen (und, wo Text auf dem Bildschirm ist, einem textuellen) Äquivalent gepaart, geprüft bei jedem neu hinzugefügten Sound (§10).  
12. **Budget für Feier‑Dauer.** Pro Antwort: ≤500 ms Audio / ≤800 ms Animation, nicht blockierend. Sitzungs‑Level (Streak/Level‑Abschluss): ≤2,5 s gesamt, überspringbar, nie das „Weiter“ über diese Grenze blockierend.  
13. **Gesamtes Offline‑Asset‑Größen‑Budget** (Arbeitsziel, ausstehende Bestätigung des Eigentümers): ≤1,5 MB UI‑Sound‑Effect‑Sprite (sprachunabhängig) + ≤2‑3 MB für das Standard‑Sprach‑VO‑Bundle bei Installation, wobei die anderen vier Sprachen bei Bedarf nachgeladen/zwischengespeichert werden statt im Voraus zu bündeln. Ziel für den Audio‑Fußabdruck bei Erstinstallation: **unter 5 MB**.

## Offene Fragen für den Projektinhaber

1. Hintergrundmusik überhaupt anbieten (auch per Opt‑In), angesichts der Evidenz aus §3 gegen sie während aktivem Lösen — oder sie strikt nur für Menü‑/Leerlauf‑Bildschirme reservieren?  
2. Gibt es Budget/Zeitplan für professionelles VO in allen 5 Sprachen für das feste Vokabular, oder sollte der Start zunächst überall auf `speechSynthesis` setzen, mit VO später pro Sprache ergänzt?  
3. Alle 5 Sprachen im initialen Offline‑Bundle ausliefern, oder nur die ausgewählte Sprache bündeln und die anderen bei Bedarf nachladen (mein Arbeitsempfehlung, siehe Implikation 13)?  
4. Wie hoch ist die Offline‑Asset‑Größen‑Obergrenze für die gesamte App (nicht nur Audio) — dies ändert, wie aggressiv das Audio‑Budget sein muss?  
5. Für Klassen‑/Shared‑Device‑Einsätze: Sollte eine Lehr‑/Admin‑Einstellung Stummschaltung standardmäßig erzwingen oder den Sound‑Toggle für Schüler deaktivieren, getrennt vom nutzer‑spezifischen Toggle pro Sitzung?  
6. Ist bereits eine lizenzierte Sound‑Effect‑Bibliothek ausgewählt, oder muss §11’s Lizenz‑Hinweis in eine Beschaffungsentscheidung einfließen, bevor irgendein Sound‑Asset ausgeliefert wird?

## Quellen

1. Steve Swink, *Game Feel: A Game Designer's Guide to Virtual Sensation* (2008) — Rahmenwerk für „Feel“ über Kontrolle, Raum und Politur.  
2. GDC Vault, "Juice It or Lose It" (Martin Jonasson & Petri Purho, GDC Europe 2012) — https://www.gdcvault.com/play/1016487/Juice-It-or-Lose  
3. Wikipedia, "Irrelevant speech effect" — https://en.wikipedia.org/wiki/Irrelevant_speech_effect  
4. Mayer, R. & Moreno, R., "A Cognitive Theory of Multimedia Learning: Implications for Design Principles" (1998) — Kohärenzprinzip (referenziert via https://en.wikipedia.org/wiki/Multimedia_learning).  
5. caniuse.com, "Vibration API" — https://caniuse.com/vibration  
6. MDN, "Vibration API" — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API  
7. caniuse.com, "Speech Synthesis API" — https://caniuse.com/speech-synthesis  
8. MDN, "SpeechSynthesis" — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis  
9. Chrome Developers blog, "Autoplay policy in Chrome" — https://developer.chrome.com/blog/autoplay/  
10. WebKit blog, "New Video Policies for iOS" — https://webkit.org/blog/6784/new-video-policies-for-ios/  
11. MDN, "Autoplay guide for media and Web Audio APIs" — https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay  
12. W3C WAI, "Understanding SC 1.2.1: Audio-only and Video-only (Prerecorded)" — https://www.w3.org/WAI/WCAG21/Understanding/audio-only-and-video-only-prerecorded.html  
13. MDN, "prefers-reduced-motion" — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion  
14. Game Accessibility Guidelines, "Ensure no essential information is conveyed by sounds alone" — http://gameaccessibilityguidelines.com/full-list/  
15. MDN, "Web Audio API" — https://developer.mozilla.org/en-US/docs/Web/Web_Audio_API  
16. caniuse.com, "Web Audio API" — https://caniuse.com/audio-api  
17. web.dev, "Web Audio for games" — https://web.dev/articles/webaudio-games  
18. W3C WAI, "Understanding SC 1.4.2: Audio Control" — https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html
