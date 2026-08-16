/**
 * Zwei Diagramme für den Verlauf, beide mit x- und y-Achse.
 *
 * Was hier gezeichnet wird, ist ausschließlich eine Auszählung dessen, was der
 * Nutzer selbst eingetragen hat: wie viele Einträge an einem Tag, und welche
 * Temperatur er notiert hat. Bewusst nicht vorhanden — und auch nicht später
 * zu ergänzen:
 *
 *   - Ausgleichs- oder Trendlinie, gleitender Durchschnitt, Regression
 *   - Schwellenwertlinie (etwa „ab 38,5 °C"), farbige Zonen
 *   - Hervorhebung einzelner Punkte, Warnfarben an Messwerten
 *
 * Jede dieser Ergänzungen wäre eine Aussage der Anwendung über die Daten und
 * nicht mehr deren Darstellung (REGULATORY.md Abschnitt 3).
 *
 * Die Farben der Balken sind Nutzerdaten: Es ist die Farbe der Kategorie, die
 * der Nutzer dem Eintrag selbst gegeben hat — dieselbe wie die Punkte im
 * Kalender. Alle übrigen Farben kommen aus Token.
 */

export interface DayBar {
  /** Beschriftung für die Achse, z. B. „5". */
  tick: string;
  /** Vollständige Beschriftung für den Tooltip, z. B. „05.08.2026". */
  label: string;
  /** Segmente von unten nach oben, je Kategorie eines. */
  segments: { color: string; count: number }[];
}

export interface ValuePoint {
  /** Position auf der x-Achse, 0 … 1 innerhalb des Zeitraums. */
  at: number;
  value: number;
  label: string;
}

const W = 560;
const PAD = { l: 34, r: 12, t: 12, b: 26 };

/** Ganzzahlige y-Schritte, damit „2,5 Einträge" nicht an der Achse steht. */
function countTicks(max: number): number[] {
  const step = max <= 4 ? 1 : max <= 10 ? 2 : Math.ceil(max / 5);
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  if (out[out.length - 1] !== max) out.push(max);
  return out;
}

/** Balken je Tag, gestapelt nach Kategorie. */
export function EntriesChart({
  bars,
  ariaLabel,
  yLabel,
  xLabel,
}: {
  bars: DayBar[];
  ariaLabel: string;
  yLabel: string;
  xLabel: string;
}) {
  const h = 200;
  const plotW = W - PAD.l - PAD.r;
  const plotH = h - PAD.t - PAD.b;
  const totals = bars.map((b) => b.segments.reduce((n, s) => n + s.count, 0));
  const max = Math.max(1, ...totals);
  const ticks = countTicks(max);

  const slot = plotW / Math.max(1, bars.length);
  const barW = Math.max(2, Math.min(14, slot * 0.62));
  const y = (v: number) => PAD.t + (1 - v / max) * plotH;

  // Bei 31 Tagen wird nicht jeder Tag beschriftet — die Ziffern überlappen.
  const every = bars.length > 16 ? 5 : bars.length > 8 ? 2 : 1;

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={ariaLabel}>
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)}
              stroke="var(--border)" strokeWidth={v === 0 ? 1.4 : 0.8}
              opacity={v === 0 ? 1 : 0.45}
            />
            <text
              x={PAD.l - 6} y={y(v) + 3.5} fontSize="10"
              fill="var(--text-muted)" textAnchor="end"
            >
              {v}
            </text>
          </g>
        ))}

        {/* y-Achse */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={h - PAD.b} stroke="var(--border)" strokeWidth="1.4" />

        {bars.map((bar, i) => {
          const cx = PAD.l + slot * i + slot / 2;
          let acc = 0;
          return (
            <g key={bar.label}>
              {bar.segments.map((seg, k) => {
                const y1 = y(acc);
                acc += seg.count;
                const y2 = y(acc);
                return (
                  <rect
                    key={k}
                    x={cx - barW / 2}
                    y={y2}
                    width={barW}
                    height={Math.max(1, y1 - y2)}
                    rx="2"
                    fill={seg.color}
                  >
                    <title>{bar.label}</title>
                  </rect>
                );
              })}
              {i % every === 0 && (
                <text
                  x={cx} y={h - PAD.b + 14} fontSize="10"
                  fill="var(--text-muted)" textAnchor="middle"
                >
                  {bar.tick}
                </text>
              )}
            </g>
          );
        })}

        {/* Achsenbeschriftungen: die y-Einheit linksbündig über der Achse,
            sonst läuft sie aus dem Bild. */}
        <text x="1" y={PAD.t - 3} fontSize="10" fill="var(--text-muted)">{yLabel}</text>
        <text x={W - PAD.r} y={h - 3} fontSize="10" fill="var(--text-muted)" textAnchor="end">
          {xLabel}
        </text>
      </svg>
    </figure>
  );
}

/** Eingetragene Messwerte als Punkte über der Zeit. */
export function ValueChart({
  points,
  ticks: xTicks,
  ariaLabel,
  yLabel,
  xLabel,
}: {
  points: ValuePoint[];
  /** Beschriftete Stellen der x-Achse, damit ein Punkt datierbar ist. */
  ticks: { at: number; label: string }[];
  ariaLabel: string;
  yLabel: string;
  xLabel: string;
}) {
  const h = 190;
  const plotW = W - PAD.l - PAD.r;
  const plotH = h - PAD.t - PAD.b;

  const values = points.map((p) => p.value);
  const lo = Math.floor(Math.min(...values) * 2) / 2 - 0.5;
  const hi = Math.ceil(Math.max(...values) * 2) / 2 + 0.5;
  const span = Math.max(0.5, hi - lo);

  const x = (t: number) => PAD.l + t * plotW;
  const y = (v: number) => PAD.t + (1 - (v - lo) / span) * plotH;

  const steps = 4;
  const ticks = Array.from({ length: steps + 1 }, (_, i) => lo + (span * i) / steps);
  const path = points
    .map((p, i) => `${i ? 'L' : 'M'}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ');

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${h}`} width="100%" role="img" aria-label={ariaLabel}>
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l} y1={y(v)} x2={W - PAD.r} y2={y(v)}
              stroke="var(--border)" strokeWidth="0.8" opacity="0.45"
            />
            <text
              x={PAD.l - 6} y={y(v) + 3.5} fontSize="10"
              fill="var(--text-muted)" textAnchor="end"
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={h - PAD.b} stroke="var(--border)" strokeWidth="1.4" />
        <line x1={PAD.l} y1={h - PAD.b} x2={W - PAD.r} y2={h - PAD.b} stroke="var(--border)" strokeWidth="1.4" />

        {xTicks.map((tk) => (
          <g key={tk.label}>
            <line
              x1={x(tk.at)} y1={h - PAD.b} x2={x(tk.at)} y2={h - PAD.b + 4}
              stroke="var(--border)" strokeWidth="1"
            />
            <text
              x={x(tk.at)} y={h - PAD.b + 15} fontSize="10"
              fill="var(--text-muted)" textAnchor="middle"
            >
              {tk.label}
            </text>
          </g>
        ))}

        {/* Die Linie verbindet nur die eingetragenen Punkte. Sie ist keine
            Ausgleichs- oder Trendlinie und wird über Lücken hinweg nicht
            geglättet. */}
        {points.length > 1 && (
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={x(p.at)} cy={y(p.value)} r="4" fill="var(--action)">
            <title>{p.label}</title>
          </circle>
        ))}

        <text x="1" y={PAD.t - 3} fontSize="10" fill="var(--text-muted)">{yLabel}</text>
        <text x={W - PAD.r} y={h - 3} fontSize="10" fill="var(--text-muted)" textAnchor="end">
          {xLabel}
        </text>
      </svg>
    </figure>
  );
}
