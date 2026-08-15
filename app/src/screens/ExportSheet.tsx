import { useState } from 'react';
import { curveFor, referenceById } from '../data/growthReferences';
import { useI18n } from '../i18n';
import { addDays, ageInMonths, formatDateShort, todayISO } from '../domain/dates';
import { openPdf } from '../domain/export';
import {
  formatNumber,
  lengthToDisplay,
  weightToDisplay,
} from '../domain/units';
import { useStore } from '../store/store';
import type { Child, MeasurementKind } from '../domain/types';
import { Sheet } from '../ui/Sheet';
import { buildGrowthChartSvg } from '../ui/GrowthChart';

/** PDF-Zusammenstellung (Abschnitt 4.5). Der Nutzer wählt Zeitraum und Bausteine. */
export function ExportSheet({ child, onClose }: { child: Child; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { state } = useStore();

  const [from, setFrom] = useState(() => addDays(todayISO(), -90));
  const [to, setTo] = useState(todayISO());
  const [includeEntries, setIncludeEntries] = useState(true);
  const [includeMeasurements, setIncludeMeasurements] = useState(true);
  const [includeChart, setIncludeChart] = useState(true);
  const [includeVaccinations, setIncludeVaccinations] = useState(true);

  const { weightUnit, lengthUnit, pro } = state.settings;

  const chartSvg = (): string | undefined => {
    if (!includeChart) return undefined;
    const reference = referenceById(state.settings.growthReferenceId);
    const kind: MeasurementKind = 'weight';
    const curve = curveFor(reference, kind, child.sex);
    if (!curve) return undefined;
    const measurements = state.measurements
      .filter((m) => m.childId === child.id && m.kind === kind)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (measurements.length === 0) return undefined;
    const toDisplay = (v: number) =>
      kind === 'weight' ? weightToDisplay(v, weightUnit) : lengthToDisplay(v, lengthUnit);
    return buildGrowthChartSvg({
      curve,
      unit: weightUnit,
      toDisplay,
      ariaLabel: 'Perzentildiagramm',
      points: measurements.map((m) => ({
        ageMonths: ageInMonths(child.birthDate, m.date),
        value: m.value,
        label: `${formatDateShort(m.date, locale)}: ${formatNumber(toDisplay(m.value))} ${weightUnit}`,
      })),
    });
  };

  const toggles: [string, boolean, (v: boolean) => void][] = [
    [t('exportIncludeEntries'), includeEntries, setIncludeEntries],
    [t('exportIncludeMeasurements'), includeMeasurements, setIncludeMeasurements],
    [t('exportIncludeChart'), includeChart, setIncludeChart],
    [t('exportIncludeVaccinations'), includeVaccinations, setIncludeVaccinations],
  ];

  return (
    <Sheet open onClose={onClose} title={t('exportTitle')}>
      <div className="field">
        <span className="field__label">{t('exportRange')}</span>
        <div className="row">
          <input
            className="input"
            type="date"
            value={from}
            max={to}
            aria-label={t('filterFrom')}
            onChange={(e) => setFrom(e.target.value)}
          />
          <input
            className="input"
            type="date"
            value={to}
            max={todayISO()}
            aria-label={t('filterTo')}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <span className="field__label">{t('exportInclude')}</span>
        <div className="stack" style={{ gap: 'var(--space-2)' }}>
          {toggles.map(([label, checked, set]) => (
            <label key={label} className="row" style={{ gap: 'var(--space-2)' }}>
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => set(e.target.checked)}
                style={{ width: 22, height: 22 }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {!pro && (
        <div className="note note--info" style={{ marginBottom: 'var(--space-4)' }}>
          {t('exportWatermark')} — {t('proBody')}
        </div>
      )}

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => {
          openPdf(state, child, {
            from,
            to,
            includeEntries,
            includeMeasurements,
            includeChart,
            includeVaccinations,
            watermark: !pro,
            chartSvg: chartSvg(),
          });
          onClose();
        }}
      >
        {t('exportOpen')}
      </button>
      <p className="small muted" style={{ marginTop: 'var(--space-3)' }}>{t('exportHint')}</p>
    </Sheet>
  );
}
