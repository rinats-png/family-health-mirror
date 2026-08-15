import type { AppState } from '../domain/types';

/**
 * Local-first-Persistenz (PRD §5.1).
 *
 * Der gesamte State liegt als ein Dokument in IndexedDB. Das hält die
 * Persistenzschicht klein und macht den DSGVO-Vollexport trivial. Für die
 * Produktivversion gehört das auf SQLite/SQLCipher mit Indizes umgestellt;
 * die Verschlüsselung setzt dann genau an dieser Stelle an — verschlüsselt
 * würde das Dokument, bevor es hier geschrieben wird.
 *
 * Zwei Schreibwege, bewusst:
 *
 *  1. IndexedDB — primär, asynchron, ohne relevante Größenbeschränkung.
 *  2. localStorage — synchroner Sicherungs-Snapshot.
 *
 * Grund für (2): Wenn die Seite geschlossen oder in den Hintergrund geschoben
 * wird, kann ein `pagehide`-Handler eine asynchrone IndexedDB-Transaktion nicht
 * mehr zu Ende bringen — der letzte Eintrag ginge verloren. Das ist genau der
 * Alltagsfall „getippt, Handy weggelegt". `localStorage.setItem` ist synchron
 * und läuft noch durch. Beim Laden gewinnt der jüngere der beiden Stände.
 */

const DB_NAME = 'kindergesundheit';
const STORE = 'state';
const KEY = 'app';
const DB_VERSION = 1;
const SNAPSHOT_KEY = `${DB_NAME}:snapshot`;

export const SCHEMA_VERSION = 1;

interface Envelope {
  savedAt: number;
  state: AppState;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readIdb(): Promise<Envelope | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result as Envelope | undefined);
    req.onerror = () => reject(req.error);
  });
}

function readSnapshot(): Envelope | undefined {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Envelope) : undefined;
  } catch {
    return undefined;
  }
}

export async function loadState(): Promise<AppState | undefined> {
  let fromDb: Envelope | undefined;
  try {
    fromDb = await readIdb();
  } catch {
    // Privater Modus oder blockierte IndexedDB: die App muss trotzdem laufen.
  }
  const snapshot = readSnapshot();

  if (fromDb && snapshot) {
    return (snapshot.savedAt > fromDb.savedAt ? snapshot : fromDb).state;
  }
  return (fromDb ?? snapshot)?.state;
}

/** Synchroner Teil — muss auch in einem pagehide-Handler noch durchlaufen. */
function writeSnapshot(envelope: Envelope): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(envelope));
  } catch {
    // Kontingent überschritten (z. B. durch angehängte Fotos) oder gesperrt.
    // IndexedDB bleibt der primäre Speicher, hier wird nichts erzwungen.
  }
}

export async function saveState(state: AppState): Promise<void> {
  const envelope: Envelope = { savedAt: Date.now(), state };
  writeSnapshot(envelope);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(envelope, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Snapshot ist bereits geschrieben — kein Datenverlust.
  }
}

/** Wird beim Verlassen der Seite aufgerufen: nur der garantiert synchrone Weg. */
export function saveStateSync(state: AppState): void {
  writeSnapshot({ savedAt: Date.now(), state });
}

export async function clearState(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignoriert */
  }
  try {
    localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    /* ignoriert */
  }
}
