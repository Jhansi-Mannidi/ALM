import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const distPath = path.join(__dirname, '../client/dist');
const app = createApp({ staticDistPath: distPath });

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
