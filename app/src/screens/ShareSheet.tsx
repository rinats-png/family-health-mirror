import { useRef, useState } from 'react';
import { useI18n } from '../i18n';
import { formatDateTimeShort } from '../domain/dates';
import { download } from '../domain/export';
import {
  buildSharePackage,
  countPayload,
  normalizeShareCode,
  openSharePackage,
  parseSharePackage,
  type SharePackage,
} from '../domain/share';
import { useStore } from '../store/store';
import type { Child } from '../domain/types';
import { Sheet } from '../ui/Sheet';

/**
 * Ein Kind zu zweit führen.
 *
 * Zwei Richtungen, dasselbe Blatt: Wer teilt, erzeugt Code und Paket. Wer
 * übernimmt, gibt den Code ein und wählt die Datei. Danach ist das Kind auf
 * beiden Geräten dasselbe — gleiche Kennung, gleicher Bestand.
 *
 * Was hier bewusst fehlt, und warum: ein Server. Es gibt keinen Endpunkt, an
 * den die Daten gehen. Das Paket geht den Weg, den der Nutzer selbst wählt.
 * Der Preis dafür steht in der Oberfläche und nicht im Kleingedruckten — es
 * ist ein Abgleich zu einem Zeitpunkt, keine laufende Verbindung.
 */
export function ShareSheet({ child, onClose }: { child: Child; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { state, ensureShareCode, mergeShare } = useStore();
  const [mode, setMode] = useState<'give' | 'take'>('give');
  const [code, setCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [pending, setPending] = useState<SharePackage | null>(null);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const live = state.children.find((c) => c.id === child.id) ?? child;
  const shown = code || live.shareCode || '';

  const reveal = () => setCode(ensureShareCode(live.id));

  const makePackage = async () => {
    const value = ensureShareCode(live.id);
    setCode(value);
    const pkg = await buildSharePackage(state, { ...live, shareCode: value }, value);
    download(
      `${live.name.replace(/[^\w-]+/g, '_')}-uebergabe.json`,
      JSON.stringify(pkg),
      'application/json',
    );
  };

  const pickFile = (file: File) => {
    setStatus(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setPending(parseSharePackage(String(reader.result)));
      } catch {
        setPending(null);
        setStatus({ kind: 'error', text: t('shareFileInvalid') });
      }
    };
    reader.readAsText(file);
  };

  const adopt = async () => {
    if (!pending) return;
    try {
      const payload = await openSharePackage(pending, codeInput);
      mergeShare(payload);
      setStatus({ kind: 'ok', text: `${t('shareAdopted')} · ${countPayload(payload)}` });
      setPending(null);
      setCodeInput('');
    } catch {
      setStatus({ kind: 'error', text: t('shareCodeWrong') });
    }
  };

  return (
    <Sheet open onClose={onClose} title={t('shareTitle')}>
      <div className="seg" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          type="button" className="seg__item" aria-pressed={mode === 'give'}
          onClick={() => { setMode('give'); setStatus(null); }}
        >
          {t('shareGive')}
        </button>
        <button
          type="button" className="seg__item" aria-pressed={mode === 'take'}
          onClick={() => { setMode('take'); setStatus(null); }}
        >
          {t('shareTake')}
        </button>
      </div>

      {mode === 'give' ? (
        <>
          <div className="field">
            <span className="field__label">{t('shareCodeOf')} {live.name}</span>
            {shown ? (
              <div className="input tabular" style={{ display: 'flex', alignItems: 'center', letterSpacing: '0.12em', fontWeight: 700 }}>
                {shown}
              </div>
            ) : (
              <button type="button" className="btn btn--block" onClick={reveal}>
                {t('shareCreateCode')}
              </button>
            )}
            <p className="small muted" style={{ marginTop: 6 }}>{t('shareCodeHint')}</p>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => void makePackage()}
          >
            {t('sharePackage')}
          </button>
          <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t('sharePackageHint')}</p>
        </>
      ) : (
        <>
          <div className="field">
            <label className="field__label" htmlFor="share-file">{t('shareFile')}</label>
            <input
              id="share-file"
              ref={fileRef}
              className="input"
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pickFile(file);
              }}
            />
          </div>

          {pending && (
            <div className="note note--info" style={{ marginBottom: 'var(--space-4)' }}>
              {pending.childName} · {formatDateTimeShort(pending.createdAt, locale)}
            </div>
          )}

          <div className="field">
            <label className="field__label" htmlFor="share-code">{t('shareEnterCode')}</label>
            <input
              id="share-code"
              className="input tabular"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!pending || normalizeShareCode(codeInput).length < 8}
            onClick={() => void adopt()}
          >
            {t('shareAdopt')}
          </button>
          <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t('shareMergeHint')}</p>
        </>
      )}

      {status && (
        <div
          className={status.kind === 'ok' ? 'note note--info' : 'note note--warn'}
          style={{ marginTop: 'var(--space-4)' }}
        >
          {status.text}
        </div>
      )}

      <p className="small muted" style={{ marginTop: 'var(--space-4)' }}>{t('shareNoServer')}</p>
    </Sheet>
  );
}
