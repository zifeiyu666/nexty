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
    title: "Refund Policy",
    description: `Refund policy for ${siteConfig.name} products and subscriptions.`,
    path: `/refund-policy`,
    locale: "en",
    availableLocales: ["en"],
  });
}

export default function RefundPolicyPage() {
  return (
    <div className="bg-secondary/20 py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-background rounded-xl border p-6 shadow-xs sm:p-8 dark:border-zinc-800">
          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">Refund Policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Scope</h2>
              <p>
                This policy applies to purchases of {siteConfig.name} digital products, AI-generated
                songs and related deliverables, credits, and subscriptions. It is part of our {" "}
                <Link className="text-primary hover:underline" href="/terms-of-service">Terms of Service</Link>.
                Mandatory consumer rights in your country always take precedence.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. When a Refund Is Available</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>We charged you incorrectly or charged you more than once.</li>
                <li>A transaction was unauthorized, subject to reasonable verification.</li>
                <li>We failed to deliver the purchased digital service or a material technical failure prevented delivery.</li>
                <li>The delivered service materially differed from the product description and we cannot reasonably correct it.</li>
                <li>Unused credits may be eligible for a refund requested within 30 days of purchase, unless the checkout or applicable law states otherwise.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. Digital Products and Used Credits</h2>
              <p>
                Once a digital deliverable has been generated, downloaded, delivered, or materially
                used, a change-of-mind refund is generally unavailable, except where required by
                law or where the service was defective or not as described. We may offer a correction,
                regeneration, credit restoration, partial refund, or full refund depending on the
                facts of the case.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Subscriptions and Cancellation</h2>
              <p>
                You may cancel a subscription at any time through the billing management portal.
                Cancellation stops future renewals and normally leaves access available until the
                end of the current paid period. Unused time in a billing period is not automatically
                refundable, except for billing errors, qualifying service failures, applicable law,
                or an approved exception under Section 2.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Not Normally Refundable</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>Change of mind after a deliverable or credits have been used.</li>
                <li>Failure caused by incorrect information, misuse, unsupported equipment, or a third-party service outside our control.</li>
                <li>Expired credits or benefits, except where required by law.</li>
                <li>Promotional purchases are subject to the same rules unless the promotion states different terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. How to Request a Refund</h2>
              <p>Contact us at <a className="text-primary hover:underline" href={`mailto:${siteConfig.socialLinks?.email}`}>{siteConfig.socialLinks?.email}</a> and include:</p>
              <ul className="list-disc space-y-1 pl-6 mt-2">
                <li>the account email used for purchase;</li>
                <li>order, transaction, or Creem reference ID;</li>
                <li>purchase date and product name; and</li>
                <li>a concise description of the issue and supporting evidence, if available.</li>
              </ul>
              <p className="mt-3">We aim to acknowledge requests within 2 business days and normally provide a decision within 10 business days.</p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Refund Method and Timing</h2>
              <p>
                Approved refunds are normally sent to the original payment method through the
                payment provider used for the transaction, including Creem where applicable. We do
                not require account credit instead of a cash refund unless you expressly agree.
                After we submit a refund, the payment provider may need additional business days to
                post it to your account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">8. Chargebacks and Legal Rights</h2>
              <p>
                Please contact us first so we can investigate billing or delivery issues. Nothing
                in this policy limits your right to contact your card issuer, payment provider, or
                a regulator, or any mandatory consumer protection right.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">9. Contact</h2>
              <p>Refund requests and questions: <a className="text-primary hover:underline" href={`mailto:${siteConfig.socialLinks?.email}`}>{siteConfig.socialLinks?.email}</a>.</p>
            </section>
          </div>

          <Separator />
          <div className="mt-8"><Link href="/" className="text-primary hover:underline flex items-center gap-2" title="Return to Home"><HomeIcon className="size-4" /> Return to Home</Link></div>
        </div>
      </div>
    </div>
  );
}
