# Manual QA Checklist for archcloud-aiseo

## Pre-Testing Setup

- [ ] Application is running on VPS
- [ ] Database is accessible and migrations applied
- [ ] All environment variables are set
- [ ] Can access application via domain (HTTPS)

## 1. Authentication & Authorization

### User Registration (Credentials)
- [ ] Navigate to `/auth/signup`
- [ ] Fill form with:
  - Name: "Test User"
  - Email: "test@example.com"
  - Password: "SecurePass123!"
- [ ] Click "Sign Up"
- [ ] Should redirect to onboarding or dashboard
- [ ] User should be created in database: `SELECT * FROM "User" WHERE email = 'test@example.com';`

### User Sign In (Credentials)
- [ ] Navigate to `/auth/signin`
- [ ] Enter registered email and password
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard
- [ ] Session should be created: `SELECT * FROM "Session" WHERE "userId" = '<user-id>';`

### Google OAuth (if configured)
- [ ] Navigate to `/auth/signin`
- [ ] Click "Sign in with Google"
- [ ] Complete Google auth flow
- [ ] Should redirect to dashboard
- [ ] Account should be linked: `SELECT * FROM "Account" WHERE provider = 'google';`

### Sign Out
- [ ] Click user menu in top right
- [ ] Click "Sign Out"
- [ ] Should redirect to home page
- [ ] Should not be able to access protected routes

## 2. Workspace Onboarding

### Complete Onboarding Flow
- [ ] Sign in with new user (or user without workspace)
- [ ] Should see onboarding wizard
- [ ] **Step 1: Welcome**
  - [ ] Read welcome message
  - [ ] Click "Next" or "Skip"
- [ ] **Step 2: Add Domain/Project**
  - [ ] Enter project name: "Test Project"
  - [ ] Enter domain: "example.com"
  - [ ] Click "Create Project"
  - [ ] Project should be created
- [ ] **Step 3: Connect Integrations** (optional)
  - [ ] Can add OpenAI API key
  - [ ] Can add SERP API key
  - [ ] Can add PageSpeed API key
  - [ ] Click "Next" or "Skip"
- [ ] **Step 4: Run First Audit** (info screen)
  - [ ] Read instructions
  - [ ] Click "Complete Onboarding"
- [ ] Should redirect to dashboard
- [ ] Workspace should exist: `SELECT * FROM "Workspace" WHERE "ownerId" = '<user-id>';`

## 3. Client Management

### Create Client
- [ ] Navigate to clients page (if available) or use API
- [ ] POST `/api/clients` with:
  ```json
  {
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "website": "https://acme.com"
  }
  ```
- [ ] Response should be 201 with client object
- [ ] Client should appear in database: `SELECT * FROM "Client" WHERE name = 'Acme Corp';`

### View Clients List
- [ ] GET `/api/clients`
- [ ] Should return array of clients for workspace
- [ ] Should include created client

### Update Client
- [ ] PATCH `/api/clients/<client-id>` with:
  ```json
  {
    "name": "Acme Corporation",
    "phone": "555-0123"
  }
  ```
- [ ] Response should be 200 with updated client
- [ ] Changes should be in database

### Delete Client
- [ ] DELETE `/api/clients/<client-id>`
- [ ] Response should be 200
- [ ] Client should be removed from database

## 4. Project Management

### Create Project
- [ ] Navigate to `/projects`
- [ ] Click "New Project" button
- [ ] Fill form:
  - Name: "My Website SEO"
  - Domain: "mywebsite.com"
  - Client: (optional, select from dropdown)
- [ ] Click "Create Project"
- [ ] Should redirect to project detail or projects list
- [ ] Project should appear in list
- [ ] Verify in database: `SELECT * FROM "Project" WHERE name = 'My Website SEO';`

### View Projects List
- [ ] Navigate to `/projects`
- [ ] Should see all projects for workspace
- [ ] Each project should show: name, domain, keywords count, audits count

### View Project Detail
- [ ] Click on a project from list
- [ ] Should navigate to `/projects/<project-id>`
- [ ] Should show project details
- [ ] Should show associated keywords and audits

### Update Project
- [ ] On project detail page, click "Edit"
- [ ] Change project name or domain
- [ ] Click "Save"
- [ ] Changes should be reflected immediately
- [ ] Verify in database

### Delete Project
- [ ] On project detail page, click "Delete"
- [ ] Confirm deletion
- [ ] Should redirect to projects list
- [ ] Project should be removed from database

## 5. Keyword Research

### Add Single Keyword
- [ ] Navigate to `/keywords`
- [ ] Select "Research" tab
- [ ] Select a project
- [ ] Enter keyword: "best seo tools"
- [ ] Click "Research Keywords"
- [ ] Should show loading state
- [ ] Keyword should appear in "List View" tab with volume, difficulty, CPC
- [ ] Verify in database: `SELECT * FROM "Keyword" WHERE term = 'best seo tools';`

### Batch Import Keywords
- [ ] Navigate to `/keywords`
- [ ] Select "Batch Import" tab
- [ ] Select a project
- [ ] Paste or type multiple keywords:
  ```
  seo audit tool
  keyword research software
  content optimization
  ```
- [ ] Click "Import Keywords"
- [ ] Should show success message with count
- [ ] All keywords should appear in "List View"
- [ ] Verify count in database

### View Keyword Groups
- [ ] Navigate to `/keywords`
- [ ] Select "Groups" tab
- [ ] Should see keywords grouped by Intent, Difficulty, or Volume
- [ ] Should be able to switch grouping method
- [ ] Should be able to expand/collapse groups
- [ ] Should be able to export CSV per group

### Export Keywords
- [ ] In "Groups" tab, click "Export All"
- [ ] CSV file should download
- [ ] Open CSV and verify format and data

## 6. SEO Audits

### Run SEO Audit
- [ ] Navigate to `/audits`
- [ ] Select a project
- [ ] Enter URL: "https://example.com"
- [ ] Click "Run SEO Audit"
- [ ] Should show "Running Audit..." loading state
- [ ] Wait for completion (may take 30-60 seconds)
- [ ] Audit should appear in "Audit History" with scores
- [ ] Verify in database: `SELECT * FROM "SeoAudit" WHERE url = 'https://example.com';`

### View Audit Details
- [ ] Click "View Details" on an audit
- [ ] Should expand to show:
  - Page details (title, meta description, H1 count, word count)
  - AI-powered recommendations
  - Detailed issues list (errors, warnings, info)
- [ ] All sections should render properly

### Export Audit Report
- [ ] With audit details expanded, click "Export Report"
- [ ] JSON file should download
- [ ] Open file and verify it contains all audit data

### View Audit Trends (Dashboard)
- [ ] Run at least 2 audits for the same URL
- [ ] Navigate to `/dashboard`
- [ ] Should see "Audit Score Trends" chart
- [ ] Chart should show trend lines for all score categories
- [ ] Should be able to filter by URL and time range
- [ ] Trend indicator should show up/down/stable

## 7. Content Briefs

### Generate Content Brief (with OpenAI key)
- [ ] Ensure OpenAI API key is configured (workspace BYOK or platform fallback)
- [ ] Navigate to `/content-briefs`
- [ ] Select a project
- [ ] Enter target keyword: "ultimate seo guide 2024"
- [ ] Optionally add notes
- [ ] Click "Generate Content Brief"
- [ ] Should show "Generating Brief..." loading state
- [ ] Wait for completion (10-30 seconds)
- [ ] Brief should appear with:
  - Search intent
  - Target word count
  - Outline sections
  - Key points/questions
- [ ] Verify in database: `SELECT * FROM "ContentBrief" WHERE "targetKeyword" = 'ultimate seo guide 2024';`

### Generate Content Brief (without OpenAI key)
- [ ] Remove OpenAI key from integrations
- [ ] Attempt to generate brief
- [ ] Should show friendly error: "OpenAI API key not configured"
- [ ] Should suggest adding key in Integrations

### View Content Briefs List
- [ ] Navigate to `/content-briefs`
- [ ] Should see "Your Content Briefs" section
- [ ] All generated briefs should be listed
- [ ] Each should show project, keyword, and date

## 8. Documents Module

### Create Document (Manual)
- [ ] Navigate to `/documents`
- [ ] Click "New Document"
- [ ] Fill form:
  - Title: "Q4 Strategy Doc"
  - Type: "STRATEGY"
  - Project: (select from dropdown, optional)
  - Content: "Our SEO strategy for Q4..."
- [ ] Click "Create"
- [ ] Document should appear in list
- [ ] Verify in database: `SELECT * FROM "Document" WHERE title = 'Q4 Strategy Doc';`

### Generate Legal Template (with OpenAI key)
- [ ] Ensure OpenAI API key is configured
- [ ] Navigate to `/documents`
- [ ] Click "New Document"
- [ ] Select "Generate from Template"
- [ ] Choose template: "Privacy Policy"
- [ ] Enter workspace name: "Acme Corp"
- [ ] Optionally enter domain
- [ ] Click "Generate"
- [ ] Should show loading state
- [ ] Wait for completion (10-30 seconds)
- [ ] Generated document should appear with full privacy policy text
- [ ] Document should be saved to database

### Generate Legal Template (without OpenAI key)
- [ ] Remove OpenAI key
- [ ] Attempt to generate template
- [ ] Should show error: "OpenAI API key not configured"
- [ ] Should suggest adding key

### Cloud Integration Stubs
- [ ] Navigate to `/documents`
- [ ] Should see "Google Drive" and "Dropbox" buttons
- [ ] Both should be disabled
- [ ] Hovering should show "coming soon" tooltip

### Edit Document
- [ ] Click "Edit" on a document
- [ ] Modify title or content
- [ ] Click "Save"
- [ ] Changes should be reflected immediately
- [ ] Verify in database

### Delete Document
- [ ] Click "Delete" on a document
- [ ] Confirm deletion
- [ ] Document should be removed from list
- [ ] Verify removed from database

### Filter Documents
- [ ] Use type filter dropdown
- [ ] Select "LEGAL"
- [ ] Should show only legal documents
- [ ] Select "All Types"
- [ ] Should show all documents again

### Project-scoped Documents
- [ ] Create document linked to a specific project
- [ ] Verify it shows project name in list
- [ ] Filter by project (if filter exists)
- [ ] Should show only documents for that project

## 9. Integrations

### Add Integration (BYOK)
- [ ] Navigate to `/integrations`
- [ ] Find "OpenAI" card
- [ ] Click "Configure" or "Connect"
- [ ] Enter API key
- [ ] Click "Save" or "Connect"
- [ ] Should show success message
- [ ] Integration should show as "Connected"
- [ ] Verify in database: `SELECT * FROM "IntegrationConfig" WHERE type = 'OPENAI';`
- [ ] Credentials should be encrypted

### Test Integration
- [ ] After connecting integration, click "Test Connection"
- [ ] Should show loading state
- [ ] Should show success or error message
- [ ] For OpenAI: should verify key is valid

### Update Integration
- [ ] On connected integration, click "Edit" or "Reconfigure"
- [ ] Change API key
- [ ] Save changes
- [ ] Should show success message
- [ ] Verify updated in database (different encrypted value)

### Disconnect Integration
- [ ] On connected integration, click "Disconnect"
- [ ] Confirm action
- [ ] Integration should show as "Disconnected"
- [ ] Verify `isEnabled = false` in database

### Verify BYOK Precedence
- [ ] Add workspace OpenAI key
- [ ] Generate content brief or audit
- [ ] Verify it uses workspace key (check logs if needed)
- [ ] Remove workspace key
- [ ] Generate again
- [ ] Should fall back to platform key (if configured)

## 10. Billing & Subscription

### View Billing Page
- [ ] Navigate to `/billing`
- [ ] Should show current plan
- [ ] Should show available plans (Starter, Pro, Enterprise)
- [ ] Each plan should show features and pricing

### Subscribe to Plan (Test Mode)
- [ ] Click "Upgrade to Starter" (or Pro)
- [ ] Should redirect to Stripe Checkout
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Enter any future expiry and CVC
- [ ] Complete checkout
- [ ] Should redirect back to application
- [ ] Plan should be updated
- [ ] Verify in database: `SELECT * FROM "Subscription";`

### Access Customer Portal
- [ ] On billing page, click "Manage Subscription" or similar
- [ ] Should redirect to Stripe Customer Portal
- [ ] Should be able to view invoices
- [ ] Should be able to update payment method
- [ ] Should be able to cancel subscription

### Webhook Processing
- [ ] After subscription event (subscribe, cancel, etc.)
- [ ] Check PM2 logs: `pm2 logs archcloud-aiseo | grep STRIPE`
- [ ] Verify webhook received and processed
- [ ] Verify subscription updated in database

## 11. Dashboard

### View Dashboard Stats
- [ ] Navigate to `/dashboard`
- [ ] Should see stat cards:
  - Projects count
  - Keywords count
  - Audits count
  - Briefs count
- [ ] Numbers should match database counts

### View Recent Projects
- [ ] Should see "Recent Projects" card
- [ ] Should list last 5 projects
- [ ] Each should show name, domain, keywords count, audits count
- [ ] Clicking should navigate to project detail

### View Audit Trends Chart
- [ ] If 2+ audits exist, should see trend chart
- [ ] Should show multiple score lines
- [ ] Should be filterable by URL and time range
- [ ] Hovering should show tooltips

### Quick Actions
- [ ] Should see "Quick Actions" card with buttons:
  - Research Keywords
  - Run SEO Audit
  - Generate Content Brief
  - Manage Integrations
- [ ] Each button should navigate to correct page

## 12. Help & Documentation

### View Help Page
- [ ] Navigate to `/help`
- [ ] Should see comprehensive help sections:
  - Getting Started
  - Integrations
  - Running Audits
  - Understanding Scores
  - Security & Privacy
  - Common Questions
- [ ] All sections should have content
- [ ] Links should work

## 13. Admin Panel (if applicable)

### Access Admin Panel
- [ ] Sign in as admin user
- [ ] Navigate to `/admin`
- [ ] Should only be accessible to admin role
- [ ] Regular users should get 403 or redirect

### View Admin Stats
- [ ] Should see system-wide metrics
- [ ] User count, workspace count, etc.
- [ ] Usage statistics
- [ ] Health checks

## 14. Error Handling & Edge Cases

### API Error Handling
- [ ] Try creating project without name (invalid data)
- [ ] Should get 400 error with clear message
- [ ] Try accessing another workspace's data
- [ ] Should get 403 or 404 error
- [ ] Try API call without auth
- [ ] Should get 401 error

### Rate Limiting
- [ ] Make multiple rapid API requests (10+ per second)
- [ ] Should eventually get 429 Too Many Requests
- [ ] Error message should be clear

### Missing API Keys
- [ ] Remove all API keys (workspace and platform)
- [ ] Try to generate content brief
- [ ] Should show friendly error, not crash
- [ ] Try to run audit with OpenAI recommendations
- [ ] Should still work for basic analysis, gracefully skip AI part

### Database Connection Issues
- [ ] Temporarily stop PostgreSQL: `sudo systemctl stop postgresql`
- [ ] Try to load any page
- [ ] Should show error page, not crash
- [ ] Restart PostgreSQL: `sudo systemctl start postgresql`
- [ ] Application should recover

## 15. Mobile Responsiveness

### Mobile Navigation
- [ ] Load application on mobile device or responsive mode
- [ ] Navigation should collapse to hamburger menu
- [ ] Menu should be readable and usable
- [ ] Touch targets should be at least 44px

### Mobile Forms
- [ ] All forms should be usable on mobile
- [ ] Input fields should not be tiny
- [ ] Buttons should be tappable
- [ ] Keyboard should not cover inputs

### Mobile Charts
- [ ] Charts should be responsive
- [ ] Should not overflow horizontally
- [ ] Should be zoomable/pannable if needed
- [ ] Tooltips should work on touch

## Post-Testing

### Database Verification
```sql
-- Check all core tables have data
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Workspace";
SELECT COUNT(*) FROM "Project";
SELECT COUNT(*) FROM "Keyword";
SELECT COUNT(*) FROM "SeoAudit";
SELECT COUNT(*) FROM "ContentBrief";
SELECT COUNT(*) FROM "Document";
SELECT COUNT(*) FROM "IntegrationConfig";
SELECT COUNT(*) FROM "Subscription";
```

### Log Review
```bash
# Check for errors in PM2 logs
pm2 logs archcloud-aiseo --lines 1000 | grep -i error

# Check for uncaught exceptions
pm2 logs archcloud-aiseo --lines 1000 | grep -i "uncaught"

# Check Nginx error logs
sudo tail -100 /var/log/nginx/archcloud-aiseo-error.log
```

### Performance Check
```bash
# Check response times
curl -w "@-" -o /dev/null -s https://yourdomain.com << 'EOF'
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF

# Check PM2 resource usage
pm2 show archcloud-aiseo
```

## Sign-Off

- [ ] All critical flows tested and working
- [ ] No errors in logs
- [ ] Database integrity verified
- [ ] Performance acceptable
- [ ] Mobile experience good
- [ ] Error handling graceful
- [ ] Ready for production use

**Tested By:** ________________
**Date:** ________________
**Environment:** ________________
**Notes:**
