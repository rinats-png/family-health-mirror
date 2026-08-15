# Datenschutzerklärung — Entwurf

**Kinder-Gesundheitstagebuch** · Stand: 2026-08-15 · Fassung 1.0 (Entwurf)

> **Hinweis an das Team:** Dies ist ein Entwurf und **keine Rechtsberatung**. Vor Veröffentlichung ist er von einer datenschutzrechtlich qualifizierten Person zu prüfen. Alle in eckigen Klammern gesetzten Angaben sind vor Veröffentlichung zu ergänzen. Die Datenschutz-Folgenabschätzung nach Art. 35 DSGVO (siehe Abschnitt 12) ist gesondert durchzuführen.

---

## 1. Kurzfassung

Diese App speichert alles auf Ihrem Gerät. Wir betreiben keinen Server für Ihre Inhalte, wir führen kein Nutzerkonto, wir setzen keine Werbung und keine Analysebausteine ein, und wir geben nichts an Dritte weiter. Wir als Anbieter sehen die Angaben, die Sie eintragen, zu keinem Zeitpunkt.

Wenn Sie die App-Sperre einrichten, werden Ihre Daten auf dem Gerät zusätzlich verschlüsselt abgelegt.

## 2. Verantwortlicher

```
[Firmierung]
[Anschrift]
[E-Mail]
[Telefon]
```

Datenschutzbeauftragte Person: [Name und Kontakt, falls nach Art. 37 DSGVO erforderlich]

## 3. Welche Daten die App verarbeitet

Sämtliche Verarbeitung findet ausschließlich lokal auf Ihrem Gerät statt.

| Kategorie | Inhalt | Von wem eingegeben |
|---|---|---|
| Kinderprofil | Rufname, Geburtsdatum, optional Geschlecht, optional Foto | von Ihnen |
| Tagebucheinträge | Zeitpunkt, gewählte Kategorien, Notiz, gemessene Temperatur, Foto, Tags | von Ihnen |
| Medikamentenprotokoll | Präparatname und Menge als freier Text, Zeitpunkt | von Ihnen |
| Erinnerungen | Text und Zeitpunkt | von Ihnen |
| Messwerte | Gewicht, Körperlänge, Kopfumfang mit Datum | von Ihnen |
| Impfeintragungen | Datum, Bezeichnung, optional Chargennummer, Praxis, Notiz | von Ihnen |
| Fotos des Impfpasses | Bilddateien | von Ihnen |
| Einstellungen | Sprache, Einheiten, Darstellung, gewählte Kurvensammlung | von Ihnen |

Ein Teil dieser Angaben sind **Gesundheitsdaten** im Sinne von Art. 4 Nr. 15 DSGVO und damit besondere Kategorien personenbezogener Daten nach Art. 9 Abs. 1 DSGVO. Sie betreffen zudem Kinder und sind deshalb besonders schutzbedürftig.

## 4. Rechtsgrundlage

Die Verarbeitung erfolgt auf Grundlage Ihrer ausdrücklichen Einwilligung nach **Art. 9 Abs. 2 lit. a DSGVO** in Verbindung mit **Art. 6 Abs. 1 lit. a DSGVO**. Die Einwilligung erteilen Sie als sorgeberechtigte Person für Ihr Kind.

Sie können die Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, indem Sie die Daten in der App löschen oder die App entfernen. Die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt davon unberührt.

## 5. Speicherort und Speicherdauer

Alle Daten liegen im lokalen Speicher Ihres Geräts. Es findet **keine Übertragung an uns oder an Dritte** statt. Wir haben keinen technischen Zugriff darauf.

Die Daten bleiben gespeichert, bis Sie sie löschen. Es gibt keine automatische Löschfrist, weil ein Tagebuch seinen Zweck gerade über die Zeit erfüllt. Sie können jederzeit einzelne Einträge, ein vollständiges Kinderprofil samt aller Anhänge oder sämtliche Daten der App löschen.

## 6. Verschlüsselung

Richten Sie in den Einstellungen die App-Sperre mit einem Passwort ein, werden die Daten mit **AES-GCM** verschlüsselt abgelegt. Der Schlüssel wird über **PBKDF2-SHA-256** aus Ihrem Passwort abgeleitet und ausschließlich im Arbeitsspeicher gehalten.

**Wichtig:** Wir kennen Ihr Passwort nicht und können es nicht zurücksetzen. Verlieren Sie es, sind die Daten nicht wiederherstellbar. Das ist beabsichtigt — nur so schützt die Verschlüsselung tatsächlich.

## 7. Keine Weitergabe, keine Auftragsverarbeitung

* Kein Nutzerkonto, keine Registrierung, keine E-Mail-Adresse.
* Kein Analysedienst, kein Absturzberichts-Dienst mit personenbezogenen Daten.
* Keine Werbenetzwerke, keine Werbe-IDs, keine Tracking-Bausteine Dritter.
* Kein Verkauf und keine Weitergabe von Daten.
* Kein eigener Server für Ihre Inhalte, damit auch keine Auftragsverarbeitung nach Art. 28 DSGVO.

*(Für die native Fassung mit optionaler Sicherung über iCloud bzw. Google Drive: Die Sicherung erfolgt in **Ihr** Konto beim jeweiligen Anbieter und ist Ende-zu-Ende verschlüsselt. Für die Verarbeitung in Ihrem eigenen Konto gilt die Datenschutzerklärung des jeweiligen Anbieters: [Links ergänzen].)*

## 8. Berechtigungen des Geräts

| Berechtigung | Wofür | Erforderlich |
|---|---|---|
| Kamera / Fotomediathek | Foto zu einem Eintrag, Foto des Impfpasses, Profilbild | nein, nur bei Nutzung der Funktion |
| Mitteilungen | Anzeige der von Ihnen selbst gesetzten Erinnerungen | nein |
| Speicher | Export einer PDF-, JSON- oder CSV-Datei | nein, nur beim Export |

Es wird kein Standort, kein Adressbuch und keine Geräte-Kennung abgefragt.

## 9. Ihre Rechte

Da wir keine Daten von Ihnen erhalten, laufen die meisten Betroffenenrechte technisch in der App selbst:

| Recht | Umsetzung |
|---|---|
| Auskunft (Art. 15) | Sie sehen sämtliche gespeicherten Daten in der App. |
| Datenübertragbarkeit (Art. 20) | Vollständiger Export als JSON oder CSV. |
| Berichtigung (Art. 16) | Jeder Eintrag ist bearbeitbar. |
| Löschung (Art. 17) | Einzeln, pro Kind oder vollständig, jeweils in der App und ohne Rückfrage bei uns. |
| Einschränkung (Art. 18), Widerspruch (Art. 21) | Ohne Verarbeitung durch uns gegenstandslos; ansonsten über den Widerruf der Einwilligung. |
| Beschwerde (Art. 77) | Bei der für Sie zuständigen Aufsichtsbehörde. Für uns zuständig: [Behörde ergänzen]. |

Für Fragen erreichen Sie uns unter [E-Mail]. Wir können dabei nicht auf Ihre Daten zugreifen und keine Inhalte wiederherstellen.

## 10. Kinder

Das Konto und die Verantwortung liegen bei der sorgeberechtigten Person. Die App hat keinen eigenen Zugang für Kinder und richtet sich nicht an Kinder als Nutzergruppe.

## 11. Änderungen

Wir passen diese Erklärung an, wenn sich die App ändert. Die jeweils geltende Fassung ist in der App und unter [URL] abrufbar. Wesentliche Änderungen werden in der App angezeigt.

## 12. Interne Vermerke (nicht veröffentlichen)

* **Datenschutz-Folgenabschätzung (Art. 35):** Wegen der Verarbeitung von Gesundheitsdaten von Kindern durchzuführen. Argumentationslinie: Die Verarbeitung findet ausschließlich auf dem Endgerät des Betroffenen statt, ohne Übermittlung, ohne Profilbildung, ohne automatisierte Entscheidungen. Das senkt das Risiko erheblich, ersetzt die Prüfung aber nicht.
* **Verzeichnis von Verarbeitungstätigkeiten (Art. 30):** Für die App selbst mangels eigener Verarbeitung minimal; für Store-Vertrieb, Support-Postfach und Website separat zu führen.
* **Zu ergänzen vor Veröffentlichung:** Firmierung, Anschrift, Aufsichtsbehörde, Support-Adresse, URL der Erklärung, gegebenenfalls Angaben zur Sicherungsfunktion der nativen Fassung.
* **Konsistenz:** Der Abschnitt „Was diese App nicht tut" in den Store-Texten und die Zweckbestimmung in `REGULATORY.md` müssen wortgleich bleiben.
