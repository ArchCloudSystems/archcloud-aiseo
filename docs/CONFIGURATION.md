# Configuration Guide

This document provides a comprehensive list of all environment variables and configuration options for the ArchCloud AI SEO platform.

## Environment Variables

All environment variables should be set in your `.env` file (development) or in your hosting platform's environment configuration (production).

### Required Variables

These variables are required for the application to function properly:

#### Database Configuration

```bash
# Supabase Public URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database URL for Prisma (Transaction Mode - with connection pooling)
DATABASE_URL="postgresql://postgres.your-project:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct database connection for migrations
DIRECT_URL="postgresql://postgres.your-project:[PASSWORD]@aws-0-us-east-1.compute.amazonaws.com:5432/postgres"
```

**How to get these:**
1. Go to your Supabase Dashboard
2. Navigate to Project Settings > API
3. Copy the `URL` and `anon/public` key
4. Navigate to Project Settings > Database
5. Copy both connection strings (Transaction and Direct)

#### Authentication (NextAuth v5)

```bash
# Secret key for encrypting session tokens
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key-minimum-32-characters-long"

# Google OAuth credentials (optional)
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Optional Variables

These variables enable additional features but are not required for core functionality:

#### AI Features (OpenAI)

```bash
# OpenAI API key for content brief generation and AI chat
OPENAI_API_KEY="sk-..."
```

**Features enabled:**
- AI-generated content briefs
- Legal document templates
- Chat assistant
- SEO recommendations

**How to get:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new secret key

**Cost:** Pay-per-use, typically $0.01-0.10 per content brief

#### Keyword Research (SERP API)

```bash
# SERP API key for keyword research
SERPAPI_API_KEY="your-serpapi-key"
```

**Features enabled:**
- Real-time keyword search volume
- Keyword difficulty scores
- CPC data
- SERP feature detection

**How to get:**
1. Go to [SerpApi](https://serpapi.com/)
2. Create an account
3. Copy your API key from the dashboard

**Cost:** Free tier available, paid plans from $50/month

#### Billing (Stripe)

```bash
# Stripe secret key
STRIPE_SECRET_KEY="sk_test_..." or "sk_live_..."

# Stripe webhook signing secret
STRIPE_WEBHOOK_SECRET="whsec_..."

# Price IDs for subscription plans
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_AGENCY="price_..."
```

**Features enabled:**
- Subscription management
- Payment processing
- Plan upgrades/downgrades
- Billing portal

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from Developers > API keys
3. Create products and prices in Products section
4. Set up webhook endpoint at `/api/stripe/webhook`
5. Copy webhook signing secret

**Webhook URL:** `https://yourdomain.com/api/stripe/webhook`

#### Google Analytics 4

```bash
# GA4 Measurement ID
GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
```

**Features enabled:**
- Integration with GA4
- Import traffic data
- View analytics in dashboard

**How to get:**
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a GA4 property
3. Copy the Measurement ID (starts with G-)

#### Google Search Console

```bash
# GSC property URL
GSC_PROPERTY_URL="https://www.yourdomain.com"
```

**Features enabled:**
- Search Console integration
- Import search performance data
- View click and impression data

#### Social Media Links

```bash
# Social media URLs (all optional)
NEXT_PUBLIC_SOCIAL_TWITTER_URL="https://twitter.com/yourcompany"
NEXT_PUBLIC_SOCIAL_LINKEDIN_URL="https://linkedin.com/company/yourcompany"
NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL="https://instagram.com/yourcompany"
NEXT_PUBLIC_SOCIAL_FACEBOOK_URL="https://facebook.com/yourcompany"
NEXT_PUBLIC_SOCIAL_YOUTUBE_URL="https://youtube.com/c/yourcompany"
```

**Features enabled:**
- Social media icons in footer
- Share buttons include your profiles
- Brand consistency

**Note:** Only icons for configured platforms will be displayed

#### Admin & System

```bash
# Cron secret for scheduled jobs
CRON_SECRET="your-cron-secret-change-this"

# Service account API key for ArchCloud Dash integration
INTERNAL_SERVICE_API_KEY="your-service-api-key-change-this"

# Application base URL
NEXT_PUBLIC_APP_BASE_URL="http://localhost:3000" or "https://yourdomain.com"
```

**Cron Jobs:**
- Daily usage aggregation: POST `/api/cron/aggregate-usage`
- Header: `Authorization: Bearer <CRON_SECRET>`

**Admin APIs:**
- Require `x-service-api-key` header
- Used by ArchCloud Dash for monitoring
- Endpoints:
  - `/api/admin/health`
  - `/api/admin/telemetry`
  - `/api/admin/usage`
  - `/api/admin/workspaces`

## Feature Flags

Currently managed via environment variables:

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_CHAT="true"
NEXT_PUBLIC_ENABLE_SOCIAL_SHARE="true"
```

## Configuration Files

### Next.js Configuration

**File:** `next.config.ts`

```typescript
const config = {
  // Your Next.js configuration
  images: {
    domains: ['your-cdn-domain.com'],
  },
};
```

### Prisma Configuration

**File:** `prisma/schema.prisma`

- Database schema definitions
- Model relationships
- Indexes and constraints

**Run migrations:**
```bash
npx prisma migrate dev
npx prisma generate
```

### Tailwind Configuration

**File:** `tailwind.config.js`

- Design system colors
- Typography scales
- Spacing units
- Custom utilities

### Site Configuration

**File:** `lib/site.ts`

```typescript
export const siteConfig = {
  name: "ArchCloud SEO",
  tagline: "AI-Powered SEO Platform",
  description: "...",
  companyName: "ArchCloudSystems LLC",
  // ... more config
};
```

**Customizable:**
- Site name and branding
- Navigation structure
- Footer links
- Social media profiles (fallback if env vars not set)
- Contact information

## Deployment Configuration

### Vercel

Create `vercel.json`:

```json
{
  "env": {
    "DATABASE_URL": "@database_url",
    "AUTH_SECRET": "@auth_secret",
    "OPENAI_API_KEY": "@openai_api_key"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co"
    }
  }
}
```

Add environment variables in Vercel Dashboard > Settings > Environment Variables

### Docker

Create `.env.production`:

```bash
# Copy from .env and update values
cp .env .env.production
```

**Docker Compose:**

```yaml
version: '3.8'
services:
  app:
    build: .
    env_file:
      - .env.production
    ports:
      - "3000:3000"
```

## Security Best Practices

### Secrets Management

**DO:**
- ✅ Use strong, unique secrets for AUTH_SECRET
- ✅ Rotate API keys regularly
- ✅ Use separate keys for dev/staging/production
- ✅ Store secrets in secure vault (1Password, AWS Secrets Manager)
- ✅ Use environment-specific Stripe keys (test vs live)

**DON'T:**
- ❌ Commit `.env` files to git (.gitignore includes it)
- ❌ Share API keys in code or documentation
- ❌ Use the same secrets across environments
- ❌ Expose `NEXT_PUBLIC_*` variables with sensitive data

### Environment-Specific Configuration

**Development:**
```bash
AUTH_SECRET="dev-secret-for-testing-only"
STRIPE_SECRET_KEY="sk_test_..."
DATABASE_URL="postgresql://localhost:5432/aiseo_dev"
```

**Staging:**
```bash
AUTH_SECRET="staging-secret-unique-value"
STRIPE_SECRET_KEY="sk_test_..."
DATABASE_URL="postgresql://staging-db-url"
```

**Production:**
```bash
AUTH_SECRET="production-secret-highly-secure"
STRIPE_SECRET_KEY="sk_live_..."
DATABASE_URL="postgresql://production-db-url"
```

## Configuration Validation

The application validates configuration on startup:

**Required checks:**
- Database connection
- Auth configuration
- Minimum required variables

**Optional checks:**
- OpenAI API key (warns if missing)
- SERP API key (warns if missing)
- Stripe keys (required for billing features)

**View validation:**
```bash
npm run build
# Warnings will appear for missing optional configs
```

## Troubleshooting

### Common Issues

**1. "OPENAI_API_KEY is not set" warning**
- This is informational only
- Content brief generation will not work without it
- All other features work normally

**2. Database connection errors**
- Verify DATABASE_URL is correct
- Check Supabase dashboard for connection issues
- Ensure IP is whitelisted (if using IP restrictions)

**3. Authentication failures**
- Verify AUTH_SECRET is set and at least 32 characters
- Check Google OAuth credentials and redirect URIs
- Ensure session cookies are enabled

**4. Stripe webhook errors**
- Verify STRIPE_WEBHOOK_SECRET matches webhook endpoint
- Check webhook URL is publicly accessible
- Verify webhook is listening to correct events

## Environment Templates

### Minimal (Core Features Only)

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

# Auth
AUTH_SECRET=
```

### Full (All Features)

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# APIs
OPENAI_API_KEY=
SERPAPI_API_KEY=

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_AGENCY=

# Analytics
GA4_MEASUREMENT_ID=
GSC_PROPERTY_URL=

# Social
NEXT_PUBLIC_SOCIAL_TWITTER_URL=
NEXT_PUBLIC_SOCIAL_LINKEDIN_URL=
NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL=
NEXT_PUBLIC_SOCIAL_FACEBOOK_URL=
NEXT_PUBLIC_SOCIAL_YOUTUBE_URL=

# System
CRON_SECRET=
INTERNAL_SERVICE_API_KEY=
NEXT_PUBLIC_APP_BASE_URL=
```

## Support

For configuration assistance:
- Check [DEV_GUIDE.md](./DEV_GUIDE.md) for development setup
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
- Contact support at support@archcloudsystems.com

---

Last updated: 2024
