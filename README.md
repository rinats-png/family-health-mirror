# family-health-mirror

Konzeptrepository für **„KinderGesundheit+"** — eine App, mit der Eltern Krankheiten,
Impfungen und Entwicklung ihres Kindes von der Geburt bis ins Grundschulalter
dokumentieren.

## Inhalt

| Dokument | Beschreibung |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirement Document v1.0 — Personas, User Journey, priorisierte Feature-Liste, Wireframes, technische Architektur, Go-to-Market |

## Kurzfassung

* **Zielgruppe:** Eltern in Deutschland mit Kindern von 0 bis 10 Jahren
* **Kernidee:** altersgruppen-adaptives Tracking + STIKO-/U-Untersuchungs-Manager + verständliche Auswertungen + Arzt-Export
* **Architekturprinzip:** local-first, Ende-zu-Ende-verschlüsselter Sync, keine Werbung, keine Tracking-SDKs
* **Bewusst ausgeschlossen:** Diagnose, Triage, Dosierungsrechner — die App dokumentiert und stellt dar, sie bewertet nicht

## Vor der Umsetzung zu klären

1. MDR-Einstufung (Medizinprodukt ja/nein) durch eine spezialisierte Kanzlei — blockierend
2. Kontrastwerte des Farbsystems messen und die Handlungsfarbe festlegen — blockierend fürs Design
3. Versionierten STIKO-Datensatz aufbauen und die jährliche Pflege verantwortlich zuweisen
4. Datenschutz-Folgenabschätzung ansetzen

Details siehe [§7 des PRD](docs/PRD.md#7-nächste-schritte).

---

*Konzeptdokumentation. Keine medizinische Beratung.*
