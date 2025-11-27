import Link from "next/link";
import { Twitter, Linkedin, Instagram, Facebook, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site";

const socialLinks = [
  {
    name: "Twitter",
    icon: Twitter,
    url: process.env.NEXT_PUBLIC_SOCIAL_TWITTER_URL,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL,
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL,
  },
].filter((link) => link.url);

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">{siteConfig.name}</h3>
            <p className="text-sm text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookie-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {socialLinks.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      aria-label={link.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
