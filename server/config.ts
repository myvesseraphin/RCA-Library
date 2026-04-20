import dotenv from 'dotenv';

dotenv.config();

function readBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function deriveSupabaseUrl(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);
    const username = decodeURIComponent(parsed.username);
    const projectRef = username.split('.').at(-1);

    if (projectRef && projectRef !== username) {
      return `https://${projectRef}.supabase.co`;
    }
  } catch {
    // Fall through to the explicit env lookup below.
  }

  return process.env.SUPABASE_URL;
}

const databaseUrl = readRequiredEnv('DATABASE_URL');

function readOrigins() {
  const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (process.env.RENDER_EXTERNAL_URL) {
    configuredOrigins.push(process.env.RENDER_EXTERNAL_URL.trim());
  }

  return Array.from(new Set(configuredOrigins));
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigins: readOrigins(),
  databaseUrl,
  authSecret: process.env.AUTH_SECRET ?? 'library-dev-auth-secret',
  supabaseUrl: deriveSupabaseUrl(databaseUrl),
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'images',
  librarianName: process.env.LIBRARIAN_NAME ?? 'IRASUBIZA Saly Nelson',
  librarianRole: process.env.LIBRARIAN_ROLE ?? 'Librarian',
  seedAdminName: process.env.SEED_ADMIN_NAME ?? 'IRASUBIZA Saly Nelson',
  seedAdminRole: process.env.SEED_ADMIN_ROLE ?? process.env.LIBRARIAN_ROLE ?? 'Librarian',
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL ?? 'irasubizasalynelson@gmail.com',
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'nelson 250!',
  smtpService: process.env.SMTP_SERVICE?.trim() ?? '',
  smtpHost: process.env.SMTP_HOST?.trim() ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 465),
  smtpSecure: readBooleanEnv('SMTP_SECURE', true),
  smtpUser: process.env.SMTP_USER?.trim() ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL?.trim() ?? '',
  smtpFromName: process.env.SMTP_FROM_NAME?.trim() ?? 'Library',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? '',
  resetCodeTtlMinutes: Number(process.env.RESET_CODE_TTL_MINUTES ?? 15),
  isProduction: process.env.NODE_ENV === 'production' || process.env.RENDER === 'true',
};
