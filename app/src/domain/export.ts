import { CHECKUPS_VERSION } from '../data/checkups';
import { GROWTH_DATA_VERSION } from '../data/growth';
import { VACCINE_SCHEDULE } from '../data/stiko';
import { periodStats } from './analytics';
import { symptomLabel, tempMethodLabel } from './catalog';
import { dayOf, formatAge, formatDateShort, formatTime, todayISO } from './dates';
import { buildEpisodes } from './episodes';
import { buildVaccinationPlan } from './schedule';
import type { AppState, Child, ISODate } from './types';

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

/**
 * DSGVO Art. 20 — vollständiger Datenexport, kostenlos und ohne Hürde
 * (PRD E-03, §5.6). Bewusst auch in der Free-Version.
 */
export function exportFullJson(state: AppState): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'KinderGesundheit+ (Prototyp)',
    dataVersions: {
      vaccineSchedule: VACCINE_SCHEDULE.version,
      checkups: CHECKUPS_VERSION,
      growth: GROWTH_DATA_VERSION,
    },
    state,
  };
  download(
    `kindergesundheit-export-${todayISO()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  );
}

function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Einfacher Listen-Export (PRD E-01). Semikolon, damit Excel-DE es direkt öffnet. */
export function exportCsv(state: AppState, child: Child): void {
  const rows: string[][] = [
    ['Datum', 'Uhrzeit', 'Typ', 'Details', 'Temperatur °C', 'Messmethode', 'Notiz'],
  ];

  state.entries
    .filter((e) => e.childId === child.id && !e.deleted)
    .forEach((e) =>
      rows.push([
        formatDateShort(dayOf(e.at)),
        formatTime(e.at),
        'Symptom',
        e.symptoms.map((s) => `${symptomLabel(s.code)} (${s.severity})`).join(', '),
        e.temperature != null ? e.temperature.toFixed(1) : '',
        e.temperature != null ? tempMethodLabel(e.tempMethod) : '',
        e.note ?? '',
      ]),
    );

  state.medications
    .filter((m) => m.childId === child.id && !m.deleted)
    .forEach((m) =>
      rows.push([formatDateShort(dayOf(m.at)), formatTime(m.at), 'Medikament', `${m.name} ${m.dose}`, '', '', '']),
    );

  state.measurements
    .filter((m) => m.childId === child.id && !m.deleted)
    .forEach((m) => {
      const kindLabel = { weight: 'Gewicht', height: 'Größe', headCirc: 'Kopfumfang' }[m.kind];
      const unit = m.kind === 'weight' ? 'kg' : 'cm';
      rows.push([
        formatDateShort(dayOf(m.at)), formatTime(m.at), 'Messung',
        `${kindLabel}: ${m.value} ${unit}`, '', '', '',
      ]);
    });

  state.vaccinations
    .filter((v) => v.childId === child.id && !v.deleted)
    .forEach((v) => {
      const dose = VACCINE_SCHEDULE.doses.find((d) => d.vaccineCode === v.vaccineCode);
      rows.push([
        formatDateShort(v.date), '', 'Impfung',
        `${dose?.label ?? v.vaccineCode} (Dosis ${v.doseNumber})`, '', '', v.batch ?? '',
      ]);
    });

  rows
    .slice(1)
    .sort((a, b) => a[0].split('.').reverse().join().localeCompare(b[0].split('.').reverse().join()));

  download(
    `kindergesundheit-${child.name}-${todayISO()}.csv`,
    '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n'),
    'text/csv',
  );
}

/**
 * Arzt-Zusammenfassung (PRD E-02, §4.5).
 *
 * Kernseite auf einer Seite A4, in 15 Sekunden erfassbar, druckbar in
 * Graustufen. Wird als eigenes Fenster geöffnet und über den Druckdialog
 * des Browsers zu PDF — so verlassen die Daten das Gerät nicht.
 */
export function openDoctorSummary(state: AppState, child: Child, from: ISODate, to: ISODate): void {
  const stats = periodStats(state.entries, child.id, from, to);
  const episodes = buildEpisodes(state.entries, child.id).filter(
    (ep) => dayOf(ep.end) >= from && dayOf(ep.start) <= to,
  );
  const meds = state.medications.filter(
    (m) => m.childId === child.id && !m.deleted && dayOf(m.at) >= from && dayOf(m.at) <= to,
  );
  const plan = buildVaccinationPlan(child, state.vaccinations);
  const openVaccines = plan.filter((p) => p.status === 'due' || p.status === 'overdue');
  const doneVaccines = plan.filter((p) => p.status === 'done');
  const temps = state.entries
    .filter((e) => e.childId === child.id && !e.deleted && e.temperature != null)
    .filter((e) => dayOf(e.at) >= from && dayOf(e.at) <= to)
    .map((e) => ({ at: e.at, v: e.temperature! }))
    .sort((a, b) => a.at.localeCompare(b.at));

  const chart = temperatureChartSvg(temps);
  const esc = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] ?? c);

  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>Zusammenfassung ${esc(child.name)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  body { font: 11pt/1.45 -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 15pt; margin: 0 0 2mm; }
  h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: .06em;
       border-top: 1px solid #999; padding-top: 2mm; margin: 5mm 0 2mm; }
  .sub { color: #444; font-size: 10pt; margin-bottom: 4mm; }
  .grid { display: flex; gap: 8mm; flex-wrap: wrap; }
  .kpi { min-width: 32mm; }
  .kpi b { display: block; font-size: 16pt; line-height: 1.1; }
  .kpi span { font-size: 9pt; color: #444; }
  table { width: 100%; border-collapse: collapse; font-size: 10pt; }
  td, th { text-align: left; padding: 1.2mm 2mm 1.2mm 0; vertical-align: top; }
  tr + tr td { border-top: 1px solid #ddd; }
  th { font-weight: 600; font-size: 9pt; color: #444; }
  footer { margin-top: 6mm; border-top: 1px solid #999; padding-top: 2mm;
           font-size: 8.5pt; color: #444; }
  .muted { color: #555; }
  @media print { .noprint { display: none; } }
  /* Unten rechts, damit der Kopf der Seite frei bleibt. */
  .noprint { position: fixed; bottom: 12px; right: 12px; }
  button { font: inherit; padding: 10px 16px; cursor: pointer; border-radius: 8px;
           border: 1px solid #333; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Drucken / als PDF sichern</button></div>

<h1>${esc(child.name)} · geb. ${formatDateShort(child.birthDate)} (${formatAge(child.birthDate)})</h1>
<div class="sub">Zeitraum: ${formatDateShort(from)} – ${formatDateShort(to)}${
    child.allergies.length ? ` · Allergien: ${esc(child.allergies.join(', '))}` : ' · Allergien: keine erfasst'
  }</div>

<h2>Zusammenfassung</h2>
<div class="grid">
  <div class="kpi"><b>${stats.episodeCount}</b><span>Krankheitsepisoden</span></div>
  <div class="kpi"><b>${stats.sickDays}</b><span>Krankheitstage</span></div>
  <div class="kpi"><b>${stats.feverDays}</b><span>Fiebertage</span></div>
  <div class="kpi"><b>${stats.maxTemp != null ? stats.maxTemp.toFixed(1) + ' °C' : '—'}</b><span>höchste Messung</span></div>
</div>

${temps.length > 1 ? `<h2>Temperaturverlauf</h2>${chart}` : ''}

<h2>Episoden</h2>
${
  episodes.length === 0
    ? '<p class="muted">Keine Episoden im Zeitraum.</p>'
    : `<table><tr><th>Zeitraum</th><th>Tage</th><th>Symptome</th><th>Max. Temp.</th></tr>${episodes
        .map(
          (ep) => `<tr><td>${formatDateShort(dayOf(ep.start))} – ${formatDateShort(dayOf(ep.end))}</td>
        <td>${ep.dayCount}</td>
        <td>${esc(ep.symptomCodes.map(symptomLabel).join(', ') || '—')}</td>
        <td>${ep.maxTemp != null ? ep.maxTemp.toFixed(1) + ' °C' : '—'}</td></tr>`,
        )
        .join('')}</table>`
}

<h2>Medikamente im Zeitraum</h2>
${
  meds.length === 0
    ? '<p class="muted">Keine Gaben dokumentiert.</p>'
    : `<table><tr><th>Präparat</th><th>Dosis</th><th>Gaben</th><th>Letzte Gabe</th></tr>${Object.entries(
        meds.reduce<Record<string, typeof meds>>((acc, m) => {
          (acc[`${m.name}|${m.dose}`] ??= []).push(m);
          return acc;
        }, {}),
      )
        .map(([key, list]) => {
          const [name, dose] = key.split('|');
          const last = list.map((l) => l.at).sort().pop()!;
          return `<tr><td>${esc(name)}</td><td>${esc(dose)}</td><td>${list.length}×</td><td>${formatDateShort(dayOf(last))}</td></tr>`;
        })
        .join('')}</table>`
}

<h2>Impfstatus nach Elternangabe</h2>
<p>${doneVaccines.length} dokumentierte Impfungen.${
    openVaccines.length
      ? ` Nach dem hinterlegten Plan offen: ${esc(
          openVaccines.map((v) => `${v.dose.label} (${v.dose.doseNumber})`).join(', '),
        )}.`
      : ' Nach dem hinterlegten Plan aktuell nichts offen.'
  }</p>

<footer>
Von den Eltern dokumentierte Angaben, keine ärztliche Erhebung. Temperaturangaben ohne
einheitliche Messmethode. Impfplan-Datensatz: ${esc(VACCINE_SCHEDULE.version)} —
${esc(VACCINE_SCHEDULE.sourceLabel)}.<br>
Erstellt mit KinderGesundheit+ (Prototyp) am ${formatDateShort(todayISO())}.
</footer>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Bitte Pop-ups für diese Seite erlauben, damit die Zusammenfassung geöffnet werden kann.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

/** Kleine Inline-SVG-Kurve für die Druckseite — keine externe Bibliothek. */
function temperatureChartSvg(points: { at: string; v: number }[]): string {
  if (points.length < 2) return '';
  const w = 520;
  const h = 120;
  const pad = { l: 26, r: 6, t: 8, b: 16 };
  const min = 36;
  const max = Math.max(40.5, Math.ceil(Math.max(...points.map((p) => p.v)) * 2) / 2);
  const t0 = new Date(points[0].at).getTime();
  const t1 = new Date(points[points.length - 1].at).getTime() || t0 + 1;
  const x = (t: number) => pad.l + ((t - t0) / Math.max(1, t1 - t0)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(new Date(p.at).getTime()).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(' ');

  const gridLines = [37, 38, 39, 40]
    .filter((v) => v <= max)
    .map(
      (v) =>
        `<line x1="${pad.l}" y1="${y(v)}" x2="${w - pad.r}" y2="${y(v)}" stroke="#ccc" stroke-width="0.5"/>
         <text x="2" y="${y(v) + 3}" font-size="8" fill="#555">${v}</text>`,
    )
    .join('');

  const dots = points
    .map((p) => `<circle cx="${x(new Date(p.at).getTime()).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="1.8" fill="#111"/>`)
    .join('');

  return `<svg width="100%" viewBox="0 0 ${w} ${h}" role="img" aria-label="Temperaturverlauf">
    ${gridLines}
    <line x1="${pad.l}" y1="${y(38)}" x2="${w - pad.r}" y2="${y(38)}" stroke="#888" stroke-dasharray="3 2" stroke-width="0.8"/>
    <path d="${path}" fill="none" stroke="#111" stroke-width="1.2"/>
    ${dots}
  </svg>`;
}
