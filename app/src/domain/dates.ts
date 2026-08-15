import type { ISODate, ISODateTime } from './types';

export const MS_DAY = 86_400_000;

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function nowISO(): ISODateTime {
  return new Date().toISOString();
}

export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Lokaler Kalendertag eines Zeitstempels — nicht UTC, sonst rutschen Nachteinträge. */
export function dayOf(iso: ISODateTime): ISODate {
  return toISODate(new Date(iso));
}

export function parseDate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(iso: ISODate, months: number): ISODate {
  const d = parseDate(iso);
  const targetMonth = d.getMonth() + months;
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(targetMonth);
  // Monatsenden abfangen: 31.01. + 1 Monat ist der 28./29.02., nicht der 03.03.
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toISODate(d);
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / MS_DAY);
}

export function ageInDays(birthDate: ISODate, at: ISODate = todayISO()): number {
  return daysBetween(birthDate, at);
}

export function ageInMonths(birthDate: ISODate, at: ISODate = todayISO()): number {
  const b = parseDate(birthDate);
  const t = parseDate(at);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Korrigiertes Alter für Frühgeborene bis 24 Monate (PRD P-05).
 * Referenz ist die 40. Schwangerschaftswoche.
 */
export function correctedAgeInMonths(
  birthDate: ISODate,
  gestationalWeeks: number | undefined,
  at: ISODate = todayISO(),
): number {
  const raw = ageInMonths(birthDate, at);
  if (!gestationalWeeks || gestationalWeeks >= 37 || raw > 24) return raw;
  const correctionDays = (40 - gestationalWeeks) * 7;
  return Math.max(0, ageInMonths(addDays(birthDate, correctionDays), at));
}

export function formatAge(birthDate: ISODate, at: ISODate = todayISO()): string {
  const days = ageInDays(birthDate, at);
  if (days < 0) return 'noch nicht geboren';
  if (days < 14) return `${days} ${days === 1 ? 'Tag' : 'Tage'}`;
  if (days < 60) return `${Math.floor(days / 7)} Wochen`;
  const months = ageInMonths(birthDate, at);
  if (months < 24) return `${months} Monate`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} Jahre` : `${years} J. ${rest} Mon.`;
}

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function formatDateLong(iso: ISODate): string {
  const d = parseDate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

export function formatDateShort(iso: ISODate): string {
  const d = parseDate(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export function formatDayMonth(iso: ISODate): string {
  const d = parseDate(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex];
}

export function formatTime(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Deutsche Pluralbildung für die wenigen Fälle, die in der UI vorkommen. */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function formatRelativeDays(iso: ISODate): string {
  const diff = daysBetween(iso, todayISO());
  if (diff === 0) return 'heute';
  if (diff === 1) return 'gestern';
  if (diff > 0) return `vor ${diff} Tagen`;
  if (diff === -1) return 'morgen';
  return `in ${-diff} Tagen`;
}

/** Für die datetime-local-Eingabe. */
export function toLocalInputValue(iso: ISODateTime): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(value: string): ISODateTime {
  return new Date(value).toISOString();
}
