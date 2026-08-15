import { useMemo, useState } from 'react';
import { VACCINE_NAME_SUGGESTIONS } from '../data/categories';
import { useI18n } from '../i18n';
import { formatDateShort, todayISO } from '../domain/dates';
import { useActions, useStore } from '../store/store';
import type { Child } from '../domain/types';
import { Sheet } from '../ui/Sheet';

/**
 * Impfübersicht (Abschnitt 4.4) — bewusst reduziert.
 *
 * Zweck: Eltern haben ihre Eintragungen dabei, wenn der Impfpass verlegt oder
 * vergessen wurde. Es gibt hier keine Fälligkeiten, keine Erinnerungen aus dem
 * Geburtsdatum, keine Vollständigkeitsprüfung und keinen Abgleich mit einer
 * Empfehlung. Die Namensliste ist eine reine Schreibhilfe und sagt nichts
 * darüber aus, was für ein bestimmtes Kind infrage kommt.
 */
export function Vaccinations({ child }: { child: Child }) {
  const { t, locale } = useI18n();
  const { state } = useStore();
  const { addVaccination, removeVaccination, addPassPhoto, removePassPhoto } = useActions();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: todayISO(),
    name: '',
    batch: '',
    practice: '',
    note: '',
  });

  const records = useMemo(
    () =>
      state.vaccinations
        .filter((v) => v.childId === child.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.vaccinations, child.id],
  );

  const photos = useMemo(
    () => state.passPhotos.filter((p) => p.childId === child.id),
    [state.passPhotos, child.id],
  );

  const photoLimitReached = !state.settings.pro && photos.length >= 3;

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">{t('vaccinationsTitle')}</h1>
        <div className="screen-sub">{t('vaccinationsLead')}</div>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={() => {
          setForm({ date: todayISO(), name: '', batch: '', practice: '', note: '' });
          setOpen(true);
        }}
      >
        + {t('vaccinationAdd')}
      </button>

      <section className="section">
        <div className="section__title">{t('vaccinationsTitle')}</div>
        {records.length === 0 ? (
          <div className="empty">{t('vaccinationNone')}</div>
        ) : (
          <div className="list">
            {records.map((v) => (
              <div key={v.id} className="list-item">
                <div className="list-item__main">
                  <div className="list-item__title">{v.name}</div>
                  <div className="list-item__meta">{formatDateShort(v.date, locale)}</div>
                  {(v.batch || v.practice) && (
                    <div className="list-item__meta">
                      {[v.batch && `${t('vaccinationBatch')}: ${v.batch}`, v.practice]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  )}
                  {v.note && <div className="list-item__meta">„{v.note}"</div>}
                </div>
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label={t('delete')}
                  onClick={() => removeVaccination(v.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__title">{t('passPhotos')}</div>
        {photos.length === 0 ? (
          <div className="empty">{t('passPhotoNone')}</div>
        ) : (
          <div className="stack">
            {photos.map((p) => (
              <div key={p.id} className="tile tile--wide">
                <img
                  src={p.image}
                  alt={p.caption ?? ''}
                  style={{ width: '100%', borderRadius: 'var(--radius-control)' }}
                />
                <div className="row row--between" style={{ marginTop: 'var(--space-2)' }}>
                  <span className="small muted">{p.caption}</span>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost"
                    onClick={() => removePassPhoto(p.id)}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {photoLimitReached ? (
          <div className="note note--info" style={{ marginTop: 'var(--space-3)' }}>
            {t('proBody')}
          </div>
        ) : (
          <label className="btn btn--ghost btn--block" style={{ marginTop: 'var(--space-3)', cursor: 'pointer' }}>
            {t('passPhotoAdd')}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () =>
                  addPassPhoto({
                    childId: child.id,
                    image: String(reader.result),
                    caption: file.name,
                  });
                reader.readAsDataURL(file);
              }}
            />
          </label>
        )}
      </section>

      <p className="disclaimer">{t('vaccinationNeutralNote')}</p>

      {open && (
        <Sheet open onClose={() => setOpen(false)} title={t('vaccinationAdd')}>
          <div className="field">
            <label className="field__label" htmlFor="vac-name">{t('vaccinationName')}</label>
            <input
              id="vac-name"
              className="input"
              list="vaccine-names"
              autoFocus
              value={form.name}
              placeholder={t('vaccinationNamePlaceholder')}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <datalist id="vaccine-names">
              {VACCINE_NAME_SUGGESTIONS.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="vac-date">{t('date')}</label>
            <input
              id="vac-date"
              className="input"
              type="date"
              value={form.date}
              max={todayISO()}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="vac-batch">
              {t('vaccinationBatch')} ({t('optional')})
            </label>
            <input
              id="vac-batch"
              className="input"
              value={form.batch}
              onChange={(e) => setForm({ ...form, batch: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="vac-practice">
              {t('vaccinationPractice')} ({t('optional')})
            </label>
            <input
              id="vac-practice"
              className="input"
              value={form.practice}
              onChange={(e) => setForm({ ...form, practice: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="vac-note">
              {t('notes')} ({t('optional')})
            </label>
            <textarea
              id="vac-note"
              className="textarea"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!form.name.trim()}
            onClick={() => {
              addVaccination({
                childId: child.id,
                date: form.date,
                name: form.name.trim(),
                batch: form.batch.trim() || undefined,
                practice: form.practice.trim() || undefined,
                note: form.note.trim() || undefined,
              });
              setOpen(false);
            }}
          >
            {t('save')}
          </button>
        </Sheet>
      )}
    </>
  );
}
