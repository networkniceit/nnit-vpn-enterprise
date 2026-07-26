const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const serverRoutes = require('./routes/servers');
const sessionRoutes = require('./routes/sessions');
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  credentials: true
}));

app.use('/api/admin', cors({ origin: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'NNIT VPN API'
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'NetworkNiceIT Tec VPN API',
    version: '1.0.0',
    company: 'Network Nice IT Tec (NNIT)',
    contact: 'networkniceit@gmail.com',
    docs: '/api/docs'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    console.error('Server will continue, but auth routes may fail until DB is reachable.');
  }

  app.listen(PORT, () => {
    console.log('========================================');
    console.log('   NNIT VPN API Server');
    console.log('   Network Nice IT Tec (NNIT)');
    console.log('========================================');
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('   Contact: networkniceit@gmail.com');
    console.log('========================================');
  });
}

start();
