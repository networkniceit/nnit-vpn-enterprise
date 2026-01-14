#!/bin/bash
# OpenVPN Server Installation and Configuration Script
# For Ubuntu 22.04 LTS

set -e

echo "Installing OpenVPN and Easy-RSA..."
apt-get update
apt-get install -y openvpn easy-rsa

# Setup Easy-RSA
make-cadir /etc/openvpn/easy-rsa
cd /etc/openvpn/easy-rsa

# Configure Easy-RSA
cat > vars << EOF
set_var EASYRSA_REQ_COUNTRY    "US"
set_var EASYRSA_REQ_PROVINCE   "California"
set_var EASYRSA_REQ_CITY       "San Francisco"
set_var EASYRSA_REQ_ORG        "NNIT VPN"
set_var EASYRSA_REQ_EMAIL      "admin@nnitvpn.com"
set_var EASYRSA_REQ_OU         "VPN Server"
set_var EASYRSA_ALGO           "ec"
set_var EASYRSA_DIGEST         "sha512"
EOF

# Initialize PKI
./easyrsa init-pki
./easyrsa build-ca nopass
./easyrsa gen-req server nopass
./easyrsa sign-req server server
./easyrsa gen-dh
openvpn --genkey secret /etc/openvpn/ta.key

# Copy certificates
cp pki/ca.crt pki/issued/server.crt pki/private/server.key /etc/openvpn/
cp pki/dh.pem /etc/openvpn/

# Create server configuration
cat > /etc/openvpn/server.conf << EOF
port 1194
proto udp
dev tun

ca ca.crt
cert server.crt
key server.key
dh dh.pem
tls-auth ta.key 0

server 10.8.0.0 255.255.255.0
ifconfig-pool-persist ipp.txt

push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 1.1.1.1"
push "dhcp-option DNS 1.0.0.1"

keepalive 10 120
cipher AES-256-GCM
auth SHA512
user nobody
group nogroup
persist-key
persist-tun

status openvpn-status.log
log-append /var/log/openvpn.log
verb 3
explicit-exit-notify 1
EOF

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# Configure firewall
ufw allow 1194/udp
ufw allow OpenSSH
ufw --force enable

# Detect default network interface
DEFAULT_IFACE=$(ip route | grep '^default' | awk '{print $5}' | head -n1)
if [ -z "$DEFAULT_IFACE" ]; then
    echo "Warning: Could not detect default network interface. Please configure NAT manually."
    DEFAULT_IFACE="eth0"
fi

echo "Using network interface: $DEFAULT_IFACE"

# Configure NAT
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o "$DEFAULT_IFACE" -j MASQUERADE

# Enable and start OpenVPN
systemctl enable openvpn@server
systemctl start openvpn@server

echo "OpenVPN installation complete!"
echo "CA certificate created in /etc/openvpn/ca.crt"
