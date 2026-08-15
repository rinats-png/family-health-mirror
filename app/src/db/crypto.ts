/**
 * Verschlüsselung der lokalen Ablage (Aufgabenstellung Abschnitt 8).
 *
 * Schlüsselableitung aus dem Nutzerpasswort per PBKDF2-SHA-256, Verschlüsselung
 * per AES-GCM. Der Schlüssel liegt ausschließlich im Arbeitsspeicher und wird
 * nirgends abgelegt — ohne das Passwort sind die Daten nicht wiederherstellbar.
 * Das ist der Preis dafür, dass ein Verlust des Geräts kein Datenleck ist.
 */

const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function randomSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(SALT_BYTES)));
}

export async function deriveKey(password: string, saltB64: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fromBase64(saltB64) as unknown as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export interface Ciphertext {
  iv: string;
  data: string;
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<Ciphertext> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const buffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    encoded as unknown as BufferSource,
  );
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(buffer)) };
}

/** Wirft, wenn das Passwort nicht passt — AES-GCM erkennt das zuverlässig. */
export async function decryptJson<T>(key: CryptoKey, cipher: Ciphertext): Promise<T> {
  const buffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(cipher.iv) as unknown as BufferSource },
    key,
    fromBase64(cipher.data) as unknown as BufferSource,
  );
  return JSON.parse(new TextDecoder().decode(buffer)) as T;
}

export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle;
}
