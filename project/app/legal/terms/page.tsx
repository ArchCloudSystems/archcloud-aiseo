import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const document = await db.document.findFirst({
    where: {
      type: "LEGAL",
      OR: [
        { title: { contains: "Terms of Service", mode: "insensitive" } },
        { title: { contains: "Terms and Conditions", mode: "insensitive" } },
        { tags: { contains: "terms", mode: "insensitive" } },
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
              <ScrollText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated:{" "}
                {document
                  ? new Date(document.updatedAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          {document && document.content ? (
            <div className="whitespace-pre-wrap">{document.content}</div>
          ) : (
            <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using ArchCloud AI SEO ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
            <p className="text-muted-foreground mb-2">
              Permission is granted to temporarily access the Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Account Terms</h2>
            <p className="text-muted-foreground mb-2">
              To access certain features of the Service, you must register for an account:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must immediately notify us of any unauthorized uses of your account</li>
              <li>We reserve the right to refuse service or terminate accounts at our discretion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
            <p className="text-muted-foreground">
              Paid plans are billed in advance on a recurring basis. Prices are subject to change with notice. Refunds are handled on a case-by-case basis. Failure to pay may result in service suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground mb-2">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or other harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Collect user data without consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are owned by ArchCloud and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. User Content</h2>
            <p className="text-muted-foreground">
              You retain all rights to content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content in connection with providing the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
            <p className="text-muted-foreground">
              Our Service may integrate with third-party services. We are not responsible for the content, privacy policies, or practices of any third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimer</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall ArchCloud be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at{" "}
              <Link href="/contact" className="text-primary hover:underline">
                our contact page
              </Link>
              .
            </p>
          </section>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
