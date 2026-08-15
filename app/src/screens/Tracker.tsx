import { useMemo, useState } from 'react';
import { dayMap, periodStats } from '../domain/analytics';
import { SEVERITY_LABEL, symptomIcon, symptomLabel, tempMethodLabel } from '../domain/catalog';
import {
  addDays,
  dayOf,
  formatDateShort,
  formatTime,
  monthName,
  parseDate,
  plural,
  toISODate,
  todayISO,
} from '../domain/dates';
import { buildEpisodes } from '../domain/episodes';
import { useActions, useStore } from '../store/store';
import type { Child, HealthEntry, ISODate } from '../domain/types';

const DOW = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

interface Props {
  child: Child;
  onOpenEntry: (entry: HealthEntry) => void;
}

export function Tracker({ child, onOpenEntry }: Props) {
  const { state } = useStore();
  const { removeEntry } = useActions();
  const [cursor, setCursor] = useState(() => {
    const d = parseDate(todayISO());
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [view, setView] = useState<'month' | 'year'>('month');
  const [selected, setSelected] = useState<ISODate | null>(null);

  const monthStart = toISODate(new Date(cursor.year, cursor.month, 1));
  const monthEnd = toISODate(new Date(cursor.year, cursor.month + 1, 0));

  const marks = useMemo(
    () => dayMap(state.entries, child.id, monthStart, monthEnd),
    [state.entries, child.id, monthStart, monthEnd],
  );
  const stats = useMemo(
    () => periodStats(state.entries, child.id, monthStart, monthEnd),
    [state.entries, child.id, monthStart, monthEnd],
  );

  const yearMarks = useMemo(
    () => dayMap(state.entries, child.id, `${cursor.year}-01-01`, `${cursor.year}-12-31`),
    [state.entries, child.id, cursor.year],
  );

  const episodes = useMemo(
    () =>
      buildEpisodes(state.entries, child.id)
        .filter((ep) => dayOf(ep.end) >= monthStart && dayOf(ep.start) <= monthEnd)
        .reverse(),
    [state.entries, child.id, monthStart, monthEnd],
  );

  const vaccineDays = new Set(
    state.vaccinations.filter((v) => v.childId === child.id && !v.deleted).map((v) => v.date),
  );

  // Wochenraster ab Montag
  const firstWeekday = (parseDate(monthStart).getDay() + 6) % 7;
  const daysInMonth = parseDate(monthEnd).getDate();
  const cells: (ISODate | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i)),
  ];

  const dayEntries = selected
    ? state.entries
        .filter((e) => e.childId === child.id && !e.deleted && dayOf(e.at) === selected)
        .sort((a, b) => a.at.localeCompare(b.at))
    : [];

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  };

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">Tracker</h1>
        <div className="screen-sub">Verlauf von {child.name}</div>
      </div>

      <div className="calendar">
        <div className="calendar__head">
          {view === 'month' ? (
            <>
              <button type="button" className="icon-btn" aria-label="Vorheriger Monat" onClick={() => shiftMonth(-1)}>‹</button>
              <strong>{monthName(cursor.month)} {cursor.year}</strong>
              <button type="button" className="icon-btn" aria-label="Nächster Monat" onClick={() => shiftMonth(1)}>›</button>
            </>
          ) : (
            <>
              <button type="button" className="icon-btn" aria-label="Vorheriges Jahr" onClick={() => setCursor({ ...cursor, year: cursor.year - 1 })}>‹</button>
              <strong>{cursor.year}</strong>
              <button type="button" className="icon-btn" aria-label="Nächstes Jahr" onClick={() => setCursor({ ...cursor, year: cursor.year + 1 })}>›</button>
            </>
          )}
        </div>

        <div className="seg" style={{ marginBottom: 'var(--space-3)' }}>
          <button type="button" className="seg__item" aria-pressed={view === 'month'} onClick={() => setView('month')}>Monat</button>
          <button type="button" className="seg__item" aria-pressed={view === 'year'} onClick={() => setView('year')}>Jahr</button>
        </div>

        {view === 'month' ? (
          <>
            <div className="calendar__grid" role="grid" aria-label="Monatskalender">
              {DOW.map((d) => (
                <div key={d} className="calendar__dow">{d}</div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} className="day day--empty" />;
                const info = marks.get(day);
                const isVaccine = vaccineDays.has(day);
                const cls = [
                  'day',
                  day === todayISO() ? 'day--today' : '',
                  info?.marker === 'fever' ? 'day--fever' : info?.marker === 'symptom' ? 'day--symptom' : '',
                  selected === day ? 'day--selected' : '',
                ].filter(Boolean).join(' ');
                const markSymbol =
                  info?.marker === 'fever' ? '▲' : info?.marker === 'symptom' ? '●' : isVaccine ? '💉' : '';
                return (
                  <button
                    key={day}
                    type="button"
                    className={cls}
                    aria-label={`${formatDateShort(day)}${
                      info?.marker === 'fever' ? ', Fieber' : info?.marker === 'symptom' ? ', Symptome' : ''
                    }${isVaccine ? ', Impfung' : ''}`}
                    onClick={() => setSelected(selected === day ? null : day)}
                  >
                    <span>{parseDate(day).getDate()}</span>
                    {markSymbol && <span className="day__mark" aria-hidden>{markSymbol}</span>}
                  </button>
                );
              })}
            </div>

            <div className="legend">
              <span className="legend__item">
                <span className="legend__swatch" style={{ background: 'var(--warning-soft)', borderColor: 'var(--warning)' }} aria-hidden>▲</span>
                Fieber
              </span>
              <span className="legend__item">
                <span className="legend__swatch" style={{ background: 'var(--brand)' }} aria-hidden>●</span>
                Symptome
              </span>
              <span className="legend__item">
                <span className="legend__swatch" style={{ background: 'var(--surface-2)' }} aria-hidden />
                keine Einträge
              </span>
              <span className="legend__item"><span aria-hidden>💉</span> Impfung</span>
            </div>
          </>
        ) : (
          <div className="year">
            {Array.from({ length: 12 }, (_, m) => {
              const days = new Date(cursor.year, m + 1, 0).getDate();
              return (
                <div className="year__row" key={m}>
                  <div className="year__label">{monthName(m).slice(0, 3)}</div>
                  <div className="year__strip">
                    {Array.from({ length: days }, (_, i) => {
                      const day = toISODate(new Date(cursor.year, m, i + 1));
                      const info = yearMarks.get(day);
                      const cls =
                        info?.marker === 'fever'
                          ? 'year__cell year__cell--fever'
                          : info?.marker === 'symptom'
                            ? 'year__cell year__cell--symptom'
                            : 'year__cell';
                      return <div key={day} className={cls} title={formatDateShort(day)} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <section className="section">
        <div className="section__title">
          {view === 'month' ? `${monthName(cursor.month)} ${cursor.year}` : `Jahr ${cursor.year}`}
        </div>
        <div className="tile tile--wide">
          <div className="row row--wrap" style={{ gap: 'var(--space-5)' }}>
            <div>
              <div className="tile__value">{stats.sickDays}</div>
              <div className="tile__label">Krankheitstage</div>
            </div>
            <div>
              <div className="tile__value">{stats.episodeCount}</div>
              <div className="tile__label">Episoden</div>
            </div>
            <div>
              <div className="tile__value">{stats.feverDays}</div>
              <div className="tile__label">Fiebertage</div>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <section className="section">
          <div className="section__title">{formatDateShort(selected)}</div>
          {dayEntries.length === 0 ? (
            <div className="empty">Keine Einträge an diesem Tag.</div>
          ) : (
            <div className="list">
              {dayEntries.map((e) => (
                <div key={e.id} className="list-item">
                  <div className="list-item__main">
                    <div className="list-item__title">
                      {formatTime(e.at)}
                      {e.temperature != null && ` · ${e.temperature.toFixed(1)} °C (${tempMethodLabel(e.tempMethod)})`}
                    </div>
                    <div className="list-item__meta">
                      {e.symptoms.map((s) => `${symptomIcon(s.code)} ${symptomLabel(s.code)} (${SEVERITY_LABEL[s.severity]})`).join(' · ') || 'Ohne Symptomangabe'}
                      {e.febrileSeizure && ' · Fieberkrampf'}
                    </div>
                    {e.note && <div className="list-item__meta">„{e.note}"</div>}
                  </div>
                  <button type="button" className="btn btn--sm btn--ghost" onClick={() => onOpenEntry(e)}>
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    aria-label="Eintrag löschen"
                    onClick={() => removeEntry(e.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="section">
        <div className="section__title">Episoden im Zeitraum</div>
        {episodes.length === 0 ? (
          <div className="empty">Keine Krankheitsepisoden in diesem Monat.</div>
        ) : (
          <div className="list">
            {episodes.map((ep) => (
              <div key={ep.id} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">
                    {formatDateShort(dayOf(ep.start))} – {formatDateShort(dayOf(ep.end))}
                  </div>
                  <div className="list-item__meta">
                    {ep.symptomCodes.map(symptomLabel).join(', ') || 'Symptome erfasst'} ·{' '}
                    {plural(ep.dayCount, 'Tag', 'Tage')}
                    {ep.maxTemp != null && ` · max. ${ep.maxTemp.toFixed(1)} °C`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
