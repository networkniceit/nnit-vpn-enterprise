const express = require('express');
const router = express.Router();

const vpnServers = [
  {
    id: 'us-east-1',
    name: 'United States East',
    country: 'US',
    city: 'New York',
    flag: '\uD83C\uDDFA\uD83C\uDDF8',
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
    flag: '\uD83C\uDDEC\uD83C\uDDE7',
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
    flag: '\uD83C\uDDF8\uD83C\uDDEC',
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
    flag: '\uD83C\uDDE9\uD83C\uDDEA',
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
    flag: '\uD83C\uDDFA\uD83C\uDDF8',
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
    flag: '\uD83C\uDDEF\uD83C\uDDF5',
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

router.get('/', (req, res) => {
  res.json({ success: true, count: vpnServers.length, servers: vpnServers });
});

router.get('/fastest', (req, res) => {
  const fastestServer = vpnServers.filter(s => s.status === 'online').sort((a, b) => a.latency - b.latency)[0];
  res.json({ success: true, server: fastestServer });
});

router.get('/:id', (req, res) => {
  const server = vpnServers.find(s => s.id === req.params.id);
  if (!server) return res.status(404).json({ success: false, error: 'Server not found' });
  res.json({ success: true, server });
});

router.get('/country/:country', (req, res) => {
  const servers = vpnServers.filter(s => s.country.toLowerCase() === req.params.country.toLowerCase());
  res.json({ success: true, count: servers.length, servers });
});

router.post('/:id/connect', async (req, res) => {
  const server = vpnServers.find(s => s.id === req.params.id);
  if (!server) return res.status(404).json({ success: false, error: 'Server not found' });
  if (server.status !== 'online') return res.status(503).json({ success: false, error: 'Server is currently offline' });

  const config = {
    serverId: server.id,
    protocol: server.protocol,
    ip: server.ip,
    port: server.port,
    publicKey: 'mock_public_key_here',
    allowedIPs: '0.0.0.0/0',
    dns: '1.1.1.1, 1.0.0.1'
  };
  res.json({ success: true, message: 'Connection configuration generated', config });
});

module.exports = router;
