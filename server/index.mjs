import express from 'express';
import path from 'node:path';
import { apiMiddleware } from './api.mjs';

const port = Number(process.env.PORT || 8787);
const app = express();
app.use(apiMiddleware);

const dist = path.resolve(process.cwd(), 'dist');
app.use(express.static(dist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Build the app first (npm run build).');
  });
});

app.listen(port, () => {
  console.log(`KET API + static on http://localhost:${port}`);
});
