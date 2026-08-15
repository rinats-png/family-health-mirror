import { ageInMonths, correctedAgeInMonths } from './dates';
import type { Child, ISODate } from './types';

export type AgeGroupId = 'infant' | 'toddler' | 'preschool' | 'school';

export type ModuleId =
  | 'illness'
  | 'feeding'
  | 'diapers'
  | 'growth'
  | 'sleep'
  | 'milestones'
  | 'teeth'
  | 'moodFace'
  | 'schoolComplaints';

export interface AgeGroup {
  id: AgeGroupId;
  label: string;
  fromMonths: number;
  toMonths: number;
  /** Module, die das Dashboard automatisch einblendet (PRD §3.3). */
  modules: ModuleId[];
  focus: string;
}

export const AGE_GROUPS: AgeGroup[] = [
  {
    id: 'infant',
    label: 'Säugling',
    fromMonths: 0,
    toMonths: 12,
    modules: ['feeding', 'diapers', 'growth', 'sleep', 'milestones', 'illness'],
    focus: 'Gewicht, Ernährung, Windeln, frühe Meilensteine',
  },
  {
    id: 'toddler',
    label: 'Kleinkind',
    fromMonths: 12,
    toMonths: 36,
    modules: ['illness', 'sleep', 'growth', 'milestones', 'teeth'],
    focus: 'Krankheitssymptome, Schlaf, Sprache und Motorik',
  },
  {
    id: 'preschool',
    label: 'Kindergartenkind',
    fromMonths: 36,
    toMonths: 72,
    modules: ['illness', 'moodFace', 'sleep', 'growth'],
    focus: 'Infekte, Impfungen, Selbsteinschätzung',
  },
  {
    id: 'school',
    label: 'Schulkind',
    fromMonths: 72,
    toMonths: 216,
    modules: ['illness', 'schoolComplaints', 'growth', 'moodFace'],
    focus: 'Kopf- und Bauchschmerzen, Sport, weitere Impfungen',
  },
];

/**
 * Für die Modulauswahl zählt das korrigierte Alter bei Frühgeborenen —
 * ein in der 30. SSW geborenes Kind ist mit 3 Monaten entwicklungsmäßig
 * kein Kind von 3 Monaten.
 */
export function effectiveAgeMonths(child: Child, at?: ISODate): number {
  return child.isPreterm
    ? correctedAgeInMonths(child.birthDate, child.gestationalWeeks, at)
    : ageInMonths(child.birthDate, at);
}

export function ageGroupOf(child: Child, at?: ISODate): AgeGroup {
  const months = effectiveAgeMonths(child, at);
  return (
    AGE_GROUPS.find((g) => months >= g.fromMonths && months < g.toMonths) ??
    AGE_GROUPS[AGE_GROUPS.length - 1]
  );
}

export function hasModule(child: Child, module: ModuleId, at?: ISODate): boolean {
  return ageGroupOf(child, at).modules.includes(module);
}
