import type { Severity, TempMethod } from './types';

export interface SymptomDef {
  code: string;
  label: string;
  icon: string;
  /** Quick-Chip auf dem Dashboard */
  quick?: boolean;
  /** Ab welchem Alter (Monate) sinnvoll anzubieten */
  minMonths?: number;
}

/**
 * Symptomkatalog. `code` ist der stabile Schlüssel, `label` nur Anzeige —
 * Voraussetzung für Übersetzung und Datenmigration (PRD §5.3).
 */
export const SYMPTOMS: SymptomDef[] = [
  { code: 'fever', label: 'Fieber', icon: '🌡️', quick: true },
  { code: 'cough', label: 'Husten', icon: '😷', quick: true },
  { code: 'runny_nose', label: 'Schnupfen', icon: '🤧', quick: true },
  { code: 'bad_sleep', label: 'Schlecht geschlafen', icon: '🌙', quick: true },
  { code: 'vomiting', label: 'Erbrechen', icon: '🤢' },
  { code: 'diarrhea', label: 'Durchfall', icon: '💧' },
  { code: 'rash', label: 'Ausschlag', icon: '🔴' },
  { code: 'sore_throat', label: 'Halsschmerzen', icon: '😖' },
  { code: 'earache', label: 'Ohrenschmerzen', icon: '👂' },
  { code: 'headache', label: 'Kopfschmerzen', icon: '🤕', minMonths: 36 },
  { code: 'stomachache', label: 'Bauchschmerzen', icon: '😣' },
  { code: 'fatigue', label: 'Abgeschlagen', icon: '😴' },
  { code: 'no_appetite', label: 'Kein Appetit', icon: '🍽️' },
  { code: 'teething', label: 'Zahnen', icon: '🦷', minMonths: 3 },
  { code: 'eye_inflammation', label: 'Augenentzündung', icon: '👁️' },
  { code: 'breathing', label: 'Atemgeräusche', icon: '💨' },
];

export const SYMPTOM_BY_CODE: Record<string, SymptomDef> = Object.fromEntries(
  SYMPTOMS.map((s) => [s.code, s]),
);

export function symptomLabel(code: string): string {
  return SYMPTOM_BY_CODE[code]?.label ?? code;
}

export function symptomIcon(code: string): string {
  return SYMPTOM_BY_CODE[code]?.icon ?? '•';
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  1: 'leicht',
  2: 'mittel',
  3: 'stark',
};

export const TEMP_METHODS: { value: TempMethod; label: string }[] = [
  { value: 'ear', label: 'Ohr' },
  { value: 'forehead', label: 'Stirn' },
  { value: 'rectal', label: 'Rektal' },
  { value: 'axillary', label: 'Achsel' },
  { value: 'oral', label: 'Mund' },
];

export function tempMethodLabel(m?: TempMethod): string {
  return TEMP_METHODS.find((t) => t.value === m)?.label ?? '—';
}

/**
 * Schwelle, ab der ein Eintrag als Fiebertag gezählt wird.
 * Bewusst eine reine Zähl-Konvention für die Statistik, keine medizinische
 * Bewertung — die App sagt nie, ob ein Wert bedenklich ist (PRD §0.4).
 */
export const FEVER_THRESHOLD = 38.0;

export interface MilestoneDef {
  code: string;
  label: string;
  /** Typische Spanne in Monaten — dient der Sortierung, nicht der Bewertung. */
  fromMonths: number;
  toMonths: number;
  group: 'motor' | 'social' | 'language';
}

/**
 * Meilensteine ohne Bewertung: Die App zeigt die übliche Spanne an und
 * markiert nichts als „verspätet" (PRD A1-06).
 */
export const MILESTONES: MilestoneDef[] = [
  { code: 'smile', label: 'Erstes soziales Lächeln', fromMonths: 1, toMonths: 3, group: 'social' },
  { code: 'head_up', label: 'Kopf halten in Bauchlage', fromMonths: 2, toMonths: 4, group: 'motor' },
  { code: 'grasp', label: 'Gegenstand greifen', fromMonths: 3, toMonths: 6, group: 'motor' },
  { code: 'roll', label: 'Drehen', fromMonths: 4, toMonths: 7, group: 'motor' },
  { code: 'sit', label: 'Frei sitzen', fromMonths: 6, toMonths: 10, group: 'motor' },
  { code: 'babble', label: 'Silben plappern', fromMonths: 6, toMonths: 10, group: 'language' },
  { code: 'crawl', label: 'Krabbeln', fromMonths: 7, toMonths: 12, group: 'motor' },
  { code: 'stand', label: 'Stehen mit Festhalten', fromMonths: 8, toMonths: 13, group: 'motor' },
  { code: 'first_word', label: 'Erstes Wort', fromMonths: 9, toMonths: 15, group: 'language' },
  { code: 'walk', label: 'Freies Laufen', fromMonths: 11, toMonths: 18, group: 'motor' },
  { code: 'two_words', label: 'Zweiwortsätze', fromMonths: 18, toMonths: 30, group: 'language' },
  { code: 'stairs', label: 'Treppe steigen', fromMonths: 20, toMonths: 36, group: 'motor' },
  { code: 'dry_day', label: 'Tagsüber trocken', fromMonths: 24, toMonths: 48, group: 'motor' },
  { code: 'sentences', label: 'Ganze Sätze', fromMonths: 30, toMonths: 48, group: 'language' },
  { code: 'hop', label: 'Auf einem Bein hüpfen', fromMonths: 42, toMonths: 60, group: 'motor' },
];

export const MOOD_FACES = ['😢', '🙁', '😐', '🙂', '😄'];
