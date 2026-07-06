/* JWT HMAC-SHA256 buatan sendiri (header.payload.signature, base64url) — node:crypto saja. */
import crypto from 'node:crypto';
import fs from 'node:fs';

const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

export function sign(payload, secret, expiresInSec) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u({ alg: 'HS256', typ: 'JWT' });
  const body = b64u({ ...payload, iat: now, exp: now + expiresInSec });
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verify(token, secret) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  const a = Buffer.from(s);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/* Secret: env PO_SECRET, atau acak persisten di backend/.secret */
let cachedSecret = null;
export function getSecret() {
  if (cachedSecret) return cachedSecret;
  if (process.env.PO_SECRET) {
    cachedSecret = process.env.PO_SECRET;
    return cachedSecret;
  }
  const file = new URL('../.secret', import.meta.url);
  try {
    const raw = fs.readFileSync(file, 'utf8').trim();
    if (raw) {
      cachedSecret = raw;
      return cachedSecret;
    }
  } catch { /* belum ada — buat baru */ }
  cachedSecret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(file, cachedSecret, 'utf8');
  return cachedSecret;
}

export const ACCESS_TTL = 15 * 60;        // 15 menit
export const REFRESH_TTL = 7 * 24 * 3600; // 7 hari
