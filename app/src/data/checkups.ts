/**
 * U-Untersuchungen und J1.
 *
 * ACHTUNG — PLATZHALTER, wie bei stiko.ts: Zeitfenster sind nach bestem Wissen
 * nachgebildet, aber nicht fachlich geprüft. Die amtliche Bezeichnung
 * („3.–10. Lebenstag") und die Umrechnung in Tage ab Geburt müssen vor
 * Produktivbetrieb gegen die Kinder-Richtlinie des G-BA abgeglichen werden;
 * insbesondere die Auslegung von „Lebensmonat" ist fehleranfällig.
 *
 * U10, U11 und J2 sind in der Regel keine Regelleistung der gesetzlichen
 * Krankenkassen, sondern Zusatzangebote — deshalb hier markiert.
 */

export interface CheckupDef {
  code: string;
  label: string;
  /** Offizielle Bezeichnung des Zeitfensters, wie Eltern sie kennen. */
  windowLabel: string;
  /** Zeitfenster in Tagen ab Geburt. */
  fromDays: number;
  toDays: number;
  /** Zusatzleistung statt Regelleistung. */
  extra?: boolean;
  infoUrl: string;
}

const GBA = 'https://www.kinderaerzte-im-netz.de/vorsorge/';

export const CHECKUPS_VERSION = '0.1.0-platzhalter';

export const CHECKUPS: CheckupDef[] = [
  { code: 'U1', label: 'U1 — Neugeborenen-Erstuntersuchung', windowLabel: 'direkt nach der Geburt', fromDays: 0, toDays: 1, infoUrl: GBA },
  { code: 'U2', label: 'U2 — Neugeborenen-Basisuntersuchung', windowLabel: '3.–10. Lebenstag', fromDays: 2, toDays: 10, infoUrl: GBA },
  { code: 'U3', label: 'U3', windowLabel: '4.–5. Lebenswoche', fromDays: 21, toDays: 35, infoUrl: GBA },
  { code: 'U4', label: 'U4', windowLabel: '3.–4. Lebensmonat', fromDays: 60, toDays: 120, infoUrl: GBA },
  { code: 'U5', label: 'U5', windowLabel: '6.–7. Lebensmonat', fromDays: 150, toDays: 210, infoUrl: GBA },
  { code: 'U6', label: 'U6', windowLabel: '10.–12. Lebensmonat', fromDays: 270, toDays: 360, infoUrl: GBA },
  { code: 'U7', label: 'U7', windowLabel: '21.–24. Lebensmonat', fromDays: 600, toDays: 720, infoUrl: GBA },
  { code: 'U7a', label: 'U7a', windowLabel: '34.–36. Lebensmonat', fromDays: 990, toDays: 1080, infoUrl: GBA },
  { code: 'U8', label: 'U8', windowLabel: '46.–48. Lebensmonat', fromDays: 1350, toDays: 1440, infoUrl: GBA },
  { code: 'U9', label: 'U9', windowLabel: '60.–64. Lebensmonat', fromDays: 1770, toDays: 1920, infoUrl: GBA },
  { code: 'U10', label: 'U10', windowLabel: '7–8 Jahre', fromDays: 2555, toDays: 2920, extra: true, infoUrl: GBA },
  { code: 'U11', label: 'U11', windowLabel: '9–10 Jahre', fromDays: 3285, toDays: 3650, extra: true, infoUrl: GBA },
  { code: 'J1', label: 'J1 — Jugenduntersuchung', windowLabel: '12–14 Jahre', fromDays: 4380, toDays: 5110, infoUrl: GBA },
];
