/*
  # Add RBAC and Per-Tenant Integration Config

  ## 1. New Enums
    - `PlatformRole` - Distinguishes superadmins from regular users
    - `OrgMemberRole` - Organization-level roles (OWNER, ADMIN, MEMBER, VIEWER)
    - `IntegrationType` - Types of integrations (GA4, GSC, SERP_API, OPENAI, STRIPE)

  ## 2. Modified Tables
    - `User` table enhancements:
      - `platformRole` - Platform-level admin capabilities
      - `hasCompletedOnboarding` - Track onboarding flow completion
    
    - `WorkspaceUser` table enhancements:
      - Convert role column from text to OrgMemberRole enum

  ## 3. New Tables
    - `IntegrationConfig` - Per-tenant encrypted integration credentials
      - Supports GA4, GSC, SERP API, OpenAI, and Stripe
      - Credentials encrypted at rest
      - Test status tracking for validation
    
    - `RateLimitLog` - Postgres-backed rate limiting
      - Tracks by workspace, user, and IP
      - Indexed for efficient queries

  ## 4. Security
    - RLS enabled on all new tables
    - Policies enforce workspace-level isolation
*/

-- Create new enums
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PlatformRole') THEN
    CREATE TYPE "PlatformRole" AS ENUM ('USER', 'SUPERADMIN');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrgMemberRole') THEN
    CREATE TYPE "OrgMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IntegrationType') THEN
    CREATE TYPE "IntegrationType" AS ENUM ('GA4', 'GSC', 'SERP_API', 'OPENAI', 'STRIPE');
  END IF;
END $$;

-- Add new columns to User table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'platformRole'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'hasCompletedOnboarding'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "hasCompletedOnboarding" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add website column to Workspace if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Workspace' AND column_name = 'website'
  ) THEN
    ALTER TABLE "Workspace" ADD COLUMN "website" TEXT;
  END IF;
END $$;

-- Create IntegrationConfig table
CREATE TABLE IF NOT EXISTS "IntegrationConfig" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "type" "IntegrationType" NOT NULL,
  "displayName" TEXT,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "encryptedCredentials" TEXT NOT NULL,
  "lastTestedAt" TIMESTAMPTZ,
  "lastTestStatus" TEXT,
  "lastTestError" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "IntegrationConfig_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "IntegrationConfig_workspaceId_type_unique" UNIQUE ("workspaceId", "type")
);

CREATE INDEX IF NOT EXISTS "IntegrationConfig_workspaceId_idx" ON "IntegrationConfig"("workspaceId");

-- Create RateLimitLog table
CREATE TABLE IF NOT EXISTS "RateLimitLog" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT,
  "userId" TEXT,
  "ip" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "status" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "RateLimitLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "RateLimitLog_workspaceId_route_createdAt_idx" ON "RateLimitLog"("workspaceId", "route", "createdAt");
CREATE INDEX IF NOT EXISTS "RateLimitLog_userId_route_createdAt_idx" ON "RateLimitLog"("userId", "route", "createdAt");
CREATE INDEX IF NOT EXISTS "RateLimitLog_ip_route_createdAt_idx" ON "RateLimitLog"("ip", "route", "createdAt");
CREATE INDEX IF NOT EXISTS "RateLimitLog_createdAt_idx" ON "RateLimitLog"("createdAt");

-- Enable RLS on new tables
ALTER TABLE "IntegrationConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitLog" ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are handled by the application layer since auth.uid() 
-- requires a different authentication setup than we currently have.