import { useState } from 'react';
import { useI18n } from '../i18n';
import { categoryLabel, isMedicationCategory, visibleCategories } from '../domain/categories';
import { formatTime, fromLocalInputValue, nowISO, toLocalInputValue } from '../domain/dates';
import { celsiusToDisplay, parseDecimal, temperatureFromInput } from '../domain/units';
import { useActions, useStore } from '../store/store';
import type { Entry } from '../domain/types';
import { Sheet } from '../ui/Sheet';

/**
 * Detaileintrag (Abschnitt 4.2).
 *
 * Der Eintrag existiert bereits, wenn dieses Blatt aufgeht — er entstand beim
 * Tippen auf die Kachel. Alles hier ist freiwillige Ergänzung; jede Änderung
 * wird sofort geschrieben. Wer wegwischt, verliert nichts.
 *
 * Enthalten sind genau die Felder aus Abschnitt 4.2: Zeitpunkt, Notiz,
 * Temperatur, Foto, Tags, Medikamentenprotokoll. Kein Schweregrad, keine
 * Einstufung, keine Rückmeldung zu einem eingegebenen Wert.
 */
export function EntrySheet({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const { updateEntry, removeEntry } = useActions();
  const [tagDraft, setTagDraft] = useState('');

  const live = state.entries.find((e) => e.id === entry.id) ?? entry;
  const categories = visibleCategories(state.categories);
  const unit = live.temperatureUnit ?? state.settings.temperatureUnit;

  const selected = new Set(live.categoryIds);
  const showMedication = live.categoryIds.some((id) => {
    const c = state.categories.find((x) => x.id === id);
    return c && isMedicationCategory(c);
  });

  const toggleCategory = (id: string) => {
    updateEntry(live.id, {
      categoryIds: selected.has(id)
        ? live.categoryIds.filter((c) => c !== id)
        : [...live.categoryIds, id],
    });
  };

  const setTemperature = (raw: string) => {
    const parsed = parseDecimal(raw);
    updateEntry(live.id, {
      temperature: parsed == null ? undefined : temperatureFromInput(parsed, unit),
      temperatureUnit: unit,
    });
  };

  const addTag = () => {
    const value = tagDraft.trim();
    if (!value || live.tags.includes(value)) return;
    updateEntry(live.id, { tags: [...live.tags, value] });
    setTagDraft('');
  };

  return (
    <Sheet open onClose={onClose} title={t('entryTitle')}>
      <div className="sheet__saved">
        <span aria-hidden>✓</span>
        <span>{t('entrySavedAt')} · {formatTime(live.at)}</span>
      </div>

      <div className="field">
        <span className="field__label">{t('entryCategories')}</span>
        <div className="seg">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="seg__item"
              aria-pressed={selected.has(c.id)}
              onClick={() => toggleCategory(c.id)}
            >
              <span aria-hidden>{c.icon}</span> {categoryLabel(c, locale)}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="entry-temp">
          {t('entryTemperature')} ({t('optional')})
        </label>
        <div className="row">
          <input
            id="entry-temp"
            className="input tabular"
            type="text"
            inputMode="decimal"
            placeholder={unit === 'C' ? '38,5' : '101,3'}
            defaultValue={
              live.temperature != null
                ? String(Math.round(celsiusToDisplay(live.temperature, unit) * 10) / 10).replace(
                    '.',
                    locale === 'de' ? ',' : '.',
                  )
                : ''
            }
            onChange={(e) => setTemperature(e.target.value)}
            style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', minHeight: 58 }}
          />
          <span className="tile__value" style={{ margin: 0 }}>°{unit}</span>
        </div>
        <p className="small muted" style={{ marginTop: 6 }}>{t('entryTemperatureHint')}</p>
      </div>

      {showMedication && (
        <div className="field">
          <span className="field__label">{t('entryMedication')}</span>
          <input
            className="input"
            placeholder={t('entryMedicationNamePlaceholder')}
            aria-label={t('entryMedicationName')}
            defaultValue={live.medication?.name ?? ''}
            onChange={(e) =>
              updateEntry(live.id, {
                medication: { name: e.target.value, amount: live.medication?.amount ?? '' },
              })
            }
          />
          <input
            className="input"
            style={{ marginTop: 'var(--space-2)' }}
            placeholder={t('entryMedicationAmountPlaceholder')}
            aria-label={t('entryMedicationAmount')}
            defaultValue={live.medication?.amount ?? ''}
            onChange={(e) =>
              updateEntry(live.id, {
                medication: { name: live.medication?.name ?? '', amount: e.target.value },
              })
            }
          />
          <p className="small muted" style={{ marginTop: 6 }}>{t('entryMedicationHint')}</p>
        </div>
      )}

      <div className="field">
        <label className="field__label" htmlFor="entry-note">{t('notes')}</label>
        <textarea
          id="entry-note"
          className="textarea"
          placeholder={t('entryNotePlaceholder')}
          defaultValue={live.note ?? ''}
          onChange={(e) => updateEntry(live.id, { note: e.target.value || undefined })}
        />
      </div>

      <div className="field">
        <span className="field__label">{t('tags')}</span>
        <div className="row row--wrap" style={{ marginBottom: 8 }}>
          {live.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="seg__item"
              onClick={() => updateEntry(live.id, { tags: live.tags.filter((x) => x !== tag) })}
            >
              {tag} ✕
            </button>
          ))}
        </div>
        <div className="row">
          <input
            className="input"
            placeholder={t('entryTagsPlaceholder')}
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" className="btn btn--sm" disabled={!tagDraft.trim()} onClick={addTag}>
            {t('add')}
          </button>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="entry-photo">{t('photo')}</label>
        <input
          id="entry-photo"
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => updateEntry(live.id, { photo: String(reader.result) });
            reader.readAsDataURL(file);
          }}
        />
        <p className="small muted" style={{ marginTop: 6 }}>{t('entryPhotoHint')}</p>
        {live.photo && (
          <div style={{ marginTop: 8 }}>
            <img
              src={live.photo}
              alt=""
              style={{ maxWidth: '100%', borderRadius: 'var(--radius-control)' }}
            />
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              style={{ marginTop: 6 }}
              onClick={() => updateEntry(live.id, { photo: undefined })}
            >
              {t('delete')}
            </button>
          </div>
        )}
      </div>

      <details className="field">
        <summary className="field__label" style={{ cursor: 'pointer' }}>
          {t('entryChangeTime')}
        </summary>
        <input
          className="input"
          type="datetime-local"
          value={toLocalInputValue(live.at)}
          max={toLocalInputValue(nowISO())}
          onChange={(e) => {
            if (e.target.value) updateEntry(live.id, { at: fromLocalInputValue(e.target.value) });
          }}
          style={{ marginTop: 8 }}
        />
      </details>

      <button type="button" className="btn btn--primary btn--block" onClick={onClose}>
        {t('done')}
      </button>
      <button
        type="button"
        className="btn btn--danger btn--block"
        style={{ marginTop: 'var(--space-2)' }}
        onClick={() => {
          removeEntry(live.id);
          onClose();
        }}
      >
        {t('entryDelete')}
      </button>
    </Sheet>
  );
}
