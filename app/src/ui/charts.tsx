import { bandFor } from '../data/growth';
import { formatTime } from '../domain/dates';
import type { GrowthPoint } from '../domain/growth';
import type { Child } from '../domain/types';

/**
 * Diagramme als handgeschriebenes SVG — bewusst ohne Chart-Bibliothek:
 * weniger Abhängigkeiten, volle Kontrolle über Kontraste und Beschriftung,
 * und die Kurven müssen in Graustufen druckbar bleiben.
 */

interface TempPoint {
  at: string;
  value: number;
}

export function TemperatureChart({ points }: { points: TempPoint[] }) {
  if (points.length === 0) {
    return <p className="muted small">Noch keine Temperaturmessung in dieser Episode.</p>;
  }

  const w = 520;
  const h = 170;
  const pad = { l: 30, r: 10, t: 12, b: 26 };
  const min = 36;
  const max = Math.max(40.5, Math.ceil(Math.max(...points.map((p) => p.value)) * 2) / 2);
  const t0 = new Date(points[0].at).getTime();
  const t1 = new Date(points[points.length - 1].at).getTime();
  const span = Math.max(1, t1 - t0);

  const x = (t: number) => pad.l + ((t - t0) / span) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);

  const path = points
    .map((p, i) => `${i ? 'L' : 'M'}${x(new Date(p.at).getTime()).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ');

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Temperaturverlauf">
        {[37, 38, 39, 40].filter((v) => v <= max).map((v) => (
          <g key={v}>
            <line
              x1={pad.l} y1={y(v)} x2={w - pad.r} y2={y(v)}
              stroke="var(--border)" strokeWidth="1"
            />
            <text x={2} y={y(v) + 4} fontSize="11" fill="var(--text-muted)">{v}°</text>
          </g>
        ))}
        {/* 38 °C als Zählschwelle der Statistik, nicht als medizinische Grenze */}
        <line
          x1={pad.l} y1={y(38)} x2={w - pad.r} y2={y(38)}
          stroke="var(--warning)" strokeDasharray="4 3" strokeWidth="1.5"
        />
        <path d={path} fill="none" stroke="var(--action)" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(new Date(p.at).getTime())}
            cy={y(p.value)}
            r="3.5"
            fill="var(--action)"
          />
        ))}
        <text x={pad.l} y={h - 6} fontSize="11" fill="var(--text-muted)">
          {formatTime(points[0].at)}
        </text>
        {points.length > 1 && (
          <text x={w - pad.r} y={h - 6} fontSize="11" fill="var(--text-muted)" textAnchor="end">
            {formatTime(points[points.length - 1].at)}
          </text>
        )}
      </svg>
    </figure>
  );
}

export function GrowthChart({
  child,
  kind,
  points,
}: {
  child: Child;
  kind: 'weight' | 'height';
  points: GrowthPoint[];
}) {
  const band = bandFor(kind, child.sex);
  const w = 520;
  const h = 220;
  const pad = { l: 34, r: 10, t: 12, b: 26 };
  const maxMonths = 24;
  const values = [...band.p97, ...points.map((p) => p.value)];
  const min = Math.min(...band.p3) * 0.9;
  const max = Math.max(...values) * 1.05;

  const x = (m: number) => pad.l + (Math.min(m, maxMonths) / maxMonths) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);

  const line = (arr: number[]) =>
    arr.map((v, m) => `${m ? 'L' : 'M'}${x(m).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  // Fläche zwischen P3 und P97: P3 vorwärts, P97 rückwärts, dann schließen.
  const area = [
    line(band.p3),
    ...band.p97.map((_, i) => {
      const m = maxMonths - i;
      return `L${x(m).toFixed(1)},${y(band.p97[m]).toFixed(1)}`;
    }),
    'Z',
  ].join(' ');

  const own = points
    .filter((p) => p.ageMonths <= maxMonths)
    .map((p, i) => `${i ? 'L' : 'M'}${x(p.ageMonths).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(' ');

  const unit = kind === 'weight' ? 'kg' : 'cm';

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img"
        aria-label={`Verlauf ${kind === 'weight' ? 'Gewicht' : 'Größe'} mit Referenzbereich`}>
        <path d={area} fill="var(--action-soft)" stroke="none" />
        <path d={line(band.p50)} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d={line(band.p3)} fill="none" stroke="var(--border-strong)" strokeWidth="1" />
        <path d={line(band.p97)} fill="none" stroke="var(--border-strong)" strokeWidth="1" />
        {own && <path d={own} fill="none" stroke="var(--action)" strokeWidth="2.5" strokeLinejoin="round" />}
        {points
          .filter((p) => p.ageMonths <= maxMonths)
          .map((p, i) => (
            <circle key={i} cx={x(p.ageMonths)} cy={y(p.value)} r="4" fill="var(--action)" />
          ))}
        {[0, 6, 12, 18, 24].map((m) => (
          <text key={m} x={x(m)} y={h - 6} fontSize="11" fill="var(--text-muted)" textAnchor="middle">
            {m}
          </text>
        ))}
        <text x={2} y={y(max) + 10} fontSize="11" fill="var(--text-muted)">
          {unit}
        </text>
      </svg>
      <figcaption className="small muted" style={{ marginTop: 6 }}>
        Fläche = Bereich zwischen P3 und P97, gestrichelt = P50. Monate ab Geburt.
      </figcaption>
    </figure>
  );
}

/**
 * Schlaf und Krankheit als zwei getrennte Streifen untereinander (PRD N-05).
 * Bewusst keine Überlagerung und keine Korrelationsangabe — die
 * Gegenüberstellung ist die Aussage, mehr nicht.
 */
export function SleepIllnessStrips({
  data,
}: {
  data: { day: string; sleepQuality?: number; sick: boolean }[];
}) {
  const colorFor = (q?: number) =>
    q === 1 ? 'var(--critical)' : q === 2 ? 'var(--warning)' : q === 3 ? 'var(--ok)' : 'var(--surface-2)';

  return (
    <div className="stack" style={{ gap: 'var(--space-2)' }}>
      <div>
        <div className="small muted" style={{ marginBottom: 4 }}>Schlaf</div>
        <div style={{ display: 'flex', gap: 1 }}>
          {data.map((d) => (
            <div
              key={d.day}
              title={`${d.day}: ${d.sleepQuality ? ['', 'schlecht', 'unruhig', 'gut'][d.sleepQuality] : 'kein Eintrag'}`}
              style={{ flex: 1, height: 18, borderRadius: 2, background: colorFor(d.sleepQuality) }}
            />
          ))}
        </div>
      </div>
      <div>
        <div className="small muted" style={{ marginBottom: 4 }}>Krankheitstage</div>
        <div style={{ display: 'flex', gap: 1 }}>
          {data.map((d) => (
            <div
              key={d.day}
              title={`${d.day}: ${d.sick ? 'Symptome erfasst' : 'keine Symptome'}`}
              style={{
                flex: 1,
                height: 18,
                borderRadius: 2,
                background: d.sick ? 'var(--brand)' : 'var(--surface-2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
