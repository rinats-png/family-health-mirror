# REGULATORY.md — Abgrenzungsdokumentation

**Produkt:** Kinder-Gesundheitstagebuch (Arbeitstitel)
**Dokumentversion:** 1.0
**Datum:** 2026-08-15
**Verantwortlich:** *(vor Veröffentlichung namentlich einzutragen)*
**Status:** Entwurf. Punkt 7 ist vor Marktbereitstellung abzuschließen.

Dieses Dokument ist mitversioniert. **Jede Feature-Änderung ist gegen Abschnitt 3 und 4 zu prüfen, bevor sie umgesetzt wird.** Bei einer Rückfrage einer Behörde ist diese Datei zusammen mit ihrer Git-Historie das zentrale Nachweismittel.

---

## 1. Zweckbestimmung

> Die Anwendung ist ein privates, elternseitig geführtes Tagebuch zur Dokumentation von Beobachtungen, Messwerten und Ereignissen rund um die Gesundheit des eigenen Kindes. Sie dient der geordneten Ablage und der Darstellung selbst eingegebener Informationen sowie deren Zusammenfassung in einem druckbaren Dokument, das Eltern nach eigenem Ermessen einem Arzt vorlegen können.
>
> Die Anwendung trifft keine medizinischen Aussagen, stellt keine Diagnosen, gibt keine Handlungsempfehlungen und bewertet die eingegebenen Daten nicht. Sie ersetzt keine ärztliche Untersuchung, Beratung oder Behandlung.

Diese Formulierung ist **wortgleich** zu verwenden in: In-App-Text, AGB, Datenschutzerklärung, Store-Beschreibung (DE und EN), Website und jeder Antwort an einen Store-Reviewer. Abweichende Werbeaussagen können die Einstufung allein durch die Formulierung verändern.

## 2. Warum die Zweckbestimmung eine Konstruktionsvorgabe ist

Ein Haftungsausschluss über einer bewertenden Funktion schützt regulatorisch nicht. Maßgeblich ist die tatsächliche Funktionalität in Verbindung mit der vom Hersteller angegebenen Zweckbestimmung. Deshalb wurde die Anwendung so gebaut, dass die bewertenden Funktionen **technisch nicht existieren** — nicht so, dass sie existieren und mit einem Hinweis versehen sind.

Das Datenmodell (`app/src/domain/types.ts`) enthält bewusst kein Feld, das eine von der Anwendung erzeugte Einstufung, Fälligkeit, Bewertung oder Ableitung aufnehmen könnte.

## 3. Ausschlussliste — nicht implementiert, nicht im Backlog

| # | Ausgeschlossene Funktion | Umsetzungsstand |
|---|---|---|
| 1 | Von der Anwendung berechneter Gesundheits-Score, Fitness-Index, Ampel- oder Smiley-Gesamtbewertung | Nicht vorhanden. Es gibt keine Tageslage, keinen Status und keine Kennzahl auf irgendeinem Bildschirm. |
| 2 | Trendbewertungen („Zustand verbessert sich", Trendpfeile mit Wertung) | Nicht vorhanden. Keine Trendanzeige, keine Pfeile, kein Vorjahresvergleich. |
| 3 | Korrelations- oder Musterausgaben | Nicht vorhanden. Es gibt keine Gegenüberstellung zweier Datenreihen. |
| 4 | Einordnung von Messwerten in Kategorien („untergewichtig", „auffällig", „im Normbereich") | Nicht vorhanden. Die Messwertansicht zeichnet den Punkt, beschriftet die Kurven (P3/P10/P50/P90/P97) und nennt auf Wunsch den nackten Perzentilwert („P42"). Es gibt kein Wort dazu, was der Wert bedeutet. |
| 5 | Fieber-, Symptom- oder Schwellenwertwarnung | Nicht vorhanden. Es gibt keine Temperaturschwelle im Code. Eingetragene Temperaturen werden gespeichert und angezeigt, nie verglichen, gezählt oder markiert. |
| 6 | Medikamenten-Dosierungslogik jeder Art (Dosisrechner, Mindestabstand-Timer, Höchstmengen-Warnung) | Nicht vorhanden. Das Medikamentenprotokoll besteht aus zwei Freitextfeldern (Präparat, Menge) und einem Zeitstempel. Es gibt keine Wirkstoffdatenbank und keine Berechnung. |
| 7 | Impfplan-Logik (Ableitung fälliger Impfungen, Impflücken, Abgleich mit STIKO/BAG/Impfplan Österreich, Nachholschema) | Nicht vorhanden. Die Impfansicht ist eine manuell geführte Liste plus Fotoablage. Die Namensliste ist eine reine Schreibhilfe ohne Altersangaben, Dosisnummern oder Reihenfolge. |
| 8 | Symptom-Checker, Differentialdiagnose, Krankheitszuordnung | Nicht vorhanden. |
| 9 | Entwicklungs-/Meilenstein-Bewertung | Nicht vorhanden. Es gibt kein Meilenstein-Modul. |
| 10 | KI-/LLM-Funktion, die eingegebene Gesundheitsdaten interpretiert oder kommentiert | Nicht vorhanden. Die Anwendung enthält keinerlei Modellaufruf und hat keine Netzwerkverbindung außer dem Laden ihrer eigenen statischen Dateien. |

### 3.1 Entfernte Vorgängerfunktionen

Eine frühere Fassung dieses Repositorys (siehe `docs/PRD.md`, Git-Historie bis Commit vor dieser Version) enthielt sieben Funktionen aus dieser Liste: Impfplan-Engine mit Fälligkeitsstufen, Vorsorgeterminplan, Medikamenten-Sperr-Timer, berechnetes Tageslabel, Wachstums-Trendpfeile mit Klartextbewertung, eine Fieberschwelle von 38 °C samt daraus abgeleiteter Zählung von „Fiebertagen", automatische Bündelung von Einträgen zu Krankheitsepisoden sowie eine Gegenüberstellung von Schlaf- und Krankheitsdaten. **Alle wurden gelöscht, nicht umformuliert.** Die betroffenen Quelldateien existieren nicht mehr.

### 3.2 Prüffrage bei jedem neuen Feature

> **Erzeugt die Anwendung eine Aussage, die nicht bereits vom Nutzer eingegeben wurde?**
>
> Wenn ja: nicht bauen.

Eine Auszählung dessen, was der Nutzer selbst angelegt hat („17 Einträge im Zeitraum"), ist keine neue Aussage — eine Verdichtung, Gewichtung oder Einordnung dieser Einträge wäre eine.

## 4. Umgesetzter Funktionsumfang

| Bereich | Funktion | Bewertende Anteile |
|---|---|---|
| Profile | Mehrere Kinder, Rufname, Geburtsdatum, optional Foto und Geschlecht | keine. Das Geschlecht dient ausschließlich der Auswahl der Referenzkurve. |
| Tagebuch | Schnelleintragskacheln (umbenennbar, ergänzbar, ausblendbar), Detaileintrag mit Zeitpunkt, Notiz, Temperatur, Foto, Tags | keine. Kein Schweregrad, keine Rückmeldung auf einen eingegebenen Wert. |
| Medikamente | Präparat und Menge als Freitext mit Zeitstempel | keine. Siehe 3/6. |
| Erinnerungen | Nutzer wählt Text und Zeitpunkt | keine. Die Anwendung schlägt keinen Zeitpunkt vor und errechnet keinen. |
| Kalender | Monats- und Jahresansicht, Tage mit Einträgen tragen Punkte in der Farbe der vom Nutzer gewählten Kategorie | keine. Keine Einfärbung nach Art, Menge oder Schwere. |
| Filter/Suche | Zeitraum, Kategorie, Freitext über Notizen und Tags | keine. |
| Messwerte | Gewicht, Länge, Kopfumfang; Darstellung auf wählbarer Referenzkurve; neutraler Perzentilwert | Grenzbereich, siehe 5.1. |
| Impfungen | Manuelle Liste, Fotos des Impfpasses, PDF-Ausgabe | keine. Siehe 3/7. |
| Export | PDF (Rohdatentabellen), JSON, CSV | keine. Siehe 5.2. |

## 5. Einzelbegründungen für die Grenzbereiche

### 5.1 Perzentilendarstellung

**Warum das keine Bewertung ist:** Die Anwendung zeichnet einen vom Nutzer eingegebenen Wert in ein Koordinatensystem, dessen Linien aus einer öffentlich publizierten Bevölkerungsreferenz stammen. Das ist eine Darstellung, keine Aussage über das Kind. Der genannte Perzentilwert ist die Position des Punkts im selben Koordinatensystem, ausgedrückt als Zahl — sprachlich unkommentiert.

**Was konkret unterlassen wird:**
* keine Farbcodierung nach Lage des Punkts; alle Punkte sehen gleich aus,
* keine Zonen-Einfärbung des Diagramms,
* keine Grenzlinien mit besonderer Betonung,
* keine Formulierung wie „im Normbereich", „unterhalb der 3. Perzentile", „bitte abklären",
* keine Verlaufsbewertung über mehrere Punkte hinweg.

**Fester, nicht abschaltbarer Hinweistext am Diagramm:**
> „Referenzkurven dienen der Einordnung im Bevölkerungsvergleich. Die Beurteilung der Entwicklung Ihres Kindes gehört in die Hand Ihrer Kinderärztin oder Ihres Kinderarztes."

Das verwendete Referenzsystem wird pro Diagramm namentlich genannt.

### 5.2 PDF-Export

Der Export enthält ausschließlich Tabellen der Rohdaten in chronologischer Reihenfolge. Es gibt keine Zusammenfassung, keine Kennzahlen, keine Hervorhebung einzelner Werte und keine Sortierung nach Auffälligkeit. Die Kopfzeile jeder Seite lautet:

> „Elterngeführte Dokumentation. Keine ärztliche Bewertung."

Der Export ist kein „Arztbericht" und wird nirgends so genannt.

### 5.3 Kalenderfarben

Die Farbe eines Tages ist die Farbe der Kategorie, die der Nutzer selbst gewählt und selbst benannt hat. Die Palette enthält bewusst weder `#E88C2B` noch dunkle Rottöne — Warnfarben implizieren eine Bewertung. Diese Farben sind ausschließlich UI-Zuständen vorbehalten (Löschbestätigung, Hinweis auf den Prototypstatus).

## 6. Sprachregeln

Die Wortliste aus der Aufgabenstellung ist maschinell durchgesetzt: `npm run check:wording` prüft alle Oberflächen- und Store-Texte in beiden Sprachen gegen verbotene Begriffe und bricht bei einem Treffer ab. Der Lauf gehört in die CI.

Verboten sind unter anderem: Diagnose/diagnosis, Befund/finding, Symptom, Gesundheitsstatus/health status, Score, Normbereich/normal range, auffällig/abnormal, überwachen/monitor, empfohlen/recommended, erkennt/detects, analysiert/analyses, wertet aus/assesses, Therapie/therapy.

**Einzige zugelassene Ausnahme:** die Verneinungen innerhalb der Zweckbestimmung („stellt keine Diagnosen", „bewertet die Einträge nicht", „makes no diagnoses", „does not assess"). Diese sind im Prüfskript als Positivliste hinterlegt.

Die Regeln gelten für App-Texte, Store-Beschreibung, Website, Screenshots und Marketing gleichermaßen. Die Store-Beschreibung wird regulatorisch mitgelesen.

## 7. Offene Punkte vor Marktbereitstellung

| # | Punkt | Status | Verantwortlich |
|---|---|---|---|
| 1 | **Lizenzstatus Kromeyer-Hauschild (2001)**, Monatsschrift Kinderheilkunde, Springer. Die LMS-Parameter sind nicht gemeinfrei. | **Offen.** Der Datensatz ist im Code als `license: 'unresolved'` markiert, in der Oberfläche als „Lizenz ungeklärt — nicht ausgeliefert" gekennzeichnet und **nicht auswählbar**. | — |
| 2 | **KiGGS-Nutzungsbedingungen** beim Robert Koch-Institut erfragen. | **Offen.** Datensatz als `license: 'ask'` markiert, nicht hinterlegt. | — |
| 3 | **WHO- und CDC-Daten** sind frei nutzbar; die im Prototyp hinterlegten Zahlen sind jedoch **ungeprüfte Näherungen** und vor Auslieferung durch die amtlichen LMS-Parameter zu ersetzen. Das Flag `verified: false` steuert einen Warnhinweis in der Oberfläche. | **Offen.** | — |
| 4 | **Store-Kategorie**: „Gesundheit und Fitness" bzw. „Lifestyle", **nicht** „Medizin". | Vorgemerkt. | — |
| 5 | **App-Store-Review**: Zweckbestimmung aus Abschnitt 1 als Antwortbaustein bereithalten. | Vorgemerkt. | — |
| 6 | **Juristische Prüfung** dieser Abgrenzung durch eine auf MDR spezialisierte Kanzlei, mit Bezug auf MDCG 2019-11 Rev. 1 (Juni 2025), Abschnitt zur Qualifizierung von Software. | **Offen — blockierend.** | — |
| 7 | **Datenschutz-Folgenabschätzung** nach Art. 35 DSGVO. | **Offen.** Siehe `docs/DATENSCHUTZ.md`. | — |
| 8 | **Verschlüsselung**: Die Web-Fassung verschlüsselt bei aktivierter App-Sperre mit AES-GCM. Für die native Fassung ist SQLCipher vorgesehen; dann ist die Verschlüsselung nicht mehr optional. | Offen für die native Fassung. | — |

## 8. Zielmärkte

| Markt | Rechtsrahmen | Einschätzung |
|---|---|---|
| EU (DE/AT) | MDR 2017/745, MDCG 2019-11 Rev. 1 | Reine Aufzeichnung und Anzeige ohne Auswertung erfüllt die Zweckbestimmung eines Medizinprodukts nicht. |
| Schweiz | MepV, lehnt sich an die MDR an | Dieselbe Linie. |
| UK | UK MDR 2002 | Dieselbe Grundlinie. |
| USA | FDA General Wellness Policy / Software Functions Guidance | Reine Aufzeichnung ist unproblematisch, solange die Ausschlussliste eingehalten wird. |

Die Einschätzung gilt **nur**, solange Abschnitt 3 eingehalten wird. Eine einzige Funktion aus der Ausschlussliste kann die Einstufung in allen genannten Märkten gleichzeitig ändern.

## 9. Änderungshistorie

| Datum | Version | Änderung |
|---|---|---|
| 2026-08-15 | 1.0 | Erstfassung. Sieben Funktionen aus der Ausschlussliste aus dem Vorgängerstand entfernt (siehe 3.1). Wortlisten-Prüfung eingeführt. Kromeyer-Hauschild wegen ungeklärter Lizenz gesperrt. |
