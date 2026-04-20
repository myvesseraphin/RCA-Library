import cors from 'cors';
import express from 'express';
import { config } from './config.ts';
import { ensureDatabaseExists, pool } from './db.ts';
import { initializeLibraryStore } from './library-store.ts';
import { apiRouter } from './routes.ts';

const app = express();

app.use(cors({
  origin: config.frontendOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRouter);

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
