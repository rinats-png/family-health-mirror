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
import { BUILT_IN_CATEGORIES, CHILD_COLORS } from '../data/categories';
import { DEFAULT_REFERENCE_ID } from '../data/growthReferences';
import { deriveKey, randomSalt } from '../db/crypto';
import {
  SCHEMA_VERSION,
  clearState,
  decryptEnvelope,
  loadEnvelope,
  saveStateEncrypted,
  saveStatePlain,
  saveStatePlainSync,
  type Envelope,
} from '../db/persistence';
import { nowISO } from '../domain/dates';
import type {
  AppState,
  Category,
  Child,
  Entry,
  ID,
  Measurement,
  PassPhoto,
  Reminder,
  Settings,
  SyncMeta,
  VaccinationRecord,
} from '../domain/types';

function uid(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}

function meta(): SyncMeta {
  return { createdAt: nowISO(), updatedAt: nowISO() };
}

function defaultCategories(): Category[] {
  return BUILT_IN_CATEGORIES.map((c, i) => ({
    id: `cat_${c.key}`,
    builtInKey: c.key,
    icon: c.icon,
    color: c.color,
    order: i,
    ...meta(),
  }));
}

function browserLocale(): 'de' | 'en' {
  if (typeof navigator === 'undefined') return 'de';
  return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
}

export function emptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    children: [],
    categories: defaultCategories(),
    entries: [],
    measurements: [],
    reminders: [],
    vaccinations: [],
    passPhotos: [],
    settings: {
      locale: browserLocale(),
      theme: 'system',
      nightMode: true,
      pro: false,
      weightUnit: 'kg',
      lengthUnit: 'cm',
      temperatureUnit: 'C',
      growthReferenceId: DEFAULT_REFERENCE_ID,
      onboarded: false,
      lockEnabled: false,
    },
  };
}

function migrate(loaded: AppState): AppState {
  const base = emptyState();
  return {
    ...base,
    ...loaded,
    schemaVersion: SCHEMA_VERSION,
    categories: loaded.categories?.length ? loaded.categories : base.categories,
    settings: { ...base.settings, ...loaded.settings },
  };
}

type Collection =
  | 'entries'
  | 'measurements'
  | 'reminders'
  | 'vaccinations'
  | 'passPhotos'
  | 'categories';

export type LockState = 'open' | 'locked' | 'unsupported';

interface StoreValue {
  state: AppState;
  ready: boolean;
  lockState: LockState;
  activeChild?: Child;

  unlock: (password: string) => Promise<boolean>;
  enableLock: (password: string) => Promise<void>;
  disableLock: () => Promise<void>;

  setActiveChild: (id: ID) => void;
  addChild: (input: Pick<Child, 'name' | 'birthDate'> & Partial<Child>) => Child;
  updateChild: (id: ID, patch: Partial<Child>) => void;
  removeChild: (id: ID) => void;

  add: <T extends { id: ID }>(collection: Collection, record: Omit<T, keyof SyncMeta | 'id'>) => T;
  update: (collection: Collection, id: ID, patch: Record<string, unknown>) => void;
  remove: (collection: Collection, id: ID) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  replaceState: (next: AppState) => void;
  resetAll: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);
  const [lockState, setLockState] = useState<LockState>('open');
  const [pendingEnvelope, setPendingEnvelope] = useState<Envelope | null>(null);

  const cryptoKey = useRef<CryptoKey | null>(null);
  const salt = useRef<string | null>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const latest = useRef<AppState>(state);

  useEffect(() => {
    let cancelled = false;
    loadEnvelope()
      .then((envelope) => {
        if (cancelled) return;
        if (!envelope) {
          setReady(true);
          return;
        }
        if (envelope.kind === 'plain') {
          setState(migrate(envelope.state));
          setReady(true);
          return;
        }
        // Verschlüsselt: erst nach Eingabe des Passworts nutzbar.
        setPendingEnvelope(envelope);
        salt.current = envelope.salt;
        setLockState('locked');
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: AppState) => {
    if (cryptoKey.current && salt.current) {
      await saveStateEncrypted(next, cryptoKey.current, salt.current);
    } else {
      await saveStatePlain(next);
    }
  }, []);

  useEffect(() => {
    if (!ready || lockState === 'locked') return;
    latest.current = state;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void persist(state), 250);
    return () => window.clearTimeout(saveTimer.current);
  }, [state, ready, lockState, persist]);

  // Sofort sichern, wenn die Seite in den Hintergrund geht oder geschlossen wird.
  useEffect(() => {
    if (!ready || lockState === 'locked') return;
    const flush = () => {
      window.clearTimeout(saveTimer.current);
      if (!cryptoKey.current) saveStatePlainSync(latest.current);
      void persist(latest.current);
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
  }, [ready, lockState, persist]);

  const unlock = useCallback<StoreValue['unlock']>(
    async (password) => {
      if (!pendingEnvelope || pendingEnvelope.kind !== 'encrypted') return false;
      try {
        const key = await deriveKey(password, pendingEnvelope.salt);
        const decrypted = await decryptEnvelope(pendingEnvelope, key);
        cryptoKey.current = key;
        salt.current = pendingEnvelope.salt;
        setState(migrate(decrypted));
        setPendingEnvelope(null);
        setLockState('open');
        return true;
      } catch {
        return false;
      }
    },
    [pendingEnvelope],
  );

  const enableLock = useCallback<StoreValue['enableLock']>(
    async (password) => {
      const newSalt = randomSalt();
      const key = await deriveKey(password, newSalt);
      cryptoKey.current = key;
      salt.current = newSalt;
      const next = { ...latest.current, settings: { ...latest.current.settings, lockEnabled: true } };
      setState(next);
      await saveStateEncrypted(next, key, newSalt);
    },
    [],
  );

  const disableLock = useCallback<StoreValue['disableLock']>(async () => {
    cryptoKey.current = null;
    salt.current = null;
    const next = { ...latest.current, settings: { ...latest.current.settings, lockEnabled: false } };
    setState(next);
    await saveStatePlain(next);
  }, []);

  const addChild = useCallback<StoreValue['addChild']>((input) => {
    const child: Child = {
      color: CHILD_COLORS[Math.floor(Math.random() * CHILD_COLORS.length)],
      ...input,
      id: uid('child'),
      ...meta(),
    };
    setState((s) => ({
      ...s,
      children: [...s.children, child],
      settings: { ...s.settings, activeChildId: s.settings.activeChildId ?? child.id },
    }));
    return child;
  }, []);

  const updateChild = useCallback<StoreValue['updateChild']>((id, patch) => {
    setState((s) => ({
      ...s,
      children: s.children.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: nowISO() } : c)),
    }));
  }, []);

  /** Vollständige Entfernung inklusive aller Anhänge (Abschnitt 8). */
  const removeChild = useCallback<StoreValue['removeChild']>((id) => {
    setState((s) => {
      const remaining = s.children.filter((c) => c.id !== id);
      return {
        ...s,
        children: remaining,
        entries: s.entries.filter((e) => e.childId !== id),
        measurements: s.measurements.filter((m) => m.childId !== id),
        reminders: s.reminders.filter((r) => r.childId !== id),
        vaccinations: s.vaccinations.filter((v) => v.childId !== id),
        passPhotos: s.passPhotos.filter((p) => p.childId !== id),
        settings: {
          ...s.settings,
          activeChildId:
            s.settings.activeChildId === id ? remaining[0]?.id : s.settings.activeChildId,
        },
      };
    });
  }, []);

  const add = useCallback<StoreValue['add']>((collection, record) => {
    const created = { ...(record as object), id: uid(collection.slice(0, 3)), ...meta() } as never;
    setState((s) => ({ ...s, [collection]: [...(s[collection] as unknown[]), created] }));
    return created;
  }, []);

  const update = useCallback<StoreValue['update']>((collection, id, patch) => {
    setState((s) => ({
      ...s,
      [collection]: (s[collection] as { id: ID }[]).map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: nowISO() } : r,
      ),
    }));
  }, []);

  const remove = useCallback<StoreValue['remove']>((collection, id) => {
    setState((s) => ({
      ...s,
      [collection]: (s[collection] as { id: ID }[]).filter((r) => r.id !== id),
    }));
  }, []);

  const updateSettings = useCallback<StoreValue['updateSettings']>((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const setActiveChild = useCallback(
    (id: ID) => updateSettings({ activeChildId: id }),
    [updateSettings],
  );

  const replaceState = useCallback((next: AppState) => setState(migrate(next)), []);

  const resetAll = useCallback(async () => {
    await clearState();
    cryptoKey.current = null;
    salt.current = null;
    setLockState('open');
    setState(emptyState());
  }, []);

  const activeChild = useMemo(
    () => state.children.find((c) => c.id === state.settings.activeChildId) ?? state.children[0],
    [state.children, state.settings.activeChildId],
  );

  const value = useMemo<StoreValue>(
    () => ({
      state, ready, lockState, activeChild,
      unlock, enableLock, disableLock,
      setActiveChild, addChild, updateChild, removeChild,
      add, update, remove, updateSettings, replaceState, resetAll,
    }),
    [
      state, ready, lockState, activeChild, unlock, enableLock, disableLock,
      setActiveChild, addChild, updateChild, removeChild, add, update, remove,
      updateSettings, replaceState, resetAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden');
  return ctx;
}

export function useActions() {
  const { add, update, remove } = useStore();
  return useMemo(
    () => ({
      addEntry: (r: Omit<Entry, keyof SyncMeta | 'id'>) => add<Entry>('entries', r),
      updateEntry: (id: ID, patch: Partial<Entry>) => update('entries', id, patch),
      removeEntry: (id: ID) => remove('entries', id),

      addMeasurement: (r: Omit<Measurement, keyof SyncMeta | 'id'>) =>
        add<Measurement>('measurements', r),
      removeMeasurement: (id: ID) => remove('measurements', id),

      addReminder: (r: Omit<Reminder, keyof SyncMeta | 'id'>) => add<Reminder>('reminders', r),
      updateReminder: (id: ID, patch: Partial<Reminder>) => update('reminders', id, patch),
      removeReminder: (id: ID) => remove('reminders', id),

      addVaccination: (r: Omit<VaccinationRecord, keyof SyncMeta | 'id'>) =>
        add<VaccinationRecord>('vaccinations', r),
      updateVaccination: (id: ID, patch: Partial<VaccinationRecord>) =>
        update('vaccinations', id, patch),
      removeVaccination: (id: ID) => remove('vaccinations', id),

      addPassPhoto: (r: Omit<PassPhoto, keyof SyncMeta | 'id'>) => add<PassPhoto>('passPhotos', r),
      removePassPhoto: (id: ID) => remove('passPhotos', id),

      addCategory: (r: Omit<Category, keyof SyncMeta | 'id'>) => add<Category>('categories', r),
      updateCategory: (id: ID, patch: Partial<Category>) => update('categories', id, patch),
      removeCategory: (id: ID) => remove('categories', id),
    }),
    [add, update, remove],
  );
}
