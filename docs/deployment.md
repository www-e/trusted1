# Deployment Configuration & Infrastructure

## Infrastructure Overview

### Primary Infrastructure
- **Hosting Platform**: Coolify (Self-hosted deployment platform)
- **VPS Provider**: Contabo
- **Server Specifications**: 3 vCPU, 8 GB RAM, 300 GB SSD, 1 Snapshot
- **Database**: PostgreSQL hosted on Contabo VPS
- **File Storage**: VPS-hosted media server for chat and verification files

### Environment Stages
```
Development → Staging → Production
```

## Server Architecture

### Single VPS Deployment (MVP)
```
┌─────────────────────────────────────┐
│           Contabo VPS               │
├─────────────────────────────────────┤
│  Coolify (Portainer)               │
├─────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐    │
│  │   Backend   │ │   Frontend  │    │
│  │  Node.js    │ │   Flutter   │    │
│  │  TypeScript │ │    Web      │    │
│  └─────────────┘ └─────────────┘    │
├─────────────────────────────────────┤
│  PostgreSQL Database               │
├─────────────────────────────────────┤
│  File Storage (/uploads)           │
└─────────────────────────────────────┘
```

## Coolify Setup

### Installation
```bash
# Install Coolify on fresh Ubuntu server
curl -fsSL https://cdn.coolify.io/install.sh | bash
```

### Configuration
```yaml
# coolify/config.yaml
server:
  ip: "your-vps-ip"
  port: 8000

database:
  postgresql:
    enabled: true
    version: "15"
    database: "trusted"
    username: "trusted_user"
    password: "secure_password"

storage:
  local:
    path: "/opt/coolify/storage"
    max_size: "100GB"
```

## Backend Deployment (Node.js + TypeScript)

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   └── types/
├── dist/                    # Compiled JavaScript
├── node_modules/
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── coolify.json
```

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 trusted

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER trusted

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/index.js"]
```

### Coolify Service Configuration
```json
{
  "name": "trusted-backend",
  "type": "nodejs",
  "build": {
    "dockerfile": "Dockerfile",
    "context": "./backend"
  },
  "environment": {
    "NODE_ENV": "production",
    "DATABASE_URL": "postgresql://...",
    "JWT_SECRET": "...",
    "PAYMOB_API_KEY": "...",
    "REDIS_URL": "redis://..."
  },
  "ports": [
    {
      "published": 3000,
      "target": 3000
    }
  ],
  "volumes": [
    {
      "source": "/opt/coolify/uploads",
      "target": "/app/uploads"
    }
  ]
}
```

## Frontend Deployment (Flutter Web)

### Build Configuration
```yaml
# pubspec.yaml
name: trusted_flutter
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  socket_io_client: ^2.0.3
  file_picker: ^5.3.2
  image_picker: ^1.0.0
  # ... other dependencies

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/
```

### Web-Specific Configuration
```bash
# Build for web
flutter build web --release --web-renderer html

# For better performance with large apps
flutter build web --release --web-renderer canvaskit
```

### Coolify Static Site Configuration
```json
{
  "name": "trusted-frontend",
  "type": "static",
  "build": {
    "command": "flutter build web --release",
    "publishDir": "build/web"
  },
  "environment": {
    "API_BASE_URL": "https://api.trusted.com"
  }
}
```

## Database Setup

### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE trusted;

-- Create user
CREATE USER trusted_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE trusted TO trusted_user;

-- Connect and create tables
\c trusted;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial tables (from services.md)
-- ... table creation scripts
```

### Connection String
```
postgresql://trusted_user:secure_password@localhost:5432/trusted
```

## Environment Variables

### Backend Environment
```bash
# Database
DATABASE_URL=postgresql://trusted_user:secure_password@localhost:5432/trusted

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Paymob Integration
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_HMAC_SECRET=your_hmac_secret
PAYMOB_WEBHOOK_SECRET=your_webhook_secret

# File Upload
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=20971520

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.trusted.com

# Security
CORS_ORIGINS=https://trusted.com,https://www.trusted.com
RATE_LIMIT_WINDOW=15min
RATE_LIMIT_MAX=100
```

### Frontend Environment
```bash
# API Configuration
API_BASE_URL=https://api.trusted.com
SOCKET_URL=wss://api.trusted.com

# App Configuration
APP_NAME=Trusted
APP_VERSION=1.0.0

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
```

## File Storage Configuration

### Directory Structure
```
/opt/coolify/uploads/
├── chat-media/
│   ├── images/
│   └── videos/
├── kyc-documents/
│   ├── id-front/
│   ├── id-back/
│   ├── selfies/
│   └── sides/
└── listings/
    └── screenshots/
```

### Nginx Configuration for File Serving
```nginx
server {
    listen 80;
    server_name media.trusted.com;

    location /uploads/ {
        alias /opt/coolify/uploads/;
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

## Deployment Pipeline

### Automated Deployment with Coolify

#### 1. Repository Setup
```bash
# Backend repository
https://github.com/your-org/trusted-backend

# Frontend repository
https://github.com/your-org/trusted-flutter
```

#### 2. Coolify Project Configuration
```json
{
  "name": "trusted-platform",
  "repository": "https://github.com/your-org/trusted-backend",
  "branch": "main",
  "build": {
    "type": "docker",
    "dockerfile": "Dockerfile"
  },
  "environment_variables": [
    { "key": "NODE_ENV", "value": "production" }
  ],
  "deployments": [
    {
      "name": "production",
      "url": "https://api.trusted.com"
    }
  ]
}
```

### Deployment Commands
```bash
# Manual deployment via Coolify CLI
coolify deploy --project trusted-backend --environment production

# Check deployment status
coolify status --project trusted-backend

# View logs
coolify logs --project trusted-backend --lines 100
```

## Monitoring & Logging

### Application Monitoring
```yaml
# Logging configuration
logging:
  level: info
  file: /app/logs/app.log
  max_size: 100MB
  max_files: 5

# Health check endpoint
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": "72h",
  "database": "connected",
  "redis": "connected"
}
```

### Server Monitoring
- **CPU/Memory**: Built-in VPS monitoring
- **Disk Usage**: Automated alerts at 80% threshold
- **Network**: Bandwidth monitoring
- **Services**: Coolify service health checks

## Backup Strategy

### Database Backups
```bash
# Daily PostgreSQL backup
pg_dump trusted > /opt/backups/trusted-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups"
DB_NAME="trusted"
pg_dump $DB_NAME > $BACKUP_DIR/$DB_NAME-$(date +%Y%m%d_%H%M%S).sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### File Storage Backups
```bash
# Sync uploads to external storage
rclone sync /opt/coolify/uploads remote:trusted-backups

# Retention policy
rclone cleanup remote:trusted-backups --min-age 7d
```

## SSL/TLS Configuration

### Let's Encrypt Setup
```bash
# Install certbot
apt install certbot

# Generate certificates
certbot certonly --webroot -w /opt/coolify -d api.trusted.com -d trusted.com

# Auto-renewal
crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

### SSL Configuration in Coolify
```json
{
  "ssl": {
    "enabled": true,
    "provider": "letsencrypt",
    "domains": ["api.trusted.com", "trusted.com"]
  }
}
```

## Scaling Considerations

### Current Limitations (MVP)
- Single VPS deployment
- No load balancing
- Shared database instance
- Local file storage

### Growth Scaling Plan

#### Stage 1: 20K-50K Users
```yaml
# Redis caching
redis:
  enabled: true
  host: redis-server
  port: 6379

# CDN for static assets
cdn:
  provider: cloudflare
  domain: cdn.trusted.com
```

#### Stage 2: 50K-100K Users
```yaml
# Multi-VPS setup
vps:
  - primary: vps-1 (database, API)
  - secondary: vps-2 (file storage, cache)
  - tertiary: vps-3 (backup, monitoring)

# Load balancing
load_balancer:
  algorithm: round-robin
  health_check: /health
```

## Security Hardening

### Firewall Configuration
```bash
# UFW setup
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 8000  # Coolify
ufw enable
```

### Fail2Ban Configuration
```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
```

## Troubleshooting

### Common Issues

#### Deployment Failures
```bash
# Check Coolify logs
coolify logs --project trusted-backend --follow

# Check application logs
docker logs trusted-backend-container

# Verify environment variables
coolify env:list --project trusted-backend
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U trusted_user -d trusted

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-15-main.log
```

#### File Upload Issues
```bash
# Check disk space
df -h /opt/coolify

# Check permissions
ls -la /opt/coolify/uploads/

# Test upload endpoint
curl -X POST http://localhost:3000/upload/test
```

## Maintenance Procedures

### Regular Tasks
- **Daily**: Check server resources and logs
- **Weekly**: Database optimization and cleanup
- **Monthly**: Full backup verification
- **Quarterly**: Security updates and dependency updates

### Update Procedures
```bash
# Update Coolify
coolify update

# Update application
coolify deploy --project trusted-backend --force

# Database migrations
npm run migrate:deploy
```

## Cost Optimization

### Current Monthly Costs (Estimated)
- **Contabo VPS**: $15-25/month
- **Domain Registration**: $10-15/year
- **SSL Certificates**: Free (Let's Encrypt)
- **CDN**: $5-20/month (when needed)

### Cost Scaling
- **Additional VPS**: $15-25/month each
- **Managed Database**: $20-50/month
- **CDN Services**: $10-100/month based on usage
- **Monitoring Tools**: $5-25/month