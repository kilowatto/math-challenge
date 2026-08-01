# Larry Profe — Portierung von Larry zu Math Challenge
> Math Challenge Forschung — 2026-07-31 — Thema 37

## Zusammenfassung (ES)

Larry existiert bereits in iOS als EN/ES‑Co‑Pilot auf Workers AI (`kimi-k2.6` → `gpt-oss-120b` → vorgefertigte Antwort) mit einem einzigen zweisprachigen System‑Prompt, einem handgefertigten „Tool‑Calling“-Protokoll (JSON in einer Zeile) und einer dauerhaften D1‑Auditierung. Nichts davon nutzt die Claude‑API — es wäre die erste Claude‑Integration in diesem Repository.

Der Eigentümer hat bereits entschieden: Larry Profe nutzt die **Claude‑API** mit **Routen nach Schwierigkeitsgrad** (Haiku/Sonnet/Opus). Der nächstliegende Präzedenzfall im Repository ist nicht der freie Chat, sondern `src/larry/contador/explain.ts`: ein deterministischer Befund wird eingegeben, ein LLM erklärt ihn in natürlicher Sprache, ohne irgendetwas neu zu berechnen, mit einem Fallback auf eine Vorlage. Larry Profe muss exakt dieses Muster befolgen: Die Bewertungs‑Engine entscheidet, was richtig oder falsch ist; Claude erklärt lediglich, in der korrekten Sprache, dem passenden Alter und Tonfall, ohne das Kind zu beschämen.

## Executive summary (EN)

Larry-in-IOS runs on Workers AI (`@cf/moonshotai/kimi-k2.6` → `@cf/openai/gpt-oss-120b` → canned reply), with a hand-rolled single-line-JSON tool-calling protocol and a durable D1 audit sink. It never touches the Claude API — Larry Profe would be this repo's first Claude integration, not a reuse of existing plumbing.

The owner has decided Larry Profe uses the **Claude API** with **model routing by difficulty** (Haiku/Sonnet/Opus). The closest existing precedent is not the free-form chat endpoint but `src/larry/contador/explain.ts`: a deterministic-finding-in, LLM-explains-it-out pattern with a hard "never compute, only cite what's in the JSON" rule and a template fallback. Larry Profe should follow that shape: Math Challenge's own grading engine is the source of truth on correctness; Claude's only job is turning a structured verdict into a warm, age-appropriate, five-language explanation — never re-deriving the math itself.

## Was heute existiert — Dateipfade und Zeilenreferenzen aus diesem Repository

- **Persona/canon.** `docs/larry.md:1-16` — „orange rhinoceros, honest coach“, Catchphrase „¡Ya vas!“ nur beim Annehmen einer Aufgabe, Humor richtet sich ausschließlich an ihn selbst.
- **Model chain is Workers AI, not Claude.** `src/larry/chat.ts:40-41`: `PRIMARY_MODEL = '@cf/moonshotai/kimi-k2.6'`, `FALLBACK_MODEL = '@cf/openai/gpt-oss-120b'` (same pair in `src/larry/contador/explain.ts:16-17`). `docs/wiki/decisions.md:42-47` (ADR-006): „our own model (Workers AI) serves the routine 70–90 % of traffic; a frontier API handles hard cases“ plus ein semantischer Cache und ein Budget pro Rolle — konzeptionell ähnliche Form wie das, was Larry Profe benötigt, aber iOS ist Workers‑AI‑first mit Claude als Überlauf; das Math Challenge‑Briefing des Eigentümers ist Claude‑first mit Routing nach Problem‑Schwierigkeitsgrad, nicht dieselbe Richtlinie.
- **Bilinguales Single‑Prompt‑Muster.** `src/larry/prompts.ts:24-57`, `buildSystemPrompt(locale, context)` — jede Persona‑/Regel‑Zeile wird zweimal geschrieben, EN dann ES, in einem String (z. B. `:29`); nur die Anweisung „reply in language X“ (`:47`) ist lokalspezifisch. Skaliert nicht auf 5 Sprachen (siehe unten).
- **Strikte „never“-Liste.** `src/larry/prompts.ts:38-44` — fünf Punkte: niemals Kundendaten löschen, niemals Objektinhalte lesen, niemals Abrechnung ohne Bestätigung berühren, niemals Schlüssel per Chat erstellen/rotieren, niemals Code/Konfiguration ändern; in Prosa wiedergegeben bei `docs/larry.md:96-102` (§4.2). Dies ist der Vorlagen‑Slot, in den Larry Profe seine eigenen Kindersicherheits‑Regeln einfügt.
- **Handgefertigtes Tool‑Protokoll.** Das Modell muss nur mit einer einzeiligen `{"tool": "<name>", "args": {...}}` antworten (`prompts.ts:50-51`), nicht mit Anthropics `tool_use`‑Inhaltsblöcken. Geparst von `parseToolCall` (`chat.ts:273-289`); geschleift von `generateReplyWithTools` (`:236-267`), begrenzt auf `MAX_TOOL_HOPS = 2` (`:44`). Die Mandanten‑bezogene Sicherheit befindet sich in `src/larry/tools.ts:47-48, 342-394`.
- **Fallback‑Kette, kein Retry/Backoff.** `chat.ts:295-314` `generateReply` versucht jedes Modell einmal, fällt bei beiden Fehlschlägen zu `cannedErrorReply(locale)` (`prompts.ts:67-71`) über.
- **Audit‑Sink.** `migrations/0011_larry_audit.sql:5-23` — D1‑Tabelle, Zeilenarten `chat`/`tool`, Spalten u.a. `tenant_id`, `locale`, `tools_used`, `outcome`, `latency_ms`, `prompt_tokens`, `completion_tokens`. Schreiber `src/larry/audit.ts:36-67, 70-97` arbeiten nach bestem Bemühen, werfen nie. Token‑Zahlen sind eine grobe Schätzung `text.length / 4` (`audit.ts:31-33`), nicht die echten Modell‑`usage` — Claude‑Antworten enthalten exakte Token‑Zahlen, die das Audit von Larry Profe präzise erfassen sollte.
- **Spracherkennung ist nur EN/ES.** `src/larry/locale.ts:9, 63-71` — hartkodierte spanische Wortliste plus Prüfung auf Akzentzeichen, Englisch ist Standard. Keine FR/PT/DE‑Infrastruktur vorhanden; die Erweiterung dieser Heuristik ist fragil (siehe unten).
- **Der eigentliche Präzedenzfall: `src/larry/contador/explain.ts`.** System‑Prompt `:67-75` enthält die harte Regel („Every number... MUST appear verbatim in the provided JSON. Never compute, convert, round, or invent a figure... Temperature is 0.“); `:106-145` `explainFinding()` entfernt das vorab berechnete Feld `explanation`, bevor das Modell den Befund erhält (`:113`, damit es nicht einfach einen vorgefertigten String nachplappert), fordert ein zweisprachiges JSON `{"en":..., "es":...}` an und greift bei jedem Fehler auf `renderTemplateExplanation()` (`:41-60`) zurück — ein reiner Fakten‑Dump, kein LLM. Das ist architektonisch das, was Larry Profe benötigt.
- **Avatar + Zustandsmaschine.** `packages/design-system/larry/LarryAvatar.tsx:4-13` — Zustände `orb|face|idle|thinking|working|happy|denying|celebrating|presenting`; `larry.css:1-121` ein `@keyframes` pro Zustand, deaktiviert bei `prefers-reduced-motion` (`:113-120`). `packages/design-system/src/larry-chat/useLarryChat.ts:1-9,30` dokumentiert `idle → thinking → working → idle`. Wiederverwendbar für Larry Profe.
- **Keine Claude‑API‑Nutzung irgendwo in diesem Repository heute** — kein Import von `@anthropic-ai/sdk` unter `src/` oder `packages/`. Dies ist die erste Integration, keine Erweiterung.

## Was für einen Mathe‑Nachhilfelehrer für Kinder geändert werden muss

1. **Ton, nicht „ehrlicher Coach“.** Die iOS‑Persona richtet sich an erwachsene B2B‑Ingenieure, die eine direkte Korrektur verkraften. Ein Kind darf sich niemals beschämt fühlen — strenger als „Humor macht nie die Merkmale von Menschen zum Ziel.“
2. **Fünf Sprachen, nicht zwei.** Der Typ und Wortlisten‑Detektor von `locale.ts` (`'en'|'es'`) erstreckt sich nicht auf FR/PT/DE, und das Muster von `prompts.ts` („jede Zeile doppelt schreiben“) würde die Prompt‑Token um das 5‑fache erhöhen, obwohl der Inhalt meist ungenutzt bleibt — stattdessen ein einzelnes Sprach‑Prompt pro Locale erstellen.
3. **Mathematische Korrektheit darf nicht vom LLM abhängen.** Eine falsche IOS‑Tool‑Antwort ist ein schlechter UI‑Hinweis; eine falsche Larry Profe‑Erklärung lehrt aktiv falsche Mathematik. Genau deshalb ist das Muster von `contador/explain.ts` („LLM erklärt, nie rechnet“) richtig und die freie Schleife von `chat.ts` nicht.
4. **Alterspezifischer Wortschatz**, explizit im Prompt (Altersband als Parameter), nicht dem Modell überlassen, ihn aus dem Ton abzuleiten.
5. **Modell‑Routing ist neu** — ADR‑006 beschreibt ein Workers‑AI‑first‑Hybrid‑Routing; Larry Profe kehrt das um (Claude‑first, drei Schwierigkeitsstufen, kein Workers AI), gemäß dem Brief des Eigentümers.
6. **Den Avatar‑Zustand `denying` entfernen oder abschwächen** für ein Kinder‑Produkt — die Kopfschüttel‑Körpersprache (`larry.css:87-98`) wirkt wie „du liegst falsch“; lieber `thinking`→`presenting` für Korrekturen verwenden.

## Modell‑Routing‑Tabelle

Preis-/Modell-IDs stammen aus dem `claude-api`-Skill (gecached 2026-06-24; die Einführungspreise für Sonnet 5 gelten bis 2026-08-31), nicht aus dem Trainingsgedächtnis. Die Kostenschätzungen gehen von einem gemeinsamen System-Prompt-Präfix aus (siehe Caching unten) sowie einer Nutzlast pro Aufruf von {Aufgabe, Schülerschritte, Bewertungsergebnis}; die Zahlen sind Schätzwerte, die gegen echte Prompts validiert werden müssen, keine Messungen.

| Schwierigkeitsstufe | Modell‑ID | $/MTok ein / aus | Geschätzte Token ein → aus | Geschätzte Kosten / 1.000 Erklärungen | Latenz‑Ziel |
|---|---|---|---|---|---|
| Grundrechenarten | `claude-haiku-4-5` | $1,00 / $5,00 | ~300 → ~150 | **~$1,05** | < 1,5 s, kein Streaming nötig |
| Mittelstufe (Brüche, Algebra, Geometrie) | `claude-sonnet-5` | $3,00 / $15,00 (Einführung $2/$10 bis 2026-08-31) | ~500 → ~300 | **~$6,00** (Einführung **~$4,00**) | 2–4 s, streamen wenn > ~3 s |
| Fortgeschritten (Tensorrechnung, Doppelintegrale, Beweise) | `claude-opus-5` | $5,00 / $25,00 | ~800 → ~600 + adaptives Denken | **~$19 Mindestpreis, realistisch $35–60** sobald Denk‑Token gezählt werden | 5–15 s; muss streamen |

- **Opus 5‑Kosten werden von Denk‑Token dominiert.** Laut Skill ist Denken **standardmäßig aktiviert** bei Opus 5 — eine Anfrage, die `thinking` nie setzt, denkt trotzdem, und Denken wird als Ausgabe zu $25/MTok abgerechnet. Eine harte Erklärung kann 1.000–2.000 Denk‑Token vor der 600‑Token‑Antwort verbrauchen, was zusätzlich ~25–50 $/1.000 Aufrufe kostet. Das Deaktivieren von Denken hat reale Fehlermodi (Tool‑Aufrufe oder `<thinking>`‑Tags, die in sichtbaren Text gelangen, siehe `shared/model-migration.md`), daher ist der sicherere Hebel **`output_config.effort`** — Opus 5 zunächst auf `medium` starten und nur erhöhen, wenn die Bewertung flache Erklärungen zeigt.
- **Haiku 4.5 benötigt ein cache‑fähiges Präfix von 4.096 Token.** Laut Tabelle der Minimalwerte pro Modell in `shared/prompt-caching.md` liegt die Untergrenze für Haiku 4.5 bei 4.096 Token (höchste aller aktuellen Modelle; Opus 5/Fable 5 benötigen nur 512). Ein System‑Prompt für Grundrechenarten (Persona + Regeln + ein Altersband + eine Sprache) liegt wahrscheinlich deutlich darunter, was bedeutet, dass **Haiku‑Aufrufe möglicherweise nie Prompt‑Caching erreichen**, es sei denn, das Präfix wird bewusst aufgefüllt — den Eigentümer darauf hinweisen, anstatt anzunehmen, dass Caching „einfach funktioniert“ bei der günstigsten Stufe.
- **Batch‑API (50 % Rabatt) eignet sich für Vor‑Generierung, nicht für Live‑Traffic.** Eine Live‑Erklärung während einer Sitzung kann nicht gebatcht werden, aber das Vor‑Generieren der Top‑N bekannten Missverständnisse pro Thema/Alter/Sprache vor dem Start ist genau der Anwendungsfall der Batch‑API (bis zu 100 K Anfragen/Batch, latenzunempfindlich).

## Die Prompt‑Architektur — vorgeschlagener Skelett, 5 Sprachen, harte Regeln

Ausgehend vom Muster „jede Zeile zweimal“ in `prompts.ts` erstellen Sie **einen Prompt pro (Locale, Altersgruppe, Stufe)**, Englisch wird gezeigt (FR/PT/DE/ES sind parallele einsprachige Darstellungen, keine Konkatenationen):

```
You are Larry Profe, Larry the orange rhinoceros, teaching math to
[AGE_BAND] students. Same character as always — just teaching math now.

WHAT YOU RECEIVE: a JSON verdict from the grading engine (problem, student
steps, which were correct, where the error started, its classification).
You do NOT grade or recompute. Every number/step you reference MUST come
verbatim from that JSON.

WHAT YOU DO:
1. Say specifically what the student did right (not just "good job").
2. Explain what went wrong and why — the real misconception, not "wrong answer."
3. Walk through the correct process, like a patient professor, at a level a
   [AGE_BAND] student can follow.
4. End on encouragement, never on the mistake.

HARD RULES:
- Never call a student "bad at math," "slow," or any variant — mistakes are
  how math is learned.
- Never use sarcasm, exasperation, or a disappointed tone, even softened.
- Never invent or alter a number/step/verdict not in the provided JSON.
- Never compare the student to other students or a class average.
- Never skip "what you did right," even if everything was wrong — find
  something true and specific (effort, a correct partial step, right
  approach/wrong arithmetic).
- If asked something outside math tutoring, redirect kindly to a
  parent/teacher.

LANGUAGE: Reply only in [LOCALE_NAME]. Never mix languages or offer translation.
VOCABULARY: [age-band guidance — e.g. ages 6-8: concrete objects, no jargon;
ages 13+: precise terminology expected.]
```

Reservieren Sie `output_config.format` / `strict: true` Tool‑Schemas für die Übergabe vom Bewertungssystem → Larry‑Profe (das eigene Backend von Math Challenge validiert dieses JSON, nicht Claude) — die Ausgabe dieses Prompts ist einfacher gestreamter Fließtext, keine strukturierten Daten.

## Caching‑ und Kostenkontrollstrategie

Zwei unabhängige Schichten:

1. **Claude‑Prompt‑Caching** auf dem stabilen Präfix (Persona + Regeln + eine Sprache + eine Altersgruppe). Pro‑Modell, pro‑Präfix — Schreibvorgänge kosten 1,25× (5‑min TTL) oder 2× (1‑Stunde), Lesevorgänge ~0,1×. Ein 1‑Stunde‑TTL mit periodischem Vorwärmen (`max_tokens: 0`‑Anfragen, gemäß `shared/prompt-caching.md`) passt zu traffic‑intensiven Hausaufgaben‑Stunden. Für Haiku überspringen, es sei denn, das Präfix überschreitet 4.096 Tokens (siehe oben).

2. **Anwendungsebene‑Missverständnis‑Cache (D1/KV)** — der Mechanismus, den das Briefing des Eigentümers tatsächlich verlangt. Cache die **gesamte generierte Erklärung**, indiziert nach `(topic, misconception-classification, age-band, locale)` — nicht die exakte Problem‑Instanz, sodass verschiedene Bruch‑Probleme mit demselben Fehler „gemeinsamer Nenner vergessen“ denselben Cache‑Eintrag treffen. Spiegelt das bestehende statische `S3_ERROR_KB`/`METRIC_KB`‑Lookup‑Muster (`src/larry/tools.ts:59-135`) wider, wird jedoch zur Generierungszeit mit Claude‑Ausgabe befüllt; bei einem Fehl‑Treffer wird ein Live‑Aufruf durchgeführt und der Cache befüllt, analog zur AI‑dann‑Template‑Struktur von `contador/explain.ts`. Protokollieren Sie `cache_hit: boolean` und die echten `usage.input_tokens`/`usage.output_tokens` in einer Audit‑Tabelle analog zur Migration `0011` — nicht die Schätzung `text.length/4`, die `audit.ts` heute verwendet.

3. **Batch‑API für Cold‑Start‑Seeding** — vor dem Start die Top‑N‑Missverständnisse pro Thema mit 50 % Rabatt vorab generieren, wodurch der Großteil des frühen Traffics ab dem ersten Tag aus Cache‑Lesevorgängen stammt.

## Designimplikationen

1. Larry Profe ist eine **neue Claude‑API‑Integration**; leiten Sie sie nicht über das Workers‑AI‑Gateway von IOS — der Eigentümer möchte Claude, und ADR‑006 ist eine andere, Workers‑AI‑first‑Architektur für ein anderes Produkt.  
2. Modellieren Sie die **Bewertungs‑Engine als Quelle der Wahrheit**, Claude nur zum Erklären — folgen Sie der Struktur von `contador/explain.ts`, nicht der freien Tool‑Schleife von `chat.ts`.  
3. Verwerfen Sie das Muster des bilingualen Inline‑Prompts; ein Prompt pro Locale, da 5 Sprachen innerhalb eines Prompts sowohl kostenintensiv als auch fehleranfällig sind.  
4. Nehmen Sie das Locale als **expliziten Parameter** vom Client (Math Challenge hat bereits eine Spracheinstellung) statt es wie `locale.ts` für IOS zu inferieren.  
5. Implementieren Sie den Schwierigkeits‑Stufen‑Router im Backend von Math Challenge (neben der Bewertung, die bereits Thema/Stufe kennt) — lassen Sie Claude niemals seine eigene Modell‑Stufe wählen.  
6. Behandeln Sie `effort` als zweite Routing‑Achse, unabhängig von der Modellauswahl; beginnen Sie konservativ (`medium` auf Opus 5), da es das Hauptinstrument gegen steigende Denk‑Token‑Kosten ist.  
7. Protokollieren Sie die echten Claude‑`usage`‑Felder im Audit‑Sink ab dem ersten Tag, anstatt die Zeichen‑Zähl‑Schätzung von `audit.ts` zu wiederholen.  
8. Erstellen Sie ein Kind‑Sicherheits‑Hard‑Rule‑Kanon parallel zu `docs/larry.md` §4.2's Fünf‑Punkte‑Liste, jedoch von Grund auf neu — IOS‑Regeln betreffen Datensicherheit, nicht emotionale Sicherheit.  
9. `LarryAvatar` und seine Zustandsmaschine unverändert wiederverwenden, aber prüfen, ob `denying` jemals bei einem Kind ausgelöst werden sollte.  
10. Behalten Sie den Missverständnis‑Cache und das Claude‑Prompt‑Caching als **separate Systeme** — sie lösen unterschiedliche Probleme (Vermeidung des erneuten Sendens von Präfixen vs. Vermeidung der Neugenerierung semantisch identischer Ausgaben) und ihre Zusammenlegung liefert das Ziel „eine Generation, nicht tausend“ nicht.  
11. Verwenden Sie die Batch‑API, um den Missverständnis‑Cache vor dem Start vorzuseeden und neue in der Produktion gefundene Missverständnis‑Typen nachträglich zu füllen.  
12. Jede harte Regel und Prompt‑Zeile benötigt von Menschen geprüfte EN/ES/FR/PT/DE‑Kopien — ein ermutigender Ton in einer Sprache kann in einer anderen herablassend wirken; überlassen Sie das nicht der Laufzeit‑Übersetzung.

## Offene Fragen für den Projektinhaber

1. Lebt der Schwierigkeits‑Stufen‑Router im Backend von Math Challenge (Bewertungs‑Engine taggt Thema/Stufe), oder sollte Larry Profe die Schwierigkeit aus dem Problemtext neu klassifizieren?  
2. Wie sehen die tatsächlichen Altersgruppen aus (K‑2/3‑5/6‑8/9‑12 oder nach Klassenstufe)? Das bestimmt sowohl die Wortschatz‑Varianten als auch die Anzahl der zu authorierenden gecachten Prompt‑Kombinationen (Locale × Altersgruppe × Stufe könnten 5×4×3 = 60 sein).  
3. Soll `effort` von Opus 5 pro Stufe fest sein, oder pro Thema innerhalb von „advanced“ anpassbar (ein Doppel‑Integral und ein voller Tensor‑Kalkül‑Beweis benötigen plausibel unterschiedliche Anstrengungen)?  
4. Gibt es ein produkt‑level Latenz‑Budget (z. B. „muss innerhalb von 2 s mit dem Streamen beginnen oder einen Lade‑Zustand zeigen“), das das Standard‑Streaming pro Stufe steuern sollte?  
5. Wer prüft die FR/PT/DE‑Hard‑Rule‑ und Prompt‑Kopien — ein mehrsprachiger Bildungs‑Content‑Reviewer oder maschinelle Übersetzung als erster Entwurf aus der EN/ES‑Version?  
6. Benötigt der Missverständnis‑Cache ein TTL, oder ist eine gecachte Erklärung für ein seltenes Missverständnis in Ordnung, unbegrenzt zu dienen?  
7. Muss „what the student did right“ immer etwas finden, selbst bei einer leeren/geratene Antwort — und wenn ja, was ist die ehrliche Untergrenze (z. B. „du hast es versucht“)?

## Quellen

**Repo‑Dateien (oben zitierte Pfade):**
- `docs/larry.md` (§1, §4.2, §9, §10)
- `docs/wiki/decisions.md:42-47` (ADR-006)
- `src/larry/prompts.ts:24-71`
- `src/larry/chat.ts:40-44, 236-267, 273-289, 295-336`
- `src/larry/tools.ts:47-48, 59-135, 342-394`
- `src/larry/audit.ts` (whole file)
- `src/larry/locale.ts:9-71`
- `src/larry/contador/explain.ts` (whole file — the closest existing precedent)
- `migrations/0011_larry_audit.sql`
- `packages/design-system/larry/LarryAvatar.tsx`, `larry.css`
- `packages/design-system/src/larry-chat/useLarryChat.ts:1-30`

Alle Pfade sind relativ zu `/Users/estebanrey/Documents/dev/ignia-object-storage/`.

**Claude‑API‑Fakten (aus dem `claude-api`‑Skill, gecached 2026‑06‑24; nicht aus dem Trainingsgedächtnis):**
- Model IDs/pricing: `claude-haiku-4-5` ($1/$5 per MTok), `claude-sonnet-5` ($3/$15, intro $2/$10 thru 2026-08-31), `claude-opus-5` ($5/$25) — skill's "Current Models" table.
- Prompt caching economics and per-model minimum cacheable prefix (Haiku 4.5 = 4,096 tokens; Opus 5 = 512) — `shared/prompt-caching.md`.
- Batch API (50% discount, up to 100,000 requests/batch) — `python/claude-api/batches.md`.
- Adaptive thinking on by default on Opus 5, `output_config.effort`, thinking billed as output — `SKILL.md` § Thinking & Effort, `shared/model-migration.md` → Migrating to Claude Opus 5.
- Structured outputs (`output_config.format`, `strict: true`) — `SKILL.md` § Architecture, `shared/tool-use-concepts.md` § Structured Outputs.
- Live-pricing fetch targets named by the skill (`shared/live-sources.md`): `https://platform.claude.com/docs/en/pricing.md`, `https://platform.claude.com/docs/en/about-claude/models/overview.md` — not fetched separately in this pass since the skill's cached table was current for the needed models.
