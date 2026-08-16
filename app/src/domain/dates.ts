import type { ISODate, ISODateTime, Locale } from './types';

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
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toISODate(d);
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / MS_DAY);
}

/** Alter in Monaten, mit Nachkommastellen für die Position auf der Kurve. */
export function ageInMonths(birthDate: ISODate, at: ISODate = todayISO()): number {
  const b = parseDate(birthDate);
  const t = parseDate(at);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  const anchor = new Date(b);
  anchor.setMonth(anchor.getMonth() + months);
  if (anchor > t) {
    months -= 1;
    anchor.setMonth(anchor.getMonth() - 1);
  }
  const next = new Date(anchor);
  next.setMonth(next.getMonth() + 1);
  const fraction =
    (t.getTime() - anchor.getTime()) / Math.max(1, next.getTime() - anchor.getTime());
  return Math.max(0, months + fraction);
}

/** Ein Kind war „1 Tage" alt, solange die Einzahl fehlte. */
function plural(
  n: number,
  locale: Locale,
  de: [string, string],
  en: [string, string],
): string {
  const [one, many] = locale === 'de' ? de : en;
  return `${n} ${n === 1 ? one : many}`;
}

export function formatAge(birthDate: ISODate, locale: Locale, at: ISODate = todayISO()): string {
  const days = daysBetween(birthDate, at);
  if (days < 0) return '';
  if (days < 14) return plural(days, locale, ['Tag', 'Tage'], ['day', 'days']);
  if (days < 60) {
    const w = Math.floor(days / 7);
    return plural(w, locale, ['Woche', 'Wochen'], ['week', 'weeks']);
  }
  const months = Math.floor(ageInMonths(birthDate, at));
  if (months < 24) return plural(months, locale, ['Monat', 'Monate'], ['month', 'months']);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (locale === 'de') {
    return rest === 0 ? plural(years, locale, ['Jahr', 'Jahre'], ['year', 'years'])
      : `${years} J. ${rest} Mon.`;
  }
  return rest === 0
    ? plural(years, locale, ['Jahr', 'Jahre'], ['year', 'years'])
    : `${years} yrs ${rest} mos`;
}

const NAMES = {
  de: {
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    dow: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    months: [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ],
  },
  en: {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dow: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
} as const;

export function weekdayNames(locale: Locale): readonly string[] {
  return NAMES[locale].dow;
}

export function monthName(monthIndex: number, locale: Locale): string {
  return NAMES[locale].months[monthIndex];
}

export function formatDateLong(iso: ISODate, locale: Locale): string {
  const d = parseDate(iso);
  const n = NAMES[locale];
  return locale === 'de'
    ? `${n.days[d.getDay()]}, ${d.getDate()}. ${n.months[d.getMonth()]}`
    : `${n.days[d.getDay()]}, ${n.months[d.getMonth()]} ${d.getDate()}`;
}

export function formatDateShort(iso: ISODate, locale: Locale): string {
  const d = parseDate(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return locale === 'de' ? `${dd}.${mm}.${d.getFullYear()}` : `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatTime(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTimeShort(iso: ISODateTime, locale: Locale): string {
  return `${formatDateShort(dayOf(iso), locale)} ${formatTime(iso)}`;
}

/**
 * Zeitpunkt an einem bestimmten Kalendertag: die aktuelle Uhrzeit, aber an
 * diesem Datum. Für Nachträge aus dem Kalender — der Tag steht fest, die
 * Uhrzeit ist dem Nutzer meist gleichgültig und bleibt änderbar.
 */
export function atOnDay(day: ISODate): ISODateTime {
  const now = new Date();
  const d = parseDate(day);
  d.setHours(now.getHours(), now.getMinutes(), 0, 0);
  return d.toISOString();
}

export function toLocalInputValue(iso: ISODateTime): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(value: string): ISODateTime {
  return new Date(value).toISOString();
}
