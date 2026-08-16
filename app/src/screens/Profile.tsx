import { useState } from 'react';
import { CATEGORY_PALETTE } from '../data/categories';
import { useI18n } from '../i18n';
import { categoryLabel } from '../domain/categories';
import { formatAge, formatDateShort, todayISO } from '../domain/dates';
import { exportCsv, exportJson } from '../domain/export';
import { useActions, useStore } from '../store/store';
import type { AppState, Child, Locale, Sex } from '../domain/types';
import { DateField } from '../ui/DateField';
import { Sheet } from '../ui/Sheet';
import { ExportSheet } from './ExportSheet';
import { ShareSheet } from './ShareSheet';

export function Profile({ child }: { child: Child }) {
  const { t, locale } = useI18n();
  const {
    state, addChild, updateChild, removeChild, clearChildData, setActiveChild,
    updateSettings, replaceState, resetAll, enableLock, disableLock,
  } = useStore();
  const { addCategory, updateCategory, removeCategory } = useActions();

  const [addingChild, setAddingChild] = useState(false);
  // Geburtsdatum bewusst leer: siehe Onboarding — ein vorbelegtes „heute"
  // wird übersehen und macht jede Altersangabe falsch.
  const [childForm, setChildForm] = useState({ name: '', birthDate: '' });
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState<Child | null>(null);
  const [tileDraft, setTileDraft] = useState('');
  const [lockOpen, setLockOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [lockError, setLockError] = useState('');

  const { pro } = state.settings;

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const next: AppState = parsed.state ?? parsed;
        if (!next || !Array.isArray(next.children)) throw new Error('format');
        replaceState(next);
      } catch {
        alert('Import failed / Import fehlgeschlagen');
      }
    };
    reader.readAsText(file);
  };

  const submitLock = async () => {
    if (pw.length < 8) {
      setLockError(t('lockTooShort'));
      return;
    }
    if (pw !== pw2) {
      setLockError(t('lockMismatch'));
      return;
    }
    await enableLock(pw);
    setPw('');
    setPw2('');
    setLockError('');
    setLockOpen(false);
  };

  return (
    <>
      <div className="screen-head">
        <h1 className="screen-title">{t('profileTitle')}</h1>
      </div>

      <section className="section">
        <div className="section__title">{t('children')}</div>
        <div className="list">
          {state.children.map((c) => (
            <div key={c.id} className="list-item">
              <span className="avatar" style={{ background: c.color }} aria-hidden>
                {c.photo ? (
                  <img src={c.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  c.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <div className="list-item__main">
                <div className="list-item__title">
                  {c.name} {c.id === child.id && <span className="pro-badge">{t('childActive')}</span>}
                </div>
                <div className="list-item__meta">
                  {formatDateShort(c.birthDate, locale)} · {formatAge(c.birthDate, locale)} ·{' '}
                  {state.entries.filter((e) => e.childId === c.id).length} {t('childCount')}
                </div>
              </div>
              {c.id !== child.id && (
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setActiveChild(c.id)}>
                  {t('childSwitch')}
                </button>
              )}
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                aria-label={`${t('childShare')} — ${c.name}`}
                onClick={() => setSharing(c)}
              >
                ⇄
              </button>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                aria-label={`${t('delete')} — ${c.name}`}
                onClick={() => {
                  if (confirm(`${c.name}: ${t('childDeleteConfirm')}`)) removeChild(c.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          style={{ marginTop: 'var(--space-3)' }}
          onClick={() => {
            setChildForm({ name: '', birthDate: '' });
            setAddingChild(true);
          }}
        >
          + {t('childAdd')}
        </button>
        <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>
          {t('childDataSeparate')}
        </p>
      </section>

      <section className="section">
        <div className="section__title">{child.name}</div>
        <div className="tile tile--wide">
          <div className="field">
            <label className="field__label" htmlFor="p-name">{t('obNameLabel')}</label>
            <input
              id="p-name"
              className="input"
              value={child.name}
              onChange={(e) => updateChild(child.id, { name: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="p-birth">{t('obBirthLabel')}</label>
            <DateField
              id="p-birth"
              value={child.birthDate}
              max={todayISO()}
              onCommit={(v) => updateChild(child.id, { birthDate: v })}
            />
          </div>
          <div className="field">
            <span className="field__label">{t('childSex')}</span>
            <div className="seg">
              {(
                [
                  [undefined, t('sexUnset')],
                  ['f', t('sexFemale')],
                  ['m', t('sexMale')],
                  ['x', t('sexOther')],
                ] as [Sex | undefined, string][]
              ).map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  className="seg__item"
                  aria-pressed={child.sex === value}
                  onClick={() => updateChild(child.id, { sex: value })}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="small muted" style={{ marginTop: 6 }}>{t('childSexHint')}</p>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="p-photo">{t('childPhoto')}</label>
            <input
              id="p-photo"
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => updateChild(child.id, { photo: String(reader.result) });
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('tilesTitle')}</div>
        <div className="list">
          {[...state.categories].sort((a, b) => a.order - b.order).map((c) => (
            <div key={c.id} className="list-item">
              <span className="avatar" style={{ background: c.color }} aria-hidden>{c.icon}</span>
              <div className="list-item__main">
                <input
                  className="input"
                  value={categoryLabel(c, locale)}
                  disabled={!pro}
                  onChange={(e) => updateCategory(c.id, { customLabel: e.target.value })}
                  aria-label={t('tileLabel')}
                />
              </div>
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                disabled={!pro}
                onClick={() => updateCategory(c.id, { hidden: !c.hidden })}
              >
                {c.hidden ? t('tileShow') : t('tileHide')}
              </button>
              {!c.builtInKey && (
                <button
                  type="button"
                  className="btn btn--sm btn--ghost"
                  aria-label={t('delete')}
                  onClick={() => removeCategory(c.id)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {pro ? (
          <div className="row" style={{ marginTop: 'var(--space-3)' }}>
            <input
              className="input"
              placeholder={t('tileNew')}
              value={tileDraft}
              onChange={(e) => setTileDraft(e.target.value)}
            />
            <button
              type="button"
              className="btn btn--sm btn--primary"
              disabled={!tileDraft.trim()}
              onClick={() => {
                addCategory({
                  customLabel: tileDraft.trim(),
                  icon: '📝',
                  color: CATEGORY_PALETTE[state.categories.length % CATEGORY_PALETTE.length],
                  order: state.categories.length,
                });
                setTileDraft('');
              }}
            >
              {t('add')}
            </button>
          </div>
        ) : (
          <div className="note note--info" style={{ marginTop: 'var(--space-3)' }}>
            {t('proNeededTiles')}
          </div>
        )}
        <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>{t('tilesHint')}</p>
      </section>

      <section className="section">
        <div className="section__title">{t('unitsTitle')}</div>
        <div className="tile tile--wide">
          <div className="field">
            <div className="seg">
              {(['kg', 'lb'] as const).map((u) => (
                <button key={u} type="button" className="seg__item"
                  aria-pressed={state.settings.weightUnit === u}
                  onClick={() => updateSettings({ weightUnit: u })}>{u}</button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="seg">
              {(['cm', 'in'] as const).map((u) => (
                <button key={u} type="button" className="seg__item"
                  aria-pressed={state.settings.lengthUnit === u}
                  onClick={() => updateSettings({ lengthUnit: u })}>{u}</button>
              ))}
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <div className="seg">
              {(['C', 'F'] as const).map((u) => (
                <button key={u} type="button" className="seg__item"
                  aria-pressed={state.settings.temperatureUnit === u}
                  onClick={() => updateSettings({ temperatureUnit: u })}>°{u}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('appearance')}</div>
        <div className="tile tile--wide">
          <div className="field">
            <span className="field__label">{t('language')}</span>
            <div className="seg">
              {(['de', 'en'] as Locale[]).map((l) => (
                <button key={l} type="button" className="seg__item"
                  aria-pressed={state.settings.locale === l}
                  onClick={() => updateSettings({ locale: l })}>
                  {l === 'de' ? 'Deutsch' : 'English'}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="seg">
              {(
                [
                  ['system', t('themeSystem')],
                  ['light', t('themeLight')],
                  ['dark', t('themeDark')],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="button" className="seg__item"
                  aria-pressed={state.settings.theme === value}
                  onClick={() => updateSettings({ theme: value })}>{label}</button>
              ))}
            </div>
          </div>
          <label className="row" style={{ gap: 'var(--space-2)' }}>
            <input
              type="checkbox"
              checked={state.settings.nightMode}
              onChange={(e) => updateSettings({ nightMode: e.target.checked })}
              style={{ width: 22, height: 22 }}
            />
            <span>{t('nightModeLabel')}</span>
          </label>
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('security')}</div>
        <div className="tile tile--wide">
          <div className="tile__label">{t('lockTitle')}</div>
          <p className="tile__meta" style={{ marginBottom: 'var(--space-3)' }}>{t('lockHint')}</p>
          {state.settings.lockEnabled ? (
            <button type="button" className="btn btn--block" onClick={() => void disableLock()}>
              {t('lockDisable')}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={() => {
                setPw('');
                setPw2('');
                setLockError('');
                setLockOpen(true);
              }}
            >
              {t('lockEnable')}
            </button>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('proTitle')}</div>
        <div className="tile tile--wide">
          <p className="tile__meta" style={{ marginBottom: 'var(--space-3)' }}>{t('proBody')}</p>
          <button
            type="button"
            className={pro ? 'btn btn--block' : 'btn btn--primary btn--block'}
            onClick={() => updateSettings({ pro: !pro })}
          >
            {pro ? t('proDisable') : t('proEnable')}
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section__title">{t('dataTitle')}</div>
        <div className="stack">
          <button type="button" className="btn btn--primary btn--block" onClick={() => setExporting(true)}>
            {t('exportPdf')}
          </button>
          <button
            type="button"
            className="btn btn--block"
            disabled={!pro}
            onClick={() => exportJson(state)}
          >
            {t('exportJson')}
          </button>
          <button
            type="button"
            className="btn btn--block"
            disabled={!pro}
            onClick={() => exportCsv(state, child)}
          >
            {t('exportCsv')}
          </button>
          {!pro && <p className="small muted">{t('proNeededExport')}</p>}
          <label className="btn btn--block" style={{ cursor: 'pointer' }}>
            {t('importJson')}
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importJson(file);
              }}
            />
          </label>
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => {
              if (confirm(`${child.name}: ${t('childClearDataConfirm')}`)) clearChildData(child.id);
            }}
          >
            {t('childClearData')} — {child.name}
          </button>
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => {
              if (confirm(t('deleteAllConfirm'))) void resetAll();
            }}
          >
            {t('deleteAll')}
          </button>
          <p className="small muted">{t('dataHint')}</p>
        </div>
      </section>

      <p className="disclaimer">{t('purposeShort')}</p>

      {addingChild && (
        <Sheet open onClose={() => setAddingChild(false)} title={t('childAdd')}>
          <div className="field">
            <label className="field__label" htmlFor="nc-name">{t('obNameLabel')}</label>
            <input
              id="nc-name"
              className="input"
              autoFocus
              value={childForm.name}
              placeholder={t('obNamePlaceholder')}
              onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="nc-birth">{t('obBirthLabel')}</label>
            <DateField
              id="nc-birth"
              value={childForm.birthDate}
              max={todayISO()}
              onCommit={(v) => setChildForm({ ...childForm, birthDate: v })}
            />
          </div>
          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!childForm.name.trim() || !childForm.birthDate}
            onClick={() => {
              const created = addChild({
                name: childForm.name.trim(),
                birthDate: childForm.birthDate,
              });
              setActiveChild(created.id);
              setAddingChild(false);
            }}
          >
            {t('save')}
          </button>
        </Sheet>
      )}

      {lockOpen && (
        <Sheet open onClose={() => setLockOpen(false)} title={t('lockTitle')}>
          <div className="note note--warn" style={{ marginBottom: 'var(--space-4)' }}>
            {t('lockHint')}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="lock-pw">{t('lockPassword')}</label>
            <input
              id="lock-pw"
              className="input"
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="lock-pw2">{t('lockPasswordRepeat')}</label>
            <input
              id="lock-pw2"
              className="input"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </div>
          {lockError && <div className="note note--warn" style={{ marginBottom: 'var(--space-3)' }}>{lockError}</div>}
          <button type="button" className="btn btn--primary btn--block" onClick={() => void submitLock()}>
            {t('save')}
          </button>
        </Sheet>
      )}

      {exporting && <ExportSheet child={child} onClose={() => setExporting(false)} />}

      {sharing && <ShareSheet child={sharing} onClose={() => setSharing(null)} />}
    </>
  );
}
