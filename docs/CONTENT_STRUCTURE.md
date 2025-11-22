# Content Structure Guide

This document describes the content organization and purpose of each major page in the ArchCloud SEO application. Use this guide when updating copy, adding features, or maintaining consistency.

## Table of Contents

1. [Landing Page](#landing-page)
2. [Contact Page](#contact-page)
3. [Dashboard](#dashboard)
4. [Projects](#projects)
5. [Keyword Research](#keyword-research)
6. [SEO Audits](#seo-audits)
7. [Billing](#billing)
8. [Settings](#settings)
9. [Content Guidelines](#content-guidelines)

## Landing Page

**Location:** `app/page.tsx`

The landing page is the primary marketing page that converts visitors into users.

### Sections

1. **Header Navigation**
   - Site branding (logo + name)
   - Feature, Pricing, Contact links
   - Sign In / Get Started CTAs

2. **Hero Section**
   - Badge: "AI-Powered SEO Intelligence"
   - Main headline (from site config)
   - Value proposition description
   - Primary CTAs: Start Free Trial, Learn More
   - Trust element: "No credit card required"

3. **Features Section**
   - 4 feature cards showcasing core capabilities:
     - Keyword Research
     - Content Briefs
     - On-Page Audits
     - AI Insights
   - Each card has icon, title, and description

4. **How It Works**
   - 3-step process with numbered icons:
     1. Create Your Project
     2. Research & Analyze
     3. Optimize & Grow
   - Explains the user journey

5. **Who It's For**
   - 3 customer personas:
     - Digital Agencies
     - Content Marketers
     - SaaS Companies
   - Highlights specific use cases for each

6. **Pricing Section**
   - 3 tiered plans: Starter, Pro, Enterprise
   - Features listed with checkmarks
   - Clear pricing: $49, $149, $399/month
   - CTA buttons for each tier

7. **Footer**
   - Site branding and description
   - Product, Company, Legal link sections
   - Social media links (GitHub, Twitter)
   - Copyright notice

### Content Update Tips

- **Headline**: Update in `lib/site.ts` as `tagline`
- **Description**: Update in `lib/site.ts` as `description`
- **Feature cards**: Edit directly in `app/page.tsx` (around line 66-115)
- **Pricing**: Update amounts and features in pricing section (around line 219-323)
- **Footer links**: Controlled by `siteConfig.footer` in `lib/site.ts`

### Layout Considerations

- Hero section is fully responsive (stacks on mobile)
- Feature grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- All CTAs should remain prominently visible
- Maintain visual hierarchy with proper spacing

## Contact Page

**Location:** `app/contact/page.tsx`

Public contact form for inquiries and support requests.

### Sections

1. **Page Header**
   - Site branding
   - Back to Home and Sign In buttons

2. **Hero Content**
   - Page title: "Get In Touch"
   - Description explaining when to contact

3. **Info Cards**
   - Email Support (displays contact email)
   - Response Time (24-hour expectation)
   - Enterprise Support (upgrade path)

4. **Contact Form**
   - Fields: Name, Email, Company (optional), Message
   - Client-side validation using react-hook-form + zod
   - Loading states, success/error feedback
   - API endpoint: `/api/contact` (currently logs submissions)

### Content Update Tips

- **Contact email**: Update in `lib/site.ts` as `contact.email`
- **Response time text**: Edit in `app/contact/page.tsx` (around line 56)
- **Form validation**: Modify schema in `app/contact/contact-form.tsx`

### Future Integration

The contact form currently logs submissions. To integrate with email or CRM:

1. Add email service credentials to `.env`
2. Update `/api/contact/route.ts` to send emails
3. Common integrations: SendGrid, Resend, Mailgun, or save to database

## Dashboard

**Location:** `app/(app)/dashboard/page.tsx`

Overview page showing user's SEO performance at a glance.

### Sections

1. **Page Header**
   - Page title: "Dashboard"
   - Welcome message

2. **Metric Cards** (4-column grid)
   - Total Projects (count)
   - Keywords Tracked (count)
   - SEO Audits (count)
   - Content Briefs (count - currently placeholder)

3. **Recent Audits**
   - Lists last 5 audit results
   - Shows URL, project name, score, date
   - Empty state: "No audits yet"

4. **AI Insights**
   - Personalized recommendations (currently static)
   - Future: Pull from AI analysis

### Content Purpose

This page gives users an instant snapshot of their SEO activity. All data is pulled from the database using Prisma queries.

### Content Update Tips

- **Static insights**: Replace placeholder text with dynamic AI-generated suggestions (future feature)
- **Empty states**: Encourage users to create first project

## Projects

**Location:** `app/(app)/projects/page.tsx`

Project management page for organizing SEO campaigns by website or client.

### Sections

1. **Page Header**
   - Page title and description
   - "New Project" CTA button

2. **Project Cards**
   - Grid layout showing all user projects
   - Each card displays:
     - Project name
     - Domain
     - Keyword count
     - Audit count
     - Plan badge
   - Clickable cards (future: link to project detail page)

3. **Empty State**
   - Shows when user has no projects
   - Encourages project creation

### Content Purpose

Projects are the top-level organization unit. Users create projects for each website or client they manage.

### Content Update Tips

- **Empty state**: Clear call-to-action to create first project
- **Card design**: Maintains consistent spacing and hover effects

## Keyword Research

**Location:** `app/(app)/keywords/page.tsx`

Tool for discovering and analyzing keywords.

### Sections

1. **Page Header**
   - Title and description

2. **Search Form**
   - Seed Keyword input
   - Location selector (US, UK, Canada)
   - Language selector
   - Search button

3. **Results Area**
   - Currently shows empty state: "Enter a keyword to see results"
   - Future: Display keyword suggestions with volume, difficulty, etc.

### Content Purpose

This page helps users discover high-value keywords for their SEO strategy. Currently shows UI structure; backend integration needed.

### Future Integration

To make this functional:
1. Integrate keyword research API (e.g., SEMrush, Ahrefs, or custom)
2. Add results table with sortable columns
3. Allow saving keywords to projects

## SEO Audits

**Location:** `app/(app)/audits/page.tsx`

On-page SEO analysis tool.

### Sections

1. **Page Header**
   - Title and description

2. **Run New Audit**
   - URL input field
   - "Run Audit" button

3. **Audit History**
   - Lists previous audits
   - Empty state: "No audits yet"

### Content Purpose

Users input a URL to analyze on-page SEO factors. The audit generates a score and recommendations.

### Future Integration

To make functional:
1. Create audit API endpoint
2. Integrate with SEO analysis service or build custom analyzer
3. Store results in database
4. Display detailed results with recommendations

## Billing

**Location:** `app/(app)/billing/page.tsx`

Subscription and payment management.

### Sections

1. **Current Plan**
   - Shows active plan (currently shows "Free")
   - Upgrade prompt

2. **Plan Cards**
   - 3 pricing tiers with features
   - Upgrade buttons
   - Contact sales for Enterprise

3. **Billing History**
   - Invoices and payment records
   - Empty state when no history

### Content Purpose

Users manage their subscription tier and view billing history. Integration with Stripe for payments.

### Content Update Tips

- **Plan names and pricing**: Keep consistent with landing page
- **Feature lists**: Update when adding/removing features
- **Stripe integration**: Wire up upgrade buttons to Stripe Checkout

## Settings

**Location:** `app/(app)/settings/page.tsx`

User account and preferences management.

### Sections

Organized in tabs:

1. **Profile Tab**
   - Name and email inputs
   - Save Changes button

2. **Security Tab**
   - Change password form
   - Current password, new password, confirm password

3. **Preferences Tab**
   - Theme preference note (managed via header toggle)
   - Future: Email notifications, timezone, etc.

### Content Purpose

Users update their account information and security settings.

### Future Integration

Forms currently static. To make functional:
1. Create API endpoints for profile updates
2. Validate and update user in database
3. Handle password changes securely
4. Add more preference options as needed

## Content Guidelines

### Voice and Tone

- **Professional yet approachable**: Clear, confident, helpful
- **Action-oriented**: Use active verbs (Boost, Discover, Optimize)
- **Benefit-focused**: Emphasize outcomes, not just features
- **Concise**: Respect user's time

### Writing Best Practices

1. **Headlines**: Start with a verb or clear benefit
2. **Descriptions**: 1-2 sentences max for cards and sections
3. **CTAs**: Specific action verbs (Start Free Trial, Run Audit, Create Project)
4. **Empty states**: Always include a clear next action
5. **Error messages**: Helpful, not technical

### Consistency Checklist

When updating content:
- [ ] Product name consistent everywhere
- [ ] Pricing matches across landing and billing pages
- [ ] Feature descriptions aligned
- [ ] CTAs use consistent language
- [ ] All links functional or clearly marked as placeholders
- [ ] Mobile text is readable (not too long)

### Safe to Update

These areas can be updated without breaking functionality:
- Hero section copy
- Feature descriptions
- How It Works steps
- Who It's For personas
- Empty state messages
- Placeholder text in form inputs
- Page descriptions and headers

### Requires Caution

These areas affect functionality:
- Form field names and validation rules
- API route paths
- Navigation links (must match actual routes)
- Database field names
- Authentication logic

## Updating Copy

To update marketing copy across the site:

1. Open `lib/site.ts` for global brand text
2. Edit `app/page.tsx` for landing page sections
3. Maintain consistent messaging across all pages
4. Test on mobile to ensure text fits well
5. Check that all links still work after changes

For more technical changes, see `FRONTEND_GUIDE.md`.
