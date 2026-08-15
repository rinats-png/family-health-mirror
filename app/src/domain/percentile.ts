import { PERCENTILES, type CurveSet, type Percentile } from '../data/growthReferences';

/**
 * Perzentilrechnung — bewusst nur numerisch.
 *
 * Diese Datei liefert eine Zahl und sonst nichts. Es gibt hier keine
 * Kategorien, keine Schwellen und keine Formulierungen. Die Aufgabenstellung
 * erlaubt ausdrücklich einen neutralen numerischen Perzentilwert („P42 nach
 * WHO"); jede sprachliche Einordnung dieses Werts ist unzulässig und darf
 * deshalb auch nicht hier entstehen.
 */

const PERCENTILE_VALUE: Record<Percentile, number> = {
  p3: 3,
  p10: 10,
  p50: 50,
  p90: 90,
  p97: 97,
};

function interpolate(xs: number[], ys: number[], x: number): number | undefined {
  if (xs.length === 0) return undefined;
  if (x < xs[0] || x > xs[xs.length - 1]) return undefined;
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) {
      const span = xs[i] - xs[i - 1];
      const ratio = span === 0 ? 0 : (x - xs[i - 1]) / span;
      return ys[i - 1] + ratio * (ys[i] - ys[i - 1]);
    }
  }
  return ys[ys.length - 1];
}

/** Kurvenwerte einer Perzentillinie beim gegebenen Alter. */
export function curveValueAt(
  curve: CurveSet,
  percentile: Percentile,
  ageMonths: number,
): number | undefined {
  return interpolate(curve.ageMonths, curve[percentile], ageMonths);
}

/**
 * Grobe Perzentileinordnung durch lineare Interpolation zwischen den fünf
 * hinterlegten Linien. Ergebnis ist auf 3…97 begrenzt, weil außerhalb der
 * Linien keine belastbare Aussage möglich ist.
 *
 * Rückgabe `undefined` bedeutet: Für dieses Alter oder diesen Wert liegt keine
 * Kurve vor — die Anwendung zeigt dann schlicht keinen Perzentilwert an.
 */
export function percentileOf(
  curve: CurveSet,
  ageMonths: number,
  value: number,
): number | undefined {
  const points: { p: number; v: number }[] = [];
  for (const key of PERCENTILES) {
    const v = curveValueAt(curve, key, ageMonths);
    if (v == null) return undefined;
    points.push({ p: PERCENTILE_VALUE[key], v });
  }

  if (value <= points[0].v) return points[0].p;
  const last = points[points.length - 1];
  if (value >= last.v) return last.p;

  for (let i = 1; i < points.length; i++) {
    if (value <= points[i].v) {
      const span = points[i].v - points[i - 1].v;
      const ratio = span === 0 ? 0 : (value - points[i - 1].v) / span;
      return points[i - 1].p + ratio * (points[i].p - points[i - 1].p);
    }
  }
  return undefined;
}

/** Reine Zahlenformatierung, ohne jede Wertung. */
export function formatPercentile(p: number | undefined): string | undefined {
  return p == null ? undefined : `P${Math.round(p)}`;
}
