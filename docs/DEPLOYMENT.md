# Deployment Guide

## Production Deployment Options

### Option 1: Kubernetes Deployment (Recommended)

#### Prerequisites
- Kubernetes cluster (EKS, GKE, or AKS)
- kubectl configured
- Docker images built and pushed to registry
- Domain name configured

#### Steps

1. **Build and Push Docker Images**

```bash
# Build all services
for service in auth api admin billing vpn-core monitoring; do
  docker build -t nnit-vpn/$service:latest ./backend/$service
  docker tag nnit-vpn/$service:latest your-registry.com/nnit-vpn/$service:latest
  docker push your-registry.com/nnit-vpn/$service:latest
done
```

2. **Create Kubernetes Secrets**

```bash
kubectl create secret generic database-secret \
  --from-literal=host=your-db-host \
  --from-literal=username=your-db-user \
  --from-literal=password=your-db-password \
  --from-literal=database=nnit_vpn

kubectl create secret generic jwt-secret \
  --from-literal=secret=your-jwt-secret \
  --from-literal=refreshSecret=your-refresh-secret

kubectl create secret generic stripe-secret \
  --from-literal=secretKey=your-stripe-secret-key \
  --from-literal=webhookSecret=your-webhook-secret
```

3. **Apply Kubernetes Manifests**

```bash
# Apply ConfigMaps and Secrets
kubectl apply -f infrastructure/k8s/configmap.yaml

# Deploy services
kubectl apply -f infrastructure/k8s/auth-deployment.yaml
kubectl apply -f infrastructure/k8s/api-deployment.yaml

# Apply Ingress
kubectl apply -f infrastructure/k8s/ingress.yaml

# Apply HPA
kubectl apply -f infrastructure/k8s/hpa.yaml
```

4. **Verify Deployment**

```bash
# Check pod status
kubectl get pods

# Check services
kubectl get services

# View logs
kubectl logs -f deployment/api-service

# Check ingress
kubectl get ingress
```

#### SSL/TLS Certificate

Install cert-manager for automatic SSL certificates:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@nnitvpn.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Option 2: Docker Compose Deployment

For smaller deployments or staging environments:

```bash
# Build images
docker-compose -f infrastructure/docker/docker-compose.prod.yml build

# Start services
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f infrastructure/docker/docker-compose.prod.yml logs -f

# Stop services
docker-compose -f infrastructure/docker/docker-compose.prod.yml down
```

### Option 3: Terraform + AWS

#### Prerequisites
- AWS account
- Terraform installed
- AWS CLI configured

#### Steps

1. **Initialize Terraform**

```bash
cd infrastructure/terraform
terraform init
```

2. **Configure Variables**

Create `terraform.tfvars`:

```hcl
aws_region = "us-east-1"
db_username = "postgres"
db_password = "your-secure-password"
db_instance_class = "db.t3.small"
environment = "production"
```

3. **Plan Deployment**

```bash
terraform plan
```

4. **Apply Configuration**

```bash
terraform apply
```

5. **Get Outputs**

```bash
terraform output database_endpoint
terraform output redis_endpoint
```

## Database Setup

### Run Migrations

```bash
# Connect to production database
export DATABASE_URL="postgresql://user:pass@host:5432/nnit_vpn"

# Run migrations
npm run db:migrate
```

### Backup Strategy

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U postgres nnit_vpn | gzip > $BACKUP_DIR/nnit_vpn_$DATE.sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

## VPN Server Setup

### WireGuard Server

```bash
# SSH to VPN server
ssh ubuntu@vpn-server-ip

# Run installation script
sudo bash /path/to/vpn-servers/wireguard/install.sh

# Add clients
sudo bash /path/to/vpn-servers/wireguard/add-client.sh client1
```

### OpenVPN Server

```bash
# SSH to VPN server
ssh ubuntu@vpn-server-ip

# Run installation script
sudo bash /path/to/vpn-servers/openvpn/install.sh

# Add clients
sudo bash /path/to/vpn-servers/openvpn/add-client.sh client1
```

## Environment Variables

Create production `.env` file with secure values:

```bash
NODE_ENV=production

# Authentication
AUTH_PORT=3001
JWT_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>

# Database
DATABASE_HOST=<rds-endpoint>
DATABASE_PORT=5432
DATABASE_NAME=nnit_vpn
DATABASE_USER=<db-user>
DATABASE_PASSWORD=<secure-password>
DATABASE_SSL=true

# Redis
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>

# Stripe
STRIPE_SECRET_KEY=<live-secret-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# Firebase
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=<private-key>

# Twilio
TWILIO_ACCOUNT_SID=<account-sid>
TWILIO_AUTH_TOKEN=<auth-token>
TWILIO_PHONE_NUMBER=<phone-number>
```

## Monitoring Setup

### Prometheus

```bash
# Configure targets in prometheus.yml
kubectl apply -f infrastructure/k8s/prometheus-config.yaml
```

### Grafana

1. Access Grafana: `http://grafana.nnitvpn.com`
2. Login with admin credentials
3. Add Prometheus data source
4. Import dashboards from `infrastructure/grafana-dashboards/`

### Alerts

Configure PagerDuty or email alerts:

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname']

receivers:
  - name: 'default'
    email_configs:
      - to: 'alerts@nnitvpn.com'
        from: 'monitoring@nnitvpn.com'
```

## Health Checks

Monitor service health:

```bash
# Check all services
curl https://api.nnitvpn.com/health
curl https://auth.nnitvpn.com/health
curl https://admin.nnitvpn.com/health
```

## Rolling Updates

```bash
# Update deployment with new image
kubectl set image deployment/api-service api=nnit-vpn/api:v2.5.1

# Check rollout status
kubectl rollout status deployment/api-service

# Rollback if needed
kubectl rollout undo deployment/api-service
```

## Scaling

### Manual Scaling

```bash
# Scale replicas
kubectl scale deployment/api-service --replicas=5
```

### Auto-Scaling

HPA automatically scales based on CPU/memory:

```bash
# Check HPA status
kubectl get hpa

# View HPA details
kubectl describe hpa api-service-hpa
```

## Security Checklist

- [ ] All secrets stored in Kubernetes Secrets or AWS Secrets Manager
- [ ] SSL/TLS certificates configured
- [ ] Database encryption at rest enabled
- [ ] VPC security groups configured
- [ ] Rate limiting enabled
- [ ] DDoS protection active (CloudFlare/AWS Shield)
- [ ] Regular security updates applied
- [ ] Audit logging enabled
- [ ] Backup and recovery tested
- [ ] Monitoring and alerts configured

## Troubleshooting

### View Logs

```bash
# Kubernetes
kubectl logs -f deployment/api-service

# Docker Compose
docker-compose logs -f api-service

# Application logs
tail -f /var/log/nnit-vpn/api.log
```

### Database Connection Issues

```bash
# Test connection
psql -h <db-host> -U <db-user> -d nnit_vpn

# Check connectivity from pod
kubectl exec -it <pod-name> -- psql -h <db-host> -U <db-user> -d nnit_vpn
```

### Service Not Responding

```bash
# Check pod status
kubectl get pods
kubectl describe pod <pod-name>

# Restart deployment
kubectl rollout restart deployment/api-service
```

## Post-Deployment Verification

1. **Test Authentication**
   ```bash
   curl -X POST https://api.nnitvpn.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

2. **Test VPN Connection**
   - Download client configuration
   - Connect to VPN
   - Verify IP change
   - Test internet connectivity

3. **Monitor Performance**
   - Check Grafana dashboards
   - Review error rates
   - Monitor response times

4. **Test Failover**
   - Simulate pod failure
   - Verify auto-recovery
   - Check service availability

## Maintenance

### Regular Tasks

- **Daily**: Review monitoring alerts
- **Weekly**: Check backup integrity
- **Monthly**: Security patches, certificate renewal checks
- **Quarterly**: Disaster recovery testing, capacity planning
