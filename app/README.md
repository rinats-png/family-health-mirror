# Kinder-Gesundheitstagebuch — Implementierung

Lauffähige Anwendung zur Aufgabenstellung. Local-first, React + TypeScript + Vite,
ohne Laufzeit-Abhängigkeiten außer React.

**Vor jeder Änderung an dieser App: [`../REGULATORY.md`](../REGULATORY.md) lesen.**

```bash
npm install
npm run dev             # Entwicklungsserver
npm run build           # Typprüfung und Produktions-Build nach dist/
npm run preview         # Produktions-Build lokal ansehen
npm run check:wording   # Wortliste (Abschnitt 5) gegen alle Texte prüfen
npm run lint
```

Auf dem Handy im selben Netz: `npm run dev -- --host`, dann die angezeigte Adresse
öffnen und „Zum Startbildschirm hinzufügen" wählen — die App läuft dann im
Standalone-Modus und offline.

## Abweichung von Abschnitt 8: PWA statt React Native/Flutter

Die Aufgabenstellung nennt React Native oder Flutter als **Stack-Vorschlag**.
Umgesetzt ist eine PWA. Grund: In dieser Umgebung ist weder ein Flutter-SDK noch
eine native Build-Kette vorhanden; ein nicht baubares, nicht testbares Gerüst wäre
weniger wert als eine Anwendung, die tatsächlich läuft und deren Verhalten
überprüfbar ist.

Der Fachcode ist bewusst so geschnitten, dass die Portierung geradeaus geht: Alles
unter `src/domain` und `src/data` ist reines TypeScript ohne DOM-Bezug und lässt
sich unverändert in eine React-Native-App übernehmen. Zu ersetzen wären die
Persistenz (`src/db`), die Bildschirme und der PDF-Weg.

**In der PWA nicht umsetzbar** und deshalb offen für die native Fassung:
Homescreen-Widgets (Abschnitt 6), Biometrie als App-Sperre (hier: Passwort),
Zustellung von Erinnerungen im Hintergrund, SQLCipher.

## Architektur

```
src/
  data/         Kategorien, Impfnamensliste, Referenzkurven (Kurvenwerte)
  domain/       Fachlogik ohne UI: Typen, Datumsrechnung, Einheiten,
                Perzentilrechnung, Export
  db/           Persistenz (IndexedDB) und Verschlüsselung (AES-GCM/PBKDF2)
  i18n/         Sprachschicht DE/EN, alle Oberflächentexte an einem Ort
  screens/      Heute, Eintragsblatt, Verlauf, Messwerte, Impfungen, Profil,
                Export, Sperrbildschirm, Onboarding
  ui/           Bottom-Sheet, Perzentildiagramm
  styles/       Design-Tokens und globales CSS
scripts/
  check-wording.mjs   Durchsetzung der Wortliste aus Abschnitt 5
```

### Persistenz und Verschlüsselung

Der gesamte Zustand liegt als ein versioniertes Dokument in IndexedDB. Kein Server,
kein Konto.

* **Ohne App-Sperre** wird zusätzlich ein *synchroner* localStorage-Schnappschuss
  geschrieben. Ein `pagehide`-Handler kann keine asynchrone IndexedDB-Transaktion
  mehr abschließen; ohne den Schnappschuss ginge der zuletzt getippte Eintrag beim
  Schließen verloren. Beim Laden gewinnt der jüngere Stand.
* **Mit App-Sperre** wird der Zustand mit AES-GCM verschlüsselt, der Schlüssel per
  PBKDF2-SHA-256 (210 000 Runden) aus dem Passwort abgeleitet und nur im
  Arbeitsspeicher gehalten. Der Klartext-Schnappschuss entfällt dann bewusst — er
  würde die Verschlüsselung aushebeln. Preis dafür ist ein Restrisiko von wenigen
  hundert Millisekunden bei hartem Abbruch.

Ohne Passwort sind verschlüsselte Daten nicht wiederherstellbar. Das ist
beabsichtigt.

### Sprachregeln maschinell durchgesetzt

`npm run check:wording` prüft alle Oberflächentexte (`src/i18n`) und die Store-Texte
(`../store`) gegen die verbotenen Begriffe aus Abschnitt 5 — in beiden Sprachen —
und bricht bei einem Treffer mit Exit-Code 1 ab. Gehört in die CI.

Die einzige Ausnahme ist eine Positivliste für die Verneinungen aus der
Zweckbestimmung („stellt keine Diagnosen", „does not assess"). In Markdown werden
nur Zeilen innerhalb von Codeblöcken geprüft, weil der umgebende Fließtext die
verbotenen Begriffe nennen können muss, um sie zu verbieten.

## Was hier bewusst fehlt

Die vollständige Liste steht in [`../REGULATORY.md`](../REGULATORY.md) Abschnitt 3.
Kurz: kein berechneter Wert, keine Einstufung, keine Schwelle, keine Fälligkeit,
keine Dosierungslogik, kein Impfplan, keine Mustererkennung, keine KI.

Die Prüffrage vor jedem neuen Feature lautet: **Erzeugt die Anwendung eine Aussage,
die nicht bereits vom Nutzer eingegeben wurde?** Wenn ja — nicht bauen.

## Bekannte Grenzen des Prototyps

* **Die Referenzkurven sind ungeprüfte Näherungen** (`verified: false`), in der
  Oberfläche als solche gekennzeichnet. Vor Auslieferung durch die amtlichen
  LMS-Parameter ersetzen.
* **Kromeyer-Hauschild** ist wegen ungeklärter Lizenz gesperrt und nicht
  auswählbar. **KiGGS** und **CDC** sind gelistet, aber ohne Kurvenwerte.
* Ohne eingerichtete App-Sperre liegen die Daten unverschlüsselt in IndexedDB.
* Erinnerungen werden in der App geführt, aber nicht im Hintergrund zugestellt.
