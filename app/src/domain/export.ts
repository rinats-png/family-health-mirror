import { referenceById } from '../data/growthReferences';
import { translate } from '../i18n';
import { categoryLabel } from './categories';
import { dayOf, formatDateShort, formatTime, todayISO } from './dates';
import type { AppState, Child, ISODate, Locale, MeasurementKind } from './types';
import { celsiusToDisplay, formatNumber, valueToDisplay } from './units';

/**
 * Export (Aufgabenstellung Abschnitt 4.5).
 *
 * Das PDF ist eine reine Wiedergabe der Rohdaten: Tabellen dessen, was der
 * Nutzer eingetragen hat. Es enthält keine Zusammenfassung, keine Kennzahlen,
 * keine Hervorhebung einzelner Werte und keine Sortierung nach Auffälligkeit.
 * Die Kopfzeile weist das Dokument ausdrücklich als elterngeführt aus.
 */

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** DSGVO Art. 20 — vollständige Ausgabe aller gespeicherten Daten. */
export function exportJson(state: AppState): void {
  download(
    `gesundheitstagebuch-${todayISO()}.json`,
    JSON.stringify({ exportedAt: new Date().toISOString(), schemaVersion: state.schemaVersion, state }, null, 2),
    'application/json',
  );
}

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCsv(state: AppState, child: Child): void {
  const { locale, temperatureUnit, weightUnit, lengthUnit } = state.settings;
  const rows: string[][] = [
    ['Datum', 'Uhrzeit', 'Art', 'Kategorien', 'Temperatur', 'Medikament', 'Menge', 'Tags', 'Notiz'],
  ];

  state.entries
    .filter((e) => e.childId === child.id)
    .sort((a, b) => a.at.localeCompare(b.at))
    .forEach((e) =>
      rows.push([
        formatDateShort(dayOf(e.at), locale),
        formatTime(e.at),
        'Eintrag',
        e.categoryIds
          .map((id) => {
            const c = state.categories.find((x) => x.id === id);
            return c ? categoryLabel(c, locale) : '';
          })
          .filter(Boolean)
          .join(', '),
        e.temperature != null
          ? `${formatNumber(celsiusToDisplay(e.temperature, e.temperatureUnit ?? temperatureUnit))} °${e.temperatureUnit ?? temperatureUnit}`
          : '',
        e.medication?.name ?? '',
        e.medication?.amount ?? '',
        e.tags.join(', '),
        e.note ?? '',
      ]),
    );

  state.measurements
    .filter((m) => m.childId === child.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((m) =>
      rows.push([
        formatDateShort(m.date, locale),
        '',
        'Messwert',
        measurementLabel(m.kind, locale),
        `${formatNumber(valueToDisplay(m.kind, m.value, weightUnit, lengthUnit))} ${m.kind === 'weight' ? weightUnit : lengthUnit}`,
        '', '', '', '',
      ]),
    );

  state.vaccinations
    .filter((v) => v.childId === child.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((v) =>
      rows.push([
        formatDateShort(v.date, locale), '', 'Impfung', v.name, '', '', '',
        v.batch ?? '', [v.practice, v.note].filter(Boolean).join(' · '),
      ]),
    );

  download(
    `gesundheitstagebuch-${child.name}-${todayISO()}.csv`,
    '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n'),
    'text/csv',
  );
}

export function measurementLabel(kind: MeasurementKind, locale: Locale): string {
  return translate(
    locale,
    kind === 'weight' ? 'kindWeight' : kind === 'length' ? 'kindLength' : 'kindHead',
  );
}

export interface PdfOptions {
  from: ISODate;
  to: ISODate;
  includeEntries: boolean;
  includeMeasurements: boolean;
  includeChart: boolean;
  includeVaccinations: boolean;
  /** Wasserzeichen in der kostenlosen Version (Abschnitt 10). */
  watermark: boolean;
  /** Optionales, bereits gerendertes Diagramm als SVG-Markup. */
  chartSvg?: string;
}

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

export function openPdf(state: AppState, child: Child, options: PdfOptions): void {
  const { locale, weightUnit, lengthUnit, temperatureUnit } = state.settings;
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);
  const inRange = (d: ISODate) => d >= options.from && d <= options.to;

  const entries = state.entries
    .filter((e) => e.childId === child.id && inRange(dayOf(e.at)))
    .sort((a, b) => a.at.localeCompare(b.at));
  const measurements = state.measurements
    .filter((m) => m.childId === child.id && inRange(m.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const vaccinations = state.vaccinations
    .filter((v) => v.childId === child.id)
    .sort((a, b) => a.date.localeCompare(b.date));
  const reference = referenceById(state.settings.growthReferenceId);

  const categoryNames = (ids: string[]) =>
    ids
      .map((id) => {
        const c = state.categories.find((x) => x.id === id);
        return c ? `${c.icon} ${categoryLabel(c, locale)}` : '';
      })
      .filter(Boolean)
      .join(', ');

  const entriesTable = `
    <h2>${esc(t('exportIncludeEntries'))}</h2>
    ${
      entries.length === 0
        ? `<p class="muted">${esc(t('noEntriesYet'))}</p>`
        : `<table>
      <thead><tr>
        <th>${esc(t('date'))}</th><th>${esc(t('time'))}</th>
        <th>${esc(t('entryCategories'))}</th><th>${esc(t('entryTemperature'))}</th>
        <th>${esc(t('entryMedication'))}</th><th>${esc(t('tags'))}</th><th>${esc(t('notes'))}</th>
      </tr></thead>
      <tbody>${entries
        .map(
          (e) => `<tr>
            <td>${esc(formatDateShort(dayOf(e.at), locale))}</td>
            <td>${esc(formatTime(e.at))}</td>
            <td>${esc(categoryNames(e.categoryIds))}</td>
            <td>${
              e.temperature != null
                ? esc(
                    `${formatNumber(celsiusToDisplay(e.temperature, e.temperatureUnit ?? temperatureUnit))} °${e.temperatureUnit ?? temperatureUnit}`,
                  )
                : ''
            }</td>
            <td>${esc([e.medication?.name, e.medication?.amount].filter(Boolean).join(' · '))}</td>
            <td>${esc(e.tags.join(', '))}</td>
            <td>${esc(e.note ?? '')}</td>
          </tr>`,
        )
        .join('')}</tbody></table>`
    }`;

  const measurementsTable = `
    <h2>${esc(t('exportIncludeMeasurements'))}</h2>
    ${
      measurements.length === 0
        ? `<p class="muted">${esc(t('noMeasurements'))}</p>`
        : `<table>
      <thead><tr><th>${esc(t('date'))}</th><th>${esc(t('measurementsTitle'))}</th><th>${esc(t('name'))}</th></tr></thead>
      <tbody>${measurements
        .map(
          (m) => `<tr>
            <td>${esc(formatDateShort(m.date, locale))}</td>
            <td>${esc(measurementLabel(m.kind, locale))}</td>
            <td>${esc(
              `${formatNumber(valueToDisplay(m.kind, m.value, weightUnit, lengthUnit))} ${m.kind === 'weight' ? weightUnit : lengthUnit}`,
            )}</td>
          </tr>`,
        )
        .join('')}</tbody></table>`
    }`;

  const vaccinationsTable = `
    <h2>${esc(t('vaccinationsTitle'))}</h2>
    ${
      vaccinations.length === 0
        ? `<p class="muted">${esc(t('vaccinationNone'))}</p>`
        : `<table>
      <thead><tr>
        <th>${esc(t('date'))}</th><th>${esc(t('vaccinationName'))}</th>
        <th>${esc(t('vaccinationBatch'))}</th><th>${esc(t('vaccinationPractice'))}</th><th>${esc(t('notes'))}</th>
      </tr></thead>
      <tbody>${vaccinations
        .map(
          (v) => `<tr>
            <td>${esc(formatDateShort(v.date, locale))}</td>
            <td>${esc(v.name)}</td>
            <td>${esc(v.batch ?? '')}</td>
            <td>${esc(v.practice ?? '')}</td>
            <td>${esc(v.note ?? '')}</td>
          </tr>`,
        )
        .join('')}</tbody></table>`
    }`;

  const chartBlock =
    options.includeChart && options.chartSvg
      ? `<h2>${esc(t('exportIncludeChart'))}</h2>
         <p class="muted small">${esc(reference.label[locale])} — ${esc(reference.source)}</p>
         <div class="chart">${options.chartSvg}</div>
         <p class="muted small">${esc(t('referenceHint'))}</p>`
      : '';

  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8">
<title>${esc(child.name)} — ${esc(t('appName'))}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font: 10.5pt/1.45 -apple-system, "Segoe UI", Roboto, sans-serif; color: #1a1a1a; margin: 0; }
  header { border-bottom: 2px solid #333; padding-bottom: 3mm; margin-bottom: 5mm; }
  .banner { font-weight: 700; font-size: 9.5pt; letter-spacing: .02em; }
  h1 { font-size: 15pt; margin: 2mm 0 1mm; }
  h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: .07em;
       margin: 7mm 0 2mm; padding-top: 2mm; border-top: 1px solid #bbb; }
  .sub { color: #444; font-size: 9.5pt; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  th { text-align: left; font-size: 8.5pt; color: #444; border-bottom: 1px solid #888;
       padding: 1mm 2mm 1mm 0; }
  td { padding: 1.2mm 2mm 1.2mm 0; border-bottom: 1px solid #e2e2e2; vertical-align: top; }
  .muted { color: #555; }
  .small { font-size: 8.5pt; }
  .chart { max-width: 150mm; }
  footer { margin-top: 8mm; border-top: 1px solid #888; padding-top: 2mm;
           font-size: 8pt; color: #444; }
  ${
    options.watermark
      ? `body::before { content: "${esc(t('exportWatermark'))}"; position: fixed;
          top: 45%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg);
          font-size: 54pt; color: rgba(0,0,0,.07); font-weight: 800;
          letter-spacing: .06em; pointer-events: none; z-index: 0; }`
      : ''
  }
  .noprint { position: fixed; bottom: 12px; right: 12px; }
  .noprint button { font: inherit; padding: 10px 16px; border-radius: 8px; cursor: pointer;
                    border: 1px solid #333; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
  @media print { .noprint { display: none; } }
</style></head><body>
<div class="noprint"><button onclick="window.print()">${esc(t('exportPrint'))}</button></div>
<header>
  <div class="banner">${esc(t('exportHeader'))}</div>
  <h1>${esc(child.name)}</h1>
  <div class="sub">
    ${esc(t('obBirthLabel'))}: ${esc(formatDateShort(child.birthDate, locale))} ·
    ${esc(t('exportRange'))}: ${esc(formatDateShort(options.from, locale))} – ${esc(formatDateShort(options.to, locale))}
  </div>
</header>
${options.includeEntries ? entriesTable : ''}
${options.includeMeasurements ? measurementsTable : ''}
${chartBlock}
${options.includeVaccinations ? vaccinationsTable : ''}
<footer>
  ${esc(t('purposeShort'))}<br>
  ${esc(t('appName'))} · ${esc(formatDateShort(todayISO(), locale))}
</footer>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert(t('exportHint'));
    return;
  }
  win.document.write(html);
  win.document.close();
}
