import express from 'express';
import cors from 'cors';
import apiRouter from './api/index.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api', apiRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(500).json({ success: false, error: err.message ?? 'Internal server error' });
});

export default app;
