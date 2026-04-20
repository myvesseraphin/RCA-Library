import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { pool } from './db.ts';
import { config } from './config.ts';
import { createNotification } from './notification-store.ts';

type AppUserRow = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  password_hash: string;
};

type PasswordResetRow = {
  id: string;
  user_id: number;
  code_hash: string;
  expires_at: string;
  consumed_at: string | null;
  email: string;
  full_name: string;
};

type TokenPayload = {
  id: number;
  exp: number;
};

type PasswordResetTokenPayload = {
  id: number;
  resetId: string;
  purpose: 'password-reset';
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
const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * config.resetCodeTtlMinutes;

function signTokenPayload(payload: string) {
  return createHmac('sha256', config.authSecret).update(payload).digest('base64url');
}

function encodePayload<T extends object>(payload: T) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function parsePayload<T extends object>(encodedPayload: string) {
  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function createSignedToken<T extends { exp: number }>(payload: T) {
  const encodedPayload = encodePayload(payload);
  return `${encodedPayload}.${signTokenPayload(encodedPayload)}`;
}

function verifySignedToken<T extends { exp: number }>(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signTokenPayload(encodedPayload);

  if (
    expectedSignature.length !== signature.length
    || !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
  ) {
    return null;
  }

  const payload = parsePayload<T>(encodedPayload);

  if (!payload || typeof payload.exp !== 'number' || payload.exp <= Date.now()) {
    return null;
  }

  return payload;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hashResetCode(code: string) {
  return createHmac('sha256', config.authSecret).update(code).digest('hex');
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

function buildPasswordResetEmailText(name: string, code: string) {
  return [
    `Hi ${name},`,
    '',
    `Use this code to reset your Library password: ${code}`,
    `This code expires in ${config.resetCodeTtlMinutes} minutes.`,
    '',
    'If you did not request this change, you can ignore this email.',
  ].join('\n');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getEmailBrandImageUrl() {
  const origin = config.frontendOrigins[0];

  if (!origin) {
    return '';
  }

  if (/localhost|127\.0\.0\.1/i.test(origin)) {
    return '';
  }

  return `${origin.replace(/\/+$/, '')}/logo.png`;
}

function buildPasswordResetEmailHtml(name: string, code: string) {
  const safeName = escapeHtml(name || 'there');
  const safeCode = escapeHtml(code);
  const safeMinutes = escapeHtml(String(config.resetCodeTtlMinutes));
  const brandName = escapeHtml(config.smtpFromName || 'Library');
  const brandImageUrl = getEmailBrandImageUrl();
  const supportEmail = escapeHtml(buildFromAddress().replace(/^.*<([^>]+)>.*$/, '$1') || config.smtpUser || config.resendFromEmail || '');
  const avatarLabel = escapeHtml((name || brandName).trim().charAt(0).toUpperCase() || 'L');

  const logoMarkup = brandImageUrl
    ? `<img src="${escapeHtml(brandImageUrl)}" alt="${brandName}" width="78" height="78" style="display:block;width:78px;height:78px;border-radius:24px;object-fit:cover;border:0;" />`
    : `<div style="width:78px;height:78px;border-radius:24px;background:linear-gradient(135deg,#f4ebff 0%,#ede9fe 100%);color:#5218a5;font-size:30px;font-weight:700;line-height:78px;text-align:center;">${avatarLabel}</div>`;

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Library password reset code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your Library verification code is ${safeCode}. It expires in ${safeMinutes} minutes.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px 56px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;max-width:720px;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <div style="font-size:40px;line-height:1;font-weight:700;letter-spacing:-0.03em;color:#111827;">
                  ${brandName}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:26px;">
                ${logoMarkup}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <div style="font-size:18px;line-height:28px;color:#6b7280;">Hello ${safeName},</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <div style="font-size:32px;line-height:1.25;font-weight:700;color:#111827;">
                  Your verification code is
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:34px;">
                <div style="display:inline-block;font-size:44px;line-height:1;font-weight:300;letter-spacing:14px;color:#111827;">
                  ${safeCode}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:54px;">
                <div style="max-width:520px;font-size:16px;line-height:30px;color:#374151;">
                  This code will expire in ${safeMinutes} minutes. If you didn&apos;t request this, you can safely ignore this email.${supportEmail ? ` Need help? Contact <a href="mailto:${supportEmail}" style="color:#ec4899;text-decoration:none;">support</a>.` : ''}
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:8px;border-top:1px solid #f3f4f6;">
                <div style="padding-top:28px;font-size:13px;line-height:22px;color:#9ca3af;">
                  ${brandName} Library System
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

function buildFromAddress() {
  const fromEmail = config.smtpFromEmail || config.smtpUser || config.resendFromEmail;

  if (!fromEmail) {
    return '';
  }

  return config.smtpFromName ? `${config.smtpFromName} <${fromEmail}>` : fromEmail;
}

async function deliverPasswordResetCode(email: string, name: string, code: string) {
  const hasAnySmtpSetting = Boolean(
    config.smtpService
    || config.smtpHost
    || config.smtpUser
    || config.smtpPass
    || config.smtpFromEmail,
  );
  const hasCompleteSmtpConfig = Boolean(
    (config.smtpService || config.smtpHost)
    && config.smtpUser
    && config.smtpPass,
  );

  if (hasAnySmtpSetting && !hasCompleteSmtpConfig) {
    throw new Error('SMTP email is partially configured. Set SMTP_SERVICE or SMTP_HOST together with SMTP_USER and SMTP_PASS.');
  }

  if (hasCompleteSmtpConfig) {
    const transporter = nodemailer.createTransport(
      config.smtpService
        ? {
            service: config.smtpService,
            auth: {
              user: config.smtpUser,
              pass: config.smtpPass,
            },
          }
        : {
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpSecure,
            auth: {
              user: config.smtpUser,
              pass: config.smtpPass,
            },
          },
    );

    await transporter.sendMail({
      from: buildFromAddress(),
      to: email,
      subject: 'Your Library password reset code',
      text: buildPasswordResetEmailText(name, code),
      html: buildPasswordResetEmailHtml(name, code),
    });

    return 'email' as const;
  }

  if (!config.resendApiKey || !config.resendFromEmail) {
    if (config.isProduction) {
      throw new Error('Password reset email is not configured yet. Add SMTP settings or RESEND_API_KEY and RESEND_FROM_EMAIL.');
    }

    console.info(`[password-reset] ${email} (${name}) -> ${code}`);
    return 'development' as const;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.resendFromEmail,
      to: [email],
      subject: 'Your Library password reset code',
      text: buildPasswordResetEmailText(name, code),
      html: buildPasswordResetEmailHtml(name, code),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'Unable to send the password reset email.');
  }

  return 'email' as const;
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
  return createSignedToken<TokenPayload>({
    id: user.id,
    exp: Date.now() + TOKEN_TTL_MS,
  });
}

function createPasswordResetToken(userId: number, resetId: string) {
  return createSignedToken<PasswordResetTokenPayload>({
    id: userId,
    resetId,
    purpose: 'password-reset',
    exp: Date.now() + PASSWORD_RESET_TOKEN_TTL_MS,
  });
}

export async function verifyAuthToken(token?: string | null) {
  const payload = verifySignedToken<TokenPayload>(token);

  if (!payload || typeof payload.id !== 'number') {
    return null;
  }

  return getAppUserById(payload.id);
}

export async function loginStaff(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);

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

  await createNotification({
    type: 'auth',
    title: 'Successful login',
    message: `${user.name} signed in to the library dashboard.`,
    link: '/dashboard',
  }).catch(() => undefined);

  return {
    token: createAuthToken(user),
    user,
  };
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw new Error('Enter the email address linked to your account.');
  }

  const result = await pool.query<Pick<AppUserRow, 'id' | 'email' | 'full_name'>>(
    `
      SELECT id, email, full_name
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
    `,
    [normalizedEmail],
  );

  const account = result.rows[0];

  if (!account) {
    throw new Error('No account was found with that email address.');
  }

  await pool.query(
    `
      UPDATE password_reset_codes
      SET consumed_at = NOW()
      WHERE user_id = $1 AND consumed_at IS NULL
    `,
    [account.id],
  );

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const resetId = randomBytes(16).toString('hex');

  await pool.query(
    `
      INSERT INTO password_reset_codes (id, user_id, code_hash, expires_at)
      VALUES ($1, $2, $3, NOW() + ($4 || ' minutes')::interval)
    `,
    [resetId, account.id, hashResetCode(code), String(config.resetCodeTtlMinutes)],
  );

  const delivery = await deliverPasswordResetCode(account.email, account.full_name, code);

  await createNotification({
    type: 'security',
    title: 'Password reset requested',
    message: `${account.full_name} requested a password reset code.`,
    link: '/notifications',
  }).catch(() => undefined);

  return {
    email: account.email,
    expiresInMinutes: config.resetCodeTtlMinutes,
    delivery,
    debugCode: delivery === 'development' ? code : undefined,
  };
}

export async function verifyPasswordResetCode(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = code.replace(/\D/g, '');

  if (!normalizedEmail || normalizedCode.length !== 6) {
    throw new Error('Enter the 6-digit verification code.');
  }

  const result = await pool.query<PasswordResetRow>(
    `
      SELECT
        reset.id,
        reset.user_id,
        reset.code_hash,
        reset.expires_at,
        reset.consumed_at,
        users.email,
        users.full_name
      FROM password_reset_codes reset
      JOIN users ON users.id = reset.user_id
      WHERE LOWER(users.email) = $1
        AND reset.consumed_at IS NULL
      ORDER BY reset.created_at DESC
      LIMIT 1
    `,
    [normalizedEmail],
  );

  const resetRecord = result.rows[0];

  if (!resetRecord) {
    throw new Error('Request a new code before trying to verify it.');
  }

  if (new Date(resetRecord.expires_at).getTime() <= Date.now()) {
    throw new Error('That verification code has expired. Request a new one.');
  }

  if (!timingSafeEqual(Buffer.from(resetRecord.code_hash), Buffer.from(hashResetCode(normalizedCode)))) {
    throw new Error('The verification code is invalid.');
  }

  return {
    resetToken: createPasswordResetToken(resetRecord.user_id, resetRecord.id),
  };
}

export async function resetPassword(resetToken: string, password: string) {
  if (password.trim().length < 8) {
    throw new Error('Use at least 8 characters for the new password.');
  }

  const payload = verifySignedToken<PasswordResetTokenPayload>(resetToken);

  if (
    !payload
    || payload.purpose !== 'password-reset'
    || typeof payload.id !== 'number'
    || typeof payload.resetId !== 'string'
  ) {
    throw new Error('Your reset session is no longer valid. Start again.');
  }

  const resetRecord = await pool.query<PasswordResetRow>(
    `
      SELECT
        reset.id,
        reset.user_id,
        reset.code_hash,
        reset.expires_at,
        reset.consumed_at,
        users.email,
        users.full_name
      FROM password_reset_codes reset
      JOIN users ON users.id = reset.user_id
      WHERE reset.id = $1
        AND reset.user_id = $2
        AND reset.consumed_at IS NULL
      LIMIT 1
    `,
    [payload.resetId, payload.id],
  );

  const currentReset = resetRecord.rows[0];

  if (!currentReset || new Date(currentReset.expires_at).getTime() <= Date.now()) {
    throw new Error('That reset session has expired. Request a new password reset code.');
  }

  const nextPasswordHash = hashPassword(password);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
        UPDATE users
        SET password_hash = $2, updated_at = NOW()
        WHERE id = $1
      `,
      [payload.id, nextPasswordHash],
    );

    await client.query(
      `
        UPDATE password_reset_codes
        SET consumed_at = NOW()
        WHERE user_id = $1 AND consumed_at IS NULL
      `,
      [payload.id],
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  await createNotification({
    type: 'security',
    title: 'Password updated',
    message: `${currentReset.full_name} changed their account password.`,
    link: '/login',
  }).catch(() => undefined);

  return {
    message: 'Password updated successfully.',
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
