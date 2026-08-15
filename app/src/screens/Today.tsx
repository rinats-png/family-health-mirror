import { useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { categoryLabel, visibleCategories } from '../domain/categories';
import {
  dayOf,
  formatAge,
  formatDateLong,
  formatDateTimeShort,
  formatTime,
  fromLocalInputValue,
  nowISO,
  toLocalInputValue,
  todayISO,
} from '../domain/dates';
import { celsiusToDisplay, formatNumber } from '../domain/units';
import { useActions, useStore } from '../store/store';
import type { Child, Entry } from '../domain/types';
import { Sheet } from '../ui/Sheet';

/**
 * Startbildschirm (Abschnitt 6: Schnelleintragskacheln plus die letzten Einträge).
 *
 * Das Tippen auf eine Kachel legt den Eintrag sofort an. Die Kacheln stehen
 * oben im Daumenbereich; darunter stehen die letzten Einträge und die vom
 * Nutzer selbst gesetzten Erinnerungen. Nichts auf diesem Bildschirm ist
 * berechnet — es gibt keine Tageslage, keinen Status, keine Kennzahl.
 */
export function Today({
  child,
  onOpenEntry,
}: {
  child: Child;
  onOpenEntry: (entry: Entry) => void;
}) {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const { addEntry, addReminder, updateReminder, removeReminder } = useActions();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderAt, setReminderAt] = useState(() => toLocalInputValue(nowISO()));

  // Alle sichtbaren Kacheln anzeigen: Abschnitt 4.2 nennt zehn Standardkacheln,
  // und eine Kachel, die man erst suchen muss, verfehlt das Zehn-Sekunden-Ziel.
  // Ausblenden entscheidet der Nutzer im Profil, nicht die Anwendung.
  const tiles = visibleCategories(state.categories);

  const recent = useMemo(
    () =>
      state.entries
        .filter((e) => e.childId === child.id)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 8),
    [state.entries, child.id],
  );

  const reminders = useMemo(
    () =>
      state.reminders
        .filter((r) => !r.childId || r.childId === child.id)
        .filter((r) => !r.doneAt)
        .sort((a, b) => a.at.localeCompare(b.at)),
    [state.reminders, child.id],
  );

  const create = (categoryId?: string) => {
    const entry = addEntry({
      childId: child.id,
      at: nowISO(),
      categoryIds: categoryId ? [categoryId] : [],
      tags: [],
      temperatureUnit: state.settings.temperatureUnit,
    });
    onOpenEntry(entry);
  };

  const describe = (entry: Entry): string => {
    const names = entry.categoryIds
      .map((id) => state.categories.find((c) => c.id === id))
      .filter(Boolean)
      .map((c) => categoryLabel(c!, locale));
    const parts: string[] = [];
    if (names.length) parts.push(names.join(', '));
    if (entry.temperature != null) {
      const unit = entry.temperatureUnit ?? state.settings.temperatureUnit;
      parts.push(`${formatNumber(celsiusToDisplay(entry.temperature, unit))} °${unit}`);
    }
    if (entry.medication?.name) {
      parts.push([entry.medication.name, entry.medication.amount].filter(Boolean).join(' · '));
    }
    return parts.join(' · ');
  };

  return (
    <>
      <div className="screen-head">
        <div className="screen-sub">{formatDateLong(todayISO(), locale)}</div>
        <h1 className="screen-title">{child.name}</h1>
        <div className="screen-sub">{formatAge(child.birthDate, locale)}</div>
      </div>

      <section className="quickbar" aria-labelledby="quick-title">
        <div className="tile__label" id="quick-title">{t('quickEntry')}</div>
        <div className="chips">
          {tiles.map((c) => (
            <button key={c.id} type="button" className="chip" onClick={() => create(c.id)}>
              <span className="chip__icon" aria-hidden>{c.icon}</span>
              <span>{categoryLabel(c, locale)}</span>
            </button>
          ))}
          <button type="button" className="chip" onClick={() => create()}>
            <span className="chip__icon" aria-hidden>＋</span>
            <span>{t('moreTile')}</span>
          </button>
        </div>
        <p className="small muted" style={{ marginTop: 'var(--space-3)' }}>{t('quickEntryHint')}</p>
      </section>

      <section className="section">
        <div className="section__title">{t('recentEntries')}</div>
        {recent.length === 0 ? (
          <div className="empty">{t('noEntriesYet')}</div>
        ) : (
          <div className="list">
            {recent.map((e) => (
              <button key={e.id} type="button" className="list-item" onClick={() => onOpenEntry(e)}>
                <div className="list-item__main">
                  <div className="list-item__title">
                    {dayOf(e.at) === todayISO()
                      ? `${t('today')}, ${formatTime(e.at)}`
                      : formatDateTimeShort(e.at, locale)}
                  </div>
                  <div className="list-item__meta">{describe(e) || t('entryTitle')}</div>
                  {e.note && <div className="list-item__meta">„{e.note}"</div>}
                </div>
                <span className="list-item__chevron" aria-hidden>›</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__title">{t('remindersTitle')}</div>
        {reminders.length === 0 ? (
          <div className="empty">{t('reminderNone')}</div>
        ) : (
          <div className="list">
            {reminders.map((r) => (
              <div key={r.id} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">{r.text}</div>
                  <div className="list-item__meta">{formatDateTimeShort(r.at, locale)}</div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() => updateReminder(r.id, { doneAt: nowISO() })}
                >
                  {t('reminderDone')}
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label={t('delete')}
                  onClick={() => removeReminder(r.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          className="btn btn--ghost btn--block"
          style={{ marginTop: 'var(--space-3)' }}
          onClick={() => {
            setReminderText('');
            setReminderAt(toLocalInputValue(nowISO()));
            setReminderOpen(true);
          }}
        >
          + {t('reminderAdd')}
        </button>
        <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t('reminderHint')}</p>
      </section>

      <p className="disclaimer">{t('purposeShort')}</p>

      {reminderOpen && (
        <Sheet open onClose={() => setReminderOpen(false)} title={t('reminderAdd')}>
          <div className="field">
            <label className="field__label" htmlFor="rem-text">{t('reminderText')}</label>
            <input
              id="rem-text"
              className="input"
              value={reminderText}
              autoFocus
              placeholder={t('reminderTextPlaceholder')}
              onChange={(e) => setReminderText(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="rem-at">{t('time')}</label>
            <input
              id="rem-at"
              className="input"
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!reminderText.trim() || !reminderAt}
            onClick={() => {
              addReminder({
                childId: child.id,
                at: fromLocalInputValue(reminderAt),
                text: reminderText.trim(),
              });
              setReminderOpen(false);
            }}
          >
            {t('save')}
          </button>
        </Sheet>
      )}
    </>
  );
}
