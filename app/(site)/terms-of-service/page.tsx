import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

const LAST_UPDATED = "August 12, 2026";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Terms of Service",
    description: `Terms and conditions for using ${siteConfig.name}.`,
    path: `/terms-of-service`,
    locale: "en",
    availableLocales: ["en"],
  });
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-secondary/20 py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-background rounded-xl border p-6 shadow-xs sm:p-8 dark:border-zinc-800">
          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">Terms of Service</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Agreement and Service Operator</h2>
              <p>
                These Terms govern your use of {siteConfig.name}, including our website,
                account features, AI-generated personalized songs, downloads, videos, artwork,
                subscriptions, and related services (collectively, the “Services”). The Services
                are independently operated by the individual developer behind the {siteConfig.name}
                brand. For questions, legal notices, or support, contact {siteConfig.socialLinks?.email}.
              </p>
              <p className="mt-3">
                By creating an account, purchasing a product, or using the Services, you agree to
                these Terms and our <Link className="text-primary hover:underline" href="/privacy-policy">Privacy Policy</Link> and <Link className="text-primary hover:underline" href="/refund-policy">Refund Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Eligibility and Accounts</h2>
              <p>
                You must be at least 13 years old to use the Services. If you are under the age of
                majority where you live, you may use paid Services only with a parent or legal
                guardian’s permission. You must provide accurate account information and keep your
                credentials secure. You are responsible for activity under your account and must
                notify us promptly of unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. Acceptable Use</h2>
              <p>You may not use the Services to:</p>
              <ul className="list-disc space-y-1 pl-6 mt-2">
                <li>break the law, infringe rights, or violate another person’s privacy;</li>
                <li>submit content that is abusive, hateful, sexually exploitative, fraudulent, or illegal;</li>
                <li>upload material you do not have permission to use;</li>
                <li>reverse engineer, disrupt, scrape, or attempt unauthorized access to the Services; or</li>
                <li>use the Services to create malware, spam, impersonation, or deceptive content.</li>
              </ul>
              <p className="mt-3">We may suspend or terminate accounts that violate these Terms or create security, legal, or fraud risk.</p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. AI-Generated Content</h2>
              <p>
                The Services use automated and third-party AI systems to generate drafts and
                creative outputs. Outputs may be inaccurate, incomplete, similar to other outputs,
                or unsuitable for a particular purpose. You are responsible for reviewing outputs
                before sharing, publishing, or relying on them. We do not guarantee exclusivity,
                originality, or a particular artistic result.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Purchases, Subscriptions, and Taxes</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>Prices, currency, included features, credits, and billing interval are shown at checkout.</li>
                <li>One-time purchases are charged once. Subscriptions renew automatically at the displayed interval until cancelled.</li>
                <li>By purchasing, you authorize the applicable payment provider to charge the selected payment method.</li>
                <li>Payments may be processed by Creem and, where offered, other payment providers. The provider may collect payment, fraud-prevention, tax, and transaction data under its own terms and privacy policy.</li>
                <li>You are responsible for applicable taxes unless taxes are collected and displayed at checkout.</li>
              </ul>
              <p className="mt-3">
                You may cancel a subscription through the subscription management portal made
                available after purchase. Cancellation normally takes effect at the end of the
                current paid billing period; it does not automatically create a refund. Refunds are
                governed by our <Link className="text-primary hover:underline" href="/refund-policy">Refund Policy</Link> and applicable law.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. Content and Intellectual Property</h2>
              <p>
                We retain rights in the website, software, branding, templates, and other materials
                we provide. You retain rights you already own in prompts, stories, lyrics, images,
                and other material you submit. You grant us a limited, worldwide, non-exclusive
                license to host, process, reproduce, and modify submitted material only as needed
                to provide, secure, and improve the Services. You represent that you have the rights
                needed for anything you submit.
              </p>
              <p className="mt-3">
                Subject to payment and these Terms, we grant you a non-exclusive license to use
                generated deliverables for personal and commercial purposes unless a product page
                states a different license. This license does not transfer our software, trademarks,
                or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Availability, Disclaimers, and Liability</h2>
              <p>
                The Services are provided on an “as available” basis. We may change, suspend, or
                discontinue features, including free features, and may perform maintenance. To the
                maximum extent permitted by law, we disclaim implied warranties and are not liable
                for indirect, incidental, special, consequential, or punitive damages. Our total
                liability for a claim relating to the Services will not exceed the amount you paid
                us for the relevant product during the twelve months before the event giving rise to
                the claim. Nothing in these Terms limits rights that cannot lawfully be limited.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">8. Changes and Governing Terms</h2>
              <p>
                We may update these Terms by posting a revised version with a new “Last updated”
                date. Material changes will be communicated where required by law. Your continued
                use after the effective date means you accept the updated Terms. If any provision is
                unenforceable, the remaining provisions remain effective. These Terms are governed
                by the mandatory laws applicable to you and, where permitted, the laws applicable
                to the Service operator’s principal place of business.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">9. Contact</h2>
              <p>
                Legal notices, support questions, and account requests may be sent to {" "}
                <a className="text-primary hover:underline" href={`mailto:${siteConfig.socialLinks?.email}`}>
                  {siteConfig.socialLinks?.email}
                </a>.
              </p>
            </section>
          </div>

          <Separator />
          <div className="mt-8"><Link href="/" className="text-primary hover:underline flex items-center gap-2" title="Return to Home"><HomeIcon className="size-4" /> Return to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
