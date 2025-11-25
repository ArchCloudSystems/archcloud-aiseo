/*
  # Admin Logging and Security

  1. New Tables
    - `AdminLog` - Audit logs for super admin actions
      - `id` (text, primary key)
      - `level` (text) - INFO, WARN, ERROR, SECURITY
      - `action` (text) - Action description
      - `userId` (text, nullable) - User who performed action
      - `workspaceId` (text, nullable) - Affected workspace
      - `metadata` (text, nullable) - JSON metadata
      - `ipAddress` (text, nullable) - Request IP
      - `userAgent` (text, nullable) - Request user agent
      - `timestamp` (timestamptz) - When action occurred

  2. Security
    - Enable RLS on `AdminLog` table
    - Super admin read-only access policy
    - No public access

  3. Indexes
    - Index on userId for user-specific queries
    - Index on workspaceId for workspace queries
    - Index on timestamp for time-based queries
    - Index on level for filtering by severity

  4. Notes
    - Only super admin (archcloudsystems@gmail.com) can read logs
    - Security logs retained indefinitely
    - Other logs auto-deleted after 90 days (via cron)
*/

-- Create AdminLog table
CREATE TABLE IF NOT EXISTS "AdminLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  level TEXT NOT NULL,
  action TEXT NOT NULL,
  "userId" TEXT,
  "workspaceId" TEXT,
  metadata TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "AdminLog_userId_idx" ON "AdminLog" ("userId");
CREATE INDEX IF NOT EXISTS "AdminLog_workspaceId_idx" ON "AdminLog" ("workspaceId");
CREATE INDEX IF NOT EXISTS "AdminLog_timestamp_idx" ON "AdminLog" (timestamp DESC);
CREATE INDEX IF NOT EXISTS "AdminLog_level_idx" ON "AdminLog" (level);

-- Enable Row Level Security
ALTER TABLE "AdminLog" ENABLE ROW LEVEL SECURITY;

-- Super Admin Read-Only Policy
-- Only the super admin email can read logs
CREATE POLICY "Super admin can read all logs"
  ON "AdminLog"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "User"
      WHERE "User".id::text = auth.uid()::text
      AND "User".email = 'archcloudsystems@gmail.com'
      AND "User"."platformRole" = 'SUPERADMIN'
    )
  );

-- No one can directly insert, update, or delete logs via SQL
-- Logs are inserted via application code only
-- This prevents tampering with audit trail

-- Add comment for documentation
COMMENT ON TABLE "AdminLog" IS 'Audit logs for super admin actions. Only accessible by archcloudsystems@gmail.com. Security logs retained indefinitely.';
COMMENT ON COLUMN "AdminLog".level IS 'Log severity: INFO, WARN, ERROR, SECURITY';
COMMENT ON COLUMN "AdminLog".action IS 'Description of the action performed';
COMMENT ON COLUMN "AdminLog"."userId" IS 'User who performed the action (if applicable)';
COMMENT ON COLUMN "AdminLog"."workspaceId" IS 'Workspace affected by the action (if applicable)';
COMMENT ON COLUMN "AdminLog".metadata IS 'JSON string containing additional context';
COMMENT ON COLUMN "AdminLog"."ipAddress" IS 'IP address of the request';
COMMENT ON COLUMN "AdminLog"."userAgent" IS 'User agent string from the request';
