import { CHECKUPS, type CheckupDef } from '../data/checkups';
import { VACCINE_SCHEDULE, type VaccineDose } from '../data/stiko';
import { addDays, addMonths, daysBetween, todayISO } from './dates';
import type { CheckupRecord, Child, ISODate, VaccinationRecord } from './types';

/**
 * Fälligkeitsstufen (PRD I-03).
 * „bald" beginnt 28 Tage vor dem frühesten empfohlenen Termin.
 */
export type DueStatus = 'done' | 'upcoming' | 'soon' | 'due' | 'overdue' | 'expired';

export const SOON_WINDOW_DAYS = 28;

/**
 * Ab wann ein verpasster Termin nicht mehr als „überfällig" gilt.
 *
 * Wichtig fachlich und für das Vertrauen: Einem Kind mit drei Jahren die
 * Rotavirus-Schluckimpfung als „überfällig" anzuzeigen wäre falsch (das
 * Zeitfenster ist im Säuglingsalter geschlossen) und würde Eltern grundlos
 * beunruhigen. Solche Einträge bekommen den Status „Zeitfenster abgelaufen"
 * mit dem Hinweis, das ärztlich zu besprechen — und tauchen nicht mehr als
 * Handlungsaufforderung auf.
 */
export const EXPIRED_AFTER_DAYS = 180;

export const STATUS_LABEL: Record<DueStatus, string> = {
  done: 'erledigt',
  upcoming: 'später',
  soon: 'bald fällig',
  due: 'jetzt fällig',
  overdue: 'überfällig',
  expired: 'Zeitfenster abgelaufen',
};

/** Symbol zusätzlich zur Farbe — Farbe darf nie allein informieren (PRD §4.0). */
export const STATUS_SYMBOL: Record<DueStatus, string> = {
  done: '✓',
  upcoming: '○',
  soon: '◔',
  due: '●',
  overdue: '▲',
  expired: '–',
};

export interface ScheduledVaccination {
  key: string;
  dose: VaccineDose;
  dueFrom: ISODate;
  dueTo: ISODate;
  status: DueStatus;
  record?: VaccinationRecord;
  /** Tage bis zum frühesten empfohlenen Termin (negativ = überschritten). */
  daysUntil: number;
}

function statusFor(dueFrom: ISODate, dueTo: ISODate, at: ISODate): DueStatus {
  const untilFrom = daysBetween(at, dueFrom);
  const untilTo = daysBetween(at, dueTo);
  if (untilFrom > SOON_WINDOW_DAYS) return 'upcoming';
  if (untilFrom > 0) return 'soon';
  if (untilTo >= 0) return 'due';
  return untilTo < -EXPIRED_AFTER_DAYS ? 'expired' : 'overdue';
}

/**
 * Erzeugt den individuellen Impfplan aus Geburtsdatum und bereits erfassten
 * Impfungen (PRD I-02).
 *
 * Wichtig für die regulatorische Einordnung (PRD §5.7): Dies ist die Umsetzung
 * einer öffentlichen Empfehlung auf einen Kalender, keine individuelle
 * medizinische Empfehlung. Es findet keine Bewertung des Kindes statt.
 */
export function buildVaccinationPlan(
  child: Child,
  records: VaccinationRecord[],
  at: ISODate = todayISO(),
): ScheduledVaccination[] {
  const mine = records.filter((r) => r.childId === child.id && !r.deleted);
  const byKey = new Map(mine.map((r) => [`${r.vaccineCode}#${r.doseNumber}`, r]));

  return VACCINE_SCHEDULE.doses
    .map((dose) => {
      const key = `${dose.vaccineCode}#${dose.doseNumber}`;
      const record = byKey.get(key);

      let dueFrom = addMonths(child.birthDate, Math.floor(dose.dueFromMonths));
      if (dose.dueFromMonths % 1 !== 0) {
        dueFrom = addDays(dueFrom, Math.round((dose.dueFromMonths % 1) * 30));
      }
      const dueTo = addMonths(child.birthDate, Math.ceil(dose.dueToMonths));

      // Mindestabstand zur tatsächlich erfolgten Vordosis verschiebt den Termin
      // nach hinten — die Empfehlung nennt Abstände, nicht nur Alter.
      if (dose.minIntervalWeeksAfterPrevious && dose.doseNumber > 1) {
        const prev = byKey.get(`${dose.vaccineCode}#${dose.doseNumber - 1}`);
        if (prev) {
          const earliest = addDays(prev.date, dose.minIntervalWeeksAfterPrevious * 7);
          if (daysBetween(dueFrom, earliest) > 0) dueFrom = earliest;
        }
      }

      return {
        key,
        dose,
        dueFrom,
        dueTo,
        status: record ? ('done' as const) : statusFor(dueFrom, dueTo, at),
        record,
        daysUntil: daysBetween(at, dueFrom),
      };
    })
    .sort((a, b) => a.dueFrom.localeCompare(b.dueFrom) || a.dose.doseNumber - b.dose.doseNumber);
}

export interface ScheduledCheckup {
  def: CheckupDef;
  dueFrom: ISODate;
  dueTo: ISODate;
  status: DueStatus;
  record?: CheckupRecord;
  daysUntil: number;
}

export function buildCheckupPlan(
  child: Child,
  records: CheckupRecord[],
  at: ISODate = todayISO(),
): ScheduledCheckup[] {
  const mine = records.filter((r) => r.childId === child.id && !r.deleted);
  const byCode = new Map(mine.map((r) => [r.checkupCode, r]));

  return CHECKUPS.map((def) => {
    const dueFrom = addDays(child.birthDate, def.fromDays);
    const dueTo = addDays(child.birthDate, def.toDays);
    const record = byCode.get(def.code);
    return {
      def,
      dueFrom,
      dueTo,
      status: record ? ('done' as const) : statusFor(dueFrom, dueTo, at),
      record,
      daysUntil: daysBetween(at, dueFrom),
    };
  });
}

/** Die nächste relevante Impfung für die Dashboard-Kachel. */
/**
 * Auswahl für die Dashboard-Kachel. Abgelaufene Zeitfenster werden bewusst
 * übersprungen — sie sind keine Handlungsaufforderung mehr.
 */
function pickRelevant<T extends { status: DueStatus }>(plan: T[]): T | undefined {
  const open = plan.filter((p) => p.status !== 'done' && p.status !== 'expired');
  return (
    open.find((p) => p.status === 'overdue') ??
    open.find((p) => p.status === 'due') ??
    open.find((p) => p.status === 'soon') ??
    open.find((p) => p.status === 'upcoming')
  );
}

export function nextRelevantVaccination(
  plan: ScheduledVaccination[],
): ScheduledVaccination | undefined {
  return pickRelevant(plan);
}

export function nextRelevantCheckup(plan: ScheduledCheckup[]): ScheduledCheckup | undefined {
  return pickRelevant(plan);
}

/**
 * Kita-Check (PRD I-09): rein beschreibende Liste offener Nachweise.
 * Keine Rechtsauskunft — die App stellt nur dar, was im eigenen Plan offen ist.
 */
export function measlesProofStatus(plan: ScheduledVaccination[]): {
  done: number;
  total: number;
  complete: boolean;
} {
  const mmr = plan.filter((p) => p.dose.vaccineCode === 'mmr');
  const done = mmr.filter((p) => p.status === 'done').length;
  return { done, total: mmr.length, complete: done === mmr.length && mmr.length > 0 };
}
