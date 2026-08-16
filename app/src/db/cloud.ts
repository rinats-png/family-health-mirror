import { decryptJson, deriveKey, encryptJson, randomSalt, type Ciphertext } from './crypto';
import { normalizeShareCode } from '../domain/share';
import type { SharePayload } from '../domain/share';

/**
 * Abgleich über einen Server — Ende-zu-Ende verschlüsselt.
 *
 * Der Server ist bewusst dumm und blind. Er speichert je Kind genau eine Zeile:
 *
 *     sync_id     undurchsichtige Kennung, SHA-256 über den Kindcode
 *     payload     Chiffrat samt Salz und Initialisierungsvektor
 *     updated_at  Zeitpunkt der letzten Ablage
 *
 * Er sieht keinen Rufnamen, kein Geburtsdatum, keine Notiz, keinen Messwert —
 * nur eine Zeichenkette, die ohne den Code nicht zu entschlüsseln ist. Der Code
 * verlässt das Gerät nie: Aus ihm wird einerseits die Kennung abgeleitet
 * (Einwegfunktion) und andererseits der Schlüssel (PBKDF2), und aus der Kennung
 * lässt sich der Schlüssel nicht zurückrechnen.
 *
 * Das ist der Unterschied, auf den es datenschutzrechtlich ankommt: Der
 * Betreiber der Ablage verarbeitet zwar Daten, kann sie aber nicht lesen.
 * Die Pflichten aus Art. 28 DSGVO entfallen dadurch nicht — siehe
 * REGULATORY.md Abschnitt 7.
 *
 * Ohne Konfiguration (VITE_SYNC_URL, VITE_SYNC_KEY) ist die Funktion nicht
 * vorhanden und die Oberfläche zeigt sie nicht an. Die Anwendung bleibt dann
 * vollständig ohne Netzwerkverbindung nutzbar.
 */

const URL_BASE = (import.meta.env.VITE_SYNC_URL ?? '').replace(/\/+$/, '');
const ANON_KEY = import.meta.env.VITE_SYNC_KEY ?? '';

export function isCloudConfigured(): boolean {
  return Boolean(URL_BASE && ANON_KEY);
}

export function cloudHost(): string {
  try {
    return new URL(URL_BASE).host;
  } catch {
    return '';
  }
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Kennung der Ablage. Bewusst eine ANDERE Ableitung als der Schlüssel: Wer die
 * Kennung kennt (etwa der Betreiber), kommt damit dem Schlüssel keinen Schritt
 * näher.
 */
export async function syncIdFor(code: string): Promise<string> {
  const material = new TextEncoder().encode(`kgt-sync-v1|${normalizeShareCode(code)}`);
  return toHex(await crypto.subtle.digest('SHA-256', material as unknown as BufferSource));
}

interface StoredBlob {
  salt: string;
  cipher: Ciphertext;
}

interface PullResult {
  payload: SharePayload;
  updatedAt: string;
}

async function rpc<T>(name: string, body: unknown): Promise<T> {
  const response = await fetch(`${URL_BASE}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: ANON_KEY,
      authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  return (await response.json()) as T;
}

/** Nichts abgelegt: null. Wirft bei Netzwerk- oder Serverfehlern. */
export async function pull(code: string, key: CryptoKey): Promise<PullResult | null> {
  const rows = await rpc<{ payload: StoredBlob; updated_at: string }[]>('sync_pull', {
    p_sync_id: await syncIdFor(code),
  });
  const row = rows?.[0];
  if (!row?.payload?.cipher) return null;
  return {
    payload: await decryptJson<SharePayload>(key, row.payload.cipher),
    updatedAt: row.updated_at,
  };
}

export async function push(code: string, key: CryptoKey, salt: string, payload: SharePayload): Promise<void> {
  const blob: StoredBlob = { salt, cipher: await encryptJson(key, payload) };
  await rpc('sync_push', { p_sync_id: await syncIdFor(code), p_payload: blob });
}

/**
 * Das Salz muss auf beiden Geräten dasselbe sein, sonst passt der Schlüssel
 * nicht. Es ist nicht geheim und liegt deshalb im Klartext neben dem Chiffrat.
 * Wer als Erster ablegt, legt es fest.
 */
export async function keyFor(code: string, salt: string): Promise<CryptoKey> {
  return deriveKey(normalizeShareCode(code), salt);
}

export async function saltFor(code: string): Promise<string> {
  const rows = await rpc<{ payload: StoredBlob }[]>('sync_pull', {
    p_sync_id: await syncIdFor(code),
  });
  return rows?.[0]?.payload?.salt ?? randomSalt();
}
