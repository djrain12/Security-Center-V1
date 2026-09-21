import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'wsi_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

type SessionPayload = {
  userId: number;
  email: string;
  accessLevel: string;
  companyId: number | null;
  issuedAt: number;
  expiresAt: number;
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET must be configured in production.');
  return 'local-development-session-secret-change-me';
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signature(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSessionToken(user: { id: number; email: string; accessLevel: string; companyId?: number | null }) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    accessLevel: user.accessLevel,
    companyId: user.companyId ?? null,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${signature(encodedPayload)}`;
}

export function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)wsi_session=([^;]+)/)?.[1];
  return verifySessionToken(cookie);
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encodedPayload, suppliedSignature] = token.split('.');
  if (!encodedPayload || !suppliedSignature) return null;
  const expectedSignature = signature(encodedPayload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.email || payload.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.SESSION_COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
