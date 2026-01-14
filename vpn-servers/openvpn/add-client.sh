#!/bin/bash
# Add OpenVPN Client Configuration

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <client-name>"
    exit 1
fi

CLIENT_NAME=$1
cd /etc/openvpn/easy-rsa

# Generate client certificate
./easyrsa gen-req "$CLIENT_NAME" nopass
./easyrsa sign-req client "$CLIENT_NAME"

# Create client configuration directory
mkdir -p /etc/openvpn/clients

# Generate client configuration
cat > "/etc/openvpn/clients/${CLIENT_NAME}.ovpn" << EOF
client
dev tun
proto udp
remote YOUR_SERVER_IP 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA512
verb 3

<ca>
$(cat /etc/openvpn/ca.crt)
</ca>

<cert>
$(cat pki/issued/${CLIENT_NAME}.crt)
</cert>

<key>
$(cat pki/private/${CLIENT_NAME}.key)
</key>

<tls-auth>
$(cat /etc/openvpn/ta.key)
</tls-auth>

key-direction 1
EOF

echo "Client configuration created: /etc/openvpn/clients/${CLIENT_NAME}.ovpn"
