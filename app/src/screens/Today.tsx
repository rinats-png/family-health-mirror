import { useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { categoryLabel, visibleCategories } from '../domain/categories';
import {
  dayOf,
  formatAge,
  formatDateLong,
  formatDateShort,
  formatDateTimeShort,
  formatTime,
  fromLocalInputValue,
  nowISO,
  toLocalInputValue,
  todayISO,
} from '../domain/dates';
import { celsiusToDisplay, formatNumber } from '../domain/units';
import { useActions, useStore } from '../store/store';
import type { Category, Child, Entry } from '../domain/types';
import { CardArt } from '../ui/CardArt';
import { Sheet } from '../ui/Sheet';

/**
 * Startbildschirm: wischbare Karten für den Schnelleintrag, darunter die
 * letzten Einträge und die selbst gesetzten Erinnerungen.
 *
 * Was auf einer Karte steht, ist ausschließlich Bestand: die Kategorie, die der
 * Nutzer benannt hat, und das Datum seines letzten Eintrags darin. Bewusst
 * nicht: eine Dauer („seit 3 Tagen"), eine Einordnung („erhöhte Temperatur")
 * oder ein Zustand. Eine Dauer würde behaupten, dass mehrere Einträge ein
 * durchgehendes Geschehen sind — das ist eine Aussage der Anwendung, keine des
 * Nutzers.
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
  const [allOpen, setAllOpen] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderAt, setReminderAt] = useState(() => toLocalInputValue(nowISO()));
  const [activeCard, setActiveCard] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const childEntries = useMemo(
    () => state.entries.filter((e) => e.childId === child.id),
    [state.entries, child.id],
  );

  /** Letzter Eintrag je Kategorie — reine Auszählung der eigenen Einträge. */
  const lastUse = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of childEntries) {
      for (const id of entry.categoryIds) {
        const current = map.get(id);
        if (!current || entry.at > current) map.set(id, entry.at);
      }
    }
    return map;
  }, [childEntries]);

  /**
   * Zuletzt Genutztes zuerst. Das ist Anordnung der Oberfläche, keine Aussage
   * über das Kind — und hält den Weg zum häufigen Fall kurz.
   */
  const cards = useMemo(() => {
    const visible = visibleCategories(state.categories);
    return [...visible].sort((a, b) => {
      const ua = lastUse.get(a.id);
      const ub = lastUse.get(b.id);
      if (ua && ub) return ub.localeCompare(ua);
      if (ua) return -1;
      if (ub) return 1;
      return a.order - b.order;
    });
  }, [state.categories, lastUse]);

  const recent = useMemo(
    () => [...childEntries].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6),
    [childEntries],
  );

  const reminders = useMemo(
    () =>
      state.reminders
        .filter((r) => (!r.childId || r.childId === child.id) && !r.doneAt)
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
    setAllOpen(false);
    onOpenEntry(entry);
  };

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 12;
    setActiveCard(Math.min(cards.length, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  const scrollToCard = (index: number) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollTo({ left: index * (card.offsetWidth + 12), behavior: 'smooth' });
  };

  const cardMeta = (category: Category): string => {
    const at = lastUse.get(category.id);
    return at ? `${t('lastEntryOn')}: ${formatDateShort(dayOf(at), locale)}` : t('noEntryYet');
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

  const iconOf = (entry: Entry): string => {
    const first = entry.categoryIds
      .map((id) => state.categories.find((c) => c.id === id))
      .find(Boolean);
    return first?.icon ?? '✎';
  };

  return (
    <>
      <div className="screen-head center">
        <div className="screen-sub">{formatDateLong(todayISO(), locale)}</div>
        <h1 className="screen-title">{child.name}</h1>
        <div className="screen-sub">{formatAge(child.birthDate, locale)}</div>
      </div>

      <section aria-labelledby="quick-title">
        <h2 className="section__title center" id="quick-title">{t('quickEntry')}</h2>

        <div className="storycards" ref={trackRef} onScroll={onTrackScroll}>
          {cards.map((category, index) => (
            <article className="storycard" key={category.id}
              aria-label={categoryLabel(category, locale)}>
              <span className="storycard__badge" aria-hidden>{category.icon}</span>
              <h3 className="storycard__title">{categoryLabel(category, locale)}</h3>
              <p className="storycard__meta">{cardMeta(category)}</p>
              {/* Ohne aria-label hießen alle Karten-Buttons gleich; per
                  Screenreader wäre dann nicht unterscheidbar, welche
                  Kategorie man auslöst. */}
              <button
                type="button"
                className="btn btn--primary"
                aria-label={`${categoryLabel(category, locale)} ${t('enterNow')}`}
                onClick={() => create(category.id)}
              >
                + {t('enterNow')}
              </button>
              <CardArt variant={index} />
            </article>
          ))}

          <article className="storycard storycard--more">
            <span className="storycard__badge" aria-hidden>＋</span>
            <h3 className="storycard__title">{t('allCategories')}</h3>
            <p className="storycard__meta">{t('quickEntryHint')}</p>
            <button type="button" className="btn btn--ghost" onClick={() => setAllOpen(true)}>
              {t('allCategories')}
            </button>
          </article>
        </div>

        <div className="dots" role="tablist" aria-label={t('quickEntry')}>
          {[...cards, null].map((category, index) => (
            <button
              key={category ? category.id : 'more'}
              type="button"
              className="dot"
              role="tab"
              aria-current={activeCard === index}
              aria-label={`${t('cardOf')} ${index + 1}`}
              onClick={() => scrollToCard(index)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('recentEntries')}</div>
        {recent.length === 0 ? (
          <div className="empty">{t('noEntriesYet')}</div>
        ) : (
          <div className="list list--grouped">
            {recent.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="list-item"
                onClick={() => onOpenEntry(entry)}
              >
                <span className="list-item__badge" aria-hidden>{iconOf(entry)}</span>
                <div className="list-item__main">
                  <div className="list-item__title">{describe(entry) || t('entryTitle')}</div>
                  <div className="list-item__meta">
                    {dayOf(entry.at) === todayISO()
                      ? `${t('today')}, ${formatTime(entry.at)}`
                      : formatDateTimeShort(entry.at, locale)}
                  </div>
                  {/* Die Notiz ist das, was der Nutzer selbst geschrieben hat —
                      sie gehört in die Übersicht, nicht nur ins Detail. */}
                  {entry.note && <div className="list-item__meta">„{entry.note}"</div>}
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
          <div className="list list--grouped">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="list-item">
                <span className="list-item__badge" aria-hidden>⏱</span>
                <div className="list-item__main">
                  <div className="list-item__title">{reminder.text}</div>
                  <div className="list-item__meta">{formatDateTimeShort(reminder.at, locale)}</div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  onClick={() => updateReminder(reminder.id, { doneAt: nowISO() })}
                >
                  {t('reminderDone')}
                </button>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label={t('delete')}
                  onClick={() => removeReminder(reminder.id)}
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

      {allOpen && (
        <Sheet open onClose={() => setAllOpen(false)} title={t('allCategories')}>
          <div className="chips">
            {visibleCategories(state.categories).map((category) => (
              <button
                key={category.id}
                type="button"
                className="chip"
                onClick={() => create(category.id)}
              >
                <span className="chip__icon" aria-hidden>{category.icon}</span>
                <span>{categoryLabel(category, locale)}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => create()}
          >
            {t('entryTitle')}
          </button>
        </Sheet>
      )}

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
