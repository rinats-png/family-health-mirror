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
import {
  collectPayload,
  generateShareCode,
  mergeSharePayload,
  payloadFingerprint,
  type SharePayload,
} from '../domain/share';
import { isCloudConfigured, keyFor, pull, push, saltFor } from '../db/cloud';
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
  Tombstone,
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

/**
 * Löschen hinterlässt einen Grabstein: nur Kennung und Zeitpunkt, kein Inhalt.
 * Ohne ihn würde ein Datensatz, den ein Elternteil gelöscht hat, beim nächsten
 * Zusammenführen vom anderen Gerät wieder auftauchen.
 */
function grave(ids: ID[], existing: Tombstone[]): Tombstone[] {
  const at = nowISO();
  return [...existing.filter((t) => !ids.includes(t.id)), ...ids.map((id) => ({ id, at }))];
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
    tombstones: [],
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
    tombstones: loaded.tombstones ?? [],
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

/** Zustand des Abgleichs für die Anzeige — bewusst grob gehalten. */
export type CloudStatus = 'off' | 'idle' | 'busy' | 'error';

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
  /** Löscht alle Aufzeichnungen eines Kindes, behält aber das Kind selbst. */
  clearChildData: (id: ID) => void;
  /** Erzeugt den Übergabecode eines Kindes, falls noch keiner vergeben ist. */
  ensureShareCode: (id: ID) => string;
  /** Führt ein eingelesenes Übergabepaket mit dem eigenen Bestand zusammen. */
  mergeShare: (payload: SharePayload) => void;

  cloudAvailable: boolean;
  cloudStatus: CloudStatus;
  lastSyncAt?: string;
  /** Schaltet den Abgleich für ein Kind ein und legt es sofort ab. */
  enableCloudSync: (id: ID) => Promise<void>;
  disableCloudSync: (id: ID) => void;
  /** Holt ein Kind über seinen Code aus der Ablage. */
  adoptFromCloud: (code: string) => Promise<number>;
  syncNow: () => Promise<void>;

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

  /*
   * Wann abgeglichen wird: kurz nach einer Änderung, in ruhigen Abständen, und
   * sobald die App wieder in den Vordergrund kommt. Der Abstand ist bewusst
   * größer als das Speicherintervall — ein Abgleich kostet Netz und Akku, und
   * zwei Elternteile tragen nicht im Sekundentakt ein.
   */
  useEffect(() => {
    if (!ready || lockState === 'locked' || !isCloudConfigured()) return;
    const soon = window.setTimeout(() => void syncRef.current(), 2500);
    return () => window.clearTimeout(soon);
  }, [state, ready, lockState]);

  useEffect(() => {
    if (!ready || lockState === 'locked' || !isCloudConfigured()) return;
    const timer = window.setInterval(() => void syncRef.current(), 45_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncRef.current();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, lockState]);

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
      const gone = [
        id,
        ...s.entries.filter((e) => e.childId === id).map((e) => e.id),
        ...s.measurements.filter((m) => m.childId === id).map((m) => m.id),
        ...s.reminders.filter((r) => r.childId === id).map((r) => r.id),
        ...s.vaccinations.filter((v) => v.childId === id).map((v) => v.id),
        ...s.passPhotos.filter((p) => p.childId === id).map((p) => p.id),
      ];
      return {
        ...s,
        children: remaining,
        entries: s.entries.filter((e) => e.childId !== id),
        measurements: s.measurements.filter((m) => m.childId !== id),
        reminders: s.reminders.filter((r) => r.childId !== id),
        vaccinations: s.vaccinations.filter((v) => v.childId !== id),
        passPhotos: s.passPhotos.filter((p) => p.childId !== id),
        tombstones: grave(gone, s.tombstones),
        settings: {
          ...s.settings,
          activeChildId:
            s.settings.activeChildId === id ? remaining[0]?.id : s.settings.activeChildId,
        },
      };
    });
  }, []);

  const clearChildData = useCallback<StoreValue['clearChildData']>((id) => {
    setState((s) => {
      const gone = [
        ...s.entries.filter((e) => e.childId === id).map((e) => e.id),
        ...s.measurements.filter((m) => m.childId === id).map((m) => m.id),
        ...s.reminders.filter((r) => r.childId === id).map((r) => r.id),
        ...s.vaccinations.filter((v) => v.childId === id).map((v) => v.id),
        ...s.passPhotos.filter((p) => p.childId === id).map((p) => p.id),
      ];
      return {
        ...s,
        entries: s.entries.filter((e) => e.childId !== id),
        measurements: s.measurements.filter((m) => m.childId !== id),
        reminders: s.reminders.filter((r) => r.childId !== id),
        vaccinations: s.vaccinations.filter((v) => v.childId !== id),
        passPhotos: s.passPhotos.filter((p) => p.childId !== id),
        tombstones: grave(gone, s.tombstones),
      };
    });
  }, []);

  /*
   * Abgleich über die Ablage.
   *
   * Ablauf je Kind: holen, zusammenführen, ablegen — in dieser Reihenfolge.
   * Dadurch schickt jedes Gerät immer den bereits zusammengeführten Stand, und
   * zwei Geräte laufen auch dann zusammen, wenn beide gleichzeitig geschrieben
   * haben. Bei zwei Fassungen desselben Datensatzes gilt der zuletzt geänderte.
   *
   * Der abgeleitete Schlüssel wird zwischengespeichert: PBKDF2 mit 210 000
   * Runden ist absichtlich teuer und darf nicht bei jedem Abgleich anfallen.
   */
  const cloudKeys = useRef(new Map<ID, { key: CryptoKey; salt: string }>());
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('off');
  const [lastSyncAt, setLastSyncAt] = useState<string | undefined>(undefined);

  const keyMaterial = useCallback(async (childId: ID, code: string) => {
    const cached = cloudKeys.current.get(childId);
    if (cached) return cached;
    const salt = await saltFor(code);
    const material = { salt, key: await keyFor(code, salt) };
    cloudKeys.current.set(childId, material);
    return material;
  }, []);

  const syncChild = useCallback(
    async (childId: ID) => {
      const child = latest.current.children.find((c) => c.id === childId);
      if (!child?.cloudSync || !child.shareCode) return;
      const { key, salt } = await keyMaterial(childId, child.shareCode);

      const remote = await pull(child.shareCode, key);
      let base = latest.current;
      if (remote) {
        const merged = mergeSharePayload(base, remote.payload);
        if (merged !== base) {
          base = merged;
          latest.current = merged;
          setState((s) => (s === base ? s : mergeSharePayload(s, remote.payload)));
        }
      }

      const mine = base.children.find((c) => c.id === childId);
      if (!mine) return;
      const payload = collectPayload(base, mine);
      if (!remote || payloadFingerprint(remote.payload) !== payloadFingerprint(payload)) {
        await push(child.shareCode, key, salt, payload);
      }
    },
    [keyMaterial],
  );

  const syncNow = useCallback<StoreValue['syncNow']>(async () => {
    if (!isCloudConfigured() || lockState === 'locked') return;
    const ids = latest.current.children.filter((c) => c.cloudSync).map((c) => c.id);
    if (ids.length === 0) {
      setCloudStatus('off');
      return;
    }
    setCloudStatus('busy');
    try {
      for (const id of ids) await syncChild(id);
      setCloudStatus('idle');
      setLastSyncAt(nowISO());
    } catch {
      // Kein Netz, Server nicht erreichbar, Chiffrat passt nicht: Der lokale
      // Bestand bleibt unangetastet, der nächste Lauf versucht es erneut.
      setCloudStatus('error');
    }
  }, [lockState, syncChild]);

  const syncRef = useRef(syncNow);
  syncRef.current = syncNow;

  const enableCloudSync = useCallback<StoreValue['enableCloudSync']>(
    async (id) => {
      const code =
        latest.current.children.find((c) => c.id === id)?.shareCode ?? generateShareCode();
      setState((s) => ({
        ...s,
        children: s.children.map((c) =>
          c.id === id ? { ...c, shareCode: code, cloudSync: true, updatedAt: nowISO() } : c,
        ),
      }));
      latest.current = {
        ...latest.current,
        children: latest.current.children.map((c) =>
          c.id === id ? { ...c, shareCode: code, cloudSync: true, updatedAt: nowISO() } : c,
        ),
      };
      await syncRef.current();
    },
    [],
  );

  const disableCloudSync = useCallback<StoreValue['disableCloudSync']>((id) => {
    cloudKeys.current.delete(id);
    setState((s) => ({
      ...s,
      children: s.children.map((c) =>
        c.id === id ? { ...c, cloudSync: false, updatedAt: nowISO() } : c,
      ),
    }));
  }, []);

  const adoptFromCloud = useCallback<StoreValue['adoptFromCloud']>(async (code) => {
    const salt = await saltFor(code);
    const key = await keyFor(code, salt);
    const remote = await pull(code, key);
    if (!remote) throw new Error('empty');
    const childId = remote.payload.child.id;
    cloudKeys.current.set(childId, { key, salt });
    setState((s) => {
      const merged = mergeSharePayload(s, remote.payload);
      return {
        ...merged,
        children: merged.children.map((c) =>
          c.id === childId ? { ...c, shareCode: code, cloudSync: true } : c,
        ),
        settings: { ...merged.settings, activeChildId: childId },
      };
    });
    return remote.payload.entries?.length ?? 0;
  }, []);

  const ensureShareCode = useCallback<StoreValue['ensureShareCode']>((id) => {
    const existing = latest.current.children.find((c) => c.id === id)?.shareCode;
    if (existing) return existing;
    const code = generateShareCode();
    const withCode = (s: AppState): AppState => ({
      ...s,
      children: s.children.map((c) =>
        c.id === id ? { ...c, shareCode: code, updatedAt: nowISO() } : c,
      ),
    });
    setState(withCode);
    /*
     * `latest.current` wird sonst erst beim nächsten Rendern nachgezogen. Ein
     * Aufruf, der unmittelbar danach den Code braucht — enableCloudSync tut das
     * — fände dort noch keinen und erzeugte einen zweiten. Die Oberfläche zeigte
     * dann den einen, abgelegt würde unter dem anderen.
     */
    latest.current = withCode(latest.current);
    return code;
  }, []);

  const mergeShare = useCallback<StoreValue['mergeShare']>((payload) => {
    setState((s) => mergeSharePayload(s, payload));
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
      tombstones: grave([id], s.tombstones),
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
      setActiveChild, addChild, updateChild, removeChild, clearChildData,
      ensureShareCode, mergeShare,
      cloudAvailable: isCloudConfigured(), cloudStatus, lastSyncAt,
      enableCloudSync, disableCloudSync, adoptFromCloud, syncNow,
      add, update, remove, updateSettings, replaceState, resetAll,
    }),
    [
      state, ready, lockState, activeChild, unlock, enableLock, disableLock,
      setActiveChild, addChild, updateChild, removeChild, clearChildData,
      ensureShareCode, mergeShare, cloudStatus, lastSyncAt,
      enableCloudSync, disableCloudSync, adoptFromCloud, syncNow,
      add, update, remove, updateSettings, replaceState, resetAll,
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
      updateMeasurement: (id: ID, patch: Partial<Measurement>) =>
        update('measurements', id, patch),
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
