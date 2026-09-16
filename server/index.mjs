import express from 'express';
import path from 'node:path';
import { apiMiddleware } from './api.mjs';

const port = Number(process.env.PORT || process.env.WEBSITES_PORT || 8787);
const app = express();
// Azure App Service sits behind a reverse proxy (HTTPS, client IP).
app.set('trust proxy', 1);
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use(apiMiddleware);

const dist = path.resolve(process.cwd(), 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Build the app first (npm run build).');
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`KET API + static on http://0.0.0.0:${port}`);
});
