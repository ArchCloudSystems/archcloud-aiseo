# Role-Based Access Control (RBAC) Guide

This document describes the role-based access control system implemented in ArchCloud AI SEO.

## Overview

The RBAC system provides granular access control at two levels:
1. **User Level**: Global user roles (USER, ADMIN, SERVICE_ACCOUNT)
2. **Workspace Level**: Workspace-specific roles (owner, admin, member)

## User Roles

### USER (default)
- Standard user account
- Can create and manage their own workspace
- Access to all application features within their workspace

### ADMIN
- System administrator role
- Can access admin dashboards and metrics
- Can manage system-wide settings
- Reserved for ArchCloud internal staff

### SERVICE_ACCOUNT
- API-only accounts for service integrations
- Used by ArchCloud Dash for telemetry queries
- No UI access

## Workspace Roles

### Owner
- The user who created the workspace
- Full control over workspace settings
- Can invite/remove team members
- Can manage billing and subscriptions
- Can delete the workspace

### Admin
- Can invite team members (but not remove them)
- Can manage projects, keywords, audits
- Can manage integrations
- Can view analytics
- Cannot manage billing or remove members

### Member
- Can create and manage projects
- Can run audits and keyword research
- Can create content briefs
- Can create documents
- Cannot invite others or manage workspace settings

## RBAC Functions

### Authentication & Context

```typescript
import { requireAuth, getPermissionContext } from "@/lib/rbac";

// Get current user's permission context
const context = await requireAuth();
// Returns: { userId, userRole, workspaceId, workspaceRole, isOwner }

// Or get context for any user ID
const context = await getPermissionContext(userId);
```

### Authorization Checks

```typescript
import {
  requireWorkspaceOwner,
  requireWorkspaceAdmin,
  requireSystemAdmin,
} from "@/lib/rbac";

// Require workspace owner
const context = await requireWorkspaceOwner();

// Require workspace admin or owner
const context = await requireWorkspaceAdmin();

// Require system admin
const context = await requireSystemAdmin();
```

### Permission Helpers

```typescript
import {
  canManageWorkspace,
  canInviteMembers,
  canRemoveMembers,
  canDeleteProjects,
  canManageBilling,
  canManageIntegrations,
  canViewAnalytics,
} from "@/lib/rbac";

const context = await requireAuth();

if (canManageBilling(context)) {
  // User can manage billing
}

if (canInviteMembers(context)) {
  // User can invite team members
}
```

## Usage in API Routes

### Example 1: Protecting an Entire Route

```typescript
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";

export async function GET() {
  try {
    const context = await requireAuth();

    // Your route logic here

    return NextResponse.json({ data: "..." });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message.includes("Forbidden")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

### Example 2: Owner-Only Route

```typescript
import { NextResponse } from "next/server";
import { requireWorkspaceOwner } from "@/lib/rbac";

export async function DELETE(request: Request) {
  try {
    // This will throw if user is not workspace owner
    const context = await requireWorkspaceOwner();

    // Deletion logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling...
  }
}
```

### Example 3: Conditional Access

```typescript
import { NextResponse } from "next/server";
import { requireAuth, canManageBilling } from "@/lib/rbac";

export async function POST(request: Request) {
  try {
    const context = await requireAuth();

    if (!canManageBilling(context)) {
      return NextResponse.json(
        { error: "Billing management requires owner role" },
        { status: 403 }
      );
    }

    // Billing logic here

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error handling...
  }
}
```

## Usage in Server Components

```typescript
import { requireAuth, canManageWorkspace } from "@/lib/rbac";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const context = await requireAuth();

  const canManage = canManageWorkspace(context);

  return (
    <div>
      {canManage && (
        <div>Admin controls here</div>
      )}
      <div>Regular content here</div>
    </div>
  );
}
```

## Permission Matrix

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View workspace | ✓ | ✓ | ✓ |
| Invite members | ✓ | ✓ | ✗ |
| Remove members | ✓ | ✗ | ✗ |
| Manage billing | ✓ | ✗ | ✗ |
| Delete workspace | ✓ | ✗ | ✗ |
| Create projects | ✓ | ✓ | ✓ |
| Delete projects | ✓ | ✓ | ✗ |
| Manage integrations | ✓ | ✓ | ✗ |
| View analytics | ✓ | ✓ | ✗ |
| Run audits | ✓ | ✓ | ✓ |
| Keyword research | ✓ | ✓ | ✓ |
| Create briefs | ✓ | ✓ | ✓ |
| Create documents | ✓ | ✓ | ✓ |

## Service Account Access

Service accounts use API key authentication:

```typescript
import { requireServiceAccount } from "@/lib/service-auth";

export async function GET() {
  try {
    const accountId = await requireServiceAccount();

    // Admin API logic here

    return NextResponse.json({ data: "..." });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

Headers required:
```
x-service-api-key: your-service-api-key
```

## Best Practices

1. **Always use RBAC helpers** instead of manual checks
2. **Handle permission errors** gracefully with proper status codes
3. **Use the most restrictive check** needed for each route
4. **Document permission requirements** in route comments
5. **Test with different roles** during development

## Security Notes

- Permission checks are performed server-side only
- Frontend UI adjustments are for UX, not security
- Service account keys should be rotated regularly
- RBAC errors include minimal information to prevent information disclosure
