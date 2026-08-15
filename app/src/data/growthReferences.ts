import type { Locale, MeasurementKind, Sex } from '../domain/types';

/**
 * Referenzsammlungen für die Perzentilendarstellung (Abschnitt 4.3).
 *
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ACHTUNG — NÄHERUNGSWERTE, NICHT AUSLIEFERBAR                          ║
 * ║                                                                        ║
 * ║  Die hier hinterlegten Zahlen sind an die WHO-Standards angelehnte      ║
 * ║  Näherungswerte für den Prototyp. Sie sind NICHT die amtlichen          ║
 * ║  Tabellen und dürfen nicht produktiv verwendet werden.                  ║
 * ║                                                                        ║
 * ║  Vor Auslieferung: durch die offiziellen LMS-Parameter ersetzen und     ║
 * ║  `verified: true` erst nach fachlicher Prüfung setzen.                  ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 *
 * Regulatorisch entscheidend: Diese Datei liefert ausschließlich Kurvenwerte
 * zur Darstellung. Es gibt hier keine Schwellen, keine Kategorien und keine
 * Formulierungen wie „Normbereich". Die Anwendung zeichnet den eingetragenen
 * Wert ein, beschriftet die Kurven und nennt auf Wunsch den nackten
 * Perzentilwert — nichts darüber hinaus.
 */

export type Percentile = 'p3' | 'p10' | 'p50' | 'p90' | 'p97';

export const PERCENTILES: Percentile[] = ['p3', 'p10', 'p50', 'p90', 'p97'];

export interface CurveSet {
  /** Stützstellen in Monaten ab Geburt. */
  ageMonths: number[];
  p3: number[];
  p10: number[];
  p50: number[];
  p90: number[];
  p97: number[];
}

export type CurveTable = Partial<Record<MeasurementKind, Partial<Record<Sex, CurveSet>>>>;

export interface GrowthReference {
  id: string;
  label: Record<Locale, string>;
  /** Quellenangabe, wird am Diagramm sichtbar genannt. */
  source: string;
  fromMonths: number;
  toMonths: number;
  /** false = Datensatz im Prototyp nicht fachlich geprüft. */
  verified: boolean;
  /** Nur mit Pro auswählbar (Abschnitt 10). */
  proOnly: boolean;
  /**
   * 'free'   — frei nutzbar
   * 'ask'    — Nutzungsbedingungen beim Herausgeber zu klären
   * 'unresolved' — Lizenz ungeklärt, wird nicht ausgeliefert
   */
  license: 'free' | 'ask' | 'unresolved';
  licenseNote?: Record<Locale, string>;
  curves?: CurveTable;
}

const M_0_5 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60];
const M_5_19 = [60, 72, 84, 96, 108, 120, 132, 144, 156, 168, 180, 192, 204, 216, 228];

const WHO_0_5: CurveTable = {
  weight: {
    m: {
      ageMonths: M_0_5,
      p3: [2.5, 3.4, 4.3, 5.0, 5.6, 6.0, 6.4, 6.7, 6.9, 7.1, 7.4, 7.6, 7.7, 8.3, 8.8, 9.2, 9.7, 10.5, 11.3, 12.0, 12.7, 13.4, 14.1],
      p10: [2.8, 3.9, 4.9, 5.6, 6.2, 6.7, 7.1, 7.4, 7.7, 7.9, 8.2, 8.4, 8.6, 9.2, 9.7, 10.2, 10.8, 11.7, 12.6, 13.4, 14.3, 15.1, 16.0],
      p50: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 10.3, 10.9, 11.5, 12.2, 13.3, 14.3, 15.3, 16.3, 17.3, 18.3],
      p90: [3.9, 5.1, 6.3, 7.2, 7.8, 8.4, 8.8, 9.2, 9.6, 9.9, 10.2, 10.5, 10.8, 11.5, 12.2, 12.9, 13.6, 14.8, 16.0, 17.2, 18.3, 19.5, 20.7],
      p97: [4.3, 5.7, 7.0, 7.9, 8.6, 9.2, 9.7, 10.2, 10.5, 10.9, 11.2, 11.5, 11.8, 12.6, 13.3, 14.0, 14.8, 16.1, 17.5, 18.8, 20.2, 21.6, 23.0],
    },
    f: {
      ageMonths: M_0_5,
      p3: [2.4, 3.2, 3.9, 4.6, 5.1, 5.5, 5.8, 6.1, 6.3, 6.6, 6.8, 7.0, 7.1, 7.6, 8.1, 8.6, 9.0, 9.9, 10.8, 11.6, 12.3, 13.0, 13.7],
      p10: [2.7, 3.6, 4.5, 5.1, 5.6, 6.1, 6.4, 6.7, 7.0, 7.3, 7.5, 7.7, 7.9, 8.5, 9.0, 9.6, 10.1, 11.1, 12.1, 13.0, 13.9, 14.8, 15.7],
      p50: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9, 9.6, 10.2, 10.9, 11.5, 12.7, 13.9, 15.0, 16.1, 17.2, 18.2],
      p90: [3.7, 4.8, 5.9, 6.7, 7.3, 7.8, 8.2, 8.6, 9.0, 9.3, 9.6, 9.9, 10.1, 10.9, 11.6, 12.3, 13.0, 14.4, 15.7, 17.0, 18.3, 19.6, 20.8],
      p97: [4.2, 5.5, 6.6, 7.5, 8.2, 8.8, 9.3, 9.8, 10.2, 10.5, 10.9, 11.2, 11.5, 12.4, 13.2, 14.0, 14.8, 16.4, 18.1, 19.6, 21.2, 22.8, 24.4],
    },
  },
  length: {
    m: {
      ageMonths: M_0_5,
      p3: [46.3, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3, 64.8, 66.2, 67.5, 68.7, 69.9, 71.0, 74.1, 77.0, 79.6, 82.0, 86.0, 89.7, 93.1, 96.1, 99.1, 102.0],
      p10: [47.5, 52.2, 55.8, 58.7, 61.1, 63.1, 64.8, 66.3, 67.7, 69.0, 70.3, 71.5, 72.6, 75.9, 78.9, 81.6, 84.1, 88.2, 92.1, 95.6, 98.8, 101.9, 105.0],
      p50: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7, 79.1, 82.3, 85.1, 87.8, 92.1, 96.1, 99.9, 103.3, 106.7, 110.0],
      p90: [52.2, 57.3, 61.0, 64.1, 66.6, 68.7, 70.4, 72.0, 73.5, 74.9, 76.3, 77.6, 78.8, 82.3, 85.7, 88.6, 91.4, 96.0, 100.2, 104.2, 107.9, 111.5, 115.0],
      p97: [53.4, 58.6, 62.4, 65.5, 68.0, 70.1, 71.9, 73.5, 75.0, 76.5, 77.9, 79.2, 80.5, 84.1, 87.7, 90.7, 93.6, 98.3, 102.7, 106.8, 110.7, 114.5, 118.0],
    },
    f: {
      ageMonths: M_0_5,
      p3: [45.6, 49.8, 53.0, 55.6, 57.8, 59.6, 61.2, 62.7, 64.0, 65.3, 66.5, 67.7, 68.9, 72.0, 74.9, 77.5, 80.0, 83.6, 87.4, 90.9, 94.1, 97.1, 99.9],
      p10: [46.8, 51.2, 54.4, 57.1, 59.3, 61.2, 62.7, 64.3, 65.6, 66.9, 68.2, 69.4, 70.6, 73.8, 76.8, 79.5, 82.1, 86.0, 90.0, 93.7, 97.1, 100.4, 103.4],
      p50: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8, 74.0, 77.5, 80.7, 83.7, 86.4, 90.7, 95.1, 99.0, 102.7, 106.2, 109.4],
      p90: [51.5, 56.2, 59.8, 62.5, 64.9, 66.9, 68.6, 70.3, 71.8, 73.2, 74.7, 76.0, 77.3, 81.1, 84.5, 87.7, 90.7, 95.4, 100.1, 104.4, 108.4, 112.2, 115.7],
      p97: [52.7, 57.6, 61.1, 64.0, 66.4, 68.5, 70.3, 71.9, 73.5, 75.0, 76.4, 77.8, 79.2, 83.0, 86.5, 89.8, 93.0, 97.7, 102.7, 107.2, 111.3, 115.3, 119.0],
    },
  },
  headCircumference: {
    m: {
      ageMonths: M_0_5,
      p3: [32.1, 34.9, 36.8, 38.1, 39.2, 40.1, 40.9, 41.5, 42.0, 42.5, 42.9, 43.2, 43.5, 44.2, 44.8, 45.2, 45.6, 46.2, 46.7, 47.1, 47.5, 47.8, 48.1],
      p10: [32.9, 35.7, 37.6, 38.9, 40.0, 40.9, 41.7, 42.3, 42.8, 43.3, 43.7, 44.0, 44.3, 45.1, 45.6, 46.1, 46.4, 47.1, 47.6, 48.0, 48.4, 48.7, 49.0],
      p50: [34.5, 37.3, 39.1, 40.5, 41.6, 42.6, 43.3, 44.0, 44.5, 45.0, 45.4, 45.8, 46.1, 46.9, 47.4, 47.9, 48.3, 49.0, 49.5, 50.0, 50.4, 50.7, 51.0],
      p90: [36.1, 38.9, 40.7, 42.1, 43.2, 44.1, 44.9, 45.5, 46.1, 46.6, 47.0, 47.4, 47.7, 48.5, 49.1, 49.5, 49.9, 50.6, 51.1, 51.6, 52.0, 52.3, 52.6],
      p97: [36.9, 39.7, 41.5, 42.9, 44.0, 44.9, 45.7, 46.4, 46.9, 47.4, 47.8, 48.2, 48.5, 49.3, 49.9, 50.4, 50.8, 51.5, 52.0, 52.5, 52.9, 53.2, 53.5],
    },
    f: {
      ageMonths: M_0_5,
      p3: [31.5, 34.2, 35.8, 37.1, 38.1, 39.0, 39.7, 40.4, 40.9, 41.3, 41.7, 42.0, 42.3, 43.1, 43.6, 44.1, 44.5, 45.2, 45.7, 46.1, 46.5, 46.8, 47.1],
      p10: [32.4, 35.0, 36.7, 38.0, 39.0, 39.9, 40.6, 41.2, 41.7, 42.1, 42.5, 42.9, 43.2, 43.9, 44.5, 44.9, 45.3, 46.0, 46.5, 47.0, 47.3, 47.6, 47.9],
      p50: [33.9, 36.5, 38.3, 39.5, 40.6, 41.5, 42.2, 42.8, 43.4, 43.8, 44.2, 44.6, 44.9, 45.7, 46.2, 46.7, 47.2, 47.9, 48.5, 49.0, 49.3, 49.6, 49.9],
      p90: [35.5, 38.1, 39.8, 41.1, 42.2, 43.1, 43.8, 44.5, 45.0, 45.5, 45.9, 46.3, 46.6, 47.4, 48.0, 48.5, 48.9, 49.7, 50.3, 50.8, 51.2, 51.5, 51.8],
      p97: [36.2, 38.9, 40.7, 42.0, 43.1, 44.0, 44.8, 45.5, 46.0, 46.5, 46.9, 47.2, 47.5, 48.4, 49.0, 49.5, 50.0, 50.8, 51.4, 51.9, 52.3, 52.6, 52.9],
    },
  },
};

const WHO_5_19: CurveTable = {
  weight: {
    m: {
      ageMonths: M_5_19,
      p3: [14.1, 15.5, 17.0, 18.6, 20.4, 22.4, 24.8, 27.6, 30.9, 34.9, 39.1, 43.1, 46.4, 48.7, 50.2],
      p10: [15.6, 17.2, 19.0, 20.9, 23.0, 25.4, 28.2, 31.4, 35.0, 39.2, 43.5, 47.4, 50.5, 52.7, 54.1],
      p50: [18.3, 20.5, 22.9, 25.6, 28.6, 32.1, 36.0, 40.4, 45.3, 50.6, 55.6, 59.8, 62.9, 65.0, 66.3],
      p90: [21.6, 24.6, 28.0, 31.9, 36.3, 41.3, 46.8, 52.6, 58.6, 64.4, 69.5, 73.6, 76.5, 78.4, 79.6],
      p97: [24.0, 27.7, 31.9, 36.8, 42.3, 48.4, 55.0, 61.9, 68.7, 75.0, 80.3, 84.4, 87.2, 89.0, 90.1],
    },
    f: {
      ageMonths: M_5_19,
      p3: [13.7, 15.3, 17.0, 19.0, 21.2, 23.7, 26.5, 29.6, 32.4, 34.6, 36.1, 37.1, 37.7, 38.1, 38.4],
      p10: [15.2, 17.0, 19.0, 21.3, 23.9, 26.8, 30.0, 33.4, 36.4, 38.7, 40.2, 41.1, 41.7, 42.1, 42.4],
      p50: [17.9, 20.2, 22.8, 25.8, 29.2, 33.0, 37.2, 41.5, 45.1, 47.6, 49.2, 50.2, 50.8, 51.2, 51.5],
      p90: [21.4, 24.6, 28.3, 32.5, 37.2, 42.3, 47.6, 52.6, 56.7, 59.6, 61.4, 62.5, 63.2, 63.6, 63.9],
      p97: [24.0, 28.0, 32.6, 37.9, 43.7, 50.0, 56.5, 62.5, 67.3, 70.6, 72.7, 73.9, 74.6, 75.1, 75.4],
    },
  },
  length: {
    m: {
      ageMonths: M_5_19,
      p3: [101.7, 106.9, 111.9, 116.9, 121.7, 126.3, 130.7, 135.4, 141.0, 147.4, 153.4, 157.9, 160.7, 162.3, 163.1],
      p10: [104.8, 110.1, 115.4, 120.6, 125.6, 130.4, 135.2, 140.5, 146.6, 153.4, 159.4, 163.6, 166.2, 167.6, 168.3],
      p50: [110.3, 116.0, 121.7, 127.3, 132.6, 137.8, 143.1, 149.1, 156.0, 163.2, 169.0, 172.9, 175.2, 176.5, 177.0],
      p90: [116.0, 122.0, 128.1, 134.1, 140.0, 146.0, 152.3, 159.2, 166.7, 173.6, 178.9, 182.4, 184.3, 185.4, 185.9],
      p97: [119.2, 125.4, 131.7, 138.0, 144.1, 150.4, 157.1, 164.3, 172.0, 178.7, 183.7, 187.0, 188.8, 189.8, 190.3],
    },
    f: {
      ageMonths: M_5_19,
      p3: [100.7, 105.8, 110.9, 116.1, 121.4, 127.0, 132.6, 137.6, 141.4, 143.7, 144.9, 145.5, 145.9, 146.2, 146.4],
      p10: [103.9, 109.2, 114.5, 120.0, 125.6, 131.4, 137.3, 142.6, 146.5, 148.9, 150.1, 150.7, 151.1, 151.4, 151.6],
      p50: [109.4, 115.1, 120.8, 126.6, 132.5, 138.6, 145.0, 150.5, 154.7, 157.1, 158.4, 159.0, 159.4, 159.7, 159.9],
      p90: [115.0, 121.0, 127.1, 133.3, 139.6, 146.0, 152.6, 158.4, 162.8, 165.3, 166.6, 167.2, 167.6, 167.9, 168.1],
      p97: [118.2, 124.4, 130.7, 137.2, 143.7, 150.4, 157.2, 163.2, 167.8, 170.4, 171.7, 172.4, 172.8, 173.1, 173.3],
    },
  },
};

export const GROWTH_REFERENCES: GrowthReference[] = [
  {
    id: 'who_0_5',
    label: {
      de: 'WHO Child Growth Standards (0–5 J.)',
      en: 'WHO Child Growth Standards (0–5 yrs)',
    },
    source: 'World Health Organization, Child Growth Standards',
    fromMonths: 0,
    toMonths: 60,
    verified: false,
    proOnly: false,
    license: 'free',
    curves: WHO_0_5,
  },
  {
    id: 'who_5_19',
    label: {
      de: 'WHO Growth Reference (5–19 J.)',
      en: 'WHO Growth Reference (5–19 yrs)',
    },
    source: 'World Health Organization, Growth Reference 5–19 years',
    fromMonths: 60,
    toMonths: 228,
    verified: false,
    proOnly: true,
    license: 'free',
    curves: WHO_5_19,
  },
  {
    id: 'cdc_2_20',
    label: { de: 'CDC Growth Charts (2–20 J.)', en: 'CDC Growth Charts (2–20 yrs)' },
    source: 'Centers for Disease Control and Prevention, Growth Charts',
    fromMonths: 24,
    toMonths: 240,
    verified: false,
    proOnly: true,
    license: 'free',
    licenseNote: {
      de: 'Frei nutzbar. Die LMS-Parameter sind im Prototyp noch nicht hinterlegt.',
      en: 'Free to use. The LMS parameters are not yet included in this prototype.',
    },
  },
  {
    id: 'kiggs',
    label: { de: 'KiGGS-Referenzperzentile (RKI)', en: 'KiGGS reference percentiles (RKI)' },
    source: 'Robert Koch-Institut, KiGGS',
    fromMonths: 0,
    toMonths: 204,
    verified: false,
    proOnly: true,
    license: 'ask',
    licenseNote: {
      de: 'Nutzungsbedingungen beim Robert Koch-Institut zu erfragen. Bis dahin nicht hinterlegt.',
      en: 'Terms of use to be requested from the Robert Koch Institute. Not included until then.',
    },
  },
  {
    id: 'kromeyer_hauschild',
    label: {
      de: 'Kromeyer-Hauschild (2001)',
      en: 'Kromeyer-Hauschild (2001)',
    },
    source: 'Monatsschrift Kinderheilkunde 149, Springer',
    fromMonths: 0,
    toMonths: 216,
    verified: false,
    proOnly: true,
    license: 'unresolved',
    licenseNote: {
      de: 'Die LMS-Parameter sind nicht gemeinfrei. Ohne geklärte Lizenz wird dieser Datensatz nicht ausgeliefert.',
      en: 'The LMS parameters are not in the public domain. Without a resolved licence this dataset is not shipped.',
    },
  },
];

export const DEFAULT_REFERENCE_ID = 'who_0_5';

export function referenceById(id: string): GrowthReference {
  return GROWTH_REFERENCES.find((r) => r.id === id) ?? GROWTH_REFERENCES[0];
}

/** Ein Datensatz ist nur nutzbar, wenn Kurven hinterlegt und lizenziert sind. */
export function isReferenceUsable(ref: GrowthReference): boolean {
  return ref.license !== 'unresolved' && !!ref.curves;
}

export function curveFor(
  ref: GrowthReference,
  kind: MeasurementKind,
  sex: Sex | undefined,
): CurveSet | undefined {
  const byKind = ref.curves?.[kind];
  if (!byKind) return undefined;
  if (sex === 'm' || sex === 'f') return byKind[sex];
  // Ohne Angabe im Profil wird keine geschlechtsspezifische Kurve gewählt.
  return undefined;
}
