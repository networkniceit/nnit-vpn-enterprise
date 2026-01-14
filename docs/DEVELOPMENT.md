# Development Setup Guide

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 16
- Redis 7
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/networkniceit/nnit-vpn-enterprise.git
cd nnit-vpn-enterprise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database credentials
- Redis connection
- Firebase credentials
- JWT secrets
- Stripe API keys
- Twilio credentials (for SMS MFA)

### 4. Start Development Environment

#### Option A: Using Docker Compose (Recommended)

```bash
npm run docker:dev
```

This will start:
- PostgreSQL database
- Redis cache
- All backend services
- Prometheus
- Grafana
- Nginx reverse proxy

#### Option B: Local Development

Start services individually:

```bash
# Terminal 1 - Auth Service
npm run dev:auth

# Terminal 2 - API Service
npm run dev:api

# Terminal 3 - Admin Service
npm run dev:admin

# Terminal 4 - Billing Service
npm run dev:billing
```

### 5. Database Setup

Run migrations:

```bash
npm run db:migrate
```

Seed initial data:

```bash
npm run db:seed
```

### 6. Verify Installation

Check service health:

```bash
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # API Service
curl http://localhost:3003/health  # Admin Service
```

## Development Workflow

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

```bash
npm run typecheck
```

### Building

```bash
# Build all services
npm run build

# Build specific service
npm run build --workspace=backend/auth
```

## Project Structure

```
nnit-vpn-enterprise/
├── backend/                 # Backend services
│   ├── auth/               # Authentication service
│   ├── api/                # Main API service
│   ├── admin/              # Admin service
│   ├── billing/            # Billing service
│   ├── vpn-core/           # VPN core service
│   └── monitoring/         # Monitoring service
├── apps/                   # Frontend applications
│   ├── mobile/             # React Native mobile app
│   ├── desktop/            # Electron desktop app
│   ├── admin-dashboard/    # Admin web dashboard
│   └── user-portal/        # User portal web app
├── infrastructure/         # Infrastructure configuration
│   ├── docker/             # Docker Compose files
│   ├── k8s/                # Kubernetes manifests
│   ├── terraform/          # Terraform configurations
│   └── ci-cd/              # CI/CD configurations
├── vpn-servers/            # VPN server setup scripts
│   ├── wireguard/          # WireGuard configuration
│   └── openvpn/            # OpenVPN configuration
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
└── docs/                   # Documentation

```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 3001 | http://localhost:3001 |
| API Service | 3002 | http://localhost:3002 |
| Admin Service | 3003 | http://localhost:3003 |
| Billing Service | 3004 | http://localhost:3004 |
| VPN Core Service | 3005 | http://localhost:3005 |
| Monitoring Service | 3006 | http://localhost:3006 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Prometheus | 9090 | http://localhost:9090 |
| Grafana | 3000 | http://localhost:3000 |

## Database Migrations

### Create a new migration

```bash
cd backend/api
npx sequelize-cli migration:generate --name create-users-table
```

### Run migrations

```bash
npm run db:migrate
```

### Undo last migration

```bash
npm run db:migrate:undo
```

## API Documentation

Once the API service is running, access the Swagger documentation:

http://localhost:3002/api-docs

## Debugging

### VSCode Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Auth Service",
      "program": "${workspaceFolder}/backend/auth/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/auth/dist/**/*.js"]
    }
  ]
}
```

### Logs

View service logs:

```bash
# Docker logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f auth-service

# Application logs (if running locally)
tail -f backend/auth/logs/combined.log
```

## Troubleshooting

### Database connection issues

1. Verify PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check connection settings in `.env`

3. Test connection:
   ```bash
   psql -h localhost -U postgres -d nnit_vpn
   ```

### Redis connection issues

1. Verify Redis is running:
   ```bash
   docker ps | grep redis
   ```

2. Test connection:
   ```bash
   redis-cli ping
   ```

### Port conflicts

If ports are already in use, modify the ports in:
- `.env` file
- `infrastructure/docker/docker-compose.yml`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Support

For issues and questions:
- GitHub Issues: https://github.com/networkniceit/nnit-vpn-enterprise/issues
- Email: support@nnitvpn.com
