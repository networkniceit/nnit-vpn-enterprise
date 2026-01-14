# NNIT VPN Enterprise - Architecture Documentation

## System Architecture Overview

The NNIT VPN Enterprise platform is built using a microservices architecture with the following key components:

### Backend Services

#### 1. Authentication Service (Port 3001)
- **Purpose**: User authentication, registration, and MFA
- **Technology**: Node.js, Express, Firebase Admin SDK
- **Key Features**:
  - Firebase Authentication integration
  - JWT token generation and validation
  - Multi-Factor Authentication (TOTP, SMS)
  - OAuth 2.0 providers (Google, Microsoft)
  - Password reset and email verification

#### 2. API Service (Port 3002)
- **Purpose**: Main REST API for VPN operations
- **Technology**: Node.js, Express, PostgreSQL, Redis
- **Key Features**:
  - User management
  - Server listing and selection
  - Connection management
  - Usage statistics
  - OpenAPI/Swagger documentation

#### 3. Admin Service (Port 3003)
- **Purpose**: Administrative operations and management
- **Technology**: Node.js, Express
- **Key Features**:
  - User management (CRUD)
  - Server management
  - Analytics and reporting
  - Role-Based Access Control (RBAC)
  - Audit logging

#### 4. Billing Service (Port 3004)
- **Purpose**: Payment and subscription management
- **Technology**: Node.js, Express, Stripe SDK
- **Key Features**:
  - Subscription creation and management
  - Payment processing
  - Webhook handling
  - Invoice generation
  - Refund processing

#### 5. VPN Core Service (Port 3005)
- **Purpose**: VPN configuration and connection management
- **Technology**: Node.js, Express
- **Key Features**:
  - WireGuard configuration generation
  - OpenVPN configuration generation
  - Key pair generation
  - Connection request processing
  - IP address assignment

#### 6. Monitoring Service (Port 3006)
- **Purpose**: System monitoring and metrics
- **Technology**: Node.js, Express, Prometheus
- **Key Features**:
  - Prometheus metrics collection
  - Performance monitoring
  - Health checks
  - Alert management

### Frontend Applications

#### 1. Mobile App (React Native)
- **Platforms**: iOS and Android
- **Key Screens**:
  - Home (Connection toggle)
  - Servers (Server selection with map)
  - Settings (Kill switch, auto-connect)
- **Features**:
  - One-tap connection
  - Biometric authentication
  - Push notifications
  - Dark mode support

#### 2. Desktop App (Electron)
- **Platforms**: Windows, macOS, Linux
- **Key Features**:
  - System tray integration
  - Auto-start on boot
  - Native notifications
  - Split tunneling configuration
  - Statistics dashboard

#### 3. Admin Dashboard (React)
- **Purpose**: Administrative web interface
- **Key Pages**:
  - Dashboard (KPIs and overview)
  - Users (Management table)
  - Servers (Status and monitoring)
  - Analytics (Charts and reports)
  - Settings (System configuration)

#### 4. User Portal (React)
- **Purpose**: User account management
- **Key Pages**:
  - Dashboard
  - Account settings
  - Subscription management
  - Download clients
  - Support center

### Data Layer

#### PostgreSQL Database
- **Tables**:
  - users
  - servers
  - connections
  - subscriptions
  - audit_logs
- **Features**:
  - Connection pooling
  - SSL/TLS encryption
  - Automated backups
  - Replication

#### Redis Cache
- **Purpose**: Session management and caching
- **Use Cases**:
  - JWT token blacklist
  - Rate limiting
  - API response caching
  - Real-time connection tracking

### Infrastructure

#### Docker
- Development environment with Docker Compose
- All services containerized
- PostgreSQL and Redis containers
- Nginx reverse proxy
- Prometheus and Grafana for monitoring

#### Kubernetes
- Production deployment
- Auto-scaling configurations
- Load balancing
- Health checks and self-healing
- Rolling updates

#### Terraform
- Infrastructure as Code
- AWS resource provisioning
- VPC and networking setup
- RDS and ElastiCache
- Security groups and IAM roles

### Security

#### Encryption
- **In Transit**: TLS 1.3 for all connections
- **At Rest**: AES-256 encryption for data storage
- **VPN Protocols**: 
  - WireGuard with ChaCha20-Poly1305
  - OpenVPN with AES-256-GCM

#### Authentication
- JWT tokens with RS256 algorithm
- Token refresh mechanism
- MFA support (TOTP, SMS)
- OAuth 2.0 integration

#### Authorization
- Role-Based Access Control (RBAC)
- API key management
- Rate limiting
- IP whitelisting

### Monitoring and Logging

#### Prometheus
- Metrics collection from all services
- Custom application metrics
- System resource monitoring

#### Grafana
- Visualization dashboards
- Alert management
- Real-time monitoring

#### Winston Logger
- Structured logging
- Log levels (error, warn, info, debug)
- Log aggregation
- Error tracking

### CI/CD Pipeline

#### GitHub Actions
- Automated testing
- Code quality checks (ESLint, Prettier)
- Security scanning (Snyk, Trivy)
- Docker image building
- Kubernetes deployment
- Rollback capabilities

## Data Flow

### User Authentication Flow
1. User submits credentials to Auth Service
2. Auth Service validates with Firebase
3. JWT tokens generated and returned
4. Tokens stored in Redis for session management
5. Subsequent requests validated via JWT middleware

### VPN Connection Flow
1. User selects server from mobile/desktop app
2. API Service validates user subscription
3. VPN Core Service generates configuration
4. Configuration sent to client
5. Client establishes VPN connection
6. Connection logged in database
7. Metrics sent to Monitoring Service

### Billing Flow
1. User selects subscription plan
2. Billing Service creates Stripe checkout session
3. User completes payment
4. Stripe webhook notifies Billing Service
5. Subscription activated in database
6. User notified of successful subscription

## Scalability

### Horizontal Scaling
- All services are stateless
- Kubernetes HPA for auto-scaling
- Load balancing across pods
- Session data in Redis cluster

### Vertical Scaling
- Database connection pooling
- Redis caching layer
- CDN for static assets
- Async job processing with Bull

### Performance Optimization
- Database indexing
- Query optimization
- Response caching
- CDN integration
- Image optimization

## High Availability

### Redundancy
- Multiple replicas per service
- Database replication
- Redis cluster mode
- Multi-AZ deployment

### Failover
- Health checks
- Automatic pod restart
- Circuit breakers
- Graceful degradation

### Backup and Recovery
- Automated database backups
- Point-in-time recovery
- Disaster recovery plan
- Regular backup testing
