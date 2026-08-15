import { useState } from 'react';
import { useI18n } from '../i18n';
import { useStore } from '../store/store';

/** Entsperrbildschirm bei aktiver App-Sperre (Abschnitt 8). */
export function LockScreen() {
  const { t } = useI18n();
  const { unlock } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const ok = await unlock(password);
    setBusy(false);
    if (!ok) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="app">
      <main className="app__main" style={{ paddingBottom: 'var(--space-6)' }}>
        <div className="screen-head" style={{ paddingTop: 'var(--space-6)' }}>
          <h1 className="screen-title">{t('lockUnlockTitle')}</h1>
          <p className="screen-sub">{t('appName')}</p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="unlock-pw">{t('lockPassword')}</label>
          <input
            id="unlock-pw"
            className="input"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && password) void submit();
            }}
          />
        </div>

        {error && <div className="note note--warn" style={{ marginBottom: 'var(--space-3)' }}>{t('lockWrong')}</div>}

        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!password || busy}
          onClick={() => void submit()}
        >
          {t('lockUnlock')}
        </button>

        <p className="disclaimer">{t('lockHint')}</p>
      </main>
    </div>
  );
}
