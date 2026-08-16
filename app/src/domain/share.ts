import { decryptJson, deriveKey, encryptJson, randomSalt, type Ciphertext } from '../db/crypto';
import { nowISO } from './dates';
import type {
  AppState,
  Child,
  Category,
  Entry,
  ID,
  Measurement,
  PassPhoto,
  Reminder,
  Tombstone,
  VaccinationRecord,
} from './types';

/**
 * Ein Kind zu zweit führen (Aufgabenstellung Abschnitt 8).
 *
 * Der Weg ist bewusst NICHT ein Server. Die Anwendung hat keinen Endpunkt, an
 * den Gesundheitsdaten eines Kindes gehen könnten, und soll auch keinen
 * bekommen. Stattdessen erzeugt das eine Gerät ein verschlüsseltes Paket, das
 * der Nutzer selbst weitergibt — über den Weg, den er ohnehin vertraut:
 * Messenger, Mail, Dateiablage, USB-Stick.
 *
 * Daraus folgt die wichtigste Eigenschaft und zugleich die Grenze: Das ist ein
 * Abgleich zu einem Zeitpunkt, keine laufende Synchronisierung. Wer neue
 * Einträge übernehmen will, tauscht erneut ein Paket aus. Dafür funktioniert
 * es offline, ohne Konto und ohne dass irgendwo eine Kopie liegen bleibt.
 *
 * Der Code ist zugleich Kennung und Geheimnis: Aus ihm wird per PBKDF2 der
 * Schlüssel des Pakets abgeleitet. Ohne Code ist die Datei nicht lesbar.
 */

/**
 * Alphabet ohne I, L, O, U, 0 und 1 — beim Abtippen oder Vorlesen sind das die
 * Zeichen, die verwechselt werden. 32 Zeichen, 16 Stellen: 80 Bit.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
const CODE_LENGTH = 16;
const GROUP = 4;

export function generateShareCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  return chars
    .join('')
    .replace(new RegExp(`(.{${GROUP}})(?=.)`, 'g'), '$1-');
}

/** Bindestriche, Leerzeichen und Kleinschreibung beim Eintippen verzeihen. */
export function normalizeShareCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export const SHARE_KIND = 'kinder-gesundheitstagebuch/child-share';
export const SHARE_VERSION = 1;

/** Was tatsächlich übertragen wird — ausschließlich zu diesem Kind. */
export interface SharePayload {
  child: Child;
  categories: Category[];
  entries: Entry[];
  measurements: Measurement[];
  reminders: Reminder[];
  vaccinations: VaccinationRecord[];
  passPhotos: PassPhoto[];
  tombstones: Tombstone[];
}

/**
 * Die Hülle liegt im Klartext, damit das empfangende Gerät vor dem Entschlüsseln
 * sagen kann, um wessen Paket es geht. Sie enthält deshalb bewusst KEINE
 * Gesundheitsdaten — nur den Rufnamen, den der Nutzer ohnehin beim Weitergeben
 * nennt, und den Zeitpunkt.
 */
export interface SharePackage {
  kind: typeof SHARE_KIND;
  version: number;
  childId: ID;
  childName: string;
  createdAt: string;
  salt: string;
  cipher: Ciphertext;
}

function forChild(state: AppState, childId: ID) {
  return {
    entries: state.entries.filter((e) => e.childId === childId),
    measurements: state.measurements.filter((m) => m.childId === childId),
    reminders: state.reminders.filter((r) => r.childId === childId),
    vaccinations: state.vaccinations.filter((v) => v.childId === childId),
    passPhotos: state.passPhotos.filter((p) => p.childId === childId),
  };
}

export async function buildSharePackage(
  state: AppState,
  child: Child,
  code: string,
): Promise<SharePackage> {
  const salt = randomSalt();
  const key = await deriveKey(normalizeShareCode(code), salt);
  const payload: SharePayload = {
    child,
    // Die Kategorien kommen mit, sonst stünde beim zweiten Gerät ein Eintrag
    // ohne Kachel und ohne Farbe.
    categories: state.categories,
    ...forChild(state, child.id),
    tombstones: state.tombstones,
  };
  return {
    kind: SHARE_KIND,
    version: SHARE_VERSION,
    childId: child.id,
    childName: child.name,
    createdAt: nowISO(),
    salt,
    cipher: await encryptJson(key, payload),
  };
}

export function parseSharePackage(text: string): SharePackage {
  const parsed = JSON.parse(text) as SharePackage;
  if (parsed?.kind !== SHARE_KIND) throw new Error('kind');
  if (typeof parsed.version !== 'number' || parsed.version > SHARE_VERSION) throw new Error('version');
  if (!parsed.salt || !parsed.cipher?.iv || !parsed.cipher?.data) throw new Error('shape');
  return parsed;
}

/** Wirft, wenn der Code nicht passt — AES-GCM erkennt das zuverlässig. */
export async function openSharePackage(pkg: SharePackage, code: string): Promise<SharePayload> {
  const key = await deriveKey(normalizeShareCode(code), pkg.salt);
  return decryptJson<SharePayload>(key, pkg.cipher);
}

interface Versioned {
  id: ID;
  updatedAt: string;
}

/**
 * Zusammenführen zweier Stände desselben Datensatzes: Es gewinnt der zuletzt
 * geänderte. Das ist bewusst simpel — bei zwei Elternteilen, die abwechselnd
 * eintragen, gibt es praktisch keine echten Konflikte, und eine Zeile
 * „zuletzt gewinnt" ist nachvollziehbar. Was es NICHT tut: zwei Fassungen
 * desselben Eintrags verschmelzen oder eine davon stillschweigend verwerfen,
 * ohne dass der Zeitstempel es rechtfertigt.
 */
function mergeById<T extends Versioned>(mine: T[], theirs: T[]): T[] {
  const out = new Map<ID, T>();
  for (const record of mine) out.set(record.id, record);
  for (const record of theirs) {
    const existing = out.get(record.id);
    if (!existing || record.updatedAt > existing.updatedAt) out.set(record.id, record);
  }
  return [...out.values()];
}

function mergeTombstones(mine: Tombstone[], theirs: Tombstone[]): Tombstone[] {
  const out = new Map<ID, Tombstone>();
  for (const t of [...mine, ...theirs]) {
    const existing = out.get(t.id);
    if (!existing || t.at > existing.at) out.set(t.id, t);
  }
  return [...out.values()];
}

/** Entfernt, was auf einem der beiden Geräte gelöscht wurde. */
function applyTombstones<T extends Versioned>(records: T[], graves: Map<ID, string>): T[] {
  return records.filter((r) => {
    const at = graves.get(r.id);
    // Wurde der Datensatz nach der Löschung wieder bearbeitet, bleibt er.
    return !at || r.updatedAt > at;
  });
}

export function mergeSharePayload(state: AppState, payload: SharePayload): AppState {
  const tombstones = mergeTombstones(state.tombstones, payload.tombstones ?? []);
  const graves = new Map(tombstones.map((t) => [t.id, t.at]));

  const merged: AppState = {
    ...state,
    children: applyTombstones(mergeById(state.children, [payload.child]), graves),
    categories: applyTombstones(mergeById(state.categories, payload.categories ?? []), graves),
    entries: applyTombstones(mergeById(state.entries, payload.entries ?? []), graves),
    measurements: applyTombstones(mergeById(state.measurements, payload.measurements ?? []), graves),
    reminders: applyTombstones(mergeById(state.reminders, payload.reminders ?? []), graves),
    vaccinations: applyTombstones(mergeById(state.vaccinations, payload.vaccinations ?? []), graves),
    passPhotos: applyTombstones(mergeById(state.passPhotos, payload.passPhotos ?? []), graves),
    tombstones,
  };

  return {
    ...merged,
    settings: {
      ...merged.settings,
      activeChildId: merged.settings.activeChildId ?? payload.child.id,
    },
  };
}

/** Zählt, was durch das Zusammenführen dazugekommen ist — für die Rückmeldung. */
export function countPayload(payload: SharePayload): number {
  return (
    (payload.entries?.length ?? 0) +
    (payload.measurements?.length ?? 0) +
    (payload.vaccinations?.length ?? 0) +
    (payload.passPhotos?.length ?? 0) +
    (payload.reminders?.length ?? 0)
  );
}
