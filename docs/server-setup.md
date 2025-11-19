# Server Setup Guide

This document provides detailed instructions for setting up the ArchCloud AI SEO application on a VPS.

## Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 20.04 LTS or newer
- **RAM:** 2GB minimum, 4GB recommended
- **Storage:** 20GB minimum
- **CPU:** 2 cores minimum
- **Network:** Public IP address with port 80/443 access

### Required Software
- Node.js v20+
- PostgreSQL 14+
- Nginx
- PM2 (process manager)
- Git

---

## Initial Server Setup

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Node.js

Using NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:

```bash
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

### 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database and user:

```bash
sudo -u postgres psql

# In PostgreSQL shell:
CREATE USER archcloud WITH PASSWORD 'your_secure_password';
CREATE DATABASE archcloud_aiseo OWNER archcloud;
GRANT ALL PRIVILEGES ON DATABASE archcloud_aiseo TO archcloud;
\q
```

Configure PostgreSQL to accept connections:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add line:
```
local   archcloud_aiseo    archcloud                md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 5. Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 6. Install Git

```bash
sudo apt install -y git
```

---

## Application Deployment

### 1. Create Deploy User (Optional but Recommended)

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
su - deploy
```

### 2. Clone Repository

```bash
cd /home/deploy
git clone <repository-url> archcloud-aiseo
cd archcloud-aiseo
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add all required variables:

```env
# App
NEXT_PUBLIC_APP_BASE_URL=https://ai.archcloudsystems.com

# Database
DATABASE_URL=postgresql://archcloud:your_secure_password@localhost:5432/archcloud_aiseo

# Auth.js
NEXTAUTH_URL=https://ai.archcloudsystems.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>

# Stripe
STRIPE_PUBLIC_KEY=<from-stripe-dashboard>
STRIPE_SECRET_KEY=<from-stripe-dashboard>
STRIPE_WEBHOOK_SECRET=<from-stripe-webhooks>

# Stripe Price IDs
STRIPE_STARTER_PRICE_ID=<from-stripe-products>
STRIPE_PRO_PRICE_ID=<from-stripe-products>
STRIPE_ENTERPRISE_PRICE_ID=<from-stripe-products>

# OpenAI
OPENAI_API_KEY=<from-openai>

# Misc
NODE_ENV=production
```

Generate secure secret:

```bash
openssl rand -base64 32
```

### 5. Set Up Database

```bash
npx prisma generate
npx prisma migrate deploy
```

### 6. Build Application

```bash
npm run build
```

### 7. Start with PM2

```bash
pm2 start "npm run start -- -p 3001" --name aiseo
pm2 save
pm2 startup  # Follow the instructions output by this command
```

Verify it's running:

```bash
pm2 status
pm2 logs aiseo
```

---

## Nginx Configuration

### 1. Create Site Configuration

```bash
sudo nano /etc/nginx/sites-available/ai.archcloudsystems.com
```

Add configuration:

```nginx
server {
    listen 80;
    server_name ai.archcloudsystems.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/ai.archcloudsystems.com /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 3. Install SSL Certificate (Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ai.archcloudsystems.com
```

Follow prompts and select redirect HTTP to HTTPS.

### 4. Auto-Renewal

Certbot installs a cron job automatically. Verify:

```bash
sudo systemctl status certbot.timer
```

---

## Firewall Configuration

### Using UFW

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Monitoring & Maintenance

### PM2 Monitoring

```bash
pm2 monit           # Real-time monitoring
pm2 logs aiseo      # View logs
pm2 restart aiseo   # Restart app
pm2 reload aiseo    # Zero-downtime reload
```

### System Resource Monitoring

```bash
htop                # Interactive process viewer
df -h               # Disk usage
free -m             # Memory usage
```

### Database Backup

Create backup script:

```bash
nano ~/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U archcloud archcloud_aiseo > $BACKUP_DIR/aiseo_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "aiseo_*.sql" -mtime +7 -delete
```

Make executable and add to cron:

```bash
chmod +x ~/backup-db.sh
crontab -e
```

Add line for daily 2 AM backup:

```
0 2 * * * /home/deploy/backup-db.sh
```

### Log Rotation

PM2 handles log rotation automatically. Configure in ecosystem file if needed.

---

## Updating the Application

### 1. Pull Latest Changes

```bash
cd /home/deploy/archcloud-aiseo
git pull origin main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Migrations

```bash
npx prisma migrate deploy
```

### 4. Rebuild

```bash
npm run build
```

### 5. Reload PM2

```bash
pm2 reload aiseo
```

---

## Troubleshooting

### Application Won't Start

Check logs:

```bash
pm2 logs aiseo --lines 100
```

### Database Connection Issues

Test connection:

```bash
psql -U archcloud -d archcloud_aiseo -h localhost
```

Check environment variables:

```bash
cd /home/deploy/archcloud-aiseo
cat .env | grep DATABASE_URL
```

### Nginx Errors

Check Nginx error log:

```bash
sudo tail -f /var/log/nginx/error.log
```

Test configuration:

```bash
sudo nginx -t
```

### Port Already in Use

Find process using port 3001:

```bash
sudo lsof -i :3001
```

Kill if necessary:

```bash
sudo kill -9 <PID>
```

### Out of Memory

Check memory usage:

```bash
free -m
```

Increase swap if needed:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### SSL Certificate Issues

Renew manually:

```bash
sudo certbot renew
```

Check certificate status:

```bash
sudo certbot certificates
```

---

## Security Best Practices

1. **Keep System Updated:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Use Strong Passwords:**
   - Database passwords
   - User passwords
   - NEXTAUTH_SECRET

3. **Restrict Database Access:**
   - Only allow local connections
   - Use firewall rules

4. **Enable Fail2Ban:**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   ```

5. **Regular Backups:**
   - Database backups
   - Code backups
   - Environment variable backups

6. **Monitor Logs:**
   - Application logs
   - Nginx logs
   - System logs

7. **Use Environment Variables:**
   - Never commit secrets to git
   - Keep .env file secure

---

## Performance Optimization

### 1. Enable Gzip in Nginx

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### 2. Add Browser Caching

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Configure PM2 Cluster Mode

```bash
pm2 start ecosystem.config.js
```

ecosystem.config.js:

```js
module.exports = {
  apps: [{
    name: 'aiseo',
    script: 'npm',
    args: 'run start -- -p 3001',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

---

**Last Updated:** 2025-11-14
