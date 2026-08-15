import { GROWTH_MAX_MONTHS, bandFor } from '../data/growth';
import { effectiveAgeMonths } from './ageGroups';
import { dayOf } from './dates';
import type { Child, Measurement } from './types';

export interface GrowthPoint {
  ageMonths: number;
  value: number;
  at: string;
}

export function growthSeries(
  measurements: Measurement[],
  child: Child,
  kind: 'weight' | 'height' | 'headCirc',
): GrowthPoint[] {
  return measurements
    .filter((m) => m.childId === child.id && m.kind === kind && !m.deleted)
    .map((m) => ({
      ageMonths: effectiveAgeMonths(child, dayOf(m.at)),
      value: m.value,
      at: m.at,
    }))
    .sort((a, b) => a.ageMonths - b.ageMonths);
}

/**
 * Grobe Perzentil-Einordnung durch lineare Interpolation zwischen P3, P50, P97.
 *
 * Bewusst als Bereichsangabe formuliert und nicht als exakter Wert: Die
 * Referenzdaten sind Näherungen, und die App bewertet nicht — sie stellt dar
 * (PRD §5.7).
 */
export function estimatePercentile(
  child: Child,
  kind: 'weight' | 'height',
  ageMonths: number,
  value: number,
): number | undefined {
  if (ageMonths > GROWTH_MAX_MONTHS) return undefined;
  const band = bandFor(kind, child.sex);
  const i = Math.min(Math.max(Math.round(ageMonths), 0), GROWTH_MAX_MONTHS);
  const { p3, p50, p97 } = band;
  if (value <= p3[i]) return 3;
  if (value >= p97[i]) return 97;
  if (value < p50[i]) {
    return 3 + ((value - p3[i]) / (p50[i] - p3[i])) * 47;
  }
  return 50 + ((value - p50[i]) / (p97[i] - p50[i])) * 47;
}

/**
 * Klartext statt Perzentilzahl (PRD A1-02, N-07).
 *
 * Formulierungen sind bewusst deskriptiv: „wächst auf seiner Kurve" beschreibt
 * die Konstanz der Einordnung, nicht die Angemessenheit des Gewichts.
 */
export function growthNarrative(
  child: Child,
  kind: 'weight' | 'height',
  points: GrowthPoint[],
): { headline: string; detail: string; trend: 'up' | 'down' | 'stable' | 'none' } {
  if (points.length === 0) {
    return { headline: 'Noch keine Messung', detail: 'Trage Gewicht oder Größe ein.', trend: 'none' };
  }
  const last = points[points.length - 1];
  const pct = estimatePercentile(child, kind, last.ageMonths, last.value);
  const unit = kind === 'weight' ? 'kg' : 'cm';

  if (points.length === 1 || pct == null) {
    return {
      headline: `${last.value} ${unit}`,
      detail:
        pct == null
          ? 'Für dieses Alter liegen im Prototyp keine Referenzdaten vor.'
          : 'Ab der zweiten Messung zeigen wir den Verlauf.',
      trend: 'none',
    };
  }

  const prev = points[points.length - 2];
  const prevPct = estimatePercentile(child, kind, prev.ageMonths, prev.value);
  const delta = prevPct != null ? pct - prevPct : 0;
  const trend: 'up' | 'down' | 'stable' =
    Math.abs(delta) < 8 ? 'stable' : delta > 0 ? 'up' : 'down';

  const detail =
    trend === 'stable'
      ? `${child.name} bleibt seit der letzten Messung im selben Bereich der Kurve.`
      : trend === 'up'
        ? `Die Einordnung ist gegenüber der letzten Messung nach oben gerückt.`
        : `Die Einordnung ist gegenüber der letzten Messung nach unten gerückt.`;

  return { headline: `${last.value} ${unit}`, detail, trend };
}

export function percentileText(pct: number | undefined): string {
  if (pct == null) return 'keine Referenzdaten';
  const rounded = Math.round(pct);
  if (rounded <= 3) return 'im unteren Bereich der Referenzkurven';
  if (rounded >= 97) return 'im oberen Bereich der Referenzkurven';
  return `etwa auf Perzentil ${rounded}`;
}
