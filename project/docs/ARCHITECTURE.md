# ArchCloud AI SEO - Architecture Overview

## Tech Stack

This is a **Next.js 16 App Router** application with the following core technologies:

### Frontend
- **Next.js 16** (App Router)
- **TypeScript** for type safety
- **React 19** for UI components
- **Tailwind CSS v4** for styling
- **shadcn/ui** for component library
- **next-themes** for dark/light mode

### Backend & Database
- **PostgreSQL** as the primary database
- **Prisma** as the ORM
- **No external DB services** (no Supabase, Firebase, etc.)
- All data persistence goes through Prisma + PostgreSQL

### Authentication
- **NextAuth/Auth.js v5** with Prisma adapter
- Supports:
  - Credentials (email/password)
  - Google OAuth (optional)
- Session strategy: JWT
- User model includes role-based access (USER, ADMIN)

### Billing & Subscriptions
- **Stripe** for payment processing
- Webhook-driven subscription management
- Three plan tiers:
  - **FREE**: 1 project, 100 keywords, 10 audits, 5 briefs
  - **PRO**: 10 projects, 2,000 keywords, 500 audits, 200 briefs
  - **AGENCY**: Unlimited everything

## Project Structure

```
/app
  /(app)              # Authenticated app routes
    /dashboard        # Main dashboard
    /projects         # Project management
    /keywords         # Keyword tracking
    /audits           # SEO audits
    /billing          # Subscription & billing
    /settings         # User settings
  /auth
    /signin           # Sign in page
    /signup           # Sign up page
  /api
    /auth             # NextAuth routes
    /stripe           # Stripe routes (webhook, checkout, portal)
    /projects         # Project CRUD API
    /keywords         # Keyword CRUD API
    /subscription     # Subscription status API

/lib
  auth.ts             # NextAuth configuration
  db.ts               # Prisma client singleton
  stripe.ts           # Stripe client & plan config
  utils.ts            # General utilities

/prisma
  schema.prisma       # Database schema

/components
  /ui                 # shadcn/ui components
  app-header.tsx      # App header
  app-sidebar.tsx     # App sidebar
  theme-provider.tsx  # Theme context
```

## Database Schema

Key models:

- **User**: Auth user with role, owns projects
- **Account**: OAuth accounts (NextAuth)
- **Session**: User sessions (NextAuth)
- **Subscription**: Per-user subscription with Stripe IDs, plan tier, status
- **Project**: SEO projects owned by users, inherit plan tier
- **Keyword**: Keywords tracked per project
- **SeoAudit**: SEO audit results per project
- **ContentBrief**: Content briefs per project
- **Integration**: Third-party integrations

### Subscription Model

The `Subscription` model is central to billing:

```prisma
model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  plan                 PlanTier @default(FREE)
  status               String   @default("inactive")
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user User @relation(...)
}
```

- Each user has exactly one subscription record
- Stripe customer and subscription IDs are stored for billing operations
- Plan tier syncs with projects (when plan changes, all user projects update)

## Stripe Billing Flow

### 1. User Initiates Upgrade

- User clicks upgrade button on `/billing` page
- Frontend calls `POST /api/stripe/checkout` with `{ planTier: "PRO" | "AGENCY" }`
- Backend creates or retrieves Stripe customer
- Creates Stripe Checkout session with:
  - Customer ID
  - Price ID (from `STRIPE_PRO_PRICE_ID` or `STRIPE_AGENCY_PRICE_ID`)
  - Metadata: `{ userId }`
  - Success/cancel URLs
- User is redirected to Stripe Checkout

### 2. Webhook Processing

After successful payment, Stripe sends webhooks to `POST /api/stripe/webhook`:

**Event: `checkout.session.completed`**
- Extract `customerId`, `subscriptionId`, `userId` from session/metadata
- Retrieve full subscription from Stripe
- Upsert `Subscription` record with:
  - Stripe IDs
  - Plan tier (determined by price ID)
  - Status, period dates
- Update all user projects to new plan tier

**Event: `customer.subscription.updated`**
- Update `Subscription` record with new status/period/plan
- Sync plan tier to projects

**Event: `customer.subscription.deleted`**
- Set plan to FREE
- Set status to canceled
- Sync plan tier to projects

### 3. Customer Portal

- User clicks "Manage Billing" on `/billing` page
- Frontend calls `POST /api/stripe/portal`
- Backend creates Stripe Billing Portal session
- User is redirected to Stripe portal to manage subscription, payment methods, invoices

### Environment Variables

```bash
# Required for Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLIC_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."
```

## Key Files

### Stripe Integration

- `lib/stripe.ts` - Stripe client initialization, plan config, price-to-plan mapping
- `app/api/stripe/webhook/route.ts` - Webhook handler (checkout, subscription events)
- `app/api/stripe/checkout/route.ts` - Creates Checkout sessions
- `app/api/stripe/portal/route.ts` - Creates Billing Portal sessions
- `app/api/subscription/route.ts` - Fetches current user subscription
- `app/(app)/billing/page.tsx` - Client-side billing UI

### Authentication

- `lib/auth.ts` - NextAuth config with Credentials + Google
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/register/route.ts` - User registration
- `middleware.ts` - Route protection

### SEO Data APIs

- `app/api/projects/route.ts` - List/create projects
- `app/api/keywords/route.ts` - List/create keywords (scoped by project)

## Core Principles

1. **No external DB services**: All persistence via Prisma + PostgreSQL
2. **NextAuth for auth**: No other auth providers
3. **Stripe for billing**: No other payment processors
4. **Single responsibility**: Each API route handles one resource
5. **User-scoped data**: All queries filter by authenticated user ID
6. **Plan enforcement**: Plans are stored at project and subscription level

## Security Notes

- All API routes check authentication via `auth()` from `lib/auth.ts`
- Stripe webhook uses `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- Passwords are hashed with bcrypt
- No secrets are exposed client-side
- All Stripe operations are server-side only

## Future Enhancements

- Add plan limit enforcement (e.g., max projects per plan)
- Implement usage tracking (keywords/month, audits/month)
- Add audit scheduling and background workers
- Integrate external SEO APIs (Google Search Console, Ahrefs, etc.)
- Add team/workspace support with role-based permissions
