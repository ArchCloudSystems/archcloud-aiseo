import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const document = await db.document.findFirst({
    where: {
      type: "LEGAL",
      OR: [
        { title: { contains: "Privacy Policy", mode: "insensitive" } },
        { tags: { contains: "privacy-policy", mode: "insensitive" } },
      ],
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Home
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              {document && (
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated:{" "}
                  {new Date(document.updatedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          {document && document.content ? (
            <div className="whitespace-pre-wrap">{document.content}</div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Privacy Policy Not Configured
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                This organization has not yet configured their Privacy Policy.
                If you are an administrator, please create a Privacy Policy
                document in the Documents section.
              </p>
              <Link
                href="/documents"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                Go to Documents →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
