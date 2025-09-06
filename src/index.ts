import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load patterns JSON from the package root (one level up from compiled dist)
const patternsPath = path.resolve(__dirname, '..', 'fixed_patterns.json');
const patternsRaw = fs.readFileSync(patternsPath, 'utf-8');
const patterns: Record<string, string[]> = JSON.parse(patternsRaw);

const getDeterministicIndex = (input: string, max: number): number => {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  return num % max;
};

type EncryptOptions = { mode?: 'aead' | 'pattern'; aad?: string };

export const encrypt = (text: string, secretKey: string, options?: EncryptOptions): string => {
  const mode = options?.mode ?? 'aead';
  if (mode === 'aead') {
    return encryptAEAD(text, secretKey, options?.aad);
  }
  // legacy pattern mode
  let encryptedText = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const opts = patterns[char];
    if (Array.isArray(opts) && opts.length > 0) {
      const idx = getDeterministicIndex(secretKey + char + i, opts.length);
      encryptedText += opts[idx];
    } else {
      encryptedText += char;
    }
  }
  return encryptedText;
};

export const verifyEncryption = (
  encryptedText: string,
  originalText: string,
  secretKey: string,
  options?: EncryptOptions
): boolean => {
  const mode = options?.mode ?? 'aead';
  if (mode === 'aead') {
    try {
      const decrypted = decryptAEAD(encryptedText, secretKey, options?.aad);
      return normalize(decrypted) === normalize(originalText);
    } catch {
      return false;
    }
  }
  // legacy pattern mode verification
  let i = 0;
  for (let j = 0; j < originalText.length; j++) {
    const char = originalText[j];
    const opts = patterns[char];
    if (!opts || opts.length === 0) return false;

    const idx = getDeterministicIndex(secretKey + char + j, opts.length);
    const pattern = opts[idx];

    if (encryptedText.startsWith(pattern, i)) {
      i += pattern.length;
    } else {
      return false;
    }
  }
  return i === encryptedText.length;
};

// ===== Modern cryptography APIs =====
// AES-256-GCM with scrypt KDF and optional AAD. Output encoded in compact base64url parts.

const b64urlEncode = (buf: Buffer): string =>
  buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const b64urlDecode = (str: string): Buffer => {
  const pad = 4 - (str.length % 4);
  const base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/') + (pad === 4 ? '' : '='.repeat(pad));
  return Buffer.from(base64, 'base64');
};

const normalize = (text: string): string => text.normalize('NFC');

const VERSION = 'v1';
const ALG = 'aes-256-gcm';
const KDF = 'scrypt';

export const encryptAEAD = (
  plaintext: string,
  password: string,
  aad?: string
): string => {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const nonce = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));

  const normalized = normalize(plaintext);
  const ct = Buffer.concat([
    cipher.update(Buffer.from(normalized, 'utf8')),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag(); // 16 bytes
  const data = Buffer.concat([ct, tag]);

  // Format: VERSION.ALG.KDF.salt.nonce.data
  return [
    VERSION,
    ALG,
    KDF,
    b64urlEncode(salt),
    b64urlEncode(nonce),
    b64urlEncode(data),
  ].join('.');
};

export const decryptAEAD = (
  payload: string,
  password: string,
  aad?: string
): string => {
  const parts = payload.split('.');
  if (parts.length !== 6) throw new Error('Invalid payload format');
  const [v, alg, kdf, saltB64, nonceB64, dataB64] = parts;
  if (v !== VERSION) throw new Error(`Unsupported version: ${v}`);
  if (alg !== ALG) throw new Error(`Unsupported algorithm: ${alg}`);
  if (kdf !== KDF) throw new Error(`Unsupported KDF: ${kdf}`);

  const salt = b64urlDecode(saltB64);
  const nonce = b64urlDecode(nonceB64);
  const data = b64urlDecode(dataB64);
  if (data.length < 17) throw new Error('Invalid ciphertext');

  const key = crypto.scryptSync(password, salt, 32);
  const ct = data.subarray(0, data.length - 16);
  const tag = data.subarray(data.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(tag);

  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString('utf8');
};

// HMAC sign/verify (deterministic, use timingSafeEqual)
const HMAC_SALT = Buffer.from('encryption-lib:hmac', 'utf8');

export const sign = (text: string, password: string): string => {
  const key = crypto.scryptSync(password, HMAC_SALT, 32);
  const h = crypto.createHmac('sha256', key)
    .update(Buffer.from(normalize(text), 'utf8'))
    .digest();
  return b64urlEncode(h);
};

export const verifySignature = (
  text: string,
  mac: string,
  password: string
): boolean => {
  try {
    const a = b64urlDecode(sign(text, password));
    const b = b64urlDecode(mac);
    // Use constant-time comparison
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
};

export default {
  // legacy pattern-based
  encrypt,
  verifyEncryption,
  // modern AEAD
  encryptAEAD,
  decryptAEAD,
  // HMAC
  sign,
  verifySignature,
};
