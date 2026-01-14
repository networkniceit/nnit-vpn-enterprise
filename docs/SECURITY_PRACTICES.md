# Security Best Practices

## Overview

Security is paramount for a VPN service. This document outlines security measures implemented and best practices to follow.

## Authentication & Authorization

### Password Security
- Minimum 8 characters with complexity requirements
- Passwords hashed using bcrypt with salt rounds of 10
- Password reset tokens expire after 1 hour
- Account lockout after 5 failed login attempts

### JWT Tokens
- RS256 algorithm for signing
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Tokens include user ID and roles
- Blacklist for revoked tokens stored in Redis

### Multi-Factor Authentication
- TOTP (Time-based One-Time Password) support
- SMS verification via Twilio
- Backup codes with bcrypt hashing
- MFA enforcement for admin accounts

### OAuth Integration
- Google OAuth 2.0
- Microsoft OAuth 2.0
- State parameter for CSRF protection
- Nonce for replay attack prevention

## Network Security

### VPN Encryption
- **WireGuard**: ChaCha20-Poly1305 cipher
- **OpenVPN**: AES-256-GCM cipher
- Perfect Forward Secrecy (PFS)
- Regular key rotation

### TLS/SSL
- TLS 1.3 for all communications
- Strong cipher suites only
- HSTS headers enabled
- Certificate pinning in mobile apps

### Firewall Configuration
```bash
# Allow only necessary ports
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP (redirect to HTTPS)
ufw allow 443/tcp     # HTTPS
ufw allow 51820/udp   # WireGuard
ufw allow 1194/udp    # OpenVPN
ufw enable
```

## Data Protection

### Encryption at Rest
- Database: AES-256 encryption
- Backups: Encrypted before storage
- Secrets: AWS KMS or Vault
- User data: Column-level encryption for sensitive fields

### Encryption in Transit
- All API communications over HTTPS
- Database connections over SSL/TLS
- Redis connections secured with AUTH
- Inter-service communication encrypted

### Data Minimization
- No logging of user traffic
- Connection logs limited to:
  - Connection timestamps
  - Server location (not specific IP)
  - Total data transferred
- Automatic log rotation and deletion
- Privacy-focused analytics

## API Security

### Rate Limiting
```javascript
// Default rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Input Validation
- Joi schemas for all inputs
- Sanitization of user-provided data
- SQL injection prevention via parameterized queries
- XSS protection via content security policy

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};
```

### Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

## Infrastructure Security

### Kubernetes Security

```yaml
# Pod Security Policy
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'secret'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
spec:
  podSelector:
    matchLabels:
      app: api-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx
    ports:
    - protocol: TCP
      port: 3002
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### Secrets Management

```bash
# Using Kubernetes Secrets
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password=$(openssl rand -base64 32)

# Using AWS Secrets Manager
aws secretsmanager create-secret \
  --name nnit-vpn/production/db \
  --secret-string '{"username":"admin","password":"secure-password"}'
```

## Vulnerability Management

### Dependency Scanning
```yaml
# GitHub Actions - Snyk
- name: Run Snyk Security Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### Container Scanning
```yaml
# Trivy scanning
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

### Regular Updates
- Weekly dependency updates via Dependabot
- Monthly security patches for base images
- Quarterly penetration testing
- Annual security audits

## Logging & Monitoring

### Security Event Logging
```javascript
// Log security events
logger.warn('Failed login attempt', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString(),
});
```

### Audit Trail
- All administrative actions logged
- User authentication events tracked
- Configuration changes recorded
- Logs retained for 90 days
- GDPR-compliant log handling

### Intrusion Detection
```bash
# Install and configure Fail2ban
sudo apt-get install fail2ban

# Configure jail for SSH
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban
```

## Incident Response

### Security Incident Procedure
1. **Detection**: Monitor alerts and logs
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze logs and identify root cause
4. **Remediation**: Apply fixes and patches
5. **Recovery**: Restore services
6. **Post-Incident**: Document and improve

### Contact Information
- Security Team: security@nnitvpn.com
- PagerDuty: On-call rotation
- Escalation: CTO

## Compliance

### GDPR Compliance
- User consent for data processing
- Right to access data
- Right to deletion
- Data portability
- Privacy by design

### SOC 2 Type II
- Access controls
- System monitoring
- Change management
- Risk assessment
- Vendor management

### Data Retention
- User data: Retained while account is active
- Connection logs: 30 days
- Audit logs: 90 days
- Backups: 30 days

## Security Checklist

### Development
- [ ] Input validation on all endpoints
- [ ] Parameterized queries for database
- [ ] Secrets not in source code
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error messages don't leak information

### Deployment
- [ ] All secrets rotated
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules applied
- [ ] Database encryption enabled
- [ ] Backups encrypted
- [ ] Monitoring alerts configured

### Operations
- [ ] Weekly vulnerability scans
- [ ] Monthly security patches
- [ ] Quarterly penetration testing
- [ ] Annual security audit
- [ ] Incident response plan tested
- [ ] Team security training

## Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** publicly disclose the issue
2. Email security@nnitvpn.com with details
3. Allow up to 90 days for remediation
4. Coordinate public disclosure with our team

We appreciate security researchers and offer:
- Public acknowledgment (if desired)
- Free premium subscription
- Bug bounty for critical vulnerabilities

## Security Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework

## Regular Security Tasks

### Daily
- Review security alerts
- Monitor failed login attempts
- Check system logs

### Weekly
- Scan for vulnerabilities
- Review access logs
- Update dependencies

### Monthly
- Apply security patches
- Review user permissions
- Rotate credentials
- Test backups

### Quarterly
- Penetration testing
- Security training
- Policy review
- Disaster recovery drill

### Annually
- Comprehensive security audit
- Third-party assessment
- Insurance review
- Compliance certification renewal
