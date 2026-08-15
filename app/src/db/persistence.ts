import type { AppState } from '../domain/types';
import { decryptJson, encryptJson, type Ciphertext } from './crypto';

/**
 * Local-first-Persistenz (Aufgabenstellung Abschnitt 8).
 *
 * Der gesamte Zustand liegt als ein versioniertes Dokument in IndexedDB. Kein
 * Server, kein Konto, keine Übertragung.
 *
 * Zwei Ablageformen:
 *  - `plain`     — ohne eingerichtete App-Sperre.
 *  - `encrypted` — mit App-Sperre: AES-GCM, Schlüssel aus dem Passwort.
 *
 * Im Klartextmodus wird zusätzlich ein **synchroner** localStorage-Snapshot
 * geschrieben. Grund: Ein `pagehide`-Handler kann keine asynchrone
 * IndexedDB-Transaktion mehr abschließen, der zuletzt getippte Eintrag ginge
 * beim Schließen verloren. Im verschlüsselten Modus entfällt dieser Snapshot
 * bewusst — ein synchroner Klartext-Fallback würde die Verschlüsselung
 * aushebeln. Dort bleibt ein Restrisiko von wenigen hundert Millisekunden bei
 * hartem Abbruch; das ist der bewusst gewählte Tausch.
 */

const DB_NAME = 'kindergesundheitstagebuch';
const STORE = 'state';
const KEY = 'app';
const DB_VERSION = 1;
const SNAPSHOT_KEY = `${DB_NAME}:snapshot`;

export const SCHEMA_VERSION = 2;

interface PlainEnvelope {
  kind: 'plain';
  savedAt: number;
  state: AppState;
}

interface EncryptedEnvelope {
  kind: 'encrypted';
  savedAt: number;
  salt: string;
  cipher: Ciphertext;
}

export type Envelope = PlainEnvelope | EncryptedEnvelope;

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

async function writeIdb(envelope: Envelope): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(envelope, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
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

function writeSnapshot(envelope: Envelope | null): void {
  try {
    if (envelope === null) localStorage.removeItem(SNAPSHOT_KEY);
    else localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(envelope));
  } catch {
    // Kontingent überschritten oder Speicher gesperrt: IndexedDB bleibt primär.
  }
}

/** Liefert die gespeicherte Hülle, ohne sie zu entschlüsseln. */
export async function loadEnvelope(): Promise<Envelope | undefined> {
  let fromDb: Envelope | undefined;
  try {
    fromDb = await readIdb();
  } catch {
    // Privater Modus oder blockierte IndexedDB — die App muss trotzdem starten.
  }
  const snapshot = readSnapshot();
  if (fromDb && snapshot) return snapshot.savedAt > fromDb.savedAt ? snapshot : fromDb;
  return fromDb ?? snapshot;
}

export async function saveStatePlain(state: AppState): Promise<void> {
  const envelope: PlainEnvelope = { kind: 'plain', savedAt: Date.now(), state };
  writeSnapshot(envelope);
  try {
    await writeIdb(envelope);
  } catch {
    // Snapshot steht bereits — kein Datenverlust.
  }
}

/** Synchroner Notausgang beim Verlassen der Seite. Nur im Klartextmodus. */
export function saveStatePlainSync(state: AppState): void {
  writeSnapshot({ kind: 'plain', savedAt: Date.now(), state });
}

export async function saveStateEncrypted(
  state: AppState,
  key: CryptoKey,
  salt: string,
): Promise<void> {
  const cipher = await encryptJson(key, state);
  const envelope: EncryptedEnvelope = { kind: 'encrypted', savedAt: Date.now(), salt, cipher };
  // Kein Klartext-Snapshot, solange die Sperre aktiv ist.
  writeSnapshot(null);
  await writeIdb(envelope);
}

export async function decryptEnvelope(
  envelope: EncryptedEnvelope,
  key: CryptoKey,
): Promise<AppState> {
  return decryptJson<AppState>(key, envelope.cipher);
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
  writeSnapshot(null);
}
