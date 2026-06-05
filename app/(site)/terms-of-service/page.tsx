import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { HomeIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

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
          <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
            Terms of Service
          </h1>

          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">Introduction</h2>
              <p className="mb-3">
                Welcome to {siteConfig.name} (hereinafter referred to as "we",
                "our platform", or {siteConfig.name}). The following Terms of
                Service ("Terms") set forth the conditions for your access to
                and use of the {siteConfig.name}
                website, services, and products. By using our services, you
                agree to these Terms. Please read them carefully.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Account Registration
              </h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  1. Account Creation
                </h3>
                <p className="mb-3">
                  When using certain services, you may need to create an
                  account. You commit to providing accurate, complete, and
                  up-to-date information. You are responsible for maintaining
                  the security of your account, including protecting your
                  password and limiting access to your computer.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Account Responsibility
                </h3>
                <p className="mb-3">
                  You are responsible for all activities that occur under your
                  account, whether or not these activities are authorized by
                  you. If you suspect unauthorized use of your account, you must
                  notify us immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Conditions of Service Use
              </h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">1. Lawful Use</h3>
                <p className="mb-3">
                  You agree not to use our services for any illegal or
                  unauthorized activities, including but not limited to:
                </p>
                <ul className="mb-3 list-disc space-y-1 pl-6">
                  <li>Violating any applicable laws, regulations, or rules</li>
                  <li>
                    Infringing on the intellectual property rights, privacy
                    rights, or other rights of third parties
                  </li>
                  <li>Distributing malware, viruses, or other harmful code</li>
                  <li>
                    Attempting unauthorized access to our systems or other
                    users' accounts
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Service Modifications and Termination
                </h3>
                <p className="mb-3">
                  We reserve the right to modify or terminate parts or all of
                  the services at any time, with or without prior notice. We are
                  not liable to you or any third party for any modification,
                  suspension, or termination of the services.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  3. Usage Limitations
                </h3>
                <p className="mb-3">
                  Some service features may be subject to usage limitations,
                  especially for free services or during trial periods.
                  Exceeding these limitations may require upgrading to a paid
                  plan or waiting until the next reset period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Payment Terms</h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  1. Pricing and Subscriptions
                </h3>
                <p className="mb-3">
                  We offer various service plans, each with different features
                  and pricing. Subscription prices and terms are clearly listed
                  on our website. We reserve the right to change prices at any
                  time, but will provide advance notice to existing subscribers.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Payment Processing
                </h3>
                <p className="mb-3">
                  Payments are processed through our third-party payment
                  processors (such as Stripe). You agree to provide accurate
                  payment information and authorize us to charge your payment
                  method.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  3. Cancellations and Refunds
                </h3>
                <p className="mb-3">
                  You may cancel your subscription at any time, and cancellation
                  will take effect at the end of the current billing cycle.
                  Unless required by local law or otherwise specified in our
                  refund policy, payments are generally non-refundable.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Intellectual Property
              </h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">1. Our Content</h3>
                <p className="mb-3">
                  All content on {siteConfig.name}, including but not limited to
                  code, designs, text, graphics, interfaces, logos, images, and
                  software, is owned by us or our content providers and is
                  protected by copyright, trademark, and other intellectual
                  property laws.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">2. Your Content</h3>
                <p className="mb-3">
                  For content you upload, submit, store, or post on our
                  services, you retain all rights. You grant us a worldwide,
                  royalty-free, non-exclusive license to use, reproduce, modify,
                  create derivative works from, distribute, and display such
                  content, but only for the purpose of providing services to
                  you.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">3. Feedback</h3>
                <p className="mb-3">
                  For any feedback, comments, or suggestions you provide about
                  our services, you grant us the right to use such feedback
                  without restriction and without compensation to you.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Disclaimers</h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  1. Services Provided "As Is"
                </h3>
                <p className="mb-3">
                  Our services are provided "as is" and "as available" without
                  warranties of any kind, either express or implied. We do not
                  guarantee that our services will be error-free, secure, or
                  uninterrupted.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Third-Party Links and Services
                </h3>
                <p className="mb-3">
                  Our services may contain links to third-party websites or
                  services, or integrate third-party functionality. We are not
                  responsible for any third-party content, websites, products,
                  or services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">
                Limitation of Liability
              </h2>
              <p className="mb-3">
                To the maximum extent permitted by law, {siteConfig.name} and
                its suppliers, partners, and licensors will not be liable for
                any indirect, incidental, special, consequential, or punitive
                damages, including but not limited to loss of profits, loss of
                data, business interruption, or other commercial damages.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">General Provisions</h2>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  1. Entire Agreement
                </h3>
                <p className="mb-3">
                  These Terms constitute the entire agreement between you and
                  {siteConfig.name} regarding the use of our services and
                  supersede all prior or contemporaneous communications,
                  proposals, and understandings, whether oral or written.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  2. Modification of Terms
                </h3>
                <p className="mb-3">
                  We may modify these Terms from time to time. Modified Terms
                  will be effective when posted on the website. Your continued
                  use of our services indicates your acceptance of the modified
                  Terms.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="mb-3 text-lg font-medium">
                  3. Contact Information
                </h3>
                <p className="mb-3">
                  If you have any questions or comments about these Terms,
                  please contact us:
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
                <p className="mb-3">Thank you for using {siteConfig.name}!</p>
              </div>
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
