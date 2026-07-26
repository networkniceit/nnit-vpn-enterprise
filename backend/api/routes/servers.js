const express = require('express');
const router = express.Router();

// Mock VPN servers data (replace with database in production)
const vpnServers = [
  {
    id: 'us-east-1',
    name: 'United States East',
    country: 'US',
    city: 'New York',
    flag: '🇺🇸',
    ip: '45.79.123.45',
    port: 51820,
    protocol: 'WireGuard',
    load: 45,
    latency: 23,
    status: 'online',
    capacity: 1000,
    currentUsers: 450
  },
  {
    id: 'eu-west-1',
    name: 'United Kingdom',
    country: 'GB',
    city: 'London',
    flag: '🇬🇧',
    ip: '78.141.220.91',
    port: 51820,
    protocol: 'WireGuard',
    load: 62,
    latency: 78,
    status: 'online',
    capacity: 800,
    currentUsers: 496
  },
  {
    id: 'as-south-1',
    name: 'Singapore',
    country: 'SG',
    city: 'Singapore',
    flag: '🇸🇬',
    ip: '139.162.23.178',
    port: 51820,
    protocol: 'WireGuard',
    load: 38,
    latency: 142,
    status: 'online',
    capacity: 500,
    currentUsers: 190
  },
  {
    id: 'eu-central-1',
    name: 'Germany',
    country: 'DE',
    city: 'Frankfurt',
    flag: '🇩🇪',
    ip: '172.105.77.200',
    port: 51820,
    protocol: 'WireGuard',
    load: 28,
    latency: 45,
    status: 'online',
    capacity: 1200,
    currentUsers: 336
  },
  {
    id: 'us-west-1',
    name: 'United States West',
    country: 'US',
    city: 'Los Angeles',
    flag: '🇺🇸',
    ip: '173.255.244.88',
    port: 51820,
    protocol: 'OpenVPN',
    load: 71,
    latency: 45,
    status: 'online',
    capacity: 900,
    currentUsers: 639
  },
  {
    id: 'jp-east-1',
    name: 'Japan',
    country: 'JP',
    city: 'Tokyo',
    flag: '🇯🇵',
    ip: '172.232.45.123',
    port: 51820,
    protocol: 'WireGuard',
    load: 54,
    latency: 167,
    status: 'online',
    capacity: 700,
    currentUsers: 378
  }
];

// GET /api/servers - List all VPN servers
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: vpnServers.length,
    servers: vpnServers
  });
});

// GET /api/servers/fastest - Get fastest server
router.get('/fastest', (req, res) => {
  const fastestServer = vpnServers
    .filter(s => s.status === 'online')
    .sort((a, b) => a.latency - b.latency)[0];

  res.json({
    success: true,
    server: fastestServer
  });
});

// GET /api/servers/:id - Get specific server
router.get('/:id', (req, res) => {
  const server = vpnServers.find(s => s.id === req.params.id);

  if (!server) {
    return res.status(404).json({
      success: false,
      error: 'Server not found'
    });
  }

  res.json({
    success: true,
    server
  });
});

// GET /api/servers/country/:country - Get servers by country
router.get('/country/:country', (req, res) => {
  const servers = vpnServers.filter(
    s => s.country.toLowerCase() === req.params.country.toLowerCase()
  );

  res.json({
    success: true,
    count: servers.length,
    servers
  });
});

// POST /api/servers/:id/connect - Connect to server
router.post('/:id/connect', async (req, res) => {
  const server = vpnServers.find(s => s.id === req.params.id);

  if (!server) {
    return res.status(404).json({
      success: false,
      error: 'Server not found'
    });
  }

  if (server.status !== 'online') {
    return res.status(503).json({
      success: false,
      error: 'Server is currently offline'
    });
  }

  const config = {
    serverId: server.id,
    protocol: server.protocol,
    ip: server.ip,
    port: server.port,
    publicKey: 'mock_public_key_here',
    allowedIPs: '0.0.0.0/0',
    dns: '1.1.1.1, 1.0.0.1'
  };

  res.json({
    success: true,
    message: 'Connection configuration generated',
    config
  });
});

module.exports = router;