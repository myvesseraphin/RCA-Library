import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { pool } from './db.ts';
import { config } from './config.ts';

type AppUserRow = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  password_hash: string;
};

type TokenPayload = {
  id: number;
  exp: number;
};

export type AuthenticatedStaff = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type AuthenticatedRequest = Request & {
  authUser: AuthenticatedStaff;
};

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function signTokenPayload(payload: string) {
  return createHmac('sha256', config.authSecret).update(payload).digest('base64url');
}

function encodePayload(payload: TokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function parsePayload(encodedPayload: string) {
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenPayload;

    if (
      typeof parsed.id !== 'number'
      || typeof parsed.exp !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function readBearerToken(request: Request) {
  const header = request.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length).trim() || null;
}

function serializeAppUser(row: Pick<AppUserRow, 'id' | 'email' | 'full_name' | 'role'>): AuthenticatedStaff {
  return {
    id: row.id,
    email: row.email,
    name: row.full_name,
    role: row.role,
  };
}

async function getAppUserById(userId: number) {
  const result = await pool.query<Pick<AppUserRow, 'id' | 'email' | 'full_name' | 'role'>>(
    `
      SELECT id, email, full_name, role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  const user = result.rows[0];
  return user ? serializeAppUser(user) : null;
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, derivedKeyHex] = storedHash.split(':');

  if (!salt || !derivedKeyHex) {
    return false;
  }

  const storedBuffer = Buffer.from(derivedKeyHex, 'hex');
  const candidateBuffer = scryptSync(password, salt, 64);

  if (storedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, candidateBuffer);
}

export function createAuthToken(user: Pick<AuthenticatedStaff, 'id'>) {
  const payload = encodePayload({
    id: user.id,
    exp: Date.now() + TOKEN_TTL_MS,
  });

  return `${payload}.${signTokenPayload(payload)}`;
}

export async function verifyAuthToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signTokenPayload(encodedPayload);

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = parsePayload(encodedPayload);

  if (!payload || payload.exp <= Date.now()) {
    return null;
  }

  return getAppUserById(payload.id);
}

export async function loginStaff(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const result = await pool.query<AppUserRow>(
    `
      SELECT id, email, full_name, role, password_hash
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
    `,
    [normalizedEmail],
  );

  const account = result.rows[0];

  if (!account || !verifyPassword(password, account.password_hash)) {
    return null;
  }

  await pool.query(
    'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
    [account.id],
  );

  const user = serializeAppUser(account);

  return {
    token: createAuthToken(user),
    user,
  };
}

export async function getAuthenticatedUser(request: Request) {
  return verifyAuthToken(readBearerToken(request));
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      response.status(401).json({ message: 'Authentication required.' });
      return;
    }

    (request as AuthenticatedRequest).authUser = authUser;
    next();
  } catch (error) {
    next(error);
  }
}
