import { useMemo, useState } from 'react';
import {
  GROWTH_REFERENCES,
  curveFor,
  isReferenceUsable,
  referenceById,
} from '../data/growthReferences';
import { useI18n } from '../i18n';
import { ageInMonths, formatDateShort, todayISO } from '../domain/dates';
import { measurementLabel } from '../domain/export';
import { formatPercentile, percentileOf } from '../domain/percentile';
import {
  formatNumber,
  lengthToDisplay,
  parseDecimal,
  valueFromInput,
  weightToDisplay,
} from '../domain/units';
import { useActions, useStore } from '../store/store';
import type { Child, Measurement, MeasurementKind } from '../domain/types';
import { DateField } from '../ui/DateField';
import { Sheet } from '../ui/Sheet';
import { GrowthChart, type ChartPoint } from '../ui/GrowthChart';

const KINDS: MeasurementKind[] = ['weight', 'length', 'headCircumference'];

/**
 * Messwerte und Perzentilendarstellung (Abschnitt 4.3).
 *
 * Die Anwendung zeichnet den Wert ein, beschriftet die Kurvenlinien und nennt
 * auf Wunsch den nackten Perzentilwert. Sie sagt nicht, was der Wert bedeutet.
 * Der Hinweistext unter dem Diagramm steht fest und lässt sich nicht abschalten.
 */
export function Measurements({ child }: { child: Child }) {
  const { t, locale } = useI18n();
  const { state, updateSettings } = useStore();
  const { addMeasurement, updateMeasurement, removeMeasurement } = useActions();

  const [kind, setKind] = useState<MeasurementKind>('weight');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(todayISO());
  const [editing, setEditing] = useState<Measurement | null>(null);

  const { weightUnit, lengthUnit, pro } = state.settings;
  const reference = referenceById(state.settings.growthReferenceId);
  const curve = curveFor(reference, kind, child.sex);

  const measurements = useMemo(
    () =>
      state.measurements
        .filter((m) => m.childId === child.id && m.kind === kind)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [state.measurements, child.id, kind],
  );

  const unit = kind === 'weight' ? weightUnit : lengthUnit;
  const toDisplay = (v: number) =>
    kind === 'weight' ? weightToDisplay(v, weightUnit) : lengthToDisplay(v, lengthUnit);

  const points: ChartPoint[] = measurements.map((m) => ({
    ageMonths: ageInMonths(child.birthDate, m.date),
    value: m.value,
    label: `${formatDateShort(m.date, locale)}: ${formatNumber(toDisplay(m.value))} ${unit}`,
  }));

  const latest = measurements[measurements.length - 1];
  const latestPercentile =
    curve && latest
      ? formatPercentile(
          percentileOf(curve, ageInMonths(child.birthDate, latest.date), latest.value),
        )
      : undefined;

  const submit = () => {
    const parsed = parseDecimal(value);
    if (parsed == null) return;
    addMeasurement({
      childId: child.id,
      date,
      kind,
      value: valueFromInput(kind, parsed, weightUnit, lengthUnit),
    });
    setValue('');
  };

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">{t('measurementsTitle')}</h1>
        <div className="screen-sub">{child.name}</div>
      </div>

      <div className="seg">
        {KINDS.map((k) => (
          <button key={k} type="button" className="seg__item" aria-pressed={kind === k}
            onClick={() => setKind(k)}>
            {measurementLabel(k, locale)}
          </button>
        ))}
      </div>

      <section className="section">
        <div className="section__title">{t('addMeasurement')}</div>
        <div className="tile tile--wide">
          <div className="row">
            <input
              className="input tabular"
              inputMode="decimal"
              placeholder={unit}
              aria-label={measurementLabel(kind, locale)}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
            />
            <span className="tile__value" style={{ margin: 0, fontSize: 17 }}>{unit}</span>
          </div>
          <DateField
            style={{ marginTop: 'var(--space-2)' }}
            value={date}
            min={child.birthDate}
            max={todayISO()}
            label={t('date')}
            onCommit={setDate}
          />
          <button
            type="button"
            className="btn btn--primary btn--block"
            style={{ marginTop: 'var(--space-3)' }}
            disabled={parseDecimal(value) == null}
            onClick={submit}
          >
            {t('save')}
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section__title">{reference.label[locale]}</div>
        <div className="tile tile--wide">
          {!child.sex && (
            <div className="note note--muted" style={{ marginBottom: 'var(--space-3)' }}>
              {t('sexNeeded')}
            </div>
          )}
          {curve ? (
            <>
              <GrowthChart
                curve={curve}
                points={points}
                unit={unit}
                toDisplay={toDisplay}
                ariaLabel={`${measurementLabel(kind, locale)} — ${reference.label[locale]}`}
              />
              {latest && (
                <p className="tile__meta" style={{ marginTop: 'var(--space-2)' }}>
                  {formatDateShort(latest.date, locale)}:{' '}
                  <strong className="tabular">
                    {formatNumber(toDisplay(latest.value))} {unit}
                  </strong>
                  {latestPercentile
                    ? ` · ${t('percentileLabel')}: ${latestPercentile} (${reference.label[locale]})`
                    : ` · ${t('percentileOutOfRange')}`}
                </p>
              )}
            </>
          ) : (
            <div className="note note--muted">{t('measurementsOutsideRange')}</div>
          )}
          {/* Fester Hinweistext, Abschnitt 4.3 */}
          <p className="small muted" style={{ marginTop: 'var(--space-3)' }}>
            {t('referenceHint')}
          </p>
          {!reference.verified && (
            <div className="note note--warn" style={{ marginTop: 'var(--space-3)' }}>
              Prototyp: Die Kurvenwerte sind ungeprüfte Näherungen und vor einer Auslieferung
              durch die amtlichen Tabellen zu ersetzen.
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('referenceSystem')}</div>
        <div className="stack">
          {GROWTH_REFERENCES.map((ref) => {
            const usable = isReferenceUsable(ref);
            const locked = ref.proOnly && !pro;
            const disabled = !usable || locked;
            return (
              <button
                key={ref.id}
                type="button"
                className="list-item"
                aria-pressed={state.settings.growthReferenceId === ref.id}
                disabled={disabled}
                style={
                  state.settings.growthReferenceId === ref.id
                    ? { borderColor: 'var(--action)', borderWidth: 2 }
                    : undefined
                }
                onClick={() => updateSettings({ growthReferenceId: ref.id })}
              >
                <div className="list-item__main">
                  <div className="list-item__title">
                    {ref.label[locale]}
                    {ref.proOnly && <span className="pro-badge" style={{ marginLeft: 6 }}>Pro</span>}
                  </div>
                  <div className="list-item__meta">{ref.source}</div>
                  {ref.license === 'unresolved' && (
                    <div className="list-item__meta">
                      {t('referenceLicenseOpen')} — {ref.licenseNote?.[locale]}
                    </div>
                  )}
                  {ref.license !== 'unresolved' && !ref.curves && (
                    <div className="list-item__meta">
                      {t('referenceUnavailable')}
                      {ref.licenseNote ? ` — ${ref.licenseNote[locale]}` : ''}
                    </div>
                  )}
                  {locked && usable && (
                    <div className="list-item__meta">{t('referenceProOnly')}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__title">{measurementLabel(kind, locale)}</div>
        {measurements.length === 0 ? (
          <div className="empty">{t('noMeasurements')}</div>
        ) : (
          <div className="list">
            {[...measurements].reverse().map((m) => (
              <div key={m.id} className="list-item">
                <button
                  type="button"
                  className="list-item__main"
                  style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                  aria-label={`${t('measurementEdit')}: ${formatDateShort(m.date, locale)}`}
                  onClick={() => setEditing(m)}
                >
                  <div className="list-item__title tabular">
                    {formatNumber(toDisplay(m.value))} {unit}
                  </div>
                  <div className="list-item__meta">{formatDateShort(m.date, locale)}</div>
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label={`${t('delete')}: ${formatDateShort(m.date, locale)}`}
                  onClick={() => removeMeasurement(m.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <MeasurementSheet
          measurement={editing}
          child={child}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateMeasurement(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

/** Bearbeiten eines bereits eingetragenen Messwerts: Wert und Datum. */
function MeasurementSheet({
  measurement,
  child,
  onClose,
  onSave,
}: {
  measurement: Measurement;
  child: Child;
  onClose: () => void;
  onSave: (patch: Partial<Measurement>) => void;
}) {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const { weightUnit, lengthUnit } = state.settings;
  const unit = measurement.kind === 'weight' ? weightUnit : lengthUnit;
  const shown =
    measurement.kind === 'weight'
      ? weightToDisplay(measurement.value, weightUnit)
      : lengthToDisplay(measurement.value, lengthUnit);

  const [value, setValue] = useState(formatNumber(shown));
  const [date, setDate] = useState(measurement.date);
  const parsed = parseDecimal(value);

  return (
    <Sheet open onClose={onClose} title={t('measurementEdit')}>
      <div className="field">
        <label className="field__label" htmlFor="ms-value">
          {measurementLabel(measurement.kind, locale)} ({unit})
        </label>
        <input
          id="ms-value"
          className="input tabular"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field__label" htmlFor="ms-date">{t('date')}</label>
        <DateField
          id="ms-date"
          value={date}
          min={child.birthDate}
          max={todayISO()}
          onCommit={setDate}
        />
      </div>
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={parsed == null}
        onClick={() =>
          onSave({
            date,
            value: valueFromInput(measurement.kind, parsed!, weightUnit, lengthUnit),
          })
        }
      >
        {t('save')}
      </button>
    </Sheet>
  );
}
