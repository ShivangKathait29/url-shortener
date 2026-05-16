import express from 'express';
import 'dotenv/config';
import userRoutes from './routes/user.routes.js';
import urlRouter from './routes/url.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { authenticateMiddleware } from './middlewares/auth.middleware.js';
import { securityHeaders } from './middlewares/security.middleware.js';
import { initCounter } from './utils/counter.js';
import redis from './cache/index.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(securityHeaders);
app.use(authenticateMiddleware);

app.use("/user", userRoutes);
app.use("/analytics", analyticsRoutes);
app.use(urlRouter);

app.get('/', (req, res) => {
  return res.json({status :'Server is up and running...'});
});

await initCounter().catch((err) => {
  console.error('[Fatal] Could not seed Redis counter:', err);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function shutdown() {
  console.log('Shutting down...');
  await redis.quit();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);