export const SESSION_COOKIE_NAME = "ideaval_session";
export const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const ALLOWED_USERS = ["arya", "dewi"] as const;
export type Username = (typeof ALLOWED_USERS)[number];

export function isAllowedUser(value: string): value is Username {
  return (ALLOWED_USERS as readonly string[]).includes(value);
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toHex(sig);
}

export async function signSession(
  username: Username,
  secret: string,
  lifetimeMs: number = SESSION_LIFETIME_MS,
): Promise<string> {
  const expiryMs = Date.now() + lifetimeMs;
  const payload = `${username}.${expiryMs}`;
  const sigHex = await hmacHex(payload, secret);
  return `${payload}.${sigHex}`;
}

export async function verifySession(
  token: string | undefined | null,
  secret: string,
): Promise<Username | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, expiryStr, sigHex] = parts;
  const expiryMs = Number(expiryStr);
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return null;
  if (!isAllowedUser(username)) return null;
  const expectedHex = await hmacHex(`${username}.${expiryStr}`, secret);
  return timingSafeStringEqual(sigHex, expectedHex) ? username : null;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
