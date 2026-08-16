import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { categoryLabel, visibleCategories } from '../domain/categories';
import {
  addDays,
  atOnDay,
  dayOf,
  formatDateShort,
  formatTime,
  monthName,
  parseDate,
  toISODate,
  todayISO,
  weekdayNames,
} from '../domain/dates';
import { celsiusToDisplay, formatNumber } from '../domain/units';
import { useActions, useStore } from '../store/store';
import type { Child, Entry, ISODate } from '../domain/types';

/**
 * Kalender-, Listen- und Filteransicht (Abschnitt 4.2).
 *
 * Die Farbe eines Tages ist die Farbe der vom Nutzer gewählten Kategorie.
 * Es gibt keine Einfärbung nach Schwere, keine Hervorhebung und keine
 * Zusammenfassung — nur die Anzahl der Einträge, also eine Auszählung dessen,
 * was der Nutzer selbst angelegt hat.
 */
export function History({
  child,
  onOpenEntry,
}: {
  child: Child;
  onOpenEntry: (entry: Entry) => void;
}) {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const { addEntry } = useActions();

  const [cursor, setCursor] = useState(() => {
    const d = parseDate(todayISO());
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [view, setView] = useState<'month' | 'year'>('month');
  const [selected, setSelected] = useState<ISODate | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const categories = visibleCategories(state.categories);
  const colorOf = (id: string) => state.categories.find((c) => c.id === id)?.color;

  const monthStart = toISODate(new Date(cursor.year, cursor.month, 1));
  const monthEnd = toISODate(new Date(cursor.year, cursor.month + 1, 0));

  const childEntries = useMemo(
    () => state.entries.filter((e) => e.childId === child.id),
    [state.entries, child.id],
  );

  /** Tag → Farben der an diesem Tag verwendeten Kategorien. */
  const dayColors = useMemo(() => {
    const map = new Map<ISODate, string[]>();
    for (const e of childEntries) {
      const day = dayOf(e.at);
      const colors = map.get(day) ?? [];
      for (const id of e.categoryIds) {
        const color = colorOf(id);
        if (color && !colors.includes(color)) colors.push(color);
      }
      if (colors.length === 0) colors.push('var(--border-strong)');
      map.set(day, colors);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childEntries, state.categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return childEntries
      .filter((e) => {
        const day = dayOf(e.at);
        if (view === 'month' && (day < monthStart || day > monthEnd)) return false;
        if (view === 'year' && (day < `${cursor.year}-01-01` || day > `${cursor.year}-12-31`)) {
          return false;
        }
        if (categoryFilter && !e.categoryIds.includes(categoryFilter)) return false;
        if (q) {
          const haystack = [
            e.note ?? '',
            e.tags.join(' '),
            e.medication?.name ?? '',
            ...e.categoryIds.map((id) => {
              const c = state.categories.find((x) => x.id === id);
              return c ? categoryLabel(c, locale) : '';
            }),
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [childEntries, query, categoryFilter, view, monthStart, monthEnd, cursor.year, state.categories, locale]);

  const dayEntries = selected
    ? childEntries.filter((e) => dayOf(e.at) === selected).sort((a, b) => a.at.localeCompare(b.at))
    : [];

  const firstWeekday = (parseDate(monthStart).getDay() + 6) % 7;
  const daysInMonth = parseDate(monthEnd).getDate();
  const cells: (ISODate | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(monthStart, i)),
  ];

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  };

  const describe = (e: Entry) => {
    const names = e.categoryIds
      .map((id) => state.categories.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => `${c!.icon} ${categoryLabel(c!, locale)}`);
    const parts = [...names];
    if (e.temperature != null) {
      const unit = e.temperatureUnit ?? state.settings.temperatureUnit;
      parts.push(`${formatNumber(celsiusToDisplay(e.temperature, unit))} °${unit}`);
    }
    if (e.medication?.name) {
      parts.push([e.medication.name, e.medication.amount].filter(Boolean).join(' · '));
    }
    return parts.join(' · ');
  };

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">{t('historyTitle')}</h1>
        <div className="screen-sub">{child.name}</div>
      </div>

      <div className="calendar">
        <div className="calendar__head">
          {view === 'month' ? (
            <>
              <button type="button" className="icon-btn" aria-label="◀" onClick={() => shiftMonth(-1)}>‹</button>
              <strong>{monthName(cursor.month, locale)} {cursor.year}</strong>
              <button type="button" className="icon-btn" aria-label="▶" onClick={() => shiftMonth(1)}>›</button>
            </>
          ) : (
            <>
              <button type="button" className="icon-btn" aria-label="◀"
                onClick={() => setCursor({ ...cursor, year: cursor.year - 1 })}>‹</button>
              <strong>{cursor.year}</strong>
              <button type="button" className="icon-btn" aria-label="▶"
                onClick={() => setCursor({ ...cursor, year: cursor.year + 1 })}>›</button>
            </>
          )}
        </div>

        <div className="seg" style={{ marginBottom: 'var(--space-3)' }}>
          <button type="button" className="seg__item" aria-pressed={view === 'month'} onClick={() => setView('month')}>
            {t('viewMonth')}
          </button>
          <button type="button" className="seg__item" aria-pressed={view === 'year'} onClick={() => setView('year')}>
            {t('viewYear')}
          </button>
        </div>

        {view === 'month' ? (
          <>
            <div className="calendar__grid">
              {weekdayNames(locale).map((d) => (
                <div key={d} className="calendar__dow">{d}</div>
              ))}
              {cells.map((day, i) => {
                if (!day) return <div key={`e${i}`} className="day day--empty" />;
                const colors = dayColors.get(day);
                return (
                  <button
                    key={day}
                    type="button"
                    className={[
                      'day',
                      day === todayISO() ? 'day--today' : '',
                      selected === day ? 'day--selected' : '',
                    ].filter(Boolean).join(' ')}
                    aria-label={`${formatDateShort(day, locale)}${colors ? `, ${colors.length}` : ''}`}
                    onClick={() => setSelected(selected === day ? null : day)}
                  >
                    <span>{parseDate(day).getDate()}</span>
                    <span className="day__dots" aria-hidden>
                      {(colors ?? []).slice(0, 3).map((c, idx) => (
                        <span key={idx} className="day__dot" style={{ background: c }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="legend">
              <span className="legend__item">
                <span className="legend__swatch" style={{ background: 'var(--accent)' }} aria-hidden />
                {t('legendHasEntries')}
              </span>
              <span className="legend__item">
                <span className="legend__swatch" style={{ background: 'var(--surface-2)' }} aria-hidden />
                {t('legendNoEntries')}
              </span>
            </div>
            <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t('legendHint')}</p>
          </>
        ) : (
          <div className="year">
            {Array.from({ length: 12 }, (_, m) => {
              const days = new Date(cursor.year, m + 1, 0).getDate();
              return (
                <div className="year__row" key={m}>
                  <div className="year__label">{monthName(m, locale).slice(0, 3)}</div>
                  <div className="year__strip">
                    {Array.from({ length: days }, (_, i) => {
                      const day = toISODate(new Date(cursor.year, m, i + 1));
                      const colors = dayColors.get(day);
                      return (
                        <div
                          key={day}
                          className="year__cell"
                          title={formatDateShort(day, locale)}
                          style={colors ? { background: colors[0] } : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <section className="section">
          <div className="section__title">{formatDateShort(selected, locale)}</div>
          {/* Ein Nachtrag entstand bisher immer mit dem heutigen Zeitstempel und
              musste danach im Blatt umdatiert werden. Aus dem Kalender heraus
              steht der Tag schon fest. */}
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginBottom: 'var(--space-3)' }}
            onClick={() =>
              onOpenEntry(
                addEntry({
                  childId: child.id,
                  at: atOnDay(selected),
                  categoryIds: [],
                  tags: [],
                  temperatureUnit: state.settings.temperatureUnit,
                }),
              )
            }
          >
            + {t('addEntryOnDay')}
          </button>
          {dayEntries.length === 0 ? (
            <div className="empty">{t('noEntriesOnDay')}</div>
          ) : (
            <div className="list">
              {dayEntries.map((e) => (
                <button key={e.id} type="button" className="list-item" onClick={() => onOpenEntry(e)}>
                  <div className="list-item__main">
                    <div className="list-item__title">{formatTime(e.at)}</div>
                    <div className="list-item__meta">{describe(e) || t('entryTitle')}</div>
                    {e.note && <div className="list-item__meta">„{e.note}"</div>}
                  </div>
                  <span className="list-item__chevron" aria-hidden>›</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="section">
        <div className="section__title">{t('filter')}</div>
        <div className="stack">
          <input
            className="input"
            type="search"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('search')}
          />
          <div className="seg">
            <button type="button" className="seg__item" aria-pressed={categoryFilter === ''}
              onClick={() => setCategoryFilter('')}>
              {t('all')}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className="seg__item"
                aria-pressed={categoryFilter === c.id}
                onClick={() => setCategoryFilter(categoryFilter === c.id ? '' : c.id)}
              >
                <span aria-hidden>{c.icon}</span> {categoryLabel(c, locale)}
              </button>
            ))}
          </div>
          {(query || categoryFilter) && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setQuery('');
                setCategoryFilter('');
              }}
            >
              {t('filterReset')}
            </button>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__title">
          {filtered.length} {t('entryCount')}
        </div>
        {filtered.length === 0 ? (
          <div className="empty">{t('noEntriesYet')}</div>
        ) : (
          <div className="list">
            {filtered.slice(0, 100).map((e) => (
              <button key={e.id} type="button" className="list-item" onClick={() => onOpenEntry(e)}>
                <div className="list-item__main">
                  <div className="list-item__title">
                    {formatDateShort(dayOf(e.at), locale)} · {formatTime(e.at)}
                  </div>
                  <div className="list-item__meta">{describe(e) || t('entryTitle')}</div>
                  {e.note && <div className="list-item__meta">„{e.note}"</div>}
                  {e.tags.length > 0 && (
                    <div className="list-item__meta">{e.tags.map((x) => `#${x}`).join(' ')}</div>
                  )}
                </div>
                <span className="list-item__chevron" aria-hidden>›</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
