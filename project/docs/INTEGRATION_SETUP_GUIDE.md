# Integration Setup Guide

**For:** ArchCloud AISEO Platform
**Last Updated:** November 26, 2025

---

## Overview

ArchCloud AISEO supports **BYOK (Bring Your Own Key)** and **Shared Platform Keys**. This guide explains how to configure integrations for maximum flexibility.

### Key Concepts

**Platform-Level Keys** (Owner Only):
- Configured by archcloudsystems@gmail.com
- Used as fallback when workspace doesn't have BYOK keys
- Stored in environment variables
- Never visible to regular users

**Workspace-Level Keys** (BYOK):
- Each workspace can provide their own API keys
- Override platform keys when present
- Encrypted at rest in database
- Workspace owners can manage their own keys

---

## 🔑 Supported Integrations

### 1. OpenAI (GPT-4, GPT-3.5)

**Purpose:** AI-powered content brief generation, recommendations

**What You Need:**
- OpenAI API key from https://platform.openai.com/api-keys

**Platform-Level Setup (Owner):**
```env
# .env or production environment
OPENAI_API_KEY=sk-proj-...
```

**Workspace-Level Setup (BYOK):**
1. Go to `/integrations`
2. Find "OpenAI" card
3. Click "Configure"
4. Enter your OpenAI API key
5. Click "Test Connection"
6. Save

**API Endpoint:**
- `POST /api/integrations/config` with:
```json
{
  "type": "OPENAI",
  "credentials": {
    "apiKey": "sk-proj-..."
  }
}
```

**Usage in Platform:**
- Content brief generation (`/content-briefs`)
- AI recommendations in audits
- Document generation

**Cost Optimization:**
- Platform uses GPT-4 for deep analysis
- GPT-3.5-turbo for quick tasks
- Configurable via user plan settings

---

### 2. SERP API

**Purpose:** Keyword research with search volume, difficulty, CPC data

**What You Need:**
- SERP API key from https://serpapi.com/

**Platform-Level Setup (Owner):**
```env
SERPAPI_API_KEY=your_serpapi_key_here
```

**Workspace-Level Setup (BYOK):**
1. Go to `/integrations`
2. Find "SERP API" card
3. Click "Configure"
4. Enter your SERP API key
5. Click "Test Connection"
6. Save

**API Endpoint:**
- `POST /api/integrations/config` with:
```json
{
  "type": "SERP_API",
  "credentials": {
    "apiKey": "your_serpapi_key"
  }
}
```

**Usage in Platform:**
- Keyword research (`/keywords`)
- Search volume data
- Keyword difficulty calculation
- CPC estimates
- Search intent detection

**Free Tier:**
- 100 searches/month free
- Good for testing
- Upgrade for production use

---

### 3. Google PageSpeed Insights

**Purpose:** Website performance and Core Web Vitals analysis

**What You Need:**
- Google Cloud API key with PageSpeed Insights API enabled
- Get it at: https://developers.google.com/speed/docs/insights/v5/get-started

**Platform-Level Setup (Owner):**
```env
PAGESPEED_API_KEY=AIzaSy...
```

**Workspace-Level Setup (BYOK):**
1. Go to `/integrations`
2. Find "PageSpeed Insights" card
3. Click "Configure"
4. Enter your Google API key
5. Save

**API Endpoint:**
- `POST /api/integrations/config` with:
```json
{
  "type": "PAGESPEED",
  "credentials": {
    "apiKey": "AIzaSy..."
  }
}
```

**Usage in Platform:**
- SEO audits (`/audits`)
- Performance scoring
- Core Web Vitals (LCP, FID, CLS)
- Mobile vs Desktop comparison

**Free Tier:**
- 25,000 requests per day
- More than enough for most users

---

### 4. Anthropic Claude

**Purpose:** Alternative AI for content generation (optional)

**What You Need:**
- Anthropic API key from https://console.anthropic.com/

**Platform-Level Setup (Owner):**
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Workspace-Level Setup (BYOK):**
1. Go to `/integrations`
2. Find "Anthropic Claude" card
3. Click "Configure"
4. Enter your Anthropic API key
5. Save

**Usage in Platform:**
- Alternative to OpenAI for content briefs
- Long-form content generation
- Used when OpenAI is unavailable

---

### 5. WordPress

**Purpose:** Connect WordPress sites for content publishing and SEO analysis

**What You Need:**
- WordPress site URL
- Application Password or JWT token

**How to Get WordPress Credentials:**

**Method 1: Application Password (Recommended)**
1. Log in to your WordPress admin
2. Go to Users → Your Profile
3. Scroll to "Application Passwords"
4. Enter name: "ArchCloud AISEO"
5. Click "Add New Application Password"
6. Copy the generated password

**Method 2: JWT Token**
1. Install JWT Authentication plugin
2. Configure plugin settings
3. Get token via `/wp-json/jwt-auth/v1/token`

**Workspace Setup:**
1. Go to `/integrations`
2. Find "WordPress" card
3. Click "Connect Site"
4. Enter:
   - Site name
   - Site URL (https://yoursite.com)
   - Application password or token
   - (Optional) Select project
5. Click "Test Connection"
6. Save

**API Endpoint:**
```bash
POST /api/integrations/wordpress/connect
Content-Type: application/json

{
  "name": "My Blog",
  "url": "https://myblog.com",
  "apiToken": "xxxx xxxx xxxx xxxx xxxx xxxx",
  "projectId": "proj_123" // optional
}
```

**What You Can Do:**
- Fetch all pages/posts from WordPress
- Analyze on-page SEO for each page
- Track content performance
- Publish content directly from AISEO
- Run audits on connected pages

**Verification:**
```bash
# Test connection
POST /api/integrations/wordpress/{siteId}/test

# Get pages
GET /api/integrations/wordpress/{siteId}/pages
```

---

### 6. Wix

**Purpose:** Connect Wix sites for SEO analysis

**What You Need:**
- Wix site URL
- Wix API key from Wix Developers console

**How to Get Wix Credentials:**
1. Go to https://www.wix.com/my-account/site-selector
2. Select your site
3. Go to Settings → Developer Tools
4. Create new API key
5. Copy API key and Site ID

**Workspace Setup:**
1. Go to `/integrations`
2. Find "Wix" card
3. Click "Connect Site"
4. Enter:
   - Site name
   - Site URL
   - Wix API key
   - Site ID
   - (Optional) Select project
5. Click "Test Connection"
6. Save

**API Endpoint:**
```bash
POST /api/integrations/wix/connect
Content-Type: application/json

{
  "name": "My Wix Site",
  "url": "https://mysite.wixsite.com/mysite",
  "apiToken": "your_wix_api_key",
  "siteId": "abc123",
  "projectId": "proj_123" // optional
}
```

**What You Can Do:**
- Fetch Wix pages
- Run SEO audits on Wix content
- Track performance metrics
- Get optimization recommendations

---

## 🔐 Security & Encryption

### How Credentials Are Stored

**Platform Keys:**
- Stored in environment variables
- Never in database
- Accessible only via server-side code
- Not exposed to client

**Workspace Keys (BYOK):**
- Encrypted at rest using AES-256-GCM
- Stored in `IntegrationConfig` table
- Encryption key in `ENCRYPTION_KEY` env var
- Decrypted only when needed server-side

**Encryption Flow:**
```
User enters API key → Encrypted with AES-256-GCM → Stored in database
                                                    ↓
API call needs key ← Decrypted server-side ← Fetched from database
```

### Best Practices

**For Platform Owners:**
- Rotate `ENCRYPTION_KEY` annually
- Use strong random encryption keys
- Never commit keys to git
- Use environment variable management (Vercel, Railway, etc.)

**For Workspace Owners:**
- Use read-only API keys when possible
- Restrict key permissions to minimum needed
- Rotate keys regularly
- Monitor API usage in provider dashboard

---

## 🔄 Fallback Logic

**How Key Resolution Works:**

```typescript
// When a feature needs an API key:
1. Check if workspace has BYOK key configured
   ├─ If yes → Use workspace key
   └─ If no → Check platform key
      ├─ If yes → Use platform key
      └─ If no → Return error or graceful degradation
```

**Example: Keyword Research**

1. User clicks "Research Keywords"
2. System checks workspace integration config for SERP_API
3. If found and enabled → Use workspace SERP API key
4. If not found → Check `SERPAPI_API_KEY` env var
5. If found → Use platform key
6. If not found → Show error: "SERP API not configured"

**Code Example:**

```typescript
// lib/integration-helper.ts
export async function getOrFallbackSERPAPIKey(
  workspaceId: string
): Promise<string | null> {
  // Try workspace key first
  const creds = await getWorkspaceIntegrationCredentials<SERPAPICredentials>(
    workspaceId,
    IntegrationType.SERP_API
  );

  if (creds?.apiKey) {
    return creds.apiKey;
  }

  // Fallback to platform key
  return process.env.SERPAPI_API_KEY || null;
}
```

---

## 📊 Integration Status

### Checking Integration Health

**In UI:**
- Go to `/integrations`
- Each card shows status:
  - ✅ **Connected** - Key configured and working
  - ⚠️ **Misconfigured** - Key exists but test failed
  - ⬜ **Not Configured** - No key set

**Via API:**
```bash
# Get all integrations for workspace
GET /api/integrations/config

# Test specific integration
POST /api/integrations/config/{id}/test
```

**For Dash Admin:**
```bash
# View all integrations across platform
GET /api/admin/dash/integrations

# Filter by workspace
GET /api/admin/dash/integrations?workspaceId=ws_123

# Filter by type
GET /api/admin/dash/integrations?type=OPENAI
```

---

## 🚨 Troubleshooting

### OpenAI Issues

**Error: "OpenAI API key not configured"**
- **Solution:** Add `OPENAI_API_KEY` to env vars OR configure BYOK in `/integrations`

**Error: "Invalid API key"**
- **Solution:** Key format should be `sk-proj-...` or `sk-...`
- Check key hasn't expired
- Verify key has proper permissions

**Error: "Rate limit exceeded"**
- **Solution:** Upgrade OpenAI plan or reduce request frequency

### SERP API Issues

**Error: "SERP API not configured"**
- **Solution:** Add `SERPAPI_API_KEY` OR configure BYOK

**Error: "Search failed"**
- **Solution:** Check API quota at https://serpapi.com/dashboard
- Verify search parameters are valid

**Keywords show "N/A" for metrics**
- **Cause:** API key not configured or quota exceeded
- **Solution:** Configure SERP API integration

### WordPress Issues

**Error: "Failed to connect to WordPress"**
- **Solution:**
  - Verify site URL is correct (https://yoursite.com)
  - Check Application Password is correct
  - Ensure WordPress REST API is enabled
  - Verify no firewall blocking API requests

**Error: "Authentication failed"**
- **Solution:**
  - Regenerate Application Password
  - Try JWT token instead
  - Check user has proper permissions

### Wix Issues

**Error: "Invalid Wix API key"**
- **Solution:**
  - Verify API key from Wix Developer console
  - Check Site ID matches your site
  - Ensure API permissions are granted

---

## 📈 Usage Monitoring

### For Workspace Owners

**Check Your Usage:**
1. Go to `/integrations`
2. Each integration card shows:
   - Last used timestamp
   - Success/failure status
   - Recent activity

**Monitor Costs:**
- OpenAI: Check usage at https://platform.openai.com/usage
- SERP API: Check quota at https://serpapi.com/dashboard
- Google APIs: Check at https://console.cloud.google.com/

### For Platform Owners (Dash)

**View Platform-Wide Usage:**
```bash
GET /api/admin/dash/integrations
```

**Monitor Connected Sites:**
```bash
GET /api/admin/dash/connected-sites
```

**Response:**
```json
{
  "integrations": [
    {
      "type": "OPENAI",
      "workspaceId": "ws_123",
      "workspace": { "name": "Acme Corp" },
      "isEnabled": true,
      "lastTestedAt": "2025-11-26T10:30:00Z",
      "lastTestStatus": "success"
    }
  ]
}
```

---

## 🔧 Advanced Configuration

### Custom Model Selection

**For OpenAI:**

Edit workspace integration to specify model:

```json
{
  "type": "OPENAI",
  "credentials": {
    "apiKey": "sk-proj-...",
    "model": "gpt-4-turbo-preview", // optional
    "maxTokens": 2000 // optional
  }
}
```

**Supported Models:**
- `gpt-4-turbo-preview` (best quality, slower)
- `gpt-4` (balanced)
- `gpt-3.5-turbo` (fastest, cheapest)

### Rate Limiting

**Per-Workspace Rate Limits:**

Configured in `lib/limits.ts`:

```typescript
const limits = {
  FREE: {
    keywordResearchPerMonth: 100,
    contentBriefsPerMonth: 10,
  },
  PRO: {
    keywordResearchPerMonth: 1000,
    contentBriefsPerMonth: 100,
  },
  ENTERPRISE: {
    keywordResearchPerMonth: 10000,
    contentBriefsPerMonth: 1000,
  },
};
```

---

## 🎯 Quick Start Checklists

### For Platform Owners

**Initial Platform Setup:**
- [ ] Set `ENCRYPTION_KEY` in production env
- [ ] Set `OPENAI_API_KEY` for shared AI features
- [ ] Set `SERPAPI_API_KEY` for shared keyword research
- [ ] (Optional) Set `PAGESPEED_API_KEY` for audits
- [ ] Verify all keys work with test requests
- [ ] Document which features require which keys

### For Workspace Owners (BYOK)

**Setting Up Your Workspace:**
- [ ] Sign in to ArchCloud AISEO
- [ ] Go to `/integrations`
- [ ] Configure OpenAI (for content briefs)
- [ ] Configure SERP API (for keyword research)
- [ ] Test each integration
- [ ] Create your first project
- [ ] Run keyword research to verify SERP API
- [ ] Generate content brief to verify OpenAI
- [ ] Connect WordPress/Wix site (if applicable)

---

## 📚 API Reference

### Create/Update Integration Config

```bash
POST /api/integrations/config
Content-Type: application/json
Authorization: Bearer {session_token}

{
  "type": "OPENAI" | "SERP_API" | "PAGESPEED" | "ANTHROPIC",
  "credentials": {
    "apiKey": "your_key_here"
  },
  "displayName": "My OpenAI Account", // optional
  "isEnabled": true // optional, defaults to true
}
```

**Response:**
```json
{
  "config": {
    "id": "conf_123",
    "type": "OPENAI",
    "displayName": "My OpenAI Account",
    "isEnabled": true,
    "status": "ACTIVE",
    "createdAt": "2025-11-26T10:00:00Z"
  }
}
```

### Test Integration

```bash
POST /api/integrations/config/{id}/test

Response:
{
  "success": true,
  "message": "Connection successful",
  "testedAt": "2025-11-26T10:30:00Z"
}
```

### Get All Integrations

```bash
GET /api/integrations/config

Response:
{
  "integrations": [
    {
      "id": "conf_123",
      "type": "OPENAI",
      "displayName": "My OpenAI Account",
      "isEnabled": true,
      "lastTestedAt": "2025-11-26T10:30:00Z"
    }
  ]
}
```

---

## 🆘 Support

**For Integration Issues:**
- Email: archcloudsystems@gmail.com
- Check `/admin` dashboard for system-wide status
- Review audit logs in Dash app

**Provider Support:**
- OpenAI: https://help.openai.com/
- SERP API: https://serpapi.com/support
- Google Cloud: https://support.google.com/
- Anthropic: https://support.anthropic.com/

---

**Last Updated:** November 26, 2025
**Version:** 1.0
**Platform:** ArchCloud AISEO
