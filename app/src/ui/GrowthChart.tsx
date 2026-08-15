import { PERCENTILES, type CurveSet } from '../data/growthReferences';
import { curveValueAt } from '../domain/percentile';

/**
 * Perzentildiagramm (Aufgabenstellung Abschnitt 4.3).
 *
 * Gezeichnet werden die beschrifteten Kurvenlinien und die eingetragenen Werte.
 * Bewusst nicht vorhanden: farbliche Kennzeichnung nach Auffälligkeit,
 * Zonen-Einfärbung, Warnfarben, Hervorhebung einzelner Punkte. Alle Punkte
 * sehen gleich aus, unabhängig davon, wo sie liegen.
 */

export interface ChartPoint {
  ageMonths: number;
  value: number;
  label: string;
}

interface Props {
  curve: CurveSet;
  points: ChartPoint[];
  unit: string;
  /** Anzeigeumrechnung, falls der Nutzer lb/in gewählt hat. */
  toDisplay: (value: number) => number;
  ariaLabel: string;
}

/** Punkt-Beschriftungen enthalten Datum und Wert; escapen, bevor sie ins SVG gehen. */
const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c,
  );

const LINE_LABEL: Record<string, string> = {
  p3: 'P3',
  p10: 'P10',
  p50: 'P50',
  p90: 'P90',
  p97: 'P97',
};

export function buildGrowthChartSvg({ curve, points, unit, toDisplay, ariaLabel }: Props): string {
  const w = 560;
  const h = 320;
  const pad = { l: 42, r: 34, t: 14, b: 30 };

  const ages = curve.ageMonths;
  const minAge = ages[0];
  const maxAge = ages[ages.length - 1];

  const allValues = [
    ...curve.p3.map(toDisplay),
    ...curve.p97.map(toDisplay),
    ...points.map((p) => toDisplay(p.value)),
  ];
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const padV = (maxV - minV) * 0.08 || 1;
  const lo = minV - padV;
  const hi = maxV + padV;

  const x = (m: number) =>
    pad.l + ((Math.min(Math.max(m, minAge), maxAge) - minAge) / (maxAge - minAge)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);

  const linePath = (key: (typeof PERCENTILES)[number]) =>
    ages
      .map((m, i) => `${i ? 'L' : 'M'}${x(m).toFixed(1)},${y(toDisplay(curve[key][i])).toFixed(1)}`)
      .join(' ');

  const lines = PERCENTILES.map((key) => {
    const isMedian = key === 'p50';
    return `<path d="${linePath(key)}" fill="none" stroke="${isMedian ? '#4a5a60' : '#9fb4bb'}"
      stroke-width="${isMedian ? 1.6 : 1}" stroke-dasharray="${isMedian ? '' : '4 3'}" />
      <text x="${w - pad.r + 3}" y="${y(toDisplay(curve[key][curve[key].length - 1])) + 3.5}"
        font-size="10" fill="#5a6b70">${LINE_LABEL[key]}</text>`;
  }).join('');

  // Achsenbeschriftung: Jahre, solange die Kurve mehr als 24 Monate umfasst.
  const useYears = maxAge - minAge > 24;
  const ticks: number[] = [];
  if (useYears) {
    for (let m = Math.ceil(minAge / 12) * 12; m <= maxAge; m += 12) ticks.push(m);
  } else {
    for (let m = minAge; m <= maxAge; m += Math.max(1, Math.round((maxAge - minAge) / 6))) ticks.push(m);
  }

  const xAxis = ticks
    .map(
      (m) =>
        `<line x1="${x(m)}" y1="${pad.t}" x2="${x(m)}" y2="${h - pad.b}" stroke="#e6edef" stroke-width="1"/>
         <text x="${x(m)}" y="${h - pad.b + 14}" font-size="10" fill="#5a6b70" text-anchor="middle">${
           useYears ? `${Math.round(m / 12)}` : `${Math.round(m)}`
         }</text>`,
    )
    .join('');

  const yTickCount = 5;
  const yAxis = Array.from({ length: yTickCount }, (_, i) => {
    const v = lo + ((hi - lo) * i) / (yTickCount - 1);
    return `<line x1="${pad.l}" y1="${y(v)}" x2="${w - pad.r}" y2="${y(v)}" stroke="#e6edef" stroke-width="1"/>
            <text x="${pad.l - 5}" y="${y(v) + 3.5}" font-size="10" fill="#5a6b70" text-anchor="end">${v.toFixed(0)}</text>`;
  }).join('');

  const ownPath = points.length
    ? points
        .filter((p) => p.ageMonths >= minAge && p.ageMonths <= maxAge)
        .map((p, i) => `${i ? 'L' : 'M'}${x(p.ageMonths).toFixed(1)},${y(toDisplay(p.value)).toFixed(1)}`)
        .join(' ')
    : '';

  const dots = points
    .filter((p) => p.ageMonths >= minAge && p.ageMonths <= maxAge)
    .map(
      (p) =>
        `<circle cx="${x(p.ageMonths).toFixed(1)}" cy="${y(toDisplay(p.value)).toFixed(1)}" r="4"
          fill="#16657E"><title>${escapeXml(p.label)}</title></circle>`,
    )
    .join('');

  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${ariaLabel}"
    xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
    <rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>
    ${yAxis}${xAxis}${lines}
    ${ownPath ? `<path d="${ownPath}" fill="none" stroke="#16657E" stroke-width="2"/>` : ''}
    ${dots}
    <text x="${pad.l - 5}" y="${pad.t - 3}" font-size="10" fill="#5a6b70" text-anchor="end">${unit}</text>
    <text x="${w - pad.r}" y="${h - 4}" font-size="10" fill="#5a6b70" text-anchor="end">${
      useYears ? 'Jahre / years' : 'Monate / months'
    }</text>
  </svg>`;
}

export function GrowthChart(props: Props) {
  return (
    <figure
      style={{ margin: 0 }}
      // Das SVG entsteht aus Zahlen und festen Beschriftungen; der einzige
      // Nutzertext ist die Punkt-Beschriftung, die escapeXml passiert hat.
      dangerouslySetInnerHTML={{ __html: buildGrowthChartSvg(props) }}
    />
  );
}

export { curveValueAt };
