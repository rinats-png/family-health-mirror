import { useEffect, useRef, useState } from 'react';
import { Dashboard } from './screens/Dashboard';
import { Insights } from './screens/Insights';
import { Onboarding } from './screens/Onboarding';
import { Profile } from './screens/Profile';
import { QuickEntrySheet } from './screens/QuickEntrySheet';
import { Tracker } from './screens/Tracker';
import { Vaccinations } from './screens/Vaccinations';
import { useActions, useStore } from './store/store';
import type { HealthEntry } from './domain/types';

type Tab = 'home' | 'tracker' | 'vaccines' | 'insights' | 'profile';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Übersicht', icon: '▣' },
  { id: 'tracker', label: 'Tracker', icon: '✎' },
  { id: 'vaccines', label: 'Impfungen', icon: '💉' },
  { id: 'insights', label: 'Auswertung', icon: '📈' },
  { id: 'profile', label: 'Profil', icon: '○' },
];

/** Undo-Fenster nach einem Schnelleintrag (PRD §2, Phase 3). */
const UNDO_MS = 8000;

export default function App() {
  const { state, ready, activeChild, setActiveChild } = useStore();
  const { removeEntry } = useActions();
  const [tab, setTab] = useState<Tab>('home');
  const [sheetEntry, setSheetEntry] = useState<HealthEntry | null>(null);
  const [undoEntryId, setUndoEntryId] = useState<string | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

  // Thema und Nachtmodus auf dem Wurzelelement setzen.
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      const dark =
        state.settings.theme === 'dark' ||
        (state.settings.theme === 'system' && prefersDark);
      root.dataset.theme = dark ? 'dark' : 'light';
      const hour = new Date().getHours();
      root.dataset.night = String(state.settings.nightMode && (hour >= 21 || hour < 6));
    };
    apply();
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', apply);
    const interval = window.setInterval(apply, 60_000);
    return () => {
      mq?.removeEventListener?.('change', apply);
      window.clearInterval(interval);
    };
  }, [state.settings.theme, state.settings.nightMode]);

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  if (!ready) {
    return (
      <div className="app">
        <main className="app__main">
          <p className="muted" style={{ paddingTop: 'var(--space-6)' }}>Lade …</p>
        </main>
      </div>
    );
  }

  if (!activeChild || !state.settings.onboarded) return <Onboarding />;

  const openSheet = (entry: HealthEntry) => {
    window.clearTimeout(undoTimer.current);
    setUndoEntryId(null);
    setSheetEntry(entry);
  };

  const closeSheet = () => {
    const id = sheetEntry?.id;
    setSheetEntry(null);
    if (!id) return;
    setUndoEntryId(id);
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndoEntryId(null), UNDO_MS);
  };

  const cycleChild = () => {
    if (state.children.length < 2) {
      setTab('profile');
      return;
    }
    const idx = state.children.findIndex((c) => c.id === activeChild.id);
    setActiveChild(state.children[(idx + 1) % state.children.length].id);
  };

  return (
    <div className="app">
      <header className="topbar">
        <button
          type="button"
          className="child-switch"
          onClick={cycleChild}
          aria-label={
            state.children.length > 1
              ? `Aktives Kind: ${activeChild.name}. Zum nächsten Kind wechseln.`
              : `Aktives Kind: ${activeChild.name}. Kinder verwalten.`
          }
        >
          <span className="avatar" style={{ background: activeChild.color }} aria-hidden>
            {activeChild.name.slice(0, 1).toUpperCase()}
          </span>
          <strong>{activeChild.name}</strong>
          <span aria-hidden className="muted">▾</span>
        </button>
        <div className="topbar__spacer" />
        <button
          type="button"
          className="icon-btn"
          aria-label="Profil und Einstellungen"
          onClick={() => setTab('profile')}
        >
          ⚙
        </button>
      </header>

      <main className="app__main">
        {tab === 'home' && (
          <Dashboard child={activeChild} onQuickEntry={openSheet} onNavigate={setTab} />
        )}
        {tab === 'tracker' && <Tracker child={activeChild} onOpenEntry={openSheet} />}
        {tab === 'vaccines' && <Vaccinations child={activeChild} />}
        {tab === 'insights' && <Insights child={activeChild} />}
        {tab === 'profile' && <Profile child={activeChild} />}
      </main>

      <nav className="tabbar" aria-label="Hauptnavigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tabbar__item"
            aria-current={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            <span className="tabbar__icon" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {sheetEntry && (
        <QuickEntrySheet entry={sheetEntry} child={activeChild} onClose={closeSheet} />
      )}

      {undoEntryId && (
        <div className="toast" role="status">
          <span>Eintrag gespeichert</span>
          <button
            type="button"
            className="toast__action"
            onClick={() => {
              removeEntry(undoEntryId);
              setUndoEntryId(null);
              window.clearTimeout(undoTimer.current);
            }}
          >
            Rückgängig
          </button>
        </div>
      )}
    </div>
  );
}
