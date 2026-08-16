import { useEffect, useRef, useState } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { EntrySheet } from './screens/EntrySheet';
import { History } from './screens/History';
import { LockScreen } from './screens/LockScreen';
import { Measurements } from './screens/Measurements';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { Today } from './screens/Today';
import { Vaccinations } from './screens/Vaccinations';
import { useActions, useStore } from './store/store';
import { Sheet } from './ui/Sheet';
import { formatAge } from './domain/dates';
import type { Entry } from './domain/types';

type Tab = 'today' | 'history' | 'measurements' | 'vaccinations' | 'profile';

const UNDO_MS = 8000;

function Shell() {
  const { t } = useI18n();
  const { state, ready, lockState, activeChild, setActiveChild } = useStore();
  const { removeEntry } = useActions();
  const [tab, setTab] = useState<Tab>('today');
  const [sheetEntry, setSheetEntry] = useState<Entry | null>(null);
  const [undoId, setUndoId] = useState<string | null>(null);
  const [childPicker, setChildPicker] = useState(false);
  const undoTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  if (!ready) {
    return (
      <div className="app">
        <main className="app__main">
          <p className="muted" style={{ paddingTop: 'var(--space-6)' }}>…</p>
        </main>
      </div>
    );
  }

  if (lockState === 'locked') return <LockScreen />;
  if (!activeChild || !state.settings.onboarded) return <Onboarding />;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'today', label: t('navToday'), icon: '▣' },
    { id: 'history', label: t('navHistory'), icon: '▤' },
    { id: 'measurements', label: t('navMeasurements'), icon: '📈' },
    { id: 'vaccinations', label: t('navVaccinations'), icon: '💉' },
    { id: 'profile', label: t('navProfile'), icon: '○' },
  ];

  const openSheet = (entry: Entry) => {
    window.clearTimeout(undoTimer.current);
    setUndoId(null);
    setSheetEntry(entry);
  };

  const closeSheet = () => {
    const id = sheetEntry?.id;
    setSheetEntry(null);
    if (!id) return;
    // Nur anbieten, solange der Eintrag noch existiert (im Blatt löschbar).
    if (!state.entries.some((e) => e.id === id)) return;
    setUndoId(id);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoId(null), UNDO_MS);
  };


  return (
    <div className="app">
      <header className="topbar">
        {/* Früher wurde beim Tippen zum nächsten Kind weitergeschaltet. Ab drei
            Kindern ist das Raten; die Auswahl zeigt jetzt alle auf einmal. */}
        <button
          type="button"
          className="child-switch"
          onClick={() => setChildPicker(true)}
          aria-haspopup="dialog"
          aria-label={`${activeChild.name} — ${t('childPick')}`}
        >
          <span className="avatar" style={{ background: activeChild.color }} aria-hidden>
            {activeChild.photo ? (
              <img
                src={activeChild.photo}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              activeChild.name.slice(0, 1).toUpperCase()
            )}
          </span>
          <strong>{activeChild.name}</strong>
          <span aria-hidden className="muted">▾</span>
        </button>
        <div className="topbar__spacer" />
        <button
          type="button"
          className="icon-btn"
          aria-label={t('navProfile')}
          onClick={() => setTab('profile')}
        >
          ⚙
        </button>
      </header>

      <main className="app__main">
        {tab === 'today' && <Today child={activeChild} onOpenEntry={openSheet} />}
        {tab === 'history' && <History child={activeChild} onOpenEntry={openSheet} />}
        {tab === 'measurements' && <Measurements child={activeChild} />}
        {tab === 'vaccinations' && <Vaccinations child={activeChild} />}
        {tab === 'profile' && <Profile child={activeChild} />}
      </main>

      <nav className="tabbar" aria-label={t('appName')}>
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            className="tabbar__item"
            aria-current={tab === x.id}
            onClick={() => setTab(x.id)}
          >
            <span className="tabbar__icon" aria-hidden>{x.icon}</span>
            <span>{x.label}</span>
          </button>
        ))}
      </nav>

      {childPicker && (
        <Sheet open onClose={() => setChildPicker(false)} title={t('childPick')}>
          <div className="list list--grouped">
            {state.children.map((c) => (
              <button
                key={c.id}
                type="button"
                className="list-item"
                aria-current={c.id === activeChild.id}
                onClick={() => {
                  setActiveChild(c.id);
                  setChildPicker(false);
                }}
              >
                <span className="avatar" style={{ background: c.color }} aria-hidden>
                  {c.photo ? (
                    <img
                      src={c.photo}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    c.name.slice(0, 1).toUpperCase()
                  )}
                </span>
                <div className="list-item__main">
                  <div className="list-item__title">{c.name}</div>
                  <div className="list-item__meta">
                    {formatAge(c.birthDate, state.settings.locale)} ·{' '}
                    {state.entries.filter((e) => e.childId === c.id).length} {t('childCount')}
                  </div>
                </div>
                {c.id === activeChild.id && <span className="pro-badge">{t('childActive')}</span>}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--block"
            style={{ marginTop: 'var(--space-4)' }}
            onClick={() => {
              setChildPicker(false);
              setTab('profile');
            }}
          >
            + {t('childAdd')}
          </button>
          <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>
            {t('childDataSeparate')}
          </p>
        </Sheet>
      )}

      {sheetEntry && <EntrySheet entry={sheetEntry} onClose={closeSheet} />}

      {undoId && (
        <div className="toast" role="status">
          <span>{t('entrySaved')}</span>
          <button
            type="button"
            className="toast__action"
            onClick={() => {
              removeEntry(undoId);
              setUndoId(null);
              window.clearTimeout(undoTimer.current);
            }}
          >
            {t('undo')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { state } = useStore();

  // Thema und Nachtmodus auf dem Wurzelelement setzen.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const dark =
        state.settings.theme === 'dark' || (state.settings.theme === 'system' && prefersDark);
      root.dataset.theme = dark ? 'dark' : 'light';
      const hour = new Date().getHours();
      root.dataset.night = String(state.settings.nightMode && (hour >= 21 || hour < 6));
      root.lang = state.settings.locale;
    };
    apply();
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', apply);
    const interval = window.setInterval(apply, 60_000);
    return () => {
      mq?.removeEventListener?.('change', apply);
      window.clearInterval(interval);
    };
  }, [state.settings.theme, state.settings.nightMode, state.settings.locale]);

  return (
    <I18nProvider locale={state.settings.locale}>
      <Shell />
    </I18nProvider>
  );
}
