# ArchCloud SEO - Admin Documentation

**CONFIDENTIAL - SUPER ADMIN ONLY**
**Email**: archcloudsystems@gmail.com

---

## Overview

This document contains sensitive information for platform administration. Only the super admin account (archcloudsystems@gmail.com) has access to these features and data.

### Platform Architecture

- **Public App**: `aiseo.archcloudsystems.com` - Multi-tenant SaaS application
- **Admin Dashboard**: `dash.archcloudsystems.com` - Centralized admin control panel
- **Super Admin**: archcloudsystems@gmail.com - Full platform access

---

## Super Admin Access

### Initial Setup

1. **Create Super Admin Account**:
```sql
-- Run this SQL in Supabase to create the super admin
INSERT INTO "User" (email, "platformRole", name, "hasCompletedOnboarding")
VALUES ('archcloudsystems@gmail.com', 'SUPERADMIN', 'ArchCloud Systems', true)
ON CONFLICT (email) DO UPDATE
SET "platformRole" = 'SUPERADMIN';
```

2. **Verify Super Admin Status**:
```sql
SELECT id, email, "platformRole"
FROM "User"
WHERE email = 'archcloudsystems@gmail.com';
```

### Access Control

**Super Admin Capabilities**:
- View all workspaces and users
- Access all admin logs
- View all integration configurations (encrypted credentials)
- Monitor platform usage and health
- Access dash app API endpoints
- View audit trails

**Security**:
- Hardcoded email check: `archcloudsystems@gmail.com`
- Platform role must be: `SUPERADMIN`
- All admin actions are logged
- Logs include IP address and user agent

---

## Admin API Routes

All routes under `/api/admin/dash/*` are protected and require:
1. Authenticated super admin session
2. Valid origin from dash app

### Available Endpoints

#### 1. Admin Logs
```
GET /api/admin/dash/logs
```

**Query Parameters**:
- `limit` (optional): Number of logs to return (1-1000, default: 100)
- `offset` (optional): Pagination offset (default: 0)
- `level` (optional): Filter by log level (INFO|WARN|ERROR|SECURITY)
- `userId` (optional): Filter by user ID
- `workspaceId` (optional): Filter by workspace ID
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)

**Response**:
```json
{
  "logs": [
    {
      "id": "log_123",
      "level": "SECURITY",
      "action": "UNAUTHORIZED_ACCESS_ATTEMPT",
      "userId": "user_456",
      "workspaceId": "ws_789",
      "metadata": "{\"route\": \"/api/admin/...\"}",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-11-24T12:00:00Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

#### 2. Users List
```
GET /api/admin/dash/users
```

**Query Parameters**:
- `email` (optional): Filter by email (contains, case-insensitive)
- `workspaceId` (optional): Filter by workspace membership
- `limit` (optional): Number of users (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "platformRole": "USER",
      "hasCompletedOnboarding": true,
      "createdAt": "2025-11-20T10:00:00Z",
      "workspaceUsers": [
        {
          "role": "OWNER",
          "workspace": {
            "id": "ws_456",
            "name": "Acme Inc"
          }
        }
      ]
    }
  ],
  "total": 50,
  "limit": 100,
  "offset": 0
}
```

#### 3. Workspaces List
```
GET /api/admin/dash/workspaces
```

**Query Parameters**:
- `name` (optional): Filter by workspace name (contains, case-insensitive)
- `limit` (optional): Number of workspaces (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "workspaces": [
    {
      "id": "ws_123",
      "name": "Acme Inc",
      "website": "https://acme.com",
      "createdAt": "2025-11-15T08:00:00Z",
      "updatedAt": "2025-11-24T12:00:00Z",
      "_count": {
        "users": 5,
        "projects": 10,
        "clients": 3
      },
      "users": [
        {
          "role": "OWNER",
          "user": {
            "id": "user_456",
            "email": "owner@acme.com",
            "name": "Jane Smith"
          }
        }
      ]
    }
  ],
  "total": 25,
  "limit": 100,
  "offset": 0
}
```

#### 4. Integrations List
```
GET /api/admin/dash/integrations
```

**Query Parameters**:
- `workspaceId` (optional): Filter by workspace
- `type` (optional): Filter by integration type (SERP_API|PAGESPEED|OPENAI|GA4|GSC|STRIPE)

**Response**:
```json
{
  "integrations": [
    {
      "id": "int_123",
      "type": "SERP_API",
      "displayName": "SERP API - Production",
      "isEnabled": true,
      "status": "ACTIVE",
      "lastTestedAt": "2025-11-24T11:00:00Z",
      "lastTestStatus": "success",
      "lastTestError": null,
      "createdAt": "2025-11-20T09:00:00Z",
      "updatedAt": "2025-11-24T11:00:00Z",
      "workspaceId": "ws_456",
      "workspace": {
        "id": "ws_456",
        "name": "Acme Inc"
      }
    }
  ]
}
```

**Note**: Credentials are NOT returned. They remain encrypted in the database.

---

## Admin Logging System

### Log Levels

- **INFO**: Normal operations, list access, routine actions
- **WARN**: Potential issues, rate limit warnings
- **ERROR**: Failures, exceptions, system errors
- **SECURITY**: Authentication failures, unauthorized access, suspicious activity

### Logged Actions

All sensitive operations are logged:
- Admin API access
- User list access
- Workspace list access
- Integration configuration changes
- Unauthorized access attempts
- Failed authentication
- Rate limit violations

### Log Retention

- **Standard Logs** (INFO, WARN, ERROR): 90 days
- **Security Logs**: Retained indefinitely
- Automatic cleanup via cron job

### Accessing Logs

**Via API** (from dash app):
```bash
curl -X GET 'https://aiseo.archcloudsystems.com/api/admin/dash/logs?level=SECURITY&limit=50' \
  -H 'Cookie: your-session-cookie'
```

**Via Database** (Supabase):
```sql
-- View recent security logs
SELECT * FROM "AdminLog"
WHERE level = 'SECURITY'
ORDER BY timestamp DESC
LIMIT 50;

-- View logs for specific user
SELECT * FROM "AdminLog"
WHERE "userId" = 'user_123'
ORDER BY timestamp DESC;

-- Count logs by level
SELECT level, COUNT(*) as count
FROM "AdminLog"
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY level;
```

---

## Security Features

### 1. Multi-Layered Access Control

```
Request → Super Admin Email Check → Platform Role Check → Origin Validation → Action Logged
```

**Implementation**:
```typescript
// lib/admin-auth.ts
export const SUPER_ADMIN_EMAIL = "archcloudsystems@gmail.com";

export async function requireSuperAdmin() {
  // 1. Check authentication
  // 2. Verify email matches SUPER_ADMIN_EMAIL
  // 3. Verify platformRole === "SUPERADMIN"
  // 4. Return user or 403 error
}
```

### 2. Origin Validation

Only requests from approved origins are allowed:
- `https://dash.archcloudsystems.com`
- `http://localhost:3001` (development)
- `http://localhost:3000` (development)

### 3. Audit Trail

Every admin action is logged with:
- Timestamp
- Action type
- User ID
- IP address
- User agent
- Request metadata

### 4. Encrypted Data

- Integration credentials: AES-256-GCM encrypted
- Never transmitted in API responses
- Only decrypted when actively used
- Test-only endpoints for validation

---

## Database Direct Access

### Sensitive Data Locations

**User Data**:
```sql
-- All users
SELECT * FROM "User";

-- User workspaces
SELECT * FROM "WorkspaceUser";
```

**Workspace Data**:
```sql
-- All workspaces
SELECT * FROM "Workspace";

-- Workspace with member count
SELECT w.*, COUNT(wu."userId") as member_count
FROM "Workspace" w
LEFT JOIN "WorkspaceUser" wu ON w.id = wu."workspaceId"
GROUP BY w.id;
```

**Integration Credentials** (Encrypted):
```sql
-- View integration configs (credentials are encrypted)
SELECT
  ic.*,
  w.name as workspace_name
FROM "IntegrationConfig" ic
JOIN "Workspace" w ON ic."workspaceId" = w.id;

-- NOTE: encryptedCredentials is encrypted and cannot be read directly
```

**Admin Logs**:
```sql
-- All admin logs
SELECT * FROM "AdminLog" ORDER BY timestamp DESC;

-- Security events only
SELECT * FROM "AdminLog"
WHERE level = 'SECURITY'
ORDER BY timestamp DESC;
```

---

## Dash App Integration

### Authentication Flow

1. **User authenticates** on `aiseo.archcloudsystems.com` as archcloudsystems@gmail.com
2. **Session established** with NextAuth
3. **Dash app** includes session cookie in requests
4. **API validates**:
   - Session exists
   - User email = archcloudsystems@gmail.com
   - platformRole = SUPERADMIN
   - Origin from dash.archcloudsystems.com

### CORS Configuration

All admin API routes include:
```typescript
{
  "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

### Sample Dash App Implementation

```typescript
// In dash.archcloudsystems.com

// Fetch users
async function getUsers(email?: string) {
  const params = new URLSearchParams();
  if (email) params.set('email', email);

  const response = await fetch(
    `https://aiseo.archcloudsystems.com/api/admin/dash/users?${params}`,
    {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

// Fetch logs
async function getLogs(level?: string) {
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  params.set('limit', '100');

  const response = await fetch(
    `https://aiseo.archcloudsystems.com/api/admin/dash/logs?${params}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.json();
}

// Fetch workspaces
async function getWorkspaces() {
  const response = await fetch(
    'https://aiseo.archcloudsystems.com/api/admin/dash/workspaces',
    {
      credentials: 'include',
    }
  );

  return response.json();
}
```

---

## Monitoring & Maintenance

### Daily Tasks

1. **Check Security Logs**:
```sql
SELECT * FROM "AdminLog"
WHERE level = 'SECURITY'
AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

2. **Monitor Failed Logins**:
```sql
SELECT * FROM "AdminLog"
WHERE action LIKE '%FAILED%'
AND timestamp > NOW() - INTERVAL '24 hours';
```

3. **Review Active Integrations**:
```sql
SELECT
  w.name as workspace,
  ic.type,
  ic."lastTestedAt",
  ic."lastTestStatus"
FROM "IntegrationConfig" ic
JOIN "Workspace" w ON ic."workspaceId" = w.id
WHERE ic."isEnabled" = true
ORDER BY ic."lastTestedAt" DESC NULLS LAST;
```

### Weekly Tasks

1. **User Growth Report**:
```sql
SELECT
  DATE_TRUNC('week', "createdAt") as week,
  COUNT(*) as new_users
FROM "User"
WHERE "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY week
ORDER BY week DESC;
```

2. **Workspace Activity**:
```sql
SELECT
  w.name,
  COUNT(DISTINCT p.id) as projects,
  COUNT(DISTINCT k.id) as keywords,
  COUNT(DISTINCT sa.id) as audits
FROM "Workspace" w
LEFT JOIN "Project" p ON w.id = p."workspaceId"
LEFT JOIN "Keyword" k ON p.id = k."projectId"
LEFT JOIN "SeoAudit" sa ON p.id = sa."projectId"
GROUP BY w.id, w.name
ORDER BY projects DESC;
```

3. **Integration Health**:
```sql
SELECT
  type,
  COUNT(*) as total,
  SUM(CASE WHEN "isEnabled" = true THEN 1 ELSE 0 END) as enabled,
  SUM(CASE WHEN "lastTestStatus" = 'success' THEN 1 ELSE 0 END) as passing
FROM "IntegrationConfig"
GROUP BY type;
```

### Monthly Tasks

1. **Clean Old Logs** (automated via cron):
```sql
DELETE FROM "AdminLog"
WHERE timestamp < NOW() - INTERVAL '90 days'
AND level != 'SECURITY';
```

2. **Generate Platform Report**:
```sql
-- Total users, workspaces, projects
SELECT
  (SELECT COUNT(*) FROM "User") as total_users,
  (SELECT COUNT(*) FROM "Workspace") as total_workspaces,
  (SELECT COUNT(*) FROM "Project") as total_projects,
  (SELECT COUNT(*) FROM "Keyword") as total_keywords,
  (SELECT COUNT(*) FROM "SeoAudit") as total_audits;
```

---

## Troubleshooting

### Common Issues

#### 1. Cannot Access Admin Routes

**Symptoms**: 403 Forbidden on `/api/admin/dash/*`

**Solutions**:
1. Verify super admin email:
```sql
SELECT email, "platformRole" FROM "User"
WHERE email = 'archcloudsystems@gmail.com';
```

2. Update if needed:
```sql
UPDATE "User"
SET "platformRole" = 'SUPERADMIN'
WHERE email = 'archcloudsystems@gmail.com';
```

3. Check session authentication
4. Verify origin header from dash app

#### 2. Missing Logs

**Symptoms**: AdminLog table is empty

**Solutions**:
1. Check if migration ran:
```sql
SELECT * FROM "AdminLog" LIMIT 1;
```

2. If table doesn't exist, run migration manually
3. Check application logs for errors

#### 3. CORS Errors from Dash App

**Symptoms**: CORS policy blocks requests

**Solutions**:
1. Verify dash app origin is whitelisted
2. Check browser console for exact error
3. Ensure credentials: 'include' in fetch
4. Verify OPTIONS preflight succeeds

---

## Emergency Procedures

### Revoke Access

If super admin account is compromised:

```sql
-- Immediately revoke super admin status
UPDATE "User"
SET "platformRole" = 'USER'
WHERE email = 'archcloudsystems@gmail.com';

-- Check for unauthorized admin access
SELECT * FROM "AdminLog"
WHERE level = 'SECURITY'
AND timestamp > NOW() - INTERVAL '24 hours';
```

### Lock Down Platform

```sql
-- Disable all integrations
UPDATE "IntegrationConfig"
SET "isEnabled" = false;

-- Force all users to re-login (clear sessions)
-- This requires restarting the application or clearing session store
```

### Audit Security Breach

```sql
-- Find all actions by specific IP
SELECT * FROM "AdminLog"
WHERE "ipAddress" = 'suspicious.ip.address'
ORDER BY timestamp DESC;

-- Find all failed access attempts
SELECT * FROM "AdminLog"
WHERE action LIKE '%FAILED%' OR action LIKE '%UNAUTHORIZED%'
ORDER BY timestamp DESC;
```

---

## API Rate Limits

**Admin Routes**: No rate limiting (super admin only)

**All Other Routes**: Per-workspace limits based on subscription plan

---

## Support Contacts

**Platform Owner**: ArchCloud Systems
**Email**: archcloudsystems@gmail.com
**Dashboard**: dash.archcloudsystems.com

---

## Changelog

### 2025-11-24
- Initial admin system implementation
- Created super admin access control
- Implemented admin logging
- Built dash app API routes
- Created comprehensive documentation

---

**END OF CONFIDENTIAL DOCUMENTATION**
