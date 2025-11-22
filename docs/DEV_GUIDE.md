# Developer Guide - ArchCloud AI SEO

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommend 20+)
- **pnpm** (or npm/yarn)
- **PostgreSQL** 14+
- **Stripe Account** (for billing features)
- **Google OAuth Credentials** (optional, for Google login)

### Initial Setup

1. **Clone the repository**

```bash
git clone <repo-url>
cd archcloud-aiseo
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/archcloud_aiseo"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

**How to get Stripe values:**

- Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- API keys: Developers → API keys
- Create products: Products → Add product (Pro, Agency)
- Get price IDs from product pages
- Webhook secret: Developers → Webhooks → Add endpoint → `http://localhost:3000/api/stripe/webhook` (use Stripe CLI for local testing)

4. **Set up the database**

Make sure PostgreSQL is running, then:

```bash
pnpm prisma migrate dev
```

This will:
- Create the database if it doesn't exist
- Run all migrations
- Generate Prisma Client

5. **Generate Prisma Client** (if not done automatically)

```bash
pnpm prisma generate
```

6. **Run the development server**

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Development Workflow

### Running Checks

Before committing, run these checks:

```bash
# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Build (ensures production build works)
pnpm build

# Stack check (custom script)
pnpm check:stack
```

### Database Operations

#### Create a new migration

```bash
pnpm prisma migrate dev --name <migration-name>
```

Example:

```bash
pnpm prisma migrate dev --name add_user_role
```

#### Reset the database (WARNING: deletes all data)

```bash
pnpm prisma migrate reset
```

#### Open Prisma Studio (database GUI)

```bash
pnpm prisma studio
```

#### Push schema changes without migration (dev only)

```bash
pnpm prisma db push
```

### Testing Stripe Locally

To test Stripe webhooks locally:

1. **Install Stripe CLI**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other platforms: https://stripe.com/docs/stripe-cli
```

2. **Login to Stripe**

```bash
stripe login
```

3. **Forward webhooks to local server**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret (`whsec_...`). Add it to your `.env`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

4. **Trigger test events**

In another terminal:

```bash
# Test checkout session completed
stripe trigger checkout.session.completed

# Test subscription updated
stripe trigger customer.subscription.updated
```

5. **Test full checkout flow**

- Go to `http://localhost:3000/billing`
- Click "Upgrade to Pro"
- Use test card: `4242 4242 4242 4242`, any future date, any CVC
- Complete checkout
- Check that webhook updates the subscription in your database

### Adding New Features

#### Adding a new API route

1. Create file in `app/api/<resource>/route.ts`
2. Add auth check:

```typescript
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here
}
```

3. Use Prisma client from `lib/db.ts`:

```typescript
import { db } from "@/lib/db";

const data = await db.yourModel.findMany({
  where: { userId: session.user.id },
});
```

#### Adding a new page

1. Create file in `app/(app)/<page>/page.tsx` for authenticated pages
2. Use `auth()` to get session:

```typescript
import { auth } from "@/lib/auth";

export default async function MyPage() {
  const session = await auth();
  // Page content
}
```

3. Or create client component:

```typescript
"use client";

export default function MyPage() {
  // Client-side logic
}
```

#### Adding a new database model

1. Edit `prisma/schema.prisma`
2. Create migration:

```bash
pnpm prisma migrate dev --name add_new_model
```

3. Prisma Client will auto-regenerate

## Common Tasks

### Create a test user

```typescript
// In Prisma Studio or via script
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const passwordHash = await bcrypt.hash("password123", 10);

await db.user.create({
  data: {
    email: "test@example.com",
    name: "Test User",
    passwordHash,
  },
});
```

### Check subscription status for a user

```bash
pnpm prisma studio
```

Navigate to `Subscription` table.

### Manually trigger Stripe webhook processing

Use Stripe CLI:

```bash
stripe trigger <event-type>
```

Or use Stripe Dashboard → Webhooks → Send test webhook.

## Troubleshooting

### Build fails with TypeScript errors

```bash
# Regenerate Prisma Client
pnpm prisma generate

# Check for type errors
pnpm tsc --noEmit
```

### Database connection errors

- Check that PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Test connection:

```bash
psql "postgresql://user:password@localhost:5432/archcloud_aiseo"
```

### Stripe webhook not working

- Check that Stripe CLI is running (`stripe listen`)
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Check webhook logs at `http://localhost:3000/api/stripe/webhook`
- Enable logging in webhook route (already has `console.error`)

### NextAuth errors

- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your local URL
- Clear browser cookies and try again

### Prisma Client not found

```bash
pnpm prisma generate
```

## Deployment

### Pre-deployment Checklist

- [ ] All tests pass (if you have tests)
- [ ] `pnpm build` succeeds
- [ ] Environment variables are set on production
- [ ] Database is set up and migrated
- [ ] Stripe webhook endpoint is configured (production URL)

### Environment Variables (Production)

Make sure to set these on your hosting platform:

```bash
DATABASE_URL="<production-postgres-url>"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<production-secret>"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_AGENCY_PRICE_ID="price_..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Database Migrations (Production)

```bash
pnpm prisma migrate deploy
```

This runs pending migrations without prompting.

### Configure Stripe Webhook (Production)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Project Structure Reference

```
/app
  /(app)                    # Protected routes (requires auth)
    /dashboard/page.tsx     # Main dashboard
    /billing/page.tsx       # Subscription management
    /projects/page.tsx      # Project list
    /keywords/page.tsx      # Keyword list
    /audits/page.tsx        # Audit list
    /settings/page.tsx      # User settings
  /auth
    /signin/page.tsx        # Sign in
    /signup/page.tsx        # Sign up
  /api
    /auth                   # NextAuth routes
    /stripe                 # Stripe routes
    /projects               # Project API
    /keywords               # Keyword API
    /subscription           # Subscription API

/lib
  auth.ts                   # NextAuth config
  db.ts                     # Prisma client
  stripe.ts                 # Stripe client & config
  utils.ts                  # Utilities

/prisma
  schema.prisma             # Database schema

/components
  /ui                       # shadcn/ui components
```

## Useful Commands Reference

```bash
# Development
pnpm dev                            # Start dev server
pnpm build                          # Build for production
pnpm start                          # Start production server
pnpm lint                           # Lint code
pnpm check:stack                    # Run stack guard script

# Database
pnpm prisma migrate dev             # Create and apply migration
pnpm prisma migrate deploy          # Apply migrations (production)
pnpm prisma migrate reset           # Reset database (dev only)
pnpm prisma db push                 # Push schema without migration
pnpm prisma studio                  # Open Prisma Studio
pnpm prisma generate                # Generate Prisma Client

# Stripe
stripe login                        # Login to Stripe CLI
stripe listen --forward-to ...      # Forward webhooks locally
stripe trigger <event>              # Trigger test event
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Stripe Documentation](https://stripe.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
