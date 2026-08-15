import type { Locale } from '../domain/types';

/**
 * Mitgelieferte Schnelleintrags-Kacheln (Aufgabenstellung Abschnitt 4.2).
 *
 * Die Farben stammen aus einer neutralen Palette und tragen keine Bedeutung:
 * Sie unterscheiden Kategorien voneinander, mehr nicht. Warnfarben —
 * `#E88C2B` und dunkle Rottöne — sind hier bewusst nicht enthalten, weil sie
 * eine Einstufung nahelegen würden (Abschnitt 7).
 */

export interface BuiltInCategory {
  key: string;
  icon: string;
  color: string;
  label: Record<Locale, string>;
  /** Öffnet zusätzlich die Felder für das Medikamentenprotokoll. */
  medication?: boolean;
}

export const CATEGORY_PALETTE = [
  '#65ABC4',
  '#DDC6B6',
  '#8FBF9F',
  '#B49AC7',
  '#7FA8D8',
  '#C7B37E',
  '#96BFB4',
  '#C9A6B8',
  '#A3B18A',
  '#9AA7C7',
];

export const BUILT_IN_CATEGORIES: BuiltInCategory[] = [
  { key: 'fever', icon: '🌡️', color: '#65ABC4', label: { de: 'Fieber', en: 'Fever' } },
  { key: 'cough', icon: '😷', color: '#8FBF9F', label: { de: 'Husten', en: 'Cough' } },
  { key: 'runnyNose', icon: '🤧', color: '#DDC6B6', label: { de: 'Schnupfen', en: 'Runny nose' } },
  { key: 'vomiting', icon: '🤢', color: '#B49AC7', label: { de: 'Erbrechen', en: 'Vomiting' } },
  { key: 'diarrhoea', icon: '💧', color: '#7FA8D8', label: { de: 'Durchfall', en: 'Diarrhoea' } },
  { key: 'rash', icon: '🩹', color: '#C9A6B8', label: { de: 'Hautausschlag', en: 'Rash' } },
  { key: 'pain', icon: '😣', color: '#C7B37E', label: { de: 'Schmerzen', en: 'Pain' } },
  { key: 'restlessSleep', icon: '🌙', color: '#9AA7C7', label: { de: 'Unruhiger Schlaf', en: 'Restless sleep' } },
  {
    key: 'medication',
    icon: '💊',
    color: '#96BFB4',
    label: { de: 'Medikament gegeben', en: 'Medicine given' },
    medication: true,
  },
  { key: 'doctorVisit', icon: '🩺', color: '#A3B18A', label: { de: 'Arztbesuch', en: 'Doctor visit' } },
];

export const BUILT_IN_BY_KEY: Record<string, BuiltInCategory> = Object.fromEntries(
  BUILT_IN_CATEGORIES.map((c) => [c.key, c]),
);

/**
 * Statische, unbewertete Liste gängiger Impfungsbezeichnungen
 * (Aufgabenstellung Abschnitt 4.4).
 *
 * Reine Schreibhilfe für das Namensfeld. Bewusst ohne Altersangaben,
 * Dosisnummern, Reihenfolge oder Bezug zu einer Empfehlung — die Liste sagt
 * nichts darüber aus, was für ein bestimmtes Kind infrage kommt.
 */
export const VACCINE_NAME_SUGGESTIONS = [
  'Diphtherie',
  'FSME',
  'Grippe (Influenza)',
  'Haemophilus influenzae Typ b',
  'Hepatitis A',
  'Hepatitis B',
  'HPV',
  'Keuchhusten (Pertussis)',
  'Masern',
  'Meningokokken B',
  'Meningokokken C',
  'Meningokokken ACWY',
  'Mumps',
  'Pneumokokken',
  'Polio (Kinderlähmung)',
  'Röteln',
  'Rotaviren',
  'Tetanus',
  'Tollwut',
  'Typhus',
  'Varizellen (Windpocken)',
  'COVID-19',
];
