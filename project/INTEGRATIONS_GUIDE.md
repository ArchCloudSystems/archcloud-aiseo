# Integration Guide - BYOK (Bring Your Own Keys)

## Overview
ArchCloud SEO uses a **zero-trust BYOK model** where each workspace provides and manages their own API credentials. All credentials are encrypted at rest using AES-256-GCM encryption and never shared between workspaces.

## Supported Integrations

### 1. SERP API (Keyword Research)
**Purpose**: Real-time keyword metrics including search volume, difficulty, CPC, and intent.

**Required Credentials**:
- API Key

**Where to Get**: https://serpapi.com/manage-api-key

**Used By**:
- Keyword Research (`/keywords`)
- Automatically fetches metrics when adding keywords

**Testing vs Production**:
- Workspace API key (if configured): Used in production
- System fallback key: Used only if workspace key not set
- No key: Features return null metrics but won't fail

---

### 2. PageSpeed Insights (Performance Audits)
**Purpose**: Google PageSpeed performance, SEO, accessibility, and best practices scores.

**Required Credentials**:
- API Key

**Where to Get**: https://developers.google.com/speed/docs/insights/v5/get-started

**Used By**:
- SEO Audits (`/audits`)
- Provides detailed performance metrics

**Testing vs Production**:
- Workspace API key (if configured): Full PageSpeed data
- System fallback key: Full PageSpeed data
- No key: Basic audit with estimated scores (75-85 range)

---

### 3. OpenAI (AI Content Generation)
**Purpose**: AI-powered content briefs and SEO recommendations.

**Required Credentials**:
- API Key (sk-...)

**Where to Get**: https://platform.openai.com/api-keys

**Used By**:
- Content Briefs (`/content-briefs`)
- Enhanced audit recommendations
- AI chat assistant

**Testing vs Production**:
- Workspace API key: Full AI features
- System fallback key: Full AI features
- No key: Features will fail gracefully with error messages

---

### 4. Google Analytics 4 (GA4)
**Purpose**: Website traffic analysis and user behavior tracking.

**Required Credentials**:
- Property ID
- Service Account JSON

**Where to Get**:
1. Google Cloud Console
2. Create service account
3. Enable Analytics API
4. Grant service account access to GA4 property

**Used By**:
- Analytics dashboard (future feature)
- Traffic insights

**Testing**: Not yet implemented, credentials stored for future use

---

### 5. Google Search Console (GSC)
**Purpose**: Search performance monitoring and indexing issues.

**Required Credentials**:
- Site URL
- Service Account JSON

**Where to Get**:
1. Google Cloud Console
2. Create service account
3. Enable Search Console API
4. Add service account as user in Search Console

**Used By**:
- Search performance reports (future feature)
- Indexing status

**Testing**: Not yet implemented, credentials stored for future use

---

### 6. Stripe
**Purpose**: Payment processing for subscriptions.

**Required Credentials**:
- Secret Key (sk_...)
- Webhook Secret (whsec_...)

**Where to Get**: https://dashboard.stripe.com/apikeys

**Used By**:
- Billing and subscription management
- Webhook handling

**Testing**: Not yet implemented, credentials stored for future use

---

## How It Works

### 1. Adding an Integration

1. Navigate to `/integrations`
2. Click "Configure" on any integration
3. Enter your API credentials
4. Click "Save" - credentials are immediately encrypted
5. Click "Test Connection" to verify

### 2. Credential Storage

```
User Input → AES-256-GCM Encryption → Database Storage
                    ↓
          (with unique salt + IV per credential)
                    ↓
          Only decrypted when actively needed
```

**Security Features**:
- AES-256-GCM encryption algorithm
- PBKDF2 key derivation (100,000 iterations)
- Unique salt and IV per credential
- Authentication tags to prevent tampering
- Encrypted at rest in database
- Never logged or cached in plaintext

### 3. Using Integrations

When a feature needs an API (e.g., keyword research):

```typescript
// Get workspace-specific or fallback to system key
const apiKey = await getOrFallbackSERPAPIKey(workspaceId);

if (apiKey) {
  // Use workspace's own key or system key
  await fetchKeywordMetrics(keywords, apiKey);
} else {
  // Graceful degradation - return null data or basic estimates
  return basicResults;
}
```

### 4. Testing Integrations

Each integration has a test endpoint:
- Tests real API connectivity
- Validates credentials
- Stores test status and errors
- Visible in UI with status badges

**Test Flow**:
1. User clicks "Test Connection"
2. API call: `POST /api/integrations/config/[id]/test`
3. Credentials decrypted (in-memory only)
4. Test API call made
5. Result stored: `lastTestedAt`, `lastTestStatus`, `lastTestError`
6. UI updated with badge

---

## Testing vs Production

### System-Level Keys (Optional)
Set in `.env` for testing/fallback:
```bash
SERPAPI_API_KEY="your-key"
PAGESPEED_API_KEY="your-key"
OPENAI_API_KEY="your-key"
```

**When Used**:
- During development/testing
- As fallback when workspace key not configured
- For demo purposes

**NOT Used**:
- When workspace has own key configured
- For any production workspace with BYOK

### Workspace Keys (Production)
- Required for production use
- Configured via UI at `/integrations`
- Encrypted at rest
- Isolated per workspace
- No sharing between tenants

---

## API Key Management

### Adding a Key
```typescript
POST /api/integrations/config
{
  "type": "SERP_API",
  "credentials": {
    "apiKey": "your-serp-api-key"
  }
}
```

### Updating a Key
```typescript
PUT /api/integrations/config/[id]
{
  "credentials": {
    "apiKey": "new-serp-api-key"
  }
}
```

### Testing a Key
```typescript
POST /api/integrations/config/[id]/test
// Returns: { success: boolean, message: string }
```

### Deleting a Key
```typescript
DELETE /api/integrations/config/[id]
// Permanently removes encrypted credentials
```

---

## Error Handling

### Graceful Degradation
All features handle missing/invalid keys gracefully:

**Keywords without SERP API**:
```json
{
  "term": "example keyword",
  "searchVolume": null,
  "difficulty": null,
  "cpc": null,
  "intent": null
}
```

**Audits without PageSpeed**:
```json
{
  "performanceScore": 75,
  "seoScore": 80,
  "issues": ["PageSpeed API not configured - using estimated scores"]
}
```

**Content Briefs without OpenAI**:
```json
{
  "error": "OpenAI API not configured. Please add your OpenAI API key in Integrations."
}
```

---

## Best Practices

### 1. Security
- ✅ Use workspace keys for production
- ✅ Rotate keys regularly
- ✅ Test immediately after adding
- ✅ Monitor test status badges
- ❌ Never share keys between workspaces
- ❌ Don't use system keys for production

### 2. Cost Management
- Each workspace pays for their own API usage
- No shared limits across workspaces
- Monitor usage in each API provider's dashboard

### 3. Setup Order
1. **Start with**: SERP API + PageSpeed (free/cheap tiers available)
2. **Add next**: OpenAI (for AI features)
3. **Later**: GA4 + GSC (for analytics)
4. **Last**: Stripe (for payments)

---

## Troubleshooting

### "Integration config not found"
- Add the integration via UI first
- Check workspace has permission to add integrations

### "SERP API not configured"
- Add SERP API key at `/integrations`
- Test the connection
- Ensure key is valid and has credits

### "Connection test failed"
- Verify API key is correct (no spaces/line breaks)
- Check API key permissions
- Confirm API provider account is active
- Review test error message for details

### "PageSpeed API quota exceeded"
- Free tier: 25,000 requests/day
- Add billing to increase quota
- Or use system fallback with basic estimates

---

## Future Enhancements

### Planned Features
- [ ] GA4 analytics dashboard
- [ ] GSC performance reports
- [ ] Stripe subscription enforcement
- [ ] Integration usage tracking
- [ ] Webhook handlers for real-time data
- [ ] Multi-region API support
- [ ] Custom API timeout settings

### Coming Soon
- [ ] Bulk API key testing
- [ ] Integration health monitoring
- [ ] Cost estimation per workspace
- [ ] API usage analytics

---

## Support

For integration issues:
1. Check test status in UI
2. Review error messages
3. Verify API provider dashboard
4. Consult provider documentation
5. Contact platform admin if needed

**Key URLs**:
- SERP API Docs: https://serpapi.com/search-api
- PageSpeed Docs: https://developers.google.com/speed/docs/insights/v5/about
- OpenAI Docs: https://platform.openai.com/docs
- GA4 API: https://developers.google.com/analytics/devguides/reporting/data/v1
- GSC API: https://developers.google.com/webmaster-tools
