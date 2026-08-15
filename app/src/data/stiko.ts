/**
 * Impfplan-Datensatz.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  ACHTUNG — PLATZHALTER-DATENSATZ                                         │
 * │                                                                          │
 * │  Diese Werte sind eine nach bestem Wissen erstellte Nachbildung der       │
 * │  STIKO-Systematik für den Prototyp. Sie sind NICHT fachlich geprüft und   │
 * │  dürfen NICHT produktiv verwendet werden.                                 │
 * │                                                                          │
 * │  Vor Produktivbetrieb (PRD §5.5):                                        │
 * │   1. Werte gegen das aktuelle Epidemiologische Bulletin des RKI abgleichen│
 * │   2. Fachliche Freigabe durch eine benannte, verantwortliche Person       │
 * │   3. Auslieferung als versionierte Remote-Datei, nicht im App-Bundle      │
 * │   4. `verified: true` erst nach Schritt 2 setzen                          │
 * │                                                                          │
 * │  Ein veralteter oder falscher Impfplan ist der gefährlichste denkbare     │
 * │  Fehler dieses Produkts.                                                  │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

export interface VaccineDose {
  vaccineCode: string;
  label: string;
  doseNumber: number;
  totalDoses: number;
  /** Frühester empfohlener Zeitpunkt in Monaten nach Geburt. */
  dueFromMonths: number;
  /** Oberes Ende des empfohlenen Zeitfensters in Monaten. */
  dueToMonths: number;
  /** Mindestabstand zur Vordosis in Wochen, falls relevant. */
  minIntervalWeeksAfterPrevious?: number;
  note?: string;
  infoUrl: string;
}

export interface VaccineScheduleData {
  /** Version des Datensatzes, wird in der UI angezeigt. */
  version: string;
  /** Bezugsstand der zugrunde liegenden Empfehlung. */
  sourceLabel: string;
  sourceUrl: string;
  /** Erst nach fachlicher Freigabe auf true setzen. */
  verified: boolean;
  doses: VaccineDose[];
}

const RKI = 'https://www.rki.de/DE/Themen/Infektionskrankheiten/Impfen/Impfempfehlungen/impfempfehlungen_node.html';

export const VACCINE_SCHEDULE: VaccineScheduleData = {
  version: '0.1.0-platzhalter',
  sourceLabel: 'Nachbildung der STIKO-Systematik — ungeprüft',
  sourceUrl: RKI,
  verified: false,
  doses: [
    // Rotaviren (Schluckimpfung)
    { vaccineCode: 'rota', label: 'Rotaviren', doseNumber: 1, totalDoses: 2, dueFromMonths: 1.5, dueToMonths: 3, note: 'Schluckimpfung, früher Beginn wichtig', infoUrl: RKI },
    { vaccineCode: 'rota', label: 'Rotaviren', doseNumber: 2, totalDoses: 2, dueFromMonths: 3, dueToMonths: 5, minIntervalWeeksAfterPrevious: 4, note: 'Je nach Impfstoff kann eine 3. Dosis vorgesehen sein', infoUrl: RKI },

    // 6-fach: Tetanus, Diphtherie, Pertussis, Hib, Polio, Hepatitis B
    { vaccineCode: '6fach', label: '6-fach (DTaP-IPV-Hib-HepB)', doseNumber: 1, totalDoses: 3, dueFromMonths: 2, dueToMonths: 3, infoUrl: RKI },
    { vaccineCode: '6fach', label: '6-fach (DTaP-IPV-Hib-HepB)', doseNumber: 2, totalDoses: 3, dueFromMonths: 4, dueToMonths: 5, minIntervalWeeksAfterPrevious: 8, infoUrl: RKI },
    { vaccineCode: '6fach', label: '6-fach (DTaP-IPV-Hib-HepB)', doseNumber: 3, totalDoses: 3, dueFromMonths: 11, dueToMonths: 14, minIntervalWeeksAfterPrevious: 24, note: 'Frühgeborene erhalten ggf. eine zusätzliche Dosis im 3. Monat', infoUrl: RKI },

    // Pneumokokken
    { vaccineCode: 'pneumo', label: 'Pneumokokken', doseNumber: 1, totalDoses: 3, dueFromMonths: 2, dueToMonths: 3, infoUrl: RKI },
    { vaccineCode: 'pneumo', label: 'Pneumokokken', doseNumber: 2, totalDoses: 3, dueFromMonths: 4, dueToMonths: 5, minIntervalWeeksAfterPrevious: 8, infoUrl: RKI },
    { vaccineCode: 'pneumo', label: 'Pneumokokken', doseNumber: 3, totalDoses: 3, dueFromMonths: 11, dueToMonths: 14, minIntervalWeeksAfterPrevious: 24, infoUrl: RKI },

    // Meningokokken B
    { vaccineCode: 'menb', label: 'Meningokokken B', doseNumber: 1, totalDoses: 3, dueFromMonths: 2, dueToMonths: 3, infoUrl: RKI },
    { vaccineCode: 'menb', label: 'Meningokokken B', doseNumber: 2, totalDoses: 3, dueFromMonths: 4, dueToMonths: 5, minIntervalWeeksAfterPrevious: 8, infoUrl: RKI },
    { vaccineCode: 'menb', label: 'Meningokokken B', doseNumber: 3, totalDoses: 3, dueFromMonths: 12, dueToMonths: 15, infoUrl: RKI },

    // Meningokokken C
    { vaccineCode: 'menc', label: 'Meningokokken C', doseNumber: 1, totalDoses: 1, dueFromMonths: 12, dueToMonths: 15, infoUrl: RKI },

    // MMR
    { vaccineCode: 'mmr', label: 'Masern, Mumps, Röteln', doseNumber: 1, totalDoses: 2, dueFromMonths: 11, dueToMonths: 14, note: 'Nachweis nach Masernschutzgesetz für Kita/Schule', infoUrl: RKI },
    { vaccineCode: 'mmr', label: 'Masern, Mumps, Röteln', doseNumber: 2, totalDoses: 2, dueFromMonths: 15, dueToMonths: 23, minIntervalWeeksAfterPrevious: 4, infoUrl: RKI },

    // Varizellen
    { vaccineCode: 'varizellen', label: 'Windpocken (Varizellen)', doseNumber: 1, totalDoses: 2, dueFromMonths: 11, dueToMonths: 14, infoUrl: RKI },
    { vaccineCode: 'varizellen', label: 'Windpocken (Varizellen)', doseNumber: 2, totalDoses: 2, dueFromMonths: 15, dueToMonths: 23, minIntervalWeeksAfterPrevious: 4, infoUrl: RKI },

    // Auffrischungen
    { vaccineCode: 'tdap_boost1', label: 'Auffrischung Tdap-IPV', doseNumber: 1, totalDoses: 1, dueFromMonths: 60, dueToMonths: 84, note: 'Vorschulalter', infoUrl: RKI },
    { vaccineCode: 'tdap_boost2', label: 'Auffrischung Tdap-IPV', doseNumber: 1, totalDoses: 1, dueFromMonths: 108, dueToMonths: 204, note: 'Jugendalter', infoUrl: RKI },

    // HPV
    { vaccineCode: 'hpv', label: 'HPV', doseNumber: 1, totalDoses: 2, dueFromMonths: 108, dueToMonths: 180, note: 'Für alle Geschlechter empfohlen', infoUrl: RKI },
    { vaccineCode: 'hpv', label: 'HPV', doseNumber: 2, totalDoses: 2, dueFromMonths: 113, dueToMonths: 180, minIntervalWeeksAfterPrevious: 20, infoUrl: RKI },
  ],
};

/** Nachweis nach Masernschutzgesetz — relevant für die Kita-Anmeldung. */
export const MEASLES_PROOF_CODES = ['mmr'];
