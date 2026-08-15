import { useState } from 'react';
import { useI18n } from '../i18n';
import { todayISO } from '../domain/dates';
import { useStore } from '../store/store';

/**
 * Onboarding (Abschnitt 6: kein Onboarding-Zwang, kein Pflichtkonto).
 * Zwei Bildschirme, zwei Pflichtfelder, danach ist die App nutzbar.
 */
export function Onboarding() {
  const { t } = useI18n();
  const { addChild, updateSettings } = useStore();
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(todayISO());

  return (
    <div className="app">
      <main className="app__main" style={{ paddingBottom: 'var(--space-6)' }}>
        {step === 0 ? (
          <>
            <div className="screen-head" style={{ paddingTop: 'var(--space-6)' }}>
              <h1 className="screen-title">{t('obTitle')}</h1>
              <p className="screen-sub" style={{ fontSize: 17, marginTop: 'var(--space-3)' }}>
                {t('obLead')}
              </p>
            </div>

            <div className="stack" style={{ marginTop: 'var(--space-5)' }}>
              {(
                [
                  ['obPoint1Title', 'obPoint1Body'],
                  ['obPoint2Title', 'obPoint2Body'],
                  ['obPoint3Title', 'obPoint3Body'],
                ] as const
              ).map(([title, body]) => (
                <div className="tile tile--brand" key={title}>
                  <div className="tile__label">{t(title)}</div>
                  <p className="tile__meta">{t(body)}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              style={{ marginTop: 'var(--space-5)' }}
              onClick={() => setStep(1)}
            >
              {t('obStart')}
            </button>

            <p className="disclaimer">{t('purposeShort')}</p>
          </>
        ) : (
          <>
            <div className="screen-head" style={{ paddingTop: 'var(--space-6)' }}>
              <h1 className="screen-title">{t('obChildTitle')}</h1>
              <p className="screen-sub">{t('obChildLead')}</p>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="ob-name">{t('obNameLabel')}</label>
              <input
                id="ob-name"
                className="input"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder={t('obNamePlaceholder')}
              />
              <p className="small muted" style={{ marginTop: 6 }}>{t('obNameHint')}</p>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="ob-birth">{t('obBirthLabel')}</label>
              <input
                id="ob-birth"
                className="input"
                type="date"
                value={birthDate}
                max={todayISO()}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn--primary btn--block"
              disabled={!name.trim()}
              onClick={() => {
                addChild({ name: name.trim(), birthDate });
                updateSettings({ onboarded: true });
              }}
            >
              {t('done')}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--block"
              style={{ marginTop: 'var(--space-2)' }}
              onClick={() => setStep(0)}
            >
              {t('back')}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
