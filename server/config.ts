import dotenv from 'dotenv';

dotenv.config();

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

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
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
};
