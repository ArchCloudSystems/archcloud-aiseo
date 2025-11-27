# ArchCloud SEO - Deployment Guide

## Platform Overview

- **Public SaaS**: `aiseo.archcloudsystems.com`
- **Admin Dashboard**: `dash.archcloudsystems.com`
- **Super Admin**: archcloudsystems@gmail.com

---

## Pre-Deployment Checklist

### 1. Environment Variables

Create `.env.production` with:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
AUTH_SECRET="generate-secure-random-string-here"
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"

# Encryption (CRITICAL)
SECRET_ENCRYPTION_KEY="generate-min-32-char-random-string"

# Optional Platform-Level API Keys (for testing/fallback)
OPENAI_API_KEY=""
SERPAPI_API_KEY=""
PAGESPEED_API_KEY=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_PRO=""
STRIPE_PRICE_ID_AGENCY=""

# Admin
CRON_SECRET="generate-secure-random-string"
INTERNAL_SERVICE_API_KEY="generate-secure-random-string"
```

### 2. Database Setup

**Apply Migrations** (in order):
```bash
# Migration 1: Initial schema
# Migration 2: RBAC and integrations
# Migration 3: Admin logging
# All should be applied via Supabase or mcp tool
```

**Create Super Admin**:
```sql
-- Run in Supabase SQL Editor
INSERT INTO "User" (email, "platformRole", name, "hasCompletedOnboarding")
VALUES ('archcloudsystems@gmail.com', 'SUPERADMIN', 'ArchCloud Systems', true)
ON CONFLICT (email) DO UPDATE
SET "platformRole" = 'SUPERADMIN',
    name = 'ArchCloud Systems',
    "hasCompletedOnboarding" = true;
```

### 3. Verify Build

```bash
npm run build
# Should complete with 0 errors
```

---

## Deployment Steps

### Step 1: Deploy Main Platform (aiseo.archcloudsystems.com)

**Using Vercel**:

1. **Connect Repository**:
   - Link GitHub/GitLab repository
   - Set root directory to project root

2. **Configure Build**:
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**:
   - Copy all variables from `.env.production`
   - Mark `SECRET_ENCRYPTION_KEY` as sensitive
   - Mark all API keys as sensitive

4. **Deploy**:
   - Deploy to production
   - Verify deployment at `aiseo.archcloudsystems.com`

5. **Custom Domain**:
   ```
   Domain: aiseo.archcloudsystems.com
   Type: CNAME
   Value: cname.vercel-dns.com
   ```

### Step 2: Verify Platform

1. **Check Homepage**: https://aiseo.archcloudsystems.com
2. **Test Login**: https://aiseo.archcloudsystems.com/auth/signin
3. **Create Test Account**: Sign up with a test email
4. **Complete Onboarding**: Verify onboarding flow works
5. **Check Dashboard**: Ensure dashboard loads

### Step 3: Create Super Admin Access

1. **Login as archcloudsystems@gmail.com**:
   - If account doesn't exist, create it via signup
   - Or create directly in database (see above)

2. **Verify Super Admin Status**:
```sql
-- Check in Supabase
SELECT email, "platformRole"
FROM "User"
WHERE email = 'archcloudsystems@gmail.com';
-- Should show platformRole = 'SUPERADMIN'
```

3. **Test Admin Routes**:
```bash
# Use browser dev tools to get session cookie
curl -X GET 'https://aiseo.archcloudsystems.com/api/admin/dash/logs?limit=10' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -H 'Origin: https://dash.archcloudsystems.com'
```

### Step 4: Deploy Dash App (dash.archcloudsystems.com)

**Create New Vercel Project** for Dash App:

1. **Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://aiseo.archcloudsystems.com
```

2. **Custom Domain**:
```
Domain: dash.archcloudsystems.com
Type: CNAME
Value: cname.vercel-dns.com
```

3. **Deploy Dash App**

4. **Test Integration**:
   - Navigate to https://dash.archcloudsystems.com
   - Login prompt should redirect to main platform
   - After login, verify API calls work
   - Check logs, users, workspaces pages

---

## Post-Deployment Configuration

### 1. Test All Integrations

**SERP API**:
```bash
# Via integrations page
1. Navigate to /integrations
2. Click Configure on SERP API
3. Add API key
4. Click Test Connection
5. Should show "Connection successful"
```

**PageSpeed Insights**:
```bash
# Via integrations page
1. Configure PageSpeed integration
2. Add Google API key
3. Test connection
```

**OpenAI**:
```bash
# Via integrations page
1. Configure OpenAI integration
2. Add API key (sk-...)
3. Test connection
```

### 2. Verify Feature Functionality

**Keywords**:
- Go to /keywords
- Select a project
- Enter comma-separated keywords
- Click "Research Keywords"
- Verify SERP API data returns

**Audits**:
- Go to /audits
- Select a project
- Enter a URL
- Click "Run Audit"
- Verify PageSpeed data returns

**Content Briefs**:
- Go to /content-briefs
- Select a project
- Enter target keyword
- Click "Generate"
- Verify AI content generates

### 3. Configure DNS

**Main Domain**:
```
aiseo.archcloudsystems.com → Vercel CNAME
```

**Dash Subdomain**:
```
dash.archcloudsystems.com → Vercel CNAME
```

**Root Domain** (optional):
```
archcloudsystems.com → Redirect to aiseo.archcloudsystems.com
```

### 4. SSL Certificates

Vercel automatically provisions SSL certificates for:
- aiseo.archcloudsystems.com
- dash.archcloudsystems.com

Verify HTTPS works for both domains.

---

## Monitoring Setup

### 1. Database Monitoring

**Supabase Dashboard**:
- Monitor connection pool
- Check query performance
- Review database size

**Key Metrics**:
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Application Logs

**Vercel Logs**:
- Function logs available in Vercel dashboard
- Filter by error level
- Set up alerts for 500 errors

**Admin Logs**:
```sql
-- Recent errors
SELECT * FROM "AdminLog"
WHERE level = 'ERROR'
ORDER BY timestamp DESC
LIMIT 50;

-- Security events
SELECT * FROM "AdminLog"
WHERE level = 'SECURITY'
ORDER BY timestamp DESC
LIMIT 50;
```

### 3. Performance Monitoring

**Page Load Times**:
- Use Vercel Analytics
- Monitor Core Web Vitals
- Track API response times

**Database Performance**:
- Use Supabase Query Performance panel
- Identify slow queries
- Add indexes as needed

---

## Security Hardening

### 1. Rate Limiting

Already implemented:
- Per-user rate limits
- Per-workspace limits
- Postgres-backed (survives restarts)

**Monitor**:
```sql
SELECT * FROM "RateLimitLog"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
ORDER BY "createdAt" DESC;
```

### 2. Encryption Verification

**Test Encryption**:
```sql
-- Credentials should be encrypted
SELECT
  id,
  type,
  "workspaceId",
  LENGTH("encryptedCredentials") as encrypted_length,
  "encryptedCredentials" LIKE '%{%' as looks_encrypted
FROM "IntegrationConfig"
LIMIT 5;
-- encryptedCredentials should be long base64 string, not JSON
```

### 3. Access Control Audit

```sql
-- Verify super admin
SELECT email, "platformRole"
FROM "User"
WHERE "platformRole" = 'SUPERADMIN';
-- Should only show archcloudsystems@gmail.com

-- Check workspace access
SELECT
  u.email,
  w.name as workspace,
  wu.role
FROM "WorkspaceUser" wu
JOIN "User" u ON wu."userId" = u.id
JOIN "Workspace" w ON wu."workspaceId" = w.id
WHERE wu.role = 'OWNER';
```

### 4. Enable Security Headers

Add to `next.config.ts`:
```typescript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};
```

---

## Backup & Recovery

### 1. Database Backups

**Supabase Automatic Backups**:
- Daily backups (retained 7 days on free tier)
- Point-in-time recovery available on paid tiers

**Manual Backup**:
```bash
# Export all data
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20251124.sql
```

### 2. Code Backups

**Git Repository**:
- Push to remote repository
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

### 3. Environment Variables Backup

**Securely Store**:
- Keep encrypted copy of `.env.production`
- Use password manager (1Password, LastPass)
- Document in secure wiki

---

## Troubleshooting

### Issue: Cannot Login

**Symptoms**: 401 or redirect loop

**Solutions**:
1. Check AUTH_SECRET is set
2. Verify Google OAuth credentials
3. Check database connection
4. Clear browser cookies
5. Check Supabase auth settings

### Issue: Integrations Not Working

**Symptoms**: API calls fail, no data returned

**Solutions**:
1. Verify API keys in database
2. Test decryption with logs
3. Check API provider status
4. Verify workspace has integration configured
5. Check rate limits

### Issue: Admin Routes 403

**Symptoms**: Super admin cannot access dash routes

**Solutions**:
1. Verify super admin email in database
2. Check platformRole = 'SUPERADMIN'
3. Verify origin header from dash app
4. Check session cookie is sent
5. Review admin logs for details

### Issue: Build Fails

**Symptoms**: TypeScript errors or build failures

**Solutions**:
1. Run `npx prisma generate`
2. Delete `.next` folder
3. Run `npm install` again
4. Check for type errors with `npx tsc --noEmit`
5. Review build logs in Vercel

---

## Maintenance Tasks

### Daily
- [ ] Check admin logs for security events
- [ ] Monitor error rates in Vercel
- [ ] Review failed login attempts

### Weekly
- [ ] Review user growth metrics
- [ ] Check workspace activity
- [ ] Audit integration health
- [ ] Review rate limit hits

### Monthly
- [ ] Generate platform usage report
- [ ] Clean old admin logs (automated)
- [ ] Review and optimize slow queries
- [ ] Update dependencies

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Review and update documentation
- [ ] Backup verification test

---

## Scaling Considerations

### Database Scaling

**Current**: Supabase free tier
- ~2GB storage
- ~1 million rows
- Suitable for 100-500 users

**Upgrade Triggers**:
- Storage > 1.5GB
- Consistent slow queries
- Connection pool exhausted

**Solutions**:
- Upgrade Supabase plan
- Add read replicas
- Implement database sharding

### Application Scaling

**Current**: Vercel serverless
- Auto-scales with traffic
- No manual intervention needed

**Monitor**:
- Function execution time
- Cold start frequency
- Memory usage

### Rate Limit Scaling

**Current**: Per-workspace limits
- Stored in Postgres
- Scales with database

**Considerations**:
- Consider Redis for high-volume
- Implement distributed rate limiting
- Add caching layer

---

## Support & Contacts

**Platform Owner**: ArchCloud Systems
**Email**: archcloudsystems@gmail.com
**Dashboard**: https://dash.archcloudsystems.com

---

## Changelog

### 2025-11-24 - Initial Deployment
- Platform launched
- Super admin system implemented
- Dash app integration complete
- All features functional

---

**Deployment Complete** ✅
