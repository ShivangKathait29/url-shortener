import express from 'express';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  return res.json({status :'Server is up and running...'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});