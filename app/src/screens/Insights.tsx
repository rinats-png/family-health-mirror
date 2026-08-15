import { useMemo, useState } from 'react';
import { GROWTH_DATA_VERSION } from '../data/growth';
import { hasModule } from '../domain/ageGroups';
import {
  compareWithPreviousYear,
  currentKitaYearStart,
  periodStats,
  sleepVsIllness,
} from '../domain/analytics';
import { MILESTONES } from '../domain/catalog';
import { addDays, formatDateShort, plural, todayISO } from '../domain/dates';
import { exportCsv, exportFullJson, openDoctorSummary } from '../domain/export';
import { effectiveAgeMonths } from '../domain/ageGroups';
import { growthNarrative, growthSeries } from '../domain/growth';
import { useActions, useStore } from '../store/store';
import type { Child } from '../domain/types';
import { GrowthChart, SleepIllnessStrips } from '../ui/charts';

type Range = '30' | '90' | 'kita' | '365';

const RANGE_LABEL: Record<Range, string> = {
  '30': '30 Tage',
  '90': '3 Monate',
  kita: 'seit September',
  '365': '12 Monate',
};

export function Insights({ child }: { child: Child }) {
  const { state } = useStore();
  const { addMeasurement, addMilestone, removeMilestone } = useActions();
  const [range, setRange] = useState<Range>('90');
  const [measure, setMeasure] = useState({ kind: 'weight' as 'weight' | 'height' | 'headCirc', value: '' });

  const to = todayISO();
  const from =
    range === 'kita' ? currentKitaYearStart() : addDays(to, -Number(range));

  const stats = useMemo(
    () => periodStats(state.entries, child.id, from, to),
    [state.entries, child.id, from, to],
  );
  const comparison = useMemo(
    () => compareWithPreviousYear(state.entries, child.id, from, to),
    [state.entries, child.id, from, to],
  );

  const weightPoints = growthSeries(state.measurements, child, 'weight');
  const heightPoints = growthSeries(state.measurements, child, 'height');
  const weightNarrative = growthNarrative(child, 'weight', weightPoints);
  const sleepData = useMemo(
    () => sleepVsIllness(state.entries, state.sleep, child.id, 60),
    [state.entries, state.sleep, child.id],
  );

  const ageMonths = effectiveAgeMonths(child);
  const relevantMilestones = MILESTONES.filter(
    (m) => m.fromMonths <= ageMonths + 6 && m.toMonths >= ageMonths - 12,
  );
  const achieved = new Map(
    state.milestones
      .filter((m) => m.childId === child.id && !m.deleted)
      .map((m) => [m.milestoneCode, m]),
  );

  const delta = comparison.current.episodeCount - comparison.previous.episodeCount;

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">Auswertung</h1>
        <div className="screen-sub">{child.name}</div>
      </div>

      <div className="seg">
        {(Object.keys(RANGE_LABEL) as Range[]).map((r) => (
          <button key={r} type="button" className="seg__item" aria-pressed={range === r} onClick={() => setRange(r)}>
            {RANGE_LABEL[r]}
          </button>
        ))}
      </div>

      <section className="section">
        <div className="section__title">
          {formatDateShort(from)} – {formatDateShort(to)}
        </div>
        <div className="tiles">
          <div className="tile">
            <div className="tile__label">Episoden</div>
            <div className="tile__value">{stats.episodeCount}</div>
          </div>
          <div className="tile">
            <div className="tile__label">Krankheitstage</div>
            <div className="tile__value">{stats.sickDays}</div>
          </div>
          <div className="tile">
            <div className="tile__label">Fiebertage</div>
            <div className="tile__value">{stats.feverDays}</div>
          </div>
          <div className="tile">
            <div className="tile__label">Höchste Messung</div>
            <div className="tile__value">
              {stats.maxTemp != null ? `${stats.maxTemp.toFixed(1)} °C` : '—'}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__title">Vergleich mit dem Vorjahr</div>
        <div className="tile tile--wide">
          {comparison.hasEnoughHistory ? (
            <>
              <div className="tile__value" style={{ fontSize: 19 }}>
                {plural(comparison.current.episodeCount, 'Episode', 'Episoden')} jetzt ·{' '}
                {comparison.previous.episodeCount} im Vorjahreszeitraum
              </div>
              <p className="tile__meta">
                {delta === 0
                  ? 'Gleich viele wie im Vorjahr.'
                  : delta > 0
                    ? `${plural(delta, 'Episode', 'Episoden')} mehr als im gleichen Zeitraum des Vorjahrs.`
                    : `${plural(-delta, 'Episode', 'Episoden')} weniger als im gleichen Zeitraum des Vorjahrs.`}{' '}
                Krankheitstage: {comparison.current.sickDays} gegenüber {comparison.previous.sickDays}.
              </p>
              <div className="note note--muted" style={{ marginTop: 'var(--space-3)' }}>
                Das sind gezählte Einträge, keine medizinische Einordnung. Ob eine Zahl
                auffällig ist, beurteilt die Kinderärztin oder der Kinderarzt.
              </div>
            </>
          ) : (
            <>
              <div className="tile__value" style={{ fontSize: 18 }}>Noch nicht genug Historie</div>
              <p className="tile__meta">
                Sobald Einträge aus dem Vorjahreszeitraum vorliegen, erscheint hier der
                Vergleich — die Funktion, die kurzlebige Baby-Tracker nicht liefern können.
              </p>
            </>
          )}
        </div>
      </section>

      {stats.topSymptoms.length > 0 && (
        <section className="section">
          <div className="section__title">Häufigste Symptome</div>
          <div className="list">
            {stats.topSymptoms.map((s) => (
              <div key={s.code} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">{s.label}</div>
                  <div className="list-item__meta">an {plural(s.days, 'Tag', 'Tagen')} erfasst</div>
                </div>
                <div
                  aria-hidden
                  style={{
                    width: `${Math.max(8, (s.days / stats.topSymptoms[0].days) * 90)}px`,
                    height: 10,
                    borderRadius: 5,
                    background: 'var(--accent)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">Schlaf und Krankheitstage</div>
        <div className="tile tile--wide">
          <SleepIllnessStrips data={sleepData} />
          <div className="note note--muted" style={{ marginTop: 'var(--space-3)' }}>
            Zwei Zeitreihen nebeneinander, letzte 60 Tage. Bewusst ohne automatische
            Zusammenhangs-Aussage: Aus dieser Datenmenge lässt sich kein belastbarer
            Zusammenhang ableiten.
          </div>
        </div>
      </section>

      {hasModule(child, 'growth') && (
        <section className="section">
          <div className="section__title">Wachstum</div>
          <div className="tile tile--wide">
            <div className="tile__value">{weightNarrative.headline}</div>
            <p className="tile__meta">{weightNarrative.detail}</p>
            {weightPoints.length > 0 && ageMonths <= 24 && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <GrowthChart child={child} kind="weight" points={weightPoints} />
              </div>
            )}
            {heightPoints.length > 0 && ageMonths <= 24 && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div className="tile__label">Größe</div>
                <GrowthChart child={child} kind="height" points={heightPoints} />
              </div>
            )}

            <div className="row" style={{ marginTop: 'var(--space-3)' }}>
              <select
                className="select"
                style={{ maxWidth: 140 }}
                value={measure.kind}
                onChange={(e) => setMeasure({ ...measure, kind: e.target.value as typeof measure.kind })}
                aria-label="Art der Messung"
              >
                <option value="weight">Gewicht (kg)</option>
                <option value="height">Größe (cm)</option>
                <option value="headCirc">Kopfumfang (cm)</option>
              </select>
              <input
                className="input tabular"
                inputMode="decimal"
                placeholder="Wert"
                value={measure.value}
                onChange={(e) => setMeasure({ ...measure, value: e.target.value })}
                aria-label="Messwert"
              />
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={!Number.parseFloat(measure.value.replace(',', '.'))}
                onClick={() => {
                  const value = Number.parseFloat(measure.value.replace(',', '.'));
                  if (!Number.isFinite(value)) return;
                  addMeasurement({
                    childId: child.id,
                    at: new Date().toISOString(),
                    kind: measure.kind,
                    value,
                  });
                  setMeasure({ ...measure, value: '' });
                }}
              >
                Speichern
              </button>
            </div>

            <div className="note note--warn" style={{ marginTop: 'var(--space-3)' }}>
              Referenzkurven sind Näherungswerte ({GROWTH_DATA_VERSION}) und nur bis 24 Monate
              hinterlegt. Für Kopfumfang liegt im Prototyp keine Kurve vor. Die App zeigt den
              Verlauf, sie bewertet ihn nicht.
            </div>
          </div>
        </section>
      )}

      {relevantMilestones.length > 0 && (
        <section className="section">
          <div className="section__title">Meilensteine</div>
          <div className="list">
            {relevantMilestones.map((m) => {
              const record = achieved.get(m.code);
              return (
                <div key={m.code} className="list-item">
                  <div className="list-item__main">
                    <div className="list-item__title">
                      {record ? '✓ ' : ''}
                      {m.label}
                    </div>
                    <div className="list-item__meta">
                      übliche Spanne {m.fromMonths}–{m.toMonths} Monate
                      {record && ` · erreicht ${formatDateShort(record.achievedDate)}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    onClick={() =>
                      record
                        ? removeMilestone(record.id)
                        : addMilestone({ childId: child.id, milestoneCode: m.code, achievedDate: todayISO() })
                    }
                  >
                    {record ? 'Zurück' : 'Erreicht'}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="note note--muted" style={{ marginTop: 'var(--space-2)' }}>
            Die Spannen sind Orientierung, keine Bewertung. Die App markiert nichts als
            „verspätet".
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__title">Export</div>
        <div className="stack">
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => openDoctorSummary(state, child, from, to)}
          >
            Arzt-Zusammenfassung öffnen ({RANGE_LABEL[range]})
          </button>
          <button type="button" className="btn btn--block" onClick={() => exportCsv(state, child)}>
            Alle Einträge als CSV
          </button>
          <button type="button" className="btn btn--block" onClick={() => exportFullJson(state)}>
            Vollständiger Datenexport (JSON)
          </button>
          <p className="small muted">
            Die Zusammenfassung wird auf dem Gerät erzeugt und im Druckdialog des Browsers zu
            PDF. Es werden keine Daten an einen Server gesendet. Der Vollexport nach DSGVO
            Art. 20 ist dauerhaft kostenlos.
          </p>
        </div>
      </section>
    </>
  );
}
