import { addDays, dayOf } from './dates';
import type { Entry, ISODate } from './types';

/**
 * Auszählung der eigenen Einträge (REGULATORY.md Abschnitt 3.2).
 *
 * Erlaubt ist die Auszählung dessen, was der Nutzer selbst angelegt hat.
 * Nicht erlaubt — und deshalb hier nicht vorhanden — ist die Verdichtung
 * mehrerer Einträge zu einem Geschehen:
 *
 *   - keine Bildung von Episoden, Schüben oder Phasen. Die Anwendung müsste
 *     dafür entscheiden, welche Einträge zusammengehören und welche Lücke sie
 *     trennt. Diese Entscheidung hat der Nutzer nie eingegeben.
 *   - kein Schwellenwert, der eine Temperatur zu „Fieber" macht. Ob ein
 *     Eintrag Fieber ist, ergibt sich ausschließlich aus der Kategorie, die
 *     der Nutzer selbst gewählt hat.
 *   - keine Häufigkeitsbewertung („häufiger als üblich"), kein Vergleich mit
 *     einem Erwartungswert.
 *
 * `longestRun` zählt aufeinanderfolgende Kalendertage, an denen jeweils
 * mindestens ein Eintrag dieser Kategorie steht. Das ist eine Aussage über
 * den Kalender, nicht über das Kind: nachprüfbar, indem man die Tage abzählt.
 * Es wird ausdrücklich nicht behauptet, dass diese Tage ein durchgehendes
 * Geschehen sind.
 */

export interface CategoryTally {
  categoryId: string;
  /** Anzahl der Einträge dieser Kategorie im Zeitraum. */
  entries: number;
  /** Anzahl der Kalendertage mit mindestens einem solchen Eintrag. */
  days: number;
  /** Längste Folge aufeinanderfolgender Kalendertage mit einem Eintrag. */
  longestRun: number;
  firstDay: ISODate;
  lastDay: ISODate;
}

export interface PeriodTally {
  from: ISODate;
  to: ISODate;
  /** Alle Einträge im Zeitraum, auch die ohne Kategorie. */
  entries: number;
  /** Kalendertage mit mindestens einem Eintrag, kategorieübergreifend. */
  days: number;
  byCategory: CategoryTally[];
}

/** Längste Folge aufeinanderfolgender Tage in einer Menge von Kalendertagen. */
export function longestRunOfDays(days: Iterable<ISODate>): number {
  const set = new Set(days);
  let best = 0;
  for (const day of set) {
    // Nur am Anfang einer Folge zählen, sonst wird jede Folge mehrfach geprüft.
    if (set.has(addDays(day, -1))) continue;
    let run = 1;
    while (set.has(addDays(day, run))) run += 1;
    if (run > best) best = run;
  }
  return best;
}

export function tallyPeriod(entries: Entry[], from: ISODate, to: ISODate): PeriodTally {
  const inPeriod = entries.filter((e) => {
    const day = dayOf(e.at);
    return day >= from && day <= to;
  });

  const perCategory = new Map<string, ISODate[]>();
  const allDays = new Set<ISODate>();

  for (const entry of inPeriod) {
    const day = dayOf(entry.at);
    allDays.add(day);
    for (const id of entry.categoryIds) {
      const days = perCategory.get(id) ?? [];
      days.push(day);
      perCategory.set(id, days);
    }
  }

  const byCategory: CategoryTally[] = [...perCategory]
    .map(([categoryId, days]) => {
      const sorted = [...days].sort();
      return {
        categoryId,
        entries: days.length,
        days: new Set(days).size,
        longestRun: longestRunOfDays(days),
        firstDay: sorted[0],
        lastDay: sorted[sorted.length - 1],
      };
    })
    .sort((a, b) => b.entries - a.entries || a.categoryId.localeCompare(b.categoryId));

  return { from, to, entries: inPeriod.length, days: allDays.size, byCategory };
}
