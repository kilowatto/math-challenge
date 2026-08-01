# Das offene Portal: warum das Veröffentlichen von Forschung *die* organische Strategie ist

> Math Challenge research — 2026-07-31 — topic 48

## Zusammenfassung (ES)

- **Die Erkenntnis, die den Plan ändert:** nach dem Update im März 2026, *"Originalforschung und dokumentierte Fallstudien gehören zu den wertvollsten Inhalts‑Assets, die eine Organisation produzieren kann"* [1].
- **Und KI‑Zitate verstärken das:** eine Studie von Wellows über 2.400 Zitate in AI‑Overviews ergab, dass Seiten mit starken E‑E‑A‑T‑Signalen **2,3× wahrscheinlicher zitiert werden** [1].
- **Die Kosten, es nicht zu haben, sind real:** Hunderte von Websites verloren **40‑70 % ihres organischen Traffics über Nacht** bei jüngsten Algorithmus‑Updates; diejenigen, die überlebten und wuchsen, hatten stark in E‑E‑A‑T investiert [1].
- **E‑E‑A‑T besteht aus vier verschiedenen Elementen** — Experience (Erfahrung aus erster Hand), Expertise (Fachwissen und Qualifikationen), Authoritativeness (Anerkennung und Reputation) und Trustworthiness (Genauigkeit, Transparenz und Nutzererfahrung) [1][2]. Das erste **E** wurde im Dezember 2022 hinzugefügt [2].
- Math Challenge hat 152.000 Wörter originärer Forschung **mit zitierten Quellen, deklarierten Einschränkungen und mit `[unverified]` gekennzeichneten Aussagen** — das deckt Expertise und Trustworthiness auf eine Weise ab, die kaum jemand im EdTech‑Bereich leistet.
- **Was nicht gekauft oder erforscht werden kann, ist die Experience**: die Geschichte aus erster Hand, warum das Projekt existiert. Diese liefert nur der Eigentümer (siehe [`por-que-existe.md`](../por-que-existe.md)).
- **JSON‑LD ist das bevorzugte Format von Google**, und der strukturierte Inhalt **muss pro Sprachversion übersetzt werden**, wobei das Schema intakt bleibt; jede lokalisierte Version gibt ihr `inLanguage` an [3][4][5].
- **Das Schema ersetzt nicht `hreflang`**, es ergänzt es: `hreflang` kennzeichnet Sprach‑ und Regionsvarianten, das Schema verstärkt diese Absicht in maschinenlesbarer Form [3][4].
- **Harte Regel:** Der Schema‑Inhalt **muss mit dem, was auf der Seite sichtbar ist, übereinstimmen**; weicht er ab, kann Google das Markup vollständig ignorieren [5].
- Zentrale Implikation: Die Website ist kein Marketing mit angehängter Forschung. **Die Forschung ist die Website**, und die WCAG 2.2 AA‑Barrierefreiheit (`mc-38`) ist nicht nur seit Juni 2025 eine rechtliche Verpflichtung in der EU, sondern ein direkter Trustworthiness‑Hinweis.

## Zusammenfassung (EN)

- **Die Erkenntnis, die den Plan ändert:** nach dem Update im März 2026, *"Originalforschung und dokumentierte Fallstudien gehören zu den wertvollsten Inhalts‑Assets, die eine Organisation produzieren kann"* [1].
- **KI‑Zitate verstärken das:** eine Wellows‑Studie von 2.400 AI‑Overview‑Zitaten ergab, dass Seiten mit starken E‑E‑A‑T‑Signalen **2,3× wahrscheinlicher zitiert werden** [1].
- **Die Kosten, es zu fehlen, sind real:** Hunderte von Websites verloren **40‑70 % ihres organischen Traffics über Nacht** bei jüngsten Core‑Updates; diejenigen, die überlebten und wuchsen, hatten stark in E‑E‑A‑T investiert [1].
- **E‑E‑A‑T besteht aus vier unterschiedlichen Elementen** — Experience (Erfahrung aus erster Hand), Expertise, Authoritativeness, Trustworthiness [1][2]. Das erste **E** wurde im Dezember 2022 hinzugefügt [2].
- Math Challenge hat 152.000 Wörter originärer Forschung **mit zitierten Quellen, deklarierten Einschränkungen und `[unverified]`‑Markierungen** — das deckt Expertise und Trustworthiness auf eine Weise ab, die kaum jemand im EdTech‑Bereich leistet.
- **Was nicht gekauft oder erforscht werden kann, ist Experience**: die Geschichte aus erster Hand, warum das Projekt existiert.
- **JSON‑LD ist das bevorzugte Format von Google**, strukturierte Daten **müssen pro Sprachversion übersetzt werden**, das Schema bleibt intakt, und jede lokalisierte Version gibt `inLanguage` an [3][4][5].
- **Schema ersetzt nicht `hreflang`** — es ergänzt es [3][4]. **Harte Regel:** Schema‑Inhalt **muss mit dem, was auf der Seite sichtbar ist, übereinstimmen**, sonst kann Google das Markup vollständig ignorieren [5].
- Kernimplikation: Die Forschung *ist* die Website, und die WCAG 2.2 AA‑Barrierefreiheit ist ein Trustworthiness‑Signal, nicht nur eine rechtliche Verpflichtung der EU.

## Ergebnisse

### 1. Warum 152.000 Forschungswörter das Asset und nicht der Anhang sind

Die grundlegende Veränderung nach März 2026 ist, dass Google aufgehört hat, Inhalte zu belohnen, die *scheinbar* autoritativ sind, und stattdessen solche belohnt, die **nachweislich autoritativ sind**. Die genaue Formulierung der Quelle: die ursprüngliche Forschung und die dokumentierten Fallstudien *„zu den wertvollsten Inhalts‑Assets geworden sind, die eine Organisation produzieren kann“* [1].

Der zweite Effekt ist der, der mittelfristig am wichtigsten ist. Da AI‑Overviews immer mehr Anfragen vermitteln, ist **zitiert** zu werden wertvoller als zu ranken: die Studie von Wellows über 2.400 Zitate ergab, dass Seiten mit starken E‑E‑A‑T‑Signalen **2,3× höhere Wahrscheinlichkeit haben, zitiert zu werden** [1]. Eine Forschung mit nummerierten und überprüfbaren Quellen ist genau die Art von Seite, die ein Retrieval‑System bevorzugt zu zitieren.

Und das Risiko, es nicht zu tun, ist gemessen: Hunderte von Websites verloren **40‑70 % ihres organischen Traffics von einem Tag auf den anderen** bei jüngsten Updates, und die, die wuchsen, hatten stark in E‑E‑A‑T investiert [1].

**Wo Math Challenge steht.** Die 45 Forschungen haben nummerierte Quellen, deklarieren ihre methodischen Einschränkungen, markieren `[unverified]` das, was sie nicht gegen die Primärquelle bestätigen konnten, und — das ist ungewöhnlich — **enthalten die Passagen, in denen die Evidenz dem eigenen Produkt widerspricht**: `mc-10` widerlegt das berühmteste Zitat zu zeitgesteuerten Prüfungen, `mc-17` dokumentiert die regulatorische Exposition der Mechanik, die das ursprüngliche Briefing verlangte, `mc-14` weist darauf hin, dass der Tutor von Khan Academy in einer kontrollierten Studie keinen Suchmaschine übertroffen hat.

Das zu veröffentlichen ist keine Demut: es ist die operative Definition von Trustworthiness. Und praktisch kein Wettbewerber tut das — `mc-14` dokumentiert, dass Brilliant, Matific und Mathletics keine veröffentlichte unabhängige Evidenz haben und dass Kumon nicht einmal eine Studie besitzt, die den Standards des What Works Clearinghouse entspricht.

### 2. Die vier Buchstaben und welche fehlt

E‑E‑A‑T zerfällt in vier unterschiedliche Signale, und es ist sinnvoll, sie zuzuordnen, weil die Seite die vier auf verschiedenen Wegen abdecken muss [1][2]:

| Signal | Was wird gefragt? | Wie deckt diese Seite das ab |
|---|---|---|
| **Experience** | Hat der Autor eine direkte Beteiligung? | Die Geschichte des Besitzers: warum er angefangen hat, seine eigene Beziehung zu Mathematik, seine eigene Nutzung des Produkts. **Nur er liefert sie.** |
| **Expertise** | Gibt es nachgewiesenes Wissen und Kompetenz? | 45 Forschungen, 152.000 Wörter, mit zitierten Primärquellen |
| **Authoritativeness** | Gibt es Anerkennung und Reputation? | Ignia als institutioneller Rückhalt; eingehende Zitate, die die veröffentlichte Forschung im Laufe der Zeit anzieht |
| **Trustworthiness** | Gibt es Genauigkeit, Transparenz und gute Nutzererfahrung? | Deklarierte Einschränkungen, `[unverified]` sichtbar, veröffentlichte Widersprüche und WCAG 2.2 AA‑Zugänglichkeit |

Die **Experience** ist das einzige Signal, das nicht durch mehr Forschungsarbeit erzeugt werden kann, und wurde im Dezember 2022 genau dafür hinzugefügt, um denjenigen zu unterscheiden, der das Problem erlebt hat, von dem, der es nur studiert hat [2]. Deshalb ist das Interview mit dem Besitzer kein Füllinhalt für die „Über uns“-Seite: es ist das Signal, das der Rest der Seite nicht erzeugen kann.

### 3. Strukturierte Daten in sieben Lokalen

**JSON‑LD ist das bevorzugte Format von Google** [3][5]. Die Regeln, die seine mehrsprachige Nutzung steuern:

- **Der Inhalt innerhalb von JSON‑LD wird pro Sprachversion übersetzt, wobei die Struktur unverändert bleibt** — strukturierte Daten müssen jede lokalisierte Version unabhängig widerspiegeln [3][4].
- **Jede Version gibt ihre Sprache an** mit der Eigenschaft `inLanguage`; für Organisationsnamen empfiehlt es sich, `alternateName` in verschiedenen Sprachen einzuschließen [3][4].
- **Schema‑Typen müssen zwischen den Sprachen konsistent bleiben** — man verwendet nicht `Course` auf Spanisch und `Article` auf Deutsch für dieselbe Seite [5].
- **Das Schema ersetzt nicht `hreflang`.** Die `hreflang`‑Tags sind diejenigen, die Suchmaschinen Sprach‑ und Regionsvarianten anzeigen; das Schema verstärkt diese Absicht in maschinenlesbarer Form [3][4].
- **Regel, die alles andere ungültig macht, wenn sie verletzt wird:** Der Schema‑Inhalt **muss mit dem Sichtbaren auf der Seite übereinstimmen**. Wenn das Markup etwas anderes enthält als das, was angezeigt wird, kann Google es vollständig ignorieren [5].

Die Typen, die zu dieser Seite passen: `Organization` (Ignia als Herausgeber), `WebSite`, `Course` für die Level‑Bänder, `FAQPage` für Elternfragen, `BreadcrumbList` für die Navigation, und für jede der 45 Forschungen ein akademischer Artikel‑Typ mit zitierten Quellen — genau das Format, das ein Zitationssystem bevorzugt zu konsumieren.

### 4. Sieben Lokale, nicht fünf Sprachen

Die Seite übernimmt die Realität von `mc-34`: `en`, `es-MX`, `es-ES`, `fr-FR`, `pt-BR`, `pt-PT`, `de-DE`. Für SEO bedeutet das sieben Versionen mit wechselseitigem `hreflang` — jede Seite verweist auf alle anderen und auf sich selbst — plus `x-default`.

Die spezifische Falle dieses Produkts: **`es-MX` und `es-ES` sind nicht dieselbe übersetzte Seite**, weil die mathematische Notation unterschiedlich ist (Punkt‑ versus Komma‑Dezimaltrennzeichen, Format der langen Division). Eine einzige „es“-Version zu veröffentlichen und zwei `hreflang`‑Tags zu deklarieren wäre technisch zulässig, aber **faktisch inkorrekt** im mathematischen Inhalt, genau dem Inhalt, den die Seite zitieren lassen möchte.

### 5. Barrierefreiheit als Signal, nicht nur als Verpflichtung

`mc-38` legt bereits die gesetzliche Anforderung fest: das Europäische Barrierefreiheitsgesetz gilt seit dem 28. Juni 2025 und schließt ausdrücklich den elektronischen Handel ein, mit EN 301 549 (das die vollständige WCAG 2.1 integriert) als technischer Referenz. Das interne Ziel ist WCAG 2.2 AA, ein strenger Superset.

Was dieses Dokument hinzufügt: Die Trustworthiness von E‑E‑A‑T bewertet auch **die Nutzererfahrung** [1][2]. Eine nicht barrierefreie Seite verstößt nicht nur gegen die EU‑Vorschriften — sie verfehlt eines der vier Signale, die bestimmen, ob Inhalte ranken und zitiert werden. Es ist der seltene Fall, in dem rechtliche Konformität und organische Strategie exakt dieselbe Arbeit erfordern.

### 6. Die Attribution von Ignia und warum Präzision hier strategisch ist

Ignia Cloud ist ein Cloud‑Anbieter mit Sitz in Mexiko‑Stadt und Betrieb in den Vereinigten Staaten, der sich mit dem Slogan *„Trust, Integrity and Availability in one place“* beschreibt, Infrastruktur, Datensicherheit, großskalige Datenverwaltung und Hochleistungs‑Computing anbietet und 99,99 % SLA in Zusammenarbeit mit Microsoft, Dell Technologies, Cisco Systems, OpenStack, Canonical und Acronis erklärt [6].

**Math Challenge läuft auf Cloudflare** (`mc-32`). Zu behaupten, dass der Stack von Ignia bereitgestellt wird, wäre mit einer DNS‑Abfrage widerlegbar, und die Zielgruppe der Architekturseite ist genau die, die das tun würde.

Die genaue und überprüfbare Formulierung besteht aus zwei Teilen: **Ignia erstellt und sponsert das Projekt** — was wahr ist und beinhaltet, dass Larry ihr bereits bestehender Charakter ist (`mc-37`, D-004) — **und Cloudflare ist die Infrastruktur**. Beide Aussagen halten einer Prüfung stand, und die Architekturseite wird dadurch zu eigenem zitierbarem technischem Inhalt, was mehr organischen Traffic bedeutet und nicht weniger.

Das verbindet sich direkt mit Trustworthiness: Eine Seite, die ihre `[unverified]` veröffentlicht und dann ihre eigene Infrastruktur übertreibt, widerspricht ihrem wertvollsten Signal.

## Designimplikationen

1. **Die 45 vollständigen Untersuchungen** als eigene, indexierbare Seiten veröffentlichen, mit Quellen, Einschränkungen und `[unverified]` sichtbar — das ist das Asset, das das Update vom März 2026 belohnt (§1).
2. **Auch das veröffentlichen, was dem Produkt widerspricht.** Das ist der Teil, den kein Wettbewerber macht und der das Trustworthiness‑Signal stützt (§1, §2).
3. **Die Geschichte des Eigentümers ist erstklassiger Inhalt, nicht eine „Über uns“-Seite.** Das ist die einzige Quelle für Experience der Seite (§2).
4. **JSON‑LD mit `inLanguage` pro Version**, identische Struktur zwischen den Locales und übersetzter Inhalt darin (§3).
5. **Reziprokes `hreflang` zwischen den sieben Locales plus `x-default`**, ergänzt —nicht ersetzt— durch das Schema (§3, §4).
6. **`es-MX` und `es-ES` sind zwei getrennte Seiten, wenn mathematische Notation vorkommt**, nicht eine mit zwei Tags (§4).
7. **Deterministischer Auditor, der JSON‑LD und die Reziprozität von `hreflang`** bei jedem Commit validiert, und ein weiterer, der prüft, dass das Schema mit dem Sichtbaren übereinstimmt (§3) — die Regel, deren Nicht‑Einhaltung das gesamte Markup ungültig macht.
8. **WCAG 2.2 AA als Veröffentlichungsanforderung der Seite**, nicht nur der App (§5).
9. **Zweifache Attribution: Ignia‑Projekt, Cloudflare‑Infrastruktur** (§6).
10. **Die Architektur‑Seite ist Inhalt, kein Footer.** Erklären, warum native RPC statt gRPC, warum HTTP/3, warum die Versuche nicht zu D1 gehen — das ist zitierbares technisches Material (`mc-47`).
11. **Ein lokaler Auditor pro Sprache prüft ebenfalls die Seite**, nicht nur die App: falsch lokalisierte mathematische Notation auf einer öffentlichen Seite ist ein von Dritten zitierbarer Fehler.
12. **Keine Lernresultate beanspruchen** bis zur eigenen Studie; der Master‑Plan §14 verbietet das bereits, und auf einer Seite, die Strenge vorgibt, kostet eine einzige ungestützte Behauptung mehr als auf einer, die das nicht tut.

## Offene Fragen für den Projektinhaber

1. Werden die 45 Untersuchungen in allen sieben Locales veröffentlicht oder nur in `en` und `es-MX`? Das Übersetzen von 152.000 Wörtern × 6 ist ein echter Aufwand; sie nur in zwei zu veröffentlichen und ein korrektes `hreflang` anzugeben, ist vertretbar.
2. Liegt die Seite unter `math.kilowatto.com` zusammen mit der App, oder auf einer eigenen Domain? Das beeinflusst die Domain‑Autorität und die Trennung zwischen öffentlichem und authentifiziertem Inhalt.
3. Wer unterschreibt die Untersuchungen als Autor? Die Authoritativeness verbessert sich durch zugewiesene und überprüfbare Autorenschaft, und derzeit haben die Dokumente keine Unterschrift.
4. Wird auch `decisions.md` veröffentlicht — inklusive der zurückgenommenen Entscheidungen wie D-001 und D-010? Das ist das höchste Transparenzniveau und zugleich das am stärksten exponierte.
5. Gibt es Interesse, aktiv nach eingehenden Zitaten zu suchen (Forscher, Bildungs‑Presse, EdTech‑Community), oder ist die Strategie rein passiv‑organisch?

## Quellen

1. Digital Applied, „E‑E‑A‑T im März 2026: Google belohnt Experience‑Content“ — https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide — Quelle der Erkenntnis, dass Originalforschung das wertvollste Asset ist, der Wellows‑Studie mit 2.400 Zitaten (2,3×) und des Verlusts von 40‑70 % des Traffics.  
2. Keywords Everywhere, „Google E‑E‑A‑T‑Richtlinien: ein Überblick (2026 Playbook)“ — https://keywordseverywhere.com/blog/google-e-e-a-t-guidelines-an-overview/ — Quelle der Definition der vier Signale und des Hinzufügens von Experience.  
3. Better i18n, „Multilingual Schema Markup: Structured Data for International SEO“ — https://better-i18n.com/en/blog/multilingual-schema-markup/  
4. Linguise, „Using schema markup and structured data for multilingual websites SEO“ — https://www.linguise.com/blog/guide/using-schema-markup-and-structured-data-for-multilingual-websites-seo/  
5. SearchX, „Structured Data For Multilingual SEO: Top 7 Tips“ — https://searchxpro.com/structured-data-for-multilingual-seo-top-7-tips/ — Quelle der Regel für Schema‑Seiten‑Übereinstimmung.  
6. Ignia Cloud, offizielle Seite — https://ignia.cloud — Quelle der Beschreibung, des Slogans, der Services, des SLA und der Partnerschaften.  
7. Interne Untersuchung: `mc-34-i18n-math-notation.md` (die sieben Locales und warum es nicht fünf sind), `mc-38-accessibility-learning-differences.md` (WCAG 2.2 AA und das Europäische Barrierefreiheitsgesetz), `mc-14-competitive-products.md` (das Fehlen veröffentlichter Evidenz bei Wettbewerbern), `mc-47-stack-protocols-performance.md` (das zitierbare technische Material), `mc-32-cloudflare-architecture.md` (was wo läuft, für die Attribution von §6).

**Qualität der Quellen.** Keine Quelle dieses Dokuments ist primär von Google: [1]‑[5] sind Veröffentlichungen von Agenturen und SEO‑Beratungen, die ein kommerzielles Interesse daran haben, dass SEO entscheidend erscheint. Die konkreten Zahlen —2,3×, 40‑70 %, die Wellows‑Studie mit 2.400 Zitaten— **müssen als nicht verifiziert gegenüber einer primären Quelle behandelt werden** und in der Dokumentation von Google Search Central bestätigt werden, bevor sie in öffentlichen Materialien oder zur Budgetbegründung verwendet werden. Die strukturelle Orientierung (bevorzugtes JSON‑LD, `inLanguage`, Schema ersetzt nicht `hreflang`, das Schema muss mit der Seite übereinstimmen) ist zwischen den fünf Quellen und der öffentlichen Google‑Dokumentation konsistent und ist der verlässlichste Teil. Quelle [6] ist primär von Ignia selbst.
