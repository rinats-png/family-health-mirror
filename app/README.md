# KinderGesundheit+ — Prototyp

Lauffähiger Prototyp zum [PRD](../docs/PRD.md). Local-first PWA, React + TypeScript + Vite,
ohne Laufzeit-Abhängigkeiten außer React.

```bash
npm install
npm run dev      # Entwicklungsserver
npm run build    # Typecheck + Produktions-Build nach dist/
npm run preview  # Produktions-Build lokal ansehen
```

Auf dem Handy im selben Netz: `npm run dev -- --host`, dann die angezeigte Adresse öffnen und
„Zum Startbildschirm hinzufügen" wählen — die App läuft dann im Standalone-Modus und offline.

## Warum PWA und nicht Flutter

Das PRD empfiehlt Flutter für das native Release; diese Empfehlung steht weiter. Für den
Prototyp ist eine PWA der schnellere Weg zum wichtigsten Validierungsschritt: den
10-Sekunden-Test mit echten Eltern durchführen, ohne App-Store-Review, per Link teilbar,
auf iOS und Android gleichzeitig.

## Architektur

```
src/
  data/          Fachdatensätze — Impfplan, U-Untersuchungen, Wachstumsreferenz
                 (allesamt ungeprüfte PLATZHALTER, siehe Kopfkommentare)
  domain/        Fachlogik ohne UI: Typen, Datumsrechnung, Altersgruppen,
                 Episoden-Bündelung, Impfplan-Engine, Auswertung, Export
  db/            Persistenz (IndexedDB + synchroner localStorage-Snapshot)
  store/         React-Context über dem gesamten State
  screens/       Onboarding, Dashboard, Schnelleingabe, Tracker, Impfungen,
                 Auswertung, Profil
  ui/            Sheet und SVG-Diagramme
  styles/        Design-Tokens und globales CSS
```

**Persistenz:** Der gesamte State liegt als ein versioniertes Dokument in IndexedDB. Das hält
die Schicht klein, macht den DSGVO-Vollexport zu einem `JSON.stringify` und ist die Vorstufe
zur Ende-zu-Ende-Verschlüsselung — verschlüsselt würde später genau dieses Dokument.
Zusätzlich wird bei jedem Schreibvorgang ein **synchroner** localStorage-Snapshot abgelegt:
Ein `pagehide`-Handler kann keine asynchrone IndexedDB-Transaktion mehr abschließen, der
letzte Eintrag ginge sonst beim Schließen verloren. Beim Laden gewinnt der jüngere Stand.

## Was im Prototyp bewusst anders ist als in der Vorlage

* **`#DDC6B6` ist keine Interaktionsfarbe.** Auf Weiß liegt der Kontrast bei etwa 1,4:1 — WCAG
  fordert 3:1 für Bedienelemente. Die Farbe bleibt Flächen- und Markenfarbe mit dunklem Text;
  die Handlungsfarbe ist ein abgedunkeltes Derivat von `#65ABC4` (`--action: #16657E`).
* **Kein numerischer Gesundheits-Score.** Ein „7/10" aus Elterneingaben liest sich wie eine
  medizinische Messgröße. Stattdessen ein beschreibendes Tageslabel plus Rohzahlen.
* **Keine automatische Mustererkennung.** Schlaf und Krankheitstage werden als zwei
  Zeitreihen nebeneinander gezeigt, ohne Zusammenhangs-Aussage.
* **„Zeitfenster abgelaufen" statt „überfällig"** für Impfungen, deren Zeitfenster mehr als
  180 Tage zurückliegt — sonst meldet die App einem Dreijährigen die Rotavirus-Schluckimpfung
  als überfällig.

## Grenzen

* Impfplan, U-Untersuchungen und Wachstumskurven sind **ungeprüfte Platzhalter**. Vor jeder
  echten Nutzung gegen RKI/STIKO, G-BA und die WHO-Originaltabellen ersetzen und fachlich
  freigeben lassen.
* Die lokale Datenbank ist **nicht verschlüsselt**. Für die Produktivversion ist
  SQLite/SQLCipher vorgesehen.
* Kein Sync, keine Push-Benachrichtigungen, kein OCR.
* Diese App ist kein Medizinprodukt. Sie dokumentiert und stellt dar; sie diagnostiziert
  nicht, bewertet nicht und gibt keine Behandlungs- oder Dosierungsempfehlungen.
