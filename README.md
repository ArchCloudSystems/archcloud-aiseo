# ArchCloud AI SEO

An AI-powered SEO platform similar to Search Atlas, featuring keyword research, content brief generation, on-page SEO auditing, and AI-driven content suggestions. Built as a production-ready SaaS with tiered pricing and integrated payments.

## Overview

**Repository:** archcloud-aiseo
**Domain:** ai.archcloudsystems.com
**Current Proxy:** aiseo.archcloudsystems.com (Nginx reverse proxy on port 3001)

This is a full-stack, enterprise-grade SaaS application built with modern web technologies and best practices.

## Tech Stack

- **Framework:** Next.js 16+ (App Router, TypeScript, React Server Components)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Authentication:** NextAuth.js (Auth.js) v5
  - Email/password authentication
  - Google OAuth integration
  - Protected routes with middleware
- **Database:** Prisma + PostgreSQL
  - Type-safe database client
  - Migration management
  - Relation modeling for users, projects, audits, keywords
- **Payments:** Stripe subscription billing (3 SaaS tiers)
- **Theme:** Enterprise-grade UI with persistent light/dark mode
- **AI Integration:** OpenAI API (placeholders for content & SEO analysis)
- **External APIs:**
  - Google Search Console (placeholder)
  - Google Analytics (placeholder)
  - Social media integrations (Twitter/X, LinkedIn, Facebook)

## Features

### Public Site
- **Landing Page:** Hero section, feature highlights, pricing table
- **Authentication:** Sign up/sign in with email or Google
- **Contact Form:** Support and inquiry submission

### Authenticated App
- **Dashboard:** Overview cards for projects, keywords, audits, and AI insights
- **Projects/Sites:** Create and manage SEO projects
- **Keyword Research:** Discover keywords with volume and difficulty metrics
- **Content Briefs:** AI-generated content outlines and recommendations
- **SEO Audits:** On-page analysis with AI-powered suggestions
- **Integrations:** Connect Google services and social media accounts
- **Billing:** Subscription management with Stripe integration
- **Settings:** Profile management, password changes, theme preferences

## Prerequisites

- **Node.js:** v20+ recommended
- **PostgreSQL:** Local instance or managed database (Railway, Render, Neon, etc.)
- **Package Manager:** npm or pnpm

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd archcloud-aiseo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```env
# App
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# Auth.js / NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-random-secret>

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Stripe (get from Stripe Dashboard)
STRIPE_PUBLIC_KEY=<your-stripe-public-key>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>

# OpenAI
OPENAI_API_KEY=<your-openai-key>
```

### 4. Set Up the Database

Run Prisma migrations to create database schema:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
npm run start
```

## Deployment

### VPS Deployment (Current Setup)

This app runs on a VPS behind Nginx, proxied on port 3001.

#### 1. Build the Application

```bash
npm install
npm run build
```

#### 2. Start with PM2

```bash
pm2 start "npm run start -- -p 3001" --name aiseo
pm2 save
pm2 startup
```

#### 3. Configure Nginx

Sample Nginx configuration (adjust as needed):

```nginx
server {
    listen 80;
    server_name ai.archcloudsystems.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables on VPS

Set production environment variables in `/home/deploy/archcloud-aiseo/.env`

## Project Structure

```
archcloud-aiseo/
├── app/
│   ├── (app)/                 # Authenticated app routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── projects/          # Projects management
│   │   ├── keywords/          # Keyword research
│   │   ├── audits/            # SEO audits
│   │   ├── billing/           # Billing & subscriptions
│   │   └── settings/          # User settings
│   ├── auth/                  # Authentication pages
│   ├── api/                   # API routes
│   ├── contact/               # Contact form
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── app-sidebar.tsx        # App navigation
│   ├── app-header.tsx         # App header
│   └── theme-provider.tsx     # Theme provider
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── db.ts                  # Prisma client
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── docs/                      # Documentation
├── .env.example               # Environment template
├── middleware.ts              # Auth middleware
└── package.json
```

## Database Schema

### Key Models

- **User:** Authentication, profile, role, theme preference
- **Account:** OAuth accounts (Google, etc.)
- **Session:** User sessions
- **Project:** SEO projects/sites with plan tier
- **Keyword:** Tracked keywords with metrics
- **SeoAudit:** On-page audit results
- **ContentBrief:** AI-generated content outlines
- **Subscription:** Stripe subscription data
- **Integration:** Third-party service configs

## Development Workflow

### Git Branching Strategy

Use feature branches for development:

```bash
git checkout -b feature/aiseo-auth-layout
git checkout -b feature/aiseo-projects-dashboard
git checkout -b feature/aiseo-keywords-content-briefs
git checkout -b feature/aiseo-seo-audits
git checkout -b feature/aiseo-integrations
git checkout -b feature/aiseo-stripe-billing
```

See `docs/roadmap.md` for detailed development phases.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations

## Security Notes

- All sensitive values use environment variables
- Passwords are hashed with bcrypt
- Auth middleware protects all app routes
- Database queries use Prisma's prepared statements
- API routes validate input with Zod

## Support & Resources

- **Documentation:** See `docs/` folder
- **Contact:** support@archcloudsystems.com
- **Website:** https://archcloudsystems.com

## License

Proprietary - ArchCloudSystems
