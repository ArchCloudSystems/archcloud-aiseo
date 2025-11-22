# ArchCloud SEO

**AI-Powered SEO Platform for Modern Businesses**

A production-ready SaaS application for SEO professionals, digital agencies, and content marketers. Built with modern web technologies and best practices, featuring keyword research, content optimization, on-page auditing, and AI-driven insights.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)

## Overview

ArchCloud SEO is a full-stack SEO management platform that helps users improve search engine rankings through intelligent keyword research, automated audits, and AI-generated content recommendations.

**Key Features:**
- User authentication with email/password and Google OAuth
- Multi-project organization for clients or websites
- Keyword research and tracking
- On-page SEO audits with AI recommendations
- Content brief generation
- Subscription billing with Stripe (3 pricing tiers)
- Responsive, mobile-friendly dashboard
- Light/dark theme support

**Live Demo:** [ai.archcloudsystems.com](https://ai.archcloudsystems.com)

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - Latest React features

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide Icons** - Beautiful, consistent icons

### Authentication
- **NextAuth.js v5** - Authentication for Next.js
- **Prisma Adapter** - Database session management
- **Google OAuth** - Social authentication
- **bcryptjs** - Password hashing

### Database
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Production database
- **Migration System** - Version-controlled schema

### Payments
- **Stripe** - Subscription billing
- **Stripe Webhooks** - Payment event handling
- **3 Pricing Tiers** - Starter, Pro, Enterprise

### Forms & Validation
- **react-hook-form** - Performant form management
- **zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

## Project Structure

```
archcloud-aiseo/
├── app/
│   ├── (app)/              # Authenticated routes
│   │   ├── layout.tsx      # App shell with sidebar
│   │   ├── dashboard/      # Overview page
│   │   ├── projects/       # Project management
│   │   ├── keywords/       # Keyword research
│   │   ├── audits/         # SEO audits
│   │   ├── billing/        # Subscription management
│   │   └── settings/       # User settings
│   ├── api/
│   │   ├── auth/           # NextAuth endpoints
│   │   └── contact/        # Contact form API
│   ├── auth/               # Sign in/up pages
│   ├── contact/            # Contact page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── app-header.tsx      # Top navigation
│   ├── app-sidebar.tsx     # Side navigation
│   └── theme-provider.tsx  # Dark mode provider
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── site.ts             # Site configuration
│   └── utils.ts            # Utility functions
├── prisma/
│   └── schema.prisma       # Database schema
├── docs/                   # Documentation
│   ├── FRONTEND_GUIDE.md   # Frontend development guide
│   ├── CONTENT_STRUCTURE.md # Content organization
│   ├── roadmap.md          # Development roadmap
│   └── server-setup.md     # Deployment guide
└── public/                 # Static assets
```

## Features

### Authentication & Authorization
- Email/password registration and login
- Google OAuth integration
- Protected routes with middleware
- Session management with Prisma adapter
- Password reset flow ready

### Dashboard
- Project count, keyword tracking, audit history
- Recent activity feed
- AI-powered insights and recommendations
- Quick access to all features

### Project Management
- Create and organize SEO projects
- Associate keywords and audits with projects
- Track metrics per project
- Client management for agencies

### Keyword Research
- Discover high-value keywords
- Volume and difficulty metrics
- Location and language targeting
- Save keywords to projects
- Track ranking changes over time

### SEO Audits
- On-page SEO analysis
- Technical SEO checks
- Content optimization suggestions
- AI-powered recommendations
- Historical audit tracking

### Billing & Subscriptions
- **Starter Plan** - $49/month - 3 projects, 500 keywords
- **Pro Plan** - $149/month - 10 projects, 2,000 keywords
- **Enterprise Plan** - $399/month - Unlimited everything
- Stripe integration for payments
- Subscription management
- Invoice history

### User Settings
- Profile management
- Password changes
- Theme preferences (light/dark)
- Email notifications (planned)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- PostgreSQL database
- Package manager: npm or pnpm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd archcloud-aiseo
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# App
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/archcloud_seo

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Google OAuth (optional, get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...
```

### 4. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma generate
npx prisma migrate dev
```

To view and edit data in a GUI:

```bash
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Build for Production

```bash
npm run build
npm run start
```

## Branding & Customization

All branding is centralized in `lib/site.ts`:

```typescript
export const siteConfig = {
  name: "ArchCloud SEO",
  tagline: "AI-Powered SEO Platform for Modern Businesses",
  companyName: "ArchCloudSystems LLC",
  // ... logo, favicon, navigation, etc.
};
```

### How to Rebrand

1. **Site Name**: Edit `siteConfig.name` in `lib/site.ts`
2. **Logo**: Replace `public/logo.svg` with your logo
3. **Favicon**: Replace `public/favicon.ico` with your icon
4. **Colors**: Modify Tailwind theme in `tailwind.config.js`
5. **Content**: Update landing page copy in `app/page.tsx`

See `docs/FRONTEND_GUIDE.md` for detailed customization instructions.

## Database Schema

### Key Models

- **User** - Authentication, profile, settings
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **Project** - SEO projects/websites
- **Keyword** - Tracked keywords with metrics
- **SeoAudit** - On-page audit results
- **ContentBrief** - AI-generated content outlines
- **Subscription** - Stripe subscription data

Run `npx prisma studio` to explore the database visually.

## API Routes

- `POST /api/auth/[...nextauth]` - Authentication endpoints
- `POST /api/auth/register` - User registration
- `POST /api/contact` - Contact form submission

## Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate Prisma Client

# Stack Validation
npm run check:stack      # Ensure no Supabase references
```

## Deployment

### VPS Deployment (Current Setup)

The application runs on a VPS behind Nginx, proxied on port 3001.

#### Build and Deploy

```bash
# On the server
cd /path/to/archcloud-aiseo
git pull origin main
npm install
npm run build

# Start with PM2
pm2 start "npm run start -- -p 3001" --name aiseo
pm2 save
pm2 startup
```

#### Nginx Configuration

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

### Alternative: Vercel Deployment

This app is Vercel-ready:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables in Production

Ensure all required environment variables are set in your hosting platform. Never commit secrets to version control.

## Documentation

- **[Frontend Guide](docs/FRONTEND_GUIDE.md)** - UI development, layouts, components
- **[Content Structure](docs/CONTENT_STRUCTURE.md)** - Page organization, copy guidelines
- **[Roadmap](docs/roadmap.md)** - Development phases and feature plans
- **[Server Setup](docs/server-setup.md)** - VPS deployment instructions

## Development Workflow

### Git Branching

Use feature branches for development:

```bash
git checkout -b feature/new-feature-name
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature-name
```

Merge to `main` or `dev` branch via pull requests.

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for formatting (recommended)
- Follow existing patterns in the codebase

## Security

- Passwords hashed with bcryptjs
- NextAuth handles session security
- Protected routes via middleware
- Prisma prevents SQL injection
- Environment variables for secrets
- HTTPS in production (via Nginx)

## Performance

- React Server Components for faster loads
- Image optimization with Next.js Image
- Automatic code splitting
- Route prefetching
- Tailwind CSS purging for minimal CSS

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- **Email**: support@archcloudsystems.com
- **Documentation**: See `docs/` folder
- **Issues**: Open an issue on GitHub

## License

Proprietary - ArchCloudSystems LLC

All rights reserved. This software is not open source and may not be redistributed without permission.

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe](https://stripe.com/)

---

**ArchCloud SEO** - Empowering businesses with AI-driven SEO intelligence.
