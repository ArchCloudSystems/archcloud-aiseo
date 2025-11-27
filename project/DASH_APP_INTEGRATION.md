# Dash App Integration Guide

**For**: dash.archcloudsystems.com
**Platform**: aiseo.archcloudsystems.com
**Super Admin**: archcloudsystems@gmail.com

---

## Overview

The Dash App is a centralized admin dashboard for managing the ArchCloud SEO SaaS platform. It provides read-only access to all platform data, user management, workspace monitoring, and audit logging.

### Architecture

```
┌─────────────────────────┐
│ dash.archcloudsystems.  │
│        com              │
│  (Admin Dashboard)      │
└───────────┬─────────────┘
            │ HTTPS
            │ (with cookies)
            ▼
┌─────────────────────────┐
│ aiseo.archcloudsystems. │
│        com              │
│  (SaaS Platform)        │
│  /api/admin/dash/*      │
└─────────────────────────┘
```

---

## Authentication

### Single Sign-On Flow

The Dash App uses the same authentication as the main platform:

1. **Super admin logs in** at `https://aiseo.archcloudsystems.com/auth/signin`
2. **Session established** with email `archcloudsystems@gmail.com`
3. **Dash app accesses** API routes with session cookie
4. **Platform validates** super admin status

### Session Management

```typescript
// The session is managed by NextAuth on aiseo.archcloudsystems.com
// Dash app simply includes cookies in requests

const response = await fetch(
  'https://aiseo.archcloudsystems.com/api/admin/dash/users',
  {
    credentials: 'include', // CRITICAL: Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  }
);
```

---

## API Endpoints

All admin endpoints are under `/api/admin/dash/*` and require:
- Valid super admin session
- Origin from dash.archcloudsystems.com (or localhost for dev)

### Base URL

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aiseo.archcloudsystems.com';
```

### Available Endpoints

#### 1. Get Admin Logs

```typescript
GET /api/admin/dash/logs

interface GetLogsParams {
  limit?: number;        // 1-1000, default: 100
  offset?: number;       // default: 0
  level?: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  userId?: string;
  workspaceId?: string;
  startDate?: string;    // ISO 8601
  endDate?: string;      // ISO 8601
}

interface LogResponse {
  logs: AdminLog[];
  total: number;
  limit: number;
  offset: number;
}

interface AdminLog {
  id: string;
  level: string;
  action: string;
  userId?: string;
  workspaceId?: string;
  metadata?: string;     // JSON string
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;     // ISO 8601
}
```

**Example**:
```typescript
async function fetchLogs(params: GetLogsParams = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/dash/logs`);

  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());
  if (params.level) url.searchParams.set('level', params.level);
  if (params.userId) url.searchParams.set('userId', params.userId);
  if (params.workspaceId) url.searchParams.set('workspaceId', params.workspaceId);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch logs: ${response.statusText}`);
  }

  return response.json() as Promise<LogResponse>;
}
```

#### 2. Get Users

```typescript
GET /api/admin/dash/users

interface GetUsersParams {
  email?: string;        // Filter by email (contains)
  workspaceId?: string;  // Filter by workspace
  limit?: number;        // default: 100
  offset?: number;       // default: 0
}

interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  platformRole: 'USER' | 'SUPERADMIN';
  hasCompletedOnboarding: boolean;
  createdAt: string;
  workspaceUsers: Array<{
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    workspace: {
      id: string;
      name: string;
    };
  }>;
}
```

**Example**:
```typescript
async function fetchUsers(params: GetUsersParams = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/dash/users`);

  if (params.email) url.searchParams.set('email', params.email);
  if (params.workspaceId) url.searchParams.set('workspaceId', params.workspaceId);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }

  return response.json() as Promise<UsersResponse>;
}
```

#### 3. Get Workspaces

```typescript
GET /api/admin/dash/workspaces

interface GetWorkspacesParams {
  name?: string;         // Filter by name (contains)
  limit?: number;        // default: 100
  offset?: number;       // default: 0
}

interface WorkspacesResponse {
  workspaces: Workspace[];
  total: number;
  limit: number;
  offset: number;
}

interface Workspace {
  id: string;
  name: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    projects: number;
    clients: number;
  };
  users: Array<{
    role: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  }>;
}
```

**Example**:
```typescript
async function fetchWorkspaces(params: GetWorkspacesParams = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/dash/workspaces`);

  if (params.name) url.searchParams.set('name', params.name);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
  }

  return response.json() as Promise<WorkspacesResponse>;
}
```

#### 4. Get Integrations

```typescript
GET /api/admin/dash/integrations

interface GetIntegrationsParams {
  workspaceId?: string;  // Filter by workspace
  type?: 'SERP_API' | 'PAGESPEED' | 'OPENAI' | 'GA4' | 'GSC' | 'STRIPE';
}

interface IntegrationsResponse {
  integrations: Integration[];
}

interface Integration {
  id: string;
  type: string;
  displayName?: string;
  isEnabled: boolean;
  status: string;
  lastTestedAt?: string;
  lastTestStatus?: string;
  lastTestError?: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  workspace: {
    id: string;
    name: string;
  };
}
```

**Example**:
```typescript
async function fetchIntegrations(params: GetIntegrationsParams = {}) {
  const url = new URL(`${API_BASE_URL}/api/admin/dash/integrations`);

  if (params.workspaceId) url.searchParams.set('workspaceId', params.workspaceId);
  if (params.type) url.searchParams.set('type', params.type);

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch integrations: ${response.statusText}`);
  }

  return response.json() as Promise<IntegrationsResponse>;
}
```

---

## Complete API Client

```typescript
// lib/api-client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aiseo.archcloudsystems.com';

class AdminAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Logs
  async getLogs(params: {
    limit?: number;
    offset?: number;
    level?: string;
    userId?: string;
    workspaceId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    return this.request('/api/admin/dash/logs', params as any);
  }

  // Users
  async getUsers(params: {
    email?: string;
    workspaceId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    return this.request('/api/admin/dash/users', params as any);
  }

  // Workspaces
  async getWorkspaces(params: {
    name?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    return this.request('/api/admin/dash/workspaces', params as any);
  }

  // Integrations
  async getIntegrations(params: {
    workspaceId?: string;
    type?: string;
  } = {}) {
    return this.request('/api/admin/dash/integrations', params as any);
  }
}

export const adminAPI = new AdminAPIClient();
```

---

## React Hook Examples

```typescript
// hooks/useAdminLogs.ts
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api-client';

export function useAdminLogs(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await adminAPI.getLogs(filters);
        if (mounted) {
          setLogs(data.logs);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLogs();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { logs, loading, error };
}

// Usage in component
function AdminLogsPage() {
  const { logs, loading, error } = useAdminLogs({ level: 'SECURITY', limit: 50 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {logs.map(log => (
        <div key={log.id}>{log.action} - {log.timestamp}</div>
      ))}
    </div>
  );
}
```

---

## Environment Variables

```env
# .env.local in dash app

# Main platform URL
NEXT_PUBLIC_API_URL=https://aiseo.archcloudsystems.com

# For development
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## CORS Configuration

The platform automatically handles CORS for dash app requests. Allowed origins:
- `https://dash.archcloudsystems.com` (production)
- `http://localhost:3001` (development)
- `http://localhost:3000` (development)

All responses include:
```
Access-Control-Allow-Origin: <request-origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## Security Considerations

### 1. Session-Based Auth

- Dash app relies on session cookies
- No API keys or tokens needed
- Super admin must be logged in on main platform
- Session timeout follows platform settings

### 2. Origin Validation

- Every request validates origin header
- Only approved origins allowed
- Prevents unauthorized access

### 3. Super Admin Only

- Hardcoded email check: archcloudsystems@gmail.com
- Platform role must be SUPERADMIN
- No way to bypass these checks

### 4. Read-Only Access

- All dash app endpoints are GET only
- No mutations allowed from dash app
- Platform data cannot be modified

### 5. Audit Logging

- Every dash app request is logged
- Includes IP, user agent, timestamp
- Security logs retained indefinitely

---

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```
**Solution**: Super admin not logged in. Log in at aiseo.archcloudsystems.com

#### 403 Forbidden
```json
{
  "error": "Forbidden - Super Admin access required"
}
```
**Solution**: User is not super admin or email doesn't match

#### 403 Invalid Origin
```json
{
  "error": "Invalid request origin"
}
```
**Solution**: Request not from approved origin. Check CORS settings.

### Error Handling Pattern

```typescript
async function fetchData() {
  try {
    const data = await adminAPI.getUsers();
    return data;
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = 'https://aiseo.archcloudsystems.com/auth/signin';
    } else if (error.message.includes('Forbidden')) {
      // Show access denied message
      console.error('Access denied - super admin required');
    } else {
      // Generic error
      console.error('Failed to fetch data:', error);
    }
    throw error;
  }
}
```

---

## Development Setup

### Running Locally

1. **Start main platform**:
```bash
cd /path/to/aiseo-platform
npm run dev
# Runs on http://localhost:3000
```

2. **Start dash app**:
```bash
cd /path/to/dash-app
NEXT_PUBLIC_API_URL=http://localhost:3000 npm run dev
# Runs on http://localhost:3001
```

3. **Login as super admin**:
   - Go to http://localhost:3000/auth/signin
   - Login with archcloudsystems@gmail.com

4. **Access dash app**:
   - Go to http://localhost:3001
   - API calls will use localhost:3000

### Testing API Endpoints

```bash
# Get logs (with session cookie)
curl -X GET 'http://localhost:3000/api/admin/dash/logs?limit=10' \
  -H 'Cookie: next-auth.session-token=your-session-token' \
  -H 'Origin: http://localhost:3001'

# Get users
curl -X GET 'http://localhost:3000/api/admin/dash/users' \
  -H 'Cookie: next-auth.session-token=your-session-token' \
  -H 'Origin: http://localhost:3001'
```

---

## Deployment

### Production Checklist

- [ ] Set `NEXT_PUBLIC_API_URL=https://aiseo.archcloudsystems.com`
- [ ] Deploy to `dash.archcloudsystems.com`
- [ ] Verify CORS from dash subdomain
- [ ] Test super admin login flow
- [ ] Verify all API endpoints work
- [ ] Check audit logging
- [ ] Monitor error rates

### DNS Configuration

```
dash.archcloudsystems.com → Vercel/Hosting Platform
aiseo.archcloudsystems.com → Vercel/Hosting Platform
```

---

## Support

**Issues or Questions?**
- Email: archcloudsystems@gmail.com
- Check logs: https://aiseo.archcloudsystems.com/api/admin/dash/logs

---

## Changelog

### 2025-11-24
- Initial dash app integration
- Created all admin API endpoints
- Implemented authentication and authorization
- Added audit logging for all requests
- Documented complete API surface

---

**For Internal Use Only - ArchCloud Systems**
