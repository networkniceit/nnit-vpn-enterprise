import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.VPN_CORE_PORT || 3005;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vpn-core', timestamp: new Date().toISOString() });
});

// VPN Core routes
app.post('/api/vpn/wireguard/config', (req, res) => {
  res.json({ message: 'Generate WireGuard config' });
});

app.post('/api/vpn/openvpn/config', (req, res) => {
  res.json({ message: 'Generate OpenVPN config' });
});

app.post('/api/vpn/connect', (req, res) => {
  res.json({ message: 'Initiate VPN connection' });
});

app.post('/api/vpn/disconnect', (req, res) => {
  res.json({ message: 'Disconnect VPN' });
});

app.listen(PORT, () => {
  console.log(`VPN Core service listening on port ${PORT}`);
});

export default app;
