/**
 * Wachstums-Referenzdaten für die Perzentilenkurven.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  ACHTUNG — NÄHERUNGSWERTE                                                │
 * │  Diese Tabellen sind an die WHO-Wachstumsstandards (0–24 Monate)          │
 * │  angelehnte Näherungswerte für den Prototyp. Sie sind NICHT die           │
 * │  amtlichen Tabellen.                                                      │
 * │                                                                          │
 * │  Vor Produktivbetrieb (PRD §5.5): durch die WHO-LMS-Originaltabellen      │
 * │  ersetzen und für Kinder über 24 Monate deutsche Referenzwerte            │
 * │  (KiGGS / Kromeyer-Hauschild) ergänzen. Kopfumfang fehlt hier bewusst —   │
 * │  er wird erfasst, aber ohne Kurve dargestellt.                            │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

export const GROWTH_DATA_VERSION = '0.1.0-naeherung';
export const GROWTH_MAX_MONTHS = 24;

export interface PercentileBand {
  /** Werte je Monat, Index 0 = Geburt bis Index 24 = 24 Monate. */
  p3: number[];
  p50: number[];
  p97: number[];
}

type SexKey = 'm' | 'f';

export const WEIGHT_KG: Record<SexKey, PercentileBand> = {
  m: {
    p3: [2.5, 3.4, 4.3, 5.0, 5.6, 6.1, 6.4, 6.7, 7.0, 7.2, 7.5, 7.7, 7.8, 8.0, 8.2, 8.4, 8.5, 8.7, 8.9, 9.0, 9.2, 9.3, 9.5, 9.6, 9.8],
    p50: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6, 9.9, 10.1, 10.3, 10.5, 10.7, 10.9, 11.1, 11.3, 11.5, 11.6, 11.8, 12.0],
    p97: [4.3, 5.7, 7.0, 7.9, 8.6, 9.2, 9.7, 10.2, 10.5, 10.9, 11.2, 11.5, 11.8, 12.1, 12.4, 12.7, 12.9, 13.2, 13.5, 13.7, 14.0, 14.3, 14.5, 14.8, 15.1],
  },
  f: {
    p3: [2.4, 3.2, 3.9, 4.6, 5.1, 5.5, 5.8, 6.1, 6.3, 6.6, 6.8, 7.0, 7.1, 7.3, 7.5, 7.7, 7.8, 8.0, 8.2, 8.3, 8.5, 8.7, 8.8, 9.0, 9.2],
    p50: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9, 9.2, 9.4, 9.6, 9.8, 10.0, 10.2, 10.4, 10.6, 10.9, 11.1, 11.3, 11.5],
    p97: [4.2, 5.5, 6.6, 7.5, 8.2, 8.8, 9.3, 9.8, 10.2, 10.5, 10.9, 11.2, 11.5, 11.8, 12.1, 12.4, 12.6, 12.9, 13.2, 13.5, 13.7, 14.0, 14.3, 14.6, 14.9],
  },
};

export const HEIGHT_CM: Record<SexKey, PercentileBand> = {
  m: {
    p3: [46.3, 50.8, 54.4, 57.3, 59.7, 61.7, 63.3, 64.8, 66.2, 67.5, 68.7, 69.9, 71.0, 72.1, 73.1, 74.1, 75.0, 76.0, 76.9, 77.7, 78.6, 79.4, 80.2, 81.0, 81.7],
    p50: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7, 76.9, 78.0, 79.1, 80.2, 81.2, 82.3, 83.2, 84.2, 85.1, 86.0, 86.9, 87.8],
    p97: [53.4, 58.6, 62.4, 65.5, 68.0, 70.1, 71.9, 73.5, 75.0, 76.5, 77.9, 79.2, 80.5, 81.8, 83.0, 84.2, 85.4, 86.5, 87.7, 88.8, 89.8, 90.9, 91.9, 92.9, 93.9],
  },
  f: {
    p3: [45.6, 49.8, 53.0, 55.6, 57.8, 59.6, 61.2, 62.7, 64.0, 65.3, 66.5, 67.7, 68.9, 70.0, 71.0, 72.0, 73.0, 74.0, 74.9, 75.8, 76.7, 77.5, 78.4, 79.2, 80.0],
    p50: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8, 74.0, 75.2, 76.4, 77.5, 78.6, 79.7, 80.7, 81.7, 82.7, 83.7, 84.6, 85.5, 86.4],
    p97: [52.7, 57.6, 61.1, 64.0, 66.4, 68.5, 70.3, 71.9, 73.5, 75.0, 76.4, 77.8, 79.2, 80.5, 81.7, 83.0, 84.2, 85.4, 86.5, 87.7, 88.8, 89.9, 90.9, 92.0, 93.0],
  },
};

/** Ohne Geschlechtsangabe wird der Mittelwert beider Tabellen genutzt. */
function blend(band: Record<SexKey, PercentileBand>): PercentileBand {
  const mix = (a: number[], b: number[]) => a.map((v, i) => (v + b[i]) / 2);
  return {
    p3: mix(band.m.p3, band.f.p3),
    p50: mix(band.m.p50, band.f.p50),
    p97: mix(band.m.p97, band.f.p97),
  };
}

export function bandFor(kind: 'weight' | 'height', sex?: string): PercentileBand {
  const table = kind === 'weight' ? WEIGHT_KG : HEIGHT_CM;
  if (sex === 'm' || sex === 'f') return table[sex];
  return blend(table);
}
