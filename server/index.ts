import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { config } from './config.ts';
import { ensureDatabaseExists, pool } from './db.ts';
import { initializeLibraryStore } from './library-store.ts';
import { apiRouter } from './routes.ts';

const app = express();
const distPath = path.resolve(process.cwd(), 'dist');

app.use(cors({
  origin(origin, callback) {
    if (!origin || config.frontendOrigins.length === 0 || config.frontendOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed.`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get(/^\/(?!api(?:\/|$)).*/, (_request, response) => {
    response.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error.';
  console.error(error);
  response.status(500).json({ message });
});

async function start() {
  await ensureDatabaseExists();
  await initializeLibraryStore();

  app.listen(config.port, () => {
    console.log(`Library API running on http://localhost:${config.port}`);
  });
}

start().catch(async (error) => {
  console.error('Failed to start Library API');
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
