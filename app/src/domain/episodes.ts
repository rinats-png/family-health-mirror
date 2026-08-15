import { FEVER_THRESHOLD } from './catalog';
import { dayOf, daysBetween } from './dates';
import type { Episode, HealthEntry, ID, ISODate } from './types';

/**
 * Bündelt Einträge zu Krankheitsepisoden (PRD T-05).
 *
 * Regel: Einträge mit höchstens EPISODE_GAP_HOURS Abstand gehören zur selben
 * Episode. Eltern denken in „dieser Infekt", nicht in Einzelmessungen — das ist
 * die Einheit, in der Rückschau und Arzt-Export rechnen.
 *
 * Bewusst abgeleitet statt persistiert: Die Regel kann sich ändern, ohne dass
 * Altdaten migriert werden müssen.
 */
export const EPISODE_GAP_HOURS = 48;

/** Einträge, die keine Krankheit anzeigen, starten keine Episode. */
const NON_ILLNESS_CODES = new Set(['bad_sleep', 'teething']);

function isIllnessEntry(e: HealthEntry): boolean {
  if (e.temperature != null || e.febrileSeizure) return true;
  return e.symptoms.some((s) => !NON_ILLNESS_CODES.has(s.code));
}

export function buildEpisodes(entries: HealthEntry[], childId: ID): Episode[] {
  const relevant = entries
    .filter((e) => e.childId === childId && !e.deleted && isIllnessEntry(e))
    .sort((a, b) => a.at.localeCompare(b.at));

  const episodes: Episode[] = [];
  let current: HealthEntry[] = [];

  const flush = () => {
    if (current.length === 0) return;
    const first = current[0];
    const last = current[current.length - 1];
    const temps = current.map((e) => e.temperature).filter((t): t is number => t != null);
    const codes = new Set<string>();
    current.forEach((e) => e.symptoms.forEach((s) => codes.add(s.code)));
    const days = new Set(current.map((e) => dayOf(e.at)));
    episodes.push({
      id: `ep_${first.id}`,
      childId,
      start: first.at,
      end: last.at,
      entryIds: current.map((e) => e.id),
      maxTemp: temps.length ? Math.max(...temps) : undefined,
      symptomCodes: [...codes],
      dayCount: Math.max(
        days.size,
        daysBetween(dayOf(first.at), dayOf(last.at)) + 1,
      ),
      hadFever: temps.some((t) => t >= FEVER_THRESHOLD) || codes.has('fever'),
    });
    current = [];
  };

  for (const entry of relevant) {
    if (current.length === 0) {
      current = [entry];
      continue;
    }
    const prev = current[current.length - 1];
    const gapHours =
      (new Date(entry.at).getTime() - new Date(prev.at).getTime()) / 3_600_000;
    if (gapHours <= EPISODE_GAP_HOURS) {
      current.push(entry);
    } else {
      flush();
      current = [entry];
    }
  }
  flush();
  return episodes;
}

/** Die Episode, die den angegebenen Tag abdeckt. */
export function episodeOnDay(episodes: Episode[], day: ISODate): Episode | undefined {
  return episodes.find(
    (ep) => dayOf(ep.start) <= day && day <= dayOf(ep.end),
  );
}

/** Läuft gerade eine Episode? Maßgeblich für den Krankheitsmodus des Dashboards. */
export function activeEpisode(episodes: Episode[], now = new Date()): Episode | undefined {
  const last = episodes[episodes.length - 1];
  if (!last) return undefined;
  const hoursSince = (now.getTime() - new Date(last.end).getTime()) / 3_600_000;
  return hoursSince <= EPISODE_GAP_HOURS ? last : undefined;
}

/** Alle Kalendertage, die eine Episode berührt. */
export function episodeDays(ep: Episode): ISODate[] {
  const out: ISODate[] = [];
  const start = new Date(dayOf(ep.start));
  const end = new Date(dayOf(ep.end));
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(dayOf(d.toISOString()));
  }
  return out;
}
