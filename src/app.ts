import express from 'express';
import { ZodError } from 'zod';

import { urlRouter } from './routes/urlRoutes.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', urlRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid request body',
      details: error.flatten()
    });
    return;
  }

  res.status(500).json({
    error: error instanceof Error ? error.message : 'Internal server error'
  });
});

export default app;
