import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, '../client/dist');

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

// Serve production React build (single-port mode via npm run start:app)
app.use(express.static(distPath));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Client not built. Run: npm run build --prefix client' });
  });
});

const server = app.listen(PORT, () => {
  console.log(`ALMSphere API running at http://localhost:${PORT}`);
  console.log(`API health: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error(`Free it with: fuser -k ${PORT}/tcp\n`);
    process.exit(1);
  }
  throw err;
});
