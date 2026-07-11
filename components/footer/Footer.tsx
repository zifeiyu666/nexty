import { Newsletter } from "@/components/footer/Newsletter";
import { TwitterX } from "@/components/social-icons/icons";
import { siteConfig } from "@/config/site";
import { Link as I18nLink } from "@/i18n/routing";
import {
  getArticleNavigationLinks,
  withArticleFooterLinks,
} from "@/lib/cms/article-navigation";
import { cn } from "@/lib/utils";
import { FooterLink } from "@/types/common";
import { GithubIcon, InstagramIcon, MailIcon, Youtube } from "lucide-react";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiDiscord, SiTiktok } from "react-icons/si";

export default async function Footer() {
  const locale = await getLocale();
  const [messages, t, tFooter, articleLinks] = await Promise.all([
    getMessages(),
    getTranslations("Home"),
    getTranslations("Footer"),
    getArticleNavigationLinks(locale),
  ]);

  const footerLinks = withArticleFooterLinks(
    tFooter.raw("Links.groups") as FooterLink[],
    articleLinks
  );

  return (
    <div className="home-warm-ambient-soft relative overflow-hidden border-t border-white/10 text-white/68">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(18,11,9,0.08),rgba(18,11,9,0.42))]"
      />
      <footer className="container relative mx-auto max-w-8xl py-2">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-12 lg:grid-cols-7">
            <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-4 col-span-full md:col-span-2">
              <div className="space-y-4 flex-1">
                <div className="items-center space-x-2 flex">
                  <div className="flex items-center gap-2 text-xl font-medium text-white">
                    <Image
                      src="/generated-logos/one-custom-song-rounder-logo-2-trimmed.png"
                      alt={t("title")}
                      width={2017}
                      height={337}
                      className="h-10 w-auto"
                    />
                  </div>
                </div>

                <p className="text-sm p4-4 md:pr-12">
                  {t.rich("tagLine", {
                    strong: (chunks: ReactNode) => (
                      <strong className="font-semibold text-white">
                        {chunks}
                      </strong>
                    ),
                    br: () => <br />,
                  })}
                </p>

                <div className="flex items-center gap-2">
                  {siteConfig.socialLinks?.github && (
                    <Link
                      href={siteConfig.socialLinks.github}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="GitHub"
                      title="View on GitHub"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <GithubIcon className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.twitter && (
                    <Link
                      href={siteConfig.socialLinks.twitter}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="Twitter"
                      title="View on Twitter"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <TwitterX className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.youtube && (
                    <Link
                      href={siteConfig.socialLinks.youtube}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="YouTube"
                      title="View on YouTube"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <Youtube className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.instagram && (
                    <Link
                      href={siteConfig.socialLinks.instagram}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="Instagram"
                      title="View on Instagram"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <InstagramIcon className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.tiktok && (
                    <Link
                      href={siteConfig.socialLinks.tiktok}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="TikTok"
                      title="View on TikTok"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <SiTiktok className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.discord && (
                    <Link
                      href={siteConfig.socialLinks.discord}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="Discord"
                      title="Join Discord"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <SiDiscord className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {siteConfig.socialLinks?.email && (
                    <Link
                      href={`mailto:${siteConfig.socialLinks.email}`}
                      prefetch={false}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      aria-label="Email"
                      title="Email"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/62 transition-colors hover:bg-white/8 hover:text-white"
                    >
                      <MailIcon className="w-4 h-4" />
                    </Link>
                  )}
                </div>

              </div>
            </div>

            {footerLinks.map((section) => {
              const isArticlesSection = section.title === "Articles";
              const linkClassName = cn(
                "text-white/62 transition-colors hover:text-white",
                isArticlesSection && "block max-w-sm line-clamp-2 leading-5"
              );

              return (
                <div
                  key={section.title}
                  className={cn("flex-1", isArticlesSection && "lg:col-span-2")}
                >
                  <div className="mb-4 text-lg font-semibold text-white">
                    {section.title}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.href.startsWith("/") && !link.useA ? (
                          <I18nLink
                            href={link.href}
                            title={link.name}
                            prefetch={false}
                            className={linkClassName}
                            target={link.target || ""}
                            rel={link.rel || ""}
                          >
                            {link.name}
                          </I18nLink>
                        ) : (
                          <Link
                            href={link.href}
                            title={link.name}
                            prefetch={false}
                            className={linkClassName}
                            target={link.target || ""}
                            rel={link.rel || ""}
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {messages.Footer.Newsletter && (
              <div className="w-full flex-1">
                <Newsletter
                  labels={{
                    defaultErrorMessage: tFooter(
                      "Newsletter.subscribe.defaultErrorMessage"
                    ),
                    description: tFooter("Newsletter.description"),
                    invalidEmail: tFooter("Newsletter.subscribe.invalidEmail"),
                    successMessage: tFooter(
                      "Newsletter.subscribe.successMessage"
                    ),
                    title: tFooter("Newsletter.title"),
                  }}
                  locale={locale}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-between border-t border-white/10 py-6 md:flex-row">
            <p className="text-sm text-white/52">
              {tFooter("Copyright", {
                year: new Date().getFullYear(),
                name: siteConfig.name,
              })}
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <I18nLink
                href="/about"
                title={tFooter("About")}
                prefetch={false}
                className="text-sm text-white/52 transition-colors hover:text-white"
              >
                {tFooter("About")}
              </I18nLink>
              <Link
                href="/privacy-policy"
                title={tFooter("PrivacyPolicy")}
                prefetch={false}
                className="text-sm text-white/52 transition-colors hover:text-white"
              >
                {tFooter("PrivacyPolicy")}
              </Link>
              <Link
                href="/terms-of-service"
                title={tFooter("TermsOfService")}
                prefetch={false}
                className="text-sm text-white/52 transition-colors hover:text-white"
              >
                {tFooter("TermsOfService")}
              </Link>
              <Link
                href="/refund-policy"
                title={tFooter("RefundPolicy")}
                prefetch={false}
                className="text-sm text-white/52 transition-colors hover:text-white"
              >
                {tFooter("RefundPolicy")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
