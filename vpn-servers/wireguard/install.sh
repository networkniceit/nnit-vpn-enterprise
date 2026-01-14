#!/bin/bash
# WireGuard Server Installation and Configuration Script
# For Ubuntu 22.04 LTS

set -e

echo "Installing WireGuard..."
apt-get update
apt-get install -y wireguard iptables

# Generate server keys
echo "Generating server keys..."
SERVER_PRIVATE_KEY=$(wg genkey)
SERVER_PUBLIC_KEY=$(echo "$SERVER_PRIVATE_KEY" | wg pubkey)

# Create WireGuard configuration directory
mkdir -p /etc/wireguard

# Create server configuration
cat > /etc/wireguard/wg0.conf << EOF
[Interface]
PrivateKey = $SERVER_PRIVATE_KEY
Address = 10.8.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
SaveConfig = true
EOF

# Set permissions
chmod 600 /etc/wireguard/wg0.conf

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p

# Configure firewall
ufw allow 51820/udp
ufw allow OpenSSH
ufw --force enable

# Enable and start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

echo "WireGuard installation complete!"
echo "Server Public Key: $SERVER_PUBLIC_KEY"
echo ""
echo "Save these keys securely:"
echo "Private Key: $SERVER_PRIVATE_KEY"
echo "Public Key: $SERVER_PUBLIC_KEY"
