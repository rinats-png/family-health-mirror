import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SCHEMA_VERSION, clearState, loadState, saveState, saveStateSync } from '../db/persistence';
import { nowISO } from '../domain/dates';
import type {
  AppState,
  CheckupRecord,
  Child,
  DiaperEntry,
  FeedingEntry,
  HealthEntry,
  ID,
  Measurement,
  MedPreset,
  MedicationEvent,
  MilestoneRecord,
  Settings,
  SleepEntry,
  SyncMeta,
  VaccinationRecord,
} from '../domain/types';

export const CHILD_COLORS = ['#65ABC4', '#DDC6B6', '#8FBF9F', '#E0A9A2', '#B49AC7', '#E8C46B'];

function uid(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

function deviceId(): string {
  return uid('dev');
}

export function emptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    deviceId: deviceId(),
    children: [],
    entries: [],
    measurements: [],
    medPresets: [],
    medications: [],
    feedings: [],
    diapers: [],
    sleep: [],
    vaccinations: [],
    checkups: [],
    milestones: [],
    settings: {
      theme: 'system',
      nightMode: true,
      chipUsage: {},
      proUnlocked: false,
      onboarded: false,
      lastTempMethod: 'ear',
    },
  };
}

/** Ergänzt fehlende Felder, damit ältere gespeicherte Stände weiter laden. */
function migrate(loaded: AppState): AppState {
  const base = emptyState();
  return {
    ...base,
    ...loaded,
    schemaVersion: SCHEMA_VERSION,
    deviceId: loaded.deviceId || base.deviceId,
    settings: { ...base.settings, ...loaded.settings },
  };
}

type Collection =
  | 'children'
  | 'entries'
  | 'measurements'
  | 'medPresets'
  | 'medications'
  | 'feedings'
  | 'diapers'
  | 'sleep'
  | 'vaccinations'
  | 'checkups'
  | 'milestones';

interface StoreValue {
  state: AppState;
  ready: boolean;
  activeChild?: Child;
  setActiveChild: (id: ID) => void;
  addChild: (input: Omit<Child, keyof SyncMeta | 'id' | 'color'>) => Child;
  updateChild: (id: ID, patch: Partial<Child>) => void;
  removeChild: (id: ID) => void;
  add: <T extends { id: ID }>(collection: Collection, record: Omit<T, keyof SyncMeta | 'id'>) => T;
  update: (collection: Collection, id: ID, patch: Record<string, unknown>) => void;
  remove: (collection: Collection, id: ID) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  noteChipUse: (code: string) => void;
  replaceState: (next: AppState) => void;
  resetAll: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);
  /** Jüngster State für den Sofort-Flush beim Verlassen der Seite. */
  const latest = useRef<AppState>(state);

  useEffect(() => {
    let cancelled = false;
    loadState().then((loaded) => {
      if (cancelled) return;
      if (loaded) setState(migrate(loaded));
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced schreiben: schnelle Eingaben sollen die UI nicht blockieren.
  useEffect(() => {
    if (!ready) return;
    latest.current = state;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveState(state), 250);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, ready]);

  /*
   * Sofort-Flush, wenn die Seite in den Hintergrund geht oder geschlossen wird.
   *
   * Ohne das geht eine Änderung verloren, die weniger als die Debounce-Zeit vor
   * dem Schließen passiert ist — genau der Fall „Eintrag getippt, Handy sofort
   * weggelegt". Bei einer App mit dem Anspruch, keine Daten zu verlieren, ist
   * das nicht hinnehmbar.
   */
  useEffect(() => {
    if (!ready) return;
    const flush = () => {
      window.clearTimeout(saveTimer.current);
      // Synchron: eine asynchrone IndexedDB-Transaktion würde hier nicht mehr
      // fertig werden. Der reguläre Debounce-Pfad schreibt beides.
      saveStateSync(latest.current);
      void saveState(latest.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [ready]);

  const meta = useCallback(
    (): SyncMeta => ({
      createdAt: nowISO(),
      updatedAt: nowISO(),
      deviceId: state.deviceId,
    }),
    [state.deviceId],
  );

  const addChild = useCallback<StoreValue['addChild']>(
    (input) => {
      const child: Child = {
        ...input,
        id: uid('child'),
        color: CHILD_COLORS[Math.floor(Math.random() * CHILD_COLORS.length)],
        createdAt: nowISO(),
        updatedAt: nowISO(),
        deviceId: state.deviceId,
      };
      setState((s) => ({
        ...s,
        children: [...s.children, child],
        settings: { ...s.settings, activeChildId: s.settings.activeChildId ?? child.id },
      }));
      return child;
    },
    [state.deviceId],
  );

  const updateChild = useCallback<StoreValue['updateChild']>((id, patch) => {
    setState((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c,
      ),
    }));
  }, []);

  const removeChild = useCallback<StoreValue['removeChild']>((id) => {
    setState((s) => {
      const remaining = s.children.filter((c) => c.id !== id);
      return {
        ...s,
        children: remaining,
        entries: s.entries.filter((e) => e.childId !== id),
        measurements: s.measurements.filter((e) => e.childId !== id),
        medPresets: s.medPresets.filter((e) => e.childId !== id),
        medications: s.medications.filter((e) => e.childId !== id),
        feedings: s.feedings.filter((e) => e.childId !== id),
        diapers: s.diapers.filter((e) => e.childId !== id),
        sleep: s.sleep.filter((e) => e.childId !== id),
        vaccinations: s.vaccinations.filter((e) => e.childId !== id),
        checkups: s.checkups.filter((e) => e.childId !== id),
        milestones: s.milestones.filter((e) => e.childId !== id),
        settings: {
          ...s.settings,
          activeChildId:
            s.settings.activeChildId === id ? remaining[0]?.id : s.settings.activeChildId,
        },
      };
    });
  }, []);

  const add = useCallback<StoreValue['add']>(
    (collection, record) => {
      const created = {
        ...(record as object),
        id: uid(collection.slice(0, 3)),
        ...meta(),
      } as never;
      setState((s) => ({
        ...s,
        [collection]: [...(s[collection] as unknown[]), created],
      }));
      return created;
    },
    [meta],
  );

  const update = useCallback<StoreValue['update']>((collection, id, patch) => {
    setState((s) => ({
      ...s,
      [collection]: (s[collection] as { id: ID }[]).map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r,
      ),
    }));
  }, []);

  /** Tombstone statt Hard-Delete (PRD §5.3). */
  const remove = useCallback<StoreValue['remove']>((collection, id) => {
    setState((s) => ({
      ...s,
      [collection]: (s[collection] as { id: ID }[]).map((r) =>
        r.id === id ? { ...r, deleted: true, updatedAt: nowISO() } : r,
      ),
    }));
  }, []);

  const updateSettings = useCallback<StoreValue['updateSettings']>((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setActiveChild = useCallback(
    (id: ID) => updateSettings({ activeChildId: id }),
    [updateSettings],
  );

  const noteChipUse = useCallback((code: string) => {
    setState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        chipUsage: { ...s.settings.chipUsage, [code]: (s.settings.chipUsage[code] ?? 0) + 1 },
      },
    }));
  }, []);

  const replaceState = useCallback((next: AppState) => setState(migrate(next)), []);

  const resetAll = useCallback(async () => {
    await clearState();
    setState(emptyState());
  }, []);

  const activeChild = useMemo(
    () =>
      state.children.find((c) => c.id === state.settings.activeChildId) ?? state.children[0],
    [state.children, state.settings.activeChildId],
  );

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      activeChild,
      setActiveChild,
      addChild,
      updateChild,
      removeChild,
      add,
      update,
      remove,
      updateSettings,
      noteChipUse,
      replaceState,
      resetAll,
    }),
    [
      state, ready, activeChild, setActiveChild, addChild, updateChild, removeChild,
      add, update, remove, updateSettings, noteChipUse, replaceState, resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden');
  return ctx;
}

/** Typisierte Hilfsfunktionen für die häufigsten Schreibzugriffe. */
export function useActions() {
  const { add, update, remove } = useStore();
  return useMemo(
    () => ({
      addEntry: (r: Omit<HealthEntry, keyof SyncMeta | 'id'>) => add<HealthEntry>('entries', r),
      updateEntry: (id: ID, patch: Partial<HealthEntry>) => update('entries', id, patch),
      removeEntry: (id: ID) => remove('entries', id),
      addMeasurement: (r: Omit<Measurement, keyof SyncMeta | 'id'>) =>
        add<Measurement>('measurements', r),
      addMedPreset: (r: Omit<MedPreset, keyof SyncMeta | 'id'>) => add<MedPreset>('medPresets', r),
      removeMedPreset: (id: ID) => remove('medPresets', id),
      addMedication: (r: Omit<MedicationEvent, keyof SyncMeta | 'id'>) =>
        add<MedicationEvent>('medications', r),
      addFeeding: (r: Omit<FeedingEntry, keyof SyncMeta | 'id'>) =>
        add<FeedingEntry>('feedings', r),
      addDiaper: (r: Omit<DiaperEntry, keyof SyncMeta | 'id'>) => add<DiaperEntry>('diapers', r),
      addSleep: (r: Omit<SleepEntry, keyof SyncMeta | 'id'>) => add<SleepEntry>('sleep', r),
      addVaccination: (r: Omit<VaccinationRecord, keyof SyncMeta | 'id'>) =>
        add<VaccinationRecord>('vaccinations', r),
      removeVaccination: (id: ID) => remove('vaccinations', id),
      addCheckup: (r: Omit<CheckupRecord, keyof SyncMeta | 'id'>) =>
        add<CheckupRecord>('checkups', r),
      removeCheckup: (id: ID) => remove('checkups', id),
      addMilestone: (r: Omit<MilestoneRecord, keyof SyncMeta | 'id'>) =>
        add<MilestoneRecord>('milestones', r),
      removeMilestone: (id: ID) => remove('milestones', id),
    }),
    [add, update, remove],
  );
}
