import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

export function createApp({ staticDistPath } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRouter);

  if (staticDistPath) {
    app.use(express.static(staticDistPath));
    app.get(/^\/(?!api).*/, (_req, res) => {
      res.sendFile(`${staticDistPath}/index.html`, (err) => {
        if (err) res.status(404).json({ error: 'Client not built. Run: npm run build --prefix client' });
      });
    });
  }

  return app;
}

export default createApp();
