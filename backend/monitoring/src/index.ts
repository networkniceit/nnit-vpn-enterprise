import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import promClient from 'prom-client';

const app = express();
const PORT = process.env.MONITORING_PORT || 3006;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'monitoring', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/api/monitoring/stats', (req, res) => {
  res.json({ 
    message: 'System statistics',
    connections: 1523,
    servers: 45,
    users: 10234,
  });
});

app.listen(PORT, () => {
  console.log(`Monitoring service listening on port ${PORT}`);
});

export default app;
