#!/bin/bash
# Add WireGuard Client Configuration

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <client-name>"
    exit 1
fi

CLIENT_NAME=$1

# Check if WireGuard interface exists
if ! wg show wg0 &>/dev/null; then
    echo "Error: WireGuard interface wg0 not found. Is WireGuard running?"
    exit 1
fi

# Calculate client IP based on existing peers
PEER_COUNT=$(wg show wg0 | grep -c peer || echo 0)
CLIENT_IP="10.8.0.$((PEER_COUNT + 2))"

# Get server public key
if [ ! -f /etc/wireguard/publickey ]; then
    echo "Error: Server public key not found. Run install.sh first."
    exit 1
fi
SERVER_PUBLIC_KEY=$(cat /etc/wireguard/publickey)
SERVER_ENDPOINT="YOUR_SERVER_IP:51820"

# Generate client keys
CLIENT_PRIVATE_KEY=$(wg genkey)
CLIENT_PUBLIC_KEY=$(echo "$CLIENT_PRIVATE_KEY" | wg pubkey)
CLIENT_PRESHARED_KEY=$(wg genpsk)

# Add peer to server
wg set wg0 peer "$CLIENT_PUBLIC_KEY" preshared-key <(echo "$CLIENT_PRESHARED_KEY") allowed-ips "$CLIENT_IP/32"

# Save configuration
wg-quick save wg0

# Generate client configuration file
cat > "/etc/wireguard/clients/${CLIENT_NAME}.conf" << EOF
[Interface]
PrivateKey = $CLIENT_PRIVATE_KEY
Address = $CLIENT_IP/24
DNS = 1.1.1.1, 1.0.0.1

[Peer]
PublicKey = $SERVER_PUBLIC_KEY
PresharedKey = $CLIENT_PRESHARED_KEY
Endpoint = $SERVER_ENDPOINT
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF

echo "Client configuration created: /etc/wireguard/clients/${CLIENT_NAME}.conf"
echo ""
echo "Client configuration:"
cat "/etc/wireguard/clients/${CLIENT_NAME}.conf"
