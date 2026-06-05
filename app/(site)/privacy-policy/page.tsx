import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import CookieManagementSection from "./CookieManagementSection";

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: "Privacy Policy",
    description: `How ${siteConfig.name} collect and use your information.`,
    path: `/privacy-policy`,
    locale: "en",
    availableLocales: ["en"],
  });
}

export default function PrivacyPolicyPage() {
  const COOKIE_CONSENT_ENABLED =
    process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENABLED === "true";

  return (
    <div className="bg-secondary/20 py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-background rounded-xl border p-6 shadow-xs sm:p-8 dark:border-zinc-800">
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
            Privacy Policy
          </h1>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Introduction</h2>
              <p className="mb-3">
                Welcome to {siteConfig.name} (hereinafter referred to as "we",
                "our platform" or "{siteConfig.name}"). We are committed to
                protecting your privacy and personal information. This Privacy
                Policy aims to clearly explain how we collect, use, store, and
                protect your personal information. By using our services,
                website, or products, you agree to the practices described in
                this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Information We Collect
              </h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  1. Information You Provide Directly
                </h3>
                <p className="mb-3">
                  When you use our services, we may collect the following types
                  of information:
                </p>
                <ul className="mb-3 list-disc space-y-1 pl-6">
                  <li>
                    <strong>Account Information</strong>: Including your name,
                    email address, avatar, and other information you provide
                    when registering or updating your account
                  </li>
                  <li>
                    <strong>Payment Information</strong>: If you purchase our
                    paid services, we collect necessary payment details through
                    secure third-party payment processors (such as Stripe)
                  </li>
                  <li>
                    <strong>Contact Information</strong>: Information you
                    provide when communicating with us via email, forms, or
                    other means
                  </li>
                  <li>
                    <strong>Subscription Information</strong>: Email address and
                    preferences when you subscribe to our mailing list
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Anonymous Information Collected Automatically
                </h3>
                <p className="mb-3">
                  When you visit or use our services, we may automatically
                  collect anonymous information:
                </p>
                <ul className="mb-3 list-disc space-y-1 pl-6">
                  <li>
                    <strong>Device Information</strong>: Including your IP
                    address, browser type, operating system, and device
                    identifiers
                  </li>
                  <li>
                    <strong>Usage Data</strong>: Information about how you use
                    our services, including access times, pages viewed, and
                    interaction methods
                  </li>
                  <li>
                    <strong>Cookies and Similar Technologies</strong>: We use
                    cookies and similar technologies to collect information and
                    enhance your user experience
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                How We Use Your Information
              </h2>
              <p className="mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Providing Services</strong>: Managing your account,
                  processing transactions, providing customer support, and
                  delivering the core functionality of our website and services
                </li>
                <li>
                  <strong>Improving Services</strong>: Analyzing usage patterns,
                  optimizing user experience and features, and developing new
                  functionalities
                  {COOKIE_CONSENT_ENABLED &&
                    " (only with your consent for analytics cookies)"}
                </li>
                <li>
                  <strong>Communication</strong>: Contacting you regarding your
                  account, service changes, new features, or related products
                </li>
                <li>
                  <strong>Security</strong>: Detecting, preventing, and
                  addressing fraud, abuse, and security issues
                </li>
                <li>
                  <strong>Marketing</strong>: Sending relevant product updates,
                  tutorials, and promotional information (if you have opted to
                  receive them)
                  {COOKIE_CONSENT_ENABLED &&
                    ", and displaying relevant advertisements (only with your consent for advertising cookies)"}
                </li>
              </ul>
              {COOKIE_CONSENT_ENABLED && (
                <p className="mb-3 text-sm text-muted-foreground">
                  <strong>Note:</strong> When cookie consent is enabled, certain
                  data processing activities (such as analytics and advertising)
                  only occur with your explicit consent. You can manage these
                  preferences in the Cookie Preferences section above.
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Information Sharing
              </h2>
              <p className="mb-3">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Service Providers</strong>: With third-party service
                  providers who perform services on our behalf, such as payment
                  processing (Stripe), cloud storage (Supabase, Cloudflare R2),
                  and email services (Resend)
                </li>
                <li>
                  <strong>Compliance and Legal Requirements</strong>: When we
                  believe in good faith that disclosure is required by law or to
                  protect our rights and security or those of others
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Data Storage and Security
              </h2>
              <p className="mb-3">
                We implement reasonable technical and organizational measures to
                protect your personal information:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6">
                <li>
                  All payment information is processed through secure payment
                  processors like Stripe; we do not directly store complete
                  payment card details
                </li>
                <li>We use SSL/TLS encryption to protect data transmission</li>
                <li>
                  We regularly review our information collection, storage, and
                  processing practices, including physical security measures
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Your Rights and Choices
              </h2>
              <p className="mb-3">
                Depending on applicable laws in your region, you may have the
                following rights:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6">
                <li>
                  <strong>Access</strong>: Obtain a copy of your personal
                  information that we hold
                </li>
                <li>
                  <strong>Correction</strong>: Update or correct your personal
                  information
                </li>
                <li>
                  <strong>Deletion</strong>: Request deletion of your personal
                  information in certain circumstances
                </li>
                <li>
                  <strong>Objection</strong>: Object to our processing of your
                  personal information
                </li>
                <li>
                  <strong>Restriction</strong>: Request that we limit the
                  processing of your personal information
                </li>
                <li>
                  <strong>Data Portability</strong>: Obtain an electronic copy
                  of information you have provided to us
                </li>
              </ul>
            </section>

            <CookieManagementSection />

            <section>
              <h2 className="mb-3 text-xl font-semibold">Cookie Policy</h2>
              <p className="mb-3">
                We use cookies and similar technologies to collect information
                and improve your experience. Cookies are small text files placed
                on your device that help us provide a better user experience.
              </p>

              {COOKIE_CONSENT_ENABLED ? (
                <>
                  <p className="mb-3">
                    <strong>Cookie Consent Management:</strong> We have
                    implemented a cookie consent system that allows you to
                    control which cookies are used on our website. You can
                    manage your preferences using the Cookie Preferences section
                    above.
                  </p>

                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-medium">
                      Essential Cookies
                    </h3>
                    <p className="mb-3">
                      These cookies are necessary for the website to function
                      and cannot be disabled:
                    </p>
                    <ul className="mb-3 list-disc space-y-1 pl-6">
                      <li>
                        <strong>cookieConsent</strong>: Stores your cookie
                        consent preferences (expires after 1 year)
                      </li>
                      <li>
                        <strong>Authentication Cookies</strong>: Required for
                        user login and session management
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="mb-3 text-lg font-medium">
                      Optional Cookies (Require Consent)
                    </h3>
                    <p className="mb-3">
                      These cookies are only used if you have given your
                      consent:
                    </p>
                    <ul className="mb-3 list-disc space-y-1 pl-6">
                      <li>
                        <strong>Analytics Cookies</strong>: Google Analytics,
                        Plausible Analytics, and Baidu Analytics to understand
                        website usage
                      </li>
                      <li>
                        <strong>Advertising Cookies</strong>: Google AdSense for
                        displaying relevant advertisements
                      </li>
                      <li>
                        <strong>Performance Cookies</strong>: Help us analyze
                        and improve website performance
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-3">The types of cookies we use include:</p>
                  <ul className="mb-3 list-disc space-y-1 pl-6">
                    <li>
                      <strong>Necessary Cookies</strong>: Essential for the
                      basic functionality of the website, including
                      authentication and session management
                    </li>
                    <li>
                      <strong>Analytics Cookies</strong>: Help us understand how
                      visitors interact with the website through Google
                      Analytics, Plausible Analytics, and Baidu Analytics
                    </li>
                    <li>
                      <strong>Advertising Cookies</strong>: Used by Google
                      AdSense to display relevant advertisements
                    </li>
                    <li>
                      <strong>Performance Cookies</strong>: Help us analyze and
                      improve website performance
                    </li>
                  </ul>
                </>
              )}

              <p className="mb-3">
                You can control or delete cookies by changing your browser
                settings. Please note that disabling certain cookies may affect
                your experience on our website.
                {COOKIE_CONSENT_ENABLED &&
                  " Additionally, you can use the Cookie Preferences section above to manage your consent for optional cookies."}
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Children's Privacy</h2>
              <p className="mb-3">
                Our services are not directed to children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If you discover that we may have collected personal
                information from a child under 13, please contact us, and we
                will promptly take steps to delete that information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                International Data Transfers
              </h2>
              <p className="mb-3">
                We may process and store your personal information globally,
                including in countries outside your country of residence. In
                such cases, we will take appropriate measures to ensure your
                personal information receives adequate protection.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Updates to This Privacy Policy
              </h2>
              <p className="mb-3">
                We may update this Privacy Policy from time to time. When we
                make significant changes, we will post the revised policy on our
                website and update the "Last Updated" date at the top. We
                encourage you to review this policy periodically to stay
                informed about how we protect your information.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Contact Us</h2>
              <p className="mb-3">
                If you have any questions, comments, or requests regarding this
                Privacy Policy or our privacy practices, please contact us
                through:
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-6">
                {siteConfig.socialLinks?.discord && (
                  <li>
                    <strong>Discord</strong>:{" "}
                    <a
                      href={siteConfig.socialLinks.discord}
                      className="text-primary hover:underline"
                    >
                      Discord
                    </a>
                  </li>
                )}
                {siteConfig.socialLinks?.email && (
                  <li>
                    <strong>Email</strong>:{" "}
                    <a
                      href={`mailto:${siteConfig.socialLinks.email}`}
                      className="hover:underline text-blue-500"
                    >
                      {siteConfig.socialLinks.email}
                    </a>
                  </li>
                )}
              </ul>
              <p className="mb-3">
                We will respond to your inquiries as soon as possible.
              </p>
            </section>
          </div>

          <Separator />

          <div className="mt-8">
            <Link
              href="/"
              className="text-primary hover:underline flex items-center gap-2"
              title="Return to Home"
            >
              <HomeIcon className="size-4" /> Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
