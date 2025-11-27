# Production Deployment Guide

## Overview

This guide covers deploying archcloud-aiseo to a production VPS with PostgreSQL, Nginx, and PM2.

## Prerequisites

- Ubuntu 22.04+ VPS
- Node.js 20+
- PostgreSQL 15+
- Nginx
- PM2 (for process management)
- Domain with SSL certificate

## Environment Setup

### 1. Database Setup

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE archcloud_aiseo;
CREATE USER aiseo_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE archcloud_aiseo TO aiseo_user;
\q
```

### 2. Clone and Install

```bash
# Clone repository
git clone https://github.com/your-org/archcloud-aiseo.git
cd archcloud-aiseo

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
nano .env
```

### 3. Configure Environment Variables

**Required Variables:**

```bash
# Database - use your PostgreSQL connection string
DATABASE_URL="postgresql://aiseo_user:your-secure-password@localhost:5432/archcloud_aiseo"

# NextAuth - generate secure random strings
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Stripe - from Stripe Dashboard
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."

# Platform API Keys (fallbacks when workspace doesn't have BYOK)
OPENAI_API_KEY="sk-..."
PAGESPEED_API_KEY="..."
SERP_API_KEY="..."

# Service account for admin/dash API
SERVICE_ACCOUNT_API_KEY="$(openssl rand -hex 32)"

# Encryption for BYOK
ENCRYPTION_KEY="$(openssl rand -hex 32)"
```

**Optional Variables:**

```bash
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Monitoring
SENTRY_DSN=""
LOGFLARE_API_KEY=""
```

### 4. Database Migration

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Verify schema
pnpm prisma db pull
```

### 5. Build Application

```bash
# Build for production
pnpm build

# Test build locally
pnpm start
```

### 6. PM2 Setup

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'archcloud-aiseo',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/path/to/archcloud-aiseo',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup script
pm2 startup
```

### 7. Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/archcloud-aiseo
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for long-running requests (audits, etc.)
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Stripe webhook with raw body
    location /api/stripe/webhook {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 1M;
    }

    # Static assets caching
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=3600";
    }

    # Logs
    access_log /var/log/nginx/archcloud-aiseo-access.log;
    error_log /var/log/nginx/archcloud-aiseo-error.log;
}

# Proxy cache configuration
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/archcloud-aiseo /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl status certbot.timer
```

## Post-Deployment

### 1. Verify Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs archcloud-aiseo

# Monitor resources
pm2 monit
```

### 2. Database Health

```bash
# Connect to database
psql -U aiseo_user -d archcloud_aiseo

# Check tables
\dt

# Verify data
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Workspace";
```

### 3. Test Critical Flows

1. **Authentication**
   - Sign up with credentials
   - Sign in with credentials
   - Sign in with Google (if configured)
   - Password reset flow

2. **Workspace Setup**
   - Complete onboarding
   - Create workspace
   - Invite team members

3. **Core Features**
   - Create client
   - Create project
   - Add keywords
   - Run SEO audit
   - Generate content brief
   - Create/edit documents

4. **Billing**
   - View billing page
   - Subscribe to plan (with test card)
   - Access portal
   - Cancel subscription

### 4. Set Up Monitoring

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/archcloud-aiseo
```

```
/path/to/archcloud-aiseo/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 5. Backups

```bash
# Database backup script
cat > /usr/local/bin/backup-aiseo-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/archcloud-aiseo"
mkdir -p $BACKUP_DIR
pg_dump -U aiseo_user archcloud_aiseo | gzip > "$BACKUP_DIR/aiseo-$(date +%Y%m%d-%H%M%S).sql.gz"
# Keep last 30 days
find $BACKUP_DIR -name "aiseo-*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-aiseo-db.sh

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-aiseo-db.sh
```

## Maintenance

### Updating Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Run migrations
pnpm prisma migrate deploy

# Rebuild
pnpm build

# Restart PM2
pm2 restart archcloud-aiseo

# Check status
pm2 status
pm2 logs archcloud-aiseo --lines 50
```

### Database Migrations

```bash
# Generate migration
pnpm prisma migrate dev --name descriptive_name

# Apply to production
pnpm prisma migrate deploy

# Verify
pnpm prisma db pull
```

### Rollback Strategy

```bash
# If issues occur, rollback PM2
pm2 stop archcloud-aiseo

# Restore database from backup
gunzip < /var/backups/archcloud-aiseo/aiseo-YYYYMMDD-HHMMSS.sql.gz | psql -U aiseo_user archcloud_aiseo

# Checkout previous version
git checkout <previous-commit>
pnpm install
pnpm build
pm2 restart archcloud-aiseo
```

## Troubleshooting

### Edge Runtime Errors

**Symptom:** "PrismaClientValidationError: In order to run Prisma Client on edge runtime..."

**Solution:** All API routes now have `export const runtime = "nodejs";` at the top. If you add new routes, ensure they include this declaration.

### Auth/Session Issues

**Symptom:** "JWTSessionError" or authentication failures

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set and consistent
2. Check `NEXTAUTH_URL` matches your domain
3. Clear cookies and try again
4. Check PM2 logs: `pm2 logs archcloud-aiseo`

### Document Creation Fails

**Symptom:** 500 error when creating documents

**Solution:**
1. Verify workspace exists and user has access
2. Check Prisma schema matches code
3. Review logs: `pm2 logs archcloud-aiseo | grep DOCUMENT`

### OpenAI/External API Errors

**Symptom:** Content briefs or audits failing

**Solution:**
1. Check workspace has valid BYOK configured, or
2. Set platform fallback keys in `.env`
3. Features gracefully degrade when keys missing

### Performance Issues

```bash
# Check Node.js memory
pm2 show archcloud-aiseo

# Increase memory limit if needed
pm2 delete archcloud-aiseo
pm2 start ecosystem.config.js --node-args="--max-old-space-size=4096"

# Check database performance
psql -U aiseo_user -d archcloud_aiseo -c "SELECT * FROM pg_stat_activity;"

# Add database indexes if needed
```

## Security Checklist

- [ ] All environment variables set correctly
- [ ] Database credentials are strong
- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (ufw/iptables)
- [ ] SSH key-only authentication
- [ ] Regular backups automated
- [ ] Log rotation configured
- [ ] Nginx security headers enabled
- [ ] Rate limiting enabled
- [ ] BYOK encryption key is secure and backed up

## Support

For issues or questions:
1. Check logs: `pm2 logs archcloud-aiseo`
2. Review this guide
3. Check GitHub issues
4. Contact support team
