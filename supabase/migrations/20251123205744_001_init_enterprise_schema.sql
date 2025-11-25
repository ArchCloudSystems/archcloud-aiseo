/*
  # Initial Enterprise Schema Migration for ArchCloud AISEO

  This migration sets up the complete enterprise architecture with:
  
  ## 1. Core Authentication Tables
    - User: User accounts with role-based access
    - Account: OAuth account linking (NextAuth)
    - Session: User sessions
    - VerificationToken: Email verification tokens
  
  ## 2. Multi-Tenancy & Workspaces
    - Workspace: Isolated workspaces for data segregation
    - WorkspaceUser: Team member invitations and workspace membership
  
  ## 3. Business Models
    - Client: Client management
    - Project: SEO projects
    - Keyword: Keyword research and tracking
    - SeoAudit: Technical SEO audits
    - ContentBrief: AI-generated content briefs
    - Document: Document center for notes, reports, uploads
  
  ## 4. Integrations & Billing
    - Integration: External service connections (GA4, GSC, Stripe, etc.)
    - Subscription: Stripe billing and plan management
  
  ## 5. Enterprise Telemetry & Analytics
    - ServiceAccount: API keys for ArchCloud Dash admin access
    - TelemetryEvent: Real-time event tracking
    - DailyUsageSnapshot: Aggregated daily usage metrics
  
  ## 6. Security
    - All tables have proper indexes for performance
    - Foreign keys with appropriate cascade behaviors
    - Enums for type safety
*/

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SERVICE_ACCOUNT');
CREATE TYPE "PlanTier" AS ENUM ('STARTER', 'PRO', 'AGENCY');
CREATE TYPE "DocumentType" AS ENUM ('NOTE', 'REPORT', 'UPLOAD', 'LEGAL', 'STRATEGY', 'RESEARCH');
CREATE TYPE "IntegrationStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');
CREATE TYPE "TelemetryEventType" AS ENUM (
  'USER_LOGIN', 
  'USER_LOGOUT', 
  'PROJECT_CREATED', 
  'PROJECT_UPDATED', 
  'PROJECT_DELETED', 
  'KEYWORD_SEARCH', 
  'AUDIT_RUN', 
  'CONTENT_BRIEF_GENERATED', 
  'DOCUMENT_CREATED', 
  'INTEGRATION_CONNECTED', 
  'INTEGRATION_DISCONNECTED', 
  'ERROR_OCCURRED', 
  'API_CALL'
);

-- Core Auth Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Workspace & Multi-tenancy
CREATE TABLE IF NOT EXISTS "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Workspace_slug_key" ON "Workspace"("slug");
CREATE INDEX IF NOT EXISTS "Workspace_ownerId_idx" ON "Workspace"("ownerId");
CREATE INDEX IF NOT EXISTS "Workspace_slug_idx" ON "Workspace"("slug");

CREATE TABLE IF NOT EXISTS "WorkspaceUser" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkspaceUser_workspaceId_userId_key" ON "WorkspaceUser"("workspaceId", "userId");
CREATE INDEX IF NOT EXISTS "WorkspaceUser_workspaceId_idx" ON "WorkspaceUser"("workspaceId");
CREATE INDEX IF NOT EXISTS "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");

-- Client Management
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryDomain" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Client_workspaceId_idx" ON "Client"("workspaceId");

-- Project Management
CREATE TABLE IF NOT EXISTS "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Project_workspaceId_idx" ON "Project"("workspaceId");
CREATE INDEX IF NOT EXISTS "Project_clientId_idx" ON "Project"("clientId");

-- Keyword Research
CREATE TABLE IF NOT EXISTS "Keyword" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "volume" INTEGER,
    "difficulty" INTEGER,
    "cpc" DOUBLE PRECISION,
    "serpFeatureSummary" TEXT,
    "country" TEXT NOT NULL DEFAULT 'us',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Keyword_projectId_idx" ON "Keyword"("projectId");

-- SEO Audits
CREATE TABLE IF NOT EXISTS "SeoAudit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "overallScore" INTEGER,
    "performanceScore" INTEGER,
    "seoScore" INTEGER,
    "accessibilityScore" INTEGER,
    "bestPracticesScore" INTEGER,
    "mobileFriendly" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1Count" INTEGER,
    "h2Count" INTEGER,
    "wordCount" INTEGER,
    "loadTime" INTEGER,
    "issuesJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SeoAudit_projectId_idx" ON "SeoAudit"("projectId");

-- Content Briefs
CREATE TABLE IF NOT EXISTS "ContentBrief" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "targetKeyword" TEXT NOT NULL,
    "searchIntent" TEXT,
    "outline" TEXT,
    "questions" TEXT,
    "wordCountTarget" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBrief_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ContentBrief_projectId_idx" ON "ContentBrief"("projectId");

-- Document Center
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'NOTE',
    "content" TEXT,
    "url" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Document_workspaceId_idx" ON "Document"("workspaceId");
CREATE INDEX IF NOT EXISTS "Document_clientId_idx" ON "Document"("clientId");
CREATE INDEX IF NOT EXISTS "Document_projectId_idx" ON "Document"("projectId");

-- Integrations
CREATE TABLE IF NOT EXISTS "Integration" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "lastCheckedAt" TIMESTAMP(3),
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Integration_workspaceId_type_key" ON "Integration"("workspaceId", "type");
CREATE INDEX IF NOT EXISTS "Integration_workspaceId_idx" ON "Integration"("workspaceId");

-- Billing & Subscriptions
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "plan" "PlanTier" NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_workspaceId_key" ON "Subscription"("workspaceId");
CREATE INDEX IF NOT EXISTS "Subscription_workspaceId_idx" ON "Subscription"("workspaceId");

-- Service Accounts (for ArchCloud Dash)
CREATE TABLE IF NOT EXISTS "ServiceAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceAccount_apiKey_key" ON "ServiceAccount"("apiKey");
CREATE INDEX IF NOT EXISTS "ServiceAccount_apiKey_idx" ON "ServiceAccount"("apiKey");

-- Telemetry & Analytics
CREATE TABLE IF NOT EXISTS "TelemetryEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "TelemetryEventType" NOT NULL,
    "context" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TelemetryEvent_workspaceId_idx" ON "TelemetryEvent"("workspaceId");
CREATE INDEX IF NOT EXISTS "TelemetryEvent_userId_idx" ON "TelemetryEvent"("userId");
CREATE INDEX IF NOT EXISTS "TelemetryEvent_type_idx" ON "TelemetryEvent"("type");
CREATE INDEX IF NOT EXISTS "TelemetryEvent_createdAt_idx" ON "TelemetryEvent"("createdAt");

CREATE TABLE IF NOT EXISTS "DailyUsageSnapshot" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "keywordSearchCount" INTEGER NOT NULL DEFAULT 0,
    "auditRunCount" INTEGER NOT NULL DEFAULT 0,
    "contentBriefCount" INTEGER NOT NULL DEFAULT 0,
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "apiCallCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyUsageSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DailyUsageSnapshot_workspaceId_date_key" ON "DailyUsageSnapshot"("workspaceId", "date");
CREATE INDEX IF NOT EXISTS "DailyUsageSnapshot_workspaceId_idx" ON "DailyUsageSnapshot"("workspaceId");
CREATE INDEX IF NOT EXISTS "DailyUsageSnapshot_date_idx" ON "DailyUsageSnapshot"("date");

-- Add Foreign Key Constraints
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeoAudit" ADD CONSTRAINT "SeoAudit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContentBrief" ADD CONSTRAINT "ContentBrief_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TelemetryEvent" ADD CONSTRAINT "TelemetryEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TelemetryEvent" ADD CONSTRAINT "TelemetryEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DailyUsageSnapshot" ADD CONSTRAINT "DailyUsageSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
