const COOKIE_NAME = "my-agents-session";
const EDIT_COOKIE_NAME = "my-agents-edit-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const EDIT_SESSION_MAX_AGE = 60 * 60 * 4; // 4 hours

export {
  COOKIE_NAME,
  EDIT_COOKIE_NAME,
  SESSION_MAX_AGE,
  EDIT_SESSION_MAX_AGE,
};

export function getAuthPassword(): string {
  return process.env.AUTH_PASSWORD ?? "admin";
}

export function getEditPassword(): string {
  return process.env.AUTH_EDIT_PASSWORD ?? "edit-admin";
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return secret ?? "dev-secret-change-in-production";
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer;
}

async function createSignedToken(
  status: string,
  maxAge: number
): Promise<string> {
  const exp = Date.now() + maxAge * 1000;
  const payload = `${status}:${exp}`;
  const key = await getHmacKey(getAuthSecret());
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${bufferToHex(sig)}`;
}

async function verifySignedToken(
  token: string,
  expectedStatus: string
): Promise<boolean> {
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const payload = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);
    const [status, expStr] = payload.split(":");
    if (status !== expectedStatus || !expStr) return false;

    const exp = parseInt(expStr, 10);
    if (Number.isNaN(exp) || Date.now() > exp) return false;

    const key = await getHmacKey(getAuthSecret());
    return crypto.subtle.verify(
      "HMAC",
      key,
      hexToBuffer(signature),
      new TextEncoder().encode(payload)
    );
  } catch {
    return false;
  }
}

export async function createSessionToken(): Promise<string> {
  return createSignedToken("authenticated", SESSION_MAX_AGE);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  return verifySignedToken(token, "authenticated");
}

export async function createEditSessionToken(): Promise<string> {
  return createSignedToken("edit-authenticated", EDIT_SESSION_MAX_AGE);
}

export async function verifyEditSessionToken(token: string): Promise<boolean> {
  return verifySignedToken(token, "edit-authenticated");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encA = new TextEncoder().encode(a);
  const encB = new TextEncoder().encode(b);
  let mismatch = 0;
  for (let i = 0; i < encA.length; i++) {
    mismatch |= encA[i] ^ encB[i];
  }
  return mismatch === 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  return constantTimeEqual(password, getAuthPassword());
}

export async function verifyEditPassword(password: string): Promise<boolean> {
  return constantTimeEqual(password, getEditPassword());
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function editSessionCookieOptions(maxAge = EDIT_SESSION_MAX_AGE) {
  return sessionCookieOptions(maxAge);
}

export async function hasEditAccess(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  return verifyEditSessionToken(token);
}
