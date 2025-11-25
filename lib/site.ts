export const siteConfig = {
  name: "ArchCloud SEO",
  tagline: "AI-Powered SEO Platform for Modern Businesses",
  description: "Boost your search rankings with intelligent keyword research, AI-generated content briefs, and automated on-page SEO audits.",
  companyName: "ArchCloudSystems LLC",

  logo: {
    src: "/logo.svg",
    alt: "ArchCloud SEO Logo"
  },

  favicon: "/favicon.ico",

  url: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000",

  contact: {
    email: "support@archcloudsystems.com",
    supportUrl: "/contact"
  },

  social: {
    github: "https://github.com/archcloudsystems",
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER_URL || "https://twitter.com/archcloud",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL,
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL,
  },

  nav: {
    public: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Contact", href: "/contact" },
    ],
    app: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Projects", href: "/projects", icon: "FolderOpen" },
      { label: "Keyword Research", href: "/keywords", icon: "Search" },
      { label: "SEO Audits", href: "/audits", icon: "BarChart3" },
      { label: "Billing", href: "/billing", icon: "CreditCard" },
      { label: "Settings", href: "/settings", icon: "Settings" },
    ]
  },

  footer: {
    sections: [
      {
        title: "Product",
        links: [
          { label: "Features", href: "/#features" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Sign Up", href: "/auth/signup" },
        ]
      },
      {
        title: "Company",
        links: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Contact", href: "/contact" },
        ]
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", href: "/legal/privacy-policy" },
          { label: "Cookie Policy", href: "/legal/cookie-policy" },
          { label: "Terms of Service", href: "/legal/terms" },
        ]
      }
    ]
  }
};
