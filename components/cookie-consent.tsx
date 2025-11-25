"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const CONSENT_COOKIE_NAME = "cookie-consent";
const CONSENT_VERSION = "1.0";

type ConsentPreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
};

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const storedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
        if (storedConsent) {
          const consent: ConsentPreferences = JSON.parse(storedConsent);
          if (consent.version === CONSENT_VERSION) {
            setIsVisible(false);
            applyConsent(consent);
          } else {
            setIsVisible(true);
          }
        } else {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error reading cookie consent:", error);
        setIsVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  function applyConsent(preferences: ConsentPreferences) {
    if (preferences.analytics) {
      initializeAnalytics();
    }

    if (preferences.marketing) {
      initializeMarketing();
    }
  }

  function initializeAnalytics() {
    if (typeof window === "undefined") return;
  }

  function initializeMarketing() {
    if (typeof window === "undefined") return;
  }

  function saveConsent(preferences: ConsentPreferences) {
    try {
      localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(preferences));
      applyConsent(preferences);
      setIsVisible(false);
    } catch (error) {
      console.error("Error saving cookie consent:", error);
    }
  }

  function acceptAll() {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
    });
  }

  function declineNonEssential() {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      version: CONSENT_VERSION,
    });
  }

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="mx-auto max-w-4xl border-2 shadow-2xl">
        <div className="relative p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={declineNonEssential}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Cookie & Privacy Settings
                </h2>
                <p className="text-sm text-muted-foreground">
                  We use cookies to provide essential site functionality, improve
                  your experience, and analyze how our site is used. By clicking
                  "Accept All", you consent to our use of cookies for essential,
                  functional, and analytics purposes.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-4 w-4 rounded border border-primary bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground">✓</span>
                  </div>
                  <div>
                    <strong className="font-medium">Essential cookies</strong>
                    <span className="text-muted-foreground">
                      {" "}
                      - Required for authentication and core app functionality
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-4 w-4 rounded border" />
                  <div>
                    <strong className="font-medium">Analytics cookies</strong>
                    <span className="text-muted-foreground">
                      {" "}
                      - Help us understand usage patterns and improve our service
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button onClick={acceptAll} className="sm:min-w-[120px]">
                  Accept All
                </Button>
                <Button
                  variant="outline"
                  onClick={declineNonEssential}
                  className="sm:min-w-[120px]"
                >
                  Essential Only
                </Button>
                <Link
                  href="/legal/cookie-policy"
                  className="text-sm text-muted-foreground hover:underline ml-2"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
