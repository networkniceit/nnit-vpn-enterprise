import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.ADMIN_PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin', timestamp: new Date().toISOString() });
});

// Admin routes
app.get('/api/admin/users', (req, res) => {
  res.json({ message: 'Admin - Get all users' });
});

app.get('/api/admin/servers', (req, res) => {
  res.json({ message: 'Admin - Get all servers' });
});

app.get('/api/admin/analytics', (req, res) => {
  res.json({ message: 'Admin - Get analytics' });
});

app.listen(PORT, () => {
  console.log(`Admin service listening on port ${PORT}`);
});

export default app;
