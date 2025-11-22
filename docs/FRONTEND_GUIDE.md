# Frontend Development Guide

This guide explains the frontend architecture of ArchCloud SEO and how to customize and extend the UI.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layout Structure](#layout-structure)
3. [Navigation System](#navigation-system)
4. [Branding Configuration](#branding-configuration)
5. [Adding New Pages](#adding-new-pages)
6. [Styling Guidelines](#styling-guidelines)
7. [Mobile Responsiveness](#mobile-responsiveness)

## Architecture Overview

The application uses Next.js 16 with the App Router and follows a clear separation between public and authenticated areas:

```
app/
├── (app)/              # Authenticated app routes
│   ├── layout.tsx      # App layout with sidebar + header
│   ├── dashboard/
│   ├── projects/
│   ├── keywords/
│   ├── audits/
│   ├── billing/
│   └── settings/
├── auth/               # Authentication pages
├── contact/            # Public contact page
├── layout.tsx          # Root layout
└── page.tsx            # Public landing page
```

### Public vs Authenticated Layouts

- **Root Layout** (`app/layout.tsx`): Provides global styles, fonts, and theme provider
- **Public Pages** (`app/page.tsx`, `app/contact/page.tsx`): Include their own headers and footers
- **App Layout** (`app/(app)/layout.tsx`): Wraps authenticated pages with sidebar navigation and top header

## Layout Structure

### Root Layout (`app/layout.tsx`)

The root layout provides:
- Font configuration (Inter)
- Global CSS imports
- Theme provider for light/dark mode
- Metadata configuration using `lib/site.ts`

### App Layout (`app/(app)/layout.tsx`)

The authenticated app layout provides:
- Session protection (redirects to signin if not authenticated)
- Mobile-responsive flex layout
- AppSidebar component (collapsible on mobile)
- AppHeader component with search and user menu
- Main content area with proper scrolling

## Navigation System

### Sidebar Navigation

Located in `components/app-sidebar.tsx`, the sidebar:
- Shows navigation links for authenticated users
- Automatically highlights the active route
- Collapses on mobile with a hamburger menu
- Uses site configuration for consistent branding

**Routes are defined directly in the component:**

```typescript
const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Projects", icon: FolderOpen, href: "/projects" },
  // ... etc
];
```

### Header Navigation

Located in `components/app-header.tsx`, the header includes:
- Global search input
- Theme toggle (light/dark mode)
- User avatar dropdown with profile menu

### Public Navigation

Public pages (`app/page.tsx`) include their own header with:
- Links to Features, Pricing, Contact
- Sign In and Get Started CTAs
- Mobile-responsive navigation

## Branding Configuration

All branding is centralized in `lib/site.ts`:

```typescript
export const siteConfig = {
  name: "ArchCloud SEO",
  tagline: "AI-Powered SEO Platform for Modern Businesses",
  description: "...",
  companyName: "ArchCloudSystems LLC",
  logo: { src: "/logo.svg", alt: "..." },
  favicon: "/favicon.ico",
  // ... navigation, footer, social links
};
```

### How to Change Branding

1. **Site Name & Tagline**: Edit `lib/site.ts` - changes apply everywhere
2. **Logo**:
   - Add your logo to `public/logo.svg`
   - Update `siteConfig.logo.src` if using a different filename
3. **Favicon**: Replace `public/favicon.ico` with your icon
4. **Colors**: Modify Tailwind theme in `tailwind.config.js` (if needed)

The site config is used in:
- Page metadata (title, description)
- Landing page hero section
- Sidebar and header branding
- Footer content

## Adding New Pages

### Adding an Authenticated Page

1. Create a new folder under `app/(app)/`:
   ```bash
   mkdir app/(app)/my-feature
   ```

2. Create `page.tsx`:
   ```tsx
   export default function MyFeaturePage() {
     return (
       <div className="space-y-8">
         <div>
           <h1 className="text-3xl font-bold">My Feature</h1>
           <p className="text-muted-foreground">Description here</p>
         </div>
         {/* Content */}
       </div>
     );
   }
   ```

3. Add a navigation link in `components/app-sidebar.tsx`:
   ```typescript
   {
     label: "My Feature",
     icon: YourIcon,
     href: "/my-feature",
   }
   ```

### Adding a Public Page

1. Create folder in `app/`:
   ```bash
   mkdir app/my-page
   ```

2. Include your own header/footer or use the landing page structure as a template

## Styling Guidelines

### UI Component Library

The project uses **shadcn/ui** components with Tailwind CSS. All UI components are in `components/ui/`.

**Common components:**
- `Button` - Primary, secondary, ghost, outline variants
- `Card` - Container with header, content sections
- `Input` / `Textarea` - Form inputs
- `Select` - Dropdown selects
- `Tabs` - Tabbed interfaces
- `DropdownMenu` - Context menus

### Tailwind Classes

Follow these patterns for consistency:

**Spacing:**
```tsx
<div className="space-y-8">        {/* Vertical spacing between children */}
<div className="p-6">              {/* Padding */}
<div className="gap-4">            {/* Gap in flex/grid */}
```

**Responsive Design:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="hidden md:flex">   {/* Show on desktop only */}
<div className="flex-col sm:flex-row"> {/* Stack on mobile, row on desktop */}
```

**Colors:**
```tsx
className="text-muted-foreground"    {/* Subdued text */}
className="bg-primary text-primary-foreground" {/* Primary buttons */}
className="hover:text-primary"       {/* Hover states */}
```

### Button Variants

```tsx
<Button>Primary Action</Button>
<Button variant="ghost">Secondary</Button>
<Button variant="outline">Outlined</Button>
<Button variant="destructive">Delete</Button>
<Button size="lg">Large Button</Button>
<Button size="sm">Small Button</Button>
```

## Mobile Responsiveness

### Sidebar on Mobile

The sidebar is hidden by default on mobile and can be toggled with a hamburger button:

- Slides in from the left
- Overlay backdrop closes the menu
- Auto-closes when a link is clicked

### Breakpoints

- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

### Mobile-First Patterns

Always design mobile-first, then enhance for larger screens:

```tsx
{/* Mobile: stack vertically, Desktop: 3 columns */}
<div className="grid gap-4 md:grid-cols-3">

{/* Mobile: full width, Desktop: max width */}
<div className="w-full sm:w-auto">

{/* Hide on mobile, show on desktop */}
<nav className="hidden md:flex">
```

## Theme System

The app supports light and dark mode via `next-themes`:

- Toggle in the app header (sun/moon icon)
- Uses `ThemeProvider` in root layout
- System preference detection enabled
- Theme persists across sessions

**Using theme-aware colors:**
```tsx
className="bg-background text-foreground"    {/* Adapts to theme */}
className="border-border"                     {/* Theme-aware borders */}
className="bg-muted text-muted-foreground"   {/* Subdued backgrounds */}
```

## Best Practices

1. **Reuse shadcn/ui components** - Don't reinvent the wheel
2. **Follow existing patterns** - Look at similar pages for consistency
3. **Use the site config** - Pull branding from `lib/site.ts`
4. **Test on mobile** - Always check responsive behavior
5. **Maintain accessibility** - Use semantic HTML, proper labels, ARIA attributes
6. **Keep files focused** - Split large components into smaller pieces

## Next Steps

- See `CONTENT_STRUCTURE.md` for content and copy guidelines
- Check `roadmap.md` for planned features
- Review `README.md` for setup and deployment
