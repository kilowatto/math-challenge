# Stack, protocolos y rendimiento real: qué está de verdad a la vanguardia sobre Cloudflare

> Math Challenge research — 2026-07-31 — topic 47

## Zusammenfassung (ES)

- **gRPC ist hier nicht praktikabel, und nicht aus Mangel an Motivation.** Workers und Durable Objects **können keine ausgehenden gRPC‑Aufrufe tätigen**, weil die Laufzeit kein bidirektionales HTTP/2‑Streaming unterstützt; es gibt ein offenes Issue in `cloudflare/workerd`, das dies fordert [1].
- **Und der Browser spricht ebenfalls kein gRPC.** Der Web‑Client implementiert ein anderes Protokoll als das native gRPC: Browser stellen die HTTP/2‑Funktionen, die gRPC benötigt, nicht bereit, sodass gRPC‑Web auf HTTP/1.1 zurückgreift — *„was einige der Vorteile von gRPC aufhebt“* — und **keine client‑seitigen oder bidirektionalen Streaming‑Aufrufe unterstützt** [2][3].
- **Der native RPC von Workers gewinnt durch die Architektur, und das nicht wenig.** Mit Service Bindings *„es gibt keinen Overhead und keine zusätzliche Latenz“*, und der Worker wird *„normalerweise nicht einmal ein Netzwerk überqueren und meist im selben Thread wie der Aufrufer laufen, wodurch die Latenz auf null reduziert wird“* [4][5].
- **HTTP/3 über QUIC ist ein Schalter, kein Projekt.** Es ist in allen Cloudflare‑Plänen verfügbar und lässt sich über die Protokoll‑Optimierungseinstellungen aktivieren [6][7].
- **Die entscheidende Kennzahl für schlechte Netze:** Bei Verbindungen mit 1‑3 % Paketverlust – im echten Mobilfunk – liefert HTTP/3 **10‑30 % schnellere Ladezeiten**, weil die verlustbasierte Wiederherstellung pro Stream verhindert, dass ein einzelnes verlorenes Paket die gesamte Seite blockiert [8].
- Mit **0‑RTT** für wiederkehrende Besucher kann die Einsparung **über 300 ms** betragen, genug, um eine Seite von „Verbesserungsbedarf“ zu „gut“ bei den Core Web Vitals zu bewegen [8].
- **INP ist die Kennzahl, die scheitert.** 43 % der Seiten überschreiten die Schwelle von 200 ms, und sie ist 2026 die schwierigste, weil sie **jede** Interaktion misst, nicht nur die erste; die Gegner sind lange JavaScript‑Aufgaben, die den Haupt‑Thread blockieren [9].
- **Google bewertet mit Felddaten, nicht mit Labordaten:** *„ein perfektes 100 % in Lighthouse bedeutet nichts, wenn reale Nutzer in 3G‑Netzen leiden“* [9].
- **AVIF und WebP erzeugen 25‑50 % kleinere Dateien**; das Vorabladen des LCP‑Bildes mit `fetchpriority="high"` ist eine der wirksamsten Maßnahmen für LCP [9].
- Zentrale Schlussfolgerung: Was an der Spitze **dieser Plattform** steht, ist nativer RPC + HTTP/3 + ein striktes INP‑Budget, nicht gRPC. Die Einführung von gRPC hier würde bedeuten, die vorherige Generation mit mehr Aufwand zu übernehmen.

## Zusammenfassung (EN)

- **gRPC ist hier nicht praktikabel.** Workers und Durable Objects **können keine ausgehenden gRPC‑Aufrufe tätigen**, weil die Laufzeit kein bidirektionales HTTP/2‑Streaming unterstützt; ein offenes Issue in `cloudflare/workerd` verfolgt das [1].
- **Browser sprechen ebenfalls kein gRPC.** Der Web‑Client implementiert ein anderes Protokoll als das native gRPC: Browser stellen die HTTP/2‑Funktionen, die gRPC benötigt, nicht bereit, sodass gRPC‑Web auf HTTP/1.1 zurückgreift — *„was einige der Vorteile der Nutzung von gRPC aufhebt“* — und **unterstützt weder client‑seitiges Streaming noch bidirektionale Aufrufe** [2][3].
- **Der native RPC der Workers gewinnt architektonisch.** Mit Service Bindings *„es gibt keinen Overhead oder zusätzliche Latenz“*, und der Aufgerufene *„überquert normalerweise nicht einmal ein Netzwerk und läuft meist im exakt selben Thread wie der Aufrufer, wodurch die Latenz auf null reduziert wird“* [4][5].
- **HTTP/3 über QUIC ist ein Schalter, kein Projekt** – in allen Cloudflare‑Plänen verfügbar [6][7].
- **Die Kennzahl, die bei schlechten Netzen zählt:** Bei Verbindungen mit 1‑3 % Paketverlust liefert HTTP/3 **10‑30 % schnellere Seitenladezeiten**, weil die per‑Stream‑Verlust‑Wiederherstellung verhindert, dass ein einzelnes verlorenes Paket alles blockiert [8]. Mit **0‑RTT** können Einsparungen **über 300 ms** betragen [8].
- **INP ist die Kennzahl, die scheitert.** 43 % der Seiten verfehlen die Schwelle von 200 ms; sie ist 2026 die schwierigste Vital, weil sie **jede** Interaktion misst [9].
- **Google bewertet anhand von Felddaten, nicht von Labordaten** [9]. AVIF/WebP reduzieren Dateigrößen um 25‑50 % [9].
- Zentrale Implikation: Die Vorreiterrolle **auf dieser Plattform** liegt bei nativen RPC + HTTP/3 + einem strikten INP‑Budget – nicht bei gRPC.

## Ergebnisse

### 1. Warum gRPC nicht funktioniert

Drei unabhängige Fakten, von denen jeder allein ausreichend ist.

**Auf der Serverseite.** Der Issue `cloudflare/workerd#6455` dokumentiert, dass Workers und Durable Objects keine ausgehenden gRPC‑Aufrufe tätigen können, weil die Laufzeit kein bidirektionales HTTP/2‑Streaming unterstützt; der Issue selbst weist darauf hin, dass bereits die Unterstützung von rein unary gRPC — einem HTTP/2‑POST mit Protobuf‑Body plus Trailers — die meisten Anwendungsfälle freischalten würde, und das existiert noch immer nicht [1].

**Auf der Browserseite.** Dies ist keine Einschränkung von Cloudflare, sondern des Protokolls: die Web‑Client‑Bibliothek *implementiert ein anderes Protokoll als das native gRPC* genau weil Browser die HTTP/2‑Funktionen, die gRPC benötigt, nicht bereitstellen [3]. Folglich verwendet gRPC‑Web HTTP/1.1, *„was einige der Vorteile von gRPC aufhebt“*, und **Client‑Streaming und bidirektionales Streaming bleiben unerreichbar** [2].

**Auf der Seite der Zwischinfrastruktur.** Cloudflare dokumentiert in seinem eigenen Blog, dass HTTP‑Trailers — die gRPC für den Status benötigt — *nicht vollständig unterstützt wurden* von seinem Edge‑Proxy, und es gibt Berichte, dass gRPC‑Bodies und -Trailers durch Tunnel selbst bei TLS+ALPN+h2 am Ursprung entfernt werden [10][11].

**Fazit.** Es ist nicht so, dass gRPC hier schwierig wäre: Der Anwendungsfall, der gRPC rechtfertigen würde — effizientes, bidirektionales Binär‑Streaming — ist genau der, der weder in der Laufzeit noch im Browser verfügbar ist. Übrig bliebe Protobuf über HTTP/1.1 mit einem zusätzlichen Proxy: mehr Komponenten, mehr Latenz, schlechteres Debugging und ohne den Vorteil.

### 2. Was tatsächlich die Spitze auf dieser Plattform ist

Cloudflare bietet ein natives JavaScript‑RPC über Service Bindings, das dafür ausgelegt ist, *„so nah wie möglich an das Aufrufen einer JavaScript‑Funktion innerhalb desselben Workers zu erinnern“* [4]. Seine Leistungscharakteristik lässt keinen Vergleich mit irgendeiner Netzwerkarchitektur zu: *„es gibt keinen Overhead und keine zusätzliche Latenz. Standardmäßig laufen beide Workers im selben Thread desselben Cloudflare‑Servers“*, und das RPC zu einem anderen Worker *„kreuzt normalerweise nicht einmal ein Netzwerk“* [4][5].

Ein RPC, das das Netzwerk nicht kreuzt, kann von einem RPC, das das Netzwerk kreuzt, nicht übertroffen werden, egal wie effizient seine Serialisierung ist. Das ist der gesamte Vergleich.

Service Bindings unterstützen zwei Stile: Weiterleitung von `fetch` (ein vollständiges `Request` wird übergeben) und typisiertes RPC (Methoden werden direkt aufgerufen) [5]. Letzteres entspricht dem Challenge‑Motor, der das Modell des Schülers, den Bewertungs‑ und den Tutor‑Dienst aufruft.

### 3. HTTP/3, QUIC und was wirklich in einem überlasteten Netzwerk passiert

HTTP/3 ist in allen Cloudflare‑Plänen verfügbar und wird über einen Schalter in den Protokoll‑Optimierungseinstellungen aktiviert [6][7]. Es gibt keine Implementierungsarbeit, nur Verifikation.

Was es bringt, mit Zahlen:

- **Paketverlust.** Bei Verbindungen mit 1‑3 % Verlust — dem typischen Bereich für reale Mobilgeräte — berichten Studien von Google und Cloudflare von **10‑30 % Verbesserung der Ladezeit**, weil die Isolation auf Stream‑Ebene verhindert, dass ein verlorenes Paket alle Anfragen blockiert [8]. Das ist exakt das Szenario von „Low‑End‑Android in Lateinamerika“, das der Master‑Plan als Zielmarkt benennt.
- **Verbindungsaufbau.** QUIC wurde für 0‑RTT/1‑RTT gebaut; mit 0‑RTT bei wiederkehrenden Besuchern kann die Einsparung **über 300 ms** betragen, genug, um die Bewertung der Core Web Vitals einer Seite zu verändern [8].

**Was es nicht löst:** HTTP/3 beschleunigt den Transport, nicht die Arbeit. Ein schweres JavaScript‑Bundle blockiert den Haupt‑Thread exakt gleich über QUIC wie über TCP. Deshalb ist das INP‑Budget (§ 4) wichtiger als das Protokoll.

### 4. INP: die Kennzahl, bei der dieses Produkt Gefahr läuft zu scheitern

Die "guten" Schwellenwerte im Jahr 2026: LCP unter 2,5 s, CLS unter 0,1, INP unter 200 ms — und die leistungsstärksten Seiten zielen auf **INP unter 150 ms** [9].

**43 % der Seiten verfehlen die Schwelle von 200 ms für INP**, was sie zur am häufigsten verfehlten Vital‑Kennzahl 2026 macht [9]. Der Grund, warum sie schwieriger ist als die anderen: **sie misst jede Berührung und jeden Klick, nicht nur den ersten**, und der Feind sind lange Aufgaben im Haupt‑Thread — schweres JavaScript, das den Browser daran hindert zu reagieren, wenn der Nutzer interagiert [9].

Dies ist ein spezifisches und benennbares Risiko für Math Challenge: Der Challenge‑Motor besteht aus React‑Islands, das Kind berührt häufig pro Sitzung, und jede Berührung wird gemessen. Ein Mathematik‑Spiel ist von Natur aus eine Anwendung mit hoher Interaktionsfrequenz — das genaue Profil, in dem INP scheitert.

Und das Bewertungs‑Framework schließt die Tür zur Selbsttäuschung: **Google rankt mit Felddaten, nicht mit Labordaten**; *„ein perfektes 100 in Lighthouse bedeutet nichts, wenn reale Nutzer in 3G‑Netzen leiden“* [9].

### 5. Bilder

Das Ausliefern moderner Formate — AVIF oder WebP — erzeugt Dateien **25‑50 % kleiner** [9]. Für LCP ist es am effektivsten, das LCP‑Bild mit `fetchpriority="high"` vorzupflegen und zusätzlich sein Gewicht zu optimieren [9].

Für dieses Produkt ist das Bildvolumen real: ~30 Kunstwerke der Savanne plus Illustrationen von Items (`mc-40`, D-019), die von R2 an die sieben Standorte ausgeliefert werden. Da die Kunst zwischen Sprachen wiederverwendet wird — die Savanne spricht nicht (D-019) — ist der Bildkatalog gemeinsam und damit hochgradig cache‑fähig.

### 6. Nativ auf vier Plattformen

Die Plattform‑Guidelines sind explizit und unterschiedlich: Android folgt Material Design, mit **Material 3**, das dynamische Farben und Design‑Tokens einführt; Apple deckt alle seine Plattformen mit den Human Interface Guidelines ab [12][13]. Damit sich eine PWA nicht wie das Web anfühlt, konvergiert die praktische Empfehlung in drei Punkte: **systemeigene bevorzugte Schriftart**, unterschiedlich für iOS/Android/Windows; **Navigations‑Leisten, Tabs und Modals im Stil der jeweiligen Plattform**; und **erwartete Gesten** — sanftes Scrollen, Pinch‑to‑Zoom, Wischen [13][14].

Die harten plattformspezifischen Einschränkungen sind bereits in `mc-33` dokumentiert und ändern sich nicht: Auf iOS ist die Installation manuell und Push erfordert, dass die App installiert ist; Auf Android gibt es keine Installationsbarriere; Auf macOS Safari 17+ gibt es „Zum Dock hinzufügen“; Auf Windows ist die Installation über Edge/Chromium die am besten integrierte der vier.

Die Kosten der plattformspezifischen Anpassung sind keine Forschungs‑, sondern Ingenieur‑Kosten: Sie verdoppeln Komponenten, Tests und Design‑Entscheidungen. Es ist eine Produkt‑, keine Technik‑Entscheidung.

### 7. Die Auditoren‑Flotte

Ein Einsatz mit adversarialen Auditoren ist umsetzbar und passt zu der Art, wie dieses Projekt aufgebaut wurde. Er wird in zwei Klassen mit unterschiedlichen Kosten und Geschwindigkeiten unterteilt.

**Deterministisch (12), bei jedem Commit, in Sekunden:** Bundle‑Budget · Core Web Vitals mit Schwellenwerten aus § 4 · axe‑core · Kontrast · Größe der taktilen Ziele pro Band (24 px WCAG AA / 44 px HIG / 88 px Kinder, gemäß `mc-38` und `mc-20`) · Vollständigkeit der sieben Sprach‑Keys · JSON‑LD‑Validierung · `hreflang`‑Reziprozität · Geheimnis‑Scanning · Präfix `math-challenge-` (`CLAUDE.md` § Cloudflare) · Migrations‑Sicherheit · Offline‑Pre‑Cache‑Budget (~5 MB Audio, `mc-42`).

**Adversarial mit LLM (23), bei jedem PR, angeleitet, Verstöße zu finden und nicht zu genehmigen:** rote Linien (die acht) · COPPA/GDPR‑K‑Privatsphäre · Anti‑Demütigung · Anti‑Betrug · dunkle Muster · Pädagogik · mathematische Strenge · wissenschaftliche Strenge (jede nachprüfbare faktische Aussage) · Larry‑Kanon · Serien und Bildschirmzeit · Kinder‑Modus · PWA iOS · PWA Android · PWA‑first/offline · Leistung bei langsamen Netzen · UX nach Altersgruppe · und **einer pro Locale**: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`.

Gesamt: **35**.

**Die beiden Regeln, die sie nützlich statt hinderlich machen.** Erstens: **jeder Auditor zitiert die Entscheidung oder das Dokument, das die Regel durchsetzt** — ein Auditor, der keine Entscheidung aus `decisions.md` oder einen Befund aus `research/` benennen kann, gibt nur eine Meinung ab, und sein Urteil blockiert nicht. Zweitens: **einen Auditor zu annullieren erfordert, dass man begründet, warum**, und diese Begründung bleibt im Verlauf. Ohne das Erste erzeugt die Flotte Lärm; ohne das Zweite wird sie zu einem Hindernis, das die Leute stillschweigend umschiffen lernen.

**Bekanntes Risiko, offen ausgesprochen:** 23 Auditoren mit LLM pro PR verursachen Kosten pro PR und eine Rate an Fehlalarmen. Die Gegenmaßnahme ist, dass nur die deterministischen Auditoren standardmäßig blockieren, und die adversarialen nur blockieren, wenn sie eine rote Linie oder eine explizite Entscheidung zitieren; der Rest meldet ohne zu blockieren.

## Designimplikationen

1. **Kein gRPC und kein gRPC-Web.** Native RPC von Workers über Service Bindings für alles Internes (§1, §2).
2. **HTTP/3 verifiziert, nicht angenommen**, inklusive 0‑RTT für wiederkehrende Aufrufe; es ist eine Konfiguration, und man muss bestätigen, dass sie aktiv ist, bevor man sie beansprucht (§3).
3. **Harter INP‑Budget ≤ 150 ms**, nicht 200 — es ist ein Hochfrequenz‑Interaktionsspiel und die lockere Schwelle ist dort, wo 43 % des Webs scheitern (§4).
4. **Messung mit Felddaten vom ersten Tag an**, nicht mit Lighthouse; ein Labor‑100 sagt nichts über das Kind im 3G‑Netz (§4).
5. **AVIF mit WebP‑Fallback für alle Grafiken**, mit `fetchpriority="high"` im LCP‑Bild jeder Ansicht (§5).
6. **Die Savannen‑Grafik wird einmal zwischengespeichert und an die sieben Regionen ausgeliefert**, weil sie keinen Text enthält (D-019) — sie ist die günstigste Gewichts‑hebel des Produkts.
7. **Plattformadaptive Schnittstelle**: Material 3 auf Android, HIG auf iOS/macOS, System‑Steuerelemente unter Windows, jeweils mit System‑Typografie (§6).
8. **Performance‑Budget als deterministischer Auditor, der blockiert**, nicht als Bericht, der ignoriert wird (§7).
9. **35 Auditoren, mit den beiden Regeln aus §7**: die durchzusetzen Entscheidung zitieren und schriftliche Aufhebung.
10. **Nur die Deterministen blockieren standardmäßig**; die adversarialen blockieren nur, wenn eine rote Linie oder eine explizite Entscheidung zitiert wird (§7).

## Offene Fragen für den Projektinhaber

1. Was geschieht, wenn ein adversarialer Auditor und ein anderer sich widersprechen — zum Beispiel, Performance verlangt weniger JavaScript und Accessibility verlangt mehr Fokus‑Logik? Gibt es eine schriftliche Prioritätsreihenfolge?
2. Laufen die 23 Auditoren mit LLM bei jedem PR oder nur bei denen, die sensible Pfade berühren? Die Kosten pro PR und die Wartezeit ändern sich stark.
3. Auf welchem Referenzgerät wird das INP‑Budget von 150 ms gemessen? `mc-33` schlägt ein Mittelklasse‑Android über langsames 3G vor; es muss festgelegt werden, sonst ist das Budget nicht prüfbar.
4. Beinhaltet die adaptive Schnittstelle Windows und macOS von Anfang an, oder nur Mobile in Version 1?

## Quellen

1. GitHub, `cloudflare/workerd` Issue #6455 — „Support HTTP/2 bidirectional streaming (gRPC) in Workers/Durable Objects“ — https://github.com/cloudflare/workerd/issues/6455
2. GitHub, `cloudflare/workerd` Issue #3150 — „[Question] gRPC/gRPC-web (+streaming) support for Cloudflare Workers“ — https://github.com/cloudflare/workerd/issues/3150
3. gRPC Core Dokumentation, „gRPC Web“ (PROTOCOL-WEB) — https://grpc.github.io/grpc/core/md_doc__p_r_o_t_o_c_o_l-_w_e_b.html
4. Cloudflare Blog, „We've added JavaScript-native RPC to Cloudflare Workers“ — https://blog.cloudflare.com/javascript-native-rpc/
5. Cloudflare Workers Dokumentation, „Service bindings — RPC (WorkerEntrypoint)“ — https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/rpc/
6. Cloudflare Speed Dokumentation, „HTTP/3 (with QUIC)“ — https://developers.cloudflare.com/speed/optimization/protocol/http3/
7. Cloudflare Speed Dokumentation, „Protocol optimization“ — https://developers.cloudflare.com/speed/optimization/protocol/
8. Calmops, „HTTP/3 and QUIC Protocol Complete Guide 2026“ — https://calmops.com/network/http3-quic-protocol-complete-guide/ — Quelle der Zahlen von 10‑30 % mit 1‑3 % Verlust und der Einsparung >300 ms mit 0‑RTT.
9. Digital Applied, „Core Web Vitals 2026: INP, LCP & CLS Optimization“ — https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide — Quelle der Schwellenwerte, des 43 % die INP scheitern, der Einsparungen von 25‑50 % durch AVIF/WebP und der Unterscheidung Feld‑vs‑Laboratorium.
10. Cloudflare Blog, „Road to gRPC“ — https://blog.cloudflare.com/road-to-grpc/
11. GitHub, `cloudflare/cloudflared` Issue #1641 — gRPC‑Trailers über Tunnel entfernt — https://github.com/cloudflare/cloudflared/issues/1641
12. UXPin, „iOS vs. Android UI Design: 9 Key Differences (2026)“ — https://www.uxpin.com/studio/blog/ios-vs-andoid-ui-design-for-mobile/
13. DEV Community, „Designing Native-Like Progressive Web Apps for iOS“ — https://dev.to/oskarlarsson/designing-native-like-progressive-web-apps-for-ios-510o
14. MagicBell, „4 Essential PWA Strategies for Enhanced iOS Performance“ — https://www.magicbell.com/blog/essential-pwa-strategies-for-enhanced-ios-performance
15. Interne Untersuchung: `mc-32-cloudflare-architecture.md`, `mc-33-pwa-first-reality.md`, `mc-38-accessibility-learning-differences.md`, `mc-42-audio-haptics-game-feel.md`.

**Qualität der Quellen.** Die Quellen [1]‑[7] und [10]‑[11] sind primär: offizielle Dokumentation von Cloudflare, von gRPC und öffentliche Issues ihrer Repositories. Die Quellen [8], [9], [12]‑[14] sind Branchenpublikationen; ihre Zahlen (10‑30 %, 43 %, 25‑50 %) sollten als **Richtwert‑Richtung** behandelt und vor der Verwendung in öffentlichen Materialien gegen den Web Almanac oder CrUX verifiziert werden. Die Schlussfolgerung zu gRPC (§1) beruht **ausschließlich auf primären Quellen** und ist die robusteste in diesem Dokument.
