import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import CookieManagementSection from "./CookieManagementSection";

export const dynamic = "force-static";
export const revalidate = false;

const LAST_UPDATED = "August 12, 2026";

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Privacy Policy",
    description: `How ${siteConfig.name} collects and uses personal information.`,
    path: `/privacy-policy`,
    locale: "en",
    availableLocales: ["en"],
  });
}

export default function PrivacyPolicyPage() {
  const email = siteConfig.socialLinks?.email;

  return (
    <div className="bg-secondary/20 py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-background rounded-xl border p-6 shadow-xs sm:p-8 dark:border-zinc-800">
          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">Privacy Policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">1. Who We Are</h2>
              <p>
                This Privacy Policy explains how {siteConfig.name} collects, uses, discloses, and
                protects personal information when you visit our website, create an account, use
                our AI song services, or purchase a product. {siteConfig.name} is independently
                operated by an individual developer, who is responsible for this Policy and can be
                contacted at <a className="text-primary hover:underline" href={`mailto:${email}`}>{email}</a>.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">2. Information We Collect</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li><strong>Account data:</strong> name, email address, avatar, authentication and account settings.</li>
                <li><strong>Content:</strong> stories, prompts, lyrics, images, song preferences, generated outputs, and files you choose to submit or store.</li>
                <li><strong>Purchase data:</strong> product, plan, subscription, transaction, refund, billing status, currency, and customer-support information. Payment card details are handled by the payment provider rather than stored by us.</li>
                <li><strong>Usage and device data:</strong> IP address, browser, operating system, device identifiers, pages viewed, timestamps, approximate location derived from IP, and security logs.</li>
                <li><strong>Communications:</strong> messages, support requests, newsletter preferences, and correspondence.</li>
                <li><strong>Browser extension drafts:</strong> when you choose to continue from the SendTheSong browser extension, the recipient, occasion, story, and music preferences you enter are stored as a one-time draft for up to 24 hours. The draft is deleted from the active flow after it is opened and cannot be recovered through the same link.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">3. How We Use Information</h2>
              <ul className="list-disc space-y-1 pl-6">
                <li>provide accounts, generate and deliver requested content, and process purchases;</li>
                <li>operate subscriptions, credits, customer support, refunds, and billing portals;</li>
                <li>secure the service, prevent fraud and abuse, troubleshoot, and enforce our Terms;</li>
                <li>improve reliability and features using aggregated or appropriately protected data;</li>
                <li>send transactional messages and, where permitted, marketing messages with unsubscribe controls; and</li>
                <li>comply with law, legal process, and legitimate requests from authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">4. Cookies and Consent</h2>
              <p>
                We use necessary cookies for authentication, security, session management, and to
                remember your Cookie Preferences. Optional analytics, advertising, and performance
                technologies are used only where legally required consent has been obtained.
              </p>
              <ul className="list-disc space-y-1 pl-6 mt-3">
                <li><strong>Necessary cookies:</strong> required for login, security, checkout-related flows, and site operation.</li>
                <li><strong>Analytics cookies:</strong> help us understand traffic and feature usage.</li>
                <li><strong>Advertising cookies:</strong> may be used to measure or personalize advertising where enabled.</li>
              </ul>
              <p className="mt-3">
                Optional cookies are not enabled until you choose “Accept Cookies.” You may choose
                “Decline Cookies” and withdraw or change your consent at any time in the Cookie
                Preferences section below. Withdrawing consent does not affect processing that is
                strictly necessary to provide the Service.
              </p>
            </section>

            <CookieManagementSection />

            <section>
              <h2 className="mb-3 text-xl font-semibold">5. Service Providers and Disclosure</h2>
              <p>We do not sell personal information. We may disclose information to:</p>
              <ul className="list-disc space-y-1 pl-6 mt-2">
                <li><strong>Payment providers:</strong> Creem and any other provider displayed at checkout may process payment, billing, tax, fraud-prevention, and refund data under their own policies.</li>
                <li><strong>Infrastructure providers:</strong> hosting, database, storage, monitoring, email, authentication, and AI providers used to deliver the Services, including providers configured in the deployment.</li>
                <li><strong>Authorities and advisers:</strong> where required by law or reasonably necessary to protect users, the Service, or our legal rights.</li>
                <li><strong>Business transfers:</strong> in connection with a merger, acquisition, financing, or sale of assets, subject to appropriate safeguards.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">6. AI and Submitted Content</h2>
              <p>
                We process submitted prompts and files to provide the requested generation and
                delivery features. Do not submit sensitive personal information about another person
                unless you have a lawful basis and permission to do so. We may use automated systems
                and processors to transform content; the Terms explain your responsibilities and
                licenses for submitted and generated content.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">7. Retention and Security</h2>
              <p>
                We retain information for as long as needed to provide the Services, maintain
                account and transaction records, resolve disputes, prevent fraud, comply with legal
                obligations, and enforce agreements. Retention periods vary by data type and purpose.
                We use reasonable technical and organizational safeguards, but no online service can
                guarantee absolute security.
              </p>
              <p className="mt-3">
                Unused browser extension drafts expire automatically after 24 hours. The extension does not collect account passwords, payment details, or browsing history; its optional local draft is stored only in your browser until you submit it, clear it, or uninstall the extension.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">8. International Transfers</h2>
              <p>
                Our providers and systems may process information in countries other than where you
                live. Where required, we use appropriate contractual, technical, or organizational
                safeguards for international transfers.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">9. Your Choices and Rights</h2>
              <p>
                Depending on your location, you may have rights to access, correct, delete, restrict,
                object to, or receive a portable copy of your personal information, and to withdraw
                consent or opt out of marketing. Email requests to {" "}
                <a className="text-primary hover:underline" href={`mailto:${email}`}>{email}</a>.
                We may verify your identity and may retain information that we must keep by law.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">10. Children</h2>
              <p>
                The Services are not directed to children under 13. If you believe a child provided
                personal information, contact us and we will take reasonable steps to investigate
                and delete it where appropriate.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">11. Updates and Contact</h2>
              <p>
                We may update this Policy by posting a revised version and changing the “Last
                updated” date. For privacy questions or rights requests, contact {" "}
                <a className="text-primary hover:underline" href={`mailto:${email}`}>{email}</a>.
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
