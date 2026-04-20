import { Client, Pool } from 'pg';
import { config } from './config.ts';

const rawDatabaseUrl = new URL(config.databaseUrl);
const shouldUseSsl = !/localhost|127\.0\.0\.1/i.test(rawDatabaseUrl.hostname);

function normalizeConnectionUrl(url: URL) {
  const normalized = new URL(url.toString());

  if (shouldUseSsl) {
    normalized.searchParams.delete('ssl');
    normalized.searchParams.delete('sslmode');
    normalized.searchParams.delete('sslcert');
    normalized.searchParams.delete('sslkey');
    normalized.searchParams.delete('sslrootcert');
  }

  return normalized;
}

const databaseUrl = normalizeConnectionUrl(rawDatabaseUrl);
const databaseName = databaseUrl.pathname.replace(/^\//, '');

export const pool = new Pool({
  connectionString: databaseUrl.toString(),
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
});

function escapeIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

export async function ensureDatabaseExists() {
  if (!databaseName || databaseName === 'postgres') {
    return;
  }

  const adminUrl = normalizeConnectionUrl(databaseUrl);
  adminUrl.pathname = '/postgres';

  const client = new Client({
    connectionString: adminUrl.toString(),
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();

    const result = await client.query<{ datname: string }>(
      'SELECT datname FROM pg_database WHERE datname = $1',
      [databaseName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${escapeIdentifier(databaseName)}`);
    }
  } catch (error) {
    console.warn(`Unable to ensure database "${databaseName}" exists before startup.`);
    console.warn(error);
  } finally {
    await client.end().catch(() => undefined);
  }
}
