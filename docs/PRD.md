# Product Requirement Document — „KinderGesundheit+"

> ## ⚠️ Dieses Dokument ist in Teilen überholt
>
> Der Scope wurde später auf eine strikt dokumentierende Anwendung eingeengt.
> Verbindlich ist seitdem **[`../REGULATORY.md`](../REGULATORY.md)**.
>
> Aus diesem PRD **nicht mehr umgesetzt** (Ausschlussliste): Impfplan-Ableitung
> aus dem Geburtsdatum, Vorsorgeterminplan, Fälligkeitsstufen, Medikamenten-
> Sperr-Timer, berechnetes Tageslabel, Wachstums-Trendbewertung, Fieberschwelle
> und daraus abgeleitete Zählungen, automatische Episodenbildung sowie die
> Gegenüberstellung von Schlaf- und Krankheitsdaten.
>
> Weiterhin gültig sind Personas, User Journey, die UX-Grundsätze (Eingabe unter
> zehn Sekunden, Speichern zuerst), das Datenschutzkonzept und die
> Farbkontrast-Korrektur.

| | |
|---|---|
| **Produkt** | KinderGesundheit+ (Arbeitstitel) |
| **Plattformen** | iOS & Android (Phase 1), Web-Export (Phase 3) |
| **Dokument-Version** | 1.0 |
| **Stand** | 2026-08-15 |
| **Status** | Entwurf zur Abstimmung |
| **Markt (Launch)** | Deutschland (DACH in Phase 2) |

---

## 0. Produktvision & Positionierung

### 0.1 Vision Statement

> **KinderGesundheit+ ist der eine ruhige Ort, an dem Eltern die Gesundheit ihres Kindes von der Geburt bis zur Grundschule festhalten — und der ihnen zurückgibt, was sie selbst nie herauslesen könnten: Muster, Zusammenhänge und die Sicherheit, nichts Wichtiges vergessen zu haben.**

### 0.2 Das Problem

Eltern dokumentieren heute in drei bis fünf getrennten Systemen: gelbes U-Heft, Impfpass (Papier), WhatsApp-Notizen an sich selbst, eine Baby-Tracker-App aus dem ersten Jahr und das Gedächtnis. Beim Kinderarzttermin lautet die Frage „Wie oft hatte er diesen Winter Fieber?" — und die ehrliche Antwort ist „ich glaube, oft". Diese Lücke zwischen *gesammelten Daten* und *nutzbarer Antwort* ist der Kern des Produkts.

### 0.3 Positionierung in einem Satz

Für **deutsche Eltern von Kindern zwischen 0 und 10 Jahren**, die den Überblick über Krankheiten, Impfungen und Entwicklung behalten wollen, ist **KinderGesundheit+** eine **Gesundheitsdokumentation, die mitdenkt** — anders als Baby-Tracker (enden nach dem 1. Jahr) und anders als klinische Symptom-Apps (kalt, generisch, ohne deutschen Kontext), weil sie **mit dem Kind mitwächst, STIKO und U-Untersuchungen kennt und aus Rohdaten verständliche Erkenntnisse macht.**

### 0.4 Was das Produkt ausdrücklich *nicht* ist

Diese Abgrenzung ist keine Bescheidenheit, sondern eine **regulatorische Notwendigkeit** (siehe §5.7):

* **Keine Diagnose.** Die App nennt keine Krankheitsursachen und schlägt keine Behandlungen vor.
* **Kein Triage-Tool.** Sie sagt nie „gehen Sie zum Arzt" oder „das ist harmlos".
* **Keine Dosierungsempfehlung.** Medikamentendosen werden dokumentiert, nicht berechnet oder vorgeschlagen.
* **Kein Ersatz für U-Heft und Impfpass.** Sie ist die durchsuchbare Zweitkopie, das Papier bleibt das Original.

Alle „intelligenten" Funktionen sind **deskriptiv** („Ihr Kind hatte in den letzten 90 Tagen an 12 Tagen Fieber") und niemals **präskriptiv**.

---

## 1. User Personas

### Persona 1 — Julia, 32, Erstmutter im Elternjahr

| | |
|---|---|
| **Kind** | Mila, 8 Monate |
| **Situation** | Erstes Kind, 8 Monate Elternzeit, Partner arbeitet Vollzeit |
| **Tech-Affinität** | Hoch. iPhone, nutzt bereits eine Baby-Tracker-App, Instagram-Elterngruppen |
| **Wann sie die App öffnet** | 6–12× am Tag, oft einhändig, oft nachts bei Restlicht |

**Ziele**
* Nachvollziehen, ob Mila genug trinkt und normal zunimmt („liegt sie in der Kurve?")
* Beim U6-Termin präzise Antworten geben statt zu raten
* Beikost-Einführung dokumentieren, um eine mögliche Allergie zurückverfolgen zu können

**Frustrationen**
* Ihre aktuelle App kann Stillzeiten, aber kein Fieber — Krankheit landet in den Notizen
* Perzentilen versteht sie nicht: „P25 — ist das schlimm?"
* Sie hat Angst, etwas zu übersehen, und googelt nachts Symptome

**Zitat**
> „Ich schreibe alles auf, aber wenn die Ärztin fragt, blättere ich hilflos durch mein Handy."

**Was die App für sie leisten muss**
Einhändige Eingabe in unter 10 Sekunden. Perzentilen in Klartext übersetzt („Mila wächst seit 4 Monaten stabil auf ihrer Kurve"). Ein Arzttermin-Export, den sie vorher einmal durchliest und dann ruhig ins Gespräch geht.

---

### Persona 2 — Thomas, 38, Vater in Teilzeit, zweites Kind

| | |
|---|---|
| **Kinder** | Ben, 3 Jahre (Kindergarten seit 6 Monaten), Lea, 6 Jahre (1. Klasse) |
| **Situation** | 30h-Woche, teilt sich Care-Arbeit mit Partnerin |
| **Tech-Affinität** | Mittel. Android, pragmatisch, misstrauisch gegenüber Abos und Datensammlern |
| **Wann er die App öffnet** | 2–4× pro Woche, im Krankheitsfall mehrmals täglich |

**Ziele**
* Den „Kindergarten-Winter" überstehen: Ben war seit September gefühlt dauerkrank — stimmt das?
* Zwei Kinder in *einer* App, mit Daten, die beide Eltern sehen
* Impftermine nicht verpassen, ohne selbst einen Kalender pflegen zu müssen

**Frustrationen**
* Seine Partnerin und er dokumentieren getrennt → widersprüchliche Angaben beim Arzt
* Der Impfpass liegt bei der Kinderärztin in der Schublade, er weiß nie den Stand
* Er will keine App, die seine Kinderdaten „in die Cloud" schiebt, ohne dass er weiß wohin

**Zitat**
> „Ich brauche keine Diagnose. Ich brauche eine ehrliche Antwort auf: War das jetzt viel oder normal?"

**Was die App für sie leisten muss**
Kinderwechsel in einem Tap. Geteilter Familien-Account mit klarer, deutscher Datenschutz-Aussage. Eine Jahresübersicht, die „14 Krankheitstage seit September" zeigt, statt eines Gefühls.

---

### Sekundär-Persona — Dr. Kessler, 51, Kinderärztin (Empfängerin, nicht Nutzerin)

Sie ist **kein App-Nutzer**, aber die entscheidende Qualitätsinstanz: Wenn der PDF-Export in ihrer 8-Minuten-Sprechstunde nicht in **15 Sekunden erfassbar** ist, wird er weggelegt — und die App verliert ihr stärkstes Weiterempfehlungsargument. Sie braucht: Zeitraum, Fieberkurve, Symptomtage, Medikamente, Impfstatus. Auf **einer** Seite. Ohne Marketing-Logo im Weg.

---

## 2. User Journey Map

### Hauptszenario: „Krankheit eintragen und Verlauf checken"

**Kontext:** Thomas, Dienstagabend 20:40 Uhr. Ben (3) ist heiß, quengelig, der Kindergarten hat schon angerufen. Es ist der dritte Infekt in sechs Wochen.

| Phase | Was der Nutzer tut | Was er denkt | Emotion | Touchpoint / Systemantwort | Risiko & Designantwort |
|---|---|---|---|---|---|
| **1. Auslöser** | Misst 38,9 °C mit dem Ohrthermometer, greift zum Handy | „Schon wieder. War das letzte Woche nicht auch schon?" | 😟 Sorge + Erschöpfung | Push ist *nicht* der Auslöser — die App muss von außen angesteuert werden | **Risiko:** App wird in der Situation vergessen. → **Home-Screen-Widget** „Ben: Eintrag" als permanenter Einstiegspunkt |
| **2. Erfassen** | Öffnet App → Dashboard zeigt Ben aktiv → tippt Quick-Chip **„Fieber"** | „Bloß schnell." | 😐 Fokussiert | Chip legt sofort Eintrag mit Zeitstempel an, öffnet Zahlen-Pad für Temperatur | **Risiko:** Formularmüdigkeit. → **Speichern passiert beim Tap auf den Chip**, nicht am Ende. Temperatur ist optionale Ergänzung, kein Pflichtfeld |
| **3. Ergänzen** | Gibt „38,9" ein, tippt zusätzlich **„Husten"**, wischt Sheet weg | „Reicht. Rest morgen." | 🙂 Erleichtert | Sheet bestätigt mit Micro-Toast „Eingetragen · 20:41 · rückgängig" | **Risiko:** Fehleingabe ohne Ausweg. → **Undo bleibt 8 Sekunden sichtbar**, danach über Verlauf editierbar |
| **4. Medikament** | Gibt Fiebersaft, tippt „Medikament" → wählt gespeichertes Preset „Ibuprofen-Saft 2%" | „Wann darf der nächste?" | 😐 Unsicher | App startet **Sperr-Timer**: „Nächste Gabe frühestens 00:41" — als reine Wiedergabe des zuvor vom Nutzer selbst hinterlegten Mindestabstands | **Regulatorisch kritisch:** Kein Dosisvorschlag durch die App. Der Mindestabstand stammt aus der Nutzer-Eingabe beim Anlegen des Presets, die App rechnet nur die Uhrzeit |
| **5. Nachtverlauf** | 01:15 Uhr: misst erneut, trägt 39,4 °C ein | „Steigt es?" | 😟 Angespannt | Dark-Mode dimmt automatisch, Verlaufsgrafik zeigt die letzten 24 h als Linie | **Risiko:** Blendung, Aufwecken des Kindes. → Night-Mode ab 21 Uhr, keine hellen Flächen, keine Animationen |
| **6. Rückschau** | Zwei Tage später, ruhiger Moment: öffnet **Tracker → Kalender** | „War das jetzt viel dieses Jahr?" | 🤔 Neugierig | Kalender zeigt Krankheitstage farbig; Tap auf Monat öffnet Auswertung | Das ist der **Aha-Moment** des Produkts — er muss ohne Suchen erreichbar sein: max. 2 Taps vom Dashboard |
| **7. Erkenntnis** | Liest: „Seit Kindergartenstart: 5 Infekte, 14 Krankheitstage. Vergleichbarer Zeitraum im Vorjahr: 2 Infekte." | „Also stimmt mein Gefühl. Aber 5 in 6 Monaten ist im ersten Kita-Jahr wohl normal." | 😌 Beruhigt durch Fakten | Rein deskriptive Aussage. **Keine** Einordnung wie „das ist normal" durch die App | **Regulatorisch kritisch:** Die App liefert die Zahl, die Einordnung macht der Mensch (oder der Arzt) |
| **8. Weitergabe** | Vor dem Arzttermin: **Export → letzte 3 Monate → PDF** | „Damit gehe ich rein." | 💪 Vorbereitet | Einseitiges PDF: Fieberkurve, Symptomtage, Medikamente, Impfstatus | **Risiko:** PDF ist unlesbar für die Ärztin → Export wird nie wieder genutzt. → **Layout gegen echte Praxen testen** (siehe §7.2) |
| **9. Rückkehr** | Ärztin fragt „Ist die Meningokokken-Impfung durch?" — er öffnet den Impf-Tab | „Gut, dass ich das nicht auswendig können muss." | 😌 Souverän | Impfstatus in einem Screen, Papier-Scan als Beleg hinterlegt | Dies ist der **Retention-Moment**: die App beweist ihren Wert im entscheidenden Augenblick |

### Emotionaler Verlauf

```
Sorge ──▶ Fokus ──▶ Erleichterung ──▶ Anspannung ──▶ Neugier ──▶ Beruhigung ──▶ Souveränität
  😟        😐           🙂              😟            🤔            😌              💪
  │                                                                                  │
  └── App muss hier UNSICHTBAR schnell sein ───────── App darf hier RUHIG ERKLÄREN ──┘
        (Phase 1–5: Sekunden zählen)                    (Phase 6–9: Verständnis zählt)
```

**Die zentrale Design-Konsequenz:** Die App hat **zwei Betriebsmodi mit gegensätzlichen Anforderungen**. Im Akutfall zählt reine Geschwindigkeit — keine Erklärtexte, keine Onboarding-Hinweise, keine Pflichtfelder. Im Rückschau-Modus zählt Verständlichkeit — hier darf und muss die App Kontext geben. Wer beides in denselben Screen presst, macht beides schlecht.

---

## 3. Feature-Liste mit Priorisierung

**Legende:** 🔴 Must-Have (MVP / v1.0) · 🟡 Should-Have (v1.1–1.3) · 🟢 Could-Have (Backlog) · ⚪️ Won't-Have (bewusst ausgeschlossen)
**Tarif:** `F` = Free · `P` = Pro

### 3.1 Onboarding & Profil

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| P-01 | Kind anlegen (Name, Geburtsdatum, Geschlecht optional) | 🔴 | F | Onboarding in < 60 Sek. abschließbar, ohne Account-Zwang |
| P-02 | Nutzung ohne Registrierung (lokal-only) | 🔴 | F | Voller Funktionsumfang der Free-Version ohne E-Mail-Adresse |
| P-03 | Altersgruppen-Erkennung & Modul-Umschaltung | 🔴 | F | Modulset wird aus Geburtsdatum abgeleitet, manuell übersteuerbar |
| P-04 | Mehrere Kinder + Schnellwechsel im Header | 🔴 | P | Wechsel in 1 Tap; Free zeigt Upgrade-Hinweis ab Kind 2 |
| P-05 | Frühgeborenen-Korrektur (korrigiertes Alter) | 🟡 | F | Perzentilen & Meilensteine nutzen korrigiertes Alter bis 24 Mon. |
| P-06 | Familien-Sharing (2. Elternteil, Schreibrechte) | 🟡 | P | Einladung per Link, Konfliktauflösung bei Parallel-Eingabe |
| P-07 | Geteilter Zugang für Großeltern/Tagesmutter (nur lesen) | 🟢 | P | Rollen: Owner / Editor / Viewer |

### 3.2 Gesundheits-Tracking (Kernmodul)

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| T-01 | Quick-Chips auf dem Dashboard (Fieber, Husten, Schnupfen, Erbrechen, Durchfall, Schlecht geschlafen) | 🔴 | F | Eintrag mit Zeitstempel in **1 Tap**, gemessen p95 < 10 Sek. bis Bestätigung |
| T-02 | Temperatur-Erfassung inkl. Messmethode (Ohr/Stirn/rektal/axillar) | 🔴 | F | Methode wird mitgespeichert, da nicht vergleichbar; Standard merkt sich letzte Wahl |
| T-03 | Symptomkatalog mit Schweregrad 1–3 (leicht/mittel/stark) | 🔴 | F | **Bewusst 3 statt 10 Stufen** — 10 suggeriert eine Präzision, die Eltern nicht leisten können |
| T-04 | Freitext-Notiz + Foto pro Eintrag (Ausschlag!) | 🔴 | F | Foto bleibt lokal verschlüsselt, nie in der Fotomediathek des Geräts |
| T-05 | Krankheits-Episode: Einträge werden automatisch zu einer Episode gebündelt | 🔴 | F | Regel: Einträge ≤ 48 h Abstand = eine Episode; Grenze manuell verschiebbar |
| T-06 | Medikamenten-Log mit Presets (Name, Darreichung, Dosis) | 🔴 | F | Preset einmal anlegen, danach Gabe in 2 Taps |
| T-07 | Sperr-Timer bis zur nächsten möglichen Gabe | 🔴 | F | Mindestabstand wird **vom Nutzer** hinterlegt; App rechnet nur die Uhrzeit, empfiehlt nichts |
| T-08 | Schlafqualität als 3-Stufen-Slider (gut / unruhig / schlecht) | 🔴 | F | Ein Tap, kein Zeitfenster-Tracking im Akutmodus |
| T-09 | Kalenderansicht mit Farbcodierung (gesund / Symptome / Fieber / Medikation) | 🔴 | F | Monat auf einen Blick, Tap öffnet Tagesdetail |
| T-10 | Chronologische Verlaufsliste mit Filter (Kind, Symptom, Zeitraum) | 🔴 | F | Suche über Notizen inklusive |
| T-11 | Eintrag nachträglich rückdatieren | 🔴 | F | „Gestern Abend" in 2 Taps erreichbar |
| T-12 | Home-Screen-Widget (iOS/Android) für Quick-Chips | 🟡 | P | Eintrag ohne App-Start |
| T-13 | Sprach-Eingabe („Ben hat 38,9 Fieber") | 🟡 | P | On-Device-Spracherkennung, **kein** Cloud-Upload von Audio |
| T-14 | Apple Health / Google Health Connect (Lesen von Temperatur/Gewicht) | 🟢 | P | Opt-in, granular pro Datentyp |
| T-15 | Smartwatch-Eingabe | 🟢 | P | — |

### 3.3 Altersgruppen-Module

**0–12 Monate — „Säugling"**

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| A1-01 | Gewicht / Länge / Kopfumfang erfassen | 🔴 | F | Erfassung in < 15 Sek. |
| A1-02 | Perzentilenkurven (WHO 0–24 Mon., danach deutsche Referenz) | 🔴 | P | Kurve + **Klartext-Übersetzung**: „Mila wächst stabil auf ihrer Kurve" |
| A1-03 | Stillen (Dauer, Seite) / Flasche (Menge) | 🔴 | F | Timer mit Pause; Seiten-Merker der letzten Mahlzeit |
| A1-04 | Windel-Log (Urin / Stuhl / beides) | 🔴 | F | 1 Tap |
| A1-05 | Beikost-Tagebuch mit Erstkontakt-Markierung | 🟡 | F | Neues Lebensmittel wird markiert, um Reaktionen rückverfolgbar zu machen |
| A1-06 | Frühe Meilensteine (Lächeln, Kopf heben, Drehen, Sitzen) | 🟡 | F | Checkliste mit typischer Zeitspanne, **ohne** Bewertung „verspätet" |
| A1-07 | Schlafprotokoll mit Tagesbalken | 🟢 | P | — |

**1–3 Jahre — „Kleinkind"**

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| A2-01 | Umschaltung des Dashboards auf Krankheits-Fokus | 🔴 | F | Still-/Windel-Kacheln verschwinden automatisch, bleiben aber zuschaltbar |
| A2-02 | Zahnungs-Tracker | 🟡 | F | Zahnschema antippbar |
| A2-03 | Meilensteine Sprache & Motorik | 🟡 | F | wie A1-06, ohne Bewertung |
| A2-04 | Allergie- & Unverträglichkeitsprofil | 🟡 | F | Erscheint prominent im Arzt-Export |

**3–6 Jahre — „Kindergartenkind"**

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| A3-01 | Kinder-Selbsteinschätzung per Smiley-Skala | 🔴 | F | 5 Gesichter, textfrei, vom Kind selbst bedienbar |
| A3-02 | Kinderkrankheiten-Register (Windpocken, Scharlach, RSV, Hand-Fuß-Mund …) | 🟡 | F | Durchgemachte Erkrankung dauerhaft im Profil |
| A3-03 | Kita-Fehltage-Zähler | 🟡 | P | Summierung pro Kita-Jahr, exportierbar |

**6+ Jahre — „Schulkind"**

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| A4-01 | Kopfschmerz- / Bauchschmerz-Tagebuch mit Kontext (Schultag, Wochenende, Ferien) | 🟡 | F | Kontext wird automatisch aus Datum abgeleitet |
| A4-02 | Verletzungs- & Sportlog | 🟢 | F | — |
| A4-03 | Kinder-Modus: Kind trägt selbst ein, Eltern sehen es | 🟢 | P | Reduzierte, geschützte Oberfläche |

### 3.4 Impfmanager

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| I-01 | Impfungen manuell erfassen (Datum, Impfung, Chargennummer optional) | 🔴 | F | Freie Erfassung ohne Plan-Zwang |
| I-02 | Automatischer Impfplan nach STIKO aus Geburtsdatum | 🔴 | P | Plan wird aus **versionierter, dokumentierter** STIKO-Datei erzeugt (siehe §5.5) |
| I-03 | Statusanzeige je Impfung: erledigt / geplant / bald fällig / fällig / überfällig | 🔴 | P | Schwellen: „bald" = 28 Tage vorher |
| I-04 | Push-Erinnerungen in 3 Stufen | 🔴 | P | Frequenz je Stufe einstellbar, komplett abschaltbar |
| I-05 | U-Untersuchungen U1–U9, U10/U11, J1 als Terminplan | 🔴 | P | Zeitfenster mit Start- und Enddatum, da U-Termine echte Fristen haben |
| I-06 | Quellen-Link zu RKI/STIKO je Impfung | 🔴 | F | Öffnet im In-App-Browser, keine Inhalte gespiegelt |
| I-07 | Foto/Scan des Papier-Impfpasses als Beleg | 🔴 | F | Nur Bildablage, keine Auswertung — bewusst **vor** dem OCR-Feature |
| I-08 | OCR-Erkennung des Impfpasses | 🟡 | P | **Immer** mit Bestätigungs-Screen: jeder erkannte Eintrag muss manuell freigegeben werden |
| I-09 | „Kita-Check": welche Nachweise fehlen für die Betreuungsanmeldung | 🟡 | P | Deskriptive Liste, keine Rechtsberatung; Masernschutzgesetz-Nachweis explizit ausgewiesen |
| I-10 | Reiseimpfungen | 🟢 | P | — |

> **Wichtiger fachlicher Hinweis:** Der STIKO-Kalender ändert sich jährlich (Veröffentlichung im Epidemiologischen Bulletin, i. d. R. im Frühjahr). Der Impfplan darf **niemals** hart im App-Code stehen, sondern muss als versionierter, remote aktualisierbarer Datensatz geliefert werden — inklusive angezeigtem Stand („Basis: STIKO-Empfehlung, Stand JJJJ-MM") und einem redaktionellen Review-Prozess vor jedem Update. Ein veralteter Impfplan ist der gefährlichste denkbare Fehler dieses Produkts.

### 3.5 Analysen & Insights

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| N-01 | Jahresübersicht: Anzahl Infekte, Krankheitstage, Fiebertage | 🔴 | P | Eine Zahl pro Aussage, keine Statistik-Sprache |
| N-02 | Vorjahresvergleich desselben Zeitraums | 🟡 | P | Nur ab 12 Monaten Datenhistorie sichtbar |
| N-03 | Fieber-Verlaufskurve pro Episode | 🔴 | P | Standardansicht im Krankheitsfall |
| N-04 | Symptom-Häufigkeitsranking | 🟡 | P | Top 5 Symptome im gewählten Zeitraum |
| N-05 | Schlaf-vs-Krankheit-Gegenüberstellung | 🟡 | P | **Rein visuelle Gegenüberstellung zweier Zeitreihen** — ausdrücklich ohne Kausalaussage |
| N-06 | Tages-Statuswert („Heute: gut / mittel / krank") | 🟡 | F | Als **Zustandslabel**, nicht als 8/10-Score (siehe Kasten unten) |
| N-07 | Wachstumstrend als Pfeil + Klartext | 🟡 | P | „Stabil auf der Kurve" statt „P42" |
| N-08 | Mustererkennung über mehrere Datenreihen | ⚪️ | — | **Bewusst ausgeschlossen für v1** — siehe unten |

> **Design-Entscheidung gegen den „Gesundheits-Score 8/10":**
> Ein numerischer Score aus Elterneingaben suggeriert eine medizinische Messgröße, die er nicht ist. Zwei Risiken: (a) Eltern könnten einen „7/10"-Wert als Entwarnung lesen und einen Arztbesuch aufschieben; (b) eine berechnete Gesundheitsbewertung rückt das Produkt deutlich näher an die Definition eines Medizinprodukts (§5.7). Wir liefern stattdessen ein beschreibendes Tageslabel und die Rohzahlen. Der Nutzen bleibt, das Risiko fällt weg.
>
> **Und gegen automatische Mustererkennung in v1:** Eine Aussage wie „schlechter Schlaf geht bei Ihrem Kind Infekten voraus" ist eine Korrelationsbehauptung auf n≈20 selbstberichteten Datenpunkten. Sie wäre statistisch nicht haltbar und würde als Vorhersage gelesen. Wir zeigen die Datenreihen nebeneinander und überlassen die Interpretation den Eltern. Frühestens wieder aufgreifen, wenn genug Datenbasis für eine methodisch geprüfte Auswertung besteht.

### 3.6 Export & Arztkommunikation

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| E-01 | Einfacher Listen-Export (CSV / Text) | 🔴 | F | Rohdaten, vollständig |
| E-02 | Arzt-PDF für frei wählbaren Zeitraum | 🔴 | P | **Kernseite passt auf 1 Seite A4**, in 15 Sek. erfassbar |
| E-03 | Vollständiger Datenexport (JSON) zur Mitnahme | 🔴 | F | DSGVO Art. 20 — auch in der Free-Version, ohne Hürde |
| E-04 | Impfstatus als Einzelseite | 🟡 | P | — |
| E-05 | Teilen per Systemdialog (Mail, AirDrop, Druck) | 🟡 | P | Kein App-eigener Versandserver |

### 3.7 System & Vertrauen

| ID | Feature | Prio | Tarif | Akzeptanzkriterium |
|---|---|---|---|---|
| S-01 | Lokal-first: App voll funktionsfähig offline | 🔴 | F | Kein Feature erfordert Netzverbindung außer Sync/Kauf |
| S-02 | Verschlüsselte lokale Datenbank | 🔴 | F | SQLCipher o. ä., Schlüssel in Keychain/Keystore |
| S-03 | Ende-zu-Ende-verschlüsselter Cloud-Sync | 🔴 | P | Server sieht ausschließlich Chiffrat |
| S-04 | Lokales Backup / Wiederherstellung | 🔴 | F | Verschlüsselte Datei, Nutzer wählt Ablageort |
| S-05 | App-Sperre (Biometrie / PIN) | 🟡 | F | — |
| S-06 | Konto & alle Daten löschen (1 Weg, ohne Support-Kontakt) | 🔴 | F | DSGVO Art. 17, in-App, max. 3 Taps |
| S-07 | Dark Mode / Night Mode ab 21 Uhr | 🟡 | F | — |
| S-08 | Barrierefreiheit: Dynamic Type, VoiceOver/TalkBack, Kontrast AA | 🔴 | F | Siehe kritischen Hinweis in §4.0 |
| S-09 | Zweitsprache Englisch | 🟢 | F | Erst nach DACH-Validierung |

### 3.8 Bewusste Nicht-Features (Won't-Have)

| Feature | Warum nicht |
|---|---|
| Symptom-Checker / Verdachtsdiagnose | Klar Medizinprodukt, hohes Haftungs- und Schadensrisiko |
| Dosierungsrechner nach Körpergewicht | Rechenfehler mit unmittelbarer Gesundheitsgefahr für ein Kind |
| „Sollten Sie zum Arzt?"-Empfehlung | Triage = Medizinprodukt, ethisch nicht vertretbar ohne Zulassung |
| Werbung / Datenverkauf / Tracking-SDKs | Gesundheitsdaten von Kindern — nicht verhandelbar |
| Community-Forum | Moderationsaufwand, Fehlinformationsrisiko, kein Kernnutzen |
| Vergleich mit anderen Kindern („Ihr Kind ist kränker als 70 %") | Erzeugt Elternangst ohne medizinischen Wert |

---

## 4. Wireframes (beschreibend)

### 4.0 Design-System

**Farbrollen (Tokens)**

| Token | Hex | Verwendung |
|---|---|---|
| `color.primary` | `#DDC6B6` | Primäre Flächen, aktive Kacheln, Markenpräsenz |
| `color.primary.ink` | `#262223` | Text **auf** Primärfläche |
| `color.secondary` | `#65ABC4` | Akzente, Links, interaktive Elemente, Auswahlzustände |
| `color.bg` | `#D9E4E8` | App-Hintergrund |
| `color.surface` | `#FFFFFF` | Kacheln, Karten, Sheets |
| `color.text` | `#262223` | Haupttext |
| `color.text.secondary` | `#023441` | Sekundärtext, Labels |
| `color.warning` | `#E88C2B` | „Bald fällig", Fieber-Markierung |
| `color.critical` | `#4E0401` | „Überfällig", Fehlerzustände |
| `color.ok` | abgeleitet | Gesunde Tage, erledigte Impfungen |

**Zwei kritische Hinweise zur Farbwahl**

1. **`#DDC6B6` ist keine Interaktionsfarbe.** Auf `#FFFFFF` erreicht die Farbe ein Kontrastverhältnis von etwa 1,4:1 — weit unter dem WCAG-Minimum von 3:1 für UI-Komponenten und 4,5:1 für Text. Ein Primär-Button in dieser Farbe mit weißem Text ist unlesbar; für Nutzer mit Sehschwäche oder bei Sonnenlicht auf dem Spielplatz praktisch unsichtbar. **Konsequenz:** `#DDC6B6` bleibt die *Markenfarbe für Flächen und Ruhezonen*, immer mit dunklem Text `#262223` darauf. Die **Handlungsfarbe** ist `#65ABC4` in einer abgedunkelten Variante (Zielwert ≥ 4,5:1 gegen Weiß) oder `#023441`. Diese Trennung erhält den warmen Markencharakter und macht die App trotzdem bedienbar. Sämtliche Paare sind vor dem Design-Freeze zu messen.
2. **Farbe darf nie alleiniger Informationsträger sein.** Im Kalender bekommen Krankheitstage zusätzlich ein Symbol oder eine Musterung — sonst ist die zentrale Ansicht für rund 8 % der männlichen Nutzer nicht erfassbar.

**Weitere Tokens:** Radius 16 px (Kacheln) / 12 px (Buttons) · Grid 8 pt · Mindest-Tap-Ziel 48 × 48 dp · Schrift: eine humanistische Sans mit hoher Ziffernklarheit, Basisgröße 17 pt, Dynamic Type bis 200 % ohne Layoutbruch.

---

### 4.1 Screen: Dashboard („Heute")

```
┌─────────────────────────────────────────────┐
│  ●  Ben  ▾                            ⚙︎    │  ← Kind-Wechsel (1 Tap)
├─────────────────────────────────────────────┤
│                                             │
│  Dienstag, 15. August                       │
│  Ben, 3 Jahre 2 Monate                      │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  SCHNELLEINTRAG                       │  │  ← Immer oberhalb der Falz.
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │    Chips im Daumenbereich.
│  │  │ 🌡︎   │ │ 😷   │ │ 🤧   │ │  +   │  │  │    Reihenfolge lernt aus
│  │  │Fieber│ │Husten│ │Schnup│ │ mehr │  │  │    der Nutzung.
│  │  └──────┘ └──────┘ └──────┘ └──────┘  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─────────────────┐ ┌─────────────────┐    │
│  │ HEUTE           │ │ NÄCHSTE IMPFUNG │    │
│  │                 │ │                 │    │
│  │   🙂            │ │  Meningokokken C│    │
│  │  Keine Einträge │ │  in 23 Tagen    │    │
│  │                 │ │  ● bald fällig  │    │  ← Statuspunkt in Warnfarbe
│  └─────────────────┘ └─────────────────┘    │
│                                             │
│  ┌─────────────────┐ ┌─────────────────┐    │
│  │ LETZTE KRANKHEIT│ │ DIESES JAHR     │    │
│  │                 │ │                 │    │
│  │  Infekt         │ │  5 Infekte      │    │
│  │  vor 12 Tagen   │ │  14 Kranktage   │    │
│  │  4 Tage lang    │ │  ↗ mehr als 2025│    │
│  └─────────────────┘ └─────────────────┘    │
│                                             │
├─────────────────────────────────────────────┤
│   ▣         ✎         💉         ○          │
│ Übersicht  Tracker  Impfungen  Profil       │
└─────────────────────────────────────────────┘
```

**Verhalten**
* Kacheln sind **Zustandsanzeigen mit Einstieg**, nicht Dekoration — jeder Tap führt in die Detailansicht.
* Der Kachelsatz wechselt mit der Altersgruppe: bei einem Säugling stehen hier „Letzte Mahlzeit", „Windeln heute", „Gewichtstrend".
* Im aktiven Krankheitsfall verwandelt sich die „Heute"-Kachel in eine **Episoden-Kachel** mit Live-Fieberkurve und Medikamenten-Timer und rückt an Position 1.
* **Leerzustand am Tag 1:** Ein einzelner Satz — „Tippe auf Fieber oder Husten, sobald etwas ist. Alles andere kommt von selbst." Keine Tutorial-Karussells.

---

### 4.2 Screen: Schnelleingabe (Bottom Sheet)

```
   ┌─────────────────────────────────────────┐
   │              ────                       │  ← Sheet über dem Dashboard,
   │                                         │    Kontext bleibt sichtbar
   │   ✓ Fieber eingetragen · 20:41          │  ← BEREITS GESPEICHERT.
   │                                         │    Alles Weitere ist Ergänzung.
   │   Temperatur (optional)                 │
   │   ┌─────────────────────────────────┐   │
   │   │        3 8 , 9  °C              │   │  ← Großes Zahlenfeld,
   │   └─────────────────────────────────┘   │    Tastatur direkt offen
   │   Gemessen:  [Ohr]  Stirn  Rektal       │  ← Letzte Wahl vorbelegt
   │                                         │
   │   Weitere Symptome                      │
   │   ( Husten ) ( Schnupfen ) ( Erbrechen )│  ← Mehrfachauswahl
   │   ( Durchfall ) ( Ausschlag ) ( + )     │
   │                                         │
   │   Stärke   ○ leicht  ● mittel  ○ stark  │
   │                                         │
   │   ✎ Notiz          📷 Foto              │
   │   💊 Medikament geben                   │
   │                                         │
   │   ┌─────────────────────────────────┐   │
   │   │          Fertig                 │   │  ← Schließt nur. Speichern
   │   └─────────────────────────────────┘   │    ist bereits passiert.
   └─────────────────────────────────────────┘
```

**Das entscheidende Prinzip:** *Speichern zuerst, verfeinern danach.* Wer das Sheet sofort wegwischt, hat trotzdem einen gültigen Eintrag mit Zeitstempel. Damit ist das 10-Sekunden-Versprechen strukturell eingelöst und nicht bloß eine Absichtserklärung — die häufigste Ursache für Datenlücken (Formular begonnen, abgebrochen, nichts gespeichert) existiert nicht.

**Night Mode:** Ab 21 Uhr gedämpfte Flächen, warme Tönung, keine Animationen, Sheet öffnet ohne Bounce.

---

### 4.3 Screen: Kalenderansicht (Tab „Tracker")

```
┌─────────────────────────────────────────────┐
│  ‹  August 2026  ›            [Monat|Jahr]  │
├─────────────────────────────────────────────┤
│   Mo  Di  Mi  Do  Fr  Sa  So                │
│                    1   2   3                │
│    4   5   6   7   8   9  10                │
│   ▓▲  ▓▲  ▒●  ▒●  ··  ··  ··                │  ← ▓▲ Fieber (orange + Dreieck)
│   11  12  13  14  15  16  17                │    ▒● Symptome (sand + Punkt)
│   ··  ··  ··  ··  ▓▲  ··  ··                │    ·· gesund (neutral)
│   18  19  20  21  22  23  24                │    Muster/Symbol IMMER
│   ··  ··  ··  💉  ··  ··  ··                │    zusätzlich zur Farbe
│                                             │
├─────────────────────────────────────────────┤
│  AUGUST                                     │
│  3 Krankheitstage · 1 Episode · 1 Impfung   │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 4.–7. Aug · Infekt                    │  │
│  │ Fieber bis 39,4 °C · Husten           │  │
│  │ Ibuprofen 4× gegeben              ›   │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ 21. Aug · Impfung                     │  │
│  │ Meningokokken C                   ›   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Als PDF exportieren ]                    │
└─────────────────────────────────────────────┘
```

**Jahresansicht** (Umschalter oben rechts): 12 Monatsstreifen à 28–31 Punkte — das „Krankheitsjahr auf einen Blick". Dies ist der emotionalste Screen der App: Eltern sehen zum ersten Mal die tatsächliche Verteilung statt ihres Gefühls. Darunter drei nüchterne Kennzahlen und, sobald Vorjahresdaten existieren, der Vergleichswert.

---

### 4.4 Screen: Impf-Übersicht

```
┌─────────────────────────────────────────────┐
│  Impfungen — Ben                     [+]    │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐  │
│  │ ⚠ BALD FÄLLIG                         │  │  ← Warnfarbe #E88C2B
│  │ Meningokokken C                       │  │
│  │ Empfohlen ab 12 Monaten               │  │
│  │ [ Termin eintragen ]  [ Erledigt ]    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  NÄCHSTE VORSORGE                           │
│  ┌───────────────────────────────────────┐  │
│  │ U8 · Zeitfenster 46.–48. Lebensmonat  │  │
│  │ 21. Apr – 21. Jun 2027            ›   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ERLEDIGT                              ▾    │
│  ✓ 6-fach (1)      12.08.2023      ⓘ        │
│  ✓ 6-fach (2)      14.10.2023      ⓘ        │  ← ⓘ öffnet RKI-Quelle
│  ✓ Pneumokokken(1) 12.08.2023      ⓘ        │
│  ✓ Rotaviren       03.07.2023      ⓘ        │
│  ✓ MMR (1)         09.06.2024      ⓘ        │
│                                             │
│  OFFEN / SPÄTER                        ▾    │
│  ○ MMR (2)         ab 15. Monat             │
│  ○ Varizellen (2)  ab 15. Monat             │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 📄 Impfpass-Scan hinterlegt       ›   │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Grundlage: STIKO-Empfehlung, Stand 2026-01 │  ← Immer sichtbar
│  Ersetzt keine ärztliche Beratung.          │
└─────────────────────────────────────────────┘
```

**Verhalten**
* **Statusfarben nie allein:** jeder Status trägt zusätzlich Symbol und Textlabel.
* Beim Eintragen einer Impfung wird der Plan neu berechnet und die Folgeimpfung automatisch terminiert.
* Der Fußzeilen-Hinweis mit Datenstand und Beratungs-Disclaimer ist auf **jedem** Screen dieses Tabs fest verankert, nicht nur im Onboarding.
* Die abgebildeten Impfungen und Zeitpunkte sind Platzhalter zur Illustration des Layouts — verbindlich ist ausschließlich der geprüfte Datensatz aus §5.5.

---

### 4.5 Artefakt: Arzt-PDF (Seite 1)

```
┌──────────────────────────────────────────────────┐
│ Ben M. · geb. 12.06.2023 (3 J. 2 Mon.)           │
│ Zeitraum: 15.05.2026 – 15.08.2026                │
│──────────────────────────────────────────────────│
│ ZUSAMMENFASSUNG                                  │
│ 2 Krankheitsepisoden · 9 Krankheitstage          │
│ Max. Temperatur 39,4 °C (06.08.)                 │
│ Allergien: keine bekannt                         │
│──────────────────────────────────────────────────│
│ TEMPERATURVERLAUF                                │
│  40 ┤        ▲                                   │
│  39 ┤   ▲   ╱ ╲    ▲                             │
│  38 ┤  ╱ ╲╱    ╲  ╱ ╲                            │
│  37 ┼─╱──────────╲╱───╲──────────────            │
│     Mai      Jun      Jul      Aug               │
│──────────────────────────────────────────────────│
│ EPISODEN                                         │
│ 02.–05.06.  Fieber, Husten, Schnupfen            │
│             Ibuprofen 3×                         │
│ 04.–08.08.  Fieber bis 39,4, Husten, Erbrechen   │
│             Ibuprofen 4×, Paracetamol 1×         │
│──────────────────────────────────────────────────│
│ IMPFSTATUS   Nach Elternangabe vollständig bis   │
│              MMR(1). Offen: MMR(2), Varizellen(2)│
│──────────────────────────────────────────────────│
│ Von Eltern dokumentierte Angaben. Keine ärztliche│
│ Erhebung. Erstellt mit KinderGesundheit+         │
└──────────────────────────────────────────────────┘
```

Rohdatentabellen folgen ab Seite 2 — Seite 1 bleibt strikt die Verdichtung. Kein Logo im oberen Drittel, keine Farbflächen, druckbar in Graustufen.

---

## 5. Technische Architektur

### 5.1 Leitprinzip: Local-First

Alle Daten leben primär und vollständig auf dem Gerät. Die Cloud ist ausschließlich verschlüsselter Transportweg für Sync und Backup — kein Verarbeitungsort. Das ist gleichzeitig Datenschutzarchitektur, Marketingversprechen und Performance-Garantie: Die App funktioniert im Wartezimmer ohne Empfang und im Keller um 3 Uhr nachts.

```
┌──────────────────── GERÄT ─────────────────────┐
│                                                │
│  UI-Layer  ──▶  Domain-Layer  ──▶  Repository  │
│                 (Regeln, Impf-      │          │
│                  plan, Episoden)    ▼          │
│                            ┌──────────────────┐│
│                            │ Verschlüsselte   ││
│                            │ lokale DB        ││
│                            │ (SQLCipher)      ││
│                            └──────────────────┘│
│                                     │          │
│                            ┌──────────────────┐│
│                            │ Krypto-Modul     ││
│                            │ Key in Keychain/ ││
│                            │ Keystore         ││
│                            └──────────────────┘│
└─────────────────────┬──────────────────────────┘
                      │ nur Chiffrat + Metadaten
                      ▼
┌───────────── BACKEND (EU/Deutschland) ─────────┐
│  Sync-Relay (Blob-Store, kein Klartext)        │
│  Auth · Abo-Verifikation                       │
│  STIKO-Datensatz-Auslieferung (versioniert)    │
│  KEINE Gesundheitsdaten im Klartext, jemals    │
└────────────────────────────────────────────────┘
```

### 5.2 Technologie-Empfehlung

| Ebene | Empfehlung | Begründung |
|---|---|---|
| Client | **Flutter** | Ein Team für iOS + Android; die App ist formular- und diagrammlastig, nicht plattform-API-lastig. Widgets sind der einzige Bereich, der nativ ergänzt werden muss (SwiftUI / Jetpack Glance). |
| Lokale DB | **SQLite + SQLCipher** (via Drift) | Relationale Zeitreihen mit Filtern; ausgereifte Verschlüsselung; Migrationen kontrollierbar |
| State | Riverpod o. ä. | — |
| Backend | **Supabase (EU-Region) oder eigener Dienst auf deutschem Hoster** | Auth + Blob-Storage genügen. Auftragsverarbeitungsvertrag und EU-Datenhaltung sind Auswahlkriterium Nr. 1 |
| Krypto | libsodium / XChaCha20-Poly1305 | Schlüsselableitung aus Nutzer-Passphrase (Argon2id) |
| PDF | On-Device-Rendering | Gesundheitsdaten verlassen für den Export **nie** das Gerät |
| OCR | On-Device (ML Kit / Vision) | Impfpass-Bilder gehen nicht an einen Server |
| Analytics | Nur aggregiert & anonym, EU-gehostet, opt-in | Kein Firebase-Analytics-Reflex, keine Werbe-SDKs |

### 5.3 Datenmodell (Kern)

```
Child          id, name, birthDate, sex?, isPreterm, correctedWeeks?
HealthEntry    id, childId, timestamp, type, note?, photoRef?, episodeId?
Symptom        id, entryId, symptomCode, severity(1-3)
Measurement    id, childId, timestamp, kind(temp|weight|height|headCirc),
               value, unit, method?
Medication     id, childId, timestamp, presetId, doseValue, doseUnit
MedPreset      id, childId, name, form, defaultDose, minIntervalHours  ← Nutzer-gepflegt
Episode        id, childId, startDate, endDate?, label?
Vaccination    id, childId, vaccineCode, date, batch?, source(manual|ocr), proofRef?
ScheduleItem   id, childId, vaccineCode|checkupCode, dueFrom, dueTo, status
FeedingEntry   id, childId, timestamp, kind(breast|bottle|solid), durationSec?,
               amountMl?, side?, foodItem?, isFirstContact
DiaperEntry    id, childId, timestamp, kind
SleepEntry     id, childId, date, quality(1-3)
Milestone      id, childId, milestoneCode, achievedDate?
```

**Konsequente Design-Regeln:**
* Jeder Datensatz trägt `createdAt`, `updatedAt`, `deviceId`, `syncVersion` — Voraussetzung für konfliktfreien Multi-Device-Sync.
* Löschungen sind Tombstones mit Ablauffrist, damit ein Löschvorgang auf allen Geräten ankommt.
* `symptomCode` und `vaccineCode` sind stabile interne Schlüssel, keine Anzeigetexte — Voraussetzung für Übersetzung und Datenmigration.
* Temperatur **ohne** Messmethode ist medizinisch nicht interpretierbar; `method` wird deshalb erfasst.

### 5.4 Sync & Konfliktauflösung

Sync ist ein append-orientiertes Event-Log pro Gerät. Bei konkurrierenden Änderungen desselben Feldes gilt Last-Write-Wins auf Feldebene; Einträge unterschiedlicher Geräte werden nie zusammengeführt, sondern nebeneinander behalten. Für den realistischen Kollisionsfall — beide Eltern tragen dieselbe Fiebermessung ein — greift eine Duplikatserkennung (gleicher Typ, Zeitfenster ≤ 5 Min., gleicher Wert) mit Zusammenführungs-Hinweis in der UI statt stiller Löschung.

### 5.5 STIKO- & U-Untersuchungs-Daten

* Auslieferung als **versionierte JSON-Regelmenge**, remote aktualisierbar, mit App-Fallback für den Offline-Erstlauf.
* Struktur pro Eintrag: `vaccineCode`, Dosisnummer, `dueFromMonths`, `dueToMonths`, Mindestabstand zur Vordosis, Abhängigkeiten, Quell-URL, `sourceVersion`.
* **Redaktioneller Prozess ist Teil des Produkts, nicht der Wartung:** Jede Aktualisierung des Epidemiologischen Bulletins wird fachlich geprüft, gegen Testfälle validiert und mit einem menschlichen Freigabeschritt ausgeliefert. Verantwortlichkeit muss namentlich zugewiesen sein.
* Die App zeigt den Datenstand permanent an. Ist der Datensatz älter als 12 Monate und konnte nicht aktualisiert werden, erscheint ein sichtbarer Hinweis statt stiller Weiterverwendung.
* Perzentilen: **WHO-Standards 0–24 Monate**, danach deutsche Referenzwerte (KiGGS / Kromeyer-Hauschild) — die verwendete Quelle wird in der Kurve benannt.

### 5.6 Datenschutz (DSGVO)

Es handelt sich um **Gesundheitsdaten von Kindern** — die schutzbedürftigste Kategorie überhaupt (Art. 9 DSGVO, besondere Kategorien; Verarbeitung auf Basis ausdrücklicher Einwilligung der Sorgeberechtigten).

| Anforderung | Umsetzung |
|---|---|
| Rechtsgrundlage | Ausdrückliche Einwilligung der Sorgeberechtigten, granular und widerrufbar |
| Datenminimierung | Kein Klarname erforderlich (Spitzname genügt), Geschlecht optional, keine Adresse, keine Versichertennummer |
| Speicherort | EU / Deutschland, AV-Vertrag mit dem Hoster |
| Verschlüsselung | Lokal at-rest, Sync Ende-zu-Ende — Betreiber kann Inhalte technisch nicht lesen |
| Auskunft & Portabilität (Art. 15/20) | JSON-Vollexport in-app, kostenlos, ohne Support-Kontakt |
| Löschung (Art. 17) | In-app in max. 3 Taps, Serverlöschung binnen 30 Tagen, Bestätigung an den Nutzer |
| Kinderdaten | Konten gehören ausschließlich Sorgeberechtigten; Kinder-Modus ist ein UI-Modus, kein eigenes Konto |
| Drittanbieter | Keine Werbenetzwerke, keine Tracking-SDKs, keine Datenweitergabe — vertraglich und technisch |
| Transparenz | Datenschutzhinweis in einfacher Sprache **vor** dem Onboarding, nicht als Link im Fußbereich |
| DSFA | Datenschutz-Folgenabschätzung ist bei dieser Datenkategorie durchzuführen — **vor** dem Launch einzuplanen |

### 5.7 Regulatorische Einordnung — vor der Entwicklung zu klären

**Dies ist das größte nicht-technische Projektrisiko und gehört an den Anfang, nicht ans Ende.**

Nach EU-Medizinprodukteverordnung (MDR 2017/745) kann Software zum Medizinprodukt werden, sobald sie für Diagnose, Prognose, Vorhersage oder Therapieentscheidungen bestimmt ist. Reine Dokumentation und einfache Suche sind unkritisch — Bewertung, Interpretation und Empfehlung sind es nicht.

| Funktion | Einschätzung | Konsequenz |
|---|---|---|
| Dokumentation, Kalender, Export | Unkritisch | Umsetzen wie beschrieben |
| Impfplan aus STIKO-Datum | Grenzbereich | Als **Termin-Erinnerung basierend auf öffentlicher Empfehlung** formulieren, nie als individuelle Empfehlung; Quelle immer sichtbar |
| Perzentilenkurven | Grenzbereich | Kurve darstellen, **nicht** bewerten („zu leicht" ist eine Bewertung, „P25" ist eine Darstellung) |
| Berechneter Gesundheits-Score | Kritisch | **Gestrichen** (§3.5) |
| Mustererkennung / Vorhersage | Kritisch | **Gestrichen für v1** (§3.5) |
| Dosierungsrechner, Triage | Klar Medizinprodukt | **Dauerhaft ausgeschlossen** (§3.8) |

**Handlungsempfehlung:** Vor Beginn der Implementierung eine schriftliche Einschätzung durch eine auf MDR spezialisierte Kanzlei einholen — die Kosten sind gering gegenüber einem Produkt, das nach dem Launch aus dem Store muss. Die Zweckbestimmung ist in AGB, Store-Beschreibung und In-App-Texten **wortgleich** und konsistent zu formulieren; abweichendes Marketing („erkennt Krankheiten früh") kann die Einstufung allein durch die Werbeaussage kippen.

### 5.8 Qualitätsanforderungen

| Bereich | Zielwert |
|---|---|
| Kaltstart bis bedienbares Dashboard | < 1,5 s auf Mittelklassegerät |
| Quick-Chip bis gespeicherter Eintrag | < 300 ms wahrgenommen, p95 Gesamtinteraktion < 10 s |
| Offline | 100 % der Kernfunktionen |
| Datenverlust | Null-Toleranz: Schreibvorgänge transaktional, automatisches lokales Backup täglich |
| Barrierefreiheit | WCAG 2.2 AA, VoiceOver/TalkBack vollständig, Dynamic Type bis 200 % |
| Crash-freie Sessions | > 99,7 % |

---

## 6. Go-to-Market-Strategie

### 6.1 Zielgruppe & Einstiegssegment

* **Beachhead:** Eltern mit Kind zwischen 6 und 24 Monaten in Deutschland — sie haben den akuten Auslöser (Kita-Eingewöhnung, U-Termine, erste Infektwelle) und die längste verbleibende Nutzungsdauer.
* **Sekundär:** Eltern mit mehreren Kindern — höchster Leidensdruck, höchste Zahlungsbereitschaft, direkter Pro-Trigger.
* **Marktgröße:** in Deutschland kommen jährlich in der Größenordnung von 700.000 Kindern zur Welt; kumuliert ergibt das mehrere Millionen Haushalte mit Kindern unter 10 Jahren. Vor der Finanzplanung mit aktuellen Destatis-Zahlen belegen.

### 6.2 Positionierungs-Messaging

| Kanal | Kernbotschaft |
|---|---|
| Store-Titel | „KinderGesundheit+ — Krankheiten, Impfungen, Entwicklung" |
| Hauptclaim | **„Alles über die Gesundheit Ihres Kindes. An einem ruhigen Ort."** |
| Zweitclaim | „In 10 Sekunden eingetragen. Beim Arzttermin sofort zur Hand." |
| Vertrauensclaim | „Ihre Daten bleiben auf Ihrem Gerät. Verschlüsselt. Ohne Werbung." |
| Abgrenzung | „Wächst mit — vom ersten Tag bis zur Grundschule." |

**Bewusst nicht gesagt:** alles, was nach Diagnose, Warnung oder Früherkennung klingt (§5.7).

### 6.3 Kanäle nach Priorität

1. **App Store Optimization** — höchster Hebel im Verhältnis zum Aufwand. Suchbegriffe: „Impfpass digital", „U-Untersuchungen App", „Fieber Tagebuch Kind", „Impferinnerung STIKO". Screenshots zeigen den *Nutzen* (Jahresübersicht, Arzt-PDF), nicht leere Formulare.
2. **Content/SEO auf Deutsch** — die zugkräftigen Suchanfragen sind Informationsfragen: „STIKO Impfkalender", „U8 Zeitfenster", „wie oft ist ein Kita-Kind krank". Sachliche, faktengeprüfte Artikel mit der App als natürlicher Schlussfolgerung. Baut über 6–12 Monate den günstigsten Dauerkanal auf.
3. **Hebammen & Elternkurse** — Hebammen sind die vertrauenswürdigste Empfehlungsinstanz im ersten Lebensjahr. Kein Provisionsmodell, sondern echtes Werkzeug: kostenlose Pro-Codes für Hebammen und Kursleitungen, druckbares Infoblatt für Rückbildungs- und Geburtsvorbereitungskurse.
4. **Kinderarztpraxen** — indirekt über die Qualität des PDF-Exports. Wenn Praxen die Zusammenfassung als hilfreich erleben, entsteht Empfehlung ohne Werbebudget. Ergänzend ein Praxis-Aufsteller für das Wartezimmer.
5. **Elterncommunities** — Kooperationen mit kleineren, glaubwürdigen Eltern-Accounts (5–50 k Follower); Foren und Subreddits ausschließlich mit ehrlicher Selbstoffenlegung.
6. **Bezahlte Werbung** — erst nach nachgewiesener Retention. Vorher verbrennt sie Budget an Nutzern, die nach Tag 3 verschwinden.

### 6.4 Monetarisierung

| | Free | Pro |
|---|---|---|
| Kinder | 1 | unbegrenzt |
| Krankheits- & Symptom-Tracking | ✓ | ✓ |
| Impfungen manuell erfassen | ✓ | ✓ |
| STIKO-Plan & smarte Erinnerungen | — | ✓ |
| U-Untersuchungs-Terminplan | — | ✓ |
| Perzentilenkurven | — | ✓ |
| Analysen & Jahresvergleich | — | ✓ |
| Arzt-PDF | — | ✓ |
| Cloud-Sync & Familien-Sharing | — | ✓ |
| Widgets & Sprach-Eingabe | — | ✓ |
| Datenexport (JSON/CSV) | ✓ | ✓ |

**Preis:** 4,99 €/Monat · 39,99 €/Jahr (−33 %) · Familientarif über Apple/Google Family Sharing.
**Testphase:** 14 Tage Pro ohne Zahlungsdaten — die Kernwerte (Impfplan, Kurven) entfalten sich nicht in 3 Tagen.
**Lifetime-Option prüfen:** 79,99 € einmalig. Diese Zielgruppe hat ein natürliches Nutzungsende (Kind wird groß) und reagiert deshalb überdurchschnittlich skeptisch auf Dauerabos.

**Zwei bewusste Entscheidungen zum Free-Umfang:**
* **Datenexport bleibt kostenlos.** Daten als Geisel zu nehmen wäre bei Gesundheitsdaten von Kindern ein Vertrauensbruch — und DSGVO-rechtlich ohnehin angreifbar.
* **Krankheits-Tracking bleibt vollständig kostenlos.** Es ist der tägliche Gewohnheitsbildner. Wer die Datenerfassung limitiert, verhindert genau die Historie, die später den Pro-Kauf auslöst. Bezahlt wird für *Auswertung, Erinnerung und Komfort* — nicht für das Erfassen.

### 6.5 Launch-Sequenz

| Phase | Zeitraum | Ziel |
|---|---|---|
| **Alpha** | Monat 1–2 nach Dev-Start | 20 Eltern aus dem persönlichen Umfeld, Fokus: Ist die Eingabe wirklich schnell genug? |
| **Closed Beta** | Monat 3–4 | 200 Nutzer über Hebammen-Netzwerk; PDF-Export in 5 echten Praxen testen lassen |
| **Soft Launch** | Monat 5 | Nur Deutschland, ASO + Content, Ziel: D30-Retention messen, kein Werbebudget |
| **Public Launch** | Monat 6–7 | PR an Elternmedien; Aufhänger „Impfpass und U-Heft endlich digital und in Elternhand" |
| **Saisonaler Push** | September/Oktober | Kita-Start und Infektsaison sind der natürliche Nachfragegipfel — dorthin die Marketingmittel |

### 6.6 Erfolgskennzahlen

| Kennzahl | Ziel nach 6 Monaten | Warum diese Zahl |
|---|---|---|
| Onboarding-Abschluss | > 80 % | Misst die Reibung der Ersteinrichtung |
| Aktivierung: ≥ 3 Einträge in Woche 1 | > 45 % | Stärkster erwarteter Prädiktor für Verbleib |
| D30-Retention | > 35 % | Ambitionierter Zielwert für Gesundheits-Apps mit Alltagsbezug |
| **Free → Pro Conversion** | 4–7 % | Realistischer Korridor für Consumer-Abos |
| Arzt-PDF mindestens 1× erzeugt | > 25 % der Pro-Nutzer | **Wichtigster Wertindikator** — wer exportiert, hat den Kernnutzen erlebt |
| Abo-Kündigung im Monat 2 | < 15 % | Deckt zu dünnen Pro-Wert auf |

> Die Zielwerte sind Planungsannahmen, keine Benchmarks aus einer Erhebung. Nach der Beta gegen die eigenen Messwerte kalibrieren.

### 6.7 Wesentliche Risiken

| Risiko | Bewertung | Gegenmaßnahme |
|---|---|---|
| MDR-Einstufung als Medizinprodukt | **Hoch / kritisch** | Rechtsgutachten vor Dev-Start; grenzwertige Features bereits im PRD gestrichen (§5.7) |
| Veralteter STIKO-Datensatz | **Hoch** | Versionierte Remote-Daten, redaktioneller Freigabeprozess, sichtbarer Stand, Warnung bei Überalterung |
| Eingabemüdigkeit nach Woche 3 | Hoch | Speichern-zuerst-Prinzip, Widgets, keine Pflichtfelder, keine Streaks oder Gamification-Druck |
| Konkurrenz durch Krankenkassen-Apps (kostenlos) | Mittel | Klare Differenzierung: kassenunabhängig, werbefrei, wechselbar, Daten in Elternhand |
| Elektronische Patientenakte (ePA) verdrängt Elterndokumentation | Mittel | Die ePA bildet ärztliche Befunde ab, nicht den Alltag zwischen den Terminen — Komplement statt Wettbewerb; Positionierung entsprechend schärfen |
| Zahlungsbereitschaft geringer als angenommen | Mittel | Lifetime-Option testen; Pro-Wert an Erinnerungen und Export knüpfen, nicht an Datenlimits |
| Vertrauensverlust durch Datenpanne | Niedrig / katastrophal | E2E-Verschlüsselung, minimale Serverdaten, externes Sicherheitsaudit vor Public Launch |

---

## 7. Nächste Schritte

### 7.1 Vor Entwicklungsbeginn (Reihenfolge zwingend)

1. **MDR-Rechtsgutachten** einholen — blockierend für den Feature-Umfang.
2. **Kontrastwerte messen** und die Handlungsfarbe festlegen (§4.0) — blockierend für das Design-System.
3. **STIKO-Datensatz** in der beschriebenen Struktur aufbauen und fachlich prüfen lassen; Verantwortlichkeit für die jährliche Pflege benennen.
4. **Datenschutz-Folgenabschätzung** ansetzen.
5. Fünf Eltern beobachten, wie sie heute dokumentieren — vor der ersten Zeile Code.

### 7.2 Validierungsexperimente

* **Der 10-Sekunden-Test:** Fünf Eltern, Stoppuhr, Prototyp, Aufgabe „Fieber eintragen". Wird p95 < 10 s verfehlt, ist der Eingabefluss falsch, nicht die Nutzer.
* **Der Praxis-Test:** Drei Kinderärztinnen bekommen das PDF ohne Erklärung. Frage: „Was sagt Ihnen das über dieses Kind?" Antwortzeit über 30 Sekunden bedeutet, das Layout hat versagt.
* **Der Preis-Test:** Paywall-Screen mit drei Preisvarianten im Soft Launch gegeneinander messen, bevor die Preisliste öffentlich fixiert wird.

### 7.3 Offene Punkte

| Thema | Offen | Wer entscheidet |
|---|---|---|
| Endgültiger Produktname & Markenrecherche | ja | Gründung/Marketing |
| MDR-Einstufung | ja — blockierend | Externe Kanzlei |
| Backend: Supabase EU vs. Eigenbetrieb | ja | Tech Lead |
| Lifetime-Preis ja/nein | ja | nach Soft Launch |
| DACH-Erweiterung (AT/CH haben eigene Impfpläne) | ja | Phase 2 |

---

## 8. Änderungen aus der Marktanalyse (v1.1)

Nach der Wettbewerbsanalyse (siehe [`MARKTANALYSE.md`](MARKTANALYSE.md)) wurden folgende Punkte
gegenüber v1.0 geändert. Sie sind bereits im Prototyp umgesetzt.

| # | Änderung | Auslöser |
|---|---|---|
| 1 | **Fieber-Modul auf Referenzqualität** — Episoden-Ansicht, Verlaufskurve, Medikamenten-Timer und **Fieberkrampf-Dokumentation** sind Must-Have | FeverApp (Uni Witten/Herdecke, BMBF-gefördert) löst genau dieses Szenario bereits sehr gut |
| 2 | **PZN-Scan für Medikamente** als Should-Have aufgenommen | Von FeverApp übernommen; die PZN steht in Deutschland auf jeder Packung |
| 3 | **Vorjahresvergleich auf Must-Have für v1.1 hochgestuft** | Stärkste Differenzierung überhaupt — erfordert 24+ Monate Historie in *einem* Produkt, was Baby-Tracker mit Abbruch nach dem 1. Jahr strukturell nicht liefern können |
| 4 | **Preisversprechen schriftlich fixieren**: Bestandspreise gelten dauerhaft, der Free-Umfang wird nicht nachträglich verschlechtert | Dokumentierter Nutzerfrust nach der Umstellung von Einmalkauf auf Abo bei Baby Connect |
| 5 | **Praxis-Anbindung als Phase-3-Ziel**, nicht als Startversprechen | ImpfPassDE hat eine etablierte, verschlüsselte Datenverbindung zu Arztpraxen — dieser Vorsprung ist kurzfristig nicht einholbar |
| 6 | **Neuer Status „Zeitfenster abgelaufen"** neben „überfällig" | Siehe Kasten unten |
| 7 | **Impfpass-Nachtrag-Hinweis** beim ersten Aufruf ohne erfasste Impfung | Ergab sich beim Test des Prototyps mit einem älteren Kind |

> **Warum „überfällig" nicht für alles taugt:**
> Beim Test des Prototyps mit einem dreijährigen Kind ohne erfasste Impfhistorie meldete der
> Plan 24 Positionen als „überfällig" — darunter die Rotavirus-Schluckimpfung, deren
> Zeitfenster im Säuglingsalter endet. Das ist fachlich irreführend und erzeugt bei Eltern
> Alarm ohne Handlungsmöglichkeit. Positionen, deren Zeitfenster länger als 180 Tage
> zurückliegt, bekommen deshalb den eigenen, ruhigen Status **„Zeitfenster abgelaufen"**,
> erscheinen in einer eingeklappten Liste und nie als Handlungsaufforderung auf dem
> Dashboard — mit dem Hinweis, das in der kinderärztlichen Sprechstunde zu besprechen.

---

## 9. Umsetzungsstand (Prototyp)

Ein lauffähiger Prototyp liegt unter [`../app`](../app). Er setzt die Must-Haves aus §3 um.
Abweichung von §5.2: Der Prototyp ist eine **React-PWA statt einer Flutter-App** — die
Empfehlung Flutter für das native Release bleibt bestehen, aber eine PWA ist der schnellste
Weg, den 10-Sekunden-Test (§7.2) mit echten Eltern zu fahren, ohne App-Store-Review.

**Umgesetzt:** Onboarding ohne Konto · altersadaptives Dashboard · Speichern-zuerst-Schnelleingabe ·
Symptome, Temperatur mit Messmethode, Schweregrad, Notiz, Foto, Fieberkrampf ·
Medikamenten-Presets mit Sperr-Timer · automatische Episoden-Bündelung · Kalender mit Monats-
und Jahresansicht · Impf- und Vorsorgeplan mit fünf Statusstufen · Auswertung mit
Vorjahresvergleich · Perzentilenkurven · Schlaf-/Krankheits-Gegenüberstellung · Meilensteine ·
Arzt-Zusammenfassung, CSV- und JSON-Export · mehrere Kinder · Dark- und Nachtmodus · Offline-Betrieb.

**Nicht umgesetzt** (bewusst, für die Produktivversion): Cloud-Sync mit E2E-Verschlüsselung ·
verschlüsselte lokale Datenbank (der Prototyp speichert unverschlüsselt in IndexedDB) ·
OCR-Impfpass-Scan · PZN-Scan · Sprach-Eingabe · Push-Benachrichtigungen · Homescreen-Widgets ·
Familien-Sharing.

**Nicht produktivtauglich:** Impfplan-, Vorsorge- und Wachstums-Datensätze sind ungeprüfte
Platzhalter (§5.5) und in der App als solche gekennzeichnet.

---

*Dieses Dokument beschreibt eine Anwendung zur Dokumentation durch Eltern. Es beschreibt kein Medizinprodukt und keine medizinische Beratung. Alle im Dokument genannten Impfungen, Zeitpunkte und Marktzahlen sind Platzhalter zur Illustration und vor der Umsetzung gegen die jeweils aktuelle Primärquelle (RKI/STIKO, G-BA, Destatis) zu prüfen. Die regulatorische Einordnung nach §5.7 ist vor Entwicklungsbeginn fachlich zu klären.*
