import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.ts';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    system: 'Customer Resolution Agent Backend',
    exerciseDate: 'Wednesday, 23 September 2026',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Customer Resolution Agent Server running on http://localhost:${PORT}`);
  console.log(`📅 System Exercise Date: Wednesday, 23 September 2026`);
});
