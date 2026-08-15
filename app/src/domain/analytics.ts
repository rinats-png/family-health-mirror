import { FEVER_THRESHOLD, symptomLabel } from './catalog';
import { addDays, dayOf, daysBetween, parseDate, todayISO } from './dates';
import { buildEpisodes, episodeDays } from './episodes';
import type { Episode, HealthEntry, ID, ISODate, SleepEntry } from './types';

export interface PeriodStats {
  from: ISODate;
  to: ISODate;
  episodeCount: number;
  sickDays: number;
  feverDays: number;
  maxTemp?: number;
  topSymptoms: { code: string; label: string; days: number }[];
}

function inRange(day: ISODate, from: ISODate, to: ISODate): boolean {
  return day >= from && day <= to;
}

export function periodStats(
  entries: HealthEntry[],
  childId: ID,
  from: ISODate,
  to: ISODate,
): PeriodStats {
  const episodes = buildEpisodes(entries, childId).filter((ep) =>
    episodeDays(ep).some((d) => inRange(d, from, to)),
  );

  const sick = new Set<ISODate>();
  episodes.forEach((ep) =>
    episodeDays(ep).forEach((d) => {
      if (inRange(d, from, to)) sick.add(d);
    }),
  );

  const mine = entries.filter(
    (e) => e.childId === childId && !e.deleted && inRange(dayOf(e.at), from, to),
  );

  const feverDays = new Set<ISODate>();
  const symptomDays = new Map<string, Set<ISODate>>();
  let maxTemp: number | undefined;

  for (const e of mine) {
    const day = dayOf(e.at);
    if (e.temperature != null) {
      if (maxTemp == null || e.temperature > maxTemp) maxTemp = e.temperature;
      if (e.temperature >= FEVER_THRESHOLD) feverDays.add(day);
    }
    for (const s of e.symptoms) {
      if (s.code === 'fever') feverDays.add(day);
      if (!symptomDays.has(s.code)) symptomDays.set(s.code, new Set());
      symptomDays.get(s.code)!.add(day);
    }
  }

  const topSymptoms = [...symptomDays.entries()]
    .map(([code, days]) => ({ code, label: symptomLabel(code), days: days.size }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5);

  return {
    from,
    to,
    episodeCount: episodes.length,
    sickDays: sick.size,
    feverDays: feverDays.size,
    maxTemp,
    topSymptoms,
  };
}

/**
 * Vergleich mit dem gleichen Zeitraum im Vorjahr (PRD N-02).
 *
 * Das ist die Kernfunktion aus der Marktanalyse: Nur wer eine durchgehende
 * Historie über mehr als ein Jahr hat, kann diese Frage überhaupt beantworten.
 * Die App liefert die beiden Zahlen — die Einordnung machen Eltern und Arzt.
 */
export interface YearComparison {
  current: PeriodStats;
  previous: PeriodStats;
  hasEnoughHistory: boolean;
}

export function compareWithPreviousYear(
  entries: HealthEntry[],
  childId: ID,
  from: ISODate,
  to: ISODate,
): YearComparison {
  const shift = (d: ISODate) => {
    const date = parseDate(d);
    date.setFullYear(date.getFullYear() - 1);
    return dayOf(date.toISOString());
  };
  const previous = periodStats(entries, childId, shift(from), shift(to));
  const first = entries
    .filter((e) => e.childId === childId && !e.deleted)
    .map((e) => dayOf(e.at))
    .sort()[0];

  return {
    current: periodStats(entries, childId, from, to),
    previous,
    hasEnoughHistory: !!first && first <= shift(to),
  };
}

export type DayMarker = 'none' | 'symptom' | 'fever' | 'vaccination' | 'checkup';

export interface DayInfo {
  day: ISODate;
  marker: DayMarker;
  entryCount: number;
  maxTemp?: number;
}

/** Tagesraster für die Kalenderansicht (PRD T-09). */
export function dayMap(
  entries: HealthEntry[],
  childId: ID,
  from: ISODate,
  to: ISODate,
): Map<ISODate, DayInfo> {
  const map = new Map<ISODate, DayInfo>();
  const episodes = buildEpisodes(entries, childId);

  for (const ep of episodes) {
    for (const d of episodeDays(ep)) {
      if (!inRange(d, from, to)) continue;
      map.set(d, { day: d, marker: 'symptom', entryCount: 0 });
    }
  }

  for (const e of entries) {
    if (e.childId !== childId || e.deleted) continue;
    const day = dayOf(e.at);
    if (!inRange(day, from, to)) continue;
    const info = map.get(day) ?? { day, marker: 'none' as DayMarker, entryCount: 0 };
    info.entryCount += 1;
    const feverish =
      (e.temperature != null && e.temperature >= FEVER_THRESHOLD) ||
      e.symptoms.some((s) => s.code === 'fever');
    if (e.temperature != null && (info.maxTemp == null || e.temperature > info.maxTemp)) {
      info.maxTemp = e.temperature;
    }
    if (feverish) info.marker = 'fever';
    else if (info.marker === 'none') info.marker = 'symptom';
    map.set(day, info);
  }

  return map;
}

/** Temperaturpunkte einer Episode für die Verlaufskurve (PRD N-03). */
export function episodeTemperatures(
  entries: HealthEntry[],
  episode: Episode,
): { at: string; value: number }[] {
  const ids = new Set(episode.entryIds);
  return entries
    .filter((e) => ids.has(e.id) && e.temperature != null)
    .map((e) => ({ at: e.at, value: e.temperature! }))
    .sort((a, b) => a.at.localeCompare(b.at));
}

/**
 * Schlaf und Krankheit als zwei Zeitreihen nebeneinander (PRD N-05).
 * Ausdrücklich ohne Korrelations- oder Kausalaussage.
 */
export function sleepVsIllness(
  entries: HealthEntry[],
  sleep: SleepEntry[],
  childId: ID,
  days = 60,
): { day: ISODate; sleepQuality?: number; sick: boolean }[] {
  const to = todayISO();
  const from = addDays(to, -days);
  const marks = dayMap(entries, childId, from, to);
  const sleepBy = new Map(
    sleep.filter((s) => s.childId === childId && !s.deleted).map((s) => [s.date, s.quality]),
  );
  const out: { day: ISODate; sleepQuality?: number; sick: boolean }[] = [];
  for (let i = 0; i <= days; i++) {
    const day = addDays(from, i);
    const info = marks.get(day);
    out.push({
      day,
      sleepQuality: sleepBy.get(day),
      sick: !!info && info.marker !== 'none',
    });
  }
  return out;
}

/** Tageslabel statt numerischem Score — bewusste Entscheidung aus PRD §3.5. */
export function todayLabel(entries: HealthEntry[], childId: ID): {
  label: string;
  tone: 'ok' | 'watch' | 'ill';
  detail: string;
} {
  const today = todayISO();
  const mine = entries.filter(
    (e) => e.childId === childId && !e.deleted && dayOf(e.at) === today,
  );
  if (mine.length === 0) {
    return { label: 'Keine Einträge', tone: 'ok', detail: 'Heute noch nichts eingetragen.' };
  }
  const maxTemp = mine.reduce<number | undefined>(
    (acc, e) => (e.temperature != null && (acc == null || e.temperature > acc) ? e.temperature : acc),
    undefined,
  );
  const hasFever =
    (maxTemp != null && maxTemp >= FEVER_THRESHOLD) ||
    mine.some((e) => e.symptoms.some((s) => s.code === 'fever'));
  const codes = [...new Set(mine.flatMap((e) => e.symptoms.map((s) => s.code)))];

  if (hasFever) {
    return {
      label: 'Krank',
      tone: 'ill',
      detail: maxTemp != null ? `Höchste Messung heute: ${maxTemp.toFixed(1)} °C` : 'Fieber eingetragen',
    };
  }
  return {
    label: 'Beobachtung',
    tone: 'watch',
    detail: codes.map(symptomLabel).join(', ') || `${mine.length} Einträge heute`,
  };
}

/** Kita-/Schul-Fehltage im laufenden Zeitraum (PRD A3-03). */
export function sickDaysSince(entries: HealthEntry[], childId: ID, from: ISODate): number {
  return periodStats(entries, childId, from, todayISO()).sickDays;
}

/** Beginn des laufenden Kita-Jahres (1. September). */
export function currentKitaYearStart(at: ISODate = todayISO()): ISODate {
  const d = parseDate(at);
  const year = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${year}-09-01`;
}

export function daysSinceLastEpisode(
  entries: HealthEntry[],
  childId: ID,
): { episode: Episode; days: number } | undefined {
  const episodes = buildEpisodes(entries, childId);
  const last = episodes[episodes.length - 1];
  if (!last) return undefined;
  return { episode: last, days: daysBetween(dayOf(last.end), todayISO()) };
}
