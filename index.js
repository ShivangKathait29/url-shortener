import express from 'express';
import 'dotenv/config';
import userRoutes from './routes/user.routes.js';
import urlRouter from './routes/url.routes.js';
import { authenticateMiddleware } from './middlewares/auth.middleware.js';
import { securityHeaders } from './middlewares/security.middleware.js';
import { initCounter } from './utils/counter.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(securityHeaders);
app.use(authenticateMiddleware);

app.use("/user", userRoutes);
app.use(urlRouter);

app.get('/', (req, res) => {
  return res.json({status :'Server is up and running...'});
});

await initCounter();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));