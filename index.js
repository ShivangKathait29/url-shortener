import express from 'express';
import 'dotenv/config';
import userRoutes from './routes/user.routes.js';
import { authenticateMiddleware } from './middlewares/auth.middleware.js';
const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(authenticateMiddleware);
app.use("/user", userRoutes);

app.get('/', (req, res) => {
  return res.json({status :'Server is up and running...'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));