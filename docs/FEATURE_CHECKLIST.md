# Feature Checklist - Production Readiness

Use this checklist to verify the SaaS application is production-ready.

## Authentication & User Management

- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign out
- [ ] Google OAuth login works (if enabled)
- [ ] Password is hashed securely (bcrypt)
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect to sign in when not authenticated
- [ ] User profile information is displayed correctly

## Projects & Workspace

- [ ] User can create a new project
- [ ] User can view list of their projects
- [ ] User can only see their own projects (data isolation works)
- [ ] Project displays keyword count and audit count
- [ ] Project inherits plan tier from user subscription
- [ ] Project creation respects plan limits (TODO: implement limit enforcement)

## Billing & Subscriptions

- [ ] User starts on FREE plan by default
- [ ] Current plan and limits are visible on billing page
- [ ] User can upgrade to PRO plan via Stripe Checkout
- [ ] User can upgrade to AGENCY plan via Stripe Checkout
- [ ] Stripe Checkout redirects back to app after success/cancel
- [ ] User can access Stripe Billing Portal to manage subscription
- [ ] Billing Portal allows cancellation and payment method updates

### Stripe Webhook Integration

- [ ] Webhook endpoint is configured in Stripe Dashboard
- [ ] `checkout.session.completed` event creates/updates subscription
- [ ] `customer.subscription.updated` event updates subscription status
- [ ] `customer.subscription.deleted` event downgrades to FREE plan
- [ ] Subscription status syncs correctly to database
- [ ] Plan tier updates propagate to all user projects
- [ ] Webhook logs errors properly for debugging

### Subscription Display

- [ ] Billing page shows current plan (FREE, PRO, or AGENCY)
- [ ] Billing page shows renewal date for active subscriptions
- [ ] Billing page shows cancellation status if applicable
- [ ] Current plan is highlighted on billing page
- [ ] Upgrade buttons are disabled for current plan
- [ ] Loading states work during Stripe API calls

## SEO Data Management

- [ ] User can create projects via API (`POST /api/projects`)
- [ ] User can list projects via API (`GET /api/projects`)
- [ ] User can create keywords via API (`POST /api/keywords`)
- [ ] User can list keywords via API (`GET /api/keywords?projectId=...`)
- [ ] Keywords are scoped to projects
- [ ] SEO audits can be created and listed (via UI/dashboard)
- [ ] Dashboard displays correct counts (projects, keywords, audits)
- [ ] Recent audits are displayed on dashboard

## Data Security & Isolation

- [ ] All API routes check authentication
- [ ] Users can only access their own data
- [ ] Project creation checks user ownership
- [ ] Keyword queries verify project ownership
- [ ] No Supabase references in codebase (PostgreSQL + Prisma only)
- [ ] No sensitive keys or secrets in client-side code
- [ ] Stripe webhook validates signature

## Code Quality

- [ ] `pnpm check:stack` passes
- [ ] `pnpm lint` passes with no errors
- [ ] `pnpm tsc --noEmit` passes with no type errors
- [ ] `pnpm build` succeeds
- [ ] All API routes return proper error responses
- [ ] All API routes use proper HTTP status codes

## Database & Migrations

- [ ] Prisma schema is up to date
- [ ] All migrations have been applied
- [ ] Database indexes are in place for performance
- [ ] Subscription model has unique constraints on Stripe IDs
- [ ] Foreign keys are properly configured with CASCADE rules

## Environment Configuration

- [ ] `.env.example` contains all required variables
- [ ] `.env.example` has placeholder values (no real secrets)
- [ ] All Stripe environment variables are documented
- [ ] Database URL format is correct in `.env.example`
- [ ] `NEXTAUTH_SECRET` generation instructions are clear

## Documentation

- [ ] `docs/ARCHITECTURE.md` explains tech stack and structure
- [ ] `docs/DEV_GUIDE.md` provides setup and development instructions
- [ ] `docs/FEATURE_CHECKLIST.md` exists and is up to date
- [ ] Existing docs (git-workflow, server-setup, roadmap) are accessible
- [ ] README.md provides high-level overview (if exists)

## Production Deployment Preparation

- [ ] Production environment variables are configured
- [ ] Production database is set up
- [ ] Production Stripe webhook is configured with live URL
- [ ] Stripe live mode keys are used in production
- [ ] `pnpm prisma migrate deploy` works on production
- [ ] CORS and security headers are configured
- [ ] Rate limiting is implemented (TODO: add if needed)

## Known TODOs & Future Enhancements

- [ ] Implement plan limit enforcement (e.g., max projects per plan)
- [ ] Add usage tracking (keywords/month, audits/month)
- [ ] Add pagination for large datasets
- [ ] Implement project deletion
- [ ] Add keyword editing/deletion
- [ ] Add actual SEO audit scheduling and background jobs
- [ ] Integrate external SEO APIs (Google Search Console, Ahrefs, etc.)
- [ ] Add team/workspace support with role-based permissions
- [ ] Add email notifications for subscription changes
- [ ] Add invoice history display on billing page

## Testing Notes

Use this section to track manual testing results:

### Test User Credentials

- Email: `test@example.com`
- Password: `password123`
- Plan: `FREE` (default)

### Test Stripe Cards

- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

### Webhook Testing

Local webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Sign-Off

Mark this section when all critical features are verified:

- [ ] All authentication flows tested
- [ ] All billing flows tested
- [ ] All SEO data APIs tested
- [ ] All security checks passed
- [ ] All code quality checks passed
- [ ] Production deployment is ready

---

**Last Updated:** [Date]
**Tested By:** [Name]
**Environment:** [Local/Staging/Production]
